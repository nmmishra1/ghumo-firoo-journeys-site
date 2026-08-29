<?php
// migrate_blogs.php - Create blogs tables on the database
// CLI execution check
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "Access Denied: This script can only be run via the Command Line Interface (CLI).\n";
    exit(1);
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    $host = getenv('MYSQL_HOST') ?: 'localhost';
    $dbName = getenv('MYSQL_DATABASE') ?: 'unknown';

    echo "=== RUNNING BLOGS DATABASE MIGRATION ===\n";
    echo "Active Host: $host\n";
    echo "Active Database: $dbName\n\n";

    // 1. Create blog_categories table
    echo "1. Creating 'blog_categories' table...\n";
    $pdo->exec("CREATE TABLE IF NOT EXISTS blog_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    echo " - Success.\n";

    // 2. Create blogs table
    echo "2. Creating 'blogs' table...\n";
    $pdo->exec("CREATE TABLE IF NOT EXISTS blogs (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content LONGTEXT NOT NULL,
      category_id INT NOT NULL,
      author VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      image TEXT NOT NULL,
      image_title VARCHAR(255) NULL,
      image_alt VARCHAR(255) NULL,
      read_time VARCHAR(50) NOT NULL DEFAULT '10 min read',
      seo_title VARCHAR(255) NULL,
      seo_description TEXT NULL,
      seo_keywords TEXT NULL,
      canonical_url TEXT NULL,
      schema_markup JSON NULL,
      related_destination VARCHAR(100) NULL,
      related_package VARCHAR(100) NULL,
      status ENUM('Draft', 'Published', 'Scheduled', 'Archived') DEFAULT 'Draft',
      publish_date TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_blogs_category FOREIGN KEY (category_id) REFERENCES blog_categories(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    echo " - Success.\n";

    // 3. Create blog_tags table
    echo "3. Creating 'blog_tags' table...\n";
    $pdo->exec("CREATE TABLE IF NOT EXISTS blog_tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      blog_id VARCHAR(36) NOT NULL,
      tag VARCHAR(100) NOT NULL,
      CONSTRAINT fk_blogtags_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
      UNIQUE KEY uniq_blog_tag (blog_id, tag)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    echo " - Success.\n";

    // 4. Create indexes
    echo "4. Creating indexes...\n";
    try {
        $pdo->exec("CREATE INDEX idx_blogs_slug ON blogs(slug)");
        $pdo->exec("CREATE INDEX idx_blogs_status ON blogs(status)");
        $pdo->exec("CREATE INDEX idx_blogs_category ON blogs(category_id)");
        echo " - Success.\n";
    } catch (PDOException $e) {
        echo " - Indexes skipped (probably already exist): " . $e->getMessage() . "\n";
    }

    // 5. Seed default blog categories
    echo "5. Seeding default categories...\n";
    $categories = [
        ['Destination Guides', 'destination-guides'],
        ['Honeymoon Packages', 'honeymoon-packages'],
        ['Family Holidays', 'family-holidays'],
        ['Weekend Getaways', 'weekend-getaways'],
        ['International Travel', 'international-travel'],
        ['Visa Guides', 'visa-guides'],
        ['Travel Tips', 'travel-tips'],
        ['Hotel Reviews', 'hotel-reviews'],
        ['Festival Travel', 'festival-travel'],
        ['Adventure Travel', 'adventure-travel'],
        ['Luxury Holidays', 'luxury-holidays'],
        ['Corporate Travel', 'corporate-travel']
    ];

    $ins = $pdo->prepare("INSERT INTO blog_categories (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug)");
    foreach ($categories as $cat) {
        $ins->execute([$cat[0], $cat[1]]);
    }
    echo " - Seeded " . count($categories) . " categories.\n";

    echo "\n=== BLOGS MIGRATION COMPLETED SUCCESSFULLY ===\n";

} catch (Exception $e) {
    echo "\nFATAL MIGRATION ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
