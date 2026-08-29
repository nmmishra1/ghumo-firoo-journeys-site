import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Rajesh Gupta",
    location: "Mumbai",
    rating: 5,
    text: "The helicopter service was a blessing for my parents. Very professional handling by Ghumo Firoo team. VIP darshan arrangements were excellent.",
    type: "Helicopter Yatra"
  },
  {
    name: "Amit & Priya",
    location: "Bangalore",
    rating: 5,
    text: "We took the 10-day road trip. The driver was very experienced in hill driving, and hotels were clean and comfortable. Highly recommended!",
    type: "Road Trip"
  },
  {
    name: "Suresh Reddy",
    location: "Hyderabad",
    rating: 5,
    text: "Seamless booking process. We were worried about weather disruptions, but the team kept us updated constantly. Great support.",
    type: "Helicopter Yatra"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Yatris Say</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow relative">
              <Quote className="absolute top-6 right-6 text-blue-100 w-10 h-10" />
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic leading-relaxed">"{t.text}"</p>
              <div>
                <h4 className="font-bold text-gray-900">{t.name}</h4>
                <p className="text-sm text-gray-500">{t.location} • <span className="text-blue-600 font-medium">{t.type}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
