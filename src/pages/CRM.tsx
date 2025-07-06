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
import { Plus, Edit, Phone, Mail, Calendar, Users, TrendingUp, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  discussion_notes: string | null;
  follow_up_date: string | null;
  status: 'New' | 'In Progress' | 'Converted' | 'Lost';
  created_at: string;
  updated_at: string;
};

const CRM = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    discussion_notes: '',
    follow_up_date: '',
    status: 'New' as Lead['status']
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

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
        email: formData.email || null,
        phone: formData.phone || null,
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
        
        // Send WhatsApp welcome message
        if (formData.phone) {
          const message = `Welcome to Ghumo Firoo Travels! 🌟 Thank you for your interest in our travel packages. Our team will contact you soon to help plan your perfect journey. For immediate assistance, call us at 9910987264 or 9870229792.`;
          window.open(`https://wa.me/91${formData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
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
        discussion_notes: lead.discussion_notes || '',
        follow_up_date: lead.follow_up_date || '',
        status: lead.status
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Converted': return 'bg-green-500';
      case 'Lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    inProgress: leads.filter(l => l.status === 'In Progress').length,
    converted: leads.filter(l => l.status === 'Converted').length
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
            <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Converted</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">New Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leads Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No leads found. Add your first lead to get started!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Follow-up Date</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center text-sm">
                                <Mail className="w-3 h-3 mr-1" />
                                {lead.email}
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
                          <Badge className={`${getStatusColor(lead.status)} text-white`}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(lead.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openDialog(lead)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
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
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: Lead['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
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
      </div>
    </Layout>
  );
};

export default CRM;