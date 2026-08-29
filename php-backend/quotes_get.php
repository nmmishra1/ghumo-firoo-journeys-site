<?php
// quotes_get.php — returns full details of a specific quote by ID.
// Requires a valid CRM agent JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$quoteId = trim($_GET['id'] ?? '');
if (empty($quoteId)) {
    http_response_code(400);
    echo json_encode(['error' => 'id parameter is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM quotes WHERE id = ?");
    $stmt->execute([$quoteId]);
    $quote = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$quote) {
        http_response_code(404);
        echo json_encode(['error' => 'Quote not found']);
        exit;
    }

    // Decode JSON lists and objects
    $quote['total_amount'] = (float)$quote['total_amount'];
    $quote['version_number'] = (int)$quote['version_number'];
    $quote['cost_breakdown'] = $quote['cost_breakdown'] ? json_decode($quote['cost_breakdown'], true) : null;
    $quote['inclusions'] = $quote['inclusions'] ? json_decode($quote['inclusions'], true) : [];
    $quote['exclusions'] = $quote['exclusions'] ? json_decode($quote['exclusions'], true) : [];

    echo json_encode(['success' => true, 'quote' => $quote]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()]);
}
