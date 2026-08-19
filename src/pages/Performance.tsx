import { useMemo } from "react"
import { AppShell } from "../components/layout/AppShell"
import { useMemories, useReminders } from "../api/queries"
import { Loader2, BarChart3, Target, Flame, Award, TrendingUp, CheckCircle2 } from "lucide-react"
import { format, subDays, eachDayOfInterval, parseISO, isSameDay, startOfDay } from "date-fns"

// ── Pure SVG Bar Chart ──
function BarChart({ data, color = "#fbbf24" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 h-24 w-full">
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full flex flex-col justify-end h-20 relative">
              {d.value > 0 && (
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color }}
                >
                  {d.value}
                </div>
              )}
              <div
                className="w-full rounded-t-sm transition-all duration-500 ease-out"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: color,
                  opacity: d.value === 0 ? 0.15 : 0.85,
                  minHeight: d.value > 0 ? 4 : 2,
                }}
              />
            </div>
            <span className="text-[9px] text-muted">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Donut Ring Chart ──
function DonutChart({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
  const pct = total === 0 ? 0 : value / total
  const radius = 36
  const circ = 2 * Math.PI * radius
  const dash = circ * pct
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="48" cy="48" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-text">{value}</span>
          <span className="text-[9px] text-muted">{label}</span>
        </div>
      </div>
    </div>
  )
}

// ── Streak Heatmap (12 weeks) ──
function StreakHeatmap({ data }: { data: Record<string, number> }) {
  const today = startOfDay(new Date())
  const days = eachDayOfInterval({ start: subDays(today, 83), end: today }) // 12 weeks
  const weeks: Date[][] = []
  let week: Date[] = []
  days.forEach(d => {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  })
  if (week.length > 0) weeks.push(week)

  const maxVal = Math.max(...Object.values(data), 1)

  return (
    <div className="flex gap-1 overflow-x-auto">
      {weeks.map((w, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {w.map(day => {
            const key = format(day, "yyyy-MM-dd")
            const val = data[key] ?? 0
            const intensity = val / maxVal
            return (
              <div
                key={key}
                title={`${format(day, "MMM d")}: ${val} notes`}
                className="w-3 h-3 rounded-[2px] transition-all duration-300"
                style={{
                  backgroundColor: val === 0
                    ? "rgba(255,255,255,0.05)"
                    : `rgba(251,191,36,${0.15 + intensity * 0.85})`,
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function Performance() {
  const { data: memories, isLoading: memoriesLoading } = useMemories()
  const { data: reminders, isLoading: remindersLoading } = useReminders()

  const isLoading = memoriesLoading || remindersLoading

  // 7-day activity
  const sevenDayData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
    return days.map(day => ({
      label: format(day, "EEE"),
      value: (memories ?? []).filter(m => isSameDay(parseISO(m.created_at), day)).length,
    }))
  }, [memories])

  // Heatmap data
  const heatmapData = useMemo(() => {
    const map: Record<string, number> = {}
    ;(memories ?? []).forEach(m => {
      const key = format(parseISO(m.created_at), "yyyy-MM-dd")
      map[key] = (map[key] ?? 0) + 1
    })
    return map
  }, [memories])

  const totalNotes = memories?.length ?? 0
  const completedTasks = (reminders ?? []).filter(r => r.completed).length
  const pendingTasks = (reminders ?? []).filter(r => !r.completed).length
  const totalTasks = completedTasks + pendingTasks
  const streak = memories
    ? [...new Set(memories.map(m => new Date(m.created_at).toDateString()))].length
    : 0

  const productivityScore = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const stats = [
    { label: "Notes Captured", value: totalNotes, icon: <TrendingUp className="w-5 h-5" />, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
    { label: "Tasks Completed", value: completedTasks, icon: <Target className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Day Streak", value: streak, icon: <Flame className="w-5 h-5" />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Productivity", value: `${productivityScore}%`, icon: <Award className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  ]

  return (
    <AppShell>
      <div className="w-full space-y-8 animate-slide-up pb-8">

        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-text">Performance</h1>
          <p className="text-muted text-sm">Your productivity at a glance.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
              {stats.map((stat, i) => (
                <div key={i} className={`p-5 rounded-xl border glass-card card-hover animate-slide-up ${stat.bg}`}>
                  <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* 7-day bar chart */}
              <div className="lg:col-span-2 glass-card border border-border/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-text">Notes This Week</h3>
                </div>
                <BarChart data={sevenDayData} color="#fbbf24" />
                <p className="text-[11px] text-muted">
                  {sevenDayData.reduce((s, d) => s + d.value, 0)} notes captured in the last 7 days
                </p>
              </div>

              {/* Task completion donuts */}
              <div className="glass-card border border-border/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-text">Task Completion</h3>
                </div>
                <div className="flex justify-around pt-2">
                  <DonutChart value={completedTasks} total={totalTasks} color="#3b82f6" label="done" />
                  <DonutChart value={pendingTasks} total={totalTasks} color="#f97316" label="pending" />
                </div>
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-[10px] text-muted">Completed</p>
                    <p className="text-xs font-bold text-blue-400">{completedTasks}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted">Pending</p>
                    <p className="text-xs font-bold text-orange-400">{pendingTasks}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Streak Heatmap ── */}
            <div className="glass-card border border-border/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-bold text-text">Activity Heatmap</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted">
                  Less
                  {[0.05, 0.3, 0.55, 0.8, 1].map(o => (
                    <span key={o} className="w-3 h-3 rounded-[2px] inline-block" style={{ backgroundColor: `rgba(251,191,36,${o})` }} />
                  ))}
                  More
                </div>
              </div>
              <div className="overflow-x-auto">
                <StreakHeatmap data={heatmapData} />
              </div>
              <p className="text-[11px] text-muted">
                Last 12 weeks of note-taking activity
              </p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
