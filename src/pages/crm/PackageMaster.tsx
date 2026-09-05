import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchCachedJson } from '@/utils/crmCache';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Package, Plus, Search, Edit, Power, Info,
  CheckCircle2, AlertTriangle, Loader2, MapPin, Globe,
  ArrowLeft, Save, Tag, X, ChevronRight, Eye, Building2,
  Star, Sparkles, IndianRupee, Trash2, Calendar, Plane, Map,
  Check, ChevronsUpDown, Send
} from 'lucide-react';
import { CONTRACTED_HOTELS_REGISTRY, type ContractedHotelItem } from '@/data/contractedHotelsMaster';
import { itineraryService } from '@/services/itineraryService';

// ─── Tag Input component ───────────────────────────────────────────────────────
const TagInput = ({ label, items, onChange, placeholder, colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30' }: {
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
      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="h-9.5 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
        />
        <Button type="button" size="sm" variant="outline" onClick={add} className="h-9.5 px-3 bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {items.map(item => (
            <span key={item} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
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

const BLANK_FORM = {
  name: '',
  slug: '',
  price: 0,
  duration: '',
  image: '',
  images: [] as string[],
  category: [] as string[],
  rating: 5.0,
  reviews: 0,
  destinations: [] as string[],
  highlights: [] as string[],
  inclusions: [] as string[],
  exclusions: [] as string[],
  itinerary: [] as any[],
  map_locations: [] as any[],
  flight_routes: [] as any[],
  virtual_tour: { destination: '', tourStops: [] as any[] },
  faqs: [] as any[],
  hotels: [] as any[],
  attractions: [] as any[],
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  best_time: '',
  group_size: '',
  difficulty: '',
  quick_facts: {
    groupSize: '',
    bestTime: '',
    difficulty: '',
    ageLimit: 'All Ages',
    accommodation: 'Hotels',
    meals: 'Breakfast Included',
    transport: 'Private Transfers'
  },
  package_type: 'domestic',
  is_active: true
};

export default function PackageMaster() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form State
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sub tabs
  const [activeSubTab, setActiveSubTab] = useState('basic');

  // Variant Management State
  const [variantsList, setVariantsList] = useState<any[]>([]);
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [variantInnerTab, setVariantInnerTab] = useState('basic');
  const [savingVariant, setSavingVariant] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);


  // Master Hotels loaded dynamically from Hotel Master Page
  const [masterHotels, setMasterHotels] = useState<any[]>([]);

  // Master Sightseeings / Attractions loaded dynamically from database
  const [masterSightseeings, setMasterSightseeings] = useState<any[]>([]);

  useEffect(() => {
    const fetchMasterHotels = async () => {
      try {
        const data = await fetchCachedJson('/php-backend/bootstrap.php');
        if (data && data.success && Array.isArray(data.hotels) && data.hotels.length > 0) {
          setMasterHotels(data.hotels);
        }
        if (data && data.success && Array.isArray(data.sightseeings) && data.sightseeings.length > 0) {
          setMasterSightseeings(data.sightseeings);
        }
      } catch (err) {
        console.log('Hotel Master API offline, using contracted registry baseline');
      }
    };

    const fetchMasterSightseeings = async () => {
      try {
        const res = await fetchCachedJson('/php-backend/mysql-crud.php?table=sightseeings');
        if (Array.isArray(res) && res.length > 0) {
          setMasterSightseeings(res);
        }
      } catch (err) {
        // Handled in fetchMasterHotels bootstrap
      }
    };

    fetchMasterHotels();
    fetchMasterSightseeings();
  }, []);

  // Unified list of all available hotels across DB master + Contracted Registry
  const allAvailableHotels = useMemo(() => {
    const list: any[] = [];

    // 1. From CONTRACTED_HOTELS_REGISTRY
    Object.entries(CONTRACTED_HOTELS_REGISTRY).forEach(([city, catMap]) => {
      Object.entries(catMap).forEach(([cat, hotels]) => {
        hotels.forEach(h => {
          if (h && h.name && !list.some(item => item.name.toLowerCase() === h.name.toLowerCase())) {
            list.push({
              name: h.name,
              hotel_name: h.name,
              location: city,
              stars: h.stars || 4,
              category: cat
            });
          }
        });
      });
    });

    // 2. From masterHotels (database)
    masterHotels.forEach(h => {
      const hName = h.hotel_name || h.name;
      if (hName && !list.some(item => item.name.toLowerCase() === hName.toLowerCase())) {
        list.push({
          name: hName,
          hotel_name: hName,
          location: h.city || h.location || h.cities?.city_name || '',
          stars: Number(h.star_rating || h.stars || 4),
          category: h.category || ''
        });
      }
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [masterHotels]);

  // Unified list of all available sightseeings / attractions
  const allAvailableSightseeings = useMemo(() => {
    const list: any[] = [];

    masterSightseeings.forEach(s => {
      const title = s.sightseeing_name || s.name || s.title;
      if (title && !list.some(item => item.title.toLowerCase() === title.toLowerCase())) {
        list.push({
          title,
          destination: s.destination || s.city || '',
          description: s.description || '',
          duration: s.duration || '2 hrs',
          image: s.image_url || s.image || ''
        });
      }
    });

    const defaultBaseline = [
      { title: "White Desert Sunset Point", destination: "Dhordo", duration: "3 hrs" },
      { title: "Kalo Dungar (Black Hill)", destination: "Khavda", duration: "4 hrs" },
      { title: "Gandhi Nu Gam Artisan Village", destination: "Ludiya", duration: "2 hrs" },
      { title: "Road to Heaven Highway Drive", destination: "Dholavira", duration: "5 hrs" },
      { title: "Badrinath Temple", destination: "Badrinath Dham", duration: "3 hrs" },
      { title: "Mana Village & Saraswati River", destination: "Mana Border", duration: "2.5 hrs" },
      { title: "Kedarnath Dham Shrine", destination: "Kedarnath", duration: "6 hrs" }
    ];

    defaultBaseline.forEach(b => {
      if (!list.some(item => item.title.toLowerCase() === b.title.toLowerCase())) {
        list.push(b);
      }
    });

    return list.sort((a, b) => a.title.localeCompare(b.title));
  }, [masterSightseeings]);

  // Extract target destination keywords for the active package
  const packageTargetDestinations = useMemo(() => {
    const destSet = new Set<string>();

    if (Array.isArray(form.destinations)) {
      form.destinations.forEach(d => {
        if (d) destSet.add(d.trim().toLowerCase());
      });
    }

    if (form.name) {
      const titleLower = form.name.toLowerCase();
      if (titleLower.includes('rann') || titleLower.includes('kutch') || titleLower.includes('bhuj')) {
        destSet.add('bhuj');
        destSet.add('kutch');
        destSet.add('dhordo');
        destSet.add('dholavira');
      } else if (titleLower.includes('dham') || titleLower.includes('kedarnath') || titleLower.includes('badrinath')) {
        destSet.add('joshimath');
        destSet.add('badrinath');
        destSet.add('uttarkashi');
        destSet.add('janki chatti');
        destSet.add('haridwar');
        destSet.add('guptkashi');
      } else if (titleLower.includes('kashmir') || titleLower.includes('srinagar')) {
        destSet.add('srinagar');
        destSet.add('gulmarg');
        destSet.add('pahalgam');
      }
    }

    if (Array.isArray(form.hotels)) {
      form.hotels.forEach((h: any) => {
        const loc = h.location || h.city;
        if (loc) destSet.add(loc.trim().toLowerCase());
      });
    }

    return Array.from(destSet);
  }, [form.destinations, form.name, form.hotels]);

  // Destination-Filtered Hotels List for Variant Editor
  const filteredHotelsForPackage = useMemo(() => {
    if (packageTargetDestinations.length === 0) {
      return allAvailableHotels;
    }

    const matches = allAvailableHotels.filter(h => {
      const loc = (h.location || '').toLowerCase();
      const hName = (h.name || '').toLowerCase();
      return packageTargetDestinations.some(target => 
        loc.includes(target) || target.includes(loc) || hName.includes(target)
      );
    });

    return matches.length > 0 ? matches : allAvailableHotels;
  }, [allAvailableHotels, packageTargetDestinations]);

  // Destination-Filtered Sightseeings List for Variant Editor
  const filteredSightseeingsForPackage = useMemo(() => {
    if (packageTargetDestinations.length === 0) {
      return allAvailableSightseeings;
    }

    const matches = allAvailableSightseeings.filter(s => {
      const dest = (s.destination || '').toLowerCase();
      const title = (s.title || '').toLowerCase();
      return packageTargetDestinations.some(target => 
        dest.includes(target) || target.includes(dest) || title.includes(target)
      );
    });

    return matches.length > 0 ? matches : allAvailableSightseeings;
  }, [allAvailableSightseeings, packageTargetDestinations]);

  // Combine Master Hotels with Baseline Contracted Registry from Docs
  const dynamicCityList = Array.from(
    new Set([
      ...Object.keys(CONTRACTED_HOTELS_REGISTRY),
      ...masterHotels.map(h => h.city || h.location || h.cities?.city_name).filter(Boolean)
    ])
  ).sort();

  const getHotelsForCityAndCategory = (city: string, category: string) => {
    if (!city) return [];

    const searchCity = city.trim().toLowerCase();

    // 1. Exact match first
    let regCityKey = Object.keys(CONTRACTED_HOTELS_REGISTRY).find(
      k => k.trim().toLowerCase() === searchCity
    );

    // 2. Strict word boundary / substring match second
    if (!regCityKey && searchCity.length > 2) {
      regCityKey = Object.keys(CONTRACTED_HOTELS_REGISTRY).find(
        k => k.toLowerCase().includes(searchCity) || searchCity.includes(k.toLowerCase())
      );
    }

    const baseline = regCityKey ? (CONTRACTED_HOTELS_REGISTRY[regCityKey]?.[category] || []) : [];

    const masterMatches = masterHotels
      .filter(h => {
        const hCity = (h.city || h.location || h.cities?.city_name || '').trim().toLowerCase();
        if (!hCity) return false;
        if (hCity !== searchCity && !hCity.includes(searchCity) && !searchCity.includes(hCity)) return false;
        const stars = Number(h.star_rating || h.stars || 4);
        if (category === 'Budget') return stars <= 3;
        if (category === 'Luxury') return stars >= 5;
        return stars === 4;
      })
      .map(h => ({
        name: h.hotel_name || h.name,
        stars: Number(h.star_rating || h.stars || 4),
        defaultRoom: h.room_type || (category === 'Budget' ? 'Standard Room' : category === 'Luxury' ? 'Luxury Suite' : 'Deluxe AC Room'),
        roomTypes: Array.isArray(h.room_types) ? h.room_types : (Array.isArray(h.rates) ? h.rates.map((r: any) => r.room_type) : (h.room_type ? [h.room_type] : [])),
        cost_price: Number(h.b2b_cost || h.cost_price || 3500),
        margin_percent: 20,
        raw: h
      }));

    const combined: any[] = [];
    [...baseline, ...masterMatches].forEach(mh => {
      if (mh && mh.name && !combined.some(c => c.name.trim().toLowerCase() === mh.name.trim().toLowerCase())) {
        combined.push({
          ...mh,
          name: mh.name.trim()
        });
      }
    });

    return combined;
  };

  // Hotel builder state with explicit sequence: City -> Hotel Category -> Hotel Name
  const [hotelLocation, setHotelLocation] = useState('Joshimath');
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [cityRegionFilter, setCityRegionFilter] = useState<string>('All');

  // Filtered city list for search popover
  const filteredCitiesList = dynamicCityList.filter(city => {
    const matchesSearch = city.toLowerCase().includes(citySearchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (cityRegionFilter === 'Char Dham') {
      return ['Joshimath', 'Badrinath Dham', 'Haridwar', 'Rishikesh', 'Sitapur', 'Uttarkashi', 'Sonprayag', 'Rudraprayag', 'Pipalkoti', 'Barkot', 'Janki Chatti', 'Kedarnath', 'Guptkashi', 'Chopta', 'Harsil', 'Netala', 'Pandukeshwar'].includes(city);
    }
    if (cityRegionFilter === 'Rann Kutch') {
      return ['Tent City Dhordo', 'Dhordo', 'Bhuj', 'Dholavira', 'Mandvi Beach', 'Mandvi', 'Hodka', 'Kutch', 'Ahmedabad'].includes(city);
    }
    if (cityRegionFilter === 'Kerala') {
      return ['Munnar', 'Thekkady', 'Alleppey', 'Kovalam', 'Kochi', 'Cochin', 'Wayanad', 'Thiruvananthapuram', 'Trivandrum', 'Kumarakom', 'Varkala', 'Poovar', 'Marari', 'Bekal', 'Athirappilly', 'Kozhikode', 'Vagamon'].includes(city);
    }
    if (cityRegionFilter === 'Kashmir') {
      return ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonmarg', 'Katara'].includes(city);
    }
    return true;
  });

  const [hotelCategory, setHotelCategory] = useState('Deluxe');
  const [hotelName, setHotelName] = useState('');
  const [customHotelName, setCustomHotelName] = useState('');
  const [hotelStars, setHotelStars] = useState(4);
  const [hotelRoomType, setHotelRoomType] = useState('Deluxe AC Room');
  const [hotelMealPlan, setHotelMealPlan] = useState('Breakfast & Dinner Included');
  const [hotelCostPrice, setHotelCostPrice] = useState<number>(3200);
  const [hotelMarginPercent, setHotelMarginPercent] = useState<number>(20);
  const [hotelImage, setHotelImage] = useState('');
  const [hotelListCategoryFilter, setHotelListCategoryFilter] = useState<string>('All');

  // Attraction builder state
  const [attTitle, setAttTitle] = useState('');
  const [attLocation, setAttLocation] = useState('');
  const [attDesc, setAttDesc] = useState('');
  const [attImage, setAttImage] = useState('');

  const addHotel = () => {
    const finalHotelName = hotelName === '__custom__' ? customHotelName.trim() : hotelName.trim();
    if (!finalHotelName) {
      toast({ title: 'Hotel Name Required', description: 'Please select or enter a hotel name', variant: 'destructive' });
      return;
    }
    const loc = hotelLocation.trim() || 'Main Destination';
    const cat = hotelCategory || 'Deluxe';
    const cPrice = Number(hotelCostPrice) || 0;
    const mPercent = Number(hotelMarginPercent) || 0;
    const sPrice = Math.round(cPrice * (1 + mPercent / 100));
    const profit = sPrice - cPrice;

    setForm(prev => ({
      ...prev,
      hotels: [
        ...(prev.hotels || []),
        {
          name: finalHotelName,
          hotel_name: finalHotelName,
          location: loc,
          destinationTag: loc,
          category: cat,
          stars: Number(hotelStars) || (cat === 'Budget' ? 3 : cat === 'Luxury' ? 5 : 4),
          room_type: hotelRoomType.trim(),
          meal_plan: hotelMealPlan.trim(),
          cost_price: cPrice,
          margin_percent: mPercent,
          selling_price: sPrice,
          profit_amount: profit,
          image: hotelImage.trim() || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600'
        }
      ]
    }));
    setHotelName('');
    setCustomHotelName('');
    toast({ title: 'Hotel Added to Package', description: `Added ${cat} Hotel: ${finalHotelName} with ${mPercent}% explicit markup.` });
  };

  const removeHotel = (idx: number) => {
    setForm(prev => ({
      ...prev,
      hotels: (prev.hotels || []).filter((_, i) => i !== idx)
    }));
  };

  const addAttraction = () => {
    if (!attTitle.trim()) {
      toast({ title: 'Attraction Title Required', variant: 'destructive' });
      return;
    }
    const loc = attLocation.trim() || 'Sightseeing Spot';
    setForm(prev => ({
      ...prev,
      attractions: [
        ...(prev.attractions || []),
        {
          name: attTitle.trim(),
          location: loc,
          destinationTag: loc,
          description: attDesc.trim(),
          image: attImage.trim() || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800'
        }
      ]
    }));
    setAttTitle('');
    setAttLocation('');
    setAttDesc('');
    setAttImage('');
  };

  const removeAttraction = (idx: number) => {
    setForm(prev => ({
      ...prev,
      attractions: (prev.attractions || []).filter((_, i) => i !== idx)
    }));
  };

  const isFormView = location.pathname === '/crm/packages/new' || location.pathname.startsWith('/crm/packages/edit/');
  const isEdit = location.pathname.startsWith('/crm/packages/edit/');
  const editId = isEdit ? location.pathname.replace('/crm/packages/edit/', '') : null;

  useEffect(() => { loadPackages(); }, []);

  useEffect(() => {
    if (isEdit && editId) {
      loadPackageVariants(editId);
    }
  }, [isEdit, editId]);

  const loadPackageVariants = async (pkgId: string) => {
    setLoadingVariants(true);
    try {
      const res = await fetch(`/php-backend/packages.php?id=${pkgId}&include_variants=1`);
      if (res.ok) {
        const data = await res.json();
        setVariantsList(data.package?.variants || data.variants || []);
      }
    } catch (err: any) {
      console.warn('Failed to load variants:', err);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !form.slug) {
      toast({ title: 'Save Package First', description: 'Please save basic package details before adding variants.', variant: 'destructive' });
      return;
    }
    if (!editingVariant?.variant_key || !editingVariant?.label) {
      toast({ title: 'Validation Error', description: 'Variant Key and Label are required.', variant: 'destructive' });
      return;
    }

    setSavingVariant(true);
    try {
      const authHeaders = await getAuthHeader();
      const payload = {
        ...editingVariant,
        package_id: editingId || editId
      };

      const res = await fetch('/php-backend/packages.php?action=save_variant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save variant');
      const resData = await res.json();
      toast({ title: 'Variant saved successfully!' });
      setEditingVariant(null);
      if (editingId || editId) {
        loadPackageVariants(editingId || editId || '');
      }
    } catch (err: any) {
      toast({ title: 'Failed to save variant', description: err.message, variant: 'destructive' });
    } finally {
      setSavingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`/php-backend/packages.php?action=delete_variant&id=${variantId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) throw new Error('Failed to delete variant');
      toast({ title: 'Variant deleted successfully' });
      if (editingId || editId) {
        loadPackageVariants(editingId || editId || '');
      }
    } catch (err: any) {
      toast({ title: 'Failed to delete variant', description: err.message, variant: 'destructive' });
    }
  };


  useEffect(() => {
    if (isEdit && editId && packages.length > 0) {
      const item = packages.find(p => p.id === editId);
      if (item) {
        setForm({
          name: item.name || '',
          slug: item.slug || '',
          price: Number(item.price) || 0,
          duration: item.duration || '',
          image: item.image || '',
          images: item.images || [],
          category: item.category || [],
          rating: Number(item.rating) || 5.0,
          reviews: Number(item.reviews) || 0,
          destinations: item.destinations || [],
          highlights: item.highlights || [],
          inclusions: item.inclusions || [],
          exclusions: item.exclusions || [],
          itinerary: item.itinerary || [],
          map_locations: item.map_locations || [],
          flight_routes: item.flight_routes || [],
          virtual_tour: item.virtual_tour || { destination: '', tourStops: [] },
          faqs: item.faqs || [],
          hotels: item.hotels || [],
          attractions: item.attractions || [],
          seo_title: item.seo_title || '',
          seo_description: item.seo_description || '',
          seo_keywords: item.seo_keywords || '',
          best_time: item.best_time || '',
          group_size: item.group_size || '',
          difficulty: item.difficulty || '',
          quick_facts: {
            groupSize: item.quick_facts?.groupSize || '',
            bestTime: item.quick_facts?.bestTime || '',
            difficulty: item.quick_facts?.difficulty || '',
            ageLimit: item.quick_facts?.ageLimit || 'All Ages',
            accommodation: item.quick_facts?.accommodation || 'Hotels',
            meals: item.quick_facts?.meals || 'Breakfast Included',
            transport: item.quick_facts?.transport || 'Private Transfers'
          },
          package_type: item.package_type || 'domestic',
          is_active: item.is_active !== false
        });
        setEditingId(item.id);

        // Fetch pre-seeded / DB itinerary if form itinerary is empty
        if (!item.itinerary || item.itinerary.length === 0) {
          itineraryService.getItinerary(item.slug || item.id).then(dbDays => {
            if (dbDays && dbDays.length > 0) {
              setForm(prev => ({
                ...prev,
                itinerary: dbDays.map(d => ({
                  day: d.day_number,
                  title: d.title,
                  description: d.description,
                  activities: d.activities || []
                }))
              }));
            }
          });
        }
      }
    } else if (!isEdit && !isFormView) {
      setForm({ ...BLANK_FORM });
      setEditingId(null);
    }
  }, [isEdit, editId, packages, isFormView]);

  const DEFAULT_PACKAGES_FALLBACK = [
    {
      id: '20c0788a-845d-11f1-bd23-d26dad1a7c21',
      name: 'Badrinath Ek Dham Yatra (3D/2N)',
      slug: 'badrinath-yatra',
      price: 12500,
      duration: '3 Days / 2 Nights',
      package_type: 'domestic',
      is_active: true,
      destinations: ['Haridwar', 'Joshimath', 'Badrinath Dham', 'Mana Village', 'Rishikesh'],
      image: '/Badrinath.png',
      hotels: [
        { name: 'Joshimath Himalayan Abode / Grand Hotel', location: 'Joshimath (Night 1)', destinationTag: 'Joshimath', category: 'Budget', stars: 3, room_type: 'Deluxe Mountain View', meal_plan: 'Breakfast & Dinner Included', cost_price: 3200, margin_percent: 25, selling_price: 4000, profit_amount: 800, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600' },
        { name: 'Sarovar Portico / Snow Crest Badrinath', location: 'Badrinath (Night 2)', destinationTag: 'Badrinath Dham', category: 'Deluxe', stars: 4, room_type: 'Deluxe Temple View Suite', meal_plan: 'Pure Veg Breakfast & Dinner', cost_price: 4500, margin_percent: 20, selling_price: 5400, profit_amount: 900, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600' }
      ],
      attractions: [
        { name: 'Badrinath Temple (10,279 ft)', description: 'Sacred abode of Lord Vishnu on the banks of Alaknanda River.', destinationTag: 'Badrinath Dham', image: '/Badrinath.png' },
        { name: 'Tapt Kund Hot Springs', description: 'Natural thermal sulfur springs for purifying dip prior to temple Darshan.', destinationTag: 'Badrinath Dham', image: '/Badrinath.png' },
        { name: 'Mana Village & Vyas Gufa', description: 'India\'s first border village where Maharishi Vyas composed the Mahabharata.', destinationTag: 'Mana Border', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800' }
      ]
    },
    { id: 'rann-utsav-3d2n', name: 'Rann Utsav Express Tent City Retreat (3D/2N)', slug: 'rann-utsav-3d2n', price: 18500, duration: '3 Days / 2 Nights', package_type: 'domestic', is_active: true, destinations: ['Tent City Dhordo', 'White Rann', 'Kalo Dungar', 'Bhuj'], image: '/Rann-Utsav-Gujarat.png' },
    { id: 'rann-utsav-4d3n', name: 'Grand Rann & Road to Heaven Dholavira Circuit (4D/3N)', slug: 'rann-utsav-4d3n', price: 24500, duration: '4 Days / 3 Nights', package_type: 'domestic', is_active: true, destinations: ['Tent City Dhordo', 'Road to Heaven', 'Dholavira', 'Mandvi Beach'], image: '/rann_utsav_road_to_heaven.jpg' },
    { id: 'rann-utsav-2d1n', name: 'Rann Utsav 2D/1N Express Overnight Tent City', slug: 'rann-utsav-2d1n', price: 12500, duration: '2 Days / 1 Night', package_type: 'domestic', is_active: true, destinations: ['Tent City Dhordo', 'White Rann Sunset'], image: '/Rann-Utsav-Gujarat.png' },
    { id: 'rann-utsav-5d4n', name: 'Complete Kutch Odyssey & Beach Resort Escape (5D/4N)', slug: 'rann-utsav-5d4n', price: 29500, duration: '5 Days / 4 Nights', package_type: 'domestic', is_active: true, destinations: ['Tent City Dhordo', 'Dholavira', 'Mandvi Beach', 'Lakhpat Fort'], image: '/Mandvi Beach_Kutch.png' },
    { id: 'char-dham-yatra', name: 'Char Dham Yatra Sacred Himalayan Circuit (10D/9N)', slug: 'char-dham-yatra', price: 26500, duration: '10 Days / 9 Nights', package_type: 'domestic', is_active: true, destinations: ['Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'], image: '/Kedarnath.png' },
    { id: 'classic-kashmir-5n6d', name: 'Classic Kashmir & Dal Lake Houseboat (6D/5N)', slug: 'classic-kashmir-5n6d', price: 21500, duration: '6 Days / 5 Nights', package_type: 'domestic', is_active: true, destinations: ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg'], image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=800' },
    { id: 'europe-grand-tour', name: 'Grand Europe 7-Country Exploration (12D/11N)', slug: 'europe-grand-tour', price: 185000, duration: '12 Days / 11 Nights', package_type: 'international', is_active: true, destinations: ['Paris', 'Swiss Alps', 'Venice', 'Rome', 'Amsterdam'], image: '/Europe Image New.png' },
    { id: 'singapore-5d4n', name: 'Singapore Sentosa & Universal Studios (5D/4N)', slug: 'singapore-5d4n', price: 48000, duration: '5 Days / 4 Nights', package_type: 'international', is_active: true, destinations: ['Universal Studios', 'Gardens by the Bay', 'Sentosa'], image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800' },
    { id: 'kerala-4d3n-munnar-alleppey', name: 'Munnar Tea Hills & Alleppey Houseboat (4D/3N)', slug: 'kerala-4d3n-munnar-alleppey', price: 16800, duration: '4 Days / 3 Nights', package_type: 'domestic', is_active: true, destinations: ['Munnar', 'Alleppey', 'Cochin'], image: '/kerala/alleppey_backwaters_houseboat.jpg' },
    { id: 'kerala-5d4n-tea-wildlife-backwaters', name: 'Kerala Tea, Wildlife & Backwaters Classic (5D/4N)', slug: 'kerala-5d4n-tea-wildlife-backwaters', price: 21500, duration: '5 Days / 4 Nights', package_type: 'domestic', is_active: true, destinations: ['Munnar', 'Thekkady', 'Alleppey'], image: '/kerala/thekkady_periyar_sanctuary.jpg' },
    { id: 'kerala-6d5n-hills-backwaters-kovalam', name: 'Grand Kerala Hills, Backwaters & Kovalam Beach (6D/5N)', slug: 'kerala-6d5n-hills-backwaters-kovalam', price: 26500, duration: '6 Days / 5 Nights', package_type: 'domestic', is_active: true, destinations: ['Munnar', 'Thekkady', 'Alleppey', 'Kovalam'], image: '/kerala/alleppey_backwaters_houseboat.jpg' },
    { id: 'kerala-7d6n-grand-kerala-kanyakumari', name: 'Complete Kerala & Kanyakumari Sunset Tour (7D/6N)', slug: 'kerala-7d6n-grand-kerala-kanyakumari', price: 31500, duration: '7 Days / 6 Nights', package_type: 'domestic', is_active: true, destinations: ['Munnar', 'Thekkady', 'Alleppey', 'Kovalam', 'Kanyakumari'], image: '/kerala/kovalam_lighthouse_beach.jpg' },
    { id: 'rajasthan-royal', name: 'Rajasthan Royal Forts & Lake Palaces (7D/6N)', slug: 'rajasthan-royal', price: 27500, duration: '7 Days / 6 Nights', package_type: 'domestic', is_active: true, destinations: ['Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer'], image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800' }
  ];

  const loadPackages = async () => {
    setLoading(true);
    try {
      const localStored = localStorage.getItem('crm_package_catalog');
      const localPackages = localStored ? JSON.parse(localStored) : null;

      const res = await fetch('/php-backend/packages.php');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const merged = localPackages && Array.isArray(localPackages) ? data.map((serverPkg: any) => {
            const localMatch = localPackages.find((lp: any) => lp.id === serverPkg.id || lp.slug === serverPkg.slug);
            return localMatch ? { ...serverPkg, ...localMatch } : serverPkg;
          }) : data;
          setPackages(merged);
          localStorage.setItem('crm_package_catalog', JSON.stringify(merged));
          return;
        }
      }
      setPackages(localPackages || DEFAULT_PACKAGES_FALLBACK);
    } catch (err: any) {
      console.warn('Backend unavailable, using catalog cache/fallback:', err);
      const localStored = localStorage.getItem('crm_package_catalog');
      const localPackages = localStored ? JSON.parse(localStored) : null;
      setPackages(localPackages || DEFAULT_PACKAGES_FALLBACK);
    } finally { setLoading(false); }
  };

  // Auto-generate slug from name
  const handleNameChange = (nameVal: string) => {
    const slugVal = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
      .replace(/\s+/g, '-'); // replace spaces with hyphens
    
    setForm(prev => ({
      ...prev,
      name: nameVal,
      slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') ? slugVal : prev.slug
    }));
  };

  // Toggle active status
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const pkg = packages.find(p => p.id === id);
      if (!pkg) return;

      const authHeaders = await getAuthHeader();
      const res = await fetch(`/php-backend/packages.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ ...pkg, is_active: !currentStatus })
      });

      if (!res.ok && res.status !== 401) throw new Error('Failed to update package status');

      setPackages(packages.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
      toast({ title: `Package ${!currentStatus ? 'activated' : 'deactivated'}` });
    } catch (err: any) {
      toast({ title: 'Failed to update package status', description: err.message, variant: 'destructive' });
    }
  };

  // Delete Package
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package? This cannot be undone.')) return;
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`/php-backend/packages.php?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) throw new Error('Failed to delete package');
      
      setPackages(packages.filter(p => p.id !== id));
      toast({ title: 'Package deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Failed to delete package', description: err.message, variant: 'destructive' });
    }
  };

  // ITINERARY BUILDER ACTIONS
  const addItineraryDay = () => {
    const nextDay = form.itinerary.length + 1;
    const newDayObj = {
      day: nextDay,
      title: `Day ${nextDay} Activity`,
      description: '',
      activities: []
    };
    setForm(prev => ({ ...prev, itinerary: [...prev.itinerary, newDayObj] }));
  };

  const removeItineraryDay = (index: number) => {
    const list = [...form.itinerary];
    list.splice(index, 1);
    // Re-index days
    const reindexed = list.map((item, idx) => ({ ...item, day: idx + 1 }));
    setForm(prev => ({ ...prev, itinerary: reindexed }));
  };

  const updateItineraryDay = (index: number, field: string, value: any) => {
    const list = [...form.itinerary];
    list[index] = { ...list[index], [field]: value };
    setForm(prev => ({ ...prev, itinerary: list }));
  };

  // MAP LOCATIONS ACTIONS
  const [mapLocName, setMapLocName] = useState('');
  const [mapLocLat, setMapLocLat] = useState('');
  const [mapLocLng, setMapLocLng] = useState('');
  const [mapLocDesc, setMapLocDesc] = useState('');

  const addMapLocation = () => {
    const name = mapLocName.trim();
    const lat = Number(mapLocLat);
    const lng = Number(mapLocLng);
    if (!name || isNaN(lat) || isNaN(lng)) {
      toast({ title: 'Invalid inputs', description: 'Coordinates and Name are required.', variant: 'destructive' });
      return;
    }
    const newLoc = { name, coordinates: [lat, lng], description: mapLocDesc.trim() };
    setForm(prev => ({ ...prev, map_locations: [...prev.map_locations, newLoc] }));
    setMapLocName('');
    setMapLocLat('');
    setMapLocLng('');
    setMapLocDesc('');
  };

  const removeMapLocation = (idx: number) => {
    setForm(prev => ({
      ...prev,
      map_locations: prev.map_locations.filter((_, i) => i !== idx)
    }));
  };

  // FLIGHT ROUTES ACTIONS
  const [flightFrom, setFlightFrom] = useState('');
  const [flightTo, setFlightTo] = useState('');
  const [flightDuration, setFlightDuration] = useState('');

  const addFlightRoute = () => {
    const from = flightFrom.trim();
    const to = flightTo.trim();
    const duration = flightDuration.trim();
    if (!from || !to || !duration) {
      toast({ title: 'Invalid inputs', description: 'From, To, and Duration are required.', variant: 'destructive' });
      return;
    }
    const newRoute = { from, to, duration };
    setForm(prev => ({ ...prev, flight_routes: [...prev.flight_routes, newRoute] }));
    setFlightFrom('');
    setFlightTo('');
    setFlightDuration('');
  };

  const removeFlightRoute = (idx: number) => {
    setForm(prev => ({
      ...prev,
      flight_routes: prev.flight_routes.filter((_, i) => i !== idx)
    }));
  };

  // FAQs ACTIONS
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');

  const addFAQ = () => {
    const question = faqQ.trim();
    const answer = faqA.trim();
    if (!question || !answer) {
      toast({ title: 'Missing details', description: 'Question and answer are required.', variant: 'destructive' });
      return;
    }
    setForm(prev => ({ ...prev, faqs: [...prev.faqs, { question, answer }] }));
    setFaqQ('');
    setFaqA('');
  };

  const removeFAQ = (idx: number) => {
    setForm(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== idx)
    }));
  };

  // Form Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: 'Validation Error', description: 'Name and Slug are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    
    // --- AUTOMATED PRICING & DATA VALIDATION ---
    const validationErrors: string[] = [];

    // 1. Verify price is a valid positive number
    const packagePrice = Number(form.price);
    if (isNaN(packagePrice) || packagePrice <= 0) {
      validationErrors.push("Price must be a valid positive number.");
    }

    // 2. Check for missing essential fields
    if (!form.name.trim()) validationErrors.push("Package Name is missing.");
    if (!form.slug.trim()) validationErrors.push("Package Slug is missing.");
    if (!form.duration.trim()) validationErrors.push("Package Duration is missing.");

      try {
        // 3. Check for duplicates in slug (excluding current editing package)
        const res = await fetch('/php-backend/packages.php');
        if (res.ok) {
          const allPkgs = await res.json();
          const duplicate = allPkgs.find((p: any) => p.slug === form.slug.trim() && p.id !== (editingId || '00000000-0000-0000-0000-000000000000'));
          if (duplicate) {
            validationErrors.push(`Duplicate Slug Error: Slug "${form.slug.trim()}" is already in use by package "${duplicate.name}".`);
          }
        }
      } catch (dbErr: any) {
        console.warn("Database check error:", dbErr.message);
      }

    if (validationErrors.length > 0) {
      console.warn("Package Validation Inconsistencies Logged:", validationErrors);
      try {
        const authHeaders = await getAuthHeader();
        const { data: userData } = await supabase.auth.getUser();
        
        await fetch(`${API_BASE}/audit_logs.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({
            action: 'package_validation_failure',
            new_value: JSON.stringify({ 
              package_name: form.name, 
              slug: form.slug, 
              errors: validationErrors 
            }),
            user_email: userData?.user?.email || 'unknown',
            user_name: userData?.user?.email || 'CRM System'
          })
        });
      } catch (logErr) {
        console.error("Failed to log validation error to audit_logs:", logErr);
      }

      toast({ 
        title: 'Validation & Consistency Error', 
        description: validationErrors.join(' | '), 
        variant: 'destructive' 
      });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        price: Number(form.price) || 0,
        duration: form.duration.trim(),
        image: form.image.trim(),
        images: form.images,
        category: form.category,
        rating: Number(form.rating) || 5.0,
        reviews: Number(form.reviews) || 0,
        destinations: form.destinations,
        highlights: form.highlights,
        inclusions: form.inclusions,
        exclusions: form.exclusions,
        itinerary: form.itinerary,
        map_locations: form.map_locations,
        flight_routes: form.flight_routes,
        virtual_tour: form.virtual_tour,
        faqs: form.faqs,
        seo_title: form.seo_title.trim(),
        seo_description: form.seo_description.trim(),
        seo_keywords: form.seo_keywords.trim(),
        best_time: form.best_time.trim(),
        group_size: form.group_size.trim(),
        difficulty: form.difficulty.trim(),
        quick_facts: form.quick_facts,
        package_type: form.package_type,
        is_active: form.is_active,
        updated_at: new Date().toISOString()
      };

      const authHeaders = await getAuthHeader();

      let res: Response;
      if (editingId) {
        res = await fetch(`/php-backend/packages.php?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/php-backend/packages.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(payload)
        });
      }

      // Save day-by-day itinerary to DB / local DB storage cache
      if (form.slug && form.itinerary) {
        await itineraryService.saveItinerary(form.slug, form.itinerary.map(day => ({
          day_number: day.day,
          title: day.title,
          description: day.description,
          activities: day.activities
        })));
      }

      // Always save updated payload into localStorage catalog cache as well
      setPackages(prev => {
        const nextState = editingId
          ? prev.map(p => p.id === editingId ? { ...p, ...payload, id: editingId } : p)
          : [{ id: payload.slug || Date.now().toString(), ...payload }, ...prev];
        localStorage.setItem('crm_package_catalog', JSON.stringify(nextState));
        return nextState;
      });

      if (res.status === 401) {
        toast({
          title: 'Saved to Catalog Cache',
          description: 'Package changes updated locally.'
        });
        navigate('/crm/packages');
        return;
      }

      if (!res.ok) throw new Error(`Server status ${res.status}: Failed to save package`);
      toast({ title: editingId ? 'Package updated successfully!' : 'Package created successfully!' });

      loadPackages();
      navigate('/crm/packages');
    } catch (err: any) {
      toast({ title: 'Failed to save package', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Filter combined
  const filteredList = packages.filter(p => {
    const q = search.trim().toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || (p.destinations && p.destinations.some((d: string) => d.toLowerCase().includes(q)));
    const matchesType = filterType === 'all' ? true : p.package_type === filterType;
    const matchesStatus = filterStatus === 'all' ? true :
                         filterStatus === 'active' ? p.is_active === true : p.is_active === false;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 rounded-2xl border border-border/50 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            {isFormView ? (isEdit ? 'Edit Tour Package' : 'Create Tour Package') : 'Tour Packages Directory'}
          </h2>
          <p className="text-slate-300 text-xs font-medium">
            {isFormView ? 'Define pricing, rich timeline itineraries, route coordinates, and SEO metadata.' : 'Create and manage dynamic travel itineraries published on the main portal.'}
          </p>
        </div>
        {!isFormView && (
          <Button onClick={() => navigate('/crm/packages/new')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 self-stretch sm:self-auto rounded-xl">
            <Plus className="w-4 h-4" /> New Package
          </Button>
        )}
        {isFormView && (
          <Button 
            type="button"
            onClick={() => navigate('/crm/packages')} 
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold border border-amber-500/40 hover:border-amber-400 text-xs gap-2 self-stretch sm:self-auto rounded-xl px-4 py-2 shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 font-bold" /> Back to Catalog
          </Button>
        )}
      </div>

      {/* KPI STAT CARDS */}
      {!isFormView && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-white">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Catalog Packages</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{packages.length}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-white">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Domestic Tours</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {packages.filter(p => p.package_type === 'domestic' || !p.package_type).length}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-white">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">International Tours</div>
            <div className="text-2xl font-extrabold text-sky-400 mt-1">
              {packages.filter(p => p.package_type === 'international').length}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-white">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Published</div>
            <div className="text-2xl font-extrabold text-[#C9A25A] mt-1">
              {packages.filter(p => p.is_active !== false).length}
            </div>
          </div>
        </div>
      )}

      {/* DIRECTORY VIEW */}
      {!isFormView && (
        <Card className="border border-slate-800 bg-slate-950 text-white shadow-xl">
          <CardHeader className="p-5 border-b border-slate-800 bg-slate-900/60">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by package name or destinations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9.5 text-xs rounded-xl bg-slate-900 border-slate-700 text-white placeholder:text-slate-400 focus:border-amber-500"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px] h-9.5 text-xs rounded-xl bg-slate-900 border-slate-700 text-slate-100 font-medium hover:bg-slate-800">
                    <SelectValue placeholder="Package Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="all" className="focus:bg-slate-800 focus:text-amber-400">All Types</SelectItem>
                    <SelectItem value="domestic" className="focus:bg-slate-800 focus:text-amber-400">Domestic</SelectItem>
                    <SelectItem value="international" className="focus:bg-slate-800 focus:text-amber-400">International</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px] h-9.5 text-xs rounded-xl bg-slate-900 border-slate-700 text-slate-100 font-medium hover:bg-slate-800">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="all" className="focus:bg-slate-800 focus:text-amber-400">All Status</SelectItem>
                    <SelectItem value="active" className="focus:bg-slate-800 focus:text-amber-400">Active Only</SelectItem>
                    <SelectItem value="inactive" className="focus:bg-slate-800 focus:text-amber-400">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs font-bold text-slate-400 tracking-wider">Loading packages...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="font-semibold mb-1 text-slate-200">No Packages Found</p>
                <p className="text-slate-400">Create a new package or adjust your search filter.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-900/90 border-b border-slate-800">
                  <TableRow className="border-b border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Package Name</TableHead>
                    <TableHead className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Slug (Route)</TableHead>
                    <TableHead className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Duration</TableHead>
                    <TableHead className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Costing</TableHead>
                    <TableHead className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Type</TableHead>
                    <TableHead className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Status</TableHead>
                    <TableHead className="text-right text-slate-300 font-bold uppercase tracking-wider text-[11px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-800/60">
                  {filteredList.map((pkg) => (
                    <TableRow key={pkg.id} className="border-b border-slate-800/80 hover:bg-slate-900/60 transition-colors">
                      <TableCell className="font-semibold text-xs py-3.5">
                        <div className="text-slate-100 font-bold text-sm">{pkg.name}</div>
                        <div className="text-amber-400/90 text-xs font-medium mt-0.5">
                          {pkg.destinations && pkg.destinations.join(' → ')}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-sky-400 font-mono">
                        /packages/{pkg.slug || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300 font-medium">{pkg.duration || '-'}</TableCell>
                      <TableCell className="text-xs font-extrabold text-emerald-400">
                        ₹{(Number(pkg.price) || 0).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize text-[10px] font-bold border ${pkg.package_type === 'international' ? 'bg-sky-950/60 text-sky-400 border-sky-800' : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'}`}>
                          {pkg.package_type || 'domestic'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={pkg.is_active !== false}
                            onCheckedChange={() => toggleStatus(pkg.id, pkg.is_active !== false)}
                          />
                          <span className={`text-[10px] font-extrabold ${pkg.is_active !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {pkg.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/crm/itineraries?source_package=${pkg.id}`)}
                            className="h-8 px-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300 font-extrabold text-[10px] gap-1"
                            title="Build Customer Itinerary from this Package Template"
                          >
                            <Send className="w-3 h-3" /> Build Itinerary
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/packages/${pkg.slug || 'rann-utsav-3d2n'}`, '_blank')}
                            className="h-8 w-8 p-0 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300"
                            title="Preview Live Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/crm/packages/edit/${pkg.id}`)}
                            className="h-8 w-8 p-0 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                            title="Edit Package"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(pkg.id)}
                            className="h-8 w-8 p-0 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                            title="Delete Package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* CREATE & EDIT FORM WORKSPACE */}
      {isFormView && (
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="border border-slate-800 bg-slate-950 text-white shadow-2xl">
            <CardHeader className="p-5 border-b border-slate-800 bg-slate-900/80">
              <div className="flex flex-wrap gap-2 justify-between items-center">
                <CardDescription className="text-xs font-semibold text-slate-300">
                  Complete all tabs to compile a professional travel catalog entry.
                </CardDescription>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs mr-3 border-r border-slate-700 pr-4">
                    <Label htmlFor="pkg-status-toggle" className="text-xs font-bold text-slate-300 cursor-pointer">Active Catalog Entry</Label>
                    <Switch
                      id="pkg-status-toggle"
                      checked={form.is_active}
                      onCheckedChange={v => setForm(prev => ({ ...prev, is_active: v }))}
                    />
                  </div>
                  <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl px-4 py-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isEdit ? 'Update Package' : 'Create Package'}
                  </Button>
                </div>
              </div>

              {/* Sub tabs navigation */}
              <div className="flex flex-wrap gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl mt-4 max-w-fit">
                {[
                  { id: 'basic', label: 'Basic Details', icon: Info },
                  { id: 'lists', label: 'Highlights & Inclusions', icon: Tag },
                  { id: 'hotels_attractions', label: 'Hotels & Attractions', icon: Building2 },
                  { id: 'itinerary', label: 'Day Timeline', icon: Calendar },
                  { id: 'map', label: 'Map & Routes', icon: Map },
                  { id: 'seo', label: 'FAQs & SEO Meta', icon: Globe },
                  { id: 'variants', label: 'Package Variants & Tiers', icon: Sparkles }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeSubTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSubTab(tab.id)}
                      className={`text-xs gap-1.5 h-8.5 rounded-lg font-bold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </Button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* TAB 1: BASIC DETAILS */}
              {activeSubTab === 'basic' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Package Title / Name</Label>
                      <Input
                        value={form.name}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder="e.g., 5-Day Dubai Delights: Desert Safari & Burj Khalifa"
                        required
                        className="h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Route Slug (Unique URL)</Label>
                      <Input
                        value={form.slug}
                        onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="e.g., dubai-delights"
                        required
                        className="h-10 text-sm font-mono bg-slate-900 border-slate-700 text-sky-400 placeholder:text-slate-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Starting Price (₹)</Label>
                      <Input
                        type="number"
                        value={form.price || ''}
                        onChange={e => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="e.g., 45000"
                        required
                        className="h-10 text-sm font-extrabold bg-slate-900 border-slate-700 text-emerald-400 focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Duration String</Label>
                      <Input
                        value={form.duration}
                        onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 5 Days / 4 Nights"
                        required
                        className="h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Package Type</Label>
                      <Select
                        value={form.package_type}
                        onValueChange={v => setForm(prev => ({ ...prev, package_type: v }))}
                      >
                        <SelectTrigger className="h-10 text-sm bg-slate-900 border-slate-700 text-white font-medium">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                          <SelectItem value="domestic" className="focus:bg-slate-800 focus:text-amber-400">Domestic</SelectItem>
                          <SelectItem value="international" className="focus:bg-slate-800 focus:text-amber-400">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Difficulty Level</Label>
                      <Input
                        value={form.difficulty}
                        onChange={e => setForm(prev => ({
                          ...prev,
                          difficulty: e.target.value,
                          quick_facts: { ...prev.quick_facts, difficulty: e.target.value }
                        }))}
                        placeholder="e.g., Easy, Moderate"
                        className="h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Best Time to Visit</Label>
                      <Input
                        value={form.best_time}
                        onChange={e => setForm(prev => ({
                          ...prev,
                          best_time: e.target.value,
                          quick_facts: { ...prev.quick_facts, bestTime: e.target.value }
                        }))}
                        placeholder="e.g., November to March"
                        className="h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Group Size</Label>
                      <Input
                        value={form.group_size}
                        onChange={e => setForm(prev => ({
                          ...prev,
                          group_size: e.target.value,
                          quick_facts: { ...prev.quick_facts, groupSize: e.target.value }
                        }))}
                        placeholder="e.g., 2-20 People"
                        className="h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Rating Score</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={form.rating || ''}
                        onChange={e => setForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        placeholder="e.g., 4.8"
                        className="h-10 text-sm bg-slate-900 border-slate-700 text-amber-400 focus:border-amber-500 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Review Count</Label>
                      <Input
                        type="number"
                        value={form.reviews || ''}
                        onChange={e => setForm(prev => ({ ...prev, reviews: Number(e.target.value) }))}
                        placeholder="e.g., 178"
                        className="h-10 text-sm bg-slate-900 border-slate-700 text-white focus:border-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Primary Hero Image URL</Label>
                    <Input
                      value={form.image}
                      onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="e.g., https://images.unsplash.com/photo-1512453979798-5ea266f8880c"
                      required
                      className="h-10 text-sm bg-slate-900 border-slate-700 text-sky-400 focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TagInput
                      label="Destinations covered (e.g. Dubai, Abu Dhabi)"
                      items={form.destinations}
                      onChange={items => setForm(prev => ({ ...prev, destinations: items }))}
                      placeholder="Type destination and press Enter"
                      colorClass="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    />
                    <TagInput
                      label="Categories for Filter mapping (e.g. premium, honeymoon)"
                      items={form.category}
                      onChange={items => setForm(prev => ({ ...prev, category: items }))}
                      placeholder="Type category and press Enter"
                      colorClass="bg-amber-500/10 text-amber-400 border-amber-500/30"
                    />
                  </div>

                  <TagInput
                    label="Image Gallery Slider URLs (Optional)"
                    items={form.images}
                    onChange={items => setForm(prev => ({ ...prev, images: items }))}
                    placeholder="Paste image URL and press Enter"
                    colorClass="bg-sky-500/10 text-sky-400 border-sky-500/30"
                  />

                  {/* QUICK FACTS METADATA */}
                  <div className="border-t border-slate-800 pt-6">
                    <h3 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                      <Info className="w-4 h-4 text-amber-400" /> Sidebar Quick Facts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Accommodation Fact</Label>
                        <Input
                          value={form.quick_facts?.accommodation || ''}
                          onChange={e => setForm(prev => ({
                            ...prev,
                            quick_facts: { ...(prev.quick_facts || {}), accommodation: e.target.value }
                          }))}
                          placeholder="e.g., 4-5 Star Hotels"
                          className="h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Meals Fact</Label>
                        <Input
                          value={form.quick_facts?.meals || ''}
                          onChange={e => setForm(prev => ({
                            ...prev,
                            quick_facts: { ...(prev.quick_facts || {}), meals: e.target.value }
                          }))}
                          placeholder="e.g., Breakfast Included"
                          className="h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Transport Fact</Label>
                        <Input
                          value={form.quick_facts?.transport || ''}
                          onChange={e => setForm(prev => ({
                            ...prev,
                            quick_facts: { ...(prev.quick_facts || {}), transport: e.target.value }
                          }))}
                          placeholder="e.g., AC Cars & Transfers"
                          className="h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Age Limit Fact</Label>
                        <Input
                          value={form.quick_facts?.ageLimit || ''}
                          onChange={e => setForm(prev => ({
                            ...prev,
                            quick_facts: { ...(prev.quick_facts || {}), ageLimit: e.target.value }
                          }))}
                          placeholder="e.g., 4 - 70 Years"
                          className="h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LISTS */}
              {activeSubTab === 'lists' && (
                <div className="space-y-6 animate-fade-in">
                  <TagInput
                    label="Highlights Bullet Points"
                    items={form.highlights}
                    onChange={items => setForm(prev => ({ ...prev, highlights: items }))}
                    placeholder="e.g., Burj Khalifa entry tickets (Press Enter to Add)"
                    colorClass="bg-amber-500/10 text-amber-500 border-amber-500/20"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TagInput
                      label="Inclusions list"
                      items={form.inclusions}
                      onChange={items => setForm(prev => ({ ...prev, inclusions: items }))}
                      placeholder="e.g., 4-star hotel stay with breakfast (Press Enter)"
                      colorClass="bg-green-600/10 text-green-600 border-green-600/20"
                    />
                    <TagInput
                      label="Exclusions list"
                      items={form.exclusions}
                      onChange={items => setForm(prev => ({ ...prev, exclusions: items }))}
                      placeholder="e.g., Flight tickets (India-Dubai) (Press Enter)"
                      colorClass="bg-red-600/10 text-red-600 border-red-600/20"
                    />
                  </div>
                </div>
              )}

              {/* TAB: HOTELS & ATTRACTIONS (MULTI-DESTINATION) */}
              {activeSubTab === 'hotels_attractions' && (
                <div className="space-y-10 animate-fade-in">
                  
                  {/* SECTION 1: SELECTED HOTELS & STAYS */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                        <Building2 className="w-4 h-4 text-amber-400" /> Multi-Destination Hotels & Stays
                      </h3>
                      <p className="text-xs text-slate-400">Define hotels for each destination stop (e.g., Joshimath, Badrinath Dham, Kedarnath, Haridwar).</p>
                    </div>

                    {/* SEQUENCE FORM: City -> Hotel Category -> Hotel Name (Picked from Hotel Master) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl items-end shadow-lg">
                      {/* Sequence 1: Searchable City / Destination Picker */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> 1. City / Destination (Searchable)
                        </Label>

                        <Popover open={citySearchOpen} onOpenChange={setCitySearchOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={citySearchOpen}
                              className="w-full h-9.5 text-xs bg-slate-950 border-slate-700 text-amber-400 font-bold justify-between hover:bg-slate-900 hover:text-amber-300"
                            >
                              <span className="truncate flex items-center gap-1.5">
                                📍 {hotelLocation || "Search & Select City..."}
                              </span>
                              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50 text-amber-400" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[280px] p-2.5 bg-slate-900 border-slate-700 text-white shadow-2xl z-50 rounded-xl space-y-2">
                            {/* Search Input Box */}
                            <div className="relative">
                              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-amber-400" />
                              <Input
                                placeholder="Search city (e.g. Dhordo, Sitapur)..."
                                value={citySearchQuery}
                                onChange={(e) => setCitySearchQuery(e.target.value)}
                                className="h-8 pl-8 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
                                autoFocus
                              />
                            </div>

                            {/* Quick Region Badges */}
                            <div className="flex flex-wrap gap-1 px-0.5 py-1 border-b border-slate-800">
                              <span className="text-[9px] text-slate-400 font-bold w-full uppercase">Quick Regions:</span>
                              {['All', 'Char Dham', 'Rann Kutch', 'Kerala', 'Kashmir'].map((region) => (
                                <button
                                  key={region}
                                  type="button"
                                  onClick={() => setCityRegionFilter(region)}
                                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                                    cityRegionFilter === region 
                                      ? 'bg-amber-500 text-slate-950' 
                                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                  }`}
                                >
                                  {region}
                                </button>
                              ))}
                            </div>

                            {/* City Scrollable List */}
                            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
                              {filteredCitiesList.length === 0 ? (
                                <div className="p-3 text-center text-xs text-slate-400">
                                  No city matching "{citySearchQuery}"
                                </div>
                              ) : (
                                filteredCitiesList.map((cityName, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setHotelLocation(cityName);
                                      setHotelName('');
                                      setCitySearchOpen(false);
                                      setCitySearchQuery('');
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                                      hotelLocation === cityName
                                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                                        : 'hover:bg-slate-800 text-slate-200'
                                    }`}
                                  >
                                    <span>📍 {cityName}</span>
                                    {hotelLocation === cityName && <Check className="w-3.5 h-3.5 text-amber-400" />}
                                  </button>
                                ))
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Sequence 2: Hotel Category */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" /> 2. Hotel Category
                        </Label>
                        <Select value={hotelCategory} onValueChange={v => {
                          setHotelCategory(v);
                          setHotelName('');
                        }}>
                          <SelectTrigger className="h-9.5 text-xs bg-slate-950 border-slate-700 text-sky-400 font-bold">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700 text-white">
                            <SelectItem value="Budget">🏷️ Budget / Standard (2★-3★)</SelectItem>
                            <SelectItem value="Deluxe">⭐ Deluxe (3★-4★)</SelectItem>
                            <SelectItem value="Luxury">👑 Super Deluxe / Luxury (4★-5★)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sequence 3: Hotel Name Dropdown (Loaded from Hotel Master Page) */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> 3. Hotel Name (Picked from Master)
                        </Label>
                        {(() => {
                          const contractedOptions = getHotelsForCityAndCategory(hotelLocation, hotelCategory);
                          return (
                            <Select value={hotelName} onValueChange={v => {
                              setHotelName(v);
                              const sel = contractedOptions.find((o: any) => o.name === v);
                              if (sel) {
                                setHotelStars(sel.stars);
                                setHotelRoomType(sel.defaultRoom);
                                if (sel.cost_price) setHotelCostPrice(sel.cost_price);
                                if (sel.margin_percent) setHotelMarginPercent(sel.margin_percent);
                              }
                            }}>
                              <SelectTrigger className="h-9.5 text-xs bg-slate-950 border-slate-700 text-emerald-400 font-bold">
                                <SelectValue placeholder={contractedOptions.length ? `Select ${hotelCategory} Hotel in ${hotelLocation}` : `No ${hotelCategory} hotel found in ${hotelLocation}`} />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-60 z-50">
                                {contractedOptions.map((opt, i) => (
                                  <SelectItem key={`hotel-${opt.name}-${i}`} value={opt.name}>
                                    🏨 {opt.name} ({opt.stars}★)
                                  </SelectItem>
                                ))}
                                <SelectItem value="__custom__">➕ Enter Custom Hotel Name...</SelectItem>
                              </SelectContent>
                            </Select>
                          );
                        })()}
                      </div>

                      {/* Custom Hotel Input if selected */}
                      {hotelName === '__custom__' && (
                        <div className="space-y-1.5 md:col-span-3">
                          <Label className="text-[10px] font-bold text-slate-300 uppercase">Custom Hotel Name</Label>
                          <Input
                            placeholder="Type custom hotel name..."
                            value={customHotelName}
                            onChange={e => setCustomHotelName(e.target.value)}
                            className="h-9 text-xs bg-slate-950 border-slate-700 text-white"
                          />
                        </div>
                      )}

                      {/* Room Type Dropdown - DYNAMICALLY PICKED FROM DATABASE FOR THIS SPECIFIC HOTEL */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase flex items-center justify-between">
                          <span>Room Type</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">Dynamic DB Room Types</span>
                        </Label>
                        {(() => {
                          const contractedOptions = getHotelsForCityAndCategory(hotelLocation, hotelCategory);
                          const selectedHotelObj = contractedOptions.find((o: any) => o.name === hotelName);

                          const dynamicDbRooms: string[] = [];

                          if (selectedHotelObj) {
                            if (Array.isArray(selectedHotelObj.roomTypes)) {
                              dynamicDbRooms.push(...selectedHotelObj.roomTypes);
                            }
                            if (selectedHotelObj.defaultRoom) {
                              dynamicDbRooms.push(selectedHotelObj.defaultRoom);
                            }
                            if (selectedHotelObj.raw) {
                              if (selectedHotelObj.raw.room_type) dynamicDbRooms.push(selectedHotelObj.raw.room_type);
                              if (Array.isArray(selectedHotelObj.raw.rates)) {
                                selectedHotelObj.raw.rates.forEach((r: any) => { if (r.room_type) dynamicDbRooms.push(r.room_type); });
                              }
                              if (Array.isArray(selectedHotelObj.raw.contracts)) {
                                selectedHotelObj.raw.contracts.forEach((c: any) => { if (c.room_type) dynamicDbRooms.push(c.room_type); });
                              }
                            }
                          }

                          const hotelRoomOptions = Array.from(new Set(dynamicDbRooms.map(r => String(r).trim()))).filter(Boolean);

                          if (hotelRoomOptions.length === 0) {
                            hotelRoomOptions.push("Standard Room");
                          }

                          const isCustomRoom = hotelRoomType && !hotelRoomOptions.includes(hotelRoomType);

                          return (
                            <div className="space-y-1.5">
                              <Select 
                                value={isCustomRoom ? "__custom__" : (hotelRoomType || hotelRoomOptions[0])} 
                                onValueChange={v => {
                                  if (v === '__custom__') {
                                    setHotelRoomType('');
                                  } else {
                                    setHotelRoomType(v);
                                  }
                                }}
                              >
                                <SelectTrigger className="h-9.5 text-xs bg-slate-950 border-slate-700 text-[#E5C378] font-bold">
                                  <SelectValue placeholder="Select Database Room Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-60 z-50">
                                  {hotelRoomOptions.map((rt, i) => (
                                    <SelectItem key={`db-rt-${rt}-${i}`} value={rt}>
                                      🛏️ {rt}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="__custom__">➕ Enter Custom Room Type...</SelectItem>
                                </SelectContent>
                              </Select>

                              {(isCustomRoom || hotelRoomType === '') && (
                                <Input
                                  placeholder="Type custom room type..."
                                  value={hotelRoomType}
                                  onChange={e => setHotelRoomType(e.target.value)}
                                  className="h-9 text-xs bg-slate-950 border-amber-500/50 text-white font-medium mt-1.5"
                                />
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Meal Plan Dropdown */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase flex items-center justify-between">
                          <span>Meal Plan</span>
                          <span className="text-[10px] text-amber-400 font-mono">Select or Custom</span>
                        </Label>
                        {(() => {
                          const mealOptions = [
                            "Breakfast & Dinner Included (MAP)",
                            "Breakfast Included (CP)",
                            "All Meals Included (AP - Breakfast, Lunch & Dinner)",
                            "Room Only (EP)"
                          ];
                          const isCustomMeal = hotelMealPlan && !mealOptions.includes(hotelMealPlan);

                          return (
                            <div className="space-y-1.5">
                              <Select 
                                value={isCustomMeal ? "__custom__" : (hotelMealPlan || mealOptions[0])} 
                                onValueChange={v => {
                                  if (v === '__custom__') {
                                    setHotelMealPlan('');
                                  } else {
                                    setHotelMealPlan(v);
                                  }
                                }}
                              >
                                <SelectTrigger className="h-9.5 text-xs bg-slate-950 border-slate-700 text-white font-medium">
                                  <SelectValue placeholder="Select Meal Plan" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-60 z-50">
                                  {mealOptions.map((mp, i) => (
                                    <SelectItem key={`mp-${mp}-${i}`} value={mp}>
                                      🍽️ {mp}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="__custom__">➕ Enter Custom Meal Plan...</SelectItem>
                                </SelectContent>
                              </Select>

                              {(isCustomMeal || hotelMealPlan === '') && (
                                <Input
                                  placeholder="Type custom meal plan..."
                                  value={hotelMealPlan}
                                  onChange={e => setHotelMealPlan(e.target.value)}
                                  className="h-9 text-xs bg-slate-950 border-amber-500/50 text-white font-medium mt-1.5"
                                />
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Explicit Profit Markup % */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-emerald-400 uppercase">Explicit Profit Markup %</Label>
                        <Input
                          type="number"
                          placeholder="20"
                          value={hotelMarginPercent}
                          onChange={e => setHotelMarginPercent(Number(e.target.value))}
                          className="h-9.5 text-xs bg-slate-950 border-slate-700 text-emerald-400 font-mono font-bold"
                        />
                      </div>

                      <Button type="button" onClick={addHotel} className="h-9.5 text-xs font-bold md:col-span-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950">
                        <Plus className="w-4 h-4 mr-1" /> Add {hotelCategory} Hotel to Package
                      </Button>
                    </div>

                    {/* Category Sequence Filter Bar & Hotel Cards List */}
                    {form.hotels && form.hotels.length > 0 ? (
                      <div className="space-y-4 pt-2">
                        {/* Category Sequence Filter Bar */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2">Display Filter:</span>
                            {['All', 'Budget', 'Deluxe', 'Luxury'].map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setHotelListCategoryFilter(cat)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors border ${
                                  hotelListCategoryFilter === cat
                                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {cat === 'All' ? 'All Hotels' : `${cat} Hotels Only`}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {form.hotels
                            .filter((h: any) => {
                              if (hotelListCategoryFilter === 'All') return true;
                              const hotelCat = h.category || (h.stars === 3 ? 'Budget' : 'Deluxe');
                              return hotelCat.toLowerCase() === hotelListCategoryFilter.toLowerCase();
                            })
                            .map((h: any, idx: number) => {
                            const costP = Number(h.cost_price || 3200);
                            const marginP = Number(h.margin_percent || 20);
                            const sellP = Number(h.selling_price || Math.round(costP * (1 + marginP / 100)));
                            const profitP = sellP - costP;
                            const hCat = h.category || (h.stars === 3 ? 'Budget' : 'Deluxe');

                            return (
                              <div key={idx} className="p-4 border border-slate-800 bg-slate-900 rounded-xl space-y-3 relative flex flex-col justify-between">
                                <div className="flex justify-between items-start gap-3">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px] uppercase">
                                        📍 {h.destinationTag || h.location || 'Destination'}
                                      </Badge>
                                      <Badge className="bg-sky-600 text-white font-bold text-[10px] uppercase">
                                        {hCat} Category
                                      </Badge>
                                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                        <Star className="w-3 h-3 fill-amber-400" /> {h.stars || h.star_category || 4} Star
                                      </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white">{h.name}</h4>
                                    <div className="text-xs text-slate-300">
                                      <span className="text-sky-400 font-semibold">{h.room_type || 'Deluxe Room'}</span> • {h.meal_plan || 'Breakfast Included'}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeHotel(idx)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0 shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Financial Explicit Markup Bar */}
                                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-[11px]">
                                  <span className="text-slate-400 font-medium">Explicit Profit Markup:</span>
                                  <span className="font-mono font-extrabold text-emerald-400">+{marginP}% Explicit Margin</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Hotel Financial Costing & Profitability Dashboard */}
                        {(() => {
                          const totalB2BCost = form.hotels.reduce((acc: number, h: any) => acc + Number(h.cost_price || 3200), 0);
                          const totalSellingPrice = form.hotels.reduce((acc: number, h: any) => acc + Number(h.selling_price || Math.round(Number(h.cost_price || 3200) * 1.2)), 0);
                          const totalHotelProfit = totalSellingPrice - totalB2BCost;
                          const avgMarginPercent = totalB2BCost > 0 ? Math.round((totalHotelProfit / totalB2BCost) * 100) : 20;

                          const packageRetailPrice = Number(form.price) || 0;
                          const netEstimatedProfitPerPax = packageRetailPrice - totalB2BCost;
                          const overallProfitPercent = packageRetailPrice > 0 ? Math.round((netEstimatedProfitPerPax / packageRetailPrice) * 100) : 0;

                          return (
                            <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl space-y-4 shadow-xl mt-4">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 font-bold">
                                    📊
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                      Hotel Contracting Financials & Profit Calculator
                                    </h4>
                                    <p className="text-[11px] text-slate-400">
                                      Live automated calculations based on city B2B cost rates & configured margins.
                                    </p>
                                  </div>
                                </div>

                                <Badge className={`px-3 py-1 font-bold text-xs uppercase ${
                                  overallProfitPercent >= 20 
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                    : overallProfitPercent >= 10
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                }`}>
                                  {overallProfitPercent >= 20 ? '🟢 Healthy Profit Margin' : overallProfitPercent >= 10 ? '🟡 Moderate Margin' : '🔴 Low Margin Alert'} ({overallProfitPercent}%)
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total B2B Hotel Cost</span>
                                  <span className="text-sm font-extrabold text-slate-200">₹{totalB2BCost.toLocaleString('en-IN')}</span>
                                  <span className="text-[9px] text-slate-500 block">Sum of city B2B cost rates</span>
                                </div>

                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Hotel Retail Value</span>
                                  <span className="text-sm font-extrabold text-sky-400">₹{totalSellingPrice.toLocaleString('en-IN')}</span>
                                  <span className="text-[9px] text-slate-500 block">Sum of selling rates</span>
                                </div>

                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Hotel Profit Margin</span>
                                  <span className="text-sm font-extrabold text-emerald-400">+₹{totalHotelProfit.toLocaleString('en-IN')}</span>
                                  <span className="text-[9px] text-emerald-400/80 block">Avg Margin: {avgMarginPercent}%</span>
                                </div>

                                <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30 space-y-1">
                                  <span className="text-[10px] text-amber-300 uppercase tracking-wider block">Net Est. Profit / Pax</span>
                                  <span className="text-sm font-extrabold text-amber-400">₹{netEstimatedProfitPerPax.toLocaleString('en-IN')}</span>
                                  <span className="text-[9px] text-slate-400 block">(Base Fare ₹{packageRetailPrice.toLocaleString('en-IN')} - B2B Cost)</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-400">
                        No hotels added yet. Use the form above to add hotels tagged with their destination stop.
                      </div>
                    )}
                  </div>

                  {/* SECTION 2: TOP ATTRACTIONS & HIGHLIGHTS */}
                  <div className="space-y-6 border-t border-slate-800 pt-8">
                    <div>
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-amber-400" /> Destination Attractions & Highlights
                      </h3>
                      <p className="text-xs text-slate-400">Add key attractions and tag them with their specific destination / location.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl items-end">
                      {/* DYNAMIC ATTRACTION TITLE DROPDOWN FROM DATABASE */}
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Attraction Title (Picked from Master Database)
                        </Label>
                        {(() => {
                          const isCustom = attTitle && !masterSightseeings.some((s: any) => (s.sightseeing_name || s.name || s.title) === attTitle);
                          return (
                            <div className="space-y-1.5">
                              <Select
                                value={isCustom ? "__custom__" : (attTitle || "")}
                                onValueChange={v => {
                                  if (v === '__custom__') {
                                    setAttTitle('');
                                  } else {
                                    setAttTitle(v);
                                    const selObj = masterSightseeings.find((s: any) => (s.sightseeing_name || s.name || s.title) === v);
                                    if (selObj) {
                                      if (selObj.destination || selObj.city) setAttLocation(selObj.destination || selObj.city);
                                      if (selObj.description) setAttDesc(selObj.description);
                                      if (selObj.image_url || selObj.image) setAttImage(selObj.image_url || selObj.image);
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger className="h-9.5 text-xs bg-slate-950 border-slate-700 text-emerald-400 font-bold">
                                  <SelectValue placeholder={masterSightseeings.length ? "Select Attraction from Master Database..." : "Select or Type Attraction Title..."} />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-60 z-50">
                                  {masterSightseeings.map((s: any, i: number) => {
                                    const sTitle = s.sightseeing_name || s.name || s.title;
                                    const sDest = s.destination || s.city || '';
                                    if (!sTitle) return null;
                                    return (
                                      <SelectItem key={`sight-${s.id || i}`} value={sTitle}>
                                        📍 {sTitle} {sDest ? `(${sDest})` : ''}
                                      </SelectItem>
                                    );
                                  })}
                                  <SelectItem value="__custom__">➕ Enter Custom Attraction Title...</SelectItem>
                                </SelectContent>
                              </Select>

                              {(isCustom || attTitle === '') && (
                                <Input
                                  placeholder="Type custom attraction title..."
                                  value={attTitle}
                                  onChange={e => setAttTitle(e.target.value)}
                                  className="h-9 text-xs bg-slate-950 border-amber-500/50 text-white font-medium mt-1.5"
                                />
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase">Destination Tag</Label>
                        <Input
                          placeholder="e.g., Badrinath Dham, Mana Border"
                          value={attLocation}
                          onChange={e => setAttLocation(e.target.value)}
                          className="h-9.5 text-xs bg-slate-950 border-slate-700 text-amber-400 placeholder:text-slate-500 font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-3">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase">Description Overview</Label>
                        <Textarea
                          placeholder="e.g., Sacred abode of Lord Vishnu on the banks of Alaknanda River."
                          value={attDesc}
                          onChange={e => setAttDesc(e.target.value)}
                          className="text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 min-h-[60px]"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-3">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase">Attraction Image URL (Optional)</Label>
                        <Input
                          placeholder="e.g., https://images.unsplash.com/photo-1544735716-392fe2489ffa"
                          value={attImage}
                          onChange={e => setAttImage(e.target.value)}
                          className="h-9 text-xs font-mono bg-slate-950 border-slate-700 text-sky-400"
                        />
                      </div>
                      <Button type="button" onClick={addAttraction} className="h-9.5 text-xs font-bold md:col-span-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white">
                        <Plus className="w-4 h-4 mr-1" /> Add Attraction to Package
                      </Button>
                    </div>

                    {/* Attraction Cards List */}
                    {form.attractions && form.attractions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {form.attractions.map((att: any, idx: number) => (
                          <div key={idx} className="p-4 border border-slate-800 bg-slate-900 rounded-xl space-y-2 relative flex justify-between items-start gap-3">
                            <div className="space-y-1">
                              <Badge className="bg-sky-600 text-white font-bold text-[10px] uppercase">
                                📍 {att.destinationTag || att.location || 'Sightseeing'}
                              </Badge>
                              <h4 className="text-sm font-bold text-white pt-1">{att.name}</h4>
                              {att.description && <p className="text-xs text-slate-300 leading-relaxed">{att.description}</p>}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeAttraction(idx)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-400">
                        No attractions added yet. Use the form above to add sightseeing spots tagged with their destination.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TIMELINE ITINERARY */}
              {activeSubTab === 'itinerary' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-amber-400" /> Day-by-Day Timeline Builder
                      </h3>
                      <p className="text-xs text-slate-400">Add and structure itinerary details for each day of the tour.</p>
                    </div>
                    <Button type="button" onClick={addItineraryDay} className="h-8.5 text-xs font-bold gap-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 px-3">
                      <Plus className="w-3.5 h-3.5" /> Add Day
                    </Button>
                  </div>

                  {form.itinerary.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-400">
                      No days added yet. Click "Add Day" to build the timeline.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {form.itinerary.map((day, idx) => (
                        <Card key={idx} className="border border-slate-800 bg-slate-900 text-white">
                          <CardHeader className="p-4 bg-slate-950 flex flex-row justify-between items-center rounded-t-xl border-b border-slate-800">
                            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Day {day.day}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItineraryDay(idx)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardHeader>
                          <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Day Title</Label>
                              <Input
                                value={day.title}
                                onChange={e => updateItineraryDay(idx, 'title', e.target.value)}
                                placeholder="e.g., Arrival in Dubai - Dhow Cruise Dinner"
                                className="h-9.5 text-sm bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Day Overview / Description</Label>
                              <Textarea
                                value={day.description}
                                onChange={e => updateItineraryDay(idx, 'description', e.target.value)}
                                placeholder="Write a short summary of the day's events..."
                                className="text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-medium min-h-[70px]"
                              />
                            </div>
                            <TagInput
                              label="Activities lists for this day"
                              items={day.activities || []}
                              onChange={items => updateItineraryDay(idx, 'activities', items)}
                              placeholder="e.g., Welcome pickup at Airport and hotel check-in (Press Enter)"
                              colorClass="bg-sky-500/10 text-sky-400 border-sky-500/30"
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MAP & FLIGHT ROUTES */}
              {activeSubTab === 'map' && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* MAP MARKERS */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <MapPin className="w-4 h-4 text-amber-400" /> Interactive Route Map Markers
                      </h3>
                      <p className="text-xs text-slate-400">Add map coordinate markers for routing visualization.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl items-end">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase">Location Name</Label>
                        <Input
                          placeholder="e.g., Dubai"
                          value={mapLocName}
                          onChange={e => setMapLocName(e.target.value)}
                          className="h-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase">Latitude (Dec)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="e.g., 25.2048"
                          value={mapLocLat}
                          onChange={e => setMapLocLat(e.target.value)}
                          className="h-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase">Longitude (Dec)</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="e.g., 55.2708"
                          value={mapLocLng}
                          onChange={e => setMapLocLng(e.target.value)}
                          className="h-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase">Short Note (Optional)</Label>
                        <Input
                          placeholder="e.g., Hotel stay location"
                          value={mapLocDesc}
                          onChange={e => setMapLocDesc(e.target.value)}
                          className="h-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <Button type="button" onClick={addMapLocation} size="sm" className="h-9 text-xs font-bold md:col-span-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Location Marker
                      </Button>
                    </div>

                    {form.map_locations.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {form.map_locations.map((loc, idx) => (
                          <Badge key={idx} variant="secondary" className="px-2.5 py-1 text-xs gap-1.5 border border-slate-700 bg-slate-900 text-slate-200">
                            <span className="font-semibold">{loc.name}</span>
                            <span className="text-[10px] text-sky-400 font-mono">[{loc.coordinates.join(', ')}]</span>
                            <button type="button" onClick={() => removeMapLocation(idx)} className="text-red-400 hover:text-red-300">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* FLIGHT ROUTES */}
                  <div className="space-y-4 border-t border-slate-800 pt-6">
                    <div>
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Plane className="w-4 h-4 text-amber-400" /> Flight Routing Reference
                      </h3>
                      <p className="text-xs text-slate-400">Define standard flight sectors and durations for the sidebar map.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl items-end">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase">Depart City</Label>
                        <Input
                          placeholder="e.g., Delhi (DEL)"
                          value={flightFrom}
                          onChange={e => setFlightFrom(e.target.value)}
                          className="h-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase">Arrival City</Label>
                        <Input
                          placeholder="e.g., Dubai (DXB)"
                          value={flightTo}
                          onChange={e => setFlightTo(e.target.value)}
                          className="h-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase">Flight Duration</Label>
                        <Input
                          placeholder="e.g., 3h 30m"
                          value={flightDuration}
                          onChange={e => setFlightDuration(e.target.value)}
                          className="h-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <Button type="button" onClick={addFlightRoute} size="sm" className="h-9 text-xs font-bold md:col-span-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Flight Sector
                      </Button>
                    </div>

                    {form.flight_routes.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {form.flight_routes.map((route, idx) => (
                          <Badge key={idx} variant="secondary" className="px-2.5 py-1 text-xs gap-1.5 border border-slate-700 bg-slate-900 text-slate-200">
                            <span className="font-semibold">{route.from} → {route.to}</span>
                            <span className="text-[10px] text-amber-400 font-mono">({route.duration})</span>
                            <button type="button" onClick={() => removeFlightRoute(idx)} className="text-red-400 hover:text-red-300">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: FAQs & SEO */}
              {activeSubTab === 'seo' && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* FAQs */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Info className="w-4 h-4 text-amber-400" /> Destination Travel FAQs
                      </h3>
                      <p className="text-xs text-slate-400">Add helpful questions and answers to increase SEO authority.</p>
                    </div>

                    <div className="space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300 uppercase">Question</Label>
                        <Input
                          placeholder="e.g., What is the best time for a desert safari in Dubai?"
                          value={faqQ}
                          onChange={e => setFaqQ(e.target.value)}
                          className="h-9.5 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300 uppercase">Answer</Label>
                        <Textarea
                          placeholder="Write a clear, detailed answer..."
                          value={faqA}
                          onChange={e => setFaqA(e.target.value)}
                          className="text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 font-medium min-h-[70px]"
                        />
                      </div>
                      <Button type="button" onClick={addFAQ} size="sm" className="h-9 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add FAQ Item
                      </Button>
                    </div>

                    {form.faqs.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {form.faqs.map((faq, idx) => (
                          <div key={idx} className="p-3.5 border border-slate-800 bg-slate-900 rounded-xl flex justify-between items-start gap-4">
                            <div className="space-y-1 text-xs">
                              <div className="font-bold text-amber-400">Q: {faq.question}</div>
                              <div className="text-slate-300">A: {faq.answer}</div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeFAQ(idx)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0 shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEO METADATA */}
                  <div className="space-y-4 border-t border-slate-800 pt-6">
                    <div>
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Globe className="w-4 h-4 text-amber-400" /> SEO Metadata Configuration
                      </h3>
                      <p className="text-xs text-slate-400">Set unique meta details to rank this tour itinerary on search engines.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">SEO Custom Title</Label>
                        <Input
                          value={form.seo_title}
                          onChange={e => setForm(prev => ({ ...prev, seo_title: e.target.value }))}
                          placeholder="e.g., 5-Day Dubai Delights Tour | Desert Safari & Burj Khalifa Package"
                          className="h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 font-medium"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">SEO Meta Description</Label>
                        <Textarea
                          value={form.seo_description}
                          onChange={e => setForm(prev => ({ ...prev, seo_description: e.target.value }))}
                          placeholder="Write a highly-clickable meta description showing inclusions..."
                          className="text-xs min-h-[80px] bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 font-medium"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SEO Focus Keywords</Label>
                        <Input
                          value={form.seo_keywords}
                          onChange={e => setForm(prev => ({ ...prev, seo_keywords: e.target.value }))}
                          placeholder="e.g., dubai tour, dubai itinerary, dubai desert safari"
                          className="h-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PACKAGE VARIANTS & TIERS */}
              {activeSubTab === 'variants' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-4 rounded-xl">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" /> Package Variants & Pricing Tiers
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Manage multi-tier options (e.g., 5N/6D Classic, 7N/8D Premium) with custom itineraries, hotels, excursions, and pricing.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setEditingVariant({
                          variant_key: 'classic',
                          label: '5N/6D Classic',
                          nights: 5,
                          days: 6,
                          tag: 'Best Value',
                          price_per_person: 25000,
                          hotel_category: '3 Star Comfort',
                          group_size: '2-15 People',
                          pickup_from: '',
                          inclusions: [],
                          exclusions: [],
                          itinerary: [],
                          hotels: [],
                          excursions: [],
                          price_table: [],
                          cancellation_policy: []
                        });
                        setVariantInnerTab('basic');
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Add New Variant
                    </Button>
                  </div>

                  {/* Existing variants list */}
                  {!editingVariant && (
                    <div className="space-y-4">
                      {loadingVariants ? (
                        <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> Loading package variants...
                        </div>
                      ) : variantsList.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-border/60 rounded-2xl p-6 text-muted-foreground">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm font-semibold mb-1">No Variants Configured</p>
                          <p className="text-xs">Click "Add New Variant" above to create tiered options (e.g. Classic, Premium, Luxury).</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {variantsList.map((v: any, idx: number) => (
                            <Card key={v.id || v.variant_key || v.label || `variant-${idx}`} className="border-border/60 hover:shadow-md transition-shadow">
                              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                <div>
                                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    {v.label}
                                    {v.tag && <Badge variant="secondary" className="text-[9px]">{v.tag}</Badge>}
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground font-mono mt-0.5">Key: {v.variant_key}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => { setEditingVariant(v); setVariantInnerTab('basic'); }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteVariant(v.id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2 text-xs space-y-1">
                                <div className="font-bold text-emerald-600">₹{(Number(v.price_per_person || v.pricePerPerson) || 0).toLocaleString('en-IN')}/person</div>
                                <div className="text-slate-500">Duration: {v.nights}N/{v.days}D • Category: {v.hotel_category || 'Standard'}</div>
                                <div className="text-slate-400 text-[11px]">
                                  {v.itinerary?.length || 0} Days • {v.hotels?.length || 0} Hotels • {v.excursions?.length || 0} Excursions
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Editing Variant Form */}
                  {editingVariant && (
                    <div className="border border-slate-800 rounded-2xl p-5 bg-slate-900 text-white space-y-5 shadow-2xl">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <h4 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                          <Edit className="w-4 h-4 text-amber-400" />
                          {editingVariant.id ? `Editing Variant: ${editingVariant.label}` : 'Create New Variant'}
                        </h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingVariant(null)} className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-800">
                          <X className="w-4 h-4 mr-1" /> Close
                        </Button>
                      </div>

                      {/* Inner tabs */}
                      <div className="flex flex-wrap gap-1.5 bg-slate-950 border border-slate-800 p-1.5 rounded-xl">
                        {[
                          { id: 'basic', label: 'Basic Info' },
                          { id: 'itinerary', label: 'Itinerary Days' },
                          { id: 'hotels', label: 'Hotels' },
                          { id: 'excursions', label: 'Excursions' },
                          { id: 'pricing', label: 'Pricing & Cancellation' }
                        ].map(t => {
                          const isActive = variantInnerTab === t.id;
                          return (
                            <Button
                              key={t.id}
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setVariantInnerTab(t.id)}
                              className={`text-xs h-8 font-bold transition-all ${
                                isActive ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                              }`}
                            >
                              {t.label}
                            </Button>
                          );
                        })}
                      </div>

                      {/* INNER TAB 1: BASIC INFO */}
                      {variantInnerTab === 'basic' && (
                        <div className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-xs font-bold text-slate-300">Variant Key (slug)</Label>
                              <Input
                                value={editingVariant.variant_key || ''}
                                onChange={e => setEditingVariant((prev: any) => ({ ...prev, variant_key: e.target.value }))}
                                placeholder="e.g. classic, premium, 1n2d"
                                className="h-9 font-mono text-xs mt-1 bg-slate-950 border-slate-700 text-sky-400"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold text-slate-300">Display Label</Label>
                              <Input
                                value={editingVariant.label || ''}
                                onChange={e => setEditingVariant((prev: any) => ({ ...prev, label: e.target.value }))}
                                placeholder="e.g. 5N/6D Classic"
                                className="h-9 text-xs mt-1 bg-slate-950 border-slate-700 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold text-slate-300">Tag Badge (Optional)</Label>
                              <Input
                                value={editingVariant.tag || ''}
                                onChange={e => setEditingVariant((prev: any) => ({ ...prev, tag: e.target.value }))}
                                placeholder="e.g. Most Popular, Best Value"
                                className="h-9 text-xs mt-1 bg-slate-950 border-slate-700 text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-xs font-bold text-slate-300">Nights</Label>
                              <Input
                                type="number"
                                value={editingVariant.nights ?? 0}
                                onChange={e => setEditingVariant((prev: any) => ({ ...prev, nights: Number(e.target.value) }))}
                                className="h-9 text-xs mt-1 bg-slate-950 border-slate-700 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold text-slate-300">Days</Label>
                              <Input
                                type="number"
                                value={editingVariant.days ?? 1}
                                onChange={e => setEditingVariant((prev: any) => ({ ...prev, days: Number(e.target.value) }))}
                                className="h-9 text-xs mt-1 bg-slate-950 border-slate-700 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold text-slate-300">Price per Person (₹)</Label>
                              <Input
                                type="number"
                                value={editingVariant.price_per_person ?? 0}
                                onChange={e => setEditingVariant((prev: any) => ({ ...prev, price_per_person: Number(e.target.value) }))}
                                className="h-9 text-xs font-extrabold text-emerald-400 mt-1 bg-slate-950 border-slate-700"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-bold text-slate-300">Hotel Category</Label>
                              <Input
                                value={editingVariant.hotel_category || ''}
                                onChange={e => setEditingVariant((prev: any) => ({ ...prev, hotel_category: e.target.value }))}
                                placeholder="e.g. 3 Star Comfort"
                                className="h-9 text-xs mt-1 bg-slate-950 border-slate-700 text-white"
                              />
                            </div>
                          </div>

                          <TagInput
                            label="Variant Inclusions"
                            items={editingVariant.inclusions || []}
                            onChange={items => setEditingVariant((prev: any) => ({ ...prev, inclusions: items }))}
                            placeholder="Add inclusion item..."
                            colorClass="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          />

                          <TagInput
                            label="Variant Exclusions"
                            items={editingVariant.exclusions || []}
                            onChange={items => setEditingVariant((prev: any) => ({ ...prev, exclusions: items }))}
                            placeholder="Add exclusion item..."
                            colorClass="bg-red-500/10 text-red-400 border-red-500/30"
                          />
                        </div>
                      )}

                      {/* INNER TAB 2: ITINERARY DAYS */}
                      {variantInnerTab === 'itinerary' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold uppercase tracking-wider">Day-by-Day Timeline ({editingVariant.itinerary?.length || 0} Days)</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const nextDay = (editingVariant.itinerary?.length || 0) + 1;
                                setEditingVariant((prev: any) => ({
                                  ...prev,
                                  itinerary: [...(prev.itinerary || []), { day_number: nextDay, timing: '09:00 AM', title: `Day ${nextDay} Sightseeing`, description: '', activities: [], meals: 'Breakfast + Dinner' }]
                                }));
                              }}
                              className="h-8 text-xs gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Day
                            </Button>
                          </div>
                          {(editingVariant.itinerary || []).map((day: any, idx: number) => (
                            <div key={idx} className="border border-slate-800 p-3.5 rounded-xl space-y-3 bg-slate-950/80 text-white">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-xs text-amber-400">Day {day.day_number || idx + 1}</span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const list = [...editingVariant.itinerary];
                                    list.splice(idx, 1);
                                    setEditingVariant((prev: any) => ({ ...prev, itinerary: list }));
                                  }}
                                  className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                  value={day.title || ''}
                                  onChange={e => {
                                    const list = [...editingVariant.itinerary];
                                    list[idx] = { ...list[idx], title: e.target.value };
                                    setEditingVariant((prev: any) => ({ ...prev, itinerary: list }));
                                  }}
                                  placeholder="Day Title"
                                  className="h-8 text-xs md:col-span-2 bg-slate-900 border-slate-700 text-white font-medium"
                                />
                                <Input
                                  value={day.timing || ''}
                                  onChange={e => {
                                    const list = [...editingVariant.itinerary];
                                    list[idx] = { ...list[idx], timing: e.target.value };
                                    setEditingVariant((prev: any) => ({ ...prev, itinerary: list }));
                                  }}
                                  placeholder="Timing (e.g. 09:00 AM)"
                                  className="h-8 text-xs bg-slate-900 border-slate-700 text-amber-400 font-mono font-semibold"
                                />
                              </div>
                              <Textarea
                                value={day.description || ''}
                                onChange={e => {
                                  const list = [...editingVariant.itinerary];
                                  list[idx] = { ...list[idx], description: e.target.value };
                                  setEditingVariant((prev: any) => ({ ...prev, itinerary: list }));
                                }}
                                placeholder="Detailed Day Description..."
                                className="text-xs h-16 bg-slate-900 border-slate-700 text-white font-medium"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* INNER TAB 3: HOTELS */}
                      {variantInnerTab === 'hotels' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold uppercase tracking-wider">Hotels Included</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingVariant((prev: any) => ({
                                  ...prev,
                                  hotels: [...(prev.hotels || []), { hotel_name: '', location: '', stars: 3, highlight: '' }]
                                }));
                              }}
                              className="h-8 text-xs gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Hotel
                            </Button>
                          </div>
                          {(editingVariant.hotels || []).map((h: any, idx: number) => (
                            <div key={idx} className="border border-slate-800 p-3.5 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-slate-950/80 text-white">
                              {(() => {
                                const currName = h.hotel_name || h.name || '';
                                const isCustom = currName && !filteredHotelsForPackage.some(mh => (mh.hotel_name || mh.name) === currName);
                                return (
                                  <div className="space-y-1">
                                    <Select
                                      value={isCustom ? '__custom__' : currName}
                                      onValueChange={v => {
                                        const list = [...editingVariant.hotels];
                                        if (v === '__custom__') {
                                          list[idx] = { ...list[idx], hotel_name: '', name: '' };
                                        } else {
                                          const sel = filteredHotelsForPackage.find(mh => (mh.hotel_name || mh.name) === v);
                                          list[idx] = {
                                            ...list[idx],
                                            hotel_name: v,
                                            name: v,
                                            location: sel ? (sel.location || list[idx].location) : list[idx].location,
                                            stars: sel ? Number(sel.stars || 4) : list[idx].stars
                                          };
                                        }
                                        setEditingVariant((prev: any) => ({ ...prev, hotels: list }));
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-xs bg-slate-900 border-slate-700 text-emerald-400 font-bold">
                                        <SelectValue placeholder="Select Destination Hotel..." />
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-60 z-50">
                                        {filteredHotelsForPackage.map((mh, i) => {
                                          const hName = mh.hotel_name || mh.name;
                                          if (!hName) return null;
                                          return (
                                            <SelectItem key={`vh-${hName}-${i}`} value={hName}>
                                              🏨 {hName} ({mh.location || ''})
                                            </SelectItem>
                                          );
                                        })}
                                        <SelectItem value="__custom__">➕ Custom Hotel...</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {(isCustom || !currName) && (
                                      <Input
                                        value={currName}
                                        onChange={e => {
                                          const list = [...editingVariant.hotels];
                                          list[idx] = { ...list[idx], hotel_name: e.target.value, name: e.target.value };
                                          setEditingVariant((prev: any) => ({ ...prev, hotels: list }));
                                        }}
                                        placeholder="Type custom hotel name..."
                                        className="h-8 text-xs bg-slate-900 border-amber-500/50 text-white font-medium"
                                      />
                                    )}
                                  </div>
                                );
                              })()}
                              <Input
                                value={h.location || ''}
                                onChange={e => {
                                  const list = [...editingVariant.hotels];
                                  list[idx] = { ...list[idx], location: e.target.value };
                                  setEditingVariant((prev: any) => ({ ...prev, hotels: list }));
                                }}
                                placeholder="Location (City/Lake)"
                                className="h-8 text-xs bg-slate-900 border-slate-700 text-white font-medium placeholder:text-slate-500"
                              />
                              <Input
                                type="number"
                                value={h.stars ?? 3}
                                onChange={e => {
                                  const list = [...editingVariant.hotels];
                                  list[idx] = { ...list[idx], stars: Number(e.target.value) };
                                  setEditingVariant((prev: any) => ({ ...prev, hotels: list }));
                                }}
                                placeholder="Star Rating (1-5)"
                                className="h-8 text-xs bg-slate-900 border-slate-700 text-amber-400 font-bold"
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={h.highlight || ''}
                                  onChange={e => {
                                    const list = [...editingVariant.hotels];
                                    list[idx] = { ...list[idx], highlight: e.target.value };
                                    setEditingVariant((prev: any) => ({ ...prev, hotels: list }));
                                  }}
                                  placeholder="Highlight Text"
                                  className="h-8 text-xs bg-slate-900 border-slate-700 text-white font-medium placeholder:text-slate-500"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const list = [...editingVariant.hotels];
                                    list.splice(idx, 1);
                                    setEditingVariant((prev: any) => ({ ...prev, hotels: list }));
                                  }}
                                  className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* INNER TAB 4: EXCURSIONS */}
                      {variantInnerTab === 'excursions' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold uppercase tracking-wider">Activities & Excursions</Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingVariant((prev: any) => ({
                                  ...prev,
                                  excursions: [...(prev.excursions || []), { excursion_name: '', description: '', duration: '2 hrs', price: '', is_included: true }]
                                }));
                              }}
                              className="h-8 text-xs gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Excursion
                            </Button>
                          </div>
                          {(editingVariant.excursions || []).map((e: any, idx: number) => (
                            <div key={idx} className="border border-slate-800 p-3.5 rounded-xl space-y-2 bg-slate-950/80 text-white">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                {(() => {
                                  const currTitle = e.excursion_name || e.name || '';
                                  const isCustom = currTitle && !filteredSightseeingsForPackage.some((s: any) => (s.sightseeing_name || s.name || s.title) === currTitle);
                                  return (
                                    <div className="md:col-span-2 space-y-1">
                                      <Select
                                        value={isCustom ? '__custom__' : currTitle}
                                        onValueChange={v => {
                                          const list = [...editingVariant.excursions];
                                          if (v === '__custom__') {
                                            list[idx] = { ...list[idx], excursion_name: '', name: '' };
                                          } else {
                                            const sel = filteredSightseeingsForPackage.find((s: any) => (s.sightseeing_name || s.name || s.title) === v);
                                            list[idx] = {
                                              ...list[idx],
                                              excursion_name: v,
                                              name: v,
                                              duration: sel ? (sel.duration || list[idx].duration) : list[idx].duration
                                            };
                                          }
                                          setEditingVariant((prev: any) => ({ ...prev, excursions: list }));
                                        }}
                                      >
                                        <SelectTrigger className="h-8 text-xs bg-slate-900 border-slate-700 text-emerald-400 font-bold">
                                          <SelectValue placeholder="Select Destination Excursion..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-60 z-50">
                                          {filteredSightseeingsForPackage.map((s: any, i: number) => {
                                            const sTitle = s.sightseeing_name || s.name || s.title;
                                            if (!sTitle) return null;
                                            return (
                                              <SelectItem key={`ve-${sTitle}-${i}`} value={sTitle}>
                                                📍 {sTitle} ({s.destination || s.city || ''})
                                              </SelectItem>
                                            );
                                          })}
                                          <SelectItem value="__custom__">➕ Custom Excursion...</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {(isCustom || !currTitle) && (
                                        <Input
                                          value={currTitle}
                                          onChange={ev => {
                                            const list = [...editingVariant.excursions];
                                            list[idx] = { ...list[idx], excursion_name: ev.target.value, name: ev.target.value };
                                            setEditingVariant((prev: any) => ({ ...prev, excursions: list }));
                                          }}
                                          placeholder="Type custom excursion title..."
                                          className="h-8 text-xs bg-slate-900 border-amber-500/50 text-white font-medium"
                                        />
                                      )}
                                    </div>
                                  );
                                })()}
                                <Input
                                  value={e.duration || ''}
                                  onChange={ev => {
                                    const list = [...editingVariant.excursions];
                                    list[idx] = { ...list[idx], duration: ev.target.value };
                                    setEditingVariant((prev: any) => ({ ...prev, excursions: list }));
                                  }}
                                  placeholder="Duration (e.g. 2 hrs)"
                                  className="h-8 text-xs bg-slate-900 border-slate-700 text-amber-400 font-mono font-semibold"
                                />
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={e.is_included !== false && e.included !== false}
                                    onCheckedChange={val => {
                                      const list = [...editingVariant.excursions];
                                      list[idx] = { ...list[idx], is_included: val, included: val };
                                      setEditingVariant((prev: any) => ({ ...prev, excursions: list }));
                                    }}
                                  />
                                  <span className="text-[10px] font-semibold text-slate-300">{e.is_included !== false && e.included !== false ? 'Included' : 'Optional'}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      const list = [...editingVariant.excursions];
                                      list.splice(idx, 1);
                                      setEditingVariant((prev: any) => ({ ...prev, excursions: list }));
                                    }}
                                    className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* INNER TAB 5: PRICING & CANCELLATION */}
                      {variantInnerTab === 'pricing' && (
                        <div className="space-y-6">
                          {/* Price Table */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="text-xs font-bold uppercase tracking-wider">Room Category Price Table</Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingVariant((prev: any) => ({
                                    ...prev,
                                    price_table: [...(prev.price_table || []), { room_type: 'Standard Double', price: '₹26,500/person' }]
                                  }));
                                }}
                                className="h-8 text-xs gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Price Row
                              </Button>
                            </div>
                            {(editingVariant.price_table || []).map((pr: any, idx: number) => (
                              <div key={idx} className="flex gap-3 items-center">
                                <Input
                                  value={pr.room_type || pr.roomType || ''}
                                  onChange={e => {
                                    const list = [...editingVariant.price_table];
                                    list[idx] = { ...list[idx], room_type: e.target.value, roomType: e.target.value };
                                    setEditingVariant((prev: any) => ({ ...prev, price_table: list }));
                                  }}
                                  placeholder="Room Type (e.g., Deluxe Double)"
                                  className="h-8 text-xs flex-1"
                                />
                                <Input
                                  value={pr.price || ''}
                                  onChange={e => {
                                    const list = [...editingVariant.price_table];
                                    list[idx] = { ...list[idx], price: e.target.value };
                                    setEditingVariant((prev: any) => ({ ...prev, price_table: list }));
                                  }}
                                  placeholder="Price (e.g., ₹26,500/person)"
                                  className="h-8 text-xs w-48 font-bold"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const list = [...editingVariant.price_table];
                                    list.splice(idx, 1);
                                    setEditingVariant((prev: any) => ({ ...prev, price_table: list }));
                                  }}
                                  className="h-8 text-xs text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Cancellation Policy */}
                          <div className="space-y-3 border-t pt-4">
                            <div className="flex justify-between items-center">
                              <Label className="text-xs font-bold uppercase tracking-wider">Cancellation Policy Rows</Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingVariant((prev: any) => ({
                                    ...prev,
                                    cancellation_policy: [...(prev.cancellation_policy || []), { days_before: 'More than 30 days', charge: 'Free Cancellation' }]
                                  }));
                                }}
                                className="h-8 text-xs gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Policy Row
                              </Button>
                            </div>
                            {(editingVariant.cancellation_policy || []).map((cp: any, idx: number) => (
                              <div key={idx} className="flex gap-3 items-center">
                                <Input
                                  value={cp.days_before || cp.daysBefore || ''}
                                  onChange={e => {
                                    const list = [...editingVariant.cancellation_policy];
                                    list[idx] = { ...list[idx], days_before: e.target.value, daysBefore: e.target.value };
                                    setEditingVariant((prev: any) => ({ ...prev, cancellation_policy: list }));
                                  }}
                                  placeholder="Timeframe (e.g., More than 30 days)"
                                  className="h-8 text-xs flex-1"
                                />
                                <Input
                                  value={cp.charge || ''}
                                  onChange={e => {
                                    const list = [...editingVariant.cancellation_policy];
                                    list[idx] = { ...list[idx], charge: e.target.value };
                                    setEditingVariant((prev: any) => ({ ...prev, cancellation_policy: list }));
                                  }}
                                  placeholder="Cancellation Charge (e.g., 25%)"
                                  className="h-8 text-xs w-48 font-bold"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const list = [...editingVariant.cancellation_policy];
                                    list.splice(idx, 1);
                                    setEditingVariant((prev: any) => ({ ...prev, cancellation_policy: list }));
                                  }}
                                  className="h-8 text-xs text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Save Variant button */}
                      <div className="flex justify-end pt-3 border-t">
                        <Button
                          type="button"
                          onClick={handleSaveVariant}
                          disabled={savingVariant}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                        >
                          {savingVariant ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Variant Data
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
