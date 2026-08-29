<?php
// Migration: 20260815_add_performance_indexes.php
// Adds database indexes on high-frequency query columns

require_once __DIR__ . '/../db.php';

try {
    $pdo = getDb();
    echo "Starting Database Performance Indexing Migration...\n";

    $indexes = [
        "CREATE INDEX IF NOT EXISTS idx_hotels_dest ON hotels (destination)",
        "CREATE INDEX IF NOT EXISTS idx_hotels_active ON hotels (active_status)",
        "CREATE INDEX IF NOT EXISTS idx_cab_rates_route ON cab_contract_rates (source_city, destination_city)",
        "CREATE INDEX IF NOT EXISTS idx_cab_rates_supplier ON cab_contract_rates (supplier_name)",
        "CREATE INDEX IF NOT EXISTS idx_sightseeing_dest ON sightseeings (destination)",
        "CREATE INDEX IF NOT EXISTS idx_activities_dest ON activities (destination)",
        "CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status)",
        "CREATE INDEX IF NOT EXISTS idx_packages_slug ON packages (slug)"
    ];

    foreach ($indexes as $sql) {
        try {
            $pdo->exec($sql);
            echo " [OK] Executed: $sql\n";
        } catch (Exception $e) {
            // MySQL fallback if IF NOT EXISTS syntax differs
            echo " [NOTE] Index may already exist or skipped: " . $e->getMessage() . "\n";
        }
    }

    echo "Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration Error: " . $e->getMessage() . "\n";
}
