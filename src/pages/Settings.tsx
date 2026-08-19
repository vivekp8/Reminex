import { useState, useEffect } from "react"
import { AppShell } from "../components/layout/AppShell"
import {
  Settings as SettingsIcon, Bell, Moon, Globe,
  Check, Monitor, Sun, Type,
  ShieldCheck, MapPin, AlertTriangle, Send, X, Loader2
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { cn } from "../lib/utils"

type Theme = "dark" | "light" | "system"
type Language = "en" | "hi" | "es" | "fr"
type FontSize = "small" | "normal" | "large"
type FontFamily = "inter" | "system" | "mono"

export default function Settings() {
  const [theme, setTheme] = useState<Theme>("dark")
  const [language, setLanguage] = useState<Language>("en")
  const [fontSize, setFontSize] = useState<FontSize>("normal")
  const [fontFamily, setFontFamily] = useState<FontFamily>("inter")

  // Permissions state
  const [notifPerm, setNotifPerm] = useState<string>("default")
  const [geoPerm, setGeoPerm] = useState<string>("prompt")
  const [permLoading, setPermLoading] = useState<string | null>(null)

  // Feedback / Report modal
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportCategory, setReportCategory] = useState("Bug Report")
  const [reportText, setReportText] = useState("")
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const [notifications, setNotifications] = useState({
    taskReminders: true,
    dailySummary: true,
    streakAlerts: false,
    weeklyReport: true,
  })

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPerm(Notification.permission)
    }
  }, [])

  // Apply dynamic font size to document
  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size)
    const root = document.documentElement
    if (size === "small") root.style.fontSize = "14px"
    else if (size === "normal") root.style.fontSize = "16px"
    else if (size === "large") root.style.fontSize = "18px"
  }

  const handleRequestNotif = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications.")
      return
    }
    setPermLoading("notif")
    try {
      const res = await Notification.requestPermission()
      setNotifPerm(res)
    } catch (e) {
      console.error(e)
    } finally {
      setPermLoading(null)
    }
  }

  const handleRequestGeo = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }
    setPermLoading("geo")
    navigator.geolocation.getCurrentPosition(
      () => {
        setGeoPerm("granted")
        setPermLoading(null)
      },
      () => {
        setGeoPerm("denied")
        setPermLoading(null)
      }
    )
  }

  const toggle = (key: keyof typeof notifications) =>
    setNotifications(n => ({ ...n, [key]: !n[key] }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportText.trim()) return
    setReportSubmitted(true)
    setTimeout(() => {
      setReportSubmitted(false)
      setReportText("")
      setShowReportModal(false)
    }, 1500)
  }

  const THEMES: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: "dark",   label: "Dark Mode",   icon: <Moon className="w-4 h-4" /> },
    { id: "light",  label: "Light Mode",  icon: <Sun className="w-4 h-4" /> },
    { id: "system", label: "System Sync", icon: <Monitor className="w-4 h-4" /> },
  ]

  const LANGUAGES: { id: Language; label: string }[] = [
    { id: "en", label: "English" },
    { id: "hi", label: "हिंदी" },
    { id: "es", label: "Español" },
    { id: "fr", label: "Français" },
  ]

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn(
        "relative w-10 h-5.5 rounded-full transition-all duration-300 focus:outline-none shrink-0",
        checked ? "bg-primary" : "bg-secondary/60 border border-border/50"
      )}
      style={{ height: "22px", width: "40px" }}
    >
      <span className={cn(
        "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow",
        checked ? "left-5" : "left-0.5"
      )} />
    </button>
  )

  return (
    <AppShell>
      <div className="w-full space-y-8 animate-slide-up pb-8 max-w-3xl">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text">Settings & Controls</h1>
            <p className="text-muted text-sm mt-1">Configure appearance, typography, permissions and notifications.</p>
          </div>
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              saved
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 glow-sm"
                : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
            )}
          >
            {saved ? <><Check className="w-3.5 h-3.5" /> Changes Saved!</> : <><SettingsIcon className="w-3.5 h-3.5" /> Save Preferences</>}
          </button>
        </header>

        {/* ── 1. Typography & Display ── */}
        <section className="glass-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border/30">
            <Type className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text">Typography & Appearance</h2>
          </div>
          <div className="p-5 space-y-5">
            {/* Theme selector */}
            <div>
              <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Color Theme</p>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 py-3 rounded-xl border text-xs font-semibold transition-all",
                      theme === t.id
                        ? "bg-primary/15 border-primary/40 text-primary glow-sm"
                        : "border-border/40 text-muted hover:text-text hover:border-border"
                    )}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Selector */}
            <div>
              <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Font Size</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "small", label: "Small (14px)", desc: "Compact view" },
                  { id: "normal", label: "Normal (16px)", desc: "Balanced standard" },
                  { id: "large", label: "Large (18px)", desc: "High legibility" },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleFontSizeChange(s.id as FontSize)}
                    className={cn(
                      "flex flex-col items-center p-2.5 rounded-xl border transition-all text-center",
                      fontSize === s.id
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-border/40 text-muted hover:text-text hover:border-border"
                    )}
                  >
                    <span className="text-xs font-bold">{s.label}</span>
                    <span className="text-[10px] text-muted/60">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family Selector */}
            <div>
              <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Font Family / Style</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "inter", label: "Inter (Modern Sans)", font: "font-sans" },
                  { id: "system", label: "System Native", font: "font-serif" },
                  { id: "mono", label: "Developer Mono", font: "font-mono" },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as FontFamily)}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-medium transition-all text-center",
                      fontFamily === f.id
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-border/40 text-muted hover:text-text hover:border-border",
                      f.font
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Preferred Language
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold transition-all",
                      language === l.id
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border/30 text-muted hover:text-text hover:border-border"
                    )}
                  >
                    {l.label}
                    {language === l.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Device & Browser Permissions ── */}
        <section className="glass-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-text">System & Browser Permissions</h2>
          </div>
          <div className="divide-y divide-border/20">
            {/* Desktop Notifications Permission */}
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-text">Lock & Home Screen Notifications</p>
                <p className="text-xs text-muted">Receive pop-up deadline alarms on your desktop even when Reminex is minimized.</p>
                <span className={cn(
                  "inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                  notifPerm === "granted" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                )}>
                  Status: {notifPerm}
                </span>
              </div>
              <Button
                variant={notifPerm === "granted" ? "ghost" : "outline"}
                size="sm"
                onClick={handleRequestNotif}
                disabled={permLoading === "notif" || notifPerm === "granted"}
                className="gap-1.5 shrink-0"
              >
                {permLoading === "notif" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {notifPerm === "granted" ? "Granted ✓" : "Allow Notifications"}
              </Button>
            </div>

            {/* Geolocation Permission */}
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-text">Location & Timezone Synchronization</p>
                <p className="text-xs text-muted">Auto-adjust reminder times and scheduling based on current local sunrise/timezone.</p>
                <span className={cn(
                  "inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                  geoPerm === "granted" ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary/40 text-muted"
                )}>
                  Status: {geoPerm}
                </span>
              </div>
              <Button
                variant={geoPerm === "granted" ? "ghost" : "outline"}
                size="sm"
                onClick={handleRequestGeo}
                disabled={permLoading === "geo" || geoPerm === "granted"}
                className="gap-1.5 shrink-0"
              >
                {permLoading === "geo" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                {geoPerm === "granted" ? "Synced ✓" : "Sync Location"}
              </Button>
            </div>
          </div>
        </section>

        {/* ── 3. Notification Preferences ── */}
        <section className="glass-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border/30">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text">Notification Channels</h2>
          </div>
          <div className="divide-y divide-border/20">
            {([
              { key: "taskReminders",  label: "Task Reminders",   desc: "Alerts 15 minutes before scheduled deadlines" },
              { key: "dailySummary",   label: "Morning Cockpit Briefing", desc: "Automated daily overview at 8:00 AM" },
              { key: "streakAlerts",   label: "Streak Milestone Alerts",    desc: "Alerts to protect your note-taking streak" },
              { key: "weeklyReport",   label: "Weekly Analytics Summary",  desc: "Detailed performance report every Monday" },
            ] as const).map(item => (
              <div key={item.key} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-text">{item.label}</p>
                  <p className="text-[11px] text-muted">{item.desc}</p>
                </div>
                <ToggleSwitch checked={notifications[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Reports & Feedback Modal Trigger ── */}
        <section className="glass-card border border-border/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Report an Issue or Give Feedback
            </h3>
            <p className="text-xs text-muted mt-0.5">Found a bug or have a suggestion? Send a direct report to our engineering team.</p>
          </div>
          <Button onClick={() => setShowReportModal(true)} variant="outline" size="sm" className="shrink-0 gap-1.5">
            Submit Report
          </Button>
        </section>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card border border-border/60 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Submit Problem Report
                </h3>
                <button onClick={() => setShowReportModal(false)} className="p-1 text-muted hover:text-text">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reportSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" /> Report submitted. Thank you for making Reminex better!
                </div>
              ) : (
                <form onSubmit={handleSendReport} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Category</label>
                    <select
                      value={reportCategory}
                      onChange={e => setReportCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface/50 text-text text-sm"
                    >
                      <option value="Bug Report">Bug Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="UI Glitch">UI / Styling Glitch</option>
                      <option value="Other">Other Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Description</label>
                    <textarea
                      placeholder="Please describe what happened and steps to reproduce..."
                      value={reportText}
                      onChange={e => setReportText(e.target.value)}
                      rows={4}
                      required
                      className="w-full rounded-xl bg-secondary/20 border border-border/50 px-3 py-2 text-sm text-text resize-none focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" type="button" onClick={() => setShowReportModal(false)}>Cancel</Button>
                    <Button size="sm" type="submit" disabled={!reportText.trim()} className="gap-1.5">
                      <Send className="w-3.5 h-3.5" /> Send Report
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}
