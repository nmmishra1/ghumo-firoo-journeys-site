<?php
require_once __DIR__ . '/../db.php';
$pdo = getDb();

echo "🏜️  Starting Kutch Rann Utsav package seeding...\n";

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function genUuidKutch() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%012x',
        mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff),
        mt_rand(0x4000,0x4fff), mt_rand(0x8000,0xbfff),
        mt_rand(0, 0xffffffffffff)
    );
}

function upsertPackageKutch(PDO $pdo, $data) {
    $stmt = $pdo->prepare("SELECT id FROM packages WHERE slug = ?");
    $stmt->execute([$data['slug']]);
    $existing = $stmt->fetch();
    $packageId = $existing ? $existing['id'] : genUuidKutch();

    if ($existing) {
        $up = $pdo->prepare("UPDATE packages SET
            name=?, price=?, duration=?, image=?, images=?, category=?,
            rating=?, reviews=?, destinations=?, highlights=?, inclusions=?,
            exclusions=?, itinerary=?, map_locations=?,
            seo_title=?, seo_description=?, seo_keywords=?,
            best_time=?, group_size=?, difficulty=?, quick_facts=?,
            package_type=?, is_active=1, tagline=?, hero_image=?, is_featured=?
            WHERE id=?");
        $up->execute([
            $data['name'], floatval($data['price']), $data['duration'],
            $data['image'], json_encode($data['images'] ?? []),
            json_encode($data['category'] ?? []),
            floatval($data['rating'] ?? 4.8), intval($data['reviews'] ?? 0),
            json_encode($data['destinations'] ?? []),
            json_encode($data['highlights'] ?? []),
            json_encode($data['inclusions'] ?? []),
            json_encode($data['exclusions'] ?? []),
            json_encode($data['itinerary'] ?? []),
            json_encode($data['map_locations'] ?? []),
            $data['seo_title'] ?? '', $data['seo_description'] ?? '',
            $data['seo_keywords'] ?? '', $data['best_time'] ?? '',
            $data['group_size'] ?? '', $data['difficulty'] ?? 'Easy',
            json_encode($data['quick_facts'] ?? new stdClass()),
            $data['package_type'] ?? 'domestic',
            $data['tagline'] ?? null, $data['hero_image'] ?? null,
            intval($data['is_featured'] ?? 0),
            $packageId
        ]);
        echo "  Updated master package: {$data['name']}\n";
    } else {
        $ins = $pdo->prepare("INSERT INTO packages (
            id, name, price, slug, duration, image, images, category, rating, reviews,
            destinations, highlights, inclusions, exclusions, itinerary, map_locations,
            seo_title, seo_description, seo_keywords, best_time, group_size, difficulty,
            quick_facts, package_type, is_active, tagline, hero_image, is_featured
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?)");
        $ins->execute([
            $packageId, $data['name'], floatval($data['price']), $data['slug'],
            $data['duration'], $data['image'], json_encode($data['images'] ?? []),
            json_encode($data['category'] ?? []),
            floatval($data['rating'] ?? 4.8), intval($data['reviews'] ?? 0),
            json_encode($data['destinations'] ?? []),
            json_encode($data['highlights'] ?? []),
            json_encode($data['inclusions'] ?? []),
            json_encode($data['exclusions'] ?? []),
            json_encode($data['itinerary'] ?? []),
            json_encode($data['map_locations'] ?? []),
            $data['seo_title'] ?? '', $data['seo_description'] ?? '',
            $data['seo_keywords'] ?? '', $data['best_time'] ?? '',
            $data['group_size'] ?? '', $data['difficulty'] ?? 'Easy',
            json_encode($data['quick_facts'] ?? new stdClass()),
            $data['package_type'] ?? 'domestic',
            $data['tagline'] ?? null, $data['hero_image'] ?? null,
            intval($data['is_featured'] ?? 0)
        ]);
        echo "  Inserted master package: {$data['name']}\n";
    }
    return $packageId;
}

function upsertVariantKutch(PDO $pdo, $packageId, $variantData) {
    $stmt = $pdo->prepare("SELECT id FROM package_variants WHERE package_id = ? AND variant_key = ?");
    $stmt->execute([$packageId, $variantData['variant_key']]);
    $existing = $stmt->fetch();
    $variantId = $existing ? $existing['id'] : null;

    if ($variantId) {
        $up = $pdo->prepare("UPDATE package_variants SET
            label=?, nights=?, days=?, tag=?, price_per_person=?, hotel_category=?,
            group_size=?, pickup_from=?, inclusions=?, exclusions=?, sort_order=?, is_active=1
            WHERE id=?");
        $up->execute([
            $variantData['label'], intval($variantData['nights']), intval($variantData['days']),
            $variantData['tag'] ?? null, floatval($variantData['price_per_person']),
            $variantData['hotel_category'] ?? null, $variantData['group_size'] ?? null,
            $variantData['pickup_from'] ?? null,
            json_encode($variantData['inclusions'] ?? []),
            json_encode($variantData['exclusions'] ?? []),
            intval($variantData['sort_order'] ?? 0), $variantId
        ]);
        echo "    Updated variant: {$variantData['label']}\n";
    } else {
        $ins = $pdo->prepare("INSERT INTO package_variants (
            package_id, variant_key, label, nights, days, tag, price_per_person,
            hotel_category, group_size, pickup_from, inclusions, exclusions, sort_order, is_active
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)");
        $ins->execute([
            $packageId, $variantData['variant_key'], $variantData['label'],
            intval($variantData['nights']), intval($variantData['days']),
            $variantData['tag'] ?? null, floatval($variantData['price_per_person']),
            $variantData['hotel_category'] ?? null, $variantData['group_size'] ?? null,
            $variantData['pickup_from'] ?? null,
            json_encode($variantData['inclusions'] ?? []),
            json_encode($variantData['exclusions'] ?? []),
            intval($variantData['sort_order'] ?? 0)
        ]);
        $variantId = $pdo->lastInsertId();
        echo "    Inserted variant: {$variantData['label']}\n";
    }

    // Itinerary days
    if (!empty($variantData['itinerary'])) {
        $pdo->prepare("DELETE FROM variant_itinerary_days WHERE variant_id=?")->execute([$variantId]);
        $insD = $pdo->prepare("INSERT INTO variant_itinerary_days
            (variant_id, day_number, timing, title, description, activities, meals, sort_order)
            VALUES (?,?,?,?,?,?,?,?)");
        foreach ($variantData['itinerary'] as $idx => $d) {
            $insD->execute([
                $variantId, intval($d['day_number'] ?? $idx+1), $d['timing'] ?? null,
                $d['title'] ?? '', $d['description'] ?? null,
                json_encode($d['activities'] ?? []), $d['meals'] ?? null, $idx
            ]);
        }
    }

    // Hotels
    if (!empty($variantData['hotels'])) {
        $pdo->prepare("DELETE FROM variant_hotels WHERE variant_id=?")->execute([$variantId]);
        $insH = $pdo->prepare("INSERT INTO variant_hotels
            (variant_id, hotel_name, location, stars, highlight, sort_order)
            VALUES (?,?,?,?,?,?)");
        foreach ($variantData['hotels'] as $idx => $h) {
            $insH->execute([
                $variantId, $h['hotel_name'], $h['location'] ?? null,
                intval($h['stars'] ?? 3), $h['highlight'] ?? null, $idx
            ]);
        }
    }

    // Price table
    if (!empty($variantData['price_table'])) {
        $pdo->prepare("DELETE FROM variant_price_rows WHERE variant_id=?")->execute([$variantId]);
        $insP = $pdo->prepare("INSERT INTO variant_price_rows (variant_id, room_type, price, sort_order) VALUES (?,?,?,?)");
        foreach ($variantData['price_table'] as $idx => $pr) {
            $insP->execute([$variantId, $pr['room_type'], $pr['price'], $idx]);
        }
    }

    // Cancellation policy
    if (!empty($variantData['cancellation_policy'])) {
        $pdo->prepare("DELETE FROM variant_cancellation WHERE variant_id=?")->execute([$variantId]);
        $insC = $pdo->prepare("INSERT INTO variant_cancellation (variant_id, days_before, charge, sort_order) VALUES (?,?,?,?)");
        foreach ($variantData['cancellation_policy'] as $idx => $c) {
            $insC->execute([$variantId, $c['days_before'], $c['charge'], $idx]);
        }
    }

    return $variantId;
}

// ─────────────────────────────────────────
// SHARED DATA
// ─────────────────────────────────────────
$commonInclusions = [
    'Accommodation as per package (Bhunga/Cottage/Tent at Dhordo + Hotel in Bhuj/Mandvi/Dholavira where applicable)',
    'Transportation in AC Vehicle (Sedan 4-Seater / Ertiga 7-Seater / Crysta 7-Seater / Tempo Traveller)',
    'Flexible Pickup & Drop: Bhuj Airport / Bhuj Railway / Rajkot Airport / Gandhidham (as per booking)',
    'All mentioned sightseeing transfers throughout the tour',
    'White Rann BSF Entry Permit (included)',
    'Meals: Breakfast + Dinner as per itinerary (Day 1 = Dinner only)',
    '1 Litre Water Bottle per person per day',
    'Bonfire + Kutchi Folk Musical Program (arranged by resort, subject to availability)',
    'Full Moon Night Rann visit on applicable full moon dates (subject to BSF permission)',
    '24-Hour helpdesk on call service',
    'Local Guide cum Driver throughout the journey',
];

$commonExclusions = [
    'Lunch (all days, unless specifically mentioned in package)',
    'Entry fees at monuments: Aina Mahal, Dholavira, Vijay Vilas Palace, Prag Mahal etc.',
    'Camel cart / camel ride / ATV rides / adventure activities (own cost at site)',
    'Train / Flight / Bus tickets to/from pickup city',
    'English-speaking guide or separate Tour Manager (available at extra cost)',
    'GST (5% to 18% as applicable) and TCS (5% if applicable)',
    'Vehicle or hotel category upgrades',
    'Personal expenses: shopping, laundry, telephone, tips, alcoholic beverages',
    'Travel and Medical Insurance',
    'Special pricing applies on Full Moon, Dark Moon, Diwali (8-14 Nov 2026) & Christmas/New Year (18 Dec 2026 - 2 Jan 2027) dates — quote separately',
];

$cancellationPolicy = [
    ['days_before' => 'More than 30 days before travel', 'charge' => '10% of total package cost'],
    ['days_before' => '29 to 15 days before travel',     'charge' => '20% of total package cost'],
    ['days_before' => '14 to 7 days before travel',      'charge' => '50% of total package cost'],
    ['days_before' => 'Less than 7 days / No Show',      'charge' => '100% — No refund applicable'],
];

$highlights = [
    'Walk the Great White Salt Desert — shines like moonlight, unlike anywhere in India',
    'Rann Utsav Festival (1 Nov 2026 – 7 Mar 2027) — craft stalls, Garba, Dandiya, folk music',
    'Magical Sunrise at White Rann — golden light on white salt at 6:30 AM',
    'Breathtaking Sunset at White Rann — orange-pink sky over endless white horizon',
    'Full Moon Night Rann visit under moonlight — life most miracle moment (BSF-permitted)',
    'Kalo Dungar — Kutch highest peak (462m), Magnetic Hill, Guru Dattatreya Temple, 360 panoramic views',
    'Road to Heaven — White Rann on one side, Arabian Sea on the other (world class scenic drive)',
    'Dholavira — UNESCO World Heritage 4500-year-old Harappan city (2N3D onwards)',
    'Smrutivan Earthquake Memorial Museum — immersive 2001 Bhuj earthquake experience',
    'Vijay Vilas Palace and Mandvi Beach on the Arabian Sea coast',
    'Bhuj Heritage: Aina Mahal Palace of Mirrors, Prag Mahal Gothic Palace, Kutch Museum',
    'Bhujodi Craft Village — buy Ajrakh, Bandhani sarees, mirror embroidery from weavers directly',
    'Narayan Sarovar, Koteshwar Temple and Lakhpat Fort West Kutch circuit (4N5D only)',
    'Evening Bonfire with traditional Kutchi folk music at desert resort every night',
    'Flexible pickup from Bhuj Airport, Bhuj Railway, Rajkot Airport, or Gandhidham',
];

$mapLocations = [
    ['name' => 'White Rann / Dhordo', 'lat' => 23.7156, 'lng' => 69.7534, 'type' => 'attraction'],
    ['name' => 'Rann Utsav Tent City Dhordo', 'lat' => 23.7167, 'lng' => 69.7500, 'type' => 'accommodation'],
    ['name' => 'Kalo Dungar (Black Hill)', 'lat' => 23.9397, 'lng' => 69.3542, 'type' => 'attraction'],
    ['name' => 'Dholavira UNESCO Site', 'lat' => 23.8867, 'lng' => 70.2191, 'type' => 'attraction'],
    ['name' => 'Bhuj City', 'lat' => 23.2420, 'lng' => 69.6669, 'type' => 'city'],
    ['name' => 'Mandvi Beach', 'lat' => 22.8266, 'lng' => 69.3506, 'type' => 'attraction'],
    ['name' => 'Vijay Vilas Palace', 'lat' => 22.8322, 'lng' => 69.3175, 'type' => 'attraction'],
    ['name' => 'Narayan Sarovar', 'lat' => 23.5268, 'lng' => 68.8431, 'type' => 'attraction'],
    ['name' => 'Lakhpat Fort', 'lat' => 23.8226, 'lng' => 68.7739, 'type' => 'attraction'],
    ['name' => 'Koteshwar Temple', 'lat' => 23.7161, 'lng' => 68.7136, 'type' => 'attraction'],
    ['name' => 'Smrutivan Museum Bhuj', 'lat' => 23.2514, 'lng' => 69.6509, 'type' => 'attraction'],
    ['name' => 'Bhujodi Craft Village', 'lat' => 23.2193, 'lng' => 69.7236, 'type' => 'attraction'],
];

// ─────────────────────────────────────────
// MASTER PACKAGE
// ─────────────────────────────────────────
$packageId = upsertPackageKutch($pdo, [
    'name'            => 'Kutch Rann Utsav Package by Ghumo Firoo Travels',
    'slug'            => 'kutch-rann-utsav',
    'tagline'         => "Walk the White Salt Desert — India's most magical festival. Season: 1 Nov 2026 – 7 Mar 2027",
    'price'           => 5500,
    'duration'        => '1N–4N / 2D–5D',
    'image'           => '/rann_utsav_white_desert.jpg',
    'hero_image'      => '/Rann-Utsav-Gujarat.png',
    'images'          => [
        '/rann_utsav_white_desert.jpg',
        '/rann_utsav_tent_city.jpg',
        '/rann_utsav_kalo_dungar.jpg',
        '/rann_utsav_road_to_heaven.jpg',
        '/Rann-Utsav-Gujarat.png',
        '/kutchsunriseimage.jpg',
        '/Mandvi Beach_Kutch.png',
    ],
    'category'        => ['Cultural Festival', 'Desert', 'Heritage', 'Family', 'Honeymoon'],
    'package_type'    => 'domestic',
    'destinations'    => ['Kutch', 'Dhordo', 'Bhuj', 'Mandvi', 'Dholavira'],
    'rating'          => 4.9,
    'reviews'         => 48,
    'is_featured'     => 1,
    'best_time'       => 'November to February | Rann Utsav Season: 1 Nov 2026 – 7 Mar 2027',
    'group_size'      => '2–16 pax',
    'difficulty'      => 'Easy',
    'highlights'      => $highlights,
    'inclusions'      => $commonInclusions,
    'exclusions'      => $commonExclusions,
    'map_locations'   => $mapLocations,
    'quick_facts'     => [
        'Festival Season'     => '1 Nov 2026 – 7 Mar 2027',
        'Full Moon Dates'     => '23-25 Nov 2026 | 22-24 Dec 2026 | 21-23 Jan 2027 | 19-21 Feb 2027',
        'Dark Moon Dates'     => '9 Nov 2026 | 8 Dec 2026 | 7 Jan 2027 | 6 Feb 2027',
        'Diwali Special'      => '8–14 Nov 2026 (premium pricing)',
        'Christmas Special'   => '18 Dec 2026 – 2 Jan 2027 (premium pricing)',
        'Normal Day Pricing'  => 'Rates shown are for normal days ONLY. Special dates quoted separately.',
        'Gateway City'        => 'Bhuj (Airport BHJ + Railway Station)',
        'Alt Pickup Options'  => 'Rajkot Airport | Gandhidham Railway | Ahmedabad',
        'BSF Permit'          => 'Required for White Rann — included in package',
        'Vehicle Options'     => 'Sedan 4-Seater | Ertiga/Crysta 7-Seater | Tempo Traveller',
        'Alcohol'             => 'Strictly prohibited throughout Gujarat',
        'Currency'            => 'INR',
        'Language'            => 'Gujarati, Kutchi, Hindi, English',
    ],
    'itinerary'       => [],
    'seo_title'       => 'Kutch Rann Utsav Package 2026-27 | White Desert Tour | Ghumo Firoo Travels',
    'seo_description' => 'Book Kutch Rann Utsav 2026-27 packages from Rs 5500/person. 1N to 4N options covering White Rann, Dholavira UNESCO site, Kalo Dungar, Mandvi Beach, Bhuj palaces. Flexible pickup from Bhuj, Rajkot, Gandhidham. Normal day rates only.',
    'seo_keywords'    => 'Rann Utsav 2026 2027, Kutch package, White Desert Gujarat, Dhordo tent city, Kalo Dungar tour, Dholavira UNESCO, Mandvi beach package, Bhuj sightseeing, Ghumo Firoo Kutch tour',
]);

// ─────────────────────────────────────────
// VARIANT 1 — 1 Night / 2 Days
// ─────────────────────────────────────────
upsertVariantKutch($pdo, $packageId, [
    'variant_key'      => '1n2d',
    'label'            => '1 Night / 2 Days — Quick Getaway',
    'nights'           => 1,
    'days'             => 2,
    'tag'              => 'Best Seller',
    'price_per_person' => 5500,
    'hotel_category'   => 'Standard — Bhunga / Cottage / Tent at Dhordo (Non-AC)',
    'group_size'       => '2–16 pax',
    'pickup_from'      => 'Bhuj Airport / Bhuj Railway Station',
    'sort_order'       => 1,
    'inclusions'       => $commonInclusions,
    'exclusions'       => $commonExclusions,
    'cancellation_policy' => $cancellationPolicy,
    'price_table'      => [
        ['room_type' => 'Twin Sharing',   'price' => 'Rs 5,500 per person'],
        ['room_type' => 'Triple Sharing', 'price' => 'Rs 5,000 per person'],
    ],
    'hotels' => [
        [
            'hotel_name' => 'Kutch Yatra Resort / Kutch Resort / Desert King Resort or Similar',
            'location'   => 'Dhordo, Rann Area',
            'stars'      => 3,
            'highlight'  => 'Night 1 — White Rann base for Sunset, Bonfire & Sunrise'
        ],
    ],
    'itinerary' => [
        [
            'day_number'  => 1,
            'timing'      => '12:00 PM arrival — 9:00 PM',
            'title'       => 'Arrival | White Rann | Rann Utsav | Sunset | Bonfire',
            'description' => 'Pickup from Bhuj Airport or Railway Station. Drive to Dhordo resort (80 km, approx 2–2.5 hrs). Check-in at traditional Kutch stay — Bhunga / Cottage / Tent. Standard check-in time 12 PM, early check-in on availability. At 3:00 PM depart for Rann Utsav Festival Ground — explore craft stalls from across India, enjoy photography (1 hour). Visit the Great White Rann — walk on the salt crust, experience the surreal white landscape. Camel Cart and Camel Ride available at own cost at the site. Witness the spectacular Sunset at White Rann. Return to resort for Bonfire with Kutchi Folk Musical Program (arranged by resort). Dinner and overnight stay at Dhordo. FULL MOON DATES ONLY: Special moonlit Rann visit at 9:00 PM under BSF permission.',
            'activities'  => [
                'Rann Utsav Festival Ground and Craft Stalls',
                'Great White Rann Walk',
                'Camel Cart / Camel Ride (own payment at site)',
                'Sunset at White Rann',
                'Bonfire + Kutchi Folk Musical Program',
                'Full Moon Night Rann Visit (applicable full moon dates only, BSF-subject)',
            ],
            'meals' => 'Dinner | Overnight: Dhordo',
        ],
        [
            'day_number'  => 2,
            'timing'      => '6:30 AM — 4:30 PM drop',
            'title'       => 'Sunrise at Rann | Kalo Dungar | Bhuj City Sightseeing | Departure',
            'description' => 'Early morning Sunrise walk at White Rann at 6:30 AM — golden light on white salt, one of India most photographed experiences. Return to resort for breakfast. Checkout at 9:00 AM. Drive to Kalo Dungar (Black Hill) — Kutch highest point at 462m. Experience the famous Magnetic Hill effect. Visit Guru Dattatreya Temple on the summit. Enjoy 360 panoramic views of the entire Rann. Bhuj city sightseeing: Swaminarayan Temple, Aina Mahal Palace of Mirrors, Prag Mahal Gothic Palace, Kutch Museum, Vande Mataram Memorial, Bhujodi Craft Village for authentic Ajrakh, Bandhani and embroidery shopping. Drop at Bhuj Airport or Railway Station. Tour ends with beautiful memories.',
            'activities'  => [
                'Sunrise at White Rann (6:30 AM)',
                'Kalo Dungar — Magnetic Hill + Guru Dattatreya Temple + 360 Panoramic View',
                'Swaminarayan Temple, Bhuj',
                'Aina Mahal — Palace of Mirrors',
                'Prag Mahal — Gothic Palace',
                'Kutch Museum',
                'Vande Mataram Memorial',
                'Bhujodi Craft Village (Ajrakh, Bandhani, mirror embroidery)',
            ],
            'meals' => 'Breakfast',
        ],
    ],
]);

// ─────────────────────────────────────────
// VARIANT 2 — 2 Nights / 3 Days
// ─────────────────────────────────────────
upsertVariantKutch($pdo, $packageId, [
    'variant_key'      => '2n3d',
    'label'            => '2 Nights / 3 Days — Standard Experience',
    'nights'           => 2,
    'days'             => 3,
    'tag'              => 'Most Popular',
    'price_per_person' => 9500,
    'hotel_category'   => 'Standard — Bhuj Hotel (Night 1) + Dhordo Resort (Night 2)',
    'group_size'       => '2–16 pax',
    'pickup_from'      => 'Bhuj Airport / Bhuj Railway Station / Rajkot Airport',
    'sort_order'       => 2,
    'inclusions'       => $commonInclusions,
    'exclusions'       => $commonExclusions,
    'cancellation_policy' => $cancellationPolicy,
    'price_table'      => [
        ['room_type' => 'Twin Sharing',   'price' => 'Rs 9,500 per person'],
        ['room_type' => 'Triple Sharing', 'price' => 'Rs 8,500 per person'],
    ],
    'hotels' => [
        [
            'hotel_name' => 'The Fern Residency / Dream Resort / Hotel Mangalam or Similar',
            'location'   => 'Bhuj City',
            'stars'      => 3,
            'highlight'  => 'Night 1 — Bhuj city base for Prag Mahal, Aina Mahal, Museum'
        ],
        [
            'hotel_name' => 'Kutch Yatra Resort / White Rann Resort / Kutch Resort or Similar',
            'location'   => 'Dhordo, Rann Area',
            'stars'      => 3,
            'highlight'  => 'Night 2 — Rann base for Sunset, Bonfire and Sunrise'
        ],
    ],
    'itinerary' => [
        [
            'day_number'  => 1,
            'timing'      => 'Arrival — Evening',
            'title'       => 'Arrival at Bhuj | Check-in | Bhuj City Sightseeing',
            'description' => 'Pickup from Bhuj Airport or Railway Station (or Rajkot Airport — 4.5 hr drive to Bhuj). Check-in at Bhuj hotel. Afternoon sightseeing in Bhuj: Prag Mahal Gothic Palace, Aina Mahal Palace of Mirrors, Kutch Museum, Bhujodi Handicraft Village. Dinner and overnight stay at Bhuj.',
            'activities'  => ['Prag Mahal', 'Aina Mahal (Palace of Mirrors)', 'Kutch Museum', 'Bhujodi Craft Village'],
            'meals'       => 'Dinner | Overnight: Bhuj',
        ],
        [
            'day_number'  => 2,
            'timing'      => '9:00 AM — 9:00 PM',
            'title'       => 'Road to Heaven | Dholavira UNESCO | Kalo Dungar | White Rann | Sunset | Bonfire',
            'description' => 'Checkout from Bhuj hotel after breakfast. Drive toward Dholavira via the Road to Heaven — a dramatic scenic stretch with White Rann on one side and Arabian Sea on the other. Visit Dholavira UNESCO World Heritage Harappan site — 4500-year-old ancient city, ancient water reservoirs, citadel, granaries and the world oldest signboard. Drive to Kalo Dungar (Black Hill) — Kutch tallest point, Magnetic Hill phenomenon, Guru Dattatreya Temple, 360 panoramic Rann views. Check-in at Dhordo resort. Visit Great White Rann for Sunset. Evening Bonfire with Kutchi Folk Musical Program. Dinner and overnight stay at Dhordo.',
            'activities'  => [
                'Road to Heaven scenic drive (Rann + Sea on both sides)',
                'Dholavira UNESCO Harappan Site — ancient city exploration',
                'Kalo Dungar — Magnetic Hill + Temple + 360 Panoramic View',
                'White Rann Walk',
                'Sunset at White Rann',
                'Bonfire + Kutchi Folk Musical Program',
            ],
            'meals'       => 'Breakfast + Dinner | Overnight: Dhordo',
        ],
        [
            'day_number'  => 3,
            'timing'      => '6:30 AM — 3:30 PM drop',
            'title'       => 'Sunrise at Rann | Departure',
            'description' => 'Early morning Sunrise walk at White Rann (6:30 AM). Return for breakfast at resort. Checkout. Drive to Bhuj. Drop at Bhuj Airport or Railway Station (or Gandhidham if required). Tour ends.',
            'activities'  => ['Sunrise at White Rann (6:30 AM)', 'Drive to departure point', 'Drop at Bhuj or Gandhidham'],
            'meals'       => 'Breakfast',
        ],
    ],
]);

// ─────────────────────────────────────────
// VARIANT 3 — 3 Nights / 4 Days
// ─────────────────────────────────────────
upsertVariantKutch($pdo, $packageId, [
    'variant_key'      => '3n4d',
    'label'            => '3 Nights / 4 Days — Comprehensive Kutch',
    'nights'           => 3,
    'days'             => 4,
    'tag'              => 'Best Value',
    'price_per_person' => 14000,
    'hotel_category'   => 'Standard–Premium — Bhuj (N1) + Dhordo (N2) + Mandvi Beach (N3)',
    'group_size'       => '2–16 pax',
    'pickup_from'      => 'Bhuj Airport / Bhuj Railway / Rajkot Airport / Gandhidham',
    'sort_order'       => 3,
    'inclusions'       => $commonInclusions,
    'exclusions'       => $commonExclusions,
    'cancellation_policy' => $cancellationPolicy,
    'price_table'      => [
        ['room_type' => 'Twin Sharing',   'price' => 'Rs 14,000 per person'],
        ['room_type' => 'Triple Sharing', 'price' => 'Rs 13,000 per person'],
    ],
    'hotels' => [
        [
            'hotel_name' => 'The Fern Residency / Dream Resort / Hotel Mangalam or Similar',
            'location'   => 'Bhuj City',
            'stars'      => 3,
            'highlight'  => 'Night 1 — Bhuj city base'
        ],
        [
            'hotel_name' => 'White Rann Resort / Kutch Resort / Desert King Resort or Similar',
            'location'   => 'Dhordo, Rann Area',
            'stars'      => 3,
            'highlight'  => 'Night 2 — Rann base for Sunset, Bonfire and Sunrise'
        ],
        [
            'hotel_name' => 'Serena Beach Resort / Hotel Seven Beach Inn or Similar',
            'location'   => 'Mandvi Beach',
            'stars'      => 3,
            'highlight'  => 'Night 3 — Beachfront stay on Arabian Sea after Smrutivan and Vijay Vilas'
        ],
    ],
    'itinerary' => [
        [
            'day_number'  => 1,
            'timing'      => 'Arrival — Evening',
            'title'       => 'Arrival at Bhuj | Bhuj City Sightseeing',
            'description' => 'Pickup from Bhuj Airport or Railway Station (or Rajkot Airport — 4.5 hr drive to Bhuj). Check-in at Bhuj hotel. Afternoon sightseeing: Prag Mahal, Aina Mahal Palace of Mirrors, Kutch Museum, Bhujodi Craft Village. Dinner and overnight stay at Bhuj.',
            'activities'  => ['Prag Mahal', 'Aina Mahal', 'Kutch Museum', 'Bhujodi Craft Village'],
            'meals'       => 'Dinner | Overnight: Bhuj',
        ],
        [
            'day_number'  => 2,
            'timing'      => '9:00 AM — 9:00 PM',
            'title'       => 'Road to Heaven | Dholavira | Kalo Dungar | White Rann | Sunset | Bonfire',
            'description' => 'Checkout from Bhuj hotel. Road to Heaven scenic drive. Dholavira UNESCO Harappan site. Kalo Dungar — Magnetic Hill, Temple, panoramic views. Check-in at Dhordo resort. Sunset at White Rann. Bonfire + Folk Music. Dinner and overnight stay at Dhordo.',
            'activities'  => ['Road to Heaven drive', 'Dholavira UNESCO Site', 'Kalo Dungar + Magnetic Hill + Temple', 'White Rann Walk', 'Sunset at Rann', 'Bonfire + Folk Music'],
            'meals'       => 'Breakfast + Dinner | Overnight: Dhordo',
        ],
        [
            'day_number'  => 3,
            'timing'      => '6:30 AM — 8:00 PM',
            'title'       => 'Sunrise at Rann | Smrutivan Museum | Mandvi Beach | Vijay Vilas Palace',
            'description' => 'Sunrise walk at White Rann (6:30 AM). Breakfast at resort. Checkout. Drive to Bhuj — visit Smrutivan Earthquake Memorial Museum (immersive 2001 earthquake experience). Continue to Mandvi (60 km): visit Vijay Vilas Palace (1929 royal palace on the coast, Bollywood famous). Relax at Mandvi Beach — camel rides, windmills, Arabian Sea sunset. Check-in at Mandvi beach resort. Dinner and overnight stay at Mandvi.',
            'activities'  => ['Sunrise at White Rann', 'Smrutivan Earthquake Museum Bhuj', 'Vijay Vilas Palace Mandvi', 'Mandvi Beach — camel rides, sunset'],
            'meals'       => 'Breakfast + Dinner | Overnight: Mandvi Beach',
        ],
        [
            'day_number'  => 4,
            'timing'      => '9:00 AM — 3:30 PM drop',
            'title'       => 'Checkout Mandvi | Drive to Bhuj | Departure',
            'description' => 'Breakfast at Mandvi resort. Checkout. Drive to Bhuj (60 km, approx 1.5 hrs). Drop at Bhuj Airport or Railway Station (or Gandhidham if required). Tour ends with beautiful memories of Kutch.',
            'activities'  => ['Drive from Mandvi to Bhuj', 'Drop at departure point'],
            'meals'       => 'Breakfast',
        ],
    ],
]);

// ─────────────────────────────────────────
// VARIANT 4 — 4 Nights / 5 Days
// ─────────────────────────────────────────
upsertVariantKutch($pdo, $packageId, [
    'variant_key'      => '4n5d',
    'label'            => '4 Nights / 5 Days — Grand Kutch Explorer',
    'nights'           => 4,
    'days'             => 5,
    'tag'              => 'Premium',
    'price_per_person' => 18500,
    'hotel_category'   => 'Standard–Premium — Dhordo (N1) + Dholavira (N2) + Mandvi (N3) + Bhuj (N4)',
    'group_size'       => '2–16 pax',
    'pickup_from'      => 'Bhuj Airport / Bhuj Railway Station / Rajkot Airport / Gandhidham',
    'sort_order'       => 4,
    'inclusions'       => $commonInclusions,
    'exclusions'       => $commonExclusions,
    'cancellation_policy' => $cancellationPolicy,
    'price_table'      => [
        ['room_type' => 'Twin Sharing',   'price' => 'Rs 18,500 per person'],
        ['room_type' => 'Triple Sharing', 'price' => 'Rs 17,000 per person'],
    ],
    'hotels' => [
        [
            'hotel_name' => 'Kutch Resort / Desert King Resort / White Rann Resort or Similar',
            'location'   => 'Dhordo, Rann Area',
            'stars'      => 3,
            'highlight'  => 'Night 1 — Rann base for Sunset, Bonfire and Sunrise'
        ],
        [
            'hotel_name' => 'StayGuru Heaven Resort Dholavira / The Dholavira Resort or Similar',
            'location'   => 'Dholavira',
            'stars'      => 3,
            'highlight'  => 'Night 2 — Stay at the UNESCO site itself'
        ],
        [
            'hotel_name' => 'Serena Beach Resort / Hotel Seven Beach Inn or Similar',
            'location'   => 'Mandvi Beach',
            'stars'      => 3,
            'highlight'  => 'Night 3 — Beachfront stay on Arabian Sea'
        ],
        [
            'hotel_name' => 'Hotel Mangalam / Dream Resort / Hotel Kutch Elegance / The Fern Residency or Similar',
            'location'   => 'Bhuj City',
            'stars'      => 3,
            'highlight'  => 'Night 4 — City base for Bhuj sightseeing before departure'
        ],
    ],
    'itinerary' => [
        [
            'day_number'  => 1,
            'timing'      => '12:00 PM arrival — 9:00 PM',
            'title'       => 'Arrival at Bhuj | Drive to Dhordo | White Rann | Rann Utsav | Sunset | Bonfire',
            'description' => 'Pickup from Bhuj Railway Station or Airport (approx 80 km, 2–2.5 hrs to Dhordo). Check-in at Dhordo resort. At 3 PM visit Rann Utsav Festival Ground — craft stalls from across India, folk art demonstrations. Visit the Great White Rann. Camel Cart and Camel Ride available at own cost. Spectacular Sunset at White Rann. Evening Bonfire with Kutchi Folk Musical Program. Dinner and overnight stay at Dhordo. FULL MOON DATES: Special moonlit Rann visit at 9 PM under BSF permission.',
            'activities'  => [
                'Rann Utsav Festival Ground and Craft Stalls',
                'Great White Rann Walk',
                'Camel Cart / Camel Ride (own payment at site)',
                'Sunset at White Rann',
                'Bonfire + Kutchi Folk Musical Program',
                'Full Moon Night Rann Visit (full moon dates only, BSF subject)',
            ],
            'meals'       => 'Dinner | Overnight: Dhordo',
        ],
        [
            'day_number'  => 2,
            'timing'      => '6:30 AM — 7:00 PM',
            'title'       => 'Sunrise at Rann | Road to Heaven | Dholavira UNESCO | Check-in Dholavira',
            'description' => 'Early Sunrise walk at White Rann (6:30 AM). Breakfast at resort. Drive to Dholavira via Road to Heaven — dramatic stretch with White Rann on one side, Arabian Sea on the other (subject to BSF operation). Visit Dholavira — 4500-year-old Harappan UNESCO World Heritage City. Explore ancient water reservoirs, citadel walls, granaries, ancient stadium and world oldest signboard. Check-in at Dholavira resort. Dinner and overnight stay at Dholavira.',
            'activities'  => [
                'Sunrise at White Rann (6:30 AM)',
                'Road to Heaven scenic drive (Rann + Sea on both sides)',
                'Dholavira UNESCO Harappan Site — reservoirs, citadel, granaries, stadium',
            ],
            'meals'       => 'Breakfast + Dinner | Overnight: Dholavira',
        ],
        [
            'day_number'  => 3,
            'timing'      => '9:00 AM — 8:00 PM',
            'title'       => 'Dholavira to Mandvi | Vijay Vilas Palace | Mandvi Beach',
            'description' => 'Breakfast at Dholavira resort. Checkout. Drive to Mandvi via Bhuj (approx 190 km, 4.5–5 hrs). Check-in at Mandvi beach resort. Visit Vijay Vilas Palace — stunning 1929 red sandstone royal palace on the Arabian Sea coast, featured in Bollywood film Hum Dil De Chuke Sanam. Relax at Mandvi Beach — camel rides, traditional windmills, Arabian Sea sunset. Optional: Mandvi Shipbuilding Yard — watch traditional wooden dhow construction. Dinner and overnight stay at Mandvi.',
            'activities'  => [
                'Drive from Dholavira to Mandvi via Bhuj',
                'Vijay Vilas Palace — Bollywood famous royal palace',
                'Mandvi Beach — camel rides, windmills, Arabian Sea sunset',
                'Mandvi Shipbuilding Yard (optional)',
            ],
            'meals'       => 'Breakfast + Dinner | Overnight: Mandvi Beach',
        ],
        [
            'day_number'  => 4,
            'timing'      => '9:00 AM — 9:00 PM',
            'title'       => 'Mandvi to Bhuj | Aina Mahal | Prag Mahal | Kutch Museum | Bhujodi Village',
            'description' => 'Breakfast at Mandvi resort. Checkout. Drive to Bhuj (60 km, approx 1.5 hrs). Visit Aina Mahal — opulent 18th century Palace of Mirrors with Venetian glass and intricate inlay work. Visit Prag Mahal — 1865 Gothic Italian palace with 45.7m bell tower, Italian marble and Belgian chandeliers. Kutch Museum — Gujarat oldest museum with tribal textiles, jewelry and archaeology. Shopping at Bhujodi Craft Village — buy authentic Ajrakh prints, Bandhani sarees, mirror embroidery and woolen shawls directly from weavers. Check-in at Bhuj hotel. Dinner and overnight stay at Bhuj.',
            'activities'  => [
                'Aina Mahal — Palace of Mirrors (18th century)',
                'Prag Mahal — Gothic Italian Palace with Bell Tower',
                'Kutch Museum — Gujarat oldest museum',
                'Bhujodi Craft Village — Ajrakh, Bandhani, mirror embroidery, woolen shawls',
                'Local handicraft shopping',
            ],
            'meals'       => 'Breakfast + Dinner | Overnight: Bhuj',
        ],
        [
            'day_number'  => 5,
            'timing'      => '9:00 AM — 6:30 PM drop',
            'title'       => 'Kalo Dungar | Smrutivan Museum | Departure',
            'description' => 'Breakfast at Bhuj hotel. Checkout. Visit Kalo Dungar (Black Hill) — Kutch tallest peak at 462m, famous Magnetic Hill where vehicles appear to roll uphill, Guru Dattatreya Temple on summit, 360 panoramic view of the entire Rann. Visit Smrutivan Earthquake Memorial Museum — immersive experience recreating the devastating 26 January 2001 Bhuj earthquake. Drop at Bhuj Railway Station or Airport as per schedule. Tour ends with beautiful memories of Kutch.',
            'activities'  => [
                'Kalo Dungar — Magnetic Hill + Guru Dattatreya Temple + 360 Panoramic View',
                'Smrutivan Earthquake Memorial Museum',
                'Drop at Bhuj Railway Station or Airport',
            ],
            'meals'       => 'Breakfast',
        ],
    ],
]);

echo "\n========================================\n";
echo "KUTCH RANN UTSAV SEEDING COMPLETE!\n";
echo "========================================\n";
echo "Master Package Slug : kutch-rann-utsav\n";
echo "Season              : 1 Nov 2026 – 7 Mar 2027\n";
echo "Variants seeded     : 1N2D | 2N3D | 3N4D | 4N5D\n";
echo "Pricing (Normal Days only):\n";
echo "  1N2D : Rs 5,500 / person (twin)\n";
echo "  2N3D : Rs 9,500 / person (twin)\n";
echo "  3N4D : Rs 14,000 / person (twin)\n";
echo "  4N5D : Rs 18,500 / person (twin)\n";
echo "Special dates (premium pricing): Full Moon x4, Diwali, Christmas/NY\n";
echo "========================================\n";
