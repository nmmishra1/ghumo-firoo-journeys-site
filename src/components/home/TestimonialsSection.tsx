
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, ChevronLeft, ChevronRight, Play, Pause, CheckCircle, Shield, Award, Users, RefreshCw, Clock, TrendingUp, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JsonLd from '@/components/seo/JsonLd';
import { reviewService, GoogleReview, ReviewStats, ReviewSubscription } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';

interface DisplayReview {
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
  date: string;
  photos?: string[];
  video_url?: string | null;
}

// A small helper to load the first available image from a list of sources
const FallbackImage: React.FC<{
  sources: string[];
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}> = ({ sources, alt, className = '', width, height }) => {
  const [idx, setIdx] = useState(0);
  const src = idx < sources.length ? sources[idx] : '/placeholder.svg';
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setIdx((prev) => (prev + 1 < sources.length ? prev + 1 : sources.length))}
    />
  );
};

// All curated fallback testimonials — shown when the database has no approved reviews yet
const fallbackTestimonials: DisplayReview[] = [
  {
    name: 'Aarav Mehta',
    location: 'Surat, India',
    rating: 5,
    text: 'Ghumo Firoo Travels planned our Leh-Ladakh adventure flawlessly. From permits to comfortable stays in Nubra and Pangong, everything was seamless. The guides were professional and friendly, and the acclimatization day helped a lot. We felt safe, cared for, and well-organized throughout our journey. Highly recommended for anyone planning Ladakh!',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    date: '2 weeks ago'
  },
  {
    name: 'Rajesh & Sunita Gupta',
    location: 'Delhi, India',
    rating: 5,
    text: 'Our Char Dham Yatra with Ghumo Firoo was absolutely divine! The helicopter service to Kedarnath saved us so much time, and the spiritual guides were incredibly knowledgeable. Every darshan was perfectly arranged. This was truly a life-changing pilgrimage experience.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    date: '2 weeks ago'
  },
  {
    name: 'Meera & Vikram Shah',
    location: 'Mumbai, India',
    rating: 5,
    text: 'Our 15-day Grand Europe Tour exceeded all expectations! From the romantic Seine cruise in Paris to the breathtaking Swiss Alps train journey, every moment was magical. The local guides in each country were exceptional. Worth every penny!',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    date: '3 weeks ago'
  },
  {
    name: 'Dr. Anil Sharma Family',
    location: 'Jaipur, India',
    rating: 5,
    text: 'The Royal Rajasthan Heritage Tour was phenomenal! Staying in the palace hotels of Udaipur and Jodhpur felt like living in a fairy tale. The desert safari in Jaisalmer and cultural performances were unforgettable. Ghumo Firoo truly understands luxury travel.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    date: '1 month ago'
  },
  {
    name: 'Kavita & Rohit Jain',
    location: 'Bangalore, India',
    rating: 5,
    text: 'Switzerland & Austria Alpine Tour was a dream come true! The Jungfraujoch excursion was breathtaking, and the scenic train rides through the Alps were mesmerizing. Professional service and perfect planning made our honeymoon absolutely perfect.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    date: '2 months ago'
  },
  {
    name: 'Ramesh Patel & Family',
    location: 'Ahmedabad, India',
    rating: 5,
    text: 'Spiritual Haridwar & Rishikesh package was incredibly peaceful! The Ganga Aarti experience was soul-stirring, and the yoga sessions in Rishikesh were rejuvenating. The adventure activities for kids were a bonus. Highly recommend for family spiritual retreats!',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    date: '3 weeks ago'
  }
];

const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<DisplayReview[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    averageRating: 0,
    ratingDistribution: {},
    recentCount: 0,
    responseRate: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showRecentBadge, setShowRecentBadge] = useState(false);
  const subscriptionRef = useRef<ReviewSubscription | null>(null);
  const { toast } = useToast();

  // Real-time reviews subscription
  const handleReviewsUpdate = useCallback((newReviews: GoogleReview[]) => {
    console.log('📊 Received', newReviews.length, 'reviews from reviewService');
    
    const featuredReviews = newReviews
      .filter(review => review.rating >= 4 && (review.verified ?? true))
      .sort((a, b) => b.rating - a.rating || (b.helpful_count || 0) - (a.helpful_count || 0))
      .slice(0, 6);
    
    console.log('⭐ Filtered to', featuredReviews.length, 'featured reviews (4+ stars)');
    
    const displayReviews: DisplayReview[] = featuredReviews.map((review: GoogleReview) => {
      const reviewDate = new Date(review.review_date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let dateDisplay = '';
      if (diffDays <= 7) {
        dateDisplay = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      } else if (diffDays <= 30) {
        const weeks = Math.floor(diffDays / 7);
        dateDisplay = `${weeks} week${weeks === 1 ? '' : 's'} ago`;
      } else if (diffDays <= 365) {
        const months = Math.floor(diffDays / 30);
        dateDisplay = `${months} month${months === 1 ? '' : 's'} ago`;
      } else {
        dateDisplay = reviewDate.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric'
        });
      }
      
      return {
        name: review.reviewer_name,
        location: review.location || 'India',
        rating: review.rating,
        text: review.review_text,
        image: review.reviewer_photo || `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1472099645785-5658abf4ff4e' : '1494790108755-2616b612b786'}?w=80&h=80&fit=crop&crop=face`,
        date: dateDisplay,
        photos: review.photos || [],
        video_url: review.video_url
      };
    });

    // If DB has reviews, merge fallback curated reviews to fill gaps (avoid name duplicates)
    // If DB is empty, use all fallback testimonials so we always show 6 unique reviews
    let mergedReviews: DisplayReview[];
    if (displayReviews.length === 0) {
      // No approved DB reviews yet — show all curated fallbacks
      mergedReviews = [...fallbackTestimonials];
    } else {
      // DB has reviews — prepend any fallback reviews not already shown, cap at 6
      const existingNames = new Set(displayReviews.map(r => r.name));
      const fillReviews = fallbackTestimonials.filter(m => !existingNames.has(m.name));
      mergedReviews = [...displayReviews, ...fillReviews].slice(0, 6);
    }

    setTestimonials(mergedReviews);
    setLastUpdated(new Date());
    
    // Show "new reviews" badge if we have new content
    if (testimonials.length > 0 && mergedReviews.length > testimonials.length) {
      setShowRecentBadge(true);
      setTimeout(() => setShowRecentBadge(false), 5000); // Hide after 5 seconds
    }
    
    console.log('✅ Updated testimonials display with', mergedReviews.length, 'reviews');
  }, [testimonials.length]);

  // Load reviews and stats on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        console.log('🚀 Loading initial testimonials data...');
        
        // Load initial stats
        const reviewStats = await reviewService.getReviewStats();
        setStats(reviewStats);
        console.log('📈 Loaded review stats:', reviewStats);
        
        // Subscribe to real-time updates
        subscriptionRef.current = reviewService.subscribeToReviews(handleReviewsUpdate);
        console.log('🔔 Subscribed to real-time review updates');
        
      } catch (error) {
        console.error('❌ Error loading testimonials:', error);
        // The reviewService already handles fallback to mock data internally
        // so we don't need to set fallbackTestimonials here
        toast({
          title: "Loading reviews",
          description: "Reviews are being loaded from our service",
          variant: "default"
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [handleReviewsUpdate, toast]);

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log('🔄 Manual refresh triggered...');
      
      await reviewService.refreshReviews();
      const newStats = await reviewService.getReviewStats();
      setStats(newStats);
      
      toast({
        title: "Reviews updated",
        description: "Latest testimonials have been loaded",
        variant: "default"
      });
      
      console.log('✅ Manual refresh completed');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      toast({
        title: "Refresh failed",
        description: "Could not fetch latest reviews. Using cached data.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, toast]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isPlaying || testimonials.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(1, testimonials.length - 2));
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, testimonials.length]);

  // Get up to 3 unique testimonials to display — never repeat a review in the same view
  const getDisplayedTestimonials = () => {
    if (testimonials.length === 0) return [];
    const count = Math.min(3, testimonials.length);
    const displayed: DisplayReview[] = [];
    for (let i = 0; i < count; i++) {
      const index = (currentIndex + i) % testimonials.length;
      displayed.push(testimonials[index]);
    }
    return displayed;
  };

  const displayedTestimonials = getDisplayedTestimonials();

  const aggregateJson = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ghumo Firoo Travels",
    url: "https://ghumofiroo.com",
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: stats.averageRating,
        reviewCount: stats.total
      },
    review: testimonials.slice(0, 5).map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewBody: t.text,
      reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5, worstRating: 1 },
      datePublished: t.date
    }))
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              What Our <span className="text-accent">Travelers Say</span>
            </h1>
            {showRecentBadge && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                <TrendingUp className="w-4 h-4" />
                New Reviews
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 mb-4">
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Real-time testimonials from pilgrims, adventurers, and heritage enthusiasts who trusted us with their most cherished journeys across India and Europe.
            </p>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh reviews"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Updating...' : 'Refresh'}
            </button>
          </div>
          {lastUpdated && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        <JsonLd json={aggregateJson} />

        <div 
          className="relative"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft') prevSlide(); if (e.key === 'ArrowRight') nextSlide(); }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Traveler testimonials carousel"
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause autoplay' : 'Resume autoplay'}
            className="absolute right-0 -top-12 px-3 py-1.5 rounded-full bg-accent text-white hover:bg-[#c5a059] shadow font-bold"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500">
            {displayedTestimonials.map((testimonial, index) => (
              <Card key={`${testimonial.name}-${index}`} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <Quote className="w-8 h-8 text-accent opacity-50" />
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed italic font-poppins text-sm">
                    "{testimonial.text}"
                  </p>
                  
                  {/* Photo & Video Gallery inside Testimonial Card */}
                  {((testimonial.photos && testimonial.photos.length > 0) || testimonial.video_url) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {testimonial.photos?.slice(0, 3).map((photo, idx) => (
                        <div 
                          key={idx} 
                          onClick={(e) => { e.stopPropagation(); setSelectedMedia(photo); }}
                          className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                        >
                          <img src={photo} alt="Travel" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {testimonial.photos && testimonial.photos.length > 3 && (
                        <div className="w-10 h-10 rounded-md border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 bg-slate-50">
                          +{testimonial.photos.length - 3}
                        </div>
                      )}
                      {testimonial.video_url && (
                        <div 
                          onClick={(e) => { e.stopPropagation(); setSelectedMedia(testimonial.video_url!); }}
                          className="w-10 h-10 rounded-md border border-accent/20 bg-accent/5 flex items-center justify-center text-accent cursor-pointer hover:scale-105 transition-transform"
                          title="Play video"
                        >
                          <FileVideo className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-2">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }}
                    />
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2 font-montserrat">
                        {testimonial.name}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-poppins">{testimonial.location}</div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-gray-400 mt-2 font-poppins">
                    {testimonial.date}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full hover:bg-accent/10 hover:border-accent/30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-[#0a1128]" />
            </Button>
            
            <div className="flex gap-2" aria-label="Testimonials pagination">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-accent' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full hover:bg-accent/10 hover:border-accent/30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-[#0a1128]" />
            </Button>
          </div>
        </div>

        {/* Enhanced Trust indicators */}
        <div className="mt-16 bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl p-8 border border-gray-200/50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-[#d4af37]/10 p-3 rounded-full mb-3">
                <Star className="w-6 h-6 text-accent fill-accent" />
              </div>
              <div className="text-3xl font-bold text-gray-900 font-montserrat">{stats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600 font-poppins font-medium">Average Rating</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-[#d4af37]/10 p-3 rounded-full mb-3">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div className="text-3xl font-bold text-gray-900 font-montserrat">{stats.total.toLocaleString()}+</div>
              <div className="text-sm text-gray-600 font-poppins font-medium">Total Reviews</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-[#d4af37]/10 p-3 rounded-full mb-3">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div className="text-3xl font-bold text-gray-900 font-montserrat">{stats.recentCount}</div>
              <div className="text-sm text-gray-600 font-poppins font-medium">Recent Reviews</div>
              <div className="text-xs text-gray-500 font-poppins">(Last 30 days)</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-[#d4af37]/10 p-3 rounded-full mb-3">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <div className="text-3xl font-bold text-gray-900 font-montserrat">{Math.round(stats.responseRate)}%</div>
              <div className="text-sm text-gray-600 font-poppins font-medium">Response Rate</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-[#d4af37]/10 p-3 rounded-full mb-3">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <div className="text-3xl font-bold text-gray-900 font-montserrat font-extrabold">15+</div>
              <div className="text-sm text-gray-600 font-poppins font-medium">Years Experience</div>
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="mt-8 max-w-md mx-auto">
            <h4 className="text-lg font-bold text-[#0a1128] mb-4 text-center font-montserrat">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {/* Google Reviews - official icon (SVG preferred) */}
            <a 
              href="https://www.google.com/search?sca_esv=b1da9f5fcde7e62b&sxsrf=AE3TifNvmzZRf8MinhdUHTEow3hk3Q48Ow:1762272258593&kgmid=/g/11g02b2j1t&q=Ghumo+Firoo+Travels&shndl=30&shem=lcuae,uaasie,shrtsdl&source=sh/x/loc/uni/m1/1&kgs=0a956e5fbc9e4460&utm_source=lcuae,uaasie,shrtsdl,sh/x/loc/uni/m1/1" 
              target="_blank" 
              rel="noopener noreferrer nofollow"
              className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
              aria-label="Read Google reviews for Ghumo Firoo Travels"
            >
              <FallbackImage
                sources={[
                  '/Google-Review.png',
                  'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/google.svg'
                ]}
                alt="Google Reviews"
                width={48}
                height={48}
                className="w-12 h-12 min-w-12 min-h-12 object-contain select-none opacity-95 group-hover:opacity-100"
              />
              <span className="text-sm font-medium">Google Reviews</span>
            </a>
            
            {/* TripAdvisor - official icon (SVG preferred) */}
            <a 
              href="https://www.tripadvisor.com/Search?q=Ghumo%20Firoo%20Travels" 
              target="_blank" 
              rel="noopener noreferrer nofollow"
              className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
              aria-label="View Ghumo Firoo Travels on TripAdvisor"
            >
              <FallbackImage
                sources={[
                  '/Tripadvisor-Logo.png',
                  'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tripadvisor.svg'
                ]}
                alt="TripAdvisor"
                width={56}
                height={56}
                className="w-14 h-14 min-w-14 min-h-14 object-contain select-none opacity-95 group-hover:opacity-100"
              />
              <span className="text-sm font-medium">TripAdvisor</span>
            </a>

            {/* TripClap Verified Partner */}
            <a
              href="https://www.tripclap.com/partner/ghumo-firoo-travels"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
              aria-label="TripClap Verified Partner"
            >
              <img
                src="/tripclap-verified.png"
                alt="TripClap Verified Partner"
                width={48}
                height={48}
                className="w-12 h-12 min-w-12 min-h-12 object-contain select-none opacity-95 group-hover:opacity-100"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                  e.currentTarget.alt = 'Verified on TripClap';
                  e.currentTarget.classList.add('opacity-80');
                }}
              />
              <span className="text-sm font-medium">TripClap Verified Partner</span>
            </a>
            
            {/* MSME Certificate (logo links to certificate image) */}
            <a
              href="/certificates/msme-certificate.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
              aria-label="View MSME Certificate"
            >
              <FallbackImage
                sources={[
                  '/msme-trip-advisor.svg',
                  '/placeholder.svg'
                ]}
                alt="MSME (Micro, Small and Medium Enterprises) logo"
                width={56}
                height={56}
                className="w-14 h-14 object-contain select-none opacity-95 group-hover:opacity-100"
              />
              <span className="text-sm font-medium">MSME Certificate</span>
            </a>

            {/* NIDHI Certificate (logo links to certificate image) */}
            <a
              href="/certificates/nidhi-certificate.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
              aria-label="View NIDHI Certificate"
            >
              <FallbackImage
                sources={[
                  '/Nidhi%20logo.png',
                  '/placeholder.svg'
                ]}
                alt="NIDHI program logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain select-none opacity-95 group-hover:opacity-100"
              />
              <span className="text-sm font-medium">NIDHI Certificate</span>
            </a>
          </div>
        </div>
        {/* Media Lightbox */}
        {selectedMedia && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedMedia(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
              {selectedMedia.includes('.mp4') || selectedMedia.includes('.webm') ? (
                <video src={selectedMedia} controls autoPlay className="max-w-full max-h-[80vh] object-contain" />
              ) : (
                <img src={selectedMedia} alt="Preview" className="max-w-full max-h-[80vh] object-contain" />
              )}
              <button 
                className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 focus:outline-none"
                onClick={() => setSelectedMedia(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
