import React, { useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { Helmet } from 'react-helmet-async';
import {
  HelpCircle, CreditCard, MapPin, Plane, Compass, Shield,
  Building2, ChevronDown, Search, Phone, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'all', label: 'All Questions', icon: HelpCircle, color: 'from-gray-500 to-gray-600' },
  { id: 'about', label: 'About Us', icon: Building2, color: 'from-purple-500 to-purple-600' },
  { id: 'booking', label: 'Booking & Payment', icon: CreditCard, color: 'from-blue-500 to-blue-600' },
  { id: 'destinations', label: 'Destinations', icon: MapPin, color: 'from-green-500 to-green-600' },
  { id: 'visa', label: 'Visa & Docs', icon: Plane, color: 'from-sky-500 to-sky-600' },
  { id: 'pilgrimage', label: 'Char Dham Yatra', icon: Compass, color: 'bg-gradient-warm text-white' },
  { id: 'safety', label: 'Safety & Insurance', icon: Shield, color: 'from-red-500 to-red-600' },
];

const faqs = [
  // About
  { category: 'about', question: 'Who is Ghumo Firoo Travels?', answer: 'Ghumo Firoo Travels is a Delhi-based premium travel agency with 15+ years of experience. We are government-certified and have successfully organised journeys for over 50,000 travelers. We specialise in Char Dham Yatra, Rajasthan Heritage, Kashmir & Leh Ladakh, Europe tours, and emerging destinations like Georgia.' },
  { category: 'about', question: 'Are you a government-certified travel agency?', answer: 'Yes. Ghumo Firoo Travels holds all required certifications including registration with the Ministry of Tourism, Government of India. We are fully licensed to operate domestic and international tour packages.' },
  { category: 'about', question: 'Where is your office located?', answer: 'Our main office is in New Delhi. We also have virtual customer service available 7 days a week via phone, WhatsApp, and email. Visit our Contact page to find the complete address, office hours, and get in touch with our travel experts.' },
  { category: 'about', question: 'What makes Ghumo Firoo different from other travel agencies?', answer: 'We go beyond standard itineraries. Our USPs include: 100% customisable packages, transparent pricing (no hidden charges), 24/7 ground support during your trip, specialist teams for pilgrimage, adventure, and luxury travel, and a 99% customer satisfaction track record. We treat every journey as if we are planning it for our own family.' },

  // Booking & Payment
  { category: 'booking', question: 'How do I book a tour package?', answer: 'You can book by: (1) Filling our online enquiry form on the website, (2) Calling our helpline, (3) Messaging us on WhatsApp, or (4) Visiting our Delhi office. Our travel expert will reach out within 2 hours with a personalised itinerary. A 25% advance payment confirms your booking.' },
  { category: 'booking', question: 'What payment methods are accepted?', answer: 'We accept UPI (GPay, PhonePe, Paytm), Net Banking / NEFT / RTGS, credit and debit cards (Visa, Mastercard, RuPay), and EMI options (0% EMI available on select credit cards for packages above ₹50,000). All payments are secured with SSL encryption.' },
  { category: 'booking', question: 'Can I pay in instalments?', answer: 'Yes. For packages above ₹50,000, we offer flexible payment plans: 25% at booking, 50% one month before departure, and 25% one week before departure. 0% EMI is also available on select credit cards. Contact us to know more about our EMI options.' },
  { category: 'booking', question: 'What is your cancellation policy?', answer: 'Cancellations: 30+ days before travel = 90% refund. 15–29 days = 70% refund. 7–14 days = 50% refund. Less than 7 days = No refund (rescheduling allowed once free of charge). International packages follow airline and hotel-specific policies. Travel insurance is strongly recommended.' },
  { category: 'booking', question: 'Can I customise a package to my budget?', answer: 'Absolutely! Every single package we offer is fully customisable. You can choose your hotel category (budget/standard/luxury), travel mode (train/flight/private car), meal plan, and add or remove destinations. Our custom tour packages start from ₹15,000 per person. Just share your requirements and we will build your perfect trip.' },
  { category: 'booking', question: 'Do you offer group discounts?', answer: 'Yes! Groups of 10+ travelers receive a 10% discount. Groups of 20+ receive 15% off. We also offer special corporate travel packages and school/college group tour packages. For large group enquiries, contact our group travel desk directly.' },

  // Destinations
  { category: 'destinations', question: 'What are the top trending destinations for 2026?', answer: 'Our top trending destinations for 2026 are: Domestic — Kashmir (Gulmarg, Pahalgam), Leh Ladakh, Himachal Pradesh (Manali, Chitkul, Tirthan Valley), Uttarakhand (Char Dham, Valley of Flowers), Kerala Backwaters, and Rajasthan. International — Georgia (Tbilisi, Batumi, Kazbegi), Japan (Cherry Blossom), Turkey (Istanbul, Cappadocia), Bali, and Europe (France, Switzerland, Italy). Georgia is 2026\'s biggest breakout destination.' },
  { category: 'destinations', question: 'When is the best time to visit Kashmir?', answer: 'Kashmir is beautiful year-round. March–May: tulip season, perfect weather for sightseeing. June–August: ideal for Pahalgam trekking and Sonamarg valley. September–November: gorgeous autumn Chinar forests. December–February: snow season, perfect for Gulmarg skiing. Peak season (April–June & September–October) should be booked 3+ months in advance.' },
  { category: 'destinations', question: 'What is the best Leh Ladakh tour package?', answer: 'Our most popular Leh Ladakh packages are: 7-night Leh Ladakh by road from Manali (₹35,000/person) and 10-night Leh Ladakh fly-drive with Nubra Valley, Pangong Lake, and Tso Moriri (₹65,000/person). The best time to visit is June–September. All packages include acclimatisation days, oxygen support, and 24/7 emergency contact.' },
  { category: 'destinations', question: 'Is Georgia worth visiting for Indian tourists?', answer: 'Georgia is absolutely worth it! For Indians in 2026, Georgia offers: easy e-visa (₹3,000–₹5,000), stunning variety (mountains, coast, wine country, old cities), very affordable food and stay, direct flights from Delhi and Mumbai, and warm hospitality. Tbilisi\'s ancient Old Town, Batumi\'s Black Sea beaches, and Kazbegi\'s mountains create a diverse 7–10 day itinerary unlike any other.' },
  { category: 'destinations', question: 'What are the best offbeat destinations in India?', answer: 'Our expert picks for offbeat India in 2026: Tirthan Valley & Barot (Himachal Pradesh) — zero crowds, trout fishing; Chitkul — last inhabited India-Tibet border village; Majuli Island (Assam) — world\'s largest river island; Sandakphu (West Bengal) — views of four 8000m peaks; Hampi (Karnataka) — UNESCO ruins; Coorg (Karnataka) — coffee estates & waterfalls. All available as custom packages from Delhi.' },

  // Visa
  { category: 'visa', question: 'Do you provide visa assistance?', answer: 'Yes, comprehensive visa support is included in all our international packages. Services include: documentation checklist, appointment booking (embassy/VAC), application review, cover letter drafting, tracking, and post-submission follow-up. We handle Schengen (Europe), UAE/Dubai, Thailand, Bali, Singapore, Japan, Turkey, Georgia e-visa, and more. Visa fees are charged at actuals.' },
  { category: 'visa', question: 'How early should I apply for a Schengen visa?', answer: 'Apply at least 3 months before your Europe travel date. Embassy appointments fill up fast, especially April–July and November–December. After appointment, processing takes 10–15 working days. Our visa team tracks your application and keeps you updated at every step. A rejected visa is partially refundable — we help re-apply with a stronger application.' },
  { category: 'visa', question: 'Which countries are visa-free for Indian passport holders?', answer: 'Visa-free or visa-on-arrival destinations for Indians include: Thailand (30 days VoA), Indonesia/Bali (30 days VoA), Nepal (free), Sri Lanka (30 days ETA), Maldives (30 days), Bhutan (permit required), Mauritius (60 days), Georgia (365 days), Qatar (30 days VoA), and many Caribbean islands. Always verify current rules before booking as policies change.' },
  { category: 'visa', question: 'What documents are typically required for an international tour?', answer: 'Standard documents: Valid passport (6 months validity beyond travel), visa as required, return flight tickets, hotel booking confirmations, travel insurance, bank statements (last 6 months), ITR / salary slips, passport-size photos, and invitation letter if applicable. Specific requirements vary by country. Our visa team provides a tailored checklist for each destination.' },

  // Char Dham
  { category: 'pilgrimage', question: 'What is Char Dham Yatra?', answer: 'Char Dham Yatra is the most sacred Hindu pilgrimage circuit in India, visiting four holy shrines in Uttarakhand: Yamunotri (source of Yamuna river), Gangotri (source of Ganga river), Kedarnath (one of the 12 Jyotirlingas), and Badrinath (one of the four dhams). The traditional route is completed from west to east, starting from Yamunotri and ending at Badrinath. It holds immense spiritual significance for Hindus.' },
  { category: 'pilgrimage', question: 'When does Char Dham Yatra 2026 open?', answer: 'Char Dham 2026 portals will open in late April / early May on auspicious dates (Akshaya Tritiya). The closing dates are in October–November before Diwali. Kedarnath typically opens on Akshaya Tritiya and closes on Bhai Dooj. Badrinath opens a few days later. We recommend booking your package by March 2026 for peak season travel (May–June).' },
  { category: 'pilgrimage', question: 'How do I register for Char Dham Yatra 2026?', answer: 'Online registration on the Uttarakhand Tourism / Devasthanam Board portal is mandatory. You need: Aadhaar Card, mobile number, photograph. As part of our package, we handle the complete registration process for you. We book your time slots in advance and ensure all paperwork is in order before your departure. No hassle for you at all.' },
  { category: 'pilgrimage', question: 'Is Char Dham Yatra suitable for senior citizens?', answer: 'Yes, with proper planning. We strongly recommend the helicopter package for senior citizens aged 65+ or those with cardiac, respiratory, or knee conditions. For road-based yatra, we provide: slow-paced itinerary with acclimatisation days, comfortable vehicle with experienced mountain driver, on-call medical assistance, easy hotel/dharamshala bookings, and ponies/palanquins for the Kedarnath trek. Consult your doctor before booking.' },
  { category: 'pilgrimage', question: 'What is the cost of Char Dham Yatra package from Delhi?', answer: 'Our Char Dham packages from Delhi: Budget road package (12 days) — ₹35,000/person. Standard package with better hotels (14 days) — ₹55,000/person. Premium/luxury package (14 days) — ₹90,000/person. Helicopter package (5–6 days, all four dhams) — from ₹1,50,000/person. Prices are for double sharing including accommodation, transport, meals (MAP), and registration assistance. Solo/triple occupancy available.' },

  // Safety
  { category: 'safety', question: 'Is travel insurance included?', answer: 'Travel insurance is included in all international packages (covering medical emergency, trip cancellation, baggage loss, and flight delay up to ₹10 lakh). For domestic packages, insurance is available as an optional add-on at ₹500–₹1,500 per person depending on the destination and duration. We strongly recommend insurance for high-altitude and adventure destinations.' },
  { category: 'safety', question: 'Are your tours safe for solo female travelers?', answer: 'Yes. We have 15,000+ solo women who have traveled safely with us. Our commitments: all drivers and guides are background-verified, accommodation is vetted for solo traveler safety, female tour managers available on request, 24/7 WhatsApp emergency line, and group tour options where you travel with other like-minded travelers. Our women-only group tours to Rajasthan, Kerala, and Himachal are especially popular.' },
  { category: 'safety', question: 'What health precautions are needed for Leh Ladakh or Char Dham?', answer: 'High-altitude health tips: (1) Visit your doctor 2 weeks before travel. (2) Carry Diamox (acetazolamide) as prescribed. (3) Stay hydrated — drink 3–4 litres of water daily. (4) Avoid alcohol for 48 hours after arriving at altitude. (5) Acclimatise gradually — do not rush to higher altitudes. (6) Watch for AMS symptoms (headache, nausea, fatigue). Our Leh packages include built-in acclimatisation days and oxygen support.' },
  { category: 'safety', question: 'Do you have 24/7 emergency support?', answer: 'Yes, absolutely. On every tour: dedicated tour WhatsApp group with live updates, 24/7 emergency helpline, on-ground local support contacts, pre-arranged hospital partnerships at key destinations, and for international tours — embassy contacts and overseas partner coordination. You are never alone on a Ghumo Firoo tour.' },
];

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = faqs.filter(f => {
    const matchCat = activeCategory === 'all' || f.category === activeCategory;
    const matchSearch = !searchQuery ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <Layout>
      <SEO
        title="FAQ — Ghumo Firoo Travels | Travel Questions Answered 2026"
        description="Get answers to all your travel questions. Char Dham registration, visa tips, Kashmir tours, booking process, safety, insurance and more — from India's top travel agency."
        keywords="Char Dham Yatra FAQ 2026, travel agency FAQ India, Kashmir tour questions, Europe tour from India FAQ, visa assistance India, Ghumo Firoo FAQ"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#0a1128] via-[#1c2541] to-[#0a1128] pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white px-5 py-2 rounded-full text-sm font-semibold mb-6 border border-white/30">
            <HelpCircle className="w-4 h-4" /> Help Centre
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Frequently Asked<br />
            <span className="text-yellow-300">Questions</span>
          </h1>
          <p className="text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
            Everything you need to know about our tours, booking process, visa assistance, Char Dham Yatra, and more — all in one place.
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions... (e.g. Char Dham, visa, cancellation)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl text-gray-800 bg-white shadow-2xl focus:outline-none focus:ring-2 focus:ring-accent text-base"
            />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-wrap justify-center gap-8">
          {[['30+', 'Questions Answered'], ['6', 'Topic Categories'], ['24/7', 'Expert Support'], ['50K+', 'Happy Travelers']].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-extrabold text-accent">{num}</div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="bg-gradient-to-b from-accent/5 to-background min-h-screen py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setOpenItem(null); }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                    isActive
                      ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg scale-105`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-accent hover:text-accent hover:shadow-md'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {(activeCategory === cat.id || cat.id === 'all'
                      ? (cat.id === 'all' ? faqs : faqs.filter(f => f.category === cat.id))
                      : faqs.filter(f => f.category === cat.id)
                    ).length}
                  </span>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-400">Try a different search term or browse all categories.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq, i) => {
                const isOpen = openItem === i;
                return (
                  <div
                    key={i}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'border-accent/25 shadow-xl shadow-accent/5 bg-white/40 dark:bg-card'
                        : 'border-gray-100 bg-white hover:border-accent/20 hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => setOpenItem(isOpen ? null : i)}
                      className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left group"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className={`mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${
                          isOpen ? 'bg-accent text-white' : 'bg-accent/10 text-accent'
                        }`}>
                          {i + 1}
                        </span>
                        <span className={`font-semibold text-base leading-snug transition-colors ${
                          isOpen ? 'text-accent' : 'text-foreground group-hover:text-accent'
                        }`}>
                          {faq.question}
                        </span>
                      </div>
                      <span className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen ? 'bg-accent text-white rotate-180' : 'bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="px-6 pb-6 pt-0 pl-16">
                        <div className="border-t border-accent/10 pt-4 text-gray-600 leading-relaxed text-[15px]">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-5 p-7 bg-green-50 border-2 border-green-100 rounded-3xl hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Chat on WhatsApp</p>
                <p className="text-green-600 font-semibold text-sm">Usually replies in under 5 min</p>
                <p className="text-gray-500 text-xs mt-1">Available 7 days a week, 8 AM – 10 PM</p>
              </div>
            </a>
            <Link
              to="/contact"
              className="group flex items-center gap-5 p-7 bg-blue-50 border-2 border-blue-100 rounded-3xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Call / Email Us</p>
                <p className="text-blue-600 font-semibold text-sm">Talk to a travel expert today</p>
                <p className="text-gray-500 text-xs mt-1">Mon–Sat 9 AM – 7 PM, Sun 10 AM – 5 PM</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
