import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { SectionHeading } from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MASTER_DESTINATIONS } from '@/data/masterDestinations';
import { 
  MapPin, Search, ArrowRight, Sparkles, Globe, Compass, 
  Clock, Plane, Calendar, Phone, MessageCircle, CheckCircle2,
  ChevronRight, Filter, Landmark, Trees, ShieldCheck, Heart,
  ArrowLeft, Share2, Eye, Star, Loader2, IndianRupee
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

export default function PublicIndiaExplorer() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<any | null>(null);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTheme, setActiveTheme] = useState<string>('All');

  // Lead Modal States
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [targetDestination, setTargetDestination] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelersCount, setTravelersCount] = useState('2');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/get_india_tourism.php?action=baseline`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStates(data.states || []);
          setCities(data.cities || []);
        }
      })
      .catch(err => console.error("Error loading baseline tourism data:", err))
      .finally(() => setLoading(false));
  }, []);

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

  // Enriched cities dataset
  const enrichedCities = useMemo(() => {
    return cities.map(c => {
      const cName = (c.name || c.city_name || '').toLowerCase().trim();
      const matched = MASTER_DESTINATIONS.find(d => 
        d.city.toLowerCase().includes(cName) || cName.includes(d.city.toLowerCase())
      );
      return {
        ...c,
        matched,
        destination_group: matched?.destination_group || 'Leisure & Sightseeing',
        popular_attractions: matched?.popular_attractions || [],
        nearest_airport: matched?.nearest_airport || (c.has_airport === 1 ? 'Local Airport Available' : ''),
        nearest_railway: matched?.nearest_railway || '',
        best_time_to_visit: c.best_time_to_visit || 'October to March'
      };
    });
  }, [cities]);

  // Filtered cities list
  const filteredCities = useMemo(() => {
    return enrichedCities.filter(city => {
      if (selectedState && !isCityInState(city, selectedState)) return false;
      
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
  }, [enrichedCities, selectedState, activeTheme, searchQuery]);

  const handleOpenInquiry = (destination: any) => {
    setTargetDestination(destination);
    setInquiryModalOpen(true);
  };

  const handleWhatsAppInquiry = (destination: any) => {
    const destName = destination.name || destination.city_name || destination.city;
    const stateName = destination.state_name || destination.state || '';
    const message = encodeURIComponent(`Hello Ghumo Firoo! 👋 I am interested in planning a custom tour to ${destName}${stateName ? ` in ${stateName}` : ''}. Please share customized itinerary options, hotel choices, and price quote.`);
    window.open(`https://wa.me/919904455888?text=${message}`, '_blank');
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
        source: 'India Explorer Search Engine'
      };

      const res = await fetch(`${API_BASE}/api.php?table=leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({
          title: "Inquiry Received! ✈️",
          description: `Thank you, ${customerName}! Our destination specialist for ${destName} will connect with your customized itinerary shortly.`,
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
        title="Explore India Destinations — Search Monuments, Attractions & Custom Itineraries | Ghumo Firoo"
        description="Discover 178+ Indian tourism destinations, iconic UNESCO monuments, wildlife safaris, and spiritual circuits. Plan your custom day-by-day tour with Ghumo Firoo."
        keywords={['India destinations', 'Madhya Pradesh tourism', 'Rajasthan tours', 'Khajuraho temples', 'Indore food tour', 'Pench safari', 'custom India tour packages']}
      />

      {/* HERO SEARCH ENGINE HEADER */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-[#090d16] via-[#0e1626] to-[#090d16] text-white overflow-hidden border-b border-border/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,162,90,0.15),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10 text-center">
          <Badge className="bg-[#C9A25A]/20 text-[#C9A25A] border-[#C9A25A]/40 mb-4 px-3 py-1 font-bold text-xs uppercase tracking-widest">
            🇮🇳 Incredible India Destination Explorer
          </Badge>
          
          <h1 className="text-3xl md:text-5xl font-black font-montserrat tracking-tight text-white mb-4">
            Discover India’s Top Destinations, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              Monuments &amp; Experiences
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            Search 178+ hand-picked cities across Indian states. Explore sightseeing spots, best travel months, wildlife safaris, and plan a bespoke holiday.
          </p>

          {/* MAIN SEARCH BAR */}
          <div className="max-w-3xl mx-auto bg-slate-900/90 border border-amber-500/30 backdrop-blur-xl p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 bg-slate-800/80 rounded-xl border border-slate-700/50">
              <Search className="w-5 h-5 text-amber-400 shrink-0" />
              <Input
                placeholder="Search city, monument, wildlife park (e.g. Indore, Khajuraho, Pench, Taj Mahal)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 bg-transparent border-0 text-white placeholder:text-slate-400 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-white">Clear</button>
              )}
            </div>

            {selectedState && (
              <Button
                variant="outline"
                onClick={() => setSelectedState(null)}
                className="h-11 border-amber-500/40 text-amber-300 bg-amber-500/10 text-xs font-bold rounded-xl"
              >
                Clear State: {selectedState.name || selectedState.state_name} ✕
              </Button>
            )}
          </div>

          {/* THEME FILTER PILLS */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            {themes.map(theme => (
              <button
                key={theme}
                onClick={() => setActiveTheme(theme)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTheme === theme
                    ? 'bg-[#C9A25A] text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border border-slate-700/50'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORER WORKSPACE BODY */}
      <section className="py-12 bg-[#090d16] text-slate-100 min-h-[600px]">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* STATE BROWSER STRIP */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" /> Filter by Indian State ({states.length})
              </span>
              {selectedState && (
                <button 
                  onClick={() => setSelectedState(null)} 
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  View All States
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/20">
              <button
                onClick={() => setSelectedState(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedState === null
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                }`}
              >
                All India
              </button>
              {states.map(state => {
                const isSelected = selectedState?.id === state.id;
                return (
                  <button
                    key={state.id}
                    onClick={() => setSelectedState(isSelected ? null : state)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    <span>{state.name || state.state_name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400'}`}>
                      {state.city_count || ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESTINATIONS GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-white font-montserrat flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  {selectedState ? `${selectedState.name || selectedState.state_name} Destinations` : 'All Indian Destinations'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredCities.length} tourism destinations matching your criteria
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Indian Destinations Directory...</p>
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
                <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">No destinations found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try clearing your search query or switching to 'All' themes to view all cities.
                </p>
                <Button
                  onClick={() => { setSearchQuery(''); setActiveTheme('All'); setSelectedState(null); }}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCities.map((city) => {
                  const cityName = city.name || city.city_name;
                  const stateName = city.state_name || city.state || '';
                  const attractions = city.popular_attractions || [];

                  return (
                    <Card 
                      key={city.id} 
                      className="border border-slate-800 bg-slate-900/90 hover:border-amber-500/50 transition-all duration-200 shadow-xl rounded-2xl flex flex-col justify-between overflow-hidden group"
                    >
                      <CardHeader className="p-5 border-b border-slate-800/80 bg-slate-850/60">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors font-montserrat">
                              {cityName}
                            </CardTitle>
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
                            <Landmark className="w-3.5 h-3.5 text-amber-400" /> Must-Visit Highlights:
                          </span>
                          {attractions.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {attractions.map((att: string, i: number) => (
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

                        {/* Transit & Season Strip */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>Best: <strong>{city.best_time_to_visit}</strong></span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                          <Button
                            onClick={() => handleOpenInquiry(city)}
                            className="bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-extrabold text-xs h-9 rounded-xl shadow-md gap-1"
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
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

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
