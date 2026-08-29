import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle } from "lucide-react"

export interface InclusionsExclusionsProps extends React.HTMLAttributes<HTMLDivElement> {
  inclusions: string[]
  exclusions: string[]
}

export function InclusionsExclusions({ inclusions, exclusions, className, ...props }: InclusionsExclusionsProps) {
  const [activeTab, setActiveTab] = React.useState<"inclusions" | "exclusions">("inclusions")

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)} {...props}>
      {/* Mobile Tab Control */}
      <div className="flex border-b border-border/50 dark:border-white/5 md:hidden mb-6">
        <button
          onClick={() => setActiveTab("inclusions")}
          className={cn(
            "flex-1 text-center py-3 text-xs uppercase tracking-wider font-display font-bold border-b-2 transition-all",
            activeTab === "inclusions"
              ? "border-[#C9A25A] text-[#C9A25A]"
              : "border-transparent text-muted-foreground"
          )}
        >
          Inclusions
        </button>
        <button
          onClick={() => setActiveTab("exclusions")}
          className={cn(
            "flex-1 text-center py-3 text-xs uppercase tracking-wider font-display font-bold border-b-2 transition-all",
            activeTab === "exclusions"
              ? "border-[#C9A25A] text-[#C9A25A]"
              : "border-transparent text-muted-foreground"
          )}
        >
          Exclusions
        </button>
      </div>

      {/* Desktop side-by-side or Mobile tabbed content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Inclusions Panel */}
        <div
          className={cn(
            "space-y-4 bg-white/40 dark:bg-[#1A2342]/20 border border-emerald-500/10 p-6 rounded-luxury-md shadow-glass-sm",
            "md:block",
            activeTab === "inclusions" ? "block" : "hidden"
          )}
        >
          <h4 className="text-sm uppercase tracking-[0.15em] font-display font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-[#C9A25A]" /> Package Inclusions
          </h4>
          <ul className="space-y-3">
            {inclusions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-light leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-[#C9A25A] mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions Panel */}
        <div
          className={cn(
            "space-y-4 bg-white/40 dark:bg-[#1A2342]/20 border border-red-500/10 p-6 rounded-luxury-md shadow-glass-sm",
            "md:block",
            activeTab === "exclusions" ? "block" : "hidden"
          )}
        >
          <h4 className="text-sm uppercase tracking-[0.15em] font-display font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2 mb-2">
            <XCircle className="h-4.5 w-4.5 text-red-500" /> Package Exclusions
          </h4>
          <ul className="space-y-3">
            {exclusions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-light leading-relaxed">
                <XCircle className="h-4 w-4 text-red-400/80 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
