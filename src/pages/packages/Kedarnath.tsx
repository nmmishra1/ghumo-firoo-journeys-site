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

const KedarnathYatra: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  
  // Read price from Dehradun heli hook or default road price
  const price = Number(usePackagePrice("kedarnath-yatra", 12500).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Kedarnath', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const stops = [
    { label: "Haridwar", lat: 29.9457, lng: 78.1642, day: "Day 1", description: "Start of journey." },
    { label: "Rishikesh", lat: 30.0869, lng: 78.2676, day: "Day 1", description: "Scenic spiritual town on Ganges." },
    { label: "Guptkashi", lat: 30.5200, lng: 79.0800, day: "Day 2", description: "Acclimatization base." },
    { label: "Sonprayag", lat: 30.6300, lng: 79.0200, day: "Day 3", description: "Trek registration node." },
    { label: "Gaurikund", lat: 30.6500, lng: 79.0300, day: "Day 3", description: "Hot spring thermal waters and trek starting point." },
    { label: "Kedarnath Temple", lat: 30.7346, lng: 79.0669, day: "Day 3-4", description: "Ancient Shiva shrine." }
  ]

  const days = [
    { day: 1, title: "Haridwar to Guptkashi via Rishikesh", description: "Early morning drive via Rishikesh. Enjoy beautiful views of Devprayag and Rudraprayag confluences. Check into hotel in Guptkashi.", highlights: ["Devprayag Confluence", "Mandakini River Views", "Acclimatization Stay"] },
    { day: 2, title: "Guptkashi to Gaurikund and Trek to Kedarnath", description: "Drive to Sonprayag, take local shuttle to Gaurikund. Begin the 16km trek to Kedarnath Dham. Helicopter options can drop off at Phata/Sersi.", highlights: ["Steep Mountain Trek", "Pony/Helicopter Options", "Gaurikund Snan"] },
    { day: 3, title: "Kedarnath Temple Darshan & Return to Guptkashi", description: "Attend early morning special abhishek aarti. Trek down to Gaurikund, drive back to Guptkashi for a comfortable hotel stay.", highlights: ["Morning Temple Aarti", "Descent Trek", "Massage and Rest"] },
    { day: 4, title: "Guptkashi to Haridwar Return", description: "Drive back along Ganga valley. Stop at Rishikesh for local sightseeing and Laxman Jhula before drop-off at Haridwar.", highlights: ["Confluence stops", "Haridwar drop-off"] }
  ]

  const hotels = [
    { name: "Kedar Valley Resorts", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600", starRating: 3, location: "Guptkashi", amenities: ["Running Hot Water", "Veg Restaurant", "Heaters"], priceFrom: "₹5,200" }
  ]

  const inclusions = [
    "AC SUV ground transfers from Haridwar/Rishikesh",
    "Lodging in deluxe camps and hotels",
    "Online permit biometric registration support",
    "First-aid and oxygen cylinder access",
    "Local guide and shuttle coordinate assistance"
  ]

  const exclusions = [
    "Pony, Palki or Helicopter fares",
    "Personal guide services",
    "Meals outside the hotel plan",
    "Tips and porter fees"
  ]

  const faqs = [
    { id: "k-faq-1", question: "Is a helicopter service available for Kedarnath?", answer: "Yes, we arrange private helicopter shuttles departing from Phata, Sersi, or Guptkashi directly to the Kedarnath helipad." },
    { id: "k-faq-2", question: "What is the trekking distance?", answer: "The trek is approximately 16km from Gaurikund. It is steep but fully paved with water points and medical camps along the way." }
  ]

  return (
    <Layout>
      <SEO 
        title="Kedarnath Ek Dham Yatra Bespoke Tour | GhumoFiroo Travels"
        description="Book your holy pilgrimage to Kedarnath. Deluxe road tours and premium helicopter packages with VIP Darshan slips."
        canonicalUrl={config.baseUrl + "/packages/kedarnath-yatra"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="/Kedarnath.png" alt="Kedarnath Yatra" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="luxury">Sacred Himalayan Pilgrimage</Badge>
            <Badge variant="luxuryOutline" className="text-white border-white">Helicopter Available</Badge>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Kedarnath Yatra
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Revere Lord Shiva at the ancient Kedarnath temple.
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
              This Ek Dham tour focuses entirely on the Kedarnath Temple. Located at 11,750 feet on the banks of Mandakini, this Shiva shrine is one of the 12 Jyotirlingas. We coordinate helicopter transfers, VIP entries, and comfortable base camps to ensure a smooth yatra.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/char-dham")}>Char Dham Hub</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/do-dham-yatra")}>Do Dham Hub</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/badrinath-yatra")}>Badrinath Yatra</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">4 Days / 3 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Difficulty:</span> <span className="font-bold text-red-500">Challenging</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Kedarnath Trek Route Map" />
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <SectionHeading kicker="Itinerary" title="Day-Wise Route" className="mx-auto mb-12" />
          <ItineraryAccordion days={days} />
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Stays" title="Guptkashi Accommodations" className="mx-auto mb-12" />
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

      <StickyCTA packageName="Kedarnath Ek Dham Yatra" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default KedarnathYatra
