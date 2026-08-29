<?php
// inventory_by_city.php — called by the itinerary builder once a lead's
// destination city is known. Returns only hotel/cab/activity rates for
// that city, so agents never see irrelevant inventory.
//
// GET inventory_by_city.php?city_id=3

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

// The `cities` table's display-name column has historically been referred to
// as both `city_name` and `name` in different parts of this codebase. Detect
// which one actually exists instead of hardcoding it, so this file doesn't
// silently 500 on whichever schema is live.
function resolveCityNameColumn(PDO $pdo): string {
    static $cached = null;
    if ($cached === null) {
        $stmt = $pdo->prepare(
            "SELECT COLUMN_NAME FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cities'
               AND COLUMN_NAME IN ('city_name', 'name')
             ORDER BY FIELD(COLUMN_NAME, 'city_name', 'name') LIMIT 1"
        );
        $stmt->execute();
        $cached = $stmt->fetchColumn() ?: 'city_name';
    }
    return $cached;
}
$cityNameCol = resolveCityNameColumn($pdo);

$cityParam = $_GET['city_id'] ?? '';
$cityNameParam = $_GET['city_name'] ?? '';
$cityId = 0;

if (is_numeric($cityParam) && (int)$cityParam > 0) {
    $cityId = (int)$cityParam;
}

$lookupName = !empty($cityNameParam) ? $cityNameParam : (!is_numeric($cityParam) ? $cityParam : '');

if ($cityId <= 0 && !empty($lookupName)) {
    // Look up by name in the local MySQL database
    $stmt = $pdo->prepare("SELECT id FROM cities WHERE LOWER(`$cityNameCol`) = LOWER(?) LIMIT 1");
    $stmt->execute([$lookupName]);
    $row = $stmt->fetch();
    if ($row) {
        $cityId = (int)$row['id'];
    }
}

// Resolve display city name
$cityName = !empty($cityNameParam) ? $cityNameParam : (!empty($lookupName) ? $lookupName : '');
if ($cityId > 0 && empty($cityName)) {
    $cityNameRow = $pdo->prepare("SELECT `$cityNameCol` AS name FROM cities WHERE id = ?");
    $cityNameRow->execute([$cityId]);
    $cityName = $cityNameRow->fetchColumn() ?: '';
}

if ($cityId <= 0 && empty($cityName)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid city_id or city_name is required']);
    exit;
}

function tableExistsInv(PDO $pdo, string $table): bool {
    static $cache = [];
    if (!isset($cache[$table])) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
        $stmt->execute([$table]);
        $cache[$table] = (int)$stmt->fetchColumn() > 0;
    }
    return $cache[$table];
}

// ============================================================================
// HOTELS
//
// Real contracted rates live in hotel_contracts -> hotel_contract_rates
// (season x room-category x meal-plan, with proper GST/markup handling —
// see HotelContractWizard.tsx). The flat `hotel_rates` table used before
// this fix is a separate, disconnected legacy table that the contracting
// UI never writes to. We now read contract rates first, and only fall back
// to `hotel_rates` for a specific hotel if that hotel has no contract rates
// at all (e.g. it was only ever entered the old way).
// ============================================================================
$hotelsGrouped = [];
$hotelsWithContractRates = [];

if (tableExistsInv($pdo, 'hotel_contracts') && tableExistsInv($pdo, 'hotel_contract_rates')) {
    try {
        $hotelsContract = $pdo->prepare(
            "SELECT h.id AS hotel_id, h.hotel_name, h.star_rating AS star_category, 'contracted' AS contract_type,
                    cr.id AS rate_id, rc.room_category_name AS room_type, cr.meal_plan_id AS meal_plan,
                    COALESCE(NULLIF(cr.selling_cost, 0), NULLIF(cr.double_rate, 0), NULLIF(cr.net_cost, 0), 0) AS rate_per_night,
                    COALESCE(cr.extra_adult_rate, 0) AS extra_bed_rate,
                    COALESCE(cr.child_with_bed_rate, 0) AS child_rate,
                    COALESCE(cr.child_without_bed_rate, 0) AS child_no_bed_rate,
                    COALESCE(cr.gst_percentage, 0) AS gst_percentage,
                    COALESCE(cr.rate_type, 'exclusive') AS rate_type,
                    'INR' AS currency
             FROM hotels h
             JOIN hotel_contracts hc ON hc.hotel_id = h.id AND hc.active_status = 1
             JOIN hotel_contract_rates cr ON cr.contract_id = hc.id AND cr.active_status = 1
             LEFT JOIN room_categories rc ON rc.id = cr.room_category_id
             WHERE h.city_id = ?
             ORDER BY h.hotel_name, rate_per_night"
        );
        $hotelsContract->execute([$cityId]);

        foreach ($hotelsContract->fetchAll() as $row) {
            $hid = $row['hotel_id'];
            $hotelsWithContractRates[$hid] = true;
            if (!isset($hotelsGrouped[$hid])) {
                $hotelsGrouped[$hid] = [
                    'id' => $hid, 'name' => $row['hotel_name'], 'star_category' => $row['star_category'],
                    'contract_type' => $row['contract_type'], 'rates' => []
                ];
            }
            $hotelsGrouped[$hid]['rates'][] = [
                'rate_id' => $row['rate_id'], 'room_type' => $row['room_type'], 'meal_plan' => $row['meal_plan'],
                'rate_per_night' => (float)$row['rate_per_night'], 'extra_bed_rate' => (float)$row['extra_bed_rate'],
                'child_rate' => (float)$row['child_rate'], 'child_no_bed_rate' => (float)$row['child_no_bed_rate'],
                'gst_percentage' => (float)$row['gst_percentage'], 'rate_type' => $row['rate_type'],
                'currency' => $row['currency'], 'source' => 'hotel_contract_rates'
            ];
        }
    } catch (Exception $e) {
        error_log('Error querying hotel_contracts: ' . $e->getMessage());
    }
}

if (tableExistsInv($pdo, 'hotel_rates')) {
    try {
        $excludeIds = array_keys($hotelsWithContractRates);
        $placeholders = $excludeIds ? implode(',', array_fill(0, count($excludeIds), '?')) : '';
        $sql = "SELECT h.id AS hotel_id, h.hotel_name, h.star_rating AS star_category, 'legacy' AS contract_type,
                       r.id AS rate_id, r.room_type, r.meal_plan, r.rate_per_night, r.extra_bed_rate, r.child_rate, r.currency
                FROM hotels h
                JOIN hotel_rates r ON r.hotel_id = h.id AND r.is_active = 1
                WHERE h.city_id = ?" . ($excludeIds ? " AND h.id NOT IN ($placeholders)" : "") . "
                ORDER BY h.hotel_name, r.rate_per_night";
        $hotelsLegacy = $pdo->prepare($sql);
        $hotelsLegacy->execute(array_merge([$cityId], $excludeIds));

        foreach ($hotelsLegacy->fetchAll() as $row) {
            $hid = $row['hotel_id'];
            if (!isset($hotelsGrouped[$hid])) {
                $hotelsGrouped[$hid] = [
                    'id' => $hid, 'name' => $row['hotel_name'], 'star_category' => $row['star_category'],
                    'contract_type' => $row['contract_type'], 'rates' => []
                ];
            }
            $hotelsGrouped[$hid]['rates'][] = [
                'rate_id' => $row['rate_id'], 'room_type' => $row['room_type'], 'meal_plan' => $row['meal_plan'],
                'rate_per_night' => (float)$row['rate_per_night'], 'extra_bed_rate' => (float)$row['extra_bed_rate'],
                'child_rate' => (float)$row['child_rate'], 'child_no_bed_rate' => 0,
                'gst_percentage' => 0, 'rate_type' => 'exclusive',
                'currency' => $row['currency'] ?? 'INR', 'source' => 'hotel_rates_legacy'
            ];
        }
    } catch (Exception $e) {
        error_log('Error querying hotel_rates: ' . $e->getMessage());
    }
}

// ============================================================================
// CABS
//
// Real contracted rates live in cab_contracts -> cab_contract_rates (per
// vehicle x route x season, with toll/parking/permit/state-tax as real
// columns — see CabContractWizard.tsx). IMPORTANT SCHEMA LIMITATION: unlike
// hotels, nothing in this chain has a city_id — cab_suppliers has no
// location field, and cab_routes only has free-text source/destination
// city names. So city scoping here is a name match against cab_routes,
// same limitation the rest of this codebase already has for destination
// text — it's not something this fix invented, just something it inherits.
// If you want reliable cab-by-city lookups long-term, the real fix is
// adding a city_id to cab_routes (or cab_contracts) rather than matching
// route text — flagging that rather than pretending this join is as solid
// as the hotel one.
// ============================================================================
$cabsGrouped = [];
$cabContractRatesFound = false;

if (tableExistsInv($pdo, 'cab_contracts') && tableExistsInv($pdo, 'cab_contract_rates')
    && tableExistsInv($pdo, 'cab_routes') && tableExistsInv($pdo, 'cab_vehicles')) {
    try {
        $hasCityFkCols = false;
        try {
            $checkFk = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cab_routes' AND COLUMN_NAME = 'from_city_id'");
            $checkFk->execute();
            $hasCityFkCols = (int)$checkFk->fetchColumn() > 0;
        } catch (Exception $e) {}

        $routeCond = ($hasCityFkCols && !empty($cityId))
            ? "((rt.from_city_id IS NOT NULL AND (rt.from_city_id = ? OR rt.to_city_id = ?)) OR (LOWER(rt.source) = LOWER(?) OR LOWER(rt.destination) = LOWER(?)))"
            : "(LOWER(rt.source) = LOWER(?) OR LOWER(rt.destination) = LOWER(?))";

        $routeParams = ($hasCityFkCols && !empty($cityId))
            ? [$cityId, $cityId, $cityName, $cityName]
            : [$cityName, $cityName];

        $cabsContract = $pdo->prepare(
            "SELECT sup.id AS supplier_id, sup.supplier_name AS vendor_name, 'contracted' AS contract_type,
                    cr.id AS rate_id, v.vehicle_type, cr.rate_model AS usage_type,
                    COALESCE(NULLIF(cr.daily_rate, 0), NULLIF(cr.base_cost, 0), NULLIF(cr.vehicle_cost, 0), 0) AS rate,
                    COALESCE(cr.extra_km_charge, 0) AS extra_km_rate,
                    COALESCE(cr.extra_hour_cost, 0) AS extra_hour_rate,
                    COALESCE(cr.toll_charges, 0) AS toll_charges,
                    COALESCE(cr.parking_charges, 0) AS parking_charges,
                    COALESCE(cr.permit_charges, 0) AS permit_charges,
                    COALESCE(cr.state_tax, 0) AS state_tax,
                    COALESCE(cr.gst_percentage, 0) AS gst_percentage,
                    rt.source AS route_source, rt.destination AS route_destination
             FROM cab_contracts cc
             JOIN cab_suppliers sup ON sup.id = cc.supplier_id
             JOIN cab_contract_rates cr ON cr.contract_id = cc.id
             JOIN cab_vehicles v ON v.id = cr.vehicle_id
             JOIN cab_routes rt ON rt.id = cr.route_id AND $routeCond
             WHERE cc.active_status = 1
             ORDER BY sup.supplier_name, rate"
        );
        $cabsContract->execute($routeParams);
        $rows = $cabsContract->fetchAll();
        $cabContractRatesFound = count($rows) > 0;

        foreach ($rows as $row) {
            $vid = $row['supplier_id'];
            if (!isset($cabsGrouped[$vid])) {
                $cabsGrouped[$vid] = [
                    'id' => $vid, 'name' => $row['vendor_name'], 'contract_type' => $row['contract_type'], 'rates' => []
                ];
            }
            $cabsGrouped[$vid]['rates'][] = [
                'rate_id' => $row['rate_id'], 'vehicle_type' => $row['vehicle_type'], 'usage_type' => $row['usage_type'],
                'rate' => (float)$row['rate'], 'extra_km_rate' => (float)$row['extra_km_rate'],
                'extra_hour_rate' => (float)$row['extra_hour_rate'], 'toll_charges' => (float)$row['toll_charges'],
                'parking_charges' => (float)$row['parking_charges'], 'permit_charges' => (float)$row['permit_charges'],
                'state_tax' => (float)$row['state_tax'], 'gst_percentage' => (float)$row['gst_percentage'],
                'currency' => 'INR', 'source' => 'cab_contract_rates'
            ];
        }
    } catch (Exception $e) {
        error_log('Error querying cab_contracts: ' . $e->getMessage());
    }
}

// City-wide fallback (not per-vendor — the modern supplier IDs and legacy
// vendor IDs are different identity spaces, there's no clean way to merge
// them per-record the way hotels can be excluded by shared hotel.id).
if (!$cabContractRatesFound && tableExistsInv($pdo, 'cab_vendors') && tableExistsInv($pdo, 'cab_rates')) {
    try {
        $cabsLegacy = $pdo->prepare(
            "SELECT v.id AS vendor_id, v.name AS vendor_name, v.contract_type,
                    r.id AS rate_id, r.vehicle_type, r.usage_type, r.rate, r.extra_km_rate, r.extra_hour_rate, r.currency
             FROM cab_vendors v
             JOIN cab_rates r ON r.cab_vendor_id = v.id AND r.is_active = 1
             WHERE v.city_id = ? AND v.is_active = 1
             ORDER BY v.name, r.rate"
        );
        $cabsLegacy->execute([$cityId]);

        foreach ($cabsLegacy->fetchAll() as $row) {
            $vid = $row['vendor_id'];
            if (!isset($cabsGrouped[$vid])) {
                $cabsGrouped[$vid] = [
                    'id' => $vid, 'name' => $row['vendor_name'], 'contract_type' => $row['contract_type'], 'rates' => []
                ];
            }
            $cabsGrouped[$vid]['rates'][] = [
                'rate_id' => $row['rate_id'], 'vehicle_type' => $row['vehicle_type'], 'usage_type' => $row['usage_type'],
                'rate' => (float)$row['rate'], 'extra_km_rate' => (float)$row['extra_km_rate'],
                'extra_hour_rate' => (float)$row['extra_hour_rate'], 'toll_charges' => 0, 'parking_charges' => 0,
                'permit_charges' => 0, 'state_tax' => 0, 'gst_percentage' => 0,
                'currency' => $row['currency'] ?? 'INR', 'source' => 'cab_rates_legacy'
            ];
        }
    } catch (Exception $e) {
        error_log('Error querying cab_rates: ' . $e->getMessage());
    }
}

$activitiesGrouped = [];
if (tableExistsInv($pdo, 'activities')) {
    try {
        $hasArTable = tableExistsInv($pdo, 'activity_rates');
        $arJoin = $hasArTable ? "JOIN activity_rates r ON r.activity_id = a.id AND (r.is_active = 1 OR r.active_status = 1)" : "";
        $rateCols = $hasArTable ? "r.id AS rate_id, r.rate_type, r.adult_rate, r.child_rate, r.currency" : "a.id AS rate_id, 'Per Person' AS rate_type, COALESCE(a.adult_cost, 0) AS adult_rate, COALESCE(a.child_cost, 0) AS child_rate, 'INR' AS currency";

        $actCond = (!empty($cityId))
            ? "((a.city_id = ? AND ? > 0) OR c.id = ? OR LOWER(a.destination) = LOWER(?))"
            : "LOWER(a.destination) = LOWER(?)";

        $actParams = (!empty($cityId))
            ? [$cityId, $cityId, $cityId, $cityName]
            : [$cityName];

        $activities = $pdo->prepare(
            "SELECT a.id AS activity_id, a.activity_name, a.activity_category AS category, a.sightseeing_id, NULL AS contract_type,
                    $rateCols
             FROM activities a
             $arJoin
             LEFT JOIN cities c ON LOWER(c.`$cityNameCol`) = LOWER(a.destination)
             WHERE $actCond
             ORDER BY a.activity_name"
        );
        $activities->execute($actParams);
        $activitiesRaw = $activities->fetchAll();
        foreach ($activitiesRaw as $row) {
            $aid = $row['activity_id'];
            if (!isset($activitiesGrouped[$aid])) {
                $activitiesGrouped[$aid] = [
                    'id'             => $row['activity_id'],
                    'name'           => $row['activity_name'],
                    'category'       => $row['category'],
                    'sightseeing_id' => $row['sightseeing_id'],
                    'contract_type'  => $row['contract_type'],
                    'rates'          => []
                ];
            }
            $activitiesGrouped[$aid]['rates'][] = [
                'rate_id'    => $row['rate_id'],
                'rate_type'  => $row['rate_type'],
                'adult_rate' => (float)$row['adult_rate'],
                'child_rate' => (float)$row['child_rate'],
                'currency'   => $row['currency'] ?? 'INR'
            ];
        }
    } catch (Exception $e) {
        error_log('Error querying activities: ' . $e->getMessage());
    }
}

$sightseeingsList = [];
if (tableExistsInv($pdo, 'sightseeings')) {
    try {
        $hasArTable = tableExistsInv($pdo, 'activity_rates');
        $arJoin = $hasArTable ? "LEFT JOIN activity_rates ar ON ar.activity_id = s.id AND (ar.is_active = 1 OR ar.active_status = 1)" : "";
        $arAdultCol = $hasArTable ? "COALESCE(ar.adult_rate, s.adult_cost, 0)" : "COALESCE(s.adult_cost, 0)";
        $arChildCol = $hasArTable ? "COALESCE(ar.child_rate, s.child_cost, 0)" : "COALESCE(s.child_cost, 0)";

        $ssCond = (!empty($cityId))
            ? "((s.city_id = ? AND ? > 0) OR c.id = ? OR LOWER(s.destination) = LOWER(?))"
            : "LOWER(s.destination) = LOWER(?)";

        $ssParams = (!empty($cityId))
            ? [$cityId, $cityId, $cityId, $cityName]
            : [$cityName];

        $sightseeings = $pdo->prepare(
            "SELECT s.id, s.sightseeing_name, s.destination, s.duration, s.description, s.image_url,
                    $arAdultCol AS adult_cost,
                    $arChildCol AS child_cost
             FROM sightseeings s
             $arJoin
             LEFT JOIN cities c ON LOWER(c.`$cityNameCol`) = LOWER(s.destination)
             WHERE $ssCond
             ORDER BY s.sightseeing_name"
        );
        $sightseeings->execute($ssParams);
        $sightseeingsList = $sightseeings->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log('Error querying sightseeings: ' . $e->getMessage());
    }
}

header('Cache-Control: private, max-age=300');

echo json_encode([
    'city_id'      => $cityId,
    'hotels'       => array_values($hotelsGrouped),
    'cabs'         => array_values($cabsGrouped),
    'activities'   => array_values($activitiesGrouped),
    'sightseeings' => $sightseeingsList,
    'counts'       => [
        'hotels'       => count($hotelsGrouped),
        'cabs'         => count($cabsGrouped),
        'activities'   => count($activitiesGrouped),
        'sightseeings' => count($sightseeingsList)
    ]
]);

