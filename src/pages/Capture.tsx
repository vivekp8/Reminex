import { AppShell } from "../components/layout/AppShell"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Save, Loader2, Tag, Folder, CheckCircle } from "lucide-react"
import { useCreateMemory } from "../api/queries"
import { useNavigate } from "react-router-dom"
import { cn } from "../lib/utils"

export default function Capture() {
  const [content, setContent] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const { mutate: createMemory, isPending } = useCreateMemory()
  const navigate = useNavigate()
  
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' '
          }
        }
        if (finalTranscript) {
          setContent((prev) => (prev ? prev.trim() + ' ' + finalTranscript.trim() : finalTranscript.trim()))
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
      setIsRecording(true)
    }
  }

  const handleSave = () => {
    if (!content.trim()) return
    
    createMemory(content, {
      onSuccess: () => {
        setSaveSuccess(true)
        setTimeout(() => {
          navigate('/timeline')
        }, 800)
      }
    })
  }

  return (
    <AppShell>
      <div className="space-y-6 h-full flex flex-col w-full animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text">Quick Note</h2>
          <p className="text-muted mt-1">Save a thought in seconds.</p>
        </div>
        
        <Card className={cn(
          "flex-1 flex flex-col border-2 transition-all duration-300 shadow-sm hover:-translate-y-0 hover:shadow-md",
          isRecording ? "border-danger/50 shadow-[0_0_20px_rgba(220,38,38,0.15)] ring-4 ring-danger/10" : "focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10",
          saveSuccess ? "border-success bg-success/5" : ""
        )}>
          <CardContent className="p-6 md:p-8 flex-1 flex flex-col relative h-full">
            {isRecording && (
              <div className="absolute top-6 right-6 flex items-center space-x-2 text-danger animate-pulse bg-danger/10 px-3 py-1.5 rounded-full z-10">
                <div className="h-2 w-2 rounded-full bg-danger shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                <span className="text-xs font-bold uppercase tracking-wider">Listening</span>
              </div>
            )}
            
            <textarea
              className="flex-1 w-full resize-none border-0 bg-transparent text-2xl leading-relaxed focus:outline-none placeholder:text-muted/40 transition-colors font-medium text-text/90"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending || saveSuccess}
              autoFocus
            />
            
            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-6">
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={cn(
                    "rounded-full transition-all duration-300 w-12 h-12 shadow-none", 
                    isRecording 
                      ? "bg-danger/10 text-danger border-danger hover:bg-danger/20 hover:text-danger scale-110" 
                      : "hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                  )}
                  onClick={toggleRecording}
                  disabled={isPending || !recognitionRef.current || saveSuccess}
                  title={!recognitionRef.current ? "Speech recognition not supported" : "Toggle voice capture"}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button variant="outline" size="sm" disabled={isPending || saveSuccess} className="hidden sm:flex rounded-full px-4 border-dashed font-medium text-muted hover:text-text">
                  <Tag className="mr-2 h-4 w-4" />
                  Add Tag
                </Button>
                <Button variant="outline" size="sm" disabled={isPending || saveSuccess} className="hidden sm:flex rounded-full px-4 border-dashed font-medium text-muted hover:text-text">
                  <Folder className="mr-2 h-4 w-4" />
                  Collection
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                {!content.trim() && !isRecording && (
                  <span className="text-sm font-medium text-muted/60 hidden sm:inline-block">Start typing or recording</span>
                )}
                <Button 
                  onClick={handleSave} 
                  disabled={!content.trim() || isPending || saveSuccess}
                  className={cn("transition-all min-w-[120px] shadow-sm", saveSuccess ? "bg-success hover:bg-success text-white" : "")}
                  size="lg"
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Saved
                    </>
                  ) : isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
