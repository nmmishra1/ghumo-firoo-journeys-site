import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, MessageCircle } from 'lucide-react';
import LiveChatWidget from '@/components/LiveChatWidget';

import { Link } from 'react-router-dom';

interface LandingLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  robots?: string;
  canonical?: string;
  structuredData?: any;
  hideHeader?: boolean;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ 
  children, 
  title, 
  description, 
  robots = "index, follow",
  canonical,
  structuredData,
  hideHeader = false
}) => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={robots} />
        {canonical && <link rel="canonical" href={canonical} />}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData).replace(/</g, '\\u003c')}
          </script>
        )}
      </Helmet>

      {/* Simplified Header */}
      {!hideHeader && (
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img 
                src="/ghumo-firoo-logo.png" 
                alt="Ghumo Firoo Travels" 
                className="h-10 w-auto" 
              />
            </div>
            
            <div className="flex items-center gap-3">
              <a 
                href="https://wa.me/919910987264" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1 text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                <MessageCircle size={20} />
                <span>WhatsApp</span>
              </a>
              <a 
                href="tel:+919910987264" 
                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-md animate-pulse-subtle"
              >
                <Phone size={18} />
                <span className="hidden sm:inline">Call Now</span>
              </a>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Hide Live Chat on mobile to avoid overlap with StickyCTA */}
      <div className="hidden md:block">
        <LiveChatWidget />
      </div>

      {/* Simplified Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm mb-4">
            © {new Date().getFullYear()} Ghumo Firoo Travels. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-white">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
