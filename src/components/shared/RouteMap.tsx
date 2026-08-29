import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Info } from "lucide-react"

export interface RouteStop {
  label: string
  description?: string
  lat: number
  lng: number
  day?: string
}

export interface RouteMapProps {
  stops: RouteStop[]
  title?: string
}

export function RouteMap({ stops, title = "Journey Route Map" }: RouteMapProps) {
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(stops[0] || null)

  if (!stops || stops.length === 0) {
    return (
      <Card variant="luxury" className="bg-[#0B1026] text-white p-6 border border-[#C9A25A]/10 text-center">
        No route stops provided.
      </Card>
    )
  }

  // Calculate bounding box for geographic scaling
  const lats = stops.map((s) => s.lat)
  const lngs = stops.map((s) => s.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  const latRange = maxLat - minLat || 0.0001
  const lngRange = maxLng - minLng || 0.0001

  // Scale positions to fit inside 10% to 90% of the SVG canvas (500x375 layout)
  const mappedStops = stops.map((stop) => {
    const x = 10 + ((stop.lng - minLng) / lngRange) * 80 // percentage
    const y = 90 - ((stop.lat - minLat) / latRange) * 80 // percentage (invert for SVG top-down coordinate)
    return { ...stop, x, y }
  })

  // Create connecting path points for SVG polyline
  const polylinePoints = mappedStops.map((stop) => `${(stop.x * 5).toFixed(1)},${(stop.y * 3.75).toFixed(1)}`).join(" ")

  return (
    <Card variant="luxury" className="overflow-hidden bg-[#0B1026] text-white border border-[#C9A25A]/10">
      <CardContent className="p-0 grid grid-cols-1 lg:grid-cols-3 min-h-[450px]">
        {/* Interactive SVG Vector Map Panel */}
        <div className="lg:col-span-2 relative bg-[#060a1a] p-6 sm:p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#C9A25A]/10 overflow-hidden">
          {/* Abstract styled grid map overlay */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A25A_1px,transparent_1px),linear-gradient(to_bottom,#C9A25A_1px,transparent_1px)] bg-[size:30px_30px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,90,0.06),transparent_70%)] pointer-events-none" />

          {/* SVG Map Canvas */}
          <div className="relative w-full max-w-lg aspect-[4/3] border border-white/5 bg-[#0B1026]/40 rounded-luxury-md shadow-inner flex items-center justify-center">
            {/* Draw sequential route line and grid outlines */}
            <svg className="absolute inset-0 w-full h-full text-[#C9A25A]/20 pointer-events-none" viewBox="0 0 500 375" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 187.5 L 500 187.5 M 250 0 L 250 375" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
              {/* Route connecting line */}
              {stops.length > 1 && (
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#C9A25A"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="stroke-[#C9A25A] opacity-70"
                />
              )}
            </svg>

            {/* Stops Pins */}
            {mappedStops.map((stop, index) => {
              const isSelected = selectedStop?.label === stop.label
              return (
                <button
                  key={stop.label}
                  onClick={() => setSelectedStop(stop)}
                  className="absolute group transition-transform duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
                  style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
                >
                  <span className={`absolute inset-0 rounded-full bg-[#C9A25A] opacity-75 animate-ping duration-1000 ${isSelected ? "scale-150" : "scale-75 group-hover:scale-100"}`} />
                  <div className={`relative h-7 w-7 rounded-full flex items-center justify-center border shadow-lg transition-colors duration-300 text-xs font-bold ${isSelected ? "bg-[#C9A25A] border-white text-[#0B1026] scale-110" : "bg-[#0B1026] border-[#C9A25A]/50 text-[#C9A25A] hover:bg-[#C9A25A] hover:text-[#0B1026]"}`}>
                    {index + 1}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-[9px] font-semibold text-white rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                    {stop.day ? `${stop.day}: ` : ""}{stop.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Route Info Box Panel */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#0B1026]/90 relative z-10">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-[#C9A25A] font-semibold font-display flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> Route Stop Details
            </span>
            {selectedStop ? (
              <div className="space-y-3 animate-fade-in">
                {selectedStop.day && (
                  <span className="inline-block text-[9px] uppercase tracking-wider bg-[#C9A25A]/15 text-[#C9A25A] px-2 py-0.5 rounded font-display font-semibold">
                    {selectedStop.day}
                  </span>
                )}
                <h3 className="text-xl font-display text-white font-bold">{selectedStop.label}</h3>
                {selectedStop.description && (
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {selectedStop.description}
                  </p>
                )}
                <div className="pt-2 text-[9px] text-slate-400 font-poppins space-y-1">
                  <div>Latitude: {selectedStop.lat.toFixed(4)}° N</div>
                  <div>Longitude: {selectedStop.lng.toFixed(4)}° E</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400 font-light italic">
                Select a stop on the map to view itinerary coordinates.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col space-y-1.5">
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-display">
              {title}
            </div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {stops.length} Stops Scheduled
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
