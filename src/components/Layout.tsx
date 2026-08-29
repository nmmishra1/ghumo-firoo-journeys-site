
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import SEO from './SEO';
import { generateSEO } from './seo/seoTemplates';
import ScrollProgressBar from '@/components/common/ScrollProgressBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  // Scroll to top whenever the route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isPackagePage = location.pathname.includes('/packages') || location.pathname.includes('/landing/');

  return (
    <div className="min-h-screen flex flex-col">
      {isPackagePage && <ScrollProgressBar />}
      {/* Accessibility: Skip to main content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded">Skip to content</a>
      {(() => {
        const computed = generateSEO(location.pathname);
        return (
          <SEO
            title={computed.title}
            description={computed.description}
            keywords={computed.keywords}
            url={location.pathname}
            geo={{
              region: 'IN-DL',
              placename: 'New Delhi',
              position: '28.549333982444654;77.16911131508083',
              icbm: '28.549333982444654,77.16911131508083',
              latitude: '28.549333982444654',
              longitude: '77.16911131508083',
            }}
          />
        );
      })()}
      <Navigation />
      <main id="main-content" role="main" className="flex-1 w-full">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
