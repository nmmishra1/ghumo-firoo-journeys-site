<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    $action = $_GET['action'] ?? 'list';
    $slug = trim($_GET['slug'] ?? '');
    $iata = trim($_GET['iata'] ?? '');
    $search = trim($_GET['search'] ?? '');

    // 1. Single Destination Detail by URL Slug or IATA (Published ONLY)
    if ($slug || $iata || isset($_GET['id'])) {
        $id = trim($_GET['id'] ?? '');

        if ($slug) {
            $stmt = $pdo->prepare("
                SELECT d.*, s.seo_title, s.meta_description, s.keywords, s.canonical_url, s.og_image, s.schema_json
                FROM destinations d
                LEFT JOIN destination_seo s ON d.id = s.destination_id
                WHERE s.url_slug = ? AND d.status = 'Published'
            ");
            $stmt->execute([$slug]);
        } elseif ($iata) {
            $stmt = $pdo->prepare("SELECT * FROM destinations WHERE iata_code = ? AND status = 'Published'");
            $stmt->execute([$iata]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM destinations WHERE id = ? AND status = 'Published'");
            $stmt->execute([$id]);
        }

        $dest = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dest) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Published destination not found']);
            exit;
        }

        $destId = $dest['id'];

        // Fetch Published Sub-Resources with Country & State linking
        $attStmt = $pdo->prepare("SELECT * FROM attractions WHERE destination_id = ? ORDER BY priority ASC");
        $attStmt->execute([$destId]);
        $dest['attractions'] = $attStmt->fetchAll(PDO::FETCH_ASSOC);

        $actStmt = $pdo->prepare("
            SELECT a.*, c.name as category_name 
            FROM activities a 
            LEFT JOIN activity_categories c ON a.category_id = c.id 
            WHERE a.destination_id = ? AND a.status = 'Active' 
            ORDER BY a.name ASC
        ");
        $actStmt->execute([$destId]);
        $dest['activities'] = $actStmt->fetchAll(PDO::FETCH_ASSOC);

        $mediaStmt = $pdo->prepare("SELECT * FROM media_library WHERE entity_type='Destination' AND entity_id=? ORDER BY sort_order ASC");
        $mediaStmt->execute([$destId]);
        $dest['media'] = $mediaStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $dest]);
        exit;
    }

    // 2. Public Catalog List (Published ONLY)
    $query = "SELECT id, name, city, display_name, destination_type, iata_code, country_name, state_name, recommended_nights, airport, status FROM destinations WHERE status = 'Published'";
    $params = [];

    if ($search) {
        $query .= " AND (city LIKE ? OR display_name LIKE ? OR iata_code LIKE ? OR country_name LIKE ? OR state_name LIKE ?)";
        $like = "%$search%";
        $params = [$like, $like, $like, $like, $like];
    }

    $query .= " ORDER BY city ASC LIMIT 100";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'total' => count($results), 'data' => $results]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
