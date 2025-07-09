
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const destinations = [
  {
    id: 1,
    name: 'Char Dham Yatra',
    location: 'Uttarakhand, India',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&h=400&fit=crop',
    rating: 4.9,
    duration: '10 Days',
    price: '₹45,000',
    description: 'Sacred pilgrimage to the four holy shrines'
  },
  {
    id: 2,
    name: 'Kashmir Paradise',
    location: 'Jammu & Kashmir, India',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    rating: 4.8,
    duration: '7 Days',
    price: '₹35,000',
    description: 'Heaven on earth with stunning landscapes'
  },
  {
    id: 3,
    name: 'Dubai Delights',
    location: 'Dubai, UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop',
    rating: 4.7,
    duration: '5 Days',
    price: '₹65,000',
    description: 'Modern marvels and luxury experiences'
  },
  {
    id: 4,
    name: 'Turkey Adventure',
    location: 'Istanbul, Turkey',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&h=400&fit=crop',
    rating: 4.6,
    duration: '8 Days',
    price: '₹75,000',
    description: 'Rich history meets stunning architecture'
  }
];

const FeaturedDestinations = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Popular <span className="text-orange-500">Tour Packages</span>
        </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Handpicked destinations that promise extraordinary experiences and unforgettable memories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinations.map((destination, index) => (
            <Card key={destination.id} className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white">
              <div className="relative overflow-hidden">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold">{destination.rating}</span>
                </div>
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    {destination.location}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{destination.name}</h3>
                <p className="text-gray-600 mb-4">{destination.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{destination.duration}</span>
                  </div>
                  <div className="text-xl font-bold text-orange-500">{destination.price}</div>
                </div>
                
                <Link to="/enquire-now">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-full transition-all duration-300 hover:scale-105">
                    Book Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products">
            <Button variant="outline" size="lg" className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105">
              View All Destinations
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
