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
  "bg-sky-500/15 text-sky-300 border-sky-500/30",
  "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "bg-rose-500/15 text-rose-300 border-rose-500/30",
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
  const handleAISummarize = (e: React.MouseEvent) => { e.preventDefault(); setCaptureContent(prev => prev + "\n\n**AI Insight:** Key action points extracted.") }

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

  const renderMemory = (memory: Memory) => {
    const isEditing = editingId === memory.id
    const tags = extractTags(memory.content)
    const isPinned = memory.pinned

    if (isEditing) {
      return (
        <div key={memory.id} className="p-4 rounded-2xl glass-card border border-sky-400/40 space-y-3">
          <textarea
            autoFocus
            className="w-full bg-transparent border-none outline-none resize-none text-sm min-h-[90px] text-text leading-relaxed"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button size="sm" onClick={() => saveEdit(memory.id)}>Save Changes</Button>
          </div>
        </div>
      )
    }

    return (
      <div
        key={memory.id}
        className={cn(
          "group relative p-5 rounded-2xl border transition-all duration-200 glass-card card-hover",
          isPinned
            ? "border-sky-400/35 bg-gradient-to-br from-sky-500/10 via-white/[0.02] to-transparent shadow-lg shadow-sky-500/5"
            : "border-white/10 hover:border-sky-400/30"
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {isPinned && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-sky-400 uppercase tracking-widest bg-sky-400/15 border border-sky-400/30 px-2 py-0.5 rounded-full">
                <Pin className="w-2.5 h-2.5" /> Pinned
              </span>
            )}
            <h3 className="font-bold text-sm text-text truncate">
              {memory.title || "Untitled Thought"}
            </h3>
          </div>
          <span className="text-[10px] font-medium text-muted/70 whitespace-nowrap shrink-0">
            {format(new Date(memory.created_at), "MMM d, yyyy")}
          </span>
        </div>

        {/* Content */}
        <p className="text-xs text-text/80 leading-relaxed line-clamp-3 mb-3 font-normal">
          {memory.content}
        </p>

        {/* Hashtags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map(tag => (
              <span
                key={tag}
                className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-0.5", tagColor(tag))}
              >
                <Hash className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* AI summary chip */}
        {memory.ai_summary && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200/90 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">{memory.ai_summary}</p>
          </div>
        )}

        {/* Action bar on hover */}
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1 border-t border-white/5">
          <button
            onClick={() => togglePin(memory.id, memory.pinned)}
            className="p-1.5 rounded-lg text-muted hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
            title={memory.pinned ? "Unpin Note" : "Pin Note"}
          >
            {memory.pinned ? <PinOff className="w-3.5 h-3.5 text-sky-400" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => startEditing(memory)}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-white/10 transition-colors"
            title="Edit Note"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(memory.id)}
            className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="w-full animate-slide-up pb-8 max-w-6xl mx-auto space-y-6">

        {/* Top Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-text">Workspace & Notes</h1>
              <p className="text-xs text-muted mt-1">Capture ideas, structure thoughts, and connect memories.</p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-400 gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 glow-sm">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{streak} Day Streak</span>
            </div>
          </div>

          {/* Project Quick Jump */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {projects.map(proj => (
              <button
                key={proj}
                onClick={() => setActiveProject(activeProject === proj ? null : proj)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all border",
                  activeProject === proj
                    ? "bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 border-sky-400 shadow-md glow-sm"
                    : "glass-card border-white/10 text-muted hover:text-text hover:border-white/20"
                )}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                {proj}
              </button>
            ))}
          </div>

          {/* Up Next Task */}
          {upNextTask && (
            <div className="flex items-center gap-3 p-3.5 glass-card border border-sky-500/25 bg-sky-500/5 rounded-2xl cursor-pointer hover:border-sky-500/40 transition-all card-hover">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="flex-1 flex justify-between items-center min-w-0">
                <span className="text-xs font-bold text-text truncate">Up Next: {upNextTask.title}</span>
                {upNextTask.remind_at && <span className="text-[11px] font-semibold text-sky-300 ml-2 shrink-0">{format(new Date(upNextTask.remind_at), "h:mm a")}</span>}
              </div>
              <ChevronRight className="w-4 h-4 text-muted shrink-0" />
            </div>
          )}

          {/* Enhanced Composer */}
          <div className={cn(
            "border rounded-2xl transition-all duration-200 overflow-hidden",
            isCapturing
              ? "border-sky-500/50 glass-card shadow-2xl shadow-sky-500/10"
              : "border-white/10 glass-card hover:border-white/20"
          )}>
            {isCapturing ? (
              <div className="p-5 space-y-3">
                <textarea
                  autoFocus
                  placeholder="Capture a thought, paste a link, or write markdown..."
                  className="w-full bg-transparent border-none outline-none resize-none text-sm min-h-[130px] text-text leading-relaxed placeholder:text-muted/60"
                  value={captureContent}
                  onChange={e => setCaptureContent(e.target.value)}
                />
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex gap-1.5">
                    {[
                      { icon: <ImageIcon className="h-4 w-4" />, title: "Add Image", onClick: handleInsertImage },
                      { icon: <Link2 className="h-4 w-4" />, title: "Add Link", onClick: handleInsertLink },
                      { icon: <CheckSquare className="h-4 w-4" />, title: "Add To-do", onClick: handleInsertTodo },
                    ].map(({ icon, title, onClick }) => (
                      <button key={title} className="p-2 rounded-xl text-muted hover:text-text hover:bg-white/10 transition-colors" title={title} onClick={onClick}>
                        {icon}
                      </button>
                    ))}
                    <button className="p-2 rounded-xl text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 transition-colors" title="AI Insight Extract" onClick={handleAISummarize}>
                      <Sparkles className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setIsCapturing(false); setCaptureContent("") }}>Cancel</Button>
                    <Button size="sm" onClick={handleSave} disabled={createMemory.isPending || !captureContent.trim()} className="gap-1.5">
                      {createMemory.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Save Note
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsCapturing(true)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-xs text-muted/70 font-medium">What's on your mind? Click to jot down...</span>
                <Button size="sm" className="gap-1.5 text-xs pointer-events-none">
                  <Plus className="h-3.5 w-3.5" /> Capture Note
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* ── Filters & Content Grid ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0",
                  activeFilter === filter
                    ? "bg-sky-400/20 text-sky-300 border-sky-400/40 glow-sm"
                    : "glass-card border-white/10 text-muted hover:text-text hover:border-white/20"
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          {memoriesLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted" />
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted">
              <Sparkles className="w-10 h-10 opacity-25 text-sky-400" />
              <p className="text-xs font-semibold">No notes found matching this view.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pinned section */}
              {pinnedMemories.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                    <Pin className="w-3 h-3" /> Pinned Notes ({pinnedMemories.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {pinnedMemories.map(m => renderMemory(m))}
                  </div>
                </div>
              )}

              {/* Recent section */}
              {recentMemories.length > 0 && (
                <div className="space-y-3">
                  {pinnedMemories.length > 0 && (
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted">
                      Recent Captures ({recentMemories.length})
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {recentMemories.map(m => renderMemory(m))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </AppShell>
  )
}
