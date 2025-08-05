import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Send, Trash2 } from 'lucide-react';

type LeadComment = {
  id: string;
  lead_id: string;
  comment: string;
  created_by: string;
  created_at: string;
};

interface CommentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
}

export const CommentsDialog: React.FC<CommentsDialogProps> = ({
  isOpen,
  onClose,
  leadId,
  leadName
}) => {
  const [comments, setComments] = useState<LeadComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && leadId) {
      fetchComments();
    }
  }, [isOpen, leadId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lead_comments')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('lead_comments')
        .insert([{
          lead_id: leadId,
          comment: newComment.trim(),
          created_by: user.id
        }]);

      if (error) throw error;
      
      setNewComment('');
      fetchComments();
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('lead_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      
      fetchComments();
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments for {leadName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {loading ? (
              <div className="text-center py-8">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Add the first comment below.
              </div>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-sm">
                        {comment.created_by === user?.id ? 'You' : 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    {user?.id === comment.created_by && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(comment.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                </Card>
              ))
            )}
          </div>
          
          {/* Add Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};