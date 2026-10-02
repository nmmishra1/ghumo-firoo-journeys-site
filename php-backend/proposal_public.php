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
        // 1. Fetch Lead safely with SELECT *
        $lead = null;
        if ($leadId > 0) {
            $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = ? LIMIT 1");
            $stmt->execute([$leadId]);
            $lead = $stmt->fetch(PDO::FETCH_ASSOC);
        } else if ($proposalId > 0) {
            $stmt = $pdo->prepare("SELECT l.* FROM proposals p JOIN leads l ON p.lead_id = l.id WHERE p.id = ? LIMIT 1");
            $stmt->execute([$proposalId]);
            $lead = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($lead) {
                $leadId = (int)$lead['id'];
            }
        }

        if (!$lead) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Proposal request not found. Please contact your travel consultant.']);
            exit();
        }

        // Standardize customer contact
        $customerName = trim($lead['customer_name'] ?? '');
        if (empty($customerName) || strcasecmp($customerName, 'Valued Client') === 0) {
            $customerName = 'Valued Guest';
        }

        // 2. Fetch Proposals Options
        $proposals = [];
        try {
            $propStmt = $pdo->prepare("SELECT * FROM proposals WHERE lead_id = ? ORDER BY option_number ASC, id ASC");
            $propStmt->execute([$leadId]);
            $proposals = $propStmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $proErr) {
            $proposals = [];
        }

        $hasAccepted = false;
        $acceptedOption = null;

        foreach ($proposals as &$p) {
            $p['payment_schedule'] = is_string($p['payment_schedule']) ? json_decode($p['payment_schedule'], true) : ($p['payment_schedule'] ?? []);
            $p['itinerary_data'] = is_string($p['itinerary_data']) ? json_decode($p['itinerary_data'], true) : ($p['itinerary_data'] ?? []);
            $p['total_price'] = (float)($p['total_price'] ?? 0);
            $p['price_per_person'] = (float)($p['price_per_person'] ?? 0);
            $p['advance_required'] = (float)($p['advance_required'] ?? 0) > 0 ? (float)$p['advance_required'] : round($p['total_price'] * 0.30, 2);

            if (strcasecmp($p['status'] ?? '', 'Accepted') === 0) {
                $hasAccepted = true;
                $acceptedOption = $p;
            }
        }
        unset($p);

        // 3. Fetch Master Itinerary if available
        $itinerary = null;
        try {
            $itinStmt = $pdo->prepare("SELECT * FROM itineraries WHERE lead_id = ? ORDER BY id DESC LIMIT 1");
            $itinStmt->execute([$leadId]);
            $itinerary = $itinStmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $itinErr) {}

        // Helper to produce a clean holiday title instead of internal system names like "Trip - Customized Option 4"
        $rawItinName = trim($itinerary['itinerary_name'] ?? '');
        $rawLeadDest = trim($lead['destination'] ?: ($lead['destinations'] ?: ''));
        $displayTourTitle = $rawItinName;
        if (empty($displayTourTitle) || preg_match('/^(Trip\s*-\s*Customized\s*Option\s*\d+|Customized\s*Option\s*\d+|Itinerary\s*-\s*\d+|Customized\s*Tour)/i', $displayTourTitle)) {
            if (!empty($rawLeadDest)) {
                $destParts = array_map('trim', explode('·', $rawLeadDest));
                $meaningful = array_filter($destParts, function($p) {
                    return !preg_match('/^\d+N\/\d+D$/i', $p) && !preg_match('/^\d+N$/i', $p);
                });
                $displayTourTitle = !empty($meaningful) ? implode(' • ', $meaningful) : $rawLeadDest;
            } else {
                $displayTourTitle = 'Bespoke Curated Tour';
            }
        }

        // Fallback: If no proposals rows exist yet, create default option from itinerary
        if (empty($proposals) && $itinerary) {
            $itinPrice = (float)($itinerary['final_cost'] ?: ($itinerary['total_cost'] ?: 0));
            $itinPerPax = (float)($itinerary['cost_per_person'] ?: 0);
            $proposals = [
                [
                    'id'               => $itinerary['id'],
                    'option_number'    => 1,
                    'option_name'      => 'Option 1 (Curated)',
                    'title'            => $displayTourTitle,
                    'total_price'      => $itinPrice,
                    'price_per_person' => $itinPerPax > 0 ? $itinPerPax : round($itinPrice / max(1, (int)($lead['adult_count'] ?? 2))),
                    'advance_required' => round($itinPrice * 0.30, 2),
                    'currency'         => 'INR',
                    'status'           => $itinerary['status'] ?: 'Draft',
                    'expiry_date'      => null,
                    'payment_schedule' => [],
                    'itinerary_data'   => [],
                    'created_at'       => $itinerary['created_at'] ?? date('Y-m-d H:i:s')
                ]
            ];
            if (strcasecmp(trim($itinerary['status'] ?? ''), 'Booking Confirmed') === 0) {
                $hasAccepted = true;
                $acceptedOption = $proposals[0];
            }
        } else {
            // Clean up proposal titles if they have internal system names
            foreach ($proposals as &$p) {
                if (empty($p['title']) || preg_match('/^(Trip\s*-\s*Customized\s*Option\s*\d+|Customized\s*Option\s*\d+)/i', $p['title'])) {
                    $p['title'] = $displayTourTitle;
                }
            }
            unset($p);
        }

        $days = [];
        if ($itinerary && !empty($itinerary['id'])) {
            try {
                // Fetch sub-tables: hotels, transport, excursions
                $stmtHotels = $pdo->prepare("
                    SELECT ih.*, h.hotel_name, h.star_rating AS star_category
                    FROM itinerary_hotels ih
                    LEFT JOIN hotels h ON h.id = ih.hotel_id
                    WHERE ih.itinerary_id = ?
                ");
                $stmtHotels->execute([$itinerary['id']]);
                $allHotels = $stmtHotels->fetchAll(PDO::FETCH_ASSOC);
                $hotelsByDay = [];
                foreach ($allHotels as $h) {
                    $dayId = $h['itinerary_day_id'] ?: $h['day_id'];
                    if ($dayId) $hotelsByDay[$dayId][] = $h;
                }

                $stmtTrans = $pdo->prepare("SELECT * FROM itinerary_transport WHERE itinerary_id = ?");
                $stmtTrans->execute([$itinerary['id']]);
                $allTrans = $stmtTrans->fetchAll(PDO::FETCH_ASSOC);
                $transByDay = [];
                foreach ($allTrans as $t) {
                    $dayId = $t['itinerary_day_id'] ?: $t['day_id'];
                    if ($dayId) $transByDay[$dayId][] = $t;
                }

                $stmtExcs = $pdo->prepare("SELECT * FROM itinerary_excursions WHERE itinerary_id = ?");
                $stmtExcs->execute([$itinerary['id']]);
                $allExcs = $stmtExcs->fetchAll(PDO::FETCH_ASSOC);
                $excsByDay = [];
                foreach ($allExcs as $e) {
                    $dayId = $e['itinerary_day_id'] ?: $e['day_id'];
                    if ($dayId) $excsByDay[$dayId][] = $e;
                }

                $daysStmt = $pdo->prepare("SELECT * FROM itinerary_days WHERE itinerary_id = ? ORDER BY day_number ASC");
                $daysStmt->execute([$itinerary['id']]);
                $rawDays = $daysStmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($rawDays as $rd) {
                    $meta = is_string($rd['metadata']) ? json_decode($rd['metadata'], true) : ($rd['metadata'] ?? []);
                    $blocks = $meta['blocks'] ?? [];

                    // Look for hotel block in metadata if not on day
                    $hotelBlockProp = null;
                    $cabBlockProp = null;
                    $actBlocks = [];

                    foreach ($blocks as $b) {
                        $bType = strtolower($b['type'] ?? '');
                        if ($bType === 'hotel' && !$hotelBlockProp) {
                            $hotelBlockProp = $b['properties'] ?? [];
                        } else if (($bType === 'transfer' || $bType === 'cab') && !$cabBlockProp) {
                            $cabBlockProp = $b['properties'] ?? [];
                        } else if ($bType === 'activity' || $bType === 'sightseeing') {
                            $actBlocks[] = $b;
                        }
                    }

                    $dayHotels = $hotelsByDay[$rd['id']] ?? [];
                    $primaryHotel = $dayHotels[0] ?? [];

                    $hotelName = $rd['hotel_name'] ?: ($primaryHotel['hotel_name'] ?? ($hotelBlockProp['hotel_name'] ?? ''));
                    $roomType = $rd['room_type'] ?: ($primaryHotel['room_type'] ?? ($hotelBlockProp['room_category'] ?? ($hotelBlockProp['room_type'] ?? 'Standard Room')));
                    $mealPlan = $rd['meal_plan'] ?: ($primaryHotel['meal_plan'] ?? ($hotelBlockProp['meal_plan'] ?? 'CP (Breakfast Included)'));

                    $days[] = [
                        'id'           => $rd['id'],
                        'day_number'   => (int)$rd['day_number'],
                        'date'         => $rd['date'] ?? '',
                        'title'        => $rd['title'] ?: "Day {$rd['day_number']}",
                        'description'  => $rd['description'] ?: '',
                        'destination'  => $rd['destination'] ?: '',
                        'hotel_name'   => $hotelName,
                        'room_type'    => $roomType,
                        'meal_plan'    => $mealPlan,
                        'hotels'       => $dayHotels,
                        'transport'    => $transByDay[$rd['id']] ?? ($cabBlockProp ? [$cabBlockProp] : []),
                        'excursions'   => $excsByDay[$rd['id']] ?? [],
                        'blocks'       => $blocks
                    ];
                }
            } catch (Exception $dayErr) {}
        }

        // 4. Check payments received defensively
        $paymentsReceived = 0.0;
        try {
            $payStmt = $pdo->prepare("SELECT COALESCE(SUM(amount_received), 0) FROM payments WHERE lead_id = ? AND LOWER(TRIM(status)) IN ('success', 'completed', 'verified', 'paid')");
            $payStmt->execute([$leadId]);
            $paymentsReceived = (float)$payStmt->fetchColumn();
        } catch (Exception $payErr) {
            $paymentsReceived = 0.0;
        }

        $isLeadConfirmed = strcasecmp(trim($lead['status'] ?? ''), 'Booking Confirmed') === 0;

        echo json_encode([
            'success' => true,
            'lead' => [
                'id'              => (int)$lead['id'],
                'customer_name'   => $customerName,
                'destination'     => $lead['destination'] ?: ($lead['destinations'] ?: 'Customized Tour'),
                'trip_start_date' => $lead['trip_start_date'] ?? null,
                'trip_end_date'   => $lead['trip_end_date'] ?? null,
                'adult_count'     => (int)($lead['adult_count'] ?? 2),
                'child_count'     => (int)($lead['child_count'] ?? 0),
                'infant_count'    => (int)($lead['infant_count'] ?? 0),
                'status'          => $lead['status'] ?? 'Draft',
                'is_confirmed'    => $isLeadConfirmed || $hasAccepted
            ],
            'itinerary' => $itinerary ? [
                'id'              => $itinerary['id'],
                'itinerary_name'  => $displayTourTitle,
                'destinations'    => is_string($itinerary['destinations']) ? json_decode($itinerary['destinations'], true) : ($itinerary['destinations'] ?? []),
                'total_nights'    => (int)($itinerary['total_nights'] ?? 0),
                'total_cost'      => (float)($itinerary['final_cost'] ?: ($itinerary['total_cost'] ?: 0)),
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
        echo json_encode(['success' => false, 'error' => 'Unable to load proposal details. Please refresh or contact your travel consultant.']);
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
