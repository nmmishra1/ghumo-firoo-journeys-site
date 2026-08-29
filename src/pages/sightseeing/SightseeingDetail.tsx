import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { getSightseeingBySlug } from '@/data/sightseeingData';
import { MapPin, Clock, ArrowRight, CheckCircle2, Calendar, Compass, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SightseeingDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const spot = getSightseeingBySlug(slug || '');

  if (!spot) {
    return (
      <Layout>
        <SEO title="Sightseeing Spot Not Found | Ghumo Firoo" description="Requested sightseeing spot does not exist." />
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-950 text-white px-4">
          <h1 className="text-2xl font-bold mb-2">Sightseeing Spot Not Found</h1>
          <p className="text-slate-400 mb-6">The attraction you are looking for might have been moved or updated.</p>
          <Link to="/sightseeing">
            <Button className="bg-amber-500 text-slate-950 hover:bg-amber-400">View All Sightseeing Spots</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Generate TouristAttraction JSON-LD Schema for Google Search
  const touristAttractionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: spot.name,
    description: spot.description,
    image: spot.image,
    address: {
      '@type': 'PostalAddress',
      addressLocality: spot.destination,
      addressCountry: 'IN'
    },
    touristType: [spot.category]
  };

  const seoTitle = `${spot.name} Guide 2026 | ${spot.destination}`.slice(0, 60);
  const seoDesc = `${spot.summary} Plan your visit with Ghumo Firoo inclusive packages.`.slice(0, 160);

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={`${spot.name}, ${spot.destination}, ${spot.category}, travel guide 2026, tour packages`}
        canonicalUrl={`/sightseeing/${spot.slug}`}
        structuredData={touristAttractionSchema}
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen font-sans pb-20">
        {/* HERO HEADER */}
        <div className="relative h-[65vh] min-h-[440px] flex items-end pb-12 overflow-hidden border-b border-slate-800">
          <img
            src={spot.image}
            alt={spot.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-10" />

          <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center gap-2 mb-3">
              <Link to="/sightseeing" className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium">
                <Compass className="w-3.5 h-3.5" /> All Sightseeing Spots
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs text-slate-400">{spot.destination}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {spot.category}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              {spot.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <MapPin className="w-4 h-4 text-amber-400" />
                {spot.location}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock className="w-4 h-4 text-amber-400" />
                Duration: {spot.duration}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <Calendar className="w-4 h-4 text-amber-400" />
                Best Time: {spot.bestTime}
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT & PACKAGES SECTION */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT COLUMN: OVERVIEW & HIGHLIGHTS */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" /> About {spot.name}
                </h2>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  {spot.description}
                </p>
              </section>

              <section className="bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" /> Key Highlights & Attractions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {spot.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: PACKAGES CONTAINING THIS ATTRACTION */}
            <div className="space-y-6">
              <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 p-6 rounded-2xl border border-amber-500/30 sticky top-24 shadow-xl">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4" /> Recommended Packages
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Packages Including This Attraction
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Book curated itineraries with private transfers, stays, and permits included.
                </p>

                <div className="space-y-4">
                  {spot.packages.map((pkg, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all">
                      {pkg.badge && (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 mb-2">
                          {pkg.badge}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">
                        {pkg.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                        <span>{pkg.duration}</span>
                        <span className="text-amber-400 font-extrabold text-sm">₹{pkg.price.toLocaleString('en-IN')}</span>
                      </div>
                      <Link to={pkg.link}>
                        <Button className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 py-2">
                          View Tour Package <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
                  <Link to="/custom-tour-packages">
                    <button className="text-xs text-slate-400 hover:text-amber-400 transition-colors">
                      Need a customized itinerary? <span className="underline font-medium text-amber-400">Request Custom Quote</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SightseeingDetail;
