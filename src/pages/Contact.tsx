
import React from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { buildTravelAgencyJsonLd } from '@/components/seo/JsonLd';
import ContactHero from '@/components/contact/ContactHero';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import FAQSection from '@/components/sections/FAQSection';
import { pushEvent } from '@/lib/analytics';
const Contact = () => {
  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.6547631313426!2d77.16911131508083!3d28.549333982444654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1de722622933%3A0xc00922650965e31e!2sMunirka%20Metro%20Station%20Gate%20No.%203!5e0!3m2!1sen!2sin!4v1683284567890!5m2!1sen!2sin";
  
  const structuredData = buildTravelAgencyJsonLd({
    name: "Ghumo Firoo Travels",
    description: "Premium travel agency in Delhi providing customized domestic and international tour packages with 24/7 support.",
    url: "https://ghumofiroo.com/contact",
    logo: "https://ghumofiroo.com/ghumo-firoo-logo.png",
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
    priceRange: "₹₹ - ₹₹₹₹",
    image: "https://ghumofiroo.com/Ghumo_Firoo.png",
    sameAs: [
      "https://www.facebook.com/GhumoFirooTravels",
      "https://www.instagram.com/ghumofirootravels",
      "https://maps.google.com/?cid=13837651037593674526"
    ]
  });
  
  const contactFaqs = [
    {
      question: "What are the office hours of Ghumo Firoo Travels in Delhi?",
      answer: "Our main office in Munirka, New Delhi, is open Monday to Saturday from 9:00 AM to 6:00 PM, and on Sundays from 10:00 AM to 4:00 PM. Our customer support helpline is available 24/7 for all travelers currently on their journeys."
    },
    {
      question: "How can I get a quote for a customized international tour?",
      answer: "Getting a quote is easy! You can fill out the enquiry form on our website, call us directly at +91-9910987264, or message us on WhatsApp. Our experts will design a personalized itinerary and provide a quote within 24 hours."
    },
    {
      question: "Does Ghumo Firoo Travels provide assistance with Europe visa applications?",
      answer: "Yes, we provide complete visa assistance for all our international tour packages, especially for Schengen (Europe) visas. We help with document preparation, flight reservations, and hotel vouchers to ensure a smooth application process."
    },
    {
      question: "Can I visit your office for a personal travel consultation?",
      answer: "We would love to meet you! Our office is conveniently located near Munirka Metro Station (Gate No. 3). You can visit us for a face-to-face consultation to discuss your travel plans and customize your dream vacation."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": contactFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Layout>
      <SEO 
        title="Contact Us - Ghumo Firoo Travels | Plan Your Perfect Journey"
        description="Contact Ghumo Firoo Travels for custom tour packages. Call +91-9910987264 or visit our Delhi office for expert travel planning & support."
        keywords="contact Ghumo Firoo Travels, Ghumofiroo contact, Ghumo Firo contact, Ghumo Phiro contact, Ghumophiro contact, travel agency contact Delhi, tour booking contact Delhi, Delhi travel agent, travel agency in Delhi, travel agency near Munirka, travel agency near Metro Gate 3, New Delhi travel services, travel consultation Delhi, custom tour packages contact, travel agent in South Delhi, tour operator Delhi contact, travel agency Munirka, Delhi travel booking, travel services New Delhi, best travel agency Delhi contact, travel planning Delhi, tour packages Delhi, travel agency near me Delhi, ghumophirotravel alternative contact, travel agent contact Delhi, Delhi tour operator contact, travel consultation New Delhi"
        canonicalUrl="https://ghumofiroo.com/contact"
        ogImage="https://ghumofiroo.com/ghumo-firoo-logo.png"
        geo={{
          region: 'IN-DL',
          placename: 'New Delhi',
          position: '28.549333982444654;77.16911131508083',
          icbm: '28.549333982444654,77.16911131508083',
          latitude: '28.549333982444654',
          longitude: '77.16911131508083',
        }}
        structuredData={[structuredData, faqSchema]}
      />
      <ContactHero />
      
      {/* Contact Form and Info */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 px-2">
              Get in <span className="text-accent">Touch</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Ready to plan your next adventure? Contact us today and let's create unforgettable memories together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            <div className="order-2 xl:order-1">
              <ContactForm />
            </div>
            <div className="order-1 xl:order-2">
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection 
        faqs={contactFaqs} 
        title="Contact & Booking FAQs" 
        subtitle="Common questions about reaching us and starting your travel planning."
        className="bg-gray-50"
      />

      {/* Google Maps Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Find Us on Map
            </h2>
            <p className="text-gray-700 text-xl max-w-2xl mx-auto leading-relaxed">
              Visit our office for personalized travel consultation and let's plan your dream journey together
            </p>
          </div>
          
          <div className="relative group animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Map container with modern styling */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm bg-white/10 p-2">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ghumo Firoo Travels Location"
                  className="transition-all duration-500 group-hover:scale-105"
                />
              </div>
              
              {/* Overlay gradient for better integration */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none rounded-3xl"></div>
            </div>
            
            {/* Location badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-semibold text-sm">Our Office Location</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Chat Icon */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <a
          href="https://wa.me/919910987264"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { try { pushEvent('whatsapp_click', { source: 'contact_page_fab' }); } catch {} }}
          className="relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-bounce"
        >
          {/* Pulse ring animation */}
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
          <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-30"></div>
          
          <svg className="w-8 h-8 relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Chat with us on WhatsApp
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </a>
      </div>
    </Layout>
  );
};

export default Contact;
