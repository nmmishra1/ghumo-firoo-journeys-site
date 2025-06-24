
import React from 'react';
import { Shield, Award, HeartHandshake, Clock, Plane, Star } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Your safety is our priority with comprehensive travel insurance and 24/7 support',
    color: 'text-blue-500'
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Recognized excellence in travel services with multiple industry awards',
    color: 'text-yellow-500'
  },
  {
    icon: HeartHandshake,
    title: 'Personalized Service',
    description: 'Customized itineraries tailored to your preferences and travel style',
    color: 'text-pink-500'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock assistance wherever you are in the world',
    color: 'text-green-500'
  },
  {
    icon: Plane,
    title: 'Best Price Guarantee',
    description: 'Competitive pricing with no hidden costs and transparent billing',
    color: 'text-purple-500'
  },
  {
    icon: Star,
    title: 'Expert Guides',
    description: 'Local expert guides who bring destinations to life with their knowledge',
    color: 'text-orange-500'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-orange-500">Ghumo Firoo</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            With over a decade of experience, we've perfected the art of creating magical travel experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className={`w-8 h-8 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">500+</div>
            <div className="text-gray-600">Happy Travelers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">50+</div>
            <div className="text-gray-600">Destinations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-purple-500 mb-2">10+</div>
            <div className="text-gray-600">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">98%</div>
            <div className="text-gray-600">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
