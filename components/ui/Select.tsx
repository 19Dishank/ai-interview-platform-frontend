import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label?: string
  error?: string
  hint?: string
  id?: string
  className?: string
  placeholder?: string
  disabled?: boolean
  options: (string | SelectOption)[]
  value: string
  onValueChange: (value: string) => void
}

function Select({
  label,
  error,
  hint,
  id,
  className,
  placeholder = 'Select...',
  disabled,
  options,
  value,
  onValueChange,
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const normalized: SelectOption[] = options.map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o,
  )

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          id={selectId}
          className={cn(
            'h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground',
            'flex items-center justify-between gap-2 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-ring transition-shadow duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'data-[placeholder]:text-muted-foreground',
            error && 'border-destructive focus:ring-destructive/50',
            className,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown size={14} className="text-muted-foreground shrink-0" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="overflow-hidden rounded-md border border-border bg-card shadow-lg z-50 w-[var(--radix-select-trigger-width)]"
          >
            <SelectPrimitive.Viewport className="p-1">
              {normalized.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-sm cursor-pointer',
                    'outline-none data-[highlighted]:bg-secondary',
                    'data-[state=checked]:text-primary data-[state=checked]:font-medium',
                  )}
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check size={14} />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export { Select }
