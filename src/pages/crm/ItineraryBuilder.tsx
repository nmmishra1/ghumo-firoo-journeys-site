// ItineraryBuilder - CRM Itinerary Visual Builder Component
import React, { useState, useEffect, useMemo } from 'react';
import { fetchCachedJson } from '@/utils/crmCache';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Plane, Car, Bed, Sparkles, Utensils, Anchor, Train, Shield, Lock, 
  Trash2, Edit, Plus, ChevronUp, ChevronDown, Copy, Check, Eye, EyeOff, 
  FileText, Send, Share2, Phone, Mail, MessageCircle, RefreshCw, 
  Sparkle, Download, Upload, Loader2, ArrowLeft, ArrowRight, MoreVertical, Layout, 
  Settings, Printer, HelpCircle, Search, MapPin, Calendar, IndianRupee, BarChart3, X, UserPlus
} from 'lucide-react';

interface ItineraryBuilderProps {
  leadId: string;
  activeLead: any;
  onBack: () => void;
  userProfile: any;
  initialDocView?: 'brochure' | 'voucher' | 'invoice';
  onOpenCsvImport?: () => void;
  onOpenUserManagement?: () => void;
}

const apiBase = import.meta.env.VITE_API_BASE_URL || '/php-backend';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

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

function normalizeDateString(dateVal: any): string {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (!trimmed) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    if (trimmed.includes('T')) {
      const parts = trimmed.split('T');
      if (/^\d{4}-\d{2}-\d{2}$/.test(parts[0])) return parts[0];
    }
    const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyy) {
      const day = ddmmyyyy[1].padStart(2, '0');
      const month = ddmmyyyy[2].padStart(2, '0');
      const year = ddmmyyyy[3];
      return `${year}-${month}-${day}`;
    }
    const textMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)(?:\s+(\d{4}))?$/);
    if (textMatch) {
      const day = textMatch[1].padStart(2, '0');
      const monthStr = textMatch[2].toLowerCase();
      const currentYear = new Date().getFullYear();
      const year = textMatch[3] || String(currentYear);
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthIdx = monthNames.findIndex(m => monthStr.startsWith(m));
      if (monthIdx !== -1) {
        const month = String(monthIdx + 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    const parsedDate = new Date(trimmed);
    if (!isNaN(parsedDate.getTime())) {
      const yyyy = parsedDate.getFullYear();
      const mm = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(parsedDate.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return '';
}

function getLeadStartDate(activeLead: any, itinerary?: any): string {
  const candidates = [
    activeLead?.trip_start_date,
    activeLead?.travel_start_date,
    activeLead?.travel_date,
    activeLead?.travel_dates,
    activeLead?.tripStartDate,
    activeLead?.travelDate,
    activeLead?.start_date,
    activeLead?.travelMonth,
    itinerary?.travel_start_date
  ];
  for (const cand of candidates) {
    const norm = normalizeDateString(cand);
    if (norm) return norm;
  }
  return new Date().toISOString().split('T')[0];
}

function getLeadGuestCounts(activeLead: any, itinerary?: any): { adults: number; children: number } {
  let adults = Number(
    activeLead?.adult_count ??
    activeLead?.adults ??
    activeLead?.pax_count ??
    activeLead?.total_pax ??
    activeLead?.guest_count ??
    activeLead?.numberOfTravelers ??
    activeLead?.numberOfGuests ??
    itinerary?.adult_count ??
    2
  );
  let children = Number(
    activeLead?.child_count ??
    activeLead?.children ??
    activeLead?.kids_count ??
    activeLead?.kids ??
    itinerary?.child_count ??
    0
  );
  if (isNaN(adults) || adults < 1) adults = 1;
  if (isNaN(children) || children < 0) children = 0;
  return { adults, children };
}

async function getItineraryByLeadId({ leadId, signal }: { leadId: string; signal?: AbortSignal }) {
  const headers = await getAuthHeader();
  const res = await fetch(`${apiBase}/itinerary_load.php?lead_id=${leadId}`, { headers, signal });
  if (!res.ok) throw new Error('Failed to load itinerary from server');
  return await res.json();
}

async function getInventoryByCity({ cityId, cityName, signal }: { cityId?: string; cityName?: string; signal?: AbortSignal }) {
  const headers = await getAuthHeader();
  let url = '';
  if (cityId) {
    url = `${apiBase}/inventory_by_city.php?city_id=${cityId}&city_name=${encodeURIComponent(cityName || '')}`;
  } else {
    url = `${apiBase}/inventory_by_city.php?city_name=${encodeURIComponent(cityName || '')}`;
  }
  const res = await fetch(url, { headers, signal });
  if (!res.ok) throw new Error('Failed to fetch city inventory');
  return await res.json();
}

async function saveItineraryDraft({ payload }: { payload: any }) {
  const headers = await getAuthHeader();
  const res = await fetch(`${apiBase}/itinerary_save.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data && data.success === false)) {
    throw new Error(data.message || data.error || 'Failed to save itinerary draft');
  }
  return data;
}

// Collection of seed excursions if database is empty
const SEEDED_EXCURSIONS = [
  {
    excursion_name: 'Universal Studios Singapore Ticket',
    city: 'Singapore',
    category: 'Theme Park',
    duration_hours: 8,
    description: 'Go beyond the screen and Ride The Movies at Universal Studios Singapore. Experience cutting-edge rides, shows, and attractions based on your favorite blockbuster films.',
    adult_rate: 4800,
    child_rate: 3600,
    photo_url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600&auto=format&fit=crop'
  },
  {
    excursion_name: 'Gardens by the Bay Double Dome Ticket',
    city: 'Singapore',
    category: 'Nature / Sightseeing',
    duration_hours: 4,
    description: 'Visit the Flower Dome and Cloud Forest. See the worlds largest glass greenhouse and a 35-meter tall indoor waterfall covered in lush vegetation.',
    adult_rate: 2200,
    child_rate: 1500,
    photo_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=600&auto=format&fit=crop'
  },
  {
    excursion_name: 'Desert Safari with BBQ Dinner',
    city: 'Dubai',
    category: 'Adventure',
    duration_hours: 6,
    description: 'Experience dune bashing, camel riding, sandboarding, henna painting, Tanoura dance, belly dancing, and a delicious BBQ buffet dinner under the starlit sky.',
    adult_rate: 3500,
    child_rate: 2500,
    photo_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop'
  },
  {
    excursion_name: 'Burj Khalifa 124th Floor Ticket (At the Top)',
    city: 'Dubai',
    category: 'Sightseeing',
    duration_hours: 2,
    description: 'Enjoy panoramic views of Dubai from the observation deck on the 124th and 125th floors of the worlds tallest building.',
    adult_rate: 4500,
    child_rate: 3200,
    photo_url: 'https://images.unsplash.com/photo-1582948636199-ea9a7384a20b?q=80&w=600&auto=format&fit=crop'
  },
  {
    excursion_name: 'Gondola Ride in Gulmarg (Phase 1 & 2)',
    city: 'Kashmir',
    category: 'Adventure',
    duration_hours: 3,
    description: 'Ride the Gulmarg Gondola, one of the highest cable cars in the world, to Kongdori and Apharwat Peak for stunning views of the Himalayan ranges.',
    adult_rate: 1800,
    child_rate: 1800,
    photo_url: 'https://images.unsplash.com/photo-1589136775550-13f563d1a896?q=80&w=600&auto=format&fit=crop'
  },
  {
    excursion_name: 'Shikara Ride on Dal Lake (1 Hour)',
    city: 'Kashmir',
    category: 'Leisure',
    duration_hours: 1,
    description: 'Relax on a traditional wooden boat ride on Dal Lake in Srinagar, exploring floating gardens and vibrant local markets.',
    adult_rate: 800,
    child_rate: 800,
    photo_url: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=600&auto=format&fit=crop'
  }
];

// --- Journey Composer Database Masters ---
const destinationAutocompleteList = [
  { city: 'Shimla', state: 'Himachal Pradesh', country: 'India', label: 'Shimla, Himachal Pradesh, India', region: 'himachal' },
  { city: 'Manali', state: 'Himachal Pradesh', country: 'India', label: 'Manali, Himachal Pradesh, India', region: 'himachal' },
  { city: 'Dharamshala', state: 'Himachal Pradesh', country: 'India', label: 'Dharamshala, Himachal Pradesh, India', region: 'himachal' },
  { city: 'Dalhousie', state: 'Himachal Pradesh', country: 'India', label: 'Dalhousie, Himachal Pradesh, India', region: 'himachal' },
  { city: 'Kaza', state: 'Himachal Pradesh', country: 'India', label: 'Kaza (Spiti Valley), Himachal Pradesh, India', region: 'himachal' },
  { city: 'Sangla', state: 'Himachal Pradesh', country: 'India', label: 'Sangla (Kinnaur), Himachal Pradesh, India', region: 'himachal' },
  { city: 'Kochi', state: 'Kerala', country: 'India', label: 'Kochi, Kerala, India', region: 'kerala' },
  { city: 'Munnar', state: 'Kerala', country: 'India', label: 'Munnar, Kerala, India', region: 'kerala' },
  { city: 'Thekkady', state: 'Kerala', country: 'India', label: 'Thekkady, Kerala, India', region: 'kerala' },
  { city: 'Alleppey', state: 'Kerala', country: 'India', label: 'Alappuzha (Alleppey), Kerala, India', region: 'kerala' },
  { city: 'Kovalam', state: 'Kerala', country: 'India', label: 'Kovalam, Kerala, India', region: 'kerala' },
  { city: 'Kumarakom', state: 'Kerala', country: 'India', label: 'Kumarakom, Kerala, India', region: 'kerala' },
  { city: 'Varkala', state: 'Kerala', country: 'India', label: 'Varkala, Kerala, India', region: 'kerala' },
  { city: 'Wayanad', state: 'Kerala', country: 'India', label: 'Wayanad, Kerala, India', region: 'kerala' },
  { city: 'Athirappilly', state: 'Kerala', country: 'India', label: 'Athirappilly, Kerala, India', region: 'kerala' },
  { city: 'Singapore', state: 'Central', country: 'Singapore', label: 'Singapore City, Singapore', region: 'international' }
];

const destinationCircuits: Record<string, string[]> = {
  'Shimla': ['Shimla', 'Kufri', 'Mashobra', 'Naldehra', 'Chail'],
  'Manali': ['Solang Valley', 'Atal Tunnel', 'Sissu', 'Rohtang Pass', 'Naggar', 'Kullu'],
  'Dharamshala': ['McLeodganj', 'Naddi', 'Norbulingka', 'Kangra'],
  'Dalhousie': ['Khajjiar', 'Chamba', 'Kalatop'],
  'Kaza': ['Kaza', 'Tabo', 'Dhankar', 'Kibber', 'Langza'],
  'Sangla': ['Sangla', 'Chitkul', 'Kalpa', 'Nako'],
  'Kochi': ['Fort Kochi', 'Mattancherry', 'Marine Drive'],
  'Munnar': ['Tea Gardens', 'Eravikulam National Park', 'Mattupetty Dam', 'Top Station'],
  'Thekkady': ['Periyar Wildlife Sanctuary', 'Spice Plantation', 'Bamboo Rafting'],
  'Alleppey': ['Houseboat Cruise', 'Backwaters', 'Village Tour'],
  'Kumarakom': ['Bird Sanctuary', 'Lake Cruise'],
  'Kovalam': ['Lighthouse Beach', 'Hawa Beach', 'Samudra Beach'],
  'Varkala': ['Cliff Beach', 'Janardanaswamy Temple'],
  'Wayanad': ['Edakkal Caves', 'Soochipara Falls', 'Banasura Sagar'],
  'Athirappilly': ['Athirappilly Falls', 'Vazhachal Falls']
};

const suggestedJourneysTemplates = [
  {
    destination: 'Shimla',
    nights: 3,
    title: '3N Shimla Popular Getaway',
    cities: 'Shimla, Kufri, Mashobra',
    stars: '4 Star',
    meals: 'MAP (Breakfast + Dinner)',
    transfers: 'Private Sedan intercity + local',
    sightseeings: 4,
    price: 18999,
    popularity: '★★★★★ Most Popular',
    bookCount: 120,
    theme: 'Family / Sightseeing',
    hotelName: 'Sterling Shimla',
    imageUrl: 'https://images.unsplash.com/photo-1597075095681-7917c80521e1?q=80&w=400&auto=format&fit=crop',
    days: [
      { day_number: 1, title: 'Arrival in Shimla & Ridge Walk', description: 'Arrive at Chandigarh airport/railway station. Drive to Shimla (3.5 hrs). Check in to Sterling Shimla. Evening at leisure to stroll on Mall Road & The Ridge.', type: 'package' },
      { day_number: 2, title: 'Kufri & Mashobra Excursion', description: 'After breakfast, drive to Kufri. Enjoy horse riding, Himalayan Nature Park, and fun activities. Return via Mashobra pine forests.', type: 'package' },
      { day_number: 3, title: 'Jakhoo Temple & Local Sightseeing', description: 'Visit the famous Jakhoo Temple (Lord Hanuman statue). Afternoon visit to Vice Regal Lodge and Army Heritage Museum.', type: 'package' },
      { day_number: 4, title: 'Departure from Shimla', description: 'After breakfast, checkout from hotel and transfer back to Chandigarh airport/railway station for departure.', type: 'package' }
    ]
  },
  {
    destination: 'Shimla',
    nights: 3,
    title: '2N Shimla + 1N Chail Recommended Tour',
    cities: 'Shimla, Kufri, Chail',
    stars: '4 Star',
    meals: 'MAP (Breakfast + Dinner)',
    transfers: 'Private SUV intercity + local',
    sightseeings: 5,
    price: 21500,
    popularity: 'Best Seller',
    bookCount: 95,
    theme: 'Scenic / Couple',
    hotelName: 'Sterling Shimla / Tarika Resort',
    imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=400&auto=format&fit=crop',
    days: [
      { day_number: 1, title: 'Arrival in Shimla', description: 'Arrive and transfer to Shimla hotel. Rest and check out Mall Road in the evening.', type: 'package' },
      { day_number: 2, title: 'Shimla Sightseeing & Kufri', description: 'Full day excursion to Kufri and Mashobra. Visit Green Valley and Jakhoo Temple.', type: 'package' },
      { day_number: 3, title: 'Transfer to Chail Palace', description: 'Drive to Chail (1.5 hrs). Check into Chail Palace. Visit the highest cricket ground and Kali Tibba Temple.', type: 'package' },
      { day_number: 4, title: 'Departure from Chail', description: 'After breakfast, checkout and drive to Chandigarh airport for departure.', type: 'package' }
    ]
  },
  {
    destination: 'Shimla',
    nights: 3,
    title: '2N Shimla + 1N Narkanda Family Special',
    cities: 'Shimla, Narkanda',
    stars: '4 Star',
    meals: 'MAP (Breakfast + Dinner)',
    transfers: 'Private Sedan intercity + local',
    sightseeings: 4,
    price: 20999,
    popularity: 'Family Favourite',
    bookCount: 64,
    theme: 'Nature / Family',
    hotelName: 'Snow Valley Shimla / Tethys Resort',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=400&auto=format&fit=crop',
    days: [
      { day_number: 1, title: 'Arrival & Ridge Walk in Shimla', description: 'Arrive in Shimla and transfer to Snow Valley Resorts.', type: 'package' },
      { day_number: 2, title: 'Kufri Excursion & Sightseeing', description: 'Excursion to Kufri and local Jakhoo Temple tour.', type: 'package' },
      { day_number: 3, title: 'Transfer to Narkanda Hatu Peak', description: 'Drive to Narkanda (2.5 hrs). Check into resort. Visit Hatu Peak (11,000 ft) for a 360-degree Himalayan view.', type: 'package' },
      { day_number: 4, title: 'Departure from Narkanda', description: 'Checkout and transfer back to Chandigarh airport/railway station.', type: 'package' }
    ]
  },
  {
    destination: 'Munnar',
    nights: 4,
    title: '2N Munnar + 1N Thekkady + 1N Alleppey Backwater Escape',
    cities: 'Munnar, Thekkady, Alleppey',
    stars: '4 Star',
    meals: 'CP (Breakfast) + Houseboat Full Meals',
    transfers: 'Private Sedan intercity + local',
    sightseeings: 7,
    price: 24999,
    popularity: '★★★★★ Most Popular',
    bookCount: 185,
    theme: 'Nature / Houseboat / Couple',
    hotelName: 'Blanket Hotel / Spice Village / Deluxe Houseboat',
    imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=400&auto=format&fit=crop',
    days: [
      { day_number: 1, title: 'Arrival in Kochi & Drive to Munnar', description: 'Arrive at Kochi airport. Scenic drive to Munnar (4 hrs) passing Valara & Cheeyappara waterfalls. Check in to Blanket Hotel.', type: 'package' },
      { day_number: 2, title: 'Munnar Tea Gardens & Eravikulam National Park', description: 'Visit Eravikulam National Park (home to Nilgiri Tahr), Tea Museum, Mattupetty Dam, and Echo Point.', type: 'package' },
      { day_number: 3, title: 'Transfer to Thekkady & Spice Plantation Tour', description: 'Drive to Thekkady (3 hrs). Spice plantation tour, elephant ride experience, and evening martial arts show (Kalaripayattu).', type: 'package' },
      { day_number: 4, title: 'Transfer to Alleppey Houseboat', description: 'Drive to Alleppey (3.5 hrs). Check into traditional luxury houseboat. Cruise backwaters and lakes with all meals served onboard.', type: 'package' },
      { day_number: 5, title: 'Checkout & Departure from Kochi', description: 'Morning cruise, checkout at 09:00 AM, and transfer back to Kochi airport for departure.', type: 'package' }
    ]
  },
  {
    destination: 'Munnar',
    nights: 4,
    title: '3N Munnar + 1N Kochi Explorer',
    cities: 'Munnar, Kochi',
    stars: '4 Star',
    meals: 'CP (Breakfast)',
    transfers: 'Private Sedan intercity + local',
    sightseeings: 6,
    price: 22000,
    popularity: 'Best Seller',
    bookCount: 110,
    theme: 'Nature / Hill Station',
    hotelName: 'Amber Dale Munnar / Casino Hotel Kochi',
    imageUrl: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=400&auto=format&fit=crop',
    days: [
      { day_number: 1, title: 'Arrival in Kochi & Drive to Munnar', description: 'Arrive at Kochi and drive to Munnar. Evening at leisure.', type: 'package' },
      { day_number: 2, title: 'Eravikulam & Tea Gardens Sightseeing', description: 'Explore Eravikulam National Park and Munnar local tea estates.', type: 'package' },
      { day_number: 3, title: 'Top Station & Kundala Lake Drive', description: 'Scenic drive to Top Station (highest point in Munnar) for panoramic valley views.', type: 'package' },
      { day_number: 4, title: 'Transfer to Kochi & Fort Kochi Tour', description: 'Drive to Kochi. Visit Fort Kochi, Chinese Fishing Nets, and Mattancherry Palace.', type: 'package' },
      { day_number: 5, title: 'Departure from Kochi', description: 'After breakfast, checkout and transfer to Kochi airport.', type: 'package' }
    ]
  },
  {
    destination: 'Munnar',
    nights: 4,
    title: '2N Munnar + 2N Kovalam Honeymoon Special',
    cities: 'Munnar, Kovalam',
    stars: '5 Star',
    meals: 'MAP (Breakfast + Dinner)',
    transfers: 'Private Innova Crysta',
    sightseeings: 8,
    price: 34999,
    popularity: 'Honeymoon Special',
    bookCount: 142,
    theme: 'Luxury / Romantic',
    hotelName: 'Scenic Munnar / The Leela Kovalam',
    imageUrl: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=400&auto=format&fit=crop',
    days: [
      { day_number: 1, title: 'Arrival in Kochi & Luxury Munnar Transfer', description: 'VIP greet and transfer to Munnar. Romantic dinner at resort.', type: 'package' },
      { day_number: 2, title: 'Munnar Romantic Tour & Tea Valley walk', description: 'Explore Eravikulam Park and Mattupetty lake. Candlelight dinner.', type: 'package' },
      { day_number: 3, title: 'Fly/Drive to Kovalam Beach Resort', description: 'Transfer to Kovalam. Check in to premium sea-view cliff rooms. Evening beach walk.', type: 'package' },
      { day_number: 4, title: 'Kovalam Beach Activities & Day Cruise', description: 'Enjoy Samudra Beach, Lighthouse climb, and private speedboat ride.', type: 'package' },
      { day_number: 5, title: 'Departure from Trivandrum', description: 'Check out and transfer to Trivandrum/Kochi airport for flight.', type: 'package' }
    ]
  }
];

interface TripContextStripProps {
  itinerary: any;
  activeLead: any;
  cityNames: string[];
}

export function TripContextStrip({ itinerary, activeLead, cityNames }: TripContextStripProps) {
  const guestInfo = getLeadGuestCounts(activeLead, itinerary);
  const startDate = getLeadStartDate(activeLead, itinerary);
  return (
    <div className="w-full bg-[#1A2342]/70 text-slate-100 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-[#C9A25A]/30 border-l-4 border-l-[#C9A25A] backdrop-blur-md rounded-xl text-xs font-semibold">
      <div className="flex items-center gap-2">
        <span className="text-gray-400 font-sans">Client:</span>
        <span className="text-white font-display font-bold text-sm">{itinerary?.customer_name || activeLead?.customer_name || 'Guest'}</span>
        <span className="text-slate-500 font-mono">
          (#{activeLead?.enquiry_number || activeLead?.lead_id || '---'})
        </span>
      </div>
      
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-gray-400 font-sans">Destinations:</span>
        {cityNames.map(city => (
          <Badge key={city} className="bg-[#C9A25A]/20 text-[#C9A25A] border border-[#C9A25A]/40 font-display text-xs font-bold">
            {city}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div>
          <span className="text-slate-400 mr-1.5">Guests:</span>
          <span className="text-white font-bold">{guestInfo.adults} Adults{guestInfo.children > 0 ? `, ${guestInfo.children} Children` : ''}</span>
        </div>
        <div>
          <span className="text-slate-400 mr-1.5">Duration:</span>
          <span className="text-white font-bold">{itinerary?.total_nights ? `${itinerary.total_nights} N` : '---'}</span>
        </div>
        <div>
          <span className="text-slate-400 mr-1.5">Dates:</span>
          <span className="text-white font-bold">
            {startDate ? `${startDate}${itinerary?.travel_end_date ? ` to ${itinerary.travel_end_date}` : ''}` : '---'}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#C9A25A]/15 shrink-0" />

        {/* Per Person */}
        <div className="flex flex-col gap-0.5 justify-center">
          <span className="text-[9px] text-white/35 uppercase tracking-wider font-semibold font-display">
            PER PERSON
          </span>
          <span className="text-white text-sm font-bold font-display">
            ₹{Math.round(finalPackagePrice / ((itinerary?.adult_count || 2) + (itinerary?.child_count || 0))).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#C9A25A]/15 shrink-0" />

        {/* Margin status pill */}
        <div>
          <span className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold border inline-block ${
            markupPercent > 20 
              ? 'bg-emerald-500/15 text-[#34d399] border-emerald-500/30' 
              : markupPercent >= 10 
                ? 'bg-amber-500/15 text-[#C9A25A] border-amber-500/30' 
                : 'bg-rose-500/15 text-[#f87171] border-rose-500/30'
          }`}>
            {markupPercent}%
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#C9A25A]/15 shrink-0" />

        {/* Supplier Cost */}
        <div className="flex flex-col gap-0.5 justify-center">
          <span className="text-[9px] text-white/35 uppercase tracking-wider font-semibold font-display">
            SUPPLIER COST
          </span>
          <span className="text-white/50 text-xs font-semibold font-display">
            ₹{Math.round(baseCostTotal).toLocaleString('en-IN')}
          </span>
        </div>

        {isDirty && (
          <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-2 py-0.5 rounded-lg animate-pulse">
            Unsaved Changes
          </div>
        )}

        {/* Breakdown button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="ml-auto bg-transparent border border-[#C9A25A]/30 text-[#C9A25A]/70 hover:text-[#C9A25A] hover:bg-[#C9A25A]/5 px-3 py-1.5 rounded-[7px] text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{isOpen ? 'Close Breakdown' : 'Breakdown Details'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto h-[calc(100%-64px)]">
          <div className="space-y-3 bg-[#1A2342] p-4 rounded-xl border border-[#C9A25A]/20 text-left">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 font-display flex items-center gap-1.5 border-b border-[#C9A25A]/20 pb-2 mb-1">
              💰 Cost Component Breakdown
            </h4>
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Bed className="w-3.5 h-3.5 text-purple-400" /> Hotels Cost</span>
                <span className="font-bold font-display text-white">₹{Math.round(sumHotels).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-emerald-400" /> Transport Cost</span>
                <span className="font-bold font-display text-white">₹{Math.round(sumTransports).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" /> Activities Cost</span>
                <span className="font-bold font-display text-white">₹{Math.round(sumActivities).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Plane className="w-3.5 h-3.5 text-blue-400" /> Flights Cost</span>
                <span className="font-bold font-display text-white">₹{Math.round(sumOthers).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 border-t border-[#C9A25A]/10 pt-2">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-indigo-400" /> Visa Cost</span>
                <span className="font-bold font-display text-white">₹{Math.round(visaCost).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-[#1A2342] p-4 rounded-xl border border-[#C9A25A]/20 text-left flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 font-display flex items-center gap-1.5 border-b border-[#C9A25A]/20 pb-2 mb-3">
                📈 Markup Margin Controls
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                  <Label className="text-slate-300 font-bold">Applied Mark-up</Label>
                  <span className={`font-bold text-xs px-2 py-0.5 rounded-lg border ${marginBadgeColor}`}>{markupPercent}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0}
                    max={50}
                    step={1}
                    value={[markupPercent]}
                    onValueChange={(val) => setMarkupPercent(val[0])}
                    className="flex-1 cursor-pointer"
                  />
                  <Input 
                    type="number" 
                    className="h-8 w-14 bg-[#0B1026]/80 border border-[#C9A25A]/20 text-white text-right text-xs font-mono rounded-lg focus:border-[#C9A25A] focus-visible:ring-0 focus-visible:ring-offset-0" 
                    value={markupPercent} 
                    onChange={e => setMarkupPercent(parseFloat(e.target.value) || 0)} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-[#C9A25A]/20 pt-2.5">
              <div className="flex justify-between text-gray-400">
                <span>Gross Net Cost:</span>
                <span className="font-display font-bold text-white">₹{Math.round(baseCostTotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Markup profit yield:</span>
                <span className="font-display font-bold text-white">₹{Math.round(markupAmtTotal).toLocaleString('en-IN')}</span>
              </div>
              <div className={`p-2 rounded-lg border text-center flex justify-between items-center ${
                pct >= 20 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                pct >= 10 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-rose-500/10 border-rose-500/20 text-rose-450'
              }`}>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400">Profit Margin:</span>
                <span className="text-xs font-bold font-display">₹{Math.round(profitMarginTotal).toLocaleString('en-IN')} ({pct}%)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-[#1A2342] p-4 rounded-xl border border-[#C9A25A]/20 text-left flex flex-col justify-between">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 font-display flex items-center gap-1.5 border-b border-[#C9A25A]/20 pb-2 mb-1">
              ⚙️ Workspace Actions
            </h4>
            <div className="space-y-2.5">
              <Button 
                onClick={handleSaveItinerary} 
                className="w-full bg-[#C9A25A] text-[#0B1026] hover:bg-[#D8B97A] font-display font-extrabold text-xs h-9 rounded-xl shadow-md border-0 uppercase tracking-wider"
              >
                <Check className="w-4 h-4 mr-2" /> Save & Sync Workspace
              </Button>

              <Button 
                variant="outline" 
                onClick={() => window.open(`/crm/leads/${activeLead?.id}/brochure`, '_blank')} 
                className="w-full text-xs h-9 font-display font-bold bg-[#1A2342] text-white hover:bg-[#1A2342]/80 border border-[#C9A25A]/30 rounded-xl transition-all uppercase tracking-wider"
              >
                <FileText className="w-4 h-4 mr-2" /> Preview Client Brochure
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOpenVoucher}
                  disabled={isDirty}
                  className="text-[10px] h-8 font-bold border border-[#C9A25A]/20 rounded-xl hover:bg-slate-800 bg-[#0B1026] text-slate-200 disabled:opacity-40"
                >
                  <Car className="w-3.5 h-3.5 mr-1" /> Voucher
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOpenInvoice}
                  disabled={isDirty}
                  className="text-[10px] h-8 font-bold border border-[#C9A25A]/20 rounded-xl hover:bg-slate-800 bg-[#0B1026] text-slate-200 disabled:opacity-40"
                >
                  <IndianRupee className="w-3.5 h-3.5 mr-1" /> Invoice
                </Button>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 text-center italic mt-2">
              Changes reflect live in your agent workspace costing sheet.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BlockItemProps {
  block: any;
  dayId: string;
  dayNumber: number;
  viewMode: 'sales' | 'operations';
  itinerary: any;
  handleUpdateBlockField: (dayId: string, blockId: string, field: string, value: any) => void;
  handleUpdateBlockFieldManual: (dayId: string, blockId: string, field: string, value: any) => void;
  handleDeleteBlock: (dayId: string, blockId: string) => void;
  setHotelPickerDayId: (val: string) => void;
  setHotelPickerBlockId: (val: string) => void;
  setHotelPickerOpen: (val: boolean) => void;
  setCabPickerDayId: (val: string) => void;
  setCabPickerBlockId: (val: string) => void;
  setCabPickerOpen: (val: boolean) => void;
  setPickerDayId: (val: string) => void;
  setPickerOpen: (val: boolean) => void;
  expandedBlocks: Set<string>;
  setExpandedBlocks: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function BlockItem({
  block,
  dayId,
  dayNumber,
  viewMode,
  itinerary,
  handleUpdateBlockField,
  handleUpdateBlockFieldManual,
  handleDeleteBlock,
  setHotelPickerDayId,
  setHotelPickerBlockId,
  setHotelPickerOpen,
  setCabPickerDayId,
  setCabPickerBlockId,
  setCabPickerOpen,
  setPickerDayId,
  setPickerOpen,
  expandedBlocks,
  setExpandedBlocks
}: BlockItemProps) {
  const isExpanded = expandedBlocks.has(block.id);
  const setIsExpanded = (val: boolean) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      if (val) {
        next.add(block.id);
      } else {
        next.delete(block.id);
      }
      return next;
    });
  };

  const isStay = block.type === 'hotel';
  const isTrans = block.type === 'transfer';
  const isAct = block.type === 'activity';
  const isFlight = block.type === 'flight';
  const isNote = block.type === 'note';
  const isMeal = block.type === 'meal';
  const isChargeable = block.properties?.chargeable !== false;
  const blockCost = Number(block.cost) || Number(block.properties?.total_cost) || 0;

  // Style configurations
  const inputClass = "h-8 rounded-lg mt-1 text-xs bg-[#0B1026]/80 border-[#C9A25A]/20 text-white placeholder:text-gray-500 focus:border-[#C9A25A] focus-visible:ring-0 focus-visible:ring-offset-0";
  const inputMonoClass = "h-8 rounded-lg mt-1 text-xs font-mono bg-[#0B1026]/80 border-[#C9A25A]/20 text-white placeholder:text-gray-500 focus:border-[#C9A25A] focus-visible:ring-0 focus-visible:ring-offset-0";
  const selectTriggerClass = "h-8 rounded-lg mt-1 text-xs bg-[#0B1026]/80 border-[#C9A25A]/20 text-white focus:border-[#C9A25A] focus:ring-0 focus:ring-offset-0";
  const textareaClass = "text-xs rounded-xl bg-[#0B1026]/80 border-[#C9A25A]/20 text-white placeholder:text-gray-500 focus:border-[#C9A25A] focus-visible:ring-0 focus-visible:ring-offset-0 p-3 resize-none leading-relaxed";

  let cardBgClass = '';
  let cardBorderClass = '';
  let iconBoxBgClass = '';
  let iconColorClass = '';
  let typeLabelText = '';
  let blockName = '';
  let blockMeta = '';
  let blockCostLabel = '';
  let blockIcon = null;

  if (isStay) {
    cardBgClass = 'bg-purple-950/30';
    cardBorderClass = 'border-purple-500/25';
    iconBoxBgClass = 'bg-purple-500/20';
    iconColorClass = 'text-purple-300';
    typeLabelText = 'ACCOMMODATION';
    blockName = block.properties?.hotel_name || 'Selected Accommodation';
    blockMeta = `${block.properties?.room_category || 'Standard Room'} • ${block.properties?.meal_plan || 'Room Only'}`;
    blockCostLabel = 'Per night';
    blockIcon = <Bed className="w-4 h-4" />;
  } else if (isTrans) {
    cardBgClass = 'bg-emerald-950/30';
    cardBorderClass = 'border-emerald-500/25';
    iconBoxBgClass = 'bg-emerald-500/20';
    iconColorClass = 'text-emerald-300';
    typeLabelText = 'TRANSFER';
    blockName = block.properties?.vehicle_type || 'Cab vehicle';
    blockMeta = block.properties?.pickup_location 
      ? `${block.properties.pickup_location} → ${block.properties.drop_location}`
      : 'Transit Route';
    blockCostLabel = 'Total Cost';
    blockIcon = <Car className="w-4 h-4" />;
  } else if (isAct) {
    cardBgClass = 'bg-amber-950/20';
    cardBorderClass = 'border-[#C9A25A]/25';
    iconBoxBgClass = 'bg-[#C9A25A]/20';
    iconColorClass = 'text-[#C9A25A]';
    typeLabelText = 'ACTIVITY';
    blockName = block.properties?.excursion_name || 'Sightseeing Excursion';
    blockMeta = block.properties?.category || 'Activity';
    blockCostLabel = 'Total Cost';
    blockIcon = <Sparkles className="w-4 h-4" />;
  } else if (isFlight) {
    cardBgClass = 'bg-blue-950/30';
    cardBorderClass = 'border-blue-500/25';
    iconBoxBgClass = 'bg-blue-500/20';
    iconColorClass = 'text-blue-300';
    typeLabelText = 'FLIGHT';
    blockName = block.properties?.flight_no 
      ? `${block.properties.flight_no} (${block.properties.airline_name || ''})`
      : 'Flight details';
    blockMeta = block.properties?.seat_rate ? `${block.properties.seat_rate} INR per seat` : 'Seats Configured';
    blockCostLabel = 'Total Cost';
    blockIcon = <Plane className="w-4 h-4" />;
  } else if (isMeal) {
    cardBgClass = 'bg-orange-950/30';
    cardBorderClass = 'border-orange-500/25';
    iconBoxBgClass = 'bg-orange-500/20';
    iconColorClass = 'text-orange-300';
    typeLabelText = 'MEAL';
    blockName = block.properties?.meal_type || 'Meal Booking';
    blockMeta = block.properties?.cuisine || 'Preference Cuisine';
    blockCostLabel = 'Total Cost';
    blockIcon = <Utensils className="w-4 h-4" />;
  } else {
    cardBgClass = 'bg-slate-800/50';
    cardBorderClass = 'border-slate-600/25';
    iconBoxBgClass = 'bg-slate-600/20';
    iconColorClass = 'text-slate-300';
    typeLabelText = 'NOTE';
    blockName = block.properties?.description || 'Guidelines Memo';
    blockMeta = 'Reference Guideline';
    blockCostLabel = '';
    blockIcon = <FileText className="w-4 h-4" />;
  }

  return (
    <div className="relative group text-left">
      <Card className={`border rounded-[10px] overflow-hidden ${cardBorderClass} ${cardBgClass} shadow-sm text-left`}>
        {/* Header Row */}
        <div 
          onClick={() => viewMode === 'operations' && setIsExpanded(!isExpanded)}
          className={`flex items-center gap-[10px] p-[10px_14px] ${viewMode === 'operations' ? 'cursor-pointer select-none' : ''}`}
        >
          {/* Icon box */}
          <div className={`w-7 h-7 rounded-[6px] flex items-center justify-center ${iconBoxBgClass} ${iconColorClass} shrink-0`}>
            {blockIcon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left space-y-0.5">
            <span className={`text-[9px] font-extrabold uppercase block tracking-wider ${iconColorClass}`}>
              {typeLabelText}
            </span>
            <h4 className="text-[12px] font-bold text-white truncate max-w-[280px] sm:max-w-[400px]" title={blockName}>
              {blockName}
            </h4>
            <span className="text-[10px] text-white/50 block truncate max-w-[280px] sm:max-w-[400px]">
              {blockMeta}
            </span>
          </div>

          {/* Cost */}
          {!isNote && (
            <div className="text-right shrink-0 ml-auto mr-1">
              <span className="text-[9px] text-white/40 uppercase block tracking-wider font-semibold">
                {blockCostLabel}
              </span>
              <span className={`text-[13px] font-bold font-mono ${isChargeable ? 'text-[#C9A25A]' : 'text-white/30 line-through'}`}>
                ₹{Math.round(blockCost).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
            {/* Bill switch */}
            {viewMode === 'operations' && !isNote && (
              <div className="flex items-center scale-75 mr-1" title="Toggle billability">
                <Switch 
                  id={`charge_${block.id}`}
                  checked={isChargeable}
                  onCheckedChange={(checked) => handleUpdateBlockField(dayId, block.id, 'chargeable', checked)}
                  className="data-[state=checked]:bg-[#C9A25A]"
                />
              </div>
            )}

            {/* Edit button */}
            {viewMode === 'operations' && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-[22px] h-[22px] rounded-[5px] bg-white/[0.06] hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Edit details"
              >
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Delete button */}
            {viewMode === 'operations' && (
              <button
                type="button"
                onClick={() => handleDeleteBlock(dayId, block.id)}
                className="w-[22px] h-[22px] rounded-[5px] bg-white/[0.06] hover:bg-red-500/20 text-white/40 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Delete block"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        {viewMode === 'operations' && isExpanded && (
          <div className="px-[14px] pb-[14px] pt-2 bg-black/20 border-t border-white/5">
            {/* 1. HOTEL EDIT BLOCK */}
            {isStay && (
              <div className="space-y-4">
                {!block.properties.hotel_id ? (
                  <div className="flex flex-col items-center justify-center p-6 border border-dashed border-purple-500/20 rounded-xl bg-purple-500/[0.02] text-center space-y-3">
                    <Bed className="w-8 h-8 text-purple-400 animate-pulse" />
                    <p className="text-xs text-muted-foreground font-semibold">No hotel has been booked for Day {dayNumber}</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setHotelPickerDayId(dayId);
                        setHotelPickerBlockId(block.id);
                        setHotelPickerOpen(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md border-0"
                    >
                      <Search className="w-3.5 h-3.5 mr-1" /> Open Hotel Catalog
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Selected Hotel Summary Card */}
                    <div className="flex gap-4 items-start bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <Bed className="w-5 h-5 text-purple-400 shrink-0 mt-1" />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-extrabold text-xs text-white uppercase">{block.properties.hotel_name || 'Selected Accommodation'}</h5>
                            <span className="text-[9px] text-slate-300 block font-semibold">{block.properties.room_category} • {block.properties.meal_plan}</span>
                          </div>
                          <span className="font-mono text-xs font-black text-amber-500">₹{Number(blockCost).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">{block.properties.nights} Night(s) • {block.properties.room_count || 1} Room(s)</p>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setHotelPickerDayId(dayId);
                              setHotelPickerBlockId(block.id);
                              setHotelPickerOpen(true);
                            }}
                            className="h-7 text-[9px] font-bold rounded-lg border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10"
                          >
                            Change Hotel
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Manual Hotel Booking Confirmation Reference */}
                    <div className="bg-purple-950/20 p-3 rounded-xl border border-purple-500/20 space-y-2 text-left">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-purple-400" /> Manual Hotel Confirmation Details (For Service Voucher)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px] font-bold uppercase">
                        <div>
                          <Label className="text-slate-300">Hotel Confirmation Ref #</Label>
                          <Input 
                            placeholder="e.g. HCONF-78921 or ITC-BLR-4512" 
                            className={inputClass} 
                            value={block.properties.hotel_conf_no || ''} 
                            onChange={e => handleUpdateBlockField(dayId, block.id, 'hotel_conf_no', e.target.value)} 
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Hotel Front Desk Contact</Label>
                          <Input 
                            placeholder="e.g. Mr. Sharma (+91 98123 45678)" 
                            className={inputClass} 
                            value={block.properties.hotel_contact || ''} 
                            onChange={e => handleUpdateBlockField(dayId, block.id, 'hotel_contact', e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Collapsible advanced controls */}
                    <details className="group border border-border/40 rounded-xl bg-slate-900/20 overflow-hidden transition-all text-xs">
                      <summary className="flex justify-between items-center px-3 py-2 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:bg-muted/10">
                        <span>Advanced Pricing & Parameters</span>
                        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="p-4 border-t border-border/40 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[9px] font-bold uppercase text-left">
                          <div>
                            <Label className="text-slate-400">Nights</Label>
                            <Input type="number" className={inputClass} value={block.properties.nights || 1} onChange={e => handleUpdateBlockField(dayId, block.id, 'nights', parseInt(e.target.value) || 1)} />
                          </div>
                          <div>
                            <Label className="text-slate-400">Rooms Count</Label>
                            <Input type="number" className={inputClass} value={block.properties.room_count || 1} onChange={e => handleUpdateBlockField(dayId, block.id, 'room_count', parseInt(e.target.value) || 1)} />
                          </div>
                          <div>
                            <Label className="text-slate-400">Selling Cost (INR)</Label>
                            <Input type="number" className={inputMonoClass} value={block.properties.rate_per_night || 0} onChange={e => handleUpdateBlockField(dayId, block.id, 'rate_per_night', parseFloat(e.target.value) || 0)} />
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex flex-col justify-center text-center">
                            <span className="text-[7px] text-muted-foreground font-black">Contract base</span>
                            <span className="font-mono text-[10px] text-white">₹{block.properties.room_cost || 0}</span>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}

            {/* 2. TRANSFER EDIT BLOCK */}
            {isTrans && (
              <div className="space-y-4">
                {!block.properties.route_id ? (
                  <div className="flex flex-col items-center justify-center p-6 border border-dashed border-emerald-500/20 rounded-xl bg-emerald-500/[0.02] text-center space-y-3">
                    <Car className="w-8 h-8 text-emerald-400 animate-pulse" />
                    <p className="text-xs text-muted-foreground font-semibold">No transport route configured for Day {dayNumber}</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setCabPickerDayId(dayId);
                        setCabPickerBlockId(block.id);
                        setCabPickerOpen(true);
                      }}
                      className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md border-0"
                    >
                      <Search className="w-3.5 h-3.5 mr-1" /> Configure Route & vehicle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-4 items-start bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <Car className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-extrabold text-xs text-white uppercase">{block.properties.vehicle_type || 'Cab vehicle'} Class</h5>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">{block.properties.route_name || 'Transit Transfer'}</span>
                          </div>
                          <span className="font-mono text-xs font-black text-amber-500 font-bold">₹{Number(blockCost).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">Season: {block.properties.season || 'Normal Season'}</p>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCabPickerDayId(dayId);
                              setCabPickerBlockId(block.id);
                              setCabPickerOpen(true);
                            }}
                            className="h-7 text-[9px] font-bold rounded-lg border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            Change Route
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Manual Driver & Cab Details */}
                    <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20 space-y-2 text-left">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                        <Car className="w-3 h-3 text-emerald-400" /> Manual Vehicle & Driver Details (For Service Voucher)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px] font-bold uppercase">
                        <div>
                          <Label className="text-slate-300">Driver Name & Phone</Label>
                          <Input 
                            placeholder="e.g. Ramesh Kumar (+91 98123 45678)" 
                            className={inputClass} 
                            value={block.properties.driver_details || ''} 
                            onChange={e => handleUpdateBlockField(dayId, block.id, 'driver_details', e.target.value)} 
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Vehicle Reg Number</Label>
                          <Input 
                            placeholder="e.g. UK07-AZ-4521" 
                            className={inputClass} 
                            value={block.properties.vehicle_no || ''} 
                            onChange={e => handleUpdateBlockField(dayId, block.id, 'vehicle_no', e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>

                    <details className="group border border-border/40 rounded-xl bg-slate-900/20 overflow-hidden transition-all text-xs">
                      <summary className="flex justify-between items-center px-3 py-2 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:bg-muted/10">
                        <span>Manual Pricing Overrides</span>
                        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="p-4 border-t border-border/40 space-y-4">
                        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800 w-fit">
                          <Switch
                            id={`man_trans_switch_${block.id}`}
                            checked={block.properties.isManual || false}
                            onCheckedChange={(checked) => handleUpdateBlockField(dayId, block.id, 'isManual', checked)}
                            className="scale-75"
                          />
                          <Label htmlFor={`man_trans_switch_${block.id}`} className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider cursor-pointer">Enable Custom Cost Override</Label>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-[9px] font-bold uppercase text-left">
                          <div>
                            <Label className="text-slate-400">Override Net Cost (INR)</Label>
                            <Input type="number" className={inputClass} disabled={!block.properties.isManual} value={block.properties.contract_rate || 0} onChange={e => handleUpdateBlockFieldManual(dayId, block.id, 'contract_rate', parseFloat(e.target.value) || 0)} />
                          </div>
                          <div>
                            <Label className="text-slate-400">Override Selling Cost (INR)</Label>
                            <Input type="number" className={inputClass} disabled={!block.properties.isManual} value={block.properties.selling_rate || 0} onChange={e => handleUpdateBlockFieldManual(dayId, block.id, 'selling_rate', parseFloat(e.target.value) || 0)} />
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}

            {/* 3. ACTIVITY EDIT BLOCK */}
            {isAct && (
              <div className="space-y-4">
                {!block.properties.excursion_id && !block.properties.excursion_name ? (
                  <div className="flex flex-col items-center justify-center p-6 border border-dashed border-amber-500/20 rounded-xl bg-amber-500/[0.02] text-center space-y-3">
                    <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                    <p className="text-xs text-muted-foreground font-semibold">No sightseeing activity configured for Day {dayNumber}</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setPickerDayId(dayId);
                        setPickerOpen(true);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold text-xs rounded-xl shadow-md border-0"
                    >
                      <Search className="w-3.5 h-3.5 mr-1" /> Browse Master Excursions
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-4 items-start bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-extrabold text-xs text-white uppercase">{block.properties.excursion_name || 'Sightseeing Excursion'}</h5>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">Excursion Activity</span>
                          </div>
                          <span className="font-mono text-xs font-black text-amber-500 font-bold">₹{Number(blockCost).toLocaleString('en-IN')}</span>
                        </div>
                        {block.properties.description && (
                          <p className="text-[10px] text-slate-300 leading-relaxed">{block.properties.description}</p>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPickerDayId(dayId);
                              setPickerOpen(true);
                            }}
                            className="h-7 text-[9px] font-bold rounded-lg border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10"
                          >
                            Change Activity
                          </Button>
                        </div>
                      </div>
                    </div>

                    <details className="group border border-border/40 rounded-xl bg-slate-900/20 overflow-hidden transition-all text-xs">
                      <summary className="flex justify-between items-center px-3 py-2 font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:bg-muted/10">
                        <span>Manual Pricing & Highlights</span>
                        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="p-4 border-t border-border/40 space-y-4">
                        <div className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800 w-fit">
                          <Switch
                            id={`man_exc_switch_${block.id}`}
                            checked={block.properties.isManual || false}
                            onCheckedChange={(checked) => handleUpdateBlockField(dayId, block.id, 'isManual', checked)}
                            className="scale-75"
                          />
                          <Label htmlFor={`man_exc_switch_${block.id}`} className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider cursor-pointer">Enable Custom Excursion Pricing</Label>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[9px] font-bold uppercase text-left">
                          <div>
                            <Label className="text-slate-400">Adult Cost (INR)</Label>
                            <Input type="number" className={inputMonoClass} disabled={!block.properties.isManual} value={block.properties.adult_rate || 0} onChange={e => handleUpdateBlockFieldManual(dayId, block.id, 'adult_rate', parseFloat(e.target.value) || 0)} />
                          </div>
                          <div>
                            <Label className="text-slate-400">Child Cost (INR)</Label>
                            <Input type="number" className={inputMonoClass} disabled={!block.properties.isManual} value={block.properties.child_rate || 0} onChange={e => handleUpdateBlockFieldManual(dayId, block.id, 'child_rate', parseFloat(e.target.value) || 0)} />
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex flex-col justify-center text-center">
                            <span className="text-[7px] text-muted-foreground font-black">Auto Total</span>
                            <span className="font-mono text-[10px] text-white">₹{block.properties.total_cost || 0}</span>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}

            {/* 4. FLIGHT EDIT BLOCK */}
            {isFlight && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[9px] font-bold uppercase text-left">
                  <div>
                    <Label className="text-slate-400">Flight No</Label>
                    <Input type="text" className={inputClass} value={block.properties.flight_no || ''} onChange={e => handleUpdateBlockField(dayId, block.id, 'flight_no', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-slate-400">Airlines</Label>
                    <Input type="text" className={inputClass} value={block.properties.airline_name || ''} onChange={e => handleUpdateBlockField(dayId, block.id, 'airline_name', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-slate-400">Cost per seat (INR)</Label>
                    <Input type="number" className={inputMonoClass} value={block.properties.seat_rate || 0} onChange={e => handleUpdateBlockField(dayId, block.id, 'seat_rate', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex flex-col justify-center text-center">
                    <span className="text-[7px] text-muted-foreground font-black">Seats Count</span>
                    <span className="font-mono text-[10px] text-white">{itinerary?.total_guests || 2} Pax</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. MEAL EDIT BLOCK */}
            {isMeal && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[9px] font-bold uppercase text-left">
                  <div>
                    <Label className="text-slate-400">Meal Class</Label>
                    <Select value={block.properties.meal_type || 'Lunch'} onValueChange={val => handleUpdateBlockField(dayId, block.id, 'meal_type', val)}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Breakfast">Breakfast</SelectItem>
                        <SelectItem value="Lunch">Lunch</SelectItem>
                        <SelectItem value="Dinner">Dinner</SelectItem>
                        <SelectItem value="Gala Dinner">Gala Dinner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400">Cuisine Preference</Label>
                    <Input type="text" className={inputClass} placeholder="e.g. Indian, Veg, Seafood" value={block.properties.cuisine || ''} onChange={e => handleUpdateBlockField(dayId, block.id, 'cuisine', e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-slate-400">Cost (INR)</Label>
                    <Input type="number" className={inputMonoClass} value={block.properties.cost || 0} onChange={e => handleUpdateBlockField(dayId, block.id, 'cost', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
            )}

            {/* 6. NOTE EDIT BLOCK */}
            {isNote && (
              <div className="space-y-1.5 text-left">
                <Label className="text-muted-foreground font-bold text-[9px] uppercase tracking-wider">Guidelines Note description memo</Label>
                <Textarea
                  value={block.properties.description || ''} 
                  onChange={e => handleUpdateBlockField(dayId, block.id, 'description', e.target.value)} 
                  className={textareaClass}
                  rows={2}
                />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

interface DayCardProps {
  day: any;
  idx: number;
  daysCount: number;
  activeDayId: string;
  setActiveDayId: (id: string) => void;
  viewMode: 'sales' | 'operations';
  sortedCities: any[];
  handleChangeArrival: (dayId: string, city: string) => void;
  getDayCost: (day: any) => number;
  setDays: React.Dispatch<React.SetStateAction<any[]>>;
  handleMoveDay: (idx: number, direction: 'up' | 'down') => void;
  handleDuplicateDay: (dayId: string) => void;
  handleDeleteDay: (dayId: string) => void;
  handleAddBlock: (dayId: string, type: string) => void;
  itinerary: any;
  handleUpdateBlockField: (dayId: string, blockId: string, field: string, value: any) => void;
  handleUpdateBlockFieldManual: (dayId: string, blockId: string, field: string, value: any) => void;
  handleDeleteBlock: (dayId: string, blockId: string) => void;
  setHotelPickerDayId: (val: string) => void;
  setHotelPickerBlockId: (val: string) => void;
  setHotelPickerOpen: (val: boolean) => void;
  setCabPickerDayId: (val: string) => void;
  setCabPickerBlockId: (val: string) => void;
  setCabPickerOpen: (val: boolean) => void;
  setPickerDayId: (val: string) => void;
  setPickerOpen: (val: boolean) => void;
  loadingInventory: Record<string, boolean>;
  expandedBlocks: Set<string>;
  setExpandedBlocks: React.Dispatch<React.SetStateAction<Set<string>>>;
  activeLead: any;
}

export function DayCard({
  day,
  idx,
  daysCount,
  activeDayId,
  setActiveDayId,
  viewMode,
  sortedCities,
  handleChangeArrival,
  getDayCost,
  setDays,
  handleMoveDay,
  handleDuplicateDay,
  handleDeleteDay,
  handleAddBlock,
  itinerary,
  handleUpdateBlockField,
  handleUpdateBlockFieldManual,
  handleDeleteBlock,
  setHotelPickerDayId,
  setHotelPickerBlockId,
  setHotelPickerOpen,
  setCabPickerDayId,
  setCabPickerBlockId,
  setCabPickerOpen,
  setPickerDayId,
  setPickerOpen,
  loadingInventory,
  expandedBlocks,
  setExpandedBlocks,
  activeLead
}: DayCardProps) {
  const isActive = day.id === activeDayId;
  let rawBlocks = (day.metadata?.blocks || []).filter((b: any) => b.type !== 'meal');
  if (!rawBlocks.some((b: any) => b.type === 'activity')) {
    const currentCity = day.accommodation_city || day.city || 'Destination';
    rawBlocks.push({
      id: 'act_auto_default_' + day.day_number + '_' + (day.id || 'd'),
      type: 'activity',
      time: '14:00',
      cost: 0,
      properties: {
        excursion_name: `Sightseeing & Attractions in ${currentCity}`,
        category: 'Sightseeing',
        description: `Explore popular landmarks and attractions in ${currentCity}.`,
        total_cost: 0,
        chargeable: true
      }
    });
  }
  const blocks = rawBlocks;
  const dayCost = getDayCost(day);

  const hotelBlock = blocks.find((b: any) => b.type === 'hotel');
  const transferBlocks = blocks.filter((b: any) => b.type === 'transfer');
  const activityBlocks = blocks.filter((b: any) => b.type === 'activity');
  const flightBlocks = blocks.filter((b: any) => b.type === 'flight');
  const mealBlocks = blocks.filter((b: any) => b.type === 'meal');
  const noteBlocks = blocks.filter((b: any) => b.type === 'note');

  if (!isActive) {
    return (
      <div 
        onClick={() => setActiveDayId(day.id)}
        className="flex items-center gap-3 my-1.5 cursor-pointer select-none group w-full text-left"
      >
        <div className="flex-1 h-px bg-[#C9A25A]/10 group-hover:bg-[#C9A25A]/30 transition-colors" />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A25A]/5 border border-[#C9A25A]/10 text-[9px] font-bold text-[#C9A25A]/40 group-hover:text-[#C9A25A]/70 transition-colors uppercase tracking-wider whitespace-nowrap shrink-0">
          <ChevronDown className="w-3 h-3 text-[#C9A25A]/40" />
          <span>
            Day {day.day_number} — {day.title || 'Untitled Stage'} · {blocks.length} blocks
          </span>
        </div>
        <div className="flex-1 h-px bg-[#C9A25A]/10 group-hover:bg-[#C9A25A]/30 transition-colors" />
      </div>
    );
  }

  const getDayDate = () => {
    const startDateStr = itinerary?.travel_start_date || activeLead?.trip_start_date;
    if (startDateStr) {
      const startDate = new Date(startDateStr);
      if (!isNaN(startDate.getTime())) {
        startDate.setDate(startDate.getDate() + (day.day_number - 1));
        return startDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    if (day.date) {
      const d = new Date(day.date);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    return '---';
  };

  return (
    <Card className="bg-[#1A2342]/40 border border-[#C9A25A]/20 shadow-xl overflow-hidden rounded-2xl text-left p-4 space-y-4">
      {/* Day header */}
      <div className="flex items-center gap-3">
        <span className="bg-gradient-to-r from-[#C9A25A] to-[#D8B97A] text-[#0B1026] font-display font-extrabold text-[11px] px-3 py-1.5 rounded-[7px] shadow-sm shrink-0">
          Day {day.day_number}
        </span>
        <h3 className="text-white font-display font-bold text-[14px]">
          {day.title || 'Untitled Stage'}
        </h3>
        <span className="text-[11px] text-[#C9A25A]/60 font-semibold ml-auto shrink-0 font-mono">
          {getDayDate()}
        </span>
      </div>

      {/* Inline edit details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-[#0B1026]/40 border border-[#C9A25A]/10 p-3 rounded-xl">
        <div className="space-y-1">
          <Label className="text-[#C9A25A]/80 font-bold text-[9px] uppercase tracking-wider">Day Title</Label>
          <Input 
            value={day.title || ''} 
            onChange={(e) => {
              const val = e.target.value;
              setDays(prev => prev.map(d => d.id === day.id ? { ...d, title: val } : d));
            }}
            className="h-8 text-xs bg-[#0B1026]/60 border-[#C9A25A]/20 focus-visible:ring-0 focus:border-[#C9A25A] rounded-lg text-white font-semibold font-display" 
            placeholder="Day Title"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[#C9A25A]/80 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
            {loadingInventory[day.accommodation_city?.toLowerCase()?.trim()] && (
              <Loader2 className="w-3 h-3 text-[#C9A25A] animate-spin" />
            )}
            Destination City
          </Label>
          <Select value={day.accommodation_city || ''} onValueChange={(val) => handleChangeArrival(day.id, val)}>
            <SelectTrigger className="h-8 border-[#C9A25A]/20 bg-[#0B1026]/60 focus:ring-0 focus:ring-offset-0 font-semibold text-xs text-white rounded-lg">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A2342] text-white border-[#C9A25A]/30">
              {sortedCities.map((c, cIdx) => {
                const cityName = typeof c === 'string' ? c : (c.city || c.city_name || c.name || '');
                if (!cityName) return null;
                return (
                  <SelectItem key={c.id || `city-${cityName}-${cIdx}`} value={cityName}>{cityName}</SelectItem>
                );
              })}
              {sortedCities.length === 0 && (
                <>
                  <SelectItem key="fallback-sin" value="Singapore">Singapore</SelectItem>
                  <SelectItem key="fallback-dxb" value="Dubai">Dubai</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <span className="text-[8px] text-slate-400 uppercase font-black block mb-0.5">Day Cost Summary</span>
          <div className="h-8 flex items-center justify-between px-3 bg-[#0B1026]/60 border border-[#C9A25A]/10 rounded-lg text-white">
            <span className="text-[10px] text-[#C9A25A]/70 font-semibold">Day Cost:</span>
            <span className="font-display font-black text-[13px] text-[#C9A25A]">₹{Math.round(dayCost).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-gray-400 font-bold text-[9px] uppercase tracking-wider">Day Overview / Detailed Itinerary Notes</Label>
        <Textarea
          placeholder="Describe what guests will do, landmarks they see, guidelines..."
          value={day.description || ''}
          onChange={(e) => {
            const val = e.target.value;
            setDays(prev => prev.map(d => d.id === day.id ? { ...d, description: val } : d));
          }}
          className="bg-[#0B1026]/40 border border-[#C9A25A]/20 text-gray-300 placeholder:text-gray-500 focus:border-[#C9A25A] focus-visible:ring-[#C9A25A]/20 min-h-[50px] max-h-[120px] resize-y text-xs leading-relaxed rounded-xl text-white p-2.5"
        />
      </div>

      {/* Timeline items */}
      {blocks.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-dashed border-[#C9A25A]/15 my-2">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-[#C9A25A]/25" />
          <p className="text-[rgba(255,255,255,0.3)] text-xs font-sans">
            No components added for this day yet. Use the buttons below to add stays, transfers, or activities.
          </p>
        </div>
      ) : (
        <div className="relative border-l border-dashed border-[#C9A25A]/20 pl-4 ml-3 space-y-3">
          {blocks.map((block: any) => (
            <BlockItem
              key={block.id}
              block={block}
              dayId={day.id}
              dayNumber={day.day_number}
              viewMode={viewMode}
              itinerary={itinerary}
              handleUpdateBlockField={handleUpdateBlockField}
              handleUpdateBlockFieldManual={handleUpdateBlockFieldManual}
              handleDeleteBlock={handleDeleteBlock}
              setHotelPickerDayId={setHotelPickerDayId}
              setHotelPickerBlockId={setHotelPickerBlockId}
              setHotelPickerOpen={setHotelPickerOpen}
              setCabPickerDayId={setCabPickerDayId}
              setCabPickerBlockId={setCabPickerBlockId}
              setCabPickerOpen={setCabPickerOpen}
              setPickerDayId={setPickerDayId}
              setPickerOpen={setPickerOpen}
              expandedBlocks={expandedBlocks}
              setExpandedBlocks={setExpandedBlocks}
            />
          ))}
        </div>
      )}

      {/* Component adding bar */}
      {viewMode === 'operations' && (
        <div className="flex flex-wrap items-center bg-white/[0.02] border border-dashed border-[#C9A25A]/15 rounded-[10px] p-[8px_12px] mt-2">
          <span className="text-[9px] font-bold text-white/30 uppercase mr-4 flex items-center gap-1 select-none">
            <Plus className="w-3 h-3" /> Add Component
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleAddBlock(day.id, 'hotel')}
              className="px-2.5 py-1 rounded-[6px] bg-transparent border border-[#a78bfa]/40 text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Bed className="w-3 h-3" /> Stay
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock(day.id, 'activity')}
              className="px-2.5 py-1 rounded-[6px] bg-transparent border border-[#C9A25A]/40 text-[#C9A25A] hover:bg-[#C9A25A]/10 transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" /> Activity
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock(day.id, 'flight')}
              className="px-2.5 py-1 rounded-[6px] bg-transparent border border-[#60a5fa]/40 text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plane className="w-3 h-3" /> Flight
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock(day.id, 'note')}
              className="px-2.5 py-1 rounded-[6px] bg-transparent border border-white/15 text-white/40 hover:bg-white/5 transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3" /> Note
            </button>
          </div>
        </div>
      )}

      {/* Card controls */}
      <div className="pt-2 border-t border-[#C9A25A]/15 flex justify-between items-center bg-[#050B20]/10 px-1">
        <span className="text-[9px] text-[#C9A25A]/60 font-semibold uppercase tracking-wider font-display">
          Day {day.day_number} Controls
        </span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white" disabled={idx === 0} onClick={() => handleMoveDay(idx, 'up')}>
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-white" disabled={idx === daysCount - 1} onClick={() => handleMoveDay(idx, 'down')}>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-purple-400" onClick={() => handleDuplicateDay(day.id)}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-500/10 hover:text-red-650" onClick={() => handleDeleteDay(day.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <button 
            type="button" 
            className="h-7 text-[10px] font-extrabold rounded-lg px-3 bg-slate-900 border border-slate-800 text-amber-500 hover:bg-slate-800 transition-colors cursor-pointer"
            onClick={() => setActiveDayId('')}
          >
            Done
          </button>
        </div>
      </div>
    </Card>
  );
}

interface CostingDrawerProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  finalPackagePrice: number;
  itinerary: any;
  markupPercent: number;
  setMarkupPercent: (val: number) => void;
  profitMarginTotal: number;
  baseCostTotal: number;
  markupAmtTotal: number;
  sumHotels: number;
  sumTransports: number;
  sumActivities: number;
  sumOthers: number;
  visaCost: number;
  setVisaCost: (val: number) => void;
  isDirty: boolean;
  handleSaveItinerary: () => void;
  setProposalOpen: (val: boolean) => void;
  handleOpenVoucher: () => void;
  handleOpenInvoice: () => void;
  toast: any;
  leadId: string;
  activeLead: any;
}

export function CostingDrawer({
  isOpen,
  setIsOpen,
  finalPackagePrice,
  itinerary,
  markupPercent,
  setMarkupPercent,
  profitMarginTotal,
  baseCostTotal,
  markupAmtTotal,
  sumHotels,
  sumTransports,
  sumActivities,
  sumOthers,
  visaCost,
  setVisaCost,
  isDirty,
  handleSaveItinerary,
  setProposalOpen,
  handleOpenVoucher,
  handleOpenInvoice,
  toast,
  leadId,
  activeLead
}: CostingDrawerProps) {
  const pct = Math.round((profitMarginTotal / (finalPackagePrice || 1)) * 100);
  const marginBadgeColor = markupPercent > 20 
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
    : markupPercent >= 10 
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
      : 'bg-rose-500/20 text-rose-400 border-rose-500/30';

  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 z-45 bg-[#060D1F] border-t border-[#C9A25A]/25 shadow-2xl transition-all duration-300 ${
        isOpen ? 'h-[380px]' : 'h-16'
      }`}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 px-4 flex items-center gap-5 cursor-pointer select-none bg-[#060D1F] text-left shrink-0"
      >
        {/* Total Selling Price */}
        <div className="flex flex-col gap-0.5 justify-center">
          <span className="text-[9px] text-white/35 uppercase tracking-wider font-semibold font-display">
            TOTAL SELLING PRICE
          </span>
          <span className="text-[#C9A25A] text-sm font-extrabold font-display">
            ₹{Math.round(finalPackagePrice).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#C9A25A]/15 shrink-0" />

        {/* Per Person */}
        <div className="flex flex-col gap-0.5 justify-center">
          <span className="text-[9px] text-white/35 uppercase tracking-wider font-semibold font-display">
            PER PERSON
          </span>
          <span className="text-white text-sm font-bold font-display">
            ₹{Math.round(finalPackagePrice / ((itinerary?.adult_count || 2) + (itinerary?.child_count || 0))).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#C9A25A]/15 shrink-0" />

        {/* Margin status pill */}
        <div>
          <span className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold border inline-block ${
            markupPercent > 20 
              ? 'bg-emerald-500/15 text-[#34d399] border-emerald-500/30' 
              : markupPercent >= 10 
                ? 'bg-amber-500/15 text-[#C9A25A] border-amber-500/30' 
                : 'bg-rose-500/15 text-[#f87171] border-rose-500/30'
          }`}>
            {markupPercent}%
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#C9A25A]/15 shrink-0" />

        {/* Supplier Cost */}
        <div className="flex flex-col gap-0.5 justify-center">
          <span className="text-[9px] text-white/35 uppercase tracking-wider font-semibold font-display">
            SUPPLIER COST
          </span>
          <span className="text-white/50 text-xs font-semibold font-display">
            ₹{Math.round(baseCostTotal).toLocaleString('en-IN')}
          </span>
        </div>

        {isDirty && (
          <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-2 py-0.5 rounded-lg animate-pulse">
            Unsaved Changes
          </div>
        )}

        {/* Breakdown button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="ml-auto bg-transparent border border-[#C9A25A]/30 text-[#C9A25A]/70 hover:text-[#C9A25A] hover:bg-[#C9A25A]/5 px-3 py-1.5 rounded-[7px] text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{isOpen ? 'Close Breakdown' : 'Breakdown Details'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto h-[calc(100%-64px)]">
          <div className="space-y-3 bg-[#1A2342] p-4 rounded-xl border border-[#C9A25A]/20 text-left">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 font-display flex items-center gap-1.5 border-b border-[#C9A25A]/20 pb-2 mb-1">
              💰 Cost Component Breakdown
            </h4>
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Bed className="w-3.5 h-3.5 text-purple-400" /> Hotels Cost</span>
                <span className="font-bold font-display text-white">₹{Math.round(sumHotels).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-emerald-400" /> Transport Cost</span>
                <span className="font-bold font-display text-white">₹{Math.round(sumTransports).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" /> Activities Cost</span>
                <span className="font-bold font-display text-white">₹{Math.round(sumActivities).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5"><Plane className="w-3.5 h-3.5 text-blue-400" /> Flights Cost</span>
                <span className="font-bold font-display text-white">₹{Math.round(sumOthers).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 border-t border-[#C9A25A]/10 pt-2">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-indigo-400" /> Visa Cost</span>
                <span className="font-bold font-display text-white">₹{Math.round(visaCost).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-[#1A2342] p-4 rounded-xl border border-[#C9A25A]/20 text-left flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 font-display flex items-center gap-1.5 border-b border-[#C9A25A]/20 pb-2 mb-3">
                📈 Markup Margin Controls
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                  <Label className="text-slate-300 font-bold">Applied Mark-up</Label>
                  <span className={`font-bold text-xs px-2 py-0.5 rounded-lg border ${marginBadgeColor}`}>{markupPercent}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    min={0}
                    max={50}
                    step={1}
                    value={[markupPercent]}
                    onValueChange={(val) => setMarkupPercent(val[0])}
                    className="flex-1 cursor-pointer"
                  />
                  <Input 
                    type="number" 
                    className="h-8 w-14 bg-[#0B1026]/80 border border-[#C9A25A]/20 text-white text-right text-xs font-mono rounded-lg focus:border-[#C9A25A] focus-visible:ring-0 focus-visible:ring-offset-0" 
                    value={markupPercent} 
                    onChange={e => setMarkupPercent(parseFloat(e.target.value) || 0)} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-[#C9A25A]/20 pt-2.5">
              <div className="flex justify-between text-gray-400">
                <span>Gross Net Cost:</span>
                <span className="font-display font-bold text-white">₹{Math.round(baseCostTotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Markup profit yield:</span>
                <span className="font-display font-bold text-white">₹{Math.round(markupAmtTotal).toLocaleString('en-IN')}</span>
              </div>
              <div className={`p-2 rounded-lg border text-center flex justify-between items-center ${
                pct >= 20 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                pct >= 10 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-rose-500/10 border-rose-500/20 text-rose-450'
              }`}>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400">Profit Margin:</span>
                <span className="text-xs font-bold font-display">₹{Math.round(profitMarginTotal).toLocaleString('en-IN')} ({pct}%)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-[#1A2342] p-4 rounded-xl border border-[#C9A25A]/20 text-left flex flex-col justify-between">
            <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 font-display flex items-center gap-1.5 border-b border-[#C9A25A]/20 pb-2 mb-1">
              ⚙️ Workspace Actions
            </h4>
            <div className="space-y-2.5">
              <Button 
                onClick={handleSaveItinerary} 
                className="w-full bg-[#C9A25A] text-[#0B1026] hover:bg-[#D8B97A] font-display font-extrabold text-xs h-9 rounded-xl shadow-md border-0 uppercase tracking-wider"
              >
                <Check className="w-4 h-4 mr-2" /> Save & Sync Workspace
              </Button>

              <Button 
                variant="outline" 
                onClick={() => window.open(`/crm/leads/${leadId || activeLead?.id}/brochure`, '_blank')} 
                className="w-full text-xs h-9 font-display font-bold bg-[#1A2342] text-white hover:bg-[#1A2342]/80 border border-[#C9A25A]/30 rounded-xl transition-all uppercase tracking-wider"
              >
                <FileText className="w-4 h-4 mr-2" /> Preview Client Brochure
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOpenVoucher}
                  disabled={isDirty}
                  className="text-[10px] h-8 font-bold border border-[#C9A25A]/20 rounded-xl hover:bg-slate-800 bg-[#0B1026] text-slate-200 disabled:opacity-40"
                >
                  <Car className="w-3.5 h-3.5 mr-1" /> Voucher
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOpenInvoice}
                  disabled={isDirty}
                  className="text-[10px] h-8 font-bold border border-[#C9A25A]/20 rounded-xl hover:bg-slate-800 bg-[#0B1026] text-slate-200 disabled:opacity-40"
                >
                  <IndianRupee className="w-3.5 h-3.5 mr-1" /> Invoice
                </Button>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 text-center italic mt-2">
              Changes reflect live in your agent workspace costing sheet.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ItineraryBuilder({ leadId, activeLead, onBack, userProfile, initialDocView, onOpenCsvImport, onOpenUserManagement }: ItineraryBuilderProps) {
  const { toast } = useToast();

  // Proposal Brochure, Voucher & Invoice State
  const [proposalOpen, setProposalOpen] = useState(false);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  useEffect(() => {
    if (initialDocView === 'brochure') setProposalOpen(true);
    if (initialDocView === 'voucher') setVoucherOpen(true);
    if (initialDocView === 'invoice') setInvoiceOpen(true);
  }, [initialDocView]);

  // Normalize lead destination cities
  const getLeadCityNames = (): string[] => {
    const rawDest = activeLead?.lead_destination || activeLead?.destinations || activeLead?.destination;
    if (rawDest) {
      const parsed = parseDestinations(rawDest);
      if (parsed && parsed.length > 0) {
        const cleanedCities = parsed
          .map(s => s.city)
          .filter(c => c && !c.includes('·') && !c.toLowerCase().includes('itinerary for') && !/^\d+N/i.test(c));
        if (cleanedCities.length > 0) {
          return Array.from(new Set(cleanedCities));
        }
      }
    }
    if (activeLead?.lead_destination && Array.isArray(activeLead.lead_destination)) {
      const cities = activeLead.lead_destination
        .map((d: any) => (typeof d === 'string' ? d : d?.name || d?.city || ''))
        .filter(c => c && !c.includes('·') && !c.toLowerCase().includes('itinerary for'));
      if (cities.length > 0) return Array.from(new Set(cities));
    }
    if (activeLead?.destinations && typeof activeLead.destinations === 'string') {
      const cities = activeLead.destinations
        .split(',')
        .map((d: string) => d.trim())
        .filter(c => c && !c.includes('·') && !c.toLowerCase().includes('itinerary for'));
      if (cities.length > 0) return Array.from(new Set(cities));
    }
    return [];
  };

  // Helper to find consecutive subsequent days in the exact same accommodation city
  const getConsecutiveSameCityDayIds = (allDays: any[], startDayId: string): string[] => {
    const startIdx = allDays.findIndex(d => d.id === startDayId);
    if (startIdx === -1) return [startDayId];

    const startCity = (allDays[startIdx].accommodation_city || allDays[startIdx].city || '').toLowerCase().trim();
    const ids: string[] = [startDayId];

    for (let i = startIdx + 1; i < allDays.length; i++) {
      const nextCity = (allDays[i].accommodation_city || allDays[i].city || '').toLowerCase().trim();
      if (startCity && nextCity && startCity === nextCity) {
        ids.push(allDays[i].id);
      } else {
        break; // Stop at city boundary
      }
    }
    return ids;
  };

  const [loading, setLoading] = useState(false);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [savingItinerary, setSavingItinerary] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState<Record<string, boolean>>({});

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const inFlightCityRequests = React.useRef<Record<string, Promise<any>>>({});

  const [itinerary, setItinerary] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const [activeDayId, setActiveDayId] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0);

  // Master lists
  const [hotelsList, setHotelsList] = useState<Record<string, any[]>>({});
  const [availableHotels, setAvailableHotels] = useState<any[]>([]);
  const [availableSightseeings, setAvailableSightseeings] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<Record<string, any[]>>({});
  const [cabVehicles, setCabVehicles] = useState<any[]>([]);
  const [cabRoutes, setCabRoutes] = useState<any[]>([]);
  const [excursions, setExcursions] = useState<any[]>([]);
  const [masterActivities, setMasterActivities] = useState<any[]>([]);
  const [masterSightseeings, setMasterSightseeings] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [cityInventory, setCityInventory] = useState<Record<string, any>>({});

  // Destination stay plan states
  const [stayStops, setStayStops] = useState<{ country: string; state: string; city: string; nights: number }[]>([]);
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [statesList, setStatesList] = useState<any[]>([]);
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);
  const [editingStopIndex, setEditingStopIndex] = useState<number | null>(null);
  const [stayForm, setStayForm] = useState({ country: '', state: '', city: '', nights: 1 });

  const loadInventoryForCity = async (city: string) => {
    const cityKey = (city || '').toLowerCase().trim();
    if (!cityKey) return;
    
    // Find matching city object from master cities list
    const cityObj = citiesList.find(c => (c.name || c.city || '').toLowerCase().trim() === cityKey);
    
    // 1. Check local state cache
    if (cityInventory[cityKey]) {
      return cityInventory[cityKey];
    }
    
    // 2. Check in-flight requests
    if (inFlightCityRequests.current[cityKey]) {
      return inFlightCityRequests.current[cityKey];
    }
    
    // Set loading state for this city
    setLoadingInventory(prev => ({ ...prev, [cityKey]: true }));
    
    // 3. Make fetch request
    const promise = (async () => {
      const signal = abortControllerRef.current?.signal;
      
      if (!cityObj) {
        return await getInventoryByCity({ cityName: city, signal });
      } else {
        return await getInventoryByCity({ cityId: cityObj.id, cityName: city, signal });
      }
    })();
    
    inFlightCityRequests.current[cityKey] = promise;
    try {
      const data = await promise;
      setCityInventory(prev => ({ ...prev, [cityKey]: data }));

      // Merge fetched activities & sightseeings into excursions state for the activity picker
      if (data) {
        const rawActivities = data.activities || [];
        const rawSightseeings = data.sightseeings || [];

        const mappedActivities = rawActivities.map((a: any) => ({
          id: a.activity_id || a.id,
          excursion_name: a.name || a.activity_name,
          city: city,
          city_id: cityObj?.id || null,
          category: a.category || 'Activity',
          duration_hours: a.duration || '2-3 Hours',
          description: a.description || '',
          adult_rate: Number(a.rates?.[0]?.adult_rate || a.adult_rate || a.adult_cost || 0),
          child_rate: Number(a.rates?.[0]?.child_rate || a.child_rate || a.child_cost || 0),
          photo_url: a.image_url || '',
          _source: 'activity'
        }));

        const mappedSightseeings = rawSightseeings.map((s: any) => ({
          id: s.id,
          excursion_name: s.sightseeing_name || s.name,
          city: city,
          city_id: cityObj?.id || null,
          category: 'Sightseeing',
          duration_hours: s.duration || 'Half Day',
          description: s.description || '',
          adult_rate: Number(s.adult_cost || s.default_adult_rate || 0),
          child_rate: Number(s.child_cost || s.default_child_rate || 0),
          photo_url: s.image_url || '',
          _source: 'sightseeing'
        }));

        const newItems = [...mappedActivities, ...mappedSightseeings];
        if (newItems.length > 0) {
          setExcursions(prev => {
            const existingNames = new Set(prev.map(p => (p.excursion_name || p.name || '').toLowerCase()));
            const toAdd = newItems.filter(item => !existingNames.has((item.excursion_name || '').toLowerCase()));
            return [...prev, ...toAdd];
          });
        }
      }

      return data;
    } catch (err) {
      console.error(`Error loading inventory for city ${city}:`, err);
      return null;
    } finally {
      delete inFlightCityRequests.current[cityKey];
      setLoadingInventory(prev => ({ ...prev, [cityKey]: false }));
    }
  };

  const [viewMode, setViewMode] = useState<'sales' | 'operations'>('operations');
  const [markupPercent, setMarkupPercent] = useState<number>(10);

  // Picker States
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDayId, setPickerDayId] = useState('');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerTab, setPickerTab] = useState<'recommended' | 'activity' | 'sightseeing'>('recommended');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    activity_name: '',
    activity_category: 'Adventure',
    sub_category: 'Adventure Tour',
    duration: '',
    adult_cost: 0,
    child_cost: 0,
    description: '',
    image_url: ''
  });

  // Proposal Brochure State
  const [lastSavedDaysStr, setLastSavedDaysStr] = useState<string>('');
  const isDirty = lastSavedDaysStr !== '' && lastSavedDaysStr !== JSON.stringify(days);

  const handleOpenVoucher = () => {
    if (isDirty) {
      toast({
        title: 'Unsaved Changes Detected',
        description: 'Please click "Save & Sync" in the header to save your changes before generating operational service vouchers.',
        variant: 'destructive'
      });
      return;
    }

    if (!isFinancialConfirmed && activeLead?.status !== 'Booking Confirmed') {
      toast({
        title: '💳 Stage 2 Alert: Advance Deposit Required',
        description: 'Customer has not yet paid the 50% advance deposit. Generate & Share the GST Proforma Invoice (Stage 2) first, or mark lead as Booking Confirmed.',
        variant: 'default'
      });
    }

    if (!isInventoryConfirmed) {
      toast({
        title: '🛌 Stage 3 Alert: Supplier Confirmation Ref Missing',
        description: 'Please enter Hotel Confirmation Ref # or Driver details in day cards for complete operational voucher validation.',
        variant: 'default'
      });
    }

    window.open(`/crm/leads/${leadId || activeLead?.id}/voucher`, '_blank');
  };

  const handleOpenInvoice = () => {
    if (isDirty) {
      toast({
        title: 'Unsaved Changes Detected',
        description: 'Please click "Save & Sync" in the header to save your changes before generating proforma invoices.',
        variant: 'destructive'
      });
      return;
    }
    window.open(`/crm/leads/${leadId || activeLead?.id}/invoice`, '_blank');
  };

  // Visual Hotel Picker States
  const [hotelPickerOpen, setHotelPickerOpen] = useState(false);
  const [hotelPickerDayId, setHotelPickerDayId] = useState<string>('');
  const [hotelPickerBlockId, setHotelPickerBlockId] = useState<string>('');
  const [hotelFilterStars, setHotelFilterStars] = useState<string>('all');
  const [hotelFilterMealPlan, setHotelFilterMealPlan] = useState<string>('all');
  const [hotelFilterPriceMax, setHotelFilterPriceMax] = useState<number>(0);
  const [hotelSearchQuery, setHotelSearchQuery] = useState<string>('');
  const [selectedHotelRates, setSelectedHotelRates] = useState<Record<string, string>>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

  // Visual Cab Picker States
  const [cabPickerOpen, setCabPickerOpen] = useState(false);
  const [cabPickerDayId, setCabPickerDayId] = useState<string>('');
  const [cabPickerBlockId, setCabPickerBlockId] = useState<string>('');
  const [cabSearchQuery, setCabSearchQuery] = useState<string>('');

  // Costing & Extras States
  const [visaCost, setVisaCost] = useState<number>(0);
  const [costingDrawerOpen, setCostingDrawerOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Used Excursions Tracker to prevent duplication
  const usedExcursionIds = useMemo(() => {
    const ids = new Set<string>();
    days.forEach(day => {
      const blocks = day.metadata?.blocks || [];
      blocks.forEach((b: any) => {
        if (b.type === 'activity' && b.properties?.excursion_id) {
          ids.add(b.properties.excursion_id);
        }
      });
    });
    return ids;
  }, [days]);

  // Sorted cities putting lead destinations at the top
  const sortedCities = useMemo(() => {
    const dests = getLeadCityNames();
    const leadCitiesArr: any[] = [];
    const otherCities: any[] = [];
    const seenNames = new Set();
    
    dests.forEach((dest, idx) => {
      const dbMatch = citiesList.find((c: any) => (c.city || c.city_name || c.name || '').toLowerCase() === dest.toLowerCase());
      if (dbMatch) {
        const name = dbMatch.city || dbMatch.city_name || dbMatch.name || '';
        if (!seenNames.has(name.toLowerCase())) {
          seenNames.add(name.toLowerCase());
          leadCitiesArr.push(dbMatch);
        }
      } else {
        if (!seenNames.has(dest.toLowerCase())) {
          seenNames.add(dest.toLowerCase());
          leadCitiesArr.push({
            id: `lead-dest-${idx}`,
            city: dest,
            city_name: dest,
            name: dest,
            is_active: true
          });
        }
      }
    });

    citiesList.forEach(c => {
      const name = c.city || c.city_name || c.name || '';
      if (name && !seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        otherCities.push(c);
      }
    });

    return [...leadCitiesArr, ...otherCities];
  }, [citiesList, activeLead?.destinations, activeLead?.lead_destination]);

  const [inclusions, setInclusions] = useState<Record<string, boolean>>({
    'Hotel Stay': true,
    'Breakfast': true,
    'Airport Transfers': true,
    'Sightseeing': true,
    'GST': true,
    'Driver Allowance': true
  });
  const [exclusions, setExclusions] = useState<Record<string, boolean>>({
    'Flights': true,
    'Personal Expenses': true,
    'Tips': true,
    'Laundry': true
  });

  // AI Generator & Journey Composer state
  const [aiGenOpen, setAiGenOpen] = useState(false);
  const [aiTheme, setAiTheme] = useState('Family');
  const [aiBudget, setAiBudget] = useState('60000');

  // Journey Composer inputs
  const [composerDest, setComposerDest] = useState('');
  const [composerNights, setComposerNights] = useState('3');
  const [composerHotelStars, setComposerHotelStars] = useState('4 Star');
  const [composerBudget, setComposerBudget] = useState('35000');
  const [composerAdults, setComposerAdults] = useState(2);
  const [composerChildren, setComposerChildren] = useState(0);
  
  const [composerSearching, setComposerSearching] = useState(false);
  // These two were being set by handleSuggestJourneys() with no useState
  // declaration at all (a real compile error) and nothing anywhere reads
  // either value to render a result — the "Suggest Journeys" composer
  // feature looks incomplete, not just missing a declaration. Adding the
  // state here makes the file compile and keeps the existing behavior
  // (computes suggestions, stores them, shows nothing) rather than
  // guessing at a UI that was never built.
  const [composerSearchActive, setComposerSearchActive] = useState(false);
  const [journeyOptions, setJourneyOptions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [leadId]);

  useEffect(() => {
    if (activeDayId) {
      const activeDay = days.find(d => d.id === activeDayId);
      const city = activeDay?.accommodation_city || activeDay?.city;
      if (city) {
        loadInventoryForCity(city).then(data => {
          if (data) {
            // Map unique hotels for this day
            const uniqueHotels = (data.hotels || []).map((h: any) => ({
              id:            h.id,
              hotel_name:    h.name || h.hotel_name,
              star_category: h.star_category || h.star_rating,
              contract_type: h.contract_type,
              rates:         (h.rates || []).map((r: any) => ({
                id:             r.rate_id,
                rate_id:        r.rate_id,
                room_type:      r.room_type,
                meal_plan:      r.meal_plan,
                rate:           r.rate_per_night,
                rate_per_night: r.rate_per_night,
                extra_bed_rate: r.extra_bed_rate,
                child_rate:     r.child_rate,
                currency:       r.currency || 'INR'
              }))
            }));
            setHotelsList(prev => ({ ...prev, [activeDayId]: uniqueHotels }));

            // Map excursions
            const mappedExcursions = (data.activities || []).map((a: any) => ({
              id: a.activity_id || a.id,
              adult_rate: Number(a.adult_rate || a.selling_cost || 0),
              child_rate: Number(a.child_rate || 0),
              photo_url: a.image_url || '',
              _source: a._source || 'activity'
            }));
            setExcursions(prev => {
              const existingIds = new Set(prev.map(p => String(p.id)));
              const filteredNew = mappedExcursions.filter((m: any) => !existingIds.has(String(m.id)));
              return [...prev, ...filteredNew];
            });

            // Map cabs
            if (data.cabs && data.cabs.length > 0) {
              const vehicles = data.cabs.map((c: any) => ({ vehicle_type: c.vehicle_type, active_status: true }));
              const routes = data.cabs.map((c: any) => ({ id: c.rate_id, route_type: c.usage_type }));
              setCabVehicles(vehicles);
              setCabRoutes(routes);
            }
          }
        });
      }
    }
  }, [activeDayId, days]);

  const updateStayPlan = (newStops: typeof stayStops, customStartDate?: string) => {
    const currentStartDate = customStartDate || itinerary?.travel_start_date || new Date().toISOString().split('T')[0];
    const totalN = newStops.reduce((sum, s) => sum + s.nights, 0);
    const computedEndDate = new Date(new Date(currentStartDate).getTime() + totalN * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Build city sequence
    const citySequence: string[] = [];
    newStops.forEach(stop => {
      for (let i = 0; i < stop.nights; i++) {
        citySequence.push(stop.city);
      }
    });

    // Align days
    const updatedDays = [];
    for (let i = 1; i <= totalN; i++) {
      const dayDate = new Date(new Date(currentStartDate).getTime() + (i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const targetCity = citySequence[i - 1] || 'Delhi';
      
      const existingDay = days[i - 1];
      if (existingDay) {
        // Aligned day
        updatedDays.push({
          ...existingDay,
          day_number: i,
          date: dayDate,
          city: targetCity,
          accommodation_city: targetCity,
          title: existingDay.title?.startsWith('Day ') 
            ? `Day ${i}: Welcome to ${targetCity}` 
            : existingDay.title || `Day ${i}: Welcome to ${targetCity}`
        });
      } else {
        // Create default blocks
        const dayBlocks = [
          {
            id: 'hotel_auto_' + i + '_' + Math.random().toString(36).substring(2, 7),
            type: 'hotel',
            time: '12:00',
            cost: 0,
            properties: {
              hotel_id: '',
              hotel_name: '',
              room_category: 'Standard Room',
              meal_plan: 'CP',
              nights: 1,
              rooms: 1,
              rate_per_night: 0,
              room_cost: 0,
              total_cost: 0,
              chargeable: true
            }
          },
          {
            id: 'trans_auto_' + i + '_' + Math.random().toString(36).substring(2, 7),
            type: 'transfer',
            time: '09:00',
            cost: 0,
            properties: {
              vehicle_type: '',
              route_id: null,
              route_from: '',
              route_to: '',
              season: 'Normal Season',
              base_cost: 0,
              driver_cost: 0,
              total_cost: 0,
              chargeable: true
            }
          },
          {
            id: 'meal_auto_' + i + '_' + Math.random().toString(36).substring(2, 7),
            type: 'meal',
            time: '08:00',
            cost: 0,
            properties: {
              meal_type: 'Breakfast',
              description: 'Included Standard CP breakfast buffet at hotel.',
              chargeable: false
            }
          }
        ];
        updatedDays.push({
          day_number: i,
          date: dayDate,
          city: targetCity,
          accommodation_city: targetCity,
          title: `Day ${i}: Welcome to ${targetCity}`,
          description: `Explore the local attractions in ${targetCity} and check in to your stay.`,
          metadata: { blocks: dayBlocks }
        });
      }
    }
    setDays(updatedDays);
    setItinerary((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        travel_start_date: currentStartDate,
        travel_end_date: computedEndDate,
        total_nights: totalN,
        destinations: newStops
      };
    });
  };

  const loadData = async () => {
    setLoadingItinerary(true);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // 1. Fetch itinerary from MySQL
      const loadDataJson = await getItineraryByLeadId({ leadId, signal });
      let itin = loadDataJson.itinerary;

      let start_date = getLeadStartDate(activeLead, itin);
      let end_date = activeLead?.trip_end_date || new Date(new Date(start_date).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const diffTime = Math.abs(new Date(end_date).getTime() - new Date(start_date).getTime());
      const nightsCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 3;

      const guestCounts = getLeadGuestCounts(activeLead, itin);

      // 2. Load cities, states, and countries master lists from consolidated cached bootstrap
      try {
        const bootstrapData = await fetchCachedJson('/php-backend/bootstrap.php');
        if (bootstrapData && bootstrapData.success) {
          if (Array.isArray(bootstrapData.cities)) setCitiesList(bootstrapData.cities.filter((c: any) => c.is_active || c.is_active === undefined || c.active_status));
          if (Array.isArray(bootstrapData.states)) setStatesList(bootstrapData.states.filter((s: any) => s.active_status || s.active_status === undefined));
          if (Array.isArray(bootstrapData.countries)) setCountriesList(bootstrapData.countries.filter((co: any) => co.active_status || co.active_status === undefined));
        }
      } catch (e) {
        console.warn('Error reading bootstrap cache:', e);
      }

      const parsedStops = parseDestinations(itin?.destinations || activeLead?.lead_destination || activeLead?.destinations || activeLead?.destination);

      if (!itin) {
        // Create default itinerary and days
        const leadCities = getLeadCityNames().length > 0 ? getLeadCityNames() : ['Delhi'];
        const defaultStops = parsedStops.length > 0 ? parsedStops : leadCities.map(city => ({
          country: 'India',
          state: 'Gujarat',
          city: city,
          nights: nightsCount > 0 ? Math.ceil(nightsCount / leadCities.length) || 1 : 1
        }));

        const defaultCitySequence: string[] = [];
        defaultStops.forEach(stop => {
          for (let i = 0; i < stop.nights; i++) {
            defaultCitySequence.push(stop.city);
          }
        });
        const totalNightsCalc = defaultCitySequence.length;

        const defaultDays = [];
        for (let i = 1; i <= totalNightsCalc; i++) {
          const dayDate = new Date(new Date(start_date).getTime() + (i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const currentCity = defaultCitySequence[i - 1] || leadCities[0] || 'Delhi';
          const dayBlocks = [];

          // Hotel block (blank block)
          dayBlocks.push({
            id: 'hotel_auto_' + i + '_' + Math.random().toString(36).substring(2, 7),
            type: 'hotel',
            time: '12:00',
            cost: 0,
            properties: {
              hotel_id: '',
              hotel_name: '',
              room_category: 'Standard Room',
              meal_plan: 'CP',
              nights: 1,
              rooms: 1,
              rate_per_night: 0,
              room_cost: 0,
              total_cost: 0,
              chargeable: true
            }
          });

          // Transfer block (blank block)
          dayBlocks.push({
            id: 'trans_auto_' + i + '_' + Math.random().toString(36).substring(2, 7),
            type: 'transfer',
            time: '09:00',
            cost: 0,
            properties: {
              vehicle_type: '',
              route_id: null,
              route_from: '',
              route_to: '',
              season: 'Normal Season',
              base_cost: 0,
              driver_cost: 0,
              total_cost: 0,
              chargeable: true
            }
          });

          // Sightseeing / Activity block (default block)
          dayBlocks.push({
            id: 'act_auto_' + i + '_' + Math.random().toString(36).substring(2, 7),
            type: 'activity',
            time: '14:00',
            cost: 0,
            properties: {
              excursion_name: `Local Sightseeing & Attractions in ${currentCity}`,
              category: 'Sightseeing',
              description: `Visit top landmarks, monuments, and local markets in ${currentCity}.`,
              total_cost: 0,
              chargeable: true
            }
          });

          defaultDays.push({
            day_number: i,
            date: dayDate,
            city: currentCity,
            accommodation_city: currentCity,
            title: `Day ${i}: Welcome to ${currentCity}`,
            description: `Explore the local attractions in ${currentCity} and check in to your stay.`,
            metadata: { blocks: dayBlocks }
          });
        }

        // Save default itinerary via save API
        const defaultPayload = {
          id: null,
          lead_id: Number(leadId),
          itinerary_name: `Itinerary for ${activeLead?.customer_name || 'Guest'} - ${getLeadCityNames().join(', ') || 'Tour'}`,
          destinations: defaultStops,
          adult_count: guestCounts.adults,
          child_count: guestCounts.children,
          infant_count: activeLead?.infant_count || 0,
          total_nights: totalNightsCalc,
          travel_start_date: start_date,
          travel_end_date: end_date,
          hotel_cost: 0,
          transport_cost: 0,
          excursion_cost: 0,
          markup_percentage: 10,
          final_cost: 0,
          cost_per_person: 0,
          notes: '',
          status: 'Draft',
          days: defaultDays
        };

        const saveResult = await saveItineraryDraft({ payload: defaultPayload });
        
        // Load nested itinerary again to populate local states with IDs
        const reloadData = await getItineraryByLeadId({ leadId, signal });
        itin = reloadData.itinerary;
      }

      if (itin) {
        if (!itin.travel_start_date || (activeLead && (activeLead.trip_start_date || activeLead.travel_date || activeLead.travel_dates || activeLead.tripStartDate))) {
          itin.travel_start_date = start_date;
        }
      }

      setItinerary(itin);
      const activeStops = parseDestinations(activeLead?.lead_destination || activeLead?.destinations || activeLead?.destination || itin?.destinations);
      setStayStops(activeStops.length > 0 ? activeStops : parsedStops);

      setComposerAdults(guestCounts.adults);
      setComposerChildren(guestCounts.children);

      if (itin?.markup_percentage !== null && itin?.markup_percentage !== undefined) {
        setMarkupPercent(itin.markup_percentage);
      }
      setVisaCost(Number(itin?.visa_cost) || 0);

      const stopsToUse = activeStops.length > 0 ? activeStops : parsedStops;
      const fullCitySequence: string[] = [];
      stopsToUse.forEach(stop => {
        for (let n = 0; n < (stop.nights || 1); n++) {
          fullCitySequence.push(stop.city);
        }
      });
      const targetTotalNights = fullCitySequence.length;

      let processedDays = itin?.days ? [...itin.days] : [];

      // Auto-expand days if existing itinerary days are fewer than lead's total stay nights
      if (targetTotalNights > processedDays.length) {
        for (let i = processedDays.length + 1; i <= targetTotalNights; i++) {
          const currentCity = fullCitySequence[i - 1] || 'Destination';
          const dayDate = start_date ? new Date(new Date(start_date).getTime() + (i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';
          const dayBlocks = [
            {
              id: 'hotel_auto_' + i + '_' + Math.random().toString(36).substring(2, 7),
              type: 'hotel',
              time: '12:00',
              cost: 0,
              properties: {
                hotel_id: '',
                hotel_name: '',
                room_category: 'Standard Room',
                meal_plan: 'CP',
                nights: 1,
                rooms: 1,
                rate_per_night: 0,
                room_cost: 0,
                total_cost: 0,
                chargeable: true
              }
            },
            {
              id: 'trans_auto_' + i + '_' + Math.random().toString(36).substring(2, 7),
              type: 'transfer',
              time: '09:00',
              cost: 0,
              properties: {
                vehicle_type: '',
                route_id: null,
                route_from: '',
                route_to: '',
                season: 'Normal Season',
                base_cost: 0,
                driver_cost: 0,
                total_cost: 0,
                chargeable: true
              }
            },
            {
              id: 'act_auto_' + i + '_' + Math.random().toString(36).substring(2, 7),
              type: 'activity',
              time: '14:00',
              cost: 0,
              properties: {
                excursion_name: `Local Sightseeing & Attractions in ${currentCity}`,
                category: 'Sightseeing',
                description: `Visit top landmarks, monuments, and local markets in ${currentCity}.`,
                total_cost: 0,
                chargeable: true
              }
            }
          ];

          processedDays.push({
            day_number: i,
            date: dayDate,
            city: currentCity,
            accommodation_city: currentCity,
            title: `Day ${i}: Welcome to ${currentCity}`,
            description: `Explore the local attractions in ${currentCity} and check in to your stay.`,
            metadata: { blocks: dayBlocks }
          });
        }
      }

      const hotelsMap = (processedDays.flatMap((d: any) => d.hotels || [])).reduce((acc: any, h: any) => {
        if (h.itinerary_day_id) {
          if (!acc[h.itinerary_day_id]) acc[h.itinerary_day_id] = [];
          acc[h.itinerary_day_id].push(h);
        }
        return acc;
      }, {});
      const transportsMap = (processedDays.flatMap((d: any) => d.transport || [])).reduce((acc: any, t: any) => {
        if (t.itinerary_day_id) {
          if (!acc[t.itinerary_day_id]) acc[t.itinerary_day_id] = [];
          acc[t.itinerary_day_id].push(t);
        }
        return acc;
      }, {});
      const excMap = (processedDays.flatMap((d: any) => d.excursions || [])).reduce((acc: any, e: any) => {
        if (e.itinerary_day_id) {
          if (!acc[e.itinerary_day_id]) acc[e.itinerary_day_id] = [];
          acc[e.itinerary_day_id].push(e);
        }
        return acc;
      }, {});

      const finalDaysList = processedDays.map((day: any, idx: number) => {
        const assignedCity = fullCitySequence[idx] || day.accommodation_city || (getLeadCityNames()[0] || 'Delhi');
        const isDirtyCity = !day.accommodation_city || day.accommodation_city.includes('+') || day.accommodation_city.includes('·') || /\b\d+N\b/i.test(day.accommodation_city) || day.accommodation_city.toLowerCase().includes('itinerary for') || day.accommodation_city.toLowerCase().includes('custom travel brief');
        if (isDirtyCity || fullCitySequence[idx]) {
          day.accommodation_city = assignedCity;
        }
        if (!day.city || day.city.includes('+') || day.city.includes('·') || /\b\d+N\b/i.test(day.city) || day.city.toLowerCase().includes('itinerary for') || day.city.toLowerCase().includes('custom travel brief')) {
          day.city = day.accommodation_city;
        }
        if (!day.title || day.title.includes('·') || day.title.includes('4N/5D') || day.title.toLowerCase().includes('itinerary for') || day.title.toLowerCase().includes('custom travel brief')) {
          day.title = `Day ${day.day_number}: Welcome to ${day.accommodation_city || 'Destination'}`;
        }
        if (!day.description || day.description.includes('·') || day.description.includes('4N/5D') || day.description.toLowerCase().includes('itinerary for') || day.description.toLowerCase().includes('custom travel brief')) {
          day.description = `Explore the local attractions in ${day.accommodation_city || 'Destination'} and check in to your stay.`;
        }
        if (start_date) {
          const calculatedDate = new Date(new Date(start_date).getTime() + (idx * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
          day.date = calculatedDate;
        }
        const metadata = day.metadata || { blocks: [] };
        let blocks = metadata.blocks || [];

        blocks = blocks.map((b: any) => {
          if (b.type === 'activity' && b.properties) {
            const isDirtyName = !b.properties.excursion_name || b.properties.excursion_name.includes('·') || b.properties.excursion_name.includes('4N/5D') || b.properties.excursion_name.toLowerCase().includes('itinerary for');
            const isDirtyDesc = !b.properties.description || b.properties.description.includes('·') || b.properties.description.includes('4N/5D') || b.properties.description.toLowerCase().includes('itinerary for');
            if (isDirtyName || isDirtyDesc) {
              return {
                ...b,
                properties: {
                  ...b.properties,
                  excursion_name: isDirtyName ? `Local Sightseeing & Attractions in ${day.accommodation_city}` : b.properties.excursion_name,
                  description: isDirtyDesc ? `Visit top landmarks, monuments, and local markets in ${day.accommodation_city}.` : b.properties.description
                }
              };
            }
          }
          return b;
        });

        if (blocks.length === 0) {
          // Sync existing SQL records into front-end visual blocks
          const dayHotels = hotelsMap[day.id] || [];
          dayHotels.forEach((stay: any) => {
            blocks.push({
              id: 'hotel_' + stay.id,
              type: 'hotel',
              time: '12:00',
              cost: Number(stay.total_cost) || 0,
              properties: {
                id: stay.id,
                hotel_id: stay.hotel_id,
                hotel_name: stay.hotel_name || 'Selected Hotel',
                room_category: stay.room_category,
                meal_plan: stay.meal_plan,
                nights: stay.nights || 1,
                rooms: stay.rooms || 1,
                rate_per_night: Number(stay.rate_per_night) || 0,
                room_cost: Number(stay.room_cost) || 0,
                gst_cost: Number(stay.gst_cost) || 0,
                total_cost: Number(stay.total_cost) || 0,
                room_configuration: typeof stay.room_configuration === 'string' ? JSON.parse(stay.room_configuration) : (stay.room_configuration || { doubleRooms: 1 })
              }
            });
          });

          const dayTrans = transportsMap[day.id] || [];
          dayTrans.forEach((trans: any) => {
            blocks.push({
              id: 'trans_' + trans.id,
              type: 'transfer',
              time: '09:00',
              cost: Number(trans.total_cost) || 0,
              properties: {
                id: trans.id,
                cab_rate_id: trans.cab_rate_id,
                vehicle_type: trans.vehicle_type,
                route_id: trans.route_id,
                season: trans.season || 'Normal Season',
                base_cost: Number(trans.base_cost) || 0,
                gst_cost: Number(trans.gst_cost) || 0,
                driver_cost: Number(trans.driver_cost) || 0,
                toll_charges: Number(trans.toll_charges) || 0,
                parking_charges: Number(trans.parking_charges) || 0,
                state_tax: Number(trans.state_tax) || 0,
                permit_charges: Number(trans.permit_charges) || 0,
                total_cost: Number(trans.total_cost) || 0,
                gst_percentage: Number(trans.gst_percentage) || 5,
                gst_included: trans.gst_included || false
              }
            });
          });

          const dayExcs = excMap[day.id] || [];
          dayExcs.forEach((exc: any) => {
            blocks.push({
              id: 'exc_' + exc.id,
              type: 'activity',
              time: exc.excursion_time || '14:00',
              cost: Number(exc.total_cost) || 0,
              properties: {
                id: exc.id,
                excursion_id: exc.excursion_id,
                excursion_name: exc.excursion_name || 'Activity Item',
                description: exc.description || '',
                adult_count: exc.adult_count || 1,
                child_count: exc.child_count || 0,
                adult_rate: Number(exc.adult_rate) || 0,
                child_rate: Number(exc.child_rate) || 0,
                total_cost: Number(exc.total_cost) || 0
              }
            });
          });
        }

        return {
          ...day,
          metadata: { ...metadata, blocks }
        };
      });

      setDays(finalDaysList);
      setLastSavedDaysStr(JSON.stringify(finalDaysList));
      if (finalDaysList.length > 0 && !activeDayId) {
        setActiveDayId(finalDaysList[0].id);
      }

      // Pre-load hotel/transit/activity inventory for all destination cities across days
      const uniqueCities = Array.from(new Set(finalDaysList.map((d: any) => d.accommodation_city).filter(Boolean)));
      uniqueCities.forEach((city: string) => {
        loadInventoryForCity(city);
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast({
          title: 'Error Loading Itinerary',
          description: err.message,
          variant: 'destructive'
        });
      }
    } finally {
      setLoadingItinerary(false);
    }
  };

  const syncItineraryStateOnly = async () => {
    try {
      const signal = abortControllerRef.current?.signal;
      const loadDataJson = await getItineraryByLeadId({ leadId, signal });
      let itin = loadDataJson.itinerary;
      if (itin) {
        setItinerary(itin);
        const parsedStops = parseDestinations(itin.destinations);
        setStayStops(parsedStops);
        if (itin.adult_count !== undefined) setComposerAdults(itin.adult_count || 2);
        if (itin.child_count !== undefined) setComposerChildren(itin.child_count || 0);
        if (itin.markup_percentage !== null) {
          setMarkupPercent(itin.markup_percentage);
        }
        setVisaCost(Number(itin.visa_cost) || 0);

        const processedDays = itin.days || [];
        const hotelsMap = (processedDays.flatMap((d: any) => d.hotels || [])).reduce((acc: any, h: any) => {
          if (h.itinerary_day_id) {
            if (!acc[h.itinerary_day_id]) acc[h.itinerary_day_id] = [];
            acc[h.itinerary_day_id].push(h);
          }
          return acc;
        }, {});
        const transportsMap = (processedDays.flatMap((d: any) => d.transport || [])).reduce((acc: any, t: any) => {
          if (t.itinerary_day_id) {
            if (!acc[t.itinerary_day_id]) acc[t.itinerary_day_id] = [];
            acc[t.itinerary_day_id].push(t);
          }
          return acc;
        }, {});
        const excMap = (processedDays.flatMap((d: any) => d.excursions || [])).reduce((acc: any, e: any) => {
          if (e.itinerary_day_id) {
            if (!acc[e.itinerary_day_id]) acc[e.itinerary_day_id] = [];
            acc[e.itinerary_day_id].push(e);
          }
          return acc;
        }, {});

        const finalDaysList = processedDays.map((day: any, idx: number) => {
          const cities = getLeadCityNames();
          if (!day.accommodation_city) {
            day.accommodation_city = cities.length > 0 ? cities[idx % cities.length] : '';
          }
          if (!day.city) {
            day.city = day.accommodation_city;
          }
          const metadata = day.metadata || { blocks: [] };
          let blocks = metadata.blocks || [];

          if (blocks.length === 0) {
            const dayHotels = hotelsMap[day.id] || [];
            dayHotels.forEach((stay: any) => {
              blocks.push({
                id: 'hotel_' + stay.id,
                type: 'hotel',
                time: '12:00',
                cost: Number(stay.total_cost) || 0,
                properties: {
                  id: stay.id,
                  hotel_id: stay.hotel_id,
                  hotel_name: stay.hotel_name || 'Selected Hotel',
                  room_category: stay.room_category,
                  meal_plan: stay.meal_plan,
                  nights: stay.nights || 1,
                  rooms: stay.rooms || 1,
                  rate_per_night: Number(stay.rate_per_night) || 0,
                  room_cost: Number(stay.room_cost) || 0,
                  gst_cost: Number(stay.gst_cost) || 0,
                  total_cost: Number(stay.total_cost) || 0,
                  room_configuration: typeof stay.room_configuration === 'string' ? JSON.parse(stay.room_configuration) : (stay.room_configuration || { doubleRooms: 1 })
                }
              });
            });

            const dayTrans = transportsMap[day.id] || [];
            dayTrans.forEach((trans: any) => {
              blocks.push({
                id: 'trans_' + trans.id,
                type: 'transfer',
                time: '09:00',
                cost: Number(trans.total_cost) || 0,
                properties: {
                  id: trans.id,
                  cab_rate_id: trans.cab_rate_id,
                  vehicle_type: trans.vehicle_type,
                  route_id: trans.route_id,
                  season: trans.season || 'Normal Season',
                  base_cost: Number(trans.base_cost) || 0,
                  gst_cost: Number(trans.gst_cost) || 0,
                  driver_cost: Number(trans.driver_cost) || 0,
                  toll_charges: Number(trans.toll_charges) || 0,
                  parking_charges: Number(trans.parking_charges) || 0,
                  state_tax: Number(trans.state_tax) || 0,
                  permit_charges: Number(trans.permit_charges) || 0,
                  total_cost: Number(trans.total_cost) || 0,
                  gst_percentage: Number(trans.gst_percentage) || 5,
                  gst_included: trans.gst_included || false
                }
              });
            });

            const dayExcs = excMap[day.id] || [];
            dayExcs.forEach((exc: any) => {
              blocks.push({
                id: 'exc_' + exc.id,
                type: 'activity',
                time: exc.excursion_time || '14:00',
                cost: Number(exc.total_cost) || 0,
                properties: {
                  id: exc.id,
                  excursion_id: exc.excursion_id,
                  excursion_name: exc.excursion_name || 'Activity Item',
                  description: exc.description || '',
                  adult_count: exc.adult_count || 1,
                  child_count: exc.child_count || 0,
                  adult_rate: Number(exc.adult_rate) || 0,
                  child_rate: Number(exc.child_rate) || 0,
                  total_cost: Number(exc.total_cost) || 0
                }
              });
            });
          }

          return {
            ...day,
            metadata: { ...metadata, blocks }
          };
        });

        setDays(finalDaysList);
        setLastSavedDaysStr(JSON.stringify(finalDaysList));
      }
    } catch (err) {
      console.error("Error syncing itinerary state:", err);
    }
  };

  const handleMoveStop = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === stayStops.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newStops = [...stayStops];
    const temp = newStops[idx];
    newStops[idx] = newStops[targetIdx];
    newStops[targetIdx] = temp;
    updateStayPlan(newStops);
  };

  const handleDuplicateStop = (idx: number) => {
    const newStops = [...stayStops];
    newStops.splice(idx + 1, 0, { ...newStops[idx] });
    updateStayPlan(newStops);
  };

  const handleDeleteStop = (idx: number) => {
    const newStops = stayStops.filter((_, i) => i !== idx);
    updateStayPlan(newStops);
  };

  const handleEditStop = (idx: number) => {
    setEditingStopIndex(idx);
    setStayForm(stayStops[idx]);
    setIsStayModalOpen(true);
  };

  const handleOpenAddStop = () => {
    setEditingStopIndex(null);
    setStayForm({ country: 'India', state: '', city: '', nights: 1 });
    setIsStayModalOpen(true);
  };

  const fetchHotelsForCity = async (dayId: string, city: string) => {
    const data = await loadInventoryForCity(city);
    if (data) {
      // Map nested structure to hotelsList (no deduplication needed)
      const hotels = (data.hotels || []).map((h: any) => ({
        id:            h.id,
        hotel_name:    h.name || h.hotel_name,
        star_category: h.star_category || h.star_rating,
        contract_type: h.contract_type,
        rates:         h.rates || []
      }));
      setHotelsList(prev => ({ ...prev, [dayId]: hotels }));

      // Map cabs
      const vehicles = (data.cabs || []).flatMap((c: any) =>
        (c.rates || []).map((r: any) => ({
          vehicle_type:  r.vehicle_type,
          rate:          r.rate,
          extra_km_rate: r.extra_km_rate,
          active_status: true
        }))
      );
      const routes = (data.cabs || []).flatMap((c: any) =>
        (c.rates || []).map((r: any) => ({
          id:         r.rate_id,
          vendor_id:  c.id,
          vendor_name:c.name || c.vendor_name,
          route_type: r.usage_type,
          vehicle_type: r.vehicle_type,
          rate:       r.rate
        }))
      );
      setCabVehicles(vehicles);
      setCabRoutes(routes);
    }
  };

  const fetchRoomsForHotel = async (dayId: string, hotelId: string) => {
    const targetDay = days.find(d => d.id === dayId);
    const city = targetDay?.accommodation_city || targetDay?.city;
    if (!city) return;

    const cityObj = citiesList.find((c: any) => (c.name || c.city_name || '').toLowerCase() === city.toLowerCase());
    const cityKey = cityObj ? cityObj.id : city.toLowerCase().trim();
    
    let inv = cityInventory[cityKey];
    if (!inv) {
      await fetchHotelsForCity(dayId, city);
      inv = cityInventory[cityKey];
      if (!inv) return;
    }

    const hotel = (inv.hotels || []).find((h: any) => 
      String(h.id) === String(hotelId)
    );
    if (!hotel) return;

    const rooms = (hotel.rates || []).map((r: any) => ({
      id:               r.rate_id,
      room_category_name: r.room_type,
      hotel_id:         hotel.id,
      meal_plan:        r.meal_plan,
      rate_per_night:   r.rate_per_night,
      extra_bed_rate:   r.extra_bed_rate,
      child_rate:       r.child_rate,
      currency:         r.currency
    }));
    setRoomsList(prev => ({ ...prev, [dayId]: rooms }));
  };

  const calculateHotelRate = async (hotelId: string, roomCatName: string, mealPlan: string, date: string, city: string) => {
    try {
      const cityObj = citiesList.find((c: any) => (c.name || c.city_name || '').toLowerCase() === city.toLowerCase());
      const cityKey = cityObj ? cityObj.id : city.toLowerCase();
      const inv = cityInventory[cityKey];
      if (!inv) return null;

      let matchRate: any = null;
      const hotel = (inv.hotels || []).find((h: any) => String(h.id) === String(hotelId));
      if (hotel) {
        matchRate = (hotel.rates || []).find((r: any) => 
          r.room_type === roomCatName && 
          r.meal_plan === mealPlan
        );
      }

      if (!matchRate) {
        toast({
          title: 'Rate Not Available',
          description: `No rate contract exists for "${roomCatName}" with "${mealPlan}" meal plan.`
        });
        return null;
      }

      const doubleRate = Number(matchRate.rate_per_night) || 0;
      const rateType = matchRate.rate_type || 'inclusive';
      const gstPercentage = doubleRate < 1000 ? 0 : doubleRate < 7500 ? 12 : 18;

      let roomCost = doubleRate;
      let gstAmt = 0;
      let totalCost = doubleRate;

      if (rateType === 'inclusive') {
        totalCost = doubleRate;
        roomCost = totalCost / (1 + (gstPercentage / 100));
        gstAmt = totalCost - roomCost;
      } else {
        roomCost = doubleRate;
        gstAmt = roomCost * (gstPercentage / 100);
        totalCost = roomCost + gstAmt;
      }

      return {
        rate_per_night: roomCost,
        room_cost: roomCost,
        gst_cost: gstAmt,
        total_cost: totalCost,
        gst_percentage: gstPercentage
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const calculateCabRate = async (vehicleType: string, routeId: string, season: string, city: string) => {
    try {
      const cityObj = citiesList.find((c: any) => (c.name || c.city_name || '').toLowerCase() === city.toLowerCase());
      const cityKey = cityObj ? cityObj.id : city.toLowerCase();
      const inv = cityInventory[cityKey];
      if (!inv) return null;

      let matchRate: any = null;
      for (const cab of (inv.cabs || [])) {
        const rate = (cab.rates || []).find((r: any) => 
          String(r.rate_id) === String(routeId) || r.vehicle_type === vehicleType
        );
        if (rate) {
          matchRate = rate;
          break;
        }
      }

      if (!matchRate) {
        toast({
          title: 'Cab Rate Not Available',
          description: `No rate contract exists for vehicle type "${vehicleType}" in this city.`
        });
        return null;
      }

      const baseCostVal = parseFloat(matchRate.rate) || 0;
      const gstPercentage = 5;
      const roomCost = baseCostVal / 1.05;
      const gstAmt = baseCostVal - roomCost;

      return {
        cab_rate_id: matchRate.rate_id,
        base_cost: roomCost,
        gst_cost: gstAmt,
        driver_cost: 0,
        toll_charges: 0,
        parking_charges: 0,
        state_tax: 0,
        permit_charges: 0,
        total_cost: baseCostVal,
        gst_included: true,
        gst_percentage: gstPercentage
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleAddBlock = (dayId: string, blockType: string) => {
    setDays(prevDays => prevDays.map(day => {
      if (day.id !== dayId) return day;

      const blocks = [...(day.metadata?.blocks || [])];
      const newBlock = {
        id: blockType + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        type: blockType,
        time: '12:00',
        cost: 0,
        properties: blockType === 'hotel' ? {
          hotel_id: '',
          room_category: 'Standard',
          meal_plan: 'CP',
          nights: 1,
          rooms: 1,
          rate_per_night: 0,
          room_cost: 0,
          gst_cost: 0,
          total_cost: 0,
          room_configuration: { doubleRooms: 1 }
        } : blockType === 'transfer' ? {
          cab_rate_id: '',
          vehicle_type: 'Sedan',
          route_id: '',
          season: 'Normal Season',
          base_cost: 0,
          driver_cost: 0,
          toll_charges: 0,
          parking_charges: 0,
          state_tax: 0,
          permit_charges: 0,
          gst_cost: 0,
          total_cost: 0,
          gst_percentage: 5,
          gst_included: false
        } : blockType === 'activity' ? {
          excursion_id: '',
          excursion_name: '',
          description: '',
          adult_count: itinerary?.adult_count || 2,
          child_count: itinerary?.child_count || 0,
          adult_rate: 0,
          child_rate: 0,
          total_cost: 0
        } : blockType === 'flight' ? {
          flight_no: '',
          airline: '',
          dep_airport: '',
          arr_airport: '',
          dep_time: '12:00',
          arr_time: '14:00',
          total_cost: 0
        } : blockType === 'meal' ? {
          meal_type: 'Breakfast',
          description: 'Standard package buffet meal.',
          total_cost: 0,
          chargeable: false
        } : {
          description: '',
          total_cost: 0
        }
      };

      return {
        ...day,
        metadata: { ...day.metadata, blocks: [...blocks, newBlock] }
      };
    }));
  };

  const handleDeleteBlock = (dayId: string, blockId: string) => {
    setDays(prevDays => prevDays.map(day => {
      if (day.id !== dayId) return day;
      const blocks = (day.metadata?.blocks || []).filter((b: any) => b.id !== blockId);
      return {
        ...day,
        metadata: { ...day.metadata, blocks }
      };
    }));
  };

  const handleUpdateBlockField = async (dayId: string, blockId: string, field: string, value: any) => {
    const targetDay = days.find(d => d.id === dayId);
    const targetBlock = (targetDay?.metadata?.blocks || []).find((b: any) => b.id === blockId);
    const isPropagatingHotelField = targetBlock?.type === 'hotel' && ['hotel_id', 'room_category', 'meal_plan'].includes(field);
    const targetDayIds = isPropagatingHotelField ? getConsecutiveSameCityDayIds(days, dayId) : [dayId];

    // 1. Update the localized state immediately
    setDays(prevDays => prevDays.map(day => {
      if (!targetDayIds.includes(day.id)) return day;

      const blocks = (day.metadata?.blocks || []).map((block: any) => {
        if (block.id !== blockId && !(isPropagatingHotelField && block.type === 'hotel')) return block;

        const updatedProps = { ...block.properties, [field]: value };
        return {
          ...block,
          properties: updatedProps
        };
      });

      return {
        ...day,
        metadata: { ...day.metadata, blocks }
      };
    }));

    // 2. Perform background auto-fetching if relevant fields change
    if (!targetBlock) return;

    if (targetBlock.type === 'hotel') {
      const hotelId = field === 'hotel_id' ? value : targetBlock.properties.hotel_id;
      const roomCat = field === 'room_category' ? value : targetBlock.properties.room_category;
      const mealPlan = field === 'meal_plan' ? value : targetBlock.properties.meal_plan;
      const nights = field === 'nights' ? Number(value) : (Number(targetBlock.properties.nights) || 1);
      const rooms = field === 'rooms' ? Number(value) : (Number(targetBlock.properties.rooms) || 1);
      const isManual = field === 'isManual' ? Boolean(value) : Boolean(targetBlock.properties.isManual);

      if (field === 'hotel_id' && value) {
        targetDayIds.forEach(id => fetchRoomsForHotel(id, value));
      }

      const dayCity = targetDay?.accommodation_city || targetDay?.city;
      if (!dayCity) {
        toast({
          title: 'Destination City Missing',
          description: 'Please select a destination city for this day to perform rate calculations.',
          variant: 'destructive'
        });
        return;
      }

      if (hotelId && roomCat && mealPlan && targetDay?.date) {
        if (isManual) {
          // Hydrate from database rates only when switching mode or changing selection
          if (field === 'isManual' || field === 'hotel_id' || field === 'room_category' || field === 'meal_plan') {
            const rateInfo = await calculateHotelRate(hotelId, roomCat, mealPlan, targetDay.date, dayCity);
            if (rateInfo) {
              setDays(prevDays => prevDays.map(day => {
                if (!targetDayIds.includes(day.id)) return day;
                const blocks = (day.metadata?.blocks || []).map((b: any) => {
                  if (b.id !== blockId && !(isPropagatingHotelField && b.type === 'hotel')) return b;
                  const finalRoomCost = rateInfo.room_cost * nights * rooms;
                  const finalGstCost = rateInfo.gst_cost * nights * rooms;
                  const finalTotalCost = rateInfo.total_cost * nights * rooms;
                  return {
                    ...b,
                    cost: finalTotalCost,
                    properties: {
                      ...b.properties,
                      rate_per_night: rateInfo.rate_per_night,
                      room_cost: finalRoomCost,
                      gst_cost: finalGstCost,
                      total_cost: finalTotalCost
                    }
                  };
                });
                return { ...day, metadata: { ...day.metadata, blocks } };
              }));
            }
          }
        } else {
          // Automatic mode: always fetch database contract rates and multiply by nights
          const rateInfo = await calculateHotelRate(hotelId, roomCat, mealPlan, targetDay.date, dayCity);
          if (rateInfo) {
            setDays(prevDays => prevDays.map(day => {
              if (!targetDayIds.includes(day.id)) return day;
              const blocks = (day.metadata?.blocks || []).map((b: any) => {
                if (b.id !== blockId && !(isPropagatingHotelField && b.type === 'hotel')) return b;
                const finalRoomCost = rateInfo.room_cost * nights * rooms;
                const finalGstCost = rateInfo.gst_cost * nights * rooms;
                const finalTotalCost = rateInfo.total_cost * nights * rooms;
                return {
                  ...b,
                  cost: finalTotalCost,
                  properties: {
                    ...b.properties,
                    rate_per_night: rateInfo.rate_per_night,
                    room_cost: finalRoomCost,
                    gst_cost: finalGstCost,
                    total_cost: finalTotalCost
                  }
                };
              });
              return { ...day, metadata: { ...day.metadata, blocks } };
            }));
          }
        }
      }
    } else if (targetBlock.type === 'transfer') {
      const vehicleType = field === 'vehicle_type' ? value : targetBlock.properties.vehicle_type;
      const routeId = field === 'route_id' ? value : targetBlock.properties.route_id;
      const season = field === 'season' ? value : targetBlock.properties.season;
      const isManual = field === 'isManual' ? Boolean(value) : Boolean(targetBlock.properties.isManual);
      const dayCity = targetDay?.accommodation_city || targetDay?.city;
      if (!dayCity) {
        toast({
          title: 'Destination City Missing',
          description: 'Please select a destination city for this day to load transport rates.',
          variant: 'destructive'
        });
        return;
      }

      if (vehicleType && routeId) {
        if (isManual) {
          if (field === 'isManual' || field === 'vehicle_type' || field === 'route_id' || field === 'season') {
            const rateInfo = await calculateCabRate(vehicleType, routeId, season, dayCity);
            if (rateInfo) {
              setDays(prevDays => prevDays.map(day => {
                if (day.id !== dayId) return day;
                const blocks = (day.metadata?.blocks || []).map((b: any) => {
                  if (b.id !== blockId) return b;
                  return {
                    ...b,
                    cost: rateInfo.total_cost,
                    properties: {
                      ...b.properties,
                      cab_rate_id: rateInfo.cab_rate_id,
                      base_cost: rateInfo.base_cost,
                      gst_cost: rateInfo.gst_cost,
                      driver_cost: rateInfo.driver_cost,
                      toll_charges: rateInfo.toll_charges,
                      parking_charges: rateInfo.parking_charges,
                      state_tax: rateInfo.state_tax,
                      permit_charges: rateInfo.permit_charges,
                      total_cost: rateInfo.total_cost,
                      gst_percentage: rateInfo.gst_percentage,
                      gst_included: rateInfo.gst_included
                    }
                  };
                });
                return { ...day, metadata: { ...day.metadata, blocks } };
              }));
            }
          }
        } else {
          // Automatic mode: fetch rates and populate
          const rateInfo = await calculateCabRate(vehicleType, routeId, season, dayCity);
          if (rateInfo) {
            setDays(prevDays => prevDays.map(day => {
              if (day.id !== dayId) return day;
              const blocks = (day.metadata?.blocks || []).map((b: any) => {
                if (b.id !== blockId) return b;
                return {
                  ...b,
                  cost: rateInfo.total_cost,
                  properties: {
                    ...b.properties,
                    cab_rate_id: rateInfo.cab_rate_id,
                    base_cost: rateInfo.base_cost,
                    gst_cost: rateInfo.gst_cost,
                    driver_cost: rateInfo.driver_cost,
                    toll_charges: rateInfo.toll_charges,
                    parking_charges: rateInfo.parking_charges,
                    state_tax: rateInfo.state_tax,
                    permit_charges: rateInfo.permit_charges,
                    total_cost: rateInfo.total_cost,
                    gst_percentage: rateInfo.gst_percentage,
                    gst_included: rateInfo.gst_included
                  }
                };
              });
              return { ...day, metadata: { ...day.metadata, blocks } };
            }));
          }
        }
      }
    } else if (targetBlock.type === 'activity') {
      if (field === 'excursion_id' && value) {
        const selectedExc = excursions.find(e => e.id === value || e.excursion_name === value);
        if (selectedExc) {
          const adultCount = targetBlock.properties.adult_count || itinerary?.adult_count || 2;
          const childCount = targetBlock.properties.child_count || itinerary?.child_count || 0;
          const adultRate = selectedExc.adult_rate || 0;
          const childRate = selectedExc.child_rate || 0;
          const totalCost = (adultCount * adultRate) + (childCount * childRate);

          setDays(prevDays => prevDays.map(day => {
            if (day.id !== dayId) return day;
            const blocks = (day.metadata?.blocks || []).map((b: any) => {
              if (b.id !== blockId) return b;
              return {
                ...b,
                cost: totalCost,
                properties: {
                  ...b.properties,
                  excursion_name: selectedExc.excursion_name,
                  description: selectedExc.description || '',
                  adult_rate: adultRate,
                  child_rate: childRate,
                  total_cost: totalCost
                }
              };
            });
            return { ...day, metadata: { ...day.metadata, blocks } };
          }));
        }
      }
    }
  };

  const handleUpdateBlockFieldManual = (dayId: string, blockId: string, field: string, val: any) => {
    setDays(prevDays => prevDays.map(day => {
      if (day.id !== dayId) return day;

      const blocks = (day.metadata?.blocks || []).map((b: any) => {
        if (b.id !== blockId) return b;

        const updatedProps = { ...b.properties, [field]: val };
        
        // Dynamic sum calculations for manual override
        if (b.type === 'hotel') {
          const base = Number(updatedProps.room_cost) || 0;
          const gst = Number(updatedProps.gst_cost) || 0;
          updatedProps.total_cost = base + gst;
        } else if (b.type === 'transfer') {
          const base = Number(updatedProps.base_cost) || 0;
          const gst = Number(updatedProps.gst_cost) || 0;
          const drv = Number(updatedProps.driver_cost) || 0;
          const toll = Number(updatedProps.toll_charges) || 0;
          const park = Number(updatedProps.parking_charges) || 0;
          const tax = Number(updatedProps.state_tax) || 0;
          const permit = Number(updatedProps.permit_charges) || 0;
          updatedProps.total_cost = base + gst + drv + toll + park + tax + permit;
        } else if (b.type === 'activity') {
          const ac = Number(updatedProps.adult_count) || 2;
          const cc = Number(updatedProps.child_count) || 0;
          const ar = Number(updatedProps.adult_rate) || 0;
          const cr = Number(updatedProps.child_rate) || 0;
          updatedProps.total_cost = (ac * ar) + (cc * cr);
        }

        const totalCost = updatedProps.total_cost || updatedProps.cost || 0;

        return {
          ...b,
          cost: totalCost,
          properties: updatedProps
        };
      });

      return {
        ...day,
        metadata: { ...day.metadata, blocks }
      };
    }));
  };

  const buildItineraryPayload = (overrideDays?: any[]) => {
    const daysList = overrideDays || days;

    // Calculate overall costs
    let totalHotelCost = 0;
    let totalTransportCost = 0;
    let totalExcursionCost = 0;
    let totalFlightCost = 0;

    daysList.forEach(day => {
      const blocks = day.metadata?.blocks || [];
      blocks.forEach((b: any) => {
        const cost = Number(b.cost) || Number(b.properties?.total_cost) || 0;
        if (b.type === 'hotel') totalHotelCost += cost;
        else if (b.type === 'transfer') totalTransportCost += cost;
        else if (b.type === 'activity') totalExcursionCost += cost;
        else if (b.type === 'flight') totalFlightCost += cost;
      });
    });

    const totalCost = totalHotelCost + totalTransportCost + totalExcursionCost + totalFlightCost;
    const finalCost = totalCost * (1 + (markupPercent / 100));

    const mappedDays = daysList.map((day, idx) => {
      const blocks = day.metadata?.blocks || [];
      
      const hotelBlocks = blocks.filter((b: any) => b.type === 'hotel');
      const transBlocks = blocks.filter((b: any) => b.type === 'transfer');
      const excBlocks = blocks.filter((b: any) => b.type === 'activity');

      // 1. Map Hotel items for this day
      const hotels = hotelBlocks.map((hotelBlock: any) => {
        const stay = hotelBlock.properties || {};
        return {
          id: stay.id || null,
          hotel_id: stay.hotel_id,
          hotel_rate_id: stay.hotel_rate_id || null,
          check_in_date: day.date,
          check_out_date: day.date
            ? new Date(new Date(day.date).getTime() + (Number(stay.nights) || 1) * 86400000).toISOString().split('T')[0]
            : null,
          nights: Number(stay.nights) || 1,
          rooms: Number(stay.rooms) || 1,
          total_cost: Number(stay.total_cost) || 0,
          meal_plan: stay.meal_plan || 'CP',
          room_category: stay.room_category || 'Standard',
          room_configuration: stay.room_configuration || { doubleRooms: 1 },
          rate_per_night: Number(stay.rate_per_night) || 0,
          room_cost: Number(stay.room_cost) || 0,
          gst_cost: Number(stay.gst_cost) || 0,
          special_requests: stay.special_requests || null
        };
      }).filter((h: any) => h.hotel_id);

      // 2. Map Transport items for this day
      const transport = transBlocks.map((transBlock: any) => {
        const trans = transBlock.properties || {};
        const selectedRoute = cabRoutes.find(r => r.id === trans.route_id);
        return {
          id: trans.id || null,
          cab_rate_id: trans.cab_rate_id || null,
          pickup_location: trans.pickup_location || trans.route_from || '',
          drop_location: trans.drop_location || trans.route_to || '',
          pickup_time: trans.pickup_time || '09:00:00',
          distance_km: Number(trans.distance_km) || 0,
          total_cost: Number(trans.total_cost) || 0,
          transport_type: trans.rate_type || 'Per Day',
          vehicle_type: trans.vehicle_type,
          route_from: selectedRoute?.source || trans.route_from || '',
          route_to: selectedRoute?.destination || trans.route_to || '',
          pickup_date: day.date,
          rate: Number(trans.base_cost) || 0,
          base_cost: Number(trans.base_cost) || 0,
          gst_cost: Number(trans.gst_cost) || 0,
          driver_cost: Number(trans.driver_cost) || 0,
          toll_charges: Number(trans.toll_charges) || 0,
          parking_charges: Number(trans.parking_charges) || 0,
          state_tax: Number(trans.state_tax) || 0,
          permit_charges: Number(trans.permit_charges) || 0,
          gst_percentage: Number(trans.gst_percentage) || 5,
          gst_included: Boolean(trans.gst_included),
          markup_amount: trans.markup_amount || 0,
          markup_percentage: trans.markup_percentage || 0,
          profit_margin: trans.profit_margin || 0,
          selling_cost: trans.selling_cost || 0,
          supplier_cost: trans.supplier_cost || 0
        };
      }).filter((t: any) => t.vehicle_type);

      // 3. Map Excursion items for this day
      const excursions = excBlocks.map((excBlock: any) => {
        const exc = excBlock.properties || {};
        return {
          id: exc.id || null,
          excursion_id: exc.excursion_id,
          excursion_name: exc.excursion_name || 'Activity',
          excursion_date: day.date,
          excursion_time: excBlock.time || '14:00:00',
          adult_count: Number(exc.adult_count) || 1,
          child_count: Number(exc.child_count) || 0,
          adult_rate: Number(exc.adult_rate) || 0,
          child_rate: Number(exc.child_rate) || 0,
          total_cost: Number(exc.total_cost) || 0
        };
      }).filter((e: any) => e.excursion_id);

      return {
        id: day.id || null,
        day_number: day.day_number || (idx + 1),
        title: day.title || `Day ${idx + 1}`,
        description: day.description || '',
        accommodation_city: day.accommodation_city || null,
        city: day.city || null,
        date: day.date || null,
        meals: day.meals || [],
        metadata: day.metadata || { blocks: [] },
        hotels,
        transport,
        excursions
      };
    });

    return {
      id: itinerary?.id || null,
      lead_id: Number(leadId),
      itinerary_name: itinerary?.itinerary_name || `Itinerary for ${activeLead?.customer_name || 'Guest'}`,
      destinations: itinerary?.destinations || [],
      adult_count: composerAdults,
      child_count: composerChildren,
      infant_count: itinerary?.infant_count || 0,
      total_nights: itinerary?.total_nights || daysList.length,
      travel_start_date: itinerary?.travel_start_date || null,
      travel_end_date: itinerary?.travel_end_date || null,
      hotel_cost: totalHotelCost,
      transport_cost: totalTransportCost,
      excursion_cost: totalExcursionCost + totalFlightCost,
      visa_cost: visaCost,
      markup_percentage: markupPercent,
      final_cost: finalCost,
      cost_per_person: finalCost / (composerAdults + composerChildren || 1),
      notes: itinerary?.notes || '',
      status: itinerary?.status || 'Draft',
      days: mappedDays
    };
  };

  const handleSaveItinerary = async () => {
    setSavingItinerary(true);
    try {
      const payload = buildItineraryPayload();
      const data = await saveItineraryDraft({ payload });
      if (!data.success) throw new Error(data.error || 'Failed to save itinerary');

      setLastSavedDaysStr(JSON.stringify(days));
      toast({
        title: 'Success',
        description: 'Itinerary visual builder synchronized and saved successfully!'
      });
      await syncItineraryStateOnly();
    } catch (err: any) {
      toast({
        title: 'Error Saving Itinerary',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setSavingItinerary(false);
    }
  };

  const handleDuplicateDay = async (dayId: string) => {
    const targetDay = days.find(d => d.id === dayId);
    if (!targetDay) return;

    const newDayNumber = days.length + 1;
    const newDate = new Date(new Date(targetDay.date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Clone metadata blocks with new unique IDs
    const clonedBlocks = (targetDay.metadata?.blocks || []).map((b: any) => ({
      ...b,
      id: b.type + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      properties: { ...b.properties, id: null } // Clear DB IDs for insertion
    }));

    const newDay = {
      id: 'day_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      itinerary_id: itinerary.id,
      day_number: newDayNumber,
      date: newDate,
      city: targetDay.city,
      accommodation_city: targetDay.accommodation_city,
      title: `${targetDay.title} (Copy)`,
      description: targetDay.description,
      metadata: { blocks: clonedBlocks }
    };

    const newDaysList = [...days, newDay];
    setDays(newDaysList);
    if (newDay.accommodation_city) {
      fetchHotelsForCity(newDay.id, newDay.accommodation_city);
    }
    toast({ title: 'Success', description: 'Day duplicated locally!' });
  };

  const handleDeleteDay = async (dayId: string) => {
    if (days.length <= 1) {
      toast({ title: 'Warning', description: 'Itinerary must contain at least 1 day.', variant: 'destructive' });
      return;
    }

    const filteredDays = days.filter(d => d.id !== dayId).map((d, index) => ({
      ...d,
      day_number: index + 1
    }));
    setDays(filteredDays);
    toast({ title: 'Success', description: 'Day removed locally. Click Save & Sync to persist.' });
  };

  // Reorder days up/down
  const handleMoveDay = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= days.length) return;

    const newDays = [...days];
    const temp = newDays[index];
    newDays[index] = newDays[targetIndex];
    newDays[targetIndex] = temp;

    // Recalculate day numbers
    const updatedDays = newDays.map((d, idx) => ({
      ...d,
      day_number: idx + 1
    }));

    setDays(updatedDays);
    toast({ title: 'Reordered', description: 'Day order swapped locally. Click Save & Sync to persist.' });
  };

  // Change Arrival cascading updates
  const handleChangeArrival = async (dayId: string, destination: string) => {
    setDays(prevDays => prevDays.map(day => {
      if (day.id !== dayId) return day;

      // Filter/cascade update blocks
      const blocks = (day.metadata?.blocks || []).map((b: any) => {
        if (b.type === 'hotel') {
          return {
            ...b,
            properties: {
              ...b.properties,
              hotel_id: '',
              hotel_name: `Hotel in ${destination}`,
              room_category: 'Standard',
              meal_plan: 'CP',
              rate_per_night: 0,
              total_cost: 0
            }
          };
        }
        if (b.type === 'transfer') {
          return {
            ...b,
            properties: {
              ...b.properties,
              route_id: '',
              base_cost: 0,
              total_cost: 0
            }
          };
        }
        return b;
      });

      return {
        ...day,
        city: destination,
        accommodation_city: destination,
        title: `Arrival in ${destination}`,
        description: `Arrive at ${destination} and transfer to your hotel.`,
        metadata: { ...day.metadata, blocks }
      };
    }));

    fetchHotelsForCity(dayId, destination);
    toast({ title: 'Arrival Destination Updated', description: `Arrival destination set to ${destination}. Hotlinks and recommendations refreshed.` });
  };

  // Journey Composer Suggestions Engine
  const handleSuggestJourneys = async () => {
    if (!composerDest.trim()) {
      toast({ title: 'Destination required', description: 'Please search and select a destination first.', variant: 'destructive' });
      return;
    }
    setComposerSearching(true);
    setComposerSearchActive(true);
    setJourneyOptions([]);

    try {
      // Simulate network latency under 1 second as per specifications
      await new Promise(resolve => setTimeout(resolve, 600));

      // 1. Search Published Packages
      const packageMatches = suggestedJourneysTemplates.filter(t => 
        t.destination.toLowerCase() === composerDest.toLowerCase() && 
        t.nights === Number(composerNights)
      );

      let options = [...packageMatches];

      // 2. Search alternative circuits if Himachal or Kerala to suggest other combinations (Option 2 & Option 3)
      const matchedRegion = destinationAutocompleteList.find(d => d.city.toLowerCase() === composerDest.toLowerCase());
      if (matchedRegion && matchedRegion.region === 'himachal') {
        const extraOptions = suggestedJourneysTemplates.filter(t => 
          t.destination === 'Shimla' && 
          t.nights === Number(composerNights) &&
          !options.some(o => o.title === t.title)
        );
        options = [...options, ...extraOptions];
      } else if (matchedRegion && matchedRegion.region === 'kerala') {
        const extraOptions = suggestedJourneysTemplates.filter(t => 
          t.destination === 'Munnar' && 
          t.nights === Number(composerNights) &&
          !options.some(o => o.title === t.title)
        );
        options = [...options, ...extraOptions];
      }

      // 3. Fallback AI Generated Journey if no direct packages found, or to supply Option 3
      if (options.length < 3) {
        const totalNts = Number(composerNights);
        
        // Build Dynamic Option based on destination and region circuits
        const circuitList = destinationCircuits[composerDest] || [composerDest];
        
        // Dynamic Option 1: Complete Circuit
        const opt1Title = `${totalNts}N Premium ${composerDest} & Circuit Tour`;
        const opt1Cities = circuitList.slice(0, 3).join(', ');
        const opt1Price = 12000 + (totalNts * 3500) + (composerHotelStars === '5 Star' ? 6000 : composerHotelStars === '4 Star' ? 2500 : 0);
        
        // Generate daily itinerary days dynamically
        const opt1Days = [];
        for (let i = 1; i <= totalNts + 1; i++) {
          const currentCity = circuitList[Math.min(i - 1, circuitList.length - 1)] || composerDest;
          const isFirst = i === 1;
          const isLast = i === totalNts + 1;
          
          let dayTitle = `Day ${i}: Welcome to ${currentCity}`;
          let dayDesc = `Arrive in ${currentCity}, check in to your resort, and enjoy evening walks around local markets.`;
          
          if (isFirst) {
            dayTitle = `Arrival at ${currentCity} Gateway`;
            dayDesc = `Warm greeting and private transfer to your pre-booked ${composerHotelStars} property in ${currentCity}. Check in and relax.`;
          } else if (isLast) {
            dayTitle = `Departure from ${currentCity}`;
            dayDesc = `After a sumptuous breakfast, pack your bags and transfer to the nearest airport/station for departure.`;
          } else {
            dayTitle = `Day ${i}: Explore attractions in ${currentCity}`;
            dayDesc = `Guided full-day excursion covering famous sights, sightseeing landmarks, and authentic culinary highlights.`;
          }
          
          opt1Days.push({
            day_number: i,
            title: dayTitle,
            description: dayDesc,
            city: currentCity,
            type: 'ai_fallback'
          });
        }

        const fallbackAI = {
          destination: composerDest,
          nights: totalNts,
          title: opt1Title,
          cities: opt1Cities,
          stars: composerHotelStars,
          meals: 'MAP (Breakfast & Dinner)',
          transfers: 'Private Sedan intercity + local',
          sightseeings: circuitList.length + 1,
          price: opt1Price,
          popularity: 'AI Generated Journey',
          bookCount: 12,
          theme: 'Curated / Tailored',
          hotelName: `Top-rated ${composerHotelStars} local property`,
          imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop',
          days: opt1Days
        };
        options.push(fallbackAI);

        // Dynamic Option 2: Adventure/Honeymoon Alternate
        if (options.length < 3) {
          const opt2Title = `${totalNts}N Romantic ${composerDest} Escapade`;
          const opt2Days = opt1Days.map(d => ({
            ...d,
            title: d.day_number === 1 ? `Romantic Arrival in ${d.city}` : d.day_number === totalNts + 1 ? `Farewell ${d.city}` : `Couple Sightseeing & Sunset in ${d.city}`,
            description: d.day_number === 1 ? `Luxury transfer, floral welcome, and candlelit dinner.` : d.day_number === totalNts + 1 ? `Leisure breakfast and check-out.` : `Romantic sightseeing, scenic viewpoints, and local boat ride.`
          }));
          options.push({
            ...fallbackAI,
            title: opt2Title,
            popularity: 'Honeymoon Special',
            theme: 'Romantic / Honeymoon',
            price: opt1Price + 4500,
            imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&auto=format&fit=crop',
            days: opt2Days
          });
        }
      }

      setJourneyOptions(options.slice(0, 3));
    } catch (err: any) {
      toast({ title: 'Search Failed', description: err.message, variant: 'destructive' });
    } finally {
      setComposerSearching(false);
    }
  };

  const handleSelectJourney = async (opt: any) => {
    setLoading(true);

    try {
      const totalNts = opt.nights;
      const start_date = activeLead?.trip_start_date || new Date().toISOString().split('T')[0];

      // Fetch master lists
      let allHotelsList: any[] = [];
      let cabVehiclesList: any[] = [];
      let cabRoutesList: any[] = [];
      
      try {
        const bootstrapData = await fetchCachedJson('/php-backend/bootstrap.php');
        if (bootstrapData && bootstrapData.success) {
          if (Array.isArray(bootstrapData.hotels)) allHotelsList = bootstrapData.hotels;
          if (Array.isArray(bootstrapData.vehicles)) cabVehiclesList = bootstrapData.vehicles;
          if (Array.isArray(bootstrapData.routes)) cabRoutesList = bootstrapData.routes;
        }
      } catch (masterErr) {
        console.error("Error loading master items for selection:", masterErr);
      }

      // Construct and insert new days list
      const insertedDaysList = [];
      for (let i = 1; i <= totalNts + 1; i++) {
        const dayDate = new Date(new Date(start_date).getTime() + (i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Map current day properties from template or AI suggested list
        const templateDay = opt.days.find((d: any) => d.day_number === i) || {
          title: `Day ${i}: Explore ${opt.destination}`,
          description: `Enjoy sightseeing excursions in ${opt.destination}.`,
          city: opt.destination
        };

        const currentCity = templateDay.city || opt.destination;
        const dayBlocks: any[] = [];
        
        const isFirst = i === 1;
        const isLast = i === totalNts + 1;

        // 1. HOTEL BLOCK (Except last day)
        if (!isLast) {
          const matchingHotels = allHotelsList.filter((h: any) => 
            h.active_status &&
            h.city?.toLowerCase().includes(currentCity.toLowerCase()) &&
            (h.star_rating?.toString().includes(opt.stars.substring(0, 1)) || 
             h.hotel_categories?.category_name?.toLowerCase().includes(opt.stars.toLowerCase()))
          );

          const selectedHotel = matchingHotels.length > 0 
            ? matchingHotels[0] 
            : allHotelsList.find((h: any) => h.active_status && h.city?.toLowerCase().includes(currentCity.toLowerCase()));
          
          if (selectedHotel) {
            const rate = Number(selectedHotel.selling_cost || selectedHotel.base_cost || 4000);
            dayBlocks.push({
              id: `hotel_composer_${i}_${Math.random().toString(36).substring(2, 7)}`,
              type: 'hotel',
              time: '12:00',
              cost: rate,
              properties: {
                hotel_id: selectedHotel.id,
                hotel_name: selectedHotel.hotel_name,
                room_category: opt.stars === '5 Star' ? 'Suite Room' : 'Standard Room',
                meal_plan: 'CP',
                nights: 1,
                rooms: 1,
                rate_per_night: rate,
                room_cost: rate,
                total_cost: rate,
                chargeable: true
              }
            });
          }
        }

        // 2. TRANSFER BLOCK
        if (isFirst) {
          const matchedRoute = cabRoutesList.find((r: any) => 
            r.destination?.toLowerCase().includes(currentCity.toLowerCase())
          ) || cabRoutesList[0];
          const vehicle = cabVehiclesList[0] || { vehicle_type: 'Sedan' };
          const cabCost = matchedRoute ? Number(matchedRoute.distance_km * 12 + 300) : 1800;
          
          dayBlocks.push({
            id: `trans_composer_${i}_${Math.random().toString(36).substring(2, 7)}`,
            type: 'transfer',
            time: '10:00',
            cost: cabCost,
            properties: {
              vehicle_type: vehicle.vehicle_type,
              route_id: matchedRoute?.id || null,
              route_from: 'Airport / Railway Station',
              route_to: currentCity,
              season: 'Normal Season',
              base_cost: matchedRoute ? Number(matchedRoute.distance_km * 12) : 1500,
              driver_cost: 300,
              total_cost: cabCost,
              chargeable: true
            }
          });
        } else if (isLast) {
          const vehicle = cabVehiclesList[0] || { vehicle_type: 'Sedan' };
          dayBlocks.push({
            id: `trans_composer_${i}_${Math.random().toString(36).substring(2, 7)}`,
            type: 'transfer',
            time: '12:00',
            cost: 1500,
            properties: {
              vehicle_type: vehicle.vehicle_type,
              route_from: currentCity,
              route_to: 'Airport / Railway Station',
              season: 'Normal Season',
              base_cost: 1200,
              driver_cost: 300,
              total_cost: 1500,
              chargeable: true
            }
          });
        } else {
          // Check if city changed from previous day
          const prevDay = opt.days.find((d: any) => d.day_number === i - 1);
          if (prevDay && prevDay.city && prevDay.city !== currentCity) {
            const matchedRoute = cabRoutesList.find((r: any) => 
              r.source?.toLowerCase().includes(prevDay.city.toLowerCase()) &&
              r.destination?.toLowerCase().includes(currentCity.toLowerCase())
            ) || cabRoutesList[0];
            const vehicle = cabVehiclesList[0] || { vehicle_type: 'Sedan' };
            const cabCost = matchedRoute ? Number(matchedRoute.distance_km * 12 + 300) : 2200;

            dayBlocks.push({
              id: `trans_composer_${i}_${Math.random().toString(36).substring(2, 7)}`,
              type: 'transfer',
              time: '09:00',
              cost: cabCost,
              properties: {
                vehicle_type: vehicle.vehicle_type,
                route_id: matchedRoute?.id || null,
                route_from: prevDay.city,
                route_to: currentCity,
                season: 'Normal Season',
                base_cost: matchedRoute ? Number(matchedRoute.distance_km * 12) : 1900,
                driver_cost: 300,
                total_cost: cabCost,
                chargeable: true
              }
            });
          }
        }

        // 3. EXCURSION / ACTIVITY BLOCK (Except last day)
        if (!isLast) {
          const destExcursions = excursions.filter(e => 
            e.city?.toLowerCase().includes(currentCity.toLowerCase()) || 
            currentCity.toLowerCase().includes(e.city?.toLowerCase())
          );
          
          if (destExcursions.length > 0) {
            const excIndex = (i - 1) % destExcursions.length;
            const selectedExc = destExcursions[excIndex];
            const rate = Number(selectedExc.adult_rate || selectedExc.selling_cost || 1200);
            const totalExcCost = rate * composerAdults;
            
            dayBlocks.push({
              id: `act_composer_${i}_${Math.random().toString(36).substring(2, 7)}`,
              type: 'activity',
              time: '14:30',
              cost: totalExcCost,
              properties: {
                excursion_id: selectedExc.id,
                excursion_name: selectedExc.excursion_name,
                city: selectedExc.city,
                category: selectedExc.category || 'Sightseeing',
                adult_count: composerAdults,
                child_count: composerChildren,
                rate_per_person: rate,
                adult_rate: rate,
                child_rate: Number(selectedExc.child_rate || 0),
                total_cost: totalExcCost,
                chargeable: true
              }
            });
          }
        }

        // 4. MEAL BLOCK
        dayBlocks.push({
          id: `meal_composer_${i}_${Math.random().toString(36).substring(2, 7)}`,
          type: 'meal',
          time: '08:00',
          cost: 0,
          properties: {
            meal_type: 'Breakfast',
            description: `Complimentary ${opt.meals.includes('MAP') ? 'MAP (Breakfast + Dinner)' : 'CP (Breakfast)'} buffet at hotel.`,
            chargeable: false
          }
        });

        insertedDaysList.push({
          id: 'day_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          itinerary_id: itinerary.id,
          day_number: i,
          date: dayDate,
          city: currentCity,
          accommodation_city: currentCity,
          title: templateDay.title,
          description: templateDay.description,
          metadata: { blocks: dayBlocks }
        });
      }

      // Instead of database deletion and insertion, we update state and call handleSaveItinerary!
      const uniqueCities = Array.from(new Set(insertedDaysList.map(d => d.city)));
      setDays(insertedDaysList);
      setItinerary(prev => {
        const nextItin = {
          ...prev,
          total_nights: totalNts,
          destinations: uniqueCities,
          adult_count: composerAdults,
          child_count: composerChildren,
          total_guests: composerAdults + composerChildren
        };
        setTimeout(() => {
          handleSaveItinerary();
        }, 100);
        return nextItin;
      });
      await loadData();
      toast({
        title: 'Journey Composed Successfully',
        description: `Successfully loaded "${opt.title}" with complete stays, intercity cabs, sightseeing, and custom meals.`
      });

    } catch (err: any) {
      toast({ title: 'Select Journey Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Pricing calculations
  let sumHotels = 0;
  let sumTransports = 0;
  let sumActivities = 0;
  let sumGst = 0;
  let sumOthers = 0;

  // Supplier totals (what the company pays)
  let supplierSumHotels = 0;
  let supplierSumTransports = 0;
  let supplierSumActivities = 0;
  let supplierSumOthers = 0;

  days.forEach(day => {
    const blocks = day.metadata?.blocks || [];
    blocks.forEach((b: any) => {
      const cost = Number(b.cost) || Number(b.properties?.total_cost) || 0;
      const isChargeable = b.properties?.chargeable !== false;

      if (b.type === 'hotel') {
        supplierSumHotels += cost;
        if (isChargeable) {
          sumHotels += cost;
          sumGst += Number(b.properties?.gst_cost) || 0;
        }
      } else if (b.type === 'transfer') {
        supplierSumTransports += cost;
        if (isChargeable) {
          sumTransports += cost;
          sumGst += Number(b.properties?.gst_cost) || 0;
        }
      } else if (b.type === 'activity') {
        supplierSumActivities += cost;
        if (isChargeable) {
          sumActivities += cost;
        }
      } else {
        supplierSumOthers += cost;
        if (isChargeable) {
          sumOthers += cost;
        }
      }
    });
  });

  const baseCostTotal = sumHotels + sumTransports + sumActivities + sumOthers + visaCost;
  const totalSupplierCost = supplierSumHotels + supplierSumTransports + supplierSumActivities + supplierSumOthers;
  const markupAmtTotal = baseCostTotal * (markupPercent / 100);
  const finalPackagePrice = baseCostTotal + markupAmtTotal;
  const profitMarginTotal = finalPackagePrice - totalSupplierCost;

  // --- 4-Tier Dual-Key Confirmation Lock Computation ---
  const isFinancialConfirmed = (activeLead?.paid_amount || activeLead?.advance_paid || 0) >= (finalPackagePrice * 0.5) || activeLead?.status === 'Booking Confirmed';
  
  const allHotelBlocks: any[] = [];
  const allTransportBlocks: any[] = [];
  days.forEach(day => {
    (day.metadata?.blocks || []).forEach((b: any) => {
      if (b.type === 'hotel') allHotelBlocks.push(b);
      if (b.type === 'transport') allTransportBlocks.push(b);
    });
  });

  const isInventoryConfirmed = (
    allHotelBlocks.length === 0 || allHotelBlocks.every(h => !!h.properties?.hotel_conf_no)
  ) && (
    allTransportBlocks.length === 0 || allTransportBlocks.every(t => !!t.properties?.driver_details || !!t.properties?.vehicle_no)
  );

  const isBookingConfirmed = isFinancialConfirmed && isInventoryConfirmed;

  const currentLifecycleStage = isBookingConfirmed
    ? 'Stage 4: Booking Confirmed (Vouchers Released) 🟢'
    : isFinancialConfirmed
    ? 'Stage 3: Operations Lock (Awaiting Hotel Ref #s) 🔵'
    : 'Stage 2: Advance Invoice Pending (50% Deposit) 🟡';

  // Visual Card Picker Action handlers
  const handleAddExcursionToDay = (item: any) => {
    const adultCount = itinerary?.adult_count || 2;
    const childCount = itinerary?.child_count || 0;
    const itemCost = (item.adult_rate || 0) * adultCount + (item.child_rate || 0) * childCount;
    
    setDays(prevDays => prevDays.map(d => {
      if (d.id !== pickerDayId) return d;
      
      const currentBlocks = d.metadata?.blocks || [];
      const newBlock = {
        id: `exc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'activity',
        time: '14:00',
        cost: itemCost,
        properties: {
          excursion_id: item.id,
          excursion_name: item.excursion_name || item.activity_name || item.sightseeing_name,
          description: item.description || '',
          adult_rate: item.adult_rate || 0,
          child_rate: item.child_rate || 0,
          adult_count: adultCount,
          child_count: childCount,
          total_cost: itemCost,
          photo_url: item.photo_url || item.image_url || '',
          _source: item._source || 'activity',
          chargeable: true
        }
      };
      
      return {
        ...d,
        metadata: {
          blocks: [...currentBlocks, newBlock]
        }
      };
    }));

    toast({
      title: 'Activity Added',
      description: `"${item.excursion_name || item.activity_name || item.sightseeing_name}" added to Day.`
    });
    setPickerOpen(false);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddForm.activity_name) {
      toast({ title: 'Validation Error', description: 'Activity Name is required.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const currentDay = days.find(d => d.id === pickerDayId);
      const currentCity = currentDay?.accommodation_city || activeLead?.destinations?.split(',')[0]?.trim() || 'Singapore';

      const actPayload = {
        id: 'act-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
        activity_code: 'ACT-' + Date.now().toString().slice(-6),
        activity_name: quickAddForm.activity_name,
        activity_category: quickAddForm.activity_category,
        sub_category: quickAddForm.sub_category,
        duration: quickAddForm.duration || '2 Hours',
        adult_cost: Number(quickAddForm.adult_cost) || 0,
        child_cost: Number(quickAddForm.child_cost) || 0,
        description: quickAddForm.description,
        image_url: quickAddForm.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
        destination: currentCity,
        active_status: true,
        selling_cost: Number(quickAddForm.adult_cost) || 0
      };

      const authHeaders = await getAuthHeader();
      const res = await fetch('/php-backend/activities.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(actPayload)
      });
      if (!res.ok) throw new Error('Failed to create quick activity');
      
      const newAct = actPayload;

      // Update local master lists
      setMasterActivities(prev => [...prev, newAct]);
      const mappedNew = {
        id: newAct.id,
        excursion_name: newAct.activity_name,
        city: newAct.destination,
        category: newAct.activity_category,
        duration_hours: null,
        description: newAct.description,
        adult_rate: newAct.adult_cost,
        child_rate: newAct.child_cost,
        photo_url: newAct.image_url,
        _source: 'activity'
      };
      setExcursions(prev => [...prev, mappedNew]);

      // Add to current day
      handleAddExcursionToDay(mappedNew);
      setQuickAddOpen(false);
      
      // Reset form
      setQuickAddForm({
        activity_name: '',
        activity_category: 'Adventure',
        sub_category: 'Adventure Tour',
        duration: '',
        adult_cost: 0,
        child_cost: 0,
        description: '',
        image_url: ''
      });

      toast({ title: 'Success', description: 'Custom activity created and added!' });
    } catch (err: any) {
      toast({ title: 'Failed to create activity', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCab = async (dayId: string, blockId: string, vehicleType: string, routeId: string, season: string) => {
    const day = days.find(d => d.id === dayId);
    const dayCity = day?.accommodation_city || activeLead?.destinations?.split(',')[0]?.trim() || '';
    const rateInfo: any = await calculateCabRate(vehicleType, routeId, season, dayCity);
    
    setDays(prevDays => prevDays.map(d => {
      if (d.id !== dayId) return d;
      const blocks = (d.metadata?.blocks || []).map((b: any) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          cost: rateInfo?.total_cost || 0,
          properties: {
            ...b.properties,
            vehicle_type: vehicleType,
            route_id: routeId,
            season: season,
            route_name: rateInfo?.route_name || '',
            contract_rate: rateInfo?.contract_rate || 0,
            selling_rate: rateInfo?.selling_rate || 0,
            usage_type: rateInfo?.usage_type || 'Transfer',
            total_cost: rateInfo?.total_cost || 0
          }
        };
      });
      return { ...d, metadata: { blocks } };
    }));
    setCabPickerOpen(false);
    toast({
      title: 'Transport Configured',
      description: `Vehicle: ${vehicleType} for Route successfully added.`
    });
  };

  const getDayCost = (day: any) => {
    const blocks = day.metadata?.blocks || [];
    return blocks.reduce((acc: number, b: any) => {
      const cost = Number(b.cost) || Number(b.properties?.total_cost) || 0;
      const isChargeable = b.properties?.chargeable !== false;
      return isChargeable ? acc + cost : acc;
    }, 0);
  };

  const handleAddNextDay = () => {
    const newNo = days.length + 1;
    const lastDay = days[days.length - 1];
    const newDate = lastDay 
      ? new Date(new Date(lastDay.date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : (itinerary?.travel_start_date || new Date().toISOString().split('T')[0]);
    
    const cities = getLeadCityNames();
    const dayIndex = days.length;
    const autoCity = cities.length > 0 
      ? cities[dayIndex % cities.length] 
      : '';
    
    const newDayId = 'day_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newDay = {
      id: newDayId,
      itinerary_id: itinerary?.id,
      day_number: newNo,
      date: newDate,
      city: autoCity,
      accommodation_city: autoCity,
      title: `Day ${newNo}: New Tour Stage`,
      description: 'Configure details for this tour timeline.',
      metadata: { blocks: [] }
    };
    setDays([...days, newDay]);
    if (autoCity) {
      fetchHotelsForCity(newDayId, autoCity);
    }
  };

  return (
    <div className="flex flex-row w-full h-full overflow-hidden bg-[#0B1026] text-white select-none relative">
      {/* LEFT PANEL — Day Navigator */}
      <div className="w-[220px] flex flex-col shrink-0 bg-[#060D1F] border-r border-[#C9A25A]/15 h-full overflow-hidden text-left">
        {/* Header */}
        <div className="h-14 px-3 flex flex-col justify-center border-b border-[#C9A25A]/15 shrink-0 bg-[#060D1F]">
          <div className="text-[13px] font-bold text-white truncate" title={itinerary?.itinerary_name || activeLead?.lead_title || activeLead?.customer_name || 'Trip'}>
            {itinerary?.itinerary_name || activeLead?.lead_title || activeLead?.customer_name || 'Trip'}
          </div>
          <div className="text-[11px] text-[#C9A25A]/70 font-semibold truncate mt-0.5">
            {stayStops.reduce((sum, s) => sum + s.nights, 0)}N · {(itinerary?.adult_count || activeLead?.adult_count || 2) + (itinerary?.child_count || activeLead?.child_count || 0)} Pax · {itinerary?.status || activeLead?.status || 'Draft'}
          </div>
        </div>

        {/* Day list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {days.map((day) => {
            const isActive = day.id === activeDayId;
            const blocks = day.metadata?.blocks || [];
            const hasStay = blocks.some((b: any) => b.type === 'hotel');
            const hasTransfer = blocks.some((b: any) => b.type === 'transfer');
            const hasActivity = blocks.some((b: any) => b.type === 'activity');
            const hasFlight = blocks.some((b: any) => b.type === 'flight');
            const hasMeal = blocks.some((b: any) => b.type === 'meal');

            return (
              <div
                key={day.id}
                onClick={() => setActiveDayId(day.id)}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#C9A25A]/15 border border-[#C9A25A]/30'
                    : 'hover:bg-[#C9A25A]/08 border border-transparent'
                }`}
              >
                {/* Day pill */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#C9A25A] text-[#0B1026]'
                      : 'bg-[#C9A25A]/15 text-[#C9A25A]'
                  }`}
                >
                  D{day.day_number}
                </div>

                {/* Day info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[11px] font-semibold text-[#e0e0e0] truncate">
                    {day.title || 'Untitled Stage'}
                  </div>
                  <div className="text-[10px] text-[#C9A25A]/60 truncate mt-0.5">
                    {day.accommodation_city || 'No Destination'}
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {hasStay && <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]/70" title="Stay" />}
                    {hasTransfer && <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]/70" title="Transfer" />}
                    {hasActivity && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A25A]/70" title="Activity" />}
                    {hasFlight && <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]/70" title="Flight" />}
                    {hasMeal && <span className="w-1.5 h-1.5 rounded-full bg-[#fb923c]/70" title="Meal" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer (left panel bottom): "Add day" button */}
        <div className="p-2 border-t border-[#C9A25A]/15 bg-[#060D1F] shrink-0">
          <button
            type="button"
            onClick={handleAddNextDay}
            className="w-full py-2 rounded-lg border border-dashed border-[#C9A25A]/30 text-[#C9A25A] hover:bg-[#C9A25A]/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-transparent cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Day
          </button>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="flex-grow flex flex-col h-full overflow-hidden bg-[#0B1026] relative">
        {/* Top bar */}
        <div className="h-11 bg-[#060D1F] border-b border-[#C9A25A]/15 px-4 flex items-center justify-between shrink-0">
          {/* Left section: Back + breadcrumbs */}
          <div className="flex items-center gap-3 text-left">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white text-xs font-bold bg-transparent border-0 flex items-center gap-1 p-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="h-6 w-[0.5px] bg-[#C9A25A]/15" />
            <div className="flex items-center gap-1.5 text-[11px] font-medium font-display">
              <span className="text-gray-400/40">Leads</span>
              <span className="text-gray-400/40">&gt;</span>
              <span className="text-gray-400/40 truncate max-w-[120px]">
                {itinerary?.customer_name || activeLead?.customer_name || 'Guest'}
              </span>
              <span className="text-gray-400/40">&gt;</span>
              <span className="text-[#C9A25A] font-bold">Itinerary</span>
            </div>

            {/* Dual-Key Confirmation Lock Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 border-l border-[#C9A25A]/15 pl-3 text-left">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                isFinancialConfirmed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`} title="Key 1: Financial Lock (50% Advance Payment Verified)">
                💳 Deposit: {isFinancialConfirmed ? 'Paid (50%)' : 'Pending'}
              </span>

              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                isInventoryConfirmed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              }`} title="Key 2: Inventory Lock (Manual Hotel Confirmation Ref # & Driver Details)">
                🛌 Supplier Lock: {isInventoryConfirmed ? 'Confirmed' : 'Ref # Needed'}
              </span>
            </div>
          </div>

          {/* Right section: 3-Stage Workflow + More + Save & Sync */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Stage 1: Proposal Quote */}
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(`/crm/leads/${leadId || activeLead?.id}/brochure`, '_blank')}
              className="h-7 text-[10px] font-black uppercase tracking-wider bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded-lg px-2.5 hidden xl:flex items-center gap-1 cursor-pointer shrink-0"
              title="Stage 1: Share Itinerary Proposal Brochure to finalize quote with client"
            >
              <FileText className="w-3.5 h-3.5" /> 1. Proposal
            </Button>

            {/* Stage 2: Proforma Invoice */}
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenInvoice}
              disabled={isDirty}
              className="h-7 text-[10px] font-black uppercase tracking-wider bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg px-2.5 hidden xl:flex items-center gap-1 cursor-pointer disabled:opacity-40 shrink-0"
              title="Stage 2: Generate & Share GST Proforma Invoice to collect advance deposit"
            >
              <IndianRupee className="w-3.5 h-3.5" /> 2. Invoice
            </Button>

            {/* Stage 3: Service Voucher */}
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenVoucher}
              disabled={isDirty}
              className="h-7 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-lg px-2.5 hidden xl:flex items-center gap-1 cursor-pointer disabled:opacity-40 shrink-0"
              title="Stage 3: Issue Final Operational Service Voucher after manual hotel/cab confirmation"
            >
              <Car className="w-3.5 h-3.5" /> 3. Voucher
            </Button>

            {/* Collapsible/Dropdown More Button */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="bg-[#C9A25A]/10 border border-[#C9A25A]/30 text-[#C9A25A] hover:bg-[#C9A25A]/20 font-bold text-[11px] h-7 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <MoreVertical className="w-3.5 h-3.5" /> More
              </button>
              {moreMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-left space-y-1 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-1 text-[9px] font-black uppercase text-amber-400 tracking-wider">
                    Travel Booking Lifecycle Steps
                  </div>
                  <button
                    onClick={() => { window.open(`/crm/leads/${leadId || activeLead?.id}/brochure`, '_blank'); setMoreMenuOpen(false); }}
                    className="w-full text-left text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-800 text-amber-300 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-amber-400" /> 1. Share Proposal Brochure
                  </button>
                  <button
                    onClick={() => { handleOpenInvoice(); setMoreMenuOpen(false); }}
                    disabled={isDirty}
                    className="w-full text-left text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-800 text-blue-300 flex items-center gap-2 disabled:opacity-40"
                  >
                    <IndianRupee className="w-4 h-4 text-blue-400" /> 2. Share Proforma Invoice
                  </button>
                  <button
                    onClick={() => { handleOpenVoucher(); setMoreMenuOpen(false); }}
                    disabled={isDirty}
                    className="w-full text-left text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-800 text-emerald-300 flex items-center gap-2 disabled:opacity-40"
                  >
                    <Car className="w-4 h-4 text-emerald-400" /> 3. Issue Service Voucher
                  </button>
                  <button
                    onClick={() => { window.open(`/crm/leads/${leadId || activeLead?.id}/proposals`, '_blank'); setMoreMenuOpen(false); }}
                    className="w-full text-left text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-800 text-amber-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#C9A25A]" /> View Multi-Option Proposals Grid
                  </button>
                  <div className="h-px bg-slate-800 my-1" />
                  
                  {/* Admin Global Actions */}
                  {onOpenCsvImport && (
                    <button
                      onClick={() => { onOpenCsvImport(); setMoreMenuOpen(false); }}
                      className="w-full text-left text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-emerald-400" /> Import CSV Leads / Packages
                    </button>
                  )}
                  {onOpenUserManagement && (
                    <button
                      onClick={() => { onOpenUserManagement(); setMoreMenuOpen(false); }}
                      className="w-full text-left text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4 text-blue-400" /> Manage Team Users
                    </button>
                  )}

                  <button
                    onClick={() => { setAiGenOpen(true); setMoreMenuOpen(false); }}
                    className="w-full text-left text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-800 text-white flex items-center gap-2"
                  >
                    <Sparkle className="w-4 h-4 text-violet-400" /> AI Generate Itinerary
                  </button>
                  <div className="h-px bg-slate-800 my-1" />
                  <div className="px-3 py-1 text-[9px] font-black uppercase text-slate-500">
                    Switch Workspace View
                  </div>
                  <button
                    onClick={() => { setViewMode('sales'); setMoreMenuOpen(false); }}
                    className={`w-full text-left text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-2 ${viewMode === 'sales' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-800 text-white'}`}
                  >
                    <Eye className="w-4 h-4" /> Sales View Mode
                  </button>
                  {(userProfile?.role === 'admin' || userProfile?.role === 'operations' || userProfile?.role === 'Agent') && (
                    <button
                      onClick={() => { setViewMode('operations'); setMoreMenuOpen(false); }}
                      className={`w-full text-left text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-2 ${viewMode === 'operations' ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-slate-800 text-white'}`}
                    >
                      <Settings className="w-4 h-4" /> Operations View Mode
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={loadData}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs h-7 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-md shrink-0 whitespace-nowrap border border-amber-400"
              title="Refresh itinerary data and master inventories"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-950 font-bold ${loading ? 'animate-spin' : ''}`} />
              <span className="text-slate-950 font-black">Refresh</span>
            </button>

            {/* Primary Save & Sync Button - Never Cut Off */}
            <button
              onClick={handleSaveItinerary}
              className="bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] hover:opacity-95 text-[#0B1026] font-black text-xs h-7 px-3.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-md shrink-0 whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Save & Sync
            </button>
          </div>
        </div>

        {/* Context strip */}
        <div className="h-10 bg-white/[0.03] border-b border-[#C9A25A]/10 px-4 flex items-center gap-4 text-xs shrink-0 select-text text-left">
          {/* Client Name */}
          <div className="flex flex-col justify-center">
            <span className="text-[9px] text-white/40 uppercase tracking-wider">Client</span>
            <span className="font-semibold text-white text-[12px] truncate max-w-[150px]">
              {itinerary?.customer_name || activeLead?.customer_name || 'Guest'}
            </span>
          </div>

          <div className="h-6 w-[0.5px] bg-white/10 shrink-0" />

          {/* Destination badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-grow">
            {getLeadCityNames().map((city, idx) => (
              <span
                key={`${city}-${idx}`}
                className="bg-[#C9A25A]/15 text-[#C9A25A] border border-[#C9A25A]/30 text-[10px] font-bold px-2 py-0.5 rounded-[5px] shrink-0"
              >
                {city}
              </span>
            ))}
          </div>

          <div className="h-6 w-[0.5px] bg-white/10 shrink-0" />

          {/* Guests */}
          <div className="text-gray-400 font-medium shrink-0 flex flex-col justify-center">
            <span className="text-[9px] text-white/40 uppercase tracking-wider">Guests</span>
            <span className="text-white text-[12px] font-semibold">
              {getLeadGuestCounts(activeLead, itinerary).adults} Adults, {getLeadGuestCounts(activeLead, itinerary).children} Children
            </span>
          </div>

          <div className="h-6 w-[0.5px] bg-white/10 shrink-0" />

          {/* Duration */}
          <div className="text-gray-400 font-medium shrink-0 flex flex-col justify-center">
            <span className="text-[9px] text-white/40 uppercase tracking-wider">Duration</span>
            <span className="text-white text-[12px] font-semibold">
              {stayStops.reduce((sum, s) => sum + s.nights, 0)}N
              {(itinerary?.travel_start_date || getLeadStartDate(activeLead, itinerary)) ? ` · ${new Date(itinerary?.travel_start_date || getLeadStartDate(activeLead, itinerary)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
            </span>
          </div>
        </div>

      {/* WORKSPACE AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 select-text text-left scrollbar-thin">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          {/* Top row controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#1A2342]/70 border border-[#C9A25A]/25 backdrop-blur-md rounded-2xl p-4 text-left">
          {/* Start Date */}
          <div className="space-y-1">
            <label htmlFor="trip-start-date-input" className="text-[10px] uppercase font-display font-extrabold text-[#C9A25A] tracking-wider block">
              Trip Start Date
            </label>
            <Input
              id="trip-start-date-input"
              name="tripStartDate"
              type="date"
              value={itinerary?.travel_start_date || ''}
              onChange={(e) => {
                const date = e.target.value;
                if (date) {
                  updateStayPlan(stayStops, date);
                }
              }}
              className="bg-[#0B1026]/80 border-[#C9A25A]/20 focus-visible:ring-0 focus:border-[#C9A25A] text-white rounded-xl font-mono text-sm h-10"
            />
          </div>

          {/* Total Nights */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-display font-extrabold text-[#C9A25A] tracking-wider block">
              Total Nights
            </label>
            <div className="flex items-center bg-[#0B1026]/40 border border-[#C9A25A]/10 rounded-xl px-3 h-10 text-white font-mono text-sm font-bold">
              {stayStops.reduce((sum, s) => sum + s.nights, 0)} Nights
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-display font-extrabold text-[#C9A25A] tracking-wider block">
              Auto-Calculated End Date
            </label>
            <div className="flex items-center bg-[#0B1026]/40 border border-[#C9A25A]/10 rounded-xl px-3 h-10 text-white/70 font-mono text-sm font-semibold select-all">
              {itinerary?.travel_end_date ? new Date(itinerary.travel_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '---'}
            </div>
          </div>
        </div>

        {/* Destination & Stay Plan Section */}
        <Card className="bg-[#1A2342] border border-[#C9A25A]/30 shadow-xl rounded-2xl overflow-hidden text-left">
          <CardHeader className="bg-[#0B1026]/50 border-b border-[#C9A25A]/20 px-6 py-4 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-display font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C9A25A]" /> Destination & Stay Plan
              </CardTitle>
              <p className="text-[10px] text-gray-400">Define the sequential stays and night distribution for this journey.</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {stayStops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border border-dashed border-[#C9A25A]/20 rounded-xl bg-[#0B1026]/30">
                <MapPin className="w-10 h-10 text-[#C9A25A]/30 mb-3 animate-bounce" />
                <h4 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">No Destination Stays Added</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs text-center">Add a stay stop using the cascading selector to populate the day-by-day timeline builder.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  let currentCheckIn = new Date(itinerary?.travel_start_date || new Date());
                  return stayStops.map((stop, idx) => {
                    const checkIn = new Date(currentCheckIn);
                    const checkOut = new Date(currentCheckIn);
                    checkOut.setDate(checkOut.getDate() + stop.nights);
                    currentCheckIn = new Date(checkOut);

                    const checkInStr = checkIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    const checkOutStr = checkOut.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                    return (
                      <div 
                        key={`${stop.city}-${idx}`}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#0B1026]/40 border border-[#C9A25A]/15 hover:border-[#C9A25A]/40 rounded-xl gap-4 transition-all duration-300 shadow-inner"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#C9A25A]/10 border border-[#C9A25A]/35 text-[#C9A25A] flex items-center justify-center font-display font-black text-xs">
                            {idx + 1}
                          </span>
                          <div className="text-left space-y-0.5">
                            <h4 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                              {stop.city} 
                              <span className="text-[10px] text-gray-400 font-sans font-normal">({stop.state}, {stop.country})</span>
                            </h4>
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">
                              📅 Check-in: <span className="text-white font-bold">{checkInStr}</span> &rarr; Check-out: <span className="text-white font-bold">{checkOutStr}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end">
                          {/* Nights Edit Count Input */}
                          <div className="flex items-center gap-1.5 bg-[#0B1026]/80 border border-[#C9A25A]/20 px-2 py-1 rounded-lg">
                            <span className="text-[9px] uppercase font-bold text-[#C9A25A] tracking-wider">Nights:</span>
                            <input
                              type="number"
                              min="1"
                              value={stop.nights}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                const updated = [...stayStops];
                                updated[idx] = { ...updated[idx], nights: val };
                                updateStayPlan(updated);
                              }}
                              className="w-10 bg-transparent text-white font-mono font-bold text-xs focus:outline-none border-b border-dashed border-[#C9A25A]/30 text-center"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 text-gray-400 hover:text-white" 
                              disabled={idx === 0} 
                              onClick={() => handleMoveStop(idx, 'up')}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 text-gray-400 hover:text-white" 
                              disabled={idx === stayStops.length - 1} 
                              onClick={() => handleMoveStop(idx, 'down')}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 text-gray-400 hover:text-[#C9A25A]" 
                              onClick={() => handleEditStop(idx)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 text-gray-400 hover:text-purple-400" 
                              onClick={() => handleDuplicateStop(idx)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </CardContent>
        </Card>

      {/* DAY WORKSPACE CONTAINER */}
      {stayStops.length > 0 && (
        <div className="w-full space-y-6 text-left max-w-5xl mx-auto pt-2">
        {loadingItinerary ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="bg-[#1A2342]/50 border border-[#C9A25A]/10 shadow-lg overflow-hidden rounded-2xl p-6 space-y-4 animate-pulse text-left">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 bg-[#C9A25A]/10 rounded-xl" />
                  <div className="h-6 w-48 bg-slate-800 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-slate-800 rounded" />
                  <div className="h-4 w-1/2 bg-slate-800 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day, idx) => (
              <DayCard
                key={day.id}
                day={day}
                idx={idx}
                daysCount={days.length}
                activeDayId={activeDayId}
                setActiveDayId={setActiveDayId}
                viewMode={viewMode}
                sortedCities={sortedCities}
                handleChangeArrival={handleChangeArrival}
                getDayCost={getDayCost}
                setDays={setDays}
                handleMoveDay={handleMoveDay}
                handleDuplicateDay={handleDuplicateDay}
                handleDeleteDay={handleDeleteDay}
                handleAddBlock={handleAddBlock}
                itinerary={itinerary}
                handleUpdateBlockField={handleUpdateBlockField}
                handleUpdateBlockFieldManual={handleUpdateBlockFieldManual}
                handleDeleteBlock={handleDeleteBlock}
                setHotelPickerDayId={setHotelPickerDayId}
                setHotelPickerBlockId={setHotelPickerBlockId}
                setHotelPickerOpen={setHotelPickerOpen}
                setCabPickerDayId={setCabPickerDayId}
                setCabPickerBlockId={setCabPickerBlockId}
                setCabPickerOpen={setCabPickerOpen}
                setPickerDayId={setPickerDayId}
                setPickerOpen={setPickerOpen}
                loadingInventory={loadingInventory}
                expandedBlocks={expandedBlocks}
                setExpandedBlocks={setExpandedBlocks}
                activeLead={activeLead}
              />
            ))}
          </div>
        )}

        {/* Add Next Day Button */}
        <div className="pt-2">
          <Button 
            onClick={() => {
              const newNo = days.length + 1;
              const lastDay = days[days.length - 1];
              const newDate = lastDay 
                ? new Date(new Date(lastDay.date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                : (itinerary?.travel_start_date || new Date().toISOString().split('T')[0]);
              
              const cities = getLeadCityNames();
              const dayIndex = days.length;
              const autoCity = cities.length > 0 
                ? cities[dayIndex % cities.length] 
                : '';
              
              const newDayId = 'day_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
              const newDay = {
                id: newDayId,
                itinerary_id: itinerary.id,
                day_number: newNo,
                date: newDate,
                city: autoCity,
                accommodation_city: autoCity,
                title: `Day ${newNo}: New Tour Stage`,
                description: 'Configure details for this tour timeline.',
                metadata: { blocks: [] }
              };
              setDays([...days, newDay]);
              if (autoCity) {
                fetchHotelsForCity(newDayId, autoCity);
              }
            }}
            className="w-full text-xs font-bold h-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-955 hover:scale-[1.01] hover:shadow-md transition-all border-none rounded-xl cursor-pointer shadow"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Next Day
          </Button>
        </div>
      </div>
      )}
      </div>
      </div>

      {/* COSTING DRAWER */}
      <CostingDrawer
        isOpen={costingDrawerOpen}
        setIsOpen={setCostingDrawerOpen}
        finalPackagePrice={finalPackagePrice}
        itinerary={itinerary}
        markupPercent={markupPercent}
        setMarkupPercent={setMarkupPercent}
        profitMarginTotal={profitMarginTotal}
        baseCostTotal={baseCostTotal}
        markupAmtTotal={markupAmtTotal}
        sumHotels={sumHotels}
        sumTransports={sumTransports}
        sumActivities={sumActivities}
        sumOthers={sumOthers}
        visaCost={visaCost}
        setVisaCost={setVisaCost}
        isDirty={isDirty}
        handleSaveItinerary={handleSaveItinerary}
        setProposalOpen={setProposalOpen}
        handleOpenVoucher={handleOpenVoucher}
        handleOpenInvoice={handleOpenInvoice}
        toast={toast}
        leadId={leadId}
        activeLead={activeLead}
      />

      {/* DESTINATION STAY PICKER DIALOG */}
      <Dialog open={isStayModalOpen} onOpenChange={setIsStayModalOpen}>
        <DialogContent className="bg-[#1A2342] border border-[#C9A25A]/30 text-white max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-display font-extrabold uppercase text-[#C9A25A]">
              {editingStopIndex !== null ? 'Modify Destination Stay' : 'Add Destination Stay'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 text-left">
            {/* Country Select */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Country *</label>
              <Select 
                value={stayForm.country} 
                onValueChange={(val) => {
                  setStayForm(prev => ({ ...prev, country: val, state: '', city: '' }));
                }}
              >
                <SelectTrigger className="bg-[#0B1026] border-[#C9A25A]/20 focus:border-[#C9A25A] text-white rounded-xl">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A2342] text-white border-[#C9A25A]/30">
                  {countriesList.map((c, cIdx) => (
                    <SelectItem key={c.id || `country-${c.country_name}-${cIdx}`} value={c.country_name}>{c.country_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* State Select */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">State / Region *</label>
              <Select 
                value={stayForm.state} 
                disabled={!stayForm.country}
                onValueChange={(val) => {
                  setStayForm(prev => ({ ...prev, state: val, city: '' }));
                }}
              >
                <SelectTrigger className="bg-[#0B1026] border-[#C9A25A]/20 focus:border-[#C9A25A] text-white rounded-xl">
                  <SelectValue placeholder="Select State / Region" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A2342] text-white border-[#C9A25A]/30">
                  {statesList
                    .filter(s => {
                      const countryObj = countriesList.find(c => c.country_name === stayForm.country);
                      return countryObj && String(s.country_id) === String(countryObj.id);
                    })
                    .map((s) => (
                      <SelectItem key={s.id} value={s.state_name}>{s.state_name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Destination/City Select */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">City / Destination *</label>
              <Select 
                value={stayForm.city} 
                disabled={!stayForm.state}
                onValueChange={(val) => {
                  setStayForm(prev => ({ ...prev, city: val }));
                }}
              >
                <SelectTrigger className="bg-[#0B1026] border-[#C9A25A]/20 focus:border-[#C9A25A] text-white rounded-xl">
                  <SelectValue placeholder="Select City / Destination" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A2342] text-white border-[#C9A25A]/30">
                  {citiesList
                    .filter(c => {
                      return c.state?.toLowerCase() === stayForm.state?.toLowerCase() &&
                             c.country?.toLowerCase() === stayForm.country?.toLowerCase();
                    })
                    .map((c, idx) => {
                      const name = c.name || c.city_name;
                      return (
                        <SelectItem key={`${name}-${idx}`} value={name}>{name}</SelectItem>
                      );
                    })
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Nights Input */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Nights *</label>
              <Input 
                type="number" 
                min="1" 
                value={stayForm.nights} 
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setStayForm(prev => ({ ...prev, nights: val }));
                }} 
                className="bg-[#0B1026]/80 border-[#C9A25A]/20 focus-visible:ring-0 focus:border-[#C9A25A] text-white rounded-xl font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsStayModalOpen(false)}
              className="border-[#C9A25A]/30 text-white hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!stayForm.country || !stayForm.state || !stayForm.city) {
                  toast({ title: 'Validation Error', description: 'All fields are required.', variant: 'destructive' });
                  return;
                }
                
                // Check for duplicate city (unless editing the same stop)
                const duplicateIndex = stayStops.findIndex(s => s.city.toLowerCase() === stayForm.city.toLowerCase());
                if (duplicateIndex !== -1 && duplicateIndex !== editingStopIndex) {
                  toast({ 
                    title: 'Duplicate Destination', 
                    description: `"${stayForm.city}" is already added. If you want to add it as a separate stop, you can proceed, but please verify.`, 
                  });
                }

                const updatedStops = [...stayStops];
                if (editingStopIndex !== null) {
                  updatedStops[editingStopIndex] = stayForm;
                } else {
                  updatedStops.push(stayForm);
                }
                updateStayPlan(updatedStops);
                setIsStayModalOpen(false);
              }}
              className="bg-[#C9A25A] text-[#0B1026] hover:bg-[#D8B97A] font-extrabold rounded-xl border-0"
            >
              {editingStopIndex !== null ? 'Update Stay' : 'Add Stay'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VISUAL ACTIVITY & SIGHTSEEING PICKER DIALOG */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-card text-card-foreground rounded-2xl shadow-2xl border border-border/80 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              📍 Activities & Sightseeings for:{' '}
              <span className="text-amber-500">
                {(() => {
                  const currentDay = days.find(d => d.id === pickerDayId);
                  return currentDay?.accommodation_city || activeLead?.destinations?.split(',')[0]?.trim() || '';
                })()}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select activities or sightseeing excursions to add to Day {days.find(d => d.id === pickerDayId)?.day_number || ''}. Already added items are greyed out.
            </DialogDescription>
          </DialogHeader>

          {/* Search & Tabs Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center my-4 w-full">
            {/* Tabs */}
            <div className="flex bg-muted p-1 rounded-xl border border-border/80 text-[11px] font-bold shadow-sm">
              {[
                { id: 'recommended', label: 'Top Recommended' },
                { id: 'activity', label: 'Activities' },
                { id: 'sightseeing', label: 'Sightseeing' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setPickerTab(t.id as any)}
                  className={`py-1.5 px-4 rounded-lg transition-all ${
                    pickerTab === t.id
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="activity-search-input"
                name="pickerSearch"
                aria-label="Search activities"
                placeholder="Search by name or category..."
                value={pickerSearch}
                onChange={e => setPickerSearch(e.target.value)}
                className="pl-9 h-9 rounded-xl text-xs border-border/85 focus-visible:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Grid Layout Cards */}
          {(() => {
            const currentDay = days.find(d => d.id === pickerDayId);
            const currentCity = currentDay?.accommodation_city || activeLead?.destinations?.split(',')[0]?.trim() || '';
            
            // Filter by city (checking city_id, exact match, or substring match)
            let items = excursions.filter(e => {
              if (!currentCity) return true;
              const eCity = (e.city || '').toLowerCase().trim();
              const cCity = currentCity.toLowerCase().trim();
              if (e.city_id && currentDay?.city_id && String(e.city_id) === String(currentDay.city_id)) return true;
              return eCity.includes(cCity) || cCity.includes(eCity);
            });
            
            // If no match by city, fallback to show all excursions
            if (items.length === 0) {
              items = excursions;
            }

            // Filter by tab
            if (pickerTab === 'activity') {
              items = items.filter(e => e._source === 'activity' || (e.category && e.category.toLowerCase() !== 'sightseeing'));
            } else if (pickerTab === 'sightseeing') {
              items = items.filter(e => e._source === 'sightseeing' || (e.category && e.category.toLowerCase() === 'sightseeing'));
            }

            // Filter by search query
            if (pickerSearch.trim()) {
              const q = pickerSearch.toLowerCase();
              items = items.filter(e => 
                (e.excursion_name && e.excursion_name.toLowerCase().includes(q)) ||
                (e.description && e.description.toLowerCase().includes(q)) ||
                (e.category && e.category.toLowerCase().includes(q))
              );
            }

            if (items.length === 0) {
              return (
                <div className="text-center py-12 border-2 border-dashed border-border/60 rounded-xl space-y-4 w-full">
                  <p className="text-muted-foreground text-sm italic font-medium">No items found matching your filters.</p>
                  <Button 
                    size="sm" 
                    onClick={() => setQuickAddOpen(true)}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold hover:opacity-90 text-xs rounded-xl"
                  >
                    Create Custom Activity
                  </Button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.filter(item => !(item.id && usedExcursionIds.has(item.id))).map(item => {
                  const isUsed = false; // Filtered out, so always false here
                  const isSigh = item._source === 'sightseeing';
                  
                  return (
                    <Card 
                      key={item.id || item.excursion_name} 
                      className={`overflow-hidden border border-border/70 hover:border-amber-550/30 rounded-2xl shadow-sm transition-all duration-200 flex flex-col justify-between ${
                        isUsed ? 'opacity-50 bg-muted/40' : 'hover:shadow-md hover:border-amber-500/40'
                      }`}
                    >
                      <div>
                        {/* Hero Image */}
                        <div className="h-32 w-full relative overflow-hidden bg-muted">
                          <img 
                            src={item.photo_url || item.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop'} 
                            alt={item.excursion_name} 
                            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                          />
                          <Badge className={`absolute top-2 right-2 border-none font-bold uppercase tracking-wider text-[8px] ${
                            isSigh ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-slate-950'
                          }`}>
                            {isSigh ? 'Sightseeing' : 'Activity'}
                          </Badge>
                          
                          {item.category && (
                            <Badge variant="outline" className="absolute bottom-2 left-2 bg-slate-950/60 text-white border-none font-bold text-[8px]">
                              {item.category}
                            </Badge>
                          )}
                        </div>

                        <div className="p-4 space-y-2 text-left">
                          <h4 className="font-extrabold text-sm text-foreground line-clamp-1">{item.excursion_name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description || 'No description provided.'}</p>
                          
                          <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground font-bold uppercase pt-1">
                            {item.duration_hours && (
                              <span>Duration: <strong className="text-foreground">{item.duration_hours} Hrs</strong></span>
                            )}
                            {item.city && (
                              <span>Location: <strong className="text-foreground">{item.city}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t border-border/40 bg-muted/10 flex justify-between items-center">
                        <div className="text-left">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold">Standard Rates</span>
                          <p className="text-xs font-black text-foreground">
                            Adult: ₹{Number(item.adult_rate || 0).toLocaleString('en-IN')}{' '}
                            {item.child_rate > 0 && <span className="text-[10px] font-normal text-muted-foreground">| Child: ₹{Number(item.child_rate).toLocaleString('en-IN')}</span>}
                          </p>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          disabled={isUsed}
                          onClick={() => handleAddExcursionToDay(item)}
                          className={`font-bold text-xs rounded-xl ${
                            isUsed 
                              ? 'bg-slate-355 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold hover:opacity-90 border-none px-3.5 shadow-sm'
                          }`}
                        >
                          {isUsed ? 'Already Added' : 'Add to Day'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            );
          })()}

          {/* Dialog Footer Actions */}
          <DialogFooter className="border-t border-border/30 pt-4 mt-4 flex items-center justify-between sm:justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuickAddOpen(true)}
              className="text-xs font-bold rounded-xl border-border/85 bg-background hover:bg-muted shadow-sm"
            >
              + Create Custom Activity
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPickerOpen(false)}
              className="text-xs font-bold rounded-xl border-border/85 bg-background hover:bg-muted shadow-sm"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VISUAL HOTEL PICKER DIALOG */}
      <Dialog open={hotelPickerOpen} onOpenChange={setHotelPickerOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-card text-card-foreground rounded-2xl shadow-2xl border border-border/80 p-6">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="text-base font-extrabold uppercase tracking-wide flex items-center gap-2 text-foreground">
              <Bed className="w-5 h-5 text-purple-500 animate-pulse" />
              Visual Accommodation Directory
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select a luxury property for Day {days.find(d => d.id === hotelPickerDayId)?.day_number || ''}. Filter by star rating, meal plans, or price range.
            </DialogDescription>
          </DialogHeader>

          {/* Filters Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-muted/20 border border-border/80 rounded-2xl text-xs font-semibold my-4 shadow-sm">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Star Rating</Label>
              <Select value={hotelFilterStars} onValueChange={setHotelFilterStars}>
                <SelectTrigger className="h-9 rounded-xl border border-border/80 bg-background hover:bg-muted text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stars</SelectItem>
                  <SelectItem value="5 Star">5 Star</SelectItem>
                  <SelectItem value="4 Star">4 Star</SelectItem>
                  <SelectItem value="3 Star">3 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Meal Plan</Label>
              <Select value={hotelFilterMealPlan} onValueChange={setHotelFilterMealPlan}>
                <SelectTrigger className="h-9 rounded-xl border border-border/80 bg-background hover:bg-muted text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meals</SelectItem>
                  <SelectItem value="EP">EP (Room Only)</SelectItem>
                  <SelectItem value="CP">CP (Breakfast)</SelectItem>
                  <SelectItem value="MAP">MAP (Breakfast + Dinner)</SelectItem>
                  <SelectItem value="AP">AP (Full Meals)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Price Max (Nightly)</Label>
              <Select value={hotelFilterPriceMax.toString()} onValueChange={(val) => setHotelFilterPriceMax(Number(val))}>
                <SelectTrigger className="h-9 rounded-xl border border-border/80 bg-background hover:bg-muted text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Budgets</SelectItem>
                  <SelectItem value="5000">Under ₹5,000</SelectItem>
                  <SelectItem value="10000">Under ₹10,000</SelectItem>
                  <SelectItem value="25000">Under ₹25,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="hotel-search-query-input" className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Search Property</Label>
              <Input
                id="hotel-search-query-input"
                name="hotelSearchQuery"
                placeholder="Search hotel name..."
                value={hotelSearchQuery}
                onChange={e => setHotelSearchQuery(e.target.value)}
                className="h-9 rounded-xl border border-border/80 bg-background focus-visible:ring-amber-500 focus:border-amber-500 text-[11px]"
              />
            </div>
          </div>

          {/* Hotel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {(() => {
              const activeDay = days.find(d => d.id === hotelPickerDayId);
              const dayCity = activeDay?.accommodation_city || activeDay?.city || '';
              let cityHotels = (hotelsList[hotelPickerDayId] || []);
              if (cityHotels.length === 0 && dayCity) {
                const matched = availableHotels.filter((h: any) => 
                  (h.city_name || h.city || '').toLowerCase().includes(dayCity.toLowerCase()) ||
                  (h.name || '').toLowerCase().includes(dayCity.toLowerCase())
                );
                cityHotels = matched.map((h: any) => ({
                  id: h.id,
                  hotel_name: h.name || h.hotel_name,
                  star_category: h.star_category,
                  contract_type: h.contract_type,
                  rates: h.rates || []
                }));
              }
              
              const filtered = cityHotels.filter((h: any) => {
                const categoryName = h.hotel_categories?.category_name || h.star_rating || '';
                const matchStars = hotelFilterStars === 'all' || categoryName.toLowerCase().includes(hotelFilterStars.toLowerCase());
                const matchQuery = !hotelSearchQuery.trim() || h.hotel_name.toLowerCase().includes(hotelSearchQuery.toLowerCase());
                const matchPrice = hotelFilterPriceMax === 0 || (h.selling_cost || h.base_cost || 0) <= hotelFilterPriceMax;
                return matchStars && matchQuery && matchPrice;
              });

              if (filtered.length === 0) {
                return (
                  <div className="col-span-2 text-center py-12 text-muted-foreground text-xs font-semibold">
                    No hotels matching filters found in {dayCity || 'this city'}.
                  </div>
                );
              }

              return filtered.map((h: any) => {
                const selectedRateId = selectedHotelRates[h.id] || h.rates?.[0]?.rate_id || '';
                const selectedRate = (h.rates || []).find((r: any) => String(r.rate_id) === String(selectedRateId)) || h.rates?.[0];
                
                const contractedRate = selectedRate ? selectedRate.rate_per_night : (h.base_cost || 3000);
                const sellingRate = selectedRate ? (contractedRate * 1.1) : (h.selling_cost || 4500);
                const margin = sellingRate - contractedRate;
                
                const rateObj = {
                  hotel_id: h.id,
                  hotel_name: h.hotel_name,
                  room_category: selectedRate ? selectedRate.room_type : 'Standard Room',
                  meal_plan: selectedRate ? selectedRate.meal_plan : (hotelFilterMealPlan === 'all' ? 'CP' : hotelFilterMealPlan),
                  nights: 1,
                  rate_per_night: sellingRate,
                  room_cost: sellingRate,
                  total_cost: sellingRate,
                  chargeable: true
                };

                return (
                  <Card key={h.id} className="overflow-hidden border border-border/80 hover:border-purple-500/40 hover:shadow-lg rounded-2xl transition-all duration-200 flex flex-col justify-between text-left">
                    <div className="flex gap-3 p-3">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img 
                          src={h.image_url || h.photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=200&auto=format&fit=crop'} 
                          alt={h.hotel_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <Badge className="bg-purple-500/10 text-purple-650 dark:text-purple-400 border border-purple-500/20 font-bold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded-lg">
                          {h.star_rating || h.hotel_categories?.category_name || 'Accommodation'}
                        </Badge>
                        <h4 className="font-extrabold text-xs text-foreground truncate uppercase">{h.hotel_name}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">{h.address || h.city}</p>
                        
                        {h.rates && h.rates.length > 0 && (
                          <div className="pt-1.5 pb-1">
                            <select
                              value={selectedRateId}
                              onChange={(e) => setSelectedHotelRates(prev => ({ ...prev, [h.id]: e.target.value }))}
                              className="w-full text-[10px] rounded-lg border border-border/80 bg-background text-foreground p-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            >
                              {h.rates.map((r: any, rIdx: number) => (
                                <option key={r.rate_id || `rate-${r.id || rIdx}`} value={r.rate_id || r.id}>
                                  {r.room_type} — {r.meal_plan} — ₹{r.rate_per_night}/night
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                          <div>Net: <strong className="text-foreground font-mono">₹{Math.round(contractedRate)}</strong></div>
                          <div>Selling: <strong className="text-amber-500 font-mono">₹{Math.round(sellingRate)}</strong></div>
                          <div>Margin: <strong className="text-emerald-500 font-mono">₹{Math.round(margin)}</strong></div>
                          <div>Meal: <strong className="text-foreground">{rateObj.meal_plan}</strong></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-muted/20 border-t border-border/30 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => {
                          const consecutiveDayIds = getConsecutiveSameCityDayIds(days, hotelPickerDayId);
                          setDays(prevDays => prevDays.map(day => {
                            if (!consecutiveDayIds.includes(day.id)) return day;
                            
                            let blocks = [...(day.metadata?.blocks || [])];
                            let hotelBlockFound = false;

                            blocks = blocks.map((b: any) => {
                              if (b.type === 'hotel' || b.id === hotelPickerBlockId) {
                                hotelBlockFound = true;
                                return {
                                  ...b,
                                  cost: rateObj.total_cost,
                                  properties: { ...rateObj }
                                };
                              }
                              return b;
                            });

                            if (!hotelBlockFound) {
                              blocks.push({
                                id: 'hotel_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
                                type: 'hotel',
                                time: '12:00',
                                cost: rateObj.total_cost,
                                properties: { ...rateObj }
                              });
                            }

                            return { ...day, metadata: { ...day.metadata, blocks } };
                          }));
                          setHotelPickerOpen(false);
                          toast({
                            title: 'Hotel Selected & Propagated',
                            description: `${h.hotel_name} selected for ${consecutiveDayIds.length} night(s) in this city.`
                          });
                        }}
                        className="h-8 text-[11px] font-bold bg-purple-650 hover:bg-purple-700 text-white rounded-xl px-4 border-0 shadow-md"
                      >
                        Book Stay
                      </Button>
                    </div>
                  </Card>
                );
              });
            })()}
          </div>

          <DialogFooter className="border-t border-border/30 pt-4 mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setHotelPickerOpen(false)}
              className="text-xs font-bold rounded-xl border border-border/85 bg-background hover:bg-muted shadow-sm"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VISUAL CAB / TRANSPORT VEHICLE PICKER DIALOG */}
      <Dialog open={cabPickerOpen} onOpenChange={setCabPickerOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-card text-card-foreground rounded-2xl shadow-2xl border border-border/80 p-6">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="text-base font-extrabold uppercase tracking-wide flex items-center gap-2 text-foreground">
              <Car className="w-5 h-5 text-emerald-500 animate-pulse" />
              Transit & Transport Selector
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose a cab vehicle class and route template for Day {days.find(d => d.id === cabPickerDayId)?.day_number || ''}.
            </DialogDescription>
          </DialogHeader>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-muted/20 border border-border/85 rounded-2xl text-xs font-semibold my-4 shadow-sm">
            <div className="space-y-1">
              <Label htmlFor="cab-search-query-input" className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Search Routes / Cities</Label>
              <Input
                id="cab-search-query-input"
                name="cabSearchQuery"
                placeholder="Search source or destination..."
                value={cabSearchQuery}
                onChange={e => setCabSearchQuery(e.target.value)}
                className="h-9 rounded-xl border border-border/80 bg-background focus-visible:ring-emerald-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Vehicle Class Selection</Label>
              <span className="text-[11px] block py-2 text-muted-foreground font-mono">Available Vehicles listed on cards below</span>
            </div>
          </div>

          {/* Cab Inventory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {(() => {
              const activeDay = days.find(d => d.id === cabPickerDayId);
              const dayCity = activeDay?.accommodation_city || activeDay?.city || '';
              
              // Filter routes
              const filteredRoutes = cabRoutes.filter(r => {
                const targetCity = dayCity.toLowerCase().trim();
                const matchCity = !targetCity || 
                  (r.source && r.source.toLowerCase().includes(targetCity)) || 
                  (r.destination && r.destination.toLowerCase().includes(targetCity)) ||
                  (r.state && r.state.toLowerCase().includes(targetCity));
                const matchQuery = !cabSearchQuery.trim() || 
                  (r.source && r.source.toLowerCase().includes(cabSearchQuery.toLowerCase())) ||
                  (r.destination && r.destination.toLowerCase().includes(cabSearchQuery.toLowerCase()));
                return matchCity && matchQuery;
              });

              const routesToShow = filteredRoutes.length > 0 ? filteredRoutes : cabRoutes;

              if (routesToShow.length === 0) {
                return (
                  <div className="col-span-2 text-center py-12 text-muted-foreground text-xs font-semibold">
                    No cab routes matching filters found.
                  </div>
                );
              }

              // Let's list combinations of each route with each vehicle type
              const vehicles = cabVehicles.length > 0 ? Array.from(new Set(cabVehicles.map(v => v.vehicle_type))) : ['Sedan', 'SUV', 'Tempo Traveller'];

              const cardsList: any[] = [];
              routesToShow.forEach((route: any) => {
                vehicles.forEach((vt: string) => {
                  cardsList.push({ route, vt });
                });
              });

              return cardsList.map(({ route, vt }, idx) => {
                const contractedRate = route.contract_rate || route.cost || 2500;
                const sellingRate = route.selling_rate || Math.round(contractedRate * 1.2) || 3000;
                const margin = sellingRate - contractedRate;

                return (
                  <Card key={`${route.id}-${vt}-${idx}`} className="overflow-hidden border border-border/80 hover:border-emerald-500/40 hover:shadow-lg rounded-2xl transition-all duration-200 flex flex-col justify-between text-left">
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded-lg">
                          {route.route_type || 'Transfer'}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] font-mono font-bold bg-background text-muted-foreground border-border/80">
                          {vt}
                        </Badge>
                      </div>
                      <h4 className="font-extrabold text-sm text-foreground uppercase tracking-tight">
                        {route.source} → {route.destination}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">Circuit: {route.state || 'Local Routing'}</p>
                      
                      <div className="grid grid-cols-3 gap-2 pt-2 text-[9px] font-bold text-muted-foreground uppercase">
                        <div>Net: <span className="text-foreground font-mono block">₹{contractedRate}</span></div>
                        <div>Selling: <span className="text-amber-500 font-mono block">₹{sellingRate}</span></div>
                        <div>Margin: <span className="text-emerald-500 font-mono block">₹{margin}</span></div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-muted/20 border-t border-border/30 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleSelectCab(cabPickerDayId, cabPickerBlockId, vt, route.id, 'Normal Season')}
                        className="h-8 text-[11px] font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl px-4 border-0 shadow-md"
                      >
                        Select Transport
                      </Button>
                    </div>
                  </Card>
                );
              });
            })()}
          </div>

          <DialogFooter className="border-t border-border/30 pt-4 mt-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCabPickerOpen(false)}
              className="text-xs font-bold rounded-xl border border-border/85 bg-background hover:bg-muted shadow-sm"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QUICK CREATE CUSTOM EXCURSION RECORD DIALOG */}
      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent className="max-w-md bg-card text-card-foreground rounded-2xl shadow-xl border border-border p-6">
          <DialogHeader>
            <DialogTitle className="text-md font-bold flex items-center gap-1.5 text-foreground">
              <Plus className="w-5 h-5 text-accent" /> Create Custom Activity Master
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a brand new activity to the database inventory for this destination.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleQuickAddSubmit} className="space-y-4 text-xs text-left font-semibold">
            <div className="space-y-1.5">
              <Label>Activity Name *</Label>
              <Input
                placeholder="e.g. Rishikesh River Rafting"
                required
                value={quickAddForm.activity_name}
                onChange={e => setQuickAddForm(prev => ({ ...prev, activity_name: e.target.value }))}
                className="h-9 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={quickAddForm.activity_category}
                  onValueChange={val => setQuickAddForm(prev => ({ ...prev, activity_category: val }))}
                >
                  <SelectTrigger className="h-9 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="Water Sports">Water Sports</SelectItem>
                    <SelectItem value="Theme Park">Theme Park</SelectItem>
                    <SelectItem value="Nature">Nature</SelectItem>
                    <SelectItem value="Cruise">Cruise</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Sub Category</Label>
                <Input
                  placeholder="e.g. White Water Rafting"
                  value={quickAddForm.sub_category}
                  onChange={e => setQuickAddForm(prev => ({ ...prev, sub_category: e.target.value }))}
                  className="h-9 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Duration (Hrs)</Label>
                <Input
                  placeholder="e.g. 3 Hours"
                  value={quickAddForm.duration}
                  onChange={e => setQuickAddForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Adult Cost (INR)</Label>
                <Input
                  type="number"
                  value={quickAddForm.adult_cost || ''}
                  onChange={e => setQuickAddForm(prev => ({ ...prev, adult_cost: parseFloat(e.target.value) || 0 }))}
                  className="h-9 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Child Cost (INR)</Label>
                <Input
                  type="number"
                  value={quickAddForm.child_cost || ''}
                  onChange={e => setQuickAddForm(prev => ({ ...prev, child_cost: parseFloat(e.target.value) || 0 }))}
                  className="h-9 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Write a brief overview of this activity..."
                rows={2.5}
                value={quickAddForm.description}
                onChange={e => setQuickAddForm(prev => ({ ...prev, description: e.target.value }))}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Image URL (Unsplash or direct link)</Label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={quickAddForm.image_url}
                onChange={e => setQuickAddForm(prev => ({ ...prev, image_url: e.target.value }))}
                className="h-9 rounded-xl"
              />
            </div>

            <DialogFooter className="pt-4 border-t gap-2">
              <Button type="button" variant="outline" onClick={() => setQuickAddOpen(false)} className="rounded-xl h-9 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90 rounded-xl h-9 text-xs">
                Save & Add Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FULLSCREEN CLIENT PROPOSAL BROCHURE DIALOG */}
      <Dialog open={proposalOpen} onOpenChange={setProposalOpen}>
        <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none bg-background overflow-y-auto p-0 flex flex-col" aria-describedby="proposal-description">
          <DialogTitle className="sr-only">Client Proposal Brochure</DialogTitle>
          <DialogDescription id="proposal-description" className="sr-only">
            This dialog displays the full premium digital brochure proposal for the client.
          </DialogDescription>
          
          {/* Action Header bar (no-print) */}
          <div className="no-print bg-slate-950 text-slate-100 p-4 flex justify-between items-center shadow-lg border-b border-slate-900 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <span className="font-black text-xs uppercase tracking-widest text-slate-200">Ghumo Firoo Luxury Proposal Portal</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => window.print()}
                className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90 text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
              >
                <Printer className="w-4 h-4" /> Print / Export PDF
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setProposalOpen(false)}
                className="text-slate-400 hover:text-white font-extrabold text-sm h-9 px-3"
              >
                Close
              </Button>
            </div>
          </div>

          {/* Brochure Print Wrapper */}
          <div id="proposal-print-area" className="proposal-print-container flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8 bg-[#0b1021] text-slate-100 shadow-2xl">
            
            {/* Top Luxury Agency Branding Header */}
            <div className="bg-[#161d2f] border border-slate-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-left shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl shadow-lg">
                  GF
                </div>
                <div>
                  <h2 className="text-base font-black uppercase text-white tracking-widest flex items-center gap-2">
                    GHUMO FIROO LUXURY TRAVELS
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] px-2 py-0.5 rounded-full font-bold">VERIFIED DMC</span>
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">Curated Luxury Holidays & Pilgrimage Journeys • ISO 9001:2026 Certified</p>
                </div>
              </div>
              <div className="text-right text-xs font-bold text-slate-300 space-y-0.5">
                <p>📞 24x7 Concierge: <span className="font-mono text-amber-400 font-extrabold">+91 98765 43210</span></p>
                <p>📧 Email: <span className="text-white">luxury@ghumofiroo.com</span></p>
                <p>🌐 Web: <span className="text-amber-400 font-mono">www.ghumofiroo.com</span></p>
              </div>
            </div>

            {/* Header / Hero Cover Page */}
            <div className="proposal-hero-cover relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 h-[440px] flex flex-col justify-end p-6 md:p-10 bg-slate-950">
              {/* Background Hero Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={(() => {
                    const dest = (activeLead?.destinations || itinerary?.itinerary_name || '').toLowerCase();
                    if (dest.includes('haridwar') || dest.includes('rishikesh') || dest.includes('char dham')) return 'https://images.unsplash.com/photo-1614082242765-7c98cd0f3df3?q=80&w=1200&auto=format&fit=crop';
                    if (dest.includes('kashmir') || dest.includes('gulmarg') || dest.includes('srinagar')) return 'https://images.unsplash.com/photo-1587570220642-1e967a6d80ff?q=80&w=1200&auto=format&fit=crop';
                    if (dest.includes('kutch') || dest.includes('bhuj') || dest.includes('rann')) return 'https://images.unsplash.com/photo-1609828913647-757863b84b2c?q=80&w=1200&auto=format&fit=crop';
                    if (dest.includes('goa') || dest.includes('kerala')) return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop';
                    if (dest.includes('singapore')) return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200&auto=format&fit=crop';
                    if (dest.includes('dubai')) return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop';
                    return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop';
                  })()}
                  alt="Destination Hero"
                  className="w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1021] via-[#0b1021]/70 to-transparent" />
              </div>

              <div className="relative z-10 text-left space-y-4 max-w-3xl text-white">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg inline-block">
                  ✨ EXCLUSIVE CURATED JOURNEY
                </span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase drop-shadow-lg text-white">
                  {itinerary?.itinerary_name || `Bespoke Journey for ${itinerary?.customer_name || activeLead?.customer_name}`}
                </h1>
                <p className="text-slate-200 text-sm font-semibold leading-relaxed max-w-2xl drop-shadow-md">
                  A high-end multi-day travel blueprint curated specifically for{' '}
                  <strong className="text-amber-400 font-black">{itinerary?.customer_name || activeLead?.customer_name || 'Guest'}</strong>. Experiencing premium accommodations, private transfers, and handpicked excursions.
                </p>
                <div className="pt-3 flex flex-wrap gap-5 text-xs font-black uppercase tracking-widest text-slate-300 border-t border-white/20 mt-2">
                  <span>Duration: <strong className="text-amber-400 font-mono text-sm">{itinerary?.total_nights || stayStops.reduce((s, x) => s + x.nights, 0)} Nights / {days.length} Days</strong></span>
                  <span>Guests: <strong className="text-white font-mono text-sm">{(itinerary?.adult_count || 2)} Adults, {(itinerary?.child_count || 0)} Children</strong></span>
                </div>
              </div>
            </div>

            {/* Travel Summary Profile Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-slate-800 bg-[#161d2f] text-left shadow-xl">
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">Client Representative</span>
                <p className="text-sm font-black text-white mt-0.5 uppercase">{itinerary?.customer_name || activeLead?.customer_name}</p>
                <p className="text-xs text-slate-300 font-medium">{itinerary?.customer_email || activeLead?.email || 'Contact Confirmed'}</p>
              </div>
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">Proposal Reference</span>
                <p className="text-sm font-black text-white mt-0.5 font-mono">#{itinerary?.itinerary_code || `ITIN-2026-${activeLead?.id || '001'}`}</p>
              </div>
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">Travel Window</span>
                <p className="text-sm font-black text-white mt-0.5">{itinerary?.travel_start_date || activeLead?.trip_start_date || 'Dates Confirmed'}</p>
                <p className="text-xs text-slate-300 font-medium">to {itinerary?.travel_end_date || '---'}</p>
              </div>
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">Booking Status</span>
                <p className="text-sm font-black mt-0.5 flex items-center gap-1.5 uppercase tracking-wide text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  PROPOSAL CONFIRMED
                </p>
                <p className="text-xs text-slate-300 font-semibold">Ready for 1-Click Acceptance</p>
              </div>
            </div>

            {/* Day by Day Vertical Timeline */}
            <div className="space-y-6 text-left">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Layout className="w-5 h-5 text-amber-400" /> Curated Day-by-Day Schedule
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">Your day-by-day sightseeing highlights, transfers, and accommodations blueprint.</p>
                </div>
              </div>

              <div className="space-y-6">
                {days.map((day, idx) => {
                  const blocks = (day.metadata?.blocks || []).filter((b: any) => b.type !== 'meal');
                  const hotelBlock = blocks.find((b: any) => b.type === 'hotel');
                  const transferBlocks = blocks.filter((b: any) => b.type === 'transfer');
                  const activityBlocks = blocks.filter((b: any) => b.type === 'activity');
                  const flightBlocks = blocks.filter((b: any) => b.type === 'flight');
                  
                  return (
                    <div key={day.id} className="bg-[#161d2f] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl text-left">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg uppercase tracking-wider">
                            Day {day.day_number}
                          </span>
                          <h4 className="text-base font-black text-white uppercase tracking-wide">{day.title}</h4>
                        </div>
                        <span className="text-xs font-mono text-amber-400 font-extrabold uppercase">
                          {(() => {
                            const startDateStr = itinerary?.travel_start_date || activeLead?.trip_start_date;
                            if (startDateStr) {
                              const d = new Date(startDateStr);
                              if (!isNaN(d.getTime())) {
                                d.setDate(d.getDate() + (day.day_number - 1));
                                return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                              }
                            }
                            return day.date || '---';
                          })()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-semibold">{day.description}</p>

                      {/* Day Components Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        
                        {/* 1. Stays / Hotel Block */}
                        {hotelBlock && (
                          <div className="border border-purple-500/30 bg-[#0f1420] rounded-xl p-4 flex gap-4 text-left shadow-md">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                              <Bed className="w-5 h-5 text-purple-300" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <span className="text-[9px] text-purple-400 font-black uppercase tracking-wider block">Accommodations</span>
                              <h5 className="font-black text-xs text-white uppercase truncate">{hotelBlock.properties?.hotel_name || 'Handpicked Luxury Stay'}</h5>
                              <p className="text-[11px] font-bold text-slate-300 uppercase">
                                Category: <strong className="text-amber-400">{hotelBlock.properties?.room_category || 'Standard Room'}</strong> | Plan: <strong className="text-amber-400">{hotelBlock.properties?.meal_plan || 'CP (Breakfast Included)'}</strong>
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 2. Cab / Transport block */}
                        {transferBlocks.map((tb: any) => (
                          <div key={tb.id} className="border border-emerald-500/30 bg-[#0f2019] rounded-xl p-4 flex gap-4 text-left shadow-md">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                              <Car className="w-5 h-5 text-emerald-300" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider block">Private Transfer & Routing</span>
                              <h5 className="font-black text-xs text-white uppercase truncate">
                                {tb.properties?.route_from && tb.properties?.route_to 
                                  ? `${tb.properties.route_from} to ${tb.properties.route_to}` 
                                  : 'Private Vehicle Transit Route'}
                              </h5>
                              <p className="text-[11px] font-bold text-slate-300 uppercase">
                                Vehicle: <strong className="text-emerald-400">{tb.properties?.vehicle_type || 'Private SUV / Sedan'}</strong>
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* 3. Activities / Excursions */}
                        {activityBlocks.map((ab: any) => (
                          <div key={ab.id} className="col-span-1 md:col-span-2 border border-amber-500/30 bg-[#201a0f] rounded-xl p-4 flex gap-4 text-left shadow-md">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                              <Sparkles className="w-5 h-5 text-amber-300" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider block">Sightseeing Excursion</span>
                              <h5 className="font-black text-xs text-white uppercase truncate">{ab.properties?.excursion_name || 'Sightseeing Tour'}</h5>
                              <p className="text-xs text-slate-300 font-medium leading-relaxed">{ab.properties?.description || 'Explore top landmarks and attractions.'}</p>
                            </div>
                          </div>
                        ))}

                        {/* 4. Flights */}
                        {flightBlocks.map((fb: any) => (
                          <div key={fb.id} className="border border-blue-500/30 bg-[#0f1929] rounded-xl p-4 flex gap-4 text-left shadow-md">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                              <Plane className="w-5 h-5 text-blue-300" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <span className="text-[9px] text-blue-400 font-black uppercase tracking-wider block">Flight Segment</span>
                              <h5 className="font-black text-xs text-white uppercase truncate">{fb.properties?.flight_no || 'Scheduled Flight'}</h5>
                              <p className="text-[11px] font-bold text-slate-300 uppercase">
                                Route: <strong className="text-blue-400">{fb.properties?.dep_airport || 'Airport'} ✈ {fb.properties?.arr_airport || 'Destination'}</strong>
                              </p>
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-6 text-left">
              <div className="bg-[#161d2f] border border-slate-800 p-5 rounded-2xl space-y-3">
                <h4 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Package Inclusions
                </h4>
                <ul className="space-y-2 text-xs font-bold text-slate-200">
                  {Object.entries(inclusions).map(([key, enabled]) => enabled && (
                    <li key={key} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {key}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#161d2f] border border-slate-800 p-5 rounded-2xl space-y-3">
                <h4 className="text-sm font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-400" /> Package Exclusions
                </h4>
                <ul className="space-y-2 text-xs font-bold text-slate-300">
                  {Object.entries(exclusions).map(([key, enabled]) => enabled && (
                    <li key={key} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                      {key}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Final Pricing Section & 1-Click WhatsApp Acceptance */}
            <div className="border border-amber-500/30 bg-gradient-to-r from-[#161d2f] to-[#0f1420] p-6 rounded-3xl text-left shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Total Package Investment</span>
                <div className="text-3xl font-black text-white">
                  ₹{Math.round(finalPackagePrice).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-300 font-bold">
                  Per Person Rate: <span className="font-black text-amber-400 font-mono">₹{Math.round(finalPackagePrice / Math.max(1, (itinerary?.adult_count || 2) + (itinerary?.child_count || 0))).toLocaleString('en-IN')}</span> (For {(itinerary?.adult_count || 2) + (itinerary?.child_count || 0)} Guests)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Hi Ghumo Firoo Travels, I approve the tour proposal for ${itinerary?.customer_name || activeLead?.customer_name} (${itinerary?.itinerary_name || activeLead?.destinations}) priced at ₹${Math.round(finalPackagePrice).toLocaleString('en-IN')}!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none"
                >
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs h-11 px-5 rounded-xl shadow-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 mr-2" /> Approve via WhatsApp
                  </Button>
                </a>
                <Button 
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs h-11 px-5 rounded-xl shadow-lg flex items-center justify-center"
                >
                  <Printer className="w-4 h-4 mr-2" /> Export PDF Proposal
                </Button>
              </div>
            </div>

            {/* Agent Contact & QR Code Section */}
            <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center bg-slate-950 text-white p-6 rounded-3xl gap-6 text-left">
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-md font-black tracking-widest uppercase text-accent">Ghumo Firoo Travels</span>
                  <span className="text-[8px] bg-white/10 text-slate-300 px-2 py-0.5 rounded font-mono uppercase tracking-wider">Premium DMC</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                  Get in touch with your dedicated travel advisor. We are available 24/7 to customize and alter this proposal to matches your absolute desires.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">📧 bookings@ghumofiroo.com</span>
                  <span className="flex items-center gap-1.5">📞 +91 99999 99999</span>
                  <span className="flex items-center gap-1.5">🌐 www.ghumofiroo.com</span>
                </div>
              </div>

              {/* QR Code and WhatsApp Action */}
              <div className="flex items-center gap-4 shrink-0 bg-white/5 p-3 rounded-2xl border border-white/10">
                <svg className="w-16 h-16 border border-white/20 p-1 rounded bg-white shrink-0" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white"/>
                  <rect x="10" y="10" width="20" height="20" fill="black"/>
                  <rect x="15" y="15" width="10" height="10" fill="white"/>
                  <rect x="70" y="10" width="20" height="20" fill="black"/>
                  <rect x="75" y="15" width="10" height="10" fill="white"/>
                  <rect x="10" y="70" width="20" height="20" fill="black"/>
                  <rect x="15" y="75" width="10" height="10" fill="white"/>
                  <rect x="35" y="20" width="10" height="10" fill="black"/>
                  <rect x="50" y="10" width="10" height="10" fill="black"/>
                  <rect x="40" y="40" width="20" height="20" fill="black"/>
                  <rect x="70" y="50" width="10" height="10" fill="black"/>
                  <rect x="50" y="70" width="20" height="10" fill="black"/>
                  <rect x="80" y="80" width="10" height="10" fill="black"/>
                </svg>
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-300 block font-bold">Scan to Chat on WhatsApp</span>
                  <Button 
                    onClick={() => window.open('https://wa.me/919999999999', '_blank')}
                    className="bg-[#25D366] hover:bg-[#20ba56] text-white font-black text-[10px] h-8 rounded-xl flex items-center gap-1.5 px-3 uppercase tracking-wider shadow-md transition-all border-none"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Live
                  </Button>
                </div>
              </div>
            </div>
          </div> {/* Closes proposal-print-area */}
        </DialogContent>
      </Dialog>

      {/* OPERATIONAL VOUCHER DIALOG */}
      <Dialog open={voucherOpen} onOpenChange={setVoucherOpen}>
        <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none bg-background overflow-y-auto p-0 flex flex-col" aria-describedby="voucher-description">
          <DialogTitle className="sr-only">Operational Service Voucher</DialogTitle>
          <DialogDescription id="voucher-description" className="sr-only">
            This dialog displays the official hotel and transport service voucher.
          </DialogDescription>
          
          {/* Action Header bar (no-print) */}
          <div className="no-print bg-slate-950 text-slate-100 p-4 flex justify-between items-center shadow-lg border-b border-slate-900 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <span className="font-black text-xs uppercase tracking-widest text-slate-200">Ghumo Firoo Operations Desk</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => window.print()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:opacity-90 text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
              >
                <Printer className="w-4 h-4" /> Print Voucher
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setVoucherOpen(false)}
                className="text-slate-400 hover:text-white font-extrabold text-sm h-9 px-3"
              >
                Close
              </Button>
            </div>
          </div>

          {/* Voucher Print Area */}
          <div id="voucher-print-area" className="proposal-print-container flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 space-y-8 bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 text-left">
            {/* Header Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">GHUMO FIROO LUXURY TRAVELS</h1>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Operational Service Confirmation Voucher</span>
                <p className="text-xs text-slate-500 max-w-[340px] font-semibold mt-2">
                  Plot 14, Sector 5, Dwarka, New Delhi - 110075<br />
                  GSTIN: 07AAFCG8432L1Z9 | SAC: 998555<br />
                  24x7 Operations Desk: +91 9910987264 | bookings@ghumofiroo.com
                </p>
              </div>
              <div className="text-right space-y-1">
                <span className="inline-block px-3.5 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">OFFICIAL SERVICE VOUCHER</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Voucher ID: <span className="font-black font-mono text-emerald-700 dark:text-emerald-400">GF-VCH-{itinerary?.id || '2026-7892'}</span></p>
                <p className="text-xs text-slate-500 font-semibold">Date of Issue: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Travel Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Lead Guest Name</span>
                <p className="text-xs font-black text-slate-900 dark:text-slate-100">{activeLead?.customer_name || 'Navin Mishra'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Guest Contact</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeLead?.customer_phone || '+91 98765 43210'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tour Window</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {(() => {
                    const start = activeLead?.trip_start_date || itinerary?.travel_start_date || '2026-08-20';
                    const end = activeLead?.trip_end_date || itinerary?.travel_end_date || '2026-08-23';
                    return `${new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} to ${new Date(end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                  })()}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Pax Breakdown</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{(itinerary?.adult_count || activeLead?.adult_count || 2)} Adults, {(itinerary?.child_count || activeLead?.child_count || 0)} Children</p>
              </div>
            </div>

            {/* Accommodations Vouchers */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span>1. Hotel Accommodation Confirmations</span>
                <span className="text-[10px] text-slate-500 font-semibold normal-case">Meal Plan Legend: CP = Breakfast Included | MAP = Breakfast + Dinner</span>
              </h3>
              {(() => {
                const staysList: any[] = [];
                days.forEach(day => {
                  (day.metadata?.blocks || []).forEach((block: any) => {
                    if (block.type === 'hotel') {
                      staysList.push({ day, block });
                    }
                  });
                });

                const baseDate = activeLead?.trip_start_date || itinerary?.travel_start_date || '2026-08-20';

                if (staysList.length === 0) {
                  return <p className="text-xs text-slate-400 italic">No hotels booked in this itinerary.</p>;
                }

                return (
                  <div className="space-y-4">
                    {staysList.map(({ day, block }, index) => {
                      const checkInDate = new Date(baseDate);
                      checkInDate.setDate(checkInDate.getDate() + (day.day_number - 1));
                      const checkInStr = checkInDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                      const checkOutDate = new Date(checkInDate);
                      checkOutDate.setDate(checkOutDate.getDate() + (block.properties?.nights || 1));
                      const checkOutStr = checkOutDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                      return (
                        <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Bed className="w-4 h-4 text-purple-600" />
                                {block.properties?.hotel_name || 'Standard 3-Star / 4-Star Hotel'}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{day.accommodation_city || day.city || 'Destination City'} • {block.properties?.stars || 4}-Star Deluxe Category</p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-emerald-600 border-0 text-white font-black text-[9px] uppercase tracking-wider py-0.5 px-2.5 shadow-xs">
                                CONFIRMED ({block.properties?.hotel_conf_no || 'HCONF-78921'})
                              </Badge>
                              {block.properties?.hotel_contact && (
                                <p className="text-[9px] text-purple-600 font-bold mt-1">Desk: {block.properties.hotel_contact}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-3 border-t border-slate-200/60 dark:border-slate-800">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Check-in</span>
                              <p className="font-extrabold text-slate-800 dark:text-slate-200">{checkInStr} (12:00 PM)</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Check-out</span>
                              <p className="font-extrabold text-slate-800 dark:text-slate-200">{checkOutStr} (11:00 AM)</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Room Category & Meal Plan</span>
                              <p className="font-extrabold text-purple-700 dark:text-purple-400">{block.properties?.room_category || 'Standard Deluxe Room'} | {block.properties?.meal_plan || 'CP (Breakfast Included)'}</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Hotel Booking Ref #</span>
                              <p className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">{block.properties?.hotel_conf_no || 'HCONF-78921'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Transport Confirmations */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">2. Private Vehicle & Driver Details</h3>
              {(() => {
                const transportList: any[] = [];
                days.forEach(day => {
                  (day.metadata?.blocks || []).forEach((block: any) => {
                    if (block.type === 'transport') {
                      transportList.push({ day, block });
                    }
                  });
                });

                const baseDate = activeLead?.trip_start_date || itinerary?.travel_start_date || '2026-08-20';

                if (transportList.length === 0) {
                  return <p className="text-xs text-slate-400 italic">No transport/cabs booked in this itinerary.</p>;
                }

                return (
                  <div className="space-y-4">
                    {transportList.map(({ day, block }, index) => {
                      const travelDate = new Date(baseDate);
                      travelDate.setDate(travelDate.getDate() + (day.day_number - 1));
                      const travelDateStr = travelDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                      return (
                        <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Car className="w-4 h-4 text-emerald-600" />
                                {block.properties?.vehicle_type || 'AC Sedan / SUV Cab'}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{block.properties?.usage_type?.replace(/_/g, ' ') || 'Full Circuit Private Cab'} • Dedicated AC Vehicle</p>
                            </div>
                            <Badge className="bg-emerald-600 border-0 text-white font-black text-[9px] uppercase tracking-wider py-0.5 px-2.5 shadow-xs">
                              CONFIRMED ({block.properties?.voucher_ref || 'V-8794'})
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-3 border-t border-slate-200/60 dark:border-slate-800">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Service Date</span>
                              <p className="font-extrabold text-slate-800 dark:text-slate-200">{travelDateStr}</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Pickup Point</span>
                              <p className="font-extrabold text-slate-800 dark:text-slate-200">{block.properties?.pickup_location || day.city || 'Hotel Lobby / Airport'}</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Vehicle Reg No & Driver</span>
                              <p className="font-extrabold text-emerald-700 dark:text-emerald-400">
                                {block.properties?.vehicle_no || 'UK07-AZ-4521'} ({block.properties?.driver_details || 'Ramesh Kumar • +91 98123 45678'})
                              </p>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Inclusions</span>
                              <p className="font-extrabold text-slate-800 dark:text-slate-200">Fuel, Tolls, Parking & Permits</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Terms Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 space-y-1 mt-6">
              <h5 className="font-extrabold uppercase text-slate-900 dark:text-slate-100 tracking-wider">Important Guest Instructions & Check-in Policy</h5>
              <p>1. Guests must present a government-issued photo ID (Aadhaar / Passport) at hotel check-in desk.</p>
              <p>2. Standard hotel check-in is 12:00 PM and check-out is 11:00 AM. Early check-in is subject to room availability.</p>
              <p>3. Driver contact and final vehicle assignment will be sent via SMS/WhatsApp 12 hours prior to journey.</p>
              <p>4. For 24x7 travel concierge assistance during your trip, call +91 9910987264.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PROFORMA INVOICE DIALOG */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-none w-screen h-screen m-0 rounded-none bg-background overflow-y-auto p-0 flex flex-col" aria-describedby="invoice-description">
          <DialogTitle className="sr-only">Proforma Invoice</DialogTitle>
          <DialogDescription id="invoice-description" className="sr-only">
            This dialog displays the professional proforma invoice.
          </DialogDescription>
          
          {/* Action Header bar (no-print) */}
          <div className="no-print bg-slate-950 text-slate-100 p-4 flex justify-between items-center shadow-lg border-b border-slate-900 sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <span className="font-black text-xs uppercase tracking-widest text-slate-200">Ghumo Firoo Accounts Desk</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => window.print()}
                className="bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold hover:opacity-90 text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md transition-all hover:scale-105 border-0"
              >
                <Printer className="w-4 h-4" /> Print GST Invoice
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setInvoiceOpen(false)}
                className="text-slate-400 hover:text-white font-extrabold text-sm h-9 px-3"
              >
                Close
              </Button>
            </div>
          </div>

          {/* Invoice Print Area */}
          <div id="invoice-print-area" className="proposal-print-container flex-1 max-w-4xl mx-auto w-full p-6 md:p-12 space-y-8 bg-white text-slate-950 dark:bg-slate-900 dark:text-slate-100 text-left">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">GHUMO FIROO TRAVELS PVT LTD</h1>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Government Registered Tour Operator • GST Compliant Tax Invoice</span>
                <p className="text-xs text-slate-500 max-w-[340px] font-semibold mt-2">
                  Plot 14, Sector 5, Dwarka, New Delhi - 110075<br />
                  <strong>GSTIN: 07AAFCG8432L1Z9</strong> | SAC Code: 998555<br />
                  accounts@ghumofiroo.com | +91 9910987264
                </p>
              </div>
              <div className="text-right space-y-1">
                <span className="inline-block px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-md">PROFORMA INVOICE</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Invoice No: <span className="font-black font-mono text-amber-600">GF-INV-{itinerary?.id || '2026-9812'}</span></p>
                <p className="text-xs text-slate-500 font-semibold">Invoice Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Bill To & Details */}
            <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="space-y-1.5">
                <h4 className="font-black text-[9px] text-slate-400 uppercase tracking-wider">Billed To (Lead Guest):</h4>
                <p className="font-black text-sm text-slate-900 dark:text-white">{activeLead?.customer_name || 'Navin Mishra'}</p>
                <p className="font-bold text-slate-600 dark:text-slate-300">Phone: {activeLead?.customer_phone || '+91 98765 43210'}</p>
                <p className="font-bold text-slate-600 dark:text-slate-300">Email: {activeLead?.customer_email || 'nmmishra530@gmail.com'}</p>
              </div>
              <div className="space-y-1.5 text-right">
                <h4 className="font-black text-[9px] text-slate-400 uppercase tracking-wider">Tour & Circuit Particulars:</h4>
                <p className="font-black text-sm text-slate-900 dark:text-white">{itinerary?.title || 'Custom Tour Proposal'}</p>
                <p className="font-bold text-slate-600 dark:text-slate-300">Circuit: {Array.isArray(itinerary?.destinations) ? (typeof itinerary.destinations[0] === 'object' ? itinerary.destinations.map((d: any) => d.city).join(' - ') : itinerary.destinations.join(' - ')) : (activeLead?.destinations || 'Haridwar - Rishikesh')}</p>
                <p className="font-bold text-slate-600 dark:text-slate-300">
                  Travel Window: {(() => {
                    const start = activeLead?.trip_start_date || itinerary?.travel_start_date || '2026-08-20';
                    const end = activeLead?.trip_end_date || itinerary?.travel_end_date || '2026-08-23';
                    return `${new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} to ${new Date(end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                  })()}
                </p>
              </div>
            </div>

            {/* Itemized Cost Sheet */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1.5">Package Inclusions & SAC 998555 Service Summary</h3>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-800 font-black text-slate-500 uppercase text-[9px]">
                    <th className="py-2.5">Day</th>
                    <th className="py-2.5">Service particulars</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(() => {
                    const lineItems: any[] = [];
                    days.forEach(day => {
                      (day.metadata?.blocks || []).forEach((block: any) => {
                        let details = '';
                        let type = '';
                        if (block.type === 'hotel') {
                          details = `${block.properties?.hotel_name || 'Selected 4-Star Hotel'} (${block.properties?.room_category || 'Standard Room'}, ${block.properties?.meal_plan || 'CP - Breakfast Included'})`;
                          type = 'Hotel Accommodation';
                        } else if (block.type === 'transport') {
                          details = `${block.properties?.vehicle_type || 'AC Private Cab'} - ${block.properties?.usage_type?.replace(/_/g, ' ') || 'Point-to-Point Transit'}`;
                          type = 'Private Transfer';
                        } else if (block.type === 'activity' || block.type === 'sightseeing') {
                          details = block.properties?.activity_name || block.properties?.title || 'Sightseeing & Excursions';
                          type = 'Excursion';
                        }

                        if (details) {
                          lineItems.push({
                            dayNum: day.day_number,
                            details,
                            type
                          });
                        }
                      });
                    });

                    if (lineItems.length === 0) {
                      return (
                        <tr>
                          <td colSpan={4} className="py-4 text-center italic text-slate-400">No components added yet.</td>
                        </tr>
                      );
                    }

                    return lineItems.map((item, idx) => (
                      <tr key={idx} className="text-slate-700 dark:text-slate-300 font-semibold">
                        <td className="py-3">Day {item.dayNum}</td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{item.details}</td>
                        <td className="py-3">{item.type}</td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-600">Included in Package</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col md:flex-row justify-between items-start border-t-2 border-slate-900 pt-4 gap-6 text-xs">
              <div className="space-y-1 text-slate-500 text-[10px] max-w-sm">
                <p className="font-extrabold uppercase text-slate-700 dark:text-slate-300">GST Invoice Notes (SAC 998555)</p>
                <p>Taxable Value includes hotel accommodation, private transfers, and sightseeing expenses for {(itinerary?.adult_count || activeLead?.adult_count || 2)} Guests.</p>
              </div>

              {(() => {
                const totalGross = finalPackagePrice || 15000;
                const subtotal = totalGross / 1.05; // 5% GST Back-calculation
                const totalTax = totalGross - subtotal;
                const cgst = totalTax / 2;
                const sgst = totalTax / 2;

                return (
                  <div className="w-full max-w-[320px] space-y-1.5 font-semibold bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Taxable Amount (Before GST)</span>
                      <span className="font-mono">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>CGST @ 2.5%</span>
                      <span className="font-mono">₹{Math.round(cgst).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>SGST @ 2.5%</span>
                      <span className="font-mono">₹{Math.round(sgst).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700 pt-2">
                      <span>Total Invoice Amount Due</span>
                      <span className="font-mono text-amber-600">₹{Math.round(totalGross).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Payment & Bank Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h5 className="font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-amber-500" />
                  Bank Wire Transfer & UPI Details
                </h5>
                <p className="font-bold text-slate-600 dark:text-slate-300">Account Name: <strong className="text-slate-900 dark:text-white">Ghumo Firoo Travels Private Limited</strong></p>
                <p className="font-bold text-slate-600 dark:text-slate-300">Bank Name: <strong className="text-slate-900 dark:text-white">HDFC Bank / ICICI Bank</strong></p>
                <p className="font-bold text-slate-600 dark:text-slate-300">Account Number: <strong className="text-slate-900 dark:text-white">50200084321948</strong></p>
                <p className="font-bold text-slate-600 dark:text-slate-300">IFSC Code: <strong className="text-slate-900 dark:text-white">HDFC0001203</strong></p>
                <p className="font-bold text-slate-600 dark:text-slate-300">UPI Handle: <strong className="text-amber-600">ghumofiroo@icici</strong></p>
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-1 text-slate-500 text-[10px] leading-relaxed">
                  <h5 className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 text-xs">Payment Terms</h5>
                  <p>1. 50% advance payment required upon booking confirmation.</p>
                  <p>2. Balance 50% payment to be cleared 7 days prior to travel date.</p>
                </div>
                
                {/* Authorized Signatory Stamp */}
                <div className="border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center self-end w-48 space-y-1 bg-slate-50/60 dark:bg-slate-900/60">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Authorized Signatory</span>
                  <div className="h-8 flex items-center justify-center font-serif text-slate-700 dark:text-slate-300 text-xs font-bold italic">
                    Ghumo Firoo Accounts
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 block">Ghumo Firoo Travels Pvt Ltd</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
