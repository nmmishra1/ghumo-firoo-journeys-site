<?php
// quote_calculator.php - Dynamic Quoting & Pricing Calculator
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$hotelId = $input['hotel_id'] ?? null;
$hotelContractId = $input['hotel_contract_id'] ?? null;
$excursions = $input['excursion_contract_ids'] ?? [];
$transferContractId = $input['transfer_contract_id'] ?? null;

$nights = intval($input['nights'] ?? 1);
$adults = intval($input['adults'] ?? 1);
$children = intval($input['children'] ?? 0);
$marginPercent = floatval($input['margin'] ?? 10.00);

try {
    $pdo = getDb();
    
    $totalCost = 0.00;
    $breakdown = [];

    // 1. Hotel Calculations
    if ($hotelContractId || $hotelId) {
        if ($hotelContractId) {
            $stmt = $pdo->prepare("SELECT * FROM hotel_contracts WHERE id = ?");
            $stmt->execute([$hotelContractId]);
        } else {
            // Find active contract for this hotel
            $stmt = $pdo->prepare("SELECT * FROM hotel_contracts WHERE hotel_id = ? AND valid_from <= CURDATE() AND valid_to >= CURDATE() LIMIT 1");
            $stmt->execute([$hotelId]);
        }
        $contract = $stmt->fetch();
        if ($contract) {
            $baseRate = floatval($contract['contract_rate']);
            $taxRate = floatval($contract['tax_percentage'] ?? 18.00);
            $cost = $baseRate * $nights;
            $tax = $cost * ($taxRate / 100);
            $totalHotelCost = $cost + $tax;
            
            $totalCost += $totalHotelCost;
            $breakdown[] = [
                'type' => 'hotel',
                'name' => 'Hotel Accommodation',
                'detail' => ($contract['room_type'] ?? 'Standard') . " Room x {$nights} Nights",
                'qty' => $nights,
                'rate' => $baseRate + ($baseRate * ($taxRate / 100)),
                'total' => $totalHotelCost
            ];
        }
    }

    // 2. Excursion Calculations
    if (!empty($excursions)) {
        foreach ($excursions as $excId) {
            $stmt = $pdo->prepare("SELECT * FROM excursion_contracts WHERE id = ?");
            $stmt->execute([$excId]);
            $exc = $stmt->fetch();
            if ($exc) {
                $adultRate = floatval($exc['adult_rate']);
                $childRate = floatval($exc['child_rate'] ?? 0.00);
                $gstRate = floatval($exc['gst_percentage'] ?? 18.00);

                $cost = ($adultRate * $adults) + ($childRate * $children);
                $tax = $cost * ($gstRate / 100);
                $totalExcCost = $cost + $tax;

                $totalCost += $totalExcCost;
                $breakdown[] = [
                    'type' => 'excursion',
                    'name' => $exc['excursion_name'],
                    'detail' => "{$adults} Adults, {$children} Children",
                    'qty' => $adults + $children,
                    'rate' => ($cost / ($adults + $children ?: 1)) * (1 + ($gstRate / 100)),
                    'total' => $totalExcCost
                ];
            }
        }
    }

    // 3. Transfer Calculations
    if ($transferContractId) {
        $stmt = $pdo->prepare("SELECT * FROM transfer_contracts WHERE id = ?");
        $stmt->execute([$transferContractId]);
        $trans = $stmt->fetch();
        if ($trans) {
            $rate = floatval($trans['rate']);
            $totalCost += $rate;
            $breakdown[] = [
                'type' => 'transfer',
                'name' => 'Local Transfers',
                'detail' => $trans['vehicle_type'] . " Private Cab",
                'qty' => 1,
                'rate' => $rate,
                'total' => $rate
            ];
        }
    }

    // Calculate final selling price based on profit margin markup
    $markup = $totalCost * ($marginPercent / 100);
    $sellingPrice = $totalCost + $markup;

    echo json_encode([
        'success' => true,
        'total_cost' => $totalCost,
        'margin_percentage' => $marginPercent,
        'markup_amount' => $markup,
        'selling_price' => $sellingPrice,
        'items' => $breakdown
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Pricing engine calculation failed: ' . $e->getMessage()]);
}
