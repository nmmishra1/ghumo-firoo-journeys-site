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
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>

          <Card className="shadow-2xl border-border bg-card/70 backdrop-blur-md">
            <CardHeader className="text-center pb-4 border-b border-border/40">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">GF Quick Payment Portal</CardTitle>
              <CardDescription>Enter details and pay securely using any payment method</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-8 space-y-8">
              
              {/* Customer Details Form */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    placeholder="Enter your name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input 
                    id="phone" 
                    placeholder="Enter phone number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Payment Purpose</Label>
                  <Input 
                    id="purpose" 
                    placeholder="e.g. Booking Advance, Kashmir Tour" 
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)} 
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="amount">Amount to Pay (INR) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                    <Input 
                      id="amount" 
                      type="number"
                      placeholder="0.00" 
                      className="pl-8 text-lg font-bold text-blue-900 dark:text-blue-200" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">Select Payment Method</h3>
                
                <Tabs value={selectedGateway} onValueChange={(v: any) => setSelectedGateway(v)} className="w-full">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 h-auto bg-muted/50 p-1.5 rounded-xl">
                    <TabsTrigger value="razorpay" className="py-2.5 rounded-lg flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" /> Razorpay
                    </TabsTrigger>
                    <TabsTrigger value="payu" className="py-2.5 rounded-lg flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" /> PayU
                    </TabsTrigger>
                    <TabsTrigger value="upi" className="py-2.5 rounded-lg flex items-center justify-center gap-2">
                      <QrCode className="w-4 h-4" /> UPI QR
                    </TabsTrigger>
                    <TabsTrigger value="neft" className="py-2.5 rounded-lg flex items-center justify-center gap-2">
                      <Landmark className="w-4 h-4" /> Bank / NEFT
                    </TabsTrigger>
                  </TabsList>

                  {/* Razorpay Gateway */}
                  <TabsContent value="razorpay" className="pt-6 text-center space-y-4">
                    <div className="bg-gradient-to-br from-blue-500/5 to-background p-8 rounded-2xl border border-blue-500/10 max-w-lg mx-auto">
                      <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-10 mx-auto mb-4" />
                      <h4 className="font-bold text-lg mb-1">Pay via Razorpay</h4>
                      <p className="text-sm text-muted-foreground mb-4">Pay securely with UPI, Net Banking, Credit/Debit cards, or Wallets.</p>
                      
                      <div className="flex items-center space-x-2 bg-muted/40 p-3 rounded-lg border border-border/50 text-left my-4">
                        <Checkbox id="cc-charge-razorpay" checked={isCreditCard} onCheckedChange={(checked) => setIsCreditCard(!!checked)} />
                        <label htmlFor="cc-charge-razorpay" className="text-sm font-medium leading-none cursor-pointer select-none">
                          Paying with Credit Card (Adds 2.36% gateway fee)
                        </label>
                      </div>

                      {isCreditCard && parseFloat(amount) > 0 && (
                        <div className="bg-muted/30 p-3 rounded-lg text-left text-sm space-y-1.5 border border-border/40 mb-4">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Base Amount:</span>
                            <span>₹{parseFloat(amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Convenience Fee (2.36%):</span>
                            <span>₹{(parseFloat(amount) * 0.0236).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-foreground border-t border-border/30 pt-1.5 mt-1.5">
                            <span>Total Payable:</span>
                            <span>₹{(parseFloat(amount) * 1.0236).toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <Button 
                        disabled={isProceeding} 
                        onClick={() => handleOnlinePayment('razorpay')}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-6 text-md font-semibold rounded-xl shadow-lg"
                      >
                        {isProceeding ? 'Connecting...' : `Pay ₹${isCreditCard ? (parseFloat(amount) * 1.0236).toFixed(2) : (amount || '0')} Now`}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* PayU Gateway */}
                  <TabsContent value="payu" className="pt-6 text-center space-y-4">
                    <div className="bg-gradient-to-br from-emerald-500/5 to-background p-8 rounded-2xl border border-emerald-500/10 max-w-lg mx-auto">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/PayU.svg" alt="PayU" className="h-8 mx-auto mb-4" />
                      <h4 className="font-bold text-lg mb-1">Pay via PayU</h4>
                      <p className="text-sm text-muted-foreground mb-4">High-success checkout for cards, netbanking, and UPI.</p>
                      
                      <div className="flex items-center space-x-2 bg-muted/40 p-3 rounded-lg border border-border/50 text-left my-4">
                        <Checkbox id="cc-charge-payu" checked={isCreditCard} onCheckedChange={(checked) => setIsCreditCard(!!checked)} />
                        <label htmlFor="cc-charge-payu" className="text-sm font-medium leading-none cursor-pointer select-none">
                          Paying with Credit Card (Adds 2.36% gateway fee)
                        </label>
                      </div>

                      {isCreditCard && parseFloat(amount) > 0 && (
                        <div className="bg-muted/30 p-3 rounded-lg text-left text-sm space-y-1.5 border border-border/40 mb-4">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Base Amount:</span>
                            <span>₹{parseFloat(amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Convenience Fee (2.36%):</span>
                            <span>₹{(parseFloat(amount) * 0.0236).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-foreground border-t border-border/30 pt-1.5 mt-1.5">
                            <span>Total Payable:</span>
                            <span>₹{(parseFloat(amount) * 1.0236).toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <Button 
                        disabled={isProceeding} 
                        onClick={() => handleOnlinePayment('payu')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-6 text-md font-semibold rounded-xl shadow-lg"
                      >
                        {isProceeding ? 'Connecting...' : `Pay ₹${isCreditCard ? (parseFloat(amount) * 1.0236).toFixed(2) : (amount || '0')} Now`}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* UPI QR */}
                  <TabsContent value="upi" className="pt-6 space-y-6">
                    <div className="bg-gradient-to-br from-amber-500/5 to-background p-6 rounded-2xl border border-amber-500/10 flex flex-col items-center text-center max-w-md mx-auto">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-border mb-4">
                        <img src={ENV_UPI_QR} alt="UPI QR" className="w-48 h-48 object-contain" />
                      </div>
                      <h4 className="font-bold text-lg mb-1">Scan to Pay</h4>
                      <p className="text-xs text-muted-foreground mb-4">Scan QR with Google Pay, PhonePe, Paytm, or BHIM.</p>
                      
                      <div className="flex items-center gap-2 bg-muted/60 pl-3 pr-1 py-1.5 rounded-lg border border-border/50 w-full mb-6">
                        <span className="font-mono text-sm font-semibold truncate flex-grow text-left">{ENV_UPI_ID}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(ENV_UPI_ID)} className="h-8 hover:bg-background">
                          Copy ID
                        </Button>
                      </div>

                      <div className="w-full pt-6 border-t border-border/40 space-y-4 text-left">
                        <h5 className="font-bold text-sm text-foreground">Paid already? Submit transaction details:</h5>
                        <div className="space-y-2">
                          <Label htmlFor="upi-utr" className="text-xs">UPI Transaction ID / Ref No. (12 digits) <span className="text-red-500">*</span></Label>
                          <Input 
                            id="upi-utr" 
                            placeholder="e.g. 515514238285" 
                            value={upiUtr}
                            onChange={(e) => setUpiUtr(e.target.value)} 
                          />
                        </div>
                        <Button 
                          onClick={handleUpiSubmit} 
                          disabled={isProceeding} 
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 text-xs rounded-lg"
                        >
                          {isProceeding ? 'Submitting...' : 'Submit Payment Verification'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Bank Transfer / NEFT */}
                  <TabsContent value="neft" className="pt-6">
                    <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-inner max-w-lg mx-auto space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-xs text-muted-foreground font-medium uppercase">Account Name</span>
                        <span className="font-bold text-sm">Ghumo Firoo Travels</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-xs text-muted-foreground font-medium uppercase">Bank Name</span>
                        <span className="font-bold text-sm">Slice Small Finance Bank Limited</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-xs text-muted-foreground font-medium uppercase">Account Number</span>
                        <div className="flex items-center gap-2 bg-muted/60 px-2 py-1 rounded">
                          <span className="font-mono text-xs font-bold">033311501001651</span>
                          <button onClick={() => copyToClipboard('033311501001651')} className="text-muted-foreground hover:text-foreground">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground font-medium uppercase">IFSC Code</span>
                        <div className="flex items-center gap-2 bg-muted/60 px-2 py-1 rounded">
                          <span className="font-mono text-xs font-bold">NESF0000333</span>
                          <button onClick={() => copyToClipboard('NESF0000333')} className="text-muted-foreground hover:text-foreground">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                      💡 Share transaction screenshot on WhatsApp after doing Bank Transfer.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default QuickPayment;
