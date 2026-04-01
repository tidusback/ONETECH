import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatPercent } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  change?: number        // percentage — positive = profit, negative = loss
  changeLabel?: string   // e.g. "vs. yesterday"
  className?: string
}

export function StatCard({ label, value, change, changeLabel, className }: StatCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isFlat     = change !== undefined && change === 0

  return (
    <Card className={cn('border-l-2 border-l-primary/30', className)}>
      <CardContent className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="mt-2.5 font-mono text-2xl font-semibold tabular-nums">{value}</p>

        {change !== undefined && (
          <div
            className={cn(
              'mt-2 flex items-center gap-1 text-xs font-medium',
              isPositive && 'text-profit',
              isNegative && 'text-loss',
              isFlat     && 'text-muted-foreground',
            )}
          >
            {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
            {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
            {isFlat     && <Minus className="h-3.5 w-3.5" />}
            <span>{formatPercent(change)}</span>
            {changeLabel && (
              <span className="font-normal text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
