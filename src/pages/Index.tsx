
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const Index = () => {
  const featuredPackages = [
    {
      title: "Char Dham Yatra",
      description: "Experience the spiritual journey to the four sacred temples",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop",
      price: "Starting from ₹25,000",
    },
    {
      title: "Turkey Adventure",
      description: "Explore the magical landscapes of Cappadocia and Istanbul",
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop",
      price: "Starting from ₹75,000",
    },
    {
      title: "Dubai Delights",
      description: "Luxury shopping, stunning architecture, and desert adventures",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
      price: "Starting from ₹45,000",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative h-[80vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop')"
        }}
      >
        <div className="text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Your Journey Begins Here
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Discover amazing destinations with Ghumo Firoo Travels. 
            Professional tour packages for unforgettable experiences.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link to="/products">Explore Packages</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Tour Packages</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular destinations crafted for memorable experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPackages.map((pkg, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={pkg.image} 
                  alt={pkg.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.title}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-orange-600">{pkg.price}</span>
                    <Button asChild>
                      <Link to="/enquire-now">Enquire Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/products">View All Packages</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Ghumo Firoo Travels?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Experience</h3>
              <p className="text-gray-600">Years of experience in creating memorable travel experiences</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with no hidden costs</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support for your peace of mind</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-xl mb-8">
            Contact us today to plan your perfect trip with personalized itineraries
          </p>
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
            <Link to="/contact">Get Started</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
