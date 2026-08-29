<?php
// seed_contracts_mock.php - Seeds mock contract rates for hotels, excursions, and transfers with correct schemas
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    
    // Clear existing data to avoid primary key/unique collisions
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE hotel_contracts;");
    $pdo->exec("TRUNCATE TABLE excursion_contracts;");
    $pdo->exec("TRUNCATE TABLE transfer_contracts;");
    $pdo->exec("TRUNCATE TABLE hotels;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // 1. Seed Hotels
    $hotels = [
        ['name' => 'Marina Bay Sands Singapore', 'city_id' => 3, 'star_category' => 5],
        ['name' => 'Hotel Boss Singapore', 'city_id' => 3, 'star_category' => 3],
        ['name' => 'Zurich Plaza Hotel', 'city_id' => 4, 'star_category' => 4]
    ];

    foreach ($hotels as $h) {
        $stmt = $pdo->prepare("INSERT INTO hotels (name, city_id, star_category, is_active) VALUES (?, ?, ?, 1)");
        $stmt->execute([$h['name'], $h['city_id'], $h['star_category']]);
    }

    // 2. Seed Hotel Contracts
    $hotelContracts = [
        ['hotel_id' => 'Marina Bay Sands Singapore', 'room_type' => 'Deluxe Room', 'meal_plan' => 'Breakfast Included', 'contract_rate' => 14500],
        ['hotel_id' => 'Hotel Boss Singapore', 'room_type' => 'Standard Room', 'meal_plan' => 'None', 'contract_rate' => 12000],
        ['hotel_id' => 'Zurich Plaza Hotel', 'room_type' => 'Standard Double', 'meal_plan' => 'BB', 'contract_rate' => 15000]
    ];

    foreach ($hotelContracts as $hc) {
        $stmt = $pdo->prepare("
            INSERT INTO hotel_contracts (hotel_id, room_type, meal_plan, contract_rate, valid_from, valid_to) 
            VALUES (?, ?, ?, ?, '2026-01-01', '2026-12-31')
        ");
        $stmt->execute([$hc['hotel_id'], $hc['room_type'], $hc['meal_plan'], $hc['contract_rate']]);
    }

    // 3. Seed Excursion Contracts
    $excursions = [
        ['name' => 'Universal Studios Singapore', 'adult_rate' => 6000],
        ['name' => 'Gardens by the Bay', 'adult_rate' => 2500],
        ['name' => 'Night Safari Singapore', 'adult_rate' => 4000],
        ['name' => 'Zurich Lake Cruise', 'adult_rate' => 3000]
    ];

    foreach ($excursions as $e) {
        $stmt = $pdo->prepare("
            INSERT INTO excursion_contracts (excursion_name, adult_rate, child_rate, valid_from, valid_to)
            VALUES (?, ?, 0, '2026-01-01', '2026-12-31')
        ");
        $stmt->execute([$e['name'], $e['adult_rate']]);
    }

    // 4. Seed Transfer Contracts
    $transfers = [
        ['vehicle' => 'Toyota Innova Private Cab', 'rate' => 4000],
        ['vehicle' => 'Sedan private cab', 'rate' => 2500],
        ['vehicle' => 'Shared Shuttle Van', 'rate' => 1200]
    ];

    foreach ($transfers as $t) {
        $stmt = $pdo->prepare("
            INSERT INTO transfer_contracts (vehicle_type, rate, valid_from, valid_to)
            VALUES (?, ?, '2026-01-01', '2026-12-31')
        ");
        $stmt->execute([$t['vehicle'], $t['rate']]);
    }

    echo json_encode(['success' => true, 'message' => 'Seeded mock contracts successfully']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to seed mock contracts: ' . $e->getMessage()]);
}
