import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Calendar, Star, CheckCircle, XCircle, Users, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

const RajasthanRoyal = () => {
  const highlights = [
    "Palace hotels stay",
    "Camel safari in Thar Desert",
    "Rajasthani cultural shows",
    "Heritage fort visits",
    "Traditional craft workshops",
    "Royal dining experiences"
  ];

  const inclusions = [
    "Accommodation in heritage hotels",
    "All meals (breakfast, lunch, dinner)",
    "Private air-conditioned vehicle",
    "Professional tour guide",
    "Entry fees to monuments",
    "Camel safari in Jaisalmer",
    "Cultural shows and performances",
    "Airport transfers"
  ];

  const exclusions = [
    "International/domestic flights",
    "Personal expenses",
    "Tips and gratuities",
    "Travel insurance",
    "Optional activities",
    "Drinks and beverages"
  ];

  const itinerary = [
    { day: 1, title: "Arrival in Jaipur", description: "Check into heritage hotel, evening city orientation tour" },
    { day: 2, title: "Jaipur Sightseeing", description: "Amber Fort, City Palace, Hawa Mahal, local markets" },
    { day: 3, title: "Jaipur to Pushkar", description: "Drive to Pushkar, visit Brahma Temple and holy lake" },
    { day: 4, title: "Pushkar to Jodhpur", description: "Travel to Jodhpur, evening visit to Mehrangarh Fort" },
    { day: 5, title: "Jodhpur to Jaisalmer", description: "Drive to golden city, check into desert camp" },
    { day: 6, title: "Jaisalmer Exploration", description: "Fort visit, camel safari, cultural evening" },
    { day: 7, title: "Jaisalmer to Udaipur", description: "Travel to City of Lakes, evening boat ride" },
    { day: 8, title: "Udaipur Sightseeing", description: "City Palace, Jagdish Temple, Saheliyon ki Bari" },
    { day: 9, title: "Udaipur to Delhi", description: "Flight to Delhi, evening shopping at Connaught Place" },
    { day: 10, title: "Delhi Sightseeing", description: "Red Fort, India Gate, Lotus Temple" },
    { day: 11, title: "Delhi to Agra", description: "Visit Taj Mahal at sunrise, Agra Fort" },
    { day: 12, title: "Departure", description: "Transfer to airport for onward journey" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative h-[60vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1920&h=600&fit=crop')"
        }}
      >
        <div className="text-center text-white px-4 max-w-4xl">
          <Badge className="mb-4 bg-orange-500">Premium Package</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Royal Rajasthan Tour</h1>
          <p className="text-xl md:text-2xl mb-6">12-Day Royal Rajasthan Tour with Palace Hotels & Desert Safari</p>
          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              12 Days / 11 Nights
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              2-25 People
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Heritage Experience
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Package Overview */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Package Overview</h2>
                <p className="text-gray-600 mb-6">
                  Experience the grandeur of Royal Rajasthan with our carefully crafted 12-day journey through 
                  the land of kings. Stay in magnificent palace hotels, explore ancient forts, enjoy camel safaris 
                  in the Thar Desert, and witness the rich cultural heritage of this royal state.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Itinerary */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Detailed Itinerary</h2>
                <div className="space-y-4">
                  {itinerary.map((day, index) => (
                    <div key={index} className="border-l-4 border-orange-500 pl-4 pb-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-orange-500 mr-2" />
                        <h3 className="font-semibold">Day {day.day}: {day.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{day.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-green-600">Inclusions</h3>
                  <ul className="space-y-2">
                    {inclusions.map((item, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-red-600">Exclusions</h3>
                  <ul className="space-y-2">
                    {exclusions.map((item, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Map Section */}
            <Card>
              <CardHeader>
                <CardTitle>Tour Route Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m52!1m12!1m3!1d1813394.1580658383!2d73.94707373437496!3d26.789472439062458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m37!3e0!4m5!1s0x390cfd5b347eb62d%3A0x37205b715389640!2sDelhi!3m2!1d28.7040592!2d77.10249019999999!4m5!1s0x396db2dce5b4d1e5%3A0x6adb0cc26025f8da!2sJaipur%2C%20Rajasthan!3m2!1d26.9124336!2d75.7872709!4m5!1s0x396a59c0ce3a3cb5%3A0x57b85c5ea6aa7b5!2sJodhpur%2C%20Rajasthan!3m2!1d26.2389!2d73.0243!4m5!1s0x396c1b9b7c7c7c7c%3A0x7c7c7c7c7c7c7c7c!2sUdaipur%2C%20Rajasthan!3m2!1d24.5854!2d73.7125!4m5!1s0x396db2dce5b4d1e5%3A0x6adb0cc26025f8da!2sJaipur%2C%20Rajasthan!3m2!1d26.9124336!2d75.7872709!4m5!1s0x390cfd5b347eb62d%3A0x37205b715389640!2sDelhi!3m2!1d28.7040592!2d77.10249019999999!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Rajasthan Royal Tour Route Map"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Distance</span>
                    <span className="text-orange-600">~1,400 KM</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Route Highlights</span>
                    <span className="text-sm">Delhi → Jaipur → Jodhpur → Udaipur → Back</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">Starting from ₹30,000</div>
                  <p className="text-sm text-gray-600">Per person on twin sharing</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="font-medium">12 Days / 11 Nights</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Group Size:</span>
                    <span className="font-medium">2-25 People</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Best Time:</span>
                    <span className="font-medium">Oct - Mar</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                    <Link to="/enquire-now">Book Now</Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download Brochure
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Need Help?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Plane className="w-4 h-4 mr-2 text-orange-500" />
                    <span>Expert Travel Assistance</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    <span>Local Guides Included</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2 text-orange-500" />
                    <span>24/7 Support Available</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RajasthanRoyal;