<?php
// get_india_tourism.php - Serve India Tourism Explorer database query calls
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
    
    $action = $_GET['action'] ?? 'baseline';
    $stateId = $_GET['state_id'] ?? '';
    $cityId = $_GET['city_id'] ?? '';
    $search = $_GET['search'] ?? '';

    // ==========================================
    // ACTION: baseline - Returns all states and cities with counts
    // ==========================================
    if ($action === 'baseline') {
        // Fetch all states with city counts
        $stmt = $pdo->query("
            SELECT s.id, s.name, s.region, 
                   COUNT(DISTINCT c.id) as city_count,
                   (SELECT COUNT(*) FROM india_sightseeing sg JOIN india_cities ct ON sg.city_id = ct.id WHERE ct.state_id = s.id) as sightseeing_count,
                   (SELECT COUNT(*) FROM india_activities ac JOIN india_cities ct ON ac.city_id = ct.id WHERE ct.state_id = s.id) as activity_count
            FROM india_states s
            LEFT JOIN india_cities c ON c.state_id = s.id
            GROUP BY s.id
            ORDER BY s.name ASC
        ");
        $states = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch all cities with parent state name and rates counts
        $stmt2 = $pdo->query("
            SELECT c.*, s.name as state_name,
                   (SELECT COUNT(*) FROM india_sightseeing WHERE city_id = c.id) as sightseeing_count,
                   (SELECT COUNT(*) FROM india_activities WHERE city_id = c.id) as activity_count
            FROM india_cities c
            JOIN india_states s ON c.state_id = s.id
            ORDER BY c.name ASC
        ");
        $cities = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'states' => $states,
            'cities' => $cities
        ]);
        exit;
    }

    // ==========================================
    // ACTION: details - Returns detailed sightseeing and activities for a city
    // ==========================================
    if ($action === 'details') {
        if (empty($cityId)) {
            http_response_code(400);
            echo json_encode(['error' => 'city_id is required']);
            exit;
        }

        // Fetch city details
        $stmt = $pdo->prepare("SELECT c.*, s.name as state_name FROM india_cities c JOIN india_states s ON c.state_id = s.id WHERE c.id = ?");
        $stmt->execute([$cityId]);
        $city = $stmt->fetch(PDO::FETCH_ASSOC);

        // Fetch sightseeing
        $stmt2 = $pdo->prepare("SELECT * FROM india_sightseeing WHERE city_id = ? ORDER BY name ASC");
        $stmt2->execute([$cityId]);
        $sightseeing = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        // Fetch activities
        $stmt3 = $pdo->prepare("SELECT * FROM india_activities WHERE city_id = ? ORDER BY name ASC");
        $stmt3->execute([$cityId]);
        $activities = $stmt3->fetchAll(PDO::FETCH_ASSOC);

        // Fetch hotels
        $stmt4 = $pdo->prepare("
            SELECT h.id, h.hotel_name AS name, h.star_rating AS star_category, hc.room_type, hc.meal_plan, hc.contract_rate 
            FROM hotels h
            LEFT JOIN hotel_contracts hc ON hc.hotel_id = h.id
            WHERE h.city_id = ? AND h.active = 1
            ORDER BY h.star_rating DESC, h.hotel_name ASC
        ");
        $stmt4->execute([$cityId]);
        $hotels = $stmt4->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'city' => $city,
            'sightseeing' => $sightseeing,
            'activities' => $activities,
            'hotels' => $hotels
        ]);
        exit;
    }

    // ==========================================
    // ACTION: search - Search sightseeing and activities globally
    // ==========================================
    if ($action === 'search') {
        if (empty($search)) {
            echo json_encode([
                'success' => true,
                'sightseeing' => [],
                'activities' => []
            ]);
            exit;
        }

        $term = "%$search%";

        // Search in sightseeing joining city and state
        $stmt = $pdo->prepare("
            SELECT sg.*, c.name as city_name, s.name as state_name 
            FROM india_sightseeing sg
            JOIN india_cities c ON sg.city_id = c.id
            JOIN india_states s ON c.state_id = s.id
            WHERE sg.name LIKE ? OR sg.description LIKE ? OR c.name LIKE ? OR s.name LIKE ?
            ORDER BY sg.name ASC LIMIT 50
        ");
        $stmt->execute([$term, $term, $term, $term]);
        $sightseeing = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Search in activities joining city and state
        $stmt2 = $pdo->prepare("
            SELECT ac.*, c.name as city_name, s.name as state_name 
            FROM india_activities ac
            JOIN india_cities c ON ac.city_id = c.id
            JOIN india_states s ON c.state_id = s.id
            WHERE ac.name LIKE ? OR ac.description LIKE ? OR c.name LIKE ? OR s.name LIKE ?
            ORDER BY ac.name ASC LIMIT 50
        ");
        $stmt2->execute([$term, $term, $term, $term]);
        $activities = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'sightseeing' => $sightseeing,
            'activities' => $activities
        ]);
        exit;
    }

    // ==========================================
    // ACTION: ai_context - Structured destination data for LLM itinerary generation
    // ==========================================
    if ($action === 'ai_context') {
        $dest = trim($_GET['destination'] ?? $_GET['search'] ?? '');
        if (empty($dest)) {
            http_response_code(400);
            echo json_encode(['error' => 'destination or search parameter is required']);
            exit;
        }

        $term = "%$dest%";

        // Find matching cities
        $cStmt = $pdo->prepare("
            SELECT c.id, c.name, c.state_id, s.name as state_name 
            FROM india_cities c
            JOIN india_states s ON c.state_id = s.id
            WHERE c.name LIKE ? OR s.name LIKE ? OR s.region LIKE ?
            ORDER BY c.name ASC
        ");
        $cStmt->execute([$term, $term, $term]);
        $matchingCities = $cStmt->fetchAll(PDO::FETCH_ASSOC);
        $cityIds = array_column($matchingCities, 'id');

        $sightseeing = [];
        $activities = [];
        $hotels = [];

        if (!empty($cityIds)) {
            $inClause = implode(',', array_fill(0, count($cityIds), '?'));

            // Sightseeing
            $sgStmt = $pdo->prepare("SELECT sg.name, sg.description, sg.category, sg.entry_fee_estimate, sg.recommended_duration_hours, c.name as city FROM india_sightseeing sg JOIN india_cities c ON sg.city_id = c.id WHERE sg.city_id IN ($inClause) ORDER BY sg.name ASC LIMIT 30");
            $sgStmt->execute($cityIds);
            $sightseeing = $sgStmt->fetchAll(PDO::FETCH_ASSOC);

            // Activities
            $acStmt = $pdo->prepare("SELECT ac.name, ac.description, ac.category, ac.average_cost, ac.duration_hours, c.name as city FROM india_activities ac JOIN india_cities c ON ac.city_id = c.id WHERE ac.city_id IN ($inClause) ORDER BY ac.name ASC LIMIT 30");
            $acStmt->execute($cityIds);
            $activities = $acStmt->fetchAll(PDO::FETCH_ASSOC);

            // Hotels
            $hStmt = $pdo->prepare("SELECT h.hotel_name, h.star_rating, h.address, c.city_name as city FROM hotels h LEFT JOIN cities c ON h.city_id = c.id WHERE h.city_id IN ($inClause) AND h.active_status = 1 ORDER BY h.star_rating DESC LIMIT 20");
            $hStmt->execute($cityIds);
            $hotels = $hStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode([
            'success' => true,
            'destination' => $dest,
            'matched_cities' => array_column($matchingCities, 'name'),
            'sightseeing_spots' => $sightseeing,
            'activities' => $activities,
            'contracted_hotels' => $hotels
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to query database: ' . $e->getMessage()]);
}
