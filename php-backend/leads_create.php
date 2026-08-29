<?php
// leads_create.php — called from CRM UI & Website forms to add a lead to MySQL.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection error: ' . $e->getMessage()]);
    exit;
}

$profile = null;
if (file_exists(__DIR__ . '/auth_middleware.php')) {
    require_once __DIR__ . '/auth_middleware.php';
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    
    if (!empty($authHeader) && strpos($authHeader, 'Bearer') !== false) {
        try {
            $user = authenticate();
            $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent', 'user']);
        } catch (Throwable $t) {
            $profile = null;
        }
    }
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];

$customerName = trim($input['customer_name'] ?? $input['name'] ?? $input['full_name'] ?? '');
$phone = trim($input['customer_phone'] ?? $input['phone'] ?? $input['whatsapp_number'] ?? $input['contact_number'] ?? '');
$email = trim($input['customer_email'] ?? $input['email'] ?? '');
$destinations = trim($input['destinations'] ?? $input['destination'] ?? $input['packageName'] ?? '');

if ($customerName === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Customer name is required']);
    exit;
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
        $chk2 = $pdo->prepare("SELECT id FROM profiles WHERE id = ? LIMIT 1");
        $chk2->execute([$assignedTo]);
        if (!$chk2->fetchColumn()) {
            $assignedTo = null;
        }
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
             budget, duration, number_of_nights, hotel_category, status, assigned_to, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "New", ?, ?)'
    );

    $stmt->execute([
        $customerName,
        !empty($phone) ? $phone : null,
        !empty($email) ? $email : null,
        $input['customer_home_city'] ?? $input['city'] ?? null,
        !empty($phone) ? $phone : null,
        $input['source'] ?? 'manual',
        $input['source_detail'] ?? null,
        $input['destination_city_id'] ?? null,
        $destinations ?: null,
        $input['trip_start_date'] ?? $input['travelMonth'] ?? null,
        $input['trip_end_date'] ?? null,
        (int)($input['adult_count'] ?? 1),
        (int)($input['child_count'] ?? 0),
        (int)($input['infant_count'] ?? 0),
        $input['budget'] ?? null,
        $duration,
        $numberOfNights,
        $input['hotel_category'] ?? $input['hotelCategory'] ?? null,
        $assignedTo,
        $createdBy
    ]);

    $newLeadId = (int)$pdo->lastInsertId();

    if (!empty($phone) && file_exists(__DIR__ . '/send_lead_whatsapp.php')) {
        try {
            require_once __DIR__ . '/send_lead_whatsapp.php';
            sendBrandedLeadWhatsApp($newLeadId, 'welcome_greeting', $phone, null, null, null, $customerName, $destinations ?: null);
        } catch (Exception $e) {}
    }

    echo json_encode([
        'success'              => true,
        'lead_id'              => $newLeadId,
        'is_repeat_customer'   => $isRepeatCustomer,
        'previous_trips_count' => $previousTripCount,
        'message'              => $isRepeatCustomer 
            ? "Repeat Customer Inquiry linked! Found {$previousTripCount} previous trip inquiry." 
            : "Lead created successfully"
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create lead in database: ' . $e->getMessage()]);
}
