<?php
// seed_packages.php — Seeds 34 package templates for the four pillars into local MySQL

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    echo "=== CONNECTED TO MYSQL ===\n";

    // 1. List of packages to seed
    $packages = [];

    // --- RANN UTSAV PACKAGES ---
    $packages[] = [
        'name' => 'Rann Utsav Day Trip',
        'slug' => 'rann-utsav-day-trip',
        'price' => 2999,
        'duration' => '1 Day',
        'category' => ['domestic', 'festival', 'day-trip'],
        'destinations' => ['Rann Utsav', 'Dhordo', 'Kutch'],
        'highlights' => ['White Rann Sunset', 'Cultural Program', 'Folk Music & Dance', 'Camel Safari', 'Local Handicrafts'],
        'inclusions' => ['Pickup from Bhuj', 'Entry to Rann', 'Cultural evening', 'Dinner', 'Drop back to Bhuj'],
        'exclusions' => ['Accommodation', 'Personal expenses', 'Guide charges'],
        'best_time' => 'November to February',
        'group_size' => '1-50 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Rann Utsav Day Trip Package from Bhuj | GhumoFiroo Travels',
        'seo_description' => 'Experience the magic of Rann Utsav in a day. White desert sunset, cultural programs, folk dance and camel safari from Bhuj.',
        'seo_keywords' => 'rann utsav day trip, rann utsav package, bhuj to rann utsav, kutch day trip',
        'image' => '/Rann-Utsav-Gujarat.png',
        'images' => ['/Rann-Utsav-Gujarat.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is transport included?', 'a' => 'Yes, pickup and drop back to Bhuj is included.'],
            ['q' => 'What is the best time to see the sunset?', 'a' => 'Sunset is usually between 5:30 PM and 6:30 PM depending on the month.']
        ],
        'quick_facts' => ['Start Point' => 'Bhuj', 'End Point' => 'Bhuj', 'Meals' => 'Dinner Included']
    ];

    $packages[] = [
        'name' => 'Rann Utsav Deluxe Tent',
        'slug' => 'rann-utsav-deluxe-tent',
        'price' => 8999,
        'duration' => '2 Nights / 3 Days',
        'category' => ['domestic', 'festival', 'tent-stay'],
        'destinations' => ['Rann Utsav', 'Dhordo', 'Kutch'],
        'highlights' => ['Deluxe AC Tent Stay', 'White Rann Sunrise Walk', 'Cultural Evening Program', 'Camel Safari', 'All Meals Included'],
        'inclusions' => ['2 nights deluxe tent accommodation', 'All meals (breakfast lunch dinner)', 'Cultural evening', 'Camel safari', 'Rann entry permit'],
        'exclusions' => ['Travel to Bhuj', 'Personal expenses', 'Tips', 'Alcohol'],
        'best_time' => 'November to February',
        'group_size' => '2-30 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Rann Utsav Deluxe Tent Package | GhumoFiroo Travels',
        'seo_description' => 'Book a 2 Nights / 3 Days deluxe AC tent stay at Rann Utsav. Enjoy sunrise walks, folk music, and camel safaris with all meals included.',
        'seo_keywords' => 'rann utsav deluxe tent, rann utsav ac tent, rann utsav packages, kutch tent stay',
        'image' => '/Rann-Utsav-Gujarat.png',
        'images' => ['/Rann-Utsav-Gujarat.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Are the tents air-conditioned?', 'a' => 'Yes, deluxe AC tents are equipped with cooling facilities.'],
            ['q' => 'Are meals vegetarian?', 'a' => 'Yes, pure Gujarati and Kutchi vegetarian meals are provided.']
        ],
        'quick_facts' => ['Stay' => 'Deluxe AC Tent', 'Duration' => '2 Nights / 3 Days', 'Meals' => 'All Vegetarian Meals']
    ];

    $packages[] = [
        'name' => 'Rann Utsav Premium Tent',
        'slug' => 'rann-utsav-premium-tent',
        'price' => 14999,
        'duration' => '2 Nights / 3 Days',
        'category' => ['domestic', 'festival', 'premium', 'tent-stay'],
        'destinations' => ['Rann Utsav', 'Dhordo', 'Kutch'],
        'highlights' => ['Premium AC Tent with attached bath', 'Full Moon Night Walk on White Rann', 'VIP Cultural Evening', 'Jeep Safari', 'Spa & Wellness'],
        'inclusions' => ['2 nights premium tent', 'All meals', 'Jeep safari', 'Cultural evening VIP seats', 'Rann entry permit', 'One spa session'],
        'exclusions' => ['Airfare or train to Bhuj', 'Personal expenses', 'Alcohol'],
        'best_time' => 'November to February',
        'group_size' => '2-20 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Rann Utsav Premium Tent Experience | GhumoFiroo Travels',
        'seo_description' => 'Indulge in a premium Rann Utsav experience. Full moon night walk, VIP seating at cultural events, spa session, and luxury AC tent stays.',
        'seo_keywords' => 'rann utsav premium tent, luxury tent kutch, rann full moon walk, premium rann utsav package',
        'image' => '/Rann-Utsav-Gujarat.png',
        'images' => ['/Rann-Utsav-Gujarat.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'How close are the tents to the white desert?', 'a' => 'The premium tents are located in the main tent city close to the Rann access point.'],
            ['q' => 'Is the spa session complementary?', 'a' => 'Yes, one couple spa session is included in this package.']
        ],
        'quick_facts' => ['Stay' => 'Premium AC Tent', 'Special' => 'VIP Cultural Evening Access', 'Meals' => 'Premium Buffet Included']
    ];

    $packages[] = [
        'name' => 'Rann Utsav Rajwadi Suite',
        'slug' => 'rann-utsav-rajwadi-suite',
        'price' => 22999,
        'duration' => '2 Nights / 3 Days',
        'category' => ['domestic', 'festival', 'luxury', 'suite'],
        'destinations' => ['Rann Utsav', 'Dhordo', 'Kutch'],
        'highlights' => ['Rajwadi Heritage Suite', 'Private Sit-out with White Rann View', 'Royal Dinner under Stars', 'Horse Safari', 'Exclusive Sunset Experience'],
        'inclusions' => ['2 nights Rajwadi suite', 'All meals including royal dinner', 'Horse safari', 'Exclusive sunset photography', 'Rann entry permit', 'Welcome drink'],
        'exclusions' => ['Travel to Bhuj', 'Personal shopping', 'Alcohol'],
        'best_time' => 'November to February',
        'group_size' => '2-10 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Royal Rann Utsav Rajwadi Suite Stay | GhumoFiroo Travels',
        'seo_description' => 'Stay in the heritage Rajwadi Suite with a private sit-out overlooking the White Rann. Enjoy a royal dinner under the stars and private horse safaris.',
        'seo_keywords' => 'rajwadi suite rann utsav, heritage suite kutch, royal dinner rann, luxury rann packages',
        'image' => '/Rann-Utsav-Gujarat.png',
        'images' => ['/Rann-Utsav-Gujarat.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Does the suite have a view of the desert?', 'a' => 'Yes, the Rajwadi suites are positioned to offer beautiful vistas of the white salt flats.'],
            ['q' => 'Is airport pick up included?', 'a' => 'No, travel to/from Bhuj is excluded but private taxi transfers can be arranged.']
        ],
        'quick_facts' => ['Stay' => 'Rajwadi Heritage Suite', 'Dining' => 'Royal Dinner Under Stars', 'Experience' => 'Private Horse Safari']
    ];

    $packages[] = [
        'name' => 'Rann Utsav Darbari Suite',
        'slug' => 'rann-utsav-darbari-suite',
        'price' => 28999,
        'duration' => '3 Nights / 4 Days',
        'category' => ['domestic', 'festival', 'luxury', 'suite'],
        'destinations' => ['Rann Utsav', 'Dhordo', 'Kala Dungar', 'Mandvi', 'Kutch'],
        'highlights' => ['Darbari Heritage Suite', 'Kala Dungar Sunrise', 'Mandvi Beach', 'India Bridge Visit', 'Private Butler'],
        'inclusions' => ['3 nights Darbari suite', 'All meals', 'Private butler', 'Kala Dungar sunrise trip', 'Mandvi excursion', 'Rann entry permit'],
        'exclusions' => ['Airfare', 'Personal expenses', 'Alcohol'],
        'best_time' => 'November to February',
        'group_size' => '2-6 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Rann Utsav Darbari Suite Luxury Package | GhumoFiroo Travels',
        'seo_description' => 'Experience Kutchi hospitality at its finest in the Darbari Suite. Includes private butler, Kala Dungar sunrise excursion, and Mandvi beach trip.',
        'seo_keywords' => 'darbari suite rann utsav, luxury stay kutch, kala dungar tour, mandvi beach package',
        'image' => '/Rann-Utsav-Gujarat.png',
        'images' => ['/Rann-Utsav-Gujarat.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'What is Kala Dungar?', 'a' => 'Kala Dungar is the highest point in Kutch, famous for panoramic views of the Rann and wild jackals.'],
            ['q' => 'Is a butler dedicated solely to us?', 'a' => 'Yes, a private butler is assigned to service your suite during your stay.']
        ],
        'quick_facts' => ['Stay' => 'Darbari Suite (3 Nights)', 'Service' => 'Dedicated Private Butler', 'Excursions' => 'Mandvi Beach & Kala Dungar']
    ];

    $packages[] = [
        'name' => 'Rann Utsav Premium Luxury Experience',
        'slug' => 'rann-utsav-premium-luxury',
        'price' => 45000,
        'duration' => '3 Nights / 4 Days',
        'category' => ['domestic', 'festival', 'ultra-luxury'],
        'destinations' => ['Rann Utsav', 'Dhordo', 'Kala Dungar', 'Bhuj', 'Kutch'],
        'highlights' => ['Ultra-luxury Swiss Cottage', 'Private White Rann Night Experience', 'Helicopter Joyride', 'Chef-curated Royal Dinner', 'Handloom Workshop'],
        'inclusions' => ['3 nights ultra-luxury cottage', 'All gourmet meals', 'Helicopter joyride', 'Private Rann night experience', 'Handloom workshop', 'Bhuj heritage tour', 'Rann entry permit'],
        'exclusions' => ['Airfare', 'Personal expenses', 'Alcohol'],
        'best_time' => 'November to February',
        'group_size' => '2-4 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Ultra Luxury Rann Utsav Experience | GhumoFiroo Travels',
        'seo_description' => 'Indulge in the ultimate Kutchi holiday. Ultra-luxury Swiss cottages, private desert experiences, handloom weaving workshops, and helicopter joyrides.',
        'seo_keywords' => 'ultra luxury rann utsav, swiss cottage kutch, helicopter joyride rann, private desert experience',
        'image' => '/Rann-Utsav-Gujarat.png',
        'images' => ['/Rann-Utsav-Gujarat.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'How long is the helicopter joyride?', 'a' => 'The helicopter ride is approx 10-12 minutes, offering a bird-eye view of the white desert.'],
            ['q' => 'Can we visit local artisans?', 'a' => 'Yes, a private guide will take you to Bhujodi handloom village to meet national award-winning weavers.']
        ],
        'quick_facts' => ['Stay' => 'Ultra-Luxury Swiss Cottage', 'Adventure' => 'Helicopter Ride Included', 'Dining' => 'Chef-Curated Royal Dinner']
    ];

    $packages[] = [
        'name' => 'Rann Utsav Family Package',
        'slug' => 'rann-utsav-family-package',
        'price' => 32000,
        'duration' => '3 Nights / 4 Days',
        'category' => ['domestic', 'festival', 'family'],
        'destinations' => ['Rann Utsav', 'Dhordo', 'Bhuj', 'Kutch'],
        'highlights' => ['Family Tent Accommodation', 'Kids Cultural Activity', 'Camel Safari for All', 'Bhuj City Tour', 'Family Photo Session on White Rann'],
        'inclusions' => ['3 nights family tent (2 rooms)', 'All meals', 'Camel safari', 'Bhuj city tour', 'Kids activity program', 'Rann entry permit for 4'],
        'exclusions' => ['Travel to Bhuj', 'Personal expenses', 'Alcohol'],
        'best_time' => 'November to February',
        'group_size' => '3-8 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Rann Utsav Family Package (4 Pax) | GhumoFiroo Travels',
        'seo_description' => 'Create beautiful family memories at Rann Utsav. Premium interconnected family tents, camel safaris, kids cultural programs, and Bhuj sightseeing.',
        'seo_keywords' => 'rann utsav family package, family tent rann, kutch family tour, bhuj kids activities',
        'image' => '/Rann-Utsav-Gujarat.png',
        'images' => ['/Rann-Utsav-Gujarat.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Are there activities for children?', 'a' => 'Yes, the resort runs dedicated kids zones, puppet shows, and handicraft painting activities.'],
            ['q' => 'What type of tents are provided?', 'a' => 'You get two adjacent or interconnected deluxe AC tents suitable for a family of 4.']
        ],
        'quick_facts' => ['Stay' => 'Family Double Tent', 'Group' => 'Family Friendly', 'Sightseeing' => 'Bhuj Palace & Museum Tour']
    ];

    $packages[] = [
        'name' => 'Rann Utsav Honeymoon Package',
        'slug' => 'rann-utsav-honeymoon',
        'price' => 19999,
        'duration' => '2 Nights / 3 Days',
        'category' => ['domestic', 'festival', 'honeymoon', 'romantic'],
        'destinations' => ['Rann Utsav', 'Dhordo', 'Kutch'],
        'highlights' => ['Romantic Tent Decorated with Flowers', 'Private Sunset Walk on White Rann', 'Candlelight Dinner', 'Couple Spa', 'Moonlit Cultural Performance'],
        'inclusions' => ['2 nights decorated premium tent', 'All meals including candlelight dinner', 'Couple spa', 'Private sunset experience', 'Cultural evening VIP seats', 'Rann entry for 2'],
        'exclusions' => ['Travel to Bhuj', 'Personal shopping', 'Alcohol'],
        'best_time' => 'November to February',
        'group_size' => '2 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Romantic Rann Utsav Honeymoon Package | GhumoFiroo Travels',
        'seo_description' => 'Celebrate love amidst the white salt flats. Decorated premium AC tents, romantic candlelit dinners under the open sky, couple spa, and VIP show seating.',
        'seo_keywords' => 'rann utsav honeymoon, romantic kutch tour, couple package rann, candlelight dinner kutch',
        'image' => '/Rann-Utsav-Gujarat.png',
        'images' => ['/Rann-Utsav-Gujarat.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is the candlelight dinner private?', 'a' => 'Yes, a private candlelight setup is arranged near the resort premises under the stars.'],
            ['q' => 'Can we customize the flower decoration?', 'a' => 'Basic romantic floral decoration is standard; special requests can be accommodated at cost.']
        ],
        'quick_facts' => ['Stay' => 'Floral Decorated AC Tent', 'Special' => 'Private Candlelight Dinner', 'Wellness' => 'Couple Massage Included']
    ];


    // --- CHAR DHAM PACKAGES ---
    $packages[] = [
        'name' => 'Char Dham Yatra Budget Package',
        'slug' => 'char-dham-yatra-budget',
        'price' => 28999,
        'duration' => '12 Days / 11 Nights',
        'category' => ['domestic', 'pilgrimage', 'budget'],
        'destinations' => ['Kedarnath', 'Badrinath', 'Gangotri', 'Yamunotri', 'Haridwar', 'Rishikesh'],
        'highlights' => ['All 4 Dhams Covered', 'Shared Accommodation', 'AC Bus Transportation', 'All Darshans', 'Experienced Guide'],
        'inclusions' => ['11 nights accommodation (3-star)', 'Daily breakfast and dinner', 'AC Volvo bus from Haridwar', 'All temple visits', 'Guide', 'First aid kit'],
        'exclusions' => ['Personal expenses', 'Donations at temples', 'Helicopter charges', 'Airfare to Haridwar', 'Lunch', 'Pony/Palki charges'],
        'best_time' => 'May to June and September to October',
        'group_size' => '20-40 People',
        'difficulty' => 'Moderate',
        'package_type' => 'domestic',
        'seo_title' => 'Char Dham Yatra Budget Package from Haridwar | GhumoFiroo Travels',
        'seo_description' => 'Embark on a sacred pilgrimage to Yamunotri, Gangotri, Kedarnath, and Badrinath with our affordable 12-day Char Dham group tour package.',
        'seo_keywords' => 'char dham budget package, low cost char dham yatra, haridwar to char dham bus, budget pilgrimage tour',
        'image' => '/Kedarnath.png',
        'images' => ['/Kedarnath.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'What is the accommodation type?', 'a' => 'Standard budget hotels/guesthouses are used, usually twin or triple sharing.'],
            ['q' => 'Is transport air-conditioned?', 'a' => 'Yes, AC bus is used, though AC will be switched off in hill terrain for safety.']
        ],
        'quick_facts' => ['Route' => 'Haridwar - Yamunotri - Gangotri - Kedarnath - Badrinath - Rishikesh', 'Stay' => 'Standard Budget Hotels', 'Transport' => 'Volvo AC Coach']
    ];

    $packages[] = [
        'name' => 'Char Dham Yatra Standard Package',
        'slug' => 'char-dham-yatra-standard',
        'price' => 35999,
        'duration' => '12 Days / 11 Nights',
        'category' => ['domestic', 'pilgrimage'],
        'destinations' => ['Kedarnath', 'Badrinath', 'Gangotri', 'Yamunotri', 'Haridwar', 'Rishikesh'],
        'highlights' => ['All 4 Dhams', '4-Star Hotels', 'Tempo Traveller', 'VIP Darshan at Kedarnath', 'Complimentary Pony till Base'],
        'inclusions' => ['11 nights 4-star accommodation', 'Breakfast and dinner', 'Tempo traveller', 'All temple darshans', 'Guide', 'Medical kit', 'Pony till Kedarnath base'],
        'exclusions' => ['Personal expenses', 'Donations', 'Helicopter', 'Lunch', 'Airfare', 'Pony above base camp'],
        'best_time' => 'May to June and September to October',
        'group_size' => '10-20 People',
        'difficulty' => 'Moderate',
        'package_type' => 'domestic',
        'seo_title' => 'Char Dham Yatra Standard 4-Star Package | GhumoFiroo Travels',
        'seo_description' => 'Perform the holy Char Dham Yatra in comfort. 4-star hotels, private Tempo Traveller transport, VIP Kedarnath entry and base pony included.',
        'seo_keywords' => 'comfort char dham package, 4 star char dham yatra, tempo traveller char dham, vip kedarnath darshan',
        'image' => '/Kedarnath.png',
        'images' => ['/Kedarnath.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'How many people travel in the Tempo Traveller?', 'a' => 'We seat maximum 10-12 guests in a 14-seater vehicle to ensure spacious travel.'],
            ['q' => 'Is VIP darshan card included for all temples?', 'a' => 'VIP priority queue passes are included for Kedarnath and Badrinath where queues are longest.']
        ],
        'quick_facts' => ['Stay' => 'Comfortable 4-Star Hotels', 'Transport' => 'Tempo Traveller (AC)', 'Inclusion' => 'VIP Darshan priority']
    ];

    $packages[] = [
        'name' => 'Char Dham Yatra Luxury Package',
        'slug' => 'char-dham-yatra-luxury',
        'price' => 65000,
        'duration' => '12 Days / 11 Nights',
        'category' => ['domestic', 'pilgrimage', 'luxury'],
        'destinations' => ['Kedarnath', 'Badrinath', 'Gangotri', 'Yamunotri', 'Haridwar', 'Rishikesh'],
        'highlights' => ['5-Star Accommodation', 'Private SUV', 'VIP Darshan Priority', 'Personal Guide', 'Helicopter to Kedarnath'],
        'inclusions' => ['11 nights luxury accommodation', 'All meals', 'Private SUV', 'Helicopter to Kedarnath one way', 'VIP darshan passes', 'Personal guide', 'Yoga session at Rishikesh'],
        'exclusions' => ['Personal expenses', 'Donations', 'Airfare', 'Alcohol'],
        'best_time' => 'May to June and September to October',
        'group_size' => '2-8 People',
        'difficulty' => 'Moderate',
        'package_type' => 'domestic',
        'seo_title' => 'Luxury Char Dham Yatra Tour Package | GhumoFiroo Travels',
        'seo_description' => 'Perform the sacred Char Dham pilgrimage with premium luxury. 5-star hotel stays, private Innova Crysta, helicopter flights to Kedarnath, and fine dining.',
        'seo_keywords' => 'luxury char dham yatra, 5 star hotels char dham, private innova char dham, helicopter yatra',
        'image' => '/Kedarnath.png',
        'images' => ['/Kedarnath.png'],
        'itinerary' => [
            ['day' => 1, 'title' => 'Arrive Haridwar & Ganga Aarti', 'description' => 'Arrive in Haridwar, check in to your luxury hotel. In the evening, witness the famous Ganga Aarti at Har Ki Pauri with VIP reserved seating.', 'highlights' => ['VIP Ganga Aarti', 'Rishikesh riverside stay']],
            ['day' => 2, 'title' => 'Haridwar to Barkot Scenic Drive', 'description' => 'Depart for Barkot via Mussoorie. Stop at Kempty Falls. Enjoy a scenic private SUV drive through pine forests and settle in a luxury resort in Barkot.', 'highlights' => ['Kempty Falls', 'Scenic Himalayan Drive']],
            ['day' => 3, 'title' => 'First Dham: Yamunotri Holy Trek', 'description' => 'Drive to Janki Chatti, then begin the 6km trek to Yamunotri. Take a dip in Surya Kund and offer prayers at the temple. Return to Barkot resort.', 'highlights' => ['Surya Kund thermal dip', 'Yamunotri Temple worship']],
            ['day' => 4, 'title' => 'Barkot to Uttarkashi (Kashi of North)', 'description' => 'Drive to Uttarkashi along the banks of Bhagirathi River. Visit the historic Kashi Vishwanath Temple and participate in evening prayers.', 'highlights' => ['Kashi Vishwanath Temple', 'Bhagirathi river walks']],
            ['day' => 5, 'title' => 'Second Dham: Gangotri Temple Visit', 'description' => 'Scenic drive through Harsil Valley to Gangotri. Perform holy rituals near Bhagirathi River, visit the Gangotri Temple and drive back to Uttarkashi.', 'highlights' => ['Gangotri holy dip', 'Harsil Valley scenery']],
            ['day' => 6, 'title' => 'Uttarkashi to Guptkashi Gateway', 'description' => 'Drive to Guptkashi through lush green forests and mountain passes. Check into a beautiful valley view luxury cottage stay.', 'highlights' => ['Mandakini River valley views', 'Ardh Narishwar Temple']],
            ['day' => 7, 'title' => 'Third Dham: Helicopter to Kedarnath', 'description' => 'Board a private helicopter from Phata/Guptkashi helipad. Fly past spectacular peaks and land at Kedarnath. Attend evening prayers and stay overnight.', 'highlights' => ['Private Helicopter Flight', 'Holy Kedarnath Evening Aarti']],
            ['day' => 8, 'title' => 'Kedarnath Morning Prayers & Return', 'description' => 'Perform morning Rudrabhishek Darshan inside the sanctum sanctorum. Fly back to Guptkashi by helicopter and rest.', 'highlights' => ['Morning Rudrabhishek Pujas', 'Himalayan Sunrise View']],
            ['day' => 9, 'title' => 'Guptkashi to Fourth Dham: Badrinath', 'description' => 'Take a beautiful mountain drive to Badrinath. Check in to your luxury hotel. Participate in the evening Vishnu Sahasranamam Puja.', 'highlights' => ['Vishnu Sahasranamam Aarti', 'Alaknanda River scenery']],
            ['day' => 10, 'title' => 'Badrinath Sightseeing & Rudraprayag', 'description' => 'Take a holy dip in Tapt Kund, visit Mana Village (last Indian village), Bhim Pul, and Vyas Gufa. Drive to Rudraprayag confluence point.', 'highlights' => ['Mana Village visit', 'Rudraprayag Alaknanda-Mandakini confluence']],
            ['day' => 11, 'title' => 'Rudraprayag to Rishikesh Ganga Aarti', 'description' => 'Drive down to Rishikesh. Check in to a premium spa resort. Participate in the divine evening Ganga Aarti at Triveni Ghat.', 'highlights' => ['Triveni Ghat Ganga Aarti', 'Spa & Wellness relaxation']],
            ['day' => 12, 'title' => 'Yoga, Meditation & Final Departure', 'description' => 'Begin the day with a guided yoga and meditation session. Later, depart for Dehradun airport or Haridwar station for your flight back home.', 'highlights' => ['Sunrise Yoga Session', 'Departure transfers']]
        ],
        'faqs' => [
            ['q' => 'Which hotels are used in the luxury package?', 'a' => 'We use the finest 5-star or premium boutique resorts at each location, such as Aloft Rishikesh, Sarovar Portico Badrinath, and boutique cottage resorts in Gangotri/Yamunotri valleys.'],
            ['q' => 'Is helicopter transport guaranteed?', 'a' => 'Yes, helicopter tickets are pre-booked in the VIP slot. However, flights are subject to weather clearance. If cancelled, alternative VIP pony/palki transport is provided with refund of the ticket price difference.']
        ],
        'quick_facts' => ['Stay' => '5-Star Premium Luxury Resorts', 'Transport' => 'Private Innova Crysta SUV', 'Kedarnath Travel' => 'Helicopter Included']
    ];

    $packages[] = [
        'name' => 'Char Dham by Helicopter',
        'slug' => 'char-dham-yatra-helicopter',
        'price' => 120000,
        'duration' => '6 Days / 5 Nights',
        'category' => ['domestic', 'pilgrimage', 'helicopter', 'luxury'],
        'destinations' => ['Kedarnath', 'Badrinath', 'Gangotri', 'Yamunotri', 'Dehradun'],
        'highlights' => ['Helicopter to All 4 Dhams', '5-Star Hotels', 'VIP Darshan', 'Phata/Sirsi Helipad', 'No Trekking Required'],
        'inclusions' => ['5 nights luxury hotel', 'All meals', 'Helicopter tickets to all 4 dhams', 'VIP darshan', 'Personal guide', 'Airport transfers', 'Medical support'],
        'exclusions' => ['Airfare to Dehradun', 'Personal expenses', 'Donations', 'Alcohol'],
        'best_time' => 'May to June and September to October',
        'group_size' => '2-6 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Premium Char Dham Yatra by Helicopter | GhumoFiroo Travels',
        'seo_description' => 'Complete the sacred Char Dham Yatra in just 6 days. Helicopter transfers to Yamunotri, Gangotri, Kedarnath, and Badrinath from Dehradun with VIP temple entries.',
        'seo_keywords' => 'char dham helicopter yatra, dehradun to char dham helicopter, 4 dham helicopter package, premium helicopter pilgrimage',
        'image' => '/Kedarnath.png',
        'images' => ['/Kedarnath.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Where does the helicopter tour start?', 'a' => 'The tour starts and ends at the Sahastradhara Helipad in Dehradun.'],
            ['q' => 'What is the maximum weight limit per passenger?', 'a' => 'Standard weight limit per passenger is 80kg. Extra charges may apply for weight exceeding this limit.']
        ],
        'quick_facts' => ['Start Point' => 'Sahastradhara Helipad Dehradun', 'Transit' => 'Private Helicopter Flights', 'VIP Darshan' => 'Included at All Dhams']
    ];

    $packages[] = [
        'name' => 'Char Dham Senior Citizen Package',
        'slug' => 'char-dham-senior-citizen',
        'price' => 38999,
        'duration' => '14 Days / 13 Nights',
        'category' => ['domestic', 'pilgrimage', 'senior-citizen'],
        'destinations' => ['Kedarnath', 'Badrinath', 'Gangotri', 'Yamunotri', 'Haridwar', 'Rishikesh'],
        'highlights' => ['Slower Pace Itinerary', 'Medical Support Throughout', '4-Star Hotels', 'Palki/Pony Included', 'Doctor on Call'],
        'inclusions' => ['13 nights 4-star accommodation', 'All meals', 'AC tempo traveller', 'Palki to Kedarnath', 'Doctor on call', 'Medical kit', 'Oxygen cylinder', 'Guide'],
        'exclusions' => ['Personal expenses', 'Donations', 'Airfare', 'Lunch', 'Alcohol'],
        'best_time' => 'May to June and September to October',
        'group_size' => '10-25 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Char Dham Yatra Senior Citizen Package | GhumoFiroo Travels',
        'seo_description' => 'A slow-paced, elder-friendly Char Dham pilgrimage. Includes pre-arranged Palki/Pony, 4-star hotel stays, doctor-on-call, and constant medical/oxygen support.',
        'seo_keywords' => 'senior citizen char dham yatra, elder friendly pilgrimage package, char dham yatra with medical support, palki yatra package',
        'image' => '/Kedarnath.png',
        'images' => ['/Kedarnath.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is oxygen support available in vehicles?', 'a' => 'Yes, all our elder-friendly Tempo Travellers are equipped with portable oxygen cylinders.'],
            ['q' => 'Are Palki/Pony arrangements pre-booked?', 'a' => 'Yes, Palki/Dandi rides are pre-booked to ensure seniors do not have to wait or walk during the steep sections.']
        ],
        'quick_facts' => ['Pace' => 'Extra Relaxed (14 Days)', 'Medical' => 'Continuous Oxygen & First Aid', 'Transport' => 'Palki / Dandi Pre-Booked']
    ];

    $packages[] = [
        'name' => 'Do Dham Kedarnath + Badrinath',
        'slug' => 'kedarnath-badrinath-do-dham',
        'price' => 18999,
        'duration' => '7 Days / 6 Nights',
        'category' => ['domestic', 'pilgrimage'],
        'destinations' => ['Kedarnath', 'Badrinath', 'Joshimath', 'Haridwar', 'Rishikesh', 'Panch Prayag'],
        'highlights' => ['Kedarnath Temple Darshan', 'Badrinath Temple Darshan', 'Panch Prayag Visit', 'Mana Village', 'Vasundhara Falls'],
        'inclusions' => ['6 nights accommodation', 'Breakfast and dinner', 'Tempo traveller', 'All darshans', 'Guide', 'Medical kit'],
        'exclusions' => ['Personal expenses', 'Donations', 'Helicopter', 'Pony', 'Lunch', 'Airfare'],
        'best_time' => 'May to June and September to October',
        'group_size' => '6-20 People',
        'difficulty' => 'Moderate',
        'package_type' => 'domestic',
        'seo_title' => 'Do Dham Yatra (Kedarnath & Badrinath) | GhumoFiroo Travels',
        'seo_description' => 'Perform the holy Do Dham pilgrimage. Complete Darshans at Kedarnath and Badrinath, witness Panch Prayag confluences, and visit India\'s last village, Mana.',
        'seo_keywords' => 'do dham yatra, kedarnath badrinath package, do dham tour package, haridwar to kedarnath badrinath',
        'image' => '/Kedarnath.png',
        'images' => ['/Kedarnath.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Can we upgrade to helicopter for Kedarnath?', 'a' => 'Yes, helicopter tickets for the Kedarnath leg can be added at additional charge subject to availability.'],
            ['q' => 'What is Panch Prayag?', 'a' => 'Panch Prayag refers to the five holy river confluences in Uttarakhand: Devprayag, Rudraprayag, Karnaprayag, Nandaprayag, and Vishnuprayag.']
        ],
        'quick_facts' => ['Dhams' => 'Kedarnath & Badrinath', 'Duration' => '6 Nights / 7 Days', 'Confluence' => 'Panch Prayag Tour Included']
    ];

    $packages[] = [
        'name' => 'Do Dham Gangotri + Yamunotri',
        'slug' => 'gangotri-yamunotri-do-dham',
        'price' => 15999,
        'duration' => '6 Days / 5 Nights',
        'category' => ['domestic', 'pilgrimage'],
        'destinations' => ['Gangotri', 'Yamunotri', 'Uttarkashi', 'Barkot', 'Harsil', 'Haridwar'],
        'highlights' => ['Gangotri Temple', 'Yamunotri Trek', 'Harsil Valley', 'Bhagirathi River', 'Janki Chatti'],
        'inclusions' => ['5 nights accommodation', 'Breakfast and dinner', 'Tempo traveller', 'All darshans', 'Guide', 'Medical kit'],
        'exclusions' => ['Personal expenses', 'Donations', 'Pony at Yamunotri', 'Lunch', 'Airfare'],
        'best_time' => 'May to June and September to October',
        'group_size' => '6-20 People',
        'difficulty' => 'Moderate',
        'package_type' => 'domestic',
        'seo_title' => 'Do Dham Gangotri and Yamunotri Tour | GhumoFiroo Travels',
        'seo_description' => 'Journey to the origins of Ganga and Yamuna rivers. Visit the holy temples of Yamunotri and Gangotri with stays in Barkot, Harsil, and Uttarkashi.',
        'seo_keywords' => 'yamunotri gangotri do dham, gangotri package, yamunotri trek tour, origins of ganga yamuna',
        'image' => '/Kedarnath.png',
        'images' => ['/Kedarnath.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is trekking required for Gangotri?', 'a' => 'No, Gangotri temple is directly accessible by motorable road. Trekking is only required for Yamunotri (approx 6km).'],
            ['q' => 'Where do we stay in Harsil?', 'a' => 'We stay in boutique wooden cottages in Harsil valley, known as the Switzerland of India.']
        ],
        'quick_facts' => ['Dhams' => 'Yamunotri & Gangotri', 'Scenery' => 'Harsil Wooden Cottage Stay', 'Trek' => '6km trek at Yamunotri']
    ];

    $packages[] = [
        'name' => 'Kedarnath Yatra',
        'slug' => 'kedarnath-ek-dham-yatra',
        'price' => 9999,
        'duration' => '4 Days / 3 Nights',
        'category' => ['domestic', 'pilgrimage'],
        'destinations' => ['Kedarnath', 'Guptkashi', 'Sonprayag', 'Haridwar'],
        'highlights' => ['Kedarnath Temple Darshan', 'Sonprayag Trek', 'Gaurikund', 'Bhairavnath Temple', 'Mountain Views'],
        'inclusions' => ['3 nights accommodation', 'Breakfast and dinner', 'Shared cab', 'Temple darshans', 'Guide', 'Medical kit'],
        'exclusions' => ['Personal expenses', 'Donations', 'Helicopter', 'Pony', 'Lunch', 'Airfare'],
        'best_time' => 'May to June and September to October',
        'group_size' => '6-20 People',
        'difficulty' => 'Moderate',
        'package_type' => 'domestic',
        'seo_title' => 'Kedarnath Ek Dham Yatra from Haridwar | GhumoFiroo Travels',
        'seo_description' => 'Perform the sacred Kedarnath Yatra. Budget 4-day pilgrimage from Haridwar, trekking Gaurikund to Kedarnath with accommodation at base and summit.',
        'seo_keywords' => 'kedarnath yatra package, ek dham kedarnath tour, haridwar to kedarnath cab, Gaurikund trek tour',
        'image' => '/Kedarnath.png',
        'images' => ['/Kedarnath.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'How long is the trek to Kedarnath?', 'a' => 'The trek from Gaurikund to Kedarnath temple is approximately 16km, which takes about 6-8 hours.'],
            ['q' => 'Is accommodation available at the top?', 'a' => 'Yes, we arrange comfortable stays in GMVN guest houses or private tents near the temple site.']
        ],
        'quick_facts' => ['Dham' => 'Kedarnath Temple', 'Trek' => '16km Gaurikund-Kedarnath Trek', 'Transit' => 'Shared AC Sumo/Innova']
    ];

    $packages[] = [
        'name' => 'Badrinath Yatra',
        'slug' => 'badrinath-ek-dham-yatra',
        'price' => 9999,
        'duration' => '4 Days / 3 Nights',
        'category' => ['domestic', 'pilgrimage'],
        'destinations' => ['Badrinath', 'Joshimath', 'Haridwar', 'Mana Village'],
        'highlights' => ['Badrinath Temple Darshan', 'Mana Village Visit', 'Bhim Pul', 'Vasudhara Falls', 'Tapt Kund'],
        'inclusions' => ['3 nights accommodation', 'Breakfast and dinner', 'Shared cab', 'Temple darshans', 'Guide', 'Medical kit'],
        'exclusions' => ['Personal expenses', 'Donations', 'Lunch', 'Airfare'],
        'best_time' => 'May to June and September to October',
        'group_size' => '6-20 People',
        'difficulty' => 'Easy',
        'package_type' => 'domestic',
        'seo_title' => 'Badrinath Ek Dham Yatra Tour | GhumoFiroo Travels',
        'seo_description' => 'Visit the holy seat of Lord Vishnu. Complete Badrinath Temple Darshan, Mana Village sightseeing, holy Tapt Kund thermal dip, and Joshimath stay.',
        'seo_keywords' => 'badrinath yatra package, badrinath ek dham tour, mana village sightseeing, tapt kund bath',
        'image' => '/Kedarnath.png',
        'images' => ['/Kedarnath.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is the road to Badrinath safe?', 'a' => 'Yes, the national highway is well maintained, though landslip delays can happen occasionally during rains.'],
            ['q' => 'Can we visit Mana village?', 'a' => 'Yes, Mana village is just 3km from Badrinath temple and is included in this tour.']
        ],
        'quick_facts' => ['Dham' => 'Badrinath Temple', 'Attractions' => 'Mana Last Village & Vyas Gufa', 'Wellness' => 'Tapt Kund Hot Spring Dip']
    ];

    $packages[] = [
        'name' => 'Char Dham Family Package',
        'slug' => 'char-dham-yatra-family',
        'price' => 42000,
        'duration' => '12 Days / 11 Nights',
        'category' => ['domestic', 'pilgrimage', 'family'],
        'destinations' => ['Kedarnath', 'Badrinath', 'Gangotri', 'Yamunotri', 'Haridwar', 'Rishikesh'],
        'highlights' => ['All 4 Dhams', 'Child-Friendly Itinerary', '4-Star Family Rooms', 'Pony Included', 'Rishikesh Rafting on Return'],
        'inclusions' => ['11 nights 4-star accommodation in family rooms', 'All meals', 'Private tempo traveller', 'All temple visits', 'Pony at Kedarnath', 'Rishikesh rafting', 'Guide', 'Medical kit'],
        'exclusions' => ['Personal expenses', 'Donations', 'Airfare', 'Alcohol', 'Children under 5 not recommended for trek'],
        'best_time' => 'May to June and September to October',
        'group_size' => '3-6 People',
        'difficulty' => 'Moderate',
        'package_type' => 'domestic',
        'seo_title' => 'Char Dham Yatra Family Package (4 Pax) | GhumoFiroo Travels',
        'seo_description' => 'Create divine family memories. Comfortable 4-star family rooms, private Tempo Traveller transfers, pony for children/seniors, and white water rafting in Rishikesh.',
        'seo_keywords' => 'char dham family package, family tour char dham, child friendly char dham yatra, rishikesh rafting family tour',
        'image' => '/Kedarnath.png',
        'images' => ['/Kedarnath.png'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is the rafting suitable for children?', 'a' => 'Rafting is suitable for kids above 12 years with parental supervision. We restrict it to mild rapid sections.'],
            ['q' => 'Are family rooms interconnected?', 'a' => 'We book large quadruple rooms or adjacent interconnected rooms based on hotel availability.']
        ],
        'quick_facts' => ['Stay' => '4-Star Double Quad Rooms', 'Transport' => 'Private Tempo Traveller (AC)', 'Activities' => 'Rishikesh Rafting Included']
    ];


    // --- SINGAPORE PACKAGES ---
    $packages[] = [
        'name' => 'Singapore City Delight 4D/3N',
        'slug' => 'singapore-4d-3n-city-delight',
        'price' => 55999,
        'duration' => '4 Days / 3 Nights',
        'category' => ['international', 'city-break'],
        'destinations' => ['Singapore'],
        'highlights' => ['Gardens by the Bay', 'Marina Bay Sands', 'Sentosa Island', 'Singapore Zoo', 'Clarke Quay Nightlife'],
        'inclusions' => ['3 nights 4-star hotel', 'Daily breakfast', 'Airport transfers', 'Gardens by Bay tickets', 'Sentosa island access', 'City tour'],
        'exclusions' => ['Airfare', 'Visa fees', 'Personal expenses', 'Lunch and dinner', 'Universal Studios', 'Casino entry'],
        'best_time' => 'Year round',
        'group_size' => '2-15 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Singapore City Delight 4D/3N Package | GhumoFiroo Travels',
        'seo_description' => 'Enjoy an amazing 4-day city break in Singapore. Tour Marina Bay Sands, walk the futuristic Gardens by the Bay, and relax on Sentosa Island beaches.',
        'seo_keywords' => 'singapore 4d3n package, singapore city tour, gardens by the bay ticket, sentosa resort tour',
        'image' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',
        'images' => ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is Singapore visa included?', 'a' => 'Visa fees are excluded, but our team provides full e-visa processing support.'],
            ['q' => 'Are hotel rooms near MRT stations?', 'a' => 'Yes, we select centrally-located hotels within 5-10 minutes walk of MRT stations.']
        ],
        'quick_facts' => ['Stay' => 'Centrally Located 4-Star Hotel', 'Highlights' => 'Marina Bay & Sentosa Tour', 'Transport' => 'Air-Conditioned Shared Coaches']
    ];

    $packages[] = [
        'name' => 'Singapore Discovery 5D/4N',
        'slug' => 'singapore-5d-4n-discovery',
        'price' => 69999,
        'duration' => '5 Days / 4 Nights',
        'category' => ['international', 'city-break'],
        'destinations' => ['Singapore'],
        'highlights' => ['Universal Studios Singapore', 'Night Safari', 'Gardens by the Bay', 'Marina Bay Sands Observation Deck', 'Cable Car Ride'],
        'inclusions' => ['4 nights 4-star hotel', 'Daily breakfast', 'Airport transfers', 'Universal Studios tickets', 'Night Safari', 'Cable car', 'Marina Bay observation deck', 'City tour'],
        'exclusions' => ['Airfare', 'Visa fees', 'Lunch and dinner', 'Personal expenses', 'Casino'],
        'best_time' => 'Year round',
        'group_size' => '2-15 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Singapore 5D4N Discovery Package | GhumoFiroo Travels',
        'seo_description' => 'Unleash the fun with our 5-day Singapore tour. Includes Universal Studios tickets, Singapore Zoo Night Safari, cable cars, and Marina Bay Observation deck.',
        'seo_keywords' => 'singapore 5d4n tour, universal studios singapore package, singapore night safari ticket, marina bay deck pass',
        'image' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',
        'images' => ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200'],
        'itinerary' => [
            ['day' => 1, 'title' => 'Arrival & Evening Night Safari', 'description' => 'Land in Singapore Changi Airport. Transfer to your premium 4-star hotel. In the evening, visit the world\'s first Night Safari and witness nocturnal wildlife.', 'highlights' => ['Night Safari tram ride', 'Creatures of the Night show']],
            ['day' => 2, 'title' => 'City Tour & Gardens by the Bay', 'description' => 'Take a half-day city tour covering Merlion Park, Chinatown, and Little India. In the afternoon, visit the futuristic Gardens by the Bay (Flower Dome & Cloud Forest).', 'highlights' => ['Merlion Park photo-op', 'Gardens by the Bay domes']],
            ['day' => 3, 'title' => 'Full Day Universal Studios Singapore', 'description' => 'Spend a thrilling day at Universal Studios on Sentosa Island. Enjoy cutting-edge rides based on your favorite blockbuster movies.', 'highlights' => ['Battlestar Galactica coaster', 'Transformers The Ride 3D']],
            ['day' => 4, 'title' => 'Sentosa Island Cable Car & Leisure', 'description' => 'Take a scenic Cable Car ride to Sentosa. Visit the S.E.A. Aquarium and catch the spectacular Wings of Time multi-sensory night show on the beach.', 'highlights' => ['Scenic cable car crossing', 'Wings of Time night show']],
            ['day' => 5, 'title' => 'Marina Bay Observation Deck & Departure', 'description' => 'Visit the Marina Bay Sands SkyPark Observation Deck for panoramic city views. Later, transfer to Changi Airport for your flight home.', 'highlights' => ['Sands SkyPark views', 'Changi Jewel visit']]
        ],
        'faqs' => [
            ['q' => 'Does the ticket include all rides at Universal?', 'a' => 'Yes, the entry ticket includes unlimited rides and shows, though Express passes to skip queues are sold separately.'],
            ['q' => 'Are meals provided at Universal Studios?', 'a' => 'No, lunch and dinner are excluded but there are numerous dining outlets inside the park.']
        ],
        'quick_facts' => ['Stay' => 'Centrally Located 4-Star Hotel', 'Highlights' => 'Universal Studios & Night Safari', 'Transit' => 'Private Airport & Attraction Transfers']
    ];

    $packages[] = [
        'name' => 'Singapore + Sentosa Beach Escape',
        'slug' => 'singapore-sentosa-beach',
        'price' => 75999,
        'duration' => '5 Days / 4 Nights',
        'category' => ['international', 'beach', 'city-break'],
        'destinations' => ['Singapore', 'Sentosa'],
        'highlights' => ['Sentosa Beach Resort Stay', 'Universal Studios', 'S.E.A. Aquarium', 'Wings of Time Show', 'Marina Bay Sands'],
        'inclusions' => ['2 nights Singapore 4-star + 2 nights Sentosa resort', 'Daily breakfast', 'Airport transfers', 'Universal Studios', 'S.E.A. Aquarium', 'Wings of Time', 'Cable car'],
        'exclusions' => ['Airfare', 'Visa fees', 'Lunch and dinner', 'Personal expenses'],
        'best_time' => 'Year round',
        'group_size' => '2-12 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Singapore and Sentosa Beach Resort Tour | GhumoFiroo Travels',
        'seo_description' => 'Split your stay between the vibrant city and a tropical island. 2 nights Singapore city hotel and 2 nights luxury beach resort stay in Sentosa with attraction passes.',
        'seo_keywords' => 'singapore sentosa resort package, sentosa beach holiday, sea aquarium singapore, sentosa island resort stay',
        'image' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',
        'images' => ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Which resort is used in Sentosa?', 'a' => 'We book beach-front properties like Siloso Beach Resort or Outpost Hotel Sentosa.'],
            ['q' => 'Is transport between city and Sentosa included?', 'a' => 'Yes, private taxi transfer is arranged to move you from the city hotel to the Sentosa resort.']
        ],
        'quick_facts' => ['Stay' => '2 Nights City Hotel + 2 Nights Beach Resort', 'Resort' => 'Siloso Beach Sentosa Stay', 'Activities' => 'Universal & S.E.A. Aquarium']
    ];

    $packages[] = [
        'name' => 'Singapore + Cruise Experience',
        'slug' => 'singapore-cruise-experience',
        'price' => 95000,
        'duration' => '6 Days / 5 Nights',
        'category' => ['international', 'cruise', 'luxury'],
        'destinations' => ['Singapore', 'International Waters'],
        'highlights' => ['2-Night Star Cruise', 'Gardens by the Bay', 'Universal Studios', 'Marina Bay Sands', 'Private Deck on Cruise'],
        'inclusions' => ['2 nights Singapore hotel', '2 nights cruise (all meals on cruise)', 'Airport transfers', 'Gardens by Bay', 'Universal Studios', 'Singapore city tour'],
        'exclusions' => ['Airfare', 'Visa fees', 'Cruise casino', 'Personal expenses', 'Shore excursions on cruise'],
        'best_time' => 'Year round',
        'group_size' => '2-10 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Singapore Tour with 2-Night Luxury Cruise | GhumoFiroo Travels',
        'seo_description' => 'Unite a vibrant city tour with the luxury of a ocean cruise. Includes 2 nights hotel in Singapore, 2 nights on board a luxury liner with all meals included.',
        'seo_keywords' => 'singapore ocean cruise package, resort world cruises singapore, genting dream cruise tour, cruise holiday singapore',
        'image' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',
        'images' => ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'What is the cabin type on the cruise?', 'a' => 'An Oceanview Balcony Stateroom is standard, offering a private deck.'],
            ['q' => 'Are all meals on the cruise included?', 'a' => 'Yes, breakfast, lunch, tea, and dinner are served free in the main dining rooms. Speciality restaurants cost extra.']
        ],
        'quick_facts' => ['Stay' => '2 Nights City Hotel + 2 Nights Luxury Cruise Liner', 'Cabin' => 'Balcony Stateroom', 'Meals' => 'All Inclusive on Board']
    ];

    $packages[] = [
        'name' => 'Singapore + Malaysia Combo',
        'slug' => 'singapore-malaysia-combo-tour',
        'price' => 89999,
        'duration' => '7 Days / 6 Nights',
        'category' => ['international', 'multi-country'],
        'destinations' => ['Singapore', 'Kuala Lumpur', 'Genting Highlands'],
        'highlights' => ['Marina Bay Sands', 'Twin Towers KL', 'Genting Highlands Casino Resort', 'Universal Studios', 'Batu Caves'],
        'inclusions' => ['6 nights accommodation (3 Singapore + 3 KL/Genting)', 'Daily breakfast', 'Singapore-KL coach or flight', 'Airport transfers', 'Universal Studios', 'Twin Towers visit', 'Batu Caves'],
        'exclusions' => ['Airfare to Singapore', 'Visa fees', 'Lunch and dinner', 'Personal expenses', 'Casino entry'],
        'best_time' => 'Year round',
        'group_size' => '2-15 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Singapore and Malaysia Dual Destination Package | GhumoFiroo Travels',
        'seo_description' => 'Explore two vibrant Southeast Asian countries in one go. Stays in Singapore, Kuala Lumpur, Genting Highlands, with Batu Caves and Universal Studios included.',
        'seo_keywords' => 'singapore malaysia combo package, kuala lumpur twin towers tour, genting highlands cable car, batu caves tour',
        'image' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',
        'images' => ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'How do we travel from Singapore to KL?', 'a' => 'We use a luxury cross-border AC coach which takes about 5-6 hours, passing through Johar Bahru checkpost.'],
            ['q' => 'Do we need separate visas?', 'a' => 'Yes, separate e-visas are required for Singapore and Malaysia.']
        ],
        'quick_facts' => ['Route' => 'Singapore - Kuala Lumpur - Genting Highlands', 'Duration' => '6 Nights / 7 Days', 'Transit' => 'Luxury Cross-Border AC Coach']
    ];

    $packages[] = [
        'name' => 'Singapore Family Fun Package',
        'slug' => 'singapore-family-fun',
        'price' => 185000,
        'duration' => '5 Days / 4 Nights',
        'category' => ['international', 'family'],
        'destinations' => ['Singapore', 'Sentosa'],
        'highlights' => ['Universal Studios Family Day', 'Singapore Zoo', 'Jurong Bird Park', 'Kids Discovery Centre', 'Sentosa Beach'],
        'inclusions' => ['4 nights family room 4-star', 'Daily breakfast', 'Airport transfers', 'Universal Studios family tickets', 'Singapore Zoo', 'Jurong Bird Park', 'Kids Discovery Centre', 'Sentosa access'],
        'exclusions' => ['Airfare', 'Visa fees', 'Lunch and dinner', 'Personal expenses'],
        'best_time' => 'Year round',
        'group_size' => '3-5 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Singapore Family Fun Vacation (4 Pax) | GhumoFiroo Travels',
        'seo_description' => 'A perfect family getaway to Singapore. Quad rooms at 4-star hotels, group tickets to Universal Studios, Singapore Zoo, Jurong Bird Park, and Sentosa beaches.',
        'seo_keywords' => 'singapore family vacation package, family room singapore hotel, kids friendly singapore package, jurong bird park ticket',
        'image' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',
        'images' => ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is the hotel room suitable for 2 adults and 2 kids?', 'a' => 'Yes, we book spacious family quad rooms with two queen-size beds or extra rollaway beds.'],
            ['q' => 'Can we customize attraction tickets?', 'a' => 'Yes, tickets can be swapped for S.E.A. Aquarium, Adventure Cove Waterpark, or Science Centre.']
        ],
        'quick_facts' => ['Stay' => '4-Star Family Quad Room', 'Group' => 'Perfect for 4 Pax Family', 'Attractions' => 'Zoo, Bird Park & Universal Studios']
    ];

    $packages[] = [
        'name' => 'Singapore Honeymoon Escape',
        'slug' => 'singapore-honeymoon-escape',
        'price' => 110000,
        'duration' => '5 Days / 4 Nights',
        'category' => ['international', 'honeymoon', 'romantic'],
        'destinations' => ['Singapore', 'Sentosa'],
        'highlights' => ['Sentosa Resort Stay', 'Couples Spa', 'Marina Bay Sands Infinity Pool', 'Candlelight Dinner', 'Gardens by Night'],
        'inclusions' => ['2 nights Marina Bay area hotel + 2 nights Sentosa resort', 'Daily breakfast + 1 candlelight dinner', 'Couples spa', 'Marina Bay Sands infinity pool access', 'Gardens by Bay at night', 'Cable car sunset ride'],
        'exclusions' => ['Airfare', 'Visa fees', 'Personal expenses', 'Other meals', 'Alcohol'],
        'best_time' => 'Year round',
        'group_size' => '2 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Romantic Singapore Honeymoon Package | GhumoFiroo Travels',
        'seo_description' => 'A magical honeymoon in Singapore. Split stay at Marina Bay Sands and a secluded beach resort in Sentosa, luxury candlelight dining, and couple spas.',
        'seo_keywords' => 'singapore honeymoon package, romantic sentosa tour, marina bay sands infinity pool couples, candlelight dinner singapore',
        'image' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',
        'images' => ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is access to the Sands Infinity Pool guaranteed?', 'a' => 'Yes, our package stays at the Marina Bay Sands Hotel, which includes private guest access to the world-famous SkyPark Infinity Pool.'],
            ['q' => 'Can we get room decorations?', 'a' => 'Yes, a complimentary honeymoon cake and basic room floral decoration is included on arrival.']
        ],
        'quick_facts' => ['Stay' => '2 Nights Marina Bay Sands + 2 Nights Sentosa Beach Resort', 'Honeymoon' => 'Complimentary Cake & Room Decor', 'Dining' => 'Premium Beachfront Candlelight Dinner']
    ];

    $packages[] = [
        'name' => 'Singapore Luxury Collection',
        'slug' => 'singapore-luxury-collection',
        'price' => 150000,
        'duration' => '6 Days / 5 Nights',
        'category' => ['international', 'luxury'],
        'destinations' => ['Singapore', 'Sentosa'],
        'highlights' => ['5-Star Hotel Stay', 'Private City Tour', 'Michelin Restaurant Dinner', 'Night Safari VIP', 'Helicopter Joyride'],
        'inclusions' => ['3 nights 5-star Marina Bay Sands + 2 nights Sentosa 5-star', 'Daily breakfast + 2 fine dining dinners', 'Private car and guide', 'Universal Studios VIP access', 'Night Safari VIP', 'Helicopter joyride', 'Couples spa', 'Gardens by Bay'],
        'exclusions' => ['Airfare business class', 'Visa fees', 'Personal shopping', 'Other meals', 'Alcohol'],
        'best_time' => 'Year round',
        'group_size' => '2-6 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Ultra Luxury Singapore Getaway | GhumoFiroo Travels',
        'seo_description' => 'Unveil the premium side of Singapore. Stay at the iconic Marina Bay Sands, private yacht and chauffeur service, VIP safari tours, and Michelin-star dining.',
        'seo_keywords' => 'luxury singapore tour, michelin star dining singapore, private guide singapore, universal studios vip pass',
        'image' => 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200',
        'images' => ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'What does Universal VIP access include?', 'a' => 'The VIP ticket includes a dedicated park guide, fast-track access to all rides, and reserved seating for shows.'],
            ['q' => 'Is transport in a luxury car?', 'a' => 'Yes, a private Mercedes-Benz S-Class or premium Alphard van with an English-speaking chauffeur is provided for all transits.']
        ],
        'quick_facts' => ['Stay' => '5-Star Luxury Resorts', 'Transport' => 'Private Mercedes Benz S-Class', 'VIP Passes' => 'Universal Studios & Night Safari VIP']
    ];


    // --- EUROPE PACKAGES ---
    $packages[] = [
        'name' => 'Switzerland Highlights',
        'slug' => 'europe-switzerland-highlights',
        'price' => 95000,
        'duration' => '6 Days / 5 Nights',
        'category' => ['international', 'europe', 'scenic'],
        'destinations' => ['Switzerland', 'Zurich', 'Interlaken', 'Jungfraujoch', 'Lucerne', 'Zermatt'],
        'highlights' => ['Jungfraujoch Top of Europe', 'Zermatt Matterhorn Views', 'Lucerne Chapel Bridge', 'Interlaken Adventure', 'Rhine Falls'],
        'inclusions' => ['5 nights 4-star hotels', 'Daily breakfast', 'Airport transfers', 'Swiss Travel Pass (3 days)', 'Jungfraujoch tickets', 'Guided city tours'],
        'exclusions' => ['Airfare', 'Schengen visa fees', 'Lunch and dinner', 'Personal expenses', 'Zermatt gondola', 'Alcohol'],
        'best_time' => 'June to September and December to February',
        'group_size' => '2-15 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Switzerland Scenic Highlights Tour | GhumoFiroo Travels',
        'seo_description' => 'Bask in Swiss beauty. Visit Zurich, Interlaken, Lucerne, Zermatt. Includes Swiss Travel Pass and mountain train tickets to Jungfraujoch Top of Europe.',
        'seo_keywords' => 'switzerland tour package, jungfraujoch top of europe ticket, swiss travel pass tour, scenic swiss mountains',
        'image' => 'https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3',
        'images' => ['https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is Swiss Travel Pass included?', 'a' => 'Yes, a 3-day Swiss Travel Pass is included which allows free travel on trains, buses, and boats.'],
            ['q' => 'Does the tour include Zermatt?', 'a' => 'Yes, Zermatt car-free village visit is included, though gondolas to Matterhorn summit cost extra.']
        ],
        'quick_facts' => ['Stay' => 'Premium Alpine 4-Star Hotels', 'Transport' => 'Swiss Rail Pass Included', 'Mountain' => 'Jungfraujoch Ticket Included']
    ];

    $packages[] = [
        'name' => 'France Highlights',
        'slug' => 'europe-france-highlights',
        'price' => 89999,
        'duration' => '6 Days / 5 Nights',
        'category' => ['international', 'europe', 'culture'],
        'destinations' => ['France', 'Paris', 'Nice', 'Versailles', 'Loire Valley'],
        'highlights' => ['Eiffel Tower', 'Louvre Museum', 'Versailles Palace', 'French Riviera Nice', 'Seine River Cruise'],
        'inclusions' => ['5 nights 4-star hotels', 'Daily breakfast', 'Airport transfers', 'Eiffel Tower (2nd floor)', 'Louvre skip-line tickets', 'Versailles tickets', 'Seine cruise', 'Nice day tour'],
        'exclusions' => ['Airfare', 'Schengen visa', 'Lunch and dinner', 'Personal expenses', 'Eiffel Tower summit', 'Alcohol'],
        'best_time' => 'April to June and September to November',
        'group_size' => '2-15 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'France Highlights and French Riviera Tour | GhumoFiroo Travels',
        'seo_description' => 'Unveil the romance of France. Tour Paris Eiffel Tower, Versailles Palace, skip-the-line Louvre Museum, and travel to sunny Nice on the French Riviera.',
        'seo_keywords' => 'france tour package, paris eiffel tower tickets, louvre museum skip line pass, nice french riviera tour',
        'image' => 'https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3',
        'images' => ['https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Can we go to the top of Eiffel Tower?', 'a' => 'Second-floor ticket is included. Summit tickets are subject to availability and can be purchased as an upgrade.'],
            ['q' => 'How do we travel from Paris to Nice?', 'a' => 'We arrange high-speed TGV train tickets which reach Nice in approximately 5.5 hours.']
        ],
        'quick_facts' => ['Stay' => 'Boutique 4-Star Hotels', 'Sightseeing' => 'Louvre & Versailles Included', 'Transport' => 'High-Speed TGV Train Tickets']
    ];

    $packages[] = [
        'name' => 'Switzerland + Paris Tour',
        'slug' => 'europe-switzerland-paris-tour',
        'price' => 145000,
        'duration' => '8 Days / 7 Nights',
        'category' => ['international', 'europe', 'multi-country'],
        'destinations' => ['Switzerland', 'France', 'Zurich', 'Interlaken', 'Lucerne', 'Paris'],
        'highlights' => ['Jungfraujoch', 'Interlaken Paragliding', 'Eiffel Tower', 'Versailles Palace', 'Swiss Chocolate Factory'],
        'inclusions' => ['7 nights 4-star hotels', 'Daily breakfast', 'Zurich-Paris TGV train', 'Airport transfers', 'Jungfraujoch', 'Eiffel Tower', 'Versailles', 'Guided tours', 'Swiss Travel Pass (2 days)'],
        'exclusions' => ['Airfare', 'Schengen visa', 'Lunch and dinner', 'Personal expenses', 'Paragliding', 'Alcohol'],
        'best_time' => 'April to September',
        'group_size' => '2-12 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Switzerland and Paris Combo Tour | GhumoFiroo Travels',
        'seo_description' => 'Explore the scenic Swiss Alps and romantic Paris. Stays in Zurich, Interlaken, and Paris with Jungfraujoch rail, Eiffel Tower tickets, and TGV train transit.',
        'seo_keywords' => 'switzerland paris package, paris to zurich tgv, interlaklen chocolate factory, eiffel tower and swiss alps',
        'image' => 'https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3',
        'images' => ['https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is paragliding in Interlaken included?', 'a' => 'No, paragliding is an optional activity which can be booked on the spot with local certified operators.'],
            ['q' => 'What is TGV?', 'a' => 'TGV is the high-speed French railway service, offering a fast and comfortable cross-border ride.']
        ],
        'quick_facts' => ['Route' => 'Zurich - Interlaken - Lucerne - Paris', 'Transit' => 'High-Speed TGV Train (2nd Class)', 'Stay' => 'Central City 4-Star Hotels']
    ];

    $packages[] = [
        'name' => 'Switzerland + Italy Tour',
        'slug' => 'europe-switzerland-italy-tour',
        'price' => 155000,
        'duration' => '9 Days / 8 Nights',
        'category' => ['international', 'europe', 'multi-country'],
        'destinations' => ['Switzerland', 'Italy', 'Zurich', 'Lucerne', 'Milan', 'Florence', 'Rome'],
        'highlights' => ['Jungfraujoch', 'Milan Fashion District', 'Florence Uffizi Gallery', 'Colosseum Rome', 'Vatican City'],
        'inclusions' => ['8 nights 4-star hotels', 'Daily breakfast', 'Cross-border coach', 'Airport transfers', 'Jungfraujoch', 'Colosseum skip-line', 'Vatican Museum', 'Uffizi Gallery', 'Guided city tours'],
        'exclusions' => ['Airfare', 'Schengen visa', 'Lunch and dinner', 'Personal expenses', 'Alcohol'],
        'best_time' => 'April to September',
        'group_size' => '2-12 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Switzerland and Italy Multi-Country Tour | GhumoFiroo Travels',
        'seo_description' => 'Unite scenic mountains and historic cities. Swiss Alps Jungfraujoch tour combined with Milan fashion houses, Florence galleries, Rome Colosseum and Vatican.',
        'seo_keywords' => 'switzerland italy combo package, colosseum tickets rome, vatican museum tour, uffizi gallery florence',
        'image' => 'https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3',
        'images' => ['https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is entry to Vatican museums included?', 'a' => 'Yes, skip-the-line tickets to the Vatican Museums and Sistine Chapel are pre-arranged.'],
            ['q' => 'How do we travel across the border?', 'a' => 'We use a private air-conditioned coach to drive from Switzerland into Milan, Italy.']
        ],
        'quick_facts' => ['Route' => 'Zurich - Lucerne - Milan - Florence - Rome', 'Transit' => 'Private AC Luxury Coach', 'Attractions' => 'Colosseum & Vatican Passes Included']
    ];

    $packages[] = [
        'name' => 'Europe Highlights 12 Days',
        'slug' => 'europe-highlights-12-days',
        'price' => 185000,
        'duration' => '12 Days / 11 Nights',
        'category' => ['international', 'europe', 'multi-country'],
        'destinations' => ['France', 'Belgium', 'Netherlands', 'Germany', 'Switzerland', 'Italy'],
        'highlights' => ['Paris Eiffel Tower', 'Bruges Medieval Town', 'Amsterdam Canals', 'Frankfurt', 'Swiss Alps', 'Rome Colosseum'],
        'inclusions' => ['11 nights 4-star hotels', 'Daily breakfast', 'Coach transfers between cities', 'Airport transfers', 'Eiffel Tower', 'Bruges tour', 'Amsterdam canal cruise', 'Swiss Alps excursion', 'Colosseum', 'Guided city tours'],
        'exclusions' => ['Airfare', 'Schengen visa', 'Lunch and dinner', 'Personal expenses', 'Alcohol'],
        'best_time' => 'April to September',
        'group_size' => '15-40 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Highlights of Europe 12 Days Group Tour | GhumoFiroo Travels',
        'seo_description' => 'Discover the best of Europe in 12 days. Visit France, Belgium, Netherlands, Germany, Switzerland, and Italy with group coaches, hotels and sightseeing.',
        'seo_keywords' => 'europe 12 days tour, multi country europe package, paris amsterdam switzerland rome, group tour europe',
        'image' => 'https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3',
        'images' => ['://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is this a guided group tour?', 'a' => 'Yes, you will travel in a luxury coach with a professional tour manager who stays with the group.'],
            ['q' => 'Are dinners included?', 'a' => 'Breakfasts are included. Dinners can be added as a meal plan option for local Indian restaurants.']
        ],
        'quick_facts' => ['Stay' => 'Central 4-Star Hotels', 'Group' => 'Escorted Group Tour', 'Countries' => '6 European Nations Covered']
    ];

    $packages[] = [
        'name' => 'Switzerland + Italy + France',
        'slug' => 'europe-swiss-italy-france-tour',
        'price' => 175000,
        'duration' => '11 Days / 10 Nights',
        'category' => ['international', 'europe', 'multi-country'],
        'destinations' => ['Switzerland', 'Italy', 'France', 'Zurich', 'Milan', 'Florence', 'Rome', 'Nice', 'Paris'],
        'highlights' => ['Swiss Alps Jungfraujoch', 'Colosseum', 'Vatican City', 'Amalfi Coast Drive', 'Eiffel Tower', 'Riviera Nice'],
        'inclusions' => ['10 nights 4-star hotels', 'Daily breakfast', 'Cross-border coach', 'Airport transfers', 'Jungfraujoch', 'Colosseum', 'Vatican', 'Eiffel Tower', 'Nice day tour', 'Guided tours throughout'],
        'exclusions' => ['Airfare', 'Schengen visa', 'Lunch and dinner', 'Personal expenses', 'Alcohol'],
        'best_time' => 'April to September',
        'group_size' => '2-12 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Swiss, Italy, and France 11-Day Tour | GhumoFiroo Travels',
        'seo_description' => 'Unravel the grand trio of Europe. Stays in Zurich, Milan, Rome, Nice, and Paris with Swiss peaks, Roman antiquities, Riviera sun, and Eiffel Tower climbs.',
        'seo_keywords' => 'switzerland italy france tour, amalfi coast driving tour, french riviera vacation, eiffel tower and colosseum',
        'image' => 'https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3',
        'images' => ['https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'Is there a long drive involved?', 'a' => 'Yes, cross-border coach trips offer scenic views, though drives can be 4-6 hours on transit days.'],
            ['q' => 'Is hotel porterage included?', 'a' => 'Hotel porterage is excluded. Guests should be comfortable carrying their own luggage.']
        ],
        'quick_facts' => ['Route' => 'Zurich - Milan - Rome - Nice - Paris', 'Duration' => '10 Nights / 11 Days', 'Sightseeing' => 'Full Escorted Excursions']
    ];

    $packages[] = [
        'name' => 'Grand Europe Tour',
        'slug' => 'grand-europe-tour-15days',
        'price' => 245000,
        'duration' => '15 Days / 14 Nights',
        'category' => ['international', 'europe', 'multi-country', 'premium'],
        'destinations' => ['France', 'Belgium', 'Netherlands', 'Germany', 'Austria', 'Switzerland', 'Italy'],
        'highlights' => ['7 Countries', 'Eiffel Tower', 'Bruges', 'Amsterdam', 'Neuschwanstein Castle', 'Vienna Opera House', 'Jungfraujoch', 'Colosseum', 'Vatican'],
        'inclusions' => ['14 nights 4-star+ hotels', 'Daily breakfast', 'Luxury coach throughout', 'Airport transfers', 'All major attraction tickets', 'Eiffel Tower', 'Bruges', 'Amsterdam canal cruise', 'Neuschwanstein', 'Vienna Philharmonic evening', 'Jungfraujoch', 'Colosseum', 'Vatican', 'Professional tour manager throughout'],
        'exclusions' => ['Airfare', 'Schengen visa', 'Lunch and dinner', 'Personal expenses', 'Alcohol', 'Optional excursions'],
        'best_time' => 'May to September',
        'group_size' => '15-35 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Grand Europe 15-Day Premium Tour | GhumoFiroo Travels',
        'seo_description' => 'Our ultimate European holiday. Visit 7 countries in 15 days in premium 4-star plus hotels. Guided tours of Paris, Amsterdam, Swiss Alps, Vienna, and Rome.',
        'seo_keywords' => 'grand europe tour package, 15 days europe luxury tour, neuschwanstein castle visit, vienna opera house tickets',
        'image' => 'https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3',
        'images' => ['https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3'],
        'itinerary' => [
            ['day' => 1, 'title' => 'Arrive Paris & Seine River Cruise', 'description' => 'Arrive in Paris, meet your professional tour manager. Settle into your premium 4-star hotel and enjoy a scenic evening Seine River Cruise.', 'highlights' => ['Seine Cruise', 'Paris illumination views']],
            ['day' => 2, 'title' => 'Paris Sightseeing & Eiffel Tower', 'description' => 'Take a guided city tour covering Arc de Triomphe, Champs Elysees, and Concorde. Visit the 2nd Floor of the Eiffel Tower and the Louvre Museum.', 'highlights' => ['Eiffel Tower 2nd Floor', 'Louvre Museum Mona Lisa']],
            ['day' => 3, 'title' => 'Paris to Bruges & Brussels (Belgium)', 'description' => 'Drive to Bruges, the Venice of the North. Take a medieval town walk. Later, drive to Brussels and visit the famous Grand Place.', 'highlights' => ['Bruges canals', 'Grand Place Brussels']],
            ['day' => 4, 'title' => 'Brussels to Amsterdam Canal Cruise', 'description' => 'Drive into the Netherlands. Check into your hotel. Experience a classic Amsterdam Canal Cruise through the historic canal belt.', 'highlights' => ['Amsterdam Canal Cruise', 'Dutch windmills view']],
            ['day' => 5, 'title' => 'Amsterdam to Frankfurt Rhine Valley', 'description' => 'Drive through the scenic Rhine Valley in Germany. Catch glimpses of medieval castles and stop in Frankfurt for a short orientation tour.', 'highlights' => ['Rhine Valley scenery', 'Frankfurt Romer square']],
            ['day' => 6, 'title' => 'Frankfurt to Munich & Neuschwanstein', 'description' => 'Travel south to Bavaria. Visit the fairy-tale Neuschwanstein Castle, then drive to Munich for an overnight stay.', 'highlights' => ['Neuschwanstein Castle tour', 'Munich Marienplatz']],
            ['day' => 7, 'title' => 'Munich to Salzburg & Vienna Opera House', 'description' => 'Drive via Mozart\'s birthplace Salzburg to Vienna, Austria. Attend a classical Vienna Philharmonic evening show.', 'highlights' => ['Salzburg walk', 'Vienna Philharmonic concert']],
            ['day' => 8, 'title' => 'Vienna Palace & City Tour', 'description' => 'Guided tour of Schonbrunn Palace and the grand Ringstrasse monuments. Free evening to explore Viennese cafe culture.', 'highlights' => ['Schonbrunn Palace tour', 'Viennese Apple Strudel tasting']],
            ['day' => 9, 'title' => 'Vienna to Interlaken Alpine Drive', 'description' => 'A long but spectacularly scenic drive across Austria and into the heart of the Swiss Alps, checking into your resort in Interlaken.', 'highlights' => ['Austrian Alps drive', 'Interlaken lakeside resort']],
            ['day' => 10, 'title' => 'Jungfraujoch - Top of Europe', 'description' => 'Board the cogwheel train to Jungfraujoch, the highest railway station in Europe. Visit the Ice Palace and take in snowy panoramas.', 'highlights' => ['Jungfraujoch summit train', 'Ice Palace walk']],
            ['day' => 11, 'title' => 'Lucerne to Milan Fashion District', 'description' => 'Visit Lucerne\'s Chapel Bridge. Cross the Swiss-Italian border into Milan. See the gothic Duomo and visit the fashion Galleria.', 'highlights' => ['Lucerne Chapel Bridge', 'Milan Duomo & Galleria']],
            ['day' => 12, 'title' => 'Milan to Florence Uffizi & David', 'description' => 'Drive to Florence, the cradle of Renaissance. Visit the Uffizi Gallery and see Michelangelo\'s David. Stay overnight.', 'highlights' => ['Uffizi Gallery David statue', 'Ponte Vecchio walk']],
            ['day' => 13, 'title' => 'Florence to Colosseum & Forum (Rome)', 'description' => 'Travel to Rome. Experience a guided skip-the-line tour of the historic Colosseum and the Roman Forum.', 'highlights' => ['Colosseum skip-line tour', 'Roman Forum ruins']],
            ['day' => 14, 'title' => 'Vatican Museums & Sistine Chapel', 'description' => 'Guided tour of the sovereign Vatican City, visiting the Vatican Museums, Sistine Chapel, and St. Peter\'s Basilica.', 'highlights' => ['Sistine Chapel ceiling', 'St. Peter\'s Basilica']],
            ['day' => 15, 'title' => 'Rome Departure', 'description' => 'Bid farewell to Europe. Transfer to Fiumicino Airport for your flight back home.', 'highlights' => ['Airport transfers', 'Memories of 7 Countries']]
        ],
        'faqs' => [
            ['q' => 'Is Schengen visa support provided?', 'a' => 'Yes, our team assists you with the Schengen visa documentation, though final approval rests with the embassy.'],
            ['q' => 'Which hotels are used?', 'a' => 'We book premium 4-star or 4-star superior hotels, such as Mercure Paris, NH Amsterdam, and Swiss alpine resorts.']
        ],
        'quick_facts' => ['Stay' => 'Premium 4-Star Plus Hotels', 'Transit' => 'Private Air-Conditioned Luxury Coach', 'Special' => 'Vienna Philharmonic Concert & VIP Entries']
    ];

    $packages[] = [
        'name' => 'Italy Cultural Immersion',
        'slug' => 'europe-italy-cultural',
        'price' => 99000,
        'duration' => '7 Days / 6 Nights',
        'category' => ['international', 'europe', 'culture'],
        'destinations' => ['Italy', 'Rome', 'Florence', 'Venice', 'Amalfi'],
        'highlights' => ['Colosseum & Forum', 'Vatican & Sistine Chapel', 'Florence Uffizi & David', 'Venice Gondola', 'Amalfi Coast Drive'],
        'inclusions' => ['6 nights 4-star hotels', 'Daily breakfast', 'Rome-Florence-Venice train', 'Airport transfers', 'Colosseum skip-line', 'Vatican Museum', 'Uffizi Gallery', 'Venice gondola ride', 'Guided city tours'],
        'exclusions' => ['Airfare', 'Schengen visa', 'Lunch and dinner', 'Personal expenses', 'Alcohol'],
        'best_time' => 'April to June and September to October',
        'group_size' => '2-12 People',
        'difficulty' => 'Easy',
        'package_type' => 'international',
        'seo_title' => 'Italy Cultural Immersion 7-Day Tour | GhumoFiroo Travels',
        'seo_description' => 'Immerse yourself in Italy\'s history, art and beaches. Guided visits of Rome Colosseum/Vatican, Florence Uffizi, Venice gondolas and Amalfi Coast drive.',
        'seo_keywords' => 'italy cultural tour, venice gondola ride, amalfi coast scenic drive, florence david tour',
        'image' => 'https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3',
        'images' => ['https://images.unsplash.com/photo-1490642914619-7955a3fd483c?ixlib=rb-4.0.3'],
        'itinerary' => null,
        'faqs' => [
            ['q' => 'How do we travel between Rome, Florence and Venice?', 'a' => 'We use the high-speed Frecciarossa train service, which is comfortable and efficient.'],
            ['q' => 'Is Amalfi drive a guided excursion?', 'a' => 'Yes, a local private driver will guide you along the narrow and beautiful cliffs of the Amalfi coast.']
        ],
        'quick_facts' => ['Route' => 'Rome - Florence - Venice - Amalfi', 'Transit' => 'High-Speed Frecciarossa Trains', 'Highlights' => 'Private Amalfi Coast Drive']
    ];


    // 2. Prepare Insert Statement
    $sql = "INSERT IGNORE INTO packages (
        id, name, price, slug, duration, image, images, category, rating, reviews,
        destinations, highlights, inclusions, exclusions, itinerary, faqs,
        seo_title, seo_description, seo_keywords, best_time, group_size, difficulty,
        quick_facts, package_type, is_active
    ) VALUES (
        UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1
    )";

    $stmt = $pdo->prepare($sql);

    $inserted = 0;
    $skipped = 0;

    foreach ($packages as $pkg) {
        // Check if slug already exists
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM packages WHERE slug = ?");
        $checkStmt->execute([$pkg['slug']]);
        if ($checkStmt->fetchColumn() > 0) {
            $skipped++;
            echo "Skipping existing package slug: {$pkg['slug']}\n";
            continue;
        }

        // Execute Insert
        $stmt->execute([
            $pkg['name'],
            $pkg['price'],
            $pkg['slug'],
            $pkg['duration'],
            $pkg['image'],
            json_encode($pkg['images']),
            json_encode($pkg['category']),
            4.8, // default rating
            24,  // default reviews count
            json_encode($pkg['destinations']),
            json_encode($pkg['highlights']),
            json_encode($pkg['inclusions']),
            json_encode($pkg['exclusions']),
            $pkg['itinerary'] ? json_encode($pkg['itinerary']) : null,
            json_encode($pkg['faqs']),
            $pkg['seo_title'] ?? $pkg['name'] . " | GhumoFiroo Travels",
            $pkg['seo_description'] ?? "Book our premium " . $pkg['name'] . " with GhumoFiroo. Enjoy scenic travel with top-tier stays.",
            $pkg['seo_keywords'] ?? implode(', ', $pkg['category']) . ", tour packages",
            $pkg['best_time'],
            $pkg['group_size'],
            $pkg['difficulty'],
            json_encode($pkg['quick_facts']),
            $pkg['package_type']
        ]);
        
        $inserted++;
        echo "Successfully inserted package slug: {$pkg['slug']}\n";
    }

    echo "\n=== SEEDING SUMMARY ===\n";
    echo "Total Inserted: {$inserted}\n";
    echo "Total Skipped: {$skipped}\n";

} catch (Exception $e) {
    echo "FATAL ERROR during seeding: " . $e->getMessage() . "\n";
}
