<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$supabase_url = getEnvVal('VITE_SUPABASE_URL', 'https://rfdumlnkmfuacsznogzz.supabase.co');
$supabase_key = getEnvVal('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZHVtbG5rbWZ1YWNzem5vZ3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzYxMDUsImV4cCI6MjA5NjM1MjEwNX0.5VtSJ46jEgI8tlqXMWOXz8jvc68C__Suo1WgGJw_KIM');

function fetchFromSupabase($table) {
    global $supabase_url, $supabase_key;
    $ch = curl_init("$supabase_url/rest/v1/$table?select=*");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $supabase_key,
        'Authorization: Bearer ' . $supabase_key,
        'Prefer: count=none'
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // Table already deleted from Supabase (migrated earlier) — return empty and skip
    if ($httpCode === 404 || $httpCode === 400) {
        $decoded = json_decode($response, true);
        $code = $decoded['code'] ?? '';
        // PGRST205 = table not in schema cache (already dropped)
        if ($code === 'PGRST205' || $code === '42P01' || $httpCode === 404) {
            return []; // Gracefully skip — data already lives in MySQL
        }
        throw new Exception("Failed to fetch $table from Supabase (HTTP $httpCode): $response");
    }

    if ($httpCode !== 200) {
        throw new Exception("Failed to fetch $table from Supabase (HTTP $httpCode): $response");
    }
    return json_decode($response, true);
}

try {
    $results = [];
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");

    // Drop legacy foreign keys and modify referencing column types to match VARCHAR(36)
    try {
        $pdo->exec("ALTER TABLE hotel_rates DROP FOREIGN KEY fk_hrate_hotel");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE activity_rates DROP FOREIGN KEY fk_arate_activity");
    } catch (Exception $e) {}

    $pdo->exec("ALTER TABLE hotel_rates MODIFY hotel_id VARCHAR(36)");
    $pdo->exec("ALTER TABLE activity_rates MODIFY activity_id VARCHAR(36)");

    // --- DROP ALL TABLES FIRST TO PREVENT CONSTRAINT ERRORS ---
    $pdo->exec("DROP TABLE IF EXISTS room_categories");
    $pdo->exec("DROP TABLE IF EXISTS cab_contract_rates");
    $pdo->exec("DROP TABLE IF EXISTS cab_contracts");
    $pdo->exec("DROP TABLE IF EXISTS cab_routes");
    $pdo->exec("DROP TABLE IF EXISTS cab_vehicles");
    $pdo->exec("DROP TABLE IF EXISTS cab_suppliers");
    $pdo->exec("DROP TABLE IF EXISTS hotel_suppliers");
    $pdo->exec("DROP TABLE IF EXISTS visas");
    $pdo->exec("DROP TABLE IF EXISTS sightseeings");
    $pdo->exec("DROP TABLE IF EXISTS destinations");
    $pdo->exec("DROP TABLE IF EXISTS hotel_images");
    $pdo->exec("DROP TABLE IF EXISTS activities");
    $pdo->exec("DROP TABLE IF EXISTS hotels");
    $pdo->exec("DROP TABLE IF EXISTS packages");

    // --- CREATE TABLES ---

    // 1. packages
    $pdo->exec("CREATE TABLE packages (
      id VARCHAR(36) PRIMARY KEY,
      name TEXT,
      price DECIMAL(10,2),
      slug VARCHAR(255) UNIQUE,
      duration VARCHAR(100),
      image TEXT,
      images TEXT,
      category TEXT,
      rating DECIMAL(3,2),
      reviews INT,
      destinations TEXT,
      highlights TEXT,
      inclusions TEXT,
      exclusions TEXT,
      itinerary LONGTEXT,
      map_locations LONGTEXT,
      flight_routes LONGTEXT,
      virtual_tour LONGTEXT,
      faqs LONGTEXT,
      seo_title TEXT,
      seo_description TEXT,
      seo_keywords TEXT,
      best_time VARCHAR(255),
      group_size VARCHAR(100),
      difficulty VARCHAR(100),
      quick_facts LONGTEXT,
      package_type VARCHAR(100),
      is_active TINYINT(1) DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['packages_table'] = 'Created';

    // 2. hotels
    $pdo->exec("CREATE TABLE hotels (
      id VARCHAR(36) PRIMARY KEY,
      hotel_name TEXT,
      hotel_code VARCHAR(100),
      destination_group VARCHAR(100),
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100),
      star_rating INT,
      address TEXT,
      contact_number VARCHAR(100),
      email VARCHAR(255),
      photos TEXT,
      website TEXT,
      google_rating DECIMAL(3,2),
      internal_rating DECIMAL(3,2),
      supplier_name VARCHAR(255),
      active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      country_id VARCHAR(36),
      state_id VARCHAR(36),
      city_id VARCHAR(36),
      category_id VARCHAR(36),
      contact_person VARCHAR(255),
      contact_email VARCHAR(255),
      check_in_time VARCHAR(50),
      check_out_time VARCHAR(50),
      meal_plan_supported TEXT,
      cancellation_policy TEXT,
      active_status TINYINT(1) DEFAULT 1,
      nearest_airport VARCHAR(255),
      nearest_railway VARCHAR(255),
      maps_location TEXT,
      gps_coordinates VARCHAR(100),
      child_policy TEXT,
      extra_bed_policy TEXT,
      logo_url TEXT,
      featured_image_url TEXT,
      gallery_urls TEXT,
      brochure_pdf_url TEXT,
      video_urls TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['hotels_table'] = 'Created';

    // 3. activities
    $pdo->exec("CREATE TABLE activities (
      id VARCHAR(36) PRIMARY KEY,
      activity_name TEXT,
      activity_code VARCHAR(100),
      country_id VARCHAR(36),
      state_id VARCHAR(36),
      destination VARCHAR(255),
      activity_category VARCHAR(100),
      duration VARCHAR(100),
      activity_type VARCHAR(100),
      supplier_name VARCHAR(255),
      supplier_cost DECIMAL(10,2),
      selling_cost DECIMAL(10,2),
      gst_included TINYINT(1) DEFAULT 0,
      gst_percentage DECIMAL(5,2),
      description TEXT,
      highlights TEXT,
      inclusions TEXT,
      exclusions TEXT,
      cancellation_policy TEXT,
      active_status TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      adult_cost DECIMAL(10,2),
      child_cost DECIMAL(10,2),
      image_url TEXT,
      sub_category VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['activities_table'] = 'Created';

    // 4. hotel_images
    $pdo->exec("CREATE TABLE hotel_images (
      id VARCHAR(36) PRIMARY KEY,
      hotel_id VARCHAR(36),
      image_url TEXT,
      is_featured TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['hotel_images_table'] = 'Created';

    // 5. destinations
    $pdo->exec("CREATE TABLE destinations (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255),
      sub_destinations TEXT,
      popular_activities TEXT,
      best_season VARCHAR(255),
      average_cost DECIMAL(10,2)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['destinations_table'] = 'Created';

    // 6. sightseeings
    $pdo->exec("CREATE TABLE sightseeings (
      id VARCHAR(36) PRIMARY KEY,
      sightseeing_name TEXT,
      sightseeing_code VARCHAR(100),
      destination VARCHAR(255),
      country_id VARCHAR(36),
      state_id VARCHAR(36),
      is_half_day TINYINT(1) DEFAULT 0,
      is_full_day TINYINT(1) DEFAULT 0,
      vehicle_required TINYINT(1) DEFAULT 0,
      duration VARCHAR(100),
      highlights TEXT,
      inclusions TEXT,
      exclusions TEXT,
      supplier_name VARCHAR(255),
      supplier_cost DECIMAL(10,2),
      selling_cost DECIMAL(10,2),
      gst_included TINYINT(1) DEFAULT 0,
      gst_percentage DECIMAL(5,2),
      active_status TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      category VARCHAR(100),
      adult_cost DECIMAL(10,2),
      child_cost DECIMAL(10,2),
      image_url TEXT,
      description TEXT,
      sub_category VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['sightseeings_table'] = 'Created';

    // 7. visas
    $pdo->exec("CREATE TABLE visas (
      id VARCHAR(36) PRIMARY KEY,
      visa_name TEXT,
      visa_code VARCHAR(100),
      country_id VARCHAR(36),
      visa_type VARCHAR(100),
      validity VARCHAR(100),
      processing_time VARCHAR(100),
      supplier_name VARCHAR(255),
      supplier_cost DECIMAL(10,2),
      selling_cost DECIMAL(10,2),
      gst_included TINYINT(1) DEFAULT 0,
      gst_percentage DECIMAL(5,2),
      required_documents TEXT,
      notes TEXT,
      active_status TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['visas_table'] = 'Created';

    // 8. hotel_suppliers
    $pdo->exec("CREATE TABLE hotel_suppliers (
      id VARCHAR(36) PRIMARY KEY,
      supplier_name TEXT,
      supplier_type VARCHAR(100),
      contact_person TEXT,
      email VARCHAR(255),
      mobile VARCHAR(50),
      payment_terms TEXT,
      active_status TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      commission_percentage DECIMAL(5,2)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['hotel_suppliers_table'] = 'Created';

    // 9. cab_suppliers
    $pdo->exec("CREATE TABLE cab_suppliers (
      id VARCHAR(36) PRIMARY KEY,
      supplier_name TEXT,
      supplier_code VARCHAR(100),
      contact_person TEXT,
      mobile VARCHAR(50),
      email VARCHAR(255),
      gst_number VARCHAR(100),
      pan_number VARCHAR(100),
      payment_terms TEXT,
      commission_percentage DECIMAL(5,2),
      valid_from DATE,
      valid_to DATE,
      active_status TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['cab_suppliers_table'] = 'Created';

    // 10. cab_vehicles
    $pdo->exec("CREATE TABLE cab_vehicles (
      id VARCHAR(36) PRIMARY KEY,
      vehicle_type TEXT,
      vehicle_category VARCHAR(100),
      capacity_adults INT,
      capacity_children INT,
      luggage_capacity VARCHAR(100),
      vehicle_images TEXT,
      availability_status VARCHAR(100),
      active_status TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['cab_vehicles_table'] = 'Created';

    // 11. cab_routes
    $pdo->exec("CREATE TABLE cab_routes (
      id VARCHAR(36) PRIMARY KEY,
      source TEXT,
      destination TEXT,
      state VARCHAR(100),
      country VARCHAR(100),
      route_type VARCHAR(100),
      distance_km DECIMAL(10,2),
      travel_time VARCHAR(100),
      maps_link TEXT,
      active_status TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['cab_routes_table'] = 'Created';

    // 12. cab_contracts
    $pdo->exec("CREATE TABLE cab_contracts (
      id VARCHAR(36) PRIMARY KEY,
      supplier_id VARCHAR(36),
      contract_name TEXT,
      valid_from DATE,
      valid_to DATE,
      active_status TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['cab_contracts_table'] = 'Created';

    // 13. cab_contract_rates
    $pdo->exec("CREATE TABLE cab_contract_rates (
      id VARCHAR(36) PRIMARY KEY,
      contract_id VARCHAR(36),
      vehicle_id VARCHAR(36),
      route_id VARCHAR(36),
      season VARCHAR(100),
      rate_model VARCHAR(100),
      base_km_included DECIMAL(10,2),
      rate_per_km DECIMAL(10,2),
      min_km_per_day DECIMAL(10,2),
      driver_allowance DECIMAL(10,2),
      night_charges DECIMAL(10,2),
      daily_rate DECIMAL(10,2),
      night_allowance DECIMAL(10,2),
      max_km_included DECIMAL(10,2),
      extra_km_charge DECIMAL(10,2),
      airport_name VARCHAR(255),
      hotel_area VARCHAR(255),
      transfer_cost DECIMAL(10,2),
      meet_greet_charges DECIMAL(10,2),
      waiting_charges DECIMAL(10,2),
      sightseeing_destination VARCHAR(255),
      hours_included DECIMAL(10,2),
      km_included DECIMAL(10,2),
      vehicle_cost DECIMAL(10,2),
      extra_hour_cost DECIMAL(10,2),
      extra_km_cost DECIMAL(10,2),
      toll_charges DECIMAL(10,2),
      parking_charges DECIMAL(10,2),
      state_tax DECIMAL(10,2),
      permit_charges DECIMAL(10,2),
      base_cost DECIMAL(10,2),
      gst_included TINYINT(1) DEFAULT 0,
      gst_percentage DECIMAL(5,2),
      gst_amount DECIMAL(10,2),
      supplier_cost DECIMAL(10,2),
      markup_percentage DECIMAL(5,2),
      markup_amount DECIMAL(10,2),
      selling_cost DECIMAL(10,2),
      profit_margin DECIMAL(10,2),
      is_tax_overridden TINYINT(1) DEFAULT 0,
      tax_override_reason TEXT,
      tax_audit_logs LONGTEXT,
      active_status TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['cab_contract_rates_table'] = 'Created';

    // 14. room_categories
    $pdo->exec("CREATE TABLE room_categories (
      id VARCHAR(36) PRIMARY KEY,
      hotel_id VARCHAR(36),
      room_category_name TEXT,
      room_size VARCHAR(100),
      max_adults INT,
      max_children INT,
      bed_type VARCHAR(100),
      room_description TEXT,
      active_status TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      room_images TEXT,
      facilities TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $results['room_categories_table'] = 'Created';


    // --- DATA POPULATION ---

    // 1. Populate packages
    $supabasePackages = fetchFromSupabase('packages');
    $pkgStmt = $pdo->prepare("INSERT INTO packages (
      id, name, price, slug, duration, image, images, category, rating, reviews,
      destinations, highlights, inclusions, exclusions, itinerary, map_locations,
      flight_routes, virtual_tour, faqs, seo_title, seo_description, seo_keywords,
      best_time, group_size, difficulty, quick_facts, package_type, is_active
    ) VALUES (
      :id, :name, :price, :slug, :duration, :image, :images, :category, :rating, :reviews,
      :destinations, :highlights, :inclusions, :exclusions, :itinerary, :map_locations,
      :flight_routes, :virtual_tour, :faqs, :seo_title, :seo_description, :seo_keywords,
      :best_time, :group_size, :difficulty, :quick_facts, :package_type, :is_active
    )");
    foreach ($supabasePackages as $pkg) {
        $pkgStmt->execute([
            ':id' => $pkg['id'],
            ':name' => $pkg['name'],
            ':price' => $pkg['price'],
            ':slug' => $pkg['slug'],
            ':duration' => $pkg['duration'],
            ':image' => $pkg['image'],
            ':images' => is_array($pkg['images'] ?? null) ? json_encode($pkg['images']) : ($pkg['images'] ?? '[]'),
            ':category' => is_array($pkg['category'] ?? null) ? json_encode($pkg['category']) : ($pkg['category'] ?? '[]'),
            ':rating' => $pkg['rating'],
            ':reviews' => $pkg['reviews'],
            ':destinations' => is_array($pkg['destinations'] ?? null) ? json_encode($pkg['destinations']) : ($pkg['destinations'] ?? '[]'),
            ':highlights' => is_array($pkg['highlights'] ?? null) ? json_encode($pkg['highlights']) : ($pkg['highlights'] ?? '[]'),
            ':inclusions' => is_array($pkg['inclusions'] ?? null) ? json_encode($pkg['inclusions']) : ($pkg['inclusions'] ?? '[]'),
            ':exclusions' => is_array($pkg['exclusions'] ?? null) ? json_encode($pkg['exclusions']) : ($pkg['exclusions'] ?? '[]'),
            ':itinerary' => is_array($pkg['itinerary'] ?? null) ? json_encode($pkg['itinerary']) : ($pkg['itinerary'] ?? '{}'),
            ':map_locations' => is_array($pkg['map_locations'] ?? null) ? json_encode($pkg['map_locations']) : ($pkg['map_locations'] ?? '[]'),
            ':flight_routes' => is_array($pkg['flight_routes'] ?? null) ? json_encode($pkg['flight_routes']) : ($pkg['flight_routes'] ?? '[]'),
            ':virtual_tour' => is_array($pkg['virtual_tour'] ?? null) ? json_encode($pkg['virtual_tour']) : ($pkg['virtual_tour'] ?? '{}'),
            ':faqs' => is_array($pkg['faqs'] ?? null) ? json_encode($pkg['faqs']) : ($pkg['faqs'] ?? '[]'),
            ':seo_title' => $pkg['seo_title'] ?? '',
            ':seo_description' => $pkg['seo_description'] ?? '',
            ':seo_keywords' => $pkg['seo_keywords'] ?? '',
            ':best_time' => $pkg['best_time'] ?? '',
            ':group_size' => $pkg['group_size'] ?? '',
            ':difficulty' => $pkg['difficulty'] ?? '',
            ':quick_facts' => is_array($pkg['quick_facts'] ?? null) ? json_encode($pkg['quick_facts']) : ($pkg['quick_facts'] ?? '{}'),
            ':package_type' => $pkg['package_type'] ?? '',
            ':is_active' => $pkg['is_active'] ? 1 : 0
        ]);
    }
    $results['packages_migrated'] = count($supabasePackages);

    // 2. Populate hotels
    $supabaseHotels = fetchFromSupabase('hotels');
    $hotelStmt = $pdo->prepare("INSERT INTO hotels (
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
    foreach ($supabaseHotels as $h) {
        $hotelStmt->execute([
            ':id' => $h['id'],
            ':hotel_name' => $h['hotel_name'],
            ':hotel_code' => $h['hotel_code'],
            ':destination_group' => $h['destination_group'],
            ':city' => $h['city'],
            ':state' => $h['state'],
            ':country' => $h['country'],
            ':star_rating' => $h['star_rating'],
            ':address' => $h['address'],
            ':contact_number' => $h['contact_number'],
            ':email' => $h['email'],
            ':photos' => is_array($h['photos'] ?? null) ? json_encode($h['photos']) : ($h['photos'] ?? '[]'),
            ':website' => $h['website'],
            ':google_rating' => $h['google_rating'],
            ':internal_rating' => $h['internal_rating'],
            ':supplier_name' => $h['supplier_name'],
            ':active' => $h['active'] ? 1 : 0,
            ':country_id' => $h['country_id'],
            ':state_id' => $h['state_id'],
            ':city_id' => $h['city_id'],
            ':category_id' => $h['category_id'],
            ':contact_person' => $h['contact_person'],
            ':contact_email' => $h['contact_email'],
            ':check_in_time' => $h['check_in_time'],
            ':check_out_time' => $h['check_out_time'],
            ':meal_plan_supported' => is_array($h['meal_plan_supported'] ?? null) ? json_encode($h['meal_plan_supported']) : ($h['meal_plan_supported'] ?? '[]'),
            ':cancellation_policy' => $h['cancellation_policy'],
            ':active_status' => $h['active_status'] ? 1 : 0,
            ':nearest_airport' => $h['nearest_airport'],
            ':nearest_railway' => $h['nearest_railway'],
            ':maps_location' => $h['maps_location'],
            ':gps_coordinates' => $h['gps_coordinates'],
            ':child_policy' => $h['child_policy'],
            ':extra_bed_policy' => $h['extra_bed_policy'],
            ':logo_url' => $h['logo_url'],
            ':featured_image_url' => $h['featured_image_url'],
            ':gallery_urls' => is_array($h['gallery_urls'] ?? null) ? json_encode($h['gallery_urls']) : ($h['gallery_urls'] ?? '[]'),
            ':brochure_pdf_url' => $h['brochure_pdf_url'],
            ':video_urls' => is_array($h['video_urls'] ?? null) ? json_encode($h['video_urls']) : ($h['video_urls'] ?? '[]')
        ]);
    }
    $results['hotels_migrated'] = count($supabaseHotels);

    // 3. Populate activities
    $supabaseActivities = fetchFromSupabase('activities');
    $actStmt = $pdo->prepare("INSERT INTO activities (
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
    foreach ($supabaseActivities as $act) {
        $actStmt->execute([
            ':id' => $act['id'],
            ':activity_name' => $act['activity_name'],
            ':activity_code' => $act['activity_code'],
            ':country_id' => $act['country_id'],
            ':state_id' => $act['state_id'],
            ':destination' => $act['destination'],
            ':activity_category' => $act['activity_category'],
            ':duration' => $act['duration'],
            ':activity_type' => $act['activity_type'],
            ':supplier_name' => $act['supplier_name'],
            ':supplier_cost' => $act['supplier_cost'],
            ':selling_cost' => $act['selling_cost'],
            ':gst_included' => $act['gst_included'] ? 1 : 0,
            ':gst_percentage' => $act['gst_percentage'],
            ':description' => $act['description'],
            ':highlights' => is_array($act['highlights'] ?? null) ? json_encode($act['highlights']) : ($act['highlights'] ?? '[]'),
            ':inclusions' => is_array($act['inclusions'] ?? null) ? json_encode($act['inclusions']) : ($act['inclusions'] ?? '[]'),
            ':exclusions' => is_array($act['exclusions'] ?? null) ? json_encode($act['exclusions']) : ($act['exclusions'] ?? '[]'),
            ':cancellation_policy' => $act['cancellation_policy'],
            ':active_status' => $act['active_status'] ? 1 : 0,
            ':adult_cost' => $act['adult_cost'],
            ':child_cost' => $act['child_cost'],
            ':image_url' => $act['image_url'],
            ':sub_category' => $act['sub_category']
        ]);
    }
    $results['activities_migrated'] = count($supabaseActivities);

    // 4. Populate hotel_images
    $supabaseImages = fetchFromSupabase('hotel_images');
    $imgStmt = $pdo->prepare("INSERT INTO hotel_images (id, hotel_id, image_url, is_featured) VALUES (:id, :hotel_id, :image_url, :is_featured)");
    foreach ($supabaseImages as $img) {
        $imgStmt->execute([
            ':id' => $img['id'],
            ':hotel_id' => $img['hotel_id'],
            ':image_url' => $img['image_url'],
            ':is_featured' => $img['is_featured'] ? 1 : 0
        ]);
    }
    $results['hotel_images_migrated'] = count($supabaseImages);

    // 5. Populate destinations
    $supabaseDestinations = fetchFromSupabase('destinations');
    $destStmt = $pdo->prepare("INSERT INTO destinations (id, name, sub_destinations, popular_activities, best_season, average_cost) VALUES (:id, :name, :sub_destinations, :popular_activities, :best_season, :average_cost)");
    foreach ($supabaseDestinations as $d) {
        $destStmt->execute([
            ':id' => $d['id'],
            ':name' => $d['name'],
            ':sub_destinations' => is_array($d['sub_destinations'] ?? null) ? json_encode($d['sub_destinations']) : ($d['sub_destinations'] ?? '[]'),
            ':popular_activities' => is_array($d['popular_activities'] ?? null) ? json_encode($d['popular_activities']) : ($d['popular_activities'] ?? '[]'),
            ':best_season' => $d['best_season'] ?? '',
            ':average_cost' => $d['average_cost'] ?? 0
        ]);
    }
    $results['destinations_migrated'] = count($supabaseDestinations);

    // 6. Populate sightseeings
    $supabaseSightseeings = fetchFromSupabase('sightseeings');
    $sightStmt = $pdo->prepare("INSERT INTO sightseeings (
      id, sightseeing_name, sightseeing_code, destination, country_id, state_id, is_half_day, is_full_day,
      vehicle_required, duration, highlights, inclusions, exclusions, supplier_name, supplier_cost,
      selling_cost, gst_included, gst_percentage, active_status, category, adult_cost, child_cost,
      image_url, description, sub_category
    ) VALUES (
      :id, :sightseeing_name, :sightseeing_code, :destination, :country_id, :state_id, :is_half_day, :is_full_day,
      :vehicle_required, :duration, :highlights, :inclusions, :exclusions, :supplier_name, :supplier_cost,
      :selling_cost, :gst_included, :gst_percentage, :active_status, :category, :adult_cost, :child_cost,
      :image_url, :description, :sub_category
    )");
    foreach ($supabaseSightseeings as $s) {
        $sightStmt->execute([
            ':id' => $s['id'],
            ':sightseeing_name' => $s['sightseeing_name'],
            ':sightseeing_code' => $s['sightseeing_code'],
            ':destination' => $s['destination'],
            ':country_id' => $s['country_id'],
            ':state_id' => $s['state_id'],
            ':is_half_day' => $s['is_half_day'] ? 1 : 0,
            ':is_full_day' => $s['is_full_day'] ? 1 : 0,
            ':vehicle_required' => $s['vehicle_required'] ? 1 : 0,
            ':duration' => $s['duration'] ?? '',
            ':highlights' => is_array($s['highlights'] ?? null) ? json_encode($s['highlights']) : ($s['highlights'] ?? '[]'),
            ':inclusions' => is_array($s['inclusions'] ?? null) ? json_encode($s['inclusions']) : ($s['inclusions'] ?? '[]'),
            ':exclusions' => is_array($s['exclusions'] ?? null) ? json_encode($s['exclusions']) : ($s['exclusions'] ?? '[]'),
            ':supplier_name' => $s['supplier_name'] ?? '',
            ':supplier_cost' => $s['supplier_cost'] ?? 0,
            ':selling_cost' => $s['selling_cost'] ?? 0,
            ':gst_included' => $s['gst_included'] ? 1 : 0,
            ':gst_percentage' => $s['gst_percentage'] ?? 0,
            ':active_status' => $s['active_status'] ? 1 : 0,
            ':category' => $s['category'] ?? '',
            ':adult_cost' => $s['adult_cost'] ?? 0,
            ':child_cost' => $s['child_cost'] ?? 0,
            ':image_url' => $s['image_url'] ?? '',
            ':description' => $s['description'] ?? '',
            ':sub_category' => $s['sub_category'] ?? ''
        ]);
    }
    $results['sightseeings_migrated'] = count($supabaseSightseeings);

    // 7. Populate visas
    $supabaseVisas = fetchFromSupabase('visas');
    $visaStmt = $pdo->prepare("INSERT INTO visas (
      id, visa_name, visa_code, country_id, visa_type, validity, processing_time, supplier_name,
      supplier_cost, selling_cost, gst_included, gst_percentage, required_documents, notes, active_status
    ) VALUES (
      :id, :visa_name, :visa_code, :country_id, :visa_type, :validity, :processing_time, :supplier_name,
      :supplier_cost, :selling_cost, :gst_included, :gst_percentage, :required_documents, :notes, :active_status
    )");
    foreach ($supabaseVisas as $v) {
        $visaStmt->execute([
            ':id' => $v['id'],
            ':visa_name' => $v['visa_name'],
            ':visa_code' => $v['visa_code'],
            ':country_id' => $v['country_id'],
            ':visa_type' => $v['visa_type'],
            ':validity' => $v['validity'],
            ':processing_time' => $v['processing_time'],
            ':supplier_name' => $v['supplier_name'],
            ':supplier_cost' => $v['supplier_cost'],
            ':selling_cost' => $v['selling_cost'],
            ':gst_included' => $v['gst_included'] ? 1 : 0,
            ':gst_percentage' => $v['gst_percentage'],
            ':required_documents' => is_array($v['required_documents'] ?? null) ? json_encode($v['required_documents']) : ($v['required_documents'] ?? '[]'),
            ':notes' => $v['notes'],
            ':active_status' => $v['active_status'] ? 1 : 0
        ]);
    }
    $results['visas_migrated'] = count($supabaseVisas);

    // 8. Populate hotel_suppliers
    $supabaseHotelSuppliers = fetchFromSupabase('hotel_suppliers');
    $hotelSupStmt = $pdo->prepare("INSERT INTO hotel_suppliers (
      id, supplier_name, supplier_type, contact_person, email, mobile, payment_terms, active_status, commission_percentage
    ) VALUES (
      :id, :supplier_name, :supplier_type, :contact_person, :email, :mobile, :payment_terms, :active_status, :commission_percentage
    )");
    foreach ($supabaseHotelSuppliers as $hs) {
        $hotelSupStmt->execute([
            ':id' => $hs['id'],
            ':supplier_name' => $hs['supplier_name'],
            ':supplier_type' => $hs['supplier_type'],
            ':contact_person' => $hs['contact_person'],
            ':email' => $hs['email'],
            ':mobile' => $hs['mobile'],
            ':payment_terms' => $hs['payment_terms'],
            ':active_status' => $hs['active_status'] ? 1 : 0,
            ':commission_percentage' => $hs['commission_percentage'] ?? 0
        ]);
    }
    $results['hotel_suppliers_migrated'] = count($supabaseHotelSuppliers);

    // 9. Populate cab_suppliers
    $supabaseCabSuppliers = fetchFromSupabase('cab_suppliers');
    $cabSupStmt = $pdo->prepare("INSERT INTO cab_suppliers (
      id, supplier_name, supplier_code, contact_person, mobile, email, gst_number, pan_number,
      payment_terms, commission_percentage, valid_from, valid_to, active_status
    ) VALUES (
      :id, :supplier_name, :supplier_code, :contact_person, :mobile, :email, :gst_number, :pan_number,
      :payment_terms, :commission_percentage, :valid_from, :valid_to, :active_status
    )");
    foreach ($supabaseCabSuppliers as $cs) {
        $cabSupStmt->execute([
            ':id' => $cs['id'],
            ':supplier_name' => $cs['supplier_name'],
            ':supplier_code' => $cs['supplier_code'],
            ':contact_person' => $cs['contact_person'],
            ':mobile' => $cs['mobile'],
            ':email' => $cs['email'],
            ':gst_number' => $cs['gst_number'],
            ':pan_number' => $cs['pan_number'],
            ':payment_terms' => $cs['payment_terms'],
            ':commission_percentage' => $cs['commission_percentage'] ?? 0,
            ':valid_from' => $cs['valid_from'] ?? null,
            ':valid_to' => $cs['valid_to'] ?? null,
            ':active_status' => $cs['active_status'] ? 1 : 0
        ]);
    }
    $results['cab_suppliers_migrated'] = count($supabaseCabSuppliers);

    // 10. Populate cab_vehicles
    $supabaseCabVehicles = fetchFromSupabase('cab_vehicles');
    $cabVehStmt = $pdo->prepare("INSERT INTO cab_vehicles (
      id, vehicle_type, vehicle_category, capacity_adults, capacity_children, luggage_capacity,
      vehicle_images, availability_status, active_status
    ) VALUES (
      :id, :vehicle_type, :vehicle_category, :capacity_adults, :capacity_children, :luggage_capacity,
      :vehicle_images, :availability_status, :active_status
    )");
    foreach ($supabaseCabVehicles as $cv) {
        $cabVehStmt->execute([
            ':id' => $cv['id'],
            ':vehicle_type' => $cv['vehicle_type'],
            ':vehicle_category' => $cv['vehicle_category'],
            ':capacity_adults' => $cv['capacity_adults'],
            ':capacity_children' => $cv['capacity_children'],
            ':luggage_capacity' => $cv['luggage_capacity'],
            ':vehicle_images' => is_array($cv['vehicle_images'] ?? null) ? json_encode($cv['vehicle_images']) : ($cv['vehicle_images'] ?? '[]'),
            ':availability_status' => $cv['availability_status'],
            ':active_status' => $cv['active_status'] ? 1 : 0
        ]);
    }
    $results['cab_vehicles_migrated'] = count($supabaseCabVehicles);

    // 11. Populate cab_routes
    $supabaseCabRoutes = fetchFromSupabase('cab_routes');
    $cabRtStmt = $pdo->prepare("INSERT INTO cab_routes (
      id, source, destination, state, country, route_type, distance_km, travel_time, maps_link, active_status
    ) VALUES (
      :id, :source, :destination, :state, :country, :route_type, :distance_km, :travel_time, :maps_link, :active_status
    )");
    foreach ($supabaseCabRoutes as $cr) {
        $cabRtStmt->execute([
            ':id' => $cr['id'],
            ':source' => $cr['source'],
            ':destination' => $cr['destination'],
            ':state' => $cr['state'],
            ':country' => $cr['country'],
            ':route_type' => $cr['route_type'],
            ':distance_km' => $cr['distance_km'],
            ':travel_time' => $cr['travel_time'],
            ':maps_link' => $cr['maps_link'],
            ':active_status' => $cr['active_status'] ? 1 : 0
        ]);
    }
    $results['cab_routes_migrated'] = count($supabaseCabRoutes);

    // 12. Populate cab_contracts
    $supabaseCabContracts = fetchFromSupabase('cab_contracts');
    $cabConStmt = $pdo->prepare("INSERT INTO cab_contracts (
      id, supplier_id, contract_name, valid_from, valid_to, active_status
    ) VALUES (
      :id, :supplier_id, :contract_name, :valid_from, :valid_to, :active_status
    )");
    foreach ($supabaseCabContracts as $cc) {
        $cabConStmt->execute([
            ':id' => $cc['id'],
            ':supplier_id' => $cc['supplier_id'],
            ':contract_name' => $cc['contract_name'],
            ':valid_from' => $cc['valid_from'] ?? null,
            ':valid_to' => $cc['valid_to'] ?? null,
            ':active_status' => $cc['active_status'] ? 1 : 0
        ]);
    }
    $results['cab_contracts_migrated'] = count($supabaseCabContracts);

    // 13. Populate cab_contract_rates
    $supabaseCabRates = fetchFromSupabase('cab_contract_rates');
    $cabRatesStmt = $pdo->prepare("INSERT INTO cab_contract_rates (
      id, contract_id, vehicle_id, route_id, season, rate_model, base_km_included, rate_per_km,
      min_km_per_day, driver_allowance, night_charges, daily_rate, night_allowance, max_km_included,
      extra_km_charge, airport_name, hotel_area, transfer_cost, meet_greet_charges, waiting_charges,
      sightseeing_destination, hours_included, km_included, vehicle_cost, extra_hour_cost,
      extra_km_cost, toll_charges, parking_charges, state_tax, permit_charges, base_cost,
      gst_included, gst_percentage, gst_amount, supplier_cost, markup_percentage, markup_amount,
      selling_cost, profit_margin, is_tax_overridden, tax_override_reason, tax_audit_logs, active_status
    ) VALUES (
      :id, :contract_id, :vehicle_id, :route_id, :season, :rate_model, :base_km_included, :rate_per_km,
      :min_km_per_day, :driver_allowance, :night_charges, :daily_rate, :night_allowance, :max_km_included,
      :extra_km_charge, :airport_name, :hotel_area, :transfer_cost, :meet_greet_charges, :waiting_charges,
      :sightseeing_destination, :hours_included, :km_included, :vehicle_cost, :extra_hour_cost,
      :extra_km_cost, :toll_charges, :parking_charges, :state_tax, :permit_charges, :base_cost,
      :gst_included, :gst_percentage, :gst_amount, :supplier_cost, :markup_percentage, :markup_amount,
      :selling_cost, :profit_margin, :is_tax_overridden, :tax_override_reason, :tax_audit_logs, :active_status
    )");
    foreach ($supabaseCabRates as $cr) {
        $cabRatesStmt->execute([
            ':id' => $cr['id'],
            ':contract_id' => $cr['contract_id'],
            ':vehicle_id' => $cr['vehicle_id'],
            ':route_id' => $cr['route_id'],
            ':season' => $cr['season'],
            ':rate_model' => $cr['rate_model'],
            ':base_km_included' => $cr['base_km_included'],
            ':rate_per_km' => $cr['rate_per_km'],
            ':min_km_per_day' => $cr['min_km_per_day'],
            ':driver_allowance' => $cr['driver_allowance'],
            ':night_charges' => $cr['night_charges'],
            ':daily_rate' => $cr['daily_rate'],
            ':night_allowance' => $cr['night_allowance'],
            ':max_km_included' => $cr['max_km_included'],
            ':extra_km_charge' => $cr['extra_km_charge'],
            ':airport_name' => $cr['airport_name'],
            ':hotel_area' => $cr['hotel_area'],
            ':transfer_cost' => $cr['transfer_cost'],
            ':meet_greet_charges' => $cr['meet_greet_charges'],
            ':waiting_charges' => $cr['waiting_charges'],
            ':sightseeing_destination' => $cr['sightseeing_destination'],
            ':hours_included' => $cr['hours_included'],
            ':km_included' => $cr['km_included'],
            ':vehicle_cost' => $cr['vehicle_cost'],
            ':extra_hour_cost' => $cr['extra_hour_cost'],
            ':extra_km_cost' => $cr['extra_km_cost'],
            ':toll_charges' => $cr['toll_charges'],
            ':parking_charges' => $cr['parking_charges'],
            ':state_tax' => $cr['state_tax'],
            ':permit_charges' => $cr['permit_charges'],
            ':base_cost' => $cr['base_cost'],
            ':gst_included' => $cr['gst_included'] ? 1 : 0,
            ':gst_percentage' => $cr['gst_percentage'],
            ':gst_amount' => $cr['gst_amount'],
            ':supplier_cost' => $cr['supplier_cost'],
            ':markup_percentage' => $cr['markup_percentage'],
            ':markup_amount' => $cr['markup_amount'],
            ':selling_cost' => $cr['selling_cost'],
            ':profit_margin' => $cr['profit_margin'],
            ':is_tax_overridden' => $cr['is_tax_overridden'] ? 1 : 0,
            ':tax_override_reason' => $cr['tax_override_reason'],
            ':tax_audit_logs' => is_array($cr['tax_audit_logs'] ?? null) ? json_encode($cr['tax_audit_logs']) : ($cr['tax_audit_logs'] ?? '[]'),
            ':active_status' => $cr['active_status'] ? 1 : 0
        ]);
    }
    $results['cab_contract_rates_migrated'] = count($supabaseCabRates);

    // 14. Populate room_categories
    $supabaseRoomCats = fetchFromSupabase('room_categories');
    $roomCatsStmt = $pdo->prepare("INSERT INTO room_categories (
      id, hotel_id, room_category_name, room_size, max_adults, max_children,
      bed_type, room_description, active_status, room_images, facilities
    ) VALUES (
      :id, :hotel_id, :room_category_name, :room_size, :max_adults, :max_children,
      :bed_type, :room_description, :active_status, :room_images, :facilities
    )");
    foreach ($supabaseRoomCats as $rc) {
        $roomCatsStmt->execute([
            ':id' => $rc['id'],
            ':hotel_id' => $rc['hotel_id'],
            ':room_category_name' => $rc['room_category_name'],
            ':room_size' => $rc['room_size'],
            ':max_adults' => $rc['max_adults'],
            ':max_children' => $rc['max_children'],
            ':bed_type' => $rc['bed_type'],
            ':room_description' => $rc['room_description'],
            ':active_status' => $rc['active_status'] ? 1 : 0,
            ':room_images' => is_array($rc['room_images'] ?? null) ? json_encode($rc['room_images']) : ($rc['room_images'] ?? '[]'),
            ':facilities' => is_array($rc['facilities'] ?? null) ? json_encode($rc['facilities']) : ($rc['facilities'] ?? '[]')
        ]);
    }
    $results['room_categories_migrated'] = count($supabaseRoomCats);

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    echo json_encode([
        'status' => 'success',
        'message' => 'All database tables created and data migrated to MySQL successfully!',
        'results' => $results
    ]);
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
