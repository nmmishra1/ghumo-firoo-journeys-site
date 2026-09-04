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
  Eye, Car, ChevronRight, Moon, Flame, Map, Bus, Footprints, Award, FileText, CheckCheck, SlidersHorizontal, Download
} from "lucide-react"

const RannUtsav: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_RANN_IMG = "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Rann Utsav', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const rannPackages = [
    {
      id: "rann-utsav-2d1n",
      title: "Rann Utsav 2D/1N Express Overnight Tent City",
      desc: "Ideal quick weekend escape featuring 1 night in AC Deluxe Swiss Tents at Tent City Dhordo, White Desert sunset & Kutchi Garba stage.",
      badge: "Express Weekend",
      image: "/brochure-assets/camel_safari.jpg",
      price: 12500,
      duration: "2 Days / 1 Night",
      rating: 4.90,
      reviewsCount: 310,
      stay: "Tent City Dhordo / Evoke Resorts AC Deluxe Tent (1N)",
      vehicle: "Chauffeured Private AC Sedan / Golf Cart Shuttles",
      link: "/packages/rann-utsav-2d1n",
      highlights: ["Evoke Partner Voucher", "White Rann Sunset Walk", "Kutchi Folk Garba Night", "Bhuj Station Transfers"],
      itinerary: [
        { day: "Day 1", title: "Bhuj Pickup → Tent City Dhordo Check-in & Cultural Night", desc: "Pickup from Bhuj Railway Station / Airport. Traditional welcome at Tent City Dhordo. Evening sunset camel cart walk over white salt desert & live Garba." },
        { day: "Day 2", title: "Sunrise at White Rann → Bhuj Heritage Tour & Departure", desc: "Early morning sunrise walk over salt flat. Check-out and visit Aina Mahal & Swaminarayan Temple in Bhuj before return drop-off." }
      ],
      inclusions: ["1 Night AC Deluxe Swiss Tent Stay", "All 3 Daily Buffet Meals (Pure Veg Gujarati & Kutchi)", "White Rann Entry Permits", "Bhuj Airport/Station Roundtrip Transfers"],
      exclusions: ["Train / Flight tickets to Bhuj"]
    },
    {
      id: "rann-utsav-3d2n",
      title: "Rann Utsav Express Tent City Retreat (3D/2N)",
      desc: "Our most popular Rann Utsav package featuring 2 nights in AC Deluxe Swiss Tents at Tent City Dhordo, Kalo Dungar Black Hill & Gandhi Nu Gam.",
      badge: "Evoke Partner Best Seller",
      image: "/brochure-assets/gala_dinner.jpg",
      price: 18500,
      duration: "3 Days / 2 Nights",
      rating: 4.95,
      reviewsCount: 780,
      stay: "Tent City Dhordo / Evoke Resorts AC Deluxe Swiss Tent (2N)",
      vehicle: "Chauffeured Private AC Sedan / SUV",
      link: "/packages/rann-utsav-3d2n",
      highlights: ["Official Evoke Partner Voucher", "Tent City Dhordo Stay", "Kalo Dungar Black Hill", "Bhuj Airport Transfers"],
      itinerary: [
        { day: "Day 1", title: "Bhuj Pickup → Tent City Dhordo Check-in & Sunset", desc: "Pickup from Bhuj. Traditional welcome at Tent City Dhordo. Evening sunset camel cart walk & live Kutchi Garba stage." },
        { day: "Day 2", title: "Kalo Dungar (Black Hill) & Gandhi Nu Gam Craft Village", desc: "Sunrise over White Rann. Excursion to Kalo Dungar (highest point in Kutch) & artisan handicraft shopping at Gandhi Nu Gam." },
        { day: "Day 3", title: "Bhuj Heritage Sightseeing & Return Drop-off", desc: "Check-out from Tent City. Tour Aina Mahal, Prag Mahal, Swaminarayan Temple in Bhuj and transfer to Bhuj Airport/Station." }
      ],
      inclusions: ["2 Nights AC Deluxe Swiss Tent Stay", "All 3 Daily Meals (Pure Veg Gujarati & Kutchi Buffet)", "White Rann Entry Permits", "Bhuj Airport/Station Roundtrip Transfers"],
      exclusions: ["Train / Flight tickets to Bhuj", "ATV rides & personal shopping"]
    },
    {
      id: "rann-utsav-4d3n",
      title: "Grand Rann & Road to Heaven Dholavira Circuit (4D/3N)",
      desc: "Comprehensive Kutch exploration adding the breathtaking 30km Road to Heaven ocean salt highway & 5,000-year-old Dholavira UNESCO site.",
      badge: "Road to Heaven Special",
      image: "/rann_utsav_road_to_heaven.jpg",
      price: 24500,
      duration: "4 Days / 3 Nights",
      rating: 4.98,
      reviewsCount: 940,
      stay: "Tent City Dhordo (2N) + Dholavira / Bhuj Heritage Resort (1N)",
      vehicle: "Chauffeured Private AC SUV",
      link: "/packages/rann-utsav-4d3n",
      highlights: ["30km Road to Heaven Highway", "Dholavira UNESCO Harappan Ruins", "Full Moon White Rann", "Mandvi Beach Sunset"],
      itinerary: [
        { day: "Day 1", title: "Bhuj Pickup → Tent City Dhordo Welcome", desc: "Private pickup from Bhuj, transfer to Tent City Dhordo, White Desert sunset & folk performance." },
        { day: "Day 2", title: "Road to Heaven Highway Drive & Dholavira UNESCO Site", desc: "Drive along 30km scenic turquoise salt sea Road to Heaven. Tour ancient 5,000-year Harappan citadel and fossil park." },
        { day: "Day 3", title: "Kalo Dungar & Mandvi Beach Windmills", desc: "Visit Kalo Dungar Black Hill, Vijay Vilas Palace in Mandvi, and sunset camel rides on Mandvi beach." },
        { day: "Day 4", title: "Bhujodi Craft Village Shopping & Departure", desc: "Tour Bhujodi weaving village, Aina Mahal Hall of Mirrors, and drop-off at Bhuj station/airport." }
      ],
      inclusions: ["3 Nights Accommodation (2 Nights Tent City + 1 Night Resort)", "Road to Heaven & Dholavira SUV Excursion", "All Meals & White Rann Permits", "Bhuj Airport/Station Transfers"],
      exclusions: ["Train / Flight tickets to Bhuj"]
    },
    {
      id: "rann-utsav-5d4n",
      title: "Complete Kutch Odyssey & Beach Resort Escape (5D/4N)",
      desc: "The ultimate Kutch expedition covering Tent City Dhordo, Road to Heaven, Dholavira, Kalo Dungar, Mandvi Beach & Lakhpat Fort.",
      badge: "Ultimate Kutch Tour",
      image: "/Mandvi Beach_Kutch.png",
      price: 29500,
      duration: "5 Days / 4 Nights",
      rating: 4.99,
      reviewsCount: 430,
      stay: "Tent City Dhordo (2N) + Mandvi Beach Resort (1N) + Bhuj Heritage Hotel (1N)",
      vehicle: "Chauffeured Private AC Innova / SUV",
      link: "/packages/rann-utsav-5d4n",
      highlights: ["Tent City Dhordo", "Road to Heaven Highway", "Mandvi Royal Private Beach", "Lakhpat Walled Fort & Mata no Madh"],
      itinerary: [
        { day: "Day 1", title: "Bhuj Pickup → Tent City Dhordo Check-in & Garba", desc: "Arrival in Bhuj, transfer to Tent City Dhordo, White Rann camel cart sunset & cultural night." },
        { day: "Day 2", title: "Road to Heaven & Dholavira Harappan Ruins", desc: "Drive 30km ocean salt highway to Dholavira UNESCO archaeological site and wood fossil park." },
        { day: "Day 3", title: "Kalo Dungar Black Hill → Mandvi Beach Resort", desc: "Visit Kalo Dungar Dattatreya Temple, drive to Mandvi, check-in to beach resort & Vijay Vilas Palace." },
        { day: "Day 4", title: "Lakhpat Walled Fort & Mata no Madh Pilgrimage", desc: "Excursion to ancient Lakhpat Fort overlooking Rann & Mata no Madh Ashapura temple." },
        { day: "Day 5", title: "Bhujodi Craft Village Weaving & Bhuj Departure", desc: "Shop Bandhani sarees at Bhujodi, tour Prag Mahal clock tower and return drop-off at Bhuj airport." }
      ],
      inclusions: ["4 Nights Luxury Stay (2N Tent City + 1N Beach Resort + 1N Heritage Hotel)", "Private SUV Chauffeured Vehicle", "All 3 Daily Buffet Meals & Border Permits", "Full Kutch Sightseeing"],
      exclusions: ["Flight/Train tickets"]
    },
    {
      id: "rann-utsav-full-moon",
      title: "Rann Utsav Full Moon (Purnima) Special Package (3D/2N)",
      desc: "Curated specifically for full moon dates when the white desert glows vibrant blue under the night sky with priority Tent City allotment.",
      badge: "Full Moon Purnima Special",
      image: "/brochure-assets/stargazing.jpg",
      price: 21500,
      duration: "3 Days / 2 Nights",
      rating: 4.97,
      reviewsCount: 560,
      stay: "Evoke Tent City Dhordo Premium AC Swiss Tent (2N)",
      vehicle: "Chauffeured Private AC Vehicle",
      link: "/packages/rann-utsav-3d2n",
      highlights: ["Full Moon Desert Blue Glow", "Guaranteed Premium Tent", "Late Night Desert Stargazing", "Folk Garba Stage"],
      itinerary: [
        { day: "Day 1", title: "Bhuj Pickup → Tent City Check-in & Full Moon Sunset", desc: "Transfer to Tent City. Evening walk on White Desert to witness sunset & late night full moon blue desert glow." },
        { day: "Day 2", title: "Kalo Dungar Peak & Full Moon Star Party", desc: "Visit Kalo Dungar Black Hill, return for special midnight folk music performance under full moon." },
        { day: "Day 3", title: "Bhujodi Craft Shopping & Departure", desc: "Tour Bhujodi weaving village & drop-off at Bhuj Airport/Station." }
      ],
      inclusions: ["2 Nights Premium AC Swiss Tent", "All Meals & White Rann Permits", "Bhuj Transfers"],
      exclusions: ["Personal expenses"]
    },
    {
      id: "rann-utsav-customizer",
      title: "Interactive Rann Utsav Live Rate Calculator & Customizer",
      desc: "Build your customized Tent City & cab package with real-time rate card calculation, custom dates, and tent category selections.",
      badge: "Interactive Customizer",
      image: "/brochure-assets/palace_legacy.jpg",
      price: 15999,
      duration: "Custom Days & Tents",
      rating: 4.96,
      reviewsCount: 680,
      stay: "Customizable Tent City / Resort Category",
      vehicle: "Sedan / SUV / Tempo Traveller Options",
      link: "/packages/rann-utsav-tent",
      highlights: ["Live Pricing Calculation Engine", "Select 1N/2N/3N/4N Slabs", "Instant Voucher Quote", "Evoke Terms & Policy"],
      itinerary: [
        { day: "Flexible", title: "Customized Itinerary Selection", desc: "Choose your preferred dates, tent categories, and private vehicle options with instant backend calculation." }
      ],
      inclusions: ["Custom Meal Plans & Permits", "Private Vehicle of Choice"],
      exclusions: ["Optional activities"]
    }
  ]

  const attractions = [
    {
      id: "white-rann",
      category: "desert",
      categoryName: "White Desert & Salt",
      title: "Great White Rann of Kutch",
      description: "Vast 7,500 sq km white salt marsh desert that turns bright blue under full moon nights and glows warm gold during sunsets.",
      image: "/brochure-assets/camel_safari.jpg",
      distance: "Dhordo (80 km from Bhuj)",
      highlights: ["Full Moon Blue Glow", "Camel Cart Sunset Walk", "Cultural Stage Garba", "Golf Cart Access"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "November to March | Full Moon Nights & Sunset Hours 5:30 PM",
        overview: "The Great Rann of Kutch is one of the world's largest salt deserts. During monsoon, it submerges in sea waters, drying up by November into an endless white crust of pure salt crystal fields.",
        experiences: [
          "Take a decorated traditional Kutchi camel cart ride into the deep white salt flat.",
          "Walk barefoot on crispy white salt crystals as the sun sets over the horizon.",
          "Witness the rare phenomenon of the salt desert glowing vibrant blue under full moon nights.",
          "Enjoy live Kutchi folk music and Garba dance under open starry night skies."
        ],
        travelTips: "Official White Rann entry permits are pre-arranged by GhumoFiroo and included in all packages."
      }
    },
    {
      id: "road-to-heaven",
      category: "desert",
      categoryName: "White Desert & Salt",
      title: "Road to Heaven (Khadir Bet Highway)",
      description: "Iconic 30km straight road cutting directly through turquoise salt waters of the Great Rann connecting Khavda to Dholavira.",
      image: "/rann_utsav_road_to_heaven.jpg",
      distance: "Khadir Bet (130 km from Bhuj)",
      highlights: ["30km Ocean Salt Highway", "Photographer Paradise", "Turquoise Waters", "Flamingo Sightings"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "November to March | Morning Hours 10:00 AM",
        overview: "The 'Road to Heaven' is widely regarded as India's most scenic desert highway. Flanked on both sides by shimmering turquoise sea waters and white salt flats, it feels like driving across an endless ocean mirror.",
        experiences: [
          "Drive along the 30km uninterrupted straight highway surrounded by sea and salt flats.",
          "Capture viral photography and drone shots of your car on the narrow salt embankment.",
          "Spot migratory pink flamingos and migratory birds feeding in shallow salt waters.",
          "Continue straight to the 5,000-year-old Dholavira UNESCO Harappan archaeological site."
        ],
        travelTips: "GhumoFiroo provides dedicated SUV drivers who know the best photography stopping points along the highway."
      }
    },
    {
      id: "dholavira-harappan",
      category: "heritage",
      categoryName: "Heritage & Palaces",
      title: "Dholavira UNESCO World Heritage Site",
      description: "Ancient 5,000-year-old Indus Valley / Harappan civilization metropolis featuring sophisticated stone water reservoirs and stepwells.",
      image: "/brochure-assets/dholavira.jpg",
      distance: "Dholavira Island",
      highlights: ["5,000-Year Ancient Citadel", "World's First Water Reservoirs", "Harappan Signboard", "Wood Fossil Park"],
      details: {
        altitude: "30 feet (10 m)",
        bestTime: "November to March | Morning 9:00 AM",
        overview: "Dholavira is a UNESCO World Heritage site representing one of the most prominent cities of the Harappan civilization (3000-1500 BC). It features sophisticated urban planning, massive stone fortifications, and complex water conservation reservoirs.",
        experiences: [
          "Walk through the 5,000-year-old stone citadel, lower town, and ceremonial ground.",
          "Examine the world's oldest stone water reservoir systems cut into rock ground.",
          "See ancient Harappan pottery, beads, copper seals, and the famous 10-symbol signboard at the site museum.",
          "Visit the nearby Wood Fossil Park featuring 180-million-year-old petrified tree trunks."
        ],
        travelTips: "Qualified ASI local guides are provided by GhumoFiroo to explain historical civil engineering marvels."
      }
    },
    {
      id: "tent-city-dhordo",
      category: "heritage",
      categoryName: "Heritage & Palaces",
      title: "Tent City Dhordo & Craft Bazaar",
      description: "Luxury pop-up city spread across 500,000 sq meters offering 350+ AC Swiss Tents, adventure sports, spa, and live Kutchi folk stage.",
      image: "/brochure-assets/gala_dinner.jpg",
      distance: "Dhordo Base",
      highlights: ["350+ AC Deluxe Swiss Tents", "Live Folk Dance Stage", "Kutchi Craft Haat", "Paramotoring & ATV Sports"],
      details: {
        altitude: "Sea Level",
        bestTime: "November to March",
        overview: "Tent City Dhordo is the official festival village erected annually for Rann Utsav. Operated by Praveg / Evoke, it offers 5-star hospitality, pure vegetarian dining halls, internal golf cart transport, and nightly artisan craft markets.",
        experiences: [
          "Stay in air-conditioned Swiss Tents equipped with wooden flooring and en-suite modern bathrooms.",
          "Shop for authentic Bandhani tie-dye sarees, Ajrakh block-print dupattas, and copper bells at the Craft Haat.",
          "Watch nightly performances by Siddi Dhamal dancers, Langa singers, and Garha artists.",
          "Experience aerial paramotoring over the white desert landscape."
        ],
        travelTips: "All GhumoFiroo Tent City bookings include 3 daily buffet meals and White Rann permits."
      }
    },
    {
      id: "kalo-dungar",
      category: "heritage",
      categoryName: "Heritage & Palaces",
      title: "Kalo Dungar (Black Hill 1,525 ft)",
      description: "Highest point in Kutch offering a panoramic view of the Great Rann salt desert meeting the horizon, home to 400-year-old Dattatreya Temple.",
      image: "/kalodungar.jpg",
      distance: "Khavda (25 km from Dhordo)",
      highlights: ["1,525 ft Highest Kutch Peak", "400-Year Dattatreya Temple", "Magnetic Hill Phenomenon", "Jackal Feeding Ritual"],
      details: {
        altitude: "465 meters (1,525 ft)",
        bestTime: "November to March | Sunset Hours 5:00 PM",
        overview: "Kalo Dungar is the highest peak in Kutch. From the summit observatory, the vast White Rann looks like an endless frozen ocean. Legend has it that Lord Dattatreya rested here and fed wild jackals.",
        experiences: [
          "Enjoy panoramic sunset views of the white desert stretching to the Indo-Pak border.",
          "Visit the 400-year-old Lord Dattatreya Temple where wild jackals are fed prasad daily after afternoon Aarti.",
          "Test the 'Magnetic Hill' phenomenon along the Kalo Dungar downhill road where vehicles roll uphill.",
          "Buy authentic Kutchi embroidery and copper bells from local village stalls."
        ],
        travelTips: "Best visited during late afternoon to catch the sunset over the salt marsh expanse."
      }
    },
    {
      id: "vijay-vilas-palace",
      category: "coastal",
      categoryName: "Coastal & Forts",
      title: "Vijay Vilas Palace Mandvi",
      description: "Grand 1929 Rajput royal palace built of red sandstone featuring private beach, dome gazebos, and famous Bollywood movie filming locations.",
      image: "/vijay_vilas_palace_mandvi.jpg",
      distance: "Mandvi (60 km from Bhuj)",
      highlights: ["1929 Rajput Architecture", "Private Royal Beach", "Bollywood Movie Location", "Windmill Coast"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "Year-Round | Sunset Hours 5:00 PM",
        overview: "Vijay Vilas Palace was built as a summer resort for Maharao Shri Khengarji III of Kutch. Built in Rajput style with red sandstone, central high dome, and carved jali screens, it overlooks private Arabian Sea beaches.",
        experiences: [
          "Explore the grand royal interior rooms, vintage cars, and rooftop dome view over the estate forest.",
          "Walk along the private royal beach where scenes from 'Hum Dil De Chuke Sanam' were filmed.",
          "Ride camels and enjoy watersports on Mandvi Beach flanked by giant wind turbines.",
          "Sample authentic Kutchi Dabeli and fresh coconut water along Mandvi coastline."
        ],
        travelTips: "Rooftop access provides 360-degree views of the palace gardens meeting the Arabian Sea."
      }
    },
    {
      id: "mandvi-beach",
      category: "coastal",
      categoryName: "Coastal & Forts",
      title: "Mandvi Windmill Beach & Dhow Shipbuilding Yard",
      description: "Pristine Arabian Sea beach lined with giant wind turbines, water sports, and 400-year-old hand-carved wooden ship building docks.",
      image: "/Mandvi Beach_Kutch.png",
      distance: "Mandvi Coast",
      highlights: ["Giant Wind Turbine Coast", "400-Year Wooden Ship Yard", "Camel & Horse Rides", "Water Sports"],
      details: {
        altitude: "Sea Level",
        bestTime: "Year-Round | Sunset 5:30 PM",
        overview: "Mandvi Beach is one of Gujarat's finest coastlines. Known for Asia's first windmill beach project, it also features traditional Salaya wooden dhow shipbuilding docks operating since the 16th century.",
        experiences: [
          "Walk along clean sandy shores surrounded by towering white wind turbines.",
          "Witness master craftsmen shaping giant wooden ocean trading vessels using hand tools.",
          "Enjoy quad biking, jet skis, and camel rides at Mandvi beach promenade."
        ],
        travelTips: "Try famous Kutchi Dabeli at Mandvi market."
      }
    },
    {
      id: "bhujodi-craft-village",
      category: "heritage",
      categoryName: "Heritage & Palaces",
      title: "Bhujodi Textile Craft Village & Vankar Weavers",
      description: "Famous textile artisan village known for Vankar shawl weavers, Ajrakh block printing, and Hira Laxmi Craft Park.",
      image: "/brochure-assets/handicrafts.jpg",
      distance: "Bhuj Town (8 km)",
      highlights: ["Vankar Shawl Weaving", "Ajrakh Block Print", "Copper Bell Artisans", "Hira Laxmi Craft Park"],
      details: {
        altitude: "110 meters",
        bestTime: "Year-Round | Daytime Visit",
        overview: "Bhujodi is Kutch's master textile center where Vankar weavers create hand-woven wool shawls, carpets, and stoles using traditional wooden looms.",
        experiences: [
          "Watch master weavers operate traditional handlooms at Hira Laxmi Craft Park.",
          "Buy authentic Bandhani tie-dye sarees directly from local artisan homes."
        ],
        travelTips: "Ideal stopover on your arrival or departure day in Bhuj."
      }
    },
    {
      id: "aina-mahal-bhuj",
      category: "heritage",
      categoryName: "Heritage & Palaces",
      title: "Aina Mahal & Prag Mahal Clock Tower",
      description: "18th-century Venetian glass 'Palace of Mirrors' built by Ram Singh Malam paired with Prag Mahal's 45m Gothic clock tower.",
      image: "/brochure-assets/palace_legacy.jpg",
      distance: "Bhuj City Center",
      highlights: ["Venetian Glass Mirrors", "45m Clock Tower", "Hall of Mirrors Fountain", "Historical Armoury"],
      details: {
        altitude: "110 meters",
        bestTime: "Year-Round",
        overview: "Aina Mahal ('Palace of Mirrors') was built in 1752 for Maharao Lakhpatji with white marble, Venetian glass chandeliers, and mirror-work walls.",
        experiences: [
          "Explore the pleasure hall surrounded by marble fountains and glass chandeliers.",
          "Climb Prag Mahal's 45m Gothic clock tower for panoramic city views."
        ],
        travelTips: "Located next to Hamirsar Lake in central Bhuj."
      }
    },
    {
      id: "smritivan-memorial",
      category: "heritage",
      categoryName: "Heritage & Palaces",
      title: "Smritivan Earthquake Memorial & Museum",
      description: "Spectacular 170-acre architectural memorial and interactive earthquake museum atop Bhujiyo Dungar hill in Bhuj.",
      image: "/brochure-assets/smritivan.jpg",
      distance: "Bhujiyo Dungar (Bhuj)",
      highlights: ["170-Acre Hilltop Memorial", "50 Check-Dam Reservoirs", "Simulator Theatre", "Panoramic Hill View"],
      details: {
        altitude: "150 meters",
        bestTime: "Year-Round (Closed on Mondays)",
        overview: "Smritivan is an internationally acclaimed memorial dedicated to the victims of the 2001 Gujarat earthquake. It features 50 check-dam reservoirs, over 300,000 trees, and a world-class experiential museum.",
        experiences: [
          "Walk through the state-of-the-art museum galleries detailing Kutch's seismic resilience.",
          "Experience the 360-degree earthquake simulation theater.",
          "Enjoy sweeping panoramic views of Bhuj city and Bhujiyo Fort from the hilltop vantage points."
        ],
        travelTips: "Included in all 1N, 2N, 3N and 4N Ghumo Firoo Kutch itineraries."
      }
    },
    {
      id: "lakhpat-fort",
      category: "coastal",
      categoryName: "Coastal & Forts",
      title: "Lakhpat Walled Fort & Gurudwara Sahib",
      description: "Ancient 18th-century 7km stone fort wall overlooking the Great Rann, home to UNESCO-awarded Lakhpat Gurudwara Sahib.",
      image: "/lakhpat_fort_kutch.jpg",
      distance: "Lakhpat (135 km from Bhuj)",
      highlights: ["7km Stone Fort Wall", "UNESCO Awarded Gurudwara", "Ghost Town Ruins", "Rann Overlook"],
      details: {
        altitude: "30 meters",
        bestTime: "November to March",
        overview: "Lakhpat was once a bustling port city where daily sea trade revenues exceeded one lakh Kori coins. After the 1819 earthquake shifted the Indus river stream, it became a quiet historic walled fort town.",
        experiences: [
          "Walk atop the massive 7km stone fort ramparts looking out over the Rann marsh.",
          "Visit Lakhpat Gurudwara Sahib where Guru Nanak Dev Ji stayed during his journey to Mecca."
        ],
        travelTips: "Experience peaceful langar meals at Lakhpat Gurudwara."
      }
    },
    {
      id: "mata-no-madh",
      category: "heritage",
      categoryName: "Heritage & Palaces",
      title: "Mata no Madh (Ashapura Temple)",
      description: "Revered 14th-century temple dedicated to Goddess Ashapura, the kuldevi (patron deity) of the Jadeja rulers of Kutch.",
      image: "/mata_no_madh_ashapura_temple.jpg",
      distance: "Nakhatrana (80 km from Bhuj)",
      highlights: ["Patron Deity of Kutch", "14th-Century Temple", "Navratri Pilgrimage", "Sacred Prasad"],
      details: {
        altitude: "120 meters",
        bestTime: "Year-Round",
        overview: "Mata no Madh is one of the most sacred pilgrimage shrines in Gujarat. Millions of devotees walk on foot to seek blessings of Maa Ashapura.",
        experiences: [
          "Participate in the morning or evening Aarti.",
          "Receive sacred divine prasad."
        ],
        travelTips: "Easily combined with Kalo Dungar or Lakhpat Fort."
      }
    },
    {
      id: "koteshwar-mahadev",
      category: "coastal",
      categoryName: "Coastal & Forts",
      title: "Koteshwar Mahadev Temple & Narayan Sarovar",
      description: "Ancient Lord Shiva temple standing right on the Arabian Sea cliff at India's westernmost geographic boundary.",
      image: "/koteshwar_mahadev_temple.jpg",
      distance: "Westernmost Tip (150 km from Bhuj)",
      highlights: ["Westernmost Tip of India", "Arabian Sea Cliff Temple", "Narayan Sarovar Sacred Lake", "Sunset Over Ocean"],
      details: {
        altitude: "Sea Level",
        bestTime: "November to March | Sunset 5:45 PM",
        overview: "Koteshwar Mahadev is the last outpost of India in the west. Standing on a high rock cliff directly above Arabian Sea waves, legend links it to Ravana's Shivlinga.",
        experiences: [
          "Watch the sun sink into the Arabian Sea waters from the temple cliff.",
          "Visit Narayan Sarovar, one of the 5 sacred lakes of Hindu theology."
        ],
        travelTips: "Breathtaking ocean sunset spot."
      }
    }
  ]

  const fullMoonDates = [
    { month: "November 2026", date: "24th Nov - 26th Nov 2026", note: "Opening Full Moon Night — High Demand" },
    { month: "December 2026", date: "23rd Dec - 25th Dec 2026", note: "Christmas Full Moon — Cold Crisp Night" },
    { month: "January 2027", date: "22nd Jan - 24th Jan 2027", note: "Kite Festival (Uttrayan) + Full Moon" },
    { month: "February 2027", date: "20th Feb - 22nd Feb 2027", note: "Spring Full Moon — Ideal Weather" },
    { month: "March 2027", date: "5th Mar - 7th Mar 2027", note: "Season Closing Full Moon — Sunset Glow" }
  ]

  const adventureActivities = [
    { title: "Royal Legacy of Kutch", image: "/brochure-assets/palace_legacy.jpg", tag: "Heritage Palaces", desc: "Italian Gothic Prag Mahal & 18th-century Aina Mahal Hall of Mirrors." },
    { title: "Road to Heaven", image: "/rann_utsav_road_to_heaven.jpg", tag: "Ocean Salt Highway", desc: "30km uninterrupted straight highway cutting across turquoise salt waters." },
    { title: "Smritivan Museum & Viewpoint", image: "/brochure-assets/smritivan.jpg", tag: "Memorial Architecture", desc: "170-acre world-class hilltop memorial & earthquake museum in Bhuj." },
    { title: "Explore the Threads of Kutch", image: "/brochure-assets/handicrafts.jpg", tag: "Artisan Crafts", desc: "Master artisans hand-crafting Rogan art, Bandhani tie-dye & Ajrakh prints." },
    { title: "Paramotoring & Gliding", image: "/brochure-assets/paramotoring.jpg", tag: "Aerial Thrill", desc: "Soar over vast gleaming white salt desert flats during sunset." },
    { title: "Hidden Valleys of Kutch", image: "/brochure-assets/hidden_valleys.jpg", tag: "Salt Canyon Vistas", desc: "Rugged ancient rocky valleys & salt fossil viewpoints in Kutch." },
    { title: "Luxury Spa & Wellness", image: "/brochure-assets/spa_wellness.jpg", tag: "Desert Rejuvenation", desc: "Ayurvedic spa, aroma therapy & wellness pavilions at Tent City." },
    { title: "Rann Sky Watch & Stargazing", image: "/brochure-assets/stargazing.jpg", tag: "Milky Way Astronomy", desc: "Clear desert night sky telescope stargazing under the Milky Way." },
    { title: "Rann Riders & ATV Safari", image: "/brochure-assets/atv_safari.jpg", tag: "Quad Bike Desert", desc: "High-octane ATV quad biking across open white salt flats." },
    { title: "Hilltop of Kutch (Kalo Dungar)", image: "/kalodungar.jpg", tag: "1,525 ft Black Hill", desc: "Panoramic view of the Great Rann salt expanse meeting the horizon." },
    { title: "Starlite Desert Gala Dinner", image: "/brochure-assets/gala_dinner.jpg", tag: "Live Folk & Banquet", desc: "Illuminated luxury dining with live Gujarati & Kutchi folk musicians." },
    { title: "Golden Hour Camel Ride", image: "/brochure-assets/camel_safari.jpg", tag: "Sunset Caravan", desc: "Traditional decorated camel safari walking into vibrant sunset hues." }
  ]

  const pdfBrochures = [
    {
      title: "Culture Kutch 1N / 2D Express",
      desc: "Dhordo Tent City, White Desert Sunset, Camel Safari & Smritivan Museum.",
      file: "/Ghumo_Firoo_Culture_Kutch_1N2D_Brochure.pdf",
      badge: "01 Night / 02 Days",
      color: "from-blue-600/30 to-indigo-950/80"
    },
    {
      title: "Culture Kutch 2N / 3D Retreat",
      desc: "Tent City Dhordo, Kalo Dungar Black Hill, Road to Heaven & Bhuj Palaces.",
      file: "/Ghumo_Firoo_Culture_Kutch_2N3D_Brochure.pdf",
      badge: "02 Nights / 03 Days",
      color: "from-amber-600/30 to-amber-950/80"
    },
    {
      title: "Culture Kutch 3N / 4D Grand Circuit",
      desc: "Complete Kutch: White Rann, Tent City, Kalo Dungar, Mandvi Beach & Shrines.",
      file: "/Ghumo_Firoo_Culture_Kutch_3N4D_Brochure.pdf",
      badge: "03 Nights / 04 Days",
      color: "from-emerald-600/30 to-teal-950/80"
    },
    {
      title: "Culture Kutch 4N / 5D Odyssey",
      desc: "Grand Odyssey with Dholavira UNESCO Site, Road to Heaven & Mandvi Beach.",
      file: "/Ghumo_Firoo_Culture_Kutch_4N5D_Brochure.pdf",
      badge: "04 Nights / 05 Days",
      color: "from-purple-600/30 to-purple-950/80"
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "rann-faq-1", question: "Is Ghumo Firoo Journeys an Authorized Booking Partner for Rann Utsav Tent City?", answer: "Yes! Ghumo Firoo Journeys is an Authorized Booking Partner & Preferred Travel Agency for Evoke Tent City Dhordo. All reservations booked through us include official Tent City vouchers, guaranteed tent allotment, and 24/7 travel concierge support." },
    { id: "rann-faq-2", question: "What are the official dates for Rann Utsav 2026–2027?", answer: "The official Rann Utsav season runs from 1st November 2026 to 7th March 2027. Full moon nights and peak holidays (Diwali, Christmas, New Year, International Kite Festival) experience high demand and should be booked well in advance." },
    { id: "rann-faq-3", question: "Why are Full Moon (Purnima) nights the most popular for visiting the White Rann of Kutch?", answer: "Under the full moon, the vast 7,500 sq km White Salt Desert reflects the moonlight, creating a silver, shimmering landscape. It is widely considered one of India's most breathtaking natural wonders." },
    { id: "rann-faq-4", question: "What tent accommodation categories are available at Tent City Dhordo?", answer: "We offer Darbari Suites, Rajwadi Suites, Super Premium AC Tents, Premium AC Tents, Deluxe AC Tents, and Non-AC Swiss Tents. All tents feature attached Western toilets, running hot/water, electric heaters, and daily room service." },
    { id: "rann-faq-5", question: "What are the fixed pickup departure timings from Bhuj Railway Station & Airport?", answer: "Fixed AC shared coach pickups from Bhuj Railway Station & Bhuj Airport depart at 08:15 AM, 10:00 AM, 01:30 PM, and 03:30 PM. Private Innova/Ertiga transfers are also available upon request." },
    { id: "rann-faq-6", question: "Are White Rann entry permits included in my Tent City booking?", answer: "Yes, official entry permits for the White Rann salt desert and BSF checkpoint clearances are processed and included with your Tent City booking voucher." },
    { id: "rann-faq-7", question: "What sightseeing excursions are included in 1N, 2N, and 3N packages?", answer: "1N packages cover White Rann sunset walk and cultural night show. 2N packages add Kalo Dungar (Black Hill - highest point in Kutch) and Gandhi Nu Gaam handicraft village. 3N packages add Mandvi Beach, Vijay Vilas Palace, and Smritivan Memorial Museum in Bhuj." },
    { id: "rann-faq-8", question: "What clothes should I pack for Rann Utsav winter weather?", answer: "Desert days are pleasant (24°C to 28°C) so light cottons, sunglasses, and sunblock are recommended. However, desert nights get cold (10°C to 14°C), so pack heavy jackets, thermals, woolens, and comfortable walking shoes." },
    { id: "rann-faq-9", question: "Is Rann Utsav suitable for senior citizens and young children?", answer: "Yes! Tent City Dhordo is 100% senior-citizen friendly featuring paved pathways, battery-operated golf carts, wheelchair assistance, and a 24/7 medical center with doctors on call." },
    { id: "rann-faq-10", question: "What local Kutchi handicrafts can be bought at Dhordo and Bhuj?", answer: "You can shop for authentic Ajrakh block print fabrics, Bandhani tie-dye sarees, Nirona Rogan art, copper bells, traditional Kutchi embroidery jackets, silver jewelry, and leather crafts." },
    { id: "rann-faq-11", question: "What food options are served inside Tent City Dhordo?", answer: "Packages include 100% pure vegetarian, hygienic buffet meals (Breakfast, Lunch, High Tea, Dinner). Authentic Gujarati Thali, North Indian, South Indian, and Jain (no onion/garlic) options are served daily." },
    { id: "rann-faq-12", question: "Can private chauffeured cars be arranged from Ahmedabad or Rajkot?", answer: "Yes! We arrange private chauffeured Innova/Crysta/Tempo Traveller pickups directly from Ahmedabad Airport (AMD), Rajkot, or Vadodara with customized en-route sightseeing." },
    { id: "rann-faq-13", question: "Is alcohol allowed in Kutch, and how can non-resident tourists obtain a permit?", answer: "Gujarat is a dry state. Foreign tourists and domestic non-resident travelers holding valid travel tickets can apply for online tourist liquor permits through the official e-permit portal upon arrival at designated licensed hotels in Bhuj." },
    { id: "rann-faq-14", question: "What is the cancellation and refund policy for Tent City stays?", answer: "Cancellation > 30 days before check-in incurs a 10% processing fee (90% refund). Cancellation between 15-30 days receives a 60% refund. Cancellation < 15 days is non-refundable." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Tour Packages", item: "/packages" },
    { name: "Rann Utsav Kutch", item: "/packages/rann-utsav" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Rann Utsav 2025-2026 Kutch White Desert Festival",
    "startDate": "2025-11-01",
    "endDate": "2026-03-31",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Tent City Dhordo & Great White Rann of Kutch",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Dhordo Village, Kutch District",
        "addressLocality": "Bhuj",
        "addressRegion": "Gujarat",
        "postalCode": "370510",
        "addressCountry": "IN"
      }
    },
    "image": [
      config.baseUrl + "/Rann-Utsav-Gujarat.png",
      config.baseUrl + "/rann-utsav.jpg"
    ],
    "description": "Official Rann Utsav festival in Kutch Gujarat featuring Tent City Dhordo luxury Swiss Tents, White Salt Desert full moon, Road to Heaven & Dholavira UNESCO tours.",
    "organizer": {
      "@type": "Organization",
      "name": "GhumoFiroo Journeys - Official Evoke Experiences Partner",
      "url": config.baseUrl
    }
  }

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "Evoke Experiences Authorized Partner",
    "description": "Official Authorized Booking Partner for Rann Utsav Tent City Dhordo & Evoke Resorts.",
    "url": config.baseUrl + "/agent-certificate.pdf"
  }

  const tripSchema = buildTouristTripJsonLd({
    name: "Official Evoke Partner | Rann Utsav Kutch Tour Packages 2025-2026",
    description: "Official Evoke Experiences Partner. Book Tent City Dhordo, White Salt Desert sunset, Road to Heaven & Dholavira UNESCO Harappan site with GhumoFiroo.",
    url: config.baseUrl + "/packages/rann-utsav",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80",
    duration: "P4D",
    itinerary: [
      { position: 1, name: "Tent City Dhordo Check-in & White Rann Sunset", description: "Deluxe Swiss tent check-in, camel cart ride & Kutchi Garba night." },
      { position: 2, name: "Road to Heaven & Dholavira UNESCO Site", description: "30km ocean salt highway drive & 5,000-year Harappan citadel tour." },
      { position: 3, name: "Kalo Dungar & Bhuj Heritage Palaces", description: "Highest point in Kutch, Aina Mahal & Bhujodi artisan craft village." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "12500",
      includes: "Official Evoke Partner Vouchers, Tent City Dhordo AC Swiss Tents, all meals, White Rann entry permits, private AC transfers"
    },
    aggregateRating: {
      ratingValue: 4.95,
      reviewCount: 1360
    }
  })

  return (
    <Layout>
      <SEO 
        title="Rann Utsav 2026-27 Packages | Tent City Dhordo | Evoke Partner"
        description="Book official Rann Utsav 2026-27 packages at Tent City Dhordo. Enjoy AC Deluxe Swiss Tents, White Desert Full Moon & Dholavira tours with free Bhuj transfers."
        keywords="Rann Utsav 2026-27, Tent City Dhordo booking, White Rann of Kutch, Evoke Experiences partner, Rann Utsav package price, Road to Heaven Dholavira, Full Moon Rann Utsav, Kutch tour package from Bhuj"
        canonicalUrl={config.baseUrl + "/packages/rann-utsav"}
        structuredData={[breadcrumbSchema, faqSchema, eventSchema, brandSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="/brochure-assets/cover_kutch.jpg" 
              alt="White Desert Rann Utsav Tent City Kutch" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_RANN_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-60" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            
            {/* OFFICIAL FESTIVAL DATES BADGE */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#C9A25A]/20 border border-[#C9A25A]/60 backdrop-blur-md text-[#E5C378] text-xs sm:text-sm font-bold shadow-xl">
              <Calendar className="w-4 h-4 text-[#C9A25A]" />
              <span>Official Festival Dates: 1 November 2026 – 7 March 2027</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Rann Utsav Kutch 2026-2027
            </h1>

            {/* NORMAL DAYS RATE DISCLAIMER BANNER */}
            <div className="text-xs text-amber-200 font-medium bg-amber-950/60 border border-amber-500/40 px-4 py-2.5 rounded-xl max-w-2xl backdrop-blur-md flex items-center gap-2 text-center justify-center shadow-lg">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span><strong>Rate Disclaimer:</strong> Mentioned rates are applicable only for <strong>normal days</strong>. Special rates apply for Full Moon (Purnima), Dark Moon, Diwali & Christmas/New Year peak dates.</span>
            </div>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Official Evoke Tent City Dhordo Swiss Tents, White Salt Desert Sunset, Road to Heaven & Dholavira UNESCO Site.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore All {rannPackages.length} Packages <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-6 rounded-full bg-black/40 border-white/20 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 backdrop-blur-md"
                onClick={() => document.getElementById("highlights-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                View {attractions.length} Sightseeing Guides <Compass className="ml-2 h-4 w-4 text-[#C9A25A]" />
              </Button>
            </div>

            {/* QUICK STATS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 w-full max-w-3xl">
              {[
                { label: "Guest Rating", val: "4.95 ★", sub: "1,360+ Kutch Travelers" },
                { label: "Stay Style", val: "AC Swiss Tents", sub: "Evoke Tent City Dhordo" },
                { label: "Permits Included", val: "100% Free", sub: "White Rann Entry Pass" },
                { label: "Meals & Transfers", val: "All Meals Included", sub: "Bhuj Airport/Station Pickup" }
              ].map((stat, i) => (
                <div key={i} className="bg-black/40 border border-white/10 p-3 rounded-xl backdrop-blur-md text-center">
                  <div className="text-sm font-serif font-bold text-[#E5C378]">{stat.val}</div>
                  <div className="text-[10px] text-slate-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* EVOKE PARTNER GUARANTEE BANNER */}
        <section className="py-12 bg-[#050A18] border-b border-[#C9A25A]/20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="bg-[#0B1226]/90 border border-[#C9A25A]/40 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-[#E5C378] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#C9A25A]" /> Verified Authorization
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Book Directly With Official Evoke Partner
                </h3>
                <p className="text-xs text-slate-300 font-light max-w-2xl leading-relaxed">
                  GhumoFiroo Journeys holds verified booking authorization for Evoke Experiences & Tent City Dhordo. Enjoy official rate card transparency, guaranteed tent allotment, complimentary border permits, and 24/7 on-ground assistance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <a 
                  href="/agent-certificate.pdf" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-5 py-3 rounded-full bg-white/10 border border-[#C9A25A]/40 text-xs font-bold text-white hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[#C9A25A]" /> View Evoke Certificate
                </a>
                <Link 
                  to="/packages/rann-utsav-tent"
                  className="px-5 py-3 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition-all flex items-center gap-1.5"
                >
                  Live Rate Calculator <SlidersHorizontal className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PACKAGES GRID SECTION */}
        <section id="packages-section" className="py-24 container mx-auto px-6 max-w-7xl">
          <SectionHeading 
            kicker="Official Festival Packages" 
            title="Explore All Rann Utsav Packages" 
            subtitle="Select your preferred itinerary from 2D/1N express retreats to 5D/4N full Kutch & Mandvi beach odysseys." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rannPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_RANN_IMG }}
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
                      <p className="text-xs text-slate-300 font-light leading-relaxed mb-3 line-clamp-3">{pkg.desc}</p>

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

        {/* FEATURED SEO CONTENT: FULL MOON CALENDAR 2025-2026 */}
        <section className="py-16 bg-[#0B1026] border-y border-[#C9A25A]/20">
          <div className="container mx-auto px-6 max-w-5xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A25A]/15 border border-[#C9A25A]/30 text-[#E5C378] text-xs font-bold uppercase tracking-wider">
              <Moon className="w-3.5 h-3.5 text-[#C9A25A]" /> High Demand Dates
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Official Rann Utsav Full Moon Calendar 2025-2026
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl mx-auto">
              On full moon nights (Purnima), the vast white salt desert reflects moonlight, turning the entire landscape into a shimmering blue mirror. Book early as Tent City sells out 60 days in advance for full moon dates.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
              {fullMoonDates.map((item, i) => (
                <div key={i} className="bg-[#070C1E] p-4 rounded-xl border border-[#C9A25A]/30 space-y-2 hover:border-[#C9A25A] transition-colors">
                  <div className="text-[11px] font-bold text-[#C9A25A] uppercase">{item.month}</div>
                  <div className="text-sm font-serif font-bold text-white">{item.date}</div>
                  <div className="text-[10px] text-slate-400 font-light">{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12 ADVENTURE ACTIVITIES & HERITAGE SHOWCASE */}
        <section className="py-24 bg-[#070C1E] border-b border-[#C9A25A]/20">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading 
              kicker="Signature Kutch Experiences" 
              title="Adventure Activities & Royal Heritage" 
              subtitle="Immerse in the vibrant colors, white desert thrill, and timeless royal heritage of Kutch." 
              align="center" 
              className="mx-auto mb-16" 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {adventureActivities.map((act, i) => (
                <ScrollReveal key={i} variant="fade-in-up" delay={i * 30}>
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[#C9A25A]/30 group hover:border-[#C9A25A] transition-all duration-500 shadow-xl bg-slate-900">
                    <img 
                      src={act.image} 
                      alt={act.title}
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_RANN_IMG }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070C1E] via-[#070C1E]/50 to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/75 backdrop-blur-md border border-[#C9A25A]/50 text-[#E5C378] text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        {act.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col justify-end">
                      <h4 className="font-serif font-bold text-white text-base leading-snug group-hover:text-[#E5C378] transition-colors mb-1.5">
                        {act.title}
                      </h4>
                      <div className="w-8 h-0.5 bg-[#C9A25A] mb-2 group-hover:w-16 transition-all duration-300" />
                      <p className="text-[11px] text-slate-300 font-light leading-relaxed line-clamp-2">
                        {act.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* OFFICIAL CLIENT PDF BROCHURES DOWNLOAD SECTION */}
        <section className="py-20 bg-gradient-to-b from-[#050A18] to-[#0B1026] border-b border-[#C9A25A]/20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="bg-[#0B1226]/90 border-2 border-[#C9A25A]/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#C9A25A]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A25A]/20 border border-[#C9A25A]/50 text-[#E5C378] text-xs font-bold uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-[#C9A25A]" /> Official Client-Ready Brochures
                </div>
                <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white">
                  Download Official Ghumo Firoo Kutch Brochures
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                  Download our high-definition, transparently priced client brochures complete with detailed day-wise itineraries, vehicle choices, and Tent City inclusions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {pdfBrochures.map((pdf, idx) => (
                  <div key={idx} className={`p-6 rounded-2xl border border-[#C9A25A]/35 bg-gradient-to-b ${pdf.color} flex flex-col justify-between space-y-4 hover:border-[#C9A25A] transition-all hover:scale-[1.02] shadow-xl`}>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-black/60 text-[#E5C378] border border-[#C9A25A]/40 inline-block mb-3">
                        {pdf.badge}
                      </span>
                      <h4 className="font-serif font-bold text-white text-lg mb-2">
                        {pdf.title}
                      </h4>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">
                        {pdf.desc}
                      </p>
                    </div>

                    <a 
                      href={pdf.file} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:brightness-110 shadow-md transition-all"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ATTRACTIONS GRID SECTION - ELABORATE DESIGN */}
        <section id="highlights-section" className="py-24 bg-[#050A18] border-y border-[#C9A25A]/15">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading 
              kicker="In-Depth Sightseeing Guide" 
              title="12 Iconic Kutch Highlights & Attractions" 
              subtitle="Explore complete details of attractions covered across our Rann Utsav itineraries. Click any card to view full travel advice & photography guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights (12 Spots)" },
                { key: "desert", label: "White Desert & Salt" },
                { key: "heritage", label: "Heritage & Palaces" },
                { key: "coastal", label: "Coastal & Forts" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_RANN_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_RANN_IMG }}
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
                      <Mountain className="w-3.5 h-3.5 text-[#C9A25A]" /> Location / Altitude: {selectedAttraction.details.altitude}
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
                      <span className="text-xs text-slate-400 block font-light">Includes Tent City AC Swiss Tents & Permits</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹12,500</span>
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

        {/* RELATED DESTINATIONS INTERNAL LINKS FOR SEO */}
        <section className="py-16 bg-[#070C1E] border-t border-white/10">
          <div className="container mx-auto px-6 max-w-6xl text-center space-y-6">
            <h3 className="text-lg font-serif font-bold text-white">Explore More Trending Domestic Destinations</h3>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <Link to="/packages/char-dham-yatra" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#C9A25A] text-slate-300 hover:text-white transition-colors">
                Char Dham Yatra 2026
              </Link>
              <Link to="/packages/kashmir-paradise" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#C9A25A] text-slate-300 hover:text-white transition-colors">
                Kashmir Paradise & Dal Lake
              </Link>
              <Link to="/packages/rajasthan-royal" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#C9A25A] text-slate-300 hover:text-white transition-colors">
                Rajasthan Royal Palaces
              </Link>
              <Link to="/packages/kerala-backwaters" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#C9A25A] text-slate-300 hover:text-white transition-colors">
                Kerala Backwaters & Munnar
              </Link>
              <Link to="/packages/himachal-hill-stations" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#C9A25A] text-slate-300 hover:text-white transition-colors">
                Himachal Shimla & Manali
              </Link>
              <Link to="/packages" className="px-4 py-2 rounded-full bg-[#C9A25A]/20 border border-[#C9A25A]/40 text-[#E5C378] font-bold hover:brightness-110 transition-all">
                All 50+ Packages Directory →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-24 container mx-auto px-6 max-w-4xl">
          <SectionHeading kicker="Travel Assurance" title="Rann Utsav Travel FAQ" subtitle="Important details regarding Tent City booking, White Rann permits & transport." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Rann Utsav Kutch 2025-2026"
          priceText="From ₹12,500"
          priceSubtext="Official Evoke Partner | Tent City AC Tents & Permits"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Rann%20Utsav%20Express%20Tent%20City%20Retreat%203D2N&price=18500")}
        />
      </div>
    </Layout>
  )
}

export default RannUtsav