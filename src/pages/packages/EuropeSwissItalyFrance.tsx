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

const EuropeSwissItalyFrance: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-swiss-italy-france", 245000).toString().replace(/[^0-9]/g, ""))

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
    { name: "Switzerland", days: "Days 1–3", cities: ["Zurich", "Interlaken"] },
    { name: "Italy", days: "Days 4–7", cities: ["Milan", "Florence", "Rome"] },
    { name: "France", days: "Days 8–11", cities: ["Nice", "Lyon", "Paris"] }
  ]

  const stops = [
    { label: "Zurich", lat: 47.3769, lng: 8.5417, day: "Day 1", description: "Arrival." },
    { label: "Interlaken", lat: 46.6863, lng: 7.8632, day: "Day 2-3", description: "Alps & lakes." },
    { label: "Milan", lat: 45.4642, lng: 9.1900, day: "Day 4", description: "Duomo cathedral." },
    { label: "Florence", lat: 43.7696, lng: 11.2558, day: "Day 5", description: "Renaissance art." },
    { label: "Rome", lat: 41.9028, lng: 12.4964, day: "Day 6-7", description: "Ancient monuments." },
    { label: "Nice", lat: 43.7102, lng: 7.2620, day: "Day 8-9", description: "Riviera coast." },
    { label: "Paris", lat: 48.8566, lng: 2.3522, day: "Day 10-11", description: "Eiffel & Louvre." }
  ]

  const days = [
    { day: 1, title: "Arrival in Zurich & Transfer to Interlaken", description: "Land at Zurich Airport. Board the Swiss Federal Railway train to Interlaken. Check into hotel.", highlights: ["Zurich Airport rail connection", "Interlaken resort check-in"] },
    { day: 2, title: "Jungfraujoch - Top of Europe", description: "Ascend by cogwheel train to the top of Europe at 11,300 feet.", highlights: ["Jungfraujoch cogwheel pass", "Ice Palace stroll"] },
    { day: 3, title: "Interlaken Valley Walks", description: "Explore the beautiful waterfalls valley and traditional chalet villages.", highlights: ["Waterfalls walk", "Traditional Swiss dinner"] },
    { day: 4, title: "Interlaken to Milan crossing", description: "Board the trans-Alpine train crossing borders into Milan. Visit the gothic Duomo.", highlights: ["Alps crossing train", "Milan Duomo entrance"] },
    { day: 5, title: "Milan to Florence Rail & City tour", description: "Frecciarossa train to Florence. Visit the Duomo and Ponte Vecchio.", highlights: ["Frecciarossa Train ride", "Florence Duomo Cathedral"] },
    { day: 6, title: "Florence to Rome Frecciarossa & Colosseum", description: "Rail to Rome. Spend the afternoon touring the Colosseum arena floor.", highlights: ["Colosseum Arena VIP", "Trevi Fountain evening walk"] },
    { day: 7, title: "Vatican Museums & Sistine Chapel", description: "Skip the lines at Vatican Museums. View Michelangelo's ceiling frescoes inside the Sistine Chapel.", highlights: ["Vatican timed entry", "Sistine Chapel ceiling"] },
    { day: 8, title: "Rome to Nice Riviera flight/rail", description: "Travel to Nice Riviera. Enjoy sunset walks along the Promenade des Anglais.", highlights: ["Nice Riviera arrival", "Sunset beach walks"] },
    { day: 9, title: "Monaco Day excursion", description: "Enjoy a private guided day tour to Monaco, visiting the Prince's Palace and Casino.", highlights: ["Monaco guided tour", "Casino entry"] },
    { day: 10, title: "Nice to Paris TGV High-Speed Rail", description: "TGV to Paris. Evening cruise down the Seine river.", highlights: ["TGV High-Speed Rail", "Seine River cruise"] },
    { day: 11, title: "Paris Highlights & Departure", description: "Louvre Museum guide and Eiffel Tower timed entry. Transfer to CDG airport for departure.", highlights: ["Eiffel Tower entry", "Louvre Museum timed entry", "Airport transfer"] }
  ]

  const hotels = [
    { name: "Victoria Jungfrau Grand Hotel", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", starRating: 5, location: "Interlaken", amenities: ["Spa", "Pool", "Alps Views"], priceFrom: "₹25,000" },
    { name: "Sina Bernini Bristol Rome", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600", starRating: 5, location: "Rome Center", amenities: ["Roof Dining", "Spa", "Central Location"], priceFrom: "₹26,000" },
    { name: "Hôtel Regina Paris", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Paris Center", amenities: ["Spa", "Michelin Dining", "Garden View"], priceFrom: "₹28,000" }
  ]

  const inclusions = [
    "Eurail Pass and high-speed train tickets",
    "Lodging in premium 4-star/5-star hotels with breakfast",
    "Jungfraujoch, Colosseum, Vatican, and Eiffel admission tickets",
    "Schengen visa advise checklist assistance"
  ]

  const exclusions = [
    "Flights and visa costs",
    "Meals outside hotel breakfast schedules",
    "Tipping fees for drivers"
  ]

  const excursions = [
    { title: "Versailles Palace Day Excursion", price: "₹8,500 per person", desc: "Private half-day guided tour of the Palace of Versailles including Hall of Mirrors and grand gardens." }
  ]

  const faqs = [
    { id: "sif-faq-1", question: "How do we handle transits between countries?", answer: "We coordinate all international high-speed train reservations and private ground vehicles." }
  ]

  return (
    <Layout>
      <SEO 
        title="Switzerland, Italy & France Tour | GhumoFiroo Travels"
        description="Book our classic multi-country tour covering Swiss Alps, Italy and France. First-class transits, visa guidance, and boutique hotels."
        canonicalUrl={config.baseUrl + "/packages/europe-swiss-italy-france"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200" alt="Switzerland Italy France" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">11 Days</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Switzerland, Italy & France Tour
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Witness the best of Europe, blending Swiss mountains, Italian art, and Parisian heritage.
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
              This grand trio-destination tour covers top-tier scenic transits and major historical monuments across Switzerland, Italy, and France.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-switzerland")}>Swiss Guide</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-italy")}>Italy Guide</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-france")}>France Guide</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">11 Days / 10 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-emerald-500">Schengen</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Switzerland, Italy & France Route Map" />
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
            <p className="text-xs text-muted-foreground leading-relaxed">May to October is ideal for mild Alpine weather and pleasant walking conditions in Paris.</p>
          </div>
          <div>
            <h4 className="text-sm font-display font-bold text-[#C9A25A] mb-2">Currencies</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Euro (EUR) and Swiss Francs (CHF) are covered.</p>
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

      <StickyCTA packageName="Switzerland, Italy & France Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default EuropeSwissItalyFrance
