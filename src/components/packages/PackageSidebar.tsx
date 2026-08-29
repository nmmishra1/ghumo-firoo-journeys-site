import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  Calendar, 
  Sparkles, 
  ShieldAlert, 
  Hotel, 
  Utensils, 
  Car, 
  ShieldCheck,
  MapPin,
  Navigation
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import EnhancedBrochureDownload from './EnhancedBrochureDownload';
import PackageActionButtons from './PackageActionButtons';

interface PackageDetails {
  title: string;
  duration: string;
  price: string;
  rating?: number;
  reviews?: number;
  highlights: string[];
  inclusions?: string[];
  itinerary?: Array<{ day: number; title: string; description: string }>;
  image?: string;
}

interface PackageSidebarProps {
  packageDetails: PackageDetails;
  packageType: 'domestic' | 'international';
  destination: string;
  ctaLabel?: string;
  enquireLabel?: string;
  quickFacts?: {
    groupSize?: string;
    bestTime?: string;
    difficulty?: string;
    ageLimit?: string;
    accommodation?: string;
    meals?: string;
    transport?: string;
  };
}

const PackageSidebar: React.FC<PackageSidebarProps> = ({ 
  packageDetails, 
  packageType, 
  destination, 
  ctaLabel,
  enquireLabel,
  quickFacts = {} 
}) => {
  const {
    groupSize = "Max 20 people",
    bestTime = "October - March",
    difficulty = "Easy",
    ageLimit = "5 - 65 years",
    accommodation = "4-5 Star Hotels",
    meals = "Breakfast Included",
    transport = "Flights & Transfers"
  } = quickFacts;

  const contextStr = `${destination || ''} ${packageDetails?.title || ''}`.toLowerCase();
  
  let pickupOptions: string[] = [];
  let dropOptions: string[] = [];

  if (contextStr.includes('dham') || contextStr.includes('uttarakhand') || contextStr.includes('kedarnath') || contextStr.includes('haridwar')) {
    pickupOptions = [
      'Haridwar Railway Station',
      'Dehradun Jolly Grant Airport (DED)',
      'Dehradun Railway Station',
      'Delhi IGI Airport (DEL)',
      'New Delhi Railway Station (NDLS)',
      'Rishikesh Railway Station'
    ];
    dropOptions = [
      'Dehradun Jolly Grant Airport (DED)',
      'Haridwar Railway Station',
      'Delhi IGI Airport (DEL)',
      'Rishikesh Railway Station',
      'Dehradun Railway Station'
    ];
  } else if (contextStr.includes('rann') || contextStr.includes('gujarat') || contextStr.includes('bhuj') || contextStr.includes('utsav')) {
    pickupOptions = [
      'Bhuj Railway Station',
      'Bhuj Airport (BHJ)',
      'Rajkot Airport (RAJ)',
      'Gandhidham Railway Station',
      'Ahmedabad Airport (AMD)'
    ];
    dropOptions = [
      'Bhuj Railway Station',
      'Bhuj Airport (BHJ)',
      'Gandhidham Railway Station',
      'Rajkot Airport (RAJ)',
      'Ahmedabad Airport (AMD)'
    ];
  } else if (contextStr.includes('kerala') || contextStr.includes('cochin') || contextStr.includes('munnar') || contextStr.includes('alleppey')) {
    pickupOptions = [
      'Cochin International Airport (COK)',
      'Ernakulam Railway Station (ERS)',
      'Trivandrum Airport (TRV)',
      'Madurai Airport (IXM)'
    ];
    dropOptions = [
      'Cochin International Airport (COK)',
      'Alleppey Houseboat Pier',
      'Munnar Resort',
      'Trivandrum Airport (TRV)'
    ];
  } else if (contextStr.includes('himachal') || contextStr.includes('shimla') || contextStr.includes('manali')) {
    pickupOptions = [
      'Chandigarh Airport (IXC)',
      'Chandigarh Railway Station',
      'Delhi IGI Airport (DEL)',
      'Kalka Railway Station'
    ];
    dropOptions = [
      'Chandigarh Airport (IXC)',
      'Shimla / Manali Hotel',
      'Delhi IGI Airport (DEL)'
    ];
  } else if (contextStr.includes('rajasthan') || contextStr.includes('jaipur') || contextStr.includes('udaipur')) {
    pickupOptions = [
      'Jaipur Airport (JAI)',
      'Jaipur Railway Station',
      'Delhi IGI Airport (DEL)',
      'Udaipur Airport (UDR)',
      'Jodhpur Airport (JDH)'
    ];
    dropOptions = [
      'Jaipur Airport (JAI)',
      'Udaipur Airport (UDR)',
      'Jodhpur Railway Station',
      'Delhi IGI Airport (DEL)'
    ];
  } else {
    pickupOptions = [
      'Airport Terminal Pickup',
      'Railway Station Pickup',
      'Hotel / City Center Pickup'
    ];
    dropOptions = [
      'Airport Terminal Drop',
      'Railway Station Drop',
      'Hotel / City Center Drop'
    ];
  }

  const [pickupStation, setPickupStation] = React.useState(pickupOptions[0]);
  const [dropStation, setDropStation] = React.useState(dropOptions[0]);

  // Interactive Travel Dates & Passengers state
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [travelDate, setTravelDate] = React.useState(tomorrowStr);
  const [travelers, setTravelers] = React.useState(2);

  const nightsMatch = packageDetails.duration ? packageDetails.duration.match(/(\d+)\s*Nights?/i) || packageDetails.duration.match(/(\d+)\s*Days?/i) : null;
  const numNights = nightsMatch ? Math.max(1, parseInt(nightsMatch[1]) - (packageDetails.duration.toLowerCase().includes('night') ? 0 : 1)) : 3;

  const computeReturnDate = (startDateStr: string, nights: number) => {
    if (!startDateStr) return '';
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + nights);
    return d.toISOString().split('T')[0];
  };

  const returnDate = computeReturnDate(travelDate, numNights);

  React.useEffect(() => {
    if (!pickupOptions.includes(pickupStation)) {
      setPickupStation(pickupOptions[0]);
    }
    if (!dropOptions.includes(dropStation)) {
      setDropStation(dropOptions[0]);
    }
  }, [contextStr]);

  return (
    <div className="space-y-6">
      {/* Premium Unified Booking & Quick Facts Card */}
      <Card className="border-0 shadow-xl overflow-hidden bg-card/75 backdrop-blur-md border border-border/40">
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
        
        <CardContent className="p-6 space-y-6">
          {/* Price Header Section */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl p-5 border border-amber-100/50 dark:border-zinc-800 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -translate-y-12 translate-x-12"></div>
            <p className="text-4xl font-extrabold text-foreground tracking-tight">{packageDetails.price}</p>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Per person (minimum 2 people)</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A25A]/10 text-[#C9A25A] dark:text-[#C9A25A] text-[10px] font-black uppercase tracking-wider">
              <span>💰</span> Best Price Guaranteed
            </div>
          </div>

          {/* Interactive Travel Dates Selector */}
          <div className="bg-slate-900/90 dark:bg-zinc-900/90 p-4 rounded-2xl border border-amber-500/30 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" /> Travel Dates
              </h3>
              <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Select Dates
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" /> Travel Date *
                </Label>
                <input
                  id="sidebar-travel-date"
                  name="travelDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full h-9 bg-slate-950 border border-slate-700 rounded-lg px-2 text-slate-100 font-semibold text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Return Date
                </Label>
                <input
                  id="sidebar-return-date"
                  name="returnDate"
                  type="date"
                  readOnly
                  value={returnDate}
                  className="w-full h-9 bg-slate-950/60 border border-slate-800 rounded-lg px-2 text-slate-400 font-semibold text-xs cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Interactive Cab Transport Pickup & Drop Station Selector */}
          <div className="bg-slate-900/90 dark:bg-zinc-900/90 p-4 rounded-2xl border border-amber-500/30 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-400" /> Private Transport & Transfer Route
              </h3>
              <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Included
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> Pickup Station / Location
                </Label>
                <Select value={pickupStation} onValueChange={setPickupStation}>
                  <SelectTrigger className="h-9 bg-slate-950 border-slate-700 text-slate-100 font-semibold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pickupOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-emerald-400" /> Drop Station / Location
                </Label>
                <Select value={dropStation} onValueChange={setDropStation}>
                  <SelectTrigger className="h-9 bg-slate-950 border-slate-700 text-slate-100 font-semibold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dropOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-semibold flex items-center justify-between">
              <span>Selected Route:</span>
              <span className="text-amber-400 font-extrabold">{pickupStation.split(' ')[0]} → {dropStation.split(' ')[0]}</span>
            </div>
          </div>
          
          {/* Main Action Buttons */}
          <div className="space-y-3">
            <PackageActionButtons
              packageTitle={packageDetails.title}
              packagePrice={packageDetails.price}
              packageDuration={packageDetails.duration}
              packageImage={packageDetails.image}
              destinations={[destination]}
              variant="sidebar"
              ctaLabel={ctaLabel}
              enquireLabel={enquireLabel}
              pickupLocation={pickupStation}
              dropLocation={dropStation}
              travelDate={travelDate}
              returnDate={returnDate}
              passengersCount={travelers}
              selectedHotels={(packageDetails as any).hotels || []}
              selectedSightseeing={(packageDetails as any).attractions || []}
              itinerary={packageDetails.itinerary || []}
              inclusions={packageDetails.inclusions || []}
            />
          </div>

          {/* Quick Facts Grid Section */}
          <div className="space-y-3 pt-2 border-t border-border/40">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-orange-500">⚡</span> Quick Facts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {/* Duration */}
              <div className="flex items-center gap-2 p-2.5 bg-secondary/10 dark:bg-zinc-900/50 rounded-xl border border-border/20">
                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Duration</p>
                  <p className="text-xs font-extrabold text-foreground truncate">{packageDetails.duration}</p>
                </div>
              </div>

              {/* Group Size */}
              <div className="flex items-center gap-2 p-2.5 bg-secondary/10 dark:bg-zinc-900/50 rounded-xl border border-border/20">
                <Users className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Group Size</p>
                  <p className="text-xs font-extrabold text-foreground truncate">{groupSize}</p>
                </div>
              </div>

              {/* Best Time */}
              <div className="flex items-center gap-2 p-2.5 bg-secondary/10 dark:bg-zinc-900/50 rounded-xl border border-border/20">
                <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Best Time</p>
                  <p className="text-xs font-extrabold text-foreground truncate" title={bestTime}>{bestTime}</p>
                </div>
              </div>

              {/* Difficulty */}
              <div className="flex items-center gap-2 p-2.5 bg-secondary/10 dark:bg-zinc-900/50 rounded-xl border border-border/20">
                <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Difficulty</p>
                  <p className="text-xs font-extrabold text-foreground truncate">{difficulty}</p>
                </div>
              </div>

              {/* Age Limit */}
              <div className="flex items-center gap-2 p-2.5 bg-secondary/10 dark:bg-zinc-900/50 rounded-xl border border-border/20">
                <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Age Limit</p>
                  <p className="text-xs font-extrabold text-foreground truncate">{ageLimit}</p>
                </div>
              </div>

              {/* Accommodation */}
              <div className="flex items-center gap-2 p-2.5 bg-secondary/10 dark:bg-zinc-900/50 rounded-xl border border-border/20">
                <Hotel className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Stay</p>
                  <p className="text-xs font-extrabold text-foreground truncate" title={accommodation}>{accommodation}</p>
                </div>
              </div>

              {/* Meals */}
              <div className="flex items-center gap-2 p-2.5 bg-secondary/10 dark:bg-zinc-900/50 rounded-xl border border-border/20">
                <Utensils className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Meals</p>
                  <p className="text-xs font-extrabold text-foreground truncate" title={meals}>{meals}</p>
                </div>
              </div>

              {/* Transport */}
              <div className="flex items-center gap-2 p-2.5 bg-secondary/10 dark:bg-zinc-900/50 rounded-xl border border-border/20">
                <Car className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Transport</p>
                  <p className="text-xs font-extrabold text-foreground truncate" title={transport}>{transport}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Brochure & Contact Section */}
          <div className="space-y-2 pt-4 border-t border-border/40">
            <EnhancedBrochureDownload 
              packageDetails={{
                ...packageDetails,
                inclusions: packageDetails.inclusions || [],
                exclusions: (packageDetails as any).exclusions || [],
                hotels: (packageDetails as any).hotels || [],
                attractions: (packageDetails as any).attractions || [],
                itinerary: packageDetails.itinerary || []
              }}
              packageType={packageType}
              destination={destination}
              pickupLocation={pickupOptions[0] || `${destination} Pickup (Station/Airport)`}
              dropLocation={dropOptions[0] || `${destination} Drop-off Point`}
              groupSize={groupSize}
              bestTime={bestTime}
              difficulty={difficulty}
              ageLimit={ageLimit}
              accommodation={accommodation}
              meals={meals}
              transport={transport}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="bg-secondary/20 hover:bg-secondary/40 border-border/60 text-foreground font-semibold py-5">
                <Phone className="w-4 h-4 mr-2 text-orange-500" />
                <a href="tel:+919910987264">Call Us</a>
              </Button>
              <Button variant="outline" size="sm" className="bg-secondary/20 hover:bg-secondary/40 border-border/60 text-foreground font-semibold py-5">
                <Mail className="w-4 h-4 mr-2 text-orange-500" />
                <a href="mailto:booking@ghumofiroo.com">Email Us</a>
              </Button>
            </div>
          </div>

          {/* Secure Trust Badge */}
          <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/10 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-450 uppercase tracking-wide">
              100% Safe & Secure Booking
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageSidebar;