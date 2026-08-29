<?php
// One-off script to list all tables in the database.
// Run via cPanel Terminal: php /home3/a17511nd/ghumofiroo.com/php-backend/list_tables.php
// Then delete this file.

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "=== Tables in Database ===\n";
    foreach ($tables as $t) {
        echo " - $t\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
