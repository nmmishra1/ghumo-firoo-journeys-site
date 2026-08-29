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

// Helper to decode JSON columns
function parseActivityRow($row) {
    if (!$row) return null;
    $jsonFields = ['highlights', 'inclusions', 'exclusions'];
    foreach ($jsonFields as $field) {
        if (isset($row[$field]) && is_string($row[$field])) {
            $decoded = json_decode($row[$field], true);
            $row[$field] = $decoded !== null ? $decoded : [];
        }
    }
    // Cast fields to match Supabase types
    if (isset($row['supplier_cost'])) $row['supplier_cost'] = (float)$row['supplier_cost'];
    if (isset($row['selling_cost'])) $row['selling_cost'] = (float)$row['selling_cost'];
    if (isset($row['gst_percentage'])) $row['gst_percentage'] = (float)$row['gst_percentage'];
    if (isset($row['adult_cost'])) $row['adult_cost'] = (float)$row['adult_cost'];
    if (isset($row['child_cost'])) $row['child_cost'] = (float)$row['child_cost'];
    if (isset($row['gst_included'])) $row['gst_included'] = (bool)$row['gst_included'];
    if (isset($row['active_status'])) $row['active_status'] = (bool)$row['active_status'];
    return $row;
}

try {
    if ($method === 'GET') {
        if (!empty($id)) {
            $stmt = $pdo->prepare("SELECT * FROM activities WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo json_encode(parseActivityRow($row));
            } else {
                header('HTTP/1.1 404 Not Found');
                echo json_encode(['error' => 'Activity not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM activities ORDER BY activity_name ASC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $parsed = array_map('parseActivityRow', $rows);
            echo json_encode($parsed);
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $newId = $input['id'] ?? ('act-' . time() . '-' . rand(1000, 9999));
        
        $stmt = $pdo->prepare("INSERT INTO activities (
          id, activity_name, activity_code, country_id, state_id, destination, activity_category,
          duration, activity_type, supplier_name, supplier_cost, selling_cost, gst_included,
          gst_percentage, description, highlights, inclusions, exclusions, cancellation_policy,
          active_status, adult_cost, child_cost, image_url, sub_category
        ) VALUES (
          :id, :activity_name, :activity_code, :country_id, :state_id, :destination, :activity_category,
          :duration, :activity_type, :supplier_name, :supplier_cost, :selling_cost, :gst_included,
          :gst_percentage, :description, :highlights, :inclusions, :exclusions, :cancellation_policy,
          :active_status, :adult_cost, :child_cost, :image_url, :sub_category
        )");
        
        $stmt->execute([
            ':id' => $newId,
            ':activity_name' => $input['activity_name'] ?? '',
            ':activity_code' => $input['activity_code'] ?? '',
            ':country_id' => $input['country_id'] ?? null,
            ':state_id' => $input['state_id'] ?? null,
            ':destination' => $input['destination'] ?? '',
            ':activity_category' => $input['activity_category'] ?? '',
            ':duration' => $input['duration'] ?? '',
            ':activity_type' => $input['activity_type'] ?? '',
            ':supplier_name' => $input['supplier_name'] ?? '',
            ':supplier_cost' => $input['supplier_cost'] ?? 0,
            ':selling_cost' => $input['selling_cost'] ?? 0,
            ':gst_included' => isset($input['gst_included']) ? ($input['gst_included'] ? 1 : 0) : 0,
            ':gst_percentage' => $input['gst_percentage'] ?? 0,
            ':description' => $input['description'] ?? '',
            ':highlights' => is_array($input['highlights'] ?? null) ? json_encode($input['highlights']) : ($input['highlights'] ?? '[]'),
            ':inclusions' => is_array($input['inclusions'] ?? null) ? json_encode($input['inclusions']) : ($input['inclusions'] ?? '[]'),
            ':exclusions' => is_array($input['exclusions'] ?? null) ? json_encode($input['exclusions']) : ($input['exclusions'] ?? '[]'),
            ':cancellation_policy' => $input['cancellation_policy'] ?? '',
            ':active_status' => isset($input['active_status']) ? ($input['active_status'] ? 1 : 0) : 1,
            ':adult_cost' => $input['adult_cost'] ?? 0,
            ':child_cost' => $input['child_cost'] ?? 0,
            ':image_url' => $input['image_url'] ?? '',
            ':sub_category' => $input['sub_category'] ?? ''
        ]);
        
        echo json_encode(['success' => true, 'id' => $newId]);
    } elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($id)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID parameter']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE activities SET
          activity_name = :activity_name,
          activity_code = :activity_code,
          country_id = :country_id,
          state_id = :state_id,
          destination = :destination,
          activity_category = :activity_category,
          duration = :duration,
          activity_type = :activity_type,
          supplier_name = :supplier_name,
          supplier_cost = :supplier_cost,
          selling_cost = :selling_cost,
          gst_included = :gst_included,
          gst_percentage = :gst_percentage,
          description = :description,
          highlights = :highlights,
          inclusions = :inclusions,
          exclusions = :exclusions,
          cancellation_policy = :cancellation_policy,
          active_status = :active_status,
          adult_cost = :adult_cost,
          child_cost = :child_cost,
          image_url = :image_url,
          sub_category = :sub_category
        WHERE id = :id");
        
        $stmt->execute([
            ':id' => $id,
            ':activity_name' => $input['activity_name'] ?? '',
            ':activity_code' => $input['activity_code'] ?? '',
            ':country_id' => $input['country_id'] ?? null,
            ':state_id' => $input['state_id'] ?? null,
            ':destination' => $input['destination'] ?? '',
            ':activity_category' => $input['activity_category'] ?? '',
            ':duration' => $input['duration'] ?? '',
            ':activity_type' => $input['activity_type'] ?? '',
            ':supplier_name' => $input['supplier_name'] ?? '',
            ':supplier_cost' => $input['supplier_cost'] ?? 0,
            ':selling_cost' => $input['selling_cost'] ?? 0,
            ':gst_included' => isset($input['gst_included']) ? ($input['gst_included'] ? 1 : 0) : 0,
            ':gst_percentage' => $input['gst_percentage'] ?? 0,
            ':description' => $input['description'] ?? '',
            ':highlights' => is_array($input['highlights'] ?? null) ? json_encode($input['highlights']) : ($input['highlights'] ?? '[]'),
            ':inclusions' => is_array($input['inclusions'] ?? null) ? json_encode($input['inclusions']) : ($input['inclusions'] ?? '[]'),
            ':exclusions' => is_array($input['exclusions'] ?? null) ? json_encode($input['exclusions']) : ($input['exclusions'] ?? '[]'),
            ':cancellation_policy' => $input['cancellation_policy'] ?? '',
            ':active_status' => isset($input['active_status']) ? ($input['active_status'] ? 1 : 0) : 1,
            ':adult_cost' => $input['adult_cost'] ?? 0,
            ':child_cost' => $input['child_cost'] ?? 0,
            ':image_url' => $input['image_url'] ?? '',
            ':sub_category' => $input['sub_category'] ?? ''
        ]);
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE') {
        if (empty($id)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID parameter']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM activities WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}
?>
