<?php
// One-off script to describe remaining tables (itinerary_line_items, cab_rates, activity_rates, cab_vendors).
// Run via cPanel Terminal: php /home3/a17511nd/ghumofiroo.com/php-backend/check_extra_tables.php
// Then delete this file.

require_once __DIR__ . '/db.php';

$tables = [
    'itinerary_line_items',
    'cab_rates',
    'activity_rates',
    'cab_vendors'
];

try {
    $pdo = getDb();
} catch (Exception $e) {
    echo "ERROR CONNECTING TO DATABASE: " . $e->getMessage() . "\n";
    exit(1);
}

foreach ($tables as $table) {
    try {
        echo "=== DESCRIBE $table ===\n";
        $stmt = $pdo->query("DESCRIBE `$table`");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

        printf("%-25s | %-15s | %-10s | %-5s | %-10s | %-5s\n", "Field", "Type", "Null", "Key", "Default", "Extra");
        echo str_repeat("-", 80) . "\n";
        foreach ($columns as $col) {
            printf("%-25s | %-15s | %-10s | %-5s | %-10s | %-5s\n",
                $col['Field'],
                $col['Type'],
                $col['Null'],
                $col['Key'],
                $col['Default'] ?? 'NULL',
                $col['Extra']
            );
        }
        echo "\n";
    } catch (PDOException $e) {
        echo "ERROR DESCRIBING $table: " . $e->getMessage() . "\n\n";
    }
}
