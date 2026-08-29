import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface ItineraryDay {
  day: number
  title: string
  description: string
  image?: string
  highlights?: string[]
}

export interface ItineraryAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  days: ItineraryDay[]
  variant?: "default" | "luxury"
}

export function ItineraryAccordion({ days, variant = "luxury", className, ...props }: ItineraryAccordionProps) {
  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)} {...props}>
      <Accordion type="single" collapsible className="space-y-4">
        {days.map((item) => (
          <AccordionItem
            key={item.day}
            value={`day-${item.day}`}
            className={cn(
              "transition-all duration-300 rounded-luxury-md border px-5 sm:px-6 py-1",
              variant === "luxury"
                ? "bg-card dark:bg-[#1A2342]/40 hover:border-[#C9A25A]/30 border-border/60 dark:border-white/5 hover:shadow-luxury-sm"
                : "bg-background border-border"
            )}
          >
            <AccordionTrigger className="text-base sm:text-lg font-display font-bold text-primary dark:text-foreground hover:text-[#C9A25A] dark:hover:text-[#C9A25A] text-left hover:no-underline py-4 [&[data-state=open]]:text-[#C9A25A] transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider bg-[#C9A25A]/15 text-[#C9A25A] px-2.5 py-1 rounded font-display font-semibold">
                  Day {item.day}
                </span>
                <span className="line-clamp-1">{item.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm text-muted-foreground font-sans font-light leading-relaxed pb-5 pt-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className={cn("space-y-4", item.image ? "md:col-span-8" : "md:col-span-12")}>
                  <p>{item.description}</p>
                  
                  {item.highlights && item.highlights.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs uppercase tracking-wider font-display font-bold text-primary dark:text-foreground">
                        Day Highlights
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-350">
                            <Check className="h-3.5 w-3.5 text-[#C9A25A] mt-0.5 flex-shrink-0" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {item.image && (
                  <div className="md:col-span-4 rounded-luxury-md overflow-hidden aspect-[4/3] w-full border border-border/40 dark:border-white/5 shadow-sm">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
