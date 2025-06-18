
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const CustomTourPackages = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    travelDates: '',
    destinations: '',
    passengers: '',
    preferences: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create WhatsApp message
      const whatsappMessage = `Hi Team Ghumo Firoo, I want to plan a custom trip. Here are my details:
Name: ${formData.fullName}
Email: ${formData.email}
Mobile: ${formData.mobile}
Destination: ${formData.destinations}
Dates: ${formData.travelDates}
Passengers: ${formData.passengers}
Preferences: ${formData.preferences}`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/919910987264?text=${encodedMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // Show success message
      toast({
        title: "Request Submitted Successfully!",
        description: "Your custom trip request has been sent. We'll contact you shortly to discuss your requirements.",
      });

      // Reset form
      setFormData({
        fullName: '',
        mobile: '',
        email: '',
        travelDates: '',
        destinations: '',
        passengers: '',
        preferences: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative h-[50vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=600&fit=crop')"
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Plan My Custom Trip</h1>
          <p className="text-xl">Tell us your dream destination and we'll craft the perfect journey</p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Share Your Travel Dreams</h2>
            <p className="text-lg text-gray-600">
              Fill out the form below and our travel experts will create a personalized itinerary just for you
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mobile">Mobile Number (WhatsApp) *</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter your WhatsApp number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email ID *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="travelDates">Travel Dates *</Label>
                  <Input
                    id="travelDates"
                    name="travelDates"
                    type="text"
                    required
                    value={formData.travelDates}
                    onChange={handleInputChange}
                    placeholder="e.g., 15-25 March 2024"
                  />
                </div>
                
                <div>
                  <Label htmlFor="passengers">Number of Passengers *</Label>
                  <Input
                    id="passengers"
                    name="passengers"
                    type="number"
                    required
                    min="1"
                    value={formData.passengers}
                    onChange={handleInputChange}
                    placeholder="Number of travelers"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="destinations">Destination(s) *</Label>
                <Input
                  id="destinations"
                  name="destinations"
                  type="text"
                  required
                  value={formData.destinations}
                  onChange={handleInputChange}
                  placeholder="Where would you like to go?"
                />
              </div>

              <div>
                <Label htmlFor="preferences">Preferences (Hotels, Activities, etc.)</Label>
                <Textarea
                  id="preferences"
                  name="preferences"
                  value={formData.preferences}
                  onChange={handleInputChange}
                  placeholder="Tell us about your preferences for accommodation, activities, budget range, special requirements, etc."
                  rows={4}
                />
              </div>

              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600 px-8"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit My Request'}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What Happens Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <div className="font-medium text-orange-600">Step 1</div>
                  <p>We receive your request and review your requirements</p>
                </div>
                <div>
                  <div className="font-medium text-orange-600">Step 2</div>
                  <p>Our experts create a personalized itinerary for you</p>
                </div>
                <div>
                  <div className="font-medium text-orange-600">Step 3</div>
                  <p>We contact you within 24 hours with your custom package</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CustomTourPackages;
