<?php
// booking_converter.php - Convert Quote Version to Confirmed Booking
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$quoteVersionId = $input['quote_version_id'] ?? null;
$invoiceAmount = floatval($input['invoice_amount'] ?? 0.00);
$changedBy = $input['changed_by'] ?? 'System Agent';

if (!$quoteVersionId || $invoiceAmount <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing quote_version_id or invoice_amount']);
    exit;
}

try {
    $pdo = getDb();
    
    // Start transaction
    $pdo->beginTransaction();

    // 1. Verify quote version exists and get details
    $stmt = $pdo->prepare("
        SELECT qv.*, qh.quote_number, qh.opportunity_id 
        FROM quote_versions qv
        JOIN quote_headers qh ON qv.quote_header_id = qh.id
        WHERE qv.id = ?
    ");
    $stmt->execute([$quoteVersionId]);
    $version = $stmt->fetch();

    if (!$version) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'Quote version not found']);
        exit;
    }

    // 2. Generate Unique Booking Reference & Invoice Number
    $bookingRef = 'BK-2026-' . strtoupper(bin2hex(random_bytes(4)));
    $invoiceNum = 'INV-2026-' . strtoupper(bin2hex(random_bytes(4)));

    // 3. Create Booking Record
    $stmt = $pdo->prepare("
        INSERT INTO bookings (quote_version_id, booking_reference, status, invoice_number, invoice_amount)
        VALUES (?, ?, 'Confirmed', ?, ?)
    ");
    $stmt->execute([$quoteVersionId, $bookingRef, $invoiceNum, $invoiceAmount]);
    $bookingId = $pdo->lastInsertId();

    // 4. Update Quote Header status to Accepted and Decision Status to Confirmed
    $stmt = $pdo->prepare("
        UPDATE quote_headers 
        SET status = 'Accepted', customer_decision = 'Confirmed'
        WHERE id = ?
    ");
    $stmt->execute([$version['quote_header_id']]);

    // 5. Update Opportunity stage to Confirmed / Closed Won
    $stmt = $pdo->prepare("
        UPDATE opportunities 
        SET stage = 'Confirmed', probability = 100
        WHERE id = ?
    ");
    $stmt->execute([$version['opportunity_id']]);

    // 6. Write Audit Log
    $stmt = $pdo->prepare("
        INSERT INTO audit_logs (record_type, record_id, field, old_value, new_value, changed_by)
        VALUES ('quote_version', ?, 'status', 'Ready', 'Accepted', ?)
    ");
    $stmt->execute([$quoteVersionId, $changedBy]);

    // Commit transaction
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'booking_id' => $bookingId,
        'booking_reference' => $bookingRef,
        'invoice_number' => $invoiceNum,
        'status' => 'Confirmed'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Failed to convert quote to booking: ' . $e->getMessage()]);
}
