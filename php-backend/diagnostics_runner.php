<?php
require_once __DIR__ . '/db.php';
try {
    $pdo = getDb();

    echo "--- QUERY 1: Check if the hotel was actually saved ---\n";
    $q1 = $pdo->query("SELECT id, name, hotel_name, city_id, star_category, is_active FROM hotels ORDER BY id DESC LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
    print_r($q1);

    echo "\n--- QUERY 2: Check if Yamunotri exists in cities table ---\n";
    $q2 = $pdo->query("SELECT id, name, state FROM cities WHERE name LIKE '%Yamunotri%' OR name LIKE '%yamunotri%'")->fetchAll(PDO::FETCH_ASSOC);
    print_r($q2);

    echo "\n--- QUERY 3: Check ALL cities in the cities table ---\n";
    $q3 = $pdo->query("SELECT id, name, state FROM cities ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
    print_r($q3);

    echo "\n--- QUERY 4: Check what city_id the hotel has and what city that resolves to ---\n";
    $q4 = $pdo->query("SELECT h.id, h.name, h.hotel_name, h.city_id, h.is_active, c.name as city_name, c.state
                       FROM hotels h
                       LEFT JOIN cities c ON c.id = h.city_id
                       ORDER BY h.id DESC LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
    print_r($q4);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
