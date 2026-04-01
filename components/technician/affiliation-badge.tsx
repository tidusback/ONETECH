import { ShieldCheck, Award, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AffiliationLevel } from '@/lib/technician/queries'

// ---------------------------------------------------------------------------
// Per-level config
// ---------------------------------------------------------------------------

interface LevelConfig {
  label:    string
  short:    string   // compact label for tight spaces
  icon:     React.ComponentType<{ className?: string }>
  badge:    string   // pill classes
  glow:     string   // card-accent / border highlight
  dot:      string   // small dot indicator color
}

export const LEVEL_CONFIG: Record<AffiliationLevel, LevelConfig> = {
  affiliate_technician: {
    label: 'Affiliate Technician',
    short: 'Affiliate',
    icon:  Star,
    badge: 'bg-muted text-muted-foreground border border-border',
    glow:  'border-border',
    dot:   'bg-muted-foreground',
  },
  certified_technician: {
    label: 'Certified Technician',
    short: 'Certified',
    icon:  ShieldCheck,
    badge: 'bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400',
    glow:  'border-blue-500/20',
    dot:   'bg-blue-500',
  },
  certified_partner: {
    label: 'Certified Partner',
    short: 'Partner',
    icon:  Award,
    badge: 'bg-amber-500/10 text-amber-700 border border-amber-500/25 dark:text-amber-400',
    glow:  'border-amber-500/30',
    dot:   'bg-amber-500',
  },
}

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

type BadgeSize = 'sm' | 'md' | 'lg'

const SIZE: Record<BadgeSize, { pill: string; icon: string }> = {
  sm:  { pill: 'gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',  icon: 'h-2.5 w-2.5' },
  md:  { pill: 'gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',  icon: 'h-3 w-3'     },
  lg:  { pill: 'gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold',      icon: 'h-4 w-4'     },
}

// ---------------------------------------------------------------------------
// AffiliateBadge — pill variant
// ---------------------------------------------------------------------------

interface AffiliateBadgeProps {
  level:     AffiliationLevel
  size?:     BadgeSize
  /** show full label instead of short label */
  full?:     boolean
  className?: string
}

export function AffiliateBadge({
  level,
  size = 'md',
  full = false,
  className,
}: AffiliateBadgeProps) {
  const cfg  = LEVEL_CONFIG[level]
  const sz   = SIZE[size]
  const Icon = cfg.icon

  return (
    <span
      className={cn(
        'inline-flex items-center',
        sz.pill,
        cfg.badge,
        className,
      )}
    >
      <Icon className={sz.icon} />
      {full ? cfg.label : cfg.short}
    </span>
  )
}

// ---------------------------------------------------------------------------
// AffiliateDot — minimal dot indicator (for tables / tight rows)
// ---------------------------------------------------------------------------

interface AffiliateDotProps {
  level:      AffiliationLevel
  className?: string
}

export function AffiliateDot({ level, className }: AffiliateDotProps) {
  const cfg = LEVEL_CONFIG[level]
  return (
    <span
      className={cn('inline-block h-2 w-2 rounded-full', cfg.dot, className)}
      title={cfg.label}
    />
  )
}

// ---------------------------------------------------------------------------
// AffiliateLevelCard — hero card used on the technician level page
// ---------------------------------------------------------------------------

interface AffiliateLevelCardProps {
  level:      AffiliationLevel
  updatedAt?: string | null
  className?: string
}

export function AffiliateLevelCard({
  level,
  updatedAt,
  className,
}: AffiliateLevelCardProps) {
  const cfg  = LEVEL_CONFIG[level]
  const Icon = cfg.icon

  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl border p-6 text-center',
        cfg.glow,
        level === 'certified_partner' && 'bg-amber-500/5',
        level === 'certified_technician' && 'bg-blue-500/5',
        className,
      )}
    >
      <div
        className={cn(
          'mb-3 flex h-14 w-14 items-center justify-center rounded-full',
          level === 'affiliate_technician' && 'bg-muted',
          level === 'certified_technician' && 'bg-blue-500/15',
          level === 'certified_partner'    && 'bg-amber-500/15',
        )}
      >
        <Icon
          className={cn(
            'h-7 w-7',
            level === 'affiliate_technician' && 'text-muted-foreground',
            level === 'certified_technician' && 'text-blue-500',
            level === 'certified_partner'    && 'text-amber-500',
          )}
        />
      </div>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Current Level
      </p>
      <h2 className="mt-1 text-xl font-bold tracking-tight">{cfg.label}</h2>
      {updatedAt && (
        <p className="mt-1 text-xs text-muted-foreground">
          Since {new Date(updatedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
