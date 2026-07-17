import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

const domains = [
  { domain: 'Frontend', count: 684, pct: 29 },
  { domain: 'Backend', count: 541, pct: 23 },
  { domain: 'Full Stack', count: 468, pct: 20 },
  { domain: 'DevOps', count: 281, pct: 12 },
  { domain: 'ML / AI', count: 234, pct: 10 },
  { domain: 'Mobile', count: 133, pct: 6 },
]

export default function DomainBreakdown() {
  return (
    <Card>
      <CardHeader><CardTitle>Interviews by domain</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {domains.map(d => (
            <div key={d.domain} className="text-center p-3 bg-secondary/40 rounded-lg">
              <div className="font-mono text-xl font-semibold text-primary">{d.count}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{d.domain}</div>
              <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${d.pct * 3}%` }} />
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-1">{d.pct}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
