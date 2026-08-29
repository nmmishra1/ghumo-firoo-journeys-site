<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/auth_middleware.php';
require_once __DIR__ . '/db.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$payload = json_decode(file_get_contents('php://input'), true);
if (empty($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty request body']);
    exit;
}

$leadId = $payload['lead_id'] ?? '';
$name = $payload['name'] ?? '';
$type = $payload['type'] ?? '';
$size = $payload['size'] ?? 0;
$uploadedBy = $payload['uploaded_by'] ?? '';
$fileBase64 = $payload['file_base64'] ?? '';

if (empty($leadId) || empty($name) || empty($type) || empty($size) || empty($uploadedBy) || empty($fileBase64)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    $uploadsDir = realpath(__DIR__ . '/..') . '/uploads';
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }
    
    // Clean up base64 prefix
    $base64Data = preg_replace('/^data:.*;base64,/', '', $fileBase64);
    $decodedData = base64_decode($base64Data);
    
    $fileExt = strtolower($type);
    $fileSuffix = (substr(strtolower($name), -strlen($fileExt) - 1) === '.' . $fileExt) ? '' : '.' . $fileExt;
    $fileName = time() . '-' . preg_replace('/[^a-zA-Z0-9_\.-]/', '', $name) . $fileSuffix;
    
    $filePath = $uploadsDir . '/' . $fileName;
    file_put_contents($filePath, $decodedData);
    
    $newId = 'doc-' . time() . '-' . rand(1000, 9999);
    $fileUrl = '/uploads/' . $fileName; // relative to domain root
    
    $stmt = $pdo->prepare("
        INSERT INTO documents (id, lead_id, name, type, size, uploaded_by, file_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$newId, $leadId, $name, $type, $size, $uploadedBy, $fileUrl]);
    
    echo json_encode([
        'success' => true,
        'id' => $newId,
        'file_url' => 'https://ghumofiroo.com' . $fileUrl
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to upload document: ' . $e->getMessage()]);
}
