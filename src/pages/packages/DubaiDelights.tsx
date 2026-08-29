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

const DubaiDelights: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_DUBAI_IMG = "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Dubai', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const dubaiPackages = [
    {
      id: "dubai-4d-3n",
      title: "Dubai Highlights & Desert Safari Express (4D/3N)",
      desc: "Short Dubai holiday featuring Burj Khalifa 124th floor, Red Dune 4x4 desert safari with BBQ dinner & Dubai Mall fountain show.",
      badge: "Express Escape",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
      price: 39500,
      duration: "4 Days / 3 Nights",
      rating: 4.88,
      reviewsCount: 410,
      stay: "Bur Dubai 4-Star City Hotel (3N)",
      vehicle: "Chauffeured Private AC SUV / Sedan",
      link: "/packages/dubai-4d-3n",
      highlights: ["Burj Khalifa 124th Floor Ticket", "Lahbab 4x4 Dune Bashing", "Desert BBQ Dinner", "Marina Walk"],
      itinerary: [
        { day: "Day 1", title: "Dubai Airport Pickup → Hotel Check-in & Marina Walk", desc: "Private pickup from Dubai Airport (DXB/DWC). Check-in to 4-star hotel. Evening walk along Dubai Marina promenade." },
        { day: "Day 2", title: "Half-Day Dubai City Tour & Burj Khalifa 124th Floor", desc: "Tour Dubai Frame, Jumeirah Beach, Burj Al Arab photo stop, Dubai Mall & At The Top 124th floor observation deck." },
        { day: "Day 3", title: "Lahbab Red Dune 4x4 Desert Safari & Camp BBQ", desc: "Afternoon 4x4 Land Cruiser pickup for dune bashing, sandboarding, camel rides, henna & live BBQ dinner with belly dance." },
        { day: "Day 4", title: "Dubai Souks Shopping → Airport Transfer", desc: "Breakfast, Gold & Spice Souk shopping, and transfer to Dubai Airport." }
      ],
      inclusions: ["3 Nights 4-Star Hotel Stay", "Burj Khalifa 124th Floor Entry Ticket", "Lahbab Red Dune Safari + BBQ Dinner", "UAE Tourist Visa Included", "Daily Breakfast"],
      exclusions: ["Flight tickets to Dubai", "Tourism Dirham Fee"]
    },
    {
      id: "dubai-5d-4n",
      title: "Dubai Spectacular & Marina Dhow Cruise (5D/4N)",
      desc: "Our best-selling Dubai tour adding luxury Marina Glass Dhow dinner cruise, Miracle Garden & Global Village.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
      price: 48500,
      duration: "5 Days / 4 Nights",
      rating: 4.95,
      reviewsCount: 890,
      stay: "Dubai Marina / Al Barsha 4-Star Hotel (4N)",
      vehicle: "Chauffeured Private AC Vehicle",
      link: "/packages/dubai-5d-4n",
      highlights: ["Marina Dhow Dinner Cruise", "Burj Khalifa 124th Floor", "Miracle Garden", "Global Village"],
      itinerary: [
        { day: "Day 1", title: "Dubai Airport Pickup → Luxury Marina Dhow Cruise", desc: "Airport pickup, hotel check-in & evening glass Dhow dinner cruise along Dubai Marina." },
        { day: "Day 2", title: "Dubai City Tour & Burj Khalifa At The Top", desc: "Jumeirah Mosque, Palm Jumeirah, Burj Khalifa 124th floor & Dubai Fountain show." },
        { day: "Day 3", title: "Miracle Garden & Red Dune 4x4 Safari", desc: "Morning tour of Miracle Garden floral displays & afternoon Lahbab dune safari with BBQ." },
        { day: "Day 4", title: "Global Village & Dubai Mall Shopping", desc: "Evening excursion to Global Village multicultural pavilions & Dubai Mall shopping." },
        { day: "Day 5", title: "Dubai Airport Departure Transfer", desc: "Breakfast, checkout, and private transfer to Dubai Airport." }
      ],
      inclusions: ["4 Nights 4-Star Hotel", "Marina Dhow Dinner Cruise", "Burj Khalifa 124th Floor Ticket", "Miracle Garden Ticket", "UAE Tourist Visa"],
      exclusions: ["Flight tickets"]
    }
  ]

  const attractions = [
    {
      id: "burj-khalifa",
      category: "icons",
      categoryName: "Iconic Landmarks",
      title: "Burj Khalifa At The Top (828m)",
      description: "World's tallest building standing at 828 meters (163 floors). Features high-speed elevators lifting guests to the 124th & 125th floor observation decks.",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
      distance: "Downtown Dubai",
      highlights: ["828m Height", "124th & 125th Floor Deck", "Dubai Fountain Show", "High-Speed Elevator"],
      details: {
        altitude: "2,717 feet (828 m)",
        bestTime: "Prime Time Sunset Hours (4:30 PM - 6:30 PM)",
        overview: "Inaugurated in 2010, Burj Khalifa is the undisputed centerpiece of Dubai's skyline. At 828 meters high, its observation deck on the 124th floor offers 360-degree views across the Persian Gulf and Arabian desert.",
        experiences: [
          "Ascend to the 124th floor in high-speed elevators traveling at 10 meters per second.",
          "Enjoy 360-degree panoramas of Palm Jumeirah, World Islands, and desert dunes through floor-to-ceiling glass.",
          "Watch the world's largest choreographed Dubai Fountain show from the outdoor terrace.",
          "Walk through the Dubai Mall Aquarium tunnel located right at the base of the tower."
        ],
        travelTips: "Book prime sunset hour entry tickets 2 to 3 weeks in advance to avoid long queues."
      }
    },
    {
      id: "desert-safari",
      category: "safari",
      categoryName: "Desert & Safaris",
      title: "Lahbab Red Dune 4x4 Safari & BBQ",
      description: "High-octane 4x4 dune bashing across Lahbab's high red sand dunes, sandboarding, camel rides, and a traditional Bedouin desert camp BBQ dinner.",
      image: "https://images.unsplash.com/photo-1546412414-8035e1786b9b?q=80&w=800",
      distance: "Lahbab Desert (45 km from Dubai)",
      highlights: ["4x4 Land Cruiser Dune Bashing", "Sandboarding", "Camel Rides", "Belly & Tanoura Dance BBQ"],
      details: {
        altitude: "300 feet (90 m)",
        bestTime: "Afternoon 3:00 PM to 9:00 PM",
        overview: "The Lahbab desert is famous for its striking crimson-red sand dunes. The safari combines extreme 4x4 Land Cruiser dune bashing with authentic Arabian hospitality at a desert encampment under the stars.",
        experiences: [
          "Ride in a private 4x4 Land Cruiser taking on 45-degree steep red sand dunes.",
          "Glide down high dunes on sandboards and take sunset camel rides.",
          "Get traditional henna body art painting and try Arabic coffee and dates.",
          "Savor a lavish buffet BBQ dinner with live Tanoura, fire shows, and belly dance performances."
        ],
        travelTips: "Wear comfortable lightweight cotton clothing and open sandals easy to shake sand off."
      }
    },
    {
      id: "marina-cruise",
      category: "cruises",
      categoryName: "Cruises & Waterfront",
      title: "Dubai Marina Glass Dhow Cruise",
      description: "Luxury 2-hour evening cruise along the illuminated Dubai Marina canal aboard a modern glass-enclosed Dhow boat with international buffet dinner.",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
      distance: "Dubai Marina",
      highlights: ["Illuminated Marina Skyline", "International Buffet Dinner", "Live Saxophone / Tanoura", "Open-Air Deck"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "Night 8:00 PM to 10:00 PM",
        overview: "Dubai Marina is the world's largest man-made marina. A Dhow cruise sails along the 3 km canal surrounded by futuristic skyscrapers, Ain Dubai wheel, and luxury yacht clubs.",
        experiences: [
          "Sail past illuminated skyscrapers like Cayan Tower and Jumeirah Beach Residence.",
          "Enjoy a 5-star 4-course international buffet dinner with live cooking stations.",
          "Relax on the open-air upper deck under gentle sea breezes.",
          "Watch traditional Egyptian Tanoura folk dance performances onboard."
        ],
        travelTips: "Upper deck open-air seats provide the best photo angles for city skyline reflection photos."
      }
    },
    {
      id: "miracle-garden",
      category: "icons",
      categoryName: "Iconic Landmarks",
      title: "Dubai Miracle Garden & Global Village",
      description: "World's largest natural flower garden displaying over 150 million blooming flowers crafted into life-sized floral castles and an Emirates A380 aircraft.",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800",
      distance: "Dubailand",
      highlights: ["150 Million Flowers", "Emirates A380 Floral Structure", "Smurfs Village", "Global Village Pavilions"],
      details: {
        altitude: "150 feet (45 m)",
        bestTime: "November to April (Open in Winter Months Only)",
        overview: "Spanning 72,000 sq meters, Dubai Miracle Garden is a floral wonderland in the desert. It holds Guinness World Records for the largest floral installation—a life-sized Emirates Airbus A380 covered in 500,000 fresh flowers.",
        experiences: [
          "Walk beneath colorful umbrella passages and giant floral heart tunnels.",
          "Photograph the Guinness Record Emirates A380 plane covered completely in blooming petunias.",
          "Visit nearby Global Village featuring 27 international culture pavilions and food stalls.",
          "Explore the Smurfs Village with mushroom houses and character installations."
        ],
        travelTips: "Miracle Garden operates strictly during winter months (November through April)."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "db-faq-1", question: "Do Indian passport holders need a visa for Dubai?", answer: "Yes, Indian citizens require a tourist visa before traveling to Dubai. GhumoFiroo handles express 3 to 5 day UAE tourist visa processing." },
    { id: "db-faq-2", question: "Are Burj Khalifa 124th floor tickets pre-booked in the package?", answer: "Yes! All GhumoFiroo Dubai packages include pre-booked prime time / non-prime time Burj Khalifa At The Top 124th & 125th floor observation deck tickets." },
    { id: "db-faq-3", question: "What is included in the Red Dune 4x4 Desert Safari?", answer: "Our desert safari includes pickup in 4x4 Land Cruiser, 30 minutes dune bashing at Lahbab red dunes, sandboarding, camel rides, henna painting, belly dance show, Tanoura show, and live BBQ dinner." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Dubai Delights", item: "/packages/dubai-delights" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Dubai Delights Tour Packages 2026",
    description: "Book top-rated Dubai tour packages with GhumoFiroo. Includes Burj Khalifa 124th floor, Lahbab red dune 4x4 desert safari & BBQ dinner, Dubai Marina Dhow cruise & express visa.",
    url: config.baseUrl + "/packages/dubai-delights",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    duration: "P5D",
    itinerary: [
      { position: 1, name: "Dubai City Tour & Burj Khalifa", description: "City tour & At The Top 124th floor observation deck." },
      { position: 2, name: "Lahbab Red Dune 4x4 Desert Safari", description: "Dune bashing, camel ride & desert camp BBQ dinner." },
      { position: 3, name: "Marina Glass Dhow Cruise", description: "2-hour canal cruise with international buffet dinner." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "39500",
      includes: "4-star hotels, daily breakfast, Burj Khalifa ticket, desert safari BBQ, Dhow cruise & UAE tourist visa"
    },
    aggregateRating: {
      ratingValue: 4.95,
      reviewCount: 2150
    }
  })

  return (
    <Layout>
      <SEO 
        title="Dubai Tour Packages 2026 | Burj Khalifa, Desert Safari & Visa"
        description="Book top-rated Dubai tour packages. Includes Burj Khalifa 124th floor tickets, Lahbab red dune 4x4 desert safari, Marina glass Dhow cruise, Miracle Garden & express UAE visa."
        keywords="Dubai tour package 2026, Dubai desert safari price, Burj Khalifa tickets package, Dubai 5 days tour price"
        canonicalUrl={config.baseUrl + "/packages/dubai-delights"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600" 
              alt="Dubai Burj Khalifa Night Skyline" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_DUBAI_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                City of Superlatives Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Dubai Delights Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Burj Khalifa 124th floor deck, Lahbab red dune 4x4 desert safari, Marina glass Dhow cruise, Miracle Garden & express UAE visa.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Dubai Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.95 ★", sub: "2,150+ Travelers" },
                { label: "Burj Khalifa", val: "124th Floor", sub: "Entry Pass Included" },
                { label: "Red Dune Safari", val: "4x4 Land Cruiser", sub: "Buffet BBQ Dinner" },
                { label: "UAE Visa", val: "Express 3-Day", sub: "100% Processed" }
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
            title="Select Your Dubai Tour Package" 
            subtitle="Choose from express 4-day breaks, 5-day best sellers with Miracle Garden, or Abu Dhabi combos." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {dubaiPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt="" 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_DUBAI_IMG }}
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
              title="Dubai Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Dubai itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "icons", label: "Iconic Landmarks" },
                { key: "safari", label: "Desert & Safaris" },
                { key: "cruises", label: "Cruises & Waterfront" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_DUBAI_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_DUBAI_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes Burj Khalifa ticket & UAE Visa</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹39,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Dubai Travel FAQ" subtitle="Important details regarding UAE visas, desert safari, Burj Khalifa tickets, and airport pickup." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Dubai Delights Collection"
          priceText="From ₹39,500"
          priceSubtext="Burj Khalifa & UAE Visa Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Dubai%20Delights%205D4N&price=45000")}
        />
      </div>
    </Layout>
  )
}

export default DubaiDelights
