import React, { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/ui/LazyImage';
import { Link } from 'react-router-dom';
import { listGuides, listBriefs } from '@/lib/contentLoader';

const GuidesIndex: React.FC = () => {
  const guides = listGuides();
  const briefs = listBriefs();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');

  const regions = useMemo(
    () => ['All', ...Array.from(new Set(guides.map((guide) => guide.region)))],
    [guides]
  );

  const filteredGuides = useMemo(
    () =>
      guides.filter((guide) => {
        const query = search.trim().toLowerCase();
        const matchesRegion = regionFilter === 'All' || guide.region === regionFilter;
        const matchesSearch =
          query.length === 0 ||
          [guide.title, guide.country, guide.region, guide.summary]
            .join(' ')
            .toLowerCase()
            .includes(query);

        return matchesRegion && matchesSearch;
      }),
    [guides, regionFilter, search]
  );

  return (
    <Layout>
      <SEO title="Travel Guides" description="Authoritative destination guides and travel briefs" />
      <div className="min-h-screen bg-[#0B1026] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          
          {/* Hero Banner Section */}
          <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#1A2342]/65 backdrop-blur-md shadow-2xl relative">
            <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(201,162,90,0.12),_transparent_45%)] pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_bottom_right,_rgba(201,162,90,0.06),_transparent_45%)] pointer-events-none" />
            
            <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20 max-w-4xl space-y-6 text-left">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
                Travel Guides
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
                Explore destination guides designed for memorable journeys
              </h1>
              <p className="max-w-3xl text-slate-300 text-base sm:text-lg leading-relaxed font-light">
                Browse expert travel notes, local planning ideas, and destination highlights that go beyond the usual advice.
              </p>
              
              <div className="grid gap-4 sm:grid-cols-3 pt-4">
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Published guides</p>
                  <p className="mt-2 text-3xl font-extrabold text-accent">{guides.length}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Regions covered</p>
                  <p className="mt-2 text-3xl font-extrabold text-accent">{regions.length - 1}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Planning briefs</p>
                  <p className="mt-2 text-3xl font-extrabold text-accent">{briefs.length}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Search and Filters Section */}
          <section className="space-y-6">
            <div className="flex flex-col gap-6 rounded-[2rem] border border-white/5 bg-[#1A2342]/40 backdrop-blur-md p-6 shadow-2xl sm:flex-row sm:items-center sm:justify-between text-left">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Find your next itinerary</h2>
                <p className="text-slate-300 text-sm">Search destinations, filter by region, and discover travel-ready ideas.</p>
              </div>
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <label htmlFor="guide-search" className="sr-only">Search guides</label>
                <input
                  id="guide-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by destination, region or travel style"
                  className="w-full rounded-full border border-white/10 bg-[#0B1026] px-5 py-3 text-sm text-white placeholder:text-slate-400 shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-96"
                />
              </div>
            </div>

            {/* Region Selection Tabs */}
            <div className="flex flex-wrap gap-2.5 justify-start">
              {regions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setRegionFilter(region)}
                  className={`rounded-full px-4.5 py-2.5 text-sm font-medium transition-all duration-300 border ${
                    regionFilter === region
                      ? 'bg-gradient-warm text-[#0B1026] border-accent font-bold shadow-md shadow-accent/10 hover:scale-[1.02] active:scale-95'
                      : 'border-white/10 bg-[#1A2342]/40 text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {/* Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 text-left">
              {filteredGuides.length === 0 ? (
                <div className="col-span-full rounded-[2rem] border border-dashed border-white/10 bg-[#1A2342]/20 p-12 text-center">
                  <p className="text-lg font-bold text-slate-300">No guides found</p>
                  <p className="mt-2 text-slate-500 text-sm">Try a broader search or choose another region.</p>
                </div>
              ) : (
                filteredGuides.map((guide) => (
                  <Card
                    key={guide.slug}
                    className="group overflow-hidden rounded-[1.75rem] border border-white/5 bg-[#1A2342]/60 backdrop-blur-sm shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(201,162,90,0.15)] hover:border-accent/40 text-left flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover Photo */}
                      <div className="relative overflow-hidden aspect-[16/9]">
                        {guide.heroImage ? (
                          <LazyImage
                            src={guide.heroImage}
                            alt={guide.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                          />
                        ) : (
                          <div className="h-full w-full bg-slate-900" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <Badge className="absolute left-4 top-4 bg-slate-950/85 backdrop-blur-md text-accent border border-accent/20 px-3 py-1 font-bold shadow-md uppercase tracking-wider text-[10px]">
                          {guide.region}
                        </Badge>
                      </div>
                      
                      {/* Content Area */}
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors leading-snug">
                              {guide.title}
                            </h3>
                            <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                              {guide.country}
                            </p>
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                          {guide.summary}
                        </p>
                      </CardContent>
                    </div>

                    <CardContent className="p-6 pt-0 flex justify-between items-center border-t border-white/5 mt-auto">
                      <span className="text-[11px] font-bold text-slate-500">
                        Updated {new Date(guide.updatedAt).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
                      </span>
                      <Link 
                        to={`/guides/${guide.slug}`} 
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-accent group-hover:translate-x-1 transition-transform"
                      >
                        Read guide <span className="text-sm font-light">→</span>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Planning Inspiration Briefs */}
          <section className="rounded-[2rem] border border-white/5 bg-[#1A2342]/40 backdrop-blur-md p-8 shadow-2xl text-left">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/5 pb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold">Editorial briefs</p>
                <h2 className="mt-1 text-2xl font-bold text-white">More planning inspiration</h2>
              </div>
              <p className="max-w-2xl text-slate-300 text-sm leading-relaxed font-light">
                Preview upcoming travel content and keyword-led articles before they go live.
              </p>
            </div>
            
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {briefs.map((brief) => (
                <Card key={brief.slug} className="rounded-3xl border border-white/5 bg-slate-950/40 p-6 transition hover:shadow-xl hover:border-accent/20">
                  <div className="font-bold text-white text-base leading-tight">{brief.title}</div>
                  <div className="mt-2 text-xs font-semibold text-accent uppercase tracking-wider">
                    {brief.targetKeywords.slice(0, 4).join(', ')}{brief.targetKeywords.length > 4 ? '…' : ''}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300 line-clamp-3">
                    {brief.outline.join(' · ')}
                  </p>
                </Card>
              ))}
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default GuidesIndex;
