<?php
// cities_search.php — Server-side dynamic state/city search endpoint
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/db.php';
    $pdo = getDb();

    $countryId = isset($_GET['country_id']) && $_GET['country_id'] !== 'all' ? $_GET['country_id'] : null;
    $stateId   = isset($_GET['state_id']) && $_GET['state_id'] !== 'all' ? $_GET['state_id'] : null;
    $search    = trim($_GET['search'] ?? '');

    // Fetch States if requested
    $states = [];
    if (isset($_GET['fetch_states'])) {
        if ($countryId) {
            $sStmt = $pdo->prepare("SELECT id, state_name, country_id FROM states WHERE active_status = 1 AND (country_id = ? OR LOWER(country) = LOWER(?)) ORDER BY state_name ASC");
            $sStmt->execute([$countryId, $countryId]);
        } else {
            $sStmt = $pdo->query("SELECT id, state_name, country_id FROM states WHERE active_status = 1 ORDER BY state_name ASC LIMIT 200");
        }
        $states = $sStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch Cities
    $where = [];
    $params = [];

    if ($stateId) {
        $where[] = "(c.state_id = ? OR LOWER(c.state) = LOWER(?))";
        $params[] = $stateId;
        $params[] = $stateId;
    }
    if ($search) {
        $where[] = "LOWER(c.city_name) LIKE LOWER(?)";
        $params[] = '%' . $search . '%';
    }

    $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    $limit = !empty($search) ? 50 : 200;

    $cStmt = $pdo->prepare("SELECT c.id, c.city_name, c.state_id, c.state FROM cities c $whereSQL ORDER BY c.city_name ASC LIMIT $limit");
    $cStmt->execute($params);
    $cities = $cStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'states' => $states,
        'cities' => $cities
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
