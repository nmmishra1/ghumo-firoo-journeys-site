import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Download, Printer, CheckCircle2, Car, Bed, Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
}

export const VoucherInvoiceModal: React.FC<VoucherInvoiceModalProps> = ({
  isOpen,
  onClose,
  lead,
  itinerary
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'invoice' | 'hotel' | 'cab'>('invoice');

  // Form State - Invoice
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [amountPaid, setAmountPaid] = useState(lead?.package_price ? Number(lead.package_price) * 0.5 : 25000);
  const [basePrice, setBasePrice] = useState(lead?.package_price ? Number(lead.package_price) : 50000);
  const [gstRate, setGstRate] = useState(5);

  // Form State - Hotel
  const [hotelVoucherNo, setHotelVoucherNo] = useState(`HTL-${Date.now().toString().slice(-6)}`);
  const [hotelName, setHotelName] = useState('Hotel Ganga Lahari');
  const [hotelAddress, setHotelAddress] = useState('Har Ki Pauri, Haridwar, Uttarakhand');
  const [roomCategory, setRoomCategory] = useState('Deluxe River View');
  const [mealPlan, setMealPlan] = useState('MAP (Breakfast & Dinner)');
  const [checkIn, setCheckIn] = useState('2026-09-10');
  const [checkOut, setCheckOut] = useState('2026-09-13');

  // Form State - Cab
  const [cabVoucherNo, setCabVoucherNo] = useState(`CAB-${Date.now().toString().slice(-6)}`);
  const [vehicleType, setVehicleType] = useState('Innova Crysta (SUV)');
  const [pickupLoc, setPickupLoc] = useState('Haridwar Railway Station');
  const [dropLoc, setDropLoc] = useState('Dehradun Airport');
  const [driverName, setDriverName] = useState('Ramesh Singh');
  const [driverPhone, setDriverPhone] = useState('+91-9876543210');

  const gstAmount = (basePrice * gstRate) / 100;
  const totalPrice = basePrice + gstAmount;
  const balanceDue = Math.max(0, totalPrice - amountPaid);

  const handleDownloadInvoice = () => {
    try {
      const data: InvoiceData = {
        invoiceNumber: invoiceNo,
        invoiceDate: new Date().toISOString().split('T')[0],
        customerName: lead?.customer_name || 'Valued Customer',
        customerPhone: lead?.customer_phone || '',
        customerEmail: lead?.customer_email || '',
        destination: lead?.destinations || lead?.package_name || 'Char Dham Yatra',
        travelDates: `${checkIn} to ${checkOut}`,
        adults: Number(lead?.adult_count || 2),
        children: Number(lead?.child_count || 0),
        packageTitle: lead?.package_name || itinerary?.title || 'Custom Tour Package',
        baseAmount: basePrice,
        gstRatePercent: gstRate,
        gstAmount,
        totalAmount: totalPrice,
        amountPaid,
        balanceDue,
      };
      const doc = generateInvoicePDF(data);
      doc.save(`${invoiceNo}_Tax_Invoice.pdf`);
      toast({ title: 'Invoice Downloaded', description: `Invoice ${invoiceNo} saved successfully.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to generate Invoice PDF', variant: 'destructive' });
    }
  };

  const handleDownloadHotelVoucher = () => {
    try {
      const data: HotelVoucherData = {
        voucherNumber: hotelVoucherNo,
        bookingDate: new Date().toISOString().split('T')[0],
        guestName: lead?.customer_name || 'Valued Guest',
        guestPhone: lead?.customer_phone || '',
        hotelName,
        hotelAddress,
        city: 'Haridwar',
        roomCategory,
        mealPlan,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights: 3,
        roomsCount: 1,
        confirmationNumber: `CONF-${Math.floor(100000 + Math.random() * 900000)}`
      };
      const doc = generateHotelVoucherPDF(data);
      doc.save(`${hotelVoucherNo}_Hotel_Voucher.pdf`);
      toast({ title: 'Hotel Voucher Downloaded', description: `Voucher ${hotelVoucherNo} saved.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to generate Hotel Voucher', variant: 'destructive' });
    }
  };

  const handleDownloadCabVoucher = () => {
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
        vehicleType,
        vendorName: 'Char Dham Himalayan Cabs',
        driverName,
        driverPhone,
        inclusions: ['State Permitted Tolls', 'Toll Tax', 'Driver Night Allowance', 'Fuel Charges']
      };
      const doc = generateCabVoucherPDF(data);
      doc.save(`${cabVoucherNo}_Cab_Voucher.pdf`);
      toast({ title: 'Cab Voucher Downloaded', description: `Voucher ${cabVoucherNo} saved.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to generate Cab Voucher', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="w-5 h-5 text-amber-600" />
            Travel Document Generator Suite
          </DialogTitle>
          <DialogDescription>
            Generate GST Invoices, Hotel Vouchers, and Cab Transport Vouchers for lead #{lead?.id || 'N/A'} ({lead?.customer_name}).
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="invoice" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> GST Tax Invoice
            </TabsTrigger>
            <TabsTrigger value="hotel" className="flex items-center gap-2">
              <Bed className="w-4 h-4" /> Hotel Voucher
            </TabsTrigger>
            <TabsTrigger value="cab" className="flex items-center gap-2">
              <Car className="w-4 h-4" /> Cab Voucher
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: GST TAX INVOICE */}
          <TabsContent value="invoice" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Invoice Number</Label>
                <Input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
              </div>
              <div>
                <Label>Package Base Amount (₹)</Label>
                <Input type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} />
              </div>
              <div>
                <Label>GST Rate (%)</Label>
                <Input type="number" value={gstRate} onChange={e => setGstRate(Number(e.target.value))} />
              </div>
              <div>
                <Label>Amount Paid So Far (₹)</Label>
                <Input type="number" value={amountPaid} onChange={e => setAmountPaid(Number(e.target.value))} />
              </div>
            </div>

            <div className="bg-slate-50 border p-4 rounded-lg text-sm space-y-1">
              <div className="flex justify-between"><span>Base Amount:</span><span className="font-semibold">₹{basePrice.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>GST ({gstRate}%):</span><span className="font-semibold">₹{gstAmount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-blue-900 font-bold border-t pt-1"><span>Total Payable:</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-green-700"><span>Amount Received:</span><span>₹{amountPaid.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-rose-600 font-semibold"><span>Balance Due:</span><span>₹{balanceDue.toLocaleString('en-IN')}</span></div>
            </div>

            <Button onClick={handleDownloadInvoice} className="w-full bg-blue-900 hover:bg-blue-800 text-white gap-2">
              <Download className="w-4 h-4" /> Download Tax Invoice PDF
            </Button>
          </TabsContent>

          {/* TAB 2: HOTEL VOUCHER */}
          <TabsContent value="hotel" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hotel Name</Label>
                <Input value={hotelName} onChange={e => setHotelName(e.target.value)} />
              </div>
              <div>
                <Label>Room Category</Label>
                <Input value={roomCategory} onChange={e => setRoomCategory(e.target.value)} />
              </div>
              <div>
                <Label>Meal Plan</Label>
                <Input value={mealPlan} onChange={e => setMealPlan(e.target.value)} />
              </div>
              <div>
                <Label>Check-In Date</Label>
                <Input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
              </div>
              <div>
                <Label>Check-Out Date</Label>
                <Input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
              </div>
              <div>
                <Label>Hotel Address</Label>
                <Input value={hotelAddress} onChange={e => setHotelAddress(e.target.value)} />
              </div>
            </div>

            <Button onClick={handleDownloadHotelVoucher} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white gap-2">
              <Download className="w-4 h-4" /> Download Hotel Voucher PDF
            </Button>
          </TabsContent>

          {/* TAB 3: CAB VOUCHER */}
          <TabsContent value="cab" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vehicle Model</Label>
                <Input value={vehicleType} onChange={e => setVehicleType(e.target.value)} />
              </div>
              <div>
                <Label>Pickup Location</Label>
                <Input value={pickupLoc} onChange={e => setPickupLoc(e.target.value)} />
              </div>
              <div>
                <Label>Drop Location</Label>
                <Input value={dropLoc} onChange={e => setDropLoc(e.target.value)} />
              </div>
              <div>
                <Label>Driver Name</Label>
                <Input value={driverName} onChange={e => setDriverName(e.target.value)} />
              </div>
              <div>
                <Label>Driver Phone</Label>
                <Input value={driverPhone} onChange={e => setDriverPhone(e.target.value)} />
              </div>
            </div>

            <Button onClick={handleDownloadCabVoucher} className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2">
              <Download className="w-4 h-4" /> Download Cab Voucher PDF
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
