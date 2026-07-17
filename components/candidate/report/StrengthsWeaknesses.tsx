import { Star, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function StrengthsWeaknesses() {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Strengths */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Star size={16} className="text-success" /> Demonstrated strengths</CardTitle></CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {[
              { label: 'System design & architecture', note: 'Consistently proposed layered, scalable solutions with appropriate trade-off reasoning.' },
              { label: 'React performance optimisation', note: 'Deep knowledge of memoisation, lazy loading, and render scheduling.' },
              { label: 'Code quality thinking', note: 'Unprompted discussion of testability, readability, and error boundaries.' },
              { label: 'Technical communication', note: 'Used precise vocabulary; analogies were accurate rather than oversimplified.' },
            ].map(s => (
              <li key={s.label} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                <div>
                  <div className="font-medium text-sm">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.note}</div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle size={16} className="text-accent" /> Areas for growth</CardTitle></CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {[
              { label: 'Backend & systems knowledge', note: 'Solid awareness but limited depth on database internals and distributed trade-offs.' },
              { label: 'Test coverage discipline', note: 'Acknowledged test importance but rarely led with test strategy in solutions.' },
              { label: 'Handling ambiguous requirements', note: 'Occasionally moved to implementation before fully exploring problem constraints.' },
            ].map(w => (
              <li key={w.label} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <div>
                  <div className="font-medium text-sm">{w.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{w.note}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 p-3 bg-accent/8 border border-accent/20 rounded-lg">
            <p className="text-xs text-muted-foreground">These are growth observations, not disqualifiers. They reflect the honest output of a rigorous assessment.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
