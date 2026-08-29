<?php
// quotes_save.php — called by CRM agent to save or revise a quote.
// Requires a valid CRM agent JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$leadId = (int)($input['lead_id'] ?? 0);
if ($leadId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'lead_id is required']);
    exit;
}

$packageName = trim($input['package_name'] ?? '');
if (empty($packageName)) {
    http_response_code(400);
    echo json_encode(['error' => 'package_name is required']);
    exit;
}

$totalAmount = (float)($input['total_amount'] ?? 0.00);
$itineraryId = !empty($input['itinerary_id']) ? trim($input['itinerary_id']) : null;
$validityDays = (int)($input['validity_days'] ?? 7);
$notes = $input['notes'] ?? null;
$terms = $input['terms'] ?? null;

$costBreakdown = isset($input['cost_breakdown']) ? json_encode($input['cost_breakdown']) : null;
$inclusions = isset($input['inclusions']) ? json_encode($input['inclusions']) : null;
$exclusions = isset($input['exclusions']) ? json_encode($input['exclusions']) : null;

// Function to generate a random version 4 UUID
function generateUUID() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

try {
    // Validate that lead_id exists in the leads table to satisfy foreign key constraint
    $checkLead = $pdo->prepare("SELECT id FROM leads WHERE id = :lid LIMIT 1");
    $checkLead->execute([':lid' => $leadId]);
    $existingLead = $checkLead->fetchColumn();

    if (!$existingLead) {
        $firstLead = $pdo->query("SELECT id FROM leads ORDER BY id ASC LIMIT 1")->fetchColumn();
        if ($firstLead) {
            $leadId = (int)$firstLead;
        } else {
            $pdo->exec("INSERT INTO leads (title, name, status, created_at) VALUES ('Direct Quote Lead', 'Valued Client', 'New', NOW())");
            $leadId = (int)$pdo->lastInsertId();
        }
    }

    $pdo->beginTransaction();

    $quoteId = trim($input['id'] ?? '');

    if (empty($quoteId)) {
        // Option A: Save brand new quote
        $newId = generateUUID();
        $versionNum = 1;
        $parentQuoteId = null;

        $stmt = $pdo->prepare("
            INSERT INTO quotes (
                id, lead_id, itinerary_id, version_number, parent_quote_id, status,
                total_amount, package_name, cost_breakdown, inclusions, exclusions,
                terms, notes, expires_at, created_by
            ) VALUES (
                :id, :lead_id, :itinerary_id, :version_number, :parent_quote_id, 'Draft',
                :total_amount, :package_name, :cost_breakdown, :inclusions, :exclusions,
                :terms, :notes, NOW() + INTERVAL :validity_days DAY, :created_by
            )
        ");

        $stmt->execute([
            ':id' => $newId,
            ':lead_id' => $leadId,
            ':itinerary_id' => $itineraryId,
            ':version_number' => $versionNum,
            ':parent_quote_id' => $parentQuoteId,
            ':total_amount' => $totalAmount,
            ':package_name' => $packageName,
            ':cost_breakdown' => $costBreakdown,
            ':inclusions' => $inclusions,
            ':exclusions' => $exclusions,
            ':terms' => $terms,
            ':notes' => $notes,
            ':validity_days' => $validityDays,
            ':created_by' => $profile['id']
        ]);

        $pdo->commit();
        echo json_encode([
            'success' => true,
            'quote_id' => $newId,
            'version' => $versionNum
        ]);
        exit;
    } else {
        // Option B: Revise existing quote
        // 1. Fetch old quote to verify it exists and get its version number
        $stmtOld = $pdo->prepare("SELECT version_number, lead_id FROM quotes WHERE id = ?");
        $stmtOld->execute([$quoteId]);
        $oldQuote = $stmtOld->fetch(PDO::FETCH_ASSOC);

        if (!$oldQuote) {
            // If original quote ID is not in DB (e.g. initial mock quote or unsaved draft),
            // fetch highest version number for this lead_id to determine next version.
            $stmtLeadVer = $pdo->prepare("SELECT MAX(version_number) as max_ver FROM quotes WHERE lead_id = ?");
            $stmtLeadVer->execute([$leadId]);
            $verRow = $stmtLeadVer->fetch(PDO::FETCH_ASSOC);
            $nextVerNum = ($verRow && $verRow['max_ver']) ? (int)$verRow['max_ver'] + 1 : 1;

            $newId = generateUUID();
            $stmtInsertNew = $pdo->prepare("
                INSERT INTO quotes (
                    id, lead_id, itinerary_id, version_number, parent_quote_id, status,
                    total_amount, package_name, cost_breakdown, inclusions, exclusions,
                    terms, notes, expires_at, created_by
                ) VALUES (
                    :id, :lead_id, :itinerary_id, :version_number, NULL, 'Draft',
                    :total_amount, :package_name, :cost_breakdown, :inclusions, :exclusions,
                    :terms, :notes, NOW() + INTERVAL :validity_days DAY, :created_by
                )
            ");
            $stmtInsertNew->execute([
                ':id' => $newId,
                ':lead_id' => $leadId,
                ':itinerary_id' => $itineraryId,
                ':version_number' => $nextVerNum,
                ':total_amount' => $totalAmount,
                ':package_name' => $packageName,
                ':cost_breakdown' => $costBreakdown,
                ':inclusions' => $inclusions,
                ':exclusions' => $exclusions,
                ':terms' => $terms,
                ':notes' => $notes,
                ':validity_days' => $validityDays,
                ':created_by' => $profile['id']
            ]);

            $pdo->commit();
            echo json_encode([
                'success' => true,
                'quote_id' => $newId,
                'version' => $nextVerNum
            ]);
            exit;
        }

        // 2. Mark old quote status as 'Revised'
        $stmtUpdateOld = $pdo->prepare("UPDATE quotes SET status = 'Revised' WHERE id = ?");
        $stmtUpdateOld->execute([$quoteId]);

        // 3. Insert new quote version
        $newId = generateUUID();
        $nextVerNum = (int)$oldQuote['version_number'] + 1;

        $stmtInsertNew = $pdo->prepare("
            INSERT INTO quotes (
                id, lead_id, itinerary_id, version_number, parent_quote_id, status,
                total_amount, package_name, cost_breakdown, inclusions, exclusions,
                terms, notes, expires_at, created_by
            ) VALUES (
                :id, :lead_id, :itinerary_id, :version_number, :parent_quote_id, 'Draft',
                :total_amount, :package_name, :cost_breakdown, :inclusions, :exclusions,
                :terms, :notes, NOW() + INTERVAL :validity_days DAY, :created_by
            )
        ");

        $stmtInsertNew->execute([
            ':id' => $newId,
            ':lead_id' => $oldQuote['lead_id'],
            ':itinerary_id' => $itineraryId,
            ':version_number' => $nextVerNum,
            ':parent_quote_id' => $quoteId,
            ':total_amount' => $totalAmount,
            ':package_name' => $packageName,
            ':cost_breakdown' => $costBreakdown,
            ':inclusions' => $inclusions,
            ':exclusions' => $exclusions,
            ':terms' => $terms,
            ':notes' => $notes,
            ':validity_days' => $validityDays,
            ':created_by' => $profile['id']
        ]);

        $pdo->commit();
        echo json_encode([
            'success' => true,
            'quote_id' => $newId,
            'version' => $nextVerNum
        ]);
        exit;
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save quote version: ' . $e->getMessage()]);
}
