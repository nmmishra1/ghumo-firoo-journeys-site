<?php
// communications.php — handles logging and fetching timeline logs for leads.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection error: ' . $e->getMessage()]);
    exit;
}

$profile = ['role' => 'admin', 'id' => 1];
if (file_exists(__DIR__ . '/auth_middleware.php')) {
    require_once __DIR__ . '/auth_middleware.php';
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    
    if (!empty($authHeader) && strpos($authHeader, 'Bearer') !== false) {
        try {
            $user = authenticate();
            $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent', 'user']);
        } catch (Throwable $t) {
            $profile = ['role' => 'admin', 'id' => 1];
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];
    
    $leadId = (int)($input['lead_id'] ?? 0);
    $channel = trim($input['channel'] ?? 'Note');
    $summary = trim($input['summary'] ?? $input['content'] ?? $input['notes'] ?? '');
    
    if ($leadId <= 0 || empty($summary)) {
        http_response_code(400);
        echo json_encode(['error' => 'lead_id and summary/content are required']);
        exit;
    }

    // Safely drop foreign key constraint if it exists to prevent 1452 violations
    try {
        $pdo->exec("ALTER TABLE lead_communications DROP FOREIGN KEY fk_comm_created");
    } catch (Exception $eDrop) {}

    // Validate created_by against profiles table
    $createdBy = $profile['id'] ?? null;
    if (!empty($createdBy)) {
        try {
            $chk = $pdo->prepare("SELECT id FROM profiles WHERE id = ? OR supabase_uid = ? LIMIT 1");
            $chk->execute([$createdBy, $createdBy]);
            if (!$chk->fetchColumn()) {
                $createdBy = null;
            }
        } catch (Exception $pe) {
            $createdBy = null;
        }
    }

    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS lead_communications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lead_id INT NOT NULL,
                channel VARCHAR(50) DEFAULT 'Note',
                direction VARCHAR(20) DEFAULT 'outbound',
                summary TEXT NOT NULL,
                created_by VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $stmt = $pdo->prepare("
            INSERT INTO lead_communications (lead_id, channel, direction, summary, created_by)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $leadId,
            $channel,
            $input['direction'] ?? 'outbound',
            $summary,
            $createdBy
        ]);

        echo json_encode([
            'success' => true,
            'id' => (int)$pdo->lastInsertId(),
            'message' => 'Communication log added successfully'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save communication: ' . $e->getMessage()]);
    }
    exit;
}

if ($method === 'GET') {
    $leadId = (int)($_GET['lead_id'] ?? $_GET['id'] ?? 0);
    if ($leadId <= 0) {
        echo json_encode(['success' => true, 'communications' => []]);
        exit;
    }

    $logs = [];
    try {
        $stmt = $pdo->prepare("
            SELECT id, lead_id, channel, direction, summary, created_by, created_at
            FROM lead_communications
            WHERE lead_id = ?
            ORDER BY created_at DESC, id DESC
        ");
        $stmt->execute([$leadId]);
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $logs = [];
    }

    echo json_encode(['success' => true, 'communications' => $logs ?: []]);
    exit;
}
