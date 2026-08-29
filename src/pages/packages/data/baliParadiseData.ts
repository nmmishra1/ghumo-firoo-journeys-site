import { PackageVariant } from '@/components/packages/PackageVariantSelector';

export const baliVariants: PackageVariant[] = [
  {
    id: 'classic',
    label: '5N/6D Bali Escape',
    nights: 5, days: 6,
    tag: 'Best Value',
    pricePerPerson: 55999,
    hotelCategory: '3 Star Comfort',
    groupSize: '2-15 People',
    inclusions: [
      '5 nights accommodation (Ubud 2N + Seminyak 3N)',
      'Daily breakfast',
      'Sacred Monkey Forest entry',
      'Tegallalang Rice Terraces visit',
      'Tanah Lot sea temple sunset tour',
      'Airport & inter-city private transfers',
      'Travel insurance'
    ],
    exclusions: [
      'International flights',
      'Visa on Arrival (VoA ~USD 35)',
      'Lunch & dinner',
      'Water sports & personal expenses'
    ],
    hotels: [
      { name: 'Komaneka Bisma', location: 'Ubud', stars: 3, highlight: 'Jungle valley views' },
      { name: 'Katamama Boutique Hotel', location: 'Seminyak', stars: 3, highlight: 'Walking distance to Seminyak Beach' }
    ],
    excursions: [
      { name: 'Sacred Monkey Forest', description: 'Explore ancient temple ruins with macaques', duration: '2 hrs', included: true },
      { name: 'Tegallalang Rice Fields', description: 'Iconic stepped rice terraces', duration: '2 hrs', included: true },
      { name: 'Tanah Lot Sunset', description: 'Sea temple on rocky outcrop at sunset', duration: '3 hrs', included: true }
    ],
    itinerary: [
      { day: 1, title: 'Arrival Bali & Ubud Check-in', description: 'Pickup at Ngurah Rai International Airport Denpasar, private transfer to Ubud resort.', activities: ['Airport Pickup', 'Ubud Resort Check-in', 'Welcome Drink'] },
      { day: 2, title: 'Ubud Art & Nature Tour', description: 'Visit Sacred Monkey Forest, Tegallalang Rice Terraces, and Ubud Art Market.', activities: ['Monkey Forest', 'Rice Terraces Walk', 'Ubud Palace'] },
      { day: 3, title: 'Ubud to Seminyak & Tanah Lot Sunset', description: 'Transfer to Seminyak. Evening visit to Tanah Lot temple for sunset.', activities: ['Transfer to Seminyak', 'Tanah Lot Temple', 'Sunset View'] },
      { day: 4, title: 'Nusa Penida Island Day Tour', description: 'Speedboat to Nusa Penida island, visit Kelingking T-Rex Beach & Angel Billabong.', activities: ['Speedboat Ride', 'Kelingking Beach', 'Broken Beach'] },
      { day: 5, title: 'Water Sports & Uluwatu Sunset', description: 'Banana boat & jet ski at Tanjung Benoa, evening Kecak Fire Dance at Uluwatu Temple.', activities: ['Water Sports', 'Uluwatu Cliff Temple', 'Kecak Dance'] },
      { day: 6, title: 'Departure Bali', description: 'Breakfast, souvinir shopping in Kuta, and drop at Denpasar airport.', activities: ['Souvenir Shopping', 'Airport Transfer'] }
    ]
  }
];

export const baliFallbackData = {
  name: 'Bali Paradise Escape',
  slug: 'bali-paradise',
  duration: '5N/6D',
  price: 55999,
  rating: 4.9,
  reviews: 240,
  image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80',
  images: [
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80',
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80'
  ],
  destinations: ['Ubud', 'Seminyak', 'Nusa Penida', 'Uluwatu'],
  highlights: [
    'Sacred Monkey Forest Ubud',
    'Tegallalang Rice Terraces',
    'Tanah Lot Sea Temple Sunset',
    'Nusa Penida Kelingking Beach Tour'
  ],
  inclusions: [
    '3-Star Boutique Resort Accommodation',
    'Daily Breakfast',
    'Private Cab Transfers',
    'Nusa Penida Speedboat & Island Tour'
  ],
  exclusions: ['International Flights', 'Visa on Arrival'],
  package_type: 'international',
  variants: baliVariants
};
