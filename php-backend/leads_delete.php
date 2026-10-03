<?php
// leads_delete.php — soft-deletes a lead in the MySQL database.
// Requires a valid Supabase session JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$input = json_decode(file_get_contents('php://input'), true);

$leadId = isset($input['id']) ? (int)$input['id'] : 0;
if ($leadId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid id is required']);
    exit;
}

try {
    // 1. Check if lead has confirmed booking, confirmed itinerary, accepted proposal, or recorded payments
    $checkStmt = $pdo->prepare("
        SELECT 
            l.id,
            l.customer_name,
            l.status,
            (SELECT COUNT(*) FROM itineraries WHERE lead_id = l.id AND (status = 'Booking Confirmed' OR status = 'Confirmed')) as confirmed_itin_count,
            (SELECT COUNT(*) FROM proposals WHERE lead_id = l.id AND status = 'Accepted') as accepted_prop_count,
            (SELECT COUNT(*) FROM payments WHERE lead_id = l.id) as payment_count
        FROM leads l
        WHERE l.id = ?
    ");
    $checkStmt->execute([$leadId]);
    $leadInfo = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($leadInfo) {
        $isConfirmed = in_array($leadInfo['status'], ['Booking Confirmed', 'Voucher Issued', 'Booked (Advance Pending)']) 
            || (int)$leadInfo['confirmed_itin_count'] > 0 
            || (int)$leadInfo['accepted_prop_count'] > 0
            || (int)$leadInfo['payment_count'] > 0;
            
        if ($isConfirmed) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => "Cannot delete Lead #{$leadId} (" . ($leadInfo['customer_name'] ?? 'Customer') . "): This lead has a confirmed itinerary proposal chosen by the customer. Confirmed bookings are permanently locked to preserve operational vouchers and financial audit trails.",
                'is_confirmed' => true,
                'code' => 'LEAD_CONFIRMED_PROTECTED'
            ]);
            exit;
        }
    }

    // 2. Schema defines is_deleted column for soft delete. Let's update that along with updated_at.
    $stmt = $pdo->prepare('UPDATE leads SET is_deleted = 1, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$leadId]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete lead from database: ' . $e->getMessage()]);
}
