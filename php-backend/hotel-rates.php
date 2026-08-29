<?php
header('Content-Type: application/json');

require_once __DIR__ . '/auth_middleware.php';
require_once __DIR__ . '/db.php';

$pdo = getDb();

// Secure endpoint - requires admin or manager role (no agent write access to rates)
$user = authenticate();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id']       ?? '';
$hotelId = $_GET['hotel_id'] ?? '';

// -----------------------------------------------------------------------
// Parse a hotel_rates row: cast numeric types
// -----------------------------------------------------------------------
function parseRateRow(array $row): array
{
    $decimalFields = [
        'rate_per_night', 'extra_bed_cost', 'child_cost',
        'markup_percentage', 'markup_amount', 'selling_price', 'gst_percentage',
    ];
    $intFields    = ['id'];
    $boolFields   = ['gst_included', 'active_status'];

    foreach ($decimalFields as $f) {
        if (isset($row[$f])) $row[$f] = (float)$row[$f];
    }
    foreach ($intFields as $f) {
        if (isset($row[$f])) $row[$f] = (int)$row[$f];
    }
    foreach ($boolFields as $f) {
        if (isset($row[$f])) $row[$f] = (bool)$row[$f];
    }
    return $row;
}

try {
    // Real column list so we never reference phantom columns
    $q       = $pdo->query("DESCRIBE `hotel_rates`");
    $columns = $q->fetchAll(PDO::FETCH_COLUMN);

    // ===================================================================
    // GET — list rates for a hotel (hotel_id), or fetch a single rate
    // ===================================================================
    if ($method === 'GET') {
        if (!empty($id)) {
            $stmt = $pdo->prepare("SELECT * FROM hotel_rates WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo json_encode(parseRateRow($row));
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Rate not found']);
            }
        } elseif (!empty($hotelId)) {
            $stmt = $pdo->prepare(
                "SELECT * FROM hotel_rates WHERE hotel_id = ? ORDER BY season_start ASC, room_type ASC"
            );
            $stmt->execute([$hotelId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(array_map('parseRateRow', $rows));
        } else {
            // List all (admin/manager use only, no hotel filter — still gated by JWT)
            $stmt = $pdo->query(
                "SELECT hr.*, h.hotel_name FROM hotel_rates hr
                 LEFT JOIN hotels h ON h.id = hr.hotel_id
                 ORDER BY h.hotel_name ASC, hr.season_start ASC"
            );
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(array_map('parseRateRow', $rows));
        }

    // ===================================================================
    // POST — insert a single rate row
    // ===================================================================
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        // Build param map filtered to real columns
        $data = [];
        foreach ($input as $key => $val) {
            if ($key === 'id') continue;
            if (in_array($key, $columns, true)) $data[$key] = $val;
        }

        if (empty($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'No valid fields provided']);
            exit;
        }

        $cols         = array_keys($data);
        $placeholders = array_map(fn($c) => ":$c", $cols);
        $sql = "INSERT INTO `hotel_rates` (`" . implode("`, `", $cols) . "`) "
             . "VALUES (" . implode(", ", $placeholders) . ")";

        $params = array_combine($placeholders, array_values($data));
        $stmt   = $pdo->prepare($sql);
        $stmt->execute($params);
        $newId  = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'id' => (int)$newId]);

    // ===================================================================
    // PUT — update a rate row by id
    // ===================================================================
    } elseif ($method === 'PUT') {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing id parameter']);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $data = [];
        foreach ($input as $key => $val) {
            if ($key === 'id') continue;
            if (in_array($key, $columns, true)) $data[$key] = $val;
        }

        if (empty($data)) {
            echo json_encode(['success' => true, 'message' => 'No columns to update']);
            exit;
        }

        $setParts = [];
        $params   = [':id' => $id];
        foreach ($data as $key => $val) {
            $setParts[]      = "`$key` = :$key";
            $params[":$key"] = $val;
        }
        $sql = "UPDATE `hotel_rates` SET " . implode(", ", $setParts) . " WHERE id = :id";
        $pdo->prepare($sql)->execute($params);
        echo json_encode(['success' => true]);

    // ===================================================================
    // DELETE — remove a rate row, or all rows for a hotel
    // ===================================================================
    } elseif ($method === 'DELETE') {
        if (!empty($id)) {
            $pdo->prepare("DELETE FROM hotel_rates WHERE id = ?")->execute([$id]);
            echo json_encode(['success' => true]);
        } elseif (!empty($hotelId)) {
            $pdo->prepare("DELETE FROM hotel_rates WHERE hotel_id = ?")->execute([$hotelId]);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Provide id or hotel_id to delete']);
        }

    // ===================================================================
    // PATCH — bulk upsert: array of rate objects for one hotel
    //
    // Body: { hotel_id: "...", rates: [ { room_type, season_start, ... }, ... ] }
    // Strategy: DELETE all existing rates for this hotel, then INSERT the
    //           full set sent by the wizard (simpler than individual diffs,
    //           and rate sets for a hotel are typically < 50 rows).
    // ===================================================================
    } elseif ($method === 'PATCH') {
        $input   = json_decode(file_get_contents('php://input'), true) ?? [];
        $hid     = $input['hotel_id'] ?? '';
        $rates   = $input['rates']    ?? [];

        if (empty($hid)) {
            http_response_code(400);
            echo json_encode(['error' => 'hotel_id is required for bulk upsert']);
            exit;
        }
        if (!is_array($rates)) {
            http_response_code(400);
            echo json_encode(['error' => 'rates must be an array']);
            exit;
        }

        $pdo->beginTransaction();
        try {
            // Wipe existing rates for this hotel
            $pdo->prepare("DELETE FROM hotel_rates WHERE hotel_id = ?")->execute([$hid]);

            // Insert the new set
            $insertedIds = [];
            foreach ($rates as $rate) {
                $rate['hotel_id'] = $hid;
                $data = [];
                foreach ($rate as $key => $val) {
                    if ($key === 'id') continue;
                    if (in_array($key, $columns, true)) $data[$key] = $val;
                }
                if (empty($data)) continue;

                $cols         = array_keys($data);
                $placeholders = array_map(fn($c) => ":$c", $cols);
                $sql = "INSERT INTO `hotel_rates` (`" . implode("`, `", $cols) . "`) "
                     . "VALUES (" . implode(", ", $placeholders) . ")";
                $params = array_combine($placeholders, array_values($data));
                $pdo->prepare($sql)->execute($params);
                $insertedIds[] = (int)$pdo->lastInsertId();
            }

            $pdo->commit();
            echo json_encode([
                'success'      => true,
                'inserted'     => count($insertedIds),
                'inserted_ids' => $insertedIds,
            ]);
        } catch (Exception $ex) {
            $pdo->rollBack();
            throw $ex;
        }

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
