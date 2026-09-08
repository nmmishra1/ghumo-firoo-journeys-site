<?php
error_reporting(0);
ini_set('display_errors', 0);
// itinerary_update_status.php — updates proposal/itinerary status and optionally syncs linked lead status.
header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

$id = $body['id'] ?? null;
$status = trim($body['status'] ?? '');

if (empty($id) || empty($status)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing itinerary id or status parameter']);
    exit;
}

$validStatuses = ['Draft', 'Saved', 'Quote Sent', 'Booking Confirmed', 'Cancelled', 'Revised'];
if (!in_array($status, $validStatuses, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid status provided. Allowed: ' . implode(', ', $validStatuses)]);
    exit;
}

try {
    // 1. Check existing itinerary
    $checkStmt = $pdo->prepare("SELECT id, lead_id, status FROM itineraries WHERE id = ? LIMIT 1");
    $checkStmt->execute([$id]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$existing) {
        http_response_code(404);
        echo json_encode(['error' => 'Itinerary not found']);
        exit;
    }

    // 2. Update status in itineraries table
    $updateStmt = $pdo->prepare("UPDATE itineraries SET status = :status, updated_at = NOW() WHERE id = :id");
    $updateStmt->execute([
        ':status' => $status,
        ':id'     => $id
    ]);

    // 3. Sync lead status if linked lead exists and status is Quote Sent or Booking Confirmed
    $leadId = $existing['lead_id'] ?? null;
    $leadUpdated = false;
    if ($leadId) {
        try {
            if ($status === 'Booking Confirmed') {
                $leadStmt = $pdo->prepare("UPDATE leads SET status = 'Booking Confirmed', updated_at = NOW() WHERE id = ?");
                $leadStmt->execute([$leadId]);
                $leadUpdated = true;
            } else if ($status === 'Quote Sent') {
                $leadStmt = $pdo->prepare("UPDATE leads SET status = 'Quote Sent', updated_at = NOW() WHERE id = ?");
                $leadStmt->execute([$leadId]);
                $leadUpdated = true;
            }
        } catch (Exception $leadErr) {
            // Non-fatal, itinerary status was already updated
        }
    }

    echo json_encode([
        'success'      => true,
        'id'           => $id,
        'status'       => $status,
        'lead_id'      => $leadId,
        'lead_updated' => $leadUpdated
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update itinerary status: ' . $e->getMessage()]);
}
