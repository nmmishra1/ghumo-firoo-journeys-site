<?php
// migrate_profiles_security.php - Seeds tables, migrates profile information, and enhances tables with safety checks

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../db.php';

try {
    $pdo = getDb();
    echo "Connected to the database successfully.\n";

    // 1. Run the base SQL migration file
    $sqlPath = __DIR__ . '/migration_security.sql';
    if (!file_exists($sqlPath)) {
        throw new Exception("Migration SQL file not found at: $sqlPath");
    }

    echo "Running base migration SQL...\n";
    $sql = file_get_contents($sqlPath);
    
    // Execute raw multi-query
    $pdo->exec($sql);
    echo "Base SQL migration successfully executed.\n";

    // 2. Fetch all profiles from legacy profiles table
    echo "Fetching existing profiles...\n";
    $stmt = $pdo->query("SELECT * FROM profiles");
    $legacyProfiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($legacyProfiles) . " legacy profiles.\n";

    // Map role enum values to new role IDs
    $roleMapping = [
        'admin' => 1,
        'manager' => 2,
        'agent' => 3,
        'user' => 3 // default to Agent/Standard user role in the CRM
    ];

    $pdo->beginTransaction();

    foreach ($legacyProfiles as $profile) {
        $email = $profile['email'];
        $fullName = $profile['full_name'] ?? 'Unknown';
        $userId = $profile['id']; // Legacy ID is Supabase UUID
        $roleEnum = strtolower($profile['role'] ?? 'agent');
        $roleId = $roleMapping[$roleEnum] ?? 3;
        $approved = (int)($profile['approved'] ?? 0);

        echo "Migrating user: $fullName ($email) - Role: $roleEnum -> Role ID: $roleId\n";

        // Insert into profiles_new
        $stmtInsertProfile = $pdo->prepare("
            INSERT INTO profiles_new (id, agency_id, branch_id, department_id, team_id, role_id, supabase_uid, full_name, email, phone, avatar_url)
            VALUES (?, 1, 1, 1, 1, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                full_name = VALUES(full_name),
                role_id = VALUES(role_id),
                phone = VALUES(phone),
                avatar_url = VALUES(avatar_url)
        ");
        $stmtInsertProfile->execute([
            $userId,
            $roleId,
            $userId, // supabase_uid matches profiles.id
            $fullName,
            $email,
            $profile['phone'] ?? null,
            $profile['avatar_url'] ?? null
        ]);

        // Determine platform admin flag (Superadmin gets platform admin privilege)
        $isPlatformAdmin = ($email === 'superadmin@ghumofiroo.com') ? 1 : 0;

        // Insert into user_security
        $stmtInsertSecurity = $pdo->prepare("
            INSERT INTO user_security (profile_id, is_platform_admin, active, approved, locked, session_version)
            VALUES (?, ?, 1, ?, 0, 1)
            ON DUPLICATE KEY UPDATE 
                is_platform_admin = VALUES(is_platform_admin),
                approved = VALUES(approved)
        ");
        $stmtInsertSecurity->execute([
            $userId,
            $isPlatformAdmin,
            $approved
        ]);
    }

    $pdo->commit();
    echo "Legacy profiles migration completed successfully.\n";

    // 3. Dynamically add missing columns to operational tables (e.g. leads)
    $tableColumnsToUpdate = [
        'leads' => [
            'version' => "INT(11) NOT NULL DEFAULT 1",
            'deleted_at' => "TIMESTAMP NULL DEFAULT NULL",
            'agency_id' => "INT(11) DEFAULT NULL",
            'branch_id' => "INT(11) DEFAULT NULL",
            'department_id' => "INT(11) DEFAULT NULL",
            'team_id' => "INT(11) DEFAULT NULL",
            'owner_user_id' => "VARCHAR(36) DEFAULT NULL",
            'created_by' => "VARCHAR(36) DEFAULT NULL",
            'updated_by' => "VARCHAR(36) DEFAULT NULL",
            'assigned_to' => "VARCHAR(36) DEFAULT NULL",
            'assigned_at' => "TIMESTAMP NULL DEFAULT NULL",
            'last_assigned_by' => "VARCHAR(36) DEFAULT NULL"
        ]
    ];

    echo "Updating operational table columns...\n";
    foreach ($tableColumnsToUpdate as $table => $columns) {
        // Fetch existing columns for this table
        $stmtCols = $pdo->query("SHOW COLUMNS FROM `$table`");
        $existingCols = $stmtCols->fetchAll(PDO::FETCH_COLUMN);

        foreach ($columns as $columnName => $columnDefinition) {
            if (!in_array($columnName, $existingCols)) {
                echo "Adding column `$columnName` to table `$table`...\n";
                $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$columnName` $columnDefinition");
            }
        }
        
        // Add foreign key constraint for owner_user_id and agency_id if not present
        try {
            $pdo->exec("ALTER TABLE `$table` ADD CONSTRAINT `fk_{$table}_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `profiles_new` (`id`) ON DELETE SET NULL");
            echo "Added foreign key constraint for `owner_user_id` on `$table`.\n";
        } catch (Exception $ex) {
            echo "Foreign key constraint for `owner_user_id` on `$table` already exists or skipped: " . $ex->getMessage() . "\n";
        }

        try {
            $pdo->exec("ALTER TABLE `$table` ADD CONSTRAINT `fk_{$table}_agency` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL");
            echo "Added foreign key constraint for `agency_id` on `$table`.\n";
        } catch (Exception $ex) {
            echo "Foreign key constraint for `agency_id` on `$table` already exists or skipped: " . $ex->getMessage() . "\n";
        }

        // Add index on owner/agency fields
        try {
            $pdo->exec("ALTER TABLE `$table` ADD INDEX `idx_{$table}_tenant_owner` (`agency_id`, `owner_user_id`)");
            echo "Added composite index `idx_{$table}_tenant_owner` on `$table`.\n";
        } catch (Exception $ex) {
            echo "Composite index already exists or skipped: " . $ex->getMessage() . "\n";
        }
    }

    echo "All database updates completed successfully!\n";

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "Error during migration: " . $e->getMessage() . "\n";
    exit(1);
}
?>
