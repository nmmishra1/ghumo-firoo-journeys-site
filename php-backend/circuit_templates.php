<?php
// circuit_templates.php — persistent MySQL API for Quick Circuit Templates
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, name, category, stops, created_by, created_at FROM circuit_templates ORDER BY id DESC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $templates = array_map(function($r) {
            return [
                'id' => (int)$r['id'],
                'name' => $r['name'],
                'category' => $r['category'],
                'stops' => is_string($r['stops']) ? json_decode($r['stops'], true) : ($r['stops'] ?: []),
                'created_by' => $r['created_by'],
                'created_at' => $r['created_at']
            ];
        }, $rows);

        echo json_encode(['success' => true, 'templates' => $templates]);
        exit;
    }

    if ($method === 'POST' || $method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $name = trim($input['name'] ?? '');
        $category = trim($input['category'] ?? 'domestic');
        $stops = $input['stops'] ?? [];

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Template name is required']);
            exit;
        }

        if (empty($stops) || !is_array($stops)) {
            http_response_code(400);
            echo json_encode(['error' => 'Stops list is required']);
            exit;
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("UPDATE circuit_templates SET name = ?, category = ?, stops = ? WHERE id = ?");
            $stmt->execute([$name, $category, json_encode($stops), $id]);
            echo json_encode([
                'success' => true,
                'template' => [
                    'id' => $id,
                    'name' => $name,
                    'category' => $category,
                    'stops' => $stops
                ]
            ]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO circuit_templates (name, category, stops, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->execute([$name, $category, json_encode($stops)]);
        $newId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'template' => [
                'id' => (int)$newId,
                'name' => $name,
                'category' => $category,
                'stops' => $stops
            ]
        ]);
        exit;
    }

    if ($method === 'DELETE') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM circuit_templates WHERE id = ?");
            $stmt->execute([$id]);
        }
        echo json_encode(['success' => true]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
