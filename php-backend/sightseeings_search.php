<?php
// sightseeings_search.php — filtered sightseeing search by destination.
header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$dest = $_GET['destination'] ?? '';
$cityId = isset($_GET['city_id']) && is_numeric($_GET['city_id']) ? (int)$_GET['city_id'] : 0;

try {
    $sql = "
        SELECT s.*, 
          COALESCE(ar.adult_rate, s.adult_cost, 0) as default_adult_rate,
          COALESCE(ar.child_rate, s.child_cost, 0) as default_child_rate
        FROM sightseeings s
        LEFT JOIN activity_rates ar ON ar.activity_id = s.id AND ar.is_active = 1
        LEFT JOIN cities c ON LOWER(c.name) = LOWER(s.destination)
        WHERE 1=1
    ";

    $params = [];
    if ($cityId > 0) {
        $sql .= " AND (s.city_id = ? OR c.id = ?)";
        $params[] = $cityId;
        $params[] = $cityId;
    } elseif (!empty($dest)) {
        $sql .= " AND s.destination LIKE ?";
        $params[] = "%$dest%";
    }

    $sql .= " ORDER BY s.destination ASC, s.sightseeing_name ASC";


    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $sightseeings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'sightseeings' => $sightseeings]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to search sightseeings: ' . $e->getMessage()]);
}
