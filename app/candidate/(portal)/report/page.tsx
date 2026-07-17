'use client'

import { useRouter } from 'next/navigation'
import { Download, Share2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { mockCandidates, mockEvidenceItems } from '@/data/mock'
import ReportHeader from '@/components/candidate/report/ReportHeader'
import SkillBreakdowns from '@/components/candidate/report/SkillBreakdowns'
import StrengthsWeaknesses from '@/components/candidate/report/StrengthsWeaknesses'
import ReportEvidence from '@/components/candidate/report/ReportEvidence'
import ReportSummary from '@/components/candidate/report/ReportSummary'
import SuggestedSalary from '@/components/candidate/report/SuggestedSalary'

const candidate = mockCandidates[0]

const technicalSkills = [
  { label: 'React internals & lifecycle', score: 95 },
  { label: 'Performance optimisation', score: 92 },
  { label: 'State management patterns', score: 88 },
  { label: 'TypeScript & type systems', score: 84 },
  { label: 'CSS & layout systems', score: 80 },
  { label: 'Testing & quality practices', score: 72 },
  { label: 'Backend / API integration', score: 65 },
]

const communicationSkills = [
  { label: 'Clarity of explanation', score: 86 },
  { label: 'Technical vocabulary', score: 90 },
  { label: 'Structured thinking', score: 84 },
  { label: 'Confidence under pressure', score: 78 },
  { label: 'Active listening', score: 82 },
]

export default function AssessmentReport() {
  const router = useRouter()

  return (
    <>
      <PageHeader
        title="Assessment Report"
        subtitle="This report is a verified record of your AI interview performance."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" type="button"><Share2 size={14} /> Share</Button>
            <Button variant="outline" size="sm" type="button"><Download size={14} /> Download PDF</Button>
          </div>
        }
      />

      <ReportHeader candidate={candidate} />
      <SkillBreakdowns technicalSkills={technicalSkills} communicationSkills={communicationSkills} />
      <StrengthsWeaknesses />
      <ReportEvidence evidenceItems={mockEvidenceItems} />
      <ReportSummary candidateName={candidate.name} />
      <SuggestedSalary candidate={candidate} />

      <div className="flex flex-col sm:flex-row gap-3 justify-end pb-8">
        <Button variant="outline" onClick={() => router.push('/candidate/interview-setup')}>Schedule retake</Button>
        <Button onClick={() => router.push('/candidate/dashboard')}>Back to dashboard</Button>
      </div>
    </>
  )
}
