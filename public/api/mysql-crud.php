<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

$allowedTables = [
    'destinations',
    'sightseeings',
    'visas',
    'hotel_suppliers',
    'cab_suppliers',
    'cab_vehicles',
    'cab_routes',
    'cab_contracts',
    'cab_contract_rates',
    'room_categories',
    'payments',
    'documents'
];

$table = $_GET['table'] ?? '';
$id = $_GET['id'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if (!in_array($table, $allowedTables)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Invalid or missing table parameter']);
    exit;
}

// Map columns that require JSON decoding on read
$jsonColumnsMap = [
    'destinations' => ['sub_destinations', 'popular_activities'],
    'sightseeings' => ['highlights', 'inclusions', 'exclusions'],
    'visas' => ['required_documents'],
    'cab_vehicles' => ['vehicle_images'],
    'cab_contract_rates' => ['tax_audit_logs'],
    'room_categories' => ['room_images', 'facilities']
];

function parseRow($row, $table) {
    global $jsonColumnsMap;
    if (!$row) return null;
    
    // Parse JSON columns back to arrays
    if (isset($jsonColumnsMap[$table])) {
        foreach ($jsonColumnsMap[$table] as $field) {
            if (isset($row[$field]) && is_string($row[$field])) {
                $decoded = json_decode($row[$field], true);
                $row[$field] = $decoded !== null ? $decoded : [];
            }
        }
    }
    
    // Convert numeric and boolean strings to correct types for strict React components
    foreach ($row as $key => $val) {
        if ($val === null) continue;
        if (is_numeric($val) && strpos($val, '.') !== false) {
            $row[$key] = (float)$val;
        } elseif (is_numeric($val)) {
            // Check if it should be an integer or is a decimal with trailing zeros
            $row[$key] = (int)$val == $val ? (int)$val : (float)$val;
        }
        
        // Convert active/status flags to booleans
        if (in_array($key, ['active_status', 'active', 'gst_included', 'is_half_day', 'is_full_day', 'vehicle_required', 'is_tax_overridden'])) {
            $row[$key] = (bool)$val;
        }
    }
    return $row;
}

try {
    // Retrieve list of actual table columns to filter inserts/updates safely
    $q = $pdo->query("DESCRIBE `$table`");
    $columns = $q->fetchAll(PDO::FETCH_COLUMN);

    if ($method === 'GET') {
        if (!empty($id)) {
            $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo json_encode(parseRow($row, $table));
            } else {
                header('HTTP/1.1 404 Not Found');
                echo json_encode(['error' => 'Record not found']);
            }
        } else {
            // Dynamic query filtering matching provided URL parameters
            $whereClause = '';
            $params = [];
            $filterParts = [];
            foreach ($_GET as $key => $val) {
                if ($key !== 'table' && $key !== 'id' && in_array($key, $columns)) {
                    $filterParts[] = "`$key` = ?";
                    $params[] = $val;
                }
            }
            if (!empty($filterParts)) {
                $whereClause = "WHERE " . implode(" AND ", $filterParts);
            }

            // Dynamic sorting column based on table type
            $orderBy = 'id';
            $direction = 'ASC';
            if (in_array('name', $columns)) $orderBy = 'name';
            elseif (in_array('sightseeing_name', $columns)) $orderBy = 'sightseeing_name';
            elseif (in_array('visa_name', $columns)) $orderBy = 'visa_name';
            elseif (in_array('supplier_name', $columns)) $orderBy = 'supplier_name';
            elseif (in_array('vehicle_type', $columns)) $orderBy = 'vehicle_type';
            elseif (in_array('payment_date', $columns)) {
                $orderBy = 'payment_date';
                $direction = 'DESC';
            } elseif (in_array('uploaded_at', $columns)) {
                $orderBy = 'uploaded_at';
                $direction = 'DESC';
            }

            $sql = "SELECT * FROM `$table` $whereClause ORDER BY $orderBy $direction";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $parsed = array_map(function($r) use ($table) {
                return parseRow($r, $table);
            }, $rows);
            echo json_encode($parsed);
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $newId = $input['id'] ?? (substr($table, 0, 3) . '-' . time() . '-' . rand(1000, 9999));
        
        $data = [];
        foreach ($input as $key => $val) {
            if (in_array($key, $columns) && $key !== 'id') {
                $data[$key] = (is_array($val) || is_object($val)) ? json_encode($val) : $val;
            }
        }
        
        $cols = array_keys($data);
        $placeholders = array_map(function($c) { return ":$c"; }, $cols);
        
        $sql = "INSERT INTO `$table` (`id`, `" . implode("`, `", $cols) . "`) VALUES (:id, " . implode(", ", $placeholders) . ")";
        $stmt = $pdo->prepare($sql);
        
        $params = array_merge([':id' => $newId], array_combine($placeholders, array_values($data)));
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'id' => $newId]);
    } elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($id)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID parameter']);
            exit;
        }
        
        $data = [];
        foreach ($input as $key => $val) {
            if (in_array($key, $columns) && $key !== 'id') {
                $data[$key] = (is_array($val) || is_object($val)) ? json_encode($val) : $val;
            }
        }
        
        if (empty($data)) {
            echo json_encode(['success' => true, 'message' => 'No columns to update']);
            exit;
        }
        
        $setParts = [];
        $params = [':id' => $id];
        foreach ($data as $key => $val) {
            $setParts[] = "`$key` = :$key";
            $params[":$key"] = $val;
        }
        
        $sql = "UPDATE `$table` SET " . implode(", ", $setParts) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE') {
        // Support dynamic deletion by hotel_id or contract_id if passed as query parameter
        $hotel_id = $_GET['hotel_id'] ?? '';
        $contract_id = $_GET['contract_id'] ?? '';

        if (!empty($id)) {
            $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id = ?");
            $stmt->execute([$id]);
        } elseif (!empty($hotel_id) && in_array('hotel_id', $columns)) {
            $stmt = $pdo->prepare("DELETE FROM `$table` WHERE hotel_id = ?");
            $stmt->execute([$hotel_id]);
        } elseif (!empty($contract_id) && in_array('contract_id', $columns)) {
            $stmt = $pdo->prepare("DELETE FROM `$table` WHERE contract_id = ?");
            $stmt->execute([$contract_id]);
        } else {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing deletion identifier']);
            exit;
        }
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}
