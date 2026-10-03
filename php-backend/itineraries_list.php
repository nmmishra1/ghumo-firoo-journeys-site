<?php
error_reporting(0);
ini_set('display_errors', 0);
// itineraries_list.php — handles itinerary listing from MySQL with lead join and customer data resolution.
// Requires a valid Supabase session JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

try {
    $stmt = $pdo->query("SELECT 
        i.*,
        l.customer_name AS lead_customer_name,
        l.customer_email AS lead_customer_email,
        l.customer_phone AS lead_customer_phone,
        l.destinations AS lead_destinations,
        l.trip_start_date AS lead_trip_start_date,
        l.trip_end_date AS lead_trip_end_date,
        l.travel_month AS lead_travel_month,
        l.status AS lead_status
    FROM itineraries i
    LEFT JOIN leads l ON i.lead_id = l.id
    ORDER BY i.created_at DESC");
    
    $itineraries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Check accepted proposals
    $acceptedProps = [];
    try {
        $pStmt = $pdo->query("SELECT id, lead_id, total_price, title FROM proposals WHERE status = 'Accepted'");
        while ($pr = $pStmt->fetch(PDO::FETCH_ASSOC)) {
            $acceptedProps[(int)$pr['lead_id']] = $pr;
        }
    } catch (Exception $pe) {}

    $cleanDest = function($val) {
        if (empty($val)) return '';
        $v = trim($val);
        if ((str_starts_with($v, '[') && str_ends_with($v, ']')) || (str_starts_with($v, '{') && str_ends_with($v, '}'))) {
            $decoded = json_decode($v, true);
            if (is_array($decoded)) {
                $parts = [];
                foreach ($decoded as $item) {
                    if (is_array($item)) {
                        $c = trim($item['city'] ?? $item['destination'] ?? $item['name'] ?? '');
                        $s = trim($item['state'] ?? '');
                        $n = !empty($item['nights']) ? " ({$item['nights']}N)" : '';
                        if ($c && $s && count($decoded) === 1) $parts[] = "{$c}, {$s}{$n}";
                        elseif ($c) $parts[] = "{$c}{$n}";
                        elseif ($s) $parts[] = "{$s}{$n}";
                    } elseif (is_string($item) && !str_starts_with($item, '[') && !str_starts_with($item, '{')) {
                        $parts[] = trim($item);
                    }
                }
                return !empty($parts) ? implode(' • ', $parts) : $val;
            }
        }
        return $val;
    };

    foreach ($itineraries as &$itin) {
        // Resolve package name
        $rawPkg = !empty($itin['itinerary_name']) ? $itin['itinerary_name'] : ($itin['package_name'] ?? 'Custom Tour Package');
        $packageName = $cleanDest($rawPkg);
        $itin['package_name'] = $packageName;

        // Resolve customer name
        $custName = !empty($itin['customer_name']) ? trim($itin['customer_name']) : '';
        if (empty($custName) || strcasecmp($custName, 'Valued Client') === 0 || strcasecmp($custName, 'Guest') === 0) {
            if (!empty($itin['lead_customer_name']) && strcasecmp(trim($itin['lead_customer_name']), 'Valued Client') !== 0) {
                $custName = trim($itin['lead_customer_name']);
            } elseif (!empty($packageName) && preg_match('/^Itinerary for\s+([^–—\-|]+)/i', $packageName, $m)) {
                $extracted = trim($m[1]);
                if ($extracted && strcasecmp($extracted, 'Valued Client') !== 0 && strcasecmp($extracted, 'Guest') !== 0) {
                    $custName = $extracted;
                }
            }
        }
        $itin['customer_name'] = !empty($custName) ? $custName : 'Valued Client';

        // Resolve customer email
        $custEmail = !empty($itin['customer_email']) ? trim($itin['customer_email']) : '';
        if (empty($custEmail) && !empty($itin['lead_customer_email'])) {
            $custEmail = trim($itin['lead_customer_email']);
        }
        $itin['customer_email'] = $custEmail;

        // Resolve customer phone
        $custPhone = !empty($itin['customer_phone']) ? trim($itin['customer_phone']) : '';
        if (empty($custPhone) && !empty($itin['lead_customer_phone'])) {
            $custPhone = trim($itin['lead_customer_phone']);
        }
        $itin['customer_phone'] = $custPhone;

        // Resolve destinations
        $dests = !empty($itin['destinations']) ? $itin['destinations'] : (!empty($itin['lead_destinations']) ? $itin['lead_destinations'] : '');
        $itin['destinations'] = $cleanDest($dests);

        // Resolve travel dates
        $start = (!empty($itin['travel_start_date']) && $itin['travel_start_date'] !== '0000-00-00' && strpos($itin['travel_start_date'], '0000-00-00') !== 0)
            ? $itin['travel_start_date']
            : ((!empty($itin['lead_trip_start_date']) && $itin['lead_trip_start_date'] !== '0000-00-00' && strpos($itin['lead_trip_start_date'], '0000-00-00') !== 0)
                ? $itin['lead_trip_start_date']
                : (!empty($itin['lead_travel_month']) ? $itin['lead_travel_month'] : null));

        $end = (!empty($itin['travel_end_date']) && $itin['travel_end_date'] !== '0000-00-00' && strpos($itin['travel_end_date'], '0000-00-00') !== 0)
            ? $itin['travel_end_date']
            : ((!empty($itin['lead_trip_end_date']) && $itin['lead_trip_end_date'] !== '0000-00-00' && strpos($itin['lead_trip_end_date'], '0000-00-00') !== 0)
                ? $itin['lead_trip_end_date']
                : null);

        $itin['travel_start_date'] = $start;
        $itin['travel_end_date'] = $end;

        // Resolve status: Only mark as 'Booking Confirmed' if THIS specific itinerary is confirmed or matches the customer-accepted proposal
        $rawStatus = !empty($itin['status']) ? trim($itin['status']) : '';
        $leadId = !empty($itin['lead_id']) ? (int)$itin['lead_id'] : 0;
        $hasAcceptedPropForLead = isset($acceptedProps[$leadId]);
        $acceptedProp = $hasAcceptedPropForLead ? $acceptedProps[$leadId] : null;

        $isConfirmedItin = false;
        if (strcasecmp($rawStatus, 'Booking Confirmed') === 0 || strcasecmp($rawStatus, 'Confirmed') === 0) {
            $isConfirmedItin = true;
        } elseif ($hasAcceptedPropForLead && (float)($itin['final_cost'] ?? 0) > 0) {
            $isConfirmedItin = true;
        }

        if ($isConfirmedItin) {
            $itin['status'] = 'Booking Confirmed';
            $itin['is_client_selected'] = true;
        } else {
            // Keep draft/sent status; DO NOT inherit 'Booking Confirmed' onto $0 draft proposals
            $itin['status'] = (!empty($rawStatus) && strcasecmp($rawStatus, 'Booking Confirmed') !== 0) ? $rawStatus : 'Draft';
            $itin['is_client_selected'] = false;
        }

        // Ensure itinerary code is present
        if (empty($itin['itinerary_code'])) {
            $itin['itinerary_code'] = 'GFJ-ITN-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $itin['id'] ?? ''), 0, 6));
        }
    }

    echo json_encode(['success' => true, 'itineraries' => $itineraries]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch itineraries: ' . $e->getMessage()]);
}
