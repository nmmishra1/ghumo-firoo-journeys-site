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

$cabsRates = [
    'shared_bus' => ['label' => 'Shared AC Bus Transfer', 'sub' => 'Scheduled Daily Transfers from Bhuj', 'cost' => 1500 * $totalOccupants],
    'private_sedan' => ['label' => 'Private AC Sedan Cab', 'sub' => 'Swift Dzire / Toyota Etios • Max 4 Pax', 'cost' => 3600],
    'private_suv' => ['label' => 'Private AC SUV Cab', 'sub' => 'Toyota Innova Crysta / Ertiga • Max 6 Pax', 'cost' => 6400],
    'tempo' => ['label' => 'Private AC Luxury Tempo', 'sub' => 'Exclusive Luxury Coach • Max 12 Pax', 'cost' => 12000]
];

$activityRates = [
    'paramotoring' => ['label' => 'White Rann Paramotoring', 'rate' => 2800],
    'camel_safari' => ['label' => 'Camel Safari at Sunset', 'rate' => 1200],
    'road_to_heaven' => ['label' => 'Road to Heaven Drive & Photo Tour', 'rate' => 1500]
];

// Room calculation logic
$selectedRoom = isset($roomRatesBase[$accType]) ? $roomRatesBase[$accType] : $roomRatesBase['ac_premium'];
$nightKey = min(3, max(1, $nights));
$basePerAdult = isset($selectedRoom[$nightKey]) ? $selectedRoom[$nightKey] : ($selectedRoom[3] * ($nights / 3));

$totalRoomCost = 0;
if ($accType === 'darbari') {
    $totalRoomCost = $basePerAdult;
} elseif ($adults === 1 && $childrenAbove6 === 0) {
    // Single Occupancy Rule: 75% of double occupancy cost
    $totalRoomCost = round(($basePerAdult * 2) * 0.75) + ($seasonInfo['surcharge_per_pax'] * 0.75);
} else {
    // Double / Multiple Occupancy Base Adults
    $baseAdultsCost = ($basePerAdult + $seasonInfo['surcharge_per_pax']) * $adults;
    
    // Extra Person / Child above 6 yrs (Extra Mattress Charge per night)
    $mattressRatePerNight = ($accType === 'non_ac')
        ? ($seasonInfo['tier'] > 1 ? 5000 : 4500)
        : ($seasonInfo['tier'] > 1 ? 6000 : 5500);
        
    $extraChildCost = $childrenAbove6 * $mattressRatePerNight * $nights;
    $totalRoomCost = $baseAdultsCost + $extraChildCost;
}

// Cab cost
$selectedCab = isset($cabsRates[$transferType]) ? $cabsRates[$transferType] : $cabsRates['private_suv'];
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
