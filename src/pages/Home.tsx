import { useState, useEffect } from "react"
import { AppShell } from "../components/layout/AppShell"
import { useMemories, useReminders } from "../api/queries"
import { Link } from "react-router-dom"
import {
  Sparkles, CheckCircle2, ChevronRight, PenTool,
  Clock, Flame, FileText, CheckSquare, ArrowRight, Circle
} from "lucide-react"
import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns"

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "One task at a time. Do it well.", author: "Unknown" },
  { text: "Your future self is watching. Make them proud.", author: "Unknown" },
]

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="text-right">
      <p className="text-2xl font-bold text-text tabular-nums tracking-tight">
        {format(time, "h:mm")}
        <span className="text-base font-medium text-muted ml-1">{format(time, "a")}</span>
      </p>
      <p className="text-xs text-muted">{format(time, "EEEE, MMM d")}</p>
    </div>
  )
}

export default function Home() {
  const { data: memories } = useMemories()
  const { data: reminders } = useReminders()

  const quote = QUOTES[new Date().getDay() % QUOTES.length]

  const timeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const pending = (reminders ?? []).filter(r => !r.completed)
  const upcomingTasks = pending
    .filter(r => r.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3)

  const recentNotes = (memories ?? []).slice(0, 4)
  const totalNotes = memories?.length ?? 0
  const totalPending = pending.length
  const streak = memories
    ? [...new Set(memories.map(m => new Date(m.created_at).toDateString()))].length
    : 0

  const deadlineLabel = (deadline: string) => {
    const d = new Date(deadline)
    if (isToday(d)) return { label: "Today", color: "text-red-400" }
    if (isTomorrow(d)) return { label: "Tomorrow", color: "text-yellow-400" }
    return { label: format(d, "MMM d"), color: "text-muted" }
  }

  return (
    <AppShell>
      <div className="w-full space-y-8 animate-slide-up pb-8">

        {/* ── Header ── */}
        <header className="flex items-start justify-between pt-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted uppercase tracking-widest">{timeGreeting()}</p>
            <h1 className="text-4xl font-extrabold tracking-tight gradient-text">
              Vivek
            </h1>
            <p className="text-sm text-muted/80">{quote.text} — <span className="italic">{quote.author}</span></p>
          </div>
          <LiveClock />
        </header>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-3 gap-3 stagger">
          {[
            { label: "Notes", value: totalNotes, icon: <FileText className="w-4 h-4" />, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
            { label: "Pending Tasks", value: totalPending, icon: <CheckSquare className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Day Streak", value: streak, icon: <Flame className="w-4 h-4" />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-xl border glass-card animate-slide-up ${s.bg}`}>
              <div className={`${s.color} mb-2`}>{s.icon}</div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/dashboard"
            className="p-4 rounded-xl glass-card border border-primary/20 hover:border-primary/40 card-hover flex flex-col gap-3 group bg-primary/5"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenTool className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text">Capture Note</h3>
              <p className="text-[11px] text-muted mt-0.5">Jot down ideas fast</p>
            </div>
          </Link>
          <Link
            to="/tasks"
            className="p-4 rounded-xl glass-card border border-border/50 hover:border-border card-hover flex flex-col gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4 text-text" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text">Manage Tasks</h3>
              <p className="text-[11px] text-muted mt-0.5">{totalPending} tasks pending</p>
            </div>
          </Link>
          <Link
            to="/projects"
            className="p-4 rounded-xl glass-card border border-border/50 hover:border-border card-hover flex flex-col gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text">Projects</h3>
              <p className="text-[11px] text-muted mt-0.5">Track your work</p>
            </div>
          </Link>
          <Link
            to="/chat"
            className="p-4 rounded-xl glass-card border border-border/50 hover:border-border card-hover flex flex-col gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text">AI Chat</h3>
              <p className="text-[11px] text-muted mt-0.5">Ask your brain</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Upcoming Tasks ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Upcoming Tasks
              </h2>
              <Link to="/tasks" className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingTasks.length === 0 ? (
                <div className="p-6 rounded-xl glass-card border border-border/40 text-center">
                  <CheckCircle2 className="w-7 h-7 text-muted mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted">All clear! No upcoming tasks.</p>
                </div>
              ) : upcomingTasks.map(task => {
                const dl = deadlineLabel(task.deadline!)
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-border/40 card-hover">
                    <Circle className="w-4 h-4 text-muted shrink-0" />
                    <span className="flex-1 text-sm text-text font-medium truncate">{task.title}</span>
                    <span className={`text-[11px] font-semibold shrink-0 ${dl.color}`}>{dl.label}</span>
                  </div>
                )
              })}
              {pending.filter(r => !r.deadline).slice(0, 2 - upcomingTasks.length).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-border/40 card-hover">
                  <Circle className="w-4 h-4 text-muted shrink-0" />
                  <span className="flex-1 text-sm text-text font-medium truncate">{task.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Recent Notes ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Recent Notes
              </h2>
              <Link to="/dashboard" className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentNotes.length === 0 ? (
                <div className="p-6 rounded-xl glass-card border border-border/40 text-center">
                  <FileText className="w-7 h-7 text-muted mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted">No notes yet. Start capturing!</p>
                </div>
              ) : recentNotes.map(note => (
                <Link
                  key={note.id}
                  to="/dashboard"
                  className="block p-3.5 rounded-xl glass-card border border-border/40 card-hover group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-text group-hover:text-primary transition-colors truncate">
                      {note.title || "Untitled"}
                    </h4>
                    <span className="text-[10px] text-muted shrink-0">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted mt-1 line-clamp-1 leading-relaxed">{note.content}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI Daily Summary ── */}
        <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/8 via-transparent to-violet-500/5 flex items-start gap-4 glass-card">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">AI Daily Insight</h3>
            <p className="text-sm text-muted mt-1.5 leading-relaxed">
              You have <strong className="text-text">{totalPending} tasks</strong> pending.{" "}
              {totalNotes > 0
                ? `Your last note was "${recentNotes[0]?.title || "Untitled"}". Keep building momentum!`
                : "Start by capturing your first thought of the day."}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted shrink-0 mt-0.5" />
        </div>

      </div>
    </AppShell>
  )
}
