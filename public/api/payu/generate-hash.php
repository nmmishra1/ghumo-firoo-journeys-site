<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../db.php';

$payuKey = getEnvVal('PAYU_KEY', 'uid921');
$payuSalt = getEnvVal('PAYU_SALT', '9yq8nzPvIDgzqQBuuWa6udI4aBIS5c8t');
$serverBaseUrl = getEnvVal('SERVER_BASE_URL', 'https://ghumofiroo.com');

$input = json_decode(file_get_contents('php://input'), true);
$amount = $input['amount'] ?? '';
$productinfo = $input['productinfo'] ?? '';
$firstname = $input['firstname'] ?? '';
$email = $input['email'] ?? '';
$phone = $input['phone'] ?? '';

// Lead association fields
$lead_id = $input['lead_id'] ?? '';
$purpose = $input['purpose'] ?? 'PayU Payment';

if (empty($amount) || empty($productinfo) || empty($firstname) || empty($email)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Missing hash generation parameters']);
    exit;
}

$txnid = 'Txn' . time() . rand(100, 999);

// Use user-defined fields (udf) to carry transaction details to the success callback
$udf1 = $lead_id;
$udf2 = $purpose;
$udf3 = $email;
$udf4 = $phone;

// PayU Hash Format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
$hashString = "$payuKey|$txnid|$amount|$productinfo|$firstname|$email|$udf1|$udf2|$udf3|$udf4|||||||$payuSalt";
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
    'surl' => "$serverBaseUrl/api/payu/success.php",
    'furl' => "$serverBaseUrl/api/payu/failure.php"
]);
?>
