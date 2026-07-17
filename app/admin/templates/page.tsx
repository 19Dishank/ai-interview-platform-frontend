'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/Shell'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { mockTemplates } from '@/data/mock'
import { formatDate } from '@/lib/utils'

const diffColor: Record<string, 'success' | 'warning' | 'destructive'> = {
  Easy: 'success', Medium: 'warning', Hard: 'destructive',
}

export default function TemplateManagement() {
  const [templates, setTemplates] = useState(mockTemplates)
  const [editing, setEditing] = useState<string | null>(null)

  const remove = (id: string) => setTemplates(prev => prev.filter(t => t.id !== id))

  return (
    <>
      <PageHeader
        title="Interview templates"
        subtitle="Configure the question banks and difficulty settings for each domain and technology."
        action={<Button size="sm" type="button"><Plus size={16} /> New template</Button>}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <Card key={t.id} className={`transition-colors ${editing === t.id ? 'border-primary' : 'hover:border-primary/30'}`}>
            <CardContent className="py-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 w-10 h-10 rounded-lg bg-primary/10 justify-center">
                  <FileText size={18} className="text-primary" />
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setEditing(t.id === editing ? null : t.id)}
                    className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <Edit2 size={14} />
                  </button>
                  <button type="button" onClick={() => remove(t.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="font-semibold mb-1">{t.domain} · {t.technology}</div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={diffColor[t.difficulty]}>{t.difficulty}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground font-mono mb-3">
                <div>{t.questions} questions</div>
                <div>{t.duration}</div>
              </div>

              <div className="text-xs text-muted-foreground">Updated {formatDate(t.lastUpdated)}</div>

              {editing === t.id && (
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">Question count</label>
                    <input type="number" defaultValue={t.questions}
                      className="h-8 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">Difficulty</label>
                    <select defaultValue={t.difficulty}
                      className="h-8 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" type="button" className="flex-1" onClick={() => setEditing(null)}>Save changes</Button>
                    <Button size="sm" type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
