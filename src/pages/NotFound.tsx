import { Link } from "react-router-dom"
import { AppShell } from "../components/layout/AppShell"
import { Button } from "../components/ui/Button"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <AppShell>
      <div className="w-full flex flex-col items-center justify-center min-h-[70vh] animate-slide-up text-center px-4">
        {/* Glitchy 404 */}
        <div className="relative mb-8 select-none">
          <span className="text-[7rem] font-black text-text/5 leading-none">404</span>
          <span className="absolute inset-0 flex items-center justify-center text-[7rem] font-black gradient-text leading-none opacity-80">
            404
          </span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 glass-card border border-border/50 rounded-2xl flex items-center justify-center mb-6">
          <Search className="w-7 h-7 text-muted opacity-50" />
        </div>

        <h1 className="text-2xl font-extrabold text-text mb-2">Page Not Found</h1>
        <p className="text-muted text-sm max-w-xs leading-relaxed mb-8">
          The page you're looking for doesn't exist, has been moved, or the URL might be wrong.
        </p>

        <div className="flex items-center gap-3">
          <Link to="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-card border border-border/50 text-sm font-medium text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </AppShell>
  )
}
