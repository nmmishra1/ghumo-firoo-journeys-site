<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../db.php';

$key_id = getEnvVal('RAZORPAY_KEY_ID', 'rzp_live_SlexboFyFLdaX8');
$key_secret = getEnvVal('RAZORPAY_KEY_SECRET', 'uyoKOzxi5rnikfuGAB8RoJ1L');

if (empty($key_id) || empty($key_secret)) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'razorpay_not_configured']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$amount = $input['amount'] ?? 0;
$currency = $input['currency'] ?? 'INR';
$receipt = $input['receipt'] ?? ('GF-' . time());
$notes = $input['notes'] ?? new stdClass();

if ($amount <= 0) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Invalid amount']);
    exit;
}

$postData = json_encode([
    'amount' => (int)$amount,
    'currency' => $currency,
    'receipt' => $receipt,
    'notes' => $notes
]);

$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, "$key_id:$key_secret");
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $order = json_decode($response, true);
    echo json_encode([
        'id' => $order['id'],
        'amount' => $order['amount'],
        'currency' => $order['currency'],
        'receipt' => $order['receipt']
    ]);
} else {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'create_order_failed', 'details' => json_decode($response, true)]);
}
?>
