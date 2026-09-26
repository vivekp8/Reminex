import { useState, useEffect } from "react"
import { AppShell } from "../components/layout/AppShell"
import { useMemories, useReminders, useUpdateReminder } from "../api/queries"
import { Link } from "react-router-dom"
import {
  Sparkles, CheckCircle2, PenTool,
  Clock, Flame, FileText, CheckSquare, ArrowRight, Circle,
  Bot, FolderOpen, Zap
} from "lucide-react"
import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns"

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Small continuous progress leads to giant breakthroughs.", author: "James Clear" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Your intellect grows by connecting what you capture.", author: "Tiago Forte" },
  { text: "Your future self is watching. Make them proud.", author: "Unknown" },
]

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="text-right glass-card px-4 py-2 rounded-2xl border border-white/10 shadow-lg shrink-0">
      <p className="text-2xl font-black text-white tabular-nums tracking-tight">
        {format(time, "h:mm")}
        <span className="text-xs font-bold text-sky-400 ml-1.5 uppercase">{format(time, "a")}</span>
      </p>
      <p className="text-[10px] font-semibold text-muted/80">{format(time, "EEEE, MMMM d")}</p>
    </div>
  )
}

export default function Home() {
  const { data: memories } = useMemories()
  const { data: reminders } = useReminders()
  const updateReminder = useUpdateReminder()

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
    if (isToday(d)) return { label: "Today", color: "text-rose-400 bg-rose-500/10 border-rose-500/25" }
    if (isTomorrow(d)) return { label: "Tomorrow", color: "text-amber-400 bg-amber-500/10 border-amber-500/25" }
    return { label: format(d, "MMM d"), color: "text-muted bg-white/5 border-white/10" }
  }

  const handleToggleTask = (taskId: string, currentCompleted: boolean) => {
    updateReminder.mutate({
      id: taskId,
      updates: {
        completed: !currentCompleted,
        status: !currentCompleted ? "completed" : "pending"
      }
    })
  }

  return (
    <AppShell>
      <div className="w-full space-y-8 animate-slide-up pb-8 max-w-6xl mx-auto">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse glow-sm" />
              <p className="text-[11px] font-bold text-sky-400 uppercase tracking-widest">{timeGreeting()}</p>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight gradient-text animate-gradient-x py-1">
              Vivek Potnuru
            </h1>
            <p className="text-xs text-muted/80 max-w-lg leading-relaxed pt-0.5 italic">
              "{quote.text}" <span className="not-italic font-semibold text-slate-300 ml-1">— {quote.author}</span>
            </p>
          </div>
          <LiveClock />
        </header>

        {/* ── Quick Stats Bar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 stagger">
          {[
            {
              label: "Notes Captured",
              value: totalNotes,
              sub: "Total memories",
              icon: <FileText className="w-5 h-5" />,
              color: "text-sky-400",
              gradient: "from-sky-500/15 via-sky-500/5 to-transparent",
              border: "border-sky-500/25",
              glow: "hover:shadow-[0_0_25px_rgba(56,189,248,0.2)]"
            },
            {
              label: "Pending Actions",
              value: totalPending,
              sub: "In queue",
              icon: <CheckSquare className="w-5 h-5" />,
              color: "text-indigo-400",
              gradient: "from-indigo-500/15 via-purple-500/5 to-transparent",
              border: "border-indigo-500/25",
              glow: "hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]"
            },
            {
              label: "Active Day Streak",
              value: streak,
              sub: "Days streak",
              icon: <Flame className="w-5 h-5" />,
              color: "text-amber-400",
              gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
              border: "border-amber-500/25",
              glow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]"
            },
          ].map(s => (
            <div
              key={s.label}
              className={`p-5 rounded-2xl border bg-gradient-to-br ${s.gradient} ${s.border} ${s.glow} glass-card card-hover transition-all animate-slide-up`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">{s.label}</span>
                <div className={`p-2.5 rounded-xl bg-white/[0.04] border border-white/10 ${s.color}`}>
                  {s.icon}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-black tracking-tight ${s.color}`}>{s.value}</p>
                <span className="text-xs text-muted/70 font-semibold">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Action Launchers ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            to="/dashboard"
            className="p-4 rounded-2xl glass-card border border-sky-500/20 hover:border-sky-500/50 card-hover flex flex-col gap-3 group bg-gradient-to-br from-sky-500/10 to-transparent relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-400/10 blur-2xl rounded-full mix-blend-screen group-hover:bg-sky-400/20 transition-all duration-500" />
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center group-hover:scale-110 transition-transform glow-sm">
              <PenTool className="w-5 h-5 text-sky-300 animate-float" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text flex items-center gap-1">
                Capture Note <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky-400" />
              </h3>
              <p className="text-xs text-muted mt-0.5">Quick thoughts & speech</p>
            </div>
          </Link>

          <Link
            to="/tasks"
            className="p-4 rounded-2xl glass-card border border-indigo-500/20 hover:border-indigo-500/50 card-hover flex flex-col gap-3 group bg-gradient-to-br from-indigo-500/10 to-transparent relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/10 blur-2xl rounded-full mix-blend-screen group-hover:bg-indigo-400/20 transition-all duration-500" />
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform glow-violet">
              <CheckSquare className="w-5 h-5 text-indigo-300 animate-float" style={{ animationDelay: '1s' }} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text flex items-center gap-1">
                Tasks & Actions <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
              </h3>
              <p className="text-xs text-muted mt-0.5">{totalPending} tasks scheduled</p>
            </div>
          </Link>

          <Link
            to="/projects"
            className="p-4 rounded-2xl glass-card border border-purple-500/20 hover:border-purple-500/50 card-hover flex flex-col gap-3 group bg-gradient-to-br from-purple-500/10 to-transparent relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 blur-2xl rounded-full mix-blend-screen group-hover:bg-purple-400/20 transition-all duration-500" />
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderOpen className="w-5 h-5 text-purple-300 animate-float" style={{ animationDelay: '2s' }} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text flex items-center gap-1">
                Kanban Projects <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
              </h3>
              <p className="text-xs text-muted mt-0.5">Visual workflow tracker</p>
            </div>
          </Link>

          <Link
            to="/chat"
            className="p-4 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-500/50 card-hover flex flex-col gap-3 group bg-gradient-to-br from-cyan-500/10 to-transparent relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 blur-2xl rounded-full mix-blend-screen group-hover:bg-cyan-400/20 transition-all duration-500" />
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform glow-sm">
              <Bot className="w-5 h-5 text-cyan-300 animate-float" style={{ animationDelay: '3s' }} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text flex items-center gap-1">
                AI Assistant <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
              </h3>
              <p className="text-xs text-muted mt-0.5">Natural task extraction</p>
            </div>
          </Link>
        </div>

        {/* ── Upcoming Tasks & Recent Notes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upcoming Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-text uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Upcoming Deadlines
              </h2>
              <Link to="/tasks" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingTasks.length === 0 ? (
                <div className="p-8 rounded-2xl glass-card border border-white/10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold text-muted">All clear! No pending deadlines.</p>
                </div>
              ) : upcomingTasks.map(task => {
                const dl = deadlineLabel(task.deadline!)
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-white/10 hover:border-sky-400/30 card-hover transition-all">
                    <button
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className="text-muted hover:text-sky-400 transition-colors shrink-0"
                      title="Click to complete task"
                    >
                      {task.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                    </button>
                    <span className="flex-1 text-xs font-semibold text-text truncate">{task.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${dl.color}`}>{dl.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-text uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                Recent Notes & Ideas
              </h2>
              <Link to="/dashboard" className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentNotes.length === 0 ? (
                <div className="p-8 rounded-2xl glass-card border border-white/10 text-center">
                  <FileText className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold text-muted">No notes yet. Capture your first thought!</p>
                </div>
              ) : recentNotes.map(note => (
                <Link
                  key={note.id}
                  to="/dashboard"
                  className="block p-3.5 rounded-xl glass-card border border-white/10 hover:border-sky-400/30 card-hover group transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-text group-hover:text-sky-400 transition-colors truncate">
                      {note.title || "Untitled Note"}
                    </h4>
                    <span className="text-[10px] text-muted shrink-0 font-medium">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted mt-1 line-clamp-1 leading-relaxed">{note.content}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI Daily Briefing Banner ── */}
        <div className="p-6 rounded-3xl border border-sky-400/30 bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-purple-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 glass-card shadow-[0_10px_40px_-10px_rgba(56,189,248,0.2)] animate-gradient-x relative overflow-hidden card-hover">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
          <div className="flex items-start gap-4 min-w-0 flex-1 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg glow-sm animate-float">
              <Sparkles className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                AI Morning Briefing
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-400/20 text-sky-300 border border-sky-400/30">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                You have <strong className="text-text">{totalPending} tasks</strong> scheduled.{" "}
                {totalNotes > 0
                  ? `Your recent capture "${recentNotes[0]?.title || "Untitled"}" is ready for synthesis.`
                  : "Start by jotting down your goals for today."}
              </p>
            </div>
          </div>
          <Link to="/chat" className="shrink-0 self-end sm:self-center">
            <button className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-text border border-white/15 transition-all flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-sky-400" /> Ask Assistant
            </button>
          </Link>
        </div>

      </div>
    </AppShell>
  )
}
