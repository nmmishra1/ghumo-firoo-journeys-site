import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Star, 
  Users, 
  Clock, 
  Plane, 
  Camera, 
  Heart,
  Share2,
  Play,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Shield,
  Award,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import VirtualTourPreview from './VirtualTourPreview';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface TourStop {
  id: string;
  title: string;
  description: string;
  image: string;
  panoramaUrl?: string;
  videoUrl?: string;
  audioDescription?: string;
  duration: string;
  highlights: string[];
  coordinates?: { lat: number; lng: number };
  bestTime?: string;
  tips?: string[];
}

interface PackageHeroProps {
  title: string;
  duration: string;
  price: string;
  originalPrice?: string;
  destinations: string[];
  rating: number;
  reviews: number;
  images: string[];
  packageType: 'domestic' | 'international';
  highlights: string[];
  bestTime?: string;
  groupSize?: string;
  difficulty?: string;
  mapLocations?: { name: string; coordinates: [number, number]; description?: string }[];
  virtualTourData?: {
    destination: string;
    tourStops: TourStop[];
  };
}

const ModernPackageHero: React.FC<PackageHeroProps> = ({
  title,
  duration,
  price,
  originalPrice,
  destinations,
  rating,
  reviews,
  images,
  packageType,
  highlights,
  bestTime = "Year round",
  groupSize = "2-15 people",
  difficulty = "Easy",
  mapLocations,
  virtualTourData
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  // Ensure arrays are valid
  const validImages = images && images.length > 0 ? images : ['/api/placeholder/800/600'];
  const validDestinations = destinations && destinations.length > 0 ? destinations : ['Destination'];
  const validHighlights = highlights && highlights.length > 0 ? highlights : ['Amazing experience awaits'];

  // Auto-rotate images
  useEffect(() => {
    if (validImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [validImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this amazing ${packageType} package!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {validImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={image}
              alt={`${title} - Slide ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              // @ts-ignore
              fetchpriority={index === 0 ? "high" : "low"}
              fetchPriority={index === 0 ? "high" : "low"}
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/30 backdrop-blur-md hover:bg-white/50 rounded-full p-4 text-white transition-all duration-200 group cursor-pointer shadow-lg border border-white/20"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/30 backdrop-blur-md hover:bg-white/50 rounded-full p-4 text-white transition-all duration-200 group cursor-pointer shadow-lg border border-white/20"
        aria-label="Next image"
      >
        <ChevronRight className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        {validImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentImageIndex 
                ? 'bg-amber-400 scale-125 w-6' 
                : 'bg-white/60 hover:bg-white'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-6 right-6 z-40 flex gap-3">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 cursor-pointer ${
            isLiked ? 'text-red-400 bg-red-500/20' : 'text-white hover:bg-white/30'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleShare}
          className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all duration-200 cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowVirtualTour(true)}
          className="bg-accent/90 backdrop-blur-sm rounded-full p-3 text-white hover:bg-accent transition-all duration-200 group cursor-pointer"
        >
          <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex items-center min-h-screen pointer-events-none">
        <div className="w-full max-w-7xl mx-auto px-6 py-12 pointer-events-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Package Info */}
            <div className="text-white space-y-6">
              {/* Package Type Badge */}
              <div className="flex items-center gap-4">
                <Badge 
                  variant="secondary" 
                  className={`px-4 py-2 text-sm font-semibold ${
                    packageType === 'international' 
                      ? 'bg-accent/90 text-white border-orange-400' 
                      : 'bg-[#C9A25A]/90 text-white border-[#C9A25A]'
                  }`}
                >
                  <Plane className="w-4 h-4 mr-2" />
                  {packageType === 'international' ? 'International Package' : 'Domestic Package'}
                </Badge>
                {reviews && reviews > 0 ? (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{rating}</span>
                    <span className="text-white/70">({reviews} reviews)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-white/70 text-sm font-poppins">
                    <span>No reviews yet</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {title}
              </h1>

              {/* Destinations */}
              <div className="flex items-center gap-2 text-lg text-blue-200">
                <MapPin className="w-5 h-5" />
                <span>{validDestinations.slice(0, 3).join(' • ')}</span>
                {validDestinations.length > 3 && (
                  <span className="text-white/70">+{validDestinations.length - 3} more</span>
                )}
              </div>

              {/* Quick Facts */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-200 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <div className="font-semibold">{duration}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-200 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Group Size</span>
                  </div>
                  <div className="font-semibold">{groupSize}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-200 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Best Time</span>
                  </div>
                  <div className="font-semibold">{bestTime}</div>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-orange-400">{price}</span>
                  {originalPrice && (
                    <span className="text-xl text-white/60 line-through">{originalPrice}</span>
                  )}
                  <span className="text-lg text-blue-200">per person</span>
                </div>
                <p className="text-white/80 text-sm">*Prices subject to availability and season</p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/enquire-now?package=${encodeURIComponent(title)}&destination=${encodeURIComponent(validDestinations[0] || '')}`} className="flex-1">
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r bg-gradient-warm text-white hover:opacity-90 text-white font-bold py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-200 group"
                    >
                      🚀 Book Now - Best Price Guaranteed
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                    aria-label="Open Virtual Tour Preview"
                    onClick={() => setShowVirtualTour(true)}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Virtual Tour
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Features */}
            <div className="space-y-6">
              {/* Trust Indicators */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-800">100% Safe</div>
                      <div className="text-xs text-gray-600">Secure Booking</div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-800">Best Price</div>
                      <div className="text-xs text-gray-600">Guaranteed</div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Wifi className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-800">24/7 Support</div>
                      <div className="text-xs text-gray-600">Always Available</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Highlights */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    Top Highlights
                  </h3>
                  <div className="space-y-3">
                    {validHighlights.slice(0, 4).map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{highlight}</span>
                      </div>
                    ))}
                    {validHighlights.length > 4 && (
                      <div className="text-sm text-accent font-medium cursor-pointer hover:text-accent">
                        +{validHighlights.length - 4} more highlights →
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>


            </div>
          </div>
        </div>
      </div>

      {/* Virtual Tour Modal */}
      {showVirtualTour && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">Virtual Tour Preview</h3>
              <button
                onClick={() => setShowVirtualTour(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
              {(() => {
                // Build derived tour data from map locations if virtualTourData not provided
                const derivedTourStops = (!virtualTourData && mapLocations && mapLocations.length > 0)
                  ? mapLocations.slice(0, 6).map((loc, idx) => ({
                      id: String(idx + 1),
                      title: loc.name,
                      description: (loc as any).description || `Explore ${loc.name} with our curated experiences.`,
                      image: `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(loc.name)}`,
                      duration: '2-3 hours',
                      highlights: [
                        'Top photo spots',
                        'Local culture insights',
                        'Curated experiences'
                      ],
                      coordinates: loc.coordinates as any
                    }))
                  : null;

                const vt = (virtualTourData as any) || null;
                const vtStops = vt?.tourStops || vt?.stops || null;
                const vtDestination = vt?.destination || title;
                const effectiveTour = vtStops ? { destination: vtDestination, tourStops: vtStops } : (derivedTourStops ? { destination: title, tourStops: derivedTourStops } : null);

                return effectiveTour ? (
                  <VirtualTourPreview
                    destination={effectiveTour.destination}
                    tourStops={effectiveTour.tourStops}
                    packageTitle={title}
                    onBookTour={() => {
                      setShowVirtualTour(false);
                      // Add booking logic here
                    }}
                    onRequestFullTour={() => {
                      setShowVirtualTour(false);
                      // Add request full tour logic here
                    }}
                  />
                ) : (
                  <div className="p-6">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Virtual tour coming soon!</p>
                        <p className="text-sm text-gray-500 mt-2">Experience destinations before you travel</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernPackageHero;