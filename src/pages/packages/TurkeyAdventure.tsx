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

const TurkeyAdventure: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_TURKEY_IMG = "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Turkey', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const turkeyPackages = [
    {
      id: "turkey-6d-5n",
      title: "Istanbul & Cappadocia Balloon Delight (6D/5N)",
      desc: "Short Turkey highlights tour featuring Istanbul Hagia Sophia, Bosphorus dinner cruise, Cappadocia cave hotel stay & sunrise hot air balloon flight.",
      badge: "Express Balloon",
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800",
      price: 89500,
      duration: "6 Days / 5 Nights",
      rating: 4.95,
      reviewsCount: 390,
      stay: "Istanbul Old City Hotel (3N) + Cappadocia Cave Hotel (2N)",
      vehicle: "Chauffeured Private AC Vehicle + Domestic Flight Transfers",
      link: "/packages/turkey-6d-5n",
      highlights: ["Sunrise Hot Air Balloon Flight", "Cappadocia Cave Hotel", "Hagia Sophia & Blue Mosque", "Bosphorus Dinner Cruise"],
      itinerary: [
        { day: "Day 1", title: "Istanbul Airport Pickup → Hotel Check-in & Bosphorus Cruise", desc: "Private pickup from Istanbul Airport (IST/SAW). Evening luxury Bosphorus dinner cruise with live Turkish folk dance." },
        { day: "Day 2", title: "Istanbul Sultanahmet Tour → Hagia Sophia & Grand Bazaar", desc: "Tour 6th-century Hagia Sophia Grand Mosque, Blue Mosque, Hippodrome & 4,000-shop Grand Bazaar." },
        { day: "Day 3", title: "Domestic Flight to Cappadocia → Cave Hotel Check-in", desc: "Flight to Nevsehir/Kayseri. Check-in to authentic boutique cave hotel cut into volcanic tufa rock." },
        { day: "Day 4", title: "Cappadocia Sunrise Hot Air Balloon & Red Tour", desc: "Sunrise hot air balloon flight over fairy chimneys. Tour Göreme Open Air Museum, Love Valley & Uchisar Castle." },
        { day: "Day 5", title: "Derinkuyu Underground City → Return Flight to Istanbul", desc: "Explore 8-storey Derinkuyu Underground City & evening return domestic flight to Istanbul." },
        { day: "Day 6", title: "Istanbul Spice Bazaar → Airport Departure", desc: "Breakfast, Egyptian Spice Bazaar shopping, and private transfer to Istanbul Airport." }
      ],
      inclusions: ["5 Nights Accommodation (2 Cave Hotel + 3 4-Star Hotels)", "Sunrise Hot Air Balloon Flight Pass", "Domestic Flights (Istanbul-Cappadocia-Istanbul)", "Bosphorus Dinner Cruise Ticket", "Daily Breakfast"],
      exclusions: ["Flight tickets to Istanbul", "Turkey eVisa fee"]
    },
    {
      id: "turkey-8d-7n",
      title: "Grand Turkey Wonders & Pamukkale Travertines (8D/7N)",
      desc: "Our best-selling Turkey circuit adding Pamukkale white calcium terraces, Hierapolis ancient thermal baths & Ephesus Greco-Roman ruins.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800",
      price: 118000,
      duration: "8 Days / 7 Nights",
      rating: 4.98,
      reviewsCount: 760,
      stay: "Istanbul (3N) + Cappadocia Cave (2N) + Pamukkale Thermal Resort (2N)",
      vehicle: "Chauffeured Private AC Vehicle + 2 Domestic Flights",
      link: "/packages/turkey-8d-7n",
      highlights: ["Pamukkale White Terraces", "Ephesus Celsus Library", "Cappadocia Hot Air Balloon", "Bosphorus Cruise"],
      itinerary: [
        { day: "Day 1", title: "Istanbul Arrival → Hotel Check-in", desc: "Pickup at Istanbul Airport and check-in to historic Old City hotel." },
        { day: "Day 2", title: "Istanbul Sultanahmet Full Day Heritage", desc: "Hagia Sophia, Blue Mosque, Topkapi Palace & Grand Bazaar." },
        { day: "Day 3", title: "Flight to Cappadocia → Devrent Valley", desc: "Domestic flight to Cappadocia. Tour Devrent Valley fairy chimneys & Pasabag mushroom rocks." },
        { day: "Day 4", title: "Sunrise Hot Air Balloon & Kaymakli Underground City", desc: "Sunrise balloon flight over Cappadocia canyons & tour 60m deep Kaymakli Underground City." },
        { day: "Day 5", title: "Cappadocia to Pamukkale Overland Drive", desc: "Scenic drive across Anatolian plateau visiting 13th-century Sultanhani Caravanserai." },
        { day: "Day 6", title: "Pamukkale Calcium Terraces & Hierapolis Cleopatra Pool", desc: "Walk barefoot on snow-white travertines & swim in Cleopatra's ancient thermal spring pool." },
        { day: "Day 7", title: "Ephesus Ancient Ruins → Flight to Istanbul", desc: "Tour Ephesus Celsus Library, Grand Theater, Temple of Artemis & evening flight back to Istanbul." },
        { day: "Day 8", title: "Istanbul Shopping → Airport Departure", desc: "Breakfast, Grand Bazaar shopping, and drop-off at Istanbul Airport." }
      ],
      inclusions: ["7 Nights 4-Star & Cave Hotel Stays", "Sunrise Hot Air Balloon Ticket", "All Domestic Flights Included", "Pamukkale & Ephesus Entrance Passes", "Daily Breakfast"],
      exclusions: ["Flight tickets to Istanbul"]
    }
  ]

  const attractions = [
    {
      id: "cappadocia-balloon",
      category: "balloon",
      categoryName: "Hot Air Balloons",
      title: "Cappadocia Hot Air Balloon & Cave Hotels",
      description: "World's premier hot air balloon destination. Over 100 colorful balloons float at sunrise over volcanic fairy chimneys, cave dwellings, and deep erosion canyons.",
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800",
      distance: "Nevsehir / Kayseri (750 km from Istanbul)",
      highlights: ["Sunrise Balloon Flight", "Fairy Chimneys", "Boutique Cave Hotel", "Göreme Open Air Museum"],
      details: {
        altitude: "3,500 feet (1,050 m)",
        bestTime: "April to November | Sunrise Hours 5:30 AM",
        overview: "Cappadocia's surreal landscape was formed millions of years ago by volcanic ash eruptions eroded by wind and water into soft 'fairy chimneys'. Early Christians carved underground cities, churches, and cave homes into the tufa rock.",
        experiences: [
          "Float 1,000 feet above fairy chimney rock spires during a 1-hour sunrise hot air balloon flight.",
          "Celebrate landing with a traditional champagne toast and official flight certificate.",
          "Sleep inside authentic luxury cave hotel suites carved into ancient volcanic rock walls.",
          "Explore 10th-century rock-cut churches adorned with Byzantine frescoes at Göreme Open Air Museum."
        ],
        travelTips: "Hot air balloon flights depend on morning wind conditions; book a 2-night stay in Cappadocia to ensure flight availability."
      }
    },
    {
      id: "hagia-sophia",
      category: "heritage",
      categoryName: "Heritage & Mosques",
      title: "Istanbul Hagia Sophia & Bosphorus Cruise",
      description: "Architectural masterpiece built in 537 AD as the world's largest cathedral, converted into an imperial mosque, alongside luxury Bosphorus strait dinner cruises.",
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800",
      distance: "Istanbul Sultanahmet",
      highlights: ["537 AD Byzantine Dome", "Blue Mosque 20,000 Tiles", "Bosphorus Dinner Cruise", "Grand Bazaar 4,000 Shops"],
      details: {
        altitude: "100 feet (30 m)",
        bestTime: "Year-Round | Morning 9:00 AM",
        overview: "Hagia Sophia ('Holy Wisdom') dominated world architecture for over 1,000 years. Its soaring 55-meter high main dome features golden Byzantine mosaics alongside majestic Islamic calligraphy medallions.",
        experiences: [
          "Marvel at the massive 31-meter wide dome hovering without visible support inside Hagia Sophia.",
          "Photograph the 6 minarets and 20,000 handmade Iznik blue tiles of the neighboring Blue Mosque.",
          "Sail between Europe and Asia aboard a luxury Bosphorus night cruise with live Turkish shows.",
          "Get lost in the 64 covered streets and 4,000 shops of the 15th-century Grand Bazaar."
        ],
        travelTips: "Dress modestly when entering Hagia Sophia (headscarves for women, covered shoulders/knees)."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "tk-faq-1", question: "Can Indian passport holders apply for Turkey eVisa online?", answer: "Yes! Indian passport holders holding a valid US, UK, Ireland, or Schengen visa qualify for a quick 3-minute Turkey eVisa online." },
    { id: "tk-faq-2", question: "Is the sunrise hot air balloon flight in Cappadocia guaranteed?", answer: "Yes! Hot air balloon passes are pre-booked in our packages. In rare cases of weather cancellation, civil aviation offers full ticket refund or re-flight next morning." },
    { id: "tk-faq-3", question: "Are domestic flights inside Turkey included in the package?", answer: "Yes! All GhumoFiroo Turkey tour packages include domestic flights (e.g., Istanbul to Cappadocia and Izmir/Kayseri back to Istanbul) with 20kg checked luggage." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Turkey Adventure", item: "/packages/turkey-adventure" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Turkey Adventure & Hot Air Balloon Packages 2026",
    description: "Book top-rated Turkey tour packages with GhumoFiroo. Includes Istanbul Hagia Sophia, Bosphorus dinner cruises, Cappadocia cave hotels, sunrise hot air balloon flights & Pamukkale.",
    url: config.baseUrl + "/packages/turkey-adventure",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    duration: "P8D",
    itinerary: [
      { position: 1, name: "Istanbul Sultanahmet & Bosphorus Cruise", description: "Hagia Sophia, Blue Mosque & luxury Bosphorus night cruise." },
      { position: 2, name: "Cappadocia Cave Hotel & Hot Air Balloon", description: "Sunrise hot air balloon flight & cave hotel stay." },
      { position: 3, name: "Pamukkale White Calcium Terraces", description: "Pamukkale travertines & Hierapolis ancient thermal baths." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "89500",
      includes: "Cave hotels, hot air balloon pass, domestic flights, Bosphorus cruise, daily breakfast, private AC vehicle"
    },
    aggregateRating: {
      ratingValue: 4.98,
      reviewCount: 1150
    }
  })

  return (
    <Layout>
      <SEO 
        title="Turkey Tour Packages 2026 | Istanbul, Cappadocia Balloon & Pamukkale"
        description="Book top-rated Turkey tour packages. Includes Istanbul Hagia Sophia, Bosphorus dinner cruises, Cappadocia cave hotels, sunrise hot air balloon flights & Pamukkale."
        keywords="Turkey tour package 2026, Cappadocia hot air balloon price, Istanbul tour cost from India, Turkey 7 days trip price"
        canonicalUrl={config.baseUrl + "/packages/turkey-adventure"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1600" 
              alt="Turkey Cappadocia Hot Air Balloons" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_TURKEY_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Where East Meets West Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Turkey Adventure Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Istanbul Hagia Sophia, Bosphorus dinner cruises, Cappadocia cave hotels, sunrise hot air balloon flights & Pamukkale.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Turkey Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.98 ★", sub: "1,150+ Travelers" },
                { label: "Hot Air Balloon", val: "Sunrise Flight", sub: "Pre-Booked Ticket" },
                { label: "Hotel Stay", val: "Authentic Cave", sub: "Boutique Cappadocia" },
                { label: "Domestic Flights", val: "100% Included", sub: "20kg Baggage Allowance" }
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
            title="Select Your Turkey Tour Package" 
            subtitle="Choose from 6-day Istanbul & Cappadocia balloon breaks or 8-day Grand Turkey Pamukkale specials." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {turkeyPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt="" 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_TURKEY_IMG }}
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
              title="Turkey Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Turkey itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "balloon", label: "Hot Air Balloons" },
                { key: "heritage", label: "Heritage & Mosques" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_TURKEY_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_TURKEY_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes hot air balloon flight & cave hotel</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹89,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Turkey Travel FAQ" subtitle="Important details regarding eVisa, hot air balloon flights, and domestic flights." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Turkey Adventure Collection"
          priceText="From ₹89,500"
          priceSubtext="Cappadocia Hot Air Balloon & Cave Hotel Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Grand%20Turkey%20Wonders%208D7N&price=118000")}
        />
      </div>
    </Layout>
  )
}

export default TurkeyAdventure
