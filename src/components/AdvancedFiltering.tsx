import React, { useState, useEffect } from 'react';
import { Filter, X, Search, Calendar, MapPin, Users, Star, Clock, IndianRupee, Mountain, Compass, Heart, Building, Sparkles, Award } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface FilterOptions {
  searchTerm: string;
  priceRange: { min: number; max: number };
  duration: { min: number; max: number };
  categories: string[];
  destinations: string[];
  groupSize: string[];
  rating: number;
  difficulty: string[];
  bestTime: string[];
  amenities: string[];
}

interface Package {
  id: string;
  name: string;
  destination: string;
  category: string[];
  duration: number;
  price: number;
  rating: number;
  groupSize: string;
  difficulty: string;
  bestTime: string;
  amenities: string[];
  image: string;
  description: string;
  route: string;
}

const samplePackages: Package[] = [
  {
    id: 'rann-utsav',
    name: 'Rann Utsav Gujarat',
    destination: 'Gujarat',
    category: ['domestic', 'premium', 'heritage'],
    duration: 4,
    price: 15999,
    rating: 4.8,
    groupSize: '2-15',
    difficulty: 'easy',
    bestTime: 'winter',
    amenities: ['accommodation', 'meals', 'transport', 'guide'],
    image: '/Rann-Utsav-Gujarat.png',
    route: '/packages/rann-utsav',
    description: 'Experience the magical white desert and vibrant cultural festival.'
  },
  {
    id: 'char-dham',
    name: 'Char Dham Yatra',
    destination: 'Uttarakhand',
    category: ['domestic', 'spiritual'],
    duration: 12,
    price: 35999,
    rating: 4.9,
    groupSize: '4-20',
    difficulty: 'moderate',
    bestTime: 'summer',
    amenities: ['accommodation', 'meals', 'transport', 'guide', 'helicopter'],
    image: '/chardham-by-helicopter.jpg',
    route: '/packages/char-dham-yatra',
    description: 'Sacred pilgrimage across Kedarnath, Badrinath, Gangotri, and Yamunotri.'
  },
  {
    id: 'kashmir-paradise',
    name: 'Kashmir Paradise',
    destination: 'Kashmir',
    category: ['domestic', 'adventure'],
    duration: 7,
    price: 28999,
    rating: 4.7,
    groupSize: '2-12',
    difficulty: 'easy',
    bestTime: 'summer',
    amenities: ['accommodation', 'meals', 'transport', 'activities'],
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    route: '/packages/kashmir-paradise',
    description: 'Explore the breathtaking beauty of the Kashmir valley with scenic lakes and mountains.'
  },
  {
    id: 'europe-tour',
    name: 'Europe Grand Tour',
    destination: 'Europe',
    category: ['international', 'premium'],
    duration: 14,
    price: 125999,
    rating: 4.9,
    groupSize: '6-25',
    difficulty: 'moderate',
    bestTime: 'summer',
    amenities: ['accommodation', 'breakfast', 'transport', 'guide'],
    image: '/Europe%20Image.png',
    route: '/packages/europe-grand-tour',
    description: 'Move through iconic European capitals, museums, and local experiences.'
  },
  {
    id: 'kerala-backwaters',
    name: 'Kerala Backwaters',
    destination: 'Kerala',
    category: ['domestic', 'honeymoon'],
    duration: 6,
    price: 20000,
    rating: 4.7,
    groupSize: '2-12',
    difficulty: 'easy',
    bestTime: 'winter',
    amenities: ['houseboat', 'meals', 'transport'],
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    route: '/packages/kerala-backwaters',
    description: 'Cruise Kerala’s serene backwaters with houseboat stays and lush tea gardens.'
  },
  {
    id: 'himachal-hills',
    name: 'Himachal Hill Stations',
    destination: 'Himachal Pradesh',
    category: ['domestic', 'adventure'],
    duration: 8,
    price: 24000,
    rating: 4.6,
    groupSize: '2-12',
    difficulty: 'moderate',
    bestTime: 'summer',
    amenities: ['accommodation', 'meals', 'transport'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    route: '/packages/himachal-hill-stations',
    description: 'Discover Himalayan hill stations, monasteries, and scenic mountain roads.'
  },
  {
    id: 'dubai-delights',
    name: 'Dubai Delights',
    destination: 'Dubai',
    category: ['international', 'premium'],
    duration: 6,
    price: 45000,
    rating: 4.8,
    groupSize: '2-12',
    difficulty: 'easy',
    bestTime: 'winter',
    amenities: ['accommodation', 'meals', 'transport'],
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    route: '/packages/dubai-delights',
    description: 'Experience Dubai’s iconic skyline, desert safari, and luxury shopping.'
  },
  {
    id: 'singapore-city-delight',
    name: 'Singapore City Delight',
    destination: 'Singapore',
    category: ['international', 'premium'],
    duration: 5,
    price: 59999,
    rating: 4.8,
    groupSize: '2-12',
    difficulty: 'easy',
    bestTime: 'winter',
    amenities: ['accommodation', 'meals', 'transport'],
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    route: '/packages/singapore-city-delight',
    description: 'Enjoy a premium city escape with modern attractions and nightlife.'
  },
  {
    id: 'bali-paradise',
    name: 'Bali Paradise',
    destination: 'Bali',
    category: ['international', 'honeymoon'],
    duration: 8,
    price: 48000,
    rating: 4.7,
    groupSize: '2-12',
    difficulty: 'easy',
    bestTime: 'winter',
    amenities: ['accommodation', 'meals', 'transport'],
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1200&q=80',
    route: '/packages/bali-paradise',
    description: 'Relax on beautiful beaches, rice terraces, and cultural temples.'
  },
  {
    id: 'turkey-adventure',
    name: 'Turkey Adventure',
    destination: 'Turkey',
    category: ['international', 'adventure'],
    duration: 10,
    price: 72000,
    rating: 4.8,
    groupSize: '4-20',
    difficulty: 'moderate',
    bestTime: 'spring',
    amenities: ['accommodation', 'meals', 'transport'],
    image: '/Turkey-1.jpg',
    route: '/packages/turkey-adventure',
    description: 'Delve into Turkish culture with historic sites, bazaars, and seaside towns.'
  }
];

const filterConfig = {
  categories: [
    { id: 'domestic', label: 'Domestic', icon: MapPin, color: 'bg-green-100 text-green-800' },
    { id: 'international', label: 'International', icon: Compass, color: 'bg-blue-100 text-blue-800' },
    { id: 'premium', label: 'Premium', icon: Award, color: 'bg-purple-100 text-purple-800' },
    { id: 'adventure', label: 'Adventure', icon: Mountain, color: 'bg-accent/10 text-accent' },
    { id: 'honeymoon', label: 'Honeymoon', icon: Heart, color: 'bg-pink-100 text-pink-800' },
    { id: 'spiritual', label: 'Spiritual', icon: Sparkles, color: 'bg-yellow-100 text-yellow-800' }
  ],
  destinations: [
    // Indian States & Regions
    'Uttarakhand', 'Himachal Pradesh', 'Jammu & Kashmir', 'Ladakh',
    'Rajasthan', 'Goa', 'Kerala', 'Andaman & Nicobar', 'Sikkim',
    'Meghalaya', 'Assam', 'West Bengal', 'Tamil Nadu', 'Karnataka',
    'Maharashtra', 'Gujarat', 'Delhi',
    // International
    'Dubai', 'Singapore', 'Thailand', 'Bali', 'Malaysia',
    'Maldives', 'Mauritius', 'Seychelles', 'Vietnam', 'Georgia', 'Turkey'
  ],
  groupSizes: ['1-2', '2-5', '5-10', '10-15', '15-25', '25+'],
  difficulties: [
    { id: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { id: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'challenging', label: 'Challenging', color: 'bg-red-100 text-red-800' }
  ],
  bestTimes: [
    { id: 'winter', label: 'Winter (Dec-Feb)', color: 'bg-blue-100 text-blue-800' },
    { id: 'summer', label: 'Summer (Mar-Jun)', color: 'bg-accent/10 text-accent' },
    { id: 'monsoon', label: 'Monsoon (Jul-Sep)', color: 'bg-green-100 text-green-800' },
    { id: 'autumn', label: 'Autumn (Oct-Nov)', color: 'bg-yellow-100 text-yellow-800' }
  ],
  amenities: [
    { id: 'accommodation', label: 'Accommodation', icon: Building },
    { id: 'meals', label: 'Meals Included', icon: Users },
    { id: 'transport', label: 'Transportation', icon: MapPin },
    { id: 'guide', label: 'Tour Guide', icon: Users },
    { id: 'activities', label: 'Activities', icon: Mountain },
    { id: 'helicopter', label: 'Helicopter Service', icon: Compass }
  ]
};

interface AdvancedFilteringProps {
  packages?: any[];
}

export const AdvancedFiltering: React.FC<AdvancedFilteringProps> = ({ packages }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    priceRange: { min: 0, max: 300000 },
    duration: { min: 1, max: 30 },
    categories: [],
    destinations: [],
    groupSize: [],
    rating: 0,
    difficulty: [],
    bestTime: [],
    amenities: []
  });

  const packagesList = React.useMemo(() => {
    if (packages && packages.length > 0) {
      return packages.map(p => {
        const rawPrice = typeof p.price === 'number' ? p.price : Number((p.price || '0').toString().replace(/[^0-9]/g, ''));
        
        let rawDuration = 1;
        if (p.duration) {
          const matches = p.duration.toString().match(/(\d+)\s*Day/i);
          if (matches) {
            rawDuration = parseInt(matches[1]);
          } else {
            const matchesNights = p.duration.toString().match(/(\d+)\s*Night/i);
            if (matchesNights) {
              rawDuration = parseInt(matchesNights[1]) + 1;
            } else {
              rawDuration = parseInt(p.duration) || 1;
            }
          }
        }
        
        let destination = 'India';
        if (p.destinations && Array.isArray(p.destinations) && p.destinations.length > 0) {
          destination = p.destinations[0];
        } else if (p.destination) {
          destination = p.destination;
        } else {
          if (p.name.toLowerCase().includes('singapore')) destination = 'Singapore';
          else if (p.name.toLowerCase().includes('europe') || p.name.toLowerCase().includes('switzerland') || p.name.toLowerCase().includes('france') || p.name.toLowerCase().includes('italy')) destination = 'Europe';
          else if (p.name.toLowerCase().includes('rann') || p.name.toLowerCase().includes('kutch')) destination = 'Gujarat';
          else if (p.name.toLowerCase().includes('dham') || p.name.toLowerCase().includes('kedar') || p.name.toLowerCase().includes('badri') || p.name.toLowerCase().includes('gangotri') || p.name.toLowerCase().includes('yamunotri')) destination = 'Uttarakhand';
        }

        const category = Array.isArray(p.category) ? p.category : [p.package_type || 'domestic'];
        const highlights = Array.isArray(p.highlights) ? p.highlights : [];

        return {
          id: p.id,
          name: p.name,
          destination: destination,
          category: category,
          duration: rawDuration,
          price: rawPrice,
          rating: p.rating || 4.8,
          groupSize: p.group_size || '2-15',
          difficulty: (p.difficulty || 'easy').toLowerCase(),
          bestTime: (p.best_time || 'summer').toLowerCase(),
          amenities: Array.isArray(p.inclusions) ? p.inclusions.map((i: string) => i.toLowerCase()) : ['accommodation', 'meals', 'transport'],
          image: p.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80',
          description: p.notes || p.seo_description || (highlights.length > 0 ? highlights.join(', ') : 'Customizable travel package.'),
          route: p.route || `/packages/${p.slug || p.id}`
        };
      });
    }
    return samplePackages;
  }, [packages]);

  const [filteredPackages, setFilteredPackages] = useState<Package[]>(packagesList);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    setFilteredPackages(packagesList);
  }, [packagesList]);

  useEffect(() => {
    const filtered = packagesList.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           pkg.destination.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesPrice = pkg.price >= filters.priceRange.min && pkg.price <= filters.priceRange.max;
      const matchesDuration = pkg.duration >= filters.duration.min && pkg.duration <= filters.duration.max;
      const matchesCategory = filters.categories.length === 0 || filters.categories.some(category => pkg.category.includes(category));
      const matchesDestination = filters.destinations.length === 0 || filters.destinations.includes(pkg.destination);
      const matchesRating = pkg.rating >= filters.rating;
      const matchesDifficulty = filters.difficulty.length === 0 || filters.difficulty.includes(pkg.difficulty);
      const matchesBestTime = filters.bestTime.length === 0 || filters.bestTime.includes(pkg.bestTime);
      const matchesAmenities = filters.amenities.length === 0 || 
                              filters.amenities.every(amenity => pkg.amenities.includes(amenity));

      return matchesSearch && matchesPrice && matchesDuration && matchesCategory && 
             matchesDestination && matchesRating && matchesDifficulty && matchesBestTime && matchesAmenities;
    });

    setFilteredPackages(filtered);

    // Count active filters
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 200000) count++;
    if (filters.duration.min > 1 || filters.duration.max < 30) count++;
    if (filters.categories.length > 0) count++;
    if (filters.destinations.length > 0) count++;
    if (filters.groupSize.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.difficulty.length > 0) count++;
    if (filters.bestTime.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  const handleArrayFilter = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prev => {
      const currentArray = prev[filterType] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return { ...prev, [filterType]: newArray };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      priceRange: { min: 0, max: 200000 },
      duration: { min: 1, max: 30 },
      categories: [],
      destinations: [],
      groupSize: [],
      rating: 0,
      difficulty: [],
      bestTime: [],
      amenities: []
    });
  };

  const removeFilter = (filterType: keyof FilterOptions, value?: string) => {
    if (value && Array.isArray(filters[filterType])) {
      handleArrayFilter(filterType, value);
    } else {
      switch (filterType) {
        case 'searchTerm':
          setFilters(prev => ({ ...prev, searchTerm: '' }));
          break;
        case 'priceRange':
          setFilters(prev => ({ ...prev, priceRange: { min: 0, max: 200000 } }));
          break;
        case 'duration':
          setFilters(prev => ({ ...prev, duration: { min: 1, max: 30 } }));
          break;
        case 'rating':
          setFilters(prev => ({ ...prev, rating: 0 }));
          break;
      }
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Advanced Package Filters</h2>
            <p className="text-purple-100">Find your perfect travel experience</p>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-3 hover:bg-white/30 transition-all duration-200"
          >
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search destinations, packages..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Active Filters ({activeFiltersCount})
            </span>
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.searchTerm && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Search: {filters.searchTerm}
                <button onClick={() => removeFilter('searchTerm')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.priceRange.min > 0 || filters.priceRange.max < 200000) && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Price: ₹{filters.priceRange.min.toLocaleString()} - ₹{filters.priceRange.max.toLocaleString()}
                <button onClick={() => removeFilter('priceRange')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.categories.map(category => (
              <span key={category} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {filterConfig.categories.find(c => c.id === category)?.label}
                <button onClick={() => removeFilter('categories', category)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.destinations.map(destination => (
              <span key={destination} className="inline-flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                {destination}
                <button onClick={() => removeFilter('destinations', destination)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <IndianRupee className="inline w-4 h-4 mr-1" />
                Price Range
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 200000 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={filters.priceRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: parseInt(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Clock className="inline w-4 h-4 mr-1" />
                Duration (Days)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.duration.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      duration: { ...prev.duration, min: parseInt(e.target.value) || 1 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.duration.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      duration: { ...prev.duration, max: parseInt(e.target.value) || 30 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Star className="inline w-4 h-4 mr-1" />
                Minimum Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFilters(prev => ({ ...prev, rating }))}
                    className={`p-1 ${filters.rating >= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Categories</label>
              <div className="space-y-2">
                {filterConfig.categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleArrayFilter('categories', category.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        filters.categories.includes(category.id)
                          ? category.color
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destinations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Destinations</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filterConfig.destinations.map(destination => (
                  <button
                    key={destination}
                    onClick={() => handleArrayFilter('destinations', destination)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      filters.destinations.includes(destination)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {destination}
                  </button>
                ))}
              </div>
            </div>

            {/* Best Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar className="inline w-4 h-4 mr-1" />
                Best Time to Visit
              </label>
              <div className="space-y-2">
                {filterConfig.bestTimes.map(time => (
                  <button
                    key={time.id}
                    onClick={() => handleArrayFilter('bestTime', time.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      filters.bestTime.includes(time.id)
                        ? time.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Found {filteredPackages.length} packages
          </h3>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            {activeFiltersCount > 0 && (
              <span className="bg-white text-purple-600 px-2 py-1 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map(pkg => (
            <div key={pkg.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-56">
                <OptimizedImage
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute left-4 bottom-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-yellow-500" />
                    {pkg.rating}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {pkg.category.map(cat => (
                    <span key={cat} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {cat}
                    </span>
                  ))}
                </div>
                <h4 className="font-semibold text-gray-900 text-xl mb-2">{pkg.name}</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{pkg.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {pkg.duration} days
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {pkg.destination}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-slate-900">₹{pkg.price.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">per person starting</div>
                  </div>
                  <a
                    href={pkg.route}
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No packages found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters to see more results</p>
            <button
              onClick={clearAllFilters}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFiltering;