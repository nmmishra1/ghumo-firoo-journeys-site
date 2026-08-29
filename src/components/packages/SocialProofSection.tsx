import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Quote, 
  ThumbsUp, 
  Heart, 
  Camera, 
  MapPin, 
  Calendar, 
  Users, 
  Award, 
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react';
import { reviewService, type ReviewStats } from '@/services/reviewService';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
  packageName: string;
  travelDate: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  platform?: 'google' | 'tripadvisor' | 'facebook' | 'instagram';
  tags?: string[];
}

interface TrustMetric {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  color: string;
}

interface SocialProofSectionProps {
  packageName: string;
  destination: string;
  testimonials: Testimonial[];
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  satisfactionRate: number;
  onViewAllReviews?: () => void;
  onWriteReview?: () => void;
  verifiedPlatforms?: string[];
}

const SocialProofSection: React.FC<SocialProofSectionProps> = ({
  packageName,
  destination,
  testimonials,
  averageRating,
  totalReviews,
  totalBookings,
  satisfactionRate,
  onViewAllReviews,
  onWriteReview,
  verifiedPlatforms = []
}) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [liveStats, setLiveStats] = useState<ReviewStats | null>(null);

  // Fetch and refresh review stats every 5 minutes, and subscribe to real-time updates
  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const stats = await reviewService.getReviewStats();
        if (isMounted) setLiveStats(stats);
      } catch (e) {
        console.warn('Failed to load review stats', e);
      }
    };

    // Initial load
    loadStats();

    // Subscription to review updates; refresh stats when new reviews are detected
    const sub = reviewService.subscribeToReviews(async () => {
      try {
        const stats = await reviewService.getReviewStats();
        if (isMounted) setLiveStats(stats);
      } catch (e) {
        console.warn('Failed to refresh stats on subscription', e);
      }
    });

    // Explicit 5-minute interval refresh (aligns with requirement)
    const intervalId = setInterval(loadStats, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      sub.unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const trustMetrics: TrustMetric[] = [
    {
      icon: <Star className="w-6 h-6" />,
      label: 'Average Rating',
      value: `${averageRating}/5`,
      description: `Based on ${totalReviews} reviews`,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Happy Travelers',
      value: totalBookings.toLocaleString(),
      description: 'Customers served',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: <ThumbsUp className="w-6 h-6" />,
      label: 'Satisfaction Rate',
      value: `${satisfactionRate}%`,
      description: 'Customer satisfaction',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: 'Industry Awards',
      value: '15+',
      description: 'Travel excellence awards',
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const recentActivity = [
    { action: 'booked', name: 'Priya S.', time: '2 hours ago', location: 'Mumbai' },
    { action: 'reviewed', name: 'Rajesh K.', time: '4 hours ago', location: 'Delhi' },
    { action: 'booked', name: 'Anita M.', time: '6 hours ago', location: 'Bangalore' },
    { action: 'shared', name: 'Vikram T.', time: '8 hours ago', location: 'Chennai' },
    { action: 'booked', name: 'Sneha R.', time: '12 hours ago', location: 'Pune' }
  ];

  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonial(prev => 
          prev === testimonials.length - 1 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, testimonials.length]);

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'google': return '🔍';
      case 'tripadvisor': return '🦉';
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
      default: return '⭐';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${
              i < Math.floor(rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : i < rating 
                  ? 'fill-yellow-200 text-yellow-400'
                  : 'text-gray-300'
            }`} 
          />
        ))}
      </div>
    );
  };

  const featuredTestimonial = testimonials[currentTestimonial];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-3">
          <Shield className="w-4 h-4" />
          Trusted by Thousands
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          What Our Travelers Say
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Real experiences from real travelers who have explored {destination} with Ghumo Firoo Travels
        </p>
      </div>

      {/* Trust Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trustMetrics.map((metric, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${metric.color} mb-3`}>
                {metric.icon}
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {metric.label === 'Average Rating' && liveStats ? `${liveStats.averageRating.toFixed(1)}/5` : metric.value}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">{metric.label}</div>
              <div className="text-xs text-gray-500">
                {metric.label === 'Average Rating' && liveStats ? `Based on ${liveStats.total} reviews` : metric.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Testimonial */}
      {featuredTestimonial && (
        <Card className="bg-gradient-to-br from-accent/5 to-secondary/5 border-accent/30 shadow-xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              {/* Testimonial Content */}
              <div className="md:col-span-2">
                <div className="flex items-start gap-4">
                  <Quote className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <blockquote className="text-lg text-gray-700 mb-4 leading-relaxed">
                      "{featuredTestimonial.review}"
                    </blockquote>
                    
                    <div className="flex items-center gap-4 mb-3">
                      {renderStars(featuredTestimonial.rating)}
                      <span className="text-sm font-semibold text-gray-600">
                        {featuredTestimonial.rating}/5
                      </span>
                      {featuredTestimonial.verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <img 
                          src={featuredTestimonial.avatar} 
                          alt={featuredTestimonial.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-semibold">{featuredTestimonial.name}</div>
                          <div className="text-xs">{featuredTestimonial.location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{featuredTestimonial.travelDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getPlatformIcon(featuredTestimonial.platform)}
                        <span className="capitalize">{featuredTestimonial.platform || 'Review'}</span>
                      </div>
                    </div>
                    
                    {featuredTestimonial.tags && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {featuredTestimonial.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Testimonial Images */}
              {featuredTestimonial.images && featuredTestimonial.images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm">Travel Photos:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {featuredTestimonial.images.slice(0, 4).map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`Travel photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                  {featuredTestimonial.images.length > 4 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{featuredTestimonial.images.length - 4} more photos
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Testimonial Navigation */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-accent/30">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-accent/40 text-accent hover:bg-accent/10"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                >
                  {isAutoPlaying ? <Clock className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {isAutoPlaying ? 'Pause' : 'Auto-play'}
                </Button>
                <span className="text-sm text-gray-500">
                  {currentTestimonial + 1} of {testimonials.length}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-accent' : 'bg-accent/20'
                    }`}
                    onClick={() => {
                      setCurrentTestimonial(index);
                      setIsAutoPlaying(false);
                    }}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-accent/40 text-accent hover:bg-accent/10"
                  onClick={() => {
                    const prevIndex = currentTestimonial === 0 ? testimonials.length - 1 : currentTestimonial - 1;
                    setCurrentTestimonial(prevIndex);
                    setIsAutoPlaying(false);
                  }}
                >
                  ←
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-accent/40 text-accent hover:bg-accent/10"
                  onClick={() => {
                    const nextIndex = currentTestimonial === testimonials.length - 1 ? 0 : currentTestimonial + 1;
                    setCurrentTestimonial(nextIndex);
                    setIsAutoPlaying(false);
                  }}
                >
                  →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Live Activity Feed */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <h3 className="font-bold text-gray-800">Live Activity</h3>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    activity.action === 'booked' ? 'bg-green-100 text-green-700' :
                    activity.action === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                    activity.action === 'shared' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.action === 'booked' ? '📅' :
                     activity.action === 'reviewed' ? '⭐' :
                     activity.action === 'shared' ? '📤' : '👀'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.name}</span>
                      <span className="text-gray-600"> {activity.action} this package</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Review Summary */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-800 mb-4">Review Breakdown</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = testimonials.filter(t => Math.floor(t.rating) === rating).length;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{liveStats ? liveStats.averageRating.toFixed(1) : averageRating}</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{liveStats ? liveStats.total : totalReviews}</div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg"
          onClick={onViewAllReviews}
          variant="outline"
          className="border-accent/40 text-accent hover:bg-accent/10 px-8"
        >
          <Star className="w-5 h-5 mr-2" />
          View All {totalReviews} Reviews
        </Button>
        <Button 
          size="lg"
          onClick={onWriteReview}
          className="bg-gradient-to-r bg-gradient-warm text-white hover:opacity-90 text-white px-8"
        >
          <Heart className="w-5 h-5 mr-2" />
          Share Your Experience
        </Button>
      </div>

      {/* Trust Badges and Platform Verification */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-center font-bold text-gray-800 mb-4">Trusted & Certified</h3>
        <div className="flex justify-center items-center gap-8 flex-wrap">
          <div className="text-center">
            <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Secure Booking</p>
          </div>
          <div className="text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Award Winning</p>
          </div>
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Verified Reviews</p>
          </div>
          <div className="text-center">
            <Users className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-sm text-gray-600">Expert Guides</p>
          </div>
        </div>

        {/* Platform-specific verification badges */}
        {verifiedPlatforms.length > 0 && (
          <div className="mt-6">
            <h4 className="text-center text-sm font-semibold text-gray-700 mb-3">Verified on</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 items-center justify-center">
              {verifiedPlatforms.map((platform, idx) => (
                <div key={`${platform}-${idx}`} className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 shadow-sm">
                  {/* Simple platform icon mapping; fallback to first letter */}
                  <span aria-hidden="true" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                    {platform.toLowerCase() === 'google' ? 'G' :
                     platform.toLowerCase() === 'tripadvisor' ? 'T' :
                     platform.toLowerCase() === 'facebook' ? 'F' :
                     platform.toLowerCase() === 'instagram' ? 'I' : platform[0].toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-800" aria-label={`Verified on ${platform}`}>{platform}</span>
                  <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialProofSection;