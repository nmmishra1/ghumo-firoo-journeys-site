import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Phone, Mail, Calendar, Users, TrendingUp, MessageCircle, UserPlus, BarChart3, Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { CommentsDialog } from '@/components/crm/CommentsDialog';
import { UserManagementDialog } from '@/components/crm/UserManagementDialog';

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  travel_interest: string | null;
  discussion_notes: string | null;
  follow_up_date: string | null;
  status: 'New' | 'Contacted' | 'Quote Sent' | 'Quote Approved' | 'Converted' | 'Dropped';
  created_by: string;
  created_at: string;
  updated_at: string;
};

type LeadComment = {
  id: string;
  lead_id: string;
  comment: string;
  created_by: string;
  created_at: string;
};

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'table' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [selectedLeadForComments, setSelectedLeadForComments] = useState<{ id: string; name: string } | null>(null);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ role: string | null } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travel_interest: '',
    discussion_notes: '',
    follow_up_date: '',
    status: 'New' as Lead['status']
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchLeads();
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const filterLeads = () => {
    let filtered = leads;
    
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchTerm))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
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
      setLeads((data || []).map(lead => ({
        ...lead,
        status: lead.status as Lead['status']
      })));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const leadData = {
        ...formData,
        user_id: user.id,
        created_by: user.id,
        email: formData.email || null,
        phone: formData.phone || null,
        travel_interest: formData.travel_interest || null,
        discussion_notes: formData.discussion_notes || null,
        follow_up_date: formData.follow_up_date || null
      };

      if (editingLead) {
        const { error } = await supabase
          .from('leads')
          .update(leadData)
          .eq('id', editingLead.id);

        if (error) throw error;
        toast({ title: "Success", description: "Lead updated successfully" });
      } else {
        const { error } = await supabase
          .from('leads')
          .insert([leadData]);

        if (error) throw error;
        toast({ title: "Success", description: "Lead created successfully" });
        
        // Send WhatsApp welcome message via edge function
        if (formData.phone) {
          const message = `Welcome to Ghumo Firoo Travels! 🌟 Thank you for your interest in our travel packages. Our team will contact you soon to help plan your perfect journey. For immediate assistance, call us at 9910987264 or 9870229792.`;
          
          try {
            await supabase.functions.invoke('whatsapp-webhook', {
              body: {
                phone: formData.phone,
                message: message,
                leadId: null // Will be set after lead creation if needed
              }
            });
          } catch (error) {
            console.error('WhatsApp message failed:', error);
            // Fallback to browser WhatsApp
            window.open(`https://wa.me/91${formData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
          }
        }
      }

      fetchLeads();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lead",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      travel_interest: '',
      discussion_notes: '',
      follow_up_date: '',
      status: 'New'
    });
    setEditingLead(null);
  };

  const openDialog = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        travel_interest: lead.travel_interest || '',
        discussion_notes: lead.discussion_notes || '',
        follow_up_date: lead.follow_up_date || '',
        status: lead.status
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
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
      setSelectedLeadForComments({ id: lead.id, name: lead.name });
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

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    quoteSent: leads.filter(l => l.status === 'Quote Sent').length,
    quoteApproved: leads.filter(l => l.status === 'Quote Approved').length,
    converted: leads.filter(l => l.status === 'Converted').length,
    dropped: leads.filter(l => l.status === 'Dropped').length
  };

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
                <Button variant="outline" onClick={() => setUserManagementOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              )}
              <Button onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Lead
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Total</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-blue-500 rounded-full" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">New</p>
                    <p className="text-xl font-bold text-gray-900">{stats.new}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-yellow-500 rounded-full" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Contacted</p>
                    <p className="text-xl font-bold text-gray-900">{stats.contacted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-purple-500 rounded-full" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Quote Sent</p>
                    <p className="text-xl font-bold text-gray-900">{stats.quoteSent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-indigo-500 rounded-full" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Approved</p>
                    <p className="text-xl font-bold text-gray-900">{stats.quoteApproved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Converted</p>
                    <p className="text-xl font-bold text-gray-900">{stats.converted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-red-500 rounded-full" />
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">Dropped</p>
                    <p className="text-xl font-bold text-gray-900">{stats.dropped}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
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
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Travel Interest</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {lead.email && (
                                <div className="flex items-center text-sm">
                                  <Mail className="w-3 h-3 mr-1" />
                                  <span className="truncate max-w-32">{lead.email}</span>
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center text-sm">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {lead.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground max-w-32 truncate block">
                              {lead.travel_interest || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={lead.status}
                              onValueChange={(value: Lead['status']) => handleStatusChange(lead.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <Badge className={`${getStatusColor(lead.status)} text-white text-xs`}>
                                  {lead.status}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Contacted">Contacted</SelectItem>
                                <SelectItem value="Quote Sent">Quote Sent</SelectItem>
                                <SelectItem value="Quote Approved">Quote Approved</SelectItem>
                                <SelectItem value="Converted">Converted</SelectItem>
                                <SelectItem value="Dropped">Dropped</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString() : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </span>
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
                                onClick={() => openDialog(lead)}
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
                  onEditLead={openDialog}
                  onStatusChange={handleStatusChange}
                  onAddComment={openCommentsDialog}
                />
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Lead Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
              <DialogDescription>
                {editingLead ? 'Update the lead information below.' : 'Enter the details for the new travel lead.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
               <div>
                 <Label htmlFor="travel_interest">Travel Interest</Label>
                 <Input
                   id="travel_interest"
                   value={formData.travel_interest}
                   onChange={(e) => setFormData({ ...formData, travel_interest: e.target.value })}
                   placeholder="Destination preference, travel type, etc."
                 />
               </div>
               <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: Lead['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Quote Sent">Quote Sent</SelectItem>
                      <SelectItem value="Quote Approved">Quote Approved</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Dropped">Dropped</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="discussion_notes">Discussion Notes</Label>
                <Textarea
                  id="discussion_notes"
                  value={formData.discussion_notes}
                  onChange={(e) => setFormData({ ...formData, discussion_notes: e.target.value })}
                  placeholder="Add notes about discussions, travel interests, requirements..."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLead ? 'Update Lead' : 'Add Lead'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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