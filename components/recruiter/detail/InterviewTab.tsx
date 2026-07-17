import { Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Candidate, EvidenceItem } from '@/types'

interface InterviewTabProps {
  candidate: Candidate
  evidenceItems: EvidenceItem[]
}

export default function InterviewTab({ candidate, evidenceItems }: InterviewTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Recording placeholder */}
      <Card>
        <CardHeader><CardTitle>Interview recording</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg bg-secondary flex items-center justify-center h-48 gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors">
              <Play size={22} className="text-primary ml-0.5" />
            </div>
            <div>
              <div className="font-medium text-sm text-foreground">Interview recording</div>
              <div className="text-xs">58:12 · Frontend · React · Hard</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript excerpt */}
      <Card>
        <CardHeader><CardTitle>Transcript (excerpt)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {[
              { speaker: 'AI', text: "Can you explain the difference between React's reconciliation algorithm and the fiber architecture? Specifically, how does fiber enable concurrent rendering?" },
              { speaker: candidate.name, text: "Sure. React's reconciliation algorithm is the process by which React updates the virtual DOM. Fiber is the re-implementation of React's core algorithm that was introduced in React 16. The key difference is that Fiber breaks rendering work into small units called fibers — essentially linked list nodes — and allows React to pause, abort, or resume work. This enables concurrent features like useTransition and Suspense." },
              { speaker: 'AI', text: "That's precise. Can you walk me through what happens when setState is called inside a React component? Trace the lifecycle from update request to DOM commit." },
              { speaker: candidate.name, text: "When setState is called, React schedules a re-render. In concurrent mode, it goes through the scheduler to assign priority. Then React processes the fiber tree in the render phase — no side effects — producing a new tree. The commit phase then applies the changes to the DOM in three sub-phases: before mutation, mutation, and layout." },
            ].map((line, i) => (
              <div key={i} className={`flex gap-3 ${line.speaker !== 'AI' ? 'justify-end' : ''}`}>
                {line.speaker === 'AI' && <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-mono shrink-0">AI</div>}
                <div className={`max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed ${line.speaker === 'AI' ? 'bg-secondary' : 'bg-primary text-primary-foreground'}`}>
                  {line.text}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evidence */}
      <Card>
        <CardHeader><CardTitle>Evidence timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-[68px] top-0 bottom-0 w-px bg-border" />
            <div className="flex flex-col gap-5">
              {evidenceItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="font-mono text-xs text-muted-foreground w-14 pt-0.5 text-right shrink-0">{item.timestamp}</span>
                  <div className="w-2 h-2 rounded-full bg-primary border-2 border-card mt-1.5 shrink-0 z-10" />
                  <p className="text-sm leading-relaxed">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
