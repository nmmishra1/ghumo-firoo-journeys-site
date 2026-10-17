import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle, XCircle, MessageSquare, Phone, Check, X, 
  Loader2, AlertTriangle, Calendar, FileText, Share2, Compass, Shield, Award, Hotel, Building2,
  Car, Camera, MapPin, Printer, Download, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/php-backend';

export default function QuoteView() {
  const { token: paramToken } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const effectiveToken = (paramToken && paramToken !== 'view') ? paramToken : (searchParams.get('token') || paramToken || '');

  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  
  // Discussion / request change state
  const [showDiscussModal, setShowDiscussModal] = useState(false);
  const [discussMessage, setDiscussMessage] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    if (!effectiveToken) {
      setError('Missing quote reference token.');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/quote_view.php?token=${encodeURIComponent(effectiveToken)}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 410) {
            throw new Error('This quote proposal has expired.');
          }
          throw new Error('Quote proposal not found or invalid link.');
        }
        return res.json();
      })
      .then(data => {
        if (data.success && data.quote) {
          setQuote(data.quote);
        } else {
          throw new Error(data.error || 'Failed to load quote details.');
        }
      })
      .catch(err => {
        setError(err.message || 'An error occurred while loading this quote.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectiveToken]);

  const handleAction = async (action: 'accept' | 'discuss' | 'reject', customMessage?: string) => {
    if (!effectiveToken) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE}/quote_action.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: effectiveToken,
          action,
          message: customMessage || ''
        })
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: `Proposal ${action === 'accept' ? 'Accepted!' : action === 'discuss' ? 'Revision Requested' : 'Rejected'}`,
          description: action === 'accept' 
            ? 'Thank you! Our travel consultants will contact you to complete the booking.'
            : 'Your comments have been registered in our system. We will contact you shortly.',
          className: 'bg-[#0B1026] text-white border-[#C9A25A]/40'
        });
        
        // Update local quote state status
        setQuote((prev: any) => ({
          ...prev,
          status: action === 'accept' ? 'Accepted' : action === 'discuss' ? 'Discussion' : 'Rejected'
        }));
        
        setShowDiscussModal(false);
        setDiscussMessage('');
      } else {
        throw new Error(data.error || 'Failed to execute action.');
      }
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err.message || 'An error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1026] text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-[#C9A25A] animate-spin mb-4" />
        <p className="text-[#C9A25A] font-semibold text-lg animate-pulse">Loading your custom travel proposal...</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#0B1026] text-white flex flex-col items-center justify-center p-6 text-center">
        <Helmet>
          <title>Proposal Error | Ghumo Firoo Travels</title>
        </Helmet>
        <div className="bg-[#1A2342]/40 border border-[#C9A25A]/20 p-8 rounded-luxury-2xl max-w-md shadow-luxury-lg space-y-6">
          <AlertTriangle className="w-16 h-16 text-[#C9A25A] mx-auto animate-bounce" />
          <h2 className="text-2xl font-display font-bold text-gradient-sunset">Proposal Unavailable</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{error || 'This custom itinerary quote could not be loaded.'}</p>
          <div className="border-t border-[#C9A25A]/25 pt-4 space-y-3">
            <a 
              href="https://wa.me/919910987264?text=Hi!+I+have+a+question+about+my+travel+proposal" 
              className="block w-full"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-[#C9A25A] hover:bg-[#B89149] text-[#0B1026] font-semibold">
                Chat on WhatsApp
              </Button>
            </a>
            <Link to="/" className="block text-xs text-gray-400 hover:text-white transition-colors">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    package_name: packageName,
    total_amount: totalAmount,
    version_number: versionNumber,
    status,
    expires_at: expiresAt,
    cost_breakdown: costBreakdown,
    inclusions,
    exclusions,
    terms,
    notes,
    customer_name: customerName,
    share_message: shareMessage
  } = quote;

  const expiryDateFormatted = expiresAt 
    ? new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '7 Days from Issue';

  const waContactUrl = `https://wa.me/919910987264?text=Hi!+I+am+reviewing+proposal+V${versionNumber}+for+${encodeURIComponent(packageName)}+and+would+like+to+discuss+details.`;

  const allItems = Array.isArray(costBreakdown?.items) ? costBreakdown.items : [];
  const hotelItems = allItems.filter((i: any) => i.type === 'hotel');
  const transferItems = allItems.filter((i: any) => i.type === 'transfer');
  const excursionItems = allItems.filter((i: any) => i.type === 'excursion');

  // Resolve Day-by-Day Itinerary (from saved itineraryDays or auto-generated from items)
  const totalNights = hotelItems.reduce((sum: number, h: any) => sum + (Number(h.qty) || 0), 0) || 4;
  const savedDays = Array.isArray(costBreakdown?.itineraryDays) && costBreakdown.itineraryDays.length > 0
    ? costBreakdown.itineraryDays
    : Array.from({ length: totalNights + 1 }, (_, i) => {
        const dayNum = i + 1;
        const primaryHotel = hotelItems[0]?.name || 'Handpicked Resort / Hotel';
        const spot = excursionItems[i % Math.max(excursionItems.length, 1)]?.name;
        if (dayNum === 1) {
          return {
            day: 1,
            title: `Arrival & Welcome Transfer — Check-in at ${primaryHotel}`,
            description: `Meet & Greet upon arrival by our representative and transfer in your private cab (${transferItems[0]?.name || 'Dedicated AC Vehicle'}) to ${primaryHotel}. Evening at leisure to acclimatize and explore nearby promenades.`
          };
        }
        if (dayNum === totalNights + 1) {
          return {
            day: dayNum,
            title: 'Breakfast, Check-out & Departure Drop',
            description: `Enjoy a relaxed morning breakfast at the hotel. Complete check-out formalities and proceed via private cab transfer to the airport/railway station with unforgettable memories.`
          };
        }
        return {
          day: dayNum,
          title: spot ? `Full-Day Guided Sightseeing: ${spot}` : `Day ${dayNum} Local Exploration & Curated Experiences`,
          description: `After breakfast at ${primaryHotel}, embark on a full-day private excursion${spot ? ` covering ${spot}` : ''}. Enjoy scenic viewpoints, cultural landmarks, and return comfortably in the evening.`
        };
      });

  const displayInclusions: string[] = Array.isArray(inclusions) && inclusions.length > 0
    ? inclusions
    : [
        ...hotelItems.map((h: any) => `${h.qty} Night(s) accommodation at ${h.name}${h.detail ? ` (${h.detail})` : ''}`),
        ...transferItems.map((t: any) => `Dedicated Private Cab: ${t.name}${t.detail ? ` (${t.detail})` : ''}`),
        ...excursionItems.map((e: any) => `Guided Sightseeing & Excursion: ${e.name}`),
        'All toll taxes, parking fees, state permits, and driver allowances included',
        '24/7 Dedicated Ghumo Firoo Travel Concierge Support'
      ];

  const displayExclusions: string[] = Array.isArray(exclusions) && exclusions.length > 0
    ? exclusions
    : [
        'Airfare / Train tickets unless explicitly mentioned in inclusions',
        'Personal expenses such as laundry, telephone calls, tips, and room heater charges',
        'Monument camera fees or optional adventure activities (paragliding, rafting, Gondola Phase 2)',
        'Anything not specifically mentioned under "Package Inclusions"'
      ];

  return (
    <div className="min-h-screen bg-[#060A18] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden print:bg-white print:text-slate-900 print:py-4">
      <Helmet>
        <title>{packageName} Custom Proposal | Ghumo Firoo Travels</title>
      </Helmet>

      {/* Decorative blurred backdrops */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#C9A25A]/5 rounded-full blur-3xl pointer-events-none print:hidden" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1A2342]/10 rounded-full blur-3xl pointer-events-none print:hidden" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Brand Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center border-b border-[#C9A25A]/20 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <Compass className="w-10 h-10 text-[#C9A25A]" />
            <div>
              <h1 className="text-2xl font-display font-bold tracking-wider text-gradient-sunset">GHUMO FIROO TRAVELS</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A25A]/80 font-medium">Bespoke Travel Packages &amp; Experiences</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="border-[#C9A25A]/40 bg-[#1A2342]/40 hover:bg-[#C9A25A] hover:text-[#0B1026] text-white text-xs font-bold gap-1.5 print:hidden"
            >
              <Printer className="w-3.5 h-3.5" /> Download / Print PDF
            </Button>
            <div className="text-center sm:text-right">
              <Badge variant="luxury" className="text-xs">Version V{versionNumber}</Badge>
              <p className="text-xs text-gray-400 mt-1">Status: <span className="font-semibold text-white">{status}</span></p>
            </div>
          </div>
        </header>

        {/* Personalized Message from Agent */}
        {shareMessage && (
          <div className="bg-[#1A2342]/30 border border-[#C9A25A]/25 rounded-luxury-xl p-5 shadow-luxury-md">
            <p className="text-xs text-[#C9A25A]/90 font-semibold uppercase tracking-wider mb-2">Message From Your Travel Advisor:</p>
            <p className="text-sm italic text-gray-300">"{shareMessage}"</p>
          </div>
        )}

        {/* Core Summary Card — STRICTLY SHOWS ONLY TOTAL PACKAGE INVESTMENT (NO ITEMIZED BREAKUP) */}
        <Card className="glass-card border-[#C9A25A]/25 overflow-hidden shadow-luxury-lg">
          <CardHeader className="bg-[#1A2342]/20 border-b border-[#C9A25A]/15 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardDescription className="text-xs text-[#C9A25A]/90 uppercase tracking-widest font-semibold">Bespoke Proposal For {customerName}</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">{packageName}</CardTitle>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Package Cost</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#C9A25A] font-display mt-0.5">
                  ₹{Number(totalAmount || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">All-Inclusive Package Price (Hotel + Cab + Sightseeing)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Validity and Package Price Guarantee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Proposal Info */}
              <div className="bg-[#0B1026]/40 rounded-xl p-4 border border-[#C9A25A]/10 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="w-4 h-4 text-[#C9A25A]" />
                  <span>Valid Until: <strong>{expiryDateFormatted}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FileText className="w-4 h-4 text-[#C9A25A]" />
                  <span>Proposal Reference: <strong>GF-QT-{String(quote.id || '').substring(0, 8).toUpperCase()}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield className="w-4 h-4 text-[#C9A25A]" />
                  <span>Contracted Rate Guarantee: <strong>Verified Net Package</strong></span>
                </div>
              </div>

              {/* All-Inclusive Package Summary */}
              <div className="bg-[#0B1026]/40 rounded-xl p-4 border border-[#C9A25A]/10 space-y-2">
                <h4 className="text-xs text-[#C9A25A] uppercase tracking-wider font-semibold mb-2">Single Consolidated Package Price</h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Consolidated Package Total</span>
                    <span className="font-extrabold text-[#C9A25A] text-lg font-display">₹{Number(totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium pt-1 border-t border-[#C9A25A]/10">
                    Includes all listed hotel stays, private cab transfers, curated sightseeing, applicable taxes, and 24/7 trip concierge.
                  </p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Handpicked Accommodations & Hotel Stays (NO PRICE SHOWN) */}
        {hotelItems.length > 0 && (
          <Card className="bg-[#0B1026]/30 border border-[#C9A25A]/20 shadow-md rounded-luxury-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#C9A25A]/15 bg-[#1A2342]/20">
              <CardTitle className="text-lg font-display text-white flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <Hotel className="w-5 h-5 text-[#C9A25A]" /> Handpicked Accommodations &amp; Hotel Stays
                </span>
                <Badge variant="luxury" className="text-[10px]">Included in Total Cost</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hotelItems.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[#0B1026]/60 border border-[#C9A25A]/15 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#C9A25A]" /> {item.name}
                      </span>
                      <Badge className="bg-[#C9A25A]/20 text-[#C9A25A] border-[#C9A25A]/30 text-[10px] font-bold">
                        {item.qty} {item.qty === 1 ? 'Night' : 'Nights'} Stay
                      </Badge>
                    </div>
                    {item.detail && (
                      <p className="text-xs text-gray-300 font-medium leading-relaxed">
                        {item.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dedicated Cab Transfers & Sightseeing Experiences (NO PRICE SHOWN) */}
        {(transferItems.length > 0 || excursionItems.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transferItems.length > 0 && (
              <Card className="bg-[#0B1026]/30 border border-[#C9A25A]/20 shadow-md rounded-luxury-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-[#C9A25A]/15 bg-[#1A2342]/20">
                  <CardTitle className="text-base font-display text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#C9A25A]" /> Dedicated Private Cab &amp; Transfers
                    </span>
                    <Badge variant="luxury" className="text-[10px]">Included</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2.5">
                  {transferItems.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#0B1026]/60 border border-[#C9A25A]/15 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        {item.detail && <p className="text-[11px] text-gray-400 mt-0.5">{item.detail}</p>}
                      </div>
                      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px]">
                        {item.qty} {item.qty === 1 ? 'Day' : 'Days'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {excursionItems.length > 0 && (
              <Card className="bg-[#0B1026]/30 border border-[#C9A25A]/20 shadow-md rounded-luxury-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-[#C9A25A]/15 bg-[#1A2342]/20">
                  <CardTitle className="text-base font-display text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#C9A25A]" /> Curated Sightseeing &amp; Experiences
                    </span>
                    <Badge variant="luxury" className="text-[10px]">Included</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2.5">
                  {excursionItems.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#0B1026]/60 border border-[#C9A25A]/15 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        {item.detail && <p className="text-[11px] text-gray-400 mt-0.5">{item.detail}</p>}
                      </div>
                      <Badge className="bg-[#C9A25A]/20 text-[#C9A25A] border-[#C9A25A]/30 text-[10px]">
                        Included
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Day-by-Day Travel Itinerary */}
        {savedDays.length > 0 && (
          <Card className="bg-[#0B1026]/30 border border-[#C9A25A]/20 shadow-md rounded-luxury-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#C9A25A]/15 bg-[#1A2342]/20">
              <CardTitle className="text-lg font-display text-white flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-[#C9A25A]" /> Day-by-Day Travel Itinerary
                </span>
                <Badge variant="luxury" className="text-[10px]">{savedDays.length} Days Plan</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {savedDays.map((d: any, idx: number) => (
                <div key={idx} className="relative pl-4 border-l-2 border-[#C9A25A]/40 bg-[#0B1026]/50 p-4 rounded-r-xl border-y border-r border-y-[#C9A25A]/10 border-r-[#C9A25A]/10 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#C9A25A] text-[#0B1026] font-extrabold text-[11px] uppercase tracking-wider">
                        Day {d.day || idx + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white">{d.title}</h4>
                    </div>
                    {hotelItems[0]?.name && idx < savedDays.length - 1 && (
                      <span className="text-[11px] text-[#C9A25A]/90 flex items-center gap-1 font-medium">
                        <Hotel className="w-3 h-3" /> Stay: {d.hotel || hotelItems[Math.min(idx, hotelItems.length - 1)]?.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                    {d.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Inclusions */}
          <Card className="bg-[#0B1026]/30 border border-[#C9A25A]/15 shadow-sm rounded-luxury-xl">
            <CardHeader className="pb-3 border-b border-[#C9A25A]/10">
              <CardTitle className="text-lg font-display text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />
                Package Inclusions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5 text-sm text-gray-300">
                {displayInclusions.map((inc: string, idx: number) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-[#C9A25A] flex-shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Exclusions */}
          <Card className="bg-[#0B1026]/30 border border-[#C9A25A]/15 shadow-sm rounded-luxury-xl">
            <CardHeader className="pb-3 border-b border-[#C9A25A]/10">
              <CardTitle className="text-lg font-display text-white flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                Package Exclusions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5 text-sm text-gray-300">
                {displayExclusions.map((exc: string, idx: number) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <X className="w-4 h-4 text-red-500/80 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400">{exc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

        </div>

        {/* Terms and Notes */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-[#0B1026]/20 border border-[#C9A25A]/15 rounded-luxury-xl">
            <CardHeader className="pb-2 border-b border-[#C9A25A]/10">
              <CardTitle className="text-sm uppercase tracking-wider text-[#C9A25A] font-semibold">Terms, Conditions & Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-sm text-gray-300 leading-relaxed">
              {notes && (
                <div>
                  <h5 className="font-semibold text-white mb-1">Proposal Specific Notes:</h5>
                  <p className="whitespace-pre-line text-xs sm:text-sm text-gray-400">{notes}</p>
                </div>
              )}
              {terms ? (
                <div>
                  <h5 className="font-semibold text-white mb-1">Standard Booking Terms:</h5>
                  <p className="whitespace-pre-line text-xs text-gray-400">{terms}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Standard terms: 50% advance booking deposit required. Cancellations apply as per operator policy.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Interaction Controls */}
        <div className="bg-[#1A2342]/20 border border-[#C9A25A]/25 rounded-luxury-2xl p-6 sm:p-8 text-center space-y-6 shadow-luxury-md">
          <h3 className="text-lg sm:text-xl font-display font-bold text-white">How would you like to proceed with this proposal?</h3>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            
            {status === 'Accepted' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl py-3 px-6 text-emerald-400 font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>You have Accepted this Proposal!</span>
              </div>
            ) : status === 'Rejected' ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl py-3 px-6 text-red-400 font-semibold flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>You have Rejected this Proposal.</span>
              </div>
            ) : (
              <>
                <Button 
                  onClick={() => handleAction('accept')} 
                  disabled={submittingAction}
                  className="w-full sm:w-auto h-12 px-8 bg-[#C9A25A] hover:bg-[#B89149] text-[#0B1026] font-bold text-base shadow-luxury rounded-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Accept Proposal
                </Button>
                
                <Button 
                  onClick={() => setShowDiscussModal(true)} 
                  disabled={submittingAction}
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-8 border-[#C9A25A]/40 hover:bg-[#1A2342]/50 text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Request Revisions
                </Button>
              </>
            )}

            <a 
              href={waContactUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto"
            >
              <Button 
                variant="ghost" 
                className="w-full sm:w-auto h-12 px-6 hover:bg-[#1A2342]/30 text-green-400 hover:text-green-300 font-semibold rounded-xl flex items-center justify-center gap-2 border border-green-500/20"
              >
                <Phone className="w-4 h-4" />
                Discuss on WhatsApp
              </Button>
            </a>

          </div>
        </div>

        {/* Premium Brand Footer */}
        <footer className="text-center py-6 space-y-2 border-t border-[#C9A25A]/15 text-xs text-gray-500 select-none">
          <p className="text-[#C9A25A]/90 font-semibold tracking-widest">✦ Ghumo Firoo Travels ✦</p>
          <p>© {new Date().getFullYear()} Ghumo Firoo Travels. All Rights Reserved.</p>
          <div className="flex justify-center gap-4 pt-1 font-semibold text-gray-400">
            <a href="mailto:info@ghumofiroo.com" className="hover:text-white transition-colors">info@ghumofiroo.com</a>
            <span>•</span>
            <a href="tel:+919910987264" className="hover:text-white transition-colors">+91-9910987264</a>
          </div>
        </footer>

      </div>

      {/* Discussion Dialog overlay */}
      {showDiscussModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-[#0B1026] border border-[#C9A25A]/30 text-white shadow-luxury-2xl rounded-luxury-xl">
            <CardHeader className="pb-3 border-b border-[#C9A25A]/10">
              <CardTitle className="text-lg font-display text-white">Specify Revision Requests</CardTitle>
              <CardDescription className="text-xs text-gray-400">Provide details of changes you require (hotels, routes, dates, budget adjustments, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <textarea
                value={discussMessage}
                onChange={(e) => setDiscussMessage(e.target.value)}
                placeholder="E.g. We want standard 4-star hotels instead of luxury properties, and need to change the travel date to 15th Sept..."
                rows={5}
                className="w-full bg-[#121831] border border-[#C9A25A]/25 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A25A] focus:ring-1 focus:ring-[#C9A25A]"
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDiscussModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleAction('discuss', discussMessage)}
                  disabled={submittingAction || !discussMessage.trim()}
                  className="bg-[#C9A25A] hover:bg-[#B89149] text-[#0B1026] font-semibold"
                >
                  {submittingAction && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                  Submit Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
