import { TrendingUp, FileText, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface StatCardsProps {
  daysLeft: number
  pct: number
}

export default function StatCards({ daysLeft, pct }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Overall Score', value: '87', unit: '/100', color: 'var(--success)', icon: <TrendingUp size={16} /> },
        { label: 'Profile Views', value: '38', unit: ' this week', color: 'var(--primary)', icon: <FileText size={16} /> },
        { label: 'Report Valid', value: daysLeft.toString(), unit: ' days left', color: daysLeft > 60 ? 'var(--success)' : 'var(--accent)', icon: <Clock size={16} /> },
        { label: 'Profile Complete', value: `${pct}%`, unit: '', color: pct === 100 ? 'var(--success)' : 'var(--accent)', icon: <CheckCircle2 size={16} /> },
      ].map(stat => (
        <Card key={stat.label}>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span className="text-xs">{stat.label}</span>
            </div>
            <div className="font-mono text-2xl font-semibold" style={{ color: stat.color }}>
              {stat.value}<span className="text-sm font-normal text-muted-foreground">{stat.unit}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
