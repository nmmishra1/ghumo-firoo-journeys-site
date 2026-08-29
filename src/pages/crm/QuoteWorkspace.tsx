import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, GitCompare, Eye, RefreshCw, Copy, CheckCircle2, 
  ArrowLeft, ArrowRight, User, Calendar, IndianRupee, Settings, Filter, Search, Edit, Trash2, Save, X, Share2, MessageCircle, Loader2,
  TrendingUp, ShieldAlert, Star, Globe, MapPin, Compass, Sparkles, Camera, Landmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { quoteService, QuoteHeader, QuoteVersion, QuoteItem } from '@/services/quoteService';
import { itineraryService } from '@/services/itineraryService';

interface QuoteWorkspaceProps {
  quotes: QuoteHeader[];
  onCreateRevision: (quoteHeaderId: string, baseVersionId: string) => void;
  onAcceptVersion: (quoteHeaderId: string, versionId: string) => void;
  onUpdateVersion: (quoteHeaderId: string, versionId: string, updatedVersion: QuoteVersion) => void;
  onRefresh?: () => void;
}

export default function QuoteWorkspace({ quotes: propQuotes, onCreateRevision, onAcceptVersion, onUpdateVersion, onRefresh }: QuoteWorkspaceProps) {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<QuoteHeader[]>(propQuotes);
  const [selectedQuote, setSelectedQuote] = useState<QuoteHeader | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [versionA, setVersionA] = useState<string>('');
  const [versionB, setVersionB] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState<QuoteItem[]>([]);
  const [editMargin, setEditMargin] = useState<number>(10);
  const [savingQuote, setSavingQuote] = useState(false);

  // Sharing state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareVersion, setShareVersion] = useState<QuoteVersion | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMsg, setShareMsg] = useState('');
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');

  // New Quote Creation Modal State
  const [newQuoteModalOpen, setNewQuoteModalOpen] = useState(false);
  const [newQuoteData, setNewQuoteData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    destination: 'Kashmir',
    margin: 15
  });

  // Custom Multi-City Hotel Stay Modal state
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [hotelCityInput, setHotelCityInput] = useState('');
  const [hotelNameInput, setHotelNameInput] = useState('');
  const [hotelNightsInput, setHotelNightsInput] = useState(2);
  const [hotelRoomTypeInput, setHotelRoomTypeInput] = useState('Deluxe Room • CP Plan (Breakfast Included)');
  const [hotelRateInput, setHotelRateInput] = useState(4500);

  const handleAddCustomHotelStay = () => {
    if (!hotelNameInput.trim() || !vA) return;

    const cityPrefix = hotelCityInput.trim() ? `[${hotelCityInput.trim()}] ` : '';
    const fullHotelTitle = `${cityPrefix}${hotelNameInput.trim()}`;
    const nights = Number(hotelNightsInput) || 1;
    const rate = Number(hotelRateInput) || 0;
    const totalCost = nights * rate;

    const customHotel: QuoteItem = {
      type: 'hotel',
      name: fullHotelTitle,
      detail: `${hotelRoomTypeInput} • ${nights} ${nights === 1 ? 'Night' : 'Nights'} Stay`,
      qty: nights,
      rate: rate,
      total: totalCost
    };

    appendItemToActiveVersion(customHotel);
    setShowAddHotelModal(false);
    setHotelNameInput('');
    setHotelCityInput('');

    toast({
      title: "Hotel Stay Added",
      description: `Added ${fullHotelTitle} (${nights} Nights) to proposal.`,
      className: 'bg-slate-900 text-white border-emerald-500/40'
    });
  };

  const handleCreateNewQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteData.customerName.trim()) return;

    const newQuoteId = `q-${Date.now()}`;
    const newQuoteNum = `QT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const dest = newQuoteData.destination.trim().toLowerCase();

    // Check if real contracted hotels exist in database for this destination
    const matchedHotel = contracts.hotels.find((h: any) => 
      (h.city_name && h.city_name.toLowerCase().includes(dest)) ||
      (h.state_name && h.state_name.toLowerCase().includes(dest)) ||
      (h.hotel_name && h.hotel_name.toLowerCase().includes(dest))
    );

    const initialItems: QuoteItem[] = [];

    if (matchedHotel) {
      const rate = Number(matchedHotel.standard_rate || 3500);
      initialItems.push({
        type: 'hotel',
        name: `${matchedHotel.hotel_name} (${matchedHotel.star_rating || 4}★)`,
        detail: `City: ${matchedHotel.city_name || 'Standard'} • Deluxe Room CP Plan`,
        qty: 2,
        rate: rate,
        total: rate * 2
      });
    }

    const totalCost = initialItems.reduce((sum, item) => sum + item.total, 0);
    const sellingPrice = Math.round(totalCost * (1 + (newQuoteData.margin / 100)));

    const newVersion: QuoteVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: 1,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdBy: 'Sales Agent',
      status: 'Draft',
      items: initialItems,
      totalCost: totalCost,
      margin: newQuoteData.margin,
      sellingPrice: sellingPrice
    };

    const newQuoteObj: QuoteHeader = {
      id: newQuoteId,
      quoteNumber: newQuoteNum,
      customerName: newQuoteData.customerName.trim(),
      destination: newQuoteData.destination.trim(),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      currentVersion: 1,
      decisionStatus: 'Draft',
      versions: [newVersion]
    };

    setQuotes(prev => [newQuoteObj, ...prev]);
    setSelectedQuote(newQuoteObj);
    setVersionA(newVersion.id);
    setVersionB('');
    setEditItems(initialItems);
    setNewQuoteModalOpen(false);
    setNewQuoteData({ customerName: '', customerEmail: '', customerPhone: '', destination: 'Kashmir', margin: 15 });

    toast({
      title: "New Quote Created",
      description: `Created quote ${newQuoteNum} for ${newQuoteObj.customerName}.`,
      className: 'bg-slate-900 text-white border-emerald-500/40'
    });
  };
  // Destination Intelligence Slide-Over Drawer state
  const [showDestDrawer, setShowDestDrawer] = useState(false);
  const [destDrawerQuery, setDestDrawerQuery] = useState('');
  const [destDrawerLoading, setDestDrawerLoading] = useState(false);
  const [destData, setDestData] = useState<{
    destination: string;
    sightseeing_spots: any[];
    activities: any[];
    contracted_hotels: any[];
  } | null>(null);
  const [drawerTab, setDrawerTab] = useState<'sightseeing' | 'activities' | 'hotels' | 'ai_planner'>('sightseeing');

  const fetchDestData = async (query: string) => {
    if (!query.trim()) return;
    setDestDrawerLoading(true);
    try {
      const res = await fetch(`/php-backend/get_india_tourism.php?action=ai_context&destination=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setDestData({
          destination: data.destination || query,
          sightseeing_spots: data.sightseeing_spots || [],
          activities: data.activities || [],
          contracted_hotels: data.contracted_hotels || []
        });
      }
    } catch (e) {
      console.error("Failed to load destination context:", e);
    } finally {
      setDestDrawerLoading(false);
    }
  };

  // Import from Web URL state
  const [showImportUrlModal, setShowImportUrlModal] = useState(false);
  const [importUrlInput, setImportUrlInput] = useState('');
  const [importUrlLoading, setImportUrlLoading] = useState(false);
  const [scrapedItinerary, setScrapedItinerary] = useState<{
    title: string;
    destination: string;
    duration_days: number;
    day_by_day: any[];
  } | null>(null);

  const handleScrapeUrl = async () => {
    if (!importUrlInput.trim()) return;
    setImportUrlLoading(true);
    try {
      const res = await fetch(`/php-backend/import_itinerary_url.php?url=${encodeURIComponent(importUrlInput.trim())}`);
      const data = await res.json();
      if (data.success) {
        setScrapedItinerary(data);
        toast({
          title: "Itinerary Scraped Successfully",
          description: `Extracted ${data.duration_days} Days day-by-day plan from URL.`,
          className: 'bg-slate-900 text-white border-amber-500/40'
        });
      } else {
        toast({
          title: "Scrape Failed",
          description: data.error || "Could not extract itinerary from provided URL.",
          variant: "destructive"
        });
      }
    } catch (e: any) {
      toast({
        title: "Scrape Failed",
        description: e.message || "Failed to query URL scraper endpoint.",
        variant: "destructive"
      });
    } finally {
      setImportUrlLoading(false);
    }
  };

  const handleApplyScrapedItinerary = () => {
    if (!scrapedItinerary || !selectedQuote || !vA) return;

    const newItineraryDays = scrapedItinerary.day_by_day.map((d: any) => ({
      day: d.day,
      title: d.title,
      description: d.description
    }));

    const updatedVersions = selectedQuote.versions.map(ver => {
      if (ver.id === vA.id) {
        return {
          ...ver,
          itineraryDays: newItineraryDays
        };
      }
      return ver;
    });

    const updatedSelectedQuote = {
      ...selectedQuote,
      destination: scrapedItinerary.destination && scrapedItinerary.destination !== 'Custom Destination' ? scrapedItinerary.destination : selectedQuote.destination,
      versions: updatedVersions
    };

    setSelectedQuote(updatedSelectedQuote);
    setQuotes(prev => prev.map(q => q.id === selectedQuote.id ? updatedSelectedQuote : q));

    // Auto-save to Master Itineraries Catalog
    const packageSlug = (scrapedItinerary.destination || selectedQuote.destination || 'custom-destination').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    itineraryService.saveItinerary(packageSlug, newItineraryDays.map((d: any, idx: number) => ({
      day_number: idx + 1,
      title: d.title,
      description: d.description
    })));

    setShowImportUrlModal(false);

    toast({
      title: "Itinerary Schedule Imported & Saved to Catalog",
      description: `Imported ${newItineraryDays.length}-Day Schedule into ${selectedQuote.quoteNumber} and saved to Master Catalog.`,
      className: 'bg-slate-900 text-white border-emerald-500/40'
    });
  };

  const handleOpenDestinationDrawer = (destination?: string) => {
    const q = destination || selectedQuote?.destination || 'Kashmir';
    setDestDrawerQuery(q);
    setShowDestDrawer(true);
    fetchDestData(q);
  };

  const appendItemToActiveVersion = (newItem: QuoteItem) => {
    if (!selectedQuote || !vA) return;
    const updatedVAItems = [...vA.items, newItem];
    const newTotalCost = updatedVAItems.reduce((sum, item) => sum + item.total, 0);
    const newSellingPrice = Math.round(newTotalCost * (1 + (vA.margin / 100)));

    const updatedVersions = selectedQuote.versions.map(ver => {
      if (ver.id === vA.id) {
        return {
          ...ver,
          items: updatedVAItems,
          totalCost: newTotalCost,
          sellingPrice: newSellingPrice
        };
      }
      return ver;
    });

    const updatedSelectedQuote = {
      ...selectedQuote,
      versions: updatedVersions
    };

    setSelectedQuote(updatedSelectedQuote);
    setQuotes(prev => prev.map(q => q.id === selectedQuote.id ? updatedSelectedQuote : q));
    setEditItems(updatedVAItems);
  };

  const handleAddSightseeingToQuote = (spot: any) => {
    const cost = Number(spot.entry_fee_estimate || 0);
    const newItem: QuoteItem = {
      type: 'excursion',
      name: `${spot.name} (${spot.city})`,
      detail: spot.description ? spot.description.substring(0, 80) : `${spot.category || 'Sightseeing'} — ${spot.recommended_duration_hours || '2'} Hours`,
      qty: 1,
      rate: cost,
      total: cost
    };
    appendItemToActiveVersion(newItem);
    toast({
      title: "Added to Proposal",
      description: `Added "${spot.name}" to line items.`,
      className: 'bg-slate-900 text-white border-amber-500/40'
    });
  };

  const handleAddActivityToQuote = (act: any) => {
    const cost = Number(act.average_cost || 0);
    const newItem: QuoteItem = {
      type: 'excursion',
      name: `${act.name} (${act.city})`,
      detail: `${act.category || 'Activity'} — ${act.duration_hours || '1'} Hours`,
      qty: 1,
      rate: cost,
      total: cost
    };
    appendItemToActiveVersion(newItem);
    toast({
      title: "Added to Proposal",
      description: `Added "${act.name}" (₹${cost.toLocaleString('en-IN')}) to line items.`,
      className: 'bg-slate-900 text-white border-amber-500/40'
    });
  };

  const handleAddHotelToQuote = (hotel: any) => {
    const newItem: QuoteItem = {
      type: 'hotel',
      name: `${hotel.hotel_name} (${hotel.star_rating || 4}★)`,
      detail: `City: ${hotel.city || 'Standard'} — Standard Room CP Plan`,
      qty: 1,
      rate: 3500,
      total: 3500
    };
    appendItemToActiveVersion(newItem);
    toast({
      title: "Added to Proposal",
      description: `Added hotel "${hotel.hotel_name}" to line items.`,
      className: 'bg-slate-900 text-white border-amber-500/40'
    });
  };

  // Cascading Location selections by Row Index
  const [selectedStatesByRow, setSelectedStatesByRow] = useState<Record<number, string>>({});
  const [selectedCitiesByRow, setSelectedCitiesByRow] = useState<Record<number, string>>({});

  // Contract Lookups
  const [contracts, setContracts] = useState<{
    hotels: any[];
    excursions: any[];
    transfers: any[];
  }>({ hotels: [], excursions: [], transfers: [] });

  // Fetch contracts from database
  useEffect(() => {
    fetch('/php-backend/get_contracts.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setContracts({
            hotels: data.hotels || [],
            excursions: data.excursions || [],
            transfers: data.transfers || []
          });
        }
      })
      .catch(err => console.error("Failed to load database contracts:", err));
  }, []);

  // Update internal quotes list if prop changes
  useEffect(() => {
    setQuotes(propQuotes);
    if (selectedQuote) {
      const updatedSelected = propQuotes.find(q => q.id === selectedQuote.id);
      if (updatedSelected) {
        setSelectedQuote(updatedSelected);
      }
    }
  }, [propQuotes]);

  const filteredQuotes = quotes.filter(q => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = (
      q.customerName.toLowerCase().includes(term) ||
      q.quoteNumber.toLowerCase().includes(term) ||
      q.destination.toLowerCase().includes(term)
    );
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && q.decisionStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleSelectQuote = (quote: QuoteHeader) => {
    setSelectedQuote(quote);
    setCompareMode(false);
    setIsEditing(false);
    if (quote.versions.length >= 2) {
      setVersionA(quote.versions[0].id);
      setVersionB(quote.versions[1].id);
    } else if (quote.versions.length === 1) {
      setVersionA(quote.versions[0].id);
      setVersionB('');
    }
  };

  const getVersionById = (id: string) => {
    return selectedQuote?.versions.find(v => v.id === id);
  };

  const vA = getVersionById(versionA);
  const vB = getVersionById(versionB);

  const startEditing = (version: QuoteVersion) => {
    setEditItems(version.items.map(item => ({ ...item })));
    setEditMargin(version.margin);
    
    // Auto-populate State & City filter selectors based on existing hotel names
    const initialStates: Record<number, string> = {};
    const initialCities: Record<number, string> = {};
    version.items.forEach((item, idx) => {
      if (item.type === 'hotel') {
        const found = contracts.hotels.find(h => h.hotel_name === item.name);
        if (found) {
          initialStates[idx] = found.state_name;
          initialCities[idx] = found.city_name;
        }
      }
    });
    setSelectedStatesByRow(initialStates);
    setSelectedCitiesByRow(initialCities);

    setIsEditing(true);
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
    const updated = [...editItems];
    
    if (field === 'type' && value === 'hotel') {
      setSelectedStatesByRow(prev => ({ ...prev, [index]: '' }));
      setSelectedCitiesByRow(prev => ({ ...prev, [index]: '' }));
    }

    updated[index] = {
      ...updated[index],
      [field]: value
    };

    if (field === 'qty' || field === 'rate') {
      const q = field === 'qty' ? Number(value) : updated[index].qty;
      const r = field === 'rate' ? Number(value) : updated[index].rate;
      updated[index].total = q * r;
    }

    setEditItems(updated);
  };

  const handleAddItem = () => {
    setEditItems(prev => [...prev, { type: 'hotel', name: '', detail: '', qty: 1, rate: 0, total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(prev => prev.filter((_, idx) => idx !== index));
    setSelectedStatesByRow(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
    setSelectedCitiesByRow(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const saveEdits = async () => {
    if (!selectedQuote || !vA) return;

    setSavingQuote(true);
    try {
      const totalCost = editItems.reduce((sum, item) => sum + item.total, 0);
      const markup = totalCost * (editMargin / 100);
      const sellingPrice = totalCost + markup;

      const hotelsCost = editItems.filter(i => i.type === 'hotel').reduce((sum, i) => sum + i.total, 0);
      const transportCost = editItems.filter(i => i.type === 'transfer' || i.type === 'flight').reduce((sum, i) => sum + i.total, 0);
      const sightseeingCost = editItems.filter(i => i.type === 'excursion' || i.type === 'meal').reduce((sum, i) => sum + i.total, 0);

      const leadId = Number(selectedQuote.quoteNumber.split('-').pop()) || 1;

      const response = await quoteService.saveQuote({
        id: vA.id.includes('-') ? null : vA.id,
        lead_id: leadId,
        itinerary_id: null,
        package_name: selectedQuote.destination,
        total_amount: sellingPrice,
        cost_breakdown: {
          hotels: hotelsCost,
          transport: transportCost,
          sightseeing: sightseeingCost,
          // @ts-ignore
          items: editItems,
          itineraryDays: vA.itineraryDays || [],
          margin: editMargin
        },
        inclusions: [],
        exclusions: [],
        validity_days: 7
      });

      if (response.success) {
        toast({
          title: "Quote Saved",
          description: `Quote version details updated in MySQL database successfully.`,
          className: 'bg-slate-900 text-white border-amber-500/40'
        });

        if (onRefresh) onRefresh();
        setIsEditing(false);
      }
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message || "Could not write to MySQL database.",
        variant: "destructive"
      });
    } finally {
      setSavingQuote(false);
    }
  };

  const handleCreateRevisionClick = async (quoteHeaderId: string, baseVersionId: string) => {
    const quote = quotes.find(q => q.id === quoteHeaderId);
    const baseVer = quote?.versions.find((v: any) => v.id === baseVersionId);
    if (!quote || !baseVer) return;

    setSavingQuote(true);
    try {
      const leadId = Number(quote.quoteNumber.split('-').pop()) || 1;

      const response = await quoteService.saveQuote({
        id: baseVersionId,
        lead_id: leadId,
        itinerary_id: null,
        package_name: quote.destination,
        total_amount: baseVer.sellingPrice,
        cost_breakdown: {
          hotels: baseVer.totalCost,
          transport: 0,
          sightseeing: 0,
          // @ts-ignore
          items: baseVer.items,
          margin: baseVer.margin
        },
        inclusions: [],
        exclusions: [],
        validity_days: 7
      });

      if (response.success) {
        toast({
          title: "Revision Created",
          description: `Quote version V${response.version} created successfully in database.`,
          className: 'bg-slate-900 text-white border-amber-500/40'
        });
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      toast({
        title: "Revision Failed",
        description: err.message || "Failed to duplicate quote version.",
        variant: "destructive"
      });
    } finally {
      setSavingQuote(false);
    }
  };

  const handleShareQuoteClick = async (ver: QuoteVersion) => {
    setShareVersion(ver);
    setShareEmail(ver.shareToken ? ver.sharedAt || '' : '');
    setShareMsg(ver.shareMessage || '');

    const baseUrl = window.location.origin;

    if (ver.shareToken) {
      setGeneratedShareUrl(`${baseUrl}/quote/${ver.shareToken}`);
      setShowShareModal(true);
    } else {
      setSharingLoading(true);
      try {
        const response = await quoteService.shareQuote(ver.id, ver.shareMessage || '', '');
        if (response.success && response.share_token) {
          const finalUrl = `${baseUrl}/quote/${response.share_token}`;
          setGeneratedShareUrl(finalUrl);
          ver.shareToken = response.share_token;
        } else {
          setGeneratedShareUrl(`${baseUrl}/quote/${ver.id}`);
        }
      } catch (e) {
        setGeneratedShareUrl(`${baseUrl}/quote/${ver.id}`);
      } finally {
        setSharingLoading(false);
        setShowShareModal(true);
      }
    }
  };

  const executeShare = async () => {
    if (!shareVersion || !selectedQuote) return;

    setSharingLoading(true);
    try {
      const response = await quoteService.shareQuote(
        shareVersion.id,
        shareMsg,
        shareEmail
      );

      if (response.success) {
        setGeneratedShareUrl(response.share_url);
        toast({
          title: "Proposal Shared",
          description: "Secure share link created and status updated to Shared.",
          className: 'bg-slate-900 text-white border-amber-500/40'
        });
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      toast({
        title: "Share Failed",
        description: err.message || "Failed to generate proposal share link.",
        variant: "destructive"
      });
    } finally {
      setSharingLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedShareUrl);
    toast({
      title: "Link Copied",
      description: "Share URL copied to clipboard.",
      className: 'bg-slate-900 text-white border-amber-500/40'
    });
  };

  const handleAcceptVersionClick = async (quoteHeaderId: string, versionId: string) => {
    onAcceptVersion(quoteHeaderId, versionId);
  };

  // KPI Metrics Calculation
  const totalProposals = quotes.length;
  const pendingProposals = quotes.filter(q => q.decisionStatus === 'Sent' || q.decisionStatus === 'Draft').length;
  const confirmedDeals = quotes.filter(q => q.decisionStatus === 'Accepted' || q.decisionStatus === 'Confirmed').length;
  
  const allVersions = quotes.flatMap(q => q.versions);
  const avgMargin = allVersions.length > 0 
    ? (allVersions.reduce((sum, v) => sum + (v.margin || 10), 0) / allVersions.length).toFixed(1)
    : '10.0';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {savingQuote && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
          <p className="text-amber-400 font-extrabold text-lg animate-pulse">Syncing changes with MySQL Database...</p>
        </div>
      )}

      {!selectedQuote ? (
        // Global Quotes list workspace
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* KPI STATS CARDS STRIP */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card 
              onClick={() => setStatusFilter('all')}
              className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-amber-500/60 group ${statusFilter === 'all' ? 'ring-2 ring-amber-500 border-amber-500 shadow-md' : ''}`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-amber-500 transition-colors">Total Proposals</p>
                  <div className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{totalProposals}</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Issued quote headers</p>
                </div>
                <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  <FileText className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setStatusFilter('Sent')}
              className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-amber-500/60 group ${statusFilter === 'Sent' ? 'ring-2 ring-amber-500 border-amber-500 shadow-md' : ''}`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-amber-500 transition-colors">Pending Dispatched</p>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{pendingProposals}</div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-0.5">Awaiting customer decision</p>
                </div>
                <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  <RefreshCw className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setStatusFilter('Accepted')}
              className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-emerald-500/60 group ${statusFilter === 'Accepted' ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md' : ''}`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Confirmed Deals</p>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{confirmedDeals}</div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Accepted customer quotes</p>
                </div>
                <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card 
              onClick={() => setStatusFilter('Draft')}
              className={`border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-indigo-500/60 group ${statusFilter === 'Draft' ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-md' : ''}`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Avg Profit Margin</p>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{avgMargin}%</div>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold mt-0.5">Average markup rate</p>
                </div>
                <div className="p-3 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MAIN QUOTES DIRECTORY CARD */}
          <Card className="border-border/60 shadow-md bg-card">
            <CardHeader className="p-4 border-b border-border/40 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-extrabold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" /> Quote Proposals Workspace
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                    View, revise, compare, and dispatch multi-version price quotes to clients.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => setNewQuoteModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl h-9 px-4 shadow-md flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Create New Quote
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    { id: 'all', label: 'All Quotes' },
                    { id: 'Sent', label: 'Dispatched' },
                    { id: 'Accepted', label: 'Accepted' },
                    { id: 'Draft', label: 'Drafts' }
                  ].map(st => (
                    <Button
                      key={st.id}
                      variant={statusFilter === st.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(st.id)}
                      className={`h-7.5 text-xs px-3 rounded-lg font-bold ${
                        statusFilter === st.id ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-xs' : 'text-slate-300 border-slate-700'
                      }`}
                    >
                      {st.label}
                    </Button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search by quote number, customer name, or destination..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl bg-slate-950 text-slate-100 font-bold placeholder:text-slate-500 border-slate-800 focus:border-amber-500"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-100 dark:bg-[#0f1420] border-b border-border/40">
                    <TableRow>
                      <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Quote ID</TableHead>
                      <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Client Name</TableHead>
                      <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Destination</TableHead>
                      <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Latest Version</TableHead>
                      <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Latest Selling Value</TableHead>
                      <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Decision Status</TableHead>
                      <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-xs text-slate-600 dark:text-slate-400 font-bold">
                          No quotes found matching your search or filter criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQuotes.map((quote) => {
                        const latestVer = quote.versions.find(v => v.versionNumber === quote.currentVersion);
                        const clientName = quote.customerName || (quote as any).clientName || 'Raj Sharma';
                        return (
                          <TableRow key={quote.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-border/20">
                            <TableCell className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs">
                              {quote.quoteNumber}
                            </TableCell>
                            <TableCell className="font-black text-xs text-slate-950 dark:text-white uppercase tracking-wide">
                              {clientName}
                            </TableCell>
                            <TableCell className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase">
                              {quote.destination}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 font-black text-[10px] px-2 py-0.5 bg-amber-500/10">
                                V{quote.currentVersion} ({quote.versions.length} versions)
                              </Badge>
                            </TableCell>
                            <TableCell className="font-black text-sm text-slate-950 dark:text-white">
                              ₹{latestVer ? latestVer.sellingPrice.toLocaleString('en-IN') : '0'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                                  quote.decisionStatus === 'Accepted' || quote.decisionStatus === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                                  quote.decisionStatus === 'Sent' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                                  'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                                variant="outline"
                              >
                                {quote.decisionStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                {latestVer && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleShareQuoteClick(latestVer)}
                                    className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-bold rounded-xl h-8 px-2.5"
                                    title="Share Customer Link"
                                  >
                                    <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl h-8 px-3 shadow-xs"
                                  onClick={() => handleSelectQuote(quote)}
                                >
                                  Manage Versions
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Detailed Quote View & GitCompare Workspace
        <div className="space-y-6 animate-in fade-in duration-200 text-slate-100">
          {/* Back button header */}
          <div className="flex justify-between items-center bg-[#161d2f] p-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setSelectedQuote(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl h-9 px-3.5 border border-slate-700 shadow-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Back to All Quotes
              </Button>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Quote Workspace: {selectedQuote.quoteNumber} — {selectedQuote.customerName}
                </h3>
                <p className="text-xs text-slate-300 font-bold mt-0.5">
                  Destination: <span className="font-black text-amber-400">{selectedQuote.destination}</span> | Current Version: <span className="font-black text-white">V{selectedQuote.currentVersion}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowImportUrlModal(true)}
                className="text-xs font-black rounded-xl h-9 px-3 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 shadow-sm"
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-emerald-400" />
                Import Web Itinerary
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleOpenDestinationDrawer(selectedQuote.destination)}
                className="text-xs font-black rounded-xl h-9 px-3 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 shadow-sm"
              >
                <Globe className="w-4 h-4 mr-1.5 text-amber-400" />
                Explore Destination
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setCompareMode(!compareMode)}
                className={`text-xs font-black rounded-xl h-9 px-3 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 ${compareMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : ''}`}
              >
                <GitCompare className="w-4 h-4 mr-1.5 text-amber-400" />
                {compareMode ? 'Close Side-by-Side View' : 'Compare Versions'}
              </Button>
            </div>
          </div>

          {!compareMode ? (
            // Single Version View & Editor
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Version History Selector Sidebar */}
              <Card className="border border-slate-800 shadow-xl bg-[#161d2f] text-slate-100 rounded-2xl">
                <CardHeader className="p-4 border-b border-slate-800">
                  <CardTitle className="text-xs font-black uppercase text-amber-400 tracking-wider">Version History ({selectedQuote.versions.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {selectedQuote.versions.map(ver => (
                    <div 
                      key={ver.id}
                      onClick={() => setVersionA(ver.id)}
                      className={`p-3 rounded-xl cursor-pointer border transition-all ${
                        versionA === ver.id ? 'bg-[#0f1420] border-amber-500/50 shadow-md ring-1 ring-amber-500/30' : 'bg-[#0f1420]/50 border-slate-800 hover:bg-[#0f1420]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-xs text-amber-400">Version V{ver.versionNumber}</span>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold border-slate-700 text-slate-300">{ver.status}</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-slate-300 font-bold">
                        <span>Net: ₹{ver.totalCost.toLocaleString()}</span>
                        <span className="font-black text-white">Price: ₹{ver.sellingPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Version Active Details & Actions */}
              <div className="lg:col-span-2 space-y-6">
                {vA && (
                  <Card className="border border-slate-800 shadow-xl bg-[#161d2f] text-slate-100 rounded-2xl">
                    <CardHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-black text-white uppercase tracking-wider">
                          Viewing Version V{vA.versionNumber}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-300 font-medium mt-0.5">
                          Created by <span className="font-bold text-white">{vA.createdBy}</span> on {vA.createdAt}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            handleOpenDestinationDrawer(selectedQuote.destination);
                            setDrawerTab('hotels');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl h-9 px-3.5 shadow-md flex items-center gap-1"
                        >
                          <Landmark className="w-3.5 h-3.5 mr-1" /> + Add Hotel
                        </Button>
                        <Button size="sm" onClick={() => handleShareQuoteClick(vA)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl h-9 px-3.5 shadow-md">
                          <Share2 className="w-3.5 h-3.5 mr-1" /> Share Link
                        </Button>
                        <Button size="sm" onClick={() => handleCreateRevisionClick(selectedQuote.id, vA.id)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl h-9 px-3.5 shadow-md">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Edit / Revision
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* DAY-BY-DAY ITINERARY TIMELINE CARD */}
                      {vA.itineraryDays && vA.itineraryDays.length > 0 && (
                        <div className="space-y-3 bg-[#0f1420] p-4 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-amber-400" /> Day-by-Day Itinerary Schedule ({vA.itineraryDays.length} Days)
                            </h4>
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-extrabold uppercase">
                              Saved Schedule
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {vA.itineraryDays.map((d) => (
                              <div key={d.day} className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                                <span className="text-xs font-extrabold text-white block">{d.title}</span>
                                <p className="text-[11px] text-slate-300 font-normal mt-1 leading-relaxed">{d.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Financial Pricing Components Table */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <IndianRupee className="w-3.5 h-3.5 text-amber-400" /> Package Line Items & Cost Breakdown
                        </h4>
                        <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0f1420]">
                          <Table>
                          <TableHeader className="bg-[#0f1420] border-b border-slate-800">
                            <TableRow>
                              <TableHead className="text-xs font-black text-slate-300 uppercase tracking-wider">Category & Item Name</TableHead>
                              <TableHead className="text-xs font-black text-slate-300 uppercase tracking-wider text-center">Qty</TableHead>
                              <TableHead className="text-xs font-black text-slate-300 uppercase tracking-wider text-right">Unit Rate</TableHead>
                              <TableHead className="text-xs font-black text-slate-300 uppercase tracking-wider text-right">Total Net</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {vA.items.map((item, idx) => (
                              <TableRow key={idx} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                                <TableCell className="text-xs max-w-lg py-3">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase shrink-0">
                                      {item.type}
                                    </Badge>
                                    <span className="font-bold text-white text-xs">{item.name}</span>
                                  </div>
                                  {item.detail && (
                                    <p className="text-[11px] text-slate-400 font-normal leading-relaxed mt-1 line-clamp-2">
                                      {item.detail}
                                    </p>
                                  )}
                                </TableCell>
                                <TableCell className="text-center font-extrabold text-xs text-white">{item.qty}</TableCell>
                                <TableCell className="text-right text-xs font-bold text-slate-200">
                                  {item.rate > 0 ? `₹${item.rate.toLocaleString('en-IN')}` : <span className="text-emerald-400 font-extrabold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Included</span>}
                                </TableCell>
                                <TableCell className="text-right font-black text-xs text-amber-400">
                                  {item.total > 0 ? `₹${item.total.toLocaleString('en-IN')}` : <span className="text-emerald-400 font-extrabold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Included</span>}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {/* Quick Item Add Action Bar */}
                        <div className="p-3 bg-[#0f1420] border-t border-slate-800 flex flex-wrap justify-between items-center gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => {
                                handleOpenDestinationDrawer(selectedQuote.destination);
                                setDrawerTab('hotels');
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl h-8 px-3 shadow-sm flex items-center gap-1.5"
                            >
                              <Landmark className="w-3.5 h-3.5" /> Pick Hotel from DB Catalog
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setShowAddHotelModal(true)}
                              className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold rounded-xl h-8 px-3 flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" /> + Custom Hotel Row
                            </Button>
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            Add hotel component & rate to quote
                          </span>
                        </div>
                      </div>
                    </div>

                      {/* Pricing Summary Breakdown */}
                      <div className="bg-[#0f1420] p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-0.5 text-xs text-slate-300 font-bold">
                          <p>Net Supplier Cost: <span className="font-black text-white">₹{vA.totalCost.toLocaleString('en-IN')}</span></p>
                          <p>Profit Margin: <span className="font-black text-amber-400">{vA.margin}%</span></p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button 
                            onClick={saveEdits}
                            disabled={savingQuote}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl h-10 px-5 shadow-lg flex items-center gap-2 shrink-0"
                          >
                            {savingQuote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 stroke-[3]" />}
                            Save Proposal
                          </Button>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Final Selling Quote Price</p>
                            <p className="text-2xl font-black text-white">₹{vA.sellingPrice.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            // Side by Side Comparison View
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[vA, vB].map((ver, idx) => (
                ver && (
                  <Card key={ver.id} className="border-border/60 shadow-md bg-card">
                    <CardHeader className="p-4 border-b border-border/40 bg-slate-100 dark:bg-slate-900/80">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Version V{ver.versionNumber}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase">{ver.status}</Badge>
                      </div>
                      <CardDescription className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Total selling price: <strong className="text-slate-950 dark:text-white">₹{ver.sellingPrice.toLocaleString()}</strong>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200">Item</TableHead>
                            <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ver.items.map((item, id) => (
                            <TableRow key={id}>
                              <TableCell className="text-xs py-2">
                                <span className="font-bold text-slate-950 dark:text-white block">{item.name}</span>
                                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{item.type} (x{item.qty})</span>
                              </TableCell>
                              <TableCell className="text-right font-black text-xs text-slate-950 dark:text-white">₹{item.total.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="border-t border-border/40 pt-3 flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">Net Cost: ₹{ver.totalCost.toLocaleString()}</span>
                        <span className="font-black text-amber-600 dark:text-amber-400">Selling Price: ₹{ver.sellingPrice.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          )}
        </div>
      )}

      {/* SHARE MODAL */}
      {showShareModal && shareVersion && selectedQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-card border border-border/80 text-slate-900 dark:text-slate-100 shadow-2xl rounded-2xl text-left">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-extrabold text-slate-950 dark:text-white">
                Share Quote Proposal: Version V{shareVersion.versionNumber}
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Generate a secure customer link to share with {selectedQuote.customerName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              
              {generatedShareUrl ? (
                <div className="space-y-4">
                  <div className="bg-slate-100 dark:bg-slate-900 border border-amber-500/30 rounded-xl p-3">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider block mb-1">Generated Proposal Share Link</span>
                    <p className="text-xs font-mono text-slate-950 dark:text-white select-all break-all font-semibold">{generatedShareUrl}</p>
                  </div>
                  
                  {/* Formatted WhatsApp Message Preview */}
                  <div className="bg-[#0f1420] border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
                    <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">WhatsApp Proposal Preview</div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 whitespace-pre-line select-all">
                      {`✈️ *GHUMO FIROO TRAVELS PROPOSAL*\nHello ${selectedQuote.customerName}!\n\nYour customized tour proposal for *${selectedQuote.destination}* is ready!\n\n💰 *Quote Selling Price:* ₹${shareVersion?.sellingPrice?.toLocaleString('en-IN') || 0}\n\n🔗 *View Interactive Proposal & Confirm:* \n${generatedShareUrl}\n\nClick the link above to view day-by-day stay plans and confirm your booking in 1 click!`}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleCopyLink} className="flex-1 bg-amber-500 text-slate-950 hover:bg-amber-600 font-extrabold rounded-xl h-10 shadow-xs">
                      <Copy className="w-4 h-4 mr-2" /> Copy Proposal Link
                    </Button>
                    <button 
                      type="button"
                      onClick={() => {
                        const msg = `✈️ *GHUMO FIROO TRAVELS PROPOSAL*\nHello ${selectedQuote.customerName}!\n\nYour customized tour proposal for *${selectedQuote.destination}* is ready!\n\n💰 *Quote Selling Price:* ₹${shareVersion?.sellingPrice?.toLocaleString('en-IN') || 0}\n\n🔗 *View Interactive Proposal & Confirm:* \n${generatedShareUrl}`;
                        navigator.clipboard.writeText(msg);
                        toast({ title: "WhatsApp Message Copied!", description: "Message formatted for WhatsApp chat." });
                      }}
                      className="flex-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-extrabold rounded-xl h-10 flex items-center justify-center hover:bg-emerald-500/20 cursor-pointer text-xs"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" /> Copy WhatsApp Message
                    </button>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(`✈️ *GHUMO FIROO TRAVELS PROPOSAL*\nHello ${selectedQuote.customerName}!\n\nYour customized tour proposal for *${selectedQuote.destination}* is ready!\n\n💰 *Quote Selling Price:* ₹${shareVersion?.sellingPrice?.toLocaleString('en-IN') || 0}\n\n🔗 *View Interactive Proposal & Confirm:* \n${generatedShareUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-extrabold rounded-xl h-10 flex items-center justify-center">
                        <Share2 className="w-4 h-4 mr-2" /> Open WhatsApp
                      </Button>
                    </a>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button variant="ghost" onClick={() => { setShowShareModal(false); setGeneratedShareUrl(''); }} className="text-xs text-slate-400 font-bold">
                      Close Window
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300">Recipient Email (Optional)</label>
                    <Input 
                      type="email"
                      value={shareEmail} 
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="client@email.com"
                      className="bg-background border-border/80 text-xs text-slate-950 dark:text-white h-9 mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300">Custom Note / Message (Optional)</label>
                    <textarea
                      value={shareMsg}
                      onChange={(e) => setShareMsg(e.target.value)}
                      placeholder="Hi Raj, please review this updated quote proposal..."
                      rows={4}
                      className="w-full bg-background border border-border/80 rounded-xl p-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 mt-1 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={() => setShowShareModal(false)} className="text-xs text-slate-500 font-bold">
                      Cancel
                    </Button>
                    <Button 
                      onClick={executeShare}
                      disabled={sharingLoading}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl h-10 px-5 flex items-center shadow-xs"
                    >
                      {sharingLoading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                      Generate Link & Share
                    </Button>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}

      {/* DESTINATION INTELLIGENCE SLIDE-OVER DRAWER */}
      {showDestDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full bg-[#111827] border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#161d2f]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                    Explore Destination: <span className="text-amber-400">{destDrawerQuery}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">1-Click Add Sightseeing, Activities, and Hotels directly to quote</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowDestDrawer(false)} className="text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-800 bg-[#0f1420] flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  value={destDrawerQuery}
                  onChange={(e) => setDestDrawerQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchDestData(destDrawerQuery)}
                  placeholder="Search city, state, or destination (e.g. Goa, Kashmir, Manali)..."
                  className="pl-9 h-10 text-xs bg-slate-950 border-slate-800 font-bold text-white placeholder-slate-500 rounded-xl"
                />
              </div>
              <Button 
                onClick={() => fetchDestData(destDrawerQuery)} 
                disabled={destDrawerLoading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold h-10 text-xs rounded-xl px-4"
              >
                {destDrawerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-800 bg-[#161d2f] px-4 pt-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setDrawerTab('sightseeing')}
                className={`py-2 px-3 border-b-2 transition-all ${drawerTab === 'sightseeing' ? 'border-amber-400 text-amber-400 font-black' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                📸 Sightseeing ({destData?.sightseeing_spots?.length || 0})
              </button>
              <button
                onClick={() => setDrawerTab('activities')}
                className={`py-2 px-3 border-b-2 transition-all ${drawerTab === 'activities' ? 'border-amber-400 text-amber-400 font-black' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                🪂 Activities ({destData?.activities?.length || 0})
              </button>
              <button
                onClick={() => setDrawerTab('hotels')}
                className={`py-2 px-3 border-b-2 transition-all ${drawerTab === 'hotels' ? 'border-amber-400 text-amber-400 font-black' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                🏨 Hotels ({destData?.contracted_hotels?.length || 0})
              </button>
              <button
                onClick={() => setDrawerTab('ai_planner')}
                className={`py-2 px-3 border-b-2 transition-all ${drawerTab === 'ai_planner' ? 'border-amber-400 text-amber-400 font-black' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                🤖 AI Planner
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {destDrawerLoading ? (
                <div className="py-20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">Querying Destination Intelligence Database...</p>
                </div>
              ) : (
                <>
                  {drawerTab === 'sightseeing' && (
                    <div className="space-y-3">
                      {(!destData?.sightseeing_spots || destData.sightseeing_spots.length === 0) ? (
                        <div className="text-center py-12 text-slate-400 text-xs font-bold">No sightseeing spots found for "{destDrawerQuery}".</div>
                      ) : (
                        destData.sightseeing_spots.map((spot, i) => (
                          <div key={i} className="p-3 bg-[#161d2f] border border-slate-800 rounded-xl flex justify-between items-start hover:border-slate-700 transition-all">
                            <div className="space-y-1 max-w-[360px]">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-white">{spot.name}</span>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-700 text-amber-400 bg-amber-400/10 font-bold">{spot.city}</Badge>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-2">{spot.description || 'Famous landmark & attraction.'}</p>
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold pt-1">
                                <span>⏱️ Duration: {spot.recommended_duration_hours || 2} hrs</span>
                                <span>🎟️ Fee: {spot.entry_fee_estimate && spot.entry_fee_estimate > 0 ? `₹${Number(spot.entry_fee_estimate).toLocaleString('en-IN')}` : 'Free'}</span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleAddSightseeingToQuote(spot)}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] h-7 px-2.5 rounded-lg shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {drawerTab === 'activities' && (
                    <div className="space-y-3">
                      {(!destData?.activities || destData.activities.length === 0) ? (
                        <div className="text-center py-12 text-slate-400 text-xs font-bold">No activities found for "{destDrawerQuery}".</div>
                      ) : (
                        destData.activities.map((act, i) => (
                          <div key={i} className="p-3 bg-[#161d2f] border border-slate-800 rounded-xl flex justify-between items-start hover:border-slate-700 transition-all">
                            <div className="space-y-1 max-w-[360px]">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-white">{act.name}</span>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-700 text-indigo-400 bg-indigo-400/10 font-bold">{act.city}</Badge>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-2">{act.description || 'Adventure activity & experience.'}</p>
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold pt-1">
                                <span>⏱️ Duration: {act.duration_hours || 1} hrs</span>
                                <span className="text-amber-300 font-bold">💰 Avg Rate: ₹{Number(act.average_cost || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleAddActivityToQuote(act)}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] h-7 px-2.5 rounded-lg shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {drawerTab === 'hotels' && (
                    <div className="space-y-3">
                      {(!destData?.contracted_hotels || destData.contracted_hotels.length === 0) ? (
                        <div className="text-center py-12 text-slate-400 text-xs font-bold">No contracted hotels found for "{destDrawerQuery}".</div>
                      ) : (
                        destData.contracted_hotels.map((hotel, i) => (
                          <div key={i} className="p-3 bg-[#161d2f] border border-slate-800 rounded-xl flex justify-between items-center hover:border-slate-700 transition-all">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-white">{hotel.hotel_name}</span>
                                <span className="text-amber-400 text-[11px] font-black">{hotel.star_rating || 4}★</span>
                              </div>
                              <p className="text-[11px] text-slate-400">{hotel.city || destDrawerQuery} | Contracted Partner</p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleAddHotelToQuote(hotel)}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] h-7 px-2.5 rounded-lg shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add Hotel
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {drawerTab === 'ai_planner' && (
                    <div className="p-4 bg-[#161d2f] border border-amber-500/30 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" /> AI Itinerary Assistant ({destData?.destination})
                      </div>
                      <p className="text-xs text-slate-300">
                        Here is an AI-suggested day-by-day itinerary draft using verified sightseeing spots and activities for <strong className="text-white">{destData?.destination}</strong>:
                      </p>

                      <div className="space-y-3 pt-2 text-xs">
                        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                          <span className="text-amber-400 font-black">Day 1: Arrival & Local Exploration</span>
                          <p className="text-slate-300 mt-1">Arrival at {destData?.destination}. Check-in at hotel and visit local landmarks ({destData?.sightseeing_spots?.[0]?.name || 'City Center'}).</p>
                        </div>
                        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                          <span className="text-amber-400 font-black">Day 2: Full Day Excursion & Sightseeing</span>
                          <p className="text-slate-300 mt-1">Explore top attractions: {destData?.sightseeing_spots?.slice(0, 3).map((s: any) => s.name).join(', ') || 'Major Sightseeing'}.</p>
                        </div>
                        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                          <span className="text-amber-400 font-black">Day 3: Adventure Activities & Shopping</span>
                          <p className="text-slate-300 mt-1">Enjoy adventure experiences: {destData?.activities?.slice(0, 2).map((a: any) => a.name).join(', ') || 'Local Experiences'}.</p>
                        </div>
                      </div>

                      <Button 
                        onClick={() => {
                          if (destData?.activities?.[0]) handleAddActivityToQuote(destData.activities[0]);
                          if (destData?.sightseeing_spots?.[0]) handleAddSightseeingToQuote(destData.sightseeing_spots[0]);
                        }}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs h-9 rounded-xl shadow-md"
                      >
                        <Plus className="w-4 h-4 mr-1.5" /> Import AI Items into Quote
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IMPORT ITINERARY FROM WEB URL MODAL DIALOG */}
      {showImportUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-2xl text-slate-100 p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wide">Import Itinerary from Web URL</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Paste any tour package web link (Thrillophilia, MakeMyTrip, Yatra, etc.)</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowImportUrlModal(false)} className="text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={importUrlInput}
                  onChange={(e) => setImportUrlInput(e.target.value)}
                  placeholder="https://www.thrillophilia.com/tours/kashmir-5-days..."
                  className="h-10 text-xs bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl"
                  autoFocus
                />
                <Button 
                  onClick={handleScrapeUrl}
                  disabled={importUrlLoading || !importUrlInput.trim()}
                  className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shrink-0"
                >
                  {importUrlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Plan'}
                </Button>
              </div>

              {scrapedItinerary && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-emerald-300 uppercase">{scrapedItinerary.title}</h4>
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5">Destination: {scrapedItinerary.destination} | {scrapedItinerary.duration_days} Days Detected</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-extrabold text-[10px]">
                      {scrapedItinerary.duration_days} Days
                    </Badge>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {scrapedItinerary.day_by_day.map((d: any) => (
                      <div key={d.day} className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-left">
                        <span className="text-xs font-black text-amber-400 block">{d.title}</span>
                        <p className="text-[11px] text-slate-300 font-semibold mt-1 leading-relaxed">{d.description}</p>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={handleApplyScrapedItinerary}
                    className="w-full h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Import {scrapedItinerary.duration_days} Days into Quote Proposal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW QUOTE PROPOSAL MODAL DIALOG */}
      {newQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl text-slate-100 p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wide">Create New Quote Proposal</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Generate a multi-version pricing quote for client</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setNewQuoteModalOpen(false)} className="text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleCreateNewQuote} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase text-slate-300">Customer / Client Name *</label>
                <Input
                  required
                  value={newQuoteData.customerName}
                  onChange={(e) => setNewQuoteData({ ...newQuoteData, customerName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="h-9 text-xs bg-slate-900 border-slate-700 text-white rounded-xl"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase text-slate-300">Destination *</label>
                  <Input
                    required
                    value={newQuoteData.destination}
                    onChange={(e) => setNewQuoteData({ ...newQuoteData, destination: e.target.value })}
                    placeholder="e.g. Kashmir"
                    className="h-9 text-xs bg-slate-900 border-slate-700 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase text-slate-300">Margin %</label>
                  <Input
                    type="number"
                    value={newQuoteData.margin}
                    onChange={(e) => setNewQuoteData({ ...newQuoteData, margin: Number(e.target.value) })}
                    className="h-9 text-xs bg-slate-900 border-slate-700 text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setNewQuoteModalOpen(false)} className="text-xs text-slate-400 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl h-9 px-4">
                  Create Quote & Open
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MULTI-CITY HOTEL STAY MODAL */}
      {showAddHotelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#141b2d] border border-slate-700/80 rounded-2xl p-5 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Add Multi-City Hotel Stay</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Configure hotel stay details for multi-destination packages</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowAddHotelModal(false)} className="text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase text-slate-300">City / Location</label>
                  <Input
                    value={hotelCityInput}
                    onChange={(e) => setHotelCityInput(e.target.value)}
                    placeholder="e.g. Munnar / Manali"
                    className="h-9 text-xs bg-slate-900 border-slate-700 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase text-slate-300">Hotel / Resort Name *</label>
                  <Input
                    required
                    value={hotelNameInput}
                    onChange={(e) => setHotelNameInput(e.target.value)}
                    placeholder="e.g. Tea County Resort"
                    className="h-9 text-xs bg-slate-900 border-slate-700 text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase text-slate-300">Nights Stay (Qty)</label>
                  <Input
                    type="number"
                    min={1}
                    value={hotelNightsInput}
                    onChange={(e) => setHotelNightsInput(Number(e.target.value))}
                    className="h-9 text-xs bg-slate-900 border-slate-700 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-extrabold uppercase text-slate-300">Rate per Night (₹)</label>
                  <Input
                    type="number"
                    min={0}
                    value={hotelRateInput}
                    onChange={(e) => setHotelRateInput(Number(e.target.value))}
                    className="h-9 text-xs bg-slate-900 border-slate-700 text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase text-slate-300">Room Category & Meal Plan</label>
                <Input
                  value={hotelRoomTypeInput}
                  onChange={(e) => setHotelRoomTypeInput(e.target.value)}
                  placeholder="e.g. Deluxe AC Room • CP Plan (Breakfast Included)"
                  className="h-9 text-xs bg-slate-900 border-slate-700 text-white rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">Total Hotel Stay Net Cost:</span>
                <span className="text-sm font-black text-amber-400">₹{(Number(hotelNightsInput) * Number(hotelRateInput)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddHotelModal(false)} className="text-xs text-slate-400 rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleAddCustomHotelStay} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl h-9 px-4">
                Add Hotel Stay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
