import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Plane, MapPin, CreditCard, Shield, Compass } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const categories = [
  { id: 'all', label: 'All FAQs', icon: HelpCircle },
  { id: 'booking', label: 'Booking & Payment', icon: CreditCard },
  { id: 'destinations', label: 'Destinations', icon: MapPin },
  { id: 'visa', label: 'Visa & Docs', icon: Plane },
  { id: 'pilgrimage', label: 'Char Dham', icon: Compass },
  { id: 'safety', label: 'Safety & Insurance', icon: Shield },
];

const faqs = [
  // Booking & Payment
  {
    category: 'booking',
    question: 'How do I book a tour package with Ghumo Firoo Travels?',
    answer: 'Booking with us is simple! You can fill out our enquiry form online, call us at our helpline, or visit our Delhi office. Once you share your travel dates and preferences, our travel experts will curate a customised itinerary within 24 hours. A 25% advance confirms your booking, with the balance due 7 days before departure.',
  },
  {
    category: 'booking',
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI (GPay, PhonePe, Paytm), NEFT/RTGS bank transfer, credit/debit cards (Visa, Mastercard, RuPay), and EMI options for packages above ₹50,000. All transactions are secured with SSL encryption and you receive an instant payment confirmation.',
  },
  {
    category: 'booking',
    question: 'What is your cancellation and refund policy?',
    answer: 'Cancellations made 30+ days before departure receive a 90% refund. Cancellations 15–29 days before departure receive 70% refund. 7–14 days: 50% refund. Less than 7 days: no refund, but you may reschedule once free of charge. International packages follow airline and hotel cancellation policies. Please read our full Refund Policy for details.',
  },
  {
    category: 'booking',
    question: 'Can I customise a tour package to fit my budget?',
    answer: 'Absolutely! All our packages are 100% customisable. Whether you want to upgrade hotels, add extra destinations, extend the trip, or reduce the duration, we tailor every itinerary to your budget and preferences. Our custom tour packages start from as low as ₹15,000 per person.',
  },
  // Destinations
  {
    category: 'destinations',
    question: 'What are the best places to visit in India in 2026?',
    answer: 'The top trending destinations for 2026 include: Kashmir (Gulmarg, Pahalgam, Sonamarg) for its breathtaking landscapes, Leh Ladakh for adventure seekers, Rajasthan (Jaisalmer, Udaipur, Jaipur) for royal heritage, Kerala Backwaters for serene houseboat experiences, and Himachal Pradesh\'s offbeat valleys like Tirthan and Barot. Internationally, Georgia (Tbilisi, Batumi) is the hottest new destination for Indian travelers in 2026.',
  },
  {
    category: 'destinations',
    question: 'What are the best international tour packages from India in 2026?',
    answer: 'Our most popular international packages in 2026 are: Europe Grand Tour (15 days, Paris to Rome), Georgia Adventure (7 days, Tbilisi + Batumi), Dubai Delights (5 days), Thailand (Phuket + Bangkok, 7 days), Bali Paradise (6 days), Singapore & Malaysia (8 days), and Japan Cherry Blossom tours. Georgia and Southeast Asia packages are seeing the highest demand from Indian travelers.',
  },
  {
    category: 'destinations',
    question: 'When is the best time to visit Kashmir?',
    answer: 'Kashmir is beautiful year-round: Spring (March–May) features tulip gardens and blooming valleys — ideal for sightseeing. Summer (June–August) offers cool weather perfect for Pahalgam trekking. Autumn (September–November) brings the famous Chinar leaf-changing spectacle. Winter (December–February) is magical for snow activities and Gulmarg skiing. Our experts recommend April–June and September–October for the best overall experience.',
  },
  {
    category: 'destinations',
    question: 'Is Georgia a good destination for Indian tourists?',
    answer: 'Yes! Georgia is one of the most Indian-friendly international destinations in 2026. Indian passport holders can get a visa-on-arrival or e-visa easily. The country offers stunning mountain landscapes (Kazbegi), coastal charm (Batumi on the Black Sea), ancient wine culture (Kakheti), and the historic capital Tbilisi — all at a fraction of European costs. Our 7-day Georgia package starts from ₹65,000 per person including flights.',
  },
  // Visa
  {
    category: 'visa',
    question: 'Do you provide visa assistance for international tours?',
    answer: 'Yes, we provide end-to-end visa assistance for all international destinations including Schengen (Europe), Dubai, Thailand, Bali (Indonesia), Singapore, Japan, Turkey, and Georgia. Our dedicated visa team helps with documentation, appointment booking, cover letters, and follows up with the embassy on your behalf. Visa fees are charged at actuals.',
  },
  {
    category: 'visa',
    question: 'How early should I apply for a Schengen visa from India?',
    answer: 'We recommend applying for your Schengen visa at least 3 months before your travel date. Appointments at European embassies in Delhi and Mumbai get booked quickly, especially during peak season (April–July and December). Our visa team can help you get the earliest available appointment. Processing typically takes 10–15 working days after submission.',
  },
  {
    category: 'visa',
    question: 'Which countries offer visa-free or visa-on-arrival access to Indian passport holders?',
    answer: 'Popular visa-free or visa-on-arrival destinations for Indians include: Thailand (30 days, visa-on-arrival), Indonesia/Bali (30 days), Maldives (30 days), Nepal, Sri Lanka, Mauritius, Georgia, Bhutan, and Qatar. Countries like UAE (Dubai), Singapore, and Japan require advance visa applications. We handle all visa types for our tour packages.',
  },
  // Char Dham
  {
    category: 'pilgrimage',
    question: 'What is the best time to do Char Dham Yatra in 2026?',
    answer: 'The Char Dham Yatra 2026 portals open in late April/early May (Akshaya Tritiya) and close in October/November (Diwali season). The best time to visit is May–June and September–October. July–August is the monsoon season with heavy rainfall and possible road closures. We recommend booking well in advance as 2026 is expected to see record pilgrim numbers.',
  },
  {
    category: 'pilgrimage',
    question: 'How do I register for Char Dham Yatra 2026?',
    answer: 'Char Dham Yatra registration is mandatory and done through the official Uttarakhand Tourism portal (devasthanam.in). You need to register online with your Aadhaar card. As part of our package, our team handles the entire registration process for you — just share your details and we take care of slot booking, biometric registration if required, and all documentation.',
  },
  {
    category: 'pilgrimage',
    question: 'What is the difference between Char Dham by helicopter vs. by road?',
    answer: 'Char Dham by helicopter (5–6 days) is ideal for senior citizens, those with health conditions, or anyone with limited time. It covers all four dhams — Yamunotri, Gangotri, Kedarnath, and Badrinath — with minimum physical exertion, though costs are significantly higher (from ₹1.5 lakh per person). By road (10–14 days) is the traditional route offering a deeply immersive spiritual experience, scenic mountain drives, and a more economical cost (from ₹35,000 per person). We offer both options with 24/7 on-ground support.',
  },
  {
    category: 'pilgrimage',
    question: 'What does your Char Dham package include?',
    answer: 'Our comprehensive Char Dham Yatra packages include: return transport from Delhi/Haridwar, hotel/dharamshala accommodation, breakfast and dinner (MAP), Yatra registration assistance, experienced puja pandits, medical kit, 24/7 emergency helpline, and a dedicated tour escort. We also offer optional helicopter upgrades for individual dhams (especially Kedarnath).',
  },
  // Safety
  {
    category: 'safety',
    question: 'Is travel insurance included in your tour packages?',
    answer: 'Basic travel insurance is included in all our international packages. For domestic packages, it is available as an optional add-on. Our travel insurance covers trip cancellation, medical emergencies, baggage loss, flight delays, and emergency evacuation. For Char Dham Yatra, we strongly recommend our altitude sickness and trekking accident coverage. Premium insurance plans are available for senior citizens.',
  },
  {
    category: 'safety',
    question: 'How safe are your tours for solo female travelers?',
    answer: 'Ghumo Firoo has a dedicated "Women Safe Travel" initiative. All our accommodations are vetted for safety, our drivers and guides undergo background checks, and we provide 24/7 WhatsApp support. Our solo female traveler packages to Rajasthan, Kerala, Himachal, and international destinations include female guides on request. Over 15,000 solo women have traveled with us safely.',
  },
  {
    category: 'safety',
    question: 'What health precautions should I take for high-altitude destinations like Leh Ladakh or Char Dham?',
    answer: 'For high-altitude destinations (above 3,500m), we recommend: consult your doctor 2 weeks before travel, acclimatize gradually (avoid rushing to high altitude), stay hydrated (3–4 litres of water/day), avoid alcohol for the first 48 hours, carry Diamox (acetazolamide) as prescribed by your doctor, and have comprehensive travel insurance. Our Leh Ladakh packages are designed with built-in acclimatization days in Leh before higher excursions.',
  },
  {
    category: 'safety',
    question: 'Do you have 24/7 emergency support during tours?',
    answer: 'Yes, we provide round-the-clock emergency support on all our tours. You will have a dedicated WhatsApp group with your tour manager, a 24/7 emergency helpline (+91 XXXXX XXXXX), local ground support contacts, and hospital tie-ups at major destinations. For international tours, we also coordinate with local embassy contacts and our overseas partners for any emergencies.',
  },
  {
    category: 'safety',
    question: 'Are your tour packages suitable for senior citizens?',
    answer: 'Absolutely! We have specially designed "Senior Comfort" packages with: wheelchair-accessible transport, ground-floor hotel rooms on request, slower-paced itineraries with more rest time, medical assistance on board, easy pilgrimage options (helicopter for Char Dham), and senior citizen discounts up to 10%. Our Char Dham by helicopter is especially popular among pilgrims aged 60+.',
  },
];

const HomeFAQSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItem, setOpenItem] = useState<number | null>(0);

  const filtered = activeCategory === 'all' ? faqs : faqs.filter(f => f.category === activeCategory);

  // FAQ JSON-LD schema
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
    <section className="py-24 relative overflow-hidden" id="faq">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50/30 to-white pointer-events-none" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-accent/10/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-5 py-2 rounded-full text-sm font-semibold mb-5 shadow-sm">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            Got Questions?{' '}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              We've Got Answers
            </span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about booking, destinations, visas, and planning your dream journey with Ghumo Firoo Travels.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setOpenItem(0); }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent shadow-lg shadow-accent/15 scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-accent/40 hover:text-accent hover:shadow-md'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Count badge */}
        <p className="text-center text-sm text-gray-400 mb-6">
          Showing <span className="font-semibold text-accent">{filtered.length}</span> questions
        </p>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filtered.map((faq, i) => {
            const isOpen = openItem === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-accent/30 shadow-lg shadow-orange-50 bg-white'
                    : 'border-gray-100 bg-white/80 hover:border-accent/20 hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => setOpenItem(isOpen ? null : i)}
                  className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className={`font-semibold text-base leading-snug transition-colors ${isOpen ? 'text-accent' : 'text-gray-800 group-hover:text-accent'}`}>
                    {faq.question}
                  </span>
                  <span className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-accent text-white rotate-180' : 'bg-gray-100 text-gray-500 group-hover:bg-accent/10 group-hover:text-accent'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-6 pt-0">
                    <div className="border-t border-orange-50 pt-4 text-gray-600 leading-relaxed text-[15px]">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-accent/15">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent rounded-3xl" />
          <div className="relative">
            <div className="text-4xl mb-3">✈️</div>
            <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
            <p className="text-white/85 mb-6 text-lg max-w-md mx-auto">
              Our travel experts are available 7 days a week to help you plan the perfect journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+919910987264"
                className="inline-flex items-center gap-2 bg-white text-accent font-bold px-7 py-3.5 rounded-2xl hover:bg-accent/10 transition-all hover:scale-105 shadow-lg text-sm"
              >
                📞 +91-9910987264
              </a>
              <a
                href="https://wa.me/919910987264"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-green-600 transition-all hover:scale-105 shadow-lg text-sm"
              >
                💬 WhatsApp
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/30 text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-white/25 transition-all hover:scale-105 text-sm"
              >
                📧 Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeFAQSection;
