import { useState, useMemo } from "react"
import { AppShell } from "../components/layout/AppShell"
import {
  CheckSquare, Circle, CheckCircle2, Loader2,
  Trash2, Pencil, X, Check,
  Clock, CalendarDays, Plus,
  Play, Pause, Share2, UserPlus, Copy,
  Calendar, ListFilter, AlertCircle
} from "lucide-react"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import { useReminders, useCreateReminder, useUpdateReminder, useDeleteReminder } from "../api/queries"
import type { Reminder } from "../api/queries"
import { format, isPast, isToday, parseISO } from "date-fns"
import { cn } from "../lib/utils"

const PRIORITY_STYLES: Record<string, string> = {
  High:   "bg-red-500/15 text-red-400 border-red-500/30",
  Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Low:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
}

export default function Tasks() {
  const { data: reminders, isLoading } = useReminders()
  const createReminder = useCreateReminder()
  const updateReminder = useUpdateReminder()
  const deleteReminder = useDeleteReminder()

  // ── Create form state ──
  const [newTask, setNewTask]           = useState("")
  const [deadline, setDeadline]         = useState("")
  const [priority, setPriority]         = useState<"none" | "Low" | "Medium" | "High">("none")
  const [showForm, setShowForm]         = useState(false)

  // ── Edit state ──
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [editTitle, setEditTitle]       = useState("")
  const [editDeadline, setEditDeadline] = useState("")
  const [editPriority, setEditPriority] = useState<"none" | "Low" | "Medium" | "High">("none")

  // ── Modals state ──
  const [sharingTask, setSharingTask]   = useState<Reminder | null>(null)
  const [invitingTask, setInvitingTask] = useState<Reminder | null>(null)
  const [inviteEmail, setInviteEmail]   = useState("")
  const [copiedLink, setCopiedLink]     = useState(false)
  const [inviteSent, setInviteSent]     = useState(false)

  // ── Filter & View ──
  const [filter, setFilter] = useState<"all" | "pending" | "ongoing" | "done">("all")
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    createReminder.mutate({
      title: newTask,
      deadline: deadline || undefined,
      priority: priority !== "none" ? priority : undefined,
    }, {
      onSuccess: () => {
        setNewTask(""); setDeadline(""); setPriority("none"); setShowForm(false)
      }
    })
  }

  const startEdit = (r: Reminder) => {
    setEditingId(r.id)
    setEditTitle(r.title)
    setEditDeadline(r.deadline ?? "")
    setEditPriority((r.priority as "Low" | "Medium" | "High") ?? "none")
  }

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return
    updateReminder.mutate({
      id,
      updates: {
        title: editTitle,
        deadline: editDeadline || undefined,
        priority: editPriority !== "none" ? editPriority : undefined,
      }
    }, { onSuccess: () => setEditingId(null) })
  }

  const toggleDone = (r: Reminder) => {
    const isCompleted = !r.completed
    updateReminder.mutate({
      id: r.id,
      updates: {
        completed: isCompleted,
        status: isCompleted ? "completed" : "pending"
      }
    })
  }

  const toggleOngoing = (r: Reminder) => {
    const nextStatus = r.status === "ongoing" ? "pending" : "ongoing"
    updateReminder.mutate({
      id: r.id,
      updates: {
        status: nextStatus,
        ongoing_since: nextStatus === "ongoing" ? new Date().toISOString() : undefined,
        completed: false
      }
    })
  }

  const handleCopyLink = (task: Reminder) => {
    navigator.clipboard.writeText(`${window.location.origin}/tasks?id=${task.id}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !invitingTask) return
    const currentShared = invitingTask.shared_with ?? []
    updateReminder.mutate({
      id: invitingTask.id,
      updates: {
        shared_with: [...currentShared, inviteEmail.trim()]
      }
    }, {
      onSuccess: () => {
        setInviteSent(true)
        setTimeout(() => {
          setInviteSent(false)
          setInviteEmail("")
          setInvitingTask(null)
        }, 1500)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this task?")) deleteReminder.mutate(id)
  }

  const filtered = useMemo(() => {
    return (reminders ?? []).filter(r => {
      if (filter === "pending") return !r.completed && r.status !== "ongoing"
      if (filter === "ongoing") return r.status === "ongoing" && !r.completed
      if (filter === "done")    return r.completed
      return true
    })
  }, [reminders, filter])

  const pendingCount = (reminders ?? []).filter(r => !r.completed && r.status !== "ongoing").length
  const ongoingCount = (reminders ?? []).filter(r => r.status === "ongoing" && !r.completed).length
  const doneCount    = (reminders ?? []).filter(r => r.completed).length

  return (
    <AppShell>
      <div className="w-full space-y-6 animate-slide-up pb-8">

        {/* ── Top Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text">Tasks & Action Items</h1>
            <p className="text-sm text-muted mt-1">
              Manage your tasks, track ongoing execution, and collaborate with your team.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex items-center rounded-xl p-1 bg-secondary/30 border border-border/40">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "list"
                    ? "bg-primary text-black shadow-sm"
                    : "text-muted hover:text-text"
                )}
              >
                <ListFilter className="w-3.5 h-3.5" /> List
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                  viewMode === "calendar"
                    ? "bg-primary text-black shadow-sm"
                    : "text-muted hover:text-text"
                )}
              >
                <Calendar className="w-3.5 h-3.5" /> Calendar
              </button>
            </div>

            <Button onClick={() => setShowForm(true)} className="gap-2 glow-sm">
              <Plus className="w-4 h-4" /> New Task
            </Button>
          </div>
        </div>

        {/* ── Status Tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all",     label: "All Tasks", count: reminders?.length ?? 0 },
            { id: "pending", label: "To Do",     count: pendingCount },
            { id: "ongoing", label: "Ongoing",   count: ongoingCount, highlight: true },
            { id: "done",    label: "Completed", count: doneCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border shrink-0",
                filter === tab.id
                  ? tab.highlight
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 glow-sm"
                    : "bg-primary/15 text-primary border-primary/30 glow-sm"
                  : "glass-card border-border/40 text-muted hover:text-text hover:border-border"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                filter === tab.id ? "bg-primary text-black" : "bg-secondary/50 text-muted"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── New Task Modal / Drawer ── */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card border border-primary/30 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" /> Create New Task
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-lg text-muted hover:text-text hover:bg-secondary/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
                    Task Title *
                  </label>
                  <Input
                    autoFocus
                    placeholder="e.g., Finalize project architecture & write documentation"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
                      Deadline
                    </label>
                    <Input
                      type="datetime-local"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as "none" | "Low" | "Medium" | "High")}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface/50 text-text text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="none">Normal</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" disabled={!newTask.trim() || createReminder.isPending}>
                    {createReminder.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
                    Create Task
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Share Modal ── */}
        {sharingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card border border-border/60 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" /> Share Task
                </h3>
                <button onClick={() => setSharingTask(null)} className="p-1 text-muted hover:text-text">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted">
                Anyone with this link can view this task details and status.
              </p>
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 flex items-center justify-between">
                <span className="text-xs text-text font-mono truncate mr-2">
                  {`${window.location.origin}/tasks?id=${sharingTask.id}`}
                </span>
                <Button size="sm" variant="outline" onClick={() => handleCopyLink(sharingTask)} className="shrink-0 gap-1 text-xs">
                  {copiedLink ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Invite Collaborator Modal ── */}
        {invitingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card border border-border/60 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" /> Invite Collaborator
                </h3>
                <button onClick={() => setInvitingTask(null)} className="p-1 text-muted hover:text-text">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted">
                Assign teammates to work together on <span className="text-text font-semibold">"{invitingTask.title}"</span>.
              </p>

              {inviteSent ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" /> Invitation sent successfully!
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" type="button" onClick={() => setInvitingTask(null)}>Cancel</Button>
                    <Button size="sm" type="submit" disabled={!inviteEmail.trim() || updateReminder.isPending}>
                      Send Invite
                    </Button>
                  </div>
                </form>
              )}

              {/* Existing collaborators */}
              {invitingTask.shared_with && invitingTask.shared_with.length > 0 && (
                <div className="pt-2 border-t border-border/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Assigned Teammates</p>
                  <div className="flex flex-wrap gap-1.5">
                    {invitingTask.shared_with.map(email => (
                      <span key={email} className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Main Content: List or Calendar ── */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted">
            <div className="w-16 h-16 rounded-2xl glass-card border border-border/40 flex items-center justify-center">
              <CheckSquare className="w-8 h-8 opacity-30" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-text/50">
                {filter === "all" ? "No tasks found" : `No ${filter} tasks`}
              </p>
              <p className="text-xs text-muted/60">Create a task to get started.</p>
            </div>
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Create Task
            </Button>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-2.5">
            {filtered.map(task => {
              const isEditing = editingId === task.id
              const isOngoing = task.status === "ongoing" && !task.completed
              const isOverdue = task.deadline && isPast(parseISO(task.deadline)) && !isToday(parseISO(task.deadline)) && !task.completed

              if (isEditing) {
                return (
                  <div key={task.id} className="p-4 rounded-xl glass-card border border-primary/40 space-y-3">
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder="Task title"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="datetime-local"
                        value={editDeadline}
                        onChange={e => setEditDeadline(e.target.value)}
                      />
                      <select
                        value={editPriority}
                        onChange={e => setEditPriority(e.target.value as "none" | "Low" | "Medium" | "High")}
                        className="h-10 px-3 rounded-lg border border-border bg-surface/50 text-text text-sm"
                      >
                        <option value="none">Normal Priority</option>
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => saveEdit(task.id)}>Save Changes</Button>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border glass-card card-hover transition-all group",
                    task.completed
                      ? "border-border/20 opacity-50 bg-secondary/5"
                      : isOngoing
                      ? "border-amber-500/40 bg-amber-500/5 glow-sm"
                      : "border-border/30 hover:border-border/60"
                  )}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleDone(task)}
                      className="mt-0.5 sm:mt-0 text-muted hover:text-primary transition-colors shrink-0"
                    >
                      {task.completed
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        : <Circle className="w-5 h-5" />
                      }
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "text-sm font-semibold truncate",
                          task.completed ? "line-through text-muted" : "text-text"
                        )}>
                          {task.title}
                        </span>

                        {/* Ongoing badge with pulse */}
                        {isOngoing && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                            <Clock className="w-2.5 h-2.5" /> Ongoing
                          </span>
                        )}

                        {/* Priority Badge */}
                        {task.priority && (
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border", PRIORITY_STYLES[task.priority])}>
                            {task.priority}
                          </span>
                        )}

                        {/* Shared badge */}
                        {task.shared_with && task.shared_with.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            👥 {task.shared_with.length}
                          </span>
                        )}
                      </div>

                      {/* Deadline & Urgency */}
                      {task.deadline && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "text-xs flex items-center gap-1",
                            isOverdue ? "text-red-400 font-semibold" : "text-muted"
                          )}>
                            <CalendarDays className="w-3 h-3" />
                            {format(parseISO(task.deadline), "MMM d, yyyy h:mm a")}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5" /> Overdue
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    {/* Pause / Play trigger for Ongoing */}
                    {!task.completed && (
                      <button
                        onClick={() => toggleOngoing(task)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all border",
                          isOngoing
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                            : "bg-secondary/40 text-muted border-border/40 hover:text-text hover:bg-secondary"
                        )}
                        title={isOngoing ? "Pause Task" : "Start Ongoing Task"}
                      >
                        {isOngoing ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Start</>}
                      </button>
                    )}

                    {/* Share */}
                    <button
                      onClick={() => setSharingTask(task)}
                      className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-secondary/40 transition-colors"
                      title="Share Task"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Invite */}
                    <button
                      onClick={() => setInvitingTask(task)}
                      className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-secondary/40 transition-colors"
                      title="Invite Collaborator"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => startEdit(task)}
                      className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-secondary/40 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Calendar Embedded View */
          <div className="glass-card border border-border/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text">Task Schedule</h3>
              <span className="text-xs text-muted">{filtered.length} tasks scheduled</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(task => (
                <div key={task.id} className="p-3.5 rounded-xl bg-secondary/15 border border-border/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      {task.deadline ? format(parseISO(task.deadline), "EEE, MMM d") : "No date"}
                    </span>
                    {task.priority && (
                      <span className={cn("px-1.5 py-0.2 rounded text-[9px] font-bold", PRIORITY_STYLES[task.priority])}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-text truncate">{task.title}</p>
                  <div className="flex items-center justify-between text-xs text-muted pt-1 border-t border-border/20">
                    <span>{task.completed ? "✓ Done" : task.status === "ongoing" ? "⚡ In progress" : "○ To do"}</span>
                    <button onClick={() => toggleDone(task)} className="text-primary hover:underline text-xs">
                      {task.completed ? "Reopen" : "Complete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
