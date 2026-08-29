<?php
// php-backend/proposals.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $lead_id = isset($_GET['lead_id']) ? intval($_GET['lead_id']) : 0;
        if ($lead_id <= 0) {
            echo json_encode(['status' => 'error', 'message' => 'Valid lead_id parameter is required']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM proposals WHERE lead_id = ? ORDER BY option_number ASC, created_at DESC");
        $stmt->execute([$lead_id]);
        $proposals = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode JSON fields
        foreach ($proposals as &$p) {
            $p['payment_schedule'] = json_decode($p['payment_schedule'] ?? '[]', true);
            $p['itinerary_data'] = json_decode($p['itinerary_data'] ?? '{}', true);
        }

        echo json_encode(['status' => 'success', 'data' => $proposals]);
        exit();
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true) ?? $_POST;

        $lead_id = intval($input['lead_id'] ?? 0);
        if ($lead_id <= 0) {
            echo json_encode(['status' => 'error', 'message' => 'Valid lead_id is required']);
            exit();
        }

        // Get max option number for this lead
        $stmtNum = $pdo->prepare("SELECT COALESCE(MAX(option_number), 0) + 1 AS next_opt FROM proposals WHERE lead_id = ?");
        $stmtNum->execute([$lead_id]);
        $nextOpt = intval($stmtNum->fetchColumn() ?: 1);

        $option_number = intval($input['option_number'] ?? $nextOpt);
        $option_name = $input['option_name'] ?? ("Option " . $option_number);
        $title = $input['title'] ?? "Trip Proposal Option " . $option_number;
        $total_price = floatval($input['total_price'] ?? 0);
        $price_per_person = floatval($input['price_per_person'] ?? ($total_price / 2));
        $currency = $input['currency'] ?? 'INR';
        $status = $input['status'] ?? 'Sent';
        $expiry_date = $input['expiry_date'] ?? date('Y-m-d', strtotime('+7 days'));
        $payment_schedule = json_encode($input['payment_schedule'] ?? [
            ['label' => 'Booking Amount (Token)', 'amount' => round($total_price * 0.20), 'due_date' => date('Y-m-d')],
            ['label' => '1st Installment (50% Advance)', 'amount' => round($total_price * 0.30), 'due_date' => date('Y-m-d', strtotime('+5 days'))],
            ['label' => 'Final Balance', 'amount' => round($total_price * 0.50), 'due_date' => date('Y-m-d', strtotime('+15 days'))]
        ]);
        $itinerary_data = json_encode($input['itinerary_data'] ?? []);

        $stmt = $pdo->prepare("INSERT INTO proposals (lead_id, option_number, option_name, title, total_price, price_per_person, currency, status, expiry_date, payment_schedule, itinerary_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$lead_id, $option_number, $option_name, $title, $total_price, $price_per_person, $currency, $status, $expiry_date, $payment_schedule, $itinerary_data]);
        
        $new_id = $pdo->lastInsertId();
        echo json_encode(['status' => 'success', 'message' => 'Proposal option created successfully', 'proposal_id' => $new_id]);
        exit();
    }

    if ($method === 'PUT') {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true);

        $proposal_id = intval($input['proposal_id'] ?? 0);
        $lead_id = intval($input['lead_id'] ?? 0);
        $action = $input['action'] ?? 'update';

        if ($action === 'accept') {
            // Mark selected proposal as Accepted and other proposals for this lead as Archived
            $pdo->prepare("UPDATE proposals SET status = 'Archived' WHERE lead_id = ? AND status != 'Expired'")->execute([$lead_id]);
            $pdo->prepare("UPDATE proposals SET status = 'Accepted' WHERE id = ?")->execute([$proposal_id]);
            
            // Also update lead booking status to Booking Confirmed
            $pdo->prepare("UPDATE leads SET status = 'Booking Confirmed' WHERE id = ?")->execute([$lead_id]);

            echo json_encode(['status' => 'success', 'message' => 'Proposal Option accepted and lead status updated to Booking Confirmed!']);
            exit();
        }

        if ($proposal_id > 0) {
            $fields = [];
            $params = [];
            if (isset($input['status'])) { $fields[] = "status = ?"; $params[] = $input['status']; }
            if (isset($input['total_price'])) { $fields[] = "total_price = ?"; $params[] = floatval($input['total_price']); }
            if (isset($input['price_per_person'])) { $fields[] = "price_per_person = ?"; $params[] = floatval($input['price_per_person']); }
            if (isset($input['expiry_date'])) { $fields[] = "expiry_date = ?"; $params[] = $input['expiry_date']; }
            
            if (count($fields) > 0) {
                $params[] = $proposal_id;
                $stmt = $pdo->prepare("UPDATE proposals SET " . implode(", ", $fields) . " WHERE id = ?");
                $stmt->execute($params);
            }
            echo json_encode(['status' => 'success', 'message' => 'Proposal updated successfully']);
            exit();
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
