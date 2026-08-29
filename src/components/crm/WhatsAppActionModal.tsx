import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, FileText, CreditCard, Ticket, Star, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id?: string | number;
    lead_id?: string | number;
    customer_name?: string;
    name?: string;
    phone?: string;
    customer_phone?: string;
    whatsapp_number?: string;
    destination?: string;
    package_name?: string;
    quoted_price?: number | string;
    travel_dates?: string;
    pdf_url?: string;
  } | null;
}

type TemplateType = 'welcome_greeting' | 'quote_pdf' | 'payment_reminder' | 'booking_voucher' | 'post_trip_review' | 'custom_text';

export const WhatsAppActionModal: React.FC<WhatsAppActionModalProps> = ({ isOpen, onClose, lead }) => {
  const [templateType, setTemplateType] = useState<TemplateType>('quote_pdf');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!lead) return null;

  const customerName = lead.customer_name || lead.name || 'Valued Guest';
  const phone = lead.whatsapp_number || lead.customer_phone || lead.phone || '+91 98702 29792';
  const destination = lead.destination || lead.package_name || 'Holiday Package';
  const price = lead.quoted_price ? `₹${Number(lead.quoted_price).toLocaleString('en-IN')}` : 'Special Rate';
  const pdfUrl = lead.pdf_url || 'https://ghumofiroo.com/sample_quote.pdf';

  const handleSendWhatsApp = async () => {
    setLoading(true);
    try {
      const response = await fetch('/php-backend/send_lead_whatsapp.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id || lead.lead_id,
          customer_name: customerName,
          destination: destination,
          quoted_price: price,
          phone: phone,
          template_type: templateType,
          pdf_url: pdfUrl,
          payment_url: `https://ghumofiroo.com/pay?lead=${lead.id || lead.lead_id || 10492}`
        })
      });

      const data = await response.json();

      if (data.success) {
        setSentSuccess(true);
        toast.success(`Branded ${templateType.toUpperCase()} template sent to ${customerName} on WhatsApp!`);
        setTimeout(() => {
          setSentSuccess(false);
          onClose();
        }, 1800);
      } else {
        toast.error(data.error || 'Failed to dispatch WhatsApp message.');
      }
    } catch (err) {
      toast.error('Network error connecting to WhatsApp service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-slate-950 border border-slate-800 text-white shadow-2xl rounded-2xl">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                Branded WhatsApp Dispatcher
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  Active
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-0.5">
                Send official luxury quotes, payment links & vouchers directly to <span className="text-amber-400 font-semibold">{customerName}</span> ({phone}).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Template Selector Cards */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <button
            onClick={() => setTemplateType('welcome_greeting')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              templateType === 'welcome_greeting'
                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/5'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5 text-white">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              1. Welcome & Call Time
            </div>
            <p className="text-[10px] text-slate-400">Greeting & ask preferred time.</p>
          </button>

          <button
            onClick={() => setTemplateType('quote_pdf')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              templateType === 'quote_pdf'
                ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md shadow-amber-500/5'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5 text-white">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              2. Quote PDF & Itinerary
            </div>
            <p className="text-[10px] text-slate-400">Sends PDF brochure & price.</p>
          </button>

          <button
            onClick={() => setTemplateType('payment_reminder')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              templateType === 'payment_reminder'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5 text-white">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              3. Payment Deposit Link
            </div>
            <p className="text-[10px] text-slate-400">Razorpay/PayU deposit URL.</p>
          </button>

          <button
            onClick={() => setTemplateType('booking_voucher')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              templateType === 'booking_voucher'
                ? 'bg-blue-500/10 border-blue-500 text-blue-400 shadow-md shadow-blue-500/5'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5 text-white">
              <Ticket className="w-3.5 h-3.5 text-blue-400" />
              4. Booking Voucher
            </div>
            <p className="text-[10px] text-slate-400">Confirmed voucher & driver.</p>
          </button>

          <button
            onClick={() => setTemplateType('post_trip_review')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              templateType === 'post_trip_review'
                ? 'bg-pink-500/10 border-pink-500 text-pink-400 shadow-md shadow-pink-500/5'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5 text-white">
              <Star className="w-3.5 h-3.5 text-pink-400" />
              5. Review Request
            </div>
            <p className="text-[10px] text-slate-400">Post-trip review link.</p>
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400 font-semibold">
            <span>Template Message Preview:</span>
            <span className="text-emerald-400 text-[11px] font-medium">✨ Branded Template</span>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-lg text-slate-200 border border-slate-800/80 leading-relaxed font-sans whitespace-pre-line text-xs">
            {templateType === 'welcome_greeting' && (
              `🌟 WELCOME TO GHUMO FIROO JOURNEYS! 🌟\n\nDear ${customerName},\nThank you for reaching out regarding your ${destination} trip!\n📅 What is the best time for a short 2-min call today?\n📱 A) Morning (10 AM-1 PM)  📱 B) Afternoon (1 PM-5 PM)  📱 C) Evening (5 PM-8 PM)`
            )}
            {templateType === 'quote_pdf' && (
              `🌟 GHUMO FIROO JOURNEYS — LUXURY TRAVEL QUOTE 🌟\n\nDear ${customerName},\nGreetings from Ghumo Firoo Journeys! 🏰✨\nThank you for inquiring about your upcoming ${destination} package.\n📄 Attached PDF: Custom Itinerary & Complete Price Breakdown (${price})`
            )}
            {templateType === 'payment_reminder' && (
              `💳 GHUMO FIROO JOURNEYS — RESERVATION PAYMENT LINK 💳\n\nDear ${customerName},\nYour booking for ${destination} is ready for confirmation!\n💰 Amount Due: ${price}\n🔗 Click to Pay: https://ghumofiroo.com/pay?lead=${lead.id || 10492}`
            )}
            {templateType === 'booking_voucher' && (
              `🎉 BOOKING CONFIRMED — GHUMO FIROO JOURNEYS 🎉\n\nDear ${customerName},\nPack your bags! Your holiday to ${destination} is officially confirmed!\n📄 Attached: Official Booking Confirmation Voucher & Invoice PDF`
            )}
            {templateType === 'post_trip_review' && (
              `❤️ THANK YOU FOR TRAVELING WITH GHUMO FIROO JOURNEYS! ❤️\n\nDear ${customerName},\nWe hope you had a magical ${destination} holiday!\n⭐ Share Your Review: https://ghumofiroo.com/review`
            )}
            {templateType === 'custom_text' && (
              `Hello ${customerName}, greetings from Ghumo Firoo Journeys (+91 98702 29792)! How can we assist with your ${destination} travel plans?`
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
            Cancel
          </Button>

          <Button
            onClick={handleSendWhatsApp}
            disabled={loading || sentSuccess}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Dispatching WhatsApp...
              </>
            ) : sentSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                Dispatched!
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Branded WhatsApp
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
