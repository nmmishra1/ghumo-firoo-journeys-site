<?php
// hotel_bootstrap.php — Consolidated endpoint for Hotel Contracting Management
// Returns countries, states, cities, meal_plans, suppliers, and hotels in a single network roundtrip.

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/db.php';
    $pdo = getDb();

    // 1. Countries
    $cStmt = $pdo->query("SELECT * FROM countries WHERE active_status = 1 ORDER BY country_name ASC");
    $countries = $cStmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. States
    $sStmt = $pdo->query("SELECT * FROM states WHERE active_status = 1 ORDER BY state_name ASC");
    $states = $sStmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Cities
    $cityStmt = $pdo->query("SELECT * FROM cities ORDER BY city_name ASC");
    $cities = $cityStmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Meal Plans
    $mpStmt = $pdo->query("SELECT * FROM meal_plans ORDER BY id ASC");
    $mealPlans = $mpStmt->fetchAll(PDO::FETCH_ASSOC);

    // 5. Hotel Suppliers
    $supStmt = $pdo->query("SELECT * FROM hotel_suppliers WHERE active_status = 1 ORDER BY supplier_name ASC");
    $suppliers = $supStmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. Hotels
    $hStmt = $pdo->query("
        SELECT h.*, c.city_name as city, s.state_name as state, co.country_name as country
        FROM hotels h
        LEFT JOIN cities c ON h.city_id = c.id
        LEFT JOIN states s ON h.state_id = s.id
        LEFT JOIN countries co ON h.country_id = co.id
        ORDER BY h.hotel_name ASC
    ");
    $hotels = $hStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($hotels as &$h) {
        if (!empty($h['meal_plan_supported'])) {
            if (is_string($h['meal_plan_supported'])) {
                $decoded = json_decode($h['meal_plan_supported'], true);
                if (is_array($decoded)) {
                    $h['meal_plan_supported'] = $decoded;
                } else {
                    $h['meal_plan_supported'] = array_map('trim', explode(',', $h['meal_plan_supported']));
                }
            }
        } else {
            $h['meal_plan_supported'] = [];
        }
    }

    echo json_encode([
        'success' => true,
        'countries' => $countries ?: [],
        'states' => $states ?: [],
        'cities' => $cities ?: [],
        'meal_plans' => $mealPlans ?: [],
        'suppliers' => $suppliers ?: [],
        'hotels' => $hotels ?: []
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to bootstrap hotel metadata: ' . $e->getMessage()
    ]);
}
