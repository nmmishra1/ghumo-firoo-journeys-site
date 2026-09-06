import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Car, Bed, ShieldAlert, CheckCircle2, ShieldCheck, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { crmFetch } from '@/utils/crmApi';
import { 
  generateInvoicePDF, 
  generateHotelVoucherPDF, 
  generateCabVoucherPDF,
  InvoiceData, 
  HotelVoucherData, 
  CabVoucherData 
} from '@/lib/voucherService';

interface VoucherInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  itinerary?: any;
  initialTab?: 'invoice' | 'hotel' | 'cab';
}

const apiBase = import.meta.env.VITE_API_BASE_URL || '/php-backend';

export const VoucherInvoiceModal: React.FC<VoucherInvoiceModalProps> = ({
  isOpen,
  onClose,
  lead,
  itinerary,
  initialTab = 'invoice'
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'invoice' | 'hotel' | 'cab'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Extract real hotels from itinerary days
  const hotelList = useMemo(() => {
    const list: any[] = [];
    (itinerary?.days || []).forEach((day: any, dIdx: number) => {
      const blocks = day.metadata?.blocks || [];
      blocks.forEach((b: any) => {
        if (b.type === 'hotel') {
          list.push({
            id: b.id,
            dayNumber: day.day_number || (dIdx + 1),
            date: day.date || '',
            city: day.accommodation_city || day.city || 'Destination',
            name: b.title || b.properties?.hotel_name || b.properties?.name || 'Partner Luxury Hotel',
            address: b.properties?.hotel_address || b.properties?.address || `${day.accommodation_city || day.city || 'City'}, India`,
            roomType: b.properties?.room_type || b.properties?.room_category || 'Deluxe Room',
            mealPlan: b.properties?.meal_plan || 'MAP (Breakfast & Dinner)',
            hotelConfNo: b.properties?.hotel_conf_no || '',
            hotelContact: b.properties?.hotel_contact || ''
          });
        }
      });
    });
    return list;
  }, [itinerary]);

  // Extract real cabs from itinerary days
  const cabList = useMemo(() => {
    const list: any[] = [];
    (itinerary?.days || []).forEach((day: any, dIdx: number) => {
      const blocks = day.metadata?.blocks || [];
      blocks.forEach((b: any) => {
        if (b.type === 'transport') {
          list.push({
            id: b.id,
            dayNumber: day.day_number || (dIdx + 1),
            date: day.date || '',
            vehicleType: b.title || b.properties?.cab_model || 'Innova Crysta (AC SUV)',
            driverName: b.properties?.driver_details || b.properties?.driver_name || 'Ramesh Singh',
            driverPhone: b.properties?.driver_phone || '+91-9876543210',
            vehicleNo: b.properties?.vehicle_no || 'DL-01-AB-1234',
            pickupLoc: b.properties?.pickup_location || `${day.city || 'Station / Airport'} Arrival Point`,
            dropLoc: b.properties?.drop_location || `${day.accommodation_city || day.city || 'Hotel'} Hotel Transfer`
          });
        }
      });
    });
    return list;
  }, [itinerary]);

  // Selected Index for multiple hotels / cabs
  const [selectedHotelIndex, setSelectedHotelIndex] = useState(0);
  const [selectedCabIndex, setSelectedCabIndex] = useState(0);

  // Form State - Invoice
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const initialBasePrice = Number(lead?.package_price || lead?.expected_booking_value || itinerary?.total_price || 50000);
  const [basePrice, setBasePrice] = useState(initialBasePrice);
  const [amountPaid, setAmountPaid] = useState(Number(lead?.total_paid_amount || lead?.paid_amount || 0));
  const [gstRate, setGstRate] = useState(5);

  // Form State - Hotel
  const activeHotel = hotelList[selectedHotelIndex] || null;
  const [hotelVoucherNo, setHotelVoucherNo] = useState(`HTL-${Date.now().toString().slice(-6)}`);
  const [hotelName, setHotelName] = useState(activeHotel?.name || 'Hotel Ganga Lahari');
  const [hotelAddress, setHotelAddress] = useState(activeHotel?.address || 'Har Ki Pauri, Haridwar, Uttarakhand');
  const [roomCategory, setRoomCategory] = useState(activeHotel?.roomType || 'Deluxe River View');
  const [mealPlan, setMealPlan] = useState(activeHotel?.mealPlan || 'MAP (Breakfast & Dinner)');
  const [hotelConfNo, setHotelConfNo] = useState(activeHotel?.hotelConfNo || `CONF-${Date.now().toString().slice(-6)}`);
  const [checkIn, setCheckIn] = useState(itinerary?.start_date || itinerary?.days?.[0]?.date || new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(itinerary?.end_date || itinerary?.days?.[itinerary?.days?.length - 1]?.date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);

  // Update hotel fields when selected hotel changes
  useEffect(() => {
    if (activeHotel) {
      setHotelName(activeHotel.name);
      setHotelAddress(activeHotel.address);
      setRoomCategory(activeHotel.roomType);
      setMealPlan(activeHotel.mealPlan);
      if (activeHotel.hotelConfNo) setHotelConfNo(activeHotel.hotelConfNo);
    }
  }, [activeHotel]);

  // Form State - Cab
  const activeCab = cabList[selectedCabIndex] || null;
  const [cabVoucherNo, setCabVoucherNo] = useState(`CAB-${Date.now().toString().slice(-6)}`);
  const [vehicleType, setVehicleType] = useState(activeCab?.vehicleType || 'Innova Crysta (SUV)');
  const [pickupLoc, setPickupLoc] = useState(activeCab?.pickupLoc || 'Haridwar Railway Station');
  const [dropLoc, setDropLoc] = useState(activeCab?.dropLoc || 'Dehradun Airport');
  const [driverName, setDriverName] = useState(activeCab?.driverName || 'Ramesh Singh');
  const [driverPhone, setDriverPhone] = useState(activeCab?.driverPhone || '+91-9876543210');
  const [vehicleNo, setVehicleNo] = useState(activeCab?.vehicleNo || 'UK-07-TA-4455');

  // Update cab fields when selected cab changes
  useEffect(() => {
    if (activeCab) {
      setVehicleType(activeCab.vehicleType);
      setPickupLoc(activeCab.pickupLoc);
      setDropLoc(activeCab.dropLoc);
      setDriverName(activeCab.driverName);
      setDriverPhone(activeCab.driverPhone);
      setVehicleNo(activeCab.vehicleNo);
    }
  }, [activeCab]);

  // Financial Lock & Verification status
  const totalPaid = Number(lead?.total_paid_amount || lead?.paid_amount || lead?.advance_paid || 0);
  const advanceRequired = Math.round(basePrice * 0.5);
  const isAdvancePaid = Boolean(
    lead?.advance_paid_verified || 
    lead?.status === 'Booking Confirmed' || 
    (advanceRequired > 0 && totalPaid >= advanceRequired)
  );

  const [overrideGating, setOverrideGating] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);

  const gstAmount = (basePrice * gstRate) / 100;
  const totalPrice = basePrice + gstAmount;
  const balanceDue = Math.max(0, totalPrice - amountPaid);

  // Helper: upload generated PDF to MySQL documents table
  const saveDocumentToDb = async (fileName: string, pdfDoc: any) => {
    if (!lead?.id) return;
    try {
      setSavingDoc(true);
      const dataUri = pdfDoc.output('datauristring');
      await crmFetch(`${apiBase}/document_upload.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: String(lead.id),
          name: fileName,
          type: 'pdf',
          size: `${Math.round((dataUri.length * 0.75) / 1024)} KB`,
          uploaded_by: lead?.agent_name || 'Agent',
          file_base64: dataUri
        })
      }, { action: 'upload_document', module: 'Leads', itemName: fileName });
    } catch (e) {
      console.warn('Failed to archive document to DB:', e);
    } finally {
      setSavingDoc(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const data: InvoiceData = {
        invoiceNumber: invoiceNo,
        invoiceDate: new Date().toISOString().split('T')[0],
        customerName: lead?.customer_name || 'Valued Customer',
        customerPhone: lead?.customer_phone || '',
        customerEmail: lead?.customer_email || '',
        destination: lead?.destinations || lead?.destination || lead?.package_name || 'Tour Package',
        travelDates: `${checkIn} to ${checkOut}`,
        adults: Number(lead?.adult_count || lead?.number_of_pax || 2),
        children: Number(lead?.child_count || 0),
        packageTitle: lead?.package_name || itinerary?.title || `${lead?.destination || 'Custom'} Tour Package`,
        baseAmount: basePrice,
        gstRatePercent: gstRate,
        gstAmount,
        totalAmount: totalPrice,
        amountPaid,
        balanceDue,
      };
      const doc = generateInvoicePDF(data);
      const fileName = `${invoiceNo}_Tax_Invoice.pdf`;
      doc.save(fileName);
      await saveDocumentToDb(fileName, doc);
      toast({ title: 'Invoice Downloaded & Archived', description: `Invoice ${invoiceNo} saved and attached to lead documents.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to generate Invoice PDF', variant: 'destructive' });
    }
  };

  const handleDownloadHotelVoucher = async () => {
    if (!isAdvancePaid && !overrideGating) {
      toast({
        title: '⚠️ Advance Payment Required',
        description: 'Vouchers cannot be released before 50% advance payment is verified.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const data: HotelVoucherData = {
        voucherNumber: hotelVoucherNo,
        bookingDate: new Date().toISOString().split('T')[0],
        guestName: lead?.customer_name || 'Valued Guest',
        guestPhone: lead?.customer_phone || '',
        hotelName,
        hotelAddress,
        city: activeHotel?.city || 'Haridwar',
        roomCategory,
        mealPlan,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights: Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))),
        roomsCount: 1,
        confirmationNumber: hotelConfNo
      };
      const doc = generateHotelVoucherPDF(data);
      const fileName = `${hotelVoucherNo}_Hotel_Voucher.pdf`;
      doc.save(fileName);
      await saveDocumentToDb(fileName, doc);
      toast({ title: 'Hotel Voucher Downloaded & Archived', description: `Voucher ${hotelVoucherNo} saved to lead documents.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to generate Hotel Voucher', variant: 'destructive' });
    }
  };

  const handleDownloadCabVoucher = async () => {
    if (!isAdvancePaid && !overrideGating) {
      toast({
        title: '⚠️ Advance Payment Required',
        description: 'Vouchers cannot be released before 50% advance payment is verified.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const data: CabVoucherData = {
        voucherNumber: cabVoucherNo,
        bookingDate: new Date().toISOString().split('T')[0],
        guestName: lead?.customer_name || 'Valued Guest',
        guestPhone: lead?.customer_phone || '',
        pickupDate: checkIn,
        pickupTime: '09:00 AM',
        pickupLocation: pickupLoc,
        dropLocation: dropLoc,
        vehicleType: `${vehicleType} (${vehicleNo})`,
        vendorName: 'Ghumo Firoo Fleet Services',
        driverName,
        driverPhone,
        inclusions: ['State Permitted Tolls', 'Toll Tax', 'Driver Night Allowance', 'Fuel Charges']
      };
      const doc = generateCabVoucherPDF(data);
      const fileName = `${cabVoucherNo}_Cab_Voucher.pdf`;
      doc.save(fileName);
      await saveDocumentToDb(fileName, doc);
      toast({ title: 'Cab Voucher Downloaded & Archived', description: `Voucher ${cabVoucherNo} saved to lead documents.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to generate Cab Voucher', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white font-montserrat">
            <FileText className="w-5 h-5 text-[#C9A25A]" />
            Travel Document Suite: {lead?.customer_name || 'Guest'} (Lead #{lead?.id || 'N/A'})
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Generate and persist GST Invoices, Hotel Confirmation Vouchers, and Cab Transport Passes directly to MySQL.
          </DialogDescription>
        </DialogHeader>

        {/* Verification Status Pill */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            {isAdvancePaid ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 50% Advance Verified
              </Badge>
            ) : (
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Advance Deposit Pending
              </Badge>
            )}
            <span className="text-slate-400 text-[11px]">
              Paid: <strong className="text-white">₹{totalPaid.toLocaleString('en-IN')}</strong> / Required 50%: <strong className="text-[#C9A25A]">₹{advanceRequired.toLocaleString('en-IN')}</strong>
            </span>
          </div>

          {!isAdvancePaid && (
            <button 
              onClick={() => setOverrideGating(!overrideGating)} 
              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              {overrideGating ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
              {overrideGating ? 'Override Active (Authorized)' : 'Enable Agent Override'}
            </button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
          <TabsList className="grid grid-cols-3 bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <TabsTrigger value="invoice" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-[#C9A25A] data-[state=active]:text-[#0B1026] font-bold">
              <FileText className="w-3.5 h-3.5" /> GST Proforma Invoice
            </TabsTrigger>
            <TabsTrigger value="hotel" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold">
              <Bed className="w-3.5 h-3.5" /> Hotel Voucher
            </TabsTrigger>
            <TabsTrigger value="cab" className="flex items-center gap-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold">
              <Car className="w-3.5 h-3.5" /> Cab Transport Voucher
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: GST TAX INVOICE */}
          <TabsContent value="invoice" className="space-y-4 pt-2 text-left">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <Label className="text-slate-300 text-xs">Invoice Number</Label>
                <Input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Package Base Amount (₹)</Label>
                <Input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">GST Rate (%)</Label>
                <Input type="number" value={gstRate} onChange={e => setGstRate(Number(e.target.value))} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Amount Paid Recorded (₹)</Label>
                <Input type="number" value={amountPaid} onChange={e => setAmountPaid(Number(e.target.value))} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400"><span>Base Amount:</span><span className="font-semibold text-white">₹{basePrice.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-slate-400"><span>GST ({gstRate}%):</span><span className="font-semibold text-white">₹{gstAmount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-[#C9A25A] font-bold border-t border-slate-800 pt-1"><span>Total Payable:</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-emerald-400"><span>Amount Received:</span><span>₹{amountPaid.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-rose-400 font-semibold"><span>Balance Due:</span><span>₹{balanceDue.toLocaleString('en-IN')}</span></div>
            </div>

            <Button onClick={handleDownloadInvoice} disabled={savingDoc} className="w-full bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] hover:opacity-95 text-[#0B1026] font-black h-10 rounded-xl gap-2">
              <Download className="w-4 h-4 stroke-[2.5]" /> {savingDoc ? 'Generating & Archiving...' : 'Download & Archive Tax Invoice PDF'}
            </Button>
          </TabsContent>

          {/* TAB 2: HOTEL VOUCHER */}
          <TabsContent value="hotel" className="space-y-4 pt-2 text-left">
            {!isAdvancePaid && !overrideGating && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Gated:</strong> Hotel vouchers are restricted until 50% advance deposit is verified. Collect payment via Invoice tab or enable override above.
                </span>
              </div>
            )}

            {hotelList.length > 1 && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-400">Select Hotel from Itinerary:</Label>
                <select 
                  value={selectedHotelIndex} 
                  onChange={(e) => setSelectedHotelIndex(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs p-1 text-white font-bold"
                >
                  {hotelList.map((h, i) => (
                    <option key={i} value={i}>Day {h.dayNumber}: {h.name} ({h.city})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <Label className="text-slate-300 text-xs">Hotel Name</Label>
                <Input value={hotelName} onChange={e => setHotelName(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Hotel Confirmation Ref #</Label>
                <Input value={hotelConfNo} onChange={e => setHotelConfNo(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9 font-mono" placeholder="e.g. CONF-88992" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Room Category</Label>
                <Input value={roomCategory} onChange={e => setRoomCategory(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Meal Plan</Label>
                <Input value={mealPlan} onChange={e => setMealPlan(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Check-In Date</Label>
                <Input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Check-Out Date</Label>
                <Input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div className="col-span-2">
                <Label className="text-slate-300 text-xs">Hotel Address</Label>
                <Input value={hotelAddress} onChange={e => setHotelAddress(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
            </div>

            <Button 
              onClick={handleDownloadHotelVoucher} 
              disabled={(!isAdvancePaid && !overrideGating) || savingDoc}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 rounded-xl gap-2 disabled:opacity-40"
            >
              <Download className="w-4 h-4 stroke-[2.5]" /> {savingDoc ? 'Generating & Archiving...' : 'Download & Archive Hotel Voucher PDF'}
            </Button>
          </TabsContent>

          {/* TAB 3: CAB VOUCHER */}
          <TabsContent value="cab" className="space-y-4 pt-2 text-left">
            {!isAdvancePaid && !overrideGating && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Gated:</strong> Cab driver vouchers are restricted until 50% advance deposit is verified. Collect payment via Invoice tab or enable override above.
                </span>
              </div>
            )}

            {cabList.length > 1 && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-400">Select Cab Route from Itinerary:</Label>
                <select 
                  value={selectedCabIndex} 
                  onChange={(e) => setSelectedCabIndex(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs p-1 text-white font-bold"
                >
                  {cabList.map((c, i) => (
                    <option key={i} value={i}>Day {c.dayNumber}: {c.vehicleType} ({c.pickupLoc} → {c.dropLoc})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <Label className="text-slate-300 text-xs">Vehicle Model</Label>
                <Input value={vehicleType} onChange={e => setVehicleType(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Vehicle Plate #</Label>
                <Input value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9 font-mono" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Pickup Location</Label>
                <Input value={pickupLoc} onChange={e => setPickupLoc(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Drop Location</Label>
                <Input value={dropLoc} onChange={e => setDropLoc(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Driver Name</Label>
                <Input value={driverName} onChange={e => setDriverName(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Driver Phone</Label>
                <Input value={driverPhone} onChange={e => setDriverPhone(e.target.value)} className="bg-slate-950 border-slate-800 text-white mt-1 h-9" />
              </div>
            </div>

            <Button 
              onClick={handleDownloadCabVoucher} 
              disabled={(!isAdvancePaid && !overrideGating) || savingDoc}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 rounded-xl gap-2 disabled:opacity-40"
            >
              <Download className="w-4 h-4 stroke-[2.5]" /> {savingDoc ? 'Generating & Archiving...' : 'Download & Archive Cab Voucher PDF'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
