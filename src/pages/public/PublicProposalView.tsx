import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Printer, 
  MessageCircle, 
  Sparkles, 
  Check, 
  Car, 
  Hotel, 
  Utensils, 
  Camera, 
  Loader2, 
  Bed,
  RefreshCw,
  Compass,
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/php-backend';

function getDestinationHero(destination: string): string {
  const dest = (destination || '').toLowerCase();
  if (dest.includes('jodhpur') || dest.includes('rajasthan') || dest.includes('jaipur') || dest.includes('udaipur')) {
    return 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop';
  }
  if (dest.includes('kashmir') || dest.includes('srinagar') || dest.includes('gulmarg') || dest.includes('pahalgam')) {
    return 'https://images.unsplash.com/photo-1587570220642-1e967a6d80ff?q=80&w=1600&auto=format&fit=crop';
  }
  if (dest.includes('kutch') || dest.includes('rann') || dest.includes('bhuj') || dest.includes('gujarat')) {
    return 'https://images.unsplash.com/photo-1609828913647-757863b84b2c?q=80&w=1600&auto=format&fit=crop';
  }
  if (dest.includes('kerala') || dest.includes('munnar') || dest.includes('alleppey') || dest.includes('kochi')) {
    return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1600&auto=format&fit=crop';
  }
  if (dest.includes('dham') || dest.includes('kedarnath') || dest.includes('badrinath') || dest.includes('rishikesh') || dest.includes('uttarakhand')) {
    return 'https://images.unsplash.com/photo-1614082242765-7c98cd0f3df3?q=80&w=1600&auto=format&fit=crop';
  }
  if (dest.includes('goa')) {
    return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600&auto=format&fit=crop';
  }
  if (dest.includes('himachal') || dest.includes('manali') || dest.includes('shimla') || dest.includes('spiti')) {
    return 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop';
}

export function parseDestinationString(raw: any): string {
  if (!raw) return '';
  if (typeof raw !== 'string') {
    if (Array.isArray(raw)) {
      return formatStopsArray(raw);
    }
    return String(raw);
  }
  const str = raw.trim();
  if ((str.startsWith('[') && str.endsWith(']')) || (str.startsWith('{') && str.endsWith('}'))) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return formatStopsArray(parsed);
      } else if (parsed && typeof parsed === 'object') {
        const city = parsed.city || parsed.destination || parsed.name || '';
        const state = parsed.state || '';
        const nights = parsed.nights ? ` (${parsed.nights}N)` : '';
        if (city && state && city.toLowerCase() !== state.toLowerCase()) {
          return `${city}, ${state}${nights}`;
        }
        return (city || state || 'Curated Holiday') + nights;
      }
    } catch {}
  }
  return str;
}

function formatStopsArray(stops: any[]): string {
  if (!stops || stops.length === 0) return 'Curated Holiday';
  const parts = stops.map(s => {
    if (typeof s === 'string') return s;
    const city = s.city || s.destination || s.name || '';
    const state = s.state || '';
    const nights = s.nights ? ` (${s.nights}N)` : '';
    if (city && state && stops.length === 1 && city.toLowerCase() !== state.toLowerCase()) {
      return `${city}, ${state}${nights}`;
    }
    return (city || state || '') + nights;
  }).filter(Boolean);
  return parts.join(' • ') || 'Curated Holiday';
}

function cleanTitle(rawTitle?: string, rawDest?: string): string {
  const parsedTitle = parseDestinationString(rawTitle);
  const parsedDest = parseDestinationString(rawDest);

  const title = (parsedTitle || '').trim();
  const dest = (parsedDest || '').trim();
  
  if (!title || /^(Trip\s*-\s*Customized\s*Option\s*\d+|Customized\s*Option\s*\d+|Itinerary\s*-\s*\d+|Customized\s*Tour)/i.test(title) || title.startsWith('[')) {
    if (dest && !dest.startsWith('[')) {
      const parts = dest.split('·').map(s => s.trim()).filter(Boolean);
      const cleanParts = parts.filter(p => !/^\d+N\/\d+D$/i.test(p) && !/^\d+N$/i.test(p));
      return cleanParts.join(' • ') || dest;
    }
    return 'Bespoke Curated Holiday';
  }
  return title;
}

export default function PublicProposalView() {
  const { leadId: paramLeadId } = useParams<{ leadId: string }>();
  const [searchParams] = useSearchParams();
  const leadId = paramLeadId || searchParams.get('lead_id') || searchParams.get('id');

  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState<any>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchProposal = () => {
    if (!leadId) {
      setError('Missing proposal reference. Please check your proposal link.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/proposal_public.php?lead_id=${leadId}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Proposal could not be loaded.');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setProposalData(data);
          if (data.proposals && data.proposals.length > 0) {
            const acceptedIdx = data.proposals.findIndex((p: any) => 
              String(p.status || '').toLowerCase() === 'accepted'
            );
            if (acceptedIdx !== -1) {
              setSelectedOptionIndex(acceptedIdx);
            }
          }
        } else {
          throw new Error(data.error || 'Failed to load proposal details.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Error loading proposal.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProposal();
  }, [leadId]);

  const activeOption = proposalData?.proposals?.[selectedOptionIndex] || proposalData?.proposals?.[0] || null;
  const isAccepted = Boolean(
    proposalData?.has_accepted || 
    proposalData?.lead?.is_confirmed || 
    (activeOption && String(activeOption.status || '').toLowerCase() === 'accepted')
  );

  const handleConfirmAccept = async () => {
    if (!leadId || !activeOption) return;
    setIsAccepting(true);

    try {
      const res = await fetch(`${API_BASE}/proposal_public.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          lead_id: Number(leadId),
          proposal_id: activeOption.id,
          option_name: activeOption.option_name || `Option ${activeOption.option_number}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not register acceptance.');
      }

      toast({
        title: "🎉 Booking Confirmed!",
        description: `Thank you! ${activeOption.option_name || 'Option 1'} is officially confirmed.`,
        className: 'bg-emerald-950 text-emerald-100 border-emerald-700'
      });

      setProposalData((prev: any) => ({
        ...prev,
        has_accepted: true,
        accepted_option: activeOption,
        lead: {
          ...prev.lead,
          status: 'Booking Confirmed',
          is_confirmed: true
        },
        proposals: (prev.proposals || []).map((p: any) => 
          p.id === activeOption.id 
            ? { ...p, status: 'Accepted' } 
            : { ...p, status: 'Archived' }
        )
      }));

      setShowConfirmModal(false);
    } catch (err: any) {
      toast({
        title: "Acceptance Failed",
        description: err.message || "An error occurred. Please contact our support team.",
        variant: "destructive"
      });
    } finally {
      setIsAccepting(false);
    }
  };

  // Luxury Branding Header
  const renderHeader = () => (
    <header className="sticky top-0 z-40 bg-[#0b1021]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl print:hidden">
      <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 px-2.5 py-1.5 rounded-xl bg-white flex items-center justify-center shadow-lg border border-amber-500/30">
            <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" className="h-7 w-auto object-contain" />
          </div>
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-white block">
              GHUMO FIROO TRAVELS
            </span>
            <span className="text-[10px] text-[#C9A25A] font-semibold block -mt-0.5">
              Official Proposal & Client Booking Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            onClick={() => window.print()} 
            variant="outline" 
            size="sm" 
            className="border-slate-800 bg-[#161d2f] text-slate-200 hover:bg-slate-800 text-xs rounded-xl hidden sm:flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> PDF / Print
          </Button>
          <a 
            href="tel:+919910987264"
            className="hidden md:inline-flex"
          >
            <Button size="sm" variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs rounded-xl font-bold">
              <Phone className="w-3.5 h-3.5 mr-1 text-amber-400" /> +91 99109 87264
            </Button>
          </a>
          <a 
            href={`https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I am reviewing my holiday proposal (Ref: Lead #${leadId || ''}).`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-xs rounded-xl border-none shadow-md">
              <MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp Desk
            </Button>
          </a>
        </div>
      </div>
    </header>
  );

  // Luxury Agency Footer
  const renderFooter = () => (
    <footer className="border-t border-slate-800/80 pt-10 pb-8 mt-14 bg-[#070b16] text-slate-400 text-left print:hidden">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2.5 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="h-9 px-2.5 py-1 rounded-xl bg-white flex items-center justify-center shadow">
              <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <span className="text-sm font-black text-white uppercase tracking-wider block">Ghumo Firoo Travels</span>
              <span className="text-[10px] text-[#C9A25A] font-bold">NIDHI & MSME Verified Tour Operator & DMC</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Shop No. 210, 2nd Floor, Pratap Complex, Metro Gate No. 3, Munirka, New Delhi - 110067
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-300 pt-1">
            <a href="tel:+919910987264" className="hover:text-amber-400 transition-colors">📞 +91 99109 87264</a>
            <a href="tel:+919870229792" className="hover:text-amber-400 transition-colors">📞 +91 98702 29792</a>
            <a href="mailto:booking@ghumofiroo.com" className="hover:text-amber-400 transition-colors">✉️ booking@ghumofiroo.com</a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <a 
            href={`https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I am ready to confirm my travel package.`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-black text-xs h-11 px-5 rounded-xl border-none shadow-lg">
              <MessageCircle className="w-4 h-4 mr-2" /> Connect on WhatsApp
            </Button>
          </a>
          <Button 
            onClick={() => window.print()}
            variant="outline" 
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-11 px-5 rounded-xl"
          >
            <Printer className="w-4 h-4 mr-2" /> Print PDF
          </Button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-slate-900 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© 2026 Ghumo Firoo Travels. All rights reserved. Official Client Proposal.</p>
        <p>Verified Hotel Bookings & Dedicated Private Chauffeur Services</p>
      </div>
    </footer>
  );

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b16] text-white flex flex-col justify-between">
        {renderHeader()}
        <div className="flex flex-col items-center justify-center p-8 my-auto text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-[#C9A25A]/20 border-t-[#C9A25A] animate-spin" />
            <Compass className="w-8 h-8 text-[#C9A25A] absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-wide">Retrieving Your Curated Holiday Proposal</h2>
            <p className="text-xs text-slate-400 mt-1">Connecting to Ghumo Firoo luxury reservations desk...</p>
          </div>
        </div>
        {renderFooter()}
      </div>
    );
  }

  // Graceful Error Screen
  if (error || !proposalData) {
    return (
      <div className="min-h-screen bg-[#070b16] text-white flex flex-col justify-between">
        {renderHeader()}
        <div className="max-w-xl mx-auto px-4 py-16 text-center my-auto">
          <div className="bg-[#161d2f] border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#C9A25A]">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Proposal Updating or In Review</h2>
            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              Your travel consultant is currently updating your itinerary or options. Please refresh or contact our 24/7 dedicated concierge desk for immediate assistance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={fetchProposal}
                className="w-full bg-[#C9A25A] hover:bg-[#d8b066] text-slate-950 font-black text-xs h-11 rounded-xl shadow-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh Proposal
              </Button>
              <a 
                href={`https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I need assistance with my proposal (Lead #${leadId || ''}).`)}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full"
              >
                <Button className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-xs h-11 rounded-xl">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Concierge
                </Button>
              </a>
            </div>
          </div>
        </div>
        {renderFooter()}
      </div>
    );
  }

  const { lead, itinerary, proposals = [] } = proposalData;
  const days = itinerary?.days || [];
  const totalPrice = activeOption?.total_price || itinerary?.total_cost || 0;
  const adultPax = Math.max(1, lead.adult_count || 2);
  const perPersonPrice = activeOption?.price_per_person || Math.round(totalPrice / adultPax);
  const advanceRequired = activeOption?.advance_required || Math.round(totalPrice * 0.3);
  const cleanDest = parseDestinationString(lead.destination || itinerary?.itinerary_name || '');
  const heroImage = getDestinationHero(cleanDest);
  const displayTitle = cleanTitle(itinerary?.itinerary_name, lead.destination);

  return (
    <>
      <Helmet>
        <title>{lead.customer_name ? `${lead.customer_name}'s Tour Proposal` : 'Curated Travel Proposal'} | Ghumo Firoo Travels</title>
      </Helmet>

      <div className="min-h-screen bg-[#070b16] text-slate-100 font-sans antialiased selection:bg-[#C9A25A] selection:text-slate-950 pb-28 print:bg-white print:text-black print:pb-0">
        
        {renderHeader()}

        {/* Hero Destination Cover Banner */}
        <section className="relative overflow-hidden border-b border-slate-800 bg-[#050814]">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt={displayTitle} 
              className="w-full h-full object-cover opacity-45 filter brightness-85 scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-[#070b16]/75 to-transparent" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-12 text-left">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A25A]/15 border border-[#C9A25A]/40 text-[#C9A25A] text-[11px] font-black uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3.5 h-3.5" /> Bespoke Client Itinerary Proposal
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-md">
                {displayTitle}
              </h1>

              <p className="text-sm md:text-base text-slate-200 font-medium">
                Curated exclusively for <span className="text-[#C9A25A] font-black">{lead.customer_name}</span> & Travel Companions
              </p>

              {/* Seamless 5-Card Trip Stats Strip (Clean Uniform Geometry) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                <div className="bg-[#161d2f]/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-[#C9A25A] text-[11px] font-bold mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Travel Dates
                  </div>
                  <div className="text-xs font-black text-white truncate">
                    {lead.trip_start_date ? new Date(lead.trip_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible'}
                    {lead.trip_end_date ? ` - ${new Date(lead.trip_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                  </div>
                </div>

                <div className="bg-[#161d2f]/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-[#C9A25A] text-[11px] font-bold mb-1">
                    <Clock className="w-3.5 h-3.5" /> Duration
                  </div>
                  <div className="text-xs font-black text-white truncate">
                    {itinerary?.total_nights ? `${itinerary.total_nights} Nights / ${itinerary.total_nights + 1} Days` : `${days.length} Days`}
                  </div>
                </div>

                <div className="bg-[#161d2f]/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-[#C9A25A] text-[11px] font-bold mb-1">
                    <Users className="w-3.5 h-3.5" /> Travelers
                  </div>
                  <div className="text-xs font-black text-white truncate">
                    {lead.adult_count || 2} Adults {lead.child_count > 0 ? `, ${lead.child_count} Child` : ''}
                  </div>
                </div>

                <div className="bg-[#161d2f]/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-[#C9A25A] text-[11px] font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5" /> Region
                  </div>
                  <div className="text-xs font-black text-white truncate">
                    {parseDestinationString(lead.destination) ? parseDestinationString(lead.destination).split('·')[0].split('(')[0].trim() : 'India'}
                  </div>
                </div>

                <div className={`col-span-2 sm:col-span-1 border rounded-2xl p-3.5 backdrop-blur-md flex flex-col justify-between ${
                  isAccepted ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-amber-950/30 border-amber-500/40'
                }`}>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold mb-1 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Booking Status
                  </div>
                  <div className={`text-xs font-black flex items-center gap-1.5 truncate ${
                    isAccepted ? 'text-emerald-400' : 'text-[#C9A25A]'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isAccepted ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    {isAccepted ? 'Confirmed 🟢' : 'Awaiting Choice'}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 pt-8 space-y-10">

          {/* Package Options Cards (Single Clear Pricing Display) */}
          {proposals && proposals.length > 0 && (
            <section className="space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> 1. Selected Package Options ({proposals.length})
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">Review your tailored options below. Click Accept to lock your booking dates.</p>
                </div>
                {isAccepted && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider px-3 py-1">
                    ⭐ Booking Confirmed
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {proposals.map((prop: any, idx: number) => {
                  const isSelected = selectedOptionIndex === idx;
                  const isPropAccepted = String(prop.status || '').toLowerCase() === 'accepted';
                  const pPrice = prop.total_price || 0;
                  const pPerPax = prop.price_per_person || Math.round(pPrice / adultPax);

                  // Extract primary hotel for this option if available
                  const firstDay = days[0] || {};
                  const optHotel = firstDay.hotel_name || 'Handpicked Heritage Hotel / Resort';
                  const optPlan = firstDay.meal_plan || 'CP (Breakfast Included)';

                  return (
                    <div
                      key={prop.id || idx}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isPropAccepted
                          ? 'bg-emerald-950/20 border-emerald-500/60 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                          : isSelected 
                          ? 'bg-[#161d2f] border-amber-500/70 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/40' 
                          : 'bg-[#161d2f]/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isPropAccepted && (
                        <div className="absolute -top-3 left-5 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> Confirmed Choice
                        </div>
                      )}

                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {prop.option_name || `Option ${prop.option_number || idx + 1}`}
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#C9A25A] bg-[#C9A25A] text-slate-950' : 'border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-white leading-snug">
                            {cleanTitle(prop.title, lead.destination)}
                          </h4>
                          <p className="text-[11px] text-slate-300 font-medium mt-1 flex items-center gap-1.5">
                            <Hotel className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{optHotel}</span>
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                            ₹{Math.round(pPrice).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-300 mt-0.5">
                            ₹{Math.round(pPerPax).toLocaleString('en-IN')} per adult • All-Inclusive Package
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Advance Deposit (30%): <strong className="text-white">₹{Math.round(pPrice * 0.3).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800">
                        {isPropAccepted ? (
                          <div className="w-full py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black uppercase text-center flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Booking Confirmed
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOptionIndex(idx);
                              setShowConfirmModal(true);
                            }}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs h-10 rounded-xl shadow-md cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 mr-1 stroke-[3]" /> 1-Click Accept {prop.option_name || `Option ${idx + 1}`}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Day by Day Vertical Timeline (Rann Utsav / Luxury Brochure Standard) */}
          <section className="space-y-6 text-left">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" /> 2. Curated Day-by-Day Journey Schedule
                </h3>
                <p className="text-xs text-slate-300 font-medium">Detailed schedule of your transfers, sightseeing landmarks, and hotel accommodations.</p>
              </div>
            </div>

            <div className="space-y-6">
              {days.map((day: any, idx: number) => {
                const blocks = (day.blocks || []).filter((b: any) => b.type !== 'meal');
                const hotelBlock = blocks.find((b: any) => b.type === 'hotel');
                const transferBlocks = blocks.filter((b: any) => b.type === 'transfer' || b.type === 'cab');
                const activityBlocks = blocks.filter((b: any) => b.type === 'activity' || b.type === 'sightseeing');

                // Determine display hotel name & room details
                const hotelName = day.hotel_name || hotelBlock?.properties?.hotel_name || (day.hotels && day.hotels[0]?.hotel_name);
                const roomCategory = day.room_type || hotelBlock?.properties?.room_category || hotelBlock?.properties?.room_type || (day.hotels && day.hotels[0]?.room_type) || 'Standard Room';
                const mealPlan = day.meal_plan || hotelBlock?.properties?.meal_plan || (day.hotels && day.hotels[0]?.meal_plan) || 'CP (Breakfast Included)';

                // Calculate formatted date
                let displayDate = day.date || '---';
                if (lead.trip_start_date) {
                  const d = new Date(lead.trip_start_date);
                  if (!isNaN(d.getTime())) {
                    d.setDate(d.getDate() + (day.day_number - 1));
                    displayDate = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                  }
                }

                return (
                  <div key={day.id || idx} className="bg-[#161d2f] border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-xl text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg uppercase tracking-wider">
                          Day {day.day_number || idx + 1}
                        </span>
                        <h4 className="text-base font-black text-white uppercase tracking-wide">
                          {day.title}
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-amber-400 font-extrabold uppercase">
                        {displayDate}
                      </span>
                    </div>

                    {/* Day Narrative Description */}
                    {day.description && (
                      <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-line bg-[#0d1322] p-3.5 rounded-xl border border-slate-800/80">
                        {day.description}
                      </p>
                    )}

                    {/* Day Highlights Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      
                      {/* 1. Stays / Hotel Block */}
                      {hotelName && (
                        <div className="border border-purple-500/30 bg-[#0f1420] rounded-xl p-4 flex gap-4 text-left shadow-md">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                            <Bed className="w-5 h-5 text-purple-300" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <span className="text-[10px] text-purple-400 font-black uppercase tracking-wider block">Confirmed Accommodation</span>
                            <h5 className="font-black text-sm text-white uppercase truncate">{hotelName}</h5>
                            <p className="text-[11px] font-bold text-slate-300">
                              Room: <strong className="text-amber-400">{roomCategory}</strong> | Plan: <strong className="text-amber-400">{mealPlan}</strong>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 2. Cab / Transport Block */}
                      <div className="border border-emerald-500/30 bg-[#0f2019] rounded-xl p-4 flex gap-4 text-left shadow-md">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                          <Car className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider block">Private Vehicle Transit</span>
                          <h5 className="font-black text-sm text-white uppercase truncate">
                            {transferBlocks.length > 0 && transferBlocks[0].properties?.route_from
                              ? `${transferBlocks[0].properties?.route_from} to ${transferBlocks[0].properties?.route_to}`
                              : 'Dedicated Private AC Chauffeur Vehicle'}
                          </h5>
                          <p className="text-[11px] font-bold text-slate-300">
                            Vehicle Class: <strong className="text-emerald-400">Private Air-Conditioned Sedan / SUV</strong>
                          </p>
                        </div>
                      </div>

                      {/* 3. Sightseeing / Excursions Highlights */}
                      {activityBlocks.length > 0 && (
                        <div className="col-span-1 md:col-span-2 border border-amber-500/30 bg-[#201a0f] rounded-xl p-4 text-left shadow-md space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-amber-400">Key Places to Visit & Sightseeing Highlights</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {activityBlocks.map((ab: any, aIdx: number) => {
                              const p = ab.properties || {};
                              return (
                                <div key={ab.id || aIdx} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2.5">
                                  {p.photo_url ? (
                                    <img src={p.photo_url} alt={p.excursion_name} className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                                      <Camera className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-white truncate">{p.excursion_name || p.sightseeing_name || 'Landmark Visit'}</div>
                                    {p.description && <div className="text-[10px] text-slate-400 truncate">{p.description}</div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Inclusions & Booking Process (Official Ghumo Firoo Standards) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Inclusions */}
            <div className="bg-[#161d2f] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Package Inclusions
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Premium accommodation verified for hygiene, comfort and luxury.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Daily breakfast and specified meals as per selected tier.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Dedicated private air-conditioned vehicle for airport transfers & all excursions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>All state taxes, driver allowances, toll charges, and parking fees included.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>24x7 Dedicated Ghumo Firoo Travel Desk Concierge on WhatsApp and Call.</span>
                </li>
              </ul>
            </div>

            {/* Booking & Operational Process */}
            <div className="bg-[#161d2f] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-[#C9A25A] font-black text-sm uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Booking & Voucher Process
              </div>
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-amber-500/40 text-[#C9A25A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                  <p><span className="font-bold text-white">1-Click Acceptance:</span> Choose your preferred option above and click Accept. Your tour dates are provisionally locked.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-amber-500/40 text-[#C9A25A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                  <p><span className="font-bold text-white">Proforma Invoice & Deposit:</span> Our accounts desk sends your official Proforma Invoice with secure payment link for deposit (30%-50%).</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-amber-500/40 text-[#C9A25A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                  <p><span className="font-bold text-white">Master Service Voucher Release:</span> Upon advance payment confirmation and operations approval, your official Service Voucher with driver/cab contact and hotel check-in vouchers is released.</p>
                </div>
              </div>
            </div>
          </section>

        </main>

        {renderFooter()}

        {/* Sticky Mobile & Desktop Single Acceptance Bar */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-[#070b16]/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl print:hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="text-left min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#C9A25A] truncate">
                {activeOption?.option_name || 'Selected Tier'} • {cleanTitle(activeOption?.title, lead.destination)}
              </div>
              <div className="text-base sm:text-xl font-black text-white font-mono">
                ₹{Math.round(totalPrice).toLocaleString('en-IN')}
                <span className="text-[11px] font-semibold text-slate-300 ml-2 hidden sm:inline font-sans">
                  (₹{Math.round(perPersonPrice).toLocaleString('en-IN')} / person)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isAccepted ? (
                <Button
                  onClick={() => setShowConfirmModal(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm h-11 px-5 sm:px-7 rounded-xl shadow-lg border border-emerald-500/30 cursor-pointer"
                >
                  <Check className="w-4 h-4 mr-1.5 stroke-[3]" /> Accept & Confirm
                </Button>
              ) : (
                <div className="bg-emerald-950/90 border border-emerald-600/60 px-3.5 py-2 rounded-xl flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirmed 🟢
                </div>
              )}

              <a 
                href={`https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I am reviewing my holiday proposal for ${displayTitle}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="icon" className="h-11 w-11 rounded-xl bg-[#25D366] hover:bg-[#20ba56] text-white border-none shadow-md">
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* 1-Click Acceptance Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161d2f] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Confirm Booking Selection</h3>
                <p className="text-xs text-slate-300 mt-1">
                  You are selecting <span className="text-white font-bold">{activeOption?.option_name || 'Option 1'}</span> for <span className="text-amber-400 font-bold">₹{Math.round(totalPrice).toLocaleString('en-IN')}</span>.
                </p>
              </div>

              <div className="bg-[#0f1420] border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Tour Package:</span>
                  <span className="font-bold text-white truncate max-w-[200px]">{displayTitle}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Travelers:</span>
                  <span className="font-bold text-white">{adultPax} Adults</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Advance Deposit (30%):</span>
                  <span className="font-bold text-amber-400">₹{Math.round(advanceRequired).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                By accepting, you lock your tour dates. Our accounts desk will send your official Proforma Invoice with the secure payment link.
              </p>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isAccepting}
                  className="flex-1 border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAccept}
                  disabled={isAccepting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs h-11 rounded-xl shadow-lg"
                >
                  {isAccepting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2 stroke-[3]" /> Confirm & Book
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
