import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, Calendar, Heart, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface StickyCTAProps extends React.HTMLAttributes<HTMLDivElement> {
  packageName?: string
  priceText?: string
  priceSubtext?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  primaryLabel?: string
  secondaryLabel?: string
  kicker?: string
}

export function StickyCTA({
  packageName = "Royal Rajasthan Sojourn",
  priceText = "₹1,85,000",
  priceSubtext = "per guest • double occupancy",
  onPrimaryClick,
  onSecondaryClick,
  primaryLabel = "Request Bespoke Quote",
  secondaryLabel = "Customize Journey",
  kicker = "Bespoke Journey",
  className,
  ...props
}: StickyCTAProps) {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = React.useState(false)

  const handlePrimaryClick = onPrimaryClick || (() => navigate('/enquire-now'))
  const handleSecondaryClick = onSecondaryClick || (() => navigate('/enquire-now'))

  React.useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-[#0B1026]/95 backdrop-blur-2xl border-t border-amber-500/30 text-white shadow-[0_-12px_40px_rgba(0,0,0,0.7)] py-3.5 transition-all duration-500 transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none",
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl">
        {/* Package & Price Info */}
        <div className="flex items-center justify-between w-full md:w-auto gap-6 border-b md:border-b-0 pb-2 md:pb-0 border-white/10">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-extrabold">
              {kicker}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white line-clamp-1">
              {packageName}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-white/15 hidden md:block" />

          <div className="flex flex-col text-right md:text-left">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {priceText}
              </span>
              <span className="text-[9px] text-amber-300/80 uppercase font-bold tracking-wider">
                Starting from
              </span>
            </div>
            <span className="text-[10px] text-slate-300 font-medium">
              {priceSubtext}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 w-full md:w-auto overflow-x-auto no-scrollbar py-0.5">
          {/* Wishlist Button (Heart) */}
          <button 
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-white/15 transition-colors flex-shrink-0" 
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>

          {/* Customize CTA */}
          <Button
            variant="outline"
            className="h-10 sm:h-11 border border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-bold text-xs px-4 sm:px-5 rounded-xl transition-all flex-shrink-0 flex items-center gap-1.5"
            onClick={handleSecondaryClick}
          >
            <Calendar className="h-3.5 w-3.5" />
            {secondaryLabel}
          </Button>

          {/* Primary Action */}
          <Button
            className="h-10 sm:h-11 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-extrabold text-xs px-5 sm:px-7 rounded-xl shadow-lg transition-all active:scale-95 flex-shrink-0 flex items-center gap-1.5"
            onClick={handlePrimaryClick}
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-950" />
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
