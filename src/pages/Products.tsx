
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const Products = () => {
  const domesticPackages = [
    {
      title: "Char Dham Yatra",
      description: "Sacred pilgrimage to Yamunotri, Gangotri, Kedarnath, and Badrinath",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop",
      duration: "10 Days",
      price: "Starting from ₹25,000",
      highlights: ["Helicopter services available", "Comfortable accommodation", "Experienced guides"]
    },
    {
      title: "Golden Triangle",
      description: "Delhi, Agra, and Jaipur - India's most iconic destinations",
      image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop",
      duration: "7 Days",
      price: "Starting from ₹18,000",
      highlights: ["Taj Mahal visit", "Heritage hotels", "Cultural experiences"]
    },
    {
      title: "Kashmir Paradise",
      description: "Experience the beauty of the 'Heaven on Earth'",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      duration: "8 Days",
      price: "Starting from ₹22,000",
      highlights: ["Houseboat stay", "Shikara rides", "Gulmarg skiing"]
    },
    {
      title: "Rajasthan Royal",
      description: "Explore the royal heritage of Rajasthan",
      image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&h=300&fit=crop",
      duration: "12 Days",
      price: "Starting from ₹30,000",
      highlights: ["Palace hotels", "Desert safari", "Cultural shows"]
    }
  ];

  const internationalPackages = [
    {
      title: "Turkey Adventure",
      description: "Explore Istanbul, Cappadocia, and the Turkish Riviera",
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop",
      duration: "9 Days",
      price: "Starting from ₹75,000",
      highlights: ["Hot air balloon rides", "Historic sites", "Turkish cuisine"]
    },
    {
      title: "Dubai Delights",
      description: "Luxury, shopping, and desert adventures in the UAE",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
      duration: "6 Days",
      price: "Starting from ₹45,000",
      highlights: ["Burj Khalifa", "Desert safari", "Shopping festivals"]
    },
    {
      title: "Thailand Tropical",
      description: "Beautiful beaches, temples, and vibrant culture",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop",
      duration: "8 Days",
      price: "Starting from ₹35,000",
      highlights: ["Island hopping", "Thai massage", "Street food tours"]
    },
    {
      title: "Singapore Malaysia",
      description: "Modern cities, diverse cultures, and amazing food",
      image: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=300&fit=crop",
      duration: "7 Days",
      price: "Starting from ₹40,000",
      highlights: ["Marina Bay Sands", "Genting Highlands", "Food courts"]
    }
  ];

  const PackageCard = ({ pkg }: { pkg: any }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <img 
        src={pkg.image} 
        alt={pkg.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{pkg.title}</h3>
          <span className="text-sm text-blue-600 font-medium">{pkg.duration}</span>
        </div>
        <p className="text-gray-600 mb-4">{pkg.description}</p>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Highlights:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {pkg.highlights.map((highlight: string, index: number) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-orange-600">{pkg.price}</span>
          <Button asChild>
            <Link to="/contact">Enquire Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative h-[50vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=600&fit=crop')"
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Our Tour Packages</h1>
          <p className="text-xl">Discover amazing destinations with our carefully crafted itineraries</p>
        </div>
      </section>

      {/* Domestic Packages */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Domestic Tour Packages</h2>
            <p className="text-lg text-gray-600">Explore the incredible diversity of India</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {domesticPackages.map((pkg, index) => (
              <PackageCard key={index} pkg={pkg} />
            ))}
          </div>
        </div>
      </section>

      {/* International Packages */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">International Tour Packages</h2>
            <p className="text-lg text-gray-600">Discover the world beyond borders</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {internationalPackages.map((pkg, index) => (
              <PackageCard key={index} pkg={pkg} />
            ))}
          </div>
        </div>
      </section>

      {/* Custom Packages */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Custom Tour Packages</h2>
          <p className="text-lg text-gray-600 mb-8">
            Don't see what you're looking for? We create personalized itineraries tailored to your 
            preferences, budget, and travel style. From honeymoon packages to adventure tours, 
            we can craft the perfect journey just for you.
          </p>
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
            <Link to="/products/custom-tour-packages">Plan My Custom Trip</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
