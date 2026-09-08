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
        i.id, 
        i.itinerary_code, 
        i.itinerary_name AS package_name, 
        COALESCE(NULLIF(i.status, ''), 'Draft') AS status, 
        COALESCE(NULLIF(i.customer_name, ''), NULLIF(l.customer_name, '')) AS customer_name, 
        COALESCE(NULLIF(i.customer_email, ''), NULLIF(l.customer_email, ''), NULLIF(l.email, '')) AS customer_email, 
        COALESCE(NULLIF(l.customer_phone, ''), NULLIF(l.contact_number, '')) AS customer_phone, 
        COALESCE(NULLIF(i.destinations, ''), NULLIF(l.destinations, ''), NULLIF(l.destination, '')) AS destinations, 
        COALESCE(NULLIF(i.travel_start_date, '0000-00-00'), NULLIF(l.trip_start_date, '0000-00-00')) AS travel_start_date, 
        COALESCE(NULLIF(i.travel_end_date, '0000-00-00'), NULLIF(l.trip_end_date, '0000-00-00')) AS travel_end_date, 
        i.final_cost, 
        i.pricing_flagged, 
        i.lead_id, 
        i.created_at,
        i.updated_at
    FROM itineraries i
    LEFT JOIN leads l ON i.lead_id = l.id
    ORDER BY i.created_at DESC");
    
    $itineraries = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($itineraries as &$itin) {
        // Fallback: If customer_name is still empty or 'Valued Client', extract from package_name (e.g. "Itinerary for Nilesh Gupta - ...")
        if (empty($itin['customer_name']) || strcasecmp(trim($itin['customer_name']), 'Valued Client') === 0) {
            if (!empty($itin['package_name']) && preg_match('/^Itinerary for\s+([^–—\-|]+)/i', $itin['package_name'], $m)) {
                $extracted = trim($m[1]);
                if ($extracted && strcasecmp($extracted, 'Valued Client') !== 0 && strcasecmp($extracted, 'Guest') !== 0) {
                    $itin['customer_name'] = $extracted;
                }
            }
        }
        if (empty($itin['customer_name'])) {
            $itin['customer_name'] = 'Valued Client';
        }
    }

    echo json_encode(['success' => true, 'itineraries' => $itineraries]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch itineraries: ' . $e->getMessage()]);
}
