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

const SwitzerlandHub: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-switzerland", 185000).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Switzerland', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const attractions = [
    { title: "Interlaken Valley", description: "Nestled between Lake Thun and Lake Brienz, surrounded by peaks of Eiger, Monch, and Jungfrau.", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=600", distance: "Bernese Oberland", highlights: ["Lake Cruises", "Paragliding", "Panoramic Trails"] },
    { title: "Zermatt & Matterhorn", description: "Car-free mountain resort village featuring the iconic pyramid-shaped Matterhorn peak views.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600", distance: "Valais Alps", highlights: ["Matterhorn Glacier Paradise", "Skiing", "Gornergrat Railway"] }
  ]

  const days = [
    { day: 1, title: "Arrival in Zurich & Transfer to Lucerne", description: "Arrive at Zurich. Board the scenic Swiss Federal Railway train directly to Lucerne. Walk across the Chapel Bridge.", highlights: ["Chapel Bridge walk", "Scenic train ride", "Lucerne lake views"] },
    { day: 2, title: "Mount Titlis Rotair excursion", description: "Take the world's first rotating cable car (Rotair) up Mount Titlis. Walk across the Titlis Cliff Bridge.", highlights: ["Titlis Rotair Cable car", "Glacier Cave tour", "Cliff walk suspension bridge"] },
    { day: 3, title: "Interlaken scenic transfer", description: "Board the GoldenPass express train from Lucerne to Interlaken, traversing scenic mountain passes.", highlights: ["GoldenPass Scenic Train", "Brienz Lake options", "Interlaken resort stay"] },
    { day: 4, title: "Jungfraujoch - Top of Europe", description: "Board the cogwheel railway ascending through the Eiger rock to the highest railway station in Europe at 11,300 feet.", highlights: ["Cogwheel Railway ascend", "Ice Palace stroll", "Sphinx Observation terrace"] },
    { day: 5, title: "Departure", description: "Transfer back to Zurich airport via train for your return flight home.", highlights: ["Zurich airport transfer"] }
  ]

  const hotels = [
    { name: "Grand Hotel National Lucerne", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", starRating: 5, location: "Lucerne Lakefront", amenities: ["Spa", "Pool", "Michelin Dining"], priceFrom: "₹24,000" }
  ]

  const inclusions = [
    "Swiss Travel Pass (Consecutive 2nd Class tickets)",
    "Lodging in standard deluxe 4-star hotels with breakfast",
    "Titlis and Jungfraujoch mountain excursions passes",
    "Schengen visa documents advice checklist"
  ]

  const exclusions = [
    "International flights and visa fees",
    "Lunches and dinners on land",
    "Tipping fees for local guides"
  ]

  const faqs = [
    { id: "ch-faq-1", question: "Is the Swiss Travel Pass included?", answer: "Yes, the consecutive 4-day pass is fully integrated to cover all public trains, buses, and boats." }
  ]

  return (
    <Layout>
      <SEO 
        title="Switzerland Luxury Vacation Packages | GhumoFiroo Travels"
        description="Book your premium tour to Switzerland. Experience Titlis Rotair, Jungfraujoch, scenic train passes, and luxury lake resorts."
        canonicalUrl={config.baseUrl + "/packages/europe-switzerland"}
      />

      {/* Hero */}
      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200" alt="Switzerland Alps" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium Schengen Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Switzerland
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Witness the epic beauty of Interlaken, Lucerne, and Zermatt.
          </p>
          <Button variant="luxury" size="lg" className="px-8 shadow-luxury-md py-6 text-sm" onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}>
            Book This Tour
          </Button>
        </div>
      </ScrollReveal>

      {/* Overview */}
      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-border/40 pb-12">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-display font-bold text-primary dark:text-foreground">Country Overview</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              Explore the heart of the Alps. Stays in Lucerne, train transits across glaciers, and VIP ascents to Jungfraujoch.
            </p>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Capital:</span> <span className="font-bold">Bern</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Currency:</span> <span className="font-bold">Swiss Franc (CHF)</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-[#C9A25A]">Schengen</span></div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Top Cities" title="Switzerland Highlights" className="mx-auto mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {attractions.map((att, idx) => (
            <AttractionCard key={idx} {...att} />
          ))}
        </div>
      </section>

      {/* Itinerary */}
      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <SectionHeading kicker="Suggested Travel Route" title="Sample 5-Day Timeline" className="mx-auto mb-12" />
          <ItineraryAccordion days={days} />
        </div>
      </section>

      {/* Hotels */}
      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Bespoke Stays" title="Luxurious Lodging Selection" className="mx-auto mb-12" />
        <HotelList hotels={hotels} />
      </section>

      {/* Inclusions */}
      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <InclusionsExclusions inclusions={inclusions} exclusions={exclusions} />
        </div>
      </section>

      {/* Visa */}
      <section className="py-20 container mx-auto px-6 max-w-5xl border-t border-border/40">
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground mb-4">Multi-Country Tours featuring Switzerland</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-switzerland-paris")}>Switzerland & Paris</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-switzerland-italy")}>Switzerland & Italy</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-france-switzerland")}>France & Switzerland</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-highlights")}>Europe Highlights</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-swiss-italy-france")}>Swiss, Italy & France</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-grand-tour")}>Grand Europe</Button>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl border-t border-border/40">
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground">Schengen Visa Advisories</h3>
        <p className="text-xs text-muted-foreground pt-2">Switzerland requires standard Schengen documentation. Learn more details on our <Link to="/packages/europe" className="text-[#C9A25A] hover:underline font-semibold">Europe Hub visa guide</Link>.</p>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* Booking */}
      <section id="booking-section" className="py-20 container mx-auto px-6">
        <BookingFormWrapper onSubmit={(data) => console.log(data)} />
      </section>

      <StickyCTA packageName="Switzerland Luxury Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default SwitzerlandHub
