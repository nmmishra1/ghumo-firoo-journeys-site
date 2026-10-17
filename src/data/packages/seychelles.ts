// src/data/packages/seychelles.ts
// Canonical Data Model for Seychelles Island Hopper

  export const SEYCHELLES_PACKAGES = [
    {
      id: "seychelles-5d-4n",
      title: "Mahé & Praslin Island Tropical Break (5D/4N)",
      desc: "Short Seychelles tropical break featuring Mahé Beau Vallon beach, Victoria botanical gardens, and Praslin Anse Lazio granite boulder beach.",
      badge: "Express Escape",
      image: "https://images.unsplash.com/photo-1589553460732-58ef7a11d986?q=80&w=800",
      price: 85000,
      duration: "5 Days / 4 Nights",
      rating: 4.88,
      reviewsCount: 310,
      stay: "Mahé Beach Resort (2N) + Praslin Luxury Resort (2N)",
      vehicle: "Chauffeured Private AC Vehicle + Cat Cocos Ferry",
      link: "/packages/seychelles-5d-4n",
      highlights: ["Anse Lazio Granite Boulders", "Vallée de Mai Double Coconut", "Beau Vallon Beach", "Victoria Clock Tower"],
      itinerary: [
        { day: "Day 1", title: "Mahé Airport Pickup → Beau Vallon Beach Resort", desc: "Private pickup from Seychelles International Airport (SEZ). Check-in to Mahé resort & sunset cocktail at Beau Vallon beach." },
        { day: "Day 2", title: "Mahé Island Tour → Victoria Capital & Morne National Park", desc: "Tour world's smallest capital Victoria, Sir Selwyn Clarke Market, Little Ben clock tower & Morne Seychellois tea factory view." },
        { day: "Day 3", title: "Cat Cocos Fast Ferry to Praslin Island → Vallée de Mai", desc: "High-speed Cat Cocos ferry to Praslin. Tour UNESCO Vallée de Mai forest to see giant Coco de Mer double palm nuts." },
        { day: "Day 4", title: "Anse Lazio & Anse Georgette Beach Day", desc: "Full day relaxing at Anse Lazio, famous for giant pink granite boulders, turquoise waters & shade-giving Takamaka trees." },
        { day: "Day 5", title: "Praslin to Mahé Ferry → Airport Departure", desc: "Breakfast, Cat Cocos ferry return to Mahé, and transfer to Seychelles Airport." }
      ],
      inclusions: ["4 Nights 4-Star Resort Accommodation", "Cat Cocos High-Speed Ferry Tickets", "Vallée de Mai UNESCO Entry Pass", "Private AC Vehicle Transfers", "Daily Breakfast"],
      exclusions: ["Flight tickets to Seychelles", "Environmental Sustainability Levy"]
    },
    {
      id: "seychelles-7d-6n",
      title: "Grand Seychelles 3-Island Hopper (7D/6N)",
      desc: "Our best-selling Seychelles circuit covering Mahé, Praslin & La Digue Anse Source d'Argent (world's most photographed beach).",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1589553460732-58ef7a11d986?q=80&w=800",
      price: 115000,
      duration: "7 Days / 6 Nights",
      rating: 4.98,
      reviewsCount: 640,
      stay: "Mahé Resort (2N) + Praslin Resort (2N) + La Digue Boutique Hotel (2N)",
      vehicle: "Cat Cocos Ferry + Island Bicycle Tour",
      link: "/packages/seychelles-7d-6n",
      highlights: ["Anse Source d'Argent La Digue", "Giant Aldabra Tortoises", "Vallée de Mai Coco de Mer", "Curieuse Island"],
      itinerary: [
        { day: "Day 1", title: "Mahé Airport Pickup → Resort Check-in", desc: "Pickup at Mahé Airport and transfer to seaside resort." },
        { day: "Day 2", title: "Mahé Island Tour & Victoria Market", desc: "Tour Victoria market, Copolia Trail view & Beau Vallon beach." },
        { day: "Day 3", title: "Ferry to Praslin → Vallée de Mai Forest", desc: "Cat Cocos ferry to Praslin & guided tour of Coco de Mer palm forest." },
        { day: "Day 4", title: "Curieuse Island Giant Tortoise Boat Excursion", desc: "Boat trip to Curieuse Island to walk among 300 free-roaming giant Aldabra tortoises & Baie Laraie mangroves." },
        { day: "Day 5", title: "Ferry to La Digue → Bicycle Tour to Anse Source d'Argent", desc: "Schooner ferry to car-free La Digue island. Rent bicycles to ride through L'Union Estate to Anse Source d'Argent." },
        { day: "Day 6", title: "La Digue Anse Sevère & Grand Anse Beach Exploration", desc: "Bicycle tour to secluded Grand Anse & Anse Sevère beaches." },
        { day: "Day 7", title: "La Digue to Mahé Ferry → Airport Departure", desc: "Breakfast, return ferry to Mahé, and transfer to Seychelles International Airport." }
      ],
      inclusions: ["6 Nights 4-Star Resort Accommodations", "All Inter-Island Ferry Tickets (Mahé-Praslin-La Digue)", "La Digue Bicycle Rental", "Curieuse Giant Tortoise Boat Tour", "Daily Breakfast"],
      exclusions: ["Flight tickets to Seychelles"]
    }
  ]
