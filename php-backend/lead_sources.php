<?php
// lead_sources.php — CRUD API for Dynamic Lead Sources in MySQL

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, source_name, category, is_active, created_at FROM lead_sources ORDER BY is_active DESC, source_name ASC");
        $sources = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'sources' => $sources]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $sourceName = trim($input['source_name'] ?? '');
        $category = trim($input['category'] ?? 'digital');

        if (empty($sourceName)) {
            http_response_code(400);
            echo json_encode(['error' => 'Source name is required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO lead_sources (source_name, category, is_active) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE is_active = 1");
        $stmt->execute([$sourceName, $category]);

        echo json_encode(['success' => true, 'message' => 'Lead source added successfully']);
        exit;
    }

    if ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if ($id > 0) {
            $stmt = $pdo->prepare("UPDATE lead_sources SET is_active = ? WHERE id = ?");
            $stmt->execute([$isActive, $id]);
        }
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM lead_sources WHERE id = ?");
            $stmt->execute([$id]);
        }
        echo json_encode(['success' => true]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
