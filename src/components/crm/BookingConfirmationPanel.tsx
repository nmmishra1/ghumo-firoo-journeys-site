import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, Circle, FileText, Bed, Car, Compass, 
  Loader2, ShieldAlert, ShieldCheck, Download, AlertCircle, Sparkles, ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  generateInvoicePDF,
  generateHotelVoucherPDF,
  generateCabVoucherPDF,
  generateActivityVoucherPDF,
  formatVoucherRef,
} from '@/lib/voucherService';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface HotelLeg {
  id: string;
  hotel_name?: string;
  hotel_address?: string;
  city?: string;
  room_category?: string;
  meal_plan?: string;
  nights?: number;
  rooms?: number;
  check_in?: string;
  check_out?: string;
  confirmation_number?: string;
  hotel_contact?: string;
  confirmation_status?: 'Pending' | 'Confirmed';
}

interface TransportLeg {
  id: string;
  vehicle_type?: string;
  vendor_name?: string;
  pickup_location?: string;
  drop_location?: string;
  pickup_date?: string;
  pickup_time?: string;
  inclusions?: string[];
  driver_name?: string;
  driver_phone?: string;
  vehicle_number?: string;
  confirmation_status?: 'Pending' | 'Confirmed';
}

interface ActivityLeg {
  id: string;
  title?: string;
  activity_name?: string;
  city?: string;
  location?: string;
  activity_date?: string;
  slot_time?: string;
  confirmation_number?: string;
  operator_name?: string;
  guide_contact?: string;
  confirmation_status?: 'Pending' | 'Confirmed';
}

interface AcceptedProposal {
  id: number;
  lead_id: number;
  status: string;
  title: string;
  total_price: number;
  advance_required?: number;
  itinerary_data?: { 
    hotels?: HotelLeg[]; 
    transport?: TransportLeg[];
    activities?: ActivityLeg[];
    days?: any[];
  };
}

interface BookingConfirmationPanelProps {
  leadId: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

// Base64-encode a jsPDF doc's output and upload it via existing document_upload.php
async function uploadPdf(doc: any, leadId: number, fileName: string, docType: string) {
  const base64 = doc.output('datauristring').split(',')[1];
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/document_upload.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({
      lead_id: leadId,
      name: fileName,
      type: 'pdf',
      size: base64.length,
      uploaded_by: 'crm_operations',
      file_base64: base64,
      doc_category: docType
    }),
  });
  return await res.json();
}

export const BookingConfirmationPanel: React.FC<BookingConfirmationPanelProps> = ({
  leadId,
  customerName,
  customerPhone,
  customerEmail,
}) => {
  const { toast } = useToast();
  const [proposal, setProposal] = useState<AcceptedProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingLegId, setSavingLegId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [advance, setAdvance] = useState<{ received: number; required: number; shortfall?: number } | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<Array<{ name: string; url?: string; type: string }>>([]);

  const loadAcceptedProposal = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/proposals.php?lead_id=${leadId}`, { headers });
      const json = await res.json();
      const accepted = (json.data || []).find((p: any) => p.status === 'Accepted');
      
      if (accepted) {
        // Extract flat legs if stored in days metadata blocks
        const itinerary = accepted.itinerary_data || {};
        const flatHotels: HotelLeg[] = [...(itinerary.hotels || [])];
        const flatTransport: TransportLeg[] = [...(itinerary.transport || [])];
        const flatActivities: ActivityLeg[] = [...(itinerary.activities || [])];

        if (Array.isArray(itinerary.days)) {
          itinerary.days.forEach((d: any, dIdx: number) => {
            const blocks = d.metadata?.blocks || [];
            blocks.forEach((b: any) => {
              const p = b.properties || {};
              if (b.type === 'hotel' && !flatHotels.some(h => h.id === b.id)) {
                flatHotels.push({
                  id: b.id,
                  hotel_name: b.title || p.hotel_name || p.name || `Hotel Day ${dIdx + 1}`,
                  hotel_address: p.hotel_address || p.address || d.city || '',
                  city: d.city || d.accommodation_city || 'Destination',
                  room_category: p.room_type || p.room_category || 'Deluxe Room',
                  meal_plan: p.meal_plan || 'MAP (Breakfast & Dinner)',
                  check_in: d.date || '',
                  check_out: '',
                  nights: 1,
                  rooms: 1,
                  confirmation_number: p.confirmation_number || p.hotel_conf_no || '',
                  hotel_contact: p.hotel_contact || '',
                  confirmation_status: (p.confirmation_number || p.hotel_conf_no) ? 'Confirmed' : 'Pending'
                });
              } else if (b.type === 'transport' && !flatTransport.some(t => t.id === b.id)) {
                flatTransport.push({
                  id: b.id,
                  vehicle_type: b.title || p.vehicle_type || 'AC Sedan / SUV',
                  pickup_location: p.pickup_location || d.city || 'Airport / Station',
                  drop_location: p.drop_location || 'Hotel',
                  pickup_date: d.date || '',
                  pickup_time: p.pickup_time || '09:00 AM',
                  driver_name: p.driver_name || '',
                  driver_phone: p.driver_phone || '',
                  vehicle_number: p.vehicle_number || '',
                  confirmation_status: p.driver_name ? 'Confirmed' : 'Pending'
                });
              } else if ((b.type === 'activity' || b.type === 'sightseeing') && !flatActivities.some(a => a.id === b.id)) {
                flatActivities.push({
                  id: b.id,
                  title: b.title || p.name || 'Guided Sightseeing',
                  activity_name: b.title || p.name || 'Sightseeing Tour',
                  city: d.city || 'Tour Destination',
                  location: p.location || d.city || '',
                  activity_date: d.date || '',
                  slot_time: p.slot_time || 'Morning Slot',
                  confirmation_number: p.confirmation_number || p.ticket_number || '',
                  operator_name: p.operator_name || '',
                  guide_contact: p.guide_contact || '',
                  confirmation_status: (p.confirmation_number || p.ticket_number) ? 'Confirmed' : 'Pending'
                });
              }
            });
          });
        }

        accepted.itinerary_data = {
          ...itinerary,
          hotels: flatHotels,
          transport: flatTransport,
          activities: flatActivities
        };
      }

      setProposal(accepted || null);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load confirmed booking', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) loadAcceptedProposal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-800 text-slate-200">
        <CardContent className="p-6 flex items-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-[#C9A25A]" /> Loading confirmed booking operations...
        </CardContent>
      </Card>
    );
  }

  if (!proposal) {
    return (
      <Card className="bg-slate-900/60 border-slate-800 text-slate-300">
        <CardContent className="p-6 text-sm text-slate-400 flex items-center gap-3">
          <Circle className="w-4 h-4 text-slate-500" />
          <span>No proposal option has been accepted for this lead yet. Confirmation details, driver assignment, and voucher generation unlock once an option is accepted.</span>
        </CardContent>
      </Card>
    );
  }

  const hotels = proposal.itinerary_data?.hotels || [];
  const transport = proposal.itinerary_data?.transport || [];
  const activities = proposal.itinerary_data?.activities || [];

  const updateHotelField = (id: string, field: 'confirmation_number' | 'hotel_contact', value: string) => {
    setProposal(prev => prev && {
      ...prev,
      itinerary_data: {
        ...prev.itinerary_data,
        hotels: (prev.itinerary_data?.hotels || []).map(h => h.id === id ? { ...h, [field]: value } : h),
      },
    });
  };

  const updateTransportField = (id: string, field: 'driver_name' | 'driver_phone' | 'vehicle_number', value: string) => {
    setProposal(prev => prev && {
      ...prev,
      itinerary_data: {
        ...prev.itinerary_data,
        transport: (prev.itinerary_data?.transport || []).map(t => t.id === id ? { ...t, [field]: value } : t),
      },
    });
  };

  const updateActivityField = (id: string, field: 'confirmation_number' | 'operator_name' | 'guide_contact' | 'slot_time', value: string) => {
    setProposal(prev => prev && {
      ...prev,
      itinerary_data: {
        ...prev.itinerary_data,
        activities: (prev.itinerary_data?.activities || []).map(a => a.id === id ? { ...a, [field]: value } : a),
      },
    });
  };

  const saveHotelConfirmation = async (leg: HotelLeg) => {
    setSavingLegId(leg.id);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/itinerary_confirm_leg.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          proposal_id: proposal.id,
          leg_type: 'hotel',
          leg_id: leg.id,
          confirmation_number: leg.confirmation_number || '',
          hotel_contact: leg.hotel_contact || '',
        }),
      });
      if (!res.ok) throw new Error('save failed');
      toast({ title: 'Hotel Saved', description: `Confirmation #${leg.confirmation_number || 'N/A'} saved for ${leg.hotel_name || 'hotel'}.` });
      loadAcceptedProposal();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save hotel confirmation', variant: 'destructive' });
    } finally {
      setSavingLegId(null);
    }
  };

  const saveTransportConfirmation = async (leg: TransportLeg) => {
    setSavingLegId(leg.id);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/itinerary_confirm_leg.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          proposal_id: proposal.id,
          leg_type: 'transport',
          leg_id: leg.id,
          driver_name: leg.driver_name || '',
          driver_phone: leg.driver_phone || '',
          vehicle_number: leg.vehicle_number || '',
        }),
      });
      if (!res.ok) throw new Error('save failed');
      toast({ title: 'Driver Saved', description: `Driver details saved for ${leg.vehicle_type || 'cab'}.` });
      loadAcceptedProposal();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save driver details', variant: 'destructive' });
    } finally {
      setSavingLegId(null);
    }
  };

  const saveActivityConfirmation = async (leg: ActivityLeg) => {
    setSavingLegId(leg.id);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/itinerary_confirm_leg.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          proposal_id: proposal.id,
          leg_type: 'activity',
          leg_id: leg.id,
          confirmation_number: leg.confirmation_number || '',
          operator_name: leg.operator_name || '',
          guide_contact: leg.guide_contact || '',
          slot_time: leg.slot_time || '',
        }),
      });
      if (!res.ok) throw new Error('save failed');
      toast({ title: 'Activity Saved', description: `Ticket #${leg.confirmation_number || 'N/A'} saved for ${leg.title || leg.activity_name}.` });
      loadAcceptedProposal();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to save activity details', variant: 'destructive' });
    } finally {
      setSavingLegId(null);
    }
  };

  // Calls the server-side gate first — this is authoritative enforcement.
  const generateDocuments = async () => {
    setGenerating(true);
    setAdvance(null);
    const generated: Array<{ name: string; url?: string; type: string }> = [];

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/voucher_generate.php?proposal_id=${proposal.id}`, { headers });
      const json = await res.json();

      if (res.status === 403 && json.error === 'advance_pending') {
        setAdvance({ received: json.received, required: json.required, shortfall: json.shortfall });
        toast({
          title: 'Advance Payment Shortfall',
          description: `₹${Number(json.received).toLocaleString('en-IN')} of ₹${Number(json.required).toLocaleString('en-IN')} advance received. Balance ₹${Number(json.shortfall).toLocaleString('en-IN')} pending.`,
          variant: 'destructive',
        });
        return;
      }

      if (!res.ok) {
        throw new Error(json.message || json.error || 'Document generation blocked');
      }

      const data = json.itinerary_data || {};
      const leadInfo = json.lead || {};

      // 1. Tax Invoice
      const invoiceNum = formatVoucherRef('INVOICE', proposal.title, leadId);
      const invoiceDoc = generateInvoicePDF({
        invoiceNumber: invoiceNum,
        invoiceDate: new Date().toISOString().split('T')[0],
        customerName: customerName || leadInfo.customer_name || 'Valued Customer',
        customerPhone: customerPhone || leadInfo.customer_phone,
        customerEmail: customerEmail || leadInfo.customer_email,
        destination: proposal.title,
        travelDates: `${data.hotels?.[0]?.check_in || 'Upcoming Departure'}`,
        adults: data.adults || 2,
        children: data.children || 0,
        packageTitle: proposal.title,
        baseAmount: Number(json.total_price || 0),
        gstRatePercent: 5,
        gstAmount: Number(json.total_price || 0) * 0.05,
        totalAmount: Number(json.total_price || 0) * 1.05,
        amountPaid: Number(json.advance_received || 0),
        balanceDue: Math.max(0, (Number(json.total_price || 0) * 1.05) - Number(json.advance_received || 0)),
      });
      const invoiceFileName = `${invoiceNum}_Tax_Invoice.pdf`;
      invoiceDoc.save(invoiceFileName);
      const invRes = await uploadPdf(invoiceDoc, leadId, invoiceFileName, 'invoice');
      generated.push({ name: invoiceFileName, url: invRes.file_url, type: 'Tax Invoice' });

      // 2. Hotel Vouchers
      for (const hotel of (data.hotels || [])) {
        const hotelVchNum = formatVoucherRef('HOTEL', hotel.city || proposal.title, leadId, hotel.id);
        const doc = generateHotelVoucherPDF({
          voucherNumber: hotelVchNum,
          bookingDate: new Date().toISOString().split('T')[0],
          guestName: customerName || leadInfo.customer_name || 'Valued Guest',
          guestPhone: customerPhone || leadInfo.customer_phone || '',
          hotelName: hotel.hotel_name || '',
          hotelAddress: hotel.hotel_address || '',
          city: hotel.city || '',
          roomCategory: hotel.room_category || 'Deluxe Room',
          mealPlan: hotel.meal_plan || 'MAP (Breakfast & Dinner)',
          checkInDate: hotel.check_in || '',
          checkOutDate: hotel.check_out || '',
          nights: hotel.nights || 1,
          roomsCount: hotel.rooms || 1,
          confirmationNumber: hotel.confirmation_number || undefined,
        });
        const htlFileName = `${hotelVchNum}_Hotel_Voucher.pdf`;
        doc.save(htlFileName);
        const htlRes = await uploadPdf(doc, leadId, htlFileName, 'hotel_voucher');
        generated.push({ name: htlFileName, url: htlRes.file_url, type: 'Hotel Voucher' });
      }

      // 3. Cab / Transport Vouchers
      for (const leg of (data.transport || [])) {
        const cabVchNum = formatVoucherRef('CAB', leg.drop_location || proposal.title, leadId, leg.id);
        const doc = generateCabVoucherPDF({
          voucherNumber: cabVchNum,
          bookingDate: new Date().toISOString().split('T')[0],
          guestName: customerName || leadInfo.customer_name || 'Valued Guest',
          guestPhone: customerPhone || leadInfo.customer_phone || '',
          pickupDate: leg.pickup_date || '',
          pickupTime: leg.pickup_time || '',
          pickupLocation: leg.pickup_location || '',
          dropLocation: leg.drop_location || '',
          vehicleType: leg.vehicle_type || 'Sedan / SUV',
          vendorName: leg.vendor_name || 'Ghumo Firoo Fleet',
          driverName: leg.driver_name,
          driverPhone: leg.driver_phone,
          vehicleNumber: leg.vehicle_number,
          inclusions: leg.inclusions || ['Tolls', 'Parking', 'Fuel', 'Driver Allowance'],
        });
        const cabFileName = `${cabVchNum}_Cab_Voucher.pdf`;
        doc.save(cabFileName);
        const cabRes = await uploadPdf(doc, leadId, cabFileName, 'cab_voucher');
        generated.push({ name: cabFileName, url: cabRes.file_url, type: 'Cab Voucher' });
      }

      // 4. Activity & Sightseeing Vouchers
      for (const act of (data.activities || [])) {
        const actVchNum = formatVoucherRef('ACTIVITY', act.city || proposal.title, leadId, act.id);
        const doc = generateActivityVoucherPDF({
          voucherNumber: actVchNum,
          bookingDate: new Date().toISOString().split('T')[0],
          guestName: customerName || leadInfo.customer_name || 'Valued Guest',
          guestPhone: customerPhone || leadInfo.customer_phone || '',
          activityName: act.title || act.activity_name || 'Sightseeing Pass',
          location: act.location || act.city || '',
          city: act.city || 'Tour Destination',
          activityDate: act.activity_date || '',
          timeSlot: act.slot_time || 'General Slot',
          adultsCount: data.adults || 2,
          childrenCount: data.children || 0,
          supplierContact: act.operator_name ? `${act.operator_name} (${act.guide_contact || ''})` : act.guide_contact,
          confirmationNumber: act.confirmation_number,
        } as any);
        const actFileName = `${actVchNum}_Activity_Voucher.pdf`;
        doc.save(actFileName);
        const actRes = await uploadPdf(doc, leadId, actFileName, 'activity_voucher');
        generated.push({ name: actFileName, url: actRes.file_url, type: 'Activity Voucher' });
      }

      setGeneratedDocs(generated);
      toast({ 
        title: 'Documents Generated & Saved', 
        description: `Successfully generated ${generated.length} vouchers and invoices, archived permanently in Documents.` 
      });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Failed to generate documents', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const dynamicAdvanceRequired = proposal.advance_required && proposal.advance_required > 0 
    ? proposal.advance_required 
    : Math.round(proposal.total_price * 0.30);

  return (
    <div className="space-y-6">
      {/* 1. Header Booking Operations Banner */}
      <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono tracking-wider">
                  ACCEPTED PROPOSAL # {proposal.id}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Lead #{leadId}</span>
              </div>
              <CardTitle className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {proposal.title}
              </CardTitle>
            </div>

            <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Package</span>
                <span className="text-base font-black text-white font-display">₹{Number(proposal.total_price).toLocaleString('en-IN')}</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-wider block">30% Advance Benchmark</span>
                <span className="text-base font-black text-amber-400 font-display">₹{dynamicAdvanceRequired.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          {/* Advance short fall banner if triggered */}
          {advance && advance.shortfall && advance.shortfall > 0 && (
            <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-200">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-red-300">Advance Payment Shortfall — Documents Locked</p>
                <p>
                  Received: <span className="font-bold font-mono">₹{advance.received.toLocaleString('en-IN')}</span> | 
                  Required: <span className="font-bold font-mono">₹{advance.required.toLocaleString('en-IN')}</span> | 
                  Pending Shortfall: <span className="font-black text-red-400 font-mono">₹{advance.shortfall.toLocaleString('en-IN')}</span>
                </p>
                <p className="text-[11px] text-red-300/80">
                  Per policy, vouchers and formal invoices require at least 30% advance deposit to release operational vouchers to guest and vendors.
                </p>
              </div>
            </div>
          )}

          {/* 2. Hotel Confirmation Legs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Bed className="w-4 h-4 text-sky-400" /> Hotel Bookings & Confirmation Numbers ({hotels.length})
              </h3>
            </div>

            {hotels.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                No hotel nights configured in this proposal itinerary.
              </p>
            ) : (
              <div className="space-y-2">
                {hotels.map((h, idx) => (
                  <div key={h.id || idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{h.hotel_name}</span>
                        <Badge variant="outline" className={h.confirmation_number ? "border-emerald-500/40 text-emerald-400 text-[10px]" : "border-amber-500/40 text-amber-400 text-[10px]"}>
                          {h.confirmation_number ? 'Confirmed' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">{h.city} • {h.room_category} • {h.meal_plan}</p>
                      {h.check_in && <p className="text-[10px] text-slate-500 font-mono">Check-in: {h.check_in}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
                      <div className="flex-1 min-w-[150px]">
                        <Label className="text-[10px] text-slate-400">Confirmation #</Label>
                        <Input
                          placeholder="e.g. HTL-29481"
                          value={h.confirmation_number || ''}
                          onChange={(e) => updateHotelField(h.id, 'confirmation_number', e.target.value)}
                          className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <Label className="text-[10px] text-slate-400">Hotel Phone / Contact</Label>
                        <Input
                          placeholder="+91-..."
                          value={h.hotel_contact || ''}
                          onChange={(e) => updateHotelField(h.id, 'hotel_contact', e.target.value)}
                          className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <Button
                        size="sm"
                        disabled={savingLegId === h.id}
                        onClick={() => saveHotelConfirmation(h)}
                        className="h-8 px-3 mt-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                      >
                        {savingLegId === h.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Transport & Driver Legs */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-400" /> Cabs & Driver Assignments ({transport.length})
              </h3>
            </div>

            {transport.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                No cab/transport legs configured in this proposal itinerary.
              </p>
            ) : (
              <div className="space-y-2">
                {transport.map((t, idx) => (
                  <div key={t.id || idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{t.vehicle_type}</span>
                        <Badge variant="outline" className={t.driver_name ? "border-emerald-500/40 text-emerald-400 text-[10px]" : "border-amber-500/40 text-amber-400 text-[10px]"}>
                          {t.driver_name ? 'Assigned' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">{t.pickup_location} ➔ {t.drop_location}</p>
                      {t.pickup_date && <p className="text-[10px] text-slate-500 font-mono">{t.pickup_date} @ {t.pickup_time || '09:00 AM'}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
                      <div className="flex-1 min-w-[120px]">
                        <Label className="text-[10px] text-slate-400">Driver Name</Label>
                        <Input
                          placeholder="e.g. Ramesh Singh"
                          value={t.driver_name || ''}
                          onChange={(e) => updateTransportField(t.id, 'driver_name', e.target.value)}
                          className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <Label className="text-[10px] text-slate-400">Driver Phone</Label>
                        <Input
                          placeholder="+91-..."
                          value={t.driver_phone || ''}
                          onChange={(e) => updateTransportField(t.id, 'driver_phone', e.target.value)}
                          className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <Label className="text-[10px] text-slate-400">Plate #</Label>
                        <Input
                          placeholder="UK07-..."
                          value={t.vehicle_number || ''}
                          onChange={(e) => updateTransportField(t.id, 'vehicle_number', e.target.value)}
                          className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <Button
                        size="sm"
                        disabled={savingLegId === t.id}
                        onClick={() => saveTransportConfirmation(t)}
                        className="h-8 px-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        {savingLegId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Activities & Sightseeing Tickets */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" /> Activities, Permits & Sightseeing Passes ({activities.length})
              </h3>
            </div>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                No activity/sightseeing tickets configured in this proposal itinerary.
              </p>
            ) : (
              <div className="space-y-2">
                {activities.map((a, idx) => (
                  <div key={a.id || idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{a.title || a.activity_name}</span>
                        <Badge variant="outline" className={a.confirmation_number ? "border-emerald-500/40 text-emerald-400 text-[10px]" : "border-amber-500/40 text-amber-400 text-[10px]"}>
                          {a.confirmation_number ? 'Ticketed' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">{a.city || a.location} • {a.slot_time || 'Scheduled Slot'}</p>
                      {a.activity_date && <p className="text-[10px] text-slate-500 font-mono">Date: {a.activity_date}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
                      <div className="flex-1 min-w-[130px]">
                        <Label className="text-[10px] text-slate-400">Ticket / Ref Code</Label>
                        <Input
                          placeholder="e.g. VIP-8841"
                          value={a.confirmation_number || ''}
                          onChange={(e) => updateActivityField(a.id, 'confirmation_number', e.target.value)}
                          className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div className="flex-1 min-w-[130px]">
                        <Label className="text-[10px] text-slate-400">Guide / Operator</Label>
                        <Input
                          placeholder="Vendor / Guide"
                          value={a.operator_name || ''}
                          onChange={(e) => updateActivityField(a.id, 'operator_name', e.target.value)}
                          className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <Button
                        size="sm"
                        disabled={savingLegId === a.id}
                        onClick={() => saveActivityConfirmation(a)}
                        className="h-8 px-3 mt-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                      >
                        {savingLegId === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Document Generation & Auto-Upload Action */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C9A25A]" /> Generate & Archive Operational Documents
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verifies advance payment server-side, compiles PDFs with saved confirmation numbers & drivers, and auto-saves to Documents ledger.
                </p>
              </div>

              <Button
                disabled={generating}
                onClick={generateDocuments}
                className="bg-[#C9A25A] hover:bg-[#b58f48] text-slate-950 font-black text-xs h-10 px-5 rounded-xl shadow-lg shadow-[#C9A25A]/20 flex items-center gap-2 shrink-0"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating & Archiving...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Generate Documents
                  </>
                )}
              </Button>
            </div>

            {/* Generated Documents List */}
            {generatedDocs.length > 0 && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Generated & Archived Documents ({generatedDocs.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {generatedDocs.map((doc, dIdx) => (
                    <div key={dIdx} className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div className="truncate mr-2">
                        <span className="font-medium text-white truncate block">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{doc.type}</span>
                      </div>
                      {doc.url && (
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#C9A25A] hover:underline flex items-center gap-1 text-[11px] shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
