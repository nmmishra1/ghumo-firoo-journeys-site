import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Star, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

const LehLadakhTour = () => {
  const packageDetails = {
    title: "7-Day Leh Ladakh Adventure with Pangong Lake & Nubra Valley",
    duration: "7 Days / 6 Nights",
    price: "Starting from ₹28,000",
    rating: 4.9,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
    highlights: [
      "Pangong Lake visit",
      "Nubra Valley exploration",
      "Double hump camel ride",
      "Khardung La Pass",
      "Monasteries tour",
      "Local culture experience"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Leh",
        description: "Arrive at Leh airport. Transfer to hotel for acclimatization. Rest day to adjust to high altitude. Evening visit to Leh market."
      },
      {
        day: 2,
        title: "Leh Local Sightseeing",
        description: "Visit Thiksey Monastery, Shey Palace, Hemis Monastery. Evening at Shanti Stupa for sunset views."
      },
      {
        day: 3,
        title: "Leh to Nubra Valley",
        description: "Drive to Nubra Valley via Khardung La Pass (18,380 ft). Check-in at camp in Hunder. Evening camel safari."
      },
      {
        day: 4,
        title: "Nubra Valley to Pangong",
        description: "Drive to Pangong Lake via Shyok River route. Check-in at lakeside camp. Enjoy the pristine blue waters."
      },
      {
        day: 5,
        title: "Pangong to Leh",
        description: "Early morning at Pangong Lake. Drive back to Leh via Chang La Pass. Evening free for shopping."
      },
      {
        day: 6,
        title: "Leh Exploration",
        description: "Visit Alchi Monastery, Magnetic Hill, Gurudwara Pathar Sahib. Evening cultural program."
      },
      {
        day: 7,
        title: "Departure",
        description: "Transfer to Leh airport for onward journey. End of memorable Ladakh adventure."
      }
    ],
    inclusions: [
      "Airport transfers",
      "Accommodation in hotels/camps",
      "All meals included",
      "Sightseeing as per itinerary",
      "Inner line permits",
      "Experienced driver guide",
      "Oxygen cylinder support"
    ],
    exclusions: [
      "Airfare to/from Leh",
      "Personal expenses",
      "Travel insurance",
      "Adventure activities",
      "Tips and porterage",
      "Emergency evacuation"
    ]
  };

  return (
    <Layout>
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
                Adventure Tour
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
                <div className="h-96 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m40!1m12!1m3!1d3238775.2676966786!2d75.46707356641684!3d33.85749244799251!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m25!3e0!4m5!1s0x390cfd5b347eb62d%3A0x37205b715389640!2sDelhi!3m2!1d28.7040592!2d77.10249019999999!4m5!1s0x39877e8b0b0b0b0b%3A0xb0b0b0b0b0b0b0b0!2sManali%2C%20Himachal%20Pradesh!3m2!1d32.2396!2d77.1887!4m5!1s0x38fdf9d4d4d4d4d4%3A0xd4d4d4d4d4d4d4d4!2sLeh%2C%20Ladakh!3m2!1d34.1526!2d77.5771!4m5!1s0x38fe1e1e1e1e1e1e%3A0x1e1e1e1e1e1e1e1e!2sPangong%20Lake%2C%20Ladakh!3m2!1d33.7692!2d78.9419!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Leh Ladakh Tour Route Map"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Distance</span>
                    <span className="text-orange-600">~1,200 KM</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Route Highlights</span>
                    <span className="text-sm">Delhi → Manali → Leh → Pangong → Back</span>
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
                    Free cancellation up to 48 hours before departure
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
                  <span className="text-muted-foreground">Altitude:</span>
                  <span className="font-medium">11,000 - 18,380 ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best Time:</span>
                  <span className="font-medium">June - September</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-medium">Moderate to High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age Limit:</span>
                  <span className="font-medium">12 - 65 years</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LehLadakhTour;