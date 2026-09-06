<?php
// php-backend/voucher_generate.php
//
// The authoritative server-side security gate for voucher and invoice generation:
// enforces that the dynamic advance payment (30% default benchmark) is received
// before handing back confirmed booking data for PDF document generation.
//
// GET /php-backend/voucher_generate.php?proposal_id=123&lead_id=456
//
// Returns the accepted proposal's itinerary_data (hotels, transport, activities
// with confirmation numbers, driver details, and ticket codes) for document rendering.
// Returns HTTP 403 Forbidden with shortfall calculation if advance is pending.

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';

// IP rate limit: 120 requests per minute
checkRateLimit(120, 60);

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$proposalId = intval($_GET['proposal_id'] ?? 0);
$leadId = intval($_GET['lead_id'] ?? 0);

if ($proposalId <= 0 && $leadId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'proposal_id or lead_id is required']);
    exit;
}

try {
    if ($proposalId > 0) {
        $stmt = $pdo->prepare("SELECT * FROM proposals WHERE id = ?");
        $stmt->execute([$proposalId]);
        $proposal = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM proposals WHERE lead_id = ? AND status = 'Accepted' ORDER BY id DESC LIMIT 1");
        $stmt->execute([$leadId]);
        $proposal = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    if (!$proposal) {
        http_response_code(404);
        echo json_encode(['error' => 'Accepted proposal not found for this booking']);
        exit;
    }

    if ($proposal['status'] !== 'Accepted') {
        http_response_code(409);
        echo json_encode([
            'error' => 'proposal_not_accepted', 
            'status' => $proposal['status'],
            'message' => 'Document generation requires an Accepted proposal option.'
        ]);
        exit;
    }

    $leadId = (int)$proposal['lead_id'];

    // Fetch lead details for customer info and booking status
    $leadStmt = $pdo->prepare("SELECT id, customer_name, customer_email, customer_phone, destination, status FROM leads WHERE id = ?");
    $leadStmt->execute([$leadId]);
    $lead = $leadStmt->fetch(PDO::FETCH_ASSOC) ?: [];

    // Calculate dynamic advance required:
    // If explicitly configured, use proposals.advance_required.
    // If not set (>0) and total_price > 0, dynamically default to 30% booking deposit.
    $totalPrice = (float)($proposal['total_price'] ?? 0);
    $required = (float)($proposal['advance_required'] ?? 0);
    if ($required <= 0 && $totalPrice > 0) {
        $required = round($totalPrice * 0.30, 2);
    }

    // Query all verified payments for this lead
    $stmtPay = $pdo->prepare("SELECT COALESCE(SUM(amount_received), 0) FROM payments WHERE lead_id = ? AND LOWER(TRIM(status)) IN ('success', 'completed', 'verified', 'paid', '')");
    $stmtPay->execute([$leadId]);
    $received = (float)$stmtPay->fetchColumn();

    $isBookingConfirmed = strtolower(trim($lead['status'] ?? '')) === 'booking confirmed';

    // Gate enforcement: advance received must satisfy advance_required (within 1 cent margin)
    // or lead must be explicitly marked Booking Confirmed
    if (($received + 0.01) < $required && !$isBookingConfirmed) {
        http_response_code(403);
        echo json_encode([
            'error' => 'advance_pending',
            'message' => "Advance payment pending: received ₹" . number_format($received, 2) . " of ₹" . number_format($required, 2) . " required.",
            'received' => $received,
            'required' => $required,
            'shortfall' => round($required - $received, 2),
            'total_price' => $totalPrice,
            'proposal_id' => (int)$proposal['id']
        ]);
        exit;
    }

    $itineraryData = is_string($proposal['itinerary_data']) ? json_decode($proposal['itinerary_data'], true) : ($proposal['itinerary_data'] ?? []);

    echo json_encode([
        'success' => true,
        'proposal_id' => (int)$proposal['id'],
        'lead_id' => $leadId,
        'title' => $proposal['title'],
        'total_price' => $totalPrice,
        'advance_required' => $required,
        'advance_received' => $received,
        'lead' => [
            'id' => $leadId,
            'customer_name' => $lead['customer_name'] ?? 'Valued Customer',
            'customer_email' => $lead['customer_email'] ?? '',
            'customer_phone' => $lead['customer_phone'] ?? '',
            'destination' => $lead['destination'] ?? $proposal['title'],
            'status' => $lead['status'] ?? 'Booking Confirmed'
        ],
        'itinerary_data' => is_array($itineraryData) ? $itineraryData : []
    ]);
} catch (Exception $e) {
    error_log('voucher_generate error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load voucher data: ' . $e->getMessage()]);
}
