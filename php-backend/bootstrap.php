<?php
// bootstrap.php — Lightweight global bootstrap metadata endpoint
// Serves static master lists (countries, meal_plans, suppliers) in ~3KB payload.

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/db.php';
    $pdo = getDb();

    // 1. Countries (Lightweight select)
    $cStmt = $pdo->query("SELECT id, country_name, country_code, active_status FROM countries WHERE active_status = 1 ORDER BY country_name ASC");
    $countries = $cStmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Meal Plans
    $mpStmt = $pdo->query("SELECT id, code, name FROM meal_plans ORDER BY id ASC");
    $mealPlans = $mpStmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Hotel Suppliers
    $supStmt = $pdo->query("SELECT id, supplier_name, supplier_type FROM hotel_suppliers WHERE active_status = 1 ORDER BY supplier_name ASC");
    $suppliers = $supStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'countries' => $countries ?: [],
        'meal_plans' => $mealPlans ?: [],
        'suppliers' => $suppliers ?: []
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load bootstrap metadata: ' . $e->getMessage()
    ]);
}
