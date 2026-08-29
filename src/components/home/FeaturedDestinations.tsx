
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LazyImage from '@/components/ui/LazyImage';
import { supabase } from '@/integrations/supabase/client';

const destinations = [
  {
    id: 1,
    name: "Rann Utsav Special Package",
    location: "Kutch, Gujarat",
    image: "/Rann-Utsav-Gujarat.png",
    rating: 4.9,
    duration: "4 Days / 3 Nights",
    price: "₹7,999",
    description: "Experience the white salt desert of Kutch. Luxury tents, camel safaris, cultural performances, and traditional cuisine.",
    badge: "🎪 Cultural Festival",
    slug: "/packages/rann-utsav"
  },
  {
    id: 2,
    name: "Char Dham Yatra Sacred Package",
    location: "Uttarakhand, India",
    image: "/Badrinath.png",
    rating: 4.9,
    duration: "12 Days / 11 Nights",
    price: "₹45,000",
    description: "Holy pilgrimage to Yamunotri, Gangotri, Kedarnath, and Badrinath with VIP darshan and premium road travel.",
    badge: "🕉️ Sacred Yatra",
    slug: "/packages/char-dham-yatra"
  },
  {
    id: 3,
    name: "Kedarnath Dham Tour (Road & Heli)",
    location: "Kedarnath, Uttarakhand",
    image: "/Kedarnath.png",
    rating: 4.9,
    duration: "5 Days / 4 Nights",
    price: "₹14,999",
    description: "Scenic trek or quick helicopter ride to the holy shrine of Lord Shiva in the Himalayas. Premium services included.",
    badge: "🏔️ Himalayan Trek",
    slug: "/packages/char-dham-yatra"
  },
  {
    id: 4,
    name: "Grand Europe Highlights Tour",
    location: "Paris, Swiss Alps, Rome",
    image: "/Europe Image New.png",
    rating: 4.9,
    duration: "15 Days / 14 Nights",
    price: "₹1,85,000",
    description: "Travel across Western Europe's most iconic destinations. Eiffel Tower tours, Alpine train rides, and Italian art.",
    badge: "🏰 Premium Europe",
    slug: "/packages/europe-grand-tour"
  },
  {
    id: 5,
    name: "Dubai Glitz & Adventure Tour",
    location: "Dubai, UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200",
    rating: 4.8,
    duration: "6 Days / 5 Nights",
    price: "₹45,000",
    description: "Burj Khalifa sky view, desert safari with BBQ, luxury cruise dinner, and shopping at world-class malls.",
    badge: "🏙️ Desert Luxury",
    slug: "/packages/dubai-delights"
  },
  {
    id: 6,
    name: "Bali Tropical Paradise Getaway",
    location: "Ubud & Seminyak, Bali",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200",
    rating: 4.8,
    duration: "7 Days / 6 Nights",
    price: "₹39,999",
    description: "Scenic rice terraces, ancient water temples, private beach villas, and traditional fire dances.",
    badge: "🌴 Island Retreat",
    slug: "/packages/bali-paradise"
  },
  {
    id: 7,
    name: "Thailand Highlights Tour",
    location: "Bangkok & Phuket, Thailand",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=1200",
    rating: 4.7,
    duration: "6 Days / 5 Nights",
    price: "₹29,999",
    description: "Golden temples of Bangkok, speedboat tour to Phi Phi islands, and vibrant night bazaars.",
    badge: "🏖️ Tropical Escape",
    slug: "/packages/thailand-tropical"
  },
  {
    id: 8,
    name: "Kashmir Paradise Tour",
    location: "Srinagar, Gulmarg, Pahalgam",
    image: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?q=80&w=1200",
    rating: 4.8,
    duration: "7 Days / 6 Nights",
    price: "₹19,999",
    description: "Dal Lake houseboat stay, Shikara ride, Gulmarg snow gondola tickets, and scenic Pahalgam valley tours.",
    badge: "❄️ Heaven on Earth",
    slug: "/packages/kashmir-paradise"
  }
];

const FeaturedDestinations = () => {
  const [dbPrices, setDbPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchDbPrices = async () => {
      try {
        const res = await fetch('/php-backend/packages.php');
        if (!res.ok) throw new Error('Failed to fetch packages');
        const data = await res.json();
        if (data) {
          const priceMap: Record<string, number> = {};
          data.forEach((pkg: any) => {
            if (pkg.slug && pkg.is_active) {
              priceMap[pkg.slug] = Number(pkg.price);
            }
          });
          setDbPrices(priceMap);
        }
      } catch (err) {
        console.error('Error fetching database prices:', err);
      }
    };
    fetchDbPrices();
  }, []);

  const resolvedDestinations = useMemo(() => {
    return destinations.map(dest => {
      const cleanSlug = dest.slug?.replace(/^\/packages\//, '');
      const dbPrice = dbPrices[cleanSlug || ''];
      if (dbPrice) {
        return {
          ...dest,
          price: `Starting From ₹${dbPrice.toLocaleString('en-IN')} Per Person`
        };
      }
      const numericString = dest.price.replace(/[^0-9]/g, '');
      const numericPrice = Number(numericString) || 0;
      return {
        ...dest,
        price: `Starting From ₹${numericPrice.toLocaleString('en-IN')} Per Person`
      };
    });
  }, [dbPrices]);

  return (
    <section className="py-24 bg-gray-50 text-[#0a1128]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-accent border border-accent/20 px-4 py-2 rounded-full text-sm font-semibold tracking-wide uppercase font-poppins">
            🔥 Trending Journeys
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-montserrat">
            Our Top <span className="text-accent">Trending Journeys</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-poppins">
            Discover handpicked, premium travel experiences crafted for families, couples, and groups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {resolvedDestinations.map((destination) => (
            <Card key={destination.id} className="group overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border-gray-100 bg-white rounded-2xl flex flex-col h-full">
              <div className="relative overflow-hidden rounded-t-2xl aspect-[4/3]">
                <LazyImage 
                  src={destination.image} 
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-gradient-warm text-white rounded-full px-3 py-1 text-xs font-bold shadow-md">
                  {destination.badge}
                </div>
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 shadow-md border border-gray-200">
                  <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                  <span className="text-xs font-bold text-primary">{destination.rating}</span>
                </div>
                <div className="absolute bottom-3 left-3 text-white flex items-center gap-1 text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  {destination.location}
                </div>
              </div>
              
              <CardContent className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-primary leading-snug group-hover:text-accent transition-colors duration-300 line-clamp-1">{destination.name}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 font-medium">{destination.description}</p>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      <span className="text-xs font-semibold">{destination.duration}</span>
                    </div>
                    <div className="text-lg font-bold text-accent">{destination.price}</div>
                  </div>
                  
                  <Link to={destination.slug || "/enquire-now"} className="block">
                    <Button className="w-full bg-primary hover:bg-secondary text-white rounded-xl py-2.5 font-bold text-sm transition-all duration-300 hover:shadow-md border-0 cursor-pointer">
                      Explore Package
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16 space-y-4">
          <p className="text-gray-600 text-base font-semibold font-poppins">
            Looking for something custom? We create bespoke itineraries around your calendar.
          </p>
          <Link to="/packages">
            <Button variant="outline" size="lg" className="border-2 border-accent text-accent hover:bg-gradient-warm hover:text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 cursor-pointer">
              View All Packages
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;
