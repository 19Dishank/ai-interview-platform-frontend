'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Shield, MapPin, Calendar, Clock, BarChart2, Banknote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Candidate } from '@/types'
import { formatDate } from '@/lib/utils'

interface DetailHeaderProps {
  candidate: Candidate
  onContactClick: () => void
}

export default function DetailHeader({ candidate, onContactClick }: DetailHeaderProps) {
  const router = useRouter()
  const scoreColor = (s: number) => s >= 85 ? 'var(--success)' : s >= 65 ? 'var(--primary)' : 'var(--accent)'

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push('/recruiter/search')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors cursor-pointer">
          <ArrowLeft size={16} /> Back to search
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/recruiter/compare')}>
            <BarChart2 size={14} /> Compare
          </Button>
          <Button size="sm" onClick={onContactClick}>
            <Mail size={14} /> Contact candidate
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <img src={candidate.photo} alt={candidate.name} className="w-20 h-20 rounded-full object-cover border-2 border-border shrink-0" />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-semibold mb-1">{candidate.name}</h1>
                  <p className="text-muted-foreground text-sm">{candidate.title} · {candidate.experience} years experience</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="success"><Shield size={11} /> Verified</Badge>
                    <Badge variant="outline">{candidate.domain} · {candidate.technology}</Badge>
                    <Badge variant="outline">{candidate.level}</Badge>
                    <Badge variant="warning">{candidate.difficulty} interview</Badge>
                  </div>
                </div>
                <div className="flex gap-6">
                  {[
                    { label: 'Overall', score: candidate.overallScore },
                    { label: 'Technical', score: candidate.technicalScore },
                    { label: 'Comms', score: candidate.communicationScore },
                  ].map(({ label, score }) => (
                    <div key={label} className="text-center">
                      <div className="font-mono text-2xl font-semibold" style={{ color: scoreColor(score) }}>{score}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1"><MapPin size={12} />{candidate.location}</span>
                <span className="flex items-center gap-1"><Calendar size={12} />Interviewed {formatDate(candidate.interviewDate)}</span>
                <span className="flex items-center gap-1"><Clock size={12} />Notice: {candidate.noticePeriod}</span>
                <span className="flex items-center gap-1"><Banknote size={12} />{candidate.salaryExpectation}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
