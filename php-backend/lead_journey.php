<?php
// lead_journey.php — handles lead journey event logging and retrieval in MySQL.
// Requires a valid Supabase session JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent', 'user']);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    if ($method === 'GET') {
        $leadId = isset($_GET['lead_id']) ? (int)$_GET['lead_id'] : 0;
        
        if ($leadId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'lead_id query parameter is required']);
            exit;
        }

        $stmt = $pdo->prepare('SELECT * FROM lead_journey WHERE lead_id = ? ORDER BY timestamp DESC');
        $stmt->execute([$leadId]);
        $journey = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'journey' => $journey]);

    } elseif ($method === 'POST') {
        // Only staff roles can add journey events
        $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);
        
        $input = json_decode(file_get_contents('php://input'), true);

        $leadId = isset($input['lead_id']) ? (int)$input['lead_id'] : 0;
        $status = trim($input['status'] ?? '');
        
        if ($leadId <= 0 || $status === '') {
            http_response_code(400);
            echo json_encode(['error' => 'lead_id and status are required']);
            exit;
        }

        $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $agent = trim($input['agent'] ?? $profile['full_name']);

        $stmt = $pdo->prepare(
            'INSERT INTO lead_journey (id, lead_id, status, remarks, agent)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $leadId,
            $status,
            $input['remarks'] ?? null,
            $agent
        ]);

        echo json_encode(['success' => true, 'id' => $id]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
