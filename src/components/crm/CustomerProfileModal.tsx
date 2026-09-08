import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
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
  Save, 
  X, 
  ExternalLink, 
  MessageCircle, 
  History, 
  Sparkles,
  Plane,
  Compass,
  Users,
  Building2,
  Check
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
        description: `Set home city to "${cityInput.trim()}" across ${leadIds.length || 1} enquiries for ${customer.name}.`,
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        
        {/* MODAL HEADER: Passenger Banner & Actions */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md border border-amber-300">
                {getInitials(customer.name)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
                    {customer.name}
                  </h2>
                  {confirmedTrips.length > 0 ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-extrabold text-xs">
                      Confirmed Traveler ({confirmedTrips.length} Bookings)
                    </Badge>
                  ) : leadsList.length > 1 ? (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-extrabold text-xs">
                      High-Intent Prospect ({leadsList.length} Enquiries)
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 font-extrabold text-xs">
                      New Lead
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {/* Phone */}
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {customer.mobile !== '---' ? (
                      <a href={`tel:${customer.mobile}`} className="hover:underline hover:text-slate-950 dark:hover:text-white font-semibold">
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
                      <a href={`mailto:${customer.email}`} className="hover:underline hover:text-slate-950 dark:hover:text-white font-semibold">
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No email on file</span>
                    )}
                  </span>

                  {/* Home City with Inline Editor */}
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {isEditingCity ? (
                      <div className="flex items-center gap-1">
                        <Input 
                          size={1}
                          value={cityInput}
                          onChange={(e) => setCityInput(e.target.value)}
                          placeholder="e.g. Delhi NCR, Mumbai"
                          className="h-6 text-xs w-36 px-2 py-0 border-amber-400 bg-white dark:bg-slate-800"
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
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {currentCity || <span className="text-slate-400 italic">Not set (Click edit)</span>}
                        </span>
                        <button 
                          onClick={() => { setCityInput(currentCity); setIsEditingCity(true); }}
                          className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
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
            <div className="flex items-center gap-2 self-start sm:self-center">
              {whatsAppUrl && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(whatsAppUrl, '_blank')}
                  className="h-9 px-3 text-xs font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
                </Button>
              )}
              {customer.mobile !== '---' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`tel:${customer.mobile}`)}
                  className="h-9 px-3 text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4 mr-1.5" /> Call
                </Button>
              )}
              {customer.email !== '---' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`mailto:${customer.email}`)}
                  className="h-9 px-3 text-xs font-bold border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-xl"
                  title="Email Customer"
                >
                  <Mail className="w-4 h-4 mr-1.5" /> Email
                </Button>
              )}
            </div>
          </div>

          {/* LIFETIME PASSENGER STATS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Total Enquiries</span>
              <span className="text-xl font-black text-slate-950 dark:text-white mt-0.5 block">{leadsList.length}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Trips enquired</span>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Confirmed Bookings</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{confirmedTrips.length}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{confirmedTrips.length > 0 ? 'Active traveler' : 'No bookings yet'}</span>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Quoted Pipeline</span>
              <span className="text-xl font-black text-slate-950 dark:text-white mt-0.5 block">
                {totalLifetimeValue > 0 ? `₹${totalLifetimeValue.toLocaleString('en-IN')}` : '---'}
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Cumulative value</span>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Home Origin</span>
              <span className="text-sm font-black text-slate-950 dark:text-white mt-1 block truncate">
                {currentCity || 'Not recorded'}
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Departure city</span>
            </div>
          </div>
        </div>

        {/* MODAL BODY: TABS CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="enquiries" className="w-full">
            <TabsList className="grid grid-cols-2 max-w-md mb-4 bg-slate-200 dark:bg-slate-800 p-1">
              <TabsTrigger value="enquiries" className="font-bold text-xs gap-1.5">
                <History className="w-3.5 h-3.5" /> Enquiry History ({leadsList.length})
              </TabsTrigger>
              <TabsTrigger value="discussions" className="font-bold text-xs gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> Notes & Communications
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: ENQUIRY & TRIP HISTORY */}
            <TabsContent value="enquiries" className="space-y-3 mt-0">
              {leadsList.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Plane className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No linked enquiries found</p>
                  <p className="text-xs text-slate-500 mt-1">This customer record was created without associated website enquiries.</p>
                </div>
              ) : (
                leadsList.map((lead, idx) => {
                  const leadId = lead.id || lead.lead_id;
                  const dest = lead.lead_destination?.[0] || lead.destinations || lead.destination || lead.packageName || lead.package_name || 'Custom Tour';
                  const travelDates = lead.tripStartDate || lead.trip_start_date || lead.travelMonth || lead.travel_month || 'Dates TBD';
                  const paxCount = (lead.adultCount || lead.adult_count || 1) + (lead.childCount || lead.child_count || 0);
                  const price = lead.packagePrice || lead.package_price || lead.expectedBookingValue || lead.expected_booking_value || lead.budget;
                  const createdDate = lead.createdAt || lead.created_at || '';
                  const formattedDate = createdDate ? new Date(createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---';

                  return (
                    <div 
                      key={leadId || idx}
                      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400/60 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              #GF-{leadId}
                            </span>
                            <span className="text-sm font-black text-slate-950 dark:text-white group-hover:text-amber-600 transition-colors">
                              {dest}
                            </span>
                            {getStatusBadge(lead.status)}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-500" />
                              Travel: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{travelDates}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-blue-500" />
                              Pax: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{paxCount} {paxCount === 1 ? 'Traveler' : 'Travelers'}</strong>
                            </span>
                            {price && price !== '---' && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                Value: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price}</strong>
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" />
                              Received: {formattedDate}
                            </span>
                          </div>

                          {/* Notes/Remarks if present */}
                          {(lead.notes || lead.remarks || lead.discussion_notes) && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80 mt-2 line-clamp-2">
                              {lead.notes || lead.remarks || lead.discussion_notes}
                            </p>
                          )}
                        </div>

                        {/* Actions for this lead */}
                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                          {onSelectLead && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                onClose();
                                onSelectLead(String(leadId));
                              }}
                              className="h-8 text-xs font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Lead
                            </Button>
                          )}

                          {onCreateItinerary && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                onClose();
                                onCreateItinerary(lead);
                              }}
                              className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
                            >
                              <Compass className="w-3.5 h-3.5 mr-1" /> Itinerary
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
            <TabsContent value="discussions" className="space-y-3 mt-0">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-amber-500" /> Aggregated Enquiry Notes & Interactions
                </h4>
                
                {leadsList.filter(l => (l.notes || l.remarks || l.discussion_notes || (l.discussions && l.discussions.length > 0))).length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center italic">No communication logs recorded yet for this passenger.</p>
                ) : (
                  <div className="space-y-3">
                    {leadsList.map((lead, idx) => {
                      const note = lead.notes || lead.remarks || lead.discussion_notes;
                      const discussions = lead.discussions || [];
                      if (!note && discussions.length === 0) return null;

                      const dest = lead.lead_destination?.[0] || lead.destinations || lead.packageName || 'Enquiry';
                      return (
                        <div key={idx} className="border-l-2 border-amber-500 pl-3 py-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                              Enquiry #{lead.id} ({dest})
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB') : ''}
                            </span>
                          </div>
                          {note && (
                            <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                              {note}
                            </p>
                          )}
                          {discussions.map((d: any, dIdx: number) => (
                            <div key={dIdx} className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900 p-2 rounded border border-slate-200/50">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{d.createdBy || 'Agent'}:</span> {d.text}
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

        {/* MODAL FOOTER */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Passenger Profile ID: <strong className="text-slate-700 dark:text-slate-300">#{customer.id}</strong>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            className="font-bold text-xs"
          >
            Close
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};
