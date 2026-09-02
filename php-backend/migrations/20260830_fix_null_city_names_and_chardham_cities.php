<?php
// php-backend/migrations/20260830_fix_null_city_names_and_chardham_cities.php
// Database repair & migration: Clean up null/empty name city rows, synchronize city_name and name,
// ensure proper state_id links, and ensure Gir National Park & Chardham cities have accurate IDs and metadata.

require_once __DIR__ . '/../db.php';

try {
    $pdo = getDb();
    echo "=== REPAIRING NULL-NAME CITIES & DESTINATIONS DATA INTEGRITY ===\n\n";

    // 1. Synchronize `city_name` from `name` where `city_name` is null or empty
    $up1 = $pdo->exec("
        UPDATE cities 
        SET city_name = name 
        WHERE (city_name IS NULL OR TRIM(city_name) = '') 
          AND (name IS NOT NULL AND TRIM(name) != '')
    ");
    echo "• Synchronized city_name from name for {$up1} rows.\n";

    // 2. Synchronize `name` from `city_name` where `name` is null or empty
    $up2 = $pdo->exec("
        UPDATE cities 
        SET name = city_name 
        WHERE (name IS NULL OR TRIM(name) = '') 
          AND (city_name IS NOT NULL AND TRIM(city_name) != '')
    ");
    echo "• Synchronized name from city_name for {$up2} rows.\n";

    // 3. Link `state_id` where `state_id` is null by matching state name or state column
    $up3 = $pdo->exec("
        UPDATE cities c
        JOIN states s ON LOWER(TRIM(c.state)) = LOWER(TRIM(s.state_name))
        SET c.state_id = s.id, c.country_id = 1
        WHERE c.state_id IS NULL OR c.state_id = 0
    ");
    echo "• Linked missing state_ids for {$up3} cities.\n";

    // 4. Ensure Chardham & Uttarakhand destination records (Badrinath, Kedarnath, Yamunotri, Gangotri, Mana, etc.)
    $chardhamCities = [
        ['name' => 'Badrinath', 'state' => 'Uttarakhand', 'type' => 'Spiritual / Pilgrimage'],
        ['name' => 'Kedarnath', 'state' => 'Uttarakhand', 'type' => 'Spiritual / Pilgrimage'],
        ['name' => 'Yamunotri', 'state' => 'Uttarakhand', 'type' => 'Spiritual / Pilgrimage'],
        ['name' => 'Gangotri', 'state' => 'Uttarakhand', 'type' => 'Spiritual / Pilgrimage'],
        ['name' => 'Mana', 'state' => 'Uttarakhand', 'type' => 'Heritage & Mountain'],
        ['name' => 'Haridwar', 'state' => 'Uttarakhand', 'type' => 'Spiritual / Pilgrimage'],
        ['name' => 'Rishikesh', 'state' => 'Uttarakhand', 'type' => 'Adventure & Spiritual'],
        ['name' => 'Uttarkashi', 'state' => 'Uttarakhand', 'type' => 'Spiritual / Hill Station'],
        ['name' => 'Joshimath', 'state' => 'Uttarakhand', 'type' => 'Spiritual / Hill Station'],
        ['name' => 'Chopta', 'state' => 'Uttarakhand', 'type' => 'Trekking & Hill Station'],
        ['name' => 'Devprayag', 'state' => 'Uttarakhand', 'type' => 'Spiritual Confluence'],
        ['name' => 'Barkot', 'state' => 'Uttarakhand', 'type' => 'Hill Station & Pilgrim Hub'],
        ['name' => 'Guptkashi', 'state' => 'Uttarakhand', 'type' => 'Pilgrim Base Camp'],
        ['name' => 'Sonprayag', 'state' => 'Uttarakhand', 'type' => 'Pilgrim Base Camp'],
    ];

    $uStateStmt = $pdo->prepare("SELECT id FROM states WHERE LOWER(TRIM(state_name)) = 'uttarakhand' LIMIT 1");
    $uStateStmt->execute();
    $uStateId = $uStateStmt->fetchColumn() ?: null;

    foreach ($chardhamCities as $cc) {
        $cStmt = $pdo->prepare("SELECT id, city_name, name FROM cities WHERE LOWER(TRIM(COALESCE(city_name, name))) = LOWER(TRIM(?)) LIMIT 1");
        $cStmt->execute([$cc['name']]);
        $existing = $cStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $upCity = $pdo->prepare("
                UPDATE cities 
                SET city_name = ?, name = ?, state = ?, state_id = ?, country = 'India', country_id = 1, destination_type = ?, active_status = 1 
                WHERE id = ?
            ");
            $upCity->execute([$cc['name'], $cc['name'], $cc['state'], $uStateId, $cc['type'], $existing['id']]);
            echo "• Updated Char Dham city [{$cc['name']}] (ID: {$existing['id']})\n";
        } else {
            $insCity = $pdo->prepare("
                INSERT INTO cities (city_name, name, state, state_id, country, country_id, destination_type, active_status)
                VALUES (?, ?, ?, ?, 'India', 1, ?, 1)
            ");
            $insCity->execute([$cc['name'], $cc['name'], $cc['state'], $uStateId, $cc['type']]);
            $newId = $pdo->lastInsertId();
            echo "• Created Char Dham city [{$cc['name']}] (ID: {$newId})\n";
        }
    }

    // 5. Ensure Gir National Park exists in cities table with Gujarat state_id
    $gStateStmt = $pdo->prepare("SELECT id FROM states WHERE LOWER(TRIM(state_name)) = 'gujarat' LIMIT 1");
    $gStateStmt->execute();
    $gStateId = $gStateStmt->fetchColumn() ?: null;

    $girStmt = $pdo->prepare("SELECT id, city_name, name FROM cities WHERE LOWER(TRIM(COALESCE(city_name, name))) LIKE '%gir%' LIMIT 1");
    $girStmt->execute();
    $girRow = $girStmt->fetch(PDO::FETCH_ASSOC);

    if ($girRow) {
        $upGir = $pdo->prepare("
            UPDATE cities 
            SET city_name = 'Gir National Park', name = 'Gir National Park', state = 'Gujarat', state_id = ?, country = 'India', country_id = 1, destination_type = 'Wildlife & Safari', active_status = 1 
            WHERE id = ?
        ");
        $upGir->execute([$gStateId, $girRow['id']]);
        $girCityId = $girRow['id'];
        echo "• Verified & Standardized Gir National Park (ID: {$girCityId})\n";
    } else {
        $insGir = $pdo->prepare("
            INSERT INTO cities (city_name, name, state, state_id, country, country_id, destination_type, active_status)
            VALUES ('Gir National Park', 'Gir National Park', 'Gujarat', ?, 'India', 1, 'Wildlife & Safari', 1)
        ");
        $insGir->execute([$gStateId]);
        $girCityId = $pdo->lastInsertId();
        echo "• Created Gir National Park (ID: {$girCityId})\n";
    }

    // 6. Ensure Gir National Park Sightseeings & Activities are linked
    $girSightseeings = [
        [
            'id' => 'ss-gir-01',
            'name' => 'Gir Asiatic Lion Open Jeep Safari',
            'dest' => 'Gir National Park',
            'dur' => '3.5 Hours',
            'cost' => 4500.00,
            'desc' => 'The only sanctuary on Earth where you can witness pure Asiatic Lions roaming freely in their natural dry deciduous forest habitat.',
            'img' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'
        ],
        [
            'id' => 'ss-gir-02',
            'name' => 'Devalia Safari Park (Gir Interpretation Zone)',
            'dest' => 'Gir National Park',
            'dur' => '2 Hours',
            'cost' => 350.00,
            'desc' => 'Fenced interpretation zone offering assured sightings of Asiatic lions, leopards, sambar deer, and spotted chital.',
            'img' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'
        ],
        [
            'id' => 'ss-gir-03',
            'name' => 'Kamleshwar Dam Crocodile Sanctuary',
            'dest' => 'Gir National Park',
            'dur' => '1.5 Hours',
            'cost' => 0.00,
            'desc' => 'Scenic reservoir in the heart of Gir forest known as the breeding sanctuary of marsh mugger crocodiles and migratory birds.',
            'img' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'
        ]
    ];

    $ssIns = $pdo->prepare("
        INSERT INTO sightseeings (id, sightseeing_name, city_id, destination, duration, description, image_url, adult_cost, child_cost, state_id, country_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE 
            sightseeing_name = VALUES(sightseeing_name),
            city_id = VALUES(city_id),
            destination = VALUES(destination),
            duration = VALUES(duration),
            description = VALUES(description),
            image_url = VALUES(image_url),
            adult_cost = VALUES(adult_cost),
            child_cost = VALUES(child_cost),
            state_id = VALUES(state_id),
            country_id = 1
    ");

    foreach ($girSightseeings as $gss) {
        $ssIns->execute([
            $gss['id'], $gss['name'], $girCityId, $gss['dest'], $gss['dur'],
            $gss['desc'], $gss['img'], $gss['cost'], $gss['cost'], $gStateId
        ]);
        echo "• Seeded Gir Sightseeing: {$gss['name']}\n";
    }

    $girActivities = [
        [
            'id' => 'act-gir-01',
            'name' => 'Gir Forest Department Core Zone Lion Jeep Safari Drive',
            'cat' => 'Wildlife Safari',
            'dur' => '3.5 Hours',
            'cost' => 4500.00
        ],
        [
            'id' => 'act-gir-02',
            'name' => 'Sasan Gir Birdwatching & Forest Nature Trail Walk',
            'cat' => 'Eco Adventure',
            'dur' => '2 Hours',
            'cost' => 800.00
        ]
    ];

    $actIns = $pdo->prepare("
        INSERT INTO activities (id, activity_name, city_id, destination, duration, adult_cost, child_cost, activity_category, active_status, country_name, state_name, city, state_id, country_id)
        VALUES (?, ?, ?, 'Gir National Park', ?, ?, ?, ?, 1, 'India', 'Gujarat', 'Gir National Park', ?, 1)
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
            state_name = 'Gujarat',
            city = 'Gir National Park',
            state_id = VALUES(state_id),
            country_id = 1
    ");

    foreach ($girActivities as $gact) {
        $actIns->execute([
            $gact['id'], $gact['name'], $girCityId, $gact['dur'],
            $gact['cost'], $gact['cost'], $gact['cat'], $gStateId
        ]);
        echo "• Seeded Gir Activity: {$gact['name']}\n";
    }

    // 7. Ensure Rann of Kutch (Dhordo) is created and standardized under Gujarat
    $kutchStmt = $pdo->prepare("
        SELECT id FROM cities 
        WHERE LOWER(COALESCE(city_name, name)) LIKE '%rann of kutch%' 
           OR LOWER(COALESCE(city_name, name)) LIKE '%kutch%'
           OR LOWER(COALESCE(city_name, name)) LIKE '%dhordo%'
        LIMIT 1
    ");
    $kutchStmt->execute();
    $kutchRow = $kutchStmt->fetch(PDO::FETCH_ASSOC);

    if ($kutchRow) {
        $upKutch = $pdo->prepare("
            UPDATE cities 
            SET city_name = 'Rann of Kutch (Dhordo / Kutch)',
                name = 'Rann of Kutch (Dhordo / Kutch)',
                state = 'Gujarat',
                state_id = ?,
                country = 'India',
                country_id = 1,
                destination_type = 'White Desert & Heritage',
                active_status = 1
            WHERE id = ?
        ");
        $upKutch->execute([$gStateId, $kutchRow['id']]);
        $kutchCityId = $kutchRow['id'];
        echo "• Verified & Standardized Rann of Kutch (ID: {$kutchCityId})\n";
    } else {
        $insKutch = $pdo->prepare("
            INSERT INTO cities (city_name, name, state, state_id, country, country_id, destination_type, active_status)
            VALUES ('Rann of Kutch (Dhordo / Kutch)', 'Rann of Kutch (Dhordo / Kutch)', 'Gujarat', ?, 'India', 1, 'White Desert & Heritage', 1)
        ");
        $insKutch->execute([$gStateId]);
        $kutchCityId = $pdo->lastInsertId();
        echo "• Created Rann of Kutch (ID: {$kutchCityId})\n";
    }

    $kutchSightseeings = [
        [
            'id' => 'ss-kutch-01',
            'name' => 'Walk the White Desert at Sunset & Full Moon',
            'dest' => 'Rann of Kutch',
            'dur' => '2.5 Hours',
            'cost' => 0.00,
            'desc' => 'The vast salt flats reflect shifting colors of lavender, orange, and gold. Breathtaking on full moon nights when the salt turns silver.',
            'img' => 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=600'
        ],
        [
            'id' => 'ss-kutch-02',
            'name' => 'Kalo Dungar (Black Hill, 1,516 ft) & Dattatreya Temple',
            'dest' => 'Rann of Kutch',
            'dur' => '3.5 Hours',
            'cost' => 0.00,
            'desc' => 'Highest point in Kutch with sweeping views across the entire Rann. Home to a 400-year-old temple where priests feed wild jackals.',
            'img' => 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=600'
        ],
        [
            'id' => 'ss-kutch-03',
            'name' => 'Aina Mahal & Prag Mahal Clock Tower, Bhuj',
            'dest' => 'Bhuj',
            'dur' => '2.5 Hours',
            'cost' => 100.00,
            'desc' => '18th-century Hall of Mirrors with Venetian glass next to Prag Mahal Italian Gothic clock tower overlooking old Bhuj.',
            'img' => 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=600'
        ],
        [
            'id' => 'ss-kutch-04',
            'name' => 'Kutch Museum, Bhuj (Estd. 1877)',
            'dest' => 'Bhuj',
            'dur' => '2 Hours',
            'cost' => 50.00,
            'desc' => 'Gujarat\'s oldest museum housing 1st-century Kshatrapa inscriptions, extinct Kutchi script, Kori coins, and tribal crafts.',
            'img' => 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=600'
        ],
        [
            'id' => 'ss-kutch-05',
            'name' => 'Bhujodi Textile Craft Village & Vankar Weavers',
            'dest' => 'Bhujodi',
            'dur' => '2.5 Hours',
            'cost' => 0.00,
            'desc' => 'Generations of master handloom weavers producing intricate shawls, carpets, and tie-dye Bandhani fabrics.',
            'img' => 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=600'
        ],
        [
            'id' => 'ss-kutch-06',
            'name' => 'Vijay Vilas Palace & Private Beach, Mandvi',
            'dest' => 'Mandvi',
            'dur' => '3 Hours',
            'cost' => 100.00,
            'desc' => 'Early 20th-century royal sandstone palace set in gardens beside a private beach, famous Bollywood filming location.',
            'img' => 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=600'
        ],
        [
            'id' => 'ss-kutch-07',
            'name' => 'Lakhpat Walled Fort & Historic Gurudwara Sahib',
            'dest' => 'Lakhpat',
            'dur' => '3 Hours',
            'cost' => 0.00,
            'desc' => 'Historic fort citadel near Pakistan border with ancient ramparts and a Gurudwara linked to Guru Nanak\'s travels.',
            'img' => 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=600'
        ],
        [
            'id' => 'ss-kutch-08',
            'name' => 'Mata no Madh (Ashapura Temple)',
            'dest' => 'Mata no Madh',
            'dur' => '2 Hours',
            'cost' => 0.00,
            'desc' => 'Major pilgrimage shrine dedicated to Goddess Ashapura, patron deity of the Kutch royal family.',
            'img' => 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=600'
        ],
        [
            'id' => 'ss-kutch-09',
            'name' => 'Koteshwar Mahadev Temple & Narayan Sarovar',
            'dest' => 'Koteshwar',
            'dur' => '2.5 Hours',
            'cost' => 0.00,
            'desc' => 'Ancient coastal Shiva temple at India\'s westernmost point beside holy Narayan Sarovar.',
            'img' => 'https://images.unsplash.com/photo-1578922746465-3a80a228f223?w=600'
        ]
    ];

    foreach ($kutchSightseeings as $kss) {
        $ssIns->execute([
            $kss['id'], $kss['name'], $kutchCityId, $kss['dest'], $kss['dur'],
            $kss['desc'], $kss['img'], $kss['cost'], $kss['cost'], $gStateId
        ]);
        echo "• Seeded Kutch Sightseeing: {$kss['name']}\n";
    }

    $kutchActivities = [
        [
            'id' => 'act-kutch-01',
            'name' => 'Rann Utsav Tent City Experience & Cultural Shows',
            'dur' => '2 Nights / 3 Days',
            'cost' => 13500.00,
            'cat' => 'Festival & Luxury Stay'
        ],
        [
            'id' => 'act-kutch-02',
            'name' => 'White Desert Open Jeep & Camel Safaris',
            'dur' => '1.5 Hours',
            'cost' => 800.00,
            'cat' => 'Desert Safari'
        ]
    ];

    foreach ($kutchActivities as $kact) {
        $actIns->execute([
            $kact['id'], $kact['name'], $kutchCityId, $kact['dur'],
            $kact['cost'], $kact['cost'], $kact['cat'], $gStateId
        ]);
        echo "• Seeded Kutch Activity: {$kact['name']}\n";
    }

    // 8. Clean unlinked null-name orphaned city records
    $del = $pdo->exec("
        DELETE FROM cities 
        WHERE (city_name IS NULL OR TRIM(city_name) = '') 
          AND (name IS NULL OR TRIM(name) = '')
          AND id NOT IN (SELECT DISTINCT city_id FROM sightseeings WHERE city_id IS NOT NULL)
          AND id NOT IN (SELECT DISTINCT city_id FROM activities WHERE city_id IS NOT NULL)
          AND id NOT IN (SELECT DISTINCT city_id FROM hotels WHERE city_id IS NOT NULL)
    ");
    echo "• Cleaned {$del} unlinked null-name orphaned city records.\n";

    echo "\n=== ALL DATABASE DESTINATIONS REPAIRED & SYNCHRONIZED SUCCESSFULLY ===\n";

} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
