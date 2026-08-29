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

const EuropeHighlights: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-highlights", 285000).toString().replace(/[^0-9]/g, ""))

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
    { name: "France", days: "Days 1–3", cities: ["Paris"] },
    { name: "Belgium", days: "Day 4", cities: ["Brussels", "Bruges"] },
    { name: "Netherlands", days: "Days 5–6", cities: ["Amsterdam"] },
    { name: "Germany", days: "Days 7–8", cities: ["Frankfurt", "Cologne"] },
    { name: "Switzerland", days: "Days 9–10", cities: ["Zurich", "Interlaken"] },
    { name: "Italy", days: "Days 11–12", cities: ["Milan", "Rome"] }
  ]

  const stops = [
    { label: "Paris", lat: 48.8566, lng: 2.3522, day: "Day 1-3", description: "Eiffel & Louvre." },
    { label: "Brussels", lat: 50.8503, lng: 4.3517, day: "Day 4", description: "Gothic Grand Place." },
    { label: "Amsterdam", lat: 52.3676, lng: 4.9041, day: "Day 5-6", description: "Canals & windmill visits." },
    { label: "Frankfurt", lat: 50.1109, lng: 8.6821, day: "Day 7-8", description: "River landscapes." },
    { label: "Zurich", lat: 47.3769, lng: 8.5417, day: "Day 9-10", description: "Alpine rail gateways." },
    { label: "Milan", lat: 45.4642, lng: 9.1900, day: "Day 11", description: "Gothic Duomo." },
    { label: "Rome", lat: 41.9028, lng: 12.4964, day: "Day 12", description: "Colosseum historical tour." }
  ]

  const days = [
    { day: 1, title: "Arrival in Paris", description: "Land at Paris CDG. Private transfer to your hotel. Seine River dinner cruise in the evening.", highlights: ["Airport Mercedes transfer", "Seine Dinner Cruise"] },
    { day: 2, title: "Eiffel Tower & Louvre Museum", description: "Timed-entry summit tickets for Eiffel Tower and skip-the-line entrance to the Louvre.", highlights: ["Eiffel Tower Summit pass", "Louvre Museum guide"] },
    { day: 3, title: "Palace of Versailles guided tour", description: "Take a half-day private guided tour of the Palace of Versailles.", highlights: ["Versailles entry", "Hall of Mirrors guide"] },
    { day: 4, title: "Paris to Brussels & Bruges tour", description: "TGV to Brussels. Drive to the medieval city of Bruges for a canal tour.", highlights: ["TGV border crossing", "Bruges Canal boat cruise"] },
    { day: 5, title: "Brussels to Amsterdam transfer", description: "Check out. Private road transfer to Amsterdam, visiting Zaanse Schans windmills en-route.", highlights: ["Zaanse Schans tour", "Amsterdam hotel check-in"] },
    { day: 6, title: "Amsterdam Canals & Van Gogh Museum", description: "Private canal boat tour in Amsterdam and admission to the Van Gogh Museum.", highlights: ["Amsterdam canal tour", "Van Gogh Museum entry"] },
    { day: 7, title: "Amsterdam to Frankfurt via Cologne", description: "Board the high-speed ICE train to Frankfurt, stopping to view Cologne Cathedral.", highlights: ["Cologne Cathedral visit", "ICE High-Speed Rail"] },
    { day: 8, title: "Frankfurt River tour", description: "Enjoy a guided historic town walk and Main River cruise.", highlights: ["Main River Cruise", "Frankfurt Old Town walk"] },
    { day: 9, title: "Frankfurt to Zurich Scenic Rail", description: "Travel to Zurich via scenic railways. Enjoy walking along the lake in the evening.", highlights: ["Zurich lake walk", "Scenic trans-border rail"] },
    { day: 10, title: "Jungfraujoch Mountain Excursion", description: "Ascend by cogwheel train to the top of Europe at Jungfraujoch.", highlights: ["Jungfraujoch cogwheel pass", "Ice Palace stroll"] },
    { day: 11, title: "Zurich to Milan rail", description: "Travel to Milan. Visit the gothic Duomo and Galleria Vittorio Emanuele.", highlights: ["Milan Duomo tickets", "Fashion quarters tour"] },
    { day: 12, title: "Milan to Rome Frecciarossa & Departure", description: "Rail to Rome. Guided Colosseum tour and transfer to FCO airport for return flight.", highlights: ["Colosseum Arena VIP", "FCO Airport transfer"] }
  ]

  const hotels = [
    { name: "Hôtel Regina Paris", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Paris Center", amenities: ["Spa", "Michelin Dining", "Garden View"], priceFrom: "₹28,000" }
  ]

  const inclusions = [
    "Eurail First Class pass and high-speed train reservations",
    "Lodging in standard deluxe 4-star hotels with breakfast",
    "Eiffel, Louvre, Jungfraujoch, and Colosseum tickets",
    "Schengen visa documents advice checklist assistance"
  ]

  const exclusions = [
    "Flights and visa costs",
    "Meals outside hotel breakfast schedules",
    "Tipping fees for drivers"
  ]

  const excursions = [
    { title: "Monaco Riviera Day Excursion", price: "₹12,500 per person", desc: "Private day excursion from Nice/Paris to Monaco including casino entry passes." }
  ]

  const faqs = [
    { id: "eh-faq-1", question: "Is the Eurail Pass first class?", answer: "Yes, our packages integrate first-class train bookings for all cross-border transits." }
  ]

  return (
    <Layout>
      <SEO 
        title="Europe Highlights Tour | GhumoFiroo Travels"
        description="Book our classic multi-country tour covering France, Belgium, Netherlands, Germany, Switzerland and Italy. First-class rail and visa guidance."
        canonicalUrl={config.baseUrl + "/packages/europe-highlights"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=1200" alt="Europe Highlights" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <div className="flex gap-2">
            <Badge variant="luxury">12 Days</Badge>
            <Badge variant="luxuryNavy">Best Seller</Badge>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Europe Highlights Tour
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Experience the cultural icons of France, Belgium, Netherlands, Germany, Switzerland and Italy.
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
              Our hallmark highlights package covers the prominent sights of Western and Central Europe under first-class rail transits.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-france")}>France</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-belgium")}>Belgium</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-netherlands")}>Netherlands</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-germany")}>Germany</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-switzerland")}>Switzerland</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-italy")}>Italy</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">12 Days / 11 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-emerald-500">Schengen</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Europe Highlights Route Map" />
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

      <StickyCTA packageName="Europe Highlights Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default EuropeHighlights
