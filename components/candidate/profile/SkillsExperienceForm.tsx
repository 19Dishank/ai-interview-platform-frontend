'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const skillSuggestions = ['React', 'TypeScript', 'Node.js', 'Python', 'GraphQL', 'Docker', 'AWS', 'PostgreSQL', 'Redis', 'Kubernetes']

export default function SkillsExperienceForm() {
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js'])
  const [skillInput, setSkillInput] = useState('')

  const addSkill = (s: string) => {
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s])
    setSkillInput('')
  }

  const removeSkill = (s: string) => setSkills(prev => prev.filter(sk => sk !== s))

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-xl font-semibold mb-2">Skills & experience</h2>
      <div>
        <label className="text-sm font-medium block mb-2">Skills</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full text-sm">
              {s}
              <button type="button" onClick={() => removeSkill(s)} className="hover:text-destructive transition-colors cursor-pointer"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Add a skill..."
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
          />
          <Button variant="outline" size="sm" type="button" onClick={() => addSkill(skillInput)}><Plus size={14} /></Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {skillSuggestions.filter(s => !skills.includes(s)).map(s => (
            <button key={s} type="button" onClick={() => addSkill(s)} className="text-xs px-2 py-1 rounded-full border border-dashed border-border hover:border-primary hover:text-primary transition-colors cursor-pointer">
              + {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="font-medium text-sm">Work experience</h3>
        <div className="p-4 border border-border rounded-lg flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Job title" defaultValue="Senior Frontend Engineer" />
            <Input label="Company" defaultValue="Acme Corp" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start date" type="month" defaultValue="2021-03" />
            <Input label="End date" placeholder="Present" type="month" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-20 resize-none" placeholder="Key responsibilities and achievements..." />
          </div>
        </div>
        <Button variant="outline" size="sm" type="button" className="self-start"><Plus size={14} /> Add position</Button>
      </div>
    </div>
  )
}
