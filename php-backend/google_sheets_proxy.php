<?php
// google_sheets_proxy.php — Server-side relay for Google Apps Script Web App.
// Eliminates browser CORS redirect errors (script.googleusercontent.com/echo).

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents('php://input');

if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(['result' => 'error', 'message' => 'Empty payload']);
    exit;
}

$googleSheetsUrl = 'https://script.google.com/macros/s/AKfycby8wmvdOiDM66U9RrK9XRV5ndskA8x-0ORVTvwd7JP308RhlZSCBDp5HJu8gJvGsHv5XQ/exec';

// Use cURL with automatic redirect follow (to handle script.googleusercontent.com seamlessly)
$ch = curl_init($googleSheetsUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $rawInput,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_TIMEOUT => 12,
    CURLOPT_CONNECTTIMEOUT => 6,
    CURLOPT_HTTPHEADER => [
        'Content-Type: text/plain;charset=utf-8'
    ],
    CURLOPT_SSL_VERIFYPEER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || !empty($curlError)) {
    // If cURL failed, log and return graceful error
    http_response_code(502);
    echo json_encode([
        'result' => 'error',
        'message' => 'Failed to reach Google Apps Script: ' . ($curlError ?: 'Unknown network error')
    ]);
    exit;
}

// Decode and return Google Apps Script response
$decoded = json_decode($response, true);
if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
    echo json_encode($decoded);
} else {
    echo json_encode([
        'result' => 'success',
        'raw' => $response
    ]);
}
