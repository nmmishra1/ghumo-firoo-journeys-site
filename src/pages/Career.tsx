
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const Career = () => {
  const openings = [
    {
      title: "Travel Consultant",
      department: "Sales",
      location: "Mumbai",
      type: "Full-time",
      description: "Help customers plan their dream vacations with expert advice and personalized service."
    },
    {
      title: "Tour Operations Manager",
      department: "Operations",
      location: "Delhi",
      type: "Full-time",
      description: "Oversee tour operations, coordinate with vendors, and ensure smooth travel experiences."
    },
    {
      title: "Digital Marketing Specialist",
      department: "Marketing",
      location: "Bangalore",
      type: "Full-time",
      description: "Drive online presence and customer acquisition through digital marketing strategies."
    },
    {
      title: "Customer Service Executive",
      department: "Support",
      location: "Remote",
      type: "Full-time",
      description: "Provide exceptional customer support and resolve travel-related queries."
    }
  ];

  const benefits = [
    "Competitive salary and performance bonuses",
    "Travel allowances and discounted holiday packages",
    "Health insurance and medical benefits",
    "Professional development and training opportunities",
    "Flexible working arrangements",
    "Friendly and collaborative work environment"
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative h-[50vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop')"
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl">Be part of creating unforgettable travel experiences</p>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Work Culture</h2>
              <p className="text-lg text-gray-600 mb-6">
                At Ghumo Firoo Travels, we believe that passionate people create exceptional experiences. 
                Our team is our greatest asset, and we foster a culture of collaboration, innovation, 
                and continuous learning.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We encourage creativity, celebrate diversity, and provide opportunities for personal 
                and professional growth. Join us in our mission to make travel accessible and 
                memorable for everyone.
              </p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop" 
                alt="Team collaboration"
                className="rounded-lg shadow-lg w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Current Openings</h2>
            <p className="text-lg text-gray-600">Join our growing team and shape the future of travel</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {openings.map((job, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{job.description}</p>
                <Button asChild className="w-full">
                  <Link to="/contact">Apply Now</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Work With Us?</h2>
            <p className="text-lg text-gray-600">We offer more than just a job - we offer a career and lifestyle</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey With Us?</h2>
          <p className="text-xl mb-8">
            Even if you don't see a perfect match above, we're always interested in meeting 
            talented individuals who share our passion for travel.
          </p>
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
            <Link to="/contact">Send Your Resume</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Career;
