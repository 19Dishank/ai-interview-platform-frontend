import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'accent'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-accent/15 text-accent border border-accent/30',
  destructive: 'bg-destructive/15 text-destructive border border-destructive/30',
  outline: 'border border-border text-muted-foreground',
  accent: 'bg-accent text-accent-foreground',
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium font-mono tracking-wide',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
