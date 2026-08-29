import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

interface DeleteLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => void;
  leadName: string;
  isDeleting?: boolean;
}

export const DeleteLeadModal: React.FC<DeleteLeadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  leadName,
  isDeleting = false
}) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    if (reason === 'Other' && !notes.trim()) return;
    onConfirm(reason, notes);
  };

  const isSubmitDisabled = !reason || (reason === 'Other' && !notes.trim()) || isDeleting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Lead
          </DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to delete the lead for <span className="font-semibold text-foreground">{leadName}</span>? This action is a soft-delete and the lead can be restored by an administrator.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reason">Deletion Reason <span className="text-red-500">*</span></Label>
            <Select value={reason} onValueChange={(val) => { setReason(val); if (val !== 'Other') setNotes(''); }} required>
              <SelectTrigger id="reason" className="bg-background">
                <SelectValue placeholder="Select reason for deletion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Duplicate Lead">Duplicate Lead</SelectItem>
                <SelectItem value="Wrong Information">Wrong Information</SelectItem>
                <SelectItem value="Test Lead">Test Lead</SelectItem>
                <SelectItem value="Spam Lead">Spam Lead</SelectItem>
                <SelectItem value="Created By Mistake">Created By Mistake</SelectItem>
                <SelectItem value="Customer Request">Customer Request</SelectItem>
                <SelectItem value="Other">Other (Please specify)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              Comments {reason === 'Other' ? <span className="text-red-500">*</span> : <span className="text-muted-foreground">(Optional)</span>}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={reason === 'Other' ? "Please specify the reason for deletion..." : "Add any additional details or context..."}
              rows={3}
              required={reason === 'Other'}
              className="bg-background"
            />
          </div>

          <DialogFooter className="pt-4 flex gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitDisabled}>
              {isDeleting ? 'Deleting...' : 'Delete Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
