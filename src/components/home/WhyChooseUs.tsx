
import React from 'react';
import { Shield, Award, HeartHandshake, Clock, Plane, Star, Users, MapPin, CheckCircle, Phone, BadgeCheck } from 'lucide-react';

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified Hotels',
    description: 'Handpicked premium accommodations with verified safety, comfort, and top-tier guest amenities.',
    color: 'text-amber-500',
    badge: 'Vetted'
  },
  {
    icon: MapPin,
    title: 'Custom Itineraries',
    description: 'Bespoke itineraries crafted specifically around your travel speed, budget, and destination preferences.',
    color: 'text-blue-500',
    badge: 'Tailored'
  },
  {
    icon: Phone,
    title: '24x7 Support',
    description: 'Round-the-clock dedicated assistance hotline and instant WhatsApp support during your trip.',
    color: 'text-emerald-500',
    badge: 'Active'
  },
  {
    icon: Users,
    title: 'Local Experts',
    description: 'Certified local coordinators and travel specialists possessing deep insider knowledge of each region.',
    color: 'text-purple-500',
    badge: 'Experienced'
  },
  {
    icon: Award,
    title: 'Transparent Pricing',
    description: 'Zero hidden costs or surprise fees. Completely itemized quotations showing exactly what you pay.',
    color: 'text-pink-500',
    badge: 'Guaranteed'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-white text-[#0a1128]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-4xl md:text-5xl font-extrabold font-montserrat">
            Why Choose <span className="text-accent">Ghumo Firoo Travels</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-poppins">
            Experts in Rann Utsav, Char Dham Yatra & Europe Holidays. Trusted by 50,000+ families, couples, and groups.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="bg-[#0a1128] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
              ✅ Government Approved
            </div>
            <div className="bg-[#d4af37] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
              🌟 15+ Years Experience
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 bg-gradient-warm text-white text-xs px-3 py-1 rounded-full font-bold">
                  {feature.badge}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md border border-gray-100">
                  <IconComponent className="w-8 h-8 text-accent" />
                </div>
                
                <h3 className="text-xl font-bold text-primary mb-3 font-montserrat">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm font-poppins">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Enhanced Stats Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-br from-[#0a1128] to-[#1c2541] rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-accent/10 rounded-full blur-[80px]"></div>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 font-montserrat">
              Our Track Record Speaks
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-accent mb-2">50K+</div>
                <div className="text-slate-300 font-semibold text-sm">Happy Pilgrims & Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-accent mb-2">500+</div>
                <div className="text-slate-300 font-semibold text-sm">Scenic Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-accent mb-2">15+</div>
                <div className="text-slate-300 font-semibold text-sm">Years Travel Excellence</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-accent mb-2">99%</div>
                <div className="text-slate-300 font-semibold text-sm">Satisfaction Rate</div>
              </div>
            </div>
            
            {/* Credentials */}
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <div className="bg-white/5 rounded-xl px-6 py-3 border border-white/10 hover:border-accent transition-all">
                <span className="text-sm font-semibold text-slate-200">🏛️ Government Certified</span>
              </div>
              <div className="bg-white/5 rounded-xl px-6 py-3 border border-white/10 hover:border-accent transition-all">
                <span className="text-sm font-semibold text-slate-200">✈️ IATA Approved</span>
              </div>
              <div className="bg-white/5 rounded-xl px-6 py-3 border border-white/10 hover:border-accent transition-all">
                <span className="text-sm font-semibold text-slate-200">🛡️ Fully Insured</span>
              </div>
              <div className="bg-white/5 rounded-xl px-6 py-3 border border-white/10 hover:border-accent transition-all">
                <span className="text-sm font-semibold text-slate-200">🏆 Award Winning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
