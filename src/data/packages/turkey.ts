// src/data/packages/turkey.ts
// Canonical Data Model for Grand Turkey & Cappadocia

  export const TURKEY_PACKAGES = [
    {
      id: "turkey-6d-5n",
      title: "Istanbul & Cappadocia Balloon Delight (6D/5N)",
      desc: "Short Turkey highlights tour featuring Istanbul Hagia Sophia, Bosphorus dinner cruise, Cappadocia cave hotel stay & sunrise hot air balloon flight.",
      badge: "Express Balloon",
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800",
      price: 89500,
      duration: "6 Days / 5 Nights",
      rating: 4.95,
      reviewsCount: 390,
      stay: "Istanbul Old City Hotel (3N) + Cappadocia Cave Hotel (2N)",
      vehicle: "Chauffeured Private AC Vehicle + Domestic Flight Transfers",
      link: "/packages/turkey-6d-5n",
      highlights: ["Sunrise Hot Air Balloon Flight", "Cappadocia Cave Hotel", "Hagia Sophia & Blue Mosque", "Bosphorus Dinner Cruise"],
      itinerary: [
        { day: "Day 1", title: "Istanbul Airport Pickup → Hotel Check-in & Bosphorus Cruise", desc: "Private pickup from Istanbul Airport (IST/SAW). Evening luxury Bosphorus dinner cruise with live Turkish folk dance." },
        { day: "Day 2", title: "Istanbul Sultanahmet Tour → Hagia Sophia & Grand Bazaar", desc: "Tour 6th-century Hagia Sophia Grand Mosque, Blue Mosque, Hippodrome & 4,000-shop Grand Bazaar." },
        { day: "Day 3", title: "Domestic Flight to Cappadocia → Cave Hotel Check-in", desc: "Flight to Nevsehir/Kayseri. Check-in to authentic boutique cave hotel cut into volcanic tufa rock." },
        { day: "Day 4", title: "Cappadocia Sunrise Hot Air Balloon & Red Tour", desc: "Sunrise hot air balloon flight over fairy chimneys. Tour Göreme Open Air Museum, Love Valley & Uchisar Castle." },
        { day: "Day 5", title: "Derinkuyu Underground City → Return Flight to Istanbul", desc: "Explore 8-storey Derinkuyu Underground City & evening return domestic flight to Istanbul." },
        { day: "Day 6", title: "Istanbul Spice Bazaar → Airport Departure", desc: "Breakfast, Egyptian Spice Bazaar shopping, and private transfer to Istanbul Airport." }
      ],
      inclusions: ["5 Nights Accommodation (2 Cave Hotel + 3 4-Star Hotels)", "Sunrise Hot Air Balloon Flight Pass", "Domestic Flights (Istanbul-Cappadocia-Istanbul)", "Bosphorus Dinner Cruise Ticket", "Daily Breakfast"],
      exclusions: ["Flight tickets to Istanbul", "Turkey eVisa fee"]
    },
    {
      id: "turkey-8d-7n",
      title: "Grand Turkey Wonders & Pamukkale Travertines (8D/7N)",
      desc: "Our best-selling Turkey circuit adding Pamukkale white calcium terraces, Hierapolis ancient thermal baths & Ephesus Greco-Roman ruins.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800",
      price: 118000,
      duration: "8 Days / 7 Nights",
      rating: 4.98,
      reviewsCount: 760,
      stay: "Istanbul (3N) + Cappadocia Cave (2N) + Pamukkale Thermal Resort (2N)",
      vehicle: "Chauffeured Private AC Vehicle + 2 Domestic Flights",
      link: "/packages/turkey-8d-7n",
      highlights: ["Pamukkale White Terraces", "Ephesus Celsus Library", "Cappadocia Hot Air Balloon", "Bosphorus Cruise"],
      itinerary: [
        { day: "Day 1", title: "Istanbul Arrival → Hotel Check-in", desc: "Pickup at Istanbul Airport and check-in to historic Old City hotel." },
        { day: "Day 2", title: "Istanbul Sultanahmet Full Day Heritage", desc: "Hagia Sophia, Blue Mosque, Topkapi Palace & Grand Bazaar." },
        { day: "Day 3", title: "Flight to Cappadocia → Devrent Valley", desc: "Domestic flight to Cappadocia. Tour Devrent Valley fairy chimneys & Pasabag mushroom rocks." },
        { day: "Day 4", title: "Sunrise Hot Air Balloon & Kaymakli Underground City", desc: "Sunrise balloon flight over Cappadocia canyons & tour 60m deep Kaymakli Underground City." },
        { day: "Day 5", title: "Cappadocia to Pamukkale Overland Drive", desc: "Scenic drive across Anatolian plateau visiting 13th-century Sultanhani Caravanserai." },
        { day: "Day 6", title: "Pamukkale Calcium Terraces & Hierapolis Cleopatra Pool", desc: "Walk barefoot on snow-white travertines & swim in Cleopatra's ancient thermal spring pool." },
        { day: "Day 7", title: "Ephesus Ancient Ruins → Flight to Istanbul", desc: "Tour Ephesus Celsus Library, Grand Theater, Temple of Artemis & evening flight back to Istanbul." },
        { day: "Day 8", title: "Istanbul Shopping → Airport Departure", desc: "Breakfast, Grand Bazaar shopping, and drop-off at Istanbul Airport." }
      ],
      inclusions: ["7 Nights 4-Star & Cave Hotel Stays", "Sunrise Hot Air Balloon Ticket", "All Domestic Flights Included", "Pamukkale & Ephesus Entrance Passes", "Daily Breakfast"],
      exclusions: ["Flight tickets to Istanbul"]
    }
  ]
