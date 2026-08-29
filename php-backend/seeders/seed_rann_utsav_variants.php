<?php
require_once __DIR__ . '/../db.php';
$pdo = getDb();

echo "=== STEP 1: Checking rann-utsav in packages table ===\n";

$stmt = $pdo->prepare("SELECT id, name FROM packages WHERE slug = 'rann-utsav'");
$stmt->execute();
$rannPkg = $stmt->fetch(PDO::FETCH_ASSOC);

$rannExisted = false;

if ($rannPkg) {
    $rannExisted = true;
    $rannId = $rannPkg['id'];
    echo "rann-utsav exists with ID: {$rannId}\n";
} else {
    echo "rann-utsav does NOT exist. Inserting new package entry...\n";
    $rannId = sprintf('%04x%04x-%04x-%04x-%04x-%012x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff), mt_rand(0x4000, 0x4fff),
        mt_rand(0x8000, 0xbfff), mt_rand(0, 0xffffffffffff)
    );
    $ins = $pdo->prepare("INSERT INTO packages (
        id, name, slug, price, duration, package_type, is_active, is_featured
    ) VALUES (
        ?, 'Rann Utsav', 'rann-utsav', 8999, 'Day Trip to 5 Nights', 'Domestic', 1, 1
    )");
    $ins->execute([$rannId]);
    echo "Inserted rann-utsav with ID: {$rannId}\n";
}

// -----------------------------------------------------------------------------
// SEED ALL 5 RANN UTSAV DURATION VARIANTS
// -----------------------------------------------------------------------------
$variantsData = [
    [
        'variant_key' => 'day-trip',
        'label' => 'Day Trip',
        'nights' => 0,
        'days' => 1,
        'tag' => 'Express Excursion',
        'price_per_person' => 2999,
        'hotel_category' => 'No Stay (Day Visit)',
        'group_size' => '1-50 People',
        'pickup_from' => 'Bhuj Railway Station / Airport',
        'inclusions' => [
            'Bhuj to Dhordo AC Bus Transfers',
            'Tent City Dhordo entry pass',
            'Buffet Lunch & High Tea at Tent City',
            'Golf Cart ride to White Rann for sunset',
            'Cultural Folk Show access'
        ],
        'exclusions' => [
            'Overnight accommodation',
            'Dinner',
            'Train/Airfare to Bhuj',
            'Paramotoring & ATV rides'
        ],
        'sort_order' => 1,
        'itinerary' => [
            ['day_number' => 1, 'timing' => '10:00 AM', 'title' => 'Bhuj Pickup & Tent City Arrival', 'description' => 'Pickup from Bhuj station/airport by AC transfer to Dhordo Tent City. Welcome & grand lunch buffet.', 'activities' => ['Bhuj Transfer', 'Tent City Welcome', 'Grand Buffet Lunch'], 'meals' => 'Lunch + High Tea']
        ],
        'hotels' => [],
        'excursions' => [
            ['excursion_name' => 'White Rann Sunset Visit', 'description' => 'Golf Cart transfer to salt desert for sunset', 'duration' => '2 hrs', 'is_included' => 1],
            ['excursion_name' => 'Folk Music Show', 'description' => 'Evening Kutchi folk dance performance', 'duration' => '1 hr', 'is_included' => 1]
        ],
        'price_table' => [
            ['room_type' => 'Day Pass per Adult', 'price' => '₹2,999/person'],
            ['room_type' => 'Day Pass per Child (5-12 yrs)', 'price' => '₹1,999/child']
        ],
        'cancellation_policy' => [
            ['days_before' => 'More than 7 days', 'charge' => 'Free Cancellation'],
            ['days_before' => 'Less than 7 days', 'charge' => '100% Non-refundable']
        ]
    ],
    [
        'variant_key' => '1n2d',
        'label' => '1N/2D',
        'nights' => 1,
        'days' => 2,
        'tag' => 'Quick Getaway',
        'price_per_person' => 8300,
        'hotel_category' => 'Deluxe AC Swiss Cottage',
        'group_size' => '2-50 People',
        'pickup_from' => 'Bhuj Railway Station / Airport',
        'inclusions' => [
            '1 Night accommodation in Evoke Tent City Dhordo',
            'All buffet meals (Lunch, High Tea, Dinner, Breakfast)',
            'AC bus transfers from Bhuj to Dhordo and back',
            'Golf Cart transfers to White Rann for sunset',
            'Cultural show tickets'
        ],
        'exclusions' => [
            'Airfare / Train tickets',
            'Personal shopping & tips',
            'Adventure activities'
        ],
        'sort_order' => 2,
        'itinerary' => [
            ['day_number' => 1, 'timing' => '12:30 PM', 'title' => 'Check-in & White Rann Sunset', 'description' => 'Arrival at Tent City, check-in to Deluxe AC Tent. Lunch, evening golf cart ride to White Rann for sunset view.', 'activities' => ['Tent City Check-in', 'Golf Cart Ride to Salt Desert', 'Sunset View', 'Folk Dance Show'], 'meals' => 'Lunch + High Tea + Dinner'],
            ['day_number' => 2, 'timing' => '06:00 AM', 'title' => 'Sunrise & Return Transfer', 'description' => 'Early morning sunrise walk at White Desert. Breakfast and AC bus transfer back to Bhuj.', 'activities' => ['Sunrise Walk', 'Breakfast', 'Return Transfer to Bhuj'], 'meals' => 'Breakfast']
        ],
        'hotels' => [
            ['hotel_name' => 'Evoke Tent City Dhordo', 'location' => 'Dhordo, Kutch', 'stars' => 4, 'highlight' => 'Luxury AC Tents & Swiss Cottages with attached bath']
        ],
        'excursions' => [
            ['excursion_name' => 'White Rann Sunset Visit', 'description' => 'Golf Cart transfer to salt desert for sunset', 'duration' => '2 hrs', 'is_included' => 1],
            ['excursion_name' => 'Cultural Folk Dance Show', 'description' => 'Kutchi musical evening & folk performance', 'duration' => '1.5 hrs', 'is_included' => 1]
        ],
        'price_table' => [
            ['room_type' => 'Non-AC Swiss Cottage', 'price' => '₹6,300/person'],
            ['room_type' => 'Deluxe AC Swiss Cottage', 'price' => '₹8,300/person'],
            ['room_type' => 'Premium AC Tent', 'price' => '₹9,300/person'],
            ['room_type' => 'Super Premium AC Tent', 'price' => '₹10,300/person'],
            ['room_type' => 'Rajwadi Suite (2 Pax)', 'price' => '₹35,000/suite'],
            ['room_type' => 'Darbari Suite (4 Pax)', 'price' => '₹70,000/suite']
        ],
        'cancellation_policy' => [
            ['days_before' => 'More than 30 days', 'charge' => '90% Refund'],
            ['days_before' => '15 to 30 days', 'charge' => '60% Refund'],
            ['days_before' => 'Less than 15 days', 'charge' => 'No Refund (0%)']
        ]
    ],
    [
        'variant_key' => '2n3d',
        'label' => '2N/3D',
        'nights' => 2,
        'days' => 3,
        'tag' => 'Most Popular',
        'price_per_person' => 16600,
        'hotel_category' => 'Deluxe AC Swiss Cottage',
        'group_size' => '2-50 People',
        'pickup_from' => 'Bhuj Railway Station / Airport',
        'inclusions' => [
            '2 Nights stay in Evoke Tent City Dhordo',
            'All Gourmet Buffet Meals (2 Breakfast, 2 Lunch, 2 High Tea, 2 Dinner)',
            'Kala Dungar & Gandhi nu Gam Crafts Village Excursion',
            'Bhuj AC Bus Transfers',
            'Access to Club House & Recreation Center'
        ],
        'exclusions' => [
            'Train or Airfare to Bhuj',
            'ATV rides & Paramotoring'
        ],
        'sort_order' => 3,
        'itinerary' => [
            ['day_number' => 1, 'timing' => '12:30 PM', 'title' => 'Check-in & White Rann Sunset', 'description' => 'Arrival at Tent City, lunch, evening camel cart to White Rann for sunset.', 'activities' => ['Welcome Drink', 'Tent Check-in', 'White Desert Sunset', 'Cultural Program'], 'meals' => 'Lunch + High Tea + Dinner'],
            ['day_number' => 2, 'timing' => '09:00 AM', 'title' => 'Kala Dungar & Craft Village Excursion', 'description' => 'Visit highest point in Kutch Kala Dungar and local handicraft artisan village Gandhi nu Gam.', 'activities' => ['Kala Dungar Viewpoint', 'Dattatreya Temple', 'Craft Village Shopping'], 'meals' => 'Breakfast + Lunch + Dinner'],
            ['day_number' => 3, 'timing' => '09:30 AM', 'title' => 'Bhuj Sightseeing & Departure', 'description' => 'Check-out, visit Smritivan Earthquake Museum in Bhuj before drop at airport/station.', 'activities' => ['Check-out', 'Smritivan Museum Visit', 'Airport Drop'], 'meals' => 'Breakfast']
        ],
        'hotels' => [
            ['hotel_name' => 'Evoke Tent City Dhordo', 'location' => 'Dhordo, Kutch', 'stars' => 4, 'highlight' => 'Luxury Tents & Cottages with living area & amenities']
        ],
        'excursions' => [
            ['excursion_name' => 'Kala Dungar Excursion', 'description' => 'Highest point of Kutch scenic tour', 'duration' => '4 hrs', 'is_included' => 1],
            ['excursion_name' => 'Smritivan Earthquake Museum', 'description' => 'Memorial museum tour in Bhuj', 'duration' => '2 hrs', 'is_included' => 1]
        ],
        'price_table' => [
            ['room_type' => 'Non-AC Swiss Cottage', 'price' => '₹12,600/person'],
            ['room_type' => 'Deluxe AC Swiss Cottage', 'price' => '₹16,600/person'],
            ['room_type' => 'Premium AC Tent', 'price' => '₹18,600/person'],
            ['room_type' => 'Super Premium AC Tent', 'price' => '₹20,600/person'],
            ['room_type' => 'Rajwadi Suite (2 Pax)', 'price' => '₹70,000/suite'],
            ['room_type' => 'Darbari Suite (4 Pax)', 'price' => '₹1,40,000/suite']
        ],
        'cancellation_policy' => [
            ['days_before' => 'More than 30 days', 'charge' => '90% Refund'],
            ['days_before' => '15 to 30 days', 'charge' => '60% Refund'],
            ['days_before' => 'Less than 15 days', 'charge' => 'No Refund (0%)']
        ]
    ],
    [
        'variant_key' => '3n4d',
        'label' => '3N/4D',
        'nights' => 3,
        'days' => 4,
        'tag' => 'Grand Heritage',
        'price_per_person' => 24900,
        'hotel_category' => 'Deluxe AC Swiss Cottage',
        'group_size' => '2-30 People',
        'pickup_from' => 'Bhuj Railway Station / Airport',
        'inclusions' => [
            '3 Nights stay in Evoke Tent City Dhordo',
            'Mandvi Beach & Vijay Vilas Palace Excursion',
            'All Gourmet Meals & High Tea',
            'VIP Golf Cart Transfers',
            'Special Kutchi Thali Dinner'
        ],
        'exclusions' => [
            'Train or Airfare',
            'Personal expenses'
        ],
        'sort_order' => 4,
        'itinerary' => [
            ['day_number' => 1, 'timing' => '12:30 PM', 'title' => 'Check-in & White Rann Sunset', 'description' => 'Arrival, VIP Check-in to Evoke Tent City. Evening sunset at White Desert.', 'activities' => ['VIP Check-in', 'Golf Cart Sunset Trip'], 'meals' => 'Lunch + High Tea + Dinner'],
            ['day_number' => 2, 'timing' => '09:00 AM', 'title' => 'Kala Dungar & Handicraft Village', 'description' => 'Visit Kala Dungar mountain and Gandhi Nu Gaam village famous for Rogan Art.', 'activities' => ['Kala Dungar Tour', 'Rogan Art Demonstration'], 'meals' => 'Breakfast + Lunch + Dinner'],
            ['day_number' => 3, 'timing' => '08:30 AM', 'title' => 'Mandvi Beach & Vijay Vilas Palace', 'description' => 'Full day excursion to Mandvi beach, royal Vijay Vilas Palace and Shyamji Krishna Varma Memorial.', 'activities' => ['Vijay Vilas Palace', 'Mandvi Beach Sunset'], 'meals' => 'Breakfast + Packed Lunch + Dinner'],
            ['day_number' => 4, 'timing' => '10:00 AM', 'title' => 'Bhuj Heritage Tour & Departure', 'description' => 'Check-out, visit Smritivan Earthquake Memorial in Bhuj before drop.', 'activities' => ['Smritivan Memorial', 'Airport Drop'], 'meals' => 'Breakfast']
        ],
        'hotels' => [
            ['hotel_name' => 'Evoke Tent City Dhordo', 'location' => 'Dhordo, Kutch', 'stars' => 5, 'highlight' => 'Royal Tents & Suites with private porch & VIP lounge']
        ],
        'excursions' => [
            ['excursion_name' => 'Mandvi Beach Excursion', 'description' => 'Vijay Vilas Palace & Private Beach Tour', 'duration' => 'full_day', 'is_included' => 1],
            ['excursion_name' => 'Kala Dungar & Gandhi Nu Gaam', 'description' => 'Black Hill & Artisan Village Tour', 'duration' => '4 hrs', 'is_included' => 1]
        ],
        'price_table' => [
            ['room_type' => 'Non-AC Swiss Cottage', 'price' => '₹18,900/person'],
            ['room_type' => 'Deluxe AC Swiss Cottage', 'price' => '₹24,900/person'],
            ['room_type' => 'Premium AC Tent', 'price' => '₹27,900/person'],
            ['room_type' => 'Super Premium AC Tent', 'price' => '₹30,900/person'],
            ['room_type' => 'Rajwadi Suite (2 Pax)', 'price' => '₹1,05,000/suite'],
            ['room_type' => 'Darbari Suite (4 Pax)', 'price' => '₹2,10,000/suite']
        ],
        'cancellation_policy' => [
            ['days_before' => 'More than 30 days', 'charge' => '90% Refund'],
            ['days_before' => '15 to 30 days', 'charge' => '60% Refund'],
            ['days_before' => 'Less than 15 days', 'charge' => 'No Refund (0%)']
        ]
    ],
    [
        'variant_key' => '4n5d',
        'label' => '4N/5D',
        'nights' => 4,
        'days' => 5,
        'tag' => 'Ultimate Kutch',
        'price_per_person' => 29999,
        'hotel_category' => 'Presidential Suite AC',
        'group_size' => '2-20 People',
        'pickup_from ' => 'Bhuj Railway Station / Airport',
        'inclusions' => [
            '4 Nights stay in Presidential Suite AC at Tent City Dhordo',
            'Full Kutch Circuit: White Rann, Kala Dungar, Mandvi Beach & Dholavira UNESCO Site',
            'All Gourmet Meals & Personal Concierge Service',
            'Champagne welcome reception'
        ],
        'exclusions' => [
            'Train or Airfare',
            'Personal tips'
        ],
        'sort_order' => 5,
        'itinerary' => [
            ['day_number' => 1, 'timing' => '12:30 PM', 'title' => 'VIP Check-in & Salt Desert Sunset', 'description' => 'Presidential welcome, lunch, private golf cart to White Rann for sunset.', 'activities' => ['Champagne Reception', 'Sunset Golf Cart Ride'], 'meals' => 'Lunch + High Tea + Dinner'],
            ['day_number' => 2, 'timing' => '09:00 AM', 'title' => 'Kala Dungar & Handicraft Villages', 'description' => 'Excursion to Kala Dungar and artisan villages of Hodka & Nirona.', 'activities' => ['Kala Dungar Peak', 'Craft Shopping'], 'meals' => 'Breakfast + Lunch + Dinner'],
            ['day_number' => 3, 'timing' => '08:00 AM', 'title' => 'Dholavira Harappan UNESCO Site Excursion', 'description' => 'Drive through Road to Heaven across salt lake to 5,000-year-old Harappan metropolis Dholavira.', 'activities' => ['Road to Heaven Scenic Drive', 'Dholavira Archaeological Site'], 'meals' => 'Breakfast + Packed Lunch + Dinner'],
            ['day_number' => 4, 'timing' => '09:00 AM', 'title' => 'Mandvi Beach & Palace Tour', 'description' => 'Day trip to Mandvi beach, Vijay Vilas palace and windmills.', 'activities' => ['Mandvi Beach Water Sports', 'Palace Tour'], 'meals' => 'Breakfast + Lunch + Dinner'],
            ['day_number' => 5, 'timing' => '10:00 AM', 'title' => 'Bhuj Sightseeing & Departure', 'description' => 'Check-out, visit Smritivan & Kutch Museum before airport drop.', 'activities' => ['Kutch Museum', 'Airport Transfer'], 'meals' => 'Breakfast']
        ],
        'hotels' => [
            ['hotel_name' => 'Evoke Tent City Presidential Suite', 'location' => 'Dhordo, Kutch', 'stars' => 5, 'highlight' => 'Presidential suite with private dining block & butler']
        ],
        'excursions' => [
            ['excursion_name' => 'Dholavira Road to Heaven Tour', 'description' => 'Scenic drive over white salt lake to Harappan UNESCO site', 'duration' => 'Full day', 'is_included' => 1]
        ],
        'price_table' => [
            ['room_type' => 'Presidential Suite AC (Twin Sharing)', 'price' => '₹29,999/person'],
            ['room_type' => 'Extra Adult in Suite', 'price' => '₹21,999/person']
        ],
        'cancellation_policy' => [
            ['days_before' => 'More than 30 days', 'charge' => '25% of package cost'],
            ['days_before' => '15 to 30 days', 'charge' => '50% of package cost'],
            ['days_before' => 'Less than 15 days', 'charge' => '100% Non-refundable']
        ]
    ]
];

$seededCount = 0;

foreach ($variantsData as $v) {
    // Check existing
    $stmt = $pdo->prepare("SELECT id FROM package_variants WHERE package_id = ? AND variant_key = ?");
    $stmt->execute([$rannId, $v['variant_key']]);
    $existing = $stmt->fetch();

    if ($existing) {
        $vId = $existing['id'];
        $up = $pdo->prepare("UPDATE package_variants SET
            label = ?, nights = ?, days = ?, tag = ?, price_per_person = ?, hotel_category = ?,
            group_size = ?, pickup_from = ?, inclusions = ?, exclusions = ?, sort_order = ?, is_active = 1
            WHERE id = ?");
        $up->execute([
            $v['label'], $v['nights'], $v['days'], $v['tag'], $v['price_per_person'],
            $v['hotel_category'], $v['group_size'], $v['pickup_from'],
            json_encode($v['inclusions']), json_encode($v['exclusions']), $v['sort_order'],
            $vId
        ]);
    } else {
        $ins = $pdo->prepare("INSERT INTO package_variants (
            package_id, variant_key, label, nights, days, tag, price_per_person, hotel_category,
            group_size, pickup_from, inclusions, exclusions, sort_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
        $ins->execute([
            $rannId, $v['variant_key'], $v['label'], $v['nights'], $v['days'], $v['tag'],
            $v['price_per_person'], $v['hotel_category'], $v['group_size'], $v['pickup_from'],
            json_encode($v['inclusions']), json_encode($v['exclusions']), $v['sort_order']
        ]);
        $vId = $pdo->lastInsertId();
    }

    // Itinerary
    $pdo->prepare("DELETE FROM variant_itinerary_days WHERE variant_id = ?")->execute([$vId]);
    $insD = $pdo->prepare("INSERT INTO variant_itinerary_days (variant_id, day_number, timing, title, description, activities, meals, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($v['itinerary'] as $idx => $d) {
        $insD->execute([$vId, $d['day_number'], $d['timing'] ?? null, $d['title'], $d['description'], json_encode($d['activities']), $d['meals'], $idx]);
    }

    // Hotels
    $pdo->prepare("DELETE FROM variant_hotels WHERE variant_id = ?")->execute([$vId]);
    $insH = $pdo->prepare("INSERT INTO variant_hotels (variant_id, hotel_name, location, stars, highlight, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($v['hotels'] as $idx => $h) {
        $insH->execute([$vId, $h['hotel_name'], $h['location'], $h['stars'], $h['highlight'], $idx]);
    }

    // Excursions
    $pdo->prepare("DELETE FROM variant_excursions WHERE variant_id = ?")->execute([$vId]);
    $insE = $pdo->prepare("INSERT INTO variant_excursions (variant_id, excursion_name, description, duration, price, is_included, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($v['excursions'] as $idx => $e) {
        $insE->execute([$vId, $e['excursion_name'], $e['description'], $e['duration'], $e['price'] ?? null, $e['is_included'], $idx]);
    }

    // Price table
    $pdo->prepare("DELETE FROM variant_price_rows WHERE variant_id = ?")->execute([$vId]);
    $insP = $pdo->prepare("INSERT INTO variant_price_rows (variant_id, room_type, price, sort_order) VALUES (?, ?, ?, ?)");
    foreach ($v['price_table'] as $idx => $pr) {
        $insP->execute([$vId, $pr['room_type'], $pr['price'], $idx]);
    }

    // Cancellation policy
    $pdo->prepare("DELETE FROM variant_cancellation WHERE variant_id = ?")->execute([$vId]);
    $insC = $pdo->prepare("INSERT INTO variant_cancellation (variant_id, days_before, charge, sort_order) VALUES (?, ?, ?, ?)");
    foreach ($v['cancellation_policy'] as $idx => $c) {
        $insC->execute([$vId, $c['days_before'], $c['charge'], $idx]);
    }

    $seededCount++;
}

echo "Successfully seeded {$seededCount} variants for rann-utsav!\n";

// -----------------------------------------------------------------------------
// STEP 2: SEED REMAINING 14 PACKAGE SLUGS
// -----------------------------------------------------------------------------
echo "\n=== STEP 2: Checking remaining 14 package slugs ===\n";

$requiredSlugs = [
    'thailand-tropical' => ['name' => 'Thailand Tropical Getaway', 'price' => 45999, 'duration' => '5N/6D', 'type' => 'international'],
    'bali-paradise' => ['name' => 'Bali Paradise Escape', 'price' => 55999, 'duration' => '5N/6D', 'type' => 'international'],
    'dubai-delights' => ['name' => 'Dubai Luxury & Desert Safari', 'price' => 48500, 'duration' => '4N/5D', 'type' => 'international'],
    'kerala-backwaters' => ['name' => 'Kerala Backwaters & Houseboat', 'price' => 24000, 'duration' => '5N/6D', 'type' => 'domestic'],
    'leh-ladakh-tour' => ['name' => 'Leh Ladakh High Passes Adventure', 'price' => 38000, 'duration' => '6N/7D', 'type' => 'domestic'],
    'rajasthan-royal' => ['name' => 'Rajasthan Royal Palaces', 'price' => 29500, 'duration' => '6N/7D', 'type' => 'domestic'],
    'goa-beach-holiday' => ['name' => 'Goa Beach Holiday', 'price' => 16500, 'duration' => '3N/4D', 'type' => 'domestic'],
    'himachal-hill-stations' => ['name' => 'Himachal Hill Stations Tour', 'price' => 22500, 'duration' => '5N/6D', 'type' => 'domestic'],
    'japan-cherry-blossom' => ['name' => 'Japan Cherry Blossom Special', 'price' => 145000, 'duration' => '7N/8D', 'type' => 'international'],
    'turkey-adventure' => ['name' => 'Turkey Hot Air Balloon Adventure', 'price' => 89000, 'duration' => '6N/7D', 'type' => 'international'],
    'georgia-adventure' => ['name' => 'Georgia Mountains & Wine Tour', 'price' => 62000, 'duration' => '5N/6D', 'type' => 'international'],
    'jaisalmer-tour' => ['name' => 'Jaisalmer Desert Safari Special', 'price' => 18500, 'duration' => '2N/3D', 'type' => 'domestic'],
    'golden-triangle' => ['name' => 'Golden Triangle India Tour', 'price' => 21000, 'duration' => '5N/6D', 'type' => 'domestic'],
    'mauritius-bliss' => ['name' => 'Mauritius Island Bliss', 'price' => 78000, 'duration' => '6N/7D', 'type' => 'international'],
    'seychelles-escape' => ['name' => 'Seychelles Tropical Paradise', 'price' => 95000, 'duration' => '5N/6D', 'type' => 'international']
];

$existingSlugsQuery = $pdo->query("SELECT slug FROM packages");
$existingSlugs = array_column($existingSlugsQuery->fetchAll(PDO::FETCH_ASSOC), 'slug');

$insertedCount = 0;
foreach ($requiredSlugs as $slug => $info) {
    if (!in_array($slug, $existingSlugs)) {
        $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%012x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff), mt_rand(0x4000, 0x4fff),
            mt_rand(0x8000, 0xbfff), mt_rand(0, 0xffffffffffff)
        );
        $ins = $pdo->prepare("INSERT INTO packages (
            id, name, slug, price, duration, package_type, is_active, is_featured
        ) VALUES (
            ?, ?, ?, ?, ?, ?, 1, 0
        )");
        $ins->execute([$uuid, $info['name'], $slug, $info['price'], $info['duration'], $info['type']]);
        echo "Inserted missing package: {$slug}\n";
        $insertedCount++;
    } else {
        echo "Package already exists: {$slug}\n";
    }
}

// -----------------------------------------------------------------------------
// STEP 3: VERIFY SEEDING
// -----------------------------------------------------------------------------
echo "\n=== STEP 3: Verification Query Result ===\n";

$verifySql = "SELECT p.name, p.slug, COUNT(pv.id) as variants
FROM packages p
LEFT JOIN package_variants pv ON pv.package_id = p.id
GROUP BY p.id
ORDER BY variants DESC, p.name ASC;";

$res = $pdo->query($verifySql)->fetchAll(PDO::FETCH_ASSOC);

printf("%-40s | %-25s | %s\n", "Package Name", "Slug", "Variants");
echo str_repeat("-", 75) . "\n";
foreach ($res as $row) {
    printf("%-40s | %-25s | %d\n", $row['name'], $row['slug'], $row['variants']);
}

file_put_contents(__DIR__ . '/seed_summary.json', json_encode([
    'rann_existed' => $rannExisted,
    'rann_variants_seeded' => $seededCount,
    'summary' => $res
], JSON_PRETTY_PRINT));
