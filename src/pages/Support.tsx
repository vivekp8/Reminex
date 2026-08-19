import { useState } from "react"
import { AppShell } from "../components/layout/AppShell"
import { HelpCircle, MessageCircle, FileText, Mail, ExternalLink, ChevronDown, ChevronUp, Send, Check, Loader2 } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { cn } from "../lib/utils"

const FAQS = [
  { q: "How do I create a new note?",          a: "Go to the Dashboard and click the 'Capture a new note…' bar, or use the 'New Note' button in the sidebar." },
  { q: "Can I use Reminex offline?",            a: "Yes! Reminex falls back to local mock data when Supabase is unavailable, so you can always capture notes." },
  { q: "How does the AI Chat work?",            a: "Connect your OpenAI API key to the backend to enable real AI responses over your saved memories." },
  { q: "How do I delete a note permanently?",   a: "Delete a note from the Dashboard. It moves to Trash where you can restore or permanently delete it." },
  { q: "Can I export my data?",                 a: "Head to Settings → Export Data to download all notes and tasks as JSON." },
]

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setSubject(""); setMessage("")
    }, 1200)
  }

  const supportOptions = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Live Chat",
      desc: "Talk to support in real-time",
      action: () => window.open("mailto:support@reminex.com?subject=Chat%20Request", "_blank"),
      label: "Start Chat",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Documentation",
      desc: "Guides, tutorials and API docs",
      action: () => window.open("https://github.com/vivekp8/Reminex#readme", "_blank"),
      label: "View Docs",
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: "Community",
      desc: "Ask questions, share tips & discuss",
      action: () => window.open("https://github.com/vivekp8/Reminex/discussions", "_blank"),
      label: "Join",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      desc: "support@reminex.com",
      action: () => window.open("mailto:support@reminex.com", "_blank"),
      label: "Send Email",
    },
  ]

  return (
    <AppShell>
      <div className="w-full space-y-10 animate-slide-up pb-8 max-w-2xl">

        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-text">Support</h1>
          <p className="text-muted text-sm mt-1">We're here to help. Choose how you'd like to reach us.</p>
        </header>

        {/* Support option cards */}
        <div className="grid grid-cols-2 gap-3">
          {supportOptions.map((opt, i) => (
            <button
              key={i}
              onClick={opt.action}
              className="p-5 rounded-xl glass-card border border-border/50 hover:border-primary/30 card-hover text-left group flex flex-col gap-3 transition-all"
            >
              <div className="p-2.5 bg-secondary/30 border border-border/30 rounded-lg inline-flex text-muted group-hover:text-primary transition-colors group-hover:border-primary/30">
                {opt.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-text flex items-center justify-between">
                  {opt.title}
                  <ExternalLink className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-muted mt-0.5">{opt.desc}</p>
              </div>
              <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity -mt-1">
                {opt.label} →
              </span>
            </button>
          ))}
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Frequently Asked</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass-card border border-border/40 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-secondary/20 transition-colors"
                >
                  <span className="text-sm font-medium text-text pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted leading-relaxed border-t border-border/30 pt-3 animate-slide-up">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="glass-card border border-border/50 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-text">Open a Ticket</h2>
            <p className="text-xs text-muted mt-0.5">We typically respond within 24 hours on business days.</p>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center py-8 gap-3 animate-slide-up">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="font-semibold text-text">Ticket submitted!</p>
              <p className="text-sm text-muted text-center">We'll get back to you at your registered email address shortly.</p>
              <Button size="sm" variant="ghost" onClick={() => setSubmitted(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleTicket} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Subject</label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  className="h-10"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail…"
                  rows={5}
                  disabled={submitting}
                  className={cn(
                    "w-full rounded-xl bg-secondary/20 border border-border/50 px-3 py-2.5 text-sm text-text placeholder:text-muted resize-none",
                    "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!subject.trim() || !message.trim() || submitting} className="gap-2">
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    : <><Send className="w-4 h-4" /> Submit Ticket</>
                  }
                </Button>
              </div>
            </form>
          )}
        </div>

      </div>
    </AppShell>
  )
}
