import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, X, User, Map as MapIcon, Clock, ArrowLeft, ArrowRight, Save, Trash2, Pencil,
  Sparkles, Globe, Compass, ChevronUp, ChevronDown, Copy, Calendar,
  Mail, Phone, MessageSquare, AlertCircle, Building2, Flame, ShieldAlert, Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { validatePhone, validateEmail } from '@/lib/validation';

export type StayStop = {
  id: string;
  city: string;
  state: string;
  country: string;
  nights: number;
};

function parseDestinations(dest: any, defaultState = 'Gujarat', defaultCountry = 'India'): { country: string; state: string; city: string; nights: number }[] {
  if (!dest) return [];
  if (Array.isArray(dest)) {
    const stops: any[] = [];
    dest.forEach((item: any) => {
      if (typeof item === 'object' && item !== null) {
        let rawCity = item.city || item.name || '';
        if (rawCity.includes('+') || rawCity.includes('·') || /\b\d+N\b/i.test(rawCity)) {
          const sub = parseDestinations(rawCity, item.state || defaultState, item.country || defaultCountry);
          if (sub.length > 0) {
            stops.push(...sub);
            return;
          }
        }
        stops.push({
          country: item.country || defaultCountry || 'India',
          state: item.state || defaultState || '',
          city: rawCity,
          nights: Number(item.nights) || 1
        });
      } else if (typeof item === 'string') {
        const sub = parseDestinations(item, defaultState, defaultCountry);
        stops.push(...sub);
      }
    });
    return stops.filter(s => s && s.city);
  }

  if (typeof dest === 'string') {
    let rawStr = dest.trim();
    if (rawStr.startsWith('[') && rawStr.endsWith(']')) {
      try {
        const parsed = JSON.parse(rawStr);
        if (Array.isArray(parsed)) return parseDestinations(parsed, defaultState, defaultCountry);
      } catch {}
    }

    rawStr = rawStr.replace(/^Itinerary\s+for\s+[^-]+-\s*/i, '').trim();

    const stateList = [
      'Gujarat', 'Kashmir', 'Uttarakhand', 'Himachal', 'Kerala', 'Rajasthan', 
      'Goa', 'Sikkim', 'Ladakh', 'Bali', 'Thailand', 'Dubai', 'Singapore',
      'Vietnam', 'Malaysia', 'Maldives', 'Sri Lanka', 'Europe', 'Swiss'
    ];

    let extractedState = defaultState;
    let extractedCountry = defaultCountry;

    stateList.forEach(sName => {
      if (new RegExp(`\\b${sName}\\b`, 'i').test(rawStr)) {
        extractedState = sName;
        if (['Bali', 'Thailand', 'Dubai', 'Singapore', 'Vietnam', 'Malaysia', 'Maldives', 'Sri Lanka', 'Europe', 'Swiss'].includes(sName)) {
          extractedCountry = sName;
        }
      }
    });

    let routeSegment = rawStr;
    if (rawStr.includes('·')) {
      const partsDot = rawStr.split('·').map(p => p.trim());
      const routePart = partsDot.find(p => p.includes('+') || /\b\d+N\b/i.test(p));
      if (routePart) {
        routeSegment = routePart;
      } else if (partsDot.length >= 2) {
        routeSegment = partsDot[1];
      }
    } else {
      routeSegment = routeSegment
        .replace(/-\s*\d+N\/\d+D.*/i, '')
        .replace(/\b\d+N\/\d+D\b.*/i, '')
        .replace(/-\s*(Family|Honeymoon|Group|Luxury|Budget|Standard)\s+Holiday.*/i, '')
        .trim();
    }

    stateList.forEach(sName => {
      const reg = new RegExp(`^${sName}\\s*[-·:]\\s*`, 'i');
      routeSegment = routeSegment.replace(reg, '').trim();
    });

    const cityParts = routeSegment.split(/[\+,]/).map(p => p.trim()).filter(Boolean);

    const stops: { country: string; state: string; city: string; nights: number }[] = [];
    cityParts.forEach(part => {
      let nights = 1;
      let city = part;

      const nightMatch1 = part.match(/(.*?)\s*(\d+)\s*(N|Night|Nights)\b/i);
      const nightMatch2 = part.match(/\b(\d+)\s*(N|Night|Nights)\s*(.*)/i);

      if (nightMatch1 && nightMatch1[1]?.trim()) {
        city = nightMatch1[1].trim();
        nights = parseInt(nightMatch1[2], 10) || 1;
      } else if (nightMatch2 && nightMatch2[3]?.trim()) {
        city = nightMatch2[3].trim();
        nights = parseInt(nightMatch2[1], 10) || 1;
      }

      city = city.replace(/^[-\s·]+|[-\s·]+$/g, '').trim();

      if (city && !/^\d+N\/\d+D$/i.test(city) && !/^(Family|Honeymoon|Group|Luxury|Budget|Standard)\s+Holiday$/i.test(city)) {
        stops.push({
          country: extractedCountry || 'India',
          state: extractedState || 'Gujarat',
          city: city,
          nights: nights
        });
      }
    });

    if (stops.length > 0) {
      return stops;
    }
  }

  return [];
}

type Lead = {
  id: string;
  enquiry_number: string | null;
  customer_name: string;
  email: string | null;
  contact_number: string | null;
  customer_type: string | null;
  assigned_to: string | null;
  tour_description: string | null;
  call_follow_up: string | null;
  lead_prospect: string | null;
  call_summary: string | null;
  next_call_time: string | null;
  travel_interest: string | null;
  discussion_notes: string | null;
  follow_up_date: string | null;
  status: 'New' | 'Assigned' | 'Follow-up Due' | 'Quote Sent' | 'Booking Confirmed' | 'Closed Lost';
  created_by: string;
  created_at: string;
  updated_at: string;
  
  whatsapp_number?: string | null;
  company_name?: string | null;
  country?: string | null;
  state?: string | null;
  budget?: string | null;
  travel_theme?: string | null;
  package_type?: string | null;
  interests?: string | null;
  hotel_category?: string | null;
  transport_preference?: string | null;
  priority?: string | null;
  expected_booking_value?: number | null;
  communication_method?: string | null;
  next_action?: string | null;
  package_name?: string | null;
  package_price?: number | null;
  adult_count?: number | null;
  child_count?: number | null;
  infant_count?: number | null;
  trip_start_date?: string | null;
  trip_end_date?: string | null;
  destinations?: string | null;
  lead_destination?: any[] | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  source?: string | null;
  notes?: string | null;
  remarks?: string | null;
};

type Profile = {
  id: string;
  full_name: string;
  role: string;
  approved: boolean;
};

interface LeadFormProps {
  editingLead: Lead | null;
  onSubmit: (leadData: any) => void;
  onCancel: () => void;
  profiles: Profile[];
  userRole: string | null;
  onOpenUserManagement?: () => void;
}

// Built-in Geography Fallback Dataset
const FALLBACK_GEOGRAPHY: Record<string, Record<string, string[]>> = {
  "India": {
    "Uttarakhand (Char Dham)": ["Haridwar", "Rishikesh", "Dehradun", "Barkot", "Uttarkashi", "Guptkashi", "Kedarnath", "Badrinath", "Kharsali", "Harsil", "Rudraprayag", "Joshimath", "Mussoorie", "Nainital"],
    "Kerala": ["Kochi", "Munnar", "Thekkady", "Alleppey", "Kovalam", "Wayanad", "Trivandrum"],
    "Kashmir & Ladakh": ["Srinagar", "Gulmarg", "Pahalgam", "Sonmarg", "Leh", "Nubra Valley", "Pangong Lake", "Kargil"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Dalhousie", "Amritsar", "Kasauli", "Spiti Valley"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Jaisalmer", "Pushkar", "Bikaner", "Mount Abu"],
    "Gujarat": ["Ahmedabad", "Bhuj", "White Rann", "Statue of Unity", "Dwarka", "Somnath"],
    "Goa": ["North Goa", "South Goa", "Panaji"],
    "Andaman & Nicobar": ["Port Blair", "Havelock Island", "Neil Island"],
    "Sikkim & North East": ["Gangtok", "Darjeeling", "Pelling", "Shillong", "Cherrapunji", "Kaziranga"]
  },
  "Japan": {
    "Kanto": ["Tokyo", "Hakone", "Mt Fuji", "Yokohama"],
    "Kansai": ["Kyoto", "Osaka", "Nara", "Kobe"],
    "Hiroshima": ["Hiroshima", "Miyajima"]
  },
  "Singapore": {
    "Singapore Region": ["Singapore City", "Sentosa Island", "Marina Bay"]
  },
  "Malaysia": {
    "Federal Territory": ["Kuala Lumpur"],
    "Pahang": ["Genting Highlands", "Cameron Highlands"],
    "Penang": ["Penang Island"],
    "Kedah": ["Langkawi"]
  },
  "Thailand": {
    "Central": ["Bangkok", "Pattaya", "Ayutthaya"],
    "Southern": ["Phuket", "Krabi", "Koh Samui", "Koh Phi Phi"],
    "Northern": ["Chiang Mai", "Chiang Rai"]
  },
  "France": {
    "Ile-de-France": ["Paris", "Versailles"],
    "French Riviera": ["Nice", "Cannes", "Monaco"]
  },
  "Switzerland": {
    "Central Switzerland": ["Lucerne", "Mount Titlis", "Interlaken"],
    "Zurich Region": ["Zurich"],
    "Geneva Region": ["Geneva", "Montreux"]
  },
  "Italy": {
    "Lazio": ["Rome"],
    "Veneto": ["Venice"],
    "Tuscany": ["Florence", "Pisa"]
  },
  "UAE": {
    "Dubai": ["Dubai City", "Desert Safari Zone"],
    "Abu Dhabi": ["Abu Dhabi City", "Yas Island"]
  },
  "Indonesia": {
    "Bali": ["Ubud", "Seminyak", "Kuta", "Nusa Dua", "Canggu"]
  },
  "Vietnam": {
    "North Vietnam": ["Hanoi", "Ha Long Bay"],
    "Central Vietnam": ["Da Nang", "Hoi An"],
    "South Vietnam": ["Ho Chi Minh City"]
  },
  "Turkey": {
    "Marmara": ["Istanbul"],
    "Central Anatolia": ["Cappadocia"],
    "Mediterranean": ["Antalya"]
  },
  "Georgia": {
    "Kartli": ["Tbilisi"],
    "Mtskheta-Mtianeti": ["Kazbegi"],
    "Adjara": ["Batumi"]
  }
};

// Quick Templates Bar Chips
const QUICK_TEMPLATES = [
  { name: "🕌 Char Dham Road", category: "pilgrimage", stops: [
    { city: "Haridwar", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 },
    { city: "Barkot", state: "Uttarakhand (Char Dham)", country: "India", nights: 2 },
    { city: "Uttarkashi", state: "Uttarakhand (Char Dham)", country: "India", nights: 2 },
    { city: "Guptkashi", state: "Uttarakhand (Char Dham)", country: "India", nights: 2 },
    { city: "Badrinath", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 },
    { city: "Rishikesh", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 }
  ]},
  { name: "🚁 Char Dham Heli", category: "pilgrimage", stops: [
    { city: "Dehradun", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 },
    { city: "Kharsali", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 },
    { city: "Harsil", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 },
    { city: "Guptkashi", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 },
    { city: "Badrinath", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 }
  ]},
  { name: "⛰ Do Dham K+B", category: "pilgrimage", stops: [
    { city: "Haridwar", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 },
    { city: "Guptkashi", state: "Uttarakhand (Char Dham)", country: "India", nights: 2 },
    { city: "Badrinath", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 },
    { city: "Rishikesh", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 }
  ]},
  { name: "🏔 Kedarnath", category: "pilgrimage", stops: [
    { city: "Haridwar", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 },
    { city: "Guptkashi", state: "Uttarakhand (Char Dham)", country: "India", nights: 2 },
    { city: "Rishikesh", state: "Uttarakhand (Char Dham)", country: "India", nights: 1 }
  ]},
  { name: "🌿 Kerala", category: "domestic", stops: [
    { city: "Kochi", state: "Kerala", country: "India", nights: 1 },
    { city: "Munnar", state: "Kerala", country: "India", nights: 2 },
    { city: "Thekkady", state: "Kerala", country: "India", nights: 1 },
    { city: "Alleppey", state: "Kerala", country: "India", nights: 1 }
  ]},
  { name: "❄ Kashmir", category: "domestic", stops: [
    { city: "Srinagar", state: "Kashmir & Ladakh", country: "India", nights: 2 },
    { city: "Gulmarg", state: "Kashmir & Ladakh", country: "India", nights: 1 },
    { city: "Pahalgam", state: "Kashmir & Ladakh", country: "India", nights: 2 }
  ]},
  { name: "🏔 Leh Ladakh", category: "domestic", stops: [
    { city: "Leh", state: "Kashmir & Ladakh", country: "India", nights: 2 },
    { city: "Nubra Valley", state: "Kashmir & Ladakh", country: "India", nights: 2 },
    { city: "Pangong Lake", state: "Kashmir & Ladakh", country: "India", nights: 1 }
  ]},
  { name: "🏖 Goa", category: "domestic", stops: [
    { city: "North Goa", state: "Goa", country: "India", nights: 3 },
    { city: "South Goa", state: "Goa", country: "India", nights: 2 }
  ]},
  { name: "🏰 Rajasthan", category: "domestic", stops: [
    { city: "Jaipur", state: "Rajasthan", country: "India", nights: 2 },
    { city: "Jodhpur", state: "Rajasthan", country: "India", nights: 1 },
    { city: "Udaipur", state: "Rajasthan", country: "India", nights: 2 }
  ]},
  { name: "✈ Japan", category: "international", stops: [
    { city: "Tokyo", state: "Kanto", country: "Japan", nights: 3 },
    { city: "Kyoto", state: "Kansai", country: "Japan", nights: 2 },
    { city: "Osaka", state: "Kansai", country: "Japan", nights: 2 }
  ]},
  { name: "🇸🇬 Singapore", category: "international", stops: [
    { city: "Singapore City", state: "Singapore Region", country: "Singapore", nights: 3 },
    { city: "Sentosa Island", state: "Singapore Region", country: "Singapore", nights: 2 }
  ]},
  { name: "🇸🇬🇲🇾 SG+MY", category: "international", stops: [
    { city: "Singapore City", state: "Singapore Region", country: "Singapore", nights: 3 },
    { city: "Kuala Lumpur", state: "Federal Territory", country: "Malaysia", nights: 2 },
    { city: "Genting Highlands", state: "Pahang", country: "Malaysia", nights: 1 }
  ]},
  { name: "🌍 Europe", category: "international", stops: [
    { city: "Paris", state: "Ile-de-France", country: "France", nights: 3 },
    { city: "Lucerne", state: "Central Switzerland", country: "Switzerland", nights: 2 },
    { city: "Rome", state: "Lazio", country: "Italy", nights: 3 }
  ]},
  { name: "🇦🇪 Dubai", category: "international", stops: [
    { city: "Dubai City", state: "Dubai", country: "UAE", nights: 4 },
    { city: "Abu Dhabi City", state: "Abu Dhabi", country: "UAE", nights: 2 }
  ]},
  { name: "🌴 Bali", category: "international", stops: [
    { city: "Ubud", state: "Bali", country: "Indonesia", nights: 3 },
    { city: "Seminyak", state: "Bali", country: "Indonesia", nights: 3 }
  ]},
  { name: "🇹🇷 Turkey", category: "international", stops: [
    { city: "Istanbul", state: "Marmara", country: "Turkey", nights: 3 },
    { city: "Cappadocia", state: "Central Anatolia", country: "Turkey", nights: 2 }
  ]}
];

export const LeadForm: React.FC<LeadFormProps> = ({
  editingLead,
  onSubmit,
  onCancel,
  profiles,
  userRole,
  onOpenUserManagement
}) => {
  const { toast } = useToast();

  // Dynamic Lead Sources state
  const [dbLeadSources, setDbLeadSources] = useState<string[]>([
    'Website', 'Website - Enquire Now Modal', 'Website - Download Brochure',
    'Website - Contact Form', 'Website - Floating WhatsApp', 'WhatsApp',
    'Phone Call', 'Google Ads', 'Meta Ads (Facebook/IG)', 'Walk-in',
    'Agent Referral', 'Partner Portal'
  ]);

  useEffect(() => {
    fetch('/php-backend/lead_sources.php')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.sources) && data.sources.length > 0) {
          const names = data.sources.filter((s: any) => s.is_active).map((s: any) => s.source_name);
          setDbLeadSources(prev => Array.from(new Set([...names, ...prev])));
        }
      })
      .catch(() => {});
  }, []);

  // Team Profiles for Lead Assignment
  const [teamProfiles, setTeamProfiles] = useState<Profile[]>(profiles || []);

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setTeamProfiles(profiles);
    } else {
      const fetchTeam = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users.php`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (res.ok) {
            const resData = await res.json();
            const dbUsers = resData.users || [];
            const mapped: Profile[] = dbUsers.map((u: any) => ({
              id: u.id,
              full_name: u.full_name || u.email || 'Agent User',
              role: u.role || 'Agent',
              approved: true
            }));
            setTeamProfiles(mapped);
          }
        } catch (err) {
          console.warn('Failed to self-fetch team profiles in LeadForm:', err);
        }
      };
      fetchTeam();
    }
  }, [profiles]);

  // Validation States
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneDuplicateLead, setPhoneDuplicateLead] = useState<{ id: string; customer_name: string } | null>(null);
  const [emailDuplicateLead, setEmailDuplicateLead] = useState<{ id: string; customer_name: string } | null>(null);

  // Main Form Data State
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_number: '',
    email: '',
    whatsapp_number: '',
    company_name: '',
    source: 'Website',
    assigned_to: 'unassigned',
    priority: 'Medium',
    status: 'New' as Lead['status'],
    
    trip_category: 'Destination Holiday',
    trip_start_date: '',
    is_flexible_dates: false,
    
    adult_count: 2,
    child_count: 0,
    infant_count: 0,
    budget: '',
    travel_theme: 'Family Holiday',
    hotel_category: '5 Star Luxury',
    transport_preference: 'Flight + Transfer',
    
    follow_up_date: '',
    remarks: '',
    package_name: ''
  });

  // Stay Cards Deck
  const [stayStops, setStayStops] = useState<StayStop[]>([]);

  // Toolbar state for adding stop
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [selectedState, setSelectedState] = useState<string>('Uttarakhand (Char Dham)');
  const [selectedCity, setSelectedCity] = useState<string>('Haridwar');
  const [isCustomCity, setIsCustomCity] = useState<boolean>(false);
  const [customCityName, setCustomCityName] = useState<string>('');
  const [stayNights, setStayNights] = useState<number>(2);

  // Dynamic Circuit Templates state
  const [customTemplates, setCustomTemplates] = useState<typeof QUICK_TEMPLATES>(() => {
    try {
      const saved = localStorage.getItem('custom_crm_circuit_templates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<'domestic' | 'international' | 'pilgrimage'>('domestic');
  const [templateStops, setTemplateStops] = useState<StayStop[]>([]);
  
  // Template Modal Cascading Selector States
  const [tmplCountry, setTmplCountry] = useState<string>('India');
  const [tmplState, setTmplState] = useState<string>('Gujarat');
  const [tmplCity, setTmplCity] = useState<string>('Ahmedabad');
  const [tmplIsCustom, setTmplIsCustom] = useState<boolean>(false);
  const [tmplCustomCity, setTmplCustomCity] = useState<string>('');
  const [tmplNights, setTmplNights] = useState<number>(2);

  const combinedTemplates = [...QUICK_TEMPLATES, ...customTemplates];
  const allTemplates = combinedTemplates.filter((t, idx, self) => 
    t && t.name && self.findIndex(x => x.name === t.name) === idx
  );

  const handleTmplCountryChange = (cName: string) => {
    setTmplCountry(cName);
    const fallbackSts = Object.keys(FALLBACK_GEOGRAPHY[cName] || {});
    const firstState = fallbackSts[0] || '';
    setTmplState(firstState);
    const fallbackCts = FALLBACK_GEOGRAPHY[cName]?.[firstState] || [];
    setTmplCity(fallbackCts[0] || '');
  };

  const handleTmplStateChange = (sName: string) => {
    setTmplState(sName);
    const fallbackCts = FALLBACK_GEOGRAPHY[tmplCountry]?.[sName] || [];
    const matchedStateObj = states.find((s: any) => (s.state_name || s.name)?.toLowerCase() === sName.toLowerCase());
    const apiCts = cities
      .filter((c: any) => matchedStateObj && String(c.state_id) === String(matchedStateObj.id))
      .map((c: any) => c.city_name || c.name);
    const availCts = Array.from(new Set([...fallbackCts, ...apiCts]));
    setTmplCity(availCts[0] || '');
  };

  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  const openTemplateModal = () => {
    setEditingTemplateId(null);
    setTemplateStops([...stayStops]);
    setTmplCountry(selectedCountry || 'India');
    setTmplState(selectedState || 'Gujarat');
    setTmplCity(selectedCity || 'Ahmedabad');
    setNewTemplateName(stayStops.length > 0 ? `${selectedState || 'Custom'} Circuit ${stayStops.reduce((sum, s) => sum + s.nights, 0)}N` : '');
    setCreateTemplateOpen(true);
  };

  const openEditTemplateModal = (tmpl: any) => {
    setEditingTemplateId(tmpl.id || null);
    setNewTemplateName(tmpl.name || '');
    setNewTemplateCategory(tmpl.category || 'domestic');
    setTemplateStops(tmpl.stops || []);
    setTmplCountry(tmpl.stops?.[0]?.country || selectedCountry || 'India');
    setTmplState(tmpl.stops?.[0]?.state || selectedState || 'Gujarat');
    setTmplCity(tmpl.stops?.[0]?.city || selectedCity || 'Ahmedabad');
    setCreateTemplateOpen(true);
  };

  const handleAddStopToTemplate = () => {
    const finalCity = tmplIsCustom ? tmplCustomCity.trim() : tmplCity;
    if (!finalCity) {
      toast({ title: "City Required", description: "Please select or type a city.", variant: "destructive" });
      return;
    }
    const newStop: StayStop = {
      id: `tmpl-stop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      city: finalCity,
      state: tmplState,
      country: tmplCountry,
      nights: tmplNights || 1
    };
    setTemplateStops(prev => [...prev, newStop]);
    if (tmplIsCustom) setTmplCustomCity('');
  };

  const handleRemoveStopFromTemplate = (index: number) => {
    setTemplateStops(prev => prev.filter((_, i) => i !== index));
  };

  // Load custom circuit templates from MySQL on mount
  useEffect(() => {
    fetch(`${API_BASE}/circuit_templates.php`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.templates) && data.templates.length > 0) {
          setCustomTemplates(data.templates);
          try {
            localStorage.setItem('custom_crm_circuit_templates', JSON.stringify(data.templates));
          } catch (e) {}
        }
      })
      .catch(e => console.warn('Could not load database circuit templates:', e));
  }, []);

  const handleSaveCustomTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({ title: "Template Name Required", description: "Please enter a template name.", variant: "destructive" });
      return;
    }
    if (templateStops.length === 0) {
      toast({ title: "Stops Required", description: "Please add at least 1 stay stop to create a template.", variant: "destructive" });
      return;
    }

    const payload: any = {
      name: newTemplateName.trim(),
      category: newTemplateCategory,
      stops: [...templateStops]
    };

    if (editingTemplateId) {
      payload.id = editingTemplateId;
    }

    try {
      const res = await fetch(`${API_BASE}/circuit_templates.php`, {
        method: editingTemplateId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData && resData.success && resData.template) {
        const savedTmpl = resData.template;
        setCustomTemplates(prev => {
          let nextList = [...prev];
          const existingIdx = nextList.findIndex(t => (savedTmpl.id && t.id === savedTmpl.id) || t.name === savedTmpl.name);
          if (existingIdx >= 0) {
            nextList[existingIdx] = savedTmpl;
          } else {
            nextList.unshift(savedTmpl);
          }
          try {
            localStorage.setItem('custom_crm_circuit_templates', JSON.stringify(nextList));
          } catch (e) {}
          return nextList;
        });
        toast({
          title: editingTemplateId ? "Template Updated!" : "Template Created!",
          description: `Circuit template "${newTemplateName}" saved successfully in MySQL database.`
        });
      }
    } catch (e) {
      console.warn('Error saving template to MySQL database:', e);
    }

    // Apply created/updated template to stayStops if empty
    if (stayStops.length === 0) {
      setStayStops([...templateStops]);
    }

    setNewTemplateName('');
    setEditingTemplateId(null);
    setCreateTemplateOpen(false);
  };

  const handleDeleteTemplate = async (tmplId: number) => {
    if (!tmplId) return;
    setCustomTemplates(prev => {
      const nextList = prev.filter(t => t.id !== tmplId);
      try {
        localStorage.setItem('custom_crm_circuit_templates', JSON.stringify(nextList));
      } catch (e) {}
      return nextList;
    });

    try {
      await fetch(`${API_BASE}/circuit_templates.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tmplId })
      });
      toast({ title: "Template Deleted", description: "Circuit template removed successfully from database." });
    } catch (e) {}
  };

  // Dynamic Geography States
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_PHP_BASE_URL || '/php-backend';

  const getAuthHeader = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token 
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};
    } catch (e) {
      return {};
    }
  };

  // CALL 1 — fetchCountries
  const fetchCountries = async () => {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/api.php?table=countries&order_by=country_name`, { headers: authHeaders });
      const data = await res.json();
      setCountries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch countries:", e);
    }
  };

  // CALL 2 — fetchStates
  const fetchStates = async (countryId: string | number) => {
    if (!countryId) {
      setStates([]);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/api.php?table=states&country_id=${countryId}&order_by=state_name`,
        { headers: await getAuthHeader() }
      );
      const data = await res.json();
      const raw = Array.isArray(data) ? data : [];
      const filtered = raw.filter((s: any) => String(s.country_id) === String(countryId));
      setStates(filtered);
    } catch (e) {
      console.error("Failed to fetch states:", e);
      setStates([]);
    }
  };

  // CALL 3 — fetchCities
  const fetchCities = async (stateId: string | number) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/api.php?table=cities&state_id=${stateId}&order_by=city_name`,
        { headers: await getAuthHeader() }
      );
      const data = await res.json();
      
      // CRITICAL: Do NOT filter by active_status here.
      // The seeded cities may have active_status = NULL. Show all cities for the selected state.
      const mapped = Array.isArray(data) ? data.map((c: any) => ({
        ...c,
        city_name: c.city_name || c.name || ''
      })) : [];
      setCities(mapped);
    } catch (e) {
      console.error("Failed to fetch cities:", e);
      setCities([]);
    }
  };

  // CALL 5 — resolveIds states
  const resolveIds = async (matchedCountryId: number | string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api.php?table=states&country_id=${matchedCountryId}`,
        { headers: await getAuthHeader() }
      );
      const statesData = await res.json();
      return Array.isArray(statesData) ? statesData : [];
    } catch (e) {
      console.error("Failed to resolve states:", e);
      return [];
    }
  };

  // CALL 6 — resolveGeography states
  const resolveGeography = async (matchedCountry: any) => {
    try {
      const res = await fetch(
        `${API_BASE}/api.php?table=states&country_id=${matchedCountry.id}`,
        { headers: await getAuthHeader() }
      );
      const statesData = await res.json();
      return Array.isArray(statesData) ? statesData : [];
    } catch (e) {
      console.error("Failed to resolve geography:", e);
      return [];
    }
  };

  // CALL 7 — handleAddNewCityToDatabase
  const handleAddNewCityToDatabase = async (newCityName: string, stateId: number | string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api.php?table=cities`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...await getAuthHeader()
          },
          body: JSON.stringify({
            city_name: newCityName.trim(),
            name: newCityName.trim(),
            state_id: stateId,
            active_status: 1
          })
        }
      );
      const result = await res.json();
      if (result.id || result.success) {
        const newCity = { 
          id: result.id || Date.now(), 
          city_name: newCityName.trim(),
          name: newCityName.trim(),
          state_id: stateId 
        };
        setCities(prev => [...prev, newCity]);
        return newCity;
      }
    } catch (e) {
      console.error("Failed to add new city:", e);
    }
  };

  const [dbDestinations, setDbDestinations] = useState<any[]>([]);
  const [rawDestinationsNote, setRawDestinationsNote] = useState<string>('');

  const fetchedInitialRef = useRef(false);

  useEffect(() => {
    if (fetchedInitialRef.current) return;
    fetchedInitialRef.current = true;

    fetchCountries();
    const fetchDbDestinations = async () => {
      try {
        const res = await fetch(`${API_BASE}/destinations_api.php`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDbDestinations(json.data);
        }
      } catch (e) {
        console.error("Failed to load db destinations:", e);
      }
    };
    fetchDbDestinations();
  }, []);

  const lastFetchedCountryIdRef = useRef<string | number | null>(null);
  const lastFetchedStateIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (!selectedCountry) return;
    const matchedCountry = countries.find(
      (c: any) => (c.country_name || c.name || '').toLowerCase() === selectedCountry.toLowerCase()
    );
    if (matchedCountry?.id) {
      if (lastFetchedCountryIdRef.current === matchedCountry.id) return;
      lastFetchedCountryIdRef.current = matchedCountry.id;
      fetchStates(matchedCountry.id);
    } else {
      setStates([]);
    }
  }, [selectedCountry, countries]);

  useEffect(() => {
    if (!selectedState) return;
    const matchedState = states.find(
      (s: any) => (s.state_name || s.name || '').toLowerCase() === selectedState.toLowerCase()
    );
    if (matchedState?.id) {
      if (lastFetchedStateIdRef.current === matchedState.id) return;
      lastFetchedStateIdRef.current = matchedState.id;
      fetchCities(matchedState.id);
    } else {
      setCities([]);
    }
  }, [selectedState, states]);

  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    const matchedCountry = countries.find(
      (c: any) => (c.country_name || c.name || '').toLowerCase() === countryName.toLowerCase()
    );
    if (matchedCountry?.id) {
      fetchStates(matchedCountry.id);
    } else {
      setStates([]);
    }

    const fallbackSt = Object.keys(FALLBACK_GEOGRAPHY[countryName] || {});
    const apiSt = states.filter((s: any) => String(s.country_id) === String(matchedCountry?.id)).map((s: any) => s.state_name || s.name);
    const availSt = Array.from(new Set([...apiSt, ...fallbackSt]));
    const nextState = availSt[0] || '';
    setSelectedState(nextState);

    if (nextState) {
      const fallbackCt = FALLBACK_GEOGRAPHY[countryName]?.[nextState] || [];
      setSelectedCity(fallbackCt[0] || '');
    } else {
      setSelectedCity('');
    }
  };

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const matchedState = states.find(
      (s: any) => (s.state_name || s.name || '').toLowerCase() === stateName.toLowerCase()
    );
    if (matchedState?.id) {
      fetchCities(matchedState.id);
    } else {
      setCities([]);
    }

    const fallbackCt = FALLBACK_GEOGRAPHY[selectedCountry]?.[stateName] || [];
    const apiCt = cities.filter((c: any) => String(c.state_id) === String(matchedState?.id)).map((c: any) => c.city_name || c.name);
    const availCt = Array.from(new Set([...apiCt, ...fallbackCt]));
    setSelectedCity(availCt[0] || '');
  };

  // Dynamic Options merged with API, DB destinations, and Fallback
  const fallbackCountries = Object.keys(FALLBACK_GEOGRAPHY);
  const apiCountryNames = countries.map((c: any) => c.country_name || c.name).filter(Boolean);
  const availableCountries = Array.from(new Set([...apiCountryNames, ...fallbackCountries]));

  const fallbackStates = Object.keys(FALLBACK_GEOGRAPHY[selectedCountry] || {});
  const apiStateNames = states.map((s: any) => s.state_name || s.name).filter(Boolean);
  const availableStates = Array.from(new Set([...apiStateNames, ...fallbackStates]));

  const fallbackCities = FALLBACK_GEOGRAPHY[selectedCountry]?.[selectedState] || [];
  const dbCities = dbDestinations
    .filter((d: any) => d.city && d.status === 'Published' && (
      selectedState ? (d.state && d.state.toLowerCase() === selectedState.toLowerCase()) : true
    ))
    .map((d: any) => d.city);
  const matchedStateObj = states.find((s: any) => (s.state_name || s.name)?.toLowerCase() === selectedState.toLowerCase());
  const apiCityNames = cities
    .filter((c: any) => {
      if (selectedState) {
        if (matchedStateObj && c.state_id) return String(c.state_id) === String(matchedStateObj.id);
        if (c.state_name || c.state) return (c.state_name || c.state).toLowerCase() === selectedState.toLowerCase();
      }
      return true;
    })
    .map((c: any) => c.city_name || c.name)
    .filter(Boolean);
  const availableCities = Array.from(new Set([...fallbackCities, ...apiCityNames, ...dbCities]));

  // Template Modal Dynamic Options
  const tmplFallbackStates = Object.keys(FALLBACK_GEOGRAPHY[tmplCountry] || {});
  const tmplAvailableStates = Array.from(new Set([...apiStateNames, ...tmplFallbackStates]));

  const tmplFallbackCities = FALLBACK_GEOGRAPHY[tmplCountry]?.[tmplState] || [];
  const tmplMatchedStateObj = states.find((s: any) => (s.state_name || s.name)?.toLowerCase() === tmplState.toLowerCase());
  const tmplApiCityNames = cities
    .filter((c: any) => {
      if (tmplState) {
        if (tmplMatchedStateObj && c.state_id) return String(c.state_id) === String(tmplMatchedStateObj.id);
        if (c.state_name || c.state) return (c.state_name || c.state).toLowerCase() === tmplState.toLowerCase();
      }
      return true;
    })
    .map((c: any) => c.city_name || c.name)
    .filter(Boolean);
  const tmplAvailableCities = Array.from(new Set([...tmplFallbackCities, ...tmplApiCityNames]));

  // Initialize editing lead
  useEffect(() => {
    if (editingLead) {
      let parsedStops: StayStop[] = [];
      if (Array.isArray(editingLead.lead_destination) && editingLead.lead_destination.length > 0) {
        parsedStops = editingLead.lead_destination.map((d: any, idx: number) => ({
          id: `stop-${idx}-${Date.now()}`,
          city: d.city || d.name || String(d),
          state: d.state || editingLead.state || '',
          country: d.country || editingLead.country || 'India',
          nights: Number(d.nights) || 1
        }));
        setRawDestinationsNote('');
      } else if (editingLead.destinations) {
        setRawDestinationsNote(editingLead.destinations);
        const parsed = parseDestinations(editingLead.destinations, editingLead.state || 'Gujarat', editingLead.country || 'India');
        if (parsed.length > 0) {
          parsedStops = parsed.map((p, idx) => ({
            id: `stop-${idx}-${Date.now()}`,
            city: p.city,
            state: p.state || editingLead.state || '',
            country: p.country || editingLead.country || 'India',
            nights: p.nights
          }));
        }
      }

      setStayStops(parsedStops);

      setFormData({
        customer_name: editingLead.customer_name || '',
        contact_number: editingLead.contact_number || editingLead.customer_phone || '',
        email: editingLead.email || editingLead.customer_email || '',
        whatsapp_number: editingLead.whatsapp_number || '',
        company_name: editingLead.company_name || '',
        source: editingLead.source || editingLead.customer_type || 'Website',
        assigned_to: editingLead.assigned_to || 'unassigned',
        priority: editingLead.priority || 'Medium',
        status: editingLead.status || 'New',
        trip_category: editingLead.country && editingLead.country !== 'India' ? 'International Holiday' : 'Destination Holiday',
        trip_start_date: editingLead.trip_start_date ? editingLead.trip_start_date.split('T')[0] : '',
        is_flexible_dates: false,
        adult_count: editingLead.adult_count || 2,
        child_count: editingLead.child_count || 0,
        infant_count: editingLead.infant_count || 0,
        budget: editingLead.budget || (editingLead.package_price ? String(editingLead.package_price) : ''),
        travel_theme: editingLead.travel_theme || 'Family Holiday',
        hotel_category: editingLead.hotel_category || '5 Star Luxury',
        transport_preference: editingLead.transport_preference || 'Flight + Transfer',
        follow_up_date: editingLead.follow_up_date ? editingLead.follow_up_date.split('T')[0] : '',
        remarks: editingLead.remarks || editingLead.discussion_notes || editingLead.notes || '',
        package_name: editingLead.package_name || ''
      });
    }
  }, [editingLead]);

  const generate1LineTitle = (stops: StayStop[], theme?: string) => {
    if (!stops || stops.length === 0) return '';
    const totalNights = stops.reduce((sum, s) => sum + (Number(s.nights) || 0), 0);
    const totalDays = totalNights + 1;
    
    let primaryDest = stops[0].country && stops[0].country !== 'India' 
      ? stops[0].country 
      : (stops[0].state ? stops[0].state.replace(/\s*\([^)]*\)/, '') : stops[0].city);
      
    const routeBreakdown = stops.map(s => `${s.city} ${s.nights}N`).join(' + ');
    const themeSuffix = theme ? ` · ${theme}` : '';

    return `${primaryDest} · ${routeBreakdown} · ${totalNights}N/${totalDays}D${themeSuffix}`;
  };

  const totalNights = stayStops.reduce((sum, s) => sum + (Number(s.nights) || 0), 0);
  const totalDays = totalNights + 1;
  const autoGeneratedTitle = generate1LineTitle(stayStops, formData.travel_theme);

  // Add Stay Stop
  const handleAddStayStop = async () => {
    const cityName = isCustomCity ? customCityName.trim() : selectedCity;
    if (!cityName) {
      toast({ title: "Select Destination", description: "Please specify a destination city name.", variant: "destructive" });
      return;
    }
    if (stayNights <= 0) {
      toast({ title: "Invalid Duration", description: "Stay duration must be at least 1 night.", variant: "destructive" });
      return;
    }

    if (isCustomCity && customCityName.trim()) {
      const matchedState = states.find(
        (s: any) => (s.state_name || s.name || '').toLowerCase() === selectedState.toLowerCase()
      );
      if (matchedState?.id) {
        await handleAddNewCityToDatabase(customCityName.trim(), matchedState.id);
      }
    }

    const newStop: StayStop = {
      id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      city: cityName,
      state: selectedState,
      country: selectedCountry,
      nights: Number(stayNights)
    };

    setStayStops([...stayStops, newStop]);
    if (isCustomCity) {
      setCustomCityName('');
      setIsCustomCity(false);
    }
  };

  const handleRemoveStop = (index: number) => {
    setStayStops(stayStops.filter((_, idx) => idx !== index));
  };

  const handleUpdateStopNights = (index: number, nights: number) => {
    const updated = [...stayStops];
    updated[index].nights = Math.max(1, nights);
    setStayStops(updated);
  };

  // Apply Quick Template
  const handleApplyTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    const newStops: StayStop[] = tmpl.stops.map((s, idx) => ({
      id: `tmpl-${idx}-${Date.now()}`,
      city: s.city,
      state: s.state,
      country: s.country,
      nights: s.nights
    }));
    setStayStops(newStops);
    toast({ title: "Template Applied", description: `Loaded "${tmpl.name}" circuit.` });
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'contact_number') {
      setPhoneError(null);
      setPhoneDuplicateLead(null);
    } else if (field === 'email') {
      setEmailError(null);
      setEmailDuplicateLead(null);
    }
  };

  // CALL 4 — email duplicate check & phone duplicate check
  const handlePhoneBlur = async () => {
    const phone = formData.contact_number;
    if (!phone) return;
    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid mobile number (10 to 15 digits).');
    } else {
      setPhoneError(null);
      try {
        const res = await fetch(
          `${API_BASE}/leads_list.php?search=${encodeURIComponent(phone.trim())}`,
          { headers: await getAuthHeader() }
        );
        const data = await res.json();
        const leads = data.leads || data || [];
        const match = Array.isArray(leads) ? leads.find((l: any) => 
          (l.contact_number || l.customer_phone)?.trim() === phone.trim()
        ) : null;
        setPhoneDuplicateLead(match || null);
      } catch (e) { console.error(e); }
    }
  };

  const handleEmailBlur = async () => {
    const email = formData.email;
    if (!email) return;
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError(null);
      try {
        const res = await fetch(
          `${API_BASE}/leads_list.php?email=${encodeURIComponent(email.trim().toLowerCase())}`,
          { headers: await getAuthHeader() }
        );
        const data = await res.json();
        const leads = data.leads || data || [];
        const match = Array.isArray(leads) ? leads.find((l: any) => 
          (l.customer_email || l.email)?.toLowerCase() === email.trim().toLowerCase()
        ) : null;
        setEmailDuplicateLead(match || null);
      } catch (e) { console.error(e); }
    }
  };

  // Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name.trim()) {
      toast({ title: "Required Field", description: "Customer Name is required.", variant: "destructive" });
      return;
    }
    if (!formData.contact_number.trim()) {
      toast({ title: "Required Field", description: "Mobile Number is required.", variant: "destructive" });
      return;
    }

    const titleToSave = formData.package_name || autoGeneratedTitle || 'Custom Travel Brief';
    const primaryCountry = stayStops[0]?.country || selectedCountry;
    const primaryState = stayStops[0]?.state || selectedState;

    const submissionData = {
      customer_name: formData.customer_name.trim(),
      email: formData.email.trim() || null,
      contact_number: formData.contact_number.trim() || null,
      customer_email: formData.email.trim() || null,
      customer_phone: formData.contact_number.trim() || null,
      whatsapp_number: formData.whatsapp_number.trim() || null,
      company_name: formData.company_name.trim() || null,
      
      country: primaryCountry,
      state: primaryState,
      destinations: titleToSave,
      lead_destination: stayStops,
      
      trip_start_date: formData.trip_start_date || null,
      adult_count: formData.adult_count,
      child_count: formData.child_count,
      infant_count: formData.infant_count,
      
      budget: formData.budget || null,
      package_price: formData.budget ? parseFloat(formData.budget) || 0 : 0,
      travel_theme: formData.travel_theme || null,
      hotel_category: formData.hotel_category || null,
      transport_preference: formData.transport_preference || null,
      
      source: formData.source || 'Website',
      customer_type: formData.source || 'Website',
      priority: formData.priority || 'Medium',
      expected_booking_value: formData.budget ? parseFloat(formData.budget) || 0 : 0,
      package_cost: formData.budget ? parseFloat(formData.budget) || 0 : 0,
      
      assigned_to: formData.assigned_to === 'unassigned' ? null : formData.assigned_to,
      status: formData.status || 'New',
      
      follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : null,
      discussion_notes: formData.remarks.trim() || null,
      notes: formData.remarks.trim() || null,
      remarks: formData.remarks.trim() || null,
      package_name: titleToSave
    };

    onSubmit(submissionData);
  };

  const activeProfilesList = teamProfiles.length > 0 ? teamProfiles : profiles;
  const approvedProfiles = activeProfilesList.filter(p => p.approved !== false);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 space-y-4 font-sans text-left text-slate-100">
      
      {/* FORM HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Plus className="w-5 h-5 text-amber-400" />
            {editingLead ? 'Edit Lead Brief' : 'New Lead Capture'}
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            Capture customer details and trip requirements cleanly in one place.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs font-bold h-8 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg">
          ← Cancel
        </Button>
      </div>

      {/* QUICK TEMPLATES BAR */}
      <div className="bg-[#0f1420] border border-slate-800 rounded-xl p-3 space-y-2">
        <div className="flex flex-wrap justify-between items-center text-xs font-black uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-1.5 gap-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick circuit templates — click to auto-fill destinations
          </span>
          <button
            type="button"
            onClick={openTemplateModal}
            className="text-amber-400 hover:text-amber-300 font-extrabold text-[11px] flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
          >
            <Plus className="w-3 h-3" /> + Create / Save Circuit Template
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {allTemplates.map((tmpl, tIdx) => {
            let chipStyle = "border-sky-500/40 text-sky-300 bg-sky-500/10 hover:bg-sky-500/20";
            if (tmpl.category === 'pilgrimage') {
              chipStyle = "border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20";
            } else if (tmpl.category === 'domestic') {
              chipStyle = "border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20";
            }
            return (
              <div
                key={`${tmpl.name}-${tIdx}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-all ${chipStyle}`}
              >
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="hover:underline cursor-pointer flex items-center gap-1"
                  title="Click to auto-fill destinations"
                >
                  {tmpl.name}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditTemplateModal(tmpl);
                  }}
                  className="p-1 hover:text-white rounded hover:bg-white/10 transition-colors ml-0.5"
                  title="Edit existing template in database"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                {tmpl.id && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(tmpl.id);
                    }}
                    className="p-1 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                    title="Delete template from database"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-COLUMN MAIN FORM GRID */}
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: QUICK CAPTURE (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* CUSTOMER DETAILS */}
          <Card className="border border-slate-800 bg-[#161d2f] text-slate-100 shadow-xl rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <User className="w-4 h-4 text-amber-400" /> Customer Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="customer_name" className="text-xs font-bold uppercase tracking-wide text-slate-300">
                    Name <span className="text-rose-400">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="customer_name"
                      placeholder="Customer full name"
                      value={formData.customer_name}
                      onChange={(e) => handleFieldChange('customer_name', e.target.value)}
                      className="pl-8 h-9 text-xs bg-slate-950 border-slate-800 text-slate-100 font-bold placeholder:text-slate-500 focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="contact_number" className="text-xs font-bold uppercase tracking-wide text-slate-300">
                    Mobile <span className="text-rose-400">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="contact_number"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.contact_number}
                      onChange={(e) => handleFieldChange('contact_number', e.target.value)}
                      onBlur={handlePhoneBlur}
                      className={`pl-8 h-9 text-xs bg-slate-950 border-slate-800 text-slate-100 font-bold placeholder:text-slate-500 focus:border-amber-500 ${phoneError ? 'border-rose-500' : ''}`}
                      required
                    />
                  </div>
                  {phoneError && <p className="text-[10px] text-rose-400 font-bold">{phoneError}</p>}
                  {phoneDuplicateLead && (
                    <div className="text-[10px] text-amber-300 bg-amber-500/10 p-1.5 rounded border border-amber-500/30 font-bold">
                      Already registered: <Link to={`/crm/leads/${phoneDuplicateLead.id}`} className="font-bold underline text-amber-400">{phoneDuplicateLead.customer_name}</Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-slate-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      onBlur={handleEmailBlur}
                      className="pl-8 h-9 text-xs bg-slate-950 border-slate-800 text-slate-100 font-bold placeholder:text-slate-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="whatsapp_number" className="text-xs font-bold uppercase tracking-wide text-slate-300">
                    WhatsApp (if different)
                  </Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="whatsapp_number"
                      placeholder="WhatsApp number"
                      value={formData.whatsapp_number}
                      onChange={(e) => handleFieldChange('whatsapp_number', e.target.value)}
                      className="pl-8 h-9 text-xs bg-slate-950 border-slate-800 text-slate-100 font-bold placeholder:text-slate-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DESTINATIONS & STAY PLAN */}
          <Card className="border border-slate-800 bg-[#161d2f] text-slate-100 shadow-xl rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <MapIcon className="w-4 h-4 text-amber-400" /> Destinations & Stay Plan
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomCity(!isCustomCity)}
                  className="text-xs text-amber-400 font-black hover:underline cursor-pointer"
                >
                  {isCustomCity ? 'Select from list' : '+ Type custom city'}
                </button>
              </div>

              {/* Add Stop Toolbar */}
              <div className="p-3 bg-[#0f1420] border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-300 uppercase">Country</Label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="text-xs h-9 border border-slate-800 rounded-lg px-2 bg-slate-950 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-300 uppercase">State / Region</Label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="text-xs h-9 border border-slate-800 rounded-lg px-2 bg-slate-950 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-300 uppercase">City / Stop</Label>
                  {isCustomCity ? (
                    <Input
                      placeholder="e.g. Resort"
                      value={customCityName}
                      onChange={(e) => setCustomCityName(e.target.value)}
                      className="text-xs h-9 bg-slate-950 border-slate-800 text-slate-100 font-bold"
                    />
                  ) : (
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="text-xs h-9 border border-slate-800 rounded-lg px-2 bg-slate-950 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                    >
                      {availableCities.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                    </select>
                  )}
                </div>

                <div className="flex gap-1.5 items-end">
                  <div className="space-y-1 w-20">
                    <Label className="text-[10px] font-bold text-slate-300 uppercase">Nights</Label>
                    <Input
                      type="number"
                      min={1}
                      value={stayNights}
                      onChange={(e) => setStayNights(parseInt(e.target.value, 10) || 1)}
                      className="text-xs h-9 font-bold text-center bg-slate-950 border-slate-800 text-slate-100"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddStayStop}
                    className="h-9 flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-3 rounded-lg shadow-sm"
                  >
                    + Add
                  </Button>
                </div>
              </div>

              {/* Stay Cards List */}
              <div className="space-y-2">
                {stayStops.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-xl p-5 text-center bg-[#0f1420] text-xs text-slate-400 font-bold">
                    No stay stops added yet. Select a destination or click a template above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stayStops.map((stop, idx) => (
                      <div key={stop.id} className="flex items-center gap-2.5 bg-[#0f1420] border border-slate-800 rounded-xl p-3 text-xs shadow-sm">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-white text-sm truncate">{stop.city}</div>
                          <div className="text-xs text-amber-400 font-bold truncate">{stop.state || stop.country}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Input
                            type="number"
                            min={1}
                            value={stop.nights}
                            onChange={(e) => handleUpdateStopNights(idx, parseInt(e.target.value, 10) || 1)}
                            className="w-14 h-8 text-xs text-center font-extrabold bg-slate-950 border-slate-800 text-slate-100 focus:border-amber-500"
                          />
                          <span className="text-xs text-slate-300 font-bold">nights</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveStop(idx)}
                            className="w-6 h-6 rounded-lg hover:bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm ml-1 cursor-pointer font-bold transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total Strip */}
                {totalNights > 0 && (
                  <div className="bg-[#0f1420] border border-amber-500/40 rounded-xl p-2.5 px-3 flex justify-between items-center text-xs font-black text-amber-400">
                    <span>📅 Total: {totalNights} Nights / {totalDays} Days</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Multi-City Circuit</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* TRAVELLERS PAX COUNTER */}
          <Card className="border border-slate-800 bg-[#161d2f] text-slate-100 shadow-xl rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                👥 Travellers
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'adult_count', label: 'Adults', min: 1 },
                  { key: 'child_count', label: 'Children', min: 0 },
                  { key: 'infant_count', label: 'Infants', min: 0 }
                ].map(pax => (
                  <div key={pax.key} className="bg-[#0f1420] border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">{pax.label}</div>
                      <div className="text-lg font-black text-white">{(formData as any)[pax.key]}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleFieldChange(pax.key, (formData as any)[pax.key] + 1)}
                        className="w-6 h-4 border border-slate-700 rounded bg-slate-900 text-[10px] text-amber-400 font-bold flex items-center justify-center hover:bg-slate-800 cursor-pointer"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldChange(pax.key, Math.max(pax.min, (formData as any)[pax.key] - 1))}
                        className="w-6 h-4 border border-slate-700 rounded bg-slate-900 text-[10px] text-amber-400 font-bold flex items-center justify-center hover:bg-slate-800 cursor-pointer"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: TRIP BRIEF & LOGISTICS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border border-slate-800 bg-[#161d2f] text-slate-100 shadow-xl rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                📋 Trip Brief
              </div>

              {/* Auto-generated Lead Title Preview */}
              <div className="bg-[#0f1420] border border-amber-500/30 rounded-xl p-3 text-xs text-amber-400 font-bold space-y-0.5">
                <div className="text-[9px] font-black uppercase tracking-wider text-amber-400/80">Auto-generated lead title</div>
                <div className="truncate text-slate-100">{autoGeneratedTitle || "Add stays to generate title..."}</div>
              </div>

              {/* Departure Date */}
              <div className="space-y-1">
                <Label htmlFor="trip_start_date" className="text-xs font-bold uppercase text-slate-300">Departure Date</Label>
                <Input
                  id="trip_start_date"
                  type="date"
                  value={formData.trip_start_date}
                  onChange={(e) => handleFieldChange('trip_start_date', e.target.value)}
                  className="h-9 text-xs bg-slate-950 border-slate-800 text-slate-100 font-bold focus:border-amber-500"
                />
              </div>

              {/* Budget */}
              <div className="space-y-1">
                <Label htmlFor="budget" className="text-xs font-bold uppercase text-slate-300">Budget per person (₹)</Label>
                <Input
                  id="budget"
                  placeholder="e.g. 80000"
                  value={formData.budget}
                  onChange={(e) => handleFieldChange('budget', e.target.value)}
                  className="h-9 text-xs bg-slate-950 border-slate-800 text-slate-100 font-bold placeholder:text-slate-500 focus:border-amber-500"
                />
              </div>

              {/* Hotel & Transport */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase text-slate-300">Hotel category</Label>
                  <select
                    value={formData.hotel_category}
                    onChange={(e) => handleFieldChange('hotel_category', e.target.value)}
                    className="h-9 text-xs border border-slate-800 rounded-lg px-2 bg-slate-950 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="3 Star">3 Star Comfort</option>
                    <option value="4 Star">4 Star Premium</option>
                    <option value="5 Star Luxury">5 Star Luxury</option>
                    <option value="Heritage">Heritage / Boutique</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase text-slate-300">Transport</Label>
                  <select
                    value={formData.transport_preference}
                    onChange={(e) => handleFieldChange('transport_preference', e.target.value)}
                    className="h-9 text-xs border border-slate-800 rounded-lg px-2 bg-slate-950 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Private SUV">Private SUV</option>
                    <option value="Private Sedan">Private Sedan</option>
                    <option value="Flight + Transfer">Flight + Transfer</option>
                    <option value="Coach">Coach / Volvo</option>
                  </select>
                </div>
              </div>

              {/* Travel Theme */}
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-slate-300">Travel theme</Label>
                <select
                  value={formData.travel_theme}
                  onChange={(e) => handleFieldChange('travel_theme', e.target.value)}
                  className="h-9 text-xs border border-slate-800 rounded-lg px-2 bg-slate-950 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                >
                  <option value="Family Holiday">Family Holiday</option>
                  <option value="Honeymoon / Romantic">Honeymoon / Romantic</option>
                  <option value="Adventure">Adventure & Treks</option>
                  <option value="Pilgrimage">Pilgrimage & Yatra</option>
                  <option value="Beach & Leisure">Beach & Leisure</option>
                  <option value="Corporate">Business + Leisure</option>
                </select>
              </div>

              <div className="h-[1px] bg-slate-800 my-2" />

              {/* Priority Pills */}
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-slate-300">Priority</Label>
                <div className="flex gap-2">
                  {[
                    { label: '🔴 Hot', val: 'High', style: 'border-red-500/40 text-red-300 bg-red-500/15' },
                    { label: '🟡 Warm', val: 'Medium', style: 'border-amber-500/40 text-amber-300 bg-amber-500/15' },
                    { label: '⚪ Cold', val: 'Low', style: 'border-slate-600 text-slate-300 bg-slate-800' }
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => handleFieldChange('priority', p.val)}
                      className={`flex-1 py-1.5 text-xs font-black rounded-lg border transition-all cursor-pointer text-center ${
                        formData.priority === p.val ? `${p.style} ring-1 ring-amber-500` : 'border-slate-800 text-slate-400 bg-slate-950'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead Source */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold uppercase text-slate-300">
                    Lead source <span className="text-rose-400">*</span>
                  </Label>
                  {onOpenUserManagement && (
                    <button
                      type="button"
                      onClick={onOpenUserManagement}
                      className="text-[10px] text-amber-400 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      + Manage Sources & Team
                    </button>
                  )}
                </div>
                <select
                  value={formData.source}
                  onChange={(e) => handleFieldChange('source', e.target.value)}
                  className="h-9 text-xs border border-slate-800 rounded-lg px-2 bg-slate-950 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                >
                  {dbLeadSources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              {/* Assigned To */}
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-slate-300">Assigned to</Label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => handleFieldChange('assigned_to', e.target.value)}
                  className="h-9 text-xs border border-slate-800 rounded-lg px-2 bg-slate-950 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                >
                  <option value="unassigned">Unassigned</option>
                  {approvedProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                  ))}
                </select>
              </div>

              {/* Follow up date */}
              <div className="space-y-1">
                <Label htmlFor="follow_up_date" className="text-xs font-bold uppercase text-slate-300">Follow-up date</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => handleFieldChange('follow_up_date', e.target.value)}
                  className="h-9 text-xs bg-slate-950 border-slate-800 text-slate-100 font-bold focus:border-amber-500"
                />
              </div>

              {/* Initial Remarks / Notes */}
              <div className="space-y-1">
                <Label htmlFor="remarks" className="text-xs font-bold uppercase text-slate-300">Initial remarks / notes</Label>
                <Textarea
                  id="remarks"
                  placeholder="Client preferences, budget notes, hotel requests..."
                  value={formData.remarks}
                  onChange={(e) => handleFieldChange('remarks', e.target.value)}
                  className="text-xs bg-slate-950 border-slate-800 text-slate-100 font-bold placeholder:text-slate-500 focus:border-amber-500 min-h-[60px]"
                  rows={2}
                />
              </div>

              {/* WhatsApp Instant Greeting Toggle */}
              <div className="p-3 bg-[#0f1420] border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Instant WhatsApp Welcome
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Send automatic greeting on lead save</div>
                </div>
                <Switch defaultChecked />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md"
                  >
                    💾 Save Lead
                  </Button>
                  <Button
                    type="submit"
                    onClick={() => {
                      (window as any)._buildItineraryAfterSave = true;
                    }}
                    className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Save & Build Itinerary
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="w-full h-9 text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </form>

      {/* CREATE / EDIT CIRCUIT TEMPLATE MODAL */}
      <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
        <DialogContent className="sm:max-w-[520px] bg-[#161d2f] border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-amber-400 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" /> {editingTemplateId ? 'Edit Existing Circuit Template' : 'Create / Save Quick Circuit Template'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              Build or save destination stops as a reusable template chip for 1-click auto-fill on future leads.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-slate-300">Template Name</Label>
                <Input
                  placeholder="e.g. 🏰 Rajasthan Golden Circuit 5N"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="h-9 text-xs bg-slate-950 border-slate-800 text-slate-100 font-bold focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase text-slate-300">Category Tag</Label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value as any)}
                  className="h-9 text-xs border border-slate-800 rounded-lg px-2 bg-slate-950 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                >
                  <option value="domestic">🌿 Domestic Circuit</option>
                  <option value="pilgrimage">⛰ Pilgrimage / Yatra Circuit</option>
                  <option value="international">✈ International Circuit</option>
                </select>
              </div>
            </div>

            {/* STOPS INCLUDED LIST */}
            <div className="p-3 bg-[#0f1420] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  Stops Included ({templateStops.length})
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Total Nights: {templateStops.reduce((sum, s) => sum + s.nights, 0)}N
                </span>
              </div>

              {templateStops.length === 0 ? (
                <div className="text-xs text-slate-400 italic text-center py-2 border border-dashed border-slate-800 rounded-lg">
                  No stops added yet. Use the form below to add destination stops to this template.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                  {templateStops.map((s, i) => (
                    <span key={i} className="text-xs bg-slate-900 border border-slate-800 text-slate-200 pl-2 pr-1 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-sm">
                      <span>{s.city}</span>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1 rounded font-black">{s.nights}N</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStopFromTemplate(i)}
                        className="hover:text-rose-400 text-slate-400 p-0.5 ml-0.5 transition-colors"
                        title="Remove stop"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* INLINE ADD STOP FORM WITH CASCADING COUNTRY STATE CITY DROPDOWNS */}
              <div className="border-t border-slate-800/80 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Plus className="w-3 h-3 text-amber-400" /> Add Stop to Template
                  </div>
                  <button
                    type="button"
                    onClick={() => setTmplIsCustom(!tmplIsCustom)}
                    className="text-[10px] text-amber-400 font-extrabold hover:underline cursor-pointer"
                  >
                    {tmplIsCustom ? 'Select from list' : '+ Type custom city'}
                  </button>
                </div>

                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Country</Label>
                      <select
                        value={tmplCountry}
                        onChange={(e) => handleTmplCountryChange(e.target.value)}
                        className="text-xs h-9 border border-slate-800 rounded-lg px-2 bg-slate-900 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                      >
                        {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">State / Region</Label>
                      <select
                        value={tmplState}
                        onChange={(e) => handleTmplStateChange(e.target.value)}
                        className="text-xs h-9 border border-slate-800 rounded-lg px-2 bg-slate-900 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                      >
                        {tmplAvailableStates.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">City / Stop</Label>
                      {tmplIsCustom ? (
                        <Input
                          placeholder="e.g. Resort"
                          value={tmplCustomCity}
                          onChange={(e) => setTmplCustomCity(e.target.value)}
                          className="text-xs h-9 bg-slate-900 border-slate-800 text-slate-100 font-bold"
                        />
                      ) : (
                        <select
                          value={tmplCity}
                          onChange={(e) => setTmplCity(e.target.value)}
                          className="text-xs h-9 border border-slate-800 rounded-lg px-2 bg-slate-900 text-slate-100 w-full font-bold focus:border-amber-500 focus:outline-none"
                        >
                          {tmplAvailableCities.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                        </select>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase">Nights</Label>
                      <Input
                        type="number"
                        min={1}
                        value={tmplNights}
                        onChange={(e) => setTmplNights(parseInt(e.target.value, 10) || 1)}
                        className="text-xs h-9 font-extrabold text-center bg-slate-900 border-slate-800 text-slate-100 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddStopToTemplate}
                    className="w-full h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> + Add Stop to Circuit ({tmplIsCustom ? tmplCustomCity || 'Custom' : tmplCity} · {tmplNights}N)
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateTemplateOpen(false)}
              className="h-9 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveCustomTemplate}
              className="h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs"
            >
              💾 {editingTemplateId ? 'Update Circuit Template' : 'Save Circuit Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadForm;