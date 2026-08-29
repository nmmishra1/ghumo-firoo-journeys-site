import { PackageVariant } from '@/components/packages/PackageVariantSelector';

export const thailandVariants: PackageVariant[] = [
  {
    id: 'classic',
    label: '5N/6D Classic',
    nights: 5, days: 6,
    tag: 'Best Value',
    pricePerPerson: 45999,
    hotelCategory: '3 Star',
    groupSize: '2-15 People',
    inclusions: [
      '5 nights hotel stay in 3-star properties',
      'Bangkok 2N + Pattaya 3N accommodation',
      'Daily breakfast',
      'Airport & city transfers',
      'Bangkok city & temple tour',
      'Coral Island trip with boat transfer',
      'Alcazar Cabaret Show entry',
      'Travel insurance'
    ],
    exclusions: [
      'International airfare',
      'Thailand Visa fee',
      'Lunch & dinner',
      'Personal expenses & water sports'
    ],
    hotels: [
      { name: 'Ibis Bangkok Siam', location: 'Bangkok', stars: 3, highlight: 'Central Sukhumvit location' },
      { name: 'Pattaya Park Beach Resort', location: 'Pattaya', stars: 3, highlight: 'Beachfront property' }
    ],
    excursions: [
      { name: 'Grand Palace & Wat Pho', description: 'Bangkok temple tour with guide', duration: 'Half day', included: true },
      { name: 'Coral Island Trip', description: 'Speedboat to Pattaya coral islands', duration: 'Full day', included: true },
      { name: 'Chatuchak Weekend Market', description: 'Largest market in Asia', duration: '3 hrs', included: true }
    ],
    itinerary: [
      { day: 1, title: 'Arrival Bangkok & Transfer to Pattaya', description: 'Airport arrival, AC van transfer to Pattaya beachfront resort. Evening Alcazar Show.', activities: ['Airport Pickup', 'Pattaya Transfer', 'Alcazar Cabaret Show'] },
      { day: 2, title: 'Coral Island Speedboat Tour', description: 'Speedboat excursion to Coral Island (Koh Larn) with seafood lunch and water sports.', activities: ['Coral Island Speedboat', 'Parasailing / Snorkeling', 'Beach Lunch'] },
      { day: 3, title: 'Pattaya to Bangkok Transfer & City Tour', description: 'Drive to Bangkok, visit Golden Buddha (Wat Traimit) and Reclining Buddha (Wat Pho).', activities: ['Hotel Check-out', 'Temple Tour', 'Hotel Check-in'] },
      { day: 4, title: 'Safari World & Marine Park Excursion', description: 'Full day at Thailand popular open zoo and marine park with buffet lunch.', activities: ['Safari World Drive', 'Dolphin Show', 'Stunt Show'] },
      { day: 5, title: 'Free Shopping Day Bangkok', description: 'Day at leisure for shopping at Siam Paragon, CentralWorld and MBK Center.', activities: ['Shopping Mall Tour', 'Chao Phraya Dinner Cruise'] },
      { day: 6, title: 'Departure Bangkok', description: 'Breakfast and private transfer to Suvarnabhumi or Don Mueang airport.', activities: ['Airport Transfer'] }
    ]
  }
];

export const thailandFallbackData = {
  name: 'Thailand Tropical Getaway',
  slug: 'thailand-tropical',
  duration: '5N/6D',
  price: 45999,
  rating: 4.8,
  reviews: 215,
  image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80',
  images: [
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80',
    'https://images.unsplash.com/photo-1506665531195-3566fe2b4dfa?q=80'
  ],
  destinations: ['Bangkok', 'Pattaya', 'Coral Island'],
  highlights: [
    'Bangkok Temple & City Tour',
    'Coral Island Speedboat Trip',
    'Alcazar Cabaret Show Pattaya',
    'Safari World & Marine Park'
  ],
  inclusions: [
    '3-Star Hotel Stay with Breakfast',
    'Private Cab / AC Bus Transfers',
    'Coral Island Speedboat Trip',
    'Alcazar Show Tickets'
  ],
  exclusions: ['Airfare', 'Thailand Visa On Arrival'],
  package_type: 'international',
  variants: thailandVariants
};
