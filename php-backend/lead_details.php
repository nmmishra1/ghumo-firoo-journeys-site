<?php
// lead_details.php — Consolidated endpoint for fetching a single lead's profile,
// payments, documents, followups, and destination-scoped recommendations in 1 single HTTP request.

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

$leadId = isset($_GET['id']) ? (int)$_GET['id'] : (isset($_GET['lead_id']) ? (int)$_GET['lead_id'] : 0);

if ($leadId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid lead id parameter is required']);
    exit;
}

function tableExists(PDO $pdo, string $table): bool {
    static $cache = [];
    if (!isset($cache[$table])) {
        try {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
            $stmt->execute([$table]);
            $cache[$table] = (int)$stmt->fetchColumn() > 0;
        } catch (Exception $e) {
            $cache[$table] = false;
        }
    }
    return $cache[$table];
}

try {
    // 1. Fetch Lead Profile
    $lead = null;
    if (tableExists($pdo, 'leads')) {
        $leadStmt = $pdo->prepare('SELECT * FROM leads WHERE id = ?');
        $leadStmt->execute([$leadId]);
        $lead = $leadStmt->fetch(PDO::FETCH_ASSOC);
    }

    if (!$lead) {
        http_response_code(404);
        echo json_encode(['error' => 'Lead not found']);
        exit;
    }

    // Enrich Lead Profile fields dynamically if null
    if (empty($lead['whatsapp_number'])) {
        $lead['whatsapp_number'] = $lead['customer_phone'] ?? null;
    }

    if (!empty($lead['assigned_to']) && empty($lead['agent_name'])) {
        try {
            $aStmt = $pdo->prepare("SELECT full_name FROM profiles WHERE id = ? OR supabase_uid = ? LIMIT 1");
            $aStmt->execute([$lead['assigned_to'], $lead['assigned_to']]);
            $lead['agent_name'] = $aStmt->fetchColumn() ?: 'Super Admin';
        } catch (Exception $ae) {
            $lead['agent_name'] = 'Super Admin';
        }
    }

    if ((empty($lead['duration']) || empty($lead['number_of_nights'])) && !empty($lead['destinations'])) {
        if (preg_match('/(\d+)N\s*\/\s*(\d+)D/i', $lead['destinations'], $mN)) {
            $lead['number_of_nights'] = (int)$mN[1];
            $lead['duration'] = "{$mN[1]} Nights / {$mN[2]} Days";
        }
    }

    // 2. Fetch Payments & Calculate Totals
    $payments = [];
    $totalPaid = 0.0;
    if (tableExists($pdo, 'payments')) {
        try {
            $payStmt = $pdo->prepare('SELECT * FROM payments WHERE lead_id = ? ORDER BY payment_date DESC, id DESC');
            $payStmt->execute([$leadId]);
            $payments = $payStmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($payments as $p) {
                $st = strtolower(trim($p['status'] ?? ''));
                if (in_array($st, ['success', 'completed', 'verified', 'paid']) || empty($st)) {
                    $totalPaid += (float)($p['amount_received'] ?? 0);
                }
            }
        } catch (Exception $e) {}
    }

    $packagePrice = (float)($lead['package_price'] ?? $lead['expected_booking_value'] ?? 0);
    $isBookingConfirmed = strtolower(trim($lead['status'] ?? '')) === 'booking confirmed';
    $advancePaidVerified = $isBookingConfirmed || ($packagePrice > 0 && $totalPaid >= (0.5 * $packagePrice)) || ($totalPaid > 0 && $packagePrice <= 0);

    $lead['total_paid_amount'] = $totalPaid;
    $lead['advance_paid_verified'] = $advancePaidVerified;

    // 3. Fetch Documents
    $documents = [];
    if (tableExists($pdo, 'documents')) {
        try {
            $docStmt = $pdo->prepare('SELECT * FROM documents WHERE lead_id = ? ORDER BY created_at DESC, id DESC');
            $docStmt->execute([$leadId]);
            $documents = $docStmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {}
    }

    // 4. Fetch Communications & Follow-ups
    $followups = [];
    if (tableExists($pdo, 'lead_communications')) {
        try {
            $fStmt = $pdo->prepare('SELECT id, lead_id, channel AS type, summary AS remarks, summary AS content, direction, created_by AS agent, created_at AS timestamp, created_at AS date FROM lead_communications WHERE lead_id = ? ORDER BY created_at DESC, id DESC');
            $fStmt->execute([$leadId]);
            $followups = $fStmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {}
    }

    // 5. Fetch Multi-Option Proposals
    $proposals = [];
    if (tableExists($pdo, 'proposals')) {
        try {
            $propStmt = $pdo->prepare('SELECT * FROM proposals WHERE lead_id = ? ORDER BY option_number ASC, id ASC');
            $propStmt->execute([$leadId]);
            $rawProposals = $propStmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rawProposals as $rp) {
                if (!empty($rp['itinerary_data']) && is_string($rp['itinerary_data'])) {
                    $decoded = json_decode($rp['itinerary_data'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $rp['itinerary_data'] = $decoded;
                    }
                }
                if (!empty($rp['payment_schedule']) && is_string($rp['payment_schedule'])) {
                    $decodedSched = json_decode($rp['payment_schedule'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $rp['payment_schedule'] = $decodedSched;
                    }
                }
                $proposals[] = $rp;
            }
        } catch (Exception $e) {}
    }

    echo json_encode([
        'success'               => true,
        'lead'                  => $lead,
        'total_paid_amount'     => $totalPaid,
        'advance_paid_verified' => $advancePaidVerified,
        'proposals'             => $proposals,
        'payments'              => $payments ?: [],
        'documents'             => $documents ?: [],
        'followups'             => $followups ?: []
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch lead details: ' . $e->getMessage()]);
}
