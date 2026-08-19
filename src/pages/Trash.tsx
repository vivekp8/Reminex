import { useState } from "react"
import { AppShell } from "../components/layout/AppShell"
import { useMemories, useDeleteMemory } from "../api/queries"
import type { Memory } from "../api/queries"
import { Trash2, Loader2, RotateCcw, X, AlertTriangle } from "lucide-react"
import { Button } from "../components/ui/Button"
import { format } from "date-fns"

export default function Trash() {
  const { isLoading } = useMemories()
  const deleteMemory = useDeleteMemory()

  // Simulate a trash bin: show oldest 3 notes as "trashed"
  // In a real app these would have a `deleted_at` field
  const [trashed, setTrashed] = useState<Memory[]>(() =>
    [] // Starts empty; user can "move" items here in the future
  )
  const [showConfirm, setShowConfirm] = useState(false)
  const [, setRestoredIds] = useState<string[]>([])

  const restore = (id: string) => {
    setTrashed(ts => ts.filter(t => t.id !== id))
    setRestoredIds(r => [...r, id])
    setTimeout(() => setRestoredIds(r => r.filter(rid => rid !== id)), 2000)
  }

  const permanentDelete = (id: string) => {
    setTrashed(ts => ts.filter(t => t.id !== id))
    deleteMemory.mutate(id)
  }

  const emptyTrash = () => {
    trashed.forEach(t => deleteMemory.mutate(t.id))
    setTrashed([])
    setShowConfirm(false)
  }

  return (
    <AppShell>
      <div className="w-full space-y-6 animate-slide-up pb-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text">Trash</h1>
            <p className="text-muted text-sm mt-1">
              {trashed.length === 0
                ? "Trash is empty."
                : `${trashed.length} item${trashed.length > 1 ? "s" : ""} — permanently deleted after 30 days`}
            </p>
          </div>
          {trashed.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/60 gap-1.5"
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 className="w-3.5 h-3.5" /> Empty Trash
            </Button>
          )}
        </div>

        {/* Confirm modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
            <div className="relative glass-card border border-danger/30 rounded-2xl p-6 max-w-sm w-full space-y-4 animate-slide-up shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-danger/10 border border-danger/20">
                  <AlertTriangle className="w-5 h-5 text-danger" />
                </div>
                <div>
                  <h3 className="font-bold text-text">Empty Trash?</h3>
                  <p className="text-xs text-muted">This will permanently delete {trashed.length} item(s). This cannot be undone.</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-danger hover:bg-danger/90 text-white border-0"
                  onClick={emptyTrash}
                >
                  Delete Permanently
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted" />
          </div>
        ) : trashed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted">
            <div className="w-16 h-16 rounded-2xl glass-card border border-border/40 flex items-center justify-center">
              <Trash2 className="w-8 h-8 opacity-30" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-text/50">Trash is empty</p>
              <p className="text-xs text-muted/60">Items deleted from the Dashboard will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {trashed.map(item => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-xl glass-card border border-border/30 group"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-muted line-through truncate">{item.title || "Untitled"}</h4>
                  <p className="text-xs text-muted/60 mt-0.5 line-clamp-1">{item.content}</p>
                  <p className="text-[10px] text-muted/40 mt-1">Deleted on {format(new Date(item.updated_at), "MMM d, yyyy")}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => restore(item.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text hover:bg-secondary/40 transition-colors border border-border/30"
                    title="Restore"
                  >
                    <RotateCcw className="w-3 h-3" /> Restore
                  </button>
                  <button
                    onClick={() => permanentDelete(item.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    title="Delete permanently"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
