import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ScoreBar } from '@/components/ui/ScoreRing'

interface SkillItem {
  label: string
  score: number
}

interface SkillBreakdownsProps {
  technicalSkills: SkillItem[]
  communicationSkills: SkillItem[]
}

export default function SkillBreakdowns({ technicalSkills, communicationSkills }: SkillBreakdownsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Technical skills */}
      <Card>
        <CardHeader><CardTitle>Technical skill breakdown</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {technicalSkills.map(s => <ScoreBar key={s.label} label={s.label} score={s.score} />)}
        </CardContent>
      </Card>

      {/* Communication */}
      <Card>
        <CardHeader><CardTitle>Communication breakdown</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {communicationSkills.map(s => <ScoreBar key={s.label} label={s.label} score={s.score} />)}

          <div className="mt-2 p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Communication is assessed independently from technical knowledge. A high communication score reflects ability to articulate complex concepts clearly, not enthusiasm or tone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
