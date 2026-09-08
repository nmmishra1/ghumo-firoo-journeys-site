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
        l.travel_month AS lead_travel_month
    FROM itineraries i
    LEFT JOIN leads l ON i.lead_id = l.id
    ORDER BY i.created_at DESC");
    
    $itineraries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($itineraries as &$itin) {
        // Resolve package name
        $packageName = !empty($itin['itinerary_name']) ? $itin['itinerary_name'] : ($itin['package_name'] ?? 'Custom Tour Package');
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
        $itin['destinations'] = $dests;

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

        // Ensure status defaults to Draft
        if (empty($itin['status'])) {
            $itin['status'] = 'Draft';
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
