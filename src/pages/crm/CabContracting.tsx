import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Car, Plus, Search, Edit, Power, Download, Upload, UploadCloud,
  Info, HelpCircle, FileText, CheckCircle2, AlertTriangle, Loader2,
  MapPin, Users, Phone, Mail, Globe, Sparkles, DollarSign,
  ArrowRight, Landmark, Calendar, Trash2, Layers, RefreshCw, Clock, ArrowLeft, Save
} from 'lucide-react';
import { CabContractWizard } from './CabContractWizard';
import { resolveGeography } from '@/data/geographyMaster';
import { crmFetch } from '@/utils/crmApi';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

interface Supplier {
  id: string;
  supplier_name: string;
  supplier_code: string;
  contact_person: string;
  mobile: string;
  email: string;
  gst_number: string;
  pan_number: string;
  payment_terms: string;
  commission_percentage: number;
  valid_from: string;
  valid_to: string;
  active_status: boolean;
}

interface Vehicle {
  id: string;
  vehicle_type: string;
  vehicle_category: string;
  capacity_adults: number;
  capacity_children: number;
  luggage_capacity: string;
  availability_status: string;
  active_status: boolean;
}

interface Route {
  id: string;
  source: string;
  destination: string;
  state: string;
  country: string;
  route_type: string;
  distance_km: number;
  travel_time: string;
  maps_link: string;
  active_status: boolean;
}

interface Contract {
  id: string;
  supplier_id: string;
  contract_name: string;
  valid_from: string;
  valid_to: string;
  active_status: boolean;
  cab_suppliers?: { supplier_name: string };
}

interface ContractRate {
  id: string;
  contract_id: string;
  vehicle_id: string;
  route_id: string | null;
  season: string;
  rate_model: string;
  base_cost: number;
  gst_included: boolean;
  gst_percentage: number;
  gst_amount: number;
  supplier_cost: number;
  selling_cost: number;
  markup_percentage: number;
  markup_amount: number;
  profit_margin: number;
  active_status: boolean;
  cab_vehicles?: { vehicle_type: string };
  cab_routes?: { source: string; destination: string };
}

export default function CabContracting() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // State Lists
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractRates, setContractRates] = useState<ContractRate[]>([]);
  const [contractHistoryLogs, setContractHistoryLogs] = useState<any[]>([]);

  // Selected State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedContractId, setSelectedContractId] = useState<string>('');

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Forms State
  const [supplierForm, setSupplierForm] = useState({
    supplier_name: '', supplier_code: '', contact_person: '', mobile: '', email: '',
    gst_number: '', pan_number: '', payment_terms: '', commission_percentage: 0,
    valid_from: '', valid_to: '', active_status: true
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicle_type: 'Sedan', vehicle_category: 'Standard', capacity_adults: 4,
    capacity_children: 2, luggage_capacity: '2 Bags', availability_status: 'Available', active_status: true
  });

  const [routeForm, setRouteForm] = useState({
    source: '', destination: '', state: '', country: 'India', route_type: 'Point to Point',
    distance_km: 0, travel_time: '', maps_link: '', active_status: true
  });

  const [contractForm, setContractForm] = useState({
    supplier_id: '', contract_name: '', valid_from: '', valid_to: '', active_status: true
  });

  const [rateForm, setRateForm] = useState({
    vehicle_id: '', route_id: '', season: 'Normal Season', rate_model: 'Per KM',
    base_km_included: 80, rate_per_km: 12, min_km_per_day: 250, driver_allowance: 300, night_charges: 0,
    daily_rate: 0, night_allowance: 0, max_km_included: 0, extra_km_charge: 0,
    airport_name: '', hotel_area: '', transfer_cost: 0, meet_greet_charges: 0, waiting_charges: 0,
    sightseeing_destination: '', hours_included: 8, km_included: 80, vehicle_cost: 0, extra_hour_cost: 0, extra_km_cost: 0,
    toll_charges: 0, parking_charges: 0, state_tax: 0, permit_charges: 0,
    gst_included: false, gst_percentage: 5, markup_percentage: 0, active_status: true
  });

  // URL-derived tabs
  let activeMainTab: 'suppliers' | 'vehicles' | 'routes' | 'contracts' | 'bulk' = 'suppliers';
  let isFormPage = false;
  let dialogType: 'cab_contract' | 'supplier' | 'vehicle' | 'route' | 'contract' | 'rate' | null = null;
  let dialogMode: 'add' | 'edit' | null = null;
  let selectedItemId: string | null = null;

  const pathSegments = location.pathname.split('/');
  // Expected path: /crm/cabs/:tab
  const tabSegment = pathSegments[3];
  if (tabSegment === 'vehicles') activeMainTab = 'vehicles';
  else if (tabSegment === 'routes') activeMainTab = 'routes';
  else if (tabSegment === 'contracts') activeMainTab = 'contracts';
  else if (tabSegment === 'bulk') activeMainTab = 'bulk';

  // Sub route check
  let rawType = '';
  if (pathSegments.includes('new')) {
    isFormPage = true;
    dialogMode = 'add';
    rawType = pathSegments.includes('wizard') ? 'cab_contract' : (pathSegments[pathSegments.length - 2] || '');
  } else if (pathSegments.includes('edit')) {
    isFormPage = true;
    dialogMode = 'edit';
    selectedItemId = pathSegments[pathSegments.length - 1];
    rawType = pathSegments.includes('wizard') ? 'cab_contract' : (pathSegments[pathSegments.length - 3] || '');
  }

  if (rawType === 'cab_contract') dialogType = 'cab_contract';
  else if (rawType.includes('supplier')) dialogType = 'supplier';
  else if (rawType.includes('vehicle')) dialogType = 'vehicle';
  else if (rawType.includes('route')) dialogType = 'route';
  else if (rawType.includes('contract')) dialogType = 'contract';
  else dialogType = rawType as any;

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sRes, vRes, rRes, cRes] = await Promise.all([
        crmFetch(`${API_BASE}/api.php?table=cab_suppliers`, {}, { action: 'list_cab_suppliers', module: 'Cabs' }),
        crmFetch(`${API_BASE}/api.php?table=cab_vehicles`, {}, { action: 'list_cab_vehicles', module: 'Cabs' }),
        crmFetch(`${API_BASE}/api.php?table=cab_routes`, {}, { action: 'list_cab_routes', module: 'Cabs' }),
        crmFetch(`${API_BASE}/api.php?table=cab_contracts`, {}, { action: 'list_cab_contracts', module: 'Cabs' })
      ]);
      if (!sRes.ok || !vRes.ok || !rRes.ok || !cRes.ok) throw new Error('Failed to load data');
      
      const suppliersData = await sRes.json();
      const vehiclesData = await vRes.json();
      const routesData = await rRes.json();
      const contractsData = await cRes.json();

      setSuppliers(suppliersData || []);
      if (suppliersData && suppliersData.length > 0) setSelectedSupplierId(suppliersData[0].id);

      setVehicles(vehiclesData || []);
      setRoutes(routesData || []);

      const mappedContracts = contractsData.map((c: any) => ({
        ...c,
        cab_suppliers: {
          supplier_name: suppliersData.find((s: any) => s.id === c.supplier_id || String(s.id).startsWith(String(c.supplier_id)) || String(c.supplier_id).startsWith(String(s.id)))?.supplier_name || '—'
        }
      }));
      setContracts(mappedContracts);
      if (mappedContracts.length > 0) {
        setSelectedContractId(mappedContracts[0].id);
        fetchContractRates(mappedContracts[0].id, vehiclesData || [], routesData || []);
      }
    } catch (err: any) {
      toast({ title: 'Error loading data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedContractId) {
      fetchContractRates(selectedContractId);
      fetchContractHistory(selectedContractId);
    }
  }, [selectedContractId]);

  useEffect(() => {
    if (dialogMode === 'edit' && selectedItemId) {
      if (dialogType === 'supplier' && suppliers.length > 0) {
        const item = suppliers.find((s: any) => String(s.id) === String(selectedItemId));
        if (item) setSupplierForm(item);
      } else if (dialogType === 'vehicle' && vehicles.length > 0) {
        const item = vehicles.find((v: any) => String(v.id) === String(selectedItemId));
        if (item) setVehicleForm(item);
      } else if (dialogType === 'route' && routes.length > 0) {
        const item = routes.find((r: any) => String(r.id) === String(selectedItemId));
        if (item) setRouteForm(item);
      }
    } else if (dialogMode === 'add') {
      if (dialogType === 'supplier') {
        setSupplierForm({
          supplier_name: '', supplier_code: `SUP-${Math.floor(100 + Math.random() * 900)}`, contact_person: '', mobile: '', email: '',
          gst_number: '', pan_number: '', payment_terms: '30 Days Net', commission_percentage: 0,
          valid_from: new Date().toISOString().split('T')[0], valid_to: '2027-12-31', active_status: true
        });
      } else if (dialogType === 'vehicle') {
        setVehicleForm({
          vehicle_type: 'Sedan', vehicle_category: 'Standard', capacity_adults: 4,
          capacity_children: 2, luggage_capacity: '2 Bags', availability_status: 'Available', active_status: true
        });
      } else if (dialogType === 'route') {
        setRouteForm({
          source: '', destination: '', state: '', country: 'India', route_type: 'Point to Point',
          distance_km: 0, travel_time: '', maps_link: '', active_status: true
        });
      }
    }
  }, [dialogMode, dialogType, selectedItemId, suppliers, vehicles, routes]);

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = dialogMode === 'edit' && selectedItemId
        ? `${API_BASE}/api.php?table=cab_suppliers&id=${selectedItemId}`
        : `${API_BASE}/api.php?table=cab_suppliers`;
      const method = dialogMode === 'edit' ? 'PUT' : 'POST';
      const authHeaders = await getAuthHeader();
      const res = await crmFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(supplierForm)
      }, {
        action: dialogMode === 'edit' ? 'update_cab_supplier' : 'create_cab_supplier',
        module: 'Cabs',
        recordId: selectedItemId || undefined,
        itemName: supplierForm.supplier_name
      });
      if (!res.ok) throw new Error('Failed to save supplier');
      toast({ title: `Supplier ${dialogMode === 'edit' ? 'Updated' : 'Added'} Successfully` });
      handleCancel();
    } catch (err: any) {
      toast({ title: 'Error Saving Supplier', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = dialogMode === 'edit' && selectedItemId
        ? `${API_BASE}/api.php?table=cab_vehicles&id=${selectedItemId}`
        : `${API_BASE}/api.php?table=cab_vehicles`;
      const method = dialogMode === 'edit' ? 'PUT' : 'POST';
      const authHeaders = await getAuthHeader();
      const res = await crmFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(vehicleForm)
      }, {
        action: dialogMode === 'edit' ? 'update_cab_vehicle' : 'create_cab_vehicle',
        module: 'Cabs',
        recordId: selectedItemId || undefined,
        itemName: `${vehicleForm.vehicle_type} (${vehicleForm.vehicle_category})`
      });
      if (!res.ok) throw new Error('Failed to save vehicle');
      toast({ title: `Vehicle ${dialogMode === 'edit' ? 'Updated' : 'Added'} Successfully` });
      handleCancel();
    } catch (err: any) {
      toast({ title: 'Error Saving Vehicle', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = dialogMode === 'edit' && selectedItemId
        ? `${API_BASE}/api.php?table=cab_routes&id=${selectedItemId}`
        : `${API_BASE}/api.php?table=cab_routes`;
      const method = dialogMode === 'edit' ? 'PUT' : 'POST';
      const authHeaders = await getAuthHeader();
      const res = await crmFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(routeForm)
      }, {
        action: dialogMode === 'edit' ? 'update_cab_route' : 'create_cab_route',
        module: 'Cabs',
        recordId: selectedItemId || undefined,
        itemName: `${routeForm.source} -> ${routeForm.destination}`
      });
      if (!res.ok) throw new Error('Failed to save route');
      toast({ title: `Route ${dialogMode === 'edit' ? 'Updated' : 'Added'} Successfully` });
      handleCancel();
    } catch (err: any) {
      toast({ title: 'Error Saving Route', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchContractRates = async (contractId: string, currentVehicles?: Vehicle[], currentRoutes?: Route[]) => {
    try {
      const vList = (currentVehicles && currentVehicles.length > 0) ? currentVehicles : vehicles;
      const rList = (currentRoutes && currentRoutes.length > 0) ? currentRoutes : routes;
      const res = await fetch(`${API_BASE}/api.php?table=cab_contract_rates`);
      if (!res.ok) throw new Error('Failed to fetch contract rates');
      const ratesData = await res.json();
      
      const filteredRates = ratesData
        .filter((r: any) => r.contract_id === contractId || String(contractId).startsWith(String(r.contract_id)) || String(r.contract_id).startsWith(String(contractId)))
        .map((r: any) => ({
          ...r,
          cab_vehicles: {
            vehicle_type: vList.find((v: any) => v.id === r.vehicle_id || String(v.id).startsWith(String(r.vehicle_id)) || String(r.vehicle_id).startsWith(String(v.id)))?.vehicle_type || r.vehicle_id || '—'
          },
          cab_routes: r.route_id ? {
            source: rList.find((rt: any) => rt.id === r.route_id || String(rt.id).startsWith(String(r.route_id)) || String(r.route_id).startsWith(String(rt.id)))?.source || '—',
            destination: rList.find((rt: any) => rt.id === r.route_id || String(rt.id).startsWith(String(r.route_id)) || String(r.route_id).startsWith(String(rt.id)))?.destination || '—'
          } : null
         }));
      setContractRates(filteredRates);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContractHistory = async (contractId: string) => {
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

  const handleTabChange = (val: string) => {
    navigate(`/crm/cabs/${val}`);
  };

  const handleOpenAddWizard = () => {
    navigate('/crm/cabs/contracts/new/wizard');
  };

  const handleOpenEditWizard = (contractId: string) => {
    navigate(`/crm/cabs/contracts/edit/wizard/${contractId}`);
  };

  const handleCancel = () => {
    navigate(`/crm/cabs/${activeMainTab}`);
    loadAllData();
  };

  const handleDeleteItem = async (type: 'supplier' | 'vehicle' | 'route' | 'contract', id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete this ${type} "${name}"?`)) return;
    try {
      let endpoint = '';
      if (type === 'supplier') endpoint = `${API_BASE}/api.php?table=cab_suppliers&id=${id}`;
      else if (type === 'vehicle') endpoint = `${API_BASE}/api.php?table=cab_vehicles&id=${id}`;
      else if (type === 'route') endpoint = `${API_BASE}/api.php?table=cab_routes&id=${id}`;
      else if (type === 'contract') endpoint = `${API_BASE}/api.php?table=cab_contracts&id=${id}`;

      const authHeaders = await getAuthHeader();
      const res = await crmFetch(endpoint, {
        method: 'DELETE',
        headers: authHeaders
      }, {
        action: `delete_cab_${type}`,
        module: 'Cabs',
        recordId: id,
        itemName: name
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to delete ${type}`);
      }

      toast({
        title: 'Deleted Successfully',
        description: `The ${type} "${name}" has been deleted.`
      });

      loadAllData();
      if (type === 'contract') {
        setSelectedContractId('');
      }
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="dark text-slate-100 bg-[#070C1E] min-h-screen space-y-6 p-2">
      {isFormPage && dialogType === 'cab_contract' ? (
        <CabContractWizard 
          dialogMode={dialogMode} 
          selectedItemId={selectedItemId} 
          handleCancel={handleCancel} 
        />
      ) : (
        <div className="space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex justify-between items-center border-b pb-2">
            <h1 className="text-xl font-extrabold flex items-center gap-2 uppercase tracking-wider text-slate-800 dark:text-slate-100">
              <Car className="w-5 h-5 text-accent animate-pulse" /> Cab Contract ERP System
            </h1>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => navigate('/crm/cab/bulk-upload')} variant="outline" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-extrabold flex items-center gap-1.5 rounded-xl transition-all h-9 text-xs">
                <UploadCloud className="w-4 h-4" /> Bulk Upload
              </Button>
              <Button size="sm" onClick={handleOpenAddWizard} className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90 flex items-center gap-1.5 rounded-xl shadow-md transition-all h-9 text-xs">
                <Plus className="w-4 h-4" /> Create Cab Contract
              </Button>
            </div>
          </div>

          {/* Sub Tabs Navigation */}
          <div className="bg-slate-900 border border-slate-800 text-slate-200 font-bold p-1 rounded-xl w-full flex flex-wrap h-auto gap-1">
            {['suppliers', 'vehicles', 'routes', 'contracts', 'bulk'].map(tab => (
              <Button 
                key={tab} 
                variant={activeMainTab === tab ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => handleTabChange(tab)}
                className={`capitalize font-bold text-xs px-4 py-2 rounded-lg transition-all ${
                  activeMainTab === tab 
                    ? 'bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-extrabold shadow-md' 
                    : 'text-slate-200 font-bold hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Suppliers Tab */}
          {activeMainTab === 'suppliers' && (
            <Card className="border-border/60 bg-card shadow-md rounded-2xl">
              <CardHeader className="p-4 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/40">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Supplier Transporters Directory</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {suppliers.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 dark:text-slate-400 text-xs font-bold">
                    No suppliers recorded.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {suppliers.map(s => (
                      <Card key={s.id} className="overflow-hidden border-border/60 bg-card hover:border-amber-500/40 hover:shadow-xl transition-all group flex flex-col justify-between rounded-xl">
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1 truncate">
                              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors uppercase tracking-wider truncate" title={s.supplier_name}>
                                {s.supplier_name}
                              </h3>
                              <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-mono font-extrabold uppercase inline-block">
                                {s.supplier_code}
                              </span>
                            </div>
                            <Badge className={s.active_status ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold shrink-0' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold shrink-0'} variant="outline">
                              {s.active_status ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-xs font-semibold pt-3 border-t border-border/30 text-slate-800 dark:text-slate-200">
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>Contact: <strong className="text-slate-950 dark:text-white font-extrabold">{s.contact_person || '---'}</strong></span>
                            </div>
                            <div className="space-y-1 bg-muted/40 p-2.5 rounded-lg border border-border/30">
                              {s.mobile && (
                                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-900 dark:text-slate-100">
                                  <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="font-extrabold">{s.mobile}</span>
                                </div>
                              )}
                              {s.email && (
                                <div className="flex items-center gap-1.5 font-mono text-[10px] truncate text-slate-700 dark:text-slate-300">
                                  <Mail className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="truncate font-bold" title={s.email}>{s.email}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-600 dark:text-slate-400 font-bold">GST No:</span>
                              <span className="text-amber-600 dark:text-amber-400 font-mono font-extrabold">{s.gst_number || '---'}</span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-slate-600 dark:text-slate-400 font-bold">Validity:</span>
                              <span className="text-slate-900 dark:text-slate-100 font-mono text-[11px] font-bold">{s.valid_from} to {s.valid_to}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-border/40 flex justify-end gap-1.5">
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg" onClick={() => navigate(`/crm/cabs/suppliers/edit/${s.id}`)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg" onClick={() => handleDeleteItem('supplier', s.id, s.supplier_name)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vehicles Tab */}
          {activeMainTab === 'vehicles' && (
            <Card className="border-border/60 bg-card shadow-md rounded-2xl">
              <CardHeader className="p-4 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/40">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Vehicle Master & Availability</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {vehicles.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 dark:text-slate-400 text-xs font-bold">
                    No vehicles registered.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {vehicles.map(v => (
                      <Card key={v.id} className="overflow-hidden border-border/60 bg-card hover:border-amber-500/40 hover:shadow-xl transition-all group flex flex-col justify-between rounded-xl">
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white uppercase tracking-wider">{v.vehicle_type}</h3>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">{v.vehicle_category}</Badge>
                            </div>
                            <Badge className={
                              v.availability_status === 'Available' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold' :
                              v.availability_status === 'Booked' ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 font-bold' :
                              v.availability_status === 'Maintenance' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold' :
                              'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold'
                            }>
                              {v.availability_status}
                            </Badge>
                          </div>

                          <div className="space-y-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 pt-3 border-t border-border/30">
                            <div className="flex justify-between py-0.5">
                              <span className="text-slate-600 dark:text-slate-400 font-bold">Adult Capacity:</span>
                              <strong className="text-amber-600 dark:text-amber-400 font-extrabold">{v.capacity_adults} PAX</strong>
                            </div>
                            <div className="flex justify-between py-0.5">
                              <span className="text-slate-600 dark:text-slate-400 font-bold">Child Capacity:</span>
                              <strong className="text-slate-900 dark:text-slate-100 font-bold">{v.capacity_children} PAX</strong>
                            </div>
                            <div className="flex justify-between py-0.5">
                              <span className="text-slate-600 dark:text-slate-400 font-bold">Luggage Capacity:</span>
                              <strong className="text-slate-900 dark:text-slate-100 font-bold">{v.luggage_capacity || '---'}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-border/40 flex justify-end gap-1.5">
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg" onClick={() => navigate(`/crm/cabs/vehicles/edit/${v.id}`)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg" onClick={() => handleDeleteItem('vehicle', v.id, v.vehicle_type)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Routes Tab */}
          {activeMainTab === 'routes' && (
            <Card className="border-border/60 bg-card shadow-md rounded-2xl">
              <CardHeader className="p-4 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/40">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Route & Transfer Stations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {routes.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 dark:text-slate-400 text-xs font-bold">
                    No routes defined.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {routes.map(r => (
                      <Card key={r.id} className="overflow-hidden border-border/60 bg-card hover:border-amber-500/40 hover:shadow-xl transition-all group flex flex-col justify-between rounded-xl">
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1 truncate w-full">
                              <h3 className="font-extrabold text-sm text-slate-950 dark:text-white uppercase tracking-wider truncate flex items-center gap-1.5" title={`${r.source} to ${r.destination}`}>
                                <span className="truncate max-w-[42%] text-slate-950 dark:text-white">{r.source}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="text-amber-600 dark:text-amber-400 truncate max-w-[42%] font-extrabold">{r.destination}</span>
                              </h3>
                              <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-mono font-extrabold uppercase inline-block">
                                {r.route_type}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 pt-3 border-t border-border/30">
                            <div className="flex justify-between py-0.5">
                              <span className="text-slate-600 dark:text-slate-400 font-bold">Distance:</span>
                              <strong className="text-amber-600 dark:text-amber-400 font-mono font-extrabold">{r.distance_km} KM</strong>
                            </div>
                            <div className="flex justify-between py-0.5">
                              <span className="text-slate-600 dark:text-slate-400 font-bold">Est. Travel Time:</span>
                              <strong className="text-slate-900 dark:text-slate-100 font-bold">{r.travel_time || '---'}</strong>
                            </div>
                            <div className="flex justify-between py-0.5">
                              <span className="text-slate-600 dark:text-slate-400 font-bold">State / Region:</span>
                              <strong className="text-slate-900 dark:text-slate-100 font-bold">{r.state || '---'}</strong>
                            </div>
                            <div className="flex justify-between py-0.5">
                              <span className="text-slate-600 dark:text-slate-400 font-bold">Country:</span>
                              <strong className="text-slate-900 dark:text-slate-100 font-bold">{r.country}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-border/40 flex justify-end gap-1.5">
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg" onClick={() => navigate(`/crm/cabs/routes/edit/${r.id}`)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg" onClick={() => handleDeleteItem('route', r.id, `${r.source} to ${r.destination}`)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contracts Tab */}
          {activeMainTab === 'contracts' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Contracts List Sidebar */}
                <Card className="border-border/60 bg-card shadow-md md:col-span-1 rounded-2xl">
                  <CardHeader className="p-4 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/40">
                    <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Active Contracts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1">
                    {contracts.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => setSelectedContractId(c.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex justify-between items-center transition-all ${
                          selectedContractId === c.id 
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-border/50'
                        }`}
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="truncate font-black">{c.contract_name || c.cab_suppliers?.supplier_name || 'Contract'}</span>
                          {c.cab_suppliers?.supplier_name && (
                            <span className={`text-[10px] truncate ${selectedContractId === c.id ? 'text-slate-900 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                              {c.cab_suppliers.supplier_name}
                            </span>
                          )}
                        </div>
                        <ChevronRightIcon className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Selected Contract Negotiated Rates Grid */}
                <div className="md:col-span-3 space-y-6">
                  <Card className="border-border/60 bg-card shadow-md rounded-2xl">
                    <CardHeader className="p-4 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/40 flex flex-row justify-between items-center">
                      <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Negotiated Rates Grid</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditWizard(selectedContractId)} className="h-8 text-xs font-extrabold border-border/80 flex items-center gap-1">
                          <Edit className="w-3.5 h-3.5 text-amber-500" /> Edit Contract
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg flex items-center justify-center" 
                          onClick={() => {
                            const contract = contracts.find(c => c.id === selectedContractId);
                            const supplierName = contract?.cab_suppliers?.supplier_name || 'Selected Contract';
                            handleDeleteItem('contract', selectedContractId, supplierName);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {contractRates.length === 0 ? (
                        <div className="text-center py-12 text-slate-600 dark:text-slate-400 text-xs font-bold">
                          No rates configured for this contract. Use edit wizard to add rates.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                          {contractRates.map(rate => (
                            <Card key={rate.id} className="overflow-hidden border-border/60 bg-card hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between p-4 rounded-xl">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="space-y-1">
                                    <h4 className="font-extrabold text-xs text-slate-950 dark:text-white uppercase tracking-wide">
                                      {rate.cab_vehicles?.vehicle_type || 'Vehicle'}
                                    </h4>
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 font-extrabold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                                      {rate.rate_model}
                                    </Badge>
                                  </div>
                                  <Badge className={rate.active_status ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold shrink-0' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 font-bold shrink-0'} variant="outline">
                                    {rate.active_status ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>

                                <div className="space-y-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 pt-2.5 border-t border-border/30">
                                  <div className="flex justify-between py-0.5">
                                    <span className="text-slate-600 dark:text-slate-400 font-bold">Route/Station:</span>
                                    <strong className="text-amber-600 dark:text-amber-400 font-extrabold truncate max-w-[170px]" title={`${rate.cab_routes?.source || 'Any'} → ${rate.cab_routes?.destination || 'Any'}`}>
                                      {rate.cab_routes?.source || 'Any'} → {rate.cab_routes?.destination || 'Any'}
                                    </strong>
                                  </div>
                                  <div className="flex justify-between py-0.5">
                                    <span className="text-slate-600 dark:text-slate-400 font-bold">Season:</span>
                                    <strong className="text-slate-900 dark:text-slate-100 font-bold">{rate.season}</strong>
                                  </div>

                                  {rate.rate_model === 'Block Circuit' && (
                                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg my-1 space-y-1">
                                      <div className="flex justify-between text-[11px]">
                                        <span className="text-amber-500/80 font-bold">Circuit Included:</span>
                                        <strong className="text-amber-300 font-extrabold">{rate.base_km_included || rate.cab_routes?.distance_km || 0} KM</strong>
                                      </div>
                                      <div className="flex justify-between text-[11px]">
                                        <span className="text-amber-500/80 font-bold">Block Fare:</span>
                                        <strong className="text-emerald-400 font-black font-mono">₹{Number(rate.base_cost || rate.supplier_cost || 0).toLocaleString('en-IN')}</strong>
                                      </div>
                                    </div>
                                  )}

                                  {rate.rate_model === 'Per KM' && (
                                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg my-1 space-y-1">
                                      <div className="flex justify-between text-[11px]">
                                        <span className="text-emerald-500/80 font-bold">Tariff:</span>
                                        <strong className="text-emerald-300 font-extrabold">₹{rate.rate_per_km}/KM ({rate.min_km_per_day || 300} KM/day min)</strong>
                                      </div>
                                      <div className="flex justify-between text-[11px]">
                                        <span className="text-emerald-500/80 font-bold">Driver Allowance:</span>
                                        <strong className="text-emerald-300 font-extrabold">₹{rate.driver_allowance || 300}/day</strong>
                                      </div>
                                    </div>
                                  )}

                                  {rate.rate_model !== 'Block Circuit' && rate.rate_model !== 'Per KM' && (
                                    <div className="flex justify-between py-0.5">
                                      <span className="text-slate-600 dark:text-slate-400 font-bold">Base Rate:</span>
                                      <strong className="text-slate-900 dark:text-slate-100 font-mono font-bold">₹{Number(rate.base_cost || rate.transfer_cost || 0).toLocaleString('en-IN')}</strong>
                                    </div>
                                  )}

                                  <div className="flex justify-between py-0.5">
                                    <span className="text-slate-600 dark:text-slate-400 font-bold">GST (5%):</span>
                                    <strong className="text-slate-900 dark:text-slate-100 font-bold">
                                      {rate.gst_included ? 'Included' : `+${rate.gst_percentage || 5}%`}
                                    </strong>
                                  </div>
                                  <div className="flex justify-between text-xs border-t border-border/40 pt-2 mt-1.5 font-bold">
                                    <span className="text-slate-700 dark:text-slate-300 font-bold">Net Total:</span>
                                    <strong className="text-emerald-600 dark:text-emerald-400 font-black font-mono text-sm">
                                      ₹{Number(rate.supplier_cost || rate.base_cost || 0).toLocaleString('en-IN')}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Audit Trail Version logs */}
                  <Card className="border-border/60 bg-card shadow-md rounded-2xl">
                    <CardHeader className="p-4 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/40">
                      <CardTitle className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> Contract Audit History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-48 overflow-y-auto">
                      <div className="relative border-l border-border/50 pl-4 space-y-4 text-xs font-medium">
                        {contractHistoryLogs.map((log, i) => (
                          <div key={log.id || i} className="relative">
                            <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-background" />
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-slate-950 dark:text-white capitalize">{log.action?.replace(/_/g, ' ') || 'Change'}</span>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">Performed by {log.user_name} ({log.user_role})</p>
                          </div>
                        ))}
                        {contractHistoryLogs.length === 0 && (
                          <div className="text-center py-2 text-slate-600 dark:text-slate-400 text-xs font-bold">No modifications recorded yet.</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* Supplier Dialog Modal */}
      <Dialog open={isFormPage && dialogType === 'supplier'} onOpenChange={handleCancel}>
        <DialogContent className="max-w-lg bg-[#161d2f] border border-slate-800 text-slate-100 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
              {dialogMode === 'edit' ? 'Edit Transporter Supplier' : 'Add New Transporter Supplier'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Supplier / Transporter Name *</Label>
                <Input required value={supplierForm.supplier_name} onChange={e => setSupplierForm({ ...supplierForm, supplier_name: e.target.value })} className="bg-slate-900 border-slate-700 h-8" placeholder="e.g. Royal Travels" />
              </div>
              <div className="space-y-1">
                <Label>Supplier Code</Label>
                <Input value={supplierForm.supplier_code} onChange={e => setSupplierForm({ ...supplierForm, supplier_code: e.target.value })} className="bg-slate-900 border-slate-700 h-8 font-mono" placeholder="SUP-101" />
              </div>
              <div className="space-y-1">
                <Label>Contact Person</Label>
                <Input value={supplierForm.contact_person} onChange={e => setSupplierForm({ ...supplierForm, contact_person: e.target.value })} className="bg-slate-900 border-slate-700 h-8" placeholder="Name" />
              </div>
              <div className="space-y-1">
                <Label>Mobile Number</Label>
                <Input value={supplierForm.mobile} onChange={e => setSupplierForm({ ...supplierForm, mobile: e.target.value })} className="bg-slate-900 border-slate-700 h-8 font-mono" placeholder="+91 9876543210" />
              </div>
              <div className="space-y-1">
                <Label>Email Address</Label>
                <Input type="email" value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} className="bg-slate-900 border-slate-700 h-8" placeholder="transporter@example.com" />
              </div>
              <div className="space-y-1">
                <Label>GST Number</Label>
                <Input value={supplierForm.gst_number} onChange={e => setSupplierForm({ ...supplierForm, gst_number: e.target.value })} className="bg-slate-900 border-slate-700 h-8 font-mono" placeholder="24ABCDE1234F1Z5" />
              </div>
              <div className="space-y-1">
                <Label>PAN Number</Label>
                <Input value={supplierForm.pan_number} onChange={e => setSupplierForm({ ...supplierForm, pan_number: e.target.value })} className="bg-slate-900 border-slate-700 h-8 font-mono" placeholder="ABCDE1234F" />
              </div>
              <div className="space-y-1">
                <Label>Payment Terms</Label>
                <Input value={supplierForm.payment_terms} onChange={e => setSupplierForm({ ...supplierForm, payment_terms: e.target.value })} className="bg-slate-900 border-slate-700 h-8" placeholder="e.g. 15 Days Net" />
              </div>
              <div className="space-y-1">
                <Label>Valid From</Label>
                <Input type="date" value={supplierForm.valid_from} onChange={e => setSupplierForm({ ...supplierForm, valid_from: e.target.value })} className="bg-slate-900 border-slate-700 h-8" />
              </div>
              <div className="space-y-1">
                <Label>Valid To</Label>
                <Input type="date" value={supplierForm.valid_to} onChange={e => setSupplierForm({ ...supplierForm, valid_to: e.target.value })} className="bg-slate-900 border-slate-700 h-8" />
              </div>
            </div>
            <DialogFooter className="pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={handleCancel} className="h-8 text-xs text-slate-300">Cancel</Button>
              <Button type="submit" disabled={loading} className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />} Save Supplier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vehicle Dialog Modal */}
      <Dialog open={isFormPage && dialogType === 'vehicle'} onOpenChange={handleCancel}>
        <DialogContent className="max-w-md bg-[#161d2f] border border-slate-800 text-slate-100 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
              {dialogMode === 'edit' ? 'Edit Vehicle Master' : 'Add New Vehicle'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label>Vehicle Type / Model *</Label>
                <Input required value={vehicleForm.vehicle_type} onChange={e => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value })} className="bg-slate-900 border-slate-700 h-8" placeholder="e.g. Innova Crysta / Ertiga / Sedan" />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={vehicleForm.vehicle_category} onValueChange={val => setVehicleForm({ ...vehicleForm, vehicle_category: val })}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Luxury">Luxury</SelectItem>
                    <SelectItem value="Bus / Coach">Bus / Coach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Availability Status</Label>
                <Select value={vehicleForm.availability_status} onValueChange={val => setVehicleForm({ ...vehicleForm, availability_status: val })}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Booked">Booked</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Out of Service">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Adult Capacity (PAX)</Label>
                <Input type="number" value={vehicleForm.capacity_adults} onChange={e => setVehicleForm({ ...vehicleForm, capacity_adults: parseInt(e.target.value) || 0 })} className="bg-slate-900 border-slate-700 h-8 font-mono" />
              </div>
              <div className="space-y-1">
                <Label>Child Capacity (PAX)</Label>
                <Input type="number" value={vehicleForm.capacity_children} onChange={e => setVehicleForm({ ...vehicleForm, capacity_children: parseInt(e.target.value) || 0 })} className="bg-slate-900 border-slate-700 h-8 font-mono" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Luggage Capacity</Label>
                <Input value={vehicleForm.luggage_capacity} onChange={e => setVehicleForm({ ...vehicleForm, luggage_capacity: e.target.value })} className="bg-slate-900 border-slate-700 h-8" placeholder="e.g. 3 Large Bags + 2 Small" />
              </div>
            </div>
            <DialogFooter className="pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={handleCancel} className="h-8 text-xs text-slate-300">Cancel</Button>
              <Button type="submit" disabled={loading} className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />} Save Vehicle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Route Dialog Modal */}
      <Dialog open={isFormPage && dialogType === 'route'} onOpenChange={handleCancel}>
        <DialogContent className="max-w-md bg-[#161d2f] border border-slate-800 text-slate-100 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
              {dialogMode === 'edit' ? 'Edit Route Station' : 'Add New Route Station'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRoute} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Source Station *</Label>
                <Input
                  required
                  value={routeForm.source}
                  onChange={e => {
                    const val = e.target.value;
                    const geo = resolveGeography(val);
                    setRouteForm(prev => ({
                      ...prev,
                      source: val,
                      state: (!prev.state || prev.state === '') && geo.state ? geo.state : prev.state,
                      country: (!prev.country || prev.country === '') && geo.country ? geo.country : prev.country
                    }));
                  }}
                  className="bg-slate-900 border-slate-700 h-8"
                  placeholder="e.g. Delhi Airport"
                />
              </div>
              <div className="space-y-1">
                <Label>Destination Station *</Label>
                <Input
                  required
                  value={routeForm.destination}
                  onChange={e => {
                    const val = e.target.value;
                    const geo = resolveGeography(val);
                    setRouteForm(prev => ({
                      ...prev,
                      destination: val,
                      state: (!prev.state || prev.state === '') && geo.state ? geo.state : prev.state,
                      country: (!prev.country || prev.country === '') && geo.country ? geo.country : prev.country
                    }));
                  }}
                  className="bg-slate-900 border-slate-700 h-8"
                  placeholder="e.g. Jaipur Hotel"
                />
              </div>
              <div className="space-y-1">
                <Label>Route Type</Label>
                <Select value={routeForm.route_type} onValueChange={val => setRouteForm({ ...routeForm, route_type: val })}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Point to Point">Point to Point</SelectItem>
                    <SelectItem value="Airport Transfer">Airport Transfer</SelectItem>
                    <SelectItem value="Local Sightseeing">Local Sightseeing</SelectItem>
                    <SelectItem value="Outstation">Outstation Circuit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Distance (KM)</Label>
                <Input type="number" value={routeForm.distance_km} onChange={e => setRouteForm({ ...routeForm, distance_km: parseFloat(e.target.value) || 0 })} className="bg-slate-900 border-slate-700 h-8 font-mono" />
              </div>
              <div className="space-y-1">
                <Label>Est. Travel Time</Label>
                <Input value={routeForm.travel_time} onChange={e => setRouteForm({ ...routeForm, travel_time: e.target.value })} className="bg-slate-900 border-slate-700 h-8" placeholder="e.g. 5 Hours 30 Mins" />
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <Input value={routeForm.state} onChange={e => setRouteForm({ ...routeForm, state: e.target.value })} className="bg-slate-900 border-slate-700 h-8" placeholder="e.g. Rajasthan" />
              </div>
            </div>
            <DialogFooter className="pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={handleCancel} className="h-8 text-xs text-slate-300">Cancel</Button>
              <Button type="submit" disabled={loading} className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />} Save Route
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
