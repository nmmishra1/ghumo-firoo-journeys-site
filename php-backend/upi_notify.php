<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/payment_mail_helper.php';

$payload = json_decode(file_get_contents('php://input'), true);
if (empty($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty request body']);
    exit;
}

$leadId = $payload['lead_id'] ?? '';
$amount = floatval($payload['amount'] ?? 0);
$remarks = $payload['remarks'] ?? 'UPI Offline Payment';
$refNo = $payload['reference_number'] ?? '';
$email = $payload['email'] ?? '';
$phone = $payload['phone'] ?? '';
$name = $payload['name'] ?? 'Guest';

if (!empty($email)) {
    sendPaymentReceiptEmail($email, $name, $amount, 'UPI (Offline)', $refNo, $remarks);
}
sendAdminNotificationEmail($name, $amount, 'UPI (Offline)', $refNo, $remarks);

echo json_encode(['success' => true]);
