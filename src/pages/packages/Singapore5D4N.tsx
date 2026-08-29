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

const Singapore5D4N: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("singapore-5d-4n", 56000).toString().replace(/[^0-9]/g, ""))

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
    { label: "Changi Airport", lat: 1.3644, lng: 103.9915, day: "Day 1", description: "Arrival at Changi." },
    { label: "Gardens by the Bay", lat: 1.2816, lng: 103.8636, day: "Day 2", description: "Excursion to conservatory." },
    { label: "Universal Studios", lat: 1.2540, lng: 103.8238, day: "Day 3", description: "Theme park access." },
    { label: "Night Safari", lat: 1.4043, lng: 103.7930, day: "Day 4", description: "Tours of nocturnal reserves." },
    { label: "Changi Airport Departure", lat: 1.3644, lng: 103.9915, day: "Day 5", description: "Return flight." }
  ]

  const days = [
    { day: 1, title: "Arrival & City Tour", description: "Land at Singapore. Private SUV transfer to your hotel. Afternoon city tour covering Merlion Park, Chinatown, and Little India.", highlights: ["Merlion Park Photo stop", "Chinatown heritage walk", "Little India tour"] },
    { day: 2, title: "Gardens by the Bay & Observation Deck", description: "Explore the giant greenhouses and walkway of the Gardens, and see the Marina Bay skyline from Sands SkyPark.", highlights: ["Cloud Forest Waterfall dome", "Flower Dome", "MBS Sky Deck"] },
    { day: 3, title: "Universal Studios Theme Park", description: "Spend a full day exploring rides, live shows, and character meetups at Universal Studios Singapore.", highlights: ["Full-day passes", "Battlestar Galactica", "Sci-fi City rides"] },
    { day: 4, title: "Sentosa & Night Safari", description: "Visit Sentosa Island beaches in the afternoon. In the evening, transfer to Mandai for the nocturnal Night Safari tram ride.", highlights: ["Siloso Beach leisure", "Night Safari Tram", "Fire Show Performance"] },
    { day: 5, title: "Departure", description: "Morning souvenir shopping at Jewel Changi. Catch your return flight home.", highlights: ["Jewel Changi waterfall", "Return flight drop-off"] }
  ]

  const hotels = [
    { name: "Grand Copthorne Waterfront", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 4, location: "Singapore River", amenities: ["River Views", "Outdoor Pool", "Vegetarian Options"], priceFrom: "₹14,500" }
  ]

  const inclusions = [
    "AC SUV private transfers throughout the trip",
    "Lodging in standard 4-star hotels with breakfast",
    "Preloaded EZ-Link cards for MRT",
    "VIP tickets to Universal Studios and Gardens by the Bay"
  ]

  const exclusions = [
    "International flight tickets",
    "Visa application fees",
    "Tipping fees for drivers",
    "Personal insurance"
  ]

  const faqs = [
    { id: "sg5d-faq-1", question: "Is hotel breakfast included?", answer: "Yes, all our packages include breakfast at selected hotels. Lunches and dinners are open for local food trials." }
  ]

  return (
    <Layout>
      <SEO 
        title="Singapore Deluxe Vacation 5D/4N | GhumoFiroo Travels"
        description="Book our deluxe 5 Days / 4 Nights Singapore package. Universal Studios, Night Safari, and private transfers included."
        canonicalUrl={config.baseUrl + "/packages/singapore-5d-4n"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200" alt="Singapore 5D4N" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium International Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Singapore Deluxe 5D/4N
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Universal Studios, Gardens by the Bay and Night Safari excursion.
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
              This package gives you an extra day to fully explore theme parks and nocturnal zoos.
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
        <RouteMap stops={stops} title="Singapore 5D4N Route Map" />
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

      <StickyCTA packageName="Singapore Deluxe 5D/4N" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default Singapore5D4N
