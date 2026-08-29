<?php
// quote_action.php — public guest endpoint to accept, request changes, or reject a quote.
// Does NOT require authentication.

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$token = trim($input['token'] ?? '');
if (empty($token) || strlen($token) !== 64) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing share token']);
    exit;
}

$action = trim($input['action'] ?? '');
if (!in_array($action, ['accept', 'discuss', 'reject'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Action must be accept, discuss, or reject']);
    exit;
}

$message = $input['message'] ?? null;

// Function to generate a random version 4 UUID
function generateUUID() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

try {
    $pdo = getDb();

    // 1. Fetch quote by token
    $stmtQuote = $pdo->prepare("SELECT id, lead_id FROM quotes WHERE share_token = ?");
    $stmtQuote->execute([$token]);
    $quote = $stmtQuote->fetch(PDO::FETCH_ASSOC);

    if (!$quote) {
        http_response_code(404);
        echo json_encode(['error' => 'Quote not found']);
        exit;
    }

    $quoteId = $quote['id'];
    $leadId = $quote['lead_id'];

    $pdo->beginTransaction();

    // 2. Map frontend action to quote status
    $newStatus = 'Draft';
    if ($action === 'accept') {
        $newStatus = 'Accepted';
    } else if ($action === 'discuss') {
        $newStatus = 'Discussion';
    } else if ($action === 'reject') {
        $newStatus = 'Rejected';
    }

    $stmtUpdate = $pdo->prepare("UPDATE quotes SET status = ? WHERE id = ?");
    $stmtUpdate->execute([$newStatus, $quoteId]);

    // 3. Log event in lead_journey
    $journeyId = generateUUID();
    $journeyStatus = 'Quote ' . ucfirst($action); // Quote Accept / Quote Discuss / Quote Reject
    if ($action === 'discuss') {
        $journeyStatus = 'Quote Discussion Requested';
    }

    $stmtJourney = $pdo->prepare("
        INSERT INTO lead_journey (id, lead_id, status, remarks, agent)
        VALUES (?, ?, ?, ?, 'Customer')
    ");
    $stmtJourney->execute([
        $journeyId,
        $leadId,
        $journeyStatus,
        $message ? $message : ucfirst($action) . "ed by customer via quote link",
    ]);

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Failed to record quote action: ' . $e->getMessage()]);
}
