import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Globe, Plus, Search, Edit, Loader2, MapPin,
  DollarSign, ArrowLeft, Save, X, CheckCircle2,
  FileText, Clock, IndianRupee, Percent, Shield,
  Stamp, Briefcase, Plane, CreditCard, BookOpen,
  AlertTriangle, Info, Trash2, LayoutGrid, List
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Country = { id: string; country_name: string };

type Visa = {
  id: string;
  visa_name: string;
  visa_code: string;
  country_id: string | null;
  visa_type: string;
  validity: string | null;
  processing_time: string | null;
  supplier_name: string | null;
  supplier_cost: number;
  selling_cost: number;
  gst_included: boolean;
  gst_percentage: number;
  required_documents: string[];
  notes: string | null;
  active_status: boolean;
  created_at: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const VISA_TYPES = [
  { value: 'Tourist',   icon: Plane,     color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500/15' },
  { value: 'Business',  icon: Briefcase, color: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-500/15' },
  { value: 'E-Visa',    icon: CreditCard,color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15' },
  { value: 'Transit',   icon: Plane,     color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/15' },
  { value: 'Student',   icon: BookOpen,  color: 'text-cyan-600 dark:text-cyan-400',    bg: 'bg-cyan-500/15' },
  { value: 'Work',      icon: Briefcase, color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/15' },
  { value: 'Medical',   icon: Shield,    color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-500/15' },
  { value: 'Schengen',  icon: Globe,     color: 'text-indigo-600 dark:text-indigo-400',  bg: 'bg-indigo-500/15' },
  { value: 'On Arrival',icon: Stamp,     color: 'text-teal-600 dark:text-teal-400',    bg: 'bg-teal-500/15' },
];

const VALIDITY_OPTIONS = [
  '14 Days', '30 Days', '60 Days', '90 Days',
  '6 Months', '1 Year', '5 Years', '10 Years',
  'Single Entry', 'Double Entry', 'Multiple Entry'
];

const PROCESSING_OPTIONS = [
  '24 Hours', '2-3 Working Days', '3-5 Working Days',
  '5-7 Working Days', '7-10 Working Days',
  '2-4 Weeks', '4-6 Weeks', 'On Arrival'
];

const STANDARD_DOCUMENTS = [
  'Passport (Valid 6+ Months)',
  'Passport Size Photo',
  'Bank Statement (Last 3 Months)',
  'ITR / Income Tax Return',
  'Cover Letter',
  'Confirmed Flight Ticket',
  'Hotel Voucher / Accommodation Proof',
  'Travel Insurance',
  'NOC from Employer',
  'Marriage Certificate',
  'Birth Certificate',
  'Invitation Letter',
  'Business Registration (for Business Visa)',
];

const BLANK_FORM = {
  visa_name: '',
  visa_code: '',
  country_id: '',
  visa_type: 'Tourist',
  validity: '',
  processing_time: '',
  supplier_name: '',
  supplier_cost: 0,
  selling_cost: 0,
  gst_included: false,
  gst_percentage: 18,
  required_documents: [] as string[],
  notes: '',
  active_status: true,
};

// ─── Document Checklist ───────────────────────────────────────────────────────

const DocumentChecklist = ({ selected, onChange }: {
  selected: string[];
  onChange: (docs: string[]) => void;
}) => {
  const [customDoc, setCustomDoc] = useState('');
  const toggle = (doc: string) => {
    if (selected.includes(doc)) onChange(selected.filter(d => d !== doc));
    else onChange([...selected, doc]);
  };
  const addCustom = () => {
    const v = customDoc.trim();
    if (v && !selected.includes(v)) onChange([...selected, v]);
    setCustomDoc('');
  };
  const allDocs = [...new Set([...STANDARD_DOCUMENTS, ...selected.filter(d => !STANDARD_DOCUMENTS.includes(d))])];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {allDocs.map(doc => (
          <button
            key={doc}
            type="button"
            onClick={() => toggle(doc)}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
              selected.includes(doc)
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold'
                : 'bg-background border-border/80 text-slate-700 dark:text-slate-300 hover:border-amber-500/50'
            }`}
          >
            {selected.includes(doc)
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              : <div className="w-3.5 h-3.5 rounded-full border border-slate-400 shrink-0" />}
            {doc}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <Input
          value={customDoc}
          onChange={e => setCustomDoc(e.target.value)}
          placeholder="Add custom required document…"
          className="h-9 text-xs"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
        />
        <Button type="button" size="sm" variant="outline" onClick={addCustom} className="h-9 px-3 text-xs shrink-0 font-bold">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Doc
        </Button>
      </div>
    </div>
  );
};

// ─── Cost Summary ─────────────────────────────────────────────────────────────

const CostSummary = ({ form }: { form: typeof BLANK_FORM }) => {
  const sc = Number(form.supplier_cost) || 0;
  const sell = Number(form.selling_cost) || 0;
  const gstPct = Number(form.gst_percentage) || 0;
  let gstAmt = 0, netSelling = sell;
  if (form.gst_included) { netSelling = sell / (1 + gstPct / 100); gstAmt = sell - netSelling; }
  else { gstAmt = sell * (gstPct / 100); }
  const profit = netSelling - sc;
  const margin = sc > 0 ? ((profit / sc) * 100) : 0;
  return (
    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-border/50 bg-gradient-to-br from-slate-50/50 to-amber-50/30 dark:from-slate-900/50 dark:to-amber-500/10">
      <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <IndianRupee className="w-3.5 h-3.5 text-amber-500" /> Cost Breakdown
      </div>
      {[
        { label: 'Supplier Cost', value: sc, color: 'text-foreground' },
        { label: `GST (${gstPct}%)`, value: gstAmt, color: 'text-amber-500' },
        { label: 'Selling Price', value: sell, color: 'text-emerald-600 dark:text-emerald-400 font-extrabold' },
        { label: 'Profit Margin', value: profit, color: profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500' },
      ].map(r => (
        <div key={r.label} className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground font-medium">{r.label}</span>
          <span className={`font-bold ${r.color}`}>₹{r.value.toFixed(2)}</span>
        </div>
      ))}
      <div className="col-span-2 flex justify-between items-center text-xs border-t border-border/30 pt-2 mt-1">
        <span className="text-muted-foreground font-medium flex items-center gap-1"><Percent className="w-3 h-3" /> Profit Margin %</span>
        <span className={`font-extrabold text-sm ${margin >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{margin.toFixed(1)}%</span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VisaMaster() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visas, setVisas] = useState<Visa[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  
  // View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Filters
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);

  const isFormView = location.pathname === '/crm/visas/new' || location.pathname.startsWith('/crm/visas/edit/');
  const isEdit = location.pathname.startsWith('/crm/visas/edit/');
  const editId = isEdit ? location.pathname.replace('/crm/visas/edit/', '') : null;

  useEffect(() => { loadCountries(); loadVisas(); }, []);

  useEffect(() => {
    if (isEdit && editId && visas.length > 0) {
      const item = visas.find(v => v.id === editId);
      if (item) {
        setForm({
          visa_name: item.visa_name || '',
          visa_code: item.visa_code || '',
          country_id: item.country_id ? String(item.country_id) : '',
          visa_type: item.visa_type || 'Tourist',
          validity: item.validity || '',
          processing_time: item.processing_time || '',
          supplier_name: item.supplier_name || '',
          supplier_cost: Number(item.supplier_cost) || 0,
          selling_cost: Number(item.selling_cost) || 0,
          gst_included: !!item.gst_included,
          gst_percentage: Number(item.gst_percentage) || 18,
          required_documents: Array.isArray(item.required_documents) ? item.required_documents : [],
          notes: item.notes || '',
          active_status: !!item.active_status,
        });
        setEditingId(item.id);
      }
    } else if (!isEdit && !isFormView) {
      setForm({ ...BLANK_FORM });
      setEditingId(null);
    }
  }, [isEdit, editId, visas, isFormView]);

  const loadCountries = async () => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=countries&active_status=1`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setCountries(data || []);
      }
    } catch (e) {
      console.error('Error loading countries:', e);
    }
  };

  const loadVisas = async () => {
    setLoading(true);
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=visas`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to load visas');
      const data = await res.json();
      setVisas(data || []);
    } catch (err: any) {
      toast({ title: 'Error loading visas', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the visa product "${name}"?`)) return;
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=visas&id=${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete visa');
      }
      toast({ title: 'Visa Deleted', description: `Successfully deleted "${name}".` });
      setVisas(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.visa_name.trim() || !form.visa_code.trim()) {
      toast({ title: 'Required', description: 'Visa name and code are required.', variant: 'destructive' }); return;
    }
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        country_id: form.country_id || null,
        supplier_name: form.supplier_name || null,
        validity: form.validity || null,
        processing_time: form.processing_time || null,
        notes: form.notes || null,
        updated_at: new Date().toISOString(),
      };
      const authHeaders = await getAuthHeader();
      if (editingId) {
        const res = await fetch(`${API_BASE}/api.php?table=visas&id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update visa');
        toast({ title: '✅ Visa Updated', description: `${form.visa_name} updated successfully.` });
      } else {
        const res = await fetch(`${API_BASE}/api.php?table=visas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ ...payload, created_at: new Date().toISOString() })
        });
        if (!res.ok) throw new Error('Failed to add visa');
        toast({ title: '✅ Visa Added', description: `${form.visa_name} added successfully.` });
      }
      await loadVisas();
      navigate('/crm/visas');
    } catch (err: any) {
      toast({ title: 'Save Error', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleToggleStatus = async (id: string, current: boolean) => {
    try {
      const item = visas.find(v => v.id === id);
      if (!item) return;
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=visas&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ ...item, active_status: !current })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast({ title: !current ? '✅ Activated' : '⏸ Deactivated', description: 'Visa status updated.' });
      await loadVisas();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAutoCode = () => {
    if (!form.visa_name) return;
    const words = form.visa_name.trim().split(/\s+/);
    const code = words.map(w => w.slice(0, 3).toUpperCase()).join('-') + '-VSA-' + Date.now().toString().slice(-4);
    setForm(f => ({ ...f, visa_code: code }));
  };

  const filtered = visas.filter(v => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = (v.visa_name || '').toLowerCase().includes(q);
      const matchCode = (v.visa_code || '').toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    if (filterCountry !== 'all' && String(v.country_id) !== String(filterCountry)) return false;
    if (filterType !== 'all' && v.visa_type !== filterType) return false;
    if (filterStatus === 'active' && !v.active_status) return false;
    if (filterStatus === 'inactive' && v.active_status) return false;
    return true;
  });

  const getCountryName = (id: string | null) => id ? (countries.find(c => String(c.id) === String(id))?.country_name || '—') : '—';
  const getVisaTypeMeta = (type: string) => VISA_TYPES.find(t => t.value === type) || VISA_TYPES[0];

  // ── Form View ──────────────────────────────────────────────────────────────
  if (isFormView) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto text-slate-900 dark:text-slate-100 text-left">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/crm/visas')} className="h-9 w-9 rounded-xl border border-border/50">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">{editingId ? 'Edit Visa Product' : 'Add New Visa Product'}</h2>
            <p className="text-xs text-muted-foreground">Fill in visa details, required documents, and pricing.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-500" /> Basic Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">Visa Name *</Label>
                    <Input value={form.visa_name} onChange={e => setForm(f => ({ ...f, visa_name: e.target.value }))} placeholder="e.g. Dubai 30 Days Tourist Visa" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Visa Code *</Label>
                    <div className="flex gap-2">
                      <Input value={form.visa_code} onChange={e => setForm(f => ({ ...f, visa_code: e.target.value.toUpperCase() }))} placeholder="e.g. DUB-30D-VSA" className="h-9 font-mono" />
                      <Button type="button" size="sm" variant="outline" onClick={handleAutoCode} className="h-9 px-3 text-xs shrink-0 font-bold">Auto</Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Country *</Label>
                    <Select value={form.country_id} onValueChange={v => setForm(f => ({ ...f, country_id: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {countries.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.country_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Visa Type *</Label>
                    <Select value={form.visa_type} onValueChange={v => setForm(f => ({ ...f, visa_type: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Visa Type" /></SelectTrigger>
                      <SelectContent>
                        {VISA_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Validity Period</Label>
                    <Select value={form.validity} onValueChange={v => setForm(f => ({ ...f, validity: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select validity" /></SelectTrigger>
                      <SelectContent>
                        {VALIDITY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">Processing Time</Label>
                    <Select value={form.processing_time} onValueChange={v => setForm(f => ({ ...f, processing_time: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select processing time" /></SelectTrigger>
                      <SelectContent>
                        {PROCESSING_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" /> Document Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <DocumentChecklist selected={form.required_documents} onChange={docs => setForm(f => ({ ...f, required_documents: docs }))} />
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-semibold">Visa Advisor Notes / Instructions</Label>
                    <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Important Embassy notes, photo specifications, or mandatory requirements..." />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-amber-500" /> Rates & Supplier
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Supplier Name</Label>
                    <Input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} placeholder="e.g. VFS Global / Rayna Visa" className="h-9" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Supplier Cost (₹)</Label>
                      <Input type="number" value={form.supplier_cost} onChange={e => setForm(f => ({ ...f, supplier_cost: Number(e.target.value) }))} className="h-9 font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Selling Cost (₹)</Label>
                      <Input type="number" value={form.selling_cost} onChange={e => setForm(f => ({ ...f, selling_cost: Number(e.target.value) }))} className="h-9 font-extrabold text-emerald-600" />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold cursor-pointer" htmlFor="gst-inc">GST Included</Label>
                      <Switch id="gst-inc" checked={form.gst_included} onCheckedChange={chk => setForm(f => ({ ...f, gst_included: chk }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">GST Percentage (%)</Label>
                      <Input type="number" value={form.gst_percentage} onChange={e => setForm(f => ({ ...f, gst_percentage: Number(e.target.value) }))} className="h-9 font-bold" />
                    </div>
                  </div>

                  <CostSummary form={form} />

                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <Label className="text-xs font-semibold cursor-pointer" htmlFor="act-stat">Active Status</Label>
                    <Switch id="act-stat" checked={form.active_status} onCheckedChange={chk => setForm(f => ({ ...f, active_status: chk }))} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={saving} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold h-10 rounded-xl shadow-xs">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingId ? 'Update Visa' : 'Save Visa'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/crm/visas')} className="w-full h-10 rounded-xl font-bold">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ── List View ──────────────────────────────────────────────────────────────
  const activeCount = visas.filter(v => v.active_status).length;
  const avgSellingCost = visas.length > 0
    ? (visas.reduce((sum, v) => sum + Number(v.selling_cost || 0), 0) / visas.length).toFixed(0)
    : '0';

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 text-left">
      
      {/* KPI STATS CARDS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total Visa Products</p>
              <div className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{visas.length}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Catalog visa offerings</p>
            </div>
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30">
              <Globe className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Active Visas</p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCount}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Ready for proposals</p>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Covered Countries</p>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {[...new Set(visas.map(v => v.country_id).filter(Boolean))].length}
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mt-0.5">Global destinations</p>
            </div>
            <div className="p-3 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/30">
              <MapPin className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Avg Selling Cost</p>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">₹{Number(avgSellingCost).toLocaleString()}</div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold mt-0.5">Catalog average fee</p>
            </div>
            <div className="p-3 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/30">
              <IndianRupee className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH BAR & FILTER TOOLBAR */}
      <Card className="border-border/60 shadow-md bg-card">
        <CardHeader className="p-4 border-b border-border/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" /> Visa Master Catalog
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Manage embassy visa products, document requirements, supplier pricing, and processing times.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border/80 rounded-xl p-0.5 bg-background">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950' : ''}`}
                >
                  <LayoutGrid className="w-4 h-4 mr-1" /> Grid
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('table')}
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold ${viewMode === 'table' ? 'bg-amber-500 text-slate-950' : ''}`}
                >
                  <List className="w-4 h-4 mr-1" /> Table
                </Button>
              </div>

              <Button onClick={() => navigate('/crm/visas/new')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold h-9 px-4 rounded-xl text-xs shrink-0 shadow-xs">
                <Plus className="w-4 h-4 mr-1.5" /> Add Visa
              </Button>
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search visa name, code, or country..."
                className="pl-9 h-9 text-xs rounded-xl bg-background text-slate-950 dark:text-white font-medium placeholder:text-slate-400 border-border/80"
              />
            </div>

            {/* Country Filter */}
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries ({countries.length})</SelectItem>
                {countries.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.country_name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Visa Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="Visa Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visa Types</SelectItem>
                {VISA_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.value}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16 w-full">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-extrabold mt-2">Loading visas catalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 w-full border border-dashed border-border/60 rounded-2xl m-6 max-w-[calc(100%-3rem)]">
              <Globe className="w-10 h-10 text-amber-500/40 mx-auto mb-3" />
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">No visa products found</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search or country filter criteria.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
              {filtered.map(v => {
                const meta = getVisaTypeMeta(v.visa_type);
                const TypeIcon = meta.icon;
                return (
                  <Card key={v.id} className="border-border/60 bg-card hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between text-left">
                    <div>
                      <CardHeader className="bg-slate-100 dark:bg-slate-900/80 p-4 border-b border-border/40">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase">{v.visa_code}</span>
                            <CardTitle className="text-sm font-extrabold text-slate-950 dark:text-white uppercase leading-tight mt-0.5">{v.visa_name}</CardTitle>
                          </div>
                          <Badge variant="outline" className={`text-[10px] font-black uppercase px-2 py-0.5 border ${meta.bg} ${meta.color}`}>
                            <TypeIcon className="w-3 h-3 mr-1" /> {v.visa_type}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" /> Country: <strong className="text-slate-950 dark:text-white">{getCountryName(v.country_id)}</strong>
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-4 space-y-2.5 text-xs font-semibold">
                        <div className="flex justify-between items-center py-1 border-b border-border/30">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Validity Period:</span>
                          <span className="text-slate-950 dark:text-white font-extrabold">{v.validity || '---'}</span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-border/30">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Processing Time:</span>
                          <span className="text-slate-950 dark:text-white font-extrabold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" /> {v.processing_time || '---'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-border/30">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Required Documents:</span>
                          <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 font-black text-[10px]">
                            {v.required_documents?.length || 0} Docs Needed
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Selling Price:</span>
                          <div className="text-right">
                            <p className="font-black text-sm text-slate-950 dark:text-white">₹{Number(v.selling_cost).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">GST {v.gst_percentage}% ({v.gst_included ? 'Inc' : 'Exc'})</p>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-3 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
                      <button onClick={() => handleToggleStatus(v.id, v.active_status)} className="transition-transform hover:scale-105">
                        <Badge className={v.active_status ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-400 font-extrabold'} variant="outline">
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${v.active_status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {v.active_status ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>

                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400" onClick={() => navigate(`/crm/visas/edit/${v.id}`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400" onClick={() => handleDelete(v.id, v.visa_name)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            // High Density Directory Table View
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-100 dark:bg-slate-900/80 border-b border-border/50">
                  <TableRow>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">Code & Name</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">Country</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">Visa Type</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">Validity</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">Processing Time</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-right">Selling Price</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-center">Docs</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(v => {
                    const meta = getVisaTypeMeta(v.visa_type);
                    const TypeIcon = meta.icon;
                    return (
                      <TableRow key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-border/10">
                        <TableCell className="py-3 px-4 text-left">
                          <p className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">{v.visa_code}</p>
                          <p className="font-extrabold text-xs text-slate-950 dark:text-white uppercase tracking-wide">{v.visa_name}</p>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-left font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase">
                          {getCountryName(v.country_id)}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-left">
                          <Badge variant="outline" className={`text-[10px] font-extrabold uppercase px-2 py-0.5 border ${meta.bg} ${meta.color}`}>
                            <TypeIcon className="w-3 h-3 mr-1" /> {v.visa_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-left font-bold text-xs text-slate-900 dark:text-slate-100">
                          {v.validity || '---'}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {v.processing_time || '---'}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          <p className="font-black text-xs text-slate-950 dark:text-white">₹{Number(v.selling_cost).toLocaleString()}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">GST {v.gst_percentage}%</p>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-black border border-blue-500/30">
                            {v.required_documents?.length || 0} Docs
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <button onClick={() => handleToggleStatus(v.id, v.active_status)}>
                            <Badge className={v.active_status ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-400 font-extrabold'} variant="outline">
                              {v.active_status ? 'Active' : 'Inactive'}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400" onClick={() => navigate(`/crm/visas/edit/${v.id}`)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400" onClick={() => handleDelete(v.id, v.visa_name)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Showing <strong>{filtered.length}</strong> of <strong>{visas.length}</strong> visa offerings</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
