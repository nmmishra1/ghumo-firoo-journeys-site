<?php
header('Content-Type: application/json');
require_once 'd:/Personal/ghumo-firoo-journeys-site/ghumo-firoo-journeys-site/php-backend/db.php';

try {
    $pdo = getDb();

    $parsedJsonPath = 'C:/Users/admin/.gemini/antigravity/brain/5976d37f-e5dd-4e36-91fc-27a532892aa4/scratch/parsed_hotels.json';
    if (!file_exists($parsedJsonPath)) {
        throw new Exception("Parsed JSON not found at $parsedJsonPath");
    }

    $allData = json_decode(file_get_contents($parsedJsonPath), true);
    $keralaHotels = $allData['kerala'] ?? [];
    $rannHotels = $allData['rannUtsav'] ?? [];

    $cityImageMap = [
        'Munnar' => [
            'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'
        ],
        'Thekkady' => [
            'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80'
        ],
        'Alleppey' => [
            'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80'
        ],
        'Kovalam' => [
            'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
        ],
        'Cochin' => [
            'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        ],
        'Wayanad' => [
            'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80'
        ],
        'Dhordo' => [
            '/rann_utsav_tent_city.jpg',
            '/rann_utsav_white_desert.jpg',
            '/Rann-Utsav-Gujarat.png'
        ],
        'Dholavira' => [
            '/rann_utsav_road_to_heaven.jpg',
            '/rann_utsav_kalo_dungar.jpg',
            '/rann_utsav_white_desert.jpg'
        ],
        'Bhuj' => [
            '/Rann-Utsav-Gujarat.png',
            '/rann_utsav_tent_city.jpg',
            '/rann_utsav_white_desert.jpg'
        ],
        'Mandvi' => [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
            '/Rann-Utsav-Gujarat.png'
        ]
    ];

    $resolveCityId = function($cityName, $stateName) use ($pdo) {
        $cityName = trim($cityName);
        $stmt = $pdo->prepare("SELECT id FROM cities WHERE city_name = ? OR name = ?");
        $stmt->execute([$cityName, $cityName]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) return (int)$row['id'];

        $ins = $pdo->prepare("INSERT INTO cities (name, city_name, state) VALUES (?, ?, ?)");
        $ins->execute([$cityName, $cityName, $stateName]);
        return (int)$pdo->lastInsertId();
    };

    $insertedHotels = 0;
    $insertedRates = 0;
    $contractedJsonEntries = [];

    $seedGroup = function($hotelsList, $defaultState) use (
        $pdo, $cityImageMap, $resolveCityId, 
        &$insertedHotels, &$insertedRates, &$contractedJsonEntries
    ) {
        foreach ($hotelsList as $h) {
            $hName = trim($h['name']);
            $cityName = trim($h['city'] ?: ($defaultState === 'Kerala' ? 'Cochin' : 'Bhuj'));
            $stateName = $h['state'] ?: $defaultState;

            $cityId = $resolveCityId($cityName, $stateName);

            // Determine star rating
            $starRating = 4;
            $lower = strtolower($hName);
            if (strpos($lower, 'palace') !== false || strpos($lower, 'resort & spa') !== false || strpos($lower, 'leela') !== false || strpos($lower, 'taj') !== false || strpos($lower, 'praveg') !== false || strpos($lower, 'elephant court') !== false) {
                $starRating = 5;
            } elseif (strpos($lower, 'residency') !== false || strpos($lower, 'lodge') !== false || strpos($lower, 'inn') !== false || strpos($lower, 'cottage') !== false) {
                $starRating = 3;
            }

            // Check if hotel exists in DB
            $chk = $pdo->prepare("SELECT id FROM hotels WHERE hotel_name = ? AND (city_name = ? OR city_id = ?)");
            $chk->execute([$hName, $cityName, $cityId]);
            $existing = $chk->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                $hotelId = $existing['id'];
            } else {
                $hotelId = sprintf('%04x%04x-%04x-%04x-%04x-%012x',
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                    mt_rand(0, 0xffff), mt_rand(0x4000, 0x4fff),
                    mt_rand(0x8000, 0xbfff), mt_rand(0, 0xffffffffffff)
                );

                $photos = $cityImageMap[$cityName] ?? [
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
                ];

                $mealPlans = json_encode(['EP', 'CP', 'MAP', 'AP']);

                $insH = $pdo->prepare("INSERT INTO hotels (
                    id, hotel_name, city_id, city_name, state_name, star_rating, 
                    address, location_description, photos, meal_plan_supported, active, active_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)");

                $insH->execute([
                    $hotelId,
                    $hName,
                    $cityId,
                    $cityName,
                    $stateName,
                    $starRating,
                    "$hName, $cityName, $stateName, India",
                    "Premium contracted accommodation in $cityName offering deluxe rooms, modern amenities, and warm hospitality.",
                    json_encode($photos),
                    $mealPlans
                ]);
                $insertedHotels++;
            }

            // Create or get Contract
            $cChk = $pdo->prepare("SELECT id FROM hotel_contracts WHERE hotel_id = ? AND contract_name = ?");
            $cChk->execute([$hotelId, "Official Ratecard 2026-2027"]);
            $cRow = $cChk->fetch(PDO::FETCH_ASSOC);
            if ($cRow) {
                $contractId = $cRow['id'];
            } else {
                $contractId = sprintf('%04x%04x-%04x-%04x-%04x-%012x',
                    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                    mt_rand(0, 0xffff), mt_rand(0x4000, 0x4fff),
                    mt_rand(0x8000, 0xbfff), mt_rand(0, 0xffffffffffff)
                );
                $insC = $pdo->prepare("INSERT INTO hotel_contracts (
                    id, hotel_id, contract_name, season, valid_from, valid_to, status, active_status
                ) VALUES (?, ?, 'Official Ratecard 2026-2027', 'Normal Season', '2026-04-01', '2027-03-31', 'active', 1)");
                $insC->execute([$contractId, $hotelId]);
            }

            // Clean old rates for this contract
            $pdo->prepare("DELETE FROM hotel_rates WHERE contract_id = ?")->execute([$contractId]);

            // Add room rates
            $allRoomRatesForJson = [];

            foreach ($h['rooms'] as $room) {
                $rType = $room['roomType'];
                
                // Plans: EP, CP, MAP, AP
                $plans = [
                    'EP' => ['double' => $room['doubleEP'], 'triple' => $room['tripleEP']],
                    'CP' => ['double' => $room['doubleCP'], 'triple' => $room['tripleCP']],
                    'MAP' => ['double' => $room['doubleMAP'], 'triple' => $room['tripleMAP']],
                    'AP' => ['double' => $room['doubleAP'], 'triple' => $room['tripleAP']]
                ];

                foreach ($plans as $planName => $rates) {
                    $doubleRate = $rates['double'];
                    if (!$doubleRate || $doubleRate <= 0) continue;

                    $tripleRate = $rates['triple'] ?: round($doubleRate * 1.35);
                    $childWithBed = round($doubleRate * 0.25);
                    $childWithoutBed = round($doubleRate * 0.15);

                    $rateId = sprintf('%04x%04x-%04x-%04x-%04x-%012x',
                        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                        mt_rand(0, 0xffff), mt_rand(0x4000, 0x4fff),
                        mt_rand(0x8000, 0xbfff), mt_rand(0, 0xffffffffffff)
                    );

                    $insR = $pdo->prepare("INSERT INTO hotel_rates (
                        id, contract_id, hotel_id, room_type, meal_plan, 
                        double_rate, base_rate, extra_adult_rate, child_with_bed_rate, 
                        child_without_bed_rate, season, active_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Normal Season', 1)");

                    $insR->execute([
                        $rateId,
                        $contractId,
                        $hotelId,
                        $rType,
                        $planName,
                        $doubleRate,
                        $doubleRate,
                        $tripleRate,
                        $childWithBed,
                        $childWithoutBed
                    ]);
                    $insertedRates++;

                    $allRoomRatesForJson[] = $doubleRate;
                }
            }

            // Build entry for contractedHotels.json
            $contractedJsonEntries[] = [
                'city' => $cityName,
                'name' => $hName,
                'cat_or_room' => $starRating >= 5 ? 'Luxury' : ($starRating === 4 ? 'Premium' : 'Standard'),
                'b2b_cost' => !empty($allRoomRatesForJson) ? min($allRoomRatesForJson) : 3500,
                'rates' => !empty($allRoomRatesForJson) ? array_values(array_unique($allRoomRatesForJson)) : [3500, 4500, 5500]
            ];
        }
    };

    echo "Seeding Kerala Hotels...\n";
    $seedGroup($keralaHotels, 'Kerala');

    echo "Seeding Rann of Kutch Hotels...\n";
    $seedGroup($rannHotels, 'Gujarat');

    // Update contractedHotels.json in both frontend and php-backend
    $jsonFrontend = 'd:/Personal/ghumo-firoo-journeys-site/ghumo-firoo-journeys-site/src/data/contractedHotels.json';
    $jsonBackend = 'd:/Personal/ghumo-firoo-journeys-site/ghumo-firoo-journeys-site/php-backend/contractedHotels.json';

    // Merge with existing contractedHotels to preserve other states (Goa, Himachal, etc.)
    $existingJson = [];
    if (file_exists($jsonFrontend)) {
        $existingJson = json_decode(file_get_contents($jsonFrontend), true) ?: [];
    }

    $existingByName = [];
    foreach ($existingJson as $item) {
        $existingByName[strtolower(trim($item['name']))] = $item;
    }

    foreach ($contractedJsonEntries as $item) {
        $existingByName[strtolower(trim($item['name']))] = $item;
    }

    $finalMergedJson = array_values($existingByName);
    file_put_contents($jsonFrontend, json_encode($finalMergedJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    file_put_contents($jsonBackend, json_encode($finalMergedJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    echo json_encode([
        'status' => 'success',
        'inserted_or_updated_hotels' => count($keralaHotels) + count($rannHotels),
        'total_rates_seeded' => $insertedRates,
        'contracted_json_total' => count($finalMergedJson)
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
