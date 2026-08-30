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

const Singapore: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_SINGAPORE_IMG = "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Singapore', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const singaporePackages = [
    { 
      id: "singapore-4d-3n",
      title: "Singapore City & Sentosa Island Express (4D/3N)", 
      desc: "Ideal Singapore starter package covering Gardens by the Bay, Night Safari tram & Universal Studios Sentosa all-day theme park.", 
      badge: "Express Choice", 
      image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800",
      link: "/packages/singapore-4d-3n", 
      price: 48000,
      duration: "4 Days / 3 Nights",
      rating: 4.88,
      reviewsCount: 410,
      stay: "4-Star Orchard / Bugis Hotel (3N)",
      vehicle: "Chauffeured Private AC Vehicle",
      highlights: ["Universal Studios Sentosa", "Gardens by the Bay Supertrees", "Mandai Night Safari", "Merlion Park"],
      itinerary: [
        { day: "Day 1", title: "Changi Airport Pickup → Hotel Check-in & Night Safari", desc: "Chauffeured pickup at Changi Airport. Check-in to hotel & evening Mandai Night Safari guided tram tour." },
        { day: "Day 2", title: "Universal Studios Sentosa All-Day Pass", desc: "Full day at Universal Studios theme park: Battlestar Galactica, Transformers 3D & Mummy ride." },
        { day: "Day 3", title: "Gardens by the Bay & Marina Bay Sands SkyPark", desc: "Cloud Forest dome, Flower Dome, Supertree Grove light show & Marina Bay Sands observation deck." },
        { day: "Day 4", title: "Jewel Changi Rain Vortex → Airport Transfer", desc: "Explore Jewel Changi HSBC Rain Vortex waterfall and transfer to Changi Airport." }
      ],
      inclusions: [
        "3 Nights 4-Star Hotel Stay with Daily Breakfast",
        "Fast-Track Singapore Tourist E-Visa",
        "Universal Studios Sentosa + Night Safari Tram Tickets",
        "Private AC Airport & City Transfers"
      ],
      exclusions: ["Flight tickets to Singapore", "Personal expenses"]
    },
    { 
      id: "singapore-5d-4n",
      title: "Singapore Grand Delight & Cable Car Sky Dining (5D/4N)", 
      desc: "Our best-selling Singapore tour featuring S.E.A. Aquarium, Cable Car Mount Faber line, Wings of Time & Jewel Canopy Park.", 
      badge: "Best Seller", 
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800",
      link: "/packages/singapore-5d-4n", 
      price: 64000,
      duration: "5 Days / 4 Nights",
      rating: 4.95,
      reviewsCount: 890,
      stay: "4-Star Deluxe Marina Bay / Riverside Hotel (4N)",
      vehicle: "Chauffeured Private AC Vehicle",
      highlights: ["S.E.A. Aquarium", "Mount Faber Cable Car", "Wings of Time Laser Show", "Jewel Rain Vortex"],
      itinerary: [
        { day: "Day 1", title: "Changi Airport Pickup → Gardens by the Bay Light Show", desc: "Airport pickup, hotel check-in & evening Gardens by the Bay Supertree light show." },
        { day: "Day 2", title: "Universal Studios Sentosa & Wings of Time Show", desc: "Full day theme park fun and evening laser light water show at Siloso Beach." },
        { day: "Day 3", title: "S.E.A. Aquarium & Singapore Cable Car Sky Dining", desc: "Explore 100,000 ocean animals at S.E.A. Aquarium and evening cable car flight." },
        { day: "Day 4", title: "Mandai River Wonders Pandas & Orchard Road Shopping", desc: "Giant panda habitat at River Wonders and shopping spree along Orchard Road." },
        { day: "Day 5", title: "Jewel Changi Canopy Park → Airport Departure", desc: "Jewel Changi Bouncing Nets & departure transfer." }
      ],
      inclusions: [
        "4 Nights 4-Star Deluxe Hotel Accommodations",
        "Universal Studios + S.E.A. Aquarium + Cable Car Passes",
        "Singapore E-Visa Guaranteed Processing",
        "Private AC Transfers Throughout"
      ],
      exclusions: ["Flight tickets"]
    }
  ]

  const attractions = [
    {
      id: "gardens-by-the-bay",
      category: "landmarks",
      categoryName: "Iconic Landmarks",
      title: "Gardens by the Bay & Supertrees",
      description: "Futuristic 101-hectare botanical park featuring 50-meter high Supertree structures, climate-controlled Cloud Forest dome with indoor waterfall & Flower Dome.",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800",
      distance: "Marina Bayfront",
      highlights: ["50m Supertree Grove", "35m Cloud Forest Waterfall", "Flower Dome", "Garden Rhapsody Light Show"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "Year-Round | Evening Light Show 7:45 PM & 8:45 PM",
        overview: "Gardens by the Bay is Singapore's crown horticultural jewel. The park blends futuristic architecture with lush biodiversity, anchored by the iconic 18 Supertrees wrapped in over 160,000 plants.",
        experiences: [
          "Walk along the elevated OCBC Skyway suspended 22 meters above ground between Supertrees.",
          "Step inside the misty Cloud Forest dome featuring a 35-meter indoor mountain waterfall.",
          "Marvel at Mediterranean flora inside the world's largest glass greenhouse (Flower Dome).",
          "Watch the nightly Garden Rhapsody sound and light show transform Supertrees into colorful beacons."
        ],
        travelTips: "Combined dome entry tickets and OCBC Skyway passes are included in all GhumoFiroo packages."
      }
    },
    {
      id: "universal-studios",
      category: "parks",
      categoryName: "Theme Parks & Wildlife",
      title: "Universal Studios Sentosa",
      description: "Southeast Asia's only Universal Studios theme park featuring 24 rides, shows, and attractions across 7 themed zones like Sci-Fi City & Far Far Away.",
      image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800",
      distance: "Sentosa Island",
      highlights: ["Transformers 3D Ride", "Battlestar Galactica Coaster", "Revenge of the Mummy", "Far Far Away Castle"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "Year-Round | Park Hours 10:00 AM to 7:00 PM",
        overview: "Universal Studios Sentosa delivers Hollywood-grade thrills. Highlights include the world's tallest dueling roller coaster (Battlestar Galactica) and the immersive 3D hyper-reality Transformers ride.",
        experiences: [
          "Join Optimus Prime in a 3D battle against Decepticons on Transformers: The Ride.",
          "Launch backward in complete darkness on the high-speed Revenge of the Mummy roller coaster.",
          "Explore the fairy tale castle of Far Far Away and watch Shrek 4D adventure movies.",
          "Meet Transformers, Minions, and Sesame Street characters during street parades."
        ],
        travelTips: "Fast-Track Universal Express Passes are available through GhumoFiroo to skip normal queue lines."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "sg-faq-1", question: "Do Indian passport holders need a visa for Singapore, and how long does it take?", answer: "Yes, Indian passport holders require an electronic tourist visa (eVisa). GhumoFiroo handles 100% of your Singapore eVisa filing with a guaranteed 3 to 5 working day approval turnaround." },
    { id: "sg-faq-2", question: "What top attractions are included in the Sentosa Island & Universal Studios package?", answer: "Our Sentosa packages include Universal Studios Express passes (no waiting in lines), Singapore Cable Car skypass, S.E.A. Aquarium entry, Wings of Time laser show, and Sentosa Express beach monorail passes." },
    { id: "sg-faq-3", question: "Can we combine Singapore with Genting Dream Cruise or Malaysia?", answer: "Yes! We offer popular 6N/7D twin-country combos (Singapore + Kuala Lumpur / Genting Highlands) as well as 4-night land + 2-night Resort World Genting Dream luxury ocean cruise packages." },
    { id: "sg-faq-4", question: "What is the difference between Singapore 4D3N and 5D4N packages?", answer: "The 4D3N itinerary is ideal for a quick holiday covering Gardens by the Bay, Night Safari, and Universal Studios. The 5D4N package adds a free day for shopping at Orchard Road, Jewel Changi Rain Vortex, and Sentosa Beach Resorts." },
    { id: "sg-faq-5", question: "Is Indian vegetarian and Jain food easily available in Singapore?", answer: "Yes! Singapore features hundreds of authentic Indian restaurants in Little India (like Saravanaa Bhavan, Ananda Bhavan, and Komala Vilas) as well as vegetarian options in Marina Bay Sands and Sentosa." },
    { id: "sg-faq-6", question: "What luxury hotel stay options are provided in GhumoFiroo Singapore packages?", answer: "We provide 4-star and 5-star hotel options including Marina Bay Sands, Swissotel The Stamford, Pan Pacific, Shangri-La Sentosa, and Village Hotel Bugis with daily breakfast buffet." },
    { id: "sg-faq-7", question: "Are flight-inclusive Singapore packages available from major Indian cities?", answer: "Yes, we customize flight-inclusive packages with direct non-stop flights from Delhi (DEL), Mumbai (BOM), Bengaluru (BLR), Chennai (MAA), and Kolkata (CCU)." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Singapore Tour Packages", item: "/packages/singapore" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Singapore Luxury Vacation & Sentosa Packages 2026",
    description: "Experience top-rated Singapore luxury packages with GhumoFiroo. Gardens by the Bay, Marina Bay Sands, Universal Studios Sentosa & Genting Dream cruise combos.",
    url: config.baseUrl + "/packages/singapore",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
    duration: "P5D",
    itinerary: [
      { position: 1, name: "Gardens by the Bay & Marina Bay Skyline", description: "Cloud Forest dome tour & rooftop Marina Bay Sands observation deck." },
      { position: 2, name: "Universal Studios & Sentosa Island", description: "Express theme park pass & Wings of Time laser show at Sentosa beach." },
      { position: 3, name: "Night Safari & Shopping Excursion", description: "Guided Night Safari tram tour & Orchard Road shopping experience." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "48000",
      includes: "4-star & 5-star hotels, daily breakfast, Singapore e-visa submission & private transfers"
    },
    aggregateRating: {
      ratingValue: 4.95,
      reviewCount: 3850
    }
  })

  return (
    <Layout>
      <SEO 
        title="Singapore Tour Packages 2026 | Sentosa, Universal Studios & E-Visa"
        description="Book top-rated Singapore tour packages from India. Experience Marina Bay Sands, Gardens by the Bay, Universal Studios Sentosa VIP, Genting Dream Cruise & Fast-Track E-Visa."
        keywords="Singapore tour package 2026, Singapore E-visa assistance, Universal Studios Sentosa VIP package, Genting Dream Cruise Singapore, Singapore Malaysia twin delight 7 days, Singapore family package price"
        canonicalUrl={config.baseUrl + "/packages/singapore"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1600" 
              alt="Singapore Marina Bay Sands Night Skyline" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SINGAPORE_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Lion City Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Singapore Paradise Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Gardens by the Bay, Marina Bay Sands skyline, Sentosa Island theme parks, Genting Dream ocean cruise & Malaysia twin tours.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Singapore Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.95 ★", sub: "3,850+ Travelers" },
                { label: "Visa Service", val: "Fast E-Visa", sub: "3-5 Days Turnaround" },
                { label: "Theme Parks", val: "Universal Studios", sub: "Express Passes Available" },
                { label: "Private Transfers", val: "100% Chauffeured", sub: "Airport & City Transfers" }
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
            title="Select Your Singapore Package" 
            subtitle="Choose from 4-day city express breaks or 5-day Sentosa & cable car sky dining specials." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {singaporePackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SINGAPORE_IMG }}
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
              title="Singapore Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Singapore itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "landmarks", label: "Iconic Landmarks" },
                { key: "parks", label: "Theme Parks & Wildlife" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SINGAPORE_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SINGAPORE_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes e-visa & 4-star hotel stay</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹48,000</span>
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
          <SectionHeading kicker="Assurance Details" title="Singapore Travel FAQ" subtitle="Important details regarding E-Visa submission, Sentosa rides & cruise packages." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Singapore Paradise Collection"
          priceText="From ₹48,000"
          priceSubtext="Fast-Track E-Visa & Sentosa Passes Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Singapore%20Grand%20Delight%205D4N&price=64000")}
        />
      </div>
    </Layout>
  )
}

export default Singapore
