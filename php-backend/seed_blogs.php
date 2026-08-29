<?php
// seed_blogs.php - Seeder script to insert blogs into MySQL from JSON data
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

    echo "=== DATABASE SEEDER: BLOGS ===\n";
    echo "Active Host: $host\n";
    echo "Active Database: $dbName\n\n";

    $jsonFile = __DIR__ . '/blogs_data.json';
    if (!file_exists($jsonFile)) {
        throw new Exception("Source blogs data JSON file not found: $jsonFile");
    }

    $raw = file_get_contents($jsonFile);
    $blogs = json_decode($raw, true);
    if ($blogs === null) {
        throw new Exception("Failed to decode JSON: " . json_last_error_msg());
    }

    // 1. Fetch categories to map names/slugs to IDs
    $catStmt = $pdo->query("SELECT id, slug, name FROM blog_categories");
    $dbCategories = $catStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $catSlugMap = [];
    $catNameMap = [];
    foreach ($dbCategories as $cat) {
        $catSlugMap[$cat['slug']] = $cat['id'];
        $catNameMap[strtolower($cat['name'])] = $cat['id'];
    }

    // Dynamic category mapping function
    $resolveCategoryId = function($catName) use ($catSlugMap, $catNameMap) {
        $cleanName = trim(strtolower($catName));
        
        // Simple manual overrides
        if ($cleanName === 'destinations' || $cleanName === 'pilgrimage' || $cleanName === 'guides') {
            return $catSlugMap['destination-guides'];
        }
        if ($cleanName === 'premium destinations' || $cleanName === 'luxury holidays') {
            return $catSlugMap['luxury-holidays'];
        }
        if ($cleanName === 'travel safety' || $cleanName === 'travel planning' || $cleanName === 'digital nomad') {
            return $catSlugMap['travel-tips'];
        }
        if ($cleanName === 'batumi pearls' || $cleanName === 'georgia pearls' || $cleanName === 'luxe stays' || $cleanName === 'luxury stays') {
            return $catSlugMap['hotel-reviews'];
        }
        if ($cleanName === 'adventure' || $cleanName === 'eco-tourism') {
            return $catSlugMap['adventure-travel'];
        }
        if ($cleanName === 'international') {
            return $catSlugMap['international-travel'];
        }
        
        // Match direct name
        if (isset($catNameMap[$cleanName])) {
            return $catNameMap[$cleanName];
        }

        // Fallback to Destination Guides (with warning output)
        echo " - [WARNING]: Category '{$catName}' fell through to destination-guides default.\n";
        return $catSlugMap['destination-guides'];
    };

    // 2. Begin seeding transaction
    $pdo->beginTransaction();
    
    // Clear existing blogs to avoid duplicate key conflicts (safe clean seed)
    echo "Clearing existing blogs and tags...\n";
    $pdo->exec("DELETE FROM blog_tags");
    $pdo->exec("DELETE FROM blogs");
    echo " - Success.\n";

    echo "Inserting " . count($blogs) . " blogs...\n";
    
    $ins = $pdo->prepare("INSERT INTO blogs (
        id, title, slug, excerpt, content, category_id, author, date, image, image_title, image_alt, read_time, seo_title, seo_description, seo_keywords, canonical_url, status
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Published'
    )");

    $insTag = $pdo->prepare("INSERT INTO blog_tags (blog_id, tag) VALUES (?, ?)");

    $count = 0;
    foreach ($blogs as $blog) {
        // Resolve a UUID if ID is numeric
        $id = $blog['id'];
        if (is_numeric($id) || strlen($id) < 10) {
            // Generate a deterministic UUID-like string based on slug to allow idempotency
            $id = md5($blog['slug']);
            // Format as standard UUID format: 8-4-4-4-12
            $id = sprintf('%08s-%04s-%04s-%04s-%12s',
                substr($id, 0, 8),
                substr($id, 8, 4),
                substr($id, 12, 4),
                substr($id, 16, 4),
                substr($id, 20, 12)
            );
        }

        $catId = $resolveCategoryId($blog['category']);

        $ins->execute([
            $id,
            $blog['title'],
            $blog['slug'],
            $blog['excerpt'],
            $blog['content'],
            $catId,
            $blog['author'],
            $blog['date'],
            $blog['image'],
            $blog['image_title'],
            $blog['image_alt'],
            $blog['read_time'],
            $blog['seo_title'],
            $blog['seo_description'],
            $blog['seo_keywords'],
            $blog['canonical_url']
        ]);

        // Insert tags: parse keywords as tags for simplicity
        $tags = explode(',', $blog['seo_keywords']);
        foreach ($tags as $tag) {
            $cleanTag = trim($tag);
            if (!empty($cleanTag)) {
                try {
                    $insTag->execute([$id, $cleanTag]);
                } catch (PDOException $e) {
                    // Ignore duplicate tags
                }
            }
        }

        $count++;
    }

    $pdo->commit();
    echo "\n=== SEEDING COMPLETED SUCCESSFULLY ===\n";
    echo "Inserted: $count blogs\n";

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "\nFATAL SEEDING ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
