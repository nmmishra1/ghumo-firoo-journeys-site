<?php
error_reporting(0);
ini_set('display_errors', 0);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$action = $_GET['action'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'save_variant' || $action === 'update_variant' || $action === 'delete_variant' || $action === 'clone_to_itinerary' || ($method !== 'GET' && !$action)) {
    require_once __DIR__ . '/auth_middleware.php';
    $user = authenticate();
    $pdo = getDb();
    $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);
} else {
    $pdo = getDb();
}

try {
    // -------------------------------------------------------------------------
    // ACTION 1: Save / Update Variant (POST or PUT via action)
    // -------------------------------------------------------------------------
    if ($action === 'save_variant' || $action === 'update_variant') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $packageId = $data['package_id'] ?? null;
        $variantKey = $data['variant_key'] ?? ($data['id_key'] ?? null);

        if (!$packageId || !$variantKey) {
            http_response_code(400);
            echo json_encode(['error' => 'package_id and variant_key are required']);
            exit;
        }

        $pdo->beginTransaction();

        $variantId = $data['id'] ?? null;

        if ($variantId) {
            // Check existing
            $check = $pdo->prepare("SELECT id FROM package_variants WHERE id = ?");
            $check->execute([$variantId]);
            if (!$check->fetch()) {
                $variantId = null;
            }
        }

        if (!$variantId) {
            // Check by package_id + variant_key
            $checkKey = $pdo->prepare("SELECT id FROM package_variants WHERE package_id = ? AND variant_key = ?");
            $checkKey->execute([$packageId, $variantKey]);
            $existing = $checkKey->fetch();
            if ($existing) {
                $variantId = $existing['id'];
            }
        }

        $inclusionsJson = json_encode($data['inclusions'] ?? []);
        $exclusionsJson = json_encode($data['exclusions'] ?? []);

        if ($variantId) {
            // Update
            $stmt = $pdo->prepare("UPDATE package_variants SET
                variant_key = ?, label = ?, nights = ?, days = ?, tag = ?,
                price_per_person = ?, hotel_category = ?, group_size = ?, pickup_from = ?,
                inclusions = ?, exclusions = ?, sort_order = ?, is_active = ?
                WHERE id = ?");
            $stmt->execute([
                $variantKey,
                $data['label'] ?? '',
                intval($data['nights'] ?? 0),
                intval($data['days'] ?? 1),
                $data['tag'] ?? null,
                floatval($data['price_per_person'] ?? 0),
                $data['hotel_category'] ?? null,
                $data['group_size'] ?? null,
                $data['pickup_from'] ?? null,
                $inclusionsJson,
                $exclusionsJson,
                intval($data['sort_order'] ?? 0),
                isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1,
                $variantId
            ]);
        } else {
            // Insert
            $stmt = $pdo->prepare("INSERT INTO package_variants (
                package_id, variant_key, label, nights, days, tag, price_per_person,
                hotel_category, group_size, pickup_from, inclusions, exclusions, sort_order, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $packageId,
                $variantKey,
                $data['label'] ?? '',
                intval($data['nights'] ?? 0),
                intval($data['days'] ?? 1),
                $data['tag'] ?? null,
                floatval($data['price_per_person'] ?? 0),
                $data['hotel_category'] ?? null,
                $data['group_size'] ?? null,
                $data['pickup_from'] ?? null,
                $inclusionsJson,
                $exclusionsJson,
                intval($data['sort_order'] ?? 0),
                isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1
            ]);
            $variantId = $pdo->lastInsertId();
        }

        // Save Child Tables if provided
        // 1. Itinerary Days
        if (isset($data['itinerary']) && is_array($data['itinerary'])) {
            $pdo->prepare("DELETE FROM variant_itinerary_days WHERE variant_id = ?")->execute([$variantId]);
            $insDay = $pdo->prepare("INSERT INTO variant_itinerary_days (variant_id, day_number, timing, title, description, activities, meals, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($data['itinerary'] as $idx => $day) {
                $insDay->execute([
                    $variantId,
                    intval($day['day_number'] ?? $day['day'] ?? ($idx + 1)),
                    $day['timing'] ?? null,
                    $day['title'] ?? '',
                    $day['description'] ?? null,
                    json_encode($day['activities'] ?? []),
                    $day['meals'] ?? null,
                    intval($day['sort_order'] ?? $idx)
                ]);
            }
        }

        // 2. Hotels
        if (isset($data['hotels']) && is_array($data['hotels'])) {
            $pdo->prepare("DELETE FROM variant_hotels WHERE variant_id = ?")->execute([$variantId]);
            $insHotel = $pdo->prepare("INSERT INTO variant_hotels (variant_id, hotel_name, location, stars, highlight, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
            foreach ($data['hotels'] as $idx => $h) {
                $insHotel->execute([
                    $variantId,
                    $h['hotel_name'] ?? $h['name'] ?? '',
                    $h['location'] ?? null,
                    intval($h['stars'] ?? 3),
                    $h['highlight'] ?? null,
                    intval($h['sort_order'] ?? $idx)
                ]);
            }
        }

        // 3. Excursions
        if (isset($data['excursions']) && is_array($data['excursions'])) {
            $pdo->prepare("DELETE FROM variant_excursions WHERE variant_id = ?")->execute([$variantId]);
            $insExc = $pdo->prepare("INSERT INTO variant_excursions (variant_id, excursion_name, description, duration, price, is_included, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($data['excursions'] as $idx => $e) {
                $insExc->execute([
                    $variantId,
                    $e['excursion_name'] ?? $e['name'] ?? '',
                    $e['description'] ?? null,
                    $e['duration'] ?? null,
                    $e['price'] ?? null,
                    (isset($e['is_included']) ? ($e['is_included'] ? 1 : 0) : (isset($e['included']) ? ($e['included'] ? 1 : 0) : 1)),
                    intval($e['sort_order'] ?? $idx)
                ]);
            }
        }

        // 4. Price Table
        if (isset($data['price_table']) && is_array($data['price_table'])) {
            $pdo->prepare("DELETE FROM variant_price_rows WHERE variant_id = ?")->execute([$variantId]);
            $insPrice = $pdo->prepare("INSERT INTO variant_price_rows (variant_id, room_type, price, sort_order) VALUES (?, ?, ?, ?)");
            foreach ($data['price_table'] as $idx => $pr) {
                $insPrice->execute([
                    $variantId,
                    $pr['room_type'] ?? $pr['roomType'] ?? '',
                    $pr['price'] ?? '',
                    intval($pr['sort_order'] ?? $idx)
                ]);
            }
        }

        // 5. Cancellation Policy
        if (isset($data['cancellation_policy']) && is_array($data['cancellation_policy'])) {
            $pdo->prepare("DELETE FROM variant_cancellation WHERE variant_id = ?")->execute([$variantId]);
            $insCancel = $pdo->prepare("INSERT INTO variant_cancellation (variant_id, days_before, charge, sort_order) VALUES (?, ?, ?, ?)");
            foreach ($data['cancellation_policy'] as $idx => $c) {
                $insCancel->execute([
                    $variantId,
                    $c['days_before'] ?? $c['daysBefore'] ?? $c['days'] ?? '',
                    $c['charge'] ?? '',
                    intval($c['sort_order'] ?? $idx)
                ]);
            }
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'variant_id' => intval($variantId)]);
        exit;
    }

    // -------------------------------------------------------------------------
    // ACTION 2: Delete Variant (DELETE via action or GET with action=delete_variant)
    // -------------------------------------------------------------------------
    if ($action === 'delete_variant') {
        $variantId = $_GET['id'] ?? null;
        if (!$variantId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing variant id']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM package_variants WHERE id = ?");
        $stmt->execute([$variantId]);
        echo json_encode(['success' => true]);
        exit;
    }

    // -------------------------------------------------------------------------
    // ACTION 3: Clone Package Template to Itinerary Payload
    // -------------------------------------------------------------------------
    if ($action === 'clone_to_itinerary') {
        $pkgId = $_GET['package_id'] ?? $_GET['id'] ?? null;
        if (!$pkgId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing package_id or id parameter']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM packages WHERE id = ? OR slug = ? LIMIT 1");
        $stmt->execute([$pkgId, $pkgId]);
        $pkg = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pkg) {
            http_response_code(404);
            echo json_encode(['error' => 'Package not found']);
            exit;
        }

        // Fetch Variants & Day Plans
        $varStmt = $pdo->prepare("SELECT * FROM package_variants WHERE package_id = ?");
        $varStmt->execute([$pkg['id']]);
        $variants = $varStmt->fetchAll(PDO::FETCH_ASSOC);

        $parsedPkg = parsePackageJSONFields($pkg);

        // Format day items for ItineraryBuilder
        $dayPlans = $parsedPkg['day_plans'] ?? $parsedPkg['itinerary'] ?? [];
        if (!is_array($dayPlans)) $dayPlans = [];

        $formattedDays = [];
        foreach ($dayPlans as $idx => $dp) {
            $dayNum = $idx + 1;
            $formattedDays[] = [
                'day_number' => $dayNum,
                'title' => $dp['title'] ?? ($dp['day_title'] ?? "Day $dayNum"),
                'description' => $dp['description'] ?? ($dp['activities'] ?? ''),
                'sightseeing_ids' => $dp['sightseeing_ids'] ?? [],
                'activity_ids' => $dp['activity_ids'] ?? [],
                'hotel_id' => $dp['hotel_id'] ?? null,
                'meals' => $dp['meals'] ?? ['Breakfast']
            ];
        }

        $payload = [
            'success' => true,
            'source_package_id' => $pkg['id'],
            'package_title' => $pkg['title'] ?? $pkg['name'],
            'destination' => $pkg['destination'] ?? '',
            'duration' => $pkg['duration'] ?? '',
            'nights' => (int)($pkg['nights'] ?? 0),
            'days' => (int)($pkg['days'] ?? 0),
            'day_by_day' => $formattedDays,
            'inclusions' => $parsedPkg['inclusions'] ?? [],
            'exclusions' => $parsedPkg['exclusions'] ?? [],
            'highlights' => $parsedPkg['highlights'] ?? [],
            'base_price' => (float)($pkg['price'] ?? $pkg['base_price'] ?? 0),
            'variants' => $variants
        ];

        echo json_encode($payload);
        exit;
    }

    // -------------------------------------------------------------------------
    // GET single package or list of packages
    // -------------------------------------------------------------------------
    $slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;
    $id = isset($_GET['id']) ? trim($_GET['id']) : (isset($_GET['table']) && isset($_GET['id']) ? $_GET['id'] : null);

    if ($method === 'GET' && ($slug !== null || $id !== null)) {
        if ($slug !== null) {
            $stmt = $pdo->prepare("SELECT * FROM packages WHERE slug = ?");
            $stmt->execute([$slug]);
            $package = $stmt->fetch();
            if (!$package && (strpos($slug, 'rann-utsav') !== false || strpos($slug, 'kutch') !== false)) {
                $stmt = $pdo->prepare("SELECT * FROM packages WHERE slug = 'kutch-rann-utsav' OR slug LIKE '%kutch%' OR slug LIKE '%rann-utsav%' LIMIT 1");
                $stmt->execute();
                $package = $stmt->fetch();
            }
        } else {
            $stmt = $pdo->prepare("SELECT * FROM packages WHERE id = ?");
            $stmt->execute([$id]);
            $package = $stmt->fetch();
        }

        if (!$package) {
            http_response_code(404);
            echo json_encode(['error' => 'Package not found']);
            exit;
        }

        $packageId = $package['id'];

        // Parse JSON fields on base package
        $package = parsePackageJSONFields($package);

        // Fetch variants for this package
        $package['variants'] = fetchPackageVariants($pdo, $packageId);

        // Fetch hotels & attractions for this package
        $package['hotels'] = fetchPackageHotels($pdo, $packageId);
        $package['attractions'] = fetchPackageAttractions($pdo, $packageId);

        // Return formatted package
        echo json_encode([
            'package' => $package,
            'id' => $package['id'],
            'name' => $package['name'],
            'slug' => $package['slug'],
            'duration' => $package['duration'],
            'price' => $package['price'],
            'rating' => $package['rating'],
            'reviews' => $package['reviews'],
            'image' => $package['image'],
            'images' => $package['images'],
            'destinations' => $package['destinations'],
            'highlights' => $package['highlights'],
            'inclusions' => $package['inclusions'],
            'exclusions' => $package['exclusions'],
            'itinerary' => $package['itinerary'],
            'hotels' => $package['hotels'],
            'attractions' => $package['attractions'],
            'variants' => $package['variants'],
            'is_active' => $package['is_active']
        ]);
        exit;
    } elseif ($method === 'GET') {
        // Fetch list of packages
        $stmt = $pdo->query("SELECT * FROM packages ORDER BY name ASC");
        $packages = $stmt->fetchAll();

        $result = [];
        foreach ($packages as $pkg) {
            $pkg = parsePackageJSONFields($pkg);
            if (isset($_GET['include_variants']) && $_GET['include_variants'] == '1') {
                $pkg['variants'] = fetchPackageVariants($pdo, $pkg['id']);
            }
            $result[] = $pkg;
        }

        echo json_encode($result);
        exit;
    } elseif ($method === 'POST') {
        $p = json_decode(file_get_contents('php://input'), true) ?? [];
        $pkgName = trim($p['name'] ?? ($p['package_name'] ?? ($p['title'] ?? '')));
        $pkgSlug = trim($p['slug'] ?? '');

        if (!empty($pkgSlug) || !empty($pkgName)) {
            $dupSql = "SELECT id, name, slug FROM packages WHERE 1=0";
            $dupParams = [];
            if (!empty($pkgSlug)) {
                $dupSql .= " OR LOWER(TRIM(slug)) = LOWER(TRIM(:slug))";
                $dupParams[':slug'] = $pkgSlug;
            }
            if (!empty($pkgName)) {
                $dupSql .= " OR LOWER(TRIM(name)) = LOWER(TRIM(:name))";
                $dupParams[':name'] = $pkgName;
            }
            $dupStmt = $pdo->prepare($dupSql);
            $dupStmt->execute($dupParams);
            $dup = $dupStmt->fetch(PDO::FETCH_ASSOC);
            if ($dup) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'error' => "Duplicate Package: A tour package named '{$dup['name']}' (slug: '{$dup['slug']}') already exists in MySQL database.",
                    'duplicate' => true
                ]);
                exit;
            }
        }

        $newId = $p['id'] ?? generateUuid();

        $stmt = $pdo->prepare("INSERT INTO packages (
            id, name, price, slug, duration, image, images, category, rating, reviews,
            destinations, highlights, inclusions, exclusions, itinerary, map_locations,
            flight_routes, virtual_tour, faqs, seo_title, seo_description, seo_keywords,
            best_time, group_size, difficulty, quick_facts, package_type, is_active,
            tagline, hero_image, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $newId, $p['name'] ?? '', floatval($p['price'] ?? 0), $p['slug'] ?? '', $p['duration'] ?? '', $p['image'] ?? '',
            json_encode($p['images'] ?? []), json_encode($p['category'] ?? []), floatval($p['rating'] ?? 5.0), intval($p['reviews'] ?? 0),
            json_encode($p['destinations'] ?? []), json_encode($p['highlights'] ?? []),
            json_encode($p['inclusions'] ?? []), json_encode($p['exclusions'] ?? []),
            json_encode($p['itinerary'] ?? new stdClass()), json_encode($p['map_locations'] ?? []),
            json_encode($p['flight_routes'] ?? []), json_encode($p['virtual_tour'] ?? new stdClass()),
            json_encode($p['faqs'] ?? []), $p['seo_title'] ?? '', $p['seo_description'] ?? '', $p['seo_keywords'] ?? '',
            $p['best_time'] ?? '', $p['group_size'] ?? '', $p['difficulty'] ?? '', json_encode($p['quick_facts'] ?? new stdClass()),
            $p['package_type'] ?? '', isset($p['is_active']) ? ($p['is_active'] ? 1 : 0) : 1,
            $p['tagline'] ?? null, $p['hero_image'] ?? null, isset($p['is_featured']) ? ($p['is_featured'] ? 1 : 0) : 0
        ]);
        echo json_encode(['success' => true, 'id' => $newId]);
        exit;
    } elseif ($method === 'PUT') {
        $id = $_GET['id'] ?? (isset($_GET['table']) && isset($_GET['id']) ? $_GET['id'] : null);
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing package id']);
            exit;
        }
        $p = json_decode(file_get_contents('php://input'), true) ?? [];

        $stmt = $pdo->prepare("UPDATE packages SET
            name = ?, price = ?, slug = ?, duration = ?, image = ?, images = ?, category = ?,
            rating = ?, reviews = ?, destinations = ?, highlights = ?, inclusions = ?, exclusions = ?,
            itinerary = ?, map_locations = ?, flight_routes = ?, virtual_tour = ?, faqs = ?,
            seo_title = ?, seo_description = ?, seo_keywords = ?, best_time = ?, group_size = ?,
            difficulty = ?, quick_facts = ?, package_type = ?, is_active = ?,
            tagline = ?, hero_image = ?, is_featured = ?
        WHERE id = ?");

        $stmt->execute([
            $p['name'] ?? '', floatval($p['price'] ?? 0), $p['slug'] ?? '', $p['duration'] ?? '', $p['image'] ?? '',
            json_encode($p['images'] ?? []), json_encode($p['category'] ?? []), floatval($p['rating'] ?? 5.0), intval($p['reviews'] ?? 0),
            json_encode($p['destinations'] ?? []), json_encode($p['highlights'] ?? []),
            json_encode($p['inclusions'] ?? []), json_encode($p['exclusions'] ?? []),
            json_encode($p['itinerary'] ?? new stdClass()), json_encode($p['map_locations'] ?? []),
            json_encode($p['flight_routes'] ?? []), json_encode($p['virtual_tour'] ?? new stdClass()),
            json_encode($p['faqs'] ?? []), $p['seo_title'] ?? '', $p['seo_description'] ?? '', $p['seo_keywords'] ?? '',
            $p['best_time'] ?? '', $p['group_size'] ?? '', $p['difficulty'] ?? '', json_encode($p['quick_facts'] ?? new stdClass()),
            $p['package_type'] ?? '', isset($p['is_active']) ? ($p['is_active'] ? 1 : 0) : 1,
            $p['tagline'] ?? null, $p['hero_image'] ?? null, isset($p['is_featured']) ? ($p['is_featured'] ? 1 : 0) : 0,
            $id
        ]);
        echo json_encode(['success' => true]);
        exit;
    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? (isset($_GET['table']) && isset($_GET['id']) ? $_GET['id'] : null);
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing package id']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM packages WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server Error: ' . $e->getMessage()]);
    exit;
}

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------
function generateUuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%012x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0x4000, 0x4fff),
        mt_rand(0x8000, 0xbfff),
        mt_rand(0, 0xffffffffffff)
    );
}

function cleanMojibakeStr($str) {
    if (!is_string($str)) return $str;
    $replacements = [
        'ÔåÆ' => '→',
        'â†’' => '→',
        '&rarr;' => '→',
        '->' => '→',
        'ÔÇö' => '—',
        'â€”' => '—',
        'ÔÇô' => '–',
        'â€“' => '–',
        'ÔÇÖ' => '’',
        'â€™' => '’',
        'ÔÇÿ' => '‘',
        'â€˜' => '‘',
        'ÔÇ£' => '“',
        'â€œ' => '“',
        'ÔÇØ' => '”',
        'â€ ' => '”',
        'ÔÇª' => '…',
        'â€¦' => '…',
        'â€¢' => '•',
        'â‚¹' => '₹',
        'Â₹' => '₹',
        'Â' => ''
    ];
    return str_replace(array_keys($replacements), array_values($replacements), $str);
}

function cleanMojibakeData($data) {
    if (is_string($data)) {
        return cleanMojibakeStr($data);
    }
    if (is_array($data)) {
        foreach ($data as $k => $v) {
            $data[$k] = cleanMojibakeData($v);
        }
    }
    return $data;
}

function parsePackageJSONFields($pkg) {
    if (!$pkg) return $pkg;

    $jsonFields = [
        'images', 'category', 'destinations', 'highlights',
        'inclusions', 'exclusions', 'itinerary', 'map_locations',
        'flight_routes', 'virtual_tour', 'faqs', 'quick_facts',
        'attractions_json', 'route_stops_json', 'destinations_json'
    ];

    foreach ($jsonFields as $field) {
        if (isset($pkg[$field]) && is_string($pkg[$field])) {
            $decoded = json_decode($pkg[$field], true);
            $pkg[$field] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : [];
        }
    }

    if (isset($pkg['is_active'])) {
        $pkg['is_active'] = (bool)$pkg['is_active'];
    }

    return cleanMojibakeData($pkg);
}

function fetchPackageHotels(PDO $pdo, $packageId) {
    try {
        // package_variants/variant_hotels is the canonical source now — check
        // it first. package_hotels is the legacy relational table this is
        // being consolidated away from; only used as a fallback for
        // packages that haven't been migrated onto variants yet.
        $vStmt = $pdo->prepare("SELECT DISTINCT vh.hotel_name AS name, vh.location, vh.stars, vh.highlight FROM variant_hotels vh JOIN package_variants pv ON vh.variant_id = pv.id WHERE pv.package_id = ? ORDER BY pv.sort_order ASC, vh.sort_order ASC");
        $vStmt->execute([$packageId]);
        $hotels = $vStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        if (empty($hotels)) {
            $stmt = $pdo->prepare("SELECT hotel_name AS name, location, stars, room_type, meal_plan, image, price_from FROM package_hotels WHERE package_id = ?");
            $stmt->execute([$packageId]);
            $hotels = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        }
        return $hotels;
    } catch (Exception $e) {
        return [];
    }
}

function fetchPackageAttractions(PDO $pdo, $packageId) {
    try {
        $stmt = $pdo->prepare("SELECT name, description, image FROM package_attractions WHERE package_id = ? ORDER BY sort_order ASC, id ASC");
        $stmt->execute([$packageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    } catch (Exception $e) {
        return [];
    }
}

function fetchPackageVariants(PDO $pdo, $packageId) {
    $vars = $pdo->prepare("SELECT * FROM package_variants WHERE package_id = ? AND is_active = 1 ORDER BY sort_order ASC, id ASC");
    $vars->execute([$packageId]);
    $variants = $vars->fetchAll(PDO::FETCH_ASSOC);

    foreach ($variants as &$v) {
        $vid = $v['id'];

        $v['price_per_person'] = floatval($v['price_per_person']);
        $v['pricePerPerson'] = $v['price_per_person'];
        $v['hotelCategory'] = $v['hotel_category'];
        $v['groupSize'] = $v['group_size'];
        $v['pickupFrom'] = $v['pickup_from'];
        $v['variantKey'] = $v['variant_key'];

        $v['inclusions'] = json_decode($v['inclusions'] ?? '[]', true) ?: [];
        $v['exclusions'] = json_decode($v['exclusions'] ?? '[]', true) ?: [];

        // Itinerary
        $days = $pdo->prepare("SELECT * FROM variant_itinerary_days WHERE variant_id = ? ORDER BY sort_order ASC, day_number ASC");
        $days->execute([$vid]);
        $daysData = $days->fetchAll(PDO::FETCH_ASSOC);
        foreach ($daysData as &$d) {
            $d['activities'] = json_decode($d['activities'] ?? '[]', true) ?: [];
            $d['day'] = intval($d['day_number']);
        }
        $v['itinerary'] = $daysData;

        // Hotels
        $hotels = $pdo->prepare("SELECT * FROM variant_hotels WHERE variant_id = ? ORDER BY sort_order ASC, id ASC");
        $hotels->execute([$vid]);
        $hotelList = $hotels->fetchAll(PDO::FETCH_ASSOC);
        foreach ($hotelList as &$h) {
            $h['name'] = $h['hotel_name'];
            $h['stars'] = intval($h['stars']);
        }
        $v['hotels'] = $hotelList;

        // Excursions
        $exc = $pdo->prepare("SELECT * FROM variant_excursions WHERE variant_id = ? ORDER BY sort_order ASC, id ASC");
        $exc->execute([$vid]);
        $excList = $exc->fetchAll(PDO::FETCH_ASSOC);
        foreach ($excList as &$e) {
            $e['name'] = $e['excursion_name'];
            $e['included'] = (bool)$e['is_included'];
        }
        $v['excursions'] = $excList;

        // Price table
        $prices = $pdo->prepare("SELECT * FROM variant_price_rows WHERE variant_id = ? ORDER BY sort_order ASC, id ASC");
        $prices->execute([$vid]);
        $priceList = $prices->fetchAll(PDO::FETCH_ASSOC);
        foreach ($priceList as &$pr) {
            $pr['roomType'] = $pr['room_type'];
        }
        $v['price_table'] = $priceList;
        $v['priceTable'] = $priceList;

        // Cancellation policy
        $cancel = $pdo->prepare("SELECT * FROM variant_cancellation WHERE variant_id = ? ORDER BY sort_order ASC, id ASC");
        $cancel->execute([$vid]);
        $cancelList = $cancel->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cancelList as &$c) {
            $c['daysBefore'] = $c['days_before'];
        }
        $v['cancellation_policy'] = $cancelList;
        $v['cancellationPolicy'] = $cancelList;
    }

    return cleanMojibakeData($variants);
}
