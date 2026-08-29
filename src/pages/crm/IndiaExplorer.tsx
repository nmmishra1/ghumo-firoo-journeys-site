import React, { useState, useEffect } from 'react';
import { 
  Map, MapPin, Search, ArrowLeft, Loader2, Globe, Clock, IndianRupee, 
  Compass, Navigation, Eye, CheckCircle2, ChevronRight, Activity,
  LayoutGrid, List, Plane, Star, Camera, Landmark, Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IndiaExplorer() {
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  
  // Navigation & Filter states
  const [selectedState, setSelectedState] = useState<any | null>(null);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterStateId, setFilterStateId] = useState<string>('all');
  const [filterCityId, setFilterCityId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [cityDetails, setCityDetails] = useState<{
    city: any;
    sightseeing: any[];
    activities: any[];
    hotels?: any[];
  } | null>(null);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{
    sightseeing: any[];
    activities: any[];
  } | null>(null);

  // Load baseline states and cities
  useEffect(() => {
    setLoading(true);
    fetch('/php-backend/get_india_tourism.php?action=baseline')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStates(data.states || []);
          setCities(data.cities || []);
        }
      })
      .catch(err => console.error("Failed to load baseline tourism data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch city details when city is selected
  useEffect(() => {
    if (!selectedCity) {
      setCityDetails(null);
      return;
    }
    setLoading(true);
    fetch(`/php-backend/get_india_tourism.php?action=details&city_id=${selectedCity.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCityDetails({
            city: data.city,
            sightseeing: data.sightseeing || [],
            activities: data.activities || [],
            hotels: data.hotels || []
          });
        }
      })
      .catch(err => console.error("Failed to load city details:", err))
      .finally(() => setLoading(false));
  }, [selectedCity]);

  // Handle global search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!searchTerm.trim()) {
        setSearchResults(null);
        return;
      }
      setLoading(true);
      fetch(`/php-backend/get_india_tourism.php?action=search&search=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSearchResults({
              sightseeing: data.sightseeing || [],
              activities: data.activities || []
            });
          }
        })
        .catch(err => console.error("Failed to perform search:", err))
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const isCityInState = (city: any, state: any) => {
    if (!city || !state) return false;
    if (city.state_id !== undefined && state.id !== undefined && String(city.state_id) === String(state.id)) {
      return true;
    }
    const sName = String(state.name || state.state_name || '').toLowerCase().trim();
    const cStateName = String(city.state_name || city.state || '').toLowerCase().trim();
    return Boolean(sName && cStateName && (sName === cStateName || cStateName.includes(sName) || sName.includes(cStateName)));
  };

  const handleStateClick = (state: any) => {
    setSelectedState(state);
    setSelectedCity(null);
    setFilterStateId(String(state.id));
    setFilterCityId('all');
    if (state.region) {
      setFilterRegion(state.region.toLowerCase());
    }
    setSearchTerm('');
  };

  const handleCityClick = (city: any) => {
    setSelectedCity(city);
    const parentState = states.find(s => isCityInState(city, s));
    if (parentState) {
      setSelectedState(parentState);
      setFilterStateId(String(parentState.id));
    }
    setFilterCityId(String(city.id));
    setSearchTerm('');
  };

  const goBack = () => {
    if (selectedCity) {
      setSelectedCity(null);
      setFilterCityId('all');
    } else if (selectedState) {
      setSelectedState(null);
      setFilterStateId('all');
      setFilterRegion('all');
    }
  };

  // KPI Metrics Calculation
  const totalStates = states.length;
  const totalCities = cities.length;
  const totalSightseeingCount = states.reduce((sum, s) => sum + (s.sightseeing_count || 0), 0);
  const totalActivityCount = states.reduce((sum, s) => sum + (s.activity_count || 0), 0);

  // Cascading Location Filtering
  const filteredStates = states.filter(s => {
    if (filterRegion !== 'all' && (s.region || '').toLowerCase() !== filterRegion.toLowerCase()) return false;
    if (filterStateId !== 'all' && String(s.id) !== filterStateId) return false;
    return true;
  });

  const availableStatesForFilter = filterRegion === 'all'
    ? states
    : states.filter(s => (s.region || '').toLowerCase() === filterRegion.toLowerCase());

  const availableCitiesForFilter = filterStateId === 'all'
    ? (filterRegion === 'all' 
        ? cities 
        : cities.filter(c => {
            const parent = states.find(s => isCityInState(c, s));
            return parent && (parent.region || '').toLowerCase() === filterRegion.toLowerCase();
          }))
    : cities.filter(c => {
        const parentState = states.find(s => String(s.id) === String(filterStateId));
        return parentState ? isCityInState(c, parentState) : false;
      });

  const stateCities = selectedState 
    ? cities.filter(c => isCityInState(c, selectedState))
    : [];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 text-left">
      
      {/* KPI STATS CARDS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Indian States</p>
              <div className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{totalStates}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Regions & Union Territories</p>
            </div>
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30">
              <Globe className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tourism Cities</p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{totalCities}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Destinations mapped</p>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30">
              <MapPin className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Sightseeing Places</p>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{totalSightseeingCount}</div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mt-0.5">Monuments & attractions</p>
            </div>
            <div className="p-3 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/30">
              <Landmark className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Activities Catalog</p>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{totalActivityCount}</div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold mt-0.5">Adventure & experiences</p>
            </div>
            <div className="p-3 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/30">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HEADER & CASCADING LOCATION FILTERS TOOLBAR */}
      <Card className="border-border/60 shadow-md bg-card">
        <CardHeader className="p-4 border-b border-border/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" /> India Tourism Explorer Workspace
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Explore destinations, monuments, activities, and supplier pricing across Indian states.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-border/80 rounded-xl p-0.5 bg-background">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950' : ''}`}
                >
                  <LayoutGrid className="w-4 h-4 mr-1" /> Grid
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('table')}
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold ${viewMode === 'table' ? 'bg-amber-500 text-slate-950' : ''}`}
                >
                  <List className="w-4 h-4 mr-1" /> Table
                </Button>
              </div>
            </div>
          </div>

          {/* Cascading Location Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search sights, activities, cities, or states..."
                className="pl-9 h-9 text-xs rounded-xl bg-background text-slate-950 dark:text-white font-medium placeholder:text-slate-400 border-border/80"
              />
            </div>

            {/* Region Filter */}
            <Select 
              value={filterRegion} 
              onValueChange={v => {
                setFilterRegion(v);
                setFilterStateId('all');
                setFilterCityId('all');
              }}
            >
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="north">North India</SelectItem>
                <SelectItem value="south">South India</SelectItem>
                <SelectItem value="west">West India</SelectItem>
                <SelectItem value="east">East India</SelectItem>
                <SelectItem value="central">Central India</SelectItem>
              </SelectContent>
            </Select>

            {/* State Filter */}
            <Select 
              value={filterStateId} 
              onValueChange={v => {
                setFilterStateId(v);
                setFilterCityId('all');
                if (v !== 'all') {
                  const targetState = states.find(s => String(s.id) === v);
                  if (targetState) setSelectedState(targetState);
                } else {
                  setSelectedState(null);
                }
              }}
            >
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States ({availableStatesForFilter.length})</SelectItem>
                {availableStatesForFilter.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name || s.state_name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* City Filter (Cascaded by State) */}
            <Select value={filterCityId} onValueChange={v => {
              setFilterCityId(v);
              if (v !== 'all') {
                const targetCity = cities.find(c => String(c.id) === v);
                if (targetCity) handleCityClick(targetCity);
              }
            }}>
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities ({availableCitiesForFilter.length})</SelectItem>
                {availableCitiesForFilter.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name || c.city_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border/60">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-extrabold">Loading India tourism records...</span>
        </div>
      )}

      {!loading && (
        <>
          {searchResults ? (
            // GLOBAL SEARCH RESULTS VIEW
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-card p-3.5 rounded-xl border border-border/60">
                <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Search Results for "<span className="text-amber-600 dark:text-amber-400">{searchTerm}</span>"
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="text-xs text-amber-600 font-bold hover:bg-amber-500/10">
                  Clear Search
                </Button>
              </div>

              <Tabs defaultValue="sightseeing" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-900 border border-border/60 p-1 rounded-xl">
                  <TabsTrigger value="sightseeing" className="text-xs font-bold rounded-lg px-4 py-2">
                    Sightseeing Places ({searchResults.sightseeing.length})
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="text-xs font-bold rounded-lg px-4 py-2">
                    Activities ({searchResults.activities.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sightseeing" className="mt-4">
                  <Card className="border-border/60 shadow-md bg-card overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-100 dark:bg-slate-900/80">
                        <TableRow>
                          <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Monuments / Attraction</TableHead>
                          <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Location</TableHead>
                          <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Category</TableHead>
                          <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Details</TableHead>
                          <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-right">Est. Entry Fee</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.sightseeing.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-xs text-slate-600 dark:text-slate-400 font-medium">
                              No sightseeing spots found matching your search.
                            </TableCell>
                          </TableRow>
                        ) : (
                          searchResults.sightseeing.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-border/10">
                              <TableCell className="font-extrabold text-xs text-slate-950 dark:text-white uppercase">{item.name}</TableCell>
                              <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span className="font-extrabold text-slate-900 dark:text-slate-100">{item.city_name}</span>, {item.state_name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase">
                                  {item.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 dark:text-slate-400 max-w-sm truncate" title={item.description}>
                                {item.description}
                              </TableCell>
                              <TableCell className="text-right font-black text-xs text-slate-950 dark:text-white">
                                ₹{parseFloat(item.entry_fee_estimate).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </TabsContent>

                <TabsContent value="activities" className="mt-4">
                  <Card className="border-border/60 shadow-md bg-card overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-100 dark:bg-slate-900/80">
                        <TableRow>
                          <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Activity Name</TableHead>
                          <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Location</TableHead>
                          <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Type</TableHead>
                          <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Duration</TableHead>
                          <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-right">Avg. Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.activities.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-xs text-slate-600 dark:text-slate-400 font-medium">
                              No activities found matching your search.
                            </TableCell>
                          </TableRow>
                        ) : (
                          searchResults.activities.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-border/10">
                              <TableCell className="font-extrabold text-xs text-slate-950 dark:text-white uppercase">{item.name}</TableCell>
                              <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span className="font-extrabold text-slate-900 dark:text-slate-100">{item.city_name}</span>, {item.state_name}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 font-extrabold text-[10px] uppercase">
                                  {item.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {item.duration_hours} Hours
                              </TableCell>
                              <TableCell className="text-right font-black text-xs text-slate-950 dark:text-white">
                                ₹{parseFloat(item.average_cost).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : selectedCity && cityDetails ? (
            // CITY DETAILS VIEW (SIGHTSEEING, ACTIVITIES & HOTELS TABS)
            <div className="space-y-6">
              {/* Back navigation */}
              <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border/60 shadow-md">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={goBack}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wide">
                      {selectedState.name || selectedState.state_name} ➔ {selectedCity.name || selectedCity.city_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[10px]">
                        Best Season: {cityDetails.city.best_time_to_visit || 'Oct - Mar'}
                      </Badge>
                      {cityDetails.city.has_airport === 1 && (
                        <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-extrabold text-[10px]">
                          <Plane className="w-3 h-3 mr-1" /> Airport Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Card className="border-border/60 bg-card p-4 shadow-md text-left">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Destination Overview</h4>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">{cityDetails.city.description}</p>
              </Card>

              <Tabs defaultValue="sightseeing" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-900 border border-border/60 p-1 rounded-xl">
                  <TabsTrigger value="sightseeing" className="text-xs font-bold rounded-lg px-4 py-2">
                    Sightseeing Places ({cityDetails.sightseeing.length})
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="text-xs font-bold rounded-lg px-4 py-2">
                    Adventure & Experiences ({cityDetails.activities.length})
                  </TabsTrigger>
                  <TabsTrigger value="hotels" className="text-xs font-bold rounded-lg px-4 py-2">
                    Contracted Hotels ({cityDetails.hotels?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sightseeing" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cityDetails.sightseeing.map((item) => (
                      <Card key={item.id} className="border-border/60 bg-card shadow-md text-left hover:scale-[1.01] transition-transform">
                        <CardHeader className="bg-slate-100 dark:bg-slate-900/80 p-4 border-b border-border/40 flex flex-row justify-between items-center">
                          <div>
                            <CardTitle className="text-xs font-extrabold text-slate-950 dark:text-white uppercase">{item.name}</CardTitle>
                            <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] mt-1 uppercase">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase block font-extrabold">Est. Entry Fee</span>
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400">₹{parseFloat(item.entry_fee_estimate).toLocaleString()}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{item.description}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 border-t border-border/40 pt-2 font-bold">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span>Recommended duration: <strong>{item.recommended_duration_hours} hours</strong></span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="activities" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cityDetails.activities.map((item) => (
                      <Card key={item.id} className="border-border/60 bg-card shadow-md text-left hover:scale-[1.01] transition-transform">
                        <CardHeader className="bg-slate-100 dark:bg-slate-900/80 p-4 border-b border-border/40 flex flex-row justify-between items-center">
                          <div>
                            <CardTitle className="text-xs font-extrabold text-slate-950 dark:text-white uppercase">{item.name}</CardTitle>
                            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 font-extrabold text-[10px] mt-1 uppercase">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase block font-extrabold">Average Cost</span>
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400">₹{parseFloat(item.average_cost).toLocaleString()}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{item.description}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 border-t border-border/40 pt-2 font-bold">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span>Duration: <strong>{item.duration_hours} hours</strong></span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="hotels" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!cityDetails.hotels || cityDetails.hotels.length === 0 ? (
                      <div className="col-span-2 text-center py-10 text-xs text-slate-500 bg-card border border-dashed border-border/60 rounded-2xl font-semibold">
                        No contracted hotels mapped to this city yet.
                      </div>
                    ) : (
                      cityDetails.hotels.map((item, idx) => (
                        <Card key={idx} className="border-border/60 bg-card shadow-md text-left hover:scale-[1.01] transition-transform flex flex-col justify-between">
                          <CardHeader className="bg-slate-100 dark:bg-slate-900/80 p-4 border-b border-border/40 flex flex-row justify-between items-center">
                            <div>
                              <CardTitle className="text-xs font-extrabold text-slate-950 dark:text-white uppercase leading-snug">{item.name}</CardTitle>
                              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 font-extrabold text-[10px] mt-1.5 uppercase">
                                {item.star_category} Star Hotel
                              </Badge>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] text-slate-500 uppercase block font-extrabold">Room Rate</span>
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400">₹{parseFloat(item.contract_rate || 0).toLocaleString()}/n</span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 space-y-2 text-xs font-semibold">
                            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                              <span>Room Category:</span>
                              <strong className="text-slate-950 dark:text-white font-extrabold">{item.room_type || 'Standard Room'}</strong>
                            </div>
                            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                              <span>Meal Plan:</span>
                              <strong className="text-slate-950 dark:text-white font-extrabold">{item.meal_plan || 'EP (Room Only)'}</strong>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : selectedState ? (
            // STATE CITIES VIEW
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border/60 shadow-md">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={goBack}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wide">
                      India Tourism ➔ {selectedState.name || selectedState.state_name} State
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Explore cities, local sightseeing points, and adventure activities.</p>
                  </div>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {stateCities.map((city) => (
                    <Card key={city.id} className="border-border/60 bg-card hover:border-amber-500/40 transition-all duration-200 shadow-md flex flex-col text-left group">
                      <CardHeader className="bg-slate-100 dark:bg-slate-900/80 p-4 border-b border-border/40">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm font-extrabold text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {city.name}
                          </CardTitle>
                          {city.has_airport === 1 && (
                            <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-extrabold text-[9px] uppercase">
                              <Plane className="w-3 h-3 mr-0.5" /> Airport
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-[10px] text-slate-600 dark:text-slate-400 font-bold mt-1">
                          Best Season: {city.best_time_to_visit || 'Oct - Mar'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-semibold">
                          {city.description}
                        </p>
                        <div className="flex justify-between items-center pt-2 border-t border-border/40">
                          <div className="flex gap-3 text-[10px] text-slate-600 dark:text-slate-400 font-extrabold uppercase">
                            <span>Sights: <strong className="text-slate-950 dark:text-white">{city.sightseeing_count}</strong></span>
                            <span>Acts: <strong className="text-slate-950 dark:text-white">{city.activity_count}</strong></span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleCityClick(city)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-8 rounded-lg px-3 shadow-xs"
                          >
                            Explore <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border/60 shadow-md bg-card overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-900/80">
                      <TableRow>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">City Name</TableHead>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Best Season</TableHead>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-center">Airport</TableHead>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-center">Sightseeings</TableHead>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-center">Activities</TableHead>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stateCities.map(city => (
                        <TableRow key={city.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-border/10">
                          <TableCell className="font-extrabold text-xs text-slate-950 dark:text-white uppercase">{city.name}</TableCell>
                          <TableCell className="text-xs font-bold text-slate-700 dark:text-slate-300">{city.best_time_to_visit || 'Oct - Mar'}</TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${city.has_airport === 1 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                              {city.has_airport === 1 ? 'Yes' : 'No'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-black text-xs text-slate-950 dark:text-white">{city.sightseeing_count}</TableCell>
                          <TableCell className="text-center font-black text-xs text-slate-950 dark:text-white">{city.activity_count}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              onClick={() => handleCityClick(city)}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-7 px-2.5 rounded-lg shadow-xs"
                            >
                              Explore
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          ) : (
            // STATES GRID VIEW
            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-left">
                Browse Indian Destinations ({filteredStates.length} States)
              </h3>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredStates.map((state) => (
                    <Card 
                      key={state.id} 
                      onClick={() => handleStateClick(state)}
                      className="border-border/60 bg-card hover:border-amber-500/40 transition-all duration-200 shadow-md cursor-pointer hover:scale-[1.02] flex flex-col text-left group"
                    >
                      <CardHeader className="bg-slate-100 dark:bg-slate-900/80 p-4 border-b border-border/40 flex flex-row justify-between items-center">
                        <CardTitle className="text-xs font-extrabold text-slate-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors uppercase">
                          {state.name || state.state_name}
                        </CardTitle>
                        <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[9px] uppercase">
                          {state.region || 'North'}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-4 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-xs pt-1">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 uppercase block font-extrabold">Cities</span>
                            <span className="text-sm font-black text-slate-950 dark:text-white">{state.city_count}</span>
                          </div>
                          <div className="space-y-0.5 text-center">
                            <span className="text-[9px] text-slate-500 uppercase block font-extrabold">Sights</span>
                            <span className="text-sm font-black text-amber-600 dark:text-amber-400">{state.sightseeing_count}</span>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <span className="text-[9px] text-slate-500 uppercase block font-extrabold">Activities</span>
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{state.activity_count}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border/60 shadow-md bg-card overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-900/80">
                      <TableRow>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">State Name</TableHead>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">Region</TableHead>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-center">Cities Mapped</TableHead>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-center">Sightseeings</TableHead>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-center">Activities</TableHead>
                        <TableHead className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStates.map((state) => (
                        <TableRow key={state.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-border/10">
                          <TableCell className="font-extrabold text-xs text-slate-950 dark:text-white uppercase">{state.name || state.state_name}</TableCell>
                          <TableCell className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase">{state.region || 'North'}</TableCell>
                          <TableCell className="text-center font-black text-xs text-slate-950 dark:text-white">{state.city_count}</TableCell>
                          <TableCell className="text-center font-black text-xs text-amber-600 dark:text-amber-400">{state.sightseeing_count}</TableCell>
                          <TableCell className="text-center font-black text-xs text-indigo-600 dark:text-indigo-400">{state.activity_count}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              onClick={() => handleStateClick(state)}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-7 px-2.5 rounded-lg shadow-xs"
                            >
                              Browse Cities
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
