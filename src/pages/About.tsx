import { AppShell } from "../components/layout/AppShell"
import {
  Globe, MessageSquare, GitBranch, Heart, ExternalLink,
  BookOpen, Coffee, Target, Compass, Sparkles,
  Shield, Brain, Layers, CheckCircle2
} from "lucide-react"

const VERSION = "1.2.0"

const LINKS = [
  { icon: Globe,        label: "GitHub Profile",    href: "https://github.com/vivekp8",         color: "text-blue-400" },
  { icon: GitBranch,    label: "GitHub Repository", href: "https://github.com/vivekp8/Reminex", color: "text-text" },
  { icon: BookOpen,     label: "Documentation",     href: "https://github.com/vivekp8/Reminex#readme", color: "text-emerald-400" },
  { icon: MessageSquare,label: "Community Discord", href: "https://discord.com",        color: "text-indigo-400" },
  { icon: Coffee,       label: "Support Creator",   href: "https://github.com/vivekp8",  color: "text-yellow-400" },
]

export default function About() {
  return (
    <AppShell>
      <div className="w-full space-y-10 animate-slide-up pb-12 max-w-3xl mx-auto">

        {/* ── Hero Brand Header ── */}
        <div className="flex flex-col items-center text-center pt-2 space-y-4">
          <div className="w-20 h-20 logo-shimmer rounded-3xl flex items-center justify-center shadow-2xl glow-primary">
            <span className="text-black text-4xl font-black">R</span>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold gradient-text">Reminex Workspace</h1>
            <p className="text-muted text-sm mt-2 max-w-lg leading-relaxed">
              The intelligent second brain designed to capture thoughts, execute tasks, and eliminate cognitive overload.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted/70">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
              Release v{VERSION}
            </span>
            <span>•</span>
            <span>React 19 + TypeScript + Vite + Supabase</span>
          </div>
        </div>

        {/* ── 1. Vision & Mission ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card border border-primary/20 rounded-2xl p-6 space-y-3 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-text">Our Vision</h2>
            <p className="text-xs text-muted leading-relaxed">
              To create an effortless digital extension of human intellect, where no idea is lost, context switching is eradicated, and daily focus flows naturally.
            </p>
          </div>

          <div className="glass-card border border-violet-500/20 rounded-2xl p-6 space-y-3 bg-gradient-to-br from-violet-500/5 to-transparent">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-text">Our Mission</h2>
            <p className="text-xs text-muted leading-relaxed">
              Empower builders, engineers, and creators with private-first memory capture, AI-driven action extraction, and Kanban project synchronization.
            </p>
          </div>
        </div>

        {/* ── 2. Why Choose Reminex? ── */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Why Reminex?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: <Brain className="w-5 h-5 text-amber-400" />,
                title: "Zero Cognitive Friction",
                desc: "Instant quick-note composer with voice-to-text saves ideas in milliseconds without cluttering your headspace."
              },
              {
                icon: <Shield className="w-5 h-5 text-emerald-400" />,
                title: "Private & Local First",
                desc: "Your data lives in your personal Supabase instance with offline fallback. No tracking or telemetry resale."
              },
              {
                icon: <Sparkles className="w-5 h-5 text-violet-400" />,
                title: "AI-Native Synthesis",
                desc: "Turn spoken commands into structured to-dos, synthesize weekly progress, and search your entire brain."
              }
            ].map(card => (
              <div key={card.title} className="glass-card border border-border/40 rounded-2xl p-5 space-y-2 card-hover">
                <div className="p-2 rounded-lg bg-secondary/30 border border-border/30 inline-block">{card.icon}</div>
                <h3 className="text-sm font-bold text-text">{card.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. What Reminex Can Do (Feature Matrix) ── */}
        <div className="glass-card border border-border/50 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text">Core Capabilities Matrix</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text/90">
            {[
              "🎙️ Web Speech API Real-time Voice Capture",
              "🤖 Natural Language Intent Task Creation",
              "📊 3-Column Kanban Board with Subtask Tracking",
              "📅 Interactive Month Calendar with Priority Dots",
              "📈 SVG Bar Velocity & 12-Week Streak Heatmap",
              "🔤 Dynamic Typography Engine & Permissions Manager",
              "🌙 Do Not Disturb / Sleep Mode with Desktop Alarms",
              "🔗 Teammate Collaboration & Task Share Link Generation",
            ].map(f => (
              <div key={f} className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/15 border border-border/20">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Ecosystem & Links ── */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Ecosystem & Community</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-border/40 hover:border-primary/30 card-hover group transition-all"
              >
                <l.icon className={`w-4 h-4 shrink-0 ${l.color}`} />
                <span className="text-xs font-semibold text-text flex-1">{l.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-border/30 space-y-1.5">
          <p className="text-xs text-muted flex items-center justify-center gap-1.5">
            Designed & Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by{" "}
            <a
              href="https://github.com/vivekp8"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-text hover:text-primary transition-colors"
            >
              Vivek Potnuru (@vivekp8)
            </a>
          </p>
          <p className="text-[10px] text-muted/50">MIT License • Built for high-leverage knowledge workers</p>
        </div>

      </div>
    </AppShell>
  )
}
