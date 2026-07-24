'use client'

import { useState } from 'react'
import { Select } from './Select'
import { Input } from './Input'

interface EditableSelectProps {
  label?: string
  error?: string
  hint?: string
  className?: string
  options: string[]
  value: string
  onChange: (value: string) => void
  customPlaceholder?: string
}

const CUSTOM_VALUE = '__custom__'

/**
 * A Select that always includes a trailing "Custom..." option.
 * Picking it reveals a plain Input so the user can enter any value
 * that isn't in the preset list (city, salary range, notice period, etc.)
 * Used by BasicInfoForm (Location) and PreferencesForm (Salary, Notice).
 */
function EditableSelect({
  label,
  error,
  hint,
  className,
  options,
  value,
  onChange,
  customPlaceholder = 'Type your own...',
}: EditableSelectProps) {
  const isPreset = options.includes(value)
  const [mode, setMode] = useState<'preset' | 'custom'>(isPreset || !value ? 'preset' : 'custom')

  const selectValue = mode === 'custom' ? CUSTOM_VALUE : value

  const handleSelectChange = (v: string) => {
    if (v === CUSTOM_VALUE) {
      setMode('custom')
      onChange('')
    } else {
      setMode('preset')
      onChange(v)
    }
  }

  if (mode === 'custom') {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          <button
            type="button"
            onClick={() => { setMode('preset'); onChange(options[0]) }}
            className="text-xs text-primary hover:underline cursor-pointer"
          >
            Choose from list
          </button>
        </div>
        <Input
          error={error}
          hint={hint}
          className={className}
          placeholder={customPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }

  return (
    <Select
      label={label}
      error={error}
      hint={hint}
      className={className}
      value={selectValue}
      onValueChange={handleSelectChange}
      options={[...options, { label: 'Custom...', value: CUSTOM_VALUE }]}
    />
  )
}

export { EditableSelect }
