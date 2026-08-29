<?php
// seed_hotels_india_massive.php - Seeds a massive, comprehensive database of famous hotels for ALL 96 cities across all Indian States and UTs
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    
    // Clear existing hotels, contracts, and rates to avoid duplicate key violations
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE hotel_contracts;");
    $pdo->exec("TRUNCATE TABLE hotel_rates;");
    $pdo->exec("TRUNCATE TABLE hotels;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // City mappings with 3-4 famous hotels each
    $cityHotels = [
        1 => [ // Visakhapatnam
            ['name' => 'Welcomhotel by ITC Grand Bay Visakhapatnam', 'star' => 5, 'room' => 'Executive Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500],
            ['name' => 'Novotel Visakhapatnam Varun Beach', 'star' => 5, 'room' => 'Superior Ocean View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 12500],
            ['name' => 'The Gateway Hotel Marine Drive', 'star' => 4, 'room' => 'Standard Garden View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7000]
        ],
        2 => [ // Tirupati
            ['name' => 'Marasa Sarovar Premiere Tirupati', 'star' => 5, 'room' => 'Premier Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500],
            ['name' => 'Taj Tirupati', 'star' => 5, 'room' => 'Superior Temple View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 11000],
            ['name' => 'Fortune Select Grand Ridge Tirupati', 'star' => 4, 'room' => 'Standard Deluxe', 'plan' => 'CP (Breakfast Incl)', 'rate' => 5500]
        ],
        3 => [ // Araku Valley
            ['name' => 'Haritha Hill Resort Araku', 'star' => 3, 'room' => 'AC Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 3500],
            ['name' => 'Araku Valley Valley Resort', 'star' => 3, 'room' => 'Standard Cottage', 'plan' => 'EP (Room Only)', 'rate' => 2800],
            ['name' => 'Krishna Tara Comforts Araku', 'star' => 3, 'room' => 'Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 3000]
        ],
        4 => [ // Tawang
            ['name' => 'Hotel Tawang Vista', 'star' => 3, 'room' => 'Deluxe Valley View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 4500],
            ['name' => 'Hotel Gakyi Khang Zhang Tawang', 'star' => 4, 'room' => 'Suite Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500],
            ['name' => 'Tawang Heights Hotel', 'star' => 3, 'room' => 'Standard Cozy', 'plan' => 'CP (Breakfast Incl)', 'rate' => 3800]
        ],
        5 => [ // Ziro Valley
            ['name' => 'Ziro Valley Resort', 'star' => 3, 'room' => 'Premium Pine Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 5000],
            ['name' => 'Hotel Blue Pine Ziro', 'star' => 3, 'room' => 'Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 3500],
            ['name' => 'Siiro Resort Ziro', 'star' => 3, 'room' => 'Bamboo Cottage', 'plan' => 'EP (Room Only)', 'rate' => 4000]
        ],
        6 => [ // Guwahati
            ['name' => 'Radisson Blu Hotel Guwahati', 'star' => 5, 'room' => 'Business Class Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9000],
            ['name' => 'Vivanta Guwahati', 'star' => 5, 'room' => 'Superior Lake View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 11500],
            ['name' => 'Kiranshree Grand Guwahati', 'star' => 5, 'room' => 'Executive Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 10500]
        ],
        7 => [ // Kaziranga
            ['name' => 'Borgos Resort Kaziranga', 'star' => 4, 'room' => 'Luxury Tent Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 12000],
            ['name' => 'Iora - The Retreat Kaziranga', 'star' => 4, 'room' => 'Supreme Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500],
            ['name' => 'Diphlu River Lodge Kaziranga', 'star' => 5, 'room' => 'Riverfront Cottage', 'plan' => 'AP (All Meals)', 'rate' => 22000]
        ],
        8 => [ // Majuli
            ['name' => 'La Maison de Ananda Majuli', 'star' => 2, 'room' => 'Traditional Mishing Bamboo Hut', 'plan' => 'EP (Room Only)', 'rate' => 2500],
            ['name' => 'Majuli Cottage Guest House', 'star' => 2, 'room' => 'Standard Non-AC', 'plan' => 'CP (Breakfast Incl)', 'rate' => 1800],
            ['name' => 'Ygdrasill Bamboo Cottage', 'star' => 2, 'room' => 'River View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 2200]
        ],
        9 => [ // Gaya
            ['name' => 'Maha Bodhi Hotel Bodhgaya', 'star' => 4, 'room' => 'Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6000],
            ['name' => 'Hotel Buddha International Bodhgaya', 'star' => 3, 'room' => 'Standard AC Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4000],
            ['name' => 'Sambodhi Retreat Bodhgaya', 'star' => 4, 'room' => 'Premium Villa Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 7500]
        ],
        10 => [ // Patna
            ['name' => 'Lemon Tree Premier Patna', 'star' => 5, 'room' => 'Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8000],
            ['name' => 'Hotel Maurya Patna', 'star' => 4, 'room' => 'Club Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9500],
            ['name' => 'Gargee Grand Patna', 'star' => 4, 'room' => 'Suite Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7000]
        ],
        11 => [ // Nalanda
            ['name' => 'Hotel Gargee Gautam Vihar Rajgir', 'star' => 3, 'room' => 'AC Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 3500],
            ['name' => 'Nalanda Regency Rajgir', 'star' => 4, 'room' => 'Royal Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 5500],
            ['name' => 'Rajgir Residency Hotel', 'star' => 3, 'room' => 'Standard Cozy Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4000]
        ],
        12 => [ // Jagdalpur
            ['name' => 'Naman Bastar Resort Jagdalpur', 'star' => 3, 'room' => 'AC Cottage', 'plan' => 'CP (Breakfast Incl)', 'rate' => 5500],
            ['name' => 'Hotel Rainbow Jagdalpur', 'star' => 3, 'room' => 'Superior Room', 'plan' => 'EP (Room Only)', 'rate' => 3000],
            ['name' => 'Bastar Jungle Resort', 'star' => 3, 'room' => 'Eco-Wooden Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 6000]
        ],
        13 => [ // Raipur
            ['name' => 'Courtyard by Marriott Raipur', 'star' => 5, 'room' => 'Executive Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500],
            ['name' => 'Hyatt Raipur', 'star' => 4, 'room' => 'Standard King', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500],
            ['name' => 'Sayaji Raipur', 'star' => 5, 'room' => 'Grand Deluxe Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 11000]
        ],
        14 => [ // North Goa
            ['name' => 'Taj Fort Aguada Resort Goa', 'star' => 5, 'room' => 'Garden View Chalet', 'plan' => 'CP (Breakfast Incl)', 'rate' => 15000],
            ['name' => 'W Goa Beach Resort Candolim', 'star' => 5, 'room' => 'Wonderful Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 17500],
            ['name' => 'Novotel Goa Candolim', 'star' => 4, 'room' => 'Superior Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7000],
            ['name' => 'Vivanta Goa Panaji', 'star' => 5, 'room' => 'Premium River View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 13000]
        ],
        15 => [ // South Goa
            ['name' => 'The Leela Goa Resort Cavelossim', 'star' => 5, 'room' => 'Lagoon Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 22000],
            ['name' => 'Taj Exotica Resort & Spa Benaulim', 'star' => 5, 'room' => 'Garden Villa Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 19500],
            ['name' => 'ITC Grand Goa Resort & Spa', 'star' => 5, 'room' => 'Park Suite Lake View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 18000]
        ],
        16 => [ // Ahmedabad
            ['name' => 'Hyatt Regency Ahmedabad', 'star' => 5, 'room' => 'Riverfront Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500],
            ['name' => 'Radisson Blu Hotel Ahmedabad', 'star' => 4, 'room' => 'Deluxe Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 7000],
            ['name' => 'The House of MG Heritage Hotel', 'star' => 4, 'room' => 'Mangaldas Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9000]
        ],
        17 => [ // Rann of Kutch
            ['name' => 'Rann Riders Safari Resort', 'star' => 3, 'room' => 'Kooba Eco Cottage', 'plan' => 'AP (All Meals)', 'rate' => 11000],
            ['name' => 'Tent City Kutch (White Rann)', 'star' => 4, 'room' => 'Premium AC Tent', 'plan' => 'AP (All Meals)', 'rate' => 15000],
            ['name' => 'Gateway to Rann Resort Dhordo', 'star' => 3, 'room' => 'Darbar Bhunga Cottage', 'plan' => 'AP (All Meals)', 'rate' => 9500]
        ],
        18 => [ // Dwarka
            ['name' => 'Lemon Tree Premier Dwarka', 'star' => 4, 'room' => 'Superior Temple View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500],
            ['name' => 'Club Mahindra Dwarka Resort', 'star' => 4, 'room' => 'Studio Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 8000],
            ['name' => 'Hotel Dwarikadhish Temple View', 'star' => 3, 'room' => 'Deluxe AC Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4000]
        ],
        19 => [ // Gir National Park
            ['name' => 'The Fern Gir Forest Resort Sasan', 'star' => 4, 'room' => 'Fern Club Cottage', 'plan' => 'AP (All Meals)', 'rate' => 12500],
            ['name' => 'Woods at Sasan Gir', 'star' => 5, 'room' => 'Luxury Pavilion Room', 'plan' => 'AP (All Meals)', 'rate' => 21000],
            ['name' => 'Gir Birding Lodge Resort', 'star' => 3, 'room' => 'Standard Mud Cabin', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 7500]
        ],
        20 => [ // Gurgaon
            ['name' => 'The Oberoi Gurugram Delhi NCR', 'star' => 5, 'room' => 'Deluxe Pool View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 18000],
            ['name' => 'Trident Gurgaon Hotel', 'star' => 5, 'room' => 'Superior Garden View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
            ['name' => 'The Leela Ambience Gurugram', 'star' => 5, 'room' => 'Executive Club Premier', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16500]
        ],
        21 => [ // Kurukshetra
            ['name' => 'Hotel Kimaya Kurukshetra', 'star' => 3, 'room' => 'Deluxe Cozy Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 3500],
            ['name' => 'Divine Temple View Guest House', 'star' => 3, 'room' => 'Standard Family Room', 'plan' => 'EP (Room Only)', 'rate' => 2500],
            ['name' => 'Hotel Saffron Gold Kurukshetra', 'star' => 3, 'room' => 'Executive Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4500]
        ],
        22 => [ // Shimla
            ['name' => 'Wildflower Hall Shimla Oberoi', 'star' => 5, 'room' => 'Deluxe Garden View Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 28000],
            ['name' => 'The Oberoi Cecil Shimla Mall Road', 'star' => 5, 'room' => 'Luxury Heritage Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
            ['name' => 'Radisson Jass Hotel Shimla', 'star' => 4, 'room' => 'Deluxe Valley View Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9000]
        ],
        23 => [ // Manali
            ['name' => 'Solang Valley Resort Manali', 'star' => 4, 'room' => 'River View Cabin', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9500],
            ['name' => 'Span Resort & Spa Manali highway', 'star' => 5, 'room' => 'Grand Deluxe Riverfront Cottage', 'plan' => 'CP (Breakfast Incl)', 'rate' => 15500],
            ['name' => 'The Himalayan Castle Resort Manali', 'star' => 4, 'room' => 'Chamber Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 10500]
        ],
        24 => [ // Dharamshala
            ['name' => 'Hyatt Regency Dharamshala Resort', 'star' => 5, 'room' => 'Clifton Room Valley View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 18000],
            ['name' => 'Fortune Park Moksha Dharamshala', 'star' => 4, 'room' => 'Standard Valley View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8000],
            ['name' => 'Welcomheritage Grace Hotel Dharamshala', 'star' => 3, 'room' => 'Heritage Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 5000]
        ],
        25 => [ // Dalhousie
            ['name' => 'Grand View Hotel Dalhousie', 'star' => 4, 'room' => 'Garden View Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 8500],
            ['name' => 'Snow Valley Resorts Dalhousie', 'star' => 3, 'room' => 'Premium Mountain View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 5500],
            ['name' => 'JK Clarks Exotica Dalhousie', 'star' => 4, 'room' => 'Executive Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500]
        ],
        26 => [ // Ranchi
            ['name' => 'Radisson Blu Hotel Ranchi', 'star' => 5, 'room' => 'Executive Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500],
            ['name' => 'Chanakya BNR Heritage Hotel Ranchi', 'star' => 4, 'room' => 'Standard Heritage Cabin', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 7000],
            ['name' => 'Hotel Capitol Hill Ranchi', 'star' => 3, 'room' => 'Deluxe AC Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4500]
        ],
        27 => [ // Netarhat
            ['name' => 'Hotel Prabhat Vihar Netarhat (JTDC)', 'star' => 3, 'room' => 'Sunset View Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 4000],
            ['name' => 'Netarhat Forest Retreat', 'star' => 3, 'room' => 'Pine Cabin Lodge', 'plan' => 'CP (Breakfast Incl)', 'rate' => 3500],
            ['name' => 'Royal Forest Camp Netarhat', 'star' => 3, 'room' => 'Deluxe Tented Cottage', 'plan' => 'AP (All Meals)', 'rate' => 6000]
        ],
        28 => [ // Bangalore
            ['name' => 'The Leela Palace Bengaluru', 'star' => 5, 'room' => 'Royal Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 17000],
            ['name' => 'Taj West End Bengaluru', 'star' => 5, 'room' => 'Heritage Wing Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 19500],
            ['name' => 'ITC Gardenia Bengaluru', 'star' => 5, 'room' => 'Executive Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 13500]
        ],
        29 => [ // Hampi
            ['name' => 'Evolve Back Kamalapura Palace Hampi', 'star' => 5, 'room' => 'Jal Mahal Palace Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 28000],
            ['name' => 'Heritage Resort Hampi Heritage', 'star' => 4, 'room' => 'Deluxe Villa Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9500],
            ['name' => 'Hyatt Place Hampi Jindal', 'star' => 4, 'room' => 'Standard Twin King', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500]
        ],
        30 => [ // Mysore
            ['name' => 'Grand Mercure Mysore Palace Road', 'star' => 5, 'room' => 'Deluxe Pool View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500],
            ['name' => 'Radisson Blu Plaza Hotel Mysore', 'star' => 5, 'room' => 'Superior Chamundi View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 11000],
            ['name' => 'Lalitha Mahal Palace Heritage Hotel', 'star' => 4, 'room' => 'Royal Suite Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 12500]
        ],
        31 => [ // Coorg
            ['name' => 'The Tamara Coorg Rain Forest', 'star' => 5, 'room' => 'Luxury Cottage Lodge', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 21000],
            ['name' => 'Taj Madikeri Resort & Spa Coorg', 'star' => 5, 'room' => 'Deluxe Rainforest Villa', 'plan' => 'CP (Breakfast Incl)', 'rate' => 24000],
            ['name' => 'Evolve Back Coorg Eco Resort', 'star' => 5, 'room' => 'Heritage Pool Villa', 'plan' => 'CP (Breakfast Incl)', 'rate' => 28500]
        ],
        32 => [ // Gokarna
            ['name' => 'Kahani Paradise Beach Resort', 'star' => 5, 'room' => 'Ocean Suite Villa', 'plan' => 'CP (Breakfast Incl)', 'rate' => 25000],
            ['name' => 'SwaSwara Wellness Retreat Gokarna', 'star' => 5, 'room' => 'Wellness Villa Hut', 'plan' => 'AP (All Meals)', 'rate' => 28000],
            ['name' => 'Kudle Beach View Resort Gokarna', 'star' => 3, 'room' => 'Standard Deluxe AC', 'plan' => 'CP (Breakfast Incl)', 'rate' => 5500]
        ],
        33 => [ // Cochin
            ['name' => 'Grand Hyatt Kochi Bolgatty Resort', 'star' => 5, 'room' => 'Club Sea View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 12500],
            ['name' => 'Taj Malabar Resort & Spa Cochin', 'star' => 5, 'room' => 'Heritage Tower Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 14500],
            ['name' => 'Brunton Boatyard CGH Earth Kochi', 'star' => 5, 'room' => 'Sea Facing Heritage Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 16000]
        ],
        34 => [ // Munnar
            ['name' => 'Elixir Hills Suites Munnar', 'star' => 5, 'room' => 'Valley View Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 10500],
            ['name' => 'Blanket Hotel & Spa Munnar', 'star' => 4, 'room' => 'Blanket Camellia Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500],
            ['name' => 'Tea County Hill Resort Munnar', 'star' => 4, 'room' => 'Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6000]
        ],
        35 => [ // Alleppey
            ['name' => 'Lake Palace Resort Alleppey lake', 'star' => 4, 'room' => 'Lake View Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9000],
            ['name' => 'Ramada by Wyndham Alleppey resort', 'star' => 4, 'room' => 'Superior Canal View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500],
            ['name' => 'Kumarakom Lake Resort Alleppey', 'star' => 5, 'room' => 'Meandering Pool Villa', 'plan' => 'CP (Breakfast Incl)', 'rate' => 24000]
        ],
        36 => [ // Wayanad
            ['name' => 'Vythiri Resort Wayanad Forest', 'star' => 4, 'room' => 'Tree House Cabin', 'plan' => 'AP (All Meals)', 'rate' => 18000],
            ['name' => 'The Windflower Resort & Spa Wayanad', 'star' => 4, 'room' => 'Windflower Villa Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 12000],
            ['name' => 'Banasura Hill Resort Wayanad', 'star' => 3, 'room' => 'Log Cabin Mud Haven', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8000]
        ],
        37 => [ // Kovalam
            ['name' => 'The Leela Kovalam Cliff Resort', 'star' => 5, 'room' => 'Club Sea View Cliff Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 18000],
            ['name' => 'Taj Green Cove Resort Kovalam', 'star' => 5, 'room' => 'Garden Side Villa Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16500],
            ['name' => 'Uday Samudra Leisure Beach Hotel Kovalam', 'star' => 4, 'room' => 'Superior Atrium Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500]
        ],
        38 => [ // Bhopal
            ['name' => 'Jehan Numa Palace Hotel Bhopal', 'star' => 5, 'room' => 'Regal Heritage Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500],
            ['name' => 'Courtyard by Marriott Bhopal City', 'star' => 5, 'room' => 'Executive Studio Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500],
            ['name' => 'Noor-Us-Sabah Palace Bhopal Heritage', 'star' => 4, 'room' => 'Royal Suite Lake View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 7500]
        ],
        39 => [ // Indore
            ['name' => 'Indore Marriott Hotel', 'star' => 5, 'room' => 'Premium Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9000],
            ['name' => 'Radisson Blu Hotel Indore Square', 'star' => 5, 'room' => 'Business Club Cabin', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 11000],
            ['name' => 'Sayaji Hotel Indore City', 'star' => 4, 'room' => 'Executive Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500]
        ],
        40 => [ // Khajuraho
            ['name' => 'The Lalit Temple View Khajuraho', 'star' => 5, 'room' => 'Temple View Room Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 11000],
            ['name' => 'Radisson Jass Hotel Khajuraho', 'star' => 4, 'room' => 'Deluxe Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 8000],
            ['name' => 'Hotel Ramada Khajuraho Temple', 'star' => 4, 'room' => 'Standard Deluxe AC', 'plan' => 'CP (Breakfast Incl)', 'rate' => 5500]
        ],
        41 => [ // Kanha National Park
            ['name' => 'Banjaar Tola Taj Safari Kanha', 'star' => 5, 'room' => 'Luxury Tented Suite Safari', 'plan' => 'AP (All Meals)', 'rate' => 35000],
            ['name' => 'Singinawa Jungle Lodge Kanha Forest', 'star' => 4, 'room' => 'Eco-Luxury Cottage', 'plan' => 'AP (All Meals)', 'rate' => 18000],
            ['name' => 'Shergarh Tented Camp Kanha', 'star' => 3, 'room' => 'Standard Tented Cabin', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 12500]
        ],
        42 => [ // Mumbai
            ['name' => 'The Taj Mahal Palace Colaba Mumbai', 'star' => 5, 'room' => 'Taj Palace Ocean View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 28000],
            ['name' => 'The Oberoi Mumbai Marine Drive', 'star' => 5, 'room' => 'Premier Ocean View Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 25000],
            ['name' => 'Trident Nariman Point Mumbai', 'star' => 5, 'room' => 'Superior City View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 13500]
        ],
        43 => [ // Pune
            ['name' => 'JW Marriott Hotel Pune', 'star' => 5, 'room' => 'Club Room Premium View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
            ['name' => 'Conrad Hotel Pune Centric', 'star' => 5, 'room' => 'Deluxe King Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16000],
            ['name' => 'Hyatt Regency Pune Viman Nagar', 'star' => 5, 'room' => 'Standard Executive Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9000]
        ],
        44 => [ // Mahabaleshwar
            ['name' => 'Le Meridien Mahabaleshwar Resort', 'star' => 5, 'room' => 'Forest View Villa Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 15500],
            ['name' => 'Brightland Resort & Spa Mahabaleshwar', 'star' => 4, 'room' => 'Maple Deluxe Cabin', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 10500],
            ['name' => 'Evershine Keys Prima Resort Mahabaleshwar', 'star' => 4, 'room' => 'Executive Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500]
        ],
        45 => [ // Aurangabad
            ['name' => 'Vivanta Aurangabad Heritage Garden', 'star' => 5, 'room' => 'Superior Garden View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500],
            ['name' => 'Welcomhotel by ITC Rama International', 'star' => 4, 'room' => 'Executive Club Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 8500],
            ['name' => 'Lemon Tree Hotel Aurangabad', 'star' => 3, 'room' => 'Standard Cozy Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 5500]
        ],
        46 => [ // Lonavala
            ['name' => 'Fariyas Resort Lonavala Cliff', 'star' => 4, 'room' => 'Premium Valley View Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 11000],
            ['name' => 'Della Resorts Lonavala Adventure', 'star' => 5, 'room' => 'Luxury Adventure Tent', 'plan' => 'CP (Breakfast Incl)', 'rate' => 16500],
            ['name' => 'The Machan Eco Resort Lonavala', 'star' => 4, 'room' => 'Forest Canopy Cabin', 'plan' => 'CP (Breakfast Incl)', 'rate' => 18000]
        ],
        47 => [ // Imphal
            ['name' => 'Classic Grande Imphal Hotel', 'star' => 4, 'room' => 'Executive Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500],
            ['name' => 'The Classic Hotel Imphal Centric', 'star' => 3, 'room' => 'Standard AC Cozy', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 4500],
            ['name' => 'Sangai Continental Boutique Imphal', 'star' => 4, 'room' => 'Premium Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7000]
        ],
        48 => [ // Loktak Lake
            ['name' => 'Sendra Park Resort by Classic Loktak', 'star' => 3, 'room' => 'Lakefront Villa Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 6000],
            ['name' => 'Loktak Floating Eco Cottages', 'star' => 2, 'room' => 'Traditional Floating Hut', 'plan' => 'AP (All Meals)', 'rate' => 4500],
            ['name' => 'Sendra Cottages Loktak lake view', 'star' => 3, 'room' => 'Standard Cabin', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4000]
        ],
        49 => [ // Shillong
            ['name' => 'Ri Kynjai Serenity by the Lake Shillong', 'star' => 5, 'room' => 'Lake View Cottage Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 16000],
            ['name' => 'Courtyard by Marriott Shillong City', 'star' => 5, 'room' => 'Executive Club King', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 14000],
            ['name' => 'Hotel Polo Towers Shillong Centric', 'star' => 4, 'room' => 'Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500]
        ],
        50 => [ // Cherrapunji
            ['name' => 'Polo Orchid Resort Cherrapunji', 'star' => 4, 'room' => 'Orchid Valley View Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 12500],
            ['name' => 'Jiva Resort Cherrapunji Luxury', 'star' => 4, 'room' => 'Jiva Premium Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 10500],
            ['name' => 'Cherrapunjee Holiday Resort Laitkynsew', 'star' => 3, 'room' => 'Standard Forest Cottage', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4500]
        ],
        51 => [ // Mawlynnong
            ['name' => 'Mawlynnong Bamboo Cottage Eco Lodge', 'star' => 2, 'room' => 'Standard Bamboo Hut', 'plan' => 'EP (Room Only)', 'rate' => 2500],
            ['name' => 'Ila Jong Homestay Mawlynnong', 'star' => 2, 'room' => 'Family Cozy Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 1800],
            ['name' => 'Stream Side Guest House Mawlynnong', 'star' => 2, 'room' => 'AC Cottage', 'plan' => 'CP (Breakfast Incl)', 'rate' => 2200]
        ],
        52 => [ // Aizawl
            ['name' => 'Hotel Regency Aizawl Mizoram', 'star' => 3, 'room' => 'Deluxe Mountain View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4500],
            ['name' => 'Hotel Ritz Aizawl City Center', 'star' => 3, 'room' => 'Standard AC Room', 'plan' => 'EP (Room Only)', 'rate' => 3500],
            ['name' => 'JHT Hotel Aizawl', 'star' => 3, 'room' => 'Executive Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 5500]
        ],
        53 => [ // Kohima
            ['name' => 'Hotel Japfu Kohima Heritage', 'star' => 3, 'room' => 'Standard Heritage Cozy', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4000],
            ['name' => 'The Heritage Hotel Kohima hills', 'star' => 3, 'room' => 'Valley View Cabin', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 5000],
            ['name' => 'Razhu Pru Heritage Home Kohima', 'star' => 3, 'room' => 'Bungalow Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 3500]
        ],
        54 => [ // Bhubaneswar
            ['name' => 'Trident Bhubaneswar Garden Hotel', 'star' => 5, 'room' => 'Superior Garden View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9000],
            ['name' => 'Mayfair Lagoon Resort Bhubaneswar', 'star' => 5, 'room' => 'Lagoon Suite Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 13500],
            ['name' => 'Vivanta Bhubaneswar Janpath', 'star' => 5, 'room' => 'Premium Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 10500]
        ],
        55 => [ // Puri
            ['name' => 'Mayfair Waves Beach Resort Puri', 'star' => 5, 'room' => 'Ocean View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
            ['name' => 'Toshali Sands Ethnic Resort Puri', 'star' => 4, 'room' => 'Standard Deluxe Villa', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 7500],
            ['name' => 'Hans Coco Palms Resort Puri Beach', 'star' => 4, 'room' => 'Coco Pool View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500]
        ],
        56 => [ // Konark
            ['name' => 'Lotus Eco Beach Resort Konark', 'star' => 3, 'room' => 'Eco-Luxury Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 7000],
            ['name' => 'Yatrika Konark Lodge (OTDC)', 'star' => 2, 'room' => 'AC Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 2500],
            ['name' => 'Labanya Lodge Konark temple side', 'star' => 2, 'room' => 'Standard Cozy Bed', 'plan' => 'EP (Room Only)', 'rate' => 1800]
        ],
        57 => [ // Amritsar
            ['name' => 'Taj Swarna Hotel Amritsar', 'star' => 5, 'room' => 'Executive Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 10500],
            ['name' => 'Hyatt Regency Amritsar Golden Temple', 'star' => 5, 'room' => 'Regency Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 12500],
            ['name' => 'Radisson Blu Hotel Amritsar highway', 'star' => 4, 'room' => 'Superior Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6000]
        ],
        58 => [ // Chandigarh
            ['name' => 'The Oberoi Sukhvilas Spa Resort', 'star' => 5, 'room' => 'Luxury Villa Pool Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 28000],
            ['name' => 'Taj Chandigarh Sector 17', 'star' => 5, 'room' => 'Superior Room Cozy', 'plan' => 'CP (Breakfast Incl)', 'rate' => 11000],
            ['name' => 'Hyatt Regency Chandigarh Centric', 'star' => 5, 'room' => 'Regency Club King', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 13500]
        ],
        59 => [ // Jaipur
            ['name' => 'Rambagh Palace Jaipur Heritage', 'star' => 5, 'room' => 'Palace Room Royal', 'plan' => 'CP (Breakfast Incl)', 'rate' => 25000],
            ['name' => 'Taj Amer Palace Jaipur resort', 'star' => 5, 'room' => 'Luxury Mountain View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16000],
            ['name' => 'ITC Rajputana Jaipur Palace', 'star' => 5, 'room' => 'Executive Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9000],
            ['name' => 'Jai Mahal Palace Garden Hotel', 'star' => 5, 'room' => 'Deluxe Garden Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 13500]
        ],
        60 => [ // Udaipur
            ['name' => 'Taj Lake Palace Udaipur Lake Pichola', 'star' => 5, 'room' => 'Lake View Palace Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 28000],
            ['name' => 'The Leela Palace Udaipur lakefront', 'star' => 5, 'room' => 'Grand Lake View Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 22000],
            ['name' => 'Trident Hotel Udaipur Aravali', 'star' => 4, 'room' => 'Garden View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500]
        ],
        61 => [ // Jodhpur
            ['name' => 'Umaid Bhawan Palace Jodhpur', 'star' => 5, 'room' => 'Historical Suite Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 29000],
            ['name' => 'Taj Hari Mahal Jodhpur Resort', 'star' => 5, 'room' => 'Garden View Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 14000],
            ['name' => 'Radisson Hotel Jodhpur Centric', 'star' => 4, 'room' => 'Superior AC Cozy', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7000]
        ],
        62 => [ // Jaisalmer
            ['name' => 'Suryagarh Jaisalmer Fort Hotel', 'star' => 5, 'room' => 'Heritage Fort Chamber', 'plan' => 'CP (Breakfast Incl)', 'rate' => 17000],
            ['name' => 'Marriott Resort & Spa Jaisalmer', 'star' => 5, 'room' => 'Fort View Premium Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 13500],
            ['name' => 'Desert Tulip Hotel Resort Jaisalmer', 'star' => 4, 'room' => 'Standard Deluxe AC', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6000]
        ],
        63 => [ // Pushkar
            ['name' => 'The Westin Pushkar Resort & Spa', 'star' => 5, 'room' => 'Private Pool Villa Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 12500],
            ['name' => 'Taj Gateway Resort Pushkar bypass', 'star' => 4, 'room' => 'Garden View Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9000],
            ['name' => 'Ananta Spa & Resort Pushkar hills', 'star' => 4, 'room' => 'Deluxe Valley View Cottage', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8000]
        ],
        64 => [ // Mount Abu
            ['name' => 'Welcomheritage Connaught House Abu', 'star' => 4, 'room' => 'Heritage Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500],
            ['name' => 'Hotel Hillock Mount Abu Centric', 'star' => 3, 'room' => 'Standard Garden View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 6000],
            ['name' => 'Palace Hotel Bikaner House Mount Abu', 'star' => 4, 'room' => 'Royal Heritage Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500]
        ],
        65 => [ // Gangtok
            ['name' => 'Mayfair Spa Resort & Casino Gangtok', 'star' => 5, 'room' => 'Imperial Villa Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
            ['name' => 'Elgin Nor-Khill Gangtok Heritage', 'star' => 4, 'room' => 'Deluxe Heritage Chamber', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 11000],
            ['name' => 'Welcomheritage Denzong Regency Gangtok', 'star' => 4, 'room' => 'Mountain View Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500]
        ],
        66 => [ // Pelling
            ['name' => 'The Elgin Mount Pandim Hotel Pelling', 'star' => 4, 'room' => 'Kanchenjunga View Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 10500],
            ['name' => 'Chumbi Mountain Retreat Spa Pelling', 'star' => 4, 'room' => 'Standard Deluxe AC', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8000],
            ['name' => 'Hotel Sonamchen Pelling view', 'star' => 3, 'room' => 'Standard Cozy view', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4500]
        ],
        67 => [ // Chennai
            ['name' => 'Taj Coromandel Nungambakkam Chennai', 'star' => 5, 'room' => 'Luxury Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 12500],
            ['name' => 'ITC Grand Chola Guindy Chennai', 'star' => 5, 'room' => 'Executive Club Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 15000],
            ['name' => 'The Leela Palace Chennai MRC Nagar', 'star' => 5, 'room' => 'Grand Ocean View Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 18000]
        ],
        68 => [ // Ooty
            ['name' => 'Savoy Ooty - IHCL SeleQtions', 'star' => 5, 'room' => 'Heritage Cottage Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
            ['name' => 'Accord Highland Ooty Resort', 'star' => 4, 'room' => 'Deluxe Valley View Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9000],
            ['name' => 'Sherlock Hotel Ooty Heritage', 'star' => 3, 'room' => 'Standard Fireplace Cottage', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6000]
        ],
        69 => [ // Kodaikanal
            ['name' => 'The Tamara Kodai Resort Hill', 'star' => 5, 'room' => 'Luxury Valley Suite Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 17000],
            ['name' => 'The Carlton Kodaikanal Lakefront', 'star' => 4, 'room' => 'Deluxe Lake View Cabin', 'plan' => 'CP (Breakfast Incl)', 'rate' => 11000],
            ['name' => 'Sterling Kodai Valley Resort', 'star' => 3, 'room' => 'Standard Cozy Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500]
        ],
        70 => [ // Madurai
            ['name' => 'Heritage Madurai resort', 'star' => 5, 'room' => 'Geoffrey Bawa Villa Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 10500],
            ['name' => 'Courtyard by Marriott Madurai City', 'star' => 4, 'room' => 'Deluxe Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 7500],
            ['name' => 'Gateway Hotel Pasumalai Madurai', 'star' => 4, 'room' => 'Standard Cottage Garden', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500]
        ],
        71 => [ // Rameshwaram
            ['name' => 'Daiwik Hotels Rameshwaram Centric', 'star' => 3, 'room' => 'Deluxe AC Cozy', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4500],
            ['name' => 'Hotel Jiwan Residency Rameshwaram', 'star' => 3, 'room' => 'Standard Double Temple View', 'plan' => 'EP (Room Only)', 'rate' => 3000],
            ['name' => 'Hyatt Place Rameshwaram Temple Road', 'star' => 4, 'room' => 'Standard King Twin', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500]
        ],
        72 => [ // Mahabalipuram
            ['name' => 'Radisson Blu Temple Bay Mahabalipuram', 'star' => 5, 'room' => 'Chalets Pool View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
            ['name' => 'InterContinental Chennai Mahabalipuram', 'star' => 5, 'room' => 'Grand Ocean View Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 17500],
            ['name' => 'Taj Fisherman\'s Cove Resort & Spa', 'star' => 5, 'room' => 'Garden Side Sea Villa Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 19000]
        ],
        73 => [ // Hyderabad
            ['name' => 'Taj Falaknuma Palace Hyderabad', 'star' => 5, 'room' => 'Palace Heritage Room Royal', 'plan' => 'CP (Breakfast Incl)', 'rate' => 32000],
            ['name' => 'ITC Kohenur HITEC City Hyderabad', 'star' => 5, 'room' => 'Executive Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
            ['name' => 'Park Hyatt Hyderabad Banjara Hills', 'star' => 5, 'room' => 'Hyatt Deluxe King Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16500]
        ],
        74 => [ // Warangal
            ['name' => 'Haritha Kakatiya Hotel Warangal (TSTDC)', 'star' => 3, 'room' => 'AC Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 3500],
            ['name' => 'Hotel City Grand Warangal Centric', 'star' => 3, 'room' => 'Standard Cozy AC', 'plan' => 'EP (Room Only)', 'rate' => 2500],
            ['name' => 'The Central Hotel Warangal City', 'star' => 3, 'room' => 'Executive Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4000]
        ],
        75 => [ // Agartala
            ['name' => 'Ginger Agartala Tripura Centric', 'star' => 3, 'room' => 'Standard Deluxe Cozy', 'plan' => 'CP (Breakfast Incl)', 'rate' => 3800],
            ['name' => 'Hotel Sonar Tori Agartala City', 'star' => 3, 'room' => 'AC Deluxe Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 5000],
            ['name' => 'Polo Towers Agartala Hotel Luxury', 'star' => 4, 'room' => 'Executive Club Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500]
        ],
        76 => [ // Agra
            ['name' => 'The Oberoi Amarvilas Agra Palace', 'star' => 5, 'room' => 'Premier Taj View Palace Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 24000],
            ['name' => 'Taj Hotel & Convention Centre Agra', 'star' => 5, 'room' => 'Luxury Taj View Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 12000],
            ['name' => 'ITC Mughal Hotel Agra Heritage', 'star' => 5, 'room' => 'Mughal Chamber Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500]
        ],
        77 => [ // Varanasi
            ['name' => 'Taj Ganges Varanasi Gardens', 'star' => 5, 'room' => 'Executive Garden View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 11500],
            ['name' => 'BrijRama Palace Varanasi Ghats Heritage', 'star' => 5, 'room' => 'Ghat River View Palace Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 15000],
            ['name' => 'Radisson Hotel Varanasi Centric', 'star' => 4, 'room' => 'Superior AC Cozy Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7000]
        ],
        78 => [ // Lucknow
            ['name' => 'Taj Mahal Lucknow Gomti Nagar', 'star' => 5, 'room' => 'Palace Garden View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 13500],
            ['name' => 'Hyatt Regency Lucknow City Center', 'star' => 5, 'room' => 'Regency Suite Room King', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 11000],
            ['name' => 'Renaissance Lucknow Gomti view', 'star' => 5, 'room' => 'Superior River View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500]
        ],
        79 => [ // Ayodhya
            ['name' => 'Ramayana Hotel Ayodhya Saryu View', 'star' => 4, 'room' => 'Executive AC Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8000],
            ['name' => 'Hotel Panchsheel Ayodhya City', 'star' => 3, 'room' => 'Standard Deluxe Cozy', 'plan' => 'EP (Room Only)', 'rate' => 4500],
            ['name' => 'Taj Ayodhya Resort Palace (Seeded)', 'star' => 5, 'room' => 'Luxury Palace Suite View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 18000]
        ],
        80 => [ // Dehradun
            ['name' => 'Hyatt Regency Dehradun Rajpur Hills', 'star' => 5, 'room' => 'Regency Club Valley View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 11000],
            ['name' => 'Fairfield by Marriott Dehradun City', 'star' => 4, 'room' => 'Premium Mountain View', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 8500],
            ['name' => 'Hotel President Dehradun Centric', 'star' => 3, 'room' => 'Standard Deluxe AC', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4500]
        ],
        81 => [ // Haridwar
            ['name' => 'Pilibhit House Haridwar IHCL SeleQtions', 'star' => 5, 'room' => 'Ganges View Luxury Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16500],
            ['name' => 'Amatra by the Ganges Haridwar resort', 'star' => 4, 'room' => 'Riverfront Suite Villa', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500],
            ['name' => 'Haveli Hari Ganga Hotel Haridwar', 'star' => 4, 'room' => 'Standard Heritage Courtyard', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8000]
        ],
        82 => [ // Rishikesh
            ['name' => 'Taj Rishikesh Resort & Spa Singtali', 'star' => 5, 'room' => 'Deluxe River View Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 18000],
            ['name' => 'Ganga Kinare Riverside Boutique Rishikesh', 'star' => 4, 'room' => 'River Facing Deluxe Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7000],
            ['name' => 'Aloft Rishikesh Laxman Jhula', 'star' => 4, 'room' => 'Breezy Valley View Cabin', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500]
        ],
        83 => [ // Mussoorie
            ['name' => 'JW Marriott Mussoorie Walnut Grove Resort', 'star' => 5, 'room' => 'Valley View Premium Balcony', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 22000],
            ['name' => 'Savoy Mussoorie IHCL SeleQtions', 'star' => 5, 'room' => 'Savoy Heritage Suite Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 18000],
            ['name' => 'Welcomhotel by ITC The Savoy Mussoorie', 'star' => 5, 'room' => 'Executive Club Mountain Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 15000]
        ],
        84 => [ // Nainital
            ['name' => 'The Naini Retreat Nainital Hill', 'star' => 4, 'room' => 'Garden View Suite Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 10500],
            ['name' => 'The Manu Maharani Nainital Lakefront', 'star' => 4, 'room' => 'Premium Lake View Cabin', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9000],
            ['name' => 'Shervani Hilltop Nainital resort', 'star' => 3, 'room' => 'Standard Hill View Cozy', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6000]
        ],
        85 => [ // Kolkata
            ['name' => 'Taj Bengal Kolkata Alipore', 'star' => 5, 'room' => 'Luxury Club Garden View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 11500],
            ['name' => 'The Oberoi Grand Kolkata Chowringhee', 'star' => 5, 'room' => 'Classic Heritage Courtyard Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16500],
            ['name' => 'ITC Royal Bengal Kolkata EM Bypass', 'star' => 5, 'room' => 'Executive Palace Suite Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000]
        ],
        86 => [ // Darjeeling
            ['name' => 'Windamere Hotel Darjeeling Heritage Mall', 'star' => 4, 'room' => 'Heritage colonial Suite Room', 'plan' => 'AP (All Meals)', 'rate' => 14500],
            ['name' => 'Cedar Inn Hotel Darjeeling mountain view', 'star' => 4, 'room' => 'Kanchenjunga View Deluxe Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 9500],
            ['name' => 'The Elgin Darjeeling Heritage Luxury', 'star' => 4, 'room' => 'Standard Heritage Chamber', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9000]
        ],
        87 => [ // Sundarbans
            ['name' => 'Sunderban Tiger Camp Eco Resort', 'star' => 3, 'room' => 'Eco-Wooden Jungle Cottage', 'plan' => 'AP (All Meals)', 'rate' => 9500],
            ['name' => 'Sundarban Riverside Holiday Resort', 'star' => 3, 'room' => 'Standard River facing Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 6500],
            ['name' => 'Solitary Nook Resort Sundarbans', 'star' => 3, 'room' => 'AC Deluxe Mud Cottage', 'plan' => 'CP (Breakfast Incl)', 'rate' => 4500]
        ],
        88 => [ // New Delhi
            ['name' => 'The Taj Mahal Hotel Mansingh Road Delhi', 'star' => 5, 'room' => 'Deluxe City View Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
            ['name' => 'The Lalit New Delhi Barakhamba Road', 'star' => 5, 'room' => 'Executive Club Suite Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 11000],
            ['name' => 'Radisson Blu Hotel Connaught Place Marina', 'star' => 4, 'room' => 'Superior AC Cozy Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500]
        ],
        999 => [], // Reserved placeholder
        89 => [ // Srinagar
            ['name' => 'Taj Vivanta Dal View Srinagar Lake', 'star' => 5, 'room' => 'Superior View Valley Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16500],
            ['name' => 'The Lalit Grand Palace Srinagar gardens', 'star' => 5, 'room' => 'Palace Heritage Lake Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 14000],
            ['name' => 'The Orchard Retreat & Spa Srinagar hills', 'star' => 4, 'room' => 'Deluxe Apple Orchard Cabin', 'plan' => 'CP (Breakfast Incl)', 'rate' => 10500]
        ],
        90 => [ // Gulmarg
            ['name' => 'The Khyber Mountain Resort Gulmarg', 'star' => 5, 'room' => 'Premier Pine View Gondola Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 24000],
            ['name' => 'Hotel Highlands Park Gulmarg Snow', 'star' => 4, 'room' => 'Cozy Heritage Log Cabin', 'plan' => 'CP (Breakfast Incl)', 'rate' => 12000],
            ['name' => 'Gulmarg Meadows Resort Camp', 'star' => 3, 'room' => 'Deluxe Heated Tent Cabin', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8500]
        ],
        91 => [ // Pahalgam
            ['name' => 'Welcomhotel by ITC Pine n Peak Pahalgam', 'star' => 5, 'room' => 'Lidder River View Room Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 16000],
            ['name' => 'Hotel Heevan Pahalgam Valley view', 'star' => 4, 'room' => 'Standard Mountain Cozy Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500],
            ['name' => 'Grand Mumtaz Pahalgam Resort', 'star' => 4, 'room' => 'Superior Suite Cabin', 'plan' => 'CP (Breakfast Incl)', 'rate' => 8000]
        ],
        92 => [ // Leh
            ['name' => 'The Grand Dragon Ladakh Leh', 'star' => 5, 'room' => 'Premier Mountain View Suite', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 12500],
            ['name' => 'Hotel Singge Palace Leh city', 'star' => 4, 'room' => 'Super Deluxe Garden View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6000],
            ['name' => 'Hotel Lasermo Leh Ladakh view', 'star' => 4, 'room' => 'Deluxe Cozy Snow View', 'plan' => 'CP (Breakfast Incl)', 'rate' => 6500]
        ],
        93 => [ // Nubra Valley
            ['name' => 'Stone Wood Organic Resort Nubra Dunes', 'star' => 4, 'room' => 'Luxury Tented Sand Cottage', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 8500],
            ['name' => 'Lchang Nang Retreat Nubra Eco Lodge', 'star' => 4, 'room' => 'Premium Orchard Cottage', 'plan' => 'CP (Breakfast Incl)', 'rate' => 12500],
            ['name' => 'Nubra Organic Retreat Cabin', 'star' => 3, 'room' => 'Standard Eco Hut Room', 'plan' => 'AP (All Meals)', 'rate' => 6000]
        ],
        94 => [ // Port Blair
            ['name' => 'Welcomhotel by ITC Bay Island Port Blair', 'star' => 4, 'room' => 'Superior Sea View Room Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 11000],
            ['name' => 'Peerless Resort Port Blair Beachfront', 'star' => 3, 'room' => 'Standard Deluxe AC Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 7000],
            ['name' => 'Symphony Samudra Port Blair Resort', 'star' => 4, 'room' => 'Sunset View Premier Suite', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500]
        ],
        95 => [ // Havelock Island
            ['name' => 'Taj Exotica Resort & Spa Havelock beach', 'star' => 5, 'room' => 'Deluxe Radhanagar Beach Villa', 'plan' => 'CP (Breakfast Incl)', 'rate' => 24000],
            ['name' => 'Barefoot at Havelock Island Resort', 'star' => 4, 'room' => 'Nicobari Wooden Cottage Room', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 13000],
            ['name' => 'Sea Shell Havelock Beachfront Spa', 'star' => 4, 'room' => 'Lagoon Villa Room Cozy', 'plan' => 'CP (Breakfast Incl)', 'rate' => 9500]
        ],
        96 => [ // Pondicherry
            ['name' => 'Palais de Mahe CGH Earth Pondicherry', 'star' => 5, 'room' => 'Heritage Standard Suite Villa', 'plan' => 'CP (Breakfast Incl)', 'rate' => 12000],
            ['name' => 'The Promenade Pondicherry Rock Beach', 'star' => 4, 'room' => 'Sea View Deluxe AC Room', 'plan' => 'CP (Breakfast Incl)', 'rate' => 7500],
            ['name' => 'Windflower Resort & Spa Pondicherry', 'star' => 4, 'room' => 'Windflower Suite Villa Pool', 'plan' => 'MAP (Breakfast & Dinner)', 'rate' => 10500]
        ]
    ];

    $seededCount = 0;
    foreach ($cityHotels as $cityId => $hotels) {
        $cityStmt = $pdo->prepare("SELECT c.city_name, s.state_name FROM cities c LEFT JOIN states s ON c.state_id = s.id WHERE c.id = ?");
        $cityStmt->execute([$cityId]);
        $cityRow = $cityStmt->fetch(PDO::FETCH_ASSOC);
        $cityName = $cityRow['city_name'] ?? null;
        $stateName = $cityRow['state_name'] ?? null;

        foreach ($hotels as $h) {
            // Generate a unique ID for the hotel (since ID is varchar(36))
            $hotelId = 'hot-' . uniqid() . '-' . rand(1000, 9999);

            // Insert into hotels table using correct column names
            $stmt = $pdo->prepare("
                INSERT INTO hotels (id, hotel_name, city_id, city, state, country, star_rating, active_status) 
                VALUES (?, ?, ?, ?, ?, 'India', ?, 1)
            ");
            $stmt->execute([$hotelId, $h['name'], $cityId, $cityName, $stateName, $h['star']]);

            // Insert into hotel_contracts table with generated hotelId
            $stmt2 = $pdo->prepare("
                INSERT INTO hotel_contracts (hotel_id, room_type, meal_plan, contract_rate, valid_from, valid_to, active_status)
                VALUES (?, ?, ?, ?, '2026-01-01', '2026-12-31', 1)
            ");
            $stmt2->execute([$hotelId, $h['room'], $h['plan'], $h['rate']]);

            // Resolve meal plan enum for hotel_rates ('EP','CP','MAP','AP')
            $mealPlan = 'CP';
            if (strpos($h['plan'], 'MAP') !== false) {
                $mealPlan = 'MAP';
            } elseif (strpos($h['plan'], 'EP') !== false) {
                $mealPlan = 'EP';
            } elseif (strpos($h['plan'], 'AP') !== false) {
                $mealPlan = 'AP';
            }

            // Insert into hotel_rates table
            $stmt3 = $pdo->prepare("
                INSERT INTO hotel_rates (hotel_id, room_type, meal_plan, season_start, season_end, rate_per_night, is_active)
                VALUES (?, ?, ?, '2026-01-01', '2026-12-31', ?, 1)
            ");
            $stmt3->execute([$hotelId, $h['room'], $mealPlan, $h['rate']]);
            
            $seededCount++;
        }
    }

    echo json_encode([
        'success' => true,
        'message' => "Successfully seeded {$seededCount} famous tourist hotels and contracts across all 96 Indian cities and regions!"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to seed massive hotels data: ' . $e->getMessage()]);
}
