<?php
// seed_kerala_cabs.php — Seeds official LEDD Cabs Kerala contracts, vehicles, routes, and block rates
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

    $supplierId = 'ledd-cabs-kerala-supplier-0001';
    $contractId = 'ledd-cabs-kerala-contract-2026';

    // 1. Ensure Supplier exists
    $stmt = $pdo->prepare("SELECT id FROM cab_suppliers WHERE id = ? OR supplier_code = 'LEDD-CAB-KER'");
    $stmt->execute([$supplierId]);
    $existingSupplier = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingSupplier) {
        $stmt = $pdo->prepare("INSERT INTO cab_suppliers (
            id, supplier_name, supplier_code, contact_person, mobile, email,
            payment_terms, commission_percentage, valid_from, valid_to, active_status
        ) VALUES (
            ?, 'LEDD CABS (A Division of LEDD Hotels)', 'LEDD-CAB-KER', 'Operations Desk', '9645845222', 'cabs@leddhotels.com',
            'Bank Transfer / Pre-trip', 0, '2026-03-01', '2027-05-31', 1
        )");
        $stmt->execute([$supplierId]);
    } else {
        $supplierId = $existingSupplier['id'];
    }

    // 2. Ensure Vehicles exist
    $vehicles = [
        ['id' => 'v-ker-sedan', 'type' => 'Sedan (Dzire / Etios)', 'category' => 'Sedan', 'adults' => 4, 'children' => 2, 'luggage' => '2 Bags'],
        ['id' => 'v-ker-ertiga', 'type' => 'Maruti Ertiga', 'category' => 'MUV', 'adults' => 6, 'children' => 2, 'luggage' => '3 Bags'],
        ['id' => 'v-ker-innova', 'type' => 'Toyota Innova', 'category' => 'SUV', 'adults' => 7, 'children' => 2, 'luggage' => '4 Bags'],
        ['id' => 'v-ker-crysta', 'type' => 'Innova Crysta', 'category' => 'Premium SUV', 'adults' => 7, 'children' => 2, 'luggage' => '4 Bags'],
        ['id' => 'v-ker-lux9tt', 'type' => 'Luxury 9-Seat TT', 'category' => 'Luxury', 'adults' => 9, 'children' => 2, 'luggage' => '8 Bags'],
        ['id' => 'v-ker-12tt', 'type' => '12-Seat Tempo Traveller', 'category' => 'Tempo Traveller', 'adults' => 12, 'children' => 2, 'luggage' => '10 Bags'],
        ['id' => 'v-ker-17tt', 'type' => '17-Seat Tempo Traveller', 'category' => 'Tempo Traveller', 'adults' => 17, 'children' => 4, 'luggage' => '14 Bags'],
        ['id' => 'v-ker-21coach', 'type' => '21-Seat Coach', 'category' => 'Coach', 'adults' => 21, 'children' => 4, 'luggage' => '18 Bags'],
        ['id' => 'v-ker-26tt', 'type' => '26-Seat Tempo Traveller', 'category' => 'Tempo Traveller', 'adults' => 26, 'children' => 6, 'luggage' => '20 Bags'],
        ['id' => 'v-ker-27coach', 'type' => '27-Seat Coach', 'category' => 'Coach', 'adults' => 27, 'children' => 6, 'luggage' => '22 Bags']
    ];

    $vMap = [];
    foreach ($vehicles as $v) {
        $stmt = $pdo->prepare("SELECT id FROM cab_vehicles WHERE id = ? OR vehicle_type = ?");
        $stmt->execute([$v['id'], $v['type']]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            $stmt = $pdo->prepare("INSERT INTO cab_vehicles (
                id, vehicle_type, vehicle_category, capacity_adults, capacity_children, luggage_capacity, availability_status, active_status
            ) VALUES (?, ?, ?, ?, ?, ?, 'Available', 1)");
            $stmt->execute([$v['id'], $v['type'], $v['category'], $v['adults'], $v['children'], $v['luggage']]);
            $vMap[$v['id']] = $v['id'];
        } else {
            $vMap[$v['id']] = $existing['id'];
        }
    }

    // 3. Ensure Contract exists
    $stmt = $pdo->prepare("SELECT id FROM cab_contracts WHERE id = ? OR contract_name = 'LEDD Cabs Kerala Special Rates 2026-2027'");
    $stmt->execute([$contractId]);
    $existingContract = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingContract) {
        $stmt = $pdo->prepare("INSERT INTO cab_contracts (
            id, supplier_id, contract_name, valid_from, valid_to, active_status
        ) VALUES (?, ?, 'LEDD Cabs Kerala Special Rates 2026-2027', '2026-03-01', '2027-05-31', 1)");
        $stmt->execute([$contractId, $supplierId]);
    } else {
        $contractId = $existingContract['id'];
    }

    // 4. Circuits / Routes Definitions
    $circuits = [
        [
            'id' => 'r-ker-1n2d-300km',
            'source' => 'Cochin Airport',
            'destination' => 'Alleppey(1N) - Cochin',
            'km' => 300,
            'duration' => '1N/2D',
            'rates' => ['v-ker-sedan' => 5500, 'v-ker-ertiga' => 6500, 'v-ker-innova' => 7500, 'v-ker-crysta' => 9000, 'v-ker-lux9tt' => 16500, 'v-ker-12tt' => 10000, 'v-ker-17tt' => 11500, 'v-ker-21coach' => 17000, 'v-ker-26tt' => 16500, 'v-ker-27coach' => 21000]
        ],
        [
            'id' => 'r-ker-2n3d-400km',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Cochin',
            'km' => 400,
            'duration' => '2N/3D',
            'rates' => ['v-ker-sedan' => 7800, 'v-ker-ertiga' => 8900, 'v-ker-innova' => 10000, 'v-ker-crysta' => 12500, 'v-ker-lux9tt' => 23500, 'v-ker-12tt' => 14000, 'v-ker-17tt' => 16000, 'v-ker-21coach' => 24500, 'v-ker-26tt' => 23500, 'v-ker-27coach' => 29500]
        ],
        [
            'id' => 'r-ker-3n4d-550km',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Alleppey(1N) - Cochin',
            'km' => 550,
            'duration' => '3N/4D',
            'rates' => ['v-ker-sedan' => 10650, 'v-ker-ertiga' => 12000, 'v-ker-innova' => 13500, 'v-ker-crysta' => 16600, 'v-ker-lux9tt' => 31750, 'v-ker-12tt' => 18800, 'v-ker-17tt' => 21000, 'v-ker-21coach' => 33500, 'v-ker-26tt' => 32000, 'v-ker-27coach' => 40000]
        ],
        [
            'id' => 'r-ker-4n5d-650km',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Thekkady(1N) - Alleppey(1N) - Cochin',
            'km' => 650,
            'duration' => '4N/5D',
            'rates' => ['v-ker-sedan' => 11500, 'v-ker-ertiga' => 14000, 'v-ker-innova' => 16000, 'v-ker-crysta' => 19800, 'v-ker-lux9tt' => 38500, 'v-ker-12tt' => 22500, 'v-ker-17tt' => 25500, 'v-ker-21coach' => 40000, 'v-ker-26tt' => 38000, 'v-ker-27coach' => 48500]
        ],
        [
            'id' => 'r-ker-4n5d-900km',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Alleppey(1N) - Varkala(1N) - Cochin Drop',
            'km' => 900,
            'duration' => '4N/5D',
            'rates' => ['v-ker-sedan' => 16800, 'v-ker-ertiga' => 19200, 'v-ker-innova' => 21500, 'v-ker-crysta' => 25800, 'v-ker-lux9tt' => 48000, 'v-ker-12tt' => 28500, 'v-ker-17tt' => 32000, 'v-ker-21coach' => 48000, 'v-ker-26tt' => 46000, 'v-ker-27coach' => 58500]
        ],
        [
            'id' => 'r-ker-4n5d-1000km-trv',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Alleppey(1N) - Varkala(1N) - Trivandrum Drop',
            'km' => 1000,
            'duration' => '4N/5D',
            'rates' => ['v-ker-sedan' => 18500, 'v-ker-ertiga' => 21000, 'v-ker-innova' => 23500, 'v-ker-crysta' => 28000, 'v-ker-lux9tt' => 51500, 'v-ker-12tt' => 31000, 'v-ker-17tt' => 35000, 'v-ker-21coach' => 52000, 'v-ker-26tt' => 49000, 'v-ker-27coach' => 62500]
        ],
        [
            'id' => 'r-ker-5n6d-680km',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Thekkady(1N) - Alleppey(1N) - Cochin(1N)',
            'km' => 680,
            'duration' => '5N/6D',
            'rates' => ['v-ker-sedan' => 12800, 'v-ker-ertiga' => 15200, 'v-ker-innova' => 17300, 'v-ker-crysta' => 21500, 'v-ker-lux9tt' => 42500, 'v-ker-12tt' => 24500, 'v-ker-17tt' => 28000, 'v-ker-21coach' => 45000, 'v-ker-26tt' => 42500, 'v-ker-27coach' => 54500]
        ],
        [
            'id' => 'r-ker-5n6d-730km',
            'source' => 'Cochin (1N)',
            'destination' => 'Munnar(2N) - Thekkady(1N) - Alleppey(1N) - Cochin Drop',
            'km' => 730,
            'duration' => '5N/6D',
            'rates' => ['v-ker-sedan' => 13500, 'v-ker-ertiga' => 16000, 'v-ker-innova' => 18000, 'v-ker-crysta' => 22500, 'v-ker-lux9tt' => 44000, 'v-ker-12tt' => 24500, 'v-ker-17tt' => 29000, 'v-ker-21coach' => 47000, 'v-ker-26tt' => 44000, 'v-ker-27coach' => 56000]
        ],
        [
            'id' => 'r-ker-5n6d-930km',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Thekkady(1N) - Alleppey(1N) - Varkala(1N) - Cochin Drop',
            'km' => 930,
            'duration' => '5N/6D',
            'rates' => ['v-ker-sedan' => 17500, 'v-ker-ertiga' => 20000, 'v-ker-innova' => 22600, 'v-ker-crysta' => 27500, 'v-ker-lux9tt' => 52000, 'v-ker-12tt' => 31000, 'v-ker-17tt' => 35000, 'v-ker-21coach' => 53500, 'v-ker-26tt' => 50500, 'v-ker-27coach' => 65000]
        ],
        [
            'id' => 'r-ker-5n6d-1030km-trv',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Thekkady(1N) - Alleppey(1N) - Varkala(1N) - Trivandrum Drop',
            'km' => 1030,
            'duration' => '5N/6D',
            'rates' => ['v-ker-sedan' => 19200, 'v-ker-ertiga' => 22000, 'v-ker-innova' => 24600, 'v-ker-crysta' => 30000, 'v-ker-lux9tt' => 55000, 'v-ker-12tt' => 33000, 'v-ker-17tt' => 37500, 'v-ker-21coach' => 56500, 'v-ker-26tt' => 53500, 'v-ker-27coach' => 68000]
        ],
        [
            'id' => 'r-ker-5n6d-1000km-kov',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Alleppey(1N) - Kovalam(2N) - Trivandrum Drop',
            'km' => 1000,
            'duration' => '5N/6D',
            'rates' => ['v-ker-sedan' => 18500, 'v-ker-ertiga' => 21500, 'v-ker-innova' => 24000, 'v-ker-crysta' => 29000, 'v-ker-lux9tt' => 54000, 'v-ker-12tt' => 32000, 'v-ker-17tt' => 36500, 'v-ker-21coach' => 55000, 'v-ker-26tt' => 52000, 'v-ker-27coach' => 66000]
        ],
        [
            'id' => 'r-ker-6n7d-1050km',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Thekkady(1N) - Alleppey(1N) - Kovalam(2N) - Trivandrum',
            'km' => 1050,
            'duration' => '6N/7D',
            'rates' => ['v-ker-sedan' => 19500, 'v-ker-ertiga' => 22700, 'v-ker-innova' => 25700, 'v-ker-crysta' => 31000, 'v-ker-lux9tt' => 59000, 'v-ker-12tt' => 34600, 'v-ker-17tt' => 39000, 'v-ker-21coach' => 60500, 'v-ker-26tt' => 57000, 'v-ker-27coach' => 73000]
        ],
        [
            'id' => 'r-ker-6n7d-1250km-kny',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Thekkady(1N) - Alleppey(1N) - Kovalam(2N) - Kanyakumari Day Trip - Trivandrum',
            'km' => 1250,
            'duration' => '6N/7D',
            'rates' => ['v-ker-sedan' => 23450, 'v-ker-ertiga' => 26500, 'v-ker-innova' => 30000, 'v-ker-crysta' => 35000, 'v-ker-lux9tt' => 66500, 'v-ker-12tt' => 40000, 'v-ker-17tt' => 45000, 'v-ker-21coach' => 68000, 'v-ker-26tt' => 64500, 'v-ker-27coach' => 82000]
        ],
        [
            'id' => 'r-ker-7n8d-1250km',
            'source' => 'Cochin Airport',
            'destination' => 'Munnar(2N) - Thekkady(1N) - Alleppey(1N) - Kovalam(2N) - Kanyakumari(1N) - Trivandrum',
            'km' => 1250,
            'duration' => '7N/8D',
            'rates' => ['v-ker-sedan' => 24000, 'v-ker-ertiga' => 27200, 'v-ker-innova' => 30700, 'v-ker-crysta' => 37000, 'v-ker-lux9tt' => 70500, 'v-ker-12tt' => 42000, 'v-ker-17tt' => 47500, 'v-ker-21coach' => 72000, 'v-ker-26tt' => 69000, 'v-ker-27coach' => 86500]
        ],
        [
            'id' => 'r-ker-8n9d-1350km',
            'source' => 'Cochin (1N)',
            'destination' => 'Munnar(2N) - Thekkady(1N) - Alleppey(1N) - Kovalam(2N) - Kanyakumari(1N) - Trivandrum',
            'km' => 1350,
            'duration' => '8N/9D',
            'rates' => ['v-ker-sedan' => 25500, 'v-ker-ertiga' => 29500, 'v-ker-innova' => 33500, 'v-ker-crysta' => 40000, 'v-ker-lux9tt' => 77000, 'v-ker-12tt' => 45000, 'v-ker-17tt' => 51500, 'v-ker-21coach' => 79000, 'v-ker-26tt' => 75500, 'v-ker-27coach' => 95000]
        ],
        [
            'id' => 'r-ker-9n10d-1800km',
            'source' => 'Munnar(2N)',
            'destination' => 'Thekkady(1N) - Alleppey(1N) - Kovalam(2N) - Kanyakumari(1N) - Rameswaram(1N) - Madurai(1N)',
            'km' => 1800,
            'duration' => '9N/10D',
            'rates' => ['v-ker-sedan' => 34000, 'v-ker-ertiga' => 39000, 'v-ker-innova' => 44000, 'v-ker-crysta' => 52500, 'v-ker-lux9tt' => 96000, 'v-ker-12tt' => 58000, 'v-ker-17tt' => 65000, 'v-ker-21coach' => 97500, 'v-ker-26tt' => 94000, 'v-ker-27coach' => 116500]
        ]
    ];

    $totalRatesInserted = 0;
    foreach ($circuits as $c) {
        // Insert Route
        $stmt = $pdo->prepare("SELECT id FROM cab_routes WHERE id = ? OR (source = ? AND destination = ?)");
        $stmt->execute([$c['id'], $c['source'], $c['destination']]);
        $existingRoute = $stmt->fetch(PDO::FETCH_ASSOC);

        $routeId = $c['id'];
        if (!$existingRoute) {
            $stmt = $pdo->prepare("INSERT INTO cab_routes (
                id, source, destination, state, country, route_type, distance_km, travel_time, active_status
            ) VALUES (?, ?, ?, 'Kerala', 'India', 'Multi-Day Tour', ?, ?, 1)");
            $stmt->execute([$c['id'], $c['source'], $c['destination'], $c['km'], $c['duration']]);
        } else {
            $routeId = $existingRoute['id'];
        }

        // Insert Rates for each vehicle on this circuit
        foreach ($c['rates'] as $vehKey => $cost) {
            $actualVehId = $vMap[$vehKey] ?? $vehKey;
            $rateId = substr(md5("{$contractId}-{$actualVehId}-{$routeId}"), 0, 36);

            $stmt = $pdo->prepare("SELECT id FROM cab_contract_rates WHERE id = ?");
            $stmt->execute([$rateId]);
            if (!$stmt->fetch()) {
                $insert = $pdo->prepare("INSERT INTO cab_contract_rates (
                    id, contract_id, vehicle_id, route_id, season, rate_model,
                    base_km_included, base_cost, supplier_cost, selling_cost, gst_percentage, gst_included, active_status
                ) VALUES (
                    ?, ?, ?, ?, 'Normal Season', 'Block Circuit',
                    ?, ?, ?, ?, 5, 0, 1
                )");
                $insert->execute([
                    $rateId, $contractId, $actualVehId, $routeId,
                    $c['km'], $cost, $cost, $cost
                ]);
                $totalRatesInserted++;
            }
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'LEDD Cabs Kerala 2026-2027 Contract & 16 Circuits successfully seeded.',
        'supplier_id' => $supplierId,
        'contract_id' => $contractId,
        'total_circuits' => count($circuits),
        'total_rates_inserted' => $totalRatesInserted
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Seeding error: ' . $e->getMessage()
    ]);
}
