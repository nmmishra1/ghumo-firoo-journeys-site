<?php
// quote_view.php — public guest endpoint to fetch shared quote details by token.
// Does NOT require authentication.

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$token = trim($_GET['token'] ?? '');
if (empty($token)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing share token', 'code' => 400]);
    exit;
}

try {
    $pdo = getDb();

    // 1. Fetch quote details joined with lead details (LEFT JOIN to allow quotes without leads)
    $stmt = $pdo->prepare("
        SELECT q.*, COALESCE(l.customer_name, 'Valued Client') as customer_name, l.customer_phone, l.customer_email
        FROM quotes q
        LEFT JOIN leads l ON q.lead_id = l.id
        WHERE q.share_token = ? OR q.id = ?
    ");
    $stmt->execute([$token, $token]);
    $quote = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$quote) {
        http_response_code(404);
        echo json_encode(['error' => 'Quote proposal not found or invalid link.', 'code' => 404]);
        exit;
    }

    // 2. Check if quote has expired
    if (!empty($quote['expires_at'])) {
        $expiryTime = strtotime($quote['expires_at']);
        if ($expiryTime < time()) {
            http_response_code(410);
            echo json_encode(['error' => 'Quote has expired', 'code' => 410]);
            exit;
        }
    }

    // 3. Mark status as 'Viewed' on the first customer view
    if ($quote['status'] === 'Shared') {
        $stmtUpdate = $pdo->prepare("
            UPDATE quotes 
            SET status = 'Viewed',
                viewed_at = NOW()
            WHERE id = ?
        ");
        $stmtUpdate->execute([$quote['id']]);
        $quote['status'] = 'Viewed';
        $quote['viewed_at'] = date('Y-m-d H:i:s');
    }

    // Format output
    $quote['total_amount'] = (float)$quote['total_amount'];
    $quote['version_number'] = (int)$quote['version_number'];
    $quote['cost_breakdown'] = $quote['cost_breakdown'] ? json_decode($quote['cost_breakdown'], true) : null;
    $quote['inclusions'] = $quote['inclusions'] ? json_decode($quote['inclusions'], true) : [];
    $quote['exclusions'] = $quote['exclusions'] ? json_decode($quote['exclusions'], true) : [];

    echo json_encode(['success' => true, 'quote' => $quote]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
