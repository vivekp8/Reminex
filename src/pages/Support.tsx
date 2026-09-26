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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {supportOptions.map((opt, i) => (
            <button
              key={i}
              onClick={opt.action}
              className="p-5 rounded-2xl glass-card border border-border/30 hover:border-primary/40 card-hover text-left group flex flex-col gap-4 transition-all overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full mix-blend-screen group-hover:bg-primary/20 transition-all duration-500" />
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl inline-flex text-primary group-hover:scale-110 transition-transform glow-sm shadow-[0_0_15px_rgba(56,189,248,0.15)] relative z-10">
                {opt.icon}
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-text flex items-center justify-between tracking-tight">
                  {opt.title}
                  <ExternalLink className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-muted/80 mt-1">{opt.desc}</p>
              </div>
              <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity relative z-10 mt-auto pt-2">
                {opt.label} &rarr;
              </span>
            </button>
          ))}
        </div>

        {/* FAQ */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Frequently Asked</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className={cn("glass-card border rounded-2xl overflow-hidden transition-all duration-300", openFaq === i ? "border-primary/40 shadow-[0_0_20px_rgba(56,189,248,0.1)]" : "border-border/30 hover:border-white/10")}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className={cn("text-sm font-bold pr-4 transition-colors", openFaq === i ? "text-primary" : "text-text")}>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                  }
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="px-5 pb-5 text-sm text-muted/80 leading-relaxed border-t border-border/20 pt-4">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="glass-card border border-border/30 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden transition-colors focus-within:border-primary/40 focus-within:shadow-[0_0_30px_rgba(56,189,248,0.1)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-text">Open a Ticket</h2>
            <p className="text-xs text-muted/80 mt-1">We typically respond within 24 hours on business days.</p>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center py-10 gap-4 animate-slide-up relative z-10">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-text">Ticket submitted!</p>
                <p className="text-sm text-muted/80 mt-1">We'll get back to you at your registered email address shortly.</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSubmitted(false)} className="mt-2 text-primary hover:bg-primary/10">Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleTicket} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Subject</label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  className="h-12 bg-black/20 focus:bg-black/40 text-sm"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail…"
                  rows={5}
                  disabled={submitting}
                  className={cn(
                    "w-full rounded-2xl bg-black/20 border border-border/30 px-4 py-3 text-sm text-text placeholder:text-muted/50 resize-none",
                    "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors focus:bg-black/40"
                  )}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={!subject.trim() || !message.trim() || submitting} className="gap-2 h-11 px-6 bg-primary text-black font-bold hover:bg-primary-hover shadow-[0_0_15px_rgba(56,189,248,0.4)]">
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
