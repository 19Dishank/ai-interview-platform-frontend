'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function Hero() {
  const router = useRouter()

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-3xl">
          <Badge variant="outline" className="mb-6">Now in beta — free for candidates</Badge>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight tracking-tight mb-6">
            One interview.<br />
            <span style={{ color: 'var(--primary)' }}>Verified for every recruiter.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            Verquo lets you take a rigorous AI interview once and share that verified assessment with any recruiter who&apos;s interested — no more repeating yourself in every early screening call.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              id="hero-btn-candidate"
              size="lg"
              onClick={() => router.push('/signup?role=candidate')}
            >
              I&apos;m a candidate <ArrowRight size={18} />
            </Button>
            <Button
              id="hero-btn-recruiter"
              size="lg"
              variant="outline"
              onClick={() => router.push('/signup?role=recruiter')}
            >
              I hire engineers <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
