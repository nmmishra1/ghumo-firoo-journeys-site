<?php
// itinerary_save.php — saves/upserts complete itinerary with all child records.
header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

// ============================================================================
// Server-side pricing validation
//
// The itinerary builder computes totals client-side and used to send them
// here to be stored as-is. That means nothing checked the submitted total
// against this database's actual rate tables before persisting it as the
// customer's quote.
//
// This section adds a second opinion, computed from hotel_rates / cab_rates /
// activity_rates using the same IDs the client sends, and flags (does not
// block) any itinerary where the client's number doesn't match. It's
// intentionally a flag rather than a hard rejection or silent overwrite,
// for two reasons:
//   1. This codebase's rate tables have inconsistent column names across
//      different files (extra_bed_cost vs extra_bed_rate, child_cost vs
//      child_rate — see hotel-rates.php vs insert_rate.php), so column
//      lookups below are defensive (DESCRIBE-checked) rather than assumed.
//   2. Hotel rooms can have extra-bed/child surcharges that aren't included
//      in the floor check below (kept as a floor, not an exact match, for
//      that reason). Cab fares' toll/parking/permit/state-tax charges ARE
//      now included when the rate comes from cab_contract_rates (see
//      computeCabFloor) — that table stores them as real columns. They're
//      only unverifiable for cabs still on the legacy cab_rates table.
//
// Once you've reviewed a batch of real pricing_variance flags and are
// confident the checks below aren't false-positiving on legitimate extras,
// the natural next step is to make PRICING_HARD_BLOCK below actually reject
// (see where it's read, further down) instead of just flagging.
// ============================================================================

define('PRICING_VARIANCE_TOLERANCE_PCT', 2.0); // ignore diffs smaller than this %
define('PRICING_VARIANCE_TOLERANCE_ABS', 5.0);  // ...or this many rupees, whichever is larger
define('PRICING_HARD_BLOCK', false); // Flag pricing variances for audit without blocking saves

function getExistingColumn(PDO $pdo, string $table, array $candidates, ?string $fallback = null): ?string {
    static $columnCache = [];
    if (!isset($columnCache[$table])) {
        try {
            $columnCache[$table] = $pdo->query("DESCRIBE `$table`")->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            $columnCache[$table] = [];
        }
    }
    foreach ($candidates as $cand) {
        if (in_array($cand, $columnCache[$table], true)) return $cand;
    }
    return $fallback;
}

function tableExistsFor(PDO $pdo, string $table): bool {
    static $cache = [];
    if (!isset($cache[$table])) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
        $stmt->execute([$table]);
        $cache[$table] = (int)$stmt->fetchColumn() > 0;
    }
    return $cache[$table];
}

function withinTolerance(float $expected, float $actual): bool {
    $diff = abs($expected - $actual);
    $pctTolerance = abs($expected) * (PRICING_VARIANCE_TOLERANCE_PCT / 100);
    return $diff <= max($pctTolerance, PRICING_VARIANCE_TOLERANCE_ABS);
}

/**
 * Look up a hotel rate and return a floor (minimum plausible) cost.
 * Checks hotel_contract_rates first (the real rates entered via
 * HotelContractWizard.tsx) and falls back to the legacy hotel_rates table
 * only if no contract-rate row matches — mirrors inventory_by_city.php's
 * same contract-first, legacy-fallback logic, so validation checks against
 * whichever table the rate the agent actually picked came from.
 * Deliberately does not add extra-bed/child surcharges — see file header.
 */
function computeHotelFloor(PDO $pdo, $hotelRateId, int $nights, int $rooms): ?float {
    if (empty($hotelRateId)) return null;

    if (tableExistsFor($pdo, 'hotel_contract_rates')) {
        $stmt = $pdo->prepare("SELECT * FROM hotel_contract_rates WHERE id = ?");
        $stmt->execute([$hotelRateId]);
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $nightly = (float)($row['selling_cost'] ?? 0) ?: (float)($row['double_rate'] ?? 0) ?: (float)($row['net_cost'] ?? 0);
            $base = $nightly * max(1, $nights) * max(1, $rooms);
            $isInclusive = ($row['rate_type'] ?? '') === 'inclusive';
            $gstPct = (float)($row['gst_percentage'] ?? 0);
            if (!$isInclusive && $gstPct > 0) {
                $base *= (1 + ($gstPct / 100));
            }
            return $base;
        }
    }

    // Fall back to legacy hotel_rates — same as before this table existed.
    if (!tableExistsFor($pdo, 'hotel_rates')) return null;

    $rateCol = getExistingColumn($pdo, 'hotel_rates', ['rate_per_night', 'rate', 'nightly_rate']);
    $gstPctCol = getExistingColumn($pdo, 'hotel_rates', ['gst_percentage']);
    $gstIncludedCol = getExistingColumn($pdo, 'hotel_rates', ['gst_included']);
    if (!$rateCol) return null;

    $stmt = $pdo->prepare("SELECT * FROM hotel_rates WHERE id = ?");
    $stmt->execute([$hotelRateId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return null;

    $base = (float)$row[$rateCol] * max(1, $nights) * max(1, $rooms);
    $gstIncluded = $gstIncludedCol ? (bool)$row[$gstIncludedCol] : true;
    if (!$gstIncluded && $gstPctCol && (float)$row[$gstPctCol] > 0) {
        $base *= (1 + ((float)$row[$gstPctCol] / 100));
    }
    return $base;
}

/**
 * Look up a cab rate and return its base per-package/day cost (floor).
 * Checks cab_contract_rates first (the real rates entered via
 * CabContractWizard.tsx) — that table actually stores toll/parking/permit/
 * state-tax as real columns, so those are included here rather than
 * treated as unverifiable manual extras the way the legacy path has to.
 * Falls back to legacy cab_rates only if no contract-rate row matches.
 */
function computeCabFloor(PDO $pdo, $cabRateId): ?float {
    if (empty($cabRateId)) return null;

    if (tableExistsFor($pdo, 'cab_contract_rates')) {
        $stmt = $pdo->prepare("SELECT * FROM cab_contract_rates WHERE id = ?");
        $stmt->execute([$cabRateId]);
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $base = (float)($row['daily_rate'] ?? 0) ?: (float)($row['base_cost'] ?? 0) ?: (float)($row['vehicle_cost'] ?? 0);
            $base += (float)($row['toll_charges'] ?? 0) + (float)($row['parking_charges'] ?? 0)
                   + (float)($row['permit_charges'] ?? 0) + (float)($row['state_tax'] ?? 0);
            if (empty($row['gst_included']) && (float)($row['gst_percentage'] ?? 0) > 0) {
                $base *= (1 + ((float)$row['gst_percentage'] / 100));
            }
            return $base;
        }
    }

    // Fall back to legacy cab_rates — same as before this table existed.
    if (!tableExistsFor($pdo, 'cab_rates')) return null;

    $rateCol = getExistingColumn($pdo, 'cab_rates', ['rate']);
    if (!$rateCol) return null;

    $stmt = $pdo->prepare("SELECT * FROM cab_rates WHERE id = ?");
    $stmt->execute([$cabRateId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return null;

    return (float)$row[$rateCol];
}

/**
 * Look up the per-person rate for an excursion/activity and return the
 * exact expected total (no unmodeled extras here, so this is a full check).
 */
function computeExcursionExpected(PDO $pdo, $excursionId, int $adultCount, int $childCount): ?float {
    if (empty($excursionId)) return null;

    // Prefer activity_rates (the table inventory_by_city.php actually reads
    // live rates from), fall back to the activities row's own cost fields.
    if (tableExistsFor($pdo, 'activity_rates')) {
        $stmt = $pdo->prepare("SELECT adult_rate, child_rate FROM activity_rates WHERE activity_id = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$excursionId]);
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $adultRate = (float)($row['adult_rate'] ?? 0);
            $childRate = (float)($row['child_rate'] ?? 0);
            return ($adultCount * $adultRate) + ($childCount * $childRate);
        }
    }
    if (tableExistsFor($pdo, 'activities')) {
        $adultCol = getExistingColumn($pdo, 'activities', ['adult_cost', 'selling_cost']);
        $childCol = getExistingColumn($pdo, 'activities', ['child_cost']);
        if ($adultCol) {
            $stmt = $pdo->prepare("SELECT * FROM activities WHERE id = ?");
            $stmt->execute([$excursionId]);
            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $adultRate = (float)($row[$adultCol] ?? 0);
                $childRate = $childCol ? (float)($row[$childCol] ?? 0) : 0;
                return ($adultCount * $adultRate) + ($childCount * $childRate);
            }
        }
    }
    if (tableExistsFor($pdo, 'sightseeings')) {
        $stmt = $pdo->prepare("SELECT adult_cost, child_cost FROM sightseeings WHERE id = ?");
        $stmt->execute([$excursionId]);
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $adultRate = (float)($row['adult_cost'] ?? 0);
            $childRate = (float)($row['child_cost'] ?? 0);
            return ($adultCount * $adultRate) + ($childCount * $childRate);
        }
    }
    return null; // no matching rate anywhere — caller flags this distinctly
}

/**
 * Walk every hotel/transport/excursion line in the submitted days and
 * compare the client's total_cost against what this DB's rate tables say.
 * Returns ['flagged' => bool, 'variances' => array] — never throws, and
 * never blocks the save (see PRICING_HARD_BLOCK above for how to change that).
 */
function validateAndAnnotatePricing(PDO $pdo, array $days): array {
    $variances = [];

    foreach ($days as $dIdx => $d) {
        $dayLabel = 'Day ' . ((int)($d['day_number'] ?? ($dIdx + 1)));

        foreach (($d['hotels'] ?? []) as $h) {
            $submitted = (float)($h['total_cost'] ?? 0);
            $floor = computeHotelFloor($pdo, $h['hotel_rate_id'] ?? null, (int)($h['nights'] ?? 1), (int)($h['rooms'] ?? 1));
            if ($floor === null) {
                $variances[] = ['day' => $dayLabel, 'type' => 'hotel', 'id' => $h['hotel_rate_id'] ?? null, 'issue' => 'no_matching_rate', 'submitted' => $submitted];
            } elseif ($submitted < $floor && !withinTolerance($floor, $submitted)) {
                $variances[] = ['day' => $dayLabel, 'type' => 'hotel', 'id' => $h['hotel_rate_id'] ?? null, 'issue' => 'below_rate_card', 'submitted' => $submitted, 'expected_floor' => round($floor, 2)];
            }
        }

        foreach (($d['transport'] ?? []) as $t) {
            $submitted = (float)($t['base_cost'] ?? $t['rate'] ?? 0);
            $floor = computeCabFloor($pdo, $t['cab_rate_id'] ?? null);
            if ($floor === null) {
                if (!empty($t['cab_rate_id'])) {
                    $variances[] = ['day' => $dayLabel, 'type' => 'transport', 'id' => $t['cab_rate_id'], 'issue' => 'no_matching_rate', 'submitted' => $submitted];
                }
            } elseif ($submitted < $floor && !withinTolerance($floor, $submitted)) {
                $variances[] = ['day' => $dayLabel, 'type' => 'transport', 'id' => $t['cab_rate_id'], 'issue' => 'below_rate_card', 'submitted' => $submitted, 'expected_floor' => round($floor, 2)];
            }
        }

        foreach (($d['excursions'] ?? []) as $e) {
            $submitted = (float)($e['total_cost'] ?? 0);
            $expected = computeExcursionExpected($pdo, $e['excursion_id'] ?? null, (int)($e['adult_count'] ?? 0), (int)($e['child_count'] ?? 0));
            if ($expected === null) {
                $variances[] = ['day' => $dayLabel, 'type' => 'excursion', 'id' => $e['excursion_id'] ?? null, 'issue' => 'no_matching_rate', 'submitted' => $submitted];
            } elseif (!withinTolerance($expected, $submitted)) {
                $variances[] = ['day' => $dayLabel, 'type' => 'excursion', 'id' => $e['excursion_id'] ?? null, 'issue' => 'mismatch', 'submitted' => $submitted, 'expected' => round($expected, 2)];
            }
        }
    }

    return ['flagged' => count($variances) > 0, 'variances' => $variances];
}

function itinerariesHasPricingColumns(PDO $pdo): bool {
    static $cached = null;
    if ($cached === null) {
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'itineraries' AND COLUMN_NAME = 'pricing_flagged'"
        );
        $stmt->execute();
        $cached = (int)$stmt->fetchColumn() > 0;
    }
    return $cached;
}
// ============================================================================
// End pricing validation section
// ============================================================================

// Get JSON raw body
$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit;
}

$leadId = $data['lead_id'] ?? null;
if (empty($leadId)) {
    http_response_code(400);
    echo json_encode(['error' => 'lead_id is required']);
    exit;
}

// 1. Generate UUID if id is empty
$itineraryId = $data['id'] ?? '';
if (empty($itineraryId)) {
    $itineraryId = sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(16384, 20479),
        mt_rand(32768, 49151),
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// Prepare values
$itineraryName = $data['itinerary_name'] ?? 'Custom Itinerary';
$destinations = isset($data['destinations']) ? (is_array($data['destinations']) ? json_encode($data['destinations']) : $data['destinations']) : '[]';
$adultCount = (int)($data['adult_count'] ?? 2);
$childCount = (int)($data['child_count'] ?? 0);
$infantCount = (int)($data['infant_count'] ?? 0);
$totalNights = (int)($data['total_nights'] ?? 1);
$travelStartDate = !empty($data['travel_start_date']) ? $data['travel_start_date'] : null;
$travelEndDate = !empty($data['travel_end_date']) ? $data['travel_end_date'] : null;

$hotelCost = (float)($data['hotel_cost'] ?? 0);
$transportCost = (float)($data['transport_cost'] ?? 0);
$excursionCost = (float)($data['excursion_cost'] ?? 0);
$totalCost = $hotelCost + $transportCost + $excursionCost;
$visaCost = (float)($data['visa_cost'] ?? 0);
$markupPercentage = (float)($data['markup_percentage'] ?? 0);
$finalCost = (float)($data['final_cost'] ?? 0);
$costPerPerson = (float)($data['cost_per_person'] ?? 0);
$notes = $data['notes'] ?? null;
$status = $data['status'] ?? 'Draft';
$days = $data['days'] ?? [];

// Extract optional override reason
$overrideReason = trim($data['override_reason'] ?? '');

$customerName = trim($data['customer_name'] ?? '');
$customerEmail = trim($data['customer_email'] ?? '');
$customerPhone = trim($data['customer_phone'] ?? '');

// If customer info is missing in input, look up from lead
if ($leadId && (empty($customerName) || empty($customerEmail))) {
    try {
        $lStmt = $pdo->prepare("SELECT customer_name, customer_email, customer_phone, email, contact_number FROM leads WHERE id = ? LIMIT 1");
        $lStmt->execute([$leadId]);
        $lRow = $lStmt->fetch(PDO::FETCH_ASSOC);
        if ($lRow) {
            if (empty($customerName)) $customerName = $lRow['customer_name'] ?: '';
            if (empty($customerEmail)) $customerEmail = $lRow['customer_email'] ?: ($lRow['email'] ?: '');
            if (empty($customerPhone)) $customerPhone = $lRow['customer_phone'] ?: ($lRow['contact_number'] ?: '');
        }
    } catch (Exception $le) {}
}

// Fallback name extraction from itinerary_name
if (empty($customerName) || strcasecmp($customerName, 'Valued Client') === 0 || strcasecmp($customerName, 'Guest') === 0) {
    if (!empty($itineraryName) && preg_match('/^Itinerary for\s+([^–—\-|]+)/i', $itineraryName, $m)) {
        $extracted = trim($m[1]);
        if ($extracted && strcasecmp($extracted, 'Valued Client') !== 0 && strcasecmp($extracted, 'Guest') !== 0) {
            $customerName = $extracted;
        }
    }
}

// Run the pricing second-opinion before anything is written.
$pricingCheck = validateAndAnnotatePricing($pdo, $days);
if ($pricingCheck['flagged']) {
    error_log('[itinerary_save.php] pricing variance for lead ' . $leadId . ': ' . json_encode($pricingCheck['variances']));
    if (PRICING_HARD_BLOCK && empty($overrideReason)) {
        http_response_code(409);
        echo json_encode([
            'error' => 'PRICING_MISMATCH',
            'message' => 'Submitted pricing does not match current rate cards. An explicit override reason is required to proceed.',
            'pricing_variances' => $pricingCheck['variances']
        ]);
        exit;
    }
}
$hasPricingColumns = itinerariesHasPricingColumns($pdo);
$hasCustName = getExistingColumn($pdo, 'itineraries', ['customer_name']);
$hasCustEmail = getExistingColumn($pdo, 'itineraries', ['customer_email']);
$hasCustPhone = getExistingColumn($pdo, 'itineraries', ['customer_phone']);

$extraCols = [];
$extraVals = [];
$extraUpdates = [];
if ($hasCustName) {
    $extraCols[] = 'customer_name';
    $extraVals[] = ':customer_name';
    $extraUpdates[] = 'customer_name = VALUES(customer_name)';
}
if ($hasCustEmail) {
    $extraCols[] = 'customer_email';
    $extraVals[] = ':customer_email';
    $extraUpdates[] = 'customer_email = VALUES(customer_email)';
}
if ($hasCustPhone) {
    $extraCols[] = 'customer_phone';
    $extraVals[] = ':customer_phone';
    $extraUpdates[] = 'customer_phone = VALUES(customer_phone)';
}

$custColSql = !empty($extraCols) ? ', ' . implode(', ', $extraCols) : '';
$custValSql = !empty($extraVals) ? ', ' . implode(', ', $extraVals) : '';
$custUpdateSql = !empty($extraUpdates) ? ', ' . implode(', ', $extraUpdates) : '';

try {
    $pdo->beginTransaction();

    // 2. Upsert itinerary
    $pricingCols = $hasPricingColumns ? ", pricing_flagged, pricing_variance" : "";
    $pricingVals = $hasPricingColumns ? ", :pricing_flagged, :pricing_variance" : "";
    $pricingUpdate = $hasPricingColumns ? ", pricing_flagged = VALUES(pricing_flagged), pricing_variance = VALUES(pricing_variance)" : "";

    $stmtItin = $pdo->prepare("
        INSERT INTO itineraries (
            id, lead_id, itinerary_name, destinations, adult_count, child_count, infant_count,
            total_nights, travel_start_date, travel_end_date, hotel_cost, transport_cost,
            excursion_cost, total_cost, visa_cost, markup_percentage, final_cost, cost_per_person, notes, status
            $pricingCols
            $custColSql
        ) VALUES (
            :id, :lead_id, :itinerary_name, :destinations, :adult_count, :child_count, :infant_count,
            :total_nights, :travel_start_date, :travel_end_date, :hotel_cost, :transport_cost,
            :excursion_cost, :total_cost, :visa_cost, :markup_percentage, :final_cost, :cost_per_person, :notes, :status
            $pricingVals
            $custValSql
        ) ON DUPLICATE KEY UPDATE
            lead_id = VALUES(lead_id),
            itinerary_name = VALUES(itinerary_name),
            destinations = VALUES(destinations),
            adult_count = VALUES(adult_count),
            child_count = VALUES(child_count),
            infant_count = VALUES(infant_count),
            total_nights = VALUES(total_nights),
            travel_start_date = VALUES(travel_start_date),
            travel_end_date = VALUES(travel_end_date),
            hotel_cost = VALUES(hotel_cost),
            transport_cost = VALUES(transport_cost),
            excursion_cost = VALUES(excursion_cost),
            total_cost = VALUES(total_cost),
            visa_cost = VALUES(visa_cost),
            markup_percentage = VALUES(markup_percentage),
            final_cost = VALUES(final_cost),
            cost_per_person = VALUES(cost_per_person),
            notes = VALUES(notes),
            status = VALUES(status)
            $pricingUpdate
            $custUpdateSql
    ");

    $itinParams = [
        ':id' => $itineraryId,
        ':lead_id' => $leadId,
        ':itinerary_name' => $itineraryName,
        ':destinations' => $destinations,
        ':adult_count' => $adultCount,
        ':child_count' => $childCount,
        ':infant_count' => $infantCount,
        ':total_nights' => $totalNights,
        ':travel_start_date' => $travelStartDate,
        ':travel_end_date' => $travelEndDate,
        ':hotel_cost' => $hotelCost,
        ':transport_cost' => $transportCost,
        ':excursion_cost' => $excursionCost,
        ':total_cost' => $totalCost,
        ':visa_cost' => $visaCost,
        ':markup_percentage' => $markupPercentage,
        ':final_cost' => $finalCost,
        ':cost_per_person' => $costPerPerson,
        ':notes' => $notes,
        ':status' => $status
    ];
    if ($hasCustName) $itinParams[':customer_name'] = $customerName;
    if ($hasCustEmail) $itinParams[':customer_email'] = $customerEmail;
    if ($hasCustPhone) $itinParams[':customer_phone'] = $customerPhone;

    if ($hasPricingColumns) {
        $varianceData = [
            'variances' => $pricingCheck['variances']
        ];
        if (!empty($overrideReason)) {
            $varianceData['override_reason'] = $overrideReason;
            $varianceData['override_by'] = $user['email'] ?? $user['id'] ?? 'unknown';
            $varianceData['override_at'] = date('Y-m-d H:i:s');
        }
        $itinParams[':pricing_flagged'] = $pricingCheck['flagged'] ? 1 : 0;
        $itinParams[':pricing_variance'] = json_encode($varianceData);
    }
    $stmtItin->execute($itinParams);

    // 3. Clear existing child tables for this itinerary
    $pdo->prepare("DELETE FROM itinerary_hotels WHERE itinerary_id = ?")->execute([$itineraryId]);
    $pdo->prepare("DELETE FROM itinerary_transport WHERE itinerary_id = ?")->execute([$itineraryId]);
    $pdo->prepare("DELETE FROM itinerary_excursions WHERE itinerary_id = ?")->execute([$itineraryId]);
    $pdo->prepare("DELETE FROM itinerary_days WHERE itinerary_id = ?")->execute([$itineraryId]);

    // 4. Insert days and their sub-items
    $stmtDay = $pdo->prepare("
        INSERT INTO itinerary_days (
            itinerary_id, day_number, title, description, accommodation_city, city, meals, metadata, date
        ) VALUES (
            :itinerary_id, :day_number, :title, :description, :accommodation_city, :city, :meals, :metadata, :date
        )
    ");

    $stmtHotel = $pdo->prepare("
        INSERT INTO itinerary_hotels (
            id, itinerary_id, itinerary_day_id, hotel_id, hotel_rate_id, check_in_date, check_out_date,
            nights, rooms, total_cost, meal_plan, room_category, room_configuration, rate_per_night,
            room_cost, gst_cost, special_requests
        ) VALUES (
            :id, :itinerary_id, :itinerary_day_id, :hotel_id, :hotel_rate_id, :check_in_date, :check_out_date,
            :nights, :rooms, :total_cost, :meal_plan, :room_category, :room_configuration, :rate_per_night,
            :room_cost, :gst_cost, :special_requests
        )
    ");

    $stmtTrans = $pdo->prepare("
        INSERT INTO itinerary_transport (
            id, itinerary_id, itinerary_day_id, cab_rate_id, pickup_location, drop_location, pickup_time,
            distance_km, total_cost, transport_type, vehicle_type, route_from, route_to, pickup_date,
            rate, base_cost, gst_cost, driver_cost, toll_charges, parking_charges, state_tax, permit_charges,
            gst_percentage, gst_included, markup_amount, markup_percentage, profit_margin, selling_cost, supplier_cost
        ) VALUES (
            :id, :itinerary_id, :itinerary_day_id, :cab_rate_id, :pickup_location, :drop_location, :pickup_time,
            :distance_km, :total_cost, :transport_type, :vehicle_type, :route_from, :route_to, :pickup_date,
            :rate, :base_cost, :gst_cost, :driver_cost, :toll_charges, :parking_charges, :state_tax, :permit_charges,
            :gst_percentage, :gst_included, :markup_amount, :markup_percentage, :profit_margin, :selling_cost, :supplier_cost
        )
    ");

    $stmtExc = $pdo->prepare("
        INSERT INTO itinerary_excursions (
            id, itinerary_id, itinerary_day_id, excursion_id, total_cost, excursion_date, excursion_time,
            adult_count, child_count, adult_rate, child_rate
        ) VALUES (
            :id, :itinerary_id, :itinerary_day_id, :excursion_id, :total_cost, :excursion_date, :excursion_time,
            :adult_count, :child_count, :adult_rate, :child_rate
        )
    ");

    foreach ($days as $d) {
        $mealsJson = isset($d['meals']) ? json_encode($d['meals']) : '[]';
        $metaJson = isset($d['metadata']) ? json_encode($d['metadata']) : '{"blocks":[]}';
        $dayDate = !empty($d['date']) ? $d['date'] : null;

        $stmtDay->execute([
            ':itinerary_id' => $itineraryId,
            ':day_number' => (int)($d['day_number'] ?? 1),
            ':title' => $d['title'] ?? 'Day Title',
            ':description' => $d['description'] ?? null,
            ':accommodation_city' => $d['accommodation_city'] ?? null,
            ':city' => $d['city'] ?? null,
            ':meals' => $mealsJson,
            ':metadata' => $metaJson,
            ':date' => $dayDate
        ]);

        $dayInsertId = $pdo->lastInsertId();

        // Hotels sync
        if (isset($d['hotels']) && is_array($d['hotels'])) {
            foreach ($d['hotels'] as $h) {
                $hUuid = $h['id'] ?? sprintf(
                    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                    mt_rand(16384, 20479), mt_rand(32768, 49151),
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                );
                $roomConfigJson = isset($h['room_configuration']) ? json_encode($h['room_configuration']) : '{"doubleRooms":1}';
                $stmtHotel->execute([
                    ':id' => $hUuid,
                    ':itinerary_id' => $itineraryId,
                    ':itinerary_day_id' => $dayInsertId,
                    ':hotel_id' => $h['hotel_id'],
                    ':hotel_rate_id' => $h['hotel_rate_id'] ?? null,
                    ':check_in_date' => $h['check_in_date'] ?? $dayDate,
                    ':check_out_date' => $h['check_out_date'] ?? $dayDate,
                    ':nights' => (int)($h['nights'] ?? 1),
                    ':rooms' => (int)($h['rooms'] ?? 1),
                    ':total_cost' => (float)($h['total_cost'] ?? 0),
                    ':meal_plan' => $h['meal_plan'] ?? 'CP',
                    ':room_category' => $h['room_category'] ?? 'Standard',
                    ':room_configuration' => $roomConfigJson,
                    ':rate_per_night' => (float)($h['rate_per_night'] ?? 0),
                    ':room_cost' => (float)($h['room_cost'] ?? 0),
                    ':gst_cost' => (float)($h['gst_cost'] ?? 0),
                    ':special_requests' => $h['special_requests'] ?? null
                ]);
            }
        }

        // Transport sync
        if (isset($d['transport']) && is_array($d['transport'])) {
            foreach ($d['transport'] as $t) {
                $tUuid = $t['id'] ?? sprintf(
                    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                    mt_rand(16384, 20479), mt_rand(32768, 49151),
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                );
                $stmtTrans->execute([
                    ':id' => $tUuid,
                    ':itinerary_id' => $itineraryId,
                    ':itinerary_day_id' => $dayInsertId,
                    ':cab_rate_id' => $t['cab_rate_id'] ?? null,
                    ':pickup_location' => $t['pickup_location'] ?? $t['route_from'] ?? '',
                    ':drop_location' => $t['drop_location'] ?? $t['route_to'] ?? '',
                    ':pickup_time' => !empty($t['pickup_time']) ? $t['pickup_time'] : '09:00:00',
                    ':distance_km' => (float)($t['distance_km'] ?? 0),
                    ':total_cost' => (float)($t['total_cost'] ?? 0),
                    ':transport_type' => $t['transport_type'] ?? 'Per Day',
                    ':vehicle_type' => $t['vehicle_type'] ?? '',
                    ':route_from' => $t['route_from'] ?? '',
                    ':route_to' => $t['route_to'] ?? '',
                    ':pickup_date' => $t['pickup_date'] ?? $dayDate,
                    ':rate' => (float)($t['rate'] ?? 0),
                    ':base_cost' => (float)($t['base_cost'] ?? 0),
                    ':gst_cost' => (float)($t['gst_cost'] ?? 0),
                    ':driver_cost' => (float)($t['driver_cost'] ?? 0),
                    ':toll_charges' => (float)($t['toll_charges'] ?? 0),
                    ':parking_charges' => (float)($t['parking_charges'] ?? 0),
                    ':state_tax' => (float)($t['state_tax'] ?? 0),
                    ':permit_charges' => (float)($t['permit_charges'] ?? 0),
                    ':gst_percentage' => (float)($t['gst_percentage'] ?? 5.00),
                    ':gst_included' => isset($t['gst_included']) && $t['gst_included'] ? 1 : 0,
                    ':markup_amount' => (float)($t['markup_amount'] ?? 0),
                    ':markup_percentage' => (float)($t['markup_percentage'] ?? 0),
                    ':profit_margin' => (float)($t['profit_margin'] ?? 0),
                    ':selling_cost' => (float)($t['selling_cost'] ?? 0),
                    ':supplier_cost' => (float)($t['supplier_cost'] ?? 0)
                ]);
            }
        }

        // Excursions sync
        if (isset($d['excursions']) && is_array($d['excursions'])) {
            foreach ($d['excursions'] as $e) {
                $eUuid = $e['id'] ?? sprintf(
                    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                    mt_rand(16384, 20479), mt_rand(32768, 49151),
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                );
                $stmtExc->execute([
                    ':id' => $eUuid,
                    ':itinerary_id' => $itineraryId,
                    ':itinerary_day_id' => $dayInsertId,
                    ':excursion_id' => $e['excursion_id'],
                    ':total_cost' => (float)($e['total_cost'] ?? 0),
                    ':excursion_date' => $e['excursion_date'] ?? $dayDate,
                    ':excursion_time' => $e['excursion_time'] ?? null,
                    ':adult_count' => (int)($e['adult_count'] ?? 1),
                    ':child_count' => (int)($e['child_count'] ?? 0),
                    ':adult_rate' => (float)($e['adult_rate'] ?? 0),
                    ':child_rate' => (float)($e['child_rate'] ?? 0)
                ]);
            }
        }
    }

    // 5. Update lead pricing details in MySQL
    $stmtLead = $pdo->prepare("
        UPDATE leads SET
          package_name = :itinerary_name,
          package_cost = :package_cost,
          package_price = :final_cost
        WHERE id = :lead_id
    ");
    $stmtLead->execute([
        ':itinerary_name' => $itineraryName,
        ':package_cost' => $totalCost,
        ':final_cost' => $finalCost,
        ':lead_id' => $leadId
    ]);

    $pdo->commit();
    echo json_encode([
        'success' => true,
        'itinerary_id' => $itineraryId,
        'pricing_flagged' => $pricingCheck['flagged'],
        'pricing_variances' => $pricingCheck['flagged'] ? $pricingCheck['variances'] : []
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save itinerary: ' . $e->getMessage()]);
}
