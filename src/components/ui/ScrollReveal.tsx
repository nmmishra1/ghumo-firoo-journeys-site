import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "fade-in" | "fade-in-up" | "fade-in-scale" | "slide-left" | "slide-right"
  delay?: number // in ms
  duration?: "slow" | "medium" | "fast"
}

export function ScrollReveal({
  children,
  variant = "fade-in-up",
  delay = 0,
  duration = "medium",
  className,
  ...props
}: ScrollRevealProps) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before it enters the viewport fully
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const durationClasses = {
    slow: "duration-luxury-slow",
    medium: "duration-luxury-medium",
    fast: "duration-luxury-fast",
  }

  const animationClasses = {
    "fade-in": "opacity-0 translate-y-0 data-[visible=true]:opacity-100",
    "fade-in-up": "opacity-0 translate-y-8 data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0",
    "fade-in-scale": "opacity-0 scale-95 translate-y-4 data-[visible=true]:opacity-100 data-[visible=true]:scale-100 data-[visible=true]:translate-y-0",
    "slide-left": "opacity-0 -translate-x-12 data-[visible=true]:opacity-100 data-[visible=true]:translate-x-0",
    "slide-right": "opacity-0 translate-x-12 data-[visible=true]:opacity-100 data-[visible=true]:translate-x-0",
  }

  return (
    <div
      ref={ref}
      data-visible={isIntersecting}
      className={cn(
        "transition-all ease-luxury-ease",
        durationClasses[duration],
        animationClasses[variant],
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
export default ScrollReveal
