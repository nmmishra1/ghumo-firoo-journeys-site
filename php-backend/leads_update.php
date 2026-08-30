<?php
// leads_update.php — updates a lead in MySQL database.

header('Content-Type: application/json');
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

$leadId = isset($input['id']) ? (int)$input['id'] : (isset($input['lead_id']) ? (int)$input['lead_id'] : 0);
if ($leadId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid id is required']);
    exit;
}

$fieldMapping = [
    'customer_name'         => ['customerName', 'customer_name', 'name', 'full_name'],
    'customer_email'        => ['customerEmail', 'customer_email', 'email'],
    'customer_phone'        => ['customerPhone', 'customer_phone', 'contact_number', 'contactNumber', 'phone', 'whatsapp_number', 'whatsappNumber'],
    'customer_home_city'   => ['customerHomeCity', 'customer_home_city', 'city'],
    'destinations'          => ['lead_destination', 'leadDestination', 'destinations', 'destination', 'packageName'],
    'source'                => ['source', 'customer_type', 'customerType'],
    'status'                => ['status'],
    'notes'                 => ['notes', 'remarks', 'discussion_notes', 'discussionNotes', 'comment', 'comments', 'communication_summary'],
    'follow_up_date'        => ['followUpDate', 'follow_up_date'],
    'travel_month'          => ['travelMonth', 'travel_month'],
    'adult_count'           => ['adultCount', 'adult_count', 'adults', 'numberOfTravelers'],
    'child_count'           => ['childCount', 'child_count', 'children'],
    'infant_count'          => ['infantCount', 'infant_count', 'infants'],
    'budget'                => ['budget'],
    'hotel_category'        => ['hotelCategory', 'hotel_category'],
    'package_name'          => ['packageName', 'package_name'],
    'package_price'         => ['packagePrice', 'package_price', 'estimated_booking_value'],
    'package_cost'          => ['packageCost', 'package_cost'],
    'trip_start_date'       => ['tripStartDate', 'trip_start_date', 'departureDate', 'departure_date', 'travelMonth', 'travel_month'],
    'trip_end_date'         => ['tripEndDate', 'trip_end_date', 'returnDate', 'return_date'],
    'number_of_nights'      => ['numberOfNights', 'number_of_nights', 'nights'],
    'lost_reason'           => ['lostReason', 'lost_reason'],
    'agent_name'            => ['agentName', 'agent_name'],
    'last_contact_date'     => ['lastContactDate', 'last_contact_date'],
    'assigned_to'           => ['assignedTo', 'assigned_to', 'assigned_user_id', 'agent_id'],
    'is_deleted'            => ['isDeleted', 'is_deleted'],
    'whatsapp_number'       => ['whatsappNumber', 'whatsapp_number'],
    'company_name'          => ['companyName', 'company_name'],
    'country'               => ['country'],
    'state'                 => ['state'],
    'package_type'          => ['packageType', 'package_type'],
    'interests'             => ['interests'],
    'transport_preference'  => ['transportPreference', 'transport_preference'],
    'expected_booking_value'=> ['expectedBookingValue', 'expected_booking_value', 'estimated_booking_value'],
    'communication_method'  => ['communicationMethod', 'communication_method', 'communication_channel'],
    'next_action'           => ['nextAction', 'next_action'],
    'lead_quality'          => ['leadQuality', 'lead_quality', 'priority']
];

try {
    // 1. Verify lead existence
    $origStmt = $pdo->prepare('SELECT id FROM leads WHERE id = ?');
    $origStmt->execute([$leadId]);
    $origLead = $origStmt->fetch();
    
    if (!$origLead) {
        http_response_code(404);
        echo json_encode(['error' => 'Lead not found']);
        exit;
    }

    // 2. Build dynamic leads UPDATE query
    $updateFields = [];
    $updateParams = [];
    foreach ($fieldMapping as $snakeColumn => $aliases) {
        $val = null;
        $foundKey = false;
        foreach ($aliases as $key) {
            if (array_key_exists($key, $input)) {
                $val = $input[$key];
                $foundKey = true;
                break;
            }
        }

        if ($foundKey) {
            $updateFields[] = "`$snakeColumn` = ?";
            
            if (in_array($snakeColumn, ['follow_up_date', 'last_contact_date', 'trip_start_date', 'trip_end_date']) && $val !== null) {
                if (trim((string)$val) === '') {
                    $val = null;
                } else {
                    $val = date('Y-m-d H:i:s', strtotime((string)$val));
                }
            }

            if (in_array($snakeColumn, ['adult_count', 'child_count', 'infant_count', 'number_of_nights']) && $val !== null) {
                $val = (int)$val;
            }
            
            if ($snakeColumn === 'destinations' && (is_array($val) || is_object($val))) {
                $val = json_encode($val);
            }

            $updateParams[] = $val !== null ? (string)$val : null;
        }
    }

    if (!empty($updateFields)) {
        $updateParams[] = $leadId;
        $sql = "UPDATE leads SET " . implode(", ", $updateFields) . ", updated_at = NOW() WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($updateParams);
    }

    // 3. Auto-log comment to lead_communications timeline table if notes/comments passed
    $commentText = trim($input['notes'] ?? $input['comment'] ?? $input['comments'] ?? $input['communication_summary'] ?? $input['discussion_notes'] ?? '');
    if (!empty($commentText)) {
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS lead_communications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    lead_id INT NOT NULL,
                    channel VARCHAR(50) DEFAULT 'Note',
                    direction VARCHAR(20) DEFAULT 'outbound',
                    summary TEXT NOT NULL,
                    created_by VARCHAR(255) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");

            $cStmt = $pdo->prepare("
                INSERT INTO lead_communications (lead_id, channel, direction, summary, created_by)
                VALUES (?, ?, 'outbound', ?, ?)
            ");
            $cStmt->execute([
                $leadId,
                $input['communication_channel'] ?? 'Note',
                $commentText,
                (string)($profile['id'] ?? 1)
            ]);
        } catch (Exception $ce) {}
    }

    echo json_encode([
        'success' => true,
        'lead_id' => $leadId,
        'message' => 'Lead updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update lead: ' . $e->getMessage()]);
}
