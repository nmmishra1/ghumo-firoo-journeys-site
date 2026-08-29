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

$keyId = getenv('RAZORPAY_KEY_ID') ?: 'rzp_live_SlexboFyFLdaX8';
$keySecret = getenv('RAZORPAY_KEY_SECRET') ?: 'uyoKOzxi5rnikfuGAB8RoJ1L';

if (!$keyId || !$keySecret) {
    http_response_code(500);
    echo json_encode(['error' => 'Razorpay credentials not configured.']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
if (empty($payload) || empty($payload['amount'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameter: amount']);
    exit;
}

$amount = $payload['amount'];
$currency = $payload['currency'] ?? 'INR';
$receipt = $payload['receipt'] ?? ('GF-' . time());
$notes = $payload['notes'] ?? new stdClass();

$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_USERPWD => "$keyId:$keySecret",
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'amount' => $amount,
        'currency' => $currency,
        'receipt' => $receipt,
        'notes' => $notes
    ])
]);
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
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create order', 'details' => json_decode($response, true)]);
}
