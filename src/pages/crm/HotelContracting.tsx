import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
import { HotelContractWizard } from './HotelContractWizard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, Plus, Search, Edit, Power, Download, Upload, UploadCloud,
  Info, HelpCircle, FileText, CheckCircle2, AlertTriangle, Loader2,
  MapPin, Star, Users, Phone, Mail, Globe, Sparkles, DollarSign,
  ArrowRight, Landmark, Calendar, Trash2, Layers, RefreshCw, Clock
} from 'lucide-react';
import { reviewService, type GoogleReview } from '@/services/reviewService';
import { getContractedHotelsMasterList } from '@/data/contractedHotelsDataLoader';
import { resolveGeography, INDIAN_STATES, INTERNATIONAL_STATE_COUNTRY_MAP, CITY_TO_STATE_COUNTRY_MAP } from '@/data/geographyMaster';
import { fetchCachedJson } from '@/utils/crmCache';
import { crmFetch } from '@/utils/crmApi';

// Types matching database schema
type Country = { id: string; country_name: string };
type State = { id: string; state_name: string; country_id: string };
type City = { id: string; city_name: string; state_id: string };

type Hotel = {
  id: string;
  hotel_name: string;
  hotel_code: string;
  city_id: string;
  state_id: string;
  country_id: string;
  address: string | null;
  star_rating: number | null;
  contact_number: string | null;
  email: string | null;
  website: string | null;
  google_rating: number | null;
  internal_rating: number | null;
  active_status: boolean;
  contact_person: string | null;
  contact_email: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  meal_plan_supported: string[] | null;
  cancellation_policy: string | null;
  cities?: { city_name: string };
  states?: { state_name: string };
  countries?: { country_name: string };
};

type RoomCategory = {
  id: string;
  hotel_id: string;
  room_category_name: string;
  room_size: string | null;
  max_adults: number;
  max_children: number;
  bed_type: string | null;
  room_description: string | null;
  active_status: boolean;
};

type Season = {
  id: string;
  hotel_id: string;
  season_name: string;
  season_type: string; // Peak, High, Shoulder, Low, etc.
  start_date: string;
  end_date: string;
};

type Supplier = {
  id: string;
  supplier_name: string;
  supplier_type: string;
  contact_person: string | null;
  email: string | null;
  mobile: string | null;
  payment_terms: string | null;
  active_status: boolean;
};

type Contract = {
  id: string;
  hotel_id: string;
  supplier_id: string | null;
  contract_name: string;
  valid_from: string;
  valid_to: string;
  currency: string;
  gst_percentage: number;
  payment_policy: string | null;
  cancellation_policy: string | null;
  active_status: boolean;
  hotels?: { hotel_name: string };
  hotel_suppliers?: { supplier_name: string };
};

type ContractRate = {
  id: string;
  contract_id: string;
  room_category_id: string;
  meal_plan_id: string;
  season_id: string | null;
  single_rate: number;
  double_rate: number;
  triple_rate: number;
  quad_rate: number;
  five_bed_rate: number;
  six_bed_rate: number;
  extra_adult_rate: number;
  child_with_bed_rate: number;
  child_without_bed_rate: number;
  weekend_surcharge: number;
  peak_season_surcharge: number;
  active_status: boolean;
  room_categories?: { room_category_name: string };
  seasons?: { season_name: string };
};

const getSuggestedTaxRate = (countryName: string | undefined, rate: number, isInclusive: boolean): number => {
  if (!countryName) return 18;
  const c = countryName.toLowerCase();
  if (c.includes('india')) {
    if (isInclusive) {
      if (rate < 1000) return 0;
      if (rate >= 1000 && rate < 8400) return 12;
      return 18;
    } else {
      if (rate < 1000) return 0;
      if (rate >= 1000 && rate < 7500) return 12;
      return 18;
    }
  } else if (c.includes('united arab emirates') || c.includes('uae') || c.includes('dubai')) {
    return 5;
  } else if (c.includes('singapore')) {
    return 9;
  } else if (c.includes('thailand')) {
    return 7;
  } else if (c.includes('malaysia')) {
    return 6;
  }
  return 18; // Default fallback
};

export const HotelContracting: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layout Tab selection
  
  const [loading, setLoading] = useState(false);

  // Shared drop-down data lists
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [mealPlans, setMealPlans] = useState<{ id: string; meal_plan_name: string }[]>([]);

  // Filtering / Search states
  const [hotelSearch, setHotelSearch] = useState('');
  const [hotelFilterCountry, setHotelFilterCountry] = useState('all');
  const [hotelFilterState, setHotelFilterState] = useState('all');
  const [hotelFilterCity, setHotelFilterCity] = useState('all');
  const [hotelFilterStar, setHotelFilterStar] = useState('all');
  const [visibleHotelCount, setVisibleHotelCount] = useState<number>(12);

  // Server-side Pagination & Search Meta
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Primary Entity lists
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [contractRates, setContractRates] = useState<ContractRate[]>([]);

  // Dialog States
  const [reviewsHotelId, setReviewsHotelId] = useState<string | null>(null);
  const [reviewsHotelName, setReviewsHotelName] = useState<string>('');
  const [hotelReviews, setHotelReviews] = useState<GoogleReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const handleOpenReviews = async (hotelId: string, hotelName: string) => {
    setReviewsHotelId(hotelId);
    setReviewsHotelName(hotelName);
    try {
      setLoadingReviews(true);
      const data = await reviewService.getReviewsByHotel(hotelId);
      setHotelReviews(data);
    } catch (err) {
      console.error("Error loading hotel reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Dynamic Country->State->City dropdown selections in forms
  const [formCountryId, setFormCountryId] = useState('');
  const [formStateId, setFormStateId] = useState('');
  const [formStates, setFormStates] = useState<State[]>([]);
  const [formCities, setFormCities] = useState<City[]>([]);

  // Entity Forms
  const [hotelForm, setHotelForm] = useState({
    hotel_name: '',
    hotel_code: '',
    star_rating: 3,
    address: '',
    contact_number: '',
    email: '',
    website: '',
    contact_person: '',
    contact_email: '',
    check_in_time: '12:00',
    check_out_time: '11:00',
    cancellation_policy: '',
    meal_plan_supported: [] as string[],
    google_rating: 4.0,
    internal_rating: 4.0,
    active_status: true
  });

  const [supplierForm, setSupplierForm] = useState({
    supplier_name: '',
    supplier_type: 'Hotel Supplier',
    contact_person: '',
    email: '',
    mobile: '',
    payment_terms: '15 Days Credit',
    active_status: true
  });

  const [roomForm, setRoomForm] = useState({
    room_category_name: '',
    room_size: '',
    max_adults: 2,
    max_children: 2,
    bed_type: 'King Bed',
    room_description: '',
    active_status: true,
    meal_plan_id: 'CP',
    season_id: '',
    single_rate: 0 as number | string,
    double_rate: 0 as number | string,
    triple_rate: 0 as number | string,
    extra_adult_rate: 0 as number | string,
    child_with_bed_rate: 0 as number | string,
    child_without_bed_rate: 0 as number | string,
    map_double_rate: 0 as number | string,
    rate_type: 'exclusive' as 'exclusive' | 'inclusive',
    gst_percentage: 12 as number | string
  });

  const [seasonForm, setSeasonForm] = useState({
    season_name: '',
    season_type: 'High Season',
    start_date: '',
    end_date: ''
  });

  const [contractForm, setContractForm] = useState({
    contract_name: '',
    supplier_id: '',
    valid_from: '',
    valid_to: '',
    currency: 'INR',
    gst_percentage: 18,
    payment_policy: '',
    cancellation_policy: '',
    active_status: true
  });

  const [rateForm, setRateForm] = useState({
    room_category_id: '',
    meal_plan_id: 'CP',
    season_id: '',
    single_rate: 0,
    double_rate: 0,
    triple_rate: 0,
    quad_rate: 0,
    five_bed_rate: 0,
    six_bed_rate: 0,
    extra_adult_rate: 0,
    child_with_bed_rate: 0,
    child_without_bed_rate: 0,
    weekend_surcharge: 0,
    peak_season_surcharge: 0,
    active_status: true,
    rate_type: 'exclusive' as 'exclusive' | 'inclusive',
    gst_percentage: '' as number | '',
    is_tax_overridden: false,
    tax_override_reason: '',
    tax_audit_logs: [] as any[]
  });

  // Hotel Compare list
  const [compareHotelIds, setCompareHotelIds] = useState<string[]>([]);

  // History version log mock for a contract
  const [contractHistoryLogs, setContractHistoryLogs] = useState<any[]>([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Layout Tab selection derived from URL
  let activeMainTab: 'hotels' | 'suppliers' | 'rooms-seasons' | 'contracts' | 'bulk' | 'compare' = 'hotels';
  let isFormPage = false;
  let dialogType: 'hotel' | 'supplier' | 'room' | 'season' | 'contract' | 'rate' | null = null;
  let dialogMode: 'add' | 'edit' | null = null;
  let selectedItemId: string | null = null;

  const path = location.pathname;
  if (path.startsWith('/crm/suppliers')) {
    activeMainTab = 'suppliers';
    if (path === '/crm/suppliers/new') {
      isFormPage = true;
      dialogType = 'supplier';
      dialogMode = 'add';
    } else if (path.startsWith('/crm/suppliers/edit/')) {
      isFormPage = true;
      dialogType = 'supplier';
      dialogMode = 'edit';
      selectedItemId = path.substring('/crm/suppliers/edit/'.length);
    }
  } else if (path.startsWith('/crm/hotels')) {
    if (path === '/crm/hotels/rooms-seasons') {
      activeMainTab = 'rooms-seasons';
    } else if (path === '/crm/hotels/contracts') {
      activeMainTab = 'contracts';
    } else if (path === '/crm/hotels/bulk') {
      activeMainTab = 'bulk';
    } else if (path === '/crm/hotels/compare') {
      activeMainTab = 'compare';
    } else if (path === '/crm/hotels/new') {
      activeMainTab = 'hotels';
      isFormPage = true;
      dialogType = 'hotel';
      dialogMode = 'add';
    } else if (path.startsWith('/crm/hotels/edit/')) {
      activeMainTab = 'hotels';
      isFormPage = true;
      dialogType = 'hotel';
      dialogMode = 'edit';
      selectedItemId = path.substring('/crm/hotels/edit/'.length);
    } else if (path === '/crm/hotels/room/new') {
      activeMainTab = 'rooms-seasons';
      isFormPage = true;
      dialogType = 'room';
      dialogMode = 'add';
    } else if (path.startsWith('/crm/hotels/room/edit/')) {
      activeMainTab = 'rooms-seasons';
      isFormPage = true;
      dialogType = 'room';
      dialogMode = 'edit';
      selectedItemId = path.substring('/crm/hotels/room/edit/'.length);
    } else if (path === '/crm/hotels/season/new') {
      activeMainTab = 'rooms-seasons';
      isFormPage = true;
      dialogType = 'season';
      dialogMode = 'add';
    } else if (path.startsWith('/crm/hotels/season/edit/')) {
      activeMainTab = 'rooms-seasons';
      isFormPage = true;
      dialogType = 'season';
      dialogMode = 'edit';
      selectedItemId = path.substring('/crm/hotels/season/edit/'.length);
    } else if (path === '/crm/hotels/contract/new') {
      activeMainTab = 'contracts';
      isFormPage = true;
      dialogType = 'contract';
      dialogMode = 'add';
    } else if (path.startsWith('/crm/hotels/contract/edit/')) {
      activeMainTab = 'contracts';
      isFormPage = true;
      dialogType = 'contract';
      dialogMode = 'edit';
      selectedItemId = path.substring('/crm/hotels/contract/edit/'.length);
    } else if (path === '/crm/hotels/rate/new') {
      activeMainTab = 'contracts';
      isFormPage = true;
      dialogType = 'rate';
      dialogMode = 'add';
    } else if (path.startsWith('/crm/hotels/rate/edit/')) {
      activeMainTab = 'contracts';
      isFormPage = true;
      dialogType = 'rate';
      dialogMode = 'edit';
      selectedItemId = path.substring('/crm/hotels/rate/edit/'.length);
    }
  }

  const handleCancel = () => {
    if (dialogType === 'hotel') navigate('/crm/hotels');
    else if (dialogType === 'supplier') navigate('/crm/suppliers');
    else if (dialogType === 'room' || dialogType === 'season') navigate('/crm/hotels/rooms-seasons');
    else if (dialogType === 'contract' || dialogType === 'rate') navigate('/crm/hotels/contracts');
    else navigate('/crm/hotels');
  };

  const handleTabChange = (val: string) => {
    if (val === 'suppliers') {
      navigate('/crm/suppliers');
    } else if (val === 'hotels') {
      navigate('/crm/hotels');
    } else {
      navigate(`/crm/hotels/${val}`);
    }
  };

  // Load existing item details for editing
  useEffect(() => {
    if (dialogMode === 'edit' && selectedItemId) {
      if (dialogType === 'hotel' && hotels.length > 0) {
        const item = hotels.find(h => h.id === selectedItemId);
        if (item) {
          setHotelForm({
            hotel_name: item.hotel_name,
            hotel_code: item.hotel_code || '',
            city_id: item.city_id ? String(item.city_id) : '',
            state_id: item.state_id ? String(item.state_id) : '',
            country_id: item.country_id ? String(item.country_id) : '',
            address: item.address || '',
            star_rating: item.star_rating || 3,
            contact_number: item.contact_number || '',
            email: item.email || '',
            website: item.website || '',
            google_rating: Number(item.google_rating) || 0,
            internal_rating: Number(item.internal_rating) || 0,
            active_status: item.active_status,
            contact_person: item.contact_person || '',
            contact_email: item.contact_email || '',
            check_in_time: item.check_in_time || '',
            check_out_time: item.check_out_time || '',
            meal_plan_supported: item.meal_plan_supported || [],
            cancellation_policy: item.cancellation_policy || ''
          });
          setFormCountryId(item.country_id || '');
          setFormStateId(item.state_id || '');
        }
      } else if (dialogType === 'supplier' && suppliers.length > 0) {
        const item = suppliers.find(s => s.id === selectedItemId);
        if (item) {
          setSupplierForm({
            supplier_name: item.supplier_name,
            supplier_type: item.supplier_type,
            contact_person: item.contact_person || '',
            email: item.email || '',
            mobile: item.mobile || '',
            payment_terms: item.payment_terms || '',
            active_status: item.active_status
          });
        }
      } else if (dialogType === 'room' && roomCategories.length > 0) {
        const item = roomCategories.find(r => String(r.id) === String(selectedItemId));
        if (item) {
          const roomRates = contractRates.filter(cr => String(cr.room_category_id) === String(item.id));
          const cpRate = roomRates.find(cr => String(cr.meal_plan_id).toUpperCase() === 'CP') || roomRates[0] || null;
          const mapRate = roomRates.find(cr => String(cr.meal_plan_id).toUpperCase() === 'MAP') || null;
          setRoomForm({
            room_category_name: item.room_category_name,
            room_size: item.room_size || '',
            max_adults: item.max_adults,
            max_children: item.max_children,
            bed_type: item.bed_type || '',
            room_description: item.room_description || '',
            active_status: item.active_status,
            meal_plan_id: cpRate?.meal_plan_id || 'CP',
            season_id: cpRate?.season_id ? String(cpRate.season_id) : (seasons[0]?.id ? String(seasons[0].id) : ''),
            single_rate: cpRate ? Number(cpRate.single_rate || 0) : 0,
            double_rate: cpRate ? Number(cpRate.double_rate || 0) : 0,
            triple_rate: cpRate ? Number(cpRate.triple_rate || 0) : 0,
            extra_adult_rate: cpRate ? Number(cpRate.extra_adult_rate || 0) : 0,
            child_with_bed_rate: cpRate ? Number(cpRate.child_with_bed_rate || 0) : 0,
            child_without_bed_rate: cpRate ? Number(cpRate.child_without_bed_rate || 0) : 0,
            map_double_rate: mapRate ? Number(mapRate.double_rate || 0) : 0,
            rate_type: (cpRate?.rate_type as 'exclusive' | 'inclusive') || 'exclusive',
            gst_percentage: cpRate?.gst_percentage !== undefined && cpRate?.gst_percentage !== null ? Number(cpRate.gst_percentage) : 12
          });
        }
      } else if (dialogType === 'season' && seasons.length > 0) {
        const item = seasons.find(s => s.id === selectedItemId);
        if (item) {
          setSeasonForm({
            season_name: item.season_name,
            season_type: item.season_type,
            start_date: item.start_date,
            end_date: item.end_date
          });
        }
      } else if (dialogType === 'contract' && contracts.length > 0) {
        const item = contracts.find(c => c.id === selectedItemId);
        if (item) {
          setContractForm({
            contract_name: item.contract_name,
            valid_from: item.valid_from,
            valid_to: item.valid_to,
            currency: item.currency,
            gst_percentage: Number(item.gst_percentage),
            payment_policy: item.payment_policy || '',
            cancellation_policy: item.cancellation_policy || '',
            active_status: item.active_status,
            supplier_id: item.supplier_id || ''
          });
        }
      } else if (dialogType === 'rate' && contractRates.length > 0) {
        const item = contractRates.find(r => r.id === selectedItemId);
        if (item) {
          setRateForm({
            room_category_id: item.room_category_id,
            meal_plan_id: item.meal_plan_id,
            season_id: item.season_id || '',
            single_rate: Number(item.single_rate),
            double_rate: Number(item.double_rate),
            triple_rate: Number(item.triple_rate),
            quad_rate: Number(item.quad_rate || 0),
            five_bed_rate: Number(item.five_bed_rate || 0),
            six_bed_rate: Number(item.six_bed_rate || 0),
            extra_adult_rate: Number(item.extra_adult_rate),
            child_with_bed_rate: Number(item.child_with_bed_rate),
            child_without_bed_rate: Number(item.child_without_bed_rate),
            weekend_surcharge: Number(item.weekend_surcharge || 0),
            peak_season_surcharge: Number(item.peak_season_surcharge || 0),
            active_status: item.active_status,
            rate_type: item.rate_type || 'exclusive',
            gst_percentage: item.gst_percentage !== undefined && item.gst_percentage !== null ? item.gst_percentage : '',
            is_tax_overridden: item.is_tax_overridden || false,
            tax_override_reason: item.tax_override_reason || '',
            tax_audit_logs: item.tax_audit_logs || []
          });
        }
      }
    } else if (dialogMode === 'add') {
      if (dialogType === 'hotel') {
        setHotelForm({
          hotel_name: '', hotel_code: '', city_id: '', state_id: '', country_id: '',
          address: '', star_rating: 3, contact_number: '', email: '', website: '',
          google_rating: 0, internal_rating: 0, active_status: true, contact_person: '',
          contact_email: '', check_in_time: '', check_out_time: '', meal_plan_supported: [],
          cancellation_policy: ''
        });
      } else if (dialogType === 'supplier') {
        setSupplierForm({
          supplier_name: '', supplier_type: 'DMC', contact_person: '', email: '', mobile: '', payment_terms: '', active_status: true
        });
      } else if (dialogType === 'room') {
        setRoomForm({
          room_category_name: '',
          room_size: '280',
          max_adults: 2,
          max_children: 1,
          bed_type: 'Double Bed',
          room_description: '',
          active_status: true,
          meal_plan_id: 'CP',
          season_id: seasons[0]?.id ? String(seasons[0].id) : '',
          single_rate: 0,
          double_rate: 0,
          triple_rate: 0,
          extra_adult_rate: 0,
          child_with_bed_rate: 0,
          child_without_bed_rate: 0,
          map_double_rate: 0,
          rate_type: 'exclusive',
          gst_percentage: 12
        });
      } else if (dialogType === 'season') {
        setSeasonForm({
          season_name: '', season_type: 'Standard', start_date: '', end_date: ''
        });
      } else if (dialogType === 'contract') {
        setContractForm({
          contract_name: '', valid_from: '', valid_to: '', currency: 'INR', gst_percentage: 18, payment_policy: '', cancellation_policy: '', active_status: true, supplier_id: ''
        });
      } else if (dialogType === 'rate') {
        setRateForm({
          room_category_id: '', meal_plan_id: 'CP', season_id: '', single_rate: '', double_rate: '', triple_rate: '', extra_adult_rate: '', child_with_bed_rate: '', child_without_bed_rate: '', active_status: true,
          rate_type: 'exclusive', gst_percentage: '', is_tax_overridden: false, tax_override_reason: '', tax_audit_logs: []
        });
      }
    }
  }, [dialogMode, dialogType, selectedItemId, hotels, suppliers, roomCategories, seasons, contracts, contractRates]);


  // Load Geographic baseline data and baseline lists
  useEffect(() => {
    const loadBaselines = async () => {
      try {
        const data = await fetchCachedJson('/php-backend/bootstrap.php');
        if (data && data.success) {
          if (Array.isArray(data.countries)) setCountries(data.countries);
          if (Array.isArray(data.meal_plans)) setMealPlans(data.meal_plans);
          if (Array.isArray(data.suppliers)) {
            setSuppliers(data.suppliers.filter((s: any) => s.active_status));
          }
        }
      } catch (err) {
        console.error('Error loading lightweight bootstrap metadata:', err);
      }
    };
    loadBaselines();
  }, []);

  // Fetch lists based on selected main tab
  useEffect(() => {
    fetchMainTabData();
  }, [activeMainTab]);

  // Fetch Room Categories and Seasons when Selected Hotel Changes
  useEffect(() => {
    if (selectedHotelId) {
      fetchRoomsAndSeasons(selectedHotelId);
      fetchContractsForHotel(selectedHotelId);
    } else {
      setRoomCategories([]);
      setSeasons([]);
      setContracts([]);
      setSelectedContractId('');
      setContractRates([]);
    }
  }, [selectedHotelId]);

  // Fetch rates when active Contract changes
  useEffect(() => {
    if (selectedContractId) {
      fetchContractRates(selectedContractId);
      fetchContractHistory(selectedContractId);
    } else {
      setContractRates([]);
      setContractHistoryLogs([]);
    }
  }, [selectedContractId]);

  // Handle Dynamic Geographic drop-down state updates inside wizard/form
  useEffect(() => {
    if (formCountryId) {
      const filteredStates = states.filter(s => s.country_id === formCountryId);
      setFormStates(filteredStates);
      setFormCities([]);
      setFormStateId('');
    } else {
      setFormStates([]);
      setFormCities([]);
    }
  }, [formCountryId, states]);

  useEffect(() => {
    if (formStateId) {
      const stateObj = states.find(s => String(s.id) === String(formStateId));
      const stateName = stateObj ? stateObj.state_name : '';
      const filteredCities = cities.filter(c => c.state === stateName);
      setFormCities(filteredCities);
    } else {
      setFormCities([]);
    }
  }, [formStateId, cities, states]);

  // Fetch geographic master data (Countries, States, Cities) on mount
  useEffect(() => {
    const fetchGeographicMasterData = async () => {
      try {
        const [cData, sData, ctData] = await Promise.all([
          fetchCachedJson('/php-backend/api.php?table=countries'),
          fetchCachedJson('/php-backend/api.php?table=states'),
          fetchCachedJson('/php-backend/api.php?table=cities')
        ]);
        if (Array.isArray(cData)) setCountries(cData);
        if (Array.isArray(sData)) setStates(sData);
        if (Array.isArray(ctData)) setCities(ctData);
      } catch (err) {
        console.error('Error fetching geographic master data:', err);
      }
    };
    fetchGeographicMasterData();
  }, []);

  const [allContractsOverview, setAllContractsOverview] = useState<any[]>([]);
  const [allRatesOverview, setAllRatesOverview] = useState<any[]>([]);
  const [isSavingInlineRate, setIsSavingInlineRate] = useState(false);
  const [inlineQuickRate, setInlineQuickRate] = useState({
    room_category_id: '',
    meal_plan_id: 'CP',
    season_id: '',
    single_rate: 0 as number | string,
    double_rate: 0 as number | string,
    extra_adult_rate: 0 as number | string,
    child_with_bed_rate: 0 as number | string,
    markup: 800 as number | string
  });

  const fetchAllContractsOverview = async () => {
    try {
      const [cRes, rRes, sRes] = await Promise.all([
        fetch('/php-backend/api.php?table=hotel_contracts').catch(() => null),
        fetch('/php-backend/api.php?table=hotel_contract_rates').catch(() => null),
        fetch('/php-backend/api.php?table=hotel_suppliers').catch(() => null)
      ]);
      const cList = (cRes && cRes.ok) ? await cRes.json() : [];
      const rList = (rRes && rRes.ok) ? await rRes.json() : [];
      const sList = (sRes && sRes.ok) ? await sRes.json() : [];
      if (Array.isArray(cList)) setAllContractsOverview(cList);
      if (Array.isArray(rList)) setAllRatesOverview(rList);
      if (Array.isArray(sList) && sList.length > 0) setSuppliers(sList);
    } catch (e) {}
  };

  const handleSaveQuickInlineRate = async () => {
    if (!selectedHotelId) {
      toast({ title: 'Select Hotel First', description: 'Please select a target hotel on the left.', variant: 'destructive' });
      return;
    }
    const dbl = Number(inlineQuickRate.double_rate) || 0;
    if (dbl <= 0) {
      toast({ title: 'Enter Double Rate', description: 'Please enter a valid Double Occupancy Rate (₹).', variant: 'destructive' });
      return;
    }
    setIsSavingInlineRate(true);
    try {
      const authHeaders = await getAuthHeader();
      let targetContractId = selectedContractId || (contracts[0]?.id ? String(contracts[0].id) : '');

      // Auto-create contract in MySQL if hotel has none yet
      if (!targetContractId) {
        const targetHotel = hotels.find(h => String(h.id) === String(selectedHotelId));
        const todayStr = new Date().toISOString().split('T')[0];
        const nextYearStr = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
        const cRes = await fetch('/php-backend/api.php?table=hotel_contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({
            hotel_id: selectedHotelId,
            contract_name: `${targetHotel?.hotel_name || 'Hotel'} - Annual B2B Contract`,
            valid_from: todayStr,
            valid_to: nextYearStr,
            currency: 'INR',
            gst_percentage: dbl >= 7500 ? 18 : 12,
            active_status: true
          })
        });
        if (cRes.ok) {
          const cData = await cRes.json().catch(() => ({}));
          if (cData?.id) {
            targetContractId = String(cData.id);
            setSelectedContractId(targetContractId);
          }
        }
      }

      let targetRoomId = inlineQuickRate.room_category_id || (roomCategories[0]?.id ? String(roomCategories[0].id) : '');
      // Auto-create Standard Room in MySQL if hotel has no rooms yet
      if (!targetRoomId) {
        const rmRes = await fetch('/php-backend/api.php?table=room_categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({
            hotel_id: selectedHotelId,
            room_category_name: 'Standard / Deluxe Room',
            room_size: '280',
            max_adults: 2,
            max_children: 1,
            bed_type: 'Double Bed',
            active_status: true
          })
        });
        if (rmRes.ok) {
          const rmData = await rmRes.json().catch(() => ({}));
          if (rmData?.id) targetRoomId = String(rmData.id);
        }
      }

      const targetSeasonId = inlineQuickRate.season_id || (seasons[0]?.id ? String(seasons[0].id) : 'season-normal');
      const sgl = Number(inlineQuickRate.single_rate) || Math.round(dbl * 0.85);
      const ext = Number(inlineQuickRate.extra_adult_rate) || 0;
      const cwb = Number(inlineQuickRate.child_with_bed_rate) || 0;
      const mkp = Number(inlineQuickRate.markup) || 0;
      const gstPct = dbl >= 7500 ? 18 : 12;
      const gstAmt = Math.round(dbl * (gstPct / 100));
      const supplierCost = dbl + gstAmt;
      const sellingCost = supplierCost + mkp;
      const planCode = (inlineQuickRate.meal_plan_id || 'CP').toUpperCase();

      const existing = contractRates.find(
        cr => String(cr.room_category_id) === String(targetRoomId) &&
              String(cr.meal_plan_id).toUpperCase() === planCode &&
              String(cr.season_id || '') === String(targetSeasonId || '')
      );

      const ratePayload = {
        contract_id: targetContractId,
        room_category_id: targetRoomId,
        season_id: targetSeasonId,
        meal_plan_id: planCode,
        single_rate: sgl,
        double_rate: dbl,
        triple_rate: dbl + ext,
        extra_adult_rate: ext,
        child_with_bed_rate: cwb,
        child_without_bed_rate: Math.round(cwb * 0.6),
        rate_type: 'exclusive',
        gst_percentage: gstPct,
        gst_amount: gstAmt,
        net_cost: dbl,
        supplier_cost: supplierCost,
        markup: mkp,
        selling_cost: sellingCost,
        active_status: true
      };

      if (existing?.id) {
        const res = await fetch(`/php-backend/api.php?table=hotel_contract_rates&id=${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(ratePayload)
        });
        if (!res.ok) throw new Error('Failed to update rate in MySQL');
      } else {
        const res = await fetch('/php-backend/api.php?table=hotel_contract_rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(ratePayload)
        });
        if (!res.ok) throw new Error('Failed to save rate in MySQL');
      }

      toast({
        title: 'Saved to MySQL Database',
        description: `${planCode} Tariff ₹${dbl.toLocaleString('en-IN')} (Selling: ₹${sellingCost.toLocaleString('en-IN')}) saved for this contract.`
      });
      await fetchRoomsAndSeasons(selectedHotelId);
      await fetchContractsForHotel(selectedHotelId);
      if (targetContractId) await fetchContractRates(targetContractId);
      await fetchAllContractsOverview();
    } catch (err: any) {
      toast({ title: 'MySQL Save Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSavingInlineRate(false);
    }
  };

  const fetchMainTabData = async () => {
    setLoading(true);
    try {
      if (activeMainTab === 'hotels' || activeMainTab === 'compare') {
        await fetchHotels();
      } else if (activeMainTab === 'suppliers') {
        const data = await fetchCachedJson('/php-backend/api.php?table=hotel_suppliers');
        setSuppliers(data || []);
      } else if (activeMainTab === 'rooms-seasons') {
        await fetchHotels(); // load hotels for the hotel picker
      } else if (activeMainTab === 'contracts') {
        await Promise.all([
          fetchHotels(),
          fetchAllContractsOverview()
        ]);
      }
    } catch (err: any) {
      toast({ title: 'Error loading page data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const masterHotelsList = React.useMemo(() => getContractedHotelsMasterList(), []);

  const fetchHotels = async (
    page = currentPage,
    search = hotelSearch,
    country = hotelFilterCountry,
    state = hotelFilterState,
    city = hotelFilterCity,
    star = hotelFilterStar
  ) => {
    setLoading(true);
    try {
      let dbHotels: any[] = [];
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('limit', '5000');
        if (search && search.trim()) queryParams.set('search', search.trim());
        if (country && country !== 'all') queryParams.set('country_id', country);
        if (state && state !== 'all') queryParams.set('state_id', state);
        if (city && city !== 'all') queryParams.set('city_id', city);
        if (star && star !== 'all') queryParams.set('star_rating', star);

        const res = await fetch(`/php-backend/hotels.php?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
          dbHotels = items.map((h: any) => {
            const rawCity = h.city || h.cities?.city_name;
            const rawState = h.state || h.states?.state_name;
            const rawCountry = h.country || h.countries?.country_name;
            const geo = resolveGeography(rawCity, rawState, rawCountry);
            return {
              ...h,
              id: String(h.id),
              city: geo.city,
              state: geo.state,
              country: geo.country,
              cities: { city_name: geo.city },
              states: { state_name: geo.state },
              countries: { country_name: geo.country }
            };
          });
        }
      } catch (e) {
        console.warn('Backend hotels fetch failed, relying on master contracted registry:', e);
      }

      // Merge live DB records with master contracted registry (DB records take priority)
      const dbHotelNames = new Set(dbHotels.map(h => String(h.hotel_name || '').toLowerCase().trim()));
      const combined = [
        ...dbHotels,
        ...masterHotelsList.map(mh => {
          const geo = resolveGeography(mh.city, mh.state, mh.country);
          return {
            ...mh,
            city: geo.city,
            state: geo.state,
            country: geo.country,
            cities: { city_name: geo.city },
            states: { state_name: geo.state },
            countries: { country_name: geo.country }
          };
        }).filter(mh => !dbHotelNames.has(String(mh.hotel_name || '').toLowerCase().trim()))
      ];

      // Filter merged dataset by search term, country, state, city, and star rating
      const q = search.trim().toLowerCase();
      const selC = country !== 'all' ? country.trim().toLowerCase() : null;
      const selS = state !== 'all' ? state.trim().toLowerCase() : null;
      const selCity = city !== 'all' ? city.trim().toLowerCase() : null;

      const filtered = combined.filter(h => {
        const hName = String(h.hotel_name || '').toLowerCase();
        const hCode = String(h.hotel_code || '').toLowerCase();
        const hCity = String(h.city || '').toLowerCase().trim();
        const hState = String(h.state || '').toLowerCase().trim();
        const hCountry = String(h.country || '').toLowerCase().trim();
        const hAddress = String(h.address || '').toLowerCase();

        if (q) {
          const match = hName.includes(q) || hCode.includes(q) || hCity.includes(q) || hState.includes(q) || hAddress.includes(q);
          if (!match) return false;
        }

        if (selC) {
          if (!hCountry || (hCountry !== selC && !hCountry.includes(selC) && !selC.includes(hCountry))) {
            return false;
          }
        }

        if (selS) {
          if (!hState || (hState !== selS && !hState.includes(selS) && !selS.includes(hState))) {
            return false;
          }
        }

        if (selCity) {
          if (!hCity || (hCity !== selCity && !hCity.includes(selCity) && !selCity.includes(hCity))) {
            return false;
          }
        }

        if (star !== 'all') {
          if (Number(h.star_rating) !== Number(star)) return false;
        }

        return true;
      });

      const total = filtered.length;
      const pages = Math.max(1, Math.ceil(total / pageSize));
      const validPage = Math.min(page, pages);
      const startIndex = (validPage - 1) * pageSize;
      const paginated = filtered.slice(startIndex, startIndex + pageSize);

      setHotels(paginated);
      setCurrentPage(validPage);
      setTotalRecords(total);
      setTotalPages(pages);

      if (paginated.length > 0 && (!selectedHotelId || !paginated.some(h => String(h.id) === String(selectedHotelId)))) {
        setSelectedHotelId(String(paginated[0].id));
      }
    } catch (err: any) {
      console.error('Error fetching hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels(currentPage, hotelSearch, hotelFilterCountry, hotelFilterState, hotelFilterCity, hotelFilterStar);
  }, [currentPage, hotelSearch, hotelFilterCountry, hotelFilterState, hotelFilterCity, hotelFilterStar, pageSize]);

  // Dynamic Country Options for Filter Bar
  const countryOptions = React.useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const seenNames = new Set<string>();

    const addOption = (rawName: any) => {
      const name = String(rawName || '').trim();
      if (!name || /^\d+$/.test(name) || seenNames.has(name.toLowerCase())) return;
      seenNames.add(name.toLowerCase());
      list.push({ id: name, name });
    };

    // Default major destinations
    ['India', 'Indonesia', 'Malaysia', 'Maldives', 'Singapore', 'Switzerland', 'Thailand', 'United Arab Emirates', 'Vietnam', 'France'].forEach(addOption);

    countries.forEach(c => {
      addOption(c.country_name || (c as any).name || '');
    });

    masterHotelsList.forEach(h => {
      if (h.country) addOption(h.country);
    });

    hotels.forEach((h: any) => {
      const name = String(h.country || h.countries?.country_name || '').trim();
      if (name) addOption(name);
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [countries, hotels, masterHotelsList]);

  // Dynamic State Options for Filter Bar (Cascading from selected Country)
  const stateOptions = React.useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const seenNames = new Set<string>();

    const selCountry = hotelFilterCountry !== 'all' ? hotelFilterCountry.trim().toLowerCase() : null;

    const addState = (rawStateName: any, rawCountry?: any) => {
      const geo = resolveGeography(null, rawStateName, rawCountry);
      const stateName = geo.state;
      const stateCountry = geo.country;

      if (!stateName || /^\d+$/.test(stateName) || seenNames.has(stateName.toLowerCase())) return;

      if (selCountry) {
        if (stateCountry.toLowerCase() !== selCountry && !stateCountry.toLowerCase().includes(selCountry) && !selCountry.includes(stateCountry.toLowerCase())) {
          return;
        }
      }

      seenNames.add(stateName.toLowerCase());
      list.push({ id: stateName, name: stateName });
    };

    // If country is India (or all), ensure all major Indian states with hotels are included
    if (!selCountry || selCountry === 'india') {
      const ACTIVE_INDIAN_STATES = [
        'Kerala',
        'Gujarat',
        'Uttarakhand',
        'Himachal Pradesh',
        'Rajasthan',
        'Goa',
        'Jammu and Kashmir',
        'Ladakh',
        'Karnataka',
        'Tamil Nadu',
        'Maharashtra',
        'West Bengal',
        'Sikkim',
        'Uttar Pradesh',
        'Andaman and Nicobar Islands'
      ];
      ACTIVE_INDIAN_STATES.forEach(st => addState(st, 'India'));
    }

    // Add international states for selected country (or all)
    Object.entries(INTERNATIONAL_STATE_COUNTRY_MAP).forEach(([stName, cName]) => {
      addState(stName, cName);
    });

    masterHotelsList.forEach(h => {
      const geo = resolveGeography(h.city, h.state, h.country);
      addState(geo.state, geo.country);
    });

    hotels.forEach((h: any) => {
      const geo = resolveGeography(h.city || h.cities?.city_name, h.state || h.states?.state_name, h.country || h.countries?.country_name);
      addState(geo.state, geo.country);
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [hotels, hotelFilterCountry, masterHotelsList]);

  // Dynamic City Options for Filter Bar (Cascading from selected State / Country)
  const cityOptions = React.useMemo(() => {
    const list: { id: string; name: string }[] = [];
    const seenNames = new Set<string>();

    const selState = hotelFilterState !== 'all' ? hotelFilterState.trim().toLowerCase() : null;
    const selCountry = hotelFilterCountry !== 'all' ? hotelFilterCountry.trim().toLowerCase() : null;

    const addCity = (rawCityName: any, rawState?: any, rawCountry?: any) => {
      const geo = resolveGeography(rawCityName, rawState, rawCountry);
      const cityName = geo.city;
      const stateName = geo.state;
      const countryName = geo.country;

      if (!cityName || /^\d+$/.test(cityName) || seenNames.has(cityName.toLowerCase())) return;

      if (selState) {
        if (stateName.toLowerCase() !== selState && !stateName.toLowerCase().includes(selState) && !selState.includes(stateName.toLowerCase())) {
          return;
        }
      }

      if (selCountry) {
        if (countryName.toLowerCase() !== selCountry && !countryName.toLowerCase().includes(selCountry) && !selCountry.includes(countryName.toLowerCase())) {
          return;
        }
      }

      seenNames.add(cityName.toLowerCase());
      list.push({ id: cityName, name: cityName });
    };

    // Add predefined cities from dictionary
    Object.entries(CITY_TO_STATE_COUNTRY_MAP).forEach(([cityName, meta]) => {
      addCity(cityName, meta.state, meta.country);
    });

    masterHotelsList.forEach(h => {
      const geo = resolveGeography(h.city, h.state, h.country);
      addCity(geo.city, geo.state, geo.country);
    });

    hotels.forEach((h: any) => {
      const geo = resolveGeography(h.city || h.cities?.city_name, h.state || h.states?.state_name, h.country || h.countries?.country_name);
      addCity(geo.city, geo.state, geo.country);
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [hotels, hotelFilterState, hotelFilterCountry, masterHotelsList]);

  // Handlers for filter state changes
  const handleCountryFilterChange = (val: string) => {
    setHotelFilterCountry(val);
    setHotelFilterState('all');
    setHotelFilterCity('all');
    setCurrentPage(1);
  };

  const handleStateFilterChange = (val: string) => {
    setHotelFilterState(val);
    setHotelFilterCity('all');
    setCurrentPage(1);
  };

  const handleCityFilterChange = (val: string) => {
    setHotelFilterCity(val);
    setCurrentPage(1);
  };

  const handleStarFilterChange = (val: string) => {
    setHotelFilterStar(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setHotelSearch('');
    setHotelFilterCountry('all');
    setHotelFilterState('all');
    setHotelFilterCity('all');
    setHotelFilterStar('all');
    setCurrentPage(1);
  };

  // Filtered Hotels list for grid view (hotels is already fetched & filtered by fetchHotels)
  const filteredHotels = React.useMemo(() => {
    return hotels;
  }, [hotels]);

  // Helper: detect if an ID is a proper UUID (Supabase) vs a local MySQL integer
  const isUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const fetchRoomsAndSeasons = async (hotelId: string) => {
    try {
      const [roomsRes, seasonsRes, ratesRes] = await Promise.all([
        fetch('/php-backend/api.php?table=room_categories').catch(() => null),
        fetch('/php-backend/api.php?table=seasons').catch(() => null),
        fetch('/php-backend/api.php?table=hotel_contract_rates').catch(() => null)
      ]);

      let hotelRooms: any[] = [];
      if (roomsRes && roomsRes.ok) {
        const allRooms = await roomsRes.json();
        hotelRooms = Array.isArray(allRooms) ? allRooms.filter((r: any) => String(r.hotel_id) === String(hotelId)) : [];
        setRoomCategories(hotelRooms);
      }

      let hotelSeasons: any[] = [];
      if (seasonsRes && seasonsRes.ok) {
        const allSeasons = await seasonsRes.json();
        hotelSeasons = Array.isArray(allSeasons) ? allSeasons.filter((s: any) => String(s.hotel_id) === String(hotelId)) : [];
      }

      if (ratesRes && ratesRes.ok && hotelRooms.length > 0) {
        const allRates = await ratesRes.json();
        const roomIds = new Set(hotelRooms.map((r: any) => String(r.id)));
        const matchingRates = Array.isArray(allRates)
          ? allRates.filter((rt: any) => roomIds.has(String(rt.room_category_id)))
          : [];
        if (matchingRates.length > 0) {
          const mapped = matchingRates.map((rate: any) => {
            const roomCat = hotelRooms.find((rc: any) => String(rc.id) === String(rate.room_category_id));
            const sn = hotelSeasons.find((s: any) => String(s.id) === String(rate.season_id));
            return {
              ...rate,
              seasons: sn ? { season_name: sn.season_name } : null,
              room_categories: roomCat ? { room_category_name: roomCat.room_category_name } : null
            };
          });
          setContractRates(mapped);
        }
      }

      if (hotelSeasons.length > 0 || !isUUID(hotelId)) {
        setSeasons(hotelSeasons);
        return;
      }

      if (isUUID(hotelId)) {
        const { data: sns } = await supabase
          .from('seasons')
          .select('*')
          .eq('hotel_id', hotelId)
          .order('start_date');
        setSeasons(sns || []);
      } else {
        setSeasons([]);
      }
    } catch (err: any) {
      toast({ title: 'Error loading master configurations', description: err.message, variant: 'destructive' });
    }
  };

  const fetchContractsForHotel = async (hotelId: string) => {
    try {
      // First query MySQL hotel_contracts via api.php (supports all hotel ID formats)
      const res = await fetch('/php-backend/api.php?table=hotel_contracts').catch(() => null);
      if (res && res.ok) {
        const allContracts = await res.json();
        const myContracts = Array.isArray(allContracts)
          ? allContracts.filter((c: any) => String(c.hotel_id) === String(hotelId))
          : [];
        if (myContracts.length > 0 || !isUUID(hotelId)) {
          setContracts(myContracts);
          setSelectedContractId(myContracts.length > 0 ? String(myContracts[0].id) : '');
          return;
        }
      }

      if (!isUUID(hotelId)) {
        setContracts([]);
        setSelectedContractId('');
        return;
      }

      const { data, error } = await supabase
        .from('hotel_contracts')
        .select('*, hotel_suppliers(supplier_name)')
        .eq('hotel_id', hotelId)
        .order('valid_from', { ascending: false });
      if (error) throw error;
      setContracts(data || []);
      setSelectedContractId(data && data.length > 0 ? data[0].id : '');
    } catch (err: any) {
      console.error('Error fetching hotel contracts:', err);
    }
  };

  const fetchContractRates = async (contractId: string) => {
    try {
      const [ratesRes, roomsRes, seasonsRes] = await Promise.all([
        fetch('/php-backend/api.php?table=hotel_contract_rates').catch(() => null),
        fetch('/php-backend/api.php?table=room_categories').catch(() => null),
        fetch('/php-backend/api.php?table=seasons').catch(() => null)
      ]);

      const allRooms = (roomsRes && roomsRes.ok) ? await roomsRes.json() : [];
      const allSeasons = (seasonsRes && seasonsRes.ok) ? await seasonsRes.json() : [];
      const hotelRoomIds = new Set(
        Array.isArray(allRooms)
          ? allRooms.filter((rc: any) => String(rc.hotel_id) === String(selectedHotelId)).map((rc: any) => String(rc.id))
          : []
      );

      if (ratesRes && ratesRes.ok) {
        const allRates = await ratesRes.json();
        const myRates = Array.isArray(allRates)
          ? allRates.filter((r: any) => String(r.contract_id) === String(contractId) || hotelRoomIds.has(String(r.room_category_id)))
          : [];
        if (myRates.length > 0 || !isUUID(contractId)) {
          const mapped = myRates.map((rate: any) => {
            const roomCat = Array.isArray(allRooms) ? allRooms.find((rc: any) => String(rc.id) === String(rate.room_category_id)) : null;
            const sn = Array.isArray(allSeasons) ? allSeasons.find((s: any) => String(s.id) === String(rate.season_id)) : null;
            return {
              ...rate,
              seasons: sn ? { season_name: sn.season_name } : null,
              room_categories: roomCat ? { room_category_name: roomCat.room_category_name } : null
            };
          });
          setContractRates(mapped);
          return;
        }
      }

      const { data: rates, error } = await supabase
        .from('hotel_contract_rates')
        .select('*, seasons(season_name)')
        .eq('contract_id', contractId)
        .order('created_at');
      if (error) throw error;

      const mappedRates = (rates || []).map((rate: any) => {
        const roomCat = Array.isArray(allRooms) ? allRooms.find((rc: any) => rc.id === rate.room_category_id) : null;
        return {
          ...rate,
          room_categories: roomCat ? { room_category_name: roomCat.room_category_name } : null
        };
      });

      setContractRates(mappedRates);
    } catch (err: any) {
      toast({ title: 'Error fetching contract rates', description: err.message, variant: 'destructive' });
    }
  };

  const fetchContractHistory = async (contractId: string) => {
    // Queries audit logs or history for contract updates
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/audit_logs.php?lead_id=${contractId}`, {
        headers: authHeaders
      });
      if (!res.ok) throw new Error("Failed to fetch contract history");
      const data = await res.json();
      if (data.success && data.audit_logs) {
        setContractHistoryLogs(data.audit_logs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper log helper
  const logContractAudit = async (action: string, contractId: string, oldValue: any, newValue: any) => {
    try {
      const authHeaders = await getAuthHeader();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      const res = await fetch(`${API_BASE}/audit_logs.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          lead_id: Number(contractId) || null,
          action: action,
          old_value: JSON.stringify(oldValue),
          new_value: JSON.stringify(newValue),
          user_email: userData.user.email || 'unknown',
          user_name: userData.user.email || 'CRM System'
        })
      });
      if (!res.ok) throw new Error("Failed to post audit log");
    } catch (err) {
      console.error('Audit logging error:', err);
    }
  };

  // Dialog Form Open handlers
  const handleOpenAddDialog = (type: typeof dialogType) => {
    if (type === 'hotel') navigate('/crm/hotels/new');
    else if (type === 'supplier') navigate('/crm/suppliers/new');
    else if (type === 'room') navigate('/crm/hotels/room/new');
    else if (type === 'season') navigate('/crm/hotels/season/new');
    else if (type === 'contract') navigate('/crm/hotels/contract/new');
    else if (type === 'rate') navigate('/crm/hotels/rate/new');
  };

  const handleOpenEditDialog = (type: typeof dialogType, item: any) => {
    if (type === 'hotel') navigate(`/crm/hotels/edit/${item.id}`);
    else if (type === 'supplier') navigate(`/crm/suppliers/edit/${item.id}`);
    else if (type === 'room') navigate(`/crm/hotels/room/edit/${item.id}`);
    else if (type === 'season') navigate(`/crm/hotels/season/edit/${item.id}`);
    else if (type === 'contract') navigate(`/crm/hotels/contract/edit/${item.id}`);
    else if (type === 'rate') navigate(`/crm/hotels/rate/edit/${item.id}`);
  };;

  // Submit operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (dialogType === 'hotel') {
        const selectedCity = cities.find(c => c.id === hotelForm.city_id || formCities[0]?.id);
        const selectedState = states.find(s => s.id === formStateId);
        const selectedCountry = countries.find(c => c.id === formCountryId);

        const hotelPayload = {
          hotel_name: hotelForm.hotel_name,
          hotel_code: hotelForm.hotel_code || 'H-' + Date.now().toString().slice(-6),
          country_id: formCountryId || null,
          state_id: formStateId || null,
          city_id: hotelForm.city_id || formCities[0]?.id || null,
          city: selectedCity?.city_name || '',
          state: selectedState?.state_name || '',
          country: selectedCountry?.country_name || '',
          star_rating: hotelForm.star_rating,
          address: hotelForm.address || null,
          contact_number: hotelForm.contact_number || null,
          email: hotelForm.email || null,
          website: hotelForm.website || null,
          contact_person: hotelForm.contact_person || null,
          contact_email: hotelForm.contact_email || null,
          check_in_time: hotelForm.check_in_time || null,
          check_out_time: hotelForm.check_out_time || null,
          meal_plan_supported: hotelForm.meal_plan_supported,
          cancellation_policy: hotelForm.cancellation_policy || null,
          google_rating: hotelForm.google_rating,
          internal_rating: hotelForm.internal_rating,
          active_status: hotelForm.active_status,
          updated_at: new Date().toISOString()
        };

        if (dialogMode === 'add') {
          const res = await crmFetch('/php-backend/hotels.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...hotelPayload,
              created_at: new Date().toISOString()
            })
          }, {
            action: 'create_hotel',
            module: 'Hotels',
            itemName: hotelPayload.hotel_name
          });
          if (!res.ok) throw new Error('Failed to create hotel');
          const resData = await res.json();
          toast({ title: 'Success', description: 'Hotel created successfully' });
          if (resData && resData.id) setSelectedHotelId(resData.id);
        } else {
          const res = await crmFetch(`/php-backend/hotels.php?id=${selectedItemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hotelPayload)
          }, {
            action: 'update_hotel',
            module: 'Hotels',
            recordId: selectedItemId || undefined,
            itemName: hotelPayload.hotel_name
          });
          if (!res.ok) throw new Error('Failed to update hotel');
          toast({ title: 'Success', description: 'Hotel updated successfully' });
        }
        fetchHotels();
      } else if (dialogType === 'supplier') {
        const payload = { ...supplierForm };
        if (dialogMode === 'add') {
          const res = await crmFetch('/php-backend/api.php?table=hotel_suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }, {
            action: 'create_hotel_supplier',
            module: 'Hotels',
            itemName: payload.supplier_name
          });
          if (!res.ok) throw new Error('Failed to add supplier');
          toast({ title: 'Success', description: 'Supplier added successfully' });
        } else {
          const res = await crmFetch(`/php-backend/api.php?table=hotel_suppliers&id=${selectedItemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }, {
            action: 'update_hotel_supplier',
            module: 'Hotels',
            recordId: selectedItemId || undefined,
            itemName: payload.supplier_name
          });
          if (!res.ok) throw new Error('Failed to update supplier');
          toast({ title: 'Success', description: 'Supplier updated successfully' });
        }
        const resSuppliers = await fetch('/php-backend/api.php?table=hotel_suppliers');
        if (resSuppliers.ok) {
          const data = await resSuppliers.json();
          setSuppliers(data || []);
        }
      } else if (dialogType === 'room') {
        const authHeaders = await getAuthHeader();
        const roomPayload = {
          room_category_name: roomForm.room_category_name,
          room_size: roomForm.room_size,
          max_adults: Number(roomForm.max_adults) || 2,
          max_children: Number(roomForm.max_children) || 1,
          bed_type: roomForm.bed_type,
          room_description: roomForm.room_description,
          active_status: roomForm.active_status,
          hotel_id: selectedHotelId
        };

        let savedRoomId = selectedItemId || '';
        if (dialogMode === 'add') {
          const res = await fetch('/php-backend/api.php?table=room_categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(roomPayload)
          });
          if (!res.ok) throw new Error('Failed to add room category');
          const resData = await res.json().catch(() => ({}));
          if (resData?.id) savedRoomId = String(resData.id);
        } else {
          const res = await fetch(`/php-backend/api.php?table=room_categories&id=${selectedItemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(roomPayload)
          });
          if (!res.ok) throw new Error('Failed to update room category');
        }

        // Direct Room Category Tariff Save: if a price is entered, automatically upsert contract + rate rows
        const doubleRateVal = Number(roomForm.double_rate) || 0;
        const singleRateVal = Number(roomForm.single_rate) || (doubleRateVal > 0 ? Math.round(doubleRateVal * 0.85) : 0);
        const extraAdultVal = Number(roomForm.extra_adult_rate) || 0;
        const tripleRateVal = Number(roomForm.triple_rate) || (doubleRateVal > 0 ? doubleRateVal + extraAdultVal : 0);
        const cwbVal = Number(roomForm.child_with_bed_rate) || 0;
        const cwobVal = Number(roomForm.child_without_bed_rate) || 0;
        const mapDoubleVal = Number(roomForm.map_double_rate) || 0;

        if (savedRoomId && (doubleRateVal > 0 || singleRateVal > 0 || mapDoubleVal > 0)) {
          let targetContractId = selectedContractId || (contracts[0]?.id ? String(contracts[0].id) : '');

          // Auto-create an active contract for this hotel if none exists yet
          if (!targetContractId) {
            const targetHotel = hotels.find(h => String(h.id) === String(selectedHotelId));
            const todayStr = new Date().toISOString().split('T')[0];
            const nextYearStr = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
            const cRes = await fetch('/php-backend/api.php?table=hotel_contracts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify({
                hotel_id: selectedHotelId,
                contract_name: `${targetHotel?.hotel_name || 'Hotel'} - Direct Tariff Contract`,
                valid_from: todayStr,
                valid_to: nextYearStr,
                currency: 'INR',
                gst_percentage: Number(roomForm.gst_percentage) || (doubleRateVal >= 7500 ? 18 : 12),
                active_status: true
              })
            });
            if (cRes.ok) {
              const cData = await cRes.json().catch(() => ({}));
              if (cData?.id) {
                targetContractId = String(cData.id);
                setSelectedContractId(targetContractId);
              }
            }
          }

          const targetSeasonId = roomForm.season_id || (seasons[0]?.id ? String(seasons[0].id) : 'season-normal');
          const primaryPlan = (roomForm.meal_plan_id || 'CP').toUpperCase();
          const autoGst = Number(roomForm.gst_percentage) || (doubleRateVal >= 7500 ? 18 : 12);

          if (targetContractId && (doubleRateVal > 0 || singleRateVal > 0)) {
            const existingPrimary = contractRates.find(
              cr => String(cr.room_category_id) === String(savedRoomId) && String(cr.meal_plan_id).toUpperCase() === primaryPlan
            );
            const gstAmt = Math.round(doubleRateVal * (autoGst / 100));
            const supplierTotal = doubleRateVal + gstAmt;
            const ratePayload = {
              contract_id: targetContractId,
              room_category_id: savedRoomId,
              season_id: targetSeasonId,
              meal_plan_id: primaryPlan,
              single_rate: singleRateVal,
              double_rate: doubleRateVal,
              triple_rate: tripleRateVal,
              extra_adult_rate: extraAdultVal,
              child_with_bed_rate: cwbVal,
              child_without_bed_rate: cwobVal,
              rate_type: roomForm.rate_type || 'exclusive',
              gst_percentage: autoGst,
              gst_amount: gstAmt,
              net_cost: doubleRateVal,
              supplier_cost: supplierTotal,
              selling_cost: supplierTotal,
              active_status: true
            };
            if (existingPrimary?.id) {
              await fetch(`/php-backend/api.php?table=hotel_contract_rates&id=${existingPrimary.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify(ratePayload)
              });
            } else {
              await fetch('/php-backend/api.php?table=hotel_contract_rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify(ratePayload)
              });
            }
          }

          // Also save MAP rate if entered alongside CP
          if (targetContractId && mapDoubleVal > 0 && primaryPlan !== 'MAP') {
            const existingMap = contractRates.find(
              cr => String(cr.room_category_id) === String(savedRoomId) && String(cr.meal_plan_id).toUpperCase() === 'MAP'
            );
            const mapGst = mapDoubleVal >= 7500 ? 18 : 12;
            const mapGstAmt = Math.round(mapDoubleVal * (mapGst / 100));
            const mapSupplierTotal = mapDoubleVal + mapGstAmt;
            const mapPayload = {
              contract_id: targetContractId,
              room_category_id: savedRoomId,
              season_id: targetSeasonId,
              meal_plan_id: 'MAP',
              single_rate: Math.round(mapDoubleVal * 0.85),
              double_rate: mapDoubleVal,
              triple_rate: mapDoubleVal + extraAdultVal,
              extra_adult_rate: extraAdultVal,
              child_with_bed_rate: cwbVal,
              child_without_bed_rate: cwobVal,
              rate_type: roomForm.rate_type || 'exclusive',
              gst_percentage: mapGst,
              gst_amount: mapGstAmt,
              net_cost: mapDoubleVal,
              supplier_cost: mapSupplierTotal,
              selling_cost: mapSupplierTotal,
              active_status: true
            };
            if (existingMap?.id) {
              await fetch(`/php-backend/api.php?table=hotel_contract_rates&id=${existingMap.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify(mapPayload)
              });
            } else {
              await fetch('/php-backend/api.php?table=hotel_contract_rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify(mapPayload)
              });
            }
          }
        }

        toast({
          title: dialogMode === 'add' ? 'Room Category & Price Added' : 'Room Category & Price Updated',
          description: doubleRateVal > 0
            ? `${roomForm.room_category_name} saved with ${roomForm.meal_plan_id} tariff ₹${doubleRateVal.toLocaleString('en-IN')}/night.`
            : `${roomForm.room_category_name} saved successfully.`
        });
        await fetchRoomsAndSeasons(selectedHotelId);
        await fetchContractsForHotel(selectedHotelId);
      } else if (dialogType === 'season') {
        const payload = { ...seasonForm, hotel_id: selectedHotelId };
        const authHeaders = await getAuthHeader();
        if (dialogMode === 'add') {
          const res = await fetch(`${API_BASE}/api.php?table=seasons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Failed to create season');
          toast({ title: 'Success', description: 'Season created' });
        } else {
          const res = await fetch(`${API_BASE}/api.php?table=seasons&id=${selectedItemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Failed to update season');
          toast({ title: 'Success', description: 'Season updated' });
        }
        fetchRoomsAndSeasons(selectedHotelId);
      } else if (dialogType === 'contract') {
        const payload = { 
          ...contractForm, 
          hotel_id: selectedHotelId,
          supplier_id: contractForm.supplier_id || null
        };
        const authHeaders = await getAuthHeader();
        
        let oldVal = {};
        if (dialogMode === 'edit') {
          const res = await fetch(`${API_BASE}/api.php?table=hotel_contracts&id=${selectedItemId}`);
          if (res.ok) oldVal = await res.json() || {};
        }

        if (dialogMode === 'add') {
          const res = await fetch(`${API_BASE}/api.php?table=hotel_contracts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Failed to negotiate contract');
          const data = await res.json();
          toast({ title: 'Success', description: 'Contract negotiated successfully' });
          if (data && data.id) {
            setSelectedContractId(data.id);
            await logContractAudit('CREATE_CONTRACT', data.id, {}, payload);
          }
        } else {
          const res = await fetch(`${API_BASE}/api.php?table=hotel_contracts&id=${selectedItemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Failed to update contract');
          toast({ title: 'Success', description: 'Contract updated' });
          await logContractAudit('UPDATE_CONTRACT', selectedItemId!, oldVal, payload);
        }
        fetchContractsForHotel(selectedHotelId);
      } else if (dialogType === 'rate') {
        const authHeaders = await getAuthHeader();
        let oldVal: any = {};
        if (dialogMode === 'edit') {
          const res = await fetch(`${API_BASE}/api.php?table=hotel_contract_rates&id=${selectedItemId}`);
          if (res.ok) oldVal = await res.json() || {};
        }

        const doubleRate = Number(rateForm.double_rate) || 0;
        const hotel = hotels.find(h => h.id === selectedHotelId);
        const hotelCountry = hotel?.country || 'India';
        
        const rateType = rateForm.rate_type || 'exclusive';
        const isInclusive = rateType === 'inclusive';
        
        const suggestedGst = getSuggestedTaxRate(hotelCountry, doubleRate, isInclusive);
        const gstPercent = (rateForm.gst_percentage !== undefined && rateForm.gst_percentage !== null && rateForm.gst_percentage !== '')
          ? Number(rateForm.gst_percentage)
          : suggestedGst;

        let netCost = doubleRate;
        let gstAmt = 0;
        let supplierCost = doubleRate;

        if (isInclusive) {
          supplierCost = doubleRate;
          netCost = doubleRate / (1 + (gstPercent / 100));
          gstAmt = doubleRate - netCost;
        } else {
          netCost = doubleRate;
          gstAmt = doubleRate * (gstPercent / 100);
          supplierCost = doubleRate + gstAmt;
        }

        const payload = { 
          ...rateForm, 
          contract_id: selectedContractId,
          season_id: rateForm.season_id === 'none' ? null : (rateForm.season_id || null),
          rate_type: rateType,
          gst_percentage: gstPercent,
          gst_amount: gstAmt,
          net_cost: netCost,
          supplier_cost: supplierCost,
          selling_cost: supplierCost,
          is_tax_overridden: rateForm.is_tax_overridden || false,
          tax_override_reason: rateForm.tax_override_reason || null,
          tax_audit_logs: rateForm.tax_audit_logs && rateForm.tax_audit_logs.length > 0
            ? rateForm.tax_audit_logs
            : [{
                entered_amount: doubleRate,
                gst_included: isInclusive,
                calculated_gst: gstAmt,
                base_amount: netCost,
                final_amount: supplierCost,
                gst_percent_applied: gstPercent,
                user: 'system',
                timestamp: new Date().toISOString(),
                override_reason: 'GST Auto Applied'
              }]
        };

        if (dialogMode === 'add') {
          const res = await fetch(`${API_BASE}/api.php?table=hotel_contract_rates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Failed to insert contract rate');
          toast({ title: 'Success', description: 'Rate added to contract grid' });
          await logContractAudit('ADD_RATE', selectedContractId, {}, payload);
        } else {
          const res = await fetch(`${API_BASE}/api.php?table=hotel_contract_rates&id=${selectedItemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Failed to update contract rate');
          toast({ title: 'Success', description: 'Rate updated' });
          await logContractAudit('UPDATE_RATE', selectedContractId, oldVal, payload);
        }
        fetchContractRates(selectedContractId);
      }
      handleCancel();
    } catch (err: any) {
      toast({ title: 'Action Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (type: typeof dialogType, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setLoading(true);
    try {
      if (type === 'hotel') {
        const { data: itins, error: itinErr } = await supabase
          .from('itinerary_hotels')
          .select('id')
          .eq('hotel_id', id)
          .limit(1);
        if (itinErr) throw itinErr;

        if (itins && itins.length > 0) {
          const hotelRes = await fetch(`/php-backend/hotels.php?id=${id}`);
          if (hotelRes.ok) {
            const currentHotel = await hotelRes.json();
            const updateRes = await fetch(`/php-backend/hotels.php?id=${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...currentHotel, active_status: false, active: false })
            });
            if (!updateRes.ok) throw new Error('Failed to update hotel status');
          }
          toast({ 
            title: 'Deactivated', 
            description: 'Hotel is referenced in active itineraries. It has been deactivated and hidden instead of deleted to prevent broken records.' 
          });
          fetchHotels();
          setLoading(false);
          return;
        }

        const { data: contractList, error: contractErr } = await supabase
          .from('hotel_contracts')
          .select('id')
          .eq('hotel_id', id);
        if (contractErr) throw contractErr;

        if (contractList && contractList.length > 0) {
          const contractIds = contractList.map(c => c.id);
          const { error: ratesErr } = await supabase
            .from('hotel_contract_rates')
            .delete()
            .in('contract_id', contractIds);
          if (ratesErr) throw ratesErr;
        }

        const { error: contractsDelErr } = await supabase
          .from('hotel_contracts')
          .delete()
          .eq('hotel_id', id);
        if (contractsDelErr) throw contractsDelErr;

        const { error: seasonsDelErr } = await supabase
          .from('seasons')
          .delete()
          .eq('hotel_id', id);
        if (seasonsDelErr) throw seasonsDelErr;

        const authHeaders = await getAuthHeader();
        const hotelToDelete = hotels.find(h => String(h.id) === String(id));
        const hotelName = hotelToDelete?.hotel_name || id;
        
        await crmFetch(`${API_BASE}/api.php?table=room_categories&hotel_id=${id}`, { 
          method: 'DELETE',
          headers: authHeaders 
        }, {
          action: 'delete_hotel_rooms',
          module: 'Hotels',
          recordId: id,
          itemName: `Rooms for ${hotelName}`
        });

        await crmFetch(`${API_BASE}/api.php?table=hotel_images&hotel_id=${id}`, { 
          method: 'DELETE',
          headers: authHeaders 
        }, {
          action: 'delete_hotel_images',
          module: 'Hotels',
          recordId: id,
          itemName: `Images for ${hotelName}`
        });

        await crmFetch(`${API_BASE}/api.php?table=hotel_facility_mapping&hotel_id=${id}`, { 
          method: 'DELETE',
          headers: authHeaders 
        }, {
          action: 'delete_hotel_facilities',
          module: 'Hotels',
          recordId: id,
          itemName: `Facilities for ${hotelName}`
        });

        try {
          await crmFetch(`${API_BASE}/api.php?table=hotel_rates&hotel_id=${id}`, {
            method: 'DELETE',
            headers: authHeaders
          }, {
            action: 'delete_hotel_rates',
            module: 'Hotels',
            recordId: id,
            itemName: `Rates for ${hotelName}`
          });
        } catch (supDelErr) {
          console.warn('MySQL hotel rates deletion failed (non-blocking):', supDelErr);
        }

        const hotelDelRes = await crmFetch(`${API_BASE}/hotels.php?id=${id}`, { 
          method: 'DELETE',
          headers: authHeaders 
        }, {
          action: 'delete_hotel',
          module: 'Hotels',
          recordId: id,
          itemName: hotelName
        });
        if (!hotelDelRes.ok) throw new Error('Failed to delete hotel');

        toast({ title: 'Deleted', description: 'Hotel and all related contracts, rooms, and seasons deleted successfully.' });
        fetchHotels();
        setLoading(false);
        return;
      }

      if (type === 'supplier') {
        const authHeaders = await getAuthHeader();
        const res = await crmFetch(`/php-backend/api.php?table=hotel_suppliers&id=${id}`, {
          method: 'DELETE',
          headers: authHeaders
        }, {
          action: 'delete_hotel_supplier',
          module: 'Hotels',
          recordId: id
        });
        if (!res.ok) throw new Error('Failed to delete supplier');
        toast({ title: 'Deleted', description: 'Item deleted successfully' });
        const resSuppliers = await fetch('/php-backend/api.php?table=hotel_suppliers');
        if (resSuppliers.ok) {
          const data = await resSuppliers.json();
          setSuppliers(data || []);
        }
      } else {
        let table = '';
        if (type === 'room') table = 'room_categories';
        else if (type === 'season') table = 'seasons';
        else if (type === 'contract') table = 'hotel_contracts';
        else if (type === 'rate') table = 'hotel_contract_rates';

        const authHeaders = await getAuthHeader();
        const res = await crmFetch(`${API_BASE}/api.php?table=${table}&id=${id}`, {
          method: 'DELETE',
          headers: authHeaders
        }, {
          action: `delete_${table}`,
          module: 'Hotels',
          recordId: id
        });
        if (!res.ok) throw new Error('Failed to delete item');
        toast({ title: 'Deleted', description: 'Item deleted successfully' });

        if (type === 'room' || type === 'season') fetchRoomsAndSeasons(selectedHotelId);
        else if (type === 'contract') fetchContractsForHotel(selectedHotelId);
        else if (type === 'rate') fetchContractRates(selectedContractId);
      }
    } catch (err: any) {
      toast({ title: 'Deletion Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };;

  // CSV Rates Template Exporter
  const handleDownloadTemplate = () => {
    if (!selectedContractId) {
      toast({ title: 'Error', description: 'Please select a hotel contract first', variant: 'destructive' });
      return;
    }

    const activeContract = contracts.find(c => c.id === selectedContractId);
    const hotelName = hotels.find(h => h.id === selectedHotelId)?.hotel_name || 'Hotel';

    // Headers
    const headers = [
      'Room_Category_Name',
      'Meal_Plan_Code',
      'Season_Name',
      'Single_Rate',
      'Double_Rate',
      'Triple_Rate',
      'Extra_Adult_Rate',
      'Child_With_Bed_Rate',
      'Child_Without_Bed_Rate',
      'Weekend_Surcharge',
      'Peak_Season_Surcharge',
      'Rate_Type',
      'GST_Percentage'
    ];

    const rows: string[][] = [];

    // Pre-fill combination rows to make it extremely easy for users
    roomCategories.forEach(room => {
      mealPlans.forEach(meal => {
        if (seasons.length > 0) {
          seasons.forEach(season => {
            rows.push([
              room.room_category_name,
              meal.id,
              season.season_name,
              '0', '0', '0', '0', '0', '0', '0', '0',
              'exclusive', String(activeContract?.gst_percentage || 18)
            ]);
          });
        } else {
          rows.push([
            room.room_category_name,
            meal.id,
            'Standard',
            '0', '0', '0', '0', '0', '0', '0', '0',
            'exclusive', String(activeContract?.gst_percentage || 18)
          ]);
        }
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Contract_Rates_Template_${hotelName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: 'Success', description: 'Downloaded CSV template with pre-filled category combinations!' });
  };

  // CSV Bulk Rates Importer
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContractId) {
      toast({ title: 'Error', description: 'Ensure contract is selected and file is loaded.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error('CSV file is empty or missing headers');
        }

        // Clean headers to lowercase and convert underscores to spaces
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/_/g, ' '));
        const ratesToInsert: any[] = [];

        // Find header indices dynamically
        const roomCatIdx = headers.findIndex(h => h.includes('room category') || h.includes('room_category') || h.includes('room'));
        const mealPlanIdx = headers.findIndex(h => h.includes('meal plan') || h.includes('meal_plan_code') || h.includes('meal'));
        const seasonIdx = headers.findIndex(h => h.includes('season'));
        const singleRateIdx = headers.findIndex(h => h.includes('single rate') || h.includes('single_rate') || h.includes('single'));
        const doubleRateIdx = headers.findIndex(h => h.includes('double rate') || h.includes('double_rate') || h.includes('double'));
        const tripleRateIdx = headers.findIndex(h => h.includes('triple rate') || h.includes('triple_rate') || h.includes('triple'));
        const extraAdultIdx = headers.findIndex(h => h.includes('extra adult') || h.includes('extra_adult') || h.includes('adult'));
        const childWithBedIdx = headers.findIndex(h => h.includes('child with bed') || h.includes('child_with_bed'));
        const childWithoutBedIdx = headers.findIndex(h => h.includes('child without bed') || h.includes('child_without_bed') || h.includes('child no bed'));
        const weekendSurchargeIdx = headers.findIndex(h => h.includes('weekend'));
        const peakSeasonSurchargeIdx = headers.findIndex(h => h.includes('peak'));
        const rateTypeIdx = headers.findIndex(h => h.includes('rate type') || h.includes('rate_type') || h.includes('type'));
        const gstPercentIdx = headers.findIndex(h => h.includes('gst') || h.includes('tax') || h.includes('vat') || h.includes('sst'));

        const getVal = (row: string[], idx: number, fallback: any = '') => {
          if (idx === -1 || idx >= row.length) return fallback;
          return row[idx];
        };

        const getFloat = (row: string[], idx: number, fallback = 0) => {
          const val = getVal(row, idx, null);
          if (val === null || val === '') return fallback;
          const parsed = parseFloat(val);
          return isNaN(parsed) ? fallback : parsed;
        };

        // Read Rows
        for (let i = 1; i < lines.length; i++) {
          // Robust quote-aware split
          const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          const row = matches.map(val => val.trim().replace(/^"|"$/g, ''));

          if (row.length < headers.length) continue;

          const roomCategoryName = getVal(row, roomCatIdx, '');
          const mealPlanCode = getVal(row, mealPlanIdx, 'CP');
          const seasonName = getVal(row, seasonIdx, 'Standard');
          
          const singleRate = getFloat(row, singleRateIdx, 0);
          const doubleRate = getFloat(row, doubleRateIdx, 0);
          const tripleRate = getFloat(row, tripleRateIdx, 0);
          const extraAdultRate = getFloat(row, extraAdultIdx, 0);
          const childWithBedRate = getFloat(row, childWithBedIdx, 0);
          const childWithoutBedRate = getFloat(row, childWithoutBedIdx, 0);
          const weekendSurcharge = getFloat(row, weekendSurchargeIdx, 0);
          const peakSeasonSurcharge = getFloat(row, peakSeasonSurchargeIdx, 0);

          // Get active contract & check tax defaults
          const activeContract = contracts.find(c => c.id === selectedContractId);
          const contractGst = activeContract?.gst_percentage || 18;

          // Parse Rate Type and GST %
          const rawRateType = getVal(row, rateTypeIdx, 'exclusive').toLowerCase();
          const isInclusive = rawRateType.includes('inc') || rawRateType.includes('yes');
          const rateType = isInclusive ? 'inclusive' : 'exclusive';
          const gstPercent = gstPercentIdx !== -1 ? getFloat(row, gstPercentIdx, contractGst) : contractGst;

          // Compute net_cost and gst_amount on-the-fly based on doubleRate
          let netCost = doubleRate;
          let gstAmt = 0;
          let supplierCost = doubleRate;

          if (rateType === 'inclusive') {
            supplierCost = doubleRate;
            netCost = doubleRate / (1 + (gstPercent / 100));
            gstAmt = doubleRate - netCost;
          } else {
            netCost = doubleRate;
            gstAmt = doubleRate * (gstPercent / 100);
            supplierCost = doubleRate + gstAmt;
          }

          // Match category and season IDs
          const roomCat = roomCategories.find(rc => rc.room_category_name.toLowerCase() === roomCategoryName.toLowerCase());
          if (!roomCat) {
            console.warn(`Room category "${roomCategoryName}" not found. Skipping row.`);
            continue;
          }

          const activeSeason = seasons.find(s => s.season_name.toLowerCase() === seasonName.toLowerCase());
          
          ratesToInsert.push({
            contract_id: selectedContractId,
            room_category_id: roomCat.id,
            meal_plan_id: mealPlanCode.toUpperCase(),
            season_id: activeSeason?.id || null,
            single_rate: singleRate,
            double_rate: doubleRate,
            triple_rate: tripleRate,
            quad_rate: doubleRate * 2, // fallback double
            five_bed_rate: 0,
            six_bed_rate: 0,
            extra_adult_rate: extraAdultRate,
            child_with_bed_rate: childWithBedRate,
            child_without_bed_rate: childWithoutBedRate,
            weekend_surcharge: weekendSurcharge,
            peak_season_surcharge: peakSeasonSurcharge,
            active_status: true,
            markup: 0,
            rate_type: rateType,
            gst_percentage: gstPercent,
            gst_amount: gstAmt,
            net_cost: netCost,
            supplier_cost: supplierCost,
            selling_cost: supplierCost,
            is_tax_overridden: false,
            tax_override_reason: null,
            tax_audit_logs: [],
            created_at: new Date().toISOString()
          });
        }

        if (ratesToInsert.length === 0) {
          throw new Error('No valid rate rows could be matched to the selected hotel room categories.');
        }

        const authHeaders = await getAuthHeader();
        // Delete old rates and bulk insert new
        const dRes = await fetch(`${API_BASE}/api.php?table=hotel_contract_rates&contract_id=${selectedContractId}`, {
          method: 'DELETE',
          headers: authHeaders
        });
        if (!dRes.ok) throw new Error('Failed to delete old rates');

        await Promise.all(
          ratesToInsert.map(rate => 
            fetch(`${API_BASE}/api.php?table=hotel_contract_rates`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify(rate)
            }).then(r => {
              if (!r.ok) throw new Error('Failed to insert contract rate');
            })
          )
        );

        toast({ title: 'Import Complete', description: `Successfully uploaded ${ratesToInsert.length} rates into the contract grid!` });
        await logContractAudit('BULK_UPLOAD_RATES', selectedContractId, {}, { count: ratesToInsert.length });
        
        fetchContractRates(selectedContractId);
      } catch (err: any) {
        toast({ title: 'Import Failed', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  // CSV Rates Exporter
  const handleExportRates = () => {
    if (!selectedContractId) return;
    const activeContract = contracts.find(c => c.id === selectedContractId);
    const hotelName = hotels.find(h => h.id === selectedHotelId)?.hotel_name || 'Hotel';

    const headers = [
      'Room Category', 'Meal Plan', 'Season', 'Single Rate', 'Double Rate', 'Triple Rate',
      'Extra Adult', 'Child With Bed', 'Child Without Bed', 'Weekend Surcharge', 'Peak Surcharge',
      'Rate Type', 'GST %'
    ];

    const rows = contractRates.map(r => [
      r.room_categories?.room_category_name || '---',
      r.meal_plan_id,
      r.seasons?.season_name || 'Standard',
      r.single_rate,
      r.double_rate,
      r.triple_rate,
      r.extra_adult_rate,
      r.child_with_bed_rate,
      r.child_without_bed_rate,
      r.weekend_surcharge,
      r.peak_season_surcharge,
      r.rate_type || 'exclusive',
      r.gst_percentage !== null && r.gst_percentage !== undefined ? r.gst_percentage : (activeContract?.gst_percentage || 18)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Rates_Export_${hotelName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hotel Compare toggler
  const handleToggleCompare = (hotelId: string) => {
    if (compareHotelIds.includes(hotelId)) {
      setCompareHotelIds(compareHotelIds.filter(id => id !== hotelId));
    } else {
      if (compareHotelIds.length >= 4) {
        toast({ title: 'Limit Exceeded', description: 'You can compare up to 4 hotels at once.', variant: 'warning' as any });
        return;
      }
      setCompareHotelIds([...compareHotelIds, hotelId]);
    }
  };

  

  if (isFormPage && dialogType && dialogMode) {
    if (dialogType === 'hotel') {
      return (
        <HotelContractWizard
          dialogMode={dialogMode}
          selectedItemId={selectedItemId}
          handleCancel={handleCancel}
        />
      );
    }

    return (
      <div className="max-w-2xl mx-auto py-4 animate-in fade-in duration-200">
        <Card className="shadow-lg border-border/60 p-6 bg-card">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <h2 className="text-sm font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
              {dialogMode === 'add' ? <Plus className="w-4 h-4 text-accent" /> : <Edit className="w-4 h-4 text-accent" />}
              {dialogMode === 'add' ? 'Configure New' : 'Edit Details:'} {dialogType}
            </h2>
            <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={handleCancel}>
              Cancel / Back
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1.5 mb-4 border-b pb-2">
              <h3 className="text-md font-bold flex items-center gap-1.5 uppercase text-slate-900 dark:text-slate-100">
                {dialogMode === 'add' ? <Plus className="w-4 h-4 text-accent" /> : <Edit className="w-4 h-4 text-accent" />}
                {dialogMode === 'add' ? 'Configure New' : 'Edit Details:'} {dialogType}
              </h3>
              <p className="text-[10px] text-muted-foreground">Ensure all mandatory details are specified correctly before saving.</p>
            </div>

            {/* A. HOTEL CRUD FORM */}
            {dialogType === 'hotel' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="h_name">Hotel Name</Label>
                  <Input autoComplete="name" id="h_name" value={hotelForm.hotel_name} onChange={e => setHotelForm({...hotelForm, hotel_name: e.target.value})} placeholder="e.g. Radisson Blu" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="h_code">Hotel Code</Label>
                    <Input id="h_code" value={hotelForm.hotel_code} onChange={e => setHotelForm({...hotelForm, hotel_code: e.target.value})} placeholder="e.g. RBLU-DEL" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="h_star">Star Category</Label>
                    <Select value={String(hotelForm.star_rating)} onValueChange={val => setHotelForm({...hotelForm, star_rating: parseInt(val)})}>
                      <SelectTrigger id="h_star"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Star Comfort</SelectItem>
                        <SelectItem value="4">4 Star Premium</SelectItem>
                        <SelectItem value="5">5 Star Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Country → State → City cascade dropdowns */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label>Country</Label>
                    <Select value={formCountryId} onValueChange={setFormCountryId} required>
                      <SelectTrigger className="h-8 text-[10px]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {countries.map((c, idx) => <SelectItem key={`${c.id}-${idx}`} value={String(c.id)}>{c.country_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>State</Label>
                    <Select value={formStateId} onValueChange={setFormStateId} required>
                      <SelectTrigger className="h-8 text-[10px]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {formStates.map((s, idx) => <SelectItem key={`${s.id}-${idx}`} value={String(s.id)}>{s.state_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>City / City ID</Label>
                    <Select value={hotelForm.city_id} onValueChange={val => setHotelForm({...hotelForm, city_id: val})} required>
                      <SelectTrigger className="h-8 text-[10px]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {formCities.map((c, idx) => <SelectItem key={`${c.id}-${idx}`} value={String(c.id)}>{c.city_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="h_addr">Address Details</Label>
                  <Input id="h_addr" value={hotelForm.address} onChange={e => setHotelForm({...hotelForm, address: e.target.value})} placeholder="Full address" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="h_num">Contact Phone</Label>
                    <Input id="h_num" value={hotelForm.contact_number} onChange={e => setHotelForm({...hotelForm, contact_number: e.target.value})} placeholder="Phone number" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="h_em">General Email</Label>
                    <Input id="h_em" type="email" value={hotelForm.email} onChange={e => setHotelForm({...hotelForm, email: e.target.value})} placeholder="hotel@email.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="h_per">Contact Person</Label>
                    <Input id="h_per" value={hotelForm.contact_person} onChange={e => setHotelForm({...hotelForm, contact_person: e.target.value})} placeholder="Name" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="h_cem">Contact Email</Label>
                    <Input id="h_cem" type="email" value={hotelForm.contact_email} onChange={e => setHotelForm({...hotelForm, contact_email: e.target.value})} placeholder="contact@email.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="h_ci">Check In Time</Label>
                    <Input id="h_ci" value={hotelForm.check_in_time} onChange={e => setHotelForm({...hotelForm, check_in_time: e.target.value})} placeholder="e.g. 12:00 PM" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="h_co">Check Out Time</Label>
                    <Input id="h_co" value={hotelForm.check_out_time} onChange={e => setHotelForm({...hotelForm, check_out_time: e.target.value})} placeholder="e.g. 11:00 AM" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="h_canc">Cancellation Policy Terms</Label>
                  <Textarea id="h_canc" value={hotelForm.cancellation_policy} onChange={e => setHotelForm({...hotelForm, cancellation_policy: e.target.value})} placeholder="e.g. 100% refund 72 hours prior to check-in" rows={2} />
                </div>
              </div>
            )}

            {/* B. SUPPLIER CRUD FORM */}
            {dialogType === 'supplier' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="s_name">Supplier DMC Name</Label>
                  <Input autoComplete="name" id="s_name" value={supplierForm.supplier_name} onChange={e => setSupplierForm({...supplierForm, supplier_name: e.target.value})} placeholder="e.g. Royal Travels DMC" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s_type">Supplier Type</Label>
                  <Select value={supplierForm.supplier_type} onValueChange={val => setSupplierForm({...supplierForm, supplier_type: val})}>
                    <SelectTrigger id="s_type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hotel Supplier">Hotel Contracting Agent</SelectItem>
                      <SelectItem value="DMC Partner">Regional DMC Partner</SelectItem>
                      <SelectItem value="Local Representative">Local Rep Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s_person">Contact Representative</Label>
                  <Input id="s_person" value={supplierForm.contact_person} onChange={e => setSupplierForm({...supplierForm, contact_person: e.target.value})} placeholder="Name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="s_mob">Mobile Phone</Label>
                    <Input id="s_mob" value={supplierForm.mobile} onChange={e => setSupplierForm({...supplierForm, mobile: e.target.value})} placeholder="Mobile" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="s_em">DMC Email</Label>
                    <Input id="s_em" type="email" value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} placeholder="dmc@email.com" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="s_terms">Payment and Credit Terms</Label>
                  <Input id="s_terms" value={supplierForm.payment_terms} onChange={e => setSupplierForm({...supplierForm, payment_terms: e.target.value})} placeholder="e.g. 15 Days Credit Cycle" />
                </div>
              </div>
            )}

            {/* C. ROOM CATEGORY CRUD FORM + DIRECT TARIFF PRICING */}
            {dialogType === 'room' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="r_name">Room Category Name *</Label>
                  <Input autoComplete="name" id="r_name" value={roomForm.room_category_name} onChange={e => setRoomForm({...roomForm, room_category_name: e.target.value})} placeholder="e.g. Deluxe Garden View / Super Deluxe / Suite" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="r_sz">Room Size (Sq Ft)</Label>
                    <Input id="r_sz" value={roomForm.room_size} onChange={e => setRoomForm({...roomForm, room_size: e.target.value})} placeholder="e.g. 350" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="r_bed">Bed Type</Label>
                    <Input id="r_bed" value={roomForm.bed_type} onChange={e => setRoomForm({...roomForm, bed_type: e.target.value})} placeholder="e.g. Double Queen Bed" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="r_adu">Max Adults Allowed</Label>
                    <Input id="r_adu" type="number" value={roomForm.max_adults} onChange={e => setRoomForm({...roomForm, max_adults: parseInt(e.target.value) || 2})} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="r_chi">Max Children Allowed</Label>
                    <Input id="r_chi" type="number" value={roomForm.max_children} onChange={e => setRoomForm({...roomForm, max_children: parseInt(e.target.value) || 2})} required />
                  </div>
                </div>

                {/* 💰 DIRECT ROOM CATEGORY PRICE / TARIFF SECTION */}
                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5" /> Room Category Price / Tariff (Direct Save)
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-normal">
                        Enter the price for this room category directly—no need to edit the entire hotel.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-500 font-bold">
                      Auto-Syncs to Quote Builder
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="r_meal">Primary Meal Plan</Label>
                      <Select value={roomForm.meal_plan_id} onValueChange={val => setRoomForm({...roomForm, meal_plan_id: val})}>
                        <SelectTrigger id="r_meal" className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CP">CP (Room + Breakfast)</SelectItem>
                          <SelectItem value="MAP">MAP (Breakfast + Lunch/Dinner)</SelectItem>
                          <SelectItem value="EP">EP (Room Only)</SelectItem>
                          <SelectItem value="AP">AP (All Meals)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="r_season">Applicable Season</Label>
                      <Select
                        value={roomForm.season_id || (seasons[0]?.id ? String(seasons[0].id) : 'season-normal')}
                        onValueChange={val => setRoomForm({...roomForm, season_id: val})}
                      >
                        <SelectTrigger id="r_season" className="h-9 text-xs"><SelectValue placeholder="All / Normal Season" /></SelectTrigger>
                        <SelectContent>
                          {seasons.length > 0 ? (
                            seasons.map(sn => (
                              <SelectItem key={sn.id} value={String(sn.id)}>{sn.season_name} ({sn.season_type})</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="season-normal">Standard / All-Year Season</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="r_dbl" className="text-emerald-500 font-extrabold">
                        {roomForm.meal_plan_id} Double Rate (₹ / Night) *
                      </Label>
                      <Input
                        id="r_dbl"
                        type="number"
                        value={roomForm.double_rate}
                        onChange={e => {
                          const dbl = Number(e.target.value) || 0;
                          const ext = Number(roomForm.extra_adult_rate) || 0;
                          setRoomForm(prev => ({
                            ...prev,
                            double_rate: e.target.value,
                            single_rate: Number(prev.single_rate) > 0 ? prev.single_rate : Math.round(dbl * 0.85),
                            triple_rate: Number(prev.triple_rate) > 0 ? prev.triple_rate : (dbl + ext),
                            gst_percentage: dbl >= 7500 ? 18 : 12
                          }));
                        }}
                        placeholder="e.g. 3500"
                        className="h-9 text-xs font-extrabold border-emerald-500/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="r_sgl">Single Occupancy Rate (₹)</Label>
                      <Input
                        id="r_sgl"
                        type="number"
                        value={roomForm.single_rate}
                        onChange={e => setRoomForm({...roomForm, single_rate: e.target.value})}
                        placeholder="e.g. 3000"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="r_ext">Extra Bed / Adult Rate (₹)</Label>
                      <Input
                        id="r_ext"
                        type="number"
                        value={roomForm.extra_adult_rate}
                        onChange={e => {
                          const ext = Number(e.target.value) || 0;
                          const dbl = Number(roomForm.double_rate) || 0;
                          setRoomForm(prev => ({
                            ...prev,
                            extra_adult_rate: e.target.value,
                            triple_rate: dbl > 0 ? dbl + ext : prev.triple_rate
                          }));
                        }}
                        placeholder="e.g. 1000"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {roomForm.meal_plan_id !== 'MAP' && (
                      <div className="space-y-1">
                        <Label htmlFor="r_map" className="text-amber-500 font-bold">
                          MAP Double Rate (₹ - Optional)
                        </Label>
                        <Input
                          id="r_map"
                          type="number"
                          value={roomForm.map_double_rate}
                          onChange={e => setRoomForm({...roomForm, map_double_rate: e.target.value})}
                          placeholder="Breakfast + Dinner Rate"
                          className="h-9 text-xs border-amber-500/30"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label htmlFor="r_cwb">Child With Bed (₹)</Label>
                      <Input
                        id="r_cwb"
                        type="number"
                        value={roomForm.child_with_bed_rate}
                        onChange={e => setRoomForm({...roomForm, child_with_bed_rate: e.target.value})}
                        placeholder="e.g. 800"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="r_cwob">Child Without Bed (₹)</Label>
                      <Input
                        id="r_cwob"
                        type="number"
                        value={roomForm.child_without_bed_rate}
                        onChange={e => setRoomForm({...roomForm, child_without_bed_rate: e.target.value})}
                        placeholder="e.g. 500"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="r_desc">Room Description / Highlights</Label>
                  <Textarea id="r_desc" value={roomForm.room_description} onChange={e => setRoomForm({...roomForm, room_description: e.target.value})} placeholder="Room inclusions, mini-bar, balcony details" rows={2} />
                </div>
              </div>
            )}

            {/* D. SEASON CRUD FORM */}
            {dialogType === 'season' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="sn_name">Season Name</Label>
                  <Input autoComplete="name" id="sn_name" value={seasonForm.season_name} onChange={e => setSeasonForm({...seasonForm, season_name: e.target.value})} placeholder="e.g. Peak Summer Holidays" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sn_type">Season Category</Label>
                  <Select value={seasonForm.season_type} onValueChange={val => setSeasonForm({...seasonForm, season_type: val})}>
                    <SelectTrigger id="sn_type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Peak Season">Peak Season Surcharge</SelectItem>
                      <SelectItem value="High Season">High Season Rate</SelectItem>
                      <SelectItem value="Shoulder Season">Shoulder Season Rate</SelectItem>
                      <SelectItem value="Low Season">Low Season Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sn_from">Valid From Date</Label>
                    <Input id="sn_from" type="date" value={seasonForm.start_date} onChange={e => setSeasonForm({...seasonForm, start_date: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sn_to">Valid To Date</Label>
                    <Input id="sn_to" type="date" value={seasonForm.end_date} onChange={e => setSeasonForm({...seasonForm, end_date: e.target.value})} required />
                  </div>
                </div>
              </div>
            )}

            {/* E. CONTRACT CRUD FORM */}
            {dialogType === 'contract' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="c_name">Contract Reference Name</Label>
                  <Input autoComplete="name" id="c_name" value={contractForm.contract_name} onChange={e => setContractForm({...contractForm, contract_name: e.target.value})} placeholder="e.g. Direct Contracting FY 26-27" required />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="c_sup">Supplier DMC Agent (Optional)</Label>
                  <Select value={contractForm.supplier_id} onValueChange={val => setContractForm({...contractForm, supplier_id: val})}>
                    <SelectTrigger id="c_sup"><SelectValue placeholder="Choose Supplier (Direct if Blank)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Direct Hotel Negotiation (No Supplier)</SelectItem>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.supplier_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="c_from">Contract Valid From</Label>
                    <Input id="c_from" type="date" value={contractForm.valid_from} onChange={e => setContractForm({...contractForm, valid_from: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="c_to">Contract Valid To</Label>
                    <Input id="c_to" type="date" value={contractForm.valid_to} onChange={e => setContractForm({...contractForm, valid_to: e.target.value})} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="c_cur">Currency</Label>
                    <Select value={contractForm.currency} onValueChange={val => setContractForm({...contractForm, currency: val})}>
                      <SelectTrigger id="c_cur"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="AED">AED (Dirham)</SelectItem>
                        <SelectItem value="THB">THB (Baht)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="c_gst">GST Percentage (%)</Label>
                    <Input id="c_gst" type="number" value={contractForm.gst_percentage} onChange={e => setContractForm({...contractForm, gst_percentage: parseFloat(e.target.value) || 18})} required />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="c_pay">Payment Terms Policy</Label>
                  <Textarea id="c_pay" value={contractForm.payment_policy} onChange={e => setContractForm({...contractForm, payment_policy: e.target.value})} placeholder="e.g. 50% advance within 7 days of confirmation" rows={2} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="c_canc">Contract Cancellation policy</Label>
                  <Textarea id="c_canc" value={contractForm.cancellation_policy} onChange={e => setContractForm({...contractForm, cancellation_policy: e.target.value})} placeholder="Terms of cancellation" rows={2} />
                </div>
              </div>
            )}

            {/* F. RATE GRID CELL CRUD FORM */}
            {dialogType === 'rate' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <Label>Target Room Category</Label>
                  <Select value={rateForm.room_category_id} onValueChange={val => setRateForm({...rateForm, room_category_id: val})} required>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Choose Category" /></SelectTrigger>
                    <SelectContent>
                      {roomCategories.map(rc => <SelectItem key={rc.id} value={rc.id}>{rc.room_category_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Meal Plan Code</Label>
                    <Select value={rateForm.meal_plan_id} onValueChange={val => setRateForm({...rateForm, meal_plan_id: val})} required>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {mealPlans.map(mp => <SelectItem key={mp.id} value={mp.id}>{mp.meal_plan_name} ({mp.id})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Validity Season</Label>
                    <Select value={rateForm.season_id} onValueChange={val => setRateForm({...rateForm, season_id: val})}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Standard Season" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Standard Season (Fallback)</SelectItem>
                        {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.season_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t pt-3">
                  <div className="space-y-1">
                    <Label>Single Occupancy</Label>
                    <Input type="number" value={rateForm.single_rate} onChange={e => setRateForm({...rateForm, single_rate: parseFloat(e.target.value) || 0})} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Double Occupancy</Label>
                    <Input type="number" value={rateForm.double_rate} onChange={e => setRateForm({...rateForm, double_rate: parseFloat(e.target.value) || 0})} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Triple Occupancy</Label>
                    <Input type="number" value={rateForm.triple_rate} onChange={e => setRateForm({...rateForm, triple_rate: parseFloat(e.target.value) || 0})} required />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t pt-3">
                  <div className="space-y-1">
                    <Label>Extra Adult Rate</Label>
                    <Input type="number" value={rateForm.extra_adult_rate} onChange={e => setRateForm({...rateForm, extra_adult_rate: parseFloat(e.target.value) || 0})} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Child with Bed</Label>
                    <Input type="number" value={rateForm.child_with_bed_rate} onChange={e => setRateForm({...rateForm, child_with_bed_rate: parseFloat(e.target.value) || 0})} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Child no Bed</Label>
                    <Input type="number" value={rateForm.child_without_bed_rate} onChange={e => setRateForm({...rateForm, child_without_bed_rate: parseFloat(e.target.value) || 0})} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                  <div className="space-y-1">
                    <Label>Weekend Surcharge</Label>
                    <Input type="number" value={rateForm.weekend_surcharge} onChange={e => setRateForm({...rateForm, weekend_surcharge: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-1">
                    <Label>Peak Season Surcharge</Label>
                    <Input type="number" value={rateForm.peak_season_surcharge} onChange={e => setRateForm({...rateForm, peak_season_surcharge: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>

                {/* GST ENGINE REDESIGN PANEL */}
                {(() => {
                  const doubleRate = Number(rateForm.double_rate) || 0;
                  const hotel = hotels.find(h => h.id === selectedHotelId);
                  const hotelCountry = hotel?.country || 'India';
                  
                  const isInclusive = rateForm.rate_type === 'inclusive';
                  const suggestedGst = getSuggestedTaxRate(hotelCountry, doubleRate, isInclusive);
                  const gstPercent = (rateForm.gst_percentage !== undefined && rateForm.gst_percentage !== '') 
                    ? Number(rateForm.gst_percentage) 
                    : suggestedGst;

                  let netCost = doubleRate;
                  let gstAmt = 0;
                  let supplierCost = doubleRate;

                  if (isInclusive) {
                    supplierCost = doubleRate;
                    netCost = doubleRate / (1 + (gstPercent / 100));
                    gstAmt = doubleRate - netCost;
                  } else {
                    netCost = doubleRate;
                    gstAmt = doubleRate * (gstPercent / 100);
                    supplierCost = doubleRate + gstAmt;
                  }

                  return (
                    <div className="border-t pt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">GST & Tax Configuration</h4>
                        <Badge variant="outline" className="text-[9px] font-bold bg-accent/10 border-accent/30 text-accent dark:text-accent">
                          GST Auto Applied
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* GST Included? Toggle */}
                        <div className="space-y-2 flex flex-col justify-center">
                          <Label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">GST Included?</Label>
                          <div className="flex gap-2">
                            <button 
                              type="button"
                              onClick={() => setRateForm({...rateForm, rate_type: 'exclusive'})}
                              className={`flex-1 px-3 py-2 text-xs font-bold border rounded-lg transition-all flex items-center gap-2 ${rateForm.rate_type !== 'inclusive' ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-extrabold' : 'bg-background border-border text-muted-foreground'}`}
                            >
                              <span className={`w-4 h-4 border rounded flex items-center justify-center text-[10px] ${rateForm.rate_type !== 'inclusive' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                                {rateForm.rate_type !== 'inclusive' && '✓'}
                              </span>
                              ☐ No
                            </button>
                            <button 
                              type="button"
                              onClick={() => setRateForm({...rateForm, rate_type: 'inclusive'})}
                              className={`flex-1 px-3 py-2 text-xs font-bold border rounded-lg transition-all flex items-center gap-2 ${rateForm.rate_type === 'inclusive' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-extrabold' : 'bg-background border-border text-muted-foreground'}`}
                            >
                              <span className={`w-4 h-4 border rounded flex items-center justify-center text-[10px] ${rateForm.rate_type === 'inclusive' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
                                {rateForm.rate_type === 'inclusive' && '✓'}
                              </span>
                              ☑ Yes
                            </button>
                          </div>
                        </div>

                        {/* GST Percentage */}
                        <div className="space-y-2 flex flex-col justify-center">
                          <Label className="text-[10px] text-slate-500 font-extrabold uppercase flex justify-between tracking-wider">
                            <span>GST Percentage (%)</span>
                            {rateForm.is_tax_overridden && (
                              <span className="text-[8px] bg-rose-500/10 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Overridden</span>
                            )}
                          </Label>
                          <div className="flex gap-1.5 items-center">
                            <Input 
                              type="number" 
                              className="h-9 text-xs font-bold border-border w-20 shrink-0" 
                              value={rateForm.gst_percentage !== undefined ? rateForm.gst_percentage : ''} 
                              placeholder={String(suggestedGst)}
                              onChange={e => {
                                const newGst = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                                const gstVal = newGst === '' ? suggestedGst : Number(newGst);
                                setRateForm({
                                  ...rateForm,
                                  gst_percentage: newGst,
                                  is_tax_overridden: gstVal !== suggestedGst
                                });
                              }}
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button"
                              className="h-9 text-[10px] px-2.5 text-muted-foreground border-border hover:bg-muted font-bold flex-1"
                              onClick={() => {
                                setRateForm({
                                  ...rateForm,
                                  gst_percentage: '',
                                  is_tax_overridden: false
                                });
                              }}
                            >
                              Auto ({suggestedGst}%)
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Breakdown Card */}
                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-950 rounded-xl p-4 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-slate-400">
                            <span>Base Amount</span>
                            <span className="font-semibold text-slate-200">₹{Math.round(netCost).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-400">
                            <span>GST ({gstPercent}%)</span>
                            <span className="font-semibold text-slate-200">₹{Math.round(gstAmt).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300 font-bold border-t border-slate-700/50 pt-1.5 mt-1">
                            <span>Final Supplier Cost</span>
                            <span className="text-emerald-400 font-extrabold">₹{Math.round(supplierCost).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Overriding Info */}
                      {rateForm.is_tax_overridden && (
                        <div className="space-y-1 mt-1.5 animate-in slide-in-from-top-1 duration-150 w-full">
                          <Label className="text-[10px] text-rose-500 font-bold uppercase block">Reason for Override *</Label>
                          <Input 
                            className="h-8 text-xs border-rose-300 bg-rose-500/5 focus-visible:ring-rose-500 w-full" 
                            placeholder="Reason why this contract rate overrides the auto GST slabs..." 
                            value={rateForm.tax_override_reason || ''}
                            onChange={e => {
                              const reason = e.target.value;
                              const logEntry = {
                                entered_amount: doubleRate,
                                gst_included: isInclusive,
                                calculated_gst: gstAmt,
                                base_amount: netCost,
                                final_amount: supplierCost,
                                gst_percent_applied: gstPercent,
                                user: 'system',
                                timestamp: new Date().toISOString(),
                                override_reason: reason
                              };
                              setRateForm({
                                ...rateForm,
                                tax_override_reason: reason,
                                tax_audit_logs: [
                                  ...(rateForm.tax_audit_logs || []).filter((l: any) => l.timestamp !== logEntry.timestamp),
                                  logEntry
                                ]
                              });
                            }}
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide ${isInclusive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600'}`}>
                          {isInclusive ? 'GST Included' : 'GST Extra'}
                        </Badge>
                        <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide ${rateForm.is_tax_overridden ? 'bg-rose-500/10 border-rose-500/30 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'}`}>
                          {rateForm.is_tax_overridden ? 'GST Manually Overridden' : 'GST Auto Applied'}
                        </Badge>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="pt-4 border-t flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={loading}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90" disabled={loading}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Save Modifications
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

return (
    <div className="dark text-slate-100 bg-[#070C1E] min-h-screen p-2 space-y-6">
      {/* Sub Tabs Navigation */}
      <Tabs value={activeMainTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 text-slate-200 font-bold p-1 rounded-xl w-full flex flex-wrap h-auto gap-1">
          <TabsTrigger value="hotels" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Hotel Master
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="rooms-seasons" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Room Categories & Seasons
          </TabsTrigger>
          <TabsTrigger value="contracts" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5" />
            Contract Rates & History
          </TabsTrigger>
          <TabsTrigger value="bulk" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Bulk Rate Upload
          </TabsTrigger>
          <TabsTrigger value="compare" className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Compare Hotels ({compareHotelIds.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. HOTEL MASTER TAB */}
        <TabsContent value="hotels" className="space-y-6 pt-4 animate-in fade-in duration-200">
          {/* Filters card */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
            <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center flex-1">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by hotel name or code..."
                    value={hotelSearch}
                    onChange={(e) => setHotelSearch(e.target.value)}
                    className="pl-9 h-9 text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 placeholder:text-slate-400 focus-visible:ring-amber-500 shadow-sm"
                  />
                </div>

                {/* 1. Country Filter */}
                <Select value={hotelFilterCountry} onValueChange={handleCountryFilterChange}>
                  <SelectTrigger className="h-9 text-xs w-[130px] font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 shadow-sm"><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countryOptions.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* 2. State Filter */}
                <Select value={hotelFilterState} onValueChange={handleStateFilterChange}>
                  <SelectTrigger className="h-9 text-xs w-[130px] font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 shadow-sm"><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {stateOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* 3. City Filter */}
                <Select value={hotelFilterCity} onValueChange={handleCityFilterChange}>
                  <SelectTrigger className="h-9 text-xs w-[130px] font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 shadow-sm"><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cityOptions.map(ct => <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* 4. Star Rating Filter */}
                <Select value={hotelFilterStar} onValueChange={handleStarFilterChange}>
                  <SelectTrigger className="h-9 text-xs w-[110px] font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 shadow-sm"><SelectValue placeholder="Rating" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="3">3 Star</SelectItem>
                    <SelectItem value="4">4 Star</SelectItem>
                    <SelectItem value="5">5 Star</SelectItem>
                  </SelectContent>
                </Select>

                {/* Reset Filters Button */}
                {(hotelFilterCountry !== 'all' || hotelFilterState !== 'all' || hotelFilterCity !== 'all' || hotelFilterStar !== 'all' || hotelSearch !== '') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetFilters}
                    className="h-9 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2.5"
                  >
                    Reset
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => navigate('/crm/bulk-upload')} variant="outline" className="h-9 px-3 rounded-xl text-xs font-extrabold border-amber-500/40 text-amber-400 hover:bg-amber-500/10 shrink-0">
                  <UploadCloud className="w-4 h-4 mr-1.5" /> Bulk Upload
                </Button>
                <Button onClick={() => handleOpenAddDialog('hotel')} className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 hover:opacity-90 font-bold border-none font-bold h-9 text-xs rounded-xl shadow-sm shrink-0">
                  <Plus className="w-4 h-4 mr-2" /> Add Hotel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hotels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-[#161d2f]/80 rounded-2xl border border-dashed border-[#C9A25A]/30 space-y-3">
                <Building2 className="w-12 h-12 text-[#C9A25A] mx-auto opacity-70 animate-pulse" />
                <p className="text-base font-bold text-slate-100">No hotels found matching your selected criteria.</p>
                <p className="text-xs text-slate-400 font-medium">Try adjusting your filter search or register a new hotel to set up contracting.</p>
                <div className="pt-2 flex justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleResetFilters} className="border-[#C9A25A]/40 text-[#C9A25A] hover:bg-[#C9A25A]/10 font-bold rounded-xl text-xs">Clear All Filters</Button>
                  <Button size="sm" onClick={() => handleOpenAddDialog('hotel')} className="bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] text-[#0B1026] font-extrabold rounded-xl text-xs">+ Register New Hotel</Button>
                </div>
              </div>
            ) : filteredHotels.slice(0, visibleHotelCount).map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden border border-slate-800 bg-[#161d2f] hover:border-amber-500/40 hover:shadow-xl transition-all group flex flex-col justify-between rounded-xl">
                  <div>
                    {/* Featured/Placeholder image */}
                    <div className="h-40 p-4 flex flex-col justify-between relative overflow-hidden bg-slate-950">
                      {hotel.featured_image_url ? (
                        <img 
                          src={hotel.featured_image_url} 
                          alt={hotel.hotel_name} 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-500/10" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/50 to-slate-950/90 pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col justify-between h-full w-full">
                        <div className="flex justify-between items-start w-full">
                          <div className="flex gap-1 items-center bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                            {Array.from({ length: hotel.star_rating || 3 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-amber-400 font-extrabold border border-amber-400/30 uppercase tracking-wide">
                            {hotel.hotel_code}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-white font-bold text-base leading-tight group-hover:text-amber-400 transition-colors uppercase tracking-wide truncate">{hotel.hotel_name}</h3>
                          <p className="text-amber-200/90 text-xs flex items-center font-semibold uppercase gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            {hotel.city || hotel.cities?.city_name || 'India'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-3.5 text-xs font-semibold bg-[#161d2f] text-slate-200">
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                        <span className="text-slate-400 font-bold">Ratings:</span>
                        <span className="flex items-center gap-1.5">
                          <span className="bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md font-extrabold text-[10px]">G: {Number(hotel.google_rating).toFixed(1)}</span>
                          <span className="bg-indigo-400/15 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-md font-extrabold text-[10px]">INT: {Number(hotel.internal_rating).toFixed(1)}</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                        <span className="text-slate-400 font-bold">Supported Meals:</span>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {(() => {
                            let mpList: string[] = [];
                            if (Array.isArray(hotel.meal_plan_supported)) {
                              mpList = hotel.meal_plan_supported;
                            } else if (typeof hotel.meal_plan_supported === 'string') {
                              try {
                                const parsed = JSON.parse(hotel.meal_plan_supported);
                                mpList = Array.isArray(parsed) ? parsed : [hotel.meal_plan_supported];
                              } catch (e) {
                                mpList = hotel.meal_plan_supported.split(',').map((s: string) => s.trim()).filter(Boolean);
                              }
                            }
                            return mpList.length > 0 ? (
                              mpList.map((mp: string, i: number) => <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0.5 border border-slate-700 bg-slate-800 text-slate-100 font-extrabold uppercase">{mp}</Badge>)
                            ) : (
                              <span className="text-slate-200 font-bold">EP, CP, MAP</span>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-slate-400 font-bold">Contact Details:</span>
                        <span className="text-amber-300 font-extrabold truncate max-w-[170px]" title={hotel.email || ''}>{hotel.email || hotel.contact_number || '---'}</span>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-3 border-t border-slate-800 bg-[#0f1420] flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleCompare(hotel.id)}
                      className={`text-[10px] font-bold h-7 rounded-lg px-2.5 transition-all ${
                        compareHotelIds.includes(hotel.id) 
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold' 
                          : 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {compareHotelIds.includes(hotel.id) ? 'Selected for Compare' : 'Add to Compare'}
                    </Button>
                    <div className="flex gap-1.5">
                      <Button size="icon" variant="ghost" className="w-7 h-7 bg-slate-800/80 hover:bg-indigo-500/20 text-indigo-400 border border-slate-700" onClick={() => handleOpenReviews(hotel.id, hotel.hotel_name)} title="View traveler reviews">
                        <Star className="w-3.5 h-3.5 fill-indigo-400/30" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-7 h-7 bg-slate-800/80 hover:bg-amber-500/20 text-amber-400 border border-slate-700" onClick={() => handleOpenEditDialog('hotel', hotel)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-7 h-7 bg-slate-800/80 hover:bg-rose-500/20 text-rose-400 border border-slate-700" onClick={() => handleDeleteItem('hotel', hotel.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

            {totalPages > 1 && (
              <div className="col-span-full py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 mt-4">
                <div className="text-xs text-slate-400 font-semibold">
                  Showing <span className="text-white font-bold">{hotels.length}</span> of <span className="text-amber-400 font-bold">{totalRecords}</span> hotels (Page {currentPage} of {totalPages})
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                    <option value={500}>500 / page (Show All)</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold rounded-xl h-8 px-3"
                  >
                    Previous
                  </Button>

                  <span className="text-xs font-extrabold text-amber-400 px-2 py-1 bg-slate-800 rounded-lg border border-slate-700">
                    {currentPage} / {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold rounded-xl h-8 px-3"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* 2. SUPPLIERS MASTER TAB */}
        <TabsContent value="suppliers" className="space-y-6 pt-4 animate-in fade-in duration-200">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row justify-between items-center p-6 border-b border-border/40 bg-slate-50/30 dark:bg-slate-900/10">
              <div>
                <CardTitle className="text-md font-bold">Supplier Directory</CardTitle>
                <CardDescription className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Manage travel partners, local DMCs, and hotel suppliers.</CardDescription>
              </div>
              <Button onClick={() => handleOpenAddDialog('supplier')} className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90 h-8 text-xs rounded-xl shadow-sm">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Supplier
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {suppliers.length === 0 ? (
                <div className="text-center py-12 text-slate-800 dark:text-slate-200 font-bold text-xs">
                  No suppliers recorded.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {suppliers.map((supplier) => (
                    <Card key={supplier.id} className="overflow-hidden border-border/60 hover:border-accent/30 hover:shadow-md transition-all group flex flex-col justify-between bg-card/65 backdrop-blur-sm">
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1 truncate">
                            <h3 className="font-extrabold text-sm text-foreground group-hover:text-accent transition-colors uppercase tracking-wider truncate" title={supplier.supplier_name}>
                              {supplier.supplier_name}
                            </h3>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded font-mono font-extrabold uppercase">
                              {supplier.supplier_type}
                            </span>
                          </div>
                          <Badge className={supplier.active_status ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 shrink-0 font-bold' : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/10 shrink-0 font-bold'} variant="outline">
                            {supplier.active_status ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-xs font-semibold text-slate-800 dark:text-slate-200 pt-3 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>Representative: <strong className="text-foreground">{supplier.contact_person || '---'}</strong></span>
                          </div>
                          {(supplier.mobile || supplier.email) && (
                            <div className="space-y-1 bg-muted/40 p-2 rounded-lg border border-border/30">
                              {supplier.mobile && (
                                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                  <Phone className="w-3 h-3 text-accent shrink-0" />
                                  <span>{supplier.mobile}</span>
                                </div>
                              )}
                              {supplier.email && (
                                <div className="flex items-center gap-1.5 font-mono text-[10px] truncate">
                                  <Mail className="w-3 h-3 text-accent shrink-0" />
                                  <span className="truncate" title={supplier.email}>{supplier.email}</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Landmark className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>Payment Cycle: <strong className="text-foreground">{supplier.payment_terms || '---'}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-1.5">
                        <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-accent/10 text-accent" onClick={() => handleOpenEditDialog('supplier', supplier)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-rose-500/10 text-rose-500" onClick={() => handleDeleteItem('supplier', supplier.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. ROOM CATEGORIES & SEASONS TAB */}
        <TabsContent value="rooms-seasons" className="space-y-6 pt-4 animate-in fade-in duration-200">
          {/* Hotel selector */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
            <CardContent className="p-4 flex gap-4 items-center">
              <Label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 shrink-0">Select Hotel Target:</Label>
              <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                <SelectTrigger className="h-9 text-xs w-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 shadow-sm"><SelectValue placeholder="Choose Hotel" /></SelectTrigger>
                <SelectContent>
                  {hotels.map(h => <SelectItem key={h.id} value={h.id}>{h.hotel_name} ({h.hotel_code})</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Categories Section */}
            <Card className="border-border/60">
              <CardHeader className="flex flex-row justify-between items-center p-4 border-b border-b-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent" /> Room Categories
                </CardTitle>
                <Button size="sm" onClick={() => handleOpenAddDialog('room')} disabled={!selectedHotelId} className="h-7 text-[10px] font-bold bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 hover:opacity-90 rounded-lg">
                  <Plus className="w-3 h-3 mr-1" /> Add Category
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {roomCategories.length === 0 ? (
                  <div className="text-center py-10 text-slate-800 dark:text-slate-200 text-xs font-bold">
                    No room categories created.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    {roomCategories.map(rc => {
                      const rcRates = contractRates.filter(cr => String(cr.room_category_id) === String(rc.id));
                      return (
                        <Card key={rc.id} className="overflow-hidden border-border/60 hover:border-accent/30 hover:shadow-md transition-all flex flex-col justify-between p-4 bg-card/65 backdrop-blur-sm">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="space-y-1">
                                <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wide">{rc.room_category_name}</h4>
                                {rc.room_size && (
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700">
                                    {rc.room_size} Sq Ft
                                  </Badge>
                                )}
                              </div>
                              <Badge className={rc.active_status ? 'bg-emerald-500/10 text-emerald-600 font-bold shrink-0' : 'bg-rose-500/10 text-rose-600 font-bold shrink-0'} variant="outline">
                                {rc.active_status ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>

                            <div className="space-y-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 pt-2.5 border-t border-border/30">
                              <p className="flex justify-between">
                                <span>Bed Type:</span> 
                                <strong className="text-foreground">{rc.bed_type || '---'}</strong>
                              </p>
                              <p className="flex justify-between">
                                <span>Max Occupancy:</span> 
                                <strong className="text-foreground">{rc.max_adults} Adults + {rc.max_children} Child</strong>
                              </p>

                              {/* Live Room Category Tariff Summary */}
                              <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500 block">
                                  Room Tariff (Per Night):
                                </span>
                                {rcRates.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {rcRates.map((rt, rIdx) => (
                                      <Badge
                                        key={rt.id || rIdx}
                                        variant="outline"
                                        className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                      >
                                        {rt.meal_plan_id}: ₹{Number(rt.double_rate || 0).toLocaleString('en-IN')}
                                        {Number(rt.extra_adult_rate) > 0 ? ` (+₹${Number(rt.extra_adult_rate).toLocaleString('en-IN')} Ext)` : ''}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic block">
                                    No price set yet — click &quot;₹ Set Price&quot; below
                                  </span>
                                )}
                              </div>

                              {rc.room_description && (
                                <p className="text-[10px] font-normal leading-relaxed text-slate-500 mt-2 bg-muted/30 p-2 rounded border border-border/20 italic">
                                  "{rc.room_description}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-1 border-t border-border/40 pt-2.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-[10px] font-extrabold border-amber-500/40 text-amber-500 hover:bg-amber-500/10 rounded-lg cursor-pointer"
                              onClick={() => handleOpenEditDialog('room', rc)}
                            >
                              <IndianRupee className="w-3 h-3 mr-1" />
                              {rcRates.length > 0 ? 'Edit Price' : 'Set Price'}
                            </Button>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" className="w-6.5 h-6.5 hover:bg-accent/10 text-accent" onClick={() => handleOpenEditDialog('room', rc)}>
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="w-6.5 h-6.5 hover:bg-rose-500/10 text-rose-500" onClick={() => handleDeleteItem('room', rc.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seasons Master Section */}
            <Card className="border-border/60">
              <CardHeader className="flex flex-row justify-between items-center p-4 border-b border-b-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-accent" /> Season Configurations
                </CardTitle>
                <Button size="sm" onClick={() => handleOpenAddDialog('season')} disabled={!selectedHotelId} className="h-7 text-[10px] font-bold bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 hover:opacity-90 rounded-lg">
                  <Plus className="w-3 h-3 mr-1" /> Add Season
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {seasons.length === 0 ? (
                  <div className="text-center py-10 text-slate-800 dark:text-slate-200 text-xs font-bold">
                    No seasons configured.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    {seasons.map(sn => (
                      <Card key={sn.id} className="overflow-hidden border-border/60 hover:border-accent/30 hover:shadow-md transition-all p-4 flex flex-col justify-between bg-card/65 backdrop-blur-sm">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wide truncate" title={sn.season_name}>
                              {sn.season_name}
                            </h4>
                            <Badge className="text-[9px] font-bold bg-accent/5 text-accent dark:text-accent border-accent/20 uppercase tracking-wider px-2 py-0.5 shrink-0" variant="outline">
                              {sn.season_type}
                            </Badge>
                          </div>

                          <div className="space-y-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 pt-2.5 border-t border-border/30">
                            <p className="flex justify-between items-center">
                              <span className="text-slate-800 dark:text-slate-200 font-bold">Validity Period:</span>
                              <span className="text-foreground font-bold flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                                {sn.start_date} <ArrowRight className="w-3 h-3 text-accent inline mx-0.5" /> {sn.end_date}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end gap-1 border-t border-border/40 pt-2.5">
                          <Button size="icon" variant="ghost" className="w-6.5 h-6.5 hover:bg-accent/10 text-accent" onClick={() => handleOpenEditDialog('season', sn)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-6.5 h-6.5 hover:bg-rose-500/10 text-rose-500" onClick={() => handleDeleteItem('season', sn.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 4. CONTRACT MANAGEMENT & RATES GRID (MYSQL-BACKED) */}
        <TabsContent value="contracts" className="space-y-6 pt-4 animate-in fade-in duration-200">
          {/* 📊 TOP OVERVIEW: ALL MYSQL HOTEL CONTRACTS & EXPIRY ALERTS */}
          {(() => {
            const nowMs = Date.now();
            const enrichedContracts = allContractsOverview.map(c => {
              const hObj = hotels.find(h => String(h.id) === String(c.hotel_id));
              const supObj = suppliers.find(s => String(s.id) === String(c.supplier_id));
              const cRates = allRatesOverview.filter(r => String(r.contract_id) === String(c.id));
              const lowestDouble = cRates.reduce((min, r) => {
                const d = Number(r.double_rate || r.net_cost || 0);
                return d > 0 && (min === 0 || d < min) ? d : min;
              }, 0);
              const validToMs = c.valid_to ? new Date(c.valid_to).getTime() : 0;
              const daysLeft = validToMs ? Math.ceil((validToMs - nowMs) / 86400000) : 365;
              const statusType = validToMs && daysLeft < 0 ? 'expired' : (validToMs && daysLeft <= 30 ? 'expiring' : 'active');
              return {
                ...c,
                hotel_name: hObj?.hotel_name || `Hotel #${c.hotel_id}`,
                city: hObj?.city || '---',
                supplier_name: supObj?.supplier_name || 'Direct Hotel B2B',
                ratesCount: cRates.length,
                lowestDouble,
                daysLeft,
                statusType
              };
            });
            const expiringCount = enrichedContracts.filter(c => c.statusType === 'expiring').length;
            const expiredCount = enrichedContracts.filter(c => c.statusType === 'expired').length;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-border/60 bg-card/70 p-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">MySQL Active Contracts</span>
                    <div className="text-2xl font-black text-foreground mt-1">{enrichedContracts.length}</div>
                    <span className="text-[10px] text-emerald-500 font-bold">Synced with hotel_contracts table</span>
                  </Card>
                  <Card className="border-border/60 bg-card/70 p-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Negotiated Rate Rows</span>
                    <div className="text-2xl font-black text-emerald-500 mt-1">{allRatesOverview.length}</div>
                    <span className="text-[10px] text-muted-foreground font-semibold">Live in hotel_contract_rates</span>
                  </Card>
                  <Card className="border-amber-500/30 bg-amber-500/5 p-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 block">Expiring Soon (&le;30 Days)</span>
                    <div className="text-2xl font-black text-amber-500 mt-1">{expiringCount}</div>
                    <span className="text-[10px] text-muted-foreground font-semibold">Renew B2B tariff sheets soon</span>
                  </Card>
                  <Card className="border-rose-500/30 bg-rose-500/5 p-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block">Expired Contracts</span>
                    <div className="text-2xl font-black text-rose-500 mt-1">{expiredCount}</div>
                    <span className="text-[10px] text-muted-foreground font-semibold">Requires validity extension</span>
                  </Card>
                </div>

                {enrichedContracts.length > 0 && (
                  <Card className="border-border/60 overflow-hidden">
                    <CardHeader className="p-3.5 border-b border-border/40 bg-slate-50/40 dark:bg-slate-900/20 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-accent" /> All Hotel Contracts Registry (Click Any Row to Manage Rates)
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-500 font-bold">
                        MySQL Live Storage
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-0 max-h-56 overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-muted/60 text-[10px] uppercase font-extrabold text-muted-foreground sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Hotel &amp; City</th>
                            <th className="py-2 px-3">Contract / Supplier DMC</th>
                            <th className="py-2 px-3">Validity &amp; Status</th>
                            <th className="py-2 px-3">Starting Tariff</th>
                            <th className="py-2 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {enrichedContracts.map(ec => {
                            const isSelected = String(selectedContractId) === String(ec.id);
                            return (
                              <tr
                                key={ec.id}
                                onClick={() => {
                                  setSelectedHotelId(String(ec.hotel_id));
                                  setTimeout(() => setSelectedContractId(String(ec.id)), 80);
                                }}
                                className={`cursor-pointer transition-colors ${
                                  isSelected ? 'bg-accent/15 font-bold' : 'hover:bg-muted/40'
                                }`}
                              >
                                <td className="py-2 px-3">
                                  <div className="font-extrabold text-foreground">{ec.hotel_name}</div>
                                  <div className="text-[10px] text-muted-foreground">{ec.city}</div>
                                </td>
                                <td className="py-2 px-3">
                                  <div className="font-bold text-foreground">{ec.contract_name}</div>
                                  <div className="text-[10px] text-muted-foreground">{ec.supplier_name} • {ec.ratesCount} rate rows</div>
                                </td>
                                <td className="py-2 px-3">
                                  <div className="text-[11px] font-mono">{ec.valid_from || '---'} &rarr; {ec.valid_to || '---'}</div>
                                  {ec.statusType === 'expired' ? (
                                    <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-500 border-rose-500/30 font-extrabold">
                                      Expired ({Math.abs(ec.daysLeft)}d ago)
                                    </Badge>
                                  ) : ec.statusType === 'expiring' ? (
                                    <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/30 font-extrabold">
                                      Expiring in {ec.daysLeft}d
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-extrabold">
                                      Active ({ec.daysLeft}d left)
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-2 px-3 font-mono font-extrabold text-emerald-500">
                                  {ec.lowestDouble > 0 ? `₹${ec.lowestDouble.toLocaleString('en-IN')}/nt` : 'No rates yet'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold">
                                    Manage Rates
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left col - selectors & contracts list */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="border-border/60">
                <CardHeader className="p-4 border-b border-border/40">
                  <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Select Hotel Target</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                    <SelectTrigger className="h-9 text-xs w-full font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 shadow-sm"><SelectValue placeholder="Choose Hotel" /></SelectTrigger>
                    <SelectContent>
                      {hotels.map(h => <SelectItem key={h.id} value={h.id}>{h.hotel_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader className="flex flex-row justify-between items-center p-4 border-b border-border/40">
                  <CardTitle className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Contracts</CardTitle>
                  <Button size="sm" onClick={() => handleOpenAddDialog('contract')} disabled={!selectedHotelId} className="h-6 text-[9px] font-bold bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 hover:opacity-90 rounded">
                    Add Contract
                  </Button>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  {contracts.map(contract => {
                    const isActive = String(selectedContractId) === String(contract.id);
                    return (
                      <button
                        key={contract.id}
                        onClick={() => setSelectedContractId(String(contract.id))}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col gap-1.5 ${
                          isActive 
                            ? 'bg-accent/10 border-accent/40 text-accent dark:text-amber-300 font-bold' 
                            : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold'
                        }`}
                      >
                        <div className="font-bold flex justify-between items-center">
                          <span className="truncate">{contract.contract_name}</span>
                          <Badge className="text-[8px] font-bold uppercase tracking-wider px-1 bg-secondary text-slate-800 border-border/40" variant="outline">
                            {contract.currency}
                          </Badge>
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground uppercase">
                          Val: {contract.valid_from} to {contract.valid_to}
                        </div>
                      </button>
                    );
                  })}
                  {contracts.length === 0 && (
                    <p className="text-center py-6 text-muted-foreground text-xs">No contracts negotiated yet. Use the Quick Rate Bar on the right to auto-create one in MySQL.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right col - Quick MySQL Rate Entry, contract detail, rates grid & history log */}
            <div className="space-y-6 lg:col-span-3">
              {/* ⚡ FAST INLINE MYSQL RATE ENTRY BAR (Works even before a contract is created!) */}
              {selectedHotelId && (
                <Card className="border-amber-500/40 bg-amber-500/5 shadow-sm">
                  <CardHeader className="p-4 pb-2 border-b border-amber-500/20 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4" /> ⚡ Quick Add / Update Room Tariff in MySQL
                      </CardTitle>
                      <CardDescription className="text-[11px]">
                        Select room category &amp; meal plan, enter B2B rate &amp; markup, and save directly to MySQL without leaving this screen.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-500 font-bold">
                      Direct MySQL Upsert
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-[10px] font-bold">Room Category</Label>
                        <Select
                          value={inlineQuickRate.room_category_id || (roomCategories[0]?.id ? String(roomCategories[0].id) : '')}
                          onValueChange={val => setInlineQuickRate(prev => ({ ...prev, room_category_id: val }))}
                        >
                          <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="Standard / Deluxe Room" /></SelectTrigger>
                          <SelectContent>
                            {roomCategories.length > 0 ? (
                              roomCategories.map(rc => (
                                <SelectItem key={rc.id} value={String(rc.id)}>{rc.room_category_name}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="auto">Standard / Deluxe Room (Auto-Create)</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">Meal Plan</Label>
                        <Select
                          value={inlineQuickRate.meal_plan_id}
                          onValueChange={val => setInlineQuickRate(prev => ({ ...prev, meal_plan_id: val }))}
                        >
                          <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CP">CP (Breakfast)</SelectItem>
                            <SelectItem value="MAP">MAP (Bfast+Dinner)</SelectItem>
                            <SelectItem value="EP">EP (Room Only)</SelectItem>
                            <SelectItem value="AP">AP (All Meals)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-extrabold text-emerald-500">Double Rate (₹) *</Label>
                        <Input
                          type="number"
                          value={inlineQuickRate.double_rate}
                          onChange={e => {
                            const dbl = Number(e.target.value) || 0;
                            setInlineQuickRate(prev => ({
                              ...prev,
                              double_rate: e.target.value,
                              single_rate: Math.round(dbl * 0.85)
                            }));
                          }}
                          placeholder="e.g. 4200"
                          className="h-8 text-xs font-extrabold bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">Extra Bed (₹)</Label>
                        <Input
                          type="number"
                          value={inlineQuickRate.extra_adult_rate}
                          onChange={e => setInlineQuickRate(prev => ({ ...prev, extra_adult_rate: e.target.value }))}
                          placeholder="e.g. 1200"
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-amber-500">Markup (₹)</Label>
                        <Input
                          type="number"
                          value={inlineQuickRate.markup}
                          onChange={e => setInlineQuickRate(prev => ({ ...prev, markup: e.target.value }))}
                          placeholder="e.g. 800"
                          className="h-8 text-xs font-bold bg-background"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-500/20">
                      <div className="text-[11px] text-muted-foreground">
                        {(() => {
                          const dbl = Number(inlineQuickRate.double_rate) || 0;
                          const gstPct = dbl >= 7500 ? 18 : 12;
                          const gstAmt = Math.round(dbl * (gstPct / 100));
                          const supCost = dbl + gstAmt;
                          const sellCost = supCost + (Number(inlineQuickRate.markup) || 0);
                          return (
                            <span>
                              B2B Net + {gstPct}% GST: <strong className="text-foreground">₹{supCost.toLocaleString('en-IN')}</strong> • Client Selling Rate:{' '}
                              <strong className="text-emerald-500">₹{sellCost.toLocaleString('en-IN')}/night</strong>
                            </span>
                          );
                        })()}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSavingInlineRate}
                        onClick={handleSaveQuickInlineRate}
                        className="h-8 px-4 text-xs font-extrabold bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 hover:opacity-90 rounded-lg cursor-pointer"
                      >
                        {isSavingInlineRate ? 'Saving to MySQL...' : '💾 Save Rate to MySQL'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedContractId ? (
                <>
                  {/* Contract Details */}
                  {(() => {
                    const activeContract = contracts.find(c => String(c.id) === String(selectedContractId));
                    if (!activeContract) return null;
                    return (
                      <Card className="border-border/60">
                        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/30">
                          <div>
                            <CardTitle className="text-base font-bold flex items-center gap-1.5 uppercase">
                              <FileText className="w-5 h-5 text-accent" />
                              {activeContract.contract_name}
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                              Supplier DMC: <span className="font-semibold text-foreground">{activeContract.hotel_suppliers?.supplier_name || 'Direct Hotel Contract'}</span>
                            </CardDescription>
                          </div>
                          
                          <div className="flex gap-1.5 pt-2 sm:pt-0">
                            <Button size="sm" variant="outline" className="h-8 text-xs border-border/60" onClick={() => handleOpenEditDialog('contract', activeContract)}>
                              <Edit className="w-3.5 h-3.5 mr-1" /> Edit Contract Details
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8 text-xs font-bold" onClick={() => handleDeleteItem('contract', activeContract.id)}>
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Contract
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold text-muted-foreground">
                          <div className="space-y-2">
                            <p>Validity Period: <span className="text-foreground">{activeContract.valid_from} to {activeContract.valid_to}</span></p>
                            <p>GST Applied: <span className="text-foreground">{Number(activeContract.gst_percentage)}%</span></p>
                            <p>Preferred Currency: <span className="text-foreground">{activeContract.currency}</span></p>
                          </div>
                          <div className="space-y-2">
                            <p>Cancellation Policy:</p>
                            <p className="font-normal text-[11px] text-foreground leading-normal p-2 bg-muted/20 border border-border/40 rounded-lg whitespace-pre-wrap">
                              {activeContract.cancellation_policy || 'No specific cancellation terms registered.'}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p>Payment Terms &amp; Policies:</p>
                            <p className="font-normal text-[11px] text-foreground leading-normal p-2 bg-muted/20 border border-border/40 rounded-lg whitespace-pre-wrap">
                              {activeContract.payment_policy || 'No specific payment terms configured.'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}

                  {/* Contract Rates Grid */}
                  <Card className="border-border/60">
                    <CardHeader className="flex flex-row justify-between items-center p-4 border-b border-border/40">
                      <div>
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                          <Landmark className="w-4.5 h-4.5 text-accent" /> Negotiated Rates Grid (MySQL Stored)
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Direct contract prices, GST, supplier cost, and client selling rates.</CardDescription>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportRates} className="h-8 text-xs border-border/60">
                          <Download className="w-3.5 h-3.5 mr-1" /> Export Rates
                        </Button>
                        <Button size="sm" onClick={() => handleOpenAddDialog('rate')} className="h-8 text-xs bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Full Rate Form
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {contractRates.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground text-xs font-semibold">
                          No rates added yet. Use the ⚡ Quick Add Rate Bar above or upload a CSV file.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                          {contractRates.map((rate) => {
                            const baseVal = Number(rate.net_cost || rate.double_rate || 0);
                            const gstVal = Number(rate.gst_amount || Math.round(baseVal * (Number(rate.gst_percentage || 12) / 100)));
                            const supCostVal = Number(rate.supplier_cost || (baseVal + gstVal));
                            const markupVal = Number(rate.markup || 0);
                            const sellVal = Number(rate.selling_cost || (supCostVal + markupVal));
                            return (
                              <Card key={rate.id} className="overflow-hidden border-border/60 hover:border-accent/30 hover:shadow-md transition-all flex flex-col justify-between bg-card/65 backdrop-blur-sm">
                                <div className="p-4 space-y-3">
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="space-y-1 truncate">
                                      <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wide truncate" title={rate.room_categories?.room_category_name || 'Standard Room'}>
                                        {rate.room_categories?.room_category_name || 'Standard Room'}
                                      </h4>
                                      <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 font-black uppercase tracking-wider bg-secondary/5 text-muted-foreground">
                                        {rate.meal_plan_id}
                                      </Badge>
                                    </div>
                                    <Badge className={rate.active_status ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20 shrink-0 font-bold' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 shrink-0 font-bold'}>
                                      {rate.active_status ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2 text-xs font-semibold text-muted-foreground pt-3 border-t border-border/30">
                                    <div className="flex justify-between">
                                      <span>Double Base Rate:</span>
                                      <span className="text-foreground font-mono">₹{baseVal.toLocaleString('en-IN')}</span>
                                    </div>
                                    {Number(rate.extra_adult_rate) > 0 && (
                                      <div className="flex justify-between">
                                        <span>Extra Bed / Adult:</span>
                                        <span className="text-foreground font-mono">₹{Number(rate.extra_adult_rate).toLocaleString('en-IN')}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span>GST Applied:</span>
                                      <span className="text-foreground">{Number(rate.gst_percentage || 12)}% (₹{gstVal.toLocaleString('en-IN')})</span>
                                    </div>
                                    <div className="flex justify-between text-xs border-t border-border/20 pt-2 mt-1.5 font-bold">
                                      <span>B2B Supplier Cost:</span>
                                      <span className="text-emerald-500 font-extrabold font-mono">₹{supCostVal.toLocaleString('en-IN')}</span>
                                    </div>
                                    {markupVal > 0 && (
                                      <div className="flex justify-between text-xs font-extrabold text-amber-500">
                                        <span>Client Selling Price:</span>
                                        <span className="font-mono">₹{sellVal.toLocaleString('en-IN')}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span>Validity Season:</span>
                                      <span className="text-foreground font-semibold">{rate.seasons?.season_name || 'Standard'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-3 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-1.5">
                                  <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-accent/10 text-accent" onClick={() => handleOpenEditDialog('rate', rate)}>
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-rose-500/10 text-rose-500" onClick={() => handleDeleteItem('rate', rate.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contract Version History Logs */}
                  <Card className="border-border/60">
                    <CardHeader className="p-4 border-b border-border/40">
                      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent animate-pulse" /> Contract Version &amp; Audit History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-48 overflow-y-auto">
                      <div className="relative border-l border-border pl-4 space-y-4 text-xs font-medium">
                        {contractHistoryLogs.map((log) => (
                          <div key={log.id} className="relative">
                            <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border border-background" />
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-foreground capitalize">{log.action.replace(/_/g, ' ')}</span>
                              <span className="text-[10px] text-muted-foreground font-semibold">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-muted-foreground font-normal mt-0.5">Performed by {log.user_name} ({log.user_role})</p>
                          </div>
                        ))}
                        {contractHistoryLogs.length === 0 && (
                          <p className="text-center text-muted-foreground py-2 font-normal">No history records logged.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-border/60 py-12 flex flex-col justify-center items-center text-center space-y-3 bg-slate-50/20 dark:bg-slate-900/5">
                  <Landmark className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-bounce" />
                  <div>
                    <h3 className="font-extrabold text-foreground text-base">Select a Hotel Target on the Left</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">Choose any hotel from the dropdown (or click a row in the All Hotel Contracts Registry above) to add or edit MySQL contracted rates immediately.</p>
                  </div>
                </Card>
              )}
            </div>

          </div>
        </TabsContent>

        {/* 5. BULK CONTRACT UPLOAD TAB */}
        <TabsContent value="bulk" className="space-y-6 pt-4 animate-in fade-in duration-200">
          <Card className="border-border/60 max-w-2xl mx-auto shadow-md">
            <CardHeader className="border-b border-border/40 p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-extrabold tracking-tight">Bulk Contract Rates Uploader</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">Download pre-filled CSV format layout, input negotiated rates, and upload for bulk syncing.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Hotel & Contract picker */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs font-semibold">
                  <Label>1. Hotel Target</Label>
                  <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Choose Hotel" /></SelectTrigger>
                    <SelectContent>
                      {hotels.map(h => <SelectItem key={h.id} value={h.id}>{h.hotel_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5 text-xs font-semibold">
                  <Label>2. Negotiated Contract</Label>
                  <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Choose Contract" /></SelectTrigger>
                    <SelectContent>
                      {contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.contract_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Upload trigger panel */}
              {selectedContractId ? (
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center bg-accent/5 dark:bg-accent/5 rounded-xl p-4 border border-accent/25">
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-accent dark:text-amber-300">Ready to Download CSV Template?</h4>
                      <p className="text-accent/80 dark:text-accent/80 font-normal">Generate pre-filled rows mapped to current rooms and seasons.</p>
                    </div>
                    <Button onClick={handleDownloadTemplate} className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90 text-xs h-9">
                      <Download className="w-3.5 h-3.5 mr-1" /> Template CSV
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-border/60 hover:border-accent/40 rounded-2xl p-8 text-center bg-card/60 cursor-pointer relative transition-all flex flex-col items-center justify-center space-y-4">
                    <Upload className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                    <div>
                      <h4 className="font-extrabold text-foreground text-sm">Upload Filled Rates CSV File</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Double click to select a local CSV file, or drag and drop it here.</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImportCSV}
                      accept=".csv"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <Alert className="bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900">
                  <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <AlertTitle className="text-indigo-800 dark:text-indigo-300 font-bold text-xs">Select Contract Target</AlertTitle>
                  <AlertDescription className="text-indigo-700 dark:text-indigo-400 text-[11px] leading-relaxed">
                    Please select a target Hotel and negotiated Contract above to activate the template generator and CSV bulk rate uploader.
                  </AlertDescription>
                </Alert>
              )}

            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. HOTEL COMPARISON TAB */}
        <TabsContent value="compare" className="space-y-6 pt-4 animate-in fade-in duration-200">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row justify-between items-center p-4 border-b border-border/40 bg-slate-50/30 dark:bg-slate-900/10">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-accent" /> Hotel Spec Comparison Board
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Compare ratings, contact information, facilities, and contracts side-by-side.</CardDescription>
              </div>
              {compareHotelIds.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setCompareHotelIds([])} className="h-7 text-xs text-rose-500 font-bold">
                  Clear Compare List
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4">
              {compareHotelIds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {compareHotelIds.map(id => {
                    const hotel = hotels.find(h => h.id === id);
                    if (!hotel) return null;
                    return (
                      <Card key={hotel.id} className="border-border/60 flex flex-col justify-between overflow-hidden shadow-sm relative">
                        <div className="p-4 space-y-4">
                          {/* Heading */}
                          <div className="space-y-1">
                            <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wide truncate">{hotel.hotel_name}</h3>
                            <p className="text-slate-500 font-bold text-[10px] uppercase">{hotel.hotel_code}</p>
                          </div>

                          {/* Star Rating */}
                          <div className="flex gap-1 items-center">
                            {Array.from({ length: hotel.star_rating || 3 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                            ))}
                          </div>

                          {/* Details */}
                          <div className="space-y-2.5 text-xs font-semibold text-muted-foreground pt-3 border-t border-border/30">
                            <p className="flex justify-between"><span>Location:</span> <span className="text-foreground">{hotel.city || '---'}</span></p>
                            <p className="flex justify-between"><span>Google Rating:</span> <span className="text-foreground">{Number(hotel.google_rating).toFixed(1)}</span></p>
                            <p className="flex justify-between"><span>Internal Rating:</span> <span className="text-foreground">{Number(hotel.internal_rating).toFixed(1)}</span></p>
                            <p className="flex justify-between"><span>Check-In:</span> <span className="text-foreground">{hotel.check_in_time || '12:00'}</span></p>
                            <p className="flex justify-between"><span>Check-Out:</span> <span className="text-foreground">{hotel.check_out_time || '11:00'}</span></p>
                            <p className="flex justify-between"><span>Contact Person:</span> <span className="text-foreground">{hotel.contact_person || '---'}</span></p>
                          </div>

                          {/* Cancellation Policy */}
                          <div className="space-y-1 text-xs pt-3 border-t border-border/30">
                            <p>Cancellation Policy Summary:</p>
                            <p className="font-normal text-[10px] text-foreground leading-normal p-2 bg-muted/40 rounded-lg max-h-16 overflow-y-auto">
                              {hotel.cancellation_policy || 'Standard cancellation policy applies.'}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/30">
                          <Button size="sm" variant="destructive" className="w-full text-xs" onClick={() => handleToggleCompare(hotel.id)}>
                            Remove Comparison
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs flex flex-col justify-center items-center space-y-3 bg-slate-50/20 dark:bg-slate-900/5 rounded-2xl border border-dashed border-border/60">
                  <RefreshCw className="w-10 h-10 text-slate-300 dark:text-slate-700 animate-spin" />
                  <div>
                    <h4 className="font-bold text-foreground">No Hotels Selected for Comparison</h4>
                    <p className="max-w-xs mx-auto mt-1 font-normal text-muted-foreground">Navigate to the Hotel Master tab and select up to 4 hotels by clicking "Add to Compare" on their cards.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      

      {reviewsHotelId && (
        <Dialog open={!!reviewsHotelId} onOpenChange={(open) => { if (!open) setReviewsHotelId(null); }}>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-md rounded-2xl border-indigo-100 shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">
                ⭐ Traveler Reviews — {reviewsHotelName}
              </DialogTitle>
              <DialogDescription>
                Reviews from customers whose itineraries included this hotel.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {loadingReviews ? (
                <div className="py-8 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : hotelReviews.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <p>No traveler reviews have been submitted for this hotel yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hotelReviews.map((r) => (
                    <Card key={r.id} className="border border-slate-100 bg-slate-50/50 p-4">
                      <CardContent className="p-0 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-800 block">{r.reviewer_name}</span>
                            <span className="text-slate-400 text-xs">{new Date(r.review_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-slate-500">Hotel Rating: {r.hotel_rating || r.rating}★</span>
                            <span className="text-xs font-semibold text-slate-400">Overall Trip: {r.rating}★</span>
                          </div>
                        </div>
                        <p className="text-slate-600 text-xs italic leading-relaxed">
                          "{r.review_text}"
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setReviewsHotelId(null)} className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
