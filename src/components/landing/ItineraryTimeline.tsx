import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Day {
  day: number;
  title: string;
  desc: string;
}

interface ItineraryTimelineProps {
  days: Day[];
}

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ days }) => {
  return (
    <div className="space-y-8">
      {days.map((day, index) => (
        <div key={index} className="relative pl-8 sm:pl-10 group">
          {/* Vertical Line */}
          {index !== days.length - 1 && (
            <div className="absolute left-3 top-8 bottom-[-32px] w-0.5 bg-gray-200 group-hover:bg-blue-200 transition-colors"></div>
          )}
          
          {/* Icon/Number */}
          <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {day.day}
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-lg text-gray-900 mb-2">{day.title}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{day.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItineraryTimeline;
