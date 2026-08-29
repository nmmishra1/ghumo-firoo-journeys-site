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

const SingaporeCruise: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("singapore-cruise", 145000).toString().replace(/[^0-9]/g, ""))

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
    { label: "Singapore City Stay", lat: 1.2868, lng: 103.8545, day: "Day 1-3", description: "Urban tours." },
    { label: "Marina Bay Cruise Centre", lat: 1.2680, lng: 103.8600, day: "Day 4", description: "Embark on Genting Dream cruise." },
    { label: "Malacca / Penang Strait", lat: 2.1896, lng: 102.2501, day: "Day 5-6", description: "Cruising along Malacca Straits." },
    { label: "Singapore Harbour Return", lat: 1.2680, lng: 103.8600, day: "Day 7", description: "Disembark and airport drop-off." }
  ]

  const days = [
    { day: 1, title: "Arrival & Marina Bay Sightseeing", description: "Land at Singapore. Private SUV transfer to your hotel. Evening at leisure near Marina Bay Sands.", highlights: ["Airport welcome", "Central hotel lodging"] },
    { day: 2, title: "Gardens by the Bay & Merlion Tour", description: "Excursion to Cloud Forest and Merlion Park. Spend your evening exploring Chinatown local hawker stalls.", highlights: ["Gardens by the Bay", "Merlion photo stop", "Chinatown hawkers"] },
    { day: 3, title: "Sentosa cable car & City exploration", description: "Take the cable car to Sentosa. Visit S.E.A. Aquarium. Enjoy shopping at Orchard Road in the evening.", highlights: ["Cable Car ride", "S.E.A. Aquarium", "Orchard shopping"] },
    { day: 4, title: "Embarkation on Genting Dream Cruise", description: "After checkout, transfer to Marina Bay Cruise Centre. Board the majestic Genting Dream cruise liner. Set sail in the evening.", highlights: ["Boarding cruise", "Luxury Balcony cabin check-in", "Sunset sailing aarti"] },
    { day: 5, title: "At Sea / Malacca Straits Shore Excursion", description: "Enjoy cruise amenities, theater shows, water parks, casino gaming, and international veg cuisines.", highlights: ["Cruise activities", "Waterpark access", "Shore excursion"] },
    { day: 6, title: "At Sea / High Seas Entertainment", description: "Relax by the pool deck, participate in trivia games, or dine at premium restaurants on board.", highlights: ["Balcony views", "Dolphin spotting", "Dala show entries"] },
    { day: 7, title: "Disembarkation & Changi Departure", description: "Arrive back in Singapore. Disembark from the cruise. Private transfer directly to Changi airport for your return flight.", highlights: ["Disembarkation transfer", "Changi departure"] }
  ]

  const hotels = [
    { name: "Resorts World Sentosa", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Sentosa", amenities: ["Spa", "Private pools", "Bespoke service"], priceFrom: "₹22,000" }
  ]

  const inclusions = [
    "AC SUV private transfers throughout",
    "3 nights stays in 5-star hotel + 3 nights luxury Genting Cruise cabin",
    "All cruise meals and onboard entertainment tickets",
    "EZ-Link card and cable car passes"
  ]

  const exclusions = [
    "International flights and cruise port port taxes",
    "Visa processing fees",
    "Personal guide tips and dining on land"
  ]

  const faqs = [
    { id: "sgc-faq-1", question: "Are Indian meals served on Genting Dream Cruise?", answer: "Yes, the cruise features dedicated halal-certified and pure Indian vegetarian/Jain buffet sections." }
  ]

  return (
    <Layout>
      <SEO 
        title="Singapore + Cruise Tour Package | GhumoFiroo Travels"
        description="Book our deluxe Singapore land tour coupled with a 3 Nights luxury cruise. All transfers, cruise bookings, and sightseeing managed."
        canonicalUrl={config.baseUrl + "/packages/singapore-cruise"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200" alt="Singapore Cruise" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium International Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Singapore + Cruise Package
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Unforgettable vacation combining city stays and deep-sea cruise adventures.
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
              This package integrates Singapore city exploration with a 3-night luxury cruise departing to Penang or Malacca. Enjoy five-star dining on board.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/singapore")}>Singapore Hub</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">7 Days / 6 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Difficulty:</span> <span className="font-bold text-emerald-500">Easy</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Singapore Land & Sea Route Map" />
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

      <StickyCTA packageName="Singapore + Cruise Package" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default SingaporeCruise
