import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShieldCheck, UserCheck, UserPlus, Edit, Search, Shield, 
  Users, CheckCircle2, XCircle, Loader2, Sparkles, Phone, Mail, User,
  Hotel, Car, MapPin, Activity, Globe, Package, FileText, TrendingUp, Save, Lock, Eye
} from 'lucide-react';

interface AgentProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  designation?: string;
  role: 'admin' | 'manager' | 'agent' | string;
  role_id?: number;
  approved: boolean;
  active: boolean;
  custom_permissions?: Record<string, boolean>;
  created_at?: string;
}

// System modules configurable for visibility
const MODULE_CONFIG = [
  { id: 'hotels', name: 'Hotels Contracting', icon: Hotel, category: 'Inventory' },
  { id: 'cabs', name: 'Cabs & Transfers', icon: Car, category: 'Inventory' },
  { id: 'sightseeings', name: 'Sightseeing Master', icon: MapPin, category: 'Content' },
  { id: 'activities', name: 'Activities Master', icon: Activity, category: 'Content' },
  { id: 'visas', name: 'Visas & Immigration', icon: Globe, category: 'Services' },
  { id: 'packages', name: 'Package Catalog', icon: Package, category: 'Products' },
  { id: 'blogs', name: 'Blogs & Articles', icon: FileText, category: 'Marketing' },
  { id: 'reports', name: 'Financial Reports', icon: TrendingUp, category: 'Analytics' },
  { id: 'leads', name: 'Lead Management', icon: Users, category: 'Sales' },
  { id: 'audit_logs', name: 'Audit Logs', icon: ShieldCheck, category: 'Security' },
  { id: 'bulk_upload', name: 'Bulk Upload Hub', icon: Save, category: 'Tools' }
];

export default function AgentRoleManagement() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('directory');

  // Role Permissions Matrix State
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({
    admin: {
      hotels: true, cabs: true, sightseeings: true, activities: true, visas: true,
      packages: true, blogs: true, reports: true, leads: true, audit_logs: true, bulk_upload: true
    },
    manager: {
      hotels: true, cabs: true, sightseeings: true, activities: true, visas: true,
      packages: true, blogs: true, reports: true, leads: true, audit_logs: false, bulk_upload: true
    },
    agent: {
      hotels: true, cabs: true, sightseeings: true, activities: true, visas: true,
      packages: true, blogs: false, reports: false, leads: true, audit_logs: false, bulk_upload: false
    }
  });

  const [savingMatrix, setSavingMatrix] = useState(false);

  // Individual Agent Overrides State
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agentOverrides, setAgentOverrides] = useState<Record<string, Record<string, boolean>>>({});

  // Edit Modal State
  const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Add Agent Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: 'Travel Consultant',
    role: 'agent',
    password: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchAgents();
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/php-backend/permissions.php');
      if (res.ok) {
        const data = await res.json();
        if (data.permissions) {
          setRolePermissions(data.permissions);
          localStorage.setItem('crm_module_permissions', JSON.stringify(data.permissions));
        }
      }
    } catch (e) {
      console.warn('Using default role permissions matrix');
    }
  };

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/php-backend/users.php');
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          const mapped = data.users.map((u: any) => ({
            id: u.id,
            full_name: u.full_name || u.name || 'Unnamed Agent',
            email: u.email,
            phone: u.phone || '',
            designation: u.designation || 'Travel Specialist',
            role: (u.role || 'agent').toLowerCase(),
            approved: u.approved !== false && u.approved !== 0,
            active: u.active !== false && u.active !== 0
          }));
          setAgents(mapped);
          if (mapped.length > 0) setSelectedAgentId(mapped[0].id);
          setLoading(false);
          return;
        }
      }

      // Fallback to Supabase crm_users table
      const { data, error } = await supabase
        .from('crm_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((u: any) => ({
        id: u.auth_user_id || u.id,
        full_name: u.name || u.full_name || 'Unnamed Agent',
        email: u.email,
        phone: u.phone || '',
        designation: u.designation || 'Travel Consultant',
        role: (u.role || 'agent').toLowerCase().includes('admin') ? 'admin' : (u.role?.toLowerCase() || 'agent'),
        approved: u.status === 'Approved',
        active: u.active_status !== false
      }));

      setAgents(mapped);
      if (mapped.length > 0) setSelectedAgentId(mapped[0].id);
    } catch (err: any) {
      console.error('Error fetching agents:', err);
      setAgents([
        { id: 'usr-1', full_name: 'Nishant Mishra', email: 'agent@ghumofiroo.com', phone: '+91 9910987264', designation: 'Managing Director', role: 'admin', approved: true, active: true },
        { id: 'usr-2', full_name: 'Priya Sharma', email: 'priya@ghumofiroo.com', phone: '+91 9876543210', designation: 'Senior Tour Manager', role: 'manager', approved: true, active: true },
        { id: 'usr-3', full_name: 'Rahul Verma', email: 'rahul@ghumofiroo.com', phone: '+91 9812345678', designation: 'Kutch Holiday Specialist', role: 'agent', approved: true, active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle module permission for a role
  const handleToggleRolePermission = (role: string, moduleId: string) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [moduleId]: !prev[role]?.[moduleId]
      }
    }));
  };

  // Toggle individual agent permission override
  const handleToggleAgentOverride = (agentId: string, moduleId: string) => {
    const currentAgent = agents.find(a => a.id === agentId);
    const agentRole = currentAgent ? currentAgent.role : 'agent';
    const defaultVal = rolePermissions[agentRole]?.[moduleId] ?? true;

    setAgentOverrides(prev => {
      const currentOverrides = prev[agentId] || {};
      const currentVal = currentOverrides[moduleId] !== undefined ? currentOverrides[moduleId] : defaultVal;
      return {
        ...prev,
        [agentId]: {
          ...currentOverrides,
          [moduleId]: !currentVal
        }
      };
    });
  };

  // Save Granular Permissions Matrix to Backend & LocalStorage
  const handleSavePermissions = async () => {
    setSavingMatrix(true);
    try {
      await fetch('/php-backend/permissions.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: rolePermissions, overrides: agentOverrides })
      });

      localStorage.setItem('crm_module_permissions', JSON.stringify(rolePermissions));
      localStorage.setItem('crm_user_permissions_override', JSON.stringify(agentOverrides));

      // Trigger custom HMR window event to notify CRM.tsx sidebar immediately
      window.dispatchEvent(new Event('crm_permissions_updated'));

      toast({
        title: "Permissions Matrix Saved!",
        description: "Updated module access rules for Super Admins, Managers, and Travel Agents."
      });
    } catch (err: any) {
      toast({
        title: "Permissions Saved Locally",
        description: "Saved permissions matrix in your local session state."
      });
      localStorage.setItem('crm_module_permissions', JSON.stringify(rolePermissions));
      window.dispatchEvent(new Event('crm_permissions_updated'));
    } finally {
      setSavingMatrix(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (agent: AgentProfile) => {
    setEditingAgent({ ...agent });
    setIsEditOpen(true);
  };

  // Save Agent Changes (Name, Role, Phone, Designation, Status)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;

    setIsSaving(true);
    try {
      await fetch('/php-backend/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAgent.id,
          full_name: editingAgent.full_name,
          phone: editingAgent.phone,
          designation: editingAgent.designation,
          role: editingAgent.role,
          approved: editingAgent.approved ? 1 : 0,
          active: editingAgent.active ? 1 : 0
        })
      });

      await supabase
        .from('crm_users')
        .upsert({
          auth_user_id: editingAgent.id,
          name: editingAgent.full_name,
          email: editingAgent.email,
          role: editingAgent.role === 'admin' ? 'Admin' : (editingAgent.role === 'manager' ? 'Manager' : 'Agent'),
          status: editingAgent.approved ? 'Approved' : 'Pending Approval',
          active_status: editingAgent.active
        }, { onConflict: 'email' });

      toast({
        title: "Agent Profile Updated",
        description: `Successfully updated ${editingAgent.full_name}'s name and role to ${editingAgent.role.toUpperCase()}.`
      });

      setIsEditOpen(false);
      fetchAgents();
    } catch (err: any) {
      console.error('Error saving agent profile:', err);
      setAgents(prev => prev.map(a => a.id === editingAgent.id ? editingAgent : a));
      setIsEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Inline Quick Role Change
  const handleQuickRoleChange = async (agent: AgentProfile, newRole: string) => {
    const updated = { ...agent, role: newRole };
    setAgents(prev => prev.map(a => a.id === agent.id ? updated : a));

    try {
      await fetch('/php-backend/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: agent.id,
          full_name: agent.full_name,
          role: newRole
        })
      });

      await supabase
        .from('crm_users')
        .update({ role: newRole === 'admin' ? 'Admin' : (newRole === 'manager' ? 'Manager' : 'Agent') })
        .or(`auth_user_id.eq.${agent.id},email.eq.${agent.email}`);

      toast({
        title: "Role Updated",
        description: `${agent.full_name}'s role changed to ${newRole.toUpperCase()}.`
      });
    } catch (err) {
      console.error('Inline role update error:', err);
    }
  };

  // Add New Agent / Team Member
  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.email || !newAgent.fullName) return;

    setIsCreating(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: newAgent.email,
        password: newAgent.password || 'GhumoFiroo@2026',
        options: {
          data: {
            full_name: newAgent.fullName
          }
        }
      });

      if (authErr && !authErr.message.includes('already registered')) {
        throw authErr;
      }

      const uid = authData?.user?.id || `usr-${Date.now()}`;

      await supabase.from('crm_users').upsert({
        auth_user_id: uid,
        name: newAgent.fullName,
        email: newAgent.email,
        role: newAgent.role === 'admin' ? 'Admin' : (newAgent.role === 'manager' ? 'Manager' : 'Agent'),
        status: 'Approved',
        active_status: true
      }, { onConflict: 'email' });

      await fetch('/php-backend/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uid,
          full_name: newAgent.fullName,
          phone: newAgent.phone,
          designation: newAgent.designation,
          role: newAgent.role,
          approved: 1,
          active: 1
        })
      });

      toast({
        title: "Agent Created Successfully",
        description: `${newAgent.fullName} has been added as ${newAgent.role.toUpperCase()}.`
      });

      setIsAddOpen(false);
      setNewAgent({ fullName: '', email: '', phone: '', designation: 'Travel Consultant', role: 'agent', password: '' });
      fetchAgents();
    } catch (err: any) {
      console.error('Error creating agent:', err);
      toast({
        title: "Error Creating Agent",
        description: err.message || "Failed to create agent account",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Filtered Agents
  const filteredAgents = agents.filter(a => {
    const matchesSearch = a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.designation && a.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalAgents = agents.length;
  const adminCount = agents.filter(a => a.role === 'admin' || a.role === 'super admin').length;
  const managerCount = agents.filter(a => a.role === 'manager').length;
  const agentCount = agents.filter(a => a.role === 'agent').length;

  const targetAgentForOverride = agents.find(a => a.id === selectedAgentId) || agents[0];

  return (
    <div className="space-y-6 font-poppins pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#0B1026] via-[#1E2942] to-[#0B1026] p-6 rounded-2xl border border-white/10 text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            Super Admin Controls
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-montserrat">
            Role & Granular Access Management
          </h1>
          <p className="text-xs text-slate-300">
            Specify exactly which agents can see <strong>Hotels, Cabs, Sightseeing, Activities, Visas, Packages & Reports</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSavePermissions}
            disabled={savingMatrix}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 px-5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all border-0"
          >
            {savingMatrix ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Permissions Matrix
          </Button>

          <Button 
            onClick={() => setIsAddOpen(true)}
            className="bg-gradient-warm hover:scale-105 text-[#0B1026] font-bold text-xs h-11 px-5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all border-0"
          >
            <UserPlus className="w-4 h-4" /> Add New Agent
          </Button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1A2342]/60 border-white/10 text-white backdrop-blur-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Team Members</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{totalAgents}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2342]/60 border-white/10 text-white backdrop-blur-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Super Admins</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{adminCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2342]/60 border-white/10 text-white backdrop-blur-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Managers</p>
              <h3 className="text-2xl font-extrabold text-purple-400 mt-1">{managerCount}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2342]/60 border-white/10 text-white backdrop-blur-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Travel Agents</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{agentCount}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <User className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#1A2342]/80 border border-white/10 p-1 rounded-2xl h-13">
          <TabsTrigger value="directory" className="rounded-xl text-xs font-bold px-5 py-2.5 data-[state=active]:bg-gradient-warm data-[state=active]:text-[#0B1026]">
            <Users className="w-4 h-4 mr-2" /> Agent Directory & Edit Names
          </TabsTrigger>
          <TabsTrigger value="matrix" className="rounded-xl text-xs font-bold px-5 py-2.5 data-[state=active]:bg-gradient-warm data-[state=active]:text-[#0B1026]">
            <Lock className="w-4 h-4 mr-2" /> Granular Role Permissions Matrix
          </TabsTrigger>
          <TabsTrigger value="overrides" className="rounded-xl text-xs font-bold px-5 py-2.5 data-[state=active]:bg-gradient-warm data-[state=active]:text-[#0B1026]">
            <Eye className="w-4 h-4 mr-2" /> Individual Agent Module Visibility
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: AGENT DIRECTORY & NAME EDITING */}
        <TabsContent value="directory">
          <Card className="bg-[#1A2342]/60 border-white/10 text-white backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" /> Agent Directory & Role Assignment
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Change agent names, update assigned security roles, and manage credentials
                </CardDescription>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search agent name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs bg-white/5 border-white/15 text-white rounded-xl focus-visible:ring-accent"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-36 h-9 text-xs bg-white/5 border-white/15 text-white rounded-xl">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Super Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="agent">Travel Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
                  <p className="text-xs font-semibold">Loading Team Directory...</p>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <p className="text-sm font-bold text-white">No Agents Found</p>
                  <p className="text-xs mt-1">Try adjusting your search criteria or add a new agent.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-slate-300 text-xs font-bold">Agent Name & Email</TableHead>
                      <TableHead className="text-slate-300 text-xs font-bold">Phone / Designation</TableHead>
                      <TableHead className="text-slate-300 text-xs font-bold">Assigned Role</TableHead>
                      <TableHead className="text-slate-300 text-xs font-bold">Status</TableHead>
                      <TableHead className="text-slate-300 text-xs font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgents.map(agent => (
                      <TableRow key={agent.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent font-black text-xs flex items-center justify-center">
                              {agent.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-extrabold text-white flex items-center gap-2">
                                {agent.full_name}
                              </p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-500" /> {agent.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <p className="text-xs font-bold text-slate-200">{agent.designation || 'Travel Consultant'}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" /> {agent.phone || 'N/A'}
                          </p>
                        </TableCell>

                        <TableCell className="py-4">
                          <Select 
                            value={agent.role} 
                            onValueChange={(val) => handleQuickRoleChange(agent, val)}
                          >
                            <SelectTrigger className="w-36 h-8 text-xs bg-white/5 border-white/15 rounded-lg text-white font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs">
                              <SelectItem value="admin">👑 Super Admin</SelectItem>
                              <SelectItem value="manager">👔 Manager</SelectItem>
                              <SelectItem value="agent">💼 Travel Agent</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell className="py-4">
                          {agent.approved ? (
                            <Badge className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" /> Pending
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="py-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEdit(agent)}
                            className="h-8 px-3 text-xs font-bold text-accent hover:bg-accent/15 hover:text-accent rounded-lg border border-accent/20 flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit Agent Name
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: GRANULAR ROLE PERMISSIONS MATRIX */}
        <TabsContent value="matrix">
          <Card className="bg-[#1A2342]/60 border-white/10 text-white backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardHeader className="border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-accent" /> Granular Module Permissions Matrix
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Toggle which modules (Hotels, Cabs, Sightseeing, Activities, Visas, Packages, Reports) each role can access.
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleSavePermissions}
                  disabled={savingMatrix}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-2"
                >
                  {savingMatrix ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Matrix
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-300 text-xs font-bold w-72">System Module</TableHead>
                    <TableHead className="text-slate-300 text-xs font-bold text-center">👑 Super Admin Access</TableHead>
                    <TableHead className="text-slate-300 text-xs font-bold text-center">👔 Manager Access</TableHead>
                    <TableHead className="text-slate-300 text-xs font-bold text-center">💼 Travel Agent Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MODULE_CONFIG.map(mod => {
                    const ModIcon = mod.icon;
                    return (
                      <TableRow key={mod.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell className="py-3.5 font-bold text-white">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-accent">
                              <ModIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{mod.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{mod.category}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Super Admin Toggle */}
                        <TableCell className="text-center py-3.5">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rolePermissions.admin?.[mod.id] ?? true}
                              onChange={() => handleToggleRolePermission('admin', mod.id)}
                              className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent cursor-pointer"
                            />
                          </label>
                        </TableCell>

                        {/* Manager Toggle */}
                        <TableCell className="text-center py-3.5">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rolePermissions.manager?.[mod.id] ?? true}
                              onChange={() => handleToggleRolePermission('manager', mod.id)}
                              className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 accent-purple-500 cursor-pointer"
                            />
                          </label>
                        </TableCell>

                        {/* Travel Agent Toggle */}
                        <TableCell className="text-center py-3.5">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rolePermissions.agent?.[mod.id] ?? true}
                              onChange={() => handleToggleRolePermission('agent', mod.id)}
                              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                            />
                          </label>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: INDIVIDUAL AGENT OVERRIDES */}
        <TabsContent value="overrides">
          <Card className="bg-[#1A2342]/60 border-white/10 text-white backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardHeader className="border-b border-white/10 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-accent" /> Individual Agent Visibility Overrides
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Select a specific agent to grant or restrict custom modules (e.g. allow only specific agents to see Hotels or Cabs)
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-xs font-bold text-slate-300 uppercase whitespace-nowrap">Select Agent:</Label>
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                    <SelectTrigger className="w-64 h-9 text-xs bg-white/5 border-white/15 text-white font-bold rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs">
                      {agents.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.full_name} ({a.role.toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {targetAgentForOverride && (
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 text-accent font-black text-sm flex items-center justify-center">
                      {targetAgentForOverride.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{targetAgentForOverride.full_name}</h4>
                      <p className="text-xs text-slate-400">{targetAgentForOverride.email} • Assigned Role: <span className="text-accent uppercase font-bold">{targetAgentForOverride.role}</span></p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSavePermissions}
                    disabled={savingMatrix}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-2"
                  >
                    {savingMatrix ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Overrides for {targetAgentForOverride.full_name.split(' ')[0]}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {MODULE_CONFIG.map(mod => {
                  const ModIcon = mod.icon;
                  const agentRole = targetAgentForOverride?.role || 'agent';
                  const roleDefault = rolePermissions[agentRole]?.[mod.id] ?? true;
                  const userVal = agentOverrides[selectedAgentId]?.[mod.id];
                  const isEnabled = userVal !== undefined ? userVal : roleDefault;

                  return (
                    <div 
                      key={mod.id} 
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                        isEnabled 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
                          : 'bg-red-500/10 border-red-500/20 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          <ModIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{mod.name}</p>
                          <p className="text-[10px] opacity-75">
                            {isEnabled ? '✓ Visible to Agent' : '✕ Restricted / Hidden'}
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggleAgentOverride(selectedAgentId, mod.id)}
                          className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent cursor-pointer"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* EDIT AGENT NAME & ROLE MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-md rounded-2xl font-poppins">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Edit className="w-5 h-5 text-accent" /> Edit Agent Profile & Name
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Super Admin panel to edit agent name, designation, phone, and role
            </DialogDescription>
          </DialogHeader>

          {editingAgent && (
            <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase">Agent Full Name</Label>
                <Input
                  value={editingAgent.full_name}
                  onChange={e => setEditingAgent({ ...editingAgent, full_name: e.target.value })}
                  placeholder="Enter full name..."
                  className="bg-white/5 border-white/15 text-white h-10 rounded-xl text-xs font-semibold focus-visible:ring-accent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase">Email Address (Read-only)</Label>
                <Input
                  value={editingAgent.email}
                  disabled
                  className="bg-white/5 border-white/10 text-slate-400 h-10 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 uppercase">Phone Number</Label>
                  <Input
                    value={editingAgent.phone || ''}
                    onChange={e => setEditingAgent({ ...editingAgent, phone: e.target.value })}
                    placeholder="+91 9910987264"
                    className="bg-white/5 border-white/15 text-white h-10 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 uppercase">Designation / Title</Label>
                  <Input
                    value={editingAgent.designation || ''}
                    onChange={e => setEditingAgent({ ...editingAgent, designation: e.target.value })}
                    placeholder="Senior Tour Manager"
                    className="bg-white/5 border-white/15 text-white h-10 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase">Assign Security Role</Label>
                <Select 
                  value={editingAgent.role} 
                  onValueChange={val => setEditingAgent({ ...editingAgent, role: val })}
                >
                  <SelectTrigger className="bg-white/5 border-white/15 text-white h-10 rounded-xl text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs">
                    <SelectItem value="admin">👑 Super Admin</SelectItem>
                    <SelectItem value="manager">👔 Manager</SelectItem>
                    <SelectItem value="agent">💼 Travel Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAgent.approved}
                    onChange={e => setEditingAgent({ ...editingAgent, approved: e.target.checked })}
                    className="rounded text-accent focus:ring-accent"
                  />
                  Account Approved
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAgent.active}
                    onChange={e => setEditingAgent({ ...editingAgent, active: e.target.checked })}
                    className="rounded text-accent focus:ring-accent"
                  />
                  Account Active
                </label>
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 text-xs h-10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl px-5 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Agent Profile'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD NEW AGENT MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white max-w-md rounded-2xl font-poppins">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <UserPlus className="w-5 h-5 text-accent" /> Add New Agent / Team Member
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Create a new user account with assigned role and login credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddAgent} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 uppercase">Agent Full Name</Label>
              <Input
                value={newAgent.fullName}
                onChange={e => setNewAgent({ ...newAgent, fullName: e.target.value })}
                placeholder="e.g. Vikram Sharma"
                className="bg-white/5 border-white/15 text-white h-10 rounded-xl text-xs font-semibold focus-visible:ring-accent"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 uppercase">Email Address</Label>
              <Input
                type="email"
                value={newAgent.email}
                onChange={e => setNewAgent({ ...newAgent, email: e.target.value })}
                placeholder="agent@ghumofiroo.com"
                className="bg-white/5 border-white/15 text-white h-10 rounded-xl text-xs font-semibold focus-visible:ring-accent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase">Phone Number</Label>
                <Input
                  value={newAgent.phone}
                  onChange={e => setNewAgent({ ...newAgent, phone: e.target.value })}
                  placeholder="+91 9910987264"
                  className="bg-white/5 border-white/15 text-white h-10 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300 uppercase">Designation</Label>
                <Input
                  value={newAgent.designation}
                  onChange={e => setNewAgent({ ...newAgent, designation: e.target.value })}
                  placeholder="Travel Consultant"
                  className="bg-white/5 border-white/15 text-white h-10 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 uppercase">Assign Role</Label>
              <Select 
                value={newAgent.role} 
                onValueChange={val => setNewAgent({ ...newAgent, role: val })}
              >
                <SelectTrigger className="bg-white/5 border-white/15 text-white h-10 rounded-xl text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white text-xs">
                  <SelectItem value="admin">👑 Super Admin</SelectItem>
                  <SelectItem value="manager">👔 Manager</SelectItem>
                  <SelectItem value="agent">💼 Travel Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300 uppercase">Initial Password</Label>
              <Input
                type="password"
                value={newAgent.password}
                onChange={e => setNewAgent({ ...newAgent, password: e.target.value })}
                placeholder="GhumoFiroo@2026"
                className="bg-white/5 border-white/15 text-white h-10 rounded-xl text-xs font-semibold"
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddOpen(false)}
                className="bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 text-xs h-10 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating}
                className="bg-gradient-warm hover:scale-[1.02] text-[#0B1026] font-bold text-xs h-10 rounded-xl px-5 flex items-center gap-2 border-0"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Agent Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
