<?php
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden: Diagnostic scripts can only be executed via PHP CLI.']);
    exit(1);
}
// One-off script to inspect actual rows in itinerary tables.
// Run via cPanel Terminal: php /home3/a17511nd/ghumofiroo.com/php-backend/check_itinerary_data.php
// Then delete this file.

require_once __DIR__ . '/db.php';

$tables = [
    'itinerary_hotels',
    'itinerary_transport',
    'itinerary_excursions',
    'itinerary_line_items'
];

try {
    $pdo = getDb();
} catch (Exception $e) {
    echo "ERROR CONNECTING TO DATABASE: " . $e->getMessage() . "\n";
    exit(1);
}

foreach ($tables as $table) {
    try {
        echo "=== SAMPLE ROWS IN $table ===\n";
        $stmt = $pdo->query("SELECT * FROM `$table` LIMIT 3");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) {
            echo "No rows found in table '$table'.\n\n";
        } else {
            foreach ($rows as $index => $row) {
                echo "Row " . ($index + 1) . ":\n";
                foreach ($row as $key => $val) {
                    echo "  $key => " . var_export($val, true) . "\n";
                }
            }
            echo "\n";
        }
    } catch (PDOException $e) {
        echo "ERROR READING $table: " . $e->getMessage() . "\n\n";
    }
}
