import { useState } from "react"
import { AppShell } from "../components/layout/AppShell"
import { Mail, Shield, Key, Camera, Check, X, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { cn } from "../lib/utils"
import { useAuthStore } from "../store/authStore"

type EditField = "email" | "password" | "2fa" | null

export default function Profile() {
  const { user } = useAuthStore()
  const [editing, setEditing] = useState<EditField>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  // Email edit state
  const [emailValue, setEmailValue] = useState(user?.email ?? "vivek@example.com")
  const [emailInput, setEmailInput] = useState(emailValue)

  // Password edit state
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState("")

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  const simulateSave = (field: string, onDone: () => void) => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(field)
      onDone()
      setTimeout(() => setSaved(null), 2500)
    }, 900)
  }

  const saveEmail = () => {
    if (!emailInput.trim() || !emailInput.includes("@")) return
    simulateSave("email", () => {
      setEmailValue(emailInput)
      setEditing(null)
    })
  }

  const savePassword = () => {
    if (newPw.length < 6) { setPwError("Password must be at least 6 characters."); return }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return }
    setPwError("")
    simulateSave("password", () => {
      setCurrentPw(""); setNewPw(""); setConfirmPw("")
      setEditing(null)
    })
  }

  const toggle2FA = () => {
    simulateSave("2fa", () => setTwoFAEnabled(v => !v))
  }

  const initials = emailValue.slice(0, 2).toUpperCase()

  return (
    <AppShell>
      <div className="w-full space-y-8 animate-slide-up pb-8 max-w-2xl">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-text">Profile</h1>
          <p className="text-muted text-sm mt-1">Manage your personal information and security.</p>
        </header>

        {/* Avatar card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-3xl glass-card card-hover border border-border/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-400/10 to-transparent pointer-events-none" />
          <div className="relative group z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400/20 via-indigo-500/20 to-purple-500/20 border-2 border-sky-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.2)] pulse-ring relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/30 to-indigo-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-3xl font-extrabold text-sky-300 relative z-10">{initials}</span>
            </div>
            <button
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.5)] hover:scale-110 hover:bg-sky-300 transition-all"
              title="Change avatar (coming soon)"
              onClick={() => alert("Avatar upload coming soon!")}
            >
              <Camera className="w-4 h-4 font-bold" />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-text">Vivek Potnuru</h2>
            <p className="text-sm text-muted mt-0.5">{emailValue}</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full border border-primary/20">Pro Member</span>
              {twoFAEnabled && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">2FA On</span>
              )}
            </div>
          </div>
        </div>

        {/* Save success toast */}
        {saved && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium animate-slide-up">
            <Check className="w-4 h-4 shrink-0" />
            {saved === "email" && "Email updated successfully."}
            {saved === "password" && "Password changed successfully."}
            {saved === "2fa" && `Two-factor authentication ${twoFAEnabled ? "enabled" : "disabled"}.`}
          </div>
        )}

        {/* Account fields */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted">Account Information</h3>

          {/* Email */}
          <div className="glass-card border border-border/30 rounded-2xl overflow-hidden transition-colors focus-within:border-sky-400/40">
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text tracking-tight">Email Address</p>
                  <p className="text-xs text-muted/80">{emailValue}</p>
                </div>
              </div>
              <Button
                variant="ghost" size="sm"
                onClick={() => setEditing(editing === "email" ? null : "email")}
              >
                {editing === "email" ? <><X className="w-3.5 h-3.5 mr-1" />Cancel</> : "Edit"}
              </Button>
            </div>
            {editing === "email" && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-4">
                <Input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="New email address"
                  className="h-9 text-sm"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(null); setEmailInput(emailValue) }}>Cancel</Button>
                  <Button size="sm" onClick={saveEmail} disabled={saving || !emailInput.trim()}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Save Email
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="glass-card border border-border/30 rounded-2xl overflow-hidden transition-colors focus-within:border-indigo-400/40">
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text tracking-tight">Password</p>
                  <p className="text-xs text-muted/80">Last changed 3 months ago</p>
                </div>
              </div>
              <Button
                variant="ghost" size="sm"
                onClick={() => setEditing(editing === "password" ? null : "password")}
              >
                {editing === "password" ? <><X className="w-3.5 h-3.5 mr-1" />Cancel</> : "Change"}
              </Button>
            </div>
            {editing === "password" && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-4">
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="Current password"
                    className="h-9 text-sm pr-10"
                    autoFocus
                  />
                  <button
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <Input
                  type={showPw ? "text" : "password"}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="h-9 text-sm"
                />
                <Input
                  type={showPw ? "text" : "password"}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-9 text-sm"
                />
                {pwError && <p className="text-xs text-danger">{pwError}</p>}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(null); setPwError("") }}>Cancel</Button>
                  <Button size="sm" onClick={savePassword} disabled={saving || !currentPw || !newPw || !confirmPw}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Update Password
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 2FA */}
          <div className="glass-card border border-border/30 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2.5 rounded-xl border transition-all duration-300",
                  twoFAEnabled
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-secondary/20 border-border/30 text-muted"
                )}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text tracking-tight">Two-Factor Authentication</p>
                  <p className="text-xs text-muted/80">{twoFAEnabled ? "Enabled — your account is protected" : "Add an extra layer of security"}</p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={toggle2FA}
                disabled={saving}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none",
                  twoFAEnabled ? "bg-emerald-500" : "bg-secondary/60 border border-border/50"
                )}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white absolute inset-0 m-auto" />
                ) : (
                  <span className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md",
                    twoFAEnabled ? "left-6" : "left-1"
                  )} />
                )}
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="glass-card border border-danger/20 rounded-xl p-4 mt-6">
            <h3 className="text-sm font-bold text-danger mb-1">Danger Zone</h3>
            <p className="text-xs text-muted mb-3">Permanently delete your account and all data. This cannot be undone.</p>
            <Button
              variant="outline"
              size="sm"
              className="border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/60 hover:!text-danger"
              onClick={() => confirm("Are you sure? This action is permanent and cannot be undone.") && alert("Account deletion requested.")}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
