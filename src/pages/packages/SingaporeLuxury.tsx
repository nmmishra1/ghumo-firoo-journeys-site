import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import SEO from "@/components/SEO"
import { config } from "@/config"
import { usePackagePrice } from "@/hooks/usePackagePrice"
import { Button } from "@/components/ui/button"
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

const SingaporeLuxury: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("singapore-luxury", 210000).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Singapore', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const stops = [
    { label: "Changi Airport", lat: 1.3644, lng: 103.9915, day: "Day 1", description: "VIP Fast track arrival." },
    { label: "Marina Bay Sands Suite", lat: 1.2868, lng: 103.8545, day: "Day 1-2", description: "Premium suite accommodation." },
    { label: "Gardens by the Bay VIP", lat: 1.2816, lng: 103.8636, day: "Day 3", description: "Private guided domes tour." },
    { label: "Capella Sentosa Villa", lat: 1.2494, lng: 103.8303, day: "Day 4", description: "VVIP Villa stay." },
    { label: "Changi Airport Departure", lat: 1.3644, lng: 103.9915, day: "Day 5", description: "VIP Departure." }
  ]

  const days = [
    { day: 1, title: "VIP JetQuay Arrival & MBS Suite", description: "Arrive at Changi via private JetQuay terminal. Transfer in private Rolls-Royce to Marina Bay Sands. Check into club suite.", highlights: ["JetQuay VIP Terminal access", "Rolls-Royce ground transfer", "MBS Club Suite check-in"] },
    { day: 2, title: "Private Yacht Cruise & Michelin Dining", description: "Dine on a Michelin-starred multi-course dinner during a private yacht cruise along the skyline.", highlights: ["Private yacht cruise", "Michelin-starred dining", "Spectra lights from sea"] },
    { day: 3, title: "Private helicopter tour & Gardens VIP", description: "Enjoy a scenic private helicopter flight over Singapore. Afternoon private guided tour of the Cloud Dome.", highlights: ["Helicopter tour flight", "Gardens by the Bay VIP entry"] },
    { day: 4, title: "VVIP Capella Sentosa Villa stay", description: "Transfer to a private pool villa at Capella Sentosa. Dedicated butler service. 150m premium body wellness treatments.", highlights: ["Capella pool villa stay", "24/7 dedicated butler", "150m spa wellness"] },
    { day: 5, title: "JetQuay VIP Departure", description: "Rolls-Royce transfer back to JetQuay terminal at Changi for check-in and immigration clearances.", highlights: ["JetQuay private boarding", "Return flight departures"] }
  ]

  const hotels = [
    { name: "Marina Bay Sands (Sands Suite)", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Marina Bay", amenities: ["Infinity Pool", "Club Lounge", "24/7 Butler"], priceFrom: "₹55,000" }
  ]

  const inclusions = [
    "VIP JetQuay private terminal handling at Changi Airport",
    "Rolls-Royce/Mercedes luxury vehicles for ground transfers",
    "Stays in premium suites (MBS Club Suite) and Capella pool villas",
    "Private yacht charters, helicopter rides, and Michelin dining tours"
  ]

  const exclusions = [
    "International flight tickets",
    "Visa application fees",
    "Extra dining orders not listed"
  ]

  const faqs = [
    { id: "sglx-faq-1", question: "Is the private butler available 24/7?", answer: "Yes, both Marina Bay Sands Suites and Capella Villas include dedicated round-the-clock butler service." }
  ]

  return (
    <Layout>
      <SEO 
        title="Singapore Elite Ultra-Luxury Package | GhumoFiroo Travels"
        description="Book our VVIP ultra-luxury Singapore package. Private Rolls-Royce transfers, MBS club suites, helicopter tour, and Capella villas."
        canonicalUrl={config.baseUrl + "/packages/singapore-luxury"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200" alt="Singapore Luxury" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium International Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Singapore Elite Luxury
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Uncompromised VVIP tours featuring Rolls-Royce, yachts and private pool villas.
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
              This VVIP holiday is designed for high-profile travelers wishing to experience Singapore's finest leisure systems.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/singapore")}>Singapore Hub</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">5 Days / 4 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Difficulty:</span> <span className="font-bold text-emerald-500">Easy</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Singapore Elite Luxury Route Map" />
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
        <BookingFormWrapper onSubmit={(data) => console.log(data)} />
      </section>

      <StickyCTA packageName="Singapore Elite Luxury Vacation" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default SingaporeLuxury
