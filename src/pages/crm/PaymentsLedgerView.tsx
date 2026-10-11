import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import {
  Zap,
  Plus,
  IndianRupee,
  CheckCircle2,
  DollarSign,
  Search,
  MapPin,
  Share2,
  Edit,
  Trash2
} from "lucide-react";

interface PaymentsLedgerViewProps {
  allPayments: any[];
  leads: any[];
  paymentsLoading: boolean;
  setRecordPaymentDialogOpen: (open: boolean) => void;
  handleOpenEditPayment: (payment: any) => void;
  setPaymentToDelete: (payment: any) => void;
  formatLeadId: (lead: any) => string;
  formatLeadRoute: (lead: any) => string;
}

export const PaymentsLedgerView: React.FC<PaymentsLedgerViewProps> = ({
  allPayments,
  leads,
  paymentsLoading,
  setRecordPaymentDialogOpen,
  handleOpenEditPayment,
  setPaymentToDelete,
  formatLeadId,
  formatLeadRoute,
}) => {
  const [paymentSearch, setPaymentSearch] = React.useState('');
  const [paymentFilterMode, setPaymentFilterMode] = React.useState('all');

  const filteredPayments = React.useMemo(() => {
    return allPayments.filter(pay => {
      if (paymentSearch) {
        const q = paymentSearch.toLowerCase();
        const clientObj = leads.find(l => 
          String(l.id) === String(pay.lead_id) || 
          (l.lead_id && String(l.lead_id) === String(pay.lead_id)) ||
          (l.enquiry_number && String(l.enquiry_number) === String(pay.lead_id))
        ) || pay.leads || pay.lead;
        const clientName = (clientObj?.customer_name || pay.customer_name || pay.client_name || (pay.lead_id ? `Client (#${pay.lead_id})` : 'Direct Customer')).toLowerCase();
        const matchClient = clientName.includes(q);
        const matchRemarks = String(pay.remarks || '').toLowerCase().includes(q);
        const matchRef = String(pay.reference_number || '').toLowerCase().includes(q);
        const matchDate = String(pay.payment_date || '').toLowerCase().includes(q);
        if (!matchClient && !matchRemarks && !matchRef && !matchDate) return false;
      }
      if (paymentFilterMode !== 'all' && (pay.payment_mode || '').toLowerCase() !== paymentFilterMode.toLowerCase()) return false;
      return true;
    });
  }, [allPayments, paymentSearch, paymentFilterMode, leads]);

  const totalReceived = React.useMemo(() => allPayments.reduce((acc, p) => acc + Number(p.amount_received || 0), 0), [allPayments]);
  const totalCharges = React.useMemo(() => allPayments.reduce((acc, p) => acc + Number(p.gateway_charges || 0), 0), [allPayments]);
  const totalNet = totalReceived - totalCharges;
  const upiCount = React.useMemo(() => allPayments.filter(p => (p.payment_mode || 'UPI').toUpperCase().includes('UPI')).length, [allPayments]);

  return (
    <div className="space-y-6 text-left font-poppins pb-12">
      {/* UPI & Payments Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#0B1026] via-[#1E2942] to-[#0B1026] p-6 rounded-2xl border border-white/10 text-white shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            0% MDR Fee UPI Payment Hub
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-montserrat">
            UPI & Accounts Booking Ledger
          </h1>
          <p className="text-xs text-slate-300">
            Trace client payments by 12-digit UPI UTR / RRN reference numbers, verify advance deposits, and issue WhatsApp receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setRecordPaymentDialogOpen(true)}
            className="bg-gradient-warm hover:scale-105 text-[#0B1026] font-bold text-xs h-11 px-5 rounded-xl shadow-lg flex items-center gap-2 border-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Record Payment Entry
          </Button>
        </div>
      </div>

      {/* Financial KPI Stats Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Received</p>
            <div className="text-2xl font-black text-amber-400 mt-1">
              ₹{totalReceived.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Gross client receipts</p>
          </div>
          <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30">
            <IndianRupee className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Net Bank Payout</p>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              ₹{totalNet.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-emerald-400/80 font-semibold mt-0.5">Verified bank deposit</p>
          </div>
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">UPI / QR Transactions</p>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              {upiCount} / {allPayments.length}
            </div>
            <p className="text-[10px] text-cyan-400/80 font-semibold mt-0.5">₹0 MDR processing fee</p>
          </div>
          <div className="p-3 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Zap className="w-6 h-6" />
          </div>
        </Card>

        <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Card Gateway Fees</p>
            <div className="text-2xl font-black text-rose-400 mt-1">
              ₹{totalCharges.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-rose-400/80 font-semibold mt-0.5">Razorpay 2.36% card fee</p>
          </div>
          <div className="p-3 bg-rose-500/15 text-rose-400 rounded-xl border border-rose-500/30">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* HEADER & FILTERS TOOLBAR CARD */}
      <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="p-5 border-b border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2 text-white">
                <IndianRupee className="w-4.5 h-4.5 text-accent" /> Payments & Booking Verification Ledger
              </CardTitle>
              <CardDescription className="text-xs text-slate-300 font-medium mt-0.5">
                Trace 12-digit UPI UTR numbers e.g. <code className="bg-white/10 text-amber-300 px-1.5 py-0.5 rounded">423891023847</code> or PhonePe reference IDs to verify bookings.
              </CardDescription>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={paymentSearch}
                onChange={e => setPaymentSearch(e.target.value)}
                placeholder="Type 12-digit UPI UTR, GPay ID, client name, or date..."
                className="pl-9 h-9 text-xs rounded-xl bg-white/5 border-white/15 text-white font-medium placeholder:text-slate-400 focus-visible:ring-accent"
              />
            </div>

            {/* Payment Mode Filter */}
            <Select value={paymentFilterMode} onValueChange={setPaymentFilterMode}>
              <SelectTrigger className="h-9 text-xs font-bold bg-white/5 border-white/15 text-white rounded-xl">
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs">
                <SelectItem value="all">All Payment Modes</SelectItem>
                <SelectItem value="upi">⚡ UPI / GPay / PhonePe / QR Code</SelectItem>
                <SelectItem value="credit card">💳 Credit Card</SelectItem>
                <SelectItem value="debit card">💳 Debit Card</SelectItem>
                <SelectItem value="netbanking">🏦 Net Banking / NEFT / IMPS</SelectItem>
                <SelectItem value="cash">💵 Cash Entry</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-end px-2 text-xs text-slate-300 font-extrabold">
              Showing {filteredPayments.length} of {allPayments.length} entries
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {paymentsLoading ? (
            <div className="py-16 text-center text-xs text-slate-400 font-bold space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
              <p>Loading UPI & Accounts ledger...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/10 border-b border-white/10 text-slate-200 font-black uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Payment Date</th>
                    <th className="p-3.5">Client / Customer Name</th>
                    <th className="p-3.5">Booking Remarks</th>
                    <th className="p-3.5">Payment Mode</th>
                    <th className="p-3.5">UPI UTR / Reference No.</th>
                    <th className="p-3.5 text-right">Amount Received</th>
                    <th className="p-3.5 text-right text-rose-400">Gateway Fee</th>
                    <th className="p-3.5 text-right text-emerald-400">Net Deposit</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white">
                  {filteredPayments.map((pay: any, idx: number) => {
                    const amount = Number(pay.amount_received || 0);
                    const charges = Number(pay.gateway_charges || 0);
                    const net = amount - charges;
                    const clientObj = leads.find(l => 
                      String(l.id) === String(pay.lead_id) || 
                      (l.lead_id && String(l.lead_id) === String(pay.lead_id)) ||
                      (l.enquiry_number && String(l.enquiry_number) === String(pay.lead_id))
                    ) || pay.leads || pay.lead;
                    const clientName = clientObj?.customer_name || pay.customer_name || pay.client_name || (pay.lead_id ? `Client (#${pay.lead_id})` : 'Direct Customer');
                    const clientPhone = clientObj?.contact_number || '';
                    const modeStr = (pay.payment_mode || 'UPI').toUpperCase();
                    const isUpi = modeStr.includes('UPI') || modeStr.includes('GPAY') || modeStr.includes('PHONEPE');

                    const handleWhatsAppReceipt = () => {
                      const msg = `*GHUMO FIROO TRAVELS - OFFICIAL PAYMENT RECEIPT*%0A%0A` +
                        `👤 *Client Name:* ${clientName}%0A` +
                        `💰 *Amount Received:* ₹${amount.toLocaleString('en-IN')}%0A` +
                        `⚡ *Payment Mode:* ${pay.payment_mode || 'UPI'}%0A` +
                        `🧾 *UTR / Reference No:* ${pay.reference_number || 'N/A'}%0A` +
                        `📅 *Payment Date:* ${pay.payment_date || new Date().toLocaleDateString()}%0A` +
                        `📌 *Remarks:* ${pay.remarks || 'Advance Tour Deposit'}%0A%0A` +
                        `🟢 *Status:* Confirmed & Deposited%0A` +
                        `Thank you for booking your journey with Ghumo Firoo Travels! ✨`;
                      
                      const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
                      const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
                      window.open(waUrl, '_blank');
                    };

                    return (
                      <tr key={`pay-${pay.id || idx}-${idx}`} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-slate-300 font-semibold">{pay.payment_date}</td>
                        <td className="p-3.5 space-y-1">
                          <div className="font-extrabold text-xs text-white uppercase flex items-center gap-1.5 flex-wrap">
                            <span>{clientName}</span>
                            {clientObj && (
                              <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 border-amber-400/40 text-amber-300 bg-amber-500/10">
                                #{formatLeadId(clientObj)}
                              </Badge>
                            )}
                          </div>
                          {clientObj && (
                            <div className="text-[10px] text-slate-300 font-medium flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{formatLeadRoute(clientObj)}</span>
                              <Link 
                                to={`/crm/leads/${clientObj.id}`} 
                                className="text-[9px] text-amber-400 hover:underline font-bold ml-1"
                                title="View this Customer Booking"
                              >
                                View Booking →
                              </Link>
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-300 font-medium">{pay.remarks || 'Online Booking Deposit'}</td>
                        <td className="p-3.5">
                          <Badge variant="outline" className={`text-[10px] font-black uppercase border px-2.5 py-0.5 rounded-full ${
                            isUpi ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {isUpi ? '⚡ UPI' : pay.payment_mode}
                          </Badge>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-amber-400 font-black flex items-center gap-1.5">
                          {pay.reference_number || '---'}
                        </td>
                        <td className="p-3.5 text-right font-black text-xs text-white">₹{amount.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-right font-bold text-xs text-rose-400">
                          {charges > 0 ? `₹${charges.toLocaleString('en-IN')}` : <span className="text-emerald-400 text-[10px] font-extrabold">₹0 (UPI)</span>}
                        </td>
                        <td className="p-3.5 text-right font-black text-xs text-emerald-400">₹{net.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleWhatsAppReceipt}
                              className="h-7 px-2 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                              title="Send WhatsApp Payment Receipt"
                            >
                              <Share2 className="w-3 h-3" /> WhatsApp
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEditPayment(pay)}
                              className="h-7 px-2 text-[10px] font-bold text-amber-300 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                              title="Edit Payment / Reference"
                            >
                              <Edit className="w-3 h-3" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPaymentToDelete(pay)}
                              className="h-7 px-2 text-[10px] font-bold text-rose-400 hover:bg-rose-500/20 rounded-lg border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                              title="Delete Duplicate / Invalid Entry"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400 font-semibold">
                        No transaction records matching your search or UPI UTR criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filteredPayments.length > 0 && (
            <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex justify-between items-center">
              <p className="text-xs text-slate-300 font-medium">Showing <strong>{filteredPayments.length}</strong> of <strong>{allPayments.length}</strong> ledger entries</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsLedgerView;
