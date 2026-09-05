<?php
// seed_rann_utsav_cabs.php — Seeds official Rann Utsav cab rates and contracts into CRM database
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $pdo = getDb();

    $supplierId = 'a1b2c3d4-kutch-0001-0000-000000000001';
    $contractId = 'a1b2c3d4-kutch-0002-0000-000000000001';

    // 1. Ensure Supplier exists
    $stmt = $pdo->prepare("SELECT id FROM cab_suppliers WHERE id = ? OR supplier_code = 'KUTCH-CAB-01'");
    $stmt->execute([$supplierId]);
    $existingSupplier = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingSupplier) {
        $stmt = $pdo->prepare("INSERT INTO cab_suppliers (
            id, supplier_name, supplier_code, contact_person, mobile, email,
            payment_terms, commission_percentage, valid_from, valid_to, active_status
        ) VALUES (
            ?, 'Kutch Official Cab Services', 'KUTCH-CAB-01', 'Operations Desk', '9910987264', 'contact@ghumofiroo.com',
            'Net 15 Days', 0, '2024-10-01', '2026-03-31', 1
        )");
        $stmt->execute([$supplierId]);
    } else {
        $supplierId = $existingSupplier['id'];
    }

    // 2. Ensure Vehicles exist
    $vehicles = [
        [
            'id' => 'v-dzire-kutch-0001',
            'type' => 'Swift Dzire (4-Seater)',
            'category' => 'Sedan',
            'adults' => 4,
            'children' => 2,
            'luggage' => '2 Medium Bags'
        ],
        [
            'id' => 'v-ertiga-kutch-0002',
            'type' => 'Maruti Ertiga (6-Seater)',
            'category' => 'MUV',
            'adults' => 6,
            'children' => 2,
            'luggage' => '3 Medium Bags'
        ],
        [
            'id' => 'v-innova-kutch-0003',
            'type' => 'Innova Crysta (6/7-Seater)',
            'category' => 'SUV',
            'adults' => 7,
            'children' => 2,
            'luggage' => '4 Large Bags'
        ],
        [
            'id' => 'v-tempo-kutch-0004',
            'type' => 'AC Tempo Traveller (12/17-Seater)',
            'category' => 'Tempo Traveller',
            'adults' => 17,
            'children' => 4,
            'luggage' => '10 Bags'
        ]
    ];

    $vehicleIdMap = [];
    foreach ($vehicles as $v) {
        $stmt = $pdo->prepare("SELECT id FROM cab_vehicles WHERE id = ? OR vehicle_type = ?");
        $stmt->execute([$v['id'], $v['type']]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            $stmt = $pdo->prepare("INSERT INTO cab_vehicles (
                id, vehicle_type, vehicle_category, capacity_adults, capacity_children, luggage_capacity, availability_status, active_status
            ) VALUES (?, ?, ?, ?, ?, ?, 'Available', 1)");
            $stmt->execute([$v['id'], $v['type'], $v['category'], $v['adults'], $v['children'], $v['luggage']]);
            $vehicleIdMap[$v['category']] = $v['id'];
        } else {
            $vehicleIdMap[$v['category']] = $existing['id'];
        }
    }

    // 3. Ensure Routes exist
    $routes = [
        [
            'id' => 'r-bhuj-rann-0001',
            'source' => 'Bhuj',
            'destination' => 'White Rann / Dhordo',
            'state' => 'Gujarat',
            'type' => 'Point to Point',
            'km' => 85,
            'time' => '2 hrs'
        ],
        [
            'id' => 'r-bhuj-amd-0002',
            'source' => 'Bhuj',
            'destination' => 'Ahmedabad',
            'state' => 'Gujarat',
            'type' => 'Intercity Transfer',
            'km' => 330,
            'time' => '6.5 hrs'
        ],
        [
            'id' => 'r-bhuj-raj-0003',
            'source' => 'Bhuj',
            'destination' => 'Rajkot',
            'state' => 'Gujarat',
            'type' => 'Intercity Transfer',
            'km' => 230,
            'time' => '4.5 hrs'
        ],
        [
            'id' => 'r-kutch-circ-0004',
            'source' => 'Bhuj',
            'destination' => 'Kutch Sightseeing (Dhordo, Kala Dungar, Mandvi)',
            'state' => 'Gujarat',
            'type' => 'Sightseeing',
            'km' => 300,
            'time' => 'Full Day'
        ]
    ];

    $routeIdMap = [];
    foreach ($routes as $r) {
        $stmt = $pdo->prepare("SELECT id FROM cab_routes WHERE id = ? OR (source = ? AND destination = ?)");
        $stmt->execute([$r['id'], $r['source'], $r['destination']]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            $stmt = $pdo->prepare("INSERT INTO cab_routes (
                id, source, destination, state, country, route_type, distance_km, travel_time, active_status
            ) VALUES (?, ?, ?, ?, 'India', ?, ?, ?, 1)");
            $stmt->execute([$r['id'], $r['source'], $r['destination'], $r['state'], $r['type'], $r['km'], $r['time']]);
            $routeIdMap[$r['destination']] = $r['id'];
        } else {
            $routeIdMap[$r['destination']] = $existing['id'];
        }
    }

    // 4. Ensure Contract exists
    $stmt = $pdo->prepare("SELECT id FROM cab_contracts WHERE id = ? OR contract_name = 'Rann Utsav Kutch Official Cab Contract 2024-2026'");
    $stmt->execute([$contractId]);
    $existingContract = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingContract) {
        $stmt = $pdo->prepare("INSERT INTO cab_contracts (
            id, supplier_id, contract_name, valid_from, valid_to, active_status
        ) VALUES (?, ?, 'Rann Utsav Kutch Official Cab Contract 2024-2026', '2024-10-01', '2026-03-31', 1)");
        $stmt->execute([$contractId, $supplierId]);
    } else {
        $contractId = $existingContract['id'];
    }

    // 5. Build full matrix of rates for all 4 vehicles x 4 routes x 5 seasons
    $seasons = ['Peak Season', 'Super Peak', 'Festive Season', 'Normal Season', 'Off Season'];

    $fixedRouteRates = [
        'Ahmedabad' => [
            'Sedan' => 4500,
            'MUV' => 5500,
            'SUV' => 7000,
            'Tempo Traveller' => 9500
        ],
        'Rajkot' => [
            'Sedan' => 4000,
            'MUV' => 5000,
            'SUV' => 6500,
            'Tempo Traveller' => 8500
        ],
        'White Rann / Dhordo' => [
            'Sedan' => 2500,
            'MUV' => 3200,
            'SUV' => 4200,
            'Tempo Traveller' => 6000
        ],
        'Kutch Sightseeing (Dhordo, Kala Dungar, Mandvi)' => [
            'Sedan' => 3500,
            'MUV' => 4200,
            'SUV' => 5500,
            'Tempo Traveller' => 7500
        ]
    ];

    $seededRates = 0;
    foreach ($vehicles as $v) {
        $vId = $vehicleIdMap[$v['category']] ?? $v['id'];
        foreach ($routes as $r) {
            $rId = $routeIdMap[$r['destination']] ?? $r['id'];
            foreach ($seasons as $season) {
                // Generate a deterministic unique rate ID
                $seasonSlug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $season));
                $vSlug = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $v['category']));
                $rateId = "cr-kutch-{$vSlug}-{$seasonSlug}-" . substr(md5($rId), 0, 8);

                $fixedPrice = $fixedRouteRates[$r['destination']][$v['category']] ?? ($v['rate_per_km'] * 300 + 300);
                $driverAllowance = ($v['category'] === 'Tempo Traveller') ? 500 : 300;
                $ratePerKm = ($v['category'] === 'Sedan') ? 14 : (($v['category'] === 'MUV') ? 16 : (($v['category'] === 'SUV') ? 22 : 28));

                // Upsert into cab_contract_rates
                $checkStmt = $pdo->prepare("SELECT id FROM cab_contract_rates WHERE contract_id = ? AND vehicle_id = ? AND route_id = ? AND season = ?");
                $checkStmt->execute([$contractId, $vId, $rId, $season]);
                $existingRate = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if ($existingRate) {
                    $updateStmt = $pdo->prepare("UPDATE cab_contract_rates SET
                        rate_model = 'Per KM',
                        base_km_included = 0,
                        rate_per_km = ?,
                        min_km_per_day = 300,
                        driver_allowance = ?,
                        transfer_cost = ?,
                        vehicle_cost = ?,
                        base_cost = ?,
                        supplier_cost = ?,
                        selling_cost = ?,
                        active_status = 1
                        WHERE id = ?
                    ");
                    $updateStmt->execute([
                        $ratePerKm,
                        $driverAllowance,
                        $fixedPrice,
                        $fixedPrice,
                        $fixedPrice,
                        $fixedPrice,
                        $fixedPrice,
                        $existingRate['id']
                    ]);
                    $seededRates++;
                } else {
                    $insertStmt = $pdo->prepare("INSERT INTO cab_contract_rates (
                        id, contract_id, vehicle_id, route_id, season, rate_model,
                        base_km_included, rate_per_km, min_km_per_day, driver_allowance,
                        transfer_cost, vehicle_cost, base_cost, supplier_cost, selling_cost,
                        gst_included, gst_percentage, markup_percentage, active_status
                    ) VALUES (
                        ?, ?, ?, ?, ?, 'Per KM',
                        0, ?, 300, ?,
                        ?, ?, ?, ?, ?,
                        0, 5, 0, 1
                    )");
                    $insertStmt->execute([
                        $rateId, $contractId, $vId, $rId, $season,
                        $ratePerKm, $driverAllowance,
                        $fixedPrice, $fixedPrice, $fixedPrice, $fixedPrice, $fixedPrice
                    ]);
                    $seededRates++;
                }
            }
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Official Rann Utsav cab rates across all vehicles, routes, and seasons successfully seeded.',
        'contract_id' => $contractId,
        'supplier_id' => $supplierId,
        'seeded_rates_count' => $seededRates,
        'vehicles_mapped' => count($vehicleIdMap),
        'routes_mapped' => count($routeIdMap)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database seeding failed: ' . $e->getMessage()
    ]);
}
