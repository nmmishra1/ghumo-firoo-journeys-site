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
  Loader2, RefreshCw, X, Sparkles, ArrowRight, Trash2, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const getValidDateCandidate = (...dates: any[]): string | undefined => {
  for (const d of dates) {
    if (!d) continue;
    const s = String(d).trim();
    if (
      s &&
      s !== '0000-00-00' &&
      !s.startsWith('0000-00-00') &&
      s !== 'null' &&
      s !== 'undefined' &&
      s.toLowerCase() !== 'invalid date'
    ) {
      return s;
    }
  }
  return undefined;
};

const formatTravelDate = (dateVal: any, endDateVal?: any): string => {
  if (!dateVal) return 'Dates TBD';
  const cleanVal = String(dateVal).trim();
  if (
    !cleanVal ||
    cleanVal === '0000-00-00' ||
    cleanVal.startsWith('0000-00-00') ||
    cleanVal === 'null' ||
    cleanVal === 'undefined' ||
    cleanVal.toLowerCase() === 'invalid date'
  ) {
    return 'Dates TBD';
  }

  // Handle range strings like "2026-10-15 to 2026-10-20"
  if (cleanVal.includes(' to ')) {
    const [start, end] = cleanVal.split(' to ');
    const sFormatted = formatTravelDate(start);
    const eFormatted = formatTravelDate(end);
    if (sFormatted !== 'Dates TBD' && eFormatted !== 'Dates TBD') {
      return `${sFormatted} - ${eFormatted}`;
    }
  }

  const dateOnly = cleanVal.split('T')[0];

  // Attempt timezone-safe YYYY-MM-DD parsing
  const ymdMatch = dateOnly.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      const formattedStart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (endDateVal) {
        const endClean = String(endDateVal).trim().split('T')[0];
        if (endClean && endClean !== '0000-00-00' && !endClean.startsWith('0000-00-00')) {
          const endYmd = endClean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
          if (endYmd) {
            const endD = new Date(parseInt(endYmd[1], 10), parseInt(endYmd[2], 10) - 1, parseInt(endYmd[3], 10));
            if (!isNaN(endD.getTime())) {
              return `${formattedStart} - ${endD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            }
          }
        }
      }
      return formattedStart;
    }
  }

  // Attempt standard Date parsing
  const parsed = new Date(cleanVal);
  if (!isNaN(parsed.getTime())) {
    const formattedStart = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (endDateVal && typeof endDateVal === 'string') {
      const endClean = endDateVal.trim();
      if (endClean && endClean !== '0000-00-00' && !endClean.startsWith('0000-00-00')) {
        const parsedEnd = new Date(endClean);
        if (!isNaN(parsedEnd.getTime())) {
          const formattedEnd = parsedEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          return `${formattedStart} - ${formattedEnd}`;
        }
      }
    }
    return formattedStart;
  }

  // Fallback: If it's a readable text description (e.g. "October 2026"), show it directly
  if (cleanVal.length > 0 && !cleanVal.includes('0000') && !cleanVal.toLowerCase().includes('invalid')) {
    return cleanVal;
  }

  return 'Dates TBD';
};

interface ItineraryWorkspaceProps {
  leads: any[];
  onNavigateLead: (leadId: string, pathSuffix?: string) => void;
}

export const ItineraryWorkspace: React.FC<ItineraryWorkspaceProps> = ({ leads, onNavigateLead }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const fetchSavedItineraries = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/itineraries_list.php${forceRefresh ? '?force_refresh=true' : ''}`, {
        headers: {
          ...authHeaders,
          ...(forceRefresh ? { 'x-force-refresh': 'true' } : {})
        }
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

  const resolveCustomerInfo = (item: any) => {
    const linkedLead = leads.find(l => String(l.id) === String(item.lead_id));
    
    let name = item.customer_name;
    if (!name || name.trim() === '' || name.toLowerCase() === 'valued client' || name.toLowerCase() === 'guest') {
      if (linkedLead?.customer_name) {
        name = linkedLead.customer_name;
      } else if (linkedLead?.customerName) {
        name = linkedLead.customerName;
      } else if (item.package_name) {
        const match = item.package_name.match(/^Itinerary for\s+([^–—\-|]+)/i);
        if (match && match[1]) {
          name = match[1].trim();
        }
      }
    }

    let email = item.customer_email;
    if (!email || email.trim() === '' || email.toLowerCase() === 'no email registered') {
      if (linkedLead?.customer_email || linkedLead?.email || linkedLead?.customerEmail) {
        email = linkedLead.customer_email || linkedLead.email || linkedLead.customerEmail;
      }
    }

    let phone = item.customer_phone;
    if (!phone || phone.trim() === '') {
      if (linkedLead?.customer_phone || linkedLead?.contact_number || linkedLead?.phone) {
        phone = linkedLead.customer_phone || linkedLead.contact_number || linkedLead.phone;
      }
    }

    return {
      name: name || 'Valued Client',
      email: email || '',
      phone: phone || '',
      linkedLead
    };
  };

  const handleStatusChange = async (itineraryId: number | string, newStatus: string) => {
    const previous = savedItineraries.find(i => String(i.id) === String(itineraryId))?.status;
    
    // Optimistically update
    setSavedItineraries(prev => prev.map(item => 
      String(item.id) === String(itineraryId) ? { ...item, status: newStatus } : item
    ));

    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/itinerary_update_status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          id: Number(itineraryId),
          status: newStatus
        })
      });
      if (!res.ok) {
        throw new Error('Failed to update status on server');
      }
      toast({
        title: "Status Updated",
        description: `Proposal status changed to "${newStatus}".`
      });
    } catch (err: any) {
      console.error('Error updating status:', err);
      // Revert on error
      if (previous) {
        setSavedItineraries(prev => prev.map(item => 
          String(item.id) === String(itineraryId) ? { ...item, status: previous } : item
        ));
      }
      toast({
        title: "Update Failed",
        description: err?.message || "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Compute Active Filtered Lists
  const activeLeads = leads.filter(l => !l.deleted_at && !l.is_deleted && !l.isDeleted);

  const filteredSavedItineraries = savedItineraries.filter(item => {
    const clientInfo = resolveCustomerInfo(item);
    const q = search.trim().toLowerCase();
    const name = clientInfo.name.toLowerCase();
    const email = clientInfo.email.toLowerCase();
    const dest = (item.destinations || '').toLowerCase();
    const code = (item.itinerary_code || item.package_name || '').toLowerCase();
    const matchesSearch = name.includes(q) || dest.includes(q) || code.includes(q) || email.includes(q);

    if (statusFilter === 'flagged') return matchesSearch && Boolean(item.pricing_flagged == 1);
    if (statusFilter === 'confirmed') return matchesSearch && (item.status === 'Booking Confirmed' || item.status === 'confirmed');
    if (statusFilter === 'sent') return matchesSearch && (item.status === 'Quote Sent' || item.status === 'sent');
    return matchesSearch;
  });

  const filteredLeads = activeLeads.filter(l => {
    const q = search.trim().toLowerCase();
    const name = (l.customer_name || l.customerName || '').toLowerCase();
    const dest = (l.destinations || l.packageName || '').toLowerCase();
    const email = (l.customer_email || l.email || l.customerEmail || '').toLowerCase();
    const phone = (l.customer_phone || l.contact_number || l.customerPhone || l.phone || l.whatsapp_number || '').toLowerCase();
    const matchesSearch = name.includes(q) || dest.includes(q) || email.includes(q) || phone.includes(q);

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
            onClick={() => fetchSavedItineraries(true)} 
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
                  const clientInfo = resolveCustomerInfo(item);
                  const itemStartDate = getValidDateCandidate(
                    item.travel_start_date,
                    clientInfo.linkedLead?.trip_start_date,
                    clientInfo.linkedLead?.tripStartDate,
                    clientInfo.linkedLead?.travel_dates,
                    clientInfo.linkedLead?.travel_date,
                    clientInfo.linkedLead?.travel_month,
                    clientInfo.linkedLead?.travelMonth
                  );
                  const itemEndDate = getValidDateCandidate(
                    item.travel_end_date,
                    clientInfo.linkedLead?.trip_end_date,
                    clientInfo.linkedLead?.tripEndDate
                  );
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
                          {clientInfo.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
                          {clientInfo.email ? clientInfo.email : (clientInfo.phone ? clientInfo.phone : 'No contact registered')}
                        </p>
                      </div>

                      {/* Destination & Dates */}
                      <div className="col-span-3 space-y-1">
                        <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate uppercase">
                          {item.package_name || item.destinations || 'Custom Tour'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {formatTravelDate(itemStartDate, itemEndDate)}
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
                        <div className="relative inline-flex items-center">
                          <select
                            value={item.status || 'Draft'}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border appearance-none pr-6 cursor-pointer outline-none transition-colors ${
                              item.status === 'Booking Confirmed'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                                : item.status === 'Quote Sent'
                                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                                : item.status === 'Saved'
                                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40 hover:bg-blue-500/25'
                                : item.status === 'Cancelled'
                                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 hover:bg-rose-500/25'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700'
                            }`}
                            title="Click to change proposal status"
                          >
                            <option value="Draft" className="bg-slate-900 text-white">Draft</option>
                            <option value="Saved" className="bg-slate-900 text-white">Saved</option>
                            <option value="Quote Sent" className="bg-slate-900 text-white">Quote Sent</option>
                            <option value="Booking Confirmed" className="bg-slate-900 text-white">Booking Confirmed</option>
                            <option value="Cancelled" className="bg-slate-900 text-white">Cancelled</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 pointer-events-none opacity-60 text-current" />
                        </div>

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
                {filteredLeads.map((l) => {
                  const linkedItin = savedItineraries.find(it => String(it.lead_id) === String(l.id));
                  const custName = l.customer_name || l.customerName || linkedItin?.customer_name || 'Unnamed Lead';
                  const custEmail = l.customer_email || l.email || l.customerEmail || linkedItin?.customer_email || '';
                  const custPhone = l.customer_phone || l.contact_number || l.customerPhone || l.phone || l.whatsapp_number || linkedItin?.customer_phone || '';
                  const dateStr = getValidDateCandidate(
                    linkedItin?.travel_start_date,
                    l.trip_start_date,
                    l.tripStartDate,
                    l.travel_dates,
                    l.travel_date,
                    l.travel_month,
                    l.travelMonth
                  );
                  const endDateStr = getValidDateCandidate(
                    linkedItin?.travel_end_date,
                    l.trip_end_date,
                    l.tripEndDate
                  );

                  return (
                    <div key={l.id} className="grid grid-cols-12 gap-3 p-4 items-center hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all text-xs border-b border-border/10">
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0 border border-amber-500/30">
                          {custName.charAt(0) || 'L'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-950 dark:text-white uppercase tracking-wide truncate text-xs">{custName}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">{custEmail || 'No email'} • {custPhone || 'No phone'}</p>
                        </div>
                      </div>

                      <div className="col-span-3 font-extrabold text-slate-900 dark:text-slate-100 uppercase truncate text-xs">
                        {l.destinations || l.packageName || linkedItin?.package_name || 'Custom Package'}
                      </div>

                      <div className="col-span-2 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        {formatTravelDate(dateStr, endDateStr)}
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
                );
              })}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};
