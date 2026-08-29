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

const GoaBeachHoliday: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_GOA_IMG = "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Goa', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const goaPackages = [
    {
      id: "goa-3d-2n",
      title: "Goa Weekend Sun & Beach Break (3D/2N)",
      desc: "Short weekend break covering North Goa Calangute & Baga beaches, Fort Aguada & Mandovi River sunset cruise.",
      badge: "Weekend Break",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800",
      price: 12500,
      duration: "3 Days / 2 Nights",
      rating: 4.85,
      reviewsCount: 380,
      stay: "North Goa Beach Resort (2N)",
      vehicle: "Chauffeured Private AC Sedan / SUV",
      link: "/packages/goa-3d-2n",
      highlights: ["Calangute Beach Walk", "Fort Aguada Lighthouse", "Mandovi Sunset Cruise", "Baga Nightlife"],
      itinerary: [
        { day: "Day 1", title: "Goa Airport / Thivim Pickup → Resort Check-in", desc: "Private pickup from Dabolim / MOPA Airport. Check-in to North Goa resort. Evening Baga beach stroll." },
        { day: "Day 2", title: "North Goa Sightseeing → Fort Aguada & Mandovi Sunset Cruise", desc: "Visit 17th-century Fort Aguada, Sinquerim beach, Anjuna flea market & Mandovi River sunset cruise." },
        { day: "Day 3", title: "Goa Airport / Railway Station Departure", desc: "Breakfast and drop-off at Goa Airport or Thivim Railway Station." }
      ],
      inclusions: ["2 Nights 4-Star Beach Resort Stay", "Mandovi River Sunset Cruise Pass", "Daily Breakfast", "Private AC Chauffeured SUV/Sedan"],
      exclusions: ["Personal watersports fees", "Flight / Train tickets"]
    },
    {
      id: "goa-4d-3n",
      title: "Goa Sun, Sand & Beach Experience (4D/3N)",
      desc: "Our best-selling Goa tour featuring North & South Goa beach tours, Old Goa Churches & Miramar Beach.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
      price: 16500,
      duration: "4 Days / 3 Nights",
      rating: 4.9,
      reviewsCount: 650,
      stay: "North Goa Beachfront Resort (3N)",
      vehicle: "Chauffeured Private AC SUV",
      link: "/packages/goa-4d-3n",
      highlights: ["Basilica of Bom Jesus", "Dona Paula Viewpoint", "Anjuna & Vagator Beaches", "Watersports"],
      itinerary: [
        { day: "Day 1", title: "Goa Airport Pickup → Beach Resort Check-in", desc: "Pickup at Goa Airport. Welcome drink and evening leisure on Baga beach." },
        { day: "Day 2", title: "North Goa Beaches & Fort Aguada", desc: "Explore Fort Aguada, Sinquerim, Calangute, Baga, Anjuna & Vagator cliff beaches." },
        { day: "Day 3", title: "South Goa Heritage Tour & Old Goa Cathedrals", desc: "Tour Basilica of Bom Jesus, Se Cathedral, Mangueshi Temple, Dona Paula & Miramar beach." },
        { day: "Day 4", title: "Goa Airport Departure Transfer", desc: "Breakfast, checkout, and private transfer to Goa Airport." }
      ],
      inclusions: ["3 Nights 4-Star Beach Resort", "Full North & South Goa Tours", "Mandovi Sunset Cruise Pass", "Daily Breakfast & Dinner"],
      exclusions: ["Flight tickets", "Watersports passes"]
    },
    {
      id: "goa-5d-4n",
      title: "Goa Grand Beach, Island & Water Sports (5D/4N)",
      desc: "Complete Goa vacation adding Grand Island boat cruise, dolphin watching, snorkeling & Dudhsagar waterfall 4x4 safari.",
      badge: "Grand Combo",
      image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=800",
      price: 21500,
      duration: "5 Days / 4 Nights",
      rating: 4.95,
      reviewsCount: 420,
      stay: "Calangute Beach Resort (4N)",
      vehicle: "Chauffeured Private AC Vehicle",
      link: "/packages/goa-5d-4n",
      highlights: ["Grand Island Snorkeling", "Dudhsagar 4x4 Safari", "Spice Plantation Lunch", "Dolphin Cruise"],
      itinerary: [
        { day: "Day 1", title: "Goa Arrival → Resort Check-in", desc: "Pickup at Airport / Thivim. Check-in to resort and evening leisure." },
        { day: "Day 2", title: "Grand Island Boat Cruise & Snorkeling", desc: "Boat trip to Grand Island. Dolphin spotting, coral reef snorkeling & beach BBQ lunch." },
        { day: "Day 3", title: "Dudhsagar Waterfall 4x4 Jeep Safari & Spice Tour", desc: "4x4 jungle jeep safari to Dudhsagar Waterfalls & tropical spice plantation lunch." },
        { day: "Day 4", title: "North Goa Beach Water Sports", desc: "Enjoy parasailing, jet ski, banana ride & bumper boat ride at Baga beach." },
        { day: "Day 5", title: "Goa Airport Departure Transfer", desc: "Breakfast and drop-off at Goa Airport." }
      ],
      inclusions: ["4 Nights 4-Star Resort", "Grand Island Boat Tour + Snorkeling", "Dudhsagar 4x4 Safari Pass", "5 Water Sports Combo Pass"],
      exclusions: ["Airfare to Goa"]
    }
  ]

  const attractions = [
    {
      id: "baga-calangute",
      category: "beaches",
      categoryName: "Golden Beaches",
      title: "Baga & Calangute Golden Beaches",
      description: "Goa's most vibrant beach stretch famous for golden sand, water sports, shacks serving fresh seafood, and energetic evening music.",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800",
      distance: "North Goa",
      highlights: ["Parasailing & Jet Ski", "Beach Shacks", "Tito's Lane Nightlife", "Golden Sunset"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "October to May | Sunset Hours",
        overview: "Calangute (the 'Queen of Beaches') and Baga form the hub of North Goa's tourism. Known for its continuous stretch of soft golden sand, bustling beach shacks, water sports, and famous nightlife strip along Tito's Lane.",
        experiences: [
          "Soar high over the Arabian Sea with tandem parasailing flights.",
          "Ride high-speed jet skis and banana boat rides along Calangute beach.",
          "Dine at candlelit beach shacks serving grilled prawns and cold beverages.",
          "Walk through night markets selling bohemian beachwear and silver jewelry."
        ],
        travelTips: "Book water sports early in the morning (9:00 AM) to avoid long queues during peak season."
      }
    },
    {
      id: "fort-aguada",
      category: "heritage",
      categoryName: "Colonial Forts",
      title: "Fort Aguada & 1864 Lighthouse",
      description: "17th-century Portuguese fortress overlooking the confluence of Mandovi River and Arabian Sea, featuring a 4-storey freshwater lighthouse.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
      distance: "Sinquerim (18 km from Panaji)",
      highlights: ["1612 Portuguese Fort", "1864 Lighthouse", "Mandovi Estuary View", "Sinquerim Beach"],
      details: {
        altitude: "50 feet (15 m)",
        bestTime: "Year-Round | Late Afternoon 4:00 PM",
        overview: "Built by the Portuguese in 1612 to guard against Dutch and Maratha invasions, Fort Aguada derives its name from 'Agua' (water) because freshwater springs inside the fort supplied passing ships.",
        experiences: [
          "Walk along the ancient red laterite ramparts of the fortress.",
          "Photograph the historic 1864 four-storey lighthouse, one of the oldest in Asia.",
          "Enjoy panoramic sunset views of the Arabian Sea and Sinquerim Beach below.",
          "Visit the lower fort complex that extends directly into the sea."
        ],
        travelTips: "Carry hat and sunglasses as the open fort ramparts receive direct sunlight."
      }
    },
    {
      id: "dudhsagar-waterfall",
      category: "nature",
      categoryName: "Waterfalls & Safaris",
      title: "Dudhsagar 4x4 Jungle Safari",
      description: "One of India's tallest 4-tiered waterfalls (1,017 ft high) cascading down Mandovi River cliffs inside Bhagwan Mahavir Wildlife Sanctuary.",
      image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=800",
      distance: "South-East Goa (60 km from Panaji)",
      highlights: ["1,017ft 4-Tier Cascade", "4x4 Jungle Jeep Safari", "Natural Swimming Pool", "Railway Bridge View"],
      details: {
        altitude: "1,017 feet (310 m)",
        bestTime: "October to May for 4x4 Jeep Safari | Monsoon for Peak Flow",
        overview: "Dudhsagar ('Sea of Milk') receives its name from the foamy white appearance of water plunging down a 310-meter sheer cliff. The iconic railway bridge passing right across the waterfall mid-section is world-famous.",
        experiences: [
          "Take an exciting 4x4 forest department jeep safari through rivers and teak jungles.",
          "Swim in the natural cool mountain spring pool beneath the cascading waterfall.",
          "Photograph trains passing across the dramatic Dudhsagar railway viaduct bridge.",
          "Visit tropical spice plantations en route for a traditional Goan buffet lunch."
        ],
        travelTips: "Life jackets are mandatory for swimming in the natural pool and are provided at the jeep stand."
      }
    },
    {
      id: "grand-island",
      category: "adventure",
      categoryName: "Island Cruises",
      title: "Grand Island Boat Cruise & Snorkeling",
      description: "Uninhabited island off Mormugao harbor offering dolphin watching boat cruises, coral reef snorkeling, and beachside fish barbecues.",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800",
      distance: "Off Vasco / Calangute Coast",
      highlights: ["Dolphin Spotting", "Coral Snorkeling", "Island Beach BBQ", "Fishing"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "October to April (Calm seas)",
        overview: "Grand Island (Ilha Grande) is Goa's top scuba diving and snorkeling spot. Surrounded by clear turquoise waters, shipwreck ruins, and coral reefs home to angelfish and sea turtles.",
        experiences: [
          "Cruise out to open sea on motorboats while spotting wild Indo-Pacific humpback dolphins.",
          "Snorkel around shallow coral reefs led by certified dive masters.",
          "Try handline sea fishing and enjoy fresh fish barbecue grilled right on the beach.",
          "Relax on secluded island sandbars surrounded by crystal clear waters."
        ],
        travelTips: "Full day boat trips include hotel pickup, snorkeling equipment, drinks, and lunch."
      }
    },
    {
      id: "old-goa-churches",
      category: "heritage",
      categoryName: "Colonial Forts",
      title: "Old Goa UNESCO Heritage Cathedrals",
      description: "Former colonial capital of Portuguese India featuring the Basilica of Bom Jesus (mortal remains of St. Francis Xavier) and Se Cathedral.",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800",
      distance: "Old Goa (10 km from Panaji)",
      highlights: ["Basilica of Bom Jesus", "Se Cathedral 1510", "St. Augustine Tower", "Archaeological Museum"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "Year-Round | December Feast of St. Francis",
        overview: "Old Goa was a thriving metropolis known as the 'Rome of the East' in the 16th century. Today it stands as a UNESCO World Heritage site showcasing grand Manueline and Baroque church architecture.",
        experiences: [
          "View the silver casket containing the 450-year-old incorrupt body of St. Francis Xavier.",
          "Explore Se Cathedral, Asia's largest church housing the famous 'Golden Bell'.",
          "Photograph the 46-meter tall ruined bell tower of St. Augustine Church.",
          "Tour the Archaeological Museum showcasing Portuguese viceroy portraits and artifacts."
        ],
        travelTips: "Maintain respectful attire when visiting active places of worship (covered shoulders and knees)."
      }
    },
    {
      id: "anjuna-vagator",
      category: "beaches",
      categoryName: "Golden Beaches",
      title: "Anjuna & Vagator Cliff Beaches",
      description: "Dramatic red laterite cliff beaches in North Goa famous for Chapora Fort ('Dil Chahta Hai'), Curlies beach shack, and vibrant Wednesday flea markets.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
      distance: "North Goa (20 km from Panaji)",
      highlights: ["Chapora Fort Viewpoint", "Red Laterite Cliffs", "Curlies Beach Shack", "Sunset Point"],
      details: {
        altitude: "100 feet (30 m)",
        bestTime: "October to May | Sunset Hours",
        overview: "Anjuna and Vagator are famous for their bohemian vibe, red cliff formations overlooking palm-studded beaches, and iconic Chapora Fort where Bollywood's 'Dil Chahta Hai' was filmed.",
        experiences: [
          "Hike up Chapora Fort for sweeping views of Vagator Beach and Morjim river mouth.",
          "Watch magical sunsets from cliffside cafes overlooking the rocky Anjuna coastline.",
          "Shop for handcrafted jewelry, leather goods, and hammocks at Anjuna Wednesday Flea Market.",
          "Dine at legendary beach shacks with acoustic music and international cuisine."
        ],
        travelTips: "Sunset from Chapora Fort ramparts offers one of the finest photo spots in North Goa."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "goa-faq-1", question: "Which airport is closer to North Goa resorts?", answer: "MOPA Airport (GOX) is closer to North Goa beaches (Baga, Calangute, Anjuna). Dabolim Airport (GOI) is central between North & South Goa." },
    { id: "goa-faq-2", question: "Are water sports included in Goa tour packages?", answer: "Yes! Our 5-Day Grand Combo package includes a 5-in-1 water sports pass (Parasailing, Jet Ski, Banana ride, Bumper boat, and Speedboat)." },
    { id: "goa-faq-3", question: "Is Dudhsagar Waterfall 4x4 Jeep Safari open year-round?", answer: "The 4x4 jeep safari operates from October to May. During peak monsoons (June to September), jeep trails close due to high water levels." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Goa Beach Holiday", item: "/packages/goa-beach-holiday" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Goa Beach Holiday & Water Sports Packages 2026",
    description: "Book top-rated Goa holiday packages with GhumoFiroo. Includes North & South Goa beach resorts, Fort Aguada, Mandovi River sunset cruise & Dudhsagar 4x4 safari.",
    url: config.baseUrl + "/packages/goa-beach-holiday",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    duration: "P5D",
    itinerary: [
      { position: 1, name: "North Goa Beaches & Fort Aguada", description: "Baga, Calangute, Anjuna & 17th-century Fort Aguada." },
      { position: 2, name: "South Goa Heritage & Cathedrals", description: "Basilica of Bom Jesus, Se Cathedral & Mandovi sunset cruise." },
      { position: 3, name: "Grand Island Snorkeling & Dudhsagar Safari", description: "Dolphin boat cruise, snorkeling & 4x4 Dudhsagar safari." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "12500",
      includes: "4-star beach resort, Mandovi sunset cruise, daily breakfast & dinner, private AC vehicle transfers"
    },
    aggregateRating: {
      ratingValue: 4.9,
      reviewCount: 1450
    }
  })

  return (
    <Layout>
      <SEO 
        title="Goa Beach Tour Packages 2026 | Baga, Calangute & Dudhsagar Safari"
        description="Book top-rated Goa beach packages. North & South Goa beach resorts, Fort Aguada, Mandovi sunset cruise, Grand Island snorkeling & Dudhsagar 4x4 safari."
        keywords="Goa tour package 2026, Goa beach resort price, Baga beach water sports cost, Dudhsagar jeep safari booking"
        canonicalUrl={config.baseUrl + "/packages/goa-beach-holiday"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600" 
              alt="Goa Sunset Beach Palm Trees" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GOA_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Pearl of the Orient Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Goa Beach Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Baga & Calangute golden beaches, 17th-century Fort Aguada, Mandovi River sunset cruise, Grand Island snorkeling & Dudhsagar 4x4 safari.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Goa Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.90 ★", sub: "1,450+ Travelers" },
                { label: "Resort Stay", val: "4-Star Beachfront", sub: "North Goa Baga" },
                { label: "Water Sports", val: "5-in-1 Combo", sub: "Parasailing & Jet Ski" },
                { label: "Private Transfers", val: "100% Chauffeured", sub: "Airport & Railway Pickup" }
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
            title="Select Your Goa Tour Package" 
            subtitle="Choose from 3-day quick weekend breaks, 4-day best sellers, or 5-day Grand Island & water sports combos." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {goaPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt="" 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GOA_IMG }}
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
              title="Goa Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Goa itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "beaches", label: "Golden Beaches" },
                { key: "heritage", label: "Colonial Forts" },
                { key: "nature", label: "Waterfalls & Safaris" },
                { key: "adventure", label: "Island Cruises" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GOA_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_GOA_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes private cab transfers & beach resort stay</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹12,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Goa Travel FAQ" subtitle="Important details regarding airports, water sports & Dudhsagar jeep safari." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Goa Beach Collection"
          priceText="From ₹12,500"
          priceSubtext="Beach Resort & Sunset Cruise Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Goa%20Sun%20Sand%204D3N&price=16500")}
        />
      </div>
    </Layout>
  )
}

export default GoaBeachHoliday