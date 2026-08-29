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

const SingaporeFamily: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("singapore-family", 82000).toString().replace(/[^0-9]/g, ""))

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
    { label: "Changi Airport", lat: 1.3644, lng: 103.9915, day: "Day 1", description: "Arrival." },
    { label: "Family Suite Stays", lat: 1.2868, lng: 103.8545, day: "Day 1-2", description: "Spacious downtown suite lodging." },
    { label: "Universal Studios", lat: 1.2540, lng: 103.8238, day: "Day 3", description: "All-age theme park rides." },
    { label: "Waterpark Sentosa", lat: 1.2500, lng: 103.8200, day: "Day 4", description: "Adventure Cove waterpark." },
    { label: "Changi Airport Departure", lat: 1.3644, lng: 103.9915, day: "Day 5", description: "Return flight." }
  ]

  const days = [
    { day: 1, title: "Arrival & River Safari", description: "Land at Singapore. Meet private driver and check into family hotel. Visit the river-themed wildlife park in Mandai in the afternoon.", highlights: ["River Safari entry", "Panda Forest visit", "Spacious hotel suite"] },
    { day: 2, title: "Gardens by the Bay & Science Centre", description: "Explore the giant greenhouses and botanical playgrounds, and spend the afternoon at the interactive Science Centre.", highlights: ["Cloud Forest Dome", "Science Centre entry", "Kids Playgrounds"] },
    { day: 3, title: "Universal Studios USS Adventure", description: "Enjoy a full day of family entertainment, cartoon meetups and rollercoaster rides.", highlights: ["USS family ticket passes", "Transformer ride", "WaterWorld live show"] },
    { day: 4, title: "Adventure Cove Waterpark & Sentosa", description: "Slide down water tubes, snorkel with tropical fish, and relax on the lazy river at Adventure Cove.", highlights: ["Adventure Cove entry", "Snorkeling with fish", "Wings of Time show"] },
    { day: 5, title: "Jewel Changi Canopy Park & Departure", description: "Visit the indoor canopy nets and slides at Jewel Changi Canopy Park before checking in for departure.", highlights: ["Canopy Park slides", "Changi departure"] }
  ]

  const hotels = [
    { name: "Shangri-La Rasa Sentosa", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", starRating: 5, location: "Sentosa Beach", amenities: ["Kids Club", "Water Slides", "Private Beach Access"], priceFrom: "₹24,500" }
  ]

  const inclusions = [
    "AC private group transportation throughout",
    "Lodging in spacious family suites with breakfast",
    "Admissions to USS, S.E.A. Aquarium, River Safari and Adventure Cove",
    "EZ-Link cards with preloaded credits"
  ]

  const exclusions = [
    "International flights and travel insurance",
    "Tipping fees for private driver",
    "Lunches and dinners"
  ]

  const faqs = [
    { id: "sgf-faq-1", question: "Is this package suitable for toddlers?", answer: "Yes, we arrange stroller-friendly routes, infant car seats, and baby-friendly resort rooms upon request." }
  ]

  return (
    <Layout>
      <SEO 
        title="Singapore Family Vacation Package | GhumoFiroo Travels"
        description="Book our deluxe Singapore family tour package. Kid-friendly resort stays, Universal Studios passes, and waterpark access."
        canonicalUrl={config.baseUrl + "/packages/singapore-family"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200" alt="Singapore Family" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium International Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Singapore Family Fun
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Unforgettable memories for kids and adults alike.
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
              This package focuses on high-entertainment, kid-friendly attractions, and spacious resort lodging.
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
        <RouteMap stops={stops} title="Singapore Family Adventure Route Map" />
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

      <StickyCTA packageName="Singapore Family Vacation" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default SingaporeFamily
