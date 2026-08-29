import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, XCircle, MessageSquare, Phone, Check, X, 
  Loader2, AlertTriangle, Calendar, FileText, Share2, Compass, Shield, Award, Hotel, Building2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/php-backend';

export default function QuoteView() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  
  // Discussion / request change state
  const [showDiscussModal, setShowDiscussModal] = useState(false);
  const [discussMessage, setDiscussMessage] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing quote reference token.');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/quote_view.php?token=${token}`)
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
  }, [token]);

  const handleAction = async (action: 'accept' | 'discuss' | 'reject', customMessage?: string) => {
    if (!token) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`${API_BASE}/quote_action.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
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
    : 'N/A';

  const waContactUrl = `https://wa.me/919910987264?text=Hi!+I+am+reviewing+proposal+V${versionNumber}+for+${encodeURIComponent(packageName)}+and+would+like+to+discuss+details.`;

  return (
    <div className="min-h-screen bg-[#060A18] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <Helmet>
        <title>{packageName} Custom Proposal | Ghumo Firoo Travels</title>
      </Helmet>

      {/* Decorative blurred backdrops */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#C9A25A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1A2342]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Brand Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center border-b border-[#C9A25A]/20 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <Compass className="w-10 h-10 text-[#C9A25A]" />
            <div>
              <h1 className="text-2xl font-display font-bold tracking-wider text-gradient-sunset">GHUMO FIROO</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A25A]/80 font-medium">Bespoke Travel Journeys</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <Badge variant="luxury" className="text-xs">Version V{versionNumber}</Badge>
            <p className="text-xs text-gray-400 mt-1">Status: <span className="font-semibold text-white">{status}</span></p>
          </div>
        </header>

        {/* Personalized Message from Agent */}
        {shareMessage && (
          <div className="bg-[#1A2342]/30 border border-[#C9A25A]/25 rounded-luxury-xl p-5 shadow-luxury-md">
            <p className="text-xs text-[#C9A25A]/90 font-semibold uppercase tracking-wider mb-2">Message From Your Travel Advisor:</p>
            <p className="text-sm italic text-gray-300">"{shareMessage}"</p>
          </div>
        )}

        {/* Core Summary Card */}
        <Card className="glass-card border-[#C9A25A]/25 overflow-hidden shadow-luxury-lg">
          <CardHeader className="bg-[#1A2342]/20 border-b border-[#C9A25A]/15 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardDescription className="text-xs text-[#C9A25A]/90 uppercase tracking-widest font-semibold">Bespoke Proposal For {customerName}</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">{packageName}</CardTitle>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Investment</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#C9A25A] font-display mt-0.5">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">All Inclusive Quote</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Validity and Cost Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Proposal Info */}
              <div className="bg-[#0B1026]/40 rounded-xl p-4 border border-[#C9A25A]/10 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="w-4 h-4 text-[#C9A25A]" />
                  <span>Valid Until: <strong>{expiryDateFormatted}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FileText className="w-4 h-4 text-[#C9A25A]" />
                  <span>Proposal Reference: <strong>GF-QT-{quote.id.substring(0, 8).toUpperCase()}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield className="w-4 h-4 text-[#C9A25A]" />
                  <span>Secure Checkout: <strong>Verified</strong></span>
                </div>
              </div>

              {/* All-Inclusive Package Summary */}
              <div className="bg-[#0B1026]/40 rounded-xl p-4 border border-[#C9A25A]/10 space-y-2">
                <h4 className="text-xs text-[#C9A25A] uppercase tracking-wider font-semibold mb-2">Package Price Guarantee</h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Package Investment</span>
                    <span className="font-extrabold text-[#C9A25A] text-lg font-display">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium pt-1 border-t border-[#C9A25A]/10">
                    Includes full accommodation, private vehicle transfers, taxes, guided sightseeing, and 24/7 dedicated trip assistance.
                  </p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
        {/* Handpicked Accommodations & Hotel Stay Breakdown */}
        {quote.cost_breakdown && Array.isArray(quote.cost_breakdown.items) && quote.cost_breakdown.items.some((i: any) => i.type === 'hotel') && (
          <Card className="bg-[#0B1026]/30 border border-[#C9A25A]/20 shadow-md rounded-luxury-xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#C9A25A]/15 bg-[#1A2342]/20">
              <CardTitle className="text-lg font-display text-white flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <Hotel className="w-5 h-5 text-[#C9A25A]" /> Handpicked Accommodations & Hotel Stays
                </span>
                <Badge variant="luxury" className="text-[10px]">Included in Package</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quote.cost_breakdown.items.filter((i: any) => i.type === 'hotel').map((item: any, idx: number) => (
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
              {Array.isArray(inclusions) && inclusions.length > 0 ? (
                <ul className="space-y-2.5 text-sm text-gray-300">
                  {inclusions.map((inc: string, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-[#C9A25A] flex-shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">Standard inclusions apply. Contact adviser for vouchers.</p>
              )}
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
              {Array.isArray(exclusions) && exclusions.length > 0 ? (
                <ul className="space-y-2.5 text-sm text-gray-300">
                  {exclusions.map((exc: string, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <X className="w-4 h-4 text-red-500/80 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-400">{exc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No exclusions declared. Contact adviser for details.</p>
              )}
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
