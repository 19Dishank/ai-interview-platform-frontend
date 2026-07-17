'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

const stages = [
  'Transcribing audio...',
  'Analysing technical responses...',
  'Evaluating communication patterns...',
  'Scoring domain knowledge...',
  'Compiling evidence timeline...',
  'Generating assessment report...',
]

export default function InterviewProcessing() {
  const router = useRouter()
  const [stageIdx, setStageIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIdx(i => {
        if (i >= stages.length - 1) {
          clearInterval(interval)
          setTimeout(() => { setDone(true) }, 800)
          setTimeout(() => router.push('/candidate/report'), 2500)
          return i
        }
        return i + 1
      })
    }, 900)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full">
        {!done ? (
          <>
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-8">
              <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold mb-2">Generating your report</h1>
            <p className="text-muted-foreground text-sm mb-8">This usually takes 60–90 seconds. Please don&apos;t close this tab.</p>
            <div className="flex flex-col gap-2 text-left">
              {stages.map((s, i) => (
                <div key={s} className={`flex items-center gap-3 text-sm transition-colors duration-300 ${i < stageIdx ? 'text-success' : i === stageIdx ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                  {i < stageIdx ? (
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                  ) : i === stageIdx ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                  )}
                  {s}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={36} className="text-success" />
            </div>
            <h1 className="font-display text-2xl font-semibold mb-2">Report ready</h1>
            <p className="text-muted-foreground text-sm">Your assessment report has been generated. Redirecting…</p>
          </div>
        )}
      </div>
    </div>
  )
}
