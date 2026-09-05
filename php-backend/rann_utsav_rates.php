<?php
error_reporting(0);
ini_set('display_errors', 0);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Rann Utsav 2026-2027 Official Evoke Rate Card & Itineraries Data Structure
$rateCard = [
    "provider" => "Evoke Experiences / Gujarat Tourism",
    "validity" => "1st November 2026 to 7th March 2027",
    "seasons" => [
        "season_1" => [
            "name" => "Standard Base Season (Season 1)",
            "description" => "Standard weekday and non-peak weekend rates",
            "surcharges" => [1 => 0, 2 => 0, 3 => 0, 4 => 0]
        ],
        "season_2" => [
            "name" => "🌑 Dark Moon / High Season (Season 2)",
            "description" => "High season & designated Dark Moon dates",
            "surcharges" => [1 => 2000, 2 => 3500, 3 => 4500, 4 => 6000]
        ],
        "season_3" => [
            "name" => "🌕 Premium Peak Season (Season 3)",
            "description" => "Diwali, Full Moon, Christmas & New Year Gala dates",
            "surcharges" => [1 => 4000, 2 => 6000, 3 => 8000, 4 => 10000]
        ]
    ],
    "special_dates" => [
        "full_moon" => [
            ["start" => "2026-11-22", "end" => "2026-11-25", "label" => "Full Moon Nov 2026"],
            ["start" => "2026-12-21", "end" => "2026-12-24", "label" => "Full Moon Dec 2026"],
            ["start" => "2027-01-20", "end" => "2027-01-23", "label" => "Full Moon Jan 2027"],
            ["start" => "2027-02-18", "end" => "2027-02-21", "label" => "Full Moon Feb 2027"]
        ],
        "diwali" => [
            ["start" => "2026-11-08", "end" => "2026-11-14", "label" => "Diwali Festive Week 2026"]
        ],
        "christmas_new_year" => [
            ["start" => "2026-12-18", "end" => "2027-01-02", "label" => "Christmas & New Year Gala"]
        ],
        "dark_moon" => [
            "2026-11-09", "2026-12-08", "2027-01-07", "2027-02-06"
        ]
    ],
    "coupons" => [
        "RANN10" => ["discount_percent" => 10, "label" => "10% Flat Rann Utsav Discount"],
        "GHUMO10" => ["discount_percent" => 10, "label" => "10% Ghumo Firoo Special Offer"],
        "EARLYBIRD" => ["discount_percent" => 10, "label" => "10% Early Bird Festival Discount"],
        "DESERT10" => ["discount_percent" => 10, "label" => "10% Desert Adventure Promo"]
    ]
];

/**
 * Automatically Detect Season Tier from Check-in Date
 */
function detectSeasonFromDate($checkInDate, $specialDates) {
    $checkInTs = strtotime($checkInDate);
    if (!$checkInTs) {
        return ["tier" => 1, "name" => "Standard Base Season (Season 1)", "type" => "base"];
    }

    foreach ($specialDates['diwali'] as $d) {
        if ($checkInTs >= strtotime($d['start']) && $checkInTs <= strtotime($d['end'])) {
            return ["tier" => 3, "name" => "🪔 Diwali Peak Season (Season 3)", "type" => "diwali"];
        }
    }

    foreach ($specialDates['christmas_new_year'] as $x) {
        if ($checkInTs >= strtotime($x['start']) && $checkInTs <= strtotime($x['end'])) {
            return ["tier" => 3, "name" => "🎄 Christmas & New Year Gala (Season 3)", "type" => "christmas_new_year"];
        }
    }

    foreach ($specialDates['full_moon'] as $fm) {
        if ($checkInTs >= strtotime($fm['start']) && $checkInTs <= strtotime($fm['end'])) {
            return ["tier" => 3, "name" => "🌕 Full Moon Peak Season (Season 3)", "type" => "full_moon"];
        }
    }

    if (in_array($checkInDate, $specialDates['dark_moon'])) {
        return ["tier" => 2, "name" => "🌑 Dark Moon Special (Season 2)", "type" => "dark_moon"];
    }

    return ["tier" => 1, "name" => "✨ Standard Base Season (Season 1)", "type" => "base"];
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode([
        "status" => "success",
        "rate_card" => $rateCard
    ]);
    exit;
}

if ($method === 'POST') {
    $inputRaw = file_get_contents('php://input');
    $input = json_decode($inputRaw, true) ?: [];

    $checkIn = $input['check_in_date'] ?? $input['check_in'] ?? '2026-12-15';
    $accType = $input['category'] ?? $input['accommodation'] ?? 'ac_premium';
    $nights = intval($input['nights'] ?? $input['selectedPackageNights'] ?? 2);
    $adults = intval($input['occupants'] ?? $input['adults'] ?? 2);
    $children6To12 = intval($input['children_6_12'] ?? 0);
    $childrenUnder6 = intval($input['children_under_6'] ?? 0);
    $activities = is_array($input['activities'] ?? null) ? $input['activities'] : [];
    $couponCode = strtoupper(trim($input['coupon_code'] ?? ''));
    $tentList = is_array($input['tent_list'] ?? null) ? $input['tent_list'] : null;

    $days = $nights + 1;
    $totalOccupants = max(1, $adults + $children6To12);

    // Detect Season
    $season = detectSeasonFromDate($checkIn, $rateCard['special_dates']);
    $seasonTier = $season['tier'];

    $surchargeMap = $rateCard['seasons']["season_{$seasonTier}"]["surcharges"];
    $surchargePerPax = $surchargeMap[$nights] ?? ($nights * ($seasonTier === 3 ? 2500 : ($seasonTier === 2 ? 1500 : 0)));

    // Room Rates Map (Official Evoke Ratecard 2026-2027)
    $roomRates = [
        "non_ac" => ["label" => "Non-AC Swiss Cottage", "sub" => "Standard • All Meals Included", 1 => 6300, 2 => 12600, 3 => 18900],
        "deluxe_ac" => ["label" => "Deluxe AC Swiss Cottage", "sub" => "Air-Conditioned Cottage • Comfortable Twin Bed Setup", 1 => 8300, 2 => 16600, 3 => 24900],
        "ac_premium" => ["label" => "Premium AC Tent", "sub" => "Luxury • Queen Bed & Full Amenities", 1 => 9300, 2 => 18600, 3 => 27900],
        "super_premium" => ["label" => "Super Premium AC Tent", "sub" => "Ultra Luxury • Prime Location & Amenities", 1 => 10300, 2 => 20600, 3 => 30900],
        "rajwadi" => ["label" => "Rajwadi Suite (2 Pax)", "sub" => "Royal Heritage Suite • Premium Furnishings & Lounge", 1 => 35000, 2 => 70000, 3 => 105000],
        "darbari" => ["label" => "Darbari Royal Suite (4 Pax)", "sub" => "Royal VIP Suite • Private Lounge, Bedroom & Butler Service", 1 => 70000, 2 => 140000, 3 => 210000]
    ];

    $roomObj = $roomRates[$accType] ?? $roomRates['ac_premium'];
    $basePerAdult = $roomObj[$nights] ?? ($roomObj[2] ?? 18600);

    // Calculate Room Total with exact Tent Allocation List
    if ($accType === 'darbari' || $accType === 'rajwadi') {
        $roomTotal = $basePerAdult;
    } else if (!empty($tentList) && is_array($tentList)) {
        $roomTotal = 0;
        $mattressRate = ($accType === 'non_ac') ? ($seasonTier > 1 ? 5000 : 4500) : ($seasonTier > 1 ? 6000 : 5500);
        foreach ($tentList as $t) {
            $pax = intval($t['pax'] ?? 2);
            if ($pax === 1) {
                // Single occupancy tent: 75% of double occupancy fare
                $roomTotal += round(($basePerAdult * 2) * 0.75) + round(($surchargePerPax * 2) * 0.75);
            } else if ($pax === 2) {
                // Double occupancy tent
                $roomTotal += ($basePerAdult + $surchargePerPax) * 2;
            } else if ($pax === 3) {
                // Triple occupancy tent: Double fare + 1 Extra Mattress per night
                $roomTotal += (($basePerAdult + $surchargePerPax) * 2) + ($mattressRate * $nights);
            } else {
                $roomTotal += ($basePerAdult + $surchargePerPax) * $pax;
            }
        }
    } else if ($adults === 1 && $children6To12 === 0) {
        $roomTotal = round(($basePerAdult * 2) * 0.75) + round(($surchargePerPax * 2) * 0.75);
    } else {
        $baseAdultsCost = ($basePerAdult + $surchargePerPax) * $adults;
        $mattressRate = ($accType === 'non_ac') ? ($seasonTier > 1 ? 5000 : 4500) : ($seasonTier > 1 ? 6000 : 5500);
        $extraChildCost = $children6To12 * $mattressRate * $nights;
        $roomTotal = $baseAdultsCost + $extraChildCost;
    }

    // Rann Utsav Official Vehicle & Cab Tariff Engine (Applies only to Rann Utsav packages)
    $transfer = strtolower(trim($input['transfer'] ?? $input['transfer_type'] ?? $input['cab_type'] ?? 'shared_coach'));
    $pickup = strtolower(trim($input['pickup_location'] ?? $input['pickup'] ?? ''));
    $drop = strtolower(trim($input['drop_location'] ?? $input['drop'] ?? ''));
    $driverAllowancePerDay = 300;
    $minKmPerDay = 300;
    $totalBillableKm = $days * $minKmPerDay;
    $totalDriverAllowance = $days * $driverAllowancePerDay;

    // 1. Point-to-Point Outstation Fixed Routes (All Inclusive)
    $isAhmedabadRoute = (strpos($pickup, 'ahmedabad') !== false || strpos($drop, 'ahmedabad') !== false);
    $isRajkotRoute = (strpos($pickup, 'rajkot') !== false || strpos($drop, 'rajkot') !== false);

    if ($isAhmedabadRoute && ($transfer === 'sedan' || $transfer === 'private_sedan' || $transfer === 'swift_dzire')) {
        $cabObj = ["label" => "Private AC Sedan (Ahmedabad ↔ Bhuj)", "sub" => "Swift Dzire • All Inclusive Point-to-Point Transfer", "cost" => 4500];
        $cabTotal = 4500;
    } else if ($isAhmedabadRoute && ($transfer === 'suv_ertiga' || $transfer === 'ertiga')) {
        $cabObj = ["label" => "Private AC SUV Ertiga (Ahmedabad ↔ Bhuj)", "sub" => "Maruti Ertiga • All Inclusive Point-to-Point Transfer", "cost" => 5500];
        $cabTotal = 5500;
    } else if ($isAhmedabadRoute && ($transfer === 'suv_innova' || $transfer === 'innova' || $transfer === 'private_suv')) {
        $cabObj = ["label" => "Private AC Innova Crysta (Ahmedabad ↔ Bhuj)", "sub" => "Toyota Innova Crysta • All Inclusive Transfer", "cost" => 7500];
        $cabTotal = 7500;
    } else if ($isRajkotRoute && ($transfer === 'sedan' || $transfer === 'private_sedan' || $transfer === 'swift_dzire')) {
        $cabObj = ["label" => "Private AC Sedan (Rajkot ↔ Bhuj)", "sub" => "Swift Dzire • All Inclusive Point-to-Point Transfer", "cost" => 4000];
        $cabTotal = 4000;
    } else if ($isRajkotRoute && ($transfer === 'suv_ertiga' || $transfer === 'ertiga')) {
        $cabObj = ["label" => "Private AC SUV Ertiga (Rajkot ↔ Bhuj)", "sub" => "Maruti Ertiga • All Inclusive Point-to-Point Transfer", "cost" => 5000];
        $cabTotal = 5000;
    } else if ($isRajkotRoute && ($transfer === 'suv_innova' || $transfer === 'innova' || $transfer === 'private_suv')) {
        $cabObj = ["label" => "Private AC Innova Crysta (Rajkot ↔ Bhuj)", "sub" => "Toyota Innova Crysta • All Inclusive Transfer", "cost" => 6500];
        $cabTotal = 6500;
    } else if ($transfer === 'sedan' || $transfer === 'private_sedan' || $transfer === 'swift_dzire') {
        // Swift Dzire: 14 Rs/KM + 300/Day DA (300 km/day avg min)
        $dzireKmCost = $totalBillableKm * 14;
        $dzireTotal = $dzireKmCost + $totalDriverAllowance;
        $cabObj = [
            "label" => "Private AC Sedan (Swift Dzire / Etios)", 
            "sub" => "{$days} Days Tour • ₹14/km ({$totalBillableKm} km min) + ₹{$totalDriverAllowance} Driver Allowance", 
            "cost" => $dzireTotal
        ];
        $cabTotal = $dzireTotal;
    } else if ($transfer === 'suv_ertiga' || $transfer === 'ertiga') {
        // Maruti Ertiga: 16 Rs/KM + 300/Day DA (300 km/day avg min)
        $ertigaKmCost = $totalBillableKm * 16;
        $ertigaTotal = $ertigaKmCost + $totalDriverAllowance;
        $cabObj = [
            "label" => "Private AC SUV (Maruti Ertiga)", 
            "sub" => "{$days} Days Tour • ₹16/km ({$totalBillableKm} km min) + ₹{$totalDriverAllowance} Driver Allowance", 
            "cost" => $ertigaTotal
        ];
        $cabTotal = $ertigaTotal;
    } else if ($transfer === 'suv_innova' || $transfer === 'innova' || $transfer === 'private_suv') {
        // Innova Crysta: 22 Rs/KM + 300/Day DA (300 km/day avg min)
        $innovaKmCost = $totalBillableKm * 22;
        $innovaTotal = $innovaKmCost + $totalDriverAllowance;
        $cabObj = [
            "label" => "Private AC Premium SUV (Toyota Innova Crysta)", 
            "sub" => "{$days} Days Tour • ₹22/km ({$totalBillableKm} km min) + ₹{$totalDriverAllowance} Driver Allowance", 
            "cost" => $innovaTotal
        ];
        $cabTotal = $innovaTotal;
    } else if ($transfer === 'tempo' || $transfer === 'tempo_12' || $transfer === 'tempo_traveller') {
        // Tempo Traveller: 28 Rs/KM + 500/Day DA
        $tempoKmCost = $totalBillableKm * 28;
        $tempoDA = $days * 500;
        $tempoTotal = $tempoKmCost + $tempoDA;
        $cabObj = [
            "label" => "Private AC Luxury Tempo Traveller (12-Seater)", 
            "sub" => "{$days} Days Tour • ₹28/km ({$totalBillableKm} km min) + ₹{$tempoDA} Driver Allowance", 
            "cost" => $tempoTotal
        ];
        $cabTotal = $tempoTotal;
    } else {
        // Default / Official Evoke Tent City: Fixed AC Shared Coach Bus Included (₹0)
        $cabObj = [
            "label" => "Official AC Shared Coach Bus Transfer", 
            "sub" => "Scheduled Pickup from Bhuj (08:15 AM, 10:00 AM, 01:30 PM, 03:30 PM) • Included at ₹0", 
            "cost" => 0
        ];
        $cabTotal = 0;
    }

    // Activities Rate
    $activityMap = [
        "paramotoring" => ["label" => "White Rann Paramotoring", "rate" => 2800],
        "camel_safari" => ["label" => "Camel Safari at Sunset", "rate" => 1200],
        "road_to_heaven" => ["label" => "Road to Heaven Drive & Photo Tour", "rate" => 1500]
    ];

    $actTotal = 0;
    $actNames = [];
    foreach ($activities as $actKey) {
        if (isset($activityMap[$actKey])) {
            $actTotal += $activityMap[$actKey]['rate'] * $totalOccupants;
            $actNames[] = $activityMap[$actKey]['label'];
        }
    }

    $subtotal = $roomTotal + $cabTotal + $actTotal;

    // Coupon Calculation
    $discountAmount = 0;
    $couponApplied = false;
    $couponDetails = null;

    if (!empty($couponCode) && isset($rateCard['coupons'][$couponCode])) {
        $couponDetails = $rateCard['coupons'][$couponCode];
        $percent = $couponDetails['discount_percent'];
        $discountAmount = round($subtotal * ($percent / 100));
        $couponApplied = true;
    }

    $discountedSubtotal = max(0, $subtotal - $discountAmount);
    $gst18 = round($discountedSubtotal * 0.18);
    $totalPackageFare = $discountedSubtotal + $gst18;
    $perPersonFare = round($totalPackageFare / max(1, $totalOccupants));

    echo json_encode([
        "status" => "success",
        "input" => [
            "check_in" => $checkIn,
            "check_out" => $checkOut,
            "nights" => $nights,
            "days" => $days,
            "adults" => $adults,
            "children_6_12" => $children6To12,
            "children_under_6" => $childrenUnder6,
            "total_occupants" => $totalOccupants
        ],
        "season" => [
            "tier" => $seasonTier,
            "name" => $season['name'],
            "type" => $season['type'],
            "surcharge_per_pax" => $surchargePerPax
        ],
        "coupon" => [
            "applied" => $couponApplied,
            "code" => $couponCode,
            "details" => $couponDetails,
            "discount_amount" => $discountAmount
        ],
        "breakdown" => [
            "room_label" => $roomObj['label'],
            "room_sub" => $roomObj['sub'],
            "room_total" => $roomTotal,
            "cab_label" => $cabObj['label'],
            "cab_sub" => $cabObj['sub'],
            "cab_total" => $cabTotal,
            "activities" => $actNames,
            "activities_total" => $actTotal,
            "subtotal" => $subtotal,
            "discount" => $discountAmount,
            "discounted_subtotal" => $discountedSubtotal,
            "tax_18_percent" => $gst18
        ],
        "pricing" => [
            "total_package_fare" => $totalPackageFare,
            "per_person_fare" => $perPersonFare
        ]
    ]);
    exit;
}
