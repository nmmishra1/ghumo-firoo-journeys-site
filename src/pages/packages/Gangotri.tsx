import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import SEO from "@/components/SEO"
import { config } from "@/config"
import { usePackagePrice } from "@/hooks/usePackagePrice"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ScrollReveal from "@/components/ui/ScrollReveal"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { FAQAccordion } from "@/components/ui/FAQAccordion"
import { StickyCTA } from "@/components/common/StickyCTA"
import { RouteMap } from "@/components/shared/RouteMap"
import { ItineraryAccordion } from "@/components/shared/ItineraryAccordion"
import { HotelList } from "@/components/shared/HotelList"
import { InclusionsExclusions } from "@/components/shared/InclusionsExclusions"
import { BookingFormWrapper } from "@/components/shared/BookingFormWrapper"
import { reviewService, GoogleReview } from "@/services/reviewService"

const GangotriYatra: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  
  // Read price from package hook
  const price = Number(usePackagePrice("gangotri-yatra", 10500).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Gangotri', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const stops = [
    { label: "Haridwar", lat: 29.9457, lng: 78.1642, day: "Day 1", description: "Start of journey." },
    { label: "Uttarkashi", lat: 30.7268, lng: 78.4500, day: "Day 2", description: "Holy town on the river banks." },
    { label: "Harsil Valley", lat: 31.0400, lng: 78.7400, day: "Day 3", description: "Picturesque apple orchards and forests." },
    { label: "Gangotri Temple", lat: 30.9947, lng: 78.9398, day: "Day 3-4", description: "Origin shrine of Goddess Ganga." }
  ]

  const days = [
    { day: 1, title: "Haridwar to Uttarkashi", description: "Early morning drive to Uttarkashi along the Bhagirathi River. Visit the Kashi Vishwanath temple in the evening.", highlights: ["Bhagirathi River Drive", "Kashi Vishwanath Temple", "Uttarkashi Stay"] },
    { day: 2, title: "Uttarkashi to Harsil & Gangotri Dham", description: "Drive through the scenic Harsil Valley. Arrive at Gangotri, take a holy dip in the river, and attend darshan at the main temple.", highlights: ["Harsil Valley stops", "Gangotri Temple Darshan", "Bhagirathi Snan"] },
    { day: 3, title: "Gangotri to Uttarkashi Return", description: "Spend the morning at the ghats. Drive back to Uttarkashi and enjoy the evening at leisure.", highlights: ["Morning River Prayers", "Scenic Return Drive", "Local markets"] },
    { day: 4, title: "Uttarkashi to Haridwar Return", description: "Complete final drives. Stop at Rishikesh for local sightseeing before returning to Haridwar.", highlights: ["Rishikesh sights", "Haridwar departure"] }
  ]

  const hotels = [
    { name: "Ganga Valley Uttarkashi", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600", starRating: 3, location: "Uttarkashi", amenities: ["Veg Food", "Heaters", "Room Service"], priceFrom: "₹4,800" }
  ]

  const inclusions = [
    "AC transportation from Haridwar/Rishikesh",
    "Lodging in standard hotels with meals",
    "Online biometric permits coordination",
    "VIP Darshan queue assistance",
    "First-aid and oxygen kits"
  ]

  const exclusions = [
    "Pony, Palki or personal porter fares",
    "Lunch or personal snacks",
    "Entrance tickets or camera charges",
    "Gratuity and tips"
  ]

  const faqs = [
    { id: "g-faq-1", question: "Is the road to Gangotri open throughout the season?", answer: "Yes, roads are generally smooth and well-maintained. We monitor weather reports daily to ensure secure transit." },
    { id: "g-faq-2", question: "What is Harsil Valley?", answer: "Harsil Valley is a scenic mountain retreat located en route to Gangotri, famous for apple orchards and deodar trees." }
  ]

  return (
    <Layout>
      <SEO 
        title="Gangotri Ek Dham Yatra Bespoke Tour | GhumoFiroo Travels"
        description="Book your holy yatra to Gangotri. Premium road journeys with VIP Darshan, hot springs dip, and Harsil Valley excursions."
        canonicalUrl={config.baseUrl + "/packages/gangotri-yatra"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="/Badrinath.png" alt="Gangotri Yatra" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Sacred Himalayan Pilgrimage</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Gangotri Yatra
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Visit the origin point of the holy river Ganges.
          </p>
          <Button variant="luxury" size="lg" className="px-8 shadow-luxury-md py-6 text-sm" onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}>
            Book This Yatra
          </Button>
        </div>
      </ScrollReveal>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-border/40 pb-12">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-display font-bold text-primary dark:text-foreground">Journey Overview</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              This Ek Dham yatra is dedicated entirely to Gangotri Temple. Located at 11,200 feet along the Bhagirathi River, this shrine represents the descent of the holy river Ganges onto earth. The tour includes scenic drives along Harsil Valley.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/char-dham")}>Char Dham Hub</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/do-dham-yatra")}>Do Dham Hub</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/yamunotri-yatra")}>Yamunotri Yatra</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">4 Days / 3 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Difficulty:</span> <span className="font-bold text-emerald-500">Easy</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Gangotri Route Map" />
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <SectionHeading kicker="Itinerary" title="Day-Wise Route" className="mx-auto mb-12" />
          <ItineraryAccordion days={days} />
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Stays" title="Premium Stays Selected" className="mx-auto mb-12" />
        <HotelList hotels={hotels} />
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <InclusionsExclusions inclusions={inclusions} exclusions={exclusions} />
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section id="booking-section" className="py-20 container mx-auto px-6">
        <BookingFormWrapper title="Secure Your Sacred Journey" onSubmit={(data) => console.log(data)} />
      </section>

      <StickyCTA packageName="Gangotri Ek Dham Yatra" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default GangotriYatra
