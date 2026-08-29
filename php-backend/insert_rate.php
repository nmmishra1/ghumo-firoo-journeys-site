<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/db.php';
try {
    $pdo = getDb();
    $stmt = $pdo->prepare("
        INSERT INTO hotel_rates (hotel_id, room_type, meal_plan, rate_per_night, extra_bed_rate, child_rate, currency, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        'hot-6a5ef6ff478d2-7652',
        'Regency Suite',
        'MAP',
        18000.00,
        2000.00,
        1000.00,
        'INR',
        1
    ]);
    echo "Inserted rate successfully!\n";
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
?>
