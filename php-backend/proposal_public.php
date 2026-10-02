<?php
// php-backend/proposal_public.php
// Public endpoint for clients/guests to view proposal options and 1-click accept their chosen package.
// Accessible without CRM agent authentication.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';

// Rate limit: 120 calls per minute
checkRateLimit(120, 60);

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $leadId = isset($_GET['lead_id']) ? intval($_GET['lead_id']) : 0;
    $proposalId = isset($_GET['proposal_id']) ? intval($_GET['proposal_id']) : 0;

    if ($leadId <= 0 && $proposalId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'A valid lead_id or proposal_id is required']);
        exit();
    }

    try {
        // 1. Fetch Lead
        $lead = null;
        if ($leadId > 0) {
            $stmt = $pdo->prepare("SELECT id, customer_name, customer_email, customer_phone, email, contact_number, destination, destinations, trip_start_date, trip_end_date, adult_count, child_count, infant_count, status, enquiry_number, created_at FROM leads WHERE id = ? LIMIT 1");
            $stmt->execute([$leadId]);
            $lead = $stmt->fetch(PDO::FETCH_ASSOC);
        } else if ($proposalId > 0) {
            $stmt = $pdo->prepare("SELECT l.id, l.customer_name, l.customer_email, l.customer_phone, l.email, l.contact_number, l.destination, l.destinations, l.trip_start_date, l.trip_end_date, l.adult_count, l.child_count, l.infant_count, l.status, l.enquiry_number, l.created_at FROM proposals p JOIN leads l ON p.lead_id = l.id WHERE p.id = ? LIMIT 1");
            $stmt->execute([$proposalId]);
            $lead = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($lead) {
                $leadId = (int)$lead['id'];
            }
        }

        if (!$lead) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Proposal request not found']);
            exit();
        }

        // Standardize customer contact
        $customerName = trim($lead['customer_name'] ?? '');
        if (empty($customerName) || strcasecmp($customerName, 'Valued Client') === 0) {
            $customerName = 'Valued Guest';
        }

        // 2. Fetch Proposals Options
        $propStmt = $pdo->prepare("SELECT id, option_number, option_name, title, total_price, price_per_person, advance_required, currency, status, expiry_date, payment_schedule, itinerary_data, created_at FROM proposals WHERE lead_id = ? ORDER BY option_number ASC, id ASC");
        $propStmt->execute([$leadId]);
        $proposals = $propStmt->fetchAll(PDO::FETCH_ASSOC);

        $hasAccepted = false;
        $acceptedOption = null;

        foreach ($proposals as &$p) {
            $p['payment_schedule'] = is_string($p['payment_schedule']) ? json_decode($p['payment_schedule'], true) : ($p['payment_schedule'] ?? []);
            $p['itinerary_data'] = is_string($p['itinerary_data']) ? json_decode($p['itinerary_data'], true) : ($p['itinerary_data'] ?? []);
            $p['total_price'] = (float)($p['total_price'] ?? 0);
            $p['price_per_person'] = (float)($p['price_per_person'] ?? 0);
            $p['advance_required'] = (float)($p['advance_required'] ?? 0) > 0 ? (float)$p['advance_required'] : round($p['total_price'] * 0.30, 2);

            if (strcasecmp($p['status'], 'Accepted') === 0) {
                $hasAccepted = true;
                $acceptedOption = $p;
            }
        }
        unset($p);

        // 3. Fetch Master Itinerary if available
        $itinStmt = $pdo->prepare("SELECT * FROM itineraries WHERE lead_id = ? ORDER BY id DESC LIMIT 1");
        $itinStmt->execute([$leadId]);
        $itinerary = $itinStmt->fetch(PDO::FETCH_ASSOC);

        $days = [];
        if ($itinerary && !empty($itinerary['id'])) {
            $daysStmt = $pdo->prepare("SELECT * FROM itinerary_days WHERE itinerary_id = ? ORDER BY day_number ASC");
            $daysStmt->execute([$itinerary['id']]);
            $rawDays = $daysStmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rawDays as $rd) {
                $meta = is_string($rd['metadata']) ? json_decode($rd['metadata'], true) : ($rd['metadata'] ?? []);
                $days[] = [
                    'day_number'   => (int)$rd['day_number'],
                    'date'         => $rd['date'],
                    'title'        => $rd['title'] ?: "Day {$rd['day_number']}",
                    'description'  => $rd['description'] ?: '',
                    'destination'  => $rd['destination'] ?: '',
                    'hotel_name'   => $rd['hotel_name'] ?: '',
                    'room_type'    => $rd['room_type'] ?: '',
                    'meal_plan'    => $rd['meal_plan'] ?: '',
                    'blocks'       => $meta['blocks'] ?? []
                ];
            }
        }

        // 4. Check payments received
        $payStmt = $pdo->prepare("SELECT COALESCE(SUM(amount_received), 0) FROM payments WHERE lead_id = ? AND LOWER(TRIM(status)) IN ('success', 'completed', 'verified', 'paid')");
        $payStmt->execute([$leadId]);
        $paymentsReceived = (float)$payStmt->fetchColumn();

        $isLeadConfirmed = strcasecmp(trim($lead['status'] ?? ''), 'Booking Confirmed') === 0;

        echo json_encode([
            'success' => true,
            'lead' => [
                'id'              => (int)$lead['id'],
                'customer_name'   => $customerName,
                'destination'     => $lead['destination'] ?: ($lead['destinations'] ?: 'Customized Tour'),
                'trip_start_date' => $lead['trip_start_date'],
                'trip_end_date'   => $lead['trip_end_date'],
                'adult_count'     => (int)($lead['adult_count'] ?? 2),
                'child_count'     => (int)($lead['child_count'] ?? 0),
                'infant_count'    => (int)($lead['infant_count'] ?? 0),
                'status'          => $lead['status'] ?? 'Draft',
                'is_confirmed'    => $isLeadConfirmed || $hasAccepted
            ],
            'itinerary' => $itinerary ? [
                'id'              => $itinerary['id'],
                'itinerary_name'  => $itinerary['itinerary_name'] ?: 'Customized Luxury Tour',
                'destinations'    => is_string($itinerary['destinations']) ? json_decode($itinerary['destinations'], true) : ($itinerary['destinations'] ?? []),
                'total_nights'    => (int)($itinerary['total_nights'] ?? 0),
                'total_cost'      => (float)($itinerary['final_cost'] ?: $itinerary['total_cost']),
                'days'            => $days
            ] : null,
            'proposals'          => $proposals,
            'has_accepted'       => $hasAccepted,
            'accepted_option'    => $acceptedOption,
            'payments_received'  => $paymentsReceived,
            'is_advance_paid'    => $paymentsReceived > 0
        ]);
        exit();

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to load proposal details: ' . $e->getMessage()]);
        exit();
    }
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    $action = $body['action'] ?? '';
    $leadId = isset($body['lead_id']) ? intval($body['lead_id']) : 0;
    $proposalId = isset($body['proposal_id']) ? intval($body['proposal_id']) : 0;
    $optionName = trim($body['option_name'] ?? '');

    if ($action !== 'accept') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Unsupported action']);
        exit();
    }

    if ($leadId <= 0 && $proposalId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing lead_id or proposal_id']);
        exit();
    }

    try {
        // Find proposal to accept
        $targetProposal = null;
        if ($proposalId > 0) {
            $stmt = $pdo->prepare("SELECT * FROM proposals WHERE id = ? LIMIT 1");
            $stmt->execute([$proposalId]);
            $targetProposal = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($targetProposal) {
                $leadId = (int)$targetProposal['lead_id'];
            }
        }

        if (!$targetProposal && $leadId > 0) {
            if (!empty($optionName)) {
                $stmt = $pdo->prepare("SELECT * FROM proposals WHERE lead_id = ? AND (option_name = ? OR option_number = ?) LIMIT 1");
                $stmt->execute([$leadId, $optionName, filter_var($optionName, FILTER_SANITIZE_NUMBER_INT)]);
                $targetProposal = $stmt->fetch(PDO::FETCH_ASSOC);
            }
            if (!$targetProposal) {
                $stmt = $pdo->prepare("SELECT * FROM proposals WHERE lead_id = ? ORDER BY option_number ASC LIMIT 1");
                $stmt->execute([$leadId]);
                $targetProposal = $stmt->fetch(PDO::FETCH_ASSOC);
            }
        }

        if ($targetProposal) {
            $acceptedId = $targetProposal['id'];
            // 1. Mark this proposal as Accepted
            $updStmt = $pdo->prepare("UPDATE proposals SET status = 'Accepted', updated_at = NOW() WHERE id = ?");
            $updStmt->execute([$acceptedId]);

            // 2. Mark other options as Archived
            $archStmt = $pdo->prepare("UPDATE proposals SET status = 'Archived', updated_at = NOW() WHERE lead_id = ? AND id != ?");
            $archStmt->execute([$leadId, $acceptedId]);
        }

        // 3. Update Lead status to 'Booking Confirmed'
        if ($leadId > 0) {
            $leadStmt = $pdo->prepare("UPDATE leads SET status = 'Booking Confirmed', updated_at = NOW() WHERE id = ?");
            $leadStmt->execute([$leadId]);

            // 4. Update Itinerary status to 'Booking Confirmed'
            $itinStmt = $pdo->prepare("UPDATE itineraries SET status = 'Booking Confirmed', updated_at = NOW() WHERE lead_id = ?");
            $itinStmt->execute([$leadId]);
        }

        echo json_encode([
            'success'       => true,
            'message'       => 'Booking Confirmed successfully!',
            'lead_id'       => $leadId,
            'proposal_id'   => $targetProposal ? (int)$targetProposal['id'] : null,
            'option_name'   => $targetProposal['option_name'] ?? 'Selected Option',
            'status'        => 'Booking Confirmed'
        ]);
        exit();

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to accept proposal: ' . $e->getMessage()]);
        exit();
    }
}
