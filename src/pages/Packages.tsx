import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { SectionHeading } from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { 
  MapPin, 
  Search, 
  ArrowRight, 
  Sparkles,
  Globe,
  Compass,
  Star,
  ShieldCheck,
  Tag,
  Clock,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from '@/components/seo/JsonLd';
import { FAQAccordion } from '@/components/ui/FAQAccordion';
import { Button } from '@/components/ui/button';
import { config } from '@/config';
import { individualPackages } from "@/data/packages/individualPackages";

const Packages: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'international' ? 'international' : 'all';
  const [activeTab, setActiveTab] = useState<'all' | 'domestic' | 'international'>(initialTab);
  const [viewMode, setViewMode] = useState<'destinations' | 'all-packages'>('all-packages');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. ALL INDIVIDUAL PACKAGES DATASET (50+ TOURS)
  // 1. ALL INDIVIDUAL PACKAGES DATASET (50+ TOURS - Sourced from SSOT)
  // Note: individualPackages is imported from @/data/packages/individualPackages

  // 2. DESTINATION HUBS DATASET
  const domesticDestinations = [
    {
      id: 'char-dham-yatra',
      name: 'Char Dham Yatra Uttarakhand',
      subtitle: 'Kedarnath, Badrinath, Gangotri, Yamunotri, Do Dham, Ek Dham & Helicopter Packages',
      image: '/Kedarnath.png',
      price: '₹11,500 to ₹1,95,000',
      duration: '3 to 12 Days',
      rating: 4.98,
      packagesCount: 9,
      badge: 'Sacred Pilgrimage',
      highlights: ['Kedarnath Jyotirlinga', 'Badrinath Tapt Kund', 'Do Dham Kedar-Badri', 'Heli Charter & Road Tours'],
      keywords: ['char dham', 'kedarnath', 'badrinath', 'gangotri', 'yamunotri', 'do dham', 'ek dham', 'helicopter', 'mana', 'bheem pul', 'saraswati', 'vasudhara', 'triyugi narayan', 'tungnath', 'harsil', 'delhi', 'haridwar'],
      link: '/packages/char-dham-yatra'
    },
    {
      id: 'kashmir-paradise',
      name: 'Kashmir Paradise',
      subtitle: 'Dal Lake Houseboats, Gulmarg Gondola Cable Car & Pahalgam',
      image: '/kashmir/gulmarg_gondola.jpg',
      price: '₹21,500',
      duration: '4 to 8 Days',
      rating: 4.9,
      packagesCount: 8,
      badge: 'Best Seller',
      highlights: ['Dal Lake Houseboat', 'Gulmarg Gondola 13,500 ft', 'Pahalgam Lidder Valley', 'Sonamarg Glacier'],
      keywords: ['kashmir', 'srinagar', 'gulmarg', 'pahalgam', 'dal lake', 'houseboat', 'gondola'],
      link: '/packages/kashmir-paradise'
    },
    {
      id: 'kerala-backwaters',
      name: 'Kerala Backwaters & Hills',
      subtitle: 'Alleppey Private Houseboats & Munnar Tea Gardens',
      image: '/kerala/alleppey_backwaters_houseboat.jpg',
      price: '₹22,800',
      duration: '4 to 7 Days',
      rating: 4.9,
      packagesCount: 6,
      badge: 'Top Rated',
      highlights: ['Private AC Houseboat Cruise', 'Munnar Tea Estates', 'Thekkady Elephant Safari', 'Fort Kochi Heritage'],
      keywords: ['kerala', 'alleppey', 'houseboat', 'munnar', 'thekkady', 'kochi', 'kovalam'],
      link: '/packages/kerala-backwaters'
    },
    {
      id: 'himachal-hill-stations',
      name: 'Himachal Hill Stations',
      subtitle: 'Shimla Ridge, Manali Snow Sports & Kasol River',
      image: '/himachal.jpg',
      price: '₹24,500',
      duration: '5 to 8 Days',
      rating: 4.9,
      packagesCount: 6,
      badge: 'Popular',
      highlights: ['Solang Valley Snow Sports', 'Atal Tunnel / Rohtang Pass', 'Kasol Parvati River', 'Shimla Kufri Meadows'],
      keywords: ['himachal', 'shimla', 'manali', 'solang', 'atal tunnel', 'rohtang', 'kasol', 'spiti'],
      link: '/packages/himachal-hill-stations'
    },
    {
      id: 'goa-beach-holiday',
      name: 'Goa Sun & Beach Retreat',
      subtitle: 'Baga Nightlife, Dudhsagar Waterfalls & Sunset Cruise',
      image: '/goa.jpg',
      price: '₹16,500',
      duration: '3 to 5 Days',
      rating: 4.8,
      packagesCount: 5,
      badge: 'Beach Special',
      highlights: ['Baga & Calangute Shacks', 'Mandovi River Sunset Cruise', 'Dudhsagar 4x4 Jeep Safari', 'UNESCO Old Goa'],
      keywords: ['goa', 'baga', 'dudhsagar', 'sunset cruise', 'calangute', 'water sports'],
      link: '/packages/goa-beach-holiday'
    },
    {
      id: 'rann-utsav',
      name: 'Rann Utsav Kutch Gujarat',
      subtitle: 'Tent City Dhordo, White Desert & Road to Heaven',
      image: '/Rann-Utsav-Gujarat.png',
      price: '₹7,999',
      duration: '2 to 5 Days',
      rating: 4.9,
      packagesCount: 5,
      badge: 'Cultural Festival',
      highlights: ['Praveg Tent City Dhordo', 'White Salt Desert Sunset', 'Road to Heaven Dholavira', 'Kutchi Folk Music'],
      keywords: ['rann utsav', 'kutch', 'tent city', 'dhordo', 'white desert', 'road to heaven', 'dholavira', 'bhuj', 'gujarat'],
      link: '/packages/rann-utsav'
    },
    {
      id: 'rajasthan-royal',
      name: 'Rajasthan Royal Palaces',
      subtitle: 'Jaipur Amer Fort, Udaipur Lake City & Jaisalmer Desert',
      image: '/rajasthan.jpg',
      price: '₹22,500',
      duration: '5 to 9 Days',
      rating: 4.9,
      packagesCount: 6,
      badge: 'Heritage Royal',
      highlights: ['Amer Fort Elephant Ride', 'Udaipur City Palace Lake Cruise', 'Jaisalmer Sam Sand Dunes Safari', 'Jodhpur Mehrangarh'],
      keywords: ['rajasthan', 'jaipur', 'udaipur', 'jaisalmer', 'desert safari', 'amer fort'],
      link: '/packages/rajasthan-royal'
    },
    {
      id: 'leh-ladakh-tour',
      name: 'Leh Ladakh Mountain Passes',
      subtitle: 'Pangong Tso Lake, Nubra Valley Camel & Khardung La 18,380 ft',
      image: '/ladakh.jpg',
      price: '₹32,500',
      duration: '6 to 9 Days',
      rating: 5.0,
      packagesCount: 5,
      badge: 'High Altitude',
      highlights: ['Pangong Tso Blue Lake', 'Khardung La Pass 18,380 ft', 'Nubra Valley Hunder Dunes', 'Magnetic Hill'],
      keywords: ['ladakh', 'leh', 'pangong', 'khardung la', 'nubra', 'camel safari'],
      link: '/packages/leh-ladakh-tour'
    },
    {
      id: 'golden-triangle',
      name: 'Golden Triangle Heritage',
      subtitle: 'Delhi Red Fort, Agra Taj Mahal & Jaipur Palace',
      image: '/rajasthan.jpg',
      price: '₹18,500',
      duration: '4 to 6 Days',
      rating: 4.8,
      packagesCount: 4,
      badge: 'Classic Circuit',
      highlights: ['Taj Mahal Sunrise Tour', 'Agra Fort Guided Walk', 'Jaipur Hawa Mahal', 'Delhi Qutub Minar'],
      keywords: ['golden triangle', 'delhi', 'agra', 'taj mahal', 'jaipur'],
      link: '/packages/golden-triangle'
    }
  ];

  const internationalDestinations = [
    {
      id: 'singapore-tour',
      name: 'Singapore & Sentosa Island',
      subtitle: 'Universal Studios, Marina Bay Sands, Night Safari & Genting Cruise',
      image: '/singapore/gardens_by_the_bay.jpg',
      price: '₹42,000 to ₹62,500',
      duration: '3 to 7 Days',
      rating: 4.9,
      packagesCount: 10,
      badge: 'E-Visa 3-5 Days',
      highlights: ['Gardens by the Bay', 'Universal Studios Sentosa', 'Marina Bay Sands SkyPark', 'Genting Dream Cruise'],
      keywords: ['singapore', 'sentosa', 'universal studios', 'marina bay', 'genting cruise', 'night safari', 'malaysia'],
      link: '/packages/singapore'
    },
    {
      id: 'europe-collection',
      name: 'Europe Grand Collection',
      subtitle: 'Swiss Alps Titlis, Paris Eiffel Tower, Rome Colosseum & Venice Canals',
      image: '/Europe Image New.png',
      price: '₹1,15,000 to ₹1,85,000',
      duration: '5 to 14 Days',
      rating: 4.9,
      packagesCount: 11,
      badge: 'Schengen Handled',
      highlights: ['Paris Eiffel Tower Entry', 'Swiss Alps Titlis Rotair', 'Venice Gondola Cruise', 'Rome Colosseum'],
      keywords: ['europe', 'switzerland', 'paris', 'france', 'italy', 'rome', 'venice', 'germany', 'austria', 'netherlands', 'amsterdam', 'belgium', 'prague'],
      link: '/packages/europe'
    },
    {
      id: 'dubai-delights',
      name: 'Dubai & Red Dune Desert',
      subtitle: 'Burj Khalifa 124th Floor, Desert Safari & Dhow Cruise',
      image: '/dubai.jpg',
      price: '₹45,000',
      duration: '4 to 7 Days',
      rating: 4.9,
      packagesCount: 6,
      badge: 'Luxury Escape',
      highlights: ['Burj Khalifa Observation Deck', '4x4 Dune Bashing & BBQ', 'Marina Dhow Dinner Cruise', 'Miracle Garden'],
      keywords: ['dubai', 'burj khalifa', 'desert safari', 'dhow cruise', 'uae'],
      link: '/packages/dubai-delights'
    },
    {
      id: 'bali-paradise',
      name: 'Bali Paradise Island',
      subtitle: 'Ubud Sacred Monkey Forest, Rice Terraces & Nusa Penida',
      image: '/bali.jpg',
      price: '₹48,500',
      duration: '5 to 7 Days',
      rating: 4.9,
      packagesCount: 5,
      badge: 'Tropical Bliss',
      highlights: ['Nusa Penida Kelingking Beach', 'Ubud Jungle Swing', 'Kintamani Volcano View', 'Uluwatu Sunset Temple'],
      keywords: ['bali', 'nusa penida', 'ubud', 'indonesia', 'kelingking'],
      link: '/packages/bali-paradise'
    },
    {
      id: 'thailand-tropical',
      name: 'Thailand Tropical Escapes',
      subtitle: 'Phuket Patong Beach, Phi Phi Speedboat, Krabi & Bangkok',
      image: '/thailand.jpg',
      price: '₹28,500',
      duration: '4 to 7 Days',
      rating: 4.9,
      packagesCount: 6,
      badge: 'Visa Free / E-VOA',
      highlights: ['Phi Phi Island Maya Bay', 'Krabi 4-Islands Tour', 'Coral Island Speedboat', 'Bangkok Reclining Buddha'],
      keywords: ['thailand', 'phuket', 'krabi', 'phi phi', 'bangkok', 'pattaya'],
      link: '/packages/thailand-tropical'
    },
    {
      id: 'maldives-paradise',
      name: 'Maldives Overwater Paradise',
      subtitle: '5-Star Overwater Lagoon Villa, Seaplane Flight & All-Inclusive',
      image: '/maldives.jpg',
      price: '₹68,500',
      duration: '4 to 5 Days',
      rating: 5.0,
      packagesCount: 4,
      badge: 'Free VOA 30 Days',
      highlights: ['Private Water Villa Deck', 'Roundtrip Seaplane / Speedboat', 'All-Inclusive Meals & Drinks', 'Sunset Dolphin Cruise'],
      keywords: ['maldives', 'water villa', 'seaplane', 'overwater'],
      link: '/packages/maldives-paradise'
    },
    {
      id: 'georgia-adventure',
      name: 'Georgia Caucasus Mountain',
      subtitle: 'Kazbegi 4x4 Expedition, Gudauri Ski Resort & Tbilisi',
      image: '/georgia/kazbegi_caucasus_mountain.jpg',
      price: '₹58,000',
      duration: '5 to 7 Days',
      rating: 4.9,
      packagesCount: 5,
      badge: 'E-Visa Easy',
      highlights: ['Gergeti Trinity Church 5,047m', 'Gudauri Cable Car Flight', 'Signagi Wine Region', 'Tbilisi Cable Car'],
      keywords: ['georgia', 'tbilisi', 'kazbegi', 'gudauri'],
      link: '/packages/georgia-adventure'
    },
    {
      id: 'japan-cherry-blossom',
      name: 'Japan Cherry Blossom',
      subtitle: 'Tokyo Skytree, Mount Fuji, Bullet Train & Kyoto',
      image: '/japan.jpg',
      price: '₹1,65,000',
      duration: '6 to 10 Days',
      rating: 5.0,
      packagesCount: 5,
      badge: 'Bucket List',
      highlights: ['Mount Fuji 5th Station', 'Shinkansen 320km/h Train', 'Fushimi Inari Torii Gates', 'Osaka Castle Cherry Blossoms'],
      keywords: ['japan', 'tokyo', 'mount fuji', 'shinkansen', 'kyoto', 'osaka'],
      link: '/packages/japan-cherry-blossom'
    },
    {
      id: 'seychelles-escape',
      name: 'Seychelles Island Escape',
      subtitle: 'Mahé Granite Boulders, Praslin Anse Lazio & La Digue',
      image: '/seychelles.jpg',
      price: '₹85,000',
      duration: '5 to 7 Days',
      rating: 4.9,
      packagesCount: 4,
      badge: 'Visa Free',
      highlights: ['Anse Source d\'Argent Beach', 'Vallee de Mai Giant Palms', 'Granite Rock Beaches', 'Cat Cocos Catamaran'],
      keywords: ['seychelles', 'mahe', 'praslin', 'la digue'],
      link: '/packages/seychelles-escape'
    },
    {
      id: 'turkey-adventure',
      name: 'Turkey & Cappadocia Balloons',
      subtitle: 'Istanbul Hagia Sophia, Hot Air Balloon Flight & Pamukkale',
      image: '/turkey.jpg',
      price: '₹78,000',
      duration: '6 to 9 Days',
      rating: 4.9,
      packagesCount: 5,
      badge: 'E-Visa Available',
      highlights: ['Cappadocia Sunrise Hot Air Balloon', 'Istanbul Bosphorus Cruise', 'Pamukkale Travertine Pools', 'Ephesus Ancient City'],
      keywords: ['turkey', 'istanbul', 'cappadocia', 'hot air balloon'],
      link: '/packages/turkey-adventure'
    },
    {
      id: 'mauritius-bliss',
      name: 'Mauritius Beach Bliss',
      subtitle: 'Île aux Cerfs Water Sports, Chamarel 7-Colored Earth & Catamaran',
      image: '/mauritius.jpg',
      price: '₹72,000',
      duration: '6 to 7 Days',
      rating: 4.8,
      packagesCount: 4,
      badge: 'Free VOA 60 Days',
      highlights: ['Île aux Cerfs Speedboat Cruise', 'Chamarel 7-Colored Earth', 'Le Morne Brabant Mountain', 'Undersea Walk'],
      keywords: ['mauritius', 'ile aux cerfs', 'chamarel'],
      link: '/packages/mauritius-bliss'
    }
  ];

  // SEARCH FILTER LOGIC FOR HUBS
  const filterDestinations = (list: typeof domesticDestinations) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.subtitle.toLowerCase().includes(q) ||
      item.highlights.some(h => h.toLowerCase().includes(q)) ||
      (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q)))
    );
  };

  // SEARCH FILTER LOGIC FOR INDIVIDUAL PACKAGES
  const filterPackages = (list: typeof individualPackages) => {
    if (activeTab !== 'all') {
      list = list.filter(item => item.category === activeTab);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.destination.toLowerCase().includes(q) ||
      item.region.toLowerCase().includes(q) ||
      (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q)))
    );
  };

  const displayedDomesticHubs = filterDestinations(domesticDestinations);
  const displayedInternationalHubs = filterDestinations(internationalDestinations);
  const displayedIndividualPackages = filterPackages(individualPackages);

  const packageCatalogFaqs = [
    {
      id: "pkg-faq-1",
      question: "Are GhumoFiroo holiday packages 100% customizable for families and couples?",
      answer: "Yes! Every holiday package on GhumoFiroo can be personalized according to your travel dates and group preferences. You can adjust the trip duration, choose 4-star boutique or 5-star luxury hotels/villas, select private airport transfers, include scenic mountain railway or helicopter tours, and customize pure vegetarian, Jain, or multi-cuisine meal plans."
    },
    {
      id: "pkg-faq-2",
      question: "How does GhumoFiroo assist with international tourist visas and documentation?",
      answer: "We provide end-to-end tourist visa filing support across all major international destinations: express online e-Visas for Georgia, Dubai (UAE), Singapore, and Thailand, as well as full Schengen Visa documentation (VFS Global appointment scheduling, verified flight & hotel vouchers, itinerary cover letters, and overseas travel insurance) for Europe tours."
    },
    {
      id: "pkg-faq-3",
      question: "What is included in the Char Dham Yatra and Kedarnath helicopter packages?",
      answer: "Our Char Dham pilgrimage packages include guaranteed biometric yatra registration, luxury hotel/resort accommodations along the route (Haridwar, Barkot, Uttarkashi, Guptkashi, Badrinath), chauffeured private AC Innova/Tempo Traveller transport, pure vegetarian meals, and priority VIP Darshan coordination, with optional helicopter shuttle/charter bookings for Kedarnath."
    },
    {
      id: "pkg-faq-4",
      question: "Are private vehicles and dedicated drivers provided for all sightseeing?",
      answer: "Yes, we prioritize safety and comfort. All our domestic (Kashmir, Kerala, Himachal, Rajasthan, Ladakh, Char Dham) and international (Georgia, Europe, Dubai, Bali, Singapore) packages provide private chauffeured AC vehicles exclusively for your group, ensuring maximum flexibility and zero shared tour bus delays."
    },
    {
      id: "pkg-faq-5",
      question: "What are the payment terms, advance deposit, and cancellation safety policies?",
      answer: "You can book your journey with an initial nominal token deposit. The remaining balance is payable in flexible installments before departure. We offer transparent cancellation policies, complimentary date rescheduling options, and complete financial security with GST-compliant invoices."
    },
    {
      id: "pkg-faq-6",
      question: "Can pure vegetarian, Jain, and Swaminarayan food be arranged during international trips?",
      answer: "Absolutely! For all international itineraries (Europe, Georgia, Singapore, Dubai, Bali, Thailand, Japan), our team curates Indian restaurant meals or pre-arranges pure vegetarian, Jain, and Swaminarayan dining options free of onion and garlic."
    }
  ];

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "All Destinations", item: "/packages" }
  ]);

  const faqSchema = buildFaqJsonLd(
    packageCatalogFaqs.map(f => ({ question: f.question, answer: f.answer }))
  );

  return (
    <Layout>
      <SEO 
        title="All Packages & Destinations 2026 | Kedarnath, Char Dham, Singapore, Kashmir, Europe"
        description="Search & browse 50+ curated tour packages. Char Dham, Kedarnath, Do Dham, Ek Dham, Kashmir, Kerala, Himachal, Rann Utsav, Singapore, Dubai, Bali, Thailand, Maldives & Europe."
        keywords="all tour packages India, Kedarnath package search, Char Dham packages 2026, Singapore tour packages, domestic tour packages, international packages 2026"
        canonicalUrl={config.baseUrl + "/packages"}
        structuredData={[breadcrumbSchema, faqSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO & SEARCH SECTION */}
        <section className="relative bg-[#070C1E] py-20 border-b border-[#C9A25A]/20 overflow-hidden flex flex-col justify-center items-center">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600" 
              alt="Global Tour Destinations GhumoFiroo" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/90 via-[#070C1E]/75 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 max-w-5xl text-center relative z-20 pt-8">
            <ScrollReveal variant="fade-in-scale">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-[#C9A25A]/40 backdrop-blur-md mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                  Complete Travel Directory
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif font-normal text-white mb-4 tracking-tight drop-shadow-2xl">
                Search & Explore All Packages
              </h1>
              <p className="text-sm sm:text-lg text-slate-300 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                Browse our complete list of 50+ tour packages. Use the search bar below to instantly find any package by name, shrine, city or attraction.
              </p>
            </ScrollReveal>

            {/* TAB SELECTOR & LIVE SEARCH BAR */}
            <div className="mt-10 max-w-3xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#0B1226]/90 p-2.5 rounded-2xl border border-[#C9A25A]/40 backdrop-blur-lg shadow-xl">
                
                {/* REGION FILTER */}
                <div className="flex gap-1 w-full sm:w-auto shrink-0 justify-center">
                  {[
                    { key: 'all', label: 'All Regions', icon: Compass },
                    { key: 'domestic', label: 'Domestic India', icon: MapPin },
                    { key: 'international', label: 'International', icon: Globe }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={cn(
                          "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                          activeTab === tab.key
                            ? "bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] shadow-md shadow-[#C9A25A]/20"
                            : "text-slate-300 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* LIVE SEARCH INPUT */}
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A25A]" />
                  <input 
                    id="packages-filter-search"
                    name="search"
                    autoComplete="off"
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search package (e.g. Kedarnath, Do Dham, Singapore, Switzerland, Kashmir, Paris)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#C9A25A] transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* VIEW MODE TOGGLE */}
              <div className="flex items-center justify-between text-xs text-slate-300 px-2 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Displaying:</span>
                  <div className="inline-flex bg-black/40 p-1 rounded-lg border border-white/10">
                    <button 
                      onClick={() => setViewMode('all-packages')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        viewMode === 'all-packages' 
                          ? 'bg-[#C9A25A] text-[#070C1E]' 
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      All Individual Packages ({displayedIndividualPackages.length})
                    </button>
                    <button 
                      onClick={() => setViewMode('destinations')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        viewMode === 'destinations' 
                          ? 'bg-[#C9A25A] text-[#070C1E]' 
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Destination Hubs ({displayedDomesticHubs.length + displayedInternationalHubs.length})
                    </button>
                  </div>
                </div>

                {searchQuery && (
                  <span className="text-[#E5C378] font-bold">
                    Found {viewMode === 'all-packages' ? displayedIndividualPackages.length : displayedDomesticHubs.length + displayedInternationalHubs.length} matches for "{searchQuery}"
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN DISPLAY SECTION */}
        <section className="py-20 container mx-auto px-6 max-w-7xl">

          {/* VIEW MODE 1: ALL INDIVIDUAL PACKAGES GRID (50+ TOURS) */}
          {viewMode === 'all-packages' && (
            <div>
              <SectionHeading 
                kicker="Complete Tour Catalog" 
                title={searchQuery ? `Search Results for "${searchQuery}"` : "All Individual Packages"} 
                subtitle="Browse every single tour package available on Ghumo Firoo Travels with instant prices, durations & direct links." 
                align="left" 
                className="mb-12" 
              />

              {displayedIndividualPackages.length === 0 ? (
                <div className="bg-[#0B1226] border border-[#C9A25A]/30 p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
                  <Compass className="w-12 h-12 text-[#C9A25A] mx-auto opacity-70" />
                  <h3 className="text-xl font-serif font-bold text-white">No exact package matches found</h3>
                  <p className="text-xs text-slate-300 font-light">
                    Try searching with broader terms like "Kedarnath", "Char Dham", "Singapore", "Switzerland", "Kashmir" or reset your search query.
                  </p>
                  <Button 
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs"
                  >
                    Reset Search Filter
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedIndividualPackages.map((pkg, idx) => (
                    <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 30}>
                      <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                        <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                          <img 
                            src={pkg.image} 
                            alt={pkg.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="bg-black/75 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                              {pkg.badge}
                            </span>
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {pkg.rating}
                          </div>
                        </Link>

                        <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#C9A25A] mb-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {pkg.duration}
                              </span>
                              <span className="text-slate-400 font-normal">{pkg.region}</span>
                            </div>
                            
                            <Link to={pkg.link} className="block">
                              <h3 className="text-base font-serif font-bold text-white mb-2 group-hover:text-[#E5C378] transition-colors leading-snug">
                                {pkg.title}
                              </h3>
                            </Link>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-[#C9A25A] shrink-0" />
                              <span>{pkg.destination}</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase text-slate-400 font-bold block">Package Cost</span>
                              <span className="text-lg font-serif font-extrabold text-[#E5C378]">{pkg.price}</span>
                            </div>
                            <Link 
                              to={pkg.link}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition-all"
                            >
                              Explore <ArrowRight className="w-3.5 h-3.5 text-[#070C1E]" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: DESTINATION HUBS GRID */}
          {viewMode === 'destinations' && (
            <div className="space-y-24">
              {/* DOMESTIC DESTINATIONS */}
              {(activeTab === 'all' || activeTab === 'domestic') && (
                <div>
                  <SectionHeading 
                    kicker="Domestic Collections" 
                    title="Explore India Destinations" 
                    subtitle="Select a destination hub to explore complete itinerary variants, hotels & transport options." 
                    align="left" 
                    className="mb-12" 
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedDomesticHubs.map((dest, idx) => (
                      <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 40}>
                        <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                          <Link to={dest.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                            <img 
                              src={dest.image} 
                              alt={dest.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                {dest.badge}
                              </span>
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {dest.rating}
                            </div>
                          </Link>

                          <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-[11px] font-bold text-[#C9A25A] mb-1">
                                <span className="uppercase tracking-wider flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> India Destination
                                </span>
                                <span className="bg-[#C9A25A]/15 text-[#E5C378] px-2 py-0.5 rounded border border-[#C9A25A]/30 text-[10px]">
                                  {dest.packagesCount} Package Options
                                </span>
                              </div>
                              
                              <Link to={dest.link} className="block">
                                <h3 className="text-xl font-serif font-bold text-white mb-1 group-hover:text-[#E5C378] transition-colors">{dest.name}</h3>
                              </Link>
                              <p className="text-xs text-slate-300 font-light leading-relaxed mb-3">{dest.subtitle}</p>

                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {dest.highlights.map((h, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-medium border border-white/10">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase text-slate-400 font-bold block">Packages From</span>
                                <span className="text-lg font-serif font-extrabold text-[#E5C378]">{dest.price}</span>
                              </div>
                              <Link 
                                to={dest.link}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition-all"
                              >
                                View Hub <ArrowRight className="w-3.5 h-3.5 text-[#070C1E]" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}

              {/* INTERNATIONAL DESTINATIONS */}
              {(activeTab === 'all' || activeTab === 'international') && (
                <div>
                  <SectionHeading 
                    kicker="International Collections" 
                    title="Explore Global Destinations" 
                    subtitle="Select an international hub to explore luxury resorts, e-visa guidelines & private tour itineraries." 
                    align="left" 
                    className="mb-12" 
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedInternationalHubs.map((dest, idx) => (
                      <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 40}>
                        <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                          <Link to={dest.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                            <img 
                              src={dest.image} 
                              alt={dest.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                {dest.badge}
                              </span>
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {dest.rating}
                            </div>
                          </Link>

                          <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-[11px] font-bold text-[#C9A25A] mb-1">
                                <span className="uppercase tracking-wider flex items-center gap-1">
                                  <Globe className="w-3 h-3" /> International
                                </span>
                                <span className="bg-[#C9A25A]/15 text-[#E5C378] px-2 py-0.5 rounded border border-[#C9A25A]/30 text-[10px]">
                                  {dest.packagesCount} Package Options
                                </span>
                              </div>
                              
                              <Link to={dest.link} className="block">
                                <h3 className="text-xl font-serif font-bold text-white mb-1 group-hover:text-[#E5C378] transition-colors">{dest.name}</h3>
                              </Link>
                              <p className="text-xs text-slate-300 font-light leading-relaxed mb-3">{dest.subtitle}</p>

                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {dest.highlights.map((h, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-medium border border-white/10">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase text-slate-400 font-bold block">Packages From</span>
                                <span className="text-lg font-serif font-extrabold text-[#E5C378]">{dest.price}</span>
                              </div>
                              <Link 
                                to={dest.link}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition-all"
                              >
                                View Hub <ArrowRight className="w-3.5 h-3.5 text-[#070C1E]" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </section>

        {/* FREQUENTLY ASKED QUESTIONS SECTION */}
        <section className="py-20 bg-[#060B1A] border-t border-[#C9A25A]/20">
          <div className="container mx-auto px-6 max-w-5xl">
            <SectionHeading 
              kicker="Traveler Assurance & Guide" 
              title="Frequently Asked Questions" 
              subtitle="Clear answers about customizable itineraries, international e-visas, private cabs, pure vegetarian meals & booking security." 
              align="center" 
              className="mx-auto mb-16" 
            />
            <FAQAccordion items={packageCatalogFaqs} />
          </div>
        </section>

        {/* TRUST BADGES FOOTER BANNER */}
        <section className="py-16 bg-[#050A18] border-t border-[#C9A25A]/20">
          <div className="container mx-auto px-6 max-w-6xl text-center space-y-8">
            <h3 className="text-2xl font-serif font-bold text-white">Why Travel With Ghumo Firoo Travels?</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "100% Private Fleet", desc: "No shared tourist buses. Private chauffeured AC sedans, SUVs & Innovas for your family." },
                { title: "Verified Luxury Hotels", desc: "Handpicked 4-Star & 5-Star properties with guaranteed breakfast and mountain/lake views." },
                { title: "Fast-Track Visa Desk", desc: "Guaranteed express tourist visa assistance for Singapore, Dubai, Georgia, Thailand & Schengen documentation." },
                { title: "24/7 VIP Concierge", desc: "Dedicated on-ground travel manager assigned to your itinerary from arrival to departure." }
              ].map((badge, idx) => (
                <div key={idx} className="bg-[#0B1226] p-5 rounded-xl border border-white/10 text-left space-y-2">
                  <ShieldCheck className="w-6 h-6 text-[#C9A25A]" />
                  <h4 className="text-sm font-serif font-bold text-white">{badge.title}</h4>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Packages;
