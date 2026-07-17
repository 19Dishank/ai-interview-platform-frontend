interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, label }: ScoreRingProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 85 ? 'var(--success)' : score >= 65 ? 'var(--primary)' : 'var(--accent)'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute" style={{ marginTop: size / 2 - 10 }}>
      </div>
      <div className="text-center -mt-1">
        <div className="font-mono text-lg font-semibold leading-none" style={{ color }}>{score}</div>
        {label && <div className="text-xs text-muted-foreground mt-0.5">{label}</div>}
      </div>
    </div>
  )
}

export function ScoreBar({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100
  const color = pct >= 85 ? 'var(--success)' : pct >= 65 ? 'var(--primary)' : 'var(--accent)'
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-foreground">{label}</span>
        <span className="font-mono text-sm font-medium" style={{ color }}>{score}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
