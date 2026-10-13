<?php
// php-backend/api/quotes/QuoteModel.php — Domain Data Model & Schema Manager for Quotes
// Ghumo Firoo Travels Enterprise Architecture

require_once __DIR__ . '/../../db.php';

class QuoteModel
{
    private static ?array $quoteColumns = null;

    /**
     * Ensure quotes table exists with required schema
     */
    public static function ensureTable(PDO $pdo): void
    {
        static $ensured = false;
        if ($ensured) return;

        $lockFile = __DIR__ . '/../../cache/quotes_table.lock';
        if (!file_exists($lockFile)) {
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS `quotes` (
                    `id` VARCHAR(36) PRIMARY KEY,
                    `lead_id` INT NOT NULL,
                    `itinerary_id` VARCHAR(100) NULL,
                    `version_number` INT NOT NULL DEFAULT 1,
                    `parent_quote_id` VARCHAR(36) NULL,
                    `status` VARCHAR(50) DEFAULT 'Draft',
                    `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                    `package_name` VARCHAR(255) NOT NULL,
                    `cost_breakdown` JSON NULL,
                    `inclusions` JSON NULL,
                    `exclusions` JSON NULL,
                    `terms` TEXT NULL,
                    `notes` TEXT NULL,
                    `share_token` VARCHAR(64) NULL,
                    `share_message` TEXT NULL,
                    `shared_at` TIMESTAMP NULL,
                    `viewed_at` TIMESTAMP NULL,
                    `expires_at` TIMESTAMP NULL,
                    `created_by` VARCHAR(255) NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX `idx_quotes_lead_id` (`lead_id`),
                    INDEX `idx_quotes_version` (`lead_id`, `version_number`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

                if (!is_dir(__DIR__ . '/../../cache')) {
                    @mkdir(__DIR__ . '/../../cache', 0755, true);
                }
                @file_put_contents($lockFile, time());
            } catch (Throwable $e) {}
        }
        $ensured = true;
    }

    /**
     * Generate secure UUIDv4 identifier
     */
    public static function generateUUID(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    /**
     * Parse quote row: decode JSON structures and cast numerics
     */
    public static function parseRow(array $row): array
    {
        if (isset($row['total_amount'])) $row['total_amount'] = (float)$row['total_amount'];
        if (isset($row['version_number'])) $row['version_number'] = (int)$row['version_number'];

        $jsonCols = ['cost_breakdown', 'inclusions', 'exclusions'];
        foreach ($jsonCols as $col) {
            if (isset($row[$col]) && is_string($row[$col])) {
                $decoded = json_decode($row[$col], true);
                $row[$col] = $decoded !== null ? $decoded : ($col === 'cost_breakdown' ? null : []);
            } elseif (!isset($row[$col]) || $row[$col] === null) {
                if ($col !== 'cost_breakdown') {
                    $row[$col] = [];
                }
            }
        }

        return $row;
    }
}
