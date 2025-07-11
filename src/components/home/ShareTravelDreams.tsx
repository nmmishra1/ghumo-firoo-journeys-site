import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Send, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ShareTravelDreams = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    budget: '',
    travelDates: '',
    groupSize: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create lead in database
      const { error: leadError } = await supabase
        .from('leads')
        .insert([{
          customer_name: formData.name,
          email: formData.email,
          contact_number: formData.phone,
          tour_description: `Destination: ${formData.destination}\nBudget: ${formData.budget}\nTravel Dates: ${formData.travelDates}\nGroup Size: ${formData.groupSize}\nMessage: ${formData.message}`,
          customer_type: 'Website Enquiry',
          travel_interest: formData.destination,
          user_id: '00000000-0000-0000-0000-000000000000', // Default user for website enquiries
          created_by: '00000000-0000-0000-0000-000000000000'
        }]);

      if (leadError) throw leadError;

      // Send notification email
      const { error: emailError } = await supabase.functions.invoke('send-travel-enquiry', {
        body: {
          customerData: formData,
          type: 'travel_dreams'
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't throw here, as the lead was created successfully
      }

      toast({
        title: "Thank you for your enquiry!",
        description: "We'll get back to you within 24 hours with a customized travel plan.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        destination: '',
        budget: '',
        travelDates: '',
        groupSize: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Heart className="h-8 w-8 text-pink-500 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Share Your Travel Dreams
            </h2>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Tell us about your dream destination and we'll create a personalized itinerary just for you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Plan Your Dream Trip</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dream Destination
                    </label>
                    <Select onValueChange={(value) => handleInputChange('destination', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="char-dham">Char Dham Yatra</SelectItem>
                        <SelectItem value="leh-ladakh">Leh Ladakh</SelectItem>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                        <SelectItem value="kerala">Kerala</SelectItem>
                        <SelectItem value="goa">Goa</SelectItem>
                        <SelectItem value="turkey">Turkey</SelectItem>
                        <SelectItem value="dubai">Dubai</SelectItem>
                        <SelectItem value="thailand">Thailand</SelectItem>
                        <SelectItem value="singapore">Singapore</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <Select onValueChange={(value) => handleInputChange('budget', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-25k">Under ₹25,000</SelectItem>
                        <SelectItem value="25k-50k">₹25,000 - ₹50,000</SelectItem>
                        <SelectItem value="50k-1l">₹50,000 - ₹1,00,000</SelectItem>
                        <SelectItem value="1l-2l">₹1,00,000 - ₹2,00,000</SelectItem>
                        <SelectItem value="above-2l">Above ₹2,00,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Travel Dates
                    </label>
                    <Input
                      type="text"
                      value={formData.travelDates}
                      onChange={(e) => handleInputChange('travelDates', e.target.value)}
                      placeholder="e.g., March 2025"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Size
                    </label>
                    <Select onValueChange={(value) => handleInputChange('groupSize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Number of travelers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Solo Travel</SelectItem>
                        <SelectItem value="2">2 People</SelectItem>
                        <SelectItem value="3-4">3-4 People</SelectItem>
                        <SelectItem value="5-8">5-8 People</SelectItem>
                        <SelectItem value="9+">9+ People</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Requirements
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your preferences, special requirements, or any specific experiences you're looking for..."
                    className="w-full h-24"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Share My Dream Trip
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Why Choose Us */}
          <div className="space-y-8">
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Why Share Your Dreams With Us?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">Personalized itineraries crafted by travel experts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">Best prices guaranteed with no hidden costs</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">24/7 support throughout your journey</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">Free consultation and trip planning</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">Trusted by 1000+ happy travelers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Need Immediate Assistance?
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="tel:+919910987264" className="flex items-center justify-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Call +91 9910987264
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="mailto:booking@ghumofiroo.com" className="flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Us
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full bg-green-500 text-white hover:bg-green-600" asChild>
                    <a href="https://wa.me/919910987264" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp Chat
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShareTravelDreams;