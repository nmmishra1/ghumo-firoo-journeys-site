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

const SingaporeHoneymoon: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("singapore-honeymoon", 95000).toString().replace(/[^0-9]/g, ""))

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
    { label: "Boutique Bay Hotel", lat: 1.2868, lng: 103.8545, day: "Day 1-2", description: "Luxury city stay." },
    { label: "Private Yacht Harbour", lat: 1.2720, lng: 103.8180, day: "Day 3", description: "Sunset yacht charter." },
    { label: "Sentosa Couple Villas", lat: 1.2494, lng: 103.8303, day: "Day 4", description: "Secluded couples villa stay." },
    { label: "Changi Airport Departure", lat: 1.3644, lng: 103.9915, day: "Day 5", description: "Return flight." }
  ]

  const days = [
    { day: 1, title: "Romantic Arrival & Flower Dome", description: "Land at Singapore. Private Mercedes luxury transfer to your bayfront hotel. Visit Flower Dome in the evening.", highlights: ["Luxury Mercedes pickup", "Premium bayfront hotel", "Evening flower gardens"] },
    { day: 2, title: "Sky Dining & Observation Deck", description: "Enjoy a private 4-course gourmet sky-dining dinner inside a private cable car cabin overlooking Singapore skyline.", highlights: ["Cable Car Sky Dining", "Sands Observation Deck", "Private photoshoot"] },
    { day: 3, title: "Private Sunset Yacht Charter", description: "Board a private yacht charter from One15 Marina Sentosa. Sail to southern islands. Toast with champagne at sunset.", highlights: ["Private yacht cruise", "Champagne toast", "Southern islands swimming"] },
    { day: 4, title: "Couples Spa & Sentosa Leisure", description: "Indulge in a 120-minute couples massage at a premium Sentosa island spa. Relax by the villa private pool.", highlights: ["120m Couples Spa massage", "Private pool villa", "Wings of Time VIP seats"] },
    { day: 5, title: "Jewel VIP Lounge & Departure", description: "Enjoy VIP airport lounge access at Changi Airport before checking in for your flight.", highlights: ["Changi VIP Lounge access", "Airport drop-off"] }
  ]

  const hotels = [
    { name: "The Fullerton Bay Hotel", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600", starRating: 5, location: "Marina Bay", amenities: ["Roof Bar", "Infinity Pool", "Butler Service"], priceFrom: "₹32,500" }
  ]

  const inclusions = [
    "Private Mercedes-Benz transfers throughout",
    "Lodging in 5-star bayfront hotels and pool villas",
    "Private yacht charter, sky dining, and 120-minute spa treatments",
    "VIP Changi airport lounge access passes"
  ]

  const exclusions = [
    "Flights and visa costs",
    "Personal guide tipping fees",
    "Lunches and dinners not listed"
  ]

  const faqs = [
    { id: "sgh-faq-1", question: "Can we customize the sky dining menu?", answer: "Yes, you can select standard, vegetarian, or Jain menus upon booking confirmation." }
  ]

  return (
    <Layout>
      <SEO 
        title="Singapore Romantic Honeymoon Vacation | GhumoFiroo Travels"
        description="Book our deluxe Singapore Honeymoon package. Private yacht charter, sky-dining cable car dinner, and pool villa stays."
        canonicalUrl={config.baseUrl + "/packages/singapore-honeymoon"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200" alt="Singapore Honeymoon" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium International Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Singapore Honeymoon
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Ultimate romantic trip featuring sky-dining, yacht cruises and pool villas.
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
              This package is crafted for couples who desire a blend of romantic luxury, private adventures, and premium relaxation.
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
        <RouteMap stops={stops} title="Romantic Singapore Route Map" />
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

      <StickyCTA packageName="Singapore Honeymoon Retreat" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default SingaporeHoneymoon
