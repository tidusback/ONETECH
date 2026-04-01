import Link from 'next/link'
import { Package, Clock, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  type SparePart,
  PART_CATEGORY_META,
  MACHINE_TYPE_LABELS,
  AVAILABILITY_LABELS,
} from '@/lib/parts-catalog'

interface PartCardProps {
  part: SparePart
  className?: string
}

function availabilityVariant(
  availability: SparePart['availability'],
): 'profit' | 'warning' | 'neutral' {
  if (availability === 'in-stock') return 'profit'
  if (availability === 'limited') return 'warning'
  return 'neutral'
}

export function PartCard({ part, className }: PartCardProps) {
  const categoryMeta = PART_CATEGORY_META[part.category]

  return (
    <Link
      href={`/parts/${part.slug}`}
      className={cn(
        'group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-card',
        className,
      )}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Package className="h-4 w-4 text-primary" />
        </div>
        <Badge variant={availabilityVariant(part.availability)} className="shrink-0">
          {AVAILABILITY_LABELS[part.availability]}
        </Badge>
      </div>

      {/* ── Identity ─────────────────────────────────────────────────────── */}
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {part.partNumber}
      </p>
      <h3 className="mt-1 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
        {part.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {part.description}
      </p>

      {/* ── Meta ─────────────────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
          {categoryMeta.label}
        </span>
        {part.machineTypes.slice(0, 2).map((mt) => (
          <span
            key={mt}
            className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
          >
            {MACHINE_TYPE_LABELS[mt]}
          </span>
        ))}
        {part.machineTypes.length > 2 && (
          <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
            +{part.machineTypes.length - 2} more
          </span>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{part.leadTime}</span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View Details <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}
