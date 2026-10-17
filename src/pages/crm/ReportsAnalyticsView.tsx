import React, { useState, useEffect } from 'react';
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
  Search,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  CreditCard,
  RefreshCw,
  ExternalLink,
  Download,
  Printer,
  Mail,
  Eye
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, 
  PieChart, Pie, Cell 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

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

  // Receivables & Payment Due Aging state
  const [receivablesList, setReceivablesList] = useState<any[]>([]);
  const [receivablesLoading, setReceivablesLoading] = useState<boolean>(false);
  const [receivablesUrgencyFilter, setReceivablesUrgencyFilter] = useState<string>('all');
  const [receivablesSearch, setReceivablesSearch] = useState<string>('');

  const loadReceivables = async () => {
    setReceivablesLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/php-backend/reports.php?type=receivables_aging', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.receivables)) {
          setReceivablesList(data.receivables);
          return;
        }
      }
      throw new Error('Fallback to local calculation');
    } catch (e) {
      // Robust client-side fallback from leads and allPayments
      const confirmed = (leads || []).filter(l => l.status === 'Booking Confirmed');
      const localList: any[] = [];
      const nowTs = Date.now();
      for (const l of confirmed) {
        const totalVal = Number(l.expected_booking_value || l.package_cost || 0);
        const leadPayments = (allPayments || []).filter(p => String(p.lead_id) === String(l.id) && (p.status === 'Success' || !p.status));
        const totalPaid = leadPayments.reduce((s, p) => s + Number(p.amount_received || 0), 0);
        const pending = Math.max(0, totalVal - totalPaid);
        if (pending > 0) {
          const tDate = l.travel_date || l.start_date || '';
          const tTs = tDate ? new Date(tDate).getTime() : 0;
          const days = tTs ? Math.round((tTs - nowTs) / (86400 * 1000)) : 999;
          let urgency = 'Future Departure';
          let badge = 'secondary';
          if (days <= 0) { urgency = 'Immediate / Overdue'; badge = 'destructive'; }
          else if (days <= 3) { urgency = 'Due in 3 Days'; badge = 'destructive'; }
          else if (days <= 7) { urgency = 'Due in 7 Days'; badge = 'warning'; }
          else if (days <= 15) { urgency = 'Due in 15 Days'; badge = 'default'; }
          localList.push({
            lead_id: l.id,
            customer_name: l.customer_name || 'Traveler',
            customer_phone: l.customer_phone || '',
            customer_email: l.customer_email || '',
            destination: l.destination || 'Custom Tour',
            travel_date: tDate,
            days_until_travel: days,
            assigned_agent: l.assigned_agent || 'Unassigned',
            urgency,
            badge_variant: badge,
            total_value: totalVal,
            total_paid: totalPaid,
            balance_pending: pending,
            paid_percentage: totalVal > 0 ? Math.round((totalPaid / totalVal) * 100) : 0
          });
        }
      }
      localList.sort((a, b) => (a.days_until_travel ?? 999) - (b.days_until_travel ?? 999));
      setReceivablesList(localList);
    } finally {
      setReceivablesLoading(false);
    }
  };

  useEffect(() => {
    loadReceivables();
  }, [leads, allPayments]);

  const openWhatsAppReminder = (item: any) => {
    const cleanPhone = (item.customer_phone || '').replace(/\D/g, '');
    const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Dear ${item.customer_name || 'Traveler'},\n\n` +
      `Greetings from Ghumo Firoo Travels!\n\n` +
      `Your upcoming journey to ${item.destination} is scheduled for ${item.travel_date || 'your confirmed travel date'}.\n\n` +
      `Kindly note that an outstanding balance of ₹${Number(item.balance_pending || 0).toLocaleString('en-IN')} is due before departure to ensure seamless hotel vouchers and cab allocations.\n\n` +
      `For payment assistance or itinerary queries, please feel free to reach us.\n\n` +
      `Warm regards,\nGhumo Firoo Travels`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const filteredReceivables = React.useMemo(() => {
    return receivablesList.filter(item => {
      const matchesUrgency = receivablesUrgencyFilter === 'all' || item.urgency === receivablesUrgencyFilter;
      const term = receivablesSearch.toLowerCase().trim();
      const matchesSearch = !term ||
        (item.customer_name || '').toLowerCase().includes(term) ||
        (item.destination || '').toLowerCase().includes(term) ||
        (item.customer_phone || '').toLowerCase().includes(term) ||
        (item.assigned_agent || '').toLowerCase().includes(term);
      return matchesUrgency && matchesSearch;
    });
  }, [receivablesList, receivablesUrgencyFilter, receivablesSearch]);

  const receivablesSummary = React.useMemo(() => {
    const totalOutstanding = receivablesList.reduce((sum, r) => sum + (r.balance_pending || 0), 0);
    const criticalCount = receivablesList.filter(r => r.urgency === 'Immediate / Overdue' || r.urgency === 'Due in 3 Days').length;
    const due7Count = receivablesList.filter(r => r.urgency === 'Due in 7 Days').length;
    const due15Count = receivablesList.filter(r => r.urgency === 'Due in 15 Days').length;
    const futureCount = receivablesList.filter(r => r.urgency === 'Future Departure').length;
    return { totalOutstanding, criticalCount, due7Count, due15Count, futureCount };
  }, [receivablesList]);

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

  // Lead source analysis with Revenue, Profit & Good/Bad ROI Verdict
  const sourceData = React.useMemo(() => {
    const sourceMap: Record<string, { count: number; converted: number; lost: number; revenue: number; supplierCost: number; profit: number }> = {};
    filteredLeads.forEach(l => {
      const src = (l.source || l.lead_source || l.utm_source || l.customer_type || 'Website / Organic SEO').trim();
      if (!sourceMap[src]) {
        sourceMap[src] = { count: 0, converted: 0, lost: 0, revenue: 0, supplierCost: 0, profit: 0 };
      }
      sourceMap[src].count++;
      if (l.status === 'Closed Lost') {
        sourceMap[src].lost++;
      }
      if (l.status === 'Booking Confirmed') {
        const rev = Number(l.expected_booking_value || l.package_cost || 0);
        const cost = Number(l.supplier_cost || l.net_cost || Math.round(rev * 0.82));
        sourceMap[src].converted++;
        sourceMap[src].revenue += rev;
        sourceMap[src].supplierCost += cost;
        sourceMap[src].profit += Math.max(0, rev - cost);
      }
    });
    return Object.entries(sourceMap).map(([name, data]) => {
      const rate = data.count > 0 ? Math.round((data.converted / data.count) * 100) : 0;
      const verdict: 'Good' | 'Average' | 'Bad' =
        rate >= 25 || data.profit >= 30000 ? 'Good' :
        rate >= 12 || data.converted >= 1 ? 'Average' : 'Bad';
      const recommendation =
        verdict === 'Good' ? 'High ROI — Scale SEO / Ad Budget' :
        verdict === 'Average' ? 'Moderate — Speed up <15m WhatsApp follow-up' :
        'Low Conversion — Audit lead quality & targeting';
      return {
        name,
        value: data.count,
        converted: data.converted,
        lost: data.lost,
        rate,
        revenue: data.revenue,
        supplierCost: data.supplierCost,
        profit: data.profit,
        verdict,
        recommendation
      };
    }).sort((a, b) => b.profit - a.profit || b.value - a.value);
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

  // Destination Revenue, Profit & Good/Bad Performance Breakdown
  const destData = React.useMemo(() => {
    const destMap: Record<string, { count: number; converted: number; lost: number; revenue: number; supplierCost: number; profit: number }> = {};
    filteredLeads.forEach(l => {
      const rawDest = (l.destination || l.travel_interest || l.tour_description || 'Other Destinations').trim();
      let normDest = 'Other Destinations';
      const dLower = rawDest.toLowerCase();
      if (dLower.includes('rann') || dLower.includes('kutch') || dLower.includes('bhuj')) normDest = 'Rann Utsav Kutch';
      else if (dLower.includes('dham') || dLower.includes('kedarnath') || dLower.includes('badrinath')) normDest = 'Char Dham Yatra';
      else if (dLower.includes('kashmir') || dLower.includes('srinagar') || dLower.includes('gulmarg')) normDest = 'Kashmir Paradise';
      else if (dLower.includes('kerala') || dLower.includes('munnar') || dLower.includes('alleppey')) normDest = 'Kerala Backwaters';
      else if (dLower.includes('himachal') || dLower.includes('manali') || dLower.includes('shimla')) normDest = 'Himachal Adventure';
      else if (dLower.includes('goa')) normDest = 'Goa Beach Escape';
      else if (dLower.includes('rajasthan') || dLower.includes('jaipur') || dLower.includes('udaipur')) normDest = 'Royal Rajasthan';
      else if (dLower.includes('andaman')) normDest = 'Andaman Islands';
      else if (dLower.includes('ladakh') || dLower.includes('leh')) normDest = 'Leh Ladakh Circuit';
      else if (dLower.includes('europe') || dLower.includes('dubai') || dLower.includes('thailand') || dLower.includes('bali')) normDest = 'International Tours';
      else if (rawDest.length > 2) normDest = rawDest;

      if (!destMap[normDest]) destMap[normDest] = { count: 0, converted: 0, lost: 0, revenue: 0, supplierCost: 0, profit: 0 };
      destMap[normDest].count++;
      if (l.status === 'Closed Lost') {
        destMap[normDest].lost++;
      }
      if (l.status === 'Booking Confirmed') {
        const rev = Number(l.expected_booking_value || l.package_cost || 0);
        const cost = Number(l.supplier_cost || l.net_cost || Math.round(rev * 0.82));
        destMap[normDest].converted++;
        destMap[normDest].revenue += rev;
        destMap[normDest].supplierCost += cost;
        destMap[normDest].profit += Math.max(0, rev - cost);
      }
    });

    return Object.entries(destMap).map(([name, data]) => {
      const rate = data.count > 0 ? Math.round((data.converted / data.count) * 100) : 0;
      const marginPct = data.revenue > 0 ? Math.round((data.profit / data.revenue) * 100) : 0;
      const verdict: 'Good' | 'Moderate' | 'Bad' =
        rate >= 25 || data.profit >= 25000 ? 'Good' :
        rate >= 12 || data.converted >= 1 ? 'Moderate' : 'Bad';
      const insight =
        verdict === 'Good' ? 'Winning Destination — High conversion & margin' :
        verdict === 'Moderate' ? 'Steady Performer — Bundle complimentary sightseeing' :
        'Underperforming — Check contracted hotel/cab rates';
      return {
        name,
        count: data.count,
        converted: data.converted,
        lost: data.lost,
        rate,
        revenue: data.revenue,
        supplierCost: data.supplierCost,
        profit: data.profit,
        marginPct,
        verdict,
        insight
      };
    }).sort((a, b) => b.revenue - a.revenue || b.count - a.count);
  }, [filteredLeads]);

  // Profit & Loss (P&L) Summary & Booking-Level Ledger
  const pnlAnalytics = React.useMemo(() => {
    let totalSellingRevenue = 0;
    let totalSupplierCost = 0;
    let estHotelCost = 0;
    let estCabCost = 0;
    let estSightseeingCost = 0;

    const bookingRows = convertedLeads.map(l => {
      const selling = Number(l.expected_booking_value || l.package_cost || 0);
      const netCost = Number(l.supplier_cost || l.net_cost || Math.round(selling * 0.82));
      const profit = selling - netCost;
      const marginPct = selling > 0 ? Math.round((profit / selling) * 100) : 0;

      const hotelShare = Math.round(netCost * 0.55);
      const cabShare = Math.round(netCost * 0.28);
      const sightShare = Math.max(0, netCost - hotelShare - cabShare);

      totalSellingRevenue += selling;
      totalSupplierCost += netCost;
      estHotelCost += hotelShare;
      estCabCost += cabShare;
      estSightseeingCost += sightShare;

      return {
        id: l.id,
        customerName: l.customer_name || 'Guest',
        destination: l.destination || l.travel_interest || 'Custom Tour',
        source: l.source || l.lead_source || l.customer_type || 'Website / Organic SEO',
        sellingPrice: selling,
        supplierCost: netCost,
        hotelCost: hotelShare,
        cabCost: cabShare,
        sightseeingCost: sightShare,
        netProfit: profit,
        marginPct
      };
    });

    const netGrossProfit = totalSellingRevenue - totalSupplierCost;
    const overallMarginPct = totalSellingRevenue > 0 ? Math.round((netGrossProfit / totalSellingRevenue) * 100) : 0;

    return {
      totalSellingRevenue,
      totalSupplierCost,
      estHotelCost,
      estCabCost,
      estSightseeingCost,
      netGrossProfit,
      overallMarginPct,
      bookingRows
    };
  }, [convertedLeads]);



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

  const { toast } = useToast();
  const [sendingDigest, setSendingDigest] = useState<boolean>(false);

  // Generic CSV Download utility with UTF-8 BOM
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const escapeCsv = (val: string | number) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };
    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportReceivablesCSV = () => {
    const headers = [
      'Lead / Booking ID',
      'Guest Name',
      'Contact Phone',
      'Contact Email',
      'Destination',
      'Departure Date',
      'Days Until Travel',
      'Urgency Status',
      'Total Value (INR)',
      'Total Paid (INR)',
      'Pending Balance (INR)',
      'Paid Percentage (%)',
      'Assigned Agent'
    ];

    const dataToExport = filteredReceivables.length > 0 ? filteredReceivables : receivablesList;
    const rows = dataToExport.map(r => [
      r.lead_id || '',
      r.customer_name || 'Traveler',
      r.customer_phone || '',
      r.customer_email || '',
      r.destination || '',
      r.travel_date || '',
      r.days_until_travel ?? '',
      r.urgency || '',
      r.total_value || 0,
      r.total_paid || 0,
      r.balance_pending || 0,
      `${r.paid_percentage || 0}%`,
      r.assigned_agent || 'Unassigned'
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`ghumo_firoo_receivables_aging_${dateStr}.csv`, headers, rows);
    toast({
      title: "Receivables Exported",
      description: `Downloaded ${rows.length} pending receivable records to CSV.`
    });
  };

  const exportRatesCSV = () => {
    const headers = [
      'Service Type',
      'Supplier / Name',
      'Destination City',
      'Specification / Rate Details',
      'Contract Rate (INR)',
      'Active Status'
    ];

    const dataToExport = filteredRates.length > 0 ? filteredRates : allRatesList;
    const rows = dataToExport.map(r => [
      r.type || '',
      r.name || '',
      r.city || '',
      r.details || '',
      r.rate || 0,
      r.is_active ? 'Active' : 'Inactive'
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`ghumo_firoo_contract_rates_${dateStr}.csv`, headers, rows);
    toast({
      title: "Contract Rates Exported",
      description: `Downloaded ${rows.length} supplier rate contracts to CSV.`
    });
  };

  const handleExportReport = () => {
    const headers = [
      'Category',
      'Metric / Item',
      'Assigned / Inquiries',
      'Converted / Won',
      'Win Rate %',
      'Revenue Won (INR)'
    ];

    const rows: (string | number)[][] = [];

    // Summary KPIs
    rows.push(['Sales Funnel KPI', 'Total Inquiries Received', totalLeadsCount, convertedCount, `${winRate}%`, realizedRevenue]);
    rows.push(['Sales Funnel KPI', 'Confirmed Bookings Won', convertedCount, convertedCount, '100%', realizedRevenue]);
    rows.push(['Sales Funnel KPI', 'Closed Lost Inquiries', droppedCount, 0, '0%', 0]);
    rows.push(['Sales Funnel KPI', 'Active Pipeline Value', totalLeadsCount - droppedCount, '-', '-', pipelineValue]);
    rows.push(['Sales Funnel KPI', 'Payments Verified', allPayments?.length || 0, '-', '-', paymentsCollected]);

    // Destination Performance
    destData.forEach(d => {
      rows.push(['Destination Performance', d.name, d.count, d.converted, `${d.rate}%`, d.revenue]);
    });

    // Executive Leaderboard
    execData.forEach(e => {
      rows.push(['Executive Leaderboard', e.name, e.count, e.converted, `${e.rate}%`, e.revenue]);
    });

    // Source Channels
    sourceData.forEach(s => {
      rows.push(['Lead Source Channel', s.name, s.value, s.converted, `${s.rate}%`, 0]);
    });

    downloadCSV(`ghumo_firoo_funnel_analytics_${reportsStartDate}_to_${reportsEndDate}.csv`, headers, rows);
    toast({
      title: "Funnel Report Exported",
      description: `Downloaded executive sales funnel report (${reportsStartDate} to ${reportsEndDate}) to CSV.`
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePreviewDigest = () => {
    window.open('/php-backend/cron_reports_digest.php?action=preview', '_blank');
  };

  const handleSendDigest = async () => {
    setSendingDigest(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/php-backend/cron_reports_digest.php?action=send_now', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Executive Digest Dispatched",
          description: data.message || "Weekly executive digest successfully sent to management.",
        });
      } else {
        throw new Error(data.message || 'Server returned an error');
      }
    } catch (err: any) {
      toast({
        title: "Dispatch Notice",
        description: err.message || "Failed to trigger email digest. Check system mail configuration.",
        variant: "destructive"
      });
    } finally {
      setSendingDigest(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-poppins pb-12">
      {/* Header Card */}
      <Card className="border border-white/10 overflow-hidden shadow-2xl rounded-2xl bg-gradient-to-r from-[#0B1026] via-[#1E2942] to-[#0B1026] text-white">
        <CardHeader className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-extrabold flex items-center gap-2 text-white">
              <TrendingUp className="w-5.5 h-5.5 text-accent" />
              Operational Analytics & Rates Center
            </CardTitle>
            <CardDescription className="text-slate-300 text-xs font-semibold">
              View business conversion performance, aging receivables schedule, and supplier contract rates.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-9 px-3.5 text-xs font-bold rounded-xl border-white/20 bg-white/5 hover:bg-white/15 text-slate-100 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-accent" />
              <span>Print / PDF</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePreviewDigest}
              className="h-9 px-3 text-xs font-bold rounded-xl border-white/20 bg-white/5 hover:bg-white/15 text-slate-100 flex items-center gap-1.5"
              title="Preview Weekly Executive Digest HTML"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Preview Digest</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSendDigest}
              disabled={sendingDigest}
              className="h-9 px-4 text-xs font-bold rounded-xl bg-gradient-warm text-[#0B1026] hover:opacity-90 flex items-center gap-1.5 shadow-lg"
            >
              {sendingDigest ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Email Digest</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="inline-flex bg-[#1A2342]/80 border border-white/10 p-1 rounded-2xl mb-4 h-12 flex-wrap gap-1">
          <TabsTrigger value="funnel" className="rounded-xl text-xs font-bold py-2 px-5 data-[state=active]:bg-gradient-warm data-[state=active]:text-[#0B1026]">Sales & Conversion Funnel</TabsTrigger>
          <TabsTrigger value="pnl" className="rounded-xl text-xs font-bold py-2 px-5 data-[state=active]:bg-gradient-warm data-[state=active]:text-[#0B1026] flex items-center gap-1.5">
            <span>Profit &amp; Loss (P&amp;L) &amp; Good/Bad ROI</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              NEW
            </span>
          </TabsTrigger>
          <TabsTrigger value="receivables" className="rounded-xl text-xs font-bold py-2 px-5 data-[state=active]:bg-gradient-warm data-[state=active]:text-[#0B1026] flex items-center gap-1.5">
            <span>Receivables & Aging Schedule</span>
            {receivablesSummary.criticalCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {receivablesSummary.criticalCount}
              </span>
            )}
          </TabsTrigger>
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
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Realized Revenue &amp; Profit</span>
                <h3 className="text-2xl font-black text-amber-400">₹{realizedRevenue.toLocaleString()}</h3>
                <p className="text-[10px] text-emerald-400 font-bold">Net Profit: ₹{pnlAnalytics.netGrossProfit.toLocaleString()} ({pnlAnalytics.overallMarginPct}%)</p>
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
            {/* Destination Revenue & Good/Bad Leaderboard Card */}
            <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="p-5 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-accent" />
                  Good vs. Bad Destination Performance
                </CardTitle>
                <Badge className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Profit &amp; Conversion
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
                          <th className="p-3.5 text-center">Verdict</th>
                          <th className="p-3.5 text-right">Net Profit</th>
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
                            <td className="p-3.5 text-center text-emerald-400 font-bold">{row.converted} ({row.rate}%)</td>
                            <td className="p-3.5 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                                row.verdict === 'Good' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                row.verdict === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {row.verdict === 'Good' ? '🟢 Good' : row.verdict === 'Moderate' ? '🟡 Moderate' : '🔴 Bad / Low'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-black text-emerald-400">₹{row.profit.toLocaleString('en-IN')}</td>
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
              <CardHeader className="p-5 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Good vs. Bad Lead Source ROI Analysis
                </CardTitle>
                <Badge className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Channel Quality Verdict
                </Badge>
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
                          <th className="p-3.5 text-right">Revenue</th>
                          <th className="p-3.5 text-right">Net Profit</th>
                          <th className="p-3.5 text-center">Source Verdict</th>
                          <th className="p-3.5">Actionable Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {sourceData.map((row) => (
                          <tr key={row.name} className="hover:bg-white/5 transition-colors">
                            <td className="p-3.5 font-bold text-white">{row.name}</td>
                            <td className="p-3.5 text-center text-slate-300 font-semibold">{row.value}</td>
                            <td className="p-3.5 text-center text-emerald-400 font-bold">{row.converted}</td>
                            <td className="p-3.5 text-center font-bold text-slate-200">{row.rate}%</td>
                            <td className="p-3.5 text-right font-bold text-amber-400">₹{row.revenue.toLocaleString('en-IN')}</td>
                            <td className="p-3.5 text-right font-black text-emerald-400">₹{row.profit.toLocaleString('en-IN')}</td>
                            <td className="p-3.5 text-center">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                                row.verdict === 'Good' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                row.verdict === 'Average' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {row.verdict === 'Good' ? '🟢 Good Source' : row.verdict === 'Average' ? '🟡 Average' : '🔴 Bad Source'}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-300 text-[11px]">{row.recommendation}</td>
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

        {/* 1B. PROFIT & LOSS (P&L) & GOOD/BAD DESTINATION/SOURCE INTELLIGENCE TAB */}
        <TabsContent value="pnl" className="space-y-6">
          {/* P&L Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-white/10 p-5 bg-[#1A2342]/70 text-white backdrop-blur-xl shadow-xl rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Selling Revenue (Won)</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">₹{pnlAnalytics.totalSellingRevenue.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-slate-300 mt-1">Across {convertedCount} confirmed bookings</p>
            </Card>

            <Card className="border-white/10 p-5 bg-[#1A2342]/70 text-white backdrop-blur-xl shadow-xl rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Net Supplier Cost (Hotel + Cab + Sight)</p>
              <h3 className="text-2xl font-black text-rose-400 mt-1">₹{pnlAnalytics.totalSupplierCost.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-slate-300 mt-1">
                Hotel: ₹{pnlAnalytics.estHotelCost.toLocaleString('en-IN')} • Cab: ₹{pnlAnalytics.estCabCost.toLocaleString('en-IN')}
              </p>
            </Card>

            <Card className="border-emerald-500/30 p-5 bg-emerald-950/30 text-white backdrop-blur-xl shadow-xl rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Net Gross Profit (P&amp;L)</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{pnlAnalytics.netGrossProfit.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-emerald-300/80 mt-1 font-semibold">Realized Agency Earnings</p>
            </Card>

            <Card className="border-white/10 p-5 bg-[#1A2342]/70 text-white backdrop-blur-xl shadow-xl rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Average Profit Margin</p>
              <h3 className="text-2xl font-black text-cyan-400 mt-1">{pnlAnalytics.overallMarginPct}%</h3>
              <p className="text-[10px] text-slate-300 mt-1">Target B2C Margin: 15% – 22%</p>
            </Card>
          </div>

          {/* Good vs. Bad Destinations Full Matrix */}
          <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Destination Profitability &amp; Good vs. Bad Classification
                </CardTitle>
                <CardDescription className="text-xs text-slate-300 mt-0.5">
                  Identifies high-margin winning destinations vs. low-conversion destinations needing rate re-contracting.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-white/10 border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-300">
                      <th className="p-3.5">Destination</th>
                      <th className="p-3.5 text-center">Enquiries</th>
                      <th className="p-3.5 text-center">Won / Lost</th>
                      <th className="p-3.5 text-center">Conv. %</th>
                      <th className="p-3.5 text-right">Selling Revenue</th>
                      <th className="p-3.5 text-right">Supplier Cost</th>
                      <th className="p-3.5 text-right">Net Profit</th>
                      <th className="p-3.5 text-center">Status Verdict</th>
                      <th className="p-3.5">Strategic Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {destData.map(d => (
                      <tr key={d.name} className="hover:bg-white/5">
                        <td className="p-3.5 font-extrabold text-white">{d.name}</td>
                        <td className="p-3.5 text-center font-semibold text-slate-300">{d.count}</td>
                        <td className="p-3.5 text-center">
                          <span className="text-emerald-400 font-bold">{d.converted}W</span>
                          <span className="text-slate-500 mx-1">/</span>
                          <span className="text-rose-400 font-semibold">{d.lost}L</span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-white">{d.rate}%</td>
                        <td className="p-3.5 text-right font-bold text-amber-400">₹{d.revenue.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-right font-semibold text-rose-300">₹{d.supplierCost.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-right font-black text-emerald-400">₹{d.profit.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                            d.verdict === 'Good' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            d.verdict === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {d.verdict === 'Good' ? '🟢 Good Destination' : d.verdict === 'Moderate' ? '🟡 Moderate' : '🔴 Bad / Underperforming'}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] text-slate-300">{d.insight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Booking-by-Booking Profit & Loss Breakdown */}
          <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-white/10 bg-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                  Booking-Level Profit &amp; Loss (P&amp;L) Statement
                </CardTitle>
                <CardDescription className="text-xs text-slate-300 mt-0.5">
                  Internal breakdown of Client Selling Price vs. Net Contracted Cost (Hotel, Cab, Sightseeing) and Net Margin.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pnlAnalytics.bookingRows.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  No confirmed bookings in the selected date range. Try clicking "All Time" in the Funnel period filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-white/10 border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-300">
                        <th className="p-3.5">Client Name</th>
                        <th className="p-3.5">Destination</th>
                        <th className="p-3.5">Lead Source</th>
                        <th className="p-3.5 text-right">Client Total Price</th>
                        <th className="p-3.5 text-right">Est. Hotel Cost</th>
                        <th className="p-3.5 text-right">Est. Cab Cost</th>
                        <th className="p-3.5 text-right">Est. Sightseeing</th>
                        <th className="p-3.5 text-right">Net Profit (₹)</th>
                        <th className="p-3.5 text-center">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {pnlAnalytics.bookingRows.map((b, idx) => (
                        <tr key={b.id || idx} className="hover:bg-white/5">
                          <td className="p-3.5 font-bold text-white">{b.customerName}</td>
                          <td className="p-3.5 text-slate-300 font-semibold">{b.destination}</td>
                          <td className="p-3.5 text-slate-300">{b.source}</td>
                          <td className="p-3.5 text-right font-extrabold text-amber-400">₹{b.sellingPrice.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 text-right text-slate-300">₹{b.hotelCost.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 text-right text-slate-300">₹{b.cabCost.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 text-right text-slate-300">₹{b.sightseeingCost.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 text-right font-black text-emerald-400">₹{b.netProfit.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 text-center">
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                              {b.marginPct}%
                            </Badge>
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

        {/* 2. RECEIVABLES & AGING SCHEDULE TAB */}
        <TabsContent value="receivables" className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-white/10 bg-[#1A2342]/70 text-white backdrop-blur-xl shadow-xl rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">Total Outstanding Balance</p>
                  <h3 className="text-2xl font-black text-amber-400 mt-1">₹{receivablesSummary.totalOutstanding.toLocaleString('en-IN')}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{receivablesList.length} confirmed bookings with balance</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border border-rose-500/30 bg-rose-950/30 text-white backdrop-blur-xl shadow-xl rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-rose-300">Immediate / Due ≤3 Days</p>
                  <h3 className="text-2xl font-black text-rose-400 mt-1">{receivablesSummary.criticalCount}</h3>
                  <p className="text-[10px] text-rose-300/80 mt-0.5 font-semibold">Immediate collection required</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
              </div>
            </Card>

            <Card className="border border-amber-500/30 bg-amber-950/20 text-white backdrop-blur-xl shadow-xl rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">Due in Next 7 Days</p>
                  <h3 className="text-2xl font-black text-amber-400 mt-1">{receivablesSummary.due7Count}</h3>
                  <p className="text-[10px] text-amber-300/80 mt-0.5 font-semibold">Pre-departure reminders pending</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border border-blue-500/30 bg-blue-950/20 text-white backdrop-blur-xl shadow-xl rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-300">Future Departures (15+ Days)</p>
                  <h3 className="text-2xl font-black text-blue-400 mt-1">{receivablesSummary.due15Count + receivablesSummary.futureCount}</h3>
                  <p className="text-[10px] text-blue-300/80 mt-0.5 font-semibold">Scheduled collection pipeline</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#1A2342]/60 border border-white/10 p-4 rounded-2xl backdrop-blur-xl shadow-xl">
            {/* Search */}
            <div className="space-y-1 text-left sm:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Search Guests / Destination / Agent</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="Search by traveler name, destination, mobile, or agent..."
                  value={receivablesSearch}
                  onChange={(e) => setReceivablesSearch(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-white/5 border-white/15 text-white shadow-sm font-semibold focus-visible:ring-accent"
                />
              </div>
            </div>

            {/* Urgency Filter */}
            <div className="space-y-1 text-left flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Urgency Filter</Label>
                <Select value={receivablesUrgencyFilter} onValueChange={setReceivablesUrgencyFilter}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-white/5 border-white/15 text-white font-semibold">
                    <SelectValue placeholder="All Urgencies" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="all">All Urgency Levels</SelectItem>
                    <SelectItem value="Immediate / Overdue">Immediate / Overdue</SelectItem>
                    <SelectItem value="Due in 3 Days">Due in 3 Days</SelectItem>
                    <SelectItem value="Due in 7 Days">Due in 7 Days</SelectItem>
                    <SelectItem value="Due in 15 Days">Due in 15 Days</SelectItem>
                    <SelectItem value="Future Departure">Future Departure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={loadReceivables}
                disabled={receivablesLoading}
                className="h-9 px-3 rounded-xl border-white/15 bg-white/5 hover:bg-white/15 text-slate-200"
                title="Refresh Receivables Data"
              >
                <RefreshCw className={`w-4 h-4 ${receivablesLoading ? 'animate-spin text-accent' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Receivables Table */}
          <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Pending Balance Aging Matrix
                </CardTitle>
                <CardDescription className="text-slate-400 text-[11px] mt-0.5">
                  Confirmed departures sorted by nearest travel date with one-click payment reminder dispatch.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-white/10 border-white/20 text-slate-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                  {filteredReceivables.length} Bookings Shown
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={exportReceivablesCSV}
                  className="h-8 px-3 text-[11px] font-bold rounded-xl border-white/20 bg-white/5 hover:bg-white/15 text-emerald-400 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Receivables CSV</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {receivablesLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent" />
                  Calculating real-time payment aging schedule...
                </div>
              ) : filteredReceivables.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                  No confirmed bookings match the active filter criteria. All balances clear!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-white/10 border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-300">
                        <th className="p-3.5">Guest & Destination</th>
                        <th className="p-3.5">Departure Date</th>
                        <th className="p-3.5">Payment Urgency</th>
                        <th className="p-3.5 text-right">Package Cost</th>
                        <th className="p-3.5 text-right">Paid</th>
                        <th className="p-3.5 text-right">Balance Due</th>
                        <th className="p-3.5 text-center">Settlement Status</th>
                        <th className="p-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredReceivables.map((row) => (
                        <tr key={row.lead_id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              {row.customer_name}
                              <span className="text-[10px] font-mono text-slate-400 font-semibold">#{row.lead_id}</span>
                            </div>
                            <div className="text-[11px] text-slate-300 font-semibold flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-accent shrink-0" />
                              <span>{row.destination}</span>
                              {row.assigned_agent && (
                                <span className="text-slate-400 text-[10px] ml-1">· Agent: {row.assigned_agent}</span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-bold text-slate-200">{row.travel_date || 'TBD'}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {row.days_until_travel <= 0 
                                ? 'Departed / Departing Today' 
                                : `${row.days_until_travel} days remaining`}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                row.urgency === 'Immediate / Overdue' || row.urgency === 'Due in 3 Days'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                  : row.urgency === 'Due in 7 Days'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : row.urgency === 'Due in 15 Days'
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                  : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                              }`}
                            >
                              {row.urgency}
                            </Badge>
                          </td>

                          <td className="p-3.5 text-right font-mono font-bold text-slate-300">
                            ₹{row.total_value.toLocaleString('en-IN')}
                          </td>

                          <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                            ₹{row.total_paid.toLocaleString('en-IN')}
                          </td>

                          <td className="p-3.5 text-right font-mono font-black text-amber-400 text-sm">
                            ₹{row.balance_pending.toLocaleString('en-IN')}
                          </td>

                          <td className="p-3.5 text-center min-w-[120px]">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                              <span>Paid: {row.paid_percentage}%</span>
                              <span>Pending</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  row.paid_percentage >= 75 ? 'bg-emerald-400' :
                                  row.paid_percentage >= 40 ? 'bg-amber-400' : 'bg-rose-500'
                                }`} 
                                style={{ width: `${Math.min(100, row.paid_percentage)}%` }} 
                              />
                            </div>
                          </td>

                          <td className="p-3.5 text-center">
                            {row.customer_phone ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => openWhatsAppReminder(row)}
                                className="h-7 px-2.5 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-sm"
                                title="Send WhatsApp Payment Reminder"
                              >
                                <MessageSquare className="w-3 h-3" />
                                Reminder
                              </Button>
                            ) : (
                              <span className="text-slate-500 text-[10px]">No Phone</span>
                            )}
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
            <CardHeader className="p-5 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-accent" />
                  Contracted Supplier Rates Catalog
                </CardTitle>
                <CardDescription className="text-slate-400 text-[11px] mt-0.5">
                  Hotels, cab tariffs, and activity rates negotiated with local partners.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-white/10 border-white/20 text-slate-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                  {filteredRates.length} Rates Listed
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={exportRatesCSV}
                  className="h-8 px-3 text-[11px] font-bold rounded-xl border-white/20 bg-white/5 hover:bg-white/15 text-emerald-400 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Rates CSV</span>
                </Button>
              </div>
            </CardHeader>
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
