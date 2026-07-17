'use client'

import { useRouter } from 'next/navigation'
import { Shield, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Candidate } from '@/types'

interface CandidateListProps {
  candidates: Candidate[]
}

export default function CandidateList({ candidates }: CandidateListProps) {
  const router = useRouter()
  const scoreColor = (score: number) => score >= 85 ? 'var(--success)' : score >= 65 ? 'var(--primary)' : 'var(--accent)'

  return (
    <div className="flex flex-col gap-3">
      {candidates.map(c => {
        const color = scoreColor(c.overallScore)
        return (
          <Card key={c.id} className="hover:border-primary/40 transition-colors cursor-pointer" onClick={() => router.push(`/recruiter/candidate/${c.id}`)}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <img src={c.photo} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm">{c.name}</span>
                    <Badge variant="success" className="hidden sm:inline-flex"><Shield size={10} /> Verified</Badge>
                    <Badge variant="outline">{c.level}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{c.title} · {c.location}</div>
                </div>
                <div className="hidden md:flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted-foreground font-mono">{c.salaryExpectation}</span>
                  <span className="text-xs text-muted-foreground">{c.noticePeriod}</span>
                </div>
                <div className="text-center shrink-0 mr-2">
                  <div className="font-mono font-semibold" style={{ color }}>{c.overallScore}</div>
                  <div className="text-xs text-muted-foreground">score</div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
