import { GitBranch, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ConnectProfilesForm() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-xl font-semibold mb-2">Connect your profiles</h2>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
          <GitBranch size={20} />
          <div className="flex-1">
            <div className="font-medium text-sm">GitHub</div>
            <div className="text-xs text-muted-foreground">Show your public repositories and contribution history</div>
          </div>
          <Button variant="outline" size="sm" type="button">Connect</Button>
        </div>
        <div className="flex items-center gap-3 p-4 border border-success/40 bg-success/5 rounded-lg">
          <Link2 size={20} className="text-primary" />
          <div className="flex-1">
            <div className="font-medium text-sm">LinkedIn</div>
            <div className="text-xs text-muted-foreground">linkedin.com/in/arjunmehta — connected</div>
          </div>
          <span className="text-xs text-success font-mono">Connected</span>
        </div>
      </div>
      <Input label="Portfolio URL" placeholder="https://arjunmehta.dev" />
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-primary font-medium mb-1">You&apos;re ready to take your interview</p>
        <p className="text-xs text-muted-foreground">After saving your profile, you can schedule or start your AI interview from the dashboard.</p>
      </div>
    </div>
  )
}
