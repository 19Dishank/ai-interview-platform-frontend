'use client'

import { useRouter } from 'next/navigation'
import { FileText, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { InterviewHistoryItem } from '@/types'

interface ActiveInterviewReportProps {
  latestInterview: InterviewHistoryItem
  isValid: boolean
}

export default function ActiveInterviewReport({ latestInterview, isValid }: ActiveInterviewReportProps) {
  const router = useRouter()

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Active interview report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-secondary/40 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{latestInterview.domain} · {latestInterview.technology}</span>
              <Badge variant={isValid ? 'success' : 'destructive'}>
                {isValid ? `Valid until ${formatDate(latestInterview.validUntil)}` : 'Expired'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span>Level: {latestInterview.level}</span>
              <span>Difficulty: {latestInterview.difficulty}</span>
              <span>Score: {latestInterview.score}/100</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => router.push('/candidate/report')}>
              <FileText size={14} /> View report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Technical', score: 91, max: 100 },
            { label: 'Communication', score: 82, max: 100 },
            { label: 'Overall', score: 87, max: 100 },
          ].map(s => {
            const color = s.score >= 85 ? 'var(--success)' : s.score >= 65 ? 'var(--primary)' : 'var(--accent)'
            return (
              <div key={s.label} className="text-center">
                <div className="font-mono text-xl font-semibold mb-1" style={{ color }}>{s.score}</div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-1">
                  <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: color }} />
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => router.push('/candidate/history')}
          className="flex items-center justify-between w-full mt-4 pt-4 border-t border-border text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>View all interview history</span>
          <ChevronRight size={16} />
        </button>
      </CardContent>
    </Card>
  )
}
