<?php
// get_receipt.php — Public endpoint for verifying and retrieving receipt data
// GET /php-backend/payments/get_receipt.php?payment_id=...

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db.php';

$paymentId = trim($_GET['payment_id'] ?? ($_GET['id'] ?? ''));
if (empty($paymentId)) {
    http_response_code(400);
    echo json_encode(['found' => false, 'error' => 'Payment ID is required']);
    exit;
}

$pdo = getDb();

try {
    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.lead_id,
            p.amount_received,
            p.payment_date,
            p.payment_mode,
            p.reference_number,
            p.remarks,
            p.status,
            p.created_at,
            l.customer_name,
            l.customer_email,
            l.customer_phone,
            l.destination,
            l.package_name
        FROM payments p
        LEFT JOIN leads l ON p.lead_id = l.id
        WHERE p.id = :pid OR p.reference_number = :pref
        LIMIT 1
    ");

    $stmt->execute([
        ':pid' => $paymentId,
        ':pref' => $paymentId
    ]);

    $payment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$payment) {
        http_response_code(404);
        echo json_encode(['found' => false, 'error' => 'Transaction ID not found in Ghumo Firoo ledger']);
        exit;
    }

    // Extract payer info if saved in remarks
    $remarks = $payment['remarks'] ?? '';
    $extractedName = $payment['customer_name'] ?? '';
    $extractedPhone = $payment['customer_phone'] ?? '';

    if (empty($extractedName) && preg_match('/Guest:\s*([^,)]+)/i', $remarks, $m)) {
        $extractedName = trim($m[1]);
    }
    if (empty($extractedPhone) && preg_match('/Phone:\s*([0-9+\s-]+)/i', $remarks, $m)) {
        $extractedPhone = trim($m[1]);
    }

    $isOnlineGateway = in_array(strtoupper($payment['payment_mode'] ?? ''), ['RAZORPAY', 'PAYU', 'CARD', 'NETBANKING']);

    $receiptData = [
        'found' => true,
        'id' => $payment['id'],
        'amount' => floatval($payment['amount_received'] ?? 0),
        'payment_date' => !empty($payment['created_at']) ? date('d M Y, h:i A', strtotime($payment['created_at'])) : date('d M Y', strtotime($payment['payment_date'] ?? 'now')),
        'payment_mode' => $payment['payment_mode'] ?? 'UPI',
        'reference_number' => $payment['reference_number'] ?? 'N/A',
        'remarks' => $remarks,
        'payer_name' => !empty($extractedName) ? $extractedName : 'Verified Traveler',
        'payer_email' => !empty($payment['customer_email']) ? $payment['customer_email'] : '',
        'payer_phone' => !empty($extractedPhone) ? $extractedPhone : '',
        'destination' => $payment['destination'] ?? ($payment['package_name'] ?? 'Tour Booking'),
        'status' => $payment['status'] ?? 'Success',
        'verification_type' => $isOnlineGateway ? 'ONLINE_REALIZED' : 'UPI_OFFLINE_RECONCILIATION',
        'verification_badge' => $isOnlineGateway ? 'REALIZED & CONFIRMED' : 'LOGGED • UNDER BANK CLEARANCE',
        'security_hash' => substr(hash('sha256', $payment['id'] . $payment['reference_number']), 0, 16)
    ];

    echo json_encode($receiptData);
} catch (Exception $e) {
    error_log("Receipt lookup error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['found' => false, 'error' => 'Internal database error']);
}
