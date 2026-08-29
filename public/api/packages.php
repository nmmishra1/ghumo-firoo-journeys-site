<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? '';
$slug = $_GET['slug'] ?? '';

// Helper to decode JSON columns
function parsePackageRow($row) {
    if (!$row) return null;
    $jsonFields = ['images', 'category', 'destinations', 'highlights', 'inclusions', 'exclusions', 'itinerary', 'map_locations', 'flight_routes', 'virtual_tour', 'faqs', 'quick_facts'];
    foreach ($jsonFields as $field) {
        if (isset($row[$field]) && is_string($row[$field])) {
            $decoded = json_decode($row[$field], true);
            $row[$field] = $decoded !== null ? $decoded : [];
        }
    }
    // Cast fields to match Supabase types
    if (isset($row['price'])) $row['price'] = (float)$row['price'];
    if (isset($row['rating'])) $row['rating'] = (float)$row['rating'];
    if (isset($row['reviews'])) $row['reviews'] = (int)$row['reviews'];
    if (isset($row['is_active'])) $row['is_active'] = (bool)$row['is_active'];
    return $row;
}

// Helper to calculate package starting price
function calculatePackagePrice($pdo, $packageId) {
    $priceStmt = $pdo->prepare("
        SELECT COALESCE(SUM(
            CASE 
                WHEN pti.item_type = 'hotel' THEN hr.rate_per_night * pti.quantity
                WHEN pti.item_type = 'cab' THEN cr.rate * pti.quantity
                WHEN pti.item_type = 'activity' THEN ar.adult_rate * pti.quantity
                ELSE 0
            END
        ), 0) AS calculated_price
        FROM package_template_items pti
        LEFT JOIN hotel_rates hr ON pti.hotel_rate_id = hr.id AND hr.is_active = 1
        LEFT JOIN cab_rates cr ON pti.cab_rate_id = cr.id AND cr.is_active = 1
        LEFT JOIN activity_rates ar ON pti.activity_rate_id = ar.id AND ar.is_active = 1
        WHERE pti.package_id = ?
    ");
    $priceStmt->execute([$packageId]);
    $priceRow = $priceStmt->fetch(PDO::FETCH_ASSOC);
    return $priceRow ? floatval($priceRow['calculated_price']) : 0;
}

// Helper to fetch package attractions
function fetchPackageAttractions($pdo, $packageId) {
    $stmt = $pdo->prepare("SELECT * FROM package_attractions WHERE package_id = ? ORDER BY sort_order ASC");
    $stmt->execute([$packageId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Helper to fetch package hotels
function fetchPackageHotels($pdo, $packageId) {
    $stmt = $pdo->prepare("
        SELECT DISTINCT 
            h.id, 
            h.name, 
            h.star_category, 
            c.name AS location,
            hr.room_type,
            hr.meal_plan,
            hr.rate_per_night AS price_from
        FROM package_template_items pti
        JOIN hotel_rates hr ON pti.hotel_rate_id = hr.id AND hr.is_active = 1
        JOIN hotels h ON hr.hotel_id = h.id AND h.is_active = 1
        JOIN cities c ON h.city_id = c.id
        WHERE pti.package_id = ?
    ");
    $stmt->execute([$packageId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

try {
    if ($method === 'GET') {
        if (!empty($id)) {
            // Check if ID is UUID format, otherwise treat as slug
            $isUuid = preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id);
            if ($isUuid) {
                $stmt = $pdo->prepare("SELECT * FROM packages WHERE id = ?");
                $stmt->execute([$id]);
            } else {
                $stmt = $pdo->prepare("SELECT * FROM packages WHERE slug = ?");
                $stmt->execute([$id]);
            }
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $pkg = parsePackageRow($row);
                $packageId = $pkg['id'];
                
                $calculatedPrice = calculatePackagePrice($pdo, $packageId);
                if ($calculatedPrice > 0) {
                    $pkg['price'] = $calculatedPrice;
                }
                
                $pkg['attractions'] = fetchPackageAttractions($pdo, $packageId);
                $pkg['hotels'] = fetchPackageHotels($pdo, $packageId);
                
                echo json_encode($pkg);
            } else {
                header('HTTP/1.1 404 Not Found');
                echo json_encode(['error' => 'Package not found']);
            }
        } elseif (!empty($slug)) {
            $stmt = $pdo->prepare("SELECT * FROM packages WHERE slug = ?");
            $stmt->execute([$slug]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $pkg = parsePackageRow($row);
                $packageId = $pkg['id'];
                
                $calculatedPrice = calculatePackagePrice($pdo, $packageId);
                if ($calculatedPrice > 0) {
                    $pkg['price'] = $calculatedPrice;
                }
                
                $pkg['attractions'] = fetchPackageAttractions($pdo, $packageId);
                $pkg['hotels'] = fetchPackageHotels($pdo, $packageId);
                
                echo json_encode($pkg);
            } else {
                header('HTTP/1.1 404 Not Found');
                echo json_encode(['error' => 'Package not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM packages ORDER BY name ASC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $parsed = [];
            foreach ($rows as $row) {
                $pkg = parsePackageRow($row);
                $calculatedPrice = calculatePackagePrice($pdo, $pkg['id']);
                if ($calculatedPrice > 0) {
                    $pkg['price'] = $calculatedPrice;
                }
                $parsed[] = $pkg;
            }
            echo json_encode($parsed);
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $newId = $input['id'] ?? ('pkg-' . time() . '-' . rand(1000, 9999));
        
        $stmt = $pdo->prepare("INSERT INTO packages (
          id, name, price, slug, duration, image, images, category, rating, reviews,
          destinations, highlights, inclusions, exclusions, itinerary, map_locations,
          flight_routes, virtual_tour, faqs, seo_title, seo_description, seo_keywords,
          best_time, group_size, difficulty, quick_facts, package_type, is_active
        ) VALUES (
          :id, :name, :price, :slug, :duration, :image, :images, :category, :rating, :reviews,
          :destinations, :highlights, :inclusions, :exclusions, :itinerary, :map_locations,
          :flight_routes, :virtual_tour, :faqs, :seo_title, :seo_description, :seo_keywords,
          :best_time, :group_size, :difficulty, :quick_facts, :package_type, :is_active
        )");
        
        $stmt->execute([
            ':id' => $newId,
            ':name' => $input['name'] ?? '',
            ':price' => $input['price'] ?? 0,
            ':slug' => $input['slug'] ?? '',
            ':duration' => $input['duration'] ?? '',
            ':image' => $input['image'] ?? '',
            ':images' => is_array($input['images'] ?? null) ? json_encode($input['images']) : ($input['images'] ?? '[]'),
            ':category' => is_array($input['category'] ?? null) ? json_encode($input['category']) : ($input['category'] ?? '[]'),
            ':rating' => $input['rating'] ?? 5.0,
            ':reviews' => $input['reviews'] ?? 0,
            ':destinations' => is_array($input['destinations'] ?? null) ? json_encode($input['destinations']) : ($input['destinations'] ?? '[]'),
            ':highlights' => is_array($input['highlights'] ?? null) ? json_encode($input['highlights']) : ($input['highlights'] ?? '[]'),
            ':inclusions' => is_array($input['inclusions'] ?? null) ? json_encode($input['inclusions']) : ($input['inclusions'] ?? '[]'),
            ':exclusions' => is_array($input['exclusions'] ?? null) ? json_encode($input['exclusions']) : ($input['exclusions'] ?? '[]'),
            ':itinerary' => is_array($input['itinerary'] ?? null) ? json_encode($input['itinerary']) : ($input['itinerary'] ?? '{}'),
            ':map_locations' => is_array($input['map_locations'] ?? null) ? json_encode($input['map_locations']) : ($input['map_locations'] ?? '[]'),
            ':flight_routes' => is_array($input['flight_routes'] ?? null) ? json_encode($input['flight_routes']) : ($input['flight_routes'] ?? '[]'),
            ':virtual_tour' => is_array($input['virtual_tour'] ?? null) ? json_encode($input['virtual_tour']) : ($input['virtual_tour'] ?? '{}'),
            ':faqs' => is_array($input['faqs'] ?? null) ? json_encode($input['faqs']) : ($input['faqs'] ?? '[]'),
            ':seo_title' => $input['seo_title'] ?? '',
            ':seo_description' => $input['seo_description'] ?? '',
            ':seo_keywords' => $input['seo_keywords'] ?? '',
            ':best_time' => $input['best_time'] ?? '',
            ':group_size' => $input['group_size'] ?? '',
            ':difficulty' => $input['difficulty'] ?? '',
            ':quick_facts' => is_array($input['quick_facts'] ?? null) ? json_encode($input['quick_facts']) : ($input['quick_facts'] ?? '{}'),
            ':package_type' => $input['package_type'] ?? '',
            ':is_active' => isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1
        ]);
        
        echo json_encode(['success' => true, 'id' => $newId]);
    } elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($id)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID parameter']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE packages SET
          name = :name,
          price = :price,
          slug = :slug,
          duration = :duration,
          image = :image,
          images = :images,
          category = :category,
          rating = :rating,
          reviews = :reviews,
          destinations = :destinations,
          highlights = :highlights,
          inclusions = :inclusions,
          exclusions = :exclusions,
          itinerary = :itinerary,
          map_locations = :map_locations,
          flight_routes = :flight_routes,
          virtual_tour = :virtual_tour,
          faqs = :faqs,
          seo_title = :seo_title,
          seo_description = :seo_description,
          seo_keywords = :seo_keywords,
          best_time = :best_time,
          group_size = :group_size,
          difficulty = :difficulty,
          quick_facts = :quick_facts,
          package_type = :package_type,
          is_active = :is_active
        WHERE id = :id");
        
        $stmt->execute([
            ':id' => $id,
            ':name' => $input['name'] ?? '',
            ':price' => $input['price'] ?? 0,
            ':slug' => $input['slug'] ?? '',
            ':duration' => $input['duration'] ?? '',
            ':image' => $input['image'] ?? '',
            ':images' => is_array($input['images'] ?? null) ? json_encode($input['images']) : ($input['images'] ?? '[]'),
            ':category' => is_array($input['category'] ?? null) ? json_encode($input['category']) : ($input['category'] ?? '[]'),
            ':rating' => $input['rating'] ?? 5.0,
            ':reviews' => $input['reviews'] ?? 0,
            ':destinations' => is_array($input['destinations'] ?? null) ? json_encode($input['destinations']) : ($input['destinations'] ?? '[]'),
            ':highlights' => is_array($input['highlights'] ?? null) ? json_encode($input['highlights']) : ($input['highlights'] ?? '[]'),
            ':inclusions' => is_array($input['inclusions'] ?? null) ? json_encode($input['inclusions']) : ($input['inclusions'] ?? '[]'),
            ':exclusions' => is_array($input['exclusions'] ?? null) ? json_encode($input['exclusions']) : ($input['exclusions'] ?? '[]'),
            ':itinerary' => is_array($input['itinerary'] ?? null) ? json_encode($input['itinerary']) : ($input['itinerary'] ?? '{}'),
            ':map_locations' => is_array($input['map_locations'] ?? null) ? json_encode($input['map_locations']) : ($input['map_locations'] ?? '[]'),
            ':flight_routes' => is_array($input['flight_routes'] ?? null) ? json_encode($input['flight_routes']) : ($input['flight_routes'] ?? '[]'),
            ':virtual_tour' => is_array($input['virtual_tour'] ?? null) ? json_encode($input['virtual_tour']) : ($input['virtual_tour'] ?? '{}'),
            ':faqs' => is_array($input['faqs'] ?? null) ? json_encode($input['faqs']) : ($input['faqs'] ?? '[]'),
            ':seo_title' => $input['seo_title'] ?? '',
            ':seo_description' => $input['seo_description'] ?? '',
            ':seo_keywords' => $input['seo_keywords'] ?? '',
            ':best_time' => $input['best_time'] ?? '',
            ':group_size' => $input['group_size'] ?? '',
            ':difficulty' => $input['difficulty'] ?? '',
            ':quick_facts' => is_array($input['quick_facts'] ?? null) ? json_encode($input['quick_facts']) : ($input['quick_facts'] ?? '{}'),
            ':package_type' => $input['package_type'] ?? '',
            ':is_active' => isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : 1
        ]);
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE') {
        if (empty($id)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID parameter']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM packages WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}
