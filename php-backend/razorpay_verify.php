<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/payment_mail_helper.php';

$keySecret = getenv('RAZORPAY_KEY_SECRET');

if (!$keySecret) {
    http_response_code(500);
    echo json_encode(['error' => 'Razorpay credentials not configured.']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
if (empty($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty request body']);
    exit;
}

$orderId = $payload['razorpay_order_id'] ?? '';
$paymentId = $payload['razorpay_payment_id'] ?? '';
$signature = $payload['razorpay_signature'] ?? '';
$leadId = $payload['lead_id'] ?? '';
$amount = floatval($payload['amount'] ?? 0);
$remarks = $payload['remarks'] ?? 'Quick Payment Link';
$email = $payload['email'] ?? '';
$phone = $payload['phone'] ?? '';
$name = $payload['name'] ?? 'Guest';

// Verify signature
$expectedSig = hash_hmac('sha256', $orderId . '|' . $paymentId, $keySecret);

if ($expectedSig !== $signature) {
    http_response_code(400);
    echo json_encode(['verified' => false, 'error' => 'Invalid signature']);
    exit;
}

try {
    $pdo = getDb();
    
    // Find lead by email/phone if lead_id is missing
    if (empty($leadId)) {
        if (!empty($email)) {
            $stmt = $pdo->prepare("SELECT id FROM leads WHERE customer_email = ? LIMIT 1");
            $stmt->execute([trim($email)]);
            $row = $stmt->fetch();
            if ($row) {
                $leadId = $row['id'];
            }
        }
        if (empty($leadId) && !empty($phone)) {
            $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
            if (strlen($cleanPhone) >= 10) {
                $last10 = substr($cleanPhone, -10);
                $stmt = $pdo->prepare("SELECT id FROM leads WHERE customer_phone LIKE ? LIMIT 1");
                $stmt->execute(["%$last10"]);
                $row = $stmt->fetch();
                if ($row) {
                    $leadId = $row['id'];
                }
            }
        }
    }
    
    // Insert payment log
    $payId = 'pay-' . time() . '-' . rand(1000, 9999);
    $payDate = date('Y-m-d');
    $gatewayCharges = $amount * 0.0236;
    
    $stmt = $pdo->prepare("
        INSERT INTO payments (id, lead_id, amount_received, payment_date, payment_mode, reference_number, remarks, status, received_by, gateway_charges)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $payId,
        !empty($leadId) ? $leadId : null,
        $amount,
        $payDate,
        'Razorpay',
        $paymentId,
        $remarks,
        'Success',
        'Online Payment',
        $gatewayCharges
    ]);
    
    // Update lead status
    if (!empty($leadId)) {
        $stmt = $pdo->prepare("UPDATE leads SET status = 'Booking Confirmed' WHERE id = ?");
        $stmt->execute([$leadId]);
    }
    
    // Send emails
    if (!empty($email)) {
        sendPaymentReceiptEmail($email, $name, $amount, 'Razorpay', $paymentId, $remarks);
    }
    sendAdminNotificationEmail($name, $amount, 'Razorpay', $paymentId, $remarks);
    
    echo json_encode(['verified' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['verified' => false, 'error' => 'Database operation failed: ' . $e->getMessage()]);
}
