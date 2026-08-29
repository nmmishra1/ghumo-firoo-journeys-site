import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import Layout from "@/components/Layout"
import SEO from "@/components/SEO"
import { config } from "@/config"
import { usePackagePrice } from "@/hooks/usePackagePrice"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import ScrollReveal from "@/components/ui/ScrollReveal"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { FAQAccordion } from "@/components/ui/FAQAccordion"
import { StickyCTA } from "@/components/common/StickyCTA"
import { RouteMap } from "@/components/shared/RouteMap"
import { ItineraryAccordion } from "@/components/shared/ItineraryAccordion"
import { HotelList } from "@/components/shared/HotelList"
import { InclusionsExclusions } from "@/components/shared/InclusionsExclusions"
import { BookingFormWrapper } from "@/components/shared/BookingFormWrapper"
import { CountryTimeline } from "@/components/shared/CountryTimeline"
import { reviewService, GoogleReview } from "@/services/reviewService"

const EuropeSwitzerlandItaly: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-switzerland-italy", 205000).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Europe', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const timelineCountries = [
    { name: "Switzerland", days: "Days 1–4", cities: ["Zurich", "Lucerne", "Interlaken"] },
    { name: "Italy", days: "Days 5–9", cities: ["Milan", "Florence", "Rome"] }
  ]

  const stops = [
    { label: "Zurich", lat: 47.3769, lng: 8.5417, day: "Day 1", description: "Arrival." },
    { label: "Lucerne", lat: 47.0502, lng: 8.3093, day: "Day 2", description: "Chapel bridge walks." },
    { label: "Interlaken", lat: 46.6863, lng: 7.8632, day: "Day 3-4", description: "Alpine peaks & valleys." },
    { label: "Milan", lat: 45.4642, lng: 9.1900, day: "Day 5", description: "Duomo & fashion." },
    { label: "Florence", lat: 43.7696, lng: 11.2558, day: "Day 6-7", description: "Renaissance art center." },
    { label: "Rome", lat: 41.9028, lng: 12.4964, day: "Day 8-9", description: "Ancient Colosseum & Vatican." }
  ]

  const days = [
    { day: 1, title: "Arrival in Zurich & Transfer to Lucerne", description: "Land at Zurich Airport. Board the Swiss Federal Railway train to Lucerne. Walk across Chapel Bridge.", highlights: ["Chapel Bridge walks", "Scenic train ride"] },
    { day: 2, title: "Mount Titlis Rotair excursion", description: "Take the world's first rotating cable car up Mount Titlis. Walk across the suspension bridge.", highlights: ["Titlis Rotair Cable car", "Glacier suspension bridge"] },
    { day: 3, title: "Interlaken GoldenPass transfer", description: "Travel to Interlaken via the scenic GoldenPass Express railway crossing mountain passes.", highlights: ["GoldenPass Scenic Train", "Alps views"] },
    { day: 4, title: "Jungfraujoch - Top of Europe", description: "Board the cogwheel train ascending to the highest railway station in Europe.", highlights: ["Jungfraujoch cogwheel pass", "Ice Palace stroll"] },
    { day: 5, title: "Interlaken to Milan crossing", description: "Board the scenic trans-Alpine train crossing borders into Milan. Visit the gothic Duomo in the afternoon.", highlights: ["Alps crossing train", "Milan Duomo entry"] },
    { day: 6, title: "Milan to Florence Frecciarossa Rail", description: "Board the Frecciarossa train to Florence. Visit the Duomo and Ponte Vecchio.", highlights: ["Frecciarossa Train ride", "Florence Duomo Cathedral"] },
    { day: 7, title: "Uffizi Gallery VIP tour", description: "Enjoy a private guided tour of the Renaissance masterpieces at the Uffizi Gallery.", highlights: ["Uffizi skip-line entry", "Private art guide"] },
    { day: 8, title: "Florence to Rome Frecciarossa & Colosseum", description: "Rail to Rome. Spend the afternoon touring the ancient arena floor of the Colosseum.", highlights: ["Rome rail connection", "Colosseum Arena VIP"] },
    { day: 9, title: "Rome Vatican tour & Departure", description: "Enjoy a morning tour of the Vatican Museums and Sistine Chapel. Transfer to FCO airport for departure.", highlights: ["Vatican Museums timed entry", "FCO Airport transfer"] }
  ]

  const hotels = [
    { name: "Grand Hotel National Lucerne", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", starRating: 5, location: "Lucerne Lakefront", amenities: ["Spa", "Pool", "Alps Views"], priceFrom: "₹24,000" },
    { name: "Sina Bernini Bristol Rome", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600", starRating: 5, location: "Rome Center", amenities: ["Roof Dining", "Spa", "Central Location"], priceFrom: "₹26,000" }
  ]

  const inclusions = [
    "Swiss Travel Pass and Frecciarossa train tickets",
    "Lodging in premium 4-star/5-star hotels with breakfast",
    "Jungfraujoch, Titlis, Colosseum, and Vatican admission tickets",
    "Schengen visa advise checklist assistance"
  ]

  const exclusions = [
    "Flights and visa fees",
    "Meals outside hotel breakfast schedules",
    "Tipping fees for drivers"
  ]

  const excursions = [
    { title: "Venice Gondola Day Tour", price: "₹10,500 per person", desc: "Private high-speed rail day trip from Florence to Venice including gondola ride and guide." }
  ]

  const faqs = [
    { id: "swi-faq-1", question: "How do we cross the border between Switzerland and Italy?", answer: "Our packages feature scenic trans-Alpine rail crossings which are comfortable and require no manual visa clearance halts." }
  ]

  return (
    <Layout>
      <SEO 
        title="Switzerland & Italy Tour | GhumoFiroo Travels"
        description="Book our classic multi-country tour covering Swiss Alps and historical Italy. First-class rail, visa guidance, and boutique hotels."
        canonicalUrl={config.baseUrl + "/packages/europe-switzerland-italy"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1529260818874-1f450e2e5e86?q=80&w=1200" alt="Switzerland Italy" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">9 Days</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Switzerland & Italy Tour
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Combine majestic Swiss Alpine summits with the rich Renaissance heritage of Italy.
          </p>
          <Button variant="luxury" size="lg" className="px-8 shadow-luxury-md py-6 text-sm" onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}>
            Book This Yatra
          </Button>
        </div>
      </ScrollReveal>

      <section className="py-12 bg-slate-50 dark:bg-[#1A2342]/10 border-b border-border/50">
        <div className="container mx-auto px-6">
          <CountryTimeline countries={timelineCountries} title="Tour Route Progression" />
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-border/40 pb-12">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-display font-bold text-primary dark:text-foreground">Journey Overview</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              This iconic twin-destination tour covers top-tier scenic transits and major historical monuments in Switzerland and Italy.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-switzerland")}>Swiss Guide</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-italy")}>Italy Guide</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">9 Days / 8 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-emerald-500">Schengen</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Switzerland & Italy Route Map" />
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

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Add-ons" title="Optional Excursions" className="mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {excursions.map((exc, idx) => (
            <Card key={idx} variant="luxury" className="p-6 space-y-4">
              <h4 className="text-lg font-display font-bold text-primary dark:text-foreground">{exc.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{exc.desc}</p>
              <div className="text-sm font-semibold text-[#C9A25A]">{exc.price}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm font-display font-bold text-[#C9A25A] mb-2">Schengen Visa</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Required for Indian citizens. Learn more on our <Link to="/packages/europe" className="text-[#C9A25A] hover:underline">Schengen Visa Guide</Link>.</p>
          </div>
          <div>
            <h4 className="text-sm font-display font-bold text-[#C9A25A] mb-2">Best Season</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">May to October is ideal for mild weather in both Swiss mountains and historic Italy.</p>
          </div>
          <div>
            <h4 className="text-sm font-display font-bold text-[#C9A25A] mb-2">Currencies</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Switzerland uses Swiss Francs (CHF) and Italy uses Euro (EUR).</p>
          </div>
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

      <StickyCTA packageName="Switzerland & Italy Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default EuropeSwitzerlandItaly
