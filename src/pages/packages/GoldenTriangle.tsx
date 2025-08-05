import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Calendar, Star, CheckCircle, XCircle, Users, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

const GoldenTriangle = () => {
  const highlights = [
    "Taj Mahal at sunrise",
    "Red Fort and India Gate",
    "Amber Fort elephant ride",
    "Hawa Mahal photography",
    "Agra Fort exploration",
    "Local heritage walks"
  ];

  const inclusions = [
    "Accommodation in 4-star hotels",
    "Daily breakfast and dinner",
    "Private air-conditioned vehicle",
    "Professional English-speaking guide",
    "Entry fees to all monuments",
    "Elephant ride at Amber Fort",
    "Airport transfers",
    "All taxes and service charges"
  ];

  const exclusions = [
    "International/domestic flights",
    "Lunch and beverages",
    "Personal expenses",
    "Tips and gratuities",
    "Travel insurance",
    "Optional activities"
  ];

  const itinerary = [
    { day: 1, title: "Arrival in Delhi", description: "Airport pickup, check-in hotel, evening India Gate visit" },
    { day: 2, title: "Delhi Full Day", description: "Red Fort, Jama Masjid, Chandni Chowk, Lotus Temple" },
    { day: 3, title: "Delhi to Agra", description: "Drive to Agra, check-in hotel, sunset at Taj Mahal" },
    { day: 4, title: "Agra Sightseeing", description: "Sunrise Taj Mahal, Agra Fort, Mehtab Bagh" },
    { day: 5, title: "Agra to Jaipur", description: "Drive to Jaipur via Fatehpur Sikri, evening at leisure" },
    { day: 6, title: "Jaipur Full Day", description: "Amber Fort, City Palace, Hawa Mahal, Jantar Mantar" },
    { day: 7, title: "Jaipur to Delhi", description: "Morning shopping, drive to Delhi, departure transfer" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative h-[60vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&h=600&fit=crop')"
        }}
      >
        <div className="text-center text-white px-4 max-w-4xl">
          <Badge className="mb-4 bg-orange-500">Popular Package</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Golden Triangle Tour</h1>
          <p className="text-xl md:text-2xl mb-6">6-Day Golden Triangle Tour - Delhi, Agra & Jaipur with Taj Mahal</p>
          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              7 Days / 6 Nights
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              2-15 People
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Cultural Heritage
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
                  Discover India's most iconic destinations with our Golden Triangle tour covering Delhi, Agra, and Jaipur. 
                  This carefully crafted 7-day journey takes you through India's rich history, magnificent architecture, 
                  and vibrant culture. Experience the magic of the Taj Mahal, explore royal palaces, and walk through 
                  bustling bazaars in this perfect introduction to India.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">Starting from ₹18,000</div>
                  <p className="text-sm text-gray-600">Per person on twin sharing</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="font-medium">7 Days / 6 Nights</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Group Size:</span>
                    <span className="font-medium">2-15 People</span>
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

export default GoldenTriangle;