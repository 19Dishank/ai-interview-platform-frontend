import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function BasicInfoForm() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-xl font-semibold mb-2">Basic information</h2>
      <div className="flex items-center gap-4 p-4 border border-dashed border-border rounded-lg">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div>
          <Button variant="outline" size="sm" type="button"><Upload size={14} /> Upload photo</Button>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2 MB</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="First name" defaultValue="Arjun" />
        <Input label="Last name" defaultValue="Mehta" />
      </div>
      <Input label="Current title" defaultValue="Senior Frontend Engineer" />
      <Input label="Current company" defaultValue="Acme Corp" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Years of experience" type="number" defaultValue="6" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Location</label>
          <select className="h-10 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Bangalore, India</option>
            <option>Mumbai, India</option>
            <option>Hyderabad, India</option>
            <option>Delhi, India</option>
            <option>Remote</option>
          </select>
        </div>
      </div>
      <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center gap-2 text-center">
        <Upload size={20} className="text-muted-foreground" />
        <p className="text-sm font-medium">Upload resume</p>
        <p className="text-xs text-muted-foreground">PDF, DOCX up to 5 MB</p>
        <Button variant="outline" size="sm" type="button"><Upload size={14} /> Choose file</Button>
      </div>
    </div>
  )
}
