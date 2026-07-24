'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
  label?: string
  error?: string
  hint?: string
  id?: string
  className?: string
  placeholder?: string
  values: string[]
  onChange: (values: string[]) => void
  suggestions?: string[]
  /** Case-insensitive dedupe check + max count, since both Skills and Locations need this */
  maxTags?: number
}

function TagInput({
  label,
  error,
  hint,
  id,
  className,
  placeholder = 'Add and press Enter...',
  values,
  onChange,
  suggestions = [],
  maxTags,
}: TagInputProps) {
  const [input, setInput] = useState('')
  const [duplicateFlash, setDuplicateFlash] = useState<string | null>(null)
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, '-')

  const add = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    const isDuplicate = values.some((v) => v.toLowerCase() === trimmed.toLowerCase())
    if (isDuplicate) {
      setDuplicateFlash(trimmed)
      setTimeout(() => setDuplicateFlash(null), 1500)
      setInput('')
      return
    }
    if (maxTags && values.length >= maxTags) return

    onChange([...values, trimmed])
    setInput('')
  }

  const remove = (tag: string) => onChange(values.filter((v) => v !== tag))

  const atLimit = !!maxTags && values.length >= maxTags

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="hover:text-destructive transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          id={fieldId}
          className={cn(
            'flex-1 h-9 rounded-md border border-border bg-card px-3 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring transition-shadow duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-destructive focus:ring-destructive/50',
          )}
          placeholder={atLimit ? `Limit of ${maxTags} reached` : placeholder}
          value={input}
          disabled={atLimit}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add(input))}
        />
        <button
          type="button"
          onClick={() => add(input)}
          disabled={atLimit}
          className="h-9 w-9 flex items-center justify-center rounded-md border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
        </button>
      </div>

      {duplicateFlash && (
        <p className="text-xs text-amber-600">&ldquo;{duplicateFlash}&rdquo; is already added</p>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions
            .filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                disabled={atLimit}
                className="text-xs px-2 py-1 rounded-full border border-dashed border-border hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + {s}
              </button>
            ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && !duplicateFlash && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export { TagInput }
