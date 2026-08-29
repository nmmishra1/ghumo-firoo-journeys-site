import React from 'react';
import { Users, Star, Clock, Map, ShieldCheck } from 'lucide-react';

const trustItems = [
  {
    icon: Users,
    number: "5,000+",
    title: "Happy Travelers",
    description: "Memorable journeys delivered"
  },
  {
    icon: Star,
    number: "4.9/5",
    title: "Verified Reviews",
    description: "Highly rated on Google & social"
  },
  {
    icon: Clock,
    number: "24x7",
    title: "On-Trip Support",
    description: "Always there when you travel"
  },
  {
    icon: Map,
    number: "100% Custom",
    title: "Custom Itineraries",
    description: "Designed around your preferences"
  },
  {
    icon: ShieldCheck,
    number: "Zero Hidden",
    title: "Transparent Pricing",
    description: "Clear and honest travel costs"
  }
];

const TrustSection = () => {
  return (
    <div className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#0a1128] rounded-2xl border border-white/10 shadow-2xl p-6 md:p-8 backdrop-blur-xl bg-opacity-95">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className={`flex flex-col items-center text-center p-3 transition-all duration-300 hover:scale-105 ${
                  index > 1 ? 'pt-6 md:pt-3' : ''
                } ${index > 0 ? 'md:pl-4' : ''}`}
              >
                <div className="p-3 bg-gradient-warm rounded-xl mb-4 shadow-lg shadow-accent/20">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white tracking-tight font-montserrat">
                  {item.number}
                </span>
                <span className="text-sm font-semibold text-accent mt-1 font-poppins">
                  {item.title}
                </span>
                <span className="text-xs text-slate-400 mt-1 max-w-[150px] font-poppins">
                  {item.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustSection;
