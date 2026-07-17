'use client'

import { useRouter } from 'next/navigation'
import { PlayCircle, Shield, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/Shell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { mockInterviewHistory } from '@/data/mock'
import { formatDate } from '@/lib/utils'

export default function InterviewHistory() {
  const router = useRouter()

  return (
    <>
      <PageHeader
        title="Interview history"
        subtitle="You can retake interviews once every 90 days. Recruiters see your highest active score by default."
        action={
          <Button onClick={() => router.push('/candidate/interview-setup')}>
            <PlayCircle size={16} /> Take new interview
          </Button>
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground font-mono uppercase tracking-wide">
                <th className="text-left px-4 py-3">Interview topic</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Difficulty</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Date taken</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Valid until</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockInterviewHistory.map(item => {
                const color = item.score >= 85 ? 'var(--success)' : item.score >= 65 ? 'var(--primary)' : 'var(--accent)'
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-sm flex items-center gap-1.5">
                          {item.domain} · {item.technology}
                          {item.id === 'h1' && <Badge variant="success" className="text-[10px] py-0 px-1.5"><Shield size={8} /> active</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono sm:hidden mt-0.5">{item.difficulty} · {formatDate(item.date)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{item.difficulty}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{formatDate(item.date)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{formatDate(item.validUntil)}</td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color }}>{item.score}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === 'completed' ? 'success' : 'outline'} className="capitalize">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'completed' ? (
                        <button onClick={() => router.push('/candidate/report')}
                          className="flex items-center gap-1 text-xs text-primary hover:underline ml-auto cursor-pointer">
                          <FileText size={12} /> View report
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
