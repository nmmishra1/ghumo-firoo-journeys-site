<?php
// quote_share.php — generates a secure share token for a quote.
// Requires a valid CRM agent JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$quoteId = trim($input['quote_id'] ?? '');
if (empty($quoteId)) {
    http_response_code(400);
    echo json_encode(['error' => 'quote_id is required']);
    exit;
}

$message = $input['message'] ?? null;
$recipientEmail = $input['recipient_email'] ?? null; // Store recipient email in sent_to_email

try {
    // Generate secure 64-char token (32 bytes hex)
    $token = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare("
        UPDATE quotes 
        SET share_token = :token,
            status = 'Shared',
            shared_at = NOW(),
            share_message = :message,
            sent_to_email = :recipient
        WHERE id = :quote_id
    ");

    $stmt->execute([
        ':token' => $token,
        ':message' => $message,
        ':recipient' => $recipientEmail,
        ':quote_id' => $quoteId
    ]);

    $baseUrl = getenv('SERVER_BASE_URL') ?: 'https://ghumofiroo.com';
    $baseUrl = rtrim($baseUrl, '/');
    $shareUrl = $baseUrl . '/quote/' . $token;

    echo json_encode([
        'success' => true,
        'share_url' => $shareUrl,
        'token' => $token
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to share quote: ' . $e->getMessage()]);
}
