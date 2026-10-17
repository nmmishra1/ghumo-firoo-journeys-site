<?php
// get_contracts.php - Fetch active supplier contract rates for dynamic quoting lookup
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    
    // 1. Fetch Hotels and their Contracted Rates (Normalized + Legacy Fallbacks)
    $hotelRates = [];
    try {
        $stmt = $pdo->query("
            SELECT hcr.id, hc.hotel_id, h.name as hotel_name, h.city as city_name, h.state as state_name,
                   COALESCE(rc.room_type_name, 'Deluxe Room') as room_type,
                   COALESCE(NULLIF(hcr.selling_cost, 0), NULLIF(hcr.double_rate, 0), NULLIF(hcr.supplier_cost, 0), 4500) as rate_per_night,
                   COALESCE(NULLIF(hcr.supplier_cost, 0), ROUND(COALESCE(hcr.double_rate, 4500) * 0.82)) as net_supplier_rate,
                   COALESCE(hcr.meal_plan_id, 'CP') as meal_plan,
                   hc.season_name
            FROM hotel_contract_rates hcr
            JOIN hotel_contracts hc ON hcr.contract_id = hc.id
            JOIN hotels h ON hc.hotel_id = h.id
            LEFT JOIN room_categories rc ON hcr.room_category_id = rc.id
            WHERE hc.active_status = 1
            ORDER BY h.name ASC
        ");
        $hotelRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $hotelRates = [];
    }

    if (empty($hotelRates)) {
        try {
            $stmt = $pdo->query("
                SELECT hr.id, hr.hotel_id, COALESCE(h.name, h.hotel_name) as hotel_name,
                       h.city as city_name, hr.room_type, hr.rate_per_night,
                       ROUND(hr.rate_per_night * 0.82) as net_supplier_rate, hr.meal_plan
                FROM hotel_rates hr
                JOIN hotels h ON hr.hotel_id = h.id
                WHERE hr.is_active = 1
            ");
            $hotelRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e2) {
            try {
                $stmt = $pdo->query("
                    SELECT h.id, h.id as hotel_id, COALESCE(h.name, h.hotel_name) as hotel_name,
                           h.city as city_name, h.state as state_name, 'Deluxe Room' as room_type,
                           4500 as rate_per_night, 3700 as net_supplier_rate, 'CP (Breakfast)' as meal_plan
                    FROM hotels h
                    WHERE h.active_status = 1
                ");
                $hotelRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e3) {
                $hotelRates = [];
            }
        }
    }

    // 2. Fetch Sightseeing & Excursion Contracted Rates
    $excursionRates = [];
    try {
        $stmt = $pdo->query("
            SELECT id, COALESCE(sightseeing_name, name, title) as name,
                   COALESCE(city, destination, location, '') as city_name,
                   COALESCE(NULLIF(selling_price, 0), NULLIF(adult_rate, 0), NULLIF(entry_fee, 0), 1200) as adult_rate,
                   COALESCE(NULLIF(child_rate, 0), ROUND(COALESCE(adult_rate, 1200) * 0.5)) as child_rate,
                   COALESCE(NULLIF(supplier_cost, 0), ROUND(COALESCE(adult_rate, 1200) * 0.8)) as net_supplier_rate
            FROM sightseeings
        ");
        $excursionRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        try {
            $stmt = $pdo->query("
                SELECT id, excursion_name as name, '' as city_name, adult_rate, child_rate,
                       ROUND(adult_rate * 0.8) as net_supplier_rate
                FROM excursion_contracts
                WHERE valid_to >= CURDATE()
            ");
            $excursionRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e2) {
            try {
                $stmt = $pdo->query("
                    SELECT id, activity_name as name, COALESCE(city, destination, '') as city_name,
                           selling_cost as adult_rate, child_cost as child_rate,
                           COALESCE(supplier_cost, ROUND(selling_cost * 0.8)) as net_supplier_rate
                    FROM activities
                ");
                $excursionRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e3) {
                $excursionRates = [];
            }
        }
    }

    // 3. Fetch Transfer / Cab Contracted Rates
    $transferRates = [];
    try {
        $stmt = $pdo->query("
            SELECT cr.id,
                   CONCAT(COALESCE(v.vehicle_name, 'Private Cab'), ' (', COALESCE(v.vehicle_type, 'SUV/Sedan'), ')') as vehicle_type,
                   COALESCE(v.seating_capacity, 4) as capacity,
                   COALESCE(NULLIF(cr.daily_rate, 0), NULLIF(cr.base_cost, 0), NULLIF(cr.vehicle_cost, 0), 3500) as rate,
                   COALESCE(NULLIF(cr.vehicle_cost, 0), ROUND(COALESCE(cr.daily_rate, 3500) * 0.82)) as net_supplier_rate,
                   COALESCE(r.source, '') as source,
                   COALESCE(r.destination, '') as destination,
                   COALESCE(r.state, '') as state_name
            FROM cab_contract_rates cr
            LEFT JOIN cab_vehicles v ON cr.vehicle_id = v.id
            LEFT JOIN cab_routes r ON cr.route_id = r.id
            WHERE cr.active_status = 1
            ORDER BY cr.id ASC
        ");
        $transferRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $transferRates = [];
    }

    if (empty($transferRates)) {
        try {
            $stmt = $pdo->query("
                SELECT id, vehicle_type, capacity, rate, ROUND(rate * 0.82) as net_supplier_rate,
                       '' as source, '' as destination
                FROM transfer_contracts
                WHERE valid_to >= CURDATE()
            ");
            $transferRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e2) {
            try {
                $stmt = $pdo->query("
                    SELECT id, vehicle_type, 4 as capacity, rate, ROUND(rate * 0.82) as net_supplier_rate,
                           '' as source, '' as destination
                    FROM cab_rates
                ");
                $transferRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e3) {
                $transferRates = [];
            }
        }
    }

    echo json_encode([
        'success' => true,
        'hotels' => $hotelRates,
        'excursions' => $excursionRates,
        'transfers' => $transferRates
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch contracts: ' . $e->getMessage()]);
}

