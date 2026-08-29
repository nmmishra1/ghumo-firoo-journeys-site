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

const CzechRepublicHub: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("europe-czech-republic", 118000).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Czech Republic', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const attractions = [
    { title: "Prague Castle", description: "The ancient castle complex in Prague, dating from the 9th century and overlooking the Vltava River.", image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=600", distance: "Prague", highlights: ["VIP Palace Access", "St. Vitus Cathedral", "Golden Lane"] },
    { title: "Charles Bridge", description: "Historic stone arch bridge crossing the Vltava River, lined with statues of saints.", image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=600", distance: "Prague Center", highlights: ["Bridge photo sunset", "Old Town bridge tower", "Local buskers"] }
  ]

  const days = [
    { day: 1, title: "Arrival in Prague & Evening Walk", description: "Land at Prague Airport. Private transfer to your hotel. Evening walk across the illuminated Charles Bridge.", highlights: ["Prague Airport transfer", "Charles Bridge", "Old Town Square"] },
    { day: 2, title: "Prague Castle & Cathedral Tour", description: "Enjoy a private tour of Prague Castle, St. Vitus Cathedral, and Golden Lane.", highlights: ["Prague Castle entry", "St. Vitus Cathedral", "Golden Lane stroll"] },
    { day: 3, title: "Cesky Krumlov day excursion", description: "Take a day tour to the romantic medieval town of Cesky Krumlov. Explore its historic castle and riverside.", highlights: ["Cesky Krumlov castle", "Bohemian streets", "Vltava River views"] },
    { day: 4, title: "Astronomical Clock & Old Town", description: "Watch the Astronomical Clock show and explore the historical markets and lanes of Prague Old Town.", highlights: ["Astronomical Clock show", "Old Town markets", "Traditional Trdelnik tasting"] },
    { day: 5, title: "Prague Departure", description: "Transfer to Prague airport for your return flight home.", highlights: ["Prague airport drop-off"] }
  ]

  const hotels = [
    { name: "Alchymist Grand Hotel & Spa", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 5, location: "Prague Lesser Town", amenities: ["Spa", "Pool", "Central Location"], priceFrom: "₹17,500" }
  ]

  const inclusions = [
    "Private SUV group ground transfers",
    "Lodging in standard deluxe 4-star hotels with breakfast",
    "Prague Castle, St. Vitus, and Cesky Krumlov tickets",
    "Schengen visa advise checklist assistance"
  ]

  const exclusions = [
    "Flights and visa costs",
    "Meals outside hotel breakfast schedules",
    "Tipping fees for drivers"
  ]

  const faqs = [
    { id: "cz-faq-1", question: "Is Prague Castle wheelchair accessible?", answer: "Yes, major routes and areas of the complex have accessible access points." }
  ]

  return (
    <Layout>
      <SEO 
        title="Czech Republic Luxury Vacation Packages | GhumoFiroo Travels"
        description="Book your premium tour to Czech Republic. Experience Prague Castle, Charles Bridge, and Cesky Krumlov medieval excursions."
        canonicalUrl={config.baseUrl + "/packages/europe-czech-republic"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200" alt="Czech Republic Prague" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Premium Schengen Experience</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Czech Republic
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Discover the medieval streets of Prague, Cesky Krumlov, and Brno.
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
              Explore royal bohemian castles, astronomical clocks, and medieval excursions to Cesky Krumlov.
            </p>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Capital:</span> <span className="font-bold">Prague</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Currency:</span> <span className="font-bold">Czech Koruna (CZK)</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Visa Type:</span> <span className="font-bold text-[#C9A25A]">Schengen</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Top Cities" title="Czech Republic Highlights" className="mx-auto mb-12" />
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

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <h3 className="text-xl font-display font-bold text-primary dark:text-foreground">Schengen Visa Advisories</h3>
        <p className="text-xs text-muted-foreground pt-2">Czech Republic requires standard Schengen documents. Learn more details on our <Link to="/packages/europe" className="text-[#C9A25A] hover:underline font-semibold">Europe Hub visa guide</Link>.</p>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section id="booking-section" className="py-20 container mx-auto px-6">
        <BookingFormWrapper onSubmit={(data) => console.log(data)} />
      </section>

      <StickyCTA packageName="Czech Republic Luxury Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default CzechRepublicHub
