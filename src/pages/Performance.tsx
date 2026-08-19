import { useMemo } from "react"
import { AppShell } from "../components/layout/AppShell"
import { useMemories, useReminders } from "../api/queries"
import { Loader2, Target, Flame, Award, TrendingUp, CheckCircle2, Zap } from "lucide-react"
import { format, subDays, eachDayOfInterval, parseISO, isSameDay, startOfDay } from "date-fns"

// ── Pure SVG Bar Chart ──
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="w-full flex flex-col justify-end h-20 relative">
              {d.value > 0 && (
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity text-sky-400 bg-sky-500/20 px-1.5 py-0.5 rounded"
                >
                  {d.value}
                </div>
              )}
              <div
                className="w-full rounded-t-md transition-all duration-500 ease-out shadow-sm"
                style={{
                  height: `${heightPct}%`,
                  background: d.value > 0 ? "linear-gradient(180deg, #38bdf8 0%, #6366f1 100%)" : "rgba(255,255,255,0.06)",
                  opacity: d.value === 0 ? 0.2 : 0.95,
                  minHeight: d.value > 0 ? 6 : 3,
                }}
              />
            </div>
            <span className="text-[10px] font-semibold text-muted">{d.label}</span>
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
            className="transition-all duration-700 ease-out shadow-sm"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-text">{value}</span>
          <span className="text-[9px] font-bold text-muted uppercase tracking-wider">{label}</span>
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
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {weeks.map((w, wi) => (
        <div key={wi} className="flex flex-col gap-1.5">
          {w.map(day => {
            const key = format(day, "yyyy-MM-dd")
            const val = data[key] ?? 0
            const intensity = val / maxVal
            return (
              <div
                key={key}
                title={`${format(day, "MMM d")}: ${val} notes captured`}
                className="w-3.5 h-3.5 rounded-[4px] transition-all duration-200 hover:scale-125"
                style={{
                  backgroundColor: val === 0
                    ? "rgba(255,255,255,0.05)"
                    : intensity < 0.35
                    ? "rgba(56, 189, 248, 0.35)"
                    : intensity < 0.7
                    ? "rgba(56, 189, 248, 0.7)"
                    : "rgba(56, 189, 248, 1)",
                  boxShadow: val > 0 ? "0 0 6px rgba(56,189,248,0.4)" : "none"
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
  const { data: memories, isLoading: mLoading } = useMemories()
  const { data: reminders, isLoading: rLoading } = useReminders()

  const isLoading = mLoading || rLoading

  // 7-day memory velocity
  const last7Days = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i)
      const count = (memories ?? []).filter(m => isSameDay(parseISO(m.created_at), d)).length
      return { label: format(d, "EEE"), value: count }
    })
  }, [memories])

  // Heatmap daily data
  const heatmapData = useMemo(() => {
    const map: Record<string, number> = {}
    ;(memories ?? []).forEach(m => {
      const k = format(parseISO(m.created_at), "yyyy-MM-dd")
      map[k] = (map[k] ?? 0) + 1
    })
    return map
  }, [memories])

  // Stats
  const totalNotes = memories?.length ?? 0
  const completedTasks = (reminders ?? []).filter(r => r.completed).length
  const pendingTasks = (reminders ?? []).filter(r => !r.completed).length
  const totalTasks = (reminders ?? []).length
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const streakDays = useMemo(() => {
    if (!memories || memories.length === 0) return 0
    return [...new Set(memories.map(m => new Date(m.created_at).toDateString()))].length
  }, [memories])

  const productivityScore = Math.min(100, Math.round((totalNotes * 5 + completedTasks * 10 + streakDays * 8) / 2))

  const STATS = [
    { label: "Notes Captured", value: totalNotes, icon: <TrendingUp className="w-5 h-5" />, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/25" },
    { label: "Tasks Done", value: `${completedTasks}/${totalTasks}`, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/25" },
    { label: "Streak Momentum", value: `${streakDays} Days`, icon: <Flame className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25" },
    { label: "Productivity Index", value: `${productivityScore}%`, icon: <Award className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25" },
  ]

  return (
    <AppShell>
      <div className="w-full space-y-8 animate-slide-up pb-8 max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text">Productivity & Analytics</h1>
            <p className="text-xs text-muted mt-1">Real-time output velocity, completion ratios, and habit momentum.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 glow-sm shrink-0">
            <Zap className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-sky-300">Score: {productivityScore}/100</span>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted" />
          </div>
        ) : (
          <>
            {/* ── Key Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 stagger">
              {STATS.map(s => (
                <div key={s.label} className={`p-5 rounded-2xl border glass-card card-hover animate-slide-up ${s.bg}`}>
                  <div className={`${s.color} mb-3`}>{s.icon}</div>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-bold text-muted mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* ── Visual Charts Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* 7-Day Velocity Chart */}
              <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-text flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-sky-400" />
                      7-Day Note Velocity
                    </h2>
                    <p className="text-[11px] text-muted">Daily memory captures over the last week</p>
                  </div>
                  <span className="text-xs font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                    {last7Days.reduce((a, b) => a + b.value, 0)} notes
                  </span>
                </div>
                <BarChart data={last7Days} />
              </div>

              {/* Task Completion Ratios */}
              <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 shadow-xl">
                <div>
                  <h2 className="text-sm font-bold text-text flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    Task Execution Ratio
                  </h2>
                  <p className="text-[11px] text-muted">Distribution of completed vs active tasks</p>
                </div>
                <div className="flex items-center justify-around pt-2">
                  <DonutChart value={completedTasks} total={totalTasks} color="#10b981" label="DONE" />
                  <DonutChart value={pendingTasks} total={totalTasks} color="#38bdf8" label="ACTIVE" />
                  <div className="text-center space-y-1">
                    <p className="text-3xl font-black text-text">{taskCompletionRate}%</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Completion</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 12-Week Streak Heatmap ── */}
            <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-text flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    12-Week Activity Matrix
                  </h2>
                  <p className="text-[11px] text-muted">Contribution density over the past 84 days</p>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {streakDays} Active Days
                </span>
              </div>
              <StreakHeatmap data={heatmapData} />
            </div>
          </>
        )}

      </div>
    </AppShell>
  )
}
