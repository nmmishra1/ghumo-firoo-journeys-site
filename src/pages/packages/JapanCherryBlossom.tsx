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

const JapanCherryBlossom: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_JAPAN_IMG = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Japan', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const japanPackages = [
    {
      id: "japan-6d-5n",
      title: "Japan Golden Route & Shinkansen Express (6D/5N)",
      desc: "Short Japan break featuring Tokyo Skytree, Mount Fuji 5th Station (2,305m), Hakone Lake Ashi pirate cruise & Shinkansen bullet train to Kyoto.",
      badge: "Express Golden Route",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
      price: 145000,
      duration: "6 Days / 5 Nights",
      rating: 4.95,
      reviewsCount: 340,
      stay: "Tokyo Shinjuku 4-Star (3N) + Kyoto Central Hotel (2N)",
      vehicle: "Chauffeured Private AC Vehicle + 320km/h Shinkansen Bullet Train",
      link: "/packages/japan-6d-5n",
      highlights: ["Shinkansen 320km/h Ticket", "Mount Fuji 5th Station", "Hakone Lake Ashi Cruise", "Kyoto Fushimi Inari"],
      itinerary: [
        { day: "Day 1", title: "Tokyo Haneda / Narita Airport Pickup → Hotel Check-in", desc: "Private airport reception at Haneda (HND) or Narita (NRT). Check-in to Tokyo 4-star hotel & evening Shinjuku neon tour." },
        { day: "Day 2", title: "Tokyo Full Day Tour → Asakusa Sensoji & Skytree", desc: "Tour 628 AD Sensoji Temple, Nakamise shopping street, Shibuya Scramble Crossing & Tokyo Skytree 350m observation deck." },
        { day: "Day 3", title: "Mount Fuji 5th Station (2,305m) & Hakone Pirate Cruise", desc: "Drive to Mount Fuji 5th Station, Owakudani volcanic valley cable car & Hakone Lake Ashi pirate ship cruise." },
        { day: "Day 4", title: "Tokyo to Kyoto by 320 km/h Shinkansen Bullet Train", desc: "Board high-speed Shinkansen bullet train from Tokyo to Kyoto. Evening Gion geisha district walking tour." },
        { day: "Day 5", title: "Kyoto Fushimi Inari 10,000 Torii Gates & Arashiyama Bamboo", desc: "Walk through 10,000 vermilion Torii gates at Fushimi Inari Shrine, Kinkaku-ji Golden Pavilion & Arashiyama Bamboo Grove." },
        { day: "Day 6", title: "Kyoto / Osaka Kansai Airport Departure Transfer", desc: "Breakfast, green tea souvenir shopping, and private transfer to Osaka Kansai (KIX) Airport." }
      ],
      inclusions: ["5 Nights 4-Star Hotel Stay", "Shinkansen Bullet Train Reserved Ticket", "Mount Fuji 5th Station & Hakone Cruise Passes", "Private AC Transfers", "Daily Breakfast"],
      exclusions: ["Flight tickets to Japan", "Visa processing fees"]
    },
    {
      id: "japan-7d-6n",
      title: "Japan Cherry Blossom & Osaka Castle Special (7D/6N)",
      desc: "Our best-selling Japan tour adding Osaka Castle, Dotonbori street food, Nara Deer Park & spring sakura blooming spots.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
      price: 168000,
      duration: "7 Days / 6 Nights",
      rating: 4.98,
      reviewsCount: 710,
      stay: "Tokyo Hotel (3N) + Kyoto Hotel (2N) + Osaka Hotel (1N)",
      vehicle: "Chauffeured Private AC Vehicle + Shinkansen Pass",
      link: "/packages/japan-7d-6n",
      highlights: ["Osaka Castle Sakura Park", "Nara Bowing Deer Park", "Mount Fuji 5th Station", "Fushimi Inari Gates"],
      itinerary: [
        { day: "Day 1", title: "Tokyo Airport Pickup → Hotel Check-in", desc: "Pickup at Tokyo Airport and check-in to Shinjuku hotel." },
        { day: "Day 2", title: "Tokyo Imperial Palace & Asakusa Sensoji Temple", desc: "Tour Imperial Palace East Gardens, Asakusa Sensoji Temple, Ginza shopping & Shibuya Crossing." },
        { day: "Day 3", title: "Mount Fuji 5th Station & Lake Kawaguchiko", desc: "Drive up Mount Fuji 5th Station (2,305m) & cherry blossom walk along Lake Kawaguchiko." },
        { day: "Day 4", title: "Tokyo to Kyoto by Bullet Train → Gion District", desc: "320 km/h Shinkansen bullet train to Kyoto. Visit Kiyomizu-dera & Gion geisha quarter." },
        { day: "Day 5", title: "Kyoto Fushimi Inari & Nara Sacred Bowing Deer Park", desc: "Fushimi Inari Torii gates, drive to Nara Park to feed wild bowing Sika deer & Todaiji Temple Buddha." },
        { day: "Day 6", title: "Osaka Castle Park & Dotonbori Street Food Tour", desc: "Tour 16th-century Osaka Castle sakura gardens & evening Takoyaki street food tour at Dotonbori." },
        { day: "Day 7", title: "Osaka Kansai Airport Departure Transfer", desc: "Breakfast, Japanese sweets shopping, and drop-off at Kansai International Airport (KIX)." }
      ],
      inclusions: ["6 Nights 4-Star Hotel Accommodations", "Shinkansen Bullet Train Ticket", "Mount Fuji 5th Station & Osaka Castle Entry Passes", "Nara Deer Park Excursion", "Daily Breakfast"],
      exclusions: ["Flight tickets to Japan"]
    }
  ]

  const attractions = [
    {
      id: "mount-fuji",
      category: "icons",
      categoryName: "Iconic Peaks",
      title: "Mount Fuji 5th Station (2,305m)",
      description: "Japan's sacred 3,776-meter active volcano mountain. The 5th Station at 2,305 meters elevation offers sweeping views of the Five Fuji Lakes.",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
      distance: "Yamanashi Prefecture (100 km from Tokyo)",
      highlights: ["7,560 ft Elevation", "Komitake Shinto Shrine", "Lake Kawaguchiko View", "Volcanic Ash Peak"],
      details: {
        altitude: "7,560 feet (2,305 m)",
        bestTime: "April to May (Sakura) | Oct to Nov (Autumn Foliage)",
        overview: "Mount Fuji (Fuji-san) is an UNESCO World Heritage site and Japan's highest peak at 3,776 meters. The Fuji Subaru Line 5th Station sits halfway up the mountain, providing panoramic views above clouds.",
        experiences: [
          "Drive up the winding Subaru Line highway to 2,305m elevation 5th Station.",
          "Pray at Komitake Shinto Shrine standing on the mountain slope for over 1,000 years.",
          "Stroll along Lake Kawaguchiko shoreline framing Mount Fuji with pink cherry blossoms.",
          "Cruise Lake Ashi in Hakone aboard a colorful medieval pirate ship."
        ],
        travelTips: "Clear morning hours offer the highest chance of seeing Mount Fuji's snow peak unobstructed by clouds."
      }
    },
    {
      id: "kyoto-fushimi",
      category: "temples",
      categoryName: "Shrines & Castles",
      title: "Kyoto Fushimi Inari 10,000 Torii Gates",
      description: "Shinto shrine complex dedicated to Inari (god of rice & agriculture), famous for its mountain trail covered by 10,000 vermilion Torii gates.",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
      distance: "Kyoto City Center",
      highlights: ["10,000 Vermilion Gates", "Fox (Kitsune) Statues", "Golden Pavilion Kinkaku-ji", "Arashiyama Bamboo"],
      details: {
        altitude: "760 feet (233 m)",
        bestTime: "Year-Round | Early Morning 7:30 AM",
        overview: "Founded in 711 AD, Fushimi Inari Taisha is Kyoto's most famous Shinto shrine. The 4 km hiking trail up Mount Inari winds under thousands of vibrant red Torii gates donated by Japanese businesses.",
        experiences: [
          "Walk under continuous tunnels of 10,000 vermilion wooden Torii gates.",
          "Spot stone fox (Kitsune) statues holding key-of-the-rice-granary in their mouths.",
          "Visit nearby Kinkaku-ji (Golden Pavilion) covered in pure gold leaf reflecting in mirror pond.",
          "Walk through towering green bamboo stalks at Arashiyama Bamboo Grove."
        ],
        travelTips: "Arrive before 8:00 AM to photograph the Torii gate tunnels empty without crowds."
      }
    },
    {
      id: "osaka-castle",
      category: "temples",
      categoryName: "Shrines & Castles",
      title: "Osaka Castle & Dotonbori Street Food",
      description: "16th-century fortress built by Toyotomi Hideyoshi surrounded by 3,000 cherry blossom trees and Dotonbori's buzzing neon street food arcades.",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800",
      distance: "Osaka City Center",
      highlights: ["3,000 Sakura Trees", "Gold-Leaf Castle Tower", "Dotonbori Glico Man", "Takoyaki Food Tour"],
      details: {
        altitude: "100 feet (30 m)",
        bestTime: "Late March to Early April (Peak Cherry Blossom)",
        overview: "Osaka Castle was built in 1583 AD and played a major role in the unification of Japan. Its Nishinomaru Garden features over 3,000 cherry trees framing the 5-storey main castle tower.",
        experiences: [
          "Tour the 8-storey museum inside Osaka Castle tower displaying samurai armor and swords.",
          "Picnic under blooming sakura trees in Nishinomaru Castle Gardens.",
          "Walk through Dotonbori canal strip under giant neon signs like the famous Glico Running Man.",
          "Taste fresh Osaka street delicacies like Takoyaki octopus balls and Okonomiyaki savory pancakes."
        ],
        travelTips: "Spring cherry blossom season in Osaka peaks between March 28 and April 8."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "jp-faq-1", question: "Is Japanese eVisa required for Indian citizens?", answer: "Yes, Indian passport holders can apply for Japan eVisa online (single-entry tourist visa processed in 5-7 working days). GhumoFiroo handles document preparation." },
    { id: "jp-faq-2", question: "Are 320 km/h Shinkansen bullet train tickets included?", answer: "Yes! All GhumoFiroo Japan packages include reserved seats on the Shinkansen bullet train between Tokyo and Kyoto." },
    { id: "jp-faq-3", question: "When is the peak Cherry Blossom (Sakura) season in Japan?", answer: "Peak cherry blossom bloom in Tokyo, Kyoto & Osaka usually occurs between late March and early April." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Japan Cherry Blossom", item: "/packages/japan-cherry-blossom" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Japan Cherry Blossom & Shinkansen Tour Packages 2026",
    description: "Book top-rated Japan tour packages with GhumoFiroo. Includes Tokyo Skytree, Mount Fuji 5th Station (2,305m), 320 km/h Shinkansen Bullet Train, Kyoto Fushimi Inari & Osaka Castle sakura bloom.",
    url: config.baseUrl + "/packages/japan-cherry-blossom",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    duration: "P7D",
    itinerary: [
      { position: 1, name: "Tokyo City & Mount Fuji 5th Station", description: "Tokyo Skytree, Asakusa & 2,305m Mount Fuji 5th Station." },
      { position: 2, name: "320km/h Shinkansen Bullet Train to Kyoto", description: "High-speed train ride & Kyoto 10,000 Torii gates." },
      { position: 3, name: "Osaka Castle Sakura & Dotonbori", description: "Osaka Castle cherry gardens & Dotonbori street food tour." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "145000",
      includes: "4-star hotels, Shinkansen bullet train pass, Mount Fuji ticket, Osaka Castle ticket, daily breakfast"
    },
    aggregateRating: {
      ratingValue: 4.98,
      reviewCount: 1050
    }
  })

  return (
    <Layout>
      <SEO 
        title="Japan Tour Packages 2026 | Tokyo, Mount Fuji & Shinkansen Bullet Train"
        description="Book top-rated Japan tour packages. Includes Tokyo Skytree, Mount Fuji 5th Station (2,305m), 320 km/h Shinkansen Bullet Train, Kyoto Fushimi Inari & Osaka Castle sakura bloom."
        keywords="Japan tour package 2026, Japan cherry blossom tour cost, Shinkansen bullet train package, Tokyo Mount Fuji Kyoto package"
        canonicalUrl={config.baseUrl + "/packages/japan-cherry-blossom"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600" 
              alt="Japan Cherry Blossom Mount Fuji" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_JAPAN_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Land of Rising Sun Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Japan Cherry Blossom Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Tokyo Skytree, Mount Fuji 5th Station (2,305m), 320 km/h Shinkansen Bullet Train, Kyoto Fushimi Inari & Osaka Castle sakura bloom.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Japan Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.98 ★", sub: "1,050+ Travelers" },
                { label: "Bullet Train", val: "320 km/h", sub: "Reserved Shinkansen Seat" },
                { label: "Mount Fuji", val: "2,305m", sub: "5th Station Pass" },
                { label: "Hotels", val: "4-Star Central", sub: "Tokyo, Kyoto & Osaka" }
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
            title="Select Your Japan Tour Package" 
            subtitle="Choose from express 6-day golden route breaks or 7-day cherry blossom & Osaka castle specials." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {japanPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name || pkg.title || "Tour Package Details"} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_JAPAN_IMG }}
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
              title="Japan Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Japan itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "icons", label: "Iconic Peaks" },
                { key: "temples", label: "Shrines & Castles" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_JAPAN_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_JAPAN_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes Shinkansen bullet train ticket & 4-star hotels</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹1,45,000</span>
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
          <SectionHeading kicker="Assurance Details" title="Japan Travel FAQ" subtitle="Important details regarding eVisa, Shinkansen bullet train tickets, and cherry blossom timing." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Japan Cherry Blossom Collection"
          priceText="From ₹1,45,000"
          priceSubtext="Shinkansen Bullet Train & Mount Fuji 5th Station Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Japan%20Cherry%20Blossom%207D6N&price=168000")}
        />
      </div>
    </Layout>
  )
}

export default JapanCherryBlossom