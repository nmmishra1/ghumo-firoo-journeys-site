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

// Enforce rate limiting across all requests (120 req/min per IP)
checkRateLimit(120, 60);

$id     = $_GET['id'] ?? '';
$action = $_GET['action'] ?? '';

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
            'state' => $h['state'] ?? 'Uttarakhand',
            'country' => $h['country'] ?? 'India',
            'google_rating' => round(4.1 + ($idx % 8) * 0.1, 1),
            'internal_rating' => round(4.3 + ($idx % 6) * 0.1, 1),
            'contact_number' => '+91 98765 ' . (10000 + $idx),
            'email' => 'reservations@' . preg_replace('/[^a-z0-9]/', '', strtolower($cleanName)) . '.com',
            'meal_plan_supported' => ['EP', 'CP', 'MAP', 'AP'],
            'featured_image_url' => $images[$idx % count($images)],
            'cat_or_room' => $h['cat_or_room'] ?? 'Standard',
            'b2b_cost' => $h['b2b_cost'] ?? 3000,
            'address' => "{$cleanName}, {$cityName}, " . ($h['state'] ?? 'Uttarakhand') . ", " . ($h['country'] ?? 'India'),
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

            if (isset($_GET['country_id']) && $_GET['country_id'] !== 'all' && $_GET['country_id'] !== '') {
                $cVal = trim($_GET['country_id']);
                $where[] = "(h.country_id = ? OR LOWER(co.country_name) LIKE LOWER(?) OR (h.country IS NOT NULL AND LOWER(h.country) LIKE LOWER(?)))";
                $params[] = $cVal;
                $params[] = "%$cVal%";
                $params[] = "%$cVal%";
            }

            if (isset($_GET['state_id']) && $_GET['state_id'] !== 'all' && $_GET['state_id'] !== '') {
                $sVal = trim($_GET['state_id']);
                $where[] = "(h.state_id = ? OR LOWER(s.state_name) LIKE LOWER(?) OR (h.state IS NOT NULL AND LOWER(h.state) LIKE LOWER(?)))";
                $params[] = $sVal;
                $params[] = "%$sVal%";
                $params[] = "%$sVal%";
            }

            if (isset($_GET['city_id']) && $_GET['city_id'] !== 'all' && $_GET['city_id'] !== '') {
                $ctVal = trim($_GET['city_id']);
                $where[] = "(h.city_id = ? OR LOWER(c.city_name) LIKE LOWER(?) OR (h.city IS NOT NULL AND LOWER(h.city) LIKE LOWER(?)))";
                $params[] = $ctVal;
                $params[] = "%$ctVal%";
                $params[] = "%$ctVal%";
            }

            foreach (['destination_group', 'active_status', 'star_rating'] as $f) {
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
                $countSql = "SELECT COUNT(*) FROM hotels h LEFT JOIN cities c ON h.city_id = c.id LEFT JOIN states s ON h.state_id = s.id LEFT JOIN countries co ON h.country_id = co.id $whereSQL";
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

                if ($totalRecords === 0) {
                    $jsonPath = __DIR__ . '/contractedHotels.json';
                    if (!file_exists($jsonPath)) {
                        $jsonPath = __DIR__ . '/../src/data/contractedHotels.json';
                    }
                    if (file_exists($jsonPath)) {
                        $rawJson = json_decode(file_get_contents($jsonPath), true) ?: [];
                        $qSearch = strtolower(trim($_GET['search'] ?? ''));
                        $qCountry = strtolower(trim($_GET['country_id'] ?? ''));
                        $qState = strtolower(trim($_GET['state_id'] ?? ''));
                        $qCity = strtolower(trim($_GET['city_id'] ?? ''));
                        $qStar = isset($_GET['star_rating']) && $_GET['star_rating'] !== 'all' && $_GET['star_rating'] !== '' ? (int)$_GET['star_rating'] : null;

                        $fallbackMatches = [];
                        foreach ($rawJson as $idx => $h) {
                            $name = trim($h['name'] ?? 'Contracted Hotel');
                            $hCity = trim($h['city'] ?? 'Uttarakhand');
                            $hState = trim($h['state'] ?? 'Uttarakhand');
                            $hCountry = trim($h['country'] ?? 'India');
                            $cat = strtolower($h['cat_or_room'] ?? '');
                            $stars = 3;
                            if (strpos($cat, 'luxury') !== false || strpos($cat, 'premium') !== false) {
                                $stars = 5;
                            } elseif (strpos($cat, 'standard') !== false || strpos($cat, 'deluxe') !== false) {
                                $stars = 4;
                            }

                            if (!empty($qSearch)) {
                                if (stripos($name, $qSearch) === false && stripos($hCity, $qSearch) === false && stripos($hState, $qSearch) === false) {
                                    continue;
                                }
                            }
                            if (!empty($qCountry) && $qCountry !== 'all') {
                                if (stripos($hCountry, $qCountry) === false && stripos($qCountry, $hCountry) === false) {
                                    continue;
                                }
                            }
                            if (!empty($qState) && $qState !== 'all') {
                                if (stripos($hState, $qState) === false && stripos($qState, $hState) === false) {
                                    continue;
                                }
                            }
                            if (!empty($qCity) && $qCity !== 'all') {
                                if (stripos($hCity, $qCity) === false && stripos($qCity, $hCity) === false) {
                                    continue;
                                }
                            }
                            if ($qStar !== null && $stars !== $qStar) {
                                continue;
                            }

                            $codePrefix = strtoupper(preg_replace('/[^A-Z]/', 'H', substr($name, 0, 4)));
                            $codeCity = strtoupper(preg_replace('/[^A-Z]/', 'CT', substr($hCity, 0, 3)));
                            $hotelCode = "{$codePrefix}-{$codeCity}-" . ($idx + 101);

                            $fallbackMatches[] = [
                                'id' => 'contracted-hotel-' . ($idx + 1),
                                'hotel_name' => $name,
                                'hotel_code' => $hotelCode,
                                'star_rating' => $stars,
                                'city' => $hCity,
                                'state' => $hState,
                                'country' => $hCountry,
                                'city_id' => $hCity,
                                'state_id' => $hState,
                                'country_id' => $hCountry,
                                'google_rating' => round(4.2 + ($idx % 7) * 0.1, 1),
                                'internal_rating' => round(4.3 + ($idx % 5) * 0.1, 1),
                                'contact_number' => '+91 98765 ' . (10000 + $idx),
                                'email' => 'reservations@' . preg_replace('/[^a-z0-9]/', '', strtolower($name)) . '.com',
                                'meal_plan_supported' => ['EP', 'CP', 'MAP', 'AP'],
                                'featured_image_url' => null,
                                'cat_or_room' => $h['cat_or_room'] ?? 'Standard',
                                'b2b_cost' => $h['b2b_cost'] ?? 3000,
                                'address' => "{$name}, {$hCity}, {$hState}, {$hCountry}",
                                'active_status' => true,
                                'active' => true
                            ];
                        }

                        $totalRecords = count($fallbackMatches);
                        $totalPages = max(1, ceil($totalRecords / $limit));
                        $rows = array_slice($fallbackMatches, $offset, $limit);
                    }
                }

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

        // Check for duplicate hotel name in the same city
        $hotelName = trim($input['hotel_name'] ?? '');
        $cityId = $input['city_id'] ?? null;
        if (!empty($hotelName)) {
            $dupSql = "SELECT id, hotel_name, hotel_code FROM hotels WHERE LOWER(TRIM(hotel_name)) = LOWER(TRIM(:hname))";
            $dupParams = [':hname' => $hotelName];
            if ($cityId) {
                $dupSql .= " AND city_id = :city_id";
                $dupParams[':city_id'] = $cityId;
            }
            $dupStmt = $pdo->prepare($dupSql);
            $dupStmt->execute($dupParams);
            $dup = $dupStmt->fetch(PDO::FETCH_ASSOC);
            if ($dup) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'error' => "Duplicate Record: A hotel named '{$dup['hotel_name']}' is already registered in this destination (Code: {$dup['hotel_code']}). Duplicate records cannot be saved.",
                    'duplicate' => true
                ]);
                exit;
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

        // Check for duplicate hotel name in the same city (excluding current hotel)
        $hotelName = trim($input['hotel_name'] ?? '');
        $cityId = $input['city_id'] ?? null;
        if (!empty($hotelName)) {
            $dupSql = "SELECT id, hotel_name, hotel_code FROM hotels WHERE LOWER(TRIM(hotel_name)) = LOWER(TRIM(:hname)) AND id != :current_id";
            $dupParams = [':hname' => $hotelName, ':current_id' => $id];
            if ($cityId) {
                $dupSql .= " AND city_id = :city_id";
                $dupParams[':city_id'] = $cityId;
            }
            $dupStmt = $pdo->prepare($dupSql);
            $dupStmt->execute($dupParams);
            $dup = $dupStmt->fetch(PDO::FETCH_ASSOC);
            if ($dup) {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'error' => "Duplicate Record: Another hotel named '{$dup['hotel_name']}' is already registered in this destination (Code: {$dup['hotel_code']}).",
                    'duplicate' => true
                ]);
                exit;
            }
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

        $realAction = $action ?: ($id ? 'update_hotel' : 'create_hotel');
        $hotelName = $data['hotel_name'] ?? $id;
        writeAuditLog($pdo, 'hotels', $id, strtoupper($realAction), null, "Saved hotel: {$hotelName}", $user ?? null);

        echo json_encode([
            'success' => true,
            'action' => $realAction,
            'table' => 'hotels',
            'id' => $id,
            'item_name' => $hotelName,
            'status' => 'SAVED_INTO_DATABASE',
            'audit_logged' => true,
            'message' => "Hotel '{$hotelName}' (ID: {$id}) successfully saved in MySQL database."
        ]);

    // ===================================================================
    // DELETE — remove a hotel
    // ===================================================================
    } elseif ($method === 'DELETE') {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id parameter']);
            exit;
        }

        $deletedHotelName = $id;
        try {
            $lookup = $pdo->prepare("SELECT hotel_name FROM hotels WHERE id = ?");
            $lookup->execute([$id]);
            $found = $lookup->fetchColumn();
            if ($found) $deletedHotelName = $found;
        } catch (Throwable $ignore) {}

        $stmt = $pdo->prepare("DELETE FROM hotels WHERE id = ?");
        $stmt->execute([$id]);
        $affected = $stmt->rowCount();

        $realAction = $action ?: 'delete_hotel';
        writeAuditLog($pdo, 'hotels', $id, strtoupper($realAction), $deletedHotelName, "Deleted from database", $user ?? null);

        echo json_encode([
            'success' => true,
            'action' => $realAction,
            'table' => 'hotels',
            'id' => $id,
            'item_name' => $deletedHotelName,
            'affected_rows' => $affected,
            'status' => 'DELETED_FROM_DATABASE',
            'audit_logged' => true,
            'message' => "Successfully deleted hotel '{$deletedHotelName}' (ID: {$id}) from database."
        ]);

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
}
