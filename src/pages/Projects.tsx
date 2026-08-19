import { useState } from "react"
import { AppShell } from "../components/layout/AppShell"
import {
  FolderOpen, Plus, X, ChevronRight, ChevronDown,
  MoreHorizontal, Trash2, Pencil, CheckCircle2,
  Circle, Layers, Check, ArrowRight
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
  { value: "#38bdf8", label: "Sky Cyan" },
  { value: "#818cf8", label: "Indigo" },
  { value: "#a855f7", label: "Neon Violet" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f43f5e", label: "Rose" },
  { value: "#f59e0b", label: "Amber" },
]

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Website & Brand System",
    description: "Overhaul the main workspace UI with modern obsidian glass aesthetics.",
    color: "#38bdf8",
    column: "active",
    tasks: [
      { id: "t1", title: "Create wireframes & mood board", done: true },
      { id: "t2", title: "Design hero section & animations", done: true },
      { id: "t3", title: "Refactor typography system", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "p2",
    name: "Q3 Product Milestones",
    description: "Define and track quarterly objectives and AI synthesis features.",
    color: "#a855f7",
    column: "active",
    tasks: [
      { id: "t4", title: "Write OKR planning document", done: true },
      { id: "t5", title: "Team sync & demo session", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "p3",
    name: "Personal Knowledge Graph",
    description: "Daily reflection, idea connections, and reading summaries.",
    color: "#10b981",
    column: "backlog",
    tasks: [
      { id: "t6", title: "Set up template structure", done: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
]

const COLUMNS: { id: Project["column"]; label: string; color: string; badge: string }[] = [
  { id: "backlog", label: "Backlog", color: "text-muted", badge: "bg-white/5 border-white/10 text-muted" },
  { id: "active", label: "In Progress", color: "text-sky-300", badge: "bg-sky-500/15 border-sky-500/30 text-sky-300" },
  { id: "done", label: "Completed", color: "text-emerald-400", badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" },
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
    setShowModal(true)
    setMenuId(null)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    if (editingProject) {
      setProjects(ps => ps.map(p => p.id === editingProject.id
        ? { ...p, name: formName, description: formDesc, color: formColor, column: formColumn }
        : p
      ))
    } else {
      const newProj: Project = {
        id: `p-${Date.now()}`,
        name: formName,
        description: formDesc,
        color: formColor,
        column: formColumn,
        tasks: [],
        createdAt: new Date().toISOString(),
      }
      setProjects(ps => [newProj, ...ps])
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this project and all its tasks?")) {
      setProjects(ps => ps.filter(p => p.id !== id))
      setMenuId(null)
    }
  }

  const moveColumn = (id: string, col: Project["column"]) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, column: col } : p))
    setMenuId(null)
  }

  const toggleTask = (projectId: string, taskId: string) => {
    setProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      return {
        ...p,
        tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
      }
    }))
  }

  const addTask = (projectId: string, title: string) => {
    if (!title.trim()) return
    const newTask: Task = { id: `t-${Date.now()}`, title, done: false }
    setProjects(ps => ps.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p))
  }

  const deleteTask = (projectId: string, taskId: string) => {
    setProjects(ps => ps.map(p => p.id === projectId
      ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
      : p
    ))
  }

  return (
    <AppShell>
      <div className="w-full space-y-6 animate-slide-up pb-8 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text">Kanban Projects</h1>
            <p className="text-xs text-muted mt-1">Organize goals, manage workflows, and track sprint deliverables.</p>
          </div>
          <Button onClick={openCreate} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        {/* ── 3-Column Kanban Board ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map(col => {
            const colProjects = projects.filter(p => p.column === col.id)
            return (
              <div key={col.id} className="flex flex-col rounded-2xl glass-card border border-white/10 p-4 space-y-4">
                {/* Column header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-text">{col.label}</h2>
                  </div>
                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border", col.badge)}>
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards stream */}
                <div className="space-y-3 flex-1 min-h-[300px]">
                  {colProjects.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-muted border border-dashed border-white/10 rounded-xl gap-2">
                      <Layers className="w-6 h-6 opacity-25" />
                      <p className="text-xs font-semibold opacity-40">No projects here</p>
                    </div>
                  ) : (
                    colProjects.map(proj => {
                      const isExpanded = expandedId === proj.id
                      const doneTasks = proj.tasks.filter(t => t.done).length
                      const progress = proj.tasks.length > 0
                        ? Math.round((doneTasks / proj.tasks.length) * 100)
                        : 0

                      return (
                        <div
                          key={proj.id}
                          className="group relative p-4 rounded-2xl border border-white/10 glass-card card-hover space-y-3"
                          style={{ borderLeftColor: proj.color, borderLeftWidth: "4px" }}
                        >
                          {/* Title & menu */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm text-text leading-tight">{proj.name}</h3>
                            <div className="relative shrink-0">
                              <button
                                onClick={() => setMenuId(menuId === proj.id ? null : proj.id)}
                                className="p-1 rounded-lg text-muted hover:text-text hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {/* Dropdown menu */}
                              {menuId === proj.id && (
                                <div className="absolute right-0 top-6 z-20 w-44 rounded-xl glass-card border border-white/15 shadow-2xl p-1 text-xs space-y-0.5 animate-slide-up">
                                  <button
                                    onClick={() => openEdit(proj)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted hover:text-text hover:bg-white/10"
                                  >
                                    <Pencil className="w-3.5 h-3.5" /> Edit Project
                                  </button>
                                  <div className="border-t border-white/10 my-1" />
                                  <p className="px-3 py-0.5 text-[9px] font-bold uppercase text-muted/60">Move to</p>
                                  {COLUMNS.filter(c => c.id !== proj.column).map(c => (
                                    <button
                                      key={c.id}
                                      onClick={() => moveColumn(proj.id, c.id)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted hover:text-text hover:bg-white/10 capitalize"
                                    >
                                      <ArrowRight className="w-3 h-3 text-sky-400" /> {c.label}
                                    </button>
                                  ))}
                                  <div className="border-t border-white/10 my-1" />
                                  <button
                                    onClick={() => handleDelete(proj.id)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {proj.description && (
                            <p className="text-xs text-muted leading-relaxed line-clamp-2">{proj.description}</p>
                          )}

                          {/* Progress bar */}
                          {proj.tasks.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between text-[10px] font-semibold text-muted">
                                <span>{doneTasks} of {proj.tasks.length} tasks</span>
                                <span className="text-sky-300 font-bold">{progress}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Expand subtasks toggle */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : proj.id)}
                            className="w-full flex items-center justify-between text-xs text-muted/80 hover:text-sky-300 pt-1 font-semibold transition-colors"
                          >
                            <span>Subtasks ({proj.tasks.length})</span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>

                          {/* Expanded subtask list */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-white/10 space-y-2 animate-slide-up">
                              {proj.tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between gap-2 text-xs group/t">
                                  <button
                                    onClick={() => toggleTask(proj.id, task.id)}
                                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                                  >
                                    {task.done
                                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      : <Circle className="w-3.5 h-3.5 text-muted shrink-0" />
                                    }
                                    <span className={cn("truncate", task.done ? "line-through text-muted/60" : "text-text")}>
                                      {task.title}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => deleteTask(proj.id, task.id)}
                                    className="text-muted hover:text-rose-400 opacity-0 group-hover/t:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}

                              {/* Add task inline */}
                              <AddTaskInline onAdd={title => addTask(proj.id, title)} />
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Project Modal (Create/Edit) ── */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="glass-card border border-sky-400/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-sky-400" />
                  {editingProject ? "Edit Project" : "Create New Project"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-muted hover:text-text">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Project Name *</label>
                  <Input
                    autoFocus
                    placeholder="e.g. AI Workflow Integration"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Description</label>
                  <textarea
                    placeholder="Brief description of goals and scope..."
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/12 px-3 py-2 text-sm text-text resize-none focus:outline-none focus:border-sky-400/60"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Accent Color</label>
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setFormColor(c.value)}
                        className={cn(
                          "w-7 h-7 rounded-full transition-transform",
                          formColor === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110" : ""
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Initial Status</label>
                  <select
                    value={formColumn}
                    onChange={e => setFormColumn(e.target.value as Project["column"])}
                    className="w-full h-10 px-3 rounded-xl border border-white/12 bg-surface text-text text-xs"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="active">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button size="sm" type="submit" disabled={!formName.trim()}>
                    {editingProject ? "Update Project" : "Create Project"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}

function AddTaskInline({ onAdd }: { onAdd: (title: string) => void }) {
  const [active, setActive] = useState(false)
  const [title, setTitle] = useState("")

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title.trim())
      setTitle("")
      setActive(false)
    }
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="w-full flex items-center gap-1.5 py-1 text-xs text-sky-400 hover:text-sky-300 font-bold transition-colors"
      >
        <Plus className="w-3 h-3" /> Add subtask
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5 pt-1">
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setActive(false) }}
        placeholder="Subtask name..."
        className="flex-1 bg-white/5 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-text focus:outline-none focus:border-sky-400"
      />
      <button onClick={handleAdd} className="p-1 text-sky-400 hover:text-sky-300">
        <Check className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => setActive(false)} className="p-1 text-muted hover:text-text">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
