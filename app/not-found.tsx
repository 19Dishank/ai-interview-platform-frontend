'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, Compass } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Graphics */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-primary)/0.03,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-accent)/0.03,_transparent_60%)] pointer-events-none" />
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative max-w-md w-full bg-card border border-border rounded-xl shadow-xl p-8 sm:p-12 text-center z-10">
        {/* Lost Compass Graphic */}
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6 animate-pulse">
          <Compass size={32} />
        </div>

        {/* Serif 404 Header */}
        <h1 className="font-display text-7xl font-bold tracking-tight mb-2 text-primary">404</h1>
        
        {/* Title */}
        <h2 className="font-display text-xl font-semibold mb-3 tracking-tight">Page not found</h2>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          The page you are looking for doesn&apos;t exist, has been moved, or you might not have authorization to view it.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            id="notfound-btn-home"
            href="/"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Home size={16} /> Back to Home
          </Link>
          <button
            id="notfound-btn-back"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-border bg-transparent text-foreground font-medium text-sm hover:bg-secondary/40 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>

      {/* Brand footer */}
      <div className="mt-8 text-xs text-muted-foreground select-none font-mono">
        Verquo Technical Interview Platform
      </div>
    </div>
  )
}
