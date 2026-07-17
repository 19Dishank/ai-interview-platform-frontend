'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ProfileItem {
  label: string
  done: boolean
}

interface ProfileCompletionProps {
  profileCompletion: ProfileItem[]
  pct: number
}

export default function ProfileCompletion({ profileCompletion, pct }: ProfileCompletionProps) {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile completion</CardTitle>
          <span className="font-mono text-sm" style={{ color: pct === 100 ? 'var(--success)' : 'var(--accent)' }}>{pct}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-2 rounded-full bg-secondary mb-4 overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex flex-col gap-2">
          {profileCompletion.map(item => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.done
                ? <CheckCircle2 size={14} className="text-success shrink-0" />
                : <AlertCircle size={14} className="text-accent shrink-0" />}
              <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
            </div>
          ))}
        </div>
        {pct < 100 && (
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => router.push('/candidate/profile/build')}>
            Complete profile
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
