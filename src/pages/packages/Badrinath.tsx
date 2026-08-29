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

const BadrinathYatra: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  
  // Read price from package hook
  const price = Number(usePackagePrice("badrinath-yatra", 11500).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Badrinath', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const stops = [
    { label: "Haridwar", lat: 29.9457, lng: 78.1642, day: "Day 1", description: "Start of journey." },
    { label: "Rishikesh", lat: 30.0869, lng: 78.2676, day: "Day 1", description: "Gateway spiritual town." },
    { label: "Joshimath", lat: 30.5500, lng: 79.5600, day: "Day 2", description: "Winter seat of Lord Badrinath." },
    { label: "Badrinath Temple", lat: 30.7433, lng: 79.4938, day: "Day 2-3", description: "Abode of Lord Vishnu." },
    { label: "Mana Village", lat: 30.7725, lng: 79.4950, day: "Day 3", description: "Last Indian village before the Tibet border." }
  ]

  const days = [
    { day: 1, title: "Haridwar to Joshimath / Pipalkoti", description: "Depart Haridwar early. Scenic drive along Alaknanda River confluences including Devprayag, Rudraprayag, and Karnaprayag. Check into hotel in Pipalkoti/Joshimath.", highlights: ["Alaknanda River Views", "Panch Prayag stops", "Pipalkoti Stay"] },
    { day: 2, title: "Joshimath to Badrinath Dham", description: "Proceed to Badrinath Temple. Check into your hotel. Take a holy dip in the natural hot springs of Tapt Kund before taking part in evening darshan.", highlights: ["Badrinath Temple Darshan", "Tapt Kund Bath", "Special Vishnu Puja"] },
    { day: 3, title: "Mana Village Excursion & Return to Pipalkoti", description: "Explore the historical Mana Village. Visit Vyas Gufa, Ganesh Gufa, and the unique Bhim Pul natural stone bridge. Return drive to Pipalkoti/Joshimath.", highlights: ["Mana Village tour", "Vyas Gufa visit", "Bhim Pul stone bridge"] },
    { day: 4, title: "Pipalkoti to Haridwar Return", description: "Drive back along the Ganges valley, passing through Rishikesh. Stop to explore the local spiritual markets before drop-off at Haridwar.", highlights: ["Rishikesh markets", "Haridwar departure"] }
  ]

  const hotels = [
    { name: "Sarovar Portico Badrinath", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", starRating: 4, location: "Badrinath", amenities: ["Heaters", "Vegetarian Food", "Parking"], priceFrom: "₹7,500" }
  ]

  const inclusions = [
    "AC SUV ground transfers from Haridwar/Rishikesh",
    "Stays in premium deluxe hotels",
    "VIP Darshan slip coordination at Badrinath temple",
    "Biometric registration permits",
    "Local guide support and first-aid kits"
  ]

  const exclusions = [
    "Lunch or personal snacks",
    "Personal items (laundry, phone calls, tips)",
    "Pony or Palki fares",
    "GST"
  ]

  const faqs = [
    { id: "b-faq-1", question: "Is Badrinath directly accessible by road?", answer: "Yes, unlike Kedarnath, Badrinath Dham is fully connected by smooth asphalt mountain roads, meaning no trekking is required." },
    { id: "b-faq-2", question: "What is the historical significance of Vyas Gufa in Mana?", answer: "Vyas Gufa is the ancient cave where Maharishi Vyas is believed to have composed the Mahabharata epic with Lord Ganesha." }
  ]

  return (
    <Layout>
      <SEO 
        title="Badrinath Ek Dham Yatra Bespoke Tour | GhumoFiroo Travels"
        description="Book your holy yatra to Badrinath. Premium road journeys with VIP Darshan, hot springs dip, and Mana Village excursions."
        canonicalUrl={config.baseUrl + "/packages/badrinath-yatra"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="/Badrinath.png" alt="Badrinath Yatra" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Sacred Himalayan Pilgrimage</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Badrinath Yatra
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Visit Lord Vishnu's sacred mountain abode.
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
              This Ek Dham yatra is dedicated entirely to Badrinath Temple. Located at 10,170 feet along the Alaknanda River, this Vishnu shrine is one of the crucial Char Dham nodes. The tour includes scenic drives along river confluences and visits to the historical border village of Mana.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/char-dham")}>Char Dham Hub</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/do-dham-yatra")}>Do Dham Hub</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/kedarnath-yatra")}>Kedarnath Yatra</Button>
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
        <RouteMap stops={stops} title="Badrinath Route Map" />
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

      <StickyCTA packageName="Badrinath Ek Dham Yatra" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default BadrinathYatra
