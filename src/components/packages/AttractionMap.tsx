import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Info } from "lucide-react"

export interface MapPinData {
  name: string
  lat: number
  lng: number
  description: string
  // position on our SVG relative canvas: x% and y%
  x: number 
  y: number
}

export interface AttractionMapProps {
  pins: MapPinData[]
  centerName?: string
}

export function AttractionMap({ pins, centerName = "Tent City Dhordo" }: AttractionMapProps) {
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(pins[0] || null)

  return (
    <Card variant="luxury" className="overflow-hidden bg-[#0B1026] text-white border border-[#C9A25A]/10">
      <CardContent className="p-0 grid grid-cols-1 lg:grid-cols-3 min-h-[450px]">
        {/* Interactive SVG Vector Map Panel */}
        <div className="lg:col-span-2 relative bg-[#060a1a] p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#C9A25A]/10 overflow-hidden">
          {/* Abstract styled grid map overlay */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A25A_1px,transparent_1px),linear-gradient(to_bottom,#C9A25A_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,90,0.06),transparent_70%)] pointer-events-none" />

          {/* SVG Map Canvas */}
          <div className="relative w-full max-w-lg aspect-[4/3] border border-white/5 bg-[#0B1026]/40 rounded-luxury-md shadow-inner flex items-center justify-center">
            {/* Draw grid outlines */}
            <svg className="absolute inset-0 w-full h-full text-[#C9A25A]/20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 150 L 500 150 M 250 0 L 250 400" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
              {/* Abstract decorative Kutch salt flats coastline contour */}
              <path d="M 50 100 Q 150 80 250 120 T 450 140" fill="none" stroke="#C9A25A/30" strokeWidth="1" />
            </svg>

            {/* Pins */}
            {pins.map((pin) => {
              const isSelected = selectedPin?.name === pin.name
              return (
                <button
                  key={pin.name}
                  onClick={() => setSelectedPin(pin)}
                  className="absolute group transition-transform duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                >
                  {/* Pin Pulse Glow */}
                  <span className={`absolute inset-0 rounded-full bg-[#C9A25A] opacity-75 animate-ping duration-1000 ${isSelected ? "scale-150" : "scale-75 group-hover:scale-100"}`} />
                  {/* Pin Dot */}
                  <div className={`relative h-8 w-8 rounded-full flex items-center justify-center border shadow-lg transition-colors duration-300 ${isSelected ? "bg-[#C9A25A] border-white text-[#0B1026] scale-110" : "bg-[#0B1026] border-[#C9A25A]/50 text-[#C9A25A] hover:bg-[#C9A25A] hover:text-[#0B1026]"}`}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  {/* Pin Label tooltip (Visible on Hover) */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[9px] font-semibold text-white rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                    {pin.name}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Location Info Box Panel */}
        <div className="p-8 flex flex-col justify-between space-y-6 bg-[#0B1026]/90 relative z-10">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-[#C9A25A] font-semibold font-display flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> Attraction Designer Info
            </span>
            {selectedPin ? (
              <div className="space-y-3 animate-fade-in">
                <h3 className="text-xl font-display text-white font-normal">{selectedPin.name}</h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  {selectedPin.description}
                </p>
                <div className="pt-2 text-[10px] text-slate-400 font-poppins space-y-1">
                  <div>Latitude: {selectedPin.lat.toFixed(4)}° N</div>
                  <div>Longitude: {selectedPin.lng.toFixed(4)}° E</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 font-light italic">
                Select an attraction on the vector map to view coordinates.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col space-y-2">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-display">
              Regional Center Anchor
            </div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {centerName}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export default AttractionMap
