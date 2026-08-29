<?php
// seed_all_hotels_combined.php — Seeds ALL 500+ hotels from massive lists, contractedHotels.json, and registry into MySQL DB
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();

    // 1. Clear existing hotels, contracts, and rates to ensure a clean combined database
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE hotel_contracts;");
    $pdo->exec("TRUNCATE TABLE hotel_rates;");
    $pdo->exec("TRUNCATE TABLE hotels;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    $seenNames = [];
    $totalHotelsSeeded = 0;

    // Helper to resolve city & state IDs/names defensively
    $resolveGeo = function($cityName, $stateName = null) use ($pdo) {
        $cityName = trim($cityName);
        $stmt = $pdo->prepare("SELECT c.id as city_id, c.city_name, s.id as state_id, s.state_name FROM cities c LEFT JOIN states s ON c.state_id = s.id WHERE c.city_name LIKE ? OR c.name LIKE ?");
        $stmt->execute(["%$cityName%", "%$cityName%"]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return $row;
        }

        // Search in india_cities table if available
        try {
            $stmt2 = $pdo->prepare("SELECT id, name FROM india_cities WHERE name LIKE ?");
            $stmt2->execute(["%$cityName%"]);
            $r2 = $stmt2->fetch(PDO::FETCH_ASSOC);
            if ($r2) {
                return ['city_id' => $r2['id'], 'city_name' => $r2['name'], 'state_id' => null, 'state_name' => $stateName ?: 'India'];
            }
        } catch (Throwable $e) {}

        return ['city_id' => null, 'city_name' => $cityName, 'state_id' => null, 'state_name' => $stateName ?: 'India'];
    };

    // PART A: Seed 290 Famous Hotels from seed_hotels_india_massive.php structure
    $cityHotelsMap = [
        1 => 'Visakhapatnam', 2 => 'Tirupati', 3 => 'Araku Valley', 4 => 'Tawang', 5 => 'Ziro Valley',
        6 => 'Guwahati', 7 => 'Kaziranga', 8 => 'Majuli', 9 => 'Gaya', 10 => 'Patna', 11 => 'Nalanda',
        12 => 'Jagdalpur', 13 => 'Raipur', 14 => 'North Goa', 15 => 'South Goa', 16 => 'Ahmedabad',
        17 => 'Rann of Kutch', 18 => 'Dwarka', 19 => 'Gir National Park', 20 => 'Gurgaon', 21 => 'Kurukshetra',
        22 => 'Shimla', 23 => 'Manali', 24 => 'Dharamshala', 25 => 'Dalhousie', 26 => 'Ranchi', 27 => 'Netarhat',
        28 => 'Bangalore', 29 => 'Hampi', 30 => 'Mysore', 31 => 'Coorg', 32 => 'Gokarna', 33 => 'Cochin',
        34 => 'Munnar', 35 => 'Alleppey', 36 => 'Wayanad', 37 => 'Kovalam', 38 => 'Bhopal', 39 => 'Indore',
        40 => 'Khajuraho', 41 => 'Kanha National Park', 42 => 'Mumbai', 43 => 'Pune', 44 => 'Mahabaleshwar',
        45 => 'Aurangabad', 46 => 'Lonavala', 47 => 'Imphal', 48 => 'Loktak Lake', 49 => 'Shillong',
        50 => 'Cherrapunji', 51 => 'Mawlynnong', 52 => 'Aizawl', 53 => 'Kohima', 54 => 'Bhubaneswar',
        55 => 'Puri', 56 => 'Konark', 57 => 'Amritsar', 58 => 'Chandigarh', 59 => 'Jaipur', 60 => 'Udaipur',
        61 => 'Jodhpur', 62 => 'Jaisalmer', 63 => 'Pushkar', 64 => 'Mount Abu', 65 => 'Gangtok', 66 => 'Pelling',
        67 => 'Chennai', 68 => 'Ooty', 69 => 'Kodaikanal', 70 => 'Madurai', 71 => 'Rameshwaram', 72 => 'Mahabalipuram',
        73 => 'Hyderabad', 74 => 'Warangal', 75 => 'Agartala', 76 => 'Agra', 77 => 'Varanasi', 78 => 'Lucknow',
        79 => 'Ayodhya', 80 => 'Dehradun', 81 => 'Haridwar', 82 => 'Rishikesh', 83 => 'Mussoorie', 84 => 'Nainital',
        85 => 'Kolkata', 86 => 'Darjeeling', 87 => 'Sundarbans', 88 => 'New Delhi', 89 => 'Srinagar', 90 => 'Gulmarg',
        91 => 'Pahalgam', 92 => 'Leh', 93 => 'Nubra Valley', 94 => 'Port Blair', 95 => 'Havelock Island', 96 => 'Pondicherry'
    ];

    // Re-run the 290 hotels generator logic
    ob_start();
    include __DIR__ . '/seed_hotels_india_massive.php';
    ob_end_clean();

    // Track existing hotel names in database
    $existing = $pdo->query("SELECT LOWER(TRIM(hotel_name)) as hname FROM hotels")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($existing as $exName) {
        $seenNames[$exName] = true;
    }

    // PART B: Load contractedHotels.json (176 hotels)
    $jsonPath = __DIR__ . '/contractedHotels.json';
    if (!file_exists($jsonPath)) {
        $jsonPath = __DIR__ . '/../src/data/contractedHotels.json';
    }

    if (file_exists($jsonPath)) {
        $jsonHotels = json_decode(file_get_contents($jsonPath), true) ?: [];
        foreach ($jsonHotels as $jh) {
            $hName = trim($jh['name'] ?? '');
            if (empty($hName)) continue;

            $normName = strtolower($hName);
            if (isset($seenNames[$normName])) continue; // avoid exact duplicate
            $seenNames[$normName] = true;

            $cityName = trim($jh['city'] ?? 'India');
            $geo = $resolveGeo($cityName);
            
            $starRating = 4;
            if (stripos($hName, 'resort') !== false || stripos($hName, 'palace') !== false || stripos($hName, 'taj') !== false || stripos($hName, 'leela') !== false || stripos($hName, 'oberoi') !== false) {
                $starRating = 5;
            } elseif (stripos($hName, 'homestay') !== false || stripos($hName, 'guest house') !== false || stripos($hName, 'lodge') !== false) {
                $starRating = 3;
            }

            $b2bCost = floatval($jh['b2b_cost'] ?? 4500);
            if ($b2bCost <= 0) $b2bCost = 4500;

            $hotelId = 'hot-' . uniqid() . '-' . rand(1000, 9999);
            $roomType = trim($jh['cat_or_room'] ?? 'Standard Deluxe Room');

            $stmt = $pdo->prepare("
                INSERT INTO hotels (id, hotel_name, city_id, city, state, country, star_rating, active_status) 
                VALUES (?, ?, ?, ?, ?, 'India', ?, 1)
            ");
            $stmt->execute([$hotelId, $hName, $geo['city_id'], $geo['city_name'], $geo['state_name'], $starRating]);

            $stmt2 = $pdo->prepare("
                INSERT INTO hotel_contracts (hotel_id, room_type, meal_plan, contract_rate, valid_from, valid_to, active_status)
                VALUES (?, ?, 'CP (Breakfast Incl)', ?, '2026-01-01', '2026-12-31', 1)
            ");
            $stmt2->execute([$hotelId, $roomType, $b2bCost]);

            $stmt3 = $pdo->prepare("
                INSERT INTO hotel_rates (hotel_id, room_type, meal_plan, season_start, season_end, rate_per_night, is_active)
                VALUES (?, ?, 'CP', '2026-01-01', '2026-12-31', ?, 1)
            ");
            $stmt3->execute([$hotelId, $roomType, $b2bCost]);
        }
    }

    // PART C: Load contractedHotelsMaster.ts (Char Dham, Rann Utsav & Destination Master)
    $tsPath = __DIR__ . '/../src/data/contractedHotelsMaster.ts';
    if (file_exists($tsPath)) {
        $tsContent = file_get_contents($tsPath);
        preg_match_all('/"name":\s*"([^"]+)",\s*"stars":\s*(\d+),\s*"defaultRoom":\s*"([^"]+)",\s*"cost_price":\s*(\d+)/s', $tsContent, $itemMatches, PREG_SET_ORDER);
        
        foreach ($itemMatches as $im) {
            $hName = trim($im[1]);
            $stars = (int)$im[2];
            $roomType = trim($im[3]);
            $costPrice = (float)$im[4];
            
            $normName = strtolower($hName);
            if (isset($seenNames[$normName])) continue;
            $seenNames[$normName] = true;

            $hotelId = 'hot-' . uniqid() . '-' . rand(1000, 9999);
            $geo = $resolveGeo('Uttarakhand');

            $stmt = $pdo->prepare("
                INSERT INTO hotels (id, hotel_name, city_id, city, state, country, star_rating, active_status) 
                VALUES (?, ?, ?, ?, 'Uttarakhand', 'India', ?, 1)
            ");
            $stmt->execute([$hotelId, $hName, $geo['city_id'], $geo['city_name'], $stars]);

            $stmt2 = $pdo->prepare("
                INSERT INTO hotel_contracts (hotel_id, room_type, meal_plan, contract_rate, valid_from, valid_to, active_status)
                VALUES (?, ?, 'CP (Breakfast Incl)', ?, '2026-01-01', '2026-12-31', 1)
            ");
            $stmt2->execute([$hotelId, $roomType, $costPrice]);

            $stmt3 = $pdo->prepare("
                INSERT INTO hotel_rates (hotel_id, room_type, meal_plan, season_start, season_end, rate_per_night, is_active)
                VALUES (?, ?, 'CP', '2026-01-01', '2026-12-31', ?, 1)
            ");
            $stmt3->execute([$hotelId, $roomType, $costPrice]);
        }
    }

    $finalCount = $pdo->query("SELECT COUNT(*) FROM hotels")->fetchColumn();
    $ratesCount = $pdo->query("SELECT COUNT(*) FROM hotel_rates")->fetchColumn();

    echo json_encode([
        'success' => true,
        'message' => "Successfully combined and seeded {$finalCount} total hotels and {$ratesCount} contract rate cards into the MySQL Database!",
        'total_hotels' => (int)$finalCount,
        'total_rates' => (int)$ratesCount
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to seed combined hotels: ' . $e->getMessage()]);
}
