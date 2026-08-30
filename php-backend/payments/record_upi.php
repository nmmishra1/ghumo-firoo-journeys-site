<?php
// record_upi.php — Public endpoint for recording offline UPI QR payments with UTR verification
// POST /php-backend/payments/record_upi.php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../payment_mail_helper.php';

$pdo = getDb();

$payload = json_decode(file_get_contents('php://input'), true) ?? [];
if (empty($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty request body']);
    exit;
}

$name = trim($payload['name'] ?? '');
$email = trim($payload['email'] ?? '');
$phone = trim($payload['phone'] ?? '');
$amount = floatval($payload['amount'] ?? 0);
$refNo = trim($payload['reference_number'] ?? ($payload['utr'] ?? ''));
$remarks = trim($payload['remarks'] ?? 'Quick Payment Link (UPI Offline)');
$leadId = trim($payload['lead_id'] ?? '');

if (empty($name) || empty($phone)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name and Phone number are required']);
    exit;
}

if ($amount <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid payment amount is required']);
    exit;
}

if (empty($refNo) || strlen($refNo) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid UPI Transaction Reference / UTR Number is required']);
    exit;
}

// 1. Resolve Lead ID if not explicitly passed
if (empty($leadId)) {
    try {
        if (!empty($email)) {
            $stmt = $pdo->prepare("SELECT id FROM leads WHERE TRIM(customer_email) = ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$email]);
            $lead = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($lead) {
                $leadId = $lead['id'];
            }
        }
        if (empty($leadId) && !empty($phone)) {
            $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
            if (strlen($cleanPhone) >= 10) {
                $last10 = substr($cleanPhone, -10);
                $stmt = $pdo->prepare("SELECT id FROM leads WHERE customer_phone LIKE ? ORDER BY id DESC LIMIT 1");
                $stmt->execute(['%' . $last10]);
                $lead = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($lead) {
                    $leadId = $lead['id'];
                }
            }
        }
    } catch (Exception $e) {
        error_log("Lead lookup warning in record_upi: " . $e->getMessage());
    }
}

// 2. Prevent Duplicate UTR Submissions
try {
    $dupStmt = $pdo->prepare("SELECT id FROM payments WHERE reference_number = ? LIMIT 1");
    $dupStmt->execute([$refNo]);
    $existing = $dupStmt->fetch(PDO::FETCH_ASSOC);
    if ($existing) {
        echo json_encode([
            'success' => true,
            'payment_id' => $existing['id'],
            'message' => 'Payment reference already recorded previously'
        ]);
        exit;
    }
} catch (Exception $e) {
    error_log("Duplicate check warning: " . $e->getMessage());
}

// 3. Insert Payment into MySQL CRM Ledger
$paymentId = 'pay-' . time() . '-' . mt_rand(100, 999);
$paymentDate = date('Y-m-d');

try {
    $insertStmt = $pdo->prepare("
        INSERT INTO payments (
            id, 
            lead_id, 
            amount_received, 
            payment_date, 
            payment_mode, 
            reference_number, 
            remarks, 
            received_by, 
            status, 
            gateway_charges
        ) VALUES (
            :id, 
            :lead_id, 
            :amount_received, 
            :payment_date, 
            :payment_mode, 
            :reference_number, 
            :remarks, 
            :received_by, 
            :status, 
            :gateway_charges
        )
    ");

    $insertStmt->execute([
        ':id' => $paymentId,
        ':lead_id' => !empty($leadId) ? $leadId : null,
        ':amount_received' => $amount,
        ':payment_date' => $paymentDate,
        ':payment_mode' => 'UPI',
        ':reference_number' => $refNo,
        ':remarks' => $remarks . " (Guest: {$name}, Phone: {$phone})",
        ':received_by' => 'Online Payment Portal',
        ':status' => 'Success',
        ':gateway_charges' => 0.00
    ]);
} catch (Exception $e) {
    error_log("Failed to insert payment record: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error while logging payment record']);
    exit;
}

// 4. Send Automated Receipt & Admin Notification
try {
    if (!empty($email)) {
        sendPaymentReceiptEmail($email, $name, $amount, 'UPI (Offline / QR)', $refNo, $remarks);
    }
    sendAdminNotificationEmail($name, $amount, 'UPI (Offline / QR)', $refNo, $remarks . " | Phone: {$phone}");
} catch (Exception $e) {
    error_log("Failed to send notification email: " . $e->getMessage());
}

echo json_encode([
    'success' => true,
    'payment_id' => $paymentId,
    'message' => 'UPI Payment recorded successfully and CRM ledger updated'
]);
