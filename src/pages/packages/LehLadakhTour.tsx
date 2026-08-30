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

const LehLadakhTour: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_LADAKH_IMG = "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Ladakh', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const ladakhPackages = [
    {
      id: "ladakh-6d-5n",
      title: "Leh & Pangong Tso Lake Express (6D/5N)",
      desc: "Short high-altitude Ladakh break covering Leh acclamation, Khardung La Pass (18,380 ft), and overnight Swiss tent stay at Pangong Tso blue lake.",
      badge: "Express Circuit",
      image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800",
      price: 32500,
      duration: "6 Days / 5 Nights",
      rating: 4.92,
      reviewsCount: 380,
      stay: "Leh Grand Hotel (4N) + Pangong Tso Swiss Tent Camp (1N)",
      vehicle: "Chauffeured Private AC SUV / Scorpio",
      link: "/packages/ladakh-6d-5n",
      highlights: ["Pangong Tso Swiss Tent", "Khardung La Pass", "Hall of Fame", "Shanti Stupa"],
      itinerary: [
        { day: "Day 1", title: "Leh Airport Pickup → Acclimatization Rest", desc: "Private pickup from Leh Kushok Bakula Airport (IXL). Hotel check-in & complete rest for high-altitude acclimatization." },
        { day: "Day 2", title: "Leh Local Sightseeing → Sangam, Magnetic Hill & Hall of Fame", desc: "Visit Hall of Fame, Magnetic Hill gravity spot, Gurudwara Pathar Sahib & Indus-Zanskar Sangam confluence." },
        { day: "Day 3", title: "Leh to Pangong Tso via Chang La Pass (17,590 ft)", desc: "Drive across Chang La Pass to 134km Pangong Blue Lake. Check-in to luxury Swiss tent camp on lakefront." },
        { day: "Day 4", title: "Pangong Lake Sunrise → Leh via Thiksey Monastery", desc: "Sunrise photoshoot at Pangong Lake, return drive to Leh visiting Thiksey & Shey Palace." },
        { day: "Day 5", title: "Leh Shanti Stupa & Leh Main Bazaar Shopping", desc: "Sunset view from Shanti Stupa & Tibetan handicraft shopping in Leh market." },
        { day: "Day 6", title: "Leh Airport Departure Transfer", desc: "Breakfast and drop-off at Leh Airport." }
      ],
      inclusions: ["1 Night Luxury Tent Camp + 4 Nights 4-Star Hotel", "Inner Line Permits Included", "Oxygen Cylinder in SUV", "Daily Breakfast & Dinner"],
      exclusions: ["Flight tickets to Leh"]
    },
    {
      id: "ladakh-7d-6n",
      title: "Ladakh Nubra Valley & Pangong Tso Circuit (7D/6N)",
      desc: "Our best-selling Ladakh itinerary adding Diskit Monastery 106ft Buddha, Hunder sand dunes camel safari & Shyok river route.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800",
      price: 38500,
      duration: "7 Days / 6 Nights",
      rating: 4.98,
      reviewsCount: 790,
      stay: "Leh Hotel (4N) + Nubra Hunder Camp (1N) + Pangong Lake Camp (1N)",
      vehicle: "Chauffeured Private AC Innova / SUV",
      link: "/packages/ladakh-7d-6n",
      highlights: ["Double Humped Camel Safari", "18,380 ft Khardung La", "Diskit 106ft Buddha", "Pangong Lake"],
      itinerary: [
        { day: "Day 1", title: "Leh Airport Pickup → Acclimatization Rest", desc: "Private pickup from Leh Airport. Hotel check-in and full day acclimatization rest." },
        { day: "Day 2", title: "Leh Hall of Fame, Magnetic Hill & Sangam", desc: "Explore Army Hall of Fame, Magnetic Hill & Indus-Zanskar confluence." },
        { day: "Day 3", title: "Leh to Nubra Valley via Khardung La Pass (18,380 ft)", desc: "Cross Khardung La. Tour Diskit 106ft Future Buddha & double-humped camel safari at Hunder sand dunes." },
        { day: "Day 4", title: "Nubra Valley to Pangong Tso via Shyok River Route", desc: "Scenic drive along Shyok River to Pangong Tso blue lake. Night stay in luxury tent camp." },
        { day: "Day 5", title: "Pangong Lake Sunrise → Leh via Chang La Pass", desc: "Pangong lake sunrise, drive over Chang La Pass (17,590 ft) & Thiksey Monastery." },
        { day: "Day 6", title: "Leh Shanti Stupa & Local Bazaar Walk", desc: "Shanti Stupa sunset panorama & Leh main market souvenir walk." },
        { day: "Day 7", title: "Leh Airport Departure Transfer", desc: "Breakfast and drop-off at Leh Airport." }
      ],
      inclusions: ["2 Nights Luxury Tent Camps + 4 Nights 4-Star Leh Hotels", "Inner Line Permits & Wildlife Fees", "Khardung La & Chang La Excursions", "Oxygen Cylinder Assistance", "Daily Meals"],
      exclusions: ["Flight tickets to Leh"]
    }
  ]

  const attractions = [
    {
      id: "pangong-tso",
      category: "lakes",
      categoryName: "Lakes & Passes",
      title: "Pangong Tso 134km Blue Lake",
      description: "World-famous high-altitude saltwater lake at 14,270 ft extending 134 km from India to Tibet, changing colors from azure blue to emerald green.",
      image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800",
      distance: "Changthang Plateau (160 km from Leh)",
      highlights: ["14,270 ft Elevation", "Color-Changing Water", "3 Idiots Shooting Spot", "Lakefront Tent Stays"],
      details: {
        altitude: "14,270 feet (4,350 m)",
        bestTime: "May to September | Sunrise Hours",
        overview: "Pangong Tso ('High Grassland Lake') is an endorheic lake in the Himalayas. Spanning 134 km long, one-third lies in India and two-thirds in Tibet. The lake water does not sink and features vibrant turquoise gradients.",
        experiences: [
          "Stay overnight in luxury Swiss tent camps on the lakefront under starry night skies.",
          "Witness the lake water shift colors from deep blue to turquoise green as the sun rises.",
          "Photograph the famous yellow scooter at the '3 Idiots' movie climax shooting point.",
          "Spot migratory bar-headed geese and Himalayan marmots along the shoreline."
        ],
        travelTips: "Inner Line Permits (ILP) are mandatory for all travelers visiting Pangong Tso."
      }
    },
    {
      id: "khardung-la",
      category: "lakes",
      categoryName: "Lakes & Passes",
      title: "Khardung La Pass (18,380 ft)",
      description: "Historic mountain pass on the Ladakh Range at 18,380 ft elevation. One of the highest motorable roads in the world connecting Leh to Nubra Valley.",
      image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800",
      distance: "Leh (39 km)",
      highlights: ["18,380 ft Elevation", "World's Top Motorable Road", "Karakoram Views", "Prayer Flag Ridge"],
      details: {
        altitude: "18,380 feet (5,602 m)",
        bestTime: "May to October",
        overview: "Khardung La is an iconic high pass maintained by the Border Roads Organisation (BRO). It forms the gateway to the Nubra and Shyok Valleys, offering views of the Karakoram mountain range.",
        experiences: [
          "Photograph the famous yellow BRO signboard marking 18,380 ft elevation.",
          "Drink hot black tea at the Indian Army souvenir cafe at the top of the pass.",
          "Touch snow along high mountain ridges year-round.",
          "Tie colorful Buddhist prayer flags on the windswept summit ridge."
        ],
        travelTips: "Limit your stay at the top of Khardung La Pass to 15-20 minutes to avoid high-altitude sickness."
      }
    },
    {
      id: "nubra-valley",
      category: "valleys",
      categoryName: "Valleys & Dunes",
      title: "Nubra Valley Hunder Sand Dunes",
      description: "High-altitude cold desert at 10,000 ft altitude famous for silver sand dunes, double-humped Bactrian camel safaris, and Diskit 106ft Future Buddha.",
      image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800",
      distance: "Nubra Valley (125 km from Leh)",
      highlights: ["Hunder Sand Dunes", "Bactrian 2-Hump Camels", "Diskit 106ft Buddha", "Shyok River"],
      details: {
        altitude: "10,000 feet (3,050 m)",
        bestTime: "May to September | Sunset Camel Safari",
        overview: "Nubra ('Valley of Flowers') was an essential stop on the ancient Silk Route. Nestled between the Karakoram and Ladakh mountain ranges, it features cold desert sand dunes against snow-capped peaks.",
        experiences: [
          "Ride rare double-humped Bactrian camels across the cold desert sand dunes of Hunder.",
          "Pay homage at 14th-century Diskit Monastery and marvel at the 106ft tall Maitreya Buddha statue.",
          "Drive along the turquoise Shyok River valley framed by rugged granite mountains.",
          "Stay in eco-friendly luxury tents nestled in apricot orchards."
        ],
        travelTips: "Camels at Hunder sand dunes operate safaris daily from 9:00 AM to 7:00 PM."
      }
    },
    {
      id: "thiksey-monastery",
      category: "monasteries",
      categoryName: "Monasteries & Culture",
      title: "Thiksey Monastery (Mini Potala)",
      description: "12-storey Gelugpa Buddhist monastery built in 1430 AD atop a hill, closely resembling the Potala Palace in Lhasa, Tibet. Features a 49ft Maitreya Buddha statue.",
      image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800",
      distance: "Leh (19 km)",
      highlights: ["49ft Maitreya Buddha", "Mini Potala Architecture", "Morning Prayer Chants", "Indus Valley View"],
      details: {
        altitude: "11,800 feet (3,600 m)",
        bestTime: "Year-Round | Morning 6:00 AM Chants",
        overview: "Thiksey Monastery is the largest monastery in Central Ladakh. Perched tiered on a hill, its whitewashed buildings and red temples house a 49-foot two-storey statue of Maitreya Buddha installed in 1970.",
        experiences: [
          "Witness Buddhist monks sounding conch shells and chanting morning prayers at dawn.",
          "Marvel at the 49-foot tall gold-plated Maitreya Buddha seated inside the main temple.",
          "Explore assembly halls filled with ancient murals, thangkas, and stupas.",
          "Enjoy 360-degree rooftop views over the green Indus river valley."
        ],
        travelTips: "Attend morning prayer session at 6:30 AM for a deeply spiritual cultural experience."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "ld-faq-1", question: "Why is high-altitude acclimatization rest necessary in Leh?", answer: "Leh sits at 11,500 ft altitude. Arriving by flight requires a mandatory 24-48 hours rest on Day 1 to allow your body to adapt to lower oxygen levels and prevent AMS." },
    { id: "ld-faq-2", question: "Are oxygen cylinders provided in vehicles?", answer: "Yes! All private SUV/Innova vehicles in our packages are equipped with medical oxygen cylinders for passenger safety when crossing 18,380 ft Khardung La." },
    { id: "ld-faq-3", question: "Are Inner Line Permits (ILP) included for Nubra & Pangong Tso?", answer: "Yes! GhumoFiroo handles 100% of Inner Line Permits and environmental wildlife fees for all guests." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Leh Ladakh Tour", item: "/packages/leh-ladakh-tour" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Leh Ladakh Tour Packages 2026",
    description: "Book top-rated Ladakh tour packages with GhumoFiroo. Includes Pangong Tso blue lake, Khardung La Pass (18,380 ft), Nubra Valley Hunder dunes & double-humped camel safaris.",
    url: config.baseUrl + "/packages/leh-ladakh-tour",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800&q=80",
    duration: "P7D",
    itinerary: [
      { position: 1, name: "Leh Acclimatization & Sangam", description: "Magnetic Hill & Indus-Zanskar Sangam confluence." },
      { position: 2, name: "Khardung La Pass & Nubra Valley", description: "18,380 ft Khardung La & Hunder camel safari." },
      { position: 3, name: "Pangong Tso Blue Lake", description: "134km Pangong lake overnight Swiss tent camp." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "32500",
      includes: "4-star hotels & Swiss tent camps, inner line permits, oxygen cylinder in SUV, daily breakfast & dinner"
    },
    aggregateRating: {
      ratingValue: 4.98,
      reviewCount: 1170
    }
  })

  return (
    <Layout>
      <SEO 
        title="Leh Ladakh Tour Packages 2026 | Pangong Tso, Khardung La & Nubra Valley"
        description="Book top-rated Leh Ladakh tour packages. Includes Pangong Tso 134km blue lake, Khardung La Pass (18,380 ft), Nubra Valley Hunder dunes & double-humped camel safaris."
        keywords="Leh Ladakh tour package 2026, Pangong Tso lake package price, Khardung La pass bike tour, Nubra valley camel safari"
        canonicalUrl={config.baseUrl + "/packages/leh-ladakh-tour"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1600" 
              alt="Leh Ladakh Pangong Tso Lake" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LADAKH_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Land of High Passes Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Leh Ladakh Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Pangong Tso 134km blue lake, Khardung La Pass (18,380 ft), Nubra Valley Hunder sand dunes & double-humped camel safaris.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Ladakh Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "High Pass", val: "18,380 ft", sub: "Khardung La Pass" },
                { label: "Permits", val: "100% Included", sub: "Inner Line Permits" },
                { label: "Safety", val: "Oxygen SUV", sub: "Equipped Transfers" }
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
            title="Select Your Ladakh Tour Package" 
            subtitle="Choose from 6-day Pangong Tso escapes or 7-day Nubra Valley & Khardung La best sellers." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {ladakhPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LADAKH_IMG }}
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
              title="Ladakh Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Ladakh itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "lakes", label: "Lakes & Passes" },
                { key: "valleys", label: "Valleys & Dunes" },
                { key: "monasteries", label: "Monasteries & Culture" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LADAKH_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LADAKH_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes oxygen SUV transfers & permits</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹32,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Ladakh Travel FAQ" subtitle="Important details regarding acclimatization, oxygen cylinders & permits." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Leh Ladakh Collection"
          priceText="From ₹32,500"
          priceSubtext="Pangong Lake Camp & Inner Line Permits Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Ladakh%20Nubra%207D6N&price=38500")}
        />
      </div>
    </Layout>
  )
}

export default LehLadakhTour
