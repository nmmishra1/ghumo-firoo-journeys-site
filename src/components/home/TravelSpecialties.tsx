import React, { useState, useEffect } from 'react';
import LazyImage from '@/components/ui/LazyImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar, Star, ArrowRight, Plane, Mountain, Crown, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pushEvent } from '@/lib/analytics';

const TravelSpecialties = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const specialties = [
    {
      id: 'char-dham',
      title: 'Char Dham Yatra Specialist',
      subtitle: 'Sacred Pilgrimage Journeys',
      description: 'Experience the divine with our expertly crafted Char Dham Yatra packages. We specialize in sacred pilgrimages to Kedarnath, Badrinath, Gangotri, and Yamunotri with helicopter services, comfortable accommodations, and spiritual guides.',
      icon: Mountain,
      image: '/Badrinath.png',
       bgImage: '/Gangotri.png',
      features: [
        'Helicopter Services Available',
        'Experienced Spiritual Guides',
        'VIP Darshan Arrangements',
        'Comfortable Accommodations',
        'Medical Support Available'
      ],
      pricing: 'Starting from ₹25,000',
      duration: '8-12 Days',
      bestTime: 'May to October',
      link: '/packages/char-dham-yatra',
      badge: 'Most Popular',
      color: 'bg-gradient-warm text-white'
    },
    {
      id: 'europe-tours',
      title: 'Europe Tour Expert',
      subtitle: 'Luxury European Adventures',
      description: 'Discover the charm of Europe with our premium tour packages. From romantic Paris to scenic Switzerland, historic London to vibrant Amsterdam - we create unforgettable European experiences with luxury accommodations and expert local guides.',
      icon: Plane,
      image: '/Europe Image New.png',
      bgImage: '/Europe Image Neww.png',
      features: [
        'Luxury Hotel Accommodations',
        'Expert Local Guides',
        'Skip-the-Line Tickets',
        'Private Transportation',
        'Customizable Itineraries'
      ],
      pricing: 'Starting from ₹1,35,000',
      duration: '10-15 Days',
      bestTime: 'April to September',
      link: '/packages/europe-grand-tour',
      badge: 'Premium',
      color: 'from-blue-500 to-purple-600',
      packages: [
        {
          id: 3,
          name: "Grand Europe Tour",
          location: "Multi-Country Europe",
          image: "https://images.unsplash.com/photo-1537459247134-9b469c557249?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=600&q=80",
          rating: 4.9,
          duration: "15 Days",
          price: "₹2,25,000",
          description: "Luxury European adventure covering Paris, Rome, Switzerland, Amsterdam & London with premium accommodations.",
          badge: "🏰 Premium Europe"
        },
        {
          id: 4,
          name: "Switzerland & Croatia Discovery",
          location: "Switzerland & Croatia",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=600&q=80",
          rating: 4.8,
          duration: "10 Days",
          price: "₹1,35,000",
          description: "Alpine lakes to Adriatic coast journey featuring Swiss Alps, Croatian islands, and UNESCO World Heritage sites.",
          badge: "🏔️ Alps to Adriatic"
        }
      ]
    },
    {
      id: 'rajasthan-heritage',
      title: 'Rajasthan Heritage Tours',
      subtitle: 'Royal Palace Experiences',
      description: 'Step into the royal legacy of Rajasthan with our heritage tours. Stay in magnificent palace hotels, explore majestic forts, enjoy cultural performances, and experience the royal hospitality that defines the Land of Kings.',
      icon: Crown,
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3',
       bgImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3',
      features: [
        'Palace Hotel Stays',
        'Private Fort Tours',
        'Cultural Performances',
        'Desert Safari Experiences',
        'Royal Dining Experiences'
      ],
      pricing: 'Starting from ₹35,000',
      duration: '6-10 Days',
      bestTime: 'October to March',
      link: '/packages/rajasthan-royal',
      badge: 'Heritage',
      color: 'from-pink-500 to-orange-600'
    }
  ];

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % specialties.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, specialties.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % specialties.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + specialties.length) % specialties.length);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
       <div className="absolute inset-0 opacity-10">
         <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:60px_60px] animate-pulse"></div>
         </div>
       </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Premium <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Travel Packages</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Embark on extraordinary journeys with our curated collection of premium travel experiences, designed for the discerning traveler.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Main Carousel */}
          <div className="relative h-[500px] md:h-[600px] lg:h-[700px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
            {specialties.map((specialty, index) => {
              const IconComponent = specialty.icon;
              const isActive = index === currentSlide;
              return (
                <div
                  key={specialty.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    isActive 
                      ? 'opacity-100 scale-100 z-10 pointer-events-auto' 
                      : 'opacity-0 scale-105 z-0 pointer-events-none'
                  }`}
                  aria-hidden={!isActive}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <LazyImage
                      src={specialty.bgImage}
                      alt={specialty.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${specialty.color} opacity-80`}></div>
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex items-center">
                    <div className="max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                      {/* Left Content */}
                      <div className="text-white space-y-4 md:space-y-6">
                        <div className="flex items-center gap-3 md:gap-4">
                          <IconComponent className="w-10 h-10 md:w-12 md:h-12 text-white" />
                          <Badge className="bg-white/20 text-white border-white/30 text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2">
                            {specialty.badge}
                          </Badge>
                        </div>
                        
                        <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
                          {specialty.title}
                        </h3>
                        
                        <p className="text-lg md:text-xl text-white/90 font-medium">
                          {specialty.subtitle}
                        </p>
                        
                        <p className="text-sm md:text-lg text-white/80 leading-relaxed max-w-lg">
                          {specialty.description}
                        </p>

                        <div className="flex flex-wrap gap-4 md:gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                            <span>{specialty.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 md:w-5 md:h-5" />
                            <span>{specialty.bestTime}</span>
                          </div>
                        </div>

                        <div className="text-2xl md:text-3xl font-bold text-white">
                          {specialty.pricing}
                        </div>

                        <Link to={specialty.link}>
                          <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg">
                            Explore Package
                            <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                          </Button>
                        </Link>
                      </div>

                      {/* Right Content - Package Image */}
                      <div className="relative mt-8 lg:mt-0">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-1 lg:rotate-3 hover:rotate-0 transition-transform duration-500">
                          <LazyImage
                            src={specialty.image}
                            alt={specialty.title}
                            className="w-full h-64 md:h-80 lg:h-96 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                        
                        {/* Features List */}
                        <div className="absolute -bottom-4 -left-2 md:-bottom-6 md:-left-6 bg-white/95 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-xl max-w-xs">
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Package Highlights</h4>
                          <div className="space-y-1">
                            {specialty.features.slice(0, 3).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs md:text-sm">
                                <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0"></div>
                                <span className="text-gray-700 leading-tight">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 z-20">
            <Button
              onClick={prevSlide}
              size="icon"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm rounded-full w-10 h-10 md:w-12 md:h-12 transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 z-20">
            <Button
              onClick={nextSlide}
              size="icon"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm rounded-full w-10 h-10 md:w-12 md:h-12 transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </div>

          {/* Auto-play Control */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              onClick={toggleAutoPlay}
              size="icon"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm rounded-full w-10 h-10"
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="flex gap-3">
              {specialties.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-16 space-y-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-300 text-lg mb-4">
              Can't find what you're looking for? We create custom itineraries tailored to your preferences.
            </p>
            <p className="text-gray-400 text-sm">
              Our travel experts will design the perfect journey just for you.
            </p>
          </div>
          <Link to="/custom-tour-packages">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-accent text-accent hover:bg-accent/100 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => { try { pushEvent('custom_tour_click', { source: 'home_travel_specialties' }); } catch {} }}
            >
              Plan Custom Trip
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TravelSpecialties;