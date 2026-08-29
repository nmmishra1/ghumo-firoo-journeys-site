<?php
error_reporting(0);
ini_set('display_errors', 0);
// itineraries_list.php — handles itinerary listing from MySQL.
// Requires a valid Supabase session JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

try {
    $stmt = $pdo->query("SELECT id, itinerary_code, itinerary_name AS package_name, status, customer_name, customer_email, destinations, travel_start_date, travel_end_date, final_cost, pricing_flagged, lead_id, created_at FROM itineraries ORDER BY created_at DESC");
    $itineraries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'itineraries' => $itineraries]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch itineraries: ' . $e->getMessage()]);
}
