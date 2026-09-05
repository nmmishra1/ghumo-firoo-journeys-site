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

const KeralaBackwaters: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_KERALA_IMG = "/kerala/alleppey_backwaters_houseboat.jpg"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Kerala', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const keralaPackages = [
    {
      id: "kerala-3d2n-munnar-hills",
      title: "Munnar Tea Hills Short Break (3D/2N)",
      desc: "Quick misty mountain getaway covering Cheeyappara & Valara waterfalls, tea plantation walks, Mattupetty Dam & Echo Point.",
      badge: "Weekend Escape",
      image: "/kerala/munnar_tea_estates.jpg",
      price: 12800,
      duration: "3 Days / 2 Nights",
      rating: 4.88,
      reviewsCount: 290,
      stay: "Munnar Tea Country 4-Star Resort (2N)",
      vehicle: "Chauffeured Private AC Sedan / SUV",
      link: "/packages/kerala-3d2n-munnar-hills",
      highlights: ["Cheeyappara Waterfalls", "Tata Tea Museum", "Mattupetty Dam", "Echo Point"],
      itinerary: [
        { day: "Day 1", title: "Cochin Pickup → Scenic Western Ghats Drive to Munnar", desc: "Private pickup from Cochin Airport/Railway Station. Scenic mountain drive past Cheeyappara & Valara waterfalls with photo stops. Check in to Munnar resort." },
        { day: "Day 2", title: "Munnar Tea Hills & Eravikulam Safari", desc: "Full-day sightseeing: Eravikulam National Park (Nilgiri Tahr), Tata Tea Museum, Mattupetty Dam boating & Echo Point." },
        { day: "Day 3", title: "Munnar to Cochin Airport / Railway Station Drop", desc: "Breakfast with panoramic tea valley views, spice market shopping, and drive back to Cochin for return journey." }
      ],
      inclusions: ["2 Nights 4-Star Mountain Resort", "Daily Breakfast Buffet", "Private AC Cab for All Transfers & Sightseeing", "Driver Allowance, Tolls & Parking"],
      exclusions: ["Airfare / Train tickets", "Boating & Entry fees"]
    },
    {
      id: "kerala-4d3n-munnar-alleppey",
      title: "Munnar Tea Hills & Alleppey Houseboat (4D/3N)",
      desc: "Our most popular short Kerala break combining misty Munnar tea hills with a signature private AC Alleppey backwater houseboat cruise.",
      badge: "Best Value",
      image: "/kerala/alleppey_backwaters_houseboat.jpg",
      price: 16800,
      duration: "4 Days / 3 Nights",
      rating: 4.93,
      reviewsCount: 480,
      stay: "Munnar Resort (2N) + Private AC Houseboat (1N)",
      vehicle: "Chauffeured Private AC Sedan / SUV",
      link: "/packages/kerala-4d3n-munnar-alleppey",
      highlights: ["Private Houseboat Cruise", "Munnar Tea Gardens", "Cheeyappara Falls", "Vembanad Lake"],
      itinerary: [
        { day: "Day 1", title: "Cochin Pickup → Munnar Tea Country", desc: "Private pickup from Cochin. Drive to Munnar via scenic hill highways and Cheeyappara falls." },
        { day: "Day 2", title: "Munnar Nature & Tea Valley Exploration", desc: "Eravikulam National Park, Lockhart tea valley viewpoints, Mattupetty Lake & Kundala Dam." },
        { day: "Day 3", title: "Munnar to Alleppey → Private Houseboat Sailing", desc: "Drive to Alleppey. Board private AC luxury houseboat at noon. Sail Vembanad backwaters with fresh Karimeen fish dinner." },
        { day: "Day 4", title: "Alleppey Houseboat Breakfast → Cochin Airport Drop", desc: "Morning canal cruise, breakfast onboard, and transfer to Cochin Airport / Station." }
      ],
      inclusions: ["1 Night Private AC Houseboat (All Meals)", "2 Nights 4-Star Resort Stay", "Private AC Chauffeured Vehicle", "Daily Breakfast & Houseboat Meals"],
      exclusions: ["Flights / Train", "Personal expenses"]
    },
    {
      id: "kerala-5d4n-tea-wildlife-backwaters",
      title: "Kerala Tea, Wildlife & Backwaters Classic (5D/4N)",
      desc: "Comprehensive best-seller circuit covering Cochin heritage, Munnar tea hills, Thekkady Periyar wildlife boat safari & Alleppey houseboat.",
      badge: "Best Seller",
      image: "/kerala/thekkady_periyar_sanctuary.jpg",
      price: 21500,
      duration: "5 Days / 4 Nights",
      rating: 4.96,
      reviewsCount: 890,
      stay: "Munnar Resort (2N) + Thekkady Spice Resort (1N) + Alleppey Houseboat (1N)",
      vehicle: "Chauffeured Private AC SUV / Sedan",
      link: "/packages/kerala-5d4n-tea-wildlife-backwaters",
      highlights: ["Periyar Boat Safari", "Alleppey Houseboat", "Spice Plantation Walk", "Fort Kochi Nets"],
      itinerary: [
        { day: "Day 1", title: "Cochin Pickup → Fort Kochi & Drive to Munnar", desc: "Pickup at Cochin. Visit Chinese Fishing Nets & drive past misty cascades to Munnar." },
        { day: "Day 2", title: "Munnar Tea Valley & Eravikulam Safari", desc: "Explore Eravikulam National Park, Tata Tea Museum, Echo Point & Kundala Lake." },
        { day: "Day 3", title: "Munnar to Thekkady → Periyar Safari & Spice Gardens", desc: "Drive to Thekkady. Aromatic spice garden guided walk & Periyar Lake boat safari to spot wild elephant herds." },
        { day: "Day 4", title: "Thekkady to Alleppey → Private Luxury Houseboat Cruise", desc: "Transfer to Alleppey jetty. Board private AC houseboat with authentic Kerala meals cooked by your personal chef." },
        { day: "Day 5", title: "Alleppey Disembarkation → Cochin Airport Drop-off", desc: "Breakfast on houseboat, disembark at 9:00 AM, and transfer to Cochin Airport for return journey." }
      ],
      inclusions: ["1 Night Deluxe Houseboat + 3 Nights 4-Star Resorts", "Periyar Boat Safari Assistance", "Guided Spice Garden Walk", "Private AC Chauffeured Cab Throughout"],
      exclusions: ["Flight tickets", "Kathakali show entry"]
    },
    {
      id: "kerala-5d4n-varkala-cliff-beach",
      title: "Varkala Cliff Beach & Backwaters Getaway (5D/4N)",
      desc: "Coastal holiday pairing dramatic red laterite cliffs of Varkala Beach with Jatayu Earth's Center cable car and private Alleppey houseboat cruise.",
      badge: "Beach & Cliff Special",
      image: "/kerala/jatayu_earth_center.jpg",
      price: 22500,
      duration: "5 Days / 4 Nights",
      rating: 4.91,
      reviewsCount: 340,
      stay: "Varkala Cliff Resort (2N) + Alleppey Houseboat (1N) + Cochin Hotel (1N)",
      vehicle: "Chauffeured Private AC Sedan / SUV",
      link: "/packages/kerala-5d4n-varkala-cliff-beach",
      highlights: ["Varkala Red Cliff Beach", "Jatayu Earth's Center", "Alleppey Houseboat", "Munroe Island"],
      itinerary: [
        { day: "Day 1", title: "Trivandrum/Cochin Pickup → Varkala Cliff Beach", desc: "Pickup and transfer to Varkala. Check in to cliffside resort overlooking Arabian Sea sunset." },
        { day: "Day 2", title: "Varkala Beach & Jatayu Earth's Center Adventure", desc: "Visit world's largest bird sculpture at Jatayu Center with cable car ride, followed by sunset at Papanasam beach." },
        { day: "Day 3", title: "Varkala to Alleppey → Private Houseboat Backwater Cruise", desc: "Drive along coastal highway to Alleppey. Board private AC houseboat with Kerala meals & backwater sailing." },
        { day: "Day 4", title: "Alleppey to Cochin → Heritage Fort Kochi Tour", desc: "Disembark and drive to Cochin. Tour Fort Kochi, Chinese Fishing Nets, Mattancherry & Jew Town." },
        { day: "Day 5", title: "Cochin Airport / Railway Station Departure", desc: "Morning shopping in Kochi and airport departure transfer." }
      ],
      inclusions: ["1N Houseboat + 3N Premium Resorts", "Jatayu Cable Car Assistance", "All Houseboat Meals", "Private AC Car for 5 Days"],
      exclusions: ["Flight fares", "Adventure sports"]
    },
    {
      id: "kerala-6d5n-hills-backwaters-kovalam",
      title: "Grand Kerala Hills, Backwaters & Kovalam Beach (6D/5N)",
      desc: "Complete flagship Kerala tour featuring Fort Kochi heritage, Munnar tea hills, Thekkady safari, Alleppey houseboat & Kovalam lighthouse beach.",
      badge: "Flagship Circuit",
      image: "/kerala/kovalam_lighthouse_beach.jpg",
      price: 26500,
      duration: "6 Days / 5 Nights",
      rating: 4.98,
      reviewsCount: 620,
      stay: "Munnar (2N) + Thekkady (1N) + Houseboat (1N) + Kovalam (1N)",
      vehicle: "Chauffeured Private AC Innova / Ertiga / Sedan",
      link: "/packages/kerala-6d5n-hills-backwaters-kovalam",
      highlights: ["Munnar Tea Valleys", "Periyar Boat Safari", "Alleppey Houseboat", "Kovalam Lighthouse Beach"],
      itinerary: [
        { day: "Day 1", title: "Cochin Arrival → Scenic Mountain Drive to Munnar", desc: "Pickup at Cochin Airport. Drive past Cheeyappara & Valara waterfalls to Munnar tea country." },
        { day: "Day 2", title: "Munnar Full-Day Nature & Safari Excursion", desc: "Eravikulam National Park, Nilgiri Tahr sightings, Tea Museum, Mattupetty Lake & Echo Point." },
        { day: "Day 3", title: "Munnar to Thekkady → Periyar Wildlife & Spice Walk", desc: "Scenic mountain drive to Thekkady. Spice garden tour and evening Periyar Lake boat safari." },
        { day: "Day 4", title: "Thekkady to Alleppey → Private AC Houseboat Cruise", desc: "Drive to Alleppey jetty. Board private houseboat at noon. Sail Vembanad backwaters with fresh Karimeen dinner." },
        { day: "Day 5", title: "Alleppey to Kovalam → Lighthouse Beach Sunset", desc: "Drive to Kovalam via Jatayu sculpture. Relax at Kovalam Lighthouse Beach & sample fresh seafood." },
        { day: "Day 6", title: "Trivandrum Sightseeing → Padmanabhaswamy Temple & Airport Drop", desc: "Visit iconic Sree Padmanabhaswamy Temple, Napier Museum, and transfer to Trivandrum Airport." }
      ],
      inclusions: ["5 Nights Accommodation (1 Houseboat + 4 Deluxe Hotels)", "Periyar Lake Boat Tickets", "All Houseboat Meals", "Private AC Vehicle for 6 Days"],
      exclusions: ["Flight fares", "Temple special entry"]
    },
    {
      id: "kerala-7d6n-grand-kerala-kanyakumari",
      title: "Grand Kerala Circuit & Kanyakumari Sunset (7D/6N)",
      desc: "All-in-one South India circuit combining Cochin, Munnar tea hills, Thekkady wildlife, Alleppey houseboat, Kovalam beach & Kanyakumari Cape Comorin.",
      badge: "Grand Circuit",
      image: "/kerala/eravikulam_nilgiri_tahr.jpg",
      price: 32000,
      duration: "7 Days / 6 Nights",
      rating: 4.97,
      reviewsCount: 420,
      stay: "Munnar (2N) + Thekkady (1N) + Alleppey (1N) + Kovalam (1N) + Kanyakumari (1N)",
      vehicle: "Chauffeured Private AC Innova / Ertiga / Sedan",
      link: "/packages/kerala-7d6n-grand-kerala-kanyakumari",
      highlights: ["Kanyakumari Sunset & Sunrise", "Vivekananda Rock Memorial", "Alleppey Houseboat", "Munnar Tea Estates"],
      itinerary: [
        { day: "Day 1", title: "Cochin Pickup → Scenic Western Ghats Drive to Munnar", desc: "Pickup at Cochin. Drive to Munnar via Valara & Cheeyappara falls." },
        { day: "Day 2", title: "Munnar Tea Country & Eravikulam Safari", desc: "Eravikulam National Park, Tea Museum, Echo Point & Mattupetty Dam." },
        { day: "Day 3", title: "Munnar to Thekkady → Spice Walk & Periyar Safari", desc: "Drive to Thekkady. Cardamom plantation walk & Periyar Lake boat safari." },
        { day: "Day 4", title: "Thekkady to Alleppey → Private Houseboat Cruise", desc: "Board private AC luxury houseboat at noon. Sail backwater lagoons." },
        { day: "Day 5", title: "Alleppey to Kovalam → Lighthouse Beach & Trivandrum", desc: "Drive to Kovalam. Relax on golden sand beach and view sunset." },
        { day: "Day 6", title: "Kovalam to Kanyakumari → Vivekananda Rock & Triveni Sangam", desc: "Drive to Kanyakumari. Ferry to Vivekananda Rock Memorial, Thiruvalluvar Statue & sunset over 3 oceans." },
        { day: "Day 7", title: "Kanyakumari Sunrise → Trivandrum Airport Departure", desc: "Watch spectacular sunrise over the ocean, Padmanabhaswamy temple darshan & Trivandrum Airport drop." }
      ],
      inclusions: ["6 Nights Deluxe Accommodations", "1 Night Private Houseboat with All Meals", "Private AC Cab for 7 Days", "Daily Breakfast at all Hotels"],
      exclusions: ["Airfare / Train tickets", "Ferry tickets to Vivekananda Rock"]
    },
    {
      id: "kerala-8d7n-heritage-backwaters-cape",
      title: "Kerala Heritage, Wildlife, Backwaters & Cape Comorin (8D/7N)",
      desc: "Deluxe extended itinerary featuring Fort Kochi, Munnar, Thekkady, Alleppey houseboat, Varkala cliff, Kovalam beach & Kanyakumari.",
      badge: "Extended Deluxe",
      image: "/kerala/fort_kochi_chinese_nets.jpg",
      price: 36500,
      duration: "8 Days / 7 Nights",
      rating: 4.96,
      reviewsCount: 310,
      stay: "Fort Kochi (1N) + Munnar (2N) + Thekkady (1N) + Houseboat (1N) + Kovalam (2N) + Kanyakumari (1N)",
      vehicle: "Chauffeured Private AC Innova Crysta / Ertiga",
      link: "/packages/kerala-8d7n-heritage-backwaters-cape",
      highlights: ["Fort Kochi Heritage", "Eravikulam Nilgiri Tahr", "Private Houseboat", "Kanyakumari Cape"],
      itinerary: [
        { day: "Day 1", title: "Cochin Arrival → Heritage Fort Kochi Tour", desc: "Pickup at Cochin. Explore Portuguese & Dutch history, Jew Town and Chinese Nets." },
        { day: "Day 2", title: "Cochin to Munnar → Waterfalls & Tea Valley Check-in", desc: "Drive through Western Ghats mountains to Munnar resort." },
        { day: "Day 3", title: "Munnar Full-Day Sightseeing & Wildlife", desc: "Eravikulam Park, Tea Factory Museum, Kundala Lake & Echo Point." },
        { day: "Day 4", title: "Munnar to Thekkady → Periyar Safari & Kathakali", desc: "Drive to Thekkady. Spice garden tour, boat safari & evening dance show." },
        { day: "Day 5", title: "Thekkady to Alleppey → Private Luxury Houseboat", desc: "Board private houseboat. Savor traditional Kerala meals on Vembanad Lake." },
        { day: "Day 6", title: "Alleppey to Kovalam via Jatayu Earth's Center", desc: "Disembark houseboat, visit Jatayu giant sculpture and drive to Kovalam beach resort." },
        { day: "Day 7", title: "Kovalam to Kanyakumari Day Excursion", desc: "Day trip to Kanyakumari: Vivekananda Rock, Gandhi Memorial & sunset." },
        { day: "Day 8", title: "Trivandrum Temple Darshan → Airport Departure", desc: "Sree Padmanabhaswamy Temple darshan and Trivandrum Airport drop." }
      ],
      inclusions: ["7 Nights Accommodations (1 Houseboat + 6 Deluxe Hotels)", "All Houseboat Meals", "Private AC Cab with Experienced Driver", "Daily Breakfast Buffets"],
      exclusions: ["Airfare", "Personal expenses"]
    },
    {
      id: "kerala-10d9n-south-india-temple-circuit",
      title: "Complete Kerala & South India Grand Circuit (10D/9N)",
      desc: "The ultimate Grand South India vacation covering Cochin, Munnar, Thekkady, Alleppey, Kovalam, Kanyakumari, Madurai Meenakshi Temple & Rameshwaram.",
      badge: "Ultimate Grand Tour",
      image: "/kerala/vagamon_pine_forest.jpg",
      price: 45000,
      duration: "10 Days / 9 Nights",
      rating: 4.99,
      reviewsCount: 280,
      stay: "Cochin (1N) + Munnar (2N) + Thekkady (1N) + Houseboat (1N) + Kovalam (2N) + Kanyakumari (1N) + Madurai (1N)",
      vehicle: "Chauffeured Luxury AC Innova Crysta",
      link: "/packages/kerala-10d9n-south-india-temple-circuit",
      highlights: ["Madurai Meenakshi Temple", "Kanyakumari Cape", "Alleppey Houseboat", "Periyar Boat Safari"],
      itinerary: [
        { day: "Day 1", title: "Cochin Arrival → Heritage Tour", desc: "Pickup at Cochin Airport. Fort Kochi sightseeing & check-in." },
        { day: "Day 2", title: "Cochin to Munnar Tea Country", desc: "Drive to Munnar past Cheeyappara waterfalls." },
        { day: "Day 3", title: "Munnar Nature & Wildlife Safari", desc: "Eravikulam National Park, Nilgiri Tahr & tea gardens." },
        { day: "Day 4", title: "Munnar to Thekkady Wildlife Reserve", desc: "Periyar Lake boat safari & aromatic spice plantation walk." },
        { day: "Day 5", title: "Thekkady to Alleppey Houseboat", desc: "Private AC luxury houseboat cruise on Vembanad backwaters." },
        { day: "Day 6", title: "Alleppey to Kovalam via Jatayu Center", desc: "Jatayu Earth's Center cable car and Kovalam Lighthouse beach." },
        { day: "Day 7", title: "Kovalam to Kanyakumari", desc: "Vivekananda Rock Memorial, Thiruvalluvar Statue & sunset." },
        { day: "Day 8", title: "Kanyakumari to Madurai → Meenakshi Amman Temple", desc: "Drive to historic Madurai. Evening darshan and ceremony at Meenakshi Temple." },
        { day: "Day 9", title: "Madurai to Rameshwaram / Cochin", desc: "Ramanathaswamy Temple darshan and scenic Pamban bridge crossing." },
        { day: "Day 10", title: "Departure Transfer → Madurai / Cochin Airport", desc: "Breakfast, souvenir shopping and departure transfer." }
      ],
      inclusions: ["9 Nights Accommodations (1 Houseboat + 8 Premium Hotels)", "Private AC Innova Crysta for 10 Days", "All Houseboat Meals", "Daily Breakfast Buffets"],
      exclusions: ["Airfare / Train tickets", "Temple special darshan tickets"]
    }
  ]

  const attractions = [
    {
      id: "eravikulam-national-park",
      category: "wildlife",
      categoryName: "Wildlife & Safaris",
      title: "Eravikulam National Park (Nilgiri Tahr)",
      description: "High-altitude national park on the Western Ghats protecting the endangered Nilgiri Tahr wild mountain goat and blooming Neelakurinji flower slopes.",
      image: "/kerala/eravikulam_nilgiri_tahr.jpg",
      distance: "Munnar (15 km)",
      highlights: ["Nilgiri Tahr Safari", "Anamudi 8,842ft Peak", "Alpine Grasslands", "Neelakurinji Blooms"],
      details: {
        altitude: "7,000 feet (2,130 m)",
        bestTime: "September to January (Park closed Feb-Mar for calving)",
        overview: "Spread across 97 sq km of high-altitude shola-grassland ecosystem, Eravikulam is home to the world's largest surviving population of Nilgiri Tahr. It also hosts Anamudi (8,842 ft), the highest peak in South India.",
        experiences: [
          "Board official Eco-Safari buses climbing up the fog-covered Rajamalai mountain trail.",
          "Spot friendly wild Nilgiri Tahr goats grazing closely along mountain rock faces.",
          "Enjoy panoramic 360-degree views of rolling shola grasslands and Anamudi peak.",
          "Witness Neelakurinji blue flower blooms that carpet the hillsides once every 12 years."
        ],
        travelTips: "Online entry tickets must be booked in advance due to strict daily visitor limits enforced by forest department."
      }
    },
    {
      id: "munnar-tea-gardens",
      category: "hills",
      categoryName: "Tea Hills & Nature",
      title: "Munnar Rolling Green Tea Estates",
      description: "Rolling emerald green tea plantations, misty mountain valleys, crisp high-altitude mountain air, and colonial tea factory museums at 5,200 ft elevation.",
      image: "/kerala/munnar_tea_estates.jpg",
      distance: "Western Ghats (130 km from Cochin)",
      highlights: ["Tata Tea Museum", "Cheeyappara Waterfalls", "Lockhart Tea Estate", "Misty Peaks"],
      details: {
        altitude: "5,200 feet (1,600 m)",
        bestTime: "September to May | Pleasant 15°C Weather",
        overview: "Munnar was the favored summer resort of the British administration in South India. Surrounded by vast tea plantations established in the late 19th century, it is South India's premier hill station.",
        experiences: [
          "Stroll through endless manicured green tea carpet hills during morning mist.",
          "Visit the KDHP Tata Tea Museum to learn traditional CTC & orthodox tea processing.",
          "Photograph cascading Cheeyappara and Valara waterfalls along the scenic highway.",
          "Sample freshly brewed cardamom and ginger chai directly at estate tea counters."
        ],
        travelTips: "Carry light thermals and rain jackets. Morning hours (7:30 AM) offer the best lighting for tea garden photography."
      }
    },
    {
      id: "thekkady-periyar",
      category: "wildlife",
      categoryName: "Wildlife & Safaris",
      title: "Thekkady & Periyar Tiger Sanctuary",
      description: "Dense rainforest tiger reserve offering scenic boat safaris on Periyar Lake to spot wild elephant herds, sambar deer, gaur, and exotic birds.",
      image: "/kerala/thekkady_periyar_sanctuary.jpg",
      distance: "Thekkady / Kumily (110 km from Munnar)",
      highlights: ["Periyar Lake Boat Safari", "Wild Elephant Herds", "Cardamom Spice Walk", "Kathakali Show"],
      details: {
        altitude: "3,000 feet (900 m)",
        bestTime: "October to March | Early Morning Boat Safari",
        overview: "Periyar National Park and Tiger Reserve is one of India's premier wildlife sanctuaries. Centered around a 26 sq km artificial lake formed by the Mullaperiyar Dam, wild animals come down to the water banks to drink.",
        experiences: [
          "Take an early morning 7:30 AM boat safari across Periyar Lake to view wildlife.",
          "Spot wild elephant herds, wild boars, and bison drinking along the lake perimeter.",
          "Take a guided aromatic spice plantation walk growing cardamom, pepper, and vanilla.",
          "Attend traditional evening Kathakali dance and Kalaripayattu martial art live performances."
        ],
        travelTips: "Book 7:30 AM or 3:30 PM boat tickets online early for maximum wildlife sighting probability."
      }
    },
    {
      id: "fort-kochi",
      category: "heritage",
      categoryName: "Colonial Heritage",
      title: "Fort Kochi & Chinese Fishing Nets",
      description: "14th-century coastal heritage town blending Portuguese, Dutch, British, and Chinese influences with iconic cantilevered Chinese Fishing Nets.",
      image: "/kerala/fort_kochi_chinese_nets.jpg",
      distance: "Cochin / Kochi City",
      highlights: ["Chinese Fishing Nets", "Mattancherry Dutch Palace", "Jew Town Synagogue", "St. Francis Church"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "October to March | Sunset Golden Hour",
        overview: "Fort Kochi is a charming historic seaside enclave. traders from China, Arabia, Portugal, Holland, and Britain settled here over centuries, creating a unique melting pot of colonial architecture and art galleries.",
        experiences: [
          "Watch local fishermen operate massive 14th-century Chinese cantilevered fishing nets.",
          "Walk through Jew Town's narrow antique markets and visit 1568 Paradesi Synagogue.",
          "Tour Mattancherry Dutch Palace featuring 16th-century Ramayana mural paintings.",
          "Visit St. Francis Church, the original burial site of Portuguese explorer Vasco da Gama."
        ],
        travelTips: "Enjoy fresh seafood cooked to order at beachside stalls right after purchasing from net fishermen."
      }
    },
    {
      id: "kovalam-beach",
      category: "beaches",
      categoryName: "Coastal Beaches",
      title: "Kovalam Lighthouse Cliff Beach",
      description: "Iconic crescent beach backed by a towering 35-meter red-and-white striped lighthouse, offering shallow turquoise waves, cliffside dining, and Ayurvedic beach resorts.",
      image: "/kerala/kovalam_lighthouse_beach.jpg",
      distance: "Trivandrum (16 km)",
      highlights: ["Lighthouse Beach", "35m Vizhinjam Lighthouse", "Cliffside Dining", "Arabian Sea Sunset"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "November to March",
        overview: "Kovalam is internationally famous for its three adjacent crescent beaches—Lighthouse Beach, Hawah Beach, and Samudra Beach. The towering Vizhinjam Lighthouse offers sweeping 360-degree views of the coastline.",
        experiences: [
          "Climb the spiral staircase of Vizhinjam Lighthouse for aerial views of Kovalam coastline.",
          "Relax on soft sandy crescent beaches and swim in calm Arabian Sea waters.",
          "Dine at romantic open-air cliffside seafood restaurants illuminated by candlelights.",
          "Rejuvenate with traditional Abhyangam oil body massages at seaside Ayurvedic centers."
        ],
        travelTips: "Lighthouse observation tower is open to visitors daily between 3:00 PM and 5:00 PM."
      }
    },
    {
      id: "alleppey-houseboats",
      category: "backwaters",
      categoryName: "Backwaters & Lakes",
      title: "Alleppey Backwaters & Luxury Houseboats",
      description: "World-famous palm-fringed backwater canals, Vembanad Lake & private AC houseboats equipped with personal chef and butler service.",
      image: "/kerala/alleppey_backwaters_houseboat.jpg",
      distance: "Alleppey Jetty",
      highlights: ["Private AC Houseboat", "Vembanad Lake", "Paddy Field Canals", "Karimeen Fish Dinner"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "September to March | Year-Round Houseboat Cruises",
        overview: "Known as the 'Venice of the East', Alleppey (Alappuzha) is famous for its intricate network of tranquil backwater canals, lagoons, and emerald paddy fields. Sailing on a traditional Kettuvallam (houseboat) is Kerala's signature travel experience.",
        experiences: [
          "Cruise through narrow palm-fringed canals on a private air-conditioned luxury houseboat.",
          "Savor authentic Kerala meals cooked fresh onboard by your personal chef.",
          "Witness picturesque rural backwater life, duck farming, and coconut harvesting.",
          "Enjoy golden hour sunsets over Vembanad Lake from your private open-deck loungers."
        ],
        travelTips: "Houseboat check-in is at 12:00 PM and checkout is at 9:00 AM. AC operates continuously from 9:00 PM to 6:00 AM."
      }
    },
    {
      id: "jatayu-earth-center",
      category: "heritage",
      categoryName: "Monuments & Adventure",
      title: "Jatayu Earth's Center & Cable Car Adventure",
      description: "World's largest bird sculpture (200 ft long) resting atop a 1,000 ft hill in Chadayamangalam, featuring state-of-the-art ropeway cable cars and rock adventure park.",
      image: "/kerala/jatayu_earth_center.jpg",
      distance: "Kollam / Chadayamangalam (50 km from Trivandrum)",
      highlights: ["World's Largest Bird Sculpture", "Scenic Hilltop Cable Car", "6D Mythological Theatre", "Rock Adventure Center"],
      details: {
        altitude: "1,000 feet (305 m)",
        bestTime: "October to April | Morning & Sunset",
        overview: "Jatayu Earth's Center is a unique tourism project symbolizing women's safety and honor, built around the mythical demi-god Jatayu from the Ramayana. The colossal sculpture is 200 feet long, 150 feet wide, and 70 feet tall.",
        experiences: [
          "Glide over green rocky hills in modern Swiss cable car gondolas up to the summit.",
          "Explore the museum and multi-dimensional audio-visual theatre housed inside the bird sculpture.",
          "Try adventure activities including rock climbing, rappelling, archery, paintball, and valley crossing.",
          "Photograph the mythical giant bird silhouette framed against the vast Kerala countryside."
        ],
        travelTips: "Book cable car and entry passes in advance to avoid weekend queues."
      }
    },
    {
      id: "vagamon-pine-forest",
      category: "hills",
      categoryName: "Tea Hills & Adventure",
      title: "Vagamon Pine Forests & Glass Skywalk Bridge",
      description: "Enchanting hill station at 3,600 ft featuring dense pine forests, India's longest cantilever glass bridge, paragliding slopes, and misty green tea meadows.",
      image: "/kerala/vagamon_pine_forest.jpg",
      distance: "Idukki Hills (100 km from Cochin)",
      highlights: ["Pine Forest Trails", "Cantilever Glass Skywalk", "Tandem Paragliding", "Misty Kurisumala Meadows"],
      details: {
        altitude: "3,600 feet (1,100 m)",
        bestTime: "September to May",
        overview: "Vagamon is an offbeat green paradise in the Western Ghats untouched by commercial rush. It features tall towering British-planted pine woods, rolling Kurisumala hills, and the newly built thrilling glass cantilever bridge.",
        experiences: [
          "Walk through the serene, towering shade of the historic British Pine Forest valley.",
          "Step onto the thrilling glass cantilever skywalk extended out over the sheer mountain drop.",
          "Experience tandem paragliding flights over green rolling hill ranges during flying season.",
          "Visit Vagamon Lake for peaceful pedal boating surrounded by rolling tea gardens."
        ],
        travelTips: "Vagamon makes an ideal scenic addition when traveling between Munnar and Thekkady."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "kl-faq-1", question: "What is included in the Alleppey private houseboat stay?", answer: "All packages feature 1 night stay in a private AC luxury houseboat with full-board meals (traditional Kerala lunch, afternoon tea/snacks, Karimeen fish dinner, and breakfast)." },
    { id: "kl-faq-2", question: "What is the best time of year to visit Kerala backwaters?", answer: "September to March offers cool, pleasant weather ideal for backwater houseboats, Munnar tea hills & beaches. Monsoons (June to August) are renowned for Ayurvedic wellness." },
    { id: "kl-faq-3", question: "Can we get vegetarian and Jain meals in Kerala packages?", answer: "Yes! Traditional Kerala Sadya is 100% vegetarian served on banana leaves. All resorts and houseboats offer pure vegetarian & Jain food upon request." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Kerala Backwaters & Houseboat", item: "/packages/kerala-backwaters" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Kerala Backwaters & Houseboat Sanctuary Packages 2026",
    description: "Book top-rated Kerala holiday packages with GhumoFiroo. Includes Alleppey private AC houseboat cruise, Munnar tea gardens, Eravikulam National Park & Thekkady spice safari.",
    url: config.baseUrl + "/packages/kerala-backwaters",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    duration: "P6D",
    itinerary: [
      { position: 1, name: "Fort Kochi & Munnar Tea Hills", description: "Chinese fishing nets & scenic drive past Cheeyappara waterfalls." },
      { position: 2, name: "Munnar Wildlife & Tea Museum", description: "Eravikulam National Park Nilgiri Tahr safari & Tata Tea Museum." },
      { position: 3, name: "Alleppey Houseboat Backwater Cruise", description: "Private AC luxury houseboat cruise on Vembanad Lake." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "18500",
      includes: "Private AC houseboat, 4-star hill resorts, all houseboat meals, breakfast & dinner, private AC vehicle"
    },
    aggregateRating: {
      ratingValue: 4.9,
      reviewCount: 1680
    }
  })

  return (
    <Layout>
      <SEO 
        title="Kerala Tour Packages 2026 | God's Own Country, Munnar, Houseboats & Beaches"
        description="Book top-rated Kerala tour packages from India. Private AC Alleppey backwater houseboats, Munnar tea estates, Eravikulam Nilgiri Tahr safari, Thekkady spice walks, Varkala cliff & Kovalam beach resorts."
        keywords="Kerala tour packages 2026, Kerala houseboat booking, Munnar tour packages, Alleppey backwaters, Thekkady Periyar safari, Kovalam beach resort, Jatayu Earth Center, Kerala family vacation price"
        canonicalUrl={config.baseUrl + "/packages/kerala"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="/kerala/alleppey_backwaters_houseboat.jpg" 
              alt="Kerala Backwaters Alleppey Houseboat" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KERALA_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                God's Own Country Collection 2026
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Kerala Paradise Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Munnar misty tea hills, Alleppey private AC backwater houseboats, Periyar wildlife boat safari, Varkala cliffs, Kovalam lighthouse & Kanyakumari cape.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Kerala Packages <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-6 rounded-full bg-black/40 border-white/20 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 backdrop-blur-md"
                onClick={() => document.getElementById("highlights-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                View 8 Sightseeing Highlights <Compass className="ml-2 h-4 w-4 text-[#C9A25A]" />
              </Button>
            </div>

            {/* QUICK STATS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 w-full max-w-3xl">
              {[
                { label: "Guest Rating", val: "4.98 ★", sub: "2,450+ Travelers" },
                { label: "Private Houseboat", val: "100% Private AC", sub: "Personal Chef Onboard" },
                { label: "Hill & Beach Resorts", val: "4-Star Deluxe", sub: "Munnar & Kovalam" },
                { label: "Private AC Cabs", val: "100% Chauffeured", sub: "Sedan / Ertiga / Innova" }
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
            kicker="Curated Itineraries" 
            title="Select Your Kerala Tour Package" 
            subtitle="Choose from express 3-day Munnar breaks, 4-day houseboat specials, 5-day best sellers, 6-day Kovalam beach circuits, or grand 7 to 10-day South India journeys." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {keralaPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KERALA_IMG }}
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
                        <span className="text-slate-400 font-normal">Private Tour</span>
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
              title="Kerala Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Kerala itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All 8 Highlights" },
                { key: "backwaters", label: "Backwaters & Houseboats" },
                { key: "hills", label: "Tea Hills & Adventure" },
                { key: "wildlife", label: "Wildlife & Safaris" },
                { key: "heritage", label: "Heritage & Monuments" },
                { key: "beaches", label: "Coastal Beaches" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KERALA_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KERALA_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes private AC houseboat & hill resort stays</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹18,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Kerala Travel FAQ" subtitle="Important details regarding private houseboats, meal plans & airport transfers." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Kerala Backwaters Collection"
          priceText="From ₹18,500"
          priceSubtext="Private AC Houseboat & Munnar Resort Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Kerala%20Backwaters%205D4N&price=22800")}
        />
      </div>
    </Layout>
  )
}

export default KeralaBackwaters