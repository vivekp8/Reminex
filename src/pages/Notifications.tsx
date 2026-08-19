import { useState, useEffect } from "react"
import { AppShell } from "../components/layout/AppShell"
import {
  Info, AlertTriangle, CheckCircle, X, BellOff,
  Check, Moon, Bell, Shield, Sparkles, Clock
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { cn } from "../lib/utils"

interface NotificationItem {
  id: number
  category: "tasks" | "security" | "system" | "ai"
  type: "info" | "alert" | "success"
  title: string
  message: string
  time: string
  read: boolean
}

const INITIAL: NotificationItem[] = [
  { id: 1, category: "tasks",    type: "alert",   title: "Task Due Soon",  message: "Design high-converting Landing Page is due in 4 hours.",  time: "20 mins ago", read: false },
  { id: 2, category: "ai",       type: "info",    title: "AI Daily Summary", message: "You've captured 3 new ideas and maintained a 4-day streak.", time: "2 hours ago",  read: false },
  { id: 3, category: "security", type: "success", title: "Two-Factor Auth Active", message: "Account security upgraded with two-factor verification.", time: "5 hours ago", read: false },
  { id: 4, category: "system",   type: "info",    title: "System Update v1.1", message: "Typography controls & voice-to-text input are now live!", time: "1 day ago",   read: true },
  { id: 5, category: "tasks",    type: "success", title: "Task Completed", message: "Setup production Supabase environment marked as completed.", time: "2 days ago",  read: true },
]

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL)
  const [activeCategory, setActiveCategory] = useState<"all" | "tasks" | "security" | "system" | "ai">("all")
  const [readFilter, setReadFilter] = useState<"all" | "unread">("all")

  // Sleep Mode / DND state
  const [sleepMode, setSleepMode] = useState(false)
  const [desktopPerm, setDesktopPerm] = useState<string>("default")

  useEffect(() => {
    if ('Notification' in window) {
      setDesktopPerm(Notification.permission)
    }
  }, [])

  const requestDesktopNotif = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission()
      setDesktopPerm(res)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = (id: number) =>
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))

  const dismiss = (id: number) =>
    setNotifications(ns => ns.filter(n => n.id !== id))

  const markAllRead = () =>
    setNotifications(ns => ns.map(n => ({ ...n, read: true })))

  const clearRead = () =>
    setNotifications(ns => ns.filter(n => !n.read))

  const filtered = notifications.filter(n => {
    const matchesCategory = activeCategory === "all" || n.category === activeCategory
    const matchesRead = readFilter === "all" || !n.read
    return matchesCategory && matchesRead
  })

  const getIcon = (item: NotificationItem) => {
    if (item.category === "ai") return <Sparkles className="w-4 h-4 text-violet-400" />
    if (item.category === "security") return <Shield className="w-4 h-4 text-emerald-400" />
    if (item.type === "alert") return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    if (item.type === "success") return <CheckCircle className="w-4 h-4 text-emerald-400" />
    return <Info className="w-4 h-4 text-blue-400" />
  }

  return (
    <AppShell>
      <div className="w-full space-y-6 animate-slide-up pb-8 max-w-4xl">

        {/* ── Top Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text">Notifications & Alerts</h1>
            <p className="text-muted text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}` : "All notifications read"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs gap-1.5">
                <Check className="w-3.5 h-3.5" /> Mark All Read
              </Button>
            )}
            {notifications.some(n => n.read) && (
              <Button variant="ghost" size="sm" onClick={clearRead} className="text-xs gap-1.5 text-muted hover:text-red-400">
                <BellOff className="w-3.5 h-3.5" /> Clear Read
              </Button>
            )}
          </div>
        </div>

        {/* ── Sleep Mode (DND) & Desktop Banner ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Sleep Mode / DND */}
          <div className="p-4 rounded-2xl glass-card border border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl border", sleepMode ? "bg-violet-500/20 border-violet-500/30 text-violet-300" : "bg-secondary/30 border-border/30 text-muted")}>
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-text">Sleep Mode (Do Not Disturb)</p>
                <p className="text-[11px] text-muted">{sleepMode ? "Active • Alarms muted until 7:00 AM" : "Quiet hours off"}</p>
              </div>
            </div>
            <button
              onClick={() => setSleepMode(v => !v)}
              className={cn(
                "relative w-10 h-5.5 rounded-full transition-all duration-300",
                sleepMode ? "bg-violet-500" : "bg-secondary/60 border border-border/50"
              )}
              style={{ height: "22px", width: "40px" }}
            >
              <span className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow",
                sleepMode ? "left-5" : "left-0.5"
              )} />
            </button>
          </div>

          {/* Desktop Push Permissions */}
          <div className="p-4 rounded-2xl glass-card border border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-text truncate">Lock & Home Screen Alarms</p>
                <p className="text-[11px] text-muted truncate">{desktopPerm === "granted" ? "Desktop sync active" : "Enable lock-screen popup alarms"}</p>
              </div>
            </div>
            {desktopPerm !== "granted" ? (
              <Button size="sm" variant="outline" onClick={requestDesktopNotif} className="text-xs shrink-0">
                Enable
              </Button>
            ) : (
              <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 shrink-0">
                Active ✓
              </span>
            )}
          </div>
        </div>

        {/* ── Category Filters ── */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-border/30">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all",      label: "All" },
              { id: "tasks",    label: "Tasks & To-dos" },
              { id: "ai",       label: "AI Briefings" },
              { id: "security", label: "Security" },
              { id: "system",   label: "System" },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                  activeCategory === cat.id
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted hover:text-text hover:bg-secondary/20"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setReadFilter(readFilter === "all" ? "unread" : "all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all",
                readFilter === "unread"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "glass-card border-border/40 text-muted hover:text-text"
              )}
            >
              {readFilter === "unread" ? "Showing Unread" : "Filter Unread"}
            </button>
          </div>
        </div>

        {/* ── Notifications List ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted">
            <BellOff className="w-10 h-10 opacity-20" />
            <p className="text-sm">No notifications found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(notif => (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={cn(
                  "flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer group glass-card card-hover",
                  notif.read ? "border-border/20 opacity-60 bg-secondary/5" : "border-border/40 bg-secondary/15"
                )}
              >
                <div className="p-2 rounded-lg bg-background/50 border border-border/30 mt-0.5 shrink-0">
                  {getIcon(notif)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className={cn("text-sm font-bold truncate", notif.read ? "text-muted" : "text-text")}>
                      {notif.title}
                      {!notif.read && <span className="ml-2 w-1.5 h-1.5 bg-primary rounded-full inline-block align-middle" />}
                    </h3>
                    <span className="text-[10px] text-muted shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {notif.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{notif.message}</p>
                </div>

                {/* Dismiss */}
                <button
                  onClick={e => { e.stopPropagation(); dismiss(notif.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-muted hover:text-text hover:bg-secondary/40 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </AppShell>
  )
}
