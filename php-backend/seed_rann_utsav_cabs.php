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

    // 5. Seed / Upsert Official Rates into cab_contract_rates
    $rates = [
        // Swift Dzire Per KM
        [
            'id' => 'cr-dzire-perkm-001',
            'contract_id' => $contractId,
            'vehicle_id' => $vehicleIdMap['Sedan'] ?? 'v-dzire-kutch-0001',
            'route_id' => null,
            'season' => 'Normal Season',
            'rate_model' => 'Per KM',
            'base_km_included' => 0,
            'rate_per_km' => 14,
            'min_km_per_day' => 300,
            'driver_allowance' => 300,
            'base_cost' => 4500,
            'supplier_cost' => 4500,
            'selling_cost' => 4500
        ],
        // Maruti Ertiga Per KM
        [
            'id' => 'cr-ertiga-perkm-002',
            'contract_id' => $contractId,
            'vehicle_id' => $vehicleIdMap['MUV'] ?? 'v-ertiga-kutch-0002',
            'route_id' => null,
            'season' => 'Normal Season',
            'rate_model' => 'Per KM',
            'base_km_included' => 0,
            'rate_per_km' => 16,
            'min_km_per_day' => 300,
            'driver_allowance' => 300,
            'base_cost' => 5100,
            'supplier_cost' => 5100,
            'selling_cost' => 5100
        ],
        // Innova Crysta Per KM
        [
            'id' => 'cr-innova-perkm-003',
            'contract_id' => $contractId,
            'vehicle_id' => $vehicleIdMap['SUV'] ?? 'v-innova-kutch-0003',
            'route_id' => null,
            'season' => 'Normal Season',
            'rate_model' => 'Per KM',
            'base_km_included' => 0,
            'rate_per_km' => 22,
            'min_km_per_day' => 300,
            'driver_allowance' => 300,
            'base_cost' => 6900,
            'supplier_cost' => 6900,
            'selling_cost' => 6900
        ],
        // AC Tempo Traveller Per KM
        [
            'id' => 'cr-tempo-perkm-004',
            'contract_id' => $contractId,
            'vehicle_id' => $vehicleIdMap['Tempo Traveller'] ?? 'v-tempo-kutch-0004',
            'route_id' => null,
            'season' => 'Normal Season',
            'rate_model' => 'Per KM',
            'base_km_included' => 0,
            'rate_per_km' => 28,
            'min_km_per_day' => 300,
            'driver_allowance' => 500,
            'base_cost' => 8900,
            'supplier_cost' => 8900,
            'selling_cost' => 8900
        ],
        // Bhuj to Ahmedabad Fixed Routes
        [
            'id' => 'cr-amd-sedan-005',
            'contract_id' => $contractId,
            'vehicle_id' => $vehicleIdMap['Sedan'] ?? 'v-dzire-kutch-0001',
            'route_id' => $routeIdMap['Ahmedabad'] ?? 'r-bhuj-amd-0002',
            'season' => 'Normal Season',
            'rate_model' => 'Per Route',
            'base_km_included' => 330,
            'rate_per_km' => 14,
            'min_km_per_day' => 300,
            'driver_allowance' => 300,
            'base_cost' => 4500,
            'supplier_cost' => 4500,
            'selling_cost' => 4500
        ],
        [
            'id' => 'cr-amd-ertiga-006',
            'contract_id' => $contractId,
            'vehicle_id' => $vehicleIdMap['MUV'] ?? 'v-ertiga-kutch-0002',
            'route_id' => $routeIdMap['Ahmedabad'] ?? 'r-bhuj-amd-0002',
            'season' => 'Normal Season',
            'rate_model' => 'Per Route',
            'base_km_included' => 330,
            'rate_per_km' => 16,
            'min_km_per_day' => 300,
            'driver_allowance' => 300,
            'base_cost' => 5500,
            'supplier_cost' => 5500,
            'selling_cost' => 5500
        ],
        // Bhuj to Rajkot Fixed Routes
        [
            'id' => 'cr-raj-sedan-007',
            'contract_id' => $contractId,
            'vehicle_id' => $vehicleIdMap['Sedan'] ?? 'v-dzire-kutch-0001',
            'route_id' => $routeIdMap['Rajkot'] ?? 'r-bhuj-raj-0003',
            'season' => 'Normal Season',
            'rate_model' => 'Per Route',
            'base_km_included' => 230,
            'rate_per_km' => 14,
            'min_km_per_day' => 300,
            'driver_allowance' => 300,
            'base_cost' => 4000,
            'supplier_cost' => 4000,
            'selling_cost' => 4000
        ],
        [
            'id' => 'cr-raj-ertiga-008',
            'contract_id' => $contractId,
            'vehicle_id' => $vehicleIdMap['MUV'] ?? 'v-ertiga-kutch-0002',
            'route_id' => $routeIdMap['Rajkot'] ?? 'r-bhuj-raj-0003',
            'season' => 'Normal Season',
            'rate_model' => 'Per Route',
            'base_km_included' => 230,
            'rate_per_km' => 16,
            'min_km_per_day' => 300,
            'driver_allowance' => 300,
            'base_cost' => 5000,
            'supplier_cost' => 5000,
            'selling_cost' => 5000
        ]
    ];

    $seededRates = 0;
    foreach ($rates as $rate) {
        $stmt = $pdo->prepare("SELECT id FROM cab_contract_rates WHERE id = ?");
        $stmt->execute([$rate['id']]);
        if (!$stmt->fetch()) {
            $insert = $pdo->prepare("INSERT INTO cab_contract_rates (
                id, contract_id, vehicle_id, route_id, season, rate_model,
                base_km_included, rate_per_km, min_km_per_day, driver_allowance,
                base_cost, supplier_cost, selling_cost, active_status
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, 1
            )");
            $insert->execute([
                $rate['id'], $rate['contract_id'], $rate['vehicle_id'], $rate['route_id'], $rate['season'], $rate['rate_model'],
                $rate['base_km_included'], $rate['rate_per_km'], $rate['min_km_per_day'], $rate['driver_allowance'],
                $rate['base_cost'], $rate['supplier_cost'], $rate['selling_cost']
            ]);
            $seededRates++;
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Official Rann Utsav cab rates & contract successfully seeded into CRM database.',
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
