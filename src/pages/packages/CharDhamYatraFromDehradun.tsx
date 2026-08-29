import React from 'react';
import { usePackagePrice } from '@/hooks/usePackagePrice';
import { config } from '@/config';
import Layout from '@/components/Layout';
import PackageSEO from '@/components/seo/PackageSEO';
import { buildTouristTripJsonLd } from '@/components/seo/JsonLd';
import keywordMapping from '@/content/seo/keyword-mapping.json';
import FAQSection from '@/components/sections/FAQSection';

import { Link } from 'react-router-dom';

const CharDhamYatraFromDehradun: React.FC = () => {
  const baseUrl = config.baseUrl;
  const canonical = `${baseUrl}/packages/char-dham-yatra-from-dehradun`;
  const kd = (keywordMapping as any)?.char_dham_yatra_dehradun;
  const metaKeywords = kd ? [...(kd.primary_keywords || []), ...(kd.secondary_keywords || [])].join(', ') : undefined;

  const title = 'Char Dham Helicopter Package from Dehradun 2026';
  const description =
    'Premium Char Dham 2026 helicopter packages from Dehradun with VIP darshan, minimal walking, and concierge assistance.';
  const images = [`${baseUrl}/Kedarnath.png`];
  const price = Number(usePackagePrice('char-dham-yatra-from-dehradun', 225000).replace(/[^0-9]/g, ''));

  const charDhamFaqs = [
    {
      question: "What is the best time for Char Dham Yatra in 2026?",
      answer: "The best time for Char Dham Yatra is from May to June and from September to October. The temples usually open on Akshaya Tritiya in May and close after Diwali in October or November."
    },
    {
      question: "How can I book a Char Dham Yatra by helicopter from Dehradun?",
      answer: "We offer premium 5-night / 6-day Char Dham Yatra packages by helicopter starting from Dehradun. The package includes VIP darshans at all four shrines, luxury accommodation, and all ground transfers. You can request a quote directly through our website."
    },
    {
      question: "Is medical fitness required for the Char Dham pilgrimage?",
      answer: "Yes, because of the high altitudes (up to 3,500m), we strongly recommend a medical check-up before your journey. Our luxury packages include assistance for seniors, and we advise all pilgrims to carry necessary medications for altitude sickness."
    },
    {
      question: "Which temples are visited in the Char Dham Yatra?",
      answer: "The traditional Char Dham Yatra in Uttarakhand covers four sacred shrines: Yamunotri, Gangotri, Kedarnath, and Badrinath. They are typically visited in this specific clockwise order starting from Yamunotri."
    }
  ];

  const jsonLd = buildTouristTripJsonLd({
    name: title,
    description,
    url: canonical,
    image: images,
    itinerary: [
      { position: 1, name: 'Dehradun to Yamunotri (Heli)' },
      { position: 2, name: 'Dehradun to Gangotri (Heli)' },
      { position: 3, name: 'Phata/Sersi to Kedarnath (Heli)' },
      { position: 4, name: 'Sahastradhara to Badrinath (Heli)' }
    ],
    offer: {
      priceCurrency: 'INR',
      includes: 'Helicopter flights, Meals, Ground transfers, VIP Darshan',
      price: String(price),
      validThrough: '2026-12-31',
      acceptedPaymentMethod: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI']
    },
    providerName: 'Ghumo Firoo Travels',
    duration: 'P6D',
    aggregateRating: { ratingValue: 4.9, reviewCount: 98 },
    destination: { name: 'Char Dham, Uttarakhand, India' }
  });

  return (
    <Layout>
      <PackageSEO
        title="Char Dham Helicopter Package from Dehradun 2026 | VIP Darshan"
        description={description}
        keywords={metaKeywords}
        canonical={canonical}
        images={images}
        price={price}
        rating={4.9}
        reviews={98}
        structuredData={jsonLd}
        skipProductSchema={true}
        faqs={charDhamFaqs}
        geo={{
          region: 'IN-UT',
          placename: 'Dehradun',
          position: '30.3165;78.0322',
          icbm: '30.3165,78.0322',
          latitude: '30.3165',
          longitude: '78.0322',
        }}
      />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Char Dham Helicopter Package from Dehradun 2026</h1>
        <p className="text-gray-700 mb-8 leading-relaxed">
          Designed for seniors and time-bound travelers. Dedicated coordinators and priority darshan at all Dhams. 
          Experience the divine peaks of the Himalayas without the physical strain of trekking.
        </p>
        <div className="mb-12">
          <Link to="/enquire-now" className="inline-block bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all hover:scale-105">
            Enquire Now
          </Link>
        </div>

        <FAQSection 
          faqs={charDhamFaqs}
          title="Heli-Yatra Frequently Asked Questions"
          subtitle="Everything you need to know about your comfortable spiritual journey."
        />
      </div>
    </Layout>
  );
};

export default CharDhamYatraFromDehradun;
