import { useState, useMemo } from "react"
import { AppShell } from "../components/layout/AppShell"
import { useActivityLogs } from "../api/queries"
import type { ActivityLog } from "../api/queries"
import {
  History as HistoryIcon, CheckCircle2, PlusCircle,
  Play, Pause, Share2, Pin, Trash2,
  Clock, Filter, Download, Search
} from "lucide-react"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import { format, isToday, isYesterday } from "date-fns"
import { cn } from "../lib/utils"

function groupActivities(logs: ActivityLog[]) {
  const map = new Map<string, ActivityLog[]>()
  logs.forEach(log => {
    const d = new Date(log.timestamp)
    let label = format(d, "MMMM d, yyyy")
    if (isToday(d)) label = "Today"
    else if (isYesterday(d)) label = "Yesterday"
    const arr = map.get(label) ?? []
    arr.push(log)
    map.set(label, arr)
  })
  return Array.from(map.entries())
}

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  create_task:   { label: "Created Task",     icon: <PlusCircle className="w-3.5 h-3.5" />,   color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  resume_task:   { label: "Started Ongoing",  icon: <Play className="w-3.5 h-3.5" />,         color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  pause_task:    { label: "Paused Task",      icon: <Pause className="w-3.5 h-3.5" />,        color: "text-muted",       bg: "bg-secondary/40 border-border/40" },
  complete_task: { label: "Completed Task",   icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  share_task:    { label: "Shared Task",      icon: <Share2 className="w-3.5 h-3.5" />,       color: "text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20" },
  create_note:   { label: "Captured Note",    icon: <PlusCircle className="w-3.5 h-3.5" />,   color: "text-primary",     bg: "bg-primary/10 border-primary/20" },
  pin_note:      { label: "Pinned Note",      icon: <Pin className="w-3.5 h-3.5" />,          color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/20" },
  delete_item:   { label: "Deleted Item",     icon: <Trash2 className="w-3.5 h-3.5" />,       color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
}

export default function History() {
  const { data: logs, isLoading } = useActivityLogs()
  const [filterAction, setFilterAction] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLogs = useMemo(() => {
    return (logs ?? []).filter(item => {
      const matchesFilter = filterAction === "all" || item.action === filterAction
      const matchesSearch = !searchQuery.trim() ||
        item.entity_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [logs, filterAction, searchQuery])

  const grouped = useMemo(() => groupActivities(filteredLogs), [filteredLogs])

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute("href", dataStr)
    dlAnchor.setAttribute("download", `reminex_history_${format(new Date(), "yyyyMMdd")}.json`)
    dlAnchor.click()
  }

  return (
    <AppShell>
      <div className="w-full space-y-6 animate-slide-up pb-8 max-w-4xl">

        {/* ── Top Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text flex items-center gap-2.5">
              <HistoryIcon className="w-7 h-7 text-primary" /> Activity & Audit Log
            </h1>
            <p className="text-muted text-sm mt-1">
              Chronological log of all workspace events, task execution, shares, and note creation.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={exportJSON} className="text-xs gap-1.5 shrink-0">
            <Download className="w-3.5 h-3.5" /> Export Audit Log
          </Button>
        </div>

        {/* ── Search & Filters Bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search activity log..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            <Filter className="w-3.5 h-3.5 text-muted shrink-0 mr-1" />
            {[
              { id: "all",           label: "All Activity" },
              { id: "create_task",   label: "Tasks" },
              { id: "resume_task",   label: "Ongoing" },
              { id: "complete_task", label: "Completed" },
              { id: "share_task",    label: "Shared" },
              { id: "create_note",   label: "Notes" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterAction(f.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all",
                  filterAction === f.id
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted hover:text-text hover:bg-secondary/30"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grouped Timeline Feed ── */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Clock className="w-6 h-6 animate-spin text-muted" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted">
            <HistoryIcon className="w-10 h-10 opacity-20" />
            <p className="text-sm">No activity recorded matching your filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([dateLabel, items]) => (
              <div key={dateLabel} className="space-y-3">
                {/* Date separator */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{dateLabel}</span>
                  <div className="flex-1 h-px bg-border/30" />
                  <span className="text-[10px] text-muted/60">{items.length} events</span>
                </div>

                {/* Event list */}
                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[17px] before:w-px before:bg-border/30 pl-1 pt-1">
                  {items.map((log, index) => {
                    const config = ACTION_CONFIG[log.action] ?? {
                      label: log.action,
                      icon: <Clock className="w-4 h-4" />,
                      color: "text-muted",
                      bg: "bg-secondary/20"
                    }

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 relative group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Timeline Node */}
                        <div className={cn("relative z-10 p-2 rounded-xl border shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-110", config.bg, config.color)}>
                          {config.icon}
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 min-w-0 p-4 rounded-2xl glass-card border border-border/30 group-hover:border-primary/40 group-hover:shadow-[0_4px_20px_rgba(56,189,248,0.1)] transition-all duration-300">
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">{log.entity_title}</span>
                              <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", config.bg, config.color)}>
                                {config.label}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted/70 shrink-0 flex items-center gap-1 font-semibold">
                              <Clock className="w-3 h-3" />
                              {format(new Date(log.timestamp), "h:mm a")}
                            </span>
                          </div>
                          {log.details && (
                            <p className="text-xs text-muted/80 mt-1.5 leading-relaxed">{log.details}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AppShell>
  )
}
