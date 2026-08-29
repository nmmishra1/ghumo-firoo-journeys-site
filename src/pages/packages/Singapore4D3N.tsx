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

const Singapore4D3N: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("singapore-4d-3n", 48000).toString().replace(/[^0-9]/g, ""))

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
    { label: "Changi Airport", lat: 1.3644, lng: 103.9915, day: "Day 1", description: "Arrival at world-class airport." },
    { label: "Marina Bay Hotel", lat: 1.2868, lng: 103.8545, day: "Day 1", description: "Check-in at premium accommodation." },
    { label: "Gardens by the Bay", lat: 1.2816, lng: 103.8636, day: "Day 2", description: "Explore the Cloud Dome and Supertrees." },
    { label: "Sentosa Island", lat: 1.2494, lng: 103.8303, day: "Day 3", description: "Ride the cable cars and explore Siloso beach." },
    { label: "Changi Airport Departure", lat: 1.3644, lng: 103.9915, day: "Day 4", description: "Return flight departure." }
  ]

  const days = [
    { day: 1, title: "Arrival & Night Cruise", description: "Land at Singapore Changi Airport. Transfer to your deluxe hotel. In the evening, embark on a private charter boat cruise along the historic Singapore River.", highlights: ["Changi Airport pickup", "Singapore River Cruise", "Marina Bay Lights"] },
    { day: 2, title: "Gardens by the Bay & Sky Deck", description: "Visit the cloud dome and flower conservatory at Gardens by the Bay. Walk the skyway and ascend to Marina Bay Sands observation deck.", highlights: ["Flower Dome Conservatory", "Supertrees walk", "MBS Sky Deck view"] },
    { day: 3, title: "Sentosa Island Highlights", description: "Take the scenic cable car ride to Sentosa. Visit S.E.A. Aquarium and catch the Wings of Time multimedia show.", highlights: ["Scenic Cable Car ride", "S.E.A. Aquarium entry", "Wings of Time lights"] },
    { day: 4, title: "Departure", description: "Spend your morning shopping on Orchard Road before transfer back to Changi Airport for your return flight.", highlights: ["Orchard Road shopping", "Changi departure"] }
  ]

  const hotels = [
    { name: "Orchard Rendezvous Hotel", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", starRating: 4, location: "Orchard Road", amenities: ["Swimming Pool", "Fitness Center", "High-speed Wi-Fi"], priceFrom: "₹12,500" }
  ]

  const inclusions = [
    "AC SUV private transfers throughout",
    "Lodging in standard 4-star hotels with breakfast",
    "Preloaded EZ-Link public transit cards",
    "Taxes and all admissions fees included"
  ]

  const exclusions = [
    "International flight tickets",
    "Personal guide tips and gratuity",
    "Lunch and dinners",
    "Tipping fees"
  ]

  const faqs = [
    { id: "sg4d-faq-1", question: "Can I add Universal Studios to this package?", answer: "Yes, you can upgrade Sentosa day tickets to include Universal Studios passes upon booking." }
  ]

  return (
    <Layout>
      <SEO 
        title="Singapore Classic Vacation 4D/3N | GhumoFiroo Travels"
        description="Book our classic 4 Days / 3 Nights Singapore holiday package. Private airport transfers, Gardens by the Bay tickets, and Sentosa tours."
        canonicalUrl={config.baseUrl + "/packages/singapore-4d-3n"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200" alt="Singapore 4D3N" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium International Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Singapore Classic 4D/3N
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Perfect short holiday break covering major landmarks.
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
              This short city getaway is perfect for first-timers who want a comfortable tour of the main landmarks of Singapore.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/singapore")}>Singapore Hub</Button>
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
        <RouteMap stops={stops} title="Singapore 4D3N Route Map" />
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

      <StickyCTA packageName="Singapore Classic 4D/3N" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default Singapore4D3N
