import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-white/20 bg-white/[0.04] backdrop-blur-xl px-4 py-2 text-sm text-text placeholder:text-muted/60 shadow-inner transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 focus:bg-white/[0.07]",
          "hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50",
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
