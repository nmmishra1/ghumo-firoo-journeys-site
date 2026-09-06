import React, { useState, useEffect } from 'react';
import { auditLogger, AuditLogEntry } from '@/services/auditLogger';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ShieldCheck, History, Search, RefreshCw, Filter, User,
  Landmark, Car, MapPin, Activity, Package, Users, ArrowRight,
  Sparkles, FileText, CheckCircle2, Clock, Trash2, Info
} from 'lucide-react';

export const AuditLogsViewer: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditLogger.getLogs();
      setLogs(data);
    } catch (err: any) {
      toast({
        title: 'Error loading audit logs',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      !search ||
      log.target_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.old_value?.toLowerCase().includes(search.toLowerCase()) ||
      log.new_value?.toLowerCase().includes(search.toLowerCase());

    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesAction = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesModule && matchesAction;
  });

  const getModuleBadge = (mod: string) => {
    switch (mod) {
      case 'Packages':
        return <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-black">Packages</Badge>;
      case 'Hotels':
        return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-[10px] font-black">Hotels</Badge>;
      case 'Cabs':
        return <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-black">Cabs</Badge>;
      case 'Sightseeing':
        return <Badge className="bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-[10px] font-black">Sightseeing</Badge>;
      case 'Activities':
        return <Badge className="bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-500/30 text-[10px] font-black">Activities</Badge>;
      case 'Blogs':
        return <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30 text-[10px] font-black">Blogs</Badge>;
      case 'Leads':
        return <Badge className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[10px] font-black">Leads</Badge>;
      default:
        return <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-400 text-[10px] font-black">{mod}</Badge>;
    }
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return 'N/A';
    try {
      const date = new Date(ts);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 text-left">
      
      {/* KPI ANALYTICS CARDS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Total Audit Events</p>
              <div className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{logs.length}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Historical log records</p>
            </div>
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30">
              <History className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Package Edits</p>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {logs.filter(l => l.module === 'Packages').length}
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-0.5">Itinerary changes</p>
            </div>
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Rates & Vendor Edits</p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {logs.filter(l => l.module === 'Cabs' || l.module === 'Hotels').length}
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Cab & hotel contracts</p>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30">
              <Car className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Active Users Logged</p>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {new Set(logs.map(l => l.user_email)).size}
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mt-0.5">Authorized staff</p>
            </div>
            <div className="p-3 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/30">
              <User className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HEADER & FILTER TOOLBAR CARD */}
      <Card className="border-border/60 shadow-md bg-card">
        <CardHeader className="p-4 border-b border-border/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" /> System Audit Trail & Security Logs
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Complete historical log of package hotel modifications, contracted cab rate edits, and bulk CSV import operations.
              </CardDescription>
            </div>

            <Button
              onClick={fetchLogs}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-9 px-4 rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
            </Button>
          </div>

          {/* Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search target record, user email, old/new diff..."
                className="pl-9 h-9 text-xs rounded-xl bg-background text-slate-950 dark:text-white font-medium placeholder:text-slate-400 border-border/80"
              />
            </div>

            {/* Filter Module */}
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="All Modules" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="Packages">Packages</SelectItem>
                <SelectItem value="Hotels">Hotels</SelectItem>
                <SelectItem value="Cabs">Cabs</SelectItem>
                <SelectItem value="Sightseeing">Sightseeing</SelectItem>
                <SelectItem value="Activities">Activities</SelectItem>
                <SelectItem value="Blogs">Blogs</SelectItem>
                <SelectItem value="Leads">Leads</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Action */}
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="h-9 text-xs font-semibold border-border/80"><SelectValue placeholder="All Actions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Array.from(new Set(logs.map(l => l.action).filter(Boolean))).map(act => (
                  <SelectItem key={act} value={act}>{act}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-end px-2 text-xs text-slate-600 dark:text-slate-400 font-extrabold">
              {filteredLogs.length} of {logs.length} logs
            </div>
          </div>
        </CardHeader>

        {/* Audit Logs Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 font-black uppercase text-[10px] border-b border-border/60">
                <tr>
                  <th className="p-3 min-w-[150px]">Date & Time</th>
                  <th className="p-3 min-w-[90px]">Module</th>
                  <th className="p-3 min-w-[170px]">User / Email</th>
                  <th className="p-3 min-w-[160px]">Action</th>
                  <th className="p-3 min-w-[200px]">Target Record</th>
                  <th className="p-3 min-w-[280px]">Change Diff (Old → New Value)</th>
                  <th className="p-3 min-w-[180px]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-slate-900 dark:text-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-600 dark:text-slate-400 font-bold">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                      Loading audit log history...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-600 dark:text-slate-400 font-semibold">
                      <Info className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                      No audit log records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="p-3">
                        {getModuleBadge(log.module)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">
                            {(log.user_name || log.user_email || 'A')[0]}
                          </div>
                          <div className="truncate max-w-[140px]">
                            <span className="font-extrabold text-slate-950 dark:text-white block truncate">{log.user_name || 'Admin'}</span>
                            <span className="text-[10px] text-slate-500 font-mono truncate block">{log.user_email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-900 border-amber-500/40 text-amber-700 dark:text-amber-300 font-extrabold text-[10px]">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-3 font-extrabold text-xs text-slate-950 dark:text-white max-w-[200px] truncate uppercase">
                        {log.target_name}
                      </td>
                      <td className="p-3">
                        {log.old_value || log.new_value ? (
                          <div className="space-y-1 text-[11px]">
                            {log.old_value && (
                              <div className="p-1 px-2 rounded bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold">
                                <span className="font-black text-[9px] uppercase tracking-wider text-rose-700 dark:text-rose-400 mr-1">OLD:</span>
                                {log.old_value}
                              </div>
                            )}
                            {log.new_value && (
                              <div className="p-1 px-2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-extrabold flex items-center justify-between gap-1">
                                <span>
                                  <span className="font-black text-[9px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mr-1">NEW:</span>
                                  {log.new_value}
                                </span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">No value diff</span>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-slate-600 dark:text-slate-400 font-medium max-w-[180px] truncate" title={log.details}>
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredLogs.length > 0 && (
            <div className="px-4 py-3 border-t border-border/40 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> audit entries</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsViewer;
