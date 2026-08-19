import { useState, useMemo } from "react"
import { AppShell } from "../components/layout/AppShell"
import { Input } from "../components/ui/Input"
import { useMemories, useDeleteMemory } from "../api/queries"
import type { Memory } from "../api/queries"
import {
  Search as SearchIcon, Loader2, SlidersHorizontal,
  Pin, Link2, Image, CheckSquare, Clock, X
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "../lib/utils"

type FilterType = "All" | "Pinned" | "Links" | "Images" | "To-dos"

function highlight(text: string, query: string) {
  if (!query.trim()) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-primary/30 text-primary rounded px-0.5">{part}</mark>
      : part
  )
}

export default function Search() {
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("All")
  const [showFilters, setShowFilters] = useState(false)
  const { data: memories, isLoading } = useMemories()
  const deleteMemory = useDeleteMemory()

  const filters: { id: FilterType; icon: React.ReactNode }[] = [
    { id: "All",    icon: null },
    { id: "Pinned", icon: <Pin className="w-3 h-3" /> },
    { id: "Links",  icon: <Link2 className="w-3 h-3" /> },
    { id: "Images", icon: <Image className="w-3 h-3" /> },
    { id: "To-dos", icon: <CheckSquare className="w-3 h-3" /> },
  ]

  const filtered = useMemo(() => {
    if (!memories) return []
    return memories.filter(m => {
      const q = query.toLowerCase()
      const matchesQuery = !q ||
        m.title?.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.ai_summary?.toLowerCase().includes(q)

      const matchesFilter = (() => {
        if (activeFilter === "All")    return true
        if (activeFilter === "Pinned") return m.pinned
        if (activeFilter === "Links")  return m.content.includes("http")
        if (activeFilter === "Images") return m.content.includes("![")
        if (activeFilter === "To-dos") return m.content.includes("- [ ]") || m.content.includes("- [x]")
        return true
      })()

      return matchesQuery && matchesFilter
    })
  }, [memories, query, activeFilter])

  const handleDelete = (id: string) => {
    if (confirm("Delete this note?")) deleteMemory.mutate(id)
  }

  const renderCard = (memory: Memory) => (
    <div
      key={memory.id}
      className="group flex flex-col p-4 rounded-xl glass-card border border-border/30 hover:border-border/60 card-hover"
    >
      <div className="flex items-baseline justify-between mb-1.5 gap-2">
        <h3 className="text-sm font-bold text-text group-hover:text-primary transition-colors truncate flex-1">
          {highlight(memory.title || "Untitled", query)}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {memory.pinned && <Pin className="w-3 h-3 text-primary/70" />}
          <span className="text-[10px] text-muted flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {format(new Date(memory.created_at), "MMM d, yyyy")}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted leading-relaxed line-clamp-2 flex-1">
        {highlight(memory.content, query)}
      </p>
      {/* Action row */}
      <div className="flex items-center justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => handleDelete(memory.id)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <X className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  )

  return (
    <AppShell>
      <div className="w-full space-y-6 animate-slide-up pb-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text">Archive</h1>
            <p className="text-muted text-sm mt-1">
              {isLoading ? "Loading…" : `${filtered.length} of ${memories?.length ?? 0} notes`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
              showFilters
                ? "bg-primary/10 border-primary/30 text-primary"
                : "glass-card border-border/40 text-muted hover:text-text hover:border-border"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" />
          <Input
            className="pl-10 h-12 rounded-xl text-sm bg-secondary/20 border-border/40 hover:border-border focus:border-primary/50"
            placeholder="Search notes, titles, summaries…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-slide-up">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  activeFilter === f.id
                    ? "bg-primary/15 border-primary/30 text-primary glow-sm"
                    : "glass-card border-border/40 text-muted hover:text-text hover:border-border"
                )}
              >
                {f.icon}
                {f.id}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-muted">
            <SearchIcon className="w-12 h-12 opacity-20" />
            <div className="text-center">
              <p className="text-sm font-semibold text-text/50">
                {query ? `No results for "${query}"` : "No notes yet."}
              </p>
              <p className="text-xs text-muted/60 mt-1">
                {query ? "Try different keywords or clear the filter." : "Capture your first note from the Dashboard."}
              </p>
            </div>
            {query && (
              <button
                onClick={() => { setQuery(""); setActiveFilter("All") }}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {query && (
              <p className="text-xs text-muted px-1">
                <span className="text-primary font-semibold">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""} for "<span className="text-text">{query}</span>"
              </p>
            )}
            {filtered.map(renderCard)}
          </div>
        )}
      </div>
    </AppShell>
  )
}
