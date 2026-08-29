<?php
// php-backend/migrations/20260815_seed_master_sightseeings_and_activities.php
// Master Migration & Seeder script: Seed 60+ Sightseeings & Activities across Kashmir, Ladakh, Himachal, Rajasthan, Kerala, Goa, Andaman, Golden Triangle, Dubai, Thailand, Bali, Vietnam, Singapore, and Maldives.

require_once __DIR__ . '/../db.php';

try {
    $pdo = getDb();
    echo "=== MASTER SEEDER: EXPANDING SIGHTSEEINGS & ACTIVITIES CATALOG ===\n\n";

    // 1. Standardize & Ensure Master Destinations in `cities` table
    $destinationsToSeed = [
        // Kashmir & Ladakh
        ['name' => 'Srinagar', 'state' => 'Jammu and Kashmir', 'country' => 'India'],
        ['name' => 'Gulmarg', 'state' => 'Jammu and Kashmir', 'country' => 'India'],
        ['name' => 'Pahalgam', 'state' => 'Jammu and Kashmir', 'country' => 'India'],
        ['name' => 'Sonamarg', 'state' => 'Jammu and Kashmir', 'country' => 'India'],
        ['name' => 'Leh', 'state' => 'Ladakh', 'country' => 'India'],
        ['name' => 'Nubra Valley', 'state' => 'Ladakh', 'country' => 'India'],
        ['name' => 'Pangong Tso', 'state' => 'Ladakh', 'country' => 'India'],

        // Himachal Pradesh
        ['name' => 'Manali', 'state' => 'Himachal Pradesh', 'country' => 'India'],
        ['name' => 'Shimla', 'state' => 'Himachal Pradesh', 'country' => 'India'],
        ['name' => 'Dharamshala', 'state' => 'Himachal Pradesh', 'country' => 'India'],
        ['name' => 'Dalhousie', 'state' => 'Himachal Pradesh', 'country' => 'India'],

        // Rajasthan
        ['name' => 'Jaipur', 'state' => 'Rajasthan', 'country' => 'India'],
        ['name' => 'Udaipur', 'state' => 'Rajasthan', 'country' => 'India'],
        ['name' => 'Jaisalmer', 'state' => 'Rajasthan', 'country' => 'India'],
        ['name' => 'Jodhpur', 'state' => 'Rajasthan', 'country' => 'India'],

        // Kerala
        ['name' => 'Munnar', 'state' => 'Kerala', 'country' => 'India'],
        ['name' => 'Alleppey', 'state' => 'Kerala', 'country' => 'India'],
        ['name' => 'Thekkady', 'state' => 'Kerala', 'country' => 'India'],
        ['name' => 'Kochi', 'state' => 'Kerala', 'country' => 'India'],

        // Goa
        ['name' => 'North Goa', 'state' => 'Goa', 'country' => 'India'],
        ['name' => 'South Goa', 'state' => 'Goa', 'country' => 'India'],

        // Andaman Islands
        ['name' => 'Port Blair', 'state' => 'Andaman and Nicobar', 'country' => 'India'],
        ['name' => 'Havelock Island', 'state' => 'Andaman and Nicobar', 'country' => 'India'],

        // Golden Triangle & North India
        ['name' => 'New Delhi', 'state' => 'Delhi', 'country' => 'India'],
        ['name' => 'Agra', 'state' => 'Uttar Pradesh', 'country' => 'India'],
        ['name' => 'Varanasi', 'state' => 'Uttar Pradesh', 'country' => 'India'],

        // Gujarat & Kutch
        ['name' => 'Ahmedabad', 'state' => 'Gujarat', 'country' => 'India'],
        ['name' => 'Kevadia (Statue of Unity)', 'state' => 'Gujarat', 'country' => 'India'],

        // International Regions
        ['name' => 'Dubai', 'state' => 'Dubai Region', 'country' => 'United Arab Emirates'],
        ['name' => 'Abu Dhabi', 'state' => 'Abu Dhabi Region', 'country' => 'United Arab Emirates'],
        ['name' => 'Bangkok', 'state' => 'Bangkok Region', 'country' => 'Thailand'],
        ['name' => 'Pattaya', 'state' => 'Chonburi Region', 'country' => 'Thailand'],
        ['name' => 'Phuket', 'state' => 'Phuket Region', 'country' => 'Thailand'],
        ['name' => 'Singapore', 'state' => 'Singapore Region', 'country' => 'Singapore'],
        ['name' => 'Sentosa Island', 'state' => 'Singapore Region', 'country' => 'Singapore'],
        ['name' => 'Ubud', 'state' => 'Bali', 'country' => 'Indonesia'],
        ['name' => 'Nusa Penida', 'state' => 'Bali', 'country' => 'Indonesia'],
        ['name' => 'Hanoi', 'state' => 'Hanoi Region', 'country' => 'Vietnam'],
        ['name' => 'Ha Long Bay', 'state' => 'Quang Ninh', 'country' => 'Vietnam'],
        ['name' => 'Da Nang', 'state' => 'Da Nang Region', 'country' => 'Vietnam'],
        ['name' => 'Male', 'state' => 'Male Region', 'country' => 'Maldives'],
    ];

    $cityMap = [];
    foreach ($destinationsToSeed as $d) {
        $stmt = $pdo->prepare("SELECT id FROM cities WHERE LOWER(name) = LOWER(?) LIMIT 1");
        $stmt->execute([$d['name']]);
        $existingId = $stmt->fetchColumn();

        if ($existingId) {
            $up = $pdo->prepare("UPDATE cities SET state = ?, country = ? WHERE id = ?");
            $up->execute([$d['state'], $d['country'], $existingId]);
            $cityMap[$d['name']] = (int)$existingId;
        } else {
            $ins = $pdo->prepare("INSERT INTO cities (name, state, country) VALUES (?, ?, ?)");
            $ins->execute([$d['name'], $d['state'], $d['country']]);
            $newId = (int)$pdo->lastInsertId();
            $cityMap[$d['name']] = $newId;
        }
    }
    echo "• Verified & Standardized " . count($cityMap) . " master cities across India & International destinations.\n\n";

    // 2. Seed Master Sightseeings
    echo "--- SEEDING MASTER SIGHTSEEINGS --- \n";
    $masterSightseeings = [
        // Kashmir
        ['id' => 'ss-ks-01', 'name' => 'Dal Lake & Floating Market', 'city' => 'Srinagar', 'dest' => 'Srinagar', 'dur' => '3 Hours', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1566838334-a6dd-a8bb7e5b1657?w=600', 'desc' => 'Jewel of Srinagar featuring traditional wooden houseboats, lotus gardens, and early morning floating vegetable market.'],
        ['id' => 'ss-ks-02', 'name' => 'Nishat Bagh & Shalimar Mughal Gardens', 'city' => 'Srinagar', 'dest' => 'Srinagar', 'dur' => '2 Hours', 'cost' => 50.00, 'img' => 'https://images.unsplash.com/photo-1566838334-a6dd-a8bb7e5b1657?w=600', 'desc' => 'Terraced Mughal gardens built by Emperor Jahangir along the banks of Dal Lake.'],
        ['id' => 'ss-ks-03', 'name' => 'Gulmarg Golf Course & Pine Meadow', 'city' => 'Gulmarg', 'dest' => 'Gulmarg', 'dur' => 'Full Day', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600', 'desc' => 'High-altitude snow meadow and world\'s highest 18-hole golf course at 8,690 ft.'],
        ['id' => 'ss-ks-04', 'name' => 'Betaab Valley & Aru Valley', 'city' => 'Pahalgam', 'dest' => 'Pahalgam', 'dur' => 'Full Day', 'cost' => 100.00, 'img' => 'https://images.unsplash.com/photo-1626490807897-bc5e0cd2a6b0?w=600', 'desc' => 'Picturesque valley named after Bollywood movie Betaab surrounded by pine forests and Lidder river.'],
        ['id' => 'ss-ks-05', 'name' => 'Thajiwas Glacier', 'city' => 'Sonamarg', 'dest' => 'Sonamarg', 'dur' => '4 Hours', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600', 'desc' => 'Stunning snow glacier located 3 km from Sonamarg, offering sledge rides and ice trekking.'],

        // Ladakh
        ['id' => 'ss-ld-01', 'name' => 'Pangong Tso High Altitude Blue Lake', 'city' => 'Pangong Tso', 'dest' => 'Leh Ladakh', 'dur' => 'Full Day', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600', 'desc' => 'Famous 134km long high-altitude endorheic lake changing colors from blue to turquoise at 14,270 ft.'],
        ['id' => 'ss-ld-02', 'name' => 'Hunder Sand Dunes & Bactrian Camel Reserve', 'city' => 'Nubra Valley', 'dest' => 'Leh Ladakh', 'dur' => 'Half Day', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600', 'desc' => 'High-altitude cold desert dunes famous for double-humped Bactrian camels.'],
        ['id' => 'ss-ld-03', 'name' => 'Shanti Stupa & Leh Palace', 'city' => 'Leh', 'dest' => 'Leh Ladakh', 'dur' => '3 Hours', 'cost' => 50.00, 'img' => 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=600', 'desc' => 'White-domed Buddhist stupa offering 360-degree panoramic sunset views of Leh town.'],

        // Himachal Pradesh
        ['id' => 'ss-hp-01', 'name' => 'Solang Valley & Rohtang Pass Viewpoint', 'city' => 'Manali', 'dest' => 'Manali', 'dur' => 'Full Day', 'cost' => 500.00, 'img' => 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600', 'desc' => 'Adventure hub of Himachal offering snow sports, paragliding, skiing & quad biking.'],
        ['id' => 'ss-hp-02', 'name' => 'Hadimba Temple & Van Vihar', 'city' => 'Manali', 'dest' => 'Manali', 'dur' => '2 Hours', 'cost' => 50.00, 'img' => 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600', 'desc' => 'Ancient wooden pagoda temple built in 1553 surrounded by cedar deodar forests.'],
        ['id' => 'ss-hp-03', 'name' => 'Mall Road & Ridge Shimla', 'city' => 'Shimla', 'dest' => 'Shimla', 'dur' => '3 Hours', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600', 'desc' => 'Historic British colonial promenade and pedestrian shopping boulevard.'],
        ['id' => 'ss-hp-04', 'name' => 'Dalai Lama Temple & McLeod Ganj', 'city' => 'Dharamshala', 'dest' => 'Dharamshala', 'dur' => '3 Hours', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600', 'desc' => 'Official Residence of H.H. Dalai Lama and spiritual Tibetan monastic sanctuary.'],

        // Rajasthan
        ['id' => 'ss-rj-01', 'name' => 'Amber Fort & Sheesh Mahal', 'city' => 'Jaipur', 'dest' => 'Jaipur', 'dur' => '3 Hours', 'cost' => 200.00, 'img' => 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600', 'desc' => 'Majestic hilltop fort built of red sandstone and marble, featuring the shimmering Mirror Palace.'],
        ['id' => 'ss-rj-02', 'name' => 'Hawa Mahal (Palace of Winds)', 'city' => 'Jaipur', 'dest' => 'Jaipur', 'dur' => '1 Hour', 'cost' => 50.00, 'img' => 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600', 'desc' => 'Iconic 5-story pink honeycomb palace with 953 intricate jharokha lattice windows.'],
        ['id' => 'ss-rj-03', 'name' => 'City Palace & Lake Pichola Boat Jetty', 'city' => 'Udaipur', 'dest' => 'Udaipur', 'dur' => '3 Hours', 'cost' => 300.00, 'img' => 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=600', 'desc' => 'Grand royal palace complex overlooking Lake Pichola and Taj Lake Palace.'],
        ['id' => 'ss-rj-04', 'name' => 'Jaisalmer Golden Fort (Sonar Qila)', 'city' => 'Jaisalmer', 'dest' => 'Jaisalmer', 'dur' => '3 Hours', 'cost' => 100.00, 'img' => 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600', 'desc' => 'World\'s only living yellow sandstone fort housing thousands of residents & Jain temples.'],
        ['id' => 'ss-rj-05', 'name' => 'Mehrangarh Fort Jodhpur', 'city' => 'Jodhpur', 'dest' => 'Jodhpur', 'dur' => '3 Hours', 'cost' => 200.00, 'img' => 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600', 'desc' => 'Towering 410-foot citadel overlooking the famous Blue City of Jodhpur.'],

        // Kerala
        ['id' => 'ss-kl-01', 'name' => 'Tea Gardens & Eravikulam National Park', 'city' => 'Munnar', 'dest' => 'Munnar', 'dur' => 'Full Day', 'cost' => 200.00, 'img' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600', 'desc' => 'Rolling green tea plantations and sanctuary of endangered Nilgiri Tahr mountain goats.'],
        ['id' => 'ss-kl-04', 'name' => 'Mattupetty Dam & Speed Boating', 'city' => 'Munnar', 'dest' => 'Munnar', 'dur' => 'Half Day', 'cost' => 500.00, 'img' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600', 'desc' => 'Picturesque dam featuring high-speed motorboats, natural Echo Point sound, and tea garden hills.'],
        ['id' => 'ss-kl-05', 'name' => 'Carmelagiri Elephant Park & Safari', 'city' => 'Munnar', 'dest' => 'Munnar', 'dur' => '2 Hours', 'cost' => 400.00, 'img' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600', 'desc' => 'Private elephant park providing guided forest trail rides, elephant fruit feeding & family photos.'],
        ['id' => 'ss-kl-06', 'name' => 'Kolukkumalai 4x4 Off-Road Jeep Safari', 'city' => 'Munnar', 'dest' => 'Munnar', 'dur' => 'Half Day', 'cost' => 3000.00, 'img' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600', 'desc' => 'Exhilarating 4x4 jeep drive to the world\'s highest organic tea estate (7,900 ft) for cloud-sea sunrise.'],
        ['id' => 'ss-kl-07', 'name' => 'Wonder Valley Adventure Park & Zipline', 'city' => 'Munnar', 'dest' => 'Munnar', 'dur' => 'Full Day', 'cost' => 1000.00, 'img' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600', 'desc' => 'Eco-adventure park with high-line canopy ziplining, 12D motion theater, rock climbing & rope courses.'],
        ['id' => 'ss-kl-02', 'name' => 'Alleppey Backwaters & Houseboat Cruise', 'city' => 'Alleppey', 'dest' => 'Alleppey', 'dur' => 'Full Day', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600', 'desc' => 'Tranquil palm-fringed canal network dotted with traditional Kettuvallam houseboats.'],
        ['id' => 'ss-kl-03', 'name' => 'Periyar Tiger Reserve & Spice Plantation', 'city' => 'Thekkady', 'dest' => 'Thekkady', 'dur' => 'Half Day', 'cost' => 250.00, 'img' => 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600', 'desc' => 'Protected wildlife sanctuary famous for wild elephants, cardamom, and clove gardens.'],

        // Goa & Andaman
        ['id' => 'ss-ga-01', 'name' => 'Fort Aguada & Calangute Beach', 'city' => 'North Goa', 'dest' => 'Goa', 'dur' => 'Half Day', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600', 'desc' => '17th-century Portuguese lighthouse fort overlooking Arabian Sea beaches.'],
        ['id' => 'ss-an-01', 'name' => 'Radhanagar Beach (Beach No. 7)', 'city' => 'Havelock Island', 'dest' => 'Andaman', 'dur' => 'Half Day', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', 'desc' => 'Voted Asia\'s best beach, featuring turquoise waters and powdery white sand.'],
        ['id' => 'ss-an-02', 'name' => 'Cellular Jail & Light Show', 'city' => 'Port Blair', 'dest' => 'Andaman', 'dur' => '2 Hours', 'cost' => 150.00, 'img' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', 'desc' => 'Historic colonial prison turned national memorial honoring Indian freedom fighters.'],

        // Golden Triangle & Agra
        ['id' => 'ss-gt-01', 'name' => 'Taj Mahal & Agra Fort', 'city' => 'Agra', 'dest' => 'Agra', 'dur' => 'Half Day', 'cost' => 250.00, 'img' => 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600', 'desc' => 'World-famous white marble mausoleum built by Emperor Shah Jahan for Mumtaz Mahal.'],
        ['id' => 'ss-gt-02', 'name' => 'Qutub Minar & India Gate', 'city' => 'New Delhi', 'dest' => 'Delhi', 'dur' => 'Half Day', 'cost' => 50.00, 'img' => 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600', 'desc' => '73m UNESCO World Heritage brick minaret and India Gate war memorial.'],

        // Gujarat & Statue of Unity
        ['id' => 'ss-gj-01', 'name' => 'Statue of Unity & Viewing Gallery', 'city' => 'Kevadia (Statue of Unity)', 'dest' => 'Gujarat', 'dur' => 'Full Day', 'cost' => 380.00, 'img' => 'https://images.unsplash.com/photo-1600100397608-f09070a74797?w=600', 'desc' => 'World\'s tallest statue (182m) honoring Sardar Vallabhbhai Patel with high-speed elevator gallery.'],

        // Dubai & International
        ['id' => 'ss-dxb-01', 'name' => 'Burj Khalifa At The Top (124th Floor)', 'city' => 'Dubai', 'dest' => 'Dubai', 'dur' => '2 Hours', 'cost' => 3800.00, 'img' => 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', 'desc' => 'World\'s tallest tower (828m) featuring high-speed observation deck overlooking Dubai skyline.'],
        ['id' => 'ss-dxb-02', 'name' => 'Grand Sheikh Zayed Mosque', 'city' => 'Abu Dhabi', 'dest' => 'Abu Dhabi', 'dur' => '3 Hours', 'cost' => 0.00, 'img' => 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', 'desc' => 'Architectural marvel of pure white marble, Swarovski chandeliers, and world\'s largest carpet.'],

        // Thailand & Singapore
        ['id' => 'ss-th-01', 'name' => 'Grand Palace & Emerald Buddha Temple', 'city' => 'Bangkok', 'dest' => 'Bangkok', 'dur' => '3 Hours', 'cost' => 1200.00, 'img' => 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600', 'desc' => 'Official residence of Kings of Siam housing sacred Wat Phra Kaew Emerald Buddha.'],
        ['id' => 'ss-th-02', 'name' => 'Phi Phi Islands & Maya Bay Speedboat Tour', 'city' => 'Phuket', 'dest' => 'Phuket', 'dur' => 'Full Day', 'cost' => 2800.00, 'img' => 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', 'desc' => 'Iconic limestone karsts, emerald lagoons & Maya Bay beach featured in The Beach movie.'],
        ['id' => 'ss-sg-01', 'name' => 'Gardens by the Bay & Supertree Grove', 'city' => 'Singapore', 'dest' => 'Singapore', 'dur' => '3 Hours', 'cost' => 1800.00, 'img' => 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600', 'desc' => 'Futuristic 101-hectare nature park featuring 50m Supertrees and Cloud Forest Dome.'],
        ['id' => 'ss-sg-02', 'name' => 'Universal Studios Singapore', 'city' => 'Sentosa Island', 'dest' => 'Singapore', 'dur' => 'Full Day', 'cost' => 4500.00, 'img' => 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600', 'desc' => 'Southeast Asia\'s premier movie theme park with 24 rides across 7 themed zones.'],

        // Bali, Vietnam & Maldives
        ['id' => 'ss-bali-01', 'name' => 'Ubud Sacred Monkey Forest & Rice Terraces', 'city' => 'Ubud', 'dest' => 'Bali', 'dur' => 'Half Day', 'cost' => 500.00, 'img' => 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', 'desc' => 'Lush jungle sanctuary housing 700 Balinese long-tailed macaques and Tegallalang terraces.'],
        ['id' => 'ss-bali-02', 'name' => 'Kelingking Beach & Broken Beach Nusa Penida', 'city' => 'Nusa Penida', 'dest' => 'Bali', 'dur' => 'Full Day', 'cost' => 1200.00, 'img' => 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', 'desc' => 'World-famous T-Rex shaped cliff view overlooking turquoise ocean waters.'],
        ['id' => 'ss-vn-01', 'name' => 'Ha Long Bay UNESCO Cruise & Cave Discovery', 'city' => 'Ha Long Bay', 'dest' => 'Vietnam', 'dur' => 'Full Day', 'cost' => 3200.00, 'img' => 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600', 'desc' => 'Cruising through 1,600 towering limestone islets and Sung Sot Surprise Cave.'],
        ['id' => 'ss-mv-01', 'name' => 'Maafushi Coral Reef Snorkeling & Dolphin Cruise', 'city' => 'Male', 'dest' => 'Maldives', 'dur' => 'Full Day', 'cost' => 4200.00, 'img' => 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600', 'desc' => 'Guided snorkeling over vibrant coral reefs with sea turtles, stingrays & spinner dolphins.'],
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

    $ssCount = 0;
    foreach ($masterSightseeings as $s) {
        $cId = $cityMap[$s['city']] ?? null;
        $ssIns->execute([$s['id'], $s['name'], $cId, $s['dest'], $s['dur'], $s['desc'], $s['img'], $s['cost'], $s['cost']]);
        $ssCount++;
    }
    echo "• Successfully Seeded {$ssCount} Master Sightseeings across all regions!\n\n";

    // 3. Seed Master Activities
    echo "--- SEEDING MASTER ACTIVITIES --- \n";
    $masterActivities = [
        ['id' => 'act-ks-01', 'name' => 'Shikara Sunset Ride on Dal Lake', 'city' => 'Srinagar', 'cost' => 800.00, 'cat' => 'activity'],
        ['id' => 'act-ks-02', 'name' => 'Gulmarg Gondola Cable Car Ride (Phase 1 & Phase 2)', 'city' => 'Gulmarg', 'cost' => 1750.00, 'cat' => 'entry_ticket'],
        ['id' => 'act-ks-03', 'name' => 'Baisaran Valley Mini-Switzerland Pony Trek', 'city' => 'Pahalgam', 'cost' => 1500.00, 'cat' => 'activity'],

        ['id' => 'act-ld-01', 'name' => 'Double Humped Camel Ride at Hunder Dunes', 'city' => 'Nubra Valley', 'cost' => 600.00, 'cat' => 'activity'],
        ['id' => 'act-ld-02', 'name' => 'Khardung La Pass 17,982 ft High-Altitude Photography', 'city' => 'Leh', 'cost' => 0.00, 'cat' => 'sightseeing'],

        ['id' => 'act-hp-01', 'name' => 'Solang Valley Tandem Paragliding & Cable Car', 'city' => 'Manali', 'cost' => 2500.00, 'cat' => 'adventure'],
        ['id' => 'act-hp-02', 'name' => 'Jakhoo Temple Ropeway Ride Shimla', 'city' => 'Shimla', 'cost' => 500.00, 'cat' => 'entry_ticket'],

        ['id' => 'act-rj-01', 'name' => 'Elephant / Jeep Safari to Amber Fort', 'city' => 'Jaipur', 'cost' => 1100.00, 'cat' => 'activity'],
        ['id' => 'act-rj-02', 'name' => 'Lake Pichola Sunset Boat Cruise', 'city' => 'Udaipur', 'cost' => 800.00, 'cat' => 'activity'],
        ['id' => 'act-rj-03', 'name' => 'Sam Sand Dunes Camel Safari & Cultural Folk Night', 'city' => 'Jaisalmer', 'cost' => 1800.00, 'cat' => 'activity'],

        ['id' => 'act-kl-01', 'name' => 'Kalaripayattu Martial Arts & Kathakali Show', 'city' => 'Thekkady', 'cost' => 400.00, 'cat' => 'show'],
        ['id' => 'act-kl-02', 'name' => 'Overnight Houseboat Backwater Cruise with All Meals', 'city' => 'Alleppey', 'cost' => 6500.00, 'cat' => 'activity'],
        ['id' => 'act-kl-03', 'name' => 'Mattupetty Dam High-Speed Motorboat Ride', 'city' => 'Munnar', 'cost' => 500.00, 'cat' => 'activity'],
        ['id' => 'act-kl-04', 'name' => 'Carmelagiri Forest Trail Elephant Ride', 'city' => 'Munnar', 'cost' => 400.00, 'cat' => 'activity'],
        ['id' => 'act-kl-05', 'name' => 'Kolukkumalai 4x4 Off-Road Sunrise Jeep Safari', 'city' => 'Munnar', 'cost' => 3000.00, 'cat' => 'adventure'],
        ['id' => 'act-kl-06', 'name' => 'Wonder Valley Zipline & High Rope Adventure Pass', 'city' => 'Munnar', 'cost' => 1000.00, 'cat' => 'adventure'],

        ['id' => 'act-ga-01', 'name' => 'Mandovi River Sunset Cruise with Goan Folk Dance', 'city' => 'North Goa', 'cost' => 700.00, 'cat' => 'activity'],
        ['id' => 'act-an-01', 'name' => 'Elephant Beach Scuba Diving & Sea Walk', 'city' => 'Havelock Island', 'cost' => 3500.00, 'cat' => 'adventure'],

        ['id' => 'act-gt-01', 'name' => 'Taj Mahal Skip-the-Line Entry Ticket', 'city' => 'Agra', 'cost' => 1100.00, 'cat' => 'entry_ticket'],

        ['id' => 'act-dxb-01', 'name' => 'Dubai Desert Safari with Dune Bashing & BBQ Dinner', 'city' => 'Dubai', 'cost' => 2400.00, 'cat' => 'activity'],
        ['id' => 'act-dxb-02', 'name' => 'Marina Dhow Dinner Cruise with Tanoura Show', 'city' => 'Dubai', 'cost' => 1800.00, 'cat' => 'activity'],

        ['id' => 'act-th-01', 'name' => 'Chao Phraya Princess River Dinner Cruise', 'city' => 'Bangkok', 'cost' => 1900.00, 'cat' => 'activity'],
        ['id' => 'act-th-02', 'name' => 'Coral Island Speedboat Tour & Parasailing', 'city' => 'Pattaya', 'cost' => 1600.00, 'cat' => 'adventure'],

        ['id' => 'act-sg-01', 'name' => 'Night Safari Tram Ride & Creature Show', 'city' => 'Singapore', 'cost' => 3200.00, 'cat' => 'entry_ticket'],
        ['id' => 'act-bali-01', 'name' => 'Ayung River White Water Rafting & Jungle Swing', 'city' => 'Ubud', 'cost' => 2200.00, 'cat' => 'adventure'],
        ['id' => 'act-vn-01', 'name' => 'Ba Na Hills Cable Car & Golden Hands Bridge Ticket', 'city' => 'Da Nang', 'cost' => 2800.00, 'cat' => 'entry_ticket'],
        ['id' => 'act-mv-01', 'name' => 'Manta Ray & Nurse Shark Snorkeling Safari', 'city' => 'Male', 'cost' => 4800.00, 'cat' => 'adventure'],
    ];

    $actIns = $pdo->prepare("
        INSERT INTO activities (id, activity_name, city_id, destination, duration, adult_cost, child_cost, activity_category, active_status, country_name, state_name, city)
        VALUES (?, ?, ?, ?, '3 Hours', ?, ?, ?, 1, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            activity_name = VALUES(activity_name),
            city_id = VALUES(city_id),
            destination = VALUES(destination),
            adult_cost = VALUES(adult_cost),
            child_cost = VALUES(child_cost),
            activity_category = VALUES(activity_category),
            active_status = 1,
            country_name = VALUES(country_name),
            state_name = VALUES(state_name),
            city = VALUES(city)
    ");

    $actCount = 0;
    foreach ($masterActivities as $a) {
        $cId = $cityMap[$a['city']] ?? null;
        $cState = 'State';
        $cCountry = 'Country';
        foreach ($destinationsToSeed as $d) {
            if ($d['name'] === $a['city']) {
                $cState = $d['state'];
                $cCountry = $d['country'];
                break;
            }
        }
        $actIns->execute([$a['id'], $a['name'], $cId, $a['city'], $a['cost'], $a['cost'], $a['cat'], $cCountry, $cState, $a['city']]);
        $actCount++;
    }
    echo "• Successfully Seeded {$actCount} Master Activities across all regions!\n\n";

    echo "=== MASTER SIGHTSEEINGS & ACTIVITIES SEEDING COMPLETED SUCCESSFULLY ===\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
