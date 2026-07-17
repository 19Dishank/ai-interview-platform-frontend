'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlayCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { mockInterviewHistory } from '@/data/mock'
import StatCards from '@/components/candidate/StatCards'
import ProfileCompletion from '@/components/candidate/ProfileCompletion'
import ActiveInterviewReport from '@/components/candidate/ActiveInterviewReport'
import CooldownNote from '@/components/candidate/CooldownNote'

const profileCompletionData = [
  { label: 'Basic info', done: true },
  { label: 'Resume uploaded', done: true },
  { label: 'Skills added', done: true },
  { label: 'GitHub connected', done: false },
  { label: 'LinkedIn connected', done: true },
  { label: 'Salary expectation', done: false },
]

export default function CandidateDashboard() {
  const router = useRouter()
  const [now] = useState(() => Date.now())
  const latestInterview = mockInterviewHistory[0]
  const isValid = new Date(latestInterview.validUntil).getTime() > now
  const daysLeft = Math.max(0, Math.ceil((new Date(latestInterview.validUntil).getTime() - now) / (1000 * 60 * 60 * 24)))

  const doneCount = profileCompletionData.filter(p => p.done).length
  const pct = Math.round((doneCount / profileCompletionData.length) * 100)

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Good morning, Arjun. Your profile is being discovered by 12 recruiters this week."
        action={
          <Button onClick={() => router.push('/candidate/interview-setup')}>
            <PlayCircle size={16} /> Take new interview
          </Button>
        }
      />

      <StatCards daysLeft={daysLeft} pct={pct} />

      <div className="grid lg:grid-cols-3 gap-6">
        <ProfileCompletion profileCompletion={profileCompletionData} pct={pct} />
        <ActiveInterviewReport latestInterview={latestInterview} isValid={isValid} />
      </div>

      <CooldownNote />
    </>
  )
}
