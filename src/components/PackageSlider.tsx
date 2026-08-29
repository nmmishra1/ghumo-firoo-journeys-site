import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Clock, Users, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { pushEvent } from '@/lib/analytics';

interface Package {
  title: string;
  seoTitle: string;
  description: string;
  image: string;
  duration: string;
  price: string;
  highlights: string[];
  slug?: string;
}

interface PackageSliderProps {
  packages: Package[];
  title: string;
  subtitle: string;
  type: 'domestic' | 'international';
}

const PackageSlider: React.FC<PackageSliderProps> = ({ packages, title, subtitle, type }) => {
  // Early return if no packages
  if (!packages || packages.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          </div>
          <div className="text-center text-gray-500">
            <p>No packages available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(1);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1280) setItemsPerView(4);
      else if (window.innerWidth >= 1024) setItemsPerView(3);
      else if (window.innerWidth >= 768) setItemsPerView(2);
      else setItemsPerView(1);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !packages || packages.length === 0) return;
    
    const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, packages.length - itemsPerView);
          return prev >= maxIndex ? 0 : prev + 1;
        });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, packages?.length, itemsPerView]);

  const nextSlide = () => {
    if (!packages || packages.length === 0) return;
    const maxIndex = Math.max(0, packages.length - itemsPerView);
    setCurrentIndex((prev) => {
      const next = prev >= maxIndex ? 0 : prev + 1;
      try { pushEvent('slider_next', { slider: title, type, prevIndex: prev, nextIndex: next }); } catch {}
      return next;
    });
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    if (!packages || packages.length === 0) return;
    const maxIndex = Math.max(0, packages.length - itemsPerView);
    setCurrentIndex((prev) => {
      const next = prev <= 0 ? maxIndex : prev - 1;
      try { pushEvent('slider_prev', { slider: title, type, prevIndex: prev, nextIndex: next }); } catch {}
      return next;
    });
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    if (!packages || packages.length === 0) return;
    try { pushEvent('slider_goto', { slider: title, type, index }); } catch {}
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const maxIndex = Math.max(0, packages.length - itemsPerView);

  return (
    <section className={`py-16 ${type === 'domestic' ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge variant="outline" className={`${type === 'domestic' ? 'border-green-200 text-green-700 bg-green-50' : 'border-blue-200 text-blue-700 bg-blue-50'} px-4 py-2 text-sm font-medium`}>
              {type === 'domestic' ? '🇮🇳 Domestic Tours' : '🌍 International Tours'}
            </Badge>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Slider Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft') prevSlide(); if (e.key === 'ArrowRight') nextSlide(); }}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${title} - packages carousel`}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            onFocus={() => setIsAutoPlaying(false)}
            onBlur={() => setIsAutoPlaying(true)}
            aria-label="Previous slide"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full ${type === 'domestic' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center -ml-6`}
            disabled={packages.length <= itemsPerView}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            onFocus={() => setIsAutoPlaying(false)}
            onBlur={() => setIsAutoPlaying(true)}
            aria-label="Next slide"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full ${type === 'domestic' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center -mr-6`}
            disabled={packages.length <= itemsPerView}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Pause/Play Autoplay */}
          <button
            onClick={() => { setIsAutoPlaying(!isAutoPlaying); try { pushEvent(isAutoPlaying ? 'slider_pause' : 'slider_resume', { slider: title, type }); } catch {} }}
            aria-label={isAutoPlaying ? 'Pause autoplay' : 'Resume autoplay'}
            className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full text-white ${type === 'domestic' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} shadow-md`}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Slider Track */}
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {packages.map((pkg, index) => (
                <div key={index} className={`flex-shrink-0 px-3`} style={{ width: `${100 / itemsPerView}%` }}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden">
                    <div className="relative overflow-hidden">
                      <img 
                        src={pkg.image} 
                        alt={pkg.seoTitle}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={`${type === 'domestic' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
                          {pkg.duration}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">4.8</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                        {pkg.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                      
                      {/* Highlights */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {pkg.highlights.slice(0, 2).map((highlight, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                          {pkg.highlights.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{pkg.highlights.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-accent">{pkg.price}*</span>
                          <p className="text-xs text-gray-500">*Terms & Conditions Applied</p>
                        </div>
                        <Button asChild size="sm" className={`${type === 'domestic' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                          {pkg.slug ? (
                            <Link to={pkg.slug} onClick={() => { try { pushEvent('view_details_click', { slider: title, slug: pkg.slug }); } catch {} }}>View Details</Link>
                          ) : (
                            <Link to="/enquire-now" onClick={() => { try { pushEvent('enquire_now_click', { slider: title }); } catch {} }}>Enquire Now</Link>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          {packages.length > itemsPerView && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === index 
                      ? (type === 'domestic' ? 'bg-green-500 w-8' : 'bg-blue-500 w-8')
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Live region for screen readers */}
          <div className="sr-only" aria-live="polite">
            {`Showing ${title} slide ${Math.min(currentIndex + 1, maxIndex + 1)} of ${maxIndex + 1}`}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline" className={`${type === 'domestic' ? 'border-green-500 text-green-600 hover:bg-green-50' : 'border-blue-500 text-blue-600 hover:bg-blue-50'} px-8 py-3`}>
            <Link to="/products">View All {type === 'domestic' ? 'Domestic' : 'International'} Packages</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PackageSlider;