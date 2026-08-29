<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/db.php';
$pdo = getDb();

$body = json_decode(file_get_contents('php://input'), true);

$user_email = $body['user_email'] ?? null;
$action = $body['action'] ?? 'Unknown Action';
$ip_address = $body['ip_address'] ?? $_SERVER['REMOTE_ADDR'] ?? null;
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
$user_id = $body['user_id'] ?? null;

try {
    $stmt = $pdo->prepare("INSERT INTO login_audit_logs (user_id, user_email, action, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $user_email, $action, $ip_address, $user_agent]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to save log', 'details' => $e->getMessage()]);
}
