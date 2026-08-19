import { useState, useMemo } from "react"
import { AppShell } from "../components/layout/AppShell"
import { useMemories, useReminders } from "../api/queries"
import { Loader2, ChevronLeft, ChevronRight, Circle, CheckCircle2 } from "lucide-react"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay,
  addMonths, subMonths, parseISO
} from "date-fns"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function Calendar() {
  const { data: memories, isLoading } = useMemories()
  const { data: reminders } = useReminders()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())

  // Build calendar grid (full weeks)
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Map dates to tasks and notes
  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof reminders> = {}
    reminders?.forEach(r => {
      if (!r.deadline) return
      const key = format(parseISO(r.deadline), "yyyy-MM-dd")
      if (!map[key]) map[key] = []
      map[key]!.push(r)
    })
    return map
  }, [reminders])

  const notesByDate = useMemo(() => {
    const map: Record<string, typeof memories> = {}
    memories?.forEach(m => {
      const key = format(parseISO(m.created_at), "yyyy-MM-dd")
      if (!map[key]) map[key] = []
      map[key]!.push(m)
    })
    return map
  }, [memories])

  // Selected day data
  const selectedKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null
  const selectedTasks = selectedKey ? (tasksByDate[selectedKey] ?? []) : []
  const selectedNotes = selectedKey ? (notesByDate[selectedKey] ?? []) : []

  const priorityColor: Record<string, string> = {
    High: "bg-red-500",
    Medium: "bg-yellow-400",
    Low: "bg-emerald-500",
  }

  return (
    <AppShell>
      <div className="w-full animate-slide-up pb-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text">Calendar</h1>
            <p className="text-sm text-muted mt-1">
              {format(currentMonth, "MMMM yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="p-2 rounded-lg text-muted hover:text-text hover:bg-secondary/40 transition-colors border border-border/40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="p-2 rounded-lg text-muted hover:text-text hover:bg-secondary/40 transition-colors border border-border/40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* ── Calendar Grid ── */}
            <div className="xl:col-span-2">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase text-muted/60 tracking-wider py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(day => {
                  const key = format(day, "yyyy-MM-dd")
                  const dayTasks = tasksByDate[key] ?? []
                  const dayNotes = notesByDate[key] ?? []
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
                  const today = isToday(day)
                  const hasContent = dayTasks.length > 0 || dayNotes.length > 0

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(day)}
                      className={`
                        relative aspect-square flex flex-col items-center justify-start pt-1.5 pb-1 px-1
                        rounded-xl text-xs font-medium transition-all duration-150 border
                        ${!isCurrentMonth ? "opacity-30" : ""}
                        ${isSelected
                          ? "bg-primary text-black border-primary glow-sm"
                          : today
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "border-transparent hover:bg-secondary/30 text-text hover:border-border/40"
                        }
                      `}
                    >
                      <span className={`font-bold ${isSelected ? "text-black" : today ? "text-primary" : "text-text"}`}>
                        {format(day, "d")}
                      </span>

                      {/* Event dots */}
                      {hasContent && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {dayTasks.slice(0, 2).map(t => (
                            <span
                              key={t.id}
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black/40" : (priorityColor[t.priority ?? ""] ?? "bg-blue-400")}`}
                            />
                          ))}
                          {dayNotes.slice(0, 1).map(n => (
                            <span key={n.id} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black/40" : "bg-primary/60"}`} />
                          ))}
                          {(dayTasks.length + dayNotes.length) > 3 && (
                            <span className={`text-[8px] font-bold ${isSelected ? "text-black/60" : "text-muted"}`}>
                              +{dayTasks.length + dayNotes.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 px-1">
                <div className="flex items-center gap-1.5 text-[10px] text-muted">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> Task
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted">
                  <span className="w-2 h-2 rounded-full bg-primary/60" /> Note
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> High Priority
                </div>
              </div>
            </div>

            {/* ── Day Detail Panel ── */}
            <div className="space-y-4">
              <div className="glass-card border border-border/50 rounded-2xl p-5 space-y-4">
                <div>
                  <h2 className="text-base font-bold text-text">
                    {selectedDay ? format(selectedDay, "EEEE") : "Select a day"}
                  </h2>
                  <p className="text-sm text-muted">
                    {selectedDay ? format(selectedDay, "MMMM d, yyyy") : ""}
                  </p>
                </div>

                {/* Tasks for day */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                    Tasks ({selectedTasks.length})
                  </p>
                  {selectedTasks.length === 0 ? (
                    <p className="text-xs text-muted/60 italic">No tasks due this day.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/10 border border-border/30">
                          {task.completed
                            ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            : <Circle className="w-4 h-4 text-muted shrink-0" />
                          }
                          <span className={`text-xs font-medium flex-1 ${task.completed ? "line-through text-muted" : "text-text"}`}>
                            {task.title}
                          </span>
                          {task.priority && (
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityColor[task.priority] ?? "bg-muted"}`} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes for day */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                    Notes ({selectedNotes.length})
                  </p>
                  {selectedNotes.length === 0 ? (
                    <p className="text-xs text-muted/60 italic">No notes on this day.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedNotes.map(note => (
                        <div key={note.id} className="p-2.5 rounded-lg bg-secondary/10 border border-border/30">
                          <p className="text-xs font-semibold text-text truncate">{note.title || "Untitled"}</p>
                          <p className="text-[11px] text-muted mt-0.5 line-clamp-2 leading-relaxed">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Month summary */}
              <div className="glass-card border border-border/50 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Month Summary</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 rounded-lg bg-secondary/10">
                    <p className="text-lg font-bold text-primary">
                      {Object.keys(notesByDate).filter(k => k.startsWith(format(currentMonth, "yyyy-MM"))).reduce((sum, k) => sum + (notesByDate[k]?.length ?? 0), 0)}
                    </p>
                    <p className="text-[10px] text-muted">Notes</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-secondary/10">
                    <p className="text-lg font-bold text-blue-400">
                      {Object.keys(tasksByDate).filter(k => k.startsWith(format(currentMonth, "yyyy-MM"))).reduce((sum, k) => sum + (tasksByDate[k]?.length ?? 0), 0)}
                    </p>
                    <p className="text-[10px] text-muted">Tasks Due</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
