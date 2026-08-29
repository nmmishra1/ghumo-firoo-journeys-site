import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { auditLogger } from '@/services/auditLogger';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  UploadCloud, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle,
  Landmark, Car, MapPin, Activity, Users, RefreshCw, FileText, ArrowRight, Sparkles, Check, Trash2, Edit3, Globe
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { 'Authorization': `Bearer ${session.access_token}` };
  }
  return {};
}

// ─── TEMPLATES & SCHEMAS DEFINITION ──────────────────────────────────────────

type ModuleType = 'hotels' | 'cabs' | 'sightseeing' | 'activities' | 'leads';

interface ColumnDef {
  key: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'number' | 'boolean';
}

interface ModuleConfig {
  id: ModuleType;
  title: string;
  description: string;
  icon: any;
  endpointTable: string;
  requiredFields: string[];
  columns: ColumnDef[];
  sampleCsv: string;
}

const MODULE_CONFIGS: Record<ModuleType, ModuleConfig> = {
  hotels: {
    id: 'hotels',
    title: 'Hotels & Room Rates',
    description: 'Bulk import hotel masters, room categories, meal plans, contracted seasonal rates & GST config.',
    icon: Landmark,
    endpointTable: 'hotels',
    requiredFields: ['hotel_name', 'destination', 'double_rate'],
    columns: [
      { key: 'hotel_name', label: 'Hotel Name', required: true },
      { key: 'hotel_code', label: 'Hotel Code' },
      { key: 'destination', label: 'Destination / City', required: true },
      { key: 'star_rating', label: 'Star Rating', type: 'number' },
      { key: 'address', label: 'Address' },
      { key: 'contact_number', label: 'Contact Phone' },
      { key: 'email', label: 'Email' },
      { key: 'supplier_name', label: 'Supplier Name' },
      { key: 'room_category', label: 'Room Category' },
      { key: 'meal_plan', label: 'Meal Plan (CP/MAP/AP/EP)' },
      { key: 'single_rate', label: 'Single Rate', type: 'number' },
      { key: 'double_rate', label: 'Double Rate', required: true, type: 'number' },
      { key: 'triple_rate', label: 'Triple Rate', type: 'number' },
      { key: 'extra_adult_rate', label: 'Extra Adult', type: 'number' },
      { key: 'child_bed_rate', label: 'Child Bed', type: 'number' },
      { key: 'child_no_bed_rate', label: 'Child No Bed', type: 'number' },
      { key: 'gst_percentage', label: 'GST %', type: 'number' },
      { key: 'gst_included', label: 'GST Included (true/false)', type: 'boolean' },
      { key: 'markup', label: 'Markup (₹)', type: 'number' }
    ],
    sampleCsv: `hotel_name,hotel_code,destination,star_rating,address,contact_number,email,supplier_name,room_category,meal_plan,single_rate,double_rate,triple_rate,extra_adult_rate,child_bed_rate,child_no_bed_rate,gst_percentage,gst_included,markup
Tent City Dhordo,HOT-DH-01,Dhordo Kutch,5,Dhordo White Rann Road,9910987264,info@tentcity.com,White Rann Hospitality,Super Deluxe Tent,AP,7000,7999,10500,2500,1800,1000,12,false,500
Taj Gateway Cochin,HOT-CO-02,Cochin,5,Marine Drive Cochin,9876543210,res@tajgateway.com,Taj Hotels,Standard Deluxe,CP,5500,6500,8500,2000,1500,800,12,true,600
Alka Hotel Haridwar,HOT-HD-03,Haridwar,3,Ghat Road Haridwar,9898989898,contact@alkahotel.com,Garhwal Stays,Deluxe Room,CP,2800,3500,4500,1000,800,500,12,false,400`
  },

  cabs: {
    id: 'cabs',
    title: 'Cabs & Contracted Rates',
    description: 'Bulk upload cab supplier contracts, vehicle fleets, source-destination routes, and rate slabs (Per KM, Per Day, Block Circuit).',
    icon: Car,
    endpointTable: 'cab_contract_rates',
    requiredFields: ['supplier_name', 'vehicle_type', 'source_city', 'destination_city', 'rate_model'],
    columns: [
      { key: 'supplier_name', label: 'Supplier Name', required: true },
      { key: 'supplier_code', label: 'Supplier Code' },
      { key: 'vehicle_type', label: 'Vehicle Type (Dzire/Innova/TT)', required: true },
      { key: 'vehicle_category', label: 'Category' },
      { key: 'capacity_adults', label: 'Capacity Adults', type: 'number' },
      { key: 'source_city', label: 'Source City / Station', required: true },
      { key: 'destination_city', label: 'Destination / Route', required: true },
      { key: 'route_type', label: 'Route Type' },
      { key: 'season', label: 'Season' },
      { key: 'rate_model', label: 'Rate Model (Per KM/Per Day/Block Circuit)', required: true },
      { key: 'rate_per_km', label: 'Rate / KM (₹)', type: 'number' },
      { key: 'min_km_per_day', label: 'Min KM / Day', type: 'number' },
      { key: 'daily_rate', label: 'Daily Rate (₹)', type: 'number' },
      { key: 'block_circuit_cost', label: 'Block Circuit Cost (₹)', type: 'number' },
      { key: 'block_circuit_km', label: 'Block Circuit KM', type: 'number' },
      { key: 'block_circuit_nights', label: 'Block Duration (e.g. 3N/4D)' },
      { key: 'transfer_cost', label: 'Transfer Cost (₹)', type: 'number' },
      { key: 'driver_allowance', label: 'Driver Allowance', type: 'number' },
      { key: 'gst_included', label: 'GST Included (true/false)', type: 'boolean' },
      { key: 'gst_percentage', label: 'GST %', type: 'number' },
      { key: 'markup_percentage', label: 'Markup %', type: 'number' }
    ],
    sampleCsv: `supplier_name,supplier_code,vehicle_type,vehicle_category,capacity_adults,source_city,destination_city,route_type,season,rate_model,rate_per_km,min_km_per_day,daily_rate,block_circuit_cost,block_circuit_km,block_circuit_nights,transfer_cost,driver_allowance,gst_included,gst_percentage,markup_percentage
Kutch Desert Cabs,CAB-SUP-01,Swift Dzire,Standard,4,Bhuj Railway Station,Dhordo Tent City,Intercity Transfer,Peak Season,Per KM,14,300,3500,0,0,,1200,300,false,5,10
Kutch Desert Cabs,CAB-SUP-01,Innova Crysta,Premium,7,Bhuj Railway Station,Dhordo Tent City,Intercity Transfer,Peak Season,Per KM,22,300,5500,0,0,,2200,300,false,5,10
Kerala Tour Cabs,CAB-SUP-02,Innova Crysta,Premium,6,Cochin Airport,Cochin Munnar Circuit,Multi-Day Tour,Peak Season,Block Circuit,0,0,0,16000,600,3N/4D,0,300,false,5,10
Garhwal Pilgrimage Cabs,CAB-SUP-03,Swift Dzire,Standard,4,Haridwar,Char Dham Circuit,Multi-Day Tour,Peak Season,Per Day,0,250,3500,37500,1000,10D/9N,0,300,false,5,10`
  },

  sightseeing: {
    id: 'sightseeing',
    title: 'Sightseeing Master',
    description: 'Bulk upload sightseeing spots, tour descriptions, durations, supplier costs, selling rates, and inclusions.',
    icon: MapPin,
    endpointTable: 'sightseeings',
    requiredFields: ['sightseeing_name', 'destination', 'selling_cost'],
    columns: [
      { key: 'sightseeing_name', label: 'Sightseeing Name', required: true },
      { key: 'sightseeing_code', label: 'Code' },
      { key: 'destination', label: 'Destination', required: true },
      { key: 'category', label: 'Category' },
      { key: 'sub_category', label: 'Sub-Category' },
      { key: 'duration', label: 'Duration' },
      { key: 'is_half_day', label: 'Is Half Day', type: 'boolean' },
      { key: 'is_full_day', label: 'Is Full Day', type: 'boolean' },
      { key: 'vehicle_required', label: 'Vehicle Needed', type: 'boolean' },
      { key: 'supplier_name', label: 'Supplier' },
      { key: 'supplier_cost', label: 'Supplier Cost', type: 'number' },
      { key: 'selling_cost', label: 'Selling Cost', required: true, type: 'number' },
      { key: 'adult_cost', label: 'Adult Cost', type: 'number' },
      { key: 'child_cost', label: 'Child Cost', type: 'number' },
      { key: 'gst_included', label: 'GST Included', type: 'boolean' },
      { key: 'gst_percentage', label: 'GST %', type: 'number' },
      { key: 'description', label: 'Description' }
    ],
    sampleCsv: `sightseeing_name,sightseeing_code,destination,category,sub_category,duration,is_half_day,is_full_day,vehicle_required,supplier_name,supplier_cost,selling_cost,adult_cost,child_cost,gst_included,gst_percentage,description
White Rann Sunrise Walk,SIGHT-RN-01,Dhordo Kutch,City Tour,Sunrise Tour,3 Hours,true,false,false,White Rann Guides,500,800,800,400,false,5,Early morning sunrise walk on the salt flats of White Rann.
Mattupetty Dam & Lake,SIGHT-KL-02,Munnar,Nature & Wildlife,Lake View,Half Day,true,false,true,Kerala Tours,600,950,950,500,false,5,Boating and scenic hill views at Mattupetty Dam.
Badrinath Temple Darshan,SIGHT-UK-03,Badrinath,Spiritual & Cultural,Temple Visit,3 Hours,true,false,false,Garhwal Pilgrimage,400,650,650,350,false,5,VIP Darshan line assistance at Badrinath Temple.`
  },

  activities: {
    id: 'activities',
    title: 'Activity Master',
    description: 'Bulk upload adventure sports, water sports, safaris, cultural shows, supplier costs, and per-person rates.',
    icon: Activity,
    endpointTable: 'activities',
    requiredFields: ['activity_name', 'destination', 'selling_cost'],
    columns: [
      { key: 'activity_name', label: 'Activity Name', required: true },
      { key: 'activity_code', label: 'Activity Code' },
      { key: 'destination', label: 'Destination', required: true },
      { key: 'activity_category', label: 'Category' },
      { key: 'sub_category', label: 'Sub-Category' },
      { key: 'duration', label: 'Duration' },
      { key: 'activity_type', label: 'Type (Outdoor/Indoor)' },
      { key: 'supplier_name', label: 'Supplier Name' },
      { key: 'supplier_cost', label: 'Supplier Cost', type: 'number' },
      { key: 'selling_cost', label: 'Selling Cost', required: true, type: 'number' },
      { key: 'adult_cost', label: 'Adult Cost', type: 'number' },
      { key: 'child_cost', label: 'Child Cost', type: 'number' },
      { key: 'gst_included', label: 'GST Included', type: 'boolean' },
      { key: 'gst_percentage', label: 'GST %', type: 'number' },
      { key: 'description', label: 'Description' }
    ],
    sampleCsv: `activity_name,activity_code,destination,activity_category,sub_category,duration,activity_type,supplier_name,supplier_cost,selling_cost,adult_cost,child_cost,gst_included,gst_percentage,description
Paramotoring at White Rann,ACT-RN-01,Dhordo Kutch,Adventure,Aviation Adventure,15 Mins,Outdoor,Kutch Aero Sports,2500,3200,3200,2000,false,5,Fly over the salt desert with trained pilot.
Periyar Elephant Safari,ACT-KL-02,Thekkady,Nature & Wildlife,Wildlife Safari,2 Hours,Outdoor,Periyar Eco Tours,1200,1800,1800,1000,false,5,Elephant ride and interaction in Periyar forest.
Ganga River Rafting 16KM,ACT-UK-03,Rishikesh,Water Sports,Rafting,3 Hours,Outdoor,Himalayan Adventures,800,1200,1200,800,false,5,Shivpuri to Rishikesh 16km thrilling river rafting.`
  },

  leads: {
    id: 'leads',
    title: 'Leads & Enquiries',
    description: 'Bulk upload customer enquiries, travel interests, follow-up dates, and contact records.',
    icon: Users,
    endpointTable: 'leads',
    requiredFields: ['customer_name', 'contact_number', 'customer_type'],
    columns: [
      { key: 'customer_name', label: 'Customer Name', required: true },
      { key: 'contact_number', label: 'Contact Phone', required: true },
      { key: 'email', label: 'Email' },
      { key: 'customer_type', label: 'Source / Type', required: true },
      { key: 'tour_description', label: 'Tour Interest' },
      { key: 'call_summary', label: 'Call Notes' },
      { key: 'assigned_to', label: 'Assigned Agent' },
      { key: 'follow_up_date', label: 'Follow Up Date' }
    ],
    sampleCsv: `customer_name,contact_number,email,customer_type,tour_description,call_summary,assigned_to,follow_up_date
Rajesh Sharma,9811223344,rajesh@gmail.com,Direct Customer,Rann Utsav 2D/1N package for 4 adults,Inquired about White Rann tent city rates,Admin,2026-08-15
Priya Menon,9844556677,priya@menon.com,Phone,Kerala 5N/6D luxury honeymoon,Wants Innova cab and 5-star resort in Munnar,Admin,2026-08-14
Amitabh Joshi,9877889900,ajoshi@yahoo.com,Facebook,Char Dham 10D yatra for 6 family members,Requires Tempo Traveller with VIP darshan,Admin,2026-08-16`
  },

  packages: {
    id: 'packages',
    title: 'Tour Packages Master',
    description: 'Bulk import tour package master templates, prices, durations, destinations, inclusions & highlights.',
    icon: FileSpreadsheet,
    endpointTable: 'packages',
    requiredFields: ['name', 'price', 'duration'],
    columns: [
      { key: 'name', label: 'Package Title / Name', required: true },
      { key: 'slug', label: 'URL Slug' },
      { key: 'price', label: 'Starting Price (₹)', required: true, type: 'number' },
      { key: 'duration', label: 'Duration (e.g. 5D/4N)', required: true },
      { key: 'category', label: 'Category / Region' },
      { key: 'destinations', label: 'Destinations Covered' },
      { key: 'highlights', label: 'Key Highlights' },
      { key: 'inclusions', label: 'Package Inclusions' },
      { key: 'exclusions', label: 'Package Exclusions' },
      { key: 'tagline', label: 'Tagline / Short Summary' }
    ],
    sampleCsv: `name,slug,price,duration,category,destinations,highlights,inclusions,exclusions,tagline
Rann Utsav Tent City Special,rann-utsav-tent-city,7999,3D/2N,Gujarat,Bhuj & Dhordo,"White Rann Sunset, Folk Dance, Camel Safari","Swiss AC Tent, All Meals, Bhuj Transfers",Personal Expenses,Experience the magical White Rann under full moon
Char Dham Helicopter Yatra,char-dham-helicopter,195000,6D/5N,Pilgrimage,Kedarnath & Badrinath,"VIP Darshan Tokens, Sahastradhara Chopper, 5-Star SUV","Helicopter Charter, 5-Star Hotel, Satvik Meals",Flight to Dehradun,Divine pilgrimage with zero queue waiting`
  }
};

// ─── CSV PARSER UTILITY ──────────────────────────────────────────────────────

function parseCsvContent(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length === 0) return { headers: [], rows: [] };

  const splitCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let field = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQ = !inQ;
      } else if (c === ',' && !inQ) {
        result.push(field.trim().replace(/^"|"$/g, ''));
        field = '';
      } else {
        field += c;
      }
    }
    result.push(field.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = splitCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    if (values.length === 1 && values[0] === '') continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

const normalizeModuleKey = (modKey?: string): ModuleType => {
  if (!modKey) return 'hotels';
  const k = modKey.toLowerCase().trim();
  if (k.includes('hotel')) return 'hotels';
  if (k.includes('cab')) return 'cabs';
  if (k.includes('sight')) return 'sightseeings';
  if (k.includes('activit')) return 'activities';
  if (k.includes('package')) return 'packages';
  if (k.includes('lead')) return 'leads';
  return 'hotels';
};

export const BulkUploadHub: React.FC<{ initialModule?: any }> = ({ initialModule = 'hotels' }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeModule, setActiveModule] = useState<ModuleType>(normalizeModuleKey(initialModule));

  useEffect(() => {
    if (initialModule) {
      setActiveModule(normalizeModuleKey(initialModule));
    }
  }, [initialModule]);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logs, setLogs] = useState<{ type: 'info' | 'success' | 'error'; message: string }[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const currentConfig = MODULE_CONFIGS[activeModule] || MODULE_CONFIGS['hotels'];

  // Handle Tab Switch with Real-Time URL Auto-Updating
  const handleTabChange = (val: string) => {
    const mod = val as ModuleType;
    setActiveModule(mod);
    resetUploadState();

    let routeSlug = 'hotel';
    if (mod === 'cabs') routeSlug = 'cab';
    else if (mod === 'sightseeings') routeSlug = 'sightseeing';
    else if (mod === 'activities') routeSlug = 'activity';
    else if (mod === 'packages') routeSlug = 'package';
    else if (mod === 'leads') routeSlug = 'leads';

    navigate(`/crm/${routeSlug}/bulk-upload`, { replace: true });
  };

  const resetUploadState = () => {
    setFile(null);
    setParsedRows([]);
    setFileHeaders([]);
    setUploadProgress(0);
    setLogs([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const config = MODULE_CONFIGS[activeModule];
    const blob = new Blob([config.sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${config.id}_bulk_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: 'Template Downloaded',
      description: `Downloaded sample template for ${config.title}.`
    });
  };

  // Parse CSV File
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv') && selectedFile.type !== 'text/csv') {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid CSV file (.csv)',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
    try {
      const text = await selectedFile.text();
      const { headers, rows } = parseCsvContent(text);

      setFileHeaders(headers);

      // Validate rows
      const validated = rows.map((row, idx) => {
        const errors: string[] = [];
        currentConfig.requiredFields.forEach(reqKey => {
          if (!row[reqKey] || row[reqKey].trim() === '') {
            errors.push(`Missing "${reqKey}"`);
          }
        });

        return {
          _id: `row-${idx}`,
          _status: errors.length > 0 ? 'error' : 'valid',
          _errors: errors,
          ...row
        };
      });

      setParsedRows(validated);
      toast({
        title: 'File Parsed Successfully',
        description: `Found ${rows.length} records. ${validated.filter(r => r._status === 'valid').length} valid, ${validated.filter(r => r._status === 'error').length} with errors.`
      });
    } catch (err: any) {
      toast({
        title: 'Parsing Failed',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  // Edit row in preview table
  const handleCellChange = (rowId: string, key: string, value: string) => {
    setParsedRows(prev => prev.map(row => {
      if (row._id !== rowId) return row;
      const updatedRow = { ...row, [key]: value };
      const errors: string[] = [];
      currentConfig.requiredFields.forEach(reqKey => {
        if (!updatedRow[reqKey] || String(updatedRow[reqKey]).trim() === '') {
          errors.push(`Missing "${reqKey}"`);
        }
      });
      updatedRow._status = errors.length > 0 ? 'error' : 'valid';
      updatedRow._errors = errors;
      return updatedRow;
    }));
  };

  const handleDeleteRow = (rowId: string) => {
    setParsedRows(prev => prev.filter(r => r._id !== rowId));
  };

  // Run Bulk Import Engine
  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;

    const rowsToImport = parsedRows.filter(r => r._status === 'valid');
    if (rowsToImport.length === 0) {
      toast({
        title: 'No Valid Rows',
        description: 'All rows currently have validation errors. Please fix them or download a fresh template.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setLogs([{ type: 'info', message: `Starting bulk import of ${rowsToImport.length} records into ${currentConfig.title}...` }]);

    let successCount = 0;
    let failCount = 0;
    const authHeaders = await getAuthHeader();

    for (let i = 0; i < rowsToImport.length; i++) {
      const rawRow = rowsToImport[i];
      const { _id, _status, _errors, ...dataPayload } = rawRow;

      try {
        let ok = false;
        let errMsg = '';

        if (activeModule === 'sightseeing') {
          const payload = {
            sightseeing_name: dataPayload.sightseeing_name,
            sightseeing_code: dataPayload.sightseeing_code || `SIGHT-${Date.now().toString(36).toUpperCase()}`,
            destination: dataPayload.destination,
            category: dataPayload.category || 'City Tour',
            sub_category: dataPayload.sub_category || '',
            is_half_day: dataPayload.is_half_day === 'true' || dataPayload.is_half_day === '1',
            is_full_day: dataPayload.is_full_day === 'true' || dataPayload.is_full_day === '1',
            vehicle_required: dataPayload.vehicle_required === 'true' || dataPayload.vehicle_required === '1',
            duration: dataPayload.duration || 'Half Day',
            description: dataPayload.description || '',
            supplier_name: dataPayload.supplier_name || '',
            supplier_cost: parseFloat(dataPayload.supplier_cost) || 0,
            selling_cost: parseFloat(dataPayload.selling_cost) || 0,
            adult_cost: parseFloat(dataPayload.adult_cost) || parseFloat(dataPayload.selling_cost) || 0,
            child_cost: parseFloat(dataPayload.child_cost) || 0,
            gst_included: dataPayload.gst_included === 'true' || dataPayload.gst_included === '1',
            gst_percentage: parseFloat(dataPayload.gst_percentage) || 5,
            active_status: true
          };

          const res = await fetch(`${API_BASE}/api.php?table=sightseeings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(payload)
          });
          if (res.ok) ok = true;
          else {
            const errJson = await res.json().catch(() => ({}));
            errMsg = errJson.error || 'Server insert error';
          }
        } else if (activeModule === 'activities') {
          const payload = {
            activity_name: dataPayload.activity_name,
            activity_code: dataPayload.activity_code || `ACT-${Date.now().toString(36).toUpperCase()}`,
            destination: dataPayload.destination,
            activity_category: dataPayload.activity_category || 'Adventure',
            sub_category: dataPayload.sub_category || '',
            duration: dataPayload.duration || '1 Hour',
            activity_type: dataPayload.activity_type || 'Outdoor',
            supplier_name: dataPayload.supplier_name || '',
            supplier_cost: parseFloat(dataPayload.supplier_cost) || 0,
            selling_cost: parseFloat(dataPayload.selling_cost) || 0,
            adult_cost: parseFloat(dataPayload.adult_cost) || parseFloat(dataPayload.selling_cost) || 0,
            child_cost: parseFloat(dataPayload.child_cost) || 0,
            gst_included: dataPayload.gst_included === 'true' || dataPayload.gst_included === '1',
            gst_percentage: parseFloat(dataPayload.gst_percentage) || 5,
            description: dataPayload.description || '',
            active_status: true
          };

          const res = await fetch(`${API_BASE}/api.php?table=activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(payload)
          });
          if (res.ok) ok = true;
          else {
            const errJson = await res.json().catch(() => ({}));
            errMsg = errJson.error || 'Server insert error';
          }
        } else if (activeModule === 'hotels') {
          const hotelPayload = {
            hotel_name: dataPayload.hotel_name,
            hotel_code: dataPayload.hotel_code || `HOT-${Date.now().toString(36).toUpperCase()}`,
            destination: dataPayload.destination,
            star_rating: parseInt(dataPayload.star_rating) || 3,
            address: dataPayload.address || '',
            contact_number: dataPayload.contact_number || '',
            email: dataPayload.email || '',
            supplier_name: dataPayload.supplier_name || '',
            active_status: true
          };

          const res = await fetch(`${API_BASE}/api.php?table=hotels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(hotelPayload)
          });

          if (res.ok) {
            ok = true;
          } else {
            const { error: sbErr } = await supabase.from('hotels' as any).insert([hotelPayload] as any);
            if (!sbErr) ok = true;
            else errMsg = sbErr.message;
          }
        } else if (activeModule === 'cabs') {
          const cabPayload = {
            supplier_name: dataPayload.supplier_name,
            vehicle_type: dataPayload.vehicle_type,
            source_city: dataPayload.source_city,
            destination_city: dataPayload.destination_city,
            rate_model: dataPayload.rate_model || 'Per KM',
            rate_per_km: parseFloat(dataPayload.rate_per_km) || 0,
            min_km_per_day: parseFloat(dataPayload.min_km_per_day) || 300,
            daily_rate: parseFloat(dataPayload.daily_rate) || 0,
            block_circuit_cost: parseFloat(dataPayload.block_circuit_cost) || 0,
            block_circuit_km: parseFloat(dataPayload.block_circuit_km) || 0,
            block_circuit_nights: dataPayload.block_circuit_nights || '',
            transfer_cost: parseFloat(dataPayload.transfer_cost) || 0,
            driver_allowance: parseFloat(dataPayload.driver_allowance) || 300,
            gst_included: dataPayload.gst_included === 'true' || dataPayload.gst_included === '1',
            gst_percentage: parseFloat(dataPayload.gst_percentage) || 5,
            markup_percentage: parseFloat(dataPayload.markup_percentage) || 10
          };

          const res = await fetch(`${API_BASE}/api.php?table=cab_contract_rates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(cabPayload)
          });
          if (res.ok) ok = true;
          else {
            const errJson = await res.json().catch(() => ({}));
            errMsg = errJson.error || 'Cab rate insert error';
          }
        } else if (activeModule === 'packages') {
          const pkgName = dataPayload.name || dataPayload.title || dataPayload.package_name || 'Imported Package';
          const pkgPayload = {
            name: pkgName,
            package_name: pkgName,
            title: pkgName,
            slug: dataPayload.slug || pkgName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            price: parseFloat(dataPayload.price) || 0,
            duration: dataPayload.duration || '3 Days / 2 Nights',
            category: dataPayload.category || 'Domestic',
            destinations: dataPayload.destinations || '',
            highlights: dataPayload.highlights || '',
            inclusions: dataPayload.inclusions || '',
            exclusions: dataPayload.exclusions || '',
            tagline: dataPayload.tagline || '',
            is_active: 1
          };

          const res = await fetch(`${API_BASE}/api.php?table=packages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(pkgPayload)
          });
          if (res.ok) ok = true;
          else {
            const { error: sbErr } = await supabase.from('packages' as any).insert([pkgPayload] as any);
            if (!sbErr) ok = true;
            else errMsg = sbErr.message || 'Package insert failed';
          }
        } else if (activeModule === 'leads') {
          const leadPayload = {
            customer_name: dataPayload.customer_name,
            contact_number: dataPayload.contact_number,
            email: dataPayload.email || null,
            customer_type: dataPayload.customer_type || 'Direct Customer',
            tour_description: dataPayload.tour_description || null,
            call_summary: dataPayload.call_summary || 'Bulk imported enquiry',
            status: 'New',
            assigned_to: dataPayload.assigned_to || 'Admin'
          };

          const { error: sbErr } = await supabase.from('leads').insert([leadPayload] as any);
          if (!sbErr) ok = true;
          else errMsg = sbErr.message;
        }

        if (ok) {
          successCount++;
          setLogs(prev => [...prev, { type: 'success', message: `Row ${i + 1}: Imported ${dataPayload.hotel_name || dataPayload.sightseeing_name || dataPayload.activity_name || dataPayload.vehicle_type || dataPayload.customer_name || 'Record'}` }]);
        } else {
          failCount++;
          setLogs(prev => [...prev, { type: 'error', message: `Row ${i + 1} Failed: ${errMsg}` }]);
        }
      } catch (err: any) {
        failCount++;
        setLogs(prev => [...prev, { type: 'error', message: `Row ${i + 1} Error: ${err.message}` }]);
      }

      setUploadProgress(Math.round(((i + 1) / rowsToImport.length) * 100));
    }

    setIsProcessing(false);
    setImportResult({ success: successCount, failed: failCount });

    const { data: { user } } = await supabase.auth.getUser();
    auditLogger.log({
      user_email: user?.email || 'admin@ghumofiroo.com',
      user_name: user?.user_metadata?.full_name || 'Admin User',
      action: 'BULK_IMPORT',
      module: currentConfig.id === 'hotels' ? 'Hotels' : currentConfig.id === 'cabs' ? 'Cabs' : currentConfig.id === 'sightseeing' ? 'Sightseeing' : currentConfig.id === 'activities' ? 'Activities' : 'Leads',
      target_name: `${currentConfig.title} Bulk Import (${file?.name || 'CSV'})`,
      old_value: '0 Records',
      new_value: `${successCount} Imported (${failCount} Failed)`,
      details: `Bulk imported ${successCount} records into ${currentConfig.endpointTable}`
    });

    toast({
      title: 'Bulk Import Completed',
      description: `Successfully imported ${successCount} records. ${failCount > 0 ? `${failCount} failed.` : ''}`
    });
  };

  const validCount = parsedRows.filter(r => r._status === 'valid').length;
  const errorCount = parsedRows.filter(r => r._status === 'error').length;

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 text-left">
      


      {/* TOP BANNER & ACTION HEADER */}
      <Card className="border border-slate-800 bg-[#161d2f] text-slate-100 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-800 bg-[#0f1420] space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Universal Data Import Engine
              </div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2 mt-1.5 text-slate-100">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" /> Universal Bulk Data Import Center
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 font-medium mt-0.5">
                Upload CSV spreadsheets for Hotels, Cabs, Sightseeing, Activities, and CRM Leads with instant validation.
              </CardDescription>
            </div>

            <Button
              onClick={handleDownloadTemplate}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-9 px-4 rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" /> Download Sample CSV Template
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-6">
          <Tabs value={activeModule} onValueChange={handleTabChange} className="w-full space-y-6">
            
            {/* Module Switcher Tabs Navigation */}
            <TabsList className="bg-[#0b0f19] p-1.5 rounded-2xl border border-white/10 flex flex-wrap gap-2 h-auto w-full">
              <TabsTrigger 
                value="hotels" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 text-slate-300 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <Landmark className="w-4 h-4" /> Hotels & Contracts
              </TabsTrigger>
              <TabsTrigger 
                value="cabs" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 text-slate-300 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <Car className="w-4 h-4" /> Cabs & Vehicles
              </TabsTrigger>
              <TabsTrigger 
                value="sightseeings" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 text-slate-300 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <MapPin className="w-4 h-4" /> Sightseeing Stations
              </TabsTrigger>
              <TabsTrigger 
                value="activities" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 text-slate-300 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <Activity className="w-4 h-4" /> Activities & Excursions
              </TabsTrigger>
              <TabsTrigger 
                value="packages" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 text-slate-300 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" /> Tour Packages
              </TabsTrigger>
              <TabsTrigger 
                value="leads" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#c5a059] data-[state=active]:to-[#d4af37] data-[state=active]:text-slate-950 text-slate-300 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <Users className="w-4 h-4" /> Sales Leads
              </TabsTrigger>
            </TabsList>
            
            {/* Active Module Header Info */}
            <div className="bg-[#0f1420] p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
                  <currentConfig.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-100">{currentConfig.title} Bulk Import</h3>
                  <p className="text-xs text-slate-400 font-semibold">{currentConfig.description}</p>
                </div>
              </div>

              <Badge variant="outline" className="border-amber-500/30 text-amber-400 font-mono text-[10px] font-extrabold">
                Endpoint: {currentConfig.endpointTable}
              </Badge>
            </div>

            {/* Upload & Dropzone Area */}
            {!file ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-[#0f1420]/80 hover:bg-amber-500/10 transition-all rounded-2xl p-10 text-center cursor-pointer space-y-4 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-100">
                      Click or Drag & Drop your <span className="text-amber-400 uppercase font-black">{currentConfig.title}</span> CSV file here
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Supports standard UTF-8 .csv files with header row
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-bold">
                    Mandatory columns required: {currentConfig.requiredFields.join(' *, ')} *
                  </div>
                </div>

                {/* 📌 MANDATORY FIELDS CHEAT SHEET CARD */}
                <div className="p-4 bg-[#0f1420] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mandatory Fields & CSV Formatting Guide
                    </span>
                    <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-300 font-extrabold">Schema Validated</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {currentConfig.columns.map(col => (
                      <div key={col.key} className={`p-2 rounded-lg border ${col.required ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-300'}`}>
                        <div className="flex justify-between items-center font-bold">
                          <span>{col.label}</span>
                          {col.required && <Badge className="bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0">MANDATORY *</Badge>}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">csv column: "{col.key}" ({col.type || 'text'})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Header Bar */}
                <div className="p-4 bg-[#0f1420] border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-black text-slate-100">{file.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{(file.size / 1024).toFixed(1)} KB · {parsedRows.length} total rows</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {validCount} Valid
                      </Badge>
                      {errorCount > 0 && (
                        <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black text-xs">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> {errorCount} Errors
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetUploadState}
                      className="h-8 text-xs text-slate-400 hover:text-rose-400 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear File
                    </Button>
                  </div>
                </div>

                {/* Data Validation & Preview Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#161d2f] shadow-sm">
                  <div className="p-3 bg-[#0f1420] border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Interactive Preview & Inline Field Editor
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Showing all {parsedRows.length} parsed records</span>
                  </div>

                  <div className="overflow-x-auto max-h-[360px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#0f1420] text-slate-200 font-black uppercase text-[10px] sticky top-0 z-10 border-b border-slate-800">
                        <tr>
                          <th className="p-2.5 w-10 text-center">#</th>
                          <th className="p-2.5 w-20 text-center">Status</th>
                          {currentConfig.columns.map(col => (
                            <th key={col.key} className="p-2.5 min-w-[120px] whitespace-nowrap">
                              {col.label} {col.required && <span className="text-amber-400">*</span>}
                            </th>
                          ))}
                          <th className="p-2.5 w-10 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-[#161d2f] text-slate-100">
                        {parsedRows.map((row, idx) => (
                          <tr key={row._id} className={row._status === 'error' ? 'bg-rose-500/10' : 'hover:bg-slate-800/50'}>
                            <td className="p-2 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="p-2 text-center">
                              {row._status === 'valid' ? (
                                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] font-black">
                                  Valid
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[9px] font-black" title={row._errors.join(', ')}>
                                  Error
                                </Badge>
                              )}
                            </td>
                            {currentConfig.columns.map(col => {
                              const val = row[col.key] || '';
                              const isMissing = col.required && (!val || String(val).trim() === '');
                              return (
                                <td key={col.key} className="p-1">
                                  <Input
                                    type={col.type === 'number' ? 'number' : 'text'}
                                    value={val}
                                    onChange={e => handleCellChange(row._id, col.key, e.target.value)}
                                    placeholder={col.required ? 'Required *' : ''}
                                    className={`h-7 text-xs border ${
                                      isMissing
                                        ? 'border-rose-500 text-rose-400 bg-rose-500/10 font-bold'
                                        : 'border-slate-700 bg-slate-950 text-slate-100 font-medium'
                                    }`}
                                  />
                                </td>
                              );
                            })}
                            <td className="p-1 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRow(row._id)}
                                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Import Execution Button & Real-time Server Log Console */}
                <div className="space-y-4 bg-[#0f1420] p-5 rounded-xl border border-slate-800">
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-100">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> Transmitting to Server...
                        </span>
                        <span className="text-amber-400 font-extrabold">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2 bg-slate-950" />
                    </div>
                  )}

                  {/* 🖥️ REAL-TIME SERVER LOGS CONSOLE */}
                  {logs.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <span>Server Response Audit Console</span>
                        <span>{logs.filter(l => l.type === 'success').length} Passed · {logs.filter(l => l.type === 'error').length} Failed</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-44 overflow-y-auto space-y-1 font-mono text-[11px] shadow-inner">
                        {logs.map((log, lIdx) => (
                          <div
                            key={lIdx}
                            className={
                              log.type === 'success' ? 'text-emerald-400 font-bold flex items-center gap-1.5' :
                              log.type === 'error' ? 'text-rose-400 font-bold flex items-center gap-1.5' :
                              'text-slate-400'
                            }
                          >
                            {log.type === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                            {log.type === 'error' && <XCircle className="w-3 h-3 text-rose-400 shrink-0" />}
                            <span>{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                    <div className="text-xs text-slate-400 font-semibold">
                      Ready to import <span className="font-extrabold text-emerald-400">{validCount} valid records</span> into <span className="font-extrabold text-slate-100">{currentConfig.title}</span>.
                    </div>

                    <Button
                      onClick={handleExecuteImport}
                      disabled={isProcessing || validCount === 0}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-11 px-6 rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Importing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Start Bulk Import ({validCount} Rows)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUploadHub;
