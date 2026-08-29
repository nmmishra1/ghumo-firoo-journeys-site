<?php
// destination_tab_items.php - Phase 1 & Phase 2 Commercial Sub-items Controller
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    // ─── 1. ATTRACTIONS CRUD ──────────────────────────────────────────────────
    if ($action === 'add_attraction') {
        $destId = intval($input['destination_id'] ?? 0);
        if (!$destId || empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing destination_id or attraction name']);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO attractions (destination_id, name, category, description, opening_hours, entry_fee, visit_time, priority, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $destId,
            trim($input['name']),
            $input['category'] ?? 'Sightseeing',
            $input['description'] ?? null,
            $input['opening_hours'] ?? null,
            floatval($input['entry_fee'] ?? 0),
            $input['visit_time'] ?? '1-2 Hours',
            intval($input['priority'] ?? 1),
            $input['image_url'] ?? null
        ]);

        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Attraction added']);
        exit;
    }

    if ($action === 'delete_attraction') {
        $id = intval($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM attractions WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Attraction deleted']);
        exit;
    }

    // ─── 2. ACTIVITIES CRUD ───────────────────────────────────────────────────
    if ($action === 'add_activity') {
        $destId = intval($input['destination_id'] ?? 0);
        if (!$destId || empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing destination_id or activity name']);
            exit;
        }

        $adultCost = floatval($input['adult_cost'] ?? 0);
        $markupPct = floatval($input['markup_pct'] ?? 15);
        $sellingPrice = floatval($input['selling_price'] ?? ($adultCost * (1 + ($markupPct / 100))));

        $stmt = $pdo->prepare("
            INSERT INTO activities (
                destination_id, category_id, name, duration, private_shared, vehicle_required, 
                meeting_point, description, adult_cost, child_cost, infant_cost, currency, markup_pct, selling_price
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $destId,
            !empty($input['category_id']) ? intval($input['category_id']) : null,
            trim($input['name']),
            $input['duration'] ?? 'Half-Day',
            $input['private_shared'] ?? 'Shared',
            !empty($input['vehicle_required']) ? 1 : 0,
            $input['meeting_point'] ?? null,
            $input['description'] ?? null,
            $adultCost,
            floatval($input['child_cost'] ?? 0),
            floatval($input['infant_cost'] ?? 0),
            $input['currency'] ?? 'INR',
            $markupPct,
            $sellingPrice
        ]);

        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Activity added']);
        exit;
    }

    if ($action === 'delete_activity') {
        $id = intval($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM activities WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Activity deleted']);
        exit;
    }

    // ─── 3. HOTEL MAPPING ─────────────────────────────────────────────────────
    if ($action === 'add_hotel_mapping') {
        $destId = intval($input['destination_id'] ?? 0);
        $hotelName = trim($input['hotel_name'] ?? '');
        if (!$destId || empty($hotelName)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing destination_id or hotel_name']);
            exit;
        }

        // Get or create hotel in hotel_master
        $hStmt = $pdo->prepare("SELECT id FROM hotel_master WHERE LOWER(name) = LOWER(?)");
        $hStmt->execute([$hotelName]);
        $hotelId = $hStmt->fetchColumn();

        if (!$hotelId) {
            $insH = $pdo->prepare("INSERT INTO hotel_master (name, destination_city, star_category) VALUES (?, 'Custom', ?)");
            $insH->execute([$hotelName, $input['star_category'] ?? '4 Star']);
            $hotelId = $pdo->lastInsertId();
        }

        $stmt = $pdo->prepare("
            INSERT INTO destination_hotels (destination_id, hotel_id, priority, is_recommended, distance_from_center_km)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE priority = VALUES(priority), is_recommended = VALUES(is_recommended), distance_from_center_km = VALUES(distance_from_center_km)
        ");
        $stmt->execute([
            $destId,
            $hotelId,
            intval($input['priority'] ?? 1),
            !empty($input['is_recommended']) ? 1 : 1,
            floatval($input['distance_from_center_km'] ?? 1.5)
        ]);

        echo json_encode(['success' => true, 'message' => 'Hotel mapped to destination']);
        exit;
    }

    if ($action === 'delete_hotel_mapping') {
        $id = intval($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM destination_hotels WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Hotel mapping removed']);
        exit;
    }

    // ─── 4. RESTAURANT MAPPING ────────────────────────────────────────────────
    if ($action === 'add_restaurant_mapping') {
        $destId = intval($input['destination_id'] ?? 0);
        $restName = trim($input['restaurant_name'] ?? '');
        if (!$destId || empty($restName)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing destination_id or restaurant_name']);
            exit;
        }

        $rStmt = $pdo->prepare("SELECT id FROM restaurant_master WHERE LOWER(name) = LOWER(?)");
        $rStmt->execute([$restName]);
        $restId = $rStmt->fetchColumn();

        if (!$restId) {
            $insR = $pdo->prepare("INSERT INTO restaurant_master (name, destination_city, cuisine, meal_type, approx_cost, is_veg) VALUES (?, 'Custom', ?, ?, ?, ?)");
            $insR->execute([$restName, $input['cuisine'] ?? 'Continental', $input['meal_type'] ?? 'Fine Dining', floatval($input['approx_cost'] ?? 0), !empty($input['is_veg']) ? 1 : 0]);
            $restId = $pdo->lastInsertId();
        }

        $stmt = $pdo->prepare("INSERT IGNORE INTO destination_restaurants (destination_id, restaurant_id) VALUES (?, ?)");
        $stmt->execute([$destId, $restId]);

        echo json_encode(['success' => true, 'message' => 'Restaurant mapped to destination']);
        exit;
    }

    if ($action === 'delete_restaurant_mapping') {
        $id = intval($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM destination_restaurants WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Restaurant mapping removed']);
        exit;
    }

    // ─── 5. SHOPPING MAPPING ─────────────────────────────────────────────────
    if ($action === 'add_shopping_mapping') {
        $destId = intval($input['destination_id'] ?? 0);
        $shopName = trim($input['shopping_name'] ?? '');
        if (!$destId || empty($shopName)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing destination_id or shopping_name']);
            exit;
        }

        $sStmt = $pdo->prepare("SELECT id FROM shopping_master WHERE LOWER(name) = LOWER(?)");
        $sStmt->execute([$shopName]);
        $shopId = $sStmt->fetchColumn();

        if (!$shopId) {
            $insS = $pdo->prepare("INSERT INTO shopping_master (name, destination_city, category, recommended_for) VALUES (?, 'Custom', ?, ?)");
            $insS->execute([$shopName, $input['category'] ?? 'Street Market', $input['recommended_for'] ?? 'Souvenirs']);
            $shopId = $pdo->lastInsertId();
        }

        $stmt = $pdo->prepare("INSERT IGNORE INTO destination_shopping (destination_id, shopping_id) VALUES (?, ?)");
        $stmt->execute([$destId, $shopId]);

        echo json_encode(['success' => true, 'message' => 'Shopping location mapped to destination']);
        exit;
    }

    if ($action === 'delete_shopping_mapping') {
        $id = intval($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM destination_shopping WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Shopping mapping removed']);
        exit;
    }

    // ─── 6. DESTINATION RELATIONSHIPS (Nearby / Day Trips) ────────────────────
    if ($action === 'add_relationship') {
        $destId = intval($input['destination_id'] ?? 0);
        $relatedId = intval($input['related_destination_id'] ?? 0);
        if (!$destId || !$relatedId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing destination_id or related_destination_id']);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO destination_relationships (destination_id, related_destination_id, relationship_type, distance_km, travel_time_mins)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE relationship_type=VALUES(relationship_type), distance_km=VALUES(distance_km), travel_time_mins=VALUES(travel_time_mins)
        ");
        $stmt->execute([
            $destId,
            $relatedId,
            $input['relationship_type'] ?? 'Day Trip',
            floatval($input['distance_km'] ?? 0),
            intval($input['travel_time_mins'] ?? 0)
        ]);

        echo json_encode(['success' => true, 'message' => 'Destination relationship saved']);
        exit;
    }

    if ($action === 'delete_relationship') {
        $id = intval($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM destination_relationships WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Relationship removed']);
        exit;
    }

    // ─── 7. EXTERNAL PROVIDER IDS ─────────────────────────────────────────────
    if ($action === 'add_external_id') {
        $destId = intval($input['destination_id'] ?? 0);
        $provider = trim($input['provider'] ?? '');
        $externalId = trim($input['external_id'] ?? '');

        if (!$destId || empty($provider) || empty($externalId)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing destination_id, provider, or external_id']);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO destination_external_ids (destination_id, provider, external_id)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE external_id = VALUES(external_id)
        ");
        $stmt->execute([$destId, $provider, $externalId]);

        echo json_encode(['success' => true, 'message' => 'External provider ID mapped']);
        exit;
    }

    if ($action === 'delete_external_id') {
        $id = intval($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM destination_external_ids WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'External provider mapping deleted']);
        exit;
    }

    // ─── 8. TRANSFERS ────────────────────────────────────────────────────────
    if ($action === 'add_transfer') {
        $destId = intval($input['destination_id'] ?? 0);
        if (!$destId || empty($input['source_name']) || empty($input['destination_name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing destination_id, source, or destination name']);
            exit;
        }

        $cost = floatval($input['cost'] ?? 0);
        $selling = floatval($input['selling_price'] ?? ($cost * 1.15));

        $stmt = $pdo->prepare("
            INSERT INTO transfers (destination_id, source_name, destination_name, vehicle_type, currency, cost, selling_price, duration, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $destId,
            trim($input['source_name']),
            trim($input['destination_name']),
            $input['vehicle_type'] ?? 'Sedan Cab',
            $input['currency'] ?? 'INR',
            $cost,
            $selling,
            $input['duration'] ?? '1 Hour',
            $input['remarks'] ?? null
        ]);

        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Transfer added']);
        exit;
    }

    if ($action === 'delete_transfer') {
        $id = intval($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM transfers WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Transfer deleted']);
        exit;
    }

    // ─── 9. VISA & WEATHER & MEDIA & NOTES ───────────────────────────────────
    if ($action === 'save_visa') {
        $destId = intval($input['destination_id'] ?? 0);
        $stmt = $pdo->prepare("
            INSERT INTO visa_information (destination_id, visa_required, processing_days, documents_required, embassy_details, visa_fee, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE visa_required=VALUES(visa_required), processing_days=VALUES(processing_days), documents_required=VALUES(documents_required), embassy_details=VALUES(embassy_details), visa_fee=VALUES(visa_fee), remarks=VALUES(remarks)
        ");
        $stmt->execute([$destId, !empty($input['visa_required']) ? 1 : 0, intval($input['processing_days'] ?? 5), $input['documents_required'] ?? null, $input['embassy_details'] ?? null, floatval($input['visa_fee'] ?? 0), $input['remarks'] ?? null]);
        echo json_encode(['success' => true, 'message' => 'Visa info updated']);
        exit;
    }

    if ($action === 'save_weather') {
        $destId = intval($input['destination_id'] ?? 0);
        $stmt = $pdo->prepare("
            INSERT INTO weather_information (destination_id, best_months, avg_temp_c, rainfall_mm, peak_season, off_season, festival_season)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE best_months=VALUES(best_months), avg_temp_c=VALUES(avg_temp_c), rainfall_mm=VALUES(rainfall_mm), peak_season=VALUES(peak_season), off_season=VALUES(off_season), festival_season=VALUES(festival_season)
        ");
        $stmt->execute([$destId, $input['best_months'] ?? null, $input['avg_temp_c'] ?? null, $input['rainfall_mm'] ?? null, $input['peak_season'] ?? null, $input['off_season'] ?? null, $input['festival_season'] ?? null]);
        echo json_encode(['success' => true, 'message' => 'Weather info updated']);
        exit;
    }

    if ($action === 'add_media') {
        $destId = intval($input['destination_id'] ?? 0);
        $stmt = $pdo->prepare("INSERT INTO media_library (entity_type, entity_id, image_url, caption, is_featured) VALUES ('Destination', ?, ?, ?, ?)");
        $stmt->execute([$destId, trim($input['image_url']), $input['caption'] ?? null, !empty($input['is_featured']) ? 1 : 0]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Image added']);
        exit;
    }

    if ($action === 'add_note') {
        $destId = intval($input['destination_id'] ?? 0);
        $stmt = $pdo->prepare("INSERT INTO destination_notes (destination_id, note_text, created_by) VALUES (?, ?, ?)");
        $stmt->execute([$destId, trim($input['note_text']), $input['created_by'] ?? 'Agent']);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Note recorded']);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Invalid action parameter']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
