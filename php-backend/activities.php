<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/auth_middleware.php';
require_once __DIR__ . '/db.php';

$pdo = getDb();

// Secure endpoint with Supabase ES256 JWT validation and approved CRM roles
$user = authenticate();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

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
    if (isset($row['city_id']) && $row['city_id'] !== null) $row['city_id'] = (int)$row['city_id'];
    return $row;
}

// city_id was added by migrations/20260814_add_city_id_to_activities_sightseeings.php.
// Guard every read/write against older databases that haven't run it yet, so this
// file keeps working (just without city linking) instead of hard-failing.
function activitiesHasCityId(PDO $pdo): bool {
    static $cached = null;
    if ($cached === null) {
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'activities' AND COLUMN_NAME = 'city_id'"
        );
        $stmt->execute();
        $cached = (int)$stmt->fetchColumn() > 0;
    }
    return $cached;
}

// Mirror changes to activity_rates table to support live package pricing calculation
function syncActivityRate($pdo, $activityId, $adultCost, $isActive) {
    $stmt = $pdo->prepare("SELECT id FROM activity_rates WHERE activity_id = ?");
    $stmt->execute([$activityId]);
    if ($row = $stmt->fetch()) {
        $up = $pdo->prepare("UPDATE activity_rates SET adult_rate = ?, is_active = ? WHERE id = ?");
        $up->execute([$adultCost, $isActive, $row['id']]);
    } else {
        $ins = $pdo->prepare("INSERT INTO activity_rates (activity_id, rate_type, adult_rate, is_active) VALUES (?, 'per_person', ?, ?)");
        $ins->execute([$activityId, $adultCost, $isActive]);
    }
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
            $cityIdFilter = $_GET['city_id'] ?? '';
            if (!empty($cityIdFilter) && activitiesHasCityId($pdo)) {
                $stmt = $pdo->prepare("SELECT * FROM activities WHERE city_id = ? ORDER BY activity_name ASC");
                $stmt->execute([(int)$cityIdFilter]);
            } else {
                $stmt = $pdo->query("SELECT * FROM activities ORDER BY activity_name ASC");
            }
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $parsed = array_map('parseActivityRow', $rows);
            echo json_encode($parsed);
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        // Check for duplicate activity name in the same destination
        $actName = trim($input['activity_name'] ?? '');
        $dest = trim($input['destination'] ?? '');
        if (!empty($actName)) {
            $dupSql = "SELECT id, activity_name FROM activities WHERE LOWER(TRIM(activity_name)) = LOWER(TRIM(:name))";
            $dupParams = [':name' => $actName];
            if (!empty($dest)) {
                $dupSql .= " AND LOWER(TRIM(destination)) = LOWER(TRIM(:dest))";
                $dupParams[':dest'] = $dest;
            }
            $dupStmt = $pdo->prepare($dupSql);
            $dupStmt->execute($dupParams);
            $dup = $dupStmt->fetch(PDO::FETCH_ASSOC);
            if ($dup) {
                header('HTTP/1.1 409 Conflict');
                echo json_encode([
                    'success' => false,
                    'error' => "Duplicate Activity: An activity named '{$dup['activity_name']}' already exists" . (!empty($dest) ? " in {$dest}." : ".") . " Duplicates cannot be saved.",
                    'duplicate' => true
                ]);
                exit;
            }
        }

        $newId = $input['id'] ?? ('act-' . time() . '-' . rand(1000, 9999));
        $hasCityId = activitiesHasCityId($pdo);

        $cols = "id, activity_name, activity_code, country_id, state_id, destination, activity_category,
          duration, activity_type, supplier_name, supplier_cost, selling_cost, gst_included,
          gst_percentage, description, highlights, inclusions, exclusions, cancellation_policy,
          active_status, adult_cost, child_cost, image_url, sub_category" . ($hasCityId ? ", city_id" : "");
        $vals = ":id, :activity_name, :activity_code, :country_id, :state_id, :destination, :activity_category,
          :duration, :activity_type, :supplier_name, :supplier_cost, :selling_cost, :gst_included,
          :gst_percentage, :description, :highlights, :inclusions, :exclusions, :cancellation_policy,
          :active_status, :adult_cost, :child_cost, :image_url, :sub_category" . ($hasCityId ? ", :city_id" : "");

        $stmt = $pdo->prepare("INSERT INTO activities ($cols) VALUES ($vals)");
        
        $isActive = isset($input['active_status']) ? ($input['active_status'] ? 1 : 0) : 1;
        $adultCost = $input['adult_cost'] ?? 0;
        
        $params = [
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
            ':active_status' => $isActive,
            ':adult_cost' => $adultCost,
            ':child_cost' => $input['child_cost'] ?? 0,
            ':image_url' => $input['image_url'] ?? '',
            ':sub_category' => $input['sub_category'] ?? ''
        ];
        if ($hasCityId) {
            $params[':city_id'] = isset($input['city_id']) && $input['city_id'] !== '' ? (int)$input['city_id'] : null;
        }
        $stmt->execute($params);
        
        // Sync to activity_rates table
        syncActivityRate($pdo, $newId, $adultCost, $isActive);
        
        echo json_encode(['success' => true, 'id' => $newId]);
    } elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($id)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID parameter']);
            exit;
        }
        
        // Check for duplicate activity name in the same destination (excluding current activity)
        $actName = trim($input['activity_name'] ?? '');
        $dest = trim($input['destination'] ?? '');
        if (!empty($actName)) {
            $dupSql = "SELECT id, activity_name FROM activities WHERE LOWER(TRIM(activity_name)) = LOWER(TRIM(:name)) AND id != :current_id";
            $dupParams = [':name' => $actName, ':current_id' => $id];
            if (!empty($dest)) {
                $dupSql .= " AND LOWER(TRIM(destination)) = LOWER(TRIM(:dest))";
                $dupParams[':dest'] = $dest;
            }
            $dupStmt = $pdo->prepare($dupSql);
            $dupStmt->execute($dupParams);
            $dup = $dupStmt->fetch(PDO::FETCH_ASSOC);
            if ($dup) {
                header('HTTP/1.1 409 Conflict');
                echo json_encode([
                    'success' => false,
                    'error' => "Duplicate Activity: Another activity named '{$dup['activity_name']}' already exists" . (!empty($dest) ? " in {$dest}." : "."),
                    'duplicate' => true
                ]);
                exit;
            }
        }
        
        $hasCityId = activitiesHasCityId($pdo);

        $adultCost = (float)($input['adult_cost'] ?? 0);
        $isActive = !empty($input['active_status']) ? 1 : 0;
        
        $setFields = [
            'activity_name = :activity_name',
            'activity_code = :activity_code',
            'country_id = :country_id',
            'state_id = :state_id',
            'destination = :destination',
            'activity_category = :activity_category',
            'duration = :duration',
            'activity_type = :activity_type',
            'supplier_name = :supplier_name',
            'supplier_cost = :supplier_cost',
            'selling_cost = :selling_cost',
            'gst_included = :gst_included',
            'gst_percentage = :gst_percentage',
            'description = :description',
            'highlights = :highlights',
            'inclusions = :inclusions',
            'exclusions = :exclusions',
            'cancellation_policy = :cancellation_policy',
            'active_status = :active_status',
            'adult_cost = :adult_cost',
            'child_cost = :child_cost',
            'image_url = :image_url',
            'sub_category = :sub_category',
            'updated_at = NOW()'
        ];
        
        if ($hasCityId) {
            $setFields[] = 'city_id = :city_id';
        }

        $sql = "UPDATE activities SET " . implode(', ', $setFields) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        
        $updateParams = [
            ':id' => $id,
            ':activity_name' => $input['activity_name'] ?? '',
            ':activity_code' => $input['activity_code'] ?? '',
            ':country_id' => $input['country_id'] ?? null,
            ':state_id' => $input['state_id'] ?? null,
            ':destination' => $input['destination'] ?? '',
            ':activity_category' => $input['activity_category'] ?? 'activity',
            ':duration' => $input['duration'] ?? '',
            ':activity_type' => $input['activity_type'] ?? '',
            ':supplier_name' => $input['supplier_name'] ?? '',
            ':supplier_cost' => (float)($input['supplier_cost'] ?? 0),
            ':selling_cost' => (float)($input['selling_cost'] ?? 0),
            ':gst_included' => !empty($input['gst_included']) ? 1 : 0,
            ':gst_percentage' => (float)($input['gst_percentage'] ?? 5),
            ':description' => $input['description'] ?? '',
            ':highlights' => is_array($input['highlights'] ?? null) ? json_encode($input['highlights']) : ($input['highlights'] ?? '[]'),
            ':inclusions' => is_array($input['inclusions'] ?? null) ? json_encode($input['inclusions']) : ($input['inclusions'] ?? '[]'),
            ':exclusions' => is_array($input['exclusions'] ?? null) ? json_encode($input['exclusions']) : ($input['exclusions'] ?? '[]'),
            ':cancellation_policy' => $input['cancellation_policy'] ?? '',
            ':active_status' => $isActive,
            ':adult_cost' => $adultCost,
            ':child_cost' => $input['child_cost'] ?? 0,
            ':image_url' => $input['image_url'] ?? '',
            ':sub_category' => $input['sub_category'] ?? ''
        ];
        if ($hasCityId) {
            $updateParams[':city_id'] = isset($input['city_id']) && $input['city_id'] !== '' ? (int)$input['city_id'] : null;
        }
        $stmt->execute($updateParams);
        
        // Sync to activity_rates table
        syncActivityRate($pdo, $id, $adultCost, $isActive);
        
        $actName = $input['activity_name'] ?? $id;
        $destName = $input['destination'] ?? $input['city'] ?? '';
        $locStr = !empty($destName) ? " in {$destName}" : '';
        echo json_encode([
            'success' => true,
            'updated' => true,
            'id' => $id,
            'message' => "Edit successful! Updated activity \"{$actName}\"{$locStr} (ID: {$id}) in database."
        ]);
    } elseif ($method === 'DELETE') {
        if (empty($id)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID parameter']);
            exit;
        }
        
        // Delete matching rates first
        $delRate = $pdo->prepare("DELETE FROM activity_rates WHERE activity_id = ?");
        $delRate->execute([$id]);
        
        $stmt = $pdo->prepare("DELETE FROM activities WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}
