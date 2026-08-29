<?php
// leads_delete.php — soft-deletes a lead in the MySQL database.
// Requires a valid Supabase session JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$input = json_decode(file_get_contents('php://input'), true);

$leadId = isset($input['id']) ? (int)$input['id'] : 0;
if ($leadId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid id is required']);
    exit;
}

try {
    // Schema defines is_deleted column for soft delete. Let's update that along with updated_at.
    $stmt = $pdo->prepare('UPDATE leads SET is_deleted = 1, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$leadId]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete lead from database: ' . $e->getMessage()]);
}
