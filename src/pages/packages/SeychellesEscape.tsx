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

const SeychellesEscape: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_SEYCHELLES_IMG = "https://images.unsplash.com/photo-1589553460732-58ef7a11d986?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Seychelles', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const seychellesPackages = [
    {
      id: "seychelles-5d-4n",
      title: "Mahé & Praslin Island Tropical Break (5D/4N)",
      desc: "Short Seychelles tropical break featuring Mahé Beau Vallon beach, Victoria botanical gardens, and Praslin Anse Lazio granite boulder beach.",
      badge: "Express Escape",
      image: "https://images.unsplash.com/photo-1589553460732-58ef7a11d986?q=80&w=800",
      price: 85000,
      duration: "5 Days / 4 Nights",
      rating: 4.88,
      reviewsCount: 310,
      stay: "Mahé Beach Resort (2N) + Praslin Luxury Resort (2N)",
      vehicle: "Chauffeured Private AC Vehicle + Cat Cocos Ferry",
      link: "/packages/seychelles-5d-4n",
      highlights: ["Anse Lazio Granite Boulders", "Vallée de Mai Double Coconut", "Beau Vallon Beach", "Victoria Clock Tower"],
      itinerary: [
        { day: "Day 1", title: "Mahé Airport Pickup → Beau Vallon Beach Resort", desc: "Private pickup from Seychelles International Airport (SEZ). Check-in to Mahé resort & sunset cocktail at Beau Vallon beach." },
        { day: "Day 2", title: "Mahé Island Tour → Victoria Capital & Morne National Park", desc: "Tour world's smallest capital Victoria, Sir Selwyn Clarke Market, Little Ben clock tower & Morne Seychellois tea factory view." },
        { day: "Day 3", title: "Cat Cocos Fast Ferry to Praslin Island → Vallée de Mai", desc: "High-speed Cat Cocos ferry to Praslin. Tour UNESCO Vallée de Mai forest to see giant Coco de Mer double palm nuts." },
        { day: "Day 4", title: "Anse Lazio & Anse Georgette Beach Day", desc: "Full day relaxing at Anse Lazio, famous for giant pink granite boulders, turquoise waters & shade-giving Takamaka trees." },
        { day: "Day 5", title: "Praslin to Mahé Ferry → Airport Departure", desc: "Breakfast, Cat Cocos ferry return to Mahé, and transfer to Seychelles Airport." }
      ],
      inclusions: ["4 Nights 4-Star Resort Accommodation", "Cat Cocos High-Speed Ferry Tickets", "Vallée de Mai UNESCO Entry Pass", "Private AC Vehicle Transfers", "Daily Breakfast"],
      exclusions: ["Flight tickets to Seychelles", "Environmental Sustainability Levy"]
    },
    {
      id: "seychelles-7d-6n",
      title: "Grand Seychelles 3-Island Hopper (7D/6N)",
      desc: "Our best-selling Seychelles circuit covering Mahé, Praslin & La Digue Anse Source d'Argent (world's most photographed beach).",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1589553460732-58ef7a11d986?q=80&w=800",
      price: 115000,
      duration: "7 Days / 6 Nights",
      rating: 4.98,
      reviewsCount: 640,
      stay: "Mahé Resort (2N) + Praslin Resort (2N) + La Digue Boutique Hotel (2N)",
      vehicle: "Cat Cocos Ferry + Island Bicycle Tour",
      link: "/packages/seychelles-7d-6n",
      highlights: ["Anse Source d'Argent La Digue", "Giant Aldabra Tortoises", "Vallée de Mai Coco de Mer", "Curieuse Island"],
      itinerary: [
        { day: "Day 1", title: "Mahé Airport Pickup → Resort Check-in", desc: "Pickup at Mahé Airport and transfer to seaside resort." },
        { day: "Day 2", title: "Mahé Island Tour & Victoria Market", desc: "Tour Victoria market, Copolia Trail view & Beau Vallon beach." },
        { day: "Day 3", title: "Ferry to Praslin → Vallée de Mai Forest", desc: "Cat Cocos ferry to Praslin & guided tour of Coco de Mer palm forest." },
        { day: "Day 4", title: "Curieuse Island Giant Tortoise Boat Excursion", desc: "Boat trip to Curieuse Island to walk among 300 free-roaming giant Aldabra tortoises & Baie Laraie mangroves." },
        { day: "Day 5", title: "Ferry to La Digue → Bicycle Tour to Anse Source d'Argent", desc: "Schooner ferry to car-free La Digue island. Rent bicycles to ride through L'Union Estate to Anse Source d'Argent." },
        { day: "Day 6", title: "La Digue Anse Sevère & Grand Anse Beach Exploration", desc: "Bicycle tour to secluded Grand Anse & Anse Sevère beaches." },
        { day: "Day 7", title: "La Digue to Mahé Ferry → Airport Departure", desc: "Breakfast, return ferry to Mahé, and transfer to Seychelles International Airport." }
      ],
      inclusions: ["6 Nights 4-Star Resort Accommodations", "All Inter-Island Ferry Tickets (Mahé-Praslin-La Digue)", "La Digue Bicycle Rental", "Curieuse Giant Tortoise Boat Tour", "Daily Breakfast"],
      exclusions: ["Flight tickets to Seychelles"]
    }
  ]

  const attractions = [
    {
      id: "anse-source-d-argent",
      category: "beaches",
      categoryName: "Granite Beaches",
      title: "La Digue Anse Source d'Argent",
      description: "Universally rated the world's most photographed beach, famous for sculpted pink granite boulders, shallow turquoise lagoon, and silver coral sand.",
      image: "https://images.unsplash.com/photo-1589553460732-58ef7a11d986?q=80&w=800",
      distance: "La Digue Island (15 min ferry from Praslin)",
      highlights: ["World's Most Photographed Beach", "Sculpted Granite Boulders", "Car-Free Bicycle Trail", "Clear Kayaking"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "April to May & October to November | Sunset Hours",
        overview: "Anse Source d'Argent on La Digue is an iconic tropical paradise. Massive weather-worn granite boulders frame tiny cove beaches protected by an outer coral reef that keeps waters calm and shallow.",
        experiences: [
          "Rent colorful bicycles to ride through coconut plantations inside L'Union Estate to the beach.",
          "Paddle transparent clear-bottom kayaks between giant weathered granite rock monoliths.",
          "Snorkel in calm shallow turquoise lagoon waters filled with colorful reef fish.",
          "Feed free-roaming giant Aldabra tortoises inside L'Union Estate enclosure."
        ],
        travelTips: "Visit during high tide for swimming or low tide for walking around granite coves."
      }
    },
    {
      id: "vallee-de-mai",
      category: "nature",
      categoryName: "UNESCO Nature Reserves",
      title: "Praslin Vallée de Mai (Coco de Mer)",
      description: "UNESCO World Heritage palm forest home to the legendary Coco de Mer palm tree, which produces the world's largest and heaviest seed (up to 30 kg).",
      image: "https://images.unsplash.com/photo-1589553460732-58ef7a11d986?q=80&w=800",
      distance: "Praslin Island",
      highlights: ["30kg Coco de Mer Double Nut", "UNESCO World Heritage", "Rare Black Parrot", "Prehistoric Palm Forest"],
      details: {
        altitude: "400 feet (120 m)",
        bestTime: "Year-Round | Morning 9:00 AM",
        overview: "Vallée de Mai is a pristine remnant of a prehistoric palm forest. Gen. Charles Gordon once declared it the original biblical 'Garden of Eden'. It is the native home of 6 endemic palm species including the Coco de Mer.",
        experiences: [
          "Walk under towering 30-meter high Coco de Mer palm fronds in a green twilight canopy.",
          "Hold a genuine 30 kg Coco de Mer double coconut nut at the visitor information center.",
          "Listen for the whistle of the rare endangered Seychelles Black Parrot found only on Praslin.",
          "Hike the Circular Firebreak Trail for views over the emerald forest canopy."
        ],
        travelTips: "Hire an official park naturalist guide at the entrance to learn the fascinating botanical biology."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "se-faq-1", question: "Do Indian passport holders need a visa for Seychelles?", answer: "No! Seychelles is a VISA-FREE country for all passport holders. You simply receive an entry Visitor's Permit upon arrival at Mahé Airport." },
    { id: "se-faq-2", question: "How do we travel between Mahé, Praslin, and La Digue islands?", answer: "Inter-island travel is handled by Cat Cocos high-speed catamarans (Mahé to Praslin in 60 mins) and Inter Island Ferries (Praslin to La Digue in 15 mins)." },
    { id: "se-faq-3", question: "Is La Digue island completely car-free?", answer: "Yes! La Digue has almost no motor vehicles. Bicycles and golf carts are the primary mode of transportation." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Seychelles Escape", item: "/packages/seychelles-escape" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Seychelles Escape & 3-Island Hopper Packages 2026",
    description: "Book top-rated Seychelles tour packages with GhumoFiroo. Includes Mahé granite boulder beaches, Praslin Anse Lazio, La Digue Anse Source d'Argent & Cat Cocos catamaran cruises.",
    url: config.baseUrl + "/packages/seychelles-escape",
    image: "https://images.unsplash.com/photo-1589553460732-58ef7a11d986?w=800&q=80",
    duration: "P7D",
    itinerary: [
      { position: 1, name: "Mahé Island & Victoria Capital", description: "Beau Vallon beach & Victoria Sir Selwyn Clarke market." },
      { position: 2, name: "Praslin Vallée de Mai & Anse Lazio", description: "Coco de Mer double nut forest & granite boulder beaches." },
      { position: 3, name: "La Digue Anse Source d'Argent Bicycle Tour", description: "Car-free bicycle ride to world's most photographed beach." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "85000",
      includes: "4-star resorts, all inter-island ferry tickets, La Digue bicycle rental, daily breakfast, private AC transfers"
    },
    aggregateRating: {
      ratingValue: 4.98,
      reviewCount: 950
    }
  })

  return (
    <Layout>
      <SEO 
        title="Seychelles Tour Packages 2026 | Mahé, Praslin & La Digue Island Hopper"
        description="Book top-rated Seychelles tour packages. Includes Mahé granite boulder beaches, Praslin Anse Lazio, La Digue Anse Source d'Argent & Cat Cocos catamaran cruises."
        keywords="Seychelles tour package 2026, Seychelles visa for Indians, La Digue Anse Source d'Argent tour, Praslin Vallee de Mai price"
        canonicalUrl={config.baseUrl + "/packages/seychelles-escape"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1589553460732-58ef7a11d986?q=80&w=1600" 
              alt="Seychelles Granite Boulder Beach" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SEYCHELLES_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Another World Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Seychelles Escape Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Mahé granite boulder beaches, Praslin Anse Lazio, La Digue Anse Source d'Argent & Cat Cocos catamaran cruises.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Seychelles Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.98 ★", sub: "950+ Travelers" },
                { label: "Visa Policy", val: "Visa-Free", sub: "All Passport Holders" },
                { label: "Inter-Island", val: "Cat Cocos", sub: "High-Speed Catamaran" },
                { label: "Iconic Spot", val: "La Digue", sub: "Anse Source d'Argent" }
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
            title="Select Your Seychelles Package" 
            subtitle="Choose from 5-day Mahé & Praslin breaks or 7-day 3-island hopper specials." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {seychellesPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt="" 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SEYCHELLES_IMG }}
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
              title="Seychelles Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Seychelles itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "beaches", label: "Granite Beaches" },
                { key: "nature", label: "UNESCO Nature Reserves" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SEYCHELLES_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SEYCHELLES_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes inter-island ferry tickets & 4-star resorts</span>
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
          <SectionHeading kicker="Assurance Details" title="Seychelles Travel FAQ" subtitle="Important details regarding Visa-Free entry, inter-island ferries & La Digue bicycles." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Seychelles Escape Collection"
          priceText="From ₹85,000"
          priceSubtext="Inter-Island Catamaran Ferry Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Grand%20Seychelles%203-Island%20Hopper%207D6N&price=115000")}
        />
      </div>
    </Layout>
  )
}

export default SeychellesEscape