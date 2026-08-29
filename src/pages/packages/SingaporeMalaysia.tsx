import { config } from '@/config';
import { usePackagePrice } from '@/hooks/usePackagePrice';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ShieldCheck } from 'lucide-react';
import EnhancedRouteMap from '@/components/packages/EnhancedRouteMap';
import DetailedItinerary from '@/components/packages/DetailedItinerary';
import FlightRouteMap from '@/components/packages/FlightRouteMap';
import PackageSidebar from '@/components/packages/PackageSidebar';
import EnhancedBrochureDownload from '@/components/packages/EnhancedBrochureDownload';
import ModernPackageHero from '@/components/packages/ModernPackageHero';
import keywordMapping from '@/content/seo/keyword-mapping.json';
import { buildTouristTripJsonLd } from '@/components/seo/JsonLd';
import PackageSEO from '@/components/seo/PackageSEO';
import FAQSection from '@/components/sections/FAQSection';

const SingaporeMalaysia = () => {
  const baseUrl = config.baseUrl;
  const canonical = `${baseUrl}/packages/singapore-malaysia`;

  const mapLocations = [
    { name: 'Singapore', coordinates: [1.3521, 103.8198] as [number, number], description: 'Modern city-state with iconic skyline' },
    { name: 'Sentosa Island', coordinates: [1.2494, 103.8303] as [number, number], description: 'Resort island with Universal Studios' },
    { name: 'Kuala Lumpur', coordinates: [3.1390, 101.6869] as [number, number], description: 'Malaysian capital with Petronas Towers' },
    { name: 'Genting Highlands', coordinates: [3.4227, 101.7933] as [number, number], description: 'Hill resort with casinos and theme parks' },
    { name: 'Kuala Lumpur', coordinates: [3.1390, 101.6869] as [number, number], description: 'Return for departure' }
  ];

  const flightRoutes = [
    { from: 'Delhi (DEL)', to: 'Singapore (SIN)', duration: '5h 30m' },
    { from: 'Mumbai (BOM)', to: 'Singapore (SIN)', duration: '5h 45m' },
    { from: 'Bangalore (BLR)', to: 'Singapore (SIN)', duration: '4h 15m' },
    { from: 'Chennai (MAA)', to: 'Singapore (SIN)', duration: '3h 45m' },
    { from: 'Kolkata (CCU)', to: 'Singapore (SIN)', duration: '4h 30m' },
    { from: 'Hyderabad (HYD)', to: 'Singapore (SIN)', duration: '5h 00m' }
  ];

  const virtualTourData = {
    destination: 'Singapore & Malaysia',
    tourStops: [
      {
        id: '1',
        title: "Marina Bay Sands & Merlion Park",
        description: "Experience Singapore's iconic skyline with the famous Merlion statue and the architectural marvel of Marina Bay Sands. Enjoy panoramic city views from the SkyPark observation deck.",
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=600&fit=crop",
        duration: "2-3 hours",
        highlights: ["Merlion Park photo opportunities", "Marina Bay Sands SkyPark", "Gardens by the Bay views", "Singapore Flyer nearby"],
        coordinates: { lat: 1.2868, lng: 103.8545 },
        bestTime: "Evening for stunning sunset views",
        tips: ["Visit during blue hour for the best photography lighting"]
      },
      {
        id: '2',
        title: "Sentosa Island & Universal Studios",
        description: "Explore Singapore's premier island resort destination featuring Universal Studios theme park, beautiful beaches, and the spectacular Wings of Time multimedia show.",
        image: "https://images.unsplash.com/photo-1555217851-6141535bd771?ixlib=rb-4.0.3",
        duration: "Full day",
        highlights: ["Universal Studios Singapore", "S.E.A. Aquarium", "Siloso Beach", "Wings of Time show"],
        coordinates: { lat: 1.2494, lng: 103.8303 },
        bestTime: "Early morning to avoid crowds",
        tips: ["Purchase express passes for popular rides during peak season"]
      },
      {
        id: '3',
        title: "Singapore Night Safari",
        description: "Embark on a unique nocturnal adventure at the world's first night zoo. Observe over 2,500 animals from 130 species in their natural nighttime habitat.",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3",
        duration: "3-4 hours",
        highlights: ["Tram safari tour", "Walking trails", "Animal shows", "Fire show performance"],
        coordinates: { lat: 1.4043, lng: 103.7930 },
        bestTime: "7:30 PM onwards",
        tips: ["Book tram tickets in advance and bring insect repellent"]
      },
      {
        id: '4',
        title: "Kuala Lumpur & Petronas Towers",
        description: "Discover Malaysia's vibrant capital city dominated by the iconic Petronas Twin Towers. Explore the bustling streets, diverse culture, and modern architecture.",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3",
        duration: "Half day",
        highlights: ["Petronas Twin Towers", "KLCC Park", "Bukit Bintang shopping", "Local street food"],
        coordinates: { lat: 3.1578, lng: 101.7123 },
        bestTime: "Evening for tower illumination",
        tips: ["Book SkyBridge tickets online in advance"]
      },
      {
        id: '5',
        title: 'Batu Caves',
        description: "Climb the famous 272 colorful steps to reach this sacred Hindu temple complex housed within limestone caves. Marvel at the towering golden statue of Lord Murugan.",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3",
        duration: "2-3 hours",
        highlights: ["272 rainbow steps", "Lord Murugan statue", "Temple Cave", "Dark Cave tour"],
        coordinates: { lat: 3.2379, lng: 101.6840 },
        bestTime: "Early morning to avoid heat",
        tips: ["Dress modestly and watch out for monkeys"]
      },
      {
        id: '6',
        title: "Genting Highlands Resort",
        description: "Escape to the cool mountain air of this premier hill resort. Enjoy casino entertainment, theme parks, and breathtaking cable car rides through the clouds.",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3",
        duration: "Full day",
        highlights: ["Awana Skyway cable car", "SkyAvenue shopping", "Theme park rides", "Cool mountain climate"],
        coordinates: { lat: 3.4227, lng: 101.7933 },
        bestTime: "Clear weather days",
        tips: ["Bring warm clothing as temperatures can drop significantly"]
      }
    ]
  };

  const packageDetails = {
    title: "7-Day Singapore & Malaysia Twin Delight",
    duration: "7 Days / 6 Nights",
    price: usePackagePrice('singapore-malaysia', 85000),
    rating: 4.8,
    reviews: 198,
    image: "https://images.unsplash.com/photo-1570197781495-41e62f6c46f7?w=1200&h=600&fit=crop",
    destinations: ['Singapore', 'Sentosa Island', 'Kuala Lumpur', 'Genting Highlands', 'Batu Caves'],
    highlights: [
      "Singapore City tour with iconic Marina Bay Sands and Merlion Park",
      "Night Safari experience with nocturnal wildlife encounters",
      "Sentosa Island adventure with Universal Studios Singapore",
      "Kuala Lumpur city exploration including Petronas Twin Towers",
      "Sacred Batu Caves temple complex with 272 colorful steps",
      "Genting Highlands hill resort with cable car rides and entertainment",
      "Professional English-speaking guides throughout the journey",
      "Luxury 4-star hotel accommodations in prime locations"
    ],
    itinerary: [
      { 
        day: 1, 
        title: "Arrival in Singapore - Night Safari", 
        description: "Welcome to the Lion City! Experience the world's first nocturnal zoo adventure.", 
        activities: [
            "Arrival at Changi Airport and private transfer to hotel",
            "Check-in at luxury 4-star hotel",
            "Evening pickup for Night Safari adventure",
            "Tram ride through 6 geographical zones",
            "Creatures of the Night Show",
            "Return to hotel for overnight stay"
        ]
      },
      { 
        day: 2, 
        title: "Singapore City Tour & Marina Bay", 
        description: "Explore the iconic landmarks of Singapore including the Merlion and Marina Bay Sands.", 
        activities: [
            "Half-day city tour with professional guide",
            "Photo stop at Merlion Park",
            "Visit Thian Hock Keng Temple and Chinatown",
            "Explore Little India's vibrant streets",
            "Visit National Orchid Garden (optional)",
            "Evening visit to Marina Bay Sands SkyPark (optional)",
            "Overnight stay in Singapore"
        ]
      },
      { 
        day: 3, 
        title: "Sentosa Island Experience", 
        description: "A day of fun and sun at Asia's favorite playground, Sentosa Island.", 
        activities: [
            "One-way Cable Car ride into Sentosa",
            "Visit S.E.A. Aquarium - one of the world's largest",
            "Relax at Siloso Beach",
            "Madame Tussauds Museum visit",
            "Spectacular Wings of Time light and sound show",
            "Return transfer to hotel"
        ]
      },
      { 
        day: 4, 
        title: "Universal Studios Singapore", 
        description: "Experience the magic of movies at Southeast Asia's first Hollywood movie theme park.", 
        activities: [
            "Full day pass to Universal Studios Singapore",
            "Experience 24 rides and attractions",
            "Meet favorite characters from movies",
            "Transformers: The Ride 3D",
            "Jurassic Park Rapids Adventure",
            "Revenge of the Mummy indoor coaster"
        ]
      },
      { 
        day: 5, 
        title: "Singapore to Kuala Lumpur", 
        description: "Journey to Malaysia's vibrant capital city.", 
        activities: [
            "Breakfast and hotel check-out",
            "Luxury coach transfer to Kuala Lumpur (approx. 5-6 hours)",
            "Scenic drive crossing the border",
            "Arrival in Kuala Lumpur and hotel check-in",
            "Evening at leisure to explore Bukit Bintang",
            "Overnight stay in Kuala Lumpur"
        ]
      },
      { 
        day: 6, 
        title: "Kuala Lumpur City Tour & Batu Caves", 
        description: "Discover the charm of KL with its towering skyscrapers and cultural landmarks.", 
        activities: [
            "Morning city tour of Kuala Lumpur",
            "Photo stop at Petronas Twin Towers",
            "Visit King's Palace and National Monument",
            "Explore the National Mosque and Independence Square",
            "Visit the famous Batu Caves and Lord Murugan statue",
            "Shopping at Chocolate Boutique",
            "Overnight stay in Kuala Lumpur"
        ]
      },
      { 
        day: 7, 
        title: "Genting Highlands & Departure", 
        description: "A trip to the City of Entertainment above the clouds before your flight home.", 
        activities: [
            "Day trip to Genting Highlands",
            "Two-way cable car ride",
            "Visit Chin Swee Caves Temple",
            "Free time at majestic Genting indoor/outdoor theme parks",
            "Visit Snow World (optional)",
            "Transfer to Kuala Lumpur Airport (KLIA)",
            "Departure with wonderful memories"
        ]
      }
    ],
    inclusions: [
      "Hotel accommodation in Singapore and KL",
      "Daily breakfast and 2 lunches",
      "All entry tickets as per itinerary",
      "Transfers and sightseeing in AC coach",
      "English-speaking guide",
      "Visa assistance and airport transfers"
    ],
    exclusions: [
      "International airfares",
      "Visa fees (actuals)",
      "Meals not mentioned in itinerary",
      "Travel insurance",
      "Personal expenses and tips"
    ]
  };

  const breadcrumbs = [
    { name: 'Home', item: '/' },
    { name: 'Packages', item: '/packages' },
    { name: 'Singapore Malaysia', item: '/packages/singapore-malaysia' }
  ];

  const description = "Best Singapore & Malaysia Tour Package 2026. 7 Days in Marina Bay Sands, Universal Studios, Petronas Towers & Genting. Includes hotels, breakfast, transfers & tours.";

  const kd = (keywordMapping as any)?.singapore_malaysia;
  const metaKeywords = kd ? [...(kd.primary_keywords || []), ...(kd.secondary_keywords || [])].join(', ') : undefined;
  
  const faqsArray = [
    { 
      question: 'Do Indians need a visa for Singapore and Malaysia in 2026?', 
      answer: 'Yes, Indian citizens need separate visas for both countries. Singapore requires a sticker visa (processed in 3-5 days), while Malaysia usually offers an e-visa (processed in 24-48 hours). We provide complete assistance for both.' 
    },
    { 
      question: 'What is the travel time between Singapore and Kuala Lumpur?', 
      answer: 'By luxury coach, it takes approximately 5-6 hours including border immigration. The journey is very comfortable with scenic views of palm plantations. We use premium coaches with reclining seats.' 
    },
    { 
      question: 'Is this package suitable for families with young children?', 
      answer: 'Absolutely! This is our most popular family package. With Universal Studios, S.E.A. Aquarium, and Genting Highlands theme parks, children have plenty of entertainment options while adults enjoy the sightseeing and shopping.' 
    },
    { 
      question: 'Which is the best month to visit Singapore and Malaysia?', 
      answer: 'December to February is the peak season with pleasant weather. However, Singapore is a year-round destination. June to August is also great as it coincides with the Great Singapore Sale and school holidays.' 
    }
  ];

  const jsonLd = buildTouristTripJsonLd({
    name: "7-Day Singapore & Malaysia Twin Delight 2026",
    description,
    url: canonical,
    image: [packageDetails.image],
    offer: {
      priceCurrency: 'INR',
      includes: 'Hotels, Breakfast, Transfers, Sightseeing, Visa Assistance',
      price: String(packageDetails.price),
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0],
      validThrough: '2026-12-31',
      priceValidUntil: '2026-11-30',
      eligibleQuantity: { value: 20, unitCode: 'C62' },
      acceptedPaymentMethod: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI']
    },
    itinerary: packageDetails.itinerary.map(day => ({
      position: day.day,
      name: day.title,
      description: day.activities.join('. ')
    })),
    destination: {
      name: "Singapore & Malaysia",
      address: "Southeast Asia"
    },
    aggregateRating: {
      ratingValue: packageDetails.rating,
      reviewCount: packageDetails.reviews
    }
  });

  return (
    <Layout>
      <PackageSEO
        title="Singapore & Malaysia Tour Package 2026 | Twin Delight"
        description={description}
        keywords={metaKeywords}
        canonical={canonical}
        structuredData={jsonLd}
        price={Number(packageDetails.price.replace(/,/g, ''))}
        rating={packageDetails.rating}
        reviews={packageDetails.reviews}
        breadcrumbs={breadcrumbs}
        faqs={faqsArray}
        skipProductSchema={true}
        images={[packageDetails.image]}
        geo={{
          region: 'SG',
          placename: 'Singapore',
          position: '1.3521;103.8198',
          icbm: '1.3521,103.8198',
          latitude: '1.3521',
          longitude: '103.8198',
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Modern Hero Section */}
        <ModernPackageHero
          title={packageDetails.title}
          duration={packageDetails.duration}
          price={`Starting from ₹${packageDetails.price.toLocaleString()}*`}
          destinations={packageDetails.destinations}
          rating={packageDetails.rating}
          reviews={packageDetails.reviews}
          images={[
            "https://images.unsplash.com/photo-1570197781495-41e62f6c46f7?ixlib=rb-4.0.3",
            "https://images.unsplash.com/photo-1555217851-6141535bd771?ixlib=rb-4.0.3",
            "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?ixlib=rb-4.0.3"
          ]}
          packageType="international"
          highlights={packageDetails.highlights}
          bestTime="November to February"
          groupSize="2-20 People"
          difficulty="Easy"
          virtualTourData={virtualTourData}
          mapLocations={mapLocations}
        />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
                <CardTitle as="h2" className="text-2xl text-accent">Package Highlights</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packageDetails.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/10 transition-colors">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 leading-relaxed">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                <CardTitle as="h2" className="text-2xl text-blue-800 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Detailed Itinerary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <DetailedItinerary 
                  itinerary={packageDetails.itinerary} 
                  themeColor="blue"
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle as="h2" className="text-green-600">Inclusions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {packageDetails.inclusions.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle as="h2" className="text-red-600">Exclusions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {packageDetails.exclusions.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Terms & Conditions */}
            <section className="mt-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle as="h2" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                    Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Booking & Payment:</h3>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                        <li>25% advance payment required to confirm booking</li>
                        <li>Full payment due 30 days before departure (Visa requirement)</li>
                        <li>Prices subject to change based on currency fluctuations</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy:</h3>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                        <li>60+ days before departure: 10% cancellation charges</li>
                        <li>30-59 days before departure: 50% cancellation charges</li>
                        <li>Less than 30 days: 100% cancellation charges</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Important Notes:</h3>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                        <li>Visa processing takes 15-20 working days</li>
                        <li>Passport must be valid for 6 months beyond travel dates</li>
                        <li>Travel Insurance is mandatory</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Flight Routes Section */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle as="h2" className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <span className="text-3xl">✈️</span>
                  Flight Connectivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FlightRouteMap 
                  isInternational={true}
                  destination="Singapore (SIN)"
                  routes={flightRoutes}
                />
              </CardContent>
            </Card>

            {/* Enhanced Map Section */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle as="h2" className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <span className="text-3xl">🗺️</span>
                  Singapore & Malaysia Route Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedRouteMap 
                  locations={mapLocations}
                  mapTitle="Singapore & Malaysia Discovery Route Map"
                />
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <FAQSection 
              faqs={faqsArray} 
              title="Singapore & Malaysia Travel FAQs"
              subtitle="Everything you need to know about your Southeast Asian twin-city adventure."
              className="py-8 bg-transparent"
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-[88px] space-y-6">
              <PackageSidebar 
                packageDetails={{
                  ...packageDetails,
                  price: `₹${Number(packageDetails.price.replace(/,/g, '')).toLocaleString()}`
                }}
                packageType="international"
                destination="Singapore & Malaysia"
                quickFacts={{
                  groupSize: "Max 25 people",
                  bestTime: "December - April",
                  difficulty: "Easy",
                  ageLimit: "5 - 70 years",
                  accommodation: "4-5 Star Hotels",
                  meals: "Breakfast & 2 Lunches",
                  transport: "Flights & Transfers"
                }}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default SingaporeMalaysia;
