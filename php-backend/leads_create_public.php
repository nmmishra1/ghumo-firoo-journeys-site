<?php
// leads_create_public.php — Rate-limited, Anti-Spoof Public Lead Capture Endpoint

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

// 1. Get Client IP Address safely
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    $ip = trim(end($ipList));
}

$pdo = getDb();

// 2. Strict Database Rate Limiting (5 requests per 15 minutes per IP)
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rate_limits (
            ip_address VARCHAR(45) NOT NULL,
            request_type VARCHAR(100) NOT NULL,
            request_count INT NOT NULL DEFAULT 1,
            first_request_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (ip_address, request_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Clean up rate limit records older than 15 minutes
    $pdo->exec("DELETE FROM rate_limits WHERE first_request_at < NOW() - INTERVAL 15 MINUTE");

    // Increment request count for this IP
    $stmtRate = $pdo->prepare("
        INSERT INTO rate_limits (ip_address, request_type, request_count, first_request_at)
        VALUES (:ip, 'public_lead', 1, NOW())
        ON DUPLICATE KEY UPDATE request_count = request_count + 1
    ");
    $stmtRate->execute([':ip' => $ip]);

    // Check rate limit threshold
    $stmtCheck = $pdo->prepare("SELECT request_count FROM rate_limits WHERE ip_address = :ip AND request_type = 'public_lead'");
    $stmtCheck->execute([':ip' => $ip]);
    $rateLimit = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if ($rateLimit && (int)$rateLimit['request_count'] > 5) {
        http_response_code(429);
        echo json_encode([
            'error' => 'Rate limit exceeded. Maximum 5 lead requests allowed per 15 minutes to prevent spam.',
            'code' => 429
        ]);
        exit;
    }
} catch (Exception $e) {
    error_log("Rate limiting error: " . $e->getMessage());
}

// 3. Decode JSON Input
$inputJSON = file_get_contents('php://input');
if (empty($inputJSON) && isset($GLOBALS['MOCK_INPUT_JSON'])) {
    $inputJSON = $GLOBALS['MOCK_INPUT_JSON'];
}
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit;
}

// 4. Anti-Bot Honeypot Validation
if (!empty($input['website_url']) || !empty($input['website_hp']) || !empty($input['fax_number'])) {
    // Silent success response to trick spambots without saving to DB
    echo json_encode(['success' => true, 'message' => 'Lead received']);
    exit;
}

// 5. Input Validation & Phone Number Sanitization
$customerName = trim($input['customer_name'] ?? '');
$customerEmail = trim($input['customer_email'] ?? '');
$customerPhone = preg_replace('/[^0-9+]/', '', trim($input['customer_phone'] ?? ''));

if (empty($customerName)) {
    http_response_code(400);
    echo json_encode(['error' => 'Customer Name is required']);
    exit;
}

if (empty($customerPhone) || strlen(preg_replace('/[^0-9]/', '', $customerPhone)) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid Phone Number with at least 8 digits is required']);
    exit;
}

// 6. Dynamic Source & Attribution Processing
$rawSource = trim($input['source'] ?? 'Website');
$sourceTouchpoint = trim($input['touchpoint'] ?? $input['form_type'] ?? 'Website Inquiry');

// Standardize Source Label for Agents
$sourceLabel = $rawSource;
if (stristr($rawSource, 'brochure') !== false) {
    $sourceLabel = 'Website - Download Brochure';
} elseif (stristr($rawSource, 'enquire') !== false || stristr($sourceTouchpoint, 'enquire') !== false) {
    $sourceLabel = 'Website - Enquire Now Modal';
} elseif (stristr($rawSource, 'contact') !== false) {
    $sourceLabel = 'Website - Contact Form';
} elseif (stristr($rawSource, 'whatsapp') !== false) {
    $sourceLabel = 'Website - Floating WhatsApp';
} elseif ($rawSource === 'Website' || $rawSource === 'website') {
    $sourceLabel = 'Website - ' . $sourceTouchpoint;
}

// Capture Page URL, Referrer, and UTM Params
$pageUrl = trim($input['page_url'] ?? $_SERVER['HTTP_REFERER'] ?? '/');
$referrer = trim($input['referrer'] ?? '');
$utmSource = trim($input['utm_source'] ?? '');
$utmMedium = trim($input['utm_medium'] ?? '');
$utmCampaign = trim($input['utm_campaign'] ?? '');

$sourceDetailParts = ["Touchpoint: {$sourceTouchpoint}", "Page: {$pageUrl}"];
if (!empty($referrer)) $sourceDetailParts[] = "Referrer: {$referrer}";
if (!empty($utmSource)) $sourceDetailParts[] = "UTM Source: {$utmSource}";
if (!empty($utmCampaign)) $sourceDetailParts[] = "UTM Campaign: {$utmCampaign}";
$sourceDetailParts[] = "IP: {$ip}";

$sourceDetail = implode(' | ', $sourceDetailParts);

try {
    $pdo->beginTransaction();

    // 7. Check for duplicate recent phone number (within last 10 minutes)
    $dupCheck = $pdo->prepare("SELECT id FROM leads WHERE customer_phone = ? AND created_at > NOW() - INTERVAL 10 MINUTE");
    $dupCheck->execute([$customerPhone]);
    $existing = $dupCheck->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $pdo->rollBack();
        echo json_encode([
            'success' => true,
            'lead_id' => (int)$existing['id'],
            'message' => 'Inquiry already registered recently.'
        ]);
        exit;
    }

    // 8. Insert Lead into MySQL
    $stmt = $pdo->prepare("
        INSERT INTO leads (
            customer_name, customer_email, customer_phone,
            package_name, package_price, package_cost, source, status,
            adult_count, child_count, infant_count,
            trip_start_date, notes, discussion_notes, destinations, created_at, updated_at
        ) VALUES (
            :customer_name, :customer_email, :customer_phone,
            :package_name, :package_price, :package_cost, :source, 'New',
            :adult_count, :child_count, 0,
            :trip_start_date, :notes, :discussion_notes, :destinations, NOW(), NOW()
        )
    ");

    $packageName = $input['package_name'] ?? 'Custom Travel Request';
    $packagePrice = (float)($input['package_price'] ?? 0);
    $adultCount = max(1, (int)($input['adult_count'] ?? 2));
    $childCount = (int)($input['child_count'] ?? 0);
    $travelDate = !empty($input['travel_date']) ? $input['travel_date'] : null;
    $notes = $input['notes'] ?? $input['message'] ?? '';
    $discussionNotes = "[$sourceLabel] Captured from {$pageUrl}. " . ($notes ? "Client Note: {$notes}" : "");

    $stmt->execute([
        ':customer_name' => $customerName,
        ':customer_email' => $customerEmail,
        ':customer_phone' => $customerPhone,
        ':package_name' => $packageName,
        ':package_price' => $packagePrice,
        ':package_cost' => $packagePrice,
        ':source' => $sourceLabel,
        ':adult_count' => $adultCount,
        ':child_count' => $childCount,
        ':trip_start_date' => $travelDate,
        ':notes' => $notes,
        ':discussion_notes' => $discussionNotes,
        ':destinations' => $packageName
    ]);

    $leadId = (int)$pdo->lastInsertId();

    // 9. Auto-log Lead Journey Event
    $journeyId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );

    $jStmt = $pdo->prepare("
        INSERT INTO lead_journey (id, lead_id, status, remarks, agent, timestamp)
        VALUES (?, ?, 'New', ?, 'Website Bot', NOW())
    ");
    $jStmt->execute([
        $journeyId,
        $leadId,
        "Lead submitted online via {$sourceLabel} ({$pageUrl})"
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'lead_id' => $leadId,
        'source' => $sourceLabel,
        'message' => 'Thank you! Your travel request has been received.'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Failed to process inquiry: ' . $e->getMessage()]);
}
