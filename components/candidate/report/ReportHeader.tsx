import { Shield, Calendar, Clock, Mic2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Candidate } from '@/types'
import { formatDate } from '@/lib/utils'

interface ReportHeaderProps {
  candidate: Candidate
}

export default function ReportHeader({ candidate }: ReportHeaderProps) {
  const scoreColor = (score: number) => score >= 85 ? 'var(--success)' : score >= 65 ? 'var(--primary)' : 'var(--accent)'

  return (
    <Card className="mb-6">
      <CardContent className="py-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <img src={candidate.photo} alt={candidate.name} className="w-20 h-20 rounded-full object-cover border-2 border-border shrink-0" />
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">{candidate.name}</h2>
                <p className="text-muted-foreground">{candidate.title} · {candidate.experience} years experience</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="success"><Shield size={11} /> Verified</Badge>
                  <Badge variant="outline">{candidate.domain} · {candidate.technology}</Badge>
                  <Badge variant="outline">{candidate.level}</Badge>
                  <Badge variant="warning">{candidate.difficulty}</Badge>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                {[
                  { label: 'Overall', score: candidate.overallScore },
                  { label: 'Technical', score: candidate.technicalScore },
                  { label: 'Communication', score: candidate.communicationScore },
                ].map(({ label, score }) => (
                  <div key={label} className="text-center">
                    <div className="font-mono text-2xl font-semibold" style={{ color: scoreColor(score) }}>{score}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1"><Calendar size={12} /> Interviewed {formatDate(candidate.interviewDate)}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> Valid until {formatDate(candidate.validUntil)}</span>
              <span className="flex items-center gap-1"><Mic2 size={12} /> ~58 minutes · {candidate.difficulty} difficulty</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
