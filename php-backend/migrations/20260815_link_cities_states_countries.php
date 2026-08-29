<?php
// php-backend/migrations/20260815_link_cities_states_countries.php
// Migration script: Safely adds country_id column to cities if missing, and links state_id & country_id FKs across cities, sightseeings, and activities tables.

require_once __DIR__ . '/../db.php';

try {
    $pdo = getDb();
    echo "=== LINKING CITIES, SIGHTSEEINGS & ACTIVITIES TO STATES & COUNTRIES ===\n\n";

    // 1. Ensure `country_id` column exists on `cities`
    $colsStmt = $pdo->query("DESCRIBE `cities`");
    $existingCols = $colsStmt->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('country_id', $existingCols)) {
        $pdo->exec("ALTER TABLE `cities` ADD COLUMN `country_id` INT NULL AFTER `state_id`");
        echo "• Added missing `country_id` column to `cities` table.\n";
    }

    // 2. Normalize Country Name 'Dubai' to 'United Arab Emirates (UAE)' in countries table if present
    $pdo->exec("UPDATE countries SET country_name = 'United Arab Emirates (UAE)' WHERE id = 5 OR country_code = 'AE'");

    // 3. Link `cities.state_id` and `cities.country_id`
    $stmt = $pdo->query("SELECT id, name, state, country FROM cities");
    $cities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $updatedCities = 0;
    foreach ($cities as $c) {
        $stateId = null;
        $countryId = null;

        // Find country_id
        if (!empty($c['country'])) {
            $stC = $pdo->prepare("SELECT id FROM countries WHERE LOWER(country_name) LIKE LOWER(?) OR LOWER(country_name) LIKE LOWER(?) LIMIT 1");
            $stC->execute([$c['country'], '%' . $c['country'] . '%']);
            $countryId = $stC->fetchColumn();
        }

        // Find state_id
        if (!empty($c['state'])) {
            $stS = $pdo->prepare("SELECT id, country_id FROM states WHERE LOWER(state_name) = LOWER(?) OR LOWER(state_name) LIKE LOWER(?) LIMIT 1");
            $stS->execute([$c['state'], '%' . $c['state'] . '%']);
            $sRow = $stS->fetch(PDO::FETCH_ASSOC);
            if ($sRow) {
                $stateId = $sRow['id'];
                if (!$countryId) $countryId = $sRow['country_id'];
            }
        }

        // Fallback matching by city name
        if (!$stateId) {
            $stS = $pdo->prepare("SELECT id, country_id FROM states WHERE LOWER(state_name) = LOWER(?) LIMIT 1");
            $stS->execute([$c['name']]);
            $sRow = $stS->fetch(PDO::FETCH_ASSOC);
            if ($sRow) {
                $stateId = $sRow['id'];
                if (!$countryId) $countryId = $sRow['country_id'];
            }
        }

        // Update cities
        $up = $pdo->prepare("UPDATE cities SET state_id = ?, country_id = ? WHERE id = ?");
        $up->execute([$stateId, $countryId, $c['id']]);
        $updatedCities++;
    }
    echo "• Linked state_id & country_id for {$updatedCities} cities in cities table.\n";

    // 4. Update `sightseeings.country_id` and `sightseeings.state_id` from their `city_id`
    $upSs = $pdo->prepare("
        UPDATE sightseeings s
        JOIN cities c ON s.city_id = c.id
        SET s.country_id = c.country_id, s.state_id = c.state_id
        WHERE c.country_id IS NOT NULL OR c.state_id IS NOT NULL
    ");
    $upSs->execute();
    echo "• Synchronized country_id & state_id on sightseeings table.\n";

    // 5. Update `activities.country_id` and `activities.state_id` from their `city_id`
    $upAct = $pdo->prepare("
        UPDATE activities a
        JOIN cities c ON a.city_id = c.id
        SET a.country_id = c.country_id, a.state_id = c.state_id
        WHERE c.country_id IS NOT NULL OR c.state_id IS NOT NULL
    ");
    $upAct->execute();
    echo "• Synchronized country_id & state_id on activities table.\n";

    echo "\n=== LINKING COMPLETED SUCCESSFULLY ===\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
