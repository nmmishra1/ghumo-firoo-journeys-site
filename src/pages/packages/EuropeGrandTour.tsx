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
import { ShieldCheck, Sparkles, Compass, Heart } from "lucide-react"

const EuropeGrandTour: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-grand-tour", 345000).toString().replace(/[^0-9]/g, ""))

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
    { name: "Germany", days: "Days 7–9", cities: ["Frankfurt", "Cologne", "Munich"] },
    { name: "Austria", days: "Days 10–11", cities: ["Vienna", "Salzburg"] },
    { name: "Switzerland", days: "Days 12–13", cities: ["Zurich", "Interlaken"] },
    { name: "Italy", days: "Days 14–18", cities: ["Milan", "Florence", "Rome", "Venice"] }
  ]

  const stops = [
    { label: "Paris", lat: 48.8566, lng: 2.3522, day: "Day 1-3" },
    { label: "Brussels", lat: 50.8503, lng: 4.3517, day: "Day 4" },
    { label: "Amsterdam", lat: 52.3676, lng: 4.9041, day: "Day 5-6" },
    { label: "Frankfurt", lat: 50.1109, lng: 8.6821, day: "Day 7" },
    { label: "Munich", lat: 48.1351, lng: 11.5820, day: "Day 8-9" },
    { label: "Salzburg", lat: 47.8095, lng: 13.0550, day: "Day 10" },
    { label: "Vienna", lat: 48.2082, lng: 16.3738, day: "Day 11" },
    { label: "Zurich", lat: 47.3769, lng: 8.5417, day: "Day 12-13" },
    { label: "Milan", lat: 45.4642, lng: 9.1900, day: "Day 14" },
    { label: "Florence", lat: 43.7696, lng: 11.2558, day: "Day 15" },
    { label: "Venice", lat: 45.4408, lng: 12.3155, day: "Day 16" },
    { label: "Rome", lat: 41.9028, lng: 12.4964, day: "Day 17-18" }
  ]

  const days = [
    { day: 1, title: "Arrival in Paris", description: "Land at Paris CDG. Private transfer to your hotel. Evening private Seine cruise.", highlights: ["Seine River cruise", "Parisian luxury lodging"] },
    { day: 2, title: "Eiffel Summit & Louvre Museum", description: "Timed-entry summit tickets for Eiffel Tower and skip-the-line entrance to the Louvre.", highlights: ["Eiffel Summit access", "Louvre Museum guide"] },
    { day: 3, title: "Palace of Versailles guided tour", description: "Enjoy a private guided tour of the Palace of Versailles.", highlights: ["Versailles entry", "Hall of Mirrors guide"] },
    { day: 4, title: "Paris to Brussels & Bruges tour", description: "TGV to Brussels. Drive to the medieval city of Bruges for a canal tour.", highlights: ["TGV border crossing", "Bruges Canal boat cruise"] },
    { day: 5, title: "Brussels to Amsterdam transfer", description: "Check out. Private road transfer to Amsterdam, visiting Zaanse Schans windmills en-route.", highlights: ["Zaanse Schans tour", "Amsterdam hotel check-in"] },
    { day: 6, title: "Amsterdam Canals & Van Gogh Museum", description: "Private canal boat tour in Amsterdam and admission to the Van Gogh Museum.", highlights: ["Amsterdam canal tour", "Van Gogh Museum entry"] },
    { day: 7, title: "Amsterdam to Frankfurt via Cologne", description: "Board the high-speed ICE train to Frankfurt, stopping to view Cologne Cathedral.", highlights: ["Cologne Cathedral visit", "ICE High-Speed Rail"] },
    { day: 8, title: "Frankfurt to Munich & Old Town", description: "ICE train to Munich. Enjoy exploring Marienplatz clock chime in the evening.", highlights: ["Marienplatz Old Town", "ICE High-Speed Rail"] },
    { day: 9, title: "Bavarian Neuschwanstein Castle excursion", description: "Take a private guided day tour to Neuschwanstein Castle.", highlights: ["Neuschwanstein tour", "Bavarian Alps views"] },
    { day: 10, title: "Munich to Salzburg tour", description: "Drive to Salzburg. Visit Mozart's Birthplace and Mirabell Gardens.", highlights: ["Mozart House entry", "Mirabell Gardens stroll"] },
    { day: 11, title: "Salzburg to Vienna Railjet & Concert", description: "High-speed Railjet to Vienna. Attend a premium classical music concert.", highlights: ["Kursalon Concert tickets", "Railjet rail"] },
    { day: 12, title: "Schönbrunn Palace & Zurich transfer", description: "Vienna tour and Schönbrunn entry. Evening train to Zurich.", highlights: ["Schönbrunn entry", "Trans-national train ride"] },
    { day: 13, title: "Jungfraujoch - Top of Europe", description: "Ascend by cogwheel train to the top of Europe at Jungfraujoch.", highlights: ["Jungfraujoch cogwheel pass", "Ice Palace stroll"] },
    { day: 14, title: "Zurich to Milan trans-Alpine rail", description: "Scenic rail to Milan. Visit the gothic Duomo in the afternoon.", highlights: ["Trans-Alpine scenic rail", "Milan Duomo tickets"] },
    { day: 15, title: "Milan to Florence & Uffizi tour", description: "Frecciarossa train to Florence. Guided Uffizi gallery tour.", highlights: ["Frecciarossa Train ride", "Uffizi Gallery entry"] },
    { day: 16, title: "Florence to Venice day excursion", description: "Private gondola cruise and tour of St. Mark's Basilica.", highlights: ["Gondola cruise", "St. Mark's Basilica entry"] },
    { day: 17, title: "Florence to Rome & Colosseum", description: "Rail to Rome. Tour the ancient arena floor of the Colosseum.", highlights: ["Colosseum Arena VIP", "Roman Forum guide"] },
    { day: 18, title: "Vatican Museum & Departure", description: "Vatican Museum and Sistine Chapel timed entry. Transfer to FCO airport for departure.", highlights: ["Vatican timed entry", "FCO Airport transfer"] }
  ]

  const hotels = [
    { name: "Hôtel Regina Paris", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "France (Paris)", amenities: ["Spa", "Michelin Dining", "Garden View"] },
    { name: "Hotel Amigo Brussels", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", starRating: 5, location: "Belgium (Brussels)", amenities: ["Spa", "Gym", "Concierge"] },
    { name: "Sofitel Legend The Grand Amsterdam", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600", starRating: 5, location: "Netherlands (Amsterdam)", amenities: ["Spa", "Canal View", "Dining"] },
    { name: "Sofitel Munich Bayerpost", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Germany (Munich)", amenities: ["Spa", "Pool", "Central"] },
    { name: "Grand Hotel Wien", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600", starRating: 5, location: "Austria (Vienna)", amenities: ["Spa", "Pool", "Central"] },
    { name: "Victoria Jungfrau Grand Hotel", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600", starRating: 5, location: "Switzerland (Interlaken)", amenities: ["Spa", "Pool", "Alps Views"] },
    { name: "Sina Bernini Bristol Rome", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Italy (Rome)", amenities: ["Roof Dining", "Spa", "Central"] }
  ]

  const inclusions = [
    "Eurail First Class pass and high-speed train reservations",
    "Lodging in standard deluxe 4-star/5-star hotels with breakfast",
    "Admissions to Eiffel, Louvre, Neuschwanstein, Schönbrunn, Jungfraujoch, Colosseum, and Vatican",
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
    { id: "ge-faq-1", question: "Is the Eurail Pass first class?", answer: "Yes, our packages integrate first-class train bookings for all cross-border transits." }
  ]

  return (
    <Layout>
      <SEO 
        title="Grand Europe Tour | GhumoFiroo Travels"
        description="Book our flagship multi-country tour covering France, Belgium, Netherlands, Germany, Austria, Switzerland, and Italy. Premium transits and visa guidance."
        canonicalUrl={config.baseUrl + "/packages/europe-grand-tour"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200" alt="Grand Europe" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <div className="flex gap-2">
            <Badge variant="luxury">Most Popular</Badge>
            <Badge variant="luxuryNavy">Premium</Badge>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Grand Europe Tour
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-light font-sans leading-relaxed">
            Our ultimate continental journey. Traverse 7 countries, marveling at historical landmarks, dramatic landscapes, and iconic architecture with first-class travel amenities.
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

      {/* Overview */}
      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-border/40 pb-12">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-display font-bold text-primary dark:text-foreground">Journey Overview</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              This flagship European package traverses the heart of Europe. Access premium guide services, first-class trains, and highly rated boutique accommodations.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-france")}>France</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-belgium")}>Belgium</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-netherlands")}>Netherlands</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-germany")}>Germany</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-austria")}>Austria</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-switzerland")}>Switzerland</Button>
              <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-italy")}>Italy</Button>
            </div>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">15–18 Days</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-emerald-500">Schengen</span></div>
          </div>
        </div>
      </section>

      {/* Why Grand Europe */}
      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Value Props" title="Why Grand Europe" className="mx-auto mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: "7 Countries covered", desc: "France, Belgium, Netherlands, Germany, Austria, Switzerland, and Italy combined in a unified package.", icon: Compass },
            { title: "Iconic Landmarks VIP access", desc: "Enjoy pre-booked skip-the-line admissions to Eiffel Tower, Louvre, Jungfraujoch, and Colosseum.", icon: Sparkles },
            { title: "Private guide services", desc: "Experienced local guides detailing heritage sights, museums, and local histories.", icon: ShieldCheck },
            { title: "Luxury stays pre-secured", desc: "Spend nights inside highly rated boutique hotels and central city accommodations.", icon: Heart }
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <Card key={idx} variant="glass" className="p-6 flex flex-col space-y-4">
                <div className="h-10 w-10 rounded-luxury-sm bg-[#C9A25A]/15 flex items-center justify-center text-[#C9A25A]">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-base font-display font-bold text-primary dark:text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Grand Europe Route Map" />
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
            <p className="text-xs text-muted-foreground leading-relaxed">May to October is ideal for mild weather and pleasant sight excursions across all 7 countries.</p>
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

      <StickyCTA packageName="Grand Europe Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default EuropeGrandTour
