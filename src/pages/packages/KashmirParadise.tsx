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

const KashmirParadise: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedPkg, setSelectedPkg] = useState<any | null>(null)
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_KASHMIR_IMG = "/kashmir/gulmarg_gondola.jpg"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Kashmir', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const kashmirPackages = [
    {
      id: "kashmir-5d-4n",
      title: "Classic Kashmir & Dal Lake Houseboat (5D/4N)",
      desc: "Ideal introductory tour covering Srinagar Mughal Gardens, sunset Shikara ride, Gulmarg snow meadows & Pahalgam Lidder valley.",
      badge: "Best Seller",
      image: "/kashmir/dal_lake_shikara.jpg",
      price: 21500,
      duration: "5 Days / 4 Nights",
      rating: 4.9,
      reviewsCount: 520,
      stay: "Luxury Dal Lake Houseboat (1N) + Srinagar Hotel (2N) + Pahalgam Resort (1N)",
      vehicle: "Chauffeured Private AC SUV / Sedan",
      link: "/packages/kashmir-5d-4n",
      highlights: ["Sunset Shikara Ride", "Gulmarg Gondola Ride", "Nishat & Shalimar Bagh", "Lidder River Walk"],
      itinerary: [
        { day: "Day 1", title: "Srinagar Airport Pickup → Dal Lake Luxury Houseboat", desc: "Private pickup from Srinagar Airport (SXR). Check-in to luxury cedarwood houseboat. Sunset Shikara ride on Dal Lake & Kahwa welcome drink." },
        { day: "Day 2", title: "Srinagar Mughal Gardens & Shankaracharya Temple", desc: "Tour UNESCO contender Nishat Bagh, Shalimar Bagh, Pari Mahal, and hilltop Shankaracharya Temple." },
        { day: "Day 3", title: "Srinagar to Gulmarg Excursion → Gondola Cable Car", desc: "Drive to Gulmarg. Ride Gulmarg Gondola Phase 1 & 2 up to Apharwat Peak at 13,500 ft. Snow sledging and ski views." },
        { day: "Day 4", title: "Srinagar to Pahalgam → Valley of Shepherds", desc: "Drive to Pahalgam via Pampore saffron fields & Awantipora ruins. Evening walk along Lidder river." },
        { day: "Day 5", title: "Pahalgam to Srinagar Airport Departure Transfer", desc: "Breakfast and chauffeured transfer back to Srinagar Airport for departure." }
      ],
      inclusions: ["1 Night Luxury Houseboat + 3 Nights 4-Star Resorts", "Sunset Shikara Ride Pass", "Daily Breakfast & Dinner", "Private AC Chauffeured SUV/Sedan"],
      exclusions: ["Gulmarg Gondola Tickets", "Pony ride fees"]
    },
    {
      id: "kashmir-6d-5n",
      title: "Kashmir Paradise Spectacular & Sonamarg (6D/5N)",
      desc: "Our most requested itinerary adding Sonamarg Thajiwas Glacier pony trek and Betaab Valley in Pahalgam.",
      badge: "Top Choice",
      image: "/kashmir/pahalgam_betaab_valley.jpg",
      price: 26500,
      duration: "6 Days / 5 Nights",
      rating: 4.95,
      reviewsCount: 890,
      stay: "Dal Lake Houseboat (1N) + Srinagar Hotel (2N) + Pahalgam Resort (2N)",
      vehicle: "Chauffeured Private AC SUV / Innova",
      link: "/packages/kashmir-6d-5n",
      highlights: ["Sonamarg Thajiwas Glacier", "Betaab & Aru Valleys", "Gulmarg Gondola", "Dal Lake Houseboat"],
      itinerary: [
        { day: "Day 1", title: "Srinagar Pickup → Houseboat & Sunset Shikara", desc: "Chauffeured pickup from Srinagar Airport. Houseboat check-in & sunset Shikara ride." },
        { day: "Day 2", title: "Srinagar to Sonamarg → Meadow of Gold & Thajiwas Glacier", desc: "Excursion to Sonamarg. Pony trek to Thajiwas Glacier snow fields." },
        { day: "Day 3", title: "Srinagar to Gulmarg → World's Highest Gondola Ride", desc: "Drive to Gulmarg. Cable car ride to Apharwat Peak at 13,500 ft." },
        { day: "Day 4", title: "Gulmarg to Pahalgam → Saffron Fields & Lidder River", desc: "Drive to Pahalgam. Visit Pampore saffron farms & Lidder riverbank resort." },
        { day: "Day 5", title: "Pahalgam Betaab Valley, Aru Valley & Baisaran", desc: "Excursion to Betaab Valley, Aru Valley & pony ride to Baisaran Mini Switzerland." },
        { day: "Day 6", title: "Pahalgam to Srinagar Airport Departure", desc: "Breakfast and transfer to Srinagar Airport for departure drop-off." }
      ],
      inclusions: ["1 Night Houseboat + 4 Nights 4-Star Resorts", "Sonamarg & Pahalgam Valleys Included", "Daily Breakfast & Dinner", "Private Chauffeured SUV/Innova"],
      exclusions: ["Gondola Phase 2 tickets", "Personal shopping"]
    },
    {
      id: "kashmir-7d-6n",
      title: "Grand Kashmir Valley & Doodhpathri Circuit (7D/6N)",
      desc: "Complete Kashmir circuit covering Srinagar, Gulmarg, Pahalgam, Sonamarg glacier & pristine Doodhpathri meadows.",
      badge: "Grand Circuit",
      image: "/kashmir/doodhpathri_kashmir.jpg",
      price: 32500,
      duration: "7 Days / 6 Nights",
      rating: 4.98,
      reviewsCount: 620,
      stay: "Dal Lake Houseboat (1N) + Srinagar Hotel (3N) + Pahalgam Resort (2N)",
      vehicle: "Chauffeured Private AC Innova / SUV",
      link: "/packages/kashmir-7d-6n",
      highlights: ["Doodhpathri Valley of Milk", "Gulmarg Snow Peak", "Thajiwas Glacier", "Baisaran Meadow"],
      itinerary: [
        { day: "Day 1", title: "Srinagar Arrival → Houseboat Reception", desc: "Airport pickup, houseboat check-in & Shikara ride." },
        { day: "Day 2", title: "Srinagar Mughal Gardens & Pari Mahal", desc: "Tour Nishat Bagh, Shalimar Bagh & Shankaracharya temple." },
        { day: "Day 3", title: "Doodhpathri 'Valley of Milk' Day Trip", desc: "Excursion to offbeat Doodhpathri pine meadows & Shaliganga river." },
        { day: "Day 4", title: "Srinagar to Gulmarg Gondola Day Trip", desc: "Cable car ride up to Apharwat peak & snow sports." },
        { day: "Day 5", title: "Srinagar to Pahalgam → Saffron Fields", desc: "Drive past Pampore saffron farms & Lidder riverbank check-in." },
        { day: "Day 6", title: "Pahalgam Betaab, Aru & Baisaran Valleys", desc: "Full day excursion in Betaab Valley & pony ride to Baisaran." },
        { day: "Day 7", title: "Pahalgam to Srinagar Airport Departure", desc: "Breakfast and drop-off at Srinagar Airport." }
      ],
      inclusions: ["6 Nights Accommodation (1 Houseboat + 5 4-Star Hotels)", "Doodhpathri Day Trip Included", "Daily Breakfast & Dinner", "Private AC Vehicle for 7 Days"],
      exclusions: ["Flight tickets to Srinagar"]
    }
  ]

  const attractions = [
    {
      id: "gulmarg-gondola",
      category: "adventure",
      categoryName: "Snow & Cable Car",
      title: "Gulmarg Gondola & Apharwat Peak",
      description: "World's 2nd highest cable car carrying travelers to Apharwat Peak at 13,500 ft. Asia's premier ski resort with year-round snow slopes.",
      image: "/kashmir/gulmarg_gondola.jpg",
      distance: "Gulmarg (50 km from Srinagar)",
      highlights: ["13,500 ft Apharwat Peak", "Phase 1 & 2 Cable Car", "Winter Ski Slopes", "Snow Sledging"],
      details: {
        altitude: "Apharwat Peak: 13,500 ft (4,115 m)",
        bestTime: "Dec to Mar for Snow Skiing | May to Oct for Green Alpine Views",
        overview: "Gulmarg ('Meadow of Flowers') boasts the world's second-highest operating cable car, the Gulmarg Gondola. Phase 1 lifts travelers from Gulmarg base (8,530 ft) to Kongdoori (10,050 ft), while Phase 2 soars to Apharwat Peak (13,500 ft).",
        experiences: [
          "Soar high above pine tree canopies on the 2-stage French-engineered Gondola cable car.",
          "Touch permanent snow at 13,500 ft Apharwat Peak overlooking LOC mountain ranges.",
          "Experience snowmobiling, skiing, and wooden toboggan sledging in winter months.",
          "Trek to high-altitude Alpine Lake Alpather tucked beneath Apharwat mountain ridge."
        ],
        travelTips: "Gondola Phase 1 & 2 tickets must be booked online 15-30 days in advance via official JKTDC portal."
      }
    },
    {
      id: "dal-lake-shikara",
      category: "lakes",
      categoryName: "Lakes & Houseboats",
      title: "Dal Lake Shikara & Cedar Houseboats",
      description: "Srinagar's iconic jewel. Sail wooden Shikara boats across mirror-like waters past floating vegetable markets, lotus gardens, and handcrafted cedar houseboats.",
      image: "/kashmir/dal_lake_shikara.jpg",
      distance: "Srinagar City Center",
      highlights: ["Floating Market", "Sunset Shikara Ride", "Carved Cedar Houseboats", "Char Chinari"],
      details: {
        altitude: "5,200 feet (1,585 m)",
        bestTime: "April to October | Sunset Golden Hour",
        overview: "Dal Lake is the heart of Srinagar's culture. Spanning 18 sq km, it is renowned for its carved wooden houseboats, floating gardens (Radh), and traditional velvet-canopied Shikara boats.",
        experiences: [
          "Stay overnight in a heritage cedarwood houseboat featuring Victorian wood carvings.",
          "Take a 2-hour sunset Shikara ride to Char Chinari island and floating flower markets.",
          "Savor authentic hot Kashmiri Saffron Kahwa tea served directly on your Shikara boat.",
          "Visit early morning 5:00 AM floating vegetable market on backwater channels."
        ],
        travelTips: "Houseboat stays include private attached bathrooms with hot water boilers and carpeted heating."
      }
    },
    {
      id: "pahalgam-betaab",
      category: "nature",
      categoryName: "Valleys & Rivers",
      title: "Pahalgam Betaab & Aru Valleys",
      description: "Pahalgam's breathtaking alpine valleys surrounded by pine-covered mountains, crystal clear Lidder river streams, and lush Baisaran 'Mini Switzerland' meadows.",
      image: "/kashmir/pahalgam_betaab_valley.jpg",
      distance: "Pahalgam (90 km from Srinagar)",
      highlights: ["Betaab Valley Film Spot", "Aru Valley Village", "Lidder River Rafting", "Baisaran Meadow"],
      details: {
        altitude: "7,200 feet (2,195 m)",
        bestTime: "April to October | Dec to Feb for Snow",
        overview: "Pahalgam ('Valley of Shepherds') sits at the confluence of streams flowing from Sheshnag Lake and Lidder River. Betaab Valley, named after the Bollywood hit movie 'Betaab', features crystal streams flowing through pine meadows.",
        experiences: [
          "Walk through the manicured pine lawns of Betaab Valley along the roaring Lidder River.",
          "Take a scenic 12 km drive to peaceful Aru Valley, starting point for Kolahoi Glacier trek.",
          "Ride ponies up the steep forest trail to Baisaran meadow, known as 'Mini Switzerland'.",
          "Try beginner white-water river rafting along the Lidder River rapids."
        ],
        travelTips: "Local Pahalgam Taxi Union vehicles are required to visit Betaab, Aru, and Chandanwari valleys."
      }
    },
    {
      id: "sonamarg-thajiwas",
      category: "nature",
      categoryName: "Valleys & Rivers",
      title: "Sonamarg Thajiwas Glacier",
      description: "The 'Meadow of Gold' at 9,000 ft elevation. Famous for snow-clad mountains, Sindh river trout fishing, and pony treks up to Thajiwas Glacier snow fields.",
      image: "/kashmir/sonamarg_thajiwas_glacier.jpg",
      distance: "Sonamarg (80 km from Srinagar)",
      highlights: ["Thajiwas Glacier Trek", "Sindh River Stream", "Year-Round Snow", "Zero Point Zoji La"],
      details: {
        altitude: "9,000 feet (2,740 m)",
        bestTime: "May to October (Road closed in extreme winter)",
        overview: "Sonamarg lies on the bank of Nallah Sindh river at the foot of Zoji La Pass. It serves as the historic Gateway to Ladakh and is famous for its shimmering Thajiwas Glacier.",
        experiences: [
          "Take a 3 km pony ride or walk through pine woods up to the foot of Thajiwas Glacier.",
          "Slide down natural snow slopes on wooden sledges even during peak summer months.",
          "Drive further up toward Zero Point near Zoji La Pass bordering Ladakh district.",
          "Enjoy hot Maggie and tea at mountain stream shacks beside the glacier."
        ],
        travelTips: "Carry sunglasses and sunscreen as high-altitude snow reflection can be intense."
      }
    },
    {
      id: "srinagar-mughal-gardens",
      category: "heritage",
      categoryName: "Heritage & Gardens",
      title: "Srinagar Mughal Gardens (Nishat & Shalimar)",
      description: "UNESCO World Heritage contender gardens built by Mughal Emperors in 1633 AD. Featuring terraced fountains, ancient Chinar trees, and Dal Lake panoramas.",
      image: "/kashmir/srinagar_mughal_gardens.jpg",
      distance: "Srinagar Boulevard",
      highlights: ["Nishat Bagh 12 Terraces", "Shalimar Bagh Fountains", "400yr Chinar Trees", "Pari Mahal View"],
      details: {
        altitude: "5,200 feet (1,585 m)",
        bestTime: "April to May (Spring blooms) | Oct to Nov (Red Chinar Autumn)",
        overview: "Nishat Bagh ('Garden of Joy') and Shalimar Bagh ('Abode of Love') were created by Emperor Jahangir for Empress Nur Jahan in 1619-1633 AD. Built in classic Persian Charbagh style with cascading water channels.",
        experiences: [
          "Walk up the 12 terraced levels of Nishat Bagh representing the 12 signs of the zodiac.",
          "Photograph 400-year-old towering Chinar trees turning fiery golden red in autumn.",
          "Visit Pari Mahal ('Palace of Fairies') for sweeping sunset panoramas of Dal Lake.",
          "Stroll along central stone water channels fed by natural mountain springs."
        ],
        travelTips: "Autumn (mid-October to mid-November) is the most photogenic season when Chinar leaves turn deep red."
      }
    },
    {
      id: "doodhpathri-valley",
      category: "nature",
      categoryName: "Valleys & Rivers",
      title: "Doodhpathri 'Valley of Milk'",
      description: "Pristine offbeat mountain meadow located at 8,957 ft altitude. Famous for roaring Shaliganga river streams, lush green rolling hills, and pine forests.",
      image: "/kashmir/doodhpathri_kashmir.jpg",
      distance: "Budgam (42 km from Srinagar)",
      highlights: ["Shaliganga River Stream", "Valley of Milk", "Pristine Pine Woods", "Offbeat Uncrowded"],
      details: {
        altitude: "8,957 feet (2,730 m)",
        bestTime: "May to September",
        overview: "Doodhpathri ('Valley of Milk') receives its name because the fast-flowing Shaliganga river water hits rocks and creates white frothy foam that resembles flowing milk. It remains one of Kashmir's most untouched destinations.",
        experiences: [
          "Cross wooden bridges over the roaring white frothy Shaliganga river stream.",
          "Walk across endless velvet green rolling meadows surrounded by dense pine forests.",
          "Enjoy quiet picnics by the riverbank away from commercial tourist crowds.",
          "Sample fresh local cow milk and traditional Kashmiri bread at shepherd huts."
        ],
        travelTips: "Doodhpathri is ideal for a day excursion from Srinagar. Pack a light sweater even in summer."
      }
    },
    {
      id: "baisaran-valley",
      category: "adventure",
      categoryName: "Snow & Adventure",
      title: "Baisaran Valley 'Mini Switzerland' & Adventure Park",
      description: "High-altitude rolling alpine meadow perched 5 km above Pahalgam, surrounded by dense deodar pine forests and snow-capped Himalayan peaks.",
      image: "/kashmir/baisaran_valley_pahalgam.jpg",
      distance: "Pahalgam (5 km pony trek)",
      highlights: ["Mini Switzerland Meadows", "Pine Forest Pony Trek", "Ziplining & Zorbing", "Panoramic Valley View"],
      details: {
        altitude: "7,874 feet (2,400 m)",
        bestTime: "April to November",
        overview: "Often referred to as the 'Mini Switzerland of India', Baisaran is a hilltop clearing offering postcard-perfect vistas of Pahalgam town and the Lidder River Valley far below.",
        experiences: [
          "Ride Kashmiri mountain ponies through scenic pine-wood bridle trails up to Baisaran.",
          "Experience outdoor adventure sports including zorbing, giant valley ziplining, and ATV quad rides.",
          "Savor freshly roasted sweet corn and hot Kahwa from meadow stalls with panoramic views.",
          "Hike deeper toward Tulian Lake trail through virgin birch and pine forests."
        ],
        travelTips: "Wear comfortable walking shoes or trekking boots for the hilltop pony trail."
      }
    },
    {
      id: "sinthan-top",
      category: "adventure",
      categoryName: "Snow & High-Altitude Passes",
      title: "Sinthan Top & Peer Ki Gali (3,800m Snow Pass)",
      description: "Spectacular high-altitude mountain pass connecting Kashmir Valley with Jammu. Features 360-degree snow peaks, crisp alpine winds, and offbeat adventure.",
      image: "/kashmir/sinthan_top_kashmir.jpg",
      distance: "Anantnag / Kishtwar Road (130 km from Srinagar)",
      highlights: ["12,467 ft Mountain Pass", "Year-Round Snow Slopes", "360° Pir Panjal View", "Offbeat Road Adventure"],
      details: {
        altitude: "12,467 feet (3,800 m)",
        bestTime: "May to October (Pass remains snowbound in deep winter)",
        overview: "Sinthan Top is a breathtaking mountain pass situated at 12,467 ft on the Breng Valley road. It offers tourists year-round snow experiences and panoramic views of both Jammu and Kashmir provinces.",
        experiences: [
          "Stand atop the pass summit with uninterrupted views of snow-capped Pir Panjal peaks.",
          "Play in pure white snow slopes even during high summer months of June and July.",
          "Drive past scenic pine gorges, wooden Gujjar shepherd bridges, and crystal mountain brooks.",
          "Combine with Daksum and Achabal Mughal spring gardens along the Breng Valley route."
        ],
        travelTips: "Carry warm thermals and windbreakers as Sinthan Top is known for chilly high-speed mountain winds."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "ks-faq-1", question: "Is Kashmir safe for family and couple trips in 2026?", answer: "Yes! Kashmir is extremely welcoming and safe for tourists. Millions of families, honeymoon couples & solo travelers visit Srinagar, Gulmarg, and Pahalgam hassle-free with dedicated 24/7 tourist assistance." },
    { id: "ks-faq-2", question: "How do we book Gulmarg Gondola cable car passes?", answer: "Gulmarg Gondola Phase 1 & Phase 2 passes are issued online via official JKTDC portal. GhumoFiroo handles Gondola pass procurement for all guest package bookings." },
    { id: "ks-faq-3", question: "Are houseboats on Dal Lake equipped with heating during winter?", answer: "Yes! All luxury houseboats in our packages feature traditional Kashmiri Bukhari heaters, electric blankets, and continuous hot water boilers for warm winter comfort." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Kashmir Paradise", item: "/packages/kashmir-paradise" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Kashmir Paradise Tour Packages 2026",
    description: "Book top-rated Kashmir tour packages with GhumoFiroo. Includes Dal Lake houseboats, Gulmarg Gondola rides up to 13,500 ft, Pahalgam Lidder river & Sonamarg glaciers.",
    url: config.baseUrl + "/packages/kashmir-paradise",
    image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&q=80",
    duration: "P6D",
    itinerary: [
      { position: 1, name: "Srinagar Dal Lake Houseboat", description: "Luxury houseboat stay & sunset Shikara ride." },
      { position: 2, name: "Gulmarg Gondola Snow Ridge", description: "Cable car ride to 13,500 ft Apharwat peak." },
      { position: 3, name: "Pahalgam Lidder River Valley", description: "Betaab Valley & Baisaran meadow excursion." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "21500",
      includes: "Luxury houseboat stay, 4-star mountain resorts, breakfast & dinner, private AC SUV transfers"
    },
    aggregateRating: {
      ratingValue: 4.95,
      reviewCount: 1980
    }
  })

  return (
    <Layout>
      <SEO 
        title="Kashmir Tour Packages 2026 | Srinagar, Gulmarg & Pahalgam"
        description="Book top-rated Kashmir holiday packages. Includes Dal Lake houseboat stay, sunset Shikara ride, Gulmarg Gondola cable car passes & Pahalgam Lidder valley."
        keywords="Kashmir tour package 2026, Srinagar Gulmarg Pahalgam price, Gulmarg Gondola pass price, Dal Lake houseboat package"
        canonicalUrl={config.baseUrl + "/packages/kashmir-paradise"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="/kashmir/dal_lake_shikara.jpg" 
              alt="Kashmir Dal Lake Houseboat and Shikara" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KASHMIR_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Heaven on Earth Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Kashmir Paradise Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Dal Lake cedar houseboats, sunset Shikara rides, Gulmarg Gondola cable car up to 13,500 ft, Pahalgam Lidder river & Sonamarg glaciers.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Kashmir Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.95 ★", sub: "1,980+ Travelers" },
                { label: "Houseboat Stay", val: "Cedar Luxury", sub: "Dal Lake Heritage" },
                { label: "Gondola Pass", val: "Assisted Pass", sub: "Phase 1 & 2 Apharwat" },
                { label: "Private Vehicle", val: "100% SUV", sub: "Srinagar Airport Pickup" }
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
            title="Select Your Kashmir Tour Package" 
            subtitle="Choose from classic 5-day escapes, 6-day best sellers with Sonamarg glacier, or 7-day Doodhpathri circuits." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {kashmirPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KASHMIR_IMG }}
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
              title="Kashmir Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Kashmir itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "adventure", label: "Snow & Cable Car" },
                { key: "lakes", label: "Lakes & Houseboats" },
                { key: "nature", label: "Valleys & Rivers" },
                { key: "heritage", label: "Heritage & Gardens" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KASHMIR_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KASHMIR_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes private cab transfers & houseboat stay</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹21,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Kashmir Travel FAQ" subtitle="Important details regarding Gondola passes, houseboats, and airport pickup." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Kashmir Paradise Collection"
          priceText="From ₹21,500"
          priceSubtext="Gondola & Houseboat Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Classic%20Kashmir%205N6D&price=26500")}
        />
      </div>
    </Layout>
  )
}

export default KashmirParadise