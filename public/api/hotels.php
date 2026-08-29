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
function parseHotelRow($row) {
    if (!$row) return null;
    $jsonFields = ['photos', 'meal_plan_supported', 'gallery_urls', 'video_urls'];
    foreach ($jsonFields as $field) {
        if (isset($row[$field]) && is_string($row[$field])) {
            $decoded = json_decode($row[$field], true);
            $row[$field] = $decoded !== null ? $decoded : [];
        }
    }
    // Cast fields to match Supabase types
    if (isset($row['star_rating'])) $row['star_rating'] = (int)$row['star_rating'];
    if (isset($row['google_rating'])) $row['google_rating'] = (float)$row['google_rating'];
    if (isset($row['internal_rating'])) $row['internal_rating'] = (float)$row['internal_rating'];
    if (isset($row['active'])) $row['active'] = (bool)$row['active'];
    if (isset($row['active_status'])) $row['active_status'] = (bool)$row['active_status'];
    return $row;
}

try {
    if ($method === 'GET') {
        if (!empty($id)) {
            $stmt = $pdo->prepare("SELECT * FROM hotels WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo json_encode(parseHotelRow($row));
            } else {
                header('HTTP/1.1 404 Not Found');
                echo json_encode(['error' => 'Hotel not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM hotels ORDER BY hotel_name ASC");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $parsed = array_map('parseHotelRow', $rows);
            echo json_encode($parsed);
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $newId = $input['id'] ?? ('hotel-' . time() . '-' . rand(1000, 9999));
        
        $stmt = $pdo->prepare("INSERT INTO hotels (
          id, hotel_name, hotel_code, destination_group, city, state, country, star_rating, address,
          contact_number, email, photos, website, google_rating, internal_rating, supplier_name,
          active, country_id, state_id, city_id, category_id, contact_person, contact_email,
          check_in_time, check_out_time, meal_plan_supported, cancellation_policy, active_status,
          nearest_airport, nearest_railway, maps_location, gps_coordinates, child_policy,
          extra_bed_policy, logo_url, featured_image_url, gallery_urls, brochure_pdf_url, video_urls
        ) VALUES (
          :id, :hotel_name, :hotel_code, :destination_group, :city, :state, :country, :star_rating, :address,
          :contact_number, :email, :photos, :website, :google_rating, :internal_rating, :supplier_name,
          :active, :country_id, :state_id, :city_id, :category_id, :contact_person, :contact_email,
          :check_in_time, :check_out_time, :meal_plan_supported, :cancellation_policy, :active_status,
          :nearest_airport, :nearest_railway, :maps_location, :gps_coordinates, :child_policy,
          :extra_bed_policy, :logo_url, :featured_image_url, :gallery_urls, :brochure_pdf_url, :video_urls
        )");
        
        $stmt->execute([
            ':id' => $newId,
            ':hotel_name' => $input['hotel_name'] ?? '',
            ':hotel_code' => $input['hotel_code'] ?? '',
            ':destination_group' => $input['destination_group'] ?? '',
            ':city' => $input['city'] ?? '',
            ':state' => $input['state'] ?? '',
            ':country' => $input['country'] ?? '',
            ':star_rating' => $input['star_rating'] ?? 3,
            ':address' => $input['address'] ?? '',
            ':contact_number' => $input['contact_number'] ?? '',
            ':email' => $input['email'] ?? '',
            ':photos' => is_array($input['photos'] ?? null) ? json_encode($input['photos']) : ($input['photos'] ?? '[]'),
            ':website' => $input['website'] ?? '',
            ':google_rating' => $input['google_rating'] ?? 4.0,
            ':internal_rating' => $input['internal_rating'] ?? 4.0,
            ':supplier_name' => $input['supplier_name'] ?? '',
            ':active' => isset($input['active']) ? ($input['active'] ? 1 : 0) : 1,
            ':country_id' => $input['country_id'] ?? null,
            ':state_id' => $input['state_id'] ?? null,
            ':city_id' => $input['city_id'] ?? null,
            ':category_id' => $input['category_id'] ?? null,
            ':contact_person' => $input['contact_person'] ?? '',
            ':contact_email' => $input['contact_email'] ?? '',
            ':check_in_time' => $input['check_in_time'] ?? '12:00',
            ':check_out_time' => $input['check_out_time'] ?? '11:00',
            ':meal_plan_supported' => is_array($input['meal_plan_supported'] ?? null) ? json_encode($input['meal_plan_supported']) : ($input['meal_plan_supported'] ?? '[]'),
            ':cancellation_policy' => $input['cancellation_policy'] ?? '',
            ':active_status' => isset($input['active_status']) ? ($input['active_status'] ? 1 : 0) : 1,
            ':nearest_airport' => $input['nearest_airport'] ?? '',
            ':nearest_railway' => $input['nearest_railway'] ?? '',
            ':maps_location' => $input['maps_location'] ?? '',
            ':gps_coordinates' => $input['gps_coordinates'] ?? '',
            ':child_policy' => $input['child_policy'] ?? '',
            ':extra_bed_policy' => $input['extra_bed_policy'] ?? '',
            ':logo_url' => $input['logo_url'] ?? '',
            ':featured_image_url' => $input['featured_image_url'] ?? '',
            ':gallery_urls' => is_array($input['gallery_urls'] ?? null) ? json_encode($input['gallery_urls']) : ($input['gallery_urls'] ?? '[]'),
            ':brochure_pdf_url' => $input['brochure_pdf_url'] ?? '',
            ':video_urls' => is_array($input['video_urls'] ?? null) ? json_encode($input['video_urls']) : ($input['video_urls'] ?? '[]')
        ]);
        
        echo json_encode(['success' => true, 'id' => $newId]);
    } elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($id)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID parameter']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE hotels SET
          hotel_name = :hotel_name,
          hotel_code = :hotel_code,
          destination_group = :destination_group,
          city = :city,
          state = :state,
          country = :country,
          star_rating = :star_rating,
          address = :address,
          contact_number = :contact_number,
          email = :email,
          photos = :photos,
          website = :website,
          google_rating = :google_rating,
          internal_rating = :internal_rating,
          supplier_name = :supplier_name,
          active = :active,
          country_id = :country_id,
          state_id = :state_id,
          city_id = :city_id,
          category_id = :category_id,
          contact_person = :contact_person,
          contact_email = :contact_email,
          check_in_time = :check_in_time,
          check_out_time = :check_out_time,
          meal_plan_supported = :meal_plan_supported,
          cancellation_policy = :cancellation_policy,
          active_status = :active_status,
          nearest_airport = :nearest_airport,
          nearest_railway = :nearest_railway,
          maps_location = :maps_location,
          gps_coordinates = :gps_coordinates,
          child_policy = :child_policy,
          extra_bed_policy = :extra_bed_policy,
          logo_url = :logo_url,
          featured_image_url = :featured_image_url,
          gallery_urls = :gallery_urls,
          brochure_pdf_url = :brochure_pdf_url,
          video_urls = :video_urls
        WHERE id = :id");
        
        $stmt->execute([
            ':id' => $id,
            ':hotel_name' => $input['hotel_name'] ?? '',
            ':hotel_code' => $input['hotel_code'] ?? '',
            ':destination_group' => $input['destination_group'] ?? '',
            ':city' => $input['city'] ?? '',
            ':state' => $input['state'] ?? '',
            ':country' => $input['country'] ?? '',
            ':star_rating' => $input['star_rating'] ?? 3,
            ':address' => $input['address'] ?? '',
            ':contact_number' => $input['contact_number'] ?? '',
            ':email' => $input['email'] ?? '',
            ':photos' => is_array($input['photos'] ?? null) ? json_encode($input['photos']) : ($input['photos'] ?? '[]'),
            ':website' => $input['website'] ?? '',
            ':google_rating' => $input['google_rating'] ?? 4.0,
            ':internal_rating' => $input['internal_rating'] ?? 4.0,
            ':supplier_name' => $input['supplier_name'] ?? '',
            ':active' => isset($input['active']) ? ($input['active'] ? 1 : 0) : 1,
            ':country_id' => $input['country_id'] ?? null,
            ':state_id' => $input['state_id'] ?? null,
            ':city_id' => $input['city_id'] ?? null,
            ':category_id' => $input['category_id'] ?? null,
            ':contact_person' => $input['contact_person'] ?? '',
            ':contact_email' => $input['contact_email'] ?? '',
            ':check_in_time' => $input['check_in_time'] ?? '12:00',
            ':check_out_time' => $input['check_out_time'] ?? '11:00',
            ':meal_plan_supported' => is_array($input['meal_plan_supported'] ?? null) ? json_encode($input['meal_plan_supported']) : ($input['meal_plan_supported'] ?? '[]'),
            ':cancellation_policy' => $input['cancellation_policy'] ?? '',
            ':active_status' => isset($input['active_status']) ? ($input['active_status'] ? 1 : 0) : 1,
            ':nearest_airport' => $input['nearest_airport'] ?? '',
            ':nearest_railway' => $input['nearest_railway'] ?? '',
            ':maps_location' => $input['maps_location'] ?? '',
            ':gps_coordinates' => $input['gps_coordinates'] ?? '',
            ':child_policy' => $input['child_policy'] ?? '',
            ':extra_bed_policy' => $input['extra_bed_policy'] ?? '',
            ':logo_url' => $input['logo_url'] ?? '',
            ':featured_image_url' => $input['featured_image_url'] ?? '',
            ':gallery_urls' => is_array($input['gallery_urls'] ?? null) ? json_encode($input['gallery_urls']) : ($input['gallery_urls'] ?? '[]'),
            ':brochure_pdf_url' => $input['brochure_pdf_url'] ?? '',
            ':video_urls' => is_array($input['video_urls'] ?? null) ? json_encode($input['video_urls']) : ($input['video_urls'] ?? '[]')
        ]);
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE') {
        if (empty($id)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'Missing ID parameter']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM hotels WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => $e->getMessage()]);
}
?>
