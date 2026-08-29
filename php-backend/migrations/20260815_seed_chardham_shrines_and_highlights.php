<?php
// php-backend/migrations/20260815_seed_chardham_shrines_and_highlights.php
// Migration & Seeder script: Populate all Char Dham Shrines & Highlights in sightseeings & activities with proper city_id, state ('Uttarakhand'), and country ('India') references.

require_once __DIR__ . '/../db.php';

try {
    $pdo = getDb();
    echo "=== SEEDING CHAR DHAM SHRINES & HIGHLIGHTS INTO DATABASE ===\n\n";

    // 1. Ensure required Uttarakhand Cities exist in `cities` table
    $citiesToEnsure = [
        ['name' => 'Yamunotri', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Gangotri', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Kedarnath', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Badrinath', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Mana', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Devprayag', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Haridwar', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Rishikesh', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Uttarkashi', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Barkot', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Guptkashi', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Sonprayag', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Joshimath', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Chopta', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Harsil', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Janki Chatti', 'state' => 'Uttarakhand', 'country' => 'India'],
        ['name' => 'Rudraprayag', 'state' => 'Uttarakhand', 'country' => 'India'],
    ];

    $cityMap = [];
    foreach ($citiesToEnsure as $c) {
        $stmt = $pdo->prepare("SELECT id FROM cities WHERE LOWER(name) = LOWER(?) LIMIT 1");
        $stmt->execute([$c['name']]);
        $existingId = $stmt->fetchColumn();

        if ($existingId) {
            // Ensure state and country are correctly set to Uttarakhand & India
            $up = $pdo->prepare("UPDATE cities SET state = 'Uttarakhand', country = 'India' WHERE id = ?");
            $up->execute([$existingId]);
            $cityMap[$c['name']] = (int)$existingId;
            echo "City [{$c['name']}] verified (ID: {$existingId})\n";
        } else {
            $ins = $pdo->prepare("INSERT INTO cities (name, state, country) VALUES (?, 'Uttarakhand', 'India')");
            $ins->execute([$c['name']]);
            $newId = (int)$pdo->lastInsertId();
            $cityMap[$c['name']] = $newId;
            echo "City [{$c['name']}] created (ID: {$newId})\n";
        }
    }

    echo "\n--- SEEDING SIGHTSEEINGS FOR CHAR DHAM CIRCUIT ---\n";

    $sightseeingsData = [
        [
            'id' => 'ss-chardham-01',
            'sightseeing_name' => 'Kedarnath Dham Jyotirlinga Temple',
            'city_name' => 'Kedarnath',
            'destination' => 'Kedarnath',
            'duration' => 'Full Day',
            'description' => '12th sacred Jyotirlinga of Lord Shiva set against the dramatic backdrop of snow-capped Kedarnath Peak in Garhwal Himalayas (11,755 ft).',
            'image_url' => '/Kedarnath.png',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-02',
            'sightseeing_name' => 'Badrinath Dham & Tapt Kund Thermal Bath',
            'city_name' => 'Badrinath',
            'destination' => 'Badrinath',
            'duration' => 'Half Day',
            'description' => 'Sacred abode of Lord Vishnu situated between Nar and Narayana mountain ranges on Alaknanda river, featuring natural 45°C sulfur hot spring.',
            'image_url' => '/Badrinath.png',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-03',
            'sightseeing_name' => 'Gangotri Dham & Bhagirath Shila',
            'city_name' => 'Gangotri',
            'destination' => 'Gangotri',
            'duration' => 'Half Day',
            'description' => 'Sacred birthplace of river Ganga where Goddess Ganga descended to Earth. Features 18th-century white granite temple and Bhagirath meditation stone.',
            'image_url' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-04',
            'sightseeing_name' => 'Yamunotri Dham & Surya Kund 88°C Thermal Spring',
            'city_name' => 'Yamunotri',
            'destination' => 'Yamunotri',
            'duration' => 'Full Day',
            'description' => 'First shrine of Char Dham circuit near Champasar Glacier. Pilgrims cook rice & potatoes wrapped in cloth in boiling 88°C Surya Kund as Prasad.',
            'image_url' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-05',
            'sightseeing_name' => 'Triyugi Narayan Temple (Akhand Dhuni Eternal Fire)',
            'city_name' => 'Sonprayag',
            'destination' => 'Guptkashi',
            'duration' => '2 Hours',
            'description' => 'Celestial wedding venue of Lord Shiva and Goddess Parvati. Features the Akhand Dhuni perpetual fire flame burning continuously across 3 Yugas.',
            'image_url' => 'https://images.unsplash.com/photo-1600100397608-f09070a74797?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-06',
            'sightseeing_name' => 'Tungnath Temple & Chandrashila Peak (World\'s Highest Shiva Shrine)',
            'city_name' => 'Chopta',
            'destination' => 'Chopta',
            'duration' => 'Full Day',
            'description' => 'World\'s highest Shiva temple (12,073 ft) and Panch Kedar shrine with 360° summit views of Nanda Devi, Kedarnath & Chaukhamba peaks.',
            'image_url' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-07',
            'sightseeing_name' => 'Mana Village, Vyas Gufa & Bheem Pul',
            'city_name' => 'Mana',
            'destination' => 'Badrinath',
            'duration' => '3 Hours',
            'description' => 'Historic Himalayan first Indian border village housing Vyas Gufa cave, Ganesh Gufa & giant natural rock bridge built by Bheem over Saraswati river.',
            'image_url' => 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-08',
            'sightseeing_name' => 'Vasudhara Falls (400ft High Glacial Waterfall)',
            'city_name' => 'Mana',
            'destination' => 'Badrinath',
            'duration' => '5 Hours',
            'description' => 'Sacred 140m alpine waterfall dropping from glacial peaks along Swargarohini Pandava trail beyond Mana Village.',
            'image_url' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-09',
            'sightseeing_name' => 'Harsil Apple Valley & Bhagirathi River',
            'city_name' => 'Harsil',
            'destination' => 'Uttarkashi',
            'duration' => '3 Hours',
            'description' => 'Picturesque Himalayan valley famous for wooden chalets, pine forests, crystal Bhagirathi river streams & sweet apple orchards.',
            'image_url' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-10',
            'sightseeing_name' => 'Kashi Vishwanath Temple & Shakti Trishul Uttarkashi',
            'city_name' => 'Uttarkashi',
            'destination' => 'Uttarkashi',
            'duration' => '2 Hours',
            'description' => 'Historic ancient temple of Lord Shiva housing 26-foot massive brass Shakti Trishul on Bhagirathi riverbanks.',
            'image_url' => 'https://images.unsplash.com/photo-1600100397608-f09070a74797?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-11',
            'sightseeing_name' => 'Devprayag Confluence (Alaknanda & Bhagirathi Sangam)',
            'city_name' => 'Devprayag',
            'destination' => 'Rudraprayag',
            'duration' => '1 Hour',
            'description' => 'Sacred holy confluence where turquoise Alaknanda and muddy Bhagirathi rivers merge to officially take the name Holy Ganga.',
            'image_url' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-12',
            'sightseeing_name' => 'Har Ki Pauri Evening Ganga Aarti Haridwar',
            'city_name' => 'Haridwar',
            'destination' => 'Haridwar',
            'duration' => '2 Hours',
            'description' => 'World-renowned evening Ganga Aarti ceremony with thousands of floating brass lamps at sacred Brahmakund ghat.',
            'image_url' => 'https://images.unsplash.com/photo-1566838334-a6dd-a8bb7e5b1657?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-13',
            'sightseeing_name' => 'Triveni Ghat & Ram Jhula Ganga Aarti Rishikesh',
            'city_name' => 'Rishikesh',
            'destination' => 'Rishikesh',
            'duration' => '2 Hours',
            'description' => 'Sacred river confluence ghat in Yoga Capital Rishikesh featuring evening musical prayers and Vedic chants.',
            'image_url' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-14',
            'sightseeing_name' => 'Joshimath Narsingh Temple & Shankaracharya Math',
            'city_name' => 'Joshimath',
            'destination' => 'Joshimath',
            'duration' => '2 Hours',
            'description' => 'Winter seat of Lord Badrinath and ancient Northern Math established by Adi Shankaracharya in 8th century.',
            'image_url' => 'https://images.unsplash.com/photo-1600100397608-f09070a74797?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
        [
            'id' => 'ss-chardham-15',
            'sightseeing_name' => 'Janki Chatti Base Camp & Yamunotri Trek Way',
            'city_name' => 'Janki Chatti',
            'destination' => 'Barkot',
            'duration' => 'Half Day',
            'description' => 'Trek head and palanquin base camp for 6 km pilgrimage path leading to Yamunotri shrine.',
            'image_url' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
            'adult_cost' => 0.00,
            'child_cost' => 0.00
        ],
    ];

    $ssIns = $pdo->prepare("
        INSERT INTO sightseeings (id, sightseeing_name, city_id, destination, duration, description, image_url, adult_cost, child_cost)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            sightseeing_name = VALUES(sightseeing_name),
            city_id = VALUES(city_id),
            destination = VALUES(destination),
            duration = VALUES(duration),
            description = VALUES(description),
            image_url = VALUES(image_url),
            adult_cost = VALUES(adult_cost),
            child_cost = VALUES(child_cost)
    ");

    foreach ($sightseeingsData as $s) {
        $cId = $cityMap[$s['city_name']] ?? null;
        $ssIns->execute([
            $s['id'],
            $s['sightseeing_name'],
            $cId,
            $s['destination'],
            $s['duration'],
            $s['description'],
            $s['image_url'],
            $s['adult_cost'],
            $s['child_cost']
        ]);
        echo "Seeded Sightseeing: {$s['sightseeing_name']} | City: {$s['city_name']} (CityID: {$cId})\n";
    }

    echo "\n--- SEEDING ACTIVITIES FOR CHAR DHAM CIRCUIT ---\n";

    $activitiesData = [
        [
            'id' => 'act-chardham-01',
            'activity_name' => 'Kedarnath VIP Helicopter Shuttle Ticket (Phata / Sersi / Guptkashi Return)',
            'city_name' => 'Kedarnath',
            'sightseeing_id' => 'ss-chardham-01',
            'destination' => 'Kedarnath',
            'duration' => '1 Hour',
            'adult_cost' => 7800.00,
            'child_cost' => 7800.00,
            'activity_category' => 'entry_ticket'
        ],
        [
            'id' => 'act-chardham-02',
            'activity_name' => 'Kedarnath Priority VIP Darshan Queue Pass & Permit',
            'city_name' => 'Kedarnath',
            'sightseeing_id' => 'ss-chardham-01',
            'destination' => 'Kedarnath',
            'duration' => '2 Hours',
            'adult_cost' => 1100.00,
            'child_cost' => 1100.00,
            'activity_category' => 'entry_ticket'
        ],
        [
            'id' => 'act-chardham-03',
            'activity_name' => 'Badrinath Special Maha Aarti & VIP Temple Pass',
            'city_name' => 'Badrinath',
            'sightseeing_id' => 'ss-chardham-02',
            'destination' => 'Badrinath',
            'duration' => '2 Hours',
            'adult_cost' => 500.00,
            'child_cost' => 500.00,
            'activity_category' => 'entry_ticket'
        ],
        [
            'id' => 'act-chardham-04',
            'activity_name' => 'Yamunotri Pony / Palki Palanquin Service (Janki Chatti Return)',
            'city_name' => 'Yamunotri',
            'sightseeing_id' => 'ss-chardham-04',
            'destination' => 'Yamunotri',
            'duration' => '5 Hours',
            'adult_cost' => 3200.00,
            'child_cost' => 2500.00,
            'activity_category' => 'activity'
        ],
        [
            'id' => 'act-chardham-05',
            'activity_name' => 'Rishikesh White Water Ganga Rafting (16 km Shivpuri to Laxman Jhula)',
            'city_name' => 'Rishikesh',
            'sightseeing_id' => 'ss-chardham-13',
            'destination' => 'Rishikesh',
            'duration' => '3 Hours',
            'adult_cost' => 1200.00,
            'child_cost' => 1000.00,
            'activity_category' => 'adventure'
        ],
    ];

    $actIns = $pdo->prepare("
        INSERT INTO activities (id, activity_name, city_id, destination, duration, adult_cost, child_cost, activity_category, active_status, country_name, state_name, city)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'India', 'Uttarakhand', ?)
        ON DUPLICATE KEY UPDATE 
            activity_name = VALUES(activity_name),
            city_id = VALUES(city_id),
            destination = VALUES(destination),
            duration = VALUES(duration),
            adult_cost = VALUES(adult_cost),
            child_cost = VALUES(child_cost),
            activity_category = VALUES(activity_category),
            active_status = 1,
            country_name = 'India',
            state_name = 'Uttarakhand',
            city = VALUES(city)
    ");

    foreach ($activitiesData as $a) {
        $cId = $cityMap[$a['city_name']] ?? null;
        $actIns->execute([
            $a['id'],
            $a['activity_name'],
            $cId,
            $a['destination'],
            $a['duration'],
            $a['adult_cost'],
            $a['child_cost'],
            $a['activity_category'],
            $a['city_name']
        ]);
        echo "Seeded Activity: {$a['activity_name']} | City: {$a['city_name']} (CityID: {$cId})\n";
    }

    echo "\n=== ALL CHAR DHAM SHRINES & HIGHLIGHTS SUCCESSFULLY SEEDED IN DATABASE ===\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
