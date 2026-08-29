export interface SightseeingSpot {
  slug: string;
  name: string;
  destination: string;
  category: string;
  summary: string;
  description: string;
  duration: string;
  bestTime: string;
  image: string;
  highlights: string[];
  location: string;
  packages: {
    title: string;
    link: string;
    duration: string;
    price: number;
    badge?: string;
  }[];
}

export const SIGHTSEEING_SPOTS: SightseeingSpot[] = [
  // --- KUTCH & RANN UTSAV ---
  {
    slug: "road-to-heaven-dholavira",
    name: "Road to Heaven (Dholavira Highway)",
    destination: "Kutch, Gujarat",
    category: "Scenic Drives & Nature",
    summary: "World-famous 30km highway cutting through the gleaming white salt desert and turquoise Rann waters.",
    description: "The 'Road to Heaven' is a breathtaking 30-kilometer salt sea road connecting Khavda to Dholavira in Kutch. Driving on this road feels like traversing a silver bridge surrounded by crystal-clear turquoise waters on both sides and vast endless white salt plains.",
    duration: "2–3 Hours",
    bestTime: "November to February (Sunrise / Sunset)",
    image: "/rann_utsav_road_to_heaven.jpg",
    location: "Khavda - Dholavira Highway, Kutch, Gujarat",
    highlights: [
      "30km Scenic Salt Highway Drive",
      "Turquoise Water & White Desert Views",
      "Unmatched Photography & Drone Spot",
      "Gateway to 5,000-year Harappan UNESCO Site"
    ],
    packages: [
      {
        title: "Grand Rann & Road to Heaven Dholavira Circuit (4D/3N)",
        link: "/packages/rann-utsav",
        duration: "4 Days / 3 Nights",
        price: 24500,
        badge: "Road to Heaven Special"
      },
      {
        title: "Complete Kutch Odyssey & Beach Resort Escape (5D/4N)",
        link: "/packages/rann-utsav",
        duration: "5 Days / 4 Nights",
        price: 29500,
        badge: "Ultimate Kutch Tour"
      }
    ]
  },
  {
    slug: "kalo-dungar-bhuj",
    name: "Kalo Dungar (Black Hill)",
    destination: "Kutch, Gujarat",
    category: "Viewpoints & Culture",
    summary: "The highest mountain peak in Kutch offering panoramic views of the Great Rann and Lord Dattatreya Temple.",
    description: "Rising 462 meters above sea level, Kalo Dungar (Black Hill) is the highest point in Kutch. It offers an unobstructed 360-degree view of the Great Rann of Kutch salt flats merging into the horizon. It is also famous for the ancient 400-year-old Dattatreya Temple and the mysterious Magnetic Hill phenomenon.",
    duration: "2–3 Hours",
    bestTime: "Evening Sunset (4:30 PM - 6:30 PM)",
    image: "/Rann-Utsav-Gujarat.png",
    location: "Khavda, Kutch District, Gujarat",
    highlights: [
      "Highest Peak in Kutch (462m)",
      "Panoramic Great Rann Viewpoint",
      "400-Year-Old Lord Dattatreya Temple",
      "Jackal Feeding Ritual & Magnetic Hill"
    ],
    packages: [
      {
        title: "Rann Utsav Express Tent City Retreat (3D/2N)",
        link: "/packages/rann-utsav",
        duration: "3 Days / 2 Nights",
        price: 18500,
        badge: "Evoke Partner Best Seller"
      }
    ]
  },
  {
    slug: "white-rann-desert",
    name: "Great White Rann Desert & Full Moon Walk",
    destination: "Kutch, Gujarat",
    category: "Desert & Festivals",
    summary: "Vast 7,500 sq km salt desert featuring vibrant Kutchi Garba, sunset camel rides, and full moon night walks.",
    description: "The Great Rann of Kutch is one of the largest salt deserts in the world. During the winter festival of Rann Utsav, the desert transforms into a cultural wonderland with Kutchi folk music, traditional Garba dances, camel cart rides, and breathtaking full moon night reflections on the white salt crystals.",
    duration: "Half Day / Evening",
    bestTime: "Full Moon Nights (Oct to Mar)",
    image: "/Rann-Utsav-Gujarat.png",
    location: "Dhordo Village, Kutch, Gujarat",
    highlights: [
      "7,500 sq km White Salt Plain",
      "Full Moon Night Desert Excursion",
      "Live Kutchi Garba & Folk Music Stage",
      "Sunset Camel Cart Rides & ATV Sports"
    ],
    packages: [
      {
        title: "Rann Utsav 2D/1N Express Overnight Tent City",
        link: "/packages/rann-utsav",
        duration: "2 Days / 1 Night",
        price: 12500,
        badge: "Express Weekend"
      }
    ]
  },

  // --- KASHMIR ---
  {
    slug: "gulmarg-gondola-ride",
    name: "Gulmarg Gondola & Snow Point Excursion",
    destination: "Kashmir, India",
    category: "Snow & Adventure",
    summary: "Asia's highest and longest cable car ride ascending up to 13,780 ft at Mt. Kongdoori & Apharwat Peak.",
    description: "The Gulmarg Gondola is Kashmir's flagship attraction and the world's second-highest operating cable car. Phase 1 takes you to Kongdoori Valley (8,530 ft), while Phase 2 soars to Apharwat Peak (13,780 ft), offering thrilling snow skiing, sledding, and breathtaking views of the Nanga Parbat peak.",
    duration: "4–5 Hours",
    bestTime: "December to April (Snow) / May to Oct (Green Valleys)",
    image: "/kashmir.jpg",
    location: "Gulmarg, Baramulla District, Jammu & Kashmir",
    highlights: [
      "World's 2nd Highest Cable Car (13,780 ft)",
      "Phase 1 (Kongdoori) & Phase 2 (Apharwat Peak)",
      "Premier Skiing & Snowboarding Slopes",
      "Panoramic Himalayan Peak Views"
    ],
    packages: [
      {
        title: "Classic Kashmir Paradise Tour (5D/4N)",
        link: "/packages/kashmir-paradise",
        duration: "5 Days / 4 Nights",
        price: 18500,
        badge: "Best Seller"
      },
      {
        title: "Grand Kashmir 7D/6N Circuit",
        link: "/packages/kashmir-paradise",
        duration: "7 Days / 6 Nights",
        price: 24999,
        badge: "Comprehensive Tour"
      }
    ]
  },
  {
    slug: "srinagar-dal-lake-shikara",
    name: "Dal Lake Shikara Ride & Floating Market",
    destination: "Kashmir, India",
    category: "Lakes & Relaxation",
    summary: "Romantic wooden Shikara boat ride through lotus gardens, floating handicraft bazaars, and historic wooden houseboats.",
    description: "A Shikara ride on Dal Lake in Srinagar is the soulful heart of Kashmir tourism. Glide past majestic Zabarwan mountains, ancient wooden houseboats, floating vegetable markets, and floating flower vendors while sipping authentic warm Kashmiri Kahwa tea.",
    duration: "1–2 Hours",
    bestTime: "Sunset (5:00 PM - 7:00 PM)",
    image: "/kashmir.jpg",
    location: "Dal Lake, Boulevard Road, Srinagar",
    highlights: [
      "Traditional Decorated Wooden Shikara Ride",
      "Floating Vegetable & Handicraft Bazaar",
      "Sunset Reflections over Zabarwan Mountains",
      "Authentic Kashmiri Kahwa Tea Served Onboard"
    ],
    packages: [
      {
        title: "Classic Kashmir Paradise Tour (5D/4N)",
        link: "/packages/kashmir-paradise",
        duration: "5 Days / 4 Nights",
        price: 18500,
        badge: "Best Seller"
      }
    ]
  },
  {
    slug: "pahalgam-betaab-valley",
    name: "Pahalgam Betaab Valley & Aru Valley",
    destination: "Kashmir, India",
    category: "Valleys & Nature",
    summary: "Lush green pine valleys, roaring Lidder River, and picturesque meadow trails featured in Bollywood classics.",
    description: "Betaab Valley (named after the famous Bollywood film Betaab) is a pristine valley near Pahalgam surrounded by snow-capped mountains, dense pine forests, and the crystal-clear Lidder River. Nearby Aru Valley offers scenic pony rides and tranquil alpine meadows.",
    duration: "Full Day Excursion",
    bestTime: "April to October",
    image: "/kashmir.jpg",
    location: "Pahalgam, Anantnag District, Kashmir",
    highlights: [
      "Pristine Lidder River Bank Views",
      "Bollywood Shooting Location (Betaab Valley)",
      "Pony Rides in Aru Valley & Baisaran Meadow",
      "Pine Forest Photography Spots"
    ],
    packages: [
      {
        title: "Classic Kashmir Paradise Tour (5D/4N)",
        link: "/packages/kashmir-paradise",
        duration: "5 Days / 4 Nights",
        price: 18500,
        badge: "Best Seller"
      }
    ]
  },

  // --- KERALA ---
  {
    slug: "alleppey-houseboat-cruise",
    name: "Alleppey Backwaters Houseboat Cruise",
    destination: "Kerala, India",
    category: "Nature & Relaxation",
    summary: "Tranquil cruise through emerald palm-fringed backwaters, paddy fields, and traditional Kuttanad villages.",
    description: "Cruising the serene backwaters of Alleppey (Alappuzha) aboard a traditional Kettuvallam (wooden houseboat) is Kerala's quintessential travel experience. Relax as you glide past lush green paddy fields, coconut groves, water lilies, and local village life while enjoying authentic Karimeen fish curry and coconut water.",
    duration: "Full Day / Overnight Stay",
    bestTime: "September to March",
    image: "/kerala.jpg",
    location: "Alappuzha, Kerala",
    highlights: [
      "Traditional Luxury Kettuvallam Stay",
      "Authentic Fresh Kerala Meals Prepared Onboard",
      "Vembanad Lake Sunset Views",
      "Village Canal Exploration by Canoe"
    ],
    packages: [
      {
        title: "Kerala Backwaters & Hill Station Bliss",
        link: "/packages/kerala-backwaters",
        duration: "5 Days / 4 Nights",
        price: 18999,
        badge: "Honeymoon Favorite"
      }
    ]
  },
  {
    slug: "munnar-tea-gardens",
    name: "Munnar Tea Gardens & Eravikulam Park",
    destination: "Kerala, India",
    category: "Hill Stations & Nature",
    summary: "Rolling carpet tea plantations, misty mountain peaks, and rare Nilgiri Tahr mountain goats.",
    description: "Munnar is South India's premier hill station situated 1,600m above sea level at the confluence of three mountain streams. Walk through sprawling Tata Tea estates, visit the Kannan Devan Tea Museum, and spot the endangered Nilgiri Tahr at Eravikulam National Park (Anamudi Peak).",
    duration: "Half Day / Full Day",
    bestTime: "September to May",
    image: "/kerala.jpg",
    location: "Munnar, Idukki District, Kerala",
    highlights: [
      "Endless Rolling Tea Plantation Estates",
      "Eravikulam National Park & Nilgiri Tahr Spotting",
      "Kannan Devan Tea Factory & Tasting Tour",
      "Mattupetty Dam & Echo Point"
    ],
    packages: [
      {
        title: "Kerala Backwaters & Hill Station Bliss",
        link: "/packages/kerala-backwaters",
        duration: "5 Days / 4 Nights",
        price: 18999,
        badge: "Honeymoon Favorite"
      }
    ]
  },
  {
    slug: "eravikulam-national-park-munnar",
    name: "Eravikulam National Park (Rajamalai)",
    destination: "Munnar, Kerala",
    category: "Nature & Wildlife",
    summary: "Home to the endangered Nilgiri Tahr mountain goat and South India's highest peak Anamudi (2,695m).",
    description: "Eravikulam National Park is Kerala's first national park, spanning 97 sq km of rolling high-altitude grasslands and shola forests. It protects the largest surviving population of the rare Nilgiri Tahr mountain goat and offers views of South India's highest peak, Anamudi Peak (2,695m).",
    duration: "3–4 Hours",
    bestTime: "September to May (Entry Fee: ₹200)",
    image: "/kerala.jpg",
    location: "Kannan Devan Hills, Munnar, Kerala",
    highlights: [
      "Spot Endangered Nilgiri Tahr Mountain Goats",
      "View South India's Highest Peak Anamudi (2,695m)",
      "High-Altitude Shola Grassland Eco-System",
      "Neela Kurinji Flower Blooming Spot (Every 12 Yrs)"
    ],
    packages: [
      {
        title: "Kerala Backwaters & Hill Station Bliss",
        link: "/packages/kerala-backwaters",
        duration: "5 Days / 4 Nights",
        price: 18999,
        badge: "Honeymoon Favorite"
      }
    ]
  },
  {
    slug: "mattupetty-dam-boating-munnar",
    name: "Mattupetty Dam & Speed Boating",
    destination: "Munnar, Kerala",
    category: "Lakes & Boating",
    summary: "Picturesque concrete gravity dam featuring thrilling speed boating, horse riding, and echo point.",
    description: "Built in 1953, Mattupetty Dam is a vital water reservoir nestled amidst misty tea gardens and hills. Visitors can enjoy high-speed motorboat rides (₹500-₹700 per boat), pedal boating, and visits to nearby Echo Point where calls echo across the mountain slopes.",
    duration: "2–3 Hours",
    bestTime: "September to May (Speed Boat: ₹500/5 pax)",
    image: "/kerala.jpg",
    location: "Mattupetty, 13km from Munnar Town, Kerala",
    highlights: [
      "High-Speed Motorboat Rides across Reservoir",
      "Echo Point Natural Sound Echo Phenomenon",
      "Lush Tea Estate & Hill Side Views",
      "Horse Riding & Local Souvenir Bazaars"
    ],
    packages: [
      {
        title: "Kerala Backwaters & Hill Station Bliss",
        link: "/packages/kerala-backwaters",
        duration: "5 Days / 4 Nights",
        price: 18999,
        badge: "Honeymoon Favorite"
      }
    ]
  },
  {
    slug: "carmelagiri-elephant-park-munnar",
    name: "Carmelagiri Elephant Park & Ride",
    destination: "Munnar, Kerala",
    category: "Wildlife & Safari",
    summary: "Private elephant park offering guided forest rides, elephant feeding, and photo sessions.",
    description: "Located on the Mattupetty road, Carmelagiri Elephant Park provides private guided elephant rides through scenic tea and spice plantations. Visitors can interact with domesticated Asian elephants, feed them fruit baskets, and take memorable family photographs.",
    duration: "1–2 Hours",
    bestTime: "Year-Round (Elephant Ride: ₹350–₹800/person)",
    image: "/kerala.jpg",
    location: "Mattupetty Road, Munnar, Kerala",
    highlights: [
      "15-Minute Forest Trail Elephant Ride",
      "Interactive Elephant Feeding & Fruit Basket",
      "Photography & Video Opportunities",
      "Family & Kid Friendly Experience"
    ],
    packages: [
      {
        title: "Kerala Backwaters & Hill Station Bliss",
        link: "/packages/kerala-backwaters",
        duration: "5 Days / 4 Nights",
        price: 18999,
        badge: "Honeymoon Favorite"
      }
    ]
  },
  {
    slug: "kolukkumalai-jeep-safari-munnar",
    name: "Kolukkumalai 4x4 Off-Road Jeep Safari",
    destination: "Munnar, Kerala",
    category: "Adventure & Jeep Safaris",
    summary: "Exhilarating 4x4 off-road drive to the world's highest organic tea plantation (7,900 ft).",
    description: "Kolukkumalai is world-renowned as the highest tea estate in the world, standing at 7,900 ft above sea level on the Kerala-Tamil Nadu border. Reaching the peak requires an adrenaline-pumping 4x4 off-road jeep safari over rugged mountain terrain, rewarding travelers with a cloud-sea sunrise view and authentic orthodox tea tasting.",
    duration: "4–5 Hours",
    bestTime: "Early Morning Sunrise (4:30 AM Jeep Safari: ₹3,000/jeep)",
    image: "/kerala.jpg",
    location: "Kolukkumalai, Bodinayakanur / Munnar Border",
    highlights: [
      "World's Highest Organic Tea Estate (7,900 ft)",
      "Breathtaking Cloud Sea Sunrise Viewpoint",
      "Rugged 4x4 Off-Road Mountain Jeep Safari",
      "Historic 100-Year-Old Orthodox Tea Factory"
    ],
    packages: [
      {
        title: "Kerala Backwaters & Hill Station Bliss",
        link: "/packages/kerala-backwaters",
        duration: "5 Days / 4 Nights",
        price: 18999,
        badge: "Honeymoon Favorite"
      }
    ]
  },
  {
    slug: "wonder-valley-adventure-park-munnar",
    name: "Wonder Valley Adventure Park & Zipline",
    destination: "Munnar, Kerala",
    category: "Adventure Parks & Ziplining",
    summary: "Full-day adventure park featuring high-line ziplining, 12D cinema, rope courses, and water games.",
    description: "Wonder Valley is Munnar's premier adventure and eco-theme park set amidst forest hills. It offers high-line ziplining over tree canopies, low & high rope courses, rock climbing, 12D motion theater, bungee trampolines, and water slides.",
    duration: "Half Day / Full Day",
    bestTime: "Year-Round (Pass: ₹1,000/person)",
    image: "/kerala.jpg",
    location: "Anachel, 14km from Munnar Town, Kerala",
    highlights: [
      "High-Line Canopy Zipline Ride",
      "High & Low Rope Obstacle Courses",
      "12D Motion Theater & VR Games",
      "Bungee Trampoline & Rock Climbing Wall"
    ],
    packages: [
      {
        title: "Kerala Backwaters & Hill Station Bliss",
        link: "/packages/kerala-backwaters",
        duration: "5 Days / 4 Nights",
        price: 18999,
        badge: "Honeymoon Favorite"
      }
    ]
  },

  // --- OOTY ---
  {
    slug: "ooty-nilgiri-toy-train",
    name: "Nilgiri Mountain Railway Toy Train",
    destination: "Ooty, Tamil Nadu",
    category: "Heritage Railways",
    summary: "UNESCO World Heritage steam train journey winding through tunnels, bridges, and tea-clad Nilgiri hills.",
    description: "The Nilgiri Mountain Railway is a UNESCO World Heritage site built by the British in 1908. Riding this historic blue and yellow steam engine train from Mettupalayam/Coonoor to Ooty takes you over 250 bridges, through 16 tunnels, and past breathtaking cliff-side tea gardens.",
    duration: "2–3 Hours",
    bestTime: "Year-Round (Advance Booking Required)",
    image: "/himachal.jpg",
    location: "Ooty Railway Station, Nilgiris, Tamil Nadu",
    highlights: [
      "UNESCO World Heritage Steam Railway",
      "Cross 250 Wooden Trestle Bridges & Tunnels",
      "Scenic Coonoor to Ooty Valley Views",
      "Authentic Heritage Wooden Carriages"
    ],
    packages: [
      {
        title: "Ooty & Coonoor Hill Station Escape (4D/3N)",
        link: "/packages",
        duration: "4 Days / 3 Nights",
        price: 14500,
        badge: "South India Special"
      }
    ]
  },
  {
    slug: "ooty-botanical-garden",
    name: "Ooty Government Botanical Garden & Lake",
    destination: "Ooty, Tamil Nadu",
    category: "Gardens & Lakes",
    summary: "55-acre terraced botanical garden featuring a 20-million-year-old fossilized tree trunk and boating.",
    description: "Established in 1848, the Government Botanical Garden in Ooty spans 55 acres of lush terraced lawns, rare orchid species, Italian garden beds, and a 20-million-year-old fossilized tree trunk. Nearby Ooty Lake offers relaxing pedal boating amidst tall eucalyptus trees.",
    duration: "2–3 Hours",
    bestTime: "April to June & September to November",
    image: "/himachal.jpg",
    location: "Vanguard Road, Ooty, Tamil Nadu",
    highlights: [
      "55-Acre Terraced Botanical Heritage Lawn",
      "20-Million-Year-Old Fossil Tree Trunk",
      "Rare Exotic Flower & Orchid House",
      "Ooty Lake Boat House & Pedal Boating"
    ],
    packages: [
      {
        title: "Ooty & Coonoor Hill Station Escape (4D/3N)",
        link: "/packages",
        duration: "4 Days / 3 Nights",
        price: 14500,
        badge: "South India Special"
      }
    ]
  },

  // --- MANALI ---
  {
    slug: "solang-valley-manali",
    name: "Solang Valley Adventure & Snow Sports",
    destination: "Manali, Himachal Pradesh",
    category: "Adventure & Snow",
    summary: "Premier adventure valley for paragliding, zorbing, cable car rides, and winter snow skiing.",
    description: "Solang Valley (14km from Manali) is Northern India's capital for adventure sports. Situated at 8,400 ft, it offers high-flying paragliding over pine valleys, giant zorbing balls, quad biking, and winter ski slopes with ropeway rides.",
    duration: "Full Day Excursion",
    bestTime: "December to April (Snow) / May to Nov (Paragliding)",
    image: "/himachal.jpg",
    location: "Solang Valley, Manali, Himachal Pradesh",
    highlights: [
      "Tandem Paragliding Over Himalayan Pines",
      "Winter Snow Skiing & Snowmobile Rides",
      "Solang Ropeway Cable Car Ride",
      "Giant Zorbing & ATV Quad Biking"
    ],
    packages: [
      {
        title: "Himachal Hill Stations & Manali Magic (6D/5N)",
        link: "/packages/himachal-hill-stations",
        duration: "6 Days / 5 Nights",
        price: 16500,
        badge: "Youth & Family Choice"
      }
    ]
  },
  {
    slug: "atal-tunnel-sissu",
    name: "Atal Tunnel Drive & Sissu Waterfalls",
    destination: "Manali, Himachal Pradesh",
    category: "Scenic Drives & Mountains",
    summary: "Drive through the world's longest highway tunnel above 10,000 ft into the dramatic Lahaul Valley.",
    description: "The 9.02km Atal Tunnel under the Rohtang Pass is an engineering marvel. Emerging from the green Solang Valley into the dry, majestic landscape of Sissu in Lahaul Valley is an incredible contrast. Enjoy the roaring Sissu Waterfall and wooden suspension bridge.",
    duration: "4–5 Hours",
    bestTime: "Year-Round (Weather Permitting)",
    image: "/himachal.jpg",
    location: "Atal Tunnel, Manali - Lahaul Highway",
    highlights: [
      "World's Longest Highway Tunnel Above 10,000 ft (9.02km)",
      "Instant Transition from Manali Greenery to Lahaul Snow/Desert",
      "Sissu Waterfall & Suspension Bridge Excursion",
      "High Altitude Lahaul Riverbank Photography"
    ],
    packages: [
      {
        title: "Himachal Hill Stations & Manali Magic (6D/5N)",
        link: "/packages/himachal-hill-stations",
        duration: "6 Days / 5 Nights",
        price: 16500,
        badge: "Youth & Family Choice"
      }
    ]
  },

  // --- RAJASTHAN ---
  {
    slug: "udaipur-city-palace",
    name: "Udaipur City Palace & Lake Pichola Cruise",
    destination: "Udaipur, Rajasthan",
    category: "Heritage & Palaces",
    summary: "Magnificent Rajasthan palace complex overlooking Lake Pichola with sunset boat rides to Jagmandir.",
    description: "Udaipur City Palace is a sprawling complex built over 400 years on the eastern bank of Lake Pichola. Featuring intricate mirror work (Sheesh Mahal), marble balconies, and peacock courtyards, a visit is completed by a romantic sunset boat cruise past Lake Palace (Taj Lake Palace) and Jagmandir Island.",
    duration: "Half Day",
    bestTime: "October to March",
    image: "/rajasthan.jpg",
    location: "Old City, Udaipur, Rajasthan",
    highlights: [
      "Largest Palace Complex in Rajasthan",
      "Sheesh Mahal Mirror Work & Mor Chowk Peacock Courtyard",
      "Sunset Boat Cruise on Lake Pichola",
      "Jagmandir Island Palace Exploration"
    ],
    packages: [
      {
        title: "Rajasthan Royal Heritage Tour (7D/6N)",
        link: "/packages/rajasthan-royal",
        duration: "7 Days / 6 Nights",
        price: 24500,
        badge: "Heritage Special"
      }
    ]
  },
  {
    slug: "jaisalmer-sam-sand-dunes",
    name: "Sam Sand Dunes Camel Safari & Campfire",
    destination: "Jaisalmer, Rajasthan",
    category: "Desert & Camping",
    summary: "Golden Thar Desert sand dunes, sunset camel rides, quad biking, and Kalbelia folk dance campfire nights.",
    description: "Located 45km from the Golden City of Jaisalmer, Sam Sand Dunes is Rajasthan's premier desert campsite. Ride camels across sweeping golden sand dunes during sunset, attempt thrilling quad biking, and enjoy an evening under starry skies with Rajasthani Kalbelia dancers and traditional Dal Baati Churma dinner.",
    duration: "Evening & Overnight Stay",
    bestTime: "October to March",
    image: "/rajasthan.jpg",
    location: "Sam Sand Dunes, Thar Desert, Jaisalmer",
    highlights: [
      "Sunset Camel Safari Across Thar Sand Dunes",
      "Dune Bashing Jeeps & Quad Bike Rides",
      "Overnight Luxury Swiss Tent Camping",
      "Kalbelia Folk Dance & Fire Show Campfire"
    ],
    packages: [
      {
        title: "Rajasthan Royal Heritage Tour (7D/6N)",
        link: "/packages/rajasthan-royal",
        duration: "7 Days / 6 Nights",
        price: 24500,
        badge: "Heritage Special"
      }
    ]
  },

  // --- GOA ---
  {
    slug: "baga-calangute-water-sports",
    name: "Baga & Calangute Beach Water Sports",
    destination: "North Goa, India",
    category: "Beaches & Water Sports",
    summary: "Vibrant golden beaches offering parasailing, banana rides, jet skiing, and beach shacks.",
    description: "Baga and Calangute are Goa's iconic North beaches. Famous for high-adrenaline water sports like parasailing with dip, jet skiing, speedboats, and banana rides, as well as lively beach shacks serving fresh seafood and chilled coconut water.",
    duration: "Half Day",
    bestTime: "October to May",
    image: "/goa.jpg",
    location: "Baga - Calangute Beach Stretch, North Goa",
    highlights: [
      "High-Altitude Parasailing with Sea Dip",
      "Jet Skiing & Speedboat Water Rides",
      "Lively Beach Shacks & Seafood Dining",
      "Sunset Beach Strolls & Souvenir Bazaars"
    ],
    packages: [
      {
        title: "Goa Beach Holiday & Water Sports Package (4D/3N)",
        link: "/packages/goa-beach-holiday",
        duration: "4 Days / 3 Nights",
        price: 12999,
        badge: "Beach Vacation"
      }
    ]
  },
  {
    slug: "dudhsagar-waterfalls-safari",
    name: "Dudhsagar Waterfalls Jeep Safari & Spice Plantation",
    destination: "South Goa, India",
    category: "Waterfalls & Wildlife",
    summary: "Four-tiered milky waterfall inside Bhagwan Mahavir Sanctuary accessible via 4x4 jungle jeep safari.",
    description: "Standing at 310 meters, Dudhsagar ('Sea of Milk') is one of India's tallest waterfalls. Located inside the Bhagwan Mahavir Wildlife Sanctuary, reaching the natural pool requires an exhilarating 4x4 jungle jeep safari across forest rivers, followed by a swim in the cool cascade pool and a traditional spice plantation buffet lunch.",
    duration: "Full Day Excursion",
    bestTime: "October to May",
    image: "/goa.jpg",
    location: "Sonaulim, Mollem National Park, Goa",
    highlights: [
      "310m Four-Tiered Milky Cascade Waterfall",
      "Exhilarating 4x4 Open Jeep Forest River Crossing",
      "Swim in Natural Freshwater Waterfall Pool",
      "Tropical Spice Plantation Tour & Traditional Buffet Lunch"
    ],
    packages: [
      {
        title: "Goa Beach Holiday & Water Sports Package (4D/3N)",
        link: "/packages/goa-beach-holiday",
        duration: "4 Days / 3 Nights",
        price: 12999,
        badge: "Beach Vacation"
      }
    ]
  },

  // --- EUROPE ---
  {
    slug: "paris-eiffel-tower-seine-cruise",
    name: "Eiffel Tower Summit & Seine River Cruise",
    destination: "Paris, France",
    category: "Landmarks & Romantic",
    summary: "Iconic iron lady summit view overlooking Paris, followed by a romantic glass-canopy boat cruise on the River Seine.",
    description: "No trip to Europe is complete without visiting the Eiffel Tower in Paris. Ascend to the summit for a 360-degree view of the City of Lights, then embark on a glass-topped Bateaux Parisians cruise along the Seine River, passing Notre-Dame Cathedral, the Louvre Museum, and historic stone bridges.",
    duration: "Half Day / Evening",
    bestTime: "Year-Round (Sunset / Illumination at 9 PM)",
    image: "/europe.jpg",
    location: "Champ de Mars, Paris, France",
    highlights: [
      "Eiffel Tower 2nd Floor & Summit Access",
      "360-Degree Panoramic View of Paris",
      "Glass-Canopy River Seine Sightseeing Cruise",
      "Illuminated Night View of Paris Monuments"
    ],
    packages: [
      {
        title: "Grand Europe 10D/9N Highlights Tour",
        link: "/packages/europe-grand-tour",
        duration: "10 Days / 9 Nights",
        price: 185000,
        badge: "Flagship Europe Tour"
      }
    ]
  },
  {
    slug: "swiss-mount-titlis-glacier",
    name: "Mt. Titlis Cable Car & Glacier Cliff Walk",
    destination: "Engelberg, Switzerland",
    category: "Alps & Snow",
    summary: "World's first revolving cable car (Titlis Rotair), Ice Flyer chairlift, and Europe's highest suspension bridge.",
    description: "Mount Titlis (3,238m above sea level) in Engelberg is Switzerland's top alpine glacier experience. Ride the Titlis Rotair — the world's first 360-degree revolving cable car — to the snow peak. Walk across the Titlis Cliff Walk (Europe's highest suspension bridge at 3,041m) and explore the 5,000-year-old Glacier Cave.",
    duration: "Full Day Excursion",
    bestTime: "Year-Round (Snow Guaranteed)",
    image: "/switzerland.jpg",
    location: "Engelberg, Obwalden, Switzerland",
    highlights: [
      "World's 1st Revolving Cable Car (Titlis Rotair)",
      "Europe's Highest Suspension Bridge (Titlis Cliff Walk)",
      "Glacier Cave 20-Meter Ice Tunnel",
      "Ice Flyer Chairlift Over Alpine Crevasses"
    ],
    packages: [
      {
        title: "Grand Europe 10D/9N Highlights Tour",
        link: "/packages/europe-grand-tour",
        duration: "10 Days / 9 Nights",
        price: 185000,
        badge: "Flagship Europe Tour"
      }
    ]
  }
];

export function getAllSightseeings(): SightseeingSpot[] {
  return SIGHTSEEING_SPOTS;
}

export function getSightseeingBySlug(slug: string): SightseeingSpot | undefined {
  return SIGHTSEEING_SPOTS.find((s) => s.slug.toLowerCase() === slug.toLowerCase());
}

export function getSightseeingsByCategory(category: string): SightseeingSpot[] {
  if (category === "all") return SIGHTSEEING_SPOTS;
  return SIGHTSEEING_SPOTS.filter((s) => s.category.toLowerCase().includes(category.toLowerCase()));
}
