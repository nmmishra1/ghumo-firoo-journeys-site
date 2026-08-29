
import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import '../../styles/animations.css';

const ContactHero = () => {
  return (
    <section 
      className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8)), url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=600&fit=crop')"
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 right-10 w-20 h-20 bg-white/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6">
        <div className="animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-blue-100 font-light px-2">
            Ready to embark on your next adventure? Let's plan your perfect journey together.
          </p>
        </div>
        
        {/* Quick contact info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-10 md:mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <MapPin className="w-6 h-6 mb-2 text-blue-200 group-hover:text-white transition-colors" />
            <span className="text-sm text-blue-100 group-hover:text-white transition-colors">Visit Us</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <Phone className="w-6 h-6 mb-2 text-blue-200 group-hover:text-white transition-colors" />
            <span className="text-sm text-blue-100 group-hover:text-white transition-colors">Call Us</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <Mail className="w-6 h-6 mb-2 text-blue-200 group-hover:text-white transition-colors" />
            <span className="text-sm text-blue-100 group-hover:text-white transition-colors">Email Us</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <Clock className="w-6 h-6 mb-2 text-blue-200 group-hover:text-white transition-colors" />
            <span className="text-sm text-blue-100 group-hover:text-white transition-colors">24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
