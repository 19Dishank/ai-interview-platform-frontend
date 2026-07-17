'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlayCircle, Clock, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/Shell'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const domains = ['Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Science', 'ML / AI', 'Mobile']
const techByDomain: Record<string, string[]> = {
  'Frontend': ['React', 'Vue.js', 'Angular', 'Svelte'],
  'Backend': ['Node.js', 'Go', 'Python / Django', 'Java / Spring', 'Rust'],
  'Full Stack': ['React + Node.js', 'Next.js', 'Rails', 'Django + React'],
  'DevOps': ['AWS', 'GCP', 'Azure', 'Kubernetes', 'Terraform'],
  'Data Science': ['Python', 'R', 'Spark / Hadoop'],
  'ML / AI': ['PyTorch', 'TensorFlow', 'scikit-learn', 'JAX'],
  'Mobile': ['React Native', 'Swift / iOS', 'Kotlin / Android', 'Flutter'],
}
const levels = ['Fresher', 'Junior', 'Mid', 'Senior', 'Staff']
const difficulties = [
  { id: 'Easy', label: 'Easy', desc: '~40 min · Fundamentals, basic problem-solving' },
  { id: 'Medium', label: 'Medium', desc: '~50 min · Applied knowledge, design basics' },
  { id: 'Hard', label: 'Hard', desc: '~65 min · System design, deep technical depth' },
]

export default function InterviewSetup() {
  const router = useRouter()
  const [domain, setDomain] = useState('Frontend')
  const [tech, setTech] = useState('React')
  const [level, setLevel] = useState('Senior')
  const [difficulty, setDifficulty] = useState('Hard')
  const [starting, setStarting] = useState(false)

  const techs = techByDomain[domain] || []

  const handleStart = () => {
    setStarting(true)
    setTimeout(() => router.push('/candidate/interview'), 1500)
  }

  return (
    <>
      <PageHeader title="Interview setup" subtitle="Configure your interview before you start. This selection determines the questions you'll receive." />

      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Domain */}
        <Card>
          <CardContent className="py-6">
            <h2 className="font-medium mb-4">Domain</h2>
            <div className="flex flex-wrap gap-2">
              {domains.map(d => (
                <button key={d} type="button" onClick={() => { setDomain(d); setTech(techByDomain[d][0]) }}
                  className={cn('px-4 py-2 rounded-md text-sm border transition-all cursor-pointer', domain === d ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/40 text-foreground')}>
                  {d}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technology */}
        <Card>
          <CardContent className="py-6">
            <h2 className="font-medium mb-4">Technology / Specialisation</h2>
            <div className="flex flex-wrap gap-2">
              {techs.map(t => (
                <button key={t} type="button" onClick={() => setTech(t)}
                  className={cn('px-4 py-2 rounded-md text-sm border transition-all cursor-pointer', tech === t ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/40 text-foreground')}>
                  {t}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Level */}
        <Card>
          <CardContent className="py-6">
            <h2 className="font-medium mb-4">Experience level</h2>
            <div className="flex flex-wrap gap-2">
              {levels.map(l => (
                <button key={l} type="button" onClick={() => setLevel(l)}
                  className={cn('px-4 py-2 rounded-md text-sm border transition-all cursor-pointer', level === l ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/40 text-foreground')}>
                  {l}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Difficulty */}
        <Card>
          <CardContent className="py-6">
            <h2 className="font-medium mb-4">Difficulty</h2>
            <div className="flex flex-col gap-3">
              {difficulties.map(d => (
                <button key={d.id} type="button" onClick={() => setDifficulty(d.id)}
                  className={cn('flex items-center gap-4 p-4 rounded-lg border text-left transition-all cursor-pointer', difficulty === d.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30')}>
                  <div className={cn('w-4 h-4 rounded-full border-2 shrink-0', difficulty === d.id ? 'border-primary bg-primary' : 'border-border')} />
                  <div>
                    <div className="font-medium text-sm">{d.label}</div>
                    <div className="text-xs text-muted-foreground">{d.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary & start */}
        <div className="p-5 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">{domain} · {tech}</div>
              <div className="text-sm text-muted-foreground font-mono">{level} · {difficulty}</div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock size={14} />
              {difficulty === 'Easy' ? '~40 min' : difficulty === 'Medium' ? '~50 min' : '~65 min'}
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg mb-4">
            <AlertCircle size={14} className="text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Once started, the interview cannot be paused. Make sure you are in a quiet environment with a stable internet connection. Your microphone will be used throughout.
            </p>
          </div>
          <Button className="w-full" size="lg" onClick={handleStart} loading={starting}>
            <PlayCircle size={18} /> Start interview
          </Button>
        </div>
      </div>
    </>
  )
}
