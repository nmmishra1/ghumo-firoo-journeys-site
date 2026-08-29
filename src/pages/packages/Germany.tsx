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

const GermanyHub: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-germany", 155000).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Germany', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const attractions = [
    { title: "Neuschwanstein Castle", description: "The iconic 19th-century Romanesque Revival palace nestled in the rugged hills of Bavaria.", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=600", distance: "Bavaria", highlights: ["VIP Castle Entry", "Bridge View photo", "Alpine walks"] },
    { title: "Berlin Wall & Gate", description: "Brandenburg Gate and remaining walls reflecting Germany's historical reunifications.", image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=600", distance: "Berlin", highlights: ["Checkpoint Charlie", "East Side Gallery", "Brandenburg Gate"] }
  ]

  const days = [
    { day: 1, title: "Arrival in Munich & Old Town", description: "Land at Munich airport. Transfer to hotel. Spend the afternoon exploring Marienplatz city hall.", highlights: ["Munich airport transfer", "Marienplatz clock chime", "Bavarian dinner"] },
    { day: 2, title: "Bavarian Castles excursion", description: "Take a private guided day tour to Neuschwanstein Castle and Linderhof Palace.", highlights: ["Neuschwanstein tour", "Bavarian Alps views", "Private carriage ride"] },
    { day: 3, title: "Munich to Berlin ICE High-Speed Train", description: "Board the high-speed ICE train to Berlin. Stroll around Brandenburg Gate in the evening.", highlights: ["ICE High-Speed Train", "Brandenburg Gate", "Berlin Hotel check-in"] },
    { day: 4, title: "Berlin Historical tour", description: "Explore the remnants of the Berlin Wall, Checkpoint Charlie museum, and Reichstag Dome.", highlights: ["Berlin Wall walk", "Checkpoint Charlie entry", "Reichstag Dome views"] },
    { day: 5, title: "Berlin Departure", description: "Transfer to Berlin airport for your return flight home.", highlights: ["Berlin airport transfer"] }
  ]

  const hotels = [
    { name: "Sofitel Munich Bayerpost", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Munich Center", amenities: ["Spa", "Pool", "Central Location"], priceFrom: "₹18,500" }
  ]

  const inclusions = [
    "ICE High-speed 2nd Class train tickets",
    "Lodging in standard deluxe 4-star hotels with breakfast",
    "Neuschwanstein Castle entry and guided tours",
    "Schengen visa advise checklist assistance"
  ]

  const exclusions = [
    "Flights and visa costs",
    "Meals outside hotel breakfast schedules",
    "Tipping fees for drivers"
  ]

  const faqs = [
    { id: "de-faq-1", question: "Is the Neuschwanstein Castle tour pre-booked?", answer: "Yes, timed-entry tickets are pre-secured to ensure direct access." }
  ]

  return (
    <Layout>
      <SEO 
        title="Germany Luxury Vacation Packages | GhumoFiroo Travels"
        description="Book your premium tour to Germany. Experience Munich, Berlin Wall, Neuschwanstein Castle, and high-speed ICE rail."
        canonicalUrl={config.baseUrl + "/packages/europe-germany"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1200" alt="Germany Munich" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium Schengen Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Germany
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Discover the historic trails of Munich, Berlin, and Bavarian castles.
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
              Explore royal Bavarian palaces, historical Berlin walls, and high-speed ICE rail transits.
            </p>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Capital:</span> <span className="font-bold">Berlin</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Currency:</span> <span className="font-bold">Euro (EUR)</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-[#C9A25A]">Schengen</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Top Cities" title="Germany Highlights" className="mx-auto mb-12" />
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
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground mb-4">Multi-Country Tours featuring Germany</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-highlights")}>Europe Highlights</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-grand-tour")}>Grand Europe</Button>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl border-t border-border/40">
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground">Schengen Visa Advisories</h3>
        <p className="text-xs text-muted-foreground pt-2">Germany requires standard Schengen documents. Learn more details on our <Link to="/packages/europe" className="text-[#C9A25A] hover:underline font-semibold">Europe Hub visa guide</Link>.</p>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section id="booking-section" className="py-20 container mx-auto px-6">
        <BookingFormWrapper onSubmit={(data) => console.log(data)} />
      </section>

      <StickyCTA packageName="Germany Luxury Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default GermanyHub
