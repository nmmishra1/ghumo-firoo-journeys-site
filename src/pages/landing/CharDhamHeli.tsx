import React, { useEffect, useState } from 'react';
import { 
  Check, Shield, Award, Clock, MapPin, Plane, 
  Star, Phone, Calendar, Users, ArrowRight, Menu, X, ChevronDown, CheckCircle, ShieldCheck
} from 'lucide-react';
import LandingLayout from '@/components/landing/LandingLayout';
import LeadForm from '@/components/landing/LeadForm';
import StickyCTA from '@/components/landing/StickyCTA';
import CountdownTimer from '@/components/landing/CountdownTimer';
import ExitIntentPopup from '@/components/landing/ExitIntentPopup';
import ComparisonSection from '@/components/landing/ComparisonSection';
import Testimonials from '@/components/landing/Testimonials';
import ItineraryTimeline from '@/components/landing/ItineraryTimeline';
import RouteAnimation from '@/components/landing/RouteAnimation';
import { trackViewContent } from '@/lib/pixel';
import { Button } from '@/components/ui/button';
import { config } from '@/config';
import { buildTouristTripJsonLd } from '@/components/seo/JsonLd';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const CharDhamHeli = () => {
  const packageName = "Char Dham Helicopter Package (5N/6D)";
  const price = 225000;
  const baseUrl = config.baseUrl;
  const canonicalUrl = `${baseUrl}/landing/char-dham-helicopter`;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    trackViewContent(packageName, 'char-dham-heli-landing', price, 'INR');
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const highlights = [
    { icon: <Plane className="w-6 h-6 text-blue-600" />, title: "Luxury Heli Transfers", desc: "Dehradun to all 4 Dhams" },
    { icon: <Star className="w-6 h-6 text-yellow-500" />, title: "VIP Darshan", desc: "Priority access at all temples" },
    { icon: <Users className="w-6 h-6 text-green-600" />, title: "Palki/Pony Included", desc: "Comfortable travel at Yamunotri" },
    { icon: <Shield className="w-6 h-6 text-indigo-600" />, title: "Premium Stays", desc: "Best hotels in the region" },
    { icon: <Clock className="w-6 h-6 text-accent" />, title: "5 Nights / 6 Days", desc: "Perfectly paced itinerary" },
    { icon: <Award className="w-6 h-6 text-purple-600" />, title: "Tour Manager", desc: "Dedicated support 24/7" },
  ];

  const itinerary = [
    { day: 1, title: "Arrival in Dehradun", desc: "Arrive at Dehradun airport. VIP Transfer to luxury hotel. Evening briefing session & welcome dinner." },
    { day: 2, title: "Dehradun to Yamunotri", desc: "Fly to Kharsali. VIP Palki/Pony to Yamunotri Temple. Priority Darshan. Overnight in Kharsali." },
    { day: 3, title: "Yamunotri to Gangotri", desc: "Fly to Harsil (Mini Switzerland). Drive to Gangotri. VIP Darshan. Overnight amidst apple orchards in Harsil." },
    { day: 4, title: "Gangotri to Kedarnath", desc: "Fly to Sersi/Guptkashi. Shuttle to Kedarnath. VIP Darshan & Jal Abhishek. Return to Guptkashi for overnight." },
    { day: 5, title: "Kedarnath to Badrinath", desc: "Fly to Badrinath. VIP Darshan of Badri Vishal. Visit Mana Village. Overnight in Badrinath." },
    { day: 6, title: "Return to Dehradun", desc: "Morning Maha Abhishek (Optional). Fly back to Sahastradhara Helipad. Tour concludes with divine memories." }
  ];

  const structuredData = buildTouristTripJsonLd({
    name: "Char Dham Yatra Helicopter Package 2026",
    description: "5 Nights 6 Days VIP Char Dham Yatra by Helicopter 2026. Includes VIP Darshan at Kedarnath & Badrinath, luxury stay, and meals.",
    url: canonicalUrl,
    image: ["/chardham-by-helicopter.jpg"],
    itinerary: itinerary.map((day, index) => ({
      position: index + 1,
      name: day.title,
      description: day.desc
    })),
    offer: {
      priceCurrency: 'INR',
      price: String(price),
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0]
    },
    providerName: 'Ghumo Firoo Travels',
    destination: {
      name: 'Char Dham',
      address: 'Uttarakhand, India'
    }
  });

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <LandingLayout 
      title="Helicopter Char Dham Yatra 2026 | Premium 5-Day Heli Tour Packages" 
      description="Experience luxury Heli Char Dham Yatra in 5 days. Avoid trekking, reach all 4 Dhams by helicopter. VIP Darshan, premium hotels & meals included."
      robots="index, follow"
      canonical={canonicalUrl}
      structuredData={structuredData}
      hideHeader={true}
    >
      <ExitIntentPopup packageName={packageName} />
      <StickyCTA />

      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {scrolled ? (
              <img 
                src="/ghumo-firoo-logo.png" 
                alt="Ghumo Firoo Travels" 
                className="h-10 w-auto" 
              />
            ) : (
              <span className="font-bold text-2xl text-white tracking-tight">
                Ghumo Firoo
              </span>
            )}
          </div>
          <Button 
            onClick={scrollToForm}
            className={`${scrolled ? 'bg-accent hover:bg-accent/90' : 'bg-white text-blue-900 hover:bg-blue-50'} transition-colors font-bold shadow-lg`}
          >
            Get Quote
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/Kedarnath Video.mp4" type="video/mp4" />
            <img 
              src="/chardham-by-helicopter.jpg" 
              alt="Char Dham Yatra 2026 Helicopter View" 
              className="w-full h-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <div className="space-y-8 text-white animate-in fade-in slide-in-from-left-10 duration-700">
              <div className="inline-flex items-center gap-2 bg-accent/20 border border-orange-400/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/60 font-medium tracking-wide text-sm uppercase">
                <Star className="w-4 h-4 text-orange-400 fill-current" /> 
                Premium Yatra 2026
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                The Divine <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-200">
                  Heli-Yatra
                </span>
              </h1>
              
              <p className="text-xl text-blue-100/90 max-w-xl leading-relaxed">
                Complete your Char Dham Yatra in just 5 nights with VIP Darshan, luxury stays, and seamless helicopter transfers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default group">
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Starting From</p>
                    <p className="font-bold text-2xl tracking-tight">₹2,25,000<span className="text-sm font-normal text-blue-200 ml-1">/person</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default group">
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Booking Status</p>
                    <p className="font-bold text-xl text-green-300 flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      Open for 2026
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-blue-200/80">
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> No Trekking</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> VIP Access</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-400" /> Best Hotels</span>
              </div>
            </div>

            {/* Lead Form Card */}
            <div className="lg:ml-auto w-full max-w-md animate-in fade-in slide-in-from-right-10 duration-1000 delay-200" id="lead-form">
              <div className="bg-white/95 backdrop-blur-xl p-1 rounded-3xl shadow-2xl border border-white/20">
                <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-inner">
                  <div className="mb-6 text-center">
                    <Badge variant="outline" className="mb-3 border-accent/30 text-accent bg-accent/5">Limited Seats Available</Badge>
                    <h3 className="text-2xl font-bold text-gray-900">Get Your Quote</h3>
                    <p className="text-gray-500 text-sm mt-1">Receive detailed itinerary & pricing instantly</p>
                  </div>
                  
                  <CountdownTimer text="Early Bird Offer Ends In:" className="mb-6 bg-blue-50 text-blue-900 rounded-lg p-3 shadow-none bg-none" />
                  
                  <LeadForm packageName={packageName} hideHeader={true} clean={true} />
                  
                  <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" /> Your data is secure with us
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce hidden md:block">
          <ChevronDown className="w-8 h-8" />
        </div>
      </section>

      {/* Trust Indicators */}
      <div className="bg-blue-900 text-white py-6 border-b border-blue-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-6 md:gap-8 opacity-80 text-sm md:text-base font-medium">
             <div className="flex items-center gap-2"><Shield className="text-green-400" /> ISO 9001:2015 Certified</div>
             <div className="flex items-center gap-2"><Users className="text-blue-400" /> 10,000+ Happy Pilgrims</div>
             <div className="flex items-center gap-2"><Star className="text-yellow-400" /> 4.9/5 Average Rating</div>
             <div className="flex items-center gap-2"><Award className="text-purple-400" /> Uttarakhand Tourism Regd.</div>
          </div>
        </div>
      </div>

      {/* Package Highlights Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Ultimate Comfort</h2>
            <p className="text-lg text-gray-600">Why choose our Premium Helicopter Package for your spiritual journey?</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlights.map((item, idx) => (
              <Card key={idx} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 flex flex-col items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Itinerary Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Day-wise Divine Plan</h2>
              <ItineraryTimeline days={itinerary} />
            </div>
            <div className="lg:w-[450px] space-y-8">
               <div className="sticky top-24">
                 <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-8 group">
                   <img 
                      src="/Kedarnath.png" 
                      alt="Kedarnath Temple" 
                      className="w-full h-[300px] object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                     <p className="text-white font-bold text-lg">Kedarnath Dham</p>
                     <p className="text-white/80 text-sm">3,583m Elevation</p>
                   </div>
                 </div>
                 
                 <RouteAnimation variant="heli" />
                 
                 <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-8">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Plane className="w-5 h-5" /> Flight Details
                    </h4>
                    <ul className="space-y-3 text-sm text-blue-800">
                      <li className="flex justify-between">
                        <span>Dehradun ➝ Kharsali</span>
                        <span className="font-mono">45 mins</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Kharsali ➝ Harsil</span>
                        <span className="font-mono">35 mins</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Harsil ➝ Sersi</span>
                        <span className="font-mono">30 mins</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Sersi ➝ Badrinath</span>
                        <span className="font-mono">25 mins</span>
                      </li>
                    </ul>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <ComparisonSection />

      {/* Reviews */}
      <Testimonials />

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Questions</h2>
            <p className="text-gray-600">Everything you need to know about the Heli-Yatra</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full bg-white rounded-2xl shadow-sm border px-6">
            <AccordionItem value="item-1" className="border-b-gray-100">
              <AccordionTrigger className="text-left font-medium text-lg py-6">What is the baggage allowance per person?</AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6">
                Due to strict weight restrictions in helicopters at high altitudes, passengers are allowed only <strong>5 kg baggage per person</strong>. We recommend carrying soft duffel bags. Extra luggage can be stored at the Dehradun hotel cloakroom.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-gray-100">
              <AccordionTrigger className="text-left font-medium text-lg py-6">Is VIP Darshan included at all temples?</AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6">
                Yes, our package includes <strong>Priority VIP Darshan</strong> slips for all 4 Dhams (Yamunotri, Gangotri, Kedarnath, and Badrinath). This significantly reduces waiting time, allowing you a comfortable and spiritual experience.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b-gray-100">
              <AccordionTrigger className="text-left font-medium text-lg py-6">What happens if the flight is cancelled due to weather?</AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6">
                Weather in the Himalayas is unpredictable. If flying is not possible, we will attempt to fly the next day or arrange for road transfers where feasible (subject to availability). Our refund policy covers unutilized helicopter flying charges as per operator guidelines.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-b-0">
              <AccordionTrigger className="text-left font-medium text-lg py-6">Are meals and accommodation included?</AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6">
                Absolutely. The package is all-inclusive, covering stays in the best available luxury hotels/resorts at each location, and all meals (Breakfast, Lunch, and Dinner). Special Jain food can also be arranged on request.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute right-0 top-0 w-96 h-96 bg-accent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Begin Your Sacred Journey</h2>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Slots for May & June 2026 are filling fast. Secure your booking with a token amount today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button 
              onClick={scrollToForm}
              className="bg-accent hover:bg-accent/90 text-white text-lg px-10 py-7 rounded-xl shadow-xl shadow-orange-900/20 font-bold"
            >
              Book Now @ ₹2,25,000
            </Button>
            <a 
               href="tel:+919910987264"
               className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white text-lg px-10 py-6 rounded-xl font-medium transition-all"
            >
              <Phone className="w-5 h-5 mr-2" /> Call Our Expert
            </a>
          </div>
          <p className="mt-8 text-sm text-blue-300 opacity-80">*Terms & Conditions Applied. Price per person on twin sharing basis.</p>
        </div>
      </section>

    </LandingLayout>
  );
};

// Helper Components
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 11.82a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

export default CharDhamHeli;