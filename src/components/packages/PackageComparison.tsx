import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, MapPin, Calendar, Users, Plane, Hotel, Utensils, Camera, Heart, Share2 } from 'lucide-react';

interface PackageFeature {
  name: string;
  included: boolean;
  premium?: boolean;
}

interface ComparisonPackage {
  id: string;
  name: string;
  destination: string;
  duration: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviews: number;
  image: string;
  type: 'domestic' | 'international';
  highlights: string[];
  features: PackageFeature[];
  bestFor: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  groupSize: string;
  bestTime: string;
  popular?: boolean;
  recommended?: boolean;
}

interface PackageComparisonProps {
  packages: ComparisonPackage[];
  onSelectPackage?: (packageId: string) => void;
  onBookNow?: (packageId: string) => void;
}

const PackageComparison: React.FC<PackageComparisonProps> = ({ 
  packages, 
  onSelectPackage, 
  onBookNow 
}) => {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'comparison'>('grid');

  const togglePackageSelection = (packageId: string) => {
    setSelectedPackages(prev => {
      if (prev.includes(packageId)) {
        return prev.filter(id => id !== packageId);
      } else if (prev.length < 3) {
        return [...prev, packageId];
      }
      return prev;
    });
  };

  const toggleFavorite = (packageId: string) => {
    setFavorites(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const sharePackage = async (pkg: ComparisonPackage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pkg.name,
          text: `Check out this amazing ${pkg.type} package to ${pkg.destination}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'international' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const renderPackageCard = (pkg: ComparisonPackage) => (
    <Card key={pkg.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl group ${
      selectedPackages.includes(pkg.id) ? 'ring-2 ring-accent shadow-lg' : ''
    } ${
      pkg.recommended ? 'border-accent/40 bg-gradient-to-br from-accent/5 to-secondary/5' : ''
    }`}>
      {/* Popular/Recommended Badge */}
      {(pkg.popular || pkg.recommended) && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className={`${
            pkg.recommended 
              ? 'bg-gradient-to-r bg-gradient-warm text-white text-white' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          } font-bold shadow-lg`}>
            {pkg.recommended ? '🏆 Recommended' : '🔥 Popular'}
          </Badge>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-white/50 hover:bg-white"
          onClick={() => toggleFavorite(pkg.id)}
        >
          <Heart className={`w-4 h-4 ${
            favorites.includes(pkg.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
          }`} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-white/50 hover:bg-white"
          onClick={() => sharePackage(pkg)}
        >
          <Share2 className="w-4 h-4 text-gray-600" />
        </Button>
      </div>

      {/* Package Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={pkg.image} 
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Price Overlay */}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{pkg.price}</span>
            {pkg.originalPrice && (
              <span className="text-sm line-through opacity-75">{pkg.originalPrice}</span>
            )}
          </div>
          <p className="text-xs opacity-90">per person</p>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-800 mb-2">{pkg.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{pkg.destination}</span>
              <Badge className={getDifficultyColor(pkg.difficulty)}>
                {pkg.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{pkg.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{pkg.groupSize}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor(pkg.rating) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
          <span className="text-sm font-semibold">{pkg.rating}</span>
          <span className="text-xs text-gray-500">({pkg.reviews} reviews)</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Package Type */}
        <div className="mb-3">
          <Badge className={getTypeColor(pkg.type)}>
            {pkg.type === 'international' ? '🌍 International' : '🏠 Domestic'}
          </Badge>
        </div>

        {/* Highlights */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Highlights:</h4>
          <div className="space-y-1">
            {pkg.highlights.slice(0, 3).map((highlight, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span>{highlight}</span>
              </div>
            ))}
            {pkg.highlights.length > 3 && (
              <p className="text-xs text-gray-500">+{pkg.highlights.length - 3} more highlights</p>
            )}
          </div>
        </div>

        {/* Best For */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Best for:</h4>
          <div className="flex flex-wrap gap-1">
            {pkg.bestFor.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full bg-gradient-to-r bg-gradient-warm text-white hover:opacity-90 text-white font-semibold"
            onClick={() => onBookNow?.(pkg.id)}
          >
            Book Now
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onSelectPackage?.(pkg.id)}
            >
              View Details
            </Button>
            <Button 
              variant={selectedPackages.includes(pkg.id) ? "default" : "outline"}
              size="sm"
              onClick={() => togglePackageSelection(pkg.id)}
              disabled={!selectedPackages.includes(pkg.id) && selectedPackages.length >= 3}
            >
              {selectedPackages.includes(pkg.id) ? 'Selected' : 'Compare'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderComparisonView = () => {
    const comparePackages = packages.filter(pkg => selectedPackages.includes(pkg.id));
    
    if (comparePackages.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Camera className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No packages selected for comparison</h3>
            <p className="text-gray-500 mt-2">Select up to 3 packages to compare their features</p>
          </div>
          <Button onClick={() => setViewMode('grid')} variant="outline">
            Back to Packages
          </Button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-4 border-b font-semibold">Features</th>
              {comparePackages.map(pkg => (
                <th key={pkg.id} className="text-center p-4 border-b min-w-[250px]">
                  <div className="space-y-2">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-32 object-cover rounded-lg" />
                    <h3 className="font-bold">{pkg.name}</h3>
                    <p className="text-2xl font-bold text-accent">{pkg.price}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 border-b font-semibold">Duration</td>
              {comparePackages.map(pkg => (
                <td key={pkg.id} className="text-center p-4 border-b">{pkg.duration}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b font-semibold">Difficulty</td>
              {comparePackages.map(pkg => (
                <td key={pkg.id} className="text-center p-4 border-b">
                  <Badge className={getDifficultyColor(pkg.difficulty)}>{pkg.difficulty}</Badge>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b font-semibold">Group Size</td>
              {comparePackages.map(pkg => (
                <td key={pkg.id} className="text-center p-4 border-b">{pkg.groupSize}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b font-semibold">Best Time</td>
              {comparePackages.map(pkg => (
                <td key={pkg.id} className="text-center p-4 border-b">{pkg.bestTime}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border-b font-semibold">Rating</td>
              {comparePackages.map(pkg => (
                <td key={pkg.id} className="text-center p-4 border-b">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{pkg.rating}</span>
                  </div>
                </td>
              ))}
            </tr>
            {/* Features comparison */}
            {comparePackages[0]?.features.map((feature, index) => (
              <tr key={index}>
                <td className="p-4 border-b font-semibold">{feature.name}</td>
                {comparePackages.map(pkg => {
                  const pkgFeature = pkg.features.find(f => f.name === feature.name);
                  return (
                    <td key={pkg.id} className="text-center p-4 border-b">
                      {pkgFeature?.included ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="p-4 border-b"></td>
              {comparePackages.map(pkg => (
                <td key={pkg.id} className="text-center p-4 border-b">
                  <Button 
                    className="w-full bg-gradient-to-r bg-gradient-warm text-white hover:opacity-90 text-white"
                    onClick={() => onBookNow?.(pkg.id)}
                  >
                    Book Now
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Compare Packages</h2>
          <p className="text-gray-600">Find the perfect travel package for your next adventure</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedPackages.length > 0 && (
            <Badge variant="outline" className="bg-accent/5 text-accent border-accent/30">
              {selectedPackages.length} selected for comparison
            </Badge>
          )}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              Grid View
            </Button>
            <Button
              variant={viewMode === 'comparison' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('comparison')}
              className="rounded-none"
              disabled={selectedPackages.length === 0}
            >
              Compare ({selectedPackages.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(renderPackageCard)}
        </div>
      ) : (
        renderComparisonView()
      )}

      {/* Comparison Help */}
      {viewMode === 'grid' && selectedPackages.length > 0 && (
        <div className="bg-accent/5 border border-accent/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-full">
              <Camera className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-accent">
                {selectedPackages.length} package{selectedPackages.length > 1 ? 's' : ''} selected
              </h3>
              <p className="text-sm text-accent">
                {selectedPackages.length < 3 
                  ? `Select ${3 - selectedPackages.length} more package${3 - selectedPackages.length > 1 ? 's' : ''} to compare features side by side`
                  : 'Click "Compare" to view detailed comparison'
                }
              </p>
            </div>
            {selectedPackages.length >= 2 && (
              <Button 
                onClick={() => setViewMode('comparison')}
                className="ml-auto bg-accent hover:bg-accent/90"
              >
                Compare Now
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageComparison;