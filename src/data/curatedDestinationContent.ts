export interface CuratedDestinationGuide {
  slugs: string[];
  city: string;
  state: string;
  title: string;
  metaDescription: string;
  heroBadge?: string;
  officialPartnerCallout?: {
    title: string;
    description: string;
    badgeText: string;
    ctaText: string;
    ctaLink: string;
  };
  overview: string;
  bestTimeToVisit: {
    season: string;
    description: string;
  };
  howToReach: {
    airport: string;
    railway: string;
    road: string;
  };
  signatureExperiences: Array<{
    title: string;
    category: string;
    duration: string;
    price: string;
    description: string;
  }>;
  heritageAndCultureTrail: Array<{
    title: string;
    category: string;
    duration: string;
    price: string;
    description: string;
  }>;
  nearbyDestinations: Array<{
    name: string;
    distance: string;
    type: string;
    description: string;
    link?: string;
  }>;
  widerStateHighlights?: Array<{
    name: string;
    distance: string;
    type: string;
    description: string;
    link?: string;
  }>;
  quickLinks?: Array<{
    label: string;
    description: string;
    path: string;
  }>;
  primaryCta?: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
  };
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export const CURATED_DESTINATION_GUIDES: Record<string, CuratedDestinationGuide> = {
  'rann-of-kutch': {
    slugs: ['rann-of-kutch', 'kutch', 'dhordo', 'white-desert', 'rann-utsav-kutch', 'kutch-dhordo-rann-of-kutch'],
    city: 'Rann of Kutch (Dhordo / Kutch)',
    state: 'Gujarat',
    title: 'Rann of Kutch, Gujarat – White Desert & Rann Utsav Guide | Ghumo Firoo',
    metaDescription: "Explore the Rann of Kutch's white salt desert, Dhordo's Tent City, and Rann Utsav 2026-2027. Best time to visit, how to reach, and things to do.",
    heroBadge: 'Official Partner · Evoke Tent City Dhordo',
    officialPartnerCallout: {
      title: 'Official Booking Partner for Evoke Tent City Dhordo',
      description: "Ghumo Firoo is an official booking partner for Evoke Tent City Dhordo, Gujarat Tourism's authorized operator for Rann Utsav. We handle bookings directly with zero third-party markups, offering premium AC Swiss Cottages, Darbari Suites, and all-inclusive cultural itineraries.",
      badgeText: 'Direct Gujarat Tourism Operator Partner',
      ctaText: 'View Rann Utsav Packages & Rates',
      ctaLink: '/packages/rann-utsav'
    },
    overview: "The Rann of Kutch is one of the most surreal landscapes in India — a vast white salt marsh in Gujarat that stretches to the horizon, turning silver under moonlight and gold at sunrise. Spanning over 7,500 square kilometres, it's the largest salt desert in the world, and for a few winter months each year, the village of Dhordo at its edge transforms into Rann Utsav — a festival city of Swiss tents, folk music, and desert safaris set against the endless white expanse.\n\nGhumo Firoo is an official booking partner for Evoke Tent City Dhordo, Gujarat Tourism's authorized operator for Rann Utsav, so we handle bookings for this destination directly rather than through a third party.",
    bestTimeToVisit: {
      season: 'Late October to February (Cooler & Dry Season)',
      description: 'Rann Utsav runs roughly late October to February, coinciding with the cooler, dry season — this is also the only window when the white desert is fully accessible and the festival infrastructure is active. Outside these months, Kutch is extremely hot and the Rann itself is less accessible.'
    },
    howToReach: {
      airport: 'Bhuj Airport (BHJ) — roughly 80 km from Dhordo (~1.5 hours drive)',
      railway: 'Bhuj Railway Station (BHJ/SOJN) — well connected to Ahmedabad, Mumbai, and Delhi',
      road: 'Dhordo is about 4–5 hours by road from Ahmedabad via well-paved highways; Ghumo Firoo arranges private verified transfers as part of all Rann Utsav packages.'
    },
    signatureExperiences: [
      {
        title: 'Walk the White Desert at Sunset & Full Moon',
        category: 'Desert Experience',
        duration: '2.5 Hours',
        price: 'Included with Permit',
        description: 'The vast salt flats reflect the changing evening sky in shifting shades of lavender, orange, and gold. Best experienced in the hour before dusk, and mesmerizing on full moon nights when the salt marsh turns into a shimmering silver sheet.'
      },
      {
        title: 'Rann Utsav Tent City Experience (Dhordo)',
        category: 'Festival & Stay',
        duration: '2N / 3D or 3N / 4D',
        price: 'From ₹13,500 / Person',
        description: 'Stay in luxury AC Swiss cottages or royal Darbari tents inside the vibrant Tent City with authentic Kutchi cuisine, evening folk dance, Sufi music recitals, and handicraft artisan stalls (late Oct–Feb).'
      },
      {
        title: 'Kalo Dungar (Black Hill, 1,516 ft) & Dattatreya Temple',
        category: 'Panoramic Vantage',
        duration: '3.5 Hours',
        price: 'Free Entry (6 AM – 6 PM)',
        description: 'The highest point in Kutch near Khavda, offering sweeping panoramic views across the entire white salt expanse. The 400-year-old Lord Dattatreya temple at the summit carries a legendary tradition of priests feeding wild jackals daily.'
      },
      {
        title: 'White Desert Camel & Jeep Safaris',
        category: 'Desert Safari',
        duration: '1.5 Hours',
        price: '₹500 – ₹1,200',
        description: 'Traditional decorated camel cart rides and thrilling 4x4 open-top jeep safaris taking you deep into the remote, pristine expanses of the white salt flats.'
      }
    ],
    heritageAndCultureTrail: [
      {
        title: 'Aina Mahal & Prag Mahal Clock Tower, Bhuj',
        category: 'Royal Heritage',
        duration: '2.5 Hours',
        price: '₹50 – ₹100',
        description: 'Aina Mahal ("Hall of Mirrors") is an 18th-century palace famed for Venetian glass, mirrored halls, and royal artefacts; next door, Prag Mahal\'s Italian Gothic clock tower offers commanding panoramic views over historic Bhuj.'
      },
      {
        title: 'Kutch Museum, Bhuj (Estd. 1877)',
        category: 'Historic Museum',
        duration: '2 Hours',
        price: '₹20 – ₹50',
        description: 'Gujarat\'s oldest museum, founded in 1877 by Maharao Khengarji III opposite Hamirsar Lake. Features the largest collection of 1st-century Kshatrapa inscriptions, extinct Kutchi script scripts, historic Kori coins, and tribal embroidery.'
      },
      {
        title: 'Bhujodi Textile Craft Village & Vankar Weavers',
        category: 'Artisan Heritage',
        duration: '2.5 Hours',
        price: 'Free Entry',
        description: 'Renowned artisan village outside Bhuj with generations of National Award-winning Vankar community master weavers producing intricate handloom shawls, Kutchi carpets, and Bandhani tie-dye fabrics.'
      },
      {
        title: 'Vijay Vilas Palace & Private Beach, Mandvi',
        category: 'Palace & Coast',
        duration: '3 Hours',
        price: '₹100',
        description: 'Early 20th-century red sandstone royal palace set inside sprawling gardens beside a private Arabian Sea beach. Blends Rajput and Bengal architecture and is famous as a Bollywood filming backdrop.'
      },
      {
        title: 'Lakhpat Walled Fort & Historic Gurudwara Sahib',
        category: 'Ancient Citadel',
        duration: '3 Hours',
        price: 'Free Entry',
        description: 'Atmospheric 18th-century walled port town near the Indus River delta and Pakistan border. Houses high battlement ramparts and an ASI-protected Gurudwara commemorating Guru Nanak\'s travels.'
      },
      {
        title: 'Mata no Madh (Maa Ashapura Temple)',
        category: 'Spiritual Shrine',
        duration: '2 Hours',
        price: 'Free Entry',
        description: '14th-century pilgrimage shrine dedicated to Goddess Ashapura, the patron family deity of the erstwhile Jadeja rulers of Kutch, visited by thousands during Navratri.'
      },
      {
        title: 'Koteshwar Mahadev Temple & Narayan Sarovar',
        category: 'Sacred Confluence',
        duration: '2.5 Hours',
        price: 'Free Entry',
        description: 'Ancient coastal Shiva temple perched at mainland India\'s westernmost maritime frontier, adjacent to Narayan Sarovar, revered as one of Hinduism\'s five holy lakes.'
      }
    ],
    nearbyDestinations: [
      {
        name: 'Bhuj Heritage Hub',
        distance: '80 km (~1.5 hrs from Dhordo)',
        type: 'Heritage, Bazaars & Palaces',
        description: 'Base town for Aina Mahal, Prag Mahal, Kutch Museum, Hamirsar Lake, and Bhujodi handicraft markets.',
        link: '/explore-india/bhuj'
      },
      {
        name: 'Mandvi Beach & Coastal Retreat',
        distance: '135 km (~2.5 hrs from Dhordo)',
        type: 'Beach, Ship Building & Palace',
        description: 'Serene coastal town with historic 400-year-old wooden dhow shipbuilding yards and Vijay Vilas Palace.',
        link: '/explore-india/mandvi'
      },
      {
        name: 'Dholavira UNESCO Harappan City',
        distance: '170 km across the Road to Heaven',
        type: 'Ancient Indus Valley Civilization',
        description: '5,000-year-old Harappan archaeological marvel with water reservoirs, stepped wells, and the iconic white salt road.',
        link: '/explore-india/dholavira'
      }
    ],
    widerStateHighlights: [
      {
        name: 'Statue of Unity, Kevadia',
        distance: '~450 km (~7-8 hrs drive)',
        type: 'World Landmark (182m)',
        description: 'The world\'s tallest statue honoring Sardar Vallabhbhai Patel, viewing gallery, valley of flowers & light show.',
        link: '/explore-india/statue-of-unity'
      },
      {
        name: 'Gir National Park (Sasan Gir)',
        distance: '~380 km (~6-7 hrs drive)',
        type: 'Wild Asiatic Lion Sanctuary',
        description: 'The only natural habitat of Asiatic Lions on Earth, offering open-top jeep forest safaris.',
        link: '/explore-india/gir-national-park'
      },
      {
        name: 'Somnath Jyotirlinga Temple',
        distance: '~390 km (~7 hrs drive)',
        type: 'First Holy Jyotirlinga Shrine',
        description: 'Ancient shore temple of Lord Shiva with evening sound and light spectacle overlooking the Arabian Sea.',
        link: '/explore-india/somnath'
      },
      {
        name: 'Ahmedabad Heritage City',
        distance: '~380 km (~6 hrs drive)',
        type: 'UNESCO World Heritage City',
        description: 'Gujarat\'s central gateway with Adalaj Stepwell, Sabarmati Ashram, and legendary night food markets.',
        link: '/explore-india/ahmedabad'
      }
    ],
    quickLinks: [
      {
        label: 'Rann Utsav Tour Packages & Rates',
        description: 'Explore 2N/3D & 3N/4D all-inclusive Tent City Dhordo packages with transfers.',
        path: '/packages/rann-utsav'
      },
      {
        label: 'Evoke Tent City Dhordo Booking Guide (2026–2027)',
        description: 'Complete guide on tent categories, dates, pricing, inclusions, and booking tips.',
        path: '/blog/evoke-tent-city-dhordo-booking-guide-2026-2027'
      },
      {
        label: 'About Ghumo Firoo (Evoke / Gujarat Tourism Partnership)',
        description: 'Learn more about our official partnerships, verified fleet, and concierge team.',
        path: '/about'
      }
    ],
    primaryCta: {
      title: 'Ready to Experience the Magic of the White Desert?',
      subtitle: 'Book your official Evoke Tent City Dhordo package with luxury AC Swiss cottages, VIP transfers, and guided desert safaris.',
      buttonText: 'Book Your Rann Utsav Package →',
      buttonLink: '/packages/rann-utsav'
    },
    faqs: [
      {
        question: 'What is the best time to visit Rann of Kutch and Rann Utsav?',
        answer: 'The best time to visit is between late October and February during Rann Utsav, when the temperature is pleasant and the white salt desert is dry, walkable, and fully accessible with festival infrastructure active.'
      },
      {
        question: 'Is Ghumo Firoo an official partner for Tent City Dhordo?',
        answer: "Yes, Ghumo Firoo is an official authorized booking partner for Evoke Tent City Dhordo, Gujarat Tourism's official operator for Rann Utsav. We provide direct bookings with zero third-party markups."
      },
      {
        question: 'How do I reach Dhordo and the White Desert from Bhuj or Ahmedabad?',
        answer: 'Dhordo is roughly 80 km (1.5 hours) from Bhuj Airport and Railway Station, and 400 km (7 hours) from Ahmedabad. All Ghumo Firoo Rann Utsav packages include verified AC transfers from Bhuj or Ahmedabad.'
      },
      {
        question: 'What permits are required to visit the White Desert at Dhordo?',
        answer: 'Because of proximity to the international border, an official Rann permit is required for all visitors. For guests booking Tent City Dhordo packages with Ghumo Firoo, all permits are processed seamlessly in advance.'
      }
    ]
  }
};

export function getCuratedGuide(slug: string): CuratedDestinationGuide | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  // Direct key lookup
  if (CURATED_DESTINATION_GUIDES[clean]) {
    return CURATED_DESTINATION_GUIDES[clean];
  }

  // Slugs array lookup
  for (const guide of Object.values(CURATED_DESTINATION_GUIDES)) {
    if (guide.slugs.includes(clean)) {
      return guide;
    }
  }

  return undefined;
}
