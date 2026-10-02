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
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/php-backend';

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

  useEffect(() => {
    if (!leadId) {
      setError('Missing proposal link reference. Please check your link.');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/proposal_public.php?lead_id=${leadId}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Unable to retrieve proposal options.');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setProposalData(data);
          // If one option was previously accepted, select it automatically
          if (data.proposals && data.proposals.length > 0) {
            const acceptedIdx = data.proposals.findIndex((p: any) => 
              String(p.status).toLowerCase() === 'accepted'
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
  }, [leadId]);

  const activeOption = proposalData?.proposals?.[selectedOptionIndex] || proposalData?.proposals?.[0] || null;
  const isAccepted = Boolean(
    proposalData?.has_accepted || 
    proposalData?.lead?.is_confirmed || 
    (activeOption && String(activeOption.status).toLowerCase() === 'accepted')
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
        description: `Thank you! Option "${activeOption.option_name || 'Option 1'}" is officially confirmed.`,
        className: 'bg-emerald-950 text-emerald-100 border-emerald-700'
      });

      // Update local state
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B18] text-white flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" className="h-10 w-auto brightness-0 invert opacity-90 mb-2" />
          <Loader2 className="w-8 h-8 text-[#C9A25A] animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#C9A25A] font-bold">Loading Your Curated Proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposalData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-400">
            <Info className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Proposal Link Unavailable</h2>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed">
            {error || 'This proposal may have expired or the link is incorrect.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="https://wa.me/919910987264?text=Hi%20Ghumo%20Firoo%20Travels,%20I%20am%20inquiring%20about%20my%20proposal." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1"
            >
              <Button className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-xs h-11 rounded-xl">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Support
              </Button>
            </a>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-11 rounded-xl">
                Visit Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { lead, itinerary, proposals = [] } = proposalData;
  const days = itinerary?.days || [];
  const totalPrice = activeOption?.total_price || itinerary?.total_cost || 0;
  const perPersonPrice = activeOption?.price_per_person || (totalPrice / Math.max(1, lead.adult_count || 2));
  const advanceRequired = activeOption?.advance_required || Math.round(totalPrice * 0.3);

  return (
    <>
      <Helmet>
        <title>{lead.customer_name ? `${lead.customer_name}'s Tour Proposal` : 'Curated Travel Proposal'} | Ghumo Firoo Travels</title>
      </Helmet>

      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-[#C9A25A] selection:text-slate-950 pb-20 print:bg-white print:text-black print:pb-0">
        
        {/* Sticky Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 print:hidden">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 px-2.5 py-1 rounded-xl bg-white flex items-center justify-center shadow">
                <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" className="h-6 w-auto object-contain" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-[#C9A25A] hidden sm:inline-block">
                Ghumo Firoo Travels
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => window.print()} 
                variant="outline" 
                size="sm" 
                className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> PDF / Print
              </Button>
              <a 
                href={`https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I have a question regarding my proposal for ${lead.destination} (Lead #${lead.id}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-xs rounded-xl border-none">
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Concierge
                </Button>
              </a>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800 py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A25A]/10 border border-[#C9A25A]/30 text-[#C9A25A] text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Bespoke Client Itinerary Proposal
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  {lead.destination || itinerary?.itinerary_name || 'Exclusive Tour Itinerary'}
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                  Specially crafted for <span className="text-white font-bold">{lead.customer_name}</span> & Travel Companions
                </p>
              </div>

              {/* Booking Status Card */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
                  isAccepted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#C9A25A]/20 text-[#C9A25A] border border-[#C9A25A]/30'
                }`}>
                  {isAccepted ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proposal Status</div>
                  <div className={`text-base font-black ${isAccepted ? 'text-emerald-400' : 'text-[#C9A25A]'}`}>
                    {isAccepted ? 'Booking Confirmed' : 'Ready for Guest Review'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Trip Metadata Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#C9A25A] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Dates</div>
                  <div className="text-xs font-black text-white truncate">
                    {lead.trip_start_date ? new Date(lead.trip_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible'}
                    {lead.trip_end_date ? ` - ${new Date(lead.trip_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#C9A25A] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Duration</div>
                  <div className="text-xs font-black text-white truncate">
                    {itinerary?.total_nights ? `${itinerary.total_nights} Nights / ${itinerary.total_nights + 1} Days` : 'Custom Days'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
                <Users className="w-4 h-4 text-[#C9A25A] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Travelers</div>
                  <div className="text-xs font-black text-white truncate">
                    {lead.adult_count || 2} Adults {lead.child_count > 0 ? `, ${lead.child_count} Child` : ''}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#C9A25A] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Destination</div>
                  <div className="text-xs font-black text-white truncate">{lead.destination || 'India'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 pt-8 space-y-10">

          {/* Option Selection Bar */}
          {proposals && proposals.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Select Your Package Tier</h2>
                  <p className="text-xs text-slate-400">Review alternative accommodation categories & vehicles tailored for your travel style</p>
                </div>
                <Badge className="bg-[#C9A25A]/20 text-[#C9A25A] border-[#C9A25A]/40 text-xs px-2.5 py-1">
                  {proposals.length} Option{proposals.length > 1 ? 's' : ''} Available
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {proposals.map((prop: any, idx: number) => {
                  const isSelected = selectedOptionIndex === idx;
                  const isPropAccepted = String(prop.status).toLowerCase() === 'accepted';
                  const pPrice = prop.total_price || 0;
                  const pPerPax = prop.price_per_person || Math.round(pPrice / Math.max(1, lead.adult_count || 2));

                  return (
                    <div
                      key={prop.id || idx}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-slate-950 border-[#C9A25A] shadow-xl shadow-[#C9A25A]/10 scale-[1.01]' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isPropAccepted && (
                        <div className="absolute -top-3 left-6 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                          <Check className="w-3 h-3" /> Confirmed Choice
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-[#C9A25A]">
                            {prop.option_name || `Option ${prop.option_number || idx + 1}`}
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#C9A25A] bg-[#C9A25A] text-slate-950' : 'border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="text-base font-bold text-white leading-snug">
                          {prop.title || `${lead.destination} Package`}
                        </div>

                        <div className="pt-2">
                          <div className="text-2xl font-black text-white">
                            ₹{Math.round(pPrice).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-400">
                            ₹{Math.round(pPerPax).toLocaleString('en-IN')} / person • All Inclusive
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Advance (30%):</span>
                        <span className="font-bold text-[#C9A25A]">₹{Math.round(pPrice * 0.3).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Pricing & 1-Click Acceptance Banner */}
          <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              
              <div className="space-y-2 text-center lg:text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A25A] bg-[#C9A25A]/10 px-3 py-1 rounded-full border border-[#C9A25A]/20">
                  {activeOption?.option_name || 'Selected Package Tier'}
                </span>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 justify-center lg:justify-start">
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    ₹{Math.round(totalPrice).toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold">
                    (₹{Math.round(perPersonPrice).toLocaleString('en-IN')} per person for {lead.adult_count || 2} adults)
                  </div>
                </div>
                <p className="text-xs text-slate-400 max-w-lg">
                  Guaranteed all-inclusive package price. Includes complete accommodations, private cab transfers, sightseeing, and concierge support. No hidden charges.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 items-center">
                {!isAccepted ? (
                  <Button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm h-13 px-8 rounded-2xl shadow-xl shadow-emerald-900/30 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
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
                      Your selection is confirmed. Our reservations team is issuing your Proforma Invoice & payment link. Master Service Voucher will be unlocked upon advance receipt and driver assignment.
                    </p>
                  </div>
                )}

                <a 
                  href={`https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I am reviewing the proposal for ${lead.destination} (${activeOption?.option_name || 'Option 1'} - ₹${Math.round(totalPrice).toLocaleString('en-IN')}) and have a few questions.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs h-13 px-5 rounded-2xl">
                    <MessageCircle className="w-4 h-4 mr-2 text-[#25D366]" /> Chat with Expert
                  </Button>
                </a>
              </div>
            </div>
          </section>

          {/* Day-by-Day Detailed Itinerary */}
          {days.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Day-by-Day Schedule</h2>
                  <p className="text-xs text-slate-400">Carefully designed routing for maximum comfort and immersive sightseeing</p>
                </div>
                <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
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
                      className="bg-slate-950 border border-slate-800/80 rounded-3xl p-6 transition-all hover:border-slate-700 shadow-md"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#C9A25A]/10 border border-[#C9A25A]/30 text-[#C9A25A] flex items-center justify-center font-black text-sm">
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
                          <div className="inline-flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                            <Hotel className="w-3.5 h-3.5 text-[#C9A25A]" />
                            <span className="font-bold">{d.hotel_name}</span>
                            {d.room_type && <span className="text-slate-400 text-[10px]">({d.room_type})</span>}
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
                              <div key={act.id || aIdx} className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-3 flex items-start gap-3">
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

          {/* Inclusions & Policies */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inclusions */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Package Inclusions
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Premium accommodation as per selected category.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Daily buffet breakfast & chef-curated meals as specified.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Dedicated private air-conditioned vehicle for the entire itinerary.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Driver allowances, fuel charges, tolls, parking, and interstate permits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>24/7 dedicated Ghumo Firoo personal travel concierge on WhatsApp/Call.</span>
                </li>
              </ul>
            </div>

            {/* Booking & Operational Process */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#C9A25A] font-black text-sm uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Booking & Voucher Process
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-[#C9A25A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                  <p><span className="font-bold text-white">1-Click Acceptance:</span> Choose your preferred tier and click Accept. Your tour dates are provisionally locked.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-[#C9A25A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                  <p><span className="font-bold text-white">Proforma Invoice & Deposit:</span> Our finance desk generates your official Proforma Invoice with secure payment link for deposit (30%-50%).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-[#C9A25A] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                  <p><span className="font-bold text-white">Master Service Voucher Release:</span> Upon advance payment confirmation and operations verification, your official Service Voucher with hotel voucher codes and cab/driver contact is released.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Contact Card */}
          <footer className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center bg-slate-950 p-6 md:p-8 rounded-3xl gap-6 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-9 px-2.5 py-1 rounded-xl bg-white flex items-center justify-center shadow">
                  <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" className="h-6 w-auto object-contain" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-wider">Ghumo Firoo Travels</span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-md">
                Shop No. 210, 2nd Floor, Pratap Complex, Metro Gate No. 3, Munirka, New Delhi - 110067
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-[#C9A25A] pt-1">
                <span>📞 +91 99109 87264 / +91 99999 99999</span>
                <span>✉️ luxury@ghumofiroo.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a 
                href={`https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I am ready to proceed with my tour booking for ${lead.destination}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#25D366] hover:bg-[#20ba56] text-white font-black text-xs h-11 px-5 rounded-xl border-none">
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
          </footer>

        </main>

        {/* 1-Click Acceptance Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Confirm Option Acceptance</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You are selecting <span className="text-white font-bold">{activeOption?.option_name || 'Option 1'}</span> for <span className="text-[#C9A25A] font-bold">₹{Math.round(totalPrice).toLocaleString('en-IN')}</span>.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Destination:</span>
                  <span className="font-bold text-white">{lead.destination}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Travelers:</span>
                  <span className="font-bold text-white">{lead.adult_count || 2} Adults</span>
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
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs h-11 rounded-xl"
                >
                  {isAccepting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" /> Confirm & Book
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
