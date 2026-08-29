<?php
// Strict CLI execution check to prevent web requests
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "Access Denied: This script can only be run via the Command Line Interface (CLI).\n";
    exit(1);
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    echo "Successfully connected to MySQL database.\n\n";

    // 1. Run migrations
    echo "Running migrations...\n";

    // ALTER TABLE packages
    try {
        $pdo->exec("ALTER TABLE packages ADD COLUMN capital VARCHAR(255) NULL AFTER package_type");
        echo " - Added 'capital' column to packages.\n";
    } catch (PDOException $e) {
        echo " - Column 'capital' skipped: " . $e->getMessage() . "\n";
    }

    try {
        $pdo->exec("ALTER TABLE packages ADD COLUMN currency VARCHAR(50) NULL AFTER capital");
        echo " - Added 'currency' column to packages.\n";
    } catch (PDOException $e) {
        echo " - Column 'currency' skipped: " . $e->getMessage() . "\n";
    }

    try {
        $pdo->exec("ALTER TABLE packages ADD COLUMN visa_type VARCHAR(100) NULL AFTER currency");
        echo " - Added 'visa_type' column to packages.\n";
    } catch (PDOException $e) {
        echo " - Column 'visa_type' skipped: " . $e->getMessage() . "\n";
    }

    // CREATE TABLE package_template_items
    $pdo->exec("CREATE TABLE IF NOT EXISTS package_template_items (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      package_id        VARCHAR(36) NOT NULL,
      day_number        INT NOT NULL,
      item_type         ENUM('hotel', 'cab', 'activity', 'other') NOT NULL,
      hotel_rate_id     INT NULL,
      cab_rate_id       INT NULL,
      activity_rate_id  INT NULL,
      quantity          INT NOT NULL DEFAULT 1,
      notes             TEXT NULL,
      CONSTRAINT fk_pitem_package  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
      CONSTRAINT fk_pitem_hotel    FOREIGN KEY (hotel_rate_id) REFERENCES hotel_rates(id) ON DELETE SET NULL,
      CONSTRAINT fk_pitem_cab      FOREIGN KEY (cab_rate_id) REFERENCES cab_rates(id) ON DELETE SET NULL,
      CONSTRAINT fk_pitem_activity FOREIGN KEY (activity_rate_id) REFERENCES activity_rates(id) ON DELETE SET NULL,
      INDEX idx_pitem_package (package_id)
    ) ENGINE=InnoDB");
    echo " - Created table 'package_template_items'.\n";

    // CREATE TABLE package_attractions
    $pdo->exec("CREATE TABLE IF NOT EXISTS package_attractions (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      package_id   VARCHAR(36) NOT NULL,
      name         VARCHAR(255) NOT NULL,
      image        TEXT NULL,
      description  TEXT NULL,
      sort_order   INT NOT NULL DEFAULT 0,
      CONSTRAINT fk_pattraction_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
      INDEX idx_pattraction_package (package_id)
    ) ENGINE=InnoDB");
    echo " - Created table 'package_attractions'.\n";

    // 2. Seeding Test Package
    echo "\nSeeding test Char Dham package...\n";
    
    // Find/Verify city
    $stmt = $pdo->query("SELECT city_id FROM hotels LIMIT 1");
    $city_row = $stmt->fetch();
    $city_id = $city_row ? $city_row['city_id'] : 1;
    echo " - Using City ID: $city_id\n";

    // Insert/Get Hotel & Rate
    $hotel_id = null;
    $stmt = $pdo->prepare("SELECT id FROM hotels WHERE name = ?");
    $stmt->execute(['TEST - Kedarnath Camp Resort']);
    if ($row = $stmt->fetch()) {
        $hotel_id = $row['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO hotels (name, city_id, star_category, is_active) VALUES (?, ?, '4', 1)");
        $stmt->execute(['TEST - Kedarnath Camp Resort', $city_id]);
        $hotel_id = $pdo->lastInsertId();
    }

    $hotel_rate_id = null;
    $stmt = $pdo->prepare("SELECT id FROM hotel_rates WHERE hotel_id = ? AND room_type = ?");
    $stmt->execute([$hotel_id, 'Luxury Swiss Tent']);
    if ($row = $stmt->fetch()) {
        $hotel_rate_id = $row['id'];
        $up = $pdo->prepare("UPDATE hotel_rates SET rate_per_night = 4000.00, is_active = 1 WHERE id = ?");
        $up->execute([$hotel_rate_id]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO hotel_rates (hotel_id, room_type, rate_per_night, meal_plan, is_active) VALUES (?, 'Luxury Swiss Tent', 4000.00, 'MAP', 1)");
        $stmt->execute([$hotel_id]);
        $hotel_rate_id = $pdo->lastInsertId();
    }
    echo " - Hotel Rate ID: $hotel_rate_id (₹4,000/night)\n";

    // Insert/Get Cab & Rate
    $vendor_id = null;
    $stmt = $pdo->query("SELECT id FROM cab_vendors LIMIT 1");
    if ($row = $stmt->fetch()) {
        $vendor_id = $row['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO cab_vendors (name, city_id, is_active) VALUES ('TEST Cab Vendor', ?, 1)");
        $stmt->execute([$city_id]);
        $vendor_id = $pdo->lastInsertId();
    }

    $cab_rate_id = null;
    $stmt = $pdo->prepare("SELECT id FROM cab_rates WHERE cab_vendor_id = ? AND vehicle_type = ? AND usage_type = ?");
    $stmt->execute([$vendor_id, 'Toyota Innova Crysta', 'full_day']);
    if ($row = $stmt->fetch()) {
        $cab_rate_id = $row['id'];
        $up = $pdo->prepare("UPDATE cab_rates SET rate = 3500.00, is_active = 1 WHERE id = ?");
        $up->execute([$cab_rate_id]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO cab_rates (cab_vendor_id, vehicle_type, usage_type, rate, is_active) VALUES (?, 'Toyota Innova Crysta', 'full_day', 3500.00, 1)");
        $stmt->execute([$vendor_id]);
        $cab_rate_id = $pdo->lastInsertId();
    }
    echo " - Cab Rate ID: $cab_rate_id (₹3,500/day)\n";

    // Insert/Get Activities
    $act_vip_id = null;
    $stmt = $pdo->prepare("SELECT id FROM activities WHERE name = ?");
    $stmt->execute(['Kedarnath VIP Darshan Pass']);
    if ($row = $stmt->fetch()) {
        $act_vip_id = $row['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO activities (name, city_id, category, is_active) VALUES ('Kedarnath VIP Darshan Pass', ?, 'entry_ticket', 1)");
        $stmt->execute([$city_id]);
        $act_vip_id = $pdo->lastInsertId();
    }

    $act_vip_rate_id = null;
    $stmt = $pdo->prepare("SELECT id FROM activity_rates WHERE activity_id = ?");
    $stmt->execute([$act_vip_id]);
    if ($row = $stmt->fetch()) {
        $act_vip_rate_id = $row['id'];
        $up = $pdo->prepare("UPDATE activity_rates SET adult_rate = 500.00, is_active = 1 WHERE id = ?");
        $up->execute([$act_vip_rate_id]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO activity_rates (activity_id, rate_type, adult_rate, is_active) VALUES (?, 'per_person', 500.00, 1)");
        $stmt->execute([$act_vip_id]);
        $act_vip_rate_id = $pdo->lastInsertId();
    }
    echo " - VIP Darshan Rate ID: $act_vip_rate_id (₹500/person)\n";

    $act_guide_id = null;
    $stmt = $pdo->prepare("SELECT id FROM activities WHERE name = ?");
    $stmt->execute(['Scenic Trek Mountain Guide']);
    if ($row = $stmt->fetch()) {
        $act_guide_id = $row['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO activities (name, city_id, category, is_active) VALUES ('Scenic Trek Mountain Guide', ?, 'guide', 1)");
        $stmt->execute([$city_id]);
        $act_guide_id = $pdo->lastInsertId();
    }

    $act_guide_rate_id = null;
    $stmt = $pdo->prepare("SELECT id FROM activity_rates WHERE activity_id = ?");
    $stmt->execute([$act_guide_id]);
    if ($row = $stmt->fetch()) {
        $act_guide_rate_id = $row['id'];
        $up = $pdo->prepare("UPDATE activity_rates SET adult_rate = 1000.00, is_active = 1 WHERE id = ?");
        $up->execute([$act_guide_rate_id]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO activity_rates (activity_id, rate_type, adult_rate, is_active) VALUES (?, 'flat', 1000.00, 1)");
        $stmt->execute([$act_guide_id]);
        $act_guide_rate_id = $pdo->lastInsertId();
    }
    echo " - Mountain Guide Rate ID: $act_guide_rate_id (₹1,000 flat)\n";

    // Insert Package
    $package_id = 'char-dham-yatra-uuid-test';
    $stmt = $pdo->prepare("SELECT id FROM packages WHERE id = ?");
    $stmt->execute([$package_id]);
    if ($row = $stmt->fetch()) {
        $up = $pdo->prepare("UPDATE packages SET slug = 'char-dham-yatra', category = '[\"premium\"]', is_active = 1, capital = 'Dehradun (Winter) / Gairseyn (Summer)', currency = 'INR', visa_type = 'Not Required (Domestic)', highlights = '[\"VIP Heli Transfers Included\", \"Luxury Stays at Kedarnath\", \"Guided Trek with Mountain Experts\", \"All Entry & VIP Darshan Passes\"]' WHERE id = ?");
        $up->execute([$package_id]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO packages (id, name, slug, duration, category, package_type, capital, currency, visa_type, is_active, highlights, inclusions, exclusions, itinerary, map_locations, flight_routes, faqs, destinations) VALUES (?, 'Char Dham Yatra via Private Heli', 'char-dham-yatra', '6 Days / 5 Nights', '[\"premium\"]', 'domestic', 'Dehradun (Winter)', 'INR', 'Not Required', 1, '[\"VIP Heli Transfers Included\", \"Luxury Stays at Kedarnath\", \"Guided Trek with Mountain Experts\", \"All Entry & VIP Darshan Passes\"]', '[]', '[]', '[]', '[]', '[]', '[]', '[\"Kedarnath\", \"Badrinath\"]')");
        $stmt->execute([$package_id]);
    }
    echo " - Package created/updated: $package_id\n";

    // Insert Template Items
    $pdo->prepare("DELETE FROM package_template_items WHERE package_id = ?")->execute([$package_id]);
    $items = [
        ['day_number' => 1, 'item_type' => 'hotel', 'hotel_rate_id' => $hotel_rate_id, 'cab_rate_id' => null, 'activity_rate_id' => null, 'quantity' => 1, 'notes' => 'Luxury tent stay'],
        ['day_number' => 1, 'item_type' => 'cab', 'hotel_rate_id' => null, 'cab_rate_id' => $cab_rate_id, 'activity_rate_id' => null, 'quantity' => 1, 'notes' => 'Airport pickup and transfers'],
        ['day_number' => 2, 'item_type' => 'hotel', 'hotel_rate_id' => $hotel_rate_id, 'cab_rate_id' => null, 'activity_rate_id' => null, 'quantity' => 1, 'notes' => 'Luxury tent stay'],
        ['day_number' => 2, 'item_type' => 'cab', 'hotel_rate_id' => null, 'cab_rate_id' => $cab_rate_id, 'activity_rate_id' => null, 'quantity' => 1, 'notes' => 'Local temple sightseeing'],
        ['day_number' => 2, 'item_type' => 'activity', 'hotel_rate_id' => null, 'cab_rate_id' => null, 'activity_rate_id' => $act_vip_rate_id, 'quantity' => 2, 'notes' => 'VIP Entry Passes for 2 Adults'],
        ['day_number' => 3, 'item_type' => 'hotel', 'hotel_rate_id' => $hotel_rate_id, 'cab_rate_id' => null, 'activity_rate_id' => null, 'quantity' => 1, 'notes' => 'Luxury tent stay'],
        ['day_number' => 3, 'item_type' => 'cab', 'hotel_rate_id' => null, 'cab_rate_id' => $cab_rate_id, 'activity_rate_id' => null, 'quantity' => 1, 'notes' => 'Trek route drops'],
        ['day_number' => 3, 'item_type' => 'activity', 'hotel_rate_id' => null, 'cab_rate_id' => null, 'activity_rate_id' => $act_guide_rate_id, 'quantity' => 1, 'notes' => 'Dedicated mountain guide'],
    ];

    $ins = $pdo->prepare("INSERT INTO package_template_items (package_id, day_number, item_type, hotel_rate_id, cab_rate_id, activity_rate_id, quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($items as $item) {
        $ins->execute([
            $package_id,
            $item['day_number'],
            $item['item_type'],
            $item['hotel_rate_id'],
            $item['cab_rate_id'],
            $item['activity_rate_id'],
            $item['quantity'],
            $item['notes']
        ]);
    }
    echo " - Seeded 8 template items.\n";

    // Insert Attractions
    $pdo->prepare("DELETE FROM package_attractions WHERE package_id = ?")->execute([$package_id]);
    $atts = [
        ['name' => 'Kedarnath Temple', 'image' => '/Kedarnath.png', 'description' => 'Ancient Shiva temple nestled in the Garhwal Himalayas.', 'sort_order' => 1],
        ['name' => 'Badrinath Temple', 'image' => '/Badrinath.png', 'description' => 'Vibrant Vishnu temple on the banks of Alaknanda River.', 'sort_order' => 2],
    ];

    $ins_att = $pdo->prepare("INSERT INTO package_attractions (package_id, name, image, description, sort_order) VALUES (?, ?, ?, ?, ?)");
    foreach ($atts as $att) {
        $ins_att->execute([
            $package_id,
            $att['name'],
            $att['image'],
            $att['description'],
            $att['sort_order']
        ]);
    }
    echo " - Seeded 2 attractions.\n";

    echo "\n=== MIGRATION & SEEDING COMPLETED SUCCESSFULLY ===\n";

} catch (Exception $e) {
    echo "\nError running migration: " . $e->getMessage() . "\n";
}
