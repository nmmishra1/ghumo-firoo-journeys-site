import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Star, ShieldCheck, Hotel, Car, ShieldAlert, Utensils } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EnhancedRouteMap from '@/components/packages/EnhancedRouteMap';
import FlightRouteMap from '@/components/packages/FlightRouteMap';
import PackageSidebar from '@/components/packages/PackageSidebar';
import ModernPackageHero from '@/components/packages/ModernPackageHero';
import PackageSEO from '@/components/seo/PackageSEO';
import FAQSection from '@/components/sections/FAQSection';
import { buildTouristTripJsonLd } from '@/components/seo/JsonLd';
import NotFound from '@/pages/NotFound';
import { StickyCTA } from '@/components/common/StickyCTA';
import { HotelList } from '@/components/shared/HotelList';
import { AttractionCard } from '@/components/packages/AttractionCard';
import PackageVariantSelector, { PackageVariant } from '@/components/packages/PackageVariantSelector';
import VariantDetails from '@/components/packages/VariantDetails';
import PremiumTimeline, { cleanMojibakeText } from '@/components/packages/PremiumTimeline';
import { getDestinationFaqs } from '@/data/destinationFaqs';
import { itineraryService } from '@/services/itineraryService';

interface DynamicPackageDetailProps {
  slug?: string;
  fallbackData?: any;
  fallback?: React.ReactNode;
}

const STATIC_PACKAGE_REGISTRY: Record<string, any> = {
  "char-dham-yatra-from-delhi": {
    slug: "char-dham-yatra-from-delhi",
    name: "Char Dham Yatra from Delhi (12D/11N)",
    duration: "12 Days / 11 Nights",
    price: 35000,
    rating: 4.9,
    reviews: 186,
    image: "/Kedarnath.png",
    destinations: ["Delhi", "Haridwar", "Barkot", "Yamunotri", "Uttarkashi", "Gangotri", "Guptkashi", "Kedarnath", "Badrinath", "Rishikesh"],
    highlights: [
      "Chauffeured Pickup & Drop from Delhi Airport / Railway Station",
      "All 4 Sacred Himalayan Shrines (Yamunotri, Gangotri, Kedarnath, Badrinath)",
      "Biometric Yatra Registration & VIP Temple Queue Passes",
      "Kedarnath Night Stay near Temple with Shiv Aarti",
      "Badrivishal Tapt Kund Hot Spring Dip & Mana Border Village Tour",
      "Ganga Aarti at Har Ki Pauri Haridwar & Triveni Ghat Rishikesh"
    ],
    itinerary: [
      {
        day: 1,
        title: "Delhi Airport / Station Pickup → Drive to Haridwar → Evening Ganga Aarti",
        description: "Chauffeured pickup from Delhi Airport / Railway Station. Drive across the plains of Uttar Pradesh to the holy city of Haridwar (220 km / 6 hrs). Check-in to your hotel. In the evening, attend the world-famous Ganga Aarti at Har Ki Pauri with thousands of floating lamps.",
        activities: ["Delhi Airport/Station Pickup", "Drive to Haridwar", "Hotel Check-in", "Har Ki Pauri Evening Ganga Aarti"]
      },
      {
        day: 2,
        title: "Haridwar to Barkot via Mussoorie & Kempty Falls",
        description: "After breakfast, drive to Barkot via Mussoorie (210 km / 7 hrs). En route stop at Kempty Falls and enjoy views of the Queen of Hills. Arrive at Barkot, check-in to your mountain resort surrounded by pine forests.",
        activities: ["Mussoorie Sightseeing", "Kempty Falls Stop", "Barkot Mountain Resort Check-in", "Briefing for Yamunotri Trek"]
      },
      {
        day: 3,
        title: "Barkot → Janki Chatti → Yamunotri Dham Trek (6km) → Return to Barkot",
        description: "Early morning drive to Janki Chatti (45 km). Begin the 6 km trek to Yamunotri Dham (Pony / Palki available). Take a holy dip in natural thermal hot springs at Surya Kund, cook rice Prasad, and seek blessings at Yamunotri Temple before returning to Barkot.",
        activities: ["Janki Chatti Drive", "Yamunotri 6km Trek", "Surya Kund Thermal Springs Bath", "Yamunotri Temple Darshan", "Divya Shila Worship"]
      },
      {
        day: 4,
        title: "Barkot to Uttarkashi → Vishwanath & Shakti Temple Visit",
        description: "Drive along the Bhagirathi river to Uttarkashi (100 km / 4 hrs). Check-in to your riverside hotel. Visit Kashi Vishwanath Temple featuring the 26-foot heavy Trishul at Shakti Temple.",
        activities: ["Bhagirathi River Drive", "Uttarkashi Hotel Check-in", "Kashi Vishwanath Temple", "Shakti Temple Trishul Darshan"]
      },
      {
        day: 5,
        title: "Uttarkashi to Gangotri Dham → Sacred Dip → Return to Uttarkashi",
        description: "Excursion to Gangotri Dham (100 km each way via scenic Harsil Valley). Take a holy dip in the icy Bhagirathi River, offer prayers at Gangotri Mata Temple, and walk through Harsil apple orchards before returning to Uttarkashi.",
        activities: ["Harsil Valley Drive", "Bhagirathi River Sacred Dip", "Gangotri Mata Temple Puja", "Harsil Apple Orchard Walk"]
      },
      {
        day: 6,
        title: "Uttarkashi to Guptkashi / Phata → Yatra Registration Check",
        description: "Scenic drive across Tehri Dam reservoir to Guptkashi (220 km / 8 hrs). Check-in to your resort in the Mandakini valley. Biometric pass verification and preparation for Kedarnath trek.",
        activities: ["Tehri Dam Viewpoint", "Guptkashi Check-in", "Biometric Pass Verification", "Medical Fitness Check"]
      },
      {
        day: 7,
        title: "Guptkashi to Gaurikund → Trek / Chopper to Kedarnath Dham → Evening Aarti",
        description: "Early morning transfer to Gaurikund. Begin the 16 km trek (or helicopter shuttle from Sersi/Phata) to Kedarnath Temple at 11,755 ft. VIP temple entry, attend the magical evening Shiv Aarti, and night stay near the temple.",
        activities: ["Gaurikund Transfer", "Kedarnath Trek / Chopper Shuttle", "VIP Temple Entry", "Evening Shiv Aarti", "Night Stay near Temple"]
      },
      {
        day: 8,
        title: "Kedarnath Morning Temple Abhishekam → Trek Down to Guptkashi",
        description: "Early morning Abhishekam Puja at Kedarnath Jyotirlinga. Trek down to Gaurikund and transfer back to Guptkashi hotel for rest.",
        activities: ["Kedarnath Abhishekam Puja", "Trek Down to Gaurikund", "Guptkashi Hotel Stay"]
      },
      {
        day: 9,
        title: "Guptkashi to Badrinath Dham via Chopta Meadows & Joshimath",
        description: "Drive to Badrinath (190 km / 7 hrs) via scenic Chopta alpine meadows and Joshimath (visit Narsingh Temple). Arrive Badrinath, check-in, and attend evening Badrivishal Aarti.",
        activities: ["Chopta Meadows Drive", "Joshimath Narsingh Temple", "Badrinath Check-in", "Badrivishal Evening Aarti"]
      },
      {
        day: 10,
        title: "Badrinath Temple Darshan → Tapt Kund Dip → Mana Village Excursion",
        description: "Take a holy dip in Tapt Kund thermal springs. Morning Badrivishal Darshan. Excursion to Mana Village (India's first border village) to see Vyas Gufa, Ganesh Gufa & Saraswati River Bhim Pul.",
        activities: ["Tapt Kund Bath", "Badrivishal VIP Darshan", "Mana Village Tour", "Vyas Gufa & Bhim Pul"]
      },
      {
        day: 11,
        title: "Badrinath to Rishikesh → Devprayag Sangam & Triveni Ghat Aarti",
        description: "Drive down to Rishikesh (290 km / 9 hrs). Stop at Devprayag Sangam to see the confluence of Alaknanda & Bhagirathi forming Ganga. Check-in Rishikesh hotel and attend Triveni Ghat Ganga Aarti.",
        activities: ["Devprayag Sangam View", "Rishikesh Hotel Check-in", "Triveni Ghat Ganga Aarti"]
      },
      {
        day: 12,
        title: "Rishikesh Ram Jhula → Return Drive to Delhi for Departure",
        description: "Morning visit to Ram Jhula, Laxman Jhula & Beatles Ashram. Drive back to Delhi (230 km) for drop-off at Airport / Railway Station.",
        activities: ["Ram Jhula & Laxman Jhula", "Beatles Ashram Visit", "Delhi Airport / Station Drop-off"]
      }
    ],
    images: [
      "/Kedarnath.png",
      "/Badrinath.png",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800"
    ],
    attractions: [
      { name: "Kedarnath Dham (11,755 ft)", description: "Sacred shrine of Lord Shiva surrounded by majestic Himalayan peaks.", image: "/Kedarnath.png" },
      { name: "Badrinath Dham & Mana", description: "Abode of Lord Vishnu, thermal Tapt Kund & India's first border village.", image: "/Badrinath.png" },
      { name: "Gangotri & Harsil Valley", description: "Origin of Holy River Ganges amidst scenic Harsil apple orchards.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800" },
      { name: "Yamunotri & Surya Kund", description: "First Himalayan shrine with natural thermal hot springs at Surya Kund.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800" },
      { name: "Devprayag Sangam", description: "Sacred confluence where rivers Alaknanda & Bhagirathi meet to form River Ganges.", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800" }
    ],
    inclusions: [
      "Private Chauffeured AC SUV / Sedan from Delhi for 12 Days",
      "11 Nights Accommodation in 3-Star/4-Star Hotels & Kedarnath VIP Hill Lodge",
      "Mandatory Uttarakhand Biometric Registration & VIP E-Passes",
      "Daily Pure Vegetarian Breakfast & Dinners Included",
      "Excursions to Mana Village, Kempty Falls, Devprayag & Ganga Aarti"
    ],
    exclusions: [
      "Train / Flight tickets to Delhi",
      "Pony / Palki / Helicopter shuttle charges at Kedarnath & Yamunotri",
      "GST / TCS extra as applicable"
    ],
    hotels: [
      { name: "Haridwar Ganga Resort", location: "Haridwar", stars: 4, room_type: "Deluxe AC Room", meal_plan: "MAP (Breakfast & Dinner)" },
      { name: "Barkot Himalayan Lodge", location: "Barkot", stars: 3, room_type: "Valley View Cottage", meal_plan: "MAP (Breakfast & Dinner)" },
      { name: "Uttarkashi Riverside Hotel", location: "Uttarkashi", stars: 3, room_type: "River View Room", meal_plan: "MAP (Breakfast & Dinner)" },
      { name: "Guptkashi Valley Resort", location: "Guptkashi", stars: 4, room_type: "Executive AC Cottage", meal_plan: "MAP (Breakfast & Dinner)" },
      { name: "Kedarnath VIP Temple Lodge", location: "Kedarnath Dham", stars: 3, room_type: "Triple / Quad VIP Lodge", meal_plan: "Warm Meals Included" },
      { name: "Badrinath Grand Hotel", location: "Badrinath Dham", stars: 4, room_type: "Deluxe Temple View", meal_plan: "MAP (Breakfast & Dinner)" },
      { name: "Rishikesh Heritage Hotel", location: "Rishikesh", stars: 4, room_type: "Deluxe Room", meal_plan: "Breakfast Included" }
    ]
  },
  "char-dham-yatra-from-haridwar": {
    slug: "char-dham-yatra-from-haridwar",
    name: "Char Dham Yatra from Haridwar (10D/9N)",
    duration: "10 Days / 9 Nights",
    price: 28500,
    rating: 4.9,
    reviews: 215,
    image: "/Badrinath.png",
    destinations: ["Haridwar", "Barkot", "Yamunotri", "Uttarkashi", "Gangotri", "Guptkashi", "Kedarnath", "Badrinath", "Rudraprayag", "Rishikesh"],
    highlights: [
      "Classic 10-Day Road Circuit starting & ending at Haridwar / Rishikesh",
      "All 4 Sacred Himalayan Shrines (Yamunotri, Gangotri, Kedarnath, Badrinath)",
      "Biometric Yatra Permits & VIP Temple Queue Passes Included",
      "Kedarnath VIP Hill Lodge Stay near Temple with Evening Shiv Aarti",
      "Badrinath Tapt Kund Bath & Mana First Indian Village Excursion",
      "Har Ki Pauri Evening Ganga Aarti Reception"
    ],
    itinerary: [
      {
        day: 1,
        title: "Haridwar Pickup → Drive to Barkot via Mussoorie & Kempty Falls",
        description: "Chauffeured pickup from Haridwar Railway Station / Hotel. Scenic mountain drive to Barkot (215 km / 7 hrs) via Mussoorie and Kempty Falls. Check-in to Barkot deluxe hotel surrounded by pine valleys.",
        activities: ["Haridwar Station Pickup", "Mussoorie Kempty Falls Stop", "Barkot Hotel Check-in", "Yamunotri Yatra Orientation"]
      },
      {
        day: 2,
        title: "Barkot → Janki Chatti → Yamunotri Dham Trek (6km) & Surya Kund → Return Barkot",
        description: "Early morning transfer to Janki Chatti (45 km). Trek 6 km to Yamunotri Dham. Take a sacred bath in thermal hot springs at Surya Kund, cook rice Prasad, offer prayers at Yamunotri Temple, and return to Barkot.",
        activities: ["Janki Chatti Transfer", "Yamunotri 6km Trek", "Surya Kund Thermal Bath", "Yamunotri Temple Darshan", "Divya Shila Worship"]
      },
      {
        day: 3,
        title: "Barkot to Uttarkashi → Vishwanath Temple & Shakti Temple",
        description: "Drive along the flowing Bhagirathi river to Uttarkashi (100 km / 4 hrs). Check-in to hotel. Visit Kashi Vishwanath Temple and Shakti Temple with its giant 26-foot divine Trishul.",
        activities: ["Bhagirathi River Drive", "Uttarkashi Hotel Check-in", "Kashi Vishwanath Temple", "Shakti Temple Trishul Darshan"]
      },
      {
        day: 4,
        title: "Uttarkashi to Gangotri Dham → Bhagirathi Sacred Dip → Return Uttarkashi",
        description: "Full day excursion to Gangotri Dham via the scenic apple orchard valley of Harsil (100 km each way). Holy dip in icy Bhagirathi River, Gangotri Mata Temple Darshan, and return to Uttarkashi.",
        activities: ["Harsil Valley Drive", "Bhagirathi River Sacred Dip", "Gangotri Temple Darshan", "Harsil Apple Orchard Walk"]
      },
      {
        day: 5,
        title: "Uttarkashi to Guptkashi / Phata → Tehri Dam & Mandakini Valley",
        description: "Drive to Guptkashi (220 km / 8 hrs) via Tehri Dam reservoir view. Arrive at Mandakini valley, hotel check-in, and biometric permit verification for Kedarnath trek.",
        activities: ["Tehri Dam Viewpoint", "Guptkashi Hotel Check-in", "Biometric Pass Verification", "Kedarnath Preparation"]
      },
      {
        day: 6,
        title: "Guptkashi to Gaurikund → Trek / Chopper to Kedarnath Dham → Evening Shiv Aarti",
        description: "Early morning transfer to Gaurikund. Trek 16 km (or chopper shuttle from Sersi/Phata) to Kedarnath Temple at 11,755 ft. VIP temple queue entry, evening Shiv Aarti, and night stay near temple.",
        activities: ["Gaurikund Transfer", "Kedarnath Trek / Chopper Shuttle", "VIP Temple Entry", "Evening Shiv Aarti", "Night Stay near Temple"]
      },
      {
        day: 7,
        title: "Kedarnath Morning Temple Abhishekam → Trek Down to Guptkashi",
        description: "Early morning Abhishekam Puja at Kedarnath Jyotirlinga. Trek down to Gaurikund and transfer back to Guptkashi hotel for rest.",
        activities: ["Kedarnath Abhishekam Puja", "Trek Down to Gaurikund", "Guptkashi Hotel Stay"]
      },
      {
        day: 8,
        title: "Guptkashi to Badrinath Dham → Chopta Meadows & Badrivishal Evening Aarti",
        description: "Drive to Badrinath (190 km / 7 hrs) via scenic Chopta alpine meadows and Joshimath Narsingh Temple. Arrive Badrinath, Tapt Kund thermal dip, and evening Badrivishal Aarti.",
        activities: ["Chopta Meadows Drive", "Joshimath Narsingh Temple", "Tapt Kund Bath", "Badrivishal Evening Aarti"]
      },
      {
        day: 9,
        title: "Badrinath Morning Darshan → Mana Village Excursion → Drive to Rudraprayag",
        description: "Morning Puja at Badrinath Temple. Tour Mana Village (India's first border village) to see Vyas Gufa, Ganesh Gufa & Saraswati River Bhim Pul. Afternoon drive to Rudraprayag hotel.",
        activities: ["Badrivishal Morning Puja", "Mana Village Tour", "Vyas Gufa & Bhim Pul", "Drive to Rudraprayag Hotel"]
      },
      {
        day: 10,
        title: "Rudraprayag to Haridwar / Rishikesh Drop-off via Devprayag Sangam",
        description: "Drive to Haridwar (160 km / 5 hrs). En route stop at Devprayag Sangam (Alaknanda & Bhagirathi confluence). Drop-off at Haridwar Railway Station / Rishikesh for return journey.",
        activities: ["Devprayag Sangam View", "Rishikesh Ram Jhula Stop", "Haridwar Station Drop-off"]
      }
    ],
    images: [
      "/Badrinath.png",
      "/Kedarnath.png",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800"
    ],
    attractions: [
      { name: "Badrinath Dham & Mana Village", description: "Holy abode of Lord Vishnu, Tapt Kund hot springs & Mana first border village.", image: "/Badrinath.png" },
      { name: "Kedarnath Dham (11,755 ft)", description: "Lord Shiva Jyotirlinga surrounded by majestic Himalayan snow peaks.", image: "/Kedarnath.png" },
      { name: "Gangotri & Harsil Valley", description: "Origin of River Ganges amidst scenic Harsil apple orchards.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800" },
      { name: "Yamunotri & Surya Kund", description: "First Himalayan shrine with thermal hot springs at Surya Kund.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800" },
      { name: "Devprayag & Rudraprayag Sangam", description: "Sacred Panch Prayag confluences forming the Holy River Ganges.", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800" }
    ],
    inclusions: [
      "Dedicated AC Chauffeured Vehicle from Haridwar for 10 Days",
      "9 Nights Deluxe Accommodation (including Kedarnath VIP Temple Lodge)",
      "Mandatory Biometric Yatra Permits & VIP Temple Queue Passes",
      "Daily Pure Vegetarian Breakfast & Dinners",
      "Excursions to Mana Village, Kempty Falls, Chopta & Devprayag"
    ],
    exclusions: [
      "Travel fare to Haridwar",
      "Helicopter shuttle or Pony / Palki charges",
      "GST / TCS extra as applicable"
    ],
    hotels: [
      { name: "Barkot Himalayan Resort", location: "Barkot", stars: 3, room_type: "Valley View Cottage", meal_plan: "Breakfast & Dinner" },
      { name: "Uttarkashi Riverside Hotel", location: "Uttarkashi", stars: 3, room_type: "River View Room", meal_plan: "Breakfast & Dinner" },
      { name: "Guptkashi Valley Resort", location: "Guptkashi", stars: 4, room_type: "Executive AC Cottage", meal_plan: "Breakfast & Dinner" },
      { name: "Kedarnath VIP Temple Lodge", location: "Kedarnath Dham", stars: 3, room_type: "Triple / Quad VIP Lodge", meal_plan: "Warm Meals Included" },
      { name: "Badrinath Grand Hotel", location: "Badrinath Dham", stars: 4, room_type: "Deluxe Temple View", meal_plan: "Breakfast & Dinner" },
      { name: "Rudraprayag Sangam Hotel", location: "Rudraprayag", stars: 3, room_type: "River View Room", meal_plan: "Breakfast & Dinner" }
    ]
  },
  "do-dham-yatra": {
    slug: "do-dham-yatra",
    name: "Do Dham Kedarnath & Badrinath (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 22500,
    rating: 4.9,
    reviews: 168,
    image: "/Badrinath.png",
    destinations: ["Haridwar", "Guptkashi", "Kedarnath", "Badrinath", "Joshimath", "Rishikesh"],
    highlights: [
      "Specialized 5-Day Focus Pilgrimage to Kedarnath & Badrinath",
      "Available via Chauffeured AC Road Vehicle or Helicopter Shuttle Flight",
      "Biometric Yatra Registration Permits & VIP Temple Queue Passes",
      "Kedarnath VIP Hill Lodge Stay near Temple with Shiv Aarti",
      "Badrinath Tapt Kund Bath & Mana First Indian Village Tour",
      "Panch Prayag River Confluences (Rudraprayag, Devprayag)"
    ],
    itinerary: [
      {
        day: 1,
        title: "Haridwar / Dehradun Pickup → Drive to Guptkashi",
        description: "Chauffeured pickup from Haridwar Railway Station / Dehradun. Drive through the scenic Mandakini river valley to Guptkashi (210 km / 7 hrs). Check-in to hotel, biometric permit verification, and briefing for Kedarnath trek.",
        activities: ["Haridwar/Dehradun Pickup", "Mandakini Valley Drive", "Guptkashi Hotel Check-in", "Kedarnath Yatra Orientation"]
      },
      {
        day: 2,
        title: "Guptkashi to Gaurikund → Trek / Chopper to Kedarnath Dham → Evening Aarti",
        description: "Early morning transfer to Gaurikund. Trek 16 km (or chopper shuttle flight from Sersi/Phata helipad) to Kedarnath Temple at 11,755 ft. VIP temple queue entry, evening Shiv Aarti, and night stay near the temple.",
        activities: ["Gaurikund Transfer", "Kedarnath Trek / Chopper Shuttle", "VIP Temple Entry", "Evening Shiv Aarti", "Night Stay near Temple"]
      },
      {
        day: 3,
        title: "Kedarnath Morning Temple Abhishekam → Trek Down to Guptkashi",
        description: "Early morning Abhishekam Puja at Kedarnath Jyotirlinga. Trek down to Gaurikund and transfer back to Guptkashi hotel for rest and relaxation.",
        activities: ["Kedarnath Abhishekam Puja", "Trek Down to Gaurikund", "Guptkashi Hotel Stay"]
      },
      {
        day: 4,
        title: "Guptkashi to Badrinath Dham via Chopta Meadows & Joshimath",
        description: "Drive to Badrinath (190 km / 7 hrs) via scenic Chopta alpine meadows and Joshimath (visit Narsingh Temple). Arrive Badrinath, take a holy dip in thermal hot springs at Tapt Kund, and attend evening Badrivishal Aarti.",
        activities: ["Chopta Meadows Drive", "Joshimath Narsingh Temple", "Tapt Kund Thermal Dip", "Badrivishal Evening Aarti"]
      },
      {
        day: 5,
        title: "Badrinath Morning Darshan → Mana Village → Haridwar / Rishikesh Drop-off",
        description: "Morning Puja at Badrinath Temple. Tour Mana Village (India's first border village) to see Vyas Gufa, Ganesh Gufa & Saraswati River Bhim Pul. Drive back via Devprayag Sangam to Haridwar/Rishikesh for drop-off.",
        activities: ["Badrivishal Morning Puja", "Mana Village Tour", "Devprayag Sangam View", "Haridwar Station Drop-off"]
      }
    ],
    images: [
      "/Badrinath.png",
      "/Kedarnath.png",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800"
    ],
    attractions: [
      { name: "Kedarnath Dham (11,755 ft)", description: "Lord Shiva Jyotirlinga shrine surrounded by majestic Himalayan snow peaks.", image: "/Kedarnath.png" },
      { name: "Badrinath Dham & Mana", description: "Abode of Lord Vishnu, thermal hot springs at Tapt Kund & Mana first Indian border village.", image: "/Badrinath.png" },
      { name: "Chopta Meadows", description: "Mini Switzerland of Uttarakhand with lush alpine bugyals.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800" },
      { name: "Devprayag Sangam", description: "Sacred confluence where rivers Alaknanda & Bhagirathi meet to form River Ganges.", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800" }
    ],
    inclusions: [
      "Dedicated Private AC Chauffeured Vehicle for 5 Days",
      "4 Nights Accommodation (Guptkashi 2N, Kedarnath VIP Lodge 1N, Badrinath 1N)",
      "Mandatory Biometric Yatra Permits & VIP Temple Queue Passes",
      "Daily Pure Vegetarian Breakfast & Dinners",
      "Excursions to Mana Village, Chopta Meadows & Devprayag"
    ],
    exclusions: [
      "Travel fare to Haridwar / Dehradun",
      "Helicopter shuttle or Pony / Palki charges",
      "GST / TCS extra as applicable"
    ],
    hotels: [
      { name: "Guptkashi Valley Resort", location: "Guptkashi", stars: 4, room_type: "Executive AC Cottage", meal_plan: "Breakfast & Dinner" },
      { name: "Kedarnath VIP Temple Lodge", location: "Kedarnath Dham", stars: 3, room_type: "Triple / Quad VIP Lodge", meal_plan: "Warm Meals Included" },
      { name: "Badrinath Grand Hotel", location: "Badrinath Dham", stars: 4, room_type: "Deluxe Temple View", meal_plan: "Breakfast & Dinner" }
    ]
  },
  "kedarnath-yatra": {
    slug: "kedarnath-yatra",
    name: "Kedarnath Ek Dham Yatra (4D/3N)",
    duration: "4 Days / 3 Nights",
    price: 14500,
    rating: 4.9,
    reviews: 198,
    image: "/Kedarnath.png",
    destinations: ["Haridwar", "Guptkashi", "Gaurikund", "Kedarnath Dham", "Rishikesh"],
    highlights: [
      "Dedicated 4-Day Pilgrimage to Lord Shiva's Sacred Jyotirlinga at 11,755 ft",
      "Trek from Gaurikund or Helicopter Shuttle Flight from Sersi/Phata Helipad",
      "Biometric Yatra Permit Registration & VIP Temple Entry Passes",
      "Kedarnath VIP Hill Lodge Stay near Temple with Evening Shiv Aarti",
      "Early Morning Abhishekam Puja & Bhairavnath Temple Visit",
      "Chauffeured AC Mountain Vehicle from Haridwar / Dehradun"
    ],
    itinerary: [
      {
        day: 1,
        title: "Haridwar / Dehradun Pickup → Drive to Guptkashi / Phata",
        description: "Chauffeured pickup from Haridwar Railway Station / Dehradun Airport. Drive along the Mandakini river valley to Guptkashi (210 km / 7 hrs). Check-in to your hotel, biometric Yatra permit check, and briefing for Kedarnath trek.",
        activities: ["Haridwar/Dehradun Pickup", "Mandakini River Valley Drive", "Guptkashi Hotel Check-in", "Biometric Pass Verification"]
      },
      {
        day: 2,
        title: "Guptkashi to Gaurikund → Trek / Chopper to Kedarnath Dham → Evening Aarti",
        description: "Early morning transfer to Gaurikund (30 km). Begin the 16 km trek (or helicopter shuttle flight from Sersi/Phata) to Kedarnath Temple at 11,755 ft. Check-in to your VIP temple lodge. Attend the magical evening Shiv Aarti and seek blessings at the Jyotirlinga.",
        activities: ["Gaurikund Transfer", "Kedarnath 16km Trek / Chopper Shuttle", "Kedarnath VIP Lodge Check-in", "VIP Temple Entry", "Evening Shiv Aarti"]
      },
      {
        day: 3,
        title: "Kedarnath Morning Temple Abhishekam → Bhairavnath Visit → Trek Down to Guptkashi",
        description: "Early morning Abhishekam Puja at Kedarnath Temple. Short hike to Bhairavnath Temple for panoramic valley views. Trek down to Gaurikund and transfer back to Guptkashi hotel for rest.",
        activities: ["Kedarnath Morning Abhishekam Puja", "Bhairavnath Temple Hike", "Trek Down to Gaurikund", "Guptkashi Hotel Stay"]
      },
      {
        day: 4,
        title: "Guptkashi to Haridwar / Rishikesh Drop-off via Devprayag Sangam",
        description: "Post breakfast, scenic return drive to Haridwar (210 km / 7 hrs). En route stop at Devprayag Sangam (confluence of Alaknanda & Bhagirathi). Drop-off at Haridwar Railway Station / Rishikesh for return departure.",
        activities: ["Devprayag Sangam Stop", "Rishikesh Ram Jhula Visit", "Haridwar Station Drop-off"]
      }
    ],
    images: [
      "/Kedarnath.png",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800"
    ],
    attractions: [
      { name: "Kedarnath Temple (11,755 ft)", description: "One of the 12 sacred Jyotirlingas of Lord Shiva surrounded by snow peaks.", image: "/Kedarnath.png" },
      { name: "Bhairavnath Temple", description: "Protector deity shrine located on a hilltop offering panoramic Kedarnath valley views.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800" },
      { name: "Devprayag Sangam", description: "Holy river confluence of Alaknanda & Bhagirathi forming the River Ganges.", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800" }
    ],
    inclusions: [
      "Private Chauffeured AC SUV / Sedan from Haridwar for 4 Days",
      "3 Nights Accommodation (Guptkashi 2N + Kedarnath VIP Temple Lodge 1N)",
      "Mandatory Biometric Yatra Permit & VIP Temple Queue Passes",
      "Daily Pure Vegetarian Breakfast & Dinners Included",
      "Devprayag Sangam & Rishikesh Sightseeing"
    ],
    exclusions: [
      "Travel fare to Haridwar / Dehradun",
      "Helicopter shuttle ticket or Pony / Palki charges",
      "GST / TCS extra as applicable"
    ],
    hotels: [
      { name: "Guptkashi Valley Resort", location: "Guptkashi", stars: 4, room_type: "Executive AC Cottage", meal_plan: "Breakfast & Dinner" },
      { name: "Kedarnath VIP Temple Lodge", location: "Kedarnath Dham", stars: 3, room_type: "Triple / Quad VIP Lodge", meal_plan: "Warm Meals Included" }
    ]
  },
  "badrinath-yatra": {
    slug: "badrinath-yatra",
    name: "Badrinath Ek Dham Yatra (3D/2N)",
    duration: "3 Days / 2 Nights",
    price: 12500,
    rating: 4.9,
    reviews: 174,
    image: "/Badrinath.png",
    destinations: ["Haridwar", "Joshimath", "Badrinath Dham", "Mana Village", "Rishikesh"],
    highlights: [
      "Direct Smooth Road Access to Lord Vishnu's Abode at 10,279 ft (No Trekking Required)",
      "Holy Dip in Thermal Hot Springs at Tapt Kund before Temple Darshan",
      "Special Badrivishal Abhishekam Puja & Evening Swarna Aarti",
      "Excursion to Mana Village — First Village of India (Vyas Gufa, Ganesh Gufa & Bhim Pul)",
      "Panch Prayag Confluences & Narsingh Temple Visit at Joshimath"
    ],
    itinerary: [
      {
        day: 1,
        title: "Haridwar / Dehradun Pickup → Drive to Joshimath via Devprayag Sangam",
        description: "Chauffeured pickup from Haridwar Railway Station / Dehradun. Drive along river confluences to Joshimath (275 km / 8 hrs). En route stop at Devprayag Sangam. Check-in to Joshimath hotel and visit winter seat Narsingh Temple.",
        activities: ["Haridwar/Dehradun Pickup", "Devprayag Sangam View", "Joshimath Hotel Check-in", "Narsingh Temple Visit"]
      },
      {
        day: 2,
        title: "Joshimath to Badrinath Dham → Tapt Kund Bath → Badrivishal Darshan & Mana Village",
        description: "Morning drive to Badrinath (45 km). Take a holy dip in thermal hot springs at Tapt Kund. Badrivishal VIP Darshan. Excursion to Mana Village (India's first border village) to explore Vyas Gufa, Ganesh Gufa & Saraswati River Bhim Pul. Evening Swarna Aarti & night stay at Badrinath.",
        activities: ["Tapt Kund Hot Spring Dip", "Badrivishal VIP Darshan", "Mana First Indian Village Tour", "Vyas Gufa & Bhim Pul", "Evening Swarna Aarti"]
      },
      {
        day: 3,
        title: "Badrinath Morning Aarti → Return Drive to Haridwar / Rishikesh Drop-off",
        description: "Early morning Darshan at Badrinath Temple. Scenic return drive to Haridwar/Rishikesh (300 km / 9 hrs) with drop-off at Airport / Railway Station.",
        activities: ["Badrinath Morning Darshan", "Rishikesh Ram Jhula Stop", "Haridwar Station Drop-off"]
      }
    ],
    images: [
      "/Badrinath.png",
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800"
    ],
    attractions: [
      { name: "Badrinath Temple (10,279 ft)", description: "Sacred abode of Lord Vishnu on the banks of Alaknanda River.", image: "/Badrinath.png", destinationTag: "Badrinath Dham" },
      { name: "Tapt Kund Hot Springs", description: "Natural thermal sulfur springs for purifying dip prior to temple Darshan.", image: "/Badrinath.png", destinationTag: "Badrinath Dham" },
      { name: "Mana Village & Vyas Gufa", description: "India's first border village where Maharishi Vyas composed the Mahabharata.", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800", destinationTag: "Mana Border" },
      { name: "Devprayag Sangam & Narsingh Temple", description: "Confluence of Bhagirathi & Alaknanda rivers forming the holy Ganga.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800", destinationTag: "Joshimath" }
    ],
    inclusions: [
      "Private Chauffeured AC SUV / Sedan from Haridwar for 3 Days",
      "2 Nights Accommodation (Joshimath 1N + Badrinath Hotel 1N)",
      "Mandatory Biometric Yatra Permit & VIP Temple Queue Passes",
      "Daily Pure Vegetarian Breakfast & Dinners Included",
      "Excursions to Mana Village & Narsingh Temple"
    ],
    exclusions: ["Train / Flight tickets", "Personal Puja offerings", "GST / TCS extra as applicable"],
    hotels: [
      { name: "Joshimath Himalayan Abode / Grand Hotel", location: "Joshimath (Night 1)", destinationTag: "Joshimath", stars: 3, room_type: "Deluxe Mountain View", meal_plan: "Breakfast & Dinner Included" },
      { name: "Sarovar Portico / Snow Crest Badrinath", location: "Badrinath (Night 2)", destinationTag: "Badrinath Dham", stars: 4, room_type: "Deluxe Temple View Suite", meal_plan: "Pure Veg Breakfast & Dinner" }
    ]
  },
  "gangotri-yatra": {
    slug: "gangotri-yatra",
    name: "Gangotri Ek Dham Yatra (3D/2N)",
    duration: "3 Days / 2 Nights",
    price: 11500,
    rating: 4.8,
    reviews: 145,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
    destinations: ["Haridwar", "Uttarkashi", "Harsil Valley", "Gangotri Dham", "Rishikesh"],
    highlights: [
      "Dedicated 3-Day Pilgrimage to Sacred Ganga River Origin at 10,200 ft",
      "Drive through Picturesque Harsil Apple Orchard Valley & Deodar Forests",
      "Holy Dip in Sacred Bhagirathi River & Gangotri Mata Temple Darshan",
      "Kashi Vishwanath Temple & Shakti Temple 26ft Trishul Visit at Uttarkashi",
      "Biometric Yatra Registration & Chauffeured AC Mountain Car"
    ],
    itinerary: [
      {
        day: 1,
        title: "Haridwar / Dehradun Pickup → Drive to Uttarkashi",
        description: "Chauffeured pickup from Haridwar / Dehradun. Drive along the Bhagirathi river valley to Uttarkashi (175 km / 6 hrs). Check-in to riverside hotel. Visit Kashi Vishwanath Temple & Shakti Temple.",
        activities: ["Haridwar Pickup", "Bhagirathi Valley Drive", "Uttarkashi Check-in", "Kashi Vishwanath Temple"]
      },
      {
        day: 2,
        title: "Uttarkashi to Gangotri Dham via Harsil Valley → Bhagirathi Dip → Return Uttarkashi",
        description: "Early morning drive to Gangotri Dham (100 km) via scenic Harsil Valley. Take a holy dip in the icy Bhagirathi River. Attend Gangotri Mata Temple Darshan & Puja. Walk through Harsil apple orchards before returning to Uttarkashi.",
        activities: ["Harsil Valley Drive", "Bhagirathi River Dip", "Gangotri Mata Temple Darshan", "Harsil Apple Orchard Walk"]
      },
      {
        day: 3,
        title: "Uttarkashi to Haridwar / Rishikesh Drop-off",
        description: "Breakfast, scenic drive back to Haridwar/Rishikesh (175 km) with drop-off at Airport / Railway Station.",
        activities: ["Chamba Viewpoint", "Rishikesh Stop", "Haridwar Station Drop-off"]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800"
    ],
    attractions: [
      { name: "Gangotri Mata Temple (10,200 ft)", description: "White granite shrine marking the sacred origin of River Ganga.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800" },
      { name: "Harsil Apple Valley", description: "Picturesque Himalayan hamlet famous for deodar pine forests and apple orchards.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800" }
    ],
    inclusions: [
      "Private AC Chauffeured Vehicle from Haridwar for 3 Days",
      "2 Nights Accommodation in Uttarkashi Riverside Hotel",
      "Biometric Yatra Permits & VIP Temple Passes",
      "Daily Pure Vegetarian Breakfast & Dinners"
    ],
    exclusions: ["Train / Flight tickets", "Personal expenses"],
    hotels: [{ name: "Uttarkashi Riverside Hotel", location: "Uttarkashi", stars: 3, room_type: "River View Room", meal_plan: "Breakfast & Dinner" }]
  },
  "yamunotri-yatra": {
    slug: "yamunotri-yatra",
    name: "Yamunotri Ek Dham Yatra (3D/2N)",
    duration: "3 Days / 2 Nights",
    price: 11500,
    rating: 4.8,
    reviews: 136,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
    destinations: ["Haridwar", "Mussoorie", "Barkot", "Janki Chatti", "Yamunotri Dham"],
    highlights: [
      "First Shrine of Garhwal Himalayan Pilgrimage at 10,804 ft",
      "6km Trek from Janki Chatti to Yamunotri (Pony / Palki Available)",
      "Thermal Springs Bath at Surya Kund & Cooking Prasad in Boiling Water",
      "Divya Shila Rock Worship & Yamuna River Source Dip",
      "Mussoorie Kempty Falls En-route Stop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Haridwar / Dehradun Pickup → Drive to Barkot via Mussoorie & Kempty Falls",
        description: "Chauffeured pickup from Haridwar / Dehradun. Scenic drive via Mussoorie and Kempty Falls to Barkot (215 km / 7 hrs). Check-in to Barkot hotel surrounded by pine trees.",
        activities: ["Haridwar Pickup", "Mussoorie Kempty Falls", "Barkot Hotel Check-in"]
      },
      {
        day: 2,
        title: "Barkot → Janki Chatti → Yamunotri 6km Trek & Surya Kund → Return Barkot",
        description: "Early morning drive to Janki Chatti (45 km). Trek 6 km to Yamunotri Dham. Sacred bath at Surya Kund thermal hot springs, cook rice Prasad, temple Darshan & return Barkot.",
        activities: ["Janki Chatti Transfer", "Yamunotri 6km Trek", "Surya Kund Hot Spring Bath", "Yamunotri Temple Darshan", "Divya Shila Puja"]
      },
      {
        day: 3,
        title: "Barkot to Haridwar / Rishikesh Drop-off",
        description: "Breakfast, scenic drive back to Haridwar/Rishikesh (215 km) with drop-off at Airport / Railway Station.",
        activities: ["Barkot Breakfast", "Haridwar Station Drop-off"]
      }
    ],
    images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800"],
    attractions: [
      { name: "Yamunotri Temple (10,804 ft)", description: "First shrine of Char Dham circuit dedicated to Goddess Yamuna.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800" },
      { name: "Surya Kund Hot Springs", description: "Natural boiling thermal springs where devotees cook rice Prasad.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800" }
    ],
    inclusions: ["Private AC Chauffeured Vehicle for 3 Days", "2 Nights Barkot Hotel Stay", "Biometric Yatra Permits", "Daily Breakfast & Dinner"],
    exclusions: ["Pony / Palki charges", "Personal expenses"],
    hotels: [{ name: "Barkot Himalayan Resort", location: "Barkot", stars: 3, room_type: "Valley View Cottage", meal_plan: "Breakfast & Dinner" }]
  },
  "gangotri-yamunotri-tour": {
    slug: "gangotri-yamunotri-tour",
    name: "Do Dham Gangotri & Yamunotri (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 18500,
    rating: 4.9,
    reviews: 162,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
    destinations: ["Haridwar", "Barkot", "Yamunotri", "Uttarkashi", "Gangotri", "Harsil", "Rishikesh"],
    highlights: [
      "Sacred River Circuit Covering Origins of Holy Yamuna & Ganga Rivers",
      "Yamunotri 6km Trek & Surya Kund Boiling Hot Springs Bath",
      "Gangotri Mata Temple Darshan & Holy Bhagirathi Dip via Harsil Valley",
      "Kashi Vishwanath Temple Visit at Uttarkashi",
      "Private AC Chauffeured Vehicle from Haridwar"
    ],
    itinerary: [
      {
        day: 1,
        title: "Haridwar Pickup → Drive to Barkot via Mussoorie Kempty Falls",
        description: "Pickup at Haridwar. Drive via Mussoorie and Kempty Falls to Barkot (215 km). Hotel check-in and briefing.",
        activities: ["Haridwar Pickup", "Kempty Falls Stop", "Barkot Hotel Check-in"]
      },
      {
        day: 2,
        title: "Barkot → Janki Chatti → Yamunotri 6km Trek & Surya Kund → Return Barkot",
        description: "Transfer to Janki Chatti, 6km trek to Yamunotri Temple, Surya Kund bath, temple Puja and return to Barkot.",
        activities: ["Yamunotri Trek", "Surya Kund Thermal Bath", "Yamunotri Temple Darshan"]
      },
      {
        day: 3,
        title: "Barkot to Uttarkashi → Kashi Vishwanath Temple",
        description: "Drive along Bhagirathi river to Uttarkashi (100 km). Check-in hotel and visit Vishwanath Temple.",
        activities: ["Bhagirathi River Drive", "Uttarkashi Hotel Check-in", "Vishwanath Temple Visit"]
      },
      {
        day: 4,
        title: "Uttarkashi to Gangotri Temple via Harsil Valley → Return Uttarkashi",
        description: "Excursion to Gangotri (100 km each way). Bhagirathi river dip, Gangotri Mata temple Darshan & Harsil apple orchard walk.",
        activities: ["Harsil Valley Drive", "Bhagirathi River Dip", "Gangotri Temple Darshan"]
      },
      {
        day: 5,
        title: "Uttarkashi to Haridwar / Rishikesh Drop-off",
        description: "Breakfast and scenic return drive to Haridwar/Rishikesh for drop-off.",
        activities: ["Rishikesh Stop", "Haridwar Station Drop-off"]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800"
    ],
    attractions: [
      { name: "Gangotri Mata Temple (10,200 ft)", description: "White granite shrine marking the sacred origin of River Ganga.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800" },
      { name: "Yamunotri Temple (10,804 ft)", description: "First shrine of Char Dham circuit with thermal hot springs at Surya Kund.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800" },
      { name: "Harsil Apple Valley", description: "Enchanting apple orchard valley surrounded by deodar pine forests.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800" }
    ],
    inclusions: [
      "Private AC Chauffeured Vehicle from Haridwar for 5 Days",
      "4 Nights Accommodation (Barkot 2N + Uttarkashi 2N)",
      "Biometric Yatra Permits & VIP Temple Passes",
      "Daily Pure Vegetarian Breakfast & Dinners"
    ],
    exclusions: ["Pony / Palki charges", "Personal expenses"],
    hotels: [
      { name: "Barkot Himalayan Resort", location: "Barkot", stars: 3, room_type: "Valley View Cottage", meal_plan: "Breakfast & Dinner" },
      { name: "Uttarkashi Riverside Hotel", location: "Uttarkashi", stars: 3, room_type: "River View Room", meal_plan: "Breakfast & Dinner" }
    ]
  },
  "europe-switzerland": {
    slug: "europe-switzerland",
    name: "Switzerland Alpine Luxury Tour (7D/6N)",
    duration: "7 Days / 6 Nights",
    price: 185000,
    rating: 4.9,
    reviews: 245,
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800",
    destinations: ["Zurich", "Lucerne", "Interlaken", "Jungfraujoch", "Zermatt & Matterhorn", "Geneva"],
    highlights: [
      "Swiss Travel Pass 1st Class Unlimited Train & Mountain Railways",
      "Jungfraujoch — Top of Europe (11,333 ft) High Altitude Cogwheel Train",
      "Zermatt & Gornergrat Railway with Iconic Matterhorn Views",
      "Lucerne Chapel Bridge & Lake Lucerne Scenic Steamboat Cruise",
      "Interlaken Adventure & Grindelwald First Cliff Walk"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Zurich → Scenic Train to Lucerne → Chapel Bridge & Old Town",
        description: "Arrival at Zurich Airport. Activate your Swiss Travel Pass 1st Class. Board the scenic train along Lake Zurich to Lucerne (45 mins). Check-in to 4-star lakefront resort. Stroll across medieval Kapellbrucke (Chapel Bridge) & Lion Monument.",
        activities: ["Zurich Airport Reception", "1st Class Swiss Travel Pass", "Lucerne Lakefront Hotel Check-in", "Chapel Bridge Stroll", "Welcome Cheese Fondue Dinner"]
      },
      {
        day: 2,
        title: "Mount Titlis Rotair Cable Car & Cliff Walk → Lake Lucerne Cruise",
        description: "Excursion to Engelberg. Ride the world's first revolving cable car — Titlis Rotair — up to 10,000 ft. Experience Titlis Cliff Walk & Ice Flyer chairlift. Afternoon steamboat cruise on Lake Lucerne.",
        activities: ["Engelberg Scenic Train", "Mount Titlis Rotair Revolving Chopper", "Titlis Cliff Walk", "Ice Flyer Glacier Ride", "Lake Lucerne Steamboat Cruise"]
      },
      {
        day: 3,
        title: "Lucerne to Interlaken via GoldenPass Express → Lake Thun Cruise",
        description: "Board the iconic GoldenPass Express panoramic train through Brunig Pass to Interlaken between Lake Thun and Lake Brienz. Check-in to Interlaken luxury hotel.",
        activities: ["GoldenPass Express Panoramic Train", "Brunig Pass Views", "Interlaken Hotel Check-in", "Lake Thun Sunset Cruise"]
      },
      {
        day: 4,
        title: "Jungfraujoch Top of Europe (11,333 ft) & Sphinx Observatory",
        description: "Excursion to Jungfraujoch — Top of Europe via Eiger Express tri-cable gondola. Visit Ice Palace, Alpine Sensation & Sphinx Terrace for panoramic Aletsch Glacier views.",
        activities: ["Eiger Express Gondola", "Jungfraujoch Cogwheel Railway", "Ice Palace Tour", "Sphinx Observatory Deck", "Aletsch Glacier Panorama"]
      },
      {
        day: 5,
        title: "Interlaken to Zermatt → Gornergrat Railway Matterhorn Views",
        description: "Scenic train drive along Valais Alps to car-free Zermatt village. Board the Gornergrat cogwheel railway to 10,285 ft for breathtaking views of the majestic Matterhorn.",
        activities: ["Car-free Zermatt Village Train", "Zermatt Resort Check-in", "Gornergrat Cogwheel Train", "Matterhorn Viewpoint Photo Stop"]
      },
      {
        day: 6,
        title: "Zermatt Glacier Paradise → Train to Geneva → Jet d'Eau",
        description: "Visit Matterhorn Glacier Paradise (Europe's highest cable car station at 12,740 ft). Afternoon 1st Class train to Geneva. Stroll along Lake Geneva & Jet d'Eau fountain.",
        activities: ["Matterhorn Glacier Cable Car", "1st Class Scenic Train to Geneva", "Lake Geneva Promenade", "Jet d'Eau & Flower Clock"]
      },
      {
        day: 7,
        title: "Geneva City Tour → Airport Departure Transfer",
        description: "Visit UN Headquarters & Old Town. Transfer to Geneva Airport for return flight.",
        activities: ["UN Headquarters Tour", "Old Town Walk", "Geneva Airport Drop-off"]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800",
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800"
    ],
    attractions: [
      { name: "Jungfraujoch Top of Europe (11,333 ft)", description: "Highest railway station in Europe surrounded by Aletsch Glacier.", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800" },
      { name: "Zermatt & Matterhorn Peak", description: "Car-free alpine resort with iconic pyramid Matterhorn views.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800" }
    ],
    inclusions: [
      "Swiss Travel Pass 1st Class Consecutive 8-Day Pass Included",
      "Excursions to Jungfraujoch Top of Europe & Mount Titlis Rotair",
      "Gornergrat Cogwheel Train to Matterhorn Viewpoint",
      "6 Nights Stay in 4-Star / 5-Star Swiss Hotels with Buffet Breakfast"
    ],
    exclusions: ["Flight tickets to Zurich / Geneva", "Schengen Visa fee", "Personal expenses"],
    hotels: [
      { name: "Lucerne Lakefront Hotel", location: "Lucerne", stars: 4, room_type: "Lake View Room", meal_plan: "Breakfast Included" },
      { name: "Interlaken Grand Spa Resort", location: "Interlaken", stars: 5, room_type: "Jungfrau View Suite", meal_plan: "Breakfast Included" },
      { name: "Zermatt Alpine Resort", location: "Zermatt", stars: 4, room_type: "Matterhorn View Room", meal_plan: "Breakfast Included" }
    ]
  },
  "europe-france": {
    slug: "europe-france",
    name: "France Paris & French Riviera Luxury (7D/6N)",
    duration: "7 Days / 6 Nights",
    price: 175000,
    rating: 4.9,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800",
    destinations: ["Paris", "Eiffel Tower", "Louvre Museum", "Versailles", "Nice", "Monaco & Cannes"],
    highlights: [
      "Eiffel Tower Priority Access 3rd Floor Summit Entry",
      "Louvre Museum Skip-the-line Ticket & Mona Lisa Tour",
      "Palace of Versailles Hall of Mirrors & Royal Gardens",
      "TGV InOui High-Speed Bullet Train Paris to French Riviera",
      "Nice Promenade des Anglais, Cannes Croisette & Monte Carlo Casino"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Paris → Eiffel Tower Priority Summit Entry & Seine River Cruise",
        description: "Arrival at Paris Charles de Gaulle Airport. Private Mercedes transfer to city center hotel. Skip-the-line VIP entry to Eiffel Tower 3rd floor Summit. Evening illuminated Seine River illuminations cruise.",
        activities: ["CDG Airport Private Transfer", "Paris Central 4-Star Hotel Check-in", "Eiffel Tower Summit Priority Entry", "Seine River Illuminations Cruise"]
      },
      {
        day: 2,
        title: "Louvre Museum Tour & Notre Dame → Champs-Élysées Stroll",
        description: "Guided skip-the-line tour of Louvre Museum (Mona Lisa, Venus de Milo). Stroll along Avenue des Champs-Élysées to Arc de Triomphe.",
        activities: ["Louvre Museum Skip-the-Line", "Arc de Triomphe Observation Deck", "Champs-Élysées Shopping"]
      },
      {
        day: 3,
        title: "Palace of Versailles Royal Estate → Montmartre Sacré-Cœur",
        description: "Excursion to Palace of Versailles. Hall of Mirrors & Fountains show. Afternoon bohemian Montmartre & Sacré-Cœur Basilica walk.",
        activities: ["Versailles Palace Royal Tour", "Hall of Mirrors", "Montmartre Artist Square"]
      },
      {
        day: 4,
        title: "Paris to Nice via TGV High-Speed Train → Promenade des Anglais",
        description: "Board 320 km/h TGV bullet train from Paris Gare de Lyon to Nice. Hotel check-in along Mediterranean seafront & Promenade des Anglais.",
        activities: ["TGV High-Speed Train 1st Class", "Nice Hotel Check-in", "Promenade des Anglais Sunset Walk"]
      },
      {
        day: 5,
        title: "Monaco & Monte Carlo Day Excursion → Prince's Palace & Casino",
        description: "Coastal drive past Eze perfume village to Monaco principality. Visit Prince's Palace, Formula 1 Grand Prix circuit & Monte Carlo Casino.",
        activities: ["Eze Village Fragonard Perfumery", "Monaco F1 Grand Prix Circuit", "Monte Carlo Casino Square"]
      },
      {
        day: 6,
        title: "Cannes Red Carpet & Saint-Paul-de-Vence Medieval Village",
        description: "Excursion to Cannes Croisette boulevard & Film Festival red carpet palace. Afternoon visit to medieval hilltop art village Saint-Paul-de-Vence.",
        activities: ["Cannes Palais des Festivals Red Carpet", "La Croisette Boulevard", "Saint-Paul-de-Vence Art Galleries"]
      },
      {
        day: 7,
        title: "Nice Flower Market → Airport Departure Transfer",
        description: "Morning visit to Cours Saleya flower market. Private transfer to Nice Cote d'Azur Airport.",
        activities: ["Cours Saleya Market", "Nice Airport Private Transfer"]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800",
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800"
    ],
    attractions: [
      { name: "Eiffel Tower Summit", description: "Iconic iron tower with panoramic views from summit 3rd floor.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800" },
      { name: "Palace of Versailles", description: "Opulent French royal estate featuring Hall of Mirrors.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800" }
    ],
    inclusions: ["Eiffel Tower Summit Tickets", "Louvre & Versailles Priority Entry", "TGV High Speed Train 1st Class", "6 Nights 4-Star Hotel Stay with Breakfast"],
    exclusions: ["Flight tickets", "Schengen Visa fee"],
    hotels: [
      { name: "Paris Central Opera Hotel", location: "Paris", stars: 4, room_type: "Executive Room", meal_plan: "Breakfast Included" },
      { name: "Nice Seafront Hotel", location: "Nice", stars: 4, room_type: "Sea View Room", meal_plan: "Breakfast Included" }
    ]
  },
  "europe-italy": {
    slug: "europe-italy",
    name: "Italy Grand Heritage & Amalfi Coast (8D/7N)",
    duration: "8 Days / 7 Nights",
    price: 180000,
    rating: 4.9,
    reviews: 230,
    image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=800",
    destinations: ["Rome", "Vatican City", "Florence", "Venice", "Amalfi Coast"],
    highlights: [
      "Rome Colosseum & Roman Forum Skip-the-Line Priority Entry",
      "Vatican Museums & Sistine Chapel VIP Fast Track Entry",
      "Florence Duomo Cathedral & Uffizi Gallery Art Masterpieces",
      "Venice Private Gondola Serenade Ride along Grand Canal",
      "Frecciarossa 300km/h High-Speed Bullet Trains between Italian Cities"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Rome → Trevi Fountain & Spanish Steps Night Walk",
        description: "Arrival at Rome Fiumicino Airport. Private transfer to central hotel. Evening stroll to Trevi Fountain & Spanish Steps.",
        activities: ["Rome Airport Transfer", "Hotel Check-in", "Trevi Fountain Coin Toss"]
      },
      {
        day: 2,
        title: "Vatican Museums & Colosseum Skip-the-Line Guided Tour",
        description: "Morning VIP tour of Vatican Museums, Sistine Chapel & St. Peter's Basilica. Afternoon skip-the-line Colosseum & Roman Forum tour.",
        activities: ["Sistine Chapel Tour", "St. Peter's Basilica", "Colosseum Priority Access"]
      },
      {
        day: 3,
        title: "Rome to Florence via Frecciarossa Train → Duomo & Ponte Vecchio",
        description: "Board Frecciarossa high-speed bullet train to Florence. Visit Florence Cathedral (Duomo), Giotto's Bell Tower & Ponte Vecchio.",
        activities: ["Frecciarossa Train to Florence", "Florence Duomo Tour", "Ponte Vecchio Sunset"]
      },
      {
        day: 4,
        title: "Pisa Leaning Tower & Chianti Wine Tasting Excursion",
        description: "Excursion to Pisa to see the iconic Leaning Tower. Afternoon wine tasting tour in the scenic Tuscan Chianti countryside.",
        activities: ["Leaning Tower of Pisa Photo Stop", "Chianti Tuscan Vineyard Tour", "Wine & Cheese Tasting"]
      },
      {
        day: 5,
        title: "Florence to Venice → St. Mark's Square & Private Gondola Ride",
        description: "High-speed train to Venice water city. Private water taxi to hotel near St. Mark's Square. Sunset Gondola ride through canals.",
        activities: ["High Speed Train to Venice", "Private Water Taxi Transfer", "Grand Canal Gondola Serenade"]
      },
      {
        day: 6,
        title: "Murano Glassblowing & Burano Colorful Island Tour",
        description: "Private boat tour to Murano island for live glassblowing demonstration, then Burano island famous for lace making & colorful houses.",
        activities: ["Murano Glass Factory Tour", "Burano Island Lace Workshops", "St. Mark's Basilica Entry"]
      },
      {
        day: 7,
        title: "Venice Doge's Palace & Rialto Bridge Stroll",
        description: "Visit Doge's Palace & Bridge of Sighs. Stroll around Rialto market and indulge in authentic Italian Gelato.",
        activities: ["Doge's Palace Tour", "Rialto Bridge Shopping", "Farewell Italian Dinner"]
      },
      {
        day: 8,
        title: "Venice Airport Departure Transfer",
        description: "Water taxi transfer to Venice Marco Polo Airport for departure flight.",
        activities: ["Water Taxi to Airport", "Departure Flight"]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=800",
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800"
    ],
    attractions: [
      { name: "Colosseum & Vatican City", description: "Ancient Roman Amphitheatre & Sistine Chapel ceiling.", image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=800" },
      { name: "Venice Canals & Gondola", description: "Romantic water channels with historical Venetian architecture.", image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=800" }
    ],
    inclusions: ["Frecciarossa 1st Class Train Tickets", "Colosseum & Vatican Priority Tickets", "Private Venice Gondola Ride", "7 Nights 4-Star Hotel Stay with Breakfast"],
    exclusions: ["Flight tickets", "Schengen Visa fee"],
    hotels: [
      { name: "Rome City Center Hotel", location: "Rome", stars: 4, room_type: "Deluxe Room", meal_plan: "Breakfast Included" },
      { name: "Florence Historic Hotel", location: "Florence", stars: 4, room_type: "Superior Room", meal_plan: "Breakfast Included" },
      { name: "Venice Canal Hotel", location: "Venice", stars: 4, room_type: "Canal View Room", meal_plan: "Breakfast Included" }
    ]
  },
  "europe-germany": {
    slug: "europe-germany",
    name: "Germany Bavarian Castles & Black Forest (7D/6N)",
    duration: "7 Days / 6 Nights",
    price: 165000,
    rating: 4.8,
    reviews: 185,
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800",
    destinations: ["Munich", "Neuschwanstein Castle", "Black Forest", "Heidelberg", "Frankfurt", "Berlin"],
    highlights: [
      "Fairy-tale Neuschwanstein Castle VIP Entry & Alpine Lake Hohenschwangau",
      "Munich Marienplatz Glockenspiel & Bavarian Beer Hall Cultural Feast",
      "Scenic Black Forest Cuckoo Clock Trail & Lake Titisee Steamboat Ride",
      "Heidelberg Castle Ruins overlooking Neckar River Valley",
      "ICE High-Speed 300km/h German Express Trains between Cities"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Munich → Marienplatz Glockenspiel & Hofbrauhaus",
        description: "Arrival at Munich Airport. Private transfer to 4-star city center hotel. Visit Marienplatz square, famous Glockenspiel chime performance, and evening traditional Bavarian dinner at Hofbrauhaus.",
        activities: ["Munich Airport Transfer", "Hotel Check-in", "Marienplatz Glockenspiel", "Bavarian Welcome Dinner"]
      },
      {
        day: 2,
        title: "Fairy-tale Neuschwanstein Castle & Bavarian Alps Excursion",
        description: "Day excursion to Fussen. Priority entrance to Neuschwanstein Castle (inspiration for Disney castle), Marienbrucke bridge gorge view, and Lake Hohenschwangau.",
        activities: ["Neuschwanstein Castle Priority Ticket", "Marienbrucke Gorge View", "Alpine Lake Walk"]
      },
      {
        day: 3,
        title: "Munich to Black Forest (Freiburg / Titisee) → Cuckoo Clock Workshop",
        description: "Board DB ICE train to the Black Forest region. Scenic drive around Lake Titisee, traditional cuckoo clock craftsmanship demonstration, and Black Forest gateau cake tasting.",
        activities: ["ICE Train to Black Forest", "Lake Titisee Steamboat Ride", "Cuckoo Clock Workshop", "Authentic Black Forest Cake Tasting"]
      },
      {
        day: 4,
        title: "Black Forest to Heidelberg → Heidelberg Castle & Old Bridge",
        description: "Travel to romantic Heidelberg. Tour Heidelberg Castle ruins on the hill, Great Wine Tun barrel, and stroll across Karl Theodor Old Bridge over Neckar River.",
        activities: ["Heidelberg Castle Funicular Railway", "Great Wine Tun Barrel", "Old Bridge & Philosopher's Walk"]
      },
      {
        day: 5,
        title: "Heidelberg to Frankfurt → Financial District Skyline & Romerberg",
        description: "Short train drive to Frankfurt. Visit historic Romerberg square, Goethe House, Main Tower observation deck for panoramic skyline views.",
        activities: ["Romerberg Square Walk", "Main Tower Skydeck Entrance", "Museumsufer Stroll"]
      },
      {
        day: 6,
        title: "Frankfurt to Berlin via ICE Bullet Train → Brandenburg Gate & Berlin Wall",
        description: "Board 300 km/h ICE train to capital city Berlin. Visit iconic Brandenburg Gate, Reichstag Dome, Checkpoint Charlie & East Side Gallery Berlin Wall.",
        activities: ["ICE Train to Berlin", "Brandenburg Gate", "Reichstag Building Glass Dome", "East Side Gallery Berlin Wall"]
      },
      {
        day: 7,
        title: "Berlin Museum Island → Airport Departure Transfer",
        description: "Visit UNESCO Museum Island & Pergamon Museum exterior. Transfer to Berlin Brandenburg Airport for return flight.",
        activities: ["Museum Island Tour", "Berlin Airport Transfer"]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800",
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800"
    ],
    attractions: [
      { name: "Neuschwanstein Castle", description: "Fairy-tale 19th-century palace perched on a rugged Bavarian hill.", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800" },
      { name: "Black Forest & Lake Titisee", description: "Enchanting evergreen mountain range famous for cuckoo clocks.", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800" }
    ],
    inclusions: ["ICE High-Speed Train Tickets", "Neuschwanstein Castle Priority Tickets", "Lake Titisee Steamboat Cruise", "6 Nights 4-Star Hotel Stay with Breakfast"],
    exclusions: ["Flight tickets", "Schengen Visa fee"],
    hotels: [
      { name: "Munich City Hotel", location: "Munich", stars: 4, room_type: "Deluxe Room", meal_plan: "Breakfast Included" },
      { name: "Heidelberg Heritage Hotel", location: "Heidelberg", stars: 4, room_type: "Neckar View Room", meal_plan: "Breakfast Included" },
      { name: "Berlin Central Hotel", location: "Berlin", stars: 4, room_type: "Executive Suite", meal_plan: "Breakfast Included" }
    ]
  },
  "europe-austria": {
    slug: "europe-austria",
    name: "Imperial Vienna & Alpine Hallstatt (6D/5N)",
    duration: "6 Days / 5 Nights",
    price: 155000,
    rating: 4.9,
    reviews: 165,
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800",
    destinations: ["Vienna", "Schonbrunn Palace", "Salzburg", "Hallstatt", "Innsbruck"],
    highlights: [
      "Schonbrunn Palace Imperial Rooms & Gloriette Gardens Guided Tour",
      "Fairytale Postcard Lake Village of Hallstatt & World's Oldest Salt Mine",
      "Salzburg Sound of Music Tour & Mozart Birthplace House",
      "OBB Railjet 230km/h Premium Austrian Express Trains",
      "Innsbruck Golden Roof & Swarovski Crystal Worlds Wattens"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Vienna → St. Stephen's Cathedral & Opera House",
        description: "Arrival at Vienna International Airport. Private transfer to city center hotel. Stroll along Ringstrasse boulevard, St. Stephen's Cathedral & Hofburg Imperial Palace.",
        activities: ["Vienna Airport Transfer", "Ringstrasse Boulevard Walk", "St. Stephen's Cathedral"]
      },
      {
        day: 2,
        title: "Schonbrunn Palace Imperial Tour & Classical Concert",
        description: "VIP guided tour of Schonbrunn Palace Grand Apartments & Royal Gardens. Evening traditional Viennese Classical Waltz Concert at Palais Auersperg.",
        activities: ["Schonbrunn Palace Priority Entry", "Gloriette Hill Gardens", "Viennese Classical Concert"]
      },
      {
        day: 3,
        title: "Vienna to Salzburg via OBB Railjet → Mozart's House & Fortress",
        description: "Board OBB Railjet train to Salzburg. Tour Mozart's Birthplace, Mirabell Gardens (Sound of Music filming site) & Hohensalzburg Fortress overview.",
        activities: ["OBB Railjet Premium Train", "Mirabell Gardens Tour", "Mozart Birthplace Museum", "Hohensalzburg Fortress Funicular"]
      },
      {
        day: 4,
        title: "Fairytale Hallstatt Lake Excursion → Skywalk Viewpoint",
        description: "Day excursion into Salzkammergut lake region to Hallstatt. Boat ride across Lake Hallstatt, stroll past pastel 16th-century alpine houses & Hallstatt Skywalk deck.",
        activities: ["Hallstatt Lake Boat Cruise", "Pastel Village Walk", "Hallstatt Skywalk Heritage View"]
      },
      {
        day: 5,
        title: "Salzburg to Innsbruck → Golden Roof & Swarovski Crystal Worlds",
        description: "Scenic train ride through Tyrolean Alps to Innsbruck. Visit iconic Golden Roof (Goldenes Dachl), Hofkirche & Swarovski Crystal Worlds in Wattens.",
        activities: ["Tyrolean Alpine Train", "Golden Roof Innsbruck", "Swarovski Crystal Worlds Entrance"]
      },
      {
        day: 6,
        title: "Innsbruck Nordkette Cable Car → Airport Departure Transfer",
        description: "Ride Nordkette Cable Car to 7,400 ft for breathtaking panorama of Innsbruck city and snowcapped Alps. Transfer to Innsbruck / Munich Airport for departure.",
        activities: ["Nordkette Funicular & Cable Car", "Panorama Deck", "Airport Transfer"]
      }
    ],
    images: ["https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800"],
    attractions: [
      { name: "Hallstatt Alpine Village", description: "UNESCO World Heritage lakeside village nestled between mountains.", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800" },
      { name: "Schonbrunn Palace Vienna", description: "Sumptuous Habsburg imperial summer residence with 1,441 rooms.", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800" }
    ],
    inclusions: ["OBB Railjet Train Passes", "Schonbrunn Palace Tickets", "Hallstatt Lake Boat Ticket", "5 Nights 4-Star Hotel Stay with Breakfast"],
    exclusions: ["Flight tickets", "Schengen Visa fee"],
    hotels: [
      { name: "Vienna Imperial Hotel", location: "Vienna", stars: 4, room_type: "Deluxe Room", meal_plan: "Breakfast Included" },
      { name: "Salzburg Heritage Hotel", location: "Salzburg", stars: 4, room_type: "Old Town View Room", meal_plan: "Breakfast Included" }
    ]
  },
  "europe-netherlands": {
    slug: "europe-netherlands",
    name: "Dutch Windmills & Canal Delights (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 145000,
    rating: 4.8,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800",
    destinations: ["Amsterdam", "Zaanse Schans", "Keukenhof Gardens", "Giethoorn", "Rotterdam"],
    highlights: [
      "Amsterdam Canal Ring Glass-Top Cruise & Anne Frank House Area",
      "Zaanse Schans Historic Wooden Windmills & Clog Workshop",
      "Keukenhof Tulip Gardens (Seasonal) / Giethoorn Car-Free Water Village",
      "Rijksmuseum & Van Gogh Museum Masterpiece Priority Entry",
      "Rotterdam Modern Architecture & Markthal Food Experience"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Amsterdam → Canal Ring Cruise & Dam Square",
        description: "Arrival at Amsterdam Schiphol Airport. Private transfer to canal-front hotel. Evening glass-top canal boat cruise along UNESCO World Heritage canal belt.",
        activities: ["Schiphol Airport Transfer", "Hotel Check-in", "Amsterdam Canal Ring Cruise"]
      },
      {
        day: 2,
        title: "Rijksmuseum & Van Gogh Museum → Jordaan District Stroll",
        description: "Priority entrance to Rijksmuseum (Rembrandt's Night Watch) & Van Gogh Museum. Afternoon stroll through charming Jordaan boutique quarter.",
        activities: ["Rijksmuseum Priority Ticket", "Van Gogh Museum Tour", "Jordaan District Walk"]
      },
      {
        day: 3,
        title: "Zaanse Schans Windmills, Volendam Cheese & Clog Crafting",
        description: "Day tour to Zaanse Schans to see working 18th-century windmills. Visit Volendam fishing village for Gouda cheese tasting and live wooden clog crafting.",
        activities: ["Zaanse Schans Windmill Entry", "Gouda Cheese Factory Tasting", "Traditional Clog Workshop"]
      },
      {
        day: 4,
        title: "Giethoorn Venice of the North / Keukenhof Tulip Excursion",
        description: "Excursion to Giethoorn — car-free fairytale village navigated entirely by whisper boats along thatched-cottage canals (or Keukenhof Gardens during spring season).",
        activities: ["Giethoorn Boat Rental Cruise", "Thatched Cottage Village Stroll", "Farewell Dutch Dinner"]
      },
      {
        day: 5,
        title: "Rotterdam Cube Houses & Airport Departure Transfer",
        description: "Morning train to Rotterdam to admire futuristic Cube Houses & Markthal. Transfer to Schiphol Airport for return flight.",
        activities: ["Rotterdam Cube Houses", "Markthal Food Tour", "Schiphol Airport Transfer"]
      }
    ],
    images: ["https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800"],
    attractions: [
      { name: "Amsterdam Canals & Windmills", description: "17th-century waterways and iconic Zaanse Schans wooden windmills.", image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800" },
      { name: "Giethoorn Water Village", description: "Serene car-free village connected by wooden footbridges and canals.", image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800" }
    ],
    inclusions: ["Amsterdam Canal Cruise", "Zaanse Schans Entrance", "Rijksmuseum Priority Tickets", "4 Nights 4-Star Hotel Stay with Breakfast"],
    exclusions: ["Flight tickets", "Schengen Visa fee"],
    hotels: [{ name: "Amsterdam Canal Hotel", location: "Amsterdam", stars: 4, room_type: "Canal View Room", meal_plan: "Breakfast Included" }]
  },
  "europe-belgium": {
    slug: "europe-belgium",
    name: "Medieval Brussels & Bruges (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 135000,
    rating: 4.8,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800",
    destinations: ["Brussels", "Bruges", "Ghent", "Antwerp"],
    highlights: [
      "Brussels Grand Place Guildhouses & Atomium Monument View",
      "Fairytale Bruges Canals, Belfry Tower & Medieval Old Town",
      "Ghent Gravensteen Castle of the Counts & St. Bavo Cathedral",
      "Authentic Belgian Chocolatier Masterclass & Beer Tasting",
      "SNCB Intercity Express Train Access across Belgium"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Brussels → Grand Place & Manneken Pis",
        description: "Arrival at Brussels Airport. Private transfer to hotel. Stroll across UNESCO Grand Place square, Royal Palace & Manneken Pis statue.",
        activities: ["Brussels Airport Transfer", "Grand Place Walk", "Belgian Waffle Tasting"]
      },
      {
        day: 2,
        title: "Brussels City Tour & Belgian Chocolate Masterclass",
        description: "Visit Atomium sculpture, European Parliament exterior, and attend a private chocolate making workshop with a master chocolatier.",
        activities: ["Atomium Panorama", "EU Quarter Tour", "Belgian Chocolate Masterclass"]
      },
      {
        day: 3,
        title: "Bruges Medieval Fairytale Day Excursion & Canal Cruise",
        description: "Day trip to Bruges. Boat cruise along medieval canals, climb 366 steps of Belfry Tower, and stroll past Lake of Love (Minnewater).",
        activities: ["Bruges Canal Boat Ride", "Belfry Tower Viewpoint", "Lake of Love Stroll"]
      },
      {
        day: 4,
        title: "Ghent Gravensteen Castle & Mystic Lamb Altarpiece",
        description: "Excursion to Ghent. Tour 12th-century fortress Gravensteen Castle, Graslei harbour, and St. Bavo Cathedral to see Van Eyck's Altarpiece.",
        activities: ["Gravensteen Fortress Entry", "Graslei Harbour Walk", "St. Bavo Cathedral"]
      },
      {
        day: 5,
        title: "Antwerp Diamond District → Airport Departure Transfer",
        description: "Morning visit to Antwerp Central Station architecture & Diamond Quarter. Transfer to Brussels Airport for return flight.",
        activities: ["Antwerp Central Station", "Diamond District Walk", "Airport Transfer"]
      }
    ],
    images: ["https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800"],
    attractions: [
      { name: "Grand Place Brussels", description: "World's most beautiful central square lined with opulent guildhalls.", image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800" },
      { name: "Bruges Canals & Belfry", description: "Enchanting medieval cobblestone streets and scenic canal networks.", image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=800" }
    ],
    inclusions: ["Belgian Train Passes", "Bruges Canal Cruise Ticket", "Chocolate Making Workshop", "4 Nights 4-Star Hotel Stay with Breakfast"],
    exclusions: ["Flight tickets", "Schengen Visa fee"],
    hotels: [{ name: "Brussels Grand Hotel", location: "Brussels", stars: 4, room_type: "Executive Room", meal_plan: "Breakfast Included" }]
  },
  "europe-czech-republic": {
    slug: "europe-czech-republic",
    name: "Prague City of a Hundred Spires (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 125000,
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800",
    destinations: ["Prague", "Prague Castle", "Charles Bridge", "Cesky Krumlov", "Karlovy Vary"],
    highlights: [
      "Prague Castle VIP Complex Tour & St. Vitus Cathedral",
      "Iconic Charles Bridge Dawn/Sunset Stroll & Old Town Astronomical Clock",
      "Vltava River Panoramic Buffet Cruise with Live Music",
      "Day Excursion to Cesky Krumlov UNESCO Medieval Town",
      "Thermal Spa Springs & Crystal Glass Excursion to Karlovy Vary"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Prague → Old Town Square & Astronomical Clock",
        description: "Arrival at Vaclav Havel Airport Prague. Private transfer to city center hotel. Stroll across Old Town Square, watch Astronomical Clock chime performance & Powder Tower.",
        activities: ["Prague Airport Transfer", "Old Town Square Walk", "Astronomical Clock Show"]
      },
      {
        day: 2,
        title: "Prague Castle Complex, St. Vitus & Charles Bridge",
        description: "Guided tour of Prague Castle (largest ancient castle in the world), St. Vitus Cathedral, Golden Lane. Afternoon walk across 14th-century Charles Bridge to Lesser Town.",
        activities: ["Prague Castle Priority Circuit", "St. Vitus Cathedral Entry", "Charles Bridge Walk", "Golden Lane Stroll"]
      },
      {
        day: 3,
        title: "Cesky Krumlov UNESCO Medieval Town Excursion",
        description: "Day trip into South Bohemia to fairytale Cesky Krumlov. Tour castle gardens, Renaissance courtyard, and winding Vltava river bend streets.",
        activities: ["Cesky Krumlov Castle Tour", "Vltava River Bend View", "Medieval Alleyway Walk"]
      },
      {
        day: 4,
        title: "Karlovy Vary Thermal Spa Springs & Vltava Dinner Cruise",
        description: "Excursion to mineral spa town Karlovy Vary. Taste thermal spring waters from porcelain cups. Evening Vltava River illuminated jazz dinner cruise in Prague.",
        activities: ["Karlovy Vary Colonnade Walk", "Spa Spring Tasting", "Vltava River Jazz Dinner Cruise"]
      },
      {
        day: 5,
        title: "Wenceslas Square & Airport Departure Transfer",
        description: "Shopping stroll along Wenceslas Square & Havelska Market. Transfer to Prague Airport for return flight.",
        activities: ["Wenceslas Square Shopping", "Airport Transfer"]
      }
    ],
    images: ["https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800"],
    attractions: [
      { name: "Prague Castle & St. Vitus Cathedral", description: "World's largest ancient castle complex with gothic cathedral spires.", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800" },
      { name: "Charles Bridge & Old Town", description: "Historic stone arch bridge decorated with 30 baroque saint statues.", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800" }
    ],
    inclusions: ["Prague Castle Priority Circuit Ticket", "Vltava River Dinner Cruise", "Cesky Krumlov Guided Day Tour", "4 Nights 4-Star Hotel Stay with Breakfast"],
    exclusions: ["Flight tickets", "Schengen Visa fee"],
    hotels: [{ name: "Prague Boutique Hotel", location: "Prague", stars: 4, room_type: "Old Town View Room", meal_plan: "Breakfast Included" }]
  },
  "singapore-malaysia": {
    slug: "singapore-malaysia",
    name: "Singapore & Malaysia Dual Country Tour (7D/6N)",
    duration: "7 Days / 6 Nights",
    price: 115000,
    rating: 4.9,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?q=80&w=800",
    destinations: ["Singapore", "Universal Studios Sentosa", "Gardens by the Bay", "Kuala Lumpur", "Petronas Towers", "Genting Highlands", "Batu Caves"],
    highlights: [
      "Dual Country Circuit Covering Lion City Singapore & Capital Kuala Lumpur",
      "Universal Studios Sentosa All-Day Express Thrill Ticket",
      "Gardens by the Bay Supertree Grove & Cloud Forest Dome Entry",
      "Petronas Twin Towers Skybridge & 86th Floor Observation Deck Ticket",
      "Genting Highlands Awana SkyWay Cable Car & Batu Caves Rainbow Steps",
      "Private Chauffeured Airport & Inter-city Transfers throughout 7 Days"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Singapore → Marina Bay Sands Skyline & Gardens by the Bay",
        description: "Arrival at Singapore Changi Airport. Private chauffeured transfer to 4-star city center hotel. Evening visit to Gardens by the Bay Supertree Grove light show and Marina Bay Sands SkyPark deck.",
        activities: ["Changi Airport VIP Reception", "Hotel Check-in", "Gardens by the Bay Light Show", "Marina Bay Sands Skyline Walk"]
      },
      {
        day: 2,
        title: "Universal Studios Sentosa Theme Park Excursion",
        description: "Full day at Universal Studios Sentosa. Enjoy world-class rides in Sci-Fi City (Battlestar Galactica), Transformers 3D, Ancient Egypt, and Far Far Away Shrek Castle.",
        activities: ["Universal Studios Sentosa Day Pass", "Battlestar Galactica Coaster", "Transformers 3D Ride", "Wings of Time Laser Show"]
      },
      {
        day: 3,
        title: "Singapore Night Safari & Little India / Chinatown Cultural Stroll",
        description: "Morning city tour visiting Merlion Park, Chinatown Buddha Tooth Relic Temple, and Little India. Evening tram safari through Mandai tropical night rainforest.",
        activities: ["Merlion Park Photo Stop", "Chinatown & Little India Walk", "Night Safari Tram Ride"]
      },
      {
        day: 4,
        title: "Flight / Express Coach to Kuala Lumpur → Petronas Twin Towers",
        description: "Transfer to Kuala Lumpur, Malaysia. Hotel check-in. Evening visit to iconic Petronas Twin Towers Skybridge and KL Tower observation deck.",
        activities: ["Inter-city Transfer to Kuala Lumpur", "KL Hotel Check-in", "Petronas Twin Towers Skybridge", "KL Tower Skydeck"]
      },
      {
        day: 5,
        title: "Batu Caves Rainbow Steps & Genting Highlands Awana SkyWay Cable Car",
        description: "Excursion to sacred Batu Caves featuring the giant golden Lord Murugan statue. Ride the Awana SkyWay glass-floor cable car up to Genting Highlands indoor resort.",
        activities: ["Batu Caves Rainbow Steps", "Golden Murugan Statue", "Awana SkyWay Cable Car", "Genting Highlands Casino & Theme Park"]
      },
      {
        day: 6,
        title: "Kuala Lumpur City Heritage Tour & Central Market Craft Shopping",
        description: "Explore historic Merdeka Square, Sultan Abdul Samad Building, National Mosque, and Central Market for Malaysian batik & craft souvenirs.",
        activities: ["Merdeka Square Heritage Tour", "Sultan Abdul Samad Building", "Central Market Batik Shopping", "Farewell Malaysian Dinner"]
      },
      {
        day: 7,
        title: "Kuala Lumpur International Airport Departure Transfer",
        description: "Post breakfast, enjoy leisure shopping at Bukit Bintang. Private transfer to KLIA Airport for your return departure flight.",
        activities: ["Bukit Bintang Shopping", "KLIA Airport Drop-off"]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?q=80&w=800",
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800",
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800"
    ],
    attractions: [
      { name: "Petronas Twin Towers (KL)", description: "World's tallest twin structures connected by a 58m skybridge.", image: "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?q=80&w=800" },
      { name: "Universal Studios Sentosa", description: "Southeast Asia's premier theme park on Sentosa Island.", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800" },
      { name: "Genting Highlands Cable Car", description: "Glass-floor cable car ride ascending through 130-million-year-old rainforests.", image: "https://images.unsplash.com/photo-1508964942454-1a56651d54ac?q=80&w=800" },
      { name: "Gardens by the Bay", description: "Futuristic botanical wonderland featuring giant Supertrees & Cloud Forest.", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800" }
    ],
    inclusions: [
      "3 Nights Singapore 4-Star Hotel + 3 Nights Kuala Lumpur 4-Star Hotel",
      "Singapore E-Visa & Malaysia Digital Arrival Card Processing",
      "Universal Studios Sentosa All-Day Pass",
      "Petronas Twin Towers Skybridge Entry Ticket",
      "Genting Highlands Awana SkyWay Cable Car Ticket",
      "Daily Deluxe Breakfast at All Hotels",
      "Private Chauffeured Airport & Inter-city Transfers"
    ],
    exclusions: [
      "International Airfare to Singapore & Departure from Kuala Lumpur",
      "Tourism Tax paid directly at Malaysian hotel check-in (~10 MYR/night)",
      "GST / TCS extra as applicable"
    ],
    hotels: [
      { name: "Grand Copthorne Waterfront", location: "Singapore", stars: 4, room_type: "River View Room", meal_plan: "Breakfast Included" },
      { name: "Dorsett Kuala Lumpur", location: "Kuala Lumpur", stars: 4, room_type: "Deluxe Twin Suite", meal_plan: "Breakfast Included" }
    ]
  },
  "singapore-4d-3n": {
    slug: "singapore-4d-3n",
    name: "Singapore Classic Express (4D/3N)",
    duration: "4 Days / 3 Nights",
    price: 48000,
    rating: 4.8,
    reviews: 185,
    image: "/singapore/gardens_by_the_bay.jpg",
    destinations: ["Singapore", "Gardens by the Bay", "Marina Bay Sands", "Sentosa Island", "Jewel Changi"],
    highlights: [
      "Short City Escape Covering Major Lion City Icons",
      "Gardens by the Bay Flower Dome & Cloud Forest Entry",
      "Singapore Cable Car Flight & Sentosa Wings of Time Laser Show",
      "Jewel Changi Airport 40m HSBC Rain Vortex Waterfall",
      "Singapore E-Visa Processing & Private Chauffeured Transfers"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Singapore → Marina Bay Sands Skyline & Gardens by the Bay",
        description: "Chauffeured pickup from Changi Airport. Hotel check-in. Evening visit to Gardens by the Bay Supertree Grove light show and Marina Bay Sands SkyPark.",
        activities: ["Changi Airport Pickup", "Hotel Check-in", "Gardens by the Bay", "Marina Bay Sands"]
      },
      {
        day: 2,
        title: "Singapore City Highlights & Chinatown / Little India",
        description: "Half-day city tour visiting Merlion Park, Chinatown Heritage Centre, Little India, and Botanical Gardens.",
        activities: ["Merlion Park", "Chinatown", "Little India", "Botanical Gardens"]
      },
      {
        day: 3,
        title: "Sentosa Cable Car & S.E.A. Aquarium Excursion",
        description: "Ride Singapore Cable Car to Sentosa Island. Explore S.E.A. Aquarium and enjoy Wings of Time laser show at Siloso Beach.",
        activities: ["Cable Car Ride", "S.E.A. Aquarium", "Wings of Time Laser Show"]
      },
      {
        day: 4,
        title: "Jewel Changi Airport Rain Vortex → Departure Flight",
        description: "Visit Jewel Changi Airport's 40m HSBC Rain Vortex before boarding return departure flight.",
        activities: ["Jewel Changi Rain Vortex", "Departure Flight"]
      }
    ],
    images: [
      "/singapore/gardens_by_the_bay.jpg",
      "/singapore/jewel_changi.jpg",
      "/singapore/merlion_park.jpg",
      "/singapore/cable_car_sentosa.jpg",
      "/singapore/wings_of_time_sentosa.jpg"
    ],
    attractions: [
      { name: "Gardens by the Bay & Supertree Grove", description: "Futuristic botanical park featuring 50m Supertrees and Cloud Forest.", image: "/singapore/gardens_by_the_bay.jpg" },
      { name: "Jewel Changi Airport & Rain Vortex", description: "World's tallest 40m indoor waterfall and lush canopy park.", image: "/singapore/jewel_changi.jpg" },
      { name: "Merlion Park & Singapore River", description: "Iconic national symbol overlooking Marina Bay skyline.", image: "/singapore/merlion_park.jpg" }
    ],
    inclusions: ["3 Nights 4-Star Hotel Stay with Breakfast", "Singapore E-Visa", "Gardens by the Bay Tickets", "Sentosa Cable Car Passes", "Private Transfers"],
    exclusions: ["International Flights", "GST / TCS"],
    hotels: [{ name: "V Hotel Lavender", location: "Singapore", stars: 4, room_type: "Superior Room", meal_plan: "Breakfast Included" }]
  },
  "singapore-5d-4n": {
    slug: "singapore-5d-4n",
    name: "Singapore Deluxe & Sentosa (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 56000,
    rating: 4.9,
    reviews: 195,
    image: "/singapore/universal_studios.jpg",
    destinations: ["Singapore", "Universal Studios Sentosa", "Night Safari", "Gardens by the Bay", "Marina Bay"],
    highlights: [
      "Best Selling 5-Day Singapore Comprehensive Experience",
      "Universal Studios Sentosa Full Day Thrill Passes",
      "Mandai Night Safari Tram Ride in Rainforest",
      "Gardens by the Bay Cloud Forest & Flower Dome Domes",
      "Singapore River Cruise past Clarke Quay & Orchard Road Shopping"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Singapore → Night Safari Tram Tour",
        description: "Arrive at Changi Airport. Private transfer to hotel. Evening tram safari through Mandai tropical night rainforest.",
        activities: ["Changi Airport Transfer", "Mandai Night Safari Tram"]
      },
      {
        day: 2,
        title: "Universal Studios Sentosa All-Day Thrill Passes",
        description: "Full day at Universal Studios Sentosa. Enjoy Battlestar Galactica, Transformers 3D, and Ancient Egypt rides.",
        activities: ["Universal Studios Day Pass", "Transformers 3D", "Battlestar Galactica"]
      },
      {
        day: 3,
        title: "Gardens by the Bay & Marina Bay Sands Observatory",
        description: "Visit Cloud Forest & Flower Dome. Afternoon ascent to Marina Bay Sands SkyPark observation deck.",
        activities: ["Cloud Forest Dome", "Flower Dome", "SkyPark Observatory"]
      },
      {
        day: 4,
        title: "Singapore River Cruise & Orchard Road Shopping",
        description: "Morning bumboats river cruise past Clarke Quay. Afternoon luxury shopping spree on Orchard Road.",
        activities: ["River Bumbout Cruise", "Orchard Road Shopping"]
      },
      {
        day: 5,
        title: "Jewel Changi Canopy Park → Departure Flight",
        description: "Tour Jewel Changi Canopy Park & Rain Vortex before departure flight.",
        activities: ["Jewel Canopy Park", "Changi Airport Drop-off"]
      }
    ],
    images: [
      "/singapore/universal_studios.jpg",
      "/singapore/gardens_by_the_bay.jpg",
      "/singapore/night_safari.jpg",
      "/singapore/jewel_changi.jpg",
      "/singapore/merlion_park.jpg"
    ],
    attractions: [
      { name: "Universal Studios Sentosa", description: "Premier movie-theme park with 24 rides and attractions.", image: "/singapore/universal_studios.jpg" },
      { name: "Mandai Night Safari", description: "World's first nocturnal wildlife park with open tram safari.", image: "/singapore/night_safari.jpg" },
      { name: "Gardens by the Bay", description: "Futuristic Supertree Grove and Flower Dome conservatories.", image: "/singapore/gardens_by_the_bay.jpg" }
    ],
    inclusions: ["4 Nights 4-Star Hotel Stay with Breakfast", "Universal Studios Ticket", "Night Safari Ticket", "Singapore E-Visa", "Private Transfers"],
    exclusions: ["International Flights", "GST / TCS"],
    hotels: [{ name: "Grand Copthorne Waterfront", location: "Singapore", stars: 4, room_type: "Deluxe Room", meal_plan: "Breakfast Included" }]
  },
  "singapore-sentosa": {
    slug: "singapore-sentosa",
    name: "Singapore + Sentosa Island Resort (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 64000,
    rating: 4.9,
    reviews: 175,
    image: "/singapore/cable_car_sentosa.jpg",
    destinations: ["Sentosa Island", "Universal Studios", "S.E.A. Aquarium", "Skyline Luge", "Siloso Beach"],
    highlights: [
      "Dedicated Stay at Sentosa Island 4-Star Beach Resort",
      "Universal Studios VIP Express Pass Unlimited Access",
      "S.E.A. Aquarium & Skyline Luge 3-Rides Track Pass",
      "Mount Faber Cable Car Flight & Siloso Beach Sunset Walk",
      "Private Chauffeured Airport & Island Transfers"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Sentosa Island → Beach Resort Check-in & Siloso Sunset",
        description: "Private transfer from Changi Airport directly to Sentosa Island beach resort. Evening Siloso beach walk & cocktails.",
        activities: ["Sentosa Resort Check-in", "Siloso Beach Sunset"]
      },
      {
        day: 2,
        title: "Universal Studios VIP Express Pass Day",
        description: "Priority express entry to Universal Studios rides, Sci-Fi City, and Hollywood Boulevard.",
        activities: ["Universal Studios Express Pass", "Sci-Fi City"]
      },
      {
        day: 3,
        title: "S.E.A. Aquarium & Skyline Luge Rides",
        description: "Explore world's largest oceanarium S.E.A. Aquarium, followed by thrilling Skyline Luge & Skyride tracks.",
        activities: ["S.E.A. Aquarium", "Skyline Luge 3 Rides"]
      },
      {
        day: 4,
        title: "Sentosa Cable Car → City Tour & Marina Bay",
        description: "Cable car ride to Mount Faber. Half day city sightseeing covering Merlion Park & Gardens by the Bay.",
        activities: ["Cable Car Pass", "City Tour", "Merlion Park"]
      },
      {
        day: 5,
        title: "Sentosa Resort Morning Swim → Departure",
        description: "Morning beach resort pool relaxation. Chauffeured transfer to Changi Airport.",
        activities: ["Resort Pool Relax", "Airport Drop-off"]
      }
    ],
    images: [
      "/singapore/cable_car_sentosa.jpg",
      "/singapore/universal_studios.jpg",
      "/singapore/sea_aquarium.jpg",
      "/singapore/wings_of_time_sentosa.jpg",
      "/singapore/gardens_by_the_bay.jpg"
    ],
    attractions: [
      { name: "Sentosa Cable Car SkyPass", description: "360-degree aerial views over Mount Faber and Sentosa harbor.", image: "/singapore/cable_car_sentosa.jpg" },
      { name: "Universal Studios Sentosa", description: "World-class rollercoasters, 3D simulators and movie sets.", image: "/singapore/universal_studios.jpg" },
      { name: "S.E.A. Aquarium", description: "Over 100,000 marine animals and majestic manta rays.", image: "/singapore/sea_aquarium.jpg" }
    ],
    inclusions: ["2 Nights Sentosa Beach Resort + 2 Nights City Hotel", "Universal Studios Express Ticket", "Skyline Luge Pass", "Singapore E-Visa"],
    exclusions: ["International Flights", "GST / TCS"],
    hotels: [{ name: "Village Hotel Sentosa", location: "Sentosa Island", stars: 4, room_type: "Deluxe Pool View", meal_plan: "Breakfast Included" }]
  },
  "singapore-cruise": {
    slug: "singapore-cruise",
    name: "Singapore + Genting Dream Luxury Cruise (7D/6N)",
    duration: "7 Days / 6 Nights",
    price: 145000,
    rating: 4.9,
    reviews: 160,
    image: "/singapore/marina_bay_sands.jpg",
    destinations: ["Singapore", "Marina Bay Cruise Centre", "High Seas Ocean Cruise", "Universal Studios"],
    highlights: [
      "4 Nights Singapore Land Stay + 2 Nights Genting Dream Luxury Ocean Cruise",
      "Balcony Ocean Stateroom Accommodations Onboard Ship",
      "Full Board Meals (6 Dining Meals/Day Onboard Cruise)",
      "Waterslides, Zip Line, Broadway Theater & Casino Onboard",
      "Universal Studios & Gardens by the Bay City Passes"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Singapore → Hotel Check-in & Gardens by the Bay",
        description: "Arrive Singapore. Private transfer to city hotel. Evening Gardens by the Bay visit.",
        activities: ["Changi Airport Transfer", "Gardens by the Bay"]
      },
      {
        day: 2,
        title: "Universal Studios Sentosa Day Tour",
        description: "Full day enjoying Universal Studios Sentosa theme park.",
        activities: ["Universal Studios Day Pass"]
      },
      {
        day: 3,
        title: "Night Safari & City Sightseeing",
        description: "City tour of Merlion Park & evening Mandai Night Safari.",
        activities: ["City Tour", "Night Safari"]
      },
      {
        day: 4,
        title: "Board Genting Dream Cruise at Marina Bay Cruise Centre",
        description: "Transfer to Marina Bay Cruise Centre. Board Genting Dream cruise liner. Gala dinner.",
        activities: ["Cruise Embarkation", "Gala Welcome Dinner"]
      },
      {
        day: 5,
        title: "High Seas Ocean Sailing & Onboard Entertainment",
        description: "Full day sailing high seas. Enjoy waterslides, zip line, Broadway theater shows.",
        activities: ["High Seas Sailing", "Broadway Show"]
      },
      {
        day: 6,
        title: "Disembark Cruise → City Hotel Night Stay",
        description: "Return to Singapore port. Transfer to city hotel. Free evening for Orchard Road shopping.",
        activities: ["Cruise Disembarkation", "Orchard Road Shopping"]
      },
      {
        day: 7,
        title: "Jewel Changi Tour → Departure Flight",
        description: "Visit Jewel Changi and transfer to airport for departure.",
        activities: ["Jewel Changi", "Airport Drop-off"]
      }
    ],
    images: [
      "/singapore/marina_bay_sands.jpg",
      "/singapore/gardens_by_the_bay.jpg",
      "/singapore/universal_studios.jpg",
      "/singapore/jewel_changi.jpg"
    ],
    attractions: [
      { name: "Marina Bay Cruise & Sands", description: "World-class cruise terminal and waterfront skyline panorama.", image: "/singapore/marina_bay_sands.jpg" },
      { name: "Gardens by the Bay", description: "Supertree Grove light show and Cloud Forest conservatories.", image: "/singapore/gardens_by_the_bay.jpg" }
    ],
    inclusions: ["2 Nights Genting Dream Ocean Balcony Suite", "4 Nights Singapore City Hotel", "All Onboard Meals", "Singapore E-Visa"],
    exclusions: ["Port Taxes (~₹6,500)", "International Flights"],
    hotels: [{ name: "Grand Copthorne Waterfront", location: "Singapore", stars: 4, room_type: "Deluxe Room", meal_plan: "Breakfast Included" }]
  },
  "singapore-family": {
    slug: "singapore-family",
    name: "Singapore Family Theme Parks & Safari (6D/5N)",
    duration: "6 Days / 5 Nights",
    price: 82000,
    rating: 4.9,
    reviews: 180,
    image: "/singapore/universal_studios.jpg",
    destinations: ["Singapore", "Universal Studios Sentosa", "River Wonders", "Night Safari", "Wild Wild Wet", "Jewel Changi"],
    highlights: [
      "Kid-Friendly 6-Day Family Vacation in Lion City",
      "Universal Studios Sentosa Day Pass with Character Meet & Greets",
      "Mandai River Wonders Giant Panda Forest & Night Safari Tram Ride",
      "Wild Wild Wet Water Park High-Speed Thrill Slides & Kid Splash Pools",
      "Spacious 4-Star Family Suite Accommodations with Daily Breakfast",
      "Private Chauffeured MPV Van Transfers for Entire Family"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Singapore → Family Suite Check-in & Night Safari",
        description: "Chauffeured MPV pickup from Changi Airport. Check-in to spacious family suite. Evening River Wonders giant panda enclosure & Mandai Night Safari tram ride.",
        activities: ["Changi Airport Pickup", "Family Suite Check-in", "River Wonders Pandas", "Night Safari Tram Ride"]
      },
      {
        day: 2,
        title: "Universal Studios Family Adventure Pass",
        description: "Full day at Universal Studios Sentosa with character meet & greets (Despicable Me Minions, Shrek, Madagascar & Transformers).",
        activities: ["Universal Studios Day Pass", "Minion Land", "Shrek Far Far Away Castle"]
      },
      {
        day: 3,
        title: "Wild Wild Wet Water Park & Downtown East Family Fun",
        description: "Day trip to Wild Wild Wet waterpark featuring kid splash pools, high-speed water slides, and Tsunami wave pool.",
        activities: ["Wild Wild Wet Entry", "Tsunami Wave Pool", "Free Fall Slide"]
      },
      {
        day: 4,
        title: "Singapore Science Centre & 8K 3D Omni-Theatre Show",
        description: "Hands-on interactive science exhibits at Science Centre Singapore and 8K 3D Omni-Theatre planetarium show.",
        activities: ["Science Centre Entry", "Omni-Theatre 3D Show", "Waterworks Park"]
      },
      {
        day: 5,
        title: "Gardens by the Bay Children's Garden & Cable Car",
        description: "Water play at Far East Organization Children's Garden and Mount Faber Cable Car flight to Sentosa Island.",
        activities: ["Children's Garden Water Play", "Mount Faber Cable Car Pass"]
      },
      {
        day: 6,
        title: "Jewel Changi Bouncing Nets & Departure Flight",
        description: "Jewel Changi Canopy Park Bouncing Nets & Hedge Maze before boarding return departure flight.",
        activities: ["Jewel Bouncing Nets", "Changi Airport Drop-off"]
      }
    ],
    images: [
      "/singapore/universal_studios.jpg",
      "/singapore/mandai_river_wonders.jpg",
      "/singapore/night_safari.jpg",
      "/singapore/gardens_by_the_bay.jpg",
      "/singapore/jewel_changi.jpg"
    ],
    attractions: [
      { name: "Universal Studios Sentosa", description: "Southeast Asia's premier movie theme park with world-class rides.", image: "/singapore/universal_studios.jpg" },
      { name: "Mandai River Wonders & Pandas", description: "Asia's only river-themed wildlife park with Giant Panda forest.", image: "/singapore/mandai_river_wonders.jpg" },
      { name: "Jewel Changi Airport Rain Vortex", description: "Spectacular 40m indoor waterfall and canopy park bouncing nets.", image: "/singapore/jewel_changi.jpg" }
    ],
    inclusions: [
      "5 Nights 4-Star Family Suite Accommodation with Breakfast",
      "Universal Studios + Night Safari + Wild Wild Wet Tickets",
      "Singapore E-Visa for Entire Family",
      "Private Chauffeured MPV Van Transfers"
    ],
    exclusions: ["International Flights", "GST / TCS extra as applicable"],
    hotels: [{ name: "Village Hotel Bugis Family Suite", location: "Singapore", stars: 4, room_type: "Family Suite Room", meal_plan: "Breakfast Included" }]
  },
  "singapore-honeymoon": {
    slug: "singapore-honeymoon",
    name: "Singapore Romantic Honeymoon Retreat (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 95000,
    rating: 4.9,
    reviews: 165,
    image: "/singapore/cable_car_sentosa.jpg",
    destinations: ["Singapore", "Southern Islands", "Marina Bay Sands", "Gardens by the Bay", "Sentosa Island"],
    highlights: [
      "Romantic 5-Day Luxury Couples Escape",
      "Private Yacht Sunset Charter to Southern Islands with Champagne",
      "Singapore Cable Car Private Cabin 4-Course Sky Dining Dinner",
      "Gardens by the Bay Cloud Forest & Floral Fantasy Entry",
      "90-Minute Aromatherapy Couples Spa Experience",
      "Private Mercedes Sedan Transfers & Romantic Bed Decoration Setup"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Singapore → Luxury Hotel Welcome & Flower Setup",
        description: "VIP Mercedes sedan pickup from Changi Airport. Check-in to Marina Bay Sands / Shangri-La with romantic room decor and wine bottle.",
        activities: ["Mercedes Airport Pickup", "Romantic Room Setup", "Welcome Wine Bottle"]
      },
      {
        day: 2,
        title: "Private Yacht Sunset Cruise to Southern Islands",
        description: "Afternoon private luxury yacht charter to Lazarus & St. John's islands with sunset champagne and charcuterie board.",
        activities: ["Private Yacht Charter", "Lazarus Island Visit", "Sunset Champagne Toast"]
      },
      {
        day: 3,
        title: "Singapore Cable Car Sky Dining 4-Course Dinner",
        description: "Explore Gardens by the Bay Cloud Forest. Evening romantic 4-course dinner inside private Cable Car cabin high above city lights.",
        activities: ["Cloud Forest Dome", "Private Cable Car Sky Dining"]
      },
      {
        day: 4,
        title: "Couples Luxury Spa & Rooftop Bar Evening",
        description: "Indulge in a 90-minute aromatherapy couples spa session. Evening cocktails at CÉ LA VI rooftop bar overlooking Marina Bay Sands infinity pool.",
        activities: ["Couples Aromatherapy Spa", "CÉ LA VI Rooftop Bar Cocktails"]
      },
      {
        day: 5,
        title: "Luxury Champagne Breakfast & Airport Transfer",
        description: "Lazy champagne breakfast in bed. Private Mercedes transfer to Changi Airport for departure flight.",
        activities: ["Champagne Breakfast", "Mercedes Airport Drop-off"]
      }
    ],
    images: [
      "/singapore/cable_car_sentosa.jpg",
      "/singapore/gardens_by_the_bay.jpg",
      "/singapore/marina_bay_sands.jpg",
      "/singapore/wings_of_time_sentosa.jpg"
    ],
    attractions: [
      { name: "Cable Car Sky Dining", description: "Romantic 4-course dinner high above HarbourFront and Sentosa.", image: "/singapore/cable_car_sentosa.jpg" },
      { name: "Gardens by the Bay & Supertrees", description: "Cloud Forest conservatory and dazzling evening light show.", image: "/singapore/gardens_by_the_bay.jpg" },
      { name: "Marina Bay Sands SkyPark", description: "Iconic 57th-floor skyline observatory and infinity views.", image: "/singapore/marina_bay_sands.jpg" }
    ],
    inclusions: [
      "4 Nights 5-Star Hotel Stay with Champagne Breakfast",
      "Private Yacht Sunset Charter with Wine & Cheese",
      "Cable Car Private Cabin Sky Dining Dinner",
      "Couples Aromatherapy Spa Voucher",
      "Singapore E-Visa & Mercedes Transfers"
    ],
    exclusions: ["International Flights", "GST / TCS"],
    hotels: [{ name: "Shangri-La Singapore", location: "Singapore", stars: 5, room_type: "Valley Wing Deluxe Suite", meal_plan: "Breakfast Included" }]
  },
  "singapore-luxury": {
    slug: "singapore-luxury",
    name: "Singapore Ultra-Luxury VVIP Collection (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 210000,
    rating: 5.0,
    reviews: 140,
    image: "/singapore/marina_bay_sands.jpg",
    destinations: ["Marina Bay Sands", "Universal Studios VIP", "Changi JetQuay VVIP", "Sentosa Island"],
    highlights: [
      "Ultra-Exclusive VVIP 5-Day Singapore Experience",
      "Marina Bay Sands Club Suite Stay with Rooftop Infinity Pool Access",
      "Changi Airport JetQuay Private Tarmac Lounge & Immigration Reception",
      "Private Charter Helicopter Aerial Flight over Singapore Skyline",
      "Universal Studios Personal VIP Host Tour (Zero Queueing)",
      "Mercedes-Maybach Private Chauffeured Transfers throughout"
    ],
    itinerary: [
      {
        day: 1,
        title: "Changi VVIP JetQuay Terminal Pickup → Marina Bay Sands Suite",
        description: "Private VIP tarmac reception at JetQuay luxury terminal. Mercedes Maybach transfer to Marina Bay Sands Club Suite.",
        activities: ["JetQuay VVIP Tarmac Reception", "Maybach Transfer", "MBS Club Suite Check-in"]
      },
      {
        day: 2,
        title: "Exclusive Infinity Pool Access & Michelin Star Dining",
        description: "Private cabana at world-famous 57th-floor infinity pool. Evening multi-course dinner at CUT by Wolfgang Puck.",
        activities: ["Rooftop Infinity Pool Cabana", "CUT Michelin Star Dinner"]
      },
      {
        day: 3,
        title: "Private Helicopter Aerial Skyline Tour",
        description: "Soar over Singapore skyline, Marina Bay, and Sentosa Island in a private charter helicopter.",
        activities: ["Helicopter Aerial Tour", "City Skyline Flight"]
      },
      {
        day: 4,
        title: "Universal Studios VIP Tour Guide & Yacht Charter",
        description: "Personal VIP host at Universal Studios (no queues) followed by sunset yacht voyage.",
        activities: ["Universal Studios VIP Host", "Sunset Yacht Charter"]
      },
      {
        day: 5,
        title: "Personal Shopper at The Shoppes → JetQuay Departure",
        description: "Private personal shopper experience at MBS Shoppes. JetQuay lounge transfer for departure flight.",
        activities: ["MBS Shoppes Personal Shopper", "JetQuay VIP Lounge Drop-off"]
      }
    ],
    images: [
      "/singapore/marina_bay_sands.jpg",
      "/singapore/gardens_by_the_bay.jpg",
      "/singapore/universal_studios.jpg",
      "/singapore/singapore_flyer.jpg"
    ],
    attractions: [
      { name: "Marina Bay Sands Club Suite", description: "57th floor infinity pool and VVIP lounge privileges.", image: "/singapore/marina_bay_sands.jpg" },
      { name: "Singapore Flyer & Time Capsule", description: "Giant observation wheel with 45km panoramic skyline views.", image: "/singapore/singapore_flyer.jpg" }
    ],
    inclusions: ["4 Nights Marina Bay Sands Club Suite Stay", "Unlimited Infinity Pool Access", "Helicopter Flight", "Maybach Transfers", "Universal VIP Host"],
    exclusions: ["First Class Airfare"],
    hotels: [{ name: "Marina Bay Sands", location: "Singapore", stars: 5, room_type: "Sands Premier Club Suite", meal_plan: "Full Club Privileges Included" }]
  },
  "singapore-city-delight": {
    slug: "singapore-city-delight",
    name: "Singapore City Delight (4D/3N)",
    duration: "4 Days / 3 Nights",
    price: 45000,
    rating: 4.8,
    reviews: 130,
    image: "/singapore/merlion_park.jpg",
    destinations: ["Singapore", "Gardens by the Bay", "Merlion Park", "Orchard Road", "Jewel Changi"],
    highlights: [
      "Budget-Friendly 4-Day Singapore Highlights Package",
      "Gardens by the Bay Supertree Grove Light Show",
      "Merlion Park & Chinatown Heritage Walk",
      "Orchard Road Shopping & Jewel Changi Rain Vortex",
      "Singapore E-Visa Assistance & Hotel Transfers"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival Singapore → Gardens by the Bay Light Show",
        description: "Airport transfer to city hotel. Evening Gardens by the Bay Supertree Grove light show.",
        activities: ["Airport Pickup", "Gardens by the Bay"]
      },
      {
        day: 2,
        title: "Singapore Half-Day City Tour & Chinatown",
        description: "Guided tour of Merlion Park, Chinatown, and Little India.",
        activities: ["Merlion Park", "Chinatown", "Little India"]
      },
      {
        day: 3,
        title: "Orchard Road Shopping Spree & Bugis Street",
        description: "Full day shopping along Orchard Road malls and souvenir shopping at Bugis Street.",
        activities: ["Orchard Road", "Bugis Street Shopping"]
      },
      {
        day: 4,
        title: "Jewel Changi Rain Vortex → Departure",
        description: "Jewel Changi Rain Vortex visit before return departure flight.",
        activities: ["Jewel Rain Vortex", "Departure Flight"]
      }
    ],
    images: [
      "/singapore/merlion_park.jpg",
      "/singapore/gardens_by_the_bay.jpg",
      "/singapore/haji_lane_heritage.jpg",
      "/singapore/jewel_changi.jpg"
    ],
    attractions: [
      { name: "Merlion Park & Marina Bay", description: "Iconic Singapore landmark statue overlooking Marina Bay.", image: "/singapore/merlion_park.jpg" },
      { name: "Cultural Quarters: Haji Lane & Chinatown", description: "Vibrant shophouses, street art murals and heritage cafes.", image: "/singapore/haji_lane_heritage.jpg" },
      { name: "Jewel Changi Rain Vortex", description: "World's tallest indoor waterfall surrounded by lush terraced gardens.", image: "/singapore/jewel_changi.jpg" }
    ],
    inclusions: ["3 Nights 4-Star Hotel Stay with Breakfast", "Singapore E-Visa", "City Tour", "Transfers"],
    exclusions: ["International Flights", "GST / TCS"],
    hotels: [{ name: "V Hotel Lavender", location: "Singapore", stars: 4, room_type: "Standard Room", meal_plan: "Breakfast Included" }]
  },
  "rann-utsav-2d1n": {
    slug: "rann-utsav-2d1n",
    name: "Rann Utsav 2D/1N Express Overnight Tent City",
    duration: "2 Days / 1 Night",
    price: 12500,
    rating: 4.9,
    reviews: 310,
    image: "/Rann-Utsav-Gujarat.png",
    images: [
      "/rann_utsav_white_desert.jpg",
      "/Rann-Utsav-Gujarat.png",
      "/rann_utsav_kalo_dungar.jpg"
    ],
    destinations: ["Bhuj (Airport / Station)", "Tent City Dhordo (White Rann)"],
    quick_facts: {
      groupSize: "Shared Bus / Custom",
      bestTime: "Nov to Mar",
      difficulty: "Easy",
      ageLimit: "All Ages",
      accommodation: "Tent City Dhordo",
      meals: "All Meals (AP)",
      transport: "Fixed AC Coach"
    },
    map_locations: [
      { name: 'Bhuj (Airport / Station)', coordinates: [23.2420, 69.6669], description: 'AC Coach Pickup (08:15 AM, 10:00 AM, 01:30 PM, 03:30 PM)' },
      { name: 'Tent City Dhordo (White Rann)', coordinates: [23.7802, 69.5135], description: 'AC Swiss Tent Stay & Sunset Walk' }
    ],
    highlights: ["Official White Rann Entry Permit Included", "Evoke Tent City Dhordo AC Deluxe Swiss Tent", "Sunset & Sunrise Walk on Salt Desert", "Bhuj Fixed AC Shared Coach Pickup"],
    itinerary: [
      {
        day: 1,
        title: "Bhuj AC Shared Coach Pickup → Tent City Dhordo Check-in → White Rann Sunset",
        description: "Fixed AC shared coach pickup from Bhuj Railway Station / Airport (Scheduled departures: 08:15 AM, 10:00 AM, 01:30 PM, 03:30 PM). Welcome at Tent City Dhordo, grand Kutchi lunch buffet, and afternoon trip to the Great White Rann for a glowing sunset walk.",
        activities: ["Bhuj Fixed AC Coach Pickup", "Tent City Check-in", "Kutchi Lunch Buffet", "White Rann Sunset Walk", "Live Kutchi Folk Garba Night"]
      },
      {
        day: 2,
        title: "White Rann Sunrise → Craft Shopping → Bhuj Drop-off",
        description: "Early morning sunrise walk on the salt desert. Enjoy breakfast, explore Gandhi Nu Gam artisan village, and transfer to Bhuj Airport / Railway Station by AC Coach.",
        activities: ["White Rann Sunrise Walk", "Buffet Breakfast", "Gandhi Nu Gam Handicrafts", "Bhuj AC Coach Drop-off"]
      }
    ],
    inclusions: [
      "Fixed AC Shared Coach Transfers from Bhuj Airport / Railway Station",
      "1 Night Stay in Tent City Dhordo (Evoke Experiences) AC Swiss Tent",
      "Official White Rann Border Entry Permits Included",
      "All Gourmet Meals Included (Breakfast, Lunch, High Tea, Dinner)",
      "Evening Kutchi Folk Cultural Show & Craft Market Entry"
    ],
    exclusions: ["Train / Flight tickets to Bhuj", "Personal expenses (ATV rides, Paramotoring)", "GST 18%"],
    hotels: [{ name: "Tent City Dhordo (Evoke)", location: "Dhordo, Kutch", stars: 5, room_type: "AC Deluxe / Premium Swiss Tent", meal_plan: "All Meals Included (AP)" }]
  },
  "rann-utsav-3d2n": {
    slug: "rann-utsav-3d2n",
    name: "Rann Utsav 3D/2N Flagship Tent City Retreat",
    duration: "3 Days / 2 Nights",
    price: 18500,
    rating: 4.95,
    reviews: 780,
    image: "/rann-utsav.jpg",
    images: [
      "/rann_utsav_white_desert.jpg",
      "/Rann-Utsav-Gujarat.png",
      "/rann_utsav_kalo_dungar.jpg"
    ],
    destinations: ["Bhuj", "Tent City Dhordo", "Kalo Dungar", "Gandhi Nu Gam"],
    quick_facts: {
      groupSize: "Shared Bus / Custom",
      bestTime: "Nov to Mar",
      difficulty: "Easy",
      ageLimit: "All Ages",
      accommodation: "Tent City Dhordo (2N)",
      meals: "All Meals (AP)",
      transport: "Fixed AC Coach"
    },
    map_locations: [
      { name: 'Bhuj (Airport / Station)', coordinates: [23.2420, 69.6669], description: 'AC Coach Pickup & Drop-off' },
      { name: 'Tent City Dhordo (White Rann)', coordinates: [23.7802, 69.5135], description: '2 Nights AC Swiss Tent Stay' },
      { name: 'Kalo Dungar (Black Hill 462m)', coordinates: [23.8643, 69.8702], description: 'Highest Point in Kutch & Border View' },
      { name: 'Gandhi Nu Gam Craft Village', coordinates: [23.7600, 69.5500], description: 'Bandhani & Handicraft Village' }
    ],
    highlights: ["2 Nights Tent City Dhordo (Evoke Experiences)", "Kalo Dungar Black Hill Excursion", "Gandhi Nu Gam Handicraft Village", "Smritivan Earthquake Memorial Museum"],
    itinerary: [
      {
        day: 1,
        title: "Bhuj Fixed AC Coach Pickup → Tent City Dhordo Check-in & White Rann Sunset",
        description: "Fixed AC shared coach pickup from Bhuj Railway Station / Airport (Scheduled departure: 08:15 AM, 10:00 AM, 01:30 PM, 03:30 PM). Welcome at Tent City Dhordo, grand Kutchi lunch buffet, and afternoon trip to the White Rann for a glowing sunset walk.",
        activities: ["Bhuj Fixed AC Coach Pickup", "Tent City Check-in", "Kutchi Lunch Buffet", "White Rann Sunset Walk", "Live Kutchi Folk Garba Night"]
      },
      {
        day: 2,
        title: "White Rann Sunrise → Kalo Dungar (Black Hill) & Gandhi Nu Gam Craft Village",
        description: "Early morning sunrise walk on the salt desert. Excursion to Kalo Dungar (highest point in Kutch at 462m) offering panoramic views of the Indo-Pak border & Dattatreya Temple. Shopping at Gandhi Nu Gam craft village for Bandhani tie-dye & Ajrakh block prints.",
        activities: ["White Desert Sunrise Walk", "Kalo Dungar Black Hill Panorama", "Dattatreya Temple Visit", "Gandhi Nu Gam Handicrafts", "Siddi Dhamal Cultural Show"]
      },
      {
        day: 3,
        title: "Tent City Check-out → Smritivan Museum & Bhuj Drop-off",
        description: "Buffet breakfast at Tent City. Check-out and transfer to Bhuj. Visit Smritivan Earthquake Memorial Museum and Bhujodi weaver village before drop-off at Bhuj Airport / Railway Station by AC Coach.",
        activities: ["Buffet Breakfast", "Smritivan Earthquake Museum", "Bhujodi Weaver Village", "Bhuj AC Coach Drop-off"]
      }
    ],
    inclusions: [
      "Fixed AC Shared Coach Transfers from Bhuj Airport / Railway Station",
      "2 Nights Stay in Tent City Dhordo (Evoke Experiences) AC Swiss Tent",
      "Official White Rann Border Entry Permits Included",
      "All Gourmet Meals Included (Breakfast, Lunch, High Tea, Dinner)",
      "Kalo Dungar Black Hill & Gandhi Nu Gam Excursion",
      "Smritivan Earthquake Museum Sightseeing Tour"
    ],
    exclusions: ["Train / Flight tickets to Bhuj", "Personal expenses & ATV rides", "GST 18%"],
    hotels: [{ name: "Tent City Dhordo (Evoke)", location: "Dhordo, Kutch", stars: 5, room_type: "2 Nights AC Deluxe / Premium Swiss Tent", meal_plan: "All Meals Included (AP)" }]
  },
  "rann-utsav-4d3n": {
    slug: "rann-utsav-4d3n",
    name: "Grand Rann Utsav & Mandvi Beach Circuit (4D/3N)",
    duration: "4 Days / 3 Nights",
    price: 24500,
    rating: 4.98,
    reviews: 940,
    image: "/rann_utsav_road_to_heaven.jpg",
    images: [
      "/rann_utsav_white_desert.jpg",
      "/rann_utsav_road_to_heaven.jpg",
      "/rann_utsav_kalo_dungar.jpg"
    ],
    destinations: ["Bhuj", "Tent City Dhordo", "Mandvi Beach", "Kalo Dungar"],
    quick_facts: {
      groupSize: "Shared Bus / Custom",
      bestTime: "Nov to Mar",
      difficulty: "Easy",
      ageLimit: "All Ages",
      accommodation: "Tent City Dhordo (3N)",
      meals: "All Meals (AP)",
      transport: "Fixed AC Coach"
    },
    map_locations: [
      { name: 'Bhuj (Airport / Station)', coordinates: [23.2420, 69.6669], description: 'AC Coach Pickup & Drop-off' },
      { name: 'Tent City Dhordo (White Rann)', coordinates: [23.7802, 69.5135], description: '3 Nights AC Swiss Tent Stay' },
      { name: 'Mandvi Beach & Royal Palace', coordinates: [22.8333, 69.3500], description: 'Vijay Vilas Palace & Private Beach Tour' },
      { name: 'Kalo Dungar (Black Hill 462m)', coordinates: [23.8643, 69.8702], description: 'Panoramic 360° Indo-Pak Border View' }
    ],
    highlights: ["3 Nights Tent City Dhordo (Evoke Experiences)", "Full Day Mandvi Beach & Vijay Vilas Palace Tour", "Kalo Dungar Black Hill Excursion", "Smritivan Earthquake Museum"],
    itinerary: [
      {
        day: 1,
        title: "Bhuj Fixed AC Coach Pickup → Tent City Dhordo Arrival & White Rann Sunset",
        description: "Fixed AC shared coach pickup from Bhuj Railway Station / Airport (Scheduled departure: 08:15 AM, 10:00 AM, 01:30 PM, 03:30 PM). Welcome at Tent City Dhordo, grand Kutchi lunch buffet, and afternoon trip to the White Rann for sunset walk.",
        activities: ["Bhuj Fixed AC Coach Pickup", "Tent City Check-in", "Kutchi Lunch Buffet", "White Rann Sunset Walk"]
      },
      {
        day: 2,
        title: "Full Day Excursion to Mandvi Beach & Vijay Vilas Palace",
        description: "Complimentary AC shared coach tour to Mandvi (140 km from Dhordo). Enjoy private Mandvi Beach, visit Vijay Vilas Palace (1929 royal summer retreat), and Shyamji Krishna Varma Memorial.",
        activities: ["Mandvi Private Beach", "Vijay Vilas Palace Tour", "Shyamji Krishna Varma Memorial", "Beachside Tea & Snacks"]
      },
      {
        day: 3,
        title: "White Rann Sunrise → Kalo Dungar & Gandhi Nu Gam Craft Village",
        description: "Morning salt flat sunrise walk. Excursion to Kalo Dungar Black Hill for panoramic desert views and artisan shopping at Gandhi Nu Gam craft village.",
        activities: ["Sunrise Walk", "Kalo Dungar View", "Gandhi Nu Gam Crafts", "Live Garba Night Show"]
      },
      {
        day: 4,
        title: "Check-out → Smritivan Museum & Bhuj Departure",
        description: "Breakfast at Tent City. Check-out and AC coach transfer to Bhuj for Smritivan Earthquake Museum sightseeing and drop-off at Bhuj Airport / Railway Station.",
        activities: ["Buffet Breakfast", "Smritivan Museum Tour", "Airport/Station Drop-off"]
      }
    ],
    inclusions: [
      "Fixed AC Shared Coach Transfers from Bhuj Airport / Railway Station",
      "3 Nights Stay in Tent City Dhordo (Evoke Experiences) AC Swiss Tent",
      "Mandvi Beach & Vijay Vilas Palace Full Day Excursion",
      "All Gourmet Meals Included (Breakfast, Lunch, High Tea, Dinner)",
      "Official White Rann Border Entry Permits Included"
    ],
    exclusions: ["Train / Flight tickets to Bhuj", "Personal shopping & camera fees", "GST 18%"],
    hotels: [{ name: "Tent City Dhordo (Evoke)", location: "Dhordo, Kutch", stars: 5, room_type: "3 Nights AC Deluxe / Premium Swiss Tent", meal_plan: "All Meals Included (AP)" }]
  },
  "rann-utsav-5d4n": {
    slug: "rann-utsav-5d4n",
    name: "Royal Kutch Heritage & Beach (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 24500,
    rating: 5.0,
    reviews: 195,
    image: "/Mandvi Beach_Kutch.png",
    destinations: ["Tent City Dhordo", "Road to Heaven", "Mandvi Beach", "Vijay Vilas Palace", "Bhuj"],
    highlights: ["Tent City Dhordo 2 Nights + Mandvi Beach Resort 2 Nights", "Vijay Vilas Palace & Private Beach", "Road to Heaven Highway Drive"],
    itinerary: [
      {
        day: 1,
        title: "Bhuj → Tent City Dhordo Check-in → White Desert Sunset",
        description: "Welcome at Bhuj. Drive to Tent City Dhordo, check-in, lunch, and White Rann sunset experience.",
        activities: ["Bhuj Station Welcome", "Tent City Check-in", "Sunset Salt Flat Walk"]
      },
      {
        day: 2,
        title: "Full Day Tent City & Kalo Dungar Panoramic Excursion",
        description: "Sunrise walk, Black Hill Dattatreya Temple visit, and Kutchi cultural performance.",
        activities: ["Kalo Dungar Panorama", "Gandhi Nu Gam Handicrafts", "Siddi Dhamal Stage Show"]
      },
      {
        day: 3,
        title: "Road to Heaven Drive → Dholavira Ruins → Transfer to Mandvi Coast",
        description: "Cross the Road to Heaven highway, tour Dholavira UNESCO site, and drive to Mandvi Beach.",
        activities: ["Road to Heaven Highway", "Dholavira Harappan Tour", "Mandvi Coastal Resort Check-in"]
      },
      {
        day: 4,
        title: "Mandvi Coast → Vijay Vilas Palace → Sunset Beach Camel Ride",
        description: "Tour the magnificent Vijay Vilas Palace filming location, private beach access, and sunset rides at Mandvi Windmill Beach.",
        activities: ["Vijay Vilas Palace Tour", "Private Royal Beach Walk", "Mandvi Windmill Sunset"]
      },
      {
        day: 5,
        title: "Mandvi Morning Walk → Bhuj Handicrafts → Drop-off",
        description: "Relax on Mandvi Beach, visit Bhujodi artisan weaving village, and transfer to Bhuj Airport/Station.",
        activities: ["Mandvi Beach Sunrise", "Bhujodi Handicrafts Shopping", "Airport Drop-off"]
      }
    ],
    inclusions: ["Vijay Vilas Palace Entry & Private Beach Access", "2 Nights Tent City + 2 Nights Luxury Mandvi Coastal Resort", "Road to Heaven Scenic Highway Drive", "All Meals & SUV Vehicle"],
    exclusions: ["Water sports at Mandvi Beach"],
    hotels: [
      { name: "Kutch Resort / Desert King Resort / White Rann Resort", location: "Dhordo, Rann Area", stars: 4, room_type: "Night 1 Stay", meal_plan: "MAP (Breakfast + Dinner)" },
      { name: "StayGuru Heaven Resort / The Dholavira Resort", location: "Dholavira UNESCO Site", stars: 4, room_type: "Night 2 Stay", meal_plan: "MAP (Breakfast + Dinner)" },
      { name: "Serena Beach Resort / Hotel Seven Beach Inn", location: "Mandvi Beach", stars: 4, room_type: "Night 3 Stay", meal_plan: "MAP (Breakfast + Dinner)" },
      { name: "Hotel Mangalam / Dream Resort / Hotel Kutch Elegance", location: "Bhuj City", stars: 4, room_type: "Night 4 Stay", meal_plan: "MAP (Breakfast + Dinner)" }
    ]
  },
  "kutch-rann-utsav": {
    slug: "kutch-rann-utsav",
    name: "Official Kutch Rann Utsav Festival & Heritage Tour",
    duration: "3 Days / 2 Nights",
    price: 11999,
    rating: 4.9,
    reviews: 245,
    image: "/rann_utsav_white_desert.jpg",
    images: [
      "/rann_utsav_white_desert.jpg",
      "/rann_utsav_tent_city.jpg",
      "/rann_utsav_kalo_dungar.jpg",
      "/rann_utsav_road_to_heaven.jpg",
      "/Rann-Utsav-Gujarat.png"
    ],
    destinations: ["Tent City Dhordo", "White Rann", "Kalo Dungar", "Gandhi Nu Gam", "Bhuj", "Dholavira", "Mandvi Beach"],
    highlights: ["Official Rann Utsav Dates: 1 Nov 2026 – 7 Mar 2027", "VIP White Rann Border Permit Included", "Multi-Destination Hotel Stays Across Kutch", "Kalo Dungar Black Hill & Road to Heaven Drive"],
    itinerary: [
      {
        day: 1,
        title: "Bhuj Pickup → Transfer to Dhordo → VIP Check-in at Tent City & White Desert Sunset",
        description: "Chauffeured pickup from Bhuj Airport/Station. Scenic drive to Tent City Dhordo (85 km). Traditional Kutchi Dhol welcome with floral garlands. Enjoy a lavish authentic Kutchi buffet lunch. In the afternoon, ride AC buses/golf carts to the Great Rann of Kutch for a magical sunset over endless white salt desert.",
        activities: ["Bhuj Pickup & Transfer", "Kutchi Dhol Welcome Ceremony", "Tent City VIP Check-in", "Kutchi Buffet Lunch", "Great White Rann Sunset Walk", "Kutchi Folk Music & Garba Stage Show"]
      },
      {
        day: 2,
        title: "Sunrise Desert Walk → Kalo Dungar (Black Hill) Panorama → Gandhi Nu Gam Artisan Village",
        description: "Wake up early for an ethereal sunrise walk on the sparkling salt flats. After breakfast, excursion to Kalo Dungar (Black Hill) — the highest point in Kutch at 462m, offering panoramic 360° views of the Indo-Pak border & Great Rann. Visit Lord Dattatreya Temple. Afternoon shopping at Gandhi Nu Gam craft village for Bandhani tie-dye & Ajrakh block prints.",
        activities: ["White Desert Sunrise Walk", "Kalo Dungar Black Hill Panorama", "Dattatreya Temple Visit", "Gandhi Nu Gam Artisan Handicrafts", "Siddi Dhamal African-Kutchi Dance", "Tent City Gala Buffet Dinner"]
      },
      {
        day: 3,
        title: "Tent City Check-out → Bhuj Heritage Tour (Aina Mahal, Prag Mahal) → Station/Airport Drop",
        description: "Buffet breakfast at Tent City. Check-out and drive back to Bhuj. Heritage tour of Prag Mahal (Italian Gothic palace tower), Aina Mahal (Hall of Mirrors), and Swaminarayan Temple. Visit Bhujodi weaver village for shawls & rugs before transfer to Bhuj Airport/Station.",
        activities: ["Buffet Breakfast", "Prag Mahal Gothic Tower Tour", "Aina Mahal Hall of Mirrors", "Swaminarayan Temple Visit", "Bhujodi Weaver Village", "Airport/Station Drop-off"]
      }
    ],
    inclusions: ["Dedicated Private AC Vehicle", "Accommodation with MAP/AP Meal Plan", "Pre-arranged White Rann Border Entry Permits", "Excursions to Kalo Dungar & Heritage Villages"],
    exclusions: ["Camera / Videography permits inside palaces", "Personal Shopping & Adventure rides", "GST / TCS extra as applicable"],
    hotels: [
      { name: "The Fern Residency / Dream Resort / Hotel Mangalam", location: "Bhuj City", stars: 4, room_type: "Night 1 Stay", meal_plan: "MAP (Breakfast + Dinner)", highlight: "Bhuj Heritage Base" },
      { name: "Kutch Yatra Resort / White Rann Resort / Kutch Resort", location: "Dhordo, Rann Area", stars: 4, room_type: "Night 2 Stay", meal_plan: "MAP (Breakfast + Dinner)", highlight: "White Rann Sunset & Bonfire Base" }
    ]
  },
  "classic-kashmir-5n6d": {
    slug: "classic-kashmir-5n6d",
    name: "Classic Kashmir Paradise (6D/5N)",
    duration: "6 Days / 5 Nights",
    price: 26500,
    rating: 4.9,
    reviews: 240,
    destinations: ["Srinagar", "Dal Lake", "Gulmarg", "Pahalgam", "Mughal Gardens"],
    highlights: ["1 Night Luxury Dal Lake Cedar Houseboat", "Gulmarg Gondola Cable Car Passes Phase 1 & 2", "Pahalgam Betaab Valley & Lidder River", "Mughal Gardens Nishat & Shalimar"],
    itinerary: [
      {
        day: 1,
        title: "Srinagar Airport Pickup → Hand-Carved Houseboat Check-in → Sunset Shikara Ride",
        description: "Chauffeured pickup from Sheikh ul-Alam International Airport (Srinagar). Welcome drink & Kashmiri Kahwa upon arrival at luxury hand-carved cedar houseboat on Dal Lake. In the evening, embark on a romantic 1-hour sunset Shikara ride across floating gardens, lotus swamps & Char Chinar island.",
        activities: ["Airport Chauffeured Transfer", "Kashmiri Kahwa Welcome", "Luxury Houseboat Check-in", "Sunset Shikara Ride on Dal Lake", "Floating Market Photo Stops", "4-Course Houseboat Dinner"]
      },
      {
        day: 2,
        title: "Srinagar Mughal Gardens Tour → Nishat Bagh, Shalimar Bagh & Shankaracharya Temple",
        description: "Post breakfast on the houseboat deck, explore Srinagar's iconic Mughal heritage circuit. Visit Nishat Bagh ('Garden of Joy') & Shalimar Bagh built by Emperor Jahangir. Ascend Takht-e-Suleiman hill to visit 2,500-year-old Shankaracharya Shiva Temple for breathtaking panoramic views of Srinagar city & Nigeen Lake.",
        activities: ["Houseboat Deck Breakfast", "Nishat Bagh Terraced Gardens", "Shalimar Bagh Royal Pavilion", "Shankaracharya Temple Hilltop", "Pari Mahal Sunset View", "Transfer to Srinagar 4-Star Resort"]
      },
      {
        day: 3,
        title: "Srinagar to Gulmarg → Gondola Cable Car Ride to Apharwat Peak (13,500 ft)",
        description: "Scenic 50 km drive past Tangmarg pine slopes to Gulmarg ('Meadow of Flowers'). Board the world's highest cable car — Gulmarg Gondola Phase 1 (Kongdoori) & Phase 2 (Apharwat Peak at 13,500 ft). Enjoy snow walking, sledge rides, ski slope views, and coffee at Apharwat snow cafe.",
        activities: ["Tangmarg Scenic Mountain Drive", "Gulmarg Gondola Phase 1 & 2 Cable Car", "Apharwat Snow Peak Excursion", "Ski Slope Photography", "Gulmarg Golf Course Visit", "Overnight Resort Stay in Gulmarg"]
      },
      {
        day: 4,
        title: "Gulmarg to Pahalgam → Pampore Saffron Fields & Lidder Riverbank Stroll",
        description: "Drive to Pahalgam ('Valley of Shepherds') via Pampore Saffron fields and Avantipur Sun Temple ruins. Check-in to Lidder riverbank resort. Spend the afternoon taking relaxing walks along the turquoise Lidder River, sipping fresh kahwa, and capturing snow peak reflections.",
        activities: ["Pampore Saffron Farm Visit", "Avantipur Historical Ruins Stop", "Lidder River Pine Forest Walk", "Fresh Kashmiri Kahwa Tasting", "Lidder Valley Riverside Resort Check-in"]
      },
      {
        day: 5,
        title: "Pahalgam Valleys Excursion → Betaab Valley, Aru Valley & Chandanwari",
        description: "Full day private cab excursion to Pahalgam's pristine alpine valleys. Tour Betaab Valley (filming location of Bollywood blockbuster Betaab), Aru Valley's lush meadows & pine wilderness, and Chandanwari (starting point of Amarnath Yatra). Optional pony ride to Baisaran ('Mini Switzerland').",
        activities: ["Betaab Valley River & Meadows", "Aru Valley Alpine Village", "Chandanwari Glacier View", "Baisaran Meadow Excursion", "Pahalgam Souvenir Shopping"]
      },
      {
        day: 6,
        title: "Pahalgam to Srinagar → Craft Shopping at Lal Chowk → Airport Departure Transfer",
        description: "Enjoy a leisurely breakfast surrounded by pine mountains. Drive back to Srinagar. Stop at Lal Chowk & Polo View market for authentic Kashmiri Pashmina shawls, saffron, dry fruits, and walnut wood crafts. Transfer to Srinagar Airport for your onward flight with unforgettable memories.",
        activities: ["Mountain View Breakfast", "Polo View Handicraft Shopping", "Pashmina & Saffron Procurement", "Airport Departure Transfer"]
      }
    ],
    image: "/kashmir/gulmarg_gondola.jpg",
    images: [
      "/kashmir/gulmarg_gondola.jpg",
      "/kashmir/dal_lake_shikara.jpg",
      "/kashmir/pahalgam_betaab_valley.jpg",
      "/kashmir/sonamarg_thajiwas_glacier.jpg",
      "/kashmir/srinagar_mughal_gardens.jpg",
      "/kashmir/doodhpathri_kashmir.jpg",
      "/kashmir/baisaran_valley_pahalgam.jpg",
      "/kashmir/sinthan_top_kashmir.jpg"
    ],
    attractions: [
      { name: "Gulmarg Gondola & Apharwat Peak", description: "World's 2nd highest cable car to 13,780 ft with panoramic snow views.", image: "/kashmir/gulmarg_gondola.jpg" },
      { name: "Dal Lake Shikara & Cedar Houseboats", description: "Traditional wooden Shikara cruise and heritage floating stays.", image: "/kashmir/dal_lake_shikara.jpg" },
      { name: "Pahalgam Betaab & Aru Valleys", description: "Lush pine meadows, roaring Lidder river and alpine trails.", image: "/kashmir/pahalgam_betaab_valley.jpg" }
    ],
    inclusions: ["Private Chauffeured AC SUV/Sedan from Srinagar Airport throughout", "1 Night Luxury Dal Lake Cedar Houseboat + 4 Nights 4-Star Hotel", "Pre-booked Gulmarg Gondola Cable Car Tickets Included", "1-Hour Sunset Shikara Ride on Dal Lake", "Daily Breakfast & Dinner Included", "Betaab Valley & Aru Valley Union Cabs Included"],
    exclusions: ["Flight / Train fares to Srinagar", "Personal ski equipment hire", "GST / TCS extra as applicable"],
    hotels: [{ name: "Dal Lake Luxury Cedar Houseboat & Srinagar 4-Star Resort", location: "Srinagar & Gulmarg", stars: 4, room_type: "Luxury Lake View Suite", meal_plan: "Breakfast & Dinner" }]
  },
  "grand-kashmir-7n8d": {
    slug: "grand-kashmir-7n8d",
    name: "Grand Kashmir & Sonamarg (8D/7N)",
    duration: "8 Days / 7 Nights",
    price: 42500,
    rating: 4.9,
    reviews: 310,
    image: "/kashmir/sonamarg_thajiwas_glacier.jpg",
    images: [
      "/kashmir/sonamarg_thajiwas_glacier.jpg",
      "/kashmir/gulmarg_gondola.jpg",
      "/kashmir/dal_lake_shikara.jpg",
      "/kashmir/pahalgam_betaab_valley.jpg",
      "/kashmir/srinagar_mughal_gardens.jpg",
      "/kashmir/baisaran_valley_pahalgam.jpg"
    ],
    destinations: ["Srinagar", "Sonamarg", "Gulmarg", "Pahalgam"],
    highlights: ["Sonamarg Thajiwas Glacier Day Trip", "Gulmarg Gondola Phase 1 & 2 Pass", "Dal Lake Houseboat Stay", "Pahalgam Aru & Betaab Valleys"],
    itinerary: [
      {
        day: 1,
        title: "Srinagar Airport Pickup → Luxury Houseboat Sunset",
        description: "Warm welcome at Srinagar Airport. Transfer to luxury houseboat, tea, and sunset Shikara ride.",
        activities: ["Airport Pickup", "Houseboat Welcome", "Shikara Sunset Ride"]
      },
      {
        day: 2,
        title: "Sonamarg Excursion → Thajiwas Glacier & Sindh River",
        description: "Full day excursion to Sonamarg ('Meadow of Gold'). Pony trek to Thajiwas Glacier and Sindh River views.",
        activities: ["Sonamarg Scenic Drive", "Thajiwas Glacier Trek", "Sindh River View"]
      },
      {
        day: 3,
        title: "Srinagar Heritage & Gardens → Pari Mahal & Hazratbal",
        description: "Tour Srinagar's iconic Mughal Gardens, Old City heritage markets, and Hazratbal Shrine.",
        activities: ["Mughal Gardens Tour", "Hazratbal Shrine", "Old City Craft Walk"]
      },
      {
        day: 4,
        title: "Srinagar to Gulmarg → Gondola Cable Car & Snow Meadows",
        description: "Drive to Gulmarg. Phase 1 & 2 Gondola ride, snow sports, and overnight stay at Gulmarg ski resort.",
        activities: ["Gulmarg Gondola Phase 1 & 2", "Apharwat Snow Walk", "Ski Resort Stay"]
      },
      {
        day: 5,
        title: "Gulmarg to Pahalgam → Apple Orchards & Lidder Valley",
        description: "Drive to Pahalgam. Enroute visit Apple Orchards & Pampore Saffron farms. Evening at Lidder riverbank.",
        activities: ["Apple Orchard Tour", "Pampore Saffron Farms", "Lidder River Walk"]
      },
      {
        day: 6,
        title: "Pahalgam Valleys → Betaab Valley, Aru Valley & Baisaran",
        description: "Full day tour of Betaab Valley, Aru Valley, Chandanwari, and mini-Switzerland Baisaran.",
        activities: ["Betaab Valley", "Aru Valley", "Baisaran Meadow Trek"]
      },
      {
        day: 7,
        title: "Pahalgam to Srinagar → Shopping & Craft Markets",
        description: "Return to Srinagar. Evening shopping for Pashmina shawls, saffron, dry fruits, and walnut wood craft.",
        activities: ["Pashmina Shopping", "Walnut Woodcrafts", "Srinagar Resort Stay"]
      },
      {
        day: 8,
        title: "Srinagar Airport Departure Transfer",
        description: "Check-out and transfer to Srinagar Airport for your return flight.",
        activities: ["Hotel Breakfast", "Airport Departure Drop-off"]
      }
    ],
    attractions: [
      { name: "Sonamarg Thajiwas Glacier", description: "Meadow of Gold glacier trek with snow activities.", image: "/kashmir/sonamarg_thajiwas_glacier.jpg" },
      { name: "Gulmarg Gondola Cable Car", description: "World's second highest operating cable car to 13,780 ft.", image: "/kashmir/gulmarg_gondola.jpg" },
      { name: "Dal Lake Shikara Cruise", description: "Sunset cruise on hand-carved wooden Shikara.", image: "/kashmir/dal_lake_shikara.jpg" }
    ],
    inclusions: ["Full Chauffeured AC SUV/Vehicle for 8 Days", "7 Nights Accommodation (1 Houseboat + 6 Deluxe Hotels)", "Sonamarg Day Trip Included", "Gulmarg Gondola Passes (Phase 1 & 2)", "Daily Breakfast & Dinner"],
    exclusions: ["Lunch and personal shopping expenses"],
    hotels: [{ name: "Srinagar Boutique Houseboat & Gulmarg Ski Resort", location: "Kashmir", stars: 4, room_type: "Deluxe Suite", meal_plan: "Breakfast & Dinner" }]
  },
  "gulmarg-srinagar-4n5d": {
    slug: "gulmarg-srinagar-4n5d",
    name: "Gulmarg & Srinagar Express (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 21500,
    rating: 4.8,
    reviews: 165,
    image: "/kashmir/gulmarg_gondola.jpg",
    images: [
      "/kashmir/gulmarg_gondola.jpg",
      "/kashmir/dal_lake_shikara.jpg",
      "/kashmir/srinagar_mughal_gardens.jpg"
    ],
    destinations: ["Srinagar", "Gulmarg", "Dal Lake"],
    highlights: ["Dal Lake Cedar Houseboat 1 Night", "Gulmarg Gondola Cable Car Ride", "Mughal Gardens Tour"],
    itinerary: [
      {
        day: 1,
        title: "Srinagar Arrival → Houseboat Check-in & Shikara Ride",
        description: "Airport pickup, transfer to Dal Lake houseboat, and evening Shikara ride.",
        activities: ["Airport Pickup", "Houseboat Check-in", "Sunset Shikara"]
      },
      {
        day: 2,
        title: "Srinagar Mughal Gardens → Nishat & Shalimar",
        description: "Explore Nishat Bagh, Shalimar Bagh, Cheshma Shahi, and Shankracharya.",
        activities: ["Nishat Bagh", "Shalimar Bagh", "Shankaracharya Temple"]
      },
      {
        day: 3,
        title: "Srinagar to Gulmarg → Gondola Cable Car Ride",
        description: "Drive to Gulmarg, enjoy Gondola ride up to Apharwat peak, and stay at Gulmarg.",
        activities: ["Gulmarg Drive", "Gondola Ride", "Snow Excursion"]
      },
      {
        day: 4,
        title: "Gulmarg to Srinagar → Local Crafts & Floating Market",
        description: "Return to Srinagar, floating market tour, and shopping at Lal Chowk.",
        activities: ["Floating Market", "Lal Chowk Shopping", "Craft Tour"]
      },
      {
        day: 5,
        title: "Srinagar Airport Departure",
        description: "Breakfast and departure transfer to Srinagar Airport.",
        activities: ["Breakfast", "Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Gulmarg Gondola", description: "Cable car flight with 360-degree snow peak vistas.", image: "/kashmir/gulmarg_gondola.jpg" },
      { name: "Dal Lake Shikara", description: "Iconic wooden Shikara cruise on Dal Lake.", image: "/kashmir/dal_lake_shikara.jpg" }
    ],
    inclusions: ["Dedicated Chauffeured Vehicle throughout 5 Days", "1 Night Houseboat + 3 Nights Deluxe Hotels", "Gulmarg Gondola Passes", "Shikara Ride & Daily Meals (Breakfast & Dinner)"],
    exclusions: ["Personal equipment rentals", "Airfare to Srinagar"],
    hotels: [{ name: "Dal Lake Houseboat & Srinagar Hotel", location: "Srinagar", stars: 4, room_type: "Standard Deluxe", meal_plan: "Breakfast & Dinner" }]
  },
  "kashmir-honeymoon-6n7d": {
    slug: "kashmir-honeymoon-6n7d",
    name: "Kashmir Romantic Honeymoon (7D/6N)",
    duration: "7 Days / 6 Nights",
    price: 38000,
    rating: 5.0,
    reviews: 289,
    image: "/kashmir/dal_lake_shikara.jpg",
    images: [
      "/kashmir/dal_lake_shikara.jpg",
      "/kashmir/gulmarg_gondola.jpg",
      "/kashmir/pahalgam_betaab_valley.jpg",
      "/kashmir/srinagar_mughal_gardens.jpg"
    ],
    destinations: ["Srinagar", "Dal Lake", "Gulmarg", "Pahalgam"],
    highlights: ["Flower Bed Decoration & Honeymoon Cake", "Candlelight Dinner on Dal Lake Houseboat", "Private Snow Photography Session in Gulmarg"],
    itinerary: [
      {
        day: 1,
        title: "Srinagar Arrival → Flower-Decorated Houseboat & Candlelight Dinner",
        description: "VIP airport pickup. Check-in to flower-decorated houseboat, welcome cake, Shikara ride & romantic candlelight dinner.",
        activities: ["VIP Houseboat Welcome", "Honeymoon Cake & Flowers", "Private Shikara Ride", "Candlelight Dinner"]
      },
      {
        day: 2,
        title: "Srinagar Couple Photography & Mughal Gardens",
        description: "Stroll through Nishat & Shalimar gardens with private photographer sessions.",
        activities: ["Couple Photography", "Mughal Gardens Walk", "Sunset Pari Mahal"]
      },
      {
        day: 3,
        title: "Srinagar to Gulmarg → Snow Gondola Ride & Mountain View Suite",
        description: "Drive to Gulmarg, Phase 1 & 2 Gondola ride, and overnight in luxury mountain suite.",
        activities: ["Gulmarg Drive", "Gondola Phase 1 & 2", "Snow Photography"]
      },
      {
        day: 4,
        title: "Gulmarg to Pahalgam → Lidder Riverbank Romantic Stroll",
        description: "Scenic drive to Pahalgam, riverbank walk, and luxury cottage stay.",
        activities: ["Saffron Fields Stop", "Lidder River Stroll", "Riverside Cottage"]
      },
      {
        day: 5,
        title: "Pahalgam Valleys → Betaab Valley & Aru Valley Couple Excursion",
        description: "Private cab excursion to Betaab Valley & Aru Valley filming spots.",
        activities: ["Betaab Valley", "Aru Valley", "Baisaran Pony Walk"]
      },
      {
        day: 6,
        title: "Pahalgam to Srinagar → Shopping & Houseboat Tea Session",
        description: "Return to Srinagar for shopping, Pashmina craft tour, and evening tea.",
        activities: ["Pashmina Craft Tour", "Old City Walk", "High Tea"]
      },
      {
        day: 7,
        title: "Srinagar Airport Departure Transfer",
        description: "Breakfast and departure transfer to airport.",
        activities: ["Breakfast", "Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Dal Lake Houseboat & Shikara", description: "Romantic candlelit wooden houseboat stay.", image: "/kashmir/dal_lake_shikara.jpg" },
      { name: "Gulmarg Gondola Ride", description: "Snowy cable car flight to Apharwat peak.", image: "/kashmir/gulmarg_gondola.jpg" }
    ],
    inclusions: ["Flower Bed Decoration & Honeymoon Cake on Day 1", "Candlelight Dinner on Houseboat", "Gondola Cable Car Passes (Phase 1 & 2)", "Private Chauffeured SUV throughout the trip", "Daily Breakfast & Special Dinners"],
    hotels: [{ name: "Dal Lake Honeymoon Houseboat & Gulmarg Boutique Suite", location: "Kashmir", stars: 5, room_type: "Honeymoon Suite", meal_plan: "Breakfast & Candlelight Dinners" }]
  },
  "kashmir-winter-snow": {
    slug: "kashmir-winter-snow",
    name: "Kashmir Winter Snow Special & Skiing (6D/5N)",
    duration: "6 Days / 5 Nights",
    price: 29500,
    rating: 4.9,
    reviews: 198,
    image: "/kashmir/gulmarg_gondola.jpg",
    images: [
      "/kashmir/gulmarg_gondola.jpg",
      "/kashmir/dal_lake_shikara.jpg",
      "/kashmir/sinthan_top_kashmir.jpg",
      "/kashmir/pahalgam_betaab_valley.jpg"
    ],
    destinations: ["Srinagar", "Gulmarg", "Drung Frozen Waterfall", "Dal Lake"],
    highlights: [
      "Heavy Snowfall & Skiing Slopes Excursion at Gulmarg",
      "Gulmarg Gondola Phase 1 & Phase 2 Snow Peak Tickets Included",
      "Drung Frozen Waterfall & Tangmarg Pine Forest Excursion",
      "1 Night Heated Dal Lake Cedar Houseboat with Kahwa",
      "Private Chauffeured 4x4 / AC SUV Vehicle with Snow Chains"
    ],
    itinerary: [
      {
        day: 1,
        title: "Srinagar Arrival → Heated Cedar Houseboat & Kahwa Welcome",
        description: "Arrival at Srinagar Sheikh ul-Alam Airport. Private transfer to heated cedar houseboat on Dal Lake. Enjoy traditional Kashmiri Kahwa & evening Shikara ride.",
        activities: ["Srinagar Airport Pickup", "Heated Houseboat Check-in", "Sunset Shikara Ride"]
      },
      {
        day: 2,
        title: "Srinagar to Gulmarg Snow Paradise → Gondola Phase 1 & 2",
        description: "Drive to snow-covered Gulmarg. Board Gondola Cable Car up to 13,500 ft Apharwat Peak. Enjoy snow sledging, ski lessons & snow angel fun.",
        activities: ["Gondola Phase 1 & 2 Cable Car", "Snow Sledging", "Ski Slope Lessons", "Apharwat Snow Peak"]
      },
      {
        day: 3,
        title: "Gulmarg Skiing & Drung Frozen Waterfall Excursion",
        description: "Excursion to Drung Frozen Waterfall near Tangmarg. Afternoon snowmobiling and hot tea at Gulmarg pine valley.",
        activities: ["Drung Frozen Waterfall", "Tangmarg Pine Forest", "Snowmobile Ride"]
      },
      {
        day: 4,
        title: "Gulmarg to Pahalgam → Frozen Lidder River & Saffron Farms",
        description: "Drive to snow-bound Pahalgam via Pampore saffron fields. Check-in to riverbank resort and enjoy evening bonfire.",
        activities: ["Pampore Saffron Farms", "Lidder River Walk", "Resort Bonfire Evening"]
      },
      {
        day: 5,
        title: "Pahalgam Betaab Valley & Aru Valley Snow Tour",
        description: "Explore Betaab Valley and Aru Valley blanketed in white snow by local 4x4 union cabs.",
        activities: ["Betaab Valley Snow Walk", "Aru Valley", "Chandanwari Snow Point"]
      },
      {
        day: 6,
        title: "Pahalgam to Srinagar → Lal Chowk Shopping → Airport Drop-off",
        description: "Return to Srinagar for Pashmina & Kesar shopping before airport departure transfer.",
        activities: ["Pashmina & Kesar Shopping", "Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Gulmarg Snow Gondola", description: "Phase 1 & 2 Gondola ascending to 13,780 ft.", image: "/kashmir/gulmarg_gondola.jpg" },
      { name: "Sinthan Top Snow Pass", description: "High-altitude 3,800m mountain snow pass.", image: "/kashmir/sinthan_top_kashmir.jpg" }
    ],
    inclusions: [
      "1 Night Heated Dal Lake Cedar Houseboat + 4 Nights 4-Star Heated Resort",
      "Gulmarg Gondola Phase 1 & Phase 2 Tickets Included",
      "Drung Frozen Waterfall Excursion",
      "Daily Breakfast & Dinner",
      "Private 4x4 / AC Vehicle Transfers with Snow Chains"
    ],
    exclusions: ["Skiing Instructor & Equipment Hire", "Airfare to Srinagar"],
    hotels: [{ name: "Heated Dal Lake Houseboat & Gulmarg Ski Resort", location: "Kashmir", stars: 4, room_type: "Heated Luxury Suite", meal_plan: "Breakfast & Dinner" }]
  },
  "kashmir-family-fun": {
    slug: "kashmir-family-fun",
    name: "Kashmir Family Adventure & Amusement (7D/6N)",
    duration: "7 Days / 6 Nights",
    price: 34000,
    rating: 4.9,
    reviews: 215,
    image: "/kashmir/doodhpathri_kashmir.jpg",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam", "Doodhpathri"],
    highlights: [
      "Complete Family Vacation Circuit with Kids Amusement",
      "Baisaran Valley 'Mini Switzerland' Pony Rides & Zorbing",
      "Doodhpathri 'Valley of Milk' River Stream Day Trip",
      "Dal Lake Floating Vegetable Market Early Morning Shikara Tour",
      "Spacious Family Rooms & 4-Star Resort Accommodations"
    ],
    itinerary: [
      {
        day: 1,
        title: "Srinagar Arrival → Houseboat Check-in & Shikara Ride",
        description: "Pickup from Srinagar Airport. Houseboat check-in and family Shikara ride on Dal Lake.",
        activities: ["Airport Pickup", "Houseboat Check-in", "Family Shikara Ride"]
      },
      {
        day: 2,
        title: "Srinagar Mughal Gardens & Pari Mahal Sightseeing",
        description: "Tour Nishat Bagh, Shalimar Bagh, Pari Mahal, and Chinar Bagh.",
        activities: ["Nishat Bagh", "Shalimar Bagh", "Pari Mahal Sunset"]
      },
      {
        day: 3,
        title: "Day Trip to Doodhpathri 'Valley of Milk'",
        description: "Excursion to pristine Doodhpathri meadows and Shaliganga roaring river stream.",
        activities: ["Doodhpathri Meadows", "Shaliganga Stream", "Pine Forest Picnic"]
      },
      {
        day: 4,
        title: "Srinagar to Gulmarg → Gondola Cable Car Ride",
        description: "Drive to Gulmarg and board Gondola cable car for snow fun and family activities.",
        activities: ["Gulmarg Gondola Ride", "Snow Fun", "Golf Course Stroll"]
      },
      {
        day: 5,
        title: "Gulmarg to Pahalgam → Lidder River & Saffron Farms",
        description: "Drive to Pahalgam via Pampore saffron fields. Check-in to Lidder valley resort.",
        activities: ["Pampore Saffron Farms", "Lidder River Walk", "Resort Stay"]
      },
      {
        day: 6,
        title: "Pahalgam Valleys & Baisaran Mini Switzerland",
        description: "Tour Betaab Valley, Aru Valley, and Baisaran meadow for pony rides & zorbing.",
        activities: ["Betaab Valley", "Aru Valley", "Baisaran Zorbing & Pony Ride"]
      },
      {
        day: 7,
        title: "Pahalgam to Srinagar → Craft Shopping → Airport Drop-off",
        description: "Return to Srinagar for handicraft shopping and airport departure transfer.",
        activities: ["Polo View Shopping", "Airport Drop-off"]
      }
    ],
    images: [
      "/kashmir/doodhpathri_kashmir.jpg",
      "/kashmir/baisaran_valley_pahalgam.jpg",
      "/kashmir/gulmarg_gondola.jpg",
      "/kashmir/dal_lake_shikara.jpg"
    ],
    attractions: [
      { name: "Doodhpathri 'Valley of Milk'", description: "Emerald alpine meadow bowl and trout streams.", image: "/kashmir/doodhpathri_kashmir.jpg" },
      { name: "Baisaran Mini Switzerland", description: "Pony rides, zorbing and pine forest panoramas.", image: "/kashmir/baisaran_valley_pahalgam.jpg" }
    ],
    inclusions: [
      "6 Nights Accommodation (1 Houseboat + 5 4-Star Hotels)",
      "Doodhpathri Day Trip Included",
      "Gulmarg Gondola Passes",
      "Shikara Ride & Daily Meals (Breakfast & Dinner)",
      "Private AC Innova / SUV Vehicle for Entire Family"
    ],
    exclusions: ["Airfare to Srinagar", "Personal Expenses"],
    hotels: [{ name: "Grand Mumtaz Srinagar & Pine Spring Pahalgam", location: "Kashmir", stars: 4, room_type: "Family Suite", meal_plan: "Breakfast & Dinner" }]
  },
  "kashmir-gurez-offbeat": {
    slug: "kashmir-gurez-offbeat",
    name: "Kashmir & Gurez Valley Offbeat Explorer (8D/7N)",
    duration: "8 Days / 7 Nights",
    price: 46500,
    rating: 5.0,
    reviews: 145,
    image: "/kashmir/sinthan_top_kashmir.jpg",
    images: [
      "/kashmir/sinthan_top_kashmir.jpg",
      "/kashmir/gulmarg_gondola.jpg",
      "/kashmir/pahalgam_betaab_valley.jpg",
      "/kashmir/dal_lake_shikara.jpg"
    ],
    destinations: ["Srinagar", "Razdan Pass", "Gurez Valley", "Dawar", "Gulmarg", "Pahalgam"],
    highlights: [
      "Offbeat Border Circuit to Remote Gurez Valley",
      "Razdan Pass Altitude Drive (11,672 ft) & Harmukh Peak Views",
      "Habba Khatoon Pyramid Peak & Kishanganga River Camping",
      "Dawar Tribal Village Walk & Log Cabin Stays",
      "Gulmarg Gondola & Dal Lake Houseboat Stay Included"
    ],
    itinerary: [
      {
        day: 1,
        title: "Srinagar Arrival → Houseboat Check-in & Shikara Ride",
        description: "Airport pickup and transfer to Dal Lake houseboat.",
        activities: ["Airport Transfer", "Houseboat Check-in", "Sunset Shikara"]
      },
      {
        day: 2,
        title: "Srinagar to Gurez Valley via Razdan Pass (11,672 ft)",
        description: "Scenic mountain drive over Razdan Pass into remote Gurez Valley. Check-in to Dawar log cabin.",
        activities: ["Razdan Pass Altitude Drive", "Harmukh Peak View", "Dawar Check-in"]
      },
      {
        day: 3,
        title: "Gurez Valley Exploration → Habba Khatoon & Tulail Valley",
        description: "Explore Habba Khatoon pyramid peak, Kishanganga riverbank, and remote Tulail valley villages.",
        activities: ["Habba Khatoon Peak", "Kishanganga River Walk", "Tulail Offbeat Village"]
      },
      {
        day: 4,
        title: "Gurez Valley to Srinagar → Mughal Gardens",
        description: "Drive back to Srinagar. Evening stroll at Nishat Bagh and Shalimar Bagh.",
        activities: ["Scenic Return Drive", "Mughal Gardens Walk"]
      },
      {
        day: 5,
        title: "Srinagar to Gulmarg → Gondola Cable Car Ride",
        description: "Drive to Gulmarg and board Gondola cable car to Apharwat peak.",
        activities: ["Gulmarg Gondola", "Apharwat Peak"]
      },
      {
        day: 6,
        title: "Gulmarg to Pahalgam → Lidder Valley",
        description: "Drive to Pahalgam via Pampore saffron fields. Lidder riverbank relax.",
        activities: ["Pampore Saffron", "Lidder River Walk"]
      },
      {
        day: 7,
        title: "Pahalgam Betaab Valley & Aru Valley",
        description: "Explore Betaab Valley and Aru Valley.",
        activities: ["Betaab Valley", "Aru Valley"]
      },
      {
        day: 8,
        title: "Pahalgam to Srinagar Airport Departure",
        description: "Check-out and transfer to Srinagar Airport for departure flight.",
        activities: ["Breakfast", "Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Sinthan Top & High Passes", description: "3,800m altitude drive offering 360-degree snow peaks.", image: "/kashmir/sinthan_top_kashmir.jpg" },
      { name: "Gulmarg Gondola", description: "Phase 1 & 2 Gondola ascending to 13,780 ft.", image: "/kashmir/gulmarg_gondola.jpg" }
    ],
    inclusions: [
      "7 Nights Accommodation (1 Houseboat + 2 Gurez Log Cabins + 4 Hotels)",
      "Gurez Valley & Razdan Pass Permits Included",
      "Gulmarg Gondola Passes",
      "Daily Breakfast & Dinner",
      "Private Chauffeured 4x4 / SUV Vehicle"
    ],
    exclusions: ["Airfare to Srinagar", "Personal Expenses"],
    hotels: [{ name: "Gurez Wooden Resort & Dal Lake Cedar Houseboat", location: "Kashmir", stars: 4, room_type: "Riverside Suite", meal_plan: "Breakfast & Dinner" }]
  },
  "kashmir-ultra-luxury": {
    slug: "kashmir-ultra-luxury",
    name: "Kashmir Ultra-Luxury Private Villa & Houseboat (6D/5N)",
    duration: "6 Days / 5 Nights",
    price: 75000,
    rating: 5.0,
    reviews: 110,
    image: "/kashmir/gulmarg_gondola.jpg",
    images: [
      "/kashmir/gulmarg_gondola.jpg",
      "/kashmir/dal_lake_shikara.jpg",
      "/kashmir/srinagar_mughal_gardens.jpg",
      "/kashmir/pahalgam_betaab_valley.jpg"
    ],
    destinations: ["The Khyber Gulmarg", "Royal Cedar Houseboat", "Pahalgam Villa"],
    highlights: [
      "5-Star Stay at The Khyber Himalayan Resort & Spa Gulmarg",
      "Royal Heritage Dal Lake Houseboat with Butler & Gourmet Wazwan",
      "Private Helicopter Airport Transfer Option available",
      "Gondola VIP Fast-Track Entry & Private Heated SUV Transfers"
    ],
    itinerary: [
      {
        day: 1,
        title: "Srinagar Airport VVIP Pickup → Royal Cedar Houseboat Suite",
        description: "VIP reception at Srinagar Airport. Transfer to luxury Royal Cedar Houseboat suite. 7-Course authentic Wazwan dinner.",
        activities: ["VIP Airport Reception", "Royal Houseboat Suite Check-in", "7-Course Wazwan Dinner"]
      },
      {
        day: 2,
        title: "Private Shikara Lake Cruise & Mughal Gardens VIP Tour",
        description: "Private Shikara boat tour followed by exclusive guided tour of Nishat & Shalimar Gardens.",
        activities: ["Private Shikara Cruise", "VIP Mughal Gardens Tour"]
      },
      {
        day: 3,
        title: "Transfer to Gulmarg → The Khyber Resort & Gondola VIP Entry",
        description: "Transfer to 5-Star Khyber Resort & Spa Gulmarg. Fast-track VIP Gondola entry to Apharwat Peak.",
        activities: ["The Khyber Resort Check-in", "VIP Gondola Entry", "Resort Heated Pool"]
      },
      {
        day: 4,
        title: "Gulmarg Spa Day → Transfer to Pahalgam Luxury Villa",
        description: "Morning L'Occitane Spa session at Khyber. Drive to Pahalgam luxury private river villa.",
        activities: ["Khyber Spa Session", "Pahalgam River Villa Check-in"]
      },
      {
        day: 5,
        title: "Pahalgam Betaab & Aru Valley Private SUV Tour",
        description: "Private SUV tour of Betaab Valley and Aru Valley with gourmet picnic basket.",
        activities: ["Betaab Valley Picnic", "Aru Valley", "Lidder River Walk"]
      },
      {
        day: 6,
        title: "Private Transfer to Srinagar Airport → Departure",
        description: "Lazy breakfast and private Mercedes / Fortuner transfer to Srinagar Airport.",
        activities: ["Gourmet Breakfast", "VVIP Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Gulmarg Gondola & The Khyber", description: "VIP fast-track cable car entry and 5-star mountain resort.", image: "/kashmir/gulmarg_gondola.jpg" },
      { name: "Dal Lake Royal Cedar Houseboat", description: "Hand-carved cedar floating suite with butler service.", image: "/kashmir/dal_lake_shikara.jpg" }
    ],
    inclusions: [
      "5 Nights Luxury 5-Star Stay (The Khyber Gulmarg + Royal Cedar Houseboat)",
      "7-Course Authentic Kashmiri Wazwan Dinner Included",
      "VIP Fast-Track Gondola Passes",
      "Private Mercedes / Fortuner Transfers",
      "Daily Gourmet Breakfast & Dinners"
    ],
    exclusions: ["Airfare to Srinagar", "Spa Treatment Extra Costs"],
    hotels: [{ name: "The Khyber Himalayan Resort & Spa Gulmarg", location: "Gulmarg", stars: 5, room_type: "Luxury Pine View Suite", meal_plan: "Full Board" }]
  },
  "himachal-hill-stations": {
    slug: "himachal-hill-stations",
    name: "Himachal Hill Stations Spectacular (7D/6N)",
    duration: "7 Days / 6 Nights",
    price: 24500,
    rating: 4.9,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
    destinations: ["Shimla", "Manali", "Solang Valley", "Rohtang Pass", "Kasol", "Kullu"],
    highlights: [
      "Shimla Mall Road, Ridge & Kufri Snow Adventure",
      "Solang Valley & Rohtang Pass High-Altitude Snow Sports",
      "Kullu River Rafting & Authentic Handloom Shawl Factory Tour",
      "Kasol Parvati River Stroll & Israeli Cafe Experience",
      "Private Chauffeured AC Sedan / SUV Vehicle throughout 7 Days"
    ],
    itinerary: [
      {
        day: 1,
        title: "Chandigarh / Delhi Pickup → Scenic Drive to Shimla Hill Station",
        description: "Private chauffeured pickup from Chandigarh (or Delhi). Scenic uphill drive past Pinjore Gardens and Timber Trail cable car. Arrival in Shimla ('Queen of Hills'). Check-in to mountain view resort. Evening walk on Shimla Mall Road, Christ Church & The Ridge.",
        activities: ["Chauffeured Pickup", "Pinjore Gardens Stop", "Shimla Mountain Resort Check-in", "Mall Road & Ridge Evening Stroll"]
      },
      {
        day: 2,
        title: "Shimla & Kufri Snow Adventure → Jakhoo Hill Temple",
        description: "Post breakfast, excursion to Kufri at 8,600 ft altitude. Enjoy yak rides, horse riding, and panoramic Himalayan views at Mahasu Peak. Afternoon visit to 108ft Jakhoo Hanuman Temple statue atop Jakhoo Hill.",
        activities: ["Kufri Mountain Adventure", "Yak & Horse Riding", "Jakhoo Temple Hanuman Statue", "Heritage Museum Walk"]
      },
      {
        day: 3,
        title: "Shimla to Manali via Pandoh Dam & Kullu Valley",
        description: "Check-out and embark on a breathtaking drive to Manali along the Beas River. Enroute visit Pandoh Dam, Hanogi Mata Temple, Kullu Valley shawl weaving factory, and optional river rafting on the Beas river. Evening check-in at Manali resort.",
        activities: ["Pandoh Dam Viewpoint", "Kullu Beas River Rafting", "Handloom Shawl Factory Tour", "Manali Resort Check-in"]
      },
      {
        day: 4,
        title: "Solang Valley & Rohtang Pass Snow Excursion",
        description: "Full day excursion to Solang Valley (and Rohtang Pass / Atal Tunnel subject to green permits). Enjoy paragliding, zorbing, snow skiing, quad biking, and cable car rides surrounded by snow-capped peaks.",
        activities: ["Solang Valley Adventure Sports", "Paragliding & Zorbing", "Atal Tunnel / Rohtang Pass Snow View", "Solang Ropeway Flight"]
      },
      {
        day: 5,
        title: "Manali Local Heritage → Hadimba Temple, Vashisht Hot Springs & Mall Road",
        description: "Tour 450-year-old wooden Hadimba Devi Temple tucked in cedar forests, Club House, Tibetan Monastery, and natural sulfur hot springs at Vashisht. Evening leisure shopping on Manali Mall Road.",
        activities: ["Hadimba Temple Cedar Walk", "Vashisht Sulfur Hot Springs", "Tibetan Monastery Visit", "Manali Mall Road Shopping"]
      },
      {
        day: 6,
        title: "Manali to Kasol & Manikaran Sahib Day Excursion",
        description: "Day trip to Kasol ('Mini Israel of India') along the crystal clear Parvati River. Visit sacred Manikaran Sahib Gurudwara and experience natural hot spring baths. Cafe hopping in Kasol.",
        activities: ["Kasol Parvati River Stroll", "Manikaran Sahib Gurudwara", "Natural Hot Spring Bath", "Kasol Bakery & Cafe Walk"]
      },
      {
        day: 7,
        title: "Manali to Chandigarh / Delhi Departure Transfer",
        description: "Enjoy breakfast surrounded by pine mountains. Drive back to Chandigarh (or Delhi) for your onward flight or train departure with lifelong memories.",
        activities: ["Resort Breakfast", "Chauffeured Return Transfer", "Airport / Railway Station Drop-off"]
      }
    ],
    inclusions: [
      "6 Nights Accommodation in 4-Star Mountain Resorts with Breakfast & Dinner",
      "Private Chauffeured AC SUV / Sedan Vehicle for Entire Circuit",
      "Solang Valley & Manali Sightseeing Cabs",
      "Kasol & Manikaran Sahib Excursion Included",
      "All Tolls, Fuel, Parking & Driver Night Charges Included"
    ],
    exclusions: ["Rohtang Pass NGT Permit Costs (~₹800/vehicle)", "Personal Paragliding & Skiing Fees"],
    hotels: [{ name: "Shimla Pine Resort & Manali Riverside Luxury Resort", location: "Himachal Pradesh", stars: 4, room_type: "Mountain View Deluxe Room", meal_plan: "Breakfast & Dinner" }]
  },
  "kerala-3d2n-munnar-hills": {
    slug: "kerala-3d2n-munnar-hills",
    name: "Munnar Misty Tea Hills Getaway (3D/2N)",
    duration: "3 Days / 2 Nights",
    price: 12500,
    rating: 4.9,
    reviews: 140,
    image: "/kerala/munnar_tea_estates.jpg",
    images: [
      "/kerala/munnar_tea_estates.jpg",
      "/kerala/eravikulam_nilgiri_tahr.jpg",
      "/kerala/eravikulam_national_park.jpg"
    ],
    pickup_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    drop_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    destinations: ["Cochin", "Munnar", "Cheeyappara Falls", "Eravikulam National Park"],
    highlights: [
      "Scenic Western Ghats Mountain Drive past Cheeyappara & Valara Waterfalls",
      "Eravikulam National Park Eco-Safari to spot endangered Nilgiri Tahr mountain goats",
      "Tata Tea Museum tour with authentic CTC tea tasting & garden stroll",
      "Mattupetty Dam boating, Echo Point acoustics & Kundala Lake photo stop",
      "2 Nights stay in premium 4-Star Munnar tea country resort"
    ],
    itinerary: [
      {
        day: 1,
        title: "Cochin Pickup → Scenic Western Ghats Drive to Munnar Tea Hills",
        description: "Private chauffeured pickup from Cochin International Airport (COK) or Ernakulam Station. Drive to Munnar (130 km) past cascading Cheeyappara and Valara waterfalls. Check-in to your mountain resort and enjoy misty tea garden evening walks.",
        activities: ["Cochin Airport Pickup", "Cheeyappara Waterfall Stop", "Valara Waterfall Photo Point", "Tea Resort Check-in"]
      },
      {
        day: 2,
        title: "Eravikulam National Park Safari & Munnar Tea Sightseeing",
        description: "Morning guided safari in Eravikulam National Park to spot Nilgiri Tahr. Visit Tata Tea Museum, Mattupetty Dam, Echo Point, and Rose Garden.",
        activities: ["Eravikulam Park Safari", "Nilgiri Tahr Spotting", "Tata Tea Museum", "Mattupetty Boating", "Echo Point Experience"]
      },
      {
        day: 3,
        title: "Munnar Spice Walk → Cochin Airport / Station Departure Transfer",
        description: "Breakfast at resort. Visit local spice gardens and handmade chocolate shops before chauffeured transfer back to Cochin Airport / Railway Station.",
        activities: ["Resort Breakfast", "Spice Garden Walk", "Cochin Airport Departure Drop-off"]
      }
    ],
    attractions: [
      { name: "Munnar Rolling Tea Estates", description: "Endless emerald tea carpets, mist trails and colonial tea factory tastings.", image: "/kerala/munnar_tea_estates.jpg" },
      { name: "Eravikulam National Park (Nilgiri Tahr)", description: "High altitude sanctuary home to the endangered mountain goat and Anamudi peak views.", image: "/kerala/eravikulam_nilgiri_tahr.jpg" }
    ],
    inclusions: [
      "2 Nights Accommodation in 4-Star Munnar Mountain Resort",
      "Private Chauffeured AC Vehicle for 3 Days (Cochin to Cochin Circuit - 400 KM)",
      "Daily Buffet Breakfast & Dinner at Resort",
      "Eravikulam National Park Entry & Shuttle Permits",
      "All Driver Allowances, Tolls, Parking & Fuel Charges"
    ],
    exclusions: ["Flight / Train tickets", "Personal adventure activities"],
    hotels: [{ name: "Munnar Tea Country Resort / Fragrant Nature Munnar", location: "Munnar, Kerala", stars: 4, room_type: "Valley View Deluxe Room", meal_plan: "Breakfast & Dinner" }]
  },
  "kerala-4d3n-munnar-alleppey": {
    slug: "kerala-4d3n-munnar-alleppey",
    name: "Munnar Tea Hills & Alleppey Houseboat (4D/3N)",
    duration: "4 Days / 3 Nights",
    price: 16800,
    rating: 4.92,
    reviews: 280,
    image: "/kerala/alleppey_backwaters_houseboat.jpg",
    images: [
      "/kerala/alleppey_backwaters_houseboat.jpg",
      "/kerala/munnar_tea_estates.jpg",
      "/kerala/eravikulam_nilgiri_tahr.jpg"
    ],
    pickup_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    drop_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    destinations: ["Cochin", "Munnar", "Alleppey Houseboat", "Vembanad Lake"],
    highlights: [
      "1 Night Private Air-Conditioned Luxury Houseboat Cruise across Alleppey Backwaters",
      "2 Nights Luxury Hill Resort Stay in misty Munnar tea plantations",
      "Eravikulam National Park Safari & Tata Tea Factory Museum Tour",
      "All Onboard Houseboat Meals included (Fresh Karimeen Fish, Sadya Lunch & Dinner)",
      "Dedicated Private AC Chauffeured Car for the entire 550 KM Circuit"
    ],
    itinerary: [
      {
        day: 1,
        title: "Cochin Pickup → Drive to Munnar Tea Country & Waterfalls",
        description: "Pickup from Cochin Airport / Station. Scenic mountain drive to Munnar through Cheeyappara & Valara waterfalls. Check-in to Munnar resort.",
        activities: ["Cochin Airport Pickup", "Scenic Hill Drive", "Cheeyappara Waterfall", "Resort Check-in"]
      },
      {
        day: 2,
        title: "Eravikulam National Park & Munnar Valley Sightseeing",
        description: "Morning safari in Eravikulam National Park to spot Nilgiri Tahr mountain goats. Visit Tea Museum, Mattupetty Dam, and Kundala Lake.",
        activities: ["Eravikulam Safari", "Tea Museum Tour", "Mattupetty Dam", "Echo Point"]
      },
      {
        day: 3,
        title: "Munnar to Alleppey → Board Private AC Luxury Houseboat",
        description: "Drive down from Munnar to Alleppey jetty. Board your private luxury AC houseboat at 12:00 PM. Cruise through scenic palm-fringed canals & Vembanad lake with traditional Kerala Sadya lunch, evening snacks & candlelit dinner.",
        activities: ["Private Houseboat Boarding", "Vembanad Backwater Cruise", "Authentic Kerala Meals Onboard", "Overnight Houseboat Stay"]
      },
      {
        day: 4,
        title: "Houseboat Sunrise Breakfast → Cochin Airport Departure",
        description: "Enjoy sunrise tea & breakfast while cruising morning backwaters. Disembark at 9:00 AM and chauffeured transfer back to Cochin Airport for departure.",
        activities: ["Morning Houseboat Cruise", "Disembarkation", "Cochin Airport Departure Drop-off"]
      }
    ],
    attractions: [
      { name: "Alleppey Backwaters & Luxury Houseboat", description: "Private luxury Kettuvallam cruising through palm-fringed emerald canals.", image: "/kerala/alleppey_backwaters_houseboat.jpg" },
      { name: "Munnar Rolling Tea Estates", description: "Endless emerald tea carpets, mist trails and colonial tea factory tastings.", image: "/kerala/munnar_tea_estates.jpg" }
    ],
    inclusions: [
      "1 Night Private AC Houseboat Stay in Alleppey with All Meals (Lunch, Tea/Snacks, Dinner, Breakfast)",
      "2 Nights Accommodation in 4-Star Munnar Mountain Resort with Daily Breakfast & Dinner",
      "Private Chauffeured AC Car for 4 Days (550 KM Circuit)",
      "Eravikulam National Park & Tea Museum Sightseeing",
      "All Tolls, Parking, Fuel & Chauffeur Allowances Included"
    ],
    exclusions: ["Flight / Train tickets", "Personal shopping"],
    hotels: [{ name: "Munnar Hill Resort (2N) + Alleppey Deluxe Houseboat (1N)", location: "Kerala", stars: 4, room_type: "Deluxe Resort Room & Private Houseboat Suite", meal_plan: "All Meals on Houseboat + MAP on Resort" }]
  },
  "kerala-5d4n-tea-wildlife-backwaters": {
    slug: "kerala-5d4n-tea-wildlife-backwaters",
    name: "Kerala Tea, Wildlife & Backwaters Classic (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 21500,
    rating: 4.95,
    reviews: 320,
    image: "/kerala/thekkady_periyar_sanctuary.jpg",
    images: [
      "/kerala/thekkady_periyar_sanctuary.jpg",
      "/kerala/alleppey_backwaters_houseboat.jpg",
      "/kerala/munnar_tea_estates.jpg",
      "/kerala/eravikulam_nilgiri_tahr.jpg"
    ],
    pickup_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    drop_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    destinations: ["Cochin", "Munnar", "Thekkady (Periyar)", "Alleppey Houseboat"],
    highlights: [
      "Periyar Lake Wildlife Safari Boat Ride to spot wild elephant herds & bison",
      "Guided walk through aromatic Cardamom, Cinnamon & Pepper Spice Plantations",
      "1 Night Private AC Luxury Houseboat Backwater Cruise in Alleppey",
      "2 Nights Munnar Hill Resort + 1 Night Thekkady Forest Resort",
      "Complete 650 KM Circuit with Chauffeured Private AC Vehicle"
    ],
    itinerary: [
      {
        day: 1,
        title: "Cochin Pickup → Drive to Munnar via Cheeyappara Waterfalls",
        description: "Chauffeured pickup from Cochin Airport / Station. Drive to Munnar hill station past Cheeyappara & Valara waterfalls. Evening leisure amidst tea hills.",
        activities: ["Cochin Pickup", "Cheeyappara Waterfall", "Munnar Resort Check-in"]
      },
      {
        day: 2,
        title: "Eravikulam National Park Safari & Munnar Tea Country",
        description: "Spot Nilgiri Tahr goats at Eravikulam National Park. Tour Tata Tea Museum, Mattupetty Dam, and Echo Point.",
        activities: ["Eravikulam Safari", "Tea Museum", "Mattupetty Boating", "Echo Point"]
      },
      {
        day: 3,
        title: "Munnar to Thekkady → Periyar Wildlife Safari & Spice Plantation",
        description: "Drive through Cardamom Hills to Thekkady. Guided walk through organic spice plantations. Afternoon Periyar Lake boat safari to spot wild elephants.",
        activities: ["Cardamom Hills Drive", "Spice Plantation Tour", "Periyar Boat Safari", "Kathakali Performance"]
      },
      {
        day: 4,
        title: "Thekkady to Alleppey → Private AC Luxury Houseboat Cruise",
        description: "Transfer to Alleppey. Board your private luxury houseboat at noon. Sail through palm-fringed backwaters with traditional Kerala meals.",
        activities: ["Houseboat Check-in", "Vembanad Lake Sailing", "Karimeen Fish Dinner", "Overnight Houseboat Stay"]
      },
      {
        day: 5,
        title: "Houseboat Breakfast → Cochin Airport / Station Departure Transfer",
        description: "Breakfast onboard while sailing morning canals. Disembark at Alleppey jetty and transfer back to Cochin Airport for departure.",
        activities: ["Houseboat Breakfast", "Cochin Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Thekkady Periyar Wildlife Sanctuary", description: "Lake boat safari watching wild elephant herds and spice plantations.", image: "/kerala/thekkady_periyar_sanctuary.jpg" },
      { name: "Alleppey Backwaters & Luxury Houseboat", description: "Private luxury Kettuvallam cruising through palm-fringed emerald canals.", image: "/kerala/alleppey_backwaters_houseboat.jpg" },
      { name: "Munnar Rolling Tea Estates", description: "Endless emerald tea carpets, mist trails and colonial tea factory tastings.", image: "/kerala/munnar_tea_estates.jpg" }
    ],
    inclusions: [
      "1 Night Private AC Houseboat Stay in Alleppey with All Meals Included",
      "2 Nights Munnar 4-Star Resort + 1 Night Thekkady Spice Resort with Breakfast & Dinner",
      "Periyar Lake Wildlife Safari Boat Tickets Included",
      "Guided Spice Plantation Tour in Thekkady",
      "Private Chauffeured AC Car for 5 Days (650 KM Circuit)"
    ],
    exclusions: ["Flight tickets", "Kathakali show tickets (~₹400/person)"],
    hotels: [{ name: "Munnar Tea Resort (2N) + Thekkady Spice Resort (1N) + Alleppey Houseboat (1N)", location: "Kerala", stars: 4, room_type: "Deluxe Forest & Lake View Rooms", meal_plan: "MAP Plan & All Houseboat Meals" }]
  },
  "kerala-5d4n-varkala-cliff-beach": {
    slug: "kerala-5d4n-varkala-cliff-beach",
    name: "Munnar, Houseboat & Varkala Cliff Beach (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 23500,
    rating: 4.94,
    reviews: 190,
    image: "/kerala/kovalam_lighthouse_beach.jpg",
    images: [
      "/kerala/kovalam_lighthouse_beach.jpg",
      "/kerala/alleppey_backwaters_houseboat.jpg",
      "/kerala/munnar_tea_estates.jpg"
    ],
    pickup_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    drop_location: "Trivandrum International Airport (TRV) / Kochuveli Railway Station",
    destinations: ["Cochin", "Munnar", "Alleppey Houseboat", "Varkala Cliff Beach", "Trivandrum"],
    highlights: [
      "Dramatic Red Laterite Cliff Sunsets & Arabian Sea views at Varkala Papanasam Beach",
      "1 Night Private Luxury AC Houseboat Backwater Sailing in Alleppey",
      "2 Nights in Munnar misty tea gardens & Eravikulam Nilgiri Tahr safari",
      "1 Night Cliffside Beach Resort stay in Bohemian Varkala",
      "Convenient One-Way Circuit (Cochin Pickup → Trivandrum Drop - 1000 KM)"
    ],
    itinerary: [
      {
        day: 1,
        title: "Cochin Pickup → Munnar Tea Country & Waterfalls",
        description: "Pickup from Cochin Airport / Station. Drive to Munnar past Cheeyappara waterfalls. Check-in to Munnar resort.",
        activities: ["Cochin Pickup", "Cheeyappara Waterfall", "Munnar Check-in"]
      },
      {
        day: 2,
        title: "Eravikulam National Park & Munnar Valley Tour",
        description: "Full day sightseeing in Munnar. Safari in Eravikulam National Park, Tata Tea Museum, Mattupetty Dam and Echo Point.",
        activities: ["Eravikulam Safari", "Tea Museum", "Mattupetty Boating"]
      },
      {
        day: 3,
        title: "Munnar to Alleppey → Private AC Luxury Houseboat Cruise",
        description: "Drive to Alleppey. Board your private luxury houseboat at noon. Cruise palm-lined backwaters with authentic Kerala lunch and dinner.",
        activities: ["Houseboat Boarding", "Backwater Cruise", "Karimeen Fish Dinner"]
      },
      {
        day: 4,
        title: "Alleppey to Varkala Cliff Beach → Red Cliffs & Arabian Sea Sunset",
        description: "Morning cruise and disembark. Drive to Varkala. Check-in to cliff-side resort. Evening stroll along Varkala North Cliff cafes & sunset over Papanasam beach.",
        activities: ["Drive to Varkala", "Varkala North Cliff Walk", "Papanasam Beach Sunset"]
      },
      {
        day: 5,
        title: "Varkala Beach → Trivandrum Airport / Station Departure Transfer",
        description: "Morning ocean view breakfast. Chauffeured transfer to Trivandrum Airport / Station for return flight.",
        activities: ["Cliffside Breakfast", "Trivandrum Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Kovalam Lighthouse & Varkala Cliff Beach", description: "Dramatic laterite cliffs overlooking golden beaches and bohemian cafes.", image: "/kerala/kovalam_lighthouse_beach.jpg" },
      { name: "Alleppey Backwaters & Luxury Houseboat", description: "Private luxury Kettuvallam cruising through palm-fringed emerald canals.", image: "/kerala/alleppey_backwaters_houseboat.jpg" },
      { name: "Munnar Rolling Tea Estates", description: "Endless emerald tea carpets, mist trails and colonial tea factory tastings.", image: "/kerala/munnar_tea_estates.jpg" }
    ],
    inclusions: [
      "1 Night Cliff Resort in Varkala + 1 Night Private Houseboat + 2 Nights Munnar Resort",
      "Private Chauffeured AC Car for 5 Days (Cochin Pickup to Trivandrum Drop - 1000 KM Circuit)",
      "Daily Buffet Breakfast & Dinner at Resorts + All Meals on Houseboat",
      "All Interstate/District Permits, Tolls & Chauffeur Allowances"
    ],
    exclusions: ["Flight / Train tickets", "Water sports at Varkala beach"],
    hotels: [{ name: "Munnar Tea Resort (2N) + Alleppey Houseboat (1N) + Varkala Cliff Resort (1N)", location: "Kerala", stars: 4, room_type: "Sea View & Valley View Deluxe", meal_plan: "Breakfast & Dinner" }]
  },
  "kerala-6d5n-hills-backwaters-kovalam": {
    slug: "kerala-6d5n-hills-backwaters-kovalam",
    name: "Grand Kerala Hills, Backwaters & Kovalam Beach (6D/5N)",
    duration: "6 Days / 5 Nights",
    price: 26500,
    rating: 4.98,
    reviews: 450,
    image: "/kerala/alleppey_backwaters_houseboat.jpg",
    images: [
      "/kerala/alleppey_backwaters_houseboat.jpg",
      "/kerala/munnar_tea_estates.jpg",
      "/kerala/thekkady_periyar_sanctuary.jpg",
      "/kerala/kovalam_lighthouse_beach.jpg",
      "/kerala/eravikulam_nilgiri_tahr.jpg",
      "/kerala/fort_kochi_chinese_nets.jpg"
    ],
    pickup_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    drop_location: "Trivandrum International Airport (TRV) / Cochin Airport (COK)",
    destinations: ["Cochin", "Munnar", "Thekkady", "Alleppey Houseboat", "Kovalam Beach", "Trivandrum"],
    highlights: [
      "1 Night Private Air-Conditioned Alleppey Backwater Houseboat Cruise with all meals",
      "2 Nights Kovalam Lighthouse Beach Resort Stay on the Arabian Sea coast",
      "2 Nights Munnar Misty Tea Valleys + 1 Night Thekkady Periyar Wildlife Sanctuary",
      "Periyar Lake Wildlife Safari Boat Ride & Guided Spice Garden Exploration",
      "Complete 1000 KM Circuit from Cochin Airport Pickup to Trivandrum Airport Drop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Cochin Pickup → Scenic Western Ghats Drive to Munnar",
        description: "Pickup from Cochin Airport / Station. Drive to Munnar past Cheeyappara waterfalls & tea plantations. Check-in to Munnar resort.",
        activities: ["Cochin Airport Pickup", "Cheeyappara Waterfall", "Munnar Resort Check-in"]
      },
      {
        day: 2,
        title: "Eravikulam National Park Safari & Munnar Tea Country",
        description: "Spot endangered Nilgiri Tahr mountain goats at Eravikulam National Park. Visit Tata Tea Museum, Mattupetty Dam, and Echo Point.",
        activities: ["Eravikulam Safari", "Tata Tea Museum", "Mattupetty Boating", "Echo Point"]
      },
      {
        day: 3,
        title: "Munnar to Thekkady → Periyar Wildlife Boat Safari & Spice Walk",
        description: "Drive to Thekkady. Tour aromatic cardamom and pepper spice plantations. Afternoon Periyar Lake boat safari to spot wild elephant herds.",
        activities: ["Cardamom Hills Drive", "Spice Plantation Walk", "Periyar Boat Safari", "Kathakali Show"]
      },
      {
        day: 4,
        title: "Thekkady to Alleppey → Private AC Luxury Houseboat Backwater Sailing",
        description: "Transfer to Alleppey. Board your private AC luxury houseboat at noon. Sail Vembanad Lake & palm canals with traditional Kerala fish lunch & dinner.",
        activities: ["Houseboat Boarding", "Vembanad Lake Cruise", "Karimeen Fish Dinner", "Overnight Houseboat Stay"]
      },
      {
        day: 5,
        title: "Alleppey to Kovalam Beach → Lighthouse Beach Sunset & Arabian Sea",
        description: "Breakfast onboard and disembark. Drive south to Kovalam beach paradise. Check-in to Kovalam seaside resort. Evening at Kovalam Lighthouse Beach.",
        activities: ["Drive to Kovalam", "Kovalam Lighthouse Beach Walk", "Seaside Sunset Dinner"]
      },
      {
        day: 6,
        title: "Kovalam Beach & Trivandrum Sightseeing → Airport Drop-off",
        description: "Visit historic Padmanabhaswamy Temple (exterior/darshan) and Napier Museum before chauffeured drop-off at Trivandrum International Airport.",
        activities: ["Padmanabhaswamy Temple", "Napier Museum", "Trivandrum Airport Departure Drop-off"]
      }
    ],
    attractions: [
      { name: "Alleppey Backwaters & Luxury Houseboat", description: "Private luxury Kettuvallam cruising through palm-fringed emerald canals.", image: "/kerala/alleppey_backwaters_houseboat.jpg" },
      { name: "Kovalam Lighthouse Cliff Beach", description: "Crescent golden beach with panoramic 35m striped beacon cliff views.", image: "/kerala/kovalam_lighthouse_beach.jpg" },
      { name: "Munnar Rolling Tea Estates", description: "Endless emerald tea carpets, mist trails and colonial tea factory tastings.", image: "/kerala/munnar_tea_estates.jpg" },
      { name: "Thekkady Periyar Wildlife Sanctuary", description: "Lake boat safari watching wild elephant herds and spice plantations.", image: "/kerala/thekkady_periyar_sanctuary.jpg" }
    ],
    inclusions: [
      "1 Night Private AC Houseboat in Alleppey + 2 Nights Munnar + 1 Night Thekkady + 1 Night Kovalam",
      "Private Chauffeured AC Car for 6 Days (1000 KM Circuit - Cochin to Trivandrum)",
      "Periyar Lake Wildlife Safari Boat Tickets Included",
      "All Houseboat Meals (Lunch, Dinner, Breakfast) + Daily Resort Breakfast & Dinner",
      "All Chauffeur Allowances, Tolls, State Taxes & Parking Charges"
    ],
    exclusions: ["Flight tickets", "Padmanabhaswamy Temple special entry darshan passes"],
    hotels: [{ name: "Munnar Resort (2N) + Thekkady Resort (1N) + Houseboat (1N) + Kovalam Beach Resort (1N)", location: "Kerala", stars: 4, room_type: "Luxury Beach & Mountain View Rooms", meal_plan: "MAP Plan & All Houseboat Meals" }]
  },
  "kerala-7d6n-grand-kerala-kanyakumari": {
    slug: "kerala-7d6n-grand-kerala-kanyakumari",
    name: "Complete Kerala & Kanyakumari Sunset Tour (7D/6N)",
    duration: "7 Days / 6 Nights",
    price: 31500,
    rating: 4.97,
    reviews: 240,
    image: "/kerala/kovalam_lighthouse_beach.jpg",
    images: [
      "/kerala/kovalam_lighthouse_beach.jpg",
      "/kerala/alleppey_backwaters_houseboat.jpg",
      "/kerala/munnar_tea_estates.jpg",
      "/kerala/thekkady_periyar_sanctuary.jpg"
    ],
    pickup_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    drop_location: "Trivandrum International Airport (TRV) / Kochuveli Railway Station",
    destinations: ["Cochin", "Munnar", "Thekkady", "Alleppey Houseboat", "Kovalam Beach", "Kanyakumari", "Trivandrum"],
    highlights: [
      "Excursion to Kanyakumari — Southernmost Tip of India, Vivekananda Rock Memorial & Thiruvalluvar Statue",
      "Tri-Sea Sunset & Sunrise View (Meeting point of Arabian Sea, Indian Ocean & Bay of Bengal)",
      "1 Night Private AC Luxury Houseboat Backwater Sailing in Alleppey with all meals",
      "2 Nights Munnar Tea Gardens + 1 Night Thekkady Wildlife + 2 Nights Kovalam Beach",
      "Complete 1250 KM Circuit from Cochin Airport Pickup to Trivandrum Airport Drop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Cochin Pickup → Scenic Western Ghats Drive to Munnar",
        description: "Pickup from Cochin Airport / Station. Scenic mountain drive past Cheeyappara and Valara waterfalls to Munnar tea country.",
        activities: ["Cochin Airport Pickup", "Cheeyappara Waterfall", "Munnar Resort Check-in"]
      },
      {
        day: 2,
        title: "Eravikulam National Park Safari & Munnar Tea Country",
        description: "Safari in Eravikulam National Park to spot Nilgiri Tahr mountain goats. Visit Tata Tea Museum, Mattupetty Dam, and Echo Point.",
        activities: ["Eravikulam Safari", "Tea Museum", "Mattupetty Boating", "Echo Point"]
      },
      {
        day: 3,
        title: "Munnar to Thekkady → Periyar Wildlife Safari & Spice Garden",
        description: "Drive through Cardamom Hills to Thekkady. Spice garden exploration and afternoon Periyar Lake boat safari.",
        activities: ["Cardamom Hills Drive", "Spice Plantation Walk", "Periyar Boat Safari"]
      },
      {
        day: 4,
        title: "Thekkady to Alleppey → Private AC Luxury Houseboat Cruise",
        description: "Transfer to Alleppey. Board your private AC luxury houseboat at noon. Cruise Vembanad Lake with traditional Kerala meals.",
        activities: ["Houseboat Boarding", "Vembanad Lake Sailing", "Karimeen Fish Dinner", "Overnight Houseboat Stay"]
      },
      {
        day: 5,
        title: "Alleppey to Kovalam Beach Resort → Golden Sands & Lighthouse",
        description: "Breakfast onboard, disembark and drive to Kovalam beach. Check-in to beachside resort. Evening at Kovalam Lighthouse Beach.",
        activities: ["Drive to Kovalam", "Lighthouse Beach Walk", "Seaside Sunset Dinner"]
      },
      {
        day: 6,
        title: "Kanyakumari Day Excursion → Vivekananda Rock Memorial & Tri-Sea",
        description: "Full day excursion to Kanyakumari. Board ferry to Vivekananda Rock Memorial and Thiruvalluvar Statue. Witness sunset over the confluence of three oceans before returning to Kovalam resort.",
        activities: ["Ferry to Vivekananda Rock", "Thiruvalluvar Statue", "Tri-Sea Sunset Point", "Return to Kovalam Resort"]
      },
      {
        day: 7,
        title: "Trivandrum Temple Tour → Departure Airport Transfer",
        description: "Visit historic Padmanabhaswamy Temple and Napier Museum before transfer to Trivandrum Airport for departure.",
        activities: ["Padmanabhaswamy Temple", "Trivandrum Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Kovalam Lighthouse Cliff Beach", description: "Crescent golden beach with panoramic 35m striped beacon cliff views.", image: "/kerala/kovalam_lighthouse_beach.jpg" },
      { name: "Alleppey Backwaters & Luxury Houseboat", description: "Private luxury Kettuvallam cruising through palm-fringed emerald canals.", image: "/kerala/alleppey_backwaters_houseboat.jpg" },
      { name: "Thekkady Periyar Wildlife Sanctuary", description: "Lake boat safari watching wild elephant herds and spice plantations.", image: "/kerala/thekkady_periyar_sanctuary.jpg" },
      { name: "Munnar Rolling Tea Estates", description: "Endless emerald tea carpets, mist trails and colonial tea factory tastings.", image: "/kerala/munnar_tea_estates.jpg" }
    ],
    inclusions: [
      "6 Nights Accommodation (1 Houseboat + 2 Munnar + 1 Thekkady + 2 Kovalam)",
      "Private Chauffeured AC Car for 7 Days (1250 KM Circuit - Cochin to Trivandrum)",
      "Kanyakumari Excursion with Tolls & State Border Permits",
      "Periyar Wildlife Boat Safari Tickets",
      "All Houseboat Meals + Daily Resort Breakfast & Dinner"
    ],
    exclusions: ["Flight / Train tickets", "Vivekananda Rock ferry tickets (~₹70/person)"],
    hotels: [{ name: "Munnar Resort (2N) + Thekkady (1N) + Houseboat (1N) + Kovalam Beach Resort (2N)", location: "Kerala", stars: 4, room_type: "Premium Beach & Hill Rooms", meal_plan: "MAP Plan & All Houseboat Meals" }]
  },
  "kerala-8d7n-heritage-backwaters-cape": {
    slug: "kerala-8d7n-heritage-backwaters-cape",
    name: "Signature Kerala Heritage, Backwaters & Cape Comorin (8D/7N)",
    duration: "8 Days / 7 Nights",
    price: 36000,
    rating: 4.99,
    reviews: 180,
    image: "/kerala/fort_kochi_chinese_nets.jpg",
    images: [
      "/kerala/fort_kochi_chinese_nets.jpg",
      "/kerala/alleppey_backwaters_houseboat.jpg",
      "/kerala/munnar_tea_estates.jpg",
      "/kerala/thekkady_periyar_sanctuary.jpg",
      "/kerala/kovalam_lighthouse_beach.jpg"
    ],
    pickup_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    drop_location: "Trivandrum International Airport (TRV) / Kochuveli Railway Station",
    destinations: ["Cochin Heritage", "Munnar", "Thekkady", "Alleppey Houseboat", "Kovalam Beach", "Kanyakumari (1N)", "Trivandrum"],
    highlights: [
      "Fort Kochi Heritage Tour — Chinese Fishing Nets, Mattancherry Dutch Palace & Jew Town",
      "1 Night Stay at Cape Comorin (Kanyakumari) to witness sunrise & sunset over the Tri-Sea",
      "1 Night Private AC Luxury Houseboat Backwater Sailing in Alleppey with all meals",
      "2 Nights Munnar + 1 Night Thekkady + 2 Nights Kovalam Beach Resort + 1 Night Cochin Heritage",
      "Complete 1350 KM Circuit from Cochin Airport Pickup to Trivandrum Airport Drop"
    ],
    itinerary: [
      {
        day: 1,
        title: "Cochin Arrival → Fort Kochi Heritage & Chinese Fishing Nets",
        description: "Pickup from Cochin Airport. Transfer to Fort Kochi heritage resort. Visit 14th-century Chinese Fishing Nets, St. Francis Church, Mattancherry Dutch Palace, and Jew Town spice markets.",
        activities: ["Cochin Airport Pickup", "Chinese Fishing Nets", "Mattancherry Palace", "Jew Town Walk"]
      },
      {
        day: 2,
        title: "Fort Kochi to Munnar Tea Country → Waterfalls & Tea Estates",
        description: "Drive through Western Ghats passes to Munnar past Cheeyappara and Valara waterfalls. Check-in to Munnar tea resort.",
        activities: ["Drive to Munnar", "Cheeyappara Waterfall Stop", "Munnar Resort Check-in"]
      },
      {
        day: 3,
        title: "Munnar Full Day Nature & Wildlife Safari",
        description: "Safari in Eravikulam National Park to spot Nilgiri Tahr mountain goats. Visit Tata Tea Museum, Mattupetty Dam, and Echo Point.",
        activities: ["Eravikulam Park Safari", "Tata Tea Museum", "Mattupetty Boating"]
      },
      {
        day: 4,
        title: "Munnar to Thekkady → Periyar Safari & Spice Plantation",
        description: "Drive to Thekkady spice country. Guided organic spice plantation walk. Afternoon Periyar Lake wildlife boat safari.",
        activities: ["Spice Plantation Tour", "Periyar Boat Safari", "Kathakali Performance"]
      },
      {
        day: 5,
        title: "Thekkady to Alleppey → Private AC Luxury Houseboat Cruise",
        description: "Transfer to Alleppey. Board your private luxury AC houseboat at noon. Sail Vembanad Lake & backwater canals with traditional meals.",
        activities: ["Houseboat Check-in", "Vembanad Lake Cruise", "Traditional Fish Lunch & Dinner"]
      },
      {
        day: 6,
        title: "Alleppey to Kovalam Beach → Seaside Relaxation & Lighthouse",
        description: "Breakfast onboard and disembark. Drive south to Kovalam beach paradise. Evening leisure at Kovalam Lighthouse Beach.",
        activities: ["Drive to Kovalam", "Kovalam Lighthouse Beach Walk", "Sunset Dinner"]
      },
      {
        day: 7,
        title: "Kovalam to Kanyakumari (1N) → Vivekananda Rock & Ocean Sunset",
        description: "Drive to Kanyakumari. Ferry to Vivekananda Rock Memorial & Thiruvalluvar Statue. Check-in to ocean view hotel and witness the glorious Tri-Sea sunset.",
        activities: ["Drive to Kanyakumari", "Vivekananda Rock Memorial", "Tri-Sea Sunset", "Kanyakumari Hotel Check-in"]
      },
      {
        day: 8,
        title: "Kanyakumari Sunrise → Trivandrum Airport Departure",
        description: "Early morning Tri-Sea sunrise view. Visit Suchindram Temple en route to Trivandrum Airport for departure.",
        activities: ["Tri-Sea Sunrise", "Suchindram Temple", "Trivandrum Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Fort Kochi & Chinese Fishing Nets", description: "Iconic cantilevered shore nets and colonial spice port heritage.", image: "/kerala/fort_kochi_chinese_nets.jpg" },
      { name: "Alleppey Backwaters & Luxury Houseboat", description: "Private luxury Kettuvallam cruising through palm-fringed emerald canals.", image: "/kerala/alleppey_backwaters_houseboat.jpg" },
      { name: "Kovalam Lighthouse Cliff Beach", description: "Crescent golden beach with panoramic 35m striped beacon cliff views.", image: "/kerala/kovalam_lighthouse_beach.jpg" },
      { name: "Munnar Rolling Tea Estates", description: "Endless emerald tea carpets, mist trails and colonial tea factory tastings.", image: "/kerala/munnar_tea_estates.jpg" }
    ],
    inclusions: [
      "7 Nights Accommodation (1 Fort Kochi + 2 Munnar + 1 Thekkady + 1 Houseboat + 1 Kovalam + 1 Kanyakumari)",
      "Private Chauffeured AC Car for 8 Days (1350 KM Circuit - Cochin to Trivandrum)",
      "Periyar Lake Wildlife Safari Boat Tickets Included",
      "All Houseboat Meals + Daily Resort Buffet Breakfast & Dinner",
      "All Interstate Taxes, Tolls & Chauffeur Allowances"
    ],
    exclusions: ["Flight tickets", "Ferry tickets at Kanyakumari"],
    hotels: [{ name: "Fort Kochi Heritage (1N) + Munnar (2N) + Thekkady (1N) + Houseboat (1N) + Kovalam (1N) + Kanyakumari (1N)", location: "Kerala & Tamil Nadu", stars: 4, room_type: "Heritage & Sea View Rooms", meal_plan: "MAP Plan & All Houseboat Meals" }]
  },
  "kerala-10d9n-south-india-temple-circuit": {
    slug: "kerala-10d9n-south-india-temple-circuit",
    name: "Grand South India & Kerala Temple Circuit (10D/9N)",
    duration: "10 Days / 9 Nights",
    price: 44500,
    rating: 4.99,
    reviews: 160,
    image: "/kerala/alleppey_backwaters_houseboat.jpg",
    images: [
      "/kerala/alleppey_backwaters_houseboat.jpg",
      "/kerala/munnar_tea_estates.jpg",
      "/kerala/thekkady_periyar_sanctuary.jpg",
      "/kerala/kovalam_lighthouse_beach.jpg",
      "/kerala/fort_kochi_chinese_nets.jpg"
    ],
    pickup_location: "Cochin International Airport (COK) / Ernakulam Railway Station (ERS)",
    drop_location: "Madurai International Airport (IXM) / Madurai Junction Railway Station",
    destinations: ["Cochin", "Munnar", "Thekkady", "Alleppey Houseboat", "Kovalam", "Kanyakumari", "Rameswaram Jyotirlinga", "Madurai"],
    highlights: [
      "Complete Grand Circuit covering Kerala Nature, Hills, Backwaters, Beaches & Sacred Tamil Nadu Temples",
      "Rameswaram Ramanathaswamy Jyotirlinga Temple & 22 Theertham Sacred Well Bathing",
      "Dhanushkodi Ghost Town & Ram Setu Point (Adam's Bridge) Excursion",
      "Madurai Meenakshi Amman Temple 14 Majestic Gopuram Heritage Darshan",
      "Complete 1800 KM Circuit with Chauffeured Private AC Vehicle (Cochin Pickup → Madurai Drop)"
    ],
    itinerary: [
      {
        day: 1,
        title: "Cochin Pickup → Scenic Western Ghats Drive to Munnar",
        description: "Pickup from Cochin Airport / Station. Drive to Munnar past Cheeyappara and Valara waterfalls. Check-in to Munnar tea resort.",
        activities: ["Cochin Pickup", "Cheeyappara Waterfall", "Munnar Check-in"]
      },
      {
        day: 2,
        title: "Eravikulam National Park Safari & Munnar Tea Country",
        description: "Safari in Eravikulam National Park to spot Nilgiri Tahr mountain goats. Visit Tata Tea Museum, Mattupetty Dam, and Echo Point.",
        activities: ["Eravikulam Safari", "Tata Tea Museum", "Mattupetty Boating"]
      },
      {
        day: 3,
        title: "Munnar to Thekkady → Periyar Safari & Spice Garden",
        description: "Drive through Cardamom Hills to Thekkady. Organic spice garden walk. Afternoon Periyar Lake boat safari.",
        activities: ["Cardamom Hills Drive", "Spice Plantation Tour", "Periyar Boat Safari"]
      },
      {
        day: 4,
        title: "Thekkady to Alleppey → Private AC Luxury Houseboat Cruise",
        description: "Transfer to Alleppey. Board your private luxury AC houseboat at noon. Sail Vembanad Lake with authentic Kerala meals.",
        activities: ["Houseboat Boarding", "Vembanad Lake Cruise", "Traditional Fish Lunch & Dinner"]
      },
      {
        day: 5,
        title: "Alleppey to Kovalam Beach Resort → Lighthouse Beach",
        description: "Breakfast onboard, disembark and drive to Kovalam beach. Check-in to seaside resort. Evening at Kovalam Lighthouse Beach.",
        activities: ["Drive to Kovalam", "Lighthouse Beach Walk", "Sunset Dinner"]
      },
      {
        day: 6,
        title: "Kovalam to Kanyakumari (1N) → Vivekananda Rock Memorial",
        description: "Drive to Kanyakumari. Ferry to Vivekananda Rock Memorial & Thiruvalluvar Statue. Witness glorious Tri-Sea sunset.",
        activities: ["Drive to Kanyakumari", "Vivekananda Rock", "Tri-Sea Sunset"]
      },
      {
        day: 7,
        title: "Kanyakumari Sunrise → Drive to Sacred Rameswaram Island (1N)",
        description: "Sunrise over Tri-Sea. Drive across the magnificent Pamban Sea Bridge to Rameswaram. Check-in to hotel. Evening Ramanathaswamy Temple Darshan.",
        activities: ["Tri-Sea Sunrise", "Pamban Bridge Drive", "Ramanathaswamy Temple Darshan"]
      },
      {
        day: 8,
        title: "Rameswaram 22 Theertham & Dhanushkodi Ram Setu Point",
        description: "Early morning sacred bath at 22 holy wells inside temple. Excursion to Dhanushkodi ghost town, Vibhishan Temple & Ram Setu shoreline.",
        activities: ["22 Theertham Bathing", "Dhanushkodi Excursion", "Ram Setu Point"]
      },
      {
        day: 9,
        title: "Rameswaram to Madurai (1N) → Meenakshi Amman Temple",
        description: "Drive to the ancient temple city of Madurai. Check-in to hotel. Evening visit to the world-famous Meenakshi Amman Temple to witness the Night Ceremony.",
        activities: ["Drive to Madurai", "Meenakshi Temple Darshan", "Night Ceremony"]
      },
      {
        day: 10,
        title: "Madurai Thirumalai Nayakkar Palace → Airport Departure Transfer",
        description: "Visit 17th-century Thirumalai Nayakkar Palace and Gandhi Memorial Museum before chauffeured transfer to Madurai Airport for departure.",
        activities: ["Thirumalai Nayakkar Palace", "Madurai Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Alleppey Backwaters & Luxury Houseboat", description: "Private luxury Kettuvallam cruising through palm-fringed emerald canals.", image: "/kerala/alleppey_backwaters_houseboat.jpg" },
      { name: "Kovalam Lighthouse Cliff Beach", description: "Crescent golden beach with panoramic 35m striped beacon cliff views.", image: "/kerala/kovalam_lighthouse_beach.jpg" },
      { name: "Munnar Rolling Tea Estates", description: "Endless emerald tea carpets, mist trails and colonial tea factory tastings.", image: "/kerala/munnar_tea_estates.jpg" },
      { name: "Thekkady Periyar Wildlife Sanctuary", description: "Lake boat safari watching wild elephant herds and spice plantations.", image: "/kerala/thekkady_periyar_sanctuary.jpg" }
    ],
    inclusions: [
      "9 Nights 4-Star Accommodations (Munnar 2N, Thekkady 1N, Houseboat 1N, Kovalam 2N, Kanyakumari 1N, Rameswaram 1N, Madurai 1N)",
      "Private Chauffeured AC Car for 10 Days (1800 KM Circuit - Cochin Pickup to Madurai Drop)",
      "All Interstate Taxes, State Permits, Pamban Bridge Tolls & Chauffeur Allowances",
      "Periyar Lake Wildlife Safari Boat Tickets Included",
      "All Houseboat Meals + Daily Hotel Breakfast & Dinner"
    ],
    exclusions: ["Flight tickets", "Temple special archana/puja tickets"],
    hotels: [{ name: "4-Star Mountain, Beach & Heritage Resorts across Kerala & Tamil Nadu", location: "Kerala & Tamil Nadu", stars: 4, room_type: "Deluxe AC Rooms & Private Houseboat Suite", meal_plan: "MAP Plan & All Houseboat Meals" }]
  },
  "dubai-delights": {
    slug: "dubai-delights",
    name: "Dubai Delights & Red Dune Desert Safari (5D/4N)",
    duration: "5 Days / 4 Nights",
    price: 45000,
    rating: 4.9,
    reviews: 410,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
    destinations: ["Burj Khalifa", "Dubai Mall", "Red Dune Desert Safari", "Marina Dhow Cruise", "Miracle Garden", "Dubai Frame"],
    highlights: [
      "Burj Khalifa 124th & 125th Floor Observation Deck Tickets Included",
      "Red Dune 4x4 Land Cruiser Desert Safari with Dune Bashing & BBQ Dinner",
      "Marina Luxury Glass Dhow Cruise with Buffet Dinner & Tanoura Show",
      "Dubai Frame & Miracle Garden Sightseeing Passes Included",
      "UAE Express Tourist Visa Submission & Chauffeured Airport Transfers"
    ],
    itinerary: [
      {
        day: 1,
        title: "Dubai International Airport Pickup → Marina Glass Dhow Dinner Cruise",
        description: "Chauffeured pickup from Dubai International Airport (DXB). Hotel check-in. Evening transfer to Dubai Marina. Board a two-tier glass Dhow Cruise for a 2-hour sailing past glittering skyscrapers with international buffet dinner & Tanoura dance.",
        activities: ["DXB Airport Chauffeured Transfer", "4-Star Hotel Check-in", "Dubai Marina Glass Dhow Cruise", "Buffet Dinner & Tanoura Show"]
      },
      {
        day: 2,
        title: "Dubai City Tour → Burj Khalifa 124th Floor & Dubai Fountain Show",
        description: "Morning guided city tour visiting Jumeirah Mosque, Burj Al Arab photo stop, Atlantis The Palm, and Dubai Frame. Afternoon visit to Dubai Mall and ascend Burj Khalifa 124th/125th floor observation deck for 360-degree skyline views. Watch Dubai Fountain show.",
        activities: ["Jumeirah Beach & Burj Al Arab Stop", "Palm Jumeirah Monorail View", "Burj Khalifa 124th Floor Deck", "Dubai Mall Fountain Show"]
      },
      {
        day: 3,
        title: "Morning Shopping → Red Dune 4x4 Desert Safari with BBQ & Belly Dance",
        description: "Morning free for Gold Souk & Meena Bazaar shopping. Afternoon 3:00 PM pickup in 4x4 Land Cruiser for Lahbab Red Dune Desert Safari. Thrilling dune bashing, sandboarding, camel riding, henna painting, belly dance & live BBQ buffet dinner under desert stars.",
        activities: ["Gold Souk & Spice Souk Shopping", "4x4 Land Cruiser Dune Bashing", "Sandboarding & Camel Ride", "Desert Camp BBQ Dinner & Belly Dance"]
      },
      {
        day: 4,
        title: "Dubai Miracle Garden & Global Village / Future Museum",
        description: "Visit Dubai Miracle Garden featuring 150 million blooming flowers crafted into castles & A380 airplane sculptures. Afternoon visit to Dubai Frame or Global Village international pavilions.",
        activities: ["Dubai Miracle Garden Floral Tour", "Dubai Frame Sky Glass Walk", "Global Village Cultural Pavilions"]
      },
      {
        day: 5,
        title: "Dubai Mall Last Minute Souvenirs → Airport Departure Transfer",
        description: "Leisurely breakfast. Last minute souvenir shopping at Dubai Mall. Private chauffeured transfer to Dubai Airport for departure flight.",
        activities: ["Hotel Breakfast", "Mall Souvenir Shopping", "DXB Airport Drop-off"]
      }
    ],
    inclusions: [
      "4 Nights 4-Star Hotel Stay in Bur Dubai / Deira with Daily Breakfast",
      "Burj Khalifa At The Top 124th & 125th Floor Tickets",
      "Red Dune Desert Safari with 4x4 Dune Bashing & BBQ Dinner",
      "Dubai Marina Dhow Cruise with Buffet Dinner",
      "UAE Express Tourist Visa & Airport Private Transfers"
    ],
    exclusions: ["Tourism Dirham Fee (~15 AED/room/night)", "International Flight Fares"],
    hotels: [{ name: "Grand Central Hotel / Citymax Hotel Bur Dubai", location: "Dubai", stars: 4, room_type: "Executive Deluxe Room", meal_plan: "Breakfast & Dinners" }]
  },
  "bali-paradise": {
    slug: "bali-paradise",
    name: "Bali Paradise Island & Cultural Retreat (6D/5N)",
    duration: "6 Days / 5 Nights",
    price: 48500,
    rating: 4.9,
    reviews: 350,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
    destinations: ["Ubud", "Kintamani Volcano", "Nusa Penida Island", "Tegallalang", "Uluwatu Temple"],
    highlights: [
      "Nusa Penida Island Speedboat Tour & Kelingking T-Rex Beach",
      "Ubud Sacred Monkey Forest Sanctuary & Tegallalang Rice Terraces",
      "Kintamani Volcano View & Batur Lake Panorama",
      "Uluwatu Sunset Temple & Kecak Fire Dance Show",
      "Bali Jungle Swing & Luwak Coffee Plantation Experience"
    ],
    itinerary: [
      {
        day: 1,
        title: "Denpasar Airport Pickup → Private Villa Check-in & Kuta Sunset",
        description: "Warm welcome at Ngurah Rai Airport (DPS) in Denpasar with floral garland. Private transfer to luxury private pool villa in Ubud/Kuta. Evening sunset walk at Kuta beach and Jimbaran bay.",
        activities: ["DPS Airport Garland Welcome", "Private Pool Villa Check-in", "Kuta Beach Sunset Walk"]
      },
      {
        day: 2,
        title: "Ubud Arts → Sacred Monkey Forest, Rice Terraces & Jungle Swing",
        description: "Tour Ubud's cultural heart. Stroll through Sacred Monkey Forest Sanctuary, snap photos at Tegallalang Rice Terraces, fly high on Bali Jungle Swing, and taste world-famous Civet Luwak coffee.",
        activities: ["Sacred Monkey Forest Sanctuary", "Tegallalang Rice Terraces Walk", "Bali Iconic Jungle Swing", "Luwak Coffee Tasting"]
      },
      {
        day: 3,
        title: "Kintamani Volcano Panorama & Tirta Empul Holy Water Temple",
        description: "Drive to Kintamani highland for panoramic views of active Mount Batur volcano and Batur crater lake. Visit Tirta Empul holy spring water temple for traditional purification ritual.",
        activities: ["Kintamani Mount Batur Volcano View", "Batur Crater Lake Panorama", "Tirta Empul Holy Spring Temple", "Ubud Art Market Shopping"]
      },
      {
        day: 4,
        title: "Nusa Penida Island Speedboat Day Excursion → Kelingking T-Rex Beach",
        description: "Early morning fast boat to Nusa Penida Island. Visit world-famous Kelingking T-Rex Cliff Beach, Broken Beach, Angel's Billabong natural infinity pool, and Crystal Bay for snorkeling.",
        activities: ["Fast Boat Ride to Nusa Penida", "Kelingking T-Rex Cliff View", "Angel's Billabong Natural Pool", "Broken Beach Photo Point", "Crystal Bay Snorkeling"]
      },
      {
        day: 5,
        title: "Uluwatu Sunset Cliff Temple & Kecak Fire Dance Show",
        description: "Morning lazy villa pool time. Afternoon trip to Uluwatu Temple perched 70 meters above sea cliff. Watch mesmerizing Kecak Fire Dance during sunset over the Indian Ocean. Seafood dinner at Jimbaran Bay.",
        activities: ["Villa Private Pool Morning", "Uluwatu Cliffside Temple", "Kecak Fire Dance Sunset Show", "Jimbaran Bay Candlelight Seafood Dinner"]
      },
      {
        day: 6,
        title: "Traditional Balinese Massage → Airport Departure Transfer",
        description: "Enjoy a 60-minute relaxing Balinese aromatherapy massage. Souvenir shopping at Krishna Oleh-Oleh market before private transfer to Denpasar Airport.",
        activities: ["60-Min Balinese Massage Spa", "Souvenir Market Procurement", "DPS Airport Drop-off"]
      }
    ],
    inclusions: [
      "2 Nights Private Pool Villa + 3 Nights 4-Star Beach Resort",
      "Nusa Penida Island Speedboat & Private Island Tour Cabs",
      "Kintamani Volcano & Tegallalang Rice Terrace Tickets",
      "Uluwatu Temple & Kecak Fire Dance Show Passes",
      "Private AC Car Transfers throughout 6 Days"
    ],
    exclusions: ["Flight Tickets to Bali", "Personal Snorkeling Gear Rental"],
    hotels: [{ name: "Ubud Heaven Private Pool Villa & Kuta Beach Resort", location: "Bali", stars: 4, room_type: "Private Pool Villa", meal_plan: "Breakfast & Candlelight Dinner" }]
  },
  "georgia-adventure": {
    slug: "georgia-adventure",
    name: "Georgia Caucasus Mountain & Tbilisi Adventure (6D/5N)",
    duration: "6 Days / 5 Nights",
    price: 58000,
    rating: 4.9,
    reviews: 185,
    image: "/georgia/kazbegi_caucasus_mountain.jpg",
    images: [
      "/georgia/kazbegi_caucasus_mountain.jpg",
      "/georgia/gudauri_ananuri_fortress.jpg",
      "/georgia/tbilisi_old_town_narikala.jpg",
      "/georgia/sighnaghi_kakheti_wine.jpg",
      "/georgia/martvili_canyon_okatse.jpg",
      "/georgia/uplistsikhe_cave_city.jpg"
    ],
    destinations: ["Tbilisi", "Kazbegi", "Gudauri", "Mtskheta", "Signagi", "Kakheti"],
    highlights: [
      "Kazbegi Gergeti Trinity Church 4x4 Drive under Mount Kazbek (5,047m)",
      "Gudauri Ski Resort Cable Car Flight & Caucasus Mountain Views",
      "Ancient Capital Mtskheta (UNESCO) & Jvari Monastery Overlook",
      "Kakheti Wine Region Tour & Signagi 'City of Love' Walls",
      "Tbilisi Old Town Cable Car, Narikala Fortress & Sulfur Baths"
    ],
    itinerary: [
      {
        day: 1,
        title: "Tbilisi Airport Pickup → Old Town Cable Car & Narikala Fortress",
        description: "Chauffeured pickup from Tbilisi International Airport (TBS). Check-in to boutique hotel. Ride aerial cable car to 4th-century Narikala Fortress, Mother of Georgia statue, and sulfur bath district.",
        activities: ["TBS Airport Transfer", "Old Town Cable Car Flight", "Narikala Fortress Tour", "Sulfur Baths Walk"]
      },
      {
        day: 2,
        title: "Mtskheta UNESCO Capital → Ananuri Fortress & Gudauri Ski Resort",
        description: "Drive along Georgian Military Highway. Visit ancient capital Mtskheta (Jvari Monastery over Aragvi & Kura rivers), 17th-century Ananuri Fortress, and Russia-Georgia Friendship Monument in Gudauri.",
        activities: ["Jvari Monastery Panoramic Overlook", "Ananuri Fortress Complex", "Gudauri Friendship Panorama", "Caucasus Mountain Resort Stay"]
      },
      {
        day: 3,
        title: "Kazbegi Mountain 4x4 Expedition → Gergeti Trinity Church (5,047m)",
        description: "Ascend past Cross Pass (2,395m) to Stepantsminda (Kazbegi). Board 4x4 Delica jeep up to 14th-century Gergeti Trinity Church towering in front of Mount Kazbek snow peak (5,047m).",
        activities: ["Kazbegi 4x4 Delica Mountain Drive", "Gergeti Trinity Church Visit", "Mount Kazbek Snow View", "Highland Khinkali Dumplings Tasting"]
      },
      {
        day: 4,
        title: "Kakheti Wine Region Excursion → Signagi 'City of Love'",
        description: "Excursion to Kakheti wine region. Tour Signagi 18th-century fortified city walls overlooking Alazani Valley. Visit Bodbe Convent of St. Nino and traditional Georgian Qvevri wine tasting.",
        activities: ["Signagi Fortified Walls Walk", "Alazani Valley Viewpoint", "Bodbe Convent Monastery", "Qvevri Wine Cellar Tasting"]
      },
      {
        day: 5,
        title: "Tbilisi City Discovery → Rustaveli Avenue & Bridge of Peace",
        description: "Full day in Tbilisi. Walk along glass Bridge of Peace, Rike Park, Freedom Square, and Rustaveli Avenue shopping. Evening Georgian folklore dinner show.",
        activities: ["Bridge of Peace Glass Walk", "Rustaveli Avenue Shopping", "Dry Bridge Antiques Market", "Georgian Folk Dance Dinner"]
      },
      {
        day: 6,
        title: "Tbilisi Souvenir Shopping → Airport Departure Transfer",
        description: "Enjoy Georgian coffee and Churchkhela sweet procurement before chauffeured transfer to Tbilisi Airport.",
        activities: ["Hotel Breakfast", "Churchkhela Procurement", "TBS Airport Drop-off"]
      }
    ],
    attractions: [
      { name: "Kazbegi Gergeti Trinity Church (2,170m)", description: "14th-century church on mountain ridge under Mount Kazbek 5,047m peak.", image: "/georgia/kazbegi_caucasus_mountain.jpg" },
      { name: "Gudauri Resort & Ananuri Fortress", description: "Caucasus mountain ski resort and 16th-century lakeside fortress.", image: "/georgia/gudauri_ananuri_fortress.jpg" },
      { name: "Tbilisi Old Town & Narikala Cable Car", description: "Pastel wooden balconies, sulfur baths & Narikala fortress views.", image: "/georgia/tbilisi_old_town_narikala.jpg" },
      { name: "Sighnaghi & Kakheti Wine Valley", description: "Walled 'City of Love' overlooking Alazani valley with UNESCO Qvevri wine tasting.", image: "/georgia/sighnaghi_kakheti_wine.jpg" },
      { name: "Martvili Canyon & Okatse Skywalk", description: "Turquoise canyon river rafting and cliffside hanging walkways.", image: "/georgia/martvili_canyon_okatse.jpg" },
      { name: "Uplistsikhe Cave City & Mtskheta", description: "3,000-year-old rock-cut fortress city along ancient Silk Road.", image: "/georgia/uplistsikhe_cave_city.jpg" }
    ],
    inclusions: [
      "5 Nights Accommodation in 4-Star Boutique Hotels with Daily Breakfast",
      "Kazbegi Gergeti Trinity Church 4x4 Jeep Excursion Included",
      "Tbilisi Cable Car Passes & Wine Tasting Tickets",
      "Private Chauffeured AC SUV/Vehicle for Caucasus Highway",
      "English Speaking Guide & Local Permits Included"
    ],
    exclusions: ["Flight Tickets to Tbilisi", "Personal Wine Bottles Procurement"],
    hotels: [{ name: "Tbilisi Old Town Boutique Hotel & Gudauri Mountain Resort", location: "Georgia", stars: 4, room_type: "Caucasus View Suite", meal_plan: "Breakfast & Dinner" }]
  },
  "goa-beach-holiday": {
    slug: "goa-beach-holiday",
    name: "Goa Sun, Sand & Beach Holiday Experience (4D/3N)",
    duration: "4 Days / 3 Nights",
    price: 16500,
    rating: 4.8,
    reviews: 520,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800",
    destinations: ["Calangute", "Baga", "Anjuna", "Dudhsagar Waterfalls", "Panjim", "Fontainhas"],
    highlights: [
      "North Goa Beach Circuit — Baga, Calangute, Anjuna & Aguada Fort",
      "South Goa Heritage Tour — Basilica of Bom Jesus, Se Cathedral & Mangueshi Temple",
      "Mandovi River Evening Sunset Cruise with Live Goan Folk Dance",
      "Dudhsagar Waterfalls 4x4 Jungle Jeep Safari Excursion",
      "Fontainhas Latin Quarter Portuguese Heritage Walk"
    ],
    itinerary: [
      {
        day: 1,
        title: "Goa Airport / Railway Pickup → Beach Resort Check-in & Baga Nightlife",
        description: "Chauffeured pickup from Dabolim / Mopa Airport (or Madgaon / Thivim Station). Check-in to 4-star North Goa beach resort near Calangute. Evening relaxing at Baga beach shacks and Tito's lane nightlife.",
        activities: ["Airport / Station Pickup", "4-Star Beach Resort Check-in", "Baga Beach Sunset", "Tito's Lane Nightlife Stroll"]
      },
      {
        day: 2,
        title: "North Goa Heritage & Beach Circuit → Fort Aguada, Anjuna & Chapora Fort",
        description: "Tour 17th-century Portuguese Fort Aguada lighthouse overlooking Arabian Sea, Sinquerim beach, Calangute, Anjuna cliff beach, and Chapora Fort (Dil Chahta Hai shooting point). Optional parasailing & jet ski water sports.",
        activities: ["Fort Aguada Lighthouse", "Sinquerim Beach Walk", "Chapora Fort Viewpoint", "Parasailing & Jet Ski Water Sports"]
      },
      {
        day: 3,
        title: "South Goa Heritage & Mandovi River Sunset Cruise",
        description: "Tour UNESCO Old Goa churches — Basilica of Bom Jesus (storing mortal remains of St. Francis Xavier) & Se Cathedral. Visit Mangueshi Temple, Spice Plantation lunch, and Fontainhas Latin Quarter. Evening Mandovi River Sunset Cruise with live DJ & Goan Fugdi dance.",
        activities: ["Basilica of Bom Jesus", "Se Cathedral Tour", "Fontainhas Portuguese Walk", "Mandovi River Sunset Cruise"]
      },
      {
        day: 4,
        title: "Dudhsagar Waterfalls Jeep Safari / Souvenir Shopping → Airport Transfer",
        description: "Morning trip to Bhagwan Mahavir Wildlife Sanctuary & Dudhsagar 4x4 Jungle Jeep Safari. Return to Panjim market for cashews and feni shopping before transfer to airport for departure.",
        activities: ["Dudhsagar Waterfalls Jeep Safari", "Panjim Cashew Shopping", "Airport / Station Drop-off"]
      }
    ],
    inclusions: [
      "3 Nights Accommodation in 4-Star Beach Resort near Calangute with Swimming Pool",
      "Daily Buffet Breakfast & Dinner",
      "Mandovi River Sunset Cruise Ticket Included",
      "Full Chauffeured AC Cab for North & South Goa Sightseeing",
      "All Fuel, Tolls & Parking Charges"
    ],
    exclusions: ["Flight / Train fares", "Water sports activities fees"],
    hotels: [{ name: "Calangute Grand Beach Resort / Crown Goa Panjim", location: "Goa", stars: 4, room_type: "Pool View Deluxe Room", meal_plan: "Breakfast & Dinner" }]
  },
  "japan-cherry-blossom": {
    slug: "japan-cherry-blossom",
    name: "Japan Cherry Blossom & Bullet Train Discovery (7D/6N)",
    duration: "7 Days / 6 Nights",
    price: 165000,
    rating: 5.0,
    reviews: 240,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
    destinations: ["Tokyo", "Mount Fuji", "Hakone", "Kyoto", "Osaka"],
    highlights: [
      "Tokyo Skytree, Senso-ji Temple & Shibuya Scramble Crossing",
      "Mount Fuji 5th Station & Lake Kawaguchiko Scenic Cruise",
      "Shinkansen Bullet Train Flight from Tokyo to Kyoto (320 km/h)",
      "Kyoto Fushimi Inari 10,000 Red Torii Gates & Arashiyama Bamboo Grove",
      "Osaka Castle Park, Dotonbori Street Food & Cherry Blossom Viewing"
    ],
    itinerary: [
      {
        day: 1,
        title: "Tokyo Narita / Haneda Airport Pickup → Shinjuku Neon Night Lights",
        description: "Chauffeured pickup from Tokyo Narita (NRT) or Haneda (HND) airport. Check-in to Tokyo city hotel. Evening walk through Shinjuku neon district, Omoide Yokocho lantern alleys, and Metropolitan Building observation deck.",
        activities: ["Tokyo Airport Chauffeured Pickup", "Hotel Check-in", "Shinjuku Neon Alley Stroll", "Tokyo Metropolitan Deck View"]
      },
      {
        day: 2,
        title: "Tokyo Imperial Heritage → Senso-ji Temple, Skytree & Shibuya Crossing",
        description: "Tour 1,400-year-old Senso-ji Temple in Asakusa, Nakamise shopping street, Tokyo Skytree (634m height), Imperial Palace East Gardens, and cross world-famous Shibuya Scramble Crossing near Hachiko statue.",
        activities: ["Senso-ji Asakusa Temple", "Nakamise Shopping Street", "Tokyo Skytree Observatory", "Shibuya Scramble Crossing Walk"]
      },
      {
        day: 3,
        title: "Mount Fuji 5th Station & Lake Kawaguchiko Scenic Cruise",
        description: "Excursion to Mount Fuji (3,776m). Ascend to Mt Fuji 5th Station for snow mountain views. Ride Hakone Ropeway cable car and enjoy Lake Kawaguchiko pirate ship cruise reflecting Mt. Fuji in spring sakura bloom.",
        activities: ["Mount Fuji 5th Station Ascent", "Lake Kawaguchiko Cruise", "Hakone Ropeway Cable Car", "Oshino Hakkai Springs"]
      },
      {
        day: 4,
        title: "Shinkansen Bullet Train to Kyoto → Fushimi Inari 10,000 Torii Gates",
        description: "Board legendary Shinkansen Bullet Train (320 km/h) from Tokyo to ancient imperial capital Kyoto. Visit Fushimi Inari Shrine walking through 10,000 vermilion Torii gates. Evening Gion geisha district walk.",
        activities: ["320 km/h Shinkansen Bullet Train", "Fushimi Inari Torii Gate Walk", "Kiyomizu-dera Temple View", "Gion Geisha Quarter Walk"]
      },
      {
        day: 5,
        title: "Kyoto Arashiyama Bamboo Grove & Kinkaku-ji Golden Pavilion",
        description: "Stroll through serene Arashiyama Bamboo Forest, Togetsukyo Bridge, and world-renowned Kinkaku-ji Golden Pavilion shimmering over mirror pond amidst cherry blossom gardens.",
        activities: ["Arashiyama Bamboo Grove", "Togetsukyo Bridge Walk", "Kinkaku-ji Golden Pavilion", "Traditional Tea Ceremony"]
      },
      {
        day: 6,
        title: "Kyoto to Osaka → Osaka Castle Park & Dotonbori Street Food",
        description: "Short train transfer to Osaka. Visit 16th-century Osaka Castle surrounded by 3,000 cherry trees in full bloom. Evening culinary walk through neon Dotonbori district to taste Takoyaki & Okonomiyaki.",
        activities: ["Osaka Castle Park Cherry Blossoms", "Umeda Sky Building View", "Dotonbori Neon Culinary Walk", "Takoyaki Street Food Tasting"]
      },
      {
        day: 7,
        title: "Kansai Airport Departure Transfer",
        description: "Enjoy Japanese matcha breakfast before private transfer to Osaka Kansai International Airport (KIX) for your departure flight.",
        activities: ["Matcha Breakfast", "Souvenir Procurement", "KIX Airport Drop-off"]
      }
    ],
    inclusions: [
      "6 Nights Accommodation in 4-Star Central City Hotels (Tokyo 3N, Kyoto 2N, Osaka 1N)",
      "Shinkansen Bullet Train Reserved Seat Tickets (Tokyo ➔ Kyoto)",
      "Mount Fuji 5th Station & Lake Kawaguchiko Cruise Tickets",
      "Tokyo Skytree & Osaka Castle Admission Tickets",
      "Daily Japanese & International Buffet Breakfast"
    ],
    exclusions: ["International Flight Tickets to Japan", "Japan Single Entry eVisa Fee"],
    hotels: [{ name: "Shinjuku Prince Hotel Tokyo & Kyoto Century Hotel", location: "Japan", stars: 4, room_type: "Deluxe Twin Room", meal_plan: "Buffet Breakfast" }]
  }
};

// Aliases for Char Dham Variants
STATIC_PACKAGE_REGISTRY["char-dham-yatra-10d-9n"] = { ...STATIC_PACKAGE_REGISTRY["char-dham-yatra-from-haridwar"], slug: "char-dham-yatra-10d-9n", name: "Char Dham Yatra 10 Days 9 Nights (Haridwar Pickup)", duration: "10 Days / 9 Nights" };
STATIC_PACKAGE_REGISTRY["char-dham-yatra-9n-10d"] = { ...STATIC_PACKAGE_REGISTRY["char-dham-yatra-from-haridwar"], slug: "char-dham-yatra-9n-10d", name: "Char Dham Yatra 9N / 10D Deluxe Package", duration: "10 Days / 9 Nights" };
STATIC_PACKAGE_REGISTRY["char-dham-yatra-10d"] = { ...STATIC_PACKAGE_REGISTRY["char-dham-yatra-from-haridwar"], slug: "char-dham-yatra-10d" };
STATIC_PACKAGE_REGISTRY["char-dham-yatra-9n"] = { ...STATIC_PACKAGE_REGISTRY["char-dham-yatra-from-haridwar"], slug: "char-dham-yatra-9n" };
STATIC_PACKAGE_REGISTRY["char-dham-yatra"] = { ...STATIC_PACKAGE_REGISTRY["char-dham-yatra-from-delhi"], slug: "char-dham-yatra" };

// Aliases for Dubai Variants
STATIC_PACKAGE_REGISTRY["dubai-4d-3n"] = { ...STATIC_PACKAGE_REGISTRY["dubai-delights"], slug: "dubai-4d-3n", name: "Dubai Express & Desert Safari (4D/3N)", duration: "4 Days / 3 Nights", price: 39500 };
STATIC_PACKAGE_REGISTRY["dubai-5d-4n"] = { ...STATIC_PACKAGE_REGISTRY["dubai-delights"], slug: "dubai-5d-4n", name: "Dubai Delights & Red Dune Desert Safari (5D/4N)", duration: "5 Days / 4 Nights", price: 45000 };
STATIC_PACKAGE_REGISTRY["dubai-6d-5n"] = { ...STATIC_PACKAGE_REGISTRY["dubai-delights"], slug: "dubai-6d-5n", name: "Dubai & Abu Dhabi Grand Experience (6D/5N)", duration: "6 Days / 5 Nights", price: 54000 };
STATIC_PACKAGE_REGISTRY["dubai-honeymoon"] = { ...STATIC_PACKAGE_REGISTRY["dubai-delights"], slug: "dubai-honeymoon", name: "Dubai Romantic Honeymoon & Helicopter Flight (5D/4N)", duration: "5 Days / 4 Nights", price: 68000 };
STATIC_PACKAGE_REGISTRY["dubai-luxury"] = { ...STATIC_PACKAGE_REGISTRY["dubai-delights"], slug: "dubai-luxury", name: "Dubai Ultra-Luxury VVIP Collection (5D/4N)", duration: "5 Days / 4 Nights", price: 185000 };

// Aliases for Japan Variants
STATIC_PACKAGE_REGISTRY["japan-6d-5n"] = { ...STATIC_PACKAGE_REGISTRY["japan-cherry-blossom"], slug: "japan-6d-5n", name: "Tokyo, Mt. Fuji & Bullet Train Express (6D/5N)", duration: "6 Days / 5 Nights", price: 145000 };
STATIC_PACKAGE_REGISTRY["japan-7d-6n"] = { ...STATIC_PACKAGE_REGISTRY["japan-cherry-blossom"], slug: "japan-7d-6n", name: "Japan Cherry Blossom & Golden Route (7D/6N)", duration: "7 Days / 6 Nights", price: 165000 };

// Aliases for Kerala Variants (Backward Compatibility & SEO)
STATIC_PACKAGE_REGISTRY["kerala-backwaters"] = STATIC_PACKAGE_REGISTRY["kerala-6d5n-hills-backwaters-kovalam"];
STATIC_PACKAGE_REGISTRY["kerala-4d-3n"] = STATIC_PACKAGE_REGISTRY["kerala-4d3n-munnar-alleppey"];
STATIC_PACKAGE_REGISTRY["kerala-5d-4n"] = STATIC_PACKAGE_REGISTRY["kerala-5d4n-tea-wildlife-backwaters"];
STATIC_PACKAGE_REGISTRY["kerala-6d-5n"] = STATIC_PACKAGE_REGISTRY["kerala-6d5n-hills-backwaters-kovalam"];
STATIC_PACKAGE_REGISTRY["kerala-honeymoon"] = { ...STATIC_PACKAGE_REGISTRY["kerala-5d4n-tea-wildlife-backwaters"], slug: "kerala-honeymoon", name: "Kerala Romantic Honeymoon & Treehouse (5D/4N)", duration: "5 Days / 4 Nights", price: 35000 };
STATIC_PACKAGE_REGISTRY["kerala-kovalam-beach"] = STATIC_PACKAGE_REGISTRY["kerala-7d6n-grand-kerala-kanyakumari"];
STATIC_PACKAGE_REGISTRY["kerala-ultra-luxury"] = { ...STATIC_PACKAGE_REGISTRY["kerala-6d5n-hills-backwaters-kovalam"], slug: "kerala-ultra-luxury", name: "Kerala Ultra-Luxury Private Villa & Houseboat (6D/5N)", duration: "6 Days / 5 Nights", price: 68000 };

// Aliases for Georgia Variants
STATIC_PACKAGE_REGISTRY["georgia-5d-4n"] = { ...STATIC_PACKAGE_REGISTRY["georgia-adventure"], slug: "georgia-5d-4n", name: "Tbilisi & Kazbegi Express (5D/4N)", duration: "5 Days / 4 Nights", price: 49500 };
STATIC_PACKAGE_REGISTRY["georgia-6d-5n"] = { ...STATIC_PACKAGE_REGISTRY["georgia-adventure"], slug: "georgia-6d-5n", name: "Georgia Caucasus Mountain & Tbilisi Adventure (6D/5N)", duration: "6 Days / 5 Nights", price: 58000 };
STATIC_PACKAGE_REGISTRY["georgia-7d-6n"] = { ...STATIC_PACKAGE_REGISTRY["georgia-adventure"], slug: "georgia-7d-6n", name: "Grand Georgia & Black Sea Coast Batumi (7D/6N)", duration: "7 Days / 6 Nights", price: 68000 };

// Aliases for Goa Variants
STATIC_PACKAGE_REGISTRY["goa-3d-2n"] = { ...STATIC_PACKAGE_REGISTRY["goa-beach-holiday"], slug: "goa-3d-2n", name: "Goa Weekend Sun & Beach Break (3D/2N)", duration: "3 Days / 2 Nights", price: 12500 };
STATIC_PACKAGE_REGISTRY["goa-4d-3n"] = { ...STATIC_PACKAGE_REGISTRY["goa-beach-holiday"], slug: "goa-4d-3n", name: "Goa Sun, Sand & Beach Holiday Experience (4D/3N)", duration: "4 Days / 3 Nights", price: 16500 };
STATIC_PACKAGE_REGISTRY["goa-5d-4n"] = { ...STATIC_PACKAGE_REGISTRY["goa-beach-holiday"], slug: "goa-5d-4n", name: "Goa Grand Beach, Island & Water Sports (5D/4N)", duration: "5 Days / 4 Nights", price: 21500 };

// Base & Aliases for Himachal
STATIC_PACKAGE_REGISTRY["himachal-hill-stations"] = {
  slug: "himachal-hill-stations",
  name: "Himachal Hill Stations Spectacular (7D/6N)",
  duration: "7 Days / 6 Nights",
  price: 24500,
  rating: 4.9,
  reviews: 182,
  image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
  destinations: ["Shimla", "Kufri", "Kullu", "Manali", "Solang Valley", "Kasol", "Manikaran Sahib"],
  highlights: [
    "Shimla Mall Road, Ridge Promenade & Neo-Gothic Christ Church",
    "Kufri Mahasu Peak Excursion & Traditional Himachali Yak Rides",
    "Solang Valley Snow Sports, Tandem Paragliding & Cable Car",
    "Atal Tunnel Rohtang Drive & Sissu Waterfalls Excursion",
    "Kasol Parvati River Walk & Manikaran Hot Sulfur Thermal Springs"
  ],
  itinerary: [
    { day: 1, title: "Chandigarh Pickup → Scenic Drive to Shimla", description: "Private pickup from Chandigarh Airport / Railway Station. Drive past Pinjore Gardens to Shimla. Evening Mall Road walk.", activities: ["Chandigarh Pickup", "Scenic Drive", "Shimla Mall Road Walk"] },
    { day: 2, title: "Shimla Kufri Snow Adventure & Jakhoo Temple", description: "Excursion to Kufri Mahasu Peak, yak rides, snow viewpoints & Jakhoo Hanuman statue.", activities: ["Kufri Excursion", "Yak & Horse Rides", "Jakhoo Temple"] },
    { day: 3, title: "Shimla to Manali via Kullu Valley Rafting", description: "Drive along Beas river. Visit Pandoh Dam, Kullu shawl factory & Manali mountain resort check-in.", activities: ["Pandoh Dam", "Beas River Rafting", "Kullu Shawl Factory"] },
    { day: 4, title: "Solang Valley Snow Sports & Hadimba Temple", description: "Paragliding, snow skiing in Solang Valley, Solang ropeway & 450-yr-old Hadimba Temple.", activities: ["Solang Paragliding", "Snow Skiing", "Hadimba Temple"] },
    { day: 5, title: "Manali Heritage & Vashisht Hot Sulfur Springs", description: "Visit Vashisht hot sulfur springs, Jogini Waterfall trail & Old Manali cafes.", activities: ["Vashisht Springs", "Jogini Waterfall", "Old Manali Cafes"] },
    { day: 6, title: "Manali to Kasol & Manikaran Sahib Excursion", description: "Kasol Parvati River stroll, Manikaran Gurudwara sacred hot spring bath & local market.", activities: ["Kasol River Walk", "Manikaran Sahib", "Hot Spring Bath"] },
    { day: 7, title: "Kasol to Chandigarh Departure Transfer", description: "Breakfast and chauffeured transfer back to Chandigarh Airport / Railway Station.", activities: ["Breakfast", "Chandigarh Drop-off"] }
  ],
  inclusions: ["6 Nights 4-Star Mountain Resorts", "Solang Valley & Kasol Sightseeing Cabs", "Daily Breakfast & Dinner", "Private Chauffeured AC SUV/Sedan"],
  exclusions: ["Rohtang NGT Permit Fees", "Personal Paragliding / Skiing Tickets"],
  hotels: [{ name: "Shimla Pine Resort & Manali Riverside Resort & Kasol River Lodge", location: "Himachal Pradesh", stars: 4, room_type: "Deluxe Mountain View", meal_plan: "Breakfast & Dinner" }]
};
STATIC_PACKAGE_REGISTRY["himachal-5d-4n"] = { ...STATIC_PACKAGE_REGISTRY["himachal-hill-stations"], slug: "himachal-5d-4n", name: "Shimla & Manali Express (5D/4N)", duration: "5 Days / 4 Nights", price: 19500 };
STATIC_PACKAGE_REGISTRY["himachal-7d-6n"] = { ...STATIC_PACKAGE_REGISTRY["himachal-hill-stations"], slug: "himachal-7d-6n", name: "Himachal Hill Stations Spectacular (7D/6N)", duration: "7 Days / 6 Nights", price: 24500 };
STATIC_PACKAGE_REGISTRY["himachal-8d-7n"] = { ...STATIC_PACKAGE_REGISTRY["himachal-hill-stations"], slug: "himachal-8d-7n", name: "Grand Himachal & Dharamshala Dalhousie (8D/7N)", duration: "8 Days / 7 Nights", price: 32000 };

// Base & Aliases for Thailand
STATIC_PACKAGE_REGISTRY["thailand-tropical"] = {
  slug: "thailand-tropical",
  name: "Thailand Tropical Escapes (6D/5N)",
  duration: "6 Days / 5 Nights",
  price: 38500,
  rating: 4.9,
  reviews: 289,
  image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800",
  destinations: ["Phuket", "Phi Phi Islands", "Krabi", "Maya Bay", "Bangkok"],
  highlights: [
    "Phuket Patong Beach Resort & Bangla Road Walk",
    "Phi Phi Island Speedboat Cruise & Maya Bay Beach",
    "Pileh Lagoon Emerald Swimming & Coral Reef Snorkeling",
    "Krabi 4-Islands Speedboat Excursion & Railay Beach",
    "Bangkok City Temple Tour & Chatuchak Shopping"
  ],
  itinerary: [
    { day: 1, title: "Phuket Airport Pickup → Patong Beach Check-in", description: "Pickup from Phuket Airport. Check-in to Patong beach resort.", activities: ["Airport Pickup", "Hotel Check-in", "Patong Sunset"] },
    { day: 2, title: "Phi Phi Island Speedboat Cruise & Maya Bay", description: "Speedboat to Maya Bay, Pileh Lagoon & snorkeling.", activities: ["Phi Phi Cruise", "Maya Bay", "Snorkeling"] },
    { day: 3, title: "Phuket Big Buddha & Old Town Walk", description: "Visit Big Buddha and Sino-Portuguese Old Town.", activities: ["Big Buddha", "Old Town", "Night Market"] },
    { day: 4, title: "Phuket to Krabi Drive → Ao Nang Beach", description: "Drive past Phang Nga Bay to Krabi Ao Nang Beach.", activities: ["Krabi Drive", "Ao Nang Sunset"] },
    { day: 5, title: "Krabi 4-Islands Speedboat Excursion", description: "Tup Island sandbar, Chicken Island & Phra Nang Cave.", activities: ["4-Islands Cruise", "Railay Beach"] },
    { day: 6, title: "Krabi Airport Departure Transfer", description: "Breakfast and transfer to Krabi Airport.", activities: ["Breakfast", "Airport Drop-off"] }
  ],
  inclusions: ["5 Nights 4-Star Beach Resorts", "Phi Phi & Krabi Speedboat Tours with Lunch", "Private Transfers"],
  exclusions: ["International Flights", "National Park Fees"],
  hotels: [{ name: "Patong Beach Resort Phuket & Ao Nang Resort Krabi", location: "Thailand", stars: 4, room_type: "Deluxe Pool View", meal_plan: "Buffet Breakfast" }]
};
STATIC_PACKAGE_REGISTRY["thailand-4d-3n"] = { ...STATIC_PACKAGE_REGISTRY["thailand-tropical"], slug: "thailand-4d-3n", name: "Bangkok & Pattaya Express (4D/3N)", duration: "4 Days / 3 Nights", price: 28500 };
STATIC_PACKAGE_REGISTRY["thailand-6d-5n"] = { ...STATIC_PACKAGE_REGISTRY["thailand-tropical"], slug: "thailand-6d-5n", name: "Phuket & Krabi Island Hopper (6D/5N)", duration: "6 Days / 5 Nights", price: 38500 };
STATIC_PACKAGE_REGISTRY["thailand-7d-6n"] = { ...STATIC_PACKAGE_REGISTRY["thailand-tropical"], slug: "thailand-7d-6n", name: "Grand Thailand Trio: Bangkok, Pattaya & Phuket (7D/6N)", duration: "7 Days / 6 Nights", price: 46500 };

// Base & Aliases for Maldives
STATIC_PACKAGE_REGISTRY["maldives-paradise"] = {
  slug: "maldives-paradise",
  name: "Maldives Overwater Lagoon Paradise (4D/3N)",
  duration: "4 Days / 3 Nights",
  price: 68500,
  rating: 5.0,
  reviews: 178,
  image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800",
  destinations: ["Male", "South Male Atoll", "Overwater Villa"],
  highlights: [
    "5-Star Overwater Lagoon Villa with Private Deck & Ocean Stairs",
    "Roundtrip Speedboat / Seaplane Airport Transfers",
    "All-Inclusive Full Board Gourmet Meals & Beverages",
    "Sunset Dolphin Watching Cruise",
    "Complimentary Kayaks, Paddleboards & Snorkeling Gear"
  ],
  itinerary: [
    { day: 1, title: "Male Airport VIP Reception → Speedboat Transfer to Water Villa", description: "Speedboat transfer to 5-star resort overwater villa.", activities: ["VIP Airport Welcome", "Speedboat Ride", "Overwater Villa Check-in"] },
    { day: 2, title: "Private Villa Deck Lagoon Bath & Sunset Dolphin Cruise", description: "Lagoon snorkeling and sunset dolphin cruise.", activities: ["Snorkeling", "Dolphin Cruise", "Beach Barbecue"] },
    { day: 3, title: "All-Inclusive Dining & Watersports", description: "Unlimited gourmet meals, kayaking & spa massage.", activities: ["Kayaking", "Couples Massage", "Candlelight Dinner"] },
    { day: 4, title: "Floating Lagoon Breakfast → Male Airport Transfer", description: "Floating breakfast and speedboat to Male Airport.", activities: ["Floating Breakfast", "Speedboat Drop-off"] }
  ],
  inclusions: ["3 Nights 5-Star Overwater Villa", "All-Inclusive Meals & Drinks", "Return Speedboat Transfers"],
  exclusions: ["International Flights"],
  hotels: [{ name: "Sun Siyam Olhuveli / Adaaran Select Hudhuranfushi", location: "Maldives", stars: 5, room_type: "Overwater Water Villa", meal_plan: "All Inclusive" }]
};
STATIC_PACKAGE_REGISTRY["maldives-4d-3n"] = { ...STATIC_PACKAGE_REGISTRY["maldives-paradise"], slug: "maldives-4d-3n", name: "Maldives Overwater Villa Escape (4D/3N)", duration: "4 Days / 3 Nights", price: 68500 };
STATIC_PACKAGE_REGISTRY["maldives-5d-4n"] = { ...STATIC_PACKAGE_REGISTRY["maldives-paradise"], slug: "maldives-5d-4n", name: "Maldives Ultra-Luxury Private Pool Water Villa (5D/4N)", duration: "5 Days / 4 Nights", price: 115000 };

// Base & Aliases for Rajasthan
STATIC_PACKAGE_REGISTRY["rajasthan-royal"] = {
  slug: "rajasthan-royal",
  name: "Royal Rajasthan Forts & Lakes (7D/6N)",
  duration: "7 Days / 6 Nights",
  price: 24500,
  rating: 4.9,
  reviews: 265,
  image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800",
  destinations: ["Jaipur", "Amer Fort", "Jodhpur", "Mehrangarh Fort", "Udaipur", "Lake Pichola"],
  highlights: [
    "Amer Fort Elephant Ride & Sheesh Mahal Mirror Palace",
    "Udaipur City Palace & Sunset Boat Cruise on Lake Pichola",
    "Jodhpur Mehrangarh Fort 125m Cliff & Jaswant Thada",
    "Ranakpur 1,444 Marble Column Jain Temple Excursion",
    "Heritage Haveli Stay with Rajasthani Cultural Folk Performance"
  ],
  itinerary: [
    { day: 1, title: "Jaipur Arrival → Pink City Bazaars", description: "Pickup at Jaipur Airport/Station. Check-in to heritage haveli & evening Johari Bazaar walk.", activities: ["Jaipur Pickup", "Heritage Check-in", "Johari Bazaar"] },
    { day: 2, title: "Amer Fort & Nahargarh Sunset View", description: "Amer Fort elephant ride, Jal Mahal water palace & sunset view over Jaipur from Nahargarh Fort.", activities: ["Amer Fort", "Jal Mahal", "Nahargarh Sunset"] },
    { day: 3, title: "Jaipur to Jodhpur Blue City → Mehrangarh Fort", description: "Drive to Jodhpur. Visit 125m high cliffside Mehrangarh Fort & Jaswant Thada marble cenotaph.", activities: ["Mehrangarh Fort", "Jaswant Thada", "Blue City Walk"] },
    { day: 4, title: "Bishnoi Village 4x4 Safari & Umaid Bhawan", description: "4x4 jeep safari through Bishnoi village & Umaid Bhawan Palace museum.", activities: ["4x4 Village Safari", "Umaid Bhawan Palace"] },
    { day: 5, title: "Jodhpur to Udaipur via Ranakpur Jain Temple", description: "Drive to Udaipur via 15th-century Ranakpur Marble Temple.", activities: ["Ranakpur Temple", "Udaipur Lake Pichola"] },
    { day: 6, title: "Udaipur City Palace & Lake Pichola Boat Cruise", description: "Tour Udaipur City Palace, Saheliyon ki Bari & sunset boat cruise past Taj Lake Palace.", activities: ["City Palace Tour", "Lake Pichola Cruise"] },
    { day: 7, title: "Udaipur Airport Departure Transfer", description: "Breakfast and transfer to Udaipur Maharana Pratap Airport.", activities: ["Breakfast", "Airport Drop-off"] }
  ],
  inclusions: ["6 Nights 4-Star Heritage Hotel Stay", "Lake Pichola Sunset Boat Cruise Ticket", "Ranakpur Temple Entry Pass", "Daily Breakfast & Dinner", "Private AC Cab"],
  exclusions: ["Train / Flight tickets"],
  hotels: [{ name: "Jaipur Heritage Haveli & Jodhpur Palace & Udaipur Lake View Hotel", location: "Rajasthan", stars: 4, room_type: "Royal Heritage Room", meal_plan: "Breakfast & Dinner" }]
};
STATIC_PACKAGE_REGISTRY["rajasthan-5d-4n"] = { ...STATIC_PACKAGE_REGISTRY["rajasthan-royal"], slug: "rajasthan-5d-4n", name: "Jaipur & Ranthambore Tiger Safari (5D/4N)", duration: "5 Days / 4 Nights", price: 19500 };
STATIC_PACKAGE_REGISTRY["rajasthan-7d-6n"] = { ...STATIC_PACKAGE_REGISTRY["rajasthan-royal"], slug: "rajasthan-7d-6n", name: "Royal Rajasthan Forts & Lakes (7D/6N)", duration: "7 Days / 6 Nights", price: 24500 };
STATIC_PACKAGE_REGISTRY["rajasthan-9d-8n"] = { ...STATIC_PACKAGE_REGISTRY["rajasthan-royal"], slug: "rajasthan-9d-8n", name: "Grand Rajasthan Desert & Palace Circuit (9D/8N)", duration: "9 Days / 8 Nights", price: 34500 };

// Base & Aliases for Ladakh
STATIC_PACKAGE_REGISTRY["leh-ladakh-tour"] = {
  slug: "leh-ladakh-tour",
  name: "Ladakh Nubra Valley & Pangong Tso Circuit (7D/6N)",
  duration: "7 Days / 6 Nights",
  price: 38500,
  rating: 5.0,
  reviews: 198,
  image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800",
  destinations: ["Leh", "Khardung La", "Nubra Valley", "Diskit", "Pangong Tso"],
  highlights: [
    "Pangong Tso 134km Blue Lake Overnight Swiss Tent Camp",
    "Khardung La Pass World's Highest Motorable Road (18,380 ft)",
    "Nubra Valley Hunder Sand Dunes & Bactrian Camel Safari",
    "Diskit Monastery 106ft Future Buddha & Thiksey Monastery",
    "Inner Line Permits (ILP) & Oxygen Cylinder Assistance Included"
  ],
  itinerary: [
    { day: 1, title: "Leh Airport Arrival → Acclimatization Rest", description: "Private pickup from Leh Kushok Bakula Airport (IXL). Complete rest for altitude acclimatization.", activities: ["Airport Pickup", "Hotel Check-in", "Acclimatization Rest"] },
    { day: 2, title: "Leh Local Highlights → Hall of Fame, Magnetic Hill & Sangam", description: "Visit Hall of Fame, Magnetic Hill gravity spot & Indus-Zanskar Sangam confluence.", activities: ["Hall of Fame", "Magnetic Hill", "Sangam Confluence"] },
    { day: 3, title: "Leh to Nubra Valley via Khardung La Pass (18,380 ft)", description: "Cross Khardung La (18,380 ft). Diskit Monastery 106ft Buddha & Hunder dunes camel safari.", activities: ["Khardung La Pass", "Diskit Buddha", "Double Humped Camel Safari"] },
    { day: 4, title: "Nubra Valley to Pangong Tso via Shyok River Route", description: "Offbeat drive along Shyok River to Pangong Tso blue lake. Check-in to luxury Swiss tent camp.", activities: ["Shyok Valley Drive", "Pangong Tso Arrival", "Lake Sunset"] },
    { day: 5, title: "Pangong Lake Sunrise → Leh via Chang La Pass", description: "Sunrise over 134km Pangong lake, drive over Chang La Pass (17,590 ft) & Thiksey Monastery.", activities: ["Pangong Sunrise", "Chang La Pass", "Thiksey Monastery"] },
    { day: 6, title: "Leh Shanti Stupa & Leh Main Bazaar Walk", description: "Shanti Stupa sunset view & souvenir shopping in Leh Market.", activities: ["Shanti Stupa", "Leh Main Bazaar"] },
    { day: 7, title: "Leh Airport Departure Transfer", description: "Breakfast and drop-off at Leh Airport.", activities: ["Breakfast", "Airport Drop-off"] }
  ],
  inclusions: ["6 Nights Stay (2 Nights Luxury Tent Camps + 4 Leh Hotels)", "Inner Line Permits & Wildlife Fees", "Khardung La & Chang La Excursions", "Oxygen Cylinder in SUV", "Daily Breakfast & Dinner"],
  exclusions: ["Flight tickets to Leh"],
  hotels: [{ name: "Leh Grand Hotel & Nubra Hunder Camp & Pangong Swiss Tent Camp", location: "Ladakh", stars: 4, room_type: "Deluxe Mountain Room / Tent", meal_plan: "Breakfast & Dinner" }]
};
STATIC_PACKAGE_REGISTRY["ladakh-6d-5n"] = { ...STATIC_PACKAGE_REGISTRY["leh-ladakh-tour"], slug: "ladakh-6d-5n", name: "Leh & Pangong Tso Lake Express (6D/5N)", duration: "6 Days / 5 Nights", price: 32500 };
STATIC_PACKAGE_REGISTRY["ladakh-7d-6n"] = { ...STATIC_PACKAGE_REGISTRY["leh-ladakh-tour"], slug: "ladakh-7d-6n", name: "Ladakh Nubra Valley & Pangong Tso Circuit (7D/6N)", duration: "7 Days / 6 Nights", price: 38500 };

// Base & Aliases for Golden Triangle
STATIC_PACKAGE_REGISTRY["golden-triangle"] = {
  slug: "golden-triangle",
  name: "Golden Triangle Classic Heritage (6D/5N)",
  duration: "6 Days / 5 Nights",
  price: 18500,
  rating: 4.8,
  reviews: 215,
  image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800",
  destinations: ["Delhi", "Agra", "Taj Mahal", "Fatehpur Sikri", "Jaipur", "Amer Fort"],
  highlights: [
    "Delhi Qutub Minar 73m Minaret & Red Fort Guided Tour",
    "Agra Taj Mahal Sunrise Guided Walk & Red Sandstone Agra Fort",
    "Fatehpur Sikri 16th-Century Mughal Capital & Buland Darwaza",
    "1,000-Year-Old Chand Baori Stepwell in Abhaneri",
    "Jaipur Amer Fort Elephant Rampart Ride & Hawa Mahal"
  ],
  itinerary: [
    { day: 1, title: "Delhi Airport Pickup → Qutub Minar & Red Fort", description: "Private pickup at Delhi Airport/Station. Tour Qutub Minar, Red Fort & Humayun's Tomb.", activities: ["Delhi Airport Pickup", "Qutub Minar", "Red Fort"] },
    { day: 2, title: "Old Delhi Rickshaw Ride → Drive to Agra", description: "Chandni Chowk rickshaw ride, drive past India Gate & express highway to Agra.", activities: ["Chandni Chowk Rickshaw", "India Gate Drive", "Yamuna Expressway"] },
    { day: 3, title: "Taj Mahal Sunrise → Agra Fort → Fatehpur Sikri", description: "Sunrise entry to Taj Mahal world wonder, Agra Fort & ghost city Fatehpur Sikri.", activities: ["Taj Mahal Sunrise", "Agra Fort", "Fatehpur Sikri"] },
    { day: 4, title: "Fatehpur Sikri to Jaipur via Chand Baori Stepwell", description: "Drive to Jaipur Pink City visiting 3,500-step Chand Baori stepwell in Abhaneri.", activities: ["Abhaneri Stepwell", "Jaipur Check-in"] },
    { day: 5, title: "Jaipur Amer Fort, City Palace & Jal Mahal", description: "Elephant ride up Amer Fort, Jal Mahal photo stop, City Palace & Jantar Mantar.", activities: ["Amer Fort Elephant Ride", "Jal Mahal", "City Palace"] },
    { day: 6, title: "Jaipur Shopping → Delhi Airport Drop-off", description: "Johari Bazaar shopping and transfer to Delhi / Jaipur Airport.", activities: ["Bazaar Shopping", "Airport Drop-off"] }
  ],
  inclusions: ["5 Nights 4-Star Hotels with Breakfast", "Taj Mahal Sunrise Entry Ticket", "Amer Fort Elephant Ride", "Chandni Chowk Rickshaw Tour", "Private AC Sedan / SUV"],
  exclusions: ["Train / Flight tickets"],
  hotels: [{ name: "Delhi 4-Star Hotel & Agra Palace Hotel & Jaipur Heritage Haveli", location: "Golden Triangle", stars: 4, room_type: "Deluxe Room", meal_plan: "Buffet Breakfast" }]
};
STATIC_PACKAGE_REGISTRY["golden-triangle-4d-3n"] = { ...STATIC_PACKAGE_REGISTRY["golden-triangle"], slug: "golden-triangle-4d-3n", name: "Delhi, Agra & Jaipur Express (4D/3N)", duration: "4 Days / 3 Nights", price: 14500 };
STATIC_PACKAGE_REGISTRY["golden-triangle-6d-5n"] = { ...STATIC_PACKAGE_REGISTRY["golden-triangle"], slug: "golden-triangle-6d-5n", name: "Golden Triangle Classic Heritage (6D/5N)", duration: "6 Days / 5 Nights", price: 18500 };

// Base & Aliases for Seychelles
STATIC_PACKAGE_REGISTRY["seychelles-escape"] = {
  slug: "seychelles-escape",
  name: "Seychelles Island Hopper: Mahé, Praslin & La Digue (7D/6N)",
  duration: "7 Days / 6 Nights",
  price: 115000,
  rating: 4.9,
  reviews: 94,
  image: "https://images.unsplash.com/photo-1589718539308-168eea64146b?q=80&w=800",
  destinations: ["Mahé", "Praslin", "La Digue", "Anse Source d'Argent", "Vallée de Mai"],
  highlights: [
    "La Digue Anse Source d'Argent World's Most Photographed Granite Beach",
    "Praslin Anse Lazio Crescent White Sand Bay & Snorkeling",
    "UNESCO Vallée de Mai Primeval Forest Giant Coco de Mer Palms",
    "Curieuse Island Aldabra Giant Tortoise Sanctuary",
    "Cat Cocos Inter-Island Catamaran Ferry Transfers & 100% VISA-FREE"
  ],
  itinerary: [
    { day: 1, title: "Mahé Airport Pickup → Victoria Capital & Beau Vallon Beach", description: "Private pickup at SEZ Airport. Tour Victoria market & Beau Vallon sunset walk.", activities: ["SEZ Airport Pickup", "Victoria Capital", "Beau Vallon Sunset"] },
    { day: 2, title: "Mahé Scenic Island Drive & Spice Garden", description: "Anse Royale beach, Anse Intendance granite cliffs & Takamaka Rum Distillery.", activities: ["Anse Royale", "Granite Cliffs", "Takamaka Rum"] },
    { day: 3, title: "Cat Cocos Catamaran to Praslin → Vallée de Mai", description: "Catamaran cruise to Praslin. Tour UNESCO Vallée de Mai Coco de Mer forest.", activities: ["Cat Cocos Ferry", "Vallée de Mai", "Praslin Check-in"] },
    { day: 4, title: "Anse Lazio Beach & Curieuse Tortoise Sanctuary", description: "World-famous Anse Lazio beach & boat excursion to Curieuse Island giant tortoises.", activities: ["Anse Lazio", "Giant Tortoise Sanctuary"] },
    { day: 5, title: "Ferry to La Digue → Anse Source d'Argent Granite Rocks", description: "Ferry to La Digue. Bicycle ride to world-famous Anse Source d'Argent granite beach.", activities: ["La Digue Ferry", "Anse Source d'Argent", "Bicycle Tour"] },
    { day: 6, title: "La Digue Beach Stroll → Return Ferry to Mahé", description: "Anse Sevire beach walk and evening Cat Cocos ferry back to Mahé.", activities: ["Anse Sevire", "Return Ferry Mahé"] },
    { day: 7, title: "Mahé Airport Departure Transfer", description: "Breakfast and drop-off at Seychelles International Airport.", activities: ["Breakfast", "Airport Drop-off"] }
  ],
  inclusions: ["6 Nights 4-Star Beach Resorts with Breakfast", "Cat Cocos Inter-Island Catamaran Tickets", "La Digue Bicycle Pass", "Private Transfers"],
  exclusions: ["International Flights"],
  hotels: [{ name: "Mahé Beachfront Resort & Praslin Resort & La Digue Lodge", location: "Seychelles", stars: 4, room_type: "Ocean View Room", meal_plan: "Buffet Breakfast" }]
};
STATIC_PACKAGE_REGISTRY["seychelles-5d-4n"] = { ...STATIC_PACKAGE_REGISTRY["seychelles-escape"], slug: "seychelles-5d-4n", name: "Seychelles Mahé & Praslin Express (5D/4N)", duration: "5 Days / 4 Nights", price: 85000 };
STATIC_PACKAGE_REGISTRY["seychelles-7d-6n"] = { ...STATIC_PACKAGE_REGISTRY["seychelles-escape"], slug: "seychelles-7d-6n", name: "Seychelles Island Hopper: Mahé, Praslin & La Digue (7D/6N)", duration: "7 Days / 6 Nights", price: 115000 };

// Base & Aliases for Turkey
STATIC_PACKAGE_REGISTRY["turkey-adventure"] = {
  slug: "turkey-adventure",
  name: "Grand Turkey: Istanbul, Cappadocia, Pamukkale & Ephesus (8D/7N)",
  duration: "8 Days / 7 Nights",
  price: 98000,
  rating: 4.9,
  reviews: 165,
  image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800",
  destinations: ["Istanbul", "Cappadocia", "Pamukkale", "Ephesus"],
  highlights: [
    "Cappadocia Sunrise Hot Air Balloon Flight over Fairy Chimneys",
    "Authentic Cappadocia Luxury Cave Hotel Accommodation",
    "Istanbul Hagia Sophia, Blue Mosque & Bosphorus Dinner Cruise",
    "Pamukkale White Calcium Travertine Thermal Pools & Cleopatra Bath",
    "Ancient Roman City of Ephesus & Library of Celsus"
  ],
  itinerary: [
    { day: 1, title: "Istanbul Airport Pickup → Bosphorus Dinner Cruise", description: "Private pickup at IST Airport. Evening Bosphorus dinner cruise past illuminated European & Asian palaces.", activities: ["IST Airport Pickup", "Bosphorus Dinner Cruise"] },
    { day: 2, title: "Istanbul Sultanahmet → Hagia Sophia & Blue Mosque", description: "Tour Hagia Sophia, 6-minaret Blue Mosque, Topkapi Palace & Basilica Cistern.", activities: ["Hagia Sophia", "Blue Mosque", "Topkapi Palace"] },
    { day: 3, title: "Domestic Flight to Cappadocia → Cave Hotel Check-in", description: "Fly to Cappadocia (NAV/ASR). Check-in to authentic cave hotel & Goreme Open Air Museum.", activities: ["Domestic Flight", "Cave Hotel Check-in", "Goreme Valley"] },
    { day: 4, title: "Cappadocia Sunrise Hot Air Balloon Flight", description: "Dawn hot air balloon flight over fairy chimneys. Champagne toast, Love Valley & Uchisar Castle.", activities: ["Sunrise Balloon Flight", "Fairy Chimneys", "Uchisar Castle"] },
    { day: 5, title: "Cappadocia to Pamukkale Travertine Thermal Pools", description: "Drive to Pamukkale. Walk white cotton castle travertine pools & Cleopatra antique thermal bath.", activities: ["Travertine Pools", "Cleopatra Thermal Bath"] },
    { day: 6, title: "Pamukkale to Kusadasi → Ancient City of Ephesus", description: "Tour 2-storey marble Library of Celsus at Ephesus & House of Virgin Mary.", activities: ["Ephesus Ruins", "Library of Celsus", "Virgin Mary House"] },
    { day: 7, title: "Domestic Flight to Istanbul → Grand Bazaar Shopping", description: "Domestic flight back to Istanbul. Grand Bazaar & Spice Market shopping.", activities: ["Flight Istanbul", "Grand Bazaar Shopping"] },
    { day: 8, title: "Istanbul Airport Departure Transfer", description: "Breakfast and transfer to Istanbul International Airport.", activities: ["Breakfast", "Airport Drop-off"] }
  ],
  inclusions: ["7 Nights Accommodation (2 Nights Luxury Cave Hotel + 5 Nights 4-Star Hotels)", "Cappadocia Sunrise Hot Air Balloon Flight Pass", "Domestic Flights within Turkey", "Bosphorus Dinner Cruise Ticket", "Private AC Transfers"],
  exclusions: ["Turkey eVisa Fee", "International Flights"],
  hotels: [{ name: "Istanbul Old City Hotel & Cappadocia Luxury Cave Hotel & Pamukkale Resort", location: "Turkey", stars: 4, room_type: "Cave Suite / Deluxe Room", meal_plan: "Buffet Breakfast" }]
};
STATIC_PACKAGE_REGISTRY["turkey-6d-5n"] = { ...STATIC_PACKAGE_REGISTRY["turkey-adventure"], slug: "turkey-6d-5n", name: "Istanbul & Cappadocia Balloon Express (6D/5N)", duration: "6 Days / 5 Nights", price: 78000 };
STATIC_PACKAGE_REGISTRY["turkey-8d-7n"] = { ...STATIC_PACKAGE_REGISTRY["turkey-adventure"], slug: "turkey-8d-7n", name: "Grand Turkey: Istanbul, Cappadocia, Pamukkale & Ephesus (8D/7N)", duration: "8 Days / 7 Nights", price: 98000 };

// Base & Aliases for Mauritius
STATIC_PACKAGE_REGISTRY["mauritius-bliss"] = {
  slug: "mauritius-bliss",
  name: "Mauritius Beach Resort & Île aux Cerfs (6D/5N)",
  duration: "6 Days / 5 Nights",
  price: 72000,
  rating: 4.8,
  reviews: 112,
  image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800",
  destinations: ["Port Louis", "Trou aux Biches", "Île aux Cerfs", "Chamarel"],
  highlights: [
    "4-Star Beachfront Resort Stay on Trou aux Biches Coral Coast",
    "Île aux Cerfs Island Speedboat Cruise with Beach BBQ Lunch",
    "Chamarel 7-Colored Earth Sand Dunes & 83m Plunge Waterfall",
    "Port Louis Citadel 360 View & Caudan Waterfront Shopping",
    "100% FREE 60-Day Visa on Arrival for Indian Passport Holders"
  ],
  itinerary: [
    { day: 1, title: "MRU Airport Pickup → Beach Resort Check-in", description: "Private pickup from SSR Airport (MRU). Check-in to beachfront resort & evening beach walk.", activities: ["MRU Airport Pickup", "Beach Resort Check-in"] },
    { day: 2, title: "North Island Tour → Port Louis & Caudan Waterfront", description: "Port Louis capital tour, Fort Adelaide Citadel 360 view & Caudan Waterfront shopping.", activities: ["Port Louis Citadel", "Caudan Waterfront"] },
    { day: 3, title: "Île aux Cerfs Speedboat Cruise & Water Sports", description: "Speedboat cruise to Île aux Cerfs lagoon. Parasailing, undersea walk & beach BBQ lunch.", activities: ["Île aux Cerfs Speedboat", "Parasailing", "Beach BBQ Lunch"] },
    { day: 4, title: "South Island Tour → Chamarel 7-Colored Earth", description: "Chamarel 7-Colored Earth sand dunes, 83m waterfall & sacred Grand Bassin Shiva lake.", activities: ["7-Colored Earth", "Grand Bassin", "Chamarel Waterfall"] },
    { day: 5, title: "Catamaran Sunset Cruise & Lagoon Swimming", description: "Catamaran sailing trip across turquoise lagoon with snorkeling & BBQ lunch.", activities: ["Catamaran Cruise", "Lagoon Snorkeling"] },
    { day: 6, title: "Duty-Free Shopping → Departure Transfer", description: "Breakfast, duty-free shopping and private transfer to MRU Airport.", activities: ["Duty-Free Shopping", "Airport Drop-off"] }
  ],
  inclusions: ["5 Nights 4-Star Beachfront Resort Stay", "Île aux Cerfs Speedboat Cruise with BBQ Lunch", "Full North & South Island Guided Tours", "Daily Breakfast & Dinner", "Private AC Transfers"],
  exclusions: ["International Flights"],
  hotels: [{ name: "Le Mauricia Beachcomber Resort / Radisson Blu Azuri", location: "Mauritius", stars: 4, room_type: "Superior Ocean View", meal_plan: "Breakfast & Dinner" }]
};
STATIC_PACKAGE_REGISTRY["mauritius-6d-5n"] = { ...STATIC_PACKAGE_REGISTRY["mauritius-bliss"], slug: "mauritius-6d-5n", name: "Mauritius Beach Resort & Île aux Cerfs (6D/5N)", duration: "6 Days / 5 Nights", price: 72000 };

const DynamicPackageDetail: React.FC<DynamicPackageDetailProps> = ({ slug: propSlug, fallbackData, fallback }) => {
  const params = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeVariantId, setActiveVariantId] = useState<string>('');
  const [passengerCount, setPassengerCount] = useState<number>(2);
  const [selectedCabId, setSelectedCabId] = useState<string>('sedan');
  const [dhamAdultsCount, setDhamAdultsCount] = useState<number>(2);
  const [dhamRoomsCount, setDhamRoomsCount] = useState<number>(1);
  const [selectedMealPlan, setSelectedMealPlan] = useState<string>('cp');

  const currentSlug = propSlug || params.slug || window.location.pathname.split('/').pop() || '';

  useEffect(() => {
    if (passengerCount >= 1 && passengerCount <= 4) {
      if (selectedCabId === 'tempo') {
        setSelectedCabId('sedan');
      }
    } else if (passengerCount >= 5 && passengerCount <= 6) {
      if (selectedCabId === 'sedan' || selectedCabId === 'tempo') {
        setSelectedCabId('suv_ertiga');
      }
    } else if (passengerCount >= 7) {
      if (selectedCabId !== 'tempo') {
        setSelectedCabId('tempo');
      }
    }
  }, [passengerCount]);

  const getInitialVariantId = (variants: any[], slug: string) => {
    if (!variants || variants.length === 0) return '';
    const s = (slug || '').toLowerCase();
    let matched: any = null;
    if (s.includes('2d1n') || s.includes('1n2d') || s.includes('1-night') || s.includes('2-day')) {
      matched = variants.find((v: any) => 
        (v.id && (v.id === '1n2d' || v.id.includes('1n'))) || 
        (v.variant_key && (v.variant_key === '1n2d' || v.variant_key.includes('1n'))) || 
        (v.label && (v.label.includes('1N') || v.label.includes('2D'))) || 
        (v.nights === 1 && v.days === 2)
      );
    } else if (s.includes('3d2n') || s.includes('2n3d') || s.includes('2-night') || s.includes('3-day')) {
      matched = variants.find((v: any) => 
        (v.id && (v.id === '2n3d' || v.id.includes('2n'))) || 
        (v.variant_key && (v.variant_key === '2n3d' || v.variant_key.includes('2n'))) || 
        (v.label && (v.label.includes('2N') || v.label.includes('3D'))) || 
        (v.nights === 2 && v.days === 3)
      );
    } else if (s.includes('4d3n') || s.includes('3n4d') || s.includes('3-night') || s.includes('4-day')) {
      matched = variants.find((v: any) => 
        (v.id && (v.id === '3n4d' || v.id.includes('3n'))) || 
        (v.variant_key && (v.variant_key === '3n4d' || v.variant_key.includes('3n'))) || 
        (v.label && (v.label.includes('3N') || v.label.includes('4D'))) || 
        (v.nights === 3 && v.days === 4)
      );
    } else if (s.includes('5d4n') || s.includes('4n5d') || s.includes('4-night') || s.includes('5-day')) {
      matched = variants.find((v: any) => 
        (v.id && (v.id === '4n5d' || v.id.includes('4n'))) || 
        (v.variant_key && (v.variant_key === '4n5d' || v.variant_key.includes('4n'))) || 
        (v.label && (v.label.includes('4N') || v.label.includes('5D'))) || 
        (v.nights === 4 && v.days === 5)
      );
    } else if (s.includes('day-trip') || s.includes('daytrip')) {
      matched = variants.find((v: any) => 
        (v.id && v.id.includes('day')) || 
        (v.variant_key && v.variant_key.includes('day')) || 
        (v.label && v.label.toLowerCase().includes('day')) || 
        v.nights === 0
      );
    }
    
    // Default to matched variant, or fallback to first overnight / popular variant
    const chosen = matched || variants.find((v: any) => v.nights > 0) || variants[0];
    return String(chosen.id || chosen.variant_key || chosen.variantKey || chosen.label || '');
  };

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        if (!currentSlug) return;

        // 1. Check local catalog cache for CRM package updates
        const localCatalogStr = localStorage.getItem('crm_package_catalog');
        let localPkg: any = null;
        if (localCatalogStr) {
          try {
            const localCatalog = JSON.parse(localCatalogStr);
            if (Array.isArray(localCatalog)) {
              localPkg = localCatalog.find((p: any) => p.slug === currentSlug || p.id === currentSlug);
            }
          } catch (e) {
            console.error('Error parsing local package catalog cache:', e);
          }
        }

        // 2. Prioritize Live Database API Fetch
        const apiBase = import.meta.env.VITE_API_BASE_URL || '/php-backend';
        const endpoint = `${apiBase}/packages.php?slug=${encodeURIComponent(currentSlug)}&include_variants=1`;
        
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const data = await res.json();
            const apiPkg = Array.isArray(data) ? data[0] : (data.package || (data && (data.name || data.title) ? data : null));
            if (apiPkg && (apiPkg.name || apiPkg.title) && (apiPkg.is_active !== false)) {
              const staticRegistryPkg = STATIC_PACKAGE_REGISTRY[currentSlug];
              const finalPkg = {
                ...(staticRegistryPkg || {}),
                ...apiPkg,
                ...(localPkg && Number(localPkg.price) > 3000 ? localPkg : {})
              };
              setPkg(finalPkg);
              if (finalPkg.variants && finalPkg.variants.length > 0) {
                setActiveVariantId(getInitialVariantId(finalPkg.variants, currentSlug));
              }
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Live API fetch unavailable, falling back to static registry:', e);
        }

        // 3. Fallback to Local Static Registry if API has no record or is offline
        const staticRegistryPkg = STATIC_PACKAGE_REGISTRY[currentSlug];

        if (staticRegistryPkg) {
          const mergedPkg = {
            ...staticRegistryPkg,
            ...(localPkg && Number(localPkg.price) > 3000 ? localPkg : {})
          };
          setPkg(mergedPkg);
          if (mergedPkg.variants && mergedPkg.variants.length > 0) {
            setActiveVariantId(getInitialVariantId(mergedPkg.variants, currentSlug));
          }
          setLoading(false);
          return;
        }

        if (localPkg) {
          setPkg(localPkg);
          if (localPkg.variants && localPkg.variants.length > 0) {
            setActiveVariantId(getInitialVariantId(localPkg.variants, currentSlug));
          }
        } else {
          // Fuzzy Slug Matcher to guarantee non-empty fallback for any slug format
          const normSlug = currentSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matchKey = Object.keys(STATIC_PACKAGE_REGISTRY).find(k => {
            const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            return normK === normSlug || normK.includes(normSlug) || normSlug.includes(normK);
          });

          if (matchKey && STATIC_PACKAGE_REGISTRY[matchKey]) {
            setPkg(STATIC_PACKAGE_REGISTRY[matchKey]);
          } else if (normSlug.includes('chardham') || normSlug.includes('dham')) {
            setPkg(STATIC_PACKAGE_REGISTRY['char-dham-yatra-from-haridwar'] || STATIC_PACKAGE_REGISTRY['char-dham-yatra-from-delhi']);
          } else if (normSlug.includes('dodham')) {
            setPkg(STATIC_PACKAGE_REGISTRY['do-dham-yatra']);
          } else if (normSlug.includes('kedarnath')) {
            setPkg(STATIC_PACKAGE_REGISTRY['kedarnath-yatra']);
          } else if (normSlug.includes('georgia')) {
            setPkg(STATIC_PACKAGE_REGISTRY['georgia-adventure'] || STATIC_PACKAGE_REGISTRY['georgia-6d-5n']);
          } else if (normSlug.includes('kashmir')) {
            setPkg(STATIC_PACKAGE_REGISTRY['classic-kashmir-5n6d'] || STATIC_PACKAGE_REGISTRY['grand-kashmir-7n8d']);
          } else if (normSlug.includes('kerala')) {
            setPkg(STATIC_PACKAGE_REGISTRY['kerala-backwaters']);
          } else if (normSlug.includes('singapore')) {
            setPkg(STATIC_PACKAGE_REGISTRY['singapore-5d-4n'] || STATIC_PACKAGE_REGISTRY['singapore-4d-3n']);
          } else if (normSlug.includes('rann') || normSlug.includes('kutch')) {
            setPkg(STATIC_PACKAGE_REGISTRY['rann-utsav-3d2n'] || STATIC_PACKAGE_REGISTRY['rann-utsav-4d3n']);
          } else if (fallbackData) {
            setPkg(fallbackData);
            if (fallbackData.variants && fallbackData.variants.length > 0) {
              setActiveVariantId(getInitialVariantId(fallbackData.variants, currentSlug));
            }
          }
        }
      } catch (err) {
        console.warn('API fetch failed, utilizing registry/fallback data:', err);
        const localCatalogStr = localStorage.getItem('crm_package_catalog');
        let localPkg: any = null;
        if (localCatalogStr) {
          try {
            const localCatalog = JSON.parse(localCatalogStr);
            if (Array.isArray(localCatalog)) {
              localPkg = localCatalog.find((p: any) => p.slug === currentSlug || p.id === currentSlug);
            }
          } catch (e) {}
        }

        let resolvedPkg = localPkg || STATIC_PACKAGE_REGISTRY[currentSlug] || fallbackData;
        if (resolvedPkg) {
          try {
            const dbItinerary = await itineraryService.getItinerary(currentSlug);
            if (dbItinerary && dbItinerary.length > 0) {
              resolvedPkg = {
                ...resolvedPkg,
                itinerary: dbItinerary.map(d => ({
                  day: d.day_number,
                  title: d.title,
                  description: d.description,
                  activities: d.activities || []
                }))
              };
            }
          } catch (err) {
            console.warn('Itinerary DB load skipped:', err);
          }
          setPkg(resolvedPkg);
          if (resolvedPkg.variants && resolvedPkg.variants.length > 0) {
            setActiveVariantId(getInitialVariantId(resolvedPkg.variants, currentSlug));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [currentSlug, fallbackData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1026]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border border-[#C9A25A]/20" />
            <div className="absolute inset-0 rounded-full border-t-[1.5px] border-[#C9A25A] animate-spin" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A]/70">
            Crafting your journey
          </div>
        </div>
      </div>
    );
  }

  const effectivePkg = pkg || fallbackData;

  if (!effectivePkg) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <NotFound />;
  }

  // Format price for display
  const numericPrice = Number(effectivePkg.price) || 0;
  const formattedPrice = numericPrice.toLocaleString('en-IN');

  const packageDetails = {
    title: cleanMojibakeText(effectivePkg.name || effectivePkg.title),
    duration: cleanMojibakeText(effectivePkg.duration || 'Flexible'),
    price: formattedPrice,
    rating: Number(effectivePkg.rating) || 5.0,
    reviews: effectivePkg.reviews || 0,
    image: effectivePkg.image || '',
    destinations: (effectivePkg.destinations || []).map(cleanMojibakeText),
    highlights: (effectivePkg.highlights || []).map(cleanMojibakeText),
    itinerary: (effectivePkg.itinerary || []).map((it: any) => ({
      ...it,
      title: cleanMojibakeText(it.title || it.day_title || ''),
      description: cleanMojibakeText(it.description || ''),
      activities: (it.activities || []).map(cleanMojibakeText)
    })),
    inclusions: (effectivePkg.inclusions || []).map(cleanMojibakeText),
    exclusions: (effectivePkg.exclusions || []).map(cleanMojibakeText)
  };

  const getDestinationGalleryImages = (pkg: any, primaryImg: string) => {
    // If package has explicit multiple images, use them
    if (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 1) {
      return pkg.images;
    }

    const destStr = ((pkg.destinations || []).join(' ') + ' ' + (pkg.name || pkg.title || '') + ' ' + (pkg.slug || '')).toLowerCase();

    let destGallery: string[] = [];

    if (destStr.includes('georgia') || destStr.includes('tbilisi') || destStr.includes('kazbegi') || destStr.includes('gudauri')) {
      destGallery = [
        "/georgia/kazbegi_caucasus_mountain.jpg",
        "/georgia/gudauri_ananuri_fortress.jpg",
        "/georgia/tbilisi_old_town_narikala.jpg",
        "/georgia/sighnaghi_kakheti_wine.jpg",
        "/georgia/martvili_canyon_okatse.jpg",
        "/georgia/uplistsikhe_cave_city.jpg"
      ];
    } else if (destStr.includes('kashmir') || destStr.includes('srinagar') || destStr.includes('gulmarg') || destStr.includes('pahalgam') || destStr.includes('sonamarg')) {
      destGallery = [
        "/kashmir/gulmarg_gondola.jpg",
        "/kashmir/dal_lake_shikara.jpg",
        "/kashmir/pahalgam_betaab_valley.jpg",
        "/kashmir/sonamarg_thajiwas_glacier.jpg",
        "/kashmir/srinagar_mughal_gardens.jpg",
        "/kashmir/doodhpathri_kashmir.jpg",
        "/kashmir/baisaran_valley_pahalgam.jpg",
        "/kashmir/sinthan_top_kashmir.jpg"
      ];
    } else if (destStr.includes('kerala') || destStr.includes('munnar') || destStr.includes('alleppey') || destStr.includes('thekkady') || destStr.includes('kovalam') || destStr.includes('kochi')) {
      destGallery = [
        "/kerala/alleppey_backwaters_houseboat.jpg",
        "/kerala/munnar_tea_estates.jpg",
        "/kerala/eravikulam_nilgiri_tahr.jpg",
        "/kerala/thekkady_periyar_sanctuary.jpg",
        "/kerala/fort_kochi_chinese_nets.jpg",
        "/kerala/kovalam_lighthouse_beach.jpg",
        "/kerala/jatayu_earth_center.jpg",
        "/kerala/vagamon_pine_forest.jpg"
      ];
    } else if (destStr.includes('singapore') || destStr.includes('sentosa') || destStr.includes('marina bay')) {
      destGallery = [
        "/singapore/gardens_by_the_bay.jpg",
        "/singapore/universal_studios.jpg",
        "/singapore/singapore_flyer.jpg",
        "/singapore/jewel_changi.jpg",
        "/singapore/marina_bay_sands.jpg",
        "/singapore/merlion_park.jpg",
        "/singapore/cable_car_sentosa.jpg",
        "/singapore/wings_of_time_sentosa.jpg",
        "/singapore/haji_lane_heritage.jpg",
        "/singapore/mandai_river_wonders.jpg"
      ];
    } else if (destStr.includes('dham') || destStr.includes('kedarnath') || destStr.includes('badrinath') || destStr.includes('yamunotri') || destStr.includes('gangotri')) {
      destGallery = [
        "/Kedarnath.png",
        "/Badrinath.png",
        "/Gangotri.png",
        "/Yamunotri.png"
      ];
    } else if (destStr.includes('rann') || destStr.includes('kutch') || destStr.includes('dhordo') || destStr.includes('utsav')) {
      destGallery = [
        "/rann_utsav_white_desert.jpg",
        "/rann_utsav_tent_city.jpg",
        "/rann_utsav_kalo_dungar.jpg",
        "/rann_utsav_road_to_heaven.jpg",
        "/Rann-Utsav-Gujarat.png"
      ];
    } else if (destStr.includes('europe') || destStr.includes('paris') || destStr.includes('swiss')) {
      destGallery = [
        "/Europe Image New.png",
        "/Europe Image Neww.png",
        "/Europe Image.png"
      ];
    }

    if (destGallery.length > 0) {
      return primaryImg ? Array.from(new Set([primaryImg, ...destGallery])).filter(Boolean) : destGallery;
    }

    const attractionImgs = (pkg.attractions || []).map((a: any) => typeof a === 'object' ? a.image : '').filter(Boolean);
    const combined = Array.from(new Set([primaryImg, ...attractionImgs, ...(pkg.images || [])])).filter(Boolean);
    return combined.length > 0 ? combined : [primaryImg || '/Europe Image New.png'];
  };

  const imagesSlider = getDestinationGalleryImages(effectivePkg, packageDetails.image);
  const packageType = effectivePkg.package_type || effectivePkg.packageType || 'domestic';
  const bestTime = effectivePkg.best_time || effectivePkg.bestTime || 'October to March';
  const groupSize = effectivePkg.group_size || effectivePkg.groupSize || 'Custom Group';
  const difficulty = effectivePkg.difficulty || 'Easy';
  
  const getDynamicMapLocations = (pkg: any) => {
    if (pkg.map_locations && pkg.map_locations.length > 0) return pkg.map_locations;
    if (pkg.mapLocations && pkg.mapLocations.length > 0) return pkg.mapLocations;

    const destStr = ((pkg.destinations || []).join(' ') + ' ' + (pkg.name || pkg.title || '')).toLowerCase();

    if (destStr.includes('dham') || destStr.includes('kedarnath') || destStr.includes('badrinath') || destStr.includes('haridwar')) {
      return [
        { name: 'Haridwar (Gateway to Gods)', coordinates: [29.9457, 78.1642], description: 'Ganga Aarti & Starting Hub' },
        { name: 'Barkot / Guptkashi Base', coordinates: [30.8100, 78.2100], description: 'Scenic Himalayan Base Camp' },
        { name: 'Kedarnath Temple (3,583m)', coordinates: [30.7346, 79.0669], description: 'Venerated High Altitude Shrine' },
        { name: 'Badrinath Temple (3,300m)', coordinates: [30.7433, 79.4938], description: 'Holy Abode of Lord Vishnu' },
        { name: 'Rishikesh Confluence', coordinates: [30.0869, 78.2676], description: 'Triveni Ghat & Spiritual Ending' }
      ];
    } else if (destStr.includes('kashmir') || destStr.includes('srinagar') || destStr.includes('gulmarg') || destStr.includes('pahalgam')) {
      return [
        { name: 'Srinagar (Dal Lake)', coordinates: [34.0837, 74.7973], description: 'Shikara Ride & Luxury Houseboat Stay' },
        { name: 'Gulmarg (2,650m)', coordinates: [34.0484, 74.3805], description: 'World Highest Gondola Cable Car' },
        { name: 'Pahalgam (Valley of Shepherds)', coordinates: [34.0161, 75.3150], description: 'Betaab Valley & Lidder River Walk' },
        { name: 'Sonamarg (Meadow of Gold)', coordinates: [34.3000, 75.2900], description: 'Thajiwas Glacier & Snow Excursion' }
      ];
    } else if (destStr.includes('himachal') || destStr.includes('manali') || destStr.includes('shimla')) {
      return [
        { name: 'Chandigarh Hub', coordinates: [30.7333, 76.7794], description: 'Pickup & Highway Drive' },
        { name: 'Shimla (Mall Road)', coordinates: [31.1048, 77.1734], description: 'Colonial Heritage & Ridge Walk' },
        { name: 'Manali (Solang Valley)', coordinates: [32.2432, 77.1892], description: 'Adventure Sports & Snow Point' },
        { name: 'Rohtang Pass (3,978m)', coordinates: [32.3716, 77.2466], description: 'High Mountain Pass & Glacier Views' }
      ];
    } else if (destStr.includes('kerala') || destStr.includes('munnar') || destStr.includes('alleppey') || destStr.includes('cochin')) {
      return [
        { name: 'Cochin (Kochi Port)', coordinates: [9.9312, 76.2673], description: 'Chinese Fishing Nets & Fort Kochi' },
        { name: 'Munnar (Tea Gardens)', coordinates: [10.0889, 77.0595], description: 'Eravikulam Park & Spice Plantations' },
        { name: 'Thekkady (Periyar Reserve)', coordinates: [9.6031, 77.1610], description: 'Wild Boating & Spice Farm Tour' },
        { name: 'Alleppey (Backwaters)', coordinates: [9.4981, 76.3388], description: 'Overnight Luxury Houseboat Cruise' }
      ];
    } else if (destStr.includes('rajasthan') || destStr.includes('jaipur') || destStr.includes('jaisalmer') || destStr.includes('udaipur')) {
      return [
        { name: 'Jaipur (Pink City)', coordinates: [26.9124, 75.7873], description: 'Amber Fort & Hawa Mahal Tour' },
        { name: 'Jodhpur (Blue City)', coordinates: [26.2389, 73.0243], description: 'Mehrangarh Fort & Umaid Bhawan' },
        { name: 'Jaisalmer (Golden Fort & Dunes)', coordinates: [26.9157, 70.9083], description: 'Thar Desert Camp & Camel Safari' },
        { name: 'Udaipur (City of Lakes)', coordinates: [24.5854, 73.7125], description: 'Lake Pichola Boating & City Palace' }
      ];
    } else if (destStr.includes('rann') || destStr.includes('kutch') || destStr.includes('bhuj') || destStr.includes('utsav')) {
      return [
        { name: 'Bhuj (Airport / Station)', coordinates: [23.2420, 69.6669], description: 'Pickup & Gateway to Kutch' },
        { name: 'Tent City Dhordo (White Rann)', coordinates: [23.7802, 69.5135], description: 'Luxury Tent City & Salt Desert' },
        { name: 'Kalo Dungar (Black Hill 462m)', coordinates: [23.8643, 69.8702], description: 'Panoramic 360° Indo-Pak View' },
        { name: 'Road to Heaven Highway', coordinates: [23.7500, 70.1000], description: '30km Highway Drive across White Waters' },
        { name: "Dholavira UNESCO Ruins", coordinates: [23.8860, 70.3600], description: '5,000-year Harappan Metropolis' },
        { name: 'Mandvi Beach & Royal Palace', coordinates: [22.8333, 69.3500], description: 'Vijay Vilas Palace & Coastal Beach' }
      ];
    } else {
      const dests = pkg.destinations || [pkg.name || pkg.title || 'Central Hub'];
      return dests.map((d: string, idx: number) => ({
        name: d,
        coordinates: [20 + idx * 2, 75 + idx * 2],
        description: `${d} Key Sightseeing & Experience`
      }));
    }
  };

  const mapLocations = getDynamicMapLocations(effectivePkg);
  const faqs = (effectivePkg.faqs && effectivePkg.faqs.length > 0)
    ? effectivePkg.faqs
    : getDestinationFaqs(effectivePkg.slug || currentSlug || effectivePkg.destination || effectivePkg.name || '');
  const flightRoutes = effectivePkg.flight_routes || effectivePkg.flightRoutes || [];

  const virtualTourData = effectivePkg.virtual_tour && Object.keys(effectivePkg.virtual_tour).length > 0 ? effectivePkg.virtual_tour : {
    destination: packageDetails.destinations[0] || 'Destination',
    tourStops: []
  };

  const quickFacts = (effectivePkg.quick_facts && Object.keys(effectivePkg.quick_facts).length > 0) ? effectivePkg.quick_facts : {
    groupSize: groupSize,
    bestTime: bestTime,
    difficulty: difficulty,
    ageLimit: 'All Ages',
    accommodation: effectivePkg.hotels?.[0]?.name ? (effectivePkg.hotels[0].name.length > 20 ? effectivePkg.hotels[0].name.slice(0, 20) + '...' : effectivePkg.hotels[0].name) : 'Hotels Included',
    meals: effectivePkg.hotels?.[0]?.meal_plan ? (effectivePkg.hotels[0].meal_plan.length > 20 ? effectivePkg.hotels[0].meal_plan.slice(0, 20) + '...' : effectivePkg.hotels[0].meal_plan) : 'All Meals Included',
    transport: effectivePkg.inclusions?.some((i: string) => i.toLowerCase().includes('coach')) ? 'Fixed AC Coach' : 'Transfers Included'
  };

  const baseUrl = window.location.origin;
  const canonicalUrl = `${baseUrl}/packages/${effectivePkg.slug || currentSlug}`;
  const seoDesc = effectivePkg.seo_description || `${packageDetails.duration} tour of ${packageDetails.destinations.join(', ')}. Includes stay, transfers, and activities.`;

  // Map variants if available
  const rawVariants: any[] = effectivePkg.variants || [];
  const mappedVariants: PackageVariant[] = rawVariants.map((v: any) => ({
    id: String(v.id || v.variant_key || v.variantKey || v.label),
    label: v.label,
    nights: Number(v.nights || 0),
    days: Number(v.days || 1),
    tag: v.tag,
    pricePerPerson: Number(v.price_per_person || v.pricePerPerson || 0),
    hotelCategory: v.hotel_category || v.hotelCategory || 'Standard Stay',
    groupSize: v.group_size || v.groupSize,
    inclusions: v.inclusions || [],
    exclusions: v.exclusions || [],
    hotels: (v.hotels || []).map((h: any) => ({
      name: h.hotel_name || h.name || '',
      location: h.location || '',
      stars: Number(h.stars || 3),
      highlight: h.highlight || ''
    })),
    excursions: (v.excursions || []).map((e: any) => ({
      name: e.excursion_name || e.name || '',
      description: e.description || '',
      duration: e.duration || '',
      price: e.price,
      included: e.is_included === 1 || e.included === true
    })),
    itinerary: (v.itinerary || []).map((d: any) => ({
      day: Number(d.day_number || d.day || 1),
      timing: d.timing,
      title: d.title || '',
      description: d.description || '',
      activities: d.activities || [],
      meals: d.meals
    }))
  }));

  const hasVariants = mappedVariants.length > 0;
  const activeVariant = hasVariants
    ? mappedVariants.find(v => v.id === activeVariantId) || mappedVariants[0]
    : null;

  const CAB_OPTIONS = [
    {
      id: 'sedan',
      name: 'AC Sedan (Swift Dzire / Toyota Etios)',
      minPax: 1,
      maxPax: 4,
      priceTotal: 0,
      icon: '🚙',
      badge: 'Included in Base Fare',
      description: 'Comfortable private sedan with AC for up to 4 travelers'
    },
    {
      id: 'suv_ertiga',
      name: 'AC SUV (Maruti Ertiga / Triber)',
      minPax: 1,
      maxPax: 6,
      priceTotal: 1800,
      icon: '🚘',
      badge: 'Spacious 6-Seater',
      description: 'Extra legroom and comfortable seating for up to 6 passengers'
    },
    {
      id: 'suv_innova',
      name: 'AC Premium SUV (Toyota Innova Crysta)',
      minPax: 1,
      maxPax: 6,
      priceTotal: 3200,
      icon: '🚐',
      badge: 'Recommended ⭐',
      description: 'Luxury captain seats, superior shock absorption, and luggage space'
    },
    {
      id: 'tempo',
      name: 'AC Luxury Tempo Traveller (12-Seater)',
      minPax: 7,
      maxPax: 12,
      priceTotal: 6500,
      icon: '🚌',
      badge: 'Group Special (7-12 Pax)',
      description: 'Exclusive luxury coach for large family & group journeys'
    }
  ];

  const isDhamPackage = Boolean(
    (effectivePkg.slug && (effectivePkg.slug.includes('dham') || effectivePkg.slug.includes('yatra') || effectivePkg.slug.includes('kedarnath') || effectivePkg.slug.includes('badrinath') || effectivePkg.slug.includes('gangotri') || effectivePkg.slug.includes('yamunotri'))) || 
    (effectivePkg.name && (effectivePkg.name.toLowerCase().includes('dham') || effectivePkg.name.toLowerCase().includes('yatra') || effectivePkg.name.toLowerCase().includes('kedarnath') || effectivePkg.name.toLowerCase().includes('badrinath'))) ||
    (effectivePkg.category && Array.isArray(effectivePkg.category) && effectivePkg.category.some((c: string) => c.toLowerCase().includes('yatra') || c.toLowerCase().includes('dham') || c.toLowerCase().includes('pilgrimage')))
  );

  const calculateAllocatedRooms = (pax: number) => {
    if (pax <= 3) return 1;
    if (pax <= 5) return 2;
    if (pax <= 7) return 3;
    if (pax <= 9) return 4;
    if (pax <= 11) return 5;
    return Math.ceil(pax / 2);
  };

  const activeAdults = isDhamPackage ? dhamAdultsCount : passengerCount;
  const activeRooms = isDhamPackage ? dhamRoomsCount : calculateAllocatedRooms(passengerCount);
  const avgPaxPerRoom = activeAdults / Math.max(1, activeRooms);
  
  let occupancyTypeTitle = "Double Sharing Stay";
  let occupancyTypeDesc = "2 Adults sharing 1 Deluxe Room with attached bathroom.";
  let occupancyPriceModifier = 0;

  if (activeAdults === 1 && activeRooms === 1) {
    occupancyTypeTitle = "Single Room Occupancy";
    occupancyTypeDesc = "Private single room for 1 adult. Includes single supplement fare.";
    occupancyPriceModifier = 3500;
  } else if (activeAdults === 3 && activeRooms === 1) {
    occupancyTypeTitle = "Triple Occupancy (1 Deluxe Room + 1 Extra Bed)";
    occupancyTypeDesc = "3 Adults sharing 1 Room with 1 Extra Rollaway Bed / Mattress in Dham Lodge.";
    occupancyPriceModifier = -1500; // Triple sharing rate discount!
  } else if (activeAdults === 3 && activeRooms === 2) {
    occupancyTypeTitle = "1 Double Room + 1 Private Single Room";
    occupancyTypeDesc = "2 Adults in 1 Double Room + 1 Adult in 1 Private Single Room.";
    occupancyPriceModifier = 1150; // Single supplement adjustment
  } else if (activeAdults === 4 && activeRooms === 1) {
    occupancyTypeTitle = "Quad Occupancy (1 Large Family Quad Room)";
    occupancyTypeDesc = "4 Adults sharing 1 Large Quad Family Suite with 2 Double Beds.";
    occupancyPriceModifier = -2800; // Quad sharing max discount!
  } else if (activeAdults === 4 && activeRooms === 2) {
    occupancyTypeTitle = "2 Double Sharing Rooms";
    occupancyTypeDesc = "Standard 2 Double Rooms (2 Adults per room) across all Dham destination hotels.";
    occupancyPriceModifier = 0; // Standard double fare!
  } else if (avgPaxPerRoom <= 1) {
    occupancyTypeTitle = `${activeRooms} Private Single Room${activeRooms > 1 ? 's' : ''}`;
    occupancyTypeDesc = `Separate private single room allocated per adult yatri.`;
    occupancyPriceModifier = 3500;
  } else if (avgPaxPerRoom > 1 && avgPaxPerRoom <= 2) {
    const extraMattressCount = activeAdults - (activeRooms * 2);
    occupancyTypeTitle = `${activeRooms} Double Sharing Room${activeRooms > 1 ? 's' : ''}${extraMattressCount > 0 ? ` + ${extraMattressCount} Extra Bed` : ''}`;
    occupancyTypeDesc = `Standard 2 Adults per room stay across all Dham destination hotels.`;
    occupancyPriceModifier = extraMattressCount > 0 ? -600 : 0;
  } else if (avgPaxPerRoom > 2 && avgPaxPerRoom <= 3) {
    occupancyTypeTitle = `Triple Sharing Stay (${activeRooms} Room${activeRooms > 1 ? 's' : ''} + Extra Beds)`;
    occupancyTypeDesc = `3 Adults per room sharing with extra mattresses in Dham lodges. Reduced rate!`;
    occupancyPriceModifier = -1500;
  } else if (avgPaxPerRoom > 3) {
    occupancyTypeTitle = `Quad Family Suite Stay (${activeRooms} Quad Room${activeRooms > 1 ? 's' : ''})`;
    occupancyTypeDesc = `4 Adults per room sharing large family quad suites. Maximum group savings!`;
    occupancyPriceModifier = -2800;
  }

  const MEAL_OPTIONS = [
    { id: 'cp', label: 'Breakfast Only (CP)', pricePerPax: 0, icon: '☕' },
    { id: 'map', label: 'Breakfast & Dinner (MAP)', pricePerPax: 1300, icon: '🍱' },
    { id: 'ap', label: 'All Meals (AP Plan)', pricePerPax: 2400, icon: '🍽️' },
    { id: 'ep', label: 'No Meals (Room Only)', pricePerPax: -600, icon: '🏨' }
  ];

  const currentMealOption = MEAL_OPTIONS.find(m => m.id === selectedMealPlan) || MEAL_OPTIONS[0];
  const mealPriceModifier = currentMealOption.pricePerPax;

  const selectedCab = CAB_OPTIONS.find(c => c.id === selectedCabId) || CAB_OPTIONS[0];
  const roomsRequired = activeRooms;
  const cabPerPersonSurcharge = Math.round(selectedCab.priceTotal / Math.max(1, passengerCount));
  const basePricePerPerson = activeVariant ? activeVariant.pricePerPerson : numericPrice;
  const finalPricePerPerson = Math.max(1000, basePricePerPerson + cabPerPersonSurcharge + (isDhamPackage ? occupancyPriceModifier : 0) + mealPriceModifier);
  const formattedFinalPrice = finalPricePerPerson.toLocaleString('en-IN');

  // Build JSON-LD Structured Data
  const jsonLd = buildTouristTripJsonLd({
    name: packageDetails.title,
    description: seoDesc,
    image: packageDetails.image,
    url: canonicalUrl,
    offer: {
      priceCurrency: 'INR',
      includes: 'Hotels, Breakfast, Transfers, Sightseeing',
      price: String(activeVariant ? activeVariant.pricePerPerson : numericPrice),
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0],
      validThrough: '2026-12-31',
      priceValidUntil: '2026-12-31',
      eligibleQuantity: { value: 20, unitCode: 'C62' },
      acceptedPaymentMethod: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI']
    },
    providerName: 'Ghumo Firoo Travels',
    duration: `P${packageDetails.itinerary.length || 5}D`,
    aggregateRating: {
      ratingValue: packageDetails.rating,
      reviewCount: packageDetails.reviews
    },
    itinerary: packageDetails.itinerary.map((item: any) => ({
      position: item.day,
      name: item.title,
      description: item.activities ? item.activities.join('. ') : item.description
    })),
    destination: {
      name: packageDetails.destinations[0] || 'Destination',
      address: packageDetails.destinations.join(', '),
      geo: mapLocations[0] ? {
        latitude: String(mapLocations[0].coordinates?.[0] || '0'),
        longitude: String(mapLocations[0].coordinates?.[1] || '0')
      } : undefined,
      transportation: 'Private AC Vehicle'
    }
  });

  const heroHighlights = packageDetails.highlights && packageDetails.highlights.length > 0
    ? packageDetails.highlights
    : (effectivePkg.attractions ? effectivePkg.attractions.map((a: any) => a.name) : []);

  const imagesForSeo = [packageDetails.image].filter(Boolean);
  const breadcrumbs = [
    { name: 'Home', item: `${baseUrl}/` },
    { name: 'Packages', item: `${baseUrl}/packages` },
    { name: packageDetails.title, item: canonicalUrl },
  ];

  return (
    <Layout>
      <PackageSEO
        title={effectivePkg.seo_title || `${packageDetails.title} | Ghumo Firoo Travels`}
        description={seoDesc}
        keywords={effectivePkg.seo_keywords}
        canonical={canonicalUrl}
        images={imagesForSeo}
        price={activeVariant ? activeVariant.pricePerPerson : numericPrice}
        rating={packageDetails.rating}
        reviews={packageDetails.reviews}
        breadcrumbs={breadcrumbs}
        faqs={faqs}
        structuredData={jsonLd}
        skipProductSchema={true}
      />
      
      <ModernPackageHero
        title={packageDetails.title}
        duration={activeVariant ? `${activeVariant.nights} Nights / ${activeVariant.days} Days` : packageDetails.duration}
        price={`Starting from ₹${activeVariant ? activeVariant.pricePerPerson.toLocaleString('en-IN') : packageDetails.price}*`}
        rating={packageDetails.rating}
        reviews={packageDetails.reviews}
        images={imagesSlider}
        destinations={packageDetails.destinations}
        packageType={packageType}
        highlights={heroHighlights}
        bestTime={bestTime}
        groupSize={groupSize}
        difficulty={difficulty}
        virtualTourData={virtualTourData}
        mapLocations={mapLocations}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans pb-24">
        {/* Package Variant Selector Bar if variants exist */}
        {hasVariants && (
          <PackageVariantSelector
            variants={mappedVariants}
            activeId={activeVariantId || mappedVariants[0].id}
            onChange={setActiveVariantId}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Country / Destination Overview Card */}
              {(effectivePkg.capital || effectivePkg.currency || effectivePkg.visa_type) && (
                <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                    <h2 className="font-serif font-bold text-white text-xl">
                      🌍 Destination Quick Facts
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {effectivePkg.capital && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Capital</span>
                        <span className="text-sm font-bold text-[#E5C378]">{effectivePkg.capital}</span>
                      </div>
                    )}
                    {effectivePkg.currency && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Currency</span>
                        <span className="text-sm font-bold text-[#E5C378]">{effectivePkg.currency}</span>
                      </div>
                    )}
                    {effectivePkg.visa_type && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Visa Type</span>
                        <span className="text-sm font-bold text-[#E5C378]">{effectivePkg.visa_type}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specialized Yatra Pilgrimage Room & Bedding Configurator (Dham Packages Only) */}
              {isDhamPackage && (
                <div className="bg-[#0B1226] border border-[#C9A25A]/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                          ✦ Pilgrimage Room & Bedding Customizer
                        </div>
                        <h2 className="font-serif font-bold text-white text-xl md:text-2xl">
                          Select Adults & Required Rooms
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#C9A25A]/20 text-[#E5C378] border border-[#C9A25A]/40 font-bold text-xs uppercase px-3 py-1">
                        🏔️ Dham Lodge Occupancy Calculator
                      </Badge>
                    </div>
                  </div>

                  {/* Adults, Rooms, & Meal Plan Interactive Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    {/* Adults Counter */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#C9A25A]" /> Total Adults (Pax)
                        </span>
                        <span className="text-xs font-bold text-[#E5C378]">
                          {dhamAdultsCount} Adult{dhamAdultsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-2 rounded-lg justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const newAdults = Math.max(1, dhamAdultsCount - 1);
                            setDhamAdultsCount(newAdults);
                            setPassengerCount(newAdults);
                            if (newAdults === 3) setDhamRoomsCount(1);
                            else setDhamRoomsCount(Math.ceil(newAdults / 2));
                          }}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-base hover:bg-[#C9A25A] hover:text-slate-950 flex items-center justify-center transition-colors disabled:opacity-30"
                          disabled={dhamAdultsCount <= 1}
                        >
                          -
                        </button>
                        <span className="text-sm font-extrabold text-amber-400 font-mono">
                          {dhamAdultsCount} Adult{dhamAdultsCount > 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newAdults = Math.min(20, dhamAdultsCount + 1);
                            setDhamAdultsCount(newAdults);
                            setPassengerCount(newAdults);
                            if (newAdults === 3) setDhamRoomsCount(1);
                            else setDhamRoomsCount(Math.ceil(newAdults / 2));
                          }}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-base hover:bg-[#C9A25A] hover:text-slate-950 flex items-center justify-center transition-colors disabled:opacity-30"
                          disabled={dhamAdultsCount >= 20}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rooms Counter */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Hotel className="w-4 h-4 text-sky-400" /> Rooms Required
                        </span>
                        <span className="text-xs font-bold text-sky-300">
                          {dhamRoomsCount} Room{dhamRoomsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-2 rounded-lg justify-between">
                        <button
                          type="button"
                          onClick={() => setDhamRoomsCount(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-base hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
                          disabled={dhamRoomsCount <= 1}
                        >
                          -
                        </button>
                        <span className="text-sm font-extrabold text-sky-400 font-mono">
                          {dhamRoomsCount} Room{dhamRoomsCount > 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDhamRoomsCount(prev => Math.min(dhamAdultsCount, prev + 1))}
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-base hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
                          disabled={dhamRoomsCount >= dhamAdultsCount}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Meal Plan Selector Dropdown */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Utensils className="w-4 h-4 text-emerald-400" /> Meal Plan
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {currentMealOption.label.split('(')[0]}
                        </span>
                      </div>
                      <Select value={selectedMealPlan} onValueChange={setSelectedMealPlan}>
                        <SelectTrigger className="h-9.5 text-xs bg-slate-950/90 border-slate-800 text-emerald-400 font-bold focus:ring-[#C9A25A]">
                          <SelectValue placeholder="Select Meal Plan" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1226] border-slate-700 text-white shadow-2xl z-50">
                          <SelectItem value="cp">☕ Breakfast Only (CP Plan - Default)</SelectItem>
                          <SelectItem value="map">🍱 Breakfast & Dinner (MAP Plan)</SelectItem>
                          <SelectItem value="ap">🍽️ All Meals (Breakfast, Lunch & Dinner - AP)</SelectItem>
                          <SelectItem value="ep">🏨 Room Only / No Meals (EP Plan)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Calculated Sharing Banner */}
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-[#C9A25A]/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-extrabold text-amber-400 flex items-center gap-2">
                        <span>🛏️</span> {occupancyTypeTitle}
                      </div>
                      <div className="text-slate-300 text-[11px] leading-relaxed">
                        {occupancyTypeDesc}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Private Cab & Vehicle Customizer Card */}
              <div className="bg-[#0B1226] border border-[#C9A25A]/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                        ✦ Private Transport Customizer
                      </div>
                      <h2 className="font-serif font-bold text-white text-xl md:text-2xl">
                        Select Private Vehicle / Cab Type
                      </h2>
                    </div>
                  </div>

                  {/* Traveler Badge for Dham Packages vs Counter for General Packages */}
                  {isDhamPackage ? (
                    <Badge className="bg-[#C9A25A]/15 border border-[#C9A25A]/40 text-[#E5C378] font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#C9A25A]" />
                      <span>{passengerCount} Adult{passengerCount > 1 ? 's' : ''} Selected Above</span>
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-3 bg-white/5 border border-[#C9A25A]/30 px-4 py-2 rounded-xl">
                      <span className="text-xs text-slate-300 font-medium">Travelers:</span>
                      <button 
                        onClick={() => setPassengerCount(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#C9A25A]/20 text-white font-bold text-sm flex items-center justify-center transition-colors disabled:opacity-30"
                        disabled={passengerCount <= 1}
                      >
                        -
                      </button>
                      <span className="text-sm font-extrabold text-[#E5C378] px-2 min-w-[28px] text-center">
                        {passengerCount} Pax
                      </span>
                      <button 
                        onClick={() => setPassengerCount(prev => Math.min(12, prev + 1))}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-[#C9A25A]/20 text-white font-bold text-sm flex items-center justify-center transition-colors disabled:opacity-30"
                        disabled={passengerCount >= 12}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* Luggage Alert Banner for 4 Adults when Sedan is selected */}
                {passengerCount === 4 && selectedCabId === 'sedan' && (
                  <div className="mb-6 p-4 bg-[#C9A25A]/10 border border-[#C9A25A]/40 rounded-xl flex items-start gap-3 text-xs text-[#E5C378] animate-fade-in shadow-md">
                    <span className="text-xl flex-shrink-0">🧳</span>
                    <div>
                      <strong className="font-bold text-white block mb-0.5 text-xs">Luggage Capacity Notice:</strong>
                      4 adults travelling with heavy suitcases might find Sedan boot space tight. We recommend upgrading to <strong>AC SUV (Maruti Ertiga / Triber)</strong> or <strong>AC Premium SUV (Toyota Innova Crysta)</strong> for additional comfort and luggage space.
                    </div>
                  </div>
                )}

                {/* Group Size Notice for 5+ Pax */}
                {passengerCount >= 5 && (
                  <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3 text-xs text-blue-300">
                    <span className="text-base">ℹ️</span>
                    <span>For <strong>{passengerCount} travelers</strong>, 4-seater sedans are excluded to guarantee passenger and luggage capacity.</span>
                  </div>
                )}

                {/* Cab Options Grid Filtered Dynamically by Passenger Count */}
                {(() => {
                  let visibleCabs = CAB_OPTIONS;

                  if (passengerCount >= 1 && passengerCount <= 4) {
                    // For 1–4 adults: Sedan, AC SUV (Ertiga), AC Premium SUV (Innova)
                    visibleCabs = CAB_OPTIONS.filter(c => c.id !== 'tempo');
                  } else if (passengerCount === 5) {
                    // For 5 adults: Exclude Sedan. Show AC SUV (Ertiga) & AC Premium SUV (Innova)
                    visibleCabs = CAB_OPTIONS.filter(c => c.id === 'suv_ertiga' || c.id === 'suv_innova');
                  } else if (passengerCount === 6) {
                    // For 6 adults: 6-seater SUVs (Ertiga & Innova) + Tempo Traveller
                    visibleCabs = CAB_OPTIONS.filter(c => c.id !== 'sedan');
                  } else if (passengerCount >= 7) {
                    // For 7+ adults: Luxury Tempo Traveller
                    visibleCabs = CAB_OPTIONS.filter(c => c.id === 'tempo');
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visibleCabs.map((cab) => {
                        const isDisabled = passengerCount > cab.maxPax;
                        const isSelected = selectedCabId === cab.id;
                        const perPersonExtra = Math.round(cab.priceTotal / Math.max(1, passengerCount));

                        return (
                          <div
                            key={cab.id}
                            onClick={() => !isDisabled && setSelectedCabId(cab.id)}
                            className={`p-4 rounded-xl border transition-all duration-200 relative ${
                              isDisabled 
                                ? 'opacity-40 bg-white/5 border-white/5 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#C9A25A]/15 border-[#C9A25A] shadow-[0_0_20px_rgba(201,162,90,0.15)] cursor-pointer'
                                : 'bg-white/5 border-white/10 hover:border-[#C9A25A]/40 hover:bg-white/10 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{cab.icon}</span>
                                <div>
                                  <h3 className="text-sm font-bold text-white leading-tight">{cab.name}</h3>
                                  <span className="text-[10px] text-slate-400 font-medium">Max {cab.maxPax} Pax • Private Vehicle</span>
                                </div>
                              </div>
                              
                              {/* Clean Feature Badge */}
                              <div className="text-right flex-shrink-0">
                                {cab.id === 'sedan' ? (
                                  <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 uppercase tracking-wider">
                                    INCLUDED
                                  </span>
                                ) : cab.id === 'suv_ertiga' ? (
                                  <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 uppercase tracking-wider">
                                    SPACIOUS 6-SEATER
                                  </span>
                                ) : cab.id === 'suv_innova' ? (
                                  <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-wider">
                                    RECOMMENDED ⭐
                                  </span>
                                ) : (
                                  <span className="inline-block text-[10px] font-extrabold px-2.5 py-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 uppercase tracking-wider">
                                    GROUP SPECIAL
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-300 font-light leading-relaxed mb-2">{cab.description}</p>

                            {/* Status Label */}
                            {isDisabled ? (
                              <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                                ✕ Exceeds vehicle capacity (Max {cab.maxPax} Pax)
                              </span>
                            ) : isSelected ? (
                              <span className="text-[10px] font-bold text-[#C9A25A] flex items-center gap-1">
                                ✓ Selected Vehicle for {passengerCount} Travelers
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                Click to select vehicle
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Dynamic Cost & Room Occupancy Breakdown Summary Box */}
                <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Room Occupancy Calculation */}
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Hotel className="w-3.5 h-3.5 text-[#C9A25A]" /> Room Occupancy
                    </div>
                    <div className="text-sm font-extrabold text-[#E5C378]">
                      {roomsRequired} Room{roomsRequired > 1 ? 's' : ''} Allocated
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">
                      {passengerCount === 1 
                        ? '1 Single / Double Occupancy Room'
                        : passengerCount % 2 !== 0 
                          ? `${Math.floor(passengerCount / 2)} Double + 1 Extra Bed` 
                          : `${roomsRequired} Double Sharing Room${roomsRequired > 1 ? 's' : ''}`}
                    </div>
                  </div>

                  {/* Cab Selection Summary */}
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-sky-400" /> Private Transport
                    </div>
                    <div className="text-sm font-extrabold text-sky-300 truncate">
                      {selectedCab.name.split('(')[0]}
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">
                      Chauffeured Private Vehicle
                    </div>
                  </div>

                  {/* Live Total Cost Calculation */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-[#C9A25A]/40 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-[#C9A25A] uppercase tracking-wider flex items-center gap-1.5">
                      <span>💰</span> Total Package Payable
                    </div>
                    <div className="text-base font-extrabold text-amber-400">
                      ₹{(finalPricePerPerson * passengerCount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      (₹{finalPricePerPerson.toLocaleString('en-IN')}/pax × {passengerCount} Travelers)
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Variant Component view */}
              {hasVariants && activeVariant ? (
                <VariantDetails variant={activeVariant} />
              ) : (
                <>
                  {/* Highlights Card */}
                  {packageDetails.highlights.length > 0 && (
                    <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                            ✦ Signature Highlights
                          </div>
                          <h2 className="font-serif font-bold text-white text-2xl">
                            Package Highlights
                          </h2>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {packageDetails.highlights.map((highlight: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/10 rounded-xl hover:border-[#C9A25A]/40 transition-colors">
                            <div className="w-5 h-5 bg-[#C9A25A]/20 border border-[#C9A25A]/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[#C9A25A] text-xs font-bold">
                              ✓
                            </div>
                            <span className="text-xs font-medium text-slate-200 leading-relaxed">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Itinerary Timeline */}
                  {packageDetails.itinerary.length > 0 && (
                    <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                            ✦ Day-by-Day Timeline
                          </div>
                          <h2 className="font-serif font-bold text-white text-2xl">
                            Detailed Itinerary
                          </h2>
                        </div>
                      </div>
                      <PremiumTimeline itinerary={packageDetails.itinerary} />
                    </div>
                  )}

                  {/* Selected Stays Section */}
                  {((activeVariant?.hotels && activeVariant.hotels.length > 0) || (effectivePkg.hotels && effectivePkg.hotels.length > 0)) && (
                    <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                            ✦ Accommodation
                          </div>
                          <h2 className="font-serif font-bold text-white text-2xl">
                            Selected Hotels & Stays
                          </h2>
                        </div>
                      </div>
                      <HotelList hotels={((activeVariant?.hotels && activeVariant.hotels.length > 0) ? activeVariant.hotels : effectivePkg.hotels).map((h: any) => {
                        const hName = typeof h === 'string' 
                          ? h 
                          : (h.name || h.hotel_name || h.hotelName || h.title || h.hotel || h.label || 'Premium Hotel / Resort');
                        const hLoc = typeof h === 'object' ? (h.location || h.city || h.destinationTag || h.destination || 'Kutch, Gujarat') : 'Kutch, Gujarat';
                        const hImg = (typeof h === 'object' && h.image) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600';
                        const hStars = Number(typeof h === 'object' ? (h.starRating || h.star_category || h.stars || h.star_rating) : 4) || 4;
                        const hAmens = typeof h === 'object' ? [h.room_type, h.category, h.meal_plan, h.highlight].filter(Boolean) : [];
                        const hPrice = (typeof h === 'object' && (h.priceFrom || h.price_from || h.selling_price)) 
                          ? (typeof (h.priceFrom || h.price_from || h.selling_price) === 'number' ? `₹${Number(h.priceFrom || h.price_from || h.selling_price).toLocaleString('en-IN')}` : String(h.priceFrom || h.price_from || h.selling_price))
                          : undefined;

                        return {
                          name: hName,
                          image: hImg,
                          starRating: hStars,
                          location: hLoc,
                          destinationTag: hLoc,
                          amenities: hAmens,
                          priceFrom: hPrice
                        };
                      })} />
                    </div>
                  )}

                  {/* Inclusions & Exclusions */}
                  {(packageDetails.inclusions.length > 0 || packageDetails.exclusions.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {packageDetails.inclusions.length > 0 && (
                        <div className="bg-[#0B1026] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-1.5 h-5 bg-[#C9A25A] rounded-full" />
                            <h2 className="font-serif font-bold text-white text-lg tracking-tight">
                              What's Included
                            </h2>
                          </div>
                          <ul className="space-y-3">
                            {packageDetails.inclusions.map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="text-[#34d399] font-bold text-sm flex-shrink-0 mt-0.5">✓</span>
                                <span className="text-slate-300 text-xs leading-relaxed font-light">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {packageDetails.exclusions.length > 0 && (
                        <div className="bg-[#0B1026] border border-white/10 rounded-2xl p-6 shadow-xl">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-1.5 h-5 bg-rose-400 rounded-full" />
                            <h2 className="font-serif font-bold text-white text-lg tracking-tight">
                              Not Included
                            </h2>
                          </div>
                          <ul className="space-y-3">
                            {packageDetails.exclusions.map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="text-rose-400 font-bold text-sm flex-shrink-0 mt-0.5">✕</span>
                                <span className="text-slate-400 text-xs leading-relaxed font-light">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Attractions / Highlights Section */}
              {effectivePkg.attractions && effectivePkg.attractions.length > 0 && (
                <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                        ✦ Signature Experiences
                      </div>
                      <h2 className="font-serif font-bold text-white text-2xl">
                        Top Attractions & Highlights
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {effectivePkg.attractions.map((att: any, index: number) => (
                      <AttractionCard 
                        key={index} 
                        title={att.name}
                        description={att.description}
                        image={att.image}
                        destinationTag={att.destinationTag || att.location || att.destination}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="bg-[#0B1026] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                  <h2 className="font-serif font-bold text-white text-lg tracking-tight">
                    Booking & Cancellation Policy
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="text-[#C9A25A] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                      Payment Schedule
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'At booking', value: '25% advance' },
                        { label: '30 days before travel', value: '50% total' },
                        { label: '15 days before travel', value: '100% cleared' },
                        { label: 'Subject to', value: 'Availability' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                          <span className="text-slate-400 text-xs">{row.label}</span>
                          <span className="text-white text-xs font-semibold">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#C9A25A] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                      Cancellation Charges
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Cancel 30+ days before', value: '25%', color: '#34d399' },
                        { label: 'Cancel 15–30 days before', value: '50%', color: '#fbbf24' },
                        { label: 'Cancel 0–15 days before', value: '100%', color: '#f87171' },
                        { label: 'No-show / early checkout', value: 'No refund', color: '#f87171' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                          <span className="text-slate-400 text-xs">{row.label}</span>
                          <span className="text-xs font-bold" style={{ color: row.color }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Routes Section */}
              {flightRoutes.length > 0 && (
                <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl overflow-hidden shadow-xl">
                  <FlightRouteMap 
                    isInternational={packageType === 'international'}
                    destination={packageDetails.destinations[0] || 'Destination'}
                    routes={flightRoutes}
                  />
                </div>
              )}

              {/* Route Map Section */}
              {mapLocations.length > 0 && (
                <div className="bg-[#0B1226] border border-[#C9A25A]/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#C9A25A] rounded-full" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-0.5">
                        ✦ Your Journey
                      </div>
                      <h2 className="font-serif font-bold text-white text-2xl">
                        Tour Route Map
                      </h2>
                    </div>
                  </div>
                  <EnhancedRouteMap locations={mapLocations} />
                </div>
              )}

              {/* FAQ Section */}
              {faqs.length > 0 && (
                <FAQSection 
                  faqs={faqs} 
                  title={`${packageDetails.destinations[0] || 'Destination'} Travel FAQs`}
                  subtitle="Get answers to common questions about planning your vacation."
                  className="py-8 bg-transparent"
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-[88px] space-y-6">
                <PackageSidebar 
                  packageDetails={{
                    title: packageDetails.title,
                    duration: activeVariant ? `${activeVariant.nights}N/${activeVariant.days}D` : packageDetails.duration,
                    price: formattedFinalPrice,
                    rating: packageDetails.rating,
                    reviews: packageDetails.reviews,
                    image: packageDetails.image,
                    destinations: packageDetails.destinations,
                    highlights: packageDetails.highlights,
                    itinerary: (activeVariant?.itinerary && activeVariant.itinerary.length > 0) ? activeVariant.itinerary : packageDetails.itinerary,
                    inclusions: (activeVariant?.inclusions && activeVariant.inclusions.length > 0) ? activeVariant.inclusions : packageDetails.inclusions,
                    exclusions: (activeVariant?.exclusions && activeVariant.exclusions.length > 0) ? activeVariant.exclusions : packageDetails.exclusions,
                    hotels: (activeVariant?.hotels && activeVariant.hotels.length > 0) ? activeVariant.hotels : (effectivePkg.hotels || []),
                    attractions: effectivePkg.attractions || []
                  } as any}
                  packageType={packageType}
                  destination={packageDetails.destinations[0] || ""}
                  quickFacts={quickFacts}
                />
              </div>
            </div>
        </div>
      </div>
    </div>
      <StickyCTA 
        packageName={packageDetails.title}
        priceText={`₹${formattedFinalPrice}`}
        kicker="Now Viewing"
      />
    </Layout>
  );
};

export default DynamicPackageDetail;
