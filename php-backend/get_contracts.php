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
    
    // 1. Fetch Hotels and their Rates
    $hotelRates = [];
    try {
        $stmt = $pdo->query("
            SELECT hr.id, hr.hotel_id, h.hotel_name, hr.room_type, hr.rate_per_night, hr.meal_plan 
            FROM hotel_rates hr
            JOIN hotels h ON hr.hotel_id = h.id
            WHERE hr.is_active = 1
        ");
        $hotelRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        // Fallback: check new hotel_contracts table
        try {
            $stmt = $pdo->query("
                SELECT hc.id, h.hotel_name, c.name as city_name, hc.room_type, hc.contract_rate as rate_per_night, hc.meal_plan
                FROM hotel_contracts hc
                JOIN hotels h ON hc.hotel_id = h.id
                LEFT JOIN cities c ON h.city_id = c.id
                WHERE hc.valid_to >= CURDATE()
            ");
            $hotelRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e2) {
            $hotelRates = [];
        }
    }

    // 2. Fetch Excursion Rates
    $excursionRates = [];
    try {
        $stmt = $pdo->query("
            SELECT id, excursion_name as name, adult_rate, child_rate 
            FROM excursion_contracts 
            WHERE valid_to >= CURDATE()
        ");
        $excursionRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        // Fallback: check legacy activities table
        try {
            $stmt = $pdo->query("SELECT id, activity_name as name, selling_cost as adult_rate, child_cost as child_rate FROM activities");
            $excursionRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e2) {
            $excursionRates = [];
        }
    }

    // 3. Fetch Transfer/Cab Rates
    $transferRates = [];
    try {
        $stmt = $pdo->query("
            SELECT id, vehicle_type, capacity, rate 
            FROM transfer_contracts
            WHERE valid_to >= CURDATE()
        ");
        $transferRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        // Fallback: check legacy cab_rates table
        try {
            $stmt = $pdo->query("SELECT id, vehicle_type, 4 as capacity, rate FROM cab_rates");
            $transferRates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e2) {
            $transferRates = [];
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
