import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import SEO from "@/components/SEO"
import { config } from "@/config"
import { usePackagePrice } from "@/hooks/usePackagePrice"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ScrollReveal from "@/components/ui/ScrollReveal"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { FAQAccordion } from "@/components/ui/FAQAccordion"
import { StickyCTA } from "@/components/common/StickyCTA"
import { RouteMap } from "@/components/shared/RouteMap"
import { ItineraryAccordion } from "@/components/shared/ItineraryAccordion"
import { HotelList } from "@/components/shared/HotelList"
import { InclusionsExclusions } from "@/components/shared/InclusionsExclusions"
import { BookingFormWrapper } from "@/components/shared/BookingFormWrapper"
import { reviewService, GoogleReview } from "@/services/reviewService"

const KedarnathBadrinathYatra: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("kedarnath-badrinath-tour", 22000).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Kedarnath', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const stops = [
    { label: "Haridwar", lat: 29.9457, lng: 78.1642, day: "Day 1", description: "Pilgrim assembly point and start of tour." },
    { label: "Rishikesh", lat: 30.0869, lng: 78.2676, day: "Day 1", description: "Scenic spiritual halts on the Ganges banks." },
    { label: "Guptkashi", lat: 30.5200, lng: 79.0800, day: "Day 2-3", description: "Base town for Kedarnath transfers." },
    { label: "Kedarnath", lat: 30.7346, lng: 79.0669, day: "Day 4", description: "Ancient temple of Lord Shiva in the Himalayas." },
    { label: "Joshimath", lat: 30.5500, lng: 79.5600, day: "Day 5", description: "Historic town and base for Badrinath." },
    { label: "Badrinath", lat: 30.7433, lng: 79.4938, day: "Day 6", description: "Venerated Vishnu temple." },
    { label: "Haridwar", lat: 29.9457, lng: 78.1642, day: "Day 7", description: "Return destination for onward connections." }
  ]

  const days = [
    { day: 1, title: "Haridwar to Guptkashi via Rishikesh", description: "Depart Haridwar early. Drive through Rishikesh and scenic ghat roads along Bhagirathi and Alaknanda confluences. Acclimatize in Guptkashi.", highlights: ["River Confluences", "Himalayan Drive", "Guptkashi Stay"] },
    { day: 2, title: "Guptkashi to Kedarnath Dham", description: "Proceed to Sonprayag/Gaurikund. Begin the 16km trek to Kedarnath Temple. Helicopter transfers available from local helipads.", highlights: ["Kedarnath Trek", "High Altitude Views", "Evening Aarti"] },
    { day: 3, title: "Kedarnath Darshan and return to Guptkashi", description: "Attend the morning abhishek puja at Kedarnath Temple. Trek back down to Gaurikund and transfer to your hotel in Guptkashi.", highlights: ["Morning Temple Puja", "Descent Trek", "Comfortable Rest"] },
    { day: 4, title: "Guptkashi to Joshimath/Pipalkoti", description: "Drive through Chopta Valley, known as the Mini Switzerland of Uttarakhand. Check into Pipalkoti/Joshimath hotel.", highlights: ["Chopta Valley Sightseeing", "Forest Drives", "Mountain Lodges"] },
    { day: 5, title: "Joshimath to Badrinath Temple", description: "Drive to Badrinath Dham. Take a hot water dip in Tapt Kund. Visit Mana Village, the last Indian village before the Tibet border.", highlights: ["Badrinath Darshan", "Mana Village Tour", "Tapt Kund Bath"] },
    { day: 6, title: "Badrinath to Rudraprayag / Rishikesh", description: "Drive back along the Alaknanda River. Visit Devprayag, the confluence of Bhagirathi and Alaknanda where the Ganges forms.", highlights: ["Devprayag Confluence", "Scenic Photography", "Rudraprayag Stay"] },
    { day: 7, title: "Rudraprayag to Haridwar Return", description: "Complete final drives. Stop at Rishikesh for local temple visits and bridges before drop-off at Haridwar station.", highlights: ["Rishikesh Ghats", "Haridwar Departure"] }
  ]

  const hotels = [
    { name: "Snow Crest Badrinath", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", starRating: 3, location: "Badrinath", amenities: ["Heating", "Pure Veg Meals", "Valley View"], priceFrom: "₹6,000" },
    { name: "Kedar River Retreat", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=600", starRating: 3, location: "Guptkashi", amenities: ["Hot Water", "Parking", "In-house Doctor"], priceFrom: "₹5,000" }
  ]

  const inclusions = [
    "Premium AC transportation throughout the yatra",
    "Deluxe stays in hotel and swiss camps",
    "VIP Darshan arrangements at Kedarnath & Badrinath",
    "Certified driver and local assistance",
    "Acclimatization guides and oxygen support kits"
  ]

  const exclusions = [
    "Pony, Palki or Helicopter fares",
    "Local guide charges for trekking guides",
    "Any meals not specified in the itinerary",
    "Government registration fees"
  ]

  const faqs = [
    { id: "kb-faq-1", question: "How can I book helicopter tickets for Kedarnath?", answer: "We assist in organizing Dehradun helipad charters or local shuttle bookings departing from Phata/Sersi/Guptkashi helipads." },
    { id: "kb-faq-2", question: "What is special about Mana Village?", answer: "Mana Village is the last Indian village located near the Indo-China border. It features historical spots like Vyas Gufa and Bhim Pul." }
  ]

  return (
    <Layout>
      <SEO 
        title="Kedarnath & Badrinath Do Dham Yatra | GhumoFiroo Travels"
        description="Secure your premium tour to Kedarnath and Badrinath shrines. Deluxe AC SUV travel, VVIP darshans, and premium mountain lodging."
        canonicalUrl={config.baseUrl + "/packages/kedarnath-badrinath-tour"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="/Kedarnath.png" alt="Kedarnath Badrinath" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Sacred Himalayan Pilgrimage</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Kedarnath & Badrinath Yatra
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Witness the divine power of Kedarnath and Badrinath with VVIP access.
          </p>
          <Button variant="luxury" size="lg" className="px-8 shadow-luxury-md py-6 text-sm" onClick={() => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth" })}>
            Book This Yatra
          </Button>
        </div>
      </ScrollReveal>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-border/40 pb-12">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-display font-bold text-primary dark:text-foreground">Journey Overview</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              This Kedarnath & Badrinath tour package brings together two of the most revered shrines of Uttarakhand. The journey covers the majestic Shiva shrine of Kedarnath, nestled in the snow-capped Mandakini valley, and Badrinath Dham, the pristine abode of Lord Vishnu. We coordinate the entire ground and helicopter transport.
            </p>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">7 Days / 6 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Difficulty:</span> <span className="font-bold text-amber-500">Moderate</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Kedar-Badri Tour stops" />
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <SectionHeading kicker="Itinerary" title="Day-Wise Route" className="mx-auto mb-12" />
          <ItineraryAccordion days={days} />
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <SectionHeading kicker="Stays" title="Handpicked Luxury Stays" className="mx-auto mb-12" />
        <HotelList hotels={hotels} />
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <InclusionsExclusions inclusions={inclusions} exclusions={exclusions} />
        </div>
      </section>

      <section className="py-20 bg-slate-50 dark:bg-[#1A2342]/10 border-t border-border/50">
        <div className="container mx-auto px-6 max-w-5xl">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section id="booking-section" className="py-20 container mx-auto px-6">
        <BookingFormWrapper title="Secure Your Sacred Journey" onSubmit={(data) => console.log(data)} />
      </section>

      <StickyCTA packageName="Kedarnath & Badrinath Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default KedarnathBadrinathYatra
