<?php
// follow_ups_create.php — schedules / logs a follow-up in MySQL database.
// Requires a valid Supabase session JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$input = json_decode(file_get_contents('php://input'), true);

$leadId = isset($input['lead_id']) ? (int)$input['lead_id'] : 0;
$followUpDate = isset($input['follow_up_date']) ? trim($input['follow_up_date']) : '';

if ($leadId <= 0 || $followUpDate === '') {
    http_response_code(400);
    echo json_encode(['error' => 'lead_id and follow_up_date are required']);
    exit;
}

try {
    // 1. Verify lead existence and access
    $leadStmt = $pdo->prepare('SELECT assigned_to, created_by FROM leads WHERE id = ? AND is_deleted = 0');
    $leadStmt->execute([$leadId]);
    $lead = $leadStmt->fetch();
    
    if (!$lead) {
        http_response_code(404);
        echo json_encode(['error' => 'Lead not found']);
        exit;
    }

    if ($profile['role'] === 'agent') {
        if ($lead['assigned_to'] !== $profile['id'] && $lead['created_by'] !== $profile['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'You do not have permission to schedule follow-ups for this lead']);
            exit;
        }
    }

    // 2. Generate UUID for follow-up record
    $fuId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    $followUpDateFormatted = date('Y-m-d H:i:s', strtotime($followUpDate));
    $callStatus = isset($input['call_status']) ? trim($input['call_status']) : null;
    
    // Check enum constraint for lead_quality: 'Hot' | 'Warm' | 'Cold'
    $leadQuality = isset($input['lead_quality']) ? trim($input['lead_quality']) : null;
    $allowedQuality = ['Hot', 'Warm', 'Cold'];
    if ($leadQuality !== null && !in_array($leadQuality, $allowedQuality, true)) {
        $leadQuality = null;
    }

    $notes = isset($input['notes']) ? trim($input['notes']) : null;
    $createdBy = isset($input['created_by']) ? trim($input['created_by']) : $profile['id'];

    // 3. Insert follow-up record
    $stmt = $pdo->prepare(
        'INSERT INTO follow_ups 
            (id, lead_id, follow_up_date, call_status, lead_quality, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $fuId,
        $leadId,
        $followUpDateFormatted,
        $callStatus,
        $leadQuality,
        $notes,
        $createdBy
    ]);

    // 4. Update the main leads table follow_up_date column as well to keep them in sync
    $leadUpStmt = $pdo->prepare('UPDATE leads SET follow_up_date = ?, updated_at = NOW() WHERE id = ?');
    $leadUpStmt->execute([$followUpDateFormatted, $leadId]);

    echo json_encode(['success' => true, 'follow_up_id' => $fuId]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save follow-up: ' . $e->getMessage()]);
}
