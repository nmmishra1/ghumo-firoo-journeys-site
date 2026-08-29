<?php
header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$leadId = $_GET['id'] ?? '';
if (empty($leadId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Lead ID is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = ?");
    $stmt->execute([$leadId]);
    $lead = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($lead) {
        echo json_encode(['success' => true, 'lead' => $lead]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Lead not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
