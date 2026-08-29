import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2, Users, Layers, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';

type Profile = {
  id: string;
  full_name: string | null;
  role: string | null;
  approved: boolean;
  created_at: string;
};

interface UserManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementDialog: React.FC<UserManagementDialogProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'sources'>('users');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newSourceInput, setNewSourceInput] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('digital');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'agent'
  });
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
      fetchSources();
    }
  }, [isOpen]);

  const fetchSources = async () => {
    try {
      const res = await fetch('/php-backend/lead_sources.php');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.sources)) {
        setSources(data.sources);
      }
    } catch (e) {
      console.error('Failed to fetch lead sources:', e);
    }
  };

  const handleAddSource = async () => {
    if (!newSourceInput.trim()) {
      toast({ title: 'Input Required', description: 'Please enter a source name.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/php-backend/lead_sources.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_name: newSourceInput.trim(), category: newSourceCategory })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Success', description: `Lead source "${newSourceInput.trim()}" added to database.` });
        setNewSourceInput('');
        fetchSources();
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to add lead source', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleToggleSourceActive = async (id: number, currentActive: number) => {
    try {
      await fetch('/php-backend/lead_sources.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: currentActive ? 0 : 1 })
      });
      toast({ title: 'Updated', description: 'Lead source status updated' });
      fetchSources();
    } catch (e) {}
  };

  const handleDeleteSource = async (id: number) => {
    try {
      await fetch('/php-backend/lead_sources.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      toast({ title: 'Deleted', description: 'Lead source removed' });
      fetchSources();
    } catch (e) {}
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map((p: any) => ({
        id: p.auth_user_id || p.id,
        full_name: p.name || 'Unknown',
        role: p.role?.toLowerCase().includes('admin') ? 'admin' : (p.role?.toLowerCase() || 'agent'),
        approved: p.status === 'Approved',
        created_at: p.created_at || new Date().toISOString()
      }));
      setProfiles(mapped);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: { full_name: newUser.fullName }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase
          .from('crm_users')
          .upsert({ 
            auth_user_id: authData.user.id,
            email: newUser.email.trim().toLowerCase(),
            name: newUser.fullName,
            role: newUser.role === 'admin' ? 'Admin' : 'Agent',
            status: 'Approved',
            active_status: true
          }, { onConflict: 'email' });
      }

      toast({
        title: "Success",
        description: "Agent user created successfully"
      });
      
      setNewUser({ email: '', password: '', fullName: '', role: 'agent' });
      setIsAddUserOpen(false);
      fetchProfiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('crm_users')
        .update({ role: newRole === 'admin' ? 'Admin' : 'Agent' })
        .or(`auth_user_id.eq.${userId},id.eq.${userId}`);

      if (error) throw error;
      toast({ title: "Success", description: "User role updated successfully" });
      fetchProfiles();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update user role", variant: "destructive" });
    }
  };

  const handleApproveUser = async (userId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('crm_users')
        .update({ 
          status: approved ? 'Approved' : 'Pending Approval',
          active_status: approved
        })
        .or(`auth_user_id.eq.${userId},id.eq.${userId}`);

      if (error) throw error;
      toast({ title: "Success", description: `User ${approved ? 'approved' : 'revoked'} successfully` });
      fetchProfiles();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user approval", variant: "destructive" });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col bg-[#161d2f] text-slate-100 border border-slate-800 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-amber-400">
              <Users className="w-5 h-5 text-amber-400" />
              Settings & Team Management
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium">
              Manage agents, roles, access controls, and dynamic lead sources
            </DialogDescription>
          </DialogHeader>
          
          {/* TABS NAVIGATION */}
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-2 my-3">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" /> Team Members & Agents ({profiles.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sources')}
              className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'sources'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" /> Dynamic Lead Sources ({sources.length})
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'users' ? (
              <>
                <div className="flex justify-between items-center mb-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-300 font-bold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Approved Active Agents: <span className="text-amber-400 font-black">{profiles.filter(p => p.approved).length}</span>
                  </p>
                  <Button size="sm" onClick={() => setIsAddUserOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 h-8">
                    <Plus className="w-4 h-4 mr-1" /> Add Agent
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/50">
                  {loading ? (
                    <div className="text-center py-12 text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Loading users...
                    </div>
                  ) : profiles.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">No CRM users found</div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-slate-950 sticky top-0 z-10 border-b border-slate-800">
                        <TableRow className="border-b border-slate-800 hover:bg-transparent">
                          <TableHead className="text-amber-400 font-extrabold text-xs uppercase">Name</TableHead>
                          <TableHead className="text-amber-400 font-extrabold text-xs uppercase">Role</TableHead>
                          <TableHead className="text-amber-400 font-extrabold text-xs uppercase">Status</TableHead>
                          <TableHead className="text-amber-400 font-extrabold text-xs uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((profile) => (
                          <TableRow key={profile.id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                            <TableCell className="font-bold text-xs text-slate-100">
                              {profile.full_name || 'Unnamed User'}
                            </TableCell>
                            <TableCell>
                              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border uppercase ${
                                profile.role === 'admin' 
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              }`}>
                                {profile.role || 'agent'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {profile.approved ? (
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                  ● Approved
                                </span>
                              ) : (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                  ⏳ Pending
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end items-center">
                                <Select
                                  value={profile.role || 'agent'}
                                  onValueChange={(value) => handleUpdateRole(profile.id, value)}
                                  disabled={profile.id === user?.id}
                                >
                                  <SelectTrigger className="w-28 h-8 text-xs font-bold bg-slate-950 border-slate-700 text-slate-100">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="agent">Agent</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                  </SelectContent>
                                </Select>
                                {profile.id !== user?.id && !profile.approved && (
                                  <Button size="sm" className="h-8 text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-600" onClick={() => handleApproveUser(profile.id, true)}>
                                    Approve
                                  </Button>
                                )}
                                {profile.id !== user?.id && profile.approved && (
                                  <Button size="sm" variant="outline" className="h-8 text-xs font-bold bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700" onClick={() => handleApproveUser(profile.id, false)}>
                                    Revoke
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </>
            ) : (
              /* TAB 2: DYNAMIC LEAD SOURCES MANAGER */
              <div className="flex-1 overflow-hidden flex flex-col space-y-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Input
                    placeholder="Enter new lead source (e.g. Partner Portal, Trade Show, Meta Ads)"
                    value={newSourceInput}
                    onChange={(e) => setNewSourceInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSource(); }}
                    className="h-10 text-xs font-bold bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 flex-1"
                  />
                  <Select value={newSourceCategory} onValueChange={setNewSourceCategory}>
                    <SelectTrigger className="w-44 h-10 text-xs font-bold bg-slate-950 border-slate-800 text-slate-100 focus:border-amber-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="digital">Digital / Web</SelectItem>
                      <SelectItem value="paid">Paid Ads</SelectItem>
                      <SelectItem value="chat">Chat / WhatsApp</SelectItem>
                      <SelectItem value="direct">Direct / Phone</SelectItem>
                      <SelectItem value="referral">Referral / Partner</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleAddSource} className="h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 rounded-xl shadow-md shadow-amber-500/20">
                    <Plus className="w-4 h-4 mr-1" /> Add Source
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/60">
                  <Table>
                    <TableHeader className="bg-slate-950 sticky top-0 z-10 border-b border-slate-800">
                      <TableRow className="border-b border-slate-800 hover:bg-transparent">
                        <TableHead className="text-amber-400 font-extrabold text-xs uppercase tracking-wider">Source Name</TableHead>
                        <TableHead className="text-amber-400 font-extrabold text-xs uppercase tracking-wider">Category</TableHead>
                        <TableHead className="text-amber-400 font-extrabold text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-amber-400 font-extrabold text-xs uppercase tracking-wider text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sources.map((src) => (
                        <TableRow key={src.id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                          <TableCell className="font-bold text-xs text-slate-100">
                            {src.source_name}
                          </TableCell>
                          <TableCell>
                            <span className="capitalize text-xs text-slate-300 font-bold bg-slate-800/80 border border-slate-700 px-2.5 py-0.5 rounded-md">
                              {src.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            {src.is_active ? (
                              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                ● Active
                              </span>
                            ) : (
                              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                ○ Inactive
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end items-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs font-bold bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                                onClick={() => handleToggleSourceActive(src.id, src.is_active)}
                              >
                                {src.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg"
                                onClick={() => handleDeleteSource(src.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md bg-[#161d2f] text-slate-100 border border-slate-800 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="border-b border-slate-800 pb-3">
            <DialogTitle className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add New CRM Agent
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Create a new user account for team operations
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="email" className="text-xs font-bold text-slate-300">Email Address *</Label>
              <Input autoComplete="email"
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                className="h-9 text-xs font-bold bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-xs font-bold text-slate-300">Password *</Label>
              <Input autoComplete="current-password"
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                minLength={6}
                className="h-9 text-xs font-bold bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>
            
            <div>
              <Label htmlFor="fullName" className="text-xs font-bold text-slate-300">Full Name</Label>
              <Input autoComplete="name"
                id="fullName"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                className="h-9 text-xs font-bold bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>
            
            <div>
              <Label htmlFor="role" className="text-xs font-bold text-slate-300">System Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger id="role" className="h-9 text-xs font-bold bg-slate-950 border-slate-800 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="pt-2 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)} className="h-9 text-xs font-bold bg-slate-800 border-slate-700 text-slate-200">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="h-9 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950">
                {submitting ? 'Creating...' : 'Create Agent Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};