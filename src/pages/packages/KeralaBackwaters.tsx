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

const KeralaBackwaters: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_KERALA_IMG = "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Kerala', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const keralaPackages = [
    {
      id: "kerala-4d-3n",
      title: "Munnar & Alleppey Express (4D/3N)",
      desc: "Short Kerala break featuring Munnar tea gardens, Cheeyappara waterfalls & private Alleppey houseboat cruise.",
      badge: "Express Escape",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800",
      price: 18500,
      duration: "4 Days / 3 Nights",
      rating: 4.9,
      reviewsCount: 310,
      stay: "Munnar Tea Country Hill Resort (2N) + Alleppey Private AC Houseboat (1N)",
      vehicle: "Chauffeured Private AC Sedan / SUV",
      link: "/packages/kerala-4d-3n",
      highlights: ["Private Houseboat Cruise", "Munnar Tea Gardens", "Cheeyappara Falls", "Mattupetty Dam"],
      itinerary: [
        { day: "Day 1", title: "Cochin Pickup → Munnar Tea Gardens & Waterfalls Drive", desc: "Private pickup from Cochin Airport. Drive to Munnar past Cheeyappara & Valara waterfalls." },
        { day: "Day 2", title: "Munnar Sightseeing → Eravikulam National Park & Tea Museum", desc: "Safari in Eravikulam National Park to spot Nilgiri Tahr, visit Tata Tea Museum & Mattupetty Dam." },
        { day: "Day 3", title: "Munnar to Alleppey → Private Houseboat Backwater Cruise", desc: "Drive to Alleppey. Board private AC luxury houseboat at noon. Cruise canals & enjoy Karimeen fish dinner." },
        { day: "Day 4", title: "Alleppey Houseboat Breakfast → Cochin Airport Departure", desc: "Morning backwater cruise, breakfast onboard, and transfer to Cochin Airport." }
      ],
      inclusions: ["1 Night Private AC Houseboat + 2 Nights 4-Star Resort", "All Meals Onboard Houseboat", "Private AC Car Transfers", "Daily Breakfast & Dinner"],
      exclusions: ["Flight / Train fares", "Personal activities"]
    },
    {
      id: "kerala-5d-4n",
      title: "Kerala Backwaters & Tea Sanctuary (5D/4N)",
      desc: "Our best-selling Kerala tour covering Cochin, Munnar tea hills, Thekkady spice plantation & Alleppey houseboat.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800",
      price: 22800,
      duration: "5 Days / 4 Nights",
      rating: 4.95,
      reviewsCount: 780,
      stay: "Munnar Resort (2N) + Thekkady Spice Resort (1N) + Alleppey Deluxe Houseboat (1N)",
      vehicle: "Chauffeured Private AC SUV / Sedan",
      link: "/packages/kerala-5d-4n",
      highlights: ["Periyar Boat Safari", "Alleppey Houseboat", "Spice Plantation Walk", "Fort Kochi Nets"],
      itinerary: [
        { day: "Day 1", title: "Cochin Pickup → Fort Kochi & Drive to Munnar", desc: "Pickup at Cochin. Visit Chinese Fishing Nets & drive to Munnar tea estates." },
        { day: "Day 2", title: "Munnar Tea Country & Eravikulam Safari", desc: "Tour Eravikulam Park, Tea Museum, Echo Point & Kundala Lake." },
        { day: "Day 3", title: "Munnar to Thekkady → Spice Plantation & Periyar Boat Safari", desc: "Drive to Thekkady. Spice garden guided walk & Periyar Lake boat safari." },
        { day: "Day 4", title: "Thekkady to Alleppey → Private Luxury Houseboat Cruise", desc: "Transfer to Alleppey. Board private AC houseboat with traditional Kerala lunch & dinner." },
        { day: "Day 5", title: "Alleppey Disembarkation → Cochin Airport Drop-off", desc: "Breakfast on houseboat, disembark, and transfer to Cochin Airport." }
      ],
      inclusions: ["1 Night Deluxe Houseboat + 3 Nights 4-Star Hill Resorts", "Periyar Boat Safari Tickets", "Guided Spice Garden Walk", "Private AC Chauffeured SUV/Sedan"],
      exclusions: ["Flight tickets", "Kathakali show entry"]
    },
    {
      id: "kerala-6d-5n",
      title: "Grand Kerala Hills, Wildlife & Backwaters (6D/5N)",
      desc: "Complete Kerala circuit featuring Fort Kochi heritage, Munnar tea gardens, Thekkady safari, Alleppey houseboat & Marari beach.",
      badge: "Grand Circuit",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      price: 27500,
      duration: "6 Days / 5 Nights",
      rating: 4.98,
      reviewsCount: 450,
      stay: "Fort Kochi Hotel (1N) + Munnar Resort (2N) + Thekkady Resort (1N) + Houseboat (1N)",
      vehicle: "Chauffeured Private AC Innova / SUV",
      link: "/packages/kerala-6d-5n",
      highlights: ["Fort Kochi Heritage", "Eravikulam Wildlife", "Periyar Elephant Safari", "Alleppey Sunset"],
      itinerary: [
        { day: "Day 1", title: "Cochin Arrival → Heritage Fort Kochi Tour", desc: "Pickup from Cochin. Tour Mattancherry Palace, Jew Town & Chinese Fishing Nets." },
        { day: "Day 2", title: "Cochin to Munnar → Waterfalls & Tea Estates", desc: "Drive through Western Ghats to Munnar. Evening tea garden stroll." },
        { day: "Day 3", title: "Munnar Full Day Nature & Wildlife Safari", desc: "Eravikulam Park, Nilgiri Tahr, Mattupetty Dam & Echo Point." },
        { day: "Day 4", title: "Munnar to Thekkady → Periyar Safari & Spice Walk", desc: "Drive to Thekkady. Periyar Lake boat ride & evening Kathakali cultural show." },
        { day: "Day 5", title: "Thekkady to Alleppey → Private Houseboat Sailing", desc: "Board private houseboat at Alleppey jetty. Sail Vembanad Lake." },
        { day: "Day 6", title: "Alleppey Houseboat → Cochin Airport Departure", desc: "Breakfast onboard and transfer to Cochin Airport for return flight." }
      ],
      inclusions: ["5 Nights Accommodation (1 Houseboat + 4 Deluxe Hotels)", "Periyar Lake Boat Tickets", "All Houseboat Meals", "Private AC Vehicle for 6 Days"],
      exclusions: ["Flight fares", "Personal shopping"]
    }
  ]

  const attractions = [
    {
      id: "alleppey-houseboats",
      category: "backwaters",
      categoryName: "Backwaters & Lakes",
      title: "Alleppey Backwaters & Luxury Houseboats",
      description: "World-famous palm-fringed backwater canals, Vembanad Lake & private AC houseboats equipped with personal chef and butler service.",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800",
      distance: "Alleppey Jetty",
      highlights: ["Private AC Houseboat", "Vembanad Lake", "Paddy Field Canals", "Karimeen Fish Dinner"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "September to March | Year-Round Houseboat Cruises",
        overview: "Known as the 'Venice of the East', Alleppey (Alappuzha) is famous for its intricate network of tranquil backwater canals, lagoons, and emerald paddy fields. Sailing on a traditional Kettuvallam (houseboat) is Kerala's signature travel experience.",
        experiences: [
          "Cruise through narrow palm-fringed canals on a private air-conditioned luxury houseboat.",
          "Savor authentic Kerala meals cooked fresh onboard by your personal chef.",
          "Witness picturesque rural backwater life, duck farming, and coconut harvesting.",
          "Enjoy golden hour sunsets over Vembanad Lake from your private open-deck loungers."
        ],
        travelTips: "Houseboat check-in is at 12:00 PM and checkout is at 9:00 AM. AC operates continuously from 9:00 PM to 6:00 AM."
      }
    },
    {
      id: "munnar-tea-gardens",
      category: "hills",
      categoryName: "Tea Hills & Nature",
      title: "Munnar Rolling Green Tea Estates",
      description: "Rolling emerald green tea plantations, misty mountain valleys, crisp high-altitude mountain air, and colonial tea factory museums at 5,200 ft elevation.",
      image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800",
      distance: "Western Ghats (130 km from Cochin)",
      highlights: ["Tata Tea Museum", "Cheeyappara Waterfalls", "Lockhart Tea Estate", "Misty Peaks"],
      details: {
        altitude: "5,200 feet (1,600 m)",
        bestTime: "September to May | Pleasant 15°C Weather",
        overview: "Munnar was the favored summer resort of the British administration in South India. Surrounded by vast tea plantations established in the late 19th century, it is South India's premier hill station.",
        experiences: [
          "Stroll through endless manicured green tea carpet hills during morning mist.",
          "Visit the KDHP Tata Tea Museum to learn traditional CTC & orthodox tea processing.",
          "Photograph cascading Cheeyappara and Valara waterfalls along the scenic highway.",
          "Sample freshly brewed cardamom and ginger chai directly at estate tea counters."
        ],
        travelTips: "Carry light thermals and rain jackets. Morning hours (7:30 AM) offer the best lighting for tea garden photography."
      }
    },
    {
      id: "eravikulam-national-park",
      category: "wildlife",
      categoryName: "Wildlife & Safaris",
      title: "Eravikulam National Park (Nilgiri Tahr)",
      description: "High-altitude national park on the Western Ghats protecting the endangered Nilgiri Tahr wild mountain goat and blooming Neelakurinji flower slopes.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800",
      distance: "Munnar (15 km)",
      highlights: ["Nilgiri Tahr Safari", "Anamudi 8,842ft Peak", "Alpine Grasslands", "Neelakurinji Blooms"],
      details: {
        altitude: "7,000 feet (2,130 m)",
        bestTime: "September to January (Park closed Feb-Mar for calving)",
        overview: "Spread across 97 sq km of high-altitude shola-grassland ecosystem, Eravikulam is home to the world's largest surviving population of Nilgiri Tahr. It also hosts Anamudi (8,842 ft), the highest peak in South India.",
        experiences: [
          "Board official Eco-Safari buses climbing up the fog-covered Rajamalai mountain trail.",
          "Spot friendly wild Nilgiri Tahr goats grazing closely along mountain rock faces.",
          "Enjoy panoramic 360-degree views of rolling shola grasslands and Anamudi peak.",
          "Witness Neelakurinji blue flower blooms that carpet the hillsides once every 12 years."
        ],
        travelTips: "Online entry tickets must be booked in advance due to strict daily visitor limits enforced by forest department."
      }
    },
    {
      id: "thekkady-periyar",
      category: "wildlife",
      categoryName: "Wildlife & Safaris",
      title: "Thekkady & Periyar Tiger Sanctuary",
      description: "Dense rainforest tiger reserve offering scenic boat safaris on Periyar Lake to spot wild elephant herds, sambar deer, gaur, and exotic birds.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
      distance: "Thekkady / Kumily (110 km from Munnar)",
      highlights: ["Periyar Lake Boat Safari", "Wild Elephant Herds", "Cardamom Spice Walk", "Kathakali Show"],
      details: {
        altitude: "3,000 feet (900 m)",
        bestTime: "October to March | Early Morning Boat Safari",
        overview: "Periyar National Park and Tiger Reserve is one of India's premier wildlife sanctuaries. Centered around a 26 sq km artificial lake formed by the Mullaperiyar Dam, wild animals come down to the water banks to drink.",
        experiences: [
          "Take an early morning 7:30 AM boat safari across Periyar Lake to view wildlife.",
          "Spot wild elephant herds, wild boars, and bison drinking along the lake perimeter.",
          "Take a guided aromatic spice plantation walk growing cardamom, pepper, and vanilla.",
          "Attend traditional evening Kathakali dance and Kalaripayattu martial art live performances."
        ],
        travelTips: "Book 7:30 AM or 3:30 PM boat tickets online early for maximum wildlife sighting probability."
      }
    },
    {
      id: "fort-kochi",
      category: "heritage",
      categoryName: "Colonial Heritage",
      title: "Fort Kochi & Chinese Fishing Nets",
      description: "14th-century coastal heritage town blending Portuguese, Dutch, British, and Chinese influences with iconic cantilevered Chinese Fishing Nets.",
      image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=800",
      distance: "Cochin / Kochi City",
      highlights: ["Chinese Fishing Nets", "Mattancherry Dutch Palace", "Jew Town Synagogue", "St. Francis Church"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "October to March | Sunset Golden Hour",
        overview: "Fort Kochi is a charming historic seaside enclave. traders from China, Arabia, Portugal, Holland, and Britain settled here over centuries, creating a unique melting pot of colonial architecture and art galleries.",
        experiences: [
          "Watch local fishermen operate massive 14th-century Chinese cantilevered fishing nets.",
          "Walk through Jew Town's narrow antique markets and visit 1568 Paradesi Synagogue.",
          "Tour Mattancherry Dutch Palace featuring 16th-century Ramayana mural paintings.",
          "Visit St. Francis Church, the original burial site of Portuguese explorer Vasco da Gama."
        ],
        travelTips: "Enjoy fresh seafood cooked to order at beachside stalls right after purchasing from net fishermen."
      }
    },
    {
      id: "kovalam-beach",
      category: "beaches",
      categoryName: "Coastal Beaches",
      title: "Kovalam Lighthouse Cliff Beach",
      description: "Iconic crescent beach backed by a towering 35-meter red-and-white striped lighthouse, offering shallow turquoise waves, cliffside dining, and Ayurvedic beach resorts.",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800",
      distance: "Trivandrum (16 km)",
      highlights: ["Lighthouse Beach", "35m Vizhinjam Lighthouse", "Cliffside Dining", "Arabian Sea Sunset"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "November to March",
        overview: "Kovalam is internationally famous for its three adjacent crescent beaches—Lighthouse Beach, Hawah Beach, and Samudra Beach. The towering Vizhinjam Lighthouse offers sweeping 360-degree views of the coastline.",
        experiences: [
          "Climb the spiral staircase of Vizhinjam Lighthouse for aerial views of Kovalam coastline.",
          "Relax on soft sandy crescent beaches and swim in calm Arabian Sea waters.",
          "Dine at romantic open-air cliffside seafood restaurants illuminated by candlelights.",
          "Rejuvenate with traditional Abhyangam oil body massages at seaside Ayurvedic centers."
        ],
        travelTips: "Lighthouse observation tower is open to visitors daily between 3:00 PM and 5:00 PM."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "kl-faq-1", question: "What is included in the Alleppey private houseboat stay?", answer: "All packages feature 1 night stay in a private AC luxury houseboat with full-board meals (traditional Kerala lunch, afternoon tea/snacks, Karimeen fish dinner, and breakfast)." },
    { id: "kl-faq-2", question: "What is the best time of year to visit Kerala backwaters?", answer: "September to March offers cool, pleasant weather ideal for backwater houseboats, Munnar tea hills & beaches. Monsoons (June to August) are renowned for Ayurvedic wellness." },
    { id: "kl-faq-3", question: "Can we get vegetarian and Jain meals in Kerala packages?", answer: "Yes! Traditional Kerala Sadya is 100% vegetarian served on banana leaves. All resorts and houseboats offer pure vegetarian & Jain food upon request." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Kerala Backwaters & Houseboat", item: "/packages/kerala-backwaters" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Kerala Backwaters & Houseboat Sanctuary Packages 2026",
    description: "Book top-rated Kerala holiday packages with GhumoFiroo. Includes Alleppey private AC houseboat cruise, Munnar tea gardens, Eravikulam National Park & Thekkady spice safari.",
    url: config.baseUrl + "/packages/kerala-backwaters",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80",
    duration: "P6D",
    itinerary: [
      { position: 1, name: "Fort Kochi & Munnar Tea Hills", description: "Chinese fishing nets & scenic drive past Cheeyappara waterfalls." },
      { position: 2, name: "Munnar Wildlife & Tea Museum", description: "Eravikulam National Park Nilgiri Tahr safari & Tata Tea Museum." },
      { position: 3, name: "Alleppey Houseboat Backwater Cruise", description: "Private AC luxury houseboat cruise on Vembanad Lake." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "18500",
      includes: "Private AC houseboat, 4-star hill resorts, all houseboat meals, breakfast & dinner, private AC vehicle"
    },
    aggregateRating: {
      ratingValue: 4.9,
      reviewCount: 1680
    }
  })

  return (
    <Layout>
      <SEO 
        title="Kerala Backwaters & Houseboat Tour Packages 2026 | Munnar & Alleppey"
        description="Book top-rated Kerala tour packages. Private AC Alleppey backwater houseboat cruise, Munnar tea estates, Eravikulam safari, Thekkady spice gardens & Kovalam beach."
        keywords="Kerala backwaters tour package 2026, Alleppey houseboat booking price, Munnar tea gardens tour, Kerala honeymoon package, Kovalam beach resort package"
        canonicalUrl={config.baseUrl + "/packages/kerala-backwaters"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1600" 
              alt="Kerala Backwaters Alleppey Houseboat" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KERALA_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                God's Own Country Sanctuary
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Kerala Backwaters Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Private AC Alleppey houseboat cruises, Munnar misty tea estates, Eravikulam Nilgiri Tahr safari, Thekkady spice gardens & Kovalam beach.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Kerala Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.95 ★", sub: "1,680+ Travelers" },
                { label: "Private Houseboat", val: "100% Private AC", sub: "Personal Chef Onboard" },
                { label: "Hill Resorts", val: "4-Star Tiers", sub: "Munnar Tea Country" },
                { label: "Private Cab", val: "Chauffeured", sub: "Cochin Pickup & Drop" }
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
            title="Select Your Kerala Tour Package" 
            subtitle="Choose from express 4-day breaks, 5-day best sellers with spice plantations, or 6-day grand circuits." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {keralaPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt="" 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KERALA_IMG }}
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
              title="Kerala Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Kerala itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "backwaters", label: "Backwaters & Lakes" },
                { key: "hills", label: "Tea Hills & Nature" },
                { key: "wildlife", label: "Wildlife & Safaris" },
                { key: "heritage", label: "Colonial Heritage" },
                { key: "beaches", label: "Coastal Beaches" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KERALA_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_KERALA_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes private AC houseboat & hill resort stays</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹18,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Kerala Travel FAQ" subtitle="Important details regarding private houseboats, meal plans & airport transfers." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Kerala Backwaters Collection"
          priceText="From ₹18,500"
          priceSubtext="Private AC Houseboat & Munnar Resort Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Kerala%20Backwaters%205D4N&price=22800")}
        />
      </div>
    </Layout>
  )
}

export default KeralaBackwaters