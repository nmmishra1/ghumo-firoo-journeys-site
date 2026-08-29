import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePackagePrice } from '@/hooks/usePackagePrice';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Check, 
  X, 
  Info,
  Clock,
  Users,
  Utensils,
  Plane,
  Camera,
  Mountain,
  Globe,
  ShieldCheck
} from 'lucide-react';
import ModernPackageHero from '@/components/packages/ModernPackageHero';
import PackageSidebar from '@/components/packages/PackageSidebar';
import EnhancedRouteMap from '@/components/packages/EnhancedRouteMap';
import { buildTouristTripJsonLd } from '@/components/seo/JsonLd';
import DetailedItinerary from '@/components/packages/DetailedItinerary';
import FAQSection from '@/components/sections/FAQSection';
import PackageSEO from '@/components/seo/PackageSEO';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Types for our tour packages
type TourType = 'grand' | 'highlights' | 'swiss-croatia';

interface TourData {
  id: string;
  title: string;
  shortTitle: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  destinations: string[];
  highlights: string[];
  itinerary: Array<{ day: number; title: string; description: string; activities?: string[] }>;
  inclusions: string[];
  exclusions: string[];
  description: string;
  metaDescription: string;
  groupSize: string;
  bestTime: string;
  difficulty: string;
  transport: string;
  accommodation: string;
  meals: string;
  virtualTourData?: {
    destination: string;
    tourStops: Array<{
      id: string;
      title: string;
      description: string;
      image: string;
      videoUrl?: string;
      duration: string;
      highlights: string[];
      coordinates?: { lat: number; lng: number };
      bestTime?: string;
      tips?: string[] | string;
    }>;
  };
}

const EuropeTour: React.FC = () => {
  const location = useLocation();
  const [selectedTour, setSelectedTour] = useState<TourType>('grand');

  const priceGrand = Number(usePackagePrice('europe-tour', 225000).toString().replace(/[^0-9]/g, ''));
  const priceHighlights = Number(usePackagePrice('europe-highlights', 185000).toString().replace(/[^0-9]/g, ''));
  const priceSwissCroatia = Number(usePackagePrice('europe-swiss-croatia', 135000).toString().replace(/[^0-9]/g, ''));

  // Initialize selection based on URL path
  useEffect(() => {
    if (location.pathname.includes('swiss-croatia')) {
      setSelectedTour('swiss-croatia');
    } else if (location.pathname.includes('highlights')) {
      setSelectedTour('highlights');
    } else {
      setSelectedTour('grand');
    }
  }, [location.pathname]);

  // Data for each tour package
  const tours: Record<TourType, TourData> = {
    grand: {
      id: 'europe-grand-tour',
      title: '15-Day Grand Europe Tour: Paris, Rome, Switzerland, Amsterdam & London',
      shortTitle: 'Grand Europe (15 Days)',
      duration: '15 Days / 14 Nights',
      price: priceGrand,
      rating: 4.9,
      reviews: 156,
      images: [
        '/Europe Image New.png',
        '/Europe Image Neww.png',
        '/Europe image.jpeg',
        '/Europe Image.png',
        '/Europe image1.jpg'
      ],
      destinations: ['Paris', 'Rome', 'Switzerland', 'Amsterdam', 'London'],
      highlights: [
        "Eiffel Tower & Seine River Cruise in Paris",
        "Colosseum & Vatican City in Rome",
        "Swiss Alps & Jungfraujoch Experience",
        "Amsterdam Canal Cruise & Keukenhof Gardens",
        "London Eye & Buckingham Palace"
      ],
      itinerary: [
        { 
          day: 1, 
          title: 'Arrival in Paris', 
          description: 'Welcome to the City of Light. Private transfer to your hotel. Evening Seine River Cruise to see the illuminated monuments.',
          activities: [
            "Arrival at Charles de Gaulle Airport",
            "Private transfer to hotel",
            "Check-in and freshen up",
            "Evening Seine River Cruise",
            "View illuminated Eiffel Tower and monuments",
            "Dinner at a local French bistro"
          ]
        },
        { 
          day: 2, 
          title: 'Paris City Tour', 
          description: 'Skip-the-line access to Eiffel Tower (Summit), Louvre Museum guided tour, and Champs-Élysées walking tour.',
          activities: [
            "Breakfast at hotel",
            "Visit Eiffel Tower (Summit access)",
            "Guided tour of Louvre Museum",
            "See the Mona Lisa",
            "Walk along Champs-Élysées",
            "Photo stop at Arc de Triomphe",
            "Evening at leisure in Montmartre"
          ]
        },
        { 
          day: 3, 
          title: 'Paris to Switzerland', 
          description: 'High-speed TGV train to Switzerland. Check-in at Interlaken hotel with views of the Alps.',
          activities: [
            "Breakfast and hotel check-out",
            "Transfer to Gare de Lyon station",
            "TGV Lyria train to Basel/Interlaken",
            "Scenic train journey through French countryside",
            "Arrival in Interlaken",
            "Check-in at hotel with Alps view",
            "Evening walk in Interlaken town"
          ]
        },
        { 
          day: 4, 
          title: 'Jungfraujoch Excursion', 
          description: 'Day trip to the Top of Europe. Cogwheel train ride, Ice Palace, and Sphinx Observatory.',
          activities: [
            "Morning travel to Grindelwald Terminal",
            "Eiger Express gondola ride",
            "Cogwheel train to Jungfraujoch",
            "Visit Ice Palace and Sphinx Observatory",
            "Snow fun park activities",
            "Lunch with panoramic views",
            "Return via Lauterbrunnen Valley"
          ]
        },
        { 
          day: 5, 
          title: 'Lucerne & Mt. Titlis', 
          description: 'Visit Lucerne (Chapel Bridge) and cable car ride to Mount Titlis with its rotating gondola.',
          activities: [
            "Train to Engelberg",
            "Rotair revolving cable car to Mt. Titlis",
            "Cliff Walk suspension bridge",
            "Ice Flyer chairlift",
            "Glacier Cave exploration",
            "Afternoon visit to Lucerne City",
            "Walk on Chapel Bridge (Kapellbrücke)",
            "Lion Monument visit"
          ]
        },
        { 
          day: 6, 
          title: 'Switzerland to Rome', 
          description: 'Scenic train journey and flight to Rome. Welcome dinner with authentic Italian pizza and pasta.',
          activities: [
            "Breakfast and check-out",
            "Train to Zurich Airport",
            "Flight to Rome",
            "Arrival and transfer to hotel",
            "Check-in at Rome hotel",
            "Evening welcome dinner",
            "Authentic Italian pizza and pasta experience"
          ]
        },
        { 
          day: 7, 
          title: 'Ancient Rome', 
          description: 'Guided tour of the Colosseum, Roman Forum, and Palatine Hill. Evening at Trevi Fountain.',
          activities: [
            "Skip-the-line entry to Colosseum",
            "Guided tour of Roman Forum",
            "Visit Palatine Hill",
            "Lunch at a traditional Trattoria",
            "Evening walking tour",
            "Spanish Steps and Pantheon",
            "Coin toss at Trevi Fountain"
          ]
        },
        { 
          day: 8, 
          title: 'Vatican City', 
          description: 'Visit St. Peter’s Basilica, Vatican Museums, and the Sistine Chapel. Free afternoon for shopping.',
          activities: [
            "Early morning visit to Vatican City",
            "Tour of Vatican Museums",
            "Admire the Sistine Chapel ceiling",
            "Visit St. Peter’s Basilica",
            "Free afternoon for shopping/leisure",
            "Explore Via del Corso",
            "Dinner and overnight in Rome"
          ]
        },
        { 
          day: 9, 
          title: 'Rome to Amsterdam', 
          description: 'Flight to Amsterdam. Evening canal cruise with cheese and wine tasting.',
          activities: [
            "Transfer to Rome Fiumicino Airport",
            "Flight to Amsterdam",
            "Arrival and hotel transfer",
            "Check-in at Amsterdam hotel",
            "Evening Canal Cruise",
            "Cheese and wine tasting on board",
            "Walk through Dam Square"
          ]
        },
        { 
          day: 10, 
          title: 'Dutch Countryside', 
          description: 'Visit Zaanse Schans windmills, Volendam fishing village, and a cheese farm.',
          activities: [
            "Excursion to Zaanse Schans",
            "See working windmills and clog making",
            "Visit a traditional cheese farm",
            "Tasting of Gouda and Edam cheese",
            "Visit Volendam fishing village",
            "Free time for souvenir shopping",
            "Return to Amsterdam"
          ]
        },
        { 
          day: 11, 
          title: 'Amsterdam to London', 
          description: 'Eurostar train to London. Check-in and evening visit to Covent Garden.',
          activities: [
            "Transfer to Amsterdam Centraal",
            "Eurostar train to London St. Pancras",
            "Arrival in London and transfer",
            "Hotel check-in",
            "Evening visit to Covent Garden",
            "Street performers and market stalls",
            "Dinner at a local pub"
          ]
        },
        { 
          day: 12, 
          title: 'London Royal Tour', 
          description: 'Changing of the Guard at Buckingham Palace, Westminster Abbey, and Big Ben.',
          activities: [
            "Witness Changing of the Guard",
            "Photo stop at Buckingham Palace",
            "Visit Westminster Abbey",
            "See Big Ben and Houses of Parliament",
            "Walk across Westminster Bridge",
            "Picnic lunch at St. James's Park",
            "Evening at leisure"
          ]
        },
        { 
          day: 13, 
          title: 'London Eye & Tower', 
          description: 'Ride the London Eye and visit the Tower of London to see the Crown Jewels.',
          activities: [
            "Ride on the London Eye",
            "Panoramic views of London",
            "Thames River Cruise to Tower Pier",
            "Visit Tower of London",
            "See the Crown Jewels and White Tower",
            "Walk across Tower Bridge",
            "Farewell dinner"
          ]
        },
        { 
          day: 14, 
          title: 'Shopping & Leisure', 
          description: 'Free day for shopping at Oxford Street or Harrods. Farewell dinner.',
          activities: [
            "Breakfast at hotel",
            "Full day at leisure for shopping",
            "Visit Oxford Street/Regent Street",
            "Optional visit to Harrods",
            "Optional visit to British Museum",
            "Final packing",
            "Relaxed evening"
          ]
        },
        { 
          day: 15, 
          title: 'Departure', 
          description: 'Private transfer to Heathrow Airport for your flight back home.',
          activities: [
            "Breakfast and hotel check-out",
            "Private transfer to Heathrow Airport",
            "Check-in for return flight",
            "Duty-free shopping",
            "Flight back home",
            "Tour concludes"
          ]
        }
      ],
      inclusions: [
        'Premium 4-star hotels with breakfast',
        'All intercity transfers (Flights/Trains)',
        'Sightseeing as per itinerary',
        'Professional English-speaking guide',
        'Schengen & UK Visa assistance'
      ],
      exclusions: [
        'International flights from India',
        'Lunch and Dinner (unless specified)',
        'Personal expenses and tips',
        'City taxes (to be paid at hotel)',
        'Travel Insurance'
      ],
      description: "The ultimate 15-day European adventure covering 5 iconic countries. Perfect for first-time visitors wanting a comprehensive experience of Western Europe's highlights.",
      metaDescription: "15-Day Grand Europe Tour Package 2026. Visit Paris, Rome, Switzerland, Amsterdam & London. Premium hotels, visa assistance & Indian meals included.",
      groupSize: "10-20 People",
      bestTime: "April to October",
      difficulty: "Easy to Moderate",
      transport: "Flights & High-Speed Trains",
      accommodation: "4-Star Premium Hotels",
      meals: "Daily Breakfast + 4 Dinners",
      virtualTourData: {
        destination: "Europe Grand Highlights Tour",
        tourStops: [
          {
            id: "1",
            title: "Swiss Alps Scenic Journey",
            description: "Embark on an unforgettable panoramic journey through the heart of the Swiss Alps, witnessing majestic snow-capped peaks and serene valleys.",
            image: "/Europe Image New.png",
            videoUrl: "https://www.youtube.com/shorts/1LkkxGZomPU",
            duration: "3-4 hours",
            highlights: ["Panoramic train ride", "Snow-capped peaks", "Scenic valleys", "Stunning alpine vistas"],
            bestTime: "Morning (9:00 AM - 12:00 PM)",
            tips: ["Keep your camera ready", "Sit on the left side of the train for best views"]
          },
          {
            id: "2",
            title: "Paris - Eiffel Tower & Seine Cruise",
            description: "Experience the romance of Paris with a visit to the Eiffel Tower followed by a scenic cruise along the Seine River.",
            image: "/Europe Image Neww.png",
            duration: "2-3 hours",
            highlights: ["Eiffel Tower views", "Seine river cruise", "Historic bridges"],
            bestTime: "Evening for illumination",
            tips: ["Book skip-the-line tickets in advance"]
          }
        ]
      }
    },
    highlights: {
      id: 'europe-highlights',
      title: '12-Day Europe Highlights: Paris, Swiss Alps, Venice & Prague',
      shortTitle: 'Highlights (12 Days)',
      duration: '12 Days / 11 Nights',
      price: priceHighlights,
      rating: 4.8,
      reviews: 112,
      images: [
       '/Europe Image New.png',
        '/Europe Image Neww.png',
        '/Europe Imagee.png',
        '/Europe Image.png',
        '/Europe image1.jpg'
      ],
      destinations: ['Paris', 'Interlaken', 'Venice', 'Florence', 'Prague'],
      highlights: [
        'Paris: Eiffel Tower, Louvre Museum, Seine Cruise',
        'Switzerland: Jungfraujoch, Lauterbrunnen Valley',
        'Italy: Venice Gondola Ride, Florence Duomo',
        'Czech Republic: Old Town, Charles Bridge',
        'High-speed trains and curated local guides'
      ],
      itinerary: [
        { 
          day: 1, 
          title: 'Arrive Paris', 
          description: 'Airport pickup, hotel check-in, evening Seine river cruise.',
          activities: [
            "Arrival at Paris Airport",
            "Private transfer to hotel",
            "Check-in and relaxation",
            "Evening Seine River Cruise",
            "View of illuminated monuments",
            "Dinner at a local cafe"
          ]
        },
        { 
          day: 2, 
          title: 'Paris Highlights', 
          description: 'Eiffel Tower, Louvre (skip-the-line), Champs-Élysées, Montmartre.',
          activities: [
            "Visit Eiffel Tower (2nd Floor/Summit)",
            "Skip-the-line entry to Louvre Museum",
            "See the Mona Lisa and Venus de Milo",
            "Walk down Champs-Élysées",
            "Visit Arc de Triomphe",
            "Explore Montmartre artistic district",
            "View Sacré-Cœur Basilica"
          ]
        },
        { 
          day: 3, 
          title: 'Paris to Interlaken', 
          description: 'Scenic train via Bern. Evening stroll by Lake Thun.',
          activities: [
            "TGV train to Switzerland",
            "Transfer via Bern/Basel",
            "Arrival in Interlaken",
            "Check-in at hotel",
            "Evening stroll by Lake Thun",
            "Traditional Swiss Fondue dinner (optional)"
          ]
        },
        { 
          day: 4, 
          title: 'Jungfraujoch', 
          description: 'Cogwheel train to the Top of Europe. Ice Palace and Sphinx Observatory.',
          activities: [
            "Excursion to Jungfraujoch",
            "Cogwheel train ride through Eiger mountain",
            "Visit Sphinx Observation Deck",
            "Walk through the Ice Palace",
            "Lindt Swiss Chocolate Heaven",
            "Lunch at Bollywood Restaurant (optional)",
            "Return to Interlaken"
          ]
        },
        { 
          day: 5, 
          title: 'Interlaken to Venice', 
          description: 'Train to Venice. Gondola ride, St. Mark’s Square, Rialto Bridge.',
          activities: [
            "Train journey to Venice via Milan",
            "Arrival at Venice Santa Lucia",
            "Water taxi to hotel",
            "Classic Gondola Ride",
            "Visit St. Mark’s Square",
            "See Rialto Bridge",
            "Dinner by the canal"
          ]
        },
        { 
          day: 6, 
          title: 'Venice to Florence', 
          description: 'Uffizi Gallery, Duomo, Ponte Vecchio. Tuscan dinner.',
          activities: [
            "High-speed train to Florence",
            "Walking tour of Florence",
            "Visit Piazza del Duomo",
            "See Ponte Vecchio bridge",
            "Entry to Uffizi Gallery (optional)",
            "Traditional Tuscan dinner",
            "Overnight in Florence"
          ]
        },
        { 
          day: 7, 
          title: 'Florence to Prague', 
          description: 'Fly to Prague. Old Town Square and Astronomical Clock.',
          activities: [
            "Transfer to Florence Airport",
            "Flight to Prague",
            "Arrival and hotel transfer",
            "Evening walk in Old Town Square",
            "Watch the Astronomical Clock show",
            "Dinner at a Czech tavern"
          ]
        },
        { 
          day: 8, 
          title: 'Prague Walking Tour', 
          description: 'Charles Bridge, Prague Castle, Lesser Town.',
          activities: [
            "Guided walking tour of Prague",
            "Cross the iconic Charles Bridge",
            "Visit Prague Castle complex",
            "St. Vitus Cathedral",
            "Explore Lesser Town (Malá Strana)",
            "Free time in Wenceslas Square"
          ]
        },
        { 
          day: 9, 
          title: 'Day Trip Option', 
          description: 'Kutná Hora bone church or Český Krumlov. Leisure shopping.',
          activities: [
            "Full day at leisure OR Optional Day Trip",
            "Option 1: Kutná Hora & Bone Church",
            "Option 2: Český Krumlov (UNESCO site)",
            "Shopping for Bohemian Crystal",
            "Relax at a local cafe"
          ]
        },
        { 
          day: 10, 
          title: 'Prague Free Day', 
          description: 'Optional brewery tour and river cruise.',
          activities: [
            "Breakfast at hotel",
            "Free day for personal exploration",
            "Optional: Czech Beer Brewery Tour",
            "Optional: Vltava River Cruise",
            "Visit Jewish Quarter",
            "Last minute souvenir shopping"
          ]
        },
        { 
          day: 11, 
          title: 'Return Prep', 
          description: 'Leisure morning, souvenir shopping, farewell dinner.',
          activities: [
            "Leisurely breakfast",
            "Free time for shopping",
            "Pack bags for return",
            "Farewell dinner with group/companions",
            "Final evening in Europe"
          ]
        },
        { 
          day: 12, 
          title: 'Departure', 
          description: 'Airport transfer and flight back.',
          activities: [
            "Breakfast and check-out",
            "Transfer to Václav Havel Airport",
            "Flight check-in",
            "Departure flight",
            "Tour ends"
          ]
        }
      ],
      inclusions: [
        'Premium hotels with daily breakfast',
        'Airport transfers and intercity trains',
        'Skip-the-line museum entries',
        'English-speaking guided tours',
        'Visa assistance and travel insurance'
      ],
      exclusions: [
        'International flights',
        'Lunches and Dinners',
        'Personal expenses',
        'Optional tours',
        'City taxes'
      ],
      description: "Experience the best of Western and Central Europe with thoughtfully paced days, premium hotels, and seamless intercity connections. Ideal for first-timers and families.",
      metaDescription: "12-Day Europe Tour Package 2026. Paris, Swiss Alps, Venice & Prague. Includes premium hotels, breakfast, transfers, train tickets & guided tours.",
      groupSize: "12-20 People",
      bestTime: "April to October",
      difficulty: "Easy",
      transport: "Flights & Trains",
      accommodation: "4-Star Hotels",
      meals: "Daily Breakfast",
      virtualTourData: {
        destination: "Europe Highlights Tour",
        tourStops: [
          {
            id: "1",
            title: "Swiss Alps Scenic Journey",
            description: "Embark on an unforgettable panoramic journey through the heart of the Swiss Alps, witnessing majestic snow-capped peaks and serene valleys.",
            image: "/Europe Image New.png",
            videoUrl: "https://www.youtube.com/shorts/1LkkxGZomPU",
            duration: "3-4 hours",
            highlights: ["Panoramic train ride", "Snow-capped peaks", "Scenic valleys", "Stunning alpine vistas"],
            bestTime: "Morning (9:00 AM - 12:00 PM)",
            tips: ["Keep your camera ready", "Sit on the left side of the train for best views"]
          },
          {
            id: "2",
            title: "Paris - Eiffel Tower & Seine Cruise",
            description: "Experience the romance of Paris with a visit to the Eiffel Tower followed by a scenic cruise along the Seine River.",
            image: "/Europe Image Neww.png",
            duration: "2-3 hours",
            highlights: ["Eiffel Tower views", "Seine river cruise", "Historic bridges"],
            bestTime: "Evening for illumination",
            tips: ["Book skip-the-line tickets in advance"]
          }
        ]
      }
    },
    'swiss-croatia': {
      id: 'europe-swiss-croatia',
      title: '10-Day Switzerland & Croatia: Alpine Lakes to Adriatic Coast',
      shortTitle: 'Swiss & Croatia (10 Days)',
      duration: '10 Days / 9 Nights',
      price: priceSwissCroatia,
      rating: 4.8,
      reviews: 89,
      images: [
       '/Europe Image New.png',
        '/Europe Image Neww.png',
        '/Europe Imagee.png',
        '/Europe Image.png',
        '/Europe image1.jpg'
      ],
      destinations: ['Zurich', 'Lucerne', 'Interlaken', 'Zagreb', 'Plitvice', 'Split', 'Dubrovnik'],
      highlights: [
        "Swiss Alps Experience with Mount Titlis",
        "Scenic Train Journey through Switzerland",
        "Plitvice Lakes UNESCO World Heritage Site",
        "Dubrovnik City Walls & Game of Thrones Locations",
        "Croatian Island Hopping Cruise"
      ],
      itinerary: [
        { 
          day: 1, 
          title: "Arrival in Zurich", 
          description: "Arrive at Zurich airport, transfer to hotel. Evening stroll along Lake Zurich and traditional Swiss dinner.",
          activities: [
            "Arrival at Zurich Airport",
            "Transfer to hotel",
            "Check-in",
            "Walk along Lake Zurich promenade",
            "Visit Bahnhofstrasse (shopping street)",
            "Traditional Swiss Dinner"
          ]
        },
        { 
          day: 2, 
          title: "Zurich to Lucerne", 
          description: "Scenic train journey to Lucerne. Explore Chapel Bridge, Water Tower, and Lake Lucerne boat cruise.",
          activities: [
            "Train to Lucerne",
            "Visit Chapel Bridge (Kapellbrücke)",
            "See the Water Tower",
            "Visit Lion Monument",
            "Lake Lucerne boat cruise",
            "Evening leisure in Old Town"
          ]
        },
        { 
          day: 3, 
          title: "Mount Titlis Alpine Adventure", 
          description: "Cable car to Mount Titlis, Ice Flyer chairlift, Cliff Walk suspension bridge, and glacier cave exploration.",
          activities: [
            "Travel to Engelberg",
            "Rotair cable car to Mount Titlis",
            "Walk on the Cliff Walk suspension bridge",
            "Ride the Ice Flyer chairlift",
            "Explore the Glacier Cave",
            "Snow tubing (seasonal)",
            "Return to Lucerne"
          ]
        },
        { 
          day: 4, 
          title: "Interlaken & Swiss Countryside", 
          description: "Travel to Interlaken, Jungfraujoch excursion, and experience traditional Swiss alpine culture.",
          activities: [
            "GoldenPass Line scenic train (partially)",
            "Arrive in Interlaken",
            "Excursion to Jungfraujoch (optional add-on)",
            "Or visit Harder Kulm viewpoint",
            "Explore Hohematte Park",
            "Shopping for Swiss watches/chocolates"
          ]
        },
        { 
          day: 5, 
          title: "Switzerland to Croatia - Zagreb", 
          description: "Fly to Zagreb, Croatia's capital. City tour including Upper Town, St. Mark's Church, and local cuisine tasting.",
          activities: [
            "Flight to Zagreb",
            "Arrival and transfer to hotel",
            "Guided walking tour of Zagreb",
            "Visit Upper Town (Gornji Grad)",
            "See St. Mark's Church",
            "Visit Dolac Market",
            "Dinner with Croatian specialties"
          ]
        },
        { 
          day: 6, 
          title: "Plitvice Lakes National Park", 
          description: "Full day exploring UNESCO World Heritage waterfalls, hiking trails, and electric boat rides through the lakes.",
          activities: [
            "Day trip to Plitvice Lakes National Park",
            "Hiking through wooden pathways",
            "View the Veliki Slap (Great Waterfall)",
            "Electric boat ride on Lake Kozjak",
            "Lunch near the park",
            "Return to Zagreb/Hotel near Plitvice"
          ]
        },
        { 
          day: 7, 
          title: "Split - Diocletian's Palace", 
          description: "Drive to Split. Guided tour of Diocletian's Palace, Riva waterfront, and traditional Dalmatian dinner.",
          activities: [
            "Drive to Split (Coastal route)",
            "Check-in at Split hotel",
            "Guided tour of Diocletian's Palace (UNESCO)",
            "Visit Peristyle Square",
            "Stroll along Riva Promenade",
            "Dalmatian seafood dinner"
          ]
        },
        { 
          day: 8, 
          title: "Dubrovnik - Pearl of Adriatic", 
          description: "Transfer to Dubrovnik. Walking tour of Old Town, city walls, and Game of Thrones filming locations.",
          activities: [
            "Scenic drive to Dubrovnik",
            "Stop at Ston for oysters (optional)",
            "Arrival in Dubrovnik",
            "Walk the City Walls",
            "Explore Old Town (Stradun)",
            "Game of Thrones filming spots",
            "Sunset cable car ride (optional)"
          ]
        },
        { 
          day: 9, 
          title: "Island Hopping Cruise", 
          description: "Full-day Adriatic cruise to Elafiti Islands with swimming, snorkeling, and seafood lunch on board.",
          activities: [
            "Board boat for Elafiti Islands cruise",
            "Visit Koločep, Lopud, and Šipan islands",
            "Swimming and snorkeling stops",
            "Lunch served on board",
            "Relax on sandy beaches (Sunj Beach)",
            "Return to Dubrovnik port",
            "Farewell dinner"
          ]
        },
        { 
          day: 10, 
          title: "Departure from Dubrovnik", 
          description: "Free morning for last-minute shopping, transfer to Dubrovnik airport for departure.",
          activities: [
            "Breakfast at hotel",
            "Free time for shopping/leisure",
            "Transfer to Dubrovnik Airport",
            "Departure flight",
            "Tour concludes"
          ]
        }
      ],
      inclusions: [
        "9 nights accommodation in boutique hotels",
        "Daily Swiss & Croatian breakfast",
        "6 traditional dinners",
        "All transfers including scenic trains",
        "Mount Titlis cable car & Jungfraujoch"
      ],
      exclusions: [
        "International flights",
        "Lunch (except cruise day)",
        "Personal shopping",
        "Tips for guides",
        "Alcoholic beverages"
      ],
      description: "Discover the breathtaking beauty of Switzerland and Croatia in one unforgettable journey. From snow-capped Alps to crystal-clear Adriatic waters.",
      metaDescription: "10-Day Switzerland & Croatia Tour Package 2026. Zurich, Alps & Dubrovnik. Boutique hotels, breakfast, transfers & guided tours.",
      groupSize: "Max 15 people",
      bestTime: "May - September",
      difficulty: "Easy to Moderate",
      transport: "Scenic Trains & Transfers",
      accommodation: "Boutique Hotels",
      meals: "Breakfast + 6 Dinners",
      virtualTourData: {
        destination: "Switzerland & Croatia Tour",
        tourStops: [
          {
            id: "1",
            title: "Swiss Alps Scenic Journey",
            description: "Embark on an unforgettable panoramic journey through the heart of the Swiss Alps, witnessing majestic snow-capped peaks and serene valleys.",
            image: "/Europe Image New.png",
            videoUrl: "https://www.youtube.com/shorts/1LkkxGZomPU",
            duration: "3-4 hours",
            highlights: ["Panoramic train ride", "Snow-capped peaks", "Scenic valleys", "Stunning alpine vistas"],
            bestTime: "Morning (9:00 AM - 12:00 PM)",
            tips: ["Keep your camera ready", "Sit on the left side of the train for best views"]
          },
          {
            id: "2",
            title: "Dubrovnik Old Town",
            description: "Walk the historic city walls of Dubrovnik and enjoy the views of the shimmering Adriatic Sea.",
            image: "/Europe Image Neww.png",
            duration: "3 hours",
            highlights: ["Historic city walls", "Adriatic views", "Ancient architecture"],
            bestTime: "Afternoon (3:00 PM - 6:00 PM)",
            tips: ["Wear comfortable walking shoes", "Stay hydrated"]
          }
        ]
      }
    }
  };

  const currentTour = tours[selectedTour];

  // Map Locations
  const locations = [
    { name: 'Paris', coordinates: [48.8566, 2.3522], description: 'City of Lights' },
    { name: 'Rome', coordinates: [41.9028, 12.4964], description: 'Eternal City' },
    { name: 'Interlaken', coordinates: [46.6863, 7.8632], description: 'Gateway to Jungfrau' },
    { name: 'Amsterdam', coordinates: [52.3676, 4.9041], description: 'Canal City' },
    { name: 'London', coordinates: [51.5074, -0.1278], description: 'Royal Capital' },
    { name: 'Venice', coordinates: [45.4408, 12.3155], description: 'Floating City' },
    { name: 'Florence', coordinates: [43.7696, 11.2558], description: 'Cradle of Renaissance' },
    { name: 'Prague', coordinates: [50.0755, 14.4378], description: 'City of Hundred Spires' },
    { name: 'Zagreb', coordinates: [45.8150, 15.9819], description: 'Croatian Capital' },
    { name: 'Split', coordinates: [43.5081, 16.4402], description: 'Coastal Gem' },
    { name: 'Dubrovnik', coordinates: [42.6507, 18.0944], description: 'Pearl of the Adriatic' }
  ];

  // Scroll to top when switching tours
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedTour]);

  const europeFaqs = [
    {
      question: "How long does it take to get a Schengen visa for Indians in 2026?",
      answer: "Typically, the Schengen visa process for Indian citizens takes about 15-20 working days after the biometric appointment. We recommend booking your Europe tour at least 3 months in advance to ensure smooth visa processing and to secure better airfares."
    },
    {
      question: "Are Indian meals and vegetarian options available in your Europe packages?",
      answer: "Yes, our group tour packages include carefully selected Indian restaurants for several dinners. For breakfast, all our hotels provide a wide variety of continental options, including many vegetarian choices like fruits, cereals, breads, and juices."
    },
    {
      question: "What is the best month to visit Switzerland and Paris?",
      answer: "The ideal time to visit is from May to September when the weather is pleasant and the landscapes are in full bloom. For those interested in snow and winter sports in the Swiss Alps, December to February is the perfect time."
    },
    {
      question: "Do you provide travel insurance with your Europe tour packages?",
      answer: "While travel insurance is usually an optional add-on, it is mandatory for Schengen visa approval. We provide comprehensive travel insurance assistance that covers medical emergencies, trip cancellations, and baggage loss to ensure you travel with peace of mind."
    }
  ];

  return (
    <Layout>
      <PackageSEO
        title={currentTour.title}
        description={currentTour.metaDescription}
        canonical={`https://ghumofiroojourneys.com/packages/${currentTour.id}`}
        images={currentTour.images}
        price={currentTour.price}
        rating={currentTour.rating}
        reviews={currentTour.reviews}
        geo={{
          region: 'EU',
          placename: 'Europe',
          position: '48.8566;2.3522',
          icbm: '48.8566,2.3522',
          latitude: '48.8566',
          longitude: '2.3522',
        }}
        faqs={europeFaqs}
        skipProductSchema={true}
        structuredData={buildTouristTripJsonLd({
          name: currentTour.title,
          description: currentTour.metaDescription,
          url: `https://ghumofiroojourneys.com/packages/${currentTour.id}`,
          image: currentTour.images,
          offer: {
            price: currentTour.price.toString(),
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock'
          },
          itinerary: currentTour.itinerary.map(day => ({
            position: day.day,
            name: day.title,
            description: day.activities ? day.activities.join('. ') : day.description
          })),
          destination: {
              name: "Europe",
              address: "Europe"
            },
            aggregateRating: {
              ratingValue: currentTour.rating,
              reviewCount: currentTour.reviews
            }
          })}
      />

      {/* Sticky Journey Selector */}
      <div className="sticky top-[64px] z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
            <span className="text-sm font-semibold text-gray-600 hidden sm:block">Choose Your Europe Experience:</span>
            <div className="flex p-1 bg-gray-100 rounded-lg overflow-x-auto max-w-full">
              {(Object.keys(tours) as TourType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTour(type)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap",
                    selectedTour === type 
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" 
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {type === 'grand' && <Globe className="w-4 h-4" />}
                  {type === 'highlights' && <Camera className="w-4 h-4" />}
                  {type === 'swiss-croatia' && <Mountain className="w-4 h-4" />}
                  {tours[type].shortTitle}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <ModernPackageHero
        title={currentTour.title}
        duration={currentTour.duration}
        price={`Starting from ₹${currentTour.price.toLocaleString()}*`}
        rating={currentTour.rating}
        reviews={currentTour.reviews}
        images={currentTour.images}
        destinations={currentTour.destinations}
        packageType="international"
        highlights={currentTour.highlights}
        bestTime={currentTour.bestTime}
        groupSize={currentTour.groupSize}
        difficulty={currentTour.difficulty}
        virtualTourData={currentTour.virtualTourData}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Overview */}
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="pt-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {currentTour.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 text-indigo-500 mb-2" />
                    <span className="text-xs text-gray-500 uppercase font-bold">Duration</span>
                    <span className="font-semibold text-sm text-center">{currentTour.duration}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-500 mb-2" />
                    <span className="text-xs text-gray-500 uppercase font-bold">Group Size</span>
                    <span className="font-semibold text-sm text-center">{currentTour.groupSize}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <Utensils className="w-6 h-6 text-indigo-500 mb-2" />
                    <span className="text-xs text-gray-500 uppercase font-bold">Meals</span>
                    <span className="font-semibold text-sm text-center">{currentTour.meals}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <Plane className="w-6 h-6 text-indigo-500 mb-2" />
                    <span className="text-xs text-gray-500 uppercase font-bold">Transport</span>
                    <span className="font-semibold text-sm text-center">{currentTour.transport}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Itinerary Section */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <DetailedItinerary 
                  itinerary={currentTour.itinerary}
                  themeColor="indigo"
                />
              </CardContent>
            </Card>

            {/* Comparison Table */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Europe Packages</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Feature</th>
                      <th className={`px-4 py-3 ${selectedTour === 'grand' ? 'text-indigo-600 font-bold bg-indigo-50' : ''}`}>Grand Tour</th>
                      <th className={`px-4 py-3 ${selectedTour === 'highlights' ? 'text-indigo-600 font-bold bg-indigo-50' : ''}`}>Highlights</th>
                      <th className={`px-4 py-3 ${selectedTour === 'swiss-croatia' ? 'text-indigo-600 font-bold bg-indigo-50' : ''}`}>Swiss & Croatia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium">Duration</td>
                      <td className="px-4 py-3">15 Days</td>
                      <td className="px-4 py-3">12 Days</td>
                      <td className="px-4 py-3">10 Days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Countries</td>
                      <td className="px-4 py-3">5 (FR, IT, CH, NL, UK)</td>
                      <td className="px-4 py-3">4 (FR, CH, IT, CZ)</td>
                      <td className="px-4 py-3">2 (CH, HR)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Price</td>
                      <td className="px-4 py-3">₹2,25,000</td>
                      <td className="px-4 py-3">₹1,85,000</td>
                      <td className="px-4 py-3">₹1,35,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Key Feature</td>
                      <td className="px-4 py-3">Most Comprehensive</td>
                      <td className="px-4 py-3">Best Value</td>
                      <td className="px-4 py-3">Nature & Coast</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3">
                        <Button 
                          size="sm" 
                          variant={selectedTour === 'grand' ? 'default' : 'outline'}
                          onClick={() => setSelectedTour('grand')}
                          className="w-full"
                        >
                          {selectedTour === 'grand' ? 'Selected' : 'View'}
                        </Button>
                      </td>
                      <td className="px-4 py-3">
                        <Button 
                          size="sm" 
                          variant={selectedTour === 'highlights' ? 'default' : 'outline'}
                          onClick={() => setSelectedTour('highlights')}
                          className="w-full"
                        >
                          {selectedTour === 'highlights' ? 'Selected' : 'View'}
                        </Button>
                      </td>
                      <td className="px-4 py-3">
                        <Button 
                          size="sm" 
                          variant={selectedTour === 'swiss-croatia' ? 'default' : 'outline'}
                          onClick={() => setSelectedTour('swiss-croatia')}
                          className="w-full"
                        >
                          {selectedTour === 'swiss-croatia' ? 'Selected' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-100 bg-green-50/30">
                <CardHeader>
                  <CardTitle as="h2" className="text-green-700 flex items-center gap-2">
                    <Check className="w-5 h-5" /> Inclusions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentTour.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-red-100 bg-red-50/30">
                <CardHeader>
                  <CardTitle as="h2" className="text-red-700 flex items-center gap-2">
                    <X className="w-5 h-5" /> Exclusions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentTour.exclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Terms & Conditions */}
            <section>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle as="h2" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                    Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Booking & Payment:</h3>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                        <li>25% advance payment required to confirm booking</li>
                        <li>Full payment due 30 days before departure (Visa requirement)</li>
                        <li>Prices subject to change based on currency fluctuations</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy:</h3>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                        <li>60+ days before departure: 10% cancellation charges</li>
                        <li>30-59 days before departure: 50% cancellation charges</li>
                        <li>Less than 30 days: 100% cancellation charges</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Important Notes:</h3>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                        <li>Schengen Visa processing takes 15-20 working days</li>
                        <li>Passport must be valid for 6 months beyond travel dates</li>
                        <li>Travel Insurance is mandatory for Europe travel</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* FAQ Section */}
            <FAQSection 
              faqs={europeFaqs} 
              title="Europe Travel FAQs"
              subtitle="Everything you need to know about planning your dream European vacation."
              className="py-8 bg-transparent"
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-[88px] space-y-6">
              <PackageSidebar 
                packageDetails={{
                  title: currentTour.title,
                  duration: currentTour.duration,
                  price: `₹${currentTour.price.toLocaleString()}`,
                  rating: currentTour.rating,
                  reviews: currentTour.reviews,
                  highlights: currentTour.highlights,
                  inclusions: currentTour.inclusions,
                  itinerary: currentTour.itinerary,
                  image: currentTour.images[0]
                }}
                packageType="international"
                destination="Europe"
                quickFacts={{
                  groupSize: currentTour.groupSize,
                  bestTime: currentTour.bestTime,
                  difficulty: currentTour.difficulty,
                  ageLimit: "5 - 75 years",
                  accommodation: currentTour.accommodation,
                  meals: currentTour.meals,
                  transport: currentTour.transport
                }}
              />
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Visa Assistance
                </h3>
                <p className="text-sm text-blue-800">
                  We provide complete assistance for Schengen & UK visas. Our success rate is 99% for families and couples. Book 3 months in advance for hassle-free processing.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default EuropeTour;
