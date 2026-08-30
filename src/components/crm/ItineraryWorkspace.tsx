import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Map, FileText, Send, CheckCircle2, AlertTriangle, Plus, Search, 
  Eye, Edit, Copy, ExternalLink, Calendar, Users, IndianRupee, ShieldAlert,
  Loader2, RefreshCw, X, Sparkles, ArrowRight, Trash2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

interface ItineraryWorkspaceProps {
  leads: any[];
  onNavigateLead: (leadId: string, pathSuffix?: string) => void;
}

export const ItineraryWorkspace: React.FC<ItineraryWorkspaceProps> = ({ leads, onNavigateLead }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savedItineraries, setSavedItineraries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'leads'>('saved');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Draft generated from India Explorer
  const [draftItinerary, setDraftItinerary] = useState<any | null>(() => {
    try {
      const d = localStorage.getItem('crm_draft_itinerary');
      return d ? JSON.parse(d) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    fetchSavedItineraries();
  }, []);

  const fetchSavedItineraries = async () => {
    setLoading(true);
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/itineraries_list.php`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setSavedItineraries(data.itineraries || []);
      }
    } catch (err) {
      console.error("Failed to load saved itineraries:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute Active Filtered Lists
  const activeLeads = leads.filter(l => !l.deleted_at);

  const filteredSavedItineraries = savedItineraries.filter(item => {
    const q = search.trim().toLowerCase();
    const name = (item.customer_name || '').toLowerCase();
    const dest = (item.destinations || '').toLowerCase();
    const code = (item.itinerary_code || item.package_name || '').toLowerCase();
    const matchesSearch = name.includes(q) || dest.includes(q) || code.includes(q);

    if (statusFilter === 'flagged') return matchesSearch && Boolean(item.pricing_flagged == 1);
    if (statusFilter === 'confirmed') return matchesSearch && item.status === 'Booking Confirmed';
    if (statusFilter === 'sent') return matchesSearch && item.status === 'Quote Sent';
    return matchesSearch;
  });

  const filteredLeads = activeLeads.filter(l => {
    const q = search.trim().toLowerCase();
    const name = (l.customer_name || '').toLowerCase();
    const dest = (l.destinations || '').toLowerCase();
    const email = (l.email || '').toLowerCase();
    const matchesSearch = name.includes(q) || dest.includes(q) || email.includes(q);

    if (statusFilter === 'confirmed') return matchesSearch && l.status === 'Booking Confirmed';
    if (statusFilter === 'sent') return matchesSearch && l.status === 'Quote Sent';
    return matchesSearch;
  });

  const flaggedCount = savedItineraries.filter(i => i.pricing_flagged == 1).length;
  const confirmedCount = activeLeads.filter(l => l.status === 'Booking Confirmed').length;
  const sentCount = activeLeads.filter(l => l.status === 'Quote Sent').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-900 dark:text-slate-100">
      
      {/* HEADER STRIP */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Map className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white font-montserrat">
              Global Itinerary & Quote Workspace
            </h2>
          </div>
          <p className="text-slate-300 text-xs font-medium pl-9">
            Manage saved itinerary proposals, audit rate card pricing variances, and configure day-by-day tour itineraries for leads.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10">
          <Button 
            onClick={fetchSavedItineraries} 
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400 text-xs gap-1.5 rounded-xl font-extrabold shadow-md"
            style={{ backgroundColor: '#f59e0b', color: '#090d16' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: '#090d16' }} />
            <span style={{ color: '#090d16', fontWeight: 900 }}>Refresh</span>
          </Button>
        </div>
      </div>

      {/* INDIA EXPLORER ACTIVE DRAFT BANNER */}
      {draftItinerary && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-amber-500 text-slate-950 font-extrabold text-[10px]">India Explorer Generated Draft</Badge>
                <span className="text-xs font-black text-foreground">{draftItinerary.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Destinations: <strong>{draftItinerary.destinations}</strong> ({draftItinerary.days} Days / {draftItinerary.nights} Nights) · {draftItinerary.spots?.length || 0} attractions mapped.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { localStorage.removeItem('crm_draft_itinerary'); setDraftItinerary(null); }}
              className="text-xs text-muted-foreground hover:text-red-500 h-8"
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (leads.length > 0) {
                  onNavigateLead(leads[0].id);
                }
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-8 px-3 rounded-xl shadow-md gap-1"
            >
              Attach to Lead Proposal <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* KPI STATS CARDS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card 
          onClick={() => { setActiveTab('saved'); setStatusFilter('all'); }}
          className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-indigo-500/60 group ${activeTab === 'saved' && statusFilter === 'all' ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-md' : ''}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Saved Proposals</p>
              <div className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{savedItineraries.length}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Persisted in database</p>
            </div>
            <div className="p-3 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Map className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => { setActiveTab('saved'); setStatusFilter('all'); }}
          className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-amber-500/60 group`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-amber-500 transition-colors">Proposals Sent</p>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{sentCount}</div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-0.5">Dispatched to clients</p>
            </div>
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
              <Send className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => { setActiveTab('leads'); }}
          className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-emerald-500/60 group ${activeTab === 'leads' ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md' : ''}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Confirmed Bookings</p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{confirmedCount}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Converted travel deals</p>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => { setActiveTab('saved'); setStatusFilter('flagged'); }}
          className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] ${flaggedCount > 0 ? 'border-amber-500/50 bg-amber-500/10' : ''}`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Pricing Audit Alerts</p>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{flaggedCount}</div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-0.5">{flaggedCount > 0 ? 'Review rate variances' : 'All rates verified'}</p>
            </div>
            <div className={`p-3 rounded-xl ${flaggedCount > 0 ? 'bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/40 animate-pulse' : 'bg-muted text-slate-500'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN WORKSPACE CARD */}
      <Card className="border-border/60 shadow-md bg-card">
        <CardHeader className="p-4 border-b border-border/40 space-y-3">
          
          {/* Top Controls: Saved Proposals vs Leads Pipeline Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'saved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('saved')}
                className={`h-9 text-xs px-4 rounded-xl gap-2 font-bold ${
                  activeTab === 'saved' ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-sm' : 'text-slate-800 dark:text-slate-200 border-border/80'
                }`}
              >
                <FileText className="w-4 h-4" /> Saved Proposals ({savedItineraries.length})
              </Button>
              <Button
                variant={activeTab === 'leads' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('leads')}
                className={`h-9 text-xs px-4 rounded-xl gap-2 font-bold ${
                  activeTab === 'leads' ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-sm' : 'text-slate-800 dark:text-slate-200 border-border/80'
                }`}
              >
                <Users className="w-4 h-4" /> Leads Pipeline ({activeLeads.length})
              </Button>
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={`h-7.5 text-xs px-3 rounded-lg font-bold ${statusFilter === 'all' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-700 dark:text-slate-300'}`}
              >
                All
              </Button>
              {flaggedCount > 0 && (
                <Button
                  variant={statusFilter === 'flagged' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('flagged')}
                  className="h-7.5 text-xs px-3 rounded-lg text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/15 font-bold"
                >
                  ⚠️ Flagged Rates ({flaggedCount})
                </Button>
              )}
              <Button
                variant={statusFilter === 'sent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('sent')}
                className={`h-7.5 text-xs px-3 rounded-lg font-bold ${statusFilter === 'sent' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Sent
              </Button>
              <Button
                variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('confirmed')}
                className={`h-7.5 text-xs px-3 rounded-lg font-bold ${statusFilter === 'confirmed' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Confirmed
              </Button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative pt-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder={activeTab === 'saved' ? "Search saved proposals by code, customer name, or destination..." : "Search leads pipeline by customer name, email, or destination..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs rounded-xl bg-background text-slate-950 dark:text-white font-medium placeholder:text-slate-400 border-border/80"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider">Loading itinerary workspace...</p>
            </div>
          ) : activeTab === 'saved' ? (
            /* TAB 1: SAVED PROPOSALS LIST */
            filteredSavedItineraries.length === 0 ? (
              <div className="text-center py-16 text-slate-600 dark:text-slate-300 text-xs bg-muted/10 rounded-b-2xl">
                <Map className="w-12 h-12 mx-auto mb-3 text-amber-500/50" />
                <p className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">No Saved Itinerary Proposals Found</p>
                <p className="text-slate-600 dark:text-slate-300 mb-4 font-medium">Saved proposals will appear here once created from a lead profile.</p>
                <Button size="sm" onClick={() => setActiveTab('leads')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl px-4">
                  Select a Lead to Build Itinerary
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 p-3.5 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider bg-slate-100 dark:bg-slate-900/80 border-b border-border/40">
                  <div className="col-span-3">Proposal Code & Client</div>
                  <div className="col-span-3">Destination & Dates</div>
                  <div className="col-span-2">Quote Amount</div>
                  <div className="col-span-2">Audit & Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Proposal Items */}
                {filteredSavedItineraries.map((item) => {
                  const isFlagged = Boolean(item.pricing_flagged == 1);
                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-3 p-4 items-center hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all text-xs border-b border-border/10">
                      {/* Code & Client */}
                      <div className="col-span-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-xs bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {item.itinerary_code || `ITN-${item.id}`}
                          </span>
                        </div>
                        <p className="font-extrabold text-slate-950 dark:text-white text-xs uppercase tracking-wide truncate">
                          {item.customer_name || 'Valued Client'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
                          {item.customer_email || 'No email registered'}
                        </p>
                      </div>

                      {/* Destination & Dates */}
                      <div className="col-span-3 space-y-1">
                        <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate uppercase">
                          {item.package_name || item.destinations || 'Custom Tour'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {item.travel_start_date ? new Date(item.travel_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Dates TBD'}
                        </p>
                      </div>

                      {/* Quote Amount */}
                      <div className="col-span-2 space-y-0.5">
                        <div className="font-black text-sm text-slate-950 dark:text-white flex items-center">
                          <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
                          {Number(item.final_cost || 0).toLocaleString('en-IN')}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Total Proposal Cost</p>
                      </div>

                      {/* Audit & Status */}
                      <div className="col-span-2 space-y-1">
                        <Badge
                          className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            item.status === 'Booking Confirmed' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' :
                            item.status === 'Quote Sent' ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40' :
                            'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-400'
                          }`}
                          variant="outline"
                        >
                          {item.status || 'Proposal Draft'}
                        </Badge>

                        {isFlagged && (
                          <Badge variant="outline" className="text-[11px] bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 font-bold block w-fit">
                            ⚠️ Rate Variance Flagged
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 text-right flex justify-end gap-1.5">
                        {item.lead_id && (
                          <Button
                            size="sm"
                            onClick={() => onNavigateLead(String(item.lead_id), 'itinerary')}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-8 rounded-lg px-3 shadow-xs"
                            title="Open Itinerary Builder"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* TAB 2: LEADS PIPELINE WORKSPACE */
            filteredLeads.length === 0 ? (
              <div className="text-center py-16 text-slate-600 dark:text-slate-300 text-xs bg-muted/10 rounded-b-2xl">
                <Users className="w-12 h-12 mx-auto mb-3 text-amber-500/50" />
                <p className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">No Active Leads Found</p>
                <p className="text-slate-600 dark:text-slate-300 font-medium">Create a new lead from the Leads menu to start configuring custom itineraries.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 p-3.5 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider bg-slate-100 dark:bg-slate-900/80 border-b border-border/40">
                  <div className="col-span-4">Lead / Customer</div>
                  <div className="col-span-3">Destination</div>
                  <div className="col-span-2">Travel Dates</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Lead Items */}
                {filteredLeads.map((l) => (
                  <div key={l.id} className="grid grid-cols-12 gap-3 p-4 items-center hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all text-xs border-b border-border/10">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0 border border-amber-500/30">
                        {l.customer_name?.charAt(0) || 'L'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-950 dark:text-white uppercase tracking-wide truncate text-xs">{l.customer_name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">{l.email || 'No email'} • {l.contact_number || 'No phone'}</p>
                      </div>
                    </div>

                    <div className="col-span-3 font-extrabold text-slate-900 dark:text-slate-100 uppercase truncate text-xs">
                      {l.destinations || 'Custom Package'}
                    </div>

                    <div className="col-span-2 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {l.trip_start_date ? new Date(l.trip_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Dates TBD'}
                    </div>

                    <div className="col-span-1">
                      <Badge
                        className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          l.status === 'Booking Confirmed' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' :
                          l.status === 'Quote Sent' ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40' :
                          l.status === 'New' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40' :
                          'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-400'
                        }`}
                        variant="outline"
                      >
                        {l.status}
                      </Badge>
                    </div>

                    <div className="col-span-2 text-right flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => onNavigateLead(l.id, 'itinerary')}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-8 rounded-lg px-3 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Build Itinerary
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};
