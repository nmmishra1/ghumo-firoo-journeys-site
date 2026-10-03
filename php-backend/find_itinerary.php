<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    $stmt = $pdo->query("SELECT id, itinerary_code, lead_id, customer_name, destinations, travel_start_date, travel_end_date FROM itineraries ORDER BY id DESC LIMIT 10");
    $itins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'itineraries' => $itins]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
