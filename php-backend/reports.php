<?php
error_reporting(0);
ini_set('display_errors', 0);

// reports.php — reporting API endpoint for CRM
//
// GET reports.php?type=rates

header('Content-Type: application/json');

require_once __DIR__ . '/auth_middleware.php';
require_once __DIR__ . '/db.php';

$pdo = getDb();
if (php_sapi_name() !== 'cli') {
    $user = authenticate();
    requireRole($user, $pdo, ['admin', 'manager', 'agent']);
}

$type = $_GET['type'] ?? '';

if ($type !== 'rates') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing type parameter. Use type=rates.']);
    exit;
}

function getExistingColumn($pdo, $tableName, $candidates, $fallback) {
    try {
        $stmt = $pdo->query("DESCRIBE `$tableName`");
        $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($candidates as $cand) {
            if (in_array($cand, $cols)) {
                return $cand;
            }
        }
    } catch (Exception $e) {
        // ignore and fallback
    }
    return $fallback;
}

try {
    // 1. Fetch hotels with rates and city names
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
    $rawHotels = $hotelsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format hotel rows
    $hotels = [];
    foreach ($rawHotels as $row) {
        $hotels[] = [
            'id' => (int)$row['rate_id'],
            'hotel_id' => $row['hotel_id'], // Keep as string UUID
            'hotel_name' => $row['hotel_name'],
            'city_name' => $row['city_name'],
            'star_category' => $row['star_rating'] !== null ? (int)$row['star_rating'] : null,
            'room_type' => $row['room_type'],
            'meal_plan' => $row['meal_plan'],
            'rate' => (float)$row['rate_per_night'],
            'is_active' => (bool)($row['rate_active'] && $row['hotel_active'])
        ];
    }

    // 2. Fetch cabs with rates and city names
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
    $rawCabs = $cabsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format cab rows
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

    // 3. Fetch activities with rates and city names
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
    $rawActivities = $activitiesStmt->fetchAll(PDO::FETCH_ASSOC);

    // Format activity rows
    $activities = [];
    foreach ($rawActivities as $row) {
        $activities[] = [
            'id' => (int)$row['rate_id'],
            'activity_id' => $row['activity_id'], // Keep as string UUID
            'activity_name' => $row['activity_name'],
            'city_name' => $row['city_name'],
            'category' => $row['category'],
            'rate_type' => $row['rate_type'],
            'rate' => (float)$row['adult_rate'], // primary display rate is adult cost
            'child_rate' => (float)$row['child_rate'],
            'is_active' => (bool)($row['rate_active'] && $row['activity_active'])
        ];
    }

    echo json_encode([
        'hotels' => $hotels,
        'cabs' => $cabs,
        'activities' => $activities
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch reporting metrics: ' . $e->getMessage()]);
}
