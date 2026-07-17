import { Mail, Phone, Link2, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Candidate } from '@/types'

interface ContactModalProps {
  open: boolean
  onClose: () => void
  candidate: Candidate
}

export default function ContactModal({ open, onClose, candidate }: ContactModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md z-10">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold">Contact {candidate.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Reach out directly — conversation happens outside Verquo.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div className="p-3 bg-secondary/40 rounded-lg text-xs text-muted-foreground leading-relaxed">
            Verquo connects you with this candidate but does not mediate the conversation. All subsequent communication is between you and the candidate directly.
          </div>

          <a href={`mailto:${candidate.email}`}
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary/40 hover:bg-secondary/30 transition-all group">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Mail size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">Email</div>
              <div className="text-xs text-muted-foreground truncate">{candidate.email}</div>
            </div>
            <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary shrink-0" />
          </a>

          <a href={`tel:${candidate.phone}`}
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary/40 hover:bg-secondary/30 transition-all group">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Phone size={16} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Phone</div>
              <div className="text-xs text-muted-foreground font-mono">{candidate.phone}</div>
            </div>
            <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary shrink-0" />
          </a>

          <a href={candidate.linkedin} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-primary/40 hover:bg-secondary/30 transition-all group">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Link2 size={16} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">LinkedIn</div>
              <div className="text-xs text-muted-foreground truncate">{candidate.linkedin.replace('https://', '')}</div>
            </div>
            <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary shrink-0" />
          </a>
        </div>

        <div className="p-5 pt-0">
          <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
