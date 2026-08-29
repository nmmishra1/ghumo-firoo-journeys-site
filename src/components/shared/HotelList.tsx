import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface HotelCardProps {
  name: string
  image: string
  starRating: number
  location: string
  destinationTag?: string
  amenities: string[]
  priceFrom?: string
}

export interface HotelListProps extends React.HTMLAttributes<HTMLDivElement> {
  hotels: HotelCardProps[]
}

export function HotelCard({ name, image, starRating, location, destinationTag, amenities, priceFrom }: HotelCardProps) {
  return (
    <Card variant="luxury" className="h-full flex flex-col overflow-hidden min-w-[280px] sm:min-w-0 bg-card dark:bg-[#1A2342]/40 border border-border/50 dark:border-white/5 shadow-glass-sm hover:shadow-luxury-sm transition-all duration-300">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          <span>{starRating} Star</span>
        </div>
        {(destinationTag || location) && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#C9A25A] text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-lg tracking-wider">
            <MapPin className="h-3 w-3 text-slate-950" />
            <span>{destinationTag || location}</span>
          </div>
        )}
      </div>
      <CardContent className="p-4 sm:p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h4 className="text-base sm:text-lg font-display font-bold text-primary dark:text-foreground line-clamp-1">
            {name}
          </h4>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-poppins">
            <MapPin className="h-3.5 w-3.5 text-[#C9A25A] flex-shrink-0" />
            <span>{location}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 pt-1">
            {amenities.slice(0, 3).map((amenity, idx) => (
              <Badge key={idx} variant="luxuryOutline" className="text-[9px] py-0 px-1.5 font-normal tracking-normal uppercase-none">
                {amenity}
              </Badge>
            ))}
            {amenities.length > 3 && (
              <Badge variant="luxuryNavy" className="text-[9px] py-0 px-1.5 font-normal">
                +{amenities.length - 3} More
              </Badge>
            )}
          </div>
        </div>

        {priceFrom && (
          <div className="pt-3 border-t border-border/40 dark:border-white/5 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Starting From</span>
            <span className="text-sm sm:text-base font-bold text-[#C9A25A]">{priceFrom}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function HotelList({ hotels, className, ...props }: HotelListProps) {
  return (
    <div className={className} {...props}>
      {/* Mobile: Horizontal scroll row | Desktop: Multi-column Grid */}
      <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:pb-0">
        {hotels.map((hotel, index) => (
          <div key={index} className="flex-shrink-0 w-[290px] sm:w-auto">
            <HotelCard {...hotel} />
          </div>
        ))}
      </div>
    </div>
  )
}
