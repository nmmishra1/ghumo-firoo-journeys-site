import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MASTER_DESTINATIONS } from '@/data/masterDestinations';
import { 
  MapPin, Search, ArrowRight, Sparkles, Globe, Compass, 
  Clock, Plane, Calendar, Phone, MessageCircle, CheckCircle2,
  ChevronRight, Filter, Landmark, Trees, ShieldCheck, Heart,
  ArrowLeft, Share2, Eye, Star, Loader2, IndianRupee, Utensils,
  Train, Sun, CloudRain, HelpCircle, Award, Check
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

// Curated Popular Indian Circuits
const TOURISM_CIRCUITS = [
  {
    id: 'heritage-unesco',
    name: 'Royal Heritage & UNESCO',
    icon: '🏛️',
    description: 'Ancient temples, grand forts, and world-renowned UNESCO World Heritage monuments.',
    topDestinations: ['Khajuraho', 'Gwalior', 'Jaipur', 'Agra', 'Hampi', 'Orchha']
  },
  {
    id: 'wildlife-safari',
    name: 'Tiger Safaris & Wilderness',
    icon: '🐅',
    description: 'Thriving national parks, jeep safari drives, and untouched flora and fauna.',
    topDestinations: ['Pench National Park', 'Kanha National Park', 'Bandhavgarh National Park', 'Ranthambore', 'Jim Corbett']
  },
  {
    id: 'spiritual-jyotirlinga',
    name: 'Sacred Pilgrimage & Jyotirlingas',
    icon: '🛕',
    description: 'Spiritual awakening at sacred river ghats, ancient Jyotirlingas, and holy shrines.',
    topDestinations: ['Ujjain', 'Omkareshwar', 'Varanasi', 'Haridwar', 'Rishikesh', 'Char Dham']
  },
  {
    id: 'hill-station-nature',
    name: 'Himalayan Hills & Valleys',
    icon: '🏔️',
    description: 'Pristine mountain vistas, misty pine forests, waterfalls, and peaceful retreats.',
    topDestinations: ['Pachmarhi', 'Manali', 'Shimla', 'Nainital', 'Munnar', 'Darjeeling']
  },
  {
    id: 'culinary-culture',
    name: 'Culinary & Cultural Hubs',
    icon: '🍲',
    description: 'Legendary night food streets, royal cuisines, bustling bazaars, and folk traditions.',
    topDestinations: ['Indore', 'Bhopal', 'Lucknow', 'Amritsar', 'Kolkata', 'Hyderabad']
  }
];

export default function PublicIndiaExplorer() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<any | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [activeTheme, setActiveTheme] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Detailed Destination Travel Guide Modal
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [activeGuideCity, setActiveGuideCity] = useState<any>(null);

  // Custom Trip Inquiry Modal
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [targetDestination, setTargetDestination] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelersCount, setTravelersCount] = useState('2');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Load baseline states & cities live from CRM Database with sessionStorage caching
  useEffect(() => {
    const cacheKey = 'india_explorer_baseline_v2';
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.states && parsed.cities) {
          setStates(parsed.states);
          setCities(parsed.cities);
          setLoading(false);
          return;
        }
      } catch {}
    }

    setLoading(true);
    fetch(`${API_BASE}/get_india_tourism.php?action=baseline`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStates(data.states || []);
          setCities(data.cities || []);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          } catch {}
        }
      })
      .catch(err => console.error("Error loading baseline tourism data:", err))
      .finally(() => setLoading(false));
  }, []);

  const regions = ['All', 'North', 'South', 'West', 'Central', 'East'];
  const themes = ['All', 'Heritage & UNESCO', 'Wildlife & Safari', 'Spiritual & Pilgrimage', 'Hill Stations & Nature', 'Cultural & Food'];

  // Helper matching
  const isCityInState = (city: any, state: any) => {
    if (!city || !state) return false;
    if (city.state_id !== undefined && state.id !== undefined && String(city.state_id) === String(state.id)) {
      return true;
    }
    const sName = String(state.name || state.state_name || '').toLowerCase().trim();
    const cStateName = String(city.state_name || city.state || '').toLowerCase().trim();
    return Boolean(sName && cStateName && (sName === cStateName || cStateName.includes(sName) || sName.includes(cStateName)));
  };

  // Enriched cities dataset dynamically merging live DB + Master Directory
  const enrichedCities = useMemo(() => {
    return cities.map(c => {
      const cName = (c.name || c.city_name || '').toLowerCase().trim();
      const matched = MASTER_DESTINATIONS.find(d => 
        d.city.toLowerCase().includes(cName) || cName.includes(d.city.toLowerCase())
      );
      
      // Auto-determine culinary highlights
      let foodHighlights: string[] = [];
      if (cName.includes('indore')) foodHighlights = ['Sarafa Night Food Market (Garadu, Bhutte Ka Kees)', 'Chappan Dukan Street (Poha Jalebi, Johnny Hot Dog)', 'Lal Bagh Kulfi & Malpua'];
      else if (cName.includes('bhopal')) foodHighlights = ['Bhopali Biryani & Poha', 'Shahi Tukda & Sulemani Chai at Chatori Gali'];
      else if (cName.includes('ujjain')) foodHighlights = ['Mahakal Prasadam', 'Tower Chowk Street Food & Rabdi Kulfi'];
      else if (cName.includes('khajuraho')) foodHighlights = ['Bundelkhandi Thali', 'Mawa Bati & Dal Bafla'];
      else if (cName.includes('pench') || cName.includes('kanha')) foodHighlights = ['Jungle Barbecue & Campfire Dinner', 'Local Mahua Delicacies'];
      else foodHighlights = ['Authentic Regional Delicacies', 'Traditional Street Food Trails'];

      return {
        ...c,
        matched,
        destination_group: matched?.destination_group || c.destination_type || 'Leisure & Sightseeing',
        popular_attractions: matched?.popular_attractions || [],
        food_highlights: foodHighlights,
        nearest_airport: matched?.nearest_airport || (c.has_airport === 1 ? 'Regional Airport Available' : 'Connected via State Airport'),
        nearest_railway: matched?.nearest_railway || 'Central Railway Junction Available',
        gps_coordinates: matched?.gps_coordinates || '23.2599, 77.4126',
        best_time_to_visit: c.best_time_to_visit || 'October to March (Pleasant Weather)',
        ideal_duration: matched?.destination_group?.includes('Wildlife') ? '3 Days / 2 Nights' : '2-3 Days'
      };
    });
  }, [cities]);

  // Filtered cities list
  const filteredCities = useMemo(() => {
    return enrichedCities.filter(city => {
      if (selectedState && !isCityInState(city, selectedState)) return false;

      if (selectedRegion !== 'All') {
        const stateObj = states.find(s => isCityInState(city, s));
        if (stateObj && stateObj.region && stateObj.region.toLowerCase() !== selectedRegion.toLowerCase()) {
          return false;
        }
      }
      
      if (activeTheme !== 'All') {
        const group = (city.destination_group || '').toLowerCase();
        if (activeTheme === 'Heritage & UNESCO' && !group.includes('heritage') && !group.includes('unesco')) return false;
        if (activeTheme === 'Wildlife & Safari' && !group.includes('wildlife') && !group.includes('safari')) return false;
        if (activeTheme === 'Spiritual & Pilgrimage' && !group.includes('spiritual') && !group.includes('pilgrimage') && !group.includes('temple')) return false;
        if (activeTheme === 'Hill Stations & Nature' && !group.includes('hill') && !group.includes('nature') && !group.includes('mountain')) return false;
        if (activeTheme === 'Cultural & Food' && !group.includes('cultural') && !group.includes('food')) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (city.name || city.city_name || '').toLowerCase();
        const stateName = (city.state_name || city.state || '').toLowerCase();
        const group = (city.destination_group || '').toLowerCase();
        const attractions = (city.popular_attractions || []).join(' ').toLowerCase();
        return name.includes(q) || stateName.includes(q) || group.includes(q) || attractions.includes(q);
      }

      return true;
    });
  }, [enrichedCities, selectedState, selectedRegion, activeTheme, searchQuery, states]);

  const handleOpenGuide = (city: any) => {
    setActiveGuideCity(city);
    setGuideModalOpen(true);
  };

  const handleOpenInquiry = (destination: any) => {
    setTargetDestination(destination);
    setInquiryModalOpen(true);
  };

  const handleWhatsAppInquiry = (destination: any) => {
    const destName = destination.name || destination.city_name || destination.city;
    const stateName = destination.state_name || destination.state || '';
    const message = encodeURIComponent(`Hello Ghumo Firoo! 👋 I am exploring ${destName}${stateName ? ` in ${stateName}` : ''} on your India Explorer guide. Please share customized itinerary options, verified boutique hotels, and pricing quote.`);
    window.open(`https://wa.me/919910987264?text=${message}`, '_blank');
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter your full name and phone number.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingInquiry(true);
    try {
      const destName = targetDestination ? (targetDestination.name || targetDestination.city_name || targetDestination.city) : 'India Destination';
      const payload = {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        destination: destName,
        travel_date: travelDate,
        travelers: travelersCount,
        notes: customerNotes,
        source: 'India Explorer Customer Portal'
      };

      const res = await fetch(`${API_BASE}/api.php?table=leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({
          title: "Trip Inquiry Received! ✈️",
          description: `Thank you, ${customerName}! Our holiday specialist for ${destName} will connect with your custom itinerary proposal shortly.`,
        });
        setInquiryModalOpen(false);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setCustomerNotes('');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (err) {
      toast({
        title: "Inquiry Sent!",
        description: "Your inquiry has been received. Our team will contact you on WhatsApp / Phone.",
      });
      setInquiryModalOpen(false);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Explore India — 178+ Destinations | Ghumo Firoo"
        description="Comprehensive directory of 178+ Indian tourist destinations, UNESCO monuments, tiger safaris, spiritual circuits, and personalized holiday packages."
        keywords={['Explore India', 'India tourism guide', 'Madhya Pradesh destinations', 'Indore food trail', 'Khajuraho temples guide', 'Pench safari booking', 'custom tour packages India']}
      />

      {/* HERO SECTION WITH LIVE SEARCH */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-[#060913] via-[#0b1220] to-[#060913] text-white overflow-hidden border-b border-border/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,162,90,0.18),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10 text-center">
          <Badge className="bg-[#C9A25A]/20 text-[#C9A25A] border-[#C9A25A]/40 mb-4 px-3 py-1 font-bold text-xs uppercase tracking-widest">
            🇮🇳 Incredible India Tourism &amp; Holiday Directory
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black font-montserrat tracking-tight text-white mb-4 leading-tight">
            Discover India’s Hidden Wonders, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Monuments &amp; Experiential Journeys
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
            Browse through 178+ hand-curated Indian destinations across 28 states. Explore iconic UNESCO monuments, tiger safari zones, spiritual river ghats, and plan a tailor-made holiday with verified private transfers.
          </p>

          {/* MAIN PREDICTIVE SEARCH BAR */}
          <div className="max-w-3xl mx-auto bg-slate-900/95 border border-amber-500/40 backdrop-blur-xl p-2.5 md:p-3.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 bg-slate-800/90 rounded-xl border border-slate-700/60">
              <Search className="w-5 h-5 text-amber-400 shrink-0" />
              <Input
                placeholder="Search any destination, monument, safari or state (e.g. Indore, Khajuraho, Pench, Ujjain)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 bg-transparent border-0 text-white placeholder:text-slate-400 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-white font-bold">Clear</button>
              )}
            </div>

            {selectedState && (
              <Button
                variant="outline"
                onClick={() => setSelectedState(null)}
                className="h-11 border-amber-500/40 text-amber-300 bg-amber-500/15 text-xs font-extrabold rounded-xl shrink-0"
              >
                {selectedState.name || selectedState.state_name} ✕
              </Button>
            )}
          </div>

          {/* LIVE STATS HIGHLIGHT BAR */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8 text-xs font-semibold text-slate-400 border-t border-slate-800/80 pt-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span><strong>178+</strong> Verified Destinations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span><strong>500+</strong> Sightseeing Monuments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span><strong>28</strong> States &amp; UTs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span><strong>100%</strong> Customized Private Tours</span>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR TOURISM CIRCUITS BANNER */}
      <section className="py-10 bg-[#080d1a] border-b border-slate-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-6 text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#C9A25A] flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Curated Indian Holiday Circuits
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white font-montserrat mt-1">
              Explore by Travel Interest &amp; Circuit
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TOURISM_CIRCUITS.map((circuit) => (
              <div
                key={circuit.id}
                onClick={() => {
                  setSearchQuery(circuit.topDestinations[0]);
                  toast({
                    title: `Viewing ${circuit.name}`,
                    description: `Showing top destinations like ${circuit.topDestinations.join(', ')}.`
                  });
                }}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all cursor-pointer group shadow-lg text-left flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2">{circuit.icon}</div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors font-montserrat">
                    {circuit.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {circuit.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-amber-400">
                  <span>Top: {circuit.topDestinations.slice(0, 2).join(', ')}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN DESTINATIONS EXPLORER WORKSPACE */}
      <section className="py-12 bg-[#060913] text-slate-100 min-h-[700px]">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* REGION & THEME FILTERS TOOLBAR */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl mb-8 space-y-4 text-left">
            {/* Region Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Region:</span>
                {regions.map(reg => (
                  <button
                    key={reg}
                    onClick={() => { setSelectedRegion(reg); setSelectedState(null); }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      selectedRegion === reg
                        ? 'bg-[#C9A25A] text-slate-950 font-black shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                    }`}
                  >
                    {reg === 'All' ? 'All Regions' : `${reg} India`}
                  </button>
                ))}
              </div>

              {/* Theme Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Theme:</span>
                {themes.map(theme => (
                  <button
                    key={theme}
                    onClick={() => setActiveTheme(theme)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      activeTheme === theme
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* State Picker Strip */}
            <div className="border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" /> States in this category ({states.length}):
                </span>
                {selectedState && (
                  <button 
                    onClick={() => setSelectedState(null)} 
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    Show All States
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-amber-500/20">
                <button
                  onClick={() => setSelectedState(null)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    selectedState === null
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                  }`}
                >
                  All States
                </button>
                {states.map(state => {
                  const isSelected = selectedState?.id === state.id;
                  return (
                    <button
                      key={state.id}
                      onClick={() => setSelectedState(isSelected ? null : state)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                      }`}
                    >
                      <span>{state.name || state.state_name}</span>
                      {state.city_count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950 text-amber-400 font-bold' : 'bg-slate-900 text-slate-400'}`}>
                          {state.city_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DESTINATIONS GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-left">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-white font-montserrat flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  {selectedState ? `${selectedState.name || selectedState.state_name} Tourism Destinations` : 'All Indian Tourism Destinations'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredCities.length} verified tourism destinations with live attraction directories
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing Destination Directory from Database...</p>
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
                <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">No destinations found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try clearing your search query or switching to 'All' themes to explore all cities.
                </p>
                <Button
                  onClick={() => { setSearchQuery(''); setActiveTheme('All'); setSelectedState(null); setSelectedRegion('All'); }}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {filteredCities.map((city) => {
                  const cityName = city.name || city.city_name;
                  const stateName = city.state_name || city.state || '';
                  const attractions = city.popular_attractions || [];
                  const citySlug = (cityName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

                  return (
                    <Card 
                      key={city.id} 
                      className="border border-slate-800 bg-slate-900/90 hover:border-amber-500/50 transition-all duration-200 shadow-xl rounded-2xl flex flex-col justify-between overflow-hidden group"
                    >
                      <CardHeader className="p-5 border-b border-slate-800/80 bg-slate-850/60">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link to={`/explore-india/${citySlug}`} className="hover:underline">
                              <CardTitle className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors font-montserrat flex items-center gap-1.5">
                                {cityName}
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </CardTitle>
                            </Link>
                            <CardDescription className="text-xs text-amber-400 font-bold mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                              {stateName} · <span className="text-slate-300 font-semibold">{city.destination_group}</span>
                            </CardDescription>
                          </div>
                          {city.nearest_airport && (
                            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-extrabold shrink-0">
                              <Plane className="w-3 h-3 mr-1" /> Airport
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        {/* Attractions List */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Landmark className="w-3.5 h-3.5 text-amber-400" /> Must-Visit Attractions:
                          </span>
                          {attractions.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {attractions.slice(0, 4).map((att: string, i: number) => (
                                <span 
                                  key={i} 
                                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 font-medium"
                                >
                                  {att}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {city.description || `Explore cultural landmarks, local sightseeing, and nature experiences in ${cityName}.`}
                            </p>
                          )}
                        </div>

                        {/* Food & Best Season Strip */}
                        <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5 text-amber-300/90 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Best Time: <strong>{city.best_time_to_visit}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 font-medium truncate">
                            <Utensils className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            <span className="truncate">Food: {city.food_highlights[0]}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <Link to={`/explore-india/${citySlug}`} className="block w-full">
                            <Button
                              variant="secondary"
                              className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs h-8 rounded-xl gap-1.5 border border-slate-700/70"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" /> Explore {cityName} Guide &amp; Attractions ➔
                            </Button>
                          </Link>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              onClick={() => handleOpenInquiry(city)}
                              className="bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-black text-xs h-9 rounded-xl shadow-md gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Plan Trip
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleWhatsAppInquiry(city)}
                              className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold h-9 rounded-xl gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* COMPREHENSIVE EDITORIAL DESTINATION GUIDE & REGIONAL CIRCUITS */}
          <div className="mt-16 pt-12 border-t border-slate-800 text-left space-y-8">
            <div className="max-w-4xl space-y-4">
              <Badge className="bg-[#C9A25A]/20 text-[#C9A25A] border-[#C9A25A]/40 text-xs font-extrabold uppercase tracking-wider">
                Travel Guide &amp; Regional Directory
              </Badge>
              <h2 className="text-2xl md:text-3xl font-black text-white font-montserrat">
                Exploring India with Ghumo Firoo: A Curated Journey Across 178+ Destinations
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Welcome to Ghumo Firoo’s India Tourism Directory — your comprehensive portal to discovering 178+ celebrated holiday destinations, sacred pilgrimage circuits, wildlife tiger sanctuaries, and royal heritage monuments across 28 Indian states. India is a land of kaleidoscopic diversity where ancient heritage blends seamlessly with breathtaking natural landscapes. Whether you are seeking a spiritually transformative darshan at sacred Jyotirlingas, private tiger tracking drives in Madhya Pradesh, serene luxury houseboat cruises on Kerala backwaters, or walks along the shimmering white salt desert of the Rann of Kutch, Ghumo Firoo designs bespoke holiday packages tailored specifically to your pacing and preferences.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Unlike off-the-shelf group tour packages, every Ghumo Firoo journey features handpicked 4-star and 5-star boutique hotels, verified private chauffeur vehicles with all interstate taxes and tolls included, curated cultural experiences, and 24/7 dedicated on-trip concierge assistance to ensure complete peace of mind.
              </p>
            </div>

            {/* SIX SIGNATURE THEMES & REGIONAL CIRCUITS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <span className="text-xl">🛕</span> Sacred Pilgrimages &amp; Jyotirlingas
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Embark on sacred spiritual journeys across the revered <strong>Char Dham Yatra</strong> (Kedarnath, Badrinath, Gangotri, Yamunotri), holy Jyotirlinga shrines like <strong>Varanasi Kashi Vishwanath</strong>, <strong>Ujjain Mahakaleshwar</strong>, <strong>Omkareshwar</strong>, and <strong>Somnath</strong>, as well as Ayodhya Ram Mandir and Tirupati Balaji.
                </p>
                <Link to="/packages/char-dham-yatra" className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 pt-1">
                  View Char Dham Packages ➔
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <span className="text-xl">🏰</span> Royal Heritage &amp; UNESCO Palaces
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Immerse yourself in regal grandeur across Rajasthan’s Golden Triangle (<strong>Jaipur</strong>, <strong>Udaipur</strong>, <strong>Jodhpur</strong>, <strong>Jaisalmer</strong>), the iconic <strong>Agra Taj Mahal</strong>, the erotic stone sculptures of <strong>Khajuraho</strong>, and the ancient boulder ruins of <strong>Hampi</strong>.
                </p>
                <Link to="/explore-india/agra" className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 pt-1">
                  Explore Agra Guide ➔
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <span className="text-xl">🏔️</span> Himalayan Escapes &amp; Valleys
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Experience snow-capped peaks and serene valleys across <strong>Kashmir</strong> (Srinagar, Gulmarg, Pahalgam), the high-altitude moonscapes of <strong>Ladakh</strong>, and lush hill retreats in <strong>Manali</strong>, <strong>Shimla</strong>, <strong>Dharamshala</strong>, and <strong>Nainital</strong>.
                </p>
                <Link to="/packages" className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 pt-1">
                  Browse Mountain Packages ➔
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <span className="text-xl">🌴</span> Beaches, Lagoons &amp; Backwaters
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unwind along the palm-fringed coastlines of <strong>Goa</strong>, cruise emerald lagoons aboard luxury private houseboats in <strong>Alleppey &amp; Kumarakom</strong>, or dive into crystal-clear waters in the <strong>Andaman &amp; Nicobar Islands</strong>.
                </p>
                <Link to="/explore-india/goa" className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 pt-1">
                  Explore Goa Beach Guide ➔
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <span className="text-xl">🐅</span> Wilderness Safaris &amp; Tiger Reserves
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track Bengal tigers and Asiatic lions with guaranteed jeep safari permits across <strong>Jim Corbett</strong>, <strong>Ranthambore</strong>, <strong>Gir National Park</strong>, <strong>Bandhavgarh</strong>, and <strong>Kanha</strong> with expert local naturalists.
                </p>
                <Link to="/packages" className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 pt-1">
                  Explore Safari Holidays ➔
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <span className="text-xl">✨</span> Desert Festivals &amp; Cultural Trails
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Walk the mesmerizing white salt desert of Dhordo during <strong>Rann Utsav</strong> with official booking partner Evoke Tent City Dhordo, explore Harappan ruins at <strong>Dholavira</strong>, and discover the royal palaces of <strong>Bhuj &amp; Mandvi</strong>.
                </p>
                <Link to="/packages/rann-utsav" className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 pt-1">
                  Book Rann Utsav Packages ➔
                </Link>
              </div>
            </div>
          </div>

          {/* TRAVEL PLANNING TIPS & WHY CHOOSE US */}
          <div className="mt-16 pt-12 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white font-montserrat">100% Verified Local Suppliers</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Every hotel, safari permit, and chauffeur cab is verified by our destination specialists to guarantee safety and luxury.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="p-3 bg-blue-500/15 text-blue-400 rounded-xl w-fit">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white font-montserrat">Custom Day-Wise Itineraries</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Tailor your holiday pace with flexible sightseeing, private jungle safari drives, and unique cultural experiences.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl w-fit">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white font-montserrat">24x7 Dedicated On-Trip Concierge</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Enjoy hassle-free travel with a personal trip manager assisting you from airport pickup until your return flight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE DESTINATION TRAVEL GUIDE MODAL */}
      {activeGuideCity && (
        <Dialog open={guideModalOpen} onOpenChange={setGuideModalOpen}>
          <DialogContent className="sm:max-w-2xl bg-slate-900 border-amber-500/40 text-white max-h-[85vh] overflow-y-auto">
            <DialogHeader className="text-left border-b border-slate-800 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <DialogTitle className="text-lg font-black text-white font-montserrat flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-400" />
                    {activeGuideCity.name || activeGuideCity.city_name} Complete Travel Guide
                  </DialogTitle>
                  <DialogDescription className="text-xs text-amber-400 font-bold mt-1">
                    {activeGuideCity.state_name || activeGuideCity.state} · {activeGuideCity.destination_group}
                  </DialogDescription>
                </div>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold shrink-0">
                  Ideal: {activeGuideCity.ideal_duration}
                </Badge>
              </div>
            </DialogHeader>

            <Tabs defaultValue="attractions" className="w-full mt-2 text-left">
              <TabsList className="bg-slate-800 border border-slate-700 p-1 rounded-xl w-full justify-start overflow-x-auto">
                <TabsTrigger value="attractions" className="text-xs font-bold">🏛️ Top Sightseeings</TabsTrigger>
                <TabsTrigger value="itinerary" className="text-xs font-bold">📅 Sample Itinerary</TabsTrigger>
                <TabsTrigger value="food" className="text-xs font-bold">🍲 Food Trails</TabsTrigger>
                <TabsTrigger value="transit" className="text-xs font-bold">✈️ How to Reach</TabsTrigger>
              </TabsList>

              {/* Attractions Tab */}
              <TabsContent value="attractions" className="mt-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Key Monuments &amp; Sightseeing Highlights
                </h4>
                <div className="space-y-2">
                  {(activeGuideCity.popular_attractions || []).map((att: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{att}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Must-visit landmark in {activeGuideCity.name || activeGuideCity.city_name}. Recommended duration: 2-3 hours.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Sample Itinerary Tab */}
              <TabsContent value="itinerary" className="mt-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Suggested 3D/2N Holiday Schedule
                </h4>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="text-xs font-black text-amber-400">Day 1: Arrival &amp; Heritage Walk</div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Arrive at airport/railway station. Private transfer to hotel. Post lunch, visit {(activeGuideCity.popular_attractions || [])[0] || 'local landmarks'}. Evening culinary street food experience.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="text-xs font-black text-amber-400">Day 2: Full-Day Exploration &amp; Experiences</div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Morning visit to {(activeGuideCity.popular_attractions || [])[1] || 'scenic spots'}. Afternoon excursion to {(activeGuideCity.popular_attractions || [])[2] || 'surrounding temples & nature points'}. Sunset viewpoints &amp; souvenir shopping.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="text-xs font-black text-amber-400">Day 3: Leisure &amp; Departure Transfer</div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Breakfast at hotel. Visit {(activeGuideCity.popular_attractions || [])[3] || 'local markets'}. Check-out and assisted transfer to airport/station.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Food Tab */}
              <TabsContent value="food" className="mt-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Must-Try Culinary Specialties
                </h4>
                <div className="space-y-2">
                  {(activeGuideCity.food_highlights || []).map((food: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
                      <Utensils className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-200">{food}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* How to Reach Tab */}
              <TabsContent value="transit" className="mt-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Travel &amp; Connectivity Guidelines
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                      <Plane className="w-4 h-4" /> Nearest Airport
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">{activeGuideCity.nearest_airport}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
                      <Train className="w-4 h-4" /> Railway Connectivity
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">{activeGuideCity.nearest_railway}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                    <Sun className="w-4 h-4" /> Best Travel Months
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">{activeGuideCity.best_time_to_visit}</p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleWhatsAppInquiry(activeGuideCity)}
                className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold h-9 rounded-xl gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> Ask on WhatsApp
              </Button>
              <Button
                onClick={() => {
                  setGuideModalOpen(false);
                  handleOpenInquiry(activeGuideCity);
                }}
                className="bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-black text-xs h-9 rounded-xl shadow-md gap-1"
              >
                <Sparkles className="w-4 h-4" /> Get Custom Quote for {activeGuideCity.name || activeGuideCity.city_name}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* TRIP PLANNER INQUIRY MODAL */}
      <Dialog open={inquiryModalOpen} onOpenChange={setInquiryModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-white font-montserrat">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Plan a Custom Tour to {targetDestination ? (targetDestination.name || targetDestination.city_name || targetDestination.city) : 'India'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 font-medium">
              Fill in your trip details and our destination experts will craft a personalized day-by-day itinerary with verified hotels &amp; transfers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitInquiry} className="space-y-3 pt-2 text-left">
            <div>
              <Label className="text-xs text-slate-300 font-bold">Your Full Name *</Label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-9 text-xs bg-slate-800 border-slate-700 text-white mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-slate-300 font-bold">Phone / WhatsApp *</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-white mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300 font-bold">Email Address</Label>
                <Input
                  type="email"
                  placeholder="rahul@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-slate-300 font-bold">Tentative Travel Date</Label>
                <Input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300 font-bold">Number of Travelers</Label>
                <Input
                  type="number"
                  min="1"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-300 font-bold">Preferences / Places of Interest</Label>
              <Textarea
                placeholder="e.g. Interested in tiger safari, 4-star boutique resort, 3 Days / 2 Nights..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="text-xs bg-slate-800 border-slate-700 text-white mt-1 min-h-[60px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setInquiryModalOpen(false)} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submittingInquiry} className="bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-bold">
                {submittingInquiry ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Request Custom Itinerary'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
