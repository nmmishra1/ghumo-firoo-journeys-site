
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
      <section className="bg-[#050A18] py-8 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <FAQSection 
            faqs={contactFaqs} 
            title="Contact & Booking FAQs" 
            subtitle="Common questions about reaching us and starting your travel planning."
            className="py-0 bg-transparent text-white"
            dark={true}
          />
        </div>
      </section>

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
    </Layout>
  );
};

export default Contact;
