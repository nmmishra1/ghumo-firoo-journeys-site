import React from 'react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export interface PremiumTimelineProps {
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities?: string[];
  }>;
  className?: string;
}

export const PremiumTimeline: React.FC<PremiumTimelineProps> = ({ itinerary, className = '' }) => {
  if (!itinerary || itinerary.length === 0) return null;

  return (
    <div className={`max-w-3xl mx-auto space-y-12 ${className}`}>
      {itinerary.map((item, idx) => (
        <ScrollReveal key={idx} variant="fade-in-up" className="flex gap-0 items-start relative">
          {/* Left: dot + day label + connector line */}
          <div className="w-[100px] flex-shrink-0 flex flex-col items-center relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A25A] to-[#D8B97A] flex items-center justify-center text-[11px] font-extrabold text-[#0B1026] shadow-[0_0_0_4px_rgba(201,162,90,0.15),0_0_20px_rgba(201,162,90,0.2)]">
              D{item.day}
            </div>
            <div className="text-[9px] font-extrabold tracking-[0.12em] uppercase text-[#C9A25A] mt-1.5 text-center">
              Day {item.day}
            </div>
            {/* Connector line — hide on last item */}
            {idx < itinerary.length - 1 && (
              <div className="absolute left-1/2 top-[52px] bottom-[-48px] w-px bg-gradient-to-b from-[rgba(201,162,90,0.4)] to-[rgba(201,162,90,0.05)] -translate-x-1/2" />
            )}
          </div>
          
          {/* Right: content card */}
          <div className="flex-1 pl-5 pb-12 last:pb-0">
            <div className="bg-[rgba(26,35,66,0.5)] border border-[rgba(201,162,90,0.15)] rounded-xl p-4 hover:border-[rgba(201,162,90,0.35)] transition-colors">
              
              {/* Optional arrival/departure badge */}
              {idx === 0 && (
                <div className="inline-flex items-center gap-1 bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.2)] text-[#34d399] text-[9px] font-bold px-2 py-0.5 rounded-full mb-2">
                  ✈ Arrival Day
                </div>
              )}
              {idx === itinerary.length - 1 && (
                <div className="inline-flex items-center gap-1 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#f87171] text-[9px] font-bold px-2 py-0.5 rounded-full mb-2">
                  🏠 Departure Day
                </div>
              )}
              
              <h3 className="text-sm font-display font-bold text-white mb-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-[11px] text-[rgba(255,255,255,0.5)] leading-relaxed font-light">
                {item.description}
              </p>
              
              {/* Activity pills */}
              {item.activities && item.activities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.activities.map((act, i) => (
                    <span key={i} className="text-[9px] font-semibold px-2 py-1 rounded-md bg-[rgba(201,162,90,0.1)] border border-[rgba(201,162,90,0.2)] text-[#C9A25A]">
                      {act}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
};

export default PremiumTimeline;
