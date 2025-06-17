
import React from 'react';
import Layout from '@/components/Layout';

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative h-[50vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=1920&h=600&fit=crop')"
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">About Ghumo Firoo Travels</h1>
          <p className="text-xl">Your trusted travel partner since many years</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                Ghumo Firoo Travels was founded with a simple yet powerful vision: to make travel 
                accessible, memorable, and transformative for everyone. With years of experience 
                in the travel industry, we have established ourselves as a trusted name in both 
                domestic and international tourism.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our team of passionate travel experts works tirelessly to curate unique experiences 
                that go beyond ordinary sightseeing. We believe that every journey should be a 
                story worth telling, filled with discoveries, connections, and unforgettable moments.
              </p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&h=400&fit=crop" 
                alt="Travel destination"
                className="rounded-lg shadow-lg w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To provide exceptional travel experiences that create lasting memories while 
                ensuring the highest standards of service, safety, and customer satisfaction.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To become the leading travel agency known for innovation, reliability, and 
                creating transformative travel experiences that connect people with the world.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
              <p className="text-gray-600">
                Integrity, customer-centricity, innovation, and sustainability guide everything 
                we do. We are committed to responsible tourism and supporting local communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Years of Excellence</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our experience spans across multiple destinations and travel styles, from spiritual 
              journeys like Char Dham Yatra to international adventures in Turkey, Dubai, and beyond.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Destinations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Expert Team</h2>
            <p className="text-lg text-gray-600">
              Meet the passionate professionals behind your perfect travel experience
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our dedicated team of travel experts, local guides, and customer service professionals 
              work together to ensure every aspect of your journey exceeds expectations. With deep 
              knowledge of destinations worldwide and a commitment to personalized service, we're 
              here to make your travel dreams come true.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
