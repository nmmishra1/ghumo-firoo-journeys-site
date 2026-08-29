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
$hotel_id = $_GET['hotel_id'] ?? '';

// Helper to cast fields
function parseHotelImageRow($row) {
    if (!$row) return null;
    if (isset($row['is_featured'])) $row['is_featured'] = (bool)$row['is_featured'];
    return $row;
}

try {
    if ($method === 'GET') {
        if (!empty($id)) {
            $stmt = $pdo->prepare("SELECT * FROM hotel_images WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo json_encode(parseHotelImageRow($row));
            } else {
                header('HTTP/1.1 404 Not Found');
                echo json_encode(['error' => 'Image not found']);
            }
        } elseif (!empty($hotel_id)) {
            $stmt = $pdo->prepare("SELECT * FROM hotel_images WHERE hotel_id = ? ORDER BY is_featured DESC, created_at ASC");
            $stmt->execute([$hotel_id]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $parsed = array_map('parseHotelImageRow', $rows);
            echo json_encode($parsed);
        } else {
            $stmt = $pdo->query("SELECT * FROM hotel_images ORDER BY created_at DESC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $parsed = array_map('parseHotelImageRow', $rows);
            echo json_encode($parsed);
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $newId = $input['id'] ?? ('img-' . time() . '-' . rand(1000, 9999));
        
        $stmt = $pdo->prepare("INSERT INTO hotel_images (
          id, hotel_id, image_url, is_featured
        ) VALUES (
          :id, :hotel_id, :image_url, :is_featured
        )");
        
        $stmt->execute([
            ':id' => $newId,
            ':hotel_id' => $input['hotel_id'] ?? '',
            ':image_url' => $input['image_url'] ?? '',
            ':is_featured' => isset($input['is_featured']) ? ($input['is_featured'] ? 1 : 0) : 0
        ]);
        
        echo json_encode(['success' => true, 'id' => $newId]);
    } elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($id)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID parameter']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE hotel_images SET
          hotel_id = :hotel_id,
          image_url = :image_url,
          is_featured = :is_featured
        WHERE id = :id");
        
        $stmt->execute([
            ':id' => $id,
            ':hotel_id' => $input['hotel_id'] ?? '',
            ':image_url' => $input['image_url'] ?? '',
            ':is_featured' => isset($input['is_featured']) ? ($input['is_featured'] ? 1 : 0) : 0
        ]);
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE') {
        if (empty($id)) {
            // Check if deleting by hotel_id
            $del_hotel_id = $_GET['hotel_id'] ?? '';
            if (!empty($del_hotel_id)) {
                $stmt = $pdo->prepare("DELETE FROM hotel_images WHERE hotel_id = ?");
                $stmt->execute([$del_hotel_id]);
                echo json_encode(['success' => true]);
                exit;
            }
            
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID or hotel_id parameter']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM hotel_images WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}
?>
