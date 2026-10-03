<?php
/**
 * seed_bal_samand.php — Seeds "WelcomHeritage Bal Samand Lake Palace"
 * into hotels, hotel_contracts, and hotel_rates tables.
 * Can be accessed via GET /php-backend/seed_bal_samand.php or included.
 */
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';
$pdo = getDb();

try {
    // 1. Resolve Jodhpur city ID
    $jodhpurCityId = 61;
    $cityStmt = $pdo->query("SELECT id, name FROM cities WHERE LOWER(name) LIKE '%jodhpur%' OR LOWER(city_name) LIKE '%jodhpur%' LIMIT 1");
    if ($cRow = $cityStmt->fetch(PDO::FETCH_ASSOC)) {
        $jodhpurCityId = (int)$cRow['id'];
    }

    // 2. Discover available columns in hotels table
    $hCols = [];
    $qCols = $pdo->query("SHOW COLUMNS FROM hotels");
    while ($r = $qCols->fetch(PDO::FETCH_ASSOC)) {
        $hCols[] = strtolower($r['Field']);
    }

    $hotelId = 'hotel-6abb986e4e0866.11840170';
    $hotelName = 'WelcomHeritage Bal Samand Lake Palace';
    $address = 'BSF STC, Mandore Rd, Mandore, Jodhpur, Rajasthan 342026';
    $star = 4;

    // Check if hotel already exists
    $nameCol = in_array('hotel_name', $hCols) ? 'hotel_name' : (in_array('name', $hCols) ? 'name' : 'hotel_name');
    $checkStmt = $pdo->prepare("SELECT id FROM hotels WHERE id = ? OR LOWER(`$nameCol`) LIKE ? LIMIT 1");
    $checkStmt->execute([$hotelId, '%bal samand%']);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $actualHotelId = $existing['id'];
        // Update to make sure it's active and has correct city
        $pdo->prepare("UPDATE hotels SET active_status = 1 WHERE id = ?")->execute([$actualHotelId]);
    } else {
        $actualHotelId = $hotelId;
        $fields = ['id'];
        $vals = [$actualHotelId];
        $placeholders = ['?'];

        if (in_array('hotel_name', $hCols)) {
            $fields[] = 'hotel_name';
            $vals[] = $hotelName;
            $placeholders[] = '?';
        } elseif (in_array('name', $hCols)) {
            $fields[] = 'name';
            $vals[] = $hotelName;
            $placeholders[] = '?';
        }

        if (in_array('city_id', $hCols)) {
            $fields[] = 'city_id';
            $vals[] = $jodhpurCityId;
            $placeholders[] = '?';
        }
        if (in_array('city', $hCols)) {
            $fields[] = 'city';
            $vals[] = 'Jodhpur';
            $placeholders[] = '?';
        } elseif (in_array('city_name', $hCols)) {
            $fields[] = 'city_name';
            $vals[] = 'Jodhpur';
            $placeholders[] = '?';
        }
        if (in_array('state', $hCols)) {
            $fields[] = 'state';
            $vals[] = 'Rajasthan';
            $placeholders[] = '?';
        } elseif (in_array('state_name', $hCols)) {
            $fields[] = 'state_name';
            $vals[] = 'Rajasthan';
            $placeholders[] = '?';
        }
        if (in_array('country', $hCols)) {
            $fields[] = 'country';
            $vals[] = 'India';
            $placeholders[] = '?';
        }
        if (in_array('star_rating', $hCols)) {
            $fields[] = 'star_rating';
            $vals[] = $star;
            $placeholders[] = '?';
        } elseif (in_array('star_category', $hCols)) {
            $fields[] = 'star_category';
            $vals[] = $star;
            $placeholders[] = '?';
        }
        if (in_array('address', $hCols)) {
            $fields[] = 'address';
            $vals[] = $address;
            $placeholders[] = '?';
        }
        if (in_array('active_status', $hCols)) {
            $fields[] = 'active_status';
            $vals[] = 1;
            $placeholders[] = '?';
        }
        if (in_array('active', $hCols)) {
            $fields[] = 'active';
            $vals[] = 1;
            $placeholders[] = '?';
        }
        if (in_array('is_active', $hCols)) {
            $fields[] = 'is_active';
            $vals[] = 1;
            $placeholders[] = '?';
        }

        $sql = "INSERT INTO hotels (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $pdo->prepare($sql)->execute($vals);
    }

    // 3. Seed contract
    $contractId = 'contract-bal-samand-2026';
    try {
        $cCols = [];
        $qcCols = $pdo->query("SHOW COLUMNS FROM hotel_contracts");
        while ($r = $qcCols->fetch(PDO::FETCH_ASSOC)) {
            $cCols[] = strtolower($r['Field']);
        }
        if (in_array('contract_name', $cCols)) {
            $pdo->prepare("INSERT IGNORE INTO hotel_contracts (id, hotel_id, contract_name, season, valid_from, valid_to, status, active_status) VALUES (?, ?, 'Official Ratecard 2026-2027', 'Normal Season', '2026-01-01', '2027-12-31', 'active', 1)")->execute([$contractId, $actualHotelId]);
        } else {
            $pdo->prepare("INSERT IGNORE INTO hotel_contracts (hotel_id, room_type, meal_plan, contract_rate, valid_from, valid_to, active_status) VALUES (?, 'Premium', 'MAP', 6050, '2026-01-01', '2027-12-31', 1)")->execute([$actualHotelId]);
        }
    } catch (Exception $eC) {
        error_log('Hotel contracts insert error: ' . $eC->getMessage());
    }

    // 4. Seed rates into hotel_rates
    $insertedRates = 0;
    try {
        $rates = [
            ['Premium', 'MAP', 6050.00],
            ['Premium', 'CP', 5500.00],
            ['Premium', 'EP', 4800.00],
            ['Garden Room', 'CP', 5500.00],
            ['Garden Room', 'MAP', 6050.00],
            ['Regal Suite', 'CP', 8500.00],
            ['Regal Suite', 'MAP', 9500.00]
        ];

        foreach ($rates as $r) {
            $checkRate = $pdo->prepare("SELECT id FROM hotel_rates WHERE hotel_id = ? AND room_type = ? AND meal_plan = ? LIMIT 1");
            $checkRate->execute([$actualHotelId, $r[0], $r[1]]);
            if (!$checkRate->fetch()) {
                $stmtR = $pdo->prepare("INSERT INTO hotel_rates (hotel_id, room_type, meal_plan, season_start, season_end, rate_per_night, is_active) VALUES (?, ?, ?, '2026-01-01', '2027-12-31', ?, 1)");
                $stmtR->execute([$actualHotelId, $r[0], $r[1], $r[2]]);
                $insertedRates++;
            }
        }
    } catch (Exception $eR) {
        error_log('Hotel rates insert error: ' . $eR->getMessage());
    }

    echo json_encode([
        'success' => true,
        'message' => 'WelcomHeritage Bal Samand Lake Palace successfully seeded into hotel database.',
        'hotel' => [
            'id' => $actualHotelId,
            'name' => $hotelName,
            'city_id' => $jodhpurCityId,
            'city' => 'Jodhpur',
            'state' => 'Rajasthan',
            'star_rating' => $star,
            'rates_seeded' => $insertedRates
        ]
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
