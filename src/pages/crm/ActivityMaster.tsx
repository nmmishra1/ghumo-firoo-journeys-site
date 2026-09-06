import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SIGHTSEEING_SPOTS } from '@/data/sightseeingData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Activity, Plus, Search, Edit, Power, Info,
  CheckCircle2, AlertTriangle, Loader2, MapPin, Globe,
  DollarSign, ArrowLeft, Save, Tag, X, ChevronRight,
  Mountain, Waves, Landmark, TreePine, Eye, Ship,
  Music, ShoppingBag, BookOpen, Star, Sparkles, IndianRupee,
  TrendingUp, Users, Percent, Trash2, UploadCloud, LayoutGrid, List
} from 'lucide-react';

import { resolveGeography, INDIAN_STATES, INTERNATIONAL_STATE_COUNTRY_MAP, CITY_TO_STATE_COUNTRY_MAP } from '@/data/geographyMaster';

// ─── Types ────────────────────────────────────────────────────────────────────

type Country = { id: string | number; country_name: string };
type State   = { id: string | number; state_name: string; country_id: string | number };
type City    = { id: string | number; city_name: string; state_id: string | number };

type Activity = {
  id: string;
  activity_name: string;
  activity_code: string;
  country_id: string | null;
  state_id: string | null;
  city_id: string | null;
  destination: string | null;
  activity_category: string;
  sub_category: string | null;
  duration: string | null;
  activity_type: string | null;
  supplier_name: string | null;
  supplier_cost: number;
  selling_cost: number;
  adult_cost: number;
  child_cost: number;
  image_url: string | null;
  gst_included: boolean;
  gst_percentage: number;
  description: string | null;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  cancellation_policy: string | null;
  active_status: boolean;
  created_at: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVITY_CATEGORIES = [
  { value: 'Adventure',         icon: Mountain,   color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-500/15' },
  { value: 'Water Sports',      icon: Waves,      color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500/15' },
  { value: 'Theme Park',        icon: Star,       color: 'text-purple-600 dark:text-purple-400',  bg: 'bg-purple-500/15' },
  { value: 'Nature',            icon: TreePine,   color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-500/15' },
  { value: 'Wildlife',          icon: Eye,        color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/15' },
  { value: 'Cruise',            icon: Ship,       color: 'text-cyan-600 dark:text-cyan-400',    bg: 'bg-cyan-500/15' },
  { value: 'Entertainment',     icon: Music,      color: 'text-pink-600 dark:text-pink-400',    bg: 'bg-pink-500/15' },
  { value: 'Shopping',          icon: ShoppingBag,color: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-500/15' },
  { value: 'Cultural',          icon: BookOpen,   color: 'text-yellow-600 dark:text-yellow-400',  bg: 'bg-yellow-500/15' },
  { value: 'Religious',         icon: Landmark,   color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-500/15' },
  { value: 'Luxury Experience', icon: Sparkles,   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15' },
];

const ACTIVITY_TYPES = [
  'Guided Tour', 'Self-Guided', 'Group Activity', 'Private Activity', 'Shared Activity'
];

const BLANK_FORM = {
  activity_name: '',
  activity_code: '',
  country_id: '',
  state_id: '',
  city_id: '',
  destination: '',
  activity_category: 'Adventure',
  sub_category: '',
  duration: '',
  activity_type: 'Group Activity',
  supplier_name: '',
  supplier_cost: 0,
  selling_cost: 0,
  adult_cost: 0,
  child_cost: 0,
  image_url: '',
  gst_included: false,
  gst_percentage: 18,
  description: '',
  highlights: [] as string[],
  inclusions: [] as string[],
  exclusions: [] as string[],
  cancellation_policy: '',
  active_status: true,
};

// ─── Tag Input component ───────────────────────────────────────────────────────

const TagInput = ({ label, items, onChange, placeholder, colorClass = 'bg-amber-500/10 text-amber-600 border-amber-500/20' }: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  colorClass?: string;
}) => {
  const [inputVal, setInputVal] = useState('');
  const add = () => {
    const v = inputVal.trim();
    if (v && !items.includes(v)) { onChange([...items, v]); }
    setInputVal('');
  };
  const remove = (item: string) => onChange(items.filter(i => i !== item));
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="h-9 text-sm"
        />
        <Button type="button" size="sm" onClick={add} className="h-9 px-3.5 shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl border-none shadow-sm flex items-center justify-center">
          <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {items.map(item => (
            <span key={item} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
              {item}
              <button type="button" onClick={() => remove(item)} className="ml-0.5 hover:opacity-70 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── GST helper ───────────────────────────────────────────────────────────────

const suggestGst = (countryName: string | undefined): number => {
  if (!countryName) return 18;
  const c = countryName.toLowerCase();
  if (c.includes('india')) return 18;
  if (c.includes('uae') || c.includes('dubai') || c.includes('emirates')) return 5;
  if (c.includes('singapore')) return 9;
  if (c.includes('thailand')) return 7;
  if (c.includes('malaysia')) return 6;
  return 18;
};

// ─── Cost Summary ─────────────────────────────────────────────────────────────

const CostSummary = ({ form }: { form: typeof BLANK_FORM }) => {
  const { supplier_cost, selling_cost, gst_included, gst_percentage } = form;
  const sc = Number(supplier_cost) || 0;
  const sell = Number(selling_cost) || 0;
  const gstPct = Number(gst_percentage) || 0;
  let gstAmt = 0, netSelling = sell;
  if (gst_included) {
    netSelling = sell / (1 + gstPct / 100);
    gstAmt = sell - netSelling;
  } else {
    gstAmt = sell * (gstPct / 100);
  }
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
        { label: 'Profit', value: profit, color: profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500' },
      ].map(r => (
        <div key={r.label} className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground font-medium">{r.label}</span>
          <span className={`font-bold ${r.color}`}>₹{r.value.toFixed(2)}</span>
        </div>
      ))}
      <div className="col-span-2 flex justify-between items-center text-xs border-t border-border/30 pt-2 mt-1">
        <span className="text-muted-foreground font-medium flex items-center gap-1"><Percent className="w-3 h-3" /> Margin</span>
        <span className={`font-extrabold text-sm ${margin >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{margin.toFixed(1)}%</span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export default function ActivityMaster() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);

  // View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rateFilterMode, setRateFilterMode] = useState<'all' | 'with_rates' | 'info_only'>('all');

  // Form
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Determine view from URL
  const isFormView = location.pathname.includes('/new') || location.pathname.includes('/edit');
  const isEdit = location.pathname.includes('/edit');
  const editId = isEdit ? (location.pathname.split('/edit/')[1] || location.pathname.split('/edit')[1] || null) : null;

  useEffect(() => { loadBaseline(); loadActivities(); }, []);

  useEffect(() => {
    if (isEdit && editId && activities.length > 0) {
      const item = activities.find(a => 
        String(a.id) === String(editId) || 
        (a.activity_code && a.activity_code.toLowerCase() === String(editId).toLowerCase())
      );
      if (item) {
        setForm({
          activity_name: item.activity_name,
          activity_code: item.activity_code,
          country_id: item.country_id ? String(item.country_id) : '',
          state_id: item.state_id ? String(item.state_id) : '',
          city_id: (item as any).city_id ? String((item as any).city_id) : '',
          destination: item.destination || '',
          activity_category: item.activity_category,
          sub_category: item.sub_category || '',
          duration: item.duration || '',
          activity_type: item.activity_type || 'Group Activity',
          supplier_name: item.supplier_name || '',
          supplier_cost: Number(item.supplier_cost) || 0,
          selling_cost: Number(item.selling_cost) || 0,
          adult_cost: Number((item as any).adult_cost) || 0,
          child_cost: Number((item as any).child_cost) || 0,
          image_url: (item as any).image_url || '',
          gst_included: item.gst_included,
          gst_percentage: Number(item.gst_percentage) || 18,
          description: item.description || '',
          highlights: item.highlights || [],
          inclusions: item.inclusions || [],
          exclusions: item.exclusions || [],
          cancellation_policy: item.cancellation_policy || '',
          active_status: item.active_status,
        });
        setEditingId(item.id);
      }
    } else if (!isEdit && !isFormView) {
      setForm({ ...BLANK_FORM });
      setEditingId(null);
    }
  }, [isEdit, editId, activities, isFormView]);

  useEffect(() => {
    if (form.country_id) {
      setFilteredStates(states.filter(s => String(s.country_id) === String(form.country_id)));
    } else {
      setFilteredStates([]);
    }
  }, [form.country_id, states]);

  useEffect(() => {
    if (form.state_id) {
      setFilteredCities(cities.filter(c => String(c.state_id) === String(form.state_id)));
    } else {
      setFilteredCities([]);
    }
  }, [form.state_id, cities]);

  const loadBaseline = async () => {
    try {
      const authHeaders = await getAuthHeader();
      const [cRes, sRes, ciRes] = await Promise.all([
        fetch(`${API_BASE}/api.php?table=countries&active_status=1`, { headers: authHeaders }),
        fetch(`${API_BASE}/api.php?table=states&active_status=1`, { headers: authHeaders }),
        fetch(`${API_BASE}/api.php?table=cities&active_status=1`, { headers: authHeaders })
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        setCountries(cData || []);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setStates(sData || []);
      }
      if (ciRes.ok) {
        const ciData = await ciRes.json();
        setCities(ciData || []);
      }
    } catch (e) {
      console.error('Error loading baseline metadata:', e);
    }
  };

  const loadActivities = async () => {
    setLoading(true);
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/activities.php`, {
        headers: authHeaders
      });
      let list: ActivityItem[] = [];
      if (res.ok) {
        const data = await res.json();
        list = Array.isArray(data) ? data : [];
      }

      // Merge master SIGHTSEEING_SPOTS into activities list
      const masterActivities: ActivityItem[] = SIGHTSEEING_SPOTS.map((spot, idx) => ({
        id: `master-act-${spot.slug}`,
        activity_name: spot.name,
        activity_code: spot.slug.toUpperCase().slice(0, 12),
        destination: spot.destination,
        country_id: null,
        state_id: null,
        city_id: null,
        activity_category: spot.category,
        duration: spot.duration,
        activity_type: 'Direct Activity',
        supplier_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 500,
        selling_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 800,
        adult_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 800,
        child_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 500,
        description: spot.description,
        highlights: spot.highlights,
        inclusions: ['Activity Access Ticket', 'Equipment / Instructor Support'],
        exclusions: ['Personal Expenses & Tips'],
        gst_included: true,
        gst_percentage: 5,
        active_status: true,
        created_at: new Date().toISOString()
      }));

      const existingNames = new Set(list.map(a => (a.activity_name || '').toLowerCase()));
      for (const ma of masterActivities) {
        if (!existingNames.has(ma.activity_name.toLowerCase())) {
          list.push(ma);
        }
      }

      setActivities(list);
    } catch (err: any) {
      console.warn('API load activities warning, falling back to master spots:', err);
      const masterActivities: ActivityItem[] = SIGHTSEEING_SPOTS.map((spot, idx) => ({
        id: `master-act-${spot.slug}`,
        activity_name: spot.name,
        activity_code: spot.slug.toUpperCase().slice(0, 12),
        destination: spot.destination,
        country_id: null,
        state_id: null,
        city_id: null,
        activity_category: spot.category,
        duration: spot.duration,
        activity_type: 'Direct Activity',
        supplier_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 500,
        selling_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 800,
        adult_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 800,
        child_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 500,
        description: spot.description,
        highlights: spot.highlights,
        inclusions: ['Activity Access Ticket', 'Equipment / Instructor Support'],
        exclusions: ['Personal Expenses & Tips'],
        gst_included: true,
        gst_percentage: 5,
        active_status: true,
        created_at: new Date().toISOString()
      }));
      setActivities(masterActivities);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the activity "${name}"?`)) return;
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/activities.php?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete activity');
      }
      toast({
        title: 'Activity Deleted',
        description: `Successfully deleted activity "${name}".`
      });
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = form.activity_name.trim();
    let finalCode = form.activity_code.trim();
    let finalDest = (form.destination || '').trim();

    if (!finalName) {
      toast({ title: 'Required', description: 'Activity name is required.', variant: 'destructive' });
      return;
    }

    if (!finalCode) {
      finalCode = finalName.split(/\s+/).map(w => w.slice(0, 3).toUpperCase()).join('-') + '-' + Math.floor(1000 + Math.random() * 9000);
    }

    if (!finalDest) {
      const selectedCity = cities.find(c => String(c.id) === String(form.city_id));
      const selectedState = states.find(s => String(s.id) === String(form.state_id));
      if (selectedCity) finalDest = selectedCity.city_name || selectedCity.name || '';
      else if (selectedState) finalDest = selectedState.state_name || '';
      else finalDest = 'General Activity';
    }

    setSaving(true);
    try {
      const payload: any = {
        ...form,
        activity_name: finalName,
        activity_code: finalCode,
        destination: finalDest,
        country_id: form.country_id || null,
        state_id: form.state_id || null,
        city_id: form.city_id || null,
        supplier_name: form.supplier_name || null,
        description: form.description || null,
        cancellation_policy: form.cancellation_policy || null,
        updated_at: new Date().toISOString(),
      };

      const authHeaders = await getAuthHeader();
      if (editingId) {
        const res = await fetch(`${API_BASE}/activities.php?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update activity');
        toast({ 
          title: '✅ Database Updated', 
          description: data.message || `Activity "${form.activity_name}" updated successfully in database.` 
        });
      } else {
        const res = await fetch(`${API_BASE}/activities.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ ...payload, created_at: new Date().toISOString() })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add activity');
        toast({ 
          title: '✅ Database Saved', 
          description: data.message || `Activity "${form.activity_name}" created successfully in database.` 
        });
      }
      await loadActivities();
      navigate('/crm/activities');
    } catch (err: any) {
      toast({ title: 'Save Error', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleToggleStatus = async (id: string, current: boolean) => {
    try {
      const act = activities.find(a => a.id === id);
      if (!act) return;

      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/activities.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ ...act, active_status: !current })
      });
      if (!res.ok) throw new Error('Failed to update status');

      toast({ title: !current ? '✅ Activated' : '⏸ Deactivated', description: 'Status updated.' });
      await loadActivities();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAutoCode = () => {
    if (!form.activity_name) return;
    const words = form.activity_name.trim().split(/\s+/);
    const code = words.map(w => w.slice(0, 3).toUpperCase()).join('-') + '-' + Date.now().toString().slice(-4);
    setForm(f => ({ ...f, activity_code: code }));
  };

  // Cascading lists for location filters
  const sortedCountries = [...countries].sort((a, b) => {
    if (a.country_name?.toLowerCase().includes('india')) return -1;
    if (b.country_name?.toLowerCase().includes('india')) return 1;
    return (a.country_name || '').localeCompare(b.country_name || '');
  });

  const selectedCountryObj = countries.find(c => String(c.id) === String(filterCountry));
  const isIndiaFilter = filterCountry !== 'all' && selectedCountryObj && selectedCountryObj.country_name.toLowerCase().includes('india');

  const listStatesForFilter = (filterCountry === 'all'
    ? states
    : isIndiaFilter
      ? states.filter(s => {
          const sName = s.state_name || (s as any).name || '';
          return INDIAN_STATES.some(is => is.toLowerCase() === sName.toLowerCase()) || String(s.country_id) === String(filterCountry);
        })
      : states.filter(s => String(s.country_id) === String(filterCountry))
  ).sort((a, b) => (a.state_name || '').localeCompare(b.state_name || ''));

  const listCitiesForFilter = (filterState === 'all'
    ? (filterCountry === 'all' ? cities : cities.filter(c => {
        const geo = resolveGeography(c.city_name || (c as any).name, (c as any).state, (c as any).country);
        if (selectedCountryObj) {
          return geo.country.toLowerCase() === selectedCountryObj.country_name.toLowerCase();
        }
        return true;
      }))
    : cities.filter(c => {
        const selectedStateObj = states.find(s => String(s.id) === String(filterState));
        const stateName = selectedStateObj?.state_name || '';
        const geo = resolveGeography(c.city_name || (c as any).name, (c as any).state, (c as any).country);
        return String(c.state_id) === String(filterState) || geo.state.toLowerCase() === stateName.toLowerCase();
      })
  ).sort((a, b) => (a.city_name || (a as any).name || '').localeCompare(b.city_name || (b as any).name || ''));

  const getCountryName = (id: string | null) => id ? (countries.find(c => String(c.id) === String(id))?.country_name || '—') : '—';
  const getStateName = (id: string | null) => id ? (states.find(s => String(s.id) === String(id))?.state_name || '—') : '—';
  const getCityName = (id: string | null) => id ? (cities.find(c => String(c.id) === String(id))?.city_name || '—') : '—';
  const getCategoryMeta = (cat: string) => ACTIVITY_CATEGORIES.find(c => c.value === cat) || ACTIVITY_CATEGORIES[0];

  const filtered = activities.filter(a => {
    const hasRates = Number(a.supplier_cost) > 0 || Number(a.selling_cost) > 0 || Number((a as any).adult_cost) > 0;
    if (rateFilterMode === 'with_rates' && !hasRates) return false;
    if (rateFilterMode === 'info_only' && hasRates) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchName = a.activity_name.toLowerCase().includes(q);
      const matchCode = (a.activity_code || '').toLowerCase().includes(q);
      const matchDest = (a.destination || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDest) return false;
    }
    if (filterCategory !== 'all' && a.activity_category !== filterCategory) return false;

    const rawCountry = getCountryName(a.country_id);
    const rawState = getStateName(a.state_id);
    const rawCity = a.destination || '';
    const geo = resolveGeography(rawCity, rawState, rawCountry);

    if (filterCountry !== 'all') {
      const selCountryName = selectedCountryObj?.country_name || '';
      if (selCountryName && geo.country.toLowerCase() !== selCountryName.toLowerCase() && String(a.country_id) !== String(filterCountry)) {
        return false;
      }
    }

    if (filterState !== 'all') {
      const selectedStateObj = states.find(st => String(st.id) === String(filterState));
      const selStateName = selectedStateObj?.state_name || '';
      if (selStateName && geo.state.toLowerCase() !== selStateName.toLowerCase() && String(a.state_id) !== String(filterState)) {
        return false;
      }
    }

    if (filterCity !== 'all') {
      const selectedCityObj = cities.find(c => String(c.id) === String(filterCity));
      const selCityName = selectedCityObj?.city_name || (selectedCityObj as any)?.name || '';
      const cityMatchesId = String((a as any).city_id) === String(filterCity);
      const cityMatchesName = selCityName && geo.city.toLowerCase() === selCityName.toLowerCase();
      if (!cityMatchesId && !cityMatchesName) return false;
    }

    if (filterStatus === 'active' && !a.active_status) return false;
    if (filterStatus === 'inactive' && a.active_status) return false;
    return true;
  });

  // ── Form View ──────────────────────────────────────────────────────────────
  if (isFormView) {
    const isCountryLoaded = !form.country_id || countries.some(c => String(c.id) === String(form.country_id));
    const isStateLoaded = !form.state_id || filteredStates.some(s => String(s.id) === String(form.state_id));
    const selectedCountryName = form.country_id ? countries.find(c => String(c.id) === String(form.country_id))?.country_name : undefined;
    return (
      <div className="space-y-6 max-w-5xl mx-auto text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/crm/activities')} className="h-9 w-9 rounded-xl border border-border/50">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">{editingId ? 'Edit Activity' : 'Add New Activity'}</h2>
            <p className="text-xs text-muted-foreground">Fill in all required details below. Fields marked * are mandatory.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column — main info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Basic Info Card */}
              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" /> Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">Activity Name *</Label>
                    <div className="flex gap-2">
                      <Input value={form.activity_name} onChange={e => setForm(f => ({ ...f, activity_name: e.target.value }))} placeholder="e.g. Burj Khalifa Observation Deck" className="h-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Activity Code *</Label>
                    <div className="flex gap-2">
                      <Input value={form.activity_code} onChange={e => setForm(f => ({ ...f, activity_code: e.target.value.toUpperCase() }))} placeholder="e.g. BUR-KHA-2024" className="h-9 font-mono" />
                      <Button type="button" size="sm" variant="outline" onClick={handleAutoCode} className="h-9 px-3 text-xs shrink-0">Auto</Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Duration</Label>
                    <Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 2 Hours, Half Day" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Category *</Label>
                    <Select value={form.activity_category} onValueChange={v => setForm(f => ({ ...f, activity_category: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Activity Type</Label>
                    <Select value={form.activity_type} onValueChange={v => setForm(f => ({ ...f, activity_type: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">Cover Image URL</Label>
                    <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://images.unsplash.com/photo-..." className="h-9" />
                  </div>
                </CardContent>
              </Card>

              {/* Location Card */}
              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" /> Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Country</Label>
                    <Select
                      value={form.country_id}
                      onValueChange={v => {
                        const gst = suggestGst(countries.find(c => String(c.id) === v)?.country_name);
                        setForm(f => ({ ...f, country_id: v, state_id: '', city_id: '', gst_percentage: gst }));
                      }}
                    >
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {countries.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.country_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">State</Label>
                    <Select
                      value={form.state_id}
                      onValueChange={v => setForm(f => ({ ...f, state_id: v, city_id: '' }))}
                      disabled={!form.country_id}
                    >
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {filteredStates.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.state_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">City</Label>
                    <Select
                      value={form.city_id}
                      onValueChange={v => setForm(f => ({ ...f, city_id: v }))}
                      disabled={!form.state_id}
                    >
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>
                        {filteredCities.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.city_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-3 space-y-1.5">
                    <Label className="text-xs font-semibold">Destination / Landmark Label</Label>
                    <Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="e.g. Downtown Dubai" className="h-9" />
                  </div>
                </CardContent>
              </Card>

              {/* Inclusions & Highlights Card */}
              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" /> Highlights & Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <TagInput label="Key Highlights" items={form.highlights} onChange={h => setForm(f => ({ ...f, highlights: h }))} placeholder="e.g. Skip-the-line Ticket" />
                  <TagInput label="Inclusions" items={form.inclusions} onChange={inc => setForm(f => ({ ...f, inclusions: inc }))} placeholder="e.g. Hotel Pickup included" colorClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" />
                  <TagInput label="Exclusions" items={form.exclusions} onChange={exc => setForm(f => ({ ...f, exclusions: exc }))} placeholder="e.g. Gratuities excluded" colorClass="bg-rose-500/10 text-rose-600 border-rose-500/20" />
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-semibold">Description</Label>
                    <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Full experience description..." />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column — pricing & actions */}
            <div className="space-y-5">
              <Card className="border-border/50">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-amber-500" /> Pricing & Supplier
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Supplier Name</Label>
                    <Input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} placeholder="e.g. Rayna Tours" className="h-9" />
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
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Adult Rate (₹)</Label>
                      <Input type="number" value={form.adult_cost} onChange={e => setForm(f => ({ ...f, adult_cost: Number(e.target.value) }))} className="h-9 font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Child Rate (₹)</Label>
                      <Input type="number" value={form.child_cost} onChange={e => setForm(f => ({ ...f, child_cost: Number(e.target.value) }))} className="h-9 font-bold" />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold cursor-pointer" htmlFor="gst-inc">GST Included in Selling Price</Label>
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

              {/* Submit Buttons */}
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={saving} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold h-10 rounded-xl shadow-xs">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingId ? 'Update Activity' : 'Save New Activity'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/crm/activities')} className="w-full h-10 rounded-xl">
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
  const activeCount = activities.filter(a => a.active_status).length;
  const avgAdultCost = activities.length > 0
    ? (activities.reduce((sum, a) => sum + Number((a as any).adult_cost || a.selling_cost || 0), 0) / activities.length).toFixed(0)
    : '0';

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total Activities</p>
              <div className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{activities.length}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Catalog experiences</p>
            </div>
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Active Experiences</p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCount}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Live for itineraries</p>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Avg Adult Selling Rate</p>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">₹{Number(avgAdultCost).toLocaleString()}</div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold mt-0.5">Catalog average</p>
            </div>
            <div className="p-3 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/30">
              <IndianRupee className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Covered Locations</p>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {[...new Set(activities.map(a => a.country_id).filter(Boolean))].length} Countries
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mt-0.5">Global destinations</p>
            </div>
            <div className="p-3 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/30">
              <Globe className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH BAR & CASCADING LOCATION FILTERS */}
      <Card className="border-border/60 shadow-md bg-card">
        <CardHeader className="p-4 border-b border-border/40 space-y-3">
          {/* CATALOG RATE vs INFO TAB STRIP */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setRateFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${rateFilterMode === 'all' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All Activities ({activities.length})
              </button>
              <button
                type="button"
                onClick={() => setRateFilterMode('with_rates')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${rateFilterMode === 'with_rates' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                💰 With Rates ({activities.filter(a => (Number(a.supplier_cost) > 0 || Number(a.selling_cost) > 0 || Number((a as any).adult_cost) > 0)).length})
              </button>
              <button
                type="button"
                onClick={() => setRateFilterMode('info_only')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${rateFilterMode === 'info_only' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ℹ️ Info Only ({activities.filter(a => !(Number(a.supplier_cost) > 0 || Number(a.selling_cost) > 0 || Number((a as any).adult_cost) > 0)).length})
              </button>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-3 py-1 font-bold">
              🎟️ Ticket & Active Experiential Default
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" /> Activity Master Catalog
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Manage sightseeings, adventure tours, ticket rates, and supplier contract costs.
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

              <Button onClick={() => navigate('/crm/bulk-upload')} variant="outline" className="h-9 px-3 rounded-xl text-xs font-extrabold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 shrink-0">
                <UploadCloud className="w-4 h-4 mr-1.5" /> Bulk Upload
              </Button>
              <Button onClick={() => navigate('/crm/activities/new')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold h-9 px-4 rounded-xl text-xs shrink-0 shadow-xs">
                <Plus className="w-4 h-4 mr-1.5" /> Add Activity
              </Button>
            </div>
          </div>

          {/* Cascading Location & Category Filters Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-1">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search activity name, code, destination..."
                className="pl-9 h-9 text-xs rounded-xl bg-background text-slate-950 dark:text-white font-medium placeholder:text-slate-400 border-border/80"
              />
            </div>

            {/* Country Filter */}
            <Select 
              value={filterCountry} 
              onValueChange={v => {
                setFilterCountry(v);
                setFilterState('all');
                setFilterCity('all');
              }}
            >
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries ({countries.length})</SelectItem>
                {countries.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.country_name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* State Filter (Cascaded by Country) */}
            <Select 
              value={filterState} 
              onValueChange={v => {
                setFilterState(v);
                setFilterCity('all');
              }}
            >
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States ({listStatesForFilter.length})</SelectItem>
                {listStatesForFilter.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.state_name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* City Filter (Cascaded by State/Country) */}
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities ({listCitiesForFilter.length})</SelectItem>
                {listCitiesForFilter.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.city_name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {ACTIVITY_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.value}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16 w-full">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-extrabold mt-2">Loading activities catalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 w-full border border-dashed border-border/60 rounded-2xl m-6 max-w-[calc(100%-3rem)]">
              <Activity className="w-10 h-10 text-amber-500/40 mx-auto mb-3" />
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">No activities found matching filters</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting Country, State, or Category filter criteria.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
              {filtered.map(act => {
                const meta = getCategoryMeta(act.activity_category);
                const Icon = meta.icon;
                return (
                  <Card key={act.id} className="overflow-hidden border-border/60 hover:border-amber-500/40 hover:shadow-md transition-all group flex flex-col justify-between bg-card text-left">
                    <div>
                      {/* Activity Photo */}
                      <div className="h-40 relative overflow-hidden bg-slate-900">
                        {act.image_url ? (
                          <img 
                            src={act.image_url} 
                            alt={act.activity_name} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={e => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-500/10" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/40 to-slate-950/85 pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col justify-between h-full w-full p-3.5">
                          <div className="flex justify-between items-start w-full">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${meta.bg} ${meta.color} backdrop-blur-md`}>
                              <Icon className="w-3 h-3" /> {act.activity_category}
                            </span>
                            <span className="bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded font-mono text-[10px] text-amber-400 font-black border border-amber-500/30 uppercase">
                              {act.activity_code}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <h3 className="text-white font-black text-sm leading-tight group-hover:text-amber-400 transition-colors uppercase tracking-wide truncate" title={act.activity_name}>
                              {act.activity_name}
                            </h3>
                            <p className="text-slate-300 text-[10px] flex items-center font-bold uppercase gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              {getCityName((act as any).city_id) !== '—' ? getCityName((act as any).city_id) : (act.destination || 'Global')}
                              {act.state_id && <span className="text-slate-400 font-medium text-[9px] lowercase normal-case"> ({getStateName(act.state_id)})</span>}
                            </p>
                          </div>
                        </div>
                      </div>

                      {(() => {
                        const sc = Number(act.supplier_cost) || 0;
                        const sell = Number((act as any).adult_cost || act.selling_cost) || 0;
                        const childPrice = Number((act as any).child_cost || 0);
                        const gstPct = Number(act.gst_percentage) || 18;
                        const gstInc = act.gst_included;

                        let netSelling = sell;
                        if (gstInc && gstPct > 0) {
                          netSelling = sell / (1 + gstPct / 100);
                        }
                        const profit = netSelling - sc;
                        const marginPct = sell > 0 ? ((profit / sell) * 100) : 0;
                        const hasRates = sc > 0 || sell > 0;

                        let marginBadgeStyle = "bg-rose-500/15 border-rose-500/40 text-rose-400 font-extrabold";
                        let marginDot = "🔴 Low Margin";
                        if (marginPct >= 15) {
                          marginBadgeStyle = "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-extrabold";
                          marginDot = "🟢 High Yield";
                        } else if (marginPct >= 5) {
                          marginBadgeStyle = "bg-amber-500/15 border-amber-500/40 text-amber-400 font-extrabold";
                          marginDot = "🟡 Standard Yield";
                        }

                        return (
                          <CardContent className="p-4 space-y-3 text-xs font-semibold">
                            {/* Duration & Type */}
                            <div className="flex justify-between items-center py-1 border-b border-border/40">
                              <span className="text-slate-500 dark:text-slate-400 font-medium">Duration & Type:</span>
                              <span className="text-slate-950 dark:text-white font-extrabold">{act.duration || 'Flexible'} • {act.activity_type || 'Group'}</span>
                            </div>

                            {/* Conditional Display: Rates Grid vs Info Only */}
                            {hasRates ? (
                              <div className="p-3 bg-slate-100/70 dark:bg-[#121827] border border-border/60 rounded-xl space-y-2">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-600 dark:text-slate-400 font-medium">Supplier B2B Net Cost:</span>
                                  <span className="font-mono text-slate-900 dark:text-slate-200 font-extrabold">₹{sc.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-600 dark:text-slate-400 font-medium">Agent Profit Markup:</span>
                                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                                    +₹{profit.toFixed(0)} ({marginPct.toFixed(1)}%)
                                  </span>
                                </div>

                                <div className="flex justify-between items-center pt-1.5 border-t border-border/50">
                                  <div>
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">Selling Rate (Adult):</p>
                                    {childPrice > 0 && <p className="text-[10px] text-slate-500">Child: ₹{childPrice.toLocaleString('en-IN')}</p>}
                                  </div>
                                  <p className="font-mono text-base font-black text-slate-950 dark:text-amber-400">
                                    ₹{sell.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-amber-500/5 border border-dashed border-amber-500/30 rounded-xl space-y-1.5 text-center my-1">
                                <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                                  <Info className="w-3.5 h-3.5" />
                                  <span>Information Only (No Rates Configured)</span>
                                </div>
                                <p className="text-[10px] text-slate-500">Add B2B cost & selling price to generate customer proposals.</p>
                                <Button 
                                  size="sm" 
                                  onClick={() => navigate(`/crm/activities/edit/${act.id}`)}
                                  className="h-7 text-[10px] font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg px-3 mt-1 shadow-xs"
                                >
                                  <Plus className="w-3 h-3 mr-1" /> Add Rates & Costing
                                </Button>
                              </div>
                            )}

                            {/* Tax & Health Margin Badge */}
                            <div className="flex items-center justify-between pt-0.5">
                              <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-600 dark:text-amber-400">
                                {gstPct}% GST ({gstInc ? 'Incl' : 'Excl'})
                              </Badge>
                              {hasRates ? (
                                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border ${marginBadgeStyle}`}>
                                  {marginDot} ({marginPct.toFixed(1)}%)
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 border border-amber-500/30 text-amber-500 bg-amber-500/10 font-bold">
                                  ℹ️ Info Only
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        );
                      })()}
                    </div>

                    <div className="p-3 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
                      <button onClick={() => handleToggleStatus(act.id, act.active_status)} className="transition-transform hover:scale-105">
                        <Badge className={act.active_status ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-400 font-extrabold'} variant="outline">
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${act.active_status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {act.active_status ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>

                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400" onClick={() => navigate(`/crm/activities/edit/${act.id}`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400" onClick={() => handleDelete(act.id, act.activity_name)}>
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
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">Category</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">Location (City, State, Country)</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-right">B2B Cost</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-right">Selling Rate</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-right">Profit Markup</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-center">Yield Health</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(act => {
                    const sc = Number(act.supplier_cost) || 0;
                    const sell = Number((act as any).adult_cost || act.selling_cost) || 0;
                    const gstPct = Number(act.gst_percentage) || 18;
                    const gstInc = act.gst_included;

                    let netSelling = sell;
                    if (gstInc && gstPct > 0) {
                      netSelling = sell / (1 + gstPct / 100);
                    }
                    const profit = netSelling - sc;
                    const marginPct = sell > 0 ? ((profit / sell) * 100) : 0;

                    let marginBadgeStyle = "bg-rose-500/15 border-rose-500/40 text-rose-400 font-extrabold";
                    let marginDot = "🔴 Low";
                    if (marginPct >= 15) {
                      marginBadgeStyle = "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-extrabold";
                      marginDot = "🟢 High";
                    } else if (marginPct >= 5) {
                      marginBadgeStyle = "bg-amber-500/15 border-amber-500/40 text-amber-400 font-extrabold";
                      marginDot = "🟡 Standard";
                    }

                    return (
                      <TableRow key={act.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-border/10">
                        <TableCell className="py-3 px-4 text-left">
                          <p className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">{act.activity_code}</p>
                          <p className="font-extrabold text-xs text-slate-950 dark:text-white uppercase tracking-wide">{act.activity_name}</p>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-left">
                          <Badge variant="outline" className="text-[10px] font-extrabold uppercase px-2 py-0.5 border-amber-500/30 text-amber-600 dark:text-amber-400">
                            {act.activity_category}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-left space-y-0.5">
                          <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase">
                            {getCityName((act as any).city_id) !== '—' ? getCityName((act as any).city_id) : (act.destination || '---')}
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            {getStateName(act.state_id)} • {getCountryName(act.country_id)}
                          </p>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">
                          ₹{sc.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right font-mono font-black text-xs text-slate-950 dark:text-amber-400">
                          ₹{sell.toLocaleString('en-IN')}
                          <p className="text-[9px] text-slate-500 font-normal">Child: ₹{Number(act.child_cost || 0).toLocaleString()}</p>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right font-mono font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                          +₹{profit.toFixed(0)}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border ${marginBadgeStyle}`}>
                            {marginDot} ({marginPct.toFixed(1)}%)
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <button onClick={() => handleToggleStatus(act.id, act.active_status)}>
                            <Badge className={act.active_status ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-400 font-extrabold'} variant="outline">
                              {act.active_status ? 'Active' : 'Inactive'}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400" onClick={() => navigate(`/crm/activities/edit/${act.id}`)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400" onClick={() => handleDelete(act.id, act.activity_name)}>
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
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Showing <strong>{filtered.length}</strong> of <strong>{activities.length}</strong> activities</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
