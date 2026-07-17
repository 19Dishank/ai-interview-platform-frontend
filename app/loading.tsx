'use client'

import { useState, useEffect } from 'react'

const loadingSteps = [
  'Connecting securely to Verquo...',
  'Preparing your workspace...',
  'Loading interview environment...',
  'Verifying session credentials...',
]

export default function Loading() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % loadingSteps.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300">
      {/* Background radial gradient to add visual depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)/0.03,_transparent_70%)] pointer-events-none" />
      
      <div className="relative flex flex-col items-center max-w-xs text-center z-10">
        {/* Animated Custom Logo Spinner */}
        <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
          {/* Pulsing Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping duration-1000 opacity-75" />
          
          {/* Rotating Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '0.8s' }} />
          
          {/* Center Brand Icon */}
          <div className="w-10 h-10 rounded overflow-hidden shadow-lg transform rotate-6 hover:rotate-12 transition-transform duration-200 flex items-center justify-center bg-card">
            <img
              src="/verquo-icon.svg"
              alt="Verquo Icon"
              width={40}
              height={40}
              className="w-full h-full object-contain dark:hidden"
            />
            <img
              src="/verquo-icon-dark.svg"
              alt="Verquo Icon"
              width={40}
              height={40}
              className="w-full h-full object-contain hidden dark:block"
            />
          </div>
        </div>

        {/* Brand Name */}
        <h2 className="font-display text-xl font-semibold mb-2 tracking-tight">Verquo</h2>

        {/* Dynamic loading steps with micro-animations */}
        <div className="h-6 overflow-hidden flex items-center justify-center">
          <p className="text-xs text-muted-foreground font-mono animate-pulse uppercase tracking-wider transition-all duration-300">
            {loadingSteps[stepIndex]}
          </p>
        </div>
      </div>
    </div>
  )
}
