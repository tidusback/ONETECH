import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  label: string        // e.g. "Customer setup"
  current: number      // 1-indexed
  total: number
  className?: string
}

export function StepIndicator({ label, current, total, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground/60" aria-hidden>·</span>
      <span className="text-xs text-muted-foreground" aria-label={`Step ${current} of ${total}`}>
        Step {current} of {total}
      </span>
    </div>
  )
}
