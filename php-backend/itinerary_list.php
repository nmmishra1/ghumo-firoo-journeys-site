<?php
// itinerary_list.php — returns all itinerary versions for a lead.
header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$leadId = $_GET['lead_id'] ?? '';
if (empty($leadId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Lead ID is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT id, itinerary_name, status, final_cost, cost_per_person, total_nights, created_at 
        FROM itineraries 
        WHERE lead_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$leadId]);
    $itineraries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'itineraries' => $itineraries]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch itineraries: ' . $e->getMessage()]);
}
