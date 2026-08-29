<?php
// cab_routes_search.php — filtered cab routes search by destination.
header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$dest = $_GET['destination'] ?? '';

try {
    $sql = "SELECT * FROM cab_routes WHERE active_status = 1";
    $params = [];
    if (!empty($dest)) {
        $sql .= " AND (source LIKE ? OR destination LIKE ? OR state LIKE ?)";
        $wildcard = "%$dest%";
        $params = [$wildcard, $wildcard, $wildcard];
    }
    $sql .= " ORDER BY destination ASC, source ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'routes' => $routes]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to search cab routes: ' . $e->getMessage()]);
}
