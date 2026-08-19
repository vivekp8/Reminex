import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { supabase } from "./lib/supabase"
import { useAuthStore } from "./store/authStore"

import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"

import Search from "./pages/Search"
import Chat from "./pages/Chat"

import Tasks from "./pages/Tasks"
import Calendar from "./pages/Calendar"
import Projects from "./pages/Projects"
import Settings from "./pages/Settings"
import Trash from "./pages/Trash"
import NotFound from "./pages/NotFound"

// New Pages
import Home from "./pages/Home"
import Notifications from "./pages/Notifications"
import Performance from "./pages/Performance"
import Profile from "./pages/Profile"
import Support from "./pages/Support"
import About from "./pages/About"
import History from "./pages/History"
import Timeline from "./pages/Timeline"
import Capture from "./pages/Capture"
import Reminders from "./pages/Reminders"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuthStore()
  if (!session) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  const { setSession } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        {/* Main Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        
        {/* Organization Routes */}
        <Route path="/archive" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
        <Route path="/capture" element={<ProtectedRoute><Capture /></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
        <Route path="/trash" element={<ProtectedRoute><Trash /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        {/* User & System Routes */}
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
        
        {/* Legacy redirect */}
        <Route path="/search" element={<Navigate to="/archive" replace />} />
        
        {/* 404 Route */}
        <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
