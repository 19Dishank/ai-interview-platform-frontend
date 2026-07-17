'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff, Square, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const transcript = [
  { speaker: 'AI', text: "Hello Arjun, I'm your Verquo interviewer for today's Frontend Engineering assessment. We'll be covering React internals, performance optimisation, and system design. I'll also ask you a live coding challenge toward the end. Are you ready to begin?" },
  { speaker: 'You', text: "Yes, I'm ready. Thanks." },
  { speaker: 'AI', text: "Great. Let's start with a foundational question. Can you explain the difference between React's reconciliation algorithm and the fiber architecture it uses under the hood? Specifically, how does fiber enable concurrent rendering?" },
  { speaker: 'You', text: "Sure. React's reconciliation algorithm is the process by which React updates the virtual DOM. Fiber is the re-implementation of React's core algorithm that was introduced in React 16. The key difference is that Fiber breaks rendering work into small units called fibers — essentially linked list nodes representing components — and allows React to pause, abort, or resume work. This is what enables concurrent features like useTransition and Suspense. Before Fiber, the stack-based reconciler was synchronous and couldn't be interrupted once started." },
  { speaker: 'AI', text: "That's a precise answer. Can you walk me through what happens when setState is called inside a React component? Trace the lifecycle from state update request to DOM commit." },
]

export default function InterviewSession() {
  const router = useRouter()
  const [muted, setMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [waveActive, setWaveActive] = useState(true)
  const [ending, setEnding] = useState(false)
  const [visibleLines, setVisibleLines] = useState(2)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setWaveActive(v => !v), 2000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (visibleLines < transcript.length) {
      const t = setTimeout(() => setVisibleLines(v => v + 1), 3000)
      return () => clearTimeout(t)
    }
  }, [visibleLines])

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const secs = String(elapsed % 60).padStart(2, '0')

  const handleEnd = () => {
    setEnding(true)
    setTimeout(() => router.push('/candidate/processing'), 1500)
  }

  const bars = [3, 5, 8, 6, 4, 7, 5, 9, 6, 4, 8, 5, 3, 7, 6]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm font-mono text-muted-foreground">LIVE · {mins}:{secs}</span>
        </div>
        <div className="font-display font-semibold text-sm">Frontend · React · Senior · Hard</div>
        <Button variant="outline" size="sm" onClick={handleEnd} disabled={ending} className="text-destructive border-destructive/30 hover:bg-destructive/10">
          <Square size={14} /> End interview
        </Button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-0">
        {/* Left: AI voice visualiser */}
        <div className="lg:w-2/5 flex flex-col items-center justify-center gap-8 p-8 border-r border-border min-h-64">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4 relative">
              <Volume2 size={32} className="text-primary" />
              {waveActive && (
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              )}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Verquo AI Interviewer</div>
          </div>

          {/* Audio waveform */}
          <div className="flex items-end gap-1 h-16">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-primary/60 transition-all duration-300"
                style={{
                  height: waveActive ? `${h * 5}px` : `${Math.max(h * 1.5, 6)}px`,
                  transitionDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>

          {/* Mic control */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setMuted(m => !m)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${muted ? 'bg-destructive text-white' : 'bg-secondary text-foreground hover:bg-secondary/70'}`}
            >
              {muted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <span className="text-xs text-muted-foreground">{muted ? 'Microphone muted' : 'Microphone active'}</span>
          </div>

          {/* Your waveform when speaking */}
          {!muted && (
            <div className="flex items-end gap-0.5 h-8">
              {[2, 4, 3, 6, 5, 3, 4, 2, 5, 4, 3, 6, 4].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-success/50 transition-all duration-150"
                  style={{ height: `${h * 3}px`, transitionDelay: `${i * 30}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Live transcript */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-56px)]">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-6">Live transcript</h3>
          <div className="flex flex-col gap-5">
            {transcript.slice(0, visibleLines).map((line, i) => (
              <div key={i} className={`flex gap-3 ${line.speaker === 'You' ? 'justify-end' : 'justify-start'}`}>
                {line.speaker === 'AI' && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-mono shrink-0 mt-0.5">AI</div>
                )}
                <div className={`max-w-lg rounded-xl px-4 py-3 text-sm leading-relaxed ${line.speaker === 'AI' ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground'}`}>
                  {line.text}
                </div>
                {line.speaker === 'You' && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0 mt-0.5">A</div>
                )}
              </div>
            ))}
            {visibleLines < transcript.length && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-mono">AI</div>
                <div className="bg-secondary rounded-xl px-4 py-3 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
