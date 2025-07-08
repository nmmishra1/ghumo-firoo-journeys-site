import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Phone, Mail, Users, TrendingUp, MessageCircle, UserPlus, Filter, Search, Upload, AlertTriangle, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { CommentsDialog } from '@/components/crm/CommentsDialog';
import { UserManagementDialog } from '@/components/crm/UserManagementDialog';
import { LeadForm } from '@/components/crm/LeadForm';
import { CSVImport } from '@/components/crm/CSVImport';
import { DashboardStats } from '@/components/crm/DashboardStats';

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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'table' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('all');
  const [prospectFilter, setProspectFilter] = useState<string>('all');
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedLeadForComments, setSelectedLeadForComments] = useState<{ id: string; name: string } | null>(null);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

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
  }, [leads, searchTerm, statusFilter, assignedToFilter, customerTypeFilter, prospectFilter]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profile",
        variant: "destructive"
      });
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
        
      if (error) throw error;
      setProfiles(data || []);
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
    
    if (assignedToFilter !== 'all') {
      filtered = filtered.filter(lead => lead.assigned_to === assignedToFilter);
    }
    
    if (customerTypeFilter !== 'all') {
      filtered = filtered.filter(lead => lead.customer_type === customerTypeFilter);
    }
    
    if (prospectFilter !== 'all') {
      filtered = filtered.filter(lead => lead.lead_prospect === prospectFilter);
    }
    
    setFilteredLeads(filtered);
  };

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

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
        
        // Send WhatsApp welcome message if contact number exists
        if (leadData.contact_number) {
          const message = `Welcome to Ghumo Firoo Travels! 🌟 Thank you for your interest in our travel packages. Our team will contact you soon to help plan your perfect journey. For immediate assistance, call us at 9910987264 or 9870229792.`;
          
          try {
            await supabase.functions.invoke('whatsapp-webhook', {
              body: {
                phone: leadData.contact_number,
                message: message,
                leadId: null
              }
            });
          } catch (error) {
            console.error('WhatsApp message failed:', error);
          }
        }
      }

      fetchLeads();
      setLeadFormOpen(false);
      setEditingLead(null);
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
    setEditingLead(lead || null);
    setLeadFormOpen(true);
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      
      fetchLeads();
      toast({ title: "Success", description: "Lead status updated successfully" });
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive"
      });
    }
  };

  const openCommentsDialog = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLeadForComments({ id: lead.id, name: lead.customer_name });
      setCommentsDialogOpen(true);
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'Contacted': return 'bg-yellow-500';
      case 'Quote Sent': return 'bg-purple-500';
      case 'Quote Approved': return 'bg-indigo-500';
      case 'Converted': return 'bg-green-500';
      case 'Dropped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAssignedUserName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned';
    const profile = profiles.find(p => p.id === assignedTo);
    return profile?.full_name || 'Unknown';
  };

  // Calculate user-specific stats
  const userLeads = userProfile?.role === 'admin' ? leads : leads.filter(l => l.assigned_to === user?.id);
  const nextCallsCount = userLeads.filter(l => l.next_call_time && new Date(l.next_call_time) > new Date()).length;
  
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    quoteSent: leads.filter(l => l.status === 'Quote Sent').length,
    quoteApproved: leads.filter(l => l.status === 'Quote Approved').length,
    converted: leads.filter(l => l.status === 'Converted').length,
    dropped: leads.filter(l => l.status === 'Dropped').length,
    hot: leads.filter(l => l.lead_prospect === 'Hot').length,
    cold: leads.filter(l => l.lead_prospect === 'Cold').length,
    assigned: userLeads.length,
    nextCalls: nextCallsCount
  };

  // Check if user is approved
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-4">Please log in to access the Travel CRM dashboard.</p>
              <Button onClick={() => window.location.href = '/auth'}>Login</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (userProfile && !userProfile.approved && userProfile.role !== 'admin') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4">Account Pending Approval</h2>
              <p className="text-gray-600 mb-4">Your account is awaiting admin approval. Please contact your administrator to gain access to the CRM system.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Travel CRM Dashboard</h1>
              <p className="text-gray-600">Manage your travel leads and customer relationships</p>
            </div>
            <div className="flex gap-2">
              {userProfile?.role === 'admin' && (
                <>
                  <Button variant="outline" onClick={() => setCsvImportOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button variant="outline" onClick={() => setUserManagementOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </>
              )}
              <Button onClick={() => openLeadForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Lead
              </Button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <DashboardStats userRole={userProfile?.role || 'user'} stats={stats} />

          {/* Filters and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads by name, email, phone, or enquiry number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
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
              
              {userProfile?.role === 'admin' && (
                <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                  <SelectTrigger className="w-40">
                    <User className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Assigned To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="">Unassigned</SelectItem>
                    {profiles.filter(p => p.approved).map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name || 'Unnamed User'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Customer Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Direct Customer">Direct Customer</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Insta">Instagram</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={prospectFilter} onValueChange={setProspectFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prospect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prospects</SelectItem>
                  <SelectItem value="Hot">Hot</SelectItem>
                  <SelectItem value="Cold">Cold</SelectItem>
                </SelectContent>
              </Select>
              
              <Tabs value={currentView} onValueChange={(value: string) => setCurrentView(value as 'table' | 'kanban')}>
                <TabsList>
                  <TabsTrigger value="table">Table</TabsTrigger>
                  <TabsTrigger value="kanban">Pipeline</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Main Content */}
          {currentView === 'table' ? (
            <Card>
              <CardHeader>
                <CardTitle>Leads ({filteredLeads.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading leads...</div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No leads match your filters' 
                        : 'No leads found. Add your first lead to get started!'
                      }
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Enquiry #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prospect</TableHead>
                        <TableHead>Next Call</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            {lead.enquiry_number || '-'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{lead.customer_name}</div>
                              {lead.travel_interest && (
                                <div className="text-sm text-muted-foreground truncate max-w-32">
                                  {lead.travel_interest}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {lead.contact_number && (
                                <div className="flex items-center text-sm">
                                  <Phone className="w-3 h-3 mr-1" />
                                  <span>{lead.contact_number}</span>
                                </div>
                              )}
                              {lead.email && (
                                <div className="flex items-center text-sm">
                                  <Mail className="w-3 h-3 mr-1" />
                                  <span className="truncate max-w-32">{lead.email}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{lead.customer_type || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              <span className="text-sm">{getAssignedUserName(lead.assigned_to)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(lead.status)} text-white text-xs`}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {lead.lead_prospect && (
                              <Badge variant={lead.lead_prospect === 'Hot' ? 'destructive' : 'secondary'}>
                                {lead.lead_prospect}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {lead.next_call_time && (
                              <div className="flex items-center text-sm">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{new Date(lead.next_call_time).toLocaleString()}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openCommentsDialog(lead.id)}
                              >
                                <MessageCircle className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openLeadForm(lead)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-[600px]">
              {loading ? (
                <div className="text-center py-8">Loading leads...</div>
              ) : (
                <KanbanBoard 
                  leads={filteredLeads}
                  onEditLead={openLeadForm}
                  onStatusChange={handleStatusChange}
                  onAddComment={openCommentsDialog}
                />
              )}
            </div>
          )}
        </div>

        {/* Lead Form */}
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

        {/* CSV Import */}
        <CSVImport
          isOpen={csvImportOpen}
          onClose={() => setCsvImportOpen(false)}
          onImportComplete={fetchLeads}
        />

        {/* Comments Dialog */}
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

        {/* User Management Dialog */}
        <UserManagementDialog 
          isOpen={userManagementOpen}
          onClose={() => setUserManagementOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default CRM;