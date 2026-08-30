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

const ThailandTropical: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_THAILAND_IMG = "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Thailand', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const thailandPackages = [
    {
      id: "thailand-4d-3n",
      title: "Bangkok & Pattaya Beach Express (4D/3N)",
      desc: "Short Thailand break covering Coral Island speedboat water sports, Alcazar Show Pattaya & Golden Buddha temple tour in Bangkok.",
      badge: "Express Break",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800",
      price: 26500,
      duration: "4 Days / 3 Nights",
      rating: 4.85,
      reviewsCount: 420,
      stay: "Pattaya Beachfront Hotel (2N) + Bangkok City Hotel (1N)",
      vehicle: "Chauffeured Private AC Sedan / SUV",
      link: "/packages/thailand-4d-3n",
      highlights: ["Coral Island Speedboat Tour", "Alcazar Cabaret Show", "Golden Buddha Temple", "Bangkok Shopping"],
      itinerary: [
        { day: "Day 1", title: "Bangkok Airport Pickup → Drive to Pattaya Beach", desc: "Private pickup from Suvarnabhumi (BKK) / Don Mueang (DMK) Airport. Drive to Pattaya resort. Evening Walking Street stroll." },
        { day: "Day 2", title: "Coral Island Speedboat Tour & Alcazar Show", desc: "Speedboat ride to Coral Island (Koh Larn) for parasailing & lunch. Evening VIP seats for Alcazar Cabaret Show." },
        { day: "Day 3", title: "Pattaya to Bangkok → Temple & City Tour", desc: "Drive to Bangkok. Visit Wat Traimit (Golden Buddha) & Wat Pho (Reclining Buddha). Check-in to Bangkok hotel." },
        { day: "Day 4", title: "Indra Market Shopping → Airport Transfer", desc: "Breakfast, Pratunam & Platinum Mall shopping, and private transfer to Bangkok Airport." }
      ],
      inclusions: ["3 Nights 4-Star Hotel Stay", "Coral Island Speedboat Tour + Buffet Lunch", "Alcazar Show VIP Ticket", "Private AC Vehicle", "Daily Breakfast"],
      exclusions: ["Flight tickets to Bangkok", "Visa on arrival fees"]
    },
    {
      id: "thailand-6d-5n",
      title: "Phuket & Krabi Island Hopper (6D/5N)",
      desc: "Our best-selling Thailand island tour featuring Phi Phi Island Maya Bay speedboat cruise, Krabi 4-Islands tour & James Bond Island.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800",
      price: 38500,
      duration: "6 Days / 5 Nights",
      rating: 4.95,
      reviewsCount: 890,
      stay: "Phuket Patong Beach Resort (3N) + Krabi Ao Nang Resort (2N)",
      vehicle: "Chauffeured Private AC Vehicle",
      link: "/packages/thailand-6d-5n",
      highlights: ["Phi Phi Island Maya Bay", "Krabi 4-Islands Boat Tour", "James Bond Island", "Phuket Big Buddha"],
      itinerary: [
        { day: "Day 1", title: "Phuket Airport Pickup → Patong Beach Check-in", desc: "Pickup at Phuket International Airport (HKT). Check-in to Patong beach resort & Bangla Road nightlife stroll." },
        { day: "Day 2", title: "Phi Phi Island & Maya Bay Luxury Speedboat Cruise", desc: "Full day speedboat tour to Maya Bay ('The Beach'), Pileh Lagoon, Viking Cave & Monkey Beach with snorkeling." },
        { day: "Day 3", title: "James Bond Island & Phang Nga Bay Kayaking", desc: "Tour Phang Nga Bay sea caves, Panak Island & famous James Bond Island needle rock." },
        { day: "Day 4", title: "Phuket to Krabi Ferry → Ao Nang Beach", desc: "Scenic ferry transfer to Krabi. Check-in to Ao Nang resort & evening sunset night market." },
        { day: "Day 5", title: "Krabi 4-Islands Longtail Boat Tour", desc: "Island hopping tour to Phra Nang Cave Beach, Tup Island sandbar, Chicken Island & Poda Island." },
        { day: "Day 6", title: "Krabi / Phuket Airport Departure Transfer", desc: "Breakfast, souvenir shopping, and private drop-off at Krabi or Phuket Airport." }
      ],
      inclusions: ["5 Nights 4-Star Beach Resorts", "Phi Phi Island Speedboat Tour + Lunch", "Krabi 4-Islands Boat Tour", "Phuket to Krabi Transfers", "Daily Breakfast"],
      exclusions: ["Flight tickets to Thailand"]
    }
  ]

  const attractions = [
    {
      id: "phi-phi-maya",
      category: "islands",
      categoryName: "Tropical Islands",
      title: "Phi Phi Islands & Maya Bay",
      description: "World-famous archipelago featuring sheer limestone cliffs rising out of emerald waters, white coral sand beaches, and Maya Bay ('The Beach' film location).",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800",
      distance: "Andaman Sea (45 km from Phuket)",
      highlights: ["Maya Bay Limestone Cliff", "Pileh Lagoon Swimming", "Monkey Beach", "Coral Snorkeling"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "November to April | Morning Speedboat Cruise 8:00 AM",
        overview: "Phi Phi Don and Phi Phi Leh form one of Southeast Asia's most stunning marine national parks. Maya Bay on Phi Phi Leh is famous for its ring of 100-meter high steep limestone cliffs surrounding clear turquoise waters.",
        experiences: [
          "Cruise into Maya Bay aboard high-speed catamarans and walk on powdery white coral sand.",
          "Jump from the boat deck into the natural turquoise swimming pool of Pileh Lagoon.",
          "Snorkel around Viking Cave coral reefs filled with clownfish and sea turtles.",
          "Spot wild crab-eating macaques along the jungle shoreline of Monkey Beach."
        ],
        travelTips: "National Park marine entry fees (400 THB per adult) are included in all GhumoFiroo Phi Phi tours."
      }
    },
    {
      id: "krabi-4-islands",
      category: "islands",
      categoryName: "Tropical Islands",
      title: "Krabi 4-Islands & Phra Nang Beach",
      description: "Iconic Krabi island hopping tour covering Phra Nang Cave Beach, Poda Island, Chicken Island, and Tup Island's sea sandbar divide.",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800",
      distance: "Ao Nang Coast, Krabi",
      highlights: ["Tup Sandbar Divide", "Phra Nang Princess Cave", "Chicken Rock Island", "Poda Beach"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "November to April | Low Tide Sandbar Hours",
        overview: "Krabi's 4-Islands tour showcases the region's famous karst geography. At low tide, a narrow white sandbar emerges from the sea connecting Tup Island to Koh Mor, allowing travelers to walk between islands across ocean waters.",
        experiences: [
          "Walk across the open sea on the white sandbar connecting Tup and Mor Islands at low tide.",
          "Swim in turquoise shallow waters beneath the limestone cliffs of Phra Nang Beach.",
          "Photograph the peculiar chicken-head shaped rock pinnacle of Koh Kai (Chicken Island).",
          "Relax under coconut trees on the soft beaches of Koh Poda."
        ],
        travelTips: "Traditional wooden longtail boats or modern speedboats are available based on guest preference."
      }
    },
    {
      id: "bangkok-temples",
      category: "heritage",
      categoryName: "Heritage & Temples",
      title: "Bangkok Golden & Reclining Buddha Temples",
      description: "Historic Royal Bangkok landmarks including Wat Traimit (5.5-ton solid gold Buddha) and Wat Pho (46-meter long reclining golden Buddha).",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800",
      distance: "Bangkok Old City",
      highlights: ["5.5-Ton Solid Gold Buddha", "46m Reclining Buddha", "Chao Phraya Boat", "Grand Palace"],
      details: {
        altitude: "50 feet (15 m)",
        bestTime: "Year-Round | Morning Hours 9:00 AM",
        overview: "Bangkok's spiritual heart features over 400 Buddhist temples (Wats). Wat Traimit houses a 5.5-ton solid gold statue of Lord Buddha discovered inside plaster, while Wat Pho is the birthplace of traditional Thai massage.",
        experiences: [
          "Marvel at the 5.5-ton solid gold Buddha statue at Wat Traimit valued at over $250 million.",
          "Walk past the 46-meter long and 15-meter high gold-leaf Reclining Buddha at Wat Pho.",
          "Take a longtail boat ride along Chao Phraya River past Wat Arun (Temple of Dawn).",
          "Shop for silk, street food, and souvenirs at Pratunam & Platinum Fashion Mall."
        ],
        travelTips: "Respectful temple dress code is strictly enforced (shoulders and knees must be covered)."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "th-faq-1", question: "Is Thailand Visa-Free for Indian passport holders in 2026?", answer: "Yes! India passport holders qualify for Visa-Free entry to Thailand. You can enter hassle-free for up to 30 days without visa fees." },
    { id: "th-faq-2", question: "Are island speedboat tours included in Thailand packages?", answer: "Yes! Our Phuket & Krabi packages include full-day Phi Phi Island Maya Bay speedboat tour and Krabi 4-Islands boat tour with lunch." },
    { id: "th-faq-3", question: "What is the best time of year to visit Thailand beaches?", answer: "November to April offers sunny weather, calm turquoise seas, and ideal conditions for snorkeling in Phuket, Krabi & Koh Samui." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Thailand Tropical", item: "/packages/thailand-tropical" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Thailand Tropical Tour Packages 2026",
    description: "Book top-rated Thailand tour packages with GhumoFiroo. Includes Phuket Patong beach resorts, Phi Phi Island speedboat cruise, Maya Bay, Krabi 4-Islands tour, Coral Island Pattaya & Bangkok temples.",
    url: config.baseUrl + "/packages/thailand-tropical",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
    duration: "P6D",
    itinerary: [
      { position: 1, name: "Phuket Patong Beach & Bangla Walk", description: "Phuket resort check-in & Patong beach stroll." },
      { position: 2, name: "Phi Phi Island & Maya Bay Speedboat", description: "Speedboat cruise to Maya Bay, Pileh Lagoon & Viking Cave." },
      { position: 3, name: "Krabi 4-Islands Longtail Boat Tour", description: "Phra Nang Cave Beach, Tup sandbar & Poda island." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "26500",
      includes: "4-star beach resorts, Phi Phi speedboat tour, Krabi 4-islands tour, daily breakfast, private AC vehicle"
    },
    aggregateRating: {
      ratingValue: 4.95,
      reviewCount: 1780
    }
  })

  return (
    <Layout>
      <SEO 
        title="Thailand Tour Packages 2026 | Phuket, Krabi, Bangkok & Pattaya"
        description="Book top-rated Thailand tour packages. Includes Phuket Patong beach resorts, Phi Phi Island speedboat cruise, Maya Bay, Krabi 4-Islands tour, Coral Island Pattaya & Bangkok temples."
        keywords="Thailand tour package 2026, Phuket Phi Phi island package price, Krabi 4 islands tour cost, Bangkok Pattaya trip price"
        canonicalUrl={config.baseUrl + "/packages/thailand-tropical"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1600" 
              alt="Thailand Phi Phi Island Maya Bay" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_THAILAND_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Land of Smiles Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Thailand Tropical Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Phuket Patong beach resorts, Phi Phi Island Maya Bay speedboat cruises, Krabi limestone karsts, Coral Island & Bangkok temples.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Thailand Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.95 ★", sub: "1,780+ Travelers" },
                { label: "Visa Policy", val: "Visa-Free", sub: "Indian Passport Entry" },
                { label: "Island Tours", val: "Phi Phi & Krabi", sub: "Speedboat Included" },
                { label: "Private Transfers", val: "100% Chauffeured", sub: "Airport & Hotel Cabs" }
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
            title="Select Your Thailand Tour Package" 
            subtitle="Choose from express 4-day Bangkok & Pattaya breaks, 6-day Phuket & Krabi island hoppers, or 7-day Grand Thailand circuits." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {thailandPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_THAILAND_IMG }}
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
              title="Thailand Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Thailand itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "islands", label: "Tropical Islands" },
                { key: "heritage", label: "Heritage & Temples" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_THAILAND_IMG }}
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
                        <h3 className="text-lg font-serif font-bold text-[#E5C378] mb-2 group-hover:text-white transition-colors">
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_THAILAND_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes Phi Phi speedboat cruise & beach resorts</span>
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
          <SectionHeading kicker="Assurance Details" title="Thailand Travel FAQ" subtitle="Important details regarding Visa-Free policy, speedboat tours, and weather seasons." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Thailand Tropical Collection"
          priceText="From ₹26,500"
          priceSubtext="Phi Phi Island Speedboat & Beach Resorts Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Phuket%20Krabi%20Island%20Hopper%206D5N&price=38500")}
        />
      </div>
    </Layout>
  )
}

export default ThailandTropical
