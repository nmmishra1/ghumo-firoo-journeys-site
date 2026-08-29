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

const ItalyHub: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-italy", 165000).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Italy', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const attractions = [
    { title: "Rome Colosseum", description: "The iconic ancient amphitheater located in the center of Rome, showcasing historical architecture.", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=600", distance: "Rome", highlights: ["VIP Arena Floor", "Roman Forum tour", "Palatine Hill walks"] },
    { title: "Venice Canals", description: "Picturesque floating city of canals, gondolas, gothic architecture, and romantic bridges.", image: "https://images.unsplash.com/photo-1529260818874-1f450e2e5e86?q=80&w=600", distance: "Veneto Region", highlights: ["Gondola Ride", "St. Mark's Basilica", "Rialto Bridge walk"] }
  ]

  const days = [
    { day: 1, title: "Arrival in Rome & Evening walk", description: "Land at Rome FCO Airport. Transfer to your boutique hotel. Take an evening walk to Trevi Fountain.", highlights: ["FCO Airport transfer", "Trevi Fountain", "Pantheon visits"] },
    { day: 2, title: "Colosseum & Roman Forum", description: "Enjoy a private guided tour of the Colosseum arena floor, Roman Forum, and historic hills.", highlights: ["Colosseum Arena VIP", "Roman Forum guide", "Palatine Hill views"] },
    { day: 3, title: "Vatican Museums & Sistine Chapel", description: "Skip the lines at Vatican Museums. View Michelangelo's ceiling frescoes inside the Sistine Chapel.", highlights: ["Vatican Timed Entry", "Sistine Chapel ceiling", "St. Peter's Basilica"] },
    { day: 4, title: "Rome to Florence Frecciarossa Rail", description: "Board the Frecciarossa high-speed train to Florence. Visit the Duomo and Ponte Vecchio in the afternoon.", highlights: ["Frecciarossa Train ride", "Florence Duomo Cathedral", "Ponte Vecchio walk"] },
    { day: 5, title: "Florence Departure", description: "Transfer to Florence airport for your return flight home.", highlights: ["Florence airport transfer"] }
  ]

  const hotels = [
    { name: "Sina Bernini Bristol Rome", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600", starRating: 5, location: "Rome Center", amenities: ["Roof Dining", "Spa", "Central Shopping Location"], priceFrom: "₹26,000" }
  ]

  const inclusions = [
    "Frecciarossa High-speed 2nd Class train tickets",
    "Lodging in standard deluxe 4-star hotels with breakfast",
    "Colosseum, Vatican, and Florence Duomo passes",
    "Schengen visa advise checklist assistance"
  ]

  const exclusions = [
    "Flights and visa costs",
    "Meals outside hotel breakfast schedules",
    "Tipping fees for drivers"
  ]

  const faqs = [
    { id: "it-faq-1", question: "Is the Colosseum tour guide-led?", answer: "Yes, all our major historic sightseeing tours include expert English-speaking local guides." }
  ]

  return (
    <Layout>
      <SEO 
        title="Italy Luxury Vacation Packages | GhumoFiroo Travels"
        description="Book your premium tour to Italy. Experience Rome Colosseum, Vatican Museums, Florence Duomo, and Venice canals."
        canonicalUrl={config.baseUrl + "/packages/europe-italy"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1529260818874-1f450e2e5e86?q=80&w=1200" alt="Italy Rome" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium Schengen Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Italy
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Discover the historic trails of Rome, Florence, and Venice.
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
              Explore ancient Roman ruins, Florence art galleries, and high-speed Frecciarossa rail transits.
            </p>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Capital:</span> <span className="font-bold">Rome</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Currency:</span> <span className="font-bold">Euro (EUR)</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-[#C9A25A]">Schengen</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Top Cities" title="Italy Highlights" className="mx-auto mb-12" />
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
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground mb-4">Multi-Country Tours featuring Italy</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-switzerland-italy")}>Switzerland & Italy</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-highlights")}>Europe Highlights</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-swiss-italy-france")}>Swiss, Italy & France</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-grand-tour")}>Grand Europe</Button>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl border-t border-border/40">
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground">Schengen Visa Advisories</h3>
        <p className="text-xs text-muted-foreground pt-2">Italy requires standard Schengen documents. Learn more details on our <Link to="/packages/europe" className="text-[#C9A25A] hover:underline font-semibold">Europe Hub visa guide</Link>.</p>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section id="booking-section" className="py-20 container mx-auto px-6">
        <BookingFormWrapper onSubmit={(data) => console.log(data)} />
      </section>

      <StickyCTA packageName="Italy Luxury Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default ItalyHub
