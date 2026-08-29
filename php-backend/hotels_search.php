<?php
// hotels_search.php — filtered hotel search by destination city/state, returns rates.
header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$dest = $_GET['destination'] ?? '';

try {
    $sql = "
        SELECT h.*, c.name as city_name, c.state,
          CONCAT('[', COALESCE(
            GROUP_CONCAT(
              JSON_OBJECT(
                'id', hr.id,
                'room_type', hr.room_type,
                'meal_plan', hr.meal_plan,
                'rate', hr.rate_per_night,
                'season_start', hr.season_start,
                'season_end', hr.season_end
              )
            ),
            ''
          ), ']') as rates_json
        FROM hotels h
        LEFT JOIN cities c ON c.id = h.city_id
        LEFT JOIN hotel_rates hr ON hr.hotel_id = h.id AND hr.is_active = 1
        WHERE h.active = 1
    ";

    $params = [];
    if (!empty($dest)) {
        $sql .= " AND (c.name LIKE ? OR c.state LIKE ? OR h.hotel_name LIKE ? OR h.city LIKE ? OR h.state LIKE ?)";
        $wildcard = "%$dest%";
        $params = [$wildcard, $wildcard, $wildcard, $wildcard, $wildcard];
    }

    $sql .= "
        GROUP BY h.id
        ORDER BY h.star_rating DESC, h.hotel_name ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $hotels = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode JSON rates and format
    foreach ($hotels as &$h) {
        $rates = [];
        if (!empty($h['rates_json'])) {
            $rates = json_decode($h['rates_json'], true);
            // Handle cases where group_concat/json_decode might parse as null or fail
            if (!is_array($rates)) {
                $rates = [];
            }
        }
        $h['rates'] = $rates;
        unset($h['rates_json']);
        
        // Expose fields for frontend compatibility
        $h['name'] = $h['hotel_name'];
        $h['star_category'] = $h['star_rating'];
        $h['active_status'] = (bool)($h['active_status'] ?? $h['active']);
    }

    echo json_encode(['success' => true, 'hotels' => $hotels]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to search hotels: ' . $e->getMessage()]);
}
