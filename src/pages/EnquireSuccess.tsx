import React from 'react';
import { config } from '@/config';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package, Home, MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const EnquireSuccess: React.FC = () => {
  const baseUrl = config.baseUrl;
  const canonicalUrl = `${baseUrl}/enquire-success`;

  const whatsappUrl = (message: string) => {
    const phone = '919910987264';
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const defaultMessage = `Hi Ghumo Firoo Travels, I just submitted an enquiry on your website. Please help me plan my trip.`;

  return (
    <Layout>
      <Helmet>
        <title>Enquiry Received | Ghumo Firoo Travels</title>
        <meta name="description" content="Thank you for your enquiry. Our experts will contact you within 24 hours. For urgent queries, call +91-9910987264 or chat on WhatsApp." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
  <meta property="og:title" content="Enquiry Received | Ghumo Firoo Travels" />
        <meta property="og:description" content="We will contact you within 24 hours with a tailored itinerary. For urgent queries, call +91-9910987264 or chat on WhatsApp." />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>

      <section className="relative bg-gradient-to-b from-green-50 to-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You! Your Enquiry Is In.</h1>
          <p className="text-lg text-gray-600 mb-8">
            Our travel experts will review your request and get back to you within 24 hours with a custom plan.
            We appreciate your interest in Ghumo Firoo Travels.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Link to="/products" className="block">
              <Button className="w-full" size="lg">
                <Package className="w-4 h-4 mr-2" />
                Browse Packages
              </Button>
            </Link>
            <Link to="/custom-tour-packages" className="block">
              <Button className="w-full bg-accent hover:bg-accent" size="lg">
                Plan Custom Trip
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href={whatsappUrl(defaultMessage)} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full" size="lg">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>

          <div className="mt-10 text-sm text-gray-500">
            <p>
              If you need immediate assistance, call us at{' '}
              <a href="tel:+919910987264" className="text-accent font-semibold">+91 9910987264</a>{' '}
              or email{' '}
              <a href="mailto:booking@ghumofiroo.com" className="text-accent font-semibold">booking@ghumofiroo.com</a>.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EnquireSuccess;
