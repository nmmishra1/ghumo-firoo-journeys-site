<?php
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden: Seed scripts can only be executed via PHP CLI Terminal.']);
    exit(1);
}

// seed_hotels_india.php - Seeds realistic contracted hotels and room rates for famous cities in India
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    
    // Clear existing hotels and contracts to avoid duplicate key violations
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE hotel_contracts;");
    $pdo->exec("TRUNCATE TABLE hotels;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // List of famous hotels to seed
    $hotelsData = [
        // New Delhi (City ID: 88)
        ['name' => 'The Taj Mahal Hotel New Delhi', 'city_id' => 88, 'star' => 5, 'room' => 'Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
        ['name' => 'The Lalit New Delhi', 'city_id' => 88, 'star' => 5, 'room' => 'Executive Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 11000],
        ['name' => 'Radisson Blu Connaught Place', 'city_id' => 88, 'star' => 4, 'room' => 'Superior Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500],
        
        // Jaipur (City ID: 59)
        ['name' => 'Rambagh Palace Jaipur', 'city_id' => 59, 'star' => 5, 'room' => 'Palace Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 25000],
        ['name' => 'Taj Amer Palace Jaipur', 'city_id' => 59, 'star' => 5, 'room' => 'Luxury Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16000],
        ['name' => 'ITC Rajputana Jaipur', 'city_id' => 59, 'star' => 5, 'room' => 'Executive Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9000],
        ['name' => 'Jai Mahal Palace', 'city_id' => 59, 'star' => 5, 'room' => 'Deluxe Garden View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 13500],

        // Udaipur (City ID: 60)
        ['name' => 'Taj Lake Palace Udaipur', 'city_id' => 60, 'star' => 5, 'room' => 'Lake View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 28000],
        ['name' => 'The Leela Palace Udaipur', 'city_id' => 60, 'star' => 5, 'room' => 'Grand Lake View Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 22000],
        ['name' => 'Trident Hotel Udaipur', 'city_id' => 60, 'star' => 4, 'room' => 'Garden View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500],

        // Rishikesh (City ID: 82)
        ['name' => 'Taj Rishikesh Resort & Spa', 'city_id' => 82, 'star' => 5, 'room' => 'Deluxe Valley View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 18000],
        ['name' => 'Ganga Kinare Riverside Boutique', 'city_id' => 82, 'star' => 4, 'room' => 'Ganges View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7000],
        ['name' => 'Aloft Rishikesh', 'city_id' => 82, 'star' => 4, 'room' => 'Breezy Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500],

        // Agra (City ID: 76)
        ['name' => 'The Oberoi Amarvilas Agra', 'city_id' => 76, 'star' => 5, 'room' => 'Premier Taj View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 24000],
        ['name' => 'ITC Mughal Agra', 'city_id' => 76, 'star' => 5, 'room' => 'Mughal Chamber Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500],
        ['name' => 'Crystal Sarovar Premiere', 'city_id' => 76, 'star' => 4, 'room' => 'Deluxe Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 6000],

        // Varanasi (City ID: 77)
        ['name' => 'Taj Ganges Varanasi', 'city_id' => 77, 'star' => 5, 'room' => 'Executive Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 11500],
        ['name' => 'BrijRama Palace Heritage Hotel', 'city_id' => 77, 'star' => 5, 'room' => 'River View Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 15000],

        // Manali (City ID: 23)
        ['name' => 'Solang Valley Resort Manali', 'city_id' => 23, 'star' => 4, 'room' => 'River View Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9500],
        ['name' => 'Span Resort & Spa', 'city_id' => 23, 'star' => 5, 'room' => 'Grand Deluxe Cottages', 'plan' => 'CP (Breakfast Incl)', 'rate' => 15500],
        
        // Shimla (City ID: 22)
        ['name' => 'The Oberoi Cecil Shimla', 'city_id' => 22, 'star' => 5, 'room' => 'Luxury Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
        ['name' => 'Radisson Jass Shimla', 'city_id' => 22, 'star' => 4, 'room' => 'Deluxe Valley View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9000],

        // North Goa (City ID: 14)
        ['name' => 'Taj Fort Aguada Resort Goa', 'city_id' => 14, 'star' => 5, 'room' => 'Garden View Chalet', 'plan' => 'CP (Breakfast Incl)', 'rate' => 15000],
        ['name' => 'W Goa Beach Resort', 'city_id' => 14, 'star' => 5, 'room' => 'Wonderful Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 17500],
        ['name' => 'Novotel Goa Candolim', 'city_id' => 14, 'star' => 4, 'room' => 'Superior Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7000],

        // South Goa (City ID: 15)
        ['name' => 'The Leela Goa Resort', 'city_id' => 15, 'star' => 5, 'room' => 'Lagoon Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 22000],
        ['name' => 'Taj Exotica Resort & Spa Goa', 'city_id' => 15, 'star' => 5, 'room' => 'Garden Villa Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 19500],

        // Munnar (City ID: 34)
        ['name' => 'Elixir Hills Suites Munnar', 'city_id' => 34, 'star' => 5, 'room' => 'Valley View Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 10500],
        ['name' => 'Tea County Hill Resort', 'city_id' => 34, 'star' => 4, 'room' => 'Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6000],

        // Alleppey (City ID: 35)
        ['name' => 'Lake Palace Resort Alleppey', 'city_id' => 35, 'star' => 4, 'room' => 'Lake View Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9000],
        ['name' => 'Ramada by Wyndham Alleppey', 'city_id' => 35, 'star' => 4, 'room' => 'Superior Canal View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500],

        // Srinagar (City ID: 89)
        ['name' => 'Taj Vivanta Dal View Srinagar', 'city_id' => 89, 'star' => 5, 'room' => 'Superior Dal View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16500],
        ['name' => 'The Lalit Grand Palace Srinagar', 'city_id' => 89, 'star' => 5, 'room' => 'Palace Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],

        // Leh (City ID: 92)
        ['name' => 'The Grand Dragon Ladakh', 'city_id' => 92, 'star' => 5, 'room' => 'Premier Mountain View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 12500],
        ['name' => 'Hotel Singge Palace Leh', 'city_id' => 92, 'star' => 4, 'room' => 'Super Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6000],

        // Havelock Island (City ID: 95)
        ['name' => 'Taj Exotica Resort Havelock', 'city_id' => 95, 'star' => 5, 'room' => 'Deluxe Villa', 'plan' => 'CP (Breakfast Incl)', 'rate' => 24000],
        ['name' => 'Barefoot at Havelock Resort', 'city_id' => 95, 'star' => 4, 'room' => 'Tented Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 13000],

        // Pondicherry (City ID: 96)
        ['name' => 'Palais de Mahe French Villa', 'city_id' => 96, 'star' => 5, 'room' => 'Standard Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 12000],
        ['name' => 'The Promenade Pondicherry', 'city_id' => 96, 'star' => 4, 'room' => 'Sea View Deluxe', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500],

        // Hampi (City ID: 29)
        ['name' => 'Evolve Back Kamalapura Palace Hampi', 'city_id' => 29, 'star' => 5, 'room' => 'Jal Mahal Palace Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 28000],
        ['name' => 'Heritage Resort Hampi', 'city_id' => 29, 'star' => 4, 'room' => 'Deluxe Villa', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9500]
    ];

    $seededCount = 0;
    foreach ($hotelsData as $h) {
        // Insert into hotels table
        $stmt = $pdo->prepare("
            INSERT INTO hotels (name, city_id, star_category, is_active) 
            VALUES (?, ?, ?, 1)
        ");
        $stmt->execute([$h['name'], $h['city_id'], $h['star']]);
        
        $hotelId = $pdo->lastInsertId();

        // Insert into hotel_contracts table
        $stmt2 = $pdo->prepare("
            INSERT INTO hotel_contracts (hotel_id, room_type, meal_plan, contract_rate, valid_from, valid_to)
            VALUES (?, ?, ?, ?, '2026-01-01', '2026-12-31')
        ");
        // Using hotel ID as a string to reference back
        $stmt2->execute([$h['name'], $h['room'], $h['plan'], $h['rate']]);
        
        $seededCount++;
    }

    echo json_encode([
        'success' => true,
        'message' => "Successfully seeded {$seededCount} Indian hotels and contract rates"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to seed hotels data: ' . $e->getMessage()]);
}
