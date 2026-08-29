<?php
// quotes_list.php — returns version history of all quotes associated with a lead (or all quotes globally).
// Requires a valid CRM agent JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$leadId = isset($_GET['lead_id']) ? (int)$_GET['lead_id'] : 0;

try {
    if ($leadId > 0) {
        $stmt = $pdo->prepare("
            SELECT q.*, l.customer_name, l.customer_phone
            FROM quotes q
            JOIN leads l ON q.lead_id = l.id
            WHERE q.lead_id = ? 
            ORDER BY q.created_at DESC, q.version_number DESC
        ");
        $stmt->execute([$leadId]);
    } else {
        $stmt = $pdo->query("
            SELECT q.*, l.customer_name, l.customer_phone
            FROM quotes q
            JOIN leads l ON q.lead_id = l.id
            ORDER BY q.created_at DESC, q.version_number DESC
        ");
    }
    
    $quotes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Cast total_amount to float and version_number to int
    foreach ($quotes as &$q) {
        $q['total_amount'] = (float)$q['total_amount'];
        $q['version_number'] = (int)$q['version_number'];
        $q['cost_breakdown'] = $q['cost_breakdown'] ? json_decode($q['cost_breakdown'], true) : null;
        $q['inclusions'] = $q['inclusions'] ? json_decode($q['inclusions'], true) : [];
        $q['exclusions'] = $q['exclusions'] ? json_decode($q['exclusions'], true) : [];
    }

    echo json_encode(['success' => true, 'quotes' => $quotes]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()]);
}
