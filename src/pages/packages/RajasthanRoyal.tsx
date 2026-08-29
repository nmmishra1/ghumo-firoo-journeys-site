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

const RajasthanRoyal: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_RAJASTHAN_IMG = "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Rajasthan', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const rajasthanPackages = [
    {
      id: "rajasthan-5d-4n",
      title: "Jaipur & Ranthambore Tiger Safari (5D/4N)",
      desc: "Short Rajasthan break covering Jaipur Amer Fort, Hawa Mahal, Jal Mahal & Ranthambore National Park 4x4 Tiger Safari.",
      badge: "Express Safari",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800",
      price: 19500,
      duration: "5 Days / 4 Nights",
      rating: 4.88,
      reviewsCount: 320,
      stay: "Jaipur Heritage Haveli (2N) + Ranthambore Jungle Resort (2N)",
      vehicle: "Chauffeured Private AC SUV / Sedan",
      link: "/packages/rajasthan-5d-4n",
      highlights: ["Amer Fort Elephant Rampart", "Ranthambore 4x4 Tiger Safari", "Hawa Mahal Photo", "Jal Mahal"],
      itinerary: [
        { day: "Day 1", title: "Jaipur Pickup → Pink City Bazaars Check-in", desc: "Private pickup from Jaipur Airport / Station. Check-in to heritage haveli & evening Johari Bazaar stroll." },
        { day: "Day 2", title: "Jaipur Sightseeing → Amer Fort & Sunset View", desc: "Elephant ride up Amer Fort, Sheesh Mahal, Jal Mahal & sunset from Nahargarh Fort." },
        { day: "Day 3", title: "Jaipur to Ranthambore Tiger Sanctuary Drive", desc: "Drive to Ranthambore National Park. Check-in to jungle resort & evening nature trail." },
        { day: "Day 4", title: "Ranthambore Morning & Evening 4x4 Canter Safari", desc: "Open-top 4x4 jeep safari inside Ranthambore tiger zones to spot Bengal tigers & leopard." },
        { day: "Day 5", title: "Ranthambore to Jaipur Airport Departure", desc: "Breakfast and transfer back to Jaipur Airport or Sawai Madhopur Railway Station." }
      ],
      inclusions: ["4 Nights 4-Star Heritage & Jungle Resort", "1 Ranthambore Open Jeep Safari Pass", "Daily Breakfast & Dinner", "Private AC Vehicle"],
      exclusions: ["Personal monument guide fees", "Flight / Train fares"]
    },
    {
      id: "rajasthan-7d-6n",
      title: "Royal Rajasthan Forts & Lakes (7D/6N)",
      desc: "Our best-selling Rajasthan circuit covering Jaipur, Jodhpur Mehrangarh Fort, Ranakpur Marble Temple & Udaipur Lake Pichola.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800",
      price: 24500,
      duration: "7 Days / 6 Nights",
      rating: 4.95,
      reviewsCount: 840,
      stay: "Jaipur (2N) + Jodhpur Palace (2N) + Udaipur Lake Hotel (2N)",
      vehicle: "Chauffeured Private AC SUV / Innova",
      link: "/packages/rajasthan-7d-6n",
      highlights: ["Udaipur Lake Pichola Cruise", "Mehrangarh Fort 125m Cliff", "Ranakpur 1,444 Pillars", "Amer Fort"],
      itinerary: [
        { day: "Day 1", title: "Jaipur Pickup → Heritage Hotel Check-in", desc: "Pickup at Jaipur Airport. Check-in to heritage hotel & evening Chokhi Dhani village dinner." },
        { day: "Day 2", title: "Jaipur Amer Fort & City Palace Tour", desc: "Amer Fort, Sheesh Mahal, Jal Mahal, City Palace & Jantar Mantar." },
        { day: "Day 3", title: "Jaipur to Jodhpur Blue City Drive", desc: "Drive to Jodhpur. Visit Mehrangarh Fort, Jaswant Thada Cenotaph & Blue City alley walk." },
        { day: "Day 4", title: "Jodhpur Bishnoi Village 4x4 Safari & Umaid Bhawan", desc: "4x4 safari through Bishnoi blackbuck wildlife village & Umaid Bhawan Palace museum." },
        { day: "Day 5", title: "Jodhpur to Udaipur via Ranakpur Marble Temple", desc: "Drive to Udaipur. Tour 15th-century 1,444 marble column Ranakpur Jain Temple." },
        { day: "Day 6", title: "Udaipur City Palace & Lake Pichola Boat Cruise", desc: "Tour Udaipur City Palace, Saheliyon Ki Bari & sunset boat cruise past Taj Lake Palace." },
        { day: "Day 7", title: "Udaipur Airport Departure Transfer", desc: "Breakfast and drop-off at Udaipur Maharana Pratap Airport." }
      ],
      inclusions: ["6 Nights 4-Star Heritage Stays", "Lake Pichola Sunset Boat Cruise Ticket", "Ranakpur Temple Entry Pass", "Daily Breakfast & Dinner"],
      exclusions: ["Flight tickets to Jaipur"]
    },
    {
      id: "rajasthan-9d-8n",
      title: "Grand Rajasthan Desert & Palace Circuit (9D/8N)",
      desc: "Complete Rajasthan extravaganza adding Jaisalmer Golden Fort, Sam Sand Dunes camel safari, tent camp & cultural folk dance night.",
      badge: "Grand Desert",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800",
      price: 34500,
      duration: "9 Days / 8 Nights",
      rating: 4.98,
      reviewsCount: 510,
      stay: "Jaipur (2N) + Jodhpur (2N) + Jaisalmer Desert Camp (1N) + Jaisalmer Hotel (1N) + Udaipur (2N)",
      vehicle: "Chauffeured Private AC Innova / SUV",
      link: "/packages/rajasthan-9d-8n",
      highlights: ["Sam Sand Dunes Desert Camp", "Kalbelia Folk Dance Night", "Jaisalmer Golden Fort", "Udaipur Lakes"],
      itinerary: [
        { day: "Day 1", title: "Jaipur Arrival → Pink City Walk", desc: "Pickup at Jaipur Airport and check-in to heritage haveli." },
        { day: "Day 2", title: "Jaipur Amer Fort & Hawa Mahal", desc: "Full day Pink City heritage sightseeing." },
        { day: "Day 3", title: "Jaipur to Jodhpur Drive", desc: "Drive to Jodhpur Blue City & Mehrangarh Fort." },
        { day: "Day 4", title: "Jodhpur to Jaisalmer Thar Desert", desc: "Drive to Jaisalmer. Visit Kuldhara ghost village & check-in to Sam Sand Dunes Swiss tent camp." },
        { day: "Day 5", title: "Jaisalmer Sunset Camel Ride & Folk Dance", desc: "Sunset camel safari on golden sand dunes, Rajasthani Kalbelia folk dance & campfire buffet dinner." },
        { day: "Day 6", title: "Jaisalmer Fort (Sonar Qila) & Patwon Haveli", desc: "Tour 1156 AD living Golden Fort & carved Patwon Ki Haveli." },
        { day: "Day 7", title: "Jaisalmer to Udaipur via Ranakpur", desc: "Drive past Thar desert to Udaipur Lake City." },
        { day: "Day 8", title: "Udaipur City Palace & Lake Pichola Cruise", desc: "City Palace tour & sunset boat cruise." },
        { day: "Day 9", title: "Udaipur Airport Departure Transfer", desc: "Breakfast and drop-off at Udaipur Airport." }
      ],
      inclusions: ["8 Nights Accommodation (1 Luxury Desert Camp + 7 Heritage Hotels)", "Sam Sand Dunes Camel & 4x4 Safari", "Kalbelia Folk Dance Night Pass", "Lake Pichola Boat Cruise", "Daily Meals"],
      exclusions: ["Train / Flight tickets"]
    }
  ]

  const attractions = [
    {
      id: "amer-fort",
      category: "forts",
      categoryName: "Palaces & Forts",
      title: "Amer Fort & Sheesh Mahal Jaipur",
      description: "Majestic 1592 AD hilltop fortress overlooking Maota Lake, famous for its intricate Sheesh Mahal (Mirror Palace) and yellow sandstone ramparts.",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800",
      distance: "Jaipur (11 km)",
      highlights: ["Sheesh Mahal Mirror Work", "Elephant Rampart Ride", "Maota Lake View", "Light & Sound Show"],
      details: {
        altitude: "1,400 feet (430 m)",
        bestTime: "October to March | Morning Hours 8:00 AM",
        overview: "Built by Raja Man Singh I in 1592 AD, Amer Fort is a UNESCO World Heritage site blending Hindu Rajput and Mughal architecture. Its famed Sheesh Mahal is inlaid with thousands of concave mirrors that reflect light into glowing constellations.",
        experiences: [
          "Ascend the cobblestone fortress ramparts on decorated royal elephants or private 4x4 jeeps.",
          "Light a single candle inside Sheesh Mahal to see thousand mirror reflections dance on the ceiling.",
          "Walk through Diwan-i-Aam (Hall of Public Audience) and royal zenana courtyards.",
          "Enjoy the evening Sound & Light Show illuminating the fort ramparts against the night sky."
        ],
        travelTips: "Visit at 8:00 AM to get morning elephant rides up the fort before limited daily quota finishes."
      }
    },
    {
      id: "lake-pichola",
      category: "lakes",
      categoryName: "Lakes & Waterfalls",
      title: "Udaipur Lake Pichola & City Palace",
      description: "Picturesque 1362 AD artificial freshwater lake hosting the grand City Palace complex, Jag Mandir island palace, and Taj Lake Palace.",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800",
      distance: "Udaipur City Center",
      highlights: ["Sunset Boat Cruise", "City Palace Museum", "Jag Mandir Island", "Taj Lake Palace View"],
      details: {
        altitude: "1,960 feet (600 m)",
        bestTime: "September to March | Golden Hour Sunset Cruise",
        overview: "Lake Pichola is the romantic soul of Udaipur ('Venice of the East'). Built in 1362 AD by a local grain merchant, it stretches 4 km long with marble palaces floating on its placid blue waters.",
        experiences: [
          "Take a sunset boat cruise past white marble palaces reflecting in golden lake waters.",
          "Tour Rajasthan's largest royal palace complex, Udaipur City Palace, built over 400 years.",
          "Disembark at Jag Mandir island for evening drinks at the marble court courtyard.",
          "Photograph the floating Taj Lake Palace lit up against the Aravalli mountain backdrop."
        ],
        travelTips: "Book 5:00 PM sunset boat tickets from Rameshwar Ghat inside City Palace grounds."
      }
    },
    {
      id: "sam-sand-dunes",
      category: "desert",
      categoryName: "Desert & Safaris",
      title: "Jaisalmer Sam Sand Dunes & Desert Camp",
      description: "Sweeping golden Thar Desert sand dunes offering sunset camel safaris, 4x4 dune bashing, Swiss tent stays, and Kalbelia folk music nights.",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800",
      distance: "Jaisalmer (45 km)",
      highlights: ["Sunset Camel Safari", "4x4 Dune Bashing", "Swiss Tent Camp", "Kalbelia Folk Dance"],
      details: {
        altitude: "750 feet (225 m)",
        bestTime: "November to February | Sunset & Stargazing Hours",
        overview: "Sam Sand Dunes are Jaisalmer's most famous desert wilderness spot. Giant wind-sculpted sand dunes rise 30 to 60 meters high in the heart of the Thar Desert near the India-Pakistan border.",
        experiences: [
          "Ride camels across golden sand crests while watching dramatic desert sunsets.",
          "Experience thrilling 4x4 Mahindra Thar jeep dune bashing over steep sand slopes.",
          "Stay overnight in luxury Swiss tent camps featuring attached tiled bath & verandah.",
          "Watch authentic Kalbelia snake charmer folk dances and fire shows around a desert campfire."
        ],
        travelTips: "Deserts cool down rapidly after sunset. Carry warm jackets even if daytime temperatures feel warm."
      }
    },
    {
      id: "mehrangarh-fort",
      category: "forts",
      categoryName: "Palaces & Forts",
      title: "Jodhpur Mehrangarh Fort (125m Cliff)",
      description: "One of India's largest and most imposing forts standing 125 meters high atop a sheer perpendicular cliff overlooking Jodhpur's indigo Blue City.",
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800",
      distance: "Jodhpur City Center",
      highlights: ["125m Perpendicular Cliff", "Blue City Panorama", "Jaswant Thada Cenotaph", "Museum Armory"],
      details: {
        altitude: "1,310 feet (400 m)",
        bestTime: "October to March | Morning Hours",
        overview: "Built in 1459 AD by Rao Jodha, Mehrangarh Fort towers majestically over Jodhpur. Its 36-meter high wall ramps contain opulent palaces like Phool Mahal (Flower Palace) and Moti Mahal (Pearl Palace).",
        experiences: [
          "Walk through the imposing 7 royal entry gates (Pol) showing historical cannonball marks.",
          "Admire royal palanquins, gold howdahs, miniature paintings, and medieval armory in museum galleries.",
          "Look down from the fortress ramparts onto thousands of indigo-painted houses in Blue City.",
          "Visit nearby Jaswant Thada, a royal white marble cenotaph built beside a quiet lake."
        ],
        travelTips: "Elevators are available for senior citizens to reach the top palace courtyards easily."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "rj-faq-1", question: "What is the best month to visit Rajasthan?", answer: "October to March offers dry, pleasant weather (15°C to 25°C), ideal for exploring forts, palaces, and Thar desert camel safaris." },
    { id: "rj-faq-2", question: "Is desert camping in Jaisalmer suitable for families?", answer: "Yes! Swiss desert camps feature carpeted bedrooms, private attached tiled bathrooms, hot showers, traditional folk dance entertainment, and 24/7 security." },
    { id: "rj-faq-3", question: "Are private chauffeured cars provided for inter-city drives?", answer: "Yes! A dedicated private AC vehicle (Sedan / SUV / Innova) remains with you from your arrival city to departure." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Rajasthan Royal", item: "/packages/rajasthan-royal" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Rajasthan Royal Forts & Lakes Packages 2026",
    description: "Book top-rated Rajasthan tour packages with GhumoFiroo. Includes Jaipur Pink City Amer Fort, Udaipur Lake Pichola boat cruise, Jaisalmer Sam Sand Dunes 4x4 safari & Jodhpur Mehrangarh Fort.",
    url: config.baseUrl + "/packages/rajasthan-royal",
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&q=80",
    duration: "P7D",
    itinerary: [
      { position: 1, name: "Jaipur Amer Fort & Sheesh Mahal", description: "Elephant ride up Amer Fort & Hawa Mahal." },
      { position: 2, name: "Jodhpur Blue City & Mehrangarh Fort", description: "Mehrangarh fort cliff tour & Jaswant Thada." },
      { position: 3, name: "Udaipur Lake Pichola Boat Cruise", description: "City Palace tour & sunset lake cruise." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "19500",
      includes: "4-star heritage havelis, Lake Pichola boat cruise, daily breakfast & dinner, private AC vehicle"
    },
    aggregateRating: {
      ratingValue: 4.95,
      reviewCount: 2650
    }
  })

  return (
    <Layout>
      <SEO 
        title="Rajasthan Tour Packages 2026 | Jaipur, Udaipur & Jaisalmer Sand Dunes"
        description="Book top-rated Rajasthan tour packages. Includes Jaipur Pink City Amer Fort, Udaipur Lake Pichola boat cruise, Jaisalmer Sam Sand Dunes 4x4 safari, Jodhpur Mehrangarh Fort & heritage havelis."
        keywords="Rajasthan tour package 2026, Jaipur Udaipur tour price, Jaisalmer desert safari cost, Rajasthan honeymoon package"
        canonicalUrl={config.baseUrl + "/packages/rajasthan-royal"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=1600" 
              alt="Rajasthan Jaipur Palace Fort" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_RAJASTHAN_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Land of Kings & Forts Collection
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Rajasthan Royal Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Jaipur Amer Fort, Udaipur Lake Pichola boat cruises, Jaisalmer Sam Sand Dunes 4x4 safaris & royal heritage havelis.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Rajasthan Packages <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.95 ★", sub: "2,650+ Travelers" },
                { label: "Heritage Stay", val: "Royal Haveli", sub: "Jaipur & Udaipur" },
                { label: "Desert Safari", val: "Sam Sand Dunes", sub: "Camel & 4x4 Jeep" },
                { label: "Private Vehicle", val: "100% Chauffeured", sub: "Inter-City AC Cab" }
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
            title="Select Your Rajasthan Tour Package" 
            subtitle="Choose from 5-day Jaipur & tiger safari breaks, 7-day best seller palace circuits, or 9-day grand desert specials." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rajasthanPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt="" 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_RAJASTHAN_IMG }}
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
              title="Rajasthan Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Rajasthan itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "forts", label: "Palaces & Forts" },
                { key: "lakes", label: "Lakes & Waterfalls" },
                { key: "desert", label: "Desert & Safaris" }
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
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_RAJASTHAN_IMG }}
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
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_RAJASTHAN_IMG }}
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
                      <span className="text-xs text-slate-400 block font-light">Includes private cab transfers & heritage hotel stay</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹19,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Rajasthan Travel FAQ" subtitle="Important details regarding weather, desert camps & private cab transfers." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Rajasthan Royal Collection"
          priceText="From ₹19,500"
          priceSubtext="Heritage Haveli & Lake Pichola Cruise Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Royal%20Rajasthan%207D6N&price=24500")}
        />
      </div>
    </Layout>
  )
}

export default RajasthanRoyal
