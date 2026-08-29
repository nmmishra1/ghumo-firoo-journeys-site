<?php
// upload.php — Local image upload endpoint for the hotel contracting wizard.
//
// Design contract (per crm_readiness_audit.md):
//  - Saves files to: /home3/a17511nd/ghumofiroo.com/public/uploads/hotels/
//  - Serves images at: https://ghumofiroo.com/uploads/hotels/<filename>
//  - Only writes the relative path string to the DB — never Base64.
//  - Validates via getimagesize() (MIME check) + extension whitelist.
//  - Randomises filename so original names never collide.
//  - Blocks directory listing via .htaccess (created alongside uploads/).
//
// Accepted methods:
//   POST multipart/form-data  — upload one file, returns { path, url }
//   DELETE ?path=...          — remove a previously uploaded file

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';

try {
    $pdo     = getDb();
    $user    = authenticate();
    $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

    // -----------------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------------
    // Absolute server path to the uploads root.
    $uploadRoot = (realpath(__DIR__ . '/..') ?: (__DIR__ . '/..')) . '/uploads/hotels';
    // Public URL prefix served by the web server
    $urlPrefix  = '/uploads/hotels';
    // Maximum allowed file size: 10 MB (allows brochures and high-res photos)
    $maxBytes   = 10 * 1024 * 1024;
    // Allowed image & document extensions (lower-cased)
    $allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];

    header('Content-Type: application/json');

    $method = $_SERVER['REQUEST_METHOD'];

// -----------------------------------------------------------------------
// Ensure the upload directory exists and is protected
// -----------------------------------------------------------------------
function ensureUploadDir(string $dir): void
{
    if (!is_dir($dir)) {
        if (!mkdir($dir, 0755, true)) {
            http_response_code(500);
            echo json_encode(['error' => 'Could not create upload directory']);
            exit;
        }
        // Write an .htaccess to block directory listing and direct PHP execution
        $htaccess = $dir . '/.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess,
                "Options -Indexes\n" .
                "<FilesMatch \"\\.php$\">\n" .
                "  Require all denied\n" .
                "</FilesMatch>\n"
            );
        }
    }
}

// -----------------------------------------------------------------------
// POST — receive the uploaded file
// -----------------------------------------------------------------------
if ($method === 'POST') {
    if (empty($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file field "file" in request']);
        exit;
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errMap = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds form MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE    => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION  => 'A PHP extension blocked the upload',
        ];
        http_response_code(400);
        echo json_encode(['error' => $errMap[$file['error']] ?? 'Upload error ' . $file['error']]);
        exit;
    }

    // Size check
    if ($file['size'] > $maxBytes) {
        http_response_code(413);
        echo json_encode(['error' => 'File too large (max 5 MB)']);
        exit;
    }

    // Extension whitelist (from original filename — untrusted but checked alongside MIME)
    $origName = $file['name'];
    $ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) {
        http_response_code(415);
        echo json_encode(['error' => 'File type not allowed. Use: ' . implode(', ', $allowedExt)]);
        exit;
    }

    $mime = $_FILES['file']['type'] ?? '';
    if ($ext === 'pdf') {
        if (!empty($mime) && strpos($mime, 'pdf') === false && strpos($mime, 'octet-stream') === false) {
            http_response_code(415);
            echo json_encode(['error' => 'Invalid PDF MIME type: ' . $mime]);
            exit;
        }
        $mime = 'application/pdf';
    } else {
        $imgInfo = @getimagesize($file['tmp_name']);
        if ($imgInfo === false) {
            http_response_code(415);
            echo json_encode(['error' => 'File does not appear to be a valid image']);
            exit;
        }
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($imgInfo['mime'], $allowedMimes, true)) {
            http_response_code(415);
            echo json_encode(['error' => 'Disallowed image MIME type: ' . $imgInfo['mime']]);
            exit;
        }
        $mime = $imgInfo['mime'];
    }

    // Build a safe random filename — no original name retained on disk
    $safeFilename = bin2hex(random_bytes(12)) . '.' . $ext;

    // Ensure directory exists (idempotent)
    ensureUploadDir($uploadRoot);

    $destPath = $uploadRoot . '/' . $safeFilename;
    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to move uploaded file to destination']);
        exit;
    }

    // Relative path that goes into hotel_images.image_url or hotels.featured_image_url
    $relativePath = '/uploads/hotels/' . $safeFilename;
    $publicUrl    = $urlPrefix . '/' . $safeFilename;

    echo json_encode([
        'success'  => true,
        'path'     => $relativePath,   // store this in DB
        'url'      => $publicUrl,      // use this in <img src>
        'filename' => $safeFilename,
        'size'     => $file['size'],
        'mime'     => $mime,
    ]);

// -----------------------------------------------------------------------
// DELETE — remove a previously uploaded file by relative path
// -----------------------------------------------------------------------
} elseif ($method === 'DELETE') {
    // Accepts ?path=/uploads/hotels/abc123.jpg or JSON body { path: "..." }
    $relPath = $_GET['path'] ?? null;
    if (!$relPath) {
        $body    = json_decode(file_get_contents('php://input'), true) ?? [];
        $relPath = $body['path'] ?? null;
    }

    if (!$relPath) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing path parameter']);
        exit;
    }

    // Security: path must start with /uploads/hotels/ and contain no traversal
    if (!preg_match('#^/uploads/hotels/[a-f0-9]{24}\.(jpg|jpeg|png|webp|gif|pdf)$#i', $relPath)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or disallowed path']);
        exit;
    }

    $absPath = (realpath(__DIR__ . '/..') ?: (__DIR__ . '/..')) . $relPath;
    if (file_exists($absPath)) {
        if (!unlink($absPath)) {
            http_response_code(500);
            echo json_encode(['error' => 'Could not delete file']);
            exit;
        }
    }
    // If file is already gone, return success (idempotent)
    echo json_encode(['success' => true]);

} elseif ($method === 'OPTIONS') {
    http_response_code(200);
    exit;

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
