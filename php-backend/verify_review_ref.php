<?php
error_reporting(0);
ini_set('display_errors', 0);
// verify_review_ref.php — Public endpoint to verify booking reference for traveler reviews.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/auth_middleware.php';

$ref = trim($_GET['ref'] ?? $_GET['booking_ref'] ?? '');

if (empty($ref)) {
    echo json_encode(['success' => false, 'error' => 'Booking reference is required']);
    exit;
}

try {
    $pdo = getDb();
    
    // 1. Search in itineraries table by id, itinerary_code, or lead_id
    $cleanRef = preg_replace('/[^a-zA-Z0-9]/', '', $ref);
    $cleanSuffix = strtolower(preg_replace('/^GFJITN/i', '', $cleanRef));

    $sql = "SELECT * FROM itineraries WHERE id = ? OR itinerary_code = ? OR lead_id = ?";
    $params = [$ref, $ref, $ref];

    if (!empty($cleanSuffix) && strlen($cleanSuffix) >= 4) {
        $sql .= " OR LOWER(REPLACE(id, '-', '')) LIKE ? OR LOWER(id) LIKE ? OR LOWER(itinerary_code) LIKE ?";
        $params[] = $cleanSuffix . '%';
        $params[] = $cleanSuffix . '%';
        $params[] = '%' . $cleanSuffix . '%';
    }
    $sql .= " LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $iti = $stmt->fetch(PDO::FETCH_ASSOC);

    $customerName = '';
    $destinations = [];
    $packageName = '';
    $startDate = '';
    $endDate = '';
    $leadId = '';

    if ($iti) {
        $customerName = $iti['customer_name'] ?? ($iti['customerName'] ?? '');
        $packageName = $iti['package_name'] ?? ($iti['itinerary_name'] ?? ($iti['title'] ?? ''));
        $startDate = $iti['travel_start_date'] ?? '';
        $endDate = $iti['travel_end_date'] ?? '';
        $leadId = $iti['lead_id'] ?? '';
        
        $rawDest = $iti['destinations'] ?? '';
        if (!empty($rawDest)) {
            if (is_string($rawDest) && (str_starts_with(trim($rawDest), '[') || str_starts_with(trim($rawDest), '{'))) {
                $decoded = json_decode($rawDest, true);
                if (is_array($decoded)) {
                    foreach ($decoded as $item) {
                        if (is_string($item)) $destinations[] = $item;
                        else if (is_array($item)) {
                            $dName = $item['DESTINATION'] ?? ($item['destination'] ?? ($item['city'] ?? ($item['name'] ?? ($item['STATE'] ?? ''))));
                            if ($dName) $destinations[] = $dName;
                        }
                    }
                }
            } else if (is_string($rawDest)) {
                $destinations[] = $rawDest;
            }
        }

        // Cache the friendly code on the record if missing
        if (empty($iti['itinerary_code']) && strpos($ref, 'GFJ-ITN-') === 0) {
            try {
                $pdo->prepare("UPDATE itineraries SET itinerary_code = ? WHERE id = ?")->execute([$ref, $iti['id']]);
            } catch (Throwable $eCode) {}
        }
    }

    // 2. Fallback to leads table if missing customer_name or itinerary not found
    if (empty($customerName) || !empty($leadId)) {
        $searchLeadId = $leadId ?: $ref;
        if (!is_numeric($searchLeadId) && is_numeric($cleanSuffix)) {
            $searchLeadId = $cleanSuffix;
        }
        $lStmt = $pdo->prepare("SELECT * FROM leads WHERE id = ? LIMIT 1");
        $lStmt->execute([$searchLeadId]);
        $lead = $lStmt->fetch(PDO::FETCH_ASSOC);

        if ($lead) {
            if (empty($customerName)) {
                $customerName = $lead['customer_name'] ?? ($lead['name'] ?? '');
            }
            if (empty($packageName)) {
                $packageName = $lead['travel_interest'] ?? $lead['tour_type'] ?? 'Tour Package';
            }
            if (empty($startDate)) {
                $startDate = $lead['trip_start_date'] ?? '';
            }
            if (empty($endDate)) {
                $endDate = $lead['trip_end_date'] ?? '';
            }
            if (empty($destinations)) {
                $d = $lead['destinations'] ?? $lead['travel_interest'] ?? '';
                if ($d) $destinations[] = $d;
            }
        }
    }

    // 3. Check if a review has already been submitted for this itinerary / booking / lead
    $existingReview = null;
    try {
        $itiId = $iti['id'] ?? $ref;
        $revSql = "SELECT * FROM reviews WHERE booking_id = ? OR booking_id = ?";
        $revParams = [$itiId, $ref];

        if (!empty($leadId)) {
            $revSql .= " OR lead_id = ?";
            $revParams[] = $leadId;
        }
        if (!empty($cleanSuffix) && strlen($cleanSuffix) >= 4) {
            $revSql .= " OR LOWER(REPLACE(booking_id, '-', '')) LIKE ? OR LOWER(booking_id) LIKE ?";
            $revParams[] = strtolower($cleanSuffix) . '%';
            $revParams[] = strtolower($cleanSuffix) . '%';
        }
        $revSql .= " ORDER BY created_at DESC LIMIT 1";

        $revStmt = $pdo->prepare($revSql);
        $revStmt->execute($revParams);
        $existingReview = $revStmt->fetch(PDO::FETCH_ASSOC);

        if ($existingReview) {
            $existingReview['rating'] = (int)$existingReview['rating'];
            $existingReview['hotel_rating'] = $existingReview['hotel_rating'] !== null ? (int)$existingReview['hotel_rating'] : null;
            $existingReview['cab_rating'] = $existingReview['cab_rating'] !== null ? (int)$existingReview['cab_rating'] : null;
            $existingReview['sightseeing_rating'] = $existingReview['sightseeing_rating'] !== null ? (int)$existingReview['sightseeing_rating'] : null;
            $existingReview['trip_planning_rating'] = $existingReview['trip_planning_rating'] !== null ? (int)$existingReview['trip_planning_rating'] : null;
            $existingReview['verified'] = $existingReview['verified'] !== null ? (bool)$existingReview['verified'] : true;
            $existingReview['featured'] = $existingReview['featured'] !== null ? (bool)$existingReview['featured'] : false;

            if (isset($existingReview['photos'])) {
                if (is_string($existingReview['photos']) && (str_starts_with(trim($existingReview['photos']), '[') || str_starts_with(trim($existingReview['photos']), '{'))) {
                    $existingReview['photos'] = json_decode($existingReview['photos'], true) ?: [];
                } else if (!is_array($existingReview['photos'])) {
                    $existingReview['photos'] = !empty($existingReview['photos']) ? [$existingReview['photos']] : [];
                }
            } else {
                $existingReview['photos'] = [];
            }
        }
    } catch (Throwable $eRev) {
        // Table or query issue gracefully handled
    }

    $finalId = $iti['id'] ?? $ref;
    $finalLeadId = $leadId ?: $ref;
    $finalCustomerName = $customerName ?: ($existingReview['customer_name'] ?? 'Valued Traveler');
    $finalPackageName = $packageName ?: ($existingReview['package_name'] ?? "Booking Ref #".strtoupper(substr($ref, 0, 8)));
    $finalDestinations = !empty($destinations) ? array_values(array_unique($destinations)) : [(!empty($existingReview['destination']) ? $existingReview['destination'] : 'Ghumo Firoo Travels')];
    $finalStartDate = $startDate ?: ($existingReview['travel_date'] ?? date('Y-m-d'));
    $finalEndDate = $endDate ?: ($existingReview['travel_date'] ?? date('Y-m-d'));

    echo json_encode([
        'success' => true,
        'is_valid' => true,
        'id' => $finalId,
        'lead_id' => $finalLeadId,
        'customer_name' => $finalCustomerName,
        'itinerary_name' => $finalPackageName,
        'destinations' => $finalDestinations,
        'travel_start_date' => $finalStartDate,
        'travel_end_date' => $finalEndDate,
        'package_type' => 'domestic',
        'already_reviewed' => !empty($existingReview),
        'existing_review' => $existingReview ?: null
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
