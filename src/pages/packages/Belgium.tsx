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

const BelgiumHub: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-belgium", 125000).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Belgium', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const attractions = [
    { title: "Grand Place Brussels", description: "The majestic central square of Brussels, surrounded by opulent guildhalls and city halls.", image: "https://images.unsplash.com/photo-1491557342268-8c0e290f9c2d?q=80&w=600", distance: "Brussels", highlights: ["Guildhalls visit", "Chocolate tasting", "Manneken Pis"] },
    { title: "Bruges Canals", description: "Romantic medieval city featuring cobblestone streets, old channels, and historical towers.", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600", distance: "Bruges", highlights: ["Canal boat ride", "Belfry Tower climb", "Markt square stroll"] }
  ]

  const days = [
    { day: 1, title: "Arrival in Brussels & City Walk", description: "Land at Brussels Airport. Private transfer to your hotel. Stroll around the illuminated Grand Place in the evening.", highlights: ["Airport private transfer", "Grand Place walks", "Belgian Waffle trials"] },
    { day: 2, title: "Atomium & Chocolate Tasting", description: "Explore the futuristic Atomium sphere monument, and participate in a premium Belgian chocolate making workshop.", highlights: ["Atomium entrance ticket", "Chocolate workshop class", "Local beer tastings"] },
    { day: 3, title: "Bruges Medieval day excursion", description: "Take a day tour to the romantic canal city of Bruges. Stroll along the cobbled squares and climb the Belfry Tower.", highlights: ["Bruges canals boat", "Belfry Tower panorama", "Markt square lunch"] },
    { day: 4, title: "Ghent historic castles tour", description: "Visit the Gravensteen Castle and explore the scenic waterfront guildhalls in Ghent.", highlights: ["Ghent Castle entry", "Graslei waterfront stroll", "Scenic private drive"] },
    { day: 5, title: "Brussels Departure", description: "Transfer to Brussels airport for your return flight home.", highlights: ["Brussels airport drop-off"] }
  ]

  const hotels = [
    { name: "Hotel Amigo Brussels", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Brussels Grand Place", amenities: ["Spa", "Gym", "Concierge services"], priceFrom: "₹21,000" }
  ]

  const inclusions = [
    "Private SUV group ground transfers",
    "Lodging in standard deluxe 4-star hotels with breakfast",
    "Atomium, Bruges canals, and Ghent Castle tickets",
    "Schengen visa advise checklist assistance"
  ]

  const exclusions = [
    "Flights and visa costs",
    "Meals outside hotel breakfast schedules",
    "Tipping fees for drivers"
  ]

  const faqs = [
    { id: "be-faq-1", question: "Is the chocolate workshop suitable for kids?", answer: "Yes, it is highly interactive and kid-friendly." }
  ]

  return (
    <Layout>
      <SEO 
        title="Belgium Luxury Vacation Packages | GhumoFiroo Travels"
        description="Book your premium tour to Belgium. Experience Brussels Grand Place, Bruges canals, Ghent castles, and chocolate workshops."
        canonicalUrl={config.baseUrl + "/packages/europe-belgium"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1491557342268-8c0e290f9c2d?q=80&w=1200" alt="Belgium Brussels" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium Schengen Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Belgium
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Discover the medieval streets of Brussels, Bruges, and Ghent.
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
              Explore historic central squares, chocolate workshops, and medieval excursions to Bruges and Ghent.
            </p>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Capital:</span> <span className="font-bold">Brussels</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Currency:</span> <span className="font-bold">Euro (EUR)</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-[#C9A25A]">Schengen</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Top Cities" title="Belgium Highlights" className="mx-auto mb-12" />
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
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground mb-4">Multi-Country Tours featuring Belgium</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-highlights")}>Europe Highlights</Button>
          <Button variant="luxuryOutline" size="sm" onClick={() => navigate("/packages/europe-grand-tour")}>Grand Europe</Button>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl border-t border-border/40">
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground">Schengen Visa Advisories</h3>
        <p className="text-xs text-muted-foreground pt-2">Belgium requires standard Schengen documents. Learn more details on our <Link to="/packages/europe" className="text-[#C9A25A] hover:underline font-semibold">Europe Hub visa guide</Link>.</p>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section id="booking-section" className="py-20 container mx-auto px-6">
        <BookingFormWrapper onSubmit={(data) => console.log(data)} />
      </section>

      <StickyCTA packageName="Belgium Luxury Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default BelgiumHub
