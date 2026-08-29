<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

function tableExistsDash(PDO $pdo, string $table): bool {
    static $cache = [];
    if (!isset($cache[$table])) {
        try {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
            $stmt->execute([$table]);
            $cache[$table] = (int)$stmt->fetchColumn() > 0;
        } catch (Exception $e) {
            $cache[$table] = false;
        }
    }
    return $cache[$table];
}

try {
    $pdo = getDb();
    
    // Fast COUNT queries ONLY (No extra hotel or package array loads)
    $pkgCount = 0;
    if (tableExistsDash($pdo, 'packages')) {
        try {
            $pkgCount = (int)$pdo->query("SELECT COUNT(*) FROM packages WHERE is_active = 1 OR is_active IS NULL")->fetchColumn();
        } catch (Exception $e) {
            try { $pkgCount = (int)$pdo->query("SELECT COUNT(*) FROM packages")->fetchColumn(); } catch (Exception $e2) {}
        }
    }

    $hotelCount = 0;
    if (tableExistsDash($pdo, 'hotels')) {
        try {
            $hotelCount = (int)$pdo->query("SELECT COUNT(*) FROM hotels WHERE active_status = 1 OR active_status IS NULL")->fetchColumn();
        } catch (Exception $e) {
            try { $hotelCount = (int)$pdo->query("SELECT COUNT(*) FROM hotels")->fetchColumn(); } catch (Exception $e2) {}
        }
    }

    $blogCount = 0;
    if (tableExistsDash($pdo, 'blogs')) {
        try {
            $blogCount = (int)$pdo->query("SELECT COUNT(*) FROM blogs")->fetchColumn();
        } catch (Exception $e) {}
    }

    $reviewCount = 0;
    if (tableExistsDash($pdo, 'trip_reviews')) {
        try {
            $reviewCount = (int)$pdo->query("SELECT COUNT(*) FROM trip_reviews")->fetchColumn();
        } catch (Exception $e) {}
    } elseif (tableExistsDash($pdo, 'reviews')) {
        try {
            $reviewCount = (int)$pdo->query("SELECT COUNT(*) FROM reviews")->fetchColumn();
        } catch (Exception $e) {}
    }

    echo json_encode([
        'success'        => true,
        'packages_count' => $pkgCount,
        'hotels_count'   => $hotelCount,
        'blogs_count'    => $blogCount,
        'reviews_count'  => $reviewCount
    ]);

} catch (Throwable $e) {
    echo json_encode([
        'success'        => true,
        'packages_count' => 0,
        'hotels_count'   => 0,
        'blogs_count'    => 0,
        'reviews_count'  => 0
    ]);
}
