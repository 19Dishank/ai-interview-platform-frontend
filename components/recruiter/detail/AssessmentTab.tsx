import { Star, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ScoreBar } from '@/components/ui/ScoreRing'
import { Candidate } from '@/types'

interface AssessmentTabProps {
  candidate: Candidate
  technicalSkills: { label: string; score: number }[]
}

export default function AssessmentTab({ candidate, technicalSkills }: AssessmentTabProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Technical profile</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {technicalSkills.map(s => <ScoreBar key={s.label} label={s.label} score={s.score} />)}
        </CardContent>
      </Card>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Star size={16} className="text-success" /> Strengths</CardTitle></CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {candidate.strengths.map(s => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />{s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle size={16} className="text-accent" /> Growth areas</CardTitle></CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {candidate.weaknesses.map(w => (
                <li key={w} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />{w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>AI Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{candidate.summary}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
