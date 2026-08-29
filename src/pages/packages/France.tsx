import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
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
import { ItineraryAccordion } from "@/components/shared/ItineraryAccordion"
import { HotelList } from "@/components/shared/HotelList"
import { InclusionsExclusions } from "@/components/shared/InclusionsExclusions"
import { BookingFormWrapper } from "@/components/shared/BookingFormWrapper"
import { AttractionCard } from "@/components/packages/AttractionCard"
import { reviewService, GoogleReview } from "@/services/reviewService"

const FranceHub: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-france", 175000).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('France', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const attractions = [
    { title: "Eiffel Tower", description: "The iconic iron lattice tower located on Champ de Mars, Paris, defining the city's skyline.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600", distance: "Paris", highlights: ["VIP Summit Access", "Seine River views", "Champ de Mars photos"] },
    { title: "Nice & French Riviera", description: "Vibrant beachside city featuring Mediterranean coast views, Promenade des Anglais, and historic streets.", image: "https://images.unsplash.com/photo-1491557342268-8c0e290f9c2d?q=80&w=600", distance: "Riviera Coast", highlights: ["Promenade walk", "Historic Town tour", "Private Yacht charter"] }
  ]

  const days = [
    { day: 1, title: "Arrival in Paris & Seine River Cruise", description: "Land at Paris CDG Airport. Transfer to your boutique hotel. Enjoy an evening cruise down the Seine river.", highlights: ["CDG Airport transfer", "Seine Cruise", "Eiffel Tower light show"] },
    { day: 2, title: "Eiffel Tower Summit & Louvre Museum", description: "Skip the long lines at the Eiffel Tower. Ascend to the summit. Spend your afternoon exploring artwork in the Louvre.", highlights: ["Louvre VIP entry", "Eiffel Summit pass", "Tuileries Gardens"] },
    { day: 3, title: "Palace of Versailles Excursion", description: "Take a private guided day tour of the majestic Palace of Versailles and stroll its fountains and gardens.", highlights: ["Hall of Mirrors", "Versailles gardens", "Private guide"] },
    { day: 4, title: "Paris to Nice Riviera TGV transfer", description: "Board the high-speed TGV train crossing scenic French countryside to Nice. Enjoy the afternoon on the Promenade.", highlights: ["TGV High-speed Train", "Nice Riviera check-in", "Sunset beach walks"] },
    { day: 5, title: "Nice Departure", description: "Transfer to Nice Cote d'Azur airport for your return flight home.", highlights: ["Nice airport departure"] }
  ]

  const hotels = [
    { name: "Hôtel Regina Nice", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Nice Riviera", amenities: ["Spa", "Sea View", "Private Beach Access"], priceFrom: "₹22,000" }
  ]

  const inclusions = [
    "TGV High-speed 2nd Class train tickets",
    "Lodging in standard deluxe 4-star hotels with breakfast",
    "Versailles, Eiffel, and Louvre admission tickets",
    "Schengen visa advise checklist assistance"
  ]

  const exclusions = [
    "Flights and visa costs",
    "Meals outside hotel breakfast schedules",
    "Tipping fees for drivers"
  ]

  const faqs = [
    { id: "fr-faq-1", question: "Is the Louvre museum ticket pre-booked?", answer: "Yes, timed-entry slots are pre-secured to bypass the ticketing queue." }
  ]

  return (
    <Layout>
      <SEO 
        title="France Luxury Vacation Packages | GhumoFiroo Travels"
        description="Book your premium tour to France. Experience Paris, Nice Riviera, Versailles Palace, and high-speed TGV rail."
        canonicalUrl={config.baseUrl + "/packages/europe-france"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200" alt="France Paris" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium Schengen Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            France
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Discover the romantic trails of Paris, Nice, and Versailles.
          </p>
          <Button variant="luxury" size="lg" className="px-8 shadow-luxury-md py-6 text-sm" onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}>
            Book This Tour
          </Button>
        </div>
      </ScrollReveal>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-border/40 pb-12">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-display font-bold text-primary dark:text-foreground">Country Overview</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              Explore Parisian architecture, TGV transits, and Mediterranean beach luxury at Nice.
            </p>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Capital:</span> <span className="font-bold">Paris</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Currency:</span> <span className="font-bold">Euro (EUR)</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-[#C9A25A]">Schengen</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Top Cities" title="France Highlights" className="mx-auto mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {attractions.map((att, idx) => (
            <AttractionCard key={idx} {...att} />
          ))}
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <SectionHeading kicker="Suggested Route" title="Sample 5-Day Timeline" className="mx-auto mb-12" />
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

      <section className="py-20 container mx-auto px-6 max-w-5xl border-t border-border/40">
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground mb-4">Multi-Country Tours featuring France</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-switzerland-paris")}>Switzerland & Paris</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-france-switzerland")}>France & Switzerland</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-highlights")}>Europe Highlights</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-swiss-italy-france")}>Swiss, Italy & France</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-grand-tour")}>Grand Europe</Button>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl border-t border-border/40">
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground">Schengen Visa Advisories</h3>
        <p className="text-xs text-muted-foreground pt-2">France requires standard Schengen documents. Learn more details on our <Link to="/packages/europe" className="text-[#C9A25A] hover:underline font-semibold">Europe Hub visa guide</Link>.</p>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section id="booking-section" className="py-20 container mx-auto px-6">
        <BookingFormWrapper onSubmit={(data) => console.log(data)} />
      </section>

      <StickyCTA packageName="France Luxury Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default FranceHub
