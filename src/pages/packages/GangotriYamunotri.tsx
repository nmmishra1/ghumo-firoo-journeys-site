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

const GangotriYamunotriYatra: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const price = Number(usePackagePrice("gangotri-yamunotri-tour", 18500).toString().replace(/[^0-9]/g, ""))

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Gangotri', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const stops = [
    { label: "Haridwar", lat: 29.9457, lng: 78.1642, day: "Day 1", description: "Gateway to the gods and start of the sacred journey." },
    { label: "Barkot", lat: 30.8100, lng: 78.2100, day: "Day 2", description: "Scenic mountain base en route to Yamunotri." },
    { label: "Yamunotri", lat: 31.0100, lng: 78.4500, day: "Day 3", description: "The origin shrine of Goddess Yamuna." },
    { label: "Uttarkashi", lat: 30.7268, lng: 78.4500, day: "Day 4", description: "Historic spiritual hub on the Bhagirathi banks." },
    { label: "Gangotri", lat: 30.9947, lng: 78.9398, day: "Day 5", description: "Origin point of the holy river Ganges." },
    { label: "Haridwar", lat: 29.9457, lng: 78.1642, day: "Day 6", description: "Return destination for onward travel." }
  ]

  const days = [
    { day: 1, title: "Haridwar to Barkot via Mussoorie", description: "Morning pick-up. Drive through Mussoorie, stop at Kempty Falls, and continue to Barkot in the Yamuna Valley.", highlights: ["Kempty Falls Sightseeing", "Yamuna Valley Drive", "Barkot Stay"] },
    { day: 2, title: "Yamunotri Excursion (Trek to Shrine)", description: "Drive to Janki Chatti, then trek 6km to Yamunotri Temple. Take a hot water dip at Surya Kund. Return trek and drive back to Barkot.", highlights: ["Yamunotri Temple Darshan", "Surya Kund Snan", "Janki Chatti Trek"] },
    { day: 3, title: "Barkot to Uttarkashi", description: "Scenic drive from Barkot to Uttarkashi. In the evening, visit the historic Kashi Vishwanath and Shakti Temples.", highlights: ["Uttarkashi Drive", "Kashi Vishwanath Temple", "Shakti Temple Trident"] },
    { day: 4, title: "Gangotri Dham Excursion", description: "Drive along the Bhagirathi River through Harsil Valley. Visit the Gangotri Temple, dedicated to Goddess Ganga.", highlights: ["Harsil Valley Apple Orchards", "Bhagirathi Snan", "Gangotri Temple Puja"] },
    { day: 5, title: "Uttarkashi to Rishikesh / Haridwar", description: "Drive back through Rishikesh. Stop to visit Ram Jhula, Laxman Jhula, and Triveni Ghat before returning to Haridwar.", highlights: ["Rishikesh Ghats", "Triveni Ghat Evening", "Haridwar Departure"] }
  ]

  const hotels = [
    { name: "Pavilion Resort Barkot", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600", starRating: 3, location: "Barkot", amenities: ["Valley Views", "Hot Water", "Parking"], priceFrom: "₹5,200" },
    { name: "Ganga Valley Uttarkashi", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600", starRating: 3, location: "Uttarkashi", amenities: ["Veg Restaurant", "Heaters", "Room Service"], priceFrom: "₹4,800" }
  ]

  const inclusions = [
    "AC ground transfers with private driver",
    "Lodging in standard deluxe hotels with meals",
    "Online biometric permits coordination",
    "VIP Darshan queue assistance",
    "Oxygen cylinders and medical emergency support"
  ]

  const exclusions = [
    "Pony, Palki or porter charges during the Yamunotri trek",
    "Lunch or personal dining expenses",
    "Entrance tickets or camera charges",
    "Gratuity and tips"
  ]

  const faqs = [
    { id: "gy-faq-1", question: "How long is the trek to Yamunotri?", answer: "The trek is 6km from Janki Chatti. It is well-paved, and horses or palanquins are easily hireable." },
    { id: "gy-faq-2", question: "What is Harsil Valley famous for?", answer: "Harsil Valley is famous for its scenic beauty, dense deodar forests, apple orchards, and the serene Bhagirathi river." }
  ]

  return (
    <Layout>
      <SEO 
        title="Gangotri & Yamunotri Do Dham Yatra | GhumoFiroo Travels"
        description="Premium travel packages to Gangotri and Yamunotri river origins. Deluxe SUV travel, VIP Darshan, and premium mountain lodging."
        canonicalUrl={config.baseUrl + "/packages/gangotri-yamunotri-tour"}
      />

      <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-[#0B1026]">
          <img src="/Badrinath.png" alt="Gangotri Yamunotri" className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/75 via-[#0B1026]/85 to-[#0B1026] z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6">
          <Badge variant="luxury">Sacred Himalayan Pilgrimage</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white max-w-4xl leading-tight">
            Gangotri & Yamunotri Yatra
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light font-sans leading-relaxed">
            Perform the holy yatra to Gangotri and Yamunotri.
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
              This package covers the origins of the Yamuna and Ganga rivers. You will trek to the sacred Yamunotri shrine to take a holy dip in the Surya Kund thermal spring, followed by a beautiful road tour through the orchards of Harsil to the Gangotri temple on the banks of the Bhagirathi.
            </p>
          </div>
          <div className="bg-[#1A2342]/10 dark:bg-[#1A2342]/20 border border-[#C9A25A]/10 p-6 rounded-luxury-md space-y-4">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Duration:</span> <span className="font-bold">6 Days / 5 Nights</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price:</span> <span className="font-bold text-[#C9A25A]">From ₹{price.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">Difficulty:</span> <span className="font-bold text-amber-500">Moderate</span></div>
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-6 max-w-5xl">
        <RouteMap stops={stops} title="Ganga-Yamuna Tour Stops" />
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

      <StickyCTA packageName="Gangotri & Yamunotri Tour" priceText={`Starting ₹${price.toLocaleString("en-IN")}`} onPrimaryClick={() => navigate("/enquire-now")} />
    </Layout>
  )
}

export default GangotriYamunotriYatra
