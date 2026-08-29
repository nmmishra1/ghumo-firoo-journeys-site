import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, MapPin } from "lucide-react"

export interface CountryProgression {
  name: string
  flag?: string
  days: string
  cities: string[]
  color?: string
}

export interface CountryTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  countries: CountryProgression[]
  title?: string
}

export function CountryTimeline({ countries, title = "Tour Country Progression", className, ...props }: CountryTimelineProps) {
  return (
    <div className={cn("w-full max-w-5xl mx-auto space-y-6", className)} {...props}>
      {title && (
        <h4 className="text-xs uppercase tracking-[0.15em] font-display font-extrabold text-[#C9A25A] text-center sm:text-left">
          {title}
        </h4>
      )}

      {/* Horizontal Chain Container */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {countries.map((country, index) => {
          const isLast = index === countries.length - 1
          return (
            <React.Fragment key={index}>
              {/* Country Segment Card */}
              <Card 
                variant="luxury" 
                className={cn(
                  "w-full md:w-auto flex-1 min-w-[240px] border transition-all duration-300",
                  country.color || "border-[#C9A25A]/10 bg-card hover:border-[#C9A25A]/35"
                )}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {country.flag && (
                        <span className="text-lg" aria-hidden="true">
                          {country.flag}
                        </span>
                      )}
                      <h5 className="text-base font-display font-bold text-primary dark:text-foreground">
                        {country.name}
                      </h5>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider bg-[#C9A25A]/15 text-[#C9A25A] px-2 py-0.5 rounded font-display font-semibold">
                      {country.days}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 font-display">
                      <MapPin className="h-3 w-3 text-[#C9A25A]" /> Major Cities
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-355 font-light font-sans line-clamp-1">
                      {country.cities.join(" • ")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Connecting Arrow between segments */}
              {!isLast && (
                <div className="flex items-center justify-center text-[#C9A25A]/40 md:px-2" aria-hidden="true">
                  <ArrowRight className="h-5 w-5 transform rotate-90 md:rotate-0" />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default CountryTimeline
