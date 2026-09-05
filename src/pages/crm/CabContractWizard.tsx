import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Car, Plus, Search, Edit, Power, Download, Upload,
  Info, HelpCircle, FileText, CheckCircle2, AlertTriangle, Loader2,
  MapPin, Users, Phone, Mail, Globe, Sparkles, DollarSign,
  ArrowRight, Landmark, Calendar, Trash2, Layers, RefreshCw, Clock, ArrowLeft, Save
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

interface CabContractWizardProps {
  dialogMode: 'add' | 'edit' | null;
  selectedItemId: string | null;
  handleCancel: () => void;
}

const WIZARD_STEPS = [
  'Supplier Info',
  'Vehicle Master',
  'Route Config',
  'Rate Slabs',
  'Review & Publish'
];

const VEHICLE_TYPES = [
  'Swift Dzire (4-Seater)',
  'Swift Dzire',
  'Sedan',
  'Maruti Ertiga (6-Seater)',
  'Maruti Ertiga',
  'MUV',
  'Innova Crysta (6/7-Seater)',
  'Innova Crysta',
  'Innova',
  'SUV',
  'AC Tempo Traveller (12/17-Seater)',
  'Tempo Traveller 12',
  'Tempo Traveller 17',
  'Tempo Traveller',
  'Hatchback',
  'Mini Bus',
  'Luxury Coach',
  'Volvo Coach',
  'Premium SUV',
  'Luxury Sedan'
];

const VEHICLE_CATEGORIES = [
  'Standard',
  'Economy',
  'Premium',
  'Luxury',
  'Sedan',
  'MUV',
  'SUV',
  'Tempo Traveller',
  'Coach'
];
const AVAILABILITY_STATUSES = ['Available', 'Booked', 'Blocked', 'Maintenance', 'Inactive'];
const ROUTE_TYPES = [
  'Airport Transfer',
  'Railway Transfer',
  'Point to Point',
  'Sightseeing',
  'Intercity Transfer',
  'Multi-Day Tour',
  'Disposal'
];
const RATE_MODEL_OPTIONS = [
  { value: 'Per KM', label: 'Per KM — Rann Utsav / Outstation (Rate × Min KM/Day)' },
  { value: 'Per Day', label: 'Per Day — Char Dham Day Basis (Rate × Days)' },
  { value: 'Block Circuit', label: 'Block Circuit — Kerala / Char Dham Full (Fixed Total per Circuit)' },
  { value: 'Per Transfer', label: 'Per Transfer (Airport/Station)' },
  { value: 'Package Basis', label: 'Package Basis (8H/80KM)' },
  { value: 'One-Way Drop', label: 'One-Way Drop' },
  { value: 'Hill Station Surcharge', label: 'Hill Station Surcharge' },
  { value: 'Interstate Permit', label: 'Interstate Permit' },
  { value: 'Disposal Basis', label: 'Disposal Basis' }
];

const BLOCK_CIRCUIT_DURATIONS = [
  '1N/2D', '2N/3D', '3N/4D', '4N/5D', '5N/6D',
  '6N/7D', '7N/8D', '8N/9D', '9N/10D', '10D/9N'
];

const getDefaultRateModelForRoute = (routeType?: string): string => {
  if (routeType === 'Airport Transfer' || routeType === 'Railway Transfer') return 'Per Transfer';
  if (routeType === 'Local Sightseeing') return 'Package Basis';
  if (routeType === 'Disposal') return 'Disposal Basis';
  if (routeType === 'Multi-Day Tour') return 'Block Circuit';
  return 'Per KM';
};

const normalizeRateModel = (modelVal?: string, routeType?: string): string => {
  if (!modelVal) return getDefaultRateModelForRoute(routeType);
  if (modelVal.includes('Block Circuit') || modelVal === 'Block Circuit') return 'Block Circuit';
  if (modelVal.includes('Per KM') || modelVal === 'Per KM') return 'Per KM';
  if (modelVal.includes('Per Day') || modelVal === 'Per Day') return 'Per Day';
  if (modelVal.includes('Per Transfer') || modelVal === 'Per Transfer') return 'Per Transfer';
  if (modelVal.includes('Package') || modelVal === 'Package Basis' || modelVal === 'Sightseeing') return 'Package Basis';
  return modelVal;
};

const getDefaultRateForVehicle = (vehicleType: string = '') => {
  const v = (vehicleType || '').toLowerCase();
  if (v.includes('ertiga') || v.includes('muv') || v.includes('6-seater') || v.includes('6 seater')) {
    return { rate_per_km: 16, min_km_per_day: 300, driver_allowance: 300 };
  }
  if (v.includes('innova') || v.includes('crysta') || v.includes('suv') || v.includes('7-seater') || v.includes('6/7-seater')) {
    return { rate_per_km: 22, min_km_per_day: 300, driver_allowance: 300 };
  }
  if (v.includes('tempo') || v.includes('traveller') || v.includes('12-seater') || v.includes('17-seater') || v.includes('coach')) {
    return { rate_per_km: 28, min_km_per_day: 300, driver_allowance: 500 };
  }
  return { rate_per_km: 14, min_km_per_day: 300, driver_allowance: 300 };
};

const SEASONS = ['Peak Season', 'Super Peak', 'Festive Season', 'Normal Season', 'Off Season'];

const formatDateForInput = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  if (dateStr.includes('T')) return dateStr.split('T')[0];
  if (dateStr.includes(' ')) return dateStr.split(' ')[0];
  return dateStr;
};

const parseJsonArray = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } 
    catch { return []; }
  }
  return [];
};

export const CabContractWizard: React.FC<CabContractWizardProps> = ({
  dialogMode,
  selectedItemId,
  handleCancel
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Supplier info
  const [supplierForm, setSupplierForm] = useState({
    supplier_name: '',
    supplier_code: '',
    contact_person: '',
    mobile: '',
    email: '',
    gst_number: '',
    pan_number: '',
    payment_terms: '',
    commission_percentage: 0,
    valid_from: '',
    valid_to: '',
    active_status: true
  });

  // Vehicles list
  const [vehicles, setVehicles] = useState<any[]>([
    {
      id: 'temp-veh-1',
      vehicle_type: 'Sedan',
      vehicle_category: 'Standard',
      capacity_adults: 4,
      capacity_children: 2,
      luggage_capacity: '2 Large Bags',
      availability_status: 'Available',
      vehicle_images: [] as string[]
    }
  ]);

  // Routes list
  const [routes, setRoutes] = useState<any[]>([
    {
      id: 'temp-rt-1',
      source: 'Delhi Airport',
      destination: 'Hotel in Delhi',
      state: 'Delhi',
      country: 'India',
      route_type: 'Airport Transfer',
      distance_km: 25,
      travel_time: '45 mins',
      maps_link: ''
    }
  ]);

  // Rate config mapping: key is "vehicleId-routeId-season"
  const [gridRates, setGridRates] = useState<Record<string, any>>({});
  const [activeRateKey, setActiveRateKey] = useState<string | null>(null);

  const [citiesList, setCitiesList] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserAndCities = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setCurrentUser(data.user);

      try {
        const authHeaders = await getAuthHeader();
        const res = await fetch(`${API_BASE}/api.php?table=cities`, { headers: authHeaders });
        if (res.ok) {
          const cData = await res.json();
          setCitiesList(Array.isArray(cData) ? cData : []);
        }
      } catch (err) {
        console.error('Failed to fetch cities list:', err);
      }
    };
    fetchUserAndCities();
  }, []);

  useEffect(() => {
    if (dialogMode === 'edit' && selectedItemId) {
      loadContractDetails(selectedItemId);
    }
  }, [dialogMode, selectedItemId]);

  const loadContractDetails = async (contractId: string) => {
    setLoading(true);
    try {
      // Fetch contract
      const cRes = await fetch(`${API_BASE}/api.php?table=cab_contracts&id=${contractId}`);
      if (!cRes.ok) throw new Error('Failed to fetch contract');
      const contractData = await cRes.json();
      
      const sRes = await fetch(`${API_BASE}/api.php?table=cab_suppliers&id=${contractData.supplier_id}`);
      const supplierData = sRes.ok ? await sRes.json() : null;
      
      const contract = {
        ...contractData,
        cab_suppliers: supplierData
      };
      
      if (contract) {
        setSupplierForm({
          supplier_name: contract.cab_suppliers?.supplier_name || '',
          supplier_code: contract.cab_suppliers?.supplier_code || '',
          contact_person: contract.cab_suppliers?.contact_person || '',
          mobile: contract.cab_suppliers?.mobile || '',
          email: contract.cab_suppliers?.email || '',
          gst_number: contract.cab_suppliers?.gst_number || '',
          pan_number: contract.cab_suppliers?.pan_number || '',
          payment_terms: contract.cab_suppliers?.payment_terms || '',
          commission_percentage: Number(contract.cab_suppliers?.commission_percentage) || 0,
          valid_from: formatDateForInput(contract.valid_from),
          valid_to: formatDateForInput(contract.valid_to),
          active_status: contract.active_status
        });
      }

      // Fetch rates
      const ratesRes = await fetch(`${API_BASE}/api.php?table=cab_contract_rates`);
      if (!ratesRes.ok) throw new Error('Failed to fetch rates');
      const allRates = await ratesRes.json();
      const contractRates = allRates.filter((r: any) => r.contract_id === contractId);

      // Fetch vehicles and routes to map them
      const [vRes, rtRes] = await Promise.all([
        fetch(`${API_BASE}/api.php?table=cab_vehicles`),
        fetch(`${API_BASE}/api.php?table=cab_routes`)
      ]);
      const vehiclesList = vRes.ok ? await vRes.json() : [];
      const routesList = rtRes.ok ? await rtRes.json() : [];

      const rates = contractRates.map((r: any) => ({
        ...r,
        cab_vehicles: vehiclesList.find((v: any) => v.id === r.vehicle_id),
        cab_routes: routesList.find((rt: any) => rt.id === r.route_id)
      }));
      
      if (rates && rates.length > 0) {
        // Build unique vehicle and route lists from DB
        const loadedVehicles: any[] = [];
        const loadedRoutes: any[] = [];
        const loadedRates: Record<string, any> = {};

        rates.forEach(rate => {
          const veh = rate.cab_vehicles;
          if (veh && !loadedVehicles.some(v => v.id === veh.id)) {
            loadedVehicles.push({
              id: veh.id,
              vehicle_type: veh.vehicle_type || '',
              vehicle_category: veh.vehicle_category || '',
              capacity_adults: Number(veh.capacity_adults) || 0,
              capacity_children: Number(veh.capacity_children) || 0,
              luggage_capacity: veh.luggage_capacity || '',
              availability_status: veh.availability_status || 'Available',
              vehicle_images: parseJsonArray(veh.vehicle_images)
            });
          }

          const rt = rate.cab_routes;
          if (rt && !loadedRoutes.some(r => r.id === rt.id)) {
            loadedRoutes.push({
              id: rt.id,
              source: rt.source || '',
              destination: rt.destination || '',
              state: rt.state || '',
              country: rt.country || '',
              route_type: rt.route_type || '',
              distance_km: Number(rt.distance_km) || 0,
              travel_time: rt.travel_time || '',
              maps_link: rt.maps_link || ''
            });
          }

          const rateKey = `${veh?.id || 'none'}-${rt?.id || 'none'}-${rate.season}`;
          loadedRates[rateKey] = {
            id: rate.id,
            rate_model: rate.rate_model,
            base_km_included: rate.base_km_included,
            rate_per_km: rate.rate_per_km,
            min_km_per_day: rate.min_km_per_day,
            driver_allowance: rate.driver_allowance,
            night_charges: rate.night_charges,
            daily_rate: rate.daily_rate,
            night_allowance: rate.night_allowance,
            max_km_included: rate.max_km_included,
            extra_km_charge: rate.extra_km_charge,
            airport_name: rate.airport_name,
            hotel_area: rate.hotel_area,
            transfer_cost: rate.transfer_cost,
            meet_greet_charges: rate.meet_greet_charges,
            waiting_charges: rate.waiting_charges,
            sightseeing_destination: rate.sightseeing_destination,
            hours_included: rate.hours_included,
            km_included: rate.km_included,
            vehicle_cost: rate.vehicle_cost,
            extra_hour_cost: rate.extra_hour_cost,
            extra_km_cost: rate.extra_km_cost,
            toll_charges: rate.toll_charges,
            parking_charges: rate.parking_charges,
            state_tax: rate.state_tax,
            permit_charges: rate.permit_charges,
            base_cost: rate.base_cost,
            gst_included: rate.gst_included,
            gst_percentage: rate.gst_percentage,
            gst_amount: rate.gst_amount,
            supplier_cost: rate.supplier_cost,
            markup_percentage: rate.markup_percentage,
            markup_amount: rate.markup_amount,
            selling_cost: rate.selling_cost,
            profit_margin: rate.profit_margin,
            is_tax_overridden: rate.is_tax_overridden,
            tax_override_reason: rate.tax_override_reason,
            tax_audit_logs: rate.tax_audit_logs || [],
            block_circuit_cost: Number(rate.block_circuit_cost) || (rate.rate_model === 'Block Circuit' ? Number(rate.base_cost || rate.supplier_cost || 0) : 0),
            block_circuit_km: Number(rate.block_circuit_km) || (rate.rate_model === 'Block Circuit' ? Number(rate.base_km_included || rt?.distance_km || 0) : 0),
            block_circuit_nights: rate.block_circuit_nights || (rate.rate_model === 'Block Circuit' ? (rt?.travel_time || '') : ''),
            block_extra_km_rate: Number(rate.block_extra_km_rate) || Number(rate.extra_km_cost || rate.rate_per_km || 0)
          };
        });

        if (loadedVehicles.length > 0) setVehicles(loadedVehicles);
        if (loadedRoutes.length > 0) setRoutes(loadedRoutes);
        setGridRates(loadedRates);
      }
    } catch (err: any) {
      toast({ title: 'Error loading contract details', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVehicle = (id: string, field: string, val: any) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, [field]: val } : v));
  };

  const handleAddVehicle = () => {
    const newId = 'temp-veh-' + Date.now();
    setVehicles(prev => [
      ...prev,
      {
        id: newId,
        vehicle_type: 'SUV',
        vehicle_category: 'Standard',
        capacity_adults: 6,
        capacity_children: 2,
        luggage_capacity: '3 Bags',
        availability_status: 'Available',
        vehicle_images: []
      }
    ]);
  };

  const handleRemoveVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const handleUpdateRoute = (id: string, field: string, val: any) => {
    setRoutes(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const handleAddRoute = () => {
    const newId = 'temp-rt-' + Date.now();
    setRoutes(prev => [
      ...prev,
      {
        id: newId,
        source: '',
        destination: '',
        state: '',
        country: 'India',
        route_type: 'Point to Point',
        distance_km: 0,
        travel_time: '',
        maps_link: ''
      }
    ]);
  };

  const handleRemoveRoute = (id: string) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateRateField = (key: string, field: string, val: any) => {
    setGridRates(prev => {
      const oldRate = prev[key] || {
        rate_model: 'Per KM',
        base_km_included: 80, rate_per_km: 12, min_km_per_day: 250, driver_allowance: 300, night_charges: 0,
        daily_rate: 0, night_allowance: 0, max_km_included: 0, extra_km_charge: 0,
        airport_name: '', hotel_area: '', transfer_cost: 0, meet_greet_charges: 0, waiting_charges: 0,
        sightseeing_destination: '', hours_included: 8, km_included: 80, vehicle_cost: 0, extra_hour_cost: 0, extra_km_cost: 0,
        toll_charges: 0, parking_charges: 0, state_tax: 0, permit_charges: 0,
        gst_included: false, gst_percentage: 5, markup_percentage: 0
      };
      
      const newRate = { ...oldRate, [field]: val };
      
      // Calculate real-time costs
      let baseCost = 0;
      if (newRate.rate_model === 'Per KM') {
        const kms = Number(newRate.min_km_per_day) || 250;
        baseCost = (kms * Number(newRate.rate_per_km)) + Number(newRate.driver_allowance) + Number(newRate.night_charges);
      } else if (newRate.rate_model === 'Per Day') {
        baseCost = Number(newRate.daily_rate) + Number(newRate.night_allowance);
      } else if (newRate.rate_model === 'Per Transfer') {
        baseCost = Number(newRate.transfer_cost) + Number(newRate.meet_greet_charges) + Number(newRate.waiting_charges);
      } else if (newRate.rate_model === 'Per Route') {
        baseCost = Number(newRate.vehicle_cost);
      } else if (newRate.rate_model === 'Sightseeing') {
        baseCost = Number(newRate.vehicle_cost);
      } else {
        baseCost = Number(newRate.vehicle_cost) || 0;
      }

      // Add allowances & surcharges
      const surcharges = Number(newRate.toll_charges || 0) + Number(newRate.parking_charges || 0) + Number(newRate.state_tax || 0) + Number(newRate.permit_charges || 0);
      const subTotal = baseCost + surcharges;

      // GST Engine
      const gstPercent = Number(newRate.gst_percentage) || 5;
      let gstAmt = 0;
      let supplierCost = subTotal;
      let netCost = subTotal;

      if (newRate.gst_included) {
        supplierCost = subTotal;
        netCost = subTotal / (1 + (gstPercent / 100));
        gstAmt = subTotal - netCost;
      } else {
        netCost = subTotal;
        gstAmt = subTotal * (gstPercent / 100);
        supplierCost = subTotal + gstAmt;
      }

      // Markup & Selling cost
      const markupPercent = Number(newRate.markup_percentage) || 0;
      const markupAmt = supplierCost * (markupPercent / 100);
      const sellingCost = supplierCost + markupAmt;
      const profit = sellingCost - supplierCost;

      newRate.base_cost = subTotal;
      newRate.gst_amount = gstAmt;
      newRate.supplier_cost = supplierCost;
      newRate.markup_amount = markupAmt;
      newRate.selling_cost = sellingCost;
      newRate.profit_margin = profit;

      return {
        ...prev,
        [key]: newRate
      };
    });
  };

  const handleNextStep = () => {
    // Validate inputs
    if (activeStep === 1) {
      if (!supplierForm.supplier_name || !supplierForm.valid_from || !supplierForm.valid_to) {
        toast({ title: 'Validation Failed', description: 'Please specify Supplier Name and validity dates.', variant: 'destructive' });
        return;
      }
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

      // 1. Insert or update cab_supplier
      let supplierId = '';
      const supplierPayload = {
        supplier_name: supplierForm.supplier_name,
        supplier_code: supplierForm.supplier_code || 'SUP-' + Date.now().toString().substring(8),
        contact_person: supplierForm.contact_person,
        mobile: supplierForm.mobile,
        email: supplierForm.email,
        gst_number: supplierForm.gst_number,
        pan_number: supplierForm.pan_number,
        payment_terms: supplierForm.payment_terms,
        commission_percentage: Number(supplierForm.commission_percentage) || 0,
        valid_from: supplierForm.valid_from,
        valid_to: supplierForm.valid_to,
        active_status: supplierForm.active_status
      };

      if (dialogMode === 'add') {
        const res = await fetch(`${API_BASE}/api.php?table=cab_suppliers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(supplierPayload)
        });
        if (!res.ok) throw new Error('Failed to create supplier');
        const sData = await res.json();
        supplierId = sData.id;
      } else {
        // Find contract to update supplier
        const cRes = await fetch(`${API_BASE}/api.php?table=cab_contracts&id=${selectedItemId}`, {
          headers: authHeaders
        });
        if (!cRes.ok) throw new Error('Failed to find contract');
        const oldContract = await cRes.json();
        if (oldContract?.supplier_id) {
          supplierId = oldContract.supplier_id;
          const res = await fetch(`${API_BASE}/api.php?table=cab_suppliers&id=${supplierId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(supplierPayload)
          });
          if (!res.ok) throw new Error('Failed to update supplier');
        }
      }

      // 2. Insert or update contract record
      let contractId = selectedItemId || '';
      const contractPayload = {
        supplier_id: supplierId,
        contract_name: `Contract - ${supplierForm.supplier_name}`,
        valid_from: supplierForm.valid_from,
        valid_to: supplierForm.valid_to,
        active_status: supplierForm.active_status
      };

      if (dialogMode === 'add') {
        const res = await fetch(`${API_BASE}/api.php?table=cab_contracts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(contractPayload)
        });
        if (!res.ok) throw new Error('Failed to create contract');
        const cData = await res.json();
        contractId = cData.id;
      } else {
        const res = await fetch(`${API_BASE}/api.php?table=cab_contracts&id=${contractId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(contractPayload)
        });
        if (!res.ok) throw new Error('Failed to update contract');
      }

      // 3. Upsert vehicles
      const savedVehicles: any[] = [];
      for (const veh of vehicles) {
        const vehPayload = {
          vehicle_type: veh.vehicle_type,
          vehicle_category: veh.vehicle_category,
          capacity_adults: Number(veh.capacity_adults) || 4,
          capacity_children: Number(veh.capacity_children) || 2,
          luggage_capacity: veh.luggage_capacity,
          availability_status: veh.availability_status || 'Available',
          active_status: true
        };

        if (veh.id.startsWith('temp-')) {
          const res = await fetch(`${API_BASE}/api.php?table=cab_vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(vehPayload)
          });
          if (!res.ok) throw new Error('Failed to create vehicle');
          const data = await res.json();
          savedVehicles.push({ oldId: veh.id, newId: data.id });
        } else {
          const res = await fetch(`${API_BASE}/api.php?table=cab_vehicles&id=${veh.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(vehPayload)
          });
          if (!res.ok) throw new Error('Failed to update vehicle');
          savedVehicles.push({ oldId: veh.id, newId: veh.id });
        }
      }

      // 4. Upsert routes
      const savedRoutes: any[] = [];
      for (const rt of routes) {
        const fromCity = citiesList.find((c: any) => (c.name || c.city_name || '').toLowerCase() === (rt.source || '').toLowerCase().trim());
        const toCity = citiesList.find((c: any) => (c.name || c.city_name || '').toLowerCase() === (rt.destination || '').toLowerCase().trim());

        const rtPayload = {
          source: rt.source,
          destination: rt.destination,
          from_city_id: rt.from_city_id || (fromCity ? fromCity.id : null),
          to_city_id: rt.to_city_id || (toCity ? toCity.id : null),
          state: rt.state,
          country: rt.country,
          route_type: rt.route_type,
          distance_km: Number(rt.distance_km) || 0,
          travel_time: rt.travel_time,
          maps_link: rt.maps_link,
          active_status: true
        };

        if (rt.id.startsWith('temp-')) {
          const res = await fetch(`${API_BASE}/api.php?table=cab_routes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(rtPayload)
          });
          if (!res.ok) throw new Error('Failed to create route');
          const data = await res.json();
          savedRoutes.push({ oldId: rt.id, newId: data.id });
        } else {
          const res = await fetch(`${API_BASE}/api.php?table=cab_routes&id=${rt.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(rtPayload)
          });
          if (!res.ok) throw new Error('Failed to update route');
          savedRoutes.push({ oldId: rt.id, newId: rt.id });
        }
      }

      // 5. Delete old rates if editing to prevent duplicates
      if (dialogMode === 'edit') {
        const delRes = await fetch(`${API_BASE}/api.php?table=cab_contract_rates&contract_id=${contractId}`, {
          method: 'DELETE',
          headers: authHeaders
        });
        if (!delRes.ok) throw new Error('Failed to delete old rates');
      }

      // 6. Bulk Insert contract rates
      const ratesPayloads: any[] = [];
      savedVehicles.forEach(sVeh => {
        const matchingVeh = vehicles.find(v => v.id === sVeh.oldId);
        const vehDefaults = getDefaultRateForVehicle(matchingVeh?.vehicle_type);

        savedRoutes.forEach(sRt => {
          SEASONS.forEach(season => {
            const clientRateKey = `${sVeh.oldId}-${sRt.oldId}-${season}`;
            const clientRate = gridRates[clientRateKey] || {};
            
            const rateModel = clientRate.rate_model || 'Per KM';
            
            ratesPayloads.push({
              contract_id: contractId,
              vehicle_id: sVeh.newId,
              route_id: sRt.newId,
              season: season,
              rate_model: rateModel,
              base_km_included: Number(clientRate.base_km_included) || 80,
              rate_per_km: Number(clientRate.rate_per_km) || vehDefaults.rate_per_km,
              min_km_per_day: Number(clientRate.min_km_per_day) || vehDefaults.min_km_per_day,
              driver_allowance: Number(clientRate.driver_allowance) || vehDefaults.driver_allowance,
              night_charges: Number(clientRate.night_charges) || 0,
              daily_rate: Number(clientRate.daily_rate) || 0,
              night_allowance: Number(clientRate.night_allowance) || 0,
              max_km_included: Number(clientRate.max_km_included) || 0,
              extra_km_charge: Number(clientRate.extra_km_charge) || 0,
              airport_name: clientRate.airport_name || '',
              hotel_area: clientRate.hotel_area || '',
              transfer_cost: Number(clientRate.transfer_cost) || 0,
              meet_greet_charges: Number(clientRate.meet_greet_charges) || 0,
              waiting_charges: Number(clientRate.waiting_charges) || 0,
              sightseeing_destination: clientRate.sightseeing_destination || '',
              hours_included: Number(clientRate.hours_included) || 8,
              km_included: Number(clientRate.km_included) || 80,
              vehicle_cost: Number(clientRate.vehicle_cost) || 0,
              extra_hour_cost: Number(clientRate.extra_hour_cost) || 0,
              extra_km_cost: Number(clientRate.extra_km_cost) || 0,
              toll_charges: Number(clientRate.toll_charges) || 0,
              parking_charges: Number(clientRate.parking_charges) || 0,
              state_tax: Number(clientRate.state_tax) || 0,
              permit_charges: Number(clientRate.permit_charges) || 0,
              base_cost: Number(clientRate.base_cost) || 0,
              gst_included: clientRate.gst_included || false,
              gst_percentage: Number(clientRate.gst_percentage) || 5,
              gst_amount: Number(clientRate.gst_amount) || 0,
              supplier_cost: Number(clientRate.supplier_cost) || 0,
              markup_percentage: Number(clientRate.markup_percentage) || 0,
              markup_amount: Number(clientRate.markup_amount) || 0,
              selling_cost: Number(clientRate.selling_cost) || 0,
              profit_margin: Number(clientRate.profit_margin) || 0,
              is_tax_overridden: clientRate.is_tax_overridden || false,
              tax_override_reason: clientRate.tax_override_reason || '',
              tax_audit_logs: clientRate.tax_audit_logs || [],
              block_circuit_km: Number(clientRate.block_circuit_km) || 0,
              block_circuit_nights: clientRate.block_circuit_nights || '',
              block_circuit_cost: Number(clientRate.block_circuit_cost) || 0,
              block_extra_km_rate: Number(clientRate.block_extra_km_rate) || 0
            });
          });
        });
      });

      for (const ratePayload of ratesPayloads) {
        const ratePostRes = await fetch(`${API_BASE}/api.php?table=cab_contract_rates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(ratePayload)
        });
        if (!ratePostRes.ok) throw new Error('Failed to save rate payload');
      }

      toast({ title: 'Success', description: 'Cab Contract negotiated successfully.' });
      handleCancel();
    } catch (err: any) {
      toast({ title: 'Publishing Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark text-slate-100 bg-[#070C1E] min-h-screen p-2 w-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-200">
      
      {/* Main Content Area */}
      <div className="w-full lg:flex-1 lg:min-w-[700px] space-y-4">
        
        {/* Step Indicator Header */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              <span>Cab Contracting Wizard</span>
              <span className="text-accent font-extrabold">Step {activeStep} of 5</span>
            </div>
            <div className="flex gap-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
              {WIZARD_STEPS.map((step, idx) => (
                <div 
                  key={step} 
                  className={`flex-1 h-full rounded-full transition-all duration-350 ${
                    activeStep > idx ? 'bg-accent' : 'bg-muted-foreground/15'
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-5 text-[9px] uppercase tracking-wide font-bold text-center mt-2.5">
              {WIZARD_STEPS.map((step, idx) => (
                <span key={step} className={activeStep === idx + 1 ? 'text-accent font-extrabold' : 'text-slate-400'}>
                  {step}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wizard Form Sections */}
        <Card className="border-border/60">
          <CardHeader className="p-5 border-b border-border/40">
            <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              {WIZARD_STEPS[activeStep - 1]}
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {activeStep === 1 && 'Configure transporter info, validity dates and parameters'}
              {activeStep === 2 && 'Configure vehicles, categories, capacities and categories'}
              {activeStep === 3 && 'Define routes, distances, sightseeing destinations, and coordinates'}
              {activeStep === 4 && 'Configure pricing rates, driver costs, and allowances'}
              {activeStep === 5 && 'Verify and finalize the contract'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs font-semibold">
            
            {/* STEP 1: SUPPLIER INFO */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Cab Supplier Name *</Label>
                    <Input value={supplierForm.supplier_name} onChange={e => setSupplierForm({...supplierForm, supplier_name: e.target.value})} placeholder="e.g. Shiva Travels" required />
                  </div>
                  <div className="space-y-1">
                    <Label>Supplier Code</Label>
                    <Input value={supplierForm.supplier_code} onChange={e => setSupplierForm({...supplierForm, supplier_code: e.target.value})} placeholder="e.g. SHV-DEL" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>Contact Person</Label>
                    <Input value={supplierForm.contact_person} onChange={e => setSupplierForm({...supplierForm, contact_person: e.target.value})} placeholder="e.g. Ramesh Kumar" />
                  </div>
                  <div className="space-y-1">
                    <Label>Mobile Number</Label>
                    <Input value={supplierForm.mobile} onChange={e => setSupplierForm({...supplierForm, mobile: e.target.value})} placeholder="e.g. +91 9876543210" />
                  </div>
                  <div className="space-y-1">
                    <Label>Email Address</Label>
                    <Input type="email" value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} placeholder="e.g. bookings@shiva.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>GST Number</Label>
                    <Input value={supplierForm.gst_number} onChange={e => setSupplierForm({...supplierForm, gst_number: e.target.value})} placeholder="e.g. 07AAAAA1111A1Z1" />
                  </div>
                  <div className="space-y-1">
                    <Label>PAN Number</Label>
                    <Input value={supplierForm.pan_number} onChange={e => setSupplierForm({...supplierForm, pan_number: e.target.value})} placeholder="e.g. ABCDE1234F" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>Payment Terms</Label>
                    <Input value={supplierForm.payment_terms} onChange={e => setSupplierForm({...supplierForm, payment_terms: e.target.value})} placeholder="e.g. 15 Days Credit" />
                  </div>
                  <div className="space-y-1">
                    <Label>Commission (%)</Label>
                    <Input type="number" value={supplierForm.commission_percentage || ''} onChange={e => setSupplierForm({...supplierForm, commission_percentage: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Select value={String(supplierForm.active_status)} onValueChange={val => setSupplierForm({...supplierForm, active_status: val === 'true'})}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active Transporter</SelectItem>
                        <SelectItem value="false">Inactive Transporter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-1">
                    <Label>Contract Validity Start *</Label>
                    <Input type="date" value={supplierForm.valid_from} onChange={e => setSupplierForm({...supplierForm, valid_from: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Contract Validity End *</Label>
                    <Input type="date" value={supplierForm.valid_to} onChange={e => setSupplierForm({...supplierForm, valid_to: e.target.value})} required />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: VEHICLE MASTER */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Configure fleet categories</span>
                  <Button type="button" size="sm" onClick={handleAddVehicle} className="h-8 text-xs bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Fleet Category
                  </Button>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {vehicles.map((veh, idx) => (
                    <div key={veh.id} className="border border-border/50 rounded-xl p-4 bg-muted/10 space-y-3 relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 w-6 h-6 text-rose-500 hover:bg-rose-500/10 rounded-md" onClick={() => handleRemoveVehicle(veh.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-200 px-2 py-0.5 rounded-md font-mono">Fleet Category #{idx + 1}</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label>Vehicle Type</Label>
                          <Select value={veh.vehicle_type} onValueChange={val => handleUpdateVehicle(veh.id, 'vehicle_type', val)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                            <SelectContent>
                              {Array.from(new Set([...VEHICLE_TYPES, veh.vehicle_type].filter(Boolean))).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Vehicle Category</Label>
                          <Select value={veh.vehicle_category} onValueChange={val => handleUpdateVehicle(veh.id, 'vehicle_category', val)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select vehicle category" /></SelectTrigger>
                            <SelectContent>
                              {Array.from(new Set([...VEHICLE_CATEGORIES, veh.vehicle_category].filter(Boolean))).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Adult Capacity</Label>
                          <Input type="number" className="h-8 text-xs" value={veh.capacity_adults} onChange={e => handleUpdateVehicle(veh.id, 'capacity_adults', parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Child Capacity</Label>
                          <Input type="number" className="h-8 text-xs" value={veh.capacity_children} onChange={e => handleUpdateVehicle(veh.id, 'capacity_children', parseInt(e.target.value) || 0)} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Luggage Capacity</Label>
                          <Input className="h-8 text-xs" value={veh.luggage_capacity} onChange={e => handleUpdateVehicle(veh.id, 'luggage_capacity', e.target.value)} placeholder="e.g. 2 Large Bags, 1 Small Bag" />
                        </div>
                        <div className="space-y-1">
                          <Label>Availability Status</Label>
                          <Select value={veh.availability_status} onValueChange={val => handleUpdateVehicle(veh.id, 'availability_status', val)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select availability" /></SelectTrigger>
                            <SelectContent>
                              {Array.from(new Set([...AVAILABILITY_STATUSES, veh.availability_status].filter(Boolean))).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: ROUTE CONFIG */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Configure contracted routes</span>
                  <Button type="button" size="sm" onClick={handleAddRoute} className="h-8 text-xs bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Route
                  </Button>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {routes.map((rt, idx) => (
                    <div key={rt.id} className="border border-border/50 rounded-xl p-4 bg-muted/10 space-y-3 relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 w-6 h-6 text-rose-500 hover:bg-rose-500/10 rounded-md" onClick={() => handleRemoveRoute(rt.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-200 px-2 py-0.5 rounded-md font-mono">Route #{idx + 1}</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label>Source Station *</Label>
                          <Input className="h-8 text-xs" value={rt.source} onChange={e => handleUpdateRoute(rt.id, 'source', e.target.value)} placeholder="e.g. Delhi Airport (DEL)" required />
                        </div>
                        <div className="space-y-1">
                          <Label>Destination Station *</Label>
                          <Input className="h-8 text-xs" value={rt.destination} onChange={e => handleUpdateRoute(rt.id, 'destination', e.target.value)} placeholder="e.g. Rishikesh" required />
                        </div>
                        <div className="space-y-1">
                          <Label>Route Type</Label>
                          <Select value={rt.route_type} onValueChange={val => handleUpdateRoute(rt.id, 'route_type', val)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select route type" /></SelectTrigger>
                            <SelectContent>
                              {Array.from(new Set([...ROUTE_TYPES, rt.route_type].filter(Boolean))).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label>State</Label>
                          <Input className="h-8 text-xs" value={rt.state} onChange={e => handleUpdateRoute(rt.id, 'state', e.target.value)} placeholder="e.g. Uttarakhand" />
                        </div>
                        <div className="space-y-1">
                          <Label>Country</Label>
                          <Input className="h-8 text-xs" value={rt.country} onChange={e => handleUpdateRoute(rt.id, 'country', e.target.value)} placeholder="e.g. India" />
                        </div>
                        <div className="space-y-1">
                          <Label>Distance (KM)</Label>
                          <Input type="number" className="h-8 text-xs" value={rt.distance_km || ''} onChange={e => handleUpdateRoute(rt.id, 'distance_km', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="space-y-1">
                          <Label>Travel Time</Label>
                          <Input className="h-8 text-xs" value={rt.travel_time} onChange={e => handleUpdateRoute(rt.id, 'travel_time', e.target.value)} placeholder="e.g. 5 hours" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: RATE SLABS GRID */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Configure contracted rates grid</span>
                
                <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#161d2f]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#0f1420] text-amber-400 font-extrabold uppercase text-[10px] sticky top-0 z-10 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Vehicle</th>
                        <th className="p-2.5">Route</th>
                        <th className="p-2.5">Season</th>
                        <th className="p-2.5 min-w-[170px]">Model</th>
                        <th className="p-2.5 min-w-[200px] text-center text-emerald-400">Rate ★</th>
                        <th className="p-2.5 min-w-[120px] text-center">Tax Config</th>
                        <th className="p-2.5 w-20">Markup (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-[#161d2f] text-slate-100">
                      {vehicles.map(veh => {
                        const vehDefaults = getDefaultRateForVehicle(veh.vehicle_type);
                        return routes.map(route => {
                          return SEASONS.map(season => {
                            const rateKey = `${veh.id}-${route.id}-${season}`;
                            const defaultModel = getDefaultRateModelForRoute(route.route_type);
                            const rate = gridRates[rateKey] || {
                              rate_model: defaultModel,
                              base_km_included: 80,
                              rate_per_km: vehDefaults.rate_per_km,
                              min_km_per_day: vehDefaults.min_km_per_day,
                              driver_allowance: vehDefaults.driver_allowance,
                              night_charges: 0,
                              daily_rate: 0, night_allowance: 0, max_km_included: 0, extra_km_charge: 0,
                              airport_name: '', hotel_area: '', transfer_cost: 0, meet_greet_charges: 0, waiting_charges: 0,
                              sightseeing_destination: '', hours_included: 8, km_included: 80, vehicle_cost: 0, extra_hour_cost: 0, extra_km_cost: 0,
                              toll_charges: 0, parking_charges: 0, state_tax: 0, permit_charges: 0,
                              gst_included: false, gst_percentage: 5, markup_percentage: 0,
                              // Block Circuit fields (Kerala / Char Dham Full Circuit)
                              block_circuit_km: 0,        // Total KM of the full circuit e.g. 600, 730, 930
                              block_circuit_nights: '',   // Duration label e.g. "3N/4D", "5N/6D"
                              block_circuit_cost: 0,      // Fixed total block price for this vehicle on this circuit
                              block_extra_km_rate: 0      // Charge per KM if actual KM exceeds block_circuit_km
                            };

                            const currentModel = normalizeRateModel(rate.rate_model, route.route_type);
                            const isInclusive = rate.gst_included;
                            const CAB_GST = 5; // GST for cab/transport services is fixed at 5% in India

                            return (
                              <React.Fragment key={rateKey}>
                                <tr className="hover:bg-slate-800/60 transition-colors">
                                  <td className="p-2.5 font-bold text-xs text-white max-w-[120px] truncate">{veh.vehicle_type}</td>
                                  <td className="p-2.5 font-extrabold text-xs text-amber-300 max-w-[140px] truncate">{route.source} → {route.destination}</td>
                                  <td className="p-2.5 text-[11px] text-slate-400 font-semibold">{season}</td>
                                  <td className="p-1.5">
                                    <Select value={currentModel} onValueChange={val => handleUpdateRateField(rateKey, 'rate_model', val)}>
                                      <SelectTrigger className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-100 font-bold"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {RATE_MODEL_OPTIONS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  {/* Dynamic Rate Column — changes based on selected model */}
                                  <td className="p-1.5">
                                    {currentModel === 'Per KM' && (
                                      <div className="flex gap-1 items-center">
                                        <div className="space-y-0.5">
                                          <div className="text-[9px] text-slate-500 font-bold text-center">₹/KM</div>
                                          <Input
                                            type="number"
                                            placeholder="e.g. 14"
                                            className="bg-slate-900 border-emerald-700/60 h-8 text-xs text-center text-emerald-300 font-extrabold w-[70px]"
                                            value={rate.rate_per_km || ''}
                                            onChange={e => handleUpdateRateField(rateKey, 'rate_per_km', parseFloat(e.target.value) || 0)}
                                          />
                                        </div>
                                        <div className="space-y-0.5">
                                          <div className="text-[9px] text-slate-500 font-bold text-center">Min KM/Day</div>
                                          <Input
                                            type="number"
                                            placeholder="300"
                                            className="bg-slate-900 border-slate-700 h-8 text-xs text-center text-slate-100 font-bold w-[70px]"
                                            value={rate.min_km_per_day || ''}
                                            onChange={e => handleUpdateRateField(rateKey, 'min_km_per_day', parseFloat(e.target.value) || 0)}
                                          />
                                        </div>
                                      </div>
                                    )}
                                    {currentModel === 'Per Day' && (
                                      <div className="space-y-0.5">
                                        <div className="text-[9px] text-slate-500 font-bold text-center">Rate/Day (₹)</div>
                                        <Input
                                          type="number"
                                          placeholder="e.g. 3200"
                                          className="bg-slate-900 border-emerald-700/60 h-8 text-xs text-center text-emerald-300 font-extrabold w-[110px]"
                                          value={rate.daily_rate || ''}
                                          onChange={e => handleUpdateRateField(rateKey, 'daily_rate', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
                                    )}
                                    {currentModel === 'Block Circuit' && (
                                      <div className="flex gap-1 items-center">
                                        <div className="space-y-0.5">
                                          <div className="text-[9px] text-slate-500 font-bold text-center">Block Cost (₹)</div>
                                          <Input
                                            type="number"
                                            placeholder="e.g. 16000"
                                            className="bg-slate-900 border-amber-700/60 h-8 text-xs text-center text-amber-300 font-extrabold w-[90px]"
                                            value={rate.block_circuit_cost || ''}
                                            onChange={e => handleUpdateRateField(rateKey, 'block_circuit_cost', parseFloat(e.target.value) || 0)}
                                          />
                                        </div>
                                        <div className="space-y-0.5">
                                          <div className="text-[9px] text-slate-500 font-bold text-center">Duration</div>
                                          <Select
                                            value={rate.block_circuit_nights || ''}
                                            onValueChange={val => handleUpdateRateField(rateKey, 'block_circuit_nights', val)}
                                          >
                                            <SelectTrigger className="h-8 text-[10px] bg-slate-900 border-slate-700 text-slate-100 font-bold w-[80px]">
                                              <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {BLOCK_CIRCUIT_DURATIONS.map(d => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    )}
                                    {currentModel === 'Per Transfer' && (
                                      <div className="space-y-0.5">
                                        <div className="text-[9px] text-slate-500 font-bold text-center">Transfer Cost (₹)</div>
                                        <Input
                                          type="number"
                                          placeholder="e.g. 1200"
                                          className="bg-slate-900 border-emerald-700/60 h-8 text-xs text-center text-emerald-300 font-extrabold w-[110px]"
                                          value={rate.transfer_cost || ''}
                                          onChange={e => handleUpdateRateField(rateKey, 'transfer_cost', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
                                    )}
                                    {!['Per KM','Per Day','Block Circuit','Per Transfer'].includes(currentModel) && (
                                      <div className="space-y-0.5">
                                        <div className="text-[9px] text-slate-500 font-bold text-center">Base Rate (₹)</div>
                                        <Input
                                          type="number"
                                          placeholder="0"
                                          className="bg-slate-900 border-slate-700 h-8 text-xs text-center text-slate-100 font-bold w-[110px]"
                                          value={rate.vehicle_cost || ''}
                                          onChange={e => handleUpdateRateField(rateKey, 'vehicle_cost', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <Select
                                      value={isInclusive ? 'inclusive' : 'exclusive'}
                                      onValueChange={(val) => {
                                        handleUpdateRateField(rateKey, 'gst_included', val === 'inclusive');
                                        handleUpdateRateField(rateKey, 'gst_percentage', CAB_GST);
                                      }}
                                    >
                                      <SelectTrigger className={`h-8 text-[10px] font-extrabold w-full border ${
                                        isInclusive
                                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                          : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                                      }`}>
                                        <SelectValue>
                                          {isInclusive ? `GST Included (${CAB_GST}%)` : `GST Extra (${CAB_GST}%)`}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-900 border border-slate-700 text-slate-100 text-xs">
                                        <SelectItem value="exclusive">GST Extra ({CAB_GST}%)</SelectItem>
                                        <SelectItem value="inclusive">GST Included ({CAB_GST}%)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-1.5">
                                    <Input type="number" className="bg-slate-900 border-slate-700 h-8 text-xs text-center text-amber-300 font-extrabold" value={rate.markup_percentage} onChange={e => handleUpdateRateField(rateKey, 'markup_percentage', parseFloat(e.target.value) || 0)} placeholder="%" />
                                  </td>
                                </tr>

                                {activeRateKey === rateKey && (
                                  <tr className="bg-[#0f1420]">
                                    <td colSpan={6} className="p-4 border-y border-amber-500/30">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch text-xs p-5 bg-[#161d2f] border border-slate-700/80 rounded-xl shadow-xl w-full">
                                        
                                        {/* Rate Model Inputs */}
                                        <div className="space-y-3 border-r border-slate-700/60 pr-5">
                                          <Label className="text-[11px] text-amber-400 font-extrabold uppercase tracking-wider block">Model-Specific Pricing</Label>
                                          
                                          {currentModel === 'Per KM' && (
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Rate Per KM</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.rate_per_km} onChange={e => handleUpdateRateField(rateKey, 'rate_per_km', parseFloat(e.target.value) || 0)} />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Min KM/Day</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.min_km_per_day} onChange={e => handleUpdateRateField(rateKey, 'min_km_per_day', parseFloat(e.target.value) || 0)} />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Driver Allow.</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.driver_allowance} onChange={e => handleUpdateRateField(rateKey, 'driver_allowance', parseFloat(e.target.value) || 0)} />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Night Allowance</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.night_charges} onChange={e => handleUpdateRateField(rateKey, 'night_charges', parseFloat(e.target.value) || 0)} />
                                              </div>
                                            </div>
                                          )}

                                          {currentModel === 'Per Day' && (
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Daily Rate</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.daily_rate} onChange={e => handleUpdateRateField(rateKey, 'daily_rate', parseFloat(e.target.value) || 0)} />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Driver Allow.</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.night_allowance} onChange={e => handleUpdateRateField(rateKey, 'night_allowance', parseFloat(e.target.value) || 0)} />
                                              </div>
                                            </div>
                                          )}

                                          {currentModel === 'Per Transfer' && (
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Transfer Cost</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.transfer_cost} onChange={e => handleUpdateRateField(rateKey, 'transfer_cost', parseFloat(e.target.value) || 0)} />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Meet & Greet</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.meet_greet_charges} onChange={e => handleUpdateRateField(rateKey, 'meet_greet_charges', parseFloat(e.target.value) || 0)} />
                                              </div>
                                            </div>
                                          )}

                                          {currentModel === 'Package Basis' && (
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Package Cost</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.vehicle_cost} onChange={e => handleUpdateRateField(rateKey, 'vehicle_cost', parseFloat(e.target.value) || 0)} />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Extra Hr Cost</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.extra_hour_cost} onChange={e => handleUpdateRateField(rateKey, 'extra_hour_cost', parseFloat(e.target.value) || 0)} />
                                              </div>
                                            </div>
                                          )}

                                          {currentModel === 'Block Circuit' && (
                                            <div className="space-y-3">
                                              <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">🗺️ Block Circuit Pricing</span>
                                                <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold">Kerala / Char Dham Full</span>
                                              </div>
                                              <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                  <Label className="text-slate-300 font-bold text-[11px]">Circuit Total KM</Label>
                                                  <Input
                                                    type="number"
                                                    placeholder="e.g. 600, 730, 930"
                                                    className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs"
                                                    value={rate.block_circuit_km || ''}
                                                    onChange={e => handleUpdateRateField(rateKey, 'block_circuit_km', parseFloat(e.target.value) || 0)}
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-slate-300 font-bold text-[11px]">Package Duration</Label>
                                                  <Select
                                                    value={rate.block_circuit_nights || ''}
                                                    onValueChange={val => handleUpdateRateField(rateKey, 'block_circuit_nights', val)}
                                                  >
                                                    <SelectTrigger className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-100 font-bold">
                                                      <SelectValue placeholder="Select duration" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {BLOCK_CIRCUIT_DURATIONS.map(d => (
                                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-slate-300 font-bold text-[11px]">Total Block Cost (₹)</Label>
                                                  <Input
                                                    type="number"
                                                    placeholder="e.g. 16000"
                                                    className="bg-slate-900 border-amber-700/50 text-amber-300 font-extrabold h-8 text-xs"
                                                    value={rate.block_circuit_cost || ''}
                                                    onChange={e => handleUpdateRateField(rateKey, 'block_circuit_cost', parseFloat(e.target.value) || 0)}
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <Label className="text-slate-300 font-bold text-[11px]">Extra KM Rate (₹/KM)</Label>
                                                  <Input
                                                    type="number"
                                                    placeholder="if circuit exceeded"
                                                    className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs"
                                                    value={rate.block_extra_km_rate || ''}
                                                    onChange={e => handleUpdateRateField(rateKey, 'block_extra_km_rate', parseFloat(e.target.value) || 0)}
                                                  />
                                                </div>
                                              </div>
                                              {rate.block_circuit_cost > 0 && (
                                                <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] text-amber-300 font-semibold">
                                                  ✅ Block Rate: <span className="font-extrabold">₹{rate.block_circuit_cost.toLocaleString('en-IN')}</span> fixed total for {rate.block_circuit_nights || '?'} circuit ({rate.block_circuit_km || '?'} KM)
                                                  {rate.block_extra_km_rate > 0 && <span> + ₹{rate.block_extra_km_rate}/KM extra if exceeded</span>}
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {currentModel === 'One-Way Drop' && (
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">One-Way Cost</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.transfer_cost || rate.vehicle_cost} onChange={e => {
                                                  const val = parseFloat(e.target.value) || 0;
                                                  handleUpdateRateField(rateKey, 'transfer_cost', val);
                                                  handleUpdateRateField(rateKey, 'vehicle_cost', val);
                                                }} />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Dead KM Factor</Label>
                                                <Input type="number" step="0.1" placeholder="1.5" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.extra_km_charge || 1.5} onChange={e => handleUpdateRateField(rateKey, 'extra_km_charge', parseFloat(e.target.value) || 1.5)} />
                                              </div>
                                            </div>
                                          )}

                                          {rate.rate_model === 'Hill Station Surcharge' && (
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Base Rate</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.vehicle_cost || rate.daily_rate} onChange={e => handleUpdateRateField(rateKey, 'vehicle_cost', parseFloat(e.target.value) || 0)} />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Hill Surcharge</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.permit_charges} onChange={e => handleUpdateRateField(rateKey, 'permit_charges', parseFloat(e.target.value) || 0)} />
                                              </div>
                                            </div>
                                          )}

                                          {rate.rate_model === 'Interstate Permit' && (
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">Base Rate</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.vehicle_cost || rate.daily_rate} onChange={e => handleUpdateRateField(rateKey, 'vehicle_cost', parseFloat(e.target.value) || 0)} />
                                              </div>
                                              <div className="space-y-1">
                                                <Label className="text-slate-300 font-bold text-[11px]">State Permit Cost</Label>
                                                <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.state_tax} onChange={e => handleUpdateRateField(rateKey, 'state_tax', parseFloat(e.target.value) || 0)} />
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Surcharges & Allowances */}
                                        <div className="space-y-3 border-r border-slate-700/60 pr-5">
                                          <Label className="text-[11px] text-amber-400 font-extrabold uppercase tracking-wider block">Allowances & Surcharges</Label>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                              <Label className="text-slate-300 font-bold text-[11px]">Toll Cost</Label>
                                              <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.toll_charges} onChange={e => handleUpdateRateField(rateKey, 'toll_charges', parseFloat(e.target.value) || 0)} />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-slate-300 font-bold text-[11px]">Parking Cost</Label>
                                              <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.parking_charges} onChange={e => handleUpdateRateField(rateKey, 'parking_charges', parseFloat(e.target.value) || 0)} />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-slate-300 font-bold text-[11px]">State Tax</Label>
                                              <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.state_tax} onChange={e => handleUpdateRateField(rateKey, 'state_tax', parseFloat(e.target.value) || 0)} />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-slate-300 font-bold text-[11px]">Permit Cost</Label>
                                              <Input type="number" className="bg-slate-900 border-slate-700 text-slate-100 font-bold h-8 text-xs" value={rate.permit_charges} onChange={e => handleUpdateRateField(rateKey, 'permit_charges', parseFloat(e.target.value) || 0)} />
                                            </div>
                                          </div>
                                        </div>

                                        {/* GST Engine Toggles */}
                                        <div className="space-y-3">
                                          <Label className="text-[11px] text-amber-400 font-extrabold uppercase tracking-wider block">GST Engine</Label>
                                          <div className="flex flex-col gap-2.5 pt-1">
                                            <button 
                                              type="button"
                                              onClick={() => handleUpdateRateField(rateKey, 'gst_included', false)}
                                              className={`px-3 py-2 text-xs font-bold border rounded-lg transition-all flex items-center justify-between ${!isInclusive ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-extrabold shadow-md' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                                            >
                                              <span>GST Extra</span>
                                              {!isInclusive && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                                            </button>
                                            <button 
                                              type="button"
                                              onClick={() => handleUpdateRateField(rateKey, 'gst_included', true)}
                                              className={`px-3 py-2 text-xs font-bold border rounded-lg transition-all flex items-center justify-between ${isInclusive ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-extrabold shadow-md' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                                            >
                                              <span>GST Included</span>
                                              {isInclusive && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          });
                        });
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & PUBLISH */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="bg-[#0f1420] border border-slate-800 rounded-xl p-5 space-y-3 shadow-md">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Supplier Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-300 font-semibold pt-1">
                    <div>Supplier: <span className="font-extrabold text-white">{supplierForm.supplier_name || '---'}</span></div>
                    <div>Supplier Code: <span className="font-mono font-extrabold text-amber-300">{supplierForm.supplier_code || 'Auto-generated'}</span></div>
                    <div>Validity Period: <span className="font-mono font-extrabold text-white">{supplierForm.valid_from} to {supplierForm.valid_to}</span></div>
                    <div>Status: <span className={`font-extrabold ${supplierForm.active_status ? 'text-emerald-400' : 'text-rose-400'}`}>{supplierForm.active_status ? 'Active' : 'Inactive'}</span></div>
                  </div>
                </div>

                <div className="bg-[#0f1420] border border-slate-800 rounded-xl p-5 space-y-3 shadow-md">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Car className="w-4 h-4 text-amber-400" /> Fleet Category Configuration
                  </h4>
                  <div className="text-xs text-slate-200 font-bold space-y-2 pt-1">
                    {vehicles.map((veh) => (
                      <div key={veh.id} className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <span className="text-white font-extrabold">{veh.vehicle_type}</span>
                        <span className="text-amber-300 font-bold">({veh.vehicle_category})</span>
                        <span className="text-slate-400 font-mono text-[11px]">— Capacity: {veh.capacity_adults} Adults, {veh.capacity_children} Children</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0f1420] border border-slate-800 rounded-xl p-5 space-y-3 shadow-md">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <MapPin className="w-4 h-4 text-amber-400" /> Route Configuration
                  </h4>
                  <div className="text-xs text-slate-200 font-bold space-y-2 pt-1">
                    {routes.map((rt) => (
                      <div key={rt.id} className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-white font-extrabold">{rt.source} → {rt.destination}</span>
                        <span className="text-amber-300 font-bold">({rt.route_type})</span>
                        <span className="text-slate-400 font-mono text-[11px]">— {rt.distance_km} KM</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Wizard Footer Action Buttons */}
        <div className="flex justify-between items-center">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (activeStep > 1) setActiveStep(prev => prev - 1);
              else handleCancel();
            }}
            className="h-9 font-bold flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>

          {activeStep < 5 ? (
            <Button 
              type="button" 
              onClick={handleNextStep}
              className="h-9 bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90 flex items-center gap-1"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handlePublish}
              disabled={loading}
              className="h-9 bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {dialogMode === 'edit' ? 'Update Contract' : 'Publish Contract'}
            </Button>
          )}
        </div>

      </div>

      {/* Sticky Right-side Costing breakdown / Pricing card panel */}
      <div className="w-full lg:w-80 shrink-0 space-y-4">
        <div className="sticky top-4">
          <Card className="bg-slate-950 text-white border-slate-900 shadow-xl overflow-hidden rounded-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
            
            <CardHeader className="p-5 border-b border-slate-900 bg-slate-950/50">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Cost Breakdown Panel
              </CardTitle>
              <CardDescription className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                Real Time pricing Analysis & Calculator
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs font-semibold">
              
              {(() => {
                // Determine active rate selected in grid
                const activeRate = activeRateKey ? gridRates[activeRateKey] : null;
                
                if (!activeRate) {
                  return (
                    <div className="text-center py-6 text-slate-500 font-medium">
                      Select any rate row in the grid and click the "Inc/Excl" button to activate breakdown analysis.
                    </div>
                  );
                }

                const baseCost = Number(activeRate.base_cost) || 0;
                const gstPercent = Number(activeRate.gst_percentage) || 5;
                const gstAmt = Number(activeRate.gst_amount) || 0;
                const supplierCost = Number(activeRate.supplier_cost) || 0;
                const markupPercent = Number(activeRate.markup_percentage) || 0;
                const markupAmt = Number(activeRate.markup_amount) || 0;
                const sellingCost = Number(activeRate.selling_cost) || 0;
                const profit = Number(activeRate.profit_margin) || 0;

                return (
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[9px] text-slate-400 font-mono block">Model: {activeRate.rate_model}</span>
                      <span className="text-[10px] text-slate-200 font-extrabold block uppercase tracking-wide">Season: {activeRateKey?.split('-')[2]}</span>
                    </div>

                    <div className="space-y-2 border-b border-slate-900 pb-3">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Base Cost</span>
                        <span className="font-semibold text-slate-200">₹{Math.round(baseCost - (activeRate.toll_charges || 0) - (activeRate.parking_charges || 0) - (activeRate.state_tax || 0) - (activeRate.permit_charges || 0)).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Toll & Parking Charges</span>
                        <span className="font-semibold text-slate-200">₹{Math.round(Number(activeRate.toll_charges || 0) + Number(activeRate.parking_charges || 0)).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>State Tax & Permit</span>
                        <span className="font-semibold text-slate-200">₹{Math.round(Number(activeRate.state_tax || 0) + Number(activeRate.permit_charges || 0)).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>GST ({gstPercent}%)</span>
                        <span className="font-semibold text-slate-200">₹{Math.round(gstAmt).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-200 font-extrabold border-t border-slate-900 pt-2 mt-1">
                        <span>Final Supplier Cost</span>
                        <span className="text-emerald-400 text-sm">₹{Math.round(supplierCost).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-b border-slate-900 pb-3">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Markup ({markupPercent}%)</span>
                        <span className="font-semibold text-accent">+₹{Math.round(markupAmt).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-200 font-extrabold text-sm border-t border-slate-900 pt-2 mt-1">
                        <span>Selling Price</span>
                        <span className="text-accent">₹{Math.round(sellingCost).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Profit Margin</span>
                      <span className="text-emerald-400 font-extrabold text-sm">₹{Math.round(profit).toLocaleString('en-IN')} ({(supplierCost > 0 ? (profit / supplierCost) * 100 : 0).toFixed(1)}%)</span>
                    </div>

                    {activeRate.is_tax_overridden && (
                      <div className="text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-rose-500 align-middle" /> 
                        Tax is overridden: {activeRate.tax_override_reason || 'No reason specified'}
                      </div>
                    )}
                  </div>
                );
              })()}
              
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};
