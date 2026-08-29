<?php
// seed_chardham_kashmir.php — Seeder for Char Dham Yatra and Kashmir Contracting Data
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

try {
    $pdo = getDb();
    $sqlFile = __DIR__ . '/../../database/migrations/20260803_step2_seed_chardham_kashmir.sql';

    if (!file_exists($sqlFile)) {
        throw new Exception("SQL seed file not found: " . $sqlFile);
    }

    $sqlContent = file_get_contents($sqlFile);
    $pdo->exec($sqlContent);

    // Count seeded records
    $cityStmt = $pdo->query("SELECT COUNT(*) AS cnt FROM cities WHERE state IN ('Uttarakhand', 'Jammu & Kashmir')");
    $cityCount = $cityStmt->fetch(PDO::FETCH_ASSOC)['cnt'] ?? 0;

    $hotelStmt = $pdo->query("SELECT COUNT(*) AS cnt FROM hotels h JOIN cities c ON h.city_id = c.id WHERE c.state IN ('Uttarakhand', 'Jammu & Kashmir')");
    $hotelCount = $hotelStmt->fetch(PDO::FETCH_ASSOC)['cnt'] ?? 0;

    $cabStmt = $pdo->query("SELECT COUNT(*) AS cnt FROM cab_vendors v JOIN cities c ON v.city_id = c.id WHERE c.state IN ('Uttarakhand', 'Jammu & Kashmir')");
    $cabCount = $cabStmt->fetch(PDO::FETCH_ASSOC)['cnt'] ?? 0;

    $sightseeingStmt = $pdo->query("SELECT COUNT(*) AS cnt FROM sightseeings s JOIN cities c ON s.city_id = c.id WHERE c.state IN ('Uttarakhand', 'Jammu & Kashmir')");
    $sightseeingCount = $sightseeingStmt->fetch(PDO::FETCH_ASSOC)['cnt'] ?? 0;

    echo json_encode([
        'success' => true,
        'message' => 'Char Dham & Kashmir contracting data seeded successfully',
        'counts'  => [
            'cities'       => (int)$cityCount,
            'hotels'       => (int)$hotelCount,
            'cab_vendors'  => (int)$cabCount,
            'sightseeings' => (int)$sightseeingCount
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Failed to seed contracting data: ' . $e->getMessage()
    ]);
}
