import React from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { Award, ShieldCheck, Heart, Users, MapPin, Phone, Mail, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const travelAgencySchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Ghumo Firoo Travels',
    alternateName: ['Ghumofiroo', 'Ghumo Firoo'],
    url: 'https://ghumofiroo.com',
    logo: 'https://ghumofiroo.com/ghumo-firoo-logo.png',
    image: 'https://ghumofiroo.com/ghumo-firoo-logo.png',
    description: 'Trusted Delhi travel agency specializing in Char Dham Yatra, Rann Utsav Kutch, Europe tours, and customized holiday packages.',
    telephone: '+919910987264',
    email: 'info@ghumofiroo.com',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Munirka',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      postalCode: '110067',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.5562,
      longitude: 77.1877,
    },
    founder: {
      '@type': 'Person',
      name: 'Navin Kumar Mishra',
      jobTitle: 'Founder & Managing Director',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '312',
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: [
      'https://www.facebook.com/ghumofiroo',
      'https://www.instagram.com/ghumofiroo',
    ],
  };

  return (
    <Layout>
      <SEO
        title="About Us | Ghumo Firoo Travels - Trusted Delhi Travel Agency"
        description="Learn about Ghumo Firoo Travels, our journey, mission, and experienced travel specialists providing customized holiday packages and 24x7 support."
        canonicalUrl="https://ghumofiroo.com/about"
        url="https://ghumofiroo.com/about"
        structuredData={travelAgencySchema}
      />

      {/* Hero Section */}
      <section 
        className="relative min-h-[45vh] bg-cover bg-center bg-no-repeat flex items-center justify-center py-20 px-4"
        style={{
          backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=1920&h=800&fit=crop')"
        }}
      >
        <div className="text-center text-white max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Award className="w-3.5 h-3.5" /> Ministry of Tourism & NIDHI Registered
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            About Ghumo Firoo Travels
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
            Your trusted travel partner for bespoke journeys, authentic cultural expeditions, and spiritual pilgrimages across India and the globe.
          </p>
        </div>
      </section>

      {/* Trust & Credibility Strip */}
      <section className="bg-slate-900 border-y border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-slate-200">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-400 font-bold text-xl mb-1">
              <Star className="w-5 h-5 fill-amber-400" /> 4.8 / 5.0
            </div>
            <p className="text-xs text-slate-400">312+ Verified Guest Reviews</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-emerald-400 mb-1">NIDHI Registered</span>
            <p className="text-xs text-slate-400">Ministry of Tourism Partner</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-blue-400 mb-1">Evoke Authorized</span>
            <p className="text-xs text-slate-400">Official Rann Utsav Partner</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-purple-400 mb-1">24x7 Concierge</span>
            <p className="text-xs text-slate-400">Dedicated On-Trip Support</p>
          </div>
        </div>
      </section>

      {/* Main Story Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-md">
                Our Journey & Legacy
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Crafting Meaningful Journeys With Care & Precision
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Ghumo Firoo Travels was founded with a clear, singular vision: to make holiday planning transparent, hassle-free, and truly personalized. Operating from New Delhi, our journey began with curated Himalayan pilgrimages and has expanded into a full-service travel company managing domestic and international holidays worldwide.
              </p>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Whether orchestrating a sacred Char Dham Yatra by helicopter, securing luxury Swiss cottages at Tent City Dhordo for Rann Utsav, or designing a bespoke Grand Europe holiday, our dedicated destination experts tailor every detail around your comfort, schedule, and preferences.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-700">Verified Quality Hotels</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-700">Transparent Pricing & No Hidden Fees</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-700">Experienced Private Drivers</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-700">Instant Digital Confirmations</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop" 
                  alt="Travelers enjoying scenic journey with Ghumo Firoo Travels"
                  className="w-full h-96 sm:h-[450px] object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-xl shadow-xl border border-slate-100 max-w-xs hidden sm:block">
                <p className="text-xs text-slate-500 font-medium">Customer Trust Score</p>
                <div className="flex items-center gap-1.5 text-2xl font-black text-slate-900 mt-0.5">
                  4.8 ★ <span className="text-xs font-normal text-slate-500">(98.4% recommendation rate)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Our Guiding Principles</h2>
            <p className="text-slate-600 text-sm mt-2">The pillars that define every itinerary and guest interaction</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To deliver seamless, personalized travel experiences that create lifelong memories while maintaining the highest standards of hospitality, safety, and client satisfaction.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To be India's most dependable and transparent travel agency, recognized for bespoke itineraries, verified on-ground logistics, and exceptional customer advocacy.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Our Values</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Integrity, client empathy, ethical pricing, and responsive communication guide our operations. We respect every traveler's time, investment, and travel aspirations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Expert Team Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-block text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-md mb-2">
              Leadership & Experience
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Meet the People Behind Your Journey
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Hands-on travel curators dedicated to making every booking effortless and dependable
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-200 border-4 border-white shadow-md shrink-0">
                <img 
                  src="/avatars/admin.png" 
                  alt="Navin Kumar Mishra - Founder Ghumo Firoo Travels"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="space-y-4 text-center sm:text-left">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Navin Kumar Mishra</h3>
                  <p className="text-sm font-semibold text-blue-600">Founder & Principal Travel Director</p>
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  "At Ghumo Firoo Travels, our philosophy is simple: we treat every guest's holiday as if it were our own family vacation. From personally auditing hotel properties and verifying cab drivers to offering direct 24x7 WhatsApp support during trips, our team ensures complete peace of mind from departure to return."
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Munirka, New Delhi
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> +91 9910987264
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-600" /> info@ghumofiroo.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Plan Your Next Vacation?
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto">
            Connect with our Delhi travel specialists today for customized holiday quotes, verified hotel packages, and 24x7 support.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/packages"
              className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-lg transition-colors"
            >
              Explore Tour Packages
            </Link>
            <Link
              to="/contact"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-7 py-3.5 rounded-xl font-bold text-sm backdrop-blur-sm transition-colors"
            >
              Contact Our Travel Desk
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
