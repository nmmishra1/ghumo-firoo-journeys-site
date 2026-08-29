import { config } from '@/config';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, ShieldCheck } from 'lucide-react';
import EnhancedRouteMap from '@/components/packages/EnhancedRouteMap';
import DetailedItinerary from '@/components/packages/DetailedItinerary';
import FAQSection from '@/components/sections/FAQSection';
import FlightRouteMap from '@/components/packages/FlightRouteMap';
import PackageSidebar from '@/components/packages/PackageSidebar';
import ModernPackageHero from '@/components/packages/ModernPackageHero';
import PackageSEO from '@/components/seo/PackageSEO';
import { buildTouristTripJsonLd } from '@/components/seo/JsonLd';
import keywordMapping from '@/content/seo/keyword-mapping.json';

const SingaporeCityDelight = () => {
  const baseUrl = config.baseUrl;
  const canonical = `${baseUrl}/packages/singapore-city-delight`;

  const packageDetails = {
    title: "5-Day Singapore City Delight with Ibis Novena",
    duration: "5 Days / 4 Nights",
    price: usePackagePrice('singapore-city-delight', 59999),
    rating: 4.8,
    reviews: 132,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=600&fit=crop",
    destinations: ['Singapore', 'Sentosa Island'],
    highlights: [
      "Stay at Ibis Novena Singapore (4 Nights)",
      "Universal Studios Singapore full-day experience",
      "Night Safari with private transfers",
      "Sentosa Island: Cable Car, Wings of Time show",
      "Gardens by the Bay with Supertree Grove",
      "Singapore Panoramic Drive city highlights",
      "All airport and attraction transfers by private vehicle"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Singapore – Private Transfer to Ibis Novena",
        description:
          "Arrive in Singapore and enjoy a seamless evening transfer from Changi Airport to your centrally located hotel, Ibis Novena.",
        activities: [
          "Arrival at Changi Airport (evening)",
          "7:55 PM – Private pickup from Changi Airport (PVT)",
          "Drive through Singapore city lights en route to hotel",
          "Check-in at Ibis Novena Singapore",
          "Rest and overnight stay at hotel"
        ]
      },
      {
        day: 2,
        title: "Universal Studios & Night Safari Combo",
        description:
          "Thrilling day at Universal Studios Singapore followed by a unique nocturnal experience at Night Safari, with all transfers by private vehicle.",
        activities: [
          "Breakfast at Ibis Novena",
          "10:00 AM – Private transfer from hotel to Universal Studios (PVT)",
          "Full-day access to Universal Studios Singapore with included entry tickets",
          "Explore themed zones and enjoy rides and shows",
          "Late afternoon break / freshen up",
          "5:30 PM – Private transfer from Universal Studios to Night Safari (PVT)",
          "Guided tram ride and walking trails at Night Safari (entry tickets included)",
          "9:30 PM – Private transfer back to hotel (PVT)",
          "Overnight stay at Ibis Novena"
        ]
      },
      {
        day: 3,
        title: "Sentosa Island: Cable Car & Wings of Time",
        description:
          "Relaxed morning followed by a fun-filled afternoon and evening at Sentosa Island, including cable car rides and the iconic Wings of Time show.",
        activities: [
          "Breakfast at Ibis Novena and free time in the morning",
          "2:00 PM – Private transfer from hotel to Sentosa Island (PVT)",
          "Scenic Cable Car ride to Sentosa (tickets included)",
          "Free time to explore Sentosa attractions and beaches",
          "7:00 PM – Wings of Time evening show (standard seat tickets included)",
          "8:30 PM – Private transfer back to hotel (PVT)",
          "Overnight stay at Ibis Novena"
        ]
      },
      {
        day: 4,
        title: "Panoramic City Drive & Gardens by the Bay",
        description:
          "Discover Singapore’s skyline and landmarks on a panoramic drive, followed by an immersive visit to Gardens by the Bay.",
        activities: [
          "Breakfast at Ibis Novena",
          "Relaxed morning at leisure",
          "12:00 PM – Singapore Panoramic Drive in private vehicle (PVT)",
          "Photo stops at Merlion Park, Marina Bay Sands, and Esplanade (from outside)",
          "Visit to Gardens by the Bay (Conservatories / Supertrees – tickets included)",
          "Evening free for shopping at Orchard Road or Clarke Quay (on own)",
          "Return to Ibis Novena and overnight stay"
        ]
      },
      {
        day: 5,
        title: "Departure – Early Morning Airport Transfer",
        description:
          "Conclude your Singapore holiday with an early morning private transfer back to Changi Airport.",
        activities: [
          "Early checkout from Ibis Novena",
          "5:00 AM – Private departure transfer from hotel to Changi Airport (PVT)",
          "Arrive at airport in time for your onward flight",
          "Tour ends with wonderful memories of Singapore"
        ]
      }
    ],
    inclusions: [
      "4 nights stay at Ibis Novena Singapore (or similar)",
      "Daily breakfast at hotel",
      "All airport and attraction transfers by private vehicle (PVT)",
      "Universal Studios Singapore full-day entry ticket",
      "Night Safari entry ticket with tram ride",
      "Sentosa Cable Car ride ticket",
      "Wings of Time show ticket",
      "Gardens by the Bay entry ticket (as per variant)",
      "All applicable taxes and service charges"
    ],
    exclusions: [
      "International and domestic airfare",
      "Visa fees and travel insurance",
      "Meals other than those specified",
      "Personal expenses, tips, and porterage",
      "Optional tours and activities not mentioned"
    ]
  };

  const transfers = [
    { day: 1, label: "Airport → Ibis Novena", time: "19:55", type: "arrival" as const },
    { day: 2, label: "Hotel → Universal Studios", time: "10:00", type: "activity" as const },
    { day: 2, label: "Universal Studios → Night Safari", time: "17:30", type: "activity" as const },
    { day: 2, label: "Night Safari → Hotel", time: "21:30", type: "return" as const },
    { day: 3, label: "Hotel → Sentosa Island", time: "14:00", type: "activity" as const },
    { day: 3, label: "Sentosa Island → Hotel", time: "20:30", type: "return" as const },
    { day: 4, label: "Hotel → City Drive / Gardens by the Bay", time: "12:00", type: "activity" as const },
    { day: 5, label: "Hotel → Airport", time: "05:00", type: "departure" as const }
  ];

  const attractions = [
    { id: "universal", name: "Universal Studios Singapore", day: 2, time: "10:00" },
    { id: "night-safari", name: "Night Safari", day: 2, time: "18:30" },
    { id: "sentosa-cable-car", name: "Sentosa Cable Car", day: 3, time: "14:30" },
    { id: "wings-of-time", name: "Wings of Time Show", day: 3, time: "19:00" },
    { id: "gardens-by-the-bay", name: "Gardens by the Bay", day: 4, time: "15:00" }
  ];

  const validateSchedule = () => {
    const errors: string[] = [];

    const seenTransfers = new Set<string>();
    for (const t of transfers) {
      const key = `${t.day}-${t.time}`;
      if (seenTransfers.has(key)) {
        errors.push(`Overlapping transfer at Day ${t.day}, ${t.time} for ${t.label}`);
      } else {
        seenTransfers.add(key);
      }
    }

    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const byDay: Record<number, { time: number; label: string }[]> = {};
    transfers.forEach(t => {
      const tm = timeToMinutes(t.time);
      if (!byDay[t.day]) byDay[t.day] = [];
      byDay[t.day].push({ time: tm, label: t.label });
    });

    Object.entries(byDay).forEach(([dayStr, items]) => {
      const day = Number(dayStr);
      const sorted = items.sort((a, b) => a.time - b.time);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].time - sorted[i - 1].time < 30) {
          errors.push(
            `Tight transfer window on Day ${day} between "${sorted[i - 1].label}" and "${sorted[i].label}".`
          );
        }
      }
    });

    const seenAttractions = new Set<string>();
    for (const a of attractions) {
      const key = `${a.day}-${a.time}-${a.id}`;
      if (seenAttractions.has(key)) {
        errors.push(`Duplicate attraction slot for ${a.name} on Day ${a.day} at ${a.time}.`);
      } else {
        seenAttractions.add(key);
      }
    }

    return errors;
  };

  const transferConflicts = validateSchedule();

  const mapLocations = [
    { name: 'Changi Airport', coordinates: [1.3644, 103.9915] as [number, number], description: 'Singapore Changi Airport (SIN)' },
    { name: 'Ibis Novena Singapore', coordinates: [1.3276, 103.8439] as [number, number], description: 'Hotel Ibis Novena Singapore' },
    { name: 'Universal Studios Singapore', coordinates: [1.2540, 103.8238] as [number, number], description: 'Resorts World Sentosa' },
    { name: 'Night Safari', coordinates: [1.4043, 103.7930] as [number, number], description: 'Singapore Night Safari' },
    { name: 'Sentosa Island', coordinates: [1.2494, 103.8303] as [number, number], description: 'Sentosa Island attractions' },
    { name: 'Gardens by the Bay', coordinates: [1.2816, 103.8636] as [number, number], description: 'Nature park with Supertrees and conservatories' }
  ];

  const flightRoutes = [
    { from: 'Delhi (DEL)', to: 'Singapore (SIN)', duration: '5h 30m' },
    { from: 'Mumbai (BOM)', to: 'Singapore (SIN)', duration: '5h 45m' }
  ];

  const perPersonPrice = packageDetails.price;
  const basePassengers = 2;
  const totalPriceForTwo = perPersonPrice * basePassengers;

  const kd = (keywordMapping as any)?.singapore_malaysia;
  const metaKeywords = kd
    ? [...(kd.primary_keywords || []), ...(kd.secondary_keywords || [])].join(', ')
    : undefined;

  const touristTripJson = buildTouristTripJsonLd({
    name: packageDetails.title,
    description:
      "5-Day Singapore tour with Ibis Novena, Universal Studios, Night Safari, Sentosa Island, Gardens by the Bay, and private transfers.",
    url: canonical,
    image: [packageDetails.image],
    itinerary: packageDetails.itinerary.map(item => ({
      position: item.day,
      name: item.title,
      description: item.description
    })),
    offer: {
      priceCurrency: 'INR',
      includes:
        'Hotel stay, breakfast, private transfers, attraction tickets (Universal Studios, Night Safari, Sentosa Cable Car, Wings of Time, Gardens by the Bay)',
      price: String(packageDetails.price),
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0]
    },
    providerName: 'Ghumo Firoo Travels',
    duration: 'P5D'
  });

  const faqsArray = [
    { 
      question: 'Is this package customizable?', 
      answer: 'Yes, we can customize this package by upgrading the hotel, adding more days, or including specific attractions like the Singapore Zoo or River Wonders. Contact our experts for a personalized quote.' 
    },
    { 
      question: 'What is the best time to visit Singapore?', 
      answer: 'Singapore is a year-round destination. However, the best time to visit is during the dry season between February and April. For shoppers, June-July is great for the Great Singapore Sale.' 
    },
    { 
      question: 'Are transfers private or shared?', 
      answer: 'In this "Delight" package, all airport and attraction transfers are on a private basis (PVT), ensuring comfort and fixed-time pickups without waiting for other travelers.' 
    },
    { 
      question: 'Do I need a visa for Singapore?', 
      answer: 'Yes, Indian citizens require a visa to enter Singapore. We provide full assistance with the application process, which typically takes 3-5 working days.' 
    }
  ];

  return (
    <Layout>
      <PackageSEO
        title="5-Day Singapore Package: Universal Studios, Night Safari, Sentosa (PVT)"
        description="Singapore City Delight with Ibis Novena stay. Timed entries for Universal Studios, Night Safari, Sentosa Cable Car, Wings of Time, Gardens by the Bay. All private transfers."
        canonical={canonical}
        images={[packageDetails.image]}
        price={packageDetails.price}
        rating={packageDetails.rating}
        reviews={packageDetails.reviews}
        keywords={metaKeywords}
        structuredData={touristTripJson}
        geo={{
          region: 'SG',
          placename: 'Singapore',
          position: '1.3521;103.8198',
          icbm: '1.3521,103.8198',
          latitude: '1.3521',
          longitude: '103.8198',
        }}
      />

      <ModernPackageHero
        title={packageDetails.title}
        duration={packageDetails.duration}
        price={`Starting from ₹${packageDetails.price.toLocaleString()}*`}
        destinations={packageDetails.destinations}
        rating={packageDetails.rating}
        reviews={packageDetails.reviews}
        images={[packageDetails.image]}
        packageType="international"
        highlights={packageDetails.highlights}
        bestTime="Year round"
        groupSize="2-10 People"
        difficulty="Easy"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle as="h2" className="flex items-center gap-2 text-2xl">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  Why Choose This Singapore Package
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  This 5-day Singapore itinerary is designed for families and couples who want
                  a balanced mix of theme parks, nature, and city highlights with hassle-free
                  private transfers and confirmed attraction tickets.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Central stay at Ibis Novena Singapore for all 4 nights</li>
                  <li>All transfers on private basis (PVT) with fixed-time pickups</li>
                  <li>Confirmed attraction tickets with clearly defined time slots</li>
                  <li>Optimised sequence to avoid backtracking and minimise fatigue</li>
                </ul>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-semibold">Indicative price for 2 adults:</span>{' '}
                  ₹{totalPriceForTwo.toLocaleString()} (subject to travel dates and availability)
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle as="h2" className="flex items-center gap-2 text-2xl">
                  <Calendar className="w-5 h-5 text-accent" />
                  Day-wise Itinerary & Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DetailedItinerary itinerary={packageDetails.itinerary} />

                <div className="mt-8 space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>
                      All attraction tickets are tied to their respective time slots as listed
                      in the itinerary (subject to supplier confirmation).
                    </span>
                  </div>
                  {transferConflicts.length === 0 && (
                    <div className="text-green-700">
                      Current transfer schedule has no overlapping time conflicts.
                    </div>
                  )}
                  {transferConflicts.length > 0 && (
                    <ul className="text-red-600 list-disc list-inside">
                      {transferConflicts.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle as="h2" className="flex items-center gap-2 text-2xl">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Route Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <EnhancedRouteMap
                  locations={mapLocations}
                  totalDistance="~80 KM (within city)"
                  routeHighlights="Changi Airport → Ibis Novena → Sentosa → Night Safari → Gardens by the Bay"
                  mapTitle="Singapore City Route Map"
                />
                <FlightRouteMap
                  routes={flightRoutes}
                  title="Popular Flight Routes to Singapore"
                  subtitle="Direct and one-stop connections from major Indian cities to Singapore (SIN)."
                />
              </CardContent>
            </Card>

            <FAQSection 
              faqs={faqsArray} 
              title="Singapore Trip FAQs"
              subtitle="Everything you need to know about your Singapore city break."
              className="py-8 bg-transparent"
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-[88px] space-y-6">
              <PackageSidebar
                packageDetails={{
                  title: packageDetails.title,
                  duration: packageDetails.duration,
                  price: `₹${packageDetails.price.toLocaleString()}`,
                  rating: packageDetails.rating,
                  reviews: packageDetails.reviews,
                  highlights: packageDetails.highlights,
                  inclusions: packageDetails.inclusions,
                  itinerary: packageDetails.itinerary.map(item => ({
                    day: item.day,
                    title: item.title,
                    description: item.description
                  })),
                  image: packageDetails.image
                }}
                packageType="international"
                destination="Singapore"
                quickFacts={{
                  groupSize: "2-10 People",
                  bestTime: "Year round",
                  difficulty: "Easy",
                  ageLimit: "All ages",
                  accommodation: "Ibis Novena or similar",
                  meals: "Daily breakfast",
                  transport: "Private vehicle transfers (PVT)"
                }}
              />

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle as="h2" className="text-lg font-semibold text-gray-800">
                    Hotel Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Hotel:</span> Ibis Novena Singapore (or similar)
                  </p>
                  <p>
                    <span className="font-semibold">Location:</span> Near Novena MRT, with easy
                    access to Orchard Road and Marina Bay.
                  </p>
                  <p>
                    <span className="font-semibold">Room Type:</span> Standard Room with modern
                    amenities, Wi‑Fi and daily housekeeping.
                  </p>
                </CardContent>
              </Card>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Visa Assistance
                </h3>
                <p className="text-sm text-blue-800">
                  We provide complete assistance for Singapore visa. Our success rate is 99% for families and couples.
                  Apply at least 2–3 weeks before departure for smooth processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SingaporeCityDelight;

