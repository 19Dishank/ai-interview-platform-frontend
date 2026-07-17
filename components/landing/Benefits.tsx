'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const candidateBenefits = [
  'Take one interview for all opportunities',
  'Your report stays valid for 6 months',
  'Control what recruiters can see',
  'Never repeat the same screening call',
]

const recruiterBenefits = [
  'Search pre-screened, evidence-backed candidates',
  'Filter by domain, stack, level, and communication',
  'See timestamped interview evidence',
  'Reach out directly — no intermediary',
]

export default function Benefits() {
  const router = useRouter()

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Candidates */}
        <div className="p-8 bg-card border border-border rounded-xl flex flex-col">
          <Badge variant="success" className="self-start mb-4">For Candidates</Badge>
          <h3 className="font-display text-2xl font-semibold mb-3">Interview once. Let your work speak.</h3>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Stop explaining the same project for the fifteenth time. Take a rigorous technical interview, get a detailed verified report, and share it with every company that&apos;s interested.
          </p>
          <ul className="space-y-2 mb-8">
            {candidateBenefits.map(b => (
              <li key={b} className="flex items-center gap-2 text-sm">
                <CheckCircle size={15} className="text-success shrink-0" />{b}
              </li>
            ))}
          </ul>
          <Button
            id="benefits-btn-candidate"
            onClick={() => router.push('/signup?role=candidate')}
            className="self-start mt-auto"
          >
            Create your profile <ArrowRight size={16} />
          </Button>
        </div>

        {/* Recruiters */}
        <div className="p-8 bg-primary text-primary-foreground rounded-xl flex flex-col">
          <Badge className="self-start mb-4 bg-primary-foreground/20 text-primary-foreground border-0">For Recruiters</Badge>
          <h3 className="font-display text-2xl font-semibold mb-3">Hire from evidence, not first impressions.</h3>
          <p className="text-sm opacity-80 mb-6 leading-relaxed">
            Every candidate in Verquo has already been through a structured technical interview. You see timestamped evidence of their actual thinking — not a polished resume or a referral.
          </p>
          <ul className="space-y-2 mb-8">
            {recruiterBenefits.map(b => (
              <li key={b} className="flex items-center gap-2 text-sm opacity-90">
                <CheckCircle size={15} className="shrink-0 opacity-80" />{b}
              </li>
            ))}
          </ul>
          <Button
            id="benefits-btn-recruiter"
            variant="secondary"
            onClick={() => router.push('/signup?role=recruiter')}
            className="self-start mt-auto"
          >
            Start hiring <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  )
}
