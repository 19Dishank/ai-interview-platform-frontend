import { Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export default function CooldownNote() {
  return (
    <Card className="mt-6 border-dashed">
      <CardContent className="py-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Clock size={16} className="text-accent shrink-0 mt-0.5" />
          <span>Interview retake available in <strong className="text-foreground font-mono">47 days</strong>. You can retake once every 90 days per domain/technology combination.</span>
        </div>
      </CardContent>
    </Card>
  )
}
