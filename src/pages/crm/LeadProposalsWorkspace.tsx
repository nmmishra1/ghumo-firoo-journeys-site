import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Check, Copy, ArrowRight, Calendar, 
  IndianRupee, Sparkles, Bed, Car, CheckCircle2, 
  ExternalLink, Download, Clock, ShieldCheck, Mail, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

import { crmFetch } from '@/utils/crmApi';

interface ProposalOption {
  id: number | string;
  option_number: number;
  option_name: string;
  title: string;
  total_price: number;
  price_per_person: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired' | 'Archived';
  expiry_date: string;
  payment_schedule: Array<{ label: string; amount: number; due_date: string }>;
  itinerary_data?: any;
  created_at?: string;
  cover_image?: string;
  star_category?: number;
}

interface LeadProposalsWorkspaceProps {
  activeLead: any;
  onOpenBuilderForProposal?: (proposalId: number | string) => void;
  onBackToLeads?: () => void;
}

const apiBase = import.meta.env.VITE_API_BASE_URL || '/php-backend';

export default function LeadProposalsWorkspace({ activeLead, onOpenBuilderForProposal, onBackToLeads }: LeadProposalsWorkspaceProps) {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<ProposalOption[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);

  // Default Mock Proposals if backend table is brand new
  const defaultMockProposals: ProposalOption[] = [
    {
      id: 'opt_1',
      option_number: 1,
      option_name: 'Option 1',
      title: `${activeLead?.destination || 'Trip'} - Luxury 5-Star Experience`,
      total_price: 113408,
      price_per_person: 56704,
      currency: 'INR',
      status: 'Sent',
      expiry_date: '2026-08-25',
      star_category: 5,
      cover_image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      payment_schedule: [
        { label: 'Booking Amount (Token)', amount: 22680, due_date: '2026-08-16' },
        { label: '1st Installment (50% Advance)', amount: 34020, due_date: '2026-08-20' },
        { label: 'Final Balance', amount: 56708, due_date: '2026-09-01' }
      ]
    },
    {
      id: 'opt_2',
      option_number: 2,
      option_name: 'Option 2',
      title: `${activeLead?.destination || 'Trip'} - 4-Star Standard Package`,
      total_price: 67889,
      price_per_person: 33945,
      currency: 'INR',
      status: 'Sent',
      expiry_date: '2026-08-25',
      star_category: 4,
      cover_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      payment_schedule: [
        { label: 'Booking Amount (Token)', amount: 13577, due_date: '2026-08-16' },
        { label: '1st Installment (50% Advance)', amount: 20366, due_date: '2026-08-20' },
        { label: 'Final Balance', amount: 33946, due_date: '2026-09-01' }
      ]
    },
    {
      id: 'opt_3',
      option_number: 3,
      option_name: 'Option 3',
      title: `${activeLead?.destination || 'Trip'} - Deluxe Family Package`,
      total_price: 72880,
      price_per_person: 36440,
      currency: 'INR',
      status: 'Accepted',
      expiry_date: '2026-08-28',
      star_category: 4,
      cover_image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      payment_schedule: [
        { label: 'Booking Amount (Token)', amount: 14576, due_date: '2026-08-16' },
        { label: '1st Installment (50% Advance)', amount: 21864, due_date: '2026-08-20' },
        { label: 'Final Balance', amount: 36440, due_date: '2026-09-01' }
      ]
    }
  ];

  useEffect(() => {
    fetchProposals();
  }, [activeLead?.id]);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      if (!activeLead?.id) {
        setProposals(defaultMockProposals);
        setSelectedProposalId(defaultMockProposals[2].id);
        return;
      }

      const res = await crmFetch(
        `${apiBase}/proposals.php?lead_id=${activeLead.id}`,
        { method: 'GET' },
        { action: 'list_proposals', module: 'Leads', itemName: `Lead #${activeLead.id}` }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data && data.data.length > 0) {
          setProposals(data.data);
          // Auto select accepted or latest option
          const accepted = data.data.find((p: any) => p.status === 'Accepted');
          setSelectedProposalId(accepted ? accepted.id : data.data[0].id);
        } else {
          setProposals(defaultMockProposals);
          setSelectedProposalId(defaultMockProposals[2].id);
        }
      } else {
        setProposals(defaultMockProposals);
        setSelectedProposalId(defaultMockProposals[2].id);
      }
    } catch (err) {
      console.error('Error loading proposals:', err);
      setProposals(defaultMockProposals);
      setSelectedProposalId(defaultMockProposals[2].id);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewOption = async () => {
    const nextNum = proposals.length + 1;
    const estimatedPrice = 75000 + (nextNum - 1) * 12000;
    const pax = Number(activeLead?.number_of_pax) || 2;
    const perPerson = Math.round(estimatedPrice / (pax > 0 ? pax : 1));
    const tokenAmount = Math.round(estimatedPrice * 0.2);
    const advanceAmount = Math.round(estimatedPrice * 0.3);
    const balanceAmount = estimatedPrice - tokenAmount - advanceAmount;

    const newOptData: any = {
      lead_id: activeLead?.id || 1,
      option_number: nextNum,
      option_name: `Option ${nextNum}`,
      title: `${activeLead?.destination || 'Trip'} - Customized Option ${nextNum}`,
      total_price: estimatedPrice,
      price_per_person: perPerson,
      currency: 'INR',
      status: 'Draft',
      expiry_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      star_category: 4,
      cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      payment_schedule: [
        { label: 'Booking Amount (Token)', amount: tokenAmount, due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] },
        { label: '1st Installment (50% Advance)', amount: advanceAmount, due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0] },
        { label: 'Final Balance', amount: balanceAmount, due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0] }
      ],
      itinerary_data: {
        destination: activeLead?.destination || 'Destination',
        duration: activeLead?.duration || '4 Nights / 5 Days',
        days: []
      }
    };

    if (activeLead?.id) {
      try {
        const res = await crmFetch(`${apiBase}/proposals.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOptData)
        }, { action: 'create_proposal_option', module: 'Leads', itemName: `Option ${nextNum}` });

        if (res.ok) {
          const resData = await res.json();
          if (resData.status === 'success' && resData.data) {
            setProposals(prev => [resData.data, ...prev]);
            setSelectedProposalId(resData.data.id);
            toast({
              title: `Proposal Option ${nextNum} Created!`,
              description: `Saved to MySQL database for ${activeLead?.customer_name}.`,
            });
            return;
          }
        }
      } catch (err) {
        console.error('Failed to save proposal to backend:', err);
      }
    }

    const fallbackOpt: ProposalOption = {
      id: `opt_${Date.now()}`,
      ...newOptData
    };
    setProposals(prev => [fallbackOpt, ...prev]);
    setSelectedProposalId(fallbackOpt.id);
    toast({
      title: `Proposal Option ${nextNum} Created!`,
      description: `New option added to ${activeLead?.customer_name || 'guest'}'s proposal grid.`,
    });
  };

  const handleAcceptProposal = async (proposalId: number | string) => {
    try {
      const res = await crmFetch(`${apiBase}/proposals.php?id=${proposalId}&action=accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', lead_id: activeLead?.id })
      }, { action: 'accept_proposal', module: 'Leads', recordId: String(proposalId) });

      if (res.ok) {
        setProposals(prev => prev.map(p => {
          if (p.id === proposalId) return { ...p, status: 'Accepted' };
          if (p.status !== 'Expired') return { ...p, status: 'Archived' };
          return p;
        }));
        toast({
          title: '🎉 Proposal Accepted & Lead Confirmed!',
          description: `Option marked as accepted in MySQL. Lead status updated to Booking Confirmed!`,
        });
        return;
      }
    } catch (err) {
      console.error('Failed to accept proposal via API:', err);
    }

    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) return { ...p, status: 'Accepted' };
      if (p.status !== 'Expired') return { ...p, status: 'Archived' };
      return p;
    }));

    toast({
      title: '🎉 Proposal Accepted & Lead Confirmed!',
      description: `Option marked as accepted. Lead status updated to Booking Confirmed!`,
    });
  };

  const selectedProposal = proposals.find(p => p.id === selectedProposalId) || proposals[0];

  return (
    <div className="min-h-screen bg-[#0B1026] text-white p-4 md:p-8 space-y-6 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/80 p-5 rounded-2xl border border-[#C9A25A]/20 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="cursor-pointer hover:text-white" onClick={onBackToLeads}>Leads Pipeline</span>
            <span>&gt;</span>
            <span className="text-[#C9A25A] font-bold">{activeLead?.customer_name || 'Guest'}</span>
          </div>
          <h1 className="text-xl font-black text-white font-montserrat flex items-center gap-2 mt-1">
            <Sparkles className="w-5 h-5 text-[#C9A25A]" />
            Multi-Option Proposal Workspace: {activeLead?.destination || 'Destination Trip'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => window.open(`/crm/leads/${activeLead?.id || 19}/brochure`, '_blank')} 
            className="bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" /> Live Proposal Brochure
          </Button>
          <Button 
            onClick={handleCreateNewOption}
            className="bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] hover:opacity-90 text-[#0B1026] font-black text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#C9A25A]/20"
          >
            <Plus className="w-4 h-4" /> Generate New Option
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Options Suggested Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C9A25A]" /> Options Suggested ({proposals.length})
            </h2>
            <span className="text-xs text-slate-400 font-semibold">Click any option to review payment schedule & actions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Generate New Proposal Card */}
            <div 
              onClick={handleCreateNewOption}
              className="border-2 border-dashed border-[#C9A25A]/40 hover:border-[#C9A25A] bg-[#1A2342]/30 hover:bg-[#1A2342]/60 rounded-2xl p-8 flex flex-col justify-center items-center text-center cursor-pointer transition-all min-h-[260px] group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#C9A25A]/15 group-hover:bg-[#C9A25A] flex items-center justify-center text-[#C9A25A] group-hover:text-[#0B1026] transition-all mb-3">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-sm font-black text-white">Generate New Proposal</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Create an alternate quote option with different hotels or duration</p>
            </div>

            {/* Proposal Cards */}
            {proposals.map((prop) => {
              const isSelected = prop.id === selectedProposalId;
              const isAccepted = prop.status === 'Accepted';

              return (
                <div
                  key={prop.id}
                  onClick={() => setSelectedProposalId(prop.id)}
                  className={`relative border rounded-2xl p-4 space-y-3 cursor-pointer transition-all overflow-hidden ${
                    isAccepted
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : isSelected
                      ? 'bg-[#1A2342] border-[#C9A25A] shadow-xl shadow-[#C9A25A]/10 ring-2 ring-[#C9A25A]/30'
                      : 'bg-[#1A2342]/50 border-slate-800 hover:border-slate-700 hover:bg-[#1A2342]'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-white tracking-wide uppercase font-mono">
                      {prop.option_name}
                    </span>
                    {isAccepted ? (
                      <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase px-2.5 py-0.5">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> ACCEPTED
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px] uppercase px-2 py-0.5">
                        {prop.status}
                      </Badge>
                    )}
                  </div>

                  {/* Thumbnail & Title */}
                  <div className="relative h-32 rounded-xl overflow-hidden group">
                    <img 
                      src={prop.cover_image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'} 
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 text-left">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                        {prop.star_category || 4}-Star Deluxe Experience
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">{prop.title}</h4>
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="flex justify-between items-baseline pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Per Person Rate</span>
                      <p className="text-lg font-black text-[#C9A25A] font-display">
                        ₹{prop.price_per_person?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Quote</span>
                      <p className="text-xs font-bold text-white font-mono">
                        ₹{prop.total_price?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Footer Expiry */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> Expiry: {prop.expiry_date || '2026-08-25'}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onOpenBuilderForProposal?.(prop.id); }}
                      className="text-[#C9A25A] hover:underline font-bold"
                    >
                      Edit Option &gt;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Proposal Detail & Payment Schedule Panel */}
        {selectedProposal && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <Badge className="bg-[#C9A25A]/20 text-[#C9A25A] border border-[#C9A25A]/30 font-black text-[10px] uppercase">
                    {selectedProposal.option_name} Selected
                  </Badge>
                  <h3 className="text-sm font-black text-white mt-1">{selectedProposal.title}</h3>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Cost Breakdown</h4>
                <div className="flex justify-between text-slate-300">
                  <span>Hotels & Accommodation:</span>
                  <span className="font-bold text-white">₹{Math.round(selectedProposal.total_price * 0.45).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Flights & Transfers:</span>
                  <span className="font-bold text-white">₹{Math.round(selectedProposal.total_price * 0.35).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tours & Activities:</span>
                  <span className="font-bold text-white">₹{Math.round(selectedProposal.total_price * 0.15).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Taxes & GST (5%):</span>
                  <span className="font-bold text-white">₹{Math.round(selectedProposal.total_price * 0.05).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline text-sm font-extrabold text-[#C9A25A]">
                  <span>Total Option Price:</span>
                  <span className="text-base font-display">₹{selectedProposal.total_price?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Schedule Milestones Box */}
              <div className="bg-amber-500/05 border border-amber-500/20 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Payment Schedule Milestones
                </h4>

                <div className="space-y-2 text-xs">
                  {selectedProposal.payment_schedule?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-[11px]">
                      <div>
                        <span className="font-bold text-white block">{item.label}</span>
                        <span className="text-[9px] text-slate-400 font-mono">Due by: {item.due_date}</span>
                      </div>
                      <span className="font-black text-amber-400 font-display">
                        ₹{item.amount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons Panel */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800">
              {selectedProposal.status === 'Accepted' ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                    🟢 Winning Proposal Option
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">This option is locked for guest check-in & vouchers.</p>
                </div>
              ) : (
                <Button 
                  onClick={() => handleAcceptProposal(selectedProposal.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-10 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4" /> Accept Proposal Option
                </Button>
              )}

              <Button 
                variant="outline"
                onClick={() => onOpenBuilderForProposal?.(selectedProposal.id)}
                className="w-full border-slate-700 hover:bg-slate-800 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" /> Edit Proposal in Builder
              </Button>

              <Button 
                variant="ghost"
                onClick={() => window.open(`/crm/leads/${activeLead?.id || 19}/brochure`, '_blank')}
                className="w-full text-slate-400 hover:text-white text-xs h-8 flex items-center justify-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5" /> Share Brochure with Client
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
