<?php
// create_order.php — handles secure order creation with Razorpay
// POST /php-backend/payments/create_order.php

header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

// 2. Load Razorpay Credentials
$keyId = getenv('RAZORPAY_KEY_ID') ?: '';
$keySecret = getenv('RAZORPAY_KEY_SECRET') ?: '';

if (empty($keyId) || empty($keySecret)) {
    http_response_code(500);
    echo json_encode(['error' => 'Razorpay keys are not configured on the server']);
    exit;
}

// 3. Parse input
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$amount = isset($input['amount']) ? (int)$input['amount'] : 0;
$currency = isset($input['currency']) ? trim($input['currency']) : 'INR';
$receipt = isset($input['receipt']) ? trim($input['receipt']) : 'GF-' . time();
$notes = isset($input['notes']) && is_array($input['notes']) ? $input['notes'] : [];

if ($amount <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid amount is required']);
    exit;
}

// 4. Call Razorpay API using cURL
$ch = curl_init('https://api.razorpay.com/v1/orders');
$payload = json_encode([
    'amount' => $amount,
    'currency' => $currency,
    'receipt' => $receipt,
    'notes' => $notes
]);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_USERPWD, "$keyId:$keySecret");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to reach payment gateway', 'details' => $curlError]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Order creation failed', 'details' => json_decode($response, true)]);
    exit;
}

// Return order response to frontend
echo $response;
