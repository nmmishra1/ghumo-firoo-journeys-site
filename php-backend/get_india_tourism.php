<?php
// get_india_tourism.php - Serve India Tourism Explorer database query calls dynamically synced with CRM
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
    // ACTION: baseline - Returns all states and cities with live counts
    // ==========================================
    if ($action === 'baseline') {
        // Fetch states from primary `states` table (India is country_id = 1 or states under India)
        $states = [];
        try {
            $stmt = $pdo->query("
                SELECT s.id, s.state_name as name, s.state_name, 
                       CASE 
                           WHEN s.state_name IN ('Himachal Pradesh', 'Uttarakhand', 'Jammu & Kashmir', 'Punjab', 'Haryana', 'Delhi', 'Uttar Pradesh', 'Ladakh') THEN 'North'
                           WHEN s.state_name IN ('Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana') THEN 'South'
                           WHEN s.state_name IN ('Rajasthan', 'Gujarat', 'Maharashtra', 'Goa') THEN 'West'
                           WHEN s.state_name IN ('Madhya Pradesh', 'Chhattisgarh') THEN 'Central'
                           WHEN s.state_name IN ('West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Sikkim', 'Assam', 'Meghalaya', 'Arunachal Pradesh') THEN 'East'
                           ELSE 'North'
                       END as region,
                       (SELECT COUNT(*) FROM cities c WHERE c.state_id = s.id AND (c.active_status = 1 OR c.active_status IS NULL)) as city_count,
                       (SELECT COUNT(*) FROM sightseeings sg WHERE sg.state_id = s.id) as sightseeing_count,
                       (SELECT COUNT(*) FROM activities ac WHERE ac.state_id = s.id) as activity_count
                FROM states s
                WHERE s.country_id = 1 OR s.country_id IS NULL
                ORDER BY s.state_name ASC
            ");
            $states = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            // Fallback to india_states if states table query fails
            $stmt = $pdo->query("SELECT * FROM india_states ORDER BY name ASC");
            $states = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        // Fetch cities from primary `cities` table
        $cities = [];
        try {
            $stmt2 = $pdo->query("
                SELECT c.id, c.city_name as name, c.city_name, c.state_id, c.destination_type,
                       s.state_name, s.state_name as state,
                       (SELECT COUNT(*) FROM sightseeings sg WHERE sg.city_id = c.id OR LOWER(TRIM(sg.destination)) = LOWER(TRIM(c.city_name))) as sightseeing_count,
                       (SELECT COUNT(*) FROM activities ac WHERE ac.city_id = c.id OR LOWER(TRIM(ac.destination)) = LOWER(TRIM(c.city_name))) as activity_count
                FROM cities c
                LEFT JOIN states s ON c.state_id = s.id
                WHERE (c.active_status = 1 OR c.active_status IS NULL) AND (c.country_id = 1 OR c.country_id IS NULL OR c.country_id = '')
                ORDER BY c.city_name ASC
            ");
            $cities = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            // Fallback to india_cities
            $stmt2 = $pdo->query("SELECT c.*, s.name as state_name FROM india_cities c JOIN india_states s ON c.state_id = s.id ORDER BY c.name ASC");
            $cities = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        }

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
        $city = null;
        try {
            $stmt = $pdo->prepare("SELECT c.*, c.city_name as name, s.state_name FROM cities c LEFT JOIN states s ON c.state_id = s.id WHERE c.id = ?");
            $stmt->execute([$cityId]);
            $city = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $stmt = $pdo->prepare("SELECT c.*, s.name as state_name FROM india_cities c JOIN india_states s ON c.state_id = s.id WHERE c.id = ?");
            $stmt->execute([$cityId]);
            $city = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        $cityName = $city['city_name'] ?? $city['name'] ?? '';

        // Fetch sightseeing from `sightseeings` table
        $sightseeing = [];
        try {
            $stmt2 = $pdo->prepare("
                SELECT id, sightseeing_name as name, sightseeing_name, duration, description, image_url,
                       adult_cost as entry_fee_estimate, adult_cost, child_cost, duration as recommended_duration_hours,
                       category
                FROM sightseeings 
                WHERE city_id = ? OR LOWER(TRIM(destination)) = LOWER(TRIM(?))
                ORDER BY sightseeing_name ASC
            ");
            $stmt2->execute([$cityId, $cityName]);
            $sightseeing = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $stmt2 = $pdo->prepare("SELECT * FROM india_sightseeing WHERE city_id = ? ORDER BY name ASC");
            $stmt2->execute([$cityId]);
            $sightseeing = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        }

        // Fetch activities from `activities` table
        $activities = [];
        try {
            $stmt3 = $pdo->prepare("
                SELECT id, activity_name as name, activity_name, duration, description, image_url,
                       adult_cost as average_cost, adult_cost, child_cost, duration as duration_hours,
                       activity_category as category
                FROM activities 
                WHERE city_id = ? OR LOWER(TRIM(destination)) = LOWER(TRIM(?))
                ORDER BY activity_name ASC
            ");
            $stmt3->execute([$cityId, $cityName]);
            $activities = $stmt3->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $stmt3 = $pdo->prepare("SELECT * FROM india_activities WHERE city_id = ? ORDER BY name ASC");
            $stmt3->execute([$cityId]);
            $activities = $stmt3->fetchAll(PDO::FETCH_ASSOC);
        }

        // Fetch hotels
        $hotels = [];
        try {
            $stmt4 = $pdo->prepare("
                SELECT h.id, h.hotel_name AS name, h.star_rating AS star_category, hc.room_type, hc.meal_plan, hc.contract_rate 
                FROM hotels h
                LEFT JOIN hotel_contracts hc ON hc.hotel_id = h.id
                WHERE (h.city_id = ? OR LOWER(TRIM(h.city)) = LOWER(TRIM(?))) AND (h.active_status = 1 OR h.active = 1)
                ORDER BY h.star_rating DESC, h.hotel_name ASC
            ");
            $stmt4->execute([$cityId, $cityName]);
            $hotels = $stmt4->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {}

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

        $sightseeing = [];
        try {
            $stmt = $pdo->prepare("
                SELECT sg.id, sg.sightseeing_name as name, sg.destination as city_name, s.state_name, sg.duration, sg.adult_cost as entry_fee_estimate
                FROM sightseeings sg
                LEFT JOIN states s ON sg.state_id = s.id
                WHERE sg.sightseeing_name LIKE ? OR sg.destination LIKE ? OR sg.description LIKE ?
                ORDER BY sg.sightseeing_name ASC LIMIT 50
            ");
            $stmt->execute([$term, $term, $term]);
            $sightseeing = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {}

        $activities = [];
        try {
            $stmt2 = $pdo->prepare("
                SELECT ac.id, ac.activity_name as name, ac.destination as city_name, s.state_name, ac.duration, ac.adult_cost as average_cost, ac.activity_category as category
                FROM activities ac
                LEFT JOIN states s ON ac.state_id = s.id
                WHERE ac.activity_name LIKE ? OR ac.destination LIKE ? OR ac.description LIKE ?
                ORDER BY ac.activity_name ASC LIMIT 50
            ");
            $stmt2->execute([$term, $term, $term]);
            $activities = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {}

        echo json_encode([
            'success' => true,
            'sightseeing' => $sightseeing,
            'activities' => $activities
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid action']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to query database: ' . $e->getMessage()]);
}
