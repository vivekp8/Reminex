import { AppShell } from "../components/layout/AppShell"
import { useReminders, useUpdateReminder } from "../api/queries"
import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns"
import { Loader2, Bell, CheckCircle2, Clock, Circle, AlertTriangle, CalendarDays } from "lucide-react"
import { cn } from "../lib/utils"

function urgencyLabel(dateStr: string | null): { label: string; color: string; bg: string } {
  if (!dateStr) return { label: "No date", color: "text-muted", bg: "bg-secondary/10" }
  const d = parseISO(dateStr)
  if (isPast(d) && !isToday(d)) return { label: "Overdue", color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20" }
  if (isToday(d))               return { label: "Today",   color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" }
  if (isTomorrow(d))            return { label: "Tomorrow", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" }
  return { label: "Upcoming", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
}

export default function Reminders() {
  const { data: reminders, isLoading } = useReminders()
  const updateReminder = useUpdateReminder()

  const toggleComplete = (id: string, completed: boolean) =>
    updateReminder.mutate({ id, updates: { completed: !completed } })

  const pending   = (reminders ?? []).filter(r => !r.completed)
  const completed = (reminders ?? []).filter(r => r.completed)

  return (
    <AppShell>
      <div className="space-y-8 w-full animate-slide-up pb-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text">Reminders</h1>
            <p className="text-muted text-sm mt-1">
              {pending.length > 0 ? `${pending.length} pending reminder${pending.length !== 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {pending.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{pending.length} pending</span>
            </div>
          )}
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : reminders?.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-muted">
            <div className="w-16 h-16 rounded-2xl glass-card border border-border/40 flex items-center justify-center">
              <Bell className="w-7 h-7 opacity-30" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text/50">No reminders yet</p>
              <p className="text-xs text-muted/60 mt-1">Add tasks with due dates from the Tasks page.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Pending
                </h2>
                <div className="space-y-2">
                  {pending.map(reminder => {
                    const { label, color, bg } = urgencyLabel(reminder.remind_at)
                    return (
                      <div
                        key={reminder.id}
                        className={cn("flex items-center gap-4 p-4 rounded-xl border glass-card card-hover group", bg)}
                      >
                        <button
                          onClick={() => toggleComplete(reminder.id, reminder.completed)}
                          disabled={updateReminder.isPending}
                          className="shrink-0 text-muted hover:text-primary transition-colors"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-text truncate">{reminder.title}</p>
                          {reminder.remind_at && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <CalendarDays className="w-3 h-3 text-muted" />
                              <span className="text-[11px] text-muted">
                                {format(parseISO(reminder.remind_at), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest shrink-0", color)}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Completed
                </h2>
                <div className="space-y-2">
                  {completed.map(reminder => (
                    <div
                      key={reminder.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border/20 glass-card opacity-50 hover:opacity-70 transition-opacity group"
                    >
                      <button
                        onClick={() => toggleComplete(reminder.id, reminder.completed)}
                        disabled={updateReminder.isPending}
                        className="shrink-0 text-emerald-400"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted line-through truncate">{reminder.title}</p>
                        {reminder.remind_at && (
                          <span className="text-[11px] text-muted/60">
                            {format(parseISO(reminder.remind_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Done</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
