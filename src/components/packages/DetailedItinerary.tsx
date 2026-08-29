import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities?: string[];
}

interface DetailedItineraryProps {
  itinerary: ItineraryDay[];
  themeColor?: 'blue' | 'orange' | 'green' | 'red' | 'purple' | 'teal' | 'rose' | 'amber' | 'indigo';
}

const colorMap = {
  blue: {
    title: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800',
    hover: 'hover:bg-blue-50/50',
    border: 'border-blue-100',
    bullet: 'text-blue-500',
    tag: 'border-blue-100 text-blue-600'
  },
  orange: {
    title: 'text-accent',
    badge: 'bg-accent/10 text-accent',
    hover: 'hover:bg-accent/10/50',
    border: 'border-accent/20',
    bullet: 'text-accent',
    tag: 'border-accent/20 text-accent'
  },
  green: {
    title: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
    hover: 'hover:bg-green-50/50',
    border: 'border-green-100',
    bullet: 'text-green-500',
    tag: 'border-green-100 text-green-600'
  },
  red: {
    title: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
    hover: 'hover:bg-red-50/50',
    border: 'border-red-100',
    bullet: 'text-red-500',
    tag: 'border-red-100 text-red-600'
  },
  purple: {
    title: 'text-purple-800',
    badge: 'bg-purple-100 text-purple-800',
    hover: 'hover:bg-purple-50/50',
    border: 'border-purple-100',
    bullet: 'text-purple-500',
    tag: 'border-purple-100 text-purple-600'
  },
  teal: {
    title: 'text-teal-800',
    badge: 'bg-teal-100 text-teal-800',
    hover: 'hover:bg-teal-50/50',
    border: 'border-teal-100',
    bullet: 'text-teal-500',
    tag: 'border-teal-100 text-teal-600'
  },
  rose: {
    title: 'text-rose-800',
    badge: 'bg-rose-100 text-rose-800',
    hover: 'hover:bg-rose-50/50',
    border: 'border-rose-100',
    bullet: 'text-rose-500',
    tag: 'border-rose-100 text-rose-600'
  },
  amber: {
    title: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-800',
    hover: 'hover:bg-amber-50/50',
    border: 'border-amber-100',
    bullet: 'text-amber-500',
    tag: 'border-amber-100 text-amber-600'
  },
  indigo: {
    title: 'text-indigo-800',
    badge: 'bg-indigo-100 text-indigo-800',
    hover: 'hover:bg-indigo-50/50',
    border: 'border-indigo-100',
    bullet: 'text-indigo-500',
    tag: 'border-indigo-100 text-indigo-600'
  }
};

const DetailedItinerary: React.FC<DetailedItineraryProps> = ({ itinerary, themeColor = 'blue' }) => {
  const colors = colorMap[themeColor] || colorMap.blue;

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle as="h2" className={cn("text-2xl", colors.title)}>Detailed Itinerary</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {itinerary.map((day, index) => (
            <AccordionItem key={index} value={`day-${index}`} className={cn("border-b last:border-0", colors.border)}>
              <AccordionTrigger className={cn("hover:no-underline rounded-lg px-4", colors.hover)}>
                <div className="flex items-center gap-4 text-left">
                  <Badge variant="secondary" className={cn("shrink-0", colors.badge)}>
                    Day {day.day}
                  </Badge>
                  <span className="text-lg font-semibold text-gray-800">
                    {day.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pl-[4.5rem] pb-4">
                <p className="mb-4">{day.description}</p>
                {day.activities && day.activities.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-start gap-2">
                        <span className={cn("mt-1", colors.bullet)}>•</span>
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border text-xs font-medium shadow-sm", colors.tag)}>
                    <Clock className="w-3.5 h-3.5" />
                    Full Day Activity
                  </div>
                  <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border text-xs font-medium shadow-sm", colors.tag)}>
                    <MapPin className="w-3.5 h-3.5" />
                    Sightseeing
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default DetailedItinerary;
