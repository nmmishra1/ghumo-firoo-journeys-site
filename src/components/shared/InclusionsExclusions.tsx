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
      <div className="flex border-b border-white/10 md:hidden mb-6">
        <button
          onClick={() => setActiveTab("inclusions")}
          className={cn(
            "flex-1 text-center py-3 text-xs uppercase tracking-wider font-display font-bold border-b-2 transition-all",
            activeTab === "inclusions"
              ? "border-[#C9A25A] text-[#C9A25A]"
              : "border-transparent text-slate-400 hover:text-white"
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
              : "border-transparent text-slate-400 hover:text-white"
          )}
        >
          Exclusions
        </button>
      </div>

      {/* Desktop side-by-side or Mobile tabbed content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Inclusions Panel */}
        <div
          className={cn(
            "space-y-4 bg-[#0B1226]/90 border border-emerald-500/25 p-6 rounded-2xl shadow-xl",
            "md:block",
            activeTab === "inclusions" ? "block" : "hidden"
          )}
        >
          <h4 className="text-sm uppercase tracking-[0.15em] font-display font-bold text-emerald-400 flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Package Inclusions
          </h4>
          <ul className="space-y-3">
            {inclusions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions Panel */}
        <div
          className={cn(
            "space-y-4 bg-[#0B1226]/90 border border-rose-500/25 p-6 rounded-2xl shadow-xl",
            "md:block",
            activeTab === "exclusions" ? "block" : "hidden"
          )}
        >
          <h4 className="text-sm uppercase tracking-[0.15em] font-display font-bold text-rose-400 flex items-center gap-2 mb-3">
            <XCircle className="h-5 w-5 text-rose-400" /> Package Exclusions
          </h4>
          <ul className="space-y-3">
            {exclusions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                <XCircle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
