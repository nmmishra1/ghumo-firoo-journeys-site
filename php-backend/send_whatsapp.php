<?php
// send_whatsapp.php — Universal WhatsApp Dispatcher for Ghumo Firoo Journeys
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
if (function_exists('loadEnvFile')) {
    loadEnvFile();
}

/**
 * Dispatches a PDF document (Quote, Itinerary, Voucher) to WhatsApp
 */
function sendWhatsAppPdf(string $phone, string $pdfUrl, string $fileName = 'GhumoFiroo_Quote.pdf', string $caption = ''): array {
    $baseUrl   = getenv('OPENWA_BASE_URL') ?: getenv('OPENWA_SERVICE_URL') ?: 'http://localhost:2785';
    $apiKey    = getenv('OPENWA_API_KEY') ?: getenv('OPENWA_API_SECRET') ?: 'ghumo_firoo_secret_wa_key_2026';
    $sessionId = getenv('OPENWA_SESSION_ID') ?: 'main';

    $sanitizedPhone = preg_replace('/[^0-9]/', '', $phone);
    $formattedPhone = (strpos($sanitizedPhone, '91') === 0 && strlen($sanitizedPhone) >= 12) ? $sanitizedPhone : "91{$sanitizedPhone}";
    $chatId = "{$formattedPhone}@c.us";

    // Detect if calling native rmyndharis/OpenWA NestJS REST API
    if (strpos($baseUrl, '/api/send-pdf') === false) {
        $url = rtrim($baseUrl, '/') . "/api/sessions/{$sessionId}/messages/send-media";
        $payload = [
            'chatId' => $chatId,
            'file'   => [
                'url'      => $pdfUrl,
                'filename' => $fileName
            ],
            'caption' => $caption ?: '📄 Here is your customized travel PDF quote from Ghumo Firoo Journeys!'
        ];
    } else {
        $url = $baseUrl;
        $payload = [
            'phone'    => $phone,
            'pdfUrl'   => $pdfUrl,
            'fileName' => $fileName,
            'caption'  => $caption
        ];
    }

    return dispatchOpenWaRequest($url, $payload, $apiKey);
}

/**
 * Dispatches a Banner / Photo to WhatsApp
 */
function sendWhatsAppImage(string $phone, string $imageUrl, string $caption = ''): array {
    $baseUrl   = getenv('OPENWA_BASE_URL') ?: getenv('OPENWA_SERVICE_URL') ?: 'http://localhost:2785';
    $apiKey    = getenv('OPENWA_API_KEY') ?: getenv('OPENWA_API_SECRET') ?: 'ghumo_firoo_secret_wa_key_2026';
    $sessionId = getenv('OPENWA_SESSION_ID') ?: 'main';

    $sanitizedPhone = preg_replace('/[^0-9]/', '', $phone);
    $formattedPhone = (strpos($sanitizedPhone, '91') === 0 && strlen($sanitizedPhone) >= 12) ? $sanitizedPhone : "91{$sanitizedPhone}";
    $chatId = "{$formattedPhone}@c.us";

    if (strpos($baseUrl, '/api/send-image') === false) {
        $url = rtrim($baseUrl, '/') . "/api/sessions/{$sessionId}/messages/send-media";
        $payload = [
            'chatId' => $chatId,
            'file'   => [
                'url'      => $imageUrl,
                'filename' => 'image.jpg'
            ],
            'caption' => $caption
        ];
    } else {
        $url = $baseUrl;
        $payload = [
            'phone'    => $phone,
            'imageUrl' => $imageUrl,
            'caption'  => $caption
        ];
    }

    return dispatchOpenWaRequest($url, $payload, $apiKey);
}

/**
 * Dispatches a text message to WhatsApp
 */
function sendWhatsAppText(string $phone, string $text): array {
    $baseUrl   = getenv('OPENWA_BASE_URL') ?: getenv('OPENWA_SERVICE_URL') ?: 'http://localhost:2785';
    $apiKey    = getenv('OPENWA_API_KEY') ?: getenv('OPENWA_API_SECRET') ?: 'ghumo_firoo_secret_wa_key_2026';
    $sessionId = getenv('OPENWA_SESSION_ID') ?: 'main';

    $sanitizedPhone = preg_replace('/[^0-9]/', '', $phone);
    $formattedPhone = (strpos($sanitizedPhone, '91') === 0 && strlen($sanitizedPhone) >= 12) ? $sanitizedPhone : "91{$sanitizedPhone}";
    $chatId = "{$formattedPhone}@c.us";

    if (strpos($baseUrl, '/api/send-text') === false) {
        $url = rtrim($baseUrl, '/') . "/api/sessions/{$sessionId}/messages/send-text";
        $payload = [
            'chatId' => $chatId,
            'text'   => $text
        ];
    } else {
        $url = $baseUrl;
        $payload = [
            'phone' => $phone,
            'text'  => $text
        ];
    }

    return dispatchOpenWaRequest($url, $payload, $apiKey);
}

function dispatchOpenWaRequest(string $url, array $payload, string $secret): array {
    if (!function_exists('curl_init')) {
        return ['success' => false, 'error' => 'cURL PHP extension is not enabled'];
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        "X-API-Key: {$secret}",
        "Authorization: Bearer {$secret}"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr  = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        return ['success' => false, 'error' => $curlErr, 'http_code' => $httpCode];
    }

    $data = json_decode($response, true);
    return [
        'success'   => ($httpCode === 200 || $httpCode === 201),
        'http_code' => $httpCode,
        'response'  => $data
    ];
}

// Handle Direct API Invocation
if (basename($_SERVER['SCRIPT_FILENAME']) === 'send_whatsapp.php' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $type  = $input['type'] ?? 'pdf';
    $phone = $input['phone'] ?? '';

    if (empty($phone)) {
        http_response_code(400);
        echo json_encode(['error' => 'Phone number is required']);
        exit;
    }

    if ($type === 'image') {
        $result = sendWhatsAppImage($phone, $input['imageUrl'] ?? '', $input['caption'] ?? '');
    } else if ($type === 'text') {
        $result = sendWhatsAppText($phone, $input['text'] ?? '');
    } else {
        $result = sendWhatsAppPdf($phone, $input['pdfUrl'] ?? '', $input['fileName'] ?? 'Quote.pdf', $input['caption'] ?? '');
    }

    echo json_encode($result);
    exit;
}
