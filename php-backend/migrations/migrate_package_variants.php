<?php
require_once __DIR__ . '/../db.php';
$pdo = getDb();

echo "Starting database schema expansion...\n";

// 1. package_variants table
$sql1 = "CREATE TABLE IF NOT EXISTS package_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id VARCHAR(36) NOT NULL,
  variant_key VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  nights INT DEFAULT 0,
  days INT DEFAULT 1,
  tag VARCHAR(50) NULL,
  price_per_person DECIMAL(10,2) NOT NULL DEFAULT 0,
  hotel_category VARCHAR(100) NULL,
  group_size VARCHAR(50) NULL,
  pickup_from VARCHAR(255) NULL,
  inclusions JSON NULL,
  exclusions JSON NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pv_packages FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  UNIQUE KEY uq_package_variant (package_id, variant_key),
  INDEX idx_package_id (package_id)
) ENGINE=InnoDB;";

// 2. variant_itinerary_days table
$sql2 = "CREATE TABLE IF NOT EXISTS variant_itinerary_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  variant_id INT NOT NULL,
  day_number INT NOT NULL,
  timing VARCHAR(20) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  activities JSON NULL,
  meals VARCHAR(100) NULL,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_vid_variants FOREIGN KEY (variant_id) REFERENCES package_variants(id) ON DELETE CASCADE,
  INDEX idx_variant (variant_id)
) ENGINE=InnoDB;";

// 3. variant_hotels table
$sql3 = "CREATE TABLE IF NOT EXISTS variant_hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  variant_id INT NOT NULL,
  hotel_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NULL,
  stars TINYINT DEFAULT 3,
  highlight VARCHAR(500) NULL,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_vh_variants FOREIGN KEY (variant_id) REFERENCES package_variants(id) ON DELETE CASCADE,
  INDEX idx_variant (variant_id)
) ENGINE=InnoDB;";

// 4. variant_excursions table
$sql4 = "CREATE TABLE IF NOT EXISTS variant_excursions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  variant_id INT NOT NULL,
  excursion_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  duration VARCHAR(100) NULL,
  price VARCHAR(100) NULL,
  is_included TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_ve_variants FOREIGN KEY (variant_id) REFERENCES package_variants(id) ON DELETE CASCADE,
  INDEX idx_variant (variant_id)
) ENGINE=InnoDB;";

// 5. variant_price_rows table
$sql5 = "CREATE TABLE IF NOT EXISTS variant_price_rows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  variant_id INT NOT NULL,
  room_type VARCHAR(255) NOT NULL,
  price VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_vpr_variants FOREIGN KEY (variant_id) REFERENCES package_variants(id) ON DELETE CASCADE,
  INDEX idx_variant (variant_id)
) ENGINE=InnoDB;";

// 6. variant_cancellation table
$sql6 = "CREATE TABLE IF NOT EXISTS variant_cancellation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  variant_id INT NOT NULL,
  days_before VARCHAR(100) NOT NULL,
  charge VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_vc_variants FOREIGN KEY (variant_id) REFERENCES package_variants(id) ON DELETE CASCADE,
  INDEX idx_variant (variant_id)
) ENGINE=InnoDB;";

// 7. ALTER packages for missing columns ONLY
$sql7 = "ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS tagline TEXT NULL,
  ADD COLUMN IF NOT EXISTS hero_image VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS is_featured TINYINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attractions_json JSON NULL;";

$queries = [
    'package_variants' => $sql1,
    'variant_itinerary_days' => $sql2,
    'variant_hotels' => $sql3,
    'variant_excursions' => $sql4,
    'variant_price_rows' => $sql5,
    'variant_cancellation' => $sql6,
    'alter_packages' => $sql7
];

foreach ($queries as $name => $query) {
    try {
        $pdo->exec($query);
        echo "[SUCCESS] Applied: $name\n";
    } catch (PDOException $e) {
        echo "[ERROR] Failed $name: " . $e->getMessage() . "\n";
    }
}

echo "Database migration completed!\n";
