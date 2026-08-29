import React from 'react';
import { usePackagePrice } from '@/hooks/usePackagePrice';
import { config } from '@/config';
import Layout from '@/components/Layout';
import PackageSEO from '@/components/seo/PackageSEO';
import { buildTouristTripJsonLd } from '@/components/seo/JsonLd';
import keywordMapping from '@/content/seo/keyword-mapping.json';
import FAQSection from '@/components/sections/FAQSection';

import { Link } from 'react-router-dom';

const CharDhamYatraFromDelhi: React.FC = () => {
  const baseUrl = config.baseUrl;
  const canonical = `${baseUrl}/packages/char-dham-yatra-from-delhi`;
  const kd = (keywordMapping as any)?.char_dham_yatra_delhi;
  const metaKeywords = kd ? [...(kd.primary_keywords || []), ...(kd.secondary_keywords || [])].join(', ') : undefined;

  const title = 'Char Dham Yatra from Delhi 2026';
  const description =
    'Book Char Dham Yatra 2026 from Delhi with hotels, transfers, and expert assistance. 10–12 day road packages with upgradeable helicopter options.';
  const images = [`${baseUrl}/Yamunotri.png`];
  const price = Number(usePackagePrice('char-dham-yatra-from-delhi', 35000).replace(/[^0-9]/g, ''));

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
      { position: 1, name: 'Delhi to Haridwar' },
      { position: 2, name: 'Yamunotri Darshan' },
      { position: 3, name: 'Gangotri Darshan' },
      { position: 4, name: 'Kedarnath Trek/Darshan' },
      { position: 5, name: 'Badrinath Darshan' }
    ],
    offer: {
      priceCurrency: 'INR',
      includes: 'Hotels, Meals, AC Transport, Assistance',
      price: String(price),
      validThrough: '2026-12-31',
      acceptedPaymentMethod: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI']
    },
    providerName: 'Ghumo Firoo Travels',
    duration: 'P12D',
    aggregateRating: { ratingValue: 4.8, reviewCount: 156 },
    destination: { name: 'Char Dham, Uttarakhand, India' }
  });

  return (
    <Layout>
      <PackageSEO
        title="Char Dham Yatra from Delhi 2026 | Packages, Itinerary & Price"
        description={description}
        keywords={metaKeywords}
        canonical={canonical}
        images={images}
        price={price}
        rating={4.8}
        reviews={156}
        structuredData={jsonLd}
        skipProductSchema={true}
        faqs={charDhamFaqs}
        geo={{
          region: 'IN-DL',
          placename: 'New Delhi',
          position: '28.6139;77.2090',
          icbm: '28.6139,77.2090',
          latitude: '28.6139',
          longitude: '77.2090',
        }}
      />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Char Dham Yatra from Delhi 2026</h1>
        <p className="text-gray-700 mb-8 leading-relaxed">
          10–12 day pilgrimages with comfortable transport, curated hotels, and dedicated support. 
          Experience the spiritual essence of Devbhoomi Uttarakhand with Ghumo Firoo Travels.
        </p>
        <div className="mb-12">
          <Link to="/enquire-now" className="inline-block bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all hover:scale-105">
            Enquire Now
          </Link>
        </div>

        <FAQSection 
          faqs={charDhamFaqs}
          title="Delhi to Char Dham Yatra FAQs"
          subtitle="Everything you need to know about your pilgrimage starting from the capital."
        />
      </div>
    </Layout>
  );
};

export default CharDhamYatraFromDelhi;
