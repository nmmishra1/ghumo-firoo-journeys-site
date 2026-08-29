import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { pushEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Search, Home, Phone, Mail, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('q') || '');
  const [popular, setPopular] = useState<Array<{ name: string; path: string; id?: string }>>([]);
  const cohort = (typeof window !== 'undefined' && (window as any).__initialPersonalization?.cohort) || null;

  useEffect(() => {
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    pushEvent('404_view', { path: location.pathname, referrer });
  }, [location.pathname]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('popular_packages');
      const map: Record<string, { count: number; meta?: { name?: string } }> = raw ? JSON.parse(raw) : {};
      const known: Record<string, { name: string; path: string }> = {
        'rann-utsav': { name: 'Rann Utsav Gujarat', path: '/packages/rann-utsav' },
        'char-dham': { name: 'Char Dham Yatra', path: '/packages/char-dham-yatra' },
        'europe-tour': { name: 'Europe Grand Tour', path: '/packages/europe-grand-tour' },
        'kashmir-paradise': { name: 'Kashmir Paradise', path: '/packages/kashmir-paradise' },
        'kerala-backwaters': { name: 'Kerala Backwaters', path: '/packages/kerala-backwaters' },
        'himachal-hills': { name: 'Himachal Hills', path: '/packages/himachal-hills' },
        'dubai-delights': { name: 'Dubai Delights', path: '/packages/dubai-delights' },
        'bali-paradise': { name: 'Bali Paradise', path: '/packages/bali-paradise' },
      };
      const items = Object.entries(map)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 4)
        .map(([id, info]) => {
          const k = known[id];
          if (k) return { ...k, id };
          const nm = info?.meta?.name || 'Popular Package';
          return { name: nm, path: `/packages?q=${encodeURIComponent(nm)}`, id };
        });
      if (items.length) setPopular(items);
    } catch {}
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    pushEvent('404_search_submit', { query: q });
    navigate(`/packages?q=${encodeURIComponent(q)}`);
  };

  return (
    <Layout>
      <SEO 
        title="404 — Page Not Found"
        description="This page could not be found. Use search, navigate to popular pages, or contact us for personalized assistance."
        canonicalUrl={`https://ghumofiroo.com${location.pathname}`}
        image="/ghumo-firoo-logo.png"
        noindex
      />

      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg">
                <Compass className="w-8 h-8 text-white" aria-hidden="true" />
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">
              {cohort === 'B' 
                ? 'Can’t find what you need? Try search or explore trending trips curated for you.'
                : 'We can’t find the page you’re looking for. Try a quick search or explore our popular packages.'}
            </p>
            
            {/* Search */}
            <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-10" role="search" aria-label="Search packages">
              <div className="relative w-full sm:w-2/3">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input 
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search destinations or highlights (e.g., Char Dham, Europe)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                  aria-label="Search query"
                />
              </div>
              <Button type="submit" className="px-6 py-3 rounded-xl shadow-md">
                Search
              </Button>
            </form>

            {/* Popular Links - dynamic when available */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10" role="navigation" aria-label="Popular content">
              {(popular.length ? popular : [
                { name: 'Rann Utsav Gujarat', path: '/packages/rann-utsav' },
                { name: 'Char Dham Yatra', path: '/packages/char-dham-yatra' },
                { name: 'Europe Grand Tour', path: '/packages/europe-grand-tour' },
                { name: 'Kashmir Paradise', path: '/packages/kashmir-paradise' },
              ]).map(link => (
                <Link 
                  key={link.name}
                  to={link.path}
                  onClick={() => pushEvent('404_popular_link_click', { to: link.path, id: (link as any).id })}
                  className="block p-4 rounded-xl border border-gray-200 bg-white/80 hover:bg-white hover:shadow-lg transition-all text-left"
                >
                  <div className="text-gray-900 font-semibold">{link.name}</div>
                  <div className="text-gray-500 text-sm">Explore details, itinerary, and pricing</div>
                </Link>
              ))}
            </div>

            {/* Category Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10" role="navigation" aria-label="Main categories">
              {[
                { name: 'Domestic', path: '/products?category=domestic' },
                { name: 'International', path: '/products?category=international' },
                { name: 'Premium', path: '/products?category=premium' },
                { name: 'Adventure', path: '/products?category=adventure' },
                { name: 'Honeymoon', path: '/products?category=honeymoon' },
              ].map(cat => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  onClick={() => pushEvent('404_category_click', { to: cat.path })}
                  className="px-4 py-2 rounded-full border border-gray-200 bg-white/80 hover:bg-white hover:shadow-md transition-all text-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Contact and Home */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link 
                to="/"
                onClick={() => pushEvent('404_home_click')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white/80 hover:bg-white hover:shadow-md transition-all"
              >
                <Home className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Go to Home</span>
              </Link>
              <a 
                href="tel:+919910987264"
                onClick={() => pushEvent('404_contact_call_click')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white/80 hover:bg-white hover:shadow-md transition-all"
              >
                <Phone className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Call +91-9910987264</span>
              </a>
              <Link 
                to="/contact"
                onClick={() => pushEvent('404_contact_email_click')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white/80 hover:bg-white hover:shadow-md transition-all"
              >
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Contact via secure form</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
