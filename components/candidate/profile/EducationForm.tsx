import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function EducationForm() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-xl font-semibold mb-2">Education</h2>
      <div className="p-4 border border-border rounded-lg flex flex-col gap-3">
        <Input label="Institution" defaultValue="Indian Institute of Technology, Bombay" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Degree" defaultValue="B.Tech Computer Science" />
          <div className="grid grid-cols-2 gap-2">
            <Input label="From" type="number" defaultValue="2016" />
            <Input label="To" type="number" defaultValue="2020" />
          </div>
        </div>
        <Input label="GPA / Score" placeholder="e.g. 8.4/10" />
      </div>
      <Button variant="outline" size="sm" type="button" className="self-start"><Plus size={14} /> Add education</Button>
      <Input label="Portfolio / personal website" placeholder="https://yoursite.com" />
    </div>
  )
}
