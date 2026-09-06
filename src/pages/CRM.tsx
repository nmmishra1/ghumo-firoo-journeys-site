// Updated CRM module - clean HMR reload
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate, useLocation, useParams, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, Edit, Phone, Mail, Users, TrendingUp, MessageCircle, UserPlus, 
  Filter, Search, Upload, AlertTriangle, User, Clock, LayoutDashboard, 
  UserCheck, ChevronDown, Calendar, MapPin, Menu, Home, Hotel, LogOut, 
  ChevronRight, ArrowLeft, Send, CheckCircle2, Shield, Info, Landmark, 
  Sparkles, FileText, Share2, IndianRupee, MessageSquare, Globe, Package, Activity, Map, Eye, Trash2,
  Car, Star, FileSpreadsheet, UploadCloud, ShieldCheck, DollarSign, Zap, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { leadService } from '@/services/leadService';
import { reviewService } from '@/services/reviewService';
import { quoteService } from '@/services/quoteService';
import { CommentsDialog } from '@/components/crm/CommentsDialog';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { UserManagementDialog } from '@/components/crm/UserManagementDialog';
import LeadForm from '@/components/crm/LeadForm';
import { CSVImport } from '@/components/crm/CSVImport';
import { FollowUpModal } from '@/components/crm/FollowUpModal';
import { DeleteLeadModal } from '@/components/crm/DeleteLeadModal';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { ItineraryWorkspace } from '@/components/crm/ItineraryWorkspace';
import LazyImage from '@/components/ui/LazyImage';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Breadcrumb from '@/components/Breadcrumb';
import { fetchCachedJson } from '@/utils/crmCache';
import { INDIAN_STATES, CANONICAL_COUNTRIES, isStateInIndia } from '@/data/geographyMaster';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

import OpportunityKanban from '@/pages/crm/OpportunityKanban';
import QuoteWorkspace from '@/pages/crm/QuoteWorkspace';
import { DestinationManagement } from '@/pages/crm/DestinationManagement';
import { HotelContracting } from '@/pages/crm/HotelContracting';
import ReviewModeration from '@/components/crm/ReviewModeration';
import { EmailMarketingHub } from '@/components/crm/EmailMarketingHub';
import CabContracting from '@/pages/crm/CabContracting';
import ItineraryBuilder from '@/pages/crm/ItineraryBuilder';
import LeadProposalsWorkspace from '@/pages/crm/LeadProposalsWorkspace';
import ActivityMaster from '@/pages/crm/ActivityMaster';
import SightseeingMaster from '@/pages/crm/SightseeingMaster';
import VisaMaster from '@/pages/crm/VisaMaster';
import IndiaExplorer from '@/pages/crm/IndiaExplorer';
import PackageMaster from '@/pages/crm/PackageMaster';
import BlogMaster from '@/pages/crm/BlogMaster';
import BulkUploadHub from '@/pages/crm/BulkUploadHub';
import AuditLogsViewer from '@/pages/crm/AuditLogsViewer';
import AgentRoleManagement from '@/pages/crm/AgentRoleManagement';

const NavyGoldLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-[#0B1026] rounded-2xl p-8 border border-[#C9A25A]/20">
    <div className="text-[#C9A25A] font-display text-lg animate-pulse flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A25A]"></div>
      <span>Loading...</span>
    </div>
  </div>
);
import { Building2, Layers, ArrowRight } from 'lucide-react';

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
  lead_destination?: string[] | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  source?: string | null;
  notes?: string | null;
  discussions?: any;
  agent_name?: string | null;
  lead_id?: string | null;
};

type Profile = {
  id: string;
  full_name: string;
  role: string;
  approved: boolean;
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

const CRM = () => {
  const { leadId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Mock Customers
  const [customers, setCustomers] = useState([
    { id: '1', name: 'Raj Sharma', mobile: '+91 98765 43210', email: 'raj.sharma@gmail.com', home_city: 'Delhi', total_leads: 3, total_bookings: 1 },
    { id: '2', name: 'Amit Patel', mobile: '+91 91234 56789', email: 'amit.patel@yahoo.com', home_city: 'Mumbai', total_leads: 1, total_bookings: 0 },
    { id: '3', name: 'Neha Gupta', mobile: '+91 99887 76655', email: 'neha.gupta@outlook.com', home_city: 'Bangalore', total_leads: 2, total_bookings: 0 }
  ]);

  // Mock Opportunities
  const [opportunities, setOpportunities] = useState<any[]>([
    { id: '1', leadId: '1', customerName: 'Raj Sharma', destination: 'Singapore', expectedRevenue: 114000, probability: 80, stage: 'Negotiation', owner: 'Test Admin User', nextFollowup: '2026-07-20', createdAt: '2026-07-16' },
    { id: '2', leadId: '2', customerName: 'Amit Patel', destination: 'Kashmir', expectedRevenue: 75000, probability: 50, stage: 'Quote Sent', owner: 'Test Agent One', nextFollowup: '2026-07-22', createdAt: '2026-07-15' },
    { id: '3', leadId: '3', customerName: 'Neha Gupta', destination: 'Dubai', expectedRevenue: 95000, probability: 20, stage: 'Contacted', owner: 'Test Agent Two', nextFollowup: '2026-07-18', createdAt: '2026-07-16' }
  ]);

  // Mock Quotes
  const [quotes, setQuotes] = useState<any[]>([
    {
      id: '1',
      quoteNumber: 'QT-2026-001',
      customerName: 'Raj Sharma',
      destination: 'Singapore',
      leadCities: ['Singapore', 'Sentosa'],
      currentVersion: 3,
      status: 'Accepted',
      decisionStatus: 'Confirmed',
      versions: [
        {
          id: '1a',
          versionNumber: 1,
          totalCost: 90000,
          margin: 10,
          sellingPrice: 98000,
          status: 'Revised',
          createdBy: 'Test Admin User',
          createdAt: '2026-07-16 10:40 AM',
          items: [
            { type: 'hotel', name: 'Hotel Boss Singapore', detail: 'Standard Room, Breakfast Incl.', qty: 4, rate: 12000, total: 48000 },
            { type: 'excursion', name: 'Universal Studios Singapore', detail: '1-Day Admission Ticket', qty: 2, rate: 6000, total: 12000 },
            { type: 'transfer', name: 'Private Airport Transfers', detail: 'Changi Airport to Hotel Return', qty: 2, rate: 2500, total: 5000 },
            { type: 'visa', name: 'Singapore Entry Visa', detail: 'Single Entry Tourist Visa', qty: 2, rate: 3500, total: 7000 },
            { type: 'meal', name: 'Indian Buffet Lunches', detail: 'Local Indian Restaurant Coupon', qty: 4, rate: 4500, total: 18000 }
          ]
        },
        {
          id: '1b',
          versionNumber: 2,
          totalCost: 98000,
          margin: 10,
          sellingPrice: 108000,
          status: 'Revised',
          createdBy: 'Test Admin User',
          createdAt: '2026-07-16 11:22 AM',
          items: [
            { type: 'hotel', name: 'Marina Bay Sands Singapore', detail: 'Deluxe Tower Room, Skyline View', qty: 4, rate: 14500, total: 58000 },
            { type: 'excursion', name: 'Universal Studios Singapore', detail: '1-Day Admission Ticket', qty: 2, rate: 6000, total: 12000 },
            { type: 'transfer', name: 'Private Airport Transfers', detail: 'Changi Airport to Hotel Return', qty: 2, rate: 2500, total: 5000 },
            { type: 'visa', name: 'Singapore Entry Visa', detail: 'Single Entry Tourist Visa', qty: 2, rate: 3500, total: 7000 },
            { type: 'meal', name: 'Indian Buffet Lunches', detail: 'Local Indian Restaurant Coupon', qty: 4, rate: 4500, total: 18000 }
          ]
        },
        {
          id: '1c',
          versionNumber: 3,
          totalCost: 104000,
          margin: 10,
          sellingPrice: 114000,
          status: 'Accepted',
          createdBy: 'Test Admin User',
          createdAt: '2026-07-16 02:40 PM',
          items: [
            { type: 'hotel', name: 'Marina Bay Sands Singapore', detail: 'Deluxe Tower Room, Skyline View', qty: 4, rate: 14500, total: 58000 },
            { type: 'excursion', name: 'Universal Studios Singapore', detail: '1-Day Admission Ticket', qty: 2, rate: 6000, total: 12000 },
            { type: 'excursion', name: 'Private Luxury Yacht Cruise', detail: '4-Hour Yacht Charter, Marina South', qty: 1, rate: 12000, total: 12000 },
            { type: 'transfer', name: 'Private Airport Transfers', detail: 'Changi Airport to Hotel Return', qty: 2, rate: 2500, total: 5000 },
            { type: 'visa', name: 'Singapore Entry Visa', detail: 'Single Entry Tourist Visa', qty: 2, rate: 3500, total: 7000 },
            { type: 'meal', name: 'Indian Buffet Lunches', detail: 'Local Indian Restaurant Coupon', qty: 4, rate: 4500, total: 18000 }
          ]
        }
      ]
    },
    {
      id: '2',
      quoteNumber: 'QT-2026-002',
      customerName: 'Amit Patel',
      destination: 'Kashmir',
      leadCities: ['Gulmarg', 'Pahalgam', 'Srinagar'],
      currentVersion: 1,
      status: 'Sent',
      decisionStatus: 'Thinking',
      versions: [
        {
          id: '2a',
          versionNumber: 1,
          totalCost: 68000,
          margin: 10,
          sellingPrice: 75000,
          status: 'Draft',
          createdBy: 'Test Agent One',
          createdAt: '2026-07-15 11:45 AM',
          items: [
            { type: 'hotel', name: 'The Khyber Resort Gulmarg', detail: 'Premier Pine View Room', qty: 3, rate: 15000, total: 45000 },
            { type: 'transfer', name: 'Toyota Innova Private Cab', detail: 'Srinagar airport transfer & sightseeing', qty: 5, rate: 4000, total: 20000 },
            { type: 'meal', name: 'Authentic Kashmiri Wazwan Dinner', detail: 'Lal Chowk Restaurant Coupon', qty: 2, rate: 5000, total: 10000 }
          ]
        }
      ]
    }
  ]);

  // Mock Timeline Events
  const [timelineEvents, setTimelineEvents] = useState<any[]>([
    { id: '1', time: '10:15 AM', type: 'creation', title: 'Lead Created', description: 'Raj Sharma submitted a Singapore travel request from the website form.', agent: 'System' },
    { id: '2', time: '10:22 AM', type: 'call', title: 'Called Customer', description: 'Discussed Singapore preferences. Customer requested premium MBS stay instead of Hotel Boss.', agent: 'Test Admin User', duration: '7 mins' },
    { id: '3', time: '10:40 AM', type: 'quote', title: 'Quote V1 Prepared', description: 'Prepared initial quote V1 with Hotel Boss (₹98,000).', agent: 'Test Admin User', badge: 'QT-2026-001' },
    { id: '4', time: '11:22 AM', type: 'revision', title: 'Quote V2 Revised', description: 'Revised quote to V2 changing accommodation to Marina Bay Sands (₹1,08,000).', agent: 'Test Admin User', badge: 'QT-2026-001' },
    { id: '5', time: '11:25 AM', type: 'whatsapp', title: 'WhatsApp Shared', description: 'Shared Quote V2 PDF on client mobile (+91 98765 43210). Status: Delivered.', agent: 'System' },
    { id: '6', time: '02:40 PM', type: 'revision', title: 'Quote V3 Created', description: 'Added 4-Hour Private Luxury Yacht Cruise (₹1,14,000).', agent: 'Test Admin User', badge: 'QT-2026-001' },
    { id: '7', time: '04:15 PM', type: 'booking', title: 'Quote Accepted & Booking Confirmed', description: 'Customer approved Quote V3. Converted lead to confirmed booking.', agent: 'Test Admin User', badge: 'Confirmed' }
  ]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [showPackagesPanel, setShowPackagesPanel] = useState(false);

  // Lead Deletion States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeletedLeads, setShowDeletedLeads] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterDestination, setFilterDestination] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterAssignedTo, setFilterAssignedTo] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTravelDate, setFilterTravelDate] = useState('');

  const crmCountryOptions = React.useMemo(() => {
    const set = new Set<string>(CANONICAL_COUNTRIES);
    leads.forEach(l => {
      if (l.country) set.add(l.country);
    });
    return Array.from(set).sort();
  }, [leads]);

  const crmFilterStateOptions = React.useMemo(() => {
    if (filterCountry.toLowerCase() === 'india') {
      return INDIAN_STATES;
    }
    if (filterCountry === 'all') {
      const allStatesSet = new Set<string>(INDIAN_STATES);
      leads.forEach(l => {
        if (l.state) allStatesSet.add(l.state);
      });
      return Array.from(allStatesSet).sort();
    }
    const set = new Set<string>();
    leads.filter(l => (l.country || '').toLowerCase() === filterCountry.toLowerCase() && l.state).forEach(l => set.add(l.state!));
    return Array.from(set).sort();
  }, [filterCountry, leads]);

  const crmFilterDestinationOptions = React.useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => {
      if (filterCountry !== 'all' && (l.country || '').toLowerCase() !== filterCountry.toLowerCase()) return;
      if (filterState !== 'all' && (l.state || '').toLowerCase() !== filterState.toLowerCase()) return;
      if (l.destinations) {
        l.destinations.split(/[,+]/).map(d => d.trim()).filter(Boolean).forEach(d => set.add(d));
      }
    });
    return Array.from(set).sort();
  }, [filterCountry, filterState, leads]);

  const handleCrmCountryChange = (val: string) => {
    setFilterCountry(val);
    setFilterState('all');
    setFilterDestination('all');
  };

  const handleCrmStateChange = (val: string) => {
    setFilterState(val);
    setFilterDestination('all');
  };

  // Dialog & Modal states
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedLeadForComments, setSelectedLeadForComments] = useState<{ id: string; name: string } | null>(null);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState<{ id: string; name: string } | null>(null);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  
  // Lead logs / inline timeline state inside profile page
  const [timelineNote, setTimelineNote] = useState('');
  const [timelineType, setTimelineType] = useState<'note' | 'call' | 'whatsapp' | 'email'>('note');

  // Proposal form state
  const [proposalTemplate, setProposalTemplate] = useState('Classic Tour');
  const [proposalCost, setProposalCost] = useState('');
  const [proposalRemarks, setProposalRemarks] = useState('');

  // Itinerary states
  const [activeItinerary, setActiveItinerary] = useState<any>(null);
  const [itineraryDays, setItineraryDays] = useState<any[]>([]);
  const [itineraryHotels, setItineraryHotels] = useState<Record<string, any>>({});
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [activeItineraryRoomsList, setActiveItineraryRoomsList] = useState<Record<string, any[]>>({});
  const [activeItineraryHotelsList, setActiveItineraryHotelsList] = useState<Record<string, any[]>>({});

  // Recommendations state
  const [recommendedHotels, setRecommendedHotels] = useState<any[]>([]);
  const [recommendedActivities, setRecommendedActivities] = useState<any[]>([]);
  const [recommendedRoutes, setRecommendedRoutes] = useState<any[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Cab transport states
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [routesList, setRoutesList] = useState<any[]>([]);
  const [itineraryTransports, setItineraryTransports] = useState<Record<string, any>>({});

  // Travel Inventory States
  const [dashboardPackages, setDashboardPackages] = useState<any[]>([]);
  const [dashboardHotels, setDashboardHotels] = useState<any[]>([]);
  const [dashboardBlogs, setDashboardBlogs] = useState<any[]>([]);
  const [dashboardReviews, setDashboardReviews] = useState<any[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<{
    packages_count: number;
    hotels_count: number;
    blogs_count: number;
    reviews_count: number;
  }>({ packages_count: 0, hotels_count: 0, blogs_count: 0, reviews_count: 0 });

  const fetchDashboardInventory = async () => {
    try {
      const data = await fetchCachedJson(`${API_BASE}/dashboard_bootstrap.php`);
      if (data && data.success) {
        if (data.summary) {
          setDashboardSummary({
            packages_count: typeof data.summary.packages_count === 'number' ? data.summary.packages_count : 0,
            hotels_count: typeof data.summary.hotels_count === 'number' ? data.summary.hotels_count : 0,
            blogs_count: typeof data.summary.blogs_count === 'number' ? data.summary.blogs_count : 0,
            reviews_count: typeof data.summary.reviews_count === 'number' ? data.summary.reviews_count : 0
          });
        }
        if (Array.isArray(data.recent_leads) && data.recent_leads.length > 0) {
          setLeads(prev => prev.length === 0 ? data.recent_leads : prev);
        }
        if (Array.isArray(data.users) && data.users.length > 0) {
          const mappedProfiles: Profile[] = data.users.map((p: any) => ({
            id: p.id,
            full_name: p.full_name || 'Unknown',
            role: p.role?.toLowerCase().includes('admin') ? 'admin' : (p.role || 'Agent'),
            approved: true
          }));
          setProfiles(mappedProfiles);
        }
      }
    } catch (err) {
      console.error('Error fetching consolidated dashboard bootstrap:', err);
    }
  };

  // Mock payments and documents states for profile tabs
  const [mockPayments, setMockPayments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilterMode, setPaymentFilterMode] = useState('all');
  const [mockDocuments, setMockDocuments] = useState<any[]>([]);
  const [mockFollowups, setMockFollowups] = useState<any[]>([]);
  const [tripHistory, setTripHistory] = useState<any[]>([]);
  const [isRepeatCustomer, setIsRepeatCustomer] = useState<boolean>(false);
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [newDocumentName, setNewDocumentName] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchAllPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch('/php-backend/api.php?table=payments');
      if (!res.ok) throw new Error('Failed to fetch all payments');
      const data = await res.json();
      setAllPayments(data || []);
    } catch (err) {
      console.error('Error fetching all payments:', err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const [ratesData, setRatesData] = useState<any>({ hotels: [], cabs: [], activities: [] });
  const [ratesLoading, setRatesLoading] = useState(false);

  // Date range filters for funnel reports
  const [reportsStartDate, setReportsStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [reportsEndDate, setReportsEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Rate overview filters
  const [rateCityFilter, setRateCityFilter] = useState<string>('all');
  const [rateTypeFilter, setRateTypeFilter] = useState<string>('all');
  const [rateSearchTerm, setRateSearchTerm] = useState<string>('');

  const fetchRatesData = async () => {
    setRatesLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/php-backend/reports.php?type=rates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch reports rates');
      const data = await res.json();
      setRatesData(data || { hotels: [], cabs: [], activities: [] });
    } catch (err) {
      console.error('Error fetching rates for reporting:', err);
    } finally {
      setRatesLoading(false);
    }
  };

  const fetchLeadPaymentsAndDocuments = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // 1. Try consolidated single-roundtrip lead details endpoint first
      try {
        const res = await fetch(`/php-backend/lead_details.php?id=${encodeURIComponent(id)}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const mappedPayments = (data.payments || []).map((p: any) => ({
              id: p.id,
              date: p.payment_date,
              desc: p.remarks || 'Payment Entry',
              mode: p.payment_mode,
              amount: Number(p.amount_received),
              ref: p.reference_number || '',
              status: p.status || 'Success',
              receivedBy: p.received_by || ''
            }));

            const mappedDocuments = (data.documents || []).map((d: any) => ({
              id: d.id,
              name: d.name,
              type: d.type,
              size: d.size,
              uploadedBy: d.uploaded_by || 'Agent',
              date: d.uploaded_at ? d.uploaded_at.split('T')[0] : new Date().toISOString().split('T')[0],
              fileUrl: d.file_url || ''
            }));

            const mappedFollowups = (data.followups || []).map((f: any) => ({
              id: f.id,
              timestamp: f.timestamp || f.date || new Date().toISOString(),
              date: f.date || f.timestamp || new Date().toISOString(),
              agent: f.agent || 'Agent',
              type: f.type || 'note',
              stage: f.type || 'Note',
              remarks: f.remarks || f.content || '',
              content: f.remarks || f.content || ''
            }));

            setMockPayments(mappedPayments);
            setMockDocuments(mappedDocuments);
            setMockFollowups(mappedFollowups);
            setTripHistory(data.trip_history || []);
            setIsRepeatCustomer(Boolean(data.is_repeat_customer));

            if (data.recommendations) {
              setRecommendedHotels(data.recommendations.hotels || []);
              setRecommendedActivities(data.recommendations.activities || []);
              setRecommendedRoutes(data.recommendations.cab_routes || []);
            }
            return;
          }
        }
      } catch (cErr) {
        console.warn('Consolidated lead details fetch warning, using fallback:', cErr);
      }

      // Fallback: Individual queries if consolidated endpoint is not available
      const payRes = await fetch(`/php-backend/api.php?table=payments&lead_id=${encodeURIComponent(id)}`, { headers });
      const payData = payRes.ok ? await payRes.json() : [];
      
      const docRes = await fetch(`/php-backend/api.php?table=documents&lead_id=${encodeURIComponent(id)}`, { headers });
      const docData = docRes.ok ? await docRes.json() : [];

      setMockPayments((payData || []).map((p: any) => ({
        id: p.id, date: p.payment_date, desc: p.remarks || 'Payment Entry', mode: p.payment_mode,
        amount: Number(p.amount_received), ref: p.reference_number || '', status: p.status || 'Success', receivedBy: p.received_by || ''
      })));

      setMockDocuments((docData || []).map((d: any) => ({
        id: d.id, name: d.name, type: d.type, size: d.size, uploadedBy: d.uploaded_by || 'Agent',
        date: d.uploaded_at ? d.uploaded_at.split('T')[0] : new Date().toISOString().split('T')[0], fileUrl: d.file_url || ''
      })));
    } catch (err: any) {
      console.error('Error fetching payments or documents:', err);
    }
  };

  const [selectedLeadForPayment, setSelectedLeadForPayment] = useState<string>('');

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetLeadId = selectedLeadForPayment || activeLead?.id;
    if (!paymentAmount || !targetLeadId) {
      toast({
        title: "Please Select a Lead / Booking",
        description: "Select the customer or booking this payment belongs to.",
        variant: "destructive"
      });
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

      const amt = Number(paymentAmount);
      const refNum = paymentRef || `REF${Math.floor(100000 + Math.random() * 900000)}`;
      const remarksText = paymentRemarks || 'Manual Payment Entry';
      
      const res = await fetch('/php-backend/api.php?table=payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          lead_id: targetLeadId,
          amount_received: amt,
          payment_date: new Date().toISOString().split('T')[0],
          payment_mode: paymentMode,
          reference_number: refNum,
          remarks: remarksText,
          status: 'Success',
          received_by: userProfile?.full_name || 'Agent'
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save payment to database');
      }

      await logActivity(targetLeadId, {
        type: 'payment',
        content: `Payment Received: ₹${amt.toLocaleString('en-IN')} via ${paymentMode}. UTR/Ref: ${refNum}. Remarks: ${remarksText}`,
        metadata: { amount: amt, mode: paymentMode, ref: refNum }
      });

      toast({
        title: "Payment Recorded Successfully! 🟢",
        description: `Recorded ₹${amt.toLocaleString('en-IN')} via ${paymentMode} (Ref: ${refNum}).`
      });

      setRecordPaymentDialogOpen(false);
      setPaymentAmount('');
      setPaymentRef('');
      setPaymentRemarks('');
      setSelectedLeadForPayment('');

      fetchAllPayments();
      if (activeLead) fetchLeadPaymentsAndDocuments(activeLead.id);
    } catch (err: any) {
      console.error('Error recording payment:', err);
      toast({
        title: "Error Recording Payment",
        description: err.message || "Failed to record payment",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!newDocumentName) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNewDocumentName(baseName);
      }
    }
  };

  const handleMockUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocumentName || !activeLead) return;
    setIsUploadingDoc(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

      const ext = selectedFile 
        ? (selectedFile.name.split('.').pop()?.toUpperCase() || 'PDF')
        : (newDocumentName.includes('.') ? newDocumentName.split('.').pop()?.toUpperCase() : 'PDF');
      
      const sizeStr = selectedFile 
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
        : '1.5 MB';

      if (selectedFile) {
        // Read file as base64
        const reader = new FileReader();
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(selectedFile);
        });

        const res = await fetch('/php-backend/document_upload.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({
            lead_id: activeLead.id,
            name: newDocumentName,
            type: ext,
            size: sizeStr,
            uploaded_by: userProfile?.full_name || 'Agent',
            file_base64: fileBase64
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to upload document file');
        }
      } else {
        // Fallback metadata-only insert
        const name = newDocumentName.includes('.') ? newDocumentName : `${newDocumentName}.pdf`;
        const res = await fetch('/php-backend/api.php?table=documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({
            lead_id: activeLead.id,
            name: name,
            type: ext || 'PDF',
            size: sizeStr,
            uploaded_by: userProfile?.full_name || 'Agent',
            file_url: `https://rfdumlnkmfuacsznogzz.supabase.co/storage/v1/object/public/documents/${encodeURIComponent(name)}`
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to create document record');
        }
      }

      await fetchLeadPaymentsAndDocuments(activeLead.id);
      setNewDocumentName('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      toast({
        title: "Document Uploaded",
        description: `Successfully uploaded ${newDocumentName}.`
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (id: string, name: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`/php-backend/api.php?table=documents&id=${id}`, {
        method: 'DELETE',
        headers: {
          ...authHeaders
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete document');
      }

      if (activeLead) {
        await fetchLeadPaymentsAndDocuments(activeLead.id);
      } else {
        setMockDocuments(prev => prev.filter(d => d.id !== id));
      }

      toast({
        title: "Document Deleted",
        description: `${name} has been removed from files.`
      });
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // Determine section view from path
  let currentSection: 
    | 'dashboard' 
    | 'user-dashboard' 
    | 'leads' 
    | 'opportunities'
    | 'quotes'
    | 'customers'
    | 'add-lead' 
    | 'edit-lead' 
    | 'profile' 
    | 'followups' 
    | 'itinerary' 
    | 'destinations'
    | 'hotels'
    | 'cabs'
    | 'suppliers'
    | 'activities'
    | 'sightseeings'
    | 'visas'
    | 'itineraries-mocked'
    | 'packages'
    | 'blogs'
    | 'suppliers-mocked'
    | 'payments-mocked'
    | 'india-explorer'
    | 'bulk-upload'
    | 'audit-logs'
    | 'agent-roles'
    | 'reports-mocked' = 'dashboard';

  if (location.pathname === '/crm/user-dashboard') {
    currentSection = 'user-dashboard';
  } else if (location.pathname.includes('role-management') || location.pathname.includes('agent-roles') || location.pathname === '/crm/users') {
    currentSection = 'agent-roles';
  } else if (location.pathname === '/crm/india-explorer') {
    currentSection = 'india-explorer';
  } else if (location.pathname.startsWith('/crm/settings/destinations')) {
    currentSection = 'destinations';
  } else if (location.pathname === '/crm/leads') {
    currentSection = 'leads';
  } else if (location.pathname === '/crm/opportunities') {
    currentSection = 'opportunities';
  } else if (location.pathname === '/crm/quotes') {
    currentSection = 'quotes';
  } else if (location.pathname === '/crm/customers') {
    currentSection = 'customers';
  } else if (location.pathname === '/crm/leads/new') {
    currentSection = 'add-lead';
  } else if (location.pathname.includes('bulk-upload') || location.pathname.includes('bulk')) {
    currentSection = 'bulk-upload';
  } else if (location.pathname.startsWith('/crm/hotels')) {
    currentSection = 'hotels';
  } else if (location.pathname.startsWith('/crm/cabs')) {
    currentSection = 'cabs';
  } else if (location.pathname.startsWith('/crm/suppliers')) {
    currentSection = 'suppliers';
  } else if (location.pathname.startsWith('/crm/activities')) {
    currentSection = 'activities';
  } else if (location.pathname.startsWith('/crm/sightseeings')) {
    currentSection = 'sightseeings';
  } else if (location.pathname.startsWith('/crm/visas')) {
    currentSection = 'visas';
  } else if (location.pathname.startsWith('/crm/reviews')) {
    currentSection = 'reviews';
  } else if (location.pathname.startsWith('/crm/email-marketing')) {
    currentSection = 'email-marketing';
  } else if (location.pathname === '/crm/itineraries') {
    currentSection = 'itineraries-mocked';
  } else if (location.pathname.startsWith('/crm/packages')) {
    currentSection = 'packages';
  } else if (location.pathname.startsWith('/crm/blogs')) {
    currentSection = 'blogs';
  } else if (location.pathname.includes('bulk-upload')) {
    currentSection = 'bulk-upload';
  } else if (location.pathname.includes('audit-log') || location.pathname.includes('audit-logs')) {
    currentSection = 'audit-logs';
  } else if (location.pathname === '/crm/payments') {
    currentSection = 'payments-mocked';
  } else if (location.pathname === '/crm/reports') {
    currentSection = 'reports-mocked';
  } else if (location.pathname.endsWith('/edit')) {
    currentSection = 'edit-lead';
  } else if (location.pathname.endsWith('/followups')) {
    currentSection = 'followups';
  } else if (location.pathname.endsWith('/itinerary')) {
    currentSection = 'itinerary';
  } else if (location.pathname.endsWith('/proposals')) {
    currentSection = 'proposals';
  } else if (location.pathname.endsWith('/brochure')) {
    currentSection = 'brochure';
  } else if (location.pathname.endsWith('/voucher')) {
    currentSection = 'voucher';
  } else if (location.pathname.endsWith('/invoice')) {
    currentSection = 'invoice';
  } else if (leadId) {
    currentSection = 'profile';
  }

  const activeLead = leadId ? leads.find(l => l.id === leadId) : null;

  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});

  const reloadPermissions = () => {
    try {
      const userRole = (userProfile?.role || user?.user_metadata?.role || 'admin').toLowerCase();
      const savedMatrixStr = localStorage.getItem('crm_module_permissions');
      const savedOverridesStr = localStorage.getItem('crm_user_permissions_override');
      
      const matrix = savedMatrixStr ? JSON.parse(savedMatrixStr) : null;
      const overrides = savedOverridesStr ? JSON.parse(savedOverridesStr) : null;
      
      const rolePerms = (matrix && matrix[userRole]) ? matrix[userRole] : {
        hotels: true, cabs: true, sightseeings: true, activities: true, visas: true,
        packages: true, blogs: true, reports: true, leads: true, audit_logs: true, bulk_upload: true
      };

      const userOverride = (overrides && user?.id && overrides[user.id]) ? overrides[user.id] : {};
      setUserPermissions({ ...rolePerms, ...userOverride });
    } catch (e) {
      console.warn('Error computing module permissions:', e);
    }
  };

  useEffect(() => {
    reloadPermissions();
    window.addEventListener('crm_permissions_updated', reloadPermissions);
    return () => window.removeEventListener('crm_permissions_updated', reloadPermissions);
  }, [user, userProfile]);

  useEffect(() => {
    if (user && profiles.length === 0) {
      loadUserDataAndProfiles();
    }
  }, [user, profiles.length]);

  useEffect(() => {
    fetchLeads();
  }, [user, showDeletedLeads]);

  useEffect(() => {
    if (userProfile) {
      if (currentSection === 'dashboard') {
        fetchDashboardInventory();
      }
      const needsQuotesOrProfiles = ['quotes', 'opportunities', 'reports', 'payments'].some(s => currentSection.includes(s));
      if (needsQuotesOrProfiles && quotes.length === 0) fetchQuotes();
      if (currentSection !== 'dashboard' && profiles.length === 0) fetchProfiles();
      if (currentSection === 'payments-mocked' || currentSection === 'reports-mocked') {
        fetchAllPayments();
      }
      if (currentSection === 'reports-mocked') {
        fetchRatesData();
      }
    }
  }, [user, userProfile, showDeletedLeads, currentSection]);

  useEffect(() => {
    applyAdvancedFilters();
  }, [leads, searchTerm, filterCountry, filterState, filterDestination, filterSource, filterAssignedTo, filterStatus, filterTravelDate]);

  useEffect(() => {
    if (userProfile && activeLead && !authLoading) {
      const isUserAdmin = isAdminRole(userProfile.role);
      const isUserManager = userProfile.role?.toLowerCase().includes('manager');
      if (!isUserAdmin && !isUserManager && activeLead.assigned_to !== user?.id) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access this lead's details.",
          variant: "destructive"
        });
        navigate('/crm/leads', { replace: true });
      }
    }
  }, [userProfile, activeLead, user, authLoading, navigate]);

  const loadUserDataAndProfiles = async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE}/users.php`, {
        headers: authHeaders
      }).catch(() => null);

      if (res && res.ok) {
        const resData = await res.json().catch(() => ({}));
        const dbUsers = resData.users || [];

        if (dbUsers.length > 0) {
          // Map profiles for system user selector
          const mappedProfiles: Profile[] = dbUsers.map((p: any) => ({
            id: p.id,
            full_name: p.full_name || 'Unknown',
            role: p.role?.toLowerCase().includes('admin') ? 'admin' : (p.role || 'Agent'),
            approved: true
          }));
          setProfiles(mappedProfiles);

          // Match current active logged-in user
          const matched = dbUsers.find((u: any) => u.email === user.email || u.id === user.id);
          if (matched) {
            setUserProfile({
              id: matched.id,
              full_name: matched.full_name || user.user_metadata?.full_name || 'Agent',
              role: matched.role?.toLowerCase().includes('admin') ? 'admin' : (matched.role || 'Agent'),
              approved: true
            });
            return;
          }
        }
      }

      // Safe fallback profile if users.php is offline or user not yet in MySQL
      if (!userProfile) {
        setUserProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Superadmin',
          role: (user.user_metadata?.role || 'admin').toLowerCase().includes('admin') ? 'admin' : (user.user_metadata?.role || 'Agent'),
          approved: true
        });
      }
    } catch (err: any) {
      console.error('Error loading user profile & team profiles:', err);
      if (!userProfile) {
        setUserProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Superadmin',
          role: 'admin',
          approved: true
        });
      }
    }
  };

  const fetchProfiles = loadUserDataAndProfiles;

  const isAdminRole = (role: string | null | undefined): boolean => {
    if (!role) return true;
    const r = role.toLowerCase().trim();
    return r === 'admin' || r.includes('admin') || r === 'super_admin' || r === 'superadmin' || r === 'agency_admin' || r === 'super admin' || r === 'agency admin' || r === 'owner' || r === 'manager' || r.includes('manager');
  };

  const fetchQuotes = async () => {
    try {
      const allQuotes = await quoteService.getQuotesForLead(0);
      const grouped = quoteService.groupQuotes(allQuotes);
      setQuotes(grouped);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await leadService.getLeads();
      setLeads(data || []);
    } catch (error) {
      console.warn('Network issue fetching leads, using cached state:', error);
    } finally {
      setLoading(false);
    }
  };

  const [isRefreshingData, setIsRefreshingData] = useState(false);

  const handleRefreshSystemData = async () => {
    setIsRefreshingData(true);
    try {
      await Promise.all([
        fetchLeads(),
        fetchQuotes(),
        fetchProfiles(),
        fetchDashboardInventory(),
        fetchAllPayments(),
        fetchRatesData()
      ]);
      toast({
        title: '⚡ System Data Refreshed',
        description: 'Successfully re-synced all live leads, itineraries, and master tables from database.'
      });
    } catch (err: any) {
      console.error('Refresh failed, forcing hard page reload:', err);
      window.location.reload();
    } finally {
      setTimeout(() => setIsRefreshingData(false), 500);
    }
  };

  const handleDeleteLead = async (reason: string, notes: string) => {
    if (!leadToDelete || !user) return;

    // Find the full lead object to check its status
    const leadObj = leads.find(l => l.id === leadToDelete.id);
    
    if (leadObj) {
      if (leadObj.status === 'Booking Confirmed') {
        toast({
          title: "Deletion Blocked",
          description: "Lead cannot be deleted because booking records exist.",
          variant: "destructive"
        });
        setDeleteModalOpen(false);
        setLeadToDelete(null);
        return;
      }
      
      if (leadObj.status === 'Quote Sent') {
        toast({
          title: "Deletion Blocked",
          description: "Lead cannot be deleted because an active quotation exists.",
          variant: "destructive"
        });
        setDeleteModalOpen(false);
        setLeadToDelete(null);
        return;
      }
    }

    setIsDeleting(true);
    try {
      const now = new Date().toISOString();
      const userRoleStr = userProfile?.role || 'Agent';

      // 1. Delete associated itinerary records automatically
      // TODO: delete related itineraries via PHP/MySQL when itineraries endpoint is available
      const { error: itineraryDeleteError } = await supabase
        .from('itineraries')
        .delete()
        .eq('lead_id', leadToDelete.id);

      if (itineraryDeleteError) {
        console.error('Error deleting related itineraries:', itineraryDeleteError);
      }

      // 2. Soft delete the lead via MySQL backend
      await leadService.deleteLead(leadToDelete.id);

      toast({
        title: "Lead Deleted",
        description: `Successfully deleted lead for ${leadToDelete.name}.`
      });

      setDeleteModalOpen(false);
      setLeadToDelete(null);
      fetchLeads();
      navigate('/crm/leads');
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete lead",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreLead = async (leadId: string) => {
    if (!user) return;
    try {
      const leadName = leads.find(l => l.id === leadId)?.customer_name || 'Lead';

      // 1. Restore the lead via MySQL backend
      await leadService.updateLead(leadId, { isDeleted: 0 });

      toast({
        title: "Lead Restored",
        description: `Successfully restored lead for ${leadName}.`
      });

      fetchLeads();
      navigate(`/crm/leads/${leadId}`);
    } catch (error: any) {
      console.error('Error restoring lead:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to restore lead",
        variant: "destructive"
      });
    }
  };

  const applyAdvancedFilters = () => {
    let result = leads;

    // Role-based visibility: Superadmin/Admin/Manager sees ALL leads. Agents see assigned + unassigned leads.
    const isUserAdmin = isAdminRole(userProfile?.role);
    if (userProfile && !isUserAdmin) {
      const agentId = user?.id;
      const agentEmail = userProfile?.email?.toLowerCase();
      const agentName = userProfile?.full_name?.toLowerCase();
      result = result.filter(l => {
        if (!l.assigned_to || l.assigned_to === 'unassigned' || l.assigned_to === '') return true;
        const assigned = String(l.assigned_to).toLowerCase();
        return (agentId && assigned === agentId.toLowerCase()) || 
               (agentEmail && assigned === agentEmail) || 
               (agentName && assigned === agentName);
      });
    }

    if (searchTerm) {
      result = result.filter(l => 
        (l.customer_name && l.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.contact_number && l.contact_number.includes(searchTerm)) ||
        (l.enquiry_number && l.enquiry_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterCountry && filterCountry !== 'all') {
      result = result.filter(l => l.country === filterCountry);
    }
    if (filterState && filterState !== 'all') {
      result = result.filter(l => l.state === filterState);
    }
    if (filterDestination && filterDestination !== 'all') {
      result = result.filter(l => l.destinations && l.destinations.includes(filterDestination));
    }
    if (filterSource && filterSource !== 'all') {
      result = result.filter(l => l.source === filterSource || l.customer_type === filterSource);
    }
    if (filterAssignedTo && filterAssignedTo !== 'all') {
      result = result.filter(l => l.assigned_to === filterAssignedTo);
    }
    if (filterStatus && filterStatus !== 'all') {
      const normFilter = filterStatus.toLowerCase().trim();
      result = result.filter(l => {
        if (!l.status) return normFilter === 'new';
        const st = l.status.toLowerCase().trim();
        if (normFilter === 'new') {
          return st === 'new' || st === 'new enquiry' || st === 'fresh' || st === 'unassigned' || !l.assigned_to || l.assigned_to === 'unassigned';
        }
        if (normFilter === 'assigned') {
          return st === 'assigned' || (l.assigned_to && l.assigned_to !== 'unassigned');
        }
        if (normFilter === 'confirmed') {
          return st === 'confirmed' || st === 'booking confirmed';
        }
        return st.includes(normFilter) || normFilter.includes(st);
      });
    }
    if (filterTravelDate) {
      result = result.filter(l => l.trip_start_date && l.trip_start_date.includes(filterTravelDate));
    }

    setFilteredLeads(result);
  };

  const logActivity = async (lId: string, activity: { type: string; content: string; metadata?: any }) => {
    try {
      const channel = activity.type as any;
      await leadService.logCommunication(lId, channel, activity.content, 'outbound');
      await fetchLeadPaymentsAndDocuments(lId);
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  const handleLeadSubmit = async (leadData: any) => {
    if (!user) return;
    try {
      let processedData = {
        ...leadData,
        user_id: user.id,
        created_by: user.id
      };

      let leadIdToRedirect = '';

      if (currentSection === 'edit-lead' && activeLead) {
        await leadService.updateLead(activeLead.id, processedData);
        toast({ title: "Success", description: "Lead updated successfully" });
        leadIdToRedirect = activeLead.id;
      } else {
        // Generate a unique client-side ID to satisfy the not-null constraint in the DB
        const newId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
        
        // Generate formatted business lead_id if not present
        const date = new Date();
        const year = date.getFullYear();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthAbbr = monthNames[date.getMonth()];
        const monthNum = String(date.getMonth() + 1).padStart(2, '0');
        
        const prefix1 = `LD${year}-${monthAbbr}-`;
        const prefix2 = `LD${year}-${monthNum}-`;
        
        let maxSeq = 0;
        leads.forEach((l: any) => {
          const lId = l.lead_id || l.leadId;
          if (lId) {
            if (lId.startsWith(prefix1)) {
              const seqStr = lId.substring(prefix1.length);
              const seq = parseInt(seqStr, 10);
              if (!isNaN(seq) && seq > maxSeq) {
                maxSeq = seq;
              }
            } else if (lId.startsWith(prefix2)) {
              const seqStr = lId.substring(prefix2.length);
              const seq = parseInt(seqStr, 10);
              if (!isNaN(seq) && seq > maxSeq) {
                maxSeq = seq;
              }
            }
          }
        });
        
        const nextSeq = String(maxSeq + 1).padStart(5, '0');
        const generatedLeadId = `${prefix1}${nextSeq}`;

        processedData = {
          ...processedData,
          leadId: generatedLeadId,
          leadPurchasedDate: new Date().toISOString().split('T')[0]
        };

        const created = await leadService.createLead(processedData);
        if ((created as any)?.isRepeatCustomer) {
          toast({ 
            title: "🔁 Repeat Customer Inquiry Linked!", 
            description: `Linked new trip inquiry under ${processedData.customer_name}'s master customer profile.` 
          });
        } else {
          toast({ title: "Success", description: "Lead created successfully" });
        }
        leadIdToRedirect = created.id;
      }

      fetchLeads();
      
      if (leadIdToRedirect) {
        if (currentSection !== 'edit-lead') {
          await logActivity(leadIdToRedirect, { 
            type: 'status_change', 
            content: 'Lead created in CRM.', 
            metadata: { toStatus: processedData.status } 
          });
        }
        navigate(`/crm/leads/${leadIdToRedirect}`);
      } else {
        navigate('/crm/leads');
      }
    } catch (error: any) {
      console.error('Error saving lead:', error);
      const errorMsg = error?.message || error?.details || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      toast({
        title: "Error Saving Lead",
        description: errorMsg || "Failed to save lead",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (newStatus: Lead['status']) => {
    if (!activeLead) return;
    try {
      await leadService.updateLead(activeLead.id, { status: newStatus });
      
      toast({ title: "Status Updated", description: `Lead status changed to ${newStatus}` });
      await logActivity(activeLead.id, {
        type: 'status_change',
        content: `Status changed to "${newStatus}"`,
        metadata: { fromStatus: activeLead.status, toStatus: newStatus }
      });
      fetchLeads();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleLogTimelineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineNote.trim() || !activeLead) return;
    
    await logActivity(activeLead.id, {
      type: timelineType,
      content: timelineNote.trim()
    });
    
    setTimelineNote('');
    toast({ title: "Note Logged", description: "Successfully added to timeline history." });
  };

  const handleSendProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    
    const cost = parseFloat(proposalCost) || 0;
    const quoteUrl = `${window.location.origin}/quote/${activeLead.id}?template=${encodeURIComponent(proposalTemplate)}&amount=${cost}`;
    
    const commSummary = `Proposal & Quote Dispatched: "${proposalTemplate}" Package. Estimated Booking Value: ₹${cost.toLocaleString()}. Link: ${quoteUrl}. Remarks: ${proposalRemarks}`;

    await leadService.updateLead(activeLead.id, { 
      packagePrice: cost,
      packageCost: cost,
      status: 'Quote Sent',
      communication_summary: commSummary,
      communication_channel: 'email'
    } as any);

    fetchLeadPaymentsAndDocuments(activeLead.id);

    setProposalDialogOpen(false);
    setProposalCost('');
    setProposalRemarks('');
    
    toast({
      title: "1-Click Quote Dispatched! ⚡",
      description: `Quote & Proposal generated for ${activeLead.customer_name} (Valued at ₹${cost.toLocaleString()}).`
    });
  };

  const handleConvertLeadToBooking = async () => {
    if (!activeLead) return;
    
    try {
      await leadService.updateLead(activeLead.id, { status: 'Booking Confirmed' });
      
      await logActivity(activeLead.id, {
        type: 'status_change',
        content: 'Converted lead to a confirmed booking! 🚀'
      });
      
      toast({
        title: "Lead Converted!",
        description: `Successfully converted ${activeLead.customer_name} to a won booking.`
      });
      fetchLeads();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to convert lead", variant: "destructive" });
    }
  };

  const handleFollowUpSubmit = async (leadId: string, followUpData: any) => {
    try {
      await leadService.updateLead(leadId, {
        followUpDate: followUpData.nextCallTime
      });

      toast({
        title: "Success",
        description: "Follow-up details logged."
      });
      
      await logActivity(leadId, {
        type: 'call',
        content: `Call Follow-up logged: "${followUpData.callType}" - ${followUpData.callSummary}`,
        metadata: { prospect: followUpData.leadProspect, nextCall: followUpData.nextCallTime }
      });
      
      fetchLeads();
      setFollowUpModalOpen(false);
      setSelectedLeadForFollowUp(null);
    } catch (error) {
      console.error('Error saving follow-up:', error);
      toast({
        title: "Error",
        description: "Failed to save follow-up",
        variant: "destructive"
      });
    }
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
      const stops: any[] = [];

      cityParts.forEach((cp) => {
        const matchN = cp.match(/(.*?)\s*(\d+)\s*N/i);
        if (matchN) {
          const cityName = matchN[1].trim();
          const nights = parseInt(matchN[2], 10) || 1;
          if (cityName) {
            stops.push({ country: extractedCountry, state: extractedState, city: cityName, nights });
          }
        } else {
          const cleanCity = cp.replace(/\b\d+D\b/i, '').trim();
          if (cleanCity) {
            stops.push({ country: extractedCountry, state: extractedState, city: cleanCity, nights: 1 });
          }
        }
      });

      if (stops.length === 0 && rawStr) {
        const simpleName = rawStr.split(/[·,-]/)[0].trim();
        if (simpleName) {
          stops.push({ country: extractedCountry, state: extractedState, city: simpleName, nights: 1 });
        }
      }

      return stops;
    }

    return [];
  }

  const getAssignedUserName = (assignedTo: string | null) => {
    if (!assignedTo || assignedTo === 'unassigned' || assignedTo === '0') return 'Unassigned';
    const profile = profiles.find(p => p.id === assignedTo || p.full_name?.toLowerCase() === String(assignedTo).toLowerCase() || p.email?.toLowerCase() === String(assignedTo).toLowerCase());
    if (profile?.full_name) return profile.full_name;
    if (typeof assignedTo === 'string' && assignedTo.length < 30 && !assignedTo.includes('-')) return assignedTo;
    return 'Unassigned';
  };

  const formatLeadRoute = (l: any) => {
    const rawDest = l.lead_destination || l.destinations || l.destination || l.package_name;
    const parsed = parseDestinations(rawDest);
    if (parsed.length > 0) {
      return parsed.map(p => p.city).join(' → ');
    }
    let rawStr = typeof l.destinations === 'string' ? l.destinations : (l.package_name || '');
    if (rawStr.startsWith('[') && rawStr.endsWith(']')) {
      try {
        const arr = JSON.parse(rawStr);
        const subParsed = parseDestinations(arr);
        if (subParsed.length > 0) {
          return subParsed.map(p => p.city).join(' → ');
        }
      } catch {}
    }
    rawStr = rawStr.replace(/^Itinerary\s+for\s+[^-]+-\s*/i, '')
                   .replace(/-\s*(Family|Honeymoon|Group|Luxury|Budget|Standard)\s+Holiday.*/i, '')
                   .replace(/\b\d+N\/\d+D\b.*/i, '')
                   .replace(/·\s*\d+N\/\d+D.*/i, '')
                   .trim();
    return rawStr || 'Custom Tour';
  };

  const getBreadcrumbItems = () => {
    const leadName = activeLead ? activeLead.customer_name : 'Lead Details';
    const items = [
      { label: 'CRM', path: '/crm' }
    ];

    if (currentSection === 'dashboard') {
      items.push({ label: 'Dashboard', path: '/crm' });
    } else if (currentSection === 'user-dashboard') {
      items.push({ label: 'User Dashboard', path: '/crm/user-dashboard' });
    } else if (currentSection === 'leads') {
      items.push({ label: 'Leads', path: '/crm/leads' });
    } else if (currentSection === 'add-lead') {
      items.push({ label: 'Leads', path: '/crm/leads' });
      items.push({ label: 'New Lead', path: '/crm/leads/new' });
    } else if (currentSection === 'edit-lead') {
      items.push({ label: 'Leads', path: '/crm/leads' });
      items.push({ label: leadName, path: `/crm/leads/${leadId}` });
      items.push({ label: 'Edit Lead', path: `/crm/leads/${leadId}/edit` });
    } else if (currentSection === 'profile') {
      items.push({ label: 'Leads', path: '/crm/leads' });
      items.push({ label: leadName, path: `/crm/leads/${leadId}` });
    } else if (currentSection === 'followups') {
      items.push({ label: 'Leads', path: '/crm/leads' });
      items.push({ label: leadName, path: `/crm/leads/${leadId}` });
      items.push({ label: 'Follow-ups', path: `/crm/leads/${leadId}/followups` });
    } else if (currentSection === 'itinerary') {
      items.push({ label: 'Leads', path: '/crm/leads' });
      items.push({ label: leadName, path: `/crm/leads/${leadId}` });
      items.push({ label: 'Itinerary', path: `/crm/leads/${leadId}/itinerary` });
    } else if (currentSection === 'destinations') {
      items.push({ label: 'Settings', path: '/crm' });
      items.push({ label: 'Destinations', path: '/crm/settings/destinations' });
    } else if (currentSection === 'hotels') {
      items.push({ label: 'Hotel Contracts', path: '/crm/hotels' });
    } else if (currentSection === 'reviews') {
      items.push({ label: 'Reviews', path: '/crm/reviews' });
    } else if (currentSection === 'packages') {
      items.push({ label: 'Packages', path: '/crm/packages' });
    } else if (currentSection === 'blogs') {
      items.push({ label: 'Blogs', path: '/crm/blogs' });
    } else if (currentSection === 'opportunities') {
      items.push({ label: 'Opportunities', path: '/crm/opportunities' });
    } else if (currentSection === 'quotes') {
      items.push({ label: 'Quotes', path: '/crm/quotes' });
    } else if (currentSection === 'customers') {
      items.push({ label: 'Customers', path: '/crm/customers' });
    }

    return items;
  };

  const onItinCityChange = (dayId: string, val: string) => {
    setItineraryDays(prev => prev.map(d => d.id === dayId ? { ...d, accommodation_city: val } : d));
    fetchHotelsForCity(dayId, val);
  };

  const onItinHotelChange = (dayId: string, hotelId: string) => {
    setItineraryHotels(prev => ({
      ...prev,
      [dayId]: {
        ...(prev[dayId] || {}),
        hotel_id: hotelId,
        room_category: '',
        meal_plan: 'CP',
        room_configuration: { doubleRooms: 1 },
        rate_per_night: 0,
        total_cost: 0,
        room_cost: 0,
        gst_cost: 0,
        nights: 1
      }
    }));
    fetchRoomsForItinHotel(dayId, hotelId);
  };

  const onItinRoomOrMealChange = async (dayId: string, field: string, val: string) => {
    const day = itineraryDays.find(d => d.id === dayId);
    const stay = itineraryHotels[dayId] || {};
    const updatedStay = { ...stay, [field]: val };
    
    setItineraryHotels(prev => ({
      ...prev,
      [dayId]: updatedStay
    }));

    if (updatedStay.hotel_id && updatedStay.room_category && updatedStay.meal_plan && day?.date) {
      const rateInfo = await calculateHotelRate(
        dayId, 
        updatedStay.hotel_id, 
        field === 'room_category' ? val : updatedStay.room_category, 
        field === 'meal_plan' ? val : updatedStay.meal_plan, 
        day.date, 
        updatedStay.room_configuration || { doubleRooms: 1 }
      );
      if (rateInfo) {
        setItineraryHotels(prev => ({
          ...prev,
          [dayId]: {
            ...prev[dayId],
            rate_per_night: rateInfo.rate_per_night,
            total_cost: rateInfo.total_cost,
            room_cost: rateInfo.room_cost,
            gst_cost: rateInfo.gst_cost
          }
        }));
      }
    }
  };

  const onItinRoomConfigChange = async (dayId: string, key: string, count: number) => {
    const day = itineraryDays.find(d => d.id === dayId);
    const stay = itineraryHotels[dayId] || {};
    const config = stay.room_configuration || { doubleRooms: 1 };
    const newConfig = { ...config, [key]: count };
    
    setItineraryHotels(prev => ({
      ...prev,
      [dayId]: {
        ...stay,
        room_configuration: newConfig
      }
    }));

    if (stay.hotel_id && stay.room_category && stay.meal_plan && day?.date) {
      const rateInfo = await calculateHotelRate(
        dayId, 
        stay.hotel_id, 
        stay.room_category, 
        stay.meal_plan, 
        day.date, 
        newConfig
      );
      if (rateInfo) {
        setItineraryHotels(prev => ({
          ...prev,
          [dayId]: {
            ...prev[dayId],
            rate_per_night: rateInfo.rate_per_night,
            total_cost: rateInfo.total_cost,
            room_cost: rateInfo.room_cost,
            gst_cost: rateInfo.gst_cost
          }
        }));
      }
    }
  };

  // Disable redundant Supabase itinerary load triggers since <ItineraryBuilder> completely handles it via MySQL
  /*
  useEffect(() => {
    if (currentSection === 'itinerary' && leadId) {
      loadItineraryData();
    }
  }, [currentSection, leadId]);
  */

  // Recommendations are consolidated into lead_details.php (1 single network request).
  // If lead_details.php fallback is triggered, fetchRecommendationsForLead will be called on demand.

  useEffect(() => {
    setMockPayments([]);
    setMockDocuments([]);
    setMockFollowups([]);
    if (activeLead) {
      fetchLeadPaymentsAndDocuments(activeLead.id);
    }
  }, [activeLead?.id]);

  const fetchRecommendationsForLead = async () => {
    if (!activeLead?.destinations) return;
    // Skip if already populated by consolidated lead_details.php endpoint
    if (recommendedHotels.length > 0 || recommendedActivities.length > 0 || recommendedRoutes.length > 0) {
      setRecommendationsLoading(false);
      return;
    }
    setRecommendationsLoading(true);
    try {
      const dest = activeLead.destinations.split(',')[0]?.trim();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // 1. Fetch matching hotels
      let hotData = [];
      try {
        const res = await fetch('/php-backend/hotels.php');
        if (res.ok) {
          const allHotels = await res.json();
          hotData = allHotels
            .filter((h: any) => h.active_status && h.city && h.city.toLowerCase().includes(dest.toLowerCase()))
            .slice(0, 4);
        }
      } catch (err) {
        console.error('Fetch hotels error:', err);
      }
      setRecommendedHotels(hotData || []);

      // 2. Fetch matching activities
      let actData = [];
      try {
        const res = await fetch('/php-backend/activities.php', {
          headers: authHeaders
        });
        if (res.ok) {
          const allActivities = await res.json();
          actData = allActivities
            .filter((a: any) => a.active_status && a.destination && a.destination.toLowerCase().includes(dest.toLowerCase()))
            .slice(0, 4);
        }
      } catch (err) {
        console.error('Fetch activities error:', err);
      }
      setRecommendedActivities(actData || []);

      // 3. Fetch matching routes
      let routeData = [];
      try {
        const res = await fetch('/php-backend/api.php?table=cab_routes');
        if (res.ok) {
          const allRoutes = await res.json();
          routeData = allRoutes
            .filter((r: any) => r.active_status && r.destination && r.destination.toLowerCase().includes(dest.toLowerCase()))
            .slice(0, 4);
        }
      } catch (err) {
        console.error('Fetch cab-routes error:', err);
      }
      setRecommendedRoutes(routeData || []);

    } catch (err) {
      console.error("Error loading lead recommendations:", err);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const loadItineraryData = async () => {
    if (!leadId) return;
    setItineraryLoading(true);
    try {
      const { data: itinList, error: iErr } = await supabase
        .from('itineraries')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (iErr) throw iErr;

      let currentItinerary = itinList && itinList.length > 0 ? itinList[0] : null;
      let start_date = activeLead?.trip_start_date || new Date().toISOString().split('T')[0];
      let end_date = activeLead?.trip_end_date || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const diffTime = Math.abs(new Date(end_date).getTime() - new Date(start_date).getTime());
      const nightsCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 3;

      if (!currentItinerary) {
        const defaultCode = 'ITIN-' + Date.now().toString().slice(-6);
        const { data: newItin, error: createErr } = await supabase
          .from('itineraries')
          .insert([{
            itinerary_name: `Itinerary for ${activeLead?.customer_name || 'Guest'} - ${activeLead?.destinations || 'Tour'}`,
            itinerary_code: defaultCode,
            lead_id: leadId,
            customer_name: activeLead?.customer_name || 'Guest',
            customer_email: activeLead?.customer_email || activeLead?.email || null,
            customer_phone: activeLead?.customer_phone || activeLead?.contact_number || null,
            total_guests: (activeLead?.adult_count || 2) + (activeLead?.child_count || 0),
            adult_count: activeLead?.adult_count || 2,
            child_count: activeLead?.child_count || 0,
            infant_count: activeLead?.infant_count || 0,
            travel_start_date: start_date,
            travel_end_date: end_date,
            total_nights: nightsCount,
            destinations: activeLead?.destinations ? activeLead.destinations.split(',') : ['Delhi'],
            status: 'Draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createErr) throw createErr;
        currentItinerary = newItin;
      }

      setActiveItinerary(currentItinerary);

      const { data: daysData, error: dErr } = await supabase
        .from('itinerary_days')
        .select('*')
        .eq('itinerary_id', currentItinerary.id)
        .order('day_number');

      if (dErr) throw dErr;

      let processedDays = daysData || [];

      if (processedDays.length === 0) {
        const defaultDays = [];
        for (let i = 1; i <= nightsCount; i++) {
          const dayDate = new Date(new Date(start_date).getTime() + (i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          defaultDays.push({
            itinerary_id: currentItinerary.id,
            day_number: i,
            date: dayDate,
            city: activeLead?.destinations?.split(',')[0]?.trim() || 'Delhi',
            accommodation_city: activeLead?.destinations?.split(',')[0]?.trim() || 'Delhi',
            title: `Day ${i}: Sightseeing and Leisure`,
            description: `Leisurely explore points of interest in the city. Accommodation stay included.`
          });
        }
        
        const { data: insertedDays, error: insErr } = await supabase
          .from('itinerary_days')
          .insert(defaultDays)
          .select();
        
        if (insErr) throw insErr;
        processedDays = insertedDays || [];
      }

      setItineraryDays(processedDays);

      const { data: hotelsData, error: hErr } = await supabase
        .from('itinerary_hotels')
        .select('*')
        .eq('itinerary_id', currentItinerary.id);

      if (hErr) throw hErr;

      const hotelsMap: Record<string, any> = {};
      (hotelsData || []).forEach(h => {
        if (h.itinerary_day_id) {
          hotelsMap[h.itinerary_day_id] = {
            id: h.id,
            hotel_id: h.hotel_id,
            room_category: h.room_category,
            meal_plan: h.meal_plan,
            room_configuration: typeof h.room_configuration === 'string' ? JSON.parse(h.room_configuration) : (h.room_configuration || { doubleRooms: 1 }),
            rate_per_night: Number(h.rate_per_night),
            total_cost: Number(h.total_cost),
            room_cost: h.room_cost !== null && h.room_cost !== undefined ? Number(h.room_cost) : undefined,
            gst_cost: h.gst_cost !== null && h.gst_cost !== undefined ? Number(h.gst_cost) : undefined,
            nights: h.nights,
            special_requests: h.special_requests || '',
            isManual: false
          };
        }
      });
      setItineraryHotels(hotelsMap);

      // Load vehicles & routes for transportation allocation
      let vData = [];
      let rData = [];
      try {
        const [vRes, rRes] = await Promise.all([
          fetch('/php-backend/api.php?table=cab_vehicles'),
          fetch('/php-backend/api.php?table=cab_routes')
        ]);
        if (vRes.ok) {
          const allVehicles = await vRes.json();
          vData = allVehicles.filter((v: any) => v.active_status);
        }
        if (rRes.ok) {
          const allRoutes = await rRes.json();
          rData = allRoutes.filter((r: any) => r.active_status);
        }
      } catch (e) {
        console.error('Fetch cab baseline error:', e);
      }
      setVehiclesList(vData);
      setRoutesList(rData);

      // Load day-wise transport allocations
      const { data: transportsData, error: tErr } = await supabase
        .from('itinerary_transport')
        .select('*')
        .eq('itinerary_id', currentItinerary.id);

      if (tErr) throw tErr;

      const transportsMap: Record<string, any> = {};
      (transportsData || []).forEach(t => {
        if (t.itinerary_day_id) {
          transportsMap[t.itinerary_day_id] = {
            id: t.id,
            cab_rate_id: t.cab_rate_id,
            transport_type: t.transport_type,
            vehicle_type: t.vehicle_type,
            route_from: t.route_from,
            route_to: t.route_to,
            distance_km: t.distance_km,
            pickup_time: t.pickup_time,
            pickup_date: t.pickup_date,
            rate_type: t.rate_type,
            rate: Number(t.rate),
            total_cost: Number(t.total_cost),
            gst_cost: Number(t.gst_cost),
            driver_cost: Number(t.driver_cost),
            toll_charges: Number(t.toll_charges),
            parking_charges: Number(t.parking_charges),
            state_tax: Number(t.state_tax),
            permit_charges: Number(t.permit_charges),
            supplier_cost: Number(t.supplier_cost),
            markup_percentage: Number(t.markup_percentage),
            markup_amount: Number(t.markup_amount),
            selling_cost: Number(t.selling_cost),
            profit_margin: Number(t.profit_margin),
            gst_percentage: Number(t.gst_percentage),
            gst_included: t.gst_included,
            base_cost: Number(t.base_cost),
            season: t.rate_type || 'Normal Season',
            isManual: false
          };
        }
      });
      setItineraryTransports(transportsMap);

      for (const day of processedDays) {
        if (day.accommodation_city) {
          fetchHotelsForCity(day.id, day.accommodation_city);
        }
      }

    } catch (err: any) {
      toast({ title: 'Error loading itinerary', description: err.message, variant: 'destructive' });
    } finally {
      setItineraryLoading(false);
    }
  };

  const fetchHotelsForCity = async (dayId: string, city: string) => {
    try {
      let cData: any = null;
      try {
        const cRes = await fetch(`${API_BASE}/api.php?table=cities&city_name=${encodeURIComponent(city)}`);
        if (cRes.ok) {
          const citiesArr = await cRes.json();
          cData = Array.isArray(citiesArr) && citiesArr.length > 0 ? citiesArr[0] : null;
        }
      } catch (e) {
        console.error('Error fetching city for hotels:', e);
      }

      let data = [];
      try {
        const res = await fetch('/php-backend/hotels.php');
        if (res.ok) {
          const allHotels = await res.json();
          if (cData) {
            data = allHotels.filter((h: any) => h.active_status && h.city_id === cData.id);
          } else {
            data = allHotels.filter((h: any) => h.active_status && h.city && h.city.toLowerCase().includes(city.toLowerCase()));
          }
        }
      } catch (err) {
        console.error('Fetch hotels for city error:', err);
      }
      setActiveItineraryHotelsList(prev => ({
        ...prev,
        [dayId]: data || []
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoomsForItinHotel = async (dayId: string, hotelId: string) => {
    try {
      const res = await fetch(`/php-backend/api.php?table=room_categories`);
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const allRooms = await res.json();
      const data = allRooms.filter((r: any) => r.hotel_id === hotelId && r.active_status);
      
      setActiveItineraryRoomsList(prev => ({
        ...prev,
        [dayId]: data || []
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const calculateHotelRate = async (dayId: string, hotelId: string, roomCatName: string, mealPlan: string, date: string, roomConfig: any) => {
    try {
      const res = await fetch(`/php-backend/api.php?table=room_categories`);
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const allRooms = await res.json();
      const roomCat = allRooms.find((r: any) => r.hotel_id === hotelId && r.room_category_name === roomCatName);
      
      if (!roomCat) return null;

      const { data: contract } = await supabase
        .from('hotel_contracts')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('active_status', true)
        .lte('valid_from', date)
        .gte('valid_to', date)
        .maybeSingle();

      if (!contract) return null;

      const { data: season } = await supabase
        .from('seasons')
        .select('*')
        .eq('hotel_id', hotelId)
        .lte('start_date', date)
        .gte('end_date', date)
        .maybeSingle();

      let rateQuery = supabase
        .from('hotel_contract_rates')
        .select('*')
        .eq('contract_id', contract.id)
        .eq('room_category_id', roomCat.id)
        .eq('meal_plan_id', mealPlan)
        .eq('active_status', true);

      if (season) {
        rateQuery = rateQuery.eq('season_id', season.id);
      } else {
        rateQuery = rateQuery.is('season_id', null);
      }

      let { data: rateData } = await rateQuery.maybeSingle();

      if (!rateData && season) {
        const { data: fbRate } = await supabase
          .from('hotel_contract_rates')
          .select('*')
          .eq('contract_id', contract.id)
          .eq('room_category_id', roomCat.id)
          .eq('meal_plan_id', mealPlan)
          .is('season_id', null)
          .eq('active_status', true)
          .maybeSingle();
        rateData = fbRate;
      }

      if (!rateData) return null;

      const singleRooms = roomConfig.singleRooms || 0;
      const doubleRooms = roomConfig.doubleRooms || 0;
      const tripleRooms = roomConfig.tripleRooms || 0;
      const extraAdults = roomConfig.extraAdults || 0;
      const childrenWithBed = roomConfig.childrenWithBed || 0;
      const childrenNoBed = roomConfig.childrenNoBed || 0;

      let baseCost = 
        (singleRooms * Number(rateData.single_rate)) +
        (doubleRooms * Number(rateData.double_rate)) +
        (tripleRooms * Number(rateData.triple_rate)) +
        (extraAdults * Number(rateData.extra_adult_rate)) +
        (childrenWithBed * Number(rateData.child_with_bed_rate)) +
        (childrenNoBed * Number(rateData.child_without_bed_rate));

      const dayOfWeek = new Date(date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      if (isWeekend && rateData.weekend_surcharge) {
        baseCost += Number(rateData.weekend_surcharge) * (singleRooms + doubleRooms + tripleRooms);
      }

      if (season && season.season_type === 'Peak Season' && rateData.peak_season_surcharge) {
        baseCost += Number(rateData.peak_season_surcharge) * (singleRooms + doubleRooms + tripleRooms);
      }

      const rateType = rateData.rate_type || 'exclusive';
      const gstPercentage = rateData.gst_percentage !== null && rateData.gst_percentage !== undefined
        ? Number(rateData.gst_percentage)
        : (Number(contract.gst_percentage) || 18);

      let roomCost = 0;
      let gstAmt = 0;
      let totalCost = 0;

      if (rateType === 'inclusive') {
        totalCost = baseCost;
        roomCost = totalCost / (1 + (gstPercentage / 100));
        gstAmt = totalCost - roomCost;
      } else {
        roomCost = baseCost;
        gstAmt = roomCost * (gstPercentage / 100);
        totalCost = roomCost + gstAmt;
      }

      return {
        rate_per_night: roomCost / ((singleRooms + doubleRooms + tripleRooms) || 1),
        room_cost: roomCost,
        gst_cost: gstAmt,
        total_cost: totalCost,
        currency: contract.currency,
        gst_applied: gstPercentage
      };
    } catch (err) {
      console.error('Error calculating rate:', err);
      return null;
    }
  };

  const calculateCabRate = async (dayId: string, vehicleType: string, routeId: string, season: string) => {
    try {
      const vRes = await fetch('/php-backend/api.php?table=cab_vehicles');
      if (!vRes.ok) return null;
      const vehicles = await vRes.json();
      const vehicle = vehicles.find((v: any) => v.vehicle_type === vehicleType && v.active_status);
      if (!vehicle) return null;

      const rRes = await fetch('/php-backend/api.php?table=cab_contract_rates');
      if (!rRes.ok) return null;
      const allRates = await rRes.json();
      
      let rateData = allRates.find((r: any) => 
        r.vehicle_id === vehicle.id && 
        r.active_status && 
        (routeId ? r.route_id === routeId : !r.route_id) && 
        r.season === season
      );
      
      if (!rateData && season) {
        rateData = allRates.find((r: any) => 
          r.vehicle_id === vehicle.id && 
          r.active_status && 
          (routeId ? r.route_id === routeId : !r.route_id)
        );
      }

      if (!rateData) return null;

      const driverAllowance = Number(rateData.driver_allowance) || 0;
      const tollCharges = Number(rateData.toll_charges) || 0;
      const parkingCharges = Number(rateData.parking_charges) || 0;
      const stateTax = Number(rateData.state_tax) || 0;
      const permitCharges = Number(rateData.permit_charges) || 0;
      const baseCostVal = Number(rateData.base_cost) || Number(rateData.daily_rate) || Number(rateData.transfer_cost) || Number(rateData.vehicle_cost) || 0;

      const gstPercentage = Number(rateData.gst_percentage) || 5;
      const gstIncluded = rateData.gst_included || false;

      let netCost = baseCostVal;
      let gstAmt = 0;
      let totalCost = baseCostVal;

      if (gstIncluded) {
        totalCost = baseCostVal;
        netCost = totalCost / (1 + (gstPercentage / 100));
        gstAmt = totalCost - netCost;
      } else {
        netCost = baseCostVal;
        gstAmt = netCost * (gstPercentage / 100);
        totalCost = netCost + gstAmt;
      }

      const finalCost = totalCost + driverAllowance + tollCharges + parkingCharges + stateTax + permitCharges;
      const markupPercent = Number(rateData.markup_percentage) || 0;
      const markupAmt = finalCost * (markupPercent / 100);
      const sellingCost = finalCost + markupAmt;
      const profitMargin = sellingCost - (netCost + gstAmt + driverAllowance + tollCharges + parkingCharges + stateTax + permitCharges);

      return {
        cab_rate_id: rateData.id,
        base_cost: netCost,
        gst_cost: gstAmt,
        driver_cost: driverAllowance,
        toll_charges: tollCharges,
        parking_charges: parkingCharges,
        state_tax: stateTax,
        permit_charges: permitCharges,
        total_cost: finalCost,
        gst_included: gstIncluded,
        gst_percentage: gstPercentage,
        markup_percentage: markupPercent,
        markup_amount: markupAmt,
        selling_cost: sellingCost,
        profit_margin: profitMargin,
        rate_type: rateData.rate_model
      };
    } catch (err) {
      console.error('Error calculating cab rate:', err);
      return null;
    }
  };

  const onItinTransportChange = async (dayId: string, field: string, val: any) => {
    const day = itineraryDays.find(d => d.id === dayId);
    const transport = itineraryTransports[dayId] || {};
    const updatedTransport = { ...transport, [field]: val };

    setItineraryTransports(prev => ({
      ...prev,
      [dayId]: updatedTransport
    }));

    const vehicleType = field === 'vehicle_type' ? val : updatedTransport.vehicle_type;
    const routeId = field === 'route_id' ? val : updatedTransport.route_id;
    const season = field === 'season' ? val : updatedTransport.season;

    if (vehicleType && day?.date) {
      const rateInfo = await calculateCabRate(dayId, vehicleType, routeId, season || 'Normal Season');
      if (rateInfo) {
        setItineraryTransports(prev => ({
          ...prev,
          [dayId]: {
            ...prev[dayId],
            ...rateInfo
          }
        }));
      }
    }
  };

  const onItinTransportFieldChange = (dayId: string, field: string, val: any) => {
    setItineraryTransports(prev => {
      const currentTrans = prev[dayId] || {};
      const updated = { ...currentTrans, [field]: val };

      const baseCost = Number(updated.base_cost) || 0;
      const gstPercent = Number(updated.gst_percentage) || 5;
      const gstIncluded = updated.gst_included || false;

      let netCost = baseCost;
      let gstAmt = 0;
      let totalCost = baseCost;

      if (gstIncluded) {
        totalCost = baseCost;
        netCost = totalCost / (1 + (gstPercent / 100));
        gstAmt = totalCost - netCost;
      } else {
        netCost = baseCost;
        gstAmt = netCost * (gstPercent / 100);
        totalCost = netCost + gstAmt;
      }

      const driverCost = Number(updated.driver_cost) || 0;
      const tollCharges = Number(updated.toll_charges) || 0;
      const parkingCharges = Number(updated.parking_charges) || 0;
      const stateTax = Number(updated.state_tax) || 0;
      const permitCharges = Number(updated.permit_charges) || 0;

      const finalCost = totalCost + driverCost + tollCharges + parkingCharges + stateTax + permitCharges;
      const markupPercent = Number(updated.markup_percentage) || 0;
      const markupAmt = finalCost * (markupPercent / 100);
      const sellingCost = finalCost + markupAmt;
      const profitMargin = sellingCost - (netCost + gstAmt + driverCost + tollCharges + parkingCharges + stateTax + permitCharges);

      return {
        ...prev,
        [dayId]: {
          ...updated,
          base_cost: netCost,
          gst_cost: gstAmt,
          total_cost: finalCost,
          markup_amount: markupAmt,
          selling_cost: sellingCost,
          profit_margin: profitMargin
        }
      };
    });
  };

  const handleSaveItinerary = async () => {
    if (!activeItinerary) return;
    setLoading(true);
    try {
      for (const day of itineraryDays) {
        const { error: dErr } = await supabase
          .from('itinerary_days')
          .update({
            city: day.city,
            accommodation_city: day.accommodation_city,
            title: day.title,
            description: day.description
          })
          .eq('id', day.id);
        if (dErr) throw dErr;
      }

      let totalHotelCost = 0;
      for (const day of itineraryDays) {
        const stay = itineraryHotels[day.id];
        if (stay && stay.hotel_id) {
          totalHotelCost += stay.total_cost;
          let finalRoomCost = stay.room_cost;
          let finalGstCost = stay.gst_cost;

          if (finalRoomCost === undefined || finalRoomCost === null || stay.isManual) {
            const selectedHotel = (activeItineraryHotelsList[day.id] || []).find((h: any) => h.id === stay.hotel_id);
            const hotelCountry = selectedHotel?.country || 'India';
            const ratePerNight = stay.rate_per_night || 0;
            const suggestedGst = getSuggestedTaxRate(hotelCountry, ratePerNight, true);
            const totalCost = stay.total_cost || 0;
            
            finalRoomCost = totalCost / (1 + (suggestedGst / 100));
            finalGstCost = totalCost - finalRoomCost;
          }

          const payload = {
            itinerary_id: activeItinerary.id,
            itinerary_day_id: day.id,
            hotel_id: stay.hotel_id,
            check_in_date: day.date,
            check_out_date: new Date(new Date(day.date).getTime() + stay.nights * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            nights: stay.nights || 1,
            room_category: stay.room_category || 'Standard',
            meal_plan: stay.meal_plan || 'CP',
            room_configuration: stay.room_configuration || { doubleRooms: 1 },
            rate_per_night: stay.rate_per_night,
            total_cost: stay.total_cost,
            room_cost: finalRoomCost,
            gst_cost: finalGstCost,
            special_requests: stay.special_requests || ''
          };

          if (stay.id) {
            const { error: hErr } = await supabase
              .from('itinerary_hotels')
              .update(payload)
              .eq('id', stay.id);
            if (hErr) throw hErr;
          } else {
            const { data: newStay, error: hErr } = await supabase
              .from('itinerary_hotels')
              .insert([payload])
              .select()
              .single();
            if (hErr) throw hErr;
            setItineraryHotels(prev => ({
              ...prev,
              [day.id]: { ...stay, id: newStay.id }
            }));
          }
        } else {
          if (stay && stay.id) {
            const { error: dErr } = await supabase
              .from('itinerary_hotels')
              .delete()
              .eq('id', stay.id);
            if (dErr) throw dErr;
            setItineraryHotels(prev => {
              const copy = { ...prev };
              delete copy[day.id];
              return copy;
            });
          }
        }
      }

      let totalTransportCost = 0;
      for (const day of itineraryDays) {
        const trans = itineraryTransports[day.id];
        if (trans && trans.vehicle_type) {
          const selectedRoute = routesList.find(r => r.id === trans.route_id);
          const payload = {
            itinerary_id: activeItinerary.id,
            itinerary_day_id: day.id,
            cab_rate_id: trans.cab_rate_id || null,
            transport_type: trans.rate_type || 'Per Day',
            vehicle_type: trans.vehicle_type,
            route_from: selectedRoute?.source || trans.route_from || '',
            route_to: selectedRoute?.destination || trans.route_to || '',
            distance_km: selectedRoute ? Number(selectedRoute.distance_km) : (Number(trans.distance_km) || 0),
            pickup_date: day.date,
            rate: Number(trans.base_cost) || 0,
            total_cost: Number(trans.total_cost) || 0,
            base_cost: Number(trans.base_cost) || 0,
            gst_cost: Number(trans.gst_cost) || 0,
            driver_cost: Number(trans.driver_cost) || 0,
            toll_charges: Number(trans.toll_charges) || 0,
            parking_charges: Number(trans.parking_charges) || 0,
            state_tax: Number(trans.state_tax) || 0,
            permit_charges: Number(trans.permit_charges) || 0,
            supplier_cost: Number(trans.supplier_cost) || 0,
            markup_percentage: Number(trans.markup_percentage) || 0,
            markup_amount: Number(trans.markup_amount) || 0,
            selling_cost: Number(trans.selling_cost) || 0,
            profit_margin: Number(trans.profit_margin) || 0,
            gst_percentage: Number(trans.gst_percentage) || 5,
            gst_included: trans.gst_included || false
          };

          totalTransportCost += Number(payload.total_cost) || 0;

          if (trans.id) {
            const { error: tErr } = await supabase
              .from('itinerary_transport')
              .update(payload)
              .eq('id', trans.id);
            if (tErr) throw tErr;
          } else {
            const { data: newTrans, error: tErr } = await supabase
              .from('itinerary_transport')
              .insert([payload])
              .select()
              .single();
            if (tErr) throw tErr;
            setItineraryTransports(prev => ({
              ...prev,
              [day.id]: { ...trans, id: newTrans.id }
            }));
          }
        } else {
          if (trans && trans.id) {
            const { error: dErr } = await supabase
              .from('itinerary_transport')
              .delete()
              .eq('id', trans.id);
            if (dErr) throw dErr;
            setItineraryTransports(prev => {
              const copy = { ...prev };
              delete copy[day.id];
              return copy;
            });
          }
        }
      }

      const finalTransportCost = totalTransportCost > 0 ? totalTransportCost : (Number(activeItinerary.transport_cost) || 0);
      const totalCost = totalHotelCost + finalTransportCost + (Number(activeItinerary.excursion_cost) || 0);
      const finalCost = totalCost * (1 + (Number(activeItinerary.markup_percentage) || 10) / 100);

      const { error: iErr } = await supabase
        .from('itineraries')
        .update({
          hotel_cost: totalHotelCost,
          transport_cost: finalTransportCost,
          total_cost: totalCost,
          final_cost: finalCost,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeItinerary.id);
      
      if (iErr) throw iErr;

      await leadService.updateLead(leadId, {
        packagePrice: finalCost
      });

      toast({ title: 'Success', description: 'Itinerary saved successfully!' });
      navigate(`/crm/leads/${leadId}`);
    } catch (err: any) {
      toast({ title: 'Error Saving Itinerary', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'New': return 'secondary';
      case 'Assigned': return 'outline';
      case 'Follow-up Due': return 'outline';
      case 'Quote Sent': return 'default';
      case 'Booking Confirmed': return 'secondary';
      case 'Closed Lost': return 'destructive';
      default: return 'outline';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRandomBgColor = (name: string | null | undefined) => {
    const colors = [
      'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20',
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20',
      'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/20',
      'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20',
      'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20',
      'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 border border-cyan-500/20',
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const renderStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase() || '';
    let colorClasses = 'bg-slate-100 text-slate-700 border-slate-250 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    let pulseBg = 'bg-slate-500';
    
    if (normalized.includes('new') || normalized.includes('inquiry')) {
      colorClasses = 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
      pulseBg = 'bg-blue-500';
    } else if (normalized.includes('assigned')) {
      colorClasses = 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30';
      pulseBg = 'bg-orange-500';
    } else if (normalized.includes('follow-up')) {
      colorClasses = 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30';
      pulseBg = 'bg-amber-500';
    } else if (normalized.includes('quote') || normalized.includes('sent')) {
      colorClasses = 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30';
      pulseBg = 'bg-purple-500';
    } else if (normalized.includes('booking') || normalized.includes('converted') || normalized.includes('won') || normalized.includes('approved')) {
      colorClasses = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30';
      pulseBg = 'bg-emerald-500';
    } else if (normalized.includes('closed') || normalized.includes('dropped') || normalized.includes('lost') || normalized.includes('cancelled')) {
      colorClasses = 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30';
      pulseBg = 'bg-rose-500';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${pulseBg} animate-pulse`} />
        {status}
      </span>
    );
  };

  const getRedesignedStatusBadge = (status: Lead['status']) => {
    let styles = "bg-gray-100 text-slate-700";
    switch (status) {
      case 'New':
        styles = "bg-[#C9A25A]/15 text-[#C9A25A] border border-[#C9A25A]/30";
        break;
      case 'Assigned':
        styles = "bg-[#FFF3E0] text-[#E65100]";
        break;
      case 'Follow-up Due':
        styles = "bg-[#FFF8E1] text-[#F57F17]";
        break;
      case 'Quote Sent':
        styles = "bg-[#E3F2FD] text-[#1565C0]";
        break;
      case 'Booking Confirmed':
        styles = "bg-[#E8F5E9] text-[#2E7D32]";
        break;
      case 'Closed Lost':
        styles = "bg-[#FFEBEE] text-[#C62828]";
        break;
    }
    return (
      <span className={`text-[11px] font-semibold px-2 py-1 rounded-[4px] border-none inline-block text-center whitespace-nowrap ${styles}`}>
        {status}
      </span>
    );
  };

  const formatLeadId = (lead: any) => {
    if (!lead) return '#GF-1001';
    if (lead.enquiry_number) return `#${lead.enquiry_number.startsWith('#') ? lead.enquiry_number.slice(1) : lead.enquiry_number}`;
    if (lead.lead_id) return `#${lead.lead_id.startsWith('#') ? lead.lead_id.slice(1) : lead.lead_id}`;
    if (lead.id) {
      const raw = String(lead.id).replace(/-/g, '');
      return `#GF-${raw.slice(0, 6).toUpperCase()}`;
    }
    return '#GF-1001';
  };

  const renderAssignedExecutive = (assignedTo: string | null) => {
    const name = getAssignedUserName(assignedTo);
    if (name === 'Unassigned') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/40">
          <User className="w-3 h-3 text-muted-foreground/60" />
          Unassigned
        </span>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold border border-amber-500/20 shadow-sm">
          {getInitials(name)}
        </div>
        <span className="font-semibold text-xs text-foreground truncate max-w-[120px]">{name}</span>
      </div>
    );
  };

  // Check if auth state is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user logged in
  if (!user) {
    return null;
  }

  if (userProfile && !userProfile.approved && !isAdminRole(userProfile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96 shadow-lg border-border">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-bold mb-2">Pending Admin Approval</h2>
            <p className="text-sm text-muted-foreground mb-4">Your account is awaiting registration confirmation from an administrator. Please check back later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Real-time calculations for dashboard
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const todayLeads = leads.filter(l => l.created_at?.startsWith(todayStr) || (l as any).lead_created_date?.startsWith(todayStr));
  const openLeads = leads.filter(l => l.status !== 'Closed Lost' && l.status !== 'Booking Confirmed');
  const followUpsDue = leads.filter(l => {
    if (!l.follow_up_date || l.status === 'Closed Lost' || l.status === 'Booking Confirmed') return false;
    const fDate = new Date(l.follow_up_date);
    fDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return fDate.getTime() <= today.getTime();
  });
  const pendingQuotes = leads.filter(l => l.status === 'Quote Sent');
  const confirmedBookings = leads.filter(l => l.status === 'Booking Confirmed');
  
  const totalExpectedRevenue = openLeads.reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0);
  
  const monthlySalesLeads = confirmedBookings.filter(l => {
    const d = new Date(l.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlySalesRevenue = monthlySalesLeads.reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0);

  const conversionRate = leads.length > 0 ? Math.round((confirmedBookings.length / leads.length) * 100) : 0;

  // A function to generate random sparkline points that look like positive trend
  const getSparklinePath = (seed: number) => {
    const points = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      const x = (i / (count - 1)) * 60;
      const y = 20 - (Math.sin(i * 1.2 + seed) * 6 + Math.cos(i * 0.8) * 4);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const Sparkline = ({ seed, color = '#f59e0b' }: { seed: number; color?: string }) => {
    return (
      <svg className="w-16 h-8 overflow-visible" viewBox="0 0 60 25">
        <path
          d={getSparklinePath(seed)}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const getDestinationStats = () => {
    // Dynamically derive top destinations from actual lead data
    const destSet = new Set<string>();
    leads.forEach(l => {
      if ((l as any).lead_destination) {
        const parsed = parseDestinations((l as any).lead_destination);
        parsed.forEach(p => { if (p.city) destSet.add(p.city); });
      } else if (l.destinations) {
        const parsed = parseDestinations(l.destinations);
        parsed.forEach(p => { if (p.city) destSet.add(p.city); });
      } else if (l.country && l.country !== 'India') {
        destSet.add(l.country);
      } else if (l.state) {
        destSet.add(l.state);
      }
    });
    // Fallback popular destinations if no lead data yet
    const destinations = destSet.size > 0
      ? Array.from(destSet).slice(0, 10)
      : ['Goa', 'Kashmir', 'Kerala', 'Rajasthan', 'Himachal Pradesh', 'Uttarakhand', 'Andaman', 'Sikkim', 'Dubai', 'Bali'];
    return destinations.map(dest => {
      const destLeads = leads.filter(l => 
        (l.destinations && l.destinations.toLowerCase().includes(dest.toLowerCase())) ||
        (l.country && l.country.toLowerCase().includes(dest.toLowerCase())) ||
        (l.state && l.state.toLowerCase().includes(dest.toLowerCase())) ||
        ((l as any).lead_destination && (l as any).lead_destination.some((d: string) => d.toLowerCase().includes(dest.toLowerCase())))
      );
      const revenue = destLeads.reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0);
      const converted = destLeads.filter(l => l.status === 'Booking Confirmed');
      const rate = destLeads.length > 0 ? Math.round((converted.length / destLeads.length) * 100) : 0;
      return {
        name: dest,
        count: destLeads.length,
        revenue,
        bookings: converted.length,
        conversionRate: rate
      };
    }).sort((a, b) => b.count - a.count);
  };

  const getTeamPerformance = () => {
    const performanceMap: Record<string, { name: string; assigned: number; converted: number; revenue: number }> = {};
    
    leads.forEach(l => {
      const agentId = l.assigned_to;
      const agentName = l.agent_name || (agentId ? getAssignedUserName(agentId) : 'Unassigned');
      if (!agentId) return;
      if (!performanceMap[agentId]) {
        performanceMap[agentId] = { name: agentName, assigned: 0, converted: 0, revenue: 0 };
      }
      performanceMap[agentId].assigned += 1;
      if (l.status === 'Booking Confirmed') {
        performanceMap[agentId].converted += 1;
        performanceMap[agentId].revenue += (Number(l.expected_booking_value) || 0);
      }
    });

    return Object.values(performanceMap).sort((a, b) => b.revenue - a.revenue);
  };

  const handleFunnelClick = (stage: string) => {
    if (stage === 'High-Priority') {
      setFilterStatus('all');
      setFilterSource('all');
      setSearchTerm('');
    } else {
      setFilterStatus(stage);
    }
    navigate('/crm/leads');
  };

  const funnelStages = [
    { name: 'New Leads', filter: 'New', count: leads.filter(l => l.status === 'New').length, revenue: leads.filter(l => l.status === 'New').reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0), color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/10' },
    { name: 'Assigned', filter: 'Assigned', count: leads.filter(l => l.status === 'Assigned').length, revenue: leads.filter(l => l.status === 'Assigned').reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0), color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/10' },
    { name: 'Follow-up Due', filter: 'Follow-up Due', count: leads.filter(l => l.status === 'Follow-up Due').length, revenue: leads.filter(l => l.status === 'Follow-up Due').reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0), color: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-500/10' },
    { name: 'Qualified', filter: 'High-Priority', count: leads.filter(l => l.priority === 'High' && l.status !== 'Booking Confirmed' && l.status !== 'Closed Lost').length, revenue: leads.filter(l => l.priority === 'High' && l.status !== 'Booking Confirmed' && l.status !== 'Closed Lost').reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0), color: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-500/10' },
    { name: 'Quotation Sent', filter: 'Quote Sent', count: leads.filter(l => l.status === 'Quote Sent').length, revenue: leads.filter(l => l.status === 'Quote Sent').reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0), color: 'from-indigo-600 to-[#c5a059]', shadow: 'shadow-indigo-500/10' },
    { name: 'Confirmed Bookings', filter: 'Booking Confirmed', count: leads.filter(l => l.status === 'Booking Confirmed').length, revenue: leads.filter(l => l.status === 'Booking Confirmed').reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0), color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/10' }
  ];

  if (currentSection === 'brochure' || currentSection === 'voucher' || currentSection === 'invoice') {
    return (
      <div className="min-h-screen bg-[#0B1026] text-slate-100 flex flex-col font-poppins">
        <Suspense fallback={<NavyGoldLoader />}>
          <ItineraryBuilder 
            leadId={leadId || ''}
            activeLead={activeLead || { id: leadId, customer_name: 'Guest' }}
            onBack={() => window.close()}
            userProfile={userProfile}
            initialDocView={currentSection}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1026] text-slate-100 flex font-poppins crm-navy-theme">
      {/* Left Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#0B1026] text-slate-100 flex flex-col transition-all duration-300 border-r border-white/10 shrink-0 shadow-2xl`}>
        {/* Logo Section */}
        <div className="h-16 px-4 border-b border-white/5 flex justify-between items-center overflow-hidden shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img 
              src="/ghumo-firoo-logo.png" 
              alt="Ghumo Firoo Journeys" 
              className="h-10 w-auto object-contain shrink-0 cursor-pointer hover:scale-105 transition-all drop-shadow-md" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            {!sidebarCollapsed && (
              <span className="text-sm font-extrabold tracking-tight text-white animate-in fade-in duration-200 font-montserrat flex flex-col leading-none text-left">
                <span className="flex items-center gap-0.5 text-xs font-black">
                  Ghumo<span className="text-[#C9A25A]">Firoo</span>
                </span>
                <span className="text-[8px] font-sans font-black tracking-[0.18em] text-[#D8B97A] uppercase mt-0.5">Journeys CRM</span>
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(true)}
              className="text-slate-400 hover:text-white hover:bg-white/5 h-8 w-8 rounded-xl transition-all"
            >
              <ChevronRight className="h-4 w-4 rotate-180 text-slate-400" />
            </Button>
          )}
        </div>

        {/* Collapsed Toggle if collapsed */}
        {sidebarCollapsed && (
          <div className="p-3 border-b border-white/5 flex justify-center shrink-0">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5 h-8 w-8 rounded-xl" onClick={() => setSidebarCollapsed(false)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard', path: '/crm' },
            { label: 'Leads', icon: Users, section: 'leads', path: '/crm/leads', activeSections: ['leads', 'profile', 'add-lead', 'edit-lead', 'followups', 'itinerary'], moduleId: 'leads' },
            { label: 'Customers', icon: User, section: 'customers', path: '/crm/customers' },
            { label: 'Opportunities', icon: Sparkles, section: 'opportunities', path: '/crm/opportunities' },
            { label: 'Quotes', icon: FileText, section: 'quotes', path: '/crm/quotes' },
            { label: 'Performance', icon: UserCheck, section: 'user-dashboard', path: '/crm/user-dashboard' },
            { label: 'Itineraries', icon: Map, section: 'itineraries-mocked', path: '/crm/itineraries' },
            { label: 'Packages', icon: Package, section: 'packages', path: '/crm/packages', activeSections: ['packages'], moduleId: 'packages' },
            { label: 'Blogs', icon: FileText, section: 'blogs', path: '/crm/blogs', activeSections: ['blogs'], moduleId: 'blogs' },
            { label: 'Hotels', icon: Landmark, section: 'hotels', path: '/crm/hotels', moduleId: 'hotels' },
            { label: 'Cabs', icon: Car, section: 'cabs', path: '/crm/cabs', moduleId: 'cabs' },
            { label: 'Activities', icon: Activity, section: 'activities', path: '/crm/activities', moduleId: 'activities' },
            { label: 'Sightseeing', icon: Map, section: 'sightseeings', path: '/crm/sightseeings', moduleId: 'sightseeings' },
            { label: 'India Explorer', icon: Globe, section: 'india-explorer', path: '/crm/india-explorer' },
            { label: 'Visas', icon: Globe, section: 'visas', path: '/crm/visas', moduleId: 'visas' },
            { label: 'Role & Agent Management', icon: ShieldCheck, section: 'agent-roles', path: '/crm/role-management' },
            { label: 'Bulk Upload Hub', icon: FileSpreadsheet, section: 'bulk-upload', path: '/crm/bulk-upload', moduleId: 'bulk_upload' },
            { label: 'Audit Logs', icon: ShieldCheck, section: 'audit-logs', path: '/crm/audit-logs', moduleId: 'audit_logs' },
            { label: 'Suppliers', icon: Share2, section: 'suppliers', path: '/crm/suppliers' },
            { label: 'Reviews', icon: Star, section: 'reviews', path: '/crm/reviews' },
            { label: 'Email Marketing', icon: Mail, section: 'email-marketing', path: '/crm/email-marketing' },
            { label: 'Payments', icon: IndianRupee, section: 'payments-mocked', path: '/crm/payments' },
            { label: 'Reports', icon: TrendingUp, section: 'reports-mocked', path: '/crm/reports', moduleId: 'reports' },
          ].filter((item) => {
            if (item.moduleId && userPermissions[item.moduleId] === false) {
              return false;
            }
            return true;
          }).map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.section || (item.activeSections && item.activeSections.includes(currentSection));
            return (
              <Button
                key={item.label}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3.5'} ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] text-[#0B1026] hover:opacity-90 font-extrabold shadow-md shadow-[#C9A25A]/20 hover:scale-[1.02] active:scale-95' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200'
                } h-11 rounded-xl`}
                onClick={() => navigate(item.path)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4.5 w-4.5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} shrink-0`} />
                {!sidebarCollapsed && <span className="text-xs font-semibold">{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Settings button in sidebar footer */}
        {/* Settings & User Management */}
        <div className="px-4 py-3 border-t border-white/5 shrink-0 space-y-1.5">
          <Button
            variant="ghost"
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3.5'} text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200 ${
              currentSection === 'destinations' ? 'bg-gradient-warm text-[#0B1026] font-bold shadow-md' : ''
            } h-10 rounded-xl`}
            onClick={() => navigate('/crm/settings/destinations')}
            title={sidebarCollapsed ? 'Destination Settings' : undefined}
          >
            <Globe className={`h-4.5 w-4.5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} shrink-0`} />
            {!sidebarCollapsed && <span className="text-xs font-semibold">Destinations</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3.5'} text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200 h-10 rounded-xl`}
            onClick={() => setUserManagementOpen(true)}
            title={sidebarCollapsed ? 'User & Lead Settings' : undefined}
          >
            <UserPlus className={`h-4.5 w-4.5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} shrink-0 text-amber-400`} />
            {!sidebarCollapsed && <span className="text-xs font-bold text-slate-100">Users & Settings</span>}
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#C9A25A]/15 border border-[#C9A25A]/40 text-[#C9A25A] rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md shadow-[#C9A25A]/10">
              {(userProfile?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold truncate text-slate-100">{userProfile?.full_name || user?.email?.split('@')[0] || 'Agent User'}</p>
                <p className="text-[10px] text-[#C9A25A] capitalize font-medium">{userProfile?.role || 'Operations Agent'}</p>
              </div>
            )}
          </div>
          
          {!sidebarCollapsed ? (
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full bg-red-500/10 hover:bg-red-650 text-red-500 hover:text-white border border-red-500/20 hover:border-red-600 font-bold flex items-center justify-center gap-2 animate-in fade-in duration-200 h-9 rounded-xl transition-all"
              onClick={signOut}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              size="icon" 
              className="w-9 h-9 bg-red-500/10 hover:bg-red-650 text-red-500 hover:text-white border border-red-500/20 hover:border-red-600 flex items-center justify-center mx-auto rounded-xl transition-all"
              onClick={signOut}
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header (Suppressed in Full-Screen Itinerary Builder Mode) */}
        {currentSection !== 'itinerary' && (
          <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center sticky top-0 z-40 text-slate-100 shadow-md">
            <div>
              <h1 className="text-xl font-black tracking-wider text-white font-montserrat flex items-center gap-3 uppercase">
                <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo" className="h-9 w-auto object-contain drop-shadow-md shrink-0 inline-block" />
                {currentSection === 'dashboard' && 'Ghumo Firoo Travels Operations Center'}
                {currentSection === 'user-dashboard' && 'User Performance Dashboard'}
                {currentSection === 'leads' && 'Leads Pipeline'}
                {currentSection === 'opportunities' && 'Sales Opportunities Pipeline'}
                {currentSection === 'quotes' && 'Quote Workspace'}
                {currentSection === 'customers' && 'Customers Database'}
                {currentSection === 'add-lead' && 'Add New Travel Lead'}
                {currentSection === 'edit-lead' && 'Edit Travel Lead'}
                {currentSection === 'profile' && `Lead Profile: ${activeLead?.customer_name}`}
                {currentSection === 'followups' && `Follow-up History`}
                {currentSection === 'itineraries-mocked' && 'Global Itinerary Workspace'}
                {currentSection === 'packages' && 'Packages Directory'}
                {currentSection === 'blogs' && 'Blog Articles Management'}
                {currentSection === 'hotels' && 'Hotel Contracts Management'}
                {currentSection === 'cabs' && 'Cab Contracts Management'}
                {currentSection === 'activities' && 'Activity Master'}
                {currentSection === 'sightseeings' && 'Sightseeing Master'}
                {currentSection === 'visas' && 'Visa Master'}
                {currentSection === 'reviews' && 'Trip Review Moderation'}
                {currentSection === 'suppliers-mocked' && 'Supplier Database'}
                {currentSection === 'payments-mocked' && 'Payments & Accounts'}
                {currentSection === 'reports-mocked' && 'Operational Reports'}
              </h1>
              <Breadcrumb items={getBreadcrumbItems()} className="mt-1 font-medium" />
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {(currentSection === 'leads' || currentSection === 'dashboard') && (
                <Button onClick={() => navigate('/crm/leads/new')} className="bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] hover:opacity-90 text-[#0B1026] hover:scale-[1.02] active:scale-95 font-extrabold shadow-md shadow-[#C9A25A]/20 h-10 px-5 rounded-xl text-xs transition-all border-0">
                  <Plus className="h-4 w-4 mr-1.5 text-[#0B1026]" />
                  Add Lead
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshSystemData}
                disabled={isRefreshingData}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400 text-xs h-10 px-4 rounded-xl font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 text-slate-950 font-bold ${isRefreshingData ? 'animate-spin' : ''}`} />
                <span className="font-black text-slate-950">{isRefreshingData ? 'Refreshing...' : 'Refresh Data'}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCsvImportOpen(true)} className="bg-slate-800/90 text-slate-100 border-slate-700 hover:bg-slate-700 hover:text-white text-xs h-10 px-4 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm">
                <Upload className="h-4 w-4 text-amber-400" />
                Import CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => setUserManagementOpen(true)} className="bg-slate-800/90 text-slate-100 border-slate-700 hover:bg-slate-700 hover:text-white text-xs h-10 px-4 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-sm">
                <UserPlus className="h-4 w-4 text-amber-400" />
                Users & Settings
              </Button>
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className={currentSection === 'itinerary' ? 'flex-1 p-0 overflow-hidden h-screen bg-[#0B1026]' : 'flex-1 p-6'}>
          {/* DASHBOARD SECTION */}
          {currentSection === 'dashboard' && (
            <div className="space-y-8 text-left">
              {/* Premium Welcome Banner with Brand Logo */}
              <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#0b132a] to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
                  <div className="flex items-start gap-4">
                    <img 
                      src="/ghumo-firoo-logo.png" 
                      alt="Ghumo Firoo Journeys" 
                      className="h-16 w-auto object-contain shrink-0 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-lg drop-shadow-md hidden sm:block" 
                    />
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-amber-500/15 text-amber-400 border border-amber-500/35 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" /> Ghumo Firoo Operations Center
                        </span>
                        <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" /> 🟢 Live Connected
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white leading-tight uppercase tracking-tight">
                        Welcome Back, <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">{userProfile?.full_name || 'Superadmin'}</span>
                      </h2>
                      <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                        Real-time luxury travel operations, lead pipeline performance, and automated customer proposal workflows for <strong className="text-amber-400 font-extrabold">Ghumo Firoo Journeys</strong>.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    <Button 
                      onClick={fetchLeads} 
                      variant="outline"
                      className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold border border-slate-700 h-10 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      Refresh Data
                    </Button>
                    <Button 
                      onClick={() => navigate('/crm/leads')} 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black h-10 px-5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <Users className="w-4 h-4 text-slate-950" />
                      View Sales Pipeline
                    </Button>
                  </div>
                </div>
              </div>

              {/* Interactive Operations Hub — Quick Launcher Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: '+ Add New Lead', icon: Plus, path: '/crm/leads/new', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400' },
                  { label: '🗺️ Itinerary Builder', icon: Map, path: '/crm/itineraries', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400' },
                  { label: '📄 Create Quote', icon: FileText, path: '/crm/quotes', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400' },
                  { label: '💬 WhatsApp Broadcast', icon: MessageSquare, path: '/crm/leads', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400' },
                  { label: '👥 Users & Settings', icon: UserPlus, action: () => setUserManagementOpen(true), color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400' },
                  { label: '📊 Performance', icon: TrendingUp, path: '/crm/user-dashboard', color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400' }
                ].map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.label}
                      type="button"
                      onClick={() => cmd.action ? cmd.action() : navigate(cmd.path!)}
                      className={`bg-gradient-to-br ${cmd.color} border p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer shadow-sm text-center`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px] font-extrabold text-slate-100">{cmd.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Top Executive Summary Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Today's Leads", value: todayLeads.length, icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', trend: '+15%', seed: 1, clickFilter: () => { setSearchTerm(''); setFilterTravelDate(todayStr); setFilterStatus('all'); navigate('/crm/leads'); } },
                  { label: "Open Leads", value: openLeads.length, icon: Clock, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30', trend: '-2%', seed: 2, clickFilter: () => { setSearchTerm(''); setFilterStatus('New'); navigate('/crm/leads'); } },
                  { label: "Follow-Ups Due", value: followUpsDue.length, icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30', trend: '+8%', seed: 3, clickFilter: () => { setSearchTerm(''); setFilterStatus('Assigned'); navigate('/crm/leads'); } },
                  { label: "Pending Quotes", value: pendingQuotes.length, icon: FileText, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', trend: '+22%', seed: 4, clickFilter: () => { setSearchTerm(''); setFilterStatus('Quote Sent'); navigate('/crm/leads'); } },
                  { label: "Confirmed Bookings", value: confirmedBookings.length, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', trend: '+14%', seed: 5, clickFilter: () => { setSearchTerm(''); setFilterStatus('Booking Confirmed'); navigate('/crm/leads'); } },
                  { label: "Expected Pipeline", value: `₹${(totalExpectedRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', trend: '+18%', seed: 6, isGold: true },
                  { label: "Monthly Sales", value: `₹${(monthlySalesRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', trend: '+30%', seed: 7 },
                  { label: "Conversion Rate", value: `${conversionRate}%`, icon: Sparkles, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30', trend: '+3.5%', seed: 8 }
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <Card key={card.label} className="bg-card border border-border/60 hover:border-amber-500/50 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-[1.02] overflow-hidden relative rounded-2xl" onClick={card.clickFilter}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{card.label}</span>
                          <div className={`p-2.5 rounded-xl border ${card.bg} ${card.color} shadow-xs`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className={`text-2xl font-black tracking-tight ${card.isGold ? 'text-amber-600 dark:text-amber-400' : 'text-slate-950 dark:text-white'}`}>{card.value}</span>
                          <span className={`text-[10px] font-black ${card.trend.startsWith('-') ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{card.trend}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2.5 border-t border-border/30">
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 font-extrabold uppercase">Weekly Trend</span>
                          <Sparkline seed={card.seed} color={card.color.includes('emerald') ? '#10b981' : card.color.includes('rose') ? '#f43f5e' : card.color.includes('blue') ? '#3b82f6' : '#C9A25A'} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Live Master Inventory Counters Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Active Packages", value: dashboardSummary.packages_count, icon: Package, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', path: '/crm/packages' },
                  { label: "Contracted Hotels", value: dashboardSummary.hotels_count, icon: Hotel, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', path: '/crm/hotels' },
                  { label: "Published Blogs", value: dashboardSummary.blogs_count, icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30', path: '/crm/blogs' },
                  { label: "Trip Reviews", value: dashboardSummary.reviews_count, icon: Star, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30', path: '/crm/reviews' }
                ].map((inv) => {
                  const Icon = inv.icon;
                  return (
                    <Card key={inv.label} className="bg-card border border-border/60 hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group rounded-2xl overflow-hidden" onClick={() => navigate(inv.path)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">{inv.label}</span>
                          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{inv.value}</span>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${inv.bg} ${inv.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Main Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Lead Funnel */}
                  <Card className="bg-card border border-border/60 shadow-md rounded-2xl overflow-hidden">
                    <CardHeader className="p-5 border-b border-border/40 bg-gradient-to-r from-amber-500/5 to-transparent">
                      <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                        Sales Pipeline Funnel
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4.5">
                        {funnelStages.map((stage) => {
                          const percentage = leads.length > 0 ? Math.round((stage.count / leads.length) * 100) : 0;
                          return (
                            <div key={stage.name} className="flex items-center gap-4 cursor-pointer group" onClick={() => handleFunnelClick(stage.filter)}>
                              <div className="w-28 text-xs font-black text-slate-700 dark:text-slate-300 group-hover:text-amber-500 transition-colors uppercase tracking-wider text-right">{stage.name}</div>
                              <div className="flex-1 bg-muted/40 h-9 rounded-2xl overflow-hidden relative flex items-center px-4 border border-border/50 hover:border-amber-500/50 transition-all">
                                <div className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${stage.color} opacity-85 transition-all duration-500`} style={{ width: `${percentage || 5}%` }} />
                                <div className="relative z-10 flex justify-between w-full items-center text-xs font-extrabold text-slate-950 dark:text-white drop-shadow-xs">
                                  <span>{stage.count} Leads ({percentage}%)</span>
                                  <span>₹{stage.revenue.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Travel Sales Revenue Dashboard */}
                  <Card className="bg-card border border-border/60 shadow-md rounded-2xl">
                    <CardHeader className="p-5 border-b border-border/40">
                      <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4.5 h-4.5 text-amber-500" />
                        Revenue Analytics & Target Share
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: chart */}
                      <div className="md:col-span-2 flex flex-col justify-between space-y-4">
                        <div className="h-32 w-full flex items-end justify-between px-2 pt-4 border-b border-border/40">
                          {[40, 65, 50, 85, 95, 75, 110].map((val, idx) => (
                            <div key={idx} className="flex flex-col items-center space-y-2 w-full group">
                              <div className="rounded-t-lg w-8 transition-all duration-200 relative flex items-end justify-center" style={{ height: `${val}px`, background: `linear-gradient(to top, #C9A25A, #F5D77F)`, opacity: 0.85 }}>
                                <div className="absolute -top-7 bg-slate-900 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-amber-500/30">₹{(val * 10000).toLocaleString('en-IN')}</div>
                              </div>
                              <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase">Day {idx + 1}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-extrabold text-center italic">Calculated revenue pipeline in 7-day intervals</p>
                      </div>

                      {/* Right: details */}
                      <div className="space-y-4 flex flex-col justify-center">
                        {[
                          { label: 'Confirmed Booking Value', value: confirmedBookings.reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0), color: 'bg-emerald-500' },
                          { label: 'Expected Quote Value', value: pendingQuotes.reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0), color: 'bg-amber-500' },
                          { label: 'Lost / Closed Value', value: leads.filter(l => l.status === 'Closed Lost').reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0), color: 'bg-rose-500' }
                        ].map(rev => {
                          const total = leads.reduce((acc, l) => acc + (Number(l.expected_booking_value) || 0), 0) || 1;
                          const pct = Math.round((rev.value / total) * 100);
                          return (
                            <div key={rev.label} className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-extrabold gap-2">
                                <span className="text-slate-700 dark:text-slate-300 uppercase font-black text-[10px] flex-1 min-w-0 pr-1 truncate">{rev.label}</span>
                                <span className="text-slate-950 dark:text-white shrink-0">₹{rev.value.toLocaleString('en-IN')} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${rev.color}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Destination Analytics */}
                  <Card className="bg-card border border-border/60 shadow-md rounded-2xl">
                    <CardHeader className="p-5 border-b border-border/40">
                      <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4.5 h-4.5 text-amber-500" />
                        Trending Destinations & Conversion
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {getDestinationStats().slice(0, 4).map((dest, destIdx) => {
                          const shortName = (typeof dest.name === 'string' ? dest.name : 'Destination').split(/[·,]/)[0].trim().slice(0, 20);
                          return (
                          <div key={dest.name || `dest-${destIdx}`} className="bg-muted/30 border border-border/40 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                            <div className="space-y-1">
                              <Badge className="text-[9px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 uppercase tracking-wider px-2 py-0.5 truncate max-w-full block" variant="outline" title={String(dest.name || '')}>{shortName}</Badge>
                              <p className="text-[10px] text-slate-700 dark:text-slate-300 font-extrabold uppercase">{dest.count} Active Leads</p>
                            </div>
                            <div className="mt-3 space-y-1">
                              <p className="text-xs font-black text-slate-950 dark:text-white">₹{dest.revenue.toLocaleString('en-IN')}</p>
                              <div className="flex justify-between text-[8px] font-extrabold text-slate-600 dark:text-slate-400 uppercase">
                                <span>Conv. Rate</span>
                                <span className="text-emerald-600 dark:text-emerald-400">{dest.conversionRate}%</span>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Team Performance Leaderboard */}
                  <Card className="bg-card border border-border/60 shadow-md rounded-2xl">
                    <CardHeader className="p-4 border-b border-border/40">
                      <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-indigo-500" />
                        Sales Leaderboard
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {getTeamPerformance().slice(0, 5).map((agent, i) => {
                        const rankColors = ['bg-amber-500 text-slate-950 font-black', 'bg-slate-300 dark:bg-slate-700 text-slate-950 dark:text-white font-extrabold', 'bg-amber-700 text-white font-extrabold', 'bg-muted text-slate-600 dark:text-slate-400 font-bold'];
                        return (
                          <div key={agent.name || `agent-${i}`} className="flex items-center justify-between border-b border-border/30 pb-2.5 last:border-0 last:pb-0">
                            <div className="flex items-center space-x-3">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${rankColors[i] || rankColors[3]}`}>{i+1}</span>
                              <div>
                                <p className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wide">{agent.name}</p>
                                <p className="text-[9px] text-slate-600 dark:text-slate-400 font-bold uppercase">{agent.assigned} Leads ({agent.converted} Converted)</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-amber-600 dark:text-amber-400">₹{agent.revenue.toLocaleString('en-IN')}</p>
                              <div className="w-16 bg-muted/60 h-1 rounded-full overflow-hidden ml-auto mt-1">
                                <div className="h-full bg-amber-500" style={{ width: `${(agent.converted / (agent.assigned || 1)) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {getTeamPerformance().length === 0 && (
                        <p className="text-xs text-slate-500 font-semibold text-center py-4">No agent performance data logged yet.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Travel Departures/Arrivals Calendar */}
                  <Card className="bg-card border border-border/60 shadow-md rounded-2xl">
                    <CardHeader className="p-4 border-b border-border/40">
                      <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        Departure & Arrival Board
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 max-h-64 overflow-y-auto">
                      {leads.filter(l => l.trip_start_date || l.trip_end_date).slice(0, 6).map((l) => {
                        const isDeparture = l.trip_start_date ? true : false;
                        const dateStr = l.trip_start_date || l.trip_end_date || '';
                        return (
                          <div key={l.id} className="flex items-center justify-between bg-muted/30 border border-border/40 p-2 rounded-xl">
                            <div className="flex items-center space-x-2.5">
                              <Badge className={`text-[8px] font-black uppercase ${isDeparture ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'}`} variant="outline">
                                {isDeparture ? 'DEP' : 'ARR'}
                              </Badge>
                              <div>
                                <p className="text-xs font-extrabold text-slate-950 dark:text-white truncate w-24 sm:w-36 uppercase">{l.customer_name}</p>
                                <p className="text-[9px] text-slate-600 dark:text-slate-400 font-bold uppercase">{l.destinations || 'Custom tour'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-black text-slate-900 dark:text-slate-100">{dateStr}</span>
                          </div>
                        );
                      })}
                      {leads.filter(l => l.trip_start_date || l.trip_end_date).length === 0 && (
                        <p className="text-xs text-slate-500 font-semibold text-center py-4">No departures or arrivals logged.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Itinerary Workspace */}
                  <Card className="bg-card border border-border/60 shadow-md rounded-2xl">
                    <CardHeader className="p-4 border-b border-border/40">
                      <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Map className="w-4 h-4 text-amber-500" />
                        Itinerary Workspace Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {[
                        { label: 'Draft Itineraries', count: leads.filter(l => l.status === 'New').length, color: 'bg-blue-500' },
                        { label: 'Proposals Dispatched', count: leads.filter(l => l.status === 'Quote Sent').length, color: 'bg-amber-500' },
                        { label: 'Proposal Accepted', count: leads.filter(l => l.status === 'Booking Confirmed').length, color: 'bg-purple-500' },
                        { label: 'Ready for Booking', count: leads.filter(l => l.status === 'Booking Confirmed').length, color: 'bg-emerald-500' }
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center text-xs font-extrabold">
                          <span className="text-slate-700 dark:text-slate-300 uppercase flex items-center gap-2 text-[11px]">
                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                            {item.label}
                          </span>
                          <span className="text-slate-950 dark:text-white font-black">{item.count}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Operational Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Urgent Follow-up Center */}
                <Card className="bg-card border border-border/60 shadow-md rounded-2xl">
                  <CardHeader className="p-4 border-b border-border/40">
                    <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      Follow-up Queue & Urgency Board
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 max-h-72 overflow-y-auto">
                    {followUpsDue.slice(0, 5).map((l) => (
                      <div key={l.id} className="flex items-center justify-between border-b border-border/30 pb-2.5 last:border-0 last:pb-0">
                        <div>
                          <p className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wide">{l.customer_name}</p>
                          <p className="text-[9px] text-slate-600 dark:text-slate-400 font-bold uppercase">Follow-up: {l.follow_up_date}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400" onClick={() => window.open(`tel:${l.contact_number || ''}`)}>
                            <Phone className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" onClick={() => window.open(`https://wa.me/${l.whatsapp_number || l.contact_number || ''}`)}>
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-[9px] font-black h-7 rounded-lg px-2 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-transparent" onClick={() => navigate(`/crm/leads/${l.id}`)}>
                            Profile
                          </Button>
                        </div>
                      </div>
                    ))}
                    {followUpsDue.length === 0 && (
                      <p className="text-xs text-slate-500 font-semibold text-center py-4">No follow-ups due today.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Booking Operations Center */}
                <Card className="bg-card border border-border/60 shadow-md rounded-2xl">
                  <CardHeader className="p-4 border-b border-border/40">
                    <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      Booking Operations Desk
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 gap-4">
                    {[
                      { label: 'Flight Booking Pending', count: leads.filter(l => l.status === 'Booking Confirmed').length, icon: Globe },
                      { label: 'Hotel Booking Pending', count: leads.filter(l => l.status === 'Booking Confirmed' && !l.hotel_category).length, icon: Landmark },
                      { label: 'Visa Operations Pending', count: leads.filter(l => l.status === 'Booking Confirmed' && l.country !== 'India').length, icon: Shield },
                      { label: 'Sightseeing Vouchers', count: leads.filter(l => l.status === 'Booking Confirmed').length, icon: Map },
                      { label: 'Accounts Receivable', count: leads.filter(l => l.status === 'Booking Confirmed' && (Number(l.expected_booking_value) || 0) > 0).length, icon: IndianRupee },
                      { label: 'Voucher Despatched', count: leads.filter(l => l.status === 'Booking Confirmed' && l.trip_start_date).length, icon: Sparkles }
                    ].map((op) => {
                      const Icon = op.icon;
                      return (
                        <div key={op.label} className="bg-muted/30 border border-border/40 rounded-xl p-3 flex items-center justify-between hover:border-amber-500/40 transition-all">
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase block truncate" title={op.label}>{op.label}</span>
                            <p className="text-sm font-black text-slate-950 dark:text-white mt-0.5">{op.count} Tasks</p>
                          </div>
                          <div className="bg-amber-500/15 p-2 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Live Travel Catalog & Inventory Desk */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Premium Packages Catalog */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="shadow-md border-border/60 bg-card rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 border-b border-border/40 bg-gradient-to-r from-amber-500/10 to-transparent flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                        Premium Packages Directory
                      </CardTitle>
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase px-2.5 py-0.5">
                        {(Array.isArray(dashboardPackages) ? dashboardPackages.length : 0) || 25} Live Packages
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-border/50 text-slate-800 dark:text-slate-200 font-black uppercase tracking-wider text-[10px]">
                              <th className="p-3.5">Package Title</th>
                              <th className="p-3.5">Duration</th>
                              <th className="p-3.5 text-right">Start Cost</th>
                              <th className="p-3.5 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30 text-slate-900 dark:text-slate-100">
                            {(Array.isArray(dashboardPackages) && dashboardPackages.length > 0 ? dashboardPackages : [
                              { id: 1, name: 'Char Dham Yatra From Haridwar', duration: '10 Days / 9 Nights', price: 28500 },
                              { id: 2, name: 'Rann Utsav Festival Tour', duration: '4 Days / 3 Nights', price: 18500 },
                              { id: 3, name: 'Rajasthan Royal Heritage', duration: '8 Days / 7 Nights', price: 32000 },
                              { id: 4, name: 'Kashmir Paradise Holiday', duration: '6 Days / 5 Nights', price: 24500 },
                              { id: 5, name: 'Maldives Bliss Luxury Getaway', duration: '5 Days / 4 Nights', price: 85000 }
                            ]).slice(0, 5).map((pkg: any, idx: number) => (
                              <tr key={`pkg-${pkg.id || idx}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                                <td className="p-3.5 font-extrabold text-slate-950 dark:text-white max-w-[280px] truncate">{pkg.title || pkg.name}</td>
                                <td className="p-3.5 font-extrabold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wide">{pkg.duration}</td>
                                <td className="p-3.5 font-black text-right text-amber-600 dark:text-amber-400">₹{Number(pkg.price || 0).toLocaleString('en-IN')}</td>
                                <td className="p-3.5 text-center">
                                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-0.5" variant="outline">Active</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right 1 Column: Active Properties and Reviews */}
                <div className="space-y-6">
                  <Card className="shadow-md border-border/60 bg-card rounded-2xl overflow-hidden">
                    <CardHeader className="p-4 border-b border-border/40 bg-gradient-to-r from-indigo-500/10 to-transparent">
                      <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Hotel className="w-4 h-4 text-indigo-500" />
                        Contracted Properties
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3.5">
                      {(Array.isArray(dashboardHotels) && dashboardHotels.length > 0 ? dashboardHotels : [
                        { id: 1, hotel_name: 'Radisson Blu Plaza', star_rating: 5, city_name: 'Delhi NCR' },
                        { id: 2, hotel_name: 'Taj Mahal Palace', star_rating: 5, city_name: 'Mumbai' },
                        { id: 3, hotel_name: 'Grand Hyatt Resort', star_rating: 5, city_name: 'Goa' },
                        { id: 4, hotel_name: 'Ritz-Carlton Luxury Hotel', star_rating: 5, city_name: 'Bangalore' }
                      ]).slice(0, 4).map((hotel: any) => (
                        <div key={hotel.id} className="flex items-center justify-between border-b border-border/30 pb-2.5 last:border-0 last:pb-0">
                          <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                            <span className="text-base shrink-0">🏨</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-extrabold text-slate-950 dark:text-white truncate" title={hotel.hotel_name}>{hotel.hotel_name}</p>
                              <p className="text-[9px] text-slate-600 dark:text-slate-400 font-bold uppercase">{hotel.star_rating || '3'} Star • {hotel.city_name || hotel.city || 'India'}</p>
                            </div>
                          </div>
                          <Badge className="text-[8px] font-extrabold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wider shrink-0" variant="outline">Active Contract</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Leads Section */}
              <Card className="bg-card border border-border/60 shadow-md rounded-2xl">
                <CardHeader className="p-4 border-b border-border/40">
                  <CardTitle className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    Operational Leads Stream
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {leads.slice(0, 5).map((l) => {
                    const firstDest = (l.destinations || 'Custom Package').split(/[·,]/)[0].trim();
                    return (
                    <div key={l.id} className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-border/30 pb-3 last:border-0 last:pb-0 gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0">
                          {l.customer_name?.charAt(0) || 'L'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wide truncate">{l.customer_name}</p>
                          <p className="text-[9px] text-slate-600 dark:text-slate-400 font-extrabold uppercase truncate">
                            <span className="text-amber-600 dark:text-amber-400">{firstDest}</span> • {l.status} • {l.agent_name || 'Unassigned'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" variant="ghost" className="text-[9px] font-extrabold h-7 rounded-lg px-2 text-slate-700 dark:text-slate-300 hover:text-amber-500" onClick={() => navigate(`/crm/leads/${l.id}/itinerary`)}>
                          Itinerary
                        </Button>
                        <Button size="sm" variant="outline" className="text-[9px] font-black h-7 rounded-lg px-2.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 bg-transparent" onClick={() => navigate(`/crm/leads/${l.id}`)}>
                          Manage
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          {/* USER DASHBOARD */}
          {currentSection === 'user-dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">My Assigned Leads</p>
                      <p className="text-2xl font-bold">{leads.filter(l => l.assigned_to === user?.id).length}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-500">
                      <UserCheck className="w-6 h-6" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">My Converted Value</p>
                      <p className="text-2xl font-bold">
                        ₹{(leads.filter(l => l.assigned_to === user?.id && l.status === 'Booking Confirmed').reduce((acc, l) => acc + (l.expected_booking_value || l.package_cost || 0), 0) || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/40 rounded-2xl text-green-500">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Assigned Conversion Rate</p>
                      <p className="text-2xl font-bold">
                        {Math.round((leads.filter(l => l.assigned_to === user?.id && l.status === 'Booking Confirmed').length / (leads.filter(l => l.assigned_to === user?.id).length || 1)) * 100)}%
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl text-amber-500">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* OPPORTUNITIES KANBAN VIEW */}
          {currentSection === 'opportunities' && (
            <div className="animate-in fade-in duration-200">
              <Suspense fallback={<NavyGoldLoader />}>
                <OpportunityKanban 
                  opportunities={opportunities} 
                  onUpdateStage={(id, stage) => {
                    setOpportunities(prev => prev.map(opp => opp.id === id ? { ...opp, stage } : opp));
                    const opp = opportunities.find(o => o.id === id);
                    if (opp) {
                      const newEvent = {
                        id: String(timelineEvents.length + 1),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: 'status',
                        title: 'Opportunity Stage Updated',
                        description: `Moved stage from ${opp.stage} to ${stage} for ${opp.customerName}'s journey to ${opp.destination}.`,
                        agent: userProfile?.full_name || 'Current User'
                      };
                      setTimelineEvents(prev => [newEvent, ...prev]);
                    }
                    toast({
                      title: "Stage Updated",
                      description: `Moved to ${stage} successfully.`
                    });
                  }}
                />
              </Suspense>
            </div>
          )}

          {/* QUOTE WORKSPACE VIEW */}
          {currentSection === 'quotes' && (
            <div className="animate-in fade-in duration-200">
              <Suspense fallback={<NavyGoldLoader />}>
                <QuoteWorkspace 
                  quotes={quotes}
                  onCreateRevision={(quoteHeaderId, baseVersionId) => {
                    // Handled internally in QuoteWorkspace, trigger refresh
                    fetchQuotes();
                  }}
                  onAcceptVersion={async (quoteHeaderId, versionId) => {
                    const quote = quotes.find(q => q.id === quoteHeaderId);
                    const ver = quote?.versions.find((v: any) => v.id === versionId);
                    if (quote && ver) {
                      try {
                        const tokenVal = ver.shareToken;
                        if (tokenVal) {
                          await quoteService.publicSubmitAction(tokenVal, 'accept');
                        } else {
                          const shareRes = await quoteService.shareQuote(ver.id, "Auto-accepted by Agent");
                          await quoteService.publicSubmitAction(shareRes.token, 'accept');
                        }
                        
                        toast({
                          title: "Quote Accepted",
                          description: `Booking confirmed for ${quote.customerName}!`
                        });
                        
                        fetchQuotes();
                        fetchLeads();
                      } catch (err: any) {
                        toast({
                          title: "Accept Failed",
                          description: err.message || "Failed to confirm booking.",
                          variant: "destructive"
                        });
                      }
                    }
                  }}
                  onUpdateVersion={(quoteHeaderId, versionId, updatedVersion) => {
                    fetchQuotes();
                  }}
                  onRefresh={fetchQuotes}
                />
              </Suspense>
            </div>
          )}

          {/* CUSTOMERS VIEW */}
          {currentSection === 'customers' && (() => {
            // Aggregate leads into unique customer records dynamically
            const leadMap: Record<string, any> = {};
            leads.forEach(l => {
              if (!l.deleted_at && l.customer_name) {
                const key = (l.email || l.contact_number || l.customer_name).toLowerCase();
                if (!leadMap[key]) {
                  leadMap[key] = {
                    id: l.id,
                    name: l.customer_name,
                    mobile: l.contact_number || l.customer_phone || '---',
                    email: l.email || l.customer_email || '---',
                    home_city: l.city || l.customer_home_city || l.departure_city || '---',
                    total_leads: 1,
                    total_bookings: l.status === 'Booking Confirmed' ? 1 : 0
                  };
                } else {
                  leadMap[key].total_leads += 1;
                  if (l.status === 'Booking Confirmed') leadMap[key].total_bookings += 1;
                }
              }
            });

            // Combine aggregated leads with seeded customers list
            const allCustomers = [...Object.values(leadMap)];
            customers.forEach(mc => {
              const key = (mc.email || mc.mobile || mc.name).toLowerCase();
              if (!leadMap[key]) {
                allCustomers.push(mc);
              }
            });

            const activeCustomerList = allCustomers.filter(c => {
              const q = searchTerm.trim().toLowerCase();
              const name = (c.name || '').toLowerCase();
              const email = (c.email || '').toLowerCase();
              const mobile = (c.mobile || '').toLowerCase();
              const city = (c.home_city || '').toLowerCase();
              return name.includes(q) || email.includes(q) || mobile.includes(q) || city.includes(q);
            });

            const totalCustomers = allCustomers.length;
            const repeatTravelers = allCustomers.filter(c => c.total_leads > 1 || c.total_bookings > 1).length;
            const confirmedTravelers = allCustomers.filter(c => c.total_bookings > 0).length;
            const totalEnquiriesCount = allCustomers.reduce((sum, c) => sum + (c.total_leads || 0), 0);

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-slate-900 dark:text-slate-100">
                {/* KPI STATS CARDS STRIP */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card 
                    onClick={() => setSearchTerm('')}
                    className="border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-amber-500/60 group"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-amber-500 transition-colors">Total Registered Clients</p>
                        <div className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{totalCustomers}</div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Unique CRM profiles</p>
                      </div>
                      <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                        <Users className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    onClick={() => setSearchTerm('')}
                    className="border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-indigo-500/60 group"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Repeat Travelers</p>
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{repeatTravelers}</div>
                        <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold mt-0.5">Multiple enquiries</p>
                      </div>
                      <div className="p-3 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <Star className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    onClick={() => { setSearchTerm(''); setFilterStatus('Booking Confirmed'); navigate('/crm/leads'); }}
                    className="border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-emerald-500/60 group"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Confirmed Travelers</p>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{confirmedTravelers}</div>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Booked tour deals</p>
                      </div>
                      <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); navigate('/crm/leads'); }}
                    className="border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-blue-500/60 group"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Total Enquiries</p>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{totalEnquiriesCount}</div>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mt-0.5">Generated enquiries</p>
                      </div>
                      <div className="p-3 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* SEARCH & WORKSPACE HEADER */}
                <Card className="border-border/60 shadow-md bg-card">
                  <CardHeader className="p-4 border-b border-border/40 space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-extrabold flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-500" /> Customers Directory
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                          Browse registered client profiles, view booking histories, and initiate direct communication.
                        </CardDescription>
                      </div>
                    </div>

                    <div className="relative pt-1">
                      <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search customers by name, email, contact number, or home city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 text-xs rounded-xl bg-background text-slate-950 dark:text-white font-medium placeholder:text-slate-400 border-border/80"
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-border/50 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">
                            <th className="py-3 px-4 text-left">Customer Profile</th>
                            <th className="py-3 px-4 text-left">Contact Info</th>
                            <th className="py-3 px-4 text-left">Home City</th>
                            <th className="py-3 px-4 text-center">Enquiries</th>
                            <th className="py-3 px-4 text-center">Status Tier</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {activeCustomerList.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-slate-600 dark:text-slate-300 text-xs font-medium">
                                <Users className="w-10 h-10 mx-auto mb-2 text-amber-500/50" />
                                No customer records found matching your search.
                              </td>
                            </tr>
                          ) : (
                            activeCustomerList.map((c: any, idx: number) => (
                              <tr key={`cust-${c.id || idx}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-border/10">
                                <td className="py-3 px-4 text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0 border border-amber-500/30">
                                      {c.name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-xs text-slate-950 dark:text-white uppercase tracking-wide">{c.name}</p>
                                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-medium">Client #{c.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-left space-y-0.5">
                                  <p className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{c.mobile}</p>
                                  <p className="font-mono text-xs text-slate-600 dark:text-slate-400">{c.email}</p>
                                </td>
                                <td className="py-3 px-4 text-left font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase">
                                  {c.home_city || 'Delhi'}
                                </td>
                                <td className="py-3 px-4 text-center font-black text-xs text-slate-900 dark:text-slate-100">
                                  {c.total_leads || 1} Enquiries
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge
                                    className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                      c.total_bookings > 0 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' :
                                      (c.total_leads > 1 ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/40' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-400')
                                    }`}
                                    variant="outline"
                                  >
                                    {c.total_bookings > 0 ? '⭐ Confirmed Traveler' : (c.total_leads > 1 ? 'Repeat Prospect' : 'Verified Prospect')}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(`tel:${c.mobile}`)}
                                      className="h-8 w-8 p-0 rounded-lg text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                                      title="Call Customer"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(`https://wa.me/${c.mobile}`)}
                                      className="h-8 w-8 p-0 rounded-lg text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                      title="WhatsApp Client"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(`mailto:${c.email}`)}
                                      className="h-8 w-8 p-0 rounded-lg text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                                      title="Email Client"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => navigate(`/crm/leads/${c.id}`)}
                                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-8 rounded-lg px-2.5 shadow-xs"
                                      title="View Customer Profile"
                                    >
                                      <User className="w-3.5 h-3.5 mr-1" /> Profile
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* LEADS LIST REDESIGN */}
          {currentSection === 'leads' && (() => {
            const activeLeadsCount = leads.filter(l => !l.deleted_at).length;
            const newLeadsCount = leads.filter(l => l.status === 'New' && !l.deleted_at).length;
            const followupLeadsCount = leads.filter(l => l.status === 'Follow-up Due' && !l.deleted_at).length;
            const confirmedLeadsCount = leads.filter(l => l.status === 'Booking Confirmed' && !l.deleted_at).length;

            return (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* KPI STATS CARDS STRIP */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card 
                    onClick={() => setFilterStatus('all')}
                    className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-amber-500/60 group ${filterStatus === 'all' ? 'ring-2 ring-amber-500 border-amber-500 shadow-md' : ''}`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-amber-500 transition-colors">Total Active Leads</p>
                        <div className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{activeLeadsCount}</div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Live CRM enquiries</p>
                      </div>
                      <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                        <Users className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    onClick={() => setFilterStatus('New')}
                    className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-blue-500/60 group ${filterStatus === 'New' ? 'ring-2 ring-blue-500 border-blue-500 shadow-md' : ''}`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-blue-500 transition-colors">New Enquiries</p>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{newLeadsCount}</div>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mt-0.5">Awaiting assignment</p>
                      </div>
                      <div className="p-3 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <UserPlus className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    onClick={() => setFilterStatus('Follow-up Due')}
                    className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-amber-500/60 group ${filterStatus === 'Follow-up Due' ? 'ring-2 ring-amber-500 border-amber-500 shadow-md' : ''}`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-amber-500 transition-colors">Follow-ups Due</p>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{followupLeadsCount}</div>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-0.5">Action scheduled</p>
                      </div>
                      <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                        <Clock className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    onClick={() => setFilterStatus('Booking Confirmed')}
                    className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-emerald-500/60 group ${filterStatus === 'Booking Confirmed' ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md' : ''}`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Confirmed Bookings</p>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{confirmedLeadsCount}</div>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Converted deals</p>
                      </div>
                      <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Status Filter Pills & Search Bar */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: 'all', label: 'All Statuses' },
                      { id: 'New', label: 'New' },
                      { id: 'Assigned', label: 'Assigned' },
                      { id: 'Follow-up Due', label: 'Follow-up Due' },
                      { id: 'Quote Sent', label: 'Quote Sent' },
                      { id: 'Booking Confirmed', label: 'Confirmed' },
                      { id: 'Closed Lost', label: 'Closed Lost' }
                    ].map(st => (
                      <Button
                        key={st.id}
                        variant={filterStatus === st.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus(st.id)}
                        className={`h-7.5 text-xs px-3 rounded-lg font-bold transition-colors ${
                          filterStatus === st.id 
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-xs' 
                            : 'text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {st.label}
                      </Button>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search customer name, email, phone, enquiry number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 text-xs focus-visible:ring-amber-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-medium placeholder:text-slate-400 rounded-xl"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}
                        className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 text-xs font-bold rounded-xl h-10 shadow-xs"
                      >
                        {viewMode === 'table' ? (
                          <>
                            <LayoutDashboard className="w-4 h-4 text-amber-500" />
                            <span className="text-slate-800 dark:text-slate-200">Kanban View</span>
                          </>
                        ) : (
                          <>
                            <Table className="w-4 h-4 text-amber-500" />
                            <span className="text-slate-800 dark:text-slate-200">Table View</span>
                          </>
                        )}
                      </Button>

                      <Button 
                        variant="outline" 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 text-xs font-bold rounded-xl h-10 shadow-xs ${
                          showFilters 
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Filter className="w-4 h-4 text-amber-500" />
                        <span className={showFilters ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}>Advanced Filters</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                      </Button>

                      {isAdminRole(userProfile?.role) && (
                        <Button
                          variant={showDeletedLeads ? "destructive" : "outline"}
                          onClick={() => setShowDeletedLeads(!showDeletedLeads)}
                          className={`flex items-center gap-1.5 text-xs font-bold rounded-xl h-10 shadow-xs ${
                            showDeletedLeads 
                              ? '' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className={showDeletedLeads ? '' : 'text-slate-800 dark:text-slate-200'}>
                            {showDeletedLeads ? 'Hide Deleted' : 'Show Deleted'}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advanced Filter Panel */}
                {showFilters && (
                  <Card className="border-border/60 bg-card p-4 animate-in slide-in-from-top-2 duration-200 shadow-md">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase">Country</label>
                        <Select value={filterCountry} onValueChange={handleCrmCountryChange}>
                          <SelectTrigger className="h-8 text-xs font-medium"><SelectValue placeholder="All" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {crmCountryOptions.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase">State</label>
                        <Select value={filterState} onValueChange={handleCrmStateChange}>
                          <SelectTrigger className="h-8 text-xs font-medium"><SelectValue placeholder="All" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All States ({crmFilterStateOptions.length})</SelectItem>
                            {crmFilterStateOptions.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase">Destination</label>
                        <Select value={filterDestination} onValueChange={setFilterDestination}>
                          <SelectTrigger className="h-8 text-xs font-medium"><SelectValue placeholder="All" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cities ({crmFilterDestinationOptions.length})</SelectItem>
                            {crmFilterDestinationOptions.map(d => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase">Source</label>
                        <Select value={filterSource} onValueChange={setFilterSource}>
                          <SelectTrigger className="h-8 text-xs font-medium"><SelectValue placeholder="All" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="Direct Customer">Direct Customer</SelectItem>
                            <SelectItem value="Phone">Phone Call</SelectItem>
                            <SelectItem value="Facebook">Facebook Ads</SelectItem>
                            <SelectItem value="Insta">Instagram</SelectItem>
                            <SelectItem value="Trip Clap">Trip Clap</SelectItem>
                            <SelectItem value="Hello_Visit">Hello Visit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase">Assigned Executive</label>
                        <Select value={filterAssignedTo} onValueChange={setFilterAssignedTo}>
                          <SelectTrigger className="h-8 text-xs font-medium"><SelectValue placeholder="All" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Executives</SelectItem>
                            {profiles.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase">Status</label>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="h-8 text-xs font-medium"><SelectValue placeholder="All" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Assigned">Assigned</SelectItem>
                            <SelectItem value="Follow-up Due">Follow-up Due</SelectItem>
                            <SelectItem value="Quote Sent">Quote Sent</SelectItem>
                            <SelectItem value="Booking Confirmed">Booking Confirmed</SelectItem>
                            <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase">Travel Date</label>
                        <Input
                          type="date"
                          value={filterTravelDate}
                          onChange={(e) => setFilterTravelDate(e.target.value)}
                          className="h-8 text-xs focus-visible:ring-amber-500 font-medium"
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Responsive Lead Table List */}
                {viewMode === 'kanban' ? (
                  <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-sm text-left">
                    <Suspense fallback={<NavyGoldLoader />}>
                      <KanbanBoard 
                        leads={filteredLeads as any[]} 
                        onEditLead={(lead) => navigate(`/crm/leads/${lead.id}/edit`)}
                        onStatusChange={async (leadId, newStatus) => {
                          try {
                            await leadService.updateLead(leadId, { status: newStatus });
                            toast({ title: "Status Updated", description: `Lead status changed to ${newStatus}` });
                            await logActivity(leadId, {
                              type: 'status_change',
                              content: `Status changed to "${newStatus}"`
                            });
                            fetchLeads();
                          } catch (err) {
                            console.error(err);
                            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
                          }
                        }}
                        onAddComment={(leadId) => {
                          const targetLead = leads.find(l => l.id === leadId);
                          if (targetLead) {
                            setSelectedLeadForComments({ id: targetLead.id, name: targetLead.customer_name });
                            setCommentsDialogOpen(true);
                          }
                        }}
                      />
                    </Suspense>
                  </div>
                ) : (
                  <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-md text-left">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left" style={{ width: '100%' }}>
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-border/50 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">
                            <th className="py-3 px-3 text-left w-10">
                              <input 
                                id="crm-leads-select-all"
                                name="selectAllLeads"
                                type="checkbox" 
                                checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0} 
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLeadIds(filteredLeads.map(l => l.id));
                                  } else {
                                    setSelectedLeadIds([]);
                                  }
                                }} 
                                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                aria-label="Select all leads"
                              />
                            </th>
                            <th className="py-3 px-3 text-left">Lead ID</th>
                            <th className="py-3 px-3 text-left">Details</th>
                            <th className="py-3 px-3 text-left">Route & Travel</th>
                            <th className="py-3 px-3 text-left">Nights</th>
                            <th className="py-3 px-3 text-left">Created Date</th>
                            <th className="py-3 px-3 text-left">Status</th>
                            <th className="py-3 px-3 text-left">Assigned To</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {loading ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-600 dark:text-slate-300">
                                <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                                <p className="font-extrabold text-xs">Loading travel leads dataset...</p>
                              </td>
                            </tr>
                          ) : filteredLeads.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-600 dark:text-slate-300 text-xs font-medium">
                                <Users className="w-10 h-10 mx-auto mb-2 text-amber-500/50" />
                                No travel leads matched your search or filter criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredLeads.map((l: any, idx: number) => (
                              <tr key={`lead-${l.id || idx}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all duration-150 border-b border-border/10">
                                <td className="py-3 px-3 align-top text-left w-10">
                                  <input 
                                    id={`crm-lead-select-${l.id || idx}`}
                                    name={`selectLead_${l.id || idx}`}
                                    type="checkbox" 
                                    checked={selectedLeadIds.includes(l.id)} 
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedLeadIds([...selectedLeadIds, l.id]);
                                      } else {
                                        setSelectedLeadIds(selectedLeadIds.filter(id => id !== l.id));
                                      }
                                    }} 
                                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer mt-1"
                                    aria-label={`Select lead ${l.enquiry_number || l.lead_id}`}
                                  />
                                </td>
                                <td className="py-3 px-3 align-top text-left font-mono font-extrabold text-amber-600 dark:text-amber-400 text-xs cursor-pointer hover:underline" onClick={() => navigate(`/crm/leads/${l.id}`)}>
                                  {formatLeadId(l)}
                                </td>
                                <td className="py-3 px-3 align-top text-left space-y-1">
                                  <div className="font-extrabold text-xs text-slate-950 dark:text-white uppercase tracking-wide">{l.customer_name}</div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">{l.contact_number || l.customer_phone || '---'}</div>
                                  <div>
                                    <span className="inline-block bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 uppercase border border-border/50">
                                      {(l.source || l.customer_type || 'MANUAL').toUpperCase()}
                                    </span>
                                  </div>
                                  {/* Lucide Action Buttons */}
                                  <div className="flex gap-1.5 pt-1">
                                    <button 
                                      type="button" 
                                      onClick={(e) => { e.stopPropagation(); window.open(`tel:${l.contact_number || l.customer_phone || ''}`); }}
                                      className="w-7 h-7 rounded-lg border-none cursor-pointer flex items-center justify-center bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition-colors"
                                      title="Call Customer"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${l.whatsapp_number || l.contact_number || l.customer_phone || ''}`); }}
                                      className="w-7 h-7 rounded-lg border-none cursor-pointer flex items-center justify-center bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                                      title="WhatsApp Client"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={(e) => { e.stopPropagation(); window.open(`mailto:${l.email || l.customer_email || ''}`); }}
                                      className="w-7 h-7 rounded-lg border-none cursor-pointer flex items-center justify-center bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 transition-colors"
                                      title="Email Client"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={(e) => { e.stopPropagation(); navigate(`/crm/leads/${l.id}`); }}
                                      className="w-7 h-7 rounded-lg border-none cursor-pointer flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                      title="Open Profile"
                                    >
                                      <User className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLeadForFollowUp({ id: l.id, name: l.customer_name });
                                        setFollowUpModalOpen(true);
                                      }}
                                      className="w-7 h-7 rounded-lg border-none cursor-pointer flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                      title="Schedule Follow-up"
                                    >
                                      <Clock className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  {/* Initial remarks / notes preview */}
                                  {(l.remarks || l.notes || l.discussion_notes) && (
                                    <div 
                                      className="mt-1 text-[11px] text-slate-700 dark:text-slate-300 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-md px-2 py-1 flex items-start gap-1 max-w-[260px]"
                                      title={l.remarks || l.notes || l.discussion_notes}
                                    >
                                      <span className="text-amber-500 font-bold shrink-0">📝</span>
                                      <span className="line-clamp-2 leading-tight font-medium">
                                        {l.remarks || l.notes || l.discussion_notes}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-3 align-top text-left space-y-1">
                                  <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase">
                                    {(() => {
                                      const originCity = (l.city || l.customer_home_city || l.departure_city || '').trim();
                                      const route = formatLeadRoute(l);
                                      const firstRouteCity = route.split('→')[0]?.trim().toLowerCase();
                                      const hasDistinctOrigin = originCity && (!firstRouteCity || firstRouteCity !== originCity.toLowerCase());

                                      if (hasDistinctOrigin) {
                                        return (
                                          <>
                                            <span className="text-slate-700 dark:text-slate-300">{originCity}</span>
                                            <span className="mx-1 text-amber-500">→</span>
                                            <span className="text-amber-600 dark:text-amber-400">{route}</span>
                                          </>
                                        );
                                      }
                                      return <span className="text-amber-600 dark:text-amber-400">{route}</span>;
                                    })()}
                                  </div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                                    {l.adult_count || 1} adults · {l.child_count || 0} children · Dep {l.trip_start_date ? new Date(l.trip_start_date).toLocaleDateString([], {day: 'numeric', month: 'short', year: 'numeric'}) : 'TBD'}
                                  </div>
                                </td>
                                <td className="py-3 px-3 align-top text-left">
                                  <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-xs font-black whitespace-nowrap border border-border/50">
                                    {l.number_of_nights || l.total_nights || 5}N
                                  </span>
                                </td>
                                <td className="py-3 px-3 align-top text-left font-semibold text-slate-700 dark:text-slate-300 text-xs">
                                  {l.created_at ? new Date(l.created_at).toLocaleDateString([], {day: 'numeric', month: 'short', year: 'numeric'}) : '---'}
                                </td>
                                <td className="py-3 px-3 align-top text-left">
                                  {getRedesignedStatusBadge(l.status)}
                                </td>
                                <td className="py-3 px-3 align-top text-left font-semibold text-xs text-slate-900 dark:text-slate-100">
                                  {renderAssignedExecutive(l.assigned_to)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ADD LEAD VIEW */}
          {currentSection === 'add-lead' && (
            <div className="w-full">
              <LeadForm
                editingLead={null}
                onSubmit={handleLeadSubmit}
                onCancel={() => navigate('/crm/leads')}
                profiles={profiles}
                userRole={userProfile?.role || null}
                onOpenUserManagement={() => setUserManagementOpen(true)}
              />
            </div>
          )}

          {/* EDIT LEAD VIEW */}
          {currentSection === 'edit-lead' && activeLead && (
            <div className="w-full">
              <LeadForm
                editingLead={activeLead}
                onSubmit={handleLeadSubmit}
                onCancel={() => navigate(`/crm/leads/${activeLead.id}`)}
                profiles={profiles}
                userRole={userProfile?.role || null}
                onOpenUserManagement={() => setUserManagementOpen(true)}
              />
            </div>
          )}

          {/* LEAD PROFILE DASHBOARD PAGE */}
          {currentSection === 'profile' && activeLead && (
            <div className="flex gap-0 border border-slate-100 rounded-2xl overflow-hidden bg-card min-h-[calc(100vh-200px)] text-left font-sans shadow-sm">
              {/* Left Panel: 260px fixed, sticky */}
              <div className="w-[260px] shrink-0 border-r border-border p-4 space-y-5 flex flex-col bg-slate-50/50 h-[calc(100vh-140px)] overflow-y-auto sticky top-0 self-start">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm bg-[#C9A25A]/15 text-[#C9A25A]">
                    {getInitials(activeLead.customer_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-[15px] text-foreground truncate">{activeLead.customer_name}</h3>
                      <button 
                        onClick={() => navigate(`/crm/leads/${activeLead.id}/edit`)} 
                        className="p-1 hover:text-[#C9A25A] text-slate-400 bg-transparent border-none cursor-pointer"
                        title="Edit Lead Name"
                      >
                        <i className="ti ti-edit text-xs"></i>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[11px] text-slate-500 font-mono">{formatLeadId(activeLead)}</p>
                      {isRepeatCustomer && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs border-none">
                          <Sparkles className="w-2.5 h-2.5" /> Repeat Client
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section: Contact */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact</p>
                  <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2 truncate" title={activeLead.email || activeLead.customer_email || ''}>
                      <i className="ti ti-mail text-slate-400 text-sm"></i>
                      <span className="truncate">{activeLead.email || activeLead.customer_email || 'No email'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className="ti ti-phone text-slate-400 text-sm"></i>
                        <span>{activeLead.contact_number || activeLead.customer_phone || 'No phone'}</span>
                      </div>
                      <i className="ti ti-brand-whatsapp text-emerald-500 text-sm" title="WhatsApp Connected"></i>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedLeadForFollowUp({ id: activeLead.id, name: activeLead.customer_name });
                      setFollowUpModalOpen(true);
                      const telNum = (activeLead.contact_number || activeLead.customer_phone || '').trim();
                      if (telNum) {
                        window.open(`tel:${telNum}`);
                      }
                    }}
                    className="w-8 h-8 rounded-full border border-[#C9A25A]/30 cursor-pointer flex items-center justify-center bg-[#C9A25A]/15 text-[#C9A25A] hover:opacity-85 transition-opacity"
                    title="Call & Log Follow-up"
                  >
                    <i className="ti ti-phone text-sm"></i>
                  </button>
                  <button 
                    type="button"
                    onClick={() => window.open(`https://wa.me/${(activeLead.whatsapp_number || activeLead.contact_number || activeLead.customer_phone || '').replace(/[^0-9]/g, '')}`)}
                    className="w-8 h-8 rounded-full border border-[#C8E6C9] cursor-pointer flex items-center justify-center bg-[#E8F5E9] text-[#25D366] hover:opacity-85 transition-opacity"
                    title="WhatsApp Client"
                  >
                    <i className="ti ti-brand-whatsapp text-sm"></i>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const rawEmail = (activeLead.email || activeLead.customer_email || '').trim();
                      const emailAddr = rawEmail.includes(',') ? rawEmail.split(',')[0].trim() : rawEmail;
                      const clientName = activeLead.customer_name || 'Valued Traveler';
                      const destLabel = (() => {
                        if (!activeLead.destinations) return 'Holiday Package';
                        if (typeof activeLead.destinations === 'string' && activeLead.destinations.trim().startsWith('[')) {
                          try {
                            const parsed = JSON.parse(activeLead.destinations);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                              return parsed.map((s: any) => s.city || s.name || s.destination).filter(Boolean).join(' - ');
                            }
                          } catch(e) {}
                        }
                        return activeLead.destinations;
                      })();

                      const subject = encodeURIComponent(`Exclusive Travel Itinerary & Quote for ${destLabel} | Ghumo Firoo Travels`);
                      const body = encodeURIComponent(
`Dear ${clientName},

Greetings from Ghumo Firoo Travels!

Thank you for choosing Ghumo Firoo Travels for planning your upcoming holiday to ${destLabel}.

Our travel specialists are actively preparing your custom travel package with tailored hotel stays, sightseeing circuits, and private cab transfers designed around your preferences.

Please find our contact details below:
📞 Call / WhatsApp: +91 9910987264
✉️ Email: info@ghumofiroo.com
🌐 Website: https://ghumofiroo.com

Warm regards,
${userProfile?.full_name || 'Superadmin'}
Ghumo Firoo Travels`
                      );

                      const recipientFormatted = clientName ? `"${clientName.replace(/"/g, '')}" <${emailAddr}>` : emailAddr;
                      window.open(`mailto:${encodeURIComponent(recipientFormatted)}?subject=${subject}&body=${body}`);

                      logActivity(activeLead.id, {
                        type: 'email',
                        content: `Inquiry email dispatched to ${emailAddr} for ${destLabel}.`
                      });
                    }}
                    className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-105 transition-colors"
                    title="Send Branded Email"
                  >
                    <i className="ti ti-mail text-sm"></i>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedLeadForFollowUp({ id: activeLead.id, name: activeLead.customer_name });
                      setFollowUpModalOpen(true);
                    }}
                    className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-105 transition-colors"
                    title="Add Follow-up"
                  >
                    <i className="ti ti-flag text-sm"></i>
                  </button>
                </div>

                {/* Section: Trip Details */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trip Details</p>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(() => {
                          const origin = (activeLead.city || activeLead.customer_home_city || activeLead.departure_city || '').trim();
                          let destStr = 'Custom Itinerary';
                          if (activeLead.destinations) {
                            if (typeof activeLead.destinations === 'string' && activeLead.destinations.trim().startsWith('[')) {
                              try {
                                const parsed = JSON.parse(activeLead.destinations);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                  destStr = parsed.map((s: any) => `${s.city || s.name || s.destination}${s.nights ? ` (${s.nights}N)` : ''}`).filter(Boolean).join(' → ');
                                }
                              } catch(e) {}
                            } else if (Array.isArray(activeLead.destinations)) {
                              destStr = activeLead.destinations.map((s: any) => typeof s === 'string' ? s : `${s.city || s.name || s.destination}${s.nights ? ` (${s.nights}N)` : ''}`).filter(Boolean).join(' → ');
                            } else if (typeof activeLead.destinations === 'string') {
                              destStr = activeLead.destinations;
                            }
                          }
                          const firstDest = destStr.split('→')[0]?.trim().toLowerCase();
                          const hasOrigin = origin && (!firstDest || !firstDest.includes(origin.toLowerCase()));

                          return (
                            <>
                              {hasOrigin && (
                                <>
                                  <span className="font-bold text-[12px] text-slate-800 dark:text-slate-200">
                                    {origin}
                                  </span>
                                  <i className="ti ti-arrow-right text-slate-400 text-xs shrink-0"></i>
                                </>
                              )}
                              <span className="font-bold text-[12px] text-[#C9A25A]">
                                {destStr}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="text-slate-500 font-medium text-[11px]">
                      {activeLead.trip_start_date ? new Date(activeLead.trip_start_date).toLocaleDateString([], {day:'numeric', month:'short'}) : 'TBD'}
                      {activeLead.trip_end_date ? ` - ${new Date(activeLead.trip_end_date).toLocaleDateString([], {day:'numeric', month:'short'})}` : ''}
                      {` · ${activeLead.number_of_nights || activeLead.total_nights || 5}N`}
                    </div>
                    <div className="text-slate-600 font-semibold text-[11px]">
                      {Number(activeLead.adult_count ?? activeLead.adultCount ?? activeLead.adults ?? 2)} adults · {Number(activeLead.child_count ?? activeLead.childCount ?? activeLead.children ?? 0)} children
                    </div>
                  </div>
                </div>

                {/* Section: Financial Accounts & Balance Due */}
                <div className="space-y-2 border-t border-slate-200/80 pt-3">
                  {(() => {
                    const leadPkgPrice = Number(activeLead.budget || activeLead.package_price || activeLead.packagePrice || activeLead.expected_booking_value || activeLead.expectedBookingValue || 0);
                    const leadPaymentsList = allPayments.filter(p => String(p.lead_id) === String(activeLead.id));
                    const leadTotalPaid = leadPaymentsList.reduce((sum, p) => sum + Number(p.amount_received || 0), 0);
                    const leadBalanceDue = Math.max(0, leadPkgPrice - leadTotalPaid);
                    
                    const rawStatus = (activeLead.status || 'New').toLowerCase().trim();
                    const isConfirmed = (rawStatus === 'booking confirmed' || rawStatus === 'confirmed' || rawStatus === 'converted') || (leadTotalPaid > 0 && rawStatus !== 'new');
                    const isQuoted = rawStatus === 'quote sent' || rawStatus === 'proposal sent';

                    const dueDateStr = activeLead.trip_start_date 
                      ? new Date(new Date(activeLead.trip_start_date).getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Before Travel';

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-amber-500" /> 
                            {isConfirmed ? 'Booking Ledger & Balance' : isQuoted ? 'Quoted Package Value' : 'Estimated Deal Budget'}
                          </p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            isConfirmed ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' :
                            isQuoted ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' :
                            'bg-blue-500/15 text-blue-600 border-blue-500/30'
                          }`}>
                            {activeLead.status || 'New Enquiry'}
                          </span>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-white shadow-md">
                          {isConfirmed ? (
                            <>
                              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                                <span className="text-slate-400 font-semibold">Total Package Price:</span>
                                <span className="font-extrabold text-amber-400">₹{leadPkgPrice.toLocaleString('en-IN')}</span>
                              </div>

                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold">Amount Paid:</span>
                                <span className="font-extrabold text-emerald-400">₹{leadTotalPaid.toLocaleString('en-IN')}</span>
                              </div>

                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold">Balance Due:</span>
                                <span className={`font-black ${leadBalanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  ₹{leadBalanceDue.toLocaleString('en-IN')}
                                </span>
                              </div>

                              {leadBalanceDue > 0 && (
                                <div className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                  To be paid by {dueDateStr}
                                </div>
                              )}

                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedLeadForPayment(String(activeLead.id));
                                  setRecordPaymentDialogOpen(true);
                                }}
                                className="w-full h-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg shadow-sm border-0 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> Record Payment / UPI
                              </Button>
                            </>
                          ) : isQuoted ? (
                            <>
                              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                                <span className="text-slate-400 font-semibold">Quoted Package Price:</span>
                                <span className="font-extrabold text-amber-400">₹{leadPkgPrice.toLocaleString('en-IN')}</span>
                              </div>

                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-semibold">Expected 25% Advance:</span>
                                <span className="font-extrabold text-emerald-400">₹{Math.round(leadPkgPrice * 0.25).toLocaleString('en-IN')}</span>
                              </div>

                              <div className="text-[10px] text-amber-300/90 font-medium bg-amber-500/10 border border-amber-500/20 px-2 py-1.5 rounded-lg">
                                Quote sent to client · Awaiting booking confirmation & advance payment.
                              </div>

                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedLeadForPayment(String(activeLead.id));
                                  setRecordPaymentDialogOpen(true);
                                }}
                                className="w-full h-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg shadow-sm border-0 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> Record Advance Payment
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                                <span className="text-slate-400 font-semibold">Target Client Budget:</span>
                                <span className="font-extrabold text-amber-400">
                                  {leadPkgPrice > 0 ? `₹${leadPkgPrice.toLocaleString('en-IN')}` : 'To be estimated'}
                                </span>
                              </div>

                              <div className="text-[10px] text-slate-300 font-medium bg-slate-800/80 border border-slate-700/60 px-2.5 py-2 rounded-lg leading-relaxed">
                                💡 <strong className="text-amber-400 font-bold">Inquiry Stage:</strong> Finalize the custom itinerary & pricing to generate formal quotation and activate booking ledger.
                              </div>

                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedLeadForItinerary(activeLead);
                                  setCurrentSection('itinerary-builder');
                                }}
                                className="w-full h-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-lg shadow-sm border-0 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> Build Itinerary & Quote
                              </Button>
                            </>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Section: Initial Remarks / Notes */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Initial Remarks / Notes</p>
                  <div className="border-l-2 border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 rounded-r p-2.5 text-[11px] text-slate-700 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-line border border-amber-500/20">
                    {activeLead.remarks || activeLead.notes || activeLead.discussion_notes || activeLead.tour_description || 'No initial remarks recorded.'}
                  </div>
                </div>

                {/* Section: Multi-Trip History for Repeat Customers */}
                {tripHistory.length > 1 && (
                  <div className="space-y-2 border-t border-slate-200/80 pt-3">
                    <p className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> Trip History ({tripHistory.length})
                    </p>
                    <div className="space-y-1.5">
                      {tripHistory.map((t: any) => {
                        const isCurrent = String(t.id) === String(activeLead.id);
                        return (
                          <div 
                            key={t.id} 
                            onClick={() => navigate(`/crm/leads/${t.id}`)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${isCurrent ? 'bg-amber-500/15 border-amber-500/60 font-bold shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-600'}`}
                          >
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-extrabold text-amber-600">#GF-{t.id}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${isCurrent ? 'bg-amber-500 text-black' : 'bg-slate-200/70 text-slate-700'}`}>{t.status || 'New'}</span>
                            </div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate mt-1 text-[11px]">{t.destinations || 'Custom Inquiry'}</p>
                            <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{t.trip_start_date ? t.trip_start_date : (t.created_at ? t.created_at.split('T')[0] : '')}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel: flex-1 */}
              <div className="flex-1 flex flex-col min-w-0 bg-background">
                {/* Top bar */}
                <div className="border-b border-border bg-slate-50/50 py-2 px-3 flex justify-between items-center h-[52px]">
                  {showPackagesPanel ? (
                    <>
                      <span className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                        <i className="ti ti-package text-[#C9A25A]"></i>
                        Packages
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowPackagesPanel(false)}
                          className="h-8 text-xs font-semibold"
                        >
                          <i className="ti ti-arrow-left mr-1"></i> Back to lead
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/crm/leads/${activeLead.id}/itinerary`)}
                          className="h-8 bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] hover:opacity-90 text-[#0B1026] text-xs font-extrabold"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Create quotation
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Breadcrumbs */}
                      <div className="text-[11px] font-medium text-slate-500">
                        Home &rsaquo; My Leads &rsaquo; <span className="text-[#C9A25A] font-bold font-mono">{formatLeadId(activeLead)}</span>
                      </div>
                      {/* Right actions */}
                      <div className="flex gap-2 items-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowPackagesPanel(true)}
                          className="h-8 text-xs font-semibold border-slate-200"
                        >
                          Packages
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setProposalDialogOpen(true)}
                          className="h-8 text-xs font-bold border-[#C9A25A]/30 text-[#C9A25A] hover:bg-[#C9A25A]/15"
                        >
                          Send quotation
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => window.open(`https://wa.me/${activeLead.whatsapp_number || activeLead.contact_number || activeLead.customer_phone || ''}`)}
                          className="h-8 bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] hover:opacity-90 text-[#0B1026] text-xs font-extrabold"
                        >
                          Chat with customer
                        </Button>

                        {/* Status Dropdown */}
                        <select 
                          value={activeLead.status} 
                          onChange={(e) => handleStatusChange(e.target.value as Lead['status'])}
                          className="border border-slate-200 rounded px-2 py-1 text-[12px] bg-background font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C9A25A] cursor-pointer"
                        >
                          {['New', 'Assigned', 'Follow-up Due', 'Quote Sent', 'Booking Confirmed', 'Closed Lost'].map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {/* Timeline or Packages Drawer body */}
                {showPackagesPanel ? (
                  <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-192px)] bg-slate-50/20">
                    {(() => {
                      const leadDestinations = activeLead.lead_destination
                        ? activeLead.lead_destination.map((d: any) => typeof d === 'string' ? d.toLowerCase() : (d.name || '').toLowerCase())
                        : activeLead.destinations
                          ? activeLead.destinations.split(',').map((d: string) => d.trim().toLowerCase())
                          : [];

                      const filteredPackages = dashboardPackages.filter(pkg => {
                        if (leadDestinations.length === 0) return true;
                        
                        const pkgDestinations = Array.isArray(pkg.destinations) 
                          ? pkg.destinations.map((d: string) => d.toLowerCase())
                          : typeof pkg.destinations === 'string' 
                            ? pkg.destinations.split(',').map((d: string) => d.trim().toLowerCase())
                            : [];
                            
                        const pkgName = (pkg.name || '').toLowerCase();
                        
                        return leadDestinations.some((ld: string) => 
                          pkgDestinations.includes(ld) || 
                          pkgName.includes(ld) || 
                          ld.includes(pkgName)
                        );
                      });

                      return (
                        <div className="space-y-3">
                          {filteredPackages.map(pkg => (
                            <div key={pkg.id} className="flex gap-3 border border-border/80 rounded-lg p-2 bg-background hover:shadow-sm transition-shadow">
                              {/* Thumbnail */}
                              <div className="w-[72px] h-[54px] rounded-md overflow-hidden shrink-0">
                                {pkg.image ? (
                                  <LazyImage src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#0B1026] to-[#1A2342] text-[#C9A25A] flex items-center justify-center text-[8px] font-bold p-1 text-center leading-tight">
                                    {pkg.name}
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="min-w-0 flex-1 flex flex-col justify-between text-left">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-mono">#{pkg.slug || pkg.id}</p>
                                  <h4 className="text-[12px] font-semibold text-slate-800 leading-snug truncate" title={pkg.name}>{pkg.name}</h4>
                                </div>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                  <span className="text-[13px] font-bold text-[#C9A25A]">₹{Number(pkg.price || 0).toLocaleString('en-IN')}</span>
                                  <span className="text-[11px] text-slate-400">per person</span>
                                </div>

                                {/* Action Buttons Row */}
                                <div className="flex gap-1 mt-1.5">
                                  <button 
                                    onClick={() => navigate(`/crm/packages/edit/${pkg.id}`)}
                                    className="border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-600 bg-background hover:bg-slate-50 transition-colors cursor-pointer font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => window.open(`/packages/${pkg.slug}`, '_blank')}
                                    className="border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-600 bg-background hover:bg-slate-50 transition-colors cursor-pointer font-medium"
                                  >
                                    Preview
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      const packageUrl = `${window.location.origin}/packages/${pkg.slug}`;
                                      await navigator.clipboard.writeText(packageUrl);
                                      toast({
                                        title: "Link Copied",
                                        description: `Shared package link copied to clipboard: ${packageUrl}`
                                      });
                                      await logActivity(activeLead.id, {
                                        type: 'whatsapp',
                                        content: `Shared package: "${pkg.name}" (₹${pkg.price?.toLocaleString() || '0'}/person) via link.`
                                      });
                                      fetchLeads();
                                    }}
                                    className="bg-[#C9A25A]/15 border border-[#C9A25A]/30 text-[#C9A25A] text-[11px] font-semibold px-2 py-0.5 rounded hover:opacity-90 transition-opacity cursor-pointer"
                                  >
                                    Share
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {filteredPackages.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-6 font-normal">No matching packages found for destination.</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0 bg-background">
                    {/* Timeline area */}
                    <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-236px)]">
                      <h4 className="text-[12px] font-bold text-slate-700 mb-3 text-left">Follow-up history</h4>
                      
                      <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 text-left">
                        {(() => {
                          const timelineEvents = mockFollowups;
                          if (timelineEvents.length === 0) {
                            return <p className="text-xs text-slate-400 py-4 font-normal">No activities logged yet.</p>;
                          }
                          return timelineEvents.map((entry: any, index: number) => {
                            const entryDate = new Date(entry.timestamp || entry.date);
                            const isFuture = entryDate > new Date();
                            const actDate = entryDate.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
                            return (
                              <div key={entry.id || index} className="relative text-xs">
                                <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${isFuture ? 'bg-slate-350' : 'bg-[#C9A25A]'}`} />
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                                    <span>{actDate}</span>
                                    <span>By: {(() => {
                                      const rawAuthor = entry.agent || entry.author;
                                      if (!rawAuthor || rawAuthor.toLowerCase() === 'agent' || rawAuthor === 'profile-001' || rawAuthor === '1') {
                                        return userProfile?.full_name || 'Agent';
                                      }
                                      const matched = profiles.find(p => p.id === rawAuthor || p.email?.toLowerCase() === rawAuthor.toLowerCase() || p.full_name?.toLowerCase() === rawAuthor.toLowerCase());
                                      return matched?.full_name || rawAuthor;
                                    })()}</span>
                                  </div>
                                  <h5 className="text-[12px] font-semibold text-slate-800 capitalize flex items-center gap-1">
                                    {entry.type === 'call' && <i className="ti ti-phone text-slate-500"></i>}
                                    {entry.type === 'whatsapp' && <i className="ti ti-brand-whatsapp text-slate-500"></i>}
                                    {entry.type === 'email' && <i className="ti ti-mail text-slate-500"></i>}
                                    {entry.stage || entry.status || entry.type || 'Activity'}
                                  </h5>
                                  {(entry.remarks || entry.content) && (
                                    <div className="bg-slate-50 border border-slate-100 rounded-md p-2 mt-1 text-[12px] text-slate-600 font-normal leading-relaxed">
                                      {entry.remarks || entry.content}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* Inline comment logging */}
                    <form onSubmit={handleLogTimelineNote} className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2 items-center">
                      <Input
                        placeholder="Log timeline note or call summary..."
                        value={timelineNote}
                        onChange={(e) => setTimelineNote(e.target.value)}
                        className="text-xs h-8 bg-background flex-1 focus-visible:ring-[#C9A25A]"
                        required
                      />
                      <select
                        value={timelineType}
                        onChange={(e) => setTimelineType(e.target.value as any)}
                        className="text-xs h-8 border border-slate-200 rounded px-1.5 bg-background font-semibold text-slate-600 focus:outline-none cursor-pointer"
                      >
                        <option value="note">Note</option>
                        <option value="call">Call</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                      </select>
                      <Button type="submit" size="sm" className="h-8 bg-gradient-to-r from-[#C9A25A] to-[#D4AF37] hover:opacity-90 text-[#0B1026] text-xs font-extrabold px-3 shrink-0">
                        Log Entry
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TOUR ITINERARY BUILDER LIVE */}
          {currentSection === 'itinerary' && activeLead && (
            <Suspense fallback={<NavyGoldLoader />}>
              <ItineraryBuilder 
                leadId={leadId || ''}
                activeLead={activeLead}
                onBack={() => navigate(`/crm/leads/${activeLead.id}`)}
                userProfile={userProfile}
                onOpenCsvImport={() => setCsvImportOpen(true)}
                onOpenUserManagement={() => setUserManagementOpen(true)}
              />
            </Suspense>
          )}

          {/* MULTI-OPTION PROPOSALS WORKSPACE */}
          {currentSection === 'proposals' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <LeadProposalsWorkspace 
                activeLead={activeLead || { id: leadId || 19, customer_name: 'Navin Mishra', destination: 'Haridwar' }}
                onOpenBuilderForProposal={(propId) => navigate(`/crm/leads/${leadId || 19}/itinerary`)}
                onBackToLeads={() => navigate('/crm/leads')}
              />
            </Suspense>
          )}

          {/* GLOBAL ITINERARY WORKSPACE */}
          {currentSection === 'itineraries-mocked' && (
            <ItineraryWorkspace
              leads={leads}
              onNavigateLead={(leadId, suffix) => navigate(suffix ? `/crm/leads/${leadId}/${suffix}` : `/crm/leads/${leadId}`)}
            />
          )}

          {/* GLOBAL PACKAGES DIRECTORY */}
          {currentSection === 'packages' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <PackageMaster />
            </Suspense>
          )}

          {/* GLOBAL BLOGS DIRECTORY */}
          {currentSection === 'blogs' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <BlogMaster />
            </Suspense>
          )}

          {/* GLOBAL PAYMENTS LEDGER & UPI TRACING HUB */}
          {currentSection === 'payments-mocked' && (() => {
            const filteredPayments = allPayments.filter(pay => {
              if (paymentSearch) {
                const q = paymentSearch.toLowerCase();
                const clientObj = leads.find(l => 
                  String(l.id) === String(pay.lead_id) || 
                  (l.lead_id && String(l.lead_id) === String(pay.lead_id)) ||
                  (l.enquiry_number && String(l.enquiry_number) === String(pay.lead_id))
                ) || pay.leads || pay.lead;
                const clientName = (clientObj?.customer_name || pay.customer_name || pay.client_name || (pay.lead_id ? `Client (#${pay.lead_id})` : 'Direct Customer')).toLowerCase();
                const matchClient = clientName.includes(q);
                const matchRemarks = (pay.remarks || '').toLowerCase().includes(q);
                const matchRef = (pay.reference_number || '').toLowerCase().includes(q);
                const matchDate = (pay.payment_date || '').toLowerCase().includes(q);
                if (!matchClient && !matchRemarks && !matchRef && !matchDate) return false;
              }
              if (paymentFilterMode !== 'all' && (pay.payment_mode || '').toLowerCase() !== paymentFilterMode.toLowerCase()) return false;
              return true;
            });

            const totalReceived = allPayments.reduce((acc, p) => acc + Number(p.amount_received || 0), 0);
            const totalCharges = allPayments.reduce((acc, p) => acc + Number(p.gateway_charges || 0), 0);
            const totalNet = totalReceived - totalCharges;
            const upiCount = allPayments.filter(p => (p.payment_mode || 'UPI').toUpperCase().includes('UPI')).length;

            return (
              <div className="space-y-6 text-left font-poppins pb-12">
                {/* UPI & Payments Top Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#0B1026] via-[#1E2942] to-[#0B1026] p-6 rounded-2xl border border-white/10 text-white shadow-2xl">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5" />
                      0% MDR Fee UPI Payment Hub
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-white font-montserrat">
                      UPI & Accounts Booking Ledger
                    </h1>
                    <p className="text-xs text-slate-300">
                      Trace client payments by 12-digit UPI UTR / RRN reference numbers, verify advance deposits, and issue WhatsApp receipts.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => setRecordPaymentDialogOpen(true)}
                      className="bg-gradient-warm hover:scale-105 text-[#0B1026] font-bold text-xs h-11 px-5 rounded-xl shadow-lg flex items-center gap-2 border-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Record Payment Entry
                    </Button>
                  </div>
                </div>

                {/* Financial KPI Stats Cards Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Received</p>
                      <div className="text-2xl font-black text-amber-400 mt-1">
                        ₹{totalReceived.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Gross client receipts</p>
                    </div>
                    <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                  </Card>

                  <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Net Bank Payout</p>
                      <div className="text-2xl font-black text-emerald-400 mt-1">
                        ₹{totalNet.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[10px] text-emerald-400/80 font-semibold mt-0.5">Verified bank deposit</p>
                    </div>
                    <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </Card>

                  <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">UPI / QR Transactions</p>
                      <div className="text-2xl font-black text-cyan-400 mt-1">
                        {upiCount} / {allPayments.length}
                      </div>
                      <p className="text-[10px] text-cyan-400/80 font-semibold mt-0.5">₹0 MDR processing fee</p>
                    </div>
                    <div className="p-3 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30">
                      <Zap className="w-6 h-6" />
                    </div>
                  </Card>

                  <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Card Gateway Fees</p>
                      <div className="text-2xl font-black text-rose-400 mt-1">
                        ₹{totalCharges.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[10px] text-rose-400/80 font-semibold mt-0.5">Razorpay 2.36% card fee</p>
                    </div>
                    <div className="p-3 bg-rose-500/15 text-rose-400 rounded-xl border border-rose-500/30">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </Card>
                </div>

                {/* HEADER & FILTERS TOOLBAR CARD */}
                <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="p-5 border-b border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-extrabold flex items-center gap-2 text-white">
                          <IndianRupee className="w-4.5 h-4.5 text-accent" /> Payments & Booking Verification Ledger
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-300 font-medium mt-0.5">
                          Trace 12-digit UPI UTR numbers e.g. <code className="bg-white/10 text-amber-300 px-1.5 py-0.5 rounded">423891023847</code> or PhonePe reference IDs to verify bookings.
                        </CardDescription>
                      </div>
                    </div>

                    {/* Filter Toolbar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                      <div className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          value={paymentSearch}
                          onChange={e => setPaymentSearch(e.target.value)}
                          placeholder="Type 12-digit UPI UTR, GPay ID, client name, or date..."
                          className="pl-9 h-9 text-xs rounded-xl bg-white/5 border-white/15 text-white font-medium placeholder:text-slate-400 focus-visible:ring-accent"
                        />
                      </div>

                      {/* Payment Mode Filter */}
                      <Select value={paymentFilterMode} onValueChange={setPaymentFilterMode}>
                        <SelectTrigger className="h-9 text-xs font-bold bg-white/5 border-white/15 text-white rounded-xl">
                          <SelectValue placeholder="Payment Mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs">
                          <SelectItem value="all">All Payment Modes</SelectItem>
                          <SelectItem value="upi">⚡ UPI / GPay / PhonePe / QR Code</SelectItem>
                          <SelectItem value="credit card">💳 Credit Card</SelectItem>
                          <SelectItem value="debit card">💳 Debit Card</SelectItem>
                          <SelectItem value="netbanking">🏦 Net Banking / NEFT / IMPS</SelectItem>
                          <SelectItem value="cash">💵 Cash Entry</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center justify-end px-2 text-xs text-slate-300 font-extrabold">
                        Showing {filteredPayments.length} of {allPayments.length} entries
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {paymentsLoading ? (
                      <div className="py-16 text-center text-xs text-slate-400 font-bold space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                        <p>Loading UPI & Accounts ledger...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-white/10 border-b border-white/10 text-slate-200 font-black uppercase tracking-wider text-[10px]">
                              <th className="p-3.5">Payment Date</th>
                              <th className="p-3.5">Client / Customer Name</th>
                              <th className="p-3.5">Booking Remarks</th>
                              <th className="p-3.5">Payment Mode</th>
                              <th className="p-3.5">UPI UTR / Reference No.</th>
                              <th className="p-3.5 text-right">Amount Received</th>
                              <th className="p-3.5 text-right text-rose-400">Gateway Fee</th>
                              <th className="p-3.5 text-right text-emerald-400">Net Deposit</th>
                              <th className="p-3.5 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10 text-white">
                            {filteredPayments.map((pay: any, idx: number) => {
                              const amount = Number(pay.amount_received || 0);
                              const charges = Number(pay.gateway_charges || 0);
                              const net = amount - charges;
                              const clientObj = leads.find(l => 
                                String(l.id) === String(pay.lead_id) || 
                                (l.lead_id && String(l.lead_id) === String(pay.lead_id)) ||
                                (l.enquiry_number && String(l.enquiry_number) === String(pay.lead_id))
                              ) || pay.leads || pay.lead;
                              const clientName = clientObj?.customer_name || pay.customer_name || pay.client_name || (pay.lead_id ? `Client (#${pay.lead_id})` : 'Direct Customer');
                              const clientPhone = clientObj?.contact_number || '';
                              const modeStr = (pay.payment_mode || 'UPI').toUpperCase();
                              const isUpi = modeStr.includes('UPI') || modeStr.includes('GPAY') || modeStr.includes('PHONEPE');

                              const handleWhatsAppReceipt = () => {
                                const msg = `*GHUMO FIROO TRAVELS - OFFICIAL PAYMENT RECEIPT*%0A%0A` +
                                  `👤 *Client Name:* ${clientName}%0A` +
                                  `💰 *Amount Received:* ₹${amount.toLocaleString('en-IN')}%0A` +
                                  `⚡ *Payment Mode:* ${pay.payment_mode || 'UPI'}%0A` +
                                  `🧾 *UTR / Reference No:* ${pay.reference_number || 'N/A'}%0A` +
                                  `📅 *Payment Date:* ${pay.payment_date || new Date().toLocaleDateString()}%0A` +
                                  `📌 *Remarks:* ${pay.remarks || 'Advance Tour Deposit'}%0A%0A` +
                                  `🟢 *Status:* Confirmed & Deposited%0A` +
                                  `Thank you for booking your journey with Ghumo Firoo Travels! ✨`;
                                
                                const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
                                const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
                                window.open(waUrl, '_blank');
                              };

                              return (
                                <tr key={`pay-${pay.id || idx}-${idx}`} className="hover:bg-white/5 transition-colors">
                                  <td className="p-3.5 font-mono text-[11px] text-slate-300 font-semibold">{pay.payment_date}</td>
                                  <td className="p-3.5 font-extrabold text-xs text-white uppercase">{clientName}</td>
                                  <td className="p-3.5 text-slate-300 font-medium">{pay.remarks || 'Online Booking Deposit'}</td>
                                  <td className="p-3.5">
                                    <Badge variant="outline" className={`text-[10px] font-black uppercase border px-2.5 py-0.5 rounded-full ${
                                      isUpi ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    }`}>
                                      {isUpi ? '⚡ UPI' : pay.payment_mode}
                                    </Badge>
                                  </td>
                                  <td className="p-3.5 font-mono text-[11px] text-amber-400 font-black flex items-center gap-1.5">
                                    {pay.reference_number || '---'}
                                  </td>
                                  <td className="p-3.5 text-right font-black text-xs text-white">₹{amount.toLocaleString('en-IN')}</td>
                                  <td className="p-3.5 text-right font-bold text-xs text-rose-400">
                                    {charges > 0 ? `₹${charges.toLocaleString('en-IN')}` : <span className="text-emerald-400 text-[10px] font-extrabold">₹0 (UPI)</span>}
                                  </td>
                                  <td className="p-3.5 text-right font-black text-xs text-emerald-400">₹{net.toLocaleString('en-IN')}</td>
                                  <td className="p-3.5 text-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={handleWhatsAppReceipt}
                                      className="h-7 px-2 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/30 flex items-center gap-1 mx-auto cursor-pointer"
                                      title="Send WhatsApp Payment Receipt"
                                    >
                                      <Share2 className="w-3 h-3" /> WhatsApp Receipt
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                            {filteredPayments.length === 0 && (
                              <tr>
                                <td colSpan={9} className="text-center py-12 text-slate-400 font-semibold">
                                  No transaction records matching your search or UPI UTR criteria.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {filteredPayments.length > 0 && (
                      <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex justify-between items-center">
                        <p className="text-xs text-slate-300 font-medium">Showing <strong>{filteredPayments.length}</strong> of <strong>{allPayments.length}</strong> ledger entries</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* GLOBAL REPORTS */}
          {currentSection === 'reports-mocked' && (() => {
            // Filter leads by date range safely
            const filteredLeads = leads.filter(l => {
              const dateStr = l.created_at || l.lead_created_date;
              if (!dateStr) return false;
              try {
                // Ensure date conversion works across formats
                const cleanDate = dateStr.replace(' ', 'T');
                const leadDate = new Date(cleanDate).toISOString().split('T')[0];
                return leadDate >= reportsStartDate && leadDate <= reportsEndDate;
              } catch (e) {
                return false;
              }
            });

            const totalLeadsCount = filteredLeads.length;
            const convertedLeads = filteredLeads.filter(l => l.status === 'Booking Confirmed');
            const convertedCount = convertedLeads.length;
            const droppedCount = filteredLeads.filter(l => l.status === 'Closed Lost').length;
            const winRate = totalLeadsCount > 0 ? Math.round((convertedCount / totalLeadsCount) * 100) : 0;
            
            // Financial Metrics
            const pipelineValue = filteredLeads
              .filter(l => l.status !== 'Closed Lost')
              .reduce((sum, l) => sum + (l.expected_booking_value || 0), 0);
            
            const realizedRevenue = convertedLeads
              .reduce((sum, l) => sum + (l.expected_booking_value || 0), 0);
            
            const paymentsCollected = (allPayments || [])
              .reduce((sum, p) => sum + Number(p.amount_received || 0), 0);

            // Lead status counts for Recharts BarChart
            const statusChartData = [
              { name: 'New', value: filteredLeads.filter(l => l.status === 'New').length, color: '#3b82f6' },
              { name: 'Assigned', value: filteredLeads.filter(l => l.status === 'Assigned').length, color: '#06b6d4' },
              { name: 'Follow-up Due', value: filteredLeads.filter(l => l.status === 'Follow-up Due').length, color: '#8b5cf6' },
              { name: 'Quote Sent', value: filteredLeads.filter(l => l.status === 'Quote Sent').length, color: '#f59e0b' },
              { name: 'Booking Confirmed', value: convertedCount, color: '#10b981' },
              { name: 'Closed Lost', value: droppedCount, color: '#ef4444' },
            ];

            // Lead source analysis
            const sourceMap: Record<string, { count: number; converted: number }> = {};
            filteredLeads.forEach(l => {
              const src = l.customer_type || 'Direct Customer';
              if (!sourceMap[src]) {
                sourceMap[src] = { count: 0, converted: 0 };
              }
              sourceMap[src].count++;
              if (l.status === 'Booking Confirmed') {
                sourceMap[src].converted++;
              }
            });
            const sourceData = Object.entries(sourceMap).map(([name, data]) => ({
              name,
              value: data.count,
              converted: data.converted,
              rate: data.count > 0 ? Math.round((data.converted / data.count) * 100) : 0
            })).sort((a, b) => b.value - a.value);

            // Executive performance
            const execMap: Record<string, { count: number; converted: number; revenue: number }> = {};
            filteredLeads.forEach(l => {
              const exec = l.assigned_to || 'Unassigned';
              if (!execMap[exec]) {
                execMap[exec] = { count: 0, converted: 0, revenue: 0 };
              }
              execMap[exec].count++;
              if (l.status === 'Booking Confirmed') {
                execMap[exec].converted++;
                execMap[exec].revenue += (l.expected_booking_value || 0);
              }
            });
            const execData = Object.entries(execMap).map(([name, data]) => ({
              name,
              count: data.count,
              converted: data.converted,
              rate: data.count > 0 ? Math.round((data.converted / data.count) * 100) : 0,
              revenue: data.revenue
            })).sort((a, b) => b.revenue - a.revenue);

            // Destination Revenue Performance Breakdown
            const destMap: Record<string, { count: number; converted: number; revenue: number }> = {};
            filteredLeads.forEach(l => {
              const rawDest = (l.travel_interest || l.tour_description || 'Other Destinations').trim();
              let normDest = 'Other Destinations';
              const dLower = rawDest.toLowerCase();
              if (dLower.includes('rann') || dLower.includes('kutch') || dLower.includes('bhuj')) normDest = 'Rann Utsav Kutch';
              else if (dLower.includes('dham') || dLower.includes('kedarnath') || dLower.includes('badrinath')) normDest = 'Char Dham Yatra';
              else if (dLower.includes('kashmir') || dLower.includes('srinagar')) normDest = 'Kashmir Paradise';
              else if (dLower.includes('kerala') || dLower.includes('munnar') || dLower.includes('alleppey')) normDest = 'Kerala Backwaters';
              else if (dLower.includes('himachal') || dLower.includes('manali')) normDest = 'Himachal Adventure';
              else if (dLower.includes('europe') || dLower.includes('dubai') || dLower.includes('thailand') || dLower.includes('bali')) normDest = 'International Tours';
              else if (rawDest.length > 2) normDest = rawDest;

              if (!destMap[normDest]) destMap[normDest] = { count: 0, converted: 0, revenue: 0 };
              destMap[normDest].count++;
              if (l.status === 'Booking Confirmed') {
                destMap[normDest].converted++;
                destMap[normDest].revenue += (l.expected_booking_value || 0);
              }
            });

            const destData = Object.entries(destMap).map(([name, data]) => ({
              name,
              count: data.count,
              converted: data.converted,
              rate: data.count > 0 ? Math.round((data.converted / data.count) * 100) : 0,
              revenue: data.revenue
            })).sort((a, b) => b.revenue - a.revenue);

            const handleExportReport = () => {
              const headers = ['Executive Name', 'Total Leads Assigned', 'Confirmed Bookings', 'Conversion Rate %', 'Realized Revenue (INR)'];
              const csvRows = [headers.join(',')];
              execData.forEach(row => {
                csvRows.push([
                  `"${row.name}"`,
                  row.count,
                  row.converted,
                  `"${row.rate}%"`,
                  row.revenue
                ].join(','));
              });
              const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `executive_performance_report_${reportsStartDate}_to_${reportsEndDate}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

            // Consolidate and filter rates for Rate Management Overview
            const allRatesList: any[] = [];
            
            (ratesData.hotels || []).forEach((h: any) => {
              allRatesList.push({
                type: 'Hotel',
                name: h.hotel_name,
                city: h.city_name,
                details: `${h.room_type} (${h.meal_plan})`,
                rate: h.rate,
                is_active: h.is_active
              });
            });

            (ratesData.cabs || []).forEach((c: any) => {
              allRatesList.push({
                type: 'Cab',
                name: c.vendor_name,
                city: c.city_name,
                details: `${c.vehicle_type} - ${(c.usage_type || '').replace(/_/g, ' ')}`,
                rate: c.rate,
                is_active: c.is_active
              });
            });

            (ratesData.activities || []).forEach((a: any) => {
              allRatesList.push({
                type: 'Activity',
                name: a.activity_name,
                city: a.city_name,
                details: `${(a.category || 'General').toUpperCase()} (${(a.rate_type || '').replace(/_/g, ' ')})`,
                rate: a.rate,
                is_active: a.is_active
              });
            });

            const citiesList = Array.from(
              new Set(allRatesList.map(r => r.city).filter(Boolean))
            ).map((cityName: any) => ({
              id: cityName.toLowerCase().replace(/\s+/g, '-'),
              name: cityName
            }));

            const filteredRates = allRatesList.filter(r => {
              const matchesCity = rateCityFilter === 'all' || r.city.toLowerCase() === rateCityFilter.toLowerCase();
              const matchesType = rateTypeFilter === 'all' || r.type.toLowerCase() === rateTypeFilter.toLowerCase();
              const matchesSearch = !rateSearchTerm || 
                r.name.toLowerCase().includes(rateSearchTerm.toLowerCase()) ||
                r.details.toLowerCase().includes(rateSearchTerm.toLowerCase());
              return matchesCity && matchesType && matchesSearch;
            });

            return (
              <div className="space-y-6 text-left font-poppins pb-12">
                {/* Header Card */}
                <Card className="border border-white/10 overflow-hidden shadow-2xl rounded-2xl bg-gradient-to-r from-[#0B1026] via-[#1E2942] to-[#0B1026] text-white">
                  <CardHeader className="p-6 border-b border-white/10">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-extrabold flex items-center gap-2 text-white">
                        <TrendingUp className="w-5.5 h-5.5 text-accent" />
                        Operational Analytics & Rates Center
                      </CardTitle>
                      <CardDescription className="text-slate-300 text-xs font-semibold">
                        View business conversion performance, top destination rankings, export leaderboards, and inspect supplier rates.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Tabs defaultValue="funnel" className="w-full">
                  <TabsList className="inline-flex bg-[#1A2342]/80 border border-white/10 p-1 rounded-2xl mb-4 h-12">
                    <TabsTrigger value="funnel" className="rounded-xl text-xs font-bold py-2 px-5 data-[state=active]:bg-gradient-warm data-[state=active]:text-[#0B1026]">Sales & Conversion Funnel</TabsTrigger>
                    <TabsTrigger value="rates" className="rounded-xl text-xs font-bold py-2 px-5 data-[state=active]:bg-gradient-warm data-[state=active]:text-[#0B1026]">Rate Management Overview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="funnel" className="space-y-6">
                    {/* Date range pickers & Quick Presets */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1A2342]/60 border border-white/10 p-4 rounded-2xl backdrop-blur-xl shadow-xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">Period:</span>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              const today = new Date().toISOString().split('T')[0];
                              setReportsStartDate(today);
                              setReportsEndDate(today);
                            }}
                            className="h-7 text-[10px] font-bold px-2.5 rounded-lg border-white/15 bg-white/5 hover:bg-white/15 text-slate-200"
                          >
                            Today
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              const now = new Date();
                              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                              setReportsStartDate(startOfMonth);
                              setReportsEndDate(now.toISOString().split('T')[0]);
                            }}
                            className="h-7 text-[10px] font-bold px-2.5 rounded-lg border-white/15 bg-white/5 hover:bg-white/15 text-slate-200"
                          >
                            This Month
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              const d = new Date();
                              d.setDate(d.getDate() - 30);
                              setReportsStartDate(d.toISOString().split('T')[0]);
                              setReportsEndDate(new Date().toISOString().split('T')[0]);
                            }}
                            className="h-7 text-[10px] font-bold px-2.5 rounded-lg border-white/15 bg-white/5 hover:bg-white/15 text-slate-200"
                          >
                            Last 30 Days
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
                              setReportsStartDate(startOfYear);
                              setReportsEndDate(new Date().toISOString().split('T')[0]);
                            }}
                            className="h-7 text-[10px] font-bold px-2.5 rounded-lg border-white/15 bg-white/5 hover:bg-white/15 text-slate-200"
                          >
                            YTD (This Year)
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setReportsStartDate('2020-01-01');
                              setReportsEndDate(new Date().toISOString().split('T')[0]);
                            }}
                            className="h-7 text-[10px] font-bold px-2.5 rounded-lg border-white/15 bg-white/5 hover:bg-white/15 text-slate-200"
                          >
                            All Time
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                          <Input 
                            type="date" 
                            value={reportsStartDate} 
                            onChange={(e) => setReportsStartDate(e.target.value)} 
                            className="h-8 text-xs rounded-xl bg-white/5 border-white/15 w-32 shadow-sm font-semibold text-white"
                          />
                          <span className="text-slate-400 text-xs font-semibold">to</span>
                          <Input 
                            type="date" 
                            value={reportsEndDate} 
                            onChange={(e) => setReportsEndDate(e.target.value)} 
                            className="h-8 text-xs rounded-xl bg-white/5 border-white/15 w-32 shadow-sm font-semibold text-white"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleExportReport} 
                        size="sm" 
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-8 rounded-xl flex items-center gap-1.5 shadow-md border-0 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Export Funnel CSV
                      </Button>
                    </div>

                    {/* KPI Metrics Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Leads Pipeline</span>
                          <h3 className="text-2xl font-black text-white">{totalLeadsCount}</h3>
                          <p className="text-[10px] text-slate-400 font-semibold">Closed Lost: {droppedCount} leads</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <Users className="w-6 h-6" />
                        </div>
                      </Card>

                      <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
                        <div className="space-y-1 w-full mr-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Win Rate / Conversion</span>
                          <h3 className="text-2xl font-black text-emerald-400">{winRate}%</h3>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${winRate}%` }} />
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      </Card>

                      <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pipeline Value</span>
                          <h3 className="text-2xl font-black text-amber-400">₹{pipelineValue.toLocaleString()}</h3>
                          <p className="text-[10px] text-slate-400 font-semibold">Won: ₹{realizedRevenue.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <IndianRupee className="w-6 h-6" />
                        </div>
                      </Card>

                      <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payments Collected</span>
                          <h3 className="text-2xl font-black text-purple-400">₹{paymentsCollected.toLocaleString()}</h3>
                          <p className="text-[10px] text-slate-400 font-semibold">Ledger Entries: {allPayments?.length || 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                          <Landmark className="w-6 h-6" />
                        </div>
                      </Card>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl">
                        <CardHeader className="p-0 pb-4">
                          <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-400">Status Funnel Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-64">
                          {totalLeadsCount === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">No leads within range</div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <ChartTooltip 
                                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                                  labelStyle={{ fontWeight: 'bold', color: '#fbbf24' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                  {statusChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-white/10 p-5 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl">
                        <CardHeader className="p-0 pb-4">
                          <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-400">Lead Source Channels</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-64 flex flex-col sm:flex-row items-center justify-center">
                          {sourceData.length === 0 ? (
                            <div className="text-slate-400 text-xs font-semibold">No source data within range</div>
                          ) : (
                            <>
                              <div className="w-full sm:w-1/2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={sourceData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={3}
                                      dataKey="value"
                                    >
                                      {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <ChartTooltip
                                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="w-full sm:w-1/2 flex flex-col justify-center gap-2 pl-4 text-xs">
                                {sourceData.map((entry, index) => (
                                  <div key={entry.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                      <span className="text-slate-300 font-bold truncate max-w-[100px]">{entry.name}</span>
                                    </div>
                                    <span className="font-extrabold text-white">{entry.value} ({entry.rate}% Win)</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Leaderboards Grid & Destination Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Destination Revenue Leaderboard Card */}
                      <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="p-5 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
                          <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-accent" />
                            Top Profit Destination Performance
                          </CardTitle>
                          <Badge className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            Revenue Ranking
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                          {destData.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No destination booking data within range.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                  <tr className="bg-white/10 border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-300">
                                    <th className="p-3.5">Destination</th>
                                    <th className="p-3.5 text-center">Enquiries</th>
                                    <th className="p-3.5 text-center">Won</th>
                                    <th className="p-3.5 text-center">Conversion</th>
                                    <th className="p-3.5 text-right">Revenue Won</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                  {destData.map((row) => (
                                    <tr key={row.name} className="hover:bg-white/5 transition-colors">
                                      <td className="p-3.5 font-bold text-white flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-accent" />
                                        {row.name}
                                      </td>
                                      <td className="p-3.5 text-center text-slate-300 font-semibold">{row.count}</td>
                                      <td className="p-3.5 text-center text-emerald-400 font-bold">{row.converted}</td>
                                      <td className="p-3.5 text-center font-bold text-slate-200">{row.rate}%</td>
                                      <td className="p-3.5 text-right font-black text-amber-400">₹{row.revenue.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Executive Lead Conversion Leaderboard */}
                      <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="p-5 border-b border-white/10 bg-white/5">
                          <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-blue-400" />
                            Executive Lead Conversion Leaderboard
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {execData.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No conversion data within range.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                  <tr className="bg-white/10 border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-300">
                                    <th className="p-3.5">Executive</th>
                                    <th className="p-3.5 text-center">Assigned</th>
                                    <th className="p-3.5 text-center">Won</th>
                                    <th className="p-3.5 text-center">Conv. Rate</th>
                                    <th className="p-3.5 text-right">Revenue Won</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                  {execData.map((row) => (
                                    <tr key={row.name} className="hover:bg-white/5 transition-colors">
                                      <td className="p-3.5 font-bold text-white">{row.name}</td>
                                      <td className="p-3.5 text-center text-slate-300 font-semibold">{row.count}</td>
                                      <td className="p-3.5 text-center text-emerald-400 font-bold">{row.converted}</td>
                                      <td className="p-3.5 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                          row.rate >= 40 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                          row.rate >= 20 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                          'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                        }`}>
                                          {row.rate}%
                                        </span>
                                      </td>
                                      <td className="p-3.5 text-right font-black text-amber-400">₹{row.revenue.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden col-span-1 lg:col-span-2">
                        <CardHeader className="p-5 border-b border-white/10 bg-white/5">
                          <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            Lead Source Performance Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {sourceData.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs font-semibold">No source data within range.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                  <tr className="bg-white/10 border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-300">
                                    <th className="p-3.5">Source Channel</th>
                                    <th className="p-3.5 text-center">Total Leads</th>
                                    <th className="p-3.5 text-center">Confirmed</th>
                                    <th className="p-3.5 text-center">Conv. Rate</th>
                                    <th className="p-3.5 text-right">Share</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                  {sourceData.map((row) => (
                                    <tr key={row.name} className="hover:bg-white/5 transition-colors">
                                      <td className="p-3.5 font-bold text-white">{row.name}</td>
                                      <td className="p-3.5 text-center text-slate-300 font-semibold">{row.value}</td>
                                      <td className="p-3.5 text-center text-emerald-400 font-bold">{row.converted}</td>
                                      <td className="p-3.5 text-center">
                                        <span className="inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-500/20 text-slate-300 border border-slate-500/30">
                                          {row.rate}%
                                        </span>
                                      </td>
                                      <td className="p-3.5 text-right font-bold text-amber-400">
                                        {totalLeadsCount > 0 ? Math.round((row.value / totalLeadsCount) * 100) : 0}%
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="rates" className="space-y-6">
                    {/* Filters bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#1A2342]/60 border border-white/10 p-4 rounded-2xl backdrop-blur-xl shadow-xl">
                      {/* Search */}
                      <div className="space-y-1 text-left">
                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Search Rates</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <Input 
                            type="text" 
                            placeholder="Search by hotel/cab name..."
                            value={rateSearchTerm}
                            onChange={(e) => setRateSearchTerm(e.target.value)}
                            className="pl-9 h-9 text-xs rounded-xl bg-white/5 border-white/15 text-white shadow-sm font-semibold focus-visible:ring-accent"
                          />
                        </div>
                      </div>

                      {/* City Filter */}
                      <div className="space-y-1 text-left">
                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Filter by City</Label>
                        <Select value={rateCityFilter} onValueChange={setRateCityFilter}>
                          <SelectTrigger className="h-9 text-xs rounded-xl bg-white/5 border-white/15 text-white font-semibold">
                            <SelectValue placeholder="All Cities" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border border-slate-700 bg-slate-900 text-white text-xs">
                            <SelectItem value="all">All Cities</SelectItem>
                            {citiesList.map((c: any) => (
                              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Type Filter */}
                      <div className="space-y-1 text-left">
                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Service Type</Label>
                        <Select value={rateTypeFilter} onValueChange={setRateTypeFilter}>
                          <SelectTrigger className="h-9 text-xs rounded-xl bg-white/5 border-white/15 text-white font-semibold">
                            <SelectValue placeholder="All Services" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border border-slate-700 bg-slate-900 text-white text-xs">
                            <SelectItem value="all">All Services</SelectItem>
                            <SelectItem value="hotel">Hotels</SelectItem>
                            <SelectItem value="cab">Cabs</SelectItem>
                            <SelectItem value="activity">Activities</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Rates Grid Table */}
                    <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
                      <CardContent className="p-0">
                        {ratesLoading ? (
                          <div className="p-12 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent" />
                            Loading supplier contract rates...
                          </div>
                        ) : filteredRates.length === 0 ? (
                          <div className="p-12 text-center text-slate-400 text-xs font-semibold">No rates match the active filters.</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-white/10 border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-300">
                                  <th className="p-3.5">Service Type</th>
                                  <th className="p-3.5">Supplier / Name</th>
                                  <th className="p-3.5">Location</th>
                                  <th className="p-3.5">Specification / Rate Details</th>
                                  <th className="p-3.5 text-right">Rate (INR)</th>
                                  <th className="p-3.5 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10">
                                {filteredRates.map((row, index) => (
                                  <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3.5">
                                      <Badge variant="outline" className={`font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                        row.type === 'Hotel' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                        row.type === 'Cab' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                        'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                      }`}>
                                        {row.type}
                                      </Badge>
                                    </td>
                                    <td className="p-3.5 font-bold text-white">{row.name}</td>
                                    <td className="p-3.5 font-bold text-slate-300">{row.city}</td>
                                    <td className="p-3.5 text-slate-300 font-semibold">{row.details}</td>
                                    <td className="p-3.5 text-right font-black text-amber-400">₹{row.rate.toLocaleString('en-IN')}</td>
                                    <td className="p-3.5 text-center">
                                      <span className={`inline-flex w-2.5 h-2.5 rounded-full ${
                                        row.is_active ? 'bg-emerald-400 shadow-md shadow-emerald-400/20' : 'bg-slate-500'
                                      }`} title={row.is_active ? 'Active Contract' : 'Inactive'} />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            );
          })()}

          {(currentSection === 'hotels' || currentSection === 'suppliers') && (
            <Suspense fallback={<NavyGoldLoader />}>
              <HotelContracting />
            </Suspense>
          )}

          {currentSection === 'reviews' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <ReviewModeration />
            </Suspense>
          )}

          {currentSection === 'email-marketing' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <EmailMarketingHub />
            </Suspense>
          )}

          {currentSection === 'cabs' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <CabContracting />
            </Suspense>
          )}

          {currentSection === 'activities' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <ActivityMaster />
            </Suspense>
          )}

          {currentSection === 'sightseeings' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <SightseeingMaster />
            </Suspense>
          )}

          {currentSection === 'india-explorer' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <IndiaExplorer />
            </Suspense>
          )}

          {currentSection === 'visas' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <VisaMaster />
            </Suspense>
          )}

          {currentSection === 'destinations' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <DestinationManagement />
            </Suspense>
          )}

          {currentSection === 'bulk-upload' && (() => {
            let bulkMod: any = 'hotels';
            const path = location.pathname.toLowerCase();
            if (path.includes('cab')) bulkMod = 'cabs';
            else if (path.includes('sight')) bulkMod = 'sightseeings';
            else if (path.includes('activit')) bulkMod = 'activities';
            else if (path.includes('package')) bulkMod = 'packages';
            else if (path.includes('lead')) bulkMod = 'leads';
            return (
              <Suspense fallback={<NavyGoldLoader />}>
                <BulkUploadHub initialModule={bulkMod} />
              </Suspense>
            );
          })()}

          {currentSection === 'audit-logs' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <AuditLogsViewer />
            </Suspense>
          )}

          {currentSection === 'agent-roles' && (
            <Suspense fallback={<NavyGoldLoader />}>
              <AgentRoleManagement />
            </Suspense>
          )}
        </main>
      </div>

      {/* CSV IMPORT DIALOG */}
      <CSVImport
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImportComplete={fetchLeads}
      />

      {/* COMMENTS / DISCUSSIONS DIALOG */}
      {selectedLeadForComments && (
        <CommentsDialog 
          isOpen={commentsDialogOpen}
          onClose={() => {
            setCommentsDialogOpen(false);
            setSelectedLeadForComments(null);
          }}
          leadId={selectedLeadForComments.id}
          leadName={selectedLeadForComments.name}
        />
      )}

      {/* CALL FOLLOW-UP MODAL */}
      {selectedLeadForFollowUp && (
        <FollowUpModal
          isOpen={followUpModalOpen}
          onClose={() => {
            setFollowUpModalOpen(false);
            setSelectedLeadForFollowUp(null);
          }}
          onSubmit={async (data) => {
            await handleFollowUpSubmit(selectedLeadForFollowUp.id, data);
          }}
          leadName={selectedLeadForFollowUp.name}
        />
      )}

      {/* USER REGISTRATION & PERMISSION MANAGEMENT DIALOG */}
      <UserManagementDialog 
        isOpen={userManagementOpen}
        onClose={() => setUserManagementOpen(false)}
      />

      {/* EMAIL PROPOSAL BUILDER DIALOG */}
      {activeLead && (
        <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
          <DialogContent className="max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl p-0 overflow-hidden shadow-2xl">
            <form onSubmit={handleSendProposalSubmit} className="space-y-0">
              {/* Header with warm/dark travel-agency themed gradient banner */}
              <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 p-6 text-slate-950 text-left relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <span className="text-[10px] font-black tracking-widest uppercase bg-slate-950/20 px-2 py-0.5 rounded-full mb-2 inline-block">
                  TMC / DMC Proposal Engine
                </span>
                <DialogTitle className="text-xl font-extrabold flex items-center gap-2.5 font-montserrat text-slate-950 leading-tight">
                  <Send className="w-5.5 h-5.5 text-slate-950 animate-bounce" />
                  Dispatch Email Proposal
                </DialogTitle>
                <DialogDescription className="text-slate-900/80 text-xs font-medium mt-1">
                  Draft and transmit a premium itinerary offer directly to your customer's inbox.
                </DialogDescription>
              </div>

              <div className="p-6 space-y-5 text-left">
                {/* Field: Template Selection */}
                <div className="space-y-2">
                  <Label htmlFor="prop_temp" className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5 text-amber-500" />
                    Itinerary Template Selection *
                  </Label>
                  <Select value={proposalTemplate} onValueChange={setProposalTemplate}>
                    <SelectTrigger 
                      id="prop_temp" 
                      name="templateName" 
                      className="text-xs bg-slate-950 border-slate-800 text-white rounded-xl h-11 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white rounded-xl">
                      <SelectItem value="Classic Tour" className="focus:bg-amber-500 focus:text-slate-950">Classic Tour (3 Star Comfort)</SelectItem>
                      <SelectItem value="Luxury Escape" className="focus:bg-amber-500 focus:text-slate-950">Luxury Escape (5 Star Resort)</SelectItem>
                      <SelectItem value="Pilgrimage Char Dham" className="focus:bg-amber-500 focus:text-slate-950">Char Dham Helicopter Yatra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Field: Cost */}
                <div className="space-y-2">
                  <Label htmlFor="prop_cost" className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
                    Expected Package Price (INR) *
                  </Label>
                  <div className="relative">
                    <Input 
                      id="prop_cost" 
                      name="expectedCost"
                      placeholder="e.g. 45000" 
                      value={proposalCost}
                      onChange={(e) => setProposalCost(e.target.value)}
                      className="text-xs bg-slate-950 border-slate-800 text-white rounded-xl h-11 pl-3 focus-visible:ring-amber-500 focus-visible:border-amber-500"
                      required 
                    />
                  </div>
                </div>

                {/* Field: Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="prop_rem" className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    Additional Remarks / Cover Message
                  </Label>
                  <Textarea 
                    id="prop_rem" 
                    name="coverRemarks"
                    placeholder="Type customized details to appear in email proposal..." 
                    value={proposalRemarks}
                    onChange={(e) => setProposalRemarks(e.target.value)}
                    className="text-xs bg-slate-950 border-slate-800 text-white rounded-xl focus-visible:ring-amber-500 focus-visible:border-amber-500"
                    rows={4}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-950 p-4 border-t border-slate-850 flex justify-end gap-2.5">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setProposalDialogOpen(false)}
                  className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:scale-[1.02] active:scale-95 text-slate-950 font-extrabold text-xs h-10 px-5 rounded-xl border-0 shadow-lg cursor-pointer transition-all duration-200"
                >
                  Send Proposal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* DELETE LEAD DIALOG */}
      {leadToDelete && (
        <DeleteLeadModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setLeadToDelete(null);
          }}
          onConfirm={handleDeleteLead}
          leadName={leadToDelete.name}
          isDeleting={isDeleting}
        />
      )}

      {/* RECORD PAYMENT DIALOG */}
      <Dialog open={recordPaymentDialogOpen} onOpenChange={setRecordPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-slate-900 border border-white/10 text-white font-poppins rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold uppercase tracking-wider flex items-center gap-2 text-white">
              <IndianRupee className="w-5 h-5 text-accent" />
              Record Booking Payment Entry
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              Select customer booking and enter payment receipt or 12-digit UPI UTR number.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
            {/* Customer / Booking Selector */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-200 block uppercase">Select Client / Booking *</Label>
              <Select 
                value={selectedLeadForPayment || activeLead?.id || ''} 
                onValueChange={setSelectedLeadForPayment}
              >
                <SelectTrigger className="text-xs bg-white/5 border-white/15 text-white h-10 rounded-xl font-bold">
                  <SelectValue placeholder="-- Select Customer / Booking --" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs max-h-64">
                  {(() => {
                    const sortedLeads = [...leads]
                      .filter(l => !l.deleted_at && l.status !== 'Closed Lost')
                      .sort((a, b) => {
                        const rank = (st: string) => st === 'Booking Confirmed' ? 0 : st === 'Quote Sent' ? 1 : 2;
                        return rank(a.status) - rank(b.status);
                      });

                    if (sortedLeads.length === 0) {
                      return <SelectItem value="none" disabled>No active bookings or leads found</SelectItem>;
                    }

                    return sortedLeads.map(l => {
                      const leadRef = formatLeadId(l);
                      const dest = l.destinations || l.travel_interest || 'General Tour';
                      const statusIcon = l.status === 'Booking Confirmed' ? '🟢' : l.status === 'Quote Sent' ? '🟡' : '⚪';
                      const val = Number(l.packagePrice || l.expected_booking_value || 0);

                      return (
                        <SelectItem key={l.id} value={l.id} className="py-2">
                          {statusIcon} {l.customer_name} — <span className="font-mono text-amber-400">{leadRef}</span> ({dest} • {l.status} • Est: ₹{val.toLocaleString('en-IN')})
                        </SelectItem>
                      );
                    });
                  })()}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pay-amt" className="text-xs font-bold text-slate-200 block uppercase">Payment Amount (INR) *</Label>
              <Input 
                id="pay-amt" 
                name="amount"
                type="number" 
                placeholder="e.g. 15000" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                required 
                className="text-xs bg-white/5 border-white/15 text-white h-10 rounded-xl font-bold focus-visible:ring-accent"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pay-mode" className="text-xs font-bold text-slate-200 block uppercase">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger id="pay-mode" name="paymentMode" className="text-xs bg-white/5 border-white/15 text-white h-10 rounded-xl font-bold">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs">
                  <SelectItem value="UPI">⚡ UPI / GPay / PhonePe (0% MDR Fee)</SelectItem>
                  <SelectItem value="Net Banking">🏦 Net Banking / IMPS / NEFT</SelectItem>
                  <SelectItem value="Credit Card">💳 Credit Card (2.36% Fee)</SelectItem>
                  <SelectItem value="Debit Card">💳 Debit Card</SelectItem>
                  <SelectItem value="Cash">💵 Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pay-ref" className="text-xs font-bold text-slate-200 block uppercase">12-Digit UPI UTR / RRN / Transaction ID</Label>
              <Input 
                id="pay-ref" 
                name="reference"
                placeholder="e.g. 423891023847 or TXN9810247" 
                value={paymentRef} 
                onChange={(e) => setPaymentRef(e.target.value)} 
                className="text-xs bg-white/5 border-white/15 text-white h-10 rounded-xl font-mono focus-visible:ring-accent"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pay-rem" className="text-xs font-bold text-slate-200 block uppercase">Remarks / Note</Label>
              <Input 
                id="pay-rem" 
                name="remarks"
                placeholder="e.g. 30% Token Advance Booking Payment" 
                value={paymentRemarks} 
                onChange={(e) => setPaymentRemarks(e.target.value)} 
                className="text-xs bg-white/5 border-white/15 text-white h-10 rounded-xl font-semibold"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRecordPaymentDialogOpen(false)} className="text-xs font-bold bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 rounded-xl">Cancel</Button>
              <Button type="submit" size="sm" className="bg-gradient-warm text-[#0B1026] font-bold text-xs h-10 px-5 rounded-xl border-0 shadow-lg cursor-pointer">Save Payment Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRM;