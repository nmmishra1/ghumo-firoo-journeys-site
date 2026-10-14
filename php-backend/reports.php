<?php
error_reporting(0);
ini_set('display_errors', 0);

// reports.php — Enterprise Reporting & Analytics Engine for Ghumo Firoo Travels CRM
// Supported types:
// - type=rates (contracted rates catalog across hotels, cabs, activities — 100% backward compatible)
// - type=sales_summary (funnel, status metrics, source distribution, top destinations)
// - type=financial_summary (realized revenue, pipeline value, collected payments & modes)
// - type=receivables_aging (payment due aging schedule for confirmed bookings)
// - type=agent_performance (agent conversion rates, closed bookings, and revenue)
// - type=dashboard (composite analytical summary for CRM executive dashboard)

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Correlation-ID');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/auth_middleware.php';
require_once __DIR__ . '/db.php';

$pdo = getDb();
$type = $_GET['type'] ?? 'dashboard';

// Role and Authentication Check
// 'rates' allows graceful catalog reading; operational metrics require CRM staff role.
if (php_sapi_name() !== 'cli') {
    if ($type === 'rates') {
        $user = authenticateOptional();
    } else {
        $user = authenticate();
        requireRole($user, $pdo, ['admin', 'manager', 'agent']);
    }
}

/**
 * Defensive schema introspection: resolves existing physical column names dynamically
 */
function getExistingColumn($pdo, $tableName, $candidates, $fallback) {
    try {
        $stmt = $pdo->query("DESCRIBE `$tableName`");
        $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($candidates as $cand) {
            if (in_array($cand, $cols, true)) {
                return $cand;
            }
        }
    } catch (Throwable $e) {
        // Fallback gracefully
    }
    return $fallback;
}

// -------------------------------------------------------------------------
// 1. TYPE: RATES (PRESERVED 100% BACKWARD COMPATIBLE)
// -------------------------------------------------------------------------
if ($type === 'rates') {
    try {
        // Fetch hotels with rates and city names
        $hNameCol = getExistingColumn($pdo, 'hotels', ['hotel_name', 'name'], 'hotel_name');
        $hStarCol = getExistingColumn($pdo, 'hotels', ['star_rating', 'star_category'], 'star_rating');
        $hActiveCol = getExistingColumn($pdo, 'hotels', ['active_status', 'active', 'is_active'], 'active');
        $cNameCol = getExistingColumn($pdo, 'cities', ['name', 'city_name'], 'name');
        $rActiveCol = getExistingColumn($pdo, 'hotel_rates', ['is_active', 'active_status', 'active'], 'is_active');

        $hotelsStmt = $pdo->query(
            "SELECT 
                r.id AS rate_id,
                h.id AS hotel_id,
                h.{$hNameCol} AS hotel_name,
                c.{$cNameCol} AS city_name,
                h.{$hStarCol} AS star_rating,
                r.room_type,
                r.meal_plan,
                r.rate_per_night,
                r.{$rActiveCol} AS rate_active,
                h.{$hActiveCol} AS hotel_active
             FROM hotel_rates r
             JOIN hotels h ON r.hotel_id = h.id
             JOIN cities c ON h.city_id = c.id
             ORDER BY c.{$cNameCol}, h.{$hNameCol}, r.rate_per_night"
        );
        $rawHotels = $hotelsStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        $hotels = [];
        foreach ($rawHotels as $row) {
            $hotels[] = [
                'id' => (int)$row['rate_id'],
                'hotel_id' => $row['hotel_id'],
                'hotel_name' => $row['hotel_name'],
                'city_name' => $row['city_name'],
                'star_category' => $row['star_rating'] !== null ? (int)$row['star_rating'] : null,
                'room_type' => $row['room_type'],
                'meal_plan' => $row['meal_plan'],
                'rate' => (float)$row['rate_per_night'],
                'is_active' => (bool)($row['rate_active'] && $row['hotel_active'])
            ];
        }

        // Fetch cabs with rates and city names
        $vActiveCol = getExistingColumn($pdo, 'cab_vendors', ['is_active', 'active_status', 'active'], 'is_active');
        $crActiveCol = getExistingColumn($pdo, 'cab_rates', ['is_active', 'active_status', 'active'], 'is_active');
        $vNameCol = getExistingColumn($pdo, 'cab_vendors', ['name', 'vendor_name'], 'name');

        $cabsStmt = $pdo->query(
            "SELECT 
                r.id AS rate_id,
                v.id AS vendor_id,
                v.{$vNameCol} AS vendor_name,
                c.{$cNameCol} AS city_name,
                r.vehicle_type,
                r.usage_type,
                r.rate,
                r.{$crActiveCol} AS rate_active,
                v.{$vActiveCol} AS vendor_active
             FROM cab_rates r
             JOIN cab_vendors v ON r.cab_vendor_id = v.id
             JOIN cities c ON v.city_id = c.id
             ORDER BY c.{$cNameCol}, v.{$vNameCol}, r.rate"
        );
        $rawCabs = $cabsStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        $cabs = [];
        foreach ($rawCabs as $row) {
            $cabs[] = [
                'id' => (int)$row['rate_id'],
                'vendor_id' => (int)$row['vendor_id'],
                'vendor_name' => $row['vendor_name'],
                'city_name' => $row['city_name'],
                'vehicle_type' => $row['vehicle_type'],
                'usage_type' => $row['usage_type'],
                'rate' => (float)$row['rate'],
                'is_active' => (bool)($row['rate_active'] && $row['vendor_active'])
            ];
        }

        // Fetch activities with rates and city names
        $aNameCol = getExistingColumn($pdo, 'activities', ['activity_name', 'name'], 'activity_name');
        $aDestCol = getExistingColumn($pdo, 'activities', ['destination', 'city', 'city_name'], 'destination');
        $aCatCol = getExistingColumn($pdo, 'activities', ['activity_category', 'category', 'sub_category'], 'activity_category');
        $aActiveCol = getExistingColumn($pdo, 'activities', ['active_status', 'is_active', 'active'], 'active_status');
        $arActiveCol = getExistingColumn($pdo, 'activity_rates', ['is_active', 'active_status', 'active'], 'is_active');

        $activitiesStmt = $pdo->query(
            "SELECT 
                r.id AS rate_id,
                a.id AS activity_id,
                a.{$aNameCol} AS activity_name,
                a.{$aDestCol} AS city_name,
                a.{$aCatCol} AS category,
                r.rate_type,
                r.adult_rate,
                r.child_rate,
                r.{$arActiveCol} AS rate_active,
                a.{$aActiveCol} AS activity_active
             FROM activity_rates r
             JOIN activities a ON r.activity_id = a.id
             ORDER BY a.{$aDestCol}, a.{$aNameCol}"
        );
        $rawActivities = $activitiesStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        $activities = [];
        foreach ($rawActivities as $row) {
            $activities[] = [
                'id' => (int)$row['rate_id'],
                'activity_id' => $row['activity_id'],
                'activity_name' => $row['activity_name'],
                'city_name' => $row['city_name'],
                'category' => $row['category'],
                'rate_type' => $row['rate_type'],
                'rate' => (float)$row['adult_rate'],
                'child_rate' => (float)$row['child_rate'],
                'is_active' => (bool)($row['rate_active'] && $row['activity_active'])
            ];
        }

        echo json_encode([
            'hotels' => $hotels,
            'cabs' => $cabs,
            'activities' => $activities
        ]);
        exit;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch rates: ' . $e->getMessage()]);
        exit;
    }
}

// -------------------------------------------------------------------------
// PARAMETERS & DATE RANGE PARSING FOR ADVANCED REPORTS
// -------------------------------------------------------------------------
$startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
$endDate = $_GET['end_date'] ?? date('Y-m-d');
$startTime = $startDate . ' 00:00:00';
$endTime = $endDate . ' 23:59:59';

// Resolve physical columns for leads and payments
$lCreatedCol = getExistingColumn($pdo, 'leads', ['created_at', 'lead_created_date', 'date'], 'created_at');
$lValueCol   = getExistingColumn($pdo, 'leads', ['expected_booking_value', 'estimated_booking_value', 'package_cost'], 'expected_booking_value');
$lTravelCol  = getExistingColumn($pdo, 'leads', ['travel_date', 'start_date', 'departure_date', 'created_at'], 'travel_date');
$lAgentCol   = getExistingColumn($pdo, 'leads', ['assigned_agent', 'assigned_to', 'agent_name'], 'assigned_agent');
$lSourceCol  = getExistingColumn($pdo, 'leads', ['lead_source', 'source'], 'lead_source');
$lDestCol    = getExistingColumn($pdo, 'leads', ['destination', 'destinations', 'city'], 'destination');

$pDateCol    = getExistingColumn($pdo, 'payments', ['payment_date', 'created_at'], 'payment_date');
$pAmtCol     = getExistingColumn($pdo, 'payments', ['amount_received', 'amount'], 'amount_received');
$pModeCol    = getExistingColumn($pdo, 'payments', ['payment_mode', 'mode', 'method'], 'payment_mode');

// -------------------------------------------------------------------------
// 2. TYPE: RECEIVABLES AGING (PAYMENT DUE MATRIX)
// -------------------------------------------------------------------------
if ($type === 'receivables_aging') {
    try {
        $agingStmt = $pdo->query(
            "SELECT 
                l.id AS lead_id,
                l.customer_name,
                l.customer_phone,
                l.customer_email,
                COALESCE(l.{$lDestCol}, 'Tour Package') AS destination,
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
             ORDER BY travel_date ASC, lead_id DESC
             LIMIT 150"
        );
        $agingRows = $agingStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        $nowTs = time();

        $receivables = [];
        $totalOutstanding = 0;

        foreach ($agingRows as $row) {
            $totalVal = (float)$row['total_value'];
            $totalPaid = (float)$row['total_paid'];
            $pending = max(0, $totalVal - $totalPaid);
            $totalOutstanding += $pending;

            $travelDateStr = $row['travel_date'];
            $travelTs = !empty($travelDateStr) ? strtotime($travelDateStr) : 0;
            $daysUntilTravel = $travelTs ? (int)round(($travelTs - $nowTs) / 86400) : 999;

            if ($daysUntilTravel <= 0) {
                $urgency = 'Immediate / Overdue';
                $badgeVariant = 'destructive';
            } elseif ($daysUntilTravel <= 3) {
                $urgency = 'Due in 3 Days';
                $badgeVariant = 'destructive';
            } elseif ($daysUntilTravel <= 7) {
                $urgency = 'Due in 7 Days';
                $badgeVariant = 'warning';
            } elseif ($daysUntilTravel <= 15) {
                $urgency = 'Due in 15 Days';
                $badgeVariant = 'default';
            } else {
                $urgency = 'Future Departure';
                $badgeVariant = 'secondary';
            }

            $receivables[] = [
                'lead_id' => (int)$row['lead_id'],
                'customer_name' => $row['customer_name'],
                'customer_phone' => $row['customer_phone'],
                'customer_email' => $row['customer_email'],
                'destination' => $row['destination'],
                'travel_date' => $travelDateStr,
                'days_until_travel' => $daysUntilTravel,
                'assigned_agent' => $row['assigned_agent'],
                'urgency' => $urgency,
                'badge_variant' => $badgeVariant,
                'total_value' => $totalVal,
                'total_paid' => $totalPaid,
                'balance_pending' => $pending,
                'paid_percentage' => $totalVal > 0 ? round(($totalPaid / $totalVal) * 100) : 0
            ];
        }

        echo json_encode([
            'success' => true,
            'total_outstanding' => $totalOutstanding,
            'count' => count($receivables),
            'receivables' => $receivables
        ]);
        exit;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to calculate receivables aging: ' . $e->getMessage()]);
        exit;
    }
}

// -------------------------------------------------------------------------
// 3. AGGREGATION HELPERS: SALES, FINANCIALS & AGENTS
// -------------------------------------------------------------------------
try {
    // Sales Status Aggregations
    $statusStmt = $pdo->prepare(
        "SELECT status, COUNT(*) AS count, SUM(COALESCE({$lValueCol}, 0)) AS total_value
         FROM leads
         WHERE {$lCreatedCol} BETWEEN ? AND ?
         GROUP BY status"
    );
    $statusStmt->execute([$startTime, $endTime]);
    $statusRows = $statusStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $totalLeads = 0;
    $convertedCount = 0;
    $droppedCount = 0;
    $pipelineValue = 0;
    $realizedRevenue = 0;

    foreach ($statusRows as $s) {
        $c = (int)$s['count'];
        $v = (float)$s['total_value'];
        $totalLeads += $c;
        if ($s['status'] === 'Booking Confirmed') {
            $convertedCount += $c;
            $realizedRevenue += $v;
        } elseif ($s['status'] === 'Closed Lost') {
            $droppedCount += $c;
        } else {
            $pipelineValue += $v;
        }
    }
    $winRate = $totalLeads > 0 ? round(($convertedCount / $totalLeads) * 100) : 0;

    // Lead Source Attribution
    $sourceStmt = $pdo->prepare(
        "SELECT COALESCE(NULLIF(TRIM({$lSourceCol}), ''), 'Direct / Organic') AS source, 
                COUNT(*) AS count, 
                SUM(COALESCE({$lValueCol}, 0)) AS total_value
         FROM leads
         WHERE {$lCreatedCol} BETWEEN ? AND ?
         GROUP BY source
         ORDER BY count DESC"
    );
    $sourceStmt->execute([$startTime, $endTime]);
    $sourceRows = $sourceStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // Top Destinations
    $destStmt = $pdo->prepare(
        "SELECT COALESCE(NULLIF(TRIM({$lDestCol}), ''), 'Custom Itinerary') AS destination, 
                COUNT(*) AS count, 
                SUM(COALESCE({$lValueCol}, 0)) AS total_value
         FROM leads
         WHERE {$lCreatedCol} BETWEEN ? AND ?
         GROUP BY destination
         ORDER BY count DESC
         LIMIT 10"
    );
    $destStmt->execute([$startTime, $endTime]);
    $destRows = $destStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // Payments Collected
    $payStmt = $pdo->prepare(
        "SELECT 
            SUM(COALESCE({$pAmtCol}, 0)) AS total_collected,
            COUNT(*) AS total_transactions
         FROM payments
         WHERE ({$pDateCol} BETWEEN ? AND ?)
           AND (status IS NULL OR status = 'Success' OR status = 'Confirmed' OR status = 'COMPLETED')"
    );
    $payStmt->execute([$startDate, $endDate]);
    $payTotals = $payStmt->fetch(PDO::FETCH_ASSOC) ?: ['total_collected' => 0, 'total_transactions' => 0];

    // Payment Mode Breakdown
    $payModeStmt = $pdo->prepare(
        "SELECT 
            COALESCE(NULLIF(TRIM({$pModeCol}), ''), 'Direct / Bank') AS mode,
            SUM(COALESCE({$pAmtCol}, 0)) AS amount,
            COUNT(*) AS count
         FROM payments
         WHERE ({$pDateCol} BETWEEN ? AND ?)
           AND (status IS NULL OR status = 'Success' OR status = 'Confirmed' OR status = 'COMPLETED')
         GROUP BY mode
         ORDER BY amount DESC"
    );
    $payModeStmt->execute([$startDate, $endDate]);
    $modeBreakdown = $payModeStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // Agent Leaderboard
    $agentStmt = $pdo->prepare(
        "SELECT 
            COALESCE(NULLIF(TRIM(l.{$lAgentCol}), ''), 'Unassigned') AS agent_name,
            COUNT(*) AS total_assigned,
            SUM(CASE WHEN l.status = 'Booking Confirmed' THEN 1 ELSE 0 END) AS converted_count,
            SUM(CASE WHEN l.status = 'Closed Lost' THEN 1 ELSE 0 END) AS lost_count,
            SUM(CASE WHEN l.status = 'Booking Confirmed' THEN COALESCE(l.{$lValueCol}, 0) ELSE 0 END) AS realized_revenue,
            SUM(COALESCE(l.{$lValueCol}, 0)) AS pipeline_value
         FROM leads l
         WHERE l.{$lCreatedCol} BETWEEN ? AND ?
         GROUP BY agent_name
         ORDER BY converted_count DESC, realized_revenue DESC"
    );
    $agentStmt->execute([$startTime, $endTime]);
    $agentRows = $agentStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    $agentLeaderboard = [];
    foreach ($agentRows as $row) {
        $assigned = (int)$row['total_assigned'];
        $conv = (int)$row['converted_count'];
        $agentLeaderboard[] = [
            'agent_name' => $row['agent_name'],
            'total_assigned' => $assigned,
            'converted_count' => $conv,
            'lost_count' => (int)$row['lost_count'],
            'win_rate' => $assigned > 0 ? round(($conv / $assigned) * 100) : 0,
            'realized_revenue' => (float)$row['realized_revenue'],
            'pipeline_value' => (float)$row['pipeline_value']
        ];
    }

    // Response Dispatcher
    if ($type === 'sales_summary') {
        echo json_encode([
            'success' => true,
            'period' => ['start' => $startDate, 'end' => $endDate],
            'kpis' => [
                'total_leads' => $totalLeads,
                'converted_count' => $convertedCount,
                'dropped_count' => $droppedCount,
                'win_rate' => $winRate,
                'pipeline_value' => $pipelineValue,
                'realized_revenue' => $realizedRevenue
            ],
            'status_breakdown' => $statusRows,
            'source_breakdown' => $sourceRows,
            'top_destinations' => $destRows
        ]);
        exit;
    }

    if ($type === 'financial_summary') {
        echo json_encode([
            'success' => true,
            'period' => ['start' => $startDate, 'end' => $endDate],
            'kpis' => [
                'realized_revenue' => $realizedRevenue,
                'pipeline_value' => $pipelineValue,
                'total_collected' => (float)$payTotals['total_collected'],
                'total_transactions' => (int)$payTotals['total_transactions']
            ],
            'payment_modes' => $modeBreakdown
        ]);
        exit;
    }

    if ($type === 'agent_performance') {
        echo json_encode([
            'success' => true,
            'period' => ['start' => $startDate, 'end' => $endDate],
            'agents' => $agentLeaderboard
        ]);
        exit;
    }

    // Default 'dashboard' or 'all': Return composite analytical payload
    echo json_encode([
        'success' => true,
        'period' => ['start' => $startDate, 'end' => $endDate],
        'kpis' => [
            'total_leads' => $totalLeads,
            'converted_count' => $convertedCount,
            'dropped_count' => $droppedCount,
            'win_rate' => $winRate,
            'pipeline_value' => $pipelineValue,
            'realized_revenue' => $realizedRevenue,
            'total_collected' => (float)$payTotals['total_collected'],
            'total_transactions' => (int)$payTotals['total_transactions']
        ],
        'status_breakdown' => $statusRows,
        'source_breakdown' => $sourceRows,
        'top_destinations' => $destRows,
        'payment_modes' => $modeBreakdown,
        'agent_leaderboard' => $agentLeaderboard
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Reporting analytics failed: ' . $e->getMessage()]);
    exit;
}
