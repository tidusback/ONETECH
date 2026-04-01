import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  separator?: boolean
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  separator = true,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex items-start justify-between gap-4',
        separator && 'border-b border-border pb-5',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
