<?php
error_reporting(0);
ini_set('display_errors', 0);

// cron_reports_digest.php — Automated Executive Reporting Digest for Ghumo Firoo Travels
// Can be executed via:
// 1. Linux/cPanel CLI Cron: php cron_reports_digest.php
// 2. HTTP Webhook/Cron: GET /php-backend/cron_reports_digest.php?cron_key=live-secure-key-2026
// 3. Authenticated CRM Staff UI: GET /php-backend/cron_reports_digest.php?action=send_now (with Bearer token)
// 4. Preview in Browser: GET /php-backend/cron_reports_digest.php?action=preview

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Correlation-ID');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/payment_mail_helper.php';

$pdo = getDb();
$action = $_GET['action'] ?? 'send';
$cronKeyParam = $_GET['cron_key'] ?? '';
$envSecret = getenv('LEAD_WEBHOOK_SECRET') ?: 'live-secure-key-2026';

// Access Control
if (php_sapi_name() !== 'cli') {
    $hasCronKey = (!empty($cronKeyParam) && $cronKeyParam === $envSecret);
    if (!$hasCronKey) {
        require_once __DIR__ . '/auth_middleware.php';
        $user = authenticate();
        requireRole($user, $pdo, ['admin', 'manager', 'agent']);
    }
}

$recipientEmail = $_GET['recipient'] ?? getenv('REPORT_DIGEST_EMAIL') ?: 'admin@ghumofiroo.com';
$periodDays = isset($_GET['days']) && is_numeric($_GET['days']) ? (int)$_GET['days'] : 7;
$startDate = date('Y-m-d', strtotime("-{$periodDays} days"));
$endDate = date('Y-m-d');
$startTime = $startDate . ' 00:00:00';
$endTime = $endDate . ' 23:59:59';

function getCol($pdo, $table, $candidates, $fallback) {
    try {
        $stmt = $pdo->query("DESCRIBE `$table`");
        $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($candidates as $cand) {
            if (in_array($cand, $cols, true)) return $cand;
        }
    } catch (Throwable $e) {}
    return $fallback;
}

$lCreatedCol = getCol($pdo, 'leads', ['created_at', 'lead_created_date', 'date'], 'created_at');
$lValueCol   = getCol($pdo, 'leads', ['expected_booking_value', 'estimated_booking_value', 'package_cost'], 'expected_booking_value');
$lTravelCol  = getCol($pdo, 'leads', ['travel_date', 'start_date', 'departure_date', 'created_at'], 'travel_date');
$lAgentCol   = getCol($pdo, 'leads', ['assigned_agent', 'assigned_to', 'agent_name'], 'assigned_agent');
$lDestCol    = getCol($pdo, 'leads', ['destination', 'destinations', 'city'], 'destination');

$pDateCol    = getCol($pdo, 'payments', ['payment_date', 'created_at'], 'payment_date');
$pAmtCol     = getCol($pdo, 'payments', ['amount_received', 'amount'], 'amount_received');

// 1. Fetch Lead & Revenue Metrics in Period
$leadStmt = $pdo->prepare(
    "SELECT 
        COUNT(*) AS total_leads,
        SUM(CASE WHEN status = 'Booking Confirmed' THEN 1 ELSE 0 END) AS confirmed_count,
        SUM(CASE WHEN status = 'Closed Lost' THEN 1 ELSE 0 END) AS lost_count,
        SUM(CASE WHEN status = 'Booking Confirmed' THEN COALESCE({$lValueCol}, 0) ELSE 0 END) AS confirmed_revenue,
        SUM(COALESCE({$lValueCol}, 0)) AS pipeline_value
     FROM leads
     WHERE {$lCreatedCol} BETWEEN ? AND ?"
);
$leadStmt->execute([$startTime, $endTime]);
$leadData = $leadStmt->fetch(PDO::FETCH_ASSOC) ?: [
    'total_leads' => 0, 'confirmed_count' => 0, 'lost_count' => 0, 'confirmed_revenue' => 0, 'pipeline_value' => 0
];

$totalLeads = (int)$leadData['total_leads'];
$confirmedCount = (int)$leadData['confirmed_count'];
$confirmedRevenue = (float)$leadData['confirmed_revenue'];
$pipelineValue = (float)$leadData['pipeline_value'];
$winRate = $totalLeads > 0 ? round(($confirmedCount / $totalLeads) * 100) : 0;

// 2. Fetch Payments Collected in Period
$payStmt = $pdo->prepare(
    "SELECT SUM(COALESCE({$pAmtCol}, 0)) AS total_collected, COUNT(*) AS txn_count
     FROM payments
     WHERE ({$pDateCol} BETWEEN ? AND ?)
       AND (status IS NULL OR status = 'Success' OR status = 'Confirmed' OR status = 'COMPLETED')"
);
$payStmt->execute([$startDate, $endDate]);
$payData = $payStmt->fetch(PDO::FETCH_ASSOC) ?: ['total_collected' => 0, 'txn_count' => 0];
$totalCollected = (float)$payData['total_collected'];

// 3. Fetch Critical Receivables (Due in next 7 days or overdue)
$agingStmt = $pdo->query(
    "SELECT 
        l.id AS lead_id,
        l.customer_name,
        l.customer_phone,
        COALESCE(l.{$lDestCol}, 'Tour Booking') AS destination,
        COALESCE(l.{$lTravelCol}, '') AS travel_date,
        COALESCE(l.{$lAgentCol}, 'Unassigned') AS assigned_agent,
        COALESCE(l.{$lValueCol}, 0) AS total_value,
        COALESCE(SUM(p.{$pAmtCol}), 0) AS total_paid
     FROM leads l
     LEFT JOIN payments p ON p.lead_id = l.id 
          AND (p.status IS NULL OR p.status = 'Success' OR p.status = 'Confirmed' OR p.status = 'COMPLETED')
     WHERE l.status = 'Booking Confirmed'
     GROUP BY l.id
     HAVING (total_value - total_paid) > 0
     ORDER BY travel_date ASC
     LIMIT 8"
);
$criticalReceivables = $agingStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

// 4. Fetch Top Converting Agents
$agentStmt = $pdo->prepare(
    "SELECT 
        COALESCE(NULLIF(TRIM(l.{$lAgentCol}), ''), 'Unassigned') AS agent_name,
        COUNT(*) AS assigned_count,
        SUM(CASE WHEN l.status = 'Booking Confirmed' THEN 1 ELSE 0 END) AS won_count,
        SUM(CASE WHEN l.status = 'Booking Confirmed' THEN COALESCE(l.{$lValueCol}, 0) ELSE 0 END) AS won_revenue
     FROM leads l
     WHERE l.{$lCreatedCol} BETWEEN ? AND ?
     GROUP BY agent_name
     ORDER BY won_count DESC, won_revenue DESC
     LIMIT 5"
);
$agentStmt->execute([$startTime, $endTime]);
$topAgents = $agentStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

// Generate Branded HTML Email Content
$subject = "📊 Executive Performance & Collections Digest — Ghumo Firoo Travels";
$formattedRevenue = '₹' . number_format($confirmedRevenue, 2);
$formattedCollected = '₹' . number_format($totalCollected, 2);
$formattedPipeline = '₹' . number_format($pipelineValue, 2);
$dateRangeStr = date('d M Y', strtotime($startDate)) . " to " . date('d M Y', strtotime($endDate));

$receivablesRowsHtml = '';
if (empty($criticalReceivables)) {
    $receivablesRowsHtml = "<tr><td colspan='5' style='padding: 12px; text-align: center; color: #10B981; font-weight: bold;'>All departure balances are currently settled!</td></tr>";
} else {
    foreach ($criticalReceivables as $rec) {
        $bal = (float)$rec['total_value'] - (float)$rec['total_paid'];
        $receivablesRowsHtml .= "
        <tr style='border-bottom: 1px solid #E2E8F0; font-size: 13px;'>
            <td style='padding: 10px 8px; font-weight: bold;'>{$rec['customer_name']}<br><span style='color: #64748B; font-size: 11px;'>#{$rec['lead_id']} · {$rec['destination']}</span></td>
            <td style='padding: 10px 8px;'>{$rec['travel_date']}</td>
            <td style='padding: 10px 8px; font-weight: bold;'>₹" . number_format($rec['total_value']) . "</td>
            <td style='padding: 10px 8px; color: #10B981;'>₹" . number_format($rec['total_paid']) . "</td>
            <td style='padding: 10px 8px; color: #DC2626; font-weight: bold;'>₹" . number_format($bal) . "</td>
        </tr>";
    }
}

$agentRowsHtml = '';
foreach ($topAgents as $ag) {
    $agentWinRate = (int)$ag['assigned_count'] > 0 ? round(((int)$ag['won_count'] / (int)$ag['assigned_count']) * 100) : 0;
    $agentRowsHtml .= "
    <tr style='border-bottom: 1px solid #E2E8F0; font-size: 13px;'>
        <td style='padding: 10px 8px; font-weight: bold;'>{$ag['agent_name']}</td>
        <td style='padding: 10px 8px; text-align: center;'>{$ag['assigned_count']}</td>
        <td style='padding: 10px 8px; text-align: center; color: #10B981; font-weight: bold;'>{$ag['won_count']} ({$agentWinRate}%)</td>
        <td style='padding: 10px 8px; text-align: right; color: #B45309; font-weight: bold;'>₹" . number_format((float)$ag['won_revenue']) . "</td>
    </tr>";
}

$contentHtml = "
<div style='font-family: Arial, sans-serif;'>
    <div style='text-align: center; margin-bottom: 24px;'>
        <span style='background-color: #FEF3C7; color: #92400E; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 50px; text-transform: uppercase;'>Executive Performance Report</span>
        <h2 style='color: #0F172A; margin: 10px 0 4px 0;'>Performance & Receivables Briefing</h2>
        <p style='color: #64748B; font-size: 13px; margin: 0;'>Reporting Window: <strong>{$dateRangeStr}</strong></p>
    </div>

    <!-- 4 Key Metric Cards -->
    <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;'>
        <div style='background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px;'>
            <div style='font-size: 11px; color: #64748B; font-weight: bold; text-transform: uppercase;'>Confirmed Bookings</div>
            <div style='font-size: 24px; font-weight: 900; color: #0F172A; margin-top: 4px;'>{$confirmedCount} <span style='font-size: 13px; font-weight: normal; color: #10B981;'>({$winRate}% Win Rate)</span></div>
            <div style='font-size: 11px; color: #64748B; margin-top: 2px;'>From {$totalLeads} total enquiries</div>
        </div>

        <div style='background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px;'>
            <div style='font-size: 11px; color: #64748B; font-weight: bold; text-transform: uppercase;'>Realized Revenue</div>
            <div style='font-size: 24px; font-weight: 900; color: #B45309; margin-top: 4px;'>{$formattedRevenue}</div>
            <div style='font-size: 11px; color: #64748B; margin-top: 2px;'>Active Pipeline: {$formattedPipeline}</div>
        </div>

        <div style='background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px;'>
            <div style='font-size: 11px; color: #64748B; font-weight: bold; text-transform: uppercase;'>Payments Collected</div>
            <div style='font-size: 24px; font-weight: 900; color: #059669; margin-top: 4px;'>{$formattedCollected}</div>
            <div style='font-size: 11px; color: #64748B; margin-top: 2px;'>{$payData['txn_count']} confirmed gateway & bank transactions</div>
        </div>

        <div style='background-color: #FEF2F2; border: 1px solid #FECACA; padding: 16px; border-radius: 12px;'>
            <div style='font-size: 11px; color: #991B1B; font-weight: bold; text-transform: uppercase;'>Pending Collections</div>
            <div style='font-size: 24px; font-weight: 900; color: #DC2626; margin-top: 4px;'>" . count($criticalReceivables) . " <span style='font-size: 12px; font-weight: normal;'>Bookings</span></div>
            <div style='font-size: 11px; color: #B91C1C; margin-top: 2px;'>Departures requiring pre-travel clearance</div>
        </div>
    </div>

    <!-- Receivables Matrix -->
    <div style='margin-bottom: 24px;'>
        <h3 style='color: #0F172A; font-size: 14px; margin-bottom: 8px; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px;'>⚠️ Critical Receivables & Balance Matrix</h3>
        <table style='width: 100%; border-collapse: collapse; text-align: left;'>
            <thead>
                <tr style='background-color: #F1F5F9; color: #475569; font-size: 11px; text-transform: uppercase;'>
                    <th style='padding: 8px;'>Traveler</th>
                    <th style='padding: 8px;'>Departure</th>
                    <th style='padding: 8px;'>Total</th>
                    <th style='padding: 8px;'>Paid</th>
                    <th style='padding: 8px;'>Due</th>
                </tr>
            </thead>
            <tbody>
                {$receivablesRowsHtml}
            </tbody>
        </table>
    </div>

    <!-- Agent Leaderboard -->
    <div>
        <h3 style='color: #0F172A; font-size: 14px; margin-bottom: 8px; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px;'>🏆 Agent Conversion Leaderboard</h3>
        <table style='width: 100%; border-collapse: collapse; text-align: left;'>
            <thead>
                <tr style='background-color: #F1F5F9; color: #475569; font-size: 11px; text-transform: uppercase;'>
                    <th style='padding: 8px;'>Agent</th>
                    <th style='padding: 8px; text-align: center;'>Assigned</th>
                    <th style='padding: 8px; text-align: center;'>Converted</th>
                    <th style='padding: 8px; text-align: right;'>Revenue Booked</th>
                </tr>
            </thead>
            <tbody>
                {$agentRowsHtml}
            </tbody>
        </table>
    </div>

    <div style='margin-top: 24px; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px;'>
        <a href='https://ghumofiroo.com/crm/reports' style='display: inline-block; background-color: #0B1226; color: #E5C378; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;'>Open Full CRM Reports Center &rarr;</a>
    </div>
</div>
";

// If preview mode, render HTML directly in browser
if ($action === 'preview') {
    header('Content-Type: text/html; charset=utf-8');
    echo wrapLuxuryEmailTemplate($subject, $contentHtml);
    exit;
}

// Send Email Digest
$sent = sendEmailPHPMailer($recipientEmail, $subject, $contentHtml);

echo json_encode([
    'success' => $sent,
    'message' => $sent ? "Executive digest dispatched successfully to {$recipientEmail}" : "Failed to dispatch email digest. Check SMTP/Resend settings.",
    'period' => $dateRangeStr,
    'metrics' => [
        'confirmed_bookings' => $confirmedCount,
        'realized_revenue' => $confirmedRevenue,
        'total_collected' => $totalCollected,
        'pending_receivables_count' => count($criticalReceivables)
    ]
]);
