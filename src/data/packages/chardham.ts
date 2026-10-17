// src/data/packages/chardham.ts
// Canonical Data Model for Char Dham Yatra and related Himalayan Shrines

export interface CharDhamItineraryDay {
  day: string;
  title: string;
  desc: string;
}

export interface CharDhamPackageItem {
  id: string;
  title: string;
  desc: string;
  badge: string;
  image: string;
  price: number;
  duration: string;
  rating: number;
  reviewsCount: number;
  stay: string;
  vehicle: string;
  link: string;
  highlights: string[];
  itinerary: CharDhamItineraryDay[];
  inclusions: string[];
  exclusions: string[];
}

export const CHAR_DHAM_PACKAGES: CharDhamPackageItem[] = [
  {
    id: "chardham-10d-9n",
    title: "Char Dham Yatra Deluxe Road Tour (10D/9N)",
    desc: "Complete 4 Dham pilgrimage from Haridwar/Dehradun covering Yamunotri, Gangotri, Kedarnath & Badrinath with VIP Darshan passes.",
    badge: "Best Seller",
    image: "/Badrinath.png",
    price: 26500,
    duration: "10 Days / 9 Nights",
    rating: 4.95,
    reviewsCount: 1240,
    stay: "Haridwar/Barkot/Guptkashi/Kedarnath/Badrinath 3-Star Hotels (9N)",
    vehicle: "Chauffeured Private AC Tempo Traveller / SUV",
    link: "/packages/char-dham-yatra-10d-9n",
    highlights: ["All 4 Dhams VIP Darshan", "Kedarnath Night Stay", "Mana First Indian Village", "Tapt Kund Hot Spring"],
    itinerary: [
      { day: "Day 1", title: "Haridwar / Dehradun Pickup → Drive to Barkot", desc: "Private pickup from Haridwar / Dehradun station or airport. Drive via Mussoorie to Barkot. Hotel check-in." },
      { day: "Day 2", title: "Barkot to Yamunotri Dham Trek & Return", desc: "Drive to Janki Chatti, 6km trek to Yamunotri Temple, dip in Surya Kund thermal spring, Darshan, and return to Barkot." },
      { day: "Day 3", title: "Barkot to Uttarkashi → Vishwanath Temple", desc: "Drive along Bhagirathi river to Uttarkashi. Visit historic Kashi Vishwanath Temple & Shakti Trishul." },
      { day: "Day 4", title: "Uttarkashi to Gangotri Dham & Harsil Valley", desc: "Scenic drive through Harsil apple valley to Gangotri. Holy dip in Bhagirathi river and Gangotri Aarti." },
      { day: "Day 5", title: "Uttarkashi to Guptkashi / Phata", desc: "Drive along Mandakini valley to Guptkashi. Verification of biometric Yatra permit & heli token registration." },
      { day: "Day 6", title: "Guptkashi to Kedarnath Shrine → Evening Aarti", desc: "Trek or heli shuttle from Phata/Sersi to Kedarnath. VIP Darshan, evening Shiv Aarti & overnight stay near temple." },
      { day: "Day 7", title: "Kedarnath Morning Puja → Trek Down to Guptkashi", desc: "Early morning Abhishekam Puja at Kedarnath temple, trek down to Gaurikund and drive to Guptkashi." },
      { day: "Day 8", title: "Guptkashi to Badrinath Dham via Joshimath", desc: "Drive along Alaknanda river to Badrinath. Dip in Tapt Kund thermal spring & evening Badrivishal Aarti." },
      { day: "Day 9", title: "Badrinath Morning Darshan → Mana Village, Bheem Pul & Vasudhara → Rudraprayag", desc: "Morning Darshan, visit Mana (First Indian Village), Vyas Gufa, Bheem Pul, Saraswati River origin, Vasudhara Falls view, and drive to Rudraprayag." },
      { day: "Day 10", title: "Rudraprayag to Haridwar / Rishikesh Drop-off via Devprayag", desc: "Breakfast, visit Devprayag confluence of Alaknanda & Bhagirathi, and drop-off at Haridwar station/airport." }
    ],
    inclusions: ["9 Nights Hotel Stay (including Kedarnath Lodge)", "Biometric Yatra Registration & VIP Passes", "Daily Pure Veg Breakfast & Dinner", "Chauffeured Private AC Vehicle"],
    exclusions: ["Helicopter tickets, Pony / Palki charges"]
  },
  {
    id: "chardham-heli-5d-4n",
    title: "Char Dham VVIP Helicopter Charter (5D/4N)",
    desc: "Ultimate luxury 5-day heli-tour flying from Dehradun Sahastradhara helipad. Includes VIP priority Darshan at all 4 shrines & luxury stays.",
    badge: "VVIP Heli Tour",
    image: "/Kedarnath.png",
    price: 195000,
    duration: "5 Days / 4 Nights",
    rating: 4.99,
    reviewsCount: 410,
    stay: "Dehradun / Kharsali / Harsil / Guptkashi / Badrinath 5-Star Resorts (4N)",
    vehicle: "Private Charter Helicopter (Airbus H125)",
    link: "/packages/char-dham-helicopter-5d-4n",
    highlights: ["Same-Day Heli Shuttles", "VVIP Priority Queue Escort", "Harsil Luxury Apple Resort", "Mana Village Helicopter Tour"],
    itinerary: [
      { day: "Day 1", title: "Dehradun Helipad Pickup → Flight to Yamunotri (Kharsali)", desc: "VIP reception at Sahastradhara helipad. 30-minute flight to Kharsali. Palki escort to Yamunotri temple." },
      { day: "Day 2", title: "Kharsali to Gangotri (Jhalla/Harsil)", desc: "Fly to Harsil helipad. Sedan drive to Gangotri Temple for VIP Aarti & stay at luxury apple orchard resort." },
      { day: "Day 3", title: "Harsil to Kedarnath (Sersi/Guptkashi)", desc: "Helicopter flight to Sersi helipad and shuttle to Kedarnath temple VIP helipad. Special Puja & luxury stay." },
      { day: "Day 4", title: "Sersi to Badrinath Dham Flight", desc: "Morning heli flight to Badrinath helipad. Special VVIP entry pass to Badrinath Temple & Mana excursion." },
      { day: "Day 5", title: "Badrinath to Dehradun Sahastradhara Helipad", desc: "Return helicopter flight to Dehradun with aerial Himalayan views & private transfer to Dehradun Airport." }
    ],
    inclusions: ["All 4 Dhams Helicopter Charter Flight Tickets", "4 Nights 5-Star Luxury Resort Accommodations", "VVIP Temple Entry Escorts & Palki Charges", "All Meals (Pure Veg Gourmet)", "Dehradun Airport VIP Transfers"],
    exclusions: ["Personal Puja offerings"]
  },
  {
    id: "chardham-from-delhi",
    title: "Char Dham Yatra Circuit from Delhi (12D/11N)",
    desc: "Comprehensive 12-day road pilgrimage starting and ending at Delhi NCR. Covers all 4 Dhams, Rishikesh Ganga Aarti & Devprayag.",
    badge: "Delhi Departure",
    image: "/Badrinath.png",
    price: 32500,
    duration: "12 Days / 11 Nights",
    rating: 4.93,
    reviewsCount: 860,
    stay: "Haridwar/Barkot/Uttarkashi/Guptkashi/Badrinath 3-Star Hotels (11N)",
    vehicle: "Private AC Vehicle / Bus from Delhi",
    link: "/packages/char-dham-yatra-from-delhi",
    highlights: ["Delhi Airport/Station Pickup", "All 4 Dhams Guided Circuit", "Rishikesh Triveni Ghat Aarti", "Devprayag Confluence"],
    itinerary: [
      { day: "Day 1", title: "Delhi Airport / Station Pickup → Drive to Haridwar", desc: "Pickup at Delhi NCR. Drive to Haridwar, hotel check-in & evening Har Ki Pauri Ganga Aarti." },
      { day: "Day 2", title: "Haridwar to Barkot via Mussoorie", desc: "Drive via Mussoorie Kempty Falls to Barkot base camp." },
      { day: "Day 3", title: "Barkot to Yamunotri Dham Trek", desc: "Trek to Yamunotri Temple, Surya Kund bath & return to Barkot." },
      { day: "Day 4", title: "Barkot to Uttarkashi Kashi Vishwanath", desc: "Drive along Bhagirathi river to Uttarkashi. Visit Vishwanath Temple." },
      { day: "Day 5", title: "Uttarkashi to Gangotri Dham & Harsil", desc: "Drive through Harsil apple orchards to Gangotri shrine." },
      { day: "Day 6", title: "Uttarkashi to Guptkashi Base Camp", desc: "Drive across mountain passes to Mandakini valley." },
      { day: "Day 7", title: "Guptkashi to Kedarnath Temple Trek", desc: "Trek or heli shuttle to Kedarnath temple for evening Shiv Aarti." },
      { day: "Day 8", title: "Kedarnath Puja → Descent to Guptkashi", desc: "Morning Puja, trek down to Gaurikund and drive to Guptkashi." },
      { day: "Day 9", title: "Guptkashi to Badrinath Dham", desc: "Drive to Badrinath, Tapt Kund bath & evening Aarti." },
      { day: "Day 10", title: "Badrinath → Mana Village & Bheem Pul → Rudraprayag", desc: "Morning Darshan, visit Mana, Bheem Pul, Saraswati river & drive to Rudraprayag." },
      { day: "Day 11", title: "Rudraprayag to Rishikesh / Haridwar", desc: "Drive via Devprayag confluence to Rishikesh Triveni Ghat." },
      { day: "Day 12", title: "Haridwar to Delhi Drop-off", desc: "Breakfast and comfortable return drive to Delhi airport/station." }
    ],
    inclusions: ["11 Nights Hotel Accommodations", "Delhi NCR Roundtrip AC Vehicle", "Biometric Yatra Registration & VIP Passes", "Daily Pure Veg Breakfast & Dinner"],
    exclusions: ["Personal expenses, Pony / Palki charges"]
  },
  {
    id: "dodham-kedar-badri",
    title: "Do Dham Kedarnath & Badrinath Yatra (6D/5N)",
    desc: "Our most sought-after double shrine package visiting Lord Shiva's Kedarnath Jyotirlinga and Lord Vishnu's Badrinath Dham.",
    badge: "Do Dham Best Seller",
    image: "/Kedarnath.png",
    price: 22000,
    duration: "6 Days / 5 Nights",
    rating: 4.96,
    reviewsCount: 1120,
    stay: "Guptkashi/Kedarnath/Badrinath Deluxe Hotels (5N)",
    vehicle: "Chauffeured Private AC Vehicle",
    link: "/packages/do-dham-yatra",
    highlights: ["Kedarnath Jyotirlinga", "Badrinath Badrivishal Shrine", "Tapt Kund Hot Spring", "Mana First Indian Village"],
    itinerary: [
      { day: "Day 1", title: "Haridwar Pickup → Drive to Guptkashi via Devprayag", desc: "Drive along Alaknanda and Mandakini river confluences to Guptkashi." },
      { day: "Day 2", title: "Guptkashi to Gaurikund → Trek / Heli to Kedarnath", desc: "Trek 16 km or take heli shuttle to Kedarnath. Evening Aarti & night stay near temple." },
      { day: "Day 3", title: "Kedarnath Morning Puja → Trek Down to Guptkashi", desc: "Morning Darshan, descent trek to Gaurikund & return to Guptkashi." },
      { day: "Day 4", title: "Guptkashi to Badrinath Dham via Joshimath", desc: "Drive to Badrinath, thermal bath at Tapt Kund & evening Badrivishal Aarti." },
      { day: "Day 5", title: "Badrinath Morning Darshan → Mana Village → Rudraprayag", desc: "Morning Darshan, visit Mana village, Vyas Gufa, Bheem Pul & drive to Rudraprayag." },
      { day: "Day 6", title: "Rudraprayag to Haridwar / Dehradun Drop-off", desc: "Scenic return drive to Haridwar / Dehradun for departure." }
    ],
    inclusions: ["5 Nights Accommodation (including Kedarnath Lodge)", "Private AC Car Transfers", "VIP Queue Passes & Permits", "Daily Pure Veg Meals"],
    exclusions: ["Helicopter shuttle / Pony charges"]
  },
  {
    id: "dodham-gangotri-yamunotri",
    title: "Do Dham Gangotri & Yamunotri Yatra (5D/4N)",
    desc: "Sacred river origin circuit visiting the holy source shrines of Goddess Ganga and Goddess Yamuna in upper Garhwal.",
    badge: "River Origin Special",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
    price: 18500,
    duration: "5 Days / 4 Nights",
    rating: 4.89,
    reviewsCount: 540,
    stay: "Barkot (2N) + Uttarkashi / Harsil (2N)",
    vehicle: "Chauffeured Private AC Vehicle",
    link: "/packages/do-dham-yatra",
    highlights: ["Yamunotri Surya Kund", "Gangotri Temple Aarti", "Harsil Apple Valley", "Uttarkashi Vishwanath Temple"],
    itinerary: [
      { day: "Day 1", title: "Haridwar Pickup → Drive to Barkot via Mussoorie", desc: "Drive via Mussoorie Kempty Falls to Barkot base camp." },
      { day: "Day 2", title: "Barkot → Janki Chatti → Yamunotri Trek & Return", desc: "Trek to Yamunotri Temple, cook Prasad at Surya Kund & return to Barkot." },
      { day: "Day 3", title: "Barkot to Uttarkashi → Vishwanath Temple", desc: "Drive along Bhagirathi river to Uttarkashi and pray at Vishwanath Temple." },
      { day: "Day 4", title: "Uttarkashi to Gangotri Shrine & Harsil Valley", desc: "Drive through Harsil apple orchards to Gangotri, dip in Bhagirathi river & Aarti." },
      { day: "Day 5", title: "Uttarkashi to Haridwar / Rishikesh Drop-off", desc: "Breakfast and scenic return drive to Haridwar." }
    ],
    inclusions: ["4 Nights Hotel Stay with Breakfast & Dinner", "Private AC Vehicle", "Yatra Permits & VIP Passes"],
    exclusions: ["Pony / Palki charges"]
  },
  {
    id: "ekdham-kedarnath",
    title: "Kedarnath Ek Dham Yatra (4D/3N)",
    desc: "Dedicated 4-day pilgrimage to Lord Shiva's high-altitude Jyotirlinga shrine at 11,755 ft with helicopter shuttle options.",
    badge: "Ek Dham Special",
    image: "/Kedarnath.png",
    price: 14500,
    duration: "4 Days / 3 Nights",
    rating: 4.96,
    reviewsCount: 980,
    stay: "Guptkashi/Phata Deluxe Hotel (2N) + Kedarnath VIP Lodge (1N)",
    vehicle: "Chauffeured Private AC Vehicle",
    link: "/packages/kedarnath-yatra",
    highlights: ["12th Jyotirlinga Temple", "Kedarnath Night Stay", "Mandakini Valley Drive", "Bhairavnath Temple Trek"],
    itinerary: [
      { day: "Day 1", title: "Haridwar / Dehradun Pickup → Drive to Guptkashi", desc: "Drive along river valleys to Guptkashi hotel check-in & biometric verification." },
      { day: "Day 2", title: "Guptkashi to Gaurikund → Trek / Heli to Kedarnath", desc: "Trek 16 km or take heli shuttle to Kedarnath shrine. Evening Shiv Aarti & night stay near temple." },
      { day: "Day 3", title: "Kedarnath Abhishekam Puja → Trek Down to Guptkashi", desc: "Early morning temple Darshan, trek down to Gaurikund, and return to Guptkashi." },
      { day: "Day 4", title: "Guptkashi to Haridwar / Rishikesh Drop-off", desc: "Breakfast and scenic return drive to Haridwar/Rishikesh." }
    ],
    inclusions: ["3 Nights Hotel Accommodations (including Kedarnath Lodge)", "Private AC Ground Vehicle", "VIP Temple Entry Passes & Biometric Yatra Permit", "Daily Pure Veg Breakfast & Dinner"],
    exclusions: ["Helicopter shuttle or Pony charges"]
  },
  {
    id: "ekdham-badrinath",
    title: "Badrinath Ek Dham Yatra (3D/2N)",
    desc: "Direct motorable road trip to Lord Vishnu's sacred Badrinath shrine, Tapt Kund hot springs & Mana First Indian Village.",
    badge: "Ek Dham Special",
    image: "/Badrinath.png",
    price: 12500,
    duration: "3 Days / 2 Nights",
    rating: 4.92,
    reviewsCount: 710,
    stay: "Joshimath Deluxe Hotel (1N) + Badrinath Hotel (1N)",
    vehicle: "Chauffeured Private AC Vehicle",
    link: "/packages/badrinath-yatra",
    highlights: ["Badrivishal Gold Temple", "Tapt Kund Hot Sulfur Bath", "Mana Village & Bheem Pul", "Devprayag Sangam"],
    itinerary: [
      { day: "Day 1", title: "Haridwar Pickup → Drive to Joshimath via Devprayag", desc: "Drive along river confluences to Joshimath. Visit Narsingh Temple." },
      { day: "Day 2", title: "Joshimath to Badrinath Dham → Tapt Kund & Mana Village", desc: "Drive to Badrinath, Tapt Kund bath, Badrivishal Darshan, and visit Mana village." },
      { day: "Day 3", title: "Badrinath Morning Aarti → Return to Haridwar Drop-off", desc: "Morning Darshan and scenic drive back to Haridwar/Rishikesh." }
    ],
    inclusions: ["Private AC Vehicle", "2 Nights Hotel Stay", "VIP Darshan Pass", "Breakfast & Dinner"],
    exclusions: ["Personal Puja offerings"]
  },
  {
    id: "ekdham-gangotri",
    title: "Gangotri Ek Dham Yatra (3D/2N)",
    desc: "Scenic mountain journey through Harsil apple orchards to Gangotri Temple on the sacred banks of Bhagirathi river.",
    badge: "Ek Dham Special",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600",
    price: 11500,
    duration: "3 Days / 2 Nights",
    rating: 4.88,
    reviewsCount: 460,
    stay: "Uttarkashi Hotel (1N) + Harsil / Gangotri Cottage (1N)",
    vehicle: "Chauffeured Private AC Vehicle",
    link: "/packages/gangotri-yatra",
    highlights: ["Birthplace of Ganga", "Harsil Valley Apple Orchards", "Bhagirath Shila", "Kashi Vishwanath Uttarkashi"],
    itinerary: [
      { day: "Day 1", title: "Haridwar Pickup → Drive to Uttarkashi", desc: "Drive along Bhagirathi river to Uttarkashi. Visit Vishwanath Temple." },
      { day: "Day 2", title: "Uttarkashi to Gangotri Temple via Harsil Valley", desc: "Drive to Gangotri, Bhagirathi bath, Gangotri temple Darshan, and Harsil apple orchard walk." },
      { day: "Day 3", title: "Uttarkashi to Haridwar Drop-off", desc: "Scenic return drive to Haridwar." }
    ],
    inclusions: ["Private AC Vehicle", "2 Nights Stay", "Breakfast & Dinner", "Yatra Permit"],
    exclusions: ["Personal expenses"]
  },
  {
    id: "ekdham-yamunotri",
    title: "Yamunotri Ek Dham Yatra (3D/2N)",
    desc: "First shrine of the Garhwal Himalayas. Trek from Janki Chatti to Yamunotri & cook Prasad at Surya Kund 88°C hot spring.",
    badge: "Ek Dham Special",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
    price: 11500,
    duration: "3 Days / 2 Nights",
    rating: 4.87,
    reviewsCount: 430,
    stay: "Barkot Hotel (2N)",
    vehicle: "Chauffeured Private AC Vehicle",
    link: "/packages/yamunotri-yatra",
    highlights: ["First Char Dham Shrine", "Surya Kund 88°C Hot Spring", "Janki Chatti Trek Base", "Divya Shila Worship"],
    itinerary: [
      { day: "Day 1", title: "Haridwar Pickup → Drive to Barkot via Mussoorie", desc: "Drive via Mussoorie Kempty Falls to Barkot." },
      { day: "Day 2", title: "Barkot → Janki Chatti → Yamunotri Trek & Surya Kund", desc: "Trek to Yamunotri Temple, Surya Kund bath, temple Puja, and return to Barkot." },
      { day: "Day 3", title: "Barkot to Haridwar Drop-off", desc: "Breakfast and return drive to Haridwar." }
    ],
    inclusions: ["Private AC Vehicle", "2 Nights Hotel Stay", "Breakfast & Dinner", "Yatra Permits"],
    exclusions: ["Palki / Pony charges"]
  }
];
