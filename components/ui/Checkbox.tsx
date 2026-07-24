import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  label?: string
  error?: string
  hint?: string
  id?: string
  className?: string
  disabled?: boolean
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Smaller text style for inline use next to a field label, e.g. "Currently pursuing" */
  size?: 'sm' | 'md'
}

function Checkbox({
  label,
  error,
  hint,
  id,
  className,
  disabled,
  checked,
  onCheckedChange,
  size = 'md',
}: CheckboxProps) {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={checkboxId}
        className={cn(
          'flex items-center gap-2 cursor-pointer select-none',
          disabled && 'opacity-50 cursor-not-allowed',
          size === 'sm' ? 'text-xs text-muted-foreground' : 'text-sm text-foreground',
        )}
      >
        <CheckboxPrimitive.Root
          id={checkboxId}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          disabled={disabled}
          className={cn(
            'h-4 w-4 shrink-0 rounded border border-border bg-card flex items-center justify-center',
            'focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-150',
            'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
            error && 'border-destructive',
          )}
        >
          <CheckboxPrimitive.Indicator className="text-primary-foreground">
            <Check size={11} strokeWidth={3} />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        {label}
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export { Checkbox }
