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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  MapPin, Plus, Search, Edit, Loader2,
  DollarSign, ArrowLeft, Save, X, CheckCircle2,
  Car, Sun, Clock, Sunrise, Sunset, IndianRupee,
  Percent, Eye, Users, Camera, Navigation, Trash2, UploadCloud,
  LayoutGrid, List, Globe, Tag, Compass, Landmark, Info
} from 'lucide-react';

import { resolveGeography, INDIAN_STATES, INTERNATIONAL_STATE_COUNTRY_MAP, CITY_TO_STATE_COUNTRY_MAP } from '@/data/geographyMaster';
import { crmFetch } from '@/utils/crmApi';

// ─── Types ────────────────────────────────────────────────────────────────────

type Country = { id: string | number; country_name: string };
type State = { id: string | number; state_name: string; country_id: string | number };
type City = { id: string | number; city_name: string; state_id: string | number };

type Sightseeing = {
  id: string;
  sightseeing_name: string;
  sightseeing_code: string;
  destination: string;
  country_id: string | null;
  state_id: string | null;
  city_id: string | null;
  category: string | null;
  sub_category: string | null;
  is_half_day: boolean;
  is_full_day: boolean;
  vehicle_required: boolean;
  duration: string | null;
  description: string | null;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  supplier_name: string | null;
  supplier_cost: number;
  selling_cost: number;
  adult_cost: number;
  child_cost: number;
  image_url: string | null;
  gst_included: boolean;
  gst_percentage: number;
  active_status: boolean;
  created_at: string;
};

// ─── Blank form ───────────────────────────────────────────────────────────────

const BLANK_FORM = {
  sightseeing_name: '',
  sightseeing_code: '',
  destination: '',
  country_id: '',
  state_id: '',
  city_id: '',
  category: 'City Tour',
  sub_category: '',
  is_half_day: false,
  is_full_day: true,
  vehicle_required: true,
  duration: '',
  description: '',
  highlights: [] as string[],
  inclusions: [] as string[],
  exclusions: [] as string[],
  supplier_name: '',
  supplier_cost: 0,
  selling_cost: 0,
  adult_cost: 0,
  child_cost: 0,
  image_url: '',
  gst_included: false,
  gst_percentage: 5,
  active_status: true,
};

const parseJsonArray = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } 
    catch { return []; }
  }
  return [];
};

// ─── Tag Input ─────────────────────────────────────────────────────────────────

const TagInput = ({ label, items: rawItems, onChange, placeholder, colorClass = 'bg-amber-500/10 text-amber-700 border-amber-500/20' }: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  colorClass?: string;
}) => {
  const items = parseJsonArray(rawItems);
  const [val, setVal] = useState('');
  const add = () => {
    const v = val.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setVal('');
  };
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</Label>
      <div className="flex gap-2">
        <Input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder={placeholder} className="h-9 text-sm bg-slate-950 border-slate-800 text-slate-100 font-bold placeholder:text-slate-500 focus:border-amber-500" />
        <Button type="button" size="sm" onClick={add} className="h-9 px-3.5 shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl border-none shadow-sm flex items-center justify-center">
          <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {items.map(item => (
            <span key={item} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
              {item}
              <button type="button" onClick={() => onChange(items.filter(i => i !== item))} className="ml-0.5 hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
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
    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-slate-800 bg-[#0f1420] text-slate-100">
      <div className="col-span-2 text-xs font-black text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <IndianRupee className="w-3.5 h-3.5 text-amber-400" /> COST BREAKDOWN
      </div>
      {[
        { label: 'Supplier Cost', value: sc, color: 'text-slate-200 font-mono font-bold' },
        { label: `GST (${gstPct}%)`, value: gstAmt, color: 'text-amber-400 font-mono font-bold' },
        { label: 'Selling Price', value: sell, color: 'text-emerald-400 font-mono font-extrabold' },
        { label: 'Profit', value: profit, color: profit >= 0 ? 'text-emerald-400 font-mono font-extrabold' : 'text-rose-400 font-mono font-extrabold' },
      ].map(r => (
        <div key={r.label} className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-bold">{r.label}</span>
          <span className={`font-bold ${r.color}`}>₹{r.value.toFixed(2)}</span>
        </div>
      ))}
      <div className="col-span-2 flex justify-between items-center text-xs border-t border-slate-800 pt-2 mt-1">
        <span className="text-slate-300 font-extrabold flex items-center gap-1"><Percent className="w-3 h-3 text-amber-400" /> Margin</span>
        <span className={`font-extrabold text-sm font-mono ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{margin.toFixed(1)}%</span>
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

const CATEGORY_ICONS: Record<string, any> = {
  'City Tour': Compass,
  'Heritage': Landmark,
  'Nature & Wildlife': Camera,
  'Adventure': Navigation,
  'Cultural': Camera,
};

export default function SightseeingMaster() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sightseeings, setSightseeings] = useState<Sightseeing[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);

  // View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rateFilterMode, setRateFilterMode] = useState<'all' | 'with_rates' | 'info_only'>('all');

  const isFormView = location.pathname.includes('/new') || location.pathname.includes('/edit');
  const isEdit = location.pathname.includes('/edit');
  const editId = isEdit ? (location.pathname.split('/edit/')[1] || location.pathname.split('/edit')[1] || null) : null;

  useEffect(() => { loadBaseline(); loadSightseeings(); }, []);

  useEffect(() => {
    if (isEdit && editId && sightseeings.length > 0) {
      const item = sightseeings.find(s => 
        String(s.id) === String(editId) || 
        (s.sightseeing_code && s.sightseeing_code.toLowerCase() === String(editId).toLowerCase())
      );
      if (item) {
        const itemCityId = (item as any).city_id ? String((item as any).city_id) : '';
        let foundCity = cities.find(c => String(c.id) === itemCityId);
        if (!foundCity && item.destination) {
          foundCity = cities.find(c => (c.city_name || c.name || '').toLowerCase() === item.destination.toLowerCase());
        }

        const finalCityId = foundCity ? String(foundCity.id) : itemCityId;
        const finalStateId = foundCity?.state_id ? String(foundCity.state_id) : (item.state_id ? String(item.state_id) : '');
        const finalCountryId = foundCity?.country_id ? String(foundCity.country_id) : (item.country_id ? String(item.country_id) : '');
        const derivedCityName = foundCity ? (foundCity.city_name || foundCity.name || '') : '';
        const derivedDest = item.destination || derivedCityName || 'General Tour';
        const derivedCode = item.sightseeing_code || (
          (item.sightseeing_name || 'SS').trim().split(/\s+/).map(w => w.slice(0, 3).toUpperCase()).join('-') + '-01'
        );

        setForm({
          sightseeing_name: item.sightseeing_name || '',
          sightseeing_code: derivedCode,
          destination: derivedDest,
          country_id: finalCountryId,
          state_id: finalStateId,
          city_id: finalCityId,
          category: (item as any).category || 'City Tour',
          sub_category: (item as any).sub_category || '',
          is_half_day: !!item.is_half_day,
          is_full_day: !!item.is_full_day,
          vehicle_required: !!item.vehicle_required,
          duration: item.duration || '',
          description: (item as any).description || '',
          highlights: parseJsonArray(item.highlights),
          inclusions: parseJsonArray(item.inclusions),
          exclusions: parseJsonArray(item.exclusions),
          supplier_name: item.supplier_name || '',
          supplier_cost: Number(item.supplier_cost) || 0,
          selling_cost: Number(item.selling_cost) || 0,
          adult_cost: Number((item as any).adult_cost) || 0,
          child_cost: Number((item as any).child_cost) || 0,
          image_url: (item as any).image_url || '',
          gst_included: !!item.gst_included,
          gst_percentage: Number(item.gst_percentage) || 5,
          active_status: !!item.active_status,
        });
        setEditingId(item.id);
      }
    } else if (!isEdit && !isFormView) {
      setForm({ ...BLANK_FORM });
      setEditingId(null);
    }
  }, [isEdit, editId, sightseeings, isFormView, cities]);

  useEffect(() => {
    if (form.country_id) {
      setFilteredStates(states.filter(s => String(s.country_id) === String(form.country_id)));
    } else {
      setFilteredStates(states);
    }
  }, [form.country_id, states]);

  useEffect(() => {
    if (form.state_id) {
      setFilteredCities(cities.filter(c => String(c.state_id) === String(form.state_id)));
    } else if (form.country_id) {
      setFilteredCities(cities.filter(c => String(c.country_id) === String(form.country_id)));
    } else {
      setFilteredCities(cities);
    }
  }, [form.state_id, form.country_id, cities]);

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

  const loadSightseeings = async () => {
    setLoading(true);
    try {
      const authHeaders = await getAuthHeader();
      const res = await crmFetch(
        `${API_BASE}/api.php?table=sightseeings`,
        { headers: authHeaders },
        { action: 'list_sightseeings', module: 'Sightseeing' }
      );
      let list: Sightseeing[] = [];
      if (res.ok) {
        const data = await res.json();
        list = Array.isArray(data) ? data : [];
      }

      // If backend list is empty or sparse, merge/fallback with master SIGHTSEEING_SPOTS
      if (list.length === 0) {
        const fallbackSightseeings: Sightseeing[] = SIGHTSEEING_SPOTS.map((spot, idx) => ({
          id: `spot-${idx + 1}`,
          sightseeing_name: spot.name,
          sightseeing_code: spot.slug.toUpperCase().slice(0, 12),
          destination: spot.destination,
          country_id: null,
          state_id: null,
          city_id: null,
          category: spot.category,
          sub_category: 'Popular Spot',
          is_half_day: spot.duration.toLowerCase().includes('half') || spot.duration.toLowerCase().includes('hour'),
          is_full_day: spot.duration.toLowerCase().includes('full'),
          vehicle_required: true,
          duration: spot.duration,
          description: spot.description,
          highlights: spot.highlights,
          inclusions: ['Entry Ticket / Access Permit', 'Guided Sightseeing Excursion'],
          exclusions: ['Personal Expenses & Tips', 'Camera Fees'],
          supplier_name: 'Ghumo Firoo Travels',
          supplier_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 500,
          selling_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 800,
          adult_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 800,
          child_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 500,
          image_url: spot.image,
          gst_included: true,
          gst_percentage: 5,
          active_status: true,
          created_at: new Date().toISOString()
        }));
        list = fallbackSightseeings;
      }
      setSightseeings(list);
    } catch (err: any) {
      console.warn('API load sightseeings warning, loading fallback master spots:', err);
      const fallbackSightseeings: Sightseeing[] = SIGHTSEEING_SPOTS.map((spot, idx) => ({
        id: `spot-${idx + 1}`,
        sightseeing_name: spot.name,
        sightseeing_code: spot.slug.toUpperCase().slice(0, 12),
        destination: spot.destination,
        country_id: null,
        state_id: null,
        city_id: null,
        category: spot.category,
        sub_category: 'Popular Spot',
        is_half_day: spot.duration.toLowerCase().includes('half') || spot.duration.toLowerCase().includes('hour'),
        is_full_day: spot.duration.toLowerCase().includes('full'),
        vehicle_required: true,
        duration: spot.duration,
        description: spot.description,
        highlights: spot.highlights,
        inclusions: ['Entry Ticket / Access Permit', 'Guided Sightseeing Excursion'],
        exclusions: ['Personal Expenses & Tips', 'Camera Fees'],
        supplier_name: 'Ghumo Firoo Travels',
        supplier_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 500,
        selling_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 800,
        adult_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 800,
        child_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 500,
        image_url: spot.image,
        gst_included: true,
        gst_percentage: 5,
        active_status: true,
        created_at: new Date().toISOString()
      }));
      setSightseeings(fallbackSightseeings);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the sightseeing "${name}"?`)) return;
    try {
      const authHeaders = await getAuthHeader();
      const res = await crmFetch(
        `${API_BASE}/api.php?table=sightseeings&id=${id}`,
        {
          method: 'DELETE',
          headers: authHeaders
        },
        {
          action: 'delete_sightseeing',
          module: 'Sightseeing',
          itemName: name,
          recordId: id,
          details: `Deleted sightseeing "${name}"`
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete sightseeing');
      }
      toast({
        title: 'Sightseeing Deleted',
        description: `Successfully deleted sightseeing "${name}".`
      });
      setSightseeings(prev => prev.filter(s => s.id !== id));
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

    const finalName = form.sightseeing_name.trim();
    let finalCode = form.sightseeing_code.trim();
    let finalDest = form.destination.trim();

    // Auto-derive destination if missing from selected City or State
    if (!finalDest) {
      const selectedCity = cities.find(c => String(c.id) === String(form.city_id));
      const selectedState = states.find(s => String(s.id) === String(form.state_id));
      if (selectedCity) finalDest = selectedCity.city_name || selectedCity.name || '';
      else if (selectedState) finalDest = selectedState.state_name || '';
      else finalDest = 'General Tour';
    }

    // Auto-generate tour code if missing
    if (!finalCode && finalName) {
      finalCode = finalName.split(/\s+/).map(w => w.slice(0, 3).toUpperCase()).join('-') + '-' + Math.floor(1000 + Math.random() * 9000);
    }

    if (!finalName) {
      toast({ title: 'Required', description: 'Sightseeing Name is required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        ...form,
        sightseeing_name: finalName,
        sightseeing_code: finalCode,
        destination: finalDest,
        country_id: form.country_id || null,
        state_id: form.state_id || null,
        city_id: form.city_id || null,
        supplier_name: form.supplier_name || null,
        duration: form.duration || null,
        updated_at: new Date().toISOString(),
      };
      const authHeaders = await getAuthHeader();
        if (editingId) {
          const res = await crmFetch(
            `${API_BASE}/api.php?table=sightseeings&id=${editingId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify(payload)
            },
            {
              action: 'update_sightseeing',
              module: 'Sightseeing',
              itemName: finalName,
              recordId: editingId,
              details: `Updated sightseeing "${finalName}"`
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to update sightseeing');
          toast({ 
            title: '✅ Database Updated', 
            description: data.message || `Sightseeing "${form.sightseeing_name}" updated successfully in database.` 
          });
        } else {
          const res = await crmFetch(
            `${API_BASE}/api.php?table=sightseeings`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify({ ...payload, created_at: new Date().toISOString() })
            },
            {
              action: 'create_sightseeing',
              module: 'Sightseeing',
              itemName: finalName,
              details: `Created new sightseeing "${finalName}"`
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to add sightseeing');
          toast({ 
            title: '✅ Database Saved', 
            description: data.message || `Sightseeing "${form.sightseeing_name}" created successfully in database.` 
          });
        }
      await loadSightseeings();
      navigate('/crm/sightseeings');
    } catch (err: any) {
      toast({ title: 'Save Error', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleToggleStatus = async (id: string, current: boolean) => {
    try {
      const item = sightseeings.find(s => s.id === id);
      if (!item) return;
      const authHeaders = await getAuthHeader();
      const res = await crmFetch(
        `${API_BASE}/api.php?table=sightseeings&id=${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ ...item, active_status: !current })
        },
        {
          action: 'toggle_sightseeing_status',
          module: 'Sightseeing',
          itemName: item.sightseeing_name,
          recordId: id,
          details: `Toggled status to ${!current ? 'Active' : 'Inactive'}`
        }
      );
      if (!res.ok) throw new Error('Failed to update status');
      toast({ title: !current ? '✅ Activated' : '⏸ Deactivated', description: 'Status updated.' });
      await loadSightseeings();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAutoCode = () => {
    if (!form.sightseeing_name) return;
    const words = form.sightseeing_name.trim().split(/\s+/);
    const code = words.map(w => w.slice(0, 3).toUpperCase()).join('-') + '-' + Date.now().toString().slice(-4);
    setForm(f => ({ ...f, sightseeing_code: code }));
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
  const getCategoryMeta = (cat: string) => ({
    icon: CATEGORY_ICONS[cat] || Compass,
    bg: 'bg-amber-500/15',
    color: 'text-amber-600 dark:text-amber-400'
  });

  const filtered = sightseeings.filter(s => {
    const hasRates = Number(s.supplier_cost) > 0 || Number(s.selling_cost) > 0 || Number((s as any).adult_cost) > 0;
    if (rateFilterMode === 'with_rates' && !hasRates) return false;
    if (rateFilterMode === 'info_only' && hasRates) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchName = (s.sightseeing_name || '').toLowerCase().includes(q);
      const matchCode = (s.sightseeing_code || '').toLowerCase().includes(q);
      const matchDest = (s.destination || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDest) return false;
    }

    const rawCountry = getCountryName(s.country_id);
    const rawState = getStateName(s.state_id);
    const rawCity = s.destination || '';
    const geo = resolveGeography(rawCity, rawState, rawCountry);

    if (filterCountry !== 'all') {
      const selCountryName = selectedCountryObj?.country_name || '';
      if (selCountryName && geo.country.toLowerCase() !== selCountryName.toLowerCase() && String(s.country_id) !== String(filterCountry)) {
        return false;
      }
    }

    if (filterState !== 'all') {
      const selectedStateObj = states.find(st => String(st.id) === String(filterState));
      const selStateName = selectedStateObj?.state_name || '';
      if (selStateName && geo.state.toLowerCase() !== selStateName.toLowerCase() && String(s.state_id) !== String(filterState)) {
        return false;
      }
    }

    if (filterCity !== 'all') {
      const selectedCityObj = cities.find(c => String(c.id) === String(filterCity));
      const selCityName = selectedCityObj?.city_name || (selectedCityObj as any)?.name || '';
      const cityMatchesId = String((s as any).city_id) === String(filterCity);
      const cityMatchesName = selCityName && geo.city.toLowerCase() === selCityName.toLowerCase();
      if (!cityMatchesId && !cityMatchesName) return false;
    }

    if (filterType === 'half' && !s.is_half_day) return false;
    if (filterType === 'full' && !s.is_full_day) return false;
    if (filterStatus === 'active' && !s.active_status) return false;
    if (filterStatus === 'inactive' && s.active_status) return false;
    return true;
  });

  // ── Form View ──────────────────────────────────────────────────────────────
  if (isFormView) {
    const isCountryLoaded = !form.country_id || countries.some(c => String(c.id) === String(form.country_id));
    const isStateLoaded = !form.state_id || filteredStates.some(s => String(s.id) === String(form.state_id));
    return (
      <div className="space-y-6 max-w-5xl mx-auto text-slate-100">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/crm/sightseeings')} className="h-9 w-9 rounded-xl border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">{editingId ? 'Edit Sightseeing Tour' : 'Add New Sightseeing Tour'}</h2>
            <p className="text-xs text-slate-300 font-medium">Fill in all required fields marked * to register a sightseeing tour.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <Card className="border border-slate-800 bg-[#161d2f] text-slate-100 shadow-xl rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-800 bg-slate-900/60 rounded-t-2xl">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" /> Basic Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">Sightseeing Name *</Label>
                    <Input value={form.sightseeing_name} onChange={e => setForm(f => ({ ...f, sightseeing_name: e.target.value }))} placeholder="e.g. Dubai Half Day City Tour" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Tour Code *</Label>
                    <div className="flex gap-2">
                      <Input value={form.sightseeing_code} onChange={e => setForm(f => ({ ...f, sightseeing_code: e.target.value.toUpperCase() }))} placeholder="e.g. DUB-CTY-01" className="h-9 font-mono" />
                      <Button type="button" size="sm" variant="outline" onClick={handleAutoCode} className="h-9 px-3 text-xs shrink-0">Auto</Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Destination Label *</Label>
                    <Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="e.g. Dubai" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Duration</Label>
                    <Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 4 Hours, 8 Hours" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>
                        {['City Tour', 'Heritage', 'Nature & Wildlife', 'Adventure', 'Cultural'].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">Cover Image URL</Label>
                    <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="h-9" />
                  </div>
                  <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <Switch id="half-day" checked={form.is_half_day} onCheckedChange={chk => setForm(f => ({ ...f, is_half_day: chk }))} />
                      <Label htmlFor="half-day" className="text-xs font-semibold cursor-pointer">Half Day Tour</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="full-day" checked={form.is_full_day} onCheckedChange={chk => setForm(f => ({ ...f, is_full_day: chk }))} />
                      <Label htmlFor="full-day" className="text-xs font-semibold cursor-pointer">Full Day Tour</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="veh-req" checked={form.vehicle_required} onCheckedChange={chk => setForm(f => ({ ...f, vehicle_required: chk }))} />
                      <Label htmlFor="veh-req" className="text-xs font-semibold cursor-pointer">Vehicle Required</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-800 bg-[#161d2f] text-slate-100 shadow-xl rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-800 bg-slate-900/60 rounded-t-2xl">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" /> Location Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Country</Label>
                    <Select 
                      value={form.country_id} 
                      onValueChange={v => setForm(f => ({ ...f, country_id: v }))}
                    >
                      <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-slate-100 font-bold"><SelectValue placeholder="Country" /></SelectTrigger>
                      <SelectContent>
                        {sortedCountries.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.country_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300 uppercase tracking-wide">State</Label>
                    <Select 
                      value={form.state_id} 
                      onValueChange={v => {
                        const selectedS = states.find(s => String(s.id) === String(v));
                        setForm(f => ({
                          ...f,
                          state_id: v,
                          country_id: selectedS?.country_id ? String(selectedS.country_id) : f.country_id
                        }));
                      }}
                    >
                      <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-slate-100 font-bold"><SelectValue placeholder="State" /></SelectTrigger>
                      <SelectContent>
                        {filteredStates.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.state_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300 uppercase tracking-wide">City</Label>
                    <Select 
                      value={form.city_id} 
                      onValueChange={v => {
                        const selectedC = cities.find(c => String(c.id) === String(v));
                        setForm(f => ({
                          ...f,
                          city_id: v,
                          state_id: selectedC?.state_id ? String(selectedC.state_id) : f.state_id,
                          country_id: selectedC?.country_id ? String(selectedC.country_id) : f.country_id,
                          destination: selectedC ? (selectedC.city_name || selectedC.name || f.destination) : f.destination
                        }));
                      }}
                    >
                      <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-slate-100 font-bold"><SelectValue placeholder="City" /></SelectTrigger>
                      <SelectContent>
                        {filteredCities.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.city_name || c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-800 bg-[#161d2f] text-slate-100 shadow-xl rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-800 bg-slate-900/60 rounded-t-2xl">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" /> Highlights & Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <TagInput label="Key Highlights" items={form.highlights} onChange={h => setForm(f => ({ ...f, highlights: h }))} placeholder="e.g. Photo stop at Atlantis" />
                  <TagInput label="Inclusions" items={form.inclusions} onChange={inc => setForm(f => ({ ...f, inclusions: inc }))} placeholder="e.g. AC Transfer included" colorClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" />
                  <TagInput label="Exclusions" items={form.exclusions} onChange={exc => setForm(f => ({ ...f, exclusions: exc }))} placeholder="e.g. Entry ticket extra" colorClass="bg-rose-500/10 text-rose-600 border-rose-500/20" />
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-bold text-slate-300 uppercase tracking-wide">Description</Label>
                    <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Full tour itinerary description..." className="bg-slate-950 border-slate-800 text-slate-100 font-bold focus:border-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="border border-slate-800 bg-[#161d2f] text-slate-100 shadow-xl rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-800 bg-slate-900/60 rounded-t-2xl">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-amber-400" /> Rates & Supplier
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Supplier Name</Label>
                    <Input value={form.supplier_name} onChange={e => setForm(f => ({ ...f, supplier_name: e.target.value }))} placeholder="e.g. Local Operator" className="h-9" />
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
                  {editingId ? 'Update Sightseeing' : 'Save New Sightseeing'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => navigate('/crm/sightseeings')} className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold border border-slate-700">
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
  const activeCount = sightseeings.filter(s => s.active_status).length;
  const avgAdultCost = sightseeings.length > 0
    ? (sightseeings.reduce((sum, s) => sum + Number((s as any).adult_cost || s.selling_cost || 0), 0) / sightseeings.length).toFixed(0)
    : '0';

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total Sightseeings</p>
              <div className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{sightseeings.length}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Catalog tour products</p>
            </div>
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Active Tours</p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCount}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Ready for quotes</p>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Avg Adult Rate</p>
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
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Covered Destinations</p>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {[...new Set(sightseeings.map(s => s.destination).filter(Boolean))].length} Cities
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
                All Sightseeings ({sightseeings.length})
              </button>
              <button
                type="button"
                onClick={() => setRateFilterMode('with_rates')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${rateFilterMode === 'with_rates' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                💰 With Rates ({sightseeings.filter(s => (Number(s.supplier_cost) > 0 || Number(s.selling_cost) > 0 || Number((s as any).adult_cost) > 0)).length})
              </button>
              <button
                type="button"
                onClick={() => setRateFilterMode('info_only')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${rateFilterMode === 'info_only' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ℹ️ Info Only ({sightseeings.filter(s => !(Number(s.supplier_cost) > 0 || Number(s.selling_cost) > 0 || Number((s as any).adult_cost) > 0)).length})
              </button>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-400 bg-amber-500/10 px-3 py-1 font-bold">
              🚗 Vehicle Included Circuits Default
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-500" /> Sightseeing Master Catalog
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Manage city sightseeing tours, vehicle inclusion policies, and contracted supplier rates.
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
              <Button onClick={() => navigate('/crm/sightseeings/new')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold h-9 px-4 rounded-xl text-xs shrink-0 shadow-xs">
                <Plus className="w-4 h-4 mr-1.5" /> Add Sightseeing
              </Button>
            </div>
          </div>

          {/* Cascading Location & Tour Type Filters Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-1">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sightseeing name, code, destination..."
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
                <SelectItem value="all">All Countries ({sortedCountries.length})</SelectItem>
                {sortedCountries.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.country_name}</SelectItem>)}
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
                {listCitiesForFilter.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.city_name || c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Tour Duration Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="Tour Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="half">Half Day</SelectItem>
                <SelectItem value="full">Full Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16 w-full">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-extrabold mt-2">Loading sightseeings catalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 w-full border border-dashed border-border/60 rounded-2xl m-6 max-w-[calc(100%-3rem)]">
              <Compass className="w-10 h-10 text-amber-500/40 mx-auto mb-3" />
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">No sightseeings found matching filters</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting Country, State, or City filter criteria.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
              {filtered.map(s => {
                const meta = getCategoryMeta((s as any).category);
                const Icon = meta.icon;
                const highlightsList = parseJsonArray(s.highlights);
                return (
                  <Card key={s.id} className="overflow-hidden border-border/60 hover:border-amber-500/40 hover:shadow-md transition-all group flex flex-col justify-between bg-card text-left">
                    <div>
                      {/* Photo Banner */}
                      <div className="h-40 relative overflow-hidden bg-slate-900">
                        {s.image_url ? (
                          <img 
                            src={s.image_url} 
                            alt={s.sightseeing_name} 
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
                              <Icon className="w-3 h-3" /> {(s as any).category || 'City Tour'}
                            </span>
                            <span className="bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded font-mono text-[10px] text-amber-400 font-black border border-amber-500/30 uppercase">
                              {s.sightseeing_code}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <h3 className="text-white font-black text-sm leading-tight group-hover:text-amber-400 transition-colors uppercase tracking-wide truncate" title={s.sightseeing_name}>
                              {s.sightseeing_name}
                            </h3>
                            <p className="text-slate-300 text-[10px] flex items-center font-bold uppercase gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              {getCityName((s as any).city_id) !== '—' ? getCityName((s as any).city_id) : (s.destination || 'Global')}
                              {s.state_id && <span className="text-slate-400 font-medium text-[9px] lowercase normal-case"> ({getStateName(s.state_id)})</span>}
                            </p>
                          </div>
                        </div>
                      </div>

                      {(() => {
                        const sc = Number(s.supplier_cost) || 0;
                        const sell = Number((s as any).adult_cost || s.selling_cost) || 0;
                        const childPrice = Number((s as any).child_cost || 0);
                        const gstPct = Number(s.gst_percentage) || 5;
                        const gstInc = s.gst_included;

                        let netSelling = sell;
                        if (gstInc && gstPct > 0) {
                          netSelling = sell / (1 + gstPct / 100);
                        }
                        const profit = netSelling - sc;
                        const marginPct = sell > 0 ? ((profit / sell) * 100) : 0;
                        const hasRates = sc > 0 || sell > 0;

                        let marginBadgeStyle = "bg-rose-500/15 border-rose-500/40 text-rose-400 font-extrabold";
                        let marginDot = "🔴 Low";
                        if (marginPct >= 15) {
                          marginBadgeStyle = "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-extrabold";
                          marginDot = "🟢 High Yield";
                        } else if (marginPct >= 5) {
                          marginBadgeStyle = "bg-amber-500/15 border-amber-500/40 text-amber-400 font-extrabold";
                          marginDot = "🟡 Standard Yield";
                        }

                        return (
                          <CardContent className="p-4 space-y-3 text-xs font-semibold">
                            {/* Duration, Type & Cab */}
                            <div className="flex justify-between items-center py-1 border-b border-border/40">
                              <span className="text-slate-500 dark:text-slate-400 font-medium">Tour Specs:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-950 dark:text-white font-extrabold">{s.duration || 'Flexible'}</span>
                                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${s.vehicle_required ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-400'}`}>
                                  <Car className="w-2.5 h-2.5" /> {s.vehicle_required ? 'Cab Included' : 'No Cab'}
                                </span>
                              </div>
                            </div>

                            {/* Conditional Display: Rates Grid vs Info Only */}
                            {hasRates ? (
                              <div className="p-3 bg-slate-100/70 dark:bg-[#121827] border border-border/60 rounded-xl space-y-2">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-600 dark:text-slate-400 font-medium">B2B Net Cost:</span>
                                  <span className="font-mono text-slate-900 dark:text-slate-200 font-extrabold">₹{sc.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-600 dark:text-slate-400 font-medium">Agent Markup:</span>
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
                                <p className="text-[10px] text-slate-500">Add B2B cost & selling price to generate customer quotes.</p>
                                <Button 
                                  size="sm" 
                                  onClick={() => navigate(`/crm/sightseeings/edit/${s.id}`)}
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

                            {highlightsList.length > 0 && (
                              <div className="pt-1 border-t border-border/30">
                                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Highlights:</p>
                                <div className="flex flex-wrap gap-1">
                                  {highlightsList.slice(0, 3).map((h, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[9px] font-bold">
                                      {h}
                                    </span>
                                  ))}
                                  {highlightsList.length > 3 && (
                                    <span className="text-[9px] text-slate-500 font-bold">+{highlightsList.length - 3} more</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        );
                      })()}
                    </div>

                    <div className="p-3 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
                      <button onClick={() => handleToggleStatus(s.id, s.active_status)} className="transition-transform hover:scale-105">
                        <Badge className={s.active_status ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-400 font-extrabold'} variant="outline">
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${s.active_status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {s.active_status ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>

                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400" onClick={() => navigate(`/crm/sightseeings/edit/${s.id}`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400" onClick={() => handleDelete(s.id, s.sightseeing_name)}>
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
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">Category & Type</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">Location (City, State, Country)</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-center">Cab Req</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-right">Adult Rate</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-right">Child Rate</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(s => (
                    <TableRow key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-border/10">
                      <TableCell className="py-3 px-4 text-left">
                        <p className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">{s.sightseeing_code}</p>
                        <p className="font-extrabold text-xs text-slate-950 dark:text-white uppercase tracking-wide">{s.sightseeing_name}</p>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-left space-y-1">
                        <Badge variant="outline" className="text-[10px] font-extrabold uppercase px-2 py-0.5 border-amber-500/30 text-amber-600 dark:text-amber-400">
                          {(s as any).category || 'City Tour'}
                        </Badge>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          {s.is_full_day ? 'Full Day' : (s.is_half_day ? 'Half Day' : s.duration || '---')}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-left space-y-0.5">
                        <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase">
                          {getCityName((s as any).city_id) !== '—' ? getCityName((s as any).city_id) : (s.destination || '---')}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                          {getStateName(s.state_id)} • {getCountryName(s.country_id)}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${s.vehicle_required ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          {s.vehicle_required ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right font-black text-xs text-slate-950 dark:text-white">
                        ₹{Number((s as any).adult_cost || s.selling_cost).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right font-semibold text-xs text-slate-700 dark:text-slate-300">
                        ₹{Number((s as any).child_cost || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <button onClick={() => handleToggleStatus(s.id, s.active_status)}>
                          <Badge className={s.active_status ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-extrabold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-400 font-extrabold'} variant="outline">
                            {s.active_status ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400" onClick={() => navigate(`/crm/sightseeings/edit/${s.id}`)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400" onClick={() => handleDelete(s.id, s.sightseeing_name)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Showing <strong>{filtered.length}</strong> of <strong>{sightseeings.length}</strong> sightseeings</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
