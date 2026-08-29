import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { getAllSightseeings } from '@/data/sightseeingData';
import { MapPin, Clock, ArrowRight, Compass, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SightseeingIndex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const spots = getAllSightseeings();
  const categories = ['all', 'Scenic Drives & Nature', 'Viewpoints & Culture', 'Desert & Festivals', 'Heritage & History', 'Pilgrimage & Spiritual'];

  const filteredSpots = spots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          spot.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spot.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || spot.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <Layout>
      <SEO
        title="Top Sightseeing & Activities in India 2026 | Ghumo Firoo"
        description="Explore popular attractions, scenic viewpoints, heritage monuments, and adventure activities across India with Ghumo Firoo. Plan your perfect journey."
        keywords="top sightseeing India, activities Kutch, Road to Heaven Dholavira, Kalo Dungar, Kedarnath trek, tourist spots India 2026"
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen font-sans pb-16">
        {/* HERO BANNER */}
        <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Compass className="w-3.5 h-3.5" /> Destination Explorer & Sightseeing
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Top Sightseeing Spots & Activities
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Discover iconic landmarks, scenic highways, sacred shrines, and unique activities across India—direct from our curated travel packages.
            </p>

            {/* SEARCH & FILTER BAR */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search spots (e.g. Road to Heaven, Kalo Dungar, Kedarnath)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 text-sm transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat === 'all' ? 'All Attractions' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* SPOTS GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {filteredSpots.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80">
              <p className="text-slate-400 text-base">No sightseeing spots found matching your search criteria.</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="mt-4 bg-amber-500 text-slate-950 hover:bg-amber-400">
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredSpots.map((spot) => (
                <div
                  key={spot.slug}
                  className="group bg-slate-900/90 rounded-2xl border border-slate-800/80 overflow-hidden hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/5"
                >
                  <div>
                    <div className="relative h-52 overflow-hidden bg-slate-950">
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800";
                        }}
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-amber-400">
                        {spot.category}
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white bg-slate-950/75 px-2.5 py-1 rounded-md backdrop-blur-sm">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {spot.destination}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-2 line-clamp-1">
                        {spot.name}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                        {spot.summary}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400/80" />
                          {spot.duration}
                        </span>
                        <span className="text-amber-400/90 font-medium">
                          {spot.packages.length} Packages Included
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <Link to={`/sightseeing/${spot.slug}`} className="block">
                      <Button className="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700/60 font-semibold text-xs transition-all flex items-center justify-center gap-2 group/btn">
                        View Spot Details & Packages <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SightseeingIndex;
