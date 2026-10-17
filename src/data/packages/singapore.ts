// src/data/packages/singapore.ts
// Canonical Data Model for Singapore City & Sentosa Island

  export const SINGAPORE_PACKAGES = [
    { 
      id: "singapore-4d-3n",
      title: "Singapore City & Sentosa Island Express (4D/3N)", 
      desc: "Ideal starter package covering Gardens by the Bay, Mandai Night Safari guided tram tour & Universal Studios Sentosa all-day theme park.", 
      badge: "Express Choice", 
      image: "/singapore/universal_studios.jpg",
      link: "/packages/singapore-4d-3n", 
      price: 48000,
      duration: "4 Days / 3 Nights",
      rating: 4.88,
      reviewsCount: 410,
      stay: "4-Star Orchard / Bugis Hotel (3N)",
      vehicle: "Chauffeured Private AC Vehicle",
      highlights: ["Universal Studios Sentosa", "Gardens by the Bay Supertrees", "Mandai Night Safari", "Merlion Park"],
      itinerary: [
        { day: "Day 1", title: "Changi Airport Pickup → Hotel Check-in & Night Safari", desc: "Chauffeured pickup at Changi Airport. Check-in to hotel & evening Mandai Night Safari guided tram tour." },
        { day: "Day 2", title: "Universal Studios Sentosa All-Day Pass", desc: "Full day at Universal Studios theme park: Battlestar Galactica, Transformers 3D & Mummy ride." },
        { day: "Day 3", title: "Gardens by the Bay & Marina Bay Sands SkyPark", desc: "Cloud Forest dome, Flower Dome, Supertree Grove light show & Marina Bay Sands observation deck." },
        { day: "Day 4", title: "Jewel Changi Rain Vortex → Airport Transfer", desc: "Explore Jewel Changi HSBC Rain Vortex waterfall and transfer to Changi Airport." }
      ],
      inclusions: [
        "3 Nights 4-Star Hotel Stay with Daily Breakfast",
        "Fast-Track Singapore Tourist E-Visa",
        "Universal Studios Sentosa + Night Safari Tram Tickets",
        "Private AC Airport & City Transfers"
      ],
      exclusions: ["Flight tickets to Singapore", "Personal expenses"]
    },
    { 
      id: "singapore-5d-4n",
      title: "Singapore Grand Delight & Cable Car Sky Dining (5D/4N)", 
      desc: "Our best-selling Singapore vacation featuring S.E.A. Aquarium, Cable Car Mount Faber line, Wings of Time & Jewel Canopy Park.", 
      badge: "Best Seller", 
      image: "/singapore/gardens_by_the_bay.jpg",
      link: "/packages/singapore-5d-4n", 
      price: 64000,
      duration: "5 Days / 4 Nights",
      rating: 4.95,
      reviewsCount: 890,
      stay: "4-Star Deluxe Marina Bay / Riverside Hotel (4N)",
      vehicle: "Chauffeured Private AC Vehicle",
      highlights: ["S.E.A. Aquarium", "Mount Faber Cable Car", "Wings of Time Laser Show", "Jewel Rain Vortex"],
      itinerary: [
        { day: "Day 1", title: "Changi Airport Pickup → Gardens by the Bay Light Show", desc: "Airport pickup, hotel check-in & evening Gardens by the Bay Supertree light show." },
        { day: "Day 2", title: "Universal Studios Sentosa & Wings of Time Show", desc: "Full day theme park fun and evening laser light water show at Siloso Beach." },
        { day: "Day 3", title: "S.E.A. Aquarium & Singapore Cable Car Sky Dining", desc: "Explore 100,000 ocean animals at S.E.A. Aquarium and evening cable car flight." },
        { day: "Day 4", title: "Mandai River Wonders Pandas & Orchard Road Shopping", desc: "Giant panda habitat at River Wonders and shopping spree along Orchard Road." },
        { day: "Day 5", title: "Jewel Changi Canopy Park → Airport Departure", desc: "Jewel Changi Bouncing Nets & departure transfer." }
      ],
      inclusions: [
        "4 Nights 4-Star Deluxe Hotel Accommodations",
        "Universal Studios + S.E.A. Aquarium + Cable Car Passes",
        "Singapore E-Visa Guaranteed Processing",
        "Private AC Transfers Throughout"
      ],
      exclusions: ["Flight tickets"]
    },
    { 
      id: "singapore-city-delight",
      title: "Singapore City Delight & Night Safari (4D/3N)", 
      desc: "Fast-paced Singapore holiday combining panoramic city sights, Merlion Park, Singapore Flyer and nocturnal Mandai safari.", 
      badge: "Family Favorite", 
      image: "/singapore/singapore_flyer.jpg",
      link: "/packages/singapore-city-delight", 
      price: 52000,
      duration: "4 Days / 3 Nights",
      rating: 4.89,
      reviewsCount: 320,
      stay: "4-Star Central City Hotel (3N)",
      vehicle: "Private AC Vehicle",
      highlights: ["Singapore Flyer Giant Wheel", "Mandai Night Safari", "Merlion Park & River Cruise", "Little India & Chinatown"],
      inclusions: ["3N 4-Star Hotel", "E-Visa Assistance", "Singapore Flyer + Night Safari Passes", "All Transfers"],
      exclusions: ["International Flights"]
    },
    { 
      id: "singapore-luxury",
      title: "Singapore Luxury Skyline & Marina Bay Sands (5D/4N)", 
      desc: "Ultra-luxury experience featuring 5-star hotel stay, iconic Marina Bay Sands SkyPark, celebrity dining and VIP private yacht.", 
      badge: "Ultra Luxury", 
      image: "/singapore/marina_bay_sands.jpg",
      link: "/packages/singapore-luxury", 
      price: 95000,
      duration: "5 Days / 4 Nights",
      rating: 4.98,
      reviewsCount: 260,
      stay: "5-Star Marina Bay Sands / Pan Pacific (4N)",
      vehicle: "Chauffeured Luxury Mercedes/Alphard",
      highlights: ["MBS SkyPark Infinity Experience", "Private Sunset Yacht Charter", "Universal Studios VIP Pass", "Fine Dining Credits"],
      inclusions: ["4N 5-Star Luxury Accommodations", "VIP Express Fast-Track Tickets", "Private Limousine Transfers", "E-Visa Support"],
      exclusions: ["Flight Tickets"]
    },
    { 
      id: "singapore-cruise",
      title: "Singapore & Resorts World Genting Dream Cruise (6D/5N)", 
      desc: "The ultimate land and ocean combo featuring 3 nights in Singapore and 2 nights aboard the luxury Genting Dream ocean cruise.", 
      badge: "Land & Cruise Combo", 
      image: "/singapore/wings_of_time_sentosa.jpg",
      link: "/packages/singapore-cruise", 
      price: 88000,
      duration: "6 Days / 5 Nights",
      rating: 4.96,
      reviewsCount: 640,
      stay: "3N Singapore Hotel + 2N Genting Dream Balcony Cabin",
      vehicle: "Private Transfers + Luxury Cruise Ship",
      highlights: ["Genting Dream Ocean Cruise", "Universal Studios Sentosa", "Gardens by the Bay", "Full Board Cruise Dining"],
      inclusions: ["3N Hotel + 2N Cruise Balcony Cabin", "All Cruise Meals & Theatrical Shows", "Universal Studios Tickets", "E-Visa Processing"],
      exclusions: ["Airfare", "Cruise Gratuities"]
    },
    { 
      id: "singapore-malaysia",
      title: "Singapore & Malaysia Twin Country Delight (7D/6N)", 
      desc: "Comprehensive Southeast Asia vacation combining Singapore's futuristic skyline with Kuala Lumpur Petronas Towers and Genting Highlands.", 
      badge: "Twin Country Tour", 
      image: "/singapore/merlion_park.jpg",
      link: "/packages/singapore-malaysia", 
      price: 79000,
      duration: "7 Days / 6 Nights",
      rating: 4.92,
      reviewsCount: 780,
      stay: "3N Singapore (4-Star) + 3N Kuala Lumpur (4-Star)",
      vehicle: "Private AC Vehicle & Cross-Border Coach",
      highlights: ["Universal Studios Singapore", "Petronas Twin Towers KL", "Batu Caves & Genting Highlands", "Gardens by the Bay"],
      inclusions: ["6N 4-Star Accommodations", "Singapore & Malaysia Dual E-Visas", "Cross-Border Executive Coach", "All Sightseeing Passes"],
      exclusions: ["International Flights"]
    }
  ]
