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

const GoldenTriangle: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_GT_IMG = "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Delhi', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const goldenTrianglePackages = [
    {
      id: "golden-triangle-4d-3n",
      title: "Delhi, Agra & Jaipur Express (4D/3N)",
      desc: "Short Golden Triangle tour featuring Delhi Qutub Minar, Agra Taj Mahal sunrise & Jaipur Amer Fort.",
      badge: "Express Heritage",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800",
      price: 14500,
      duration: "4 Days / 3 Nights",
      rating: 4.88,
      reviewsCount: 420,
      stay: "Agra Hotel (1N) + Jaipur Heritage Hotel (2N)",
      vehicle: "Chauffeured Private AC Sedan / SUV",
      link: "/packages/golden-triangle-4d-3n",
      highlights: ["Taj Mahal Sunrise Entry", "Amer Fort Elephant Rampart", "Qutub Minar", "Fatehpur Sikri"],
      itinerary: [
        { day: "Day 1", title: "Delhi Pickup → Qutub Minar & Express Highway to Agra", desc: "Private pickup from Delhi Airport. Tour Qutub Minar & drive via Yamuna Expressway to Agra." },
        { day: "Day 2", title: "Taj Mahal Sunrise → Agra Fort → Jaipur via Fatehpur Sikri", desc: "Sunrise tour of Taj Mahal, Agra Fort, and drive to Jaipur via 16th-century ghost city Fatehpur Sikri." },
        { day: "Day 3", title: "Jaipur Sightseeing → Amer Fort, Sheesh Mahal & Jal Mahal", desc: "Elephant ride up Amer Fort, Sheesh Mahal, Jal Mahal, Hawa Mahal & City Palace." },
        { day: "Day 4", title: "Jaipur to Delhi Airport Departure Transfer", desc: "Breakfast, Johari Bazaar shopping, and chauffeured drive back to Delhi Airport." }
      ],
      inclusions: ["3 Nights 4-Star Hotel Stay", "Taj Mahal Sunrise Entry Pass", "Private AC Chauffeured SUV/Sedan", "Daily Breakfast"],
      exclusions: ["Personal monument entry tickets", "Flight / Train fares"]
    },
    {
      id: "golden-triangle-6d-5n",
      title: "Golden Triangle Classic Heritage (6D/5N)",
      desc: "Our best-selling Golden Triangle tour adding Old Delhi rickshaw ride, Chand Baori stepwell & Abhaneri village.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800",
      price: 18500,
      duration: "6 Days / 5 Nights",
      rating: 4.95,
      reviewsCount: 890,
      stay: "Delhi 4-Star (1N) + Agra Hotel (1N) + Jaipur Heritage Haveli (3N)",
      vehicle: "Chauffeured Private AC SUV / Innova",
      link: "/packages/golden-triangle-6d-5n",
      highlights: ["Old Delhi Rickshaw Tour", "Taj Mahal Sunrise", "Chand Baori Stepwell", "Amer Fort"],
      itinerary: [
        { day: "Day 1", title: "Delhi Airport Pickup → Red Fort & Qutub Minar", desc: "Pickup at Delhi Airport. Tour Qutub Minar, Humayun's Tomb & India Gate drive." },
        { day: "Day 2", title: "Old Delhi Rickshaw Ride → Drive to Agra", desc: "Chandni Chowk rickshaw ride, Raj Ghat & express drive to Agra." },
        { day: "Day 3", title: "Taj Mahal Sunrise → Agra Fort → Fatehpur Sikri", desc: "Sunrise entry to Taj Mahal world wonder, Agra Fort & Fatehpur Sikri." },
        { day: "Day 4", title: "Fatehpur Sikri to Jaipur via Chand Baori Stepwell", desc: "Drive to Jaipur Pink City visiting 3,500-step Chand Baori stepwell in Abhaneri." },
        { day: "Day 5", title: "Jaipur Amer Fort, City Palace & Jal Mahal", desc: "Elephant ride up Amer Fort, Jal Mahal photo stop, City Palace & Jantar Mantar." },
        { day: "Day 6", title: "Jaipur Shopping → Delhi / Jaipur Airport Drop-off", desc: "Johari Bazaar shopping and transfer to Delhi or Jaipur Airport." }
      ],
      inclusions: ["5 Nights 4-Star Hotels with Breakfast", "Taj Mahal Sunrise Entry Ticket", "Amer Fort Elephant Ride", "Chandni Chowk Rickshaw Tour", "Private AC Sedan / SUV"],
      exclusions: ["Flight tickets"]
    }
  ]

  const attractions = [
    {
      id: "taj-mahal",
      category: "wonders",
      categoryName: "World Wonders",
      title: "Taj Mahal Sunrise Agra",
      description: "UNESCO World Heritage site and one of the 7 Wonders of the World. A white marble mausoleum built in 1631-1648 AD by Emperor Shah Jahan.",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800",
      distance: "Agra (210 km from Delhi)",
      highlights: ["Sunrise Entry Pass", "White Marble Inlay", "Yamuna River Bank", "Shah Jahan Tomb"],
      details: {
        altitude: "550 feet (170 m)",
        bestTime: "Sunrise (6:00 AM) | Closed on Fridays",
        overview: "The Taj Mahal is universally admired as the jewel of Muslim art in India. Built over 22 years using white Makrana marble, precious gemstone inlay work, and symmetrical Mughal garden design.",
        experiences: [
          "Enter at dawn to witness the white marble turn soft pink, gold, and pure white as the sun rises.",
          "Walk along the central reflection pool framing the iconic dome reflection.",
          "Examine delicate Pietra Dura stone inlay work crafted with lapis lazuli, jasper, and jade.",
          "View the reverse panorama of the Taj Mahal from Mehtab Bagh across the Yamuna River."
        ],
        travelTips: "Taj Mahal is strictly closed on Fridays for general visitors."
      }
    },
    {
      id: "amer-fort-gt",
      category: "forts",
      categoryName: "Palaces & Forts",
      title: "Amer Fort & Sheesh Mahal Jaipur",
      description: "1592 AD hilltop fortress blending Hindu Rajput and Mughal architecture, famous for its Sheesh Mahal mirror palace and Maota Lake views.",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800",
      distance: "Jaipur (11 km)",
      highlights: ["Sheesh Mahal Mirror Work", "Elephant Rampart Ride", "Maota Lake View", "Light & Sound Show"],
      details: {
        altitude: "1,400 feet (430 m)",
        bestTime: "October to March | Morning Hours 8:00 AM",
        overview: "Amer Fort is a UNESCO World Heritage site standing atop the Aravalli hills overlooking Maota Lake. Its famed Sheesh Mahal features thousands of mirror pieces that glow when lit by a single candle.",
        experiences: [
          "Ascend the cobblestone fortress ramparts on decorated royal elephants.",
          "Explore Diwan-i-Khas and Sheesh Mahal mirror courtyards.",
          "Photograph Jal Mahal water palace floating in Man Sagar Lake en route.",
          "Tour nearby Hawa Mahal ('Palace of Winds') in Jaipur Old Pink City."
        ],
        travelTips: "Elephant rides operate on a first-come, first-served basis starting at 8:00 AM."
      }
    },
    {
      id: "qutub-minar",
      category: "heritage",
      categoryName: "Colonial & Monuments",
      title: "Qutub Minar & Red Fort Delhi",
      description: "73-meter tall UNESCO sandstone victory tower built in 1192 AD, Quwwat-ul-Islam Mosque, and 1,600-year-old rust-resistant Iron Pillar.",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800",
      distance: "New Delhi",
      highlights: ["73m Sandstone Minaret", "1,600yr Iron Pillar", "Humayun's Tomb", "Red Fort Ramparts"],
      details: {
        altitude: "700 feet (215 m)",
        bestTime: "October to March | Morning Hours",
        overview: "Qutub Minar is the world's tallest brick minaret, built by Qutb-ud-din Aibak in 1192 AD. The complex contains early Indo-Islamic carvings and the famous Iron Pillar that has stood un-rusted for over 1,600 years.",
        experiences: [
          "Photograph the 5-storey fluted red sandstone minaret carved with Quranic verses.",
          "Examine the 7-meter tall rust-resistant Gupta Empire Iron Pillar.",
          "Drive past Rashtrapati Bhavan, Parliament House, and India Gate war memorial.",
          "Take an exciting bicycle rickshaw ride through the narrow lanes of Old Delhi's Chandni Chowk."
        ],
        travelTips: "Combine Qutub Minar visit with nearby Humayun's Tomb (precursor to the Taj Mahal)."
      }
    },
    {
      id: "fatehpur-sikri",
      category: "heritage",
      categoryName: "Colonial & Monuments",
      title: "Fatehpur Sikri & Buland Darwaza",
      description: "16th-century ghost capital built by Mughal Emperor Akbar in 1571 AD, featuring the 54-meter tall Buland Darwaza victory gate.",
      image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800",
      distance: "Agra (37 km)",
      highlights: ["54m Buland Darwaza", "Salim Chishti Dargah", "Panch Mahal", "Ghost City Ruins"],
      details: {
        altitude: "680 feet (208 m)",
        bestTime: "October to March",
        overview: "Fatehpur Sikri ('City of Victory') was the capital of the Mughal Empire from 1571 to 1585 AD. It was abandoned due to water scarcity, leaving its red sandstone palaces, courtyards, and grand mosques perfectly preserved.",
        experiences: [
          "Enter through Buland Darwaza, the 54-meter tall highest gateway in the world.",
          "Tie a sacred wish thread at the white marble shrine of Sufi Saint Salim Chishti.",
          "Tour Panch Mahal, a 5-storey wind-catching palace supported by 178 carved pillars.",
          "See Jodha Bai's Palace blending Rajasthani and Islamic architectural styles."
        ],
        travelTips: "Official battery-operated eco-buses transport visitors from the parking area to the monument gates."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "gt-faq-1", question: "What is the distance between Delhi, Agra, and Jaipur?", answer: "Delhi to Agra is 210 km (3.5 hours via Yamuna Expressway). Agra to Jaipur is 240 km (4.5 hours via NH21 passing Fatehpur Sikri & Abhaneri stepwell)." },
    { id: "gt-faq-2", question: "Is Taj Mahal closed on any specific day?", answer: "Yes! The Taj Mahal is strictly closed on Fridays for general tourist entry." },
    { id: "gt-faq-3", question: "Are private chauffeured cars provided for the entire Golden Triangle trip?", answer: "Yes! Dedicated private AC cars (Sedan / SUV / Innova) remain with you for your entire journey—from Delhi pickup to Agra, Jaipur, and departure." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Golden Triangle", item: "/packages/golden-triangle" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Golden Triangle Heritage Tour Packages 2026",
    description: "Book top-rated Golden Triangle packages with GhumoFiroo. Includes Delhi Qutub Minar, Agra Taj Mahal sunrise, Fatehpur Sikri & Jaipur Pink City Amer Fort.",
    url: config.baseUrl + "/packages/golden-triangle",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
    duration: "P6D",
    itinerary: [
      { position: 1, name: "Delhi Heritage & Qutub Minar", description: "Qutub Minar, Red Fort & Old Delhi rickshaw tour." },
      { position: 2, name: "Agra Taj Mahal Sunrise", description: "Sunrise entry to Taj Mahal world wonder & Agra Fort." },
      { position: 3, name: "Jaipur Amer Fort & Pink City", description: "Amer Fort elephant ride, Sheesh Mahal & Jal Mahal." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "14500",
      includes: "4-star hotels, Taj Mahal sunrise pass, Amer Fort elephant ride, breakfast, private AC vehicle"
    },
    aggregateRating: {
      ratingValue: 4.92,
      reviewCount: 1310
    }
  })

  return (
    <Layout>
      <SEO 
        title="Golden Triangle Tour Packages 2026 | Delhi, Agra & Jaipur"
        description="Book top-rated Golden Triangle holiday packages. Includes Delhi Qutub Minar, Agra Taj Mahal sunrise, Fatehpur Sikri & Jaipur Pink City Amer Fort."
        keywords="Golden Triangle tour package 2026, Delhi Agra Jaipur tour price, Taj Mahal sunrise entry pass, Jaipur Amer Fort elephant ride"
        canonicalUrl={config.baseUrl + "/packages/golden-triangle"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1600" 
              alt="Golden Triangle Taj Mahal Agra" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GT_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                India's Iconic Heritage Trail
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Golden Triangle Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Delhi Qutub Minar, Agra Taj Mahal sunrise, Fatehpur Sikri & Jaipur Pink City Amer Fort.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Golden Triangle <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.92 ★", sub: "1,310+ Travelers" },
                { label: "World Wonders", val: "Taj Mahal", sub: "Sunrise Entry Ticket" },
                { label: "Hotel Tiers", val: "4-Star Heritage", sub: "Delhi, Agra & Jaipur" },
                { label: "Private Vehicle", val: "Express Highway", sub: "Chauffeured AC Cab" }
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
            title="Select Your Golden Triangle Package" 
            subtitle="Choose from 4-day express breaks or 6-day classic heritage circuits." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {goldenTrianglePackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt="" 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GT_IMG }}
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
              title="Golden Triangle Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Golden Triangle itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "wonders", label: "World Wonders" },
                { key: "forts", label: "Palaces & Forts" },
                { key: "heritage", label: "Colonial & Monuments" }
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {filteredAttractions.map((item, idx) => (
                <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 40}>
                  <div 
                    onClick={() => setSelectedAttraction(item)}
                    className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <img 
                        src={item.image} 
                        alt="" 
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GT_IMG }}
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
                    alt="" 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GT_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes Taj Mahal entry pass & private AC cab</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹14,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Golden Triangle FAQ" subtitle="Important details regarding Taj Mahal opening & vehicle transfers." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Golden Triangle Collection"
          priceText="From ₹14,500"
          priceSubtext="Taj Mahal Sunrise Pass & 4-Star Hotels Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Golden%20Triangle%20Classic%206D5N&price=18500")}
        />
      </div>
    </Layout>
  )
}

export default GoldenTriangle