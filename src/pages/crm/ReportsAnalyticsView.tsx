import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Calendar, 
  Share2, 
  Users, 
  CheckCircle2, 
  IndianRupee, 
  Landmark, 
  MapPin, 
  Search 
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, 
  PieChart, Pie, Cell 
} from 'recharts';

interface ReportsAnalyticsViewProps {
  leads: any[];
  allPayments: any[];
  ratesData: { hotels: any[]; cabs: any[]; activities: any[] };
  ratesLoading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  leads,
  allPayments,
  ratesData,
  ratesLoading,
}) => {
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

  // Filter leads by date range safely
  const filteredLeads = React.useMemo(() => {
    return leads.filter(l => {
      const dateStr = l.created_at || l.lead_created_date;
      if (!dateStr) return false;
      try {
        const cleanDate = dateStr.replace(' ', 'T');
        const leadDate = new Date(cleanDate).toISOString().split('T')[0];
        return leadDate >= reportsStartDate && leadDate <= reportsEndDate;
      } catch (e) {
        return false;
      }
    });
  }, [leads, reportsStartDate, reportsEndDate]);

  const totalLeadsCount = filteredLeads.length;
  const convertedLeads = React.useMemo(() => filteredLeads.filter(l => l.status === 'Booking Confirmed'), [filteredLeads]);
  const convertedCount = convertedLeads.length;
  const droppedCount = React.useMemo(() => filteredLeads.filter(l => l.status === 'Closed Lost').length, [filteredLeads]);
  const winRate = totalLeadsCount > 0 ? Math.round((convertedCount / totalLeadsCount) * 100) : 0;
  
  // Financial Metrics
  const pipelineValue = React.useMemo(() => {
    return filteredLeads
      .filter(l => l.status !== 'Closed Lost')
      .reduce((sum, l) => sum + (l.expected_booking_value || 0), 0);
  }, [filteredLeads]);
  
  const realizedRevenue = React.useMemo(() => {
    return convertedLeads.reduce((sum, l) => sum + (l.expected_booking_value || 0), 0);
  }, [convertedLeads]);
  
  const paymentsCollected = React.useMemo(() => {
    return (allPayments || []).reduce((sum, p) => sum + Number(p.amount_received || 0), 0);
  }, [allPayments]);

  // Lead status counts for Recharts BarChart
  const statusChartData = React.useMemo(() => [
    { name: 'New', value: filteredLeads.filter(l => l.status === 'New').length, color: '#3b82f6' },
    { name: 'Assigned', value: filteredLeads.filter(l => l.status === 'Assigned').length, color: '#06b6d4' },
    { name: 'Follow-up Due', value: filteredLeads.filter(l => l.status === 'Follow-up Due').length, color: '#8b5cf6' },
    { name: 'Quote Sent', value: filteredLeads.filter(l => l.status === 'Quote Sent').length, color: '#f59e0b' },
    { name: 'Booking Confirmed', value: convertedCount, color: '#10b981' },
    { name: 'Closed Lost', value: droppedCount, color: '#ef4444' },
  ], [filteredLeads, convertedCount, droppedCount]);

  // Lead source analysis
  const sourceData = React.useMemo(() => {
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
    return Object.entries(sourceMap).map(([name, data]) => ({
      name,
      value: data.count,
      converted: data.converted,
      rate: data.count > 0 ? Math.round((data.converted / data.count) * 100) : 0
    })).sort((a, b) => b.value - a.value);
  }, [filteredLeads]);

  // Executive performance
  const execData = React.useMemo(() => {
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
    return Object.entries(execMap).map(([name, data]) => ({
      name,
      count: data.count,
      converted: data.converted,
      rate: data.count > 0 ? Math.round((data.converted / data.count) * 100) : 0,
      revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredLeads]);

  // Destination Revenue Performance Breakdown
  const destData = React.useMemo(() => {
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

    return Object.entries(destMap).map(([name, data]) => ({
      name,
      count: data.count,
      converted: data.converted,
      rate: data.count > 0 ? Math.round((data.converted / data.count) * 100) : 0,
      revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredLeads]);

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

  // Consolidate and filter rates for Rate Management Overview
  const allRatesList: any[] = React.useMemo(() => {
    const list: any[] = [];
    (ratesData.hotels || []).forEach((h: any) => {
      list.push({
        type: 'Hotel',
        name: h.hotel_name,
        city: h.city_name,
        details: `${h.room_type} (${h.meal_plan})`,
        rate: h.rate,
        is_active: h.is_active
      });
    });

    (ratesData.cabs || []).forEach((c: any) => {
      list.push({
        type: 'Cab',
        name: c.vendor_name,
        city: c.city_name,
        details: `${c.vehicle_type} - ${(c.usage_type || '').replace(/_/g, ' ')}`,
        rate: c.rate,
        is_active: c.is_active
      });
    });

    (ratesData.activities || []).forEach((a: any) => {
      list.push({
        type: 'Activity',
        name: a.activity_name,
        city: a.city_name,
        details: `${(a.category || 'General').toUpperCase()} (${(a.rate_type || '').replace(/_/g, ' ')})`,
        rate: a.rate,
        is_active: a.is_active
      });
    });
    return list;
  }, [ratesData]);

  const citiesList = React.useMemo(() => {
    return Array.from(
      new Set(allRatesList.map(r => r.city).filter(Boolean))
    ).map((cityName: any) => ({
      id: cityName.toLowerCase().replace(/\s+/g, '-'),
      name: cityName
    }));
  }, [allRatesList]);

  const filteredRates = React.useMemo(() => {
    return allRatesList.filter(r => {
      const matchesCity = rateCityFilter === 'all' || r.city.toLowerCase() === rateCityFilter.toLowerCase();
      const matchesType = rateTypeFilter === 'all' || r.type.toLowerCase() === rateTypeFilter.toLowerCase();
      const matchesSearch = !rateSearchTerm || 
        r.name.toLowerCase().includes(rateSearchTerm.toLowerCase()) ||
        r.details.toLowerCase().includes(rateSearchTerm.toLowerCase());
      return matchesCity && matchesType && matchesSearch;
    });
  }, [allRatesList, rateCityFilter, rateTypeFilter, rateSearchTerm]);

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
};

export default ReportsAnalyticsView;
