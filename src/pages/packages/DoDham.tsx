import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import Layout from "@/components/Layout"
import SEO from "@/components/SEO"
import { config } from "@/config"
import { usePackagePrice } from "@/hooks/usePackagePrice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ScrollReveal from "@/components/ui/ScrollReveal"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { FAQAccordion } from "@/components/ui/FAQAccordion"
import { StickyCTA } from "@/components/common/StickyCTA"
import LazyImage from "@/components/ui/LazyImage"
import { RouteMap } from "@/components/shared/RouteMap"
import { ItineraryAccordion } from "@/components/shared/ItineraryAccordion"
import { HotelList } from "@/components/shared/HotelList"
import { InclusionsExclusions } from "@/components/shared/InclusionsExclusions"
import { BookingFormWrapper } from "@/components/shared/BookingFormWrapper"
import { reviewService, GoogleReview } from "@/services/reviewService"
import { Clock, Star, ArrowRight, ShieldCheck, Heart, Sparkles, Compass } from "lucide-react"

const DoDhamYatra: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])

  const priceKB = Number(usePackagePrice("kedarnath-badrinath-tour", 22000).toString().replace(/[^0-9]/g, ""))
  const priceGY = Number(usePackagePrice("gangotri-yamunotri-tour", 18500).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Char Dham', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const stops = [
    { label: "Haridwar", lat: 29.9457, lng: 78.1642, day: "Day 1", description: "Gateway to the gods and start of the sacred journey." },
    { label: "Barkot", lat: 30.8100, lng: 78.2100, day: "Day 2", description: "Base town nestled in scenic valleys en route to Yamunotri." },
    { label: "Yamunotri", lat: 31.0100, lng: 78.4500, day: "Day 3", description: "The source of the sacred Yamuna River." },
    { label: "Uttarkashi", lat: 30.7268, lng: 78.4500, day: "Day 4-5", description: "Historic spiritual hub on the banks of Bhagirathi." },
    { label: "Kedarnath", lat: 30.7346, lng: 79.0669, day: "Day 6-7", description: "Venerated shrine of Lord Shiva in the high Himalayas." },
    { label: "Badrinath", lat: 30.7433, lng: 79.4938, day: "Day 8-9", description: "Sacred temple of Lord Vishnu on Alaknanda banks." }
  ]

  const days = [
    { day: 1, title: "Haridwar to Barkot/Guptkashi", description: "Drive from Haridwar through picturesque mountain passes. Acquire bio-registration permits.", highlights: ["Acclimatization", "Valley Views", "Permits Registration"] },
    { day: 2, title: "Shrine Excursion & Holy Snan", description: "Perform the trek or take a private helicopter/pony shuttle to the first sacred Dham for darshan.", highlights: ["VVIP Temple Entrance", "Devotional Puja", "Scenic Trails"] },
    { day: 3, title: "Travel to Second Dham Base", description: "Descend and transfer through scenic routes of Garhwal Himalayas to the next sacred destination.", highlights: ["River Confluences", "Local Cuisine", "Premium Lodging"] },
    { day: 4, title: "Second Shrine Darshan & Abhishek", description: "Visit the temple early in the morning for abhishek and special darshan coordinates.", highlights: ["Morning Aarti", "Temple Tour", "Divine Blessings"] },
    { day: 5, title: "Return Journey to Haridwar", description: "Drive back through Rishikesh. Stop at Devprayag confluence before drop off.", highlights: ["Devprayag Sightseeing", "Rishikesh Visit", "Departures"] }
  ]

  const hotels = [
    { name: "Sarovar Portico Badrinath", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", starRating: 4, location: "Badrinath", amenities: ["Heaters", "Room Service", "Pure Veg Restaurant"], priceFrom: "₹7,500" },
    { name: "Kedar Valley Resorts", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600", starRating: 3, location: "Guptkashi", amenities: ["Hot Water", "Doctor on Call", "Scenic Mountain View"], priceFrom: "₹5,500" }
  ]

  const inclusions = [
    "Premium AC SUV ground transfers",
    "Deluxe hotel stays with breakfast and dinner",
    "Online biometric registration assistance",
    "VIP Darshan passes at Kedarnath & Badrinath",
    "First-aid and emergency oxygen support kits"
  ]

  const exclusions = [
    "Pony, Palki, or Helicopter ticket fares",
    "Personal expenses (laundry, phone calls, tips)",
    "Lunch or personal snacks",
    "Travel insurance"
  ]

  const faqs = [
    { id: "dd-faq-1", question: "What is DoDham Yatra?", answer: "Do Dham Yatra refers to the pilgrimage to any two of the four sacred shrines. The most popular combination is Kedarnath and Badrinath." },
    { id: "dd-faq-2", question: "How physically demanding is this trip?", answer: "Kedarnath requires a 16km steep trek, while Badrinath is directly accessible by road. Ponies and helicopters are available for comfort." }
  ]

  return (
    <Layout>
      <SEO 
        title="Bespoke Do Dham Yatra Sacred Tours | GhumoFiroo Travels"
        description="Choose your sacred combination of Do Dham yatra. Custom premium road journeys to Kedarnath, Badrinath, Gangotri, and Yamunotri."
        canonicalUrl={config.baseUrl + "/packages/do-dham-yatra"}
      />

      {/* 1. HERO */}
      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="/Kedarnath.png" alt="Do Dham Yatra" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Sacred Himalayan Pilgrimage</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Do Dham Yatra
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Select your preferred double-shrine combination. Experience premium transfers and VIP darshans.
          </p>
          <Button variant="luxury" size="lg" className="px-8 shadow-luxury-md py-6 text-sm" onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}>
            Book This Yatra
          </Button>
        </div>
      </ScrollReveal>

      {/* 2. OVERVIEW */}
      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-border/40 pb-12">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-display font-bold text-primary dark:text-foreground">Journey Overview</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              The Do Dham Yatra is the perfect choice for pilgrims wishing to visit two major Himalayan shrines (typically Kedarnath & Badrinath or Gangotri & Yamunotri) under tighter timelines. Our bespoke arrangements prioritize senior pilgrim comfort, medical setups, and priority access.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/char-dham")}>Char Dham Hub</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">5 - 7 Days</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{priceKB.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Difficulty:</span> <span className="font-bold text-amber-500">Moderate</span></div>
          </div>
        </div>
      </section>

      {/* CHOICE CARDS SECTION */}
      <section className="py-12 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Select Combination" title="Popular Do Dham Paths" align="center" className="mx-auto mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Card variant="luxury" className="flex flex-col justify-between hover:shadow-luxury-md hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="p-6 pb-2">
              <Badge variant="luxuryOutline" className="w-fit text-[9px] mb-2">Most Popular</Badge>
              <CardTitle className="text-lg font-display font-bold text-primary dark:text-foreground">Kedarnath & Badrinath</CardTitle>
              <CardDescription className="text-xs pt-1">Visit Lord Shiva's high-altitude shrine and Lord Vishnu's temple.</CardDescription>
            </CardHeader>
            <CardFooter className="p-6">
              <Link to="/packages/kedarnath-badrinath-tour" className="flex items-center gap-1 text-xs font-semibold text-[#C9A25A] hover:text-[#D8B97A]">
                Explore Path <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardFooter>
          </Card>
          <Card variant="luxury" className="flex flex-col justify-between hover:shadow-luxury-md hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="p-6 pb-2">
              <Badge variant="luxuryOutline" className="w-fit text-[9px] mb-2">Himalayan Origin</Badge>
              <CardTitle className="text-lg font-display font-bold text-primary dark:text-foreground">Gangotri & Yamunotri</CardTitle>
              <CardDescription className="text-xs pt-1">Explore the origins of the holy Yamuna and Ganges rivers.</CardDescription>
            </CardHeader>
            <CardFooter className="p-6">
              <Link to="/packages/gangotri-yamunotri-tour" className="flex items-center gap-1 text-xs font-semibold text-[#C9A25A] hover:text-[#D8B97A]">
                Explore Path <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 3. ROUTE MAP */}
      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Do Dham Alternative Routes Map" />
      </section>

      {/* 4. ITINERARY */}
      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <SectionHeading kicker="Itinerary" title="Double Shrine General Timeline" className="mx-auto mb-12" />
          <ItineraryAccordion days={days} />
        </div>
      </section>

      {/* 5. HOTELS */}
      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Accommodations" title="Premium Stays Selected" className="mx-auto mb-12" />
        <HotelList hotels={hotels} />
      </section>

      {/* 6. INCLUSIONS / EXCLUSIONS */}
      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <InclusionsExclusions inclusions={inclusions} exclusions={exclusions} />
        </div>
      </section>

      {/* 7. REVIEWS */}
      {reviews.length > 0 && (
        <section className="py-20 container mx-auto px-6 max-w-5xl">
          <SectionHeading kicker="Testimonials" title="Pilgrim Stories" className="mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <Card key={r.id} variant="glass" className="p-6 flex flex-col justify-between">
                <p className="text-xs text-slate-350 italic font-serif">"{r.review_text}"</p>
                <div className="pt-4 flex items-center gap-3 border-t border-white/5 mt-4">
                  <div className="text-xs font-bold text-white">{r.reviewer_name}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 8. FAQ */}
      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* 9. BOOKING FORM */}
      <section id="booking-section" className="py-20 container mx-auto px-6">
        <BookingFormWrapper title="Secure Your Sacred Journey" onSubmit={(data) => console.log(data)} />
      </section>

      {/* 10. STICKY CTA */}
      <StickyCTA packageName="Do Dham Yatra Combo" priceText={`Starting ₹${priceKB.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default DoDhamYatra
