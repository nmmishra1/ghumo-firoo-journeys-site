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

const GeorgiaAdventure: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_GEORGIA_IMG = "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Georgia', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const georgiaPackages = [
    {
      id: "georgia-5d-4n",
      title: "Tbilisi & Kazbegi Caucasus Express (5D/4N)",
      desc: "Short European Caucasus break featuring Tbilisi Old Town aerial cable car, Ananuri Fortress & Kazbegi Gergeti Trinity Church 4x4 mountain drive.",
      badge: "Express Escape",
      image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800",
      price: 49500,
      duration: "5 Days / 4 Nights",
      rating: 4.9,
      reviewsCount: 310,
      stay: "Tbilisi Old Town 4-Star Hotel (3N) + Gudauri Snow Resort (1N)",
      vehicle: "Chauffeured Private AC Mercedes SUV",
      link: "/packages/georgia-5d-4n",
      highlights: ["Gergeti Trinity 4x4 Drive", "Gudauri Cable Car Pass", "Ananuri Fortress Lake", "Narikala Cable Car"],
      itinerary: [
        { day: "Day 1", title: "Tbilisi Airport Pickup → Old Town Hotel Check-in", desc: "Private pickup from Tbilisi International Airport (TBS). Check-in to Old Town hotel & evening Shardeni street walk." },
        { day: "Day 2", title: "Tbilisi Sightseeing → Narikala Fortress & Sulfur Baths", desc: "Aerial cable car to Narikala Fortress, Mother of Georgia statue, Bridge of Peace & Abanotubani sulfur baths." },
        { day: "Day 3", title: "Georgian Military Highway → Ananuri Fortress & Gudauri", desc: "Drive along Georgian Military Highway. Visit Ananuri Fortress, Zhinvali Reservoir & Gudauri Friendship Monument." },
        { day: "Day 4", title: "Kazbegi Gergeti Trinity Church 4x4 Mountain Safari", desc: "4x4 Delica jeep drive up to 2,170m Gergeti Trinity Church directly beneath snow-capped Mount Kazbek (5,047m)." },
        { day: "Day 5", title: "Mtskheta UNESCO Heritage → Tbilisi Airport Drop-off", desc: "Visit Mtskheta 6th-century Jvari Monastery overlooking Aragvi-Kura river confluence & transfer to Tbilisi Airport." }
      ],
      inclusions: ["4 Nights 4-Star Hotel Stay", "Kazbegi 4x4 Mountain Jeep Safari", "Narikala Aerial Cable Car Ticket", "Private AC Mercedes SUV", "Daily Breakfast"],
      exclusions: ["Flight tickets to Tbilisi", "Travel Insurance"]
    },
    {
      id: "georgia-6d-5n",
      title: "Georgia Grand Caucasus & Kakheti Wine Region (6D/5N)",
      desc: "Our best-selling Georgia tour adding Signagi 'City of Love', Kakheti qvevri wine tasting & Bodbe Monastery.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800",
      price: 58500,
      duration: "6 Days / 5 Nights",
      rating: 4.96,
      reviewsCount: 680,
      stay: "Tbilisi 4-Star Hotel (4N) + Gudauri Mountain Resort (1N)",
      vehicle: "Chauffeured Private AC Vehicle",
      link: "/packages/georgia-6d-5n",
      highlights: ["Kakheti Wine Tasting", "Signagi City of Love", "Gergeti Trinity 4x4", "Gudauri Cable Car"],
      itinerary: [
        { day: "Day 1", title: "Tbilisi Airport Pickup → Hotel Check-in", desc: "Pickup at Tbilisi Airport. Check-in to hotel & evening welcome dinner with Khachapuri & Georgian wine." },
        { day: "Day 2", title: "Tbilisi Full Day Heritage & Bridge of Peace", desc: "Narikala Fortress cable car, Holy Trinity Cathedral (Sameba), Rustaveli Avenue & sulfur baths." },
        { day: "Day 3", title: "Kakheti Wine Region → Signagi Walled City & Wine Cellar", desc: "Drive to Kakheti wine cradle. Tour 18th-century Signagi fortress walls, Bodbe Monastery & Qvevri wine tasting." },
        { day: "Day 4", title: "Georgian Military Highway → Ananuri & Gudauri Ski Resort", desc: "Drive along Aragvi valley to Ananuri Fortress & Gudauri panoramas." },
        { day: "Day 5", title: "Kazbegi 4x4 Safari under Mount Kazbek 5,047m", desc: "4x4 jeep safari up to Gergeti Trinity Church, Dariali Gorge & drive back to Tbilisi." },
        { day: "Day 6", title: "Tbilisi Souvenir Shopping → Airport Departure", desc: "Breakfast, Dry Bridge antique market shopping, and private transfer to Tbilisi Airport." }
      ],
      inclusions: ["5 Nights 4-Star Hotel Accommodation", "Kakheti Wine Tasting & Masterclass", "Kazbegi 4x4 Mountain Jeep Safari", "Daily Breakfast & Dinner", "Private AC Vehicle"],
      exclusions: ["Flight tickets to Tbilisi"]
    }
  ]

  const attractions = [
    {
      id: "kazbegi-gergeti",
      category: "mountains",
      categoryName: "Caucasus Mountains",
      title: "Kazbegi Gergeti Trinity Church (2,170m)",
      description: "14th-century stone church perched dramatically at 2,170 meters elevation on a lonely mountain ridge beneath Mount Kazbek peak (5,047m).",
      image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800",
      distance: "Stepantsminda (165 km from Tbilisi)",
      highlights: ["7,120 ft Elevation", "4x4 Mountain Safari", "Mount Kazbek 5,047m Peak", "Georgian Military Highway"],
      details: {
        altitude: "7,120 feet (2,170 m)",
        bestTime: "May to October | Morning Hours 9:00 AM",
        overview: "Gergeti Trinity Church (Holy Trinity Church) is Georgia's iconic symbol. Built in the 14th century, its isolated location on a steep mountain surrounded by the vast Caucasus range makes it one of Europe's most dramatic locations.",
        experiences: [
          "Take an exciting 4x4 Delica jeep safari up winding alpine mountain trails.",
          "Photograph the ancient stone bell tower framed against the glaciers of Mount Kazbek.",
          "Light candles inside the dark 14th-century stone sanctuary adorned with medieval frescoes.",
          "Enjoy panoramic views over the Chkheri River gorge and Stepantsminda village below."
        ],
        travelTips: "4x4 Mitsubishi Delica jeeps are included in all GhumoFiroo Kazbegi tours for safe mountain ascent."
      }
    },
    {
      id: "gudauri-ananuri",
      category: "mountains",
      categoryName: "Caucasus Mountains",
      title: "Gudauri Resort & Ananuri Fortress",
      description: "Premier high-altitude Caucasus ski resort at 2,200m elevation featuring 360-degree cable car views and 16th-century lakeside Ananuri Castle.",
      image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800",
      distance: "Georgian Military Highway (120 km from Tbilisi)",
      highlights: ["2,200m Ski Slopes", "Gudauri Cable Car", "Ananuri Fortress Lake", "Russia-Georgia Monument"],
      details: {
        altitude: "7,200 feet (2,200 m)",
        bestTime: "Dec to Apr for Snow Skiing | May to Oct for Green Mountain Views",
        overview: "Gudauri sits on a plateau facing the Greater Caucasus mountain chain. Ananuri Fortress, situated on the turquoise Zhinvali Reservoir, served as the seat of the Dukes of Aragvi in the 17th century.",
        experiences: [
          "Soar over mountain chasms on Gudauri's Doppelmayr cable car system.",
          "Photograph the colorful mosaic-covered Russia-Georgia Friendship Monument perched over a deep gorge.",
          "Explore the twin towers and churches inside 16th-century Ananuri Fortress.",
          "Try tandem paragliding flights over snow-capped Caucasus peaks."
        ],
        travelTips: "Winter travelers can rent full ski gear and hire English-speaking ski instructors on site."
      }
    },
    {
      id: "tbilisi-old-town",
      category: "heritage",
      categoryName: "Heritage & Cities",
      title: "Tbilisi Old Town & Narikala Cable Car",
      description: "Historic capital featuring 4th-century Narikala Fortress, colorful wooden carved balconies, ancient sulfur baths, and the glass Bridge of Peace.",
      image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800",
      distance: "Tbilisi City Center",
      highlights: ["Narikala Aerial Cable Car", "Abanotubani Sulfur Baths", "Bridge of Peace", "Mother of Georgia Statue"],
      details: {
        altitude: "1,450 feet (440 m)",
        bestTime: "Year-Round | Sunset Hours",
        overview: "Tbilisi was founded in the 5th century AD near natural hot sulfur springs. Its Old Town is a picturesque maze of cobbled streets, 19th-century carved wooden balconies, and historic churches.",
        experiences: [
          "Ride the aerial cable car from Rike Park up to 4th-century Narikala Fortress.",
          "Walk across the futuristic glass-and-steel Bridge of Peace over the Kura River.",
          "Soak in hot mineral waters inside historic brick-domed Abanotubani sulfur bathhouses.",
          "Sample hot Georgian Khachapuri cheese bread and Khinkali soup dumplings at traditional taverns."
        ],
        travelTips: "Private thermal sulfur bath chambers can be booked for 1-hour relaxing soaking sessions."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "ge-faq-1", question: "Do Indian passport holders need a visa for Georgia?", answer: "Indian passport holders holding valid US, UK, Schengen, or GCC residency visas qualify for Visa-Free entry to Georgia. Others require an eVisa processed online in 5 business days." },
    { id: "ge-faq-2", question: "Is the Kazbegi 4x4 mountain jeep safari included?", answer: "Yes! All GhumoFiroo Georgia packages include 4x4 Mitsubishi Delica jeep transfers up to 2,170m Gergeti Trinity Church." },
    { id: "ge-faq-3", question: "What currency is used in Georgia?", answer: "The currency is Georgian Lari (GEL). USD and Euros can easily be exchanged at banks and exchange booths across Tbilisi." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Georgia Adventure", item: "/packages/georgia-adventure" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Georgia Adventure & Caucasus Packages 2026",
    description: "Book top-rated Georgia tour packages with GhumoFiroo. Includes Kazbegi Gergeti Trinity Church 4x4 drive under Mount Kazbek 5,047m, Gudauri ski resort cable car, Tbilisi Old Town & Kakheti wine tasting.",
    url: config.baseUrl + "/packages/georgia-adventure",
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80",
    duration: "P6D",
    itinerary: [
      { position: 1, name: "Tbilisi Old Town & Cable Car", description: "Narikala fortress aerial cable car & sulfur baths." },
      { position: 2, name: "Georgian Military Highway & Gudauri", description: "Ananuri fortress lake & Gudauri cable car." },
      { position: 3, name: "Kazbegi 4x4 Mountain Safari", description: "4x4 jeep drive to 2,170m Gergeti Trinity Church." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "49500",
      includes: "4-star hotels, Kazbegi 4x4 mountain safari, Narikala cable car, daily breakfast, private AC Mercedes vehicle"
    },
    aggregateRating: {
      ratingValue: 4.96,
      reviewCount: 990
    }
  })

  return (
    <Layout>
      <SEO 
        title="Georgia Tour Packages 2026 | Tbilisi, Kazbegi 4x4 & Gudauri"
        description="Book top-rated Georgia tour packages. Includes Kazbegi Gergeti Trinity Church 4x4 drive under Mount Kazbek 5,047m, Gudauri ski resort cable car, Tbilisi Old Town & Kakheti wine tasting."
        keywords="Georgia tour package 2026, Georgia visa for Indians, Kazbegi 4x4 tour price, Tbilisi Gudauri tour package cost"
        canonicalUrl={config.baseUrl + "/packages/georgia-adventure"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=1600" 
              alt="Georgia Kazbegi Caucasus Mountains" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GEORGIA_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Jewel of Caucasus Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Georgia Adventure Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Kazbegi Gergeti Trinity Church 4x4 mountain drives, Gudauri cable car flights, Signagi wine region & Tbilisi Old Town.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Georgia Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.96 ★", sub: "990+ Travelers" },
                { label: "Mountain Safari", val: "4x4 Delica Jeep", sub: "2,170m Gergeti Trinity" },
                { label: "Cable Car", val: "Narikala & Gudauri", sub: "360-Degree Views" },
                { label: "Private Vehicle", val: "Mercedes SUV", sub: "Tbilisi Airport Pickup" }
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
            title="Select Your Georgia Tour Package" 
            subtitle="Choose from express 5-day mountain breaks, 6-day best sellers with wine tasting, or 7-day Black Sea Batumi circuits." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {georgiaPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt="" 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GEORGIA_IMG }}
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
              title="Georgia Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Georgia itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "mountains", label: "Caucasus Mountains" },
                { key: "heritage", label: "Heritage & Cities" }
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
                        alt="" 
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GEORGIA_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GEORGIA_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes Kazbegi 4x4 safari & 4-star hotels</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹49,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Georgia Travel FAQ" subtitle="Important details regarding visas, Kazbegi 4x4 safari, and currency exchange." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Georgia Adventure Collection"
          priceText="From ₹49,500"
          priceSubtext="Kazbegi 4x4 & Gudauri Cable Car Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Georgia%20Grand%20Caucasus%206D5N&price=58500")}
        />
      </div>
    </Layout>
  )
}

export default GeorgiaAdventure
