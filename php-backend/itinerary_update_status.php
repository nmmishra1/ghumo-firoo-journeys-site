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
$leadId = $body['lead_id'] ?? null;
$status = trim($body['status'] ?? '');

// Convert $id if passed as 0 or empty string or null
if (empty($id) && empty($leadId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing itinerary id/lead_id or status parameter']);
    exit;
}

if (strcasecmp($status, 'Booking Confirmed') === 0 || strcasecmp($status, 'Confirmed') === 0 || strcasecmp($status, 'Accepted') === 0 || strcasecmp($status, 'Converted') === 0) {
    $status = 'Booking Confirmed';
} elseif (strcasecmp($status, 'Quote Sent') === 0 || strcasecmp($status, 'Quoted') === 0 || strcasecmp($status, 'Sent') === 0) {
    $status = 'Quote Sent';
} elseif (strcasecmp($status, 'Saved') === 0) {
    $status = 'Saved';
} elseif (strcasecmp($status, 'Cancelled') === 0 || strcasecmp($status, 'Rejected') === 0 || strcasecmp($status, 'Dropped') === 0) {
    $status = 'Cancelled';
} elseif (strcasecmp($status, 'Revised') === 0) {
    $status = 'Revised';
} elseif (strcasecmp($status, 'Draft') === 0) {
    $status = 'Draft';
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid status provided. Allowed: Draft, Saved, Quote Sent, Booking Confirmed, Cancelled, Revised']);
    exit;
}

try {
    // 1. Check existing itinerary by id or lead_id
    $existing = null;
    if (!empty($id)) {
        $checkStmt = $pdo->prepare("SELECT id, lead_id, status FROM itineraries WHERE id = ? LIMIT 1");
        $checkStmt->execute([$id]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
    }

    if (!$existing && !empty($leadId)) {
        $checkStmt = $pdo->prepare("SELECT id, lead_id, status FROM itineraries WHERE lead_id = ? ORDER BY id DESC LIMIT 1");
        $checkStmt->execute([$leadId]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
    }

    $actualId = $existing['id'] ?? $id;
    $targetLeadId = $existing['lead_id'] ?? $leadId;

    if ($actualId) {
        // 2. Update status in itineraries table
        $updateStmt = $pdo->prepare("UPDATE itineraries SET status = :status, updated_at = NOW() WHERE id = :id");
        $updateStmt->execute([
            ':status' => $status,
            ':id'     => $actualId
        ]);
    }
    if ($targetLeadId) {
        $updateLeadItins = $pdo->prepare("UPDATE itineraries SET status = :status, updated_at = NOW() WHERE lead_id = :lead_id");
        $updateLeadItins->execute([
            ':status' => $status,
            ':lead_id' => $targetLeadId
        ]);
    }

    // 3. Update proposals table if matching lead_id exists
    if ($targetLeadId) {
        try {
            $propStmt = $pdo->prepare("UPDATE proposals SET status = :status, updated_at = NOW() WHERE lead_id = :lead_id");
            $propStmt->execute([':status' => $status, ':lead_id' => $targetLeadId]);
        } catch (Exception $pe) {}
    }

    // 4. Sync lead status if linked lead exists and status is Quote Sent or Booking Confirmed
    $leadUpdated = false;
    if ($targetLeadId) {
        try {
            if ($status === 'Booking Confirmed') {
                $leadStmt = $pdo->prepare("UPDATE leads SET status = 'Booking Confirmed', updated_at = NOW() WHERE id = ?");
                $leadStmt->execute([$targetLeadId]);
                $leadUpdated = true;
            } else if ($status === 'Quote Sent') {
                $leadStmt = $pdo->prepare("UPDATE leads SET status = 'Quote Sent', updated_at = NOW() WHERE id = ?");
                $leadStmt->execute([$targetLeadId]);
                $leadUpdated = true;
            }
        } catch (Exception $leadErr) {
            // Non-fatal, itinerary status was already updated
        }
    }

    echo json_encode([
        'success'      => true,
        'id'           => $actualId,
        'status'       => $status,
        'lead_id'      => $targetLeadId,
        'lead_updated' => $leadUpdated
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update itinerary status: ' . $e->getMessage()]);
}
