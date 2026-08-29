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

const SingaporeMalaysiaCombo: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("singapore-malaysia-combo", 115000).toString().replace(/[^0-9]/g, ""))

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
    { label: "Singapore City", lat: 1.2868, lng: 103.8545, day: "Day 1-3", description: "Gardens and Sentosa." },
    { label: "Kuala Lumpur City", lat: 3.1390, lng: 101.6869, day: "Day 4-5", description: "Petronas Twin Towers." },
    { label: "KLIA Departure", lat: 2.7456, lng: 101.7072, day: "Day 6", description: "Return flight departure." }
  ]

  const days = [
    { day: 1, title: "Arrival in Singapore", description: "Land at Singapore. Meet private driver and transfer to hotel. Rest of day at leisure.", highlights: ["Private transfer", "Central lodging"] },
    { day: 2, title: "Singapore City & Gardens by the Bay", description: "Full-day city tour covering Merlion Park, Little India and entrance to Gardens by the Bay.", highlights: ["Gardens by the Bay", "Merlion Park", "Chinatown"] },
    { day: 3, title: "Sentosa Island Day Tour", description: "Ride the cable cars to Sentosa. Visit S.E.A. Aquarium and Siloso Beach.", highlights: ["Cable Car pass", "S.E.A. Aquarium"] },
    { day: 4, title: "Singapore to Kuala Lumpur", description: "Check out. Private land transfer crossing the border to Kuala Lumpur, Malaysia. Check into your hotel.", highlights: ["Private land transfer", "Border crossing", "KL Hotel stay"] },
    { day: 5, title: "Kuala Lumpur City Tour & Batu Caves", description: "Visit the Petronas Twin Towers and climb the rainbow stairs at Batu Caves Temple.", highlights: ["Petronas Twin Towers", "Batu Caves climb"] },
    { day: 6, title: "KLIA Departure", description: "Transfer to Kuala Lumpur International Airport for your return flight home.", highlights: ["KLIA airport drop-off"] }
  ]

  const hotels = [
    { name: "JW Marriott Kuala Lumpur", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Bukit Bintang", amenities: ["Spa", "Pool", "Central shopping location"], priceFrom: "₹11,000" }
  ]

  const inclusions = [
    "AC SUV private ground transfers throughout",
    "Lodging in standard deluxe hotels with breakfast",
    "Visa assistance documents",
    "Theme park admissions tickets"
  ]

  const exclusions = [
    "International flights and visa fees",
    "Tipping fees for guides",
    "Lunches and dinners"
  ]

  const faqs = [
    { id: "sgm-faq-1", question: "How do we cross the border?", answer: "Our private vehicle will drive you directly through the Tuas/Woodlands checkpoint. You do not need to walk with luggage." }
  ]

  return (
    <Layout>
      <SEO 
        title="Singapore + Malaysia Heritage Yatra | GhumoFiroo Travels"
        description="Book our classic dual-country vacation package covering Singapore and Kuala Lumpur. Private border transfers."
        canonicalUrl={config.baseUrl + "/packages/singapore-malaysia-combo"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200" alt="Singapore Malaysia" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium International Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Singapore & Malaysia Combo
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Abode of Gardens by the Bay and Petronas Twin Towers.
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
              This backup template route covers the classic twin country tour, transferring you directly from Singapore through Johor border into Kuala Lumpur.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/singapore")}>Singapore Hub</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">6 Days / 5 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Difficulty:</span> <span className="font-bold text-emerald-500">Easy</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Singapore to Malaysia Route Map" />
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

      <StickyCTA packageName="Singapore + Malaysia Combo" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default SingaporeMalaysiaCombo
