import React from 'react';

export interface PackageVariant {
  id: string;
  label: string;          // "5N/6D Classic"
  nights: number;         // 5
  days: number;           // 6
  tag?: string;           // "Most Popular" | "Best Value"
  pricePerPerson: number; // 26500
  hotelCategory: string;  // "3 Star" | "4 Star" | "5 Star"
  groupSize?: string;
  inclusions: string[];
  exclusions: string[];
  hotels: Array<{
    name: string;
    location: string;
    stars: number;
    highlight: string;
  }>;
  excursions: Array<{
    name: string;
    description: string;
    duration: string;
    price?: string;
    included: boolean;
  }>;
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities?: string[];
  }>;
}

export interface PackageVariantSelectorProps {
  variants: PackageVariant[];
  activeId: string;
  onChange: (id: string) => void;
}

export const PackageVariantSelector: React.FC<PackageVariantSelectorProps> = ({
  variants,
  activeId,
  onChange,
}) => {
  return (
    <div className="sticky top-0 z-40 bg-[#0B1026] border-b border-[#C9A25A]/20 py-3 px-4 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => onChange(v.id)}
              className={`
                flex-shrink-0 flex items-center gap-3
                px-4 py-2.5 rounded-xl border 
                transition-all duration-200 text-left
                ${activeId === v.id
                  ? 'bg-[#C9A25A] text-[#0B1026] border-[#C9A25A] shadow-lg'
                  : 'bg-[#1A2342] text-white/70 border-white/10 hover:border-[#C9A25A]/40 hover:text-white'
                }
              `}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold tracking-tight">
                    {v.label}
                  </span>
                  {v.tag && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      activeId === v.id 
                        ? 'bg-[#0B1026]/20 text-[#0B1026]'
                        : 'bg-[#C9A25A]/20 text-[#C9A25A]'
                    }`}>
                      {v.tag}
                    </span>
                  )}
                </div>
                <div className={`text-[11px] mt-0.5 font-bold ${
                  activeId === v.id ? 'text-[#0B1026]' : 'text-[#C9A25A]'
                }`}>
                  ₹{v.pricePerPerson.toLocaleString('en-IN')}/person
                </div>
                <div className={`text-[10px] mt-0.5 font-medium ${
                  activeId === v.id 
                    ? 'text-[#0B1026]/80' 
                    : 'text-slate-400'
                }`}>
                  {v.hotelCategory}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Quick stats of active variant */}
        {(() => {
          const active = variants.find((v) => v.id === activeId);
          if (!active) return null;
          return (
            <div className="flex gap-4 mt-2.5 text-[10px] text-white/50 overflow-x-auto">
              <span>📅 {active.nights}N/{active.days}D</span>
              <span>🏨 {active.hotelCategory}</span>
              <span>👥 {active.groupSize || '2-15 People'}</span>
              <span>✓ {active.inclusions.length} inclusions</span>
              <span>🎯 {active.excursions.filter((e) => e.included).length} excursions</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default PackageVariantSelector;
