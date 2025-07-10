import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  leadName: string;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leadName
}) => {
  const [formData, setFormData] = useState({
    callType: '',
    leadProspect: '',
    callSummary: '',
    nextCallTime: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({
      callType: '',
      leadProspect: '',
      callSummary: '',
      nextCallTime: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Call Follow-up for {leadName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="callType">Call Type *</Label>
              <Select value={formData.callType} onValueChange={(value) => setFormData({ ...formData, callType: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select call type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call picked">Call Picked</SelectItem>
                  <SelectItem value="Switched off">Switched Off</SelectItem>
                  <SelectItem value="Not reachable">Not Reachable</SelectItem>
                  <SelectItem value="Busy">Busy</SelectItem>
                  <SelectItem value="No answer">No Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="leadProspect">Lead Prospect *</Label>
              <Select value={formData.leadProspect} onValueChange={(value) => setFormData({ ...formData, leadProspect: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select prospect level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hot">Hot</SelectItem>
                  <SelectItem value="Warm">Warm</SelectItem>
                  <SelectItem value="Cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="callSummary">Call Summary *</Label>
            <Textarea
              id="callSummary"
              value={formData.callSummary}
              onChange={(e) => setFormData({ ...formData, callSummary: e.target.value })}
              placeholder="Enter detailed call summary..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="nextCallTime">Next Call Time *</Label>
            <Input
              id="nextCallTime"
              type="datetime-local"
              value={formData.nextCallTime}
              onChange={(e) => setFormData({ ...formData, nextCallTime: e.target.value })}
              required
            />
          </div>

          {/* Follow-up History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Follow-up History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span>19-Jan-25 2:30 PM</span>
                  <span className="text-xs">Call picked - Hot lead</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-muted rounded">
                  <span>18-Jan-25 11:00 AM</span>
                  <span className="text-xs">Switched off - Warm lead</span>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Previous follow-up entries will appear here
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Follow-up
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};