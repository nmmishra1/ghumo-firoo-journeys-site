<?php
// leads_create.php — called from CRM UI & Website forms to add a lead to MySQL.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Origin: https://ghumofiroo.com');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';

try {
    $pdo = getDb();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection error']);
    exit;
}

try {
    $user = authenticate();
    $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent', 'user']);
} catch (Throwable $t) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized: ' . $t->getMessage(), 'code' => 401]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];

$customerName = trim($input['customer_name'] ?? $input['name'] ?? $input['full_name'] ?? '');
$phone = trim($input['customer_phone'] ?? $input['phone'] ?? $input['whatsapp_number'] ?? $input['contact_number'] ?? '');
$email = trim($input['customer_email'] ?? $input['email'] ?? '');
$destinations = trim($input['destinations'] ?? $input['destination'] ?? $input['tour_description'] ?? $input['packageName'] ?? '');
$source = trim($input['source'] ?? $input['customer_type'] ?? $input['customerType'] ?? 'Direct Customer');
$notes = trim($input['notes'] ?? $input['remarks'] ?? $input['call_summary'] ?? $input['discussion_notes'] ?? $input['discussionNotes'] ?? '');

// 1. Strict Validation with Logical Real-World Feedback
if ($customerName === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error'   => 'Validation Error',
        'details' => 'Customer name is required and cannot be blank.'
    ]);
    exit;
}

$cleanDigits = preg_replace('/[^0-9]/', '', $phone);
if (empty($phone) || strlen($cleanDigits) < 8) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error'   => 'Validation Error',
        'details' => "Invalid contact number '{$phone}'. A valid mobile number with at least 8–10 digits is required."
    ]);
    exit;
}

// 2. Parse Follow-up Date (DD-MM-YYYY, DD/MM/YYYY, or YYYY-MM-DD)
$followUpDate = null;
$rawFup = trim($input['follow_up_date'] ?? $input['followUpDate'] ?? '');
if (!empty($rawFup)) {
    if (preg_match('/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/', $rawFup, $mDate)) {
        $followUpDate = sprintf('%04d-%02d-%02d 10:00:00', (int)$mDate[3], (int)$mDate[2], (int)$mDate[1]);
    } else {
        $ts = strtotime($rawFup);
        if ($ts !== false && $ts > 0) {
            $followUpDate = date('Y-m-d H:i:s', $ts);
        }
    }
}

// Compute duration & number_of_nights automatically if missing
$duration = $input['duration'] ?? null;
$numberOfNights = null;

if (empty($duration) && !empty($destinations)) {
    if (preg_match('/(\d+)N\s*\/\s*(\d+)D/i', $destinations, $mN)) {
        $numberOfNights = (int)$mN[1];
        $duration = "{$mN[1]} Nights / {$mN[2]} Days";
    }
}

$createdBy = $profile['id'] ?? null;
$assignedTo = $input['assigned_to'] ?? $input['assignedTo'] ?? null;

// Validate profile IDs against MySQL profiles table to satisfy Foreign Key constraints
try {
    if ($createdBy) {
        $chk = $pdo->prepare("SELECT id FROM profiles WHERE id = ? LIMIT 1");
        $chk->execute([$createdBy]);
        if (!$chk->fetchColumn()) {
            $createdBy = null;
        }
    }

    if ($assignedTo) {
        $chk2 = $pdo->prepare("SELECT id FROM profiles WHERE id = ? OR full_name = ? OR email = ? OR role = ? LIMIT 1");
        $chk2->execute([$assignedTo, $assignedTo, $assignedTo, strtolower($assignedTo)]);
        $matched = $chk2->fetchColumn();
        $assignedTo = $matched ?: null;
    }
} catch (Throwable $pe) {
    $createdBy = null;
    $assignedTo = null;
}

try {
    $isRepeatCustomer = false;
    $previousTripCount = 0;

    if (!empty($phone) || !empty($email)) {
        try {
            $checkStmt = $pdo->prepare(
                "SELECT COUNT(*) FROM leads 
                 WHERE ((customer_phone = ? AND customer_phone != '') OR (customer_email = ? AND customer_email != '')) 
                   AND (is_deleted = 0 OR is_deleted IS NULL)"
            );
            $checkStmt->execute([$phone, $email]);
            $previousTripCount = (int)$checkStmt->fetchColumn();
            if ($previousTripCount > 0) {
                $isRepeatCustomer = true;
            }
        } catch (Exception $e) {}
    }

    $stmt = $pdo->prepare(
        'INSERT INTO leads
            (customer_name, customer_phone, customer_email, customer_home_city, whatsapp_number,
             source, source_detail, destination_city_id, destinations,
             trip_start_date, trip_end_date, adult_count, child_count, infant_count,
             budget, duration, number_of_nights, hotel_category, notes, discussion_notes, follow_up_date, status, assigned_to, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "New", ?, ?)'
    );

    $stmt->execute([
        $customerName,
        !empty($phone) ? $phone : null,
        !empty($email) ? $email : null,
        $input['customer_home_city'] ?? $input['city'] ?? null,
        !empty($phone) ? $phone : null,
        $source,
        $input['source_detail'] ?? "Source: {$source}",
        $input['destination_city_id'] ?? null,
        $destinations ?: null,
        $input['trip_start_date'] ?? $input['travelMonth'] ?? null,
        $input['trip_end_date'] ?? null,
        (int)($input['adult_count'] ?? $input['adultCount'] ?? $input['adults'] ?? 2),
        (int)($input['child_count'] ?? $input['childCount'] ?? $input['children'] ?? 0),
        (int)($input['infant_count'] ?? $input['infantCount'] ?? $input['infants'] ?? 0),
        $input['budget'] ?? $input['package_price'] ?? $input['packagePrice'] ?? $input['expected_booking_value'] ?? null,
        $duration,
        $numberOfNights,
        $input['hotel_category'] ?? $input['hotelCategory'] ?? null,
        !empty($notes) ? $notes : null,
        !empty($notes) ? $notes : null,
        $followUpDate,
        $assignedTo,
        $createdBy
    ]);

    $newLeadId = (int)$pdo->lastInsertId();

    if (!empty($notes)) {
        try {
            $commStmt = $pdo->prepare('INSERT INTO lead_communications (lead_id, communication_type, communication_direction, content, summary, created_by, created_at) VALUES (?, "note", "internal", ?, ?, ?, NOW())');
            $commStmt->execute([$newLeadId, $notes, 'Initial lead remarks / notes', $createdBy ?: 'System']);
        } catch (Throwable $ct) {}
    }

    if (!empty($phone) && file_exists(__DIR__ . '/send_lead_whatsapp.php')) {
        try {
            require_once __DIR__ . '/send_lead_whatsapp.php';
            sendBrandedLeadWhatsApp($newLeadId, 'welcome_greeting', $phone, null, null, null, $customerName, $destinations ?: null);
        } catch (Exception $e) {}
    }

    echo json_encode([
        'success'              => true,
        'lead_id'              => $newLeadId,
        'customer_name'        => $customerName,
        'source'               => $source,
        'destinations'         => $destinations ?: 'General Enquiry',
        'follow_up_date'       => $followUpDate,
        'assigned_to'          => $assignedTo,
        'is_repeat_customer'   => $isRepeatCustomer,
        'previous_trips_count' => $previousTripCount,
        'message'              => $isRepeatCustomer 
            ? "Repeat Customer Linked! Lead #{$newLeadId} created for {$customerName} ({$previousTripCount} previous trips found)."
            : "Lead #{$newLeadId} registered successfully in CRM for {$customerName} (Source: {$source})."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Database Error',
        'details' => 'Failed to create lead in MySQL: ' . $e->getMessage()
    ]);
}
