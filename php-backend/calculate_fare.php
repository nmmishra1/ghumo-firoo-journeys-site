<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight CORS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Read JSON input payload
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

if (!$data) {
    // Fallback GET parameters for testing
    $data = $_GET;
}

// Extract inputs with defaults
$checkInStr = isset($data['check_in']) ? $data['check_in'] : '2026-12-15';
$checkOutStr = isset($data['check_out']) ? $data['check_out'] : '2026-12-18';
$adults = isset($data['adults']) ? max(1, (int)$data['adults']) : 2;
$childrenAbove6 = isset($data['children_6_12']) ? max(0, (int)$data['children_6_12']) : 0;
$childrenUnder6 = isset($data['children_under_6']) ? max(0, (int)$data['children_under_6']) : 0;
$accType = isset($data['accommodation']) ? $data['accommodation'] : 'ac_premium';
$transferType = isset($data['transfer']) ? $data['transfer'] : 'private_suv';
$activities = isset($data['activities']) && is_array($data['activities']) ? $data['activities'] : [];

// 1. Calculate Nights & Days
$inTime = strtotime($checkInStr);
$outTime = strtotime($checkOutStr);
if (!$inTime || !$outTime || $outTime <= $inTime) {
    $nights = 3;
} else {
    $nights = max(1, (int)ceil(($outTime - $inTime) / 86400));
}
$days = $nights + 1;
$totalOccupants = $adults + $childrenAbove6;

// 2. Automatic Date Season Detection Engine
function detectSeasonTier($checkInStr, $nights) {
    $startTs = strtotime($checkInStr);
    
    // Season 3 Date Ranges
    $diwaliStart = strtotime("2026-11-08");
    $diwaliEnd = strtotime("2026-11-14");
    
    $xmasStart = strtotime("2026-12-18");
    $xmasEnd = strtotime("2027-01-02");
    
    $fullMoonRanges = [
        ['start' => strtotime("2026-11-22"), 'end' => strtotime("2026-11-25")],
        ['start' => strtotime("2026-12-21"), 'end' => strtotime("2026-12-24")],
        ['start' => strtotime("2027-01-20"), 'end' => strtotime("2027-01-23")],
        ['start' => strtotime("2027-02-18"), 'end' => strtotime("2027-02-21")],
    ];
    
    // Season 2 Dark Moon Dates
    $darkMoonDates = ["2026-11-09", "2026-12-08", "2027-01-07", "2027-02-06"];
    
    // Check Season 3
    if ($startTs >= $diwaliStart && $startTs <= $diwaliEnd) {
        $surcharges = [1 => 4000, 2 => 6000, 3 => 8000];
        return [
            'tier' => 3,
            'name' => '🪔 Diwali Peak Season (Season 3)',
            'surcharge_per_pax' => isset($surcharges[$nights]) ? $surcharges[$nights] : ($nights * 2500)
        ];
    }
    
    if ($startTs >= $xmasStart && $startTs <= $xmasEnd) {
        $surcharges = [1 => 4000, 2 => 6000, 3 => 8000];
        return [
            'tier' => 3,
            'name' => '🎄 Christmas & New Year Gala (Season 3)',
            'surcharge_per_pax' => isset($surcharges[$nights]) ? $surcharges[$nights] : ($nights * 2500)
        ];
    }
    
    foreach ($fullMoonRanges as $fm) {
        if ($startTs >= $fm['start'] && $startTs <= $fm['end']) {
            $surcharges = [1 => 4000, 2 => 6000, 3 => 8000];
            return [
                'tier' => 3,
                'name' => '🌕 Full Moon Peak Season (Season 3)',
                'surcharge_per_pax' => isset($surcharges[$nights]) ? $surcharges[$nights] : ($nights * 2500)
            ];
        }
    }
    
    // Check Season 2
    if (in_array($checkInStr, $darkMoonDates)) {
        $surcharges = [1 => 2000, 2 => 3500, 3 => 4500];
        return [
            'tier' => 2,
            'name' => '🌑 Dark Moon Special (Season 2)',
            'surcharge_per_pax' => isset($surcharges[$nights]) ? $surcharges[$nights] : ($nights * 1500)
        ];
    }
    
    return [
        'tier' => 1,
        'name' => '✨ Standard Base Season (Season 1)',
        'surcharge_per_pax' => 0
    ];
}

$seasonInfo = detectSeasonTier($checkInStr, $nights);

// 3. Official Evoke 2026-2027 Rate Card Matrix
$roomRatesBase = [
    'non_ac' => ['label' => 'Non-AC Swiss Cottage', 'sub' => 'Standard Tier • All Meals Included', 1 => 6300, 2 => 12600, 3 => 18900],
    'ac_premium' => ['label' => 'Premium AC Tent', 'sub' => 'Luxury Tier • Queen Bed & Amenities', 1 => 9300, 2 => 18600, 3 => 27900],
    'super_premium' => ['label' => 'Super Premium AC Tent', 'sub' => 'Ultra Luxury • Prime Location', 1 => 10300, 2 => 20600, 3 => 30900],
    'darbari' => ['label' => 'Darbari Royal Suite', 'sub' => 'Royal VIP Suite • Separate Lounge & Butler', 1 => 35000, 2 => 70000, 3 => 105000]
];

    // Official Rann Utsav Cab Rates & Driver Allowance Engine (300 km/day average minimum)
    $pickup = strtolower(trim($data['pickup_location'] ?? $data['pickup'] ?? ''));
    $drop = strtolower(trim($data['drop_location'] ?? $data['drop'] ?? ''));
    $driverAllowancePerDay = 300;
    $minKmPerDay = 300;
    $totalBillableKm = $days * $minKmPerDay;
    $totalDriverAllowance = $days * $driverAllowancePerDay;

    $isAhmedabadRoute = (strpos($pickup, 'ahmedabad') !== false || strpos($drop, 'ahmedabad') !== false);
    $isRajkotRoute = (strpos($pickup, 'rajkot') !== false || strpos($drop, 'rajkot') !== false);

    if ($isAhmedabadRoute && ($transferType === 'private_sedan' || $transferType === 'sedan' || $transferType === 'swift_dzire')) {
        $selectedCab = ['label' => 'Private AC Sedan (Ahmedabad ↔ Bhuj)', 'sub' => 'Swift Dzire • All Inclusive Point-to-Point Transfer', 'cost' => 4500];
    } else if ($isAhmedabadRoute && ($transferType === 'suv_ertiga' || $transferType === 'ertiga')) {
        $selectedCab = ['label' => 'Private AC SUV Ertiga (Ahmedabad ↔ Bhuj)', 'sub' => 'Maruti Ertiga • All Inclusive Point-to-Point Transfer', 'cost' => 5500];
    } else if ($isAhmedabadRoute && ($transferType === 'private_suv' || $transferType === 'suv_innova' || $transferType === 'innova')) {
        $selectedCab = ['label' => 'Private AC Innova Crysta (Ahmedabad ↔ Bhuj)', 'sub' => 'Toyota Innova Crysta • All Inclusive Transfer', 'cost' => 7500];
    } else if ($isRajkotRoute && ($transferType === 'private_sedan' || $transferType === 'sedan' || $transferType === 'swift_dzire')) {
        $selectedCab = ['label' => 'Private AC Sedan (Rajkot ↔ Bhuj)', 'sub' => 'Swift Dzire • All Inclusive Point-to-Point Transfer', 'cost' => 4000];
    } else if ($isRajkotRoute && ($transferType === 'suv_ertiga' || $transferType === 'ertiga')) {
        $selectedCab = ['label' => 'Private AC SUV Ertiga (Rajkot ↔ Bhuj)', 'sub' => 'Maruti Ertiga • All Inclusive Point-to-Point Transfer', 'cost' => 5000];
    } else if ($isRajkotRoute && ($transferType === 'private_suv' || $transferType === 'suv_innova' || $transferType === 'innova')) {
        $selectedCab = ['label' => 'Private AC Innova Crysta (Rajkot ↔ Bhuj)', 'sub' => 'Toyota Innova Crysta • All Inclusive Transfer', 'cost' => 6500];
    } else if ($transferType === 'private_sedan' || $transferType === 'sedan' || $transferType === 'swift_dzire') {
        $dzireKmCost = $totalBillableKm * 14;
        $dzireTotal = $dzireKmCost + $totalDriverAllowance;
        $selectedCab = [
            'label' => 'Private AC Sedan (Swift Dzire / Etios)', 
            'sub' => "{$days} Days Tour • ₹14/km ({$totalBillableKm} km min) + ₹{$totalDriverAllowance} Driver Allowance", 
            'cost' => $dzireTotal
        ];
    } else if ($transferType === 'suv_ertiga' || $transferType === 'ertiga') {
        $ertigaKmCost = $totalBillableKm * 16;
        $ertigaTotal = $ertigaKmCost + $totalDriverAllowance;
        $selectedCab = [
            'label' => 'Private AC SUV (Maruti Ertiga)', 
            'sub' => "{$days} Days Tour • ₹16/km ({$totalBillableKm} km min) + ₹{$totalDriverAllowance} Driver Allowance", 
            'cost' => $ertigaTotal
        ];
    } else if ($transferType === 'private_suv' || $transferType === 'suv_innova' || $transferType === 'innova') {
        $innovaKmCost = $totalBillableKm * 22;
        $innovaTotal = $innovaKmCost + $totalDriverAllowance;
        $selectedCab = [
            'label' => 'Private AC Premium SUV (Toyota Innova Crysta)', 
            'sub' => "{$days} Days Tour • ₹22/km ({$totalBillableKm} km min) + ₹{$totalDriverAllowance} Driver Allowance", 
            'cost' => $innovaTotal
        ];
    } else if ($transferType === 'tempo' || $transferType === 'tempo_12') {
        $tempoKmCost = $totalBillableKm * 28;
        $tempoDA = $days * 500;
        $tempoTotal = $tempoKmCost + $tempoDA;
        $selectedCab = [
            'label' => 'Private AC Luxury Tempo Traveller (12-Seater)', 
            'sub' => "{$days} Days Tour • ₹28/km ({$totalBillableKm} km min) + ₹{$tempoDA} Driver Allowance", 
            'cost' => $tempoTotal
        ];
    } else {
        $selectedCab = [
            'label' => 'Official AC Shared Coach Bus Transfer', 
            'sub' => 'Scheduled Pickup from Bhuj (08:15 AM, 10:00 AM, 01:30 PM, 03:30 PM) • Included at ₹0', 
            'cost' => 0
        ];
    }
    $cabCost = $selectedCab['cost'];

// Activities cost
$activitiesCost = 0;
$activityList = [];
foreach ($activities as $actKey) {
    if (isset($activityRates[$actKey])) {
        $activitiesCost += $activityRates[$actKey]['rate'] * $totalOccupants;
        $activityList[] = $activityRates[$actKey]['label'];
    }
}

// Grand Total Calculation
$subtotal = $totalRoomCost + $cabCost + $activitiesCost;
$tax18 = round($subtotal * 0.18);
$totalFare = $subtotal + $tax18;
$perPaxFare = round($totalFare / max(1, $totalOccupants));

// Response JSON Payload
echo json_encode([
    'status' => 'success',
    'input' => [
        'check_in' => $checkInStr,
        'check_out' => $checkOutStr,
        'nights' => $nights,
        'days' => $days,
        'adults' => $adults,
        'children_6_12' => $childrenAbove6,
        'children_under_6' => $childrenUnder6,
        'total_occupants' => $totalOccupants
    ],
    'season' => [
        'tier' => $seasonInfo['tier'],
        'name' => $seasonInfo['name'],
        'surcharge_per_pax' => $seasonInfo['surcharge_per_pax']
    ],
    'breakdown' => [
        'room_label' => $selectedRoom['label'],
        'room_sub' => $selectedRoom['sub'],
        'room_total' => $totalRoomCost,
        'cab_label' => $selectedCab['label'],
        'cab_sub' => $selectedCab['sub'],
        'cab_total' => $cabCost,
        'activities' => $activityList,
        'activities_total' => $activitiesCost,
        'subtotal' => $subtotal,
        'tax_18_percent' => $tax18
    ],
    'pricing' => [
        'total_package_fare' => $totalFare,
        'per_person_fare' => $perPaxFare
    ]
]);
