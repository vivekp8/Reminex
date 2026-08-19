import { AppShell } from "../components/layout/AppShell"
import { useMemories, useDeleteMemory } from "../api/queries"
import type { Memory } from "../api/queries"
import { format, isToday, isYesterday, isThisWeek } from "date-fns"
import { Loader2, Sparkles, Plus, Trash2, Pin } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"

function groupByDate(items: Memory[]): [string, Memory[]][] {
  const map = new Map<string, Memory[]>()
  items.forEach(item => {
    const d = new Date(item.created_at)
    let label: string
    if (isToday(d))           label = "Today"
    else if (isYesterday(d))  label = "Yesterday"
    else if (isThisWeek(d))   label = format(d, "EEEE")
    else                       label = format(d, "MMMM d, yyyy")
    const existing = map.get(label) ?? []
    existing.push(item)
    map.set(label, existing)
  })
  return Array.from(map.entries())
}

export default function Timeline() {
  const { data: memories, isLoading, error } = useMemories()
  const deleteMemory = useDeleteMemory()

  const sorted = memories
    ? [...memories].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : []

  const grouped = groupByDate(sorted)

  return (
    <AppShell>
      <div className="w-full space-y-8 animate-slide-up pb-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text">My Brain</h1>
            <p className="text-muted text-sm mt-1">
              {memories ? `${memories.length} memories captured` : "A chronological view of your memories."}
            </p>
          </div>
          <Link to="/capture">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Capture New
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-danger/10 text-danger rounded-xl border border-danger/20 text-sm font-medium">
            Failed to load memories. Check your Supabase configuration.
          </div>
        )}

        {!isLoading && memories?.length === 0 && (
          <div className="flex flex-col items-center py-24 gap-5 text-muted">
            <div className="w-16 h-16 glass-card border border-border/40 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 opacity-30" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-text/50">No memories yet</p>
              <p className="text-xs text-muted/60">Start capturing your thoughts.</p>
            </div>
            <Link to="/capture">
              <Button size="sm">Capture your first thought</Button>
            </Link>
          </div>
        )}

        {/* Timeline groups */}
        {!isLoading && grouped.map(([label, items]) => (
          <div key={label} className="space-y-3">
            {/* Date separator */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</span>
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-[10px] text-muted/50">{items.length}</span>
            </div>

            {/* Items with timeline line */}
            <div className="relative pl-6 space-y-2">
              {/* Vertical line */}
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gradient-to-b from-primary/30 via-border/30 to-transparent" />

              {items.map((mem: Memory) => (
                <div key={mem.id} className="group relative">
                  {/* Dot */}
                  <div className="absolute -left-3.5 top-4 w-2 h-2 rounded-full bg-primary/60 ring-2 ring-background group-hover:bg-primary group-hover:scale-125 transition-all" />

                  <div className="ml-2 p-4 rounded-xl glass-card border border-border/30 hover:border-border/60 card-hover">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-text group-hover:text-primary transition-colors truncate">
                            {mem.title || "Untitled"}
                          </h3>
                          {mem.pinned && <Pin className="w-3 h-3 text-primary/70 shrink-0" />}
                        </div>
                        <p className="text-sm text-muted leading-relaxed line-clamp-3">{mem.content}</p>

                        {mem.ai_summary && (
                          <div className="mt-3 flex gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15">
                            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-muted leading-relaxed">{mem.ai_summary}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[10px] text-muted whitespace-nowrap">
                          {format(new Date(mem.created_at), "h:mm a")}
                        </span>
                        <button
                          onClick={() => confirm("Delete this memory?") && deleteMemory.mutate(mem.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
