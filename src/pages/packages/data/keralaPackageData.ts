import { PackageVariant } from '@/components/packages/PackageVariantSelector';

export const keralaVariants: PackageVariant[] = [
  {
    id: 'kerala-3d2n',
    label: '3D/2N Munnar Hills',
    nights: 2,
    days: 3,
    tag: 'Quick Escape',
    pricePerPerson: 12500,
    hotelCategory: '4 Star Tea Resort',
    groupSize: '2-15 People',
    inclusions: [
      '2 Nights Accommodation in 4-Star Munnar Tea Country Resort',
      'Daily Buffet Breakfast & Dinner',
      'Private AC Chauffeured Cab for All 3 Days (Cochin Pickup & Drop)',
      'Eravikulam National Park Safari & Tata Tea Museum Tour',
      'Cheeyappara & Valara Waterfalls Highway Sightseeing',
      'All Tolls, Parking & Driver Night Allowance'
    ],
    exclusions: [
      'Flight / Train fares to Cochin',
      'Personal laundry & tips',
      'Eravikulam Entry Ticket (Forest Dept counter/online)'
    ],
    hotels: [
      { name: 'Tea County Resort / Amber Dale Munnar', location: 'Munnar', stars: 4, highlight: 'Panoramic tea valley views & fireplace' }
    ],
    excursions: [
      { name: 'Eravikulam National Park Safari', description: 'Nilgiri Tahr mountain goat spotting & Anamudi views', duration: '3.5 hrs', included: true },
      { name: 'KDHP Tata Tea Museum', description: 'Tea factory machinery & artisanal tea tasting', duration: '2 hrs', included: true },
      { name: 'Mattupetty Dam & Echo Point', description: 'Speedboating & misty hill acoustic echo echo point', duration: '2.5 hrs', included: true }
    ],
    itinerary: [
      { day: 1, title: 'Cochin Pickup → Scenic Western Ghats Drive → Munnar Check-in', description: 'Private pickup from Cochin Airport (COK) / Aluva Railway Station. Scenic 130 km mountain drive past cascading Cheeyappara and Valara waterfalls. Check-in to Munnar luxury tea resort.', activities: ['Cochin Airport Pickup', 'Cheeyappara Waterfalls Stop', 'Valara Falls View', 'Munnar Resort Check-in'] },
      { day: 2, title: 'Eravikulam Nilgiri Tahr Safari & Tata Tea Museum', description: 'Morning eco-bus safari in Eravikulam National Park (Rajamalai) spotting endangered Nilgiri Tahr. Visit Tata Tea Museum, Mattupetty Dam, and Echo Point.', activities: ['Eravikulam National Park Safari', 'Tata Tea Museum', 'Mattupetty Dam', 'Echo Point Stroll'] },
      { day: 3, title: 'Munnar Tea Gardens Stroll → Cochin Airport Drop-off', description: 'Morning walk through emerald green tea plantations. Depart Munnar for return transfer to Cochin Airport / Railway Station.', activities: ['Tea Plantation Walk', 'Spice Procurement', 'Cochin Airport Drop-off'] }
    ]
  },
  {
    id: 'kerala-4d3n',
    label: '4D/3N Munnar & Alleppey',
    nights: 3,
    days: 4,
    tag: 'Best Value',
    pricePerPerson: 16800,
    hotelCategory: '4 Star Resort + Private Houseboat',
    groupSize: '2-15 People',
    inclusions: [
      '2 Nights 4-Star Munnar Tea Resort + 1 Night Private AC Houseboat in Alleppey',
      'All Houseboat Meals (Traditional Lunch, Evening Tea/Snacks, Karimeen Dinner & Breakfast)',
      'Daily Breakfast & Dinner at Munnar Resort',
      'Private AC Chauffeured Cab for All 4 Days (Cochin to Cochin)',
      'Eravikulam National Park & Tea Museum Tour',
      'Private Vembanad Lake Backwater Cruise'
    ],
    exclusions: [
      'Airfare to Cochin',
      'Personal expenses & monument entry fees'
    ],
    hotels: [
      { name: 'Tea County Resort / Blankel Luxury Resort', location: 'Munnar', stars: 4, highlight: 'Tea estate hill resort' },
      { name: 'Private Luxury AC Houseboat', location: 'Alleppey Backwaters', stars: 4, highlight: 'Personal onboard chef & butler service' }
    ],
    excursions: [
      { name: 'Alleppey Private Houseboat Cruise', description: 'Cruise palm-fringed backwaters & Vembanad lake', duration: 'Full Day & Overnight', included: true },
      { name: 'Eravikulam National Park', description: 'Nilgiri Tahr safari on Rajamalai hills', duration: '3.5 hrs', included: true },
      { name: 'Munnar Tea Country Tour', description: 'Mattupetty Dam, Echo Point & Tea Museum', duration: 'Half Day', included: true }
    ],
    itinerary: [
      { day: 1, title: 'Cochin Pickup → Drive to Munnar Tea Country', description: 'Chauffeured pickup from Cochin Airport. Scenic drive through Western Ghats with stops at Cheeyappara and Valara waterfalls. Check-in to Munnar resort.', activities: ['Airport Pickup', 'Waterfall Photo Stops', 'Resort Check-in'] },
      { day: 2, title: 'Eravikulam Safari & Munnar Sightseeing', description: 'Visit Eravikulam National Park to spot Nilgiri Tahr. Tour KDHP Tea Museum, Mattupetty Dam, and Echo Point.', activities: ['Nilgiri Tahr Safari', 'Tea Museum', 'Mattupetty Dam', 'Echo Point'] },
      { day: 3, title: 'Munnar to Alleppey → Private AC Houseboat Cruise', description: 'Drive to Alleppey jetty (160 km). Board your private AC luxury houseboat at 12:00 PM. Cruise Vembanad Lake, savor authentic Kerala lunch and Karimeen fish dinner.', activities: ['Houseboat Boarding', 'Backwater Canal Cruise', 'Sunset over Vembanad', 'Candlelight Houseboat Dinner'] },
      { day: 4, title: 'Alleppey Houseboat Breakfast → Cochin Airport Transfer', description: 'Morning cruise while having traditional Kerala breakfast onboard. Disembark at 9:00 AM and chauffeured transfer to Cochin Airport.', activities: ['Houseboat Breakfast', 'Disembarkation', 'Cochin Airport Drop-off'] }
    ]
  },
  {
    id: 'kerala-5d4n-classic',
    label: '5D/4N Hills, Wildlife & Houseboat',
    nights: 4,
    days: 5,
    tag: 'Best Seller',
    pricePerPerson: 21500,
    hotelCategory: '4 Star Luxury & Houseboat',
    groupSize: '2-15 People',
    inclusions: [
      '2 Nights Munnar + 1 Night Thekkady + 1 Night Private Alleppey Houseboat',
      'Periyar Wildlife Lake Boat Safari Tickets',
      'Guided Cardamom & Spice Plantation Walk in Thekkady',
      'All Meals Onboard Alleppey Houseboat + Daily Breakfast & Dinner at Resorts',
      'Dedicated AC Chauffeured Vehicle for All 5 Days',
      'All Inter-district Permits, Tolls & Parking'
    ],
    exclusions: [
      'Flight tickets to/from Cochin',
      'Kathakali & Kalaripayattu evening show entry (optional)'
    ],
    hotels: [
      { name: 'Tea County Munnar / Blanket Resort', location: 'Munnar', stars: 4, highlight: 'Valley view tea garden suites' },
      { name: 'Elephant Court / Spice Village', location: 'Thekkady', stars: 4, highlight: 'Spice plantation resort near Periyar' },
      { name: 'Lakes & Lagoons Private AC Houseboat', location: 'Alleppey', stars: 4, highlight: 'Full board meals & private deck' }
    ],
    excursions: [
      { name: 'Periyar Lake Boat Safari', description: 'Spot wild elephants, bison and otters from boat', duration: '2 hrs', included: true },
      { name: 'Aromatic Spice Plantation Walk', description: 'Cardamom, pepper, cinnamon & vanilla guided tour', duration: '1.5 hrs', included: true },
      { name: 'Alleppey Houseboat Cruise', description: 'Private backwater sailing with live chef cooking', duration: 'Overnight', included: true }
    ],
    itinerary: [
      { day: 1, title: 'Cochin Arrival → Fort Kochi Nets → Munnar Drive', description: 'Chauffeured pickup from Cochin. Brief photo stop at Fort Kochi Chinese Fishing Nets, then ascend to Munnar hills past waterfalls.', activities: ['Fort Kochi Chinese Nets', 'Cheeyappara Waterfalls', 'Munnar Check-in'] },
      { day: 2, title: 'Munnar Tea Country & Eravikulam Safari', description: 'Ascend Rajamalai in Eravikulam National Park. Visit KDHP Tea Museum, Mattupetty Dam, and Kundala Lake.', activities: ['Eravikulam Safari', 'Tea Museum', 'Mattupetty Dam', 'Kundala Lake'] },
      { day: 3, title: 'Munnar to Thekkady → Spice Garden & Periyar Safari', description: 'Scenic mountain drive to Thekkady (Kumily). Guided spice plantation walk followed by boat safari on Periyar Lake inside Periyar Tiger Sanctuary.', activities: ['Cardamom Hills Drive', 'Spice Plantation Walk', 'Periyar Boat Safari'] },
      { day: 4, title: 'Thekkady to Alleppey → Private Luxury Houseboat', description: 'Descend to Alleppey backwaters. Board private luxury houseboat at noon. Enjoy traditional Kerala Sadya lunch and sail through palm-canopied canals.', activities: ['Houseboat Boarding', 'Canal Cruising', 'Fresh Karimeen Fish Dinner'] },
      { day: 5, title: 'Alleppey Disembarkation → Cochin Airport Drop-off', description: 'Morning sunrise cruise, breakfast onboard, and transfer to Cochin Airport / Railway Station for departure.', activities: ['Sunrise Backwater Cruise', 'Cochin Airport Drop-off'] }
    ]
  },
  {
    id: 'kerala-5d4n-varkala',
    label: '5D/4N Varkala Cliff & Backwaters',
    nights: 4,
    days: 5,
    tag: 'Cliff & Beach Special',
    pricePerPerson: 22500,
    hotelCategory: '4 Star Beach & Houseboat',
    groupSize: '2-15 People',
    inclusions: [
      '2 Nights Varkala Cliff Beach Resort + 1 Night Jatayu/Kollam + 1 Night Alleppey Houseboat',
      'Jatayu Earth Center Cable Car & Entry Pass Included',
      'Varkala Cliff Sunset & Papanasam Beach Excursion',
      'Alleppey Private AC Houseboat with All Meals',
      'Dedicated AC Chauffeured Cab for All 5 Days',
      'Trivandrum / Cochin Multi-City Route Support'
    ],
    exclusions: ['Airfare', 'Personal water sports'],
    hotels: [
      { name: 'Gateway Varkala / Elixir Cliff Resort', location: 'Varkala', stars: 4, highlight: 'Arabian Sea cliff views' },
      { name: 'The Raviz Ashtamudi', location: 'Kollam', stars: 5, highlight: 'Historic lakeside palace' },
      { name: 'Private Luxury AC Houseboat', location: 'Alleppey', stars: 4, highlight: 'Private backwater cruise' }
    ],
    excursions: [
      { name: 'Jatayu Earth Center Cable Car', description: "World's largest bird sculpture atop 1,000ft hill", duration: '3 hrs', included: true },
      { name: 'Varkala Papanasam Cliff Walk', description: 'Bohemian cliff cafes & holy mineral spring beach', duration: 'Half Day', included: true }
    ],
    itinerary: [
      { day: 1, title: 'Trivandrum Pickup → Varkala Cliff Check-in', description: 'Pickup from Trivandrum Airport (TRV). Drive to Varkala and check-in to cliffside beach resort. Sunset at Papanasam beach.', activities: ['Trivandrum Pickup', 'Varkala Cliff Check-in', 'Sunset Dinner at Cliff Cafe'] },
      { day: 2, title: 'Varkala Beach & Jatayu Earth Center', description: 'Morning swim at Papanasam beach. Excursion to Jatayu Earth Center (Chadayamangalam) for Swiss cable car ride to the giant sculpture.', activities: ['Papanasam Beach Swim', 'Jatayu Cable Car Ride', 'Jatayu Sculpture Museum'] },
      { day: 3, title: 'Varkala to Kollam Munroe Island Backwaters', description: 'Drive along the coast to Kollam / Munroe Island. Explore tranquil canoe backwater waterways and historic Ashtamudi Lake.', activities: ['Munroe Island Canoe Tour', 'Ashtamudi Lake Walk'] },
      { day: 4, title: 'Kollam to Alleppey → Private Houseboat Cruise', description: 'Transfer to Alleppey. Board private luxury houseboat for backwater sailing, freshly cooked authentic meals, and sunset.', activities: ['Houseboat Boarding', 'Vembanad Backwater Cruise', 'Karimeen Dinner'] },
      { day: 5, title: 'Alleppey Disembarkation → Cochin / Trivandrum Drop', description: 'Morning breakfast on houseboat. Chauffeured transfer to Cochin (COK) or Trivandrum (TRV) airport.', activities: ['Houseboat Breakfast', 'Airport Drop-off'] }
    ]
  },
  {
    id: 'kerala-6d5n',
    label: '6D/5N Grand Hills, Backwaters & Kovalam',
    nights: 5,
    days: 6,
    tag: 'Flagship Circuit',
    pricePerPerson: 26500,
    hotelCategory: '4 Star Deluxe & Houseboat',
    groupSize: '2-15 People',
    inclusions: [
      '2N Munnar + 1N Thekkady + 1N Alleppey Houseboat + 1N Kovalam Beach Resort',
      'All 4 Iconic Kerala Terrains: Tea Hills, Rainforest Wildlife, Backwaters & Arabian Sea Beach',
      'Periyar Lake Wildlife Safari & Spice Plantation Walk',
      'Full Board Meals on Alleppey Houseboat (Chef Onboard)',
      'Dedicated AC Chauffeured Vehicle for Entire 6-Day Circuit (Cochin to Trivandrum)',
      'Trivandrum Padmanabhaswamy Temple & Kovalam Lighthouse Beach Tour'
    ],
    exclusions: ['Flight fares to Cochin / from Trivandrum', 'Temple special Darshan tickets'],
    hotels: [
      { name: 'Blanket Hotel & Spa / Tea County', location: 'Munnar', stars: 4, highlight: 'Attukal waterfall & tea valley views' },
      { name: 'Elephant Court Resort', location: 'Thekkady', stars: 4, highlight: 'Rainforest resort with Ayurvedic spa' },
      { name: 'Private Luxury AC Houseboat', location: 'Alleppey', stars: 4, highlight: 'Private chef, upper deck lounge' },
      { name: 'Uday Samudra Leisure Beach Hotel', location: 'Kovalam', stars: 4, highlight: 'Direct beach access near Lighthouse' }
    ],
    excursions: [
      { name: 'Eravikulam National Park Safari', description: 'Nilgiri Tahr mountain safari', duration: '3 hrs', included: true },
      { name: 'Periyar Boat Wildlife Cruise', description: 'Spotting elephant herds from boat', duration: '2 hrs', included: true },
      { name: 'Alleppey Backwater Sailing', description: 'Private cruise on Vembanad lake', duration: 'Overnight', included: true },
      { name: 'Kovalam Lighthouse & Vizhinjam', description: '35m striped lighthouse & beach promenade', duration: '3 hrs', included: true }
    ],
    itinerary: [
      { day: 1, title: 'Cochin Pickup → Fort Kochi Heritage → Munnar Drive', description: 'Pickup at Cochin Airport. Visit Chinese Fishing Nets & drive to Munnar passing Cheeyappara waterfalls.', activities: ['Cochin Airport Pickup', 'Fort Kochi Nets', 'Cheeyappara Waterfalls', 'Munnar Check-in'] },
      { day: 2, title: 'Munnar Tea Estates & Eravikulam Safari', description: 'Full day sightseeing in Munnar covering Eravikulam National Park (Nilgiri Tahr), KDHP Tea Museum, Mattupetty Dam, and Echo Point.', activities: ['Eravikulam Safari', 'Tata Tea Museum', 'Mattupetty Dam', 'Echo Point'] },
      { day: 3, title: 'Munnar to Thekkady → Spice Garden & Periyar Safari', description: 'Drive to Thekkady. Take guided aromatic spice plantation tour and evening boat safari on Periyar Lake inside tiger sanctuary.', activities: ['Thekkady Drive', 'Spice Garden Walk', 'Periyar Boat Safari'] },
      { day: 4, title: 'Thekkady to Alleppey → Private Luxury Houseboat', description: 'Transfer to Alleppey jetty. Board private AC houseboat at noon. Sail through serene backwaters and enjoy authentic Kerala dinner.', activities: ['Houseboat Boarding', 'Vembanad Sailing', 'Karimeen Fish Dinner'] },
      { day: 5, title: 'Alleppey to Kovalam → Lighthouse Beach Sunset', description: 'Disembark after breakfast. Drive to Kovalam (160 km). Check-in to beach resort. Climb Vizhinjam Lighthouse and relax at Lighthouse Beach.', activities: ['Kovalam Drive', 'Resort Check-in', 'Vizhinjam Lighthouse', 'Beach Sunset'] },
      { day: 6, title: 'Padmanabhaswamy Temple → Trivandrum Airport Drop-off', description: 'Morning visit to the magnificent Sree Padmanabhaswamy Temple in Trivandrum. Transfer to Trivandrum Airport (TRV) for departure.', activities: ['Padmanabhaswamy Temple', 'Trivandrum City Tour', 'TRV Airport Drop-off'] }
    ]
  },
  {
    id: 'kerala-7d6n',
    label: '7D/6N Grand Kerala & Kanyakumari',
    nights: 6,
    days: 7,
    tag: 'Grand Coast Tour',
    pricePerPerson: 31500,
    hotelCategory: '4 Star Luxury & Houseboat',
    groupSize: '2-15 People',
    inclusions: [
      '2N Munnar + 1N Thekkady + 1N Alleppey Houseboat + 1N Kovalam + 1N Kanyakumari',
      'All Highlights of Kerala plus Lands End Kanyakumari Cape',
      'Vivekananda Rock Memorial & Thiruvalluvar Statue Ferry Tour',
      'Sunrise & Sunset View over the Tri-Sea (Arabian Sea, Bay of Bengal & Indian Ocean)',
      'Dedicated AC Chauffeured Cab for All 7 Days (Cochin to Trivandrum/Kanyakumari)',
      'All Houseboat Meals & Daily Breakfast & Dinners'
    ],
    exclusions: ['Airfare', 'Ferry ticket at Kanyakumari (VIP fast track available on-site)'],
    hotels: [
      { name: 'Tea County Munnar', location: 'Munnar', stars: 4, highlight: 'Tea estate hill resort' },
      { name: 'Elephant Court', location: 'Thekkady', stars: 4, highlight: 'Spice country resort' },
      { name: 'Private AC Houseboat', location: 'Alleppey', stars: 4, highlight: 'Private backwater cruise' },
      { name: 'Uday Samudra Beach Resort', location: 'Kovalam', stars: 4, highlight: 'Lighthouse beach resort' },
      { name: 'Annai Resorts / Sparsa', location: 'Kanyakumari', stars: 4, highlight: 'Direct ocean sunrise views' }
    ],
    excursions: [
      { name: 'Vivekananda Rock Memorial Ferry', description: 'Ferry to sacred rock monument & 133ft statue', duration: '3 hrs', included: true },
      { name: 'Tri-Sea Sunset & Sunrise', description: 'Confluence of Arabian Sea, Indian Ocean & Bay of Bengal', duration: '2 hrs', included: true },
      { name: 'Periyar Lake Boat Safari', description: 'Wildlife boat cruise', duration: '2 hrs', included: true }
    ],
    itinerary: [
      { day: 1, title: 'Cochin Pickup → Munnar Tea Country', description: 'Pickup from Cochin. Scenic drive past Cheeyappara waterfalls to Munnar.', activities: ['Cochin Pickup', 'Waterfalls', 'Munnar Check-in'] },
      { day: 2, title: 'Munnar Full Day Nature & Safari', description: 'Eravikulam National Park, Tata Tea Museum, Mattupetty Dam, and Echo Point.', activities: ['Eravikulam Safari', 'Tea Museum', 'Echo Point'] },
      { day: 3, title: 'Munnar to Thekkady → Spice Tour & Periyar Safari', description: 'Drive to Thekkady. Spice garden walk & Periyar Lake boat ride.', activities: ['Spice Walk', 'Periyar Boat Safari'] },
      { day: 4, title: 'Thekkady to Alleppey → Private Houseboat Sailing', description: 'Transfer to Alleppey. Board private AC luxury houseboat with personal chef.', activities: ['Houseboat Boarding', 'Backwater Sailing', 'Chef Dinner'] },
      { day: 5, title: 'Alleppey to Kovalam Beach Resort', description: 'Drive to Kovalam. Visit Vizhinjam lighthouse and relax at the beach promenade.', activities: ['Kovalam Drive', 'Lighthouse Beach', 'Seafood Dinner'] },
      { day: 6, title: 'Kovalam to Kanyakumari → Vivekananda Rock & Sunset', description: 'Drive to Kanyakumari. Ferry to Vivekananda Rock Memorial and Thiruvalluvar Statue. Watch spectacular Tri-Sea sunset.', activities: ['Vivekananda Rock Ferry', 'Thiruvalluvar Statue', 'Tri-Sea Sunset'] },
      { day: 7, title: 'Kanyakumari Sunrise → Trivandrum Airport Departure', description: 'Early morning sunrise over the ocean. Visit Suchindram Thanumalayan Temple and transfer to Trivandrum Airport (TRV).', activities: ['Sunrise View', 'Suchindram Temple', 'Trivandrum Airport Drop-off'] }
    ]
  },
  {
    id: 'kerala-8d7n',
    label: '8D/7N Heritage, Backwaters & Cape',
    nights: 7,
    days: 8,
    tag: 'Complete Odyssey',
    pricePerPerson: 36500,
    hotelCategory: '4-5 Star Heritage & Houseboat',
    groupSize: '2-15 People',
    inclusions: [
      '1N Fort Kochi + 2N Munnar + 1N Thekkady + 1N Alleppey Houseboat + 1N Kovalam + 1N Kanyakumari',
      'Comprehensive 8-Day Kerala Master Circuit covering all historical, hill, wildlife, backwater and beach landmarks',
      'Fort Kochi Heritage Walk, Mattancherry Dutch Palace & Jew Town Synagogue',
      'All Houseboat Meals + Daily Breakfast & Dinners at Luxury Resorts',
      'Dedicated AC Chauffeured Innova/SUV for 8 Full Days'
    ],
    exclusions: ['Airfare', 'Personal tips'],
    hotels: [
      { name: 'Brunton Boatyard / Old Harbour', location: 'Fort Kochi', stars: 5, highlight: 'Colonial heritage on harbor' },
      { name: 'Tea County Munnar', location: 'Munnar', stars: 4, highlight: 'Tea estate resort' },
      { name: 'Spice Village Thekkady', location: 'Thekkady', stars: 5, highlight: 'Tribal eco-luxury cottages' },
      { name: 'Luxury AC Houseboat', location: 'Alleppey', stars: 4, highlight: 'Private backwater cruise' },
      { name: 'The Leela Kovalam / Uday Samudra', location: 'Kovalam', stars: 5, highlight: 'Cliff-top ocean views' },
      { name: 'Annai Resorts', location: 'Kanyakumari', stars: 4, highlight: 'Ocean-facing rooms' }
    ],
    excursions: [
      { name: 'Fort Kochi Heritage Walk', description: 'Chinese fishing nets, Jew Town & Dutch Palace', duration: 'Half Day', included: true },
      { name: 'Jatayu Earth Center Cable Car', description: 'Gigantic rock sculpture on hilltop', duration: '3 hrs', included: true },
      { name: 'Vivekananda Rock Ferry', description: 'Monument on island rock in Kanyakumari', duration: '3 hrs', included: true }
    ],
    itinerary: [
      { day: 1, title: 'Cochin Arrival → Fort Kochi Colonial Heritage Tour', description: 'Pickup from Cochin Airport. Check-in to heritage hotel in Fort Kochi. Tour Chinese Fishing Nets, St. Francis Church, Dutch Palace, and Jew Town Synagogue.', activities: ['Fort Kochi Heritage Walk', 'Dutch Palace', 'Jew Town Antiques'] },
      { day: 2, title: 'Fort Kochi to Munnar Tea Country', description: 'Drive past Valara and Cheeyappara waterfalls to Munnar. Evening tea garden stroll.', activities: ['Western Ghats Drive', 'Waterfalls', 'Munnar Resort Stay'] },
      { day: 3, title: 'Munnar Eravikulam Safari & Tea Factory', description: 'Eravikulam National Park, Tata Tea Museum, Mattupetty Dam, and Kundala Lake.', activities: ['Nilgiri Tahr Safari', 'Tea Factory Tour', 'Echo Point'] },
      { day: 4, title: 'Munnar to Thekkady → Spice Walk & Periyar Safari', description: 'Drive to Thekkady. Guided spice garden walk and Periyar boat safari. Evening Kathakali dance show.', activities: ['Spice Walk', 'Periyar Boat Safari', 'Kathakali Show'] },
      { day: 5, title: 'Thekkady to Alleppey → Private AC Houseboat', description: 'Descend to Alleppey backwaters. Board private AC luxury houseboat. Full day and night backwater cruising.', activities: ['Houseboat Boarding', 'Vembanad Sailing', 'Kerala Sadya Lunch & Dinner'] },
      { day: 6, title: 'Alleppey to Kovalam via Jatayu Earth Center', description: 'Disembark houseboat. Visit Jatayu Earth Center (cable car to world’s largest bird sculpture). Drive to Kovalam beach resort.', activities: ['Jatayu Cable Car', 'Kovalam Check-in', 'Lighthouse Beach Sunset'] },
      { day: 7, title: 'Kovalam to Kanyakumari → Vivekananda Rock & Sunset', description: 'Excursion to Kanyakumari. Ferry to Vivekananda Rock & Thiruvalluvar Statue. Sunset over the Tri-Sea confluence.', activities: ['Vivekananda Rock Ferry', 'Tri-Sea Sunset', 'Suchindram Temple'] },
      { day: 8, title: 'Kanyakumari Sunrise → Trivandrum Airport Drop-off', description: 'Watch sunrise over the ocean. Visit Padmanabhaswamy Temple in Trivandrum and transfer to TRV Airport.', activities: ['Ocean Sunrise', 'Padmanabhaswamy Temple', 'Trivandrum Airport Drop-off'] }
    ]
  },
  {
    id: 'kerala-10d9n',
    label: '10D/9N South India Temple & Coast Circuit',
    nights: 9,
    days: 10,
    tag: 'Grand Pilgrimage & Coast',
    pricePerPerson: 45000,
    hotelCategory: '4-5 Star Hotels & Houseboat',
    groupSize: '2-15 People',
    inclusions: [
      '1N Cochin + 2N Munnar + 1N Thekkady + 1N Madurai + 1N Rameshwaram + 1N Kanyakumari + 1N Kovalam + 1N Alleppey Houseboat',
      'The Ultimate South India Circuit bridging Kerala Backwaters and Tamil Nadu Sacred Temple Cities',
      'Madurai Meenakshi Amman Temple VIP Darshan & Rameshwaram Ramanathaswamy 22 Holy Theerthams Bath',
      'Dhanushkodi Ghost Town & Ram Setu Border Excursion',
      'Dedicated AC Chauffeured Cab for All 10 Days',
      'All Houseboat Meals & Daily Breakfast & Dinners'
    ],
    exclusions: ['Airfare', 'Temple special Puja passes'],
    hotels: [
      { name: 'Brunton Boatyard / Old Harbour', location: 'Cochin', stars: 4, highlight: 'Harbor view' },
      { name: 'Tea County', location: 'Munnar', stars: 4, highlight: 'Tea estate hill resort' },
      { name: 'Elephant Court', location: 'Thekkady', stars: 4, highlight: 'Spice plantation resort' },
      { name: 'Heritage Madurai', location: 'Madurai', stars: 5, highlight: 'Historic courtyard resort' },
      { name: 'Daiwik Hotel', location: 'Rameshwaram', stars: 4, highlight: 'Pilgrim luxury hotel near Temple' },
      { name: 'Annai Resorts', location: 'Kanyakumari', stars: 4, highlight: 'Ocean view hotel' },
      { name: 'Uday Samudra', location: 'Kovalam', stars: 4, highlight: 'Lighthouse beach resort' },
      { name: 'Private Luxury AC Houseboat', location: 'Alleppey', stars: 4, highlight: 'Full board cruise' }
    ],
    excursions: [
      { name: 'Madurai Meenakshi Temple', description: 'Iconic 14-gopuram Dravidian masterpiece', duration: '3 hrs', included: true },
      { name: 'Rameshwaram 22 Theertham Kunds', description: 'Sacred bath in 22 temple holy water wells', duration: '3 hrs', included: true },
      { name: 'Dhanushkodi & Ram Setu Point', description: 'Lands end road to Sri Lanka border', duration: '3 hrs', included: true },
      { name: 'Alleppey Backwater Houseboat', description: 'Private luxury backwater cruise', duration: 'Overnight', included: true }
    ],
    itinerary: [
      { day: 1, title: 'Cochin Arrival & Fort Kochi Heritage', description: 'Pickup from Cochin Airport. Tour Chinese fishing nets, Mattancherry Palace, and Jew Town.', activities: ['Cochin Pickup', 'Fort Kochi Nets', 'Heritage Hotel Stay'] },
      { day: 2, title: 'Cochin to Munnar Tea Country', description: 'Drive past Cheeyappara waterfalls to Munnar. Evening tea garden walk.', activities: ['Waterfalls', 'Munnar Tea Hills'] },
      { day: 3, title: 'Munnar Eravikulam Safari & Tea Gardens', description: 'Safari in Eravikulam National Park, Tata Tea Museum, Mattupetty Dam, and Echo Point.', activities: ['Nilgiri Tahr Safari', 'Tea Museum', 'Mattupetty Dam'] },
      { day: 4, title: 'Munnar to Thekkady Spice Country', description: 'Scenic drive to Thekkady. Spice plantation tour & Periyar Lake boat safari.', activities: ['Spice Walk', 'Periyar Boat Safari'] },
      { day: 5, title: 'Thekkady to Madurai → Meenakshi Amman Temple', description: 'Descend Western Ghats into Tamil Nadu. Arrive Madurai and visit majestic Meenakshi Amman Temple with its 1,000-pillar hall.', activities: ['Madurai Drive', 'Meenakshi Amman Temple VIP Darshan', 'Thirumalai Nayakar Palace'] },
      { day: 6, title: 'Madurai to Rameshwaram → Pamban Bridge & Temple Dip', description: 'Drive across iconic Pamban Sea Bridge to Rameshwaram island. Sacred bath in 22 Theerthams and Ramanathaswamy Jyotirlinga Darshan.', activities: ['Pamban Bridge View', '22 Theerthams Holy Bath', 'Ramanathaswamy Temple Darshan'] },
      { day: 7, title: 'Dhanushkodi Ram Setu → Drive to Kanyakumari', description: 'Morning excursion to Dhanushkodi ghost town and Ram Setu point. Afternoon drive to Kanyakumari for Tri-Sea sunset.', activities: ['Dhanushkodi Ram Setu', 'Drive to Kanyakumari', 'Sunset at Cape'] },
      { day: 8, title: 'Kanyakumari Sunrise → Kovalam Beach Resort', description: 'Sunrise over the ocean. Vivekananda Rock Memorial ferry. Drive to Kovalam Lighthouse Beach.', activities: ['Ocean Sunrise', 'Vivekananda Rock', 'Kovalam Beach Stay'] },
      { day: 9, title: 'Kovalam to Alleppey → Private Luxury Houseboat', description: 'Drive to Alleppey. Board private luxury AC houseboat. Cruise Vembanad Lake canals with personal chef.', activities: ['Houseboat Boarding', 'Backwater Sailing', 'Karimeen Dinner'] },
      { day: 10, title: 'Alleppey Houseboat → Cochin Airport Departure', description: 'Morning breakfast cruise. Disembark at 9:00 AM and chauffeured transfer to Cochin Airport (COK) for return flight.', activities: ['Houseboat Breakfast', 'Cochin Airport Drop-off'] }
    ]
  }
];

export const keralaAttractionsData = [
  {
    name: 'Alleppey Backwaters & Private Houseboat',
    description: 'World-famous palm-fringed backwater canals, Vembanad Lake & private AC houseboats with personal chef.',
    image: '/kerala/alleppey_backwaters_houseboat.jpg',
    location: 'Alleppey (Alappuzha)',
    destinationTag: 'Alleppey Backwaters'
  },
  {
    name: 'Munnar Rolling Tea Estates & KDHP Museum',
    description: 'Endless emerald green tea hills, misty valleys, crisp mountain air & colonial tea manufacturing museum.',
    image: '/kerala/munnar_tea_estates.jpg',
    location: 'Munnar (5,200 ft)',
    destinationTag: 'Munnar Tea Country'
  },
  {
    name: 'Eravikulam National Park (Nilgiri Tahr)',
    description: 'High-altitude shola grassland habitat protecting the endangered Nilgiri Tahr mountain goat and Anamudi peak.',
    image: '/kerala/eravikulam_nilgiri_tahr.jpg',
    location: 'Munnar (7,000 ft)',
    destinationTag: 'Western Ghats Wildlife'
  },
  {
    name: 'Thekkady Periyar Tiger & Wildlife Sanctuary',
    description: 'Dense rainforest tiger reserve offering scenic boat safaris on Periyar Lake to spot wild elephant herds.',
    image: '/kerala/thekkady_periyar_sanctuary.jpg',
    location: 'Thekkady / Kumily',
    destinationTag: 'Thekkady Wildlife'
  },
  {
    name: 'Fort Kochi & Chinese Fishing Nets',
    description: '14th-century coastal heritage town blending Portuguese, Dutch, British & Chinese cantilevered nets.',
    image: '/kerala/fort_kochi_chinese_nets.jpg',
    location: 'Cochin / Kochi',
    destinationTag: 'Heritage Fort Kochi'
  },
  {
    name: 'Kovalam Lighthouse Cliff Beach',
    description: 'Iconic crescent beach with 35m red-and-white lighthouse, gentle turquoise waves, and cliffside dining.',
    image: '/kerala/kovalam_lighthouse_beach.jpg',
    location: 'Kovalam (Trivandrum)',
    destinationTag: 'Coastal Beaches'
  },
  {
    name: 'Jatayu Earth Center & Swiss Cable Car',
    description: "World's largest bird sculpture (200 ft) atop a 1,000 ft rocky hill with state-of-the-art ropeway cable car.",
    image: '/kerala/jatayu_earth_center.jpg',
    location: 'Chadayamangalam / Kollam',
    destinationTag: 'Monuments & Adventure'
  },
  {
    name: 'Vagamon Pine Forests & Cantilever Glass Bridge',
    description: 'Offbeat misty hill station at 3,600 ft featuring tall pine woods, tea meadows, and glass skywalk.',
    image: '/kerala/vagamon_pine_forest.jpg',
    location: 'Vagamon / Idukki',
    destinationTag: 'Hill Station & Skywalk'
  }
];

export const keralaFallbackPackage = {
  name: 'Grand Kerala Hills, Backwaters & Kovalam Beach',
  slug: 'kerala-6d5n-hills-backwaters-kovalam',
  duration: '6 Days / 5 Nights',
  price: 26500,
  rating: 4.98,
  reviews: 450,
  image: '/kerala/alleppey_backwaters_houseboat.jpg',
  images: [
    '/kerala/alleppey_backwaters_houseboat.jpg',
    '/kerala/munnar_tea_estates.jpg',
    '/kerala/eravikulam_nilgiri_tahr.jpg',
    '/kerala/thekkady_periyar_sanctuary.jpg',
    '/kerala/kovalam_lighthouse_beach.jpg',
    '/kerala/fort_kochi_chinese_nets.jpg',
    '/kerala/jatayu_earth_center.jpg'
  ],
  destinations: ['Cochin', 'Munnar', 'Thekkady', 'Alleppey', 'Kovalam', 'Trivandrum'],
  highlights: [
    '100% Private AC Luxury Houseboat Stay in Alleppey with Personal Chef',
    'Munnar Misty Tea Gardens & Eravikulam Nilgiri Tahr Safari',
    'Thekkady Periyar Wildlife Sanctuary Boat Cruise & Spice Plantation Walk',
    'Kovalam Lighthouse Beach & Sree Padmanabhaswamy Temple',
    'Fort Kochi Heritage & 14th-Century Chinese Fishing Nets',
    'Chauffeured Private AC Vehicle for All 6 Days with Zero Hidden Charges'
  ],
  inclusions: [
    '5 Nights Deluxe Accommodation (1 Night Houseboat + 4 Nights 4-Star Resorts)',
    'All Meals Onboard Alleppey Houseboat (Kerala Lunch, High Tea, Karimeen Dinner & Breakfast)',
    'Daily Buffet Breakfast & Dinner at All Hill & Beach Resorts',
    'Dedicated Private AC Chauffeured Cab for All Transfers & Sightseeing',
    'Periyar Wildlife Sanctuary Boat Safari Tickets',
    'Driver Allowances, Fuel, Tolls, State Taxes & Parking'
  ],
  exclusions: [
    'Flight / Train fares to Cochin / from Trivandrum',
    'Personal expenses, laundry, alcoholic beverages & tips',
    'Temple special VIP Darshan passes',
    'GST as applicable'
  ],
  hotels: [
    { name: 'Blanket Hotel & Spa / Tea County', location: 'Munnar', stars: 4, room_type: 'Valley View Luxury Suite', meal_plan: 'Breakfast & Dinner' },
    { name: 'Elephant Court Resort', location: 'Thekkady', stars: 4, room_type: 'Executive Pool/Garden Suite', meal_plan: 'Breakfast & Dinner' },
    { name: 'Private Luxury AC Houseboat', location: 'Alleppey Backwaters', stars: 4, room_type: 'Private Master Bedroom AC Cabin', meal_plan: 'All Meals Onboard' },
    { name: 'Uday Samudra Leisure Beach Resort', location: 'Kovalam', stars: 4, room_type: 'Deluxe Ocean View Room', meal_plan: 'Breakfast & Dinner' }
  ],
  attractions: keralaAttractionsData,
  variants: keralaVariants
};
