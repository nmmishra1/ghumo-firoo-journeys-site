
import React, { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, ShieldCheck, HeartHandshake, Compass, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import FloatingElements from './FloatingElements';
import HeroLeadForm from './HeroLeadForm';

const TrustBadgeCard = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
  <div className="flex flex-col items-center p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-accent/40 hover:bg-white/10 transition-all duration-300 group">
    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-accent/10 transition-colors mb-3">
      <Icon className="w-6 h-6 text-accent" />
    </div>
    <span className="text-lg font-bold text-white mb-1 text-center font-montserrat">{title}</span>
    <span className="text-xs text-white/60 text-center font-medium">{subtitle}</span>
  </div>
);

const HeroSection = memo(() => {
  const trustBadges = useMemo(() => [
    { icon: HeartHandshake, title: "5000+ Happy Guests", subtitle: "Memorable Experiences" },
    { icon: Star, title: "Verified Reviews", subtitle: "4.9/5 Google Rating" },
    { icon: Compass, title: "Custom Itineraries", subtitle: "100% Tailored Tours" },
    { icon: Headphones, title: "24/7 Support", subtitle: "Concierge Assistance" }
  ], []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-0">
      {/* Luxury Video Background with Dark Overlay */}
      <div className="absolute inset-0 bg-[#0B1026]">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        >
          <source src="/Kedarnath Video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/80 via-[#0B1026]/90 to-[#0B1026] z-[1]"></div>
        {/* Animated Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <FloatingElements />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Content */}
          <div className="text-center lg:text-left space-y-8 fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-xl shadow-accent/5 mb-2 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
              <span className="text-xs md:text-sm font-semibold tracking-wide uppercase font-poppins">Premium India & Europe Tour Specialists</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight font-montserrat">
              Your Journey <br />
              <span className="text-gradient-warm animate-gradient-x">
                Begins Here
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light mt-4 font-poppins">
              Crafting premium customized travel packages across India & Europe. Sit back, relax, and let our experts design your dream vacation.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button 
                asChild
                size="lg" 
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-warm hover:bg-gradient-warm text-[#0B1026] font-bold text-base shadow-xl shadow-accent/10 transition-all hover:scale-105 active:scale-95 border-0 cursor-pointer"
              >
                <Link to="/custom-tour-packages">
                  Plan My Holiday <ArrowRight className="ml-2 w-5 h-5 text-[#0B1026]" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto h-14 px-8 rounded-2xl border-2 border-white/20 bg-white/5 backdrop-blur-md text-white font-bold text-base hover:bg-white hover:text-[#0B1026] hover:border-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <a href="tel:+919910987264">
                  Talk To Expert
                </a>
              </Button>
            </div>

            {/* Trust Badges Grid */}
            <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/10">
              {trustBadges.map((badge, index) => (
                <TrustBadgeCard
                  key={index}
                  icon={badge.icon}
                  title={badge.title}
                  subtitle={badge.subtitle}
                />
              ))}
            </div>
          </div>

          {/* Lead Form */}
          <div className="w-full max-w-md mx-auto fade-in-up delay-200 mt-8 lg:mt-0">
            <div className="bg-[#1A2342]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-glass-lg">
              <HeroLeadForm />
            </div>
          </div>

        </div>
      </div>
      
      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block text-white/50 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-scroll"></div>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;

