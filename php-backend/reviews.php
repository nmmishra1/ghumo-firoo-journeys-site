<?php
error_reporting(0);
ini_set('display_errors', 0);
// reviews.php — handles customer reviews CRUD and moderation on MySQL.
// Requires a valid Supabase session JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

// Public GET requests are allowed (for website reviews display), but modifications require CRM role
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$user = null;
$profile = null;

$pdo = getDb();

if ($method !== 'GET' && $method !== 'POST') {
    $user = authenticate();
    $profile = requireRole($user, $pdo, ['admin', 'manager']);
}

try {
    if ($method === 'GET') {
        $status = $_GET['status'] ?? '';
        $featured = isset($_GET['featured']) ? (int)$_GET['featured'] : null;
        $destination = $_GET['destination'] ?? '';
        $hotelId = $_GET['hotel_id'] ?? '';
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        $whereParts = [];
        $params = [];

        if ($status !== '') {
            $whereParts[] = "status = ?";
            $params[] = $status;
        }

        if ($featured !== null) {
            $whereParts[] = "featured = ?";
            $params[] = $featured;
        }

        if ($destination !== '') {
            $whereParts[] = "destination LIKE ?";
            $params[] = "%$destination%";
        }

        if ($hotelId !== '') {
            // Find related booking_ids (itinerary_ids) from itinerary_hotels
            $ihStmt = $pdo->prepare('SELECT DISTINCT itinerary_id FROM itinerary_hotels WHERE hotel_id = ?');
            $ihStmt->execute([$hotelId]);
            $itineraries = $ihStmt->fetchAll(PDO::FETCH_COLUMN);

            if (empty($itineraries)) {
                echo json_encode(['success' => true, 'reviews' => []]);
                exit;
            }

            $inPlaceholders = implode(',', array_fill(0, count($itineraries), '?'));
            $whereParts[] = "booking_id IN ($inPlaceholders)";
            $params = array_merge($params, $itineraries);
        }

        $whereClause = !empty($whereParts) ? "WHERE " . implode(" AND ", $whereParts) : "";
        $limitClause = $limit !== null ? "LIMIT ? OFFSET ?" : "";

        $sql = "SELECT * FROM reviews $whereClause ORDER BY created_at DESC $limitClause";
        $stmt = $pdo->prepare($sql);

        // Bind limit/offset as parameters for pagination
        $paramIndex = 1;
        foreach ($params as $paramVal) {
            $stmt->bindValue($paramIndex++, $paramVal);
        }

        if ($limit !== null) {
            $stmt->bindValue($paramIndex++, $limit, PDO::PARAM_INT);
            $stmt->bindValue($paramIndex++, $offset, PDO::PARAM_INT);
        }

        $stmt->execute();
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode JSON columns and convert tinyint booleans for strict React types
        foreach ($reviews as &$rev) {
            $rev['rating'] = (int)$rev['rating'];
            $rev['hotel_rating'] = $rev['hotel_rating'] !== null ? (int)$rev['hotel_rating'] : null;
            $rev['cab_rating'] = $rev['cab_rating'] !== null ? (int)$rev['cab_rating'] : null;
            $rev['sightseeing_rating'] = $rev['sightseeing_rating'] !== null ? (int)$rev['sightseeing_rating'] : null;
            $rev['trip_planning_rating'] = $rev['trip_planning_rating'] !== null ? (int)$rev['trip_planning_rating'] : null;
            $rev['verified'] = $rev['verified'] !== null ? (bool)$rev['verified'] : null;
            $rev['featured'] = $rev['featured'] !== null ? (bool)$rev['featured'] : null;
            
            if (isset($rev['photos']) && is_string($rev['photos'])) {
                $decoded = json_decode($rev['photos'], true);
                $rev['photos'] = $decoded !== null ? $decoded : [];
            } else {
                $rev['photos'] = [];
            }
        }

        echo json_encode(['success' => true, 'reviews' => $reviews]);

    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        $customerName = trim($input['customer_name'] ?? '');
        $rating = (int)($input['rating'] ?? 0);
        
        if ($customerName === '' || $rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'customer_name and valid rating (1-5) are required']);
            exit;
        }

        $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $photos = isset($input['photos']) ? json_encode($input['photos']) : null;
        $verified = isset($input['verified']) ? (int)$input['verified'] : 1;
        $featured = isset($input['featured']) ? (int)$input['featured'] : 0;
        $status = $input['status'] ?? 'Pending';

        $stmt = $pdo->prepare(
            'INSERT INTO reviews 
                (id, customer_name, destination, rating, review_text, hotel_rating, cab_rating, sightseeing_rating, trip_planning_rating, photos, video_url, verified, featured, status, booking_id, travel_date, platform, response, lead_id, package_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $customerName,
            $input['destination'] ?? null,
            $rating,
            $input['review_text'] ?? null,
            $input['hotel_rating'] ?? null,
            $input['cab_rating'] ?? null,
            $input['sightseeing_rating'] ?? null,
            $input['trip_planning_rating'] ?? null,
            $photos,
            $input['video_url'] ?? null,
            $verified,
            $featured,
            $status,
            $input['booking_id'] ?? null,
            $input['travel_date'] ?? null,
            $input['platform'] ?? 'website',
            $input['response'] ?? null,
            isset($input['lead_id']) ? (int)$input['lead_id'] : null,
            $input['package_name'] ?? null
        ]);

        echo json_encode(['success' => true, 'id' => $id]);

    } elseif ($method === 'PATCH') {
        $id = $_GET['id'] ?? '';
        if ($id === '') {
            http_response_code(400);
            echo json_encode(['error' => 'id parameter is required']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        // Retrieve existing column schema
        $q = $pdo->query("DESCRIBE reviews");
        $columns = $q->fetchAll(PDO::FETCH_COLUMN);

        $mapping = [
            'status' => 'status',
            'featured' => 'featured',
            'response' => 'response',
            'verified' => 'verified',
            'rating' => 'rating',
            'review_text' => 'review_text',
            'destination' => 'destination',
            'photos' => 'photos'
        ];

        $updateFields = [];
        $updateParams = [];
        foreach ($mapping as $key => $col) {
            if (array_key_exists($key, $input) && in_array($col, $columns)) {
                $updateFields[] = "`$col` = ?";
                $val = $input[$key];
                if ($key === 'featured' || $key === 'verified') {
                    $val = (int)$val;
                } elseif ($key === 'photos' && is_array($val)) {
                    $val = json_encode($val);
                }
                $updateParams[] = $val;
            }
        }

        if (!empty($updateFields)) {
            $updateParams[] = $id;
            $sql = "UPDATE reviews SET " . implode(", ", $updateFields) . ", updated_at = NOW() WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($updateParams);
        }

        echo json_encode(['success' => true]);

    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        if ($id === '') {
            http_response_code(400);
            echo json_encode(['error' => 'id parameter is required']);
            exit;
        }

        $stmt = $pdo->prepare('DELETE FROM reviews WHERE id = ?');
        $stmt->execute([$id]);

        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
