import type { ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Archive,
  Settings,
  Menu,
  X,
  Plus,
  Home,
  CheckSquare,
  Calendar,
  FolderOpen,
  Trash2,
  Bot,
  Bell,
  LayoutDashboard,
  TrendingUp,
  User,
  LifeBuoy,
  Info,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  History,
  ArrowLeft,
  ChevronRight,
} from "lucide-react"
import { useUIStore } from "../../store/uiStore"
import { useState } from "react"
import { Button } from "../ui/Button"
import { cn } from "../../lib/utils"
import { useAuthStore } from "../../store/authStore"
import { supabase } from "../../lib/supabase"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { isSidebarOpen, toggleSidebar } = useUIStore()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [desktopVisible, setDesktopVisible] = useState(true)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  // Route title mapping for breadcrumbs
  const routeTitles: Record<string, string> = {
    "/": "Home",
    "/dashboard": "Dashboard",
    "/tasks": "Tasks",
    "/calendar": "Calendar",
    "/projects": "Projects",
    "/chat": "AI Chat",
    "/archive": "Archive",
    "/history": "Activity Log",
    "/timeline": "Timeline",
    "/reminders": "Reminders",
    "/trash": "Trash",
    "/settings": "Settings",
    "/notifications": "Notifications",
    "/performance": "Performance",
    "/profile": "Profile",
    "/support": "Support",
    "/about": "About",
  }

  const currentTitle = routeTitles[location.pathname] || "Workspace"
  const isSubPage = location.pathname !== "/"

  const navGroups = [
    {
      title: "Main",
      items: [
        { icon: Home, label: "Home", path: "/" },
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: CheckSquare, label: "Tasks", path: "/tasks" },
        { icon: Calendar, label: "Calendar", path: "/calendar" },
        { icon: FolderOpen, label: "Projects", path: "/projects" },
        { icon: Bot, label: "AI Chat", path: "/chat" },
      ]
    },
    {
      title: "User",
      items: [
        { icon: Bell, label: "Notifications", path: "/notifications" },
        { icon: TrendingUp, label: "Performance", path: "/performance" },
        { icon: User, label: "Profile", path: "/profile" },
      ]
    },
    {
      title: "Organization",
      items: [
        { icon: Archive, label: "Archive", path: "/archive" },
        { icon: History, label: "Activity Log", path: "/history" },
        { icon: Trash2, label: "Trash", path: "/trash" },
      ]
    },
    {
      title: "System",
      items: [
        { icon: Settings, label: "Settings", path: "/settings" },
        { icon: LifeBuoy, label: "Support", path: "/support" },
        { icon: Info, label: "About", path: "/about" },
      ]
    }
  ]

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "VP"

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex h-14 items-center px-4 shrink-0 border-b border-border/40">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="h-7 w-7 logo-shimmer rounded-lg flex items-center justify-center shadow-lg shrink-0 glow-sm">
            <span className="text-black text-sm font-black tracking-tight">R</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-text truncate">Reminex</h1>
            <p className="text-[10px] text-muted/70 truncate leading-none mt-0.5">Your second brain</p>
          </div>
        </div>
        {/* Desktop close button */}
        <button
          onClick={() => setDesktopVisible(false)}
          className="hidden md:flex items-center justify-center h-7 w-7 rounded-md text-muted hover:text-text hover:bg-secondary/40 transition-colors shrink-0"
          title="Close sidebar"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        {/* Mobile close button */}
        <button
          onClick={toggleSidebar}
          className="flex md:hidden items-center justify-center h-7 w-7 rounded-md text-muted hover:text-text hover:bg-secondary/40 transition-colors shrink-0"
          title="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav Content */}
      <div className="px-2 py-3 flex-1 overflow-y-auto">
        <div className="mb-4">
          <Link
            to="/dashboard"
            onClick={() => isSidebarOpen && toggleSidebar()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all group"
          >
            <Plus className="h-4 w-4 shrink-0 group-hover:rotate-90 transition-transform duration-200" />
            New Note
          </Link>
        </div>

        <div className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-2 text-[10px] font-semibold text-muted/60 mb-1.5 uppercase tracking-widest">
                {group.title}
              </p>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => isSidebarOpen && toggleSidebar()}
                      className={cn(
                        "relative flex items-center space-x-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary/12 text-primary nav-active"
                          : "text-muted hover:bg-white/5 hover:text-text"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted/70"
                      )} />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary glow-sm shrink-0" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* User Footer */}
      <div className="shrink-0 border-t border-border/40 p-3">
        <div className="flex items-center gap-2.5 group">
          <Link
            to="/profile"
            onClick={() => isSidebarOpen && toggleSidebar()}
            className="flex items-center gap-2.5 flex-1 min-w-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-primary">{userInitials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text truncate">Vivek Potnuru</p>
              <p className="text-[10px] text-muted/70 truncate leading-none">{user?.email ?? "vivek@example.com"}</p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-background font-sans text-text antialiased overflow-hidden">

      {/* Mobile Header (only shown when sidebar is closed) */}
      {!isSidebarOpen && (
        <header className="flex h-14 items-center justify-between px-4 md:hidden shrink-0 bg-surface/50 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 logo-shimmer rounded-md flex items-center justify-center shadow-sm">
              <span className="text-black text-xs font-black">R</span>
            </div>
            <h1 className="text-base font-bold">Reminex</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-muted">
            <Menu className="h-5 w-5" />
          </Button>
        </header>
      )}

      {/* Mobile full-screen sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 h-full bg-[#0d0d0f]/98 backdrop-blur-2xl border-r border-border/50 flex flex-col">
            {sidebarContent}
          </div>
          {/* Backdrop — click to close */}
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={toggleSidebar} />
        </div>
      )}

      {/* Desktop Sidebar — conditionally rendered */}
      {desktopVisible && (
        <aside className="hidden md:flex w-60 shrink-0 flex-col bg-[#0d0d0f]/80 backdrop-blur-2xl border-r border-border/40 shadow-2xl h-full">
          {sidebarContent}
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background relative flex flex-col">
        {/* Desktop open button — shown when sidebar is hidden */}
        {!desktopVisible && (
          <button
            onClick={() => setDesktopVisible(true)}
            className="hidden md:flex fixed top-4 left-4 z-30 items-center justify-center h-8 w-8 rounded-lg bg-surface/60 backdrop-blur-xl border border-border/50 text-muted hover:text-primary hover:border-primary/40 transition-all shadow-lg"
            title="Open sidebar"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}

        {/* ── Top Navigation / Breadcrumbs & Back Button ── */}
        {isSubPage && (
          <div className="sticky top-0 z-20 w-full px-4 md:px-8 py-2.5 bg-[#09090b]/80 backdrop-blur-xl border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary/30 hover:bg-secondary/60 text-muted hover:text-text border border-border/40 transition-all card-hover"
                title="Go back to previous page"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="h-4 w-px bg-border/40 mx-1 hidden sm:block" />

              {/* Breadcrumb path */}
              <div className="flex items-center gap-1 text-xs text-muted">
                <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Home className="w-3 h-3" /> Home
                </Link>
                <ChevronRight className="w-3 h-3 text-muted/50" />
                <span className="text-text font-bold text-xs">{currentTitle}</span>
              </div>
            </div>

            {/* Quick Home launcher */}
            <Link
              to="/"
              className="text-[11px] font-semibold text-muted hover:text-primary px-2 py-1 rounded-md hover:bg-secondary/20 transition-colors hidden sm:inline-flex items-center gap-1"
            >
              <Home className="w-3 h-3" /> Cockpit
            </Link>
          </div>
        )}

        <div className="max-w-screen-2xl mx-auto w-full flex-1 flex flex-col p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
