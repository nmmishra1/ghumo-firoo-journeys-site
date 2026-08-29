<?php
require_once __DIR__ . '/../db.php';
$pdo = getDb();

echo "Starting package seeding...\n";

function genUuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%012x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0x4000, 0x4fff),
        mt_rand(0x8000, 0xbfff),
        mt_rand(0, 0xffffffffffff)
    );
}

function upsertPackage(PDO $pdo, $data) {
    $stmt = $pdo->prepare("SELECT id FROM packages WHERE slug = ?");
    $stmt->execute([$data['slug']]);
    $existing = $stmt->fetch();

    $packageId = $existing ? $existing['id'] : genUuid();

    if ($existing) {
        $up = $pdo->prepare("UPDATE packages SET
            name = ?, price = ?, duration = ?, image = ?, images = ?, category = ?,
            rating = ?, reviews = ?, destinations = ?, highlights = ?, inclusions = ?,
            exclusions = ?, itinerary = ?, map_locations = ?, flight_routes = ?,
            virtual_tour = ?, faqs = ?, seo_title = ?, seo_description = ?, seo_keywords = ?,
            best_time = ?, group_size = ?, difficulty = ?, quick_facts = ?, package_type = ?,
            is_active = ?, tagline = ?, hero_image = ?, is_featured = ?
            WHERE id = ?");
        $up->execute([
            $data['name'], floatval($data['price']), $data['duration'], $data['image'],
            json_encode($data['images'] ?? []), json_encode($data['category'] ?? []),
            floatval($data['rating'] ?? 5.0), intval($data['reviews'] ?? 0),
            json_encode($data['destinations'] ?? []), json_encode($data['highlights'] ?? []),
            json_encode($data['inclusions'] ?? []), json_encode($data['exclusions'] ?? []),
            json_encode($data['itinerary'] ?? []), json_encode($data['map_locations'] ?? []),
            json_encode($data['flight_routes'] ?? []), json_encode($data['virtual_tour'] ?? new stdClass()),
            json_encode($data['faqs'] ?? []), $data['seo_title'] ?? '', $data['seo_description'] ?? '', $data['seo_keywords'] ?? '',
            $data['best_time'] ?? '', $data['group_size'] ?? '', $data['difficulty'] ?? '',
            json_encode($data['quick_facts'] ?? new stdClass()), $data['package_type'] ?? 'domestic',
            1, $data['tagline'] ?? null, $data['hero_image'] ?? null, intval($data['is_featured'] ?? 0),
            $packageId
        ]);
    } else {
        $ins = $pdo->prepare("INSERT INTO packages (
            id, name, price, slug, duration, image, images, category, rating, reviews,
            destinations, highlights, inclusions, exclusions, itinerary, map_locations,
            flight_routes, virtual_tour, faqs, seo_title, seo_description, seo_keywords,
            best_time, group_size, difficulty, quick_facts, package_type, is_active,
            tagline, hero_image, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $ins->execute([
            $packageId, $data['name'], floatval($data['price']), $data['slug'], $data['duration'], $data['image'],
            json_encode($data['images'] ?? []), json_encode($data['category'] ?? []),
            floatval($data['rating'] ?? 5.0), intval($data['reviews'] ?? 0),
            json_encode($data['destinations'] ?? []), json_encode($data['highlights'] ?? []),
            json_encode($data['inclusions'] ?? []), json_encode($data['exclusions'] ?? []),
            json_encode($data['itinerary'] ?? []), json_encode($data['map_locations'] ?? []),
            json_encode($data['flight_routes'] ?? []), json_encode($data['virtual_tour'] ?? new stdClass()),
            json_encode($data['faqs'] ?? []), $data['seo_title'] ?? '', $data['seo_description'] ?? '', $data['seo_keywords'] ?? '',
            $data['best_time'] ?? '', $data['group_size'] ?? '', $data['difficulty'] ?? '',
            json_encode($data['quick_facts'] ?? new stdClass()), $data['package_type'] ?? 'domestic',
            1, $data['tagline'] ?? null, $data['hero_image'] ?? null, intval($data['is_featured'] ?? 0)
        ]);
    }

    return $packageId;
}

function upsertVariant(PDO $pdo, $packageId, $variantData) {
    $stmt = $pdo->prepare("SELECT id FROM package_variants WHERE package_id = ? AND variant_key = ?");
    $stmt->execute([$packageId, $variantData['variant_key']]);
    $existing = $stmt->fetch();

    $variantId = $existing ? $existing['id'] : null;

    if ($variantId) {
        $up = $pdo->prepare("UPDATE package_variants SET
            label = ?, nights = ?, days = ?, tag = ?, price_per_person = ?, hotel_category = ?,
            group_size = ?, pickup_from = ?, inclusions = ?, exclusions = ?, sort_order = ?, is_active = 1
            WHERE id = ?");
        $up->execute([
            $variantData['label'], intval($variantData['nights'] ?? 0), intval($variantData['days'] ?? 1),
            $variantData['tag'] ?? null, floatval($variantData['price_per_person'] ?? 0),
            $variantData['hotel_category'] ?? null, $variantData['group_size'] ?? null,
            $variantData['pickup_from'] ?? null, json_encode($variantData['inclusions'] ?? []),
            json_encode($variantData['exclusions'] ?? []), intval($variantData['sort_order'] ?? 0),
            $variantId
        ]);
    } else {
        $ins = $pdo->prepare("INSERT INTO package_variants (
            package_id, variant_key, label, nights, days, tag, price_per_person, hotel_category,
            group_size, pickup_from, inclusions, exclusions, sort_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
        $ins->execute([
            $packageId, $variantData['variant_key'], $variantData['label'],
            intval($variantData['nights'] ?? 0), intval($variantData['days'] ?? 1),
            $variantData['tag'] ?? null, floatval($variantData['price_per_person'] ?? 0),
            $variantData['hotel_category'] ?? null, $variantData['group_size'] ?? null,
            $variantData['pickup_from'] ?? null, json_encode($variantData['inclusions'] ?? []),
            json_encode($variantData['exclusions'] ?? []), intval($variantData['sort_order'] ?? 0)
        ]);
        $variantId = $pdo->lastInsertId();
    }

    // Itinerary days
    if (isset($variantData['itinerary'])) {
        $pdo->prepare("DELETE FROM variant_itinerary_days WHERE variant_id = ?")->execute([$variantId]);
        $insD = $pdo->prepare("INSERT INTO variant_itinerary_days (variant_id, day_number, timing, title, description, activities, meals, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($variantData['itinerary'] as $idx => $d) {
            $insD->execute([
                $variantId, intval($d['day_number'] ?? $d['day'] ?? ($idx+1)), $d['timing'] ?? null,
                $d['title'] ?? '', $d['description'] ?? null, json_encode($d['activities'] ?? []),
                $d['meals'] ?? null, intval($d['sort_order'] ?? $idx)
            ]);
        }
    }

    // Hotels
    if (isset($variantData['hotels'])) {
        $pdo->prepare("DELETE FROM variant_hotels WHERE variant_id = ?")->execute([$variantId]);
        $insH = $pdo->prepare("INSERT INTO variant_hotels (variant_id, hotel_name, location, stars, highlight, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($variantData['hotels'] as $idx => $h) {
            $insH->execute([
                $variantId, $h['hotel_name'] ?? $h['name'] ?? '', $h['location'] ?? null,
                intval($h['stars'] ?? 3), $h['highlight'] ?? null, intval($h['sort_order'] ?? $idx)
            ]);
        }
    }

    // Excursions
    if (isset($variantData['excursions'])) {
        $pdo->prepare("DELETE FROM variant_excursions WHERE variant_id = ?")->execute([$variantId]);
        $insE = $pdo->prepare("INSERT INTO variant_excursions (variant_id, excursion_name, description, duration, price, is_included, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach ($variantData['excursions'] as $idx => $e) {
            $insE->execute([
                $variantId, $e['excursion_name'] ?? $e['name'] ?? '', $e['description'] ?? null,
                $e['duration'] ?? null, $e['price'] ?? null, (isset($e['included']) && !$e['included'] ? 0 : 1),
                intval($e['sort_order'] ?? $idx)
            ]);
        }
    }

    // Price table
    if (isset($variantData['price_table'])) {
        $pdo->prepare("DELETE FROM variant_price_rows WHERE variant_id = ?")->execute([$variantId]);
        $insP = $pdo->prepare("INSERT INTO variant_price_rows (variant_id, room_type, price, sort_order) VALUES (?, ?, ?, ?)");
        foreach ($variantData['price_table'] as $idx => $pr) {
            $insP->execute([$variantId, $pr['room_type'] ?? $pr['roomType'] ?? '', $pr['price'] ?? '', intval($pr['sort_order'] ?? $idx)]);
        }
    }

    // Cancellation policy
    if (isset($variantData['cancellation_policy'])) {
        $pdo->prepare("DELETE FROM variant_cancellation WHERE variant_id = ?")->execute([$variantId]);
        $insC = $pdo->prepare("INSERT INTO variant_cancellation (variant_id, days_before, charge, sort_order) VALUES (?, ?, ?, ?)");
        foreach ($variantData['cancellation_policy'] as $idx => $c) {
            $insC->execute([$variantId, $c['days_before'] ?? $c['daysBefore'] ?? '', $c['charge'] ?? '', intval($c['sort_order'] ?? $idx)]);
        }
    }

    return $variantId;
}

// -----------------------------------------------------------------------------
// 1. RANN UTSAV
// -----------------------------------------------------------------------------
$rannId = upsertPackage($pdo, [
    'name' => 'Rann Utsav Kutch Package',
    'slug' => 'rann-utsav',
    'price' => 9999,
    'duration' => '3 to 5 Days',
    'image' => '/rann-utsav.jpg',
    'images' => ['/rann-utsav.jpg', '/Rann-Utsav-Gujarat.png', '/kutchsunriseimage.jpg'],
    'category' => ['Cultural', 'Festival', 'Desert'],
    'rating' => 4.9,
    'reviews' => 482,
    'destinations' => ['Dhordo Tent City', 'White Rann', 'Kala Dungar', 'Bhuj', 'Gandhi nu Gam'],
    'highlights' => ['Stay at Luxury Tent City Dhordo', 'Sunset at White Salt Desert', 'Folk Music & Cultural Performances', 'Kutchi Handicraft Village Shopping', 'Kala Dungar Panoramic View'],
    'inclusions' => ['AC Tent / Cottage Accommodation', 'All Meals (Breakfast, Lunch, High Tea, Dinner)', 'Bhuj to Dhordo AC Bus Transfers', 'Golf Cart transfers to White Desert', 'Cultural Show Tickets'],
    'exclusions' => ['Train / Airfare to Bhuj', 'Personal shopping expenses', 'Paramotoring & ATV rides', 'GST 5%'],
    'package_type' => 'domestic',
    'tagline' => 'Experience the magic of White Desert in full moon',
    'is_featured' => 1
]);

// Rann Utsav Variants (5 duration variants)
upsertVariant($pdo, $rannId, [
    'variant_key' => '1n2d',
    'label' => '1N/2D Express',
    'nights' => 1,
    'days' => 2,
    'tag' => 'Quick Getaway',
    'price_per_person' => 9999,
    'hotel_category' => 'Deluxe AC Tent',
    'group_size' => '2-50 People',
    'pickup_from' => 'Bhuj Railway Station / Airport',
    'inclusions' => ['1 Night Evoke Tent City stay', 'All meals included', 'Bhuj AC transfers', 'White Desert sunset access'],
    'exclusions' => ['Airfare/Train tickets', 'Personal expenses', 'Paramotoring'],
    'sort_order' => 1,
    'itinerary' => [
        ['day_number' => 1, 'title' => 'Arrival & Sunset at White Rann', 'description' => 'Pickup from Bhuj, transfer to Dhordo Tent City. Lunch, sunset at White Desert by golf cart.', 'activities' => ['Tent City Check-in', 'Golf Cart Ride to Salt Desert', 'Sunset View', 'Folk Dance Show'], 'meals' => 'Lunch + Dinner'],
        ['day_number' => 2, 'title' => 'Sunrise & Departure', 'description' => 'Morning sunrise view at Rann, breakfast, and drop at Bhuj.', 'activities' => ['Sunrise Walk', 'Breakfast', 'Return Transfer to Bhuj'], 'meals' => 'Breakfast']
    ]
]);

upsertVariant($pdo, $rannId, [
    'variant_key' => '2n3d',
    'label' => '2N/3D Classic',
    'nights' => 2,
    'days' => 3,
    'tag' => 'Most Popular',
    'price_per_person' => 14500,
    'hotel_category' => 'Premium AC Tent',
    'group_size' => '2-50 People',
    'pickup_from' => 'Bhuj Railway Station / Airport',
    'inclusions' => ['2 Nights Tent City Dhordo', 'Kala Dungar Excursion', 'Gandhi nu Gam Crafts Village', 'All Gourmet Buffet Meals', 'Bhuj Transfers'],
    'exclusions' => ['Airfare/Train tickets', 'ATV Rides', 'Shopping'],
    'sort_order' => 2,
    'itinerary' => [
        ['day_number' => 1, 'title' => 'Check-in & White Rann Sunset', 'description' => 'Arrival at Tent City, lunch, evening camel cart to White Rann.', 'activities' => ['Welcome Drink', 'Tent Check-in', 'White Desert Sunset', 'Cultural Program'], 'meals' => 'Lunch + Dinner'],
        ['day_number' => 2, 'title' => 'Kala Dungar & Craft Village', 'description' => 'Visit highest point in Kutch Kala Dungar and local handicraft artisan village.', 'activities' => ['Kala Dungar Viewpoint', 'Dattatreya Temple', 'Craft Village Shopping'], 'meals' => 'Breakfast + Lunch + Dinner'],
        ['day_number' => 3, 'title' => 'Bhuj Sightseeing & Departure', 'description' => 'Check-out, visit Aina Mahal & Prag Mahal in Bhuj before drop.', 'activities' => ['Check-out', 'Bhuj Palace Visit', 'Airport Drop'], 'meals' => 'Breakfast']
    ]
]);

upsertVariant($pdo, $rannId, [
    'variant_key' => '3n4d',
    'label' => '3N/4D Grand Heritage',
    'nights' => 3,
    'days' => 4,
    'tag' => 'Complete Experience',
    'price_per_person' => 22000,
    'hotel_category' => 'Rajwadi Suite AC',
    'group_size' => '2-30 People',
    'pickup_from' => 'Bhuj / Ahmedabad',
    'inclusions' => ['3 Nights Rajwadi Suite', 'Mandvi Beach Excursion', 'Vijay Vilas Palace', 'All Meals & VIP Golf Cart'],
    'exclusions' => ['Airfare', 'Personal expenses'],
    'sort_order' => 3
]);

// -----------------------------------------------------------------------------
// 2. KASHMIR PARADISE
// -----------------------------------------------------------------------------
$kashmirId = upsertPackage($pdo, [
    'name' => 'Kashmir Paradise Tour',
    'slug' => 'kashmir-paradise',
    'price' => 26500,
    'duration' => '5 Nights / 6 Days',
    'image' => 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80',
    'images' => [
        'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80',
        'https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80',
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80'
    ],
    'category' => ['Honeymoon', 'Mountain', 'Nature'],
    'rating' => 4.9,
    'reviews' => 320,
    'destinations' => ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg'],
    'highlights' => ['1 Night Houseboat Stay on Dal Lake', 'Shikara Ride at Sunset', 'Gulmarg Gondola Ride Phase 1', 'Betaab Valley & Lidder River Pahalgam'],
    'inclusions' => ['5 Nights Hotel & Houseboat Accommodation', 'Daily Breakfast & Dinner', 'Private Cab for all transfers', 'Shikara Ride on Dal Lake'],
    'exclusions' => ['Airfare', 'Gondola Phase 2 ticket', 'Pony rides', 'Personal expenses'],
    'package_type' => 'domestic',
    'tagline' => 'Heaven on Earth — Experience majestic valleys, lakes & pine forests',
    'is_featured' => 1
]);

// Kashmir Variants (Classic, Premium, Luxury)
upsertVariant($pdo, $kashmirId, [
    'variant_key' => 'classic',
    'label' => '5N/6D Classic',
    'nights' => 5,
    'days' => 6,
    'tag' => 'Best Value',
    'price_per_person' => 26500,
    'hotel_category' => '3 Star Comfort',
    'group_size' => '2-15 People',
    'pickup_from' => 'Srinagar Airport',
    'inclusions' => [
        '5 nights accommodation in 3-star hotels',
        '1 night houseboat on Dal Lake',
        'Daily breakfast and dinner',
        'Airport transfers',
        'Shikara ride on Dal Lake',
        'Gulmarg Gondola Phase 1',
        'Private cab sightseeing'
    ],
    'exclusions' => [
        'Airfare to/from Srinagar',
        'Gondola Phase 2 (₹900 extra)',
        'Personal expenses and tips'
    ],
    'sort_order' => 1,
    'itinerary' => [
        ['day_number' => 1, 'timing' => '02:00 PM', 'title' => 'Arrival Srinagar & Shikara Ride', 'description' => 'Pickup from Srinagar airport, check-in to houseboat, evening Shikara ride on Dal Lake.', 'activities' => ['Airport Transfer', 'Houseboat Check-in', '1.5 hr Shikara Ride', 'Welcome Tea'], 'meals' => 'Dinner'],
        ['day_number' => 2, 'timing' => '09:00 AM', 'title' => 'Srinagar to Gulmarg Day Trip', 'description' => 'Drive to Gulmarg meadow of flowers, Gondola ride to Kongdori Phase 1.', 'activities' => ['Gondola Cable Car Ride', 'Pine Forest Walk', 'Golf Course Visit'], 'meals' => 'Breakfast + Dinner'],
        ['day_number' => 3, 'timing' => '09:00 AM', 'title' => 'Srinagar Mughal Gardens', 'description' => 'Explore Shalimar Bagh, Nishat Bagh, Chashme Shahi and Pari Mahal.', 'activities' => ['Mughal Gardens Tour', 'Local Handicraft Market'], 'meals' => 'Breakfast + Dinner'],
        ['day_number' => 4, 'timing' => '09:00 AM', 'title' => 'Srinagar to Pahalgam Valley', 'description' => 'Drive through saffron fields of Pampore to Pahalgam valley of shepherds.', 'activities' => ['Saffron Fields Stop', 'Betaab Valley', 'Lidder River Walk'], 'meals' => 'Breakfast + Dinner'],
        ['day_number' => 5, 'timing' => '09:00 AM', 'title' => 'Aru Valley & Chandanwari', 'description' => 'Excursion to Aru valley and Chandanwari starting point of Amarnath Yatra.', 'activities' => ['Aru Valley Photography', 'Chandanwari Snow Point'], 'meals' => 'Breakfast + Dinner'],
        ['day_number' => 6, 'timing' => '11:00 AM', 'title' => 'Departure from Srinagar', 'description' => 'Breakfast and transfer to Srinagar airport for onward journey.', 'activities' => ['Airport Transfer'], 'meals' => 'Breakfast']
    ],
    'hotels' => [
        ['hotel_name' => 'Hotel Grand Umar', 'location' => 'Srinagar', 'stars' => 3, 'highlight' => 'Central location near Dal Lake'],
        ['hotel_name' => 'Hill View Houseboat', 'location' => 'Dal Lake', 'stars' => 3, 'highlight' => 'Traditional cedar wood houseboat'],
        ['hotel_name' => 'Pine Spring Hotel', 'location' => 'Pahalgam', 'stars' => 3, 'highlight' => 'Lidder River facing rooms']
    ],
    'excursions' => [
        ['excursion_name' => 'Dal Lake Shikara Ride', 'description' => 'Guided Shikara through floating gardens', 'duration' => '1.5 hrs', 'is_included' => 1],
        ['excursion_name' => 'Gulmarg Gondola Phase 1', 'description' => 'Cable car to Kongdori station', 'duration' => '2 hrs', 'is_included' => 1],
        ['excursion_name' => 'Gondola Phase 2', 'description' => 'Summit ride to Apharwat Peak 13,500ft', 'duration' => '2 hrs', 'price' => '₹900 extra', 'is_included' => 0]
    ],
    'price_table' => [
        ['room_type' => 'Standard Deluxe Double', 'price' => '₹26,500/person'],
        ['room_type' => 'Extra Bed / Child With Bed', 'price' => '₹18,500/person']
    ],
    'cancellation_policy' => [
        ['days_before' => 'More than 30 days', 'charge' => 'Free Cancellation'],
        ['days_before' => '15 to 30 days', 'charge' => '25% of total package cost'],
        ['days_before' => 'Less than 15 days', 'charge' => '100% Non-refundable']
    ]
]);

upsertVariant($pdo, $kashmirId, [
    'variant_key' => 'premium',
    'label' => '7N/8D Premium',
    'nights' => 7,
    'days' => 8,
    'tag' => 'Most Popular',
    'price_per_person' => 42500,
    'hotel_category' => '4 Star Luxury',
    'group_size' => '2-12 People',
    'pickup_from' => 'Srinagar Airport',
    'inclusions' => [
        '7 nights accommodation in 4-star hotels',
        '2 nights deluxe houseboat on Dal Lake',
        'Daily breakfast and dinner',
        'Private Shikara with flower decoration',
        'Gulmarg Gondola Phase 1 & 2 included',
        'Sonamarg day trip included'
    ],
    'exclusions' => ['Airfare', 'Personal tips'],
    'sort_order' => 2,
    'hotels' => [
        ['hotel_name' => 'Vivanta by Taj Dal View', 'location' => 'Srinagar', 'stars' => 4, 'highlight' => 'Panoramic Dal Lake views'],
        ['hotel_name' => 'Luxury Houseboat Gulshan', 'location' => 'Dal Lake', 'stars' => 4, 'highlight' => 'Butler service houseboat'],
        ['hotel_name' => 'Heevan Resort', 'location' => 'Pahalgam', 'stars' => 4, 'highlight' => 'Forest-facing superior rooms']
    ]
]);

// -----------------------------------------------------------------------------
// 3. CHAR DHAM YATRA
// -----------------------------------------------------------------------------
upsertPackage($pdo, [
    'name' => 'Char Dham Yatra Uttarakhand',
    'slug' => 'char-dham-yatra',
    'price' => 34500,
    'duration' => '9 Nights / 10 Days',
    'image' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80',
    'images' => ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80'],
    'category' => ['Pilgrimage', 'Spiritual', 'Himalayas'],
    'rating' => 4.8,
    'reviews' => 210,
    'destinations' => ['Haridwar', 'Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'],
    'highlights' => ['Kedarnath Temple Darshan', 'Badrinath Temple Aarti', 'Ganga Aarti at Haridwar', 'Yamunotri & Gangotri Holy Dips'],
    'inclusions' => ['Hotel Accommodation', 'Pure Vegetarian Meals', 'AC Vehicle Transfers', 'Yatra Registration Support'],
    'exclusions' => ['Helicopter tickets', 'Pony/Palki charges', 'Personal pooja fees'],
    'package_type' => 'domestic',
    'tagline' => 'Sacred spiritual pilgrimage through the Divine Himalayas',
    'is_featured' => 1
]);

// -----------------------------------------------------------------------------
// 4. SINGAPORE 5D/4N
// -----------------------------------------------------------------------------
upsertPackage($pdo, [
    'name' => 'Singapore Delights & Sentosa',
    'slug' => 'singapore-5d-4n',
    'price' => 58500,
    'duration' => '4 Nights / 5 Days',
    'image' => 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80',
    'images' => ['https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80'],
    'category' => ['International', 'City Break', 'Family'],
    'rating' => 4.9,
    'reviews' => 195,
    'destinations' => ['Singapore', 'Sentosa Island', 'Gardens by the Bay', 'Universal Studios'],
    'highlights' => ['Universal Studios One Day Pass', 'Gardens by the Bay Supertree Grove', 'Night Safari Experience', 'Cable Car Ride to Sentosa'],
    'inclusions' => ['4-Star Hotel Stay with Breakfast', 'Airport Transfers', 'Universal Studios Tickets', 'Singapore E-Visa Assistance'],
    'exclusions' => ['Airfare', 'Lunch & Dinner', 'Personal Expenses'],
    'package_type' => 'international',
    'tagline' => 'Explore the futuristic Lion City with family thrills',
    'is_featured' => 1
]);

// -----------------------------------------------------------------------------
// 5. REMAINING 12 PACKAGES (Basic package records)
// -----------------------------------------------------------------------------
$remainingPackages = [
    ['name' => 'Thailand Tropical Getaway', 'slug' => 'thailand-tropical', 'price' => 32000, 'duration' => '5N/6D', 'image' => 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80', 'type' => 'international'],
    ['name' => 'Bali Paradise Escape', 'slug' => 'bali-paradise', 'price' => 45000, 'duration' => '6N/7D', 'image' => 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80', 'type' => 'international'],
    ['name' => 'Dubai Luxury & Desert Safari', 'slug' => 'dubai-delights', 'price' => 48500, 'duration' => '4N/5D', 'image' => 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80', 'type' => 'international'],
    ['name' => 'Kerala Backwaters & Houseboat', 'slug' => 'kerala-backwaters', 'price' => 24000, 'duration' => '5N/6D', 'image' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80', 'type' => 'domestic'],
    ['name' => 'Leh Ladakh High Passes Adventure', 'slug' => 'leh-ladakh-tour', 'price' => 38000, 'duration' => '6N/7D', 'image' => 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80', 'type' => 'domestic'],
    ['name' => 'Rajasthan Royal Palaces', 'slug' => 'rajasthan-royal', 'price' => 29500, 'duration' => '6N/7D', 'image' => 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80', 'type' => 'domestic'],
    ['name' => 'Goa Beach Holiday', 'slug' => 'goa-beach-holiday', 'price' => 16500, 'duration' => '3N/4D', 'image' => 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80', 'type' => 'domestic'],
    ['name' => 'Himachal Hill Stations Tour', 'slug' => 'himachal-hill-stations', 'price' => 22500, 'duration' => '5N/6D', 'image' => 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80', 'type' => 'domestic'],
    ['name' => 'Japan Cherry Blossom Special', 'slug' => 'japan-cherry-blossom', 'price' => 145000, 'duration' => '7N/8D', 'image' => 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80', 'type' => 'international'],
    ['name' => 'Turkey Hot Air Balloon Adventure', 'slug' => 'turkey-adventure', 'price' => 89000, 'duration' => '6N/7D', 'image' => 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80', 'type' => 'international'],
    ['name' => 'Georgia Mountains & Wine Tour', 'slug' => 'georgia-adventure', 'price' => 62000, 'duration' => '5N/6D', 'image' => 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80', 'type' => 'international'],
    ['name' => 'Jaisalmer Desert Safari Special', 'slug' => 'jaisalmer-tour', 'price' => 18500, 'duration' => '2N/3D', 'image' => 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80', 'type' => 'domestic'],
    ['name' => 'Golden Triangle India Tour', 'slug' => 'golden-triangle', 'price' => 21000, 'duration' => '5N/6D', 'image' => 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80', 'type' => 'domestic'],
    ['name' => 'Mauritius Island Bliss', 'slug' => 'mauritius-bliss', 'price' => 78000, 'duration' => '6N/7D', 'image' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80', 'type' => 'international'],
    ['name' => 'Seychelles Tropical Paradise', 'slug' => 'seychelles-escape', 'price' => 95000, 'duration' => '5N/6D', 'image' => 'https://images.unsplash.com/photo-1589553460732-58ef7a71fbb5?q=80', 'type' => 'international']
];

foreach ($remainingPackages as $p) {
    upsertPackage($pdo, [
        'name' => $p['name'],
        'slug' => $p['slug'],
        'price' => $p['price'],
        'duration' => $p['duration'],
        'image' => $p['image'],
        'images' => [$p['image']],
        'category' => [$p['type'] === 'international' ? 'International' : 'Domestic'],
        'rating' => 4.8,
        'reviews' => rand(50, 300),
        'destinations' => [explode(' ', $p['name'])[0]],
        'highlights' => ['Sightseeing & City Tour', 'Comfortable Hotel Stay', 'Daily Breakfast'],
        'inclusions' => ['Accommodation', 'Transfers', 'Breakfast'],
        'exclusions' => ['Airfare', 'Personal expenses'],
        'package_type' => $p['type']
    ]);
}

echo "Package seeding completed successfully!\n";
