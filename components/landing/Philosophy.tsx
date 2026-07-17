import { Shield, BarChart3, Clock } from 'lucide-react'

const philosophyPoints = [
  { icon: <Shield size={18} />, text: 'We do not make hiring decisions. Ever.' },
  { icon: <BarChart3 size={18} />, text: 'Scores are observations, not verdicts.' },
  { icon: <Clock size={18} />, text: 'One interview removes weeks of redundant screening.' },
]

export default function Philosophy() {
  return (
    <section className="border-t border-border bg-secondary/30 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4">Our principle</h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Hiring decisions belong to humans. Verquo only removes the part that wastes everyone&apos;s time: the repeated, inconsistent first-round screening that tells recruiters almost nothing useful.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {philosophyPoints.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">{p.icon}</span>
                {p.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
