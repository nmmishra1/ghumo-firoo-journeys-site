import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Globe, Folder, MapPin, Search, Plus, Trash2, Edit, Save, 
  ChevronRight, ChevronDown, Image as ImageIcon, Sparkles, Car, 
  Plane, Compass, FileText, History, Shield, CheckCircle2, RefreshCw, 
  ArrowLeft, Tag, Layers, Clock, Sun, Landmark, Info
} from 'lucide-react';

const apiBase = import.meta.env.VITE_API_BASE_URL || '/php-backend';

type DestinationType = 'Country' | 'State' | 'City' | 'Island' | 'Beach' | 'Hill Station' | 'National Park' | 'Pilgrimage' | 'Theme Park' | 'Cruise Port' | 'Airport City' | 'UNESCO Site';

interface DestinationNode {
  id: string | number;
  parent_destination_id: string | number | null;
  destination_type: DestinationType;
  city: string;
  display_name: string | null;
  destination_code: string | null;
  iata_code: string | null;
  recommended_nights: number;
  airport: string | null;
  railway: string | null;
  currency: string;
  timezone: string;
  best_time: string | null;
  weather_summary: string | null;
  language: string;
  visa_required: number;
  status: 'Draft' | 'Published' | 'Archived';
  is_featured: number;
  description: string | null;
  children?: DestinationNode[];
  attraction_count?: number;
  activity_count?: number;
}

const DESTINATION_TYPES: DestinationType[] = [
  'Country', 'State', 'City', 'Island', 'Beach', 'Hill Station', 
  'National Park', 'Pilgrimage', 'Theme Park', 'Cruise Port', 'Airport City', 'UNESCO Site'
];

export default function DestinationManager() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Tree & Navigation States
  const [treeData, setTreeData] = useState<DestinationNode[]>([]);
  const [flatDestinations, setFlatDestinations] = useState<DestinationNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(new Set());
  const [selectedDestId, setSelectedDestId] = useState<string | number | null>(null);
  const [selectedDest, setSelectedDest] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add / Edit Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [parentType, setParentType] = useState<DestinationType>('City');
  const [formData, setFormData] = useState({
    parent_destination_id: '',
    destination_type: 'City' as DestinationType,
    city: '',
    display_name: '',
    iata_code: '',
    recommended_nights: 2,
    airport: '',
    railway: '',
    currency: 'INR',
    timezone: 'IST (UTC+5:30)',
    best_time: '',
    weather_summary: '',
    language: 'English',
    visa_required: 0,
    status: 'Published',
    description: '',
    country_name: '',
    state_name: ''
  });

  // Tab Modal Forms
  const [attractionForm, setAttractionForm] = useState({ name: '', category: 'Sightseeing', description: '', opening_hours: '', entry_fee: 0, visit_time: '1-2 Hours' });
  const [activityForm, setActivityForm] = useState({ name: '', duration: 'Half-Day', private_shared: 'Shared', vehicle_required: 0, description: '', adult_cost: 0, child_cost: 0, markup_pct: 15, selling_price: 0, country_name: '', state_name: '', city: '' });
  const [transferForm, setTransferForm] = useState({ source_name: '', destination_name: '', vehicle_type: 'Sedan Cab', cost: 0, selling_price: 0, duration: '1 Hour' });
  const [hotelForm, setHotelForm] = useState({ hotel_name: '', star_category: '4 Star', priority: 1, distance_from_center_km: 1.5 });
  const [restaurantForm, setRestaurantForm] = useState({ restaurant_name: '', cuisine: 'Continental', meal_type: 'Fine Dining', approx_cost: 1200, is_veg: 0 });
  const [shoppingForm, setShoppingForm] = useState({ shopping_name: '', category: 'Street Market', recommended_for: 'Souvenirs' });
  const [relationshipForm, setRelationshipForm] = useState({ related_destination_id: '', relationship_type: 'Day Trip', distance_km: 32, travel_time_mins: 40 });
  const [externalIdForm, setExternalIdForm] = useState({ provider: 'Google Places', external_id: '' });
  const [visaForm, setVisaForm] = useState({ visa_required: 0, processing_days: 5, documents_required: '', embassy_details: '', visa_fee: 0 });
  const [weatherForm, setWeatherForm] = useState({ best_months: '', avg_temp_c: '', rainfall_mm: '', peak_season: '', off_season: '' });
  const [mediaForm, setMediaForm] = useState({ image_url: '', caption: '', is_featured: 0 });
  const [noteText, setNoteText] = useState('');

  // Phase 4 Enterprise States
  const [seoForm, setSeoForm] = useState({
    seo_title: '',
    meta_description: '',
    keywords: '',
    canonical_url: '',
    url_slug: '',
    og_image: '',
    og_title: '',
    og_description: '',
    robots_index: 1
  });

  const [translationForm, setTranslationForm] = useState({
    language_code: 'de',
    entity_type: 'Destination' as 'Destination' | 'Attraction' | 'Activity' | 'SEO',
    entity_id: '',
    field_name: 'description',
    translated_text: ''
  });

  const [documentForm, setDocumentForm] = useState({
    category: 'Brochure' as 'Brochure' | 'Visa Form' | 'SOP' | 'Supplier Tariff' | 'Map' | 'Video',
    title: '',
    file_url: '',
    file_type: 'PDF',
    file_size: '1.5 MB',
    visibility: 'Public' as 'Public' | 'Internal'
  });

  const [attributeForm, setAttributeForm] = useState({
    attribute_name: 'Surfing Available',
    attribute_value: 'Yes'
  });

  const [versionsList, setVersionsList] = useState<any[]>([]);
  const [documentsList, setDocumentsList] = useState<any[]>([]);
  const [attributesList, setAttributesList] = useState<any[]>([]);
  const [translationsList, setTranslationsList] = useState<any[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([]);
  const [importJsonText, setImportJsonText] = useState('');

  // AI & Health Dashboard States
  const [showHealthDashboard, setShowHealthDashboard] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState<'Basic' | 'Attractions' | 'Activities' | 'Complete'>('Complete');
  const [aiCityInput, setAiCityInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${apiBase}/destination_health_api.php`);
      const json = await res.json();
      if (json.success) setHealthData(json);
    } catch (e) {
      console.error("Health fetch error:", e);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleAiGenerate = async () => {
    if (!aiCityInput) return;
    try {
      setAiGenerating(true);
      const res = await fetch(`${apiBase}/destination_ai_api.php?action=generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: aiCityInput, mode: aiMode, destination_id: selectedDestId })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "AI Generation Complete", description: json.message });
        setAiModalOpen(false);
        fetchTree();
        if (selectedDestId) fetchDetail(selectedDestId);
      }
    } catch (e) {
      console.error("AI error:", e);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAiVerify = async (status: 'Verified' | 'Rejected') => {
    if (!selectedDestId) return;
    try {
      const res = await fetch(`${apiBase}/destination_ai_api.php?action=verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_id: selectedDestId, status })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Status Updated", description: json.message });
        fetchDetail(selectedDestId);
        fetchTree();
      }
    } catch (e) {
      console.error("Verify error:", e);
    }
  };

  // Fetch Tree
  const fetchTree = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/destinations_api.php?tree=1`);
      const json = await res.json();
      if (json.success) {
        setTreeData(json.tree || []);
        // Flatten list for dropdowns
        const flat: DestinationNode[] = [];
        const flatten = (items: DestinationNode[]) => {
          items.forEach(i => {
            flat.push(i);
            if (i.children && i.children.length > 0) flatten(i.children);
          });
        };
        flatten(json.tree || []);
        setFlatDestinations(flat);

        if (!selectedDestId && flat.length > 0) {
          setSelectedDestId(flat[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load destinations tree:", e);
      toast({ title: "Error", description: "Failed to load destinations tree", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  // Fetch Selected Destination Detail
  const fetchDetail = async (id: string | number) => {
    try {
      setDetailLoading(true);
      const res = await fetch(`${apiBase}/destinations_api.php?id=${id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedDest(json.data);
        if (json.data.visa) {
          setVisaForm({
            visa_required: json.data.visa.visa_required || 0,
            processing_days: json.data.visa.processing_days || 5,
            documents_required: json.data.visa.documents_required || '',
            embassy_details: json.data.visa.embassy_details || '',
            visa_fee: json.data.visa.visa_fee || 0
          });
        }
        if (json.data.weather) {
          setWeatherForm({
            best_months: json.data.weather.best_months || '',
            avg_temp_c: json.data.weather.avg_temp_c || '',
            rainfall_mm: json.data.weather.rainfall_mm || '',
            peak_season: json.data.weather.peak_season || '',
            off_season: json.data.weather.off_season || ''
          });
        }
        fetchEnterpriseData(id);
      }
    } catch (e) {
      console.error("Failed to fetch destination detail:", e);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchEnterpriseData = async (id: string | number) => {
    try {
      const seoRes = await fetch(`${apiBase}/destination_enterprise_api.php?action=get_seo&destination_id=${id}`);
      const seoJson = await seoRes.json();
      if (seoJson.success && seoJson.data) {
        setSeoForm({
          seo_title: seoJson.data.seo_title || '',
          meta_description: seoJson.data.meta_description || '',
          keywords: seoJson.data.keywords || '',
          canonical_url: seoJson.data.canonical_url || '',
          url_slug: seoJson.data.url_slug || '',
          og_image: seoJson.data.og_image || '',
          og_title: seoJson.data.og_title || '',
          og_description: seoJson.data.og_description || '',
          robots_index: seoJson.data.robots_index ?? 1
        });
      }

      const trRes = await fetch(`${apiBase}/destination_enterprise_api.php?action=get_translations&destination_id=${id}`);
      const trJson = await trRes.json();
      if (trJson.success) setTranslationsList(trJson.data);

      const verRes = await fetch(`${apiBase}/destination_enterprise_api.php?action=list_versions&destination_id=${id}`);
      const verJson = await verRes.json();
      if (verJson.success) setVersionsList(verJson.data);

      const docRes = await fetch(`${apiBase}/destination_enterprise_api.php?action=list_documents&destination_id=${id}`);
      const docJson = await docRes.json();
      if (docJson.success) setDocumentsList(docJson.data);

      const attrRes = await fetch(`${apiBase}/destination_enterprise_api.php?action=list_attributes&destination_id=${id}`);
      const attrJson = await attrRes.json();
      if (attrJson.success) setAttributesList(attrJson.data);

      const wfRes = await fetch(`${apiBase}/destination_enterprise_api.php?action=get_workflow_history&destination_id=${id}`);
      const wfJson = await wfRes.json();
      if (wfJson.success) setWorkflowHistory(wfJson.data);
    } catch (err) {
      console.error("Enterprise fetch error:", err);
    }
  };

  const handleWorkflowTransition = async (toStatus: string) => {
    if (!selectedDestId) return;
    try {
      const res = await fetch(`${apiBase}/destination_enterprise_api.php?action=workflow_transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_id: selectedDestId, to_status: toStatus, notes: `Advanced to ${toStatus}` })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Workflow Transition", description: json.message });
        fetchDetail(selectedDestId);
        fetchTree();
      }
    } catch (e) {
      console.error("Workflow error:", e);
    }
  };

  useEffect(() => {
    if (selectedDestId) {
      fetchDetail(selectedDestId);
    }
  }, [selectedDestId]);

  const toggleNodeExpand = (id: string | number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Create Destination Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/destinations_api.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();

      if (json.is_duplicate) {
        toast({ title: "Duplicate Found", description: json.message, variant: "destructive" });
        return;
      }

      if (json.success) {
        toast({ title: "Success", description: "Destination added successfully" });
        setAddModalOpen(false);
        fetchTree();
        if (json.id) setSelectedDestId(json.id);
      } else {
        toast({ title: "Error", description: json.error || "Failed to create", variant: "destructive" });
      }
    } catch (e) {
      console.error("Create destination error:", e);
    }
  };

  // Add Sub-Item Submit Handlers
  const handleAddSubItem = async (action: string, payload: any) => {
    try {
      const res = await fetch(`${apiBase}/destination_tab_items.php?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_id: selectedDestId, ...payload })
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Updated", description: json.message || "Record updated" });
        if (selectedDestId) fetchDetail(selectedDestId);
      } else {
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } catch (e) {
      console.error(`Sub-item action ${action} failed:`, e);
    }
  };

  const handleDeleteSubItem = async (action: string, id: number) => {
    try {
      const res = await fetch(`${apiBase}/destination_tab_items.php?action=${action}&id=${id}`);
      const json = await res.json();
      if (json.success) {
        toast({ title: "Deleted", description: "Item removed" });
        if (selectedDestId) fetchDetail(selectedDestId);
      }
    } catch (e) {
      console.error(`Delete action ${action} failed:`, e);
    }
  };

  // Recursive Tree Component
  const renderTreeNode = (node: DestinationNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedDestId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none text-left">
        <div 
          onClick={() => setSelectedDestId(node.id)}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            isSelected 
              ? 'bg-[#C9A25A]/20 text-[#C9A25A] border border-[#C9A25A]/40 font-bold' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren ? (
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); toggleNodeExpand(node.id); }}
                className="p-0.5 text-slate-400 hover:text-slate-600"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-3.5 h-3.5" />
            )}
            
            {node.destination_type === 'Country' && <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            {node.destination_type === 'State' && <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
            {node.destination_type === 'City' && <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
            {['Island', 'Beach', 'Hill Station', 'National Park', 'Pilgrimage'].includes(node.destination_type) && <Compass className="w-3.5 h-3.5 text-purple-500 shrink-0" />}

            <span className="truncate">{node.city}</span>
            {node.iata_code && <span className="font-mono text-[9px] text-slate-400">({node.iata_code})</span>}
          </div>

          <Badge variant="outline" className="text-[9px] px-1 py-0 border-slate-200">
            {node.destination_type}
          </Badge>
        </div>

        {hasChildren && isExpanded && (
          <div className="pl-3.5 ml-2 border-l border-border/40 space-y-0.5 mt-0.5">
            {node.children!.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto text-left">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border/60 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/crm')} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-extrabold flex items-center gap-2 text-foreground">
              <Globe className="w-5 h-5 text-[#C9A25A]" />
              Destination & Experience Manager
            </h1>
            <p className="text-xs text-muted-foreground">
              Master database for worldwide cities, attractions, activities, transfers, visa & climate inventory.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setShowHealthDashboard(!showHealthDashboard)} 
            variant="outline" 
            size="sm" 
            className="text-xs font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20"
          >
            <Shield className="w-3.5 h-3.5 mr-1" /> Health Dashboard
          </Button>

          <Button 
            onClick={() => {
              setAiCityInput(selectedDest ? selectedDest.city : '');
              setAiModalOpen(true);
            }} 
            variant="outline" 
            size="sm" 
            className="text-xs font-bold border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-500 animate-pulse" /> 4-Tier AI Assistant
          </Button>

          <Button 
            onClick={() => {
              setFormData({ ...formData, destination_type: 'Country', parent_destination_id: '' });
              setAddModalOpen(true);
            }} 
            variant="outline" 
            size="sm" 
            className="text-xs font-bold border-border/60"
          >
            + Add Country
          </Button>
          <Button 
            onClick={() => {
              setFormData({ ...formData, destination_type: 'City', parent_destination_id: selectedDestId ? String(selectedDestId) : '' });
              setAddModalOpen(true);
            }} 
            size="sm" 
            className="bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] text-[#0B1026] font-extrabold text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Destination
          </Button>
        </div>
      </div>

      {showHealthDashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 bg-[#0B1026] text-white p-4 rounded-2xl border border-[#C9A25A]/40 shadow-md">
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-400">Total Destinations</span>
            <div className="text-lg font-black text-white">{healthData?.kpis?.total || flatDestinations.length}</div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-emerald-400">Published</span>
            <div className="text-lg font-black text-emerald-400">{healthData?.kpis?.published || flatDestinations.filter(d=>d.status==='Published').length}</div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-amber-400">Draft</span>
            <div className="text-lg font-black text-amber-400">{healthData?.kpis?.draft || 0}</div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-purple-400">AI Pending</span>
            <div className="text-lg font-black text-purple-400">{healthData?.kpis?.ai_pending || 0}</div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-rose-400">Missing Images</span>
            <div className="text-lg font-black text-rose-400">{healthData?.kpis?.missing_images || 0}</div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-orange-400">Missing Activities</span>
            <div className="text-lg font-black text-orange-400">{healthData?.kpis?.missing_activities || 0}</div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-amber-300">Low Completeness (&lt;70%)</span>
            <div className="text-lg font-black text-amber-300">{healthData?.kpis?.low_completeness || 0}</div>
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Navigation Tree Explorer (4 cols) */}
        <Card className="md:col-span-4 border border-border/60 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
          <CardHeader className="p-3.5 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <Input 
                placeholder="Search city, IATA (ZRH), tags (Wine/Beach), attractions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8 rounded-xl bg-background"
              />
            </div>
          </CardHeader>
          <CardContent className="p-2 flex-1 overflow-y-auto space-y-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading tree hierarchy...</div>
            ) : treeData.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No destinations found. Use "+ Add Destination" to create one.</div>
            ) : (
              treeData
                .filter(n => !searchQuery || n.city.toLowerCase().includes(searchQuery.toLowerCase()) || (n.iata_code && n.iata_code.toLowerCase().includes(searchQuery.toLowerCase())))
                .map(n => renderTreeNode(n))
            )}
          </CardContent>
        </Card>

        {/* Right Panel Workspace (8 cols) */}
        <Card className="md:col-span-8 border border-border/60 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
          {detailLoading ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2 my-auto">
              <RefreshCw className="w-5 h-5 animate-spin text-[#C9A25A]" />
              Loading destination records...
            </div>
          ) : !selectedDest ? (
            <div className="p-12 text-center text-xs text-muted-foreground my-auto space-y-2">
              <Globe className="w-8 h-8 mx-auto text-slate-300" />
              <p>Select a destination from the left tree navigation to view or edit inventory.</p>
            </div>
          ) : (
            <>
              {/* Header Details */}
              <div className="p-4 border-b border-border/40 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#C9A25A] text-[#0B1026] font-extrabold text-[10px]">
                      {selectedDest.destination_type}
                    </Badge>
                    <h2 className="text-base font-extrabold">{selectedDest.city}</h2>
                    {selectedDest.iata_code && (
                      <span className="font-mono text-xs text-amber-400 font-bold">[{selectedDest.iata_code}]</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Code: <span className="font-mono font-bold text-slate-200">{selectedDest.destination_code}</span> · Rec Stay: <span className="font-semibold text-slate-200">{selectedDest.recommended_nights}N</span> · Currency: <span className="font-semibold text-slate-200">{selectedDest.currency}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-xs font-bold">
                    {selectedDest.status}
                  </Badge>
                  
                  {/* Workflow Approval Action Buttons */}
                  {selectedDest.status === 'Draft' && (
                    <Button size="sm" onClick={() => handleWorkflowTransition('Submitted')} className="h-7 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white">
                      Submit for Review
                    </Button>
                  )}
                  {selectedDest.status === 'Submitted' && (
                    <Button size="sm" onClick={() => handleWorkflowTransition('Content Review')} className="h-7 text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white">
                      Content Review
                    </Button>
                  )}
                  {selectedDest.status === 'Content Review' && (
                    <Button size="sm" onClick={() => handleWorkflowTransition('Commercial Review')} className="h-7 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white">
                      Commercial Review
                    </Button>
                  )}
                  {selectedDest.status === 'Commercial Review' && (
                    <Button size="sm" onClick={() => handleWorkflowTransition('Approved')} className="h-7 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                      Approve
                    </Button>
                  )}
                  {selectedDest.status === 'Approved' && (
                    <Button size="sm" onClick={() => handleWorkflowTransition('Published')} className="h-7 text-[10px] font-bold bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] text-[#0B1026]">
                      Publish Everywhere
                    </Button>
                  )}

                  {selectedDest.status === 'Archived' ? (
                    <Button 
                      size="sm" 
                      onClick={async () => {
                        await fetch(`${apiBase}/destinations_api.php?action=restore&id=${selectedDest.id}`, { method: 'POST' });
                        toast({ title: "Restored", description: "Destination restored to Published status" });
                        fetchDetail(selectedDest.id);
                        fetchTree();
                      }}
                      className="h-7 bg-[#C9A25A] text-[#0B1026] font-bold text-xs"
                    >
                      Restore Destination
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={async () => {
                        await fetch(`${apiBase}/destinations_api.php?id=${selectedDest.id}`, { method: 'DELETE' });
                        toast({ title: "Archived", description: "Destination archived (past quotes preserved)" });
                        fetchDetail(selectedDest.id);
                        fetchTree();
                      }}
                      className="h-7 text-xs font-bold text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
                    >
                      Archive Destination
                    </Button>
                  )}
                </div>
              </div>

              {/* AI Verification Banner */}
              {(!selectedDest.is_verified || selectedDest.status === 'Draft') && (
                <div className="p-3 bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="font-bold">⚠ AI Generated Content — Review Required</span>
                    <Badge variant="outline" className="text-[10px] border-amber-500/50">Draft / Unverified</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" onClick={() => handleAiVerify('Verified')} className="h-6 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Verify & Publish
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAiVerify('Rejected')} className="h-6 text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950">
                      Reject AI
                    </Button>
                  </div>
                </div>
              )}

              {/* Enterprise Workspace Tabs */}
              <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 border-b border-border/40 rounded-none overflow-x-auto justify-start flex-nowrap shrink-0">
                  <TabsTrigger value="general" className="text-xs font-bold py-1 px-3">General</TabsTrigger>
                  <TabsTrigger value="seo" className="text-xs font-bold py-1 px-3 text-emerald-600">SEO & Slug</TabsTrigger>
                  <TabsTrigger value="translations" className="text-xs font-bold py-1 px-3 text-purple-600">Translations</TabsTrigger>
                  <TabsTrigger value="versioning" className="text-xs font-bold py-1 px-3 text-blue-600">Versions ({versionsList.length})</TabsTrigger>
                  <TabsTrigger value="documents" className="text-xs font-bold py-1 px-3 text-amber-600">Documents ({documentsList.length})</TabsTrigger>
                  <TabsTrigger value="attributes" className="text-xs font-bold py-1 px-3 text-indigo-600">Attributes ({attributesList.length})</TabsTrigger>
                  <TabsTrigger value="import_bulk" className="text-xs font-bold py-1 px-3 text-cyan-600">Bulk & Import Wizard</TabsTrigger>
                  <TabsTrigger value="attractions" className="text-xs font-bold py-1 px-3">Attractions ({selectedDest.attractions?.length || 0})</TabsTrigger>
                  <TabsTrigger value="activities" className="text-xs font-bold py-1 px-3">Activities ({selectedDest.activities?.length || 0})</TabsTrigger>
                  <TabsTrigger value="hotels" className="text-xs font-bold py-1 px-3">Hotels ({selectedDest.hotels?.length || 0})</TabsTrigger>
                  <TabsTrigger value="transfers" className="text-xs font-bold py-1 px-3">Transfers ({selectedDest.transfers?.length || 0})</TabsTrigger>
                  <TabsTrigger value="restaurants" className="text-xs font-bold py-1 px-3">Restaurants ({selectedDest.restaurants?.length || 0})</TabsTrigger>
                  <TabsTrigger value="shopping" className="text-xs font-bold py-1 px-3">Shopping ({selectedDest.shopping?.length || 0})</TabsTrigger>
                  <TabsTrigger value="relationships" className="text-xs font-bold py-1 px-3">Relationships ({selectedDest.relationships?.length || 0})</TabsTrigger>
                  <TabsTrigger value="external" className="text-xs font-bold py-1 px-3">Provider IDs ({selectedDest.external_ids?.length || 0})</TabsTrigger>
                  <TabsTrigger value="visa" className="text-xs font-bold py-1 px-3">Visa & Weather</TabsTrigger>
                  <TabsTrigger value="media" className="text-xs font-bold py-1 px-3">Media ({selectedDest.media?.length || 0})</TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs font-bold py-1 px-3">Notes ({selectedDest.notes?.length || 0})</TabsTrigger>
                  <TabsTrigger value="audit" className="text-xs font-bold py-1 px-3">Audit Trail</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto p-4">
                  {/* TAB 1: General */}
                  <TabsContent value="general" className="m-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-slate-500">City / Destination</Label>
                        <Input value={selectedDest.city} readOnly className="h-8 text-xs bg-slate-50" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-slate-500">IATA Code</Label>
                        <Input value={selectedDest.iata_code || '---'} readOnly className="h-8 text-xs bg-slate-50 font-mono" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Nearest Airport</Label>
                        <Input value={selectedDest.airport || '---'} readOnly className="h-8 text-xs bg-slate-50" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Nearest Railway</Label>
                        <Input value={selectedDest.railway || '---'} readOnly className="h-8 text-xs bg-slate-50" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Timezone</Label>
                        <Input value={selectedDest.timezone} readOnly className="h-8 text-xs bg-slate-50" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Language</Label>
                        <Input value={selectedDest.language} readOnly className="h-8 text-xs bg-slate-50" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Country</Label>
                        <Input value={selectedDest.country_name || '---'} readOnly className="h-8 text-xs bg-slate-50 font-bold" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold uppercase text-slate-500">State / Region</Label>
                        <Input value={selectedDest.state_name || '---'} readOnly className="h-8 text-xs bg-slate-50" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Description</Label>
                      <Textarea value={selectedDest.description || 'No description provided.'} readOnly className="text-xs leading-relaxed bg-slate-50" rows={4} />
                    </div>
                  </TabsContent>

                  {/* TAB: SEO & Slug */}
                  <TabsContent value="seo" className="m-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 border border-border/60 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">SEO Meta Configuration</span>
                        <div>
                          <Label className="text-[10px] font-bold uppercase">SEO Title</Label>
                          <Input value={seoForm.seo_title} onChange={e => setSeoForm({...seoForm, seo_title: e.target.value})} placeholder="e.g. Hallstatt Travel Guide & Holiday Packages" className="h-8 text-xs" />
                        </div>
                        <div>
                          <Label className="text-[10px] font-bold uppercase">Meta Description</Label>
                          <Textarea value={seoForm.meta_description} onChange={e => setSeoForm({...seoForm, meta_description: e.target.value})} placeholder="Explore Hallstatt lake, salt mines, and skywalk..." className="text-xs" rows={2} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] font-bold uppercase">URL Slug *</Label>
                            <Input value={seoForm.url_slug} onChange={e => setSeoForm({...seoForm, url_slug: e.target.value})} placeholder="hallstatt-austria" className="h-8 text-xs font-mono" />
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold uppercase">Keywords</Label>
                            <Input value={seoForm.keywords} onChange={e => setSeoForm({...seoForm, keywords: e.target.value})} placeholder="hallstatt, austria, lake" className="h-8 text-xs" />
                          </div>
                        </div>
                        <Button size="sm" onClick={async () => {
                          const res = await fetch(`${apiBase}/destination_enterprise_api.php?action=save_seo`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...seoForm, destination_id: selectedDest.id, city: selectedDest.city })
                          });
                          const json = await res.json();
                          if (json.success) toast({ title: "SEO Saved", description: json.message });
                        }} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Save SEO Settings</Button>
                      </div>

                      {/* Google Search Live Preview */}
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-950 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Google Search Live Preview</span>
                        <div className="text-[11px] text-[#202124] dark:text-slate-400 font-mono flex items-center gap-1 truncate">
                          https://ghumofiroo.com/destination/{seoForm.url_slug || 'destination-slug'}
                        </div>
                        <div className="text-sm font-bold text-[#1a0dab] dark:text-blue-400 hover:underline cursor-pointer">
                          {seoForm.seo_title || `${selectedDest.city} Holidays & Packages | Ghumo Firoo Journeys`}
                        </div>
                        <div className="text-xs text-[#4d5156] dark:text-slate-300 line-clamp-2">
                          {seoForm.meta_description || `Discover ${selectedDest.city} with curated tour itineraries, handpicked hotels, excursions, and local travel guides.`}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB: Translations */}
                  <TabsContent value="translations" className="m-0 space-y-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Add Multilingual Translation</span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <select value={translationForm.language_code} onChange={e => setTranslationForm({...translationForm, language_code: e.target.value})} className="h-8 text-xs border rounded px-2 bg-background font-bold">
                          <option value="de">German (Deutsch)</option>
                          <option value="fr">French (Français)</option>
                          <option value="es">Spanish (Español)</option>
                          <option value="it">Italian (Italiano)</option>
                          <option value="hi">Hindi (हिन्दी)</option>
                        </select>
                        <select value={translationForm.entity_type} onChange={e => setTranslationForm({...translationForm, entity_type: e.target.value as any})} className="h-8 text-xs border rounded px-2 bg-background font-semibold">
                          <option value="Destination">Destination</option>
                          <option value="Attraction">Attraction</option>
                          <option value="Activity">Activity</option>
                          <option value="SEO">SEO</option>
                        </select>
                        <Input placeholder="Field Name (e.g. description)" value={translationForm.field_name} onChange={e => setTranslationForm({...translationForm, field_name: e.target.value})} className="h-8 text-xs" />
                        <Input placeholder="Translated Text" value={translationForm.translated_text} onChange={e => setTranslationForm({...translationForm, translated_text: e.target.value})} className="h-8 text-xs" />
                      </div>
                      <Button size="sm" onClick={async () => {
                        const res = await fetch(`${apiBase}/destination_enterprise_api.php?action=save_translation`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...translationForm, destination_id: selectedDest.id })
                        });
                        const json = await res.json();
                        if (json.success) {
                          toast({ title: "Translation Saved", description: json.message });
                          fetchEnterpriseData(selectedDest.id);
                        }
                      }} className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold">Save Translation</Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {translationsList.map((tr: any) => (
                        <div key={tr.id} className="py-2 flex justify-between items-center text-xs">
                          <div>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono mr-2">{tr.language_code}</Badge>
                            <span className="font-bold">{tr.field_name}:</span> <span className="text-slate-600 dark:text-slate-300">{tr.translated_text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB: Versions & Rollback */}
                  <TabsContent value="versioning" className="m-0 space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Published Version Timeline & 1-Click Rollback</span>
                      <div className="divide-y divide-border/40">
                        {versionsList.map((ver: any) => (
                          <div key={ver.id} className="py-2 flex items-center justify-between">
                            <div>
                              <Badge className="bg-blue-600 text-white text-[10px] mr-2">Version {ver.version_number}</Badge>
                              <span className="text-xs font-semibold">{ver.change_summary}</span>
                              <span className="text-[10px] text-slate-400 ml-2">by {ver.created_by} · {new Date(ver.created_at).toLocaleString()}</span>
                            </div>
                            <Button size="sm" variant="outline" onClick={async () => {
                              const res = await fetch(`${apiBase}/destination_enterprise_api.php?action=rollback_version`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ destination_id: selectedDest.id, version_number: ver.version_number })
                              });
                              const json = await res.json();
                              if (json.success) {
                                toast({ title: "Rollback Complete", description: json.message });
                                fetchDetail(selectedDest.id);
                                fetchTree();
                              }
                            }} className="h-6 text-[10px] font-bold text-amber-600 border-amber-500/40">
                              Rollback to v{ver.version_number}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB: Document Vault */}
                  <TabsContent value="documents" className="m-0 space-y-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Upload Document / Brochure / Tariff</span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <select value={documentForm.category} onChange={e => setDocumentForm({...documentForm, category: e.target.value as any})} className="h-8 text-xs border rounded px-2 bg-background font-bold">
                          {['Brochure', 'Visa Form', 'SOP', 'Supplier Tariff', 'Map', 'Video'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <Input placeholder="Document Title" value={documentForm.title} onChange={e => setDocumentForm({...documentForm, title: e.target.value})} className="h-8 text-xs" />
                        <Input placeholder="File URL / Download Link" value={documentForm.file_url} onChange={e => setDocumentForm({...documentForm, file_url: e.target.value})} className="h-8 text-xs font-mono" />
                        <select value={documentForm.visibility} onChange={e => setDocumentForm({...documentForm, visibility: e.target.value as any})} className="h-8 text-xs border rounded px-2 bg-background font-semibold">
                          <option value="Public">Public</option>
                          <option value="Internal">Internal Only</option>
                        </select>
                      </div>
                      <Button size="sm" onClick={async () => {
                        const res = await fetch(`${apiBase}/destination_enterprise_api.php?action=add_document`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...documentForm, destination_id: selectedDest.id })
                        });
                        const json = await res.json();
                        if (json.success) {
                          toast({ title: "Document Vault", description: json.message });
                          fetchEnterpriseData(selectedDest.id);
                        }
                      }} className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold">Add Document</Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {documentsList.map((doc: any) => (
                        <div key={doc.id} className="py-2 flex justify-between items-center text-xs">
                          <div>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono mr-2">{doc.category}</Badge>
                            <span className="font-bold">{doc.title}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({doc.visibility} · {doc.file_type})</span>
                          </div>
                          {doc.file_url && <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-mono text-[10px]">Open Link</a>}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB: Dynamic Attributes */}
                  <TabsContent value="attributes" className="m-0 space-y-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Bind Dynamic Key-Value Attribute</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input placeholder="Attribute Name (e.g. Surfing Available)" value={attributeForm.attribute_name} onChange={e => setAttributeForm({...attributeForm, attribute_name: e.target.value})} className="h-8 text-xs" />
                        <Input placeholder="Value (e.g. Yes / Premium / Season)" value={attributeForm.attribute_value} onChange={e => setAttributeForm({...attributeForm, attribute_value: e.target.value})} className="h-8 text-xs" />
                      </div>
                      <Button size="sm" onClick={async () => {
                        const res = await fetch(`${apiBase}/destination_enterprise_api.php?action=set_attribute`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...attributeForm, destination_id: selectedDest.id })
                        });
                        const json = await res.json();
                        if (json.success) {
                          toast({ title: "Attribute Saved", description: json.message });
                          fetchEnterpriseData(selectedDest.id);
                        }
                      }} className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Bind Attribute</Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {attributesList.map((attr: any) => (
                        <div key={attr.id} className="py-2 flex justify-between items-center text-xs">
                          <span className="font-bold">{attr.attribute_name}</span>
                          <span className="font-mono text-slate-600 dark:text-slate-300">{attr.attribute_value}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB: Bulk Importer */}
                  <TabsContent value="import_bulk" className="m-0 space-y-4">
                    <div className="p-4 border border-cyan-200 dark:border-cyan-800 bg-cyan-50/40 dark:bg-cyan-950/20 rounded-xl space-y-3">
                      <span className="text-xs font-extrabold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-cyan-600" /> 5-Step Bulk Importer & Data Wizard
                      </span>
                      <Textarea value={importJsonText} onChange={e => setImportJsonText(e.target.value)} placeholder='Paste JSON/CSV records e.g. [{"city":"Colmar","country_name":"France","iata_code":"CMR"}]' className="text-xs font-mono" rows={3} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={async () => {
                          try {
                            const parsed = JSON.parse(importJsonText);
                            toast({ title: "Validation Passed", description: `Validated ${parsed.length} destination records cleanly!` });
                          } catch (e) {
                            toast({ title: "Validation Error", description: "Invalid JSON format", variant: "destructive" });
                          }
                        }} className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold">Validate Batch</Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 2: Attractions */}
                  <TabsContent value="attractions" className="m-0 space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-[#C9A25A]" /> Add Non-Priced Tourist Spot:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input placeholder="Attraction Name (e.g. Hallstatt Lake)" value={attractionForm.name} onChange={e => setAttractionForm({...attractionForm, name: e.target.value})} className="h-8 text-xs" />
                        <Input placeholder="Category (e.g. Nature)" value={attractionForm.category} onChange={e => setAttractionForm({...attractionForm, category: e.target.value})} className="h-8 text-xs" />
                        <Input placeholder="Visit Time (e.g. 1-2 Hours)" value={attractionForm.visit_time} onChange={e => setAttractionForm({...attractionForm, visit_time: e.target.value})} className="h-8 text-xs" />
                      </div>
                      <Button size="sm" onClick={() => { handleAddSubItem('add_attraction', attractionForm); setAttractionForm({ name: '', category: 'Sightseeing', description: '', opening_hours: '', entry_fee: 0, visit_time: '1-2 Hours' }); }} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">
                        Add Attraction
                      </Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {selectedDest.attractions?.map((a: any) => (
                        <div key={a.id} className="py-2 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-xs text-foreground">{a.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({a.category} · {a.visit_time})</span>
                          </div>
                          <button onClick={() => handleDeleteSubItem('delete_attraction', a.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB 3: Activities */}
                  <TabsContent value="activities" className="m-0 space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" /> Add Bookable Excursion / Activity:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <Input placeholder="Excursion Name" value={activityForm.name} onChange={e => setActivityForm({...activityForm, name: e.target.value})} className="h-8 text-xs" />
                        <Input type="number" placeholder="Adult Cost (₹)" value={activityForm.adult_cost || ''} onChange={e => setActivityForm({...activityForm, adult_cost: parseFloat(e.target.value)})} className="h-8 text-xs font-mono" />
                        <Input type="number" placeholder="Markup %" value={activityForm.markup_pct || ''} onChange={e => setActivityForm({...activityForm, markup_pct: parseFloat(e.target.value)})} className="h-8 text-xs font-mono" />
                        <Input placeholder="Duration" value={activityForm.duration} onChange={e => setActivityForm({...activityForm, duration: e.target.value})} className="h-8 text-xs" />
                      </div>
                      <Button size="sm" onClick={() => { handleAddSubItem('add_activity', activityForm); setActivityForm({ name: '', duration: 'Half-Day', private_shared: 'Shared', vehicle_required: 0, description: '', adult_cost: 0, child_cost: 0, markup_pct: 15, selling_price: 0 }); }} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">
                        Add Activity
                      </Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {selectedDest.activities?.map((act: any) => (
                        <div key={act.id} className="py-2.5 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-xs text-foreground">{act.name}</div>
                            <div className="text-[11px] text-slate-500">
                              Cost: <span className="font-mono text-slate-700">₹{act.adult_cost}</span> · Selling Price: <span className="font-mono text-[#C9A25A] font-bold">₹{act.selling_price}</span> ({act.duration})
                            </div>
                          </div>
                          <button onClick={() => handleDeleteSubItem('delete_activity', act.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB 4: Transfers */}
                  <TabsContent value="transfers" className="m-0 space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-[#C9A25A]" /> Add Transfer Rate:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <Input placeholder="From (Source)" value={transferForm.source_name} onChange={e => setTransferForm({...transferForm, source_name: e.target.value})} className="h-8 text-xs" />
                        <Input placeholder="To (Destination)" value={transferForm.destination_name} onChange={e => setTransferForm({...transferForm, destination_name: e.target.value})} className="h-8 text-xs" />
                        <Input placeholder="Vehicle Type" value={transferForm.vehicle_type} onChange={e => setTransferForm({...transferForm, vehicle_type: e.target.value})} className="h-8 text-xs" />
                        <Input type="number" placeholder="Selling Price (₹)" value={transferForm.selling_price || ''} onChange={e => setTransferForm({...transferForm, selling_price: parseFloat(e.target.value)})} className="h-8 text-xs font-mono" />
                      </div>
                      <Button size="sm" onClick={() => { handleAddSubItem('add_transfer', transferForm); setTransferForm({ source_name: '', destination_name: '', vehicle_type: 'Sedan Cab', cost: 0, selling_price: 0, duration: '1 Hour' }); }} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">
                        Add Transfer
                      </Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {selectedDest.transfers?.map((t: any) => (
                        <div key={t.id} className="py-2 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-xs text-foreground">{t.source_name} → {t.destination_name}</span>
                            <span className="text-[11px] text-slate-500 ml-2">({t.vehicle_type}) — <span className="font-mono text-[#C9A25A] font-bold">₹{t.selling_price}</span></span>
                          </div>
                          <button onClick={() => handleDeleteSubItem('delete_transfer', t.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB: Hotels */}
                  <TabsContent value="hotels" className="m-0 space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-[#C9A25A]" /> Map Hotel to Destination:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input placeholder="Hotel Name (e.g. Hilton Paris)" value={hotelForm.hotel_name} onChange={e => setHotelForm({...hotelForm, hotel_name: e.target.value})} className="h-8 text-xs" />
                        <Input placeholder="Star Rating (e.g. 5 Star)" value={hotelForm.star_category} onChange={e => setHotelForm({...hotelForm, star_category: e.target.value})} className="h-8 text-xs" />
                        <Input type="number" step="0.1" placeholder="Distance from Center (km)" value={hotelForm.distance_from_center_km || ''} onChange={e => setHotelForm({...hotelForm, distance_from_center_km: parseFloat(e.target.value)})} className="h-8 text-xs font-mono" />
                      </div>
                      <Button size="sm" onClick={() => { handleAddSubItem('add_hotel_mapping', hotelForm); setHotelForm({ hotel_name: '', star_category: '4 Star', priority: 1, distance_from_center_km: 1.5 }); }} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">
                        Map Hotel
                      </Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {selectedDest.hotels?.map((h: any) => (
                        <div key={h.id} className="py-2 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-xs text-foreground">{h.hotel_name}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({h.star_category} · {h.distance_from_center_km} km from center)</span>
                          </div>
                          <button onClick={() => handleDeleteSubItem('delete_hotel_mapping', h.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB: Restaurants */}
                  <TabsContent value="restaurants" className="m-0 space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-[#C9A25A]" /> Map Restaurant:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <Input placeholder="Restaurant Name" value={restaurantForm.restaurant_name} onChange={e => setRestaurantForm({...restaurantForm, restaurant_name: e.target.value})} className="h-8 text-xs" />
                        <Input placeholder="Cuisine (e.g. Italian)" value={restaurantForm.cuisine} onChange={e => setRestaurantForm({...restaurantForm, cuisine: e.target.value})} className="h-8 text-xs" />
                        <Input placeholder="Meal Type (e.g. Fine Dining)" value={restaurantForm.meal_type} onChange={e => setRestaurantForm({...restaurantForm, meal_type: e.target.value})} className="h-8 text-xs" />
                        <Input type="number" placeholder="Approx Cost (₹)" value={restaurantForm.approx_cost || ''} onChange={e => setRestaurantForm({...restaurantForm, approx_cost: parseFloat(e.target.value)})} className="h-8 text-xs font-mono" />
                      </div>
                      <Button size="sm" onClick={() => { handleAddSubItem('add_restaurant_mapping', restaurantForm); setRestaurantForm({ restaurant_name: '', cuisine: 'Continental', meal_type: 'Fine Dining', approx_cost: 1200, is_veg: 0 }); }} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">
                        Map Restaurant
                      </Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {selectedDest.restaurants?.map((r: any) => (
                        <div key={r.id} className="py-2 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-xs text-foreground">{r.restaurant_name}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({r.cuisine} · {r.meal_type} · Approx ₹{r.approx_cost})</span>
                          </div>
                          <button onClick={() => handleDeleteSubItem('delete_restaurant_mapping', r.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB: Shopping */}
                  <TabsContent value="shopping" className="m-0 space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-[#C9A25A]" /> Map Shopping Spot:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input placeholder="Market / Mall Name" value={shoppingForm.shopping_name} onChange={e => setShoppingForm({...shoppingForm, shopping_name: e.target.value})} className="h-8 text-xs" />
                        <select value={shoppingForm.category} onChange={e => setShoppingForm({...shoppingForm, category: e.target.value})} className="h-8 text-xs border rounded px-2 bg-background">
                          <option value="Luxury Mall">Luxury Mall</option>
                          <option value="Street Market">Street Market</option>
                          <option value="Souvenir Shop">Souvenir Shop</option>
                          <option value="Outlet Mall">Outlet Mall</option>
                        </select>
                        <Input placeholder="Recommended For" value={shoppingForm.recommended_for} onChange={e => setShoppingForm({...shoppingForm, recommended_for: e.target.value})} className="h-8 text-xs" />
                      </div>
                      <Button size="sm" onClick={() => { handleAddSubItem('add_shopping_mapping', shoppingForm); setShoppingForm({ shopping_name: '', category: 'Street Market', recommended_for: 'Souvenirs' }); }} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">
                        Map Shopping Spot
                      </Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {selectedDest.shopping?.map((s: any) => (
                        <div key={s.id} className="py-2 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-xs text-foreground">{s.shopping_name}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({s.category} · Rec: {s.recommended_for})</span>
                          </div>
                          <button onClick={() => handleDeleteSubItem('delete_shopping_mapping', s.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB: Relationships */}
                  <TabsContent value="relationships" className="m-0 space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-[#C9A25A]" /> Add Nearby / Day Trip Relationship:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <select value={relationshipForm.related_destination_id} onChange={e => setRelationshipForm({...relationshipForm, related_destination_id: e.target.value})} className="h-8 text-xs border rounded px-2 bg-background">
                          <option value="">Select Destination</option>
                          {flatDestinations.filter(d => d.id !== selectedDestId).map(d => (
                            <option key={d.id} value={d.id}>{d.city} ({d.destination_type})</option>
                          ))}
                        </select>
                        <select value={relationshipForm.relationship_type} onChange={e => setRelationshipForm({...relationshipForm, relationship_type: e.target.value})} className="h-8 text-xs border rounded px-2 bg-background">
                          <option value="Day Trip">Day Trip</option>
                          <option value="Nearby">Nearby</option>
                          <option value="Twin Destination">Twin Destination</option>
                          <option value="Same Region">Same Region</option>
                          <option value="Transit Point">Transit Point</option>
                        </select>
                        <Input type="number" placeholder="Distance (km)" value={relationshipForm.distance_km || ''} onChange={e => setRelationshipForm({...relationshipForm, distance_km: parseFloat(e.target.value)})} className="h-8 text-xs font-mono" />
                        <Input type="number" placeholder="Travel Time (mins)" value={relationshipForm.travel_time_mins || ''} onChange={e => setRelationshipForm({...relationshipForm, travel_time_mins: parseInt(e.target.value)})} className="h-8 text-xs font-mono" />
                      </div>
                      <Button size="sm" onClick={() => { handleAddSubItem('add_relationship', relationshipForm); setRelationshipForm({ related_destination_id: '', relationship_type: 'Day Trip', distance_km: 32, travel_time_mins: 40 }); }} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">
                        Add Relationship
                      </Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {selectedDest.relationships?.map((rel: any) => (
                        <div key={rel.id} className="py-2 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-xs text-foreground">{rel.related_city}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({rel.relationship_type} · {rel.distance_km} km · {rel.travel_time_mins} mins)</span>
                          </div>
                          <button onClick={() => handleDeleteSubItem('delete_relationship', rel.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB: External IDs */}
                  <TabsContent value="external" className="m-0 space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-[#C9A25A]" /> Map External Provider ID:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select value={externalIdForm.provider} onChange={e => setExternalIdForm({...externalIdForm, provider: e.target.value})} className="h-8 text-xs border rounded px-2 bg-background font-semibold">
                          {['Google Places', 'TripAdvisor', 'Viator', 'Booking.com', 'Hotelbeds', 'Travelport', 'Amadeus', 'TBO', 'TripJack'].map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        <Input placeholder="External Provider ID (e.g. ChIJ5T-w743u10cR...)" value={externalIdForm.external_id} onChange={e => setExternalIdForm({...externalIdForm, external_id: e.target.value})} className="h-8 text-xs font-mono" />
                      </div>
                      <Button size="sm" onClick={() => { handleAddSubItem('add_external_id', externalIdForm); setExternalIdForm({ provider: 'Google Places', external_id: '' }); }} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">
                        Map External ID
                      </Button>
                    </div>

                    <div className="divide-y divide-border/40">
                      {selectedDest.external_ids?.map((ex: any) => (
                        <div key={ex.id} className="py-2 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-xs text-foreground">{ex.provider}</span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">ID: {ex.external_id}</span>
                          </div>
                          <button onClick={() => handleDeleteSubItem('delete_external_id', ex.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB 5: Visa & Weather */}
                  <TabsContent value="visa" className="m-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Visa Card */}
                      <Card className="border border-border/60 shadow-sm p-4 space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-[#C9A25A]" /> Visa Requirements
                        </h4>
                        <div className="space-y-2">
                          <Input placeholder="Processing Days" type="number" value={visaForm.processing_days} onChange={e => setVisaForm({...visaForm, processing_days: parseInt(e.target.value)})} className="h-8 text-xs" />
                          <Input placeholder="Visa Fee (₹)" type="number" value={visaForm.visa_fee} onChange={e => setVisaForm({...visaForm, visa_fee: parseFloat(e.target.value)})} className="h-8 text-xs font-mono" />
                          <Textarea placeholder="Documents Required" value={visaForm.documents_required} onChange={e => setVisaForm({...visaForm, documents_required: e.target.value})} className="text-xs" rows={2} />
                          <Button size="sm" onClick={() => handleAddSubItem('save_visa', visaForm)} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">Save Visa</Button>
                        </div>
                      </Card>

                      {/* Weather Card */}
                      <Card className="border border-border/60 shadow-sm p-4 space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                          <Sun className="w-4 h-4 text-amber-500" /> Climate & Weather
                        </h4>
                        <div className="space-y-2">
                          <Input placeholder="Best Months (e.g. May - Oct)" value={weatherForm.best_months} onChange={e => setWeatherForm({...weatherForm, best_months: e.target.value})} className="h-8 text-xs" />
                          <Input placeholder="Average Temp (°C)" value={weatherForm.avg_temp_c} onChange={e => setWeatherForm({...weatherForm, avg_temp_c: e.target.value})} className="h-8 text-xs" />
                          <Input placeholder="Peak Season" value={weatherForm.peak_season} onChange={e => setWeatherForm({...weatherForm, peak_season: e.target.value})} className="h-8 text-xs" />
                          <Button size="sm" onClick={() => handleAddSubItem('save_weather', weatherForm)} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">Save Weather</Button>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* TAB 6: Media Library */}
                  <TabsContent value="media" className="m-0 space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-[#C9A25A]" /> Add Photo URL:
                      </span>
                      <div className="flex gap-2">
                        <Input placeholder="https://images.unsplash.com/..." value={mediaForm.image_url} onChange={e => setMediaForm({...mediaForm, image_url: e.target.value})} className="h-8 text-xs flex-1" />
                        <Button size="sm" onClick={() => { handleAddSubItem('add_media', mediaForm); setMediaForm({ image_url: '', caption: '', is_featured: 0 }); }} className="h-8 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">Add Image</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedDest.media?.map((m: any) => (
                        <div key={m.id} className="relative rounded-xl overflow-hidden border border-border/40 group">
                          <img src={m.image_url} alt={m.caption || 'Destination photo'} className="w-full h-24 object-cover" />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB 7: Internal Notes */}
                  <TabsContent value="notes" className="m-0 space-y-4">
                    <div className="space-y-2">
                      <Textarea placeholder="Add internal consultant note or operational guidance..." value={noteText} onChange={e => setNoteText(e.target.value)} className="text-xs" rows={2} />
                      <Button size="sm" onClick={() => { handleAddSubItem('add_note', { note_text: noteText }); setNoteText(''); }} className="h-7 text-xs bg-[#C9A25A] text-[#0B1026] font-bold">Add Note</Button>
                    </div>
                    <div className="space-y-2">
                      {selectedDest.notes?.map((n: any) => (
                        <div key={n.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                          {n.note_text}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* TAB 8: Audit Trail */}
                  <TabsContent value="audit" className="m-0 space-y-2">
                    {selectedDest.audit_logs?.map((al: any) => (
                      <div key={al.id} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between">
                        <span>{al.new_value}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{new Date(al.changed_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </TabsContent>
                </div>
              </Tabs>
            </>
          )}
        </Card>
      </div>

      {/* Add Destination Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C9A25A]" /> Add New Destination
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new city, state, or country entity to the Master catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-3">
            <div>
              <Label className="text-[10px] font-bold uppercase">Destination Type</Label>
              <select 
                value={formData.destination_type}
                onChange={(e) => setFormData({...formData, destination_type: e.target.value as DestinationType})}
                className="w-full text-xs h-9 border border-border rounded px-2 bg-background font-semibold"
              >
                {DESTINATION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-[10px] font-bold uppercase">Parent Destination</Label>
              <select 
                value={formData.parent_destination_id}
                onChange={(e) => setFormData({...formData, parent_destination_id: e.target.value})}
                className="w-full text-xs h-9 border border-border rounded px-2 bg-background font-semibold"
              >
                <option value="">None (Top Level Country)</option>
                {flatDestinations.map(d => (
                  <option key={d.id} value={d.id}>{d.city} ({d.destination_type})</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-[10px] font-bold uppercase">City / Destination Name *</Label>
              <Input 
                required 
                placeholder="e.g. Hallstatt or Colmar" 
                value={formData.city} 
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="h-9 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] font-bold uppercase">IATA Code</Label>
                <Input 
                  placeholder="e.g. ZRH" 
                  value={formData.iata_code} 
                  onChange={(e) => setFormData({...formData, iata_code: e.target.value})}
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase">Rec. Stay (Nights)</Label>
                <Input 
                  type="number" 
                  value={formData.recommended_nights} 
                  onChange={(e) => setFormData({...formData, recommended_nights: parseInt(e.target.value) || 1})}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)} className="text-xs font-bold">Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] text-[#0B1026] text-xs font-extrabold">Save Destination</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4-Tier AI Smart Assistant Modal */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-purple-600">
              <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" /> 4-Tier AI Content Generator
            </DialogTitle>
            <DialogDescription className="text-xs">
              Generate destination profile, attractions, activities, and sample itineraries in seconds.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[10px] font-bold uppercase">Target City / Destination Name *</Label>
              <Input 
                required 
                placeholder="e.g. Hallstatt, Colmar, Zermatt" 
                value={aiCityInput} 
                onChange={(e) => setAiCityInput(e.target.value)}
                className="h-9 text-xs font-bold"
              />
            </div>

            <div>
              <Label className="text-[10px] font-bold uppercase mb-1.5 block">AI Generator Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { mode: 'Basic', label: '1. AI Basic Profile', desc: 'IATA, airport, stay, climate' },
                  { mode: 'Attractions', label: '2. AI Attractions', desc: 'Popular tourist spots & visit times' },
                  { mode: 'Activities', label: '3. AI Excursions', desc: 'Bookable tours & costs' },
                  { mode: 'Complete', label: '4. AI Complete', desc: 'Full profile + all inventory' }
                ].map(item => (
                  <div 
                    key={item.mode}
                    onClick={() => setAiMode(item.mode as any)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      aiMode === item.mode 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold' 
                        : 'border-border/60 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAiModalOpen(false)} className="text-xs font-bold">Cancel</Button>
            <Button 
              type="button" 
              onClick={handleAiGenerate}
              disabled={aiGenerating || !aiCityInput}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold"
            >
              {aiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
              Generate {aiMode}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
