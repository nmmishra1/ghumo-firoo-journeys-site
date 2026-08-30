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

const MauritiusBliss: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_MAURITIUS_IMG = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Mauritius', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const mauritiusPackages = [
    {
      id: "mauritius-6d-5n",
      title: "Mauritius Sun, Sea & Chamarel Coloured Earth (6D/5N)",
      desc: "Short Mauritius tropical holiday featuring Île aux Cerfs catamaran speed boat cruise, Chamarel 7-Coloured Earth & Chamarel Waterfall.",
      badge: "Express Paradise",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
      price: 68500,
      duration: "6 Days / 5 Nights",
      rating: 4.92,
      reviewsCount: 380,
      stay: "4-Star Beach Resort (5N)",
      vehicle: "Chauffeured Private AC SUV / Sedan",
      link: "/packages/mauritius-6d-5n",
      highlights: ["Île aux Cerfs Catamaran Cruise", "Chamarel 7-Coloured Earth", "Grand Bassin Sacred Lake", "Trou aux Cerfs Volcano"],
      itinerary: [
        { day: "Day 1", title: "SSR Airport Pickup → 4-Star Beach Resort Check-in", desc: "Private pickup from Sir Seewoosagur Ramgoolam Airport (MRU). Check-in to beachfront resort & evening tropical cocktail." },
        { day: "Day 2", title: "North Island City Tour → Port Louis & Caudan Waterfront", desc: "Visit Capital Port Louis, Historic Citadel Fort, Caudan Waterfront & Pamplemousses Botanical Garden giant water lilies." },
        { day: "Day 3", title: "Île aux Cerfs Speedboat Cruise & Parasailing", desc: "Speedboat transfer to Île aux Cerfs paradise island. Enjoy parasailing, under-sea walk & BBQ lunch on private beach." },
        { day: "Day 4", title: "South Island Scenic Tour → Chamarel 7-Coloured Earth", desc: "Visit Trou aux Cerfs extinct volcano crater, Grand Bassin Sacred Hindu Lake & Chamarel 7-Coloured Earth sand dunes & waterfall." },
        { day: "Day 5", title: "Le Morne Brabant Beach & Lagoon Watersports", desc: "Full day leisure at Le Morne beach. Optional mountain trek or glass-bottom boat coral snorkeling." },
        { day: "Day 6", title: "Duty-Free Shopping → SSR Airport Departure Transfer", desc: "Breakfast, duty-free sugarcane rum shopping, and private transfer to SSR Mauritius Airport." }
      ],
      inclusions: ["5 Nights 4-Star Beachfront Resort Stay", "Île aux Cerfs Speedboat Cruise + BBQ Lunch", "Full North & South Island Chauffeured Tours", "Daily Breakfast & Dinner (Half-Board)", "Private AC Vehicle"],
      exclusions: ["Flight tickets to Mauritius", "Personal watersports fees"]
    },
    {
      id: "mauritius-7d-6n",
      title: "Mauritius Grand Luxury & Le Morne Sunset (7D/6N)",
      desc: "Our best-selling Mauritius holiday adding Casela Nature Park 4x4 quad biking, lion walk & Le Morne mountain sunset views.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
      price: 84500,
      duration: "7 Days / 6 Nights",
      rating: 4.98,
      reviewsCount: 790,
      stay: "5-Star Beachfront Luxury Resort (6N)",
      vehicle: "Chauffeured Private AC Vehicle",
      link: "/packages/mauritius-7d-6n",
      highlights: ["Casela Nature Park Quad Safari", "Île aux Cerfs Catamaran", "Le Morne UNESCO Peak", "Chamarel Waterfall"],
      itinerary: [
        { day: "Day 1", title: "Mauritius Arrival → 5-Star Resort Welcome", desc: "Airport pickup, resort check-in & welcome dinner." },
        { day: "Day 2", title: "North Island Tour & Port Louis Craft Market", desc: "Port Louis Citadel, Caudan Waterfront & Bagatelle Mall." },
        { day: "Day 3", title: "Île aux Cerfs Luxury Catamaran Cruise", desc: "Sailing catamaran cruise along GRSE Waterfalls & Île aux Cerfs beach BBQ lunch." },
        { day: "Day 4", title: "Casela World of Adventures 4x4 Quad Bike Safari", desc: "Safari in Casela Nature Park to spot zebras, ostriches, giant tortoises & optional Lion Walk." },
        { day: "Day 5", title: "South Island Scenic Tour & Chamarel Rhumerie", desc: "Trou aux Cerfs crater, Grand Bassin Ganga Talao & rum tasting at Rhumerie de Chamarel." },
        { day: "Day 6", title: "Le Morne Brabant Beach Relax & Sunset Cruise", desc: "Beach relaxation beneath UNESCO Le Morne Brabant mountain & evening catamaran sunset cruise." },
        { day: "Day 7", title: "Mauritius Airport Departure Transfer", desc: "Breakfast, checkout, and private drop-off at SSR Mauritius Airport." }
      ],
      inclusions: ["6 Nights 5-Star Beachfront Resort Stay", "Île aux Cerfs Catamaran Cruise + BBQ", "Casela Nature Park Safari Ticket", "Daily Breakfast & Dinner", "Private AC Transfers"],
      exclusions: ["Flight tickets to Mauritius"]
    }
  ]

  const attractions = [
    {
      id: "ile-aux-cerfs",
      category: "islands",
      categoryName: "Islands & Cruises",
      title: "Île aux Cerfs Island & Catamaran Cruise",
      description: "Private 87-hectare island off Mauritius east coast famous for turquoise lagoons, white coral sand beaches, parasailing, and catamaran BBQ cruises.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
      distance: "East Coast (Trou d'Eau Douce)",
      highlights: ["Luxury Catamaran Cruise", "GRSE Waterfalls", "Beach Seafood BBQ", "Parasailing"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "Year-Round | Morning Catamaran Cruise 9:00 AM",
        overview: "Île aux Cerfs is Mauritius' most celebrated lagoon island. Surrounded by 100% calm crystal clear waters, it offers a day of tropical luxury, beach watersports, and catamaran sailing.",
        experiences: [
          "Sail across calm east coast lagoons aboard luxury catamarans with open bar drinks.",
          "Visit Grand River South East (GRSE) waterfall hidden in lush jungle ravines.",
          "Enjoy a grilled seafood and chicken BBQ lunch served directly on the beach.",
          "Try tandem parasailing and underwater helmet walking along coral reefs."
        ],
        travelTips: "Catamaran cruises depart from Trou d'Eau Douce jetty at 9:15 AM."
      }
    },
    {
      id: "chamarel-coloured-earth",
      category: "nature",
      categoryName: "Volcanoes & Nature",
      title: "Chamarel 7-Coloured Earth & Waterfall",
      description: "Geological phenomenon of sand dunes featuring 7 distinct colors (red, brown, violet, green, blue, purple & yellow) alongside the 100m Chamarel Waterfall.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
      distance: "Black River District (South-West)",
      highlights: ["7-Coloured Volcanic Sand Dunes", "100m Chamarel Waterfall", "Giant Aldabra Tortoises", "Rhumerie Rum Distillery"],
      details: {
        altitude: "900 feet (280 m)",
        bestTime: "Year-Round | Sunny Afternoon Hours",
        overview: "The Seven Coloured Earths of Chamarel were created by basaltic lava weathering into clay mineral sands. The 7 distinct colors naturally settle into separate layers even if mixed together.",
        experiences: [
          "Observe the surreal multi-colored rainbow sand dunes from wooden observation decks.",
          "Photograph the 100-meter sheer drop of Chamarel Waterfall plummeting into a jungle basin.",
          "Pet giant Aldabra tortoises residing in the Chamarel park enclosure.",
          "Tour Rhumerie de Chamarel distillery to sample premium single-estate Mauritian rum."
        ],
        travelTips: "Sunlight accentuates the vibrant color contrast of the sand dunes; visit between 12:00 PM and 3:00 PM."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "mr-faq-1", question: "Do Indian passport holders get Visa on Arrival in Mauritius?", answer: "Yes! Indian passport holders receive a FREE 60-Day Visa on Arrival upon landing at SSR International Airport in Mauritius." },
    { id: "mr-faq-2", question: "Are meals included in Mauritius tour packages?", answer: "Yes! All GhumoFiroo Mauritius resort packages are on Half-Board basis (Daily Breakfast & 4-course Dinner included at resort restaurants)." },
    { id: "mr-faq-3", question: "What is included in the Île aux Cerfs day trip?", answer: "Our Île aux Cerfs trip includes speedboat/catamaran transfers, visit to GRSE Waterfalls, open-bar drinks, and a beachside grilled seafood BBQ lunch." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Mauritius Bliss", item: "/packages/mauritius-bliss" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Mauritius Bliss & Chamarel Tour Packages 2026",
    description: "Book top-rated Mauritius tour packages with GhumoFiroo. Includes Île aux Cerfs catamaran speed boat cruise, Chamarel 7-Coloured Earth, Chamarel Waterfall & 5-star beachfront resorts.",
    url: config.baseUrl + "/packages/mauritius-bliss",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    duration: "P7D",
    itinerary: [
      { position: 1, name: "North Island & Port Louis", description: "Port Louis capital, Caudan waterfront & Citadel fort." },
      { position: 2, name: "Île aux Cerfs Catamaran Cruise", description: "Catamaran cruise along GRSE waterfalls & beach BBQ lunch." },
      { position: 3, name: "South Island & Chamarel 7-Coloured Earth", description: "Trou aux Cerfs crater & Chamarel 7-coloured sand dunes." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "68500",
      includes: "4-star & 5-star beachfront resorts, daily breakfast & dinner, Île aux Cerfs catamaran cruise + BBQ, private AC vehicle"
    },
    aggregateRating: {
      ratingValue: 4.98,
      reviewCount: 1170
    }
  })

  return (
    <Layout>
      <SEO 
        title="Mauritius Tour Packages 2026 | Île aux Cerfs & Chamarel Coloured Earth"
        description="Book top-rated Mauritius holiday packages. Includes Île aux Cerfs catamaran speed boat cruise, Chamarel 7-Coloured Earth, Chamarel Waterfall & 5-star beachfront resorts."
        keywords="Mauritius tour package 2026, Mauritius visa for Indians, Ile aux Cerfs catamaran cruise price, Chamarel 7 coloured earth cost"
        canonicalUrl={config.baseUrl + "/packages/mauritius-bliss"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600" 
              alt="Mauritius Tropical Lagoon Beach" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_MAURITIUS_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Star & Key of Indian Ocean Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Mauritius Bliss Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Île aux Cerfs catamaran speed boat cruises, Chamarel 7-Coloured Earth, Chamarel Waterfall & 5-star beachfront resorts.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Mauritius Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.98 ★", sub: "1,170+ Travelers" },
                { label: "Visa Policy", val: "Free On-Arrival", sub: "60-Day Entry Permit" },
                { label: "Resort Plan", val: "Half-Board", sub: "Breakfast & 4-Course Dinner" },
                { label: "Island Cruise", val: "Catamaran BBQ", sub: "Île aux Cerfs & Waterfalls" }
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
            title="Select Your Mauritius Package" 
            subtitle="Choose from 6-day Chamarel coloured earth breaks or 7-day 5-star beachfront resort specials." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {mauritiusPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_MAURITIUS_IMG }}
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
              title="Mauritius Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Mauritius itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "islands", label: "Islands & Cruises" },
                { key: "nature", label: "Volcanoes & Nature" }
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
                        alt={item.title || item.name || "Sightseeing Highlight"} 
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_MAURITIUS_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_MAURITIUS_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes beachfront resort & Catamaran cruise</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹68,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Mauritius Travel FAQ" subtitle="Important details regarding free 60-day visa on arrival & island transfers." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Mauritius Bliss Collection"
          priceText="From ₹68,500"
          priceSubtext="Île aux Cerfs Catamaran & Half-Board Resorts Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Mauritius%20Grand%20Luxury%207D6N&price=84500")}
        />
      </div>
    </Layout>
  )
}

export default MauritiusBliss