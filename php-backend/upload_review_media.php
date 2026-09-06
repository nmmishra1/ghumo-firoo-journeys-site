<?php
// upload_review_media.php — Public review media upload endpoint
// Saves customer review photos and videos to /uploads/reviews/ on the server filesystem.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $uploadRoot = (realpath(__DIR__ . '/..') ?: (__DIR__ . '/..')) . '/uploads/reviews';
    $urlPrefix  = '/uploads/reviews';
    $maxBytes   = 25 * 1024 * 1024; // 25 MB max (allows short trip videos and high-res photos)
    $allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'];

    if (!is_dir($uploadRoot)) {
        if (!mkdir($uploadRoot, 0755, true)) {
            throw new Exception('Could not create upload directory');
        }
        $htaccess = $uploadRoot . '/.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess, "Options -Indexes\n<FilesMatch \"\\.php$\">\n  Require all denied\n</FilesMatch>\n");
        }
    }

    if (empty($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        exit;
    }

    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Upload failed with error code: ' . $file['error']]);
        exit;
    }

    if ($file['size'] > $maxBytes) {
        http_response_code(413);
        echo json_encode(['error' => 'File exceeds maximum 25 MB limit']);
        exit;
    }

    $origName = $file['name'];
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

    if (!in_array($ext, $allowedExt, true)) {
        http_response_code(415);
        echo json_encode(['error' => 'Disallowed file extension. Supported: ' . implode(', ', $allowedExt)]);
        exit;
    }

    $safeFilename = 'rev_' . bin2hex(random_bytes(10)) . '_' . time() . '.' . $ext;
    $destPath = $uploadRoot . '/' . $safeFilename;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        throw new Exception('Failed to save file to server storage');
    }

    $publicUrl = $urlPrefix . '/' . $safeFilename;

    echo json_encode([
        'success' => true,
        'url'     => $publicUrl,
        'filename'=> $safeFilename,
        'size'    => $file['size']
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
