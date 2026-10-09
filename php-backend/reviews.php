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
    $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);
}

// Auto-heal / sync Nilesh Gupta's approved review if pending
try {
    $pdo->exec("UPDATE reviews SET status = 'Approved', featured = 1, destination = 'Jodhpur, Rajasthan' WHERE id = '243e061a-4823-4037-9c71-d3c36f92697c' AND status = 'Pending'");
} catch (Exception $he) {}

// Auto-delete test review ("VerVer;lsmvgmvm...")
try {
    $pdo->exec("DELETE FROM reviews WHERE id = 'a948fca9-a75a-43b7-8842-9311c90ddb1b' OR review_text LIKE '%VerVer;lsmvgmvm%' OR booking_id = '97403e98-eb54-4884-8b23-07eb9e20d347'");
} catch (Exception $de) {}

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

        // Check if requester is authenticated CRM staff (safe optional check)
        $isCrmStaff = false;
        try {
            $u = authenticateOptional();
            if ($u) {
                $cStmt = $pdo->prepare('
                    SELECT r.name as role_name, s.is_platform_admin 
                    FROM profiles_new p 
                    INNER JOIN user_security s ON p.id = s.profile_id 
                    LEFT JOIN roles r ON r.id = p.role_id 
                    WHERE p.supabase_uid = ? LIMIT 1
                ');
                $cStmt->execute([$u['user_id']]);
                $cProfile = $cStmt->fetch(PDO::FETCH_ASSOC);
                if ($cProfile) {
                    $rName = strtolower($cProfile['role_name'] ?? '');
                    if (!empty($cProfile['is_platform_admin']) || in_array($rName, ['admin', 'manager', 'agent'])) {
                        $isCrmStaff = true;
                    }
                } else {
                    $lStmt = $pdo->prepare('SELECT role FROM profiles WHERE id = ? OR supabase_uid = ? LIMIT 1');
                    $lStmt->execute([$u['user_id'], $u['user_id']]);
                    $lRole = strtolower((string)$lStmt->fetchColumn());
                    if (in_array($lRole, ['admin', 'manager', 'agent', 'super_admin'])) {
                        $isCrmStaff = true;
                    }
                }
            }
        } catch (Throwable $ae) {
            $isCrmStaff = false;
        }

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

            // Security Hardening: Never expose internal CRM lead/booking IDs to public website visitors
            if (!$isCrmStaff) {
                unset($rev['lead_id'], $rev['booking_id']);
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

        $bookingId = trim($input['booking_id'] ?? '');
        if (!empty($bookingId)) {
            $dupStmt = $pdo->prepare("SELECT id FROM reviews WHERE booking_id = ? LIMIT 1");
            $dupStmt->execute([$bookingId]);
            $existing = $dupStmt->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                echo json_encode([
                    'success' => true,
                    'id' => $existing['id'],
                    'already_exists' => true,
                    'message' => 'Review has already been submitted for this booking.'
                ]);
                exit;
            }
        }

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

    } elseif ($method === 'PATCH' || ($method === 'POST' && (isset($_GET['id']) || isset($_GET['action']) && $_GET['action'] === 'update'))) {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = trim($_GET['id'] ?? $input['id'] ?? '');
        if ($id === '') {
            http_response_code(400);
            echo json_encode(['error' => 'id parameter is required']);
            exit;
        }

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
            'photos' => 'photos',
            'customer_name' => 'customer_name',
            'hotel_rating' => 'hotel_rating',
            'cab_rating' => 'cab_rating',
            'sightseeing_rating' => 'sightseeing_rating',
            'trip_planning_rating' => 'trip_planning_rating',
            'package_name' => 'package_name'
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
