import { AppShell } from "../components/layout/AppShell"
import { useState, useRef, useEffect } from "react"
import { Input } from "../components/ui/Input"
import {
  Sparkles, Send, Bot, User, Zap,
  Mic, MicOff, CheckCircle2
} from "lucide-react"
import { useCreateReminder } from "../api/queries"
import { Link } from "react-router-dom"
import { cn } from "../lib/utils"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  createdTask?: {
    title: string
    deadline?: string
    priority?: string
  }
}

const SUGGESTIONS = [
  "Add task: Review sprint backlog tomorrow at 10 AM",
  "What notes did I capture this week?",
  "Remind me to submit project draft on Friday",
  "Summarize my active high-priority objectives",
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const createReminder = useCreateReminder()

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript
        }
        if (transcript) {
          setInput(prev => (prev ? prev.trim() + " " + transcript.trim() : transcript.trim()))
        }
      }

      recognitionRef.current.onerror = () => setIsRecording(false)
      recognitionRef.current.onend = () => setIsRecording(false)
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      try {
        recognitionRef.current?.start()
        setIsRecording(true)
      } catch (e) {
        console.error("Speech recognition start failed", e)
      }
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const parseAndCreateTask = (text: string) => {
    const lower = text.toLowerCase()
    const taskTriggers = ["create task:", "add task:", "todo:", "remind me to", "schedule task:"]
    const matchedTrigger = taskTriggers.find(t => lower.includes(t))

    if (matchedTrigger) {
      const startIndex = lower.indexOf(matchedTrigger) + matchedTrigger.length
      const taskTitle = text.slice(startIndex).trim() || "New Task from AI Assistant"

      createReminder.mutate({
        title: taskTitle,
        priority: lower.includes("urgent") || lower.includes("high") ? "High" : "Medium",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
      })

      return {
        title: taskTitle,
        priority: lower.includes("urgent") || lower.includes("high") ? "High" : "Medium",
        deadline: "Tomorrow"
      }
    }
    return null
  }

  const sendMessage = (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text) return

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Check for task creation trigger
    const createdTask = parseAndCreateTask(text)

    setTimeout(() => {
      let botReply = ""

      if (createdTask) {
        botReply = `Got it! I created the task "${createdTask.title}" with ${createdTask.priority} priority. It's now synchronized with your workspace task manager.`
      } else if (text.toLowerCase().includes("note") || text.toLowerCase().includes("summary")) {
        botReply = "I synthesized your recent entries. You have multiple captures focused on design systems, goal setting, and product roadmaps."
      } else {
        botReply = `I've registered your input: "${text}". You can ask me to extract tasks, summarize your second brain, or organize sprint objectives.`
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: botReply,
        timestamp: new Date(),
        createdTask: createdTask || undefined
      }

      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 700)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto w-full animate-slide-up">

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg glow-primary">
              <Bot className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-base font-black text-text flex items-center gap-2">
                Reminex AI Assistant
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse glow-sm" />
              </h1>
              <p className="text-[11px] text-muted">Speech-enabled intelligence for memory & task management</p>
            </div>
          </div>
          <button
            onClick={() => setMessages([])}
            className="text-xs font-semibold text-muted hover:text-text px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            Clear History
          </button>
        </div>

        {/* Message Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-400/20 via-indigo-500/20 to-purple-500/20 border border-sky-400/30 flex items-center justify-center shadow-2xl glow-primary">
                <Sparkles className="w-8 h-8 text-sky-300" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h2 className="text-xl font-black text-text gradient-text">How can I assist your workflow?</h2>
                <p className="text-xs text-muted leading-relaxed">
                  Type or use your microphone to ask questions, synthesize ideas, or schedule tasks naturally.
                </p>
              </div>

              {/* Suggestions */}
              <div className="w-full max-w-md space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60 text-center mb-2">Try saying or asking</p>
                <div className="grid grid-cols-1 gap-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="flex items-center gap-2.5 p-3 rounded-2xl glass-card border border-white/10 hover:border-sky-400/40 hover:bg-sky-500/5 text-left transition-all group card-hover"
                    >
                      <Zap className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-text/90 font-medium">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={msg.id}
                className={cn("flex w-full animate-slide-up", msg.role === 'user' ? 'justify-end' : 'justify-start')}
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <div className={cn("flex max-w-[85%] gap-2.5 items-end", msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mb-0.5 shadow-sm",
                    msg.role === 'user'
                      ? "bg-sky-500/20 border-sky-400/40"
                      : "bg-purple-500/20 border-purple-400/40 glow-violet"
                  )}>
                    {msg.role === 'user'
                      ? <User className="h-4 w-4 text-sky-300" />
                      : <Bot className="h-4 w-4 text-purple-300" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    "px-4 py-3 text-xs leading-relaxed rounded-2xl space-y-2 shadow-md",
                    msg.role === 'user'
                      ? "bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-text border border-sky-400/30 rounded-br-sm"
                      : "glass-card border border-white/10 text-text rounded-bl-sm"
                  )}>
                    <p className="leading-relaxed">{msg.content}</p>

                    {/* Task Created Interactive Card */}
                    {msg.createdTask && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-slide-up">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-text truncate">{msg.createdTask.title}</p>
                            <span className="text-[10px] text-emerald-300/80 font-medium">Priority: {msg.createdTask.priority} • Due: {msg.createdTask.deadline}</span>
                          </div>
                        </div>
                        <Link to="/tasks">
                          <button className="px-3 py-1 rounded-lg bg-emerald-400 text-slate-950 text-[10px] font-bold shrink-0 hover:bg-emerald-300 transition-colors">
                            Open Tasks
                          </button>
                        </Link>
                      </div>
                    )}

                    <p className="text-[9px] text-muted text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex w-full justify-start animate-slide-up">
              <div className="flex gap-2.5 items-end">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-purple-300" />
                </div>
                <div className="glass-card border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 h-10">
                  {[0, 150, 300].map(delay => (
                    <div
                      key={delay}
                      className="h-2 w-2 bg-sky-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="shrink-0 pt-3 border-t border-white/10">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={cn(
                "h-12 w-12 rounded-2xl border flex items-center justify-center transition-all shrink-0",
                isRecording
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
                  : "glass-card border-white/10 text-muted hover:text-sky-300 hover:border-sky-400/40"
              )}
              title={isRecording ? "Stop recording voice" : "Speak to AI (Voice input)"}
            >
              {isRecording ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
            </button>

            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={isRecording ? "Listening to your voice..." : "Ask AI or type 'Add task: ...'"}
                value={input}
                onChange={e => setInput(e.target.value)}
                className="pr-12 h-12 rounded-2xl bg-white/[0.04] border-white/12 text-xs focus:border-sky-400/60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 flex items-center justify-center font-bold disabled:opacity-30 disabled:pointer-events-none hover:shadow-md hover:scale-105 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </AppShell>
  )
}
