'use client'

import { useRouter } from 'next/navigation'
import { Star, AlertTriangle, Shield, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Candidate } from '@/types'

interface CandidateGridProps {
  candidates: Candidate[]
}

export default function CandidateGrid({ candidates }: CandidateGridProps) {
  const router = useRouter()
  const scoreColor = (score: number) => score >= 85 ? 'var(--success)' : score >= 65 ? 'var(--primary)' : 'var(--accent)'

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {candidates.map(c => {
        const color = scoreColor(c.overallScore)
        return (
          <Card key={c.id} className="hover:border-primary/40 transition-colors cursor-pointer group" onClick={() => router.push(`/recruiter/candidate/${c.id}`)}>
            <CardContent className="py-5">
              <div className="flex items-start gap-3 mb-3">
                <img src={c.photo} alt={c.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.location}</div>
                </div>
                <div className="text-center shrink-0">
                  <div className="font-mono text-lg font-semibold" style={{ color }}>{c.overallScore}</div>
                  <div className="text-xs text-muted-foreground">score</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant="success"><Shield size={10} /> Verified</Badge>
                <Badge variant="outline">{c.level}</Badge>
                <Badge variant="outline">{c.difficulty}</Badge>
              </div>

              <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">{c.summary}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {c.skills.slice(0, 3).map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-secondary rounded-full">{s}</span>
                ))}
                {c.skills.length > 3 && <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">+{c.skills.length - 3}</span>}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {c.strengths.slice(0, 2).map(s => (
                  <span key={s} className="flex items-center gap-1 text-xs text-success"><Star size={10} />{s}</span>
                ))}
                {c.weaknesses.slice(0, 1).map(w => (
                  <span key={w} className="flex items-center gap-1 text-xs text-accent"><AlertTriangle size={10} />{w}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">{c.salaryExpectation}</span>
                <span className="flex items-center gap-1 text-primary group-hover:underline">View profile <ChevronRight size={12} /></span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
