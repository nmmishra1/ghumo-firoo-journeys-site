import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown, Star, Clock, Users, MapPin, Check, X, Filter, Search } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  destination: string;
  duration: number;
  groupSize: string;
  rating: number;
  reviews: number;
  originalPrice: number;
  currentPrice: number;
  discount: number;
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  category: 'domestic' | 'international' | 'adventure' | 'heritage' | 'spiritual';
  difficulty: 'easy' | 'moderate' | 'challenging';
  bestTime: string;
  image: string;
}

const packages: Package[] = [
  {
    id: 'rann-utsav',
    name: 'Rann Utsav Gujarat',
    destination: 'Gujarat, India',
    duration: 4,
    groupSize: '2-15',
    rating: 4.8,
    reviews: 245,
    originalPrice: 19999,
    currentPrice: 15999,
    discount: 20,
    inclusions: ['Accommodation', 'Meals', 'Transportation', 'Guide', 'Entry Tickets'],
    exclusions: ['Personal Expenses', 'Tips', 'Insurance'],
    highlights: ['White Desert', 'Cultural Festival', 'Handicrafts', 'Folk Dance'],
    category: 'heritage',
    difficulty: 'easy',
    bestTime: 'Nov-Feb',
    image: '/Rann-Utsav-Gujarat.png'
  },
  {
    id: 'char-dham',
    name: 'Char Dham Yatra',
    destination: 'Uttarakhand, India',
    duration: 12,
    groupSize: '4-20',
    rating: 4.9,
    reviews: 189,
    originalPrice: 42999,
    currentPrice: 35999,
    discount: 16,
    inclusions: ['Accommodation', 'Meals', 'Transportation', 'Guide', 'Helicopter Service'],
    exclusions: ['Personal Expenses', 'Tips', 'Medical'],
    highlights: ['Sacred Temples', 'Spiritual Journey', 'Mountain Views', 'Holy Rivers'],
    category: 'spiritual',
    difficulty: 'moderate',
    bestTime: 'May-Oct',
    image: '/chardham-by-helicopter.jpg'
  },
  {
    id: 'kashmir',
    name: 'Kashmir Paradise',
    destination: 'Kashmir, India',
    duration: 7,
    groupSize: '2-12',
    rating: 4.7,
    reviews: 312,
    originalPrice: 34999,
    currentPrice: 28999,
    discount: 17,
    inclusions: ['Accommodation', 'Meals', 'Transportation', 'Shikara Ride', 'Sightseeing'],
    exclusions: ['Personal Expenses', 'Adventure Activities', 'Shopping'],
    highlights: ['Dal Lake', 'Houseboats', 'Gulmarg', 'Pahalgam'],
    category: 'adventure',
    difficulty: 'easy',
    bestTime: 'Mar-Oct',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'rajasthan',
    name: 'Royal Rajasthan',
    destination: 'Rajasthan, India',
    duration: 8,
    groupSize: '2-16',
    rating: 4.6,
    reviews: 278,
    originalPrice: 27999,
    currentPrice: 22999,
    discount: 18,
    inclusions: ['Accommodation', 'Meals', 'Transportation', 'Guide', 'Desert Safari'],
    exclusions: ['Personal Expenses', 'Tips', 'Camel Ride'],
    highlights: ['Palaces', 'Forts', 'Desert Safari', 'Cultural Shows'],
    category: 'heritage',
    difficulty: 'easy',
    bestTime: 'Oct-Mar',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'europe',
    name: 'Europe Grand Tour',
    destination: 'Europe',
    duration: 14,
    groupSize: '6-25',
    rating: 4.9,
    reviews: 156,
    originalPrice: 149999,
    currentPrice: 125999,
    discount: 16,
    inclusions: ['Accommodation', 'Breakfast', 'Transportation', 'Guide', 'City Tours'],
    exclusions: ['Lunch & Dinner', 'Personal Expenses', 'Visa Fees'],
    highlights: ['Historic Cities', 'Art Museums', 'Cuisine', 'Architecture'],
    category: 'international',
    difficulty: 'moderate',
    bestTime: 'Apr-Oct',
    image: '/Europe%20Image.png'
  },
  {
    id: 'himachal',
    name: 'Himachal Adventure',
    destination: 'Himachal Pradesh, India',
    duration: 6,
    groupSize: '4-12',
    rating: 4.5,
    reviews: 198,
    originalPrice: 24999,
    currentPrice: 19999,
    discount: 20,
    inclusions: ['Accommodation', 'Meals', 'Transportation', 'Trekking Guide', 'Equipment'],
    exclusions: ['Personal Expenses', 'Insurance', 'Medical'],
    highlights: ['Trekking', 'Mountain Views', 'Adventure Sports', 'Local Culture'],
    category: 'adventure',
    difficulty: 'challenging',
    bestTime: 'Mar-Jun',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'georgia-adventure',
    name: 'Georgia Adventure',
    destination: 'Georgia',
    duration: 7,
    groupSize: '2-12',
    rating: 4.9,
    reviews: 156,
    originalPrice: 85000,
    currentPrice: 72000,
    discount: 15,
    inclusions: ['Accommodation', 'Breakfast', 'Transportation', 'Guide', 'Wine Tasting', '4x4 Trip'],
    exclusions: ['International Airfare', 'Personal Expenses', 'Visa Fees'],
    highlights: ['Caucasus Mountains', 'Tbilisi Old Town', 'Wine Regions', 'Gergeti Church'],
    category: 'international',
    difficulty: 'moderate',
    bestTime: 'May-Oct',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  }
];

type SortField = 'name' | 'duration' | 'currentPrice' | 'rating' | 'discount';
type SortDirection = 'asc' | 'desc';

export const PriceComparison: React.FC = () => {
  const [sortField, setSortField] = useState<SortField>('currentPrice');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const navigate = useNavigate();

  const handleBookNow = (pkg: Package) => {
    navigate('/booking', {
      state: {
        packageData: {
          id: pkg.id,
          title: pkg.name,
          price: pkg.currentPrice,
          duration: `${pkg.duration} Days`,
          image: pkg.image,
          description: pkg.inclusions.join(', '),
          highlights: pkg.highlights
        }
      }
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedPackages = useMemo(() => {
    let filtered = packages.filter(pkg => {
      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
      const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.destination.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = pkg.currentPrice >= priceRange.min && pkg.currentPrice <= priceRange.max;
      
      return matchesCategory && matchesSearch && matchesPrice;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [sortField, sortDirection, selectedCategory, searchTerm, priceRange]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'domestic', label: 'Domestic' },
    { key: 'international', label: 'International' },
    { key: 'adventure', label: 'Adventure' },
    { key: 'heritage', label: 'Heritage' },
    { key: 'spiritual', label: 'Spiritual' }
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Compare Tour Packages</h2>
        <p className="text-green-100">Find the best deals and compare features</p>
      </div>

      {/* Filters */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Price:</span>
            <input
              type="range"
              min="0"
              max="200000"
              step="5000"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm font-medium">₹{priceRange.max.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600"
                >
                  Package {getSortIcon('name')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('duration')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600"
                >
                  Duration {getSortIcon('duration')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('rating')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600"
                >
                  Rating {getSortIcon('rating')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('currentPrice')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600"
                >
                  Price {getSortIcon('currentPrice')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('discount')}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600"
                >
                  Savings {getSortIcon('discount')}
                </button>
              </th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPackages.map((pkg, index) => (
              <tr key={pkg.id} className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyNEgzNlYzMkgyOFYyNFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTMwIDI2SDM0VjMwSDMwVjI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {pkg.destination}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {pkg.groupSize} people
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{pkg.duration} days</span>
                  </div>
                  <div className="text-sm text-gray-600">{pkg.bestTime}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{pkg.rating}</span>
                  </div>
                  <div className="text-sm text-gray-600">({pkg.reviews} reviews)</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-green-600">₹{pkg.currentPrice.toLocaleString()}</div>
                    {pkg.discount > 0 && (
                      <div className="text-sm text-gray-500 line-through">₹{pkg.originalPrice.toLocaleString()}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {pkg.discount > 0 && (
                    <div className="space-y-1">
                      <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        {pkg.discount}% OFF
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Save ₹{(pkg.originalPrice - pkg.currentPrice).toLocaleString()}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleBookNow(pkg)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Book Now
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Package Details Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedPackage.name}</h3>
                <button
                  onClick={() => setSelectedPackage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <img
                src={selectedPackage.image}
                alt={selectedPackage.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxODBIMTc1VjEyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTE5MiAxNDBIMjA4VjE2MEgxOTJWMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Inclusions</h4>
                  <ul className="space-y-1">
                    {selectedPackage.inclusions.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Exclusions</h4>
                  <ul className="space-y-1">
                    {selectedPackage.exclusions.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <X className="w-4 h-4 text-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPackage.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">₹{selectedPackage.currentPrice.toLocaleString()}</div>
                  {selectedPackage.discount > 0 && (
                    <div className="text-sm text-gray-500 line-through">₹{selectedPackage.originalPrice.toLocaleString()}</div>
                  )}
                </div>
                <button 
                  onClick={() => handleBookNow(selectedPackage)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Book This Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
        Showing {filteredAndSortedPackages.length} of {packages.length} packages
      </div>
    </div>
  );
};

export default PriceComparison;