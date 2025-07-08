import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

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

type FollowUpEntry = {
  id: string;
  date: string;
  note: string;
};

type Profile = {
  id: string;
  full_name: string;
  role: string;
  approved: boolean;
};

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingLead: Lead | null;
  onSubmit: (leadData: any) => void;
  profiles: Profile[];
  userRole: string | null;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  isOpen,
  onClose,
  editingLead,
  onSubmit,
  profiles,
  userRole
}) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    contact_number: '',
    customer_type: '',
    assigned_to: '',
    tour_description: '',
    call_follow_up: '',
    lead_prospect: '',
    call_summary: '',
    next_call_time: '',
    travel_interest: '',
    discussion_notes: '',
    follow_up_date: '',
    status: 'New' as Lead['status']
  });

  const [followUpEntries, setFollowUpEntries] = useState<FollowUpEntry[]>([]);

  React.useEffect(() => {
    if (editingLead) {
      setFormData({
        customer_name: editingLead.customer_name || '',
        email: editingLead.email || '',
        contact_number: editingLead.contact_number || '',
        customer_type: editingLead.customer_type || '',
        assigned_to: editingLead.assigned_to || '',
        tour_description: editingLead.tour_description || '',
        call_follow_up: editingLead.call_follow_up || '',
        lead_prospect: editingLead.lead_prospect || '',
        call_summary: editingLead.call_summary || '',
        next_call_time: editingLead.next_call_time || '',
        travel_interest: editingLead.travel_interest || '',
        discussion_notes: editingLead.discussion_notes || '',
        follow_up_date: editingLead.follow_up_date || '',
        status: editingLead.status
      });
    } else {
      setFormData({
        customer_name: '',
        email: '',
        contact_number: '',
        customer_type: '',
        assigned_to: '',
        tour_description: '',
        call_follow_up: '',
        lead_prospect: '',
        call_summary: '',
        next_call_time: '',
        travel_interest: '',
        discussion_notes: '',
        follow_up_date: '',
        status: 'New'
      });
    }
  }, [editingLead]);

  const addFollowUpEntry = () => {
    setFollowUpEntries([...followUpEntries, {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      note: ''
    }]);
  };

  const updateFollowUpEntry = (id: string, field: 'date' | 'note', value: string) => {
    setFollowUpEntries(entries => 
      entries.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeFollowUpEntry = (id: string) => {
    setFollowUpEntries(entries => entries.filter(entry => entry.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      followUpEntries,
      email: formData.email || null,
      contact_number: formData.contact_number || null,
      customer_type: formData.customer_type || null,
      assigned_to: formData.assigned_to || null,
      tour_description: formData.tour_description || null,
      call_follow_up: formData.call_follow_up || null,
      lead_prospect: formData.lead_prospect || null,
      call_summary: formData.call_summary || null,
      next_call_time: formData.next_call_time || null,
      travel_interest: formData.travel_interest || null,
      discussion_notes: formData.discussion_notes || null,
      follow_up_date: formData.follow_up_date || null
    });
  };

  const approvedProfiles = profiles.filter(p => p.approved);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogDescription>
            {editingLead ? 'Update the lead information below.' : 'Enter the details for the new travel lead.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="contact_number">Contact Number *</Label>
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
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
              <Label htmlFor="customer_type">Customer Type *</Label>
              <Select value={formData.customer_type} onValueChange={(value) => setFormData({ ...formData, customer_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct Customer">Direct Customer</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Insta">Insta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {userRole === 'admin' && (
              <div>
                <Label htmlFor="assigned_to">Assign To *</Label>
                <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {approvedProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="call_follow_up">Call Follow-up</Label>
              <Select value={formData.call_follow_up} onValueChange={(value) => setFormData({ ...formData, call_follow_up: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select call status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call picked">Call picked</SelectItem>
                  <SelectItem value="Switched off">Switched off</SelectItem>
                  <SelectItem value="Not reachable">Not reachable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="lead_prospect">Lead Prospect</Label>
              <Select value={formData.lead_prospect} onValueChange={(value) => setFormData({ ...formData, lead_prospect: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prospect level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hot">Hot</SelectItem>
                  <SelectItem value="Cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="next_call_time">Next Call Time *</Label>
              <Input
                id="next_call_time"
                type="datetime-local"
                value={formData.next_call_time}
                onChange={(e) => setFormData({ ...formData, next_call_time: e.target.value })}
                required
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
          </div>
          
          <div>
            <Label htmlFor="tour_description">Tour Description</Label>
            <Textarea
              id="tour_description"
              value={formData.tour_description}
              onChange={(e) => setFormData({ ...formData, tour_description: e.target.value })}
              placeholder="Describe the tour requirements..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="call_summary">Call Summary *</Label>
            <Textarea
              id="call_summary"
              value={formData.call_summary}
              onChange={(e) => setFormData({ ...formData, call_summary: e.target.value })}
              placeholder="Summarize the call..."
              rows={3}
              required
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
            <Label htmlFor="discussion_notes">Discussion Notes</Label>
            <Textarea
              id="discussion_notes"
              value={formData.discussion_notes}
              onChange={(e) => setFormData({ ...formData, discussion_notes: e.target.value })}
              placeholder="Add notes about discussions, travel interests, requirements..."
              rows={3}
            />
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
          
          {/* Follow-up / Call Log Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Follow-up / Call Log
                <Button type="button" variant="outline" size="sm" onClick={addFollowUpEntry}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followUpEntries.map((entry) => (
                  <div key={entry.id} className="flex gap-4 items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateFollowUpEntry(entry.id, 'date', e.target.value)}
                      />
                      <div className="md:col-span-2">
                        <Textarea
                          value={entry.note}
                          onChange={(e) => updateFollowUpEntry(entry.id, 'note', e.target.value)}
                          placeholder="Add follow-up note..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFollowUpEntry(entry.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {followUpEntries.length === 0 && (
                  <p className="text-muted-foreground text-sm">No follow-up entries yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingLead ? 'Update Lead' : 'Add Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};