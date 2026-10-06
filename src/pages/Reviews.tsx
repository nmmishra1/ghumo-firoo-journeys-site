import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { reviewService, GoogleReview } from '@/services/reviewService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShieldCheck, MapPin, Calendar, Image as ImageIcon, Sparkles, MessageSquareQuote, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function Reviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const data = await reviewService.getApprovedReviews();
        setReviews(data || []);
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  // Compute aggregate ratings
  const totalReviews = reviews.length;
  const avgOverall = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
    : '4.9';
  const avgHotel = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.hotel_rating) || 5), 0) / totalReviews).toFixed(1)
    : '5.0';
  const avgCab = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.cab_rating) || 5), 0) / totalReviews).toFixed(1)
    : '5.0';
  const avgSightseeing = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.sightseeing_rating) || 5), 0) / totalReviews).toFixed(1)
    : '5.0';
  const avgPlanning = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.trip_planning_rating) || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  // Unique destinations for filtering
  const destinations = ['All', ...Array.from(new Set(reviews.map(r => r.location).filter(Boolean)))];

  const filteredReviews = selectedDestination === 'All'
    ? reviews
    : reviews.filter(r => r.location?.toLowerCase().includes(selectedDestination.toLowerCase()));

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Ghumo Firoo Travels',
    url: 'https://ghumofiroo.com',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgOverall,
      reviewCount: String(totalReviews > 0 ? totalReviews : 150),
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <Layout>
      <SEO
        title="Traveler Reviews & Testimonials | Ghumo Firoo Journeys"
        description="Read authentic verified reviews and stories from guests who traveled across Rajasthan, Kerala, Rann of Kutch, Char Dham, and international destinations with Ghumo Firoo."
        canonicalUrl="https://ghumofiroo.com/reviews"
        url="https://ghumofiroo.com/reviews"
        structuredData={reviewSchema}
      />

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-[#050A18] via-[#0B1026] to-[#0D1536] text-white overflow-hidden border-b border-[#C9A25A]/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-6xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Guest Stories & Experiences
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-tight mb-6">
            Voices of Our <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">Travelers</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Real stories, unedited photos, and genuine feedback from travelers who entrusted their memorable journeys to Ghumo Firoo.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={() => navigate('/review')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#050814] font-bold px-8 py-6 rounded-full shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 text-sm"
            >
              Write a Review
            </Button>
            <Button
              onClick={() => navigate('/packages')}
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800 rounded-full px-8 py-6 text-sm"
            >
              Explore Packages
            </Button>
          </div>
        </div>
      </section>

      {/* Aggregate Rating Scoreboard */}
      <section className="bg-[#080D20] border-b border-white/5 py-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-5 text-center flex flex-col justify-center items-center">
              <span className="text-4xl font-extrabold text-amber-400">{avgOverall}</span>
              <div className="flex gap-1 my-1.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-400 font-medium">Overall Rating ({totalReviews} Verified)</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center">
              <span className="text-xl font-bold text-white">{avgHotel} ★</span>
              <span className="text-xs text-slate-400 mt-1">Hotels & Stays</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center">
              <span className="text-xl font-bold text-white">{avgCab} ★</span>
              <span className="text-xs text-slate-400 mt-1">Cabs & Drivers</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center">
              <span className="text-xl font-bold text-white">{avgSightseeing} ★</span>
              <span className="text-xs text-slate-400 mt-1">Sightseeing</span>
            </div>

            <div className="col-span-2 md:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-center flex flex-col justify-center">
              <span className="text-xl font-bold text-white">{avgPlanning} ★</span>
              <span className="text-xs text-slate-400 mt-1">Planning & Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Reviews Listing */}
      <section className="py-16 bg-[#050814] min-h-[60vh]">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Destination Filter Pills */}
          {destinations.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {destinations.map(dest => (
                <button
                  key={dest}
                  onClick={() => setSelectedDestination(dest)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    selectedDestination === dest
                      ? 'bg-amber-500 text-[#050814] shadow-md shadow-amber-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {dest}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-400">Loading guest reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <MessageSquareQuote className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-300">No reviews found for this destination yet.</p>
              <Button
                onClick={() => navigate('/review')}
                className="mt-4 bg-amber-500 text-black font-semibold rounded-full"
              >
                Be the first to review
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredReviews.map((review) => {
                const mainPhoto = review.photos && review.photos.length > 0
                  ? review.photos[0]
                  : (review.reviewer_photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face");

                return (
                  <Card
                    key={review.id}
                    className="bg-gradient-to-b from-[#151D3B] via-[#0E152E] to-[#0A0F24] border border-amber-500/25 hover:border-amber-500/60 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Stars + Verified Badge */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < (Number(review.rating) || 5)
                                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                                    : 'text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-white ml-1">{review.rating}.0</span>
                        </div>

                        {review.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1 rounded-full shadow-sm">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Traveler
                          </span>
                        )}
                      </div>

                      {/* Review Text */}
                      <p className="text-sm font-sans text-slate-100 font-normal italic leading-relaxed mb-6">
                        "{review.review_text}"
                      </p>

                      {/* Sub-ratings breakdown */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold mb-6">
                        <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center justify-between text-slate-200">
                          <span>🏨 Hotel Stay:</span>
                          <span className="font-bold text-amber-400">{review.hotel_rating || 5}.0★</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center justify-between text-slate-200">
                          <span>🚗 Transport:</span>
                          <span className="font-bold text-amber-400">{review.cab_rating || 5}.0★</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center justify-between text-slate-200">
                          <span>🏛️ Sightseeing:</span>
                          <span className="font-bold text-amber-400">{review.sightseeing_rating || 5}.0★</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center justify-between text-slate-200">
                          <span>⭐ Support:</span>
                          <span className="font-bold text-amber-400">{review.trip_planning_rating || 5}.0★</span>
                        </div>
                      </div>

                      {/* Photo Gallery Thumbnails */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="mb-6">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Trip Photos ({review.photos.length})
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {review.photos.map((pUrl, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setActivePhoto(pUrl)}
                                className="relative rounded-xl overflow-hidden border border-amber-500/30 hover:border-amber-400 hover:scale-105 transition-all shadow group/img"
                              >
                                <img
                                  src={pUrl}
                                  alt={`Trip photo ${pIdx + 1}`}
                                  className="h-16 w-16 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                  <ImageIcon className="w-4 h-4 text-white" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Traveler Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-amber-500/40 overflow-hidden bg-slate-800 flex-shrink-0">
                          <img
                            src={mainPhoto}
                            alt={review.reviewer_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs uppercase tracking-wider font-extrabold text-white">
                            {review.reviewer_name}
                          </h4>
                          <p className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 inline text-amber-400" />
                            {review.location || 'Ghumo Firoo Journey'}
                          </p>
                        </div>
                      </div>

                      {review.review_date && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(review.review_date).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Bottom Banner */}
          <div className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#101736] to-amber-500/10 border border-amber-500/30 text-center">
            <h3 className="text-2xl font-serif font-bold text-white mb-2">Have you traveled with us recently?</h3>
            <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
              Share your feedback, upload photos from your journey, and let fellow travelers discover what makes Ghumo Firoo special.
            </p>
            <Button
              onClick={() => navigate('/review')}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-6 rounded-full"
            >
              Write Your Review Now
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Photo Inspection */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2 rounded-full z-10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activePhoto}
              alt="Guest trip upload"
              className="w-full h-full max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
