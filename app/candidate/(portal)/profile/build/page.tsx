'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/Shell'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import BasicInfoForm from '@/components/candidate/profile/BasicInfoForm'
import SkillsExperienceForm from '@/components/candidate/profile/SkillsExperienceForm'
import EducationForm from '@/components/candidate/profile/EducationForm'
import PreferencesForm from '@/components/candidate/profile/PreferencesForm'
import ConnectProfilesForm from '@/components/candidate/profile/ConnectProfilesForm'

const steps = ['Basic info', 'Skills & experience', 'Education', 'Preferences', 'Links']

export default function ProfileBuilder() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1)
    else {
      setSaving(true)
      setTimeout(() => { setSaving(false); router.push('/candidate/dashboard') }, 1200)
    }
  }

  const progress = ((step + 1) / steps.length) * 100

  return (
    <>
      <PageHeader title="Build your profile" subtitle="This information is shown to recruiters along with your interview report." />

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center shrink-0">
            <button
              onClick={() => i <= step && setStep(i)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer',
                i === step ? 'bg-primary text-primary-foreground font-medium' :
                i < step ? 'text-success font-medium hover:bg-secondary' :
                'text-muted-foreground cursor-default',
              )}
            >
              {i < step ? <Check size={14} /> : <span className="font-mono text-xs">{i + 1}</span>}
              <span className="hidden sm:block">{s}</span>
            </button>
            {i < steps.length - 1 && <div className={cn('h-px w-6 mx-1 shrink-0', i < step ? 'bg-success/40' : 'bg-border')} />}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-secondary mb-8 overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-8">
          {step === 0 && <BasicInfoForm />}
          {step === 1 && <SkillsExperienceForm />}
          {step === 2 && <EducationForm />}
          {step === 3 && <PreferencesForm />}
          {step === 4 && <ConnectProfilesForm />}
        </CardContent>

        <div className="flex justify-between items-center p-5 border-t border-border">
          <Button variant="ghost" type="button" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
            <ArrowLeft size={16} /> Back
          </Button>
          <Button onClick={handleNext} loading={saving}>
            {step === steps.length - 1 ? 'Save profile' : 'Continue'}
            {step < steps.length - 1 && <ArrowRight size={16} />}
          </Button>
        </div>
      </Card>
    </>
  )
}
