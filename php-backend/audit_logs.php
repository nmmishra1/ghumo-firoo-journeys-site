<?php
// audit_logs.php — handles audit log insertion and retrieval on MySQL.
// Requires a valid Supabase session JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    if ($method === 'GET') {
        $leadIdRaw = $_GET['lead_id'] ?? '';
        $module = $_GET['record_type'] ?? $_GET['module'] ?? '';
        $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 500) : 200;

        if (!empty($leadIdRaw) && is_numeric($leadIdRaw)) {
            $stmt = $pdo->prepare('SELECT * FROM audit_logs WHERE lead_id = ? ORDER BY created_at DESC LIMIT ' . (int)$limit);
            $stmt->execute([(int)$leadIdRaw]);
        } elseif (!empty($module)) {
            $stmt = $pdo->prepare('SELECT * FROM audit_logs WHERE record_type = ? ORDER BY created_at DESC LIMIT ' . (int)$limit);
            $stmt->execute([$module]);
        } else {
            $stmt = $pdo->query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ' . (int)$limit);
        }

        $logs = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        echo json_encode(['success' => true, 'audit_logs' => $logs]);
        exit;

    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        $leadId = isset($input['lead_id']) ? (int)$input['lead_id'] : null;
        $action = trim($input['action'] ?? '');
        $userEmail = trim($input['user_email'] ?? $profile['email']);
        $userName = trim($input['user_name'] ?? $profile['full_name']);

        if ($action === '') {
            http_response_code(400);
            echo json_encode(['error' => 'action is required']);
            exit;
        }

        $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $stmt = $pdo->prepare(
            'INSERT INTO audit_logs 
                (id, lead_id, user_email, user_name, action, old_value, new_value)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $leadId,
            $userEmail,
            $userName,
            $action,
            $input['old_value'] ?? null,
            $input['new_value'] ?? null
        ]);

        echo json_encode(['success' => true, 'id' => $id]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
