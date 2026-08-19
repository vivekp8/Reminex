import { useState, useMemo } from "react"
import { AppShell } from "../components/layout/AppShell"
import { useMemories, useReminders, useCreateMemory, useUpdateMemory, useDeleteMemory } from "../api/queries"
import type { Memory } from "../api/queries"
import {
  Loader2, Plus, Send, Image as ImageIcon, Link2, Sparkles,
  FolderOpen, Pin, PinOff, Flame, CheckCircle2, ChevronRight,
  CheckSquare, Pencil, Trash2, Hash
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "../components/ui/Button"
import { cn } from "../lib/utils"

// Extract hashtags from content
function extractTags(content: string): string[] {
  const matches = content.match(/#[\w]+/g) ?? []
  return [...new Set(matches.map(t => t.slice(1)))]
}

const TAG_COLORS = [
  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "bg-pink-500/15 text-pink-400 border-pink-500/30",
]

function tagColor(tag: string) {
  let hash = 0
  for (const c of tag) hash = (hash << 5) - hash + c.charCodeAt(0)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export default function Dashboard() {
  const { data: memories, isLoading: memoriesLoading } = useMemories()
  const { data: reminders } = useReminders()
  const createMemory = useCreateMemory()
  const updateMemory = useUpdateMemory()
  const deleteMemory = useDeleteMemory()

  const [isCapturing, setIsCapturing] = useState(false)
  const [captureContent, setCaptureContent] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [activeProject, setActiveProject] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const handleInsertLink = (e: React.MouseEvent) => { e.preventDefault(); setCaptureContent(prev => prev + (prev ? '\n' : '') + "[title](https://)") }
  const handleInsertImage = (e: React.MouseEvent) => { e.preventDefault(); setCaptureContent(prev => prev + (prev ? '\n' : '') + "![alt text](https://)") }
  const handleInsertTodo = (e: React.MouseEvent) => { e.preventDefault(); setCaptureContent(prev => prev + (prev ? '\n' : '') + "- [ ] ") }
  const handleAISummarize = (e: React.MouseEvent) => { e.preventDefault(); setCaptureContent(prev => prev + "\n\n**AI Note:** Needs more context to summarize.") }

  const handleSave = () => {
    if (!captureContent.trim()) return
    createMemory.mutate(captureContent, {
      onSuccess: () => { setCaptureContent(""); setIsCapturing(false) }
    })
  }

  const startEditing = (memory: Memory) => { setEditingId(memory.id); setEditContent(memory.content) }
  const saveEdit = (id: string) => {
    if (!editContent.trim()) return
    updateMemory.mutate({ id, updates: { content: editContent } }, {
      onSuccess: () => { setEditingId(null); setEditContent("") }
    })
  }
  const togglePin = (id: string, currentPinned: boolean) =>
    updateMemory.mutate({ id, updates: { pinned: !currentPinned } })
  const handleDelete = (id: string) => {
    if (confirm("Delete this note?")) deleteMemory.mutate(id)
  }

  const streak = useMemo(() => {
    if (!memories || memories.length === 0) return 0
    return [...new Set(memories.map(m => new Date(m.created_at).toDateString()))].length
  }, [memories])

  const upNextTask = reminders?.find(r => !r.completed)
  const filters = ["All", "Pinned", "Links", "Images", "To-dos"]
  const projects = ["Website Redesign", "Q3 Goals", "Personal Journal"]

  const filteredMemories = useMemo(() => {
    if (!memories) return []
    return memories.filter(m => {
      if (activeProject && !m.content.toLowerCase().includes(activeProject.toLowerCase())) return false
      if (activeFilter === "All") return true
      if (activeFilter === "Pinned") return m.pinned
      if (activeFilter === "Links") return m.content.includes("http")
      if (activeFilter === "Images") return m.content.includes("![")
      if (activeFilter === "To-dos") return m.content.includes("- [ ]") || m.content.includes("- [x]")
      return true
    })
  }, [memories, activeFilter, activeProject])

  const pinnedMemories = filteredMemories.filter(m => m.pinned)
  const recentMemories = filteredMemories.filter(m => !m.pinned)

  const renderMemory = (memory: Memory, isPinnedSection = false) => {
    const isEditing = editingId === memory.id
    const tags = extractTags(memory.content)

    if (isEditing) {
      return (
        <div key={memory.id} className="flex flex-col p-4 rounded-xl glass-card border border-primary/30 shadow-lg shadow-primary/5">
          <textarea
            autoFocus
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-text min-h-[100px] mb-3 leading-relaxed"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button size="sm" onClick={() => saveEdit(memory.id)} disabled={updateMemory.isPending || !editContent.trim()}>
              {updateMemory.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div
        key={memory.id}
        className={cn(
          "group relative flex flex-col p-4 rounded-xl border transition-all duration-200 glass-card card-hover",
          isPinnedSection
            ? "bg-primary/3 border-primary/15"
            : "border-border/30 hover:border-border/60"
        )}
      >
        {/* Pinned badge */}
        {memory.pinned && (
          <div className="absolute top-3 right-3">
            <Pin className="w-3 h-3 text-primary/70" />
          </div>
        )}

        <div className="flex items-baseline justify-between mb-1.5 pr-6">
          <h3 className="text-sm font-bold text-text group-hover:text-primary transition-colors truncate">
            {memory.title || "Untitled"}
          </h3>
          <span className="text-[10px] text-muted flex-shrink-0 ml-2">
            {format(new Date(memory.created_at), "MMM d")}
          </span>
        </div>

        <p className="text-sm text-muted/80 line-clamp-3 leading-relaxed mb-2">
          {memory.content}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.slice(0, 4).map(tag => (
              <span key={tag} className={cn("inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border", tagColor(tag))}>
                <Hash className="w-2 h-2" />{tag}
              </span>
            ))}
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-background/90 backdrop-blur-md rounded-lg shadow-lg border border-border/60 px-1 py-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted hover:text-primary rounded-md" onClick={() => togglePin(memory.id, memory.pinned)} title={memory.pinned ? "Unpin" : "Pin"}>
            {memory.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted hover:text-primary rounded-md" onClick={() => startEditing(memory)} title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted hover:text-red-400 rounded-md" onClick={() => handleDelete(memory.id)} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="w-full animate-slide-up pb-8">

        <header className="space-y-5 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight text-text">Dashboard</h1>
            <div className="flex items-center text-muted text-sm font-medium gap-1.5">
              <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500' : 'text-muted'}`} />
              <span>{streak} day streak</span>
            </div>
          </div>

          {/* Project Quick Jump */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {projects.map(proj => (
              <button
                key={proj}
                onClick={() => setActiveProject(activeProject === proj ? null : proj)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all border",
                  activeProject === proj
                    ? "bg-text text-background border-text"
                    : "glass-card border-border/40 text-muted hover:text-text hover:border-border"
                )}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                {proj}
              </button>
            ))}
          </div>

          {/* Up Next Task */}
          {upNextTask && (
            <div className="flex items-center gap-3 p-3.5 glass-card border border-primary/15 bg-primary/5 rounded-xl cursor-pointer hover:border-primary/30 transition-all card-hover">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 flex justify-between items-center min-w-0">
                <span className="text-sm font-semibold text-text truncate">Up Next: {upNextTask.title}</span>
                {upNextTask.remind_at && <span className="text-xs text-muted ml-2 shrink-0">{format(new Date(upNextTask.remind_at), "h:mm a")}</span>}
              </div>
              <ChevronRight className="w-4 h-4 text-muted shrink-0" />
            </div>
          )}

          {/* Enhanced Composer */}
          <div className={cn(
            "border rounded-xl transition-all duration-200",
            isCapturing
              ? "border-primary/40 glass-card shadow-lg shadow-primary/5"
              : "border-border/30 glass-card hover:border-border/60"
          )}>
            {isCapturing ? (
              <div className="p-4">
                <textarea
                  autoFocus
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent border-none outline-none resize-none text-sm min-h-[120px] mb-3 text-text leading-relaxed placeholder:text-muted"
                  value={captureContent}
                  onChange={e => setCaptureContent(e.target.value)}
                />
                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <div className="flex gap-1">
                    {[
                      { icon: <ImageIcon className="h-4 w-4" />, title: "Add Image", onClick: handleInsertImage },
                      { icon: <Link2 className="h-4 w-4" />, title: "Add Link", onClick: handleInsertLink },
                      { icon: <CheckSquare className="h-4 w-4" />, title: "Add To-do", onClick: handleInsertTodo },
                    ].map(({ icon, title, onClick }) => (
                      <Button key={title} variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-text rounded-lg" title={title} onClick={onClick}>
                        {icon}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" title="AI Summarize" onClick={handleAISummarize}>
                      <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setIsCapturing(false); setCaptureContent("") }}>Cancel</Button>
                    <Button size="sm" onClick={handleSave} disabled={createMemory.isPending || !captureContent.trim()}>
                      {createMemory.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group cursor-text h-12 flex items-center" onClick={() => setIsCapturing(true)}>
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="pl-10 text-muted text-sm w-full">Capture a new note…</div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted hover:text-text rounded-lg" onClick={e => { e.stopPropagation(); setIsCapturing(true); handleInsertImage(e) }}>
                    <ImageIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted hover:text-text rounded-lg" onClick={e => { e.stopPropagation(); setIsCapturing(true); handleInsertTodo(e) }}>
                    <CheckSquare className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full transition-all border",
                  activeFilter === filter
                    ? "bg-primary/15 text-primary border-primary/30 glow-sm"
                    : "border-transparent text-muted hover:text-text hover:bg-secondary/30"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </header>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main feed */}
          <div className="xl:col-span-2 space-y-3">
            {memoriesLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted" />
              </div>
            ) : (
              <>
                {(activeFilter === "All" || activeFilter === "Pinned") && pinnedMemories.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
                      <Pin className="w-3.5 h-3.5 text-primary" />
                      <span className="text-primary">Pinned</span>
                    </div>
                    <div className="space-y-2">
                      {pinnedMemories.map(m => renderMemory(m, true))}
                    </div>
                  </div>
                )}
                {activeFilter !== "Pinned" && (
                  <div className="space-y-2">
                    {pinnedMemories.length > 0 && activeFilter === "All" && (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3 mt-6">
                        Recent
                      </div>
                    )}
                    {recentMemories.length > 0
                      ? recentMemories.map(m => renderMemory(m, false))
                      : (
                        <div className="py-16 text-center text-muted flex flex-col items-center gap-3">
                          <Sparkles className="w-10 h-10 opacity-20" />
                          <p className="text-sm">No notes found. Start capturing!</p>
                        </div>
                      )
                    }
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            <div className="glass-card border border-border/50 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-text">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: memories?.length ?? 0, label: "Total Notes", color: "text-primary" },
                  { value: pinnedMemories.length, label: "Pinned", color: "text-primary" },
                  { value: streak, label: "Day Streak", color: "text-orange-400" },
                  { value: projects.length, label: "Projects", color: "text-text" },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-lg bg-background/50 border border-border/20 text-center">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-muted mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card border border-primary/20 rounded-xl p-5 bg-primary/3 space-y-2">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> AI Insight
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                You've been most productive on weekday mornings. Consider scheduling deep work sessions before noon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
