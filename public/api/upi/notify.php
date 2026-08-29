<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../db.php';

$input = json_decode(file_get_contents('php://input'), true);
$lead_id = $input['lead_id'] ?? '';
$amount = $input['amount'] ?? 0;
$remarks = $input['remarks'] ?? 'UPI Payment';
$reference_number = $input['reference_number'] ?? '';
$email = $input['email'] ?? '';
$phone = $input['phone'] ?? '';
$name = $input['name'] ?? 'Guest';

if (!empty($email)) {
    sendPaymentReceiptEmailPHP(
        $email,
        $name,
        $amount,
        'UPI',
        $reference_number,
        $remarks
    );
}

sendAdminNotificationEmailPHP(
    $name,
    $amount,
    'UPI',
    $reference_number,
    $remarks
);

echo json_encode(['status' => 'success']);
?>
