
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute top-20 right-0 w-48 h-48 bg-white rounded-full translate-x-24 -translate-y-24"></div>
        <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-white rounded-full translate-y-28"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Start Your
          <span className="block">Amazing Journey?</span>
        </h2>
        
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          Let us help you create memories that will last a lifetime. Our travel experts are ready to craft your perfect adventure.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link to="/enquire-now">
            <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105">
              Plan My Trip
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-purple-700 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm bg-white/10 transition-all duration-300 hover:scale-105">
              Contact Us
            </Button>
          </Link>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-white/90">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <a href="tel:+919910987264" className="hover:text-white transition-colors">
              +91 9910987264
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <a href="mailto:booking@ghumofiroo.com" className="hover:text-white transition-colors">
              booking@ghumofiroo.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
