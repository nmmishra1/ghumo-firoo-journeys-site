import React from "react"
import LazyImage from "@/components/ui/LazyImage"
import { MapPin } from "lucide-react"

export interface AttractionCardProps {
  title: string
  description: string
  image: string
  distance?: string
  destinationTag?: string
  highlights?: string[]
}

export function AttractionCard({ title, description, image, distance, destinationTag, highlights }: AttractionCardProps) {
  return (
    <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover:shadow-2xl transition-all duration-300 group">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <LazyImage src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {distance && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <MapPin className="h-3 w-3 text-[#C9A25A]" /> {distance}
          </div>
        )}
        {destinationTag && (
          <div className="absolute top-3 right-3 bg-[#C9A25A] text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
            <MapPin className="h-3 w-3 text-slate-950" /> {destinationTag}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <h3 className="text-base font-serif font-bold text-white mb-1.5">{title}</h3>
          <p className="text-xs text-slate-300 font-light leading-relaxed">{description}</p>
        </div>
        {highlights && highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
            {highlights.map((hl, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A25A]/10 text-[#C9A25A] font-medium border border-[#C9A25A]/20">
                {hl}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AttractionCard
