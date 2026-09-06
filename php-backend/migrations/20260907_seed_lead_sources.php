<?php
// php-backend/migrations/20260907_seed_lead_sources.php
// Ensures the lead_sources table exists and seeds all enterprise/marketing sources.

require_once __DIR__ . '/../db.php';

try {
    $pdo = getDb();

    // 1. Ensure table exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `lead_sources` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `source_name` VARCHAR(100) NOT NULL UNIQUE,
            `category` VARCHAR(50) NOT NULL DEFAULT 'digital',
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // 2. All canonical sources requested
    $sources = [
        ['Trip Clap', 'b2b'],
        ['Travecode', 'b2b'],
        ['Hello_Visit', 'b2b'],
        ['Referral', 'offline'],
        ['Google Ads', 'digital'],
        ['Facebook Ads', 'digital'],
        ['Instagram', 'digital'],
        ['Travel Lead', 'aggregator'],
        ['Partner', 'partnership'],
        ['B2B', 'b2b'],
        ['WhatsApp', 'direct'],
        ['LinkedIn', 'social'],
        ['Website - Download Brochure', 'website'],
        ['Website - Enquire Now Modal', 'website'],
        ['Website - Contact Form', 'website'],
        ['Website - Floating WhatsApp', 'website'],
        ['Direct Customer', 'direct'],
        ['Phone Call', 'direct'],
        ['Walk-in', 'offline']
    ];

    $stmt = $pdo->prepare("
        INSERT INTO `lead_sources` (`source_name`, `category`, `is_active`)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE `is_active` = 1
    ");

    $count = 0;
    foreach ($sources as $s) {
        $stmt->execute([$s[0], $s[1]]);
        $count++;
    }

    echo json_encode([
        'success' => true,
        'message' => "Successfully seeded/updated {$count} lead sources."
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
