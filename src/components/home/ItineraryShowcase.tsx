import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

interface TourItinerary {
  id: string;
  title: string;
  video: string;
  duration: string;
  days: ItineraryDay[];
  slug: string;
}

const itineraries: TourItinerary[] = [
  {
    id: 'rann-utsav',
    title: 'Rann Utsav Luxury Tent Experience',
    video: 'https://www.youtube.com/watch?v=wmdxiA8WEAU',
    duration: '4 Days / 3 Nights',
    slug: '/packages/rann-utsav',
    days: [
      {
        day: 1,
        title: 'Arrival in Bhuj & Sunset at White Desert',
        description: 'Traditional welcome at Bhuj. Transfer to the premium Tent City at Dhordo. Evening visit to the endless White Salt Desert to witness a spectacular sunset.',
        activities: ['Bhuj Airport/Railway transfer', 'Luxury Tent City check-in', 'Traditional Gujarati lunch', 'White Desert sunset walk', 'Night cultural folk music show']
      },
      {
        day: 2,
        title: 'Kala Dungar (Black Hill) & Craft Villages',
        description: 'Early morning sunrise view at the salt flats. Mid-day excursion to Kala Dungar, the highest point in Kutch, followed by a visit to the craft village of Gandhi Nu Gam.',
        activities: ['White Rann sunrise photography', 'Excursion to Kala Dungar & Dattatreya Temple', 'Interact with Kutchi artisans in Gandhi Nu Gam', 'Adventure activities in Tent City']
      },
      {
        day: 3,
        title: 'Mandvi Coastal Beach & Vijay Vilas Palace',
        description: 'Explore the private coastal beach at Mandvi. Visit the majestic Vijay Vilas Palace, a famous heritage building overlooking the Arabian Sea.',
        activities: ['Mandvi Beach leisure time', 'Tour of Vijay Vilas Palace', 'Vijay Vilas organic farms visit', 'Special traditional dinner at Tent City']
      },
      {
        day: 4,
        title: 'Bhuj Heritage Tour & Departure',
        description: 'Check out from Tent City. En route tour of Swaminarayan Temple, Prag Mahal, and Aina Mahal in Bhuj before dropping at the airport/station.',
        activities: ['Bhujodi handicraft village tour', 'Sri Swaminarayan Temple visit', 'Prag Mahal & Aina Mahal museum tour', 'Airport drop-off']
      }
    ]
  },
  {
    id: 'char-dham',
    title: 'Char Dham Yatra Holy Pilgrimage',
    video: '/Kedarnath Video.mp4',
    duration: '12 Days / 11 Nights',
    slug: '/packages/char-dham-yatra',
    days: [
      {
        day: 1,
        title: 'Haridwar to Barkot (Yamunotri base)',
        description: 'Scenic road journey along the Yamuna river. En route visit to Kempty Falls in Mussoorie. Check-in at your comfortable Barkot hotel.',
        activities: ['Haridwar pickup', 'Drive via Mussoorie hills', 'Visit Kempty Falls', 'Barkot hotel check-in', 'Evening rest and acclimatization']
      },
      {
        day: 2,
        title: 'Yamunotri Dham Sacred Darshan',
        description: 'Drive to Janki Chatti. Embark on a 6km scenic trek or ride a pony to Yamunotri Temple. Holy dip in Surya Kund thermal spring.',
        activities: ['Drive to Janki Chatti', '6km trek to Yamunotri Temple', 'Holy bath in Surya Kund', 'Perform Puja at Yamunotri', 'Return trek to Barkot']
      },
      {
        day: 3,
        title: 'Barkot to Uttarkashi (Gangotri base)',
        description: 'Drive to Uttarkashi along the Bhagirathi river. Check-in at hotel. Evening visit to the ancient Kashi Vishwanath Temple.',
        activities: ['Ac scenic drive to Uttarkashi', 'Hotel check-in', 'Kashi Vishwanath Temple visit', 'Bhagirathi river bank walk', 'Puja and Aarti']
      },
      {
        day: 4,
        title: 'Gangotri Dham Sacred Darshan',
        description: 'Drive along the picturesque Harsil Valley to Gangotri Temple. Take a holy dip in the icy waters of Bhagirathi and perform prayers.',
        activities: ['Scenic drive via Harsil Valley', 'Gangotri Temple darshan', 'Holy bath in Ganga river', 'Explore Gangotri National Park gate', 'Return to Uttarkashi']
      },
      {
        day: 5,
        title: 'Kedarnath Dham Trek & Darshan',
        description: 'Drive to Sonprayag/Gaurikund. Embark on the holy 16km trek to Kedarnath Temple. Helicopter option available. Attend the majestic evening Aarti.',
        activities: ['Drive to Gaurikund', 'Kedarnath Trek / Helicopter ride', 'Check-in at Kedarnath guest house', 'Evening Aarti at Kedarnath temple', 'Darshan of Jyotirlinga']
      }
    ]
  },
  {
    id: 'europe',
    title: 'Grand Europe Highlights Tour',
    video: 'https://www.youtube.com/shorts/1LkkxGZomPU',
    duration: '15 Days / 14 Nights',
    slug: '/packages/europe-grand-tour',
    days: [
      {
        day: 1,
        title: 'Arrival in Paris & Seine River Cruise',
        description: 'Welcome to Paris, France. Private transfer to your luxury hotel. In the evening, enjoy a glassmorphic cruise along the Seine River.',
        activities: ['Charles de Gaulle Airport pickup', 'Paris luxury hotel check-in', 'Leisure walking in Champs-Élysées', 'Seine River Cruise', 'Illuminated Eiffel Tower view']
      },
      {
        day: 2,
        title: 'Eiffel Tower Summit & Louvre Museum',
        description: 'Skip-the-line entry to the summit of the Eiffel Tower for panoramic views. Guided tour of the Louvre Museum showcasing the world\'s greatest masterpieces.',
        activities: ['Eiffel Tower Summit access', 'Guided tour of Louvre Museum', 'Arc de Triomphe photo stop', 'Dinner at a traditional French bistro']
      },
      {
        day: 3,
        title: 'Scenic Train to Swiss Alps (Interlaken)',
        description: 'Board the high-speed TGV Lyria train to Switzerland. Witness the changing landscapes as you arrive in Interlaken, nestled between two alpine lakes.',
        activities: ['TGV train from Paris to Switzerland', 'Ac scenic transfer to Interlaken', 'Check-in at Alpine view hotel', 'Evening walk around Höhematte park']
      },
      {
        day: 4,
        title: 'Jungfraujoch - Top of Europe Excursion',
        description: 'Board the cogwheel train to Jungfraujoch, the highest railway station in Europe at 3,454m. Visit the Ice Palace and enjoy panoramic glacier views.',
        activities: ['Eiger Express gondola ride', 'Cogwheel train to Jungfraujoch', 'Sphinx Observatory visit', 'Walk through the glacier Ice Palace', 'Grindelwald village visit']
      },
      {
        day: 5,
        title: 'Lucerne Exploration & Chapel Bridge',
        description: 'Scenic lake-side drive to Lucerne. Walk across the 14th-century wooden Chapel Bridge and visit the iconic Lion Monument.',
        activities: ['Scenic drive to Lucerne', 'Walk Chapel Bridge & Jesuitenkirche', 'Lion Monument photo stop', 'Lake Lucerne boat cruise']
      }
    ]
  }
];

const getYoutubeEmbedUrl = (url: string, isMuted: boolean) => {
  if (!url) return '';
  let videoId = '';
  try {
    const cleanedUrl = url.trim();
    if (cleanedUrl.includes('youtube.com/shorts/') || cleanedUrl.includes('youtube.com/shorts/')) {
      videoId = cleanedUrl.split('shorts/')[1]?.split('?')[0]?.split('&')[0];
    } else if (cleanedUrl.includes('youtube.com/watch')) {
      const urlObj = new URL(cleanedUrl.startsWith('http') ? cleanedUrl : `https://${cleanedUrl}`);
      videoId = urlObj.searchParams.get('v') || '';
    } else if (cleanedUrl.includes('youtu.be/')) {
      videoId = cleanedUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
    } else if (cleanedUrl.includes('youtube.com/embed/')) {
      videoId = cleanedUrl.split('embed/')[1]?.split('?')[0]?.split('&')[0];
    } else {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = cleanedUrl.match(regExp);
      if (match && match[2] && match[2].length === 11) {
        videoId = match[2];
      }
    }
  } catch (e) {
    console.error("Error parsing YouTube URL", e);
  }
  
  videoId = videoId ? videoId.trim() : '';
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&playlist=${videoId}&loop=1&enablejsapi=1&origin=${origin}` : url;
};

const ItineraryShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('rann-utsav');
  const [activeDay, setActiveDay] = useState<number>(1);

  const currentTour = itineraries.find(t => t.id === activeTab) || itineraries[0];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-orange-400 border border-accent/20 px-4 py-2 rounded-full text-sm font-medium">
            🧭 Itinerary Showcase
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Premium <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">Interactive Itineraries</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Preview your dream vacation day-by-day. Select a tour style to explore our curated schedules.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {itineraries.map((itinerary) => (
            <button
              key={itinerary.id}
              onClick={() => {
                setActiveTab(itinerary.id);
                setActiveDay(1);
              }}
              className={`px-8 py-3.5 rounded-2xl font-bold text-base transition-all duration-300 border ${
                activeTab === itinerary.id
                  ? 'bg-accent border-accent text-white shadow-lg shadow-orange-600/25 scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {itinerary.id === 'rann-utsav' && '🎪 '}
              {itinerary.id === 'char-dham' && '🕉️ '}
              {itinerary.id === 'europe' && '🏰 '}
              {itinerary.title.split(' ')[0]} {itinerary.title.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Interactive Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Video Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-3xl overflow-hidden aspect-video lg:aspect-[4/3] bg-black shadow-2xl border border-slate-800 group">
              {currentTour.video.includes('youtube.com') || currentTour.video.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  src={getYoutubeEmbedUrl(currentTour.video, true)}
                  title={currentTour.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={currentTour.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                >
                  <source src={currentTour.video} type="video/mp4" />
                </video>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <Badge className="bg-accent text-white border-0 mb-1.5">{currentTour.duration}</Badge>
                  <h4 className="font-bold text-white text-lg leading-tight">{currentTour.title}</h4>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                  <Play className="w-4.5 h-4.5 fill-current" />
                </div>
              </div>
            </div>

            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md text-white rounded-3xl p-6">
              <CardContent className="p-0 space-y-4">
                <h4 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                  <span>💡</span> What makes this premium?
                </h4>
                <ul className="space-y-3.5 text-slate-300 text-sm">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Vetted 4-star and 5-star hotel partners for high quality comfort.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Private AC sedan or SUV transfers with English-speaking drivers.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Special inclusions like skip-the-line tickets and local tastings.</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Link to={currentTour.slug}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white rounded-2xl py-6 font-bold text-base transition-all border-0 shadow-lg shadow-orange-500/10">
                      View Full Details
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Day Details & Interactive Timeline */}
          <div className="lg:col-span-7 space-y-6">
            {/* Day selector slider/list */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {currentTour.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setActiveDay(day.day)}
                  className={`px-5 py-3 rounded-2xl font-extrabold text-sm transition-all duration-300 flex-shrink-0 border flex items-center gap-1.5 ${
                    activeDay === day.day
                      ? 'bg-white border-white text-slate-950 scale-105 shadow-xl'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Day {day.day}
                </button>
              ))}
            </div>

            {/* Selected Day Detail Card */}
            {currentTour.days.map((day) => {
              if (day.day !== activeDay) return null;
              return (
                <Card 
                  key={day.day} 
                  className="border-slate-800 bg-slate-900/60 backdrop-blur-md text-white rounded-3xl shadow-2xl p-8 animate-fade-in"
                >
                  <CardContent className="p-0 space-y-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <span className="text-orange-400 font-extrabold text-xs uppercase tracking-widest">Day {day.day} Itinerary</span>
                        <h3 className="text-2xl font-extrabold text-white tracking-tight">{day.title}</h3>
                      </div>
                      <Badge className="bg-accent/15 text-orange-400 border border-accent/20 px-3 py-1 font-bold text-xs">
                        Included
                      </Badge>
                    </div>

                    <p className="text-slate-300 text-base leading-relaxed font-light">
                      {day.description}
                    </p>

                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Scheduled Activities:</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {day.activities.map((activity, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 hover:bg-slate-950/70 transition-colors"
                          >
                            <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300 text-sm leading-tight font-medium">{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ItineraryShowcase;
