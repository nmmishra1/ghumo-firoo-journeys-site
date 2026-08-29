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

const YamunotriYatra: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  
  // Read price from package hook
  const price = Number(usePackagePrice("yamunotri-yatra", 10500).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Yamunotri', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const stops = [
    { label: "Haridwar", lat: 29.9457, lng: 78.1642, day: "Day 1", description: "Start of journey." },
    { label: "Barkot", lat: 30.8100, lng: 78.2100, day: "Day 2", description: "Base town for Yamunotri transfers." },
    { label: "Janki Chatti", lat: 30.9800, lng: 78.4200, day: "Day 3", description: "Trek starting point." },
    { label: "Yamunotri Temple", lat: 31.0100, lng: 78.4500, day: "Day 3-4", description: "Origin shrine of river Yamuna." }
  ]

  const days = [
    { day: 1, title: "Haridwar to Barkot via Mussoorie", description: "Early morning drive to Barkot. Enjoy scenic mountain views, stop at Kempty Falls, and rest at Barkot camp.", highlights: ["Kempty Falls tour", "Yamuna valley drive", "Barkot stay"] },
    { day: 2, title: "Yamunotri Dham Excursion", description: "Drive to Janki Chatti. Begin the 6km trek to Yamunotri Dham. Take a hot water dip at Surya Kund, perform darshan, and trek back to Barkot.", highlights: ["Yamunotri Temple Puja", "Surya Kund hot springs", "6km trek path"] },
    { day: 3, title: "Barkot to Rishikesh / Haridwar Return", description: "Drive back along the Ganges valley. Stop at Rishikesh for local sightseeing before returning to Haridwar.", highlights: ["Rishikesh sights", "Haridwar departure"] }
  ]

  const hotels = [
    { name: "Pavilion Resort Barkot", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600", starRating: 3, location: "Barkot", amenities: ["Valley Views", "Hot Water", "Parking"], priceFrom: "₹5,200" }
  ]

  const inclusions = [
    "AC transportation from Haridwar/Rishikesh",
    "Lodging in standard deluxe camps/hotels with meals",
    "Online permits biometric registration",
    "VIP Darshan queue assistance",
    "First-aid and oxygen kits"
  ]

  const exclusions = [
    "Pony, Palki or personal porter fares during Yamunotri trek",
    "Lunch or personal snacks",
    "Entrance tickets or camera charges",
    "Gratuity and tips"
  ]

  const faqs = [
    { id: "y-faq-1", question: "How long is the trek to Yamunotri?", answer: "The trek is approximately 6km from Janki Chatti. Horses, palanquins, or baskets are available for those who prefer not to walk." },
    { id: "y-faq-2", question: "What is Divya Shila?", answer: "Divya Shila is a sacred rock pillar near Surya Kund, which pilgrims worship before entering the Yamunotri temple." }
  ]

  return (
    <Layout>
      <SEO 
        title="Yamunotri Ek Dham Yatra Bespoke Tour | GhumoFiroo Travels"
        description="Book your holy yatra to Yamunotri. Premium road journeys with VIP Darshan, hot springs dip, and Janki Chatti trekking."
        canonicalUrl={config.baseUrl + "/packages/yamunotri-yatra"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="/Badrinath.png" alt="Yamunotri Yatra" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Sacred Himalayan Pilgrimage</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Yamunotri Yatra
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Visit the origin point of the holy river Yamuna.
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
              This Ek Dham yatra is dedicated entirely to Yamunotri Temple. Located at 10,800 feet along the Yamuna river basin, this shrine marks the origin of the sacred Yamuna. The tour includes beautiful scenic drives along Barkot valley and thermal baths at Surya Kund.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/char-dham")}>Char Dham Hub</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/do-dham-yatra")}>Do Dham Hub</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/gangotri-yatra")}>Gangotri Yatra</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">3 Days / 2 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Difficulty:</span> <span className="font-bold text-amber-500">Moderate</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Yamunotri Route Map" />
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

      <StickyCTA packageName="Yamunotri Ek Dham Yatra" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default YamunotriYatra
