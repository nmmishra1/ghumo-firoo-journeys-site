<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    $stmt = $pdo->query("
        SELECT state_id, COUNT(*) as city_count 
        FROM cities 
        WHERE state_id IS NOT NULL AND state_id > 0 
        GROUP BY state_id
    ");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $counts = [];
    foreach ($rows as $row) {
        $counts[(string)$row['state_id']] = (int)$row['city_count'];
    }
    
    echo json_encode(['success' => true, 'counts' => $counts]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage(), 'counts' => (object)[]]);
}
