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
  ChevronRight,
  Car, 
  Hotel, 
  Utensils, 
  Camera, 
  Info,
  Loader2,
  FileCheck2,
  Lock,
  ArrowRight,
  Compass,
  RefreshCw,
  Award,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/php-backend';

function getDestinationHero(destination: string): string {
  const dest = (destination || '').toLowerCase();
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
  if (dest.includes('rajasthan') || dest.includes('jaipur') || dest.includes('udaipur') || dest.includes('jaisalmer')) {
    return 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop';
  }
  if (dest.includes('dubai')) {
    return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop';
  }
  if (dest.includes('singapore')) {
    return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1600&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop';
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
      setError('Missing proposal link reference. Please check your link.');
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
        description: `Thank you! ${activeOption.option_name || 'Your option'} is officially confirmed.`,
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

  // Reusable Top Luxury Header
  const renderHeader = () => (
    <header className="sticky top-0 z-40 bg-[#050814]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl print:hidden">
      <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 px-2.5 py-1.5 rounded-xl bg-white flex items-center justify-center shadow-lg border border-amber-500/30">
            <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" className="h-7 w-auto object-contain" />
          </div>
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-white block">
              GHUMO FIROO TRAVELS
            </span>
            <span className="text-[10px] text-[#C9A25A] font-semibold block -mt-0.5">
              Curated Holidays & Luxury Journeys
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button 
            onClick={() => window.print()} 
            variant="outline" 
            size="sm" 
            className="border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 text-xs rounded-xl hidden sm:flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> PDF
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

  // Reusable Luxury Footer
  const renderFooter = () => (
    <footer className="border-t border-slate-800/80 pt-10 pb-8 mt-12 bg-[#04060e] text-slate-400 text-left print:hidden">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2.5 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="h-9 px-2.5 py-1 rounded-xl bg-white flex items-center justify-center shadow">
              <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <span className="text-sm font-black text-white uppercase tracking-wider block">Ghumo Firoo Travels</span>
              <span className="text-[10px] text-[#C9A25A] font-bold">Govt. Registered Tour Operator & DMC</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Shop No. 210, 2nd Floor, Pratap Complex, Metro Gate No. 3, Munirka, New Delhi - 110067
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-300 pt-1">
            <a href="tel:+919910987264" className="hover:text-amber-400 transition-colors">📞 +91 99109 87264</a>
            <a href="tel:+919870229792" className="hover:text-amber-400 transition-colors">📞 +91 98702 29792</a>
            <a href="mailto:luxury@ghumofiroo.com" className="hover:text-amber-400 transition-colors">✉️ luxury@ghumofiroo.com</a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <a 
            href={`https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I am ready to proceed with my tour booking.`)}`}
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
        <p>© 2026 Ghumo Firoo Travels. All rights reserved. Confidential Client Proposal.</p>
        <p>100% Verified Accommodations & Sanitized Vehicles</p>
      </div>
    </footer>
  );

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050814] text-white flex flex-col justify-between">
        {renderHeader()}
        <div className="flex flex-col items-center justify-center p-8 my-auto text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-[#C9A25A]/20 border-t-[#C9A25A] animate-spin" />
            <Compass className="w-8 h-8 text-[#C9A25A] absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-wide">Retrieving Your Curated Proposal</h2>
            <p className="text-xs text-slate-400 mt-1">Connecting to Ghumo Firoo luxury reservation desk...</p>
          </div>
        </div>
        {renderFooter()}
      </div>
    );
  }

  // Graceful Error Screen
  if (error || !proposalData) {
    return (
      <div className="min-h-screen bg-[#050814] text-white flex flex-col justify-between">
        {renderHeader()}
        <div className="max-w-xl mx-auto px-4 py-16 text-center my-auto">
          <div className="bg-slate-900/80 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#C9A25A]">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Proposal Updating or Unavailable</h2>
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
  const heroImage = getDestinationHero(lead.destination || itinerary?.itinerary_name || '');

  return (
    <>
      <Helmet>
        <title>{lead.customer_name ? `${lead.customer_name}'s Tour Proposal` : 'Curated Travel Proposal'} | Ghumo Firoo Travels</title>
      </Helmet>

      <div className="min-h-screen bg-[#070B18] text-slate-100 font-sans antialiased selection:bg-[#C9A25A] selection:text-slate-950 pb-28 print:bg-white print:text-black print:pb-0">
        
        {renderHeader()}

        {/* Hero Cover Banner */}
        <section className="relative overflow-hidden border-b border-slate-800 bg-[#050814]">
          {/* Hero Background image with gradient mask */}
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt={lead.destination} 
              className="w-full h-full object-cover opacity-35 filter brightness-75 scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B18] via-[#070B18]/70 to-transparent" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-14 text-left">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              
              <div className="space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A25A]/15 border border-[#C9A25A]/40 text-[#C9A25A] text-[11px] font-black uppercase tracking-wider shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" /> Bespoke Client Itinerary Proposal
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-md">
                  {itinerary?.itinerary_name || `${lead.destination} Holiday`}
                </h1>

                <p className="text-sm md:text-base text-slate-200 font-medium">
                  Curated exclusively for <span className="text-[#C9A25A] font-black">{lead.customer_name}</span> & Travel Companions
                </p>

                {/* Quick Trip Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-[#C9A25A] text-xs font-bold mb-1">
                      <Calendar className="w-3.5 h-3.5" /> Dates
                    </div>
                    <div className="text-xs font-black text-white truncate">
                      {lead.trip_start_date ? new Date(lead.trip_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible'}
                      {lead.trip_end_date ? ` - ${new Date(lead.trip_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-[#C9A25A] text-xs font-bold mb-1">
                      <Clock className="w-3.5 h-3.5" /> Duration
                    </div>
                    <div className="text-xs font-black text-white truncate">
                      {itinerary?.total_nights ? `${itinerary.total_nights} Nights / ${itinerary.total_nights + 1} Days` : `${days.length} Days`}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-[#C9A25A] text-xs font-bold mb-1">
                      <Users className="w-3.5 h-3.5" /> Travelers
                    </div>
                    <div className="text-xs font-black text-white truncate">
                      {lead.adult_count || 2} Adults {lead.child_count > 0 ? `, ${lead.child_count} Child` : ''}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-[#C9A25A] text-xs font-bold mb-1">
                      <MapPin className="w-3.5 h-3.5" /> Destination
                    </div>
                    <div className="text-xs font-black text-white truncate">
                      {lead.destination || 'India'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Header Badge */}
              <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-3xl shadow-2xl backdrop-blur-md min-w-[240px] text-left">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                  <span>Proposal Status</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className={`text-lg font-black ${isAccepted ? 'text-emerald-400' : 'text-[#C9A25A]'}`}>
                  {isAccepted ? 'Booking Confirmed 🟢' : 'Ready for Guest Review'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAccepted ? 'Option accepted. Awaiting advance deposit.' : 'Compare options & 1-click accept below'}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Main Body */}
        <main className="max-w-6xl mx-auto px-4 pt-10 space-y-12">

          {/* Option Selection Cards */}
          {proposals && proposals.length > 0 && (
            <section className="space-y-5 text-left">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">1. Choose Your Preferred Package Tier</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Select an option to compare vehicle class, hotel star rating, and price</p>
                </div>
                <Badge className="bg-[#C9A25A]/20 text-[#C9A25A] border-[#C9A25A]/40 text-xs px-3 py-1 self-start sm:self-auto">
                  {proposals.length} Curated Option{proposals.length > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {proposals.map((prop: any, idx: number) => {
                  const isSelected = selectedOptionIndex === idx;
                  const isPropAccepted = String(prop.status || '').toLowerCase() === 'accepted';
                  const pPrice = prop.total_price || 0;
                  const pPerPax = prop.price_per_person || Math.round(pPrice / adultPax);

                  return (
                    <div
                      key={prop.id || idx}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-slate-950 border-[#C9A25A] shadow-2xl shadow-[#C9A25A]/15 scale-[1.02]' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isPropAccepted && (
                        <div className="absolute -top-3 left-6 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                          <Check className="w-3 h-3 stroke-[3]" /> Confirmed Choice
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                            isSelected ? 'bg-[#C9A25A]/20 text-[#C9A25A]' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {prop.option_name || `Option ${prop.option_number || idx + 1}`}
                          </span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#C9A25A] bg-[#C9A25A] text-slate-950' : 'border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div>
                          <div className="text-base font-bold text-white leading-snug">
                            {prop.title || `${lead.destination} Package`}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-900">
                          <div className="text-3xl font-black text-white tracking-tight">
                            ₹{Math.round(pPrice).toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs font-semibold text-slate-400 mt-0.5">
                            ₹{Math.round(pPerPax).toLocaleString('en-IN')} / person • All Inclusive
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-900 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Advance Deposit (30%):</span>
                        <span className="font-bold text-[#C9A25A]">₹{Math.round(pPrice * 0.3).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Pricing Recap & Acceptance Banner */}
          <section className="bg-gradient-to-r from-slate-950 via-[#0d1326] to-slate-950 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-left">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              
              <div className="space-y-2 text-center lg:text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A25A] bg-[#C9A25A]/10 px-3 py-1 rounded-full border border-[#C9A25A]/30">
                  {activeOption?.option_name || 'Selected Option'} Summary
                </span>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 justify-center lg:justify-start">
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    ₹{Math.round(totalPrice).toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold">
                    (₹{Math.round(perPersonPrice).toLocaleString('en-IN')} per adult for {adultPax} travelers)
                  </div>
                </div>
                <p className="text-xs text-slate-400 max-w-xl">
                  Guaranteed all-inclusive price. Includes complete hotel accommodations, private air-conditioned vehicle, dedicated driver, parking, toll charges, and 24/7 travel desk concierge.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 items-center">
                {!isAccepted ? (
                  <Button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm h-13 px-8 rounded-2xl shadow-xl shadow-emerald-900/40 flex items-center justify-center cursor-pointer transition-transform active:scale-95 border border-emerald-500/40"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    ⚡ 1-Click Accept {activeOption?.option_name || 'Option'} & Confirm
                  </Button>
                ) : (
                  <div className="bg-emerald-950/80 border border-emerald-700/60 p-4 rounded-2xl text-left max-w-md w-full">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-sm mb-1">
                      <CheckCircle2 className="w-5 h-5" /> Booking Confirmed!
                    </div>
                    <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                      Your choice ({activeOption?.option_name || 'Option 1'}) is confirmed. Our reservations team is issuing your Proforma Invoice with the advance payment link. Master Service Voucher will be issued upon advance deposit receipt.
                    </p>
                  </div>
                )}

                <a 
                  href={`https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I am reviewing the proposal for ${lead.destination} (${activeOption?.option_name || 'Option 1'} - ₹${Math.round(totalPrice).toLocaleString('en-IN')}) and have a few questions.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-13 px-5 rounded-2xl font-bold">
                    <MessageCircle className="w-4 h-4 mr-2 text-[#25D366]" /> Chat with Concierge
                  </Button>
                </a>
              </div>
            </div>
          </section>

          {/* Day-by-Day Schedule */}
          {days.length > 0 && (
            <section className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">2. Day-by-Day Journey Schedule</h2>
                  <p className="text-xs text-slate-400">Curated sequence of transfers, sightseeing, and evening leisure</p>
                </div>
                <Badge variant="outline" className="border-slate-800 text-slate-300 text-xs">
                  {days.length} Days Planned
                </Badge>
              </div>

              <div className="space-y-4">
                {days.map((d: any, index: number) => {
                  const blocks = d.blocks || [];
                  const activities = blocks.filter((b: any) => b.type === 'activity');

                  return (
                    <div 
                      key={d.day_number || index} 
                      className="bg-slate-950 border border-slate-800/80 rounded-3xl p-6 transition-all hover:border-slate-700 shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-[#C9A25A]/15 border border-[#C9A25A]/30 text-[#C9A25A] flex items-center justify-center font-black text-sm shrink-0">
                            D{d.day_number || index + 1}
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white">{d.title}</h3>
                            {d.destination && (
                              <div className="text-[11px] font-semibold text-[#C9A25A] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {d.destination}
                              </div>
                            )}
                          </div>
                        </div>

                        {d.hotel_name && (
                          <div className="inline-flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                            <Hotel className="w-3.5 h-3.5 text-[#C9A25A]" />
                            <span className="font-bold text-white">{d.hotel_name}</span>
                            {d.room_type && <span className="text-slate-400 text-[10px]">({d.room_type})</span>}
                            {d.meal_plan && <span className="text-emerald-400 font-bold text-[10px]">[{d.meal_plan}]</span>}
                          </div>
                        )}
                      </div>

                      {/* Day narrative */}
                      {d.description && (
                        <p className="text-xs text-slate-300 leading-relaxed mt-4">
                          {d.description}
                        </p>
                      )}

                      {/* Activities / Excursions Grid */}
                      {activities.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activities.map((act: any, aIdx: number) => {
                            const p = act.properties || {};
                            return (
                              <div key={act.id || aIdx} className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3 flex items-start gap-3">
                                {p.photo_url ? (
                                  <img 
                                    src={p.photo_url} 
                                    alt={p.excursion_name} 
                                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-700" 
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-[#C9A25A]">
                                    <Camera className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white truncate">{p.excursion_name || 'Sightseeing Tour'}</div>
                                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{p.description}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Inclusions & Booking Process */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Inclusions */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-7 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Package Inclusions
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Handpicked accommodations verified for luxury, hygiene & comfort.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Daily breakfast and meals as indicated in your chosen tier.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Dedicated private air-conditioned vehicle for airport transfers & all excursions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>All state taxes, driver night allowances, tolls, and parking included.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>24x7 Dedicated Ghumo Firoo Personal Concierge assistance.</span>
                </li>
              </ul>
            </div>

            {/* Booking & Operational Process */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-7 space-y-4">
              <div className="flex items-center gap-2 text-[#C9A25A] font-black text-sm uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Booking & Voucher Confirmation
              </div>
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-amber-500/40 text-[#C9A25A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                  <p><span className="font-bold text-white">1-Click Acceptance:</span> Choose your preferred option above and click Accept. Your tour dates are provisionally locked.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-amber-500/40 text-[#C9A25A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                  <p><span className="font-bold text-white">Proforma Invoice & Deposit:</span> Our finance team sends your official Proforma Invoice with secure advance payment link (30%-50% deposit).</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-amber-500/40 text-[#C9A25A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                  <p><span className="font-bold text-white">Master Service Voucher Release:</span> Once the advance deposit is confirmed and operational details are finalized, your official Master Service Voucher with driver/cab details and hotel check-in codes will be released.</p>
                </div>
              </div>
            </div>
          </section>

        </main>

        {renderFooter()}

        {/* Sticky Mobile & Desktop Acceptance Bar */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-[#050814]/95 backdrop-blur-md border-t border-slate-800 p-3.5 shadow-2xl print:hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="text-left min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#C9A25A] truncate">
                {activeOption?.option_name || 'Selected Tier'}
              </div>
              <div className="text-base sm:text-xl font-black text-white">
                ₹{Math.round(totalPrice).toLocaleString('en-IN')}
                <span className="text-[11px] font-semibold text-slate-400 ml-1.5 hidden sm:inline">
                  (₹{Math.round(perPersonPrice).toLocaleString('en-IN')}/pax)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isAccepted ? (
                <Button
                  onClick={() => setShowConfirmModal(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm h-11 px-5 sm:px-7 rounded-xl shadow-lg border border-emerald-500/30"
                >
                  <Check className="w-4 h-4 mr-1.5 stroke-[3]" /> Accept & Confirm
                </Button>
              ) : (
                <div className="bg-emerald-950/90 border border-emerald-600/60 px-3.5 py-2 rounded-xl flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirmed
                </div>
              )}

              <a 
                href={`https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I am reviewing my holiday proposal for ${lead.destination}.`)}`}
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
            <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Confirm Booking Selection</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You are locking <span className="text-white font-bold">{activeOption?.option_name || 'Option 1'}</span> for <span className="text-[#C9A25A] font-bold">₹{Math.round(totalPrice).toLocaleString('en-IN')}</span>.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Destination:</span>
                  <span className="font-bold text-white">{lead.destination}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Travelers:</span>
                  <span className="font-bold text-white">{adultPax} Adults</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Advance Deposit (30%):</span>
                  <span className="font-bold text-[#C9A25A]">₹{Math.round(advanceRequired).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                By accepting, you confirm your booking request. Our accounts desk will send your official Proforma Invoice with the secure payment link.
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
