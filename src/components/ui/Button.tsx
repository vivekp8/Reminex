import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "gradient" | "danger"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] cursor-pointer"
    
    const variants = {
      default: "bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500 text-slate-950 hover:shadow-[0_0_24px_rgba(56,189,248,0.45)] shadow-md font-bold hover:brightness-105",
      gradient: "bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 text-white hover:shadow-[0_0_24px_rgba(139,92,246,0.45)] shadow-md font-bold",
      outline: "border border-white/15 bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.09] hover:border-primary/50 text-text hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]",
      ghost: "hover:bg-white/10 text-muted hover:text-text",
      danger: "bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/50",
      link: "text-primary underline-offset-4 hover:underline active:scale-100",
    }
    
    const sizes = {
      default: "h-10 px-5 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-2xl px-7 text-base",
      icon: "h-10 w-10 p-0",
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
