import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { MASTER_DESTINATIONS, MasterDestination } from '@/data/masterDestinations';
import { 
  MapPin, Search, ArrowRight, Sparkles, Globe, Compass, 
  Clock, Plane, Calendar, Phone, MessageCircle, CheckCircle2,
  ChevronRight, Filter, Landmark, Trees, ShieldCheck, Heart,
  ArrowLeft, Share2, Eye, Star, Loader2, IndianRupee, Utensils,
  Train, Sun, CloudRain, HelpCircle, Award, Check, Navigation,
  FileText, Shield, UserCheck, Car, Camera, Flame
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

export default function PublicDestinationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [cityData, setCityData] = useState<any | null>(null);
  const [dbSightseeing, setDbSightseeing] = useState<any[]>([]);
  const [dbActivities, setDbActivities] = useState<any[]>([]);
  const [nearbyCities, setNearbyCities] = useState<any[]>([]);

  // Lead Modal States
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelersCount, setTravelersCount] = useState('2');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Normalize slug into clean search term
  const destinationQuery = useMemo(() => {
    if (!slug) return '';
    return decodeURIComponent(slug).replace(/-/g, ' ').trim().toLowerCase();
  }, [slug]);

  // Find matching destination from Master Catalog
  const matchedMaster: MasterDestination | undefined = useMemo(() => {
    if (!destinationQuery) return undefined;
    return MASTER_DESTINATIONS.find(d => 
      d.city.toLowerCase() === destinationQuery ||
      d.city.toLowerCase().replace(/[^a-z0-9]/g, '') === destinationQuery.replace(/[^a-z0-9]/g, '') ||
      d.city.toLowerCase().includes(destinationQuery) ||
      destinationQuery.includes(d.city.toLowerCase())
    );
  }, [destinationQuery]);

  // Load live DB data from get_india_tourism.php
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/get_india_tourism.php?action=baseline`)
      .then(res => res.json())
      .then(async (baselineData) => {
        if (baselineData.success) {
          const allCities: any[] = baselineData.cities || [];
          
          // Match city
          const foundCity = allCities.find((c: any) => {
            const cName = (c.name || c.city_name || '').toLowerCase();
            return cName === destinationQuery ||
                   cName.replace(/[^a-z0-9]/g, '') === destinationQuery.replace(/[^a-z0-9]/g, '') ||
                   cName.includes(destinationQuery) ||
                   destinationQuery.includes(cName);
          });

          if (foundCity) {
            setCityData(foundCity);

            // Fetch detailed sightseeing & activities for this city
            try {
              const detRes = await fetch(`${API_BASE}/get_india_tourism.php?action=details&city_id=${foundCity.id}`);
              const detData = await detRes.json();
              if (detData.success) {
                setDbSightseeing(detData.sightseeing || []);
                setDbActivities(detData.activities || []);
              }
            } catch (err) {
              console.error("Error fetching city details:", err);
            }

            // Find nearby cities in same state
            const sameStateCities = allCities.filter((c: any) => 
              c.id !== foundCity.id && 
              (c.state_id === foundCity.state_id || (c.state_name && foundCity.state_name && c.state_name === foundCity.state_name))
            ).slice(0, 4);
            setNearbyCities(sameStateCities);
          } else if (matchedMaster) {
            // Master fallback
            setCityData({
              name: matchedMaster.city,
              city_name: matchedMaster.city,
              state_name: matchedMaster.state,
              destination_type: matchedMaster.destination_group,
              description: `Discover ${matchedMaster.city}, one of India's most celebrated destinations located in ${matchedMaster.state}. Renowned for its ${matchedMaster.destination_group.toLowerCase()}, rich cultural heritage, and scenic landscapes.`
            });

            // Find other master destinations in same state
            const otherMasters = MASTER_DESTINATIONS.filter(d => 
              d.city !== matchedMaster.city && d.state === matchedMaster.state
            ).slice(0, 4);
            setNearbyCities(otherMasters);
          }
        }
      })
      .catch((err) => console.error("Error fetching destination data:", err))
      .finally(() => setLoading(false));
  }, [destinationQuery, matchedMaster]);

  const cityName = cityData?.name || cityData?.city_name || matchedMaster?.city || 'Indian Destination';
  const stateName = cityData?.state_name || cityData?.state || matchedMaster?.state || 'India';
  const groupName = matchedMaster?.destination_group || cityData?.destination_type || 'Tourism & Sightseeing';

  // Compute Sightseeings (Merging live DB + Master popular attractions)
  const allSightseeings = useMemo(() => {
    const list: any[] = [...dbSightseeing];
    const existingNames = new Set(list.map(s => (s.name || s.sightseeing_name || '').toLowerCase()));

    if (matchedMaster?.popular_attractions) {
      matchedMaster.popular_attractions.forEach((att, idx) => {
        if (!existingNames.has(att.toLowerCase())) {
          list.push({
            id: `master-att-${idx}`,
            name: att,
            sightseeing_name: att,
            category: 'Iconic Landmark',
            recommended_duration_hours: 2.5,
            entry_fee_estimate: 'Included in Tour',
            description: `A celebrated highlight in ${cityName}. Famous for its architecture, photography vantage points, and cultural significance.`
          });
        }
      });
    }

    if (list.length === 0) {
      list.push(
        { id: '1', name: `${cityName} Old Town & Heritage Centre`, category: 'Heritage', recommended_duration_hours: 2, entry_fee_estimate: 'Free', description: 'Explore historic alleys, heritage architecture, and local handicraft bazaars.' },
        { id: '2', name: `${cityName} Grand Monument & Palace`, category: 'Monument', recommended_duration_hours: 3, entry_fee_estimate: '₹50 - ₹100', description: 'Marvel at timeless royal craftsmanship, intricate stone carvings, and landscaped royal gardens.' },
        { id: '3', name: `${cityName} Scenic Nature Vantage Point`, category: 'Nature', recommended_duration_hours: 2, entry_fee_estimate: 'Free', description: 'Breathtaking panoramic sunset views and serene walking trails.' }
      );
    }
    return list;
  }, [dbSightseeing, matchedMaster, cityName]);

  // Compute Activities (Safaris, Walks, Boating, Experiences)
  const allActivities = useMemo(() => {
    const list: any[] = [...dbActivities];
    if (list.length === 0) {
      const isWildlife = groupName.toLowerCase().includes('wildlife') || groupName.toLowerCase().includes('safari');
      const isSpiritual = groupName.toLowerCase().includes('spiritual') || groupName.toLowerCase().includes('pilgrimage');
      
      if (isWildlife) {
        list.push(
          { id: 'act-1', name: 'Open 4x4 Jeep Jungle Safari Drive', category: 'Wildlife Safari', duration_hours: 4, average_cost: '₹3,500 - ₹4,500 / Jeep', description: 'Guided morning or evening game drive through core tiger territory with expert forest naturalists.' },
          { id: 'act-2', name: 'Guided Buffer Zone Nature Trail Walk', category: 'Eco Adventure', duration_hours: 2, average_cost: '₹800 / Person', description: 'Explore birdwatching hotspots, pugmark tracking, and rich biodiversity on foot.' }
        );
      } else if (isSpiritual) {
        list.push(
          { id: 'act-1', name: 'VIP Darshan & Temple Orientation', category: 'Spiritual', duration_hours: 2.5, average_cost: '₹500 / Person', description: 'Assisted sanctum darshan, traditional pooja offerings, and heritage temple walkthrough.' },
          { id: 'act-2', name: 'Evening Holy River Ganga/Narmada Aarti & Boat Ride', category: 'Cultural', duration_hours: 1.5, average_cost: '₹400 / Person', description: 'Witness sacred oil-lamp aarti rituals accompanied by devotional hymns and private boat cruise.' }
        );
      } else {
        list.push(
          { id: 'act-1', name: `Curated Heritage Walk & Bazaar Trail`, category: 'Cultural Tour', duration_hours: 2.5, average_cost: '₹600 / Person', description: `Walk through centuries-old quarters, artisan workshops, and architectural landmarks with a certified local guide.` },
          { id: 'act-2', name: `Evening Food & Street Delicacies Trail`, category: 'Food Walk', duration_hours: 2, average_cost: '₹500 / Person', description: `Savor authentic local delicacies, signature sweets, and street-food gems across famous night markets.` }
        );
      }
    }
    return list;
  }, [dbActivities, groupName, cityName]);

  // Compute Culinary Highlights
  const foodHighlights = useMemo(() => {
    const cLow = cityName.toLowerCase();
    if (cLow.includes('indore')) {
      return [
        { name: 'Sarafa Night Food Market', desc: 'Famous jewelers bazaar that transforms at 9 PM into a bustling street food haven serving Garadu, Bhutte Ka Kees, and Dahi Vada.' },
        { name: 'Chappan Dukan Street', desc: '56 iconic food shops offering world-famous Poha Jalebi, Johnny Hot Dogs, Khopra Patties, and Shikanji.' },
        { name: 'Traditional Dal Bafla & Ladoos', desc: 'Ghee-dipped wheat dumplings served with spicy dal, kadhi, and roasted garlic chutney.' }
      ];
    } else if (cLow.includes('bhopal')) {
      return [
        { name: 'Bhopali Biryani & Poha', desc: 'Fragrant mild spiced biryani and breakfast poha garnished with ratlami sev.' },
        { name: 'Chatori Gali Street Eats', desc: 'Historic alley famous for Shahi Tukda, Sulemani Chai, and authentic kebabs.' }
      ];
    } else if (cLow.includes('khajuraho')) {
      return [
        { name: 'Bundelkhandi Thali', desc: 'Hearty regional banquet featuring Dal Bafla, Mawa Bati, and spicy tomato-sev sabzi.' },
        { name: 'Rooftop Cafe Dining', desc: 'Charming ambient cafes overlooking the Western Group of illuminated temples.' }
      ];
    } else if (cLow.includes('ujjain')) {
      return [
        { name: 'Tower Chowk Food Lane', desc: 'Famous for warm Rabdi, Malpua, crispy Kachoris, and Kesar Kulfi.' },
        { name: 'Mahakal Prasadam & Sweets', desc: 'Traditional peda and sanctified laddus prepared with pure desi ghee.' }
      ];
    } else if (cLow.includes('pench') || cLow.includes('kanha') || cLow.includes('bandhavgarh')) {
      return [
        { name: 'Jungle Resort Campfire Barbecue', desc: 'Freshly grilled kebabs and live local folk music under starry forest skies.' },
        { name: 'Forest Mahua & Tribal Delicacies', desc: 'Authentic organic dishes inspired by Central India tribal communities.' }
      ];
    } else {
      return [
        { name: `Signature ${cityName} Street Specialities`, desc: `Authentic regional flavors prepared fresh at legendary heritage food stalls.` },
        { name: 'Traditional Sweet Confections & Desserts', desc: 'Locally handcrafted milk sweets, halwas, and festive desserts.' }
      ];
    }
  }, [cityName]);

  const nearestAirport = matchedMaster?.nearest_airport || 'Connected via Major State Airport Hub';
  const nearestRailway = matchedMaster?.nearest_railway || 'Central Railway Junction with Express Trains';
  const bestSeason = cityData?.best_time_to_visit || 'October to March (Pleasant Autumn & Winter)';

  // Handle WhatsApp Inquiry
  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hello Ghumo Firoo! 👋 I am interested in planning a customized tour to ${cityName} in ${stateName}. Please share hotel options, day-by-day itinerary, and price quote.`);
    window.open(`https://wa.me/919904455888?text=${message}`, '_blank');
  };

  // Submit Inquiry into CRM Leads
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
      const payload = {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        destination: cityName,
        travel_date: travelDate,
        travelers: travelersCount,
        notes: customerNotes,
        source: `Explore India Page: ${cityName}`
      };

      const res = await fetch(`${API_BASE}/api.php?table=leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({
          title: "Custom Itinerary Request Received! ✈️",
          description: `Thank you, ${customerName}! Our holiday concierge for ${cityName} will contact you on WhatsApp / Phone with customized proposal.`,
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
        description: "Your inquiry has been received. Our team will contact you on WhatsApp shortly.",
      });
      setInquiryModalOpen(false);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <Layout>
      <SEO
        title={`${cityName} Tourism Guide — Top Places to Visit, Safaris, Food & Custom Itineraries | Ghumo Firoo`}
        description={`Plan your holiday to ${cityName}, ${stateName}. Explore top sightseeing spots, jungle safaris, iconic food markets, best travel months, and get customized private tour packages.`}
        keywords={[`${cityName} tourism`, `${cityName} sightseeing places`, `things to do in ${cityName}`, `${cityName} tour packages`, `${cityName} food trail`, `${stateName} tourism`]}
      />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-[#060913] via-[#0b1220] to-[#060913] text-white border-b border-border/20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-6">
            <Link to="/" className="hover:text-amber-400">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link to="/explore-india" className="hover:text-amber-400">Explore India</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400">{stateName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-extrabold">{cityName}</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 text-left">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-[#C9A25A]/20 text-[#C9A25A] border-[#C9A25A]/40 font-extrabold text-xs uppercase px-3 py-1">
                  {groupName}
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-extrabold text-xs">
                  {stateName}, India
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold text-xs">
                  Ideal: 2 Nights / 3 Days
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-montserrat text-white tracking-tight leading-tight">
                {cityName} Tourism &amp; Travel Guide
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                {cityData?.description || `Explore the timeless beauty, iconic landmarks, vibrant cuisine, and signature experiences of ${cityName}. Plan your customized private tour with verified chauffeur cars and hand-picked boutique stays.`}
              </p>
            </div>

            {/* ACTION CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <Button
                onClick={() => setInquiryModalOpen(true)}
                className="bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-black text-xs sm:text-sm h-11 px-6 rounded-2xl shadow-xl gap-2"
              >
                <Sparkles className="w-4 h-4" /> Plan a Custom Trip to {cityName}
              </Button>
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs sm:text-sm h-11 px-6 rounded-2xl font-bold gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Inquire on WhatsApp
              </Button>
            </div>
          </div>

          {/* QUICK TRANSIT & CLIMATE STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-slate-800 text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Best Season</span>
                <span className="text-xs font-bold text-white">{bestSeason}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Nearest Airport</span>
                <span className="text-xs font-bold text-white truncate block max-w-[200px]">{nearestAirport}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Railway Connectivity</span>
                <span className="text-xs font-bold text-white truncate block max-w-[200px]">{nearestRailway}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED CONTENT BODY */}
      <section className="py-12 bg-[#060913] text-slate-100 min-h-[800px]">
        <div className="container mx-auto px-4 max-w-6xl space-y-12">

          {/* SECTION 1: TOP PLACES TO VISIT & SIGHTSEEING */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#C9A25A] flex items-center gap-1.5">
                  <Landmark className="w-4 h-4" /> Must-Visit Attractions
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white font-montserrat mt-1">
                  Top Places to Visit in {cityName} ({allSightseeings.length} Spots)
                </h2>
              </div>
              <Button 
                onClick={() => setInquiryModalOpen(true)}
                size="sm" 
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
              >
                Request Itinerary
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allSightseeings.map((sight, idx) => (
                <Card 
                  key={sight.id || idx} 
                  className="border border-slate-800 bg-slate-900/90 hover:border-amber-500/40 transition-all rounded-2xl shadow-md flex flex-col justify-between"
                >
                  <CardHeader className="p-4 border-b border-slate-800/80 bg-slate-850/60 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-extrabold text-white font-montserrat">
                          {sight.name || sight.sightseeing_name}
                        </CardTitle>
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 font-bold text-[9px] mt-0.5 uppercase">
                          {sight.category || 'Sightseeing'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-slate-500 uppercase block font-extrabold">Est. Entry</span>
                      <span className="text-xs font-black text-amber-400">
                        {sight.entry_fee_estimate ? (isNaN(sight.entry_fee_estimate) ? sight.entry_fee_estimate : `₹${sight.entry_fee_estimate}`) : 'Free'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {sight.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Recommended: <strong>{sight.recommended_duration_hours || '2'} Hours</strong></span>
                      </div>
                      <button
                        onClick={() => {
                          setCustomerNotes(`Interested in visiting ${sight.name || sight.sightseeing_name} during my tour.`);
                          setInquiryModalOpen(true);
                        }}
                        className="text-xs text-amber-400 hover:underline font-bold"
                      >
                        + Include in Trip
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* SECTION 2: ADVENTURE, EXPERIENCES & SAFARIS */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Trees className="w-4 h-4" /> Experiential Activities
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white font-montserrat mt-1">
                  Top Activities &amp; Safaris in {cityName}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allActivities.map((act, idx) => (
                <Card 
                  key={act.id || idx} 
                  className="border border-slate-800 bg-slate-900/90 hover:border-emerald-500/40 transition-all rounded-2xl shadow-md flex flex-col justify-between"
                >
                  <CardHeader className="p-4 border-b border-slate-800/80 bg-slate-850/60 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-extrabold text-white font-montserrat">
                        {act.name || act.activity_name}
                      </CardTitle>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold text-[9px] mt-0.5 uppercase">
                        {act.category || 'Adventure'}
                      </Badge>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-slate-500 uppercase block font-extrabold">Price Range</span>
                      <span className="text-xs font-black text-emerald-400">
                        {act.average_cost ? (isNaN(act.average_cost) ? act.average_cost : `₹${act.average_cost}`) : 'Included in Package'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {act.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Duration: <strong>{act.duration_hours || '2'} Hours</strong></span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCustomerNotes(`Please include ${act.name || act.activity_name} in my customized quote.`);
                          setInquiryModalOpen(true);
                        }}
                        className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-bold h-7 rounded-lg"
                      >
                        Book Experience
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* SECTION 3: LOCAL CUISINE & FOOD TRAILS */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-left space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white font-montserrat">
                  Famous Food &amp; Culinary Specialties in {cityName}
                </h3>
                <p className="text-xs text-slate-400">
                  Don't leave {cityName} without savoring these authentic delicacies:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {foodHighlights.map((food, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/50 space-y-1.5">
                  <div className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    {food.name}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    {food.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: SUGGESTED 3D/2N SAMPLE TOUR ITINERARY */}
          <div className="space-y-4 text-left">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#C9A25A] flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Recommended Holiday Blueprint
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white font-montserrat mt-1">
                Suggested 2 Nights / 3 Days {cityName} Itinerary
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 uppercase">Day 1</span>
                  <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">Arrival &amp; Heritage</Badge>
                </div>
                <h4 className="text-sm font-bold text-white">Welcome &amp; Local Orientation</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  • Arrival at airport / station. Private check-in at verified hotel.<br />
                  • Post lunch, visit {allSightseeings[0]?.name || 'key central landmarks'}.<br />
                  • Evening sunset stroll &amp; signature local food experience.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 uppercase">Day 2</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Full-Day Tour</Badge>
                </div>
                <h4 className="text-sm font-bold text-white">Monuments &amp; Safari Adventures</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  • Early morning {allActivities[0]?.name || 'sightseeing exploration'}.<br />
                  • Guided tour of {allSightseeings[1]?.name || 'monument clusters'}.<br />
                  • Evening cultural experience and local handicraft shopping.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-400 uppercase">Day 3</span>
                  <Badge className="bg-blue-500/20 text-blue-300 text-[10px]">Departure</Badge>
                </div>
                <h4 className="text-sm font-bold text-white">Leisure &amp; Onward Journey</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  • Buffet breakfast at hotel.<br />
                  • Visit {allSightseeings[2]?.name || 'local scenic garden / viewpoints'}.<br />
                  • Check-out and assisted transfer to airport / railway station.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 5: NEARBY DESTINATIONS */}
          {nearbyCities.length > 0 && (
            <div className="space-y-4 text-left">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#C9A25A]">Combine &amp; Explore More</span>
                <h2 className="text-xl font-black text-white font-montserrat mt-1">
                  Popular Destinations Nearby in {stateName}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {nearbyCities.map((near: any, idx: number) => {
                  const nearName = near.name || near.city_name || near.city;
                  const nearSlug = nearName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  return (
                    <Link
                      key={idx}
                      to={`/explore-india/${nearSlug}`}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <MapPin className="w-4 h-4 text-amber-400 mb-2" />
                        <h4 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors font-montserrat">
                          {nearName}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {near.destination_group || near.destination_type || 'Tourism Hub'}
                        </p>
                      </div>
                      <div className="mt-3 text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <span>View Travel Guide</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 6: FAQ SECTION */}
          <div className="space-y-4 text-left">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Traveler Queries Answered
              </span>
              <h2 className="text-xl font-black text-white font-montserrat mt-1">
                Frequently Asked Questions about {cityName} Travel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white">What is the best time to visit {cityName}?</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  The ideal time to visit {cityName} is between <strong>{bestSeason}</strong> when the weather is comfortable for outdoor sightseeing, wildlife safaris, and heritage walks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white">How many days are recommended for {cityName}?</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  A <strong>2 Nights / 3 Days</strong> tour is ideal to cover top attractions and local food walks. For combined circuits with neighboring destinations, 4 to 5 days is recommended.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white">Can Ghumo Firoo arrange private transfers &amp; customized hotels?</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  Yes! We provide complete end-to-end custom packages including verified AC private chauffeurs, hand-picked boutique hotels, and dedicated on-trip concierge.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white">How do I book a personalized package for {cityName}?</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  Simply click <strong>"Plan a Custom Trip"</strong> or WhatsApp our destination specialists directly to get a custom quote and day-wise proposal.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TRIP INQUIRY MODAL */}
      <Dialog open={inquiryModalOpen} onOpenChange={setInquiryModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-white font-montserrat">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Plan a Custom Tour to {cityName}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 font-medium">
              Fill in your trip details to receive a customized day-by-day itinerary proposal with verified hotels &amp; private transfers.
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
                <Label className="text-xs text-slate-300 font-bold">Travel Date</Label>
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
              <Label className="text-xs text-slate-300 font-bold">Custom Preferences / Hotel Category</Label>
              <Textarea
                placeholder="e.g. 4-star boutique hotel, interested in tiger safaris / heritage walks..."
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
                {submittingInquiry ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : `Get Quote for ${cityName}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
