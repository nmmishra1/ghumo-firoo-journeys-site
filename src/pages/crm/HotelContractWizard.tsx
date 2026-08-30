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
  Building2, Plus, Search, Edit, Power, Download, Upload,
  Info, HelpCircle, FileText, CheckCircle2, AlertTriangle, Loader2,
  MapPin, Star, Users, Phone, Mail, Globe, Sparkles, DollarSign, IndianRupee,
  ArrowRight, Landmark, Calendar, Trash2, Layers, RefreshCw, Clock, ArrowLeft, Copy, Save
} from 'lucide-react';
import { fetchHotelMetaFromGoogle } from '@/services/googlePlaces';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

interface HotelContractWizardProps {
  dialogMode: 'add' | 'edit' | null;
  selectedItemId: string | null;
  handleCancel: () => void;
}

// Predefined Meal Plans
const MEAL_PLANS = [
  { code: 'EP', name: 'European Plan (Room Only)' },
  { code: 'CP', name: 'Continental Plan (Room + Breakfast)' },
  { code: 'MAP', name: 'Modified American Plan (Room + Breakfast + Lunch/Dinner)' },
  { code: 'AP', name: 'American Plan (Room + All Meals)' },
  { code: 'AI', name: 'All Inclusive (All Meals + Selected Beverages)' }
];

const WIZARD_STEPS = [
  'Location',
  'Details',
  'Rooms',
  'Meal Plans',
  'Rates Grid',
  'Amenities',
  'Review'
];

const formatDateForInput = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  if (dateStr.includes(' ')) {
    return dateStr.split(' ')[0];
  }
  return dateStr;
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

const parseJsonArray = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } 
    catch { return []; }
  }
  return [];
};

const DEFAULT_HOTEL_AMENITIES = [
  { id: 'fac-wifi', facility_name: 'Free High-Speed Wi-Fi' },
  { id: 'fac-pool', facility_name: 'Swimming Pool' },
  { id: 'fac-restaurant', facility_name: 'Multi-Cuisine Restaurant' },
  { id: 'fac-roomservice', facility_name: '24/7 Room Service' },
  { id: 'fac-spa', facility_name: 'Spa & Ayurvedic Wellness' },
  { id: 'fac-gym', facility_name: 'Fitness Centre / Gym' },
  { id: 'fac-bar', facility_name: 'Bar & Lounge' },
  { id: 'fac-ac', facility_name: 'Air Conditioning (Climate Control)' },
  { id: 'fac-parking', facility_name: 'Free Valet / Self Parking' },
  { id: 'fac-shuttle', facility_name: 'Airport / Railway Shuttle' },
  { id: 'fac-view', facility_name: 'Mountain / Valley Scenic View' },
  { id: 'fac-kettle', facility_name: 'Electric Kettle & Tea/Coffee Maker' },
  { id: 'fac-banquet', facility_name: 'Banquet & Conference Hall' },
  { id: 'fac-kids', facility_name: 'Kids Play Zone & Activity Area' },
  { id: 'fac-pet', facility_name: 'Pet Friendly Accommodations' },
  { id: 'fac-bonfire', facility_name: 'Bonfire & Outdoor BBQ Setup' },
  { id: 'fac-lift', facility_name: 'Elevator / Lift Access' },
  { id: 'fac-doctor', facility_name: 'Doctor on Call & First Aid' },
  { id: 'fac-power', facility_name: '100% Power Backup' },
  { id: 'fac-laundry', facility_name: 'Daily Housekeeping & Laundry' },
  { id: 'fac-jacuzzi', facility_name: 'Jacuzzi / Hot Tub' },
  { id: 'fac-safe', facility_name: 'In-Room Electronic Safe' }
];

export const HotelContractWizard: React.FC<HotelContractWizardProps> = ({
  dialogMode,
  selectedItemId,
  handleCancel
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeRateRowKey, setActiveRateRowKey] = useState<string | null>(null);

  // Geographic / Master Data Lists
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [destinationGroups, setDestinationGroups] = useState<any[]>([]);
  const [hotelCategories, setHotelCategories] = useState<any[]>([]);
  const [facilitiesList, setFacilitiesList] = useState<any[]>(DEFAULT_HOTEL_AMENITIES);
  const [amenitySearchQuery, setAmenitySearchQuery] = useState('');
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Cascade lists derived at runtime
  const [filteredStates, setFilteredStates] = useState<any[]>([]);
  const [filteredCities, setFilteredCities] = useState<any[]>([]);

  // ---------------- WIZARD STATE ----------------
  const [googleSearchInput, setGoogleSearchInput] = useState('');
  const [isFetchingGoogleMeta, setIsFetchingGoogleMeta] = useState(false);

  const handleFetchFromGoogle = async () => {
    if (!googleSearchInput.trim()) {
      toast({ title: "Input Required", description: "Please enter a hotel name or Google Maps URL.", variant: "destructive" });
      return;
    }
    setIsFetchingGoogleMeta(true);
    try {
      const meta = await fetchHotelMetaFromGoogle(googleSearchInput);
      if (meta) {
        setHotelForm(prev => {
          let matchedCountryId = prev.country_id;
          let matchedStateId = prev.state_id;
          let matchedCityId = prev.city_id;

          const detectedCountry = meta.country || '';
          const detectedState = meta.state || '';
          const detectedCity = meta.city || '';

          // 1. Match Country
          if (detectedCountry && Array.isArray(countries) && countries.length > 0) {
            const foundC = countries.find((c: any) => 
              c.country_name?.toLowerCase().trim() === detectedCountry.toLowerCase().trim() ||
              c.country_name?.toLowerCase().includes(detectedCountry.toLowerCase()) || 
              detectedCountry.toLowerCase().includes(c.country_name?.toLowerCase())
            );
            if (foundC) matchedCountryId = String(foundC.id);
          }

          // 2. Match State
          if (detectedState && Array.isArray(states) && states.length > 0) {
            const foundS = states.find((s: any) => 
              s.state_name?.toLowerCase().trim() === detectedState.toLowerCase().trim() ||
              s.state_name?.toLowerCase().includes(detectedState.toLowerCase()) || 
              detectedState.toLowerCase().includes(s.state_name?.toLowerCase())
            );
            if (foundS) matchedStateId = String(foundS.id);
          }

          // 3. Match City
          if (detectedCity && Array.isArray(cities) && cities.length > 0) {
            const foundCity = cities.find((c: any) => 
              c.city_name?.toLowerCase().trim() === detectedCity.toLowerCase().trim() ||
              c.city_name?.toLowerCase().includes(detectedCity.toLowerCase()) || 
              detectedCity.toLowerCase().includes(c.city_name?.toLowerCase())
            );
            if (foundCity) {
              matchedCityId = String(foundCity.id);
              if (foundCity.state_id) matchedStateId = String(foundCity.state_id);
            }
          }

          const gMapsLink = googleSearchInput.startsWith('http') ? googleSearchInput : `https://maps.google.com/?q=${encodeURIComponent(meta.hotel_name || googleSearchInput)}`;

          return {
            ...prev,
            hotel_name: meta.hotel_name || prev.hotel_name,
            hotel_code: meta.hotel_code || prev.hotel_code || '',
            address: meta.address || prev.address,
            area_locality: meta.address || prev.area_locality || detectedCity,
            destination: detectedCity || prev.destination,
            destination_group: meta.destination_group || prev.destination_group || '',
            country_id: matchedCountryId,
            country: detectedCountry || prev.country,
            state_id: matchedStateId,
            state: detectedState || prev.state,
            city_id: matchedCityId,
            city: detectedCity || prev.city,
            nearest_airport: meta.nearest_airport || prev.nearest_airport || '',
            nearest_railway: meta.nearest_railway || prev.nearest_railway || '',
            gps_coordinates: meta.gps_coordinates || prev.gps_coordinates || '',
            google_maps_location: gMapsLink,
            google_maps_url: gMapsLink,
            contact_number: meta.phone_number || prev.contact_number || '',
            contact_person: meta.contact_person || prev.contact_person || '',
            website: meta.website || prev.website || '',
            email: meta.email || prev.email || '',
            check_in_time: meta.check_in_time || prev.check_in_time || '14:00',
            check_out_time: meta.check_out_time || prev.check_out_time || '11:00',
            // Strict Zero-Fabrication: Leave policies clean and empty unless previously entered
            cancellation_policy: meta.cancellation_policy || prev.cancellation_policy || '',
            child_policy: meta.child_policy || prev.child_policy || '',
            extra_bed_policy: meta.extra_bed_policy || prev.extra_bed_policy || '',
            google_rating: meta.google_rating || prev.google_rating || 0,
            internal_rating: meta.internal_rating || prev.internal_rating || (meta.google_rating ? meta.google_rating : 4.0),
            star_rating: meta.star_rating || prev.star_rating || 4
          };
        });
        if (meta.featured_image_url) {
          setMediaUrls(prev => ({ ...prev, featured_image_url: meta.featured_image_url }));
        }

        if (meta.source === 'google_places_verified') {
          toast({
            title: "Google Places Verified! ✨",
            description: `Loaded '${meta.hotel_name}' (${meta.city ? meta.city + ', ' : ''}${meta.country}) with verified rating & contact details.`
          });
        } else {
          toast({
            title: "Location Verified (OpenStreetMap) 🌍",
            description: `Loaded '${meta.hotel_name}' in ${meta.city ? meta.city + ', ' : ''}${meta.country}. Please fill supplier terms & contract policies manually.`
          });
        }
      } else {
        toast({
          title: "No Match Found",
          description: "Google Places could not find an exact match. Please enter details manually.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Google API Error",
        description: err.message || "Failed to fetch hotel details from Google Places API.",
        variant: "destructive"
      });
    } finally {
      setIsFetchingGoogleMeta(false);
    }
  };
  const [hotelForm, setHotelForm] = useState({
    hotel_name: '',
    hotel_code: '',
    star_rating: 3,
    category_id: '',
    address: '',
    website: '',
    email: '',
    contact_number: '',
    contact_person: '',
    contact_email: '',
    check_in_time: '12:00',
    check_out_time: '11:00',
    cancellation_policy: '',
    child_policy: '',
    extra_bed_policy: '',
    active_status: true,
    // Location details
    country_id: '',
    state_id: '',
    city_id: '',
    area_locality: '',
    nearest_airport: '',
    nearest_railway: '',
    google_maps_location: '',
    gps_coordinates: '',
    destination_group: 'Metro',
    google_rating: 0,
    internal_rating: 0
  });

  // Step 3: Room Categories
  const [rooms, setRooms] = useState<any[]>([
    {
      id: 'temp-1',
      room_category_name: 'Standard Room',
      room_size: '250',
      max_adults: 2,
      max_children: 1,
      bed_type: 'Double Bed',
      room_description: 'Comfortable baseline room options.',
      facilities: ['WiFi'],
      room_images: []
    }
  ]);

  // Step 4: Meal Plans Selection
  const [selectedMealPlans, setSelectedMealPlans] = useState<string[]>(['CP']);

  // Step 5: Contract details and Rates Grid
  const [contractDetails, setContractDetails] = useState({
    contract_name: '',
    supplier_id: 'none',
    valid_from: '',
    valid_to: '',
    currency: 'INR',
    gst_percentage: 18,
    payment_policy: '',
    cancellation_policy: ''
  });

  // Seasons defined inside wizard
  const [seasons, setSeasons] = useState<any[]>([
    { id: 'season-normal', name: 'Normal Season', type: 'Normal Season', start_date: '', end_date: '' },
    { id: 'season-peak', name: 'Peak Season Surcharge', type: 'Peak Season', start_date: '', end_date: '' }
  ]);

  // Grid cell rates matching [season_id]-[room_category_id]-[meal_plan_id]
  const [gridRates, setGridRates] = useState<Record<string, any>>({});

  // Costing Panel Scenario Filters
  const [selectedScenarioSeason, setSelectedScenarioSeason] = useState<string>('all');
  const [selectedScenarioRoom, setSelectedScenarioRoom] = useState<string>('all');
  const [selectedScenarioMealPlan, setSelectedScenarioMealPlan] = useState<string>('all');

  // Step 6: Facilities & Media
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState({
    logo_url: '',
    featured_image_url: '',
    gallery_urls: [] as string[],
    brochure_pdf_url: '',
    video_urls: [] as string[]
  });
  const [tempGalleryUrl, setTempGalleryUrl] = useState('');
  const [tempVideoUrl, setTempVideoUrl] = useState('');

  // ---------------- INITIALIZE DATA ----------------
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [cRes, sRes, cityRes, dgRes, catRes, facRes] = await Promise.all([
          fetch(`${API_BASE}/api.php?table=countries&active_status=1`),
          fetch(`${API_BASE}/api.php?table=states&active_status=1`),
          fetch(`${API_BASE}/api.php?table=cities`),
          fetch(`${API_BASE}/api.php?table=destination_groups`),
          fetch(`${API_BASE}/api.php?table=hotel_categories&active_status=1`),
          fetch(`${API_BASE}/api.php?table=hotel_facilities&active_status=1`)
        ]);

        if (cRes.ok) setCountries(await cRes.json() || []);
        if (sRes.ok) setStates(await sRes.json() || []);
        if (cityRes.ok) setCities(await cityRes.json() || []);
        if (dgRes.ok) setDestinationGroups(await dgRes.json() || []);
        let catData: any[] = [];
        if (catRes.ok) {
          catData = await catRes.json() || [];
          setHotelCategories(catData);
        }
        if (facRes.ok) {
          const dbFacs = await facRes.json() || [];
          if (Array.isArray(dbFacs) && dbFacs.length > 0) {
            const merged = [...DEFAULT_HOTEL_AMENITIES];
            dbFacs.forEach((df: any) => {
              if (!merged.some(m => String(m.id) === String(df.id) || m.facility_name?.toLowerCase().trim() === df.facility_name?.toLowerCase().trim())) {
                merged.push(df);
              }
            });
            setFacilitiesList(merged);
          }
        }

        let destData = [];
        try {
          const res = await fetch(`${API_BASE}/api.php?table=destinations`);
          if (res.ok) destData = await res.json();
        } catch (e) {
          console.error(e);
        }
        if (destData) setDestinations(destData);

        let supData = [];
        try {
          const res = await fetch('/php-backend/api.php?table=hotel_suppliers');
          if (res.ok) {
            supData = await res.json();
            supData = supData.filter((s: any) => s.active_status);
          }
        } catch (e) {
          console.error(e);
        }
        if (supData) setSuppliers(supData);

        // Auto-initialize category
        if (catData && catData.length > 0 && !hotelForm.category_id) {
          setHotelForm(prev => ({ ...prev, category_id: catData[0].id }));
        }

        // Fetch current user details
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err: any) {
        console.error('Error loading masters:', err);
      }
    };
    fetchMasters();
  }, []);

  // Load editing details if mode is edit
  useEffect(() => {
    if (dialogMode === 'edit' && selectedItemId) {
      const loadDetails = async () => {
        setLoading(true);
        try {
          // 1. Fetch hotel details with master list fallback for contracted-hotel items
          let hotel: any = null;
          try {
            const res = await fetch(`/php-backend/hotels.php?id=${selectedItemId}`);
            if (res.ok) {
              hotel = await res.json();
            }
          } catch (e) {
            console.warn('Error fetching hotel details from backend:', e);
          }

          if (!hotel && selectedItemId.startsWith('contracted-hotel-')) {
            const masterList = getContractedHotelsMasterList();
            hotel = masterList.find(m => m.id === selectedItemId) || null;
          }

          if (!hotel) {
            throw new Error('Failed to fetch hotel details');
          }

          if (hotel) {
            setHotelForm({
              hotel_name: hotel.hotel_name,
              hotel_code: hotel.hotel_code,
              star_rating: hotel.star_rating || 3,
              category_id: hotel.category_id ? String(hotel.category_id) : '',
              address: hotel.address || '',
              website: hotel.website || '',
              email: hotel.email || '',
              contact_number: hotel.contact_number || '',
              contact_person: hotel.contact_person || '',
              contact_email: hotel.contact_email || '',
              check_in_time: hotel.check_in_time || '12:00',
              check_out_time: hotel.check_out_time || '11:00',
              cancellation_policy: hotel.cancellation_policy || '',
              child_policy: hotel.child_policy || '',
              extra_bed_policy: hotel.extra_bed_policy || '',
              active_status: hotel.active_status || true,
              country_id: hotel.country_id ? String(hotel.country_id) : '',
              state_id: hotel.state_id ? String(hotel.state_id) : '',
              city_id: hotel.city_id ? String(hotel.city_id) : '',
              area_locality: hotel.area_locality || '',
              nearest_airport: hotel.nearest_airport || '',
              nearest_railway: hotel.nearest_railway || '',
              google_maps_location: hotel.maps_location || '',
              gps_coordinates: hotel.gps_coordinates || '',
              destination_group: hotel.destination_group || 'Metro',
              google_rating: Number(hotel.google_rating) || 0,
              internal_rating: Number(hotel.internal_rating) || 0
            });

            setSelectedMealPlans(hotel.meal_plan_supported || ['CP']);
            setMediaUrls({
              logo_url: hotel.logo_url || '',
              featured_image_url: hotel.featured_image_url || '',
              gallery_urls: hotel.gallery_urls || [],
              brochure_pdf_url: hotel.brochure_pdf_url || '',
              video_urls: hotel.video_urls || []
            });
          }

          // 2. Fetch room categories
          const rcRes = await fetch('/php-backend/api.php?table=room_categories');
          let roomCats = [];
          if (rcRes.ok) {
            const allRooms = await rcRes.json();
            roomCats = allRooms.filter((r: any) => r.hotel_id === selectedItemId && r.active_status);
          }
          if (roomCats && roomCats.length > 0) {
            setRooms(roomCats.map(r => ({
              id: r.id,
              room_category_name: r.room_category_name || '',
              room_size: r.room_size || '',
              max_adults: Number(r.max_adults) || 2,
              max_children: Number(r.max_children) || 0,
              bed_type: r.bed_type || '',
              room_description: r.room_description || '',
              facilities: parseJsonArray(r.facilities),
              room_images: parseJsonArray(r.room_images)
            })));
          }

          // 3. Fetch seasons
          const sRes = await fetch(`${API_BASE}/api.php?table=seasons&hotel_id=${selectedItemId}`);
          const hotelSeasons = sRes.ok ? await sRes.json() : null;
          if (hotelSeasons && hotelSeasons.length > 0) {
            setSeasons(hotelSeasons.map((s: any) => ({
              id: s.id,
              name: s.season_name,
              type: s.season_type,
              start_date: formatDateForInput(s.start_date),
              end_date: formatDateForInput(s.end_date)
            })));
          }

          // 4. Fetch Active Contract
          const cRes = await fetch(`${API_BASE}/api.php?table=hotel_contracts&hotel_id=${selectedItemId}`);
          let contractList = cRes.ok ? await cRes.json() : null;
          if (Array.isArray(contractList)) {
            contractList.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          }
          if (contractList && contractList.length > 0) {
            const activeContract = contractList[0];
            setContractDetails({
              contract_name: activeContract.contract_name,
              supplier_id: activeContract.supplier_id || 'none',
              valid_from: formatDateForInput(activeContract.valid_from),
              valid_to: formatDateForInput(activeContract.valid_to),
              currency: activeContract.currency || 'INR',
              gst_percentage: Number(activeContract.gst_percentage) || 18,
              payment_policy: activeContract.payment_policy || '',
              cancellation_policy: activeContract.cancellation_policy || ''
            });

            // 5. Fetch Contract Rates
            const rRes = await fetch(`${API_BASE}/api.php?table=hotel_contract_rates&contract_id=${activeContract.id}&active_status=1`);
            const rates = rRes.ok ? await rRes.json() : null;
            if (rates && rates.length > 0) {
              const ratesMap: Record<string, any> = {};
              rates.forEach(r => {
                const resolvedSeasonId = (r.season_id === 0 || r.season_id === '0' || !r.season_id) ? 'season-normal' : r.season_id;
                const key = `${resolvedSeasonId}-${r.room_category_id}-${r.meal_plan_id}`;
                ratesMap[key] = {
                  single_rate: r.single_rate,
                  double_rate: r.double_rate,
                  triple_rate: r.triple_rate,
                  extra_adult_rate: r.extra_adult_rate,
                  extra_child_rate: r.extra_child_rate,
                  child_with_bed_rate: r.child_with_bed_rate,
                  child_without_bed_rate: r.child_without_bed_rate,
                  markup: r.markup,
                  gst: r.gst_percentage || activeContract.gst_percentage
                };
              });
              setGridRates(ratesMap);
            }
          }

          // 6. Fetch Facility Mappings (non-blocking)
          try {
            const res = await fetch(`${API_BASE}/api.php?table=hotel_facility_mapping&hotel_id=${selectedItemId}`);
            if (res.ok) {
              const mappings = await res.json();
              if (Array.isArray(mappings)) {
                setSelectedFacilities(mappings.map((m: any) => m.facility_id));
              }
            }
          } catch (facErr) {
            console.warn('Failed to fetch facility mappings from MySQL:', facErr);
          }
        } catch (err: any) {
          toast({ title: 'Error Loading Details', description: err.message, variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      };
      loadDetails();
    }
  }, [dialogMode, selectedItemId]);

  // Handle cascading state list
  useEffect(() => {
    if (hotelForm.country_id) {
      setFilteredStates(states.filter(s => String(s.country_id) === String(hotelForm.country_id)));
    } else {
      setFilteredStates([]);
    }
  }, [hotelForm.country_id, states]);

  // Handle cascading city list
  useEffect(() => {
    if (hotelForm.state_id) {
      const stateObj = states.find(s => String(s.id) === String(hotelForm.state_id));
      const stateName = stateObj ? stateObj.state_name : '';
      setFilteredCities(cities.filter(c => c.state === stateName));
    } else {
      setFilteredCities([]);
    }
  }, [hotelForm.state_id, cities, states]);

  // Auto Generate Hotel Code
  const handleGenerateHotelCode = () => {
    let prefix = 'H-';
    if (hotelForm.city_id) {
      const targetCity = cities.find(c => c.id === hotelForm.city_id);
      if (targetCity) prefix += targetCity.city_name.slice(0, 3).toUpperCase() + '-';
    }
    const rand = Math.floor(10000 + Math.random() * 90000);
    setHotelForm(prev => ({ ...prev, hotel_code: prefix + rand }));
  };

  // ---------------- ROOM CATEGORY MANAGEMENT ----------------
  const handleAddRoomCategory = () => {
    const newId = 'temp-' + Date.now();
    setRooms([
      ...rooms,
      {
        id: newId,
        room_category_name: '',
        room_size: '',
        max_adults: 2,
        max_children: 1,
        bed_type: 'King Bed',
        room_description: '',
        facilities: [],
        room_images: []
      }
    ]);
  };

  const handleRemoveRoomCategory = (roomId: string) => {
    if (rooms.length <= 1) {
      toast({ title: 'Operation Prevented', description: 'At least one room category is required.' });
      return;
    }
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  const handleUpdateRoom = (roomId: string, field: string, value: any) => {
    setRooms(rooms.map(r => r.id === roomId ? { ...r, [field]: value } : r));
  };

  // ---------------- SEASON MANAGEMENT ----------------
  const handleAddSeason = () => {
    const newId = 'season-' + Date.now();
    setSeasons([
      ...seasons,
      { id: newId, name: '', type: 'Custom Season', start_date: '', end_date: '' }
    ]);
  };

  const handleRemoveSeason = (seasonId: string) => {
    if (seasons.length <= 1) {
      toast({ title: 'Operation Prevented', description: 'At least one season is required.' });
      return;
    }
    setSeasons(seasons.filter(s => s.id !== seasonId));
  };

  const handleUpdateSeason = (seasonId: string, field: string, value: any) => {
    setSeasons(seasons.map(s => s.id === seasonId ? { ...s, [field]: value } : s));
  };

  // ---------------- CONTRACT RATES GRID UTILITIES ----------------
  const handleUpdateGridRate = (seasonId: string, roomId: string, planCode: string, field: string, value: number) => {
    handleUpdateGridRateField(seasonId, roomId, planCode, field, value);
  };

  const handleUpdateGridRateField = (seasonId: string, roomId: string, planCode: string, field: string, value: any) => {
    const key = `${seasonId}-${roomId}-${planCode}`;
    setGridRates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleApplyBulkMarkup = (preset: string) => {
    let markupVal = 0;
    let isPercentage = false;

    if (preset === 'flat_400') {
      markupVal = 400;
    } else if (preset === 'percent_10') {
      markupVal = 10;
      isPercentage = true;
    } else if (preset === 'percent_12.5') {
      markupVal = 12.5;
      isPercentage = true;
    } else if (preset === 'percent_15') {
      markupVal = 15;
      isPercentage = true;
    } else if (preset === 'auto_recommend') {
      if (hotelForm.star_rating <= 2) {
        markupVal = 400; // Flat ₹400 for Budget hotels/homestays
      } else if (hotelForm.star_rating === 3) {
        markupVal = 10;
        isPercentage = true;
      } else if (hotelForm.star_rating === 4) {
        markupVal = 12.5;
        isPercentage = true;
      } else {
        markupVal = 15;
        isPercentage = true;
      }
    }

    setGridRates(prev => {
      const updated = { ...prev };
      seasons.forEach(season => {
        rooms.forEach(room => {
          selectedMealPlans.forEach(plan => {
            const rateKey = `${season.id}-${room.id}-${plan}`;
            const currentRate = updated[rateKey] || {};
            const doubleRate = Number(currentRate.double_rate) || 0;
            
            let calculatedMarkup = markupVal;
            if (isPercentage && doubleRate > 0) {
              calculatedMarkup = Math.round((doubleRate * markupVal) / 100);
              if (calculatedMarkup < 250 && doubleRate > 0) calculatedMarkup = 250;
            }

            updated[rateKey] = {
              ...currentRate,
              markup: calculatedMarkup
            };
          });
        });
      });
      return updated;
    });

    toast({
      title: "Bulk Markup Applied! ⚡",
      description: `Successfully applied markup preset across all room grid cells.`
    });
  };

  // ---------------- REAL TIME COST CALCULATION PANEL ----------------
  const getCostingMetrics = () => {
    let lowestNet = Infinity;
    let highestNet = -Infinity;
    let totalNetCost = 0;
    let totalGSTAmount = 0;
    let totalSupplierCost = 0;
    let count = 0;
    let totalMarkup = 0;

    Object.entries(gridRates).forEach(([key, rate]: [string, any]) => {
      const doubleRate = Number(rate.double_rate) || 0;
      if (doubleRate > 0) {
        // Robust key matching for hyphenated IDs (e.g. season-normal-temp-1-CP)
        if (selectedScenarioSeason !== 'all') {
          const seasonMatch = key.startsWith(`${selectedScenarioSeason}-`) || key.includes(`-${selectedScenarioSeason}-`);
          if (!seasonMatch) return;
        }

        if (selectedScenarioRoom !== 'all') {
          const roomMatch = key.includes(`-${selectedScenarioRoom}-`);
          if (!roomMatch) return;
        }

        if (selectedScenarioMealPlan !== 'all') {
          const planMatch = key.endsWith(`-${selectedScenarioMealPlan}`) || key.toLowerCase().endsWith(`-${selectedScenarioMealPlan.toLowerCase()}`);
          if (!planMatch) return;
        }

        const isInclusive = rate.rate_type === 'inclusive';
        const gstPercent = Number(rate.gst_percentage) || 18;
        
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

        if (netCost < lowestNet) lowestNet = netCost;
        if (netCost > highestNet) highestNet = netCost;

        totalNetCost += netCost;
        totalGSTAmount += gstAmt;
        totalSupplierCost += supplierCost;
        totalMarkup += Number(rate.markup) || 0;
        count++;
      }
    });

    const avgNetCost = count > 0 ? totalNetCost / count : 0;
    const avgGST = count > 0 ? totalGSTAmount / count : 0;
    const avgSupplierCost = count > 0 ? totalSupplierCost / count : 0;
    const avgMarkup = count > 0 ? totalMarkup / count : 0;
    const sellingPrice = avgSupplierCost + avgMarkup;
    const profitMargin = sellingPrice > 0 ? (avgMarkup / sellingPrice) * 100 : 0;

    let gstSlabBadge = "0% Tax Exempt";
    let gstSlabColor = "border-slate-700 text-slate-400 bg-slate-800/50";
    if (avgNetCost >= 7500) {
      gstSlabBadge = "18% Luxury GST Slab";
      gstSlabColor = "border-rose-500/40 text-rose-400 bg-rose-500/10";
    } else if (avgNetCost >= 1000) {
      gstSlabBadge = "12% Standard GST Slab";
      gstSlabColor = "border-amber-500/40 text-amber-400 bg-amber-500/10";
    } else if (avgNetCost > 0) {
      gstSlabBadge = "0% Exempt (< ₹1k)";
      gstSlabColor = "border-emerald-500/40 text-emerald-400 bg-emerald-500/10";
    }

    return {
      lowest: lowestNet === Infinity ? 0 : lowestNet,
      highest: highestNet === -Infinity ? 0 : highestNet,
      averageBase: avgNetCost,
      averageGST: avgGST,
      supplierCost: avgSupplierCost,
      markup: avgMarkup,
      selling: sellingPrice,
      margin: profitMargin,
      gstSlabBadge,
      gstSlabColor,
      count
    };
  };

  const costing = getCostingMetrics();

  // ---------------- SAVE WIZARD ACTION ----------------
  const handleSaveHotelContract = async (publishStatus: boolean) => {
    if (!hotelForm.hotel_name) {
      toast({ title: 'Missing Information', description: 'Please specify the Hotel Name on Step 2.', variant: 'warning' as any });
      setActiveStep(2);
      return;
    }
    if (!hotelForm.city_id) {
      toast({ title: 'Missing Information', description: 'Please select a City on Step 1.', variant: 'warning' as any });
      setActiveStep(1);
      return;
    }

    setLoading(true);
    try {
      const authHeaders = await getAuthHeader();
      const selectedCity = cities.find(c => String(c.id) === String(hotelForm.city_id));
      const selectedState = states.find(s => String(s.id) === String(hotelForm.state_id));
      const selectedCountry = countries.find(c => String(c.id) === String(hotelForm.country_id));

      const hotelPayload: any = {
        hotel_name: hotelForm.hotel_name,
        hotel_code: hotelForm.hotel_code || 'H-' + Date.now().toString().slice(-6),
        country_id: hotelForm.country_id || null,
        state_id: hotelForm.state_id || null,
        city_id: hotelForm.city_id || null,
        city: selectedCity?.city_name || '',
        state: selectedState?.state_name || '',
        country: selectedCountry?.country_name || '',
        star_rating: hotelForm.star_rating,
        category_id: hotelForm.category_id || null,
        address: hotelForm.address || null,
        website: hotelForm.website || null,
        email: hotelForm.email || null,
        contact_number: hotelForm.contact_number || null,
        contact_person: hotelForm.contact_person || null,
        contact_email: hotelForm.contact_email || null,
        check_in_time: hotelForm.check_in_time || null,
        check_out_time: hotelForm.check_out_time || null,
        cancellation_policy: hotelForm.cancellation_policy || null,
        child_policy: hotelForm.child_policy || null,
        extra_bed_policy: hotelForm.extra_bed_policy || null,
        destination_group: hotelForm.destination_group || 'Metro',
        nearest_airport: hotelForm.nearest_airport || null,
        nearest_railway: hotelForm.nearest_railway || null,
        maps_location: hotelForm.google_maps_location || null,
        gps_coordinates: hotelForm.gps_coordinates || null,
        meal_plan_supported: selectedMealPlans,
        logo_url: mediaUrls.logo_url || null,
        featured_image_url: mediaUrls.featured_image_url || null,
        gallery_urls: mediaUrls.gallery_urls,
        brochure_pdf_url: mediaUrls.brochure_pdf_url || null,
        video_urls: mediaUrls.video_urls,
        active: publishStatus,
        active_status: publishStatus,
        google_rating: Number(hotelForm.google_rating) || 0,
        internal_rating: Number(hotelForm.internal_rating) || 0,
        updated_at: new Date().toISOString()
      };

      let hotelId = selectedItemId;

      // 1. Insert/Update Hotel
      // 1. Insert/Update Hotel
      if (dialogMode === 'add') {
        const res = await fetch('/php-backend/hotels.php', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({
            ...hotelPayload,
            created_at: new Date().toISOString()
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to create hotel (${res.status})`);
        }
        const newHotel = await res.json();
        hotelId = newHotel.id;
      } else {
        const res = await fetch(`/php-backend/hotels.php?id=${selectedItemId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify(hotelPayload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to update hotel (${res.status})`);
        }
      }

      // 2. Persist Room Categories
      // Delete old room categories if in edit mode
      if (dialogMode === 'edit') {
        await fetch(`/php-backend/api.php?table=room_categories&hotel_id=${hotelId}`, { 
          method: 'DELETE',
          headers: authHeaders
        });
      }

      const roomInsertions = rooms.map(r => ({
        hotel_id: hotelId,
        room_category_name: r.room_category_name || 'Standard Room',
        room_size: r.room_size || null,
        max_adults: r.max_adults,
        max_children: r.max_children,
        bed_type: r.bed_type || null,
        room_description: r.room_description || null,
        facilities: parseJsonArray(r.facilities),
        room_images: parseJsonArray(r.room_images),
        active_status: true
      }));

      const savedRooms = await Promise.all(
        roomInsertions.map(room => 
          fetch('/php-backend/api.php?table=room_categories', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...authHeaders
            },
            body: JSON.stringify(room)
          }).then(async res => {
            if (!res.ok) throw new Error('Failed to insert room');
            const data = await res.json();
            return {
              ...room,
              id: data.id
            };
          })
        )
      );

      // 3. Persist Seasons & Rates
      if (dialogMode === 'edit') {
        await fetch(`${API_BASE}/api.php?table=seasons&hotel_id=${hotelId}`, { method: 'DELETE', headers: authHeaders });
      }

      const seasonInsertions = seasons.map(s => ({
        hotel_id: hotelId,
        season_name: s.name || 'Standard Season',
        season_type: s.type || 'Normal Season',
        start_date: s.start_date || new Date().toISOString().slice(0, 10),
        end_date: s.end_date || new Date(Date.now() + 31536000000).toISOString().slice(0, 10)
      }));

      const savedSeasons = await Promise.all(
        seasonInsertions.map(season => 
          fetch(`${API_BASE}/api.php?table=seasons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(season)
          }).then(async r => {
            if (!r.ok) throw new Error('Failed to insert season');
            const resData = await r.json();
            return {
              id: resData.id,
              season_name: season.season_name
            };
          })
        )
      );

      // 4. Create Contract
      if (dialogMode === 'edit') {
        await fetch(`${API_BASE}/api.php?table=hotel_contracts&hotel_id=${hotelId}`, { method: 'DELETE', headers: authHeaders });
      }

      const contractPayload = {
        hotel_id: hotelId,
        supplier_id: contractDetails.supplier_id === 'none' ? null : contractDetails.supplier_id,
        contract_name: contractDetails.contract_name || `${hotelForm.hotel_name} Contract`,
        valid_from: contractDetails.valid_from || new Date().toISOString().slice(0, 10),
        valid_to: contractDetails.valid_to || new Date(Date.now() + 31536000000).toISOString().slice(0, 10),
        currency: contractDetails.currency || 'INR',
        gst_percentage: contractDetails.gst_percentage || 18,
        payment_policy: contractDetails.payment_policy || null,
        cancellation_policy: contractDetails.cancellation_policy || null,
        active_status: publishStatus ? 1 : 0,
        created_at: new Date().toISOString()
      };

      const contractRes = await fetch(`${API_BASE}/api.php?table=hotel_contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(contractPayload)
      });
      if (!contractRes.ok) throw new Error('Failed to save contract');
      const savedContract = await contractRes.json();

      // 5. Insert Contract Rates mapping client-side IDs to Supabase generated IDs
      const rateInsertions: any[] = [];
      savedSeasons.forEach(season => {
        savedRooms.forEach(room => {
          selectedMealPlans.forEach(planCode => {
            // Match using client-side definitions
            const clientSeasonId = seasons.find(s => s.name === season.season_name)?.id || 'season-normal';
            const clientRoomId = rooms.find(r => r.room_category_name === room.room_category_name)?.id || 'temp-1';
            const rateKey = `${clientSeasonId}-${clientRoomId}-${planCode}`;
            const clientRate = gridRates[rateKey] || {};

            const isInclusive = clientRate.rate_type === 'inclusive';
            const roomRate = doubleRateWithFallback(clientRate);
            
            const selectedCountry = countries.find(c => c.id === hotelForm.country_id);
            const countryName = selectedCountry?.country_name || 'India';
            const suggestedGst = getSuggestedTaxRate(countryName, roomRate, isInclusive);

            const gstPercent = (clientRate.gst_percentage !== undefined && clientRate.gst_percentage !== null && clientRate.gst_percentage !== '')
              ? Number(clientRate.gst_percentage)
              : suggestedGst;
              
            const markup = Number(clientRate.markup) || 0;

            let netCost = roomRate;
            let gstAmt = 0;
            let supplierCost = roomRate;

            if (isInclusive) {
              supplierCost = roomRate;
              netCost = roomRate / (1 + (gstPercent / 100));
              gstAmt = roomRate - netCost;
            } else {
              netCost = roomRate;
              gstAmt = roomRate * (gstPercent / 100);
              supplierCost = roomRate + gstAmt;
            }

            const finalAuditLogs = clientRate.tax_audit_logs && clientRate.tax_audit_logs.length > 0
              ? clientRate.tax_audit_logs
              : [{
                  entered_amount: roomRate,
                  gst_included: isInclusive,
                  calculated_gst: gstAmt,
                  base_amount: netCost,
                  final_amount: supplierCost,
                  gst_percent_applied: gstPercent,
                  user: currentUser?.email || 'system',
                  timestamp: new Date().toISOString(),
                  override_reason: 'GST Auto Applied'
                }];

            rateInsertions.push({
              contract_id: savedContract.id,
              room_category_id: room.id,
              meal_plan_id: planCode,
              season_id: season.id,
              single_rate: Number(clientRate.single_rate) || 0,
              double_rate: roomRate,
              triple_rate: Number(clientRate.triple_rate) || 0,
              extra_adult_rate: Number(clientRate.extra_adult_rate) || 0,
              extra_child_rate: Number(clientRate.extra_child_rate) || 0,
              child_with_bed_rate: Number(clientRate.child_with_bed_rate) || 0,
              child_without_bed_rate: Number(clientRate.child_without_bed_rate) || 0,
              quad_rate: 0,
              five_bed_rate: 0,
              six_bed_rate: 0,
              weekend_surcharge: 0,
              peak_season_surcharge: 0,
              active_status: true,
              markup: markup,

              // Tax Engine Columns
              rate_type: clientRate.rate_type || 'exclusive',
              gst_percentage: gstPercent,
              gst_amount: gstAmt,
              net_cost: netCost,
              supplier_cost: supplierCost,
              selling_cost: supplierCost + markup,
              is_tax_overridden: clientRate.is_tax_overridden || false,
              tax_override_reason: clientRate.tax_override_reason || null,
              tax_audit_logs: finalAuditLogs,
              created_at: new Date().toISOString()
            });
          });
        });
      });

      try {
        if (rateInsertions.length > 0) {
          await Promise.all(
            rateInsertions.map(rate => 
              fetch(`${API_BASE}/api.php?table=hotel_contract_rates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify(rate)
              }).then(r => {
                if (!r.ok) throw new Error('Failed to insert contract rate');
              })
            )
          );
        }
      } catch (rateEx) {
        console.warn('MySQL rate insert exception:', rateEx);
      }

      // 6. Save Facility Mappings (MySQL via api.php)
      try {
        await fetch(`${API_BASE}/api.php?table=hotel_facility_mapping&hotel_id=${hotelId}`, { 
          method: 'DELETE',
          headers: authHeaders 
        });
        if (selectedFacilities.length > 0) {
          const facilityMappings = selectedFacilities.map(facId => ({
            hotel_id: hotelId,
            facility_id: facId
          }));
          await Promise.all(facilityMappings.map(mapping => 
            fetch(`${API_BASE}/api.php?table=hotel_facility_mapping`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                ...authHeaders
              },
              body: JSON.stringify(mapping)
            }).then(r => {
              if (!r.ok) throw new Error('Failed to insert facility mapping');
            })
          ));
        }
      } catch (facEx) {
        console.warn('Facility mapping write exception:', facEx);
      }

      toast({
        title: publishStatus ? 'Hotel Published' : 'Draft Saved',
        description: `Successfully stored "${hotelForm.hotel_name}" along with categories, meal plans, and contract rates.`
      });
      handleCancel();
    } catch (err: any) {
      toast({ title: 'Contract Save Failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const doubleRateWithFallback = (clientRate: any) => {
    return Number(clientRate.double_rate) || Number(clientRate.single_rate) || 0;
  };

  const handleImageUploadHelper = async (file: File, folderName: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${fileExt}`;
      const filePath = `${folderName}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('hotel-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.warn('Supabase storage upload failed, attempting local upload endpoint:', uploadError.message);
        try {
          const authHeaders = await getAuthHeader();
          const formData = new FormData();
          formData.append('file', file);
          const phpRes = await fetch('/php-backend/upload.php', {
            method: 'POST',
            headers: authHeaders,
            body: formData
          });
          if (phpRes.ok) {
            const resData = await phpRes.json();
            if (resData.url || resData.path) return resData.url || resData.path;
          }
        } catch (phpErr) {
          console.warn('Backend upload failed as well, falling back to base64 DataURL');
        }
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('hotel-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: any) {
      console.error('Upload helper error:', err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  // Duplicate current config
  const handleDuplicateConfiguration = () => {
    setHotelForm(prev => ({
      ...prev,
      hotel_name: `${prev.hotel_name} (Copy)`,
      hotel_code: ''
    }));
    toast({ title: 'Cloned Config', description: 'Hotel details cloned successfully. Make modifications and save as new.' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto py-2 animate-in fade-in duration-200">
      
      {/* LEFT COLUMN: WIZARD FLOW */}
      <div className="w-full lg:w-2/3 space-y-4">
        {/* Wizard Header breadcrumbs and actions */}
        <Card className="border-border/60 bg-card shadow-sm rounded-2xl">
          <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">
                <span>CRM</span>
                <span>&gt;</span>
                <span>Hotels</span>
                <span>&gt;</span>
                <span className="text-accent font-extrabold">{dialogMode === 'edit' ? 'Edit Hotel Contract' : 'Add Hotel Contract'}</span>
              </div>
              <h1 className="text-base font-extrabold text-foreground flex items-center gap-2 tracking-wide truncate">
                <Building2 className="w-5 h-5 text-accent shrink-0" />
                <span className="truncate">{dialogMode === 'edit' ? (hotelForm.hotel_name || 'Hotel Partner Contract') : 'New Hotel Partner Contract'}</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" className="h-9 px-3 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl" onClick={handleCancel}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
              </Button>
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold border-border/80 bg-background text-foreground hover:bg-muted rounded-xl" onClick={handleDuplicateConfiguration}>
                <Copy className="w-3.5 h-3.5 mr-1" /> Duplicate
              </Button>
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold border-amber-500/30 text-amber-500 hover:bg-amber-500/10 rounded-xl" onClick={() => handleSaveHotelContract(false)}>
                Save Draft
              </Button>
              <Button size="sm" className="h-9 px-4 text-xs font-extrabold bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 hover:opacity-90 shadow-md shadow-[#c5a059]/20 rounded-xl" onClick={() => handleSaveHotelContract(true)}>
                <Save className="w-3.5 h-3.5 mr-1" /> Publish Contract
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PROGRESS INDICATOR */}
        <Card className="border-border bg-card shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase mb-2">
              <span>Step {activeStep} of 7</span>
              <span>Progress: {Math.round((activeStep / 7) * 100)}%</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mb-4">
              <div className="bg-accent h-full transition-all duration-300" style={{ width: `${(activeStep / 7) * 100}%` }}></div>
            </div>
            
            <div className="flex flex-wrap justify-between items-center gap-2">
              {WIZARD_STEPS.map((stepName, idx) => {
                const stepNum = idx + 1;
                const isCurrent = activeStep === stepNum;
                const isCompleted = activeStep > stepNum;
                return (
                  <div 
                    key={stepName} 
                    className="flex items-center gap-1.5 cursor-pointer"
                    onClick={() => setActiveStep(stepNum)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent 
                        ? 'bg-accent text-slate-950 shadow-sm' 
                        : isCompleted 
                        ? 'bg-emerald-100 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
                      isCurrent ? 'text-accent dark:text-accent font-extrabold' : 'text-muted-foreground font-semibold'
                    }`}>
                      {stepName}
                    </span>
                    {idx < 6 && <ArrowRight className="w-3 h-3 text-muted-foreground/30 hidden lg:inline ml-1" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* STEP VIEWS CARD */}
        <Card className="border-border bg-card shadow-sm rounded-2xl min-h-[450px]">
          <CardContent className="p-6">
            
            {/* ---------------- STEP 1: LOCATION DETAILS ---------------- */}
            {activeStep === 1 && (
              <div className="space-y-4">
                {/* ⚡ Google Places Auto-Fetch Banner */}
                <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent rounded-xl border border-amber-500/35 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Auto-Fetch Hotel Details from Google
                    </span>
                    <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-400 font-extrabold">Google Places API Connected</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={googleSearchInput} 
                      onChange={e => setGoogleSearchInput(e.target.value)} 
                      placeholder="Paste Google Maps URL or enter Hotel Name (e.g. Alila Diwa Goa)..."
                      className="h-9 text-xs bg-background border-amber-500/30 font-medium placeholder:text-slate-400"
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={handleFetchFromGoogle}
                      disabled={isFetchingGoogleMeta}
                      className="h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-4 rounded-xl shrink-0 shadow-sm"
                    >
                      {isFetchingGoogleMeta ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                      ⚡ Fetch Details
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">Auto-populates hotel name, Google rating (e.g. 4.4★), star rating category, phone number, website URL & featured photo.</p>
                </div>

                <div className="border-b border-border pb-2.5 mb-2">
                  <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-accent" />
                    Step 1: Location & Geography
                  </h2>
                  <p className="text-[10px] text-muted-foreground">Map the hotel coordinates to destination lists for Lead/Itinerary routing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Country *</Label>
                    <Select 
                      value={hotelForm.country_id ? String(hotelForm.country_id) : ''} 
                      onValueChange={val => {
                        const countryObj = countries.find(c => String(c.id) === String(val));
                        setHotelForm(prev => ({ ...prev, country_id: val, country: countryObj?.country_name || '', state_id: '', city_id: '' }));
                      }}
                      required
                    >
                      <SelectTrigger className="bg-background border-border text-xs"><SelectValue placeholder="Select Country" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-slate-700 text-slate-100 text-xs shadow-xl">
                        {countries
                          .filter((c: any) => Boolean((c.country_name || c.name || '').trim()))
                          .map((c: any) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.country_name || c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">State / Region *</Label>
                    <Select 
                      value={hotelForm.state_id ? String(hotelForm.state_id) : ''} 
                      onValueChange={val => {
                        const stateObj = states.find(s => String(s.id) === String(val));
                        setHotelForm(prev => ({ ...prev, state_id: val, state: stateObj?.state_name || '', city_id: '' }));
                      }}
                      disabled={!hotelForm.country_id}
                      required
                    >
                      <SelectTrigger className="bg-background border-border text-xs"><SelectValue placeholder="Select State" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-slate-700 text-slate-100 text-xs shadow-xl">
                        {filteredStates
                          .filter((s: any) => Boolean((s.state_name || s.name || '').trim()))
                          .map((s: any) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.state_name || s.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Destination (Circuit / Group) *</Label>
                    <Select 
                      value={hotelForm.destination_group} 
                      onValueChange={val => setHotelForm(prev => ({ ...prev, destination_group: val }))}
                    >
                      <SelectTrigger className="bg-background border-border text-xs"><SelectValue placeholder="Circuit Group" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-slate-700 text-slate-100 text-xs shadow-xl">
                        <SelectItem value="Metro">Metro City</SelectItem>
                        {destinationGroups
                          .filter((dg: any) => Boolean((dg.name || '').trim()))
                          .map((dg: any) => (
                            <SelectItem key={dg.id} value={dg.name}>
                              {dg.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">City / Town *</Label>
                    <Select 
                      value={hotelForm.city_id ? String(hotelForm.city_id) : ''} 
                      onValueChange={val => {
                        const cityObj = cities.find(c => String(c.id) === String(val));
                        setHotelForm(prev => ({ ...prev, city_id: val, city: cityObj?.city_name || '' }));
                      }}
                      disabled={!hotelForm.state_id}
                      required
                    >
                      <SelectTrigger className="bg-background border-border text-xs"><SelectValue placeholder="Select City" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-slate-700 text-slate-100 text-xs shadow-xl">
                        {filteredCities
                          .filter((c: any) => Boolean((c.city_name || c.name || c.city || '').trim()))
                          .map((c: any) => (
                            <SelectItem key={c.id || c.city_id} value={String(c.id || c.city_id)}>
                              {c.city_name || c.name || c.city}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Area / Locality</Label>
                    <Input className="bg-background border-border text-xs" value={hotelForm.area_locality || ''} onChange={e => setHotelForm({...hotelForm, area_locality: e.target.value})} placeholder="e.g. Mall Road, Near Lake" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nearest Airport</Label>
                    <Input className="bg-background border-border text-xs" value={hotelForm.nearest_airport || ''} onChange={e => setHotelForm({...hotelForm, nearest_airport: e.target.value})} placeholder="e.g. IGI Airport (DEL)" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Nearest Railway Station</Label>
                    <Input className="bg-background border-border text-xs" value={hotelForm.nearest_railway || ''} onChange={e => setHotelForm({...hotelForm, nearest_railway: e.target.value})} placeholder="e.g. Kathgodam Station" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">Google Maps Link</Label>
                    <Input className="bg-background border-border text-xs font-mono text-accent dark:text-accent" value={hotelForm.google_maps_location || ''} onChange={e => setHotelForm({...hotelForm, google_maps_location: e.target.value})} placeholder="https://maps.google.com/?q=..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">GPS Coordinates</Label>
                    <Input className="bg-background border-border text-xs font-mono" value={hotelForm.gps_coordinates || ''} onChange={e => setHotelForm({...hotelForm, gps_coordinates: e.target.value})} placeholder="28.6139° N, 77.2090° E" />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- STEP 2: HOTEL INFORMATION ---------------- */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-border pb-2.5 mb-2">
                  <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-accent" />
                    Step 2: Core Hotel Information
                  </h2>
                  <p className="text-[10px] text-muted-foreground">Establish basic classifications, contact information, check-in policy, and policies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Hotel Name *</Label>
                    <Input className="bg-background border-border text-xs font-extrabold" value={hotelForm.hotel_name || ''} onChange={e => setHotelForm({...hotelForm, hotel_name: e.target.value})} placeholder="e.g. Oberoi Cecil Shimla" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex justify-between">
                      <span>Hotel Code</span>
                      <button type="button" onClick={handleGenerateHotelCode} className="text-[10px] text-accent dark:text-accent font-bold hover:underline">Generate</button>
                    </Label>
                    <Input className="bg-background border-border text-xs font-mono text-accent dark:text-accent" value={hotelForm.hotel_code || ''} onChange={e => setHotelForm({...hotelForm, hotel_code: e.target.value})} placeholder="Auto Generated if Blank" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Star Rating</Label>
                    <div className="flex gap-1.5 items-center h-9 bg-background border border-border rounded-lg px-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setHotelForm(prev => ({ ...prev, star_rating: star }))}
                          className="focus:outline-none"
                        >
                          <Star className={`w-4 h-4 ${hotelForm.star_rating >= star ? 'text-accent fill-accent' : 'text-muted-foreground/40'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Hotel Type</Label>
                    <Select 
                      value={hotelForm.category_id ? String(hotelForm.category_id) : ''} 
                      onValueChange={val => setHotelForm(prev => ({ ...prev, category_id: val }))}
                    >
                      <SelectTrigger className="bg-background border-border text-xs"><SelectValue placeholder="Choose Category" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-slate-700 text-slate-100 text-xs shadow-xl">
                        {hotelCategories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.category_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Google Rating (0.0 - 5.0)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      className="bg-background border-border text-xs font-semibold"
                      value={hotelForm.google_rating ?? 0}
                      onChange={e => setHotelForm(prev => ({ ...prev, google_rating: parseFloat(e.target.value) || 0 }))}
                      placeholder="e.g. 4.3"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Internal Rating (0.0 - 5.0)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      className="bg-background border-border text-xs font-semibold"
                      value={hotelForm.internal_rating ?? 0}
                      onChange={e => setHotelForm(prev => ({ ...prev, internal_rating: parseFloat(e.target.value) || 0 }))}
                      placeholder="e.g. 4.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Check-In</Label>
                      <Input type="text" className="bg-background border-border text-xs text-center font-bold" value={hotelForm.check_in_time || ''} onChange={e => setHotelForm({...hotelForm, check_in_time: e.target.value})} placeholder="12:00 PM" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Check-Out</Label>
                      <Input type="text" className="bg-background border-border text-xs text-center font-bold" value={hotelForm.check_out_time || ''} onChange={e => setHotelForm({...hotelForm, check_out_time: e.target.value})} placeholder="11:00 AM" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-3">
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold text-accent dark:text-accent uppercase tracking-wide">Contacts Info</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-slate-500 font-bold uppercase">Website</Label>
                        <Input className="bg-background border-border text-xs font-mono" value={hotelForm.website || ''} onChange={e => setHotelForm({...hotelForm, website: e.target.value})} placeholder="www.hotel.com" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-500 font-bold uppercase">Hotel Email</Label>
                        <Input className="bg-background border-border text-xs font-mono" value={hotelForm.email || ''} onChange={e => setHotelForm({...hotelForm, email: e.target.value})} placeholder="info@hotel.com" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-500 font-bold uppercase">Contract Person</Label>
                        <Input className="bg-background border-border text-xs font-semibold text-foreground" value={hotelForm.contact_person || ''} onChange={e => setHotelForm({...hotelForm, contact_person: e.target.value})} placeholder="Sales Manager" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-500 font-bold uppercase">Contract Mobile</Label>
                        <Input className="bg-background border-border text-xs font-mono" value={hotelForm.contact_number || ''} onChange={e => setHotelForm({...hotelForm, contact_number: e.target.value})} placeholder="+91 999..." />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold text-accent dark:text-accent uppercase tracking-wide">Policies & Guidelines</h3>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-slate-500 font-bold uppercase">Cancellation Policy</Label>
                      <Input className="bg-background border-border text-xs" value={hotelForm.cancellation_policy || ''} onChange={e => setHotelForm({...hotelForm, cancellation_policy: e.target.value})} placeholder="e.g. Free cancellation up to 48 hrs before arrival" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-slate-500 font-bold uppercase">Child Policy</Label>
                        <Input className="bg-background border-border text-xs" value={hotelForm.child_policy || ''} onChange={e => setHotelForm({...hotelForm, child_policy: e.target.value})} placeholder="Child below 5 free" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-500 font-bold uppercase">Extra Bed Policy</Label>
                        <Input className="bg-background border-border text-xs" value={hotelForm.extra_bed_policy || ''} onChange={e => setHotelForm({...hotelForm, extra_bed_policy: e.target.value})} placeholder="Extra bed 1500 INR" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Address Details</Label>
                  <Textarea className="bg-background border-border text-xs text-slate-900 dark:text-slate-100 font-bold focus:ring-amber-500" value={hotelForm.address || ''} onChange={e => setHotelForm({...hotelForm, address: e.target.value})} placeholder="Complete physical address..." rows={3} />
                </div>
              </div>
            )}

            {/* ---------------- STEP 3: ROOM CATEGORIES ---------------- */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-border pb-2.5 mb-2 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-accent" />
                      Step 3: Room Inventory Categories
                    </h2>
                    <p className="text-[10px] text-muted-foreground">Add multiple room inventory profiles supported by the hotel contracting module.</p>
                  </div>
                  <Button size="sm" className="h-7 text-[10px] font-bold bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 hover:opacity-90" onClick={handleAddRoomCategory}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
                  </Button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {rooms.map((room, idx) => (
                    <Card key={room.id} className="border-border bg-background p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <span className="text-xs font-extrabold text-accent dark:text-accent">Category #{idx + 1}</span>
                        <Button variant="ghost" size="sm" className="h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 px-2" onClick={() => handleRemoveRoomCategory(room.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-500 font-bold">Room Category Name *</Label>
                          <Input className="bg-background border-border text-xs font-bold text-foreground" value={room.room_category_name || ''} onChange={e => handleUpdateRoom(room.id, 'room_category_name', e.target.value)} placeholder="e.g. Premium Lake View" required />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-500 font-bold">Room Size (Sq Ft)</Label>
                          <Input className="bg-background border-border text-xs" value={room.room_size || ''} onChange={e => handleUpdateRoom(room.id, 'room_size', e.target.value)} placeholder="e.g. 350" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-500 font-bold">Bed Type</Label>
                          <Input className="bg-background border-border text-xs" value={room.bed_type || ''} onChange={e => handleUpdateRoom(room.id, 'bed_type', e.target.value)} placeholder="e.g. King Bed" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-slate-500 font-bold">Max Adults</Label>
                            <Input type="number" className="bg-background border-border text-xs" value={room.max_adults || 0} onChange={e => handleUpdateRoom(room.id, 'max_adults', parseInt(e.target.value) || 2)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-slate-500 font-bold">Max Children</Label>
                            <Input type="number" className="bg-background border-border text-xs" value={room.max_children || 0} onChange={e => handleUpdateRoom(room.id, 'max_children', parseInt(e.target.value) || 0)} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-slate-500 font-bold">Room Description</Label>
                          <Input className="bg-background border-border text-xs" value={room.room_description || ''} onChange={e => handleUpdateRoom(room.id, 'room_description', e.target.value)} placeholder="Amenities and occupancy details" />
                        </div>
                      </div>

                      {/* Room Images Section */}
                      <div className="border-t border-border pt-3 space-y-2">
                        <Label className="text-[10px] text-slate-500 font-bold uppercase block">Room Photos / Images</Label>
                        
                        <div className="flex flex-wrap gap-2 items-center">
                          {/* Thumbnail List */}
                          {parseJsonArray(room.room_images).map((imgUrl: string, imgIdx: number) => (
                            <div key={imgIdx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group bg-muted">
                              <img src={imgUrl} alt="Room" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedUrls = parseJsonArray(room.room_images).filter((_: any, i: number) => i !== imgIdx);
                                  handleUpdateRoom(room.id, 'room_images', updatedUrls);
                                }}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500" />
                              </button>
                            </div>
                          ))}

                          {/* Upload / Add Area */}
                          <div className="flex gap-2">
                            <label className="w-16 h-16 rounded-lg border border-dashed border-border hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-900/40 text-muted-foreground hover:text-foreground transition-all">
                              <Upload className="w-4 h-4 mb-0.5" />
                              <span className="text-[9px] font-bold">Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const imgUrl = await handleImageUploadHelper(file, `room-${room.id}`);
                                    if (imgUrl) {
                                      const currentImages = parseJsonArray(room.room_images);
                                      handleUpdateRoom(room.id, 'room_images', [...currentImages, imgUrl]);
                                    }
                                  }
                                }}
                              />
                            </label>
                            
                            <div className="flex flex-col justify-center space-y-1">
                              <div className="flex gap-1.5 items-center">
                                <Input 
                                  placeholder="Or paste Image URL..." 
                                  className="h-7 text-[10px] w-48 bg-background border-border" 
                                  id={`room-img-url-${room.id}`}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 text-[10px] bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90"
                                  onClick={() => {
                                    const input = document.getElementById(`room-img-url-${room.id}`) as HTMLInputElement;
                                    if (input && input.value.trim()) {
                                      const currentImages = parseJsonArray(room.room_images);
                                      handleUpdateRoom(room.id, 'room_images', [...currentImages, input.value.trim()]);
                                      input.value = '';
                                    }
                                  }}
                                >
                                  Add URL
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- STEP 4: MEAL PLANS ---------------- */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="border-b border-border pb-2.5 mb-2">
                  <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Step 4: Supported Meal Plans
                  </h2>
                  <p className="text-[10px] text-muted-foreground">Check all meal packages that are negotiated in the rates contract.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                  {MEAL_PLANS.map((mp) => {
                    const isSelected = selectedMealPlans.includes(mp.code);
                    return (
                      <div
                        key={mp.code}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMealPlans(selectedMealPlans.filter(p => p !== mp.code));
                          } else {
                            setSelectedMealPlans([...selectedMealPlans, mp.code]);
                          }
                        }}
                        className={`p-4 border rounded-2xl cursor-pointer flex justify-between items-center transition-all ${
                          isSelected
                            ? 'bg-accent/10 border-accent text-foreground shadow-sm'
                            : 'border-border bg-background text-muted-foreground hover:border-slate-400'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-extrabold text-accent dark:text-accent font-mono block mb-0.5">{mp.code}</span>
                          <span className="text-[11px] font-bold text-foreground">{mp.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-accent" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------------- STEP 5: CONTRACT RATES GRID ---------------- */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="border-b border-border pb-2.5 mb-2 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-accent" />
                      Step 5: Negotiated Contract Rates Grid
                    </h2>
                    <p className="text-[10px] text-muted-foreground">Define validity dates, season rates, GST, and profit markup.</p>
                  </div>
                  <Button size="sm" className="h-7 text-[10px] font-bold bg-accent/10 text-accent dark:text-accent border border-accent/20" onClick={handleAddSeason}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Season
                  </Button>
                </div>

                {/* Contract baseline configuration */}
                <div className="p-4 bg-[#161d2f] border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-100 shadow-xl">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[10px] text-slate-400 font-bold uppercase font-sans">Contract Name *</Label>
                    <Input className="bg-slate-900 border-slate-700 text-xs font-extrabold text-white" value={contractDetails.contract_name} onChange={e => setContractDetails({...contractDetails, contract_name: e.target.value})} placeholder="e.g. FY 2026 Direct Contract" />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[10px] text-slate-400 font-bold uppercase font-sans">Linked Supplier Agent</Label>
                    <Select value={contractDetails.supplier_id} onValueChange={val => setContractDetails({...contractDetails, supplier_id: val})}>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-xs font-bold text-amber-300"><SelectValue placeholder="Direct / None" /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-slate-700 text-slate-100 text-xs">
                        <SelectItem value="none">Direct Hotel Booking (No Supplier)</SelectItem>
                        {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.supplier_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-slate-400 font-bold uppercase font-sans">Contract Validity Start</Label>
                    <Input type="date" className="bg-slate-900 border-slate-700 text-xs font-mono font-bold text-slate-100" value={contractDetails.valid_from} onChange={e => setContractDetails({...contractDetails, valid_from: e.target.value})} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-slate-400 font-bold uppercase font-sans">Contract Validity End</Label>
                    <Input type="date" className="bg-slate-900 border-slate-700 text-xs font-mono font-bold text-slate-100" value={contractDetails.valid_to} onChange={e => setContractDetails({...contractDetails, valid_to: e.target.value})} />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[10px] text-slate-400 font-bold uppercase font-sans">Currency</Label>
                    <Select value={contractDetails.currency} onValueChange={val => setContractDetails({...contractDetails, currency: val})}>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-xs font-extrabold text-slate-100"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border border-slate-700 text-slate-100 text-xs">
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="AED">AED (Dirham)</SelectItem>
                        <SelectItem value="THB">THB (Baht)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date ranges for seasons */}
                <div className="space-y-3 p-4 border border-slate-800 rounded-2xl bg-[#161d2f] text-slate-100 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-400" /> Season Categories Validity
                    </h4>
                    <Button size="sm" className="h-7 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30" onClick={handleAddSeason}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Season
                    </Button>
                  </div>

                  {/* Header labels */}
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                    <span className="col-span-4">Season Name</span>
                    <span className="col-span-3">Category Type</span>
                    <span className="col-span-2">Start Date</span>
                    <span className="col-span-2">End Date</span>
                    <span className="col-span-1 text-center">Action</span>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {seasons.map((season) => (
                      <div key={season.id} className="grid grid-cols-12 gap-2 items-center text-xs bg-slate-900/90 p-2 rounded-xl border border-slate-700/80 hover:border-amber-500/40 transition-all">
                        <div className="col-span-4">
                          <Input className="bg-slate-950 border-slate-700 h-9 text-xs font-bold text-white placeholder:text-slate-500" value={season.name} onChange={e => handleUpdateSeason(season.id, 'name', e.target.value)} placeholder="e.g. Peak Season Surcharge" />
                        </div>
                        <div className="col-span-3">
                          <Select value={season.type} onValueChange={val => handleUpdateSeason(season.id, 'type', val)}>
                            <SelectTrigger className="bg-slate-950 border-slate-700 h-9 text-xs font-bold text-amber-300 w-full"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-slate-900 border border-slate-700 text-slate-100 text-xs">
                              <SelectItem value="Peak Season">Peak Season</SelectItem>
                              <SelectItem value="Super Peak">Super Peak</SelectItem>
                              <SelectItem value="Festive Season">Festive Season</SelectItem>
                              <SelectItem value="Normal Season">Normal Season</SelectItem>
                              <SelectItem value="Off Season">Off Season</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input type="date" className="bg-slate-950 border-slate-700 h-9 text-xs font-mono text-slate-100 w-full" value={season.start_date} onChange={e => handleUpdateSeason(season.id, 'start_date', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <Input type="date" className="bg-slate-950 border-slate-700 h-9 text-xs font-mono text-slate-100 w-full" value={season.end_date} onChange={e => handleUpdateSeason(season.id, 'end_date', e.target.value)} />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-slate-700 rounded-lg" onClick={() => handleRemoveSeason(season.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ⚡ 1-Click Auto-Apply Markup Presets */}
                <div className="p-3 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/35 rounded-xl space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 1-Click Auto-Apply Markup Engine
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-populates markups across all room grid cells</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApplyBulkMarkup('flat_400')}
                      className="h-7 text-[10px] font-bold border-amber-500/40 text-amber-300 hover:bg-amber-500/20 rounded-lg"
                    >
                      ⚡ Budget (Flat ₹400/Night)
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApplyBulkMarkup('percent_10')}
                      className="h-7 text-[10px] font-bold border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 rounded-lg"
                    >
                      ⚡ 3-Star (10%)
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApplyBulkMarkup('percent_12.5')}
                      className="h-7 text-[10px] font-bold border-blue-500/40 text-blue-300 hover:bg-blue-500/20 rounded-lg"
                    >
                      ⚡ 4-Star (12.5%)
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApplyBulkMarkup('percent_15')}
                      className="h-7 text-[10px] font-bold border-purple-500/40 text-purple-300 hover:bg-purple-500/20 rounded-lg"
                    >
                      ⚡ 5-Star Luxury (15%)
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => handleApplyBulkMarkup('auto_recommend')}
                      className="h-7 text-[10px] font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-600 border-none rounded-lg"
                    >
                      🎯 Auto-Recommend ({hotelForm.star_rating <= 2 ? 'Flat ₹400' : hotelForm.star_rating === 3 ? '10%' : hotelForm.star_rating === 4 ? '12.5%' : '15%'})
                    </Button>
                  </div>
                </div>

                {/* Interactive contract rates grid */}
                <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-[380px] overflow-y-auto bg-[#161d2f] shadow-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#0f1420] text-amber-400 font-extrabold uppercase text-[9.5px] sticky top-0 z-10 border-b border-slate-800 tracking-wider">
                      <tr>
                        <th className="p-2.5 border-b border-slate-800 min-w-[120px]">Season</th>
                        <th className="p-2.5 border-b border-slate-800 min-w-[130px]">Room Category</th>
                        <th className="p-2.5 border-b border-slate-800 font-mono min-w-[50px]">Plan</th>
                        <th className="p-2.5 border-b border-slate-800 min-w-[95px] text-center">Single Rate</th>
                        <th className="p-2.5 border-b border-slate-800 min-w-[110px] text-center text-amber-400">Double Rate *</th>
                        <th className="p-2.5 border-b border-slate-800 min-w-[105px] text-center">Triple Rate</th>
                        <th className="p-2.5 border-b border-slate-800 min-w-[95px] text-center">Extra Adult</th>
                        <th className="p-2.5 border-b border-slate-800 min-w-[95px] text-center">Child Bed</th>
                        <th className="p-2.5 border-b border-slate-800 min-w-[95px] text-center">Child No Bed</th>
                        <th className="p-2.5 border-b border-slate-800 min-w-[155px] text-center">Tax Config</th>
                        <th className="p-2.5 border-b border-slate-800 min-w-[85px] text-center">Markup</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-[#161d2f] text-slate-100">
                      {seasons.map(season => {
                        return rooms.map(room => {
                          const MEAL_PLAN_ORDER: Record<string, number> = {
                            'EP': 1,
                            'CP': 2,
                            'MAP': 3,
                            'AP': 4
                          };
                          const sortedMealPlans = [...selectedMealPlans].sort((a, b) => {
                            const orderA = MEAL_PLAN_ORDER[a.toUpperCase()] || 99;
                            const orderB = MEAL_PLAN_ORDER[b.toUpperCase()] || 99;
                            return orderA - orderB;
                          });

                          return sortedMealPlans.map(plan => {
                            const rateKey = `${season.id}-${room.id}-${plan}`;
                            const rate = gridRates[rateKey] || {
                              single_rate: '', double_rate: '', triple_rate: '',
                              extra_adult_rate: '', child_with_bed_rate: '', child_without_bed_rate: '', markup: '',
                              rate_type: 'exclusive', gst_percentage: '', is_tax_overridden: false,
                              tax_override_reason: '', tax_audit_logs: []
                            };

                            const selectedCountry = countries.find(c => c.id === hotelForm.country_id);
                            const countryName = selectedCountry?.country_name || 'India';

                            const isInclusive = rate.rate_type === 'inclusive';
                            const doubleRate = Number(rate.double_rate) || 0;
                            const autoGstPercent = getSuggestedTaxRate(countryName, doubleRate, isInclusive);
                            const gstPercent = (rate.gst_percentage !== undefined && rate.gst_percentage !== '' && rate.is_tax_overridden) 
                              ? Number(rate.gst_percentage) 
                              : autoGstPercent;

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
                              <React.Fragment key={rateKey}>
                                <tr className="hover:bg-slate-800/70 transition-colors">
                                  <td className="p-2 font-extrabold text-xs text-amber-400 min-w-[120px] whitespace-nowrap">{season.name || 'Standard'}</td>
                                  <td className="p-2 font-bold text-xs text-white min-w-[130px] whitespace-nowrap">{room.room_category_name || 'Standard Room'}</td>
                                  <td className="p-2 font-mono text-xs text-amber-300 font-black">{plan}</td>
                                  <td className="p-1">
                                    <Input type="number" className="bg-slate-900 border-slate-700 h-8 text-xs text-center px-1 font-extrabold text-slate-100 min-w-[85px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [aria-hidden]" value={rate.single_rate ?? ''} onChange={e => handleUpdateGridRate(season.id, room.id, plan, 'single_rate', parseFloat(e.target.value) || 0)} />
                                  </td>
                                  <td className="p-1">
                                    <Input type="number" className="bg-slate-900 border-amber-500/60 h-8 text-xs text-center px-1 font-black text-amber-300 shadow-md min-w-[100px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [aria-hidden]" value={rate.double_rate ?? ''} onChange={e => {
                                      const newDouble = parseFloat(e.target.value) || 0;
                                      handleUpdateGridRate(season.id, room.id, plan, 'double_rate', newDouble);
                                      const autoGst = getSuggestedTaxRate(countryName, newDouble, isInclusive);
                                      handleUpdateGridRateField(season.id, room.id, plan, 'gst_percentage', autoGst);
                                    }} />
                                  </td>
                                  <td className="p-1">
                                    <Input type="number" className="bg-slate-900 border-slate-700 h-8 text-xs text-center px-1 font-extrabold text-slate-100 min-w-[95px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [aria-hidden]" value={rate.triple_rate ?? ''} onChange={e => handleUpdateGridRate(season.id, room.id, plan, 'triple_rate', parseFloat(e.target.value) || 0)} />
                                  </td>
                                  <td className="p-1">
                                    <Input type="number" className="bg-slate-900 border-slate-700 h-8 text-xs text-center px-1 font-extrabold text-slate-100 min-w-[85px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [aria-hidden]" value={rate.extra_adult_rate ?? ''} onChange={e => handleUpdateGridRate(season.id, room.id, plan, 'extra_adult_rate', parseFloat(e.target.value) || 0)} />
                                  </td>
                                  <td className="p-1">
                                    <Input type="number" className="bg-slate-900 border-slate-700 h-8 text-xs text-center px-1 font-extrabold text-slate-100 min-w-[85px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [aria-hidden]" value={rate.child_with_bed_rate ?? ''} onChange={e => handleUpdateGridRate(season.id, room.id, plan, 'child_with_bed_rate', parseFloat(e.target.value) || 0)} />
                                  </td>
                                  <td className="p-1">
                                    <Input type="number" className="bg-slate-900 border-slate-700 h-8 text-xs text-center px-1 font-extrabold text-slate-100 min-w-[85px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [aria-hidden]" placeholder="0" value={rate.child_without_bed_rate ?? ''} onChange={e => handleUpdateGridRate(season.id, room.id, plan, 'child_without_bed_rate', parseFloat(e.target.value) || 0)} />
                                  </td>
                                  <td className="p-1 text-center min-w-[145px]">
                                    <Select 
                                      value={isInclusive ? 'inclusive' : 'exclusive'}
                                      onValueChange={(val) => {
                                        const newIsInc = val === 'inclusive';
                                        handleUpdateGridRateField(season.id, room.id, plan, 'rate_type', val);
                                        const autoGst = getSuggestedTaxRate(countryName, doubleRate, newIsInc);
                                        handleUpdateGridRateField(season.id, room.id, plan, 'gst_percentage', autoGst);
                                        handleUpdateGridRateField(season.id, room.id, plan, 'is_tax_overridden', false);
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-[10px] font-extrabold w-full bg-slate-900 border border-slate-700 text-slate-100">
                                        <SelectValue>
                                          {isInclusive ? `GST Included (${gstPercent}%)` : `GST Extra (${gstPercent}%)`}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent className="bg-slate-900 border border-slate-700 text-slate-100 text-xs">
                                        <SelectItem value="exclusive">GST Extra ({getSuggestedTaxRate(countryName, doubleRate, false)}%)</SelectItem>
                                        <SelectItem value="inclusive">GST Included ({getSuggestedTaxRate(countryName, doubleRate, true)}%)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-1">
                                    <Input type="number" className="bg-slate-900 border-slate-700 h-8 text-xs text-center px-1 text-indigo-400 font-black min-w-[75px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [aria-hidden]" value={rate.markup ?? ''} onChange={e => handleUpdateGridRate(season.id, room.id, plan, 'markup', parseFloat(e.target.value) || 0)} />
                                  </td>
                                </tr>

                                {activeRateRowKey === rateKey && (
                                  <tr className="bg-slate-900/80">
                                    <td colSpan={11} className="p-3 border-b border-slate-800">
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch text-xs p-4 bg-background border border-border rounded-xl shadow-sm w-full">
                                          
                                          {/* GST Included? Toggle */}
                                          <div className="space-y-2 flex flex-col justify-center border-r border-border/50 pr-4">
                                            <Label className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">GST Included?</Label>
                                            <div className="flex flex-col gap-2">
                                              <button 
                                                type="button"
                                                onClick={() => handleUpdateGridRateField(season.id, room.id, plan, 'rate_type', 'exclusive')}
                                                className={`px-3 py-2 text-xs font-bold border rounded-lg transition-all flex items-center gap-2 ${!isInclusive ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-extrabold' : 'bg-background border-border text-muted-foreground'}`}
                                              >
                                                <span className={`w-4 h-4 border rounded flex items-center justify-center text-[10px] ${!isInclusive ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                                                  {!isInclusive && '✓'}
                                                </span>
                                                ☐ No (GST Extra)
                                              </button>
                                              <button 
                                                type="button"
                                                onClick={() => handleUpdateGridRateField(season.id, room.id, plan, 'rate_type', 'inclusive')}
                                                className={`px-3 py-2 text-xs font-bold border rounded-lg transition-all flex items-center gap-2 ${isInclusive ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-extrabold' : 'bg-background border-border text-muted-foreground'}`}
                                              >
                                                <span className={`w-4 h-4 border rounded flex items-center justify-center text-[10px] ${isInclusive ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
                                                  {isInclusive && '✓'}
                                                </span>
                                                ☑ Yes (GST Included)
                                              </button>
                                            </div>
                                          </div>

                                          {/* GST Percentage */}
                                          <div className="space-y-2 flex flex-col justify-center border-r border-border/50 pr-4">
                                            <Label className="text-[10px] text-slate-500 font-extrabold uppercase flex justify-between tracking-wider">
                                              <span>GST Percentage (%)</span>
                                              {isTaxOverridden && (
                                                <span className="text-[8px] bg-rose-500/10 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Overridden</span>
                                              )}
                                            </Label>
                                            <div className="flex gap-1.5 items-center">
                                              <Input 
                                                type="number" 
                                                className="h-9 text-xs font-bold border-border w-20 shrink-0" 
                                                value={(rate.gst_percentage !== undefined && rate.gst_percentage !== null) ? rate.gst_percentage : ''} 
                                                placeholder={String(suggestedGst)}
                                                onChange={e => {
                                                  const newGst = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                                                  const gstVal = newGst === '' ? suggestedGst : Number(newGst);
                                                  handleUpdateGridRateField(season.id, room.id, plan, 'gst_percentage', newGst);
                                                  handleUpdateGridRateField(season.id, room.id, plan, 'is_tax_overridden', gstVal !== suggestedGst);
                                                }}
                                              />
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                type="button"
                                                className="h-9 text-[10px] px-2.5 text-muted-foreground border-border hover:bg-muted font-bold flex-1"
                                                onClick={() => {
                                                  handleUpdateGridRateField(season.id, room.id, plan, 'gst_percentage', '');
                                                  handleUpdateGridRateField(season.id, room.id, plan, 'is_tax_overridden', false);
                                                }}
                                              >
                                                Auto ({suggestedGst}%)
                                              </Button>
                                            </div>
                                          </div>

                                          {/* Premium Modern Pricing Card (Breakdown & Selling cost) */}
                                          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-950 rounded-xl p-4 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px]">
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
                                                <span className="text-emerald-400">₹{Math.round(supplierCost).toLocaleString('en-IN')}</span>
                                              </div>

                                              {rate.markup && Number(rate.markup) > 0 ? (
                                                <>
                                                  <div className="flex justify-between items-center text-slate-400">
                                                    <span>Profit Markup</span>
                                                    <span className="font-semibold text-accent/95">+₹{Math.round(Number(rate.markup)).toLocaleString('en-IN')} ({((Number(rate.markup) / supplierCost) * 100).toFixed(1)}%)</span>
                                                  </div>
                                                  <div className="flex justify-between items-center text-slate-200 font-extrabold text-[13px] border-t border-slate-600/50 pt-1.5">
                                                    <span>Selling Price</span>
                                                    <span className="text-accent">₹{Math.round(supplierCost + Number(rate.markup)).toLocaleString('en-IN')}</span>
                                                  </div>
                                                </>
                                              ) : null}
                                            </div>
                                          </div>

                                          {/* Smart Tax Indicators & Override Reason */}
                                          <div className="md:col-span-4 flex flex-col gap-2 pt-3 border-t border-border/40 w-full">
                                            <div className="flex flex-wrap gap-2">
                                              <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide ${isInclusive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600'}`}>
                                                {isInclusive ? 'GST Included' : 'GST Extra'}
                                              </Badge>
                                              <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide ${isTaxOverridden ? 'bg-rose-500/10 border-rose-500/30 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'}`}>
                                                {isTaxOverridden ? 'GST Manually Overridden' : 'GST Auto Applied'}
                                              </Badge>
                                            </div>

                                            {isTaxOverridden && (
                                              <div className="space-y-1 mt-1.5 animate-in slide-in-from-top-1 duration-150 w-full">
                                                <Label className="text-[10px] text-rose-500 font-bold uppercase block">Reason for Override *</Label>
                                                <Input 
                                                  className="h-8 text-xs border-rose-300 bg-rose-500/5 focus-visible:ring-rose-500 w-full" 
                                                  placeholder="Reason why this contract rate overrides the auto GST slabs..." 
                                                  value={rate.tax_override_reason || ''}
                                                  onChange={e => {
                                                    const reason = e.target.value;
                                                    handleUpdateGridRateField(season.id, room.id, plan, 'tax_override_reason', reason);
                                                    
                                                    const logEntry = {
                                                      entered_amount: doubleRate,
                                                      gst_included: isInclusive,
                                                      calculated_gst: gstAmt,
                                                      base_amount: netCost,
                                                      final_amount: supplierCost,
                                                      gst_percent_applied: gstPercent,
                                                      user: currentUser?.email || 'system',
                                                      timestamp: new Date().toISOString(),
                                                      override_reason: reason
                                                    };
                                                    handleUpdateGridRateField(season.id, room.id, plan, 'tax_audit_logs', [
                                                      ...(rate.tax_audit_logs || []).filter((l: any) => l.timestamp !== logEntry.timestamp),
                                                      logEntry
                                                    ]);
                                                  }}
                                                />
                                              </div>
                                            )}
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

            {/* ---------------- STEP 6: FACILITIES & MEDIA ---------------- */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="border-b border-border pb-2.5 mb-2">
                  <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-accent" />
                    Step 6: Facilities & Media Files
                  </h2>
                  <p className="text-[10px] text-muted-foreground">Map amenities and link media file assets (Featured Images, Brochure PDF, Videos).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Facilities MultiSelect */}
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-950/40 border border-border p-4 rounded-2xl flex flex-col">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                      <div>
                        <h3 className="text-xs font-bold text-accent dark:text-accent uppercase tracking-wider">
                          Choose Amenities ({selectedFacilities.length} Selected)
                        </h3>
                        <p className="text-[10px] text-muted-foreground">Select hotel amenities for customer quotes & package details</p>
                      </div>
                      
                      {/* Quick Action Presets */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            const standardIds = ['fac-wifi', 'fac-restaurant', 'fac-roomservice', 'fac-ac', 'fac-parking'];
                            const union = Array.from(new Set([...selectedFacilities, ...standardIds]));
                            setSelectedFacilities(union);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-accent/10 text-accent font-semibold hover:bg-accent/20 transition-colors"
                        >
                          + Standard 5
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFacilities(facilitiesList.map(f => f.id))}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors"
                        >
                          All
                        </button>
                        {selectedFacilities.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedFacilities([])}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 font-semibold hover:bg-rose-500/20 transition-colors"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Search / Filter Input */}
                    <div className="relative">
                      <Input
                        placeholder="Search amenities (e.g. Wi-Fi, Pool, Spa, Bar)..."
                        value={amenitySearchQuery}
                        onChange={(e) => setAmenitySearchQuery(e.target.value)}
                        className="h-8 text-xs bg-background rounded-xl pl-3 pr-8"
                      />
                      {amenitySearchQuery && (
                        <button 
                          type="button" 
                          onClick={() => setAmenitySearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Amenities Grid */}
                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {facilitiesList
                        .filter(fac => !amenitySearchQuery.trim() || fac.facility_name.toLowerCase().includes(amenitySearchQuery.toLowerCase().trim()))
                        .map((fac) => {
                          const isChecked = selectedFacilities.includes(fac.id);
                          return (
                            <div 
                              key={fac.id} 
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedFacilities(selectedFacilities.filter(id => id !== fac.id));
                                } else {
                                  setSelectedFacilities([...selectedFacilities, fac.id]);
                                }
                              }}
                              className={`p-2.5 border rounded-xl cursor-pointer flex items-center justify-between text-[11px] font-semibold transition-all select-none ${
                                isChecked 
                                  ? 'bg-accent/15 border-accent/60 text-accent font-bold shadow-sm' 
                                  : 'border-border bg-background text-foreground hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                              }`}
                            >
                              <span className="truncate pr-1">{fac.facility_name}</span>
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                                isChecked ? 'bg-accent border-accent text-slate-950' : 'border-slate-400 bg-background'
                              }`}>
                                {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Add Custom Amenity Row */}
                    <div className="flex gap-1.5 pt-1 border-t border-border/60">
                      <Input
                        placeholder="Add custom amenity (e.g. Helipad, Jacuzzi)..."
                        value={customAmenityInput}
                        onChange={(e) => setCustomAmenityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customAmenityInput.trim()) {
                              const newId = `custom-${Date.now()}`;
                              const newFac = { id: newId, facility_name: customAmenityInput.trim() };
                              setFacilitiesList(prev => [...prev, newFac]);
                              setSelectedFacilities(prev => [...prev, newId]);
                              setCustomAmenityInput('');
                            }
                          }
                        }}
                        className="h-8 text-xs bg-background rounded-xl"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (customAmenityInput.trim()) {
                            const newId = `custom-${Date.now()}`;
                            const newFac = { id: newId, facility_name: customAmenityInput.trim() };
                            setFacilitiesList(prev => [...prev, newFac]);
                            setSelectedFacilities(prev => [...prev, newId]);
                            setCustomAmenityInput('');
                          }
                        }}
                        className="h-8 text-[11px] px-3 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-xl whitespace-nowrap"
                      >
                        + Add
                      </Button>
                    </div>
                  </div>

                  {/* Media Link URLs */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Hotel Logo Upload */}
                      <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/10 border border-border p-3 rounded-2xl flex flex-col items-center justify-center min-h-[140px]">
                        <Label className="text-[10px] text-slate-500 font-bold uppercase self-start">Hotel Logo</Label>
                        
                        {mediaUrls.logo_url ? (
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group bg-background">
                            <img src={mediaUrls.logo_url} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-contain p-1" />
                            <button
                              type="button"
                              onClick={() => setMediaUrls(prev => ({ ...prev, logo_url: '' }))}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-20 h-20 rounded-xl border border-dashed border-border hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer bg-background text-muted-foreground hover:text-foreground transition-all">
                            <Upload className="w-4 h-4 mb-0.5" />
                            <span className="text-[9px] font-bold">Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const imgUrl = await handleImageUploadHelper(file, `logo-${selectedItemId || 'new'}`);
                                  if (imgUrl) setMediaUrls(prev => ({ ...prev, logo_url: imgUrl }));
                                }
                              }}
                            />
                          </label>
                        )}
                        <Input 
                          placeholder="Or paste Logo URL..." 
                          className="h-7 text-[10px] bg-background border-border w-full font-mono mt-1" 
                          value={mediaUrls.logo_url}
                          onChange={e => setMediaUrls(prev => ({ ...prev, logo_url: e.target.value }))}
                        />
                      </div>

                      {/* Featured Image Upload */}
                      <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/10 border border-border p-3 rounded-2xl flex flex-col items-center justify-center min-h-[140px]">
                        <Label className="text-[10px] text-slate-500 font-bold uppercase self-start">Featured Image</Label>
                        
                        {mediaUrls.featured_image_url ? (
                          <div className="relative w-full h-20 rounded-xl overflow-hidden border border-border group bg-background">
                            <img src={mediaUrls.featured_image_url} alt="Featured" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setMediaUrls(prev => ({ ...prev, featured_image_url: '' }))}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150"
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-20 rounded-xl border border-dashed border-border hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer bg-background text-muted-foreground hover:text-foreground transition-all">
                            <Upload className="w-4 h-4 mb-0.5" />
                            <span className="text-[9px] font-bold">Banner</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const imgUrl = await handleImageUploadHelper(file, `featured-${selectedItemId || 'new'}`);
                                  if (imgUrl) setMediaUrls(prev => ({ ...prev, featured_image_url: imgUrl }));
                                }
                              }}
                            />
                          </label>
                        )}
                        <Input 
                          placeholder="Or paste Banner URL..." 
                          className="h-7 text-[10px] bg-background border-border w-full font-mono mt-1" 
                          value={mediaUrls.featured_image_url}
                          onChange={e => setMediaUrls(prev => ({ ...prev, featured_image_url: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Brochure PDF Link */}
                    <div className="space-y-1 bg-slate-50/50 dark:bg-slate-900/10 border border-border p-3 rounded-2xl">
                      <Label className="text-[10px] text-slate-500 font-bold uppercase flex justify-between">
                        <span>Brochure PDF Link</span>
                        <label className="text-[9px] text-accent dark:text-accent font-bold hover:underline cursor-pointer">
                          Upload PDF
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const fileUrl = await handleImageUploadHelper(file, `brochure-${selectedItemId || 'new'}`);
                                if (fileUrl) setMediaUrls(prev => ({ ...prev, brochure_pdf_url: fileUrl }));
                              }
                            }}
                          />
                        </label>
                      </Label>
                      <div className="flex gap-2">
                        <Input className="bg-background border-border text-xs font-mono text-foreground h-8 flex-1" value={mediaUrls.brochure_pdf_url} onChange={e => setMediaUrls({...mediaUrls, brochure_pdf_url: e.target.value})} placeholder="https://..." />
                        {mediaUrls.brochure_pdf_url && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 text-[10px] px-2 font-bold text-accent border-border hover:bg-muted"
                              onClick={() => window.open(mediaUrls.brochure_pdf_url, '_blank')}
                            >
                              View
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 text-[10px] px-2 font-bold text-rose-600 border-border hover:bg-rose-50/10"
                              onClick={() => setMediaUrls(prev => ({ ...prev, brochure_pdf_url: '' }))}
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Gallery Upload & URL */}
                      <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-900/10 border border-border p-3 rounded-2xl">
                        <Label className="text-[10px] text-slate-500 font-bold uppercase flex justify-between">
                          <span>Gallery Photos</span>
                          <button 
                            type="button" 
                            className="text-[9px] text-accent dark:text-accent font-bold hover:underline"
                            onClick={() => {
                              if (tempGalleryUrl.trim()) {
                                setMediaUrls(prev => ({ ...prev, gallery_urls: [...prev.gallery_urls, tempGalleryUrl.trim()] }));
                                setTempGalleryUrl('');
                              }
                            }}
                          >
                            Add URL
                          </button>
                        </Label>
                        <div className="flex gap-2">
                          <label className="h-8 px-2 rounded-lg border border-dashed border-border hover:border-slate-400 flex items-center justify-center cursor-pointer bg-background text-muted-foreground hover:text-foreground transition-all shrink-0">
                            <Upload className="w-3.5 h-3.5 mr-1" />
                            <span className="text-[10px] font-bold">Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const imgUrl = await handleImageUploadHelper(file, `gallery-${selectedItemId || 'new'}`);
                                  if (imgUrl) {
                                    setMediaUrls(prev => ({ ...prev, gallery_urls: [...prev.gallery_urls, imgUrl] }));
                                  }
                                }
                              }}
                            />
                          </label>
                          <Input className="bg-background border-border h-8 text-[11px] font-mono text-foreground flex-1" value={tempGalleryUrl} onChange={e => setTempGalleryUrl(e.target.value)} placeholder="Or paste link..." />
                        </div>
                        {mediaUrls.gallery_urls.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 max-h-[120px] overflow-y-auto p-1 bg-background rounded-xl border border-border/50">
                            {mediaUrls.gallery_urls.map((gUrl, idx) => (
                              <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border group bg-muted shrink-0 animate-in zoom-in-95 duration-150">
                                <img src={gUrl} alt={`Gallery ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setMediaUrls(prev => ({ ...prev, gallery_urls: prev.gallery_urls.filter((_, i) => i !== idx) }))}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Video Links */}
                      <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-900/10 border border-border p-3 rounded-2xl">
                        <Label className="text-[10px] text-slate-500 font-bold uppercase flex justify-between">
                          <span>Video Links</span>
                          <button 
                            type="button" 
                            className="text-[9px] text-accent dark:text-accent font-bold hover:underline"
                            onClick={() => {
                              if (tempVideoUrl.trim()) {
                                setMediaUrls(prev => ({ ...prev, video_urls: [...prev.video_urls, tempVideoUrl.trim()] }));
                                setTempVideoUrl('');
                              }
                            }}
                          >
                            Add URL
                          </button>
                        </Label>
                        <div className="flex gap-2">
                          <Input className="bg-background border-border h-8 text-[11px] font-mono text-foreground flex-1" value={tempVideoUrl} onChange={e => setTempVideoUrl(e.target.value)} placeholder="YouTube / Vimeo Link" />
                        </div>
                        {mediaUrls.video_urls.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2 max-h-16 overflow-y-auto">
                            {mediaUrls.video_urls.map((vUrl, idx) => (
                              <Badge key={idx} variant="outline" className="text-[9px] bg-background border-border text-foreground px-1.5 py-0.5 flex items-center gap-1 font-mono">
                                <span className="truncate max-w-[80px]" title={vUrl}>Video #{idx + 1}</span>
                                <a href={vUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">↗</a>
                                <button type="button" className="text-rose-600 font-bold ml-1 hover:text-rose-700" onClick={() => setMediaUrls(prev => ({ ...prev, video_urls: prev.video_urls.filter((_, i) => i !== idx) }))}>x</button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- STEP 7: REVIEW & PUBLISH ---------------- */}
            {activeStep === 7 && (
              <div className="space-y-4">
                <div className="border-b border-border pb-2.5 mb-2">
                  <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Step 7: Final Contract Verification
                  </h2>
                  <p className="text-[10px] text-muted-foreground">Validate the compiled metadata structures before publishing the live rates.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950/40 border border-border rounded-2xl">
                    <h3 className="font-extrabold text-accent dark:text-accent text-xs uppercase">1. Location Details</h3>
                    <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Hotel Name:</strong> {hotelForm.hotel_name || 'N/A'}</p>
                    <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Star Class:</strong> {hotelForm.star_rating} Star</p>
                    <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Circuit Group:</strong> {hotelForm.destination_group}</p>
                    <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Full Address:</strong> {hotelForm.address || 'N/A'}</p>
                    <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Contact Person:</strong> {hotelForm.contact_person || 'N/A'} ({hotelForm.contact_number || 'N/A'})</p>
                  </div>

                  <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950/40 border border-border rounded-2xl">
                    <h3 className="font-extrabold text-accent dark:text-accent text-xs uppercase">2. Contract Summary</h3>
                    <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Room Categories:</strong> {rooms.length} Categories configured</p>
                    <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Meal Packages:</strong> {selectedMealPlans.join(', ')}</p>
                    <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Active Seasons:</strong> {seasons.length} Seasons defined</p>
                    <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Rates Grid Entries:</strong> {seasons.length * rooms.length * selectedMealPlans.length} Combination Cells</p>
                    <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Linked Supplier:</strong> {contractDetails.supplier_id === 'none' ? 'Direct Negotiation' : suppliers.find(s => s.id === contractDetails.supplier_id)?.supplier_name || 'DMC'}</p>
                  </div>

                  <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950/40 border border-border rounded-2xl">
                    <h3 className="font-extrabold text-accent dark:text-accent text-xs uppercase">3. Media & Facilities</h3>
                    <div className="space-y-1">
                      <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Logo Status:</strong> {mediaUrls.logo_url ? 'Configured' : 'None'}</p>
                      <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Featured Image:</strong> {mediaUrls.featured_image_url ? 'Configured' : 'None'}</p>
                      <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Gallery Photos:</strong> {mediaUrls.gallery_urls.length} Images</p>
                      <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Brochure PDF:</strong> {mediaUrls.brochure_pdf_url ? 'Yes' : 'No'}</p>
                      <p className="text-foreground"><strong className="text-muted-foreground font-semibold">Video Links:</strong> {mediaUrls.video_urls.length} Links</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 border border-accent/20 text-accent dark:text-accent rounded-2xl flex gap-2 items-start text-[11px] font-bold">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                  <div>
                    <p className="font-extrabold mb-1">Contract Validity Terms</p>
                    <p className="text-slate-600 dark:text-slate-400">By publishing, the negotiated contract rates will instantly become discoverable to Lead filters, Package generators, and the live Itinerary Builder. Click "Save Draft" to keep this contract hidden from operational workspaces.</p>
                  </div>
                </div>
              </div>
            )}
            
          </CardContent>
          
          {/* Wizard Navigation Footer */}
          <div className="border-t border-border p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 rounded-b-2xl">
            <Button
              variant="outline"
              size="sm"
              disabled={activeStep === 1}
              className="bg-background border-border text-foreground hover:bg-muted"
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
            >
              Previous Step
            </Button>

            {activeStep < 7 ? (
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-bold hover:opacity-90"
                onClick={() => setActiveStep(prev => Math.min(7, prev + 1))}
              >
                Next Step <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-slate-950 font-extrabold hover:opacity-90 uppercase px-6"
                disabled={loading}
                onClick={() => handleSaveHotelContract(true)}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                Publish Live Contract
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* RIGHT COLUMN: STICKY COSTING SUMMARY PANEL */}
      <div className="w-full lg:w-1/3 lg:shrink-0">
        <div className="lg:sticky lg:top-4 space-y-4">
          
          {/* Dynamic costing panel */}
          <Card className="border border-slate-800 bg-[#161d2f] text-slate-100 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#0f1420] p-4 border-b border-slate-800">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-amber-400" />
                  Hotel Costing Panel
                </CardTitle>
                <Badge variant="outline" className={`text-[9px] font-extrabold px-2 py-0.5 ${costing.gstSlabColor}`}>
                  {costing.gstSlabBadge}
                </Badge>
              </div>
              <CardDescription className="text-[10px] text-slate-400 mt-1">
                Real-time pricing metrics & GST calculation across double occupancy rates.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4 text-xs">

              {/* 🧮 INTERACTIVE SCENARIO SIMULATOR BAR */}
              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[9px] font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Rate Scenario Simulator
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold block mb-0.5">Season</label>
                    <select 
                      value={selectedScenarioSeason} 
                      onChange={e => setSelectedScenarioSeason(e.target.value)}
                      className="w-full h-7 bg-slate-950 border border-slate-800 rounded px-1 text-[10px] text-slate-200"
                    >
                      <option value="all">All Seasons</option>
                      {seasons.map(s => <option key={s.id} value={s.id}>{s.name || 'Season'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold block mb-0.5">Room</label>
                    <select 
                      value={selectedScenarioRoom} 
                      onChange={e => setSelectedScenarioRoom(e.target.value)}
                      className="w-full h-7 bg-slate-950 border border-slate-800 rounded px-1 text-[10px] text-slate-200"
                    >
                      <option value="all">All Rooms</option>
                      {rooms.map(r => <option key={r.id} value={r.id}>{r.room_category_name || 'Room'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold block mb-0.5">Meal Plan</label>
                    <select 
                      value={selectedScenarioMealPlan} 
                      onChange={e => setSelectedScenarioMealPlan(e.target.value)}
                      className="w-full h-7 bg-slate-950 border border-slate-800 rounded px-1 text-[10px] text-slate-200"
                    >
                      <option value="all">All Plans</option>
                      {selectedMealPlans.map(mp => <option key={mp} value={mp}>{mp}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Rate Range */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl">
                  <span className="block text-[9px] uppercase font-extrabold text-slate-400 tracking-wide mb-0.5">Lowest Base Rate</span>
                  <span className="text-xs font-extrabold text-emerald-400">{contractDetails.currency} {costing.lowest.toLocaleString()}</span>
                </div>
                <div className="p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl">
                  <span className="block text-[9px] uppercase font-extrabold text-slate-400 tracking-wide mb-0.5">Highest Base Rate</span>
                  <span className="text-xs font-extrabold text-rose-400">{contractDetails.currency} {costing.highest.toLocaleString()}</span>
                </div>
              </div>

              {/* Step-by-Step Costing Formula */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center text-slate-300 font-bold">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    1. Avg Base Cost
                  </span>
                  <span className="font-mono text-slate-100 font-extrabold">{contractDetails.currency} {Math.round(costing.averageBase).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300 font-bold">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    2. Est. GST Tax (Avg)
                  </span>
                  <span className="font-mono text-amber-400 font-extrabold">+{contractDetails.currency} {Math.round(costing.averageGST).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-slate-200 font-extrabold bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/80">
                  <span className="text-[11px] text-slate-300">Supplier B2B Cost</span>
                  <span className="font-mono text-emerald-400">{contractDetails.currency} {Math.round(costing.supplierCost).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300 font-bold">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    3. Agent Profit Markup
                  </span>
                  <span className="font-mono text-indigo-400 font-extrabold">+{contractDetails.currency} {Math.round(costing.markup).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center border-t-2 border-amber-500/40 pt-2.5 text-sm font-black">
                  <span className="text-amber-400 uppercase tracking-wide">Final Selling Price</span>
                  <span className="font-mono text-white text-base font-black">{contractDetails.currency} {Math.round(costing.selling).toLocaleString()}</span>
                </div>
              </div>

              {/* Profit Margin Badge */}
              <div className={`p-3 rounded-xl flex justify-between items-center text-[11px] font-bold border ${
                costing.margin > 15 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : costing.margin >= 5 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <span className="uppercase tracking-wide flex items-center gap-1.5 font-extrabold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Profit Margin
                  <span className="text-[9px] opacity-80 font-normal">
                    ({costing.margin > 15 ? 'High Yield' : costing.margin >= 5 ? 'Standard' : 'Low Margin Alert'})
                  </span>
                </span>
                <span className="font-mono text-xs font-black">{costing.margin.toFixed(1)}%</span>
              </div>

              {/* Calculation Formula Breakdown Note */}
              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1.5">
                <p className="font-extrabold text-amber-400 flex items-center gap-1 uppercase tracking-wider text-[9px]">
                  <Info className="w-3 h-3 text-amber-400 shrink-0" /> Exact Price Logic:
                </p>
                <p className="font-mono text-[9.5px] leading-relaxed text-slate-300">
                  Base ({contractDetails.currency} {Math.round(costing.averageBase)}) + GST ({contractDetails.currency} {Math.round(costing.averageGST)}) + Markup ({contractDetails.currency} {Math.round(costing.markup)}) = <span className="text-amber-400 font-bold">Selling Price ({contractDetails.currency} {Math.round(costing.selling)})</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info card */}
          <Card className="border border-slate-800 bg-[#161d2f] text-slate-300 p-4 rounded-2xl text-[11px] leading-relaxed">
            <h4 className="font-extrabold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Info className="w-3.5 h-3.5 text-amber-400" /> Operational Context</h4>
            Once published, these rates will be automatically queried by the Itinerary Builder and Quotation generators whenever they match the selected Room Category and Meal Plan during validity dates.
          </Card>

        </div>
      </div>
    </div>
  );
};
