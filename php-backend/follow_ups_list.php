<?php
// follow_ups_list.php — lists all follow-up logs for a specific lead.
// Requires a valid Supabase session JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent', 'user']);

$leadId = isset($_GET['lead_id']) ? (int)$_GET['lead_id'] : 0;
if ($leadId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid lead_id parameter is required']);
    exit;
}

try {
    // Check if the user has access to view this lead
    $leadStmt = $pdo->prepare('SELECT assigned_to, created_by FROM leads WHERE id = ? AND is_deleted = 0');
    $leadStmt->execute([$leadId]);
    $lead = $leadStmt->fetch();
    
    if (!$lead) {
        http_response_code(404);
        echo json_encode(['error' => 'Lead not found']);
        exit;
    }

    if ($profile['role'] === 'agent' || $profile['role'] === 'user') {
        if ($lead['assigned_to'] !== $profile['id'] && $lead['created_by'] !== $profile['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'You do not have permission to view follow-ups for this lead']);
            exit;
        }
    }

    $stmt = $pdo->prepare('SELECT * FROM follow_ups WHERE lead_id = ? ORDER BY follow_up_date DESC');
    $stmt->execute([$leadId]);
    $followUps = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'follow_ups' => $followUps]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch follow-ups: ' . $e->getMessage()]);
}
