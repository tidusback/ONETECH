// Visual radio-card for onboarding option groups.
// Works with React Hook Form register() — spread register('fieldName') on each card.
// Pass `selected` from watch('fieldName') === value to drive the visual state.

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface OptionCardProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label: string
  description?: string
  selected?: boolean
  className?: string
}

export const OptionCard = React.forwardRef<HTMLInputElement, OptionCardProps>(
  ({ label, description, selected = false, className, ...inputProps }, ref) => {
    return (
      <label
        className={cn(
          // Layout
          'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
          // Unselected
          'border-border bg-card hover:border-primary/40 hover:bg-muted/30',
          // Selected — override border + background
          selected && 'border-primary bg-primary/5 hover:border-primary hover:bg-primary/5',
          // Disabled
          inputProps.disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        {/* Hidden native radio input — keeps form semantics intact */}
        <input
          type="radio"
          ref={ref}
          className="sr-only"
          aria-checked={selected}
          {...inputProps}
        />

        {/* Custom radio indicator */}
        <div
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            selected
              ? 'border-primary'
              : 'border-muted-foreground/40'
          )}
          aria-hidden
        >
          {selected && (
            <div className="h-2 w-2 rounded-full bg-primary" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm leading-tight', selected ? 'font-medium' : 'font-normal')}>
            {label}
          </p>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </label>
    )
  }
)
OptionCard.displayName = 'OptionCard'
