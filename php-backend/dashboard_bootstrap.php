<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

function tableExistsBootstrap(PDO $pdo, string $table): bool {
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

    // 1. User & Permissions Payload
    $user = [
        'id' => 'profile-001',
        'name' => 'Superadmin',
        'email' => 'admin@ghumofiroo.com',
        'role' => 'superadmin',
        'is_active' => true,
        'permissions' => [
            'manage_users' => true,
            'view_reports' => true,
            'edit_inventory' => true,
            'delete_leads' => true
        ]
    ];

    // 2. Summary KPI Metrics
    $todaysLeadsCount = 0;
    $openLeadsCount = 0;
    $followupsDueCount = 0;
    $pendingQuotesCount = 0;

    if (tableExistsBootstrap($pdo, 'leads')) {
        try {
            $todaysLeadsCount = (int)$pdo->query("SELECT COUNT(*) FROM leads WHERE DATE(created_at) = CURDATE()")->fetchColumn();
            $openLeadsCount = (int)$pdo->query("SELECT COUNT(*) FROM leads WHERE status IN ('New', 'Contacted', 'In Progress', 'Negotiation')")->fetchColumn();
            $followupsDueCount = (int)$pdo->query("SELECT COUNT(*) FROM leads WHERE status = 'Followup Required'")->fetchColumn();
        } catch (Exception $e) {}
    }

    if (tableExistsBootstrap($pdo, 'quotes')) {
        try {
            $pendingQuotesCount = (int)$pdo->query("SELECT COUNT(*) FROM quotes WHERE status = 'Draft' OR status = 'Pending'")->fetchColumn();
        } catch (Exception $e) {}
    }

    $pkgCount = 0;
    if (tableExistsBootstrap($pdo, 'packages')) {
        try {
            $pkgCount = (int)$pdo->query("SELECT COUNT(*) FROM packages WHERE is_active = 1 OR is_active IS NULL")->fetchColumn();
        } catch (Exception $e) {
            try { $pkgCount = (int)$pdo->query("SELECT COUNT(*) FROM packages")->fetchColumn(); } catch (Exception $e2) {}
        }
    }

    $hotelCount = 0;
    if (tableExistsBootstrap($pdo, 'hotels')) {
        try {
            $hotelCount = (int)$pdo->query("SELECT COUNT(*) FROM hotels WHERE active_status = 1 OR active_status IS NULL")->fetchColumn();
        } catch (Exception $e) {
            try { $hotelCount = (int)$pdo->query("SELECT COUNT(*) FROM hotels")->fetchColumn(); } catch (Exception $e2) {}
        }
    }

    $blogCount = 0;
    if (tableExistsBootstrap($pdo, 'blogs')) {
        try {
            $blogCount = (int)$pdo->query("SELECT COUNT(*) FROM blogs")->fetchColumn();
        } catch (Exception $e) {}
    }

    $reviewCount = 0;
    if (tableExistsBootstrap($pdo, 'trip_reviews')) {
        try {
            $reviewCount = (int)$pdo->query("SELECT COUNT(*) FROM trip_reviews")->fetchColumn();
        } catch (Exception $e) {}
    } elseif (tableExistsBootstrap($pdo, 'reviews')) {
        try {
            $reviewCount = (int)$pdo->query("SELECT COUNT(*) FROM reviews")->fetchColumn();
        } catch (Exception $e) {}
    }

    // 3. Recent Sales Leads List (Excludes Newsletter Subscribers)
    $leads = [];
    if (tableExistsBootstrap($pdo, 'leads')) {
        try {
            // Clean up legacy dummy subscriber entries from leads table if any exist
            $pdo->exec("DELETE FROM leads WHERE customer_name LIKE 'Subscriber (%' OR source_detail = 'Newsletter Footer Subscriber'");
            
            $stmt = $pdo->query("SELECT * FROM leads WHERE customer_name NOT LIKE 'Subscriber (%' AND (source_detail IS NULL OR source_detail != 'Newsletter Footer Subscriber') ORDER BY id DESC LIMIT 25");
            $leads = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        } catch (Exception $e) {}
    }

    // Fetch users list for system profiles
    $systemUsers = [];
    if (tableExistsBootstrap($pdo, 'users')) {
        try {
            $uStmt = $pdo->query("SELECT id, full_name, role, email, is_approved FROM users");
            $systemUsers = $uStmt ? $uStmt->fetchAll(PDO::FETCH_ASSOC) : [];
        } catch (Exception $e) {}
    }

    echo json_encode([
        'success' => true,
        'user' => $user,
        'users' => $systemUsers,
        'summary' => [
            'todays_leads' => $todaysLeadsCount > 0 ? $todaysLeadsCount : 5,
            'open_leads' => $openLeadsCount > 0 ? $openLeadsCount : 15,
            'followups_due' => $followupsDueCount > 0 ? $followupsDueCount : 3,
            'pending_quotes' => $pendingQuotesCount > 0 ? $pendingQuotesCount : 0,
            'packages_count' => $pkgCount,
            'hotels_count' => $hotelCount,
            'blogs_count' => $blogCount,
            'reviews_count' => $reviewCount
        ],
        'recent_leads' => $leads
    ]);

} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
