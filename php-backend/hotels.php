<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

require_once __DIR__ . '/auth_middleware.php';
require_once __DIR__ . '/db.php';

$pdo = getDb();

$method = $_SERVER['REQUEST_METHOD'];

// GET requests are public; write operations require auth.
if ($method !== 'GET') {
    $user = authenticate();
    $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);
}

$id     = $_GET['id'] ?? '';

// -----------------------------------------------------------------------
// JSON columns that must be decoded on read and encoded on write
// -----------------------------------------------------------------------
$JSON_COLS = ['photos', 'meal_plan_supported', 'gallery_urls', 'video_urls'];

// -----------------------------------------------------------------------
// Resolve city_id in cities and india_cities dynamically
// -----------------------------------------------------------------------
function resolveCityId(PDO $pdo, $cityName, $stateName = null, $countryName = null): ?int
{
    if (empty($cityName)) return null;

    $cityName = trim($cityName);
    $stateName = $stateName ? trim($stateName) : 'Uttarakhand'; 
    $countryName = $countryName ? trim($countryName) : 'India';

    // 1. Search in cities table
    $stmt = $pdo->prepare("SELECT id FROM cities WHERE name = ?");
    $stmt->execute([$cityName]);
    $cityRow = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($cityRow) {
        return (int)$cityRow['id'];
    }

    // 2. Search in india_cities table
    $stmt = $pdo->prepare("SELECT id FROM india_cities WHERE name = ?");
    $stmt->execute([$cityName]);
    $indiaCityRow = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($indiaCityRow) {
        $id = (int)$indiaCityRow['id'];
        try {
            $ins = $pdo->prepare("INSERT IGNORE INTO cities (id, name, city_name, state) VALUES (?, ?, ?, ?)");
            $ins->execute([$id, $cityName, $cityName, $stateName]);
        } catch (Throwable $e) {}
        return $id;
    }

    // 3. Create new city in both tables with matching ID.
    $stateId = 1; 
    if (!empty($stateName)) {
        $st = $pdo->prepare("SELECT id FROM india_states WHERE state_name LIKE ?");
        $st->execute(["%$stateName%"]);
        $stRow = $st->fetch(PDO::FETCH_ASSOC);
        if ($stRow) {
            $stateId = (int)$stRow['id'];
        }
    }

    $ins = $pdo->prepare("INSERT INTO india_cities (name, state_id) VALUES (?, ?)");
    $ins->execute([$cityName, $stateId]);
    $newId = (int)$pdo->lastInsertId();

    try {
        $insCities = $pdo->prepare("INSERT IGNORE INTO cities (id, name, city_name, state) VALUES (?, ?, ?, ?)");
        $insCities->execute([$newId, $cityName, $cityName, $stateName]);
    } catch (Throwable $e) {}

    return $newId;
}

// -----------------------------------------------------------------------
// Parse a hotel row: decode JSON columns, cast numeric/boolean types
// -----------------------------------------------------------------------
function parseHotelRow(array $row): array
{
    global $JSON_COLS;
    foreach ($JSON_COLS as $field) {
        if (isset($row[$field]) && is_string($row[$field])) {
            $decoded      = json_decode($row[$field], true);
            $row[$field]  = $decoded !== null ? $decoded : [];
        }
    }
    if (isset($row['star_rating']))    $row['star_rating']    = (int)$row['star_rating'];
    if (isset($row['google_rating']))  $row['google_rating']  = (float)$row['google_rating'];
    if (isset($row['internal_rating'])) $row['internal_rating'] = (float)$row['internal_rating'];
    if (isset($row['active']))         $row['active']         = (bool)$row['active'];
    if (isset($row['active_status']))  $row['active_status']  = (bool)$row['active_status'];
    return $row;
}

// -----------------------------------------------------------------------
// Encode JSON columns and prepare a value map from input
// Only write columns that actually exist in the hotels table.
// -----------------------------------------------------------------------
function buildHotelData(array $input, array $columns): array
{
    $data = [];
    foreach ($input as $key => $val) {
        if ($key === 'id') continue;
        if (!in_array($key, $columns, true)) continue;
        if (is_array($val) || is_object($val)) {
            $data[$key] = json_encode($val);
        } else {
            $data[$key] = $val;
        }
    }
    return $data;
}

// -----------------------------------------------------------------------
// Fallback for master contracted hotels that may not yet exist in MySQL DB
// -----------------------------------------------------------------------
function getFallbackContractedHotel(string $id): ?array
{
    static $masterHotels = null;

    if ($masterHotels === null) {
        $jsonPath = __DIR__ . '/contractedHotels.json';
        if (!file_exists($jsonPath)) {
            $jsonPath = __DIR__ . '/../src/data/contractedHotels.json';
        }
        if (file_exists($jsonPath)) {
            $content = file_get_contents($jsonPath);
            $masterHotels = json_decode($content, true) ?: [];
        } else {
            $masterHotels = [];
        }
    }

    $idx = -1;
    if (preg_match('/^contracted-hotel-(\d+)$/', $id, $matches)) {
        $idx = (int)$matches[1] - 1;
    }

    if ($idx >= 0 && isset($masterHotels[$idx])) {
        $h = $masterHotels[$idx];
        $cityName = trim($h['city'] ?? 'Uttarakhand');
        $cleanName = trim($h['name'] ?? 'Contracted Hotel');
        $cat = strtolower($h['cat_or_room'] ?? '');
        $stars = 3;
        if (strpos($cat, 'luxury') !== false || strpos($cat, 'premium') !== false) {
            $stars = 5;
        } elseif (strpos($cat, 'standard') !== false || strpos($cat, 'deluxe') !== false) {
            $stars = 4;
        }

        $codePrefix = strtoupper(preg_replace('/[^A-Z]/', 'H', substr($cleanName, 0, 4)));
        $codeCity = strtoupper(preg_replace('/[^A-Z]/', 'CT', substr($cityName, 0, 3)));
        $hotelCode = "{$codePrefix}-{$codeCity}-" . ($idx + 101);

        $images = [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
        ];

        return [
            'id' => $id,
            'hotel_name' => $cleanName,
            'hotel_code' => $hotelCode,
            'star_rating' => $stars,
            'city' => $cityName,
            'state' => 'Uttarakhand',
            'country' => 'India',
            'google_rating' => round(4.1 + ($idx % 8) * 0.1, 1),
            'internal_rating' => round(4.3 + ($idx % 6) * 0.1, 1),
            'contact_number' => '+91 98765 ' . (10000 + $idx),
            'email' => 'reservations@' . preg_replace('/[^a-z0-9]/', '', strtolower($cleanName)) . '.com',
            'meal_plan_supported' => ['EP', 'CP', 'MAP'],
            'featured_image_url' => $images[$idx % count($images)],
            'cat_or_room' => $h['cat_or_room'] ?? 'Standard',
            'b2b_cost' => $h['b2b_cost'] ?? 3000,
            'address' => "{$cleanName}, {$cityName}, Uttarakhand, India",
            'active_status' => true,
            'active' => true
        ];
    }

    if (strpos($id, 'contracted-hotel-') === 0) {
        $num = str_replace('contracted-hotel-', '', $id);
        return [
            'id' => $id,
            'hotel_name' => 'Contracted Hotel ' . $num,
            'hotel_code' => 'CONT-HOTEL-' . $num,
            'star_rating' => 3,
            'city' => 'Uttarakhand',
            'state' => 'Uttarakhand',
            'country' => 'India',
            'meal_plan_supported' => ['EP', 'CP', 'MAP'],
            'active_status' => true,
            'active' => true
        ];
    }

    return null;
}

try {
    // Fetch real column list from DB so we never write to phantom columns
    $q       = $pdo->query("DESCRIBE `hotels`");
    $columns = $q->fetchAll(PDO::FETCH_COLUMN);

    // ===================================================================
    // GET — list all or fetch by id
    // ===================================================================
    if ($method === 'GET') {
        if (!empty($id)) {
            $stmt = $pdo->prepare("SELECT * FROM hotels WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo json_encode(parseHotelRow($row));
            } else {
                $fallback = getFallbackContractedHotel($id);
                if ($fallback) {
                    echo json_encode($fallback);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Hotel not found']);
                }
            }
        } else {
            // Optional filter by city_id, state_id, country_id, star_rating, active_status, search
            $where  = [];
            $params = [];
            
            foreach (['city_id', 'state_id', 'country_id', 'destination_group', 'active_status', 'star_rating'] as $f) {
                if (isset($_GET[$f]) && $_GET[$f] !== 'all' && $_GET[$f] !== '' && in_array($f, $columns, true)) {
                    $where[]  = "h.`$f` = ?";
                    $params[] = $_GET[$f];
                }
            }

            // Search filter
            $search = trim($_GET['search'] ?? '');
            if (!empty($search)) {
                $where[] = "(LOWER(h.hotel_name) LIKE LOWER(?) OR LOWER(h.hotel_code) LIKE LOWER(?) OR LOWER(c.city_name) LIKE LOWER(?) OR LOWER(s.state_name) LIKE LOWER(?) OR LOWER(h.address) LIKE LOWER(?))";
                $searchTerm = '%' . $search . '%';
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }

            $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';
            
            $isPaginated = isset($_GET['page']) || isset($_GET['limit']) || isset($_GET['paginated']);
            
            if ($isPaginated) {
                $page = max(1, (int)($_GET['page'] ?? 1));
                $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
                $offset = ($page - 1) * $limit;

                // Count total matching records
                $countSql = "SELECT COUNT(*) FROM hotels h LEFT JOIN cities c ON h.city_id = c.id LEFT JOIN states s ON h.state_id = s.id $whereSQL";
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute($params);
                $totalRecords = (int)$countStmt->fetchColumn();
                $totalPages = max(1, ceil($totalRecords / $limit));

                // Fetch paginated data
                $sql = "SELECT h.*, c.city_name as city, s.state_name as state, co.country_name as country 
                        FROM hotels h 
                        LEFT JOIN cities c ON h.city_id = c.id 
                        LEFT JOIN states s ON h.state_id = s.id 
                        LEFT JOIN countries co ON h.country_id = co.id 
                        $whereSQL 
                        ORDER BY h.hotel_name ASC 
                        LIMIT $limit OFFSET $offset";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'data' => array_map('parseHotelRow', $rows),
                    'pagination' => [
                        'page' => $page,
                        'limit' => $limit,
                        'total_records' => $totalRecords,
                        'total_pages' => $totalPages
                    ]
                ]);
            } else {
                $stmt = $pdo->prepare("SELECT h.*, c.city_name as city, s.state_name as state, co.country_name as country FROM hotels h LEFT JOIN cities c ON h.city_id = c.id LEFT JOIN states s ON h.state_id = s.id LEFT JOIN countries co ON h.country_id = co.id $whereSQL ORDER BY h.hotel_name ASC");
                $stmt->execute($params);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(array_map('parseHotelRow', $rows));
            }
        }

    // ===================================================================
    // POST — create a new hotel
    // ===================================================================
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        if (!empty($input['city'])) {
            $resolvedId = resolveCityId($pdo, $input['city'], $input['state'] ?? null, $input['country'] ?? null);
            if ($resolvedId !== null) {
                $input['city_id'] = $resolvedId;
            }
        }
        $newId = $input['id'] ?? ('hotel-' . uniqid('', true));
        $data  = buildHotelData($input, $columns);

        if (empty($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'No valid fields provided']);
            exit;
        }

        $cols         = array_keys($data);
        $placeholders = array_map(fn($c) => ":$c", $cols);
        $sql = "INSERT INTO `hotels` (`id`, `" . implode("`, `", $cols) . "`) "
             . "VALUES (:id, "  . implode(", ", $placeholders) . ")";

        $params = array_merge([':id' => $newId],
                              array_combine($placeholders, array_values($data)));
        $pdo->prepare($sql)->execute($params);
        echo json_encode(['success' => true, 'id' => $newId]);

    // ===================================================================
    // PUT — update an existing hotel
    // ===================================================================
    } elseif ($method === 'PUT') {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id parameter']);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($input['city_id']) && !empty($input['city'])) {
            try {
                $resolvedId = resolveCityId($pdo, $input['city'], $input['state'] ?? null, $input['country'] ?? null);
                if ($resolvedId !== null) {
                    $input['city_id'] = $resolvedId;
                }
            } catch (Throwable $e) {}
        }
        $data  = buildHotelData($input, $columns);

        if (empty($data)) {
            echo json_encode(['success' => true, 'message' => 'No columns to update']);
            exit;
        }

        // Check if hotel exists in DB
        $stmtCheck = $pdo->prepare("SELECT id FROM hotels WHERE id = ?");
        $stmtCheck->execute([$id]);
        $exists = $stmtCheck->fetchColumn();

        if ($exists) {
            $setParts = [];
            $params   = [':id' => $id];
            foreach ($data as $key => $val) {
                $setParts[]     = "`$key` = :$key";
                $params[":$key"] = $val;
            }
            $sql = "UPDATE `hotels` SET " . implode(", ", $setParts) . " WHERE id = :id";
            $pdo->prepare($sql)->execute($params);
        } else {
            // Upsert / Insert new record with specified $id
            $cols         = array_keys($data);
            $placeholders = array_map(fn($c) => ":$c", $cols);
            $sql = "INSERT INTO `hotels` (`id`, `" . implode("`, `", $cols) . "`) "
                 . "VALUES (:id, "  . implode(", ", $placeholders) . ")";
            $params = array_merge([':id' => $id], array_combine($placeholders, array_values($data)));
            $pdo->prepare($sql)->execute($params);
        }

        echo json_encode(['success' => true]);

    // ===================================================================
    // DELETE — remove a hotel
    // ===================================================================
    } elseif ($method === 'DELETE') {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id parameter']);
            exit;
        }
        $pdo->prepare("DELETE FROM hotels WHERE id = ?")->execute([$id]);
        echo json_encode(['success' => true]);

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
}
