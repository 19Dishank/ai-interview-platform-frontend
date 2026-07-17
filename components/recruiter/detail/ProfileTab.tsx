import { GitBranch, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Candidate } from '@/types'

interface ProfileTabProps {
  candidate: Candidate
}

export default function ProfileTab({ candidate }: ProfileTabProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Skills */}
        <Card>
          <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map(s => (
                <span key={s} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm">{s}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader><CardTitle>Work experience</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-5">
            {[
              { role: 'Senior Frontend Engineer', company: 'Acme Corp', period: 'Mar 2021 – Present', desc: 'Led frontend architecture for a B2B SaaS platform serving 40,000 daily users. Reduced initial bundle size by 62% and improved Core Web Vitals scores across all routes.' },
              { role: 'Frontend Developer', company: 'StartupXYZ', period: 'Jun 2018 – Feb 2021', desc: 'Built and maintained the company\'s design system and component library used by 5 product teams. Migrated codebase from class components to hooks.' },
            ].map((exp, i) => (
              <div key={i} className={i > 0 ? 'pt-5 border-t border-border' : ''}>
                <div className="font-medium">{exp.role}</div>
                <div className="text-sm text-muted-foreground">{exp.company} · {exp.period}</div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader><CardTitle>Education</CardTitle></CardHeader>
          <CardContent>
            <div className="font-medium">B.Tech in Computer Science</div>
            <div className="text-sm text-muted-foreground">Indian Institute of Technology, Bombay · 2014–2018 · GPA 8.6/10</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        {/* Links */}
        <Card>
          <CardHeader><CardTitle>Profiles</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <a href={candidate.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <GitBranch size={15} />{candidate.github.replace('https://', '')}
            </a>
            <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Link2 size={15} />{candidate.linkedin.replace('https://', '')}
            </a>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Salary expectation</span><span className="font-mono text-xs">{candidate.salaryExpectation}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Notice period</span><span className="font-mono text-xs">{candidate.noticePeriod}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Availability</span><Badge variant="success" className="text-xs">{candidate.availability}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Preferred locations</span><span className="text-xs">Bangalore, Remote</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
