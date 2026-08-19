import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuthStore } from "../store/authStore"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { cn } from "../lib/utils"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const navigate = useNavigate()

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    if (!password) return { label: "None", score: 0, color: "bg-border" }
    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 10) score += 1
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 1) return { label: "Weak", score: 1, color: "bg-red-500" }
    if (score === 2) return { label: "Fair", score: 2, color: "bg-yellow-500" }
    if (score >= 3) return { label: "Strong", score: 3, color: "bg-emerald-500" }
    return { label: "Weak", score: 1, color: "bg-red-500" }
  }, [password])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (isSignUp && !agreeTerms) {
      setError("Please agree to the Terms of Service to continue.")
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: fullName,
              username: username || email.split("@")[0]
            }
          }
        })
        if (signUpError) throw signUpError
        setSuccess("Account created successfully! Check your email or sign in.")
        setIsSignUp(false)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        navigate("/")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please check credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google authentication failed")
    }
  }

  const handleDevMode = () => {
    // @ts-ignore — Mock session for demo/testing
    useAuthStore.getState().setSession({
      user: {
        id: "dev-user",
        email: "vivek@example.com",
        user_metadata: { name: "Vivek Potnuru", username: "vivek" },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString()
      }
    })
    navigate("/")
  }

  const isValid = email.trim() && password.length >= 6 && (!isSignUp || (fullName.trim() && agreeTerms))

  return (
    <div className="flex min-h-screen w-full bg-background">

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-border/30">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center space-y-6 max-w-sm">
          <div className="mx-auto w-16 h-16 logo-shimmer rounded-2xl flex items-center justify-center shadow-2xl glow-primary">
            <span className="text-black text-3xl font-black">R</span>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold gradient-text">Reminex</h2>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              Your personal intelligent workspace for managing tasks, notes, speech capture, and team collaboration.
            </p>
          </div>

          <div className="space-y-2.5 text-left pt-2">
            {[
              "⚡ Quick Voice & Text Thought Capture",
              "🤖 AI Natural Language Task Scheduler",
              "📊 3-Column Kanban Board & Timers",
              "🔒 Privacy-first offline local architecture",
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-text/80 p-2.5 rounded-xl glass-card border border-border/30">
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text">
              {isSignUp ? "Create your Reminex account" : "Welcome back to Reminex"}
            </h1>
            <p className="text-xs text-muted mt-1">
              {isSignUp
                ? "Enter your details to initialize your second brain workspace."
                : "Sign in with your email and password to access your dashboard."
              }
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs text-danger animate-slide-up">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 animate-slide-up">
              {success}
            </div>
          )}

          {/* Google Auth */}
          <Button variant="outline" className="w-full gap-2 text-xs" onClick={handleGoogleAuth} disabled={loading}>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <span className="relative bg-background px-3 text-[10px] uppercase tracking-wider font-semibold text-muted">
              or credentials
            </span>
          </div>

          <form onSubmit={handleAuth} className="space-y-3.5">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted">Full Name *</label>
                  <Input
                    placeholder="Vivek Potnuru"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required={isSignUp}
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted">Username</label>
                  <Input
                    placeholder="vivek"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">Email Address *</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus={!isSignUp}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted">Password *</label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => alert("Password reset link sent to your registered email.")}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter during signup */}
              {isSignUp && password && (
                <div className="pt-1 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span>Strength</span>
                    <span className="font-bold">{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary/40 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={cn(
                          "h-full flex-1 transition-all",
                          passwordStrength.score >= i ? passwordStrength.color : "bg-border/30"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            {isSignUp && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="text-xs text-muted">
                  I agree to the <span className="text-text font-semibold hover:underline">Terms of Service</span> and <span className="text-text font-semibold hover:underline">Privacy Policy</span>.
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 gap-2 mt-2"
              disabled={loading || !isValid}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                : <>{isSignUp ? "Create Workspace Account" : "Sign In to Workspace"} <ArrowRight className="w-4 h-4" /></>
              }
            </Button>
          </form>

          {/* Toggle Signin / Signup */}
          <p className="text-center text-xs text-muted">
            {isSignUp ? "Already have an account?" : "Don't have an account yet?"}
            <button
              type="button"
              onClick={() => { setIsSignUp(v => !v); setError(null); setSuccess(null) }}
              className="ml-1.5 font-bold text-primary hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up Free"}
            </button>
          </p>

          {/* Dev bypass */}
          <div className="pt-2 border-t border-border/30">
            <button
              type="button"
              onClick={handleDevMode}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-primary/5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Developer Mode — Skip Login
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}
