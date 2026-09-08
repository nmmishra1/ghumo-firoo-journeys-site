import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Edit2, 
  X, 
  ExternalLink, 
  MessageCircle, 
  History, 
  Plane, 
  Compass, 
  Users, 
  Check, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerData {
  id: string | number;
  name: string;
  mobile: string;
  email: string;
  home_city?: string;
  total_leads: number;
  total_bookings: number;
  all_leads?: any[];
}

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerData | null;
  onCityUpdated?: (customerId: string | number, newCity: string) => void;
  onSelectLead?: (leadId: string) => void;
  onCreateItinerary?: (lead: any) => void;
  onCreateQuote?: (lead: any) => void;
}

export interface FormattedDestination {
  title: string;
  route?: string;
  durationBadge?: string;
  isMultiCity: boolean;
}

/**
 * Robust destination parser that extracts clean package titles and route sequences
 * even if stored as a JSON array of stops or objects.
 */
export function formatLeadDestinationInfo(lead: any): FormattedDestination {
  if (!lead) return { title: 'Custom Tour', isMultiCity: false };

  const candidates = [
    lead.packageName,
    lead.package_name,
    lead.destinations,
    lead.destination,
    Array.isArray(lead.lead_destination) ? lead.lead_destination[0] : lead.lead_destination
  ];

  let rawStops: any[] = [];
  let fallbackTitle = '';

  for (const item of candidates) {
    if (!item) continue;
    if (Array.isArray(item)) {
      rawStops = item;
      break;
    }
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawStops = parsed;
            break;
          }
        } catch {}
      } else if (!fallbackTitle && trimmed.length > 0) {
        fallbackTitle = trimmed;
      }
    }
  }

  // If candidate had generic title (e.g. "Website Enquiry"), but destinations has JSON stops, inspect lead.destinations
  if (rawStops.length === 0 && typeof lead.destinations === 'string' && lead.destinations.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(lead.destinations.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawStops = parsed;
      }
    } catch {}
  }

  if (rawStops.length > 0) {
    const stops = rawStops.map((s: any) => {
      if (typeof s === 'string') return { city: s.trim(), state: '', nights: 1 };
      if (typeof s === 'object' && s !== null) {
        return {
          city: (s.city || s.name || s.destination || '').trim(),
          state: (s.state || '').trim(),
          nights: Number(s.nights) || 1
        };
      }
      return null;
    }).filter(Boolean) as { city: string; state: string; nights: number }[];

    if (stops.length > 0) {
      const totalNights = stops.reduce((sum, s) => sum + (s.nights || 1), 0);
      const uniqueStates = Array.from(new Set(stops.map(s => s.state).filter(Boolean)));
      const statePrefix = uniqueStates.length === 1 ? uniqueStates[0] : (uniqueStates.length > 1 ? uniqueStates.join(' & ') : '');
      const durationBadge = `${totalNights}N/${totalNights + 1}D`;
      const route = stops.map(s => `${s.city}${s.nights ? ` (${s.nights}N)` : ''}`).join(' → ');
      
      const title = statePrefix 
        ? `${statePrefix} Tour (${stops.map(s => s.city).join(' · ')})`
        : stops.map(s => s.city).join(' → ');

      return {
        title,
        route,
        durationBadge,
        isMultiCity: true
      };
    }
  }

  if (fallbackTitle) {
    return {
      title: fallbackTitle,
      isMultiCity: false
    };
  }

  return {
    title: 'Custom Tour',
    isMultiCity: false
  };
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  onCityUpdated,
  onSelectLead,
  onCreateItinerary,
  onCreateQuote
}) => {
  const { toast } = useToast();
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [isSavingCity, setIsSavingCity] = useState(false);
  const [currentCity, setCurrentCity] = useState('');

  useEffect(() => {
    if (customer) {
      const city = (customer.home_city && customer.home_city !== '---') ? customer.home_city : '';
      setCurrentCity(city);
      setCityInput(city);
      setIsEditingCity(false);
    }
  }, [customer]);

  if (!customer) return null;

  const leadsList = (customer.all_leads || []).slice().sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
    const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
    return dateB - dateA;
  });

  const confirmedTrips = leadsList.filter(l => (l.status || '').toLowerCase().includes('confirmed'));
  const totalLifetimeValue = leadsList.reduce((sum, l) => {
    const val = Number(l.packagePrice || l.package_price || l.expectedBookingValue || l.expected_booking_value || l.packageCost || 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const cleanPhone = (customer.mobile || '').replace(/[^0-9]/g, '');
  const whatsAppUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}` : null;

  const handleSaveCity = async () => {
    if (!cityInput.trim()) {
      toast({
        title: "City is required",
        description: "Please enter a valid home city name.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingCity(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const leadIds = leadsList.map(l => l.id).filter(Boolean);

      const res = await fetch('/php-backend/customer_update.php', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          home_city: cityInput.trim(),
          customer_phone: customer.mobile !== '---' ? customer.mobile : '',
          customer_email: customer.email !== '---' ? customer.email : '',
          customer_name: customer.name,
          lead_ids: leadIds
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to update city (${res.status})`);
      }

      setCurrentCity(cityInput.trim());
      setIsEditingCity(false);

      if (onCityUpdated) {
        onCityUpdated(customer.id, cityInput.trim());
      }

      toast({
        title: "Home City Updated",
        description: `Set home city to "${cityInput.trim()}" across all enquiries for ${customer.name}.`,
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update home city in database.",
        variant: "destructive"
      });
    } finally {
      setIsSavingCity(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'New').toLowerCase();
    if (s.includes('confirmed')) {
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"><CheckCircle2 className="w-3 h-3 mr-1 inline" />Confirmed</Badge>;
    }
    if (s.includes('follow') || s.includes('due')) {
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"><Clock className="w-3 h-3 mr-1 inline" />Follow-up Due</Badge>;
    }
    if (s.includes('quote') || s.includes('proposal')) {
      return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"><FileText className="w-3 h-3 mr-1 inline" />Quote Sent</Badge>;
    }
    if (s.includes('lost') || s.includes('cancel')) {
      return <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"><AlertCircle className="w-3 h-3 mr-1 inline" />Lost</Badge>;
    }
    return <Badge className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs">{status || 'New'}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent 
        className="max-w-none w-screen h-screen m-0 rounded-none bg-slate-50 dark:bg-slate-950 p-0 flex flex-col border-0 overflow-hidden shadow-none"
        aria-describedby="passenger-profile-description"
      >
        <DialogTitle className="sr-only">Customer 360° Passenger Profile Hub</DialogTitle>
        <DialogDescription id="passenger-profile-description" className="sr-only">
          Full screen passenger history, lifetime analytics, enquiries, and communication logs.
        </DialogDescription>
        
        {/* TOP SYSTEM BAR */}
        <div className="bg-slate-950 text-slate-100 px-6 py-3 border-b border-slate-900 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 px-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Customers
            </Button>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-black tracking-wider uppercase text-amber-400">
                Customer 360° Passenger Hub
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (Client #{customer.id})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              title="Close Profile (Esc)"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PASSENGER IDENTITY & LIFETIME METRICS BANNER */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-5 shrink-0 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Passenger Header Details */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md border border-amber-300 shrink-0">
                {getInitials(customer.name)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                    {customer.name}
                  </h1>
                  {confirmedTrips.length > 0 ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-extrabold text-xs px-2.5 py-0.5">
                      ⭐ Confirmed Traveler ({confirmedTrips.length} Bookings)
                    </Badge>
                  ) : leadsList.length > 1 ? (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-extrabold text-xs px-2.5 py-0.5">
                      🔥 High-Intent Prospect ({leadsList.length} Enquiries)
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 font-extrabold text-xs px-2.5 py-0.5">
                      Verified Prospect
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium pt-0.5">
                  {/* Phone */}
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {customer.mobile !== '---' ? (
                      <a href={`tel:${customer.mobile}`} className="hover:underline hover:text-slate-950 dark:hover:text-white font-semibold font-mono">
                        {customer.mobile}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No phone on file</span>
                    )}
                  </span>

                  {/* Email */}
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {customer.email !== '---' ? (
                      <a href={`mailto:${customer.email}`} className="hover:underline hover:text-slate-950 dark:hover:text-white font-semibold font-mono">
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No email on file</span>
                    )}
                  </span>

                  {/* Home City with Inline Editor */}
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-slate-500">Home City:</span>
                    {isEditingCity ? (
                      <div className="flex items-center gap-1">
                        <Input 
                          size={1}
                          value={cityInput}
                          onChange={(e) => setCityInput(e.target.value)}
                          placeholder="e.g. Delhi NCR, Mumbai"
                          className="h-6 text-xs w-36 px-2 py-0 border-amber-400 bg-white dark:bg-slate-800 font-bold"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveCity();
                            if (e.key === 'Escape') setIsEditingCity(false);
                          }}
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          disabled={isSavingCity}
                          onClick={handleSaveCity} 
                          className="h-6 w-6 p-0 text-emerald-600 hover:bg-emerald-500/10"
                          title="Save City"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setIsEditingCity(false)} 
                          className="h-6 w-6 p-0 text-slate-500 hover:bg-slate-200"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1">
                        <strong className="font-bold text-slate-900 dark:text-slate-200">
                          {currentCity || <span className="text-slate-400 italic font-normal">Not set</span>}
                        </strong>
                        <button 
                          onClick={() => { setCityInput(currentCity); setIsEditingCity(true); }}
                          className="p-1 text-slate-400 hover:text-amber-600 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Home City"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Connect Quick Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              {whatsAppUrl && (
                <Button 
                  size="sm" 
                  onClick={() => window.open(whatsAppUrl, '_blank')}
                  className="h-10 px-4 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs gap-2 cursor-pointer"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Client
                </Button>
              )}
              {customer.mobile !== '---' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`tel:${customer.mobile}`)}
                  className="h-10 px-4 text-xs font-extrabold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl gap-2 cursor-pointer"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4 text-amber-500" /> Call
                </Button>
              )}
              {customer.email !== '---' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`mailto:${customer.email}`)}
                  className="h-10 px-4 text-xs font-extrabold border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl gap-2 cursor-pointer"
                  title="Email Customer"
                >
                  <Mail className="w-4 h-4" /> Email
                </Button>
              )}
            </div>
          </div>

          {/* LIFETIME PASSENGER STATS KPI CARDS */}
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Enquiries</span>
                <span className="text-2xl font-black text-slate-950 dark:text-white mt-0.5 block">{leadsList.length}</span>
                <span className="text-[11px] text-slate-500 font-medium">Trips enquired</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                <History className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Confirmed Bookings</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{confirmedTrips.length}</span>
                <span className="text-[11px] text-slate-500 font-medium">{confirmedTrips.length > 0 ? 'Active traveler' : 'No bookings yet'}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Quoted Pipeline</span>
                <span className="text-2xl font-black text-slate-950 dark:text-white mt-0.5 block">
                  {totalLifetimeValue > 0 ? `₹${totalLifetimeValue.toLocaleString('en-IN')}` : '---'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Cumulative value</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/30">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-100/80 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Home Origin</span>
                <span className="text-base font-black text-slate-950 dark:text-white mt-1 block truncate max-w-[140px]">
                  {currentCity || 'Not recorded'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Departure city</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center border border-rose-500/30">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* FULLSCREEN WORKSPACE BODY: TABS CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="enquiries" className="w-full">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <TabsList className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                  <TabsTrigger value="enquiries" className="font-extrabold text-xs px-4 py-2 gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs">
                    <History className="w-4 h-4 text-amber-500" /> Complete Trip & Enquiry History ({leadsList.length})
                  </TabsTrigger>
                  <TabsTrigger value="discussions" className="font-extrabold text-xs px-4 py-2 gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs">
                    <MessageCircle className="w-4 h-4 text-blue-500" /> Notes & Communication Timeline
                  </TabsTrigger>
                </TabsList>

                <span className="text-xs text-slate-500 font-medium">
                  Showing {leadsList.length} recorded enquiries for {customer.name}
                </span>
              </div>

              {/* TAB 1: ENQUIRY & TRIP HISTORY */}
              <TabsContent value="enquiries" className="space-y-4 mt-0">
                {leadsList.length === 0 ? (
                  <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <Plane className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
                    <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No linked enquiries found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">This customer record was created without associated website enquiries.</p>
                  </div>
                ) : (
                  leadsList.map((lead, idx) => {
                    const leadId = lead.id || lead.lead_id;
                    const destInfo = formatLeadDestinationInfo(lead);
                    const travelDates = lead.tripStartDate || lead.trip_start_date || lead.travelMonth || lead.travel_month || 'Dates TBD';
                    const paxCount = (lead.adultCount || lead.adult_count || 1) + (lead.childCount || lead.child_count || 0);
                    const price = lead.packagePrice || lead.package_price || lead.expectedBookingValue || lead.expected_booking_value || lead.budget;
                    const createdDate = lead.createdAt || lead.created_at || '';
                    const formattedDate = createdDate ? new Date(createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---';
                    const note = lead.notes || lead.remarks || lead.discussion_notes;

                    return (
                      <div 
                        key={leadId || idx}
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-400/70 hover:shadow-md transition-all group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            {/* Lead Badge & Destination Title */}
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-xs font-black px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-mono">
                                #GF-{leadId}
                              </span>
                              <h3 className="text-base font-black text-slate-950 dark:text-white group-hover:text-amber-600 transition-colors">
                                {destInfo.title}
                              </h3>
                              {destInfo.durationBadge && (
                                <Badge variant="outline" className="text-xs font-black bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 px-2 py-0.5">
                                  {destInfo.durationBadge}
                                </Badge>
                              )}
                              {getStatusBadge(lead.status)}
                            </div>

                            {/* Clean Route Pill (if multi-city tour) */}
                            {destInfo.route && (
                              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/20 w-fit">
                                <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>Route: {destInfo.route}</span>
                              </div>
                            )}

                            {/* Key Trip Parameters */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                Travel: <strong className="text-slate-900 dark:text-slate-100 font-bold">{travelDates}</strong>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-blue-500" />
                                Pax: <strong className="text-slate-900 dark:text-slate-100 font-bold">{paxCount} {paxCount === 1 ? 'Traveler' : 'Travelers'}</strong>
                              </span>
                              {price && price !== '---' && (
                                <span className="flex items-center gap-1.5">
                                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                  Value: <strong className="text-slate-900 dark:text-slate-100 font-bold">{typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price}</strong>
                                </span>
                              )}
                              <span className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                Received: <strong className="text-slate-600 dark:text-slate-400 font-medium">{formattedDate}</strong>
                              </span>
                            </div>

                            {/* Remarks / Discussion Notes Box */}
                            {note && (
                              <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/80 mt-2 max-w-3xl">
                                <span className="font-bold text-slate-900 dark:text-slate-200 mr-1.5">Notes:</span>
                                {note}
                              </div>
                            )}
                          </div>

                          {/* Actions for this lead */}
                          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0 pt-2 lg:pt-0">
                            {onSelectLead && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  onClose();
                                  onSelectLead(String(leadId));
                                }}
                                className="h-9 px-3.5 text-xs font-black border-slate-300 dark:border-slate-700 hover:bg-slate-100 rounded-xl gap-1.5 cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Open Lead Details
                              </Button>
                            )}

                            {onCreateItinerary && (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  onClose();
                                  onCreateItinerary(lead);
                                }}
                                className="h-9 px-4 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-xs rounded-xl gap-1.5 cursor-pointer"
                              >
                                <Compass className="w-3.5 h-3.5" /> Build Itinerary & Quote
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </TabsContent>

              {/* TAB 2: UNIFIED DISCUSSIONS & COMMUNICATION LOGS */}
              <TabsContent value="discussions" className="space-y-4 mt-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-amber-500" /> Aggregated Communication History Across All Enquiries
                  </h4>
                  
                  {leadsList.filter(l => (l.notes || l.remarks || l.discussion_notes || (l.discussions && l.discussions.length > 0))).length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-slate-500 italic">No communication logs or notes recorded yet for this passenger.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leadsList.map((lead, idx) => {
                        const note = lead.notes || lead.remarks || lead.discussion_notes;
                        const discussions = lead.discussions || [];
                        if (!note && discussions.length === 0) return null;

                        const destInfo = formatLeadDestinationInfo(lead);
                        return (
                          <div key={idx} className="border-l-2 border-amber-500 pl-4 py-1 space-y-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
                                #GF-{lead.id}
                              </span>
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                {destInfo.title}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB') : ''}
                              </span>
                            </div>
                            {note && (
                              <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                                {note}
                              </div>
                            )}
                            {discussions.map((d: any, dIdx: number) => (
                              <div key={dIdx} className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60">
                                <span className="font-bold text-slate-800 dark:text-slate-200">{d.createdBy || 'Agent'}:</span> {d.text}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* BOTTOM SYSTEM FOOTER */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">
            Passenger Profile: <strong className="text-slate-900 dark:text-slate-100 font-bold">{customer.name}</strong> • CRM ID: <strong className="text-slate-700 dark:text-slate-300 font-mono">#{customer.id}</strong>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            className="font-black text-xs h-8 px-4 rounded-lg cursor-pointer"
          >
            Close Profile
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};
