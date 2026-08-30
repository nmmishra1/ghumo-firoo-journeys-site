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

const BaliParadise: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_BALI_IMG = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Bali', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const baliPackages = [
    {
      id: "bali-5d-4n",
      title: "Bali Ubud & Kintamani Volcano Express (5D/4N)",
      desc: "Short Bali tropical break featuring Ubud rice terraces, Bali jungle swing, Mount Batur volcano lookout & Tanah Lot temple sunset.",
      badge: "Express Escape",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
      price: 34500,
      duration: "5 Days / 4 Nights",
      rating: 4.88,
      reviewsCount: 390,
      stay: "Ubud Tropical Resort (2N) + Seminyak Beach Hotel (2N)",
      vehicle: "Chauffeured Private AC Car / SUV",
      link: "/packages/bali-5d-4n",
      highlights: ["Bali Jungle Swing", "Tegallalang Rice Terrace", "Mount Batur Volcano", "Tanah Lot Sunset"],
      itinerary: [
        { day: "Day 1", title: "Denpasar Airport Pickup → Ubud Resort Check-in", desc: "Private pickup from Ngurah Rai Airport (DPS). Check-in to Ubud tropical resort & evening Art Market stroll." },
        { day: "Day 2", title: "Ubud Culture, Jungle Swing & Kintamani Volcano", desc: "Visit Tegallalang rice terraces, Bali jungle swing, Kintamani Mount Batur volcano viewpoint & Luwak coffee estate." },
        { day: "Day 3", title: "Ubud to Seminyak → Tanah Lot Temple Sunset", desc: "Transfer to Seminyak beach hotel. Visit iconic 16th-century sea temple Tanah Lot for sunset." },
        { day: "Day 4", title: "Seminyak Beach Day & Water Sports at Tanjung Benoa", desc: "Parasailing & banana boat at Tanjung Benoa beach, evening sunset cocktail at Potato Head beach club." },
        { day: "Day 5", title: "Seminyak Souvenir Shopping → Denpasar Airport Drop-off", desc: "Breakfast, Krishna souvenir shopping, and private drop-off at Denpasar Airport." }
      ],
      inclusions: ["4 Nights 4-Star Resort Accommodation", "Bali Jungle Swing Pass", "Mount Batur Viewpoint Entry", "Private AC Chauffeured Vehicle", "Daily Breakfast"],
      exclusions: ["Flight tickets to Bali", "Bali Tourist Levy"]
    },
    {
      id: "bali-6d-5n",
      title: "Bali Island Bliss & Nusa Penida T-Rex (6D/5N)",
      desc: "Our best-selling Bali tour adding speed boat day trip to Nusa Penida Kelingking 'T-Rex' Beach, Broken Beach & Uluwatu Kecak dance.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
      price: 42500,
      duration: "6 Days / 5 Nights",
      rating: 4.95,
      reviewsCount: 820,
      stay: "Ubud Private Pool Villa (2N) + Kuta Beach Resort (3N)",
      vehicle: "Chauffeured Private AC Vehicle",
      link: "/packages/bali-6d-5n",
      highlights: ["Nusa Penida T-Rex Beach", "Ubud Private Pool Villa", "Uluwatu Fire Kecak Dance", "Floating Breakfast"],
      itinerary: [
        { day: "Day 1", title: "Denpasar Pickup → Ubud Private Pool Villa Check-in", desc: "Pickup at Denpasar Airport. Check-in to private pool villa in Ubud with flower bath welcome." },
        { day: "Day 2", title: "Ubud Rice Terraces, Jungle Swing & Monkey Forest", desc: "Tegallalang terraces, Bali swing, Sacred Monkey Forest & Kintamani volcano lunch." },
        { day: "Day 3", title: "Nusa Penida Island Day Tour by Speedboat", desc: "Speedboat to Nusa Penida. Visit Kelingking T-Rex Beach, Angel's Billabong & Broken Beach." },
        { day: "Day 4", title: "Water Sports & Uluwatu Sunset Kecak Dance", desc: "Banana boat at Tanjung Benoa beach & sunset fire Kecak dance at cliffside Uluwatu Temple." },
        { day: "Day 5", title: "Jimbaran Bay Seafood Candlelight Dinner", desc: "Relaxing beach day & romantic sunset grilled seafood dinner on Jimbaran beach." },
        { day: "Day 6", title: "Denpasar Airport Departure Transfer", desc: "Breakfast, checkout, and private transfer to Denpasar Airport." }
      ],
      inclusions: ["2 Nights Private Pool Villa + 3 Nights 4-Star Resort", "Nusa Penida Speedboat & Island Car Tour", "Uluwatu Kecak Dance Ticket", "Jimbaran Seafood Sunset Dinner", "Daily Breakfast"],
      exclusions: ["Flight tickets to Bali"]
    }
  ]

  const attractions = [
    {
      id: "nusa-penida",
      category: "beaches",
      categoryName: "Islands & Beaches",
      title: "Nusa Penida Kelingking 'T-Rex' Beach",
      description: "Iconic cliff formation shaped like a Tyrannosaurus Rex overlooking turquoise ocean waves and white powder sand on Nusa Penida island.",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
      distance: "Nusa Penida Island (45 min speedboat from Sanur)",
      highlights: ["T-Rex Cliff Panorama", "Angel's Billabong", "Broken Beach", "Crystal Bay Snorkeling"],
      details: {
        altitude: "500 feet (150 m)",
        bestTime: "April to October | Morning Speedboat 7:30 AM",
        overview: "Nusa Penida is a rugged island located southeast of Bali across the Badung Strait. Kelingking Beach is its world-famous landmark, featuring a green cliff cape extending into the azure sea like a giant T-Rex dinosaur.",
        experiences: [
          "Photograph the famous T-Rex cliff viewpoint over Kelingking Beach.",
          "Swim in the natural infinity pool at Angel's Billabong.",
          "Watch waves crash through the circular rock archway at Broken Beach (Pasih Uug).",
          "Snorkel with giant Manta Rays at Manta Point."
        ],
        travelTips: "Speedboat crossings depart Sanur harbour at 7:30 AM. Wear sturdy shoes for walking along island cliff trails."
      }
    },
    {
      id: "ubud-swing",
      category: "culture",
      categoryName: "Culture & Terraces",
      title: "Tegallalang Rice Terraces & Jungle Swing",
      description: "UNESCO-nominated cascading emerald green Subak irrigation rice terraces in Ubud, famous for high-flying giant jungle swings over palm ravines.",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
      distance: "Ubud (10 km)",
      highlights: ["15m High Jungle Swing", "Subak Rice Terraces", "Luwak Coffee Tasting", "Nest Photo Spots"],
      details: {
        altitude: "2,000 feet (600 m)",
        bestTime: "Year-Round | Morning 8:30 AM",
        overview: "Tegallalang forms the cultural heart of traditional Balinese agriculture. Its terraced paddy fields use the 9th-century 'Subak' cooperative water management system, flanked by coconut palms and jungle gorges.",
        experiences: [
          "Soar 15 meters high over palm tree canopies on safety-harnessed giant jungle swings.",
          "Walk through emerald rice paddies and learn traditional Subak irrigation techniques.",
          "Taste authentic Balinese Luwak coffee and herbal teas at hillside tasting decks.",
          "Pose inside handcrafted woven bamboo bird nests overlooking the valley."
        ],
        travelTips: "Flowing colorful dresses are available to rent at swing parks for dramatic aerial photography."
      }
    },
    {
      id: "tanah-lot",
      category: "temples",
      categoryName: "Cliff Temples",
      title: "Tanah Lot & Uluwatu Cliff Temples",
      description: "Iconic 16th-century offshore sea temples perched on rocky ocean outcrops, famous for dramatic waves, sunset views, and live cliffside Kecak fire dance.",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
      distance: "Tabanan & Bukit Peninsula",
      highlights: ["16th Century Offshore Temple", "70m Uluwatu Cliff", "Kecak Fire Dance", "Jimbaran Seafood Sunset"],
      details: {
        altitude: "230 feet (70 m)",
        bestTime: "Golden Hour Sunset (5:00 PM - 6:30 PM)",
        overview: "Tanah Lot and Uluwatu are two of Bali's seven directionally protective sea temples. Built by Hindu sage Dang Hyang Nirartha in the 16th century, they sit dramatically atop crashing ocean waves.",
        experiences: [
          "Watch the setting sun frame the silhouette of offshore Tanah Lot sea temple.",
          "Attend the 6:00 PM sunset Kecak Fire Dance performance on Uluwatu cliff amphitheater.",
          "Walk along the 70-meter high cliffside paths of Uluwatu overlooking surging Indian Ocean surf.",
          "Enjoy a candlelight grilled seafood dinner on the white sands of Jimbaran Bay."
        ],
        travelTips: "Be mindful of wild monkeys along Uluwatu cliff pathways; secure loose sunglasses and phones."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "ba-faq-1", question: "Do Indian passport holders get Visa on Arrival (VOA) in Bali?", answer: "Yes! Indian passport holders get Visa on Arrival (VOA) at Denpasar Airport for IDR 500,000 (~USD 35). GhumoFiroo provides full arrival guidance." },
    { id: "ba-faq-2", question: "Is a private pool villa stay included in the Bali 6D/5N package?", answer: "Yes! Our best-selling 6D/5N Bali package includes 2 nights stay in a luxury private pool villa in Ubud complete with floating breakfast options." },
    { id: "ba-faq-3", question: "How long is the speedboat journey to Nusa Penida island?", answer: "The speedboat ride from Sanur harbour in Bali to Nusa Penida island takes approximately 45 minutes across calm coastal waters." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Bali Paradise", item: "/packages/bali-paradise" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Bali Paradise Tour Packages 2026",
    description: "Book top-rated Bali tour packages with GhumoFiroo. Includes Ubud private pool villa stay, Tegallalang rice terraces, Bali jungle swing, Nusa Penida Kelingking beach & Uluwatu Kecak dance.",
    url: config.baseUrl + "/packages/bali-paradise",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    duration: "P6D",
    itinerary: [
      { position: 1, name: "Ubud Private Pool Villa & Jungle Swing", description: "Tegallalang rice terraces, Bali swing & Kintamani volcano." },
      { position: 2, name: "Nusa Penida T-Rex Island Tour", description: "Speedboat to Nusa Penida Kelingking & Broken beach." },
      { position: 3, name: "Uluwatu Sunset Kecak Dance", description: "Cliffside Kecak fire dance & Jimbaran seafood dinner." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "34500",
      includes: "Private pool villa, 4-star beach resorts, Nusa Penida speedboat tour, Kecak dance ticket, private AC vehicle"
    },
    aggregateRating: {
      ratingValue: 4.95,
      reviewCount: 1850
    }
  })

  return (
    <Layout>
      <SEO 
        title="Bali Tour Packages 2026 | Private Pool Villas & Nusa Penida"
        description="Book top-rated Bali tour packages. Includes Ubud private pool villa stay, Tegallalang rice terraces, Bali jungle swing, Nusa Penida Kelingking beach & Uluwatu Kecak dance."
        keywords="Bali tour package 2026, Bali private pool villa package, Nusa Penida tour price, Bali honeymoon package"
        canonicalUrl={config.baseUrl + "/packages/bali-paradise"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1600" 
              alt="Bali Rice Terraces & Temples" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_BALI_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Island of the Gods Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Bali Paradise Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Ubud private pool villas, Tegallalang rice terraces, Nusa Penida T-Rex beach, Kintamani volcano & Uluwatu Kecak dance.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Bali Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.95 ★", sub: "1,850+ Travelers" },
                { label: "Pool Villas", val: "Private Luxury", sub: "Ubud Tropical Stays" },
                { label: "Island Cruise", val: "Nusa Penida", sub: "Speedboat & T-Rex Beach" },
                { label: "Private Vehicle", val: "100% Chauffeured", sub: "Denpasar Airport Pickup" }
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
            title="Select Your Bali Tour Package" 
            subtitle="Choose from express 5-day retreats, 6-day Nusa Penida best sellers, or luxury private pool villa honeymoons." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {baliPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_BALI_IMG }}
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
              title="Bali Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Bali itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "beaches", label: "Islands & Beaches" },
                { key: "culture", label: "Culture & Terraces" },
                { key: "temples", label: "Cliff Temples" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_BALI_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_BALI_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes private pool villa & island speedboat</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹34,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Bali Travel FAQ" subtitle="Important details regarding Visa on Arrival, pool villas, and Nusa Penida speedboats." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Bali Paradise Collection"
          priceText="From ₹34,500"
          priceSubtext="Private Pool Villa & Nusa Penida Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Bali%20Island%20Bliss%206D5N&price=42500")}
        />
      </div>
    </Layout>
  )
}

export default BaliParadise