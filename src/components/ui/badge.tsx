import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        luxury:
          "border-transparent bg-gradient-to-r from-[#C9A25A] via-[#D8B97A] to-[#C9A25A] text-[#0B1026] hover:brightness-105 shadow-glass-sm font-display tracking-widest text-[9px] uppercase font-bold px-3 py-1",
        luxuryOutline:
          "border-[#C9A25A] text-[#C9A25A] bg-transparent font-display tracking-widest text-[9px] uppercase font-bold px-3 py-1",
        luxuryNavy:
          "border-[#C9A25A]/30 bg-[#0B1026] text-white hover:border-[#C9A25A]/50 font-display tracking-widest text-[9px] uppercase font-bold px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
