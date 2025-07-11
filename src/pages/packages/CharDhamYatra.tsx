import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Star, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

const CharDhamYatra = () => {
  const packageDetails = {
    title: "9-Day Char Dham Yatra from Delhi with Hotel, Meals & Transfers",
    duration: "10 Days / 9 Nights",
    price: "Starting from ₹25,000",
    rating: 4.8,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=600&fit=crop",
    highlights: [
      "Helicopter services available",
      "Comfortable accommodation",
      "Experienced guides",
      "All meals included",
      "AC transportation",
      "Temple VIP darshan"
    ],
    itinerary: [
      {
        day: 1,
        title: "Delhi to Haridwar",
        description: "Departure from Delhi, reach Haridwar. Check-in hotel. Evening Ganga Aarti at Har Ki Pauri."
      },
      {
        day: 2,
        title: "Haridwar to Barkot via Mussoorie",
        description: "Early morning drive to Barkot via Mussoorie. Check-in hotel. Rest and acclimatization."
      },
      {
        day: 3,
        title: "Barkot to Yamunotri and back",
        description: "Early morning drive to Janki Chatti. Trek to Yamunotri Temple. Darshan and return to Barkot."
      },
      {
        day: 4,
        title: "Barkot to Uttarkashi",
        description: "Drive to Uttarkashi. Check-in hotel. Visit Vishwanath Temple. Overnight stay."
      },
      {
        day: 5,
        title: "Uttarkashi to Gangotri and back",
        description: "Early morning drive to Gangotri. Darshan at Gangotri Temple. Return to Uttarkashi."
      },
      {
        day: 6,
        title: "Uttarkashi to Guptkashi",
        description: "Drive to Guptkashi via Tehri. Check-in hotel. Visit local temples. Overnight stay."
      },
      {
        day: 7,
        title: "Guptkashi to Kedarnath",
        description: "Early morning drive to Gaurikund. Trek/helicopter to Kedarnath. Darshan and overnight stay."
      },
      {
        day: 8,
        title: "Kedarnath to Badrinath",
        description: "Return to Gaurikund and drive to Badrinath via Chopta. Check-in hotel near Badrinath."
      },
      {
        day: 9,
        title: "Badrinath Darshan",
        description: "Early morning darshan at Badrinath Temple. Visit Mana Village. Drive to Rudraprayag."
      },
      {
        day: 10,
        title: "Return to Delhi",
        description: "Morning drive back to Delhi via Rishikesh. Drop at Delhi airport/railway station."
      }
    ],
    inclusions: [
      "Accommodation in 3-star hotels",
      "All meals (breakfast, lunch, dinner)",
      "AC transportation throughout",
      "Experienced driver and guide",
      "All toll taxes and parking",
      "VIP darshan arrangements",
      "First aid kit and oxygen cylinder"
    ],
    exclusions: [
      "Helicopter charges (optional)",
      "Personal expenses",
      "Travel insurance",
      "Tips to driver and guide",
      "Any adventure activities",
      "Laundry and phone calls"
    ]
  };

  return (
    <Layout>
      {/* SEO Meta Tags are handled in index.html */}
      
      {/* Hero Section */}
      <section 
        className="relative h-[60vh] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${packageDetails.image}')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{packageDetails.title}</h1>
            <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                {packageDetails.duration}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Users className="w-4 h-4 mr-2" />
                Group Tours Available
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Star className="w-4 h-4 mr-2" />
                {packageDetails.rating} ({packageDetails.reviews} reviews)
              </Badge>
            </div>
            <p className="text-2xl font-bold text-orange-300">{packageDetails.price}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Package Highlights */}
            <Card>
              <CardHeader>
                <CardTitle>Package Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packageDetails.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Itinerary */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Itinerary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {packageDetails.itinerary.map((day, index) => (
                    <div key={index} className="border-l-4 border-orange-500 pl-4">
                      <h3 className="font-semibold text-lg">Day {day.day}: {day.title}</h3>
                      <p className="text-muted-foreground mt-2">{day.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Inclusions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {packageDetails.inclusions.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Exclusions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {packageDetails.exclusions.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <span className="text-sm">{item}</span>
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
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Interactive route map will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Book This Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{packageDetails.price}</p>
                  <p className="text-sm text-muted-foreground">Per person (minimum 2 people)</p>
                </div>
                
                <Link to="/enquire-now" className="block">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    Enquire Now
                  </Button>
                </Link>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    <a href="tel:+919910987264">Call +91 9910987264</a>
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href="mailto:booking@ghumofiroo.com">Email Enquiry</a>
                  </Button>
                </div>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Free cancellation up to 24 hours before departure
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Facts */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{packageDetails.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Group Size:</span>
                  <span className="font-medium">Max 15 people</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best Time:</span>
                  <span className="font-medium">May - October</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-medium">Moderate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age Limit:</span>
                  <span className="font-medium">8 - 70 years</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CharDhamYatra;