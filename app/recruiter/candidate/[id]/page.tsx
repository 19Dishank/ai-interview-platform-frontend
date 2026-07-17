'use client'

import React, { useState } from 'react'
import { mockCandidates, mockEvidenceItems } from '@/data/mock'
import ContactModal from '@/components/recruiter/ContactModal'
import DetailHeader from '@/components/recruiter/detail/DetailHeader'
import ProfileTab from '@/components/recruiter/detail/ProfileTab'
import InterviewTab from '@/components/recruiter/detail/InterviewTab'
import AssessmentTab from '@/components/recruiter/detail/AssessmentTab'

const technicalSkills = [
  { label: 'Core domain knowledge', score: 93 },
  { label: 'Problem-solving approach', score: 88 },
  { label: 'Code quality & patterns', score: 85 },
  { label: 'System design awareness', score: 89 },
  { label: 'Testing & quality mindset', score: 72 },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CandidateDetail({ params }: PageProps) {
  const { id } = React.use(params)
  const candidate = mockCandidates.find(c => c.id === id) || mockCandidates[0]
  const [contactOpen, setContactOpen] = useState(false)
  const [tab, setTab] = useState<'profile' | 'interview' | 'assessment'>('profile')

  return (
    <>
      <DetailHeader candidate={candidate} onContactClick={() => setContactOpen(true)} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {(['profile', 'interview', 'assessment'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px cursor-pointer ${tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t === 'interview' ? 'Interview & transcript' : t}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab candidate={candidate} />}
      {tab === 'interview' && <InterviewTab candidate={candidate} evidenceItems={mockEvidenceItems} />}
      {tab === 'assessment' && <AssessmentTab candidate={candidate} technicalSkills={technicalSkills} />}

      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        candidate={candidate}
      />
    </>
  )
}
