import React from 'react';
import { usePackagePrice } from '@/hooks/usePackagePrice';
import { config } from '@/config';
import Layout from '@/components/Layout';
import PackageSEO from '@/components/seo/PackageSEO';
import { buildTouristTripJsonLd } from '@/components/seo/JsonLd';
import keywordMapping from '@/content/seo/keyword-mapping.json';
import FAQSection from '@/components/sections/FAQSection';

import { Link } from 'react-router-dom';

const CharDhamYatraFromHaridwar: React.FC = () => {
  const baseUrl = config.baseUrl;
  const canonical = `${baseUrl}/packages/char-dham-yatra-from-haridwar`;
  const kd = (keywordMapping as any)?.char_dham_yatra_haridwar;
  const metaKeywords = kd ? [...(kd.primary_keywords || []), ...(kd.secondary_keywords || [])].join(', ') : undefined;

  const title = 'Char Dham Yatra from Haridwar 2026';
  const description =
    'Plan Char Dham Yatra 2026 from Haridwar. Budget-friendly 10-day itineraries, group departures, AC transport, and local assistance.';
  const images = [`${baseUrl}/Badrinath.png`];
  const price = Number(usePackagePrice('char-dham-yatra-from-haridwar', 28500).replace(/[^0-9]/g, ''));

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
      { position: 1, name: 'Haridwar to Barkot' },
      { position: 2, name: 'Yamunotri Darshan' },
      { position: 3, name: 'Uttarkashi to Gangotri' },
      { position: 4, name: 'Guptkashi to Kedarnath' },
      { position: 5, name: 'Badrinath and return' }
    ],
    offer: {
      priceCurrency: 'INR',
      includes: 'Hotels, Meals, AC Transport, Assistance',
      price: String(price),
      validThrough: '2026-12-31',
      acceptedPaymentMethod: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI']
    },
    providerName: 'Ghumo Firoo Travels',
    duration: 'P10D',
    aggregateRating: { ratingValue: 4.7, reviewCount: 132 },
    destination: { name: 'Char Dham, Uttarakhand, India' }
  });

  return (
    <Layout>
      <PackageSEO
        title="Char Dham Yatra from Haridwar 2026 | Budget Packages & Itinerary"
        description={description}
        keywords={metaKeywords}
        canonical={canonical}
        images={images}
        price={price}
        rating={4.7}
        reviews={132}
        structuredData={jsonLd}
        skipProductSchema={true}
        faqs={charDhamFaqs}
        geo={{
          region: 'IN-UT',
          placename: 'Haridwar',
          position: '29.9457;78.1642',
          icbm: '29.9457,78.1642',
          latitude: '29.9457',
          longitude: '78.1642',
        }}
      />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Char Dham Yatra from Haridwar 2026</h1>
        <p className="text-gray-700 mb-8 leading-relaxed">
          Popular starting point with short itineraries and group-friendly pricing. Assistance throughout the yatra. 
          Start your spiritual quest from the holy city of Haridwar with Ghumo Firoo.
        </p>
        <div className="mb-12">
          <Link to="/enquire-now" className="inline-block bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all hover:scale-105">
            Enquire Now
          </Link>
        </div>

        <FAQSection 
          faqs={charDhamFaqs}
          title="Haridwar Char Dham Yatra FAQs"
          subtitle="Essential information for your spiritual journey from Haridwar."
        />
      </div>
    </Layout>
  );
};

export default CharDhamYatraFromHaridwar;
