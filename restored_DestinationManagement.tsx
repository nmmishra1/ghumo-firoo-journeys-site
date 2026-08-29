Created At: 2026-08-08T21:18:53+05:30
Completed At: 2026-08-08T21:18:54+05:30
File Path: `file:///d:/Personal/ghumo-firoo-journeys-site/ghumo-firoo-journeys-site/src/pages/crm/DestinationManagement.tsx`
Total Lines: 1338
Total Bytes: 59742
Showing lines 1 to 100
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: import React, { useState, useEffect, useRef } from 'react';
2: import { useNavigate } from 'react-router-dom';
3: import { Card, CardContent } from '@/components/ui/card';
4: import { Button } from '@/components/ui/button';
5: import { Input } from '@/components/ui/input';
6: import { Label } from '@/components/ui/label';
7: import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
8: import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
9: import { Badge } from '@/components/ui/badge';
10: import { useToast } from '@/hooks/use-toast';
11: import { supabase } from '@/integrations/supabase/client';
12: import { 
13:   Globe, Map, MapPin, Plus, Search, Edit, Power, Download, Upload, 
14:   ArrowLeft, Check, X, Loader2, RefreshCw, HelpCircle, Layers, Trash2
15: } from 'lucide-react';
16: 
17: const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';
18: 
19: async function getAuthHeader(): Promise<Record<string, string>> {
20:   const { data: { session } } = await supabase.auth.getSession();
21:   const token = session?.access_token;
22:   return token ? { 'Authorization': `Bearer ${token}` } : {};
23: }
24: 
25: type Country = {
26:   id: string;
27:   country_name: string;
28:   country_code: string;
29:   active_status: boolean;
30:   state_count?: number;
31: };
32: 
33: type State = {
34:   id: string;
35:   state_name: string;
36:   state_code: string;
37:   country_id: string;
38:   active_status: boolean;
39:   city_count?: number;
40: };
41: 
42: type City = {
43:   id: string;
44:   city_name: string;
45:   state_id: string;
46:   state?: string;
47:   country?: string;
48:   destination_type: string | null;
49:   active_status: boolean;
50: };
51: 
52: export const DestinationManagement: React.FC = () => {
53:   const navigate = useNavigate();
54:   const { toast } = useToast();
55:   const fileInputRef = useRef<HTMLInputElement>(null);
56: 
57:   // General Loading & Stats
58:   const [loading, setLoading] = useState(false);
59:   const [globalSearch, setGlobalSearch] = useState('');
60:   
61:   // Total DB Counts for Stats Strip
62:   const [totalCountriesCount, setTotalCountriesCount] = useState(0);
63:   const [totalStatesCount, setTotalStatesCount] = useState(0);
64:   const [totalCitiesCount, setTotalCitiesCount] = useState(0);
65:   const [cityCountMap, setCityCountMap] = useState<Record<string, number>>({});
66: 
67:   // Column Data States
68:   const [countries, setCountries] = useState<Country[]>([]);
69:   const [states, setStates] = useState<State[]>([]);
70:   const [cities, setCities] = useState<City[]>([]);
71: 
72:   // Selection States for 3-Column Cascade
73:   const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
74:   const [selectedState, setSelectedState] = useState<State | null>(null);
75: 
76:   // Column Filters
77:   const [countryFilter, setCountryFilter] = useState('');
78:   const [stateFilter, setStateFilter] = useState('');
79:   const [cityFilter, setCityFilter] = useState('');
80: 
81:   // States for Inline Add Forms
82:   const [showAddCountry, setShowAddCountry] = useState(false);
83:   const [newCountryName, setNewCountryName] = useState('');
84:   const [newCountryCode, setNewCountryCode] = useState('');
85: 
86:   const [showAddState, setShowAddState] = useState(false);
87:   const [newStateName, setNewStateName] = useState('');
88:   const [newStateCode, setNewStateCode] = useState('');
89: 
90:   const [showAddCity, setShowAddCity] = useState(false);
91:   const [newCityName, setNewCityName] = useState('');
92:   const [newCityType, setNewCityType] = useState('Leisure');
93: 
94:   // Edit Modal State
95:   const [editModalOpen, setEditModalOpen] = useState(false);
96:   const [editType, setEditType] = useState<'country' | 'state' | 'city'>('country');
97:   const [editItem, setEditItem] = useState<any>(null);
98:   const [editForm, setEditForm] = useState({ name: '', code: '', type: 'Leisure', state_id: '', country_id: '' });
99: 
100:   // CSV Import Modal State
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
