import { AppShell } from "../components/layout/AppShell"
import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import {
  Sparkles, Send, Bot, User, Zap,
  Mic, MicOff, CheckCircle2, ArrowRight
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
  "Remind me to call client on Friday",
  "Summarize my high priority tasks",
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

      // Create task in state / API
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

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
    setInput("")
    setIsTyping(true)

    // Check if user requested task creation
    const createdTask = parseAndCreateTask(text)

    setTimeout(() => {
      let aiContent = ""
      if (createdTask) {
        aiContent = `I've created the task "${createdTask.title}" and added it to your Task Manager with ${createdTask.priority} priority.`
      } else {
        const responses = [
          "I've searched your workspace. You have 3 active projects and 4 pending tasks for this week.",
          "Based on your notes, your focus area this week has been UI enhancements and productivity optimization.",
          "You've maintained a 4-day streak! Your most active capture time is between 9 AM and 11 AM.",
          "I found 2 notes matching your query. Would you like me to synthesize them into an action plan?"
        ]
        aiContent = responses[Math.floor(Math.random() * responses.length)]
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date(),
          createdTask: createdTask || undefined
        }
      ])
      setIsTyping(false)
    }, 1000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <AppShell>
      <div className="w-full max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] animate-slide-up">

        {/* Header */}
        <header className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-primary/20 border border-violet-500/30 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">Reminex AI Assistant</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-muted">Voice & Text enabled • Natural Task Creation</p>
              </div>
            </div>
          </div>
          <Link to="/tasks">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              View Tasks <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </header>

        {/* Messages Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 pb-6">
              {/* Hero */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-text">Ask your Second Brain anything</h2>
                <p className="text-xs text-muted max-w-sm">
                  Query notes, synthesize projects, or say <span className="text-primary font-mono font-semibold">"Add task: ..."</span> to instantly create to-dos.
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="w-full max-w-md space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted text-center mb-2">Try saying or asking</p>
                <div className="grid grid-cols-1 gap-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="flex items-center gap-2.5 p-3 rounded-xl glass-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 text-left transition-all group card-hover"
                    >
                      <Zap className="w-3.5 h-3.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-text font-medium">{s}</span>
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
                    "w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mb-0.5 shadow-sm",
                    msg.role === 'user'
                      ? "bg-primary/20 border-primary/30"
                      : "bg-violet-500/20 border-violet-500/30"
                  )}>
                    {msg.role === 'user'
                      ? <User className="h-3.5 w-3.5 text-primary" />
                      : <Bot className="h-3.5 w-3.5 text-violet-400" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    "px-4 py-3 text-sm leading-relaxed rounded-2xl space-y-2",
                    msg.role === 'user'
                      ? "bg-primary/15 text-text border border-primary/20 rounded-br-sm"
                      : "glass-card border border-border/50 text-text rounded-bl-sm"
                  )}>
                    <p>{msg.content}</p>

                    {/* Task Created Interactive Card */}
                    {msg.createdTask && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 animate-slide-up">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-text truncate">{msg.createdTask.title}</p>
                            <span className="text-[10px] text-muted">Priority: {msg.createdTask.priority} • Due: {msg.createdTask.deadline}</span>
                          </div>
                        </div>
                        <Link to="/tasks">
                          <button className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black text-[11px] font-bold shrink-0 hover:bg-emerald-400 transition-colors">
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
                <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <div className="glass-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 h-10">
                  {[0, 150, 300].map(delay => (
                    <div
                      key={delay}
                      className="h-2 w-2 bg-muted rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 pt-3 border-t border-border/40">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            {/* Voice Input Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleRecording}
              className={cn(
                "h-12 w-12 rounded-xl transition-all shrink-0",
                isRecording
                  ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                  : "hover:text-primary hover:border-primary/40"
              )}
              title={isRecording ? "Stop recording voice" : "Speak to AI (Voice input)"}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={isRecording ? "Listening to your voice..." : "Ask AI or type 'Add task: ...'"}
                value={input}
                onChange={e => setInput(e.target.value)}
                className="pr-12 h-12 rounded-xl bg-secondary/20 border-border/40 hover:border-border focus:border-primary/50 text-sm transition-all"
                disabled={isTyping}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg transition-all",
                  input.trim() && !isTyping
                    ? "text-primary hover:text-primary/80 hover:bg-primary/10"
                    : "text-muted"
                )}
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <p className="text-[10px] text-muted/50 text-center mt-2">
            Tip: Say or type <span className="text-text font-mono font-medium">"Add task: Buy groceries tomorrow"</span> to auto-schedule tasks.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
