import { PackageVariant } from '@/components/packages/PackageVariantSelector';

export const rannUtsavVariants: PackageVariant[] = [
  {
    id: '1n2d',
    label: '1N/2D Special Express',
    nights: 1,
    days: 2,
    tag: 'Express Escape',
    pricePerPerson: 9999,
    hotelCategory: 'Deluxe AC Tent / Resort',
    groupSize: '2-50 People',
    inclusions: [
      '1 Night Accommodation in Deluxe AC Tent / Resort at Kutch / Dhordo',
      'Meals: Dinner (Day 1) & Breakfast (Day 2)',
      '3:00 PM transfer to Rann Utsav & White Rann',
      '1 Hour exploration of Rann Utsav Craft Stalls & souvenir shopping',
      'Great White Rann entry & sunset viewing with salt-desert sport activities',
      'Optional Camel Cart / Camel Ride experience (on direct payment)',
      'Evening Bonfire with traditional Kutchi Folk Musical Performance',
      'Special Full Moon Night Visit to White Rann at 09:00 PM (on full moon dates)',
      '06:30 AM Early Morning Sunrise excursion to White Rann',
      'Bhuj Local Sightseeing: Swaminarayan Temple, Aina Mahal, Prag Mahal, Kutch Museum & Bhujodi Craft Village'
    ],
    exclusions: [
      'Train / Flight tickets to/from Bhuj',
      'Camel cart & ATV / Paramotoring rides (payable on site)',
      'Personal expenses, laundry, and tips',
      'GST & Govt Taxes'
    ],
    hotels: [
      { name: 'Evoke Tent City Dhordo / Premium Kutch Resort', location: 'Dhordo / Bhuj, Kutch', stars: 4, highlight: 'White Rann proximity with authentic Kutchi hospitality' }
    ],
    excursions: [
      { name: 'White Rann Sunset & Craft Market', description: 'Visit White Rann, craft bazaars, and sunset over salt flats', duration: '4 hrs', included: true },
      { name: 'Full Moon Night Desert Walk', description: '09:00 PM moonlight excursion to White Rann (Full Moon Dates)', duration: '2 hrs', included: true },
      { name: 'Bhuj Heritage & Craft Tour', description: 'Swaminarayan Temple, Aina Mahal, Prag Mahal & Bhujodi Craft Village', duration: '4 hrs', included: true }
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival, Rann Utsav Craft Stalls & White Desert Sunset',
        description: 'Start your journey at 3:00 PM for the spectacular beauty of RANN UTSAV. Enjoy 1 hour exploring handloom craft stalls, Kutchi embroidery, and clicking pictures. Later, step onto THE GREAT WHITE RANN, experiencing the vast salt-covered desert shining like the moon surface. Enjoy sunset over the white desert, optional camel cart rides, and evening campfire with traditional Kutchi folk music & dinner. (Full Moon Guests: At 09:00 PM, embark on a special moonlight excursion to the White Desert).',
        activities: ['3:00 PM Departure to Rann Utsav', 'Handloom & Craft Stalls Visit', 'White Desert Sunset Viewing', 'Camel Cart Ride Option', 'Kutchi Folk Music & Dinner', '09:00 PM Full Moon Excursion (Select Dates)']
      },
      {
        day: 2,
        title: 'White Rann Sunrise, Bhuj Heritage & Return Departure',
        description: 'At 06:30 AM, experience the magical Sunrise over the White Rann. Return to the resort for breakfast. At 09:00 AM, check out and head to Bhuj for comprehensive heritage sightseeing covering Swaminarayan Temple, Aina Mahal (Mirror Palace), Prag Mahal (Gothic Palace), Kutch Museum, and Bhujodi Craft Village before dropping at Bhuj station/airport for your return journey.',
        activities: ['06:30 AM Sunrise at White Rann', 'Buffet Breakfast', 'Swaminarayan Temple Visit', 'Aina Mahal & Prag Mahal Tour', 'Bhujodi Handicraft Shopping', 'Bhuj Station / Airport Drop']
      }
    ]
  },
  {
    id: '2n3d',
    label: '2N/3D Special Classic',
    nights: 2,
    days: 3,
    tag: 'Most Popular',
    pricePerPerson: 14500,
    hotelCategory: 'Premium AC Tent / Resort',
    groupSize: '2-50 People',
    inclusions: [
      '2 Nights Accommodation in Premium AC Tent / Resort',
      'Meals: Daily Breakfast & Dinner (Day 1 Dinner, Day 2 Breakfast & Dinner, Day 3 Breakfast)',
      'White Rann Sunset & Rann Utsav Craft Fair access',
      'Evening Kutchi Folk Musical Performance & Campfire',
      '06:30 AM Sunrise Visit to White Rann',
      'Excursion to Road to Heaven (stunning sea & salt desert road view)',
      'Dholavira Archaeological Site (UNESCO Indus Valley Civilization ruins)',
      'Kalo Dungar (Black Hill - Kutch highest peak, Dattatreya Temple & Magnetic Hill)',
      'Bhuj Heritage Tour: Swaminarayan Temple, Aina Mahal, Prag Mahal, Kutch Museum, Vande Mataram Memorial & Bhujodi Village'
    ],
    exclusions: [
      'Train or Airfare to Bhuj',
      'ATV rides, Paramotoring, and Camel safari tickets',
      'Personal expenses & shopping'
    ],
    hotels: [
      { name: 'Evoke Tent City / Premium Kutch Resort', location: 'Dhordo / Bhuj, Kutch', stars: 4, highlight: 'Luxury tent & resort stay with full sightseeing transfers' }
    ],
    excursions: [
      { name: 'Road to Heaven Drive', description: 'World-famous scenic drive with blue sea on one side & white desert on the other', duration: '2 hrs', included: true },
      { name: 'Dholavira Indus Valley Site', description: '5,000-year-old Harappan civilization archaeological ruins', duration: '3 hrs', included: true },
      { name: 'Kalo Dungar & Dattatreya Temple', description: 'Highest mountain peak in Kutch with panoramic view & magnetic hill experience', duration: '2.5 hrs', included: true }
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival, Rann Utsav & White Desert Sunset',
        description: '3:00 PM journey to Rann Utsav. Explore handicraft stalls, proceed onto the Great White Desert for a breathtaking sunset, optional camel cart rides, followed by an evening Kutchi folk dance show and traditional dinner.',
        activities: ['Check-in & Welcome', 'Rann Utsav Bazaar', 'White Desert Sunset', 'Kutchi Cultural Performance', 'Full Moon Excursion Option']
      },
      {
        day: 2,
        title: 'Sunrise, Road to Heaven, Dholavira & Kalo Dungar',
        description: '06:30 AM Sunrise visit to White Rann. Breakfast at resort. 09:00 AM drive through the iconic Road To Heaven (subject to operation) featuring stunning turquoise sea waters on one side and gleaming white salt flats on the other. Explore the ancient Indus Valley Civilization ruins at Dholavira, then visit Kalo Dungar (Black Hill) — Kutch’s highest peak — for panoramic views, Lord Dattatreya Temple, and the natural Magnetic Hill phenomenon.',
        activities: ['06:30 AM White Rann Sunrise', 'Road to Heaven Scenic Drive', 'Dholavira Harappan Ruins Tour', 'Kalo Dungar Peak Viewpoint', 'Dattatreya Temple & Magnetic Hill', 'Dinner & Rest']
      },
      {
        day: 3,
        title: 'Bhuj Heritage Sightseeing & Return Drop',
        description: '09:00 AM check-out. Proceed to Bhuj for extensive city sightseeing: Swaminarayan Temple, Aina Mahal, Prag Mahal, Kutch Museum, Vande Mataram Memorial, and Bhujodi Craft Village. Drop at Bhuj railway station/airport.',
        activities: ['Check-out', 'Swaminarayan Temple', 'Aina Mahal & Prag Mahal', 'Kutch Museum', 'Bhujodi Shopping', 'Return Drop']
      }
    ]
  },
  {
    id: '3n4d',
    label: '3N/4D Special Grand & Beach',
    nights: 3,
    days: 4,
    tag: 'Grand Experience',
    pricePerPerson: 19500,
    hotelCategory: 'Luxury Resort & City Hotel',
    groupSize: '2-50 People',
    inclusions: [
      '3 Nights Accommodation (2 Nights Kutch Resort / Tent + 1 Night Bhuj City Hotel)',
      'Meals: 3 Breakfasts & 3 Dinners included',
      'White Rann Sunset & Rann Utsav Craft Fair',
      '06:30 AM White Rann Sunrise Excursion',
      'Road to Heaven scenic drive & Dholavira Archaeological Harappan Site',
      'Kalo Dungar (Black Hill) & Dattatreya Temple',
      'Smrutivan Earthquake Memorial & Interactive Simulation Museum (2001 Kutch Earthquake)',
      'Mandvi Beach & Royal Vijay Vilas Palace Tour',
      'Bhuj Heritage Tour: Swaminarayan Temple, Aina Mahal, Prag Mahal, Kutch Museum, Vande Mataram Memorial & Bhujodi Craft Village'
    ],
    exclusions: [
      'Travel to/from Bhuj',
      'Museum entry tickets & camera fees',
      'Water sports at Mandvi Beach'
    ],
    hotels: [
      { name: 'Kutch Resort (Dhordo) + Royal Hotel (Bhuj)', location: 'Dhordo & Bhuj, Kutch', stars: 4, highlight: 'Best combination of White Desert, Coastal Beach & City Heritage' }
    ],
    excursions: [
      { name: 'Smrutivan Earthquake Museum', description: 'State-of-the-art interactive memorial & earthquake simulation experience', duration: '2.5 hrs', included: true },
      { name: 'Mandvi Beach & Vijay Vilas Palace', description: 'Royal palace beachfront, filming location & golden sand Mandvi Beach', duration: '4 hrs', included: true }
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival, Rann Utsav & White Desert Sunset',
        description: '3:00 PM departure for Rann Utsav. Explore handicraft stalls, walk onto the Great White Desert for sunset, enjoy camel cart rides, evening campfire, Kutchi folk musical program, and traditional Gujarati/Kutchi dinner.',
        activities: ['Arrival & Check-in', 'Rann Utsav Crafts Market', 'White Desert Sunset', 'Folk Music Show', 'Moonlight Desert Excursion Option']
      },
      {
        day: 2,
        title: 'Sunrise, Road to Heaven, Dholavira & Kalo Dungar',
        description: '06:30 AM White Rann Sunrise. Breakfast. 09:00 AM scenic drive across Road to Heaven, exploring Dholavira UNESCO World Heritage Harappan site, followed by Kalo Dungar (Black Hill) panoramic viewpoint & Dattatreya Temple.',
        activities: ['White Rann Sunrise', 'Road to Heaven Scenic Drive', 'Dholavira Ruins', 'Kalo Dungar Viewpoint', 'Return to Resort']
      },
      {
        day: 3,
        title: 'Smrutivan Earthquake Museum, Mandvi Beach & Vijay Vilas Palace',
        description: '09:00 AM check-out from Kutch resort. Proceed to Bhuj to visit the famous Smrutivan Earthquake Museum — experiencing the 2001 Kutch earthquake simulator. Head to Mandvi to explore the majestic Vijay Vilas Palace (renowned for Rajput & Kutchi royal architecture) and relax at sunset at Mandvi Beach. Overnight stay in Bhuj.',
        activities: ['Smrutivan Museum & Earthquake Simulator', 'Vijay Vilas Palace Tour', 'Mandvi Beach Sunset', 'Bhuj Hotel Check-in & Dinner']
      },
      {
        day: 4,
        title: 'Bhuj Heritage & Craft Tour & Departure',
        description: '09:00 AM departure for Bhuj sightseeing: Swaminarayan Temple, Aina Mahal (Mirror Palace), Prag Mahal (Gothic Bell Tower), Kutch Museum, Vande Mataram Memorial, Hira Laxmi Park, and Bhujodi Craft Village. Drop at Bhuj station/airport.',
        activities: ['Swaminarayan Temple', 'Aina Mahal & Prag Mahal', 'Kutch Museum', 'Vande Mataram Memorial', 'Bhujodi Shopping', 'Return Drop']
      }
    ]
  },
  {
    id: '4n5d',
    label: '4N/5D Special Royal Pilgrimage & Heritage',
    nights: 4,
    days: 5,
    tag: 'Ultimate Complete Circuit',
    pricePerPerson: 24500,
    hotelCategory: 'Luxury Resort & Heritage Hotel',
    groupSize: '2-50 People',
    inclusions: [
      '4 Nights Accommodation (2 Nights Kutch Tent/Resort + 2 Nights Bhuj Luxury Hotel)',
      'Meals: 4 Breakfasts & 4 Dinners included',
      'White Rann Sunset & Rann Utsav Craft Fair',
      '06:30 AM Sunrise Visit to White Rann',
      'Road to Heaven scenic drive & Dholavira Archaeological Site',
      'Kalo Dungar Black Hill & Dattatreya Temple',
      'Holy Circuit: Mata na Madh (Ashapura Mata Temple), Narayan Sarovar (Sacred Lake) & Koteshwar Shiva Temple',
      'Historic Border Fort: Lakhpat Fort & Ancient Walled City',
      'Smrutivan Earthquake Memorial & Interactive Simulation Museum',
      'Mandvi Beach & Vijay Vilas Palace',
      'Bhuj Heritage Tour: Swaminarayan Temple, Aina Mahal, Prag Mahal, Kutch Museum, Vande Mataram Memorial & Bhujodi Craft Village'
    ],
    exclusions: [
      'Travel to/from Bhuj',
      'Personal shopping & water sports',
      'Gratuities & camera fees'
    ],
    hotels: [
      { name: 'Kutch Luxury Tent + Bhuj Heritage Hotel', location: 'Dhordo & Bhuj, Kutch', stars: 4, highlight: 'Complete 360-degree coverage of Kutch history, nature, pilgrimage & beaches' }
    ],
    excursions: [
      { name: 'Holy Circuit (Mata na Madh & Narayan Sarovar)', description: 'Ashapura Mata Temple, Sacred Sarovar & Koteshwar Shiva Temple on Arabian Sea', duration: '4 hrs', included: true },
      { name: 'Lakhpat Fort & Border Excursion', description: 'Historic 18th-century fort, Gurudwara Sahib & Indo-Pak border view', duration: '3 hrs', included: true }
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival, Rann Utsav & White Desert Sunset',
        description: '3:00 PM departure for Rann Utsav. Explore craft bazaars, walk onto the Great White Desert for sunset, camel cart rides, evening campfire, Kutchi folk musical program, and traditional dinner.',
        activities: ['Arrival & Check-in', 'Rann Utsav Craft Stalls', 'Great White Rann Sunset', 'Folk Music Show', 'Moonlight Excursion Option']
      },
      {
        day: 2,
        title: 'Sunrise, Road to Heaven, Dholavira & Kalo Dungar',
        description: '06:30 AM White Rann Sunrise. Breakfast. 09:00 AM drive across Road to Heaven, exploring Dholavira Harappan archaeological ruins, followed by Kalo Dungar (Black Hill) peak & Dattatreya Temple.',
        activities: ['White Rann Sunrise', 'Road to Heaven Scenic Drive', 'Dholavira UNESCO Site', 'Kalo Dungar Viewpoint', 'Resort Dinner']
      },
      {
        day: 3,
        title: 'Mata na Madh, Narayan Sarovar, Koteshwar & Lakhpat Fort',
        description: '09:00 AM check-out. Embark on a pilgrimage & border fort exploration: Visit Mata na Madh (Ashapura Mata Temple), sacred Narayan Sarovar lake, Koteshwar Temple (ancient Shiva temple on the Arabian Sea coast), and Lakhpat Fort (historic 18th-century walled city & Gurudwara Sahib). Transfer to Bhuj for hotel check-in.',
        activities: ['Mata na Madh Temple', 'Narayan Sarovar Sacred Lake', 'Koteshwar Shiva Temple', 'Lakhpat Fort Exploration', 'Bhuj Check-in & Dinner']
      },
      {
        day: 4,
        title: 'Smrutivan Earthquake Museum, Mandvi Beach & Vijay Vilas Palace',
        description: '09:00 AM visit Smrutivan Earthquake Museum in Bhuj to experience the 2001 Kutch earthquake simulator. Drive to Mandvi to explore Vijay Vilas Palace and relax at Mandvi Beach during sunset. Return to Bhuj for overnight stay.',
        activities: ['Smrutivan Museum & Earthquake Simulator', 'Vijay Vilas Palace Tour', 'Mandvi Beach Sunset', 'Bhuj Overnight Stay']
      },
      {
        day: 5,
        title: 'Bhuj Heritage & Craft Tour & Departure',
        description: '09:00 AM comprehensive Bhuj sightseeing: Swaminarayan Temple, Aina Mahal, Prag Mahal, Kutch Museum, Vande Mataram Memorial, Hira Laxmi Park, and Bhujodi Craft Village. Drop at Bhuj railway station/airport for your return journey.',
        activities: ['Swaminarayan Temple', 'Aina Mahal & Prag Mahal', 'Kutch Museum', 'Vande Mataram Memorial', 'Bhujodi Craft Village Shopping', 'Return Drop']
      }
    ]
  }
];

export const rannUtsavFallbackData = {
  name: 'Special Kutch & Rann Utsav Package Collection',
  slug: 'rann-utsav',
  duration: '1 to 4 Nights (2D to 5D)',
  price: 9999,
  rating: 4.9,
  reviews: 482,
  image: '/rann-utsav.jpg',
  images: ['/rann-utsav.jpg', '/Rann-Utsav-Gujarat.png', '/Mandvi Beach_Kutch.png', '/Dhordo Village Gate.png', '/kutchsunriseimage.jpg'],
  destinations: ['Dhordo Tent City', 'White Rann', 'Road to Heaven', 'Dholavira', 'Kalo Dungar', 'Mandvi Beach', 'Lakhpat Fort', 'Bhuj'],
  highlights: [
    'Stay at Luxury Tent City Dhordo / Premium Kutch Resorts',
    'Sunset & Sunrise at Great White Salt Desert',
    'Road to Heaven Scenic Drive & Dholavira Harappan Site',
    'Kalo Dungar Black Hill, Dattatreya Temple & Magnetic Hill',
    'Smrutivan 2001 Kutch Earthquake Interactive Simulator Museum',
    'Mandvi Beach & Royal Vijay Vilas Palace',
    'Holy Pilgrimage: Mata na Madh, Narayan Sarovar & Koteshwar Temple',
    'Bhuj Heritage Tour: Swaminarayan Temple, Aina Mahal, Prag Mahal & Bhujodi Craft Village'
  ],
  inclusions: [
    'Deluxe AC Tent / Resort / Hotel Accommodation',
    'Meals as per package plan (Daily Breakfast & Dinner / All Meals)',
    'Chauffeured AC Vehicle / Bus transfers from Bhuj',
    'White Desert Golf Cart & Rann Utsav Craft Fair Access',
    'Kutchi Folk Music Cultural Night & Campfire'
  ],
  exclusions: [
    'Train / Airfare to/from Bhuj',
    'ATV rides, Paramotoring & Camel Cart tickets',
    'Personal shopping & entrance ticket fees'
  ],
  variants: rannUtsavVariants
};
