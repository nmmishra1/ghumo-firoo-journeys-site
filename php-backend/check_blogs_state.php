<?php
// check_blogs_state.php - Unified diagnostic script to verify blogs tables on staging
// CLI execution check
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "Access Denied: This script can only be run via the Command Line Interface (CLI).\n";
    exit(1);
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    $host = getenv('MYSQL_HOST') ?: 'localhost';
    $dbName = getenv('MYSQL_DATABASE') ?: 'unknown';

    echo "=== BLOGS DIAGNOSTIC REPORT ===\n";
    echo "Active Host: $host\n";
    echo "Active Database: $dbName\n\n";

    // 1. Verify table counts
    echo "1. Checking table row counts:\n";
    try {
        $blogsCount = $pdo->query("SELECT COUNT(*) FROM blogs")->fetchColumn();
        echo " - blogs: $blogsCount rows\n";
    } catch (PDOException $e) {
        echo " - blogs error: " . $e->getMessage() . "\n";
    }

    try {
        $tagsCount = $pdo->query("SELECT COUNT(*) FROM blog_tags")->fetchColumn();
        echo " - blog_tags: $tagsCount rows\n";
    } catch (PDOException $e) {
        echo " - blog_tags error: " . $e->getMessage() . "\n";
    }

    // 2. Describe blogs table columns
    echo "\n2. Describing columns in 'blogs' table:\n";
    try {
        $desc = $pdo->query("DESCRIBE blogs")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($desc as $col) {
            echo " - {$col['Field']} ({$col['Type']}) Null: {$col['Null']}, Key: {$col['Key']}, Default: " . ($col['Default'] === null ? 'NULL' : $col['Default']) . "\n";
        }
    } catch (PDOException $e) {
        echo " - Describe error: " . $e->getMessage() . "\n";
    }

    // 3. Select all from blog_categories
    echo "\n3. Selecting all rows from 'blog_categories':\n";
    try {
        $cats = $pdo->query("SELECT id, slug, name FROM blog_categories")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cats as $cat) {
            echo " - ID: {$cat['id']} | Slug: {$cat['slug']} | Name: {$cat['name']}\n";
        }
    } catch (PDOException $e) {
        echo " - Blog categories error: " . $e->getMessage() . "\n";
    }

    echo "\n=== DIAGNOSTICS COMPLETED ===\n";

} catch (Exception $e) {
    echo "\nFATAL DIAGNOSTIC ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
