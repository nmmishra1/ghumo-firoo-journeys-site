import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Star, Clock, Users, Camera } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  type: 'domestic' | 'international' | 'adventure' | 'heritage' | 'spiritual';
  rating: number;
  duration: string;
  groupSize: string;
  highlights: string[];
  image: string;
  price: string;
  description: string;
}

const destinations: Destination[] = [
  {
    id: 'rann-utsav',
    name: 'Rann Utsav Gujarat',
    coordinates: { lat: 23.8315, lng: 69.6693 },
    type: 'heritage',
    rating: 4.8,
    duration: '3-4 Days',
    groupSize: '2-15 People',
    highlights: ['White Desert', 'Cultural Festival', 'Handicrafts', 'Folk Dance'],
    image: '/Rann-Utsav-Gujarat.png',
    price: '₹15,999',
    description: 'Experience the magical white desert and vibrant cultural festival'
  },
  {
    id: 'char-dham-yatra',
    name: 'Char Dham Yatra',
    coordinates: { lat: 30.7333, lng: 79.0667 },
    type: 'spiritual',
    rating: 4.9,
    duration: '10-12 Days',
    groupSize: '4-20 People',
    highlights: ['Sacred Temples', 'Spiritual Journey', 'Mountain Views', 'Holy Rivers'],
    image: '/Kedarnath.png',
    price: '₹35,999',
    description: 'Sacred pilgrimage to the four holy shrines in Uttarakhand'
  },
  {
    id: 'kashmir-paradise',
    name: 'Kashmir Paradise',
    coordinates: { lat: 34.0837, lng: 74.7973 },
    type: 'adventure',
    rating: 4.7,
    duration: '6-8 Days',
    groupSize: '2-12 People',
    highlights: ['Dal Lake', 'Houseboats', 'Gulmarg', 'Pahalgam'],
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
    price: '₹28,999',
    description: 'Explore the breathtaking beauty of Kashmir valley'
  },
  {
    id: 'rajasthan-royal',
    name: 'Royal Rajasthan',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    type: 'heritage',
    rating: 4.6,
    duration: '7-9 Days',
    groupSize: '2-16 People',
    highlights: ['Palaces', 'Forts', 'Desert Safari', 'Cultural Shows'],
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    price: '₹22,999',
    description: 'Discover the royal heritage and desert landscapes'
  },
  {
    id: 'europe-tour',
    name: 'Europe Grand Tour',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    type: 'international',
    rating: 4.9,
    duration: '12-15 Days',
    groupSize: '6-25 People',
    highlights: ['Historic Cities', 'Art Museums', 'Cuisine', 'Architecture'],
    image: '/Europe Image.png',
    price: '₹1,25,999',
    description: 'Explore the cultural treasures of European capitals'
  },
  {
    id: 'georgia-adventure',
    name: 'Georgia Adventure',
    coordinates: { lat: 41.7151, lng: 44.8271 },
    type: 'international',
    rating: 4.9,
    duration: '7 Days',
    groupSize: '2-12 People',
    highlights: ['Caucasus Mountains', 'Old Tbilisi', 'Wine Regions', 'Ancient Churches'],
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    price: '₹72,000',
    description: 'Experience the stunning Caucasus mountains and unique Georgian hospitality'
  }
];

const typeColors = {
  domestic: 'bg-green-500',
  international: 'bg-blue-500',
  adventure: 'bg-accent',
  heritage: 'bg-purple-500',
  spiritual: 'bg-yellow-500'
};

const typeLabels = {
  domestic: 'Domestic',
  international: 'International',
  adventure: 'Adventure',
  heritage: 'Heritage',
  spiritual: 'Spiritual'
};

export const InteractiveMap: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
  const [zoom, setZoom] = useState(1);

  const filteredDestinations = destinations.filter(dest =>
    activeFilter === 'all' || dest.type === activeFilter
  );

  const handleMarkerClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setMapCenter(destination.coordinates);
  };

  const filters = [
    { key: 'all', label: 'All Destinations', color: 'bg-gray-500' },
    ...Object.entries(typeLabels).map(([key, label]) => ({
      key,
      label,
      color: typeColors[key as keyof typeof typeColors]
    }))
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Explore Our Destinations</h2>
            <p className="text-blue-100">Discover amazing places around the world</p>
          </div>
          <Navigation className="w-8 h-8 text-blue-200" />
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeFilter === filter.key
                ? `${filter.color} text-white shadow-lg`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Map Area */}
        <div className="lg:w-2/3 h-96 lg:h-[500px] relative bg-[#eef2f5] overflow-hidden group">
          
          <div 
            className="absolute inset-0 transition-transform duration-500 ease-out origin-center"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Simulated Map Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg viewBox="0 0 800 600" className="w-full h-full">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6b7280" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Destination Markers */}
            {filteredDestinations.map((destination, index) => {
              // Normalize coordinates to spread them beautifully across the grid
              // Lng bounds: ~0 to 90. Lat bounds: ~10 to 50
              const x = (destination.coordinates.lng / 100) * 80 + 10;
              const y = 100 - (((destination.coordinates.lat - 10) / 40) * 80 + 10);

              return (
                <div
                  key={destination.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${selectedDestination?.id === destination.id ? 'scale-125 z-20' : 'z-10'
                    }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => handleMarkerClick(destination)}
                >
                  <div className={`relative ${typeColors[destination.type]} rounded-full p-3 shadow-lg hover:shadow-xl`}>
                    <MapPin className="w-6 h-6 text-white" />
                    {selectedDestination?.id === destination.id && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {destination.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 0.5, 4))}
              className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <span className="text-lg font-bold">+</span>
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 0.5, 1))}
              className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <span className="text-lg font-bold">-</span>
            </button>
          </div>
        </div>

        {/* Destination Details */}
        <div className="lg:w-1/3 p-6 bg-gray-50 flex flex-col h-96 lg:h-[500px] overflow-y-auto custom-scrollbar">
          {selectedDestination ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.name}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxODBIMTc1VjEyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTE5MiAxNDBIMjA4VjE2MEgxOTJWMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
                <div className={`absolute top-3 left-3 ${typeColors[selectedDestination.type]} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                  {typeLabels[selectedDestination.type]}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedDestination.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{selectedDestination.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{selectedDestination.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{selectedDestination.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{selectedDestination.groupSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-bold text-blue-600">{selectedDestination.price}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDestination.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => navigate(`/packages/${selectedDestination.id}`)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Book Now
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a Destination</h3>
              <p className="text-gray-500">Click on any marker to view destination details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;