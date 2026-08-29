<?php
/**
 * Migration: add columns to `itineraries` so itinerary_save.php can record
 * when a client-submitted total doesn't match what the server independently
 * computes from hotel_rates / cab_rates / activity_rates.
 *
 * This is intentionally a FLAG, not a hard rejection — see the comment in
 * itinerary_save.php's validateAndAnnotatePricing() for why: this codebase's
 * rate tables have inconsistent column names across different files
 * (extra_bed_cost vs extra_bed_rate, child_cost vs child_rate, etc.), so a
 * server-side recompute right now is a best-effort second opinion, not
 * guaranteed to reconstruct every fee component (extra beds, manual toll/
 * permit charges) the agent may have legitimately entered. Flag first,
 * review the real-world variance data, then decide whether to enforce.
 *
 * Safe to re-run.
 * Usage: php php-backend/migrations/20260815_add_pricing_validation_columns.php
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "This migration must be run from the CLI, not over HTTP.\n";
    exit(1);
}

require_once __DIR__ . '/../db.php';
$pdo = getDb();

function columnExists(PDO $pdo, string $table, string $column): bool
{
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?"
    );
    $stmt->execute([$table, $column]);
    return (int)$stmt->fetchColumn() > 0;
}

function tableExists(PDO $pdo, string $table): bool
{
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?"
    );
    $stmt->execute([$table]);
    return (int)$stmt->fetchColumn() > 0;
}

if (!tableExists($pdo, 'itineraries')) {
    throw new RuntimeException("`itineraries` table not found. Aborting.");
}

$additions = [
    'pricing_flagged'  => "ALTER TABLE `itineraries` ADD COLUMN `pricing_flagged` TINYINT(1) NOT NULL DEFAULT 0 AFTER `final_cost`",
    'pricing_variance' => "ALTER TABLE `itineraries` ADD COLUMN `pricing_variance` TEXT NULL AFTER `pricing_flagged`",
];

foreach ($additions as $col => $sql) {
    if (columnExists($pdo, 'itineraries', $col)) {
        echo "OK: itineraries.$col already exists.\n";
        continue;
    }
    $pdo->exec($sql);
    echo "DONE: added itineraries.$col\n";
}

// Index is separate so it's safe to add even when the column pre-existed
// without an index from an earlier manual change.
$idxStmt = $pdo->prepare(
    "SELECT COUNT(*) FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'itineraries' AND INDEX_NAME = 'idx_itineraries_pricing_flagged'"
);
$idxStmt->execute();
if ((int)$idxStmt->fetchColumn() === 0) {
    $pdo->exec("ALTER TABLE `itineraries` ADD INDEX `idx_itineraries_pricing_flagged` (`pricing_flagged`)");
    echo "DONE: added index on itineraries.pricing_flagged\n";
} else {
    echo "OK: index on itineraries.pricing_flagged already exists.\n";
}

echo "\nDone.\n";
