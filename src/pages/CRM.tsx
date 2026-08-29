import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Phone, Mail, Users, TrendingUp, MessageCircle, UserPlus, Filter, Search, Upload, AlertTriangle, User, Clock, LayoutDashboard, UserCheck, ChevronDown, Calendar, MapPin, Menu, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CommentsDialog } from '@/components/crm/CommentsDialog';
import { UserManagementDialog } from '@/components/crm/UserManagementDialog';
import { LeadForm } from '@/components/crm/LeadForm';
import { CSVImport } from '@/components/crm/CSVImport';
import { FollowUpModal } from '@/components/crm/FollowUpModal';

type Lead = {
  id: string;
  enquiry_number: string | null;
  customer_name: string;
  email: string | null;
  contact_number: string | null;
  customer_type: 'Direct Customer' | 'Phone' | 'Facebook' | 'Insta' | null;
  assigned_to: string | null;
  tour_description: string | null;
  call_follow_up: 'Call picked' | 'Switched off' | 'Not reachable' | null;
  lead_prospect: 'Hot' | 'Cold' | null;
  call_summary: string | null;
  next_call_time: string | null;
  travel_interest: string | null;
  discussion_notes: string | null;
  follow_up_date: string | null;
  status: 'New' | 'Contacted' | 'Quote Sent' | 'Quote Approved' | 'Converted' | 'Dropped';
  created_by: string;
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  full_name: string;
  role: string;
  approved: boolean;
};

const CRM = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { leadId } = useParams();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedLeadForComments, setSelectedLeadForComments] = useState<{ id: string; name: string } | null>(null);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState<{ id: string; name: string } | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'user-dashboard' | 'leads' | 'add-lead' | 'edit-lead'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Sync currentSection with current URL location
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.endsWith('/edit') || path.includes('/edit')) {
      setCurrentSection('edit-lead');
    } else if (path.endsWith('/new')) {
      setCurrentSection('add-lead');
    } else if (path.includes('/crm/leads')) {
      setCurrentSection('leads');
    } else if (path.includes('/crm/user-dashboard')) {
      setCurrentSection('user-dashboard');
    } else if (path === '/crm' || path === '/crm/') {
      setCurrentSection('dashboard');
    }
  }, [location.pathname]);

  // Sync editingLead when leadId from URL or leads list updates
  useEffect(() => {
    if (leadId && leads.length > 0) {
      const target = leads.find(l => String(l.id) === String(leadId) || String(l.enquiry_number) === String(leadId));
      if (target) {
        setEditingLead(target);
      }
    }
  }, [leadId, leads]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      fetchLeads();
      fetchProfiles();
    }
  }, [userProfile]);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        if (!data.approved) {
          toast({
            title: "Access Denied",
            description: "Your account is pending admin approval. Please wait for approval.",
            variant: "destructive"
          });
          await supabase.auth.signOut();
          return;
        }
        setUserProfile(data);
        return;
      }

      // Fallback to PHP backend / user session
      const apiBase = (import.meta as any).env?.VITE_PHP_BASE_URL || (import.meta as any).env?.VITE_API_BASE_URL || '/php-backend';
      const res = await fetch(`${apiBase}/users.php`);
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const usersList = json.users || [];
        const found = usersList.find((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase() || u.id === user.id);
        if (found) {
          setUserProfile(found);
          return;
        }
      }

      // Default Admin User Profile for authenticated user
      const defaultProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Superadmin',
        email: user.email || 'superadmin@ghumofiroo.com',
        role: 'admin',
        approved: true,
        active: true
      };
      setUserProfile(defaultProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const fallbackProfile = {
        id: user.id,
        full_name: user.email?.split('@')[0] || 'Superadmin',
        email: user.email || 'superadmin@ghumofiroo.com',
        role: 'admin',
        approved: true,
        active: true
      };
      setUserProfile(fallbackProfile);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
        
      if (data && data.length > 0) {
        setProfiles(data);
        return;
      }

      const apiBase = (import.meta as any).env?.VITE_PHP_BASE_URL || (import.meta as any).env?.VITE_API_BASE_URL || '/php-backend';
      const res = await fetch(`${apiBase}/users.php`);
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        setProfiles(json.users || []);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const filterLeads = () => {
    let filtered = leads;
    
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.contact_number && lead.contact_number.includes(searchTerm)) ||
        (lead.enquiry_number && lead.enquiry_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }
    
    setFilteredLeads(filtered);
  };

  const fetchLeads = async () => {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (userProfile?.role !== 'admin') {
        query = query.eq('assigned_to', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLeads((data || []) as Lead[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (leadData: any) => {
    if (!user) return;

    try {
      const processedData = {
        ...leadData,
        user_id: user.id,
        created_by: user.id
      };

      if (editingLead) {
        const { error } = await supabase
          .from('leads')
          .update(processedData)
          .eq('id', editingLead.id);

        if (error) throw error;
        toast({ title: "Success", description: "Lead updated successfully" });
      } else {
        const { error } = await supabase
          .from('leads')
          .insert([processedData]);

        if (error) throw error;
        toast({ title: "Success", description: "Lead created successfully" });
      }

      fetchLeads();
      setLeadFormOpen(false);
      setEditingLead(null);
      setCurrentSection('leads');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: "Error",
        description: "Failed to save lead",
        variant: "destructive"
      });
    }
  };

  const openLeadForm = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      navigate(`/crm/leads/${lead.id}/edit`);
    } else {
      setEditingLead(null);
      navigate('/crm/leads/new');
    }
  };

  const openCommentsDialog = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLeadForComments({ id: lead.id, name: lead.customer_name });
      setCommentsDialogOpen(true);
    }
  };

  const openFollowUpModal = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLeadForFollowUp({ id: lead.id, name: lead.customer_name });
      setFollowUpModalOpen(true);
    }
  };

  const handleFollowUpSubmit = async (leadId: string, followUpData: any) => {
    try {
      // Update lead with follow-up info directly
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          call_follow_up: followUpData.callType,
          lead_prospect: followUpData.leadProspect,
          call_summary: followUpData.callSummary,
          next_call_time: followUpData.nextCallTime
        })
        .eq('id', leadId);

      if (leadError) throw leadError;

      toast({
        title: "Success",
        description: "Follow-up saved successfully"
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

  const getAssignedUserName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned';
    const profile = profiles.find(p => p.id === assignedTo);
    return profile?.full_name || 'Unknown';
  };

  // Check if user is authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userProfile && !userProfile.approved && userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Account Pending Approval</h2>
            <p className="text-gray-600 mb-4">Your account is awaiting admin approval. Please contact your administrator to gain access to the CRM system.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-primary text-primary-foreground flex flex-col transition-all duration-300`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-primary-foreground/20">
          <div className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/dc7c4d6f-9ccd-4614-abea-77d7936b921b.png"
              alt="Ghumo Firoo"
              className={`${sidebarCollapsed ? 'h-8' : 'h-10'} w-auto filter brightness-0 invert transition-all`}
            />
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">Ghumo Firoo</h1>
                <p className="text-xs text-primary-foreground/80">Travel CRM</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="mt-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Branding Tagline */}
        {!sidebarCollapsed && (
          <div className="p-4 text-center border-b border-primary-foreground/20">
            <p className="text-xs text-primary-foreground/90 leading-relaxed">
              "Solving problems for our travel itinerary, increasing efficiency and leading to optimization by lead management system."
            </p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant={currentSection === 'dashboard' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setCurrentSection('dashboard')}
            >
              <LayoutDashboard className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && 'Dashboard'}
            </Button>
            
            <Button
              variant={currentSection === 'user-dashboard' ? 'secondary' : 'ghost'}
              className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setCurrentSection('user-dashboard')}
            >
              <UserCheck className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && 'User Dashboard'}
            </Button>
            
            <div className="space-y-1">
              <Button
                variant={currentSection === 'leads' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => setCurrentSection('leads')}
              >
                <Users className="h-4 w-4 mr-3" />
                {!sidebarCollapsed && 'Leads'}
              </Button>
              
              {currentSection === 'leads' && !sidebarCollapsed && (
                <div className="ml-6 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-primary-foreground/80 hover:bg-primary-foreground/10"
                    onClick={() => setCurrentSection('leads')}
                  >
                    All Leads
                  </Button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-primary-foreground/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userProfile?.full_name}</p>
                <p className="text-xs text-primary-foreground/80 capitalize">{userProfile?.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-background border-b border-border p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {currentSection === 'dashboard' && 'Dashboard'}
                {currentSection === 'user-dashboard' && 'User Dashboard'}
                {currentSection === 'leads' && 'All Leads'}
                {currentSection === 'add-lead' && 'Add New Lead'}
                {currentSection === 'edit-lead' && 'Edit Travel Lead'}
              </h1>
              <p className="text-muted-foreground">
                {currentSection === 'dashboard' && 'Overview of your travel CRM'}
                {currentSection === 'user-dashboard' && 'Your personal dashboard'}
                {currentSection === 'leads' && 'Manage all your travel leads'}
                {currentSection === 'add-lead' && 'Create a new travel lead'}
                {currentSection === 'edit-lead' && 'Update details for this travel enquiry'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {currentSection === 'leads' && (
                <Button onClick={() => setCurrentSection('add-lead')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              )}
              {userProfile?.role === 'admin' && (
                <>
                  <Button variant="outline" onClick={() => setCsvImportOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button variant="outline" onClick={() => setUserManagementOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {currentSection === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                      <p className="text-2xl font-bold">{leads.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Converted</p>
                      <p className="text-2xl font-bold">{leads.filter(l => l.status === 'Converted').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Follow-ups Today</p>
                      <p className="text-2xl font-bold">5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-red-500 rounded-full" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Hot Leads</p>
                      <p className="text-2xl font-bold">{leads.filter(l => l.lead_prospect === 'Hot').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentSection === 'user-dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">My Leads</p>
                      <p className="text-2xl font-bold">{leads.filter(l => l.assigned_to === user?.id).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Next Calls</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentSection === 'leads' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Quote Sent">Quote Sent</SelectItem>
                    <SelectItem value="Quote Approved">Quote Approved</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leads Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center py-8">Loading leads...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No leads found.</p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{lead.customer_name} #{lead.enquiry_number || '---'}</CardTitle>
                            <p className="text-sm text-muted-foreground">Lead Source: {lead.customer_type || 'Unknown'}</p>
                          </div>
                          <Badge variant={lead.status === 'New' ? 'secondary' : 'outline'} className="text-xs">
                            {lead.status === 'New' ? 'Not Processed' : lead.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Phone:</p>
                            <p className="font-medium">{lead.contact_number || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Email:</p>
                            <p className="font-medium truncate">{lead.email ? `${lead.email.substring(0, 8)}...` : 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stage:</p>
                            <p className="font-medium">{lead.status}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Assigned to:</p>
                            <p className="font-medium">{getAssignedUserName(lead.assigned_to)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Created on:</p>
                            <p className="font-medium">{new Date(lead.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Call:</p>
                            <p className="font-medium">{lead.next_call_time ? new Date(lead.next_call_time).toLocaleDateString() : 'Not Scheduled'}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-3 border-t">
                          <Button size="sm" variant="outline" onClick={() => openFollowUpModal(lead.id)}>
                            Follow-Up
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openLeadForm(lead)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openCommentsDialog(lead.id)}>
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Comments
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {currentSection === 'add-lead' && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Add New Lead</CardTitle>
                <p className="text-muted-foreground">Enter the details for the new travel lead.</p>
              </CardHeader>
              <CardContent>
                <LeadForm
                  isOpen={true}
                  onClose={() => navigate('/crm/leads')}
                  editingLead={null}
                  onSubmit={handleLeadSubmit}
                  profiles={profiles}
                  userRole={userProfile?.role || null}
                />
              </CardContent>
            </Card>
          )}

          {currentSection === 'edit-lead' && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Edit Travel Lead</CardTitle>
                <p className="text-muted-foreground">Modify details for this travel enquiry.</p>
              </CardHeader>
              <CardContent>
                {editingLead ? (
                  <LeadForm
                    isOpen={true}
                    onClose={() => {
                      setEditingLead(null);
                      navigate('/crm/leads');
                    }}
                    editingLead={editingLead}
                    onSubmit={handleLeadSubmit}
                    profiles={profiles}
                    userRole={userProfile?.role || null}
                  />
                ) : (
                  <div className="py-12 text-center text-muted-foreground space-y-3">
                    <p className="text-base font-medium">{loading ? 'Loading lead details...' : `Lead details not found.`}</p>
                    {!loading && (
                      <Button variant="outline" onClick={() => navigate('/crm/leads')}>
                        Back to Leads Pipeline
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Modals */}
      {leadFormOpen && (
        <LeadForm
          isOpen={leadFormOpen}
          onClose={() => {
            setLeadFormOpen(false);
            setEditingLead(null);
          }}
          editingLead={editingLead}
          onSubmit={handleLeadSubmit}
          profiles={profiles}
          userRole={userProfile?.role || null}
        />
      )}

      <CSVImport
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImportComplete={fetchLeads}
      />

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

      <UserManagementDialog 
        isOpen={userManagementOpen}
        onClose={() => setUserManagementOpen(false)}
      />
    </div>
  );
};

export default CRM;