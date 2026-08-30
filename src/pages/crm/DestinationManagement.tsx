import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SIGHTSEEING_SPOTS } from '@/data/sightseeingData';
import { MASTER_DESTINATIONS } from '@/data/masterDestinations';
import { 
  Globe, Map, MapPin, Plus, Search, Edit, Power, Download, Upload, 
  ArrowLeft, Check, X, Loader2, RefreshCw, HelpCircle, Layers, Trash2,
  Compass, Ticket, IndianRupee
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

type Country = {
  id: string;
  country_name: string;
  country_code: string;
  active_status: boolean;
  state_count?: number;
};

type State = {
  id: string;
  state_name: string;
  state_code: string;
  country_id: string;
  active_status: boolean;
  city_count?: number;
};

type City = {
  id: string;
  city_name: string;
  state_id: string;
  state?: string;
  country?: string;
  destination_type: string | null;
  active_status: boolean;
};

// Rows returned by inventory_by_city.php for the selected city.
type CitySightseeing = {
  id: string;
  sightseeing_name: string;
  destination: string | null;
  duration: string | null;
  description: string | null;
  image_url: string | null;
  adult_cost: number;
  child_cost: number;
};

type CityActivity = {
  id: string;
  name: string;
  category: string | null;
  sightseeing_id: string | null;
  contract_type: string | null;
  rates: { rate_id: string; rate_type: string; adult_rate: number; child_rate: number; currency: string }[];
};

export const DestinationManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // General Loading & Stats
  const [loading, setLoading] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Total DB Counts for Stats Strip
  const [totalCountriesCount, setTotalCountriesCount] = useState(0);
  const [totalStatesCount, setTotalStatesCount] = useState(0);
  const [totalCitiesCount, setTotalCitiesCount] = useState(0);
  const [cityCountMap, setCityCountMap] = useState<Record<string, number>>({});

  // Column Data States
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Selection States for 3-Column Cascade
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Places & Activities Panel (inventory for the selected city)
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [citySightseeings, setCitySightseeings] = useState<CitySightseeing[]>([]);
  const [cityActivities, setCityActivities] = useState<CityActivity[]>([]);
  const [inventoryTab, setInventoryTab] = useState<'places' | 'activities'>('places');

  const [showAddPlace, setShowAddPlace] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', duration: '', adult_cost: '', child_cost: '', description: '', image_url: '' });
  const [savingPlace, setSavingPlace] = useState(false);

  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: '', category: 'Adventure', duration: '', adult_cost: '', child_cost: '', description: '', image_url: '' });
  const [savingActivity, setSavingActivity] = useState(false);

  // Column Filters
  const [countryFilter, setCountryFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // States for Inline Add Forms
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');

  const [showAddState, setShowAddState] = useState(false);
  const [newStateName, setNewStateName] = useState('');
  const [newStateCode, setNewStateCode] = useState('');

  const [showAddCity, setShowAddCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityType, setNewCityType] = useState('Leisure');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editType, setEditType] = useState<'country' | 'state' | 'city'>('country');
  const [editItem, setEditItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', type: 'Leisure', state_id: '', country_id: '' });

  // CSV Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importTarget, setImportTarget] = useState<'countries' | 'states' | 'cities'>('countries');
  const [importing, setImporting] = useState(false);

  // Mount: Load baseline counts and initial countries list
  useEffect(() => {
    initLoad();
  }, []);

  const initLoad = async () => {
    setLoading(true);
    try {
      const authHeaders = await getAuthHeader();
      // 1. Fetch total counts across all tables for stats strip
      const [cRes, sRes, ciRes] = await Promise.all([
        fetch(`${API_BASE}/api.php?table=countries`, { headers: authHeaders }),
        fetch(`${API_BASE}/api.php?table=states`, { headers: authHeaders }),
        fetch(`${API_BASE}/api.php?table=cities`, { headers: authHeaders })
      ]);

      let allCountries: Country[] = [];
      let allStates: State[] = [];
      let allCities: City[] = [];

      if (cRes.ok) {
        const raw = await cRes.json();
        allCountries = (raw || []).map((c: any) => ({
          ...c,
          id: String(c.id),
          active_status: Boolean(c.active_status === 1 || c.active_status === true || c.active_status === '1')
        }));
        setTotalCountriesCount(allCountries.length);
      }

      if (sRes.ok) {
        const raw = await sRes.json();
        allStates = (raw || []).map((s: any) => ({
          ...s,
          id: String(s.id),
          country_id: String(s.country_id),
          active_status: Boolean(s.active_status === 1 || s.active_status === true || s.active_status === '1')
        }));
        setTotalStatesCount(allStates.length);
      }

      if (ciRes.ok) {
        const raw = await ciRes.json();
        allCities = (raw || []).map((ci: any) => ({
          ...ci,
          id: String(ci.id),
          state_id: String(ci.state_id),
          city_name: ci.city_name || ci.name || '',
          active_status: Boolean(ci.active_status === 1 || ci.active_status === true || ci.active_status === '1')
        }));
        setTotalCitiesCount(allCities.length);

        // Step A: Build a count map: { state_id: count }
        const countMap: Record<string, number> = {};
        (Array.isArray(allCities) ? allCities : []).forEach((c: any) => {
          if (c.state_id && c.state_id !== 'null' && c.state_id !== '0') {
            const key = String(c.state_id);
            countMap[key] = (countMap[key] || 0) + 1;
          }
        });
        setCityCountMap(countMap);
      }

      // Calculate state count per country
      const countriesWithCounts = allCountries.map(c => ({
        ...c,
        state_count: allStates.filter(s => String(s.country_id) === String(c.id)).length
      }));

      setCountries(countriesWithCounts);

      // Auto-select first country if available
      if (countriesWithCounts.length > 0) {
        const first = countriesWithCounts[0];
        setSelectedCountry(first);
        loadStatesForCountry(first.id, allStates, allCities);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to initialize destinations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch / Refresh States for a selected Country
  const loadStatesForCountry = async (countryId: string, preloadedStates?: State[], preloadedCities?: City[]) => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=states&country_id=${countryId}`, {
        headers: authHeaders
      });

      if (res.ok) {
        const raw = await res.json();
        const stateList = Array.isArray(raw) ? raw : [];

        // Bug 3: If country has 0 states (e.g. Singapore, UAE), load direct/unlinked cities for this country
        if (stateList.length === 0 && selectedCountry) {
          const ciRes = await fetch(`${API_BASE}/api.php?table=cities`, { headers: authHeaders });
          if (ciRes.ok) {
            const ciRaw = await ciRes.json();
            const intlCities = (ciRaw || []).filter((c: any) => 
              (!c.state_id || c.state_id === 'null' || c.state_id === '0' || c.state_id === 0) &&
              (c.country?.toLowerCase() === selectedCountry.country_name.toLowerCase() || c.country === selectedCountry.country_name)
            ).map((ci: any) => ({
              ...ci,
              id: String(ci.id),
              state_id: String(ci.state_id),
              city_name: ci.city_name || ci.name || '',
              active_status: Boolean(ci.active_status === 1 || ci.active_status === true || ci.active_status === '1')
            }));
            setCities(intlCities);
          }
          setStates([]);
          return;
        }

        const parsedStates: State[] = stateList.map((s: any) => ({
          ...s,
          id: String(s.id),
          country_id: String(s.country_id),
          active_status: Boolean(s.active_status === 1 || s.active_status === true || s.active_status === '1'),
          city_count: cityCountMap[String(s.id)] ?? 0
        }));
        setStates(parsedStates);
      }
    } catch (err: any) {
      console.error("Failed to load states:", err);
    }
  };

  // BUG 1 FIX — Fetch / Refresh Cities for a selected State with strict String(c.state_id) === String(stateId) filter
  const loadCitiesForState = async (stateId: string | number) => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=cities&state_id=${stateId}`, {
        headers: authHeaders
      });
      if (res.ok) {
        const raw = await res.json();
        const all = Array.isArray(raw) ? raw : [];
        const parsedCities: City[] = all
          .map((ci: any) => ({
            ...ci,
            id: String(ci.id),
            state_id: String(ci.state_id),
            city_name: ci.city_name || ci.name || '',
            active_status: Boolean(ci.active_status === 1 || ci.active_status === true || ci.active_status === '1')
          }))
          .filter((c: any) => String(c.state_id) === String(stateId));
        setCities(parsedCities);
      }
    } catch (err: any) {
      console.error("Failed to load cities:", err);
      setCities([]);
    }
  };

  // Handle Country Row Selection
  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setCities([]);
    setCitySightseeings([]);
    setCityActivities([]);
    loadStatesForCountry(country.id);
  };

  // Handle State Row Selection
  const handleSelectState = (state: State) => {
    setSelectedState(state);
    setSelectedCity(null);
    setCitySightseeings([]);
    setCityActivities([]);
    loadCitiesForState(state.id);
  };

  // Handle City Row Selection — triggers the Places & Activities panel to load
  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setShowAddPlace(false);
    setShowAddActivity(false);
    loadCityInventory(city.id, city.city_name || city.state || '');
  };

  // Fetch places (sightseeings) & activities already linked to this city, synced with master spots
  const loadCityInventory = async (cityId: string, cityName?: string) => {
    setInventoryLoading(true);
    setInventoryError(null);
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/inventory_by_city.php?city_id=${cityId}`, {
        headers: authHeaders
      });
      let fetchedSightseeings: CitySightseeing[] = [];
      let fetchedActivities: CityActivity[] = [];
      if (res.ok) {
        const data = await res.json();
        fetchedSightseeings = data.sightseeings || [];
        fetchedActivities = data.activities || [];
      }

      // Sync with master SIGHTSEEING_SPOTS data for the selected city
      const targetName = (cityName || selectedCity?.city_name || '').toLowerCase();
      const matchingMasterSpots = SIGHTSEEING_SPOTS.filter(spot => {
        if (!targetName) return false;
        const dest = spot.destination.toLowerCase();
        const loc = spot.location.toLowerCase();
        return dest.includes(targetName) || loc.includes(targetName) || targetName.includes(dest);
      });

      if (matchingMasterSpots.length > 0) {
        const masterSightseeings: CitySightseeing[] = matchingMasterSpots.map((spot) => ({
          id: `master-ss-${spot.slug}`,
          sightseeing_name: spot.name,
          destination: spot.destination,
          duration: spot.duration,
          description: spot.description,
          image_url: spot.image,
          adult_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 200,
          child_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 150
        }));

        const masterActivities: CityActivity[] = matchingMasterSpots.map((spot) => ({
          id: `master-act-${spot.slug}`,
          name: spot.name,
          category: spot.category,
          sightseeing_id: `master-ss-${spot.slug}`,
          contract_type: 'Direct',
          rates: [
            {
              rate_id: `rate-${spot.slug}`,
              rate_type: 'Per Person',
              adult_rate: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 200,
              child_rate: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 150,
              currency: 'INR'
            }
          ]
        }));

        const existingNames = new Set(fetchedSightseeings.map(s => s.sightseeing_name.toLowerCase()));
        for (const ms of masterSightseeings) {
          if (!existingNames.has(ms.sightseeing_name.toLowerCase())) {
            fetchedSightseeings.push(ms);
          }
        }

        const existingActNames = new Set(fetchedActivities.map(a => a.name.toLowerCase()));
        for (const ma of masterActivities) {
          if (!existingActNames.has(ma.name.toLowerCase())) {
            fetchedActivities.push(ma);
          }
        }
      }

      // Sync with master destinations & popular attractions (e.g. Pench, Indore, Ujjain, Pachmarhi, etc.)
      const matchedMasterDest = MASTER_DESTINATIONS.find(d => 
        targetName.includes(d.city.toLowerCase()) || d.city.toLowerCase().includes(targetName)
      );

      if (matchedMasterDest && Array.isArray(matchedMasterDest.popular_attractions)) {
        matchedMasterDest.popular_attractions.forEach((attraction, idx) => {
          const attractionName = attraction.trim();
          if (!attractionName) return;

          const ms: CitySightseeing = {
            id: `master-attraction-${idx}-${matchedMasterDest.city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            sightseeing_name: attractionName,
            destination: matchedMasterDest.city,
            duration: '2-3 Hours',
            description: `Top tourist attraction & highlight in ${matchedMasterDest.city} (${matchedMasterDest.destination_group}).`,
            adult_cost: 150,
            child_cost: 100
          };

          const ma: CityActivity = {
            id: `master-act-attraction-${idx}-${matchedMasterDest.city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: attractionName,
            category: matchedMasterDest.destination_group.includes('Wildlife') ? 'Wildlife Safari' : 'Sightseeing Tour',
            sightseeing_id: ms.id,
            contract_type: 'Direct',
            rates: [
              {
                rate_id: `rate-${idx}`,
                rate_type: 'Per Person',
                adult_rate: 150,
                child_rate: 100,
                currency: 'INR'
              }
            ]
          };

          const existingNames = new Set(fetchedSightseeings.map(s => s.sightseeing_name.toLowerCase()));
          if (!existingNames.has(ms.sightseeing_name.toLowerCase())) {
            fetchedSightseeings.push(ms);
          }

          const existingActNames = new Set(fetchedActivities.map(a => a.name.toLowerCase()));
          if (!existingActNames.has(ma.name.toLowerCase())) {
            fetchedActivities.push(ma);
          }
        });
      }

      setCitySightseeings(fetchedSightseeings);
      setCityActivities(fetchedActivities);
    } catch (err: any) {
      console.warn('Backend inventory fetch warning, syncing with SIGHTSEEING_SPOTS:', err);
      const targetName = (cityName || selectedCity?.city_name || '').toLowerCase();
      const matchingMasterSpots = SIGHTSEEING_SPOTS.filter(spot => {
        if (!targetName) return false;
        const dest = spot.destination.toLowerCase();
        const loc = spot.location.toLowerCase();
        return dest.includes(targetName) || loc.includes(targetName) || targetName.includes(dest);
      });

      const masterSightseeings: CitySightseeing[] = matchingMasterSpots.map((spot) => ({
        id: `master-ss-${spot.slug}`,
        sightseeing_name: spot.name,
        destination: spot.destination,
        duration: spot.duration,
        description: spot.description,
        image_url: spot.image,
        adult_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 200,
        child_cost: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 150
      }));

      const masterActivities: CityActivity[] = matchingMasterSpots.map((spot) => ({
        id: `master-act-${spot.slug}`,
        name: spot.name,
        category: spot.category,
        sightseeing_id: `master-ss-${spot.slug}`,
        contract_type: 'Direct',
        rates: [
          {
            rate_id: `rate-${spot.slug}`,
            rate_type: 'Per Person',
            adult_rate: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.12) : 200,
            child_rate: spot.packages[0]?.price ? Math.round(spot.packages[0].price * 0.08) : 150,
            currency: 'INR'
          }
        ]
      }));

      setCitySightseeings(masterSightseeings);
      setCityActivities(masterActivities);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Add Place (Sightseeing) — pre-filled with the selected city's geography
  const handleCreatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !newPlace.name.trim()) return;

    setSavingPlace(true);
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=sightseeings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          sightseeing_name: newPlace.name.trim(),
          destination: selectedCity.city_name,
          city_id: selectedCity.id,
          state_id: selectedCity.state_id,
          country_id: selectedCountry?.id ?? null,
          duration: newPlace.duration.trim() || null,
          adult_cost: newPlace.adult_cost ? Number(newPlace.adult_cost) : 0,
          child_cost: newPlace.child_cost ? Number(newPlace.child_cost) : 0,
          description: newPlace.description.trim() || null,
          image_url: newPlace.image_url.trim() || null,
          active_status: 1
        })
      });
      if (!res.ok) throw new Error('Failed to add place');

      toast({ title: 'Place Added', description: `${newPlace.name} added to ${selectedCity.city_name}.` });
      setNewPlace({ name: '', duration: '', adult_cost: '', child_cost: '', description: '', image_url: '' });
      setShowAddPlace(false);
      loadCityInventory(selectedCity.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSavingPlace(false);
    }
  };

  // Add Activity — pre-filled with the selected city's geography
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !newActivity.name.trim()) return;

    setSavingActivity(true);
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/activities.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          activity_name: newActivity.name.trim(),
          activity_category: newActivity.category,
          destination: selectedCity.city_name,
          city_id: selectedCity.id,
          state_id: selectedCity.state_id,
          country_id: selectedCountry?.id ?? null,
          duration: newActivity.duration.trim() || null,
          adult_cost: newActivity.adult_cost ? Number(newActivity.adult_cost) : 0,
          child_cost: newActivity.child_cost ? Number(newActivity.child_cost) : 0,
          description: newActivity.description.trim() || null,
          image_url: newActivity.image_url.trim() || null,
          active_status: 1
        })
      });
      if (!res.ok) throw new Error('Failed to add activity');

      toast({ title: 'Activity Added', description: `${newActivity.name} added to ${selectedCity.city_name}.` });
      setNewActivity({ name: '', category: 'Adventure', duration: '', adult_cost: '', child_cost: '', description: '', image_url: '' });
      setShowAddActivity(false);
      loadCityInventory(selectedCity.id);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSavingActivity(false);
    }
  };

  // --- CRUD: INLINE CREATION HANDLERS ---

  // Add Country
  const handleCreateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName.trim()) return;

    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=countries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          country_name: newCountryName.trim(),
          country_code: newCountryCode.trim().toUpperCase(),
          active_status: 1
        })
      });

      if (!res.ok) throw new Error("Failed to add country");

      toast({ title: "Country Created", description: `${newCountryName} added successfully.` });
      setNewCountryName('');
      setNewCountryCode('');
      setShowAddCountry(false);
      initLoad();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Add State
  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry || !newStateName.trim()) return;

    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=states`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          state_name: newStateName.trim(),
          state_code: newStateCode.trim().toUpperCase(),
          country_id: selectedCountry.id,
          active_status: 1
        })
      });

      if (!res.ok) throw new Error("Failed to add state");

      toast({ title: "State Created", description: `${newStateName} added under ${selectedCountry.country_name}.` });
      setNewStateName('');
      setNewStateCode('');
      setShowAddState(false);

      // Refresh states for selected country and main counts
      loadStatesForCountry(selectedCountry.id);
      setTotalStatesCount(prev => prev + 1);
      setCountries(prev => prev.map(c => c.id === selectedCountry.id ? { ...c, state_count: (c.state_count || 0) + 1 } : c));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Add City
  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedState || !selectedCountry || !newCityName.trim()) return;

    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          city_name: newCityName.trim(),
          name: newCityName.trim(),
          state_id: selectedState.id,
          state: selectedState.state_name,
          country: selectedCountry.country_name,
          destination_type: newCityType,
          active_status: 1
        })
      });

      if (!res.ok) throw new Error("Failed to add city");

      toast({ title: "City Created", description: `${newCityName} added under ${selectedState.state_name}.` });
      setNewCityName('');
      setShowAddCity(false);

      // Refresh cities for selected state and main counts
      loadCitiesForState(selectedState.id);
      setTotalCitiesCount(prev => prev + 1);
      setStates(prev => prev.map(s => s.id === selectedState.id ? { ...s, city_count: (s.city_count || 0) + 1 } : s));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // --- CRUD: TOGGLE ACTIVE STATUS HANDLER ---
  const handleToggleStatus = async (type: 'country' | 'state' | 'city', item: any) => {
    try {
      const authHeaders = await getAuthHeader();
      const table = type === 'country' ? 'countries' : type === 'state' ? 'states' : 'cities';
      const newStatus = !item.active_status;

      const res = await fetch(`${API_BASE}/api.php?table=${table}&id=${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ active_status: newStatus ? 1 : 0 })
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast({ 
        title: "Status Updated", 
        description: `${item.country_name || item.state_name || item.city_name} is now ${newStatus ? 'Active' : 'Inactive'}.` 
      });

      if (type === 'country') {
        setCountries(prev => prev.map(c => c.id === item.id ? { ...c, active_status: newStatus } : c));
        if (selectedCountry?.id === item.id) {
          setSelectedCountry(prev => prev ? { ...prev, active_status: newStatus } : null);
        }
      } else if (type === 'state') {
        setStates(prev => prev.map(s => s.id === item.id ? { ...s, active_status: newStatus } : s));
        if (selectedState?.id === item.id) {
          setSelectedState(prev => prev ? { ...prev, active_status: newStatus } : null);
        }
      } else if (type === 'city') {
        setCities(prev => prev.map(ci => ci.id === item.id ? { ...ci, active_status: newStatus } : ci));
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteRecord = async (type: 'country' | 'state' | 'city', item: any) => {
    const itemName = item.country_name || item.state_name || item.city_name || 'this record';
    if (!window.confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const authHeaders = await getAuthHeader();
      const table = type === 'country' ? 'countries' : type === 'state' ? 'states' : 'cities';

      const res = await fetch(`${API_BASE}/api.php?table=${table}&id=${item.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (!res.ok) throw new Error("Failed to delete record");

      toast({ title: "Deleted Successfully", description: `"${itemName}" has been removed.` });

      if (type === 'country') {
        if (selectedCountry?.id === item.id) {
          setSelectedCountry(null);
          setSelectedState(null);
          setStates([]);
          setCities([]);
        }
        initLoad();
      } else if (type === 'state') {
        if (selectedState?.id === item.id) {
          setSelectedState(null);
          setCities([]);
        }
        if (selectedCountry) loadStatesForCountry(selectedCountry.id);
      } else if (type === 'city') {
        if (selectedState) loadCitiesForState(selectedState.id);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete record", variant: "destructive" });
    }
  };

  // --- CRUD: EDIT ITEM HANDLERS ---
  const handleOpenEditModal = (type: 'country' | 'state' | 'city', item: any) => {
    setEditType(type);
    setEditItem(item);
    setEditForm({
      name: item.country_name || item.state_name || item.city_name || '',
      code: item.country_code || item.state_code || '',
      type: item.destination_type || 'Leisure',
      state_id: String(item.state_id || selectedState?.id || ''),
      country_id: String(item.country_id || selectedCountry?.id || '')
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editForm.name.trim()) return;

    try {
      const authHeaders = await getAuthHeader();
      const table = editType === 'country' ? 'countries' : editType === 'state' ? 'states' : 'cities';
      
      let payload: any = {};
      if (editType === 'country') {
        payload = { country_name: editForm.name.trim(), country_code: editForm.code.trim().toUpperCase() };
      } else if (editType === 'state') {
        payload = { 
          state_name: editForm.name.trim(), 
          state_code: editForm.code.trim().toUpperCase(),
          ...(editForm.country_id ? { country_id: parseInt(editForm.country_id, 10) || editForm.country_id } : {})
        };
      } else if (editType === 'city') {
        payload = { 
          city_name: editForm.name.trim(), 
          name: editForm.name.trim(), 
          destination_type: editForm.type,
          ...(editForm.state_id ? { state_id: parseInt(editForm.state_id, 10) || editForm.state_id } : {})
        };
      }

      const res = await fetch(`${API_BASE}/api.php?table=${table}&id=${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to update record");

      toast({ title: "Updated Successfully", description: `${editForm.name} details saved.` });
      setEditModalOpen(false);

      if (editType === 'country') {
        initLoad();
      } else if (editType === 'state' && selectedCountry) {
        loadStatesForCountry(selectedCountry.id);
      } else if (editType === 'city' && selectedState) {
        loadCitiesForState(selectedState.id);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // --- CSV EXPORT & IMPORT HANDLERS ---
  const handleExportCSV = () => {
    let csvContent = "";
    let fileName = "Destinations_Master.csv";

    if (selectedState) {
      csvContent = "City Name,State Name,Country Name,Destination Type,Status\n" +
        cities.map(c => `"${c.city_name}","${selectedState.state_name}","${selectedCountry?.country_name || ''}","${c.destination_type || 'Leisure'}","${c.active_status ? 'Active' : 'Inactive'}"`).join("\n");
      fileName = `${selectedState.state_name}_Cities.csv`;
    } else if (selectedCountry) {
      csvContent = "State Name,State Code,Country Name,Status\n" +
        states.map(s => `"${s.state_name}","${s.state_code || ''}","${selectedCountry.country_name}","${s.active_status ? 'Active' : 'Inactive'}"`).join("\n");
      fileName = `${selectedCountry.country_name}_States.csv`;
    } else {
      csvContent = "Country Name,Country Code,Status\n" +
        countries.map(c => `"${c.country_name}","${c.country_code || ''}","${c.active_status ? 'Active' : 'Inactive'}"`).join("\n");
      fileName = "Countries_Master.csv";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setImporting(false);
        return;
      }

      try {
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.replace(/^["']|["']$/g, '').trim()));
        const dataRows = rows.slice(1).filter(r => r.length > 0 && r[0]);

        const authHeaders = await getAuthHeader();
        let successCount = 0;
        let skipCount = 0;

        if (importTarget === 'countries') {
          for (const row of dataRows) {
            const country_name = row[0];
            const country_code = row[1] || '';
            const active_status = row[2]?.toLowerCase() !== 'inactive';

            const existRes = await fetch(`${API_BASE}/api.php?table=countries&country_name=${encodeURIComponent(country_name)}`);
            const existData = existRes.ok ? await existRes.json() : null;
            if (existData && existData.length > 0) {
              skipCount++;
              continue;
            }

            const res = await fetch(`${API_BASE}/api.php?table=countries`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify({ country_name, country_code, active_status: active_status ? 1 : 0 })
            });
            if (res.ok) successCount++;
            else skipCount++;
          }
        } else if (importTarget === 'states') {
          for (const row of dataRows) {
            const state_name = row[0];
            const state_code = row[1] || '';
            const country_name = row[2];
            const active_status = row[3]?.toLowerCase() !== 'inactive';

            const cRes = await fetch(`${API_BASE}/api.php?table=countries&country_name=${encodeURIComponent(country_name)}`);
            const cData = cRes.ok ? (await cRes.json())?.[0] : null;
            if (!cData) {
              skipCount++;
              continue;
            }

            const existRes = await fetch(`${API_BASE}/api.php?table=states&state_name=${encodeURIComponent(state_name)}&country_id=${cData.id}`);
            const existData = existRes.ok ? await existRes.json() : null;
            if (existData && existData.length > 0) {
              skipCount++;
              continue;
            }

            const res = await fetch(`${API_BASE}/api.php?table=states`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify({ state_name, state_code, country_id: cData.id, active_status: active_status ? 1 : 0 })
            });
            if (res.ok) successCount++;
            else skipCount++;
          }
        } else if (importTarget === 'cities') {
          for (const row of dataRows) {
            const city_name = row[0];
            const state_name = row[1];
            const country_name = row[2];
            const destination_type = row[3] || 'Leisure';
            const active_status = row[4]?.toLowerCase() !== 'inactive';

            const cRes = await fetch(`${API_BASE}/api.php?table=countries&country_name=${encodeURIComponent(country_name)}`);
            const cData = cRes.ok ? (await cRes.json())?.[0] : null;
            if (!cData) {
              skipCount++;
              continue;
            }

            const sRes = await fetch(`${API_BASE}/api.php?table=states&state_name=${encodeURIComponent(state_name)}&country_id=${cData.id}`);
            const sData = sRes.ok ? (await sRes.json())?.[0] : null;
            if (!sData) {
              skipCount++;
              continue;
            }

            const existRes = await fetch(`${API_BASE}/api.php?table=cities&city_name=${encodeURIComponent(city_name)}&state=${encodeURIComponent(sData.state_name)}`);
            const existData = existRes.ok ? await existRes.json() : null;
            if (existData && existData.length > 0) {
              skipCount++;
              continue;
            }

            const res = await fetch(`${API_BASE}/api.php?table=cities`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify({ 
                city_name, 
                name: city_name, 
                state_id: sData.id, 
                state: sData.state_name, 
                country: country_name, 
                destination_type, 
                active_status: active_status ? 1 : 0 
              })
            });
            if (res.ok) successCount++;
            else skipCount++;
          }
        }

        toast({
          title: "Import Finished",
          description: `Successfully inserted ${successCount} records. Skipped ${skipCount} duplicates.`,
        });

        setImportModalOpen(false);
        initLoad();
      } catch (err: any) {
        toast({ title: "Import Error", description: err.message, variant: "destructive" });
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- FILTERING LOGIC FOR PANELS ---
  const filteredCountriesList = countries.filter(c => {
    const q = (globalSearch || countryFilter).toLowerCase().trim();
    if (!q) return true;
    return c.country_name.toLowerCase().includes(q) || (c.country_code || '').toLowerCase().includes(q);
  });

  const filteredStatesList = states.filter(s => {
    const q = (globalSearch || stateFilter).toLowerCase().trim();
    if (!q) return true;
    return s.state_name.toLowerCase().includes(q) || (s.state_code || '').toLowerCase().includes(q);
  });

  const filteredCitiesList = cities.filter(ci => {
    const q = (globalSearch || cityFilter).toLowerCase().trim();
    if (!q) return true;
    return ci.city_name.toLowerCase().includes(q) || (ci.destination_type || '').toLowerCase().includes(q);
  });

  // Category badge colors for Cities
  const getCategoryBadgeClass = (type: string | null) => {
    switch (type) {
      case 'Pilgrimage':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400';
      case 'Leisure':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400';
      case 'Adventure':
        return 'bg-green-500/10 text-green-600 border-green-500/30 dark:bg-green-500/20 dark:text-green-400';
      case 'Beach':
        return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-400';
      case 'Honeymoon':
        return 'bg-pink-500/10 text-pink-600 border-pink-500/30 dark:bg-pink-500/20 dark:text-pink-400';
      case 'Wildlife':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background min-h-[calc(100vh-100px)] rounded-xl border border-border overflow-hidden shadow-sm">
      
      {/* PAGE HEADER */}
      <header className="border-b border-border px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-muted-foreground">CRM</span>
          <span className="text-muted-foreground">›</span>
          <span className="text-muted-foreground">Settings</span>
          <span className="text-muted-foreground">›</span>
          <span className="text-amber-500 font-bold flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Destinations Master
          </span>
        </div>

        {/* Center: Breathing Space */}

        {/* Right: Search + Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search across all columns..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/30 focus-visible:ring-amber-500"
            />
          </div>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setImportModalOpen(true)} 
            className="border-border/60 text-xs h-8 px-3 shrink-0"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            Import CSV
          </Button>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleExportCSV} 
            className="border-border/60 text-xs h-8 px-3 shrink-0"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
            Export
          </Button>

          <Button 
            size="sm" 
            variant="ghost" 
            onClick={initLoad} 
            className="h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-foreground"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {/* STATS STRIP */}
      <div className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-border py-2 px-6 flex items-center gap-3 overflow-x-auto">
        <div className="bg-background border border-border rounded-full font-semibold text-xs px-3 py-1 text-foreground flex items-center gap-1.5 shadow-2xs shrink-0">
          <span>🌐</span>
          <span>Countries: <strong className="text-amber-500">{totalCountriesCount}</strong></span>
        </div>
        <div className="bg-background border border-border rounded-full font-semibold text-xs px-3 py-1 text-foreground flex items-center gap-1.5 shadow-2xs shrink-0">
          <span>🗺</span>
          <span>States: <strong className="text-blue-500">{totalStatesCount}</strong></span>
        </div>
        <div className="bg-background border border-border rounded-full font-semibold text-xs px-3 py-1 text-foreground flex items-center gap-1.5 shadow-2xs shrink-0">
          <span>📍</span>
          <span>Cities / Destinations: <strong className="text-green-500">{totalCitiesCount}</strong></span>
        </div>
      </div>

      {/* THREE-PANEL CASCADE CONTAINER */}
      <div className="flex flex-1 overflow-hidden divide-x divide-border min-h-[520px]">
        
        {/* PANEL 1: COUNTRIES PANEL (240px width) */}
        <div className="w-[240px] flex-shrink-0 flex flex-col bg-card">
          {/* Panel Header */}
          <div className="px-3 py-2 border-b border-border bg-slate-50/50 dark:bg-slate-900/40 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <span>🌐</span> Countries
            </span>
            <button
              type="button"
              onClick={() => setShowAddCountry(!showAddCountry)}
              className="w-5 h-5 rounded bg-[rgba(201,162,90,0.15)] text-[#C9A25A] hover:bg-[#C9A25A]/25 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
              title="Add New Country"
            >
              +
            </button>
          </div>

          {/* Panel Inline Search */}
          <div className="px-2 py-1.5 border-b border-border/50">
            <Input
              placeholder="Filter countries..."
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="h-7 text-xs bg-muted/40 rounded-md border-border/40 focus-visible:ring-amber-500"
            />
          </div>

          {/* Inline Add Country Form */}
          {showAddCountry && (
            <form onSubmit={handleCreateCountry} className="p-2 border-b border-amber-500/30 bg-amber-500/5 space-y-2 animate-in slide-in-from-top-2 duration-150">
              <div className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wide">Add Country</div>
              <Input
                placeholder="Country Name (e.g. India)"
                value={newCountryName}
                onChange={(e) => setNewCountryName(e.target.value)}
                className="h-7 text-xs bg-background"
                required
                autoFocus
              />
              <div className="flex gap-1.5">
                <Input
                  placeholder="Code (IN)"
                  value={newCountryCode}
                  onChange={(e) => setNewCountryCode(e.target.value)}
                  className="h-7 text-xs bg-background w-20 uppercase font-mono"
                  maxLength={5}
                />
                <div className="flex gap-1 flex-1 justify-end">
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={() => setShowAddCountry(false)}>Cancel</Button>
                  <Button type="submit" size="sm" className="h-7 text-[11px] px-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">Save</Button>
                </div>
              </div>
            </form>
          )}

          {/* Countries List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {filteredCountriesList.length === 0 ? (
              <div className="text-[11px] text-muted-foreground text-center py-8">
                No countries found
              </div>
            ) : (
              filteredCountriesList.map((country) => {
                const isSelected = selectedCountry?.id === country.id;
                return (
                  <div
                    key={country.id}
                    onClick={() => handleSelectCountry(country)}
                    className={`flex items-center justify-between px-2.5 py-2 cursor-pointer text-xs transition-all rounded-md mx-0.5 my-0.5 group ${
                      isSelected
                        ? 'bg-[rgba(201,162,90,0.12)] border-l-2 border-[#C9A25A] text-foreground font-semibold rounded-r-md'
                        : 'hover:bg-muted/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-medium text-[13px] truncate">{country.country_name}</span>
                      {country.country_code && (
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{country.country_code}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {country.state_count ?? 0} states
                      </span>
                      
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal('country', country); }}
                        className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-amber-500 text-muted-foreground transition-opacity"
                        title="Edit Country"
                      >
                        <Edit className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteRecord('country', country); }}
                        className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-red-500 text-muted-foreground transition-opacity"
                        title="Delete Country"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus('country', country); }}
                        className={`p-0.5 transition-colors ${country.active_status ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`}
                        title={country.active_status ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                      >
                        <Power className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: STATES PANEL (260px width) */}
        <div className="w-[260px] flex-shrink-0 flex flex-col bg-card">
          {/* Panel Header */}
          <div className="px-3 py-2 border-b border-border bg-slate-50/50 dark:bg-slate-900/40 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate" title={selectedCountry ? selectedCountry.country_name : ''}>
              🗺 States {selectedCountry ? `· ${selectedCountry.country_name}` : ''}
            </span>
            {selectedCountry && (
              <button
                type="button"
                onClick={() => setShowAddState(!showAddState)}
                className="w-5 h-5 rounded bg-[rgba(201,162,90,0.15)] text-[#C9A25A] hover:bg-[#C9A25A]/25 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                title="Add New State"
              >
                +
              </button>
            )}
          </div>

          {selectedCountry ? (
            <>
              {/* Panel Inline Search */}
              <div className="px-2 py-1.5 border-b border-border/50">
                <Input
                  placeholder="Filter states..."
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="h-7 text-xs bg-muted/40 rounded-md border-border/40 focus-visible:ring-amber-500"
                />
              </div>

              {/* Inline Add State Form */}
              {showAddState && (
                <form onSubmit={handleCreateState} className="p-2 border-b border-blue-500/30 bg-blue-500/5 space-y-2 animate-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-extrabold text-blue-500 uppercase tracking-wide">Add State to {selectedCountry.country_name}</div>
                  <Input
                    placeholder="State Name (e.g. Uttarakhand)"
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                    className="h-7 text-xs bg-background"
                    required
                    autoFocus
                  />
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="Code (UK)"
                      value={newStateCode}
                      onChange={(e) => setNewStateCode(e.target.value)}
                      className="h-7 text-xs bg-background w-20 uppercase font-mono"
                      maxLength={5}
                    />
                    <div className="flex gap-1 flex-1 justify-end">
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={() => setShowAddState(false)}>Cancel</Button>
                      <Button type="submit" size="sm" className="h-7 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold">Save</Button>
                    </div>
                  </div>
                </form>
              )}

              {/* States List */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                {filteredStatesList.length === 0 ? (
                  <div className="text-[11px] text-muted-foreground text-center py-8">
                    No states registered under {selectedCountry.country_name}
                  </div>
                ) : (
                  filteredStatesList.map((state) => {
                    const isSelected = selectedState?.id === state.id;
                    return (
                      <div
                        key={state.id}
                        onClick={() => handleSelectState(state)}
                        className={`flex items-center justify-between px-2.5 py-2 cursor-pointer text-xs transition-all rounded-md mx-0.5 my-0.5 group ${
                          isSelected
                            ? 'bg-[rgba(201,162,90,0.12)] border-l-2 border-[#C9A25A] text-foreground font-semibold rounded-r-md'
                            : 'hover:bg-muted/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-medium text-[13px] truncate">{state.state_name}</span>
                          {state.state_code && (
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{state.state_code}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {cityCountMap[String(state.id)] ?? state.city_count ?? 0} cities
                          </span>
                          
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal('state', state); }}
                            className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-amber-500 text-muted-foreground transition-opacity"
                            title="Edit State"
                          >
                            <Edit className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteRecord('state', state); }}
                            className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-red-500 text-muted-foreground transition-opacity"
                            title="Delete State"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus('state', state); }}
                            className={`p-0.5 transition-colors ${state.active_status ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`}
                            title={state.active_status ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                          >
                            <Power className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground text-xs text-center py-16 px-4 flex flex-col items-center gap-2">
              <span className="text-2xl">←</span>
              <span>Select a country first</span>
            </div>
          )}
        </div>

        {/* PANEL 3: CITIES PANEL (Vertical List - 260px width) */}
        <div className="w-[260px] flex-shrink-0 flex flex-col bg-card">
          {/* Panel Header */}
          <div className="px-3 py-2 border-b border-border bg-slate-50/50 dark:bg-slate-900/40 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate" title={selectedState ? selectedState.state_name : ''}>
              📍 Cities {selectedState ? `· ${selectedState.state_name}` : ''}
            </span>
            {selectedState && (
              <button
                type="button"
                onClick={() => setShowAddCity(!showAddCity)}
                className="w-5 h-5 rounded bg-[rgba(201,162,90,0.15)] text-[#C9A25A] hover:bg-[#C9A25A]/25 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                title="Add New City"
              >
                +
              </button>
            )}
          </div>

          {selectedState ? (
            <>
              {/* Panel Inline Search */}
              <div className="px-2 py-1.5 border-b border-border/50">
                <Input
                  placeholder="Filter cities..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="h-7 text-xs bg-muted/40 rounded-md border-border/40 focus-visible:ring-amber-500"
                />
              </div>

              {/* Inline Add City Form */}
              {showAddCity && (
                <form onSubmit={handleCreateCity} className="p-2 border-b border-green-500/30 bg-green-500/5 space-y-2 animate-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-extrabold text-green-600 dark:text-green-400 uppercase tracking-wide">
                    Add City
                  </div>
                  <Input
                    placeholder="City Name (e.g. Rishikesh)"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    className="h-7 text-xs bg-background"
                    required
                    autoFocus
                  />
                  <Select value={newCityType} onValueChange={setNewCityType}>
                    <SelectTrigger className="h-7 text-xs bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leisure">Leisure / Sightseeing</SelectItem>
                      <SelectItem value="Adventure">Adventure / Trekking</SelectItem>
                      <SelectItem value="Pilgrimage">Pilgrimage / Spiritual</SelectItem>
                      <SelectItem value="Wildlife">Wildlife / Nature</SelectItem>
                      <SelectItem value="Beach">Beach / Coastal</SelectItem>
                      <SelectItem value="Honeymoon">Honeymoon Romantic</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1.5 justify-end pt-1">
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px] px-2.5" onClick={() => setShowAddCity(false)}>Cancel</Button>
                    <Button type="submit" size="sm" className="h-7 text-[11px] px-3 bg-green-600 hover:bg-green-700 text-white font-bold">Save</Button>
                  </div>
                </form>
              )}

              {/* Cities Vertical List */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                {filteredCitiesList.length === 0 ? (
                  <div className="text-[11px] text-muted-foreground text-center py-10">
                    No cities registered under {selectedState.state_name}
                  </div>
                ) : (
                  filteredCitiesList.map((city) => {
                    const isCitySelected = selectedCity?.id === city.id;
                    return (
                      <div
                        key={city.id}
                        onClick={() => handleSelectCity(city)}
                        className={`flex items-center justify-between px-2.5 py-2 cursor-pointer text-xs transition-all rounded-md mx-0.5 my-0.5 group ${
                          isCitySelected
                            ? 'bg-[rgba(201,162,90,0.12)] border-l-2 border-[#C9A25A] text-foreground font-semibold rounded-r-md'
                            : 'hover:bg-muted/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          <span className="font-medium text-[13px] truncate">{city.city_name}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-[8px] font-bold py-0 px-1 shrink-0 ${getCategoryBadgeClass(city.destination_type)}`}
                          >
                            {city.destination_type || 'Leisure'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal('city', city); }}
                            className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-amber-500 text-muted-foreground transition-opacity"
                            title="Edit City"
                          >
                            <Edit className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteRecord('city', city); }}
                            className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-red-500 text-muted-foreground transition-opacity"
                            title="Delete City"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus('city', city); }}
                            className={`p-0.5 transition-colors ${city.active_status ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`}
                            title={city.active_status ? 'Active (Click to Deactivate)' : 'Inactive (Click to Activate)'}
                          >
                            <Power className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="text-muted-foreground text-[11px] text-center py-16 px-3 flex flex-col items-center gap-1.5">
              <span className="text-xl">←</span>
              <span>Select a state</span>
            </div>
          )}
        </div>

        {/* PANEL 4: PLACES & ACTIVITIES PANEL (Beside Cities Column - Fills Remaining Width) */}
        <div className="flex-1 flex flex-col bg-card overflow-hidden">
          {selectedCity ? (
            <>
              {/* Panel Header */}
              <div className="px-4 py-2.5 border-b border-border bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Compass className="w-4 h-4 text-[#C9A25A] shrink-0" />
                  <span className="text-xs font-extrabold uppercase tracking-wide text-foreground truncate">
                    Places &amp; Activities · {selectedCity.city_name}
                  </span>
                  <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-500 font-bold shrink-0">
                    {selectedState?.state_name}, {selectedCountry?.country_name}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedCity(null); setCitySightseeings([]); setCityActivities([]); }}
                  className="text-muted-foreground hover:text-foreground p-1 text-xs"
                  title="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Tabs value={inventoryTab} onValueChange={(v) => setInventoryTab(v as 'places' | 'activities')} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 pt-2.5 flex items-center justify-between gap-3 flex-wrap border-b border-border/40 pb-2">
                  <TabsList className="h-8">
                    <TabsTrigger value="places" className="text-xs h-7 gap-1.5">
                      <Ticket className="w-3.5 h-3.5" /> Places ({citySightseeings.length})
                    </TabsTrigger>
                    <TabsTrigger value="activities" className="text-xs h-7 gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> Activities ({cityActivities.length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] px-2.5"
                      onClick={() => { setShowAddPlace(!showAddPlace); setShowAddActivity(false); }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Place
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] px-2.5"
                      onClick={() => { setShowAddActivity(!showAddActivity); setShowAddPlace(false); }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Activity
                    </Button>
                  </div>
                </div>

                {/* Inline Add Place Form */}
                {showAddPlace && (
                  <form onSubmit={handleCreatePlace} className="mx-4 mt-2.5 p-3 border border-green-500/30 bg-green-500/5 rounded-md space-y-2 animate-in slide-in-from-top-2 duration-150">
                    <div className="text-[11px] font-extrabold text-green-600 dark:text-green-400 uppercase tracking-wide">
                      Add Place to {selectedCity.city_name}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        placeholder="Place name (e.g. Sarafa Night Food Street)"
                        value={newPlace.name}
                        onChange={(e) => setNewPlace(p => ({ ...p, name: e.target.value }))}
                        className="h-7 text-xs bg-background sm:col-span-2"
                        required
                        autoFocus
                      />
                      <Input
                        placeholder="Duration (e.g. 2 Hours)"
                        value={newPlace.duration}
                        onChange={(e) => setNewPlace(p => ({ ...p, duration: e.target.value }))}
                        className="h-7 text-xs bg-background"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Adult ₹"
                          value={newPlace.adult_cost}
                          onChange={(e) => setNewPlace(p => ({ ...p, adult_cost: e.target.value }))}
                          className="h-7 text-xs bg-background"
                        />
                        <Input
                          type="number"
                          placeholder="Child ₹"
                          value={newPlace.child_cost}
                          onChange={(e) => setNewPlace(p => ({ ...p, child_cost: e.target.value }))}
                          className="h-7 text-xs bg-background"
                        />
                      </div>
                    </div>
                    <Input
                      placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                      value={newPlace.image_url}
                      onChange={(e) => setNewPlace(p => ({ ...p, image_url: e.target.value }))}
                      className="h-7 text-xs bg-background"
                    />
                    <Textarea
                      placeholder="Short description (optional)"
                      value={newPlace.description}
                      onChange={(e) => setNewPlace(p => ({ ...p, description: e.target.value }))}
                      className="text-xs bg-background min-h-[45px]"
                    />
                    <div className="flex gap-1.5 justify-end pt-1">
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px] px-2.5" onClick={() => setShowAddPlace(false)}>Cancel</Button>
                      <Button type="submit" size="sm" disabled={savingPlace} className="h-7 text-[11px] px-3 bg-green-600 hover:bg-green-700 text-white font-bold">
                        {savingPlace ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Place'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Inline Add Activity Form */}
                {showAddActivity && (
                  <form onSubmit={handleCreateActivity} className="mx-4 mt-2.5 p-3 border border-blue-500/30 bg-blue-500/5 rounded-md space-y-2 animate-in slide-in-from-top-2 duration-150">
                    <div className="text-[11px] font-extrabold text-blue-500 uppercase tracking-wide">
                      Add Activity to {selectedCity.city_name}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        placeholder="Activity name (e.g. Jungle Safari & Nature Walk)"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity(a => ({ ...a, name: e.target.value }))}
                        className="h-7 text-xs bg-background sm:col-span-2"
                        required
                        autoFocus
                      />
                      <Select value={newActivity.category} onValueChange={(v) => setNewActivity(a => ({ ...a, category: v }))}>
                        <SelectTrigger className="h-7 text-xs bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Adventure">Adventure</SelectItem>
                          <SelectItem value="Wildlife Safari">Wildlife Safari</SelectItem>
                          <SelectItem value="Water Sports">Water Sports</SelectItem>
                          <SelectItem value="Sightseeing">Sightseeing</SelectItem>
                          <SelectItem value="Cultural">Cultural</SelectItem>
                          <SelectItem value="Nature">Nature</SelectItem>
                          <SelectItem value="Shopping">Shopping</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Duration (e.g. Half-Day)"
                        value={newActivity.duration}
                        onChange={(e) => setNewActivity(a => ({ ...a, duration: e.target.value }))}
                        className="h-7 text-xs bg-background"
                      />
                      <div className="flex gap-2 sm:col-span-2">
                        <Input
                          type="number"
                          placeholder="Adult ₹"
                          value={newActivity.adult_cost}
                          onChange={(e) => setNewActivity(a => ({ ...a, adult_cost: e.target.value }))}
                          className="h-7 text-xs bg-background"
                        />
                        <Input
                          type="number"
                          placeholder="Child ₹"
                          value={newActivity.child_cost}
                          onChange={(e) => setNewActivity(a => ({ ...a, child_cost: e.target.value }))}
                          className="h-7 text-xs bg-background"
                        />
                      </div>
                    </div>
                    <div className="flex gap-1.5 justify-end pt-1">
                      <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px] px-2.5" onClick={() => setShowAddActivity(false)}>Cancel</Button>
                      <Button type="submit" size="sm" disabled={savingActivity} className="h-7 text-[11px] px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                        {savingActivity ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Activity'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Inventory List Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {inventoryLoading ? (
                    <div className="flex items-center justify-center py-12 text-xs text-muted-foreground gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      Loading places &amp; activities for {selectedCity.city_name}...
                    </div>
                  ) : inventoryError ? (
                    <div className="text-center py-10 text-xs text-red-500">{inventoryError}</div>
                  ) : (
                    <>
                      <TabsContent value="places" className="mt-0 space-y-2">
                        {citySightseeings.length === 0 ? (
                          <div className="text-center py-12 text-xs text-muted-foreground">
                            No places added yet for {selectedCity.city_name} — click "Add Place" to create one.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                            {citySightseeings.map((place) => (
                              <div key={place.id} className="p-3 rounded-xl border border-border/50 bg-slate-50/60 dark:bg-slate-900/40 hover:border-amber-500/40 transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                    <Ticket className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    {place.sightseeing_name}
                                  </span>
                                  {place.duration && (
                                    <Badge variant="outline" className="text-[9px] shrink-0 font-medium">{place.duration}</Badge>
                                  )}
                                </div>
                                {place.description && (
                                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{place.description}</p>
                                )}
                                <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground font-semibold border-t border-border/30 pt-1.5">
                                  <IndianRupee className="w-3 h-3 text-emerald-500" />
                                  <span>Adult: ₹{place.adult_cost || 0}</span>
                                  {place.child_cost > 0 && <span>· Child: ₹{place.child_cost}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="activities" className="mt-0 space-y-2">
                        {cityActivities.length === 0 ? (
                          <div className="text-center py-12 text-xs text-muted-foreground">
                            No activities added yet for {selectedCity.city_name} — click "Add Activity" to create one.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                            {cityActivities.map((activity) => {
                              const rate = activity.rates[0];
                              return (
                                <div key={activity.id} className="p-3 rounded-xl border border-border/50 bg-slate-50/60 dark:bg-slate-900/40 hover:border-blue-500/40 transition-colors">
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                      <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      {activity.name}
                                    </span>
                                    {activity.category && (
                                      <Badge variant="outline" className="text-[9px] shrink-0 font-medium text-blue-500 border-blue-500/30">{activity.category}</Badge>
                                    )}
                                  </div>
                                  {rate && (
                                    <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground font-semibold border-t border-border/30 pt-1.5">
                                      <IndianRupee className="w-3 h-3 text-emerald-500" />
                                      <span>Adult: ₹{rate.adult_rate || 0}</span>
                                      {rate.child_rate > 0 && <span>· Child: ₹{rate.child_rate}</span>}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </TabsContent>
                    </>
                  )}
                </div>
              </Tabs>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Compass className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <div className="text-xs font-bold text-foreground">No City Selected</div>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[260px]">
                Click any city in the left list to view and manage its tourist places, monuments, and activities side-by-side.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT ITEM INLINE MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-extrabold flex items-center gap-2">
              <Edit className="w-4 h-4 text-amber-500" />
              Edit {editType.toUpperCase()}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update record parameters via secure PHP backend.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="h-8 text-xs"
                required
              />
            </div>

            {editType !== 'city' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Code (Optional)</Label>
                <Input
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                  className="h-8 text-xs uppercase font-mono"
                  maxLength={5}
                />
              </div>
            )}

            {editType === 'state' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Country Association</Label>
                <Select value={editForm.country_id} onValueChange={(val) => setEditForm({ ...editForm, country_id: val })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select Country" /></SelectTrigger>
                  <SelectContent>
                    {countries.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.country_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {editType === 'city' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">State Association</Label>
                  <Select value={editForm.state_id} onValueChange={(val) => setEditForm({ ...editForm, state_id: val })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select State" /></SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {states.map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.state_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Category / Type</Label>
                  <Select value={editForm.type} onValueChange={(val) => setEditForm({ ...editForm, type: val })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leisure">Leisure / Sightseeing</SelectItem>
                      <SelectItem value="Adventure">Adventure / Trekking</SelectItem>
                      <SelectItem value="Pilgrimage">Pilgrimage / Spiritual</SelectItem>
                      <SelectItem value="Wildlife">Wildlife / Nature</SelectItem>
                      <SelectItem value="Beach">Beach / Coastal</SelectItem>
                      <SelectItem value="Honeymoon">Honeymoon Romantic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <DialogFooter className="pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* BULK CSV IMPORT DIALOG */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-extrabold flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-500" />
              Bulk Import Destinations CSV
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select destination database type and upload CSV file to import via PHP API.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold">Target Database</Label>
              <Select value={importTarget} onValueChange={(val: any) => setImportTarget(val)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="countries">Countries Database</SelectItem>
                  <SelectItem value="states">States Database</SelectItem>
                  <SelectItem value="cities">Cities Database</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted/40 border border-border/40 rounded-lg space-y-1">
              <p className="font-bold flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Expected Headers:</p>
              {importTarget === 'countries' && <code className="block text-[10px] text-muted-foreground font-mono">country_name, country_code, active_status</code>}
              {importTarget === 'states' && <code className="block text-[10px] text-muted-foreground font-mono">state_name, state_code, country_name, active_status</code>}
              {importTarget === 'cities' && <code className="block text-[10px] text-muted-foreground font-mono">city_name, state_name, country_name, destination_type, active_status</code>}
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold">Choose CSV File</Label>
              <Input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCSVImport}
                disabled={importing}
                className="cursor-pointer h-9 text-xs file:bg-amber-500/10 file:text-amber-700 file:border-0 file:rounded file:px-2 file:py-0.5 file:font-semibold"
              />
            </div>

            {importing && (
              <div className="flex justify-center items-center py-3 text-xs font-semibold text-amber-600 dark:text-amber-400 gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Inserting records via PHP API...
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => setImportModalOpen(false)} disabled={importing}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
