import React from 'react';
import { 
  Phone, Mail, MessageSquare, PlusCircle, AlertCircle, 
  FileText, CheckCircle2, RefreshCw, HelpCircle, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface TimelineEvent {
  id: string;
  time: string;
  type: 'creation' | 'call' | 'email' | 'whatsapp' | 'quote' | 'revision' | 'status' | 'booking' | 'note';
  title: string;
  description: string;
  agent?: string;
  duration?: string;
  badge?: string;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'creation':
        return <PlusCircle className="h-4 w-4 text-blue-500" />;
      case 'call':
        return <Phone className="h-4 w-4 text-emerald-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-indigo-500" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'quote':
        return <FileText className="h-4 w-4 text-amber-500" />;
      case 'revision':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'status':
        return <AlertCircle className="h-4 w-4 text-cyan-500" />;
      case 'booking':
        return <CheckCircle2 className="h-4 w-4 text-teal-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const getBgColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'creation': return 'bg-blue-500/10 border-blue-500/20';
      case 'call': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'email': return 'bg-indigo-500/10 border-indigo-500/20';
      case 'whatsapp': return 'bg-green-500/10 border-green-500/20';
      case 'quote': return 'bg-amber-500/10 border-amber-500/20';
      case 'revision': return 'bg-purple-500/10 border-purple-500/20';
      case 'status': return 'bg-cyan-500/10 border-cyan-500/20';
      case 'booking': return 'bg-teal-500/10 border-teal-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <Card className="border-white/5 bg-[#0B1026] text-white shadow-luxury-lg overflow-hidden">
      <CardHeader className="border-b border-white/5 py-4">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-200">Activity Timeline</CardTitle>
        <CardDescription className="text-xs text-slate-400">Chronological history of all client communications & edits.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {events.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No activity logged for this lead yet.
          </div>
        ) : (
          <div className="relative border-l border-white/10 pl-6 ml-2 space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative group">
                {/* Timeline dot */}
                <div className={`absolute -left-[35px] top-0.5 rounded-full p-1.5 border ${getBgColor(event.type)} flex items-center justify-center bg-[#0B1026] z-10 transition-transform group-hover:scale-110 duration-200`}>
                  {getIcon(event.type)}
                </div>

                {/* Event block */}
                <div className="bg-[#1A2342]/30 hover:bg-[#1A2342]/50 border border-white/5 p-4 rounded-xl space-y-1.5 transition-all duration-300">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-xs font-bold text-slate-200">{event.title}</h4>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">{event.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 text-left">{event.description}</p>
                  
                  {(event.agent || event.duration || event.badge) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {event.agent && (
                        <span className="text-[10px] text-muted-foreground">
                          Agent: <strong className="text-slate-300 font-semibold">{event.agent}</strong>
                        </span>
                      )}
                      {event.duration && (
                        <Badge variant="outline" className="text-[9px] px-2 py-0.5 border-white/10 text-slate-400">
                          {event.duration}
                        </Badge>
                      )}
                      {event.badge && (
                        <Badge className="text-[9px] px-2 py-0.5 bg-accent/20 text-accent hover:bg-accent/30 border-none">
                          {event.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
