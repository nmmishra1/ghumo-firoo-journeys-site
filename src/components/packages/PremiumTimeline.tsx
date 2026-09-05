import React from 'react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export function cleanMojibakeText(str: any): string {
  if (typeof str !== 'string') return String(str || '');
  return str
    // Right arrows (UTF-8 E2 86 92 misdecoded as Windows-1252 or Mac Roman)
    .replace(/ÔåÆ/g, '→')
    .replace(/â†’/g, '→')
    .replace(/&rarr;/gi, '→')
    .replace(/->/g, '→')
    // Em & En Dashes (E2 80 94 / E2 80 93)
    .replace(/ÔÇö/g, '—')
    .replace(/â€”/g, '—')
    .replace(/ÔÇô/g, '–')
    .replace(/â€“/g, '–')
    // Quotes (E2 80 99 / E2 80 98 / E2 80 9C / E2 80 9D)
    .replace(/ÔÇÖ/g, "’")
    .replace(/â€™/g, "’")
    .replace(/ÔÇÿ/g, "‘")
    .replace(/â€˜/g, "‘")
    .replace(/ÔÇ£/g, '“')
    .replace(/â€œ/g, '“')
    .replace(/ÔÇØ/g, '”')
    .replace(/â€/g, '”')
    // Bullets & Ellipsis
    .replace(/ÔÇª/g, '…')
    .replace(/â€¦/g, '…')
    .replace(/â€¢/g, '•')
    // Currency & Specials
    .replace(/â‚¹/g, '₹')
    .replace(/Â₹/g, '₹')
    .replace(/Â/g, '')
    .trim();
}

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
    <div className={`max-w-3xl mx-auto space-y-8 ${className}`}>
      {itinerary.map((item, idx) => (
        <div key={idx} className="flex gap-0 items-start relative">
          {/* Left: dot + day label + connector line */}
          <div className="w-[70px] sm:w-[90px] flex-shrink-0 flex flex-col items-center relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A25A] to-[#D8B97A] flex items-center justify-center text-xs font-extrabold text-[#0B1026] shadow-[0_0_0_4px_rgba(201,162,90,0.25),0_0_15px_rgba(201,162,90,0.3)]">
              D{item.day}
            </div>
            <div className="text-[10px] font-extrabold tracking-[0.12em] uppercase text-[#C9A25A] mt-1.5 text-center">
              Day {item.day}
            </div>
            {/* Connector line — hide on last item */}
            {idx < itinerary.length - 1 && (
              <div className="absolute left-1/2 top-[52px] bottom-[-32px] w-px bg-gradient-to-b from-[#C9A25A]/60 to-[#C9A25A]/10 -translate-x-1/2" />
            )}
          </div>
          
          {/* Right: content card */}
          <div className="flex-1 pl-4 sm:pl-6 pb-6 last:pb-0">
            <div className="bg-[#0B1226]/95 border border-[#C9A25A]/25 rounded-2xl p-5 hover:border-[#C9A25A]/50 transition-colors shadow-xl">
              
              {/* Optional arrival/departure badge */}
              {idx === 0 && (
                <div className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2.5">
                  ✈ Arrival & Welcome
                </div>
              )}
              {idx === itinerary.length - 1 && itinerary.length > 1 && (
                <div className="inline-flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2.5">
                  🏠 Departure Day
                </div>
              )}
              
              <h3 className="text-base font-display font-bold text-white mb-2 leading-snug">
                {cleanMojibakeText(item.title)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {cleanMojibakeText(item.description)}
              </p>
              
              {/* Activity pills */}
              {item.activities && item.activities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/10">
                  {item.activities.map((act, i) => (
                    <span key={i} className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#C9A25A]/15 border border-[#C9A25A]/30 text-[#E5C378]">
                      ✓ {cleanMojibakeText(act)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PremiumTimeline;
