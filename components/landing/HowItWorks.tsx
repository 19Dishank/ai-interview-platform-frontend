import { Mic, FileText, Search } from 'lucide-react'

const steps = [
  { icon: <Mic size={20} />, title: 'AI conducts the interview', body: 'Candidates take a structured, domain-specific AI interview at their own time. One interview, valid for 6 months.' },
  { icon: <FileText size={20} />, title: 'A verified report is generated', body: 'The AI produces a detailed assessment of technical knowledge, communication, and specific skill depth — never a hire/no-hire verdict.' },
  { icon: <Search size={20} />, title: 'Recruiters discover & review', body: 'Hiring teams search by domain, technology, experience, and communication style. They see the evidence, not just a score.' },
]

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">How Verquo works</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Three steps replace the standard 4-week, 6-call screening loop.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="relative p-6 bg-card border border-border rounded-xl group hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {step.icon}
              </div>
              <span className="font-mono text-xs text-muted-foreground">Step {i + 1}</span>
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
