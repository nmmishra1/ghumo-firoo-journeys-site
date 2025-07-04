
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Globe, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-40"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-orange-400/20 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-blue-400/20 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-20 right-40 w-24 h-24 bg-purple-400/10 rounded-full animate-pulse delay-300"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            Your
            <span className="block bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Dream Journey
            </span>
            Awaits
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto leading-relaxed">
            Your Journey, Our Expertise – Trusted Indian Travel Agency
          </p>
          <p className="text-lg md:text-xl text-white/75 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover breathtaking destinations and create unforgettable memories with our expertly crafted travel experiences
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-6 h-6 text-orange-400" />
              <span className="text-lg">500+ Destinations</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Globe className="w-6 h-6 text-blue-400" />
              <span className="text-lg">50+ Countries</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="w-6 h-6 text-purple-400" />
              <span className="text-lg">10+ Years Experience</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/enquire-now">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm bg-white/10 transition-all duration-300 hover:scale-105">
                Explore Packages
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
