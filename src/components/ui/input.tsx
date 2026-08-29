import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, id, name, placeholder, ...props }, ref) => {
    const fallbackName = name || id || (placeholder ? String(placeholder).toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30) : undefined);
    const fallbackId = id || fallbackName;

    return (
      <input
        type={type}
        id={fallbackId}
        name={fallbackName}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
