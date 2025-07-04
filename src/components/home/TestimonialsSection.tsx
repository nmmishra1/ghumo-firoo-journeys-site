
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sanjay Kumar',
    location: 'Delhi, India',
    rating: 5,
    text: 'Excellent service from Ghumo Firoo Travels! They organized our family trip to Kedarnath and Badrinath perfectly. The driver was professional, hotels were clean, and the entire journey was hassle-free. Highly recommend their Char Dham packages!',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
  },
  {
    name: 'Neha Verma',
    location: 'Mumbai, India',
    rating: 5,
    text: 'Amazing experience with Ghumo Firoo! Their Kashmir package was beyond our expectations. From Dal Lake stay to Gulmarg snow activities, everything was perfectly planned. Great value for money and excellent customer service.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face'
  },
  {
    name: 'Rakesh Sharma',
    location: 'Jaipur, India',
    rating: 5,
    text: 'Best travel agency in Delhi! Booked Turkey tour through Ghumo Firoo and it was fantastic. Professional staff, timely responses, and excellent arrangements. The Cappadocia balloon ride was a dream come true. Will definitely book again!',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="text-orange-500">Travelers Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from the amazing people who've traveled with us
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <Quote className="w-8 h-8 text-orange-500 opacity-50" />
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-semibold">4.9/5 Average Rating</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <span className="font-semibold">500+ Reviews</span>
            <div className="w-px h-6 bg-gray-300"></div>
            <span className="font-semibold">Google Verified</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
