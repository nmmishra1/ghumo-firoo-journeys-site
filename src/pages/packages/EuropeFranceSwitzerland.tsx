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

const EuropeFranceSwitzerland: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-france-switzerland", 189000).toString().replace(/[^0-9]/g, ""))

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
    { name: "France", days: "Days 1–6", cities: ["Paris", "Lyon", "Nice"] },
    { name: "Switzerland", days: "Days 7–10", cities: ["Geneva", "Interlaken", "Zurich"] }
  ]

  const stops = [
    { label: "Paris", lat: 48.8566, lng: 2.3522, day: "Day 1-2", description: "Arrival." },
    { label: "Lyon", lat: 45.7640, lng: 4.8357, day: "Day 3", description: "Gourmet dining." },
    { label: "Nice", lat: 43.7102, lng: 7.2620, day: "Day 4-5", description: "Riviera coast walks." },
    { label: "Geneva", lat: 46.2044, lng: 6.1432, day: "Day 6-7", description: "Alpine lake shores." },
    { label: "Interlaken", lat: 46.6863, lng: 7.8632, day: "Day 8-9", description: "Glacier peaks." },
    { label: "Zurich", lat: 47.3769, lng: 8.5417, day: "Day 10", description: "Departure." }
  ]

  const days = [
    { day: 1, title: "Arrival in Paris & Seine Cruise", description: "Land at Paris CDG. Private transfer to your boutique hotel. Enjoy an evening cruise down the Seine river.", highlights: ["Seine River cruise", "Eiffel Tower light show"] },
    { day: 2, title: "Louvre Museum & Eiffel Tower Summit", description: "Skip the lines at Eiffel Tower and ascend to the summit. Visit the Louvre museum.", highlights: ["Eiffel Tower Summit", "Louvre skip-line entry"] },
    { day: 3, title: "Paris to Lyon & City Tour", description: "TGV to Lyon. Enjoy a guided walking tour of old Renaissance quarters and gourmet tasting.", highlights: ["Lyon Old Town tour", "Gourmet lunch tasting"] },
    { day: 4, title: "Lyon to Nice Riviera TGV", description: "TGV rail to Nice Riviera. Rest of day at leisure along the beach Promenade.", highlights: ["Nice Riviera TGV", "Sunset beach walk"] },
    { day: 5, title: "Monaco & Monte Carlo Day excursion", description: "Enjoy a private guided day tour to Monaco, visiting the Prince's Palace and Casino.", highlights: ["Monaco guided tour", "Monte Carlo casino"] },
    { day: 6, title: "Nice to Geneva Alpine Rail crossing", description: "Board the Alpine rail crossing borders into Geneva. Walk along Lake Geneva in the evening.", highlights: ["Nice-Geneva rail line", "Jet d'Eau view"] },
    { day: 7, title: "Geneva Old Town & Interlaken transfer", description: "Old town walking tour. Board the GoldenPass train to Interlaken.", highlights: ["Geneva Old Town", "GoldenPass Train ride"] },
    { day: 8, title: "Jungfraujoch - Top of Europe", description: "Ascend by cogwheel train to the top of Europe at 11,300 feet.", highlights: ["Jungfraujoch cogwheel pass", "Ice Palace stroll"] },
    { day: 9, title: "Interlaken Valley walks", description: "Explore the beautiful Lauterbrunnen waterfalls valley and traditional chalets.", highlights: ["Lauterbrunnen waterfalls", "Chalet photo stop"] },
    { day: 10, title: "Zurich transfer & Departure", description: "Transfer to Zurich airport for your return flight home.", highlights: ["Zurich airport transfer"] }
  ]

  const hotels = [
    { name: "Hôtel Regina Paris", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Paris Center", amenities: ["Spa", "Michelin Dining", "Garden View"], priceFrom: "₹28,000" },
    { name: "Victoria Jungfrau Grand Hotel", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", starRating: 5, location: "Interlaken", amenities: ["Spa", "Pool", "Alps Views"], priceFrom: "₹25,000" }
  ]

  const inclusions = [
    "Swiss Travel Pass and TGV train tickets",
    "Lodging in premium 4-star/5-star hotels with breakfast",
    "Jungfraujoch, Eiffel, and Louvre admission tickets",
    "Schengen visa advise checklist assistance"
  ]

  const exclusions = [
    "Flights and visa fees",
    "Meals outside hotel breakfast schedules",
    "Tipping fees for drivers"
  ]

  const excursions = [
    { title: "Versailles Palace Day Excursion", price: "₹8,500 per person", desc: "Private half-day guided tour of the Palace of Versailles including Hall of Mirrors and grand gardens." }
  ]

  const faqs = [
    { id: "fsw-faq-1", question: "How do we cross the border?", answer: "Our packages feature scenic TGV crossings which require no manual visa clearance halts." }
  ]

  return (
    <Layout>
      <SEO 
        title="France & Switzerland Tour | GhumoFiroo Travels"
        description="Book our classic multi-country tour covering France and Swiss Alps. First-class rail, visa guidance, and boutique hotels."
        canonicalUrl={config.baseUrl + "/packages/europe-france-switzerland"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200" alt="France Switzerland" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">10 Days</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            France & Switzerland Tour
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Combine the elegance of France with majestic Swiss mountain ranges.
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
            <h2 className="text-2xl font-display font-bold text-primary dark:text-foreground">Country Overview</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              This iconic twin-destination tour covers top-tier scenic transits and major historical monuments in France and Switzerland.
            </p>
            <div className="flex gap-4 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-france")}>France Guide</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-switzerland")}>Swiss Guide</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">10 Days / 9 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-emerald-500">Schengen</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="France & Switzerland Route Map" />
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
            <p className="text-xs text-muted-foreground leading-relaxed">France uses Euro (EUR) and Switzerland uses Swiss Francs (CHF).</p>
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

      <StickyCTA packageName="France & Switzerland Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default EuropeFranceSwitzerland
