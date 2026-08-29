<?php
// test_cli_runner.php — Runs Phase 1 HTTP tests via CLI by generating real Supabase JWTs
// and calling the live endpoints over HTTP.
//
// To run: php php-backend/test_cli_runner.php
//
// NEVER expose this file to the web root. Keep it blocked by .htaccess.

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "Forbidden: This script can only be executed via the CLI Terminal.\n";
    exit(1);
}

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/db.php';

use Firebase\JWT\JWT;

// 1. Load env and get Supabase JWT secret
loadEnvFile();
$secret = getenv('SUPABASE_JWT_SECRET');
if (!$secret) {
    echo "ABORT: SUPABASE_JWT_SECRET is not configured in /home/username/.env!\n";
    exit(1);
}

$pdo = getDb();
$dbName = $pdo->query("SELECT DATABASE()")->fetchColumn();
if ($dbName !== 'a17511nd_GFStaging') {
    echo "ABORT: Connection is pointed to '{$dbName}', NOT staging database 'a17511nd_GFStaging'!\n";
    exit(1);
}

// 2. Setup Staging profiles for testing
try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE profiles;");
    $pdo->exec("TRUNCATE TABLE leads;");
    $pdo->exec("TRUNCATE TABLE lead_communications;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Insert Admin and two Agents matching token claims
    $stmt = $pdo->prepare('INSERT INTO profiles (id, full_name, email, role, approved) VALUES (?, ?, ?, ?, 1)');
    $stmt->execute(['admin-uuid-001', 'Test Admin User', 'admin@ghumofiroo.com', 'admin']);
    $stmt->execute(['agent-uuid-001', 'Test Agent One', 'agent1@ghumofiroo.com', 'agent']);
    $stmt->execute(['agent-uuid-002', 'Test Agent Two', 'agent2@ghumofiroo.com', 'agent']);
    
    // Seed city
    $pdo->exec("INSERT IGNORE INTO cities (id, name, state, country) VALUES (99, 'Dehradun', 'Uttarakhand', 'India')");
    
    echo "Setup successfully populated staging test profiles.\n\n";
} catch (Exception $e) {
    echo "Setup failed: " . $e->getMessage() . "\n";
    exit(1);
}

// 3. Helper to generate signed Supabase JWT
function generateSupabaseJwt($userId, $email, $secret) {
    $payload = [
        'iss' => 'supabase',
        'sub' => $userId,
        'email' => $email,
        'role' => 'authenticated',
        'aud' => 'authenticated',
        'exp' => time() + 3600,
        'iat' => time()
    ];
    return JWT::encode($payload, $secret, 'HS256');
}

// Generate tokens for three roles
$adminToken  = generateSupabaseJwt('admin-uuid-001', 'admin@ghumofiroo.com', $secret);
$agent1Token = generateSupabaseJwt('agent-uuid-001', 'agent1@ghumofiroo.com', $secret);
$agent2Token = generateSupabaseJwt('agent-uuid-002', 'agent2@ghumofiroo.com', $secret);

// Helper to make HTTP POST requests
function makePostRequest($url, $token, $data) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $httpCode, 'body' => json_decode($response, true)];
}

// Helper to make HTTP GET requests
function makeGetRequest($url, $token) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token
    ]);
    $response = curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $httpCode, 'headers' => $headers, 'body' => json_decode($body, true)];
}

// ============================================================
// Step 5: PHP Syntax Linting
// ============================================================
echo "=== Step 5: PHP Linting Verification ===\n";
$phpFiles = ['db.php', 'auth_middleware.php', 'leads_create.php', 'leads_list.php', 'communications.php'];
foreach ($phpFiles as $file) {
    $path = __DIR__ . '/' . $file;
    $output = [];
    $returnVar = 0;
    exec("php -l " . escapeshellarg($path), $output, $returnVar);
    echo "$file: " . implode("\n", $output) . "\n";
}
echo "\n";

// ============================================================
// Step 1: Create a test lead via leads_create.php (Admin)
// ============================================================
echo "=== Step 1: Create Lead via HTTP API ===\n";
$leadData = [
    'customer_name' => 'John Doe Staging Curl Test',
    'customer_phone' => '+919876543210',
    'customer_email' => 'johndoe@test.com',
    'customer_home_city' => 'Mumbai',
    'source' => 'google',
    'destination_city_id' => 99,
    'destinations' => 'Dehradun',
    'trip_start_date' => '2026-10-15',
    'trip_end_date' => '2026-10-22',
    'adult_count' => 2,
    'child_count' => 1,
    'infant_count' => 0,
    'budget' => '₹50,000 - ₹70,000',
    'duration' => '7 Nights',
    'hotel_category' => '4 Star',
    'assigned_to' => 'agent-uuid-001'
];

$res = makePostRequest('https://ghumofiroo.com/php-backend/leads_create.php', $adminToken, $leadData);
echo "HTTP Status: " . $res['status'] . "\n";
echo "Response: " . json_encode($res['body']) . "\n";

$newLeadId = $res['body']['lead_id'] ?? null;
if (!$newLeadId) {
    echo "ABORT: Failed to retrieve new lead ID from leads_create.php response!\n";
    exit(1);
}

// Verify lead row directly in staging leads table
$stmt = $pdo->prepare('SELECT * FROM leads WHERE id = ?');
$stmt->execute([$newLeadId]);
$row = $stmt->fetch();
echo "Staging Leads DB verification row:\n";
print_r($row);
echo "\n";

// ============================================================
// Step 2: Log test Note and Call via communications.php (Agent One)
// ============================================================
echo "=== Step 2: Log Communications via HTTP API ===\n";
$callData = [
    'lead_id' => $newLeadId,
    'channel' => 'call',
    'direction' => 'outbound',
    'summary' => 'Discussed routing options over introductory call.'
];
$resCall = makePostRequest('https://ghumofiroo.com/php-backend/communications.php', $agent1Token, $callData);
echo "Log Call Status: " . $resCall['status'] . " -> " . json_encode($resCall['body']) . "\n";

$noteData = [
    'lead_id' => $newLeadId,
    'channel' => 'note',
    'direction' => 'internal',
    'summary' => 'Agent One added internal note.'
];
$resNote = makePostRequest('https://ghumofiroo.com/php-backend/communications.php', $agent1Token, $noteData);
echo "Log Note Status: " . $resNote['status'] . " -> " . json_encode($resNote['body']) . "\n";

// Verify communications table rows
$stmt = $pdo->prepare('SELECT * FROM lead_communications WHERE lead_id = ? ORDER BY created_at ASC');
$stmt->execute([$newLeadId]);
$comms = $stmt->fetchAll();
echo "Staging Communications DB verification rows:\n";
print_r($comms);
echo "\n";

// ============================================================
// Step 3: Load Lead List (Admin vs. Agent One)
// ============================================================
echo "=== Step 3: Load Lead List Visibility Boundaries ===\n";
// Insert private lead assigned to Agent Two
$stmt = $pdo->prepare('INSERT INTO leads (customer_name, status, assigned_to, created_by) VALUES (?, ?, ?, ?)');
$stmt->execute(['Agent Two Private Lead', 'New', 'agent-uuid-002', 'admin-uuid-001']);
$privateLeadId = $pdo->lastInsertId();

// Query as Admin (Should see both leads)
$resAdmin = makeGetRequest('https://ghumofiroo.com/php-backend/leads_list.php', $adminToken);
echo "Admin List Status: " . $resAdmin['status'] . "\n";
echo "Leads count seen by Admin: " . count($resAdmin['body']['leads'] ?? []) . "\n";
echo "Leads details: " . json_encode(array_map(fn($l) => ['name' => $l['customer_name'], 'assigned_to' => $l['assigned_to']], $resAdmin['body']['leads'] ?? [])) . "\n";

// Query as Agent One (Should see only John Doe)
$resAgent = makeGetRequest('https://ghumofiroo.com/php-backend/leads_list.php', $agent1Token);
echo "Agent One List Status: " . $resAgent['status'] . "\n";
echo "Leads count seen by Agent One: " . count($resAgent['body']['leads'] ?? []) . "\n";
echo "Leads details: " . json_encode(array_map(fn($l) => ['name' => $l['customer_name'], 'assigned_to' => $l['assigned_to']], $resAgent['body']['leads'] ?? [])) . "\n";
echo "\n";

// ============================================================
// Step 4: Security Boundary Check (Agent Two access Agent One's lead history)
// ============================================================
echo "=== Step 4: Cross-Agent Access Gating Check ===\n";
$resSec = makeGetRequest("https://ghumofiroo.com/php-backend/communications.php?lead_id={$newLeadId}", $agent2Token);
echo "Agent Two GET Status: " . $resSec['status'] . "\n";
echo "Agent Two Response Body: " . json_encode($resSec['body']) . "\n";
echo "\n";

// ============================================================
// Scoped Cleanup: Delete ONLY created test leads
// ============================================================
try {
    $pdo->prepare('DELETE FROM leads WHERE id IN (?, ?)')
        ->execute([$newLeadId, $privateLeadId]);
    echo "Scoped Cleanup completed successfully (removed test IDs {$newLeadId} and {$privateLeadId}).\n";
} catch (Exception $e) {
    echo "Cleanup failed: " . $e->getMessage() . "\n";
}
