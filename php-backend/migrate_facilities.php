<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    
    // 1. Alter facility_id column in hotel_facility_mapping to VARCHAR(100)
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `hotel_facility_mapping` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `hotel_id` VARCHAR(100) NOT NULL,
            `facility_id` VARCHAR(100) NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY `uc_hotel_facility` (`hotel_id`, `facility_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $pdo->exec("ALTER TABLE hotel_facility_mapping MODIFY COLUMN facility_id VARCHAR(100) NOT NULL");
    } catch (Throwable $e1) {
        $alterErr = $e1->getMessage();
    }

    // 2. Ensure hotel_facilities table exists and seed standard amenities
    $pdo->exec("CREATE TABLE IF NOT EXISTS `hotel_facilities` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `facility_name` VARCHAR(150) NOT NULL,
        `active_status` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY `uc_facility_name` (`facility_name`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $defaultFacs = [
        'Free High-Speed Wi-Fi',
        'Swimming Pool',
        'Multi-Cuisine Restaurant',
        '24/7 Room Service',
        'Spa & Ayurvedic Wellness',
        'Fitness Centre / Gym',
        'Bar & Lounge',
        'Air Conditioning (Climate Control)',
        'Free Valet / Self Parking',
        'Airport / Railway Shuttle',
        'Mountain / Valley Scenic View',
        'Electric Kettle & Tea/Coffee Maker',
        'Banquet & Conference Hall',
        'Kids Play Zone & Activity Area',
        'Pet Friendly Accommodations',
        'Bonfire & Outdoor BBQ Setup',
        'Elevator / Lift Access',
        'Doctor on Call & First Aid'
    ];

    $ins = $pdo->prepare("INSERT IGNORE INTO hotel_facilities (facility_name, active_status) VALUES (?, 1)");
    $seeded = 0;
    foreach ($defaultFacs as $df) {
        $ins->execute([$df]);
        $seeded += $ins->rowCount();
    }

    // Clean up any corrupt mapping rows with facility_id = '0'
    $pdo->exec("DELETE FROM hotel_facility_mapping WHERE facility_id = '0' OR facility_id = ''");

    echo json_encode([
        'success' => true,
        'message' => 'hotel_facility_mapping altered and hotel_facilities seeded successfully',
        'facilities_added' => $seeded,
        'alter_note' => $alterErr ?? 'OK'
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
