import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, CreditCard, Shield, Landmark, QrCode, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';

const QuickPayment = () => {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // URL parameters for auto pre-fill (handles both path parameter /pay/:leadId and query parameters)
  const queryLeadId = leadId || searchParams.get('lead') || searchParams.get('leadId') || '';
  const queryAmount = searchParams.get('amount') || '';
  const queryPurpose = searchParams.get('purpose') || searchParams.get('desc') || '';

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState(queryPurpose);
  const [amount, setAmount] = useState(queryAmount);
  const [isProceeding, setIsProceeding] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'razorpay' | 'payu' | 'upi' | 'neft'>('razorpay');
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [upiUtr, setUpiUtr] = useState('');
  
  // Store the verified technical UUID from Supabase
  const [leadUuid, setLeadUuid] = useState('');

  // Pre-fill lead details from Supabase if leadId parameter is supplied in the link
  useEffect(() => {
    if (queryLeadId) {
      const fetchLeadDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('leads')
            .select('id, customer_name, customer_email, customer_phone, expected_booking_value')
            .or(`id.eq.${queryLeadId},enquiry_number.eq.${queryLeadId}`)
            .maybeSingle();
          
          if (error) throw error;
          if (data) {
            setLeadUuid(data.id); // Store the verified UUID
            setName(data.customer_name || '');
            setEmail(data.customer_email || '');
            setPhone(data.customer_phone || '');
            
            // Fill amount if not already supplied via query param
            if (!queryAmount && data.expected_booking_value) {
              setAmount(data.expected_booking_value.toString());
            }
          }
        } catch (err) {
          console.error('Error fetching lead details:', err);
        }
      };
      fetchLeadDetails();
    }
  }, [queryLeadId, queryAmount]);

  // UPI / NEFT Configuration
  const ENV_UPI_ID = 's6116562932@slc';
  const ENV_UPI_QR = '/upi-qr-slice.jpeg';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard successfully.",
    });
  };

  const handleOnlinePayment = async (gateway: 'razorpay' | 'payu') => {
    if (!name || !email || !phone || !amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in Name, Email, Phone, and Amount to proceed.",
        variant: "destructive"
      });
      return;
    }

    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid payment amount.",
        variant: "destructive"
      });
      return;
    }

    const finalAmount = isCreditCard ? amountVal * 1.0236 : amountVal;

    setIsProceeding(true);
    try {
      if (gateway === 'razorpay') {
        const res = await fetch('/php-backend/payments/create_order.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: Math.round(finalAmount * 100), 
            currency: 'INR', 
            receipt: `GF-${Date.now()}` 
          })
        });
        
        if (!res.ok) {
          throw new Error(`Failed to create Razorpay order (${res.status})`);
        }
        
        const orderData = await res.json();
        if (orderData.error) throw new Error(orderData.error);

        const { openRazorpayCheckout } = await import('@/lib/razorpay');
        const checkoutResult = await openRazorpayCheckout({
          order: orderData,
          name: 'Ghumo Firoo Travels',
          description: (purpose || 'General Booking Payment') + (isCreditCard ? ' (with 2.36% Card Fee)' : ''),
          prefill: {
            name: name,
            email: email,
            contact: phone
          }
        });

        // Verify Razorpay transaction and record payment in MySQL
        await fetch('/php-backend/payments/verify.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...checkoutResult,
            lead_id: leadUuid || '',
            amount: finalAmount,
            remarks: (purpose || 'Quick Payment Link') + (isCreditCard ? ' (Credit Card)' : ''),
            email: email,
            phone: phone
          })
        });

        navigate('/thank-you');
      } else if (gateway === 'payu') {
        const res = await fetch('/php-backend/payu_generate_hash.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalAmount.toFixed(2),
            productinfo: (purpose || 'General Booking Payment') + (isCreditCard ? ' (with 2.36% Card Fee)' : ''),
            firstname: name,
            email: email,
            phone: phone,
            lead_id: leadUuid || '',
            purpose: (purpose || 'Quick Payment Link') + (isCreditCard ? ' (Credit Card)' : '')
          })
        });

        if (!res.ok) {
          throw new Error(`Failed to generate PayU hash (${res.status})`);
        }

        const payuData = await res.json();
        if (payuData.error) throw new Error('PayU gateway error');

        const { initiatePayUPayment } = await import('@/lib/payu');
        initiatePayUPayment(payuData);
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Payment Initiation Failed",
        description: err.message || "Failed to start payment. Please try UPI or Bank Transfer.",
        variant: "destructive"
      });
    } finally {
      setIsProceeding(false);
    }
  };

  const handleUpiSubmit = async () => {
    if (!name || !email || !phone || !amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in your name, email, and phone number first.",
        variant: "destructive"
      });
      return;
    }
    const utrClean = upiUtr.trim();
    if (utrClean.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 12-digit UPI UTR / Transaction Ref No.",
        variant: "destructive"
      });
      return;
    }

    setIsProceeding(true);
    try {
      // Find matching lead in Supabase via RPC function
      let matchedLeadId = leadUuid || null;
      if (!matchedLeadId) {
        const { data: leadData, error: rpcErr } = await supabase.rpc('find_lead_by_contact', {
          email_param: email.trim(),
          phone_param: phone.trim()
        });
        if (!rpcErr && leadData && leadData.length > 0) {
          matchedLeadId = leadData[0].id;
        }
      }

      // Insert payment record into MySQL via local API
      const amountVal = parseFloat(amount);
      const res = await fetch('/php-backend/api.php?table=payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: 'pay-' + Date.now() + '-' + Math.round(Math.random() * 1000),
          lead_id: matchedLeadId,
          amount_received: amountVal,
          payment_date: new Date().toISOString().split('T')[0],
          payment_mode: 'UPI',
          reference_number: utrClean,
          remarks: purpose ? `${purpose} (UPI Offline)` : 'Quick Payment Link (UPI Offline)',
          received_by: 'Online Payment',
          status: 'Success',
          gateway_charges: 0
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to record payment in MySQL');
      }

      // Send email notifications via UPI notifier endpoint
      try {
        await fetch('/php-backend/upi_notify.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_id: matchedLeadId || '',
            amount: amountVal,
            remarks: purpose ? `${purpose} (UPI Offline)` : 'Quick Payment Link (UPI Offline)',
            reference_number: utrClean,
            email: email,
            phone: phone,
            name: name
          })
        });
      } catch (e) {
        console.error('Trigger UPI email notify error:', e);
      }

      toast({
        title: "Payment Submitted",
        description: "Your UPI payment details were recorded. The CRM has updated automatically.",
      });
      setUpiUtr('');
      navigate('/thank-you');
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to record payment.",
        variant: "destructive"
      });
    } finally {
      setIsProceeding(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#050814] text-white py-12 sm:py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          
          <div className="mb-6 flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Journeys
            </Button>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
            </div>
          </div>

          <Card className="shadow-2xl border border-[#C9A25A]/30 bg-[#0B1026] rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-6 pt-8 border-b border-white/10 bg-gradient-to-b from-[#111A38] to-[#0B1026]">
              <div className="w-14 h-14 rounded-2xl bg-[#C9A25A]/10 border border-[#C9A25A]/30 text-[#C9A25A] flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A25A] mb-1">
                ✦ Official Travel Desk
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                Secure Quick Payment Portal
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                Complete your tour booking, package advance, or customized itinerary payment with instant verification.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-8 space-y-8">
              
              {/* Customer Details Form */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                  <div className="w-1.5 h-4 bg-[#C9A25A] rounded-full" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    1. Traveler & Payment Details
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium text-slate-300">
                      Full Name <span className="text-rose-400">*</span>
                    </Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Rahul Sharma" 
                      value={name}
                      onChange={(e) => setName(e.target.value)} 
                      className="bg-[#060A1A] border-slate-700/80 text-white placeholder:text-slate-500 focus:border-[#C9A25A] focus:ring-[#C9A25A]/20 h-11"
                      required 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-slate-300">
                      Email Address <span className="text-rose-400">*</span>
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="e.g. rahul@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} 
                      className="bg-[#060A1A] border-slate-700/80 text-white placeholder:text-slate-500 focus:border-[#C9A25A] focus:ring-[#C9A25A]/20 h-11"
                      required 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium text-slate-300">
                      Phone Number (WhatsApp) <span className="text-rose-400">*</span>
                    </Label>
                    <Input 
                      id="phone" 
                      placeholder="e.g. +91 98765 43210" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)} 
                      className="bg-[#060A1A] border-slate-700/80 text-white placeholder:text-slate-500 focus:border-[#C9A25A] focus:ring-[#C9A25A]/20 h-11"
                      required 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="purpose" className="text-xs font-medium text-slate-300">
                      Payment Purpose
                    </Label>
                    <Input 
                      id="purpose" 
                      placeholder="e.g. Booking Advance, Char Dham Tour" 
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)} 
                      className="bg-[#060A1A] border-slate-700/80 text-white placeholder:text-slate-500 focus:border-[#C9A25A] focus:ring-[#C9A25A]/20 h-11"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="amount" className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Amount to Pay (INR) <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-slate-400">All prices in Indian Rupees (₹)</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A25A] font-bold text-lg">₹</span>
                      <Input 
                        id="amount" 
                        type="number"
                        placeholder="0.00" 
                        className="pl-9 text-xl font-bold bg-[#060A1A] border-[#C9A25A]/40 text-[#C9A25A] placeholder:text-slate-600 focus:border-[#C9A25A] h-13" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                  <div className="w-1.5 h-4 bg-[#C9A25A] rounded-full" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    2. Select Payment Method
                  </h3>
                </div>
                
                <Tabs value={selectedGateway} onValueChange={(v: any) => setSelectedGateway(v)} className="w-full">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 h-auto bg-[#060A1A] p-1.5 rounded-xl border border-white/10">
                    <TabsTrigger 
                      value="razorpay" 
                      className="py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 data-[state=active]:bg-[#C9A25A] data-[state=active]:text-[#0B1026] transition-all"
                    >
                      <CreditCard className="w-4 h-4" /> Razorpay
                    </TabsTrigger>
                    <TabsTrigger 
                      value="payu" 
                      className="py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 data-[state=active]:bg-[#C9A25A] data-[state=active]:text-[#0B1026] transition-all"
                    >
                      <Shield className="w-4 h-4" /> PayU
                    </TabsTrigger>
                    <TabsTrigger 
                      value="upi" 
                      className="py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 data-[state=active]:bg-[#C9A25A] data-[state=active]:text-[#0B1026] transition-all"
                    >
                      <QrCode className="w-4 h-4" /> UPI QR
                    </TabsTrigger>
                    <TabsTrigger 
                      value="neft" 
                      className="py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 data-[state=active]:bg-[#C9A25A] data-[state=active]:text-[#0B1026] transition-all"
                    >
                      <Landmark className="w-4 h-4" /> Bank / NEFT
                    </TabsTrigger>
                  </TabsList>

                  {/* Razorpay Gateway */}
                  <TabsContent value="razorpay" className="pt-6 text-center space-y-4">
                    <div className="bg-[#080E24] p-6 sm:p-8 rounded-2xl border border-[#C9A25A]/20 max-w-lg mx-auto text-left shadow-lg">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                        <div>
                          <h4 className="font-serif font-bold text-lg text-white">Razorpay Checkout</h4>
                          <p className="text-xs text-slate-400">UPI, Net Banking, Debit Cards & Wallets</p>
                        </div>
                        <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-8 filter brightness-125" />
                      </div>
                      
                      <div className="flex items-center space-x-2.5 bg-white/5 p-3.5 rounded-xl border border-white/10 mb-4">
                        <Checkbox 
                          id="cc-charge-razorpay" 
                          checked={isCreditCard} 
                          onCheckedChange={(checked) => setIsCreditCard(!!checked)} 
                          className="border-[#C9A25A] data-[state=checked]:bg-[#C9A25A] data-[state=checked]:text-[#0B1026]"
                        />
                        <label htmlFor="cc-charge-razorpay" className="text-xs text-slate-300 font-medium leading-none cursor-pointer select-none">
                          Paying with Credit Card (Adds 2.36% gateway processing fee)
                        </label>
                      </div>

                      {isCreditCard && parseFloat(amount) > 0 && (
                        <div className="bg-[#050814] p-3.5 rounded-xl text-xs space-y-2 border border-white/10 mb-5">
                          <div className="flex justify-between text-slate-400">
                            <span>Base Amount:</span>
                            <span className="text-white">₹{parseFloat(amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Convenience Fee (2.36%):</span>
                            <span className="text-amber-400">+₹{(parseFloat(amount) * 0.0236).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-sm text-[#C9A25A] border-t border-white/10 pt-2">
                            <span>Total Payable:</span>
                            <span>₹{(parseFloat(amount) * 1.0236).toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <Button 
                        disabled={isProceeding} 
                        onClick={() => handleOnlinePayment('razorpay')}
                        className="bg-[#C9A25A] hover:bg-[#D4AF37] text-[#0B1026] w-full py-6 text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#C9A25A]/20 transition-all"
                      >
                        {isProceeding ? 'Connecting to Gateway...' : `Proceed to Pay ₹${isCreditCard ? (parseFloat(amount) * 1.0236).toFixed(2) : (amount || '0')}`}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* PayU Gateway */}
                  <TabsContent value="payu" className="pt-6 text-center space-y-4">
                    <div className="bg-[#080E24] p-6 sm:p-8 rounded-2xl border border-emerald-500/20 max-w-lg mx-auto text-left shadow-lg">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                        <div>
                          <h4 className="font-serif font-bold text-lg text-white">PayU Gateway</h4>
                          <p className="text-xs text-slate-400">Direct debit, corporate cards, and netbanking</p>
                        </div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/PayU.svg" alt="PayU" className="h-6 filter brightness-150" />
                      </div>
                      
                      <div className="flex items-center space-x-2.5 bg-white/5 p-3.5 rounded-xl border border-white/10 mb-4">
                        <Checkbox 
                          id="cc-charge-payu" 
                          checked={isCreditCard} 
                          onCheckedChange={(checked) => setIsCreditCard(!!checked)} 
                          className="border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                        />
                        <label htmlFor="cc-charge-payu" className="text-xs text-slate-300 font-medium leading-none cursor-pointer select-none">
                          Paying with Credit Card (Adds 2.36% gateway processing fee)
                        </label>
                      </div>

                      {isCreditCard && parseFloat(amount) > 0 && (
                        <div className="bg-[#050814] p-3.5 rounded-xl text-xs space-y-2 border border-white/10 mb-5">
                          <div className="flex justify-between text-slate-400">
                            <span>Base Amount:</span>
                            <span className="text-white">₹{parseFloat(amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Convenience Fee (2.36%):</span>
                            <span className="text-emerald-400">+₹{(parseFloat(amount) * 0.0236).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-sm text-emerald-400 border-t border-white/10 pt-2">
                            <span>Total Payable:</span>
                            <span>₹{(parseFloat(amount) * 1.0236).toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <Button 
                        disabled={isProceeding} 
                        onClick={() => handleOnlinePayment('payu')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-6 text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        {isProceeding ? 'Connecting to Gateway...' : `Proceed via PayU ₹${isCreditCard ? (parseFloat(amount) * 1.0236).toFixed(2) : (amount || '0')}`}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* UPI QR */}
                  <TabsContent value="upi" className="pt-6 space-y-6">
                    <div className="bg-[#080E24] p-6 sm:p-8 rounded-2xl border border-[#C9A25A]/20 flex flex-col items-center text-center max-w-md mx-auto shadow-xl">
                      <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-white/20 mb-4">
                        <img src={ENV_UPI_QR} alt="UPI QR" className="w-48 h-48 object-contain rounded-lg" />
                      </div>
                      <h4 className="font-serif font-bold text-lg text-white mb-1">Scan & Pay via any UPI App</h4>
                      <p className="text-xs text-slate-400 mb-4">Google Pay, PhonePe, Paytm, BHIM, or Cred</p>
                      
                      <div className="flex items-center gap-2 bg-[#060A1A] pl-3.5 pr-1.5 py-2 rounded-xl border border-white/15 w-full mb-6">
                        <span className="font-mono text-xs font-semibold text-[#C9A25A] truncate flex-grow text-left">{ENV_UPI_ID}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(ENV_UPI_ID)} className="h-8 text-xs text-slate-300 hover:text-white hover:bg-white/10">
                          Copy VPA
                        </Button>
                      </div>

                      <div className="w-full pt-6 border-t border-white/10 space-y-4 text-left">
                        <h5 className="font-serif font-bold text-sm text-white">Paid already? Submit your 12-digit UTR Ref:</h5>
                        <div className="space-y-1.5">
                          <Label htmlFor="upi-utr" className="text-xs text-slate-300 font-medium">
                            UPI Transaction Ref / UTR No. <span className="text-rose-400">*</span>
                          </Label>
                          <Input 
                            id="upi-utr" 
                            placeholder="e.g. 515514238285 (12 digits)" 
                            value={upiUtr}
                            onChange={(e) => setUpiUtr(e.target.value)} 
                            className="bg-[#060A1A] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#C9A25A] h-11"
                          />
                        </div>
                        <Button 
                          onClick={handleUpiSubmit} 
                          disabled={isProceeding} 
                          className="w-full bg-[#C9A25A] hover:bg-[#D4AF37] text-[#0B1026] font-bold py-6 text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#C9A25A]/20"
                        >
                          {isProceeding ? 'Submitting to CRM...' : 'Submit & Confirm Payment'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Bank Transfer / NEFT */}
                  <TabsContent value="neft" className="pt-6">
                    <div className="bg-[#080E24] p-6 sm:p-8 rounded-2xl border border-white/15 max-w-lg mx-auto space-y-4 shadow-xl text-left">
                      <div className="flex justify-between items-center pb-3.5 border-b border-white/10">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Account Name</span>
                        <span className="font-bold text-xs sm:text-sm text-white">Ghumo Firoo Travels</span>
                      </div>
                      <div className="flex justify-between items-center pb-3.5 border-b border-white/10">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Bank Name</span>
                        <span className="font-bold text-xs sm:text-sm text-white">Slice Small Finance Bank Limited</span>
                      </div>
                      <div className="flex justify-between items-center pb-3.5 border-b border-white/10">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Account Number</span>
                        <div className="flex items-center gap-2 bg-[#060A1A] px-3 py-1.5 rounded-lg border border-white/10">
                          <span className="font-mono text-xs font-bold text-[#C9A25A]">033311501001651</span>
                          <button onClick={() => copyToClipboard('033311501001651')} className="text-slate-400 hover:text-white transition-colors" title="Copy Account Number">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">IFSC Code</span>
                        <div className="flex items-center gap-2 bg-[#060A1A] px-3 py-1.5 rounded-lg border border-white/10">
                          <span className="font-mono text-xs font-bold text-[#C9A25A]">NESF0000333</span>
                          <button onClick={() => copyToClipboard('NESF0000333')} className="text-slate-400 hover:text-white transition-colors" title="Copy IFSC Code">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-4">
                      💡 After completing your NEFT/IMPS transfer, share your receipt on WhatsApp at <strong className="text-white">+91 99109 87264</strong> for instant booking confirmation.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Automatic Workflow & Trust Footer */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[#C9A25A] text-xs font-bold mb-0.5">1. Instant Logging</div>
                  <div className="text-[11px] text-slate-400 leading-snug">Recorded directly to the CRM transaction ledger</div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[#C9A25A] text-xs font-bold mb-0.5">2. Automated Receipt</div>
                  <div className="text-[11px] text-slate-400 leading-snug">Instant digital invoice sent to your email & WhatsApp</div>
                </div>
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <div className="text-[#C9A25A] text-xs font-bold mb-0.5">3. 100% Confirmation</div>
                  <div className="text-[11px] text-slate-400 leading-snug">Redirects to verified confirmation voucher</div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default QuickPayment;
