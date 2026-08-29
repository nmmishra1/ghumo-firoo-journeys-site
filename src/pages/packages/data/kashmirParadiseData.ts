import { PackageVariant } from '@/components/packages/PackageVariantSelector';

export const kashmirVariants: PackageVariant[] = [
  {
    id: 'classic',
    label: '5N/6D Classic',
    nights: 5,
    days: 6,
    tag: 'Best Value',
    pricePerPerson: 26500,
    hotelCategory: '3 Star Comfort',
    groupSize: '2-15 People',
    inclusions: [
      '5 nights accommodation in 3-star hotels',
      '1 night houseboat on Dal Lake',
      'Daily breakfast and dinner',
      'Airport/railway station transfers',
      'Shikara ride on Dal Lake',
      'Gulmarg Gondola Phase 1',
      'All sightseeing by private cab',
      'Toll, parking & driver allowance',
      'Travel insurance'
    ],
    exclusions: [
      'Airfare to/from Srinagar',
      'Gondola Phase 2 (₹900 extra)',
      'Personal expenses and tips',
      'Adventure activities',
      'Lunch (guide can recommend local spots)'
    ],
    hotels: [
      { name: 'Hotel Grand Umar', location: 'Srinagar', stars: 3, highlight: 'Central location near Dal Lake' },
      { name: 'Hill View Houseboat', location: 'Dal Lake', stars: 3, highlight: 'Traditional cedar wood houseboat' },
      { name: 'Pine Spring Hotel', location: 'Pahalgam', stars: 3, highlight: 'Lidder River facing rooms' }
    ],
    excursions: [
      { name: 'Dal Lake Shikara Ride', description: 'Guided Shikara through floating gardens', duration: '1.5 hrs', included: true },
      { name: 'Mughal Gardens', description: 'Shalimar, Nishat & Chashme Shahi gardens', duration: 'Half day', included: true },
      { name: 'Gulmarg Gondola Phase 1', description: 'Cable car to Kongdori station', duration: '2 hrs', included: true },
      { name: 'Betaab Valley', description: 'Scenic Bollywood location near Pahalgam', duration: '3 hrs', included: true },
      { name: 'Sonamarg Day Trip', description: 'Glacier meadow & Thajiwas point by pony', duration: 'Full day', price: '₹800 extra', included: false },
      { name: 'Gondola Phase 2', description: 'Summit ride to Apharwat Peak 13,500ft', duration: '2 hrs', price: '₹900 extra', included: false }
    ],
    itinerary: [
      { day: 1, title: 'Arrival Srinagar & Houseboat Check-in', description: 'Pickup from Srinagar airport, check-in to traditional wooden houseboat on Dal Lake. Evening relaxed 1.5 hr Shikara ride.', activities: ['Airport Transfer', 'Houseboat Check-in', '1.5 hr Shikara Ride'] },
      { day: 2, title: 'Srinagar to Gulmarg Excursion', description: 'Drive through pine forests to Gulmarg. Take Gulmarg Gondola cable car ride to Kongdori Station Phase 1.', activities: ['Gondola Cable Car Ride', 'Pine Forest Walk', 'Golf Course Visit'] },
      { day: 3, title: 'Srinagar Mughal Gardens & Local Market', description: 'Full day tour of Shalimar Bagh, Nishat Bagh, Chashme Shahi, and Lal Chowk bazaar.', activities: ['Mughal Gardens Tour', 'Handicraft Market Shopping'] },
      { day: 4, title: 'Srinagar to Pahalgam Valley', description: 'Scenic drive along Lidder River with stops at saffron fields in Pampore.', activities: ['Saffron Fields Stop', 'Betaab Valley', 'Lidder River Walk'] },
      { day: 5, title: 'Pahalgam Aru Valley & Chandanwari', description: 'Excursion to Aru Valley and Chandanwari base camp.', activities: ['Aru Valley Photography', 'Chandanwari Snow Point'] },
      { day: 6, title: 'Departure from Srinagar', description: 'Breakfast and private transfer to Srinagar airport.', activities: ['Airport Transfer'] }
    ]
  },
  {
    id: 'premium',
    label: '7N/8D Premium',
    nights: 7,
    days: 8,
    tag: 'Most Popular',
    pricePerPerson: 42500,
    hotelCategory: '4 Star Luxury',
    groupSize: '2-12 People',
    inclusions: [
      '7 nights accommodation in 4-star hotels',
      '2 nights deluxe houseboat on Dal Lake',
      'Daily breakfast and dinner',
      'All airport/station transfers',
      'Private Shikara with flower-decorated boat',
      'Gulmarg Gondola Phase 1 & 2',
      'Betaab + Aru Valley excursion',
      'Sonamarg day trip included',
      'Pahalgam Chandanwari visit',
      'All sightseeing in premium cab'
    ],
    exclusions: [
      'Airfare to/from Srinagar',
      'Personal expenses and tips',
      'Horse/pony rides at Sonamarg',
      'Lunch'
    ],
    hotels: [
      { name: 'Vivanta by Taj Dal View', location: 'Srinagar', stars: 4, highlight: 'Panoramic Dal Lake views, luxury rooms' },
      { name: 'Luxury Houseboat Gulshan', location: 'Dal Lake', stars: 4, highlight: 'Premium 4-star houseboat with butler' },
      { name: 'Heevan Resort', location: 'Pahalgam', stars: 4, highlight: 'Forest-facing superior rooms' }
    ],
    excursions: [
      { name: 'Private Shikara Sunrise', description: 'Decorated private Shikara at dawn', duration: '2 hrs', included: true },
      { name: 'Mughal Gardens Full Tour', description: 'All 4 gardens with guide', duration: 'Half day', included: true },
      { name: 'Gondola Phase 1 & 2', description: 'Full Apharwat Peak cable car experience', duration: '3 hrs', included: true }
    ],
    itinerary: []
  }
];

export const kashmirFallbackData = {
  name: 'Kashmir Paradise Tour',
  slug: 'kashmir-paradise',
  duration: '5-7 Nights',
  price: 26500,
  rating: 4.9,
  reviews: 320,
  image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80',
  images: [
    'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80',
    'https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80'
  ],
  destinations: ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg'],
  highlights: [
    '1 Night Houseboat Stay on Dal Lake',
    'Shikara Ride at Sunset',
    'Gulmarg Gondola Ride Phase 1 & 2',
    'Betaab Valley & Lidder River Pahalgam'
  ],
  inclusions: [
    'Hotel & Houseboat Accommodation',
    'Daily Breakfast & Dinner',
    'Private Cab for all transfers',
    'Shikara Ride on Dal Lake'
  ],
  exclusions: [
    'Airfare to/from Srinagar',
    'Personal expenses & tips'
  ],
  variants: kashmirVariants
};
