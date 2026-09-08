<?php
// customer_update.php — updates customer details (e.g. Home City, Phone, Name) across all leads for that customer.

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

$homeCity = trim($input['home_city'] ?? $input['customer_home_city'] ?? $input['city'] ?? '');
$customerName = trim($input['customer_name'] ?? $input['name'] ?? '');
$customerPhone = trim($input['customer_phone'] ?? $input['phone'] ?? $input['contact_number'] ?? $input['mobile'] ?? '');
$customerEmail = trim($input['customer_email'] ?? $input['email'] ?? '');
$leadIds = $input['lead_ids'] ?? $input['leadIds'] ?? [];

if (!is_array($leadIds) && !empty($leadIds)) {
    $leadIds = [(int)$leadIds];
}

$sanitizedLeadIds = [];
if (is_array($leadIds)) {
    foreach ($leadIds as $id) {
        $intId = (int)$id;
        if ($intId > 0) {
            $sanitizedLeadIds[] = $intId;
        }
    }
}

if (empty($homeCity) && empty($customerName) && empty($customerPhone) && empty($customerEmail)) {
    http_response_code(400);
    echo json_encode(['error' => 'No update fields provided']);
    exit;
}

if (empty($sanitizedLeadIds) && empty($customerPhone) && empty($customerEmail) && empty($customerName)) {
    http_response_code(400);
    echo json_encode(['error' => 'Customer identification (lead_ids, phone, email, or name) is required']);
    exit;
}

try {
    $setClauses = [];
    $setParams = [];

    if ($homeCity !== '') {
        $setClauses[] = "`customer_home_city` = ?";
        $setParams[] = $homeCity;
    }
    if ($customerName !== '') {
        $setClauses[] = "`customer_name` = ?";
        $setParams[] = $customerName;
    }

    if (empty($setClauses)) {
        echo json_encode(['success' => true, 'updated_leads' => 0, 'message' => 'No changes to apply']);
        exit;
    }

    // Build WHERE condition matching lead IDs or phone or email or name
    $whereConditions = [];
    $whereParams = [];

    if (!empty($sanitizedLeadIds)) {
        $placeholders = implode(',', array_fill(0, count($sanitizedLeadIds), '?'));
        $whereConditions[] = "`id` IN ($placeholders)";
        foreach ($sanitizedLeadIds as $lid) {
            $whereParams[] = $lid;
        }
    }

    if (!empty($customerPhone) && $customerPhone !== '---') {
        $cleanPhone = preg_replace('/[^0-9]/', '', $customerPhone);
        if (strlen($cleanPhone) >= 7) {
            $last10 = substr($cleanPhone, -10);
            $whereConditions[] = "(`customer_phone` LIKE ? OR `contact_number` LIKE ?)";
            $whereParams[] = "%$last10%";
            $whereParams[] = "%$last10%";
        } else {
            $whereConditions[] = "(`customer_phone` = ? OR `contact_number` = ?)";
            $whereParams[] = $customerPhone;
            $whereParams[] = $customerPhone;
        }
    }

    if (!empty($customerEmail) && $customerEmail !== '---' && filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        $whereConditions[] = "(`customer_email` = ? OR `email` = ?)";
        $whereParams[] = $customerEmail;
        $whereParams[] = $customerEmail;
    }

    if (empty($whereConditions)) {
        http_response_code(400);
        echo json_encode(['error' => 'Could not determine customer targeting condition']);
        exit;
    }

    $whereClause = "(" . implode(" OR ", $whereConditions) . ")";
    $sql = "UPDATE leads SET " . implode(", ", $setClauses) . ", updated_at = NOW() WHERE $whereClause";
    
    $fullParams = array_merge($setParams, $whereParams);
    $stmt = $pdo->prepare($sql);
    $stmt->execute($fullParams);
    $rowCount = $stmt->rowCount();

    echo json_encode([
        'success' => true,
        'updated_leads' => $rowCount,
        'home_city' => $homeCity,
        'message' => "Successfully updated customer details for $rowCount lead(s)."
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
