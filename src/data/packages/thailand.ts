// src/data/packages/thailand.ts
// Canonical Data Model for Thailand Tropical Escapes

  export const THAILAND_PACKAGES = [
    {
      id: "thailand-4d-3n",
      title: "Bangkok & Pattaya Beach Express (4D/3N)",
      desc: "Short Thailand break covering Coral Island speedboat water sports, Alcazar Show Pattaya & Golden Buddha temple tour in Bangkok.",
      badge: "Express Break",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800",
      price: 26500,
      duration: "4 Days / 3 Nights",
      rating: 4.85,
      reviewsCount: 420,
      stay: "Pattaya Beachfront Hotel (2N) + Bangkok City Hotel (1N)",
      vehicle: "Chauffeured Private AC Sedan / SUV",
      link: "/packages/thailand-4d-3n",
      highlights: ["Coral Island Speedboat Tour", "Alcazar Cabaret Show", "Golden Buddha Temple", "Bangkok Shopping"],
      itinerary: [
        { day: "Day 1", title: "Bangkok Airport Pickup → Drive to Pattaya Beach", desc: "Private pickup from Suvarnabhumi (BKK) / Don Mueang (DMK) Airport. Drive to Pattaya resort. Evening Walking Street stroll." },
        { day: "Day 2", title: "Coral Island Speedboat Tour & Alcazar Show", desc: "Speedboat ride to Coral Island (Koh Larn) for parasailing & lunch. Evening VIP seats for Alcazar Cabaret Show." },
        { day: "Day 3", title: "Pattaya to Bangkok → Temple & City Tour", desc: "Drive to Bangkok. Visit Wat Traimit (Golden Buddha) & Wat Pho (Reclining Buddha). Check-in to Bangkok hotel." },
        { day: "Day 4", title: "Indra Market Shopping → Airport Transfer", desc: "Breakfast, Pratunam & Platinum Mall shopping, and private transfer to Bangkok Airport." }
      ],
      inclusions: ["3 Nights 4-Star Hotel Stay", "Coral Island Speedboat Tour + Buffet Lunch", "Alcazar Show VIP Ticket", "Private AC Vehicle", "Daily Breakfast"],
      exclusions: ["Flight tickets to Bangkok", "Visa on arrival fees"]
    },
    {
      id: "thailand-6d-5n",
      title: "Phuket & Krabi Island Hopper (6D/5N)",
      desc: "Our best-selling Thailand island tour featuring Phi Phi Island Maya Bay speedboat cruise, Krabi 4-Islands tour & James Bond Island.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800",
      price: 38500,
      duration: "6 Days / 5 Nights",
      rating: 4.95,
      reviewsCount: 890,
      stay: "Phuket Patong Beach Resort (3N) + Krabi Ao Nang Resort (2N)",
      vehicle: "Chauffeured Private AC Vehicle",
      link: "/packages/thailand-6d-5n",
      highlights: ["Phi Phi Island Maya Bay", "Krabi 4-Islands Boat Tour", "James Bond Island", "Phuket Big Buddha"],
      itinerary: [
        { day: "Day 1", title: "Phuket Airport Pickup → Patong Beach Check-in", desc: "Pickup at Phuket International Airport (HKT). Check-in to Patong beach resort & Bangla Road nightlife stroll." },
        { day: "Day 2", title: "Phi Phi Island & Maya Bay Luxury Speedboat Cruise", desc: "Full day speedboat tour to Maya Bay ('The Beach'), Pileh Lagoon, Viking Cave & Monkey Beach with snorkeling." },
        { day: "Day 3", title: "James Bond Island & Phang Nga Bay Kayaking", desc: "Tour Phang Nga Bay sea caves, Panak Island & famous James Bond Island needle rock." },
        { day: "Day 4", title: "Phuket to Krabi Ferry → Ao Nang Beach", desc: "Scenic ferry transfer to Krabi. Check-in to Ao Nang resort & evening sunset night market." },
        { day: "Day 5", title: "Krabi 4-Islands Longtail Boat Tour", desc: "Island hopping tour to Phra Nang Cave Beach, Tup Island sandbar, Chicken Island & Poda Island." },
        { day: "Day 6", title: "Krabi / Phuket Airport Departure Transfer", desc: "Breakfast, souvenir shopping, and private drop-off at Krabi or Phuket Airport." }
      ],
      inclusions: ["5 Nights 4-Star Beach Resorts", "Phi Phi Island Speedboat Tour + Lunch", "Krabi 4-Islands Boat Tour", "Phuket to Krabi Transfers", "Daily Breakfast"],
      exclusions: ["Flight tickets to Thailand"]
    }
  ]
