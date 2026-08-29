<?php
// destinations_api.php - Phase 1 & Phase 2 RESTful Controller for Destination Manager
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

    // ─── GET ROUTE ────────────────────────────────────────────────────────────
    if ($method === 'GET') {
        // 1. Fetch Tree Hierarchy (World -> Parent -> Child)
        if (isset($_GET['tree'])) {
            $stmt = $pdo->query("SELECT * FROM destinations ORDER BY destination_type ASC, city ASC");
            $all = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Group by hierarchy
            $tree = [];
            $lookup = [];
            foreach ($all as $item) {
                $item['children'] = [];
                $lookup[$item['id']] = $item;
            }

            foreach ($lookup as $id => &$node) {
                if ($node['parent_destination_id'] && isset($lookup[$node['parent_destination_id']])) {
                    $lookup[$node['parent_destination_id']]['children'][] = &$node;
                } else {
                    $tree[] = &$node;
                }
            }

            echo json_encode(['success' => true, 'tree' => $tree, 'total' => count($all)]);
            exit;
        }

        // 2. Enhanced Global Search
        if (isset($_GET['search'])) {
            $search = trim($_GET['search']);
            $like = "%{$search}%";

            $stmt = $pdo->prepare("
                SELECT DISTINCT d.*, 
                    (SELECT COUNT(*) FROM attractions WHERE destination_id = d.id) as attraction_count,
                    (SELECT COUNT(*) FROM activities WHERE destination_id = d.id) as activity_count
                FROM destinations d
                LEFT JOIN destination_tags dt ON d.id = dt.destination_id
                LEFT JOIN tag_master tm ON dt.tag_id = tm.id
                LEFT JOIN attractions att ON d.id = att.destination_id
                LEFT JOIN activities act ON d.id = act.destination_id
                WHERE d.city LIKE ? 
                   OR d.display_name LIKE ? 
                   OR d.iata_code LIKE ? 
                   OR d.destination_code LIKE ? 
                   OR d.airport LIKE ?
                   OR tm.tag_name LIKE ?
                   OR att.name LIKE ?
                   OR act.name LIKE ?
                ORDER BY d.city ASC
                LIMIT 50
            ");
            $stmt->execute([$like, $like, $like, $like, $like, $like, $like, $like]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $results]);
            exit;
        }

        // 3. Sub-Resource REST Queries (Phase 1 & Phase 2 Commercial Resources)
        if (isset($_GET['id']) && isset($_GET['resource'])) {
            $id = trim($_GET['id']);
            $resource = trim($_GET['resource']);

            if ($resource === 'activities') {
                $stmt = $pdo->prepare("SELECT a.*, c.name as category_name FROM activities a LEFT JOIN activity_categories c ON a.category_id=c.id WHERE a.destination_id=? ORDER BY a.name ASC");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                exit;
            }

            if ($resource === 'hotels') {
                $stmt = $pdo->prepare("
                    SELECT dh.*, hm.name as hotel_name, hm.star_category, hm.address, hm.contact_phone 
                    FROM destination_hotels dh
                    JOIN hotel_master hm ON dh.hotel_id = hm.id
                    WHERE dh.destination_id = ?
                    ORDER BY dh.priority ASC
                ");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                exit;
            }

            if ($resource === 'restaurants') {
                $stmt = $pdo->prepare("
                    SELECT dr.*, rm.name as restaurant_name, rm.cuisine, rm.meal_type, rm.approx_cost, rm.is_veg, rm.is_halal, rm.is_jain
                    FROM destination_restaurants dr
                    JOIN restaurant_master rm ON dr.restaurant_id = rm.id
                    WHERE dr.destination_id = ?
                ");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                exit;
            }

            if ($resource === 'shopping') {
                $stmt = $pdo->prepare("
                    SELECT ds.*, sm.name as shopping_name, sm.category, sm.recommended_for, sm.opening_hours
                    FROM destination_shopping ds
                    JOIN shopping_master sm ON ds.shopping_id = sm.id
                    WHERE ds.destination_id = ?
                ");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                exit;
            }

            if ($resource === 'relationships') {
                $stmt = $pdo->prepare("
                    SELECT dr.*, d.city as related_city, d.destination_type as related_type, d.iata_code
                    FROM destination_relationships dr
                    JOIN destinations d ON dr.related_destination_id = d.id
                    WHERE dr.destination_id = ?
                ");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                exit;
            }

            if ($resource === 'external_ids') {
                $stmt = $pdo->prepare("SELECT * FROM destination_external_ids WHERE destination_id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                exit;
            }

            if ($resource === 'packages') {
                $stmt = $pdo->prepare("
                    SELECT rp.*, p.title as package_title, p.price, p.duration 
                    FROM recommended_packages rp
                    JOIN packages p ON rp.package_id = p.id
                    WHERE rp.destination_id = ?
                ");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                exit;
            }
        }

        // 4. Single Destination Detail
        if (isset($_GET['id'])) {
            $id = trim($_GET['id']);
            $stmt = $pdo->prepare("SELECT * FROM destinations WHERE id = ?");
            $stmt->execute([$id]);
            $dest = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$dest) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Destination not found']);
                exit;
            }

            // Sub-items
            $mediaStmt = $pdo->prepare("SELECT * FROM media_library WHERE entity_type='Destination' AND entity_id=? ORDER BY sort_order ASC");
            $mediaStmt->execute([$id]);
            $dest['media'] = $mediaStmt->fetchAll(PDO::FETCH_ASSOC);

            $attractStmt = $pdo->prepare("SELECT * FROM attractions WHERE destination_id=? ORDER BY priority ASC");
            $attractStmt->execute([$id]);
            $dest['attractions'] = $attractStmt->fetchAll(PDO::FETCH_ASSOC);

            $actStmt = $pdo->prepare("SELECT a.*, c.name as category_name FROM activities a LEFT JOIN activity_categories c ON a.category_id=c.id WHERE a.destination_id=? ORDER BY a.name ASC");
            $actStmt->execute([$id]);
            $dest['activities'] = $actStmt->fetchAll(PDO::FETCH_ASSOC);

            $transStmt = $pdo->prepare("SELECT t.*, s.supplier_name FROM transfers t LEFT JOIN supplier_master s ON t.supplier_id=s.id WHERE t.destination_id=?");
            $transStmt->execute([$id]);
            $dest['transfers'] = $transStmt->fetchAll(PDO::FETCH_ASSOC);

            $hotelStmt = $pdo->prepare("SELECT dh.*, hm.name as hotel_name, hm.star_category FROM destination_hotels dh JOIN hotel_master hm ON dh.hotel_id = hm.id WHERE dh.destination_id = ?");
            $hotelStmt->execute([$id]);
            $dest['hotels'] = $hotelStmt->fetchAll(PDO::FETCH_ASSOC);

            $restStmt = $pdo->prepare("SELECT dr.*, rm.name as restaurant_name, rm.cuisine FROM destination_restaurants dr JOIN restaurant_master rm ON dr.restaurant_id = rm.id WHERE dr.destination_id = ?");
            $restStmt->execute([$id]);
            $dest['restaurants'] = $restStmt->fetchAll(PDO::FETCH_ASSOC);

            $shopStmt = $pdo->prepare("SELECT ds.*, sm.name as shopping_name, sm.category FROM destination_shopping ds JOIN shopping_master sm ON ds.shopping_id = sm.id WHERE ds.destination_id = ?");
            $shopStmt->execute([$id]);
            $dest['shopping'] = $shopStmt->fetchAll(PDO::FETCH_ASSOC);

            $relStmt = $pdo->prepare("SELECT dr.*, d.city as related_city, d.destination_type as related_type FROM destination_relationships dr JOIN destinations d ON dr.related_destination_id = d.id WHERE dr.destination_id = ?");
            $relStmt->execute([$id]);
            $dest['relationships'] = $relStmt->fetchAll(PDO::FETCH_ASSOC);

            $extStmt = $pdo->prepare("SELECT * FROM destination_external_ids WHERE destination_id = ?");
            $extStmt->execute([$id]);
            $dest['external_ids'] = $extStmt->fetchAll(PDO::FETCH_ASSOC);

            $visaStmt = $pdo->prepare("SELECT * FROM visa_information WHERE destination_id=?");
            $visaStmt->execute([$id]);
            $dest['visa'] = $visaStmt->fetch(PDO::FETCH_ASSOC) ?: null;

            $weatherStmt = $pdo->prepare("SELECT * FROM weather_information WHERE destination_id=?");
            $weatherStmt->execute([$id]);
            $dest['weather'] = $weatherStmt->fetch(PDO::FETCH_ASSOC) ?: null;

            $notesStmt = $pdo->prepare("SELECT * FROM destination_notes WHERE destination_id=? ORDER BY created_at DESC");
            $notesStmt->execute([$id]);
            $dest['notes'] = $notesStmt->fetchAll(PDO::FETCH_ASSOC);

            $auditStmt = $pdo->prepare("SELECT * FROM destination_audit_logs WHERE destination_id=? ORDER BY changed_at DESC LIMIT 20");
            $auditStmt->execute([$id]);
            $dest['audit_logs'] = $auditStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $dest]);
            exit;
        }

        // Default List
        $stmt = $pdo->query("SELECT d.*, 
            (SELECT COUNT(*) FROM attractions WHERE destination_id = d.id) as attraction_count,
            (SELECT COUNT(*) FROM activities WHERE destination_id = d.id) as activity_count
            FROM destinations d ORDER BY d.city ASC LIMIT 100");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $data]);
        exit;
    }

    // ─── POST ROUTE (Create / Restore) ───────────────────────────────────────
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        // Action: Restore Archived Destination
        if ($action === 'restore' || (!empty($input['action']) && $input['action'] === 'restore')) {
            $id = intval($_GET['id'] ?? $input['id'] ?? 0);
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing destination ID for restore']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE destinations SET status = 'Published' WHERE id = ?");
            $stmt->execute([$id]);

            $audit = $pdo->prepare("INSERT INTO destination_audit_logs (destination_id, record_type, field_name, old_value, new_value, changed_by) VALUES (?, 'destination', 'status', 'Archived', 'Published', ?)");
            $audit->execute([$id, $input['changed_by'] ?? 'Agent']);

            echo json_encode(['success' => true, 'message' => 'Destination restored to Published status']);
            exit;
        }

        if (!$input || empty($input['city'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'City name is required']);
            exit;
        }

        // Pre-save duplicate check
        $dupStmt = $pdo->prepare("SELECT id, city FROM destinations WHERE LOWER(city) = LOWER(?) AND (parent_destination_id = ? OR (? IS NULL AND parent_destination_id IS NULL))");
        $parent = !empty($input['parent_destination_id']) ? intval($input['parent_destination_id']) : null;
        $dupStmt->execute([trim($input['city']), $parent, $parent]);
        $existing = $dupStmt->fetch();

        if ($existing) {
            echo json_encode([
                'success' => false, 
                'is_duplicate' => true, 
                'existing_id' => $existing['id'],
                'message' => "Destination '{$existing['city']}' already exists in database."
            ]);
            exit;
        }

        // Auto-generate immutable destination code (e.g. FRA0001, IND0001, AUT0001)
        $prefix = 'DST';
        $countryName = $input['country'] ?? $input['city'];
        if (!empty($countryName)) {
            $clean = preg_replace('/[^A-Za-z]/', '', $countryName);
            if (strlen($clean) >= 3) {
                $prefix = strtoupper(substr($clean, 0, 3));
            }
        }

        $seqStmt = $pdo->prepare("SELECT COUNT(*) FROM destinations WHERE destination_code LIKE ?");
        $seqStmt->execute(["{$prefix}%"]);
        $seq = intval($seqStmt->fetchColumn()) + 1;
        $code = sprintf("%s%04d", $prefix, $seq);

        $stmt = $pdo->prepare("
            INSERT INTO destinations (
                parent_destination_id, destination_type, city, display_name, destination_code, 
                iata_code, recommended_nights, airport, railway, currency, timezone, lat, lng, 
                elevation, best_time, weather_summary, language, visa_required, status, is_featured, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $parent,
            $input['destination_type'] ?? 'City',
            trim($input['city']),
            $input['display_name'] ?? trim($input['city']),
            $code,
            strtoupper($input['iata_code'] ?? ''),
            intval($input['recommended_nights'] ?? 2),
            $input['airport'] ?? null,
            $input['railway'] ?? null,
            $input['currency'] ?? 'INR',
            $input['timezone'] ?? 'IST (UTC+5:30)',
            $input['lat'] ?? null,
            $input['lng'] ?? null,
            $input['elevation'] ?? null,
            $input['best_time'] ?? null,
            $input['weather_summary'] ?? null,
            $input['language'] ?? 'English',
            !empty($input['visa_required']) ? 1 : 0,
            $input['status'] ?? 'Published',
            !empty($input['is_featured']) ? 1 : 0,
            $input['description'] ?? null
        ]);

        $newId = $pdo->lastInsertId();

        // Audit Log
        $audit = $pdo->prepare("INSERT INTO destination_audit_logs (destination_id, record_type, field_name, old_value, new_value, changed_by) VALUES (?, 'destination', 'created', null, ?, ?)");
        $audit->execute([$newId, "Created new destination '{$input['city']}' with immutable code {$code}", $input['changed_by'] ?? 'Agent']);

        echo json_encode(['success' => true, 'id' => $newId, 'destination_code' => $code, 'message' => 'Destination created successfully']);
        exit;
    }

    // ─── PUT ROUTE ────────────────────────────────────────────────────────────
    if ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = intval($_GET['id'] ?? $input['id'] ?? 0);

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing destination ID']);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE destinations SET
                parent_destination_id = ?,
                destination_type = ?,
                city = ?,
                display_name = ?,
                iata_code = ?,
                recommended_nights = ?,
                airport = ?,
                railway = ?,
                currency = ?,
                timezone = ?,
                best_time = ?,
                weather_summary = ?,
                language = ?,
                visa_required = ?,
                status = ?,
                is_featured = ?,
                description = ?
            WHERE id = ?
        ");

        $parent = !empty($input['parent_destination_id']) ? intval($input['parent_destination_id']) : null;
        $stmt->execute([
            $parent,
            $input['destination_type'] ?? 'City',
            trim($input['city']),
            $input['display_name'] ?? trim($input['city']),
            strtoupper($input['iata_code'] ?? ''),
            intval($input['recommended_nights'] ?? 2),
            $input['airport'] ?? null,
            $input['railway'] ?? null,
            $input['currency'] ?? 'INR',
            $input['timezone'] ?? 'IST (UTC+5:30)',
            $input['best_time'] ?? null,
            $input['weather_summary'] ?? null,
            $input['language'] ?? 'English',
            !empty($input['visa_required']) ? 1 : 0,
            $input['status'] ?? 'Published',
            !empty($input['is_featured']) ? 1 : 0,
            $input['description'] ?? null,
            $id
        ]);

        // Audit Log
        $audit = $pdo->prepare("INSERT INTO destination_audit_logs (destination_id, record_type, field_name, old_value, new_value, changed_by) VALUES (?, 'destination', 'updated', null, 'Updated destination settings', ?)");
        $audit->execute([$id, $input['changed_by'] ?? 'Agent']);

        echo json_encode(['success' => true, 'message' => 'Destination updated successfully']);
        exit;
    }

    // ─── DELETE ROUTE (Soft Delete Only) ──────────────────────────────────────
    if ($method === 'DELETE') {
        $id = intval($_GET['id'] ?? 0);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing destination ID']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE destinations SET status = 'Archived' WHERE id = ?");
        $stmt->execute([$id]);

        $audit = $pdo->prepare("INSERT INTO destination_audit_logs (destination_id, record_type, field_name, old_value, new_value, changed_by) VALUES (?, 'destination', 'status', 'Published', 'Archived', ?)");
        $audit->execute([$id, 'Agent']);

        echo json_encode(['success' => true, 'message' => 'Destination archived successfully']);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
