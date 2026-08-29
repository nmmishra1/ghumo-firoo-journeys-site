import React, { useState } from 'react';
import { 
  Plus, Search, Filter, TrendingUp, Sparkles, User, 
  Calendar, CheckCircle2, AlertTriangle, ArrowRight, ChevronRight, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Opportunity {
  id: string;
  leadId: string;
  customerName: string;
  destination: string;
  expectedRevenue: number;
  probability: number; // 0-100
  stage: 'New Lead' | 'Contacted' | 'Requirements Gathering' | 'Quote Preparing' | 'Quote Sent' | 'Negotiation' | 'Awaiting Decision' | 'Confirmed' | 'Lost';
  owner: string;
  nextFollowup: string;
  createdAt: string;
}

const STAGES: Opportunity['stage'][] = [
  'New Lead', 'Contacted', 'Requirements Gathering', 
  'Quote Preparing', 'Quote Sent', 'Negotiation', 
  'Awaiting Decision', 'Confirmed', 'Lost'
];

const STAGE_COLORS: Record<Opportunity['stage'], string> = {
  'New Lead': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Contacted': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Requirements Gathering': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Quote Preparing': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Quote Sent': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Negotiation': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Awaiting Decision': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Confirmed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Lost': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
};

interface OpportunityKanbanProps {
  opportunities: Opportunity[];
  onUpdateStage: (id: string, stage: Opportunity['stage']) => void;
}

export default function OpportunityKanban({ opportunities = [], onUpdateStage = () => {} }: Partial<OpportunityKanbanProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');

  const safeOpps = Array.isArray(opportunities) ? opportunities : [];
  const filteredOpps = safeOpps.filter(opp => {
    const matchesSearch = opp.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          opp.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOwner = ownerFilter === 'all' || opp.owner === ownerFilter;
    return matchesSearch && matchesOwner;
  });

  const getOppsByStage = (stage: Opportunity['stage']) => {
    return filteredOpps.filter(opp => opp.stage === stage);
  };

  const getColumnTotalRevenue = (stage: Opportunity['stage']) => {
    return getOppsByStage(stage).reduce((sum, opp) => sum + opp.expectedRevenue, 0);
  };

  const owners = Array.from(new Set(opportunities.map(opp => opp.owner)));

  return (
    <div className="space-y-6 text-left">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a1128] p-4 rounded-2xl border border-white/5 shadow-luxury-md">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by customer name or destination..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#111936] border-white/10 text-white rounded-xl h-10 text-xs focus:ring-accent/20"
            />
          </div>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-[#111936] border-white/10 text-white rounded-xl h-10 text-xs">
              <SelectValue placeholder="Filter by Owner" />
            </SelectTrigger>
            <SelectContent className="bg-[#111936] border-white/10 text-white text-xs">
              <SelectItem value="all">All Owners</SelectItem>
              {owners.map(owner => (
                <SelectItem key={owner} value={owner}>{owner}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block">Total Pipeline Value</span>
            <span className="text-lg font-black text-accent">₹{filteredOpps.reduce((sum, opp) => sum + opp.expectedRevenue, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {STAGES.map(stage => {
          const stageOpps = getOppsByStage(stage);
          const totalRevenue = getColumnTotalRevenue(stage);
          return (
            <div key={stage} className="flex flex-col min-w-[280px] w-[280px] shrink-0 bg-[#0c132c]/60 rounded-2xl border border-white/5 p-4 space-y-4 h-[620px] overflow-hidden">
              {/* Column Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-2">
                <div>
                  <h3 className="text-xs font-black text-slate-200 tracking-wide uppercase truncate w-36">{stage}</h3>
                  <p className="text-[10px] text-accent font-bold mt-0.5">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <Badge className={`${STAGE_COLORS[stage]} border px-2 py-0.5 rounded-full text-[9px] font-black`}>
                  {stageOpps.length}
                </Badge>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {stageOpps.length === 0 ? (
                  <div className="h-full flex items-center justify-center border border-dashed border-white/5 rounded-xl py-12 text-[10px] text-muted-foreground font-semibold">
                    No opportunities
                  </div>
                ) : (
                  stageOpps.map(opp => (
                    <Card key={opp.id} className="border-white/5 bg-[#121a36]/60 hover:bg-[#121a36]/90 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group">
                      <CardContent className="p-3.5 space-y-3">
                        {/* Title & Badge */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-200 truncate w-44">{opp.customerName}</h4>
                            <p className="text-[10px] text-muted-foreground font-semibold">{opp.destination}</p>
                          </div>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0.2 border-white/10 text-slate-400 shrink-0">
                            {opp.probability}%
                          </Badge>
                        </div>

                        {/* Financial Details */}
                        <div className="flex justify-between items-center bg-[#0B1026]/40 p-2 rounded-lg">
                          <span className="text-[9px] text-muted-foreground font-bold uppercase">Expected Rev</span>
                          <span className="text-[11px] font-black text-accent">₹{opp.expectedRevenue.toLocaleString()}</span>
                        </div>

                        {/* Owner & Dates */}
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium truncate w-24 text-left">{opp.owner}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold text-slate-300">{opp.nextFollowup}</span>
                          </div>
                        </div>

                        {/* Move Stage Selector */}
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                          <span className="text-[9px] text-muted-foreground font-bold uppercase">Update Stage</span>
                          <Select 
                            value={opp.stage} 
                            onValueChange={(val) => onUpdateStage(opp.id, val as Opportunity['stage'])}
                          >
                            <SelectTrigger className="w-24 h-6 bg-[#0B1026] border-white/10 text-white rounded-md text-[9px] px-1.5 py-0.5">
                              <SelectValue placeholder="Stage" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0b1026] border-white/10 text-white text-[9px]">
                              {STAGES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
