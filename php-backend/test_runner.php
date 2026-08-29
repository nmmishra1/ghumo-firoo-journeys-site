<?php
// test_runner.php — Runs Phase 1 Staging Verification tests directly via PHP CLI.
// To run: php php-backend/test_runner.php
//
// NEVER expose this file to the web root. Keep it blocked by .htaccess.

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "Forbidden: This script can only be executed via the CLI Terminal.\n";
    exit(1);
}

require_once __DIR__ . '/db.php';

$pdo = getDb();
$results = [];

// Confirm connection is pointed to staging before proceeding
$dbName = '';
try {
    $dbName = $pdo->query("SELECT DATABASE()")->fetchColumn();
    $results['current_database'] = $dbName;
    if ($dbName !== 'a17511nd_GFStaging') {
        echo "ABORT: Connection is pointed to '{$dbName}', NOT staging database 'a17511nd_GFStaging'!\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "ABORT: Failed to retrieve active database name: " . $e->getMessage() . "\n";
    exit(1);
}

// ============================================================
// Test 5: Run php -l on every PHP file in php-backend/ (Hardcoded list)
// ============================================================
$phpFiles = ['db.php', 'auth_middleware.php', 'leads_create.php', 'leads_list.php', 'communications.php'];
$results['step5_php_syntax'] = [];
foreach ($phpFiles as $file) {
    $path = __DIR__ . '/' . $file;
    $output = [];
    $returnVar = 0;
    exec("php -l " . escapeshellarg($path), $output, $returnVar);
    $results['step5_php_syntax'][$file] = [
        'status' => ($returnVar === 0) ? 'SUCCESS' : 'FAILED',
        'output' => implode("\n", $output)
    ];
}

// ============================================================
// Setup test profiles in staging for verification
// ============================================================
try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE profiles;");
    $pdo->exec("TRUNCATE TABLE leads;");
    $pdo->exec("TRUNCATE TABLE lead_communications;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Insert Admin and two Agents
    $stmt = $pdo->prepare('INSERT INTO profiles (id, full_name, email, role, approved) VALUES (?, ?, ?, ?, 1)');
    $stmt->execute(['admin-001', 'Test Admin', 'admin@test.com', 'admin']);
    $stmt->execute(['agent-001', 'Agent One', 'agent1@test.com', 'agent']);
    $stmt->execute(['agent-002', 'Agent Two', 'agent2@test.com', 'agent']);
    
    // Seed one destination city
    $pdo->exec("INSERT IGNORE INTO cities (id, name, state, country) VALUES (99, 'Dehradun', 'Uttarakhand', 'India')");
} catch (Exception $e) {
    $results['setup_error'] = $e->getMessage();
    echo json_encode($results, JSON_PRETTY_PRINT) . "\n";
    exit(1);
}

// ============================================================
// Test 1: Create a test lead in the database
// ============================================================
try {
    $stmt = $pdo->prepare(
        'INSERT INTO leads
            (customer_name, customer_phone, customer_email, customer_home_city, 
             source, source_detail, destination_city_id, destinations,
             trip_start_date, trip_end_date, adult_count, child_count, infant_count,
             budget, duration, hotel_category, status, assigned_to, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    $stmt->execute([
        'John Doe Staging Test',
        '+919876543210',
        'johndoe@test.com',
        'Mumbai',
        'google',
        'Search Ad 1',
        99,
        'Dehradun',
        '2026-10-15',
        '2026-10-22',
        2,
        1,
        0,
        '₹50,000 - ₹70,000',
        '7 Nights',
        '4 Star',
        'New',
        'agent-001', // Assigned to Agent One
        'admin-001'
    ]);
    
    $testLeadId = (int)$pdo->lastInsertId();

    // Verify row appears via SELECT
    $selectStmt = $pdo->prepare('SELECT * FROM leads WHERE id = ?');
    $selectStmt->execute([$testLeadId]);
    $leadRow = $selectStmt->fetch();
    $results['step1_create_lead'] = [
        'inserted_id' => $testLeadId,
        'verification_row' => $leadRow
    ];
} catch (Exception $e) {
    $results['step1_create_lead'] = ['error' => $e->getMessage()];
}

// ============================================================
// Test 2: Log a note and call against the lead
// ============================================================
try {
    // Log Call
    $stmt1 = $pdo->prepare(
        'INSERT INTO lead_communications (lead_id, channel, direction, summary, created_by) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt1->execute([$testLeadId, 'call', 'outbound', 'Discussed Char Dham routing options over introductory call.', 'agent-001']);
    
    // Log Note
    $stmt2 = $pdo->prepare(
        'INSERT INTO lead_communications (lead_id, channel, direction, summary, created_by) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt2->execute([$testLeadId, 'note', 'internal', 'Prefers luxury vehicles for cab transport.', 'agent-001']);

    // Fetch and verify rows
    $commStmt = $pdo->prepare('SELECT * FROM lead_communications WHERE lead_id = ? ORDER BY created_at ASC');
    $commStmt->execute([$testLeadId]);
    $comms = $commStmt->fetchAll();
    
    $results['step2_log_communications'] = [
        'comms_count' => count($comms),
        'rows' => $comms
    ];
} catch (Exception $e) {
    $results['step2_log_communications'] = ['error' => $e->getMessage()];
}

// ============================================================
// Test 3: Load lead list as Admin (all) and Agent One (assigned only)
// ============================================================
try {
    // Add another lead assigned to Agent Two
    $stmt = $pdo->prepare(
        'INSERT INTO leads
            (customer_name, status, assigned_to, created_by)
         VALUES (?, ?, ?, ?)'
    );
    $stmt->execute(['Agent Two Private Lead', 'New', 'agent-002', 'admin-001']);
    $leadId2 = (int)$pdo->lastInsertId();

    // Query 3a: Admin view (should return both leads)
    $adminStmt = $pdo->query('SELECT customer_name, assigned_to FROM leads WHERE is_deleted = 0 ORDER BY id ASC');
    $adminLeads = $adminStmt->fetchAll();

    // Query 3b: Agent One view (should return only John Doe)
    $agentStmt = $pdo->prepare('SELECT customer_name, assigned_to FROM leads WHERE assigned_to = ? AND is_deleted = 0');
    $agentStmt->execute(['agent-001']);
    $agentLeads = $agentStmt->fetchAll();

    $results['step3_leads_visibility'] = [
        'admin_leads_seen' => $adminLeads,
        'agent_one_leads_seen' => $agentLeads
    ];
} catch (Exception $e) {
    $results['step3_leads_visibility'] = ['error' => $e->getMessage()];
}

// ============================================================
// Test 4: Agent Two attempts to read Agent One's lead communications
// ============================================================
try {
    // Simulate what the GET check on communications.php does
    $leadStmt = $pdo->prepare('SELECT assigned_to FROM leads WHERE id = ? AND is_deleted = 0');
    $leadStmt->execute([$testLeadId]);
    $leadToCheck = $leadStmt->fetch();

    $isAllowed = false;
    $responseCode = 200;

    if ($leadToCheck) {
        $assignedTo = $leadToCheck['assigned_to'];
        $callerRole = 'agent';
        $callerId = 'agent-002'; // Agent Two calling

        if ($callerRole === 'admin' || $callerRole === 'manager' || $assignedTo === $callerId) {
            $isAllowed = true;
        } else {
            $responseCode = 403;
        }
    } else {
        $responseCode = 404;
    }

    $results['step4_authorization_check'] = [
        'lead_assigned_to' => $leadToCheck['assigned_to'] ?? null,
        'requesting_agent' => 'agent-002',
        'http_status_expected' => $responseCode,
        'authorized' => $isAllowed ? 'YES' : 'NO (403 Forbidden)'
    ];
} catch (Exception $e) {
    $results['step4_authorization_check'] = ['error' => $e->getMessage()];
}

// ============================================================
// Cleanup: Truncate temporary test data to leave database clean
// ============================================================
try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE profiles;");
    $pdo->exec("TRUNCATE TABLE leads;");
    $pdo->exec("TRUNCATE TABLE lead_communications;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    $results['cleanup'] = 'SUCCESS';
} catch (Exception $e) {
    $results['cleanup'] = 'FAILED: ' . $e->getMessage();
}

// Output pretty-printed JSON results
echo json_encode($results, JSON_PRETTY_PRINT) . "\n";
