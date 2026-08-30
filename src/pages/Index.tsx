import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Calendar, Clock, Star, Users, ArrowRight, Sparkles, Compass, Shield, Award, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { config } from '@/config';
import SEO from '@/components/SEO';
import { buildTravelAgencyJsonLd } from '@/components/seo/JsonLd';

// Phase 1 Design System components
import { Button } from '@/components/ui/button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { NavbarShell } from '@/components/common/NavbarShell';
import { FooterShell } from '@/components/common/FooterShell';
import { FAQAccordion } from '@/components/ui/FAQAccordion';
import { StickyCTA } from '@/components/common/StickyCTA';
import LazyImage from '@/components/ui/LazyImage';

// Services & Analytics
import { reviewService, GoogleReview } from '@/services/reviewService';
import { trackSearch } from '@/lib/pixel';

// Static Data matching existing structure but in a premium design
const featuredPillars = [
  {
    id: 'rann-utsav',
    name: 'Rann Utsav',
    tag: 'Cultural Festival',
    image: '/Rann-Utsav-Gujarat.png',
    description: 'Witness the surreal white salt desert of Kutch. Enjoy luxury hospitality tents, camel safaris at sunset, folk musicians, and authentic Kutchi craftsmanship.',
    startingPrice: '₹7,999',
    route: '/packages/rann-utsav'
  },
  {
    id: 'char-dham',
    name: 'Char Dham Yatra',
    tag: 'Sacred Pilgrimage',
    image: '/Kedarnath.png',
    description: 'Embark on the ultimate spiritual journey to Yamunotri, Gangotri, Kedarnath, and Badrinath. Offered via premium chauffeured road tours and exclusive helicopter services.',
    startingPrice: '₹28,500',
    route: '/packages/char-dham-yatra'
  },
  {
    id: 'singapore',
    name: 'Singapore City',
    tag: 'International Luxury',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800',
    description: 'Immerse yourself in modern elegance. Features private skyline yacht tours, Sentosa luxury villas, Michelin-starred fine dining, and custom personal concierge support.',
    startingPrice: '₹48,000',
    route: '/packages/singapore'
  },
  {
    id: 'europe',
    name: 'Grand Europe',
    tag: 'Premium Continental',
    image: '/Europe Image New.png',
    description: 'Explore Switzerland, France, and Italy in style. Includes panoramic alpine train journeys, historic vineyard private excursions, and boutique palace lodging.',
    startingPrice: '₹1,85,000',
    route: '/packages/europe'
  }
];

const mockBlogs = [
  {
    id: 1,
    slug: 'rann-utsav-2026',
    title: 'Rann Utsav 2026-27 Complete Travel Guide',
    excerpt: 'The ultimate guide to planning your trip to the White Rann of Kutch for the 2026-27 festival. Booking tips, best time, and tent choices.',
    image: '/Rann-Utsav-Gujarat.png',
    category: 'Premium Destinations',
    readTime: '15 min read',
    date: 'June 21, 2026'
  },
  {
    id: 2,
    slug: 'char-dham-yatra',
    title: 'Char Dham Yatra Complete Route Guide',
    excerpt: 'Perform your holy pilgrimage with absolute ease. Plan your routes, register online, book premium helicopters, and avoid common altitude issues.',
    image: '/Badrinath.png',
    category: 'Sacred Journeys',
    readTime: '12 min read',
    date: 'June 18, 2026'
  },
  {
    id: 3,
    slug: 'schengen-visa-guide',
    title: 'Schengen Visa Guide For Indian Travelers',
    excerpt: 'Detailed document checklist, premium interview scheduling tips, bank balance requirements, and step-by-step visa guidelines for Europe tours.',
    image: '/Europe Image New.png',
    category: 'Visa Guides',
    readTime: '10 min read',
    date: 'June 15, 2026'
  }
];

const faqItems = [
  {
    id: 'faq-1',
    question: 'How does the Char Dham Yatra by Helicopter work, and what VIP Darshan benefits are included?',
    answer: 'Our 2026 Char Dham Helicopter Yatra package includes luxury chopper charters connecting Dehradun, Yamunotri (Kharsali), Gangotri (Harsil), Kedarnath (Phata/Sersi), and Badrinath. Passengers receive priority VIP Darshan tokens at Kedarnath & Badrinath, 5-star ground SUV transport, luxury hotel stays, medical support, and full biometric Yatra registration assistance.'
  },
  {
    id: 'faq-2',
    question: 'What is the best time to visit Rann Utsav Gujarat, and what luxury tent options are available?',
    answer: 'Rann Utsav runs from November to March, with Full Moon (Purnima) nights being the most popular for witnessing the glowing White Salt Desert. Ghumo Firoo provides official Tent City bookings featuring Premium AC Swiss Tents, Royal Tents, and Luxury Bungalows at Dhordo. Packages include full-board Kutchi meals, folk dance performances, ATV rides, and sunset camel cart tours.'
  },
  {
    id: 'faq-3',
    question: 'What attractions are included in the Singapore 4D3N & 5D4N Luxury Packages?',
    answer: 'Our Singapore packages cover 1-click Singapore eVisa processing for Indians, 4-star/5-star hotel stays (like Marina Bay Sands & Sentosa Island Resorts), Universal Studios Singapore express passes, Gardens by the Bay Flower Dome & Cloud Forest, Night Safari, Cable Car, and optional Singapore & Malaysia combo transfers.'
  },
  {
    id: 'faq-4',
    question: 'Does Ghumo Firoo provide Schengen Visa assistance for European customized tours?',
    answer: 'Yes. We provide 100% end-to-end Schengen Visa documentation support, cover letter drafting, verified hotel vouchers, flight itineraries, travel insurance, and Eurail train pass bookings. Our Grand Europe & Switzerland itineraries cover Paris, Lucerne, Interlaken, Mt. Titlis, and Jungfraujoch.'
  },
  {
    id: 'faq-5',
    question: 'What is included in the GhumoFiroo Custom Travel Concierge?',
    answer: 'Our concierge service includes end-to-end management of your premium holiday: personalized flights/charters, boutique palace/luxury hotel stays, private airport transfers, premium local tour guides, and 24/7 dedicated travel support.'
  },
  {
    id: 'faq-6',
    question: 'How do I track payments and clear remaining trip balances?',
    answer: 'Every booking receives an official Booking ID and financial ledger. You can pay 0% MDR fee via UPI (Google Pay, PhonePe, Paytm), NetBanking, or Credit Card. We issue instant WhatsApp payment receipts showing your total price, amount paid, and remaining balance due date.'
  },
  {
    id: 'faq-7',
    question: 'Are customizable family and honeymoon packages available for Kashmir & Kerala?',
    answer: 'Absolutely. We offer customized 5N/6D and 7N/8D Kashmir Paradise packages (Srinagar houseboats, Gulmarg gondola rides, Pahalgam valleys) and Kerala Backwaters luxury houseboat cruises with private drivers and customized itineraries.'
  }
];

const heroSlides = [
  {
    image: '/Rann-Utsav-Gujarat.png',
    kicker: 'BESPOKE FESTIVAL ESCAPES',
    title: 'White Desert Rann Utsav',
    subtitle: 'Luxury Swiss tents, sunset camel safaris & Kutchi folk heritage',
    price: 'From ₹7,999',
    route: '/packages/rann-utsav'
  },
  {
    image: '/Kedarnath.png',
    kicker: 'SACRED SPIRITUAL JOURNEYS',
    title: 'Char Dham Yatra by Helicopter',
    subtitle: 'VIP Darshan passes, elite heli charters & chauffeured luxury ground comfort',
    price: 'From ₹28,500',
    route: '/packages/char-dham-yatra'
  },
  {
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80',
    kicker: 'INTERNATIONAL SKYLINE RETREATS',
    title: 'Singapore Metropolitan Elegance',
    subtitle: 'Private skyline yachts, Sentosa luxury villas & Michelin star dining',
    price: 'From ₹48,000',
    route: '/packages/singapore'
  },
  {
    image: '/Europe Image New.png',
    kicker: 'GRAND CONTINENTAL EXPLORATION',
    title: 'Grand Europe Tour',
    subtitle: 'Panoramic Alpine trains, historic vineyard estates & boutique palace stays',
    price: 'From ₹1,85,000',
    route: '/packages/europe'
  }
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const testimonialScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (testimonialScrollRef.current) {
      const scrollAmount = direction === 'left' ? -560 : 560;
      testimonialScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getFeaturedReviews(10);
        setReviews(data);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      }
    };
    loadReviews();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackSearch(searchQuery);
      navigate(`/packages?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const structuredData = buildTravelAgencyJsonLd({
    name: "Ghumo Firoo Travels",
    description: "Ultra-luxury travel design offering bespoke tours to Char Dham, Rann Utsav, Singapore, and Europe with a 24/7 dedicated travel concierge.",
    url: config.baseUrl + "/",
    logo: config.baseUrl + "/ghumo-firoo-logo.png",
    telephone: "+91-9910987264",
    email: "info@ghumofiroo.com",
    address: {
      streetAddress: "Shop No. 210, Second Floor, Pratap Complex, Munirka",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      postalCode: "110067",
      addressCountry: "IN"
    },
    openingHours: "Mo-Sa 09:00-18:00, Su 10:00-16:00",
    geo: { latitude: '28.549333982444654', longitude: '77.16911131508083' },
    priceRange: "₹₹ - ₹₹₹",
    image: config.baseUrl + "/Ghumo_Firoo.png",
    sameAs: [
      "https://www.facebook.com/GhumoFirooTravels",
      "https://www.instagram.com/ghumofirootravels",
      "https://maps.google.com/?cid=13837651037593674526"
    ]
  });

  return (
    <>
      <Helmet>
        <link 
          rel="preload" 
          as="image" 
          href="/Rann-Utsav-Gujarat.png" 
        />
      </Helmet>
      
      <SEO 
        title="Char Dham, Kashmir & Europe Tours | Ghumo Firoo"
        description="Discover bespoke luxury holidays, private tour packages, and sacred spiritual escapes with Ghumo Firoo. Book curated Char Dham Yatra, Rann Utsav tents, Kashmir, and Europe tours today."
        canonicalUrl="https://ghumofiroo.com/"
        keywords="luxury travel agency, bespoke tour packages, Rann Utsav premium tents, Char Dham yatra helicopter, Singapore luxury tour, Europe grand tour, luxury travel planner Delhi"
        structuredData={structuredData}
      />

      <NavbarShell logoText="GhumoFiroo" />

      {/* Main Page Content */}
      <main id="main-content" className="pt-[88px] overflow-x-hidden bg-[#070C1E] text-white min-h-screen flex flex-col font-sans">

        {/* 1. CINEMATIC FULL-BLEED LUXURY HERO SLIDESHOW */}
        <section className="relative h-[85vh] min-h-[620px] max-h-[900px] w-full overflow-hidden flex items-center justify-center">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title || 'Ghumo Firoo Luxury Travel Experience'}
                width="1920"
                height="1080"
                loading={idx === 0 ? 'eager' : 'lazy'}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                decoding="async"
                className="w-full h-full object-cover scale-105 transition-transform ease-out"
                style={{
                  transitionDuration: '8000ms',
                  transform: idx === currentSlide ? 'scale(1)' : 'scale(1.08)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070C1E] via-[#070C1E]/50 to-[#070C1E]/70" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070C1E]/90 via-transparent to-[#070C1E]/90" />
            </div>
          ))}

          <div className="relative z-20 container mx-auto px-6 text-center max-w-4xl pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-[#C9A25A]/40 backdrop-blur-md mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                {heroSlides[currentSlide].kicker}
              </span>
            </div>

            <h1 className="text-white font-serif font-normal text-4xl sm:text-6xl lg:text-7xl leading-[1.1] mb-6 tracking-tight drop-shadow-2xl">
              Journeys Crafted <br className="hidden sm:inline" />
              <span className="italic text-[#E5C378] font-light">
                With Intention.
              </span>
            </h1>

            <p className="text-white/90 text-sm sm:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-8 drop-shadow-md">
              {heroSlides[currentSlide].subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate(heroSlides[currentSlide].route)}
                className="w-full sm:w-auto px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all group"
              >
                Explore {heroSlides[currentSlide].title}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/enquire-now')}
                className="w-full sm:w-auto px-8 py-6 rounded-full text-white border-white/30 bg-black/30 backdrop-blur-md hover:bg-white/10 hover:border-[#C9A25A] text-xs font-semibold uppercase tracking-[0.2em] transition-all"
              >
                <Phone className="mr-2 h-4 w-4 text-[#C9A25A]" /> Speak with Concierge
              </Button>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? 'w-8 h-2 bg-[#C9A25A]'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </section>

        {/* 2. FLOATING SEARCH PACKAGES BAR */}
        <section className="relative z-30 -mt-12 container mx-auto px-6 max-w-4xl">
          <ScrollReveal variant="fade-in-up" delay={100}>
            <form
              onSubmit={handleSearchSubmit}
              className="bg-[#0B1226]/95 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 shadow-2xl border border-[#C9A25A]/25 flex flex-col md:flex-row items-center gap-3"
            >
              <div className="flex-1 w-full relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C9A25A]" />
                <input 
                  id="home-destination-search"
                  name="destination"
                  autoComplete="off"
                  type="text"
                  placeholder="Where would you like to escape next? (e.g. Kedarnath, Rann Utsav, Singapore, Swiss Alps)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 text-white placeholder-white/50 text-sm border border-white/10 focus:border-[#C9A25A] rounded-xl focus:outline-none transition-all"
                />
              </div>
              <Button
                type="submit"
                className="w-full md:w-auto h-12 px-8 bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold tracking-wider text-xs uppercase rounded-xl hover:brightness-110 shadow-lg shadow-[#C9A25A]/20 transition-all"
              >
                <Search className="mr-2 h-4 w-4" /> Search Journeys
              </Button>
            </form>
          </ScrollReveal>
        </section>

        {/* 3. FEATURED EXPERIENCES PILLARS */}
        <section className="py-24 container mx-auto px-6 max-w-7xl">
          <SectionHeading 
            kicker="The Four Pillars"
            title="Signature Travel Collections"
            subtitle="Explore our curated core directions, meticulously structured for premium comfort and unmatched exclusivity."
            align="center"
            className="mx-auto mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPillars.map((pillar, index) => (
              <ScrollReveal key={pillar.id} variant="fade-in-up" delay={index * 100}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img src={pillar.image} alt={pillar.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        {pillar.tag}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white mb-1.5">{pillar.name}</h3>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">{pillar.description}</p>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#E5C378]">From {pillar.startingPrice}</span>
                      <Link to={pillar.route} className="flex items-center gap-1 text-xs font-semibold text-white group-hover:text-[#C9A25A] transition-colors">
                        Explore <ArrowRight className="h-3.5 w-3.5 text-[#C9A25A]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 4. WHY GHUMOFIROO (TRUST SECTION) */}
        <section className="py-24 bg-[#050A18] border-y border-[#C9A25A]/15">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading 
              kicker="Uncompromising Standards"
              title="Why Discerning Travelers Choose Us"
              subtitle="GhumoFiroo coordinates elite services so you can focus entirely on spiritual rewards and aesthetic inspiration."
              align="center"
              className="mx-auto mb-16"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: Compass, title: "Custom Travel Designers", desc: "Every tour is shaped by custom coordinators to match your pace, dietary, and boarding demands." },
                { icon: Shield, title: "Accredited Alignment", desc: "Proudly recognized travel managers. Ensuring direct alignments and secured bookings." },
                { icon: Award, title: "Luxury Concierge", desc: "Dedicated support agents at your side. 24/7 coordination of guides, ground transport, and priority entries." },
                { icon: Sparkles, title: "Immersive Experiences", desc: "No standard tracks. Private charters, luxury local camps, fine-dining inclusions, and expert local hosts." }
              ].map((item, idx) => (
                <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 100} className="flex flex-col items-center text-center p-6 bg-[#0B1226]/80 rounded-2xl border border-white/10 hover:border-[#C9A25A]/40 transition-all duration-300">
                  <div className="h-12 w-12 rounded-xl bg-[#C9A25A]/15 border border-[#C9A25A]/30 flex items-center justify-center text-[#C9A25A] mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider font-serif mb-2 text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">{item.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 5. RANN UTSAV COLLECTION PREVIEW */}
        <section className="py-24 container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <SectionHeading 
              kicker="Special Collection"
              title="Rann Utsav Hub Escapes"
              subtitle="Immerse in Kutchi heritage. Accommodations in premium air-conditioned Swiss Tents with signature folk access."
              align="left"
              className="max-w-xl"
            />
            <Button variant="luxuryOutline" className="gap-2 border-[#C9A25A]/40 text-white hover:bg-[#C9A25A]/20" onClick={() => navigate('/packages/rann-utsav')}>
              View All Rann Packages <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Kutch Tent City Luxury Package", duration: "4 Days / 3 Nights", price: "₹18,500", img: "/Rann-Utsav-Gujarat.png", details: "Premium tent stays with all-inclusive meals, cultural entry vouchers, and airport shuttle support." },
              { title: "Rann White Desert Safari Classic", duration: "3 Days / 2 Nights", price: "₹11,999", img: "/rann-utsav.jpg", details: "Sunset camel rides, stargazing inside Kutch, traditional dinners, and craft cluster tours." },
              { title: "Royal Kutch Heritage Experience", duration: "5 Days / 4 Nights", price: "₹24,500", img: "/Mandvi Beach_Kutch.png", details: "Stay in palace hotels combined with Tent City retreats, private guides, and customized cars." }
            ].map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 100}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        Tent City
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#C9A25A] mb-1">
                        <Clock className="w-3 h-3" /> {pkg.duration}
                      </div>
                      <h3 className="text-base font-serif font-bold text-white mb-1">{pkg.title}</h3>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">{pkg.details}</p>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#E5C378]">{pkg.price}</span>
                      <Link to="/packages/rann-utsav" className="flex items-center gap-1 text-xs font-semibold text-white group-hover:text-[#C9A25A] transition-colors">
                        Book Now <ArrowRight className="h-3.5 w-3.5 text-[#C9A25A]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 6. CHAR DHAM COLLECTION PREVIEW */}
        <section className="py-24 bg-[#050A18] border-y border-[#C9A25A]/15">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
              <SectionHeading 
                kicker="Sacred Himalayan Yatras"
                title="Char Dham Pilgrimages"
                subtitle="Perform holy darshan at Yamunotri, Gangotri, Kedarnath, and Badrinath with customized premium arrangements."
                align="left"
                className="max-w-xl"
              />
              <Button variant="luxuryOutline" className="gap-2 border-[#C9A25A]/40 text-white hover:bg-[#C9A25A]/20" onClick={() => navigate('/packages/char-dham-yatra')}>
                View All Sacred Yatras <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Char Dham Yatra via Private Heli", duration: "6 Days / 5 Nights", price: "₹2,25,000", img: "/Kedarnath.png", tag: "Helicopter", details: "Avoid long trekking curves. Private helicopter travel from Dehradun, VIP darshan priority passes, and hotel stays." },
                { title: "Sacred Kedarnath & Badrinath Heli", duration: "5 Days / 4 Nights", price: "₹22,500", img: "/Badrinath.png", tag: "2-Dham Tour", details: "Direct route to Kedarnath and Badrinath shrines. Deluxe lodgings, vegetarian gourmet meals, and local coordinator support." },
                { title: "Char Dham Yatra Luxury Road Safari", duration: "12 Days / 11 Nights", price: "₹35,000", img: "/Kedarnath.png", tag: "Premium SUV", details: "Comfortable drive in premium SUVs with highly experienced mountain drivers. Premium ashram/hotel accommodation." }
              ].map((pkg, idx) => (
                <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 100}>
                  <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover:shadow-2xl transition-all duration-300 group">
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                          {pkg.tag}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#C9A25A] mb-1">
                          <Clock className="w-3 h-3" /> {pkg.duration}
                        </div>
                        <h3 className="text-base font-serif font-bold text-white mb-1">{pkg.title}</h3>
                        <p className="text-xs text-slate-300 font-light leading-relaxed">{pkg.details}</p>
                      </div>
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#E5C378]">{pkg.price}</span>
                        <Link to="/packages/char-dham-yatra" className="flex items-center gap-1 text-xs font-semibold text-white group-hover:text-[#C9A25A] transition-colors">
                          Reserve Slot <ArrowRight className="h-3.5 w-3.5 text-[#C9A25A]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 7. SINGAPORE COLLECTION PREVIEW */}
        <section className="py-24 container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <SectionHeading 
              kicker="Cosmopolitan Escapes"
              title="Singapore City Luxury"
              subtitle="Experience Singapore Skyline luxury. Private yacht retreats, sky-high gardens, and luxury boutique lodging packages."
              align="left"
              className="max-w-xl"
            />
            <Button variant="luxuryOutline" className="gap-2 border-[#C9A25A]/40 text-white hover:bg-[#C9A25A]/20" onClick={() => navigate('/packages/singapore')}>
              View Singapore Packages <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Marina Bay Sands Luxury Experience", duration: "5 Days / 4 Nights", price: "₹89,999", img: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800", details: "Exclusive suite booking at Marina Bay Sands, private infinity pool access, sky bar dining vouchers, and Gardens by the Bay passes." },
              { title: "Sentosa Island Private Yacht Retreat", duration: "6 Days / 5 Nights", price: "₹1,25,000", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800", details: "Five-star resort stays on Sentosa, private 4-hour yacht charter, private transfers, and Universal Studios VIP tickets." },
              { title: "Singapore & Malaysia Heritage cruise", duration: "8 Days / 7 Nights", price: "₹1,45,000", img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800", details: "Bespoke cruise cabin suite, private city tours in Singapore and Kuala Lumpur, Michelin dining, and concierge support." }
            ].map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 100}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover:shadow-2xl transition-all duration-300 group">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        International
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#C9A25A] mb-1">
                        <Clock className="w-3 h-3" /> {pkg.duration}
                      </div>
                      <h3 className="text-base font-serif font-bold text-white mb-1">{pkg.title}</h3>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">{pkg.details}</p>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#E5C378]">{pkg.price}</span>
                      <Link to="/packages/singapore" className="flex items-center gap-1 text-xs font-semibold text-white group-hover:text-[#C9A25A] transition-colors">
                        Inquire <ArrowRight className="h-3.5 w-3.5 text-[#C9A25A]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 8. EUROPE COLLECTION PREVIEW */}
        <section className="py-24 bg-[#050A18] border-y border-[#C9A25A]/15">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
              <SectionHeading 
                kicker="Continental Grandeur"
                title="Bespoke Europe Collection"
                subtitle="Travel the cultural landmarks of Europe. Indulge in private excursions, Alpine scenery, and custom Schengen visa support."
                align="left"
                className="max-w-xl"
              />
              <Button variant="luxuryOutline" className="gap-2 border-[#C9A25A]/40 text-white hover:bg-[#C9A25A]/20" onClick={() => navigate('/packages/europe')}>
                View All Europe Tours <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Alpine Switzerland & Paris Escape", duration: "10 Days / 9 Nights", price: "₹2,10,000", img: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=800", details: "Premium Swiss Glacier Express cabin, luxury Seine private cruise dinner, luxury boutique lodging in Paris/Interlaken." },
                { title: "Grand Europe Highlights Journey", duration: "15 Days / 14 Nights", price: "₹2,85,000", img: "/Europe Image New.png", details: "Grand tour covering France, Switzerland, Italy, and Germany. First-class rail connections, castle visits, and private drivers." },
                { title: "Alpine Switzerland & Italy Highlights", duration: "10 Days / 9 Nights", price: "₹2,25,000", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800", details: "Traverse scenic Swiss mountain passes and explore Italy's historical landmarks. First-class rail travel, private guides, and boutique lodging." }
              ].map((pkg, idx) => (
                <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 100}>
                  <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover:shadow-2xl transition-all duration-300 group">
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                          Schengen Guided
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#C9A25A] mb-1">
                          <Clock className="w-3 h-3" /> {pkg.duration}
                        </div>
                        <h3 className="text-base font-serif font-bold text-white mb-1">{pkg.title}</h3>
                        <p className="text-xs text-slate-300 font-light leading-relaxed">{pkg.details}</p>
                      </div>
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#E5C378]">{pkg.price}</span>
                        <Link to="/packages/europe" className="flex items-center gap-1 text-xs font-semibold text-white group-hover:text-[#C9A25A] transition-colors">
                          Customize <ArrowRight className="h-3.5 w-3.5 text-[#C9A25A]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 9. CUSTOMER REVIEWS (Interactive Horizontal Scroller) */}
        <section className="py-24 bg-[#0B1026] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(201,162,90,0.05),transparent_50%)] pointer-events-none" />
          <div className="container mx-auto px-6 relative z-10 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <SectionHeading 
                kicker="Client Journals"
                title="Verified Guest Testimonials"
                subtitle="True reviews from our travelers describing sacred pilgrimage darshans, luxury tents, and European customized tours."
                align="left"
                className="text-white max-w-2xl"
              />
              {/* Carousel Navigation Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => scrollTestimonials('left')}
                  className="p-3 rounded-full bg-white/5 border border-white/15 text-white hover:bg-amber-500 hover:border-amber-500 transition-all active:scale-95 shadow-md"
                  aria-label="Previous Testimonials"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => scrollTestimonials('right')}
                  className="p-3 rounded-full bg-white/5 border border-white/15 text-white hover:bg-amber-500 hover:border-amber-500 transition-all active:scale-95 shadow-md"
                  aria-label="Next Testimonials"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Track */}
            <div 
              ref={testimonialScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 scroll-smooth cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {(() => {
                const defaultMocks: GoogleReview[] = [
                  {
                    id: 'mock_1',
                    reviewer_name: 'Rajesh Gupta',
                    review_text: 'Our Char Dham Yatra with Ghumo Firoo was divine! The helicopter service to Kedarnath saved us so much time, and the guides were helpful. Darshan was beautifully coordinated.',
                    rating: 5,
                    location: 'Char Dham Yatra',
                    verified: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    hotel_rating: 5,
                    cab_rating: 5,
                    sightseeing_rating: 5,
                    trip_planning_rating: 5,
                    photos: ['/Kedarnath.png']
                  },
                  {
                    id: 'mock_2',
                    reviewer_name: 'Meera Shah',
                    review_text: 'Our 15-day Grand Europe Tour exceeded all expectations! From the romantic Seine cruise in Paris to the breathtaking Swiss Alps, every moment was magical. Exceptional planners.',
                    rating: 5,
                    location: 'Grand Europe',
                    verified: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    hotel_rating: 5,
                    cab_rating: 5,
                    sightseeing_rating: 5,
                    trip_planning_rating: 5,
                    photos: ['/Europe-Switzerland.png']
                  },
                  {
                    id: 'mock_3',
                    reviewer_name: 'Dr. Anil Sharma',
                    review_text: 'The Rann Utsav Heritage Tour was phenomenal! Stay in the premium Swiss Tents in Kutch felt outstanding. Camel safari and traditional performances were amazing.',
                    rating: 5,
                    location: 'Rann Utsav Gujarat',
                    verified: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    hotel_rating: 5,
                    cab_rating: 5,
                    sightseeing_rating: 5,
                    trip_planning_rating: 5,
                    photos: ['/Rann-Utsav-Gujarat.png']
                  }
                ];

                const displayReviews = reviews.length > 0 
                  ? [...reviews, ...defaultMocks.filter(m => !reviews.some(r => r.reviewer_name === m.reviewer_name))] 
                  : defaultMocks;

                return displayReviews.map((review) => {
                  const mainPhoto = (review.photos && review.photos.length > 0) 
                    ? review.photos[0] 
                    : (review.reviewer_photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face");

                  return (
                    <div 
                      key={review.id} 
                      className="w-[88vw] sm:w-[380px] md:w-[420px] flex-shrink-0 snap-center bg-gradient-to-b from-[#151D3B] via-[#0E152E] to-[#0A0F24] border border-amber-500/25 hover:border-amber-500/60 p-6 rounded-3xl backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between space-y-5 group"
                    >
                      {/* Top Row: Overall Rating & Verified Badge */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <div className="flex text-amber-400 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]' : 'text-slate-700'}`} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-white ml-1">{review.rating}.0</span>
                        </div>

                        {review.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full shadow-sm">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      {/* Review Text Quote */}
                      <p className="text-sm font-sans text-slate-100 font-normal italic leading-relaxed line-clamp-4 min-h-[64px]">
                        "{review.review_text}"
                      </p>

                      {/* Category Sub-Ratings Breakdown */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
                        <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center justify-between text-slate-200">
                          <span className="flex items-center gap-1">🏨 Hotel:</span>
                          <span className="font-bold text-amber-400">{review.hotel_rating || 5}.0★</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center justify-between text-slate-200">
                          <span className="flex items-center gap-1">🚗 Transport:</span>
                          <span className="font-bold text-amber-400">{review.cab_rating || 5}.0★</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center justify-between text-slate-200">
                          <span className="flex items-center gap-1">🏔️ Sightseeing:</span>
                          <span className="font-bold text-amber-400">{review.sightseeing_rating || 5}.0★</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center justify-between text-slate-200">
                          <span className="flex items-center gap-1">👨‍💼 Support:</span>
                          <span className="font-bold text-amber-400">{review.trip_planning_rating || 5}.0★</span>
                        </div>
                      </div>

                      {/* Traveler Profile Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-full overflow-hidden border-2 border-amber-500/50 flex-shrink-0 bg-slate-800 shadow-md">
                            <img src={mainPhoto} alt={review.reviewer_name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-white">{review.reviewer_name}</h4>
                            <p className="text-[11px] font-semibold text-amber-300">{review.location || 'Ghumo Firoo Journey'}</p>
                          </div>
                        </div>

                        {/* Extra Uploaded Trip Photos Thumbnails */}
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex items-center gap-1">
                            {review.photos.slice(0, 2).map((pUrl, pIdx) => (
                              <img 
                                key={pIdx} 
                                src={pUrl} 
                                alt="Trip photo" 
                                className="h-9 w-9 rounded-lg object-cover border border-amber-500/30 hover:scale-110 transition-transform cursor-pointer shadow"
                                onClick={() => window.open(pUrl, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="text-center mt-12">
              <Button variant="luxuryOutline" className="border-[#C9A25A] text-[#C9A25A] hover:bg-[#C9A25A] hover:text-[#0B1026]" onClick={() => navigate('/reviews')}>
                Read More Reviews
              </Button>
            </div>
          </div>
        </section>

        {/* 10. INSTAGRAM GALLERY */}
        <section className="py-24 container mx-auto px-6 max-w-7xl">
          <SectionHeading 
            kicker="Shared Moments"
            title="#GhumoFirooJourneys"
            subtitle="Catch a visual preview of real luxury excursions, pristine Swiss peaks, holy shrines, and Rann festivals captured by our guests."
            align="center"
            className="mx-auto mb-16"
          />

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&fit=crop&q=80",
              "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&fit=crop&q=80",
              "/Kedarnath.png",
              "/Rann-Utsav-Gujarat.png",
              "/Badrinath.png",
              "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=600&fit=crop&q=80"
            ].map((imgUrl, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10">
                <LazyImage src={imgUrl} alt={`Guest moment ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#0B1026]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                  <span className="text-[10px] uppercase tracking-widest text-[#C9A25A] font-bold">View Escape</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* 11. BLOG PREVIEW */}
        <section className="py-24 bg-[#050A18] border-t border-white/10">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
              <SectionHeading 
                kicker="Our Travel Chronicles"
                title="Bespoke Travel Journals"
                subtitle="Discover destination updates, visa requirements, helicopter checklists, and holiday packing tips from our writers."
                align="left"
                className="max-w-xl"
              />
              <Button variant="luxuryOutline" className="gap-2 border-[#C9A25A]/40 text-white hover:bg-[#C9A25A]/20" onClick={() => navigate('/blog')}>
                Read Travel Blog <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mockBlogs.map((blog, idx) => (
                <ScrollReveal key={blog.id} variant="fade-in-up" delay={idx * 100}>
                  <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover:shadow-2xl transition-all duration-300 group">
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <LazyImage src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[#C9A25A] font-bold mb-1">
                          {blog.date} • {blog.readTime}
                        </div>
                        <h3 className="text-base font-serif font-bold text-white mb-1">{blog.title}</h3>
                        <p className="text-xs text-slate-300 font-light leading-relaxed">{blog.excerpt}</p>
                      </div>
                      <div className="pt-3 border-t border-white/10 flex items-center justify-end">
                        <Link to="/blog" className="flex items-center gap-1 text-xs font-semibold text-[#C9A25A] hover:text-[#E5C378] transition-colors">
                          Read Article <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 12. FAQ (FAQAccordion) */}
        <section className="py-24 container mx-auto px-6 max-w-4xl">
          <SectionHeading 
            kicker="Assurance Details"
            title="Frequently Asked Questions"
            subtitle="Crucial information concerning bookings, customize steps, and VIP darshan helicopter yatras."
            align="center"
            className="mx-auto mb-16"
          />

          <ScrollReveal variant="fade-in" delay={150}>
            <FAQAccordion items={faqItems} />
          </ScrollReveal>
        </section>

        {/* 13. FOOTER & ACCREDITATIONS */}
        <FooterShell />

        {/* STICKY CTA ACTION TRIGGER */}
        <StickyCTA 
          packageName="Premium Holiday Consultation"
          priceText="Bespoke Design"
          priceSubtext="Free consultation on Char Dham & Europe"
          primaryLabel="Connect Travel Designer"
          onPrimaryClick={() => navigate('/contact')}
          onSecondaryClick={() => navigate('/packages')}
        />
      </main>
    </>
  );
};

export default Index;
