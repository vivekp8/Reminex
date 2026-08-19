import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:scale-105"
    
    const variants = {
      default: "bg-primary text-black hover:bg-primary-hover hover:glow-primary shadow-md",
      outline: "border border-border bg-surface/50 backdrop-blur-md hover:bg-secondary hover:border-primary/50 text-text hover:glow-border",
      ghost: "hover:bg-secondary hover:text-text text-text hover:shadow-sm",
      link: "text-primary underline-offset-4 hover:underline hover:scale-100 active:scale-100", // No scale for link
    }
    
    const sizes = {
      default: "h-10 px-5 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-xl px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
