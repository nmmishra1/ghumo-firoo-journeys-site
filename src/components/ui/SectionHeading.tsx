import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  kicker?: string
  title: string
  subtitle?: string
  align?: "left" | "center" | "right"
  kickerClassName?: string
  titleClassName?: string
  subtitleClassName?: string
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "center",
  className,
  kickerClassName,
  titleClassName,
  subtitleClassName,
  ...props
}: SectionHeadingProps) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }

  return (
    <div
      className={cn("flex flex-col space-y-3 max-w-3xl", alignmentClasses[align], className)}
      {...props}
    >
      {kicker && (
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A25A] font-display animate-fade-in",
            kickerClassName
          )}
        >
          {kicker}
        </span>
      )}
      <h2
        className={cn(
          "text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white dark:text-white leading-tight tracking-wide drop-shadow-md",
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "text-sm md:text-base text-slate-300 font-sans max-w-2xl leading-relaxed font-light",
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
      <div className="w-12 h-[1px] bg-[#C9A25A] mt-4 rounded-full" />
    </div>
  )
}
