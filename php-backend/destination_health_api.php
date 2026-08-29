<?php
// destination_health_api.php - Phase 3 Completeness Scoring & Health Dashboard Analytics
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();

    // ─── 1. HEALTH DASHBOARD KPIS & CHARTS ────────────────────────────────────
    $totalDest = $pdo->query("SELECT COUNT(*) FROM destinations")->fetchColumn();
    $publishedDest = $pdo->query("SELECT COUNT(*) FROM destinations WHERE status = 'Published'")->fetchColumn();
    $draftDest = $pdo->query("SELECT COUNT(*) FROM destinations WHERE status = 'Draft'")->fetchColumn();
    $aiPending = $pdo->query("SELECT COUNT(*) FROM destinations WHERE is_verified = 0 OR status = 'Draft'")->fetchColumn();

    // Actionable Gaps
    $missingImages = $pdo->query("SELECT COUNT(*) FROM destinations d WHERE (SELECT COUNT(*) FROM media_library WHERE entity_type='Destination' AND entity_id=d.id) = 0")->fetchColumn();
    $missingActivities = $pdo->query("SELECT COUNT(*) FROM destinations d WHERE (SELECT COUNT(*) FROM activities WHERE destination_id=d.id) = 0")->fetchColumn();
    $lowCompleteness = $pdo->query("SELECT COUNT(*) FROM destinations WHERE completeness_score < 70")->fetchColumn();

    // Top Countries Chart Data
    $byCountryStmt = $pdo->query("
        SELECT parent.city as country_name, COUNT(child.id) as total_destinations 
        FROM destinations child
        JOIN destinations parent ON child.parent_destination_id = parent.id
        WHERE parent.destination_type = 'Country'
        GROUP BY parent.city
        ORDER BY total_destinations DESC
        LIMIT 10
    ");
    $byCountry = $byCountryStmt->fetchAll(PDO::FETCH_ASSOC);

    // AI vs Manual Creation
    $aiVsManualStmt = $pdo->query("
        SELECT 
            SUM(CASE WHEN is_ai_generated = 1 THEN 1 ELSE 0 END) as ai_created,
            SUM(CASE WHEN is_ai_generated = 0 THEN 1 ELSE 0 END) as manual_created
        FROM destinations
    ");
    $aiVsManual = $aiVsManualStmt->fetch(PDO::FETCH_ASSOC);

    // Recent Added
    $recentStmt = $pdo->query("SELECT id, city, destination_type, iata_code, status, completeness_score, created_at FROM destinations ORDER BY created_at DESC LIMIT 5");
    $recent = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'kpis' => [
            'total' => intval($totalDest),
            'published' => intval($publishedDest),
            'draft' => intval($draftDest),
            'ai_pending' => intval($aiPending),
            'missing_images' => intval($missingImages),
            'missing_activities' => intval($missingActivities),
            'low_completeness' => intval($lowCompleteness)
        ],
        'charts' => [
            'by_country' => $byCountry,
            'ai_vs_manual' => $aiVsManual
        ],
        'recent' => $recent
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
