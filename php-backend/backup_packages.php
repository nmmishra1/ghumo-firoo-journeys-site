<?php
// backup_packages.php - Safe database backup script
// Can be run via CLI: php php-backend/backup_packages.php

header('Content-Type: text/plain');
require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    
    // Explicitly read variables from environment to print database details
    $host = getenv('MYSQL_HOST') ?: 'localhost';
    $dbName = getenv('MYSQL_DATABASE') ?: 'unknown';
    
    echo "=== DATABASE BACKUP INITIALIZED ===\n";
    echo "Active Host: $host\n";
    echo "Active Database: $dbName\n\n";

    // Broadened list of tables to backup
    $tables = [
        'packages',
        'package_template_items',
        'package_attractions',
        'hotels',
        'hotel_rates',
        'cab_vendors',
        'cab_rates',
        'activities',
        'activity_rates',
        'leads',
        'itineraries'
    ];

    $backupData = [];
    $timestamp = time();
    $backupFile = __DIR__ . "/backup_{$dbName}_{$timestamp}.json";

    foreach ($tables as $table) {
        try {
            // Verify if table exists
            $q = $pdo->query("SHOW TABLES LIKE '{$table}'");
            if ($q->rowCount() === 0) {
                echo "Warning: Table '{$table}' does not exist in database '{$dbName}'. Skipping.\n";
                continue;
            }

            // Fetch all records
            $stmt = $pdo->query("SELECT * FROM `{$table}`");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $backupData[$table] = $rows;
            echo "Successfully backed up '{$table}': " . count($rows) . " rows.\n";
        } catch (PDOException $e) {
            echo "Error backing up '{$table}': " . $e->getMessage() . "\n";
        }
    }

    // Write JSON file
    $json = json_encode($backupData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new Exception("json_encode failed: " . json_last_error_msg());
    }

    $writeResult = file_put_contents($backupFile, $json);
    if ($writeResult === false) {
        throw new Exception("Failed to write backup file to: {$backupFile}");
    }

    echo "\n=== BACKUP SUMMARY ===\n";
    echo "File Location: " . realpath($backupFile) . "\n";
    echo "File Size: " . number_format($writeResult) . " bytes\n";
    echo "Backup completed successfully.\n";

} catch (Exception $e) {
    echo "\nFATAL BACKUP ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
