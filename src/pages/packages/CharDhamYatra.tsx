import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import Layout from "@/components/Layout"
import SEO from "@/components/SEO"
import { config } from "@/config"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildTouristTripJsonLd } from "@/components/seo/JsonLd"
import { Button } from "@/components/ui/button"
import ScrollReveal from "@/components/ui/ScrollReveal"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { FAQAccordion } from "@/components/ui/FAQAccordion"
import { StickyCTA } from "@/components/common/StickyCTA"
import { reviewService, GoogleReview } from "@/services/reviewService"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  Clock, Star, ArrowRight, ShieldCheck, Heart, Sparkles, Compass, 
  CheckCircle2, Hotel, Check, X, Calendar, MapPin, Info, Mountain, 
  Eye, Car, ChevronRight
} from "lucide-react"

const CharDhamYatra: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_CHARDHAM_IMG = "/Badrinath.png"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Char Dham', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const charDhamPackages = [
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
  ]

  const attractions = [
    {
      id: "kedarnath-dham",
      category: "shrines",
      categoryName: "Holy 4 Dhams",
      title: "Kedarnath Dham (11,755 ft)",
      description: "One of the 12 sacred Jyotirlingas of Lord Shiva set against the dramatic backdrop of snow-capped Kedarnath Peak in Garhwal Himalayas.",
      image: "/Kedarnath.png",
      distance: "Rudraprayag District (16 km trek from Gaurikund)",
      highlights: ["12th Jyotirlinga Shrine", "Snow-Capped Peak View", "Evening Shiv Aarti", "Bhairav Temple Trek"],
      details: {
        altitude: "3,583 meters (11,755 ft)",
        bestTime: "May to June & September to November",
        overview: "Kedarnath Temple is an ancient stone architectural marvel believed to be originally built by Pandavas and restored by Adi Shankaracharya. Perched near the Mandakini river source, it remains one of Hinduism's most sacred pilgrimage sites.",
        experiences: [
          "Trek 16 km along Mandakini river or take a 7-minute VIP helicopter shuttle flight from Phata/Sersi.",
          "Attend the mesmerizing evening Shiv Aarti accompanied by temple bells and chants.",
          "Perform early morning Abhishekam Puja touching the sacred conical stone Jyotirlinga.",
          "Hike 1 km uphill to Bhairavnath Temple for panoramic views of the entire Kedarnath valley."
        ],
        travelTips: "Medical fitness certificate and biometric Yatra registration are mandatory; included in GhumoFiroo packages."
      }
    },
    {
      id: "badrinath-dham",
      category: "shrines",
      categoryName: "Holy 4 Dhams",
      title: "Badrinath Dham & Tapt Kund (10,279 ft)",
      description: "Sacred abode of Lord Vishnu situated between Nar and Narayana mountain ranges on the banks of Alaknanda river.",
      image: "/Badrinath.png",
      distance: "Chamoli District (Smooth Motorable Highway)",
      highlights: ["Badrivishal Gold Sanctum", "Tapt Kund Thermal Bath", "Neelkanth Peak View", "Mana First Indian Village"],
      details: {
        altitude: "3,133 meters (10,279 ft)",
        bestTime: "May to June & September to November",
        overview: "Badrinath is the premier shrine of both Char Dham and Chota Char Dham circuits. The colorful 50-foot high facade houses a 1-meter high black stone statue of Lord Badrinarayana seated under a Badri tree.",
        experiences: [
          "Take a purifying bath in the natural hot sulfur springs of Tapt Kund (45°C) before temple Darshan.",
          "Witness the golden morning Maha Aarti as sunlight illuminates the peak of Mount Neelkanth.",
          "Visit Mana Village (3 km away), the last Indian village before Tibet border, to see Vyas Gufa and Saraswati River origin.",
          "Pray at Brahma Kapal bank on Alaknanda river for ancestral rituals."
        ],
        travelTips: "Direct smooth motorable road connects Haridwar to Badrinath without any long trekking required."
      }
    },
    {
      id: "tungnath-chandrashila",
      category: "shrines",
      categoryName: "Holy 4 Dhams",
      title: "Tungnath Temple & Chandrashila Peak (12,073 ft)",
      description: "World's highest Shiva temple (3,680m / 12,073 ft) and part of Panch Kedar, offering 360-degree panoramic views of Nanda Devi & Chaukhamba peaks.",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
      distance: "Rudraprayag District (3.5 km trek from Chopta)",
      highlights: ["World's Highest Shiva Temple", "Panch Kedar Shrine", "360° Himalayan Summit", "Chopta Mini Switzerland"],
      details: {
        altitude: "3,680 meters (12,073 ft)",
        bestTime: "May to June & September to November",
        overview: "Tungnath is the highest of the five Panch Kedar temples. Believed to be over 1,000 years old, the arms (Bahu) of Lord Shiva are worshipped here in divine rock form. Extending 1.5 km past the temple leads to Chandrashila Peak (13,000 ft).",
        experiences: [
          "Trek 3.5 km from Chopta along rhododendron and pine forest trails to Tungnath Temple.",
          "Pay homage at the ancient stone sanctum of Lord Shiva perched on mountain ridges.",
          "Hike to Chandrashila Summit (13,000 ft) for a breathtaking 360° view of Nanda Devi, Kedarnath, Trishul & Chaukhamba peaks.",
          "Stay at Chopta meadow ('Mini Switzerland of India') surrounded by alpine grasslands."
        ],
        travelTips: "Easy to moderate paved stone trekking path suitable for all age groups."
      }
    },
    {
      id: "triyuginarayan-temple",
      category: "heritage",
      categoryName: "Sacred Spots & Wedding Sites",
      title: "Triyugi Narayan Temple (Akhand Dhuni)",
      description: "Celestial wedding venue of Lord Shiva and Goddess Parvati. Features the Akhand Dhuni (eternal sacred fire flame burning continuously across 3 Yugas).",
      image: "https://images.unsplash.com/photo-1600100397608-f09070a74797?q=80&w=800",
      distance: "Rudraprayag District (12 km from Sonprayag)",
      highlights: ["Shiva-Parvati Celestial Wedding", "Akhand Dhuni Eternal Flame", "Brahm Kund & Vishnu Kund", "Akhand Jyoti Ash Blessings"],
      details: {
        altitude: "1,980 meters (6,500 ft)",
        bestTime: "Year-Round | Daytime Visit",
        overview: "Triyuginarayan is a revered Himalayan temple dedicated to Lord Vishnu. Legend holds that Lord Shiva and Goddess Parvati were married here in the presence of Lord Vishnu (as brother) and Lord Brahma (as priest).",
        experiences: [
          "Offer wood logs to the perpetual Akhand Dhuni flame burning continuously since the celestial wedding.",
          "Collect sacred ash (Vibhuti) from the eternal fire to bring home as divine blessings.",
          "Dip hands in the four sacred holy kunds: Rudra Kund, Vishnu Kund, Brahma Kund, and Saraswati Kund.",
          "Examine the exact stone pillar spot where Lord Shiva and Parvati completed their marriage vows."
        ],
        travelTips: "Located just a short 20-minute detour from Sonprayag en route to Kedarnath."
      }
    },
    {
      id: "gangotri-dham",
      category: "shrines",
      categoryName: "Holy 4 Dhams",
      title: "Gangotri Dham & Harsil Valley (10,200 ft)",
      description: "Sacred birthplace of river Ganga where Goddess Ganga descended to Earth. Features 18th-century white granite temple built by Gorkha General Amar Singh Thapa.",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
      distance: "Uttarkashi District (99 km from Uttarkashi town)",
      highlights: ["Origin of Holy Ganga", "Harsil Apple Orchards", "Bhagirathi River Dip", "Bhagirath Shila"],
      details: {
        altitude: "3,100 meters (10,200 ft)",
        bestTime: "May to June & September to November",
        overview: "Gangotri Temple is situated on the banks of Bhagirathi River amidst deodar and pine forests. According to Hindu mythology, King Bhagirath meditated here to bring Goddess Ganga down from Heaven to cleanse the sins of his ancestors.",
        experiences: [
          "Take a holy dip in the crystal clear freezing waters of sacred Bhagirathi river.",
          "Pray at Bhagirath Shila, the sacred stone slab where King Bhagirath meditated to Lord Shiva.",
          "Drive through the tranquil alpine valley of Harsil, famous for wooden cottages and sweet apple orchards.",
          "Attend the soul-stirring Ganga Aarti performed on the riverbank at sunset."
        ],
        travelTips: "Gangotri is accessible via a picturesque drive through Harsil Valley."
      }
    },
    {
      id: "yamunotri-dham",
      category: "shrines",
      categoryName: "Holy 4 Dhams",
      title: "Yamunotri Dham & Surya Kund (10,804 ft)",
      description: "First shrine visited during Char Dham Yatra. Dedicated to Goddess Yamuna, located near Champasar Glacier on Kalind Mountain.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      distance: "Uttarkashi District (6 km trek from Janki Chatti)",
      highlights: ["First Char Dham Shrine", "Surya Kund 88°C Hot Spring", "Divya Shila Worship", "Prasad Cooked in Thermal Water"],
      details: {
        altitude: "3,293 meters (10,804 ft)",
        bestTime: "May to June & September to November",
        overview: "Yamunotri is the source of Yamuna River, daughter of the Sun God (Surya) and twin sister of Yama (God of Death). Pilgrims cook rice and potatoes wrapped in cloth inside the boiling 88°C waters of Surya Kund as sacred Prasad.",
        experiences: [
          "Trek 6 km from Janki Chatti along paved mountain paths or hire pony/palki palanquins.",
          "Cook raw rice in the boiling natural thermal spring of Surya Kund to offer to the deity.",
          "Worship Divya Shila (a reddish rock pillar) before entering the main Yamunotri temple.",
          "Take a bath in the warm waters of Gauri Kund before entering the inner sanctum."
        ],
        travelTips: "Janki Chatti serves as the base camp where ponies and palkis are available."
      }
    },
    {
      id: "bheem-pul-saraswati",
      category: "nature",
      categoryName: "Waterfalls, Rivers & Caves",
      title: "Bheem Pul & Saraswati River Origin",
      description: "Massive natural rock bridge constructed by Bheem over the roaring, white-foam Saraswati River as it emerges from the mountains in Mana.",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
      distance: "Mana Village (3 km from Badrinath)",
      highlights: ["Bheem's Natural Rock Bridge", "Roaring Saraswati Waterfall", "Mythological River Origin", "Swargarohini Trail Gate"],
      details: {
        altitude: "3,200 meters (10,500 ft)",
        bestTime: "May to October | Daytime 10:00 AM",
        overview: "According to Mahabharata epic, when Pandavas were walking towards Swargarohini (path to Heaven), Draupadi was unable to cross the fierce roaring Saraswati River. Bheem threw a giant stone monolith across the river gorge, creating Bheem Pul.",
        experiences: [
          "Stand on Bheem Pul stone bridge to watch the Saraswati River crash into narrow rock caverns below.",
          "Witness the rare spot where Saraswati River originates from mountain rocks before flowing into Alaknanda.",
          "Photograph the dramatic white water spray rising through narrow rock gorges.",
          "Walk along the ancient Swargarohini trail leading toward the high Himalayan glaciers."
        ],
        travelTips: "Located just 500 meters walk inside Mana Village from the main parking area."
      }
    },
    {
      id: "vasudhara-falls",
      category: "nature",
      categoryName: "Waterfalls, Rivers & Caves",
      title: "Vasudhara Falls (140m / 400ft Waterfall)",
      description: "Sacred high-altitude waterfall dropping from 400 feet against snowy peaks. Mythologically believed to turn away water drops from unrighteous souls.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      distance: "6 km trek beyond Mana Village",
      highlights: ["400ft High Alpine Waterfall", "Glacial Valley Views", "Pandava Swargarohini Path", "Nektar Water Drops"],
      details: {
        altitude: "3,658 meters (12,000 ft)",
        bestTime: "May to October | Morning Trek 7:00 AM",
        overview: "Vasudhara Falls is a majestic 140m high waterfall set in a glacial landscape. Legend says that the water drops turn away from sinners and only fall on pure, righteous souls.",
        experiences: [
          "Trek 6 km along the Alaknanda river valley from Mana Village past Vasudhara glacier.",
          "Stand beneath the mist of the 400ft waterfall surrounded by Mt. Chaukhamba and Satopanth glaciers.",
          "Drink the crystal clear glacial water believed to possess medicinal mineral properties.",
          "Spot rare Himalayan wildflowers and alpine flora along the glacial trail."
        ],
        travelTips: "A rewarding 3 to 4 hour trek from Mana Village; requires good walking shoes and water bottles."
      }
    },
    {
      id: "mana-village",
      category: "heritage",
      categoryName: "Sacred Spots & Wedding Sites",
      title: "Mana Village & Vyas Gufa",
      description: "Historic Himalayan border village located 3 km beyond Badrinath, housing Vyas Gufa, Ganesh Gufa & traditional Bhotia craft shops.",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
      distance: "3 km from Badrinath Temple",
      highlights: ["First Indian Village Signboard", "Vyas Gufa (Mahabharata Cave)", "Ganesh Gufa", "Bhotia Woolen Weaving"],
      details: {
        altitude: "3,200 meters (10,500 ft)",
        bestTime: "May to October | Daytime 10:00 AM",
        overview: "Mana is officially recognized as the 'First Indian Village' at the Indo-Tibet border. It is deeply embedded in Mahabharata legend, where Sage Vyas dictated the epic Mahabharata to Lord Ganesha inside a cave.",
        experiences: [
          "Visit Vyas Gufa cave where Sage Ved Vyas composed the 18 Puranas and Mahabharata.",
          "Examine Ganesh Gufa cave where Lord Ganesha transcribed the holy verses.",
          "Photograph the famous 'Last Tea Shop of India' at the edge of the border road.",
          "Buy authentic hand-knitted woolen shawls and caps made by indigenous Bhotia weavers."
        ],
        travelTips: "Easily reached by private car or a scenic 45-minute walk from Badrinath."
      }
    },
    {
      id: "devprayag-confluence",
      category: "heritage",
      categoryName: "Sacred Spots & Wedding Sites",
      title: "Devprayag & Panch Prayag Confluences",
      description: "Sacred confluence of Alaknanda and Bhagirathi rivers merging to form the holy Ganges river, along with Rudraprayag and Karnaprayag.",
      image: "https://images.unsplash.com/photo-1600100397608-f09070a74797?q=80&w=800",
      distance: "Tehri Garhwal (70 km from Rishikesh)",
      highlights: ["Ganga Origin Confluence", "Distinct Turquoise & Muddy Waters", "Raghunathji Temple", "Suspension Bridge View"],
      details: {
        altitude: "830 meters (2,720 ft)",
        bestTime: "Year-Round | En Route Travel Hours",
        overview: "Devprayag is the final confluence of the Panch Prayag. Here, the serene turquoise waters of Alaknanda meet the turbulent muddy green waters of Bhagirathi, officially birth-giving the Holy Ganga river.",
        experiences: [
          "Stand on the foot suspension bridge to watch two distinct river colors merge into one stream.",
          "Offer prayers at the ancient 10,000-year-old Raghunathji Temple dedicated to Lord Rama.",
          "Take a holy dip at the Sangam bathing ghat at the river confluence point.",
          "Observe Rudraprayag (Alaknanda + Mandakini) and Karnaprayag confluences along the Yatra drive."
        ],
        travelTips: "All GhumoFiroo road packages include planned photo stops at Devprayag and Rudraprayag."
      }
    },
    {
      id: "kashi-vishwanath-uttarkashi",
      category: "nature",
      categoryName: "Waterfalls, Rivers & Caves",
      title: "Kashi Vishwanath Temple & Shakti Trishul Uttarkashi",
      description: "Ancient Lord Shiva temple in Uttarkashi on Bhagirathi riverbank housing a 26-foot heavy bronze Shakti Trishul (trident).",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      distance: "Uttarkashi Town",
      highlights: ["26-Foot Heavy Shakti Trishul", "Ancient Shivlinga", "Bhagirathi Riverbank Aarti", "Nehru Institute of Mountaineering"],
      details: {
        altitude: "1,158 meters (3,800 ft)",
        bestTime: "Year-Round | Evening Aarti 6:30 PM",
        overview: "Uttarkashi ('Northern Kashi') is a major spiritual hub on the Garhwal Yatra route. The Kashi Vishwanath Temple is believed to have been established by Lord Parashurama. Across the courtyard stands the Shakti Temple housing a 26-foot heavy bronze trident that vibrates when touched with a pinky finger.",
        experiences: [
          "Pray at the ancient Shivlinga inside the main Kashi Vishwanath temple sanctum.",
          "Touch the miraculous 26-foot Shakti Trishul which moves with light fingertip pressure but stays firm against heavy force.",
          "Attend the evening Bhagirathi river Aarti at Manikarnika Ghat in Uttarkashi.",
          "Visit nearby Nehru Institute of Mountaineering (NIM) museum."
        ],
        travelTips: "An essential overnight stopover on the way to Gangotri and Yamunotri."
      }
    },
    {
      id: "gaurikund-vasuki-tal",
      category: "nature",
      categoryName: "Waterfalls, Rivers & Caves",
      title: "Gaurikund & Vasuki Tal High-Altitude Lake",
      description: "Thermal hot spring bath site at Gaurikund (base of Kedarnath trek) and high-altitude glacial lake Vasuki Tal (14,200 ft).",
      image: "/Kedarnath.png",
      distance: "Kedarnath Region (8 km trek from Kedarnath Temple)",
      highlights: ["Thermal Hot Water Kund", "Gauri Temple Base", "Vasuki Tal Crystal Lake", "Brahma Kamal Wildflowers"],
      details: {
        altitude: "Gaurikund (6,500 ft) | Vasuki Tal (14,200 ft)",
        bestTime: "May to June & September to October",
        overview: "Gaurikund is the traditional starting point of the 16 km trek to Kedarnath. It is named after Goddess Parvati (Gauri) who performed penance here to win Lord Shiva as her husband. High above Kedarnath lies Vasuki Tal, a crystalline glacial lake surrounded by Brahma Kamal flowers.",
        experiences: [
          "Take a purifying thermal bath in Gaurikund's natural hot water springs before trekking to Kedarnath.",
          "Offer prayers at the ancient Gauri Mata Temple where Goddess Parvati meditated.",
          "Hike 8 km beyond Kedarnath Temple to Vasuki Tal glacial lake (14,200 ft) offering views of Chaukhamba peaks.",
          "Spot the sacred state flower Brahma Kamal blooming along high mountain ridge rocks."
        ],
        travelTips: "Vasuki Tal trek is recommended for adventure enthusiasts and experienced trekkers."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "cd-faq-1", question: "Is compulsory Uttarakhand Biometric Yatra Registration included in GhumoFiroo packages?", answer: "Yes! All GhumoFiroo Char Dham packages include pre-arranged Uttarakhand Tourist Care Yatra registration permits, QR code passes, and VIP queue priority passes." },
    { id: "cd-faq-2", question: "What helicopter shuttle and charter options are available for Kedarnath & Badrinath?", answer: "We offer daily Helicopter shuttle bookings (Sersi / Phata / Guptkashi to Kedarnath) as well as 1-day & 5-day Same Day Char Dham Helicopter Charters from Dehradun Sahastradhara Helipad with VIP Darshan slips." },
    { id: "cd-faq-3", question: "Are pure vegetarian and Jain Satvik meals guaranteed during the Yatra?", answer: "Yes! 100% pure vegetarian breakfasts and dinners cooked without onion and garlic (Jain meal options available upon request) are provided at all hotels, resorts, and lodges." },
    { id: "cd-faq-4", question: "What is the best month for Char Dham Yatra, and when do Kapat open in 2026?", answer: "Kapat generally open on Akshaya Tritiya (May) and close after Diwali (November). The best months are May to June (pleasant weather) and September to November (clear skies and serene darshan)." },
    { id: "cd-faq-5", question: "Can I book a shorter Do Dham Yatra package for Kedarnath and Badrinath?", answer: "Yes! We offer customized 5N/6D and 6N/7D Do Dham Yatra packages covering Kedarnath and Badrinath by road from Haridwar/Rishikesh or by luxury helicopter from Dehradun." },
    { id: "cd-faq-6", question: "What medical fitness and altitude precautions are recommended for Kedarnath trek?", answer: "Kedarnath is situated at 11,755 ft. We recommend a basic medical checkup, carrying warm thermal layers, rain ponchos, and oxymeters. Palki, Pony, and Helicopter shuttle services are available for senior citizens." },
    { id: "cd-faq-7", question: "Where do Char Dham tour pickups start from?", answer: "We provide private chauffeured Innova/Tempo Traveller pickups directly from Delhi NCR, Haridwar Railway Station, Rishikesh, and Dehradun Jolly Grant Airport." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Char Dham Yatra", item: "/packages/char-dham-yatra" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Char Dham Yatra 2026 Tour Packages",
    description: "Kedarnath, Badrinath, Gangotri, Yamunotri, Tungnath, Triyugi Narayan, Bheem Pul, Saraswati River & Vasudhara Falls.",
    url: config.baseUrl + "/packages/char-dham-yatra",
    image: "/Badrinath.png",
    duration: "P10D",
    itinerary: [
      { position: 1, name: "Yamunotri & Gangotri Dham", description: "Janki Chatti trek to Yamunotri & Harsil valley drive to Gangotri." },
      { position: 2, name: "Kedarnath Dham Trek & Triyugi Narayan", description: "Mandakini valley trek, Triyugi Narayan Akhand Dhuni & Kedarnath night stay." },
      { position: 3, name: "Badrinath Dham, Mana, Bheem Pul & Vasudhara", description: "Tapt Kund bath, Badrivishal Darshan, Mana Bheem Pul & Vasudhara Falls trek." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "26500",
      includes: "9 nights hotel stay, biometric permits, VIP passes, pure veg meals & private AC vehicle"
    },
    aggregateRating: {
      ratingValue: 4.98,
      reviewCount: 1650
    }
  })

  return (
    <Layout>
      <SEO 
        title="Char Dham Yatra Tour Packages 2026 | Kedarnath, Badrinath, Helicopter, Do Dham & Ek Dham"
        description="Book official Char Dham Yatra tour packages 2026 from Haridwar, Delhi & Dehradun. Includes Kedarnath, Badrinath, Gangotri, Yamunotri, Do Dham, Ek Dham, VIP Darshan & Helicopter charters."
        keywords="Char Dham Yatra package 2026, Kedarnath tour package price, Badrinath Yatra cost from Haridwar, Do Dham yatra package, Ek Dham Kedarnath price, Char Dham packages from Delhi"
        canonicalUrl={config.baseUrl + "/packages/char-dham-yatra"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="/Badrinath.png" 
              alt="Char Dham Badrinath Temple Peaks" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CHARDHAM_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Sacred Himalayan Pilgrimage
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Char Dham Yatra 2026
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Char Dham 10D/9N, VVIP Helicopter 5D/4N, Do Dham Kedar-Badri, Ek Dham Kedarnath & Delhi/Haridwar Circuits with VIP Queue Passes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Yatra Packages <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-6 rounded-full bg-black/40 border-white/20 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 backdrop-blur-md"
                onClick={() => document.getElementById("highlights-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Sightseeing Guide <Compass className="ml-2 h-4 w-4 text-[#C9A25A]" />
              </Button>
            </div>

            {/* QUICK STATS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 w-full max-w-3xl">
              {[
                { label: "Guest Rating", val: "4.98 ★", sub: "1,650+ Pilgrims" },
                { label: "Package Options", val: "9 Curated Tours", sub: "Char Dham, Do Dham & Ek Dham" },
                { label: "Permits & VIP", val: "100% Pre-Booked", sub: "Priority Queue Entry" },
                { label: "Meals", val: "100% Pure Veg", sub: "Jain Food Available" }
              ].map((stat, i) => (
                <div key={i} className="bg-black/40 border border-white/10 p-3 rounded-xl backdrop-blur-md text-center">
                  <div className="text-sm font-serif font-bold text-[#E5C378]">{stat.val}</div>
                  <div className="text-[10px] text-slate-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* PACKAGES GRID SECTION */}
        <section id="packages-section" className="py-24 container mx-auto px-6 max-w-7xl">
          <SectionHeading 
            kicker="Pilgrimage Collections" 
            title="Select Your Yatra Package" 
            subtitle="Explore our full collection of Char Dham 4-Shrine, Do Dham 2-Shrine, Ek Dham single shrine, and VVIP Helicopter tour packages." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {charDhamPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CHARDHAM_IMG }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/75 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        {pkg.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {pkg.rating} ({pkg.reviewsCount})
                    </div>
                  </Link>

                  <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#C9A25A] mb-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {pkg.duration}
                        </span>
                        <span className="text-slate-400 font-normal">Pilgrimage</span>
                      </div>
                      
                      <Link to={pkg.link} className="block">
                        <h3 className="text-lg font-serif font-bold text-white mb-1 group-hover:text-[#E5C378] transition-colors">
                          {pkg.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-300 font-light leading-relaxed mb-3">{pkg.desc}</p>

                      <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Hotel className="w-3.5 h-3.5 text-[#C9A25A] shrink-0" />
                          <span className="truncate">{pkg.stay}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Car className="w-3.5 h-3.5 text-[#C9A25A] shrink-0" />
                          <span className="truncate">{pkg.vehicle}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-3">
                        {pkg.highlights.map((h, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-medium border border-white/10">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Starting From</span>
                        <span className="text-lg font-serif font-extrabold text-[#E5C378]">₹{pkg.price.toLocaleString("en-IN")}</span>
                      </div>
                      <Link 
                        to={pkg.link}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition-all"
                      >
                        Explore Details <ArrowRight className="w-3.5 h-3.5 text-[#070C1E]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ATTRACTIONS GRID SECTION - ELABORATE DESIGN */}
        <section id="highlights-section" className="py-24 bg-[#050A18] border-y border-[#C9A25A]/15">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading 
              kicker="In-Depth Sightseeing Guide" 
              title="Char Dham Shrines & Highlights Included" 
              subtitle="Explore complete details of sacred shrines covered across our Garhwal Yatra itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights (12 Sacred Spots)" },
                { key: "shrines", label: "Holy 4 Dhams" },
                { key: "heritage", label: "Sacred Spots & Wedding Sites" },
                { key: "nature", label: "Waterfalls, Rivers & Caves" }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeCategory === tab.key
                      ? "bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] shadow-md shadow-[#C9A25A]/20"
                      : "bg-[#0B1226] text-slate-300 hover:text-white border border-white/10 hover:border-[#C9A25A]/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAttractions.map((item, idx) => (
                <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 40}>
                  <div 
                    onClick={() => setSelectedAttraction(item)}
                    className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <img 
                        src={item.image} 
                        alt={item.title || item.name || "Sightseeing Highlight"} 
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CHARDHAM_IMG }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/75 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C9A25A]" /> {item.distance}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-[#C9A25A] text-[#070C1E] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1 shadow-lg group-hover:bg-[#E5C378] transition-colors">
                          <Eye className="w-3 h-3" /> View In-Depth Guide
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-[#E5C378] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-300 font-light leading-relaxed mb-4 line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-white/10">
                        <div className="flex flex-wrap gap-1.5">
                          {item.highlights.map((h, i) => (
                            <span key={i} className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C9A25A]/10 text-[#E5C378] font-medium border border-[#C9A25A]/25">
                              {h}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#C9A25A] font-bold pt-1">
                          <span className="flex items-center gap-1">
                            <Mountain className="w-3.5 h-3.5 text-[#C9A25A]" /> {item.details.altitude}
                          </span>
                          <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Full Details <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* DETAILED ATTRACTION MODAL POPUP */}
        <Dialog open={!!selectedAttraction} onOpenChange={() => setSelectedAttraction(null)}>
          <DialogContent className="bg-[#0B1026] text-white border-[#C9A25A]/40 max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl font-sans">
            {selectedAttraction && (
              <div>
                <div className="relative aspect-[21/9] overflow-hidden">
                  <img 
                    src={selectedAttraction.image} 
                    alt={selectedAttraction.title || selectedAttraction.name || "Destination Attraction View"} 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CHARDHAM_IMG }}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1026] via-[#0B1026]/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A25A]" /> {selectedAttraction.distance}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A25A]/15 border border-[#C9A25A]/30 text-[#E5C378] text-xs font-bold uppercase tracking-wider mb-2">
                      <Mountain className="w-3.5 h-3.5 text-[#C9A25A]" /> Altitude: {selectedAttraction.details.altitude}
                    </div>
                    <DialogTitle className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                      {selectedAttraction.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-300 font-light leading-relaxed">
                      {selectedAttraction.details.overview}
                    </DialogDescription>
                  </div>

                  {/* KEY EXPERIENCES */}
                  <div className="space-y-3 bg-white/5 p-5 rounded-xl border border-white/10">
                    <h4 className="text-sm font-serif font-bold text-[#E5C378] uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C9A25A]" /> Top Experiences Included
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedAttraction.details.experiences.map((exp: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-[#C9A25A] shrink-0 mt-0.5" />
                          <span>{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BEST SEASON & PRO TIPS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#070C1E] p-4 rounded-xl border border-[#C9A25A]/25 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#C9A25A] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Best Time to Visit
                      </span>
                      <p className="text-xs text-white font-medium">{selectedAttraction.details.bestTime}</p>
                    </div>

                    <div className="bg-[#070C1E] p-4 rounded-xl border border-[#C9A25A]/25 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#C9A25A] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Pro Travel Tip
                      </span>
                      <p className="text-xs text-slate-300 font-light">{selectedAttraction.details.travelTips}</p>
                    </div>
                  </div>

                  {/* CTA BUTTON */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block font-light">Includes VIP passes & biometric permits</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹26,500</span>
                    </div>
                    <Button 
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg"
                      onClick={() => {
                        setSelectedAttraction(null)
                        document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      Explore Tour Packages <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* FAQ SECTION */}
        <section className="py-24 container mx-auto px-6 max-w-4xl">
          <SectionHeading kicker="Assurance Details" title="Char Dham Yatra FAQ" subtitle="Important details regarding biometric permits, VIP queue access & pure veg meals." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Char Dham Yatra 2026"
          priceText="From ₹26,500"
          priceSubtext="VIP Darshan Passes & Biometric Permits Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Char%20Dham%20Yatra%20Deluxe%20Road%20Tour%2010D9N&price=26500")}
        />
      </div>
    </Layout>
  )
}

export default CharDhamYatra
