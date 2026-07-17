import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EvidenceItem } from '@/types'

interface ReportEvidenceProps {
  evidenceItems: EvidenceItem[]
}

export default function ReportEvidence({ evidenceItems }: ReportEvidenceProps) {
  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>Interview evidence timeline</CardTitle></CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-5">Timestamped moments where notable technical ability or reasoning was demonstrated. These are direct observations, not inferences.</p>
        <div className="relative">
          <div className="absolute left-[68px] top-0 bottom-0 w-px bg-border" />
          <div className="flex flex-col gap-5">
            {evidenceItems.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="font-mono text-xs text-muted-foreground w-14 pt-0.5 text-right shrink-0">{item.timestamp}</span>
                <div className="w-2 h-2 rounded-full bg-primary border-2 border-card mt-1.5 shrink-0 z-10" />
                <p className="text-sm text-foreground leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
