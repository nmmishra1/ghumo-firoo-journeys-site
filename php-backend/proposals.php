<?php
// php-backend/proposals.php — Multi-Option Itinerary Proposals Management
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';

// 1. IP Rate Limiting
checkRateLimit(120, 60);

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$realAction = $_GET['action'] ?? '';

// 2. Ensure schema exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `proposals` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `lead_id` INT NOT NULL,
        `option_number` INT DEFAULT 1,
        `option_name` VARCHAR(100) DEFAULT 'Option 1',
        `title` VARCHAR(255) NULL,
        `total_price` DECIMAL(12,2) DEFAULT 0.00,
        `price_per_person` DECIMAL(12,2) DEFAULT 0.00,
        `currency` VARCHAR(10) DEFAULT 'INR',
        `status` VARCHAR(50) DEFAULT 'Draft',
        `expiry_date` DATE NULL,
        `payment_schedule` JSON NULL,
        `itinerary_data` LONGTEXT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_lead_option` (`lead_id`, `option_number`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (Exception $e) {
    error_log("Proposals table check error: " . $e->getMessage());
}

// 3. Authentication
$user = null;
try {
    $user = authenticate();
} catch (Throwable $t) {
    // If GET and no auth token, only allow read-only preview if lead_id or proposal_id is specified
    if ($method !== 'GET') {
        respondUnauthorized("Authentication required to modify proposals: " . $t->getMessage());
    }
}

try {
    if ($method === 'GET') {
        $lead_id = isset($_GET['lead_id']) ? intval($_GET['lead_id']) : 0;
        $proposal_id = isset($_GET['id']) ? intval($_GET['id']) : (isset($_GET['proposal_id']) ? intval($_GET['proposal_id']) : 0);

        if ($proposal_id > 0) {
            $stmt = $pdo->prepare("SELECT * FROM proposals WHERE id = ?");
            $stmt->execute([$proposal_id]);
            $p = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$p) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Proposal option not found']);
                exit();
            }
            $p['payment_schedule'] = is_string($p['payment_schedule']) ? json_decode($p['payment_schedule'], true) : ($p['payment_schedule'] ?? []);
            $p['itinerary_data'] = is_string($p['itinerary_data']) ? json_decode($p['itinerary_data'], true) : ($p['itinerary_data'] ?? []);
            echo json_encode(['status' => 'success', 'action' => $realAction ?: 'get_proposal', 'data' => $p]);
            exit();
        }

        if ($lead_id <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Valid lead_id parameter is required']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM proposals WHERE lead_id = ? ORDER BY option_number ASC, created_at DESC");
        $stmt->execute([$lead_id]);
        $proposals = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode JSON fields
        foreach ($proposals as &$p) {
            $p['payment_schedule'] = is_string($p['payment_schedule']) ? json_decode($p['payment_schedule'], true) : ($p['payment_schedule'] ?? []);
            $p['itinerary_data'] = is_string($p['itinerary_data']) ? json_decode($p['itinerary_data'], true) : ($p['itinerary_data'] ?? []);
        }

        echo json_encode([
            'status' => 'success', 
            'action' => $realAction ?: 'list_proposals', 
            'data' => $proposals,
            'count' => count($proposals)
        ]);
        exit();
    }

    // Require staff role for mutating methods (POST, PUT, DELETE)
    if ($user) {
        requireRole($user, $pdo, ['admin', 'manager', 'agent']);
    } else {
        respondUnauthorized("Authentication required to create or modify proposals");
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true) ?? $_POST;

        $lead_id = intval($input['lead_id'] ?? 0);
        if ($lead_id <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Valid lead_id is required']);
            exit();
        }

        // Get max option number for this lead
        $stmtNum = $pdo->prepare("SELECT COALESCE(MAX(option_number), 0) + 1 AS next_opt FROM proposals WHERE lead_id = ?");
        $stmtNum->execute([$lead_id]);
        $nextOpt = intval($stmtNum->fetchColumn() ?: 1);

        $option_number = intval($input['option_number'] ?? $nextOpt);
        $option_name = trim($input['option_name'] ?? ("Option " . $option_number));
        $title = trim($input['title'] ?? ("Trip Proposal Option " . $option_number));
        $total_price = floatval($input['total_price'] ?? 0);
        $price_per_person = floatval($input['price_per_person'] ?? ($total_price > 0 ? $total_price / 2 : 0));
        $currency = $input['currency'] ?? 'INR';
        $status = $input['status'] ?? 'Draft';
        $expiry_date = $input['expiry_date'] ?? date('Y-m-d', strtotime('+7 days'));
        
        $payment_schedule = isset($input['payment_schedule']) ? json_encode($input['payment_schedule']) : json_encode([
            ['label' => 'Booking Amount (Token)', 'amount' => round($total_price * 0.20), 'due_date' => date('Y-m-d')],
            ['label' => '1st Installment (50% Advance)', 'amount' => round($total_price * 0.30), 'due_date' => date('Y-m-d', strtotime('+5 days'))],
            ['label' => 'Final Balance', 'amount' => round($total_price * 0.50), 'due_date' => date('Y-m-d', strtotime('+15 days'))]
        ]);
        $itinerary_data = isset($input['itinerary_data']) ? json_encode($input['itinerary_data']) : json_encode([]);

        $stmt = $pdo->prepare("INSERT INTO proposals (lead_id, option_number, option_name, title, total_price, price_per_person, currency, status, expiry_date, payment_schedule, itinerary_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$lead_id, $option_number, $option_name, $title, $total_price, $price_per_person, $currency, $status, $expiry_date, $payment_schedule, $itinerary_data]);
        
        $new_id = (int)$pdo->lastInsertId();

        writeAuditLog($pdo, 'proposals', (string)$new_id, 'CREATE_PROPOSAL_OPTION', null, "Created Option {$option_number}: {$title} (₹{$total_price})", $user);

        echo json_encode([
            'status' => 'success', 
            'action' => $realAction ?: 'create_proposal_option',
            'message' => "Proposal Option {$option_number} created successfully", 
            'proposal_id' => $new_id,
            'option_number' => $option_number,
            'option_name' => $option_name
        ]);
        exit();
    }

    if ($method === 'PUT') {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true) ?? [];

        $proposal_id = intval($input['proposal_id'] ?? ($input['id'] ?? ($_GET['id'] ?? 0)));
        $lead_id = intval($input['lead_id'] ?? 0);
        $action = $input['action'] ?? ($realAction ?: 'update');

        if ($action === 'accept') {
            if ($proposal_id <= 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Valid proposal_id is required to accept']);
                exit();
            }

            // Fetch proposal to confirm lead_id and details
            $stmtP = $pdo->prepare("SELECT * FROM proposals WHERE id = ?");
            $stmtP->execute([$proposal_id]);
            $accepted = $stmtP->fetch(PDO::FETCH_ASSOC);
            if (!$accepted) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Proposal option not found']);
                exit();
            }

            if ($lead_id <= 0) {
                $lead_id = (int)$accepted['lead_id'];
            }

            // 1. Mark selected proposal as Accepted and other proposals for this lead as Archived
            $pdo->prepare("UPDATE proposals SET status = 'Archived' WHERE lead_id = ? AND id != ? AND status != 'Expired'")->execute([$lead_id, $proposal_id]);
            $pdo->prepare("UPDATE proposals SET status = 'Accepted' WHERE id = ?")->execute([$proposal_id]);
            
            // 2. Update lead status to Booking Confirmed & sync expected value
            $pdo->prepare("UPDATE leads SET status = 'Booking Confirmed', expected_booking_value = ? WHERE id = ?")->execute([$accepted['total_price'], $lead_id]);

            // 3. Sync accepted itinerary_data snapshot to main itineraries table if present
            $itinerarySynced = false;
            $itinData = is_string($accepted['itinerary_data']) ? json_decode($accepted['itinerary_data'], true) : ($accepted['itinerary_data'] ?? []);
            if (!empty($itinData) && is_array($itinData)) {
                try {
                    $itinId = $itinData['id'] ?? ('itin-' . $lead_id . '-' . $proposal_id);
                    $destStr = is_array($itinData['destinations'] ?? null) ? json_encode($itinData['destinations']) : ($itinData['destinations'] ?? ($accepted['title'] ?? 'Confirmed Itinerary'));
                    
                    $checkStmt = $pdo->prepare("SELECT id FROM itineraries WHERE lead_id = ? LIMIT 1");
                    $checkStmt->execute([$lead_id]);
                    $existingItinId = $checkStmt->fetchColumn();

                    $targetItinId = $existingItinId ?: $itinId;

                    $stmtSync = $pdo->prepare("INSERT INTO itineraries 
                        (id, lead_id, itinerary_name, destinations, total_nights, final_cost, status)
                        VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')
                        ON DUPLICATE KEY UPDATE 
                        itinerary_name = VALUES(itinerary_name),
                        destinations = VALUES(destinations),
                        final_cost = VALUES(final_cost),
                        status = 'Confirmed'
                    ");
                    $stmtSync->execute([
                        $targetItinId,
                        $lead_id,
                        $accepted['title'],
                        $destStr,
                        intval($itinData['total_nights'] ?? 3),
                        floatval($accepted['total_price'])
                    ]);
                    $itinerarySynced = true;
                } catch (Exception $syncEx) {
                    error_log("Itinerary snapshot sync warning: " . $syncEx->getMessage());
                }
            }

            writeAuditLog($pdo, 'proposals', (string)$proposal_id, 'ACCEPT_PROPOSAL', null, "Accepted Proposal Option {$accepted['option_number']} ({$accepted['title']}) - Lead #{$lead_id} Confirmed", $user);

            echo json_encode([
                'status' => 'success', 
                'action' => 'accept_proposal',
                'proposal_id' => $proposal_id,
                'lead_id' => $lead_id,
                'option_number' => $accepted['option_number'],
                'total_price' => $accepted['total_price'],
                'lead_status' => 'Booking Confirmed',
                'itinerary_synced' => $itinerarySynced,
                'message' => "Proposal Option {$accepted['option_number']} accepted! Lead status updated to Booking Confirmed."
            ]);
            exit();
        }

        if ($proposal_id > 0) {
            $fields = [];
            $params = [];
            if (isset($input['option_name'])) { $fields[] = "option_name = ?"; $params[] = trim($input['option_name']); }
            if (isset($input['title'])) { $fields[] = "title = ?"; $params[] = trim($input['title']); }
            if (isset($input['status'])) { $fields[] = "status = ?"; $params[] = $input['status']; }
            if (isset($input['total_price'])) { $fields[] = "total_price = ?"; $params[] = floatval($input['total_price']); }
            if (isset($input['price_per_person'])) { $fields[] = "price_per_person = ?"; $params[] = floatval($input['price_per_person']); }
            if (isset($input['currency'])) { $fields[] = "currency = ?"; $params[] = $input['currency']; }
            if (isset($input['expiry_date'])) { $fields[] = "expiry_date = ?"; $params[] = $input['expiry_date']; }
            if (isset($input['payment_schedule'])) { 
                $fields[] = "payment_schedule = ?"; 
                $params[] = is_string($input['payment_schedule']) ? $input['payment_schedule'] : json_encode($input['payment_schedule']); 
            }
            if (isset($input['itinerary_data'])) { 
                $fields[] = "itinerary_data = ?"; 
                $params[] = is_string($input['itinerary_data']) ? $input['itinerary_data'] : json_encode($input['itinerary_data']); 
            }
            
            if (count($fields) > 0) {
                $params[] = $proposal_id;
                $stmt = $pdo->prepare("UPDATE proposals SET " . implode(", ", $fields) . " WHERE id = ?");
                $stmt->execute($params);
            }

            writeAuditLog($pdo, 'proposals', (string)$proposal_id, 'UPDATE_PROPOSAL_OPTION', null, "Updated proposal option #{$proposal_id}", $user);

            echo json_encode([
                'status' => 'success', 
                'action' => $realAction ?: 'update_proposal_option',
                'message' => 'Proposal updated successfully',
                'proposal_id' => $proposal_id
            ]);
            exit();
        }

        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Valid proposal_id is required for update']);
        exit();
    }

    if ($method === 'DELETE') {
        $proposal_id = isset($_GET['id']) ? intval($_GET['id']) : (isset($_GET['proposal_id']) ? intval($_GET['proposal_id']) : 0);
        if ($proposal_id <= 0) {
            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true) ?? [];
            $proposal_id = intval($input['id'] ?? ($input['proposal_id'] ?? 0));
        }

        if ($proposal_id <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Valid proposal id is required to delete']);
            exit();
        }

        $stmtLookup = $pdo->prepare("SELECT title, option_number, lead_id FROM proposals WHERE id = ?");
        $stmtLookup->execute([$proposal_id]);
        $prop = $stmtLookup->fetch(PDO::FETCH_ASSOC);

        $stmtDel = $pdo->prepare("DELETE FROM proposals WHERE id = ?");
        $stmtDel->execute([$proposal_id]);

        writeAuditLog($pdo, 'proposals', (string)$proposal_id, 'DELETE_PROPOSAL_OPTION', $prop['title'] ?? "Option {$prop['option_number']}", "Deleted from database", $user);

        echo json_encode([
            'status' => 'success', 
            'action' => $realAction ?: 'delete_proposal_option',
            'id' => $proposal_id,
            'item_name' => $prop['title'] ?? "Option {$prop['option_number']}",
            'status_code' => 'DELETED_FROM_DATABASE',
            'message' => 'Proposal option deleted successfully'
        ]);
        exit();
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
