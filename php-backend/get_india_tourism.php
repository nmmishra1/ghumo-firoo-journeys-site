<?php
// get_india_tourism.php - Serve India Tourism Explorer database query calls dynamically synced with CRM
header('Content-Type: application/json; charset=utf-8');
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
    $slug = trim($_GET['slug'] ?? $_GET['destination'] ?? $_GET['city'] ?? '');
    $search = $_GET['search'] ?? '';

    // ==========================================
    // ACTION: baseline - Returns all states and cities with live counts
    // ==========================================
    if ($action === 'baseline') {
        header('Cache-Control: public, max-age=3600, stale-while-revalidate=86400');
        
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
                       (SELECT COUNT(*) FROM cities c WHERE c.state_id = s.id AND (c.active_status = 1 OR c.active_status IS NULL) AND TRIM(COALESCE(c.city_name, c.name)) != '') as city_count,
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

        // Fetch cities from primary `cities` table, strictly excluding null/empty name records
        $cities = [];
        try {
            $stmt2 = $pdo->query("
                SELECT c.id, 
                       COALESCE(c.city_name, c.name) as name, 
                       COALESCE(c.city_name, c.name) as city_name, 
                       c.state_id, 
                       c.destination_type,
                       s.state_name, 
                       s.state_name as state,
                       (SELECT COUNT(*) FROM sightseeings sg WHERE sg.city_id = c.id OR (TRIM(COALESCE(c.city_name, c.name)) != '' AND LOWER(TRIM(sg.destination)) = LOWER(TRIM(COALESCE(c.city_name, c.name))))) as sightseeing_count,
                       (SELECT COUNT(*) FROM activities ac WHERE ac.city_id = c.id OR (TRIM(COALESCE(c.city_name, c.name)) != '' AND LOWER(TRIM(ac.destination)) = LOWER(TRIM(COALESCE(c.city_name, c.name))))) as activity_count
                FROM cities c
                LEFT JOIN states s ON c.state_id = s.id
                WHERE (c.active_status = 1 OR c.active_status IS NULL) 
                  AND (c.country_id = 1 OR c.country_id IS NULL OR c.country_id = '')
                  AND (c.city_name IS NOT NULL AND TRIM(c.city_name) != '' OR c.name IS NOT NULL AND TRIM(c.name) != '')
                ORDER BY COALESCE(c.city_name, c.name) ASC
            ");
            $cities = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            // Fallback to india_cities
            $stmt2 = $pdo->query("SELECT c.*, s.name as state_name FROM india_cities c JOIN india_states s ON c.state_id = s.id WHERE c.name IS NOT NULL AND TRIM(c.name) != '' ORDER BY c.name ASC");
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
    // ACTION: details / destination - Returns detailed sightseeing, activities, hotels & nearby cities
    // ==========================================
    if ($action === 'details' || $action === 'destination') {
        if (empty($cityId) && empty($slug)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'city_id or slug is required']);
            exit;
        }

        $city = null;
        
        // Try finding city by ID or Slug/Name
        try {
            if (!empty($cityId) && is_numeric($cityId)) {
                $stmt = $pdo->prepare("
                    SELECT c.*, 
                           COALESCE(c.city_name, c.name) as name, 
                           COALESCE(c.city_name, c.name) as city_name, 
                           s.state_name 
                    FROM cities c 
                    LEFT JOIN states s ON c.state_id = s.id 
                    WHERE c.id = ? AND (c.city_name IS NOT NULL AND TRIM(c.city_name) != '' OR c.name IS NOT NULL AND TRIM(c.name) != '')
                ");
                $stmt->execute([$cityId]);
                $city = $stmt->fetch(PDO::FETCH_ASSOC);
            }
            
            if (!$city && !empty($slug)) {
                $cleanSlug = strtolower(trim(str_replace(['/', '\\'], '', $slug)));
                $slugAsText = str_replace('-', ' ', $cleanSlug);
                $slugAlpha = preg_replace('/[^a-z0-9]/', '', $cleanSlug);

                // Look up by exact name, slug match, or alphanumeric inclusion
                $stmt = $pdo->prepare("
                    SELECT c.*, 
                           COALESCE(c.city_name, c.name) as name, 
                           COALESCE(c.city_name, c.name) as city_name, 
                           s.state_name 
                    FROM cities c 
                    LEFT JOIN states s ON c.state_id = s.id 
                    WHERE (c.active_status = 1 OR c.active_status IS NULL)
                      AND (c.city_name IS NOT NULL AND TRIM(c.city_name) != '' OR c.name IS NOT NULL AND TRIM(c.name) != '')
                      AND (
                          LOWER(TRIM(COALESCE(c.city_name, c.name))) = ?
                          OR LOWER(REPLACE(COALESCE(c.city_name, c.name), ' ', '-')) = ?
                          OR LOWER(TRIM(COALESCE(c.city_name, c.name))) LIKE ?
                          OR LOWER(REPLACE(REPLACE(REPLACE(COALESCE(c.city_name, c.name), ' ', ''), '-', ''), '(', '')) = ?
                      )
                    ORDER BY 
                      CASE 
                        WHEN LOWER(TRIM(COALESCE(c.city_name, c.name))) = ? THEN 1
                        WHEN LOWER(REPLACE(COALESCE(c.city_name, c.name), ' ', '-')) = ? THEN 2
                        ELSE 3
                      END ASC
                    LIMIT 1
                ");
                $stmt->execute([
                    $slugAsText,
                    $cleanSlug,
                    '%' . $slugAsText . '%',
                    $slugAlpha,
                    $slugAsText,
                    $cleanSlug
                ]);
                $city = $stmt->fetch(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {
            // Fallback table lookup
            try {
                if (!empty($cityId) && is_numeric($cityId)) {
                    $stmt = $pdo->prepare("SELECT c.*, s.name as state_name FROM india_cities c JOIN india_states s ON c.state_id = s.id WHERE c.id = ?");
                    $stmt->execute([$cityId]);
                    $city = $stmt->fetch(PDO::FETCH_ASSOC);
                }
            } catch (Exception $e2) {}
        }

        if (!$city) {
            http_response_code(404);
            echo json_encode([
                'success' => false, 
                'error' => 'Destination not found in live database',
                'slug' => $slug,
                'city_id' => $cityId
            ]);
            exit;
        }

        $cityName = trim($city['city_name'] ?? $city['name'] ?? '');
        $resolvedCityId = $city['id'];
        $stateId = $city['state_id'] ?? null;
        $stateName = $city['state_name'] ?? $city['state'] ?? '';

        // Fetch sightseeing from `sightseeings` table
        $sightseeing = [];
        try {
            $stmt2 = $pdo->prepare("
                SELECT id, sightseeing_name as name, sightseeing_name, duration, description, image_url,
                       adult_cost as entry_fee_estimate, adult_cost, child_cost, duration as recommended_duration_hours,
                       category
                FROM sightseeings 
                WHERE city_id = ? OR (? != '' AND LOWER(TRIM(destination)) = LOWER(TRIM(?)))
                ORDER BY sightseeing_name ASC
            ");
            $stmt2->execute([$resolvedCityId, $cityName, $cityName]);
            $sightseeing = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            try {
                $stmt2 = $pdo->prepare("SELECT * FROM india_sightseeing WHERE city_id = ? ORDER BY name ASC");
                $stmt2->execute([$resolvedCityId]);
                $sightseeing = $stmt2->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e2) {}
        }

        // Fetch activities from `activities` table
        $activities = [];
        try {
            $stmt3 = $pdo->prepare("
                SELECT id, activity_name as name, activity_name, duration, description, image_url,
                       adult_cost as average_cost, adult_cost, child_cost, duration as duration_hours,
                       activity_category as category
                FROM activities 
                WHERE city_id = ? OR (? != '' AND LOWER(TRIM(destination)) = LOWER(TRIM(?)))
                ORDER BY activity_name ASC
            ");
            $stmt3->execute([$resolvedCityId, $cityName, $cityName]);
            $activities = $stmt3->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            try {
                $stmt3 = $pdo->prepare("SELECT * FROM india_activities WHERE city_id = ? ORDER BY name ASC");
                $stmt3->execute([$resolvedCityId]);
                $activities = $stmt3->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e2) {}
        }

        // Fetch hotels
        $hotels = [];
        try {
            $stmt4 = $pdo->prepare("
                SELECT h.id, h.hotel_name AS name, h.star_rating AS star_category, hc.room_type, hc.meal_plan, hc.contract_rate 
                FROM hotels h
                LEFT JOIN hotel_contracts hc ON hc.hotel_id = h.id
                WHERE (h.city_id = ? OR (? != '' AND LOWER(TRIM(h.city)) = LOWER(TRIM(?)))) 
                  AND (h.active_status = 1 OR h.active = 1)
                ORDER BY h.star_rating DESC, h.hotel_name ASC
            ");
            $stmt4->execute([$resolvedCityId, $cityName, $cityName]);
            $hotels = $stmt4->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {}

        // Fetch nearby cities in the same state (compact payload for related destinations)
        $nearbyCities = [];
        try {
            if ($stateId || $stateName) {
                $stmt5 = $pdo->prepare("
                    SELECT c.id, 
                           COALESCE(c.city_name, c.name) as name, 
                           COALESCE(c.city_name, c.name) as city_name, 
                           c.destination_type, 
                           s.state_name, 
                           s.state_name as state
                    FROM cities c
                    LEFT JOIN states s ON c.state_id = s.id
                    WHERE c.id != ?
                      AND (c.state_id = ? OR (? != '' AND s.state_name = ?))
                      AND (c.active_status = 1 OR c.active_status IS NULL)
                      AND (c.city_name IS NOT NULL AND TRIM(c.city_name) != '' OR c.name IS NOT NULL AND TRIM(c.name) != '')
                    LIMIT 4
                ");
                $stmt5->execute([$resolvedCityId, $stateId, $stateName, $stateName]);
                $nearbyCities = $stmt5->fetchAll(PDO::FETCH_ASSOC);
            }
        } catch (Exception $e) {}

        header('Cache-Control: public, max-age=3600, stale-while-revalidate=86400');
        echo json_encode([
            'success' => true,
            'city' => $city,
            'sightseeing' => $sightseeing,
            'activities' => $activities,
            'hotels' => $hotels,
            'nearby_cities' => $nearbyCities
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

        header('Cache-Control: public, max-age=1800, stale-while-revalidate=86400');
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
