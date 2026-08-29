import React, { useEffect } from 'react';
import { Check, Shield, Award, Clock, MapPin, Bus } from 'lucide-react';
import LandingLayout from '@/components/landing/LandingLayout';
import LeadForm from '@/components/landing/LeadForm';
import StickyCTA from '@/components/landing/StickyCTA';
import ExitIntentPopup from '@/components/landing/ExitIntentPopup';
import ComparisonSection from '@/components/landing/ComparisonSection';
import Testimonials from '@/components/landing/Testimonials';
import ItineraryTimeline from '@/components/landing/ItineraryTimeline';
import RouteAnimation from '@/components/landing/RouteAnimation';
import { trackViewContent } from '@/lib/pixel';
import { Button } from '@/components/ui/button';
import { config } from '@/config';
import { buildTouristTripJsonLd } from '@/components/seo/JsonLd';

import { Link } from 'react-router-dom';

const CharDhamRoad = () => {
  const packageName = "Char Dham Road Yatra (9N/10D)";
  const price = 28500;
  const baseUrl = config.baseUrl;
  const canonicalUrl = `${baseUrl}/landing/char-dham-road`;

  useEffect(() => {
    trackViewContent(packageName, 'char-dham-road-landing', price, 'INR');
  }, []);

  const highlights = [
    "Complete Char Dham Yatra by Road",
    "Haridwar to Haridwar Transport included",
    "Deluxe Hotels with Breakfast & Dinner",
    "Yatra Registration & Permits included",
    "Professional Tour Guide",
    "Group & Private options available"
  ];

  const itinerary = [
    { day: 1, title: "Haridwar to Barkot", desc: "Pick up from Haridwar. Drive to Barkot via Mussoorie. Visit Kempty Falls. Overnight stay at Barkot." },
    { day: 2, title: "Barkot to Yamunotri to Barkot", desc: "Drive to Jankichatti. Trek to Yamunotri (6km). Darshan and Pooja. Return to Barkot for overnight stay." },
    { day: 3, title: "Barkot to Uttarkashi", desc: "Drive to Uttarkashi. Visit Vishwanath Temple. Check-in at hotel. Overnight stay at Uttarkashi." },
    { day: 4, title: "Uttarkashi to Gangotri to Uttarkashi", desc: "Drive to Gangotri. Holy dip in Ganges and Darshan. Return to Uttarkashi. Enroute visit Harsil Valley." },
    { day: 5, title: "Uttarkashi to Guptkashi", desc: "Drive to Guptkashi via Tehri Dam. View Mandakini river. Check-in at hotel. Overnight stay at Guptkashi." },
    { day: 6, title: "Guptkashi to Kedarnath", desc: "Drive to Sonprayag. Trek to Kedarnath (19km). Evening Aarti. Overnight stay at Kedarnath (Govt. Camps/Lodges)." },
    { day: 7, title: "Kedarnath to Guptkashi", desc: "Morning Darshan. Trek down to Sonprayag. Drive back to Guptkashi. Overnight stay at Guptkashi." },
    { day: 8, title: "Guptkashi to Badrinath", desc: "Drive to Badrinath via Joshimath. Check-in at hotel. Evening Aarti at Badrinath Temple. Overnight stay." },
    { day: 9, title: "Badrinath to Rudraprayag", desc: "Morning Darshan and Mana Village tour. Drive to Rudraprayag/Srinagar. Overnight stay." },
    { day: 10, title: "Rudraprayag to Haridwar", desc: "Drive back to Haridwar. Visit Rishikesh Ram Jhula/Laxman Jhula if time permits. Drop at Haridwar Railway Station." }
  ];

  const structuredData = buildTouristTripJsonLd({
    name: "Char Dham Yatra Road Package 2026",
    description: "9 Nights 10 Days Char Dham Yatra by Road 2026. Includes Haridwar pickup, deluxe hotels, meals, and permits.",
    url: canonicalUrl,
    image: ["/Badrinath.png"],
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

  return (
    <LandingLayout 
      title="Char Dham Yatra from Delhi 2026 | 10-12 Day Road Packages" 
      description="Affordable Char Dham Yatra packages from Delhi & Haridwar. Includes comfortable transport, accommodation, meals, guide & yatra registration."
      robots="index, follow"
      canonical={canonicalUrl}
      structuredData={structuredData}
    >
      <ExitIntentPopup packageName={packageName} />
      <StickyCTA />

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          >
            <source src="/Kedarnath Video.mp4" type="video/mp4" />
            <img 
              src="/Badrinath.png" 
              alt="Char Dham Yatra 2026 Road Trip" 
              className="w-full h-full object-cover opacity-40"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80'; }} 
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1 text-orange-300 text-sm font-medium">
                <Bus size={16} /> Best Selling 2026 Road Package
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Char Dham Yatra 2026 <span className="text-orange-400">Road Package</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-xl">
                The most authentic way to experience the Himalayas in 2026. 10 Days of spirituality, nature, and devotion. Starting from Haridwar/Delhi.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Check className="text-green-400" size={20} /> All Meals Included
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Check className="text-green-400" size={20} /> Deluxe Hotels
                </div>
                <div className="flex items-center gap-2 text-sm md:text-base">
                  <Check className="text-green-400" size={20} /> 24/7 Assistance
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-accent hover:bg-accent/90 text-white text-lg px-8 py-6 rounded-lg shadow-lg shadow-orange-600/30"
                >
                  Get Detailed Itinerary
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="text-orange-400" /> Best Price Guarantee
                </div>
              </div>
            </div>

            <div className="w-full md:w-[400px]" id="lead-form">
              <LeadForm packageName={packageName} />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-70">
            <div className="flex items-center gap-2 font-bold text-lg"><Shield /> Verified Hotels</div>
            <div className="flex items-center gap-2 font-bold text-lg"><Award /> Experienced Drivers</div>
            <div className="flex items-center gap-2 font-bold text-lg"><Clock /> On-time Service</div>
          </div>
        </div>
      </section>

      {/* Highlights & Itinerary Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Experience the Divine Path</h2>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-12">
                {highlights.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="mt-1 bg-accent/10 p-1 rounded-full text-accent">
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <p className="font-medium text-gray-700">{item}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-3xl font-bold mb-8 text-gray-900">Complete Itinerary</h2>
              <ItineraryTimeline days={itinerary} />

              <div className="mt-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-2">What is the best time for Gangotri Yamunotri yatra?</h3>
                    <p className="text-gray-700">The ideal time is May-June and September-October. Our package ensures comfortable travel during these peak months.</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-2">Do you include registration in the Kedarnath Badrinath package?</h3>
                    <p className="text-gray-700">Yes, we handle all Yatra biometric registrations and temple permits so you can focus on your spiritual journey.</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-2">What about helicopter options?</h3>
                    <p className="text-gray-700">This is a road package. If you prefer a quicker journey, check our <Link to="/landing/char-dham-helicopter" className="text-blue-600 hover:underline">helicopter yatra package</Link>.</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-2">What essentials should I pack?</h3>
                    <p className="text-gray-700">Warm woolens, comfortable trekking shoes, raincoat, personal medicines, and a power bank are essential.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-[400px]">
               {/* Route Animation */}
               <div className="mb-8">
                 <RouteAnimation />
               </div>

               {/* Image Grid */}
               <div className="grid grid-cols-2 gap-4 mb-8 sticky top-24">
                 <img src="https://images.unsplash.com/photo-1589828952858-a024255502c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" className="rounded-xl shadow-md w-full h-48 object-cover col-span-2" alt="Himalayan Road" />
                 <img src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" className="rounded-xl shadow-md w-full h-32 object-cover" alt="Temple" />
                 <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" className="rounded-xl shadow-md w-full h-32 object-cover" alt="Trek" />
                 
                 <div className="col-span-2 bg-accent/5 p-6 rounded-xl border border-accent/20">
                    <h3 className="font-bold text-orange-900 mb-2">Group Departures Available</h3>
                    <p className="text-sm text-accent mb-4">Join our fixed departure groups from Delhi/Haridwar and save more!</p>
                    <Button 
                      onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full bg-accent hover:bg-accent/90"
                    >
                      View Departure Dates
                    </Button>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      <ComparisonSection />

      <Testimonials />

      {/* Final CTA */}
      <section className="py-16 bg-gray-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Spiritual Journey</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Limited seats for May-June 2026 batch. Book now to secure best hotels.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
            >
              Get Free Quote
            </Button>
            <a 
               href="tel:+919910987264"
               className="inline-flex items-center justify-center bg-transparent border border-white hover:bg-white/10 text-white text-lg px-8 py-4 rounded-lg font-medium transition-colors"
            >
              Talk to Expert
            </a>
          </div>
        </div>
      </section>

    </LandingLayout>
  );
};

export default CharDhamRoad;
