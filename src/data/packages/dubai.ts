// src/data/packages/dubai.ts
// Canonical Data Model for Dubai Luxury & Desert Safari

  export const DUBAI_PACKAGES = [
    {
      id: "dubai-4d-3n",
      title: "Dubai Highlights & Desert Safari Express (4D/3N)",
      desc: "Short Dubai holiday featuring Burj Khalifa 124th floor, Red Dune 4x4 desert safari with BBQ dinner & Dubai Mall fountain show.",
      badge: "Express Escape",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
      price: 39500,
      duration: "4 Days / 3 Nights",
      rating: 4.88,
      reviewsCount: 410,
      stay: "Bur Dubai 4-Star City Hotel (3N)",
      vehicle: "Chauffeured Private AC SUV / Sedan",
      link: "/packages/dubai-4d-3n",
      highlights: ["Burj Khalifa 124th Floor Ticket", "Lahbab 4x4 Dune Bashing", "Desert BBQ Dinner", "Marina Walk"],
      itinerary: [
        { day: "Day 1", title: "Dubai Airport Pickup → Hotel Check-in & Marina Walk", desc: "Private pickup from Dubai Airport (DXB/DWC). Check-in to 4-star hotel. Evening walk along Dubai Marina promenade." },
        { day: "Day 2", title: "Half-Day Dubai City Tour & Burj Khalifa 124th Floor", desc: "Tour Dubai Frame, Jumeirah Beach, Burj Al Arab photo stop, Dubai Mall & At The Top 124th floor observation deck." },
        { day: "Day 3", title: "Lahbab Red Dune 4x4 Desert Safari & Camp BBQ", desc: "Afternoon 4x4 Land Cruiser pickup for dune bashing, sandboarding, camel rides, henna & live BBQ dinner with belly dance." },
        { day: "Day 4", title: "Dubai Souks Shopping → Airport Transfer", desc: "Breakfast, Gold & Spice Souk shopping, and transfer to Dubai Airport." }
      ],
      inclusions: ["3 Nights 4-Star Hotel Stay", "Burj Khalifa 124th Floor Entry Ticket", "Lahbab Red Dune Safari + BBQ Dinner", "UAE Tourist Visa Included", "Daily Breakfast"],
      exclusions: ["Flight tickets to Dubai", "Tourism Dirham Fee"]
    },
    {
      id: "dubai-5d-4n",
      title: "Dubai Spectacular & Marina Dhow Cruise (5D/4N)",
      desc: "Our best-selling Dubai tour adding luxury Marina Glass Dhow dinner cruise, Miracle Garden & Global Village.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
      price: 48500,
      duration: "5 Days / 4 Nights",
      rating: 4.95,
      reviewsCount: 890,
      stay: "Dubai Marina / Al Barsha 4-Star Hotel (4N)",
      vehicle: "Chauffeured Private AC Vehicle",
      link: "/packages/dubai-5d-4n",
      highlights: ["Marina Dhow Dinner Cruise", "Burj Khalifa 124th Floor", "Miracle Garden", "Global Village"],
      itinerary: [
        { day: "Day 1", title: "Dubai Airport Pickup → Luxury Marina Dhow Cruise", desc: "Airport pickup, hotel check-in & evening glass Dhow dinner cruise along Dubai Marina." },
        { day: "Day 2", title: "Dubai City Tour & Burj Khalifa At The Top", desc: "Jumeirah Mosque, Palm Jumeirah, Burj Khalifa 124th floor & Dubai Fountain show." },
        { day: "Day 3", title: "Miracle Garden & Red Dune 4x4 Safari", desc: "Morning tour of Miracle Garden floral displays & afternoon Lahbab dune safari with BBQ." },
        { day: "Day 4", title: "Global Village & Dubai Mall Shopping", desc: "Evening excursion to Global Village multicultural pavilions & Dubai Mall shopping." },
        { day: "Day 5", title: "Dubai Airport Departure Transfer", desc: "Breakfast, checkout, and private transfer to Dubai Airport." }
      ],
      inclusions: ["4 Nights 4-Star Hotel", "Marina Dhow Dinner Cruise", "Burj Khalifa 124th Floor Ticket", "Miracle Garden Ticket", "UAE Tourist Visa"],
      exclusions: ["Flight tickets"]
    }
  ]
