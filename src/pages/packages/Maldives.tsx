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

const Maldives: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_MALDIVES_IMG = "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Maldives', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const maldivesPackages = [
    {
      id: "maldives-4d-3n",
      title: "Maldives Overwater Villa Experience (4D/3N)",
      desc: "Our popular island escape featuring 2 nights in an Beach Villa & 1 night in a luxury Overwater Lagoon Villa with speed boat transfers.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800",
      price: 85000,
      duration: "4 Days / 3 Nights",
      rating: 4.95,
      reviewsCount: 420,
      stay: "5-Star Resort Beach Villa (2N) + Overwater Lagoon Villa (1N)",
      vehicle: "Speedboat / Seaplane Airport Transfers",
      link: "/packages/maldives-4d-3n",
      highlights: ["Overwater Lagoon Villa", "Direct Ocean Access", "All-Inclusive Dining", "Speedboat Transfer"],
      itinerary: [
        { day: "Day 1", title: "Velana Airport Pickup → 5-Star Resort Speedboat Transfer", desc: "Private speedboat reception from Velana Male Airport (MLE). Check-in to 5-star beachfront villa & sunset welcome cocktails." },
        { day: "Day 2", title: "House Reef Snorkeling & Sunset Dolphin Cruise", desc: "Guided house reef snorkeling with sea turtles & evening sunset dolphin watching cruise on traditional Dhoni boat." },
        { day: "Day 3", title: "Check-in to Luxury Overwater Villa & Floating Breakfast", desc: "Upgrade transfer to Overwater Villa with private sun deck loungers & direct lagoon ocean staircase." },
        { day: "Day 4", title: "Resort Breakfast → Speedboat Transfer to Male Airport", desc: "Breakfast over turquoise waters, resort checkout, and speedboat transfer back to Male Airport." }
      ],
      inclusions: ["3 Nights 5-Star Luxury Resort Stay", "1 Night Guaranteed Overwater Villa Upgrade", "All-Inclusive Meal Plan (Breakfast, Lunch & Dinner)", "Roundtrip Speedboat Airport Transfers"],
      exclusions: ["Flight tickets to Male", "Personal spa treatments"]
    },
    {
      id: "maldives-5d-4n",
      title: "Maldives Ultra-Luxury Private Pool Villa & Seaplane (5D/4N)",
      desc: "VVIP luxury vacation with scenic Seaplane flight transfers, private pool overwater villa, floating breakfast & candlelight beach dinner.",
      badge: "VVIP Luxury",
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800",
      price: 135000,
      duration: "5 Days / 4 Nights",
      rating: 4.98,
      reviewsCount: 680,
      stay: "5-Star Deluxe Private Pool Overwater Villa (4N)",
      vehicle: "Roundtrip Trans Maldivian Seaplane Flight",
      link: "/packages/maldives-5d-4n",
      highlights: ["Scenic Seaplane Flight", "Private Pool Overwater Villa", "Candlelight Beach Dinner", "Manta Ray Snorkel"],
      itinerary: [
        { day: "Day 1", title: "Male Airport Reception → Scenic Seaplane Flight", desc: "VIP seaplane lounge access & 25-minute aerial seaplane flight over turquoise atolls to private island resort." },
        { day: "Day 2", title: "Private Pool Water Villa & Floating Breakfast", desc: "Enjoy floating breakfast served in your private overwater pool overlooking coral reef lagoon." },
        { day: "Day 3", title: "Hanifaru Bay Manta Ray & Whale Shark Snorkeling", desc: "Speedboat excursion to UNESCO Biosphere Reserve Hanifaru Bay to swim with giant Manta Rays." },
        { day: "Day 4", title: "Couples Overwater Spa & Candlelight Beach BBQ", desc: "60-minute glass-floor overwater massage & 4-course candlelight lobster dinner on white sand beach." },
        { day: "Day 5", title: "Seaplane Transfer to Male Airport Departure", desc: "Breakfast, checkout, and seaplane transfer back to Male Airport." }
      ],
      inclusions: ["4 Nights 5-Star Deluxe Private Pool Water Villa", "Roundtrip Scenic Seaplane Flight Tickets", "All-Inclusive Premium Dining & Spirits", "1 Private Candlelight Beach Dinner", "Floating Breakfast"],
      exclusions: ["Flight tickets to Male"]
    }
  ]

  const attractions = [
    {
      id: "overwater-villas",
      category: "villas",
      categoryName: "Overwater Villas",
      title: "Overwater Villas & Direct Ocean Access",
      description: "Iconic wooden bungalows built directly over turquoise ocean lagoons featuring private glass floor panels, sun decks, and private pool staircases.",
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800",
      distance: "Private Atoll Resorts",
      highlights: ["Direct Lagoon Access", "Glass Floor Panels", "Private Infinity Pool", "Sunrise & Sunset Decks"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "November to April | Year-Round Tropical Sun",
        overview: "Overwater villas are the gold standard of luxury travel in the Maldives. Stilted directly over crystal clear coral reef lagoons, guests can step right off their private wooden sun deck into 28°C ocean waters.",
        experiences: [
          "Wake up to 180-degree unobstructed views of the Indian Ocean from your king bed.",
          "Enjoy a romantic floating breakfast served in your private villa infinity pool.",
          "Watch tropical fish swim beneath your feet through indoor glass floor viewing panels.",
          "Stargaze from open-air hammocks suspended directly over quiet lagoon waters."
        ],
        travelTips: "Choose Sunrise Water Villas for morning calm or Sunset Water Villas for golden hour evening views."
      }
    },
    {
      id: "seaplane-transfer",
      category: "transfers",
      categoryName: "Seaplane Transfers",
      title: "Trans Maldivian Scenic Seaplane Flight",
      description: "Low-altitude 25-minute aerial flight aboard Trans Maldivian Airways twin-otter seaplanes offering bird's-eye views of coral atolls.",
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800",
      distance: "Velana Airport (Male)",
      highlights: ["Aerial Atoll Panoramas", "Water Takeoff & Landing", "VIP Airport Lounge", "Twin Otter Flight"],
      details: {
        altitude: "1,500 feet (450 m)",
        bestTime: "Daylight Hours 6:00 AM to 4:00 PM",
        overview: "Operating the world's largest seaplane fleet, Trans Maldivian Airways offers one of travel's most thrilling transfer experiences. Flying at 1,500 ft elevation, passengers view ringed coral reefs and turquoise lagoons.",
        experiences: [
          "Take off directly from water runways at Velana International Airport in Male.",
          "Photograph hundreds of tiny green coral islands surrounded by white sand rings from above.",
          "Enjoy air-conditioned VIP lounge access with refreshments prior to boarding.",
          "Land smoothly right beside your resort's floating ocean jetty platform."
        ],
        travelTips: "Seaplanes operate exclusively during daylight hours (6:00 AM to 4:00 PM)."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "mv-faq-1", question: "Do Indian passport holders get Visa on Arrival in Maldives?", answer: "Yes! Indian passport holders receive a FREE 30-Day Visa on Arrival at Male Airport. No prior visa application or fee is required." },
    { id: "mv-faq-2", question: "What is the difference between Speedboat and Seaplane transfers?", answer: "Speedboat transfers connect resorts located in North & South Male Atolls (15-45 mins). Resorts located in distant atolls require a scenic 25-40 min Seaplane flight." },
    { id: "mv-faq-3", question: "Are meals included in Maldives packages?", answer: "Yes! GhumoFiroo packages feature Full Board (Breakfast, Lunch & Dinner) or All-Inclusive plans including unlimited select beverages." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Maldives Overwater", item: "/packages/maldives" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Maldives Overwater Villa Tour Packages 2026",
    description: "Book top-rated Maldives tour packages with GhumoFiroo. Includes 5-star overwater lagoon villas, scenic seaplane flights, all-inclusive gourmet dining & sunset dolphin cruises.",
    url: config.baseUrl + "/packages/maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    duration: "P5D",
    itinerary: [
      { position: 1, name: "Male Airport Pickup & Resort Transfer", desc: "Speedboat / Seaplane transfer to 5-star island resort." },
      { position: 2, name: "Overwater Lagoon Villa Stay", desc: "Overwater villa stay with direct lagoon ocean access & floating breakfast." },
      { position: 3, name: "Sunset Dolphin Cruise & Snorkeling", desc: "House reef snorkeling with sea turtles & sunset dolphin cruise." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "85000",
      includes: "5-star overwater villa, all-inclusive meals, roundtrip speedboat/seaplane transfers, dolphin cruise"
    },
    aggregateRating: {
      ratingValue: 4.98,
      reviewCount: 1100
    }
  })

  return (
    <Layout>
      <SEO 
        title="Maldives Tour Packages 2026 | Overwater Villa & Seaplane"
        description="Book top-rated Maldives holiday packages. Includes 5-star overwater lagoon villas, scenic seaplane flights, all-inclusive gourmet dining & sunset dolphin cruises."
        keywords="Maldives tour package 2026, Maldives overwater villa price, Maldives honeymoon package cost, Maldives seaplane resort price"
        canonicalUrl={config.baseUrl + "/packages/maldives"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1600" 
              alt="Maldives Overwater Villas Resort" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_MALDIVES_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Sunny Side of Life Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Maldives Paradise Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              5-Star Overwater Lagoon Villas, scenic seaplane flights, all-inclusive gourmet dining & sunset dolphin cruises.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Maldives Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.98 ★", sub: "1,100+ Travelers" },
                { label: "Villa Stay", val: "5-Star Overwater", sub: "Direct Lagoon Staircase" },
                { label: "Meals", val: "All-Inclusive", sub: "Full Board Gourmet" },
                { label: "Visa Policy", val: "Free On-Arrival", sub: "30-Day Entry Pass" }
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
            title="Select Your Maldives Package" 
            subtitle="Choose from 4-day overwater villa best sellers or 5-day private pool water villa VVIP collections." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {maldivesPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_MALDIVES_IMG }}
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
              title="Maldives Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Maldives itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "villas", label: "Overwater Villas" },
                { key: "transfers", label: "Seaplane Transfers" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_MALDIVES_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_MALDIVES_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes 5-star villa & all-inclusive meals</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹85,000</span>
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
          <SectionHeading kicker="Assurance Details" title="Maldives Travel FAQ" subtitle="Important details regarding Visa on Arrival, speedboat vs seaplane transfers & meal plans." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Maldives Paradise Collection"
          priceText="From ₹85,000"
          priceSubtext="5-Star Overwater Villa & All-Inclusive Meals"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Maldives%20Overwater%20Villa%204D3N&price=85000")}
        />
      </div>
    </Layout>
  )
}

export default Maldives
