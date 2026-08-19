import { useState } from "react"
import { AppShell } from "../components/layout/AppShell"
import {
  FolderOpen, Plus, X, ChevronRight, ChevronDown,
  MoreHorizontal, Trash2, Pencil, CheckCircle2,
  Circle, Layers
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { cn } from "../lib/utils"

interface Task {
  id: string
  title: string
  done: boolean
}

interface Project {
  id: string
  name: string
  description: string
  color: string
  column: "backlog" | "active" | "done"
  tasks: Task[]
  createdAt: string
}

const COLORS = [
  { value: "#fbbf24", label: "Amber" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Emerald" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#f97316", label: "Orange" },
  { value: "#ec4899", label: "Pink" },
]

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Website Redesign",
    description: "Overhaul the landing page with new branding and improved UX.",
    color: "#3b82f6",
    column: "active",
    tasks: [
      { id: "t1", title: "Create wireframes", done: true },
      { id: "t2", title: "Design hero section", done: false },
      { id: "t3", title: "Set up Tailwind config", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "p2",
    name: "Q3 Goals",
    description: "Define and track quarterly objectives and key results.",
    color: "#fbbf24",
    column: "active",
    tasks: [
      { id: "t4", title: "Write OKR document", done: false },
      { id: "t5", title: "Team review session", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "p3",
    name: "Personal Journal",
    description: "Daily reflection and journaling habit.",
    color: "#10b981",
    column: "backlog",
    tasks: [
      { id: "t6", title: "Set up template", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
]

const COLUMNS: { id: Project["column"]; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "text-muted" },
  { id: "active", label: "In Progress", color: "text-blue-400" },
  { id: "done", label: "Done", color: "text-emerald-400" },
]

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formColor, setFormColor] = useState(COLORS[0].value)
  const [formColumn, setFormColumn] = useState<Project["column"]>("backlog")

  const openCreate = () => {
    setEditingProject(null)
    setFormName(""); setFormDesc(""); setFormColor(COLORS[0].value); setFormColumn("backlog")
    setShowModal(true)
  }

  const openEdit = (p: Project) => {
    setEditingProject(p)
    setFormName(p.name); setFormDesc(p.description); setFormColor(p.color); setFormColumn(p.column)
    setMenuId(null)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formName.trim()) return
    if (editingProject) {
      setProjects(ps => ps.map(p => p.id === editingProject.id
        ? { ...p, name: formName, description: formDesc, color: formColor, column: formColumn }
        : p))
    } else {
      const newProject: Project = {
        id: `p-${Date.now()}`,
        name: formName,
        description: formDesc,
        color: formColor,
        column: formColumn,
        tasks: [],
        createdAt: new Date().toISOString(),
      }
      setProjects(ps => [newProject, ...ps])
    }
    setShowModal(false)
  }

  const deleteProject = (id: string) => {
    setProjects(ps => ps.filter(p => p.id !== id))
    setMenuId(null)
  }

  const toggleTask = (projectId: string, taskId: string) => {
    setProjects(ps => ps.map(p => p.id === projectId
      ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
      : p))
  }

  const addTask = (projectId: string, title: string) => {
    if (!title.trim()) return
    setProjects(ps => ps.map(p => p.id === projectId
      ? { ...p, tasks: [...p.tasks, { id: `t-${Date.now()}`, title, done: false }] }
      : p))
  }

  const progress = (p: Project) => {
    if (p.tasks.length === 0) return 0
    return Math.round((p.tasks.filter(t => t.done).length / p.tasks.length) * 100)
  }

  return (
    <AppShell>
      <div className="w-full animate-slide-up pb-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text">Projects</h1>
            <p className="text-sm text-muted mt-1">{projects.length} projects · {projects.filter(p => p.column === "active").length} active</p>
          </div>
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {COLUMNS.map(col => {
            const colProjects = projects.filter(p => p.column === col.id)
            return (
              <div key={col.id} className="space-y-3">
                {/* Column header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-widest ${col.color}`}>{col.label}</span>
                    <span className="text-[10px] font-semibold text-muted bg-secondary/40 px-1.5 py-0.5 rounded-full">
                      {colProjects.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-[120px]">
                  {colProjects.length === 0 && (
                    <div className="p-5 rounded-xl border-2 border-dashed border-border/30 text-center">
                      <p className="text-xs text-muted/60">No projects here</p>
                    </div>
                  )}
                  {colProjects.map(p => {
                    const pct = progress(p)
                    const isExpanded = expandedId === p.id
                    return (
                      <div
                        key={p.id}
                        className="glass-card border border-border/50 rounded-xl overflow-hidden card-hover"
                      >
                        {/* Card top accent */}
                        <div className="h-1 w-full" style={{ backgroundColor: p.color }} />

                        <div className="p-4 space-y-3">
                          {/* Title row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: p.color }} />
                              <h3 className="text-sm font-bold text-text truncate">{p.name}</h3>
                            </div>
                            <div className="relative shrink-0">
                              <button
                                onClick={() => setMenuId(menuId === p.id ? null : p.id)}
                                className="p-1 rounded-md text-muted hover:text-text hover:bg-secondary/40 transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              {menuId === p.id && (
                                <div className="absolute right-0 top-7 z-20 w-36 bg-[#1a1a1e] border border-border/60 rounded-xl shadow-2xl py-1 overflow-hidden">
                                  <button onClick={() => openEdit(p)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text hover:bg-secondary/40 transition-colors">
                                    <Pencil className="w-3.5 h-3.5 text-muted" /> Edit Project
                                  </button>
                                  <button onClick={() => deleteProject(p.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {p.description && (
                            <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{p.description}</p>
                          )}

                          {/* Progress */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-muted">{p.tasks.filter(t => t.done).length}/{p.tasks.length} tasks</span>
                              <span className="text-[10px] font-bold" style={{ color: p.color }}>{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: p.color }}
                              />
                            </div>
                          </div>

                          {/* Expand toggle */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : p.id)}
                            className="w-full flex items-center justify-between text-[11px] text-muted hover:text-text transition-colors py-0.5"
                          >
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" /> Tasks
                            </span>
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>

                          {/* Expanded tasks */}
                          {isExpanded && (
                            <div className="space-y-1.5 pt-1 border-t border-border/30">
                              {p.tasks.map(task => (
                                <button
                                  key={task.id}
                                  onClick={() => toggleTask(p.id, task.id)}
                                  className="w-full flex items-center gap-2 text-left group"
                                >
                                  {task.done
                                    ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: p.color }} />
                                    : <Circle className="w-3.5 h-3.5 shrink-0 text-muted group-hover:text-text transition-colors" />
                                  }
                                  <span className={cn("text-[11px]", task.done ? "line-through text-muted" : "text-text")}>
                                    {task.title}
                                  </span>
                                </button>
                              ))}
                              <AddTaskInline onAdd={(title) => addTask(p.id, title)} />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-muted gap-4">
            <FolderOpen className="w-14 h-14 opacity-20" />
            <p className="text-sm">No projects yet.</p>
            <Button onClick={openCreate} size="sm">Create your first project</Button>
          </div>
        )}

      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md glass-card border border-border/60 rounded-2xl p-6 shadow-2xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text">{editingProject ? "Edit Project" : "New Project"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                autoFocus
                placeholder="Project name"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="h-10"
              />
              <textarea
                placeholder="Description (optional)"
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                className="w-full h-20 bg-secondary/20 border border-border/50 rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              <div>
                <label className="text-xs font-medium text-muted mb-2 block">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setFormColor(c.value)}
                      className={cn("w-7 h-7 rounded-full transition-transform", formColor === c.value && "scale-125 ring-2 ring-white/30")}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted mb-2 block">Status</label>
                <div className="flex gap-2">
                  {COLUMNS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setFormColumn(c.id)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                        formColumn === c.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/40 text-muted hover:text-text hover:bg-secondary/30"
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={!formName.trim()}>
                {editingProject ? "Save Changes" : "Create Project"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside to close menu */}
      {menuId && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
      )}
    </AppShell>
  )
}

function AddTaskInline({ onAdd }: { onAdd: (title: string) => void }) {
  const [value, setValue] = useState("")
  const [active, setActive] = useState(false)

  const submit = () => {
    if (value.trim()) { onAdd(value); setValue("") }
    setActive(false)
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex items-center gap-1.5 text-[11px] text-muted hover:text-primary transition-colors mt-1"
      >
        <Plus className="w-3 h-3" /> Add task
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") setActive(false) }}
        placeholder="Task title…"
        className="flex-1 bg-transparent text-[11px] text-text placeholder:text-muted border-b border-primary/50 focus:outline-none pb-0.5"
      />
      <button onClick={submit} className="text-primary hover:text-primary/80">
        <CheckCircle2 className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => setActive(false)} className="text-muted hover:text-text">
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
