<?php
/**
 * Migration: add a real city_id FK to `activities` and `sightseeings`,
 * then backfill it by matching the existing free-text `destination`
 * column against the `cities` master table.
 *
 * Why this exists:
 *   inventory_by_city.php has always queried activities/sightseeings by
 *   city_id, but neither table actually has that column — every row's
 *   city_id has been NULL, and matching has silently fallen back to a
 *   fragile LOWER(name) = LOWER(destination) string comparison.
 *   This script closes that gap without dropping any existing data.
 *
 * Safe to re-run: every step checks INFORMATION_SCHEMA before altering,
 * and the backfill UPDATE only ever touches rows where city_id IS NULL.
 *
 * Usage (CLI only — do not expose this over HTTP):
 *   php php-backend/migrations/20260814_add_city_id_to_activities_sightseeings.php
 *
 * NOTE ON THE `cities` TABLE:
 *   Different parts of this codebase assume different column names for
 *   the city's display name (`city_name` vs `name`). This script detects
 *   whichever one actually exists at runtime instead of hardcoding it —
 *   see resolveCityNameColumn() below. If your `cities` table uses a
 *   third name, the script will print an error telling you what it found
 *   rather than guessing.
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

/** Detect whether cities uses `city_name` or `name` for the display name. */
function resolveCityNameColumn(PDO $pdo): string
{
    if (columnExists($pdo, 'cities', 'city_name')) return 'city_name';
    if (columnExists($pdo, 'cities', 'name')) return 'name';
    throw new RuntimeException(
        "Could not find a city_name or name column on `cities`. " .
        "Open the table and tell me the real column so this script can be fixed."
    );
}

echo "== Step 1: ensure `cities` table exists ==\n";
if (!tableExists($pdo, 'cities')) {
    throw new RuntimeException("`cities` table not found in this database. Aborting.");
}
$cityNameCol = resolveCityNameColumn($pdo);
echo "  Using cities.$cityNameCol as the city display-name column.\n\n";

echo "== Step 2: add city_id column where missing ==\n";
foreach (['activities', 'sightseeings'] as $table) {
    if (!tableExists($pdo, $table)) {
        echo "  SKIP: `$table` table not found.\n";
        continue;
    }
    if (columnExists($pdo, $table, 'city_id')) {
        echo "  OK: `$table`.city_id already exists.\n";
        continue;
    }
    $pdo->exec("ALTER TABLE `$table` ADD COLUMN `city_id` INT NULL AFTER `destination`");
    $pdo->exec("ALTER TABLE `$table` ADD INDEX `idx_{$table}_city_id` (`city_id`)");
    echo "  DONE: added `$table`.city_id (indexed).\n";
}
echo "\n";

echo "== Step 3: backfill city_id from destination text match ==\n";
foreach (['activities', 'sightseeings'] as $table) {
    if (!tableExists($pdo, $table) || !columnExists($pdo, $table, 'city_id')) {
        continue;
    }

    // Only rows that still need matching.
    $rows = $pdo->query(
        "SELECT id, destination FROM `$table` WHERE city_id IS NULL AND destination IS NOT NULL AND destination <> ''"
    )->fetchAll();

    $matched = 0;
    $ambiguous = [];
    $unmatched = [];

    $find = $pdo->prepare("SELECT id FROM cities WHERE LOWER(`$cityNameCol`) = LOWER(?)");
    $update = $pdo->prepare("UPDATE `$table` SET city_id = ? WHERE id = ?");

    foreach ($rows as $row) {
        $find->execute([trim($row['destination'])]);
        $cityMatches = $find->fetchAll();

        if (count($cityMatches) === 1) {
            $update->execute([$cityMatches[0]['id'], $row['id']]);
            $matched++;
        } elseif (count($cityMatches) > 1) {
            // Ambiguous — do NOT guess. Leave for manual review.
            $ambiguous[] = $row['destination'] . ' (row id ' . $row['id'] . ')';
        } else {
            $unmatched[] = $row['destination'] . ' (row id ' . $row['id'] . ')';
        }
    }

    echo "  `$table`: matched $matched row(s).\n";
    if ($ambiguous) {
        $uniqueAmbiguous = array_values(array_unique($ambiguous));
        echo "    Ambiguous (multiple cities share that name, needs manual pick): " . count($uniqueAmbiguous) . "\n";
        foreach (array_slice($uniqueAmbiguous, 0, 20) as $a) echo "      - $a\n";
    }
    if ($unmatched) {
        $uniqueUnmatched = array_values(array_unique($unmatched));
        echo "    No matching city found (destination text doesn't match any city name): " . count($uniqueUnmatched) . "\n";
        foreach (array_slice($uniqueUnmatched, 0, 20) as $u) echo "      - $u\n";
    }
}

echo "\nDone. Re-run any time — already-matched rows (city_id NOT NULL) are left untouched.\n";
