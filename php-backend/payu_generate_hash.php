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

$payuKey = getenv('PAYU_KEY');
$payuSalt = getenv('PAYU_SALT');

if (!$payuKey || !$payuSalt) {
    http_response_code(500);
    echo json_encode(['error' => 'PayU credentials not configured.']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
if (empty($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty request body']);
    exit;
}

$amount = $payload['amount'] ?? '';
$productinfo = $payload['productinfo'] ?? '';
$firstname = $payload['firstname'] ?? '';
$email = $payload['email'] ?? '';
$phone = $payload['phone'] ?? '';
$lead_id = $payload['lead_id'] ?? '';
$purpose = $payload['purpose'] ?? 'Quick Payment';

$txnid = 'Txn' . time() . rand(1000, 9999);

$udf1 = $lead_id;
$udf2 = $purpose;
$udf3 = $email;
$udf4 = $phone;

// PayU hash format:
// key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|||||||salt
$hashString = "{$payuKey}|{$txnid}|{$amount}|{$productinfo}|{$firstname}|{$email}|{$udf1}|{$udf2}|{$udf3}|{$udf4}|||||||{$payuSalt}";
$hash = hash('sha512', $hashString);

echo json_encode([
    'key' => $payuKey,
    'txnid' => $txnid,
    'amount' => $amount,
    'productinfo' => $productinfo,
    'firstname' => $firstname,
    'email' => $email,
    'phone' => $phone,
    'udf1' => $udf1,
    'udf2' => $udf2,
    'udf3' => $udf3,
    'udf4' => $udf4,
    'hash' => $hash,
    'surl' => 'https://ghumofiroo.com/php-backend/payu_success.php',
    'furl' => 'https://ghumofiroo.com/php-backend/payu_failure.php'
]);
