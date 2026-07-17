import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Candidate } from '@/types'

interface SuggestedSalaryProps {
  candidate: Candidate
}

export default function SuggestedSalary({ candidate }: SuggestedSalaryProps) {
  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>Suggested market range</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-display text-3xl font-semibold mb-1">₹30–38 LPA</div>
            <p className="text-sm text-muted-foreground">Estimated range based on assessed skill level, seniority, and current market data for {candidate.technology} engineers in {candidate.location.split(',')[0]}.</p>
          </div>
          <Badge variant="outline" className="self-start sm:self-center text-xs">Candidate expectation: {candidate.salaryExpectation}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
