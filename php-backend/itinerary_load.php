<?php
// itinerary_load.php — loads nested itinerary data by UUID or lead ID.
header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$id = $_GET['id'] ?? '';
$leadId = $_GET['lead_id'] ?? '';

if (empty($id) && empty($leadId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Either id or lead_id is required']);
    exit;
}

try {
    // 1. Fetch itinerary header
    if (!empty($id)) {
        $stmt = $pdo->prepare("SELECT * FROM itineraries WHERE id = ?");
        $stmt->execute([$id]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM itineraries WHERE lead_id = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$leadId]);
    }
    
    $itinerary = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$itinerary) {
        echo json_encode(['success' => true, 'itinerary' => null]);
        exit;
    }

    $itineraryId = $itinerary['id'];

    // Convert decimal numbers to floats/numbers for frontend compatibility
    $itinerary['hotel_cost'] = (float)$itinerary['hotel_cost'];
    $itinerary['transport_cost'] = (float)$itinerary['transport_cost'];
    $itinerary['excursion_cost'] = (float)$itinerary['excursion_cost'];
    $itinerary['total_cost'] = (float)$itinerary['total_cost'];
    $itinerary['visa_cost'] = (float)($itinerary['visa_cost'] ?? 0);
    $itinerary['markup_percentage'] = (float)$itinerary['markup_percentage'];
    $itinerary['final_cost'] = (float)$itinerary['final_cost'];
    $itinerary['cost_per_person'] = (float)$itinerary['cost_per_person'];
    $itinerary['adult_count'] = (int)$itinerary['adult_count'];
    $itinerary['child_count'] = (int)$itinerary['child_count'];
    $itinerary['infant_count'] = (int)$itinerary['infant_count'];
    $itinerary['total_guests'] = (int)$itinerary['total_guests'];
    $itinerary['total_nights'] = (int)$itinerary['total_nights'];
    
    // Decode destinations and other JSON fields
    if (!empty($itinerary['destinations'])) {
        $itinerary['destinations'] = json_decode($itinerary['destinations'], true) ?: explode(',', $itinerary['destinations']);
    } else {
        $itinerary['destinations'] = [];
    }

    if (!empty($itinerary['version_history'])) {
        $itinerary['version_history'] = json_decode($itinerary['version_history'], true) ?: [];
    }

    // 2. Fetch days
    $stmt = $pdo->prepare("SELECT * FROM itinerary_days WHERE itinerary_id = ? ORDER BY day_number ASC");
    $stmt->execute([$itineraryId]);
    $days = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Fetch sub-tables
    $stmtHotels = $pdo->prepare("
        SELECT ih.*, h.hotel_name, h.star_rating AS star_category
        FROM itinerary_hotels ih
        LEFT JOIN hotels h ON h.id = ih.hotel_id
        WHERE ih.itinerary_id = ?
    ");
    $stmtHotels->execute([$itineraryId]);
    $allHotels = $stmtHotels->fetchAll(PDO::FETCH_ASSOC);

    $stmtTrans = $pdo->prepare("SELECT * FROM itinerary_transport WHERE itinerary_id = ?");
    $stmtTrans->execute([$itineraryId]);
    $allTrans = $stmtTrans->fetchAll(PDO::FETCH_ASSOC);

    $stmtExcs = $pdo->prepare("SELECT * FROM itinerary_excursions WHERE itinerary_id = ?");
    $stmtExcs->execute([$itineraryId]);
    $allExcs = $stmtExcs->fetchAll(PDO::FETCH_ASSOC);

    // Group items by day ID
    $hotelsByDay = [];
    foreach ($allHotels as $h) {
        $dayId = $h['itinerary_day_id'] ?: $h['day_id'];
        if ($dayId) {
            $h['rate_per_night'] = (float)$h['rate_per_night'];
            $h['room_cost'] = (float)$h['room_cost'];
            $h['gst_cost'] = (float)$h['gst_cost'];
            $h['total_cost'] = (float)$h['total_cost'];
            $h['nights'] = (int)$h['nights'];
            $h['rooms'] = (int)$h['rooms'];
            if (!empty($h['room_configuration'])) {
                $h['room_configuration'] = json_decode($h['room_configuration'], true) ?: ['doubleRooms' => 1];
            }
            $hotelsByDay[$dayId][] = $h;
        }
    }

    $transByDay = [];
    foreach ($allTrans as $t) {
        $dayId = $t['itinerary_day_id'] ?: $t['day_id'];
        if ($dayId) {
            $t['rate'] = (float)$t['rate'];
            $t['base_cost'] = (float)$t['base_cost'];
            $t['gst_cost'] = (float)$t['gst_cost'];
            $t['driver_cost'] = (float)$t['driver_cost'];
            $t['toll_charges'] = (float)$t['toll_charges'];
            $t['parking_charges'] = (float)$t['parking_charges'];
            $t['state_tax'] = (float)$t['state_tax'];
            $t['permit_charges'] = (float)$t['permit_charges'];
            $t['gst_percentage'] = (float)$t['gst_percentage'];
            $t['gst_included'] = (bool)$t['gst_included'];
            $t['total_cost'] = (float)$t['total_cost'];
            $t['distance_km'] = (float)$t['distance_km'];
            $transByDay[$dayId][] = $t;
        }
    }

    $excsByDay = [];
    foreach ($allExcs as $e) {
        $dayId = $e['itinerary_day_id'] ?: $e['day_id'];
        if ($dayId) {
            $e['adult_count'] = (int)$e['adult_count'];
            $e['child_count'] = (int)$e['child_count'];
            $e['adult_rate'] = (float)$e['adult_rate'];
            $e['child_rate'] = (float)$e['child_rate'];
            $e['total_cost'] = (float)$e['total_cost'];
            $excsByDay[$dayId][] = $e;
        }
    }

    // Nest under each day
    foreach ($days as &$day) {
        $dayId = $day['id'];
        
        $day['day_number'] = (int)$day['day_number'];
        
        if (!empty($day['meals'])) {
            $day['meals'] = json_decode($day['meals'], true) ?: [];
        } else {
            $day['meals'] = [];
        }

        if (!empty($day['metadata'])) {
            $day['metadata'] = json_decode($day['metadata'], true) ?: ['blocks' => []];
        } else {
            $day['metadata'] = ['blocks' => []];
        }

        $day['hotels'] = $hotelsByDay[$dayId] ?? [];
        $day['transport'] = $transByDay[$dayId] ?? [];
        $day['excursions'] = $excsByDay[$dayId] ?? [];
    }

    $itinerary['days'] = $days;

    echo json_encode(['success' => true, 'itinerary' => $itinerary]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load itinerary: ' . $e->getMessage()]);
}
