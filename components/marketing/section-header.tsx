import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  overline?: string
  heading: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeader({
  overline,
  heading,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {overline && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
          {overline}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {heading}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
