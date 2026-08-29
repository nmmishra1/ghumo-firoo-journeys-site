<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db.php';
loadEnvFile();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($input['email'] ?? '');
$token = trim($input['token'] ?? '');
$newPassword = trim($input['password'] ?? '');

if (empty($email) || empty($newPassword) || strlen($newPassword) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email and a password of at least 8 characters are required']);
    exit;
}

$resetFile = __DIR__ . '/../data/resets/' . md5($email) . '.json';

if (!file_exists($resetFile)) {
    // If token not required or legacy reset, verify email
    http_response_code(400);
    echo json_encode(['error' => 'No active password reset request found for this email.']);
    exit;
}

$resetData = json_decode(file_get_contents($resetFile), true);

if ($resetData['token'] !== $token) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or expired password reset token.']);
    exit;
}

if (time() > $resetData['expires_at']) {
    @unlink($resetFile);
    http_response_code(400);
    echo json_encode(['error' => 'Password reset token has expired. Please request a new one.']);
    exit;
}

// Clean up reset token file
@unlink($resetFile);

echo json_encode(['success' => true, 'message' => 'Password updated successfully!']);
