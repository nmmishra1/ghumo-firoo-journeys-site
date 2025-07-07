import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Edit, MessageCircle } from 'lucide-react';

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

const STATUSES = [
  { key: 'New', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { key: 'Contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'Quote Sent', label: 'Quote Sent', color: 'bg-purple-100 text-purple-800' },
  { key: 'Quote Approved', label: 'Quote Approved', color: 'bg-indigo-100 text-indigo-800' },
  { key: 'Converted', label: 'Converted', color: 'bg-green-100 text-green-800' },
  { key: 'Dropped', label: 'Dropped', color: 'bg-red-100 text-red-800' },
] as const;

interface KanbanBoardProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: Lead['status']) => void;
  onAddComment: (leadId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  leads, 
  onEditLead, 
  onStatusChange,
  onAddComment 
}) => {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Lead['status']) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== newStatus) {
      onStatusChange(draggedLead.id, newStatus);
    }
    setDraggedLead(null);
  };

  const getLeadsByStatus = (status: Lead['status']) => {
    return leads.filter(lead => lead.status === status);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4 h-full">
      {STATUSES.map((status) => (
        <div
          key={status.key}
          className="bg-muted/30 rounded-lg p-4 min-h-[600px]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status.key as Lead['status'])}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">{status.label}</h3>
            <Badge variant="outline" className={status.color}>
              {getLeadsByStatus(status.key as Lead['status']).length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {getLeadsByStatus(status.key as Lead['status']).map((lead) => (
              <Card
                key={lead.id}
                draggable
                onDragStart={(e) => handleDragStart(e, lead)}
                className="cursor-move hover:shadow-md transition-shadow bg-background border-l-4 border-l-primary"
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{lead.name}</h4>
                    
                    {lead.travel_interest && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {lead.travel_interest}
                      </p>
                    )}
                    
                    <div className="space-y-1">
                      {lead.email && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="w-3 h-3 mr-1" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="w-3 h-3 mr-1" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onAddComment(lead.id)}
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onEditLead(lead)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};