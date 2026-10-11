<?php
// hotel_bootstrap.php — Consolidated endpoint for Hotel Contracting Management
// Uses HotelService to ensure uniform column handling across states, cities, countries.

header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/db.php';
    require_once __DIR__ . '/api/hotels/HotelService.php';

    $pdo = getDb();
    $service = new HotelService($pdo);
    $data = $service->getBootstrapData();

    echo json_encode($data);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to bootstrap hotel metadata: ' . $e->getMessage()
    ]);
}
