import { CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RequestStatus } from '@/lib/orders/queries'

const STEPS: Array<{ status: RequestStatus; label: string; description: string }> = [
  { status: 'pending',    label: 'Request Submitted',   description: 'Awaiting review by our parts team' },
  { status: 'reviewing',  label: 'Under Review',         description: 'Team is checking availability & pricing' },
  { status: 'quoted',     label: 'Quote Sent',           description: 'Pricing confirmed, awaiting your approval' },
  { status: 'confirmed',  label: 'Order Confirmed',      description: 'Parts have been reserved for your order' },
  { status: 'processing', label: 'Processing',           description: 'Parts are being picked and packed' },
  { status: 'shipped',    label: 'Shipped',              description: 'Parts dispatched with tracking' },
  { status: 'delivered',  label: 'Delivered',            description: 'Order received — complete' },
]

const STATUS_ORDER: RequestStatus[] = [
  'pending','reviewing','quoted','confirmed','processing','shipped','delivered',
]

function stepIndex(status: RequestStatus): number {
  return STATUS_ORDER.indexOf(status)
}

interface StatusTimelineProps {
  status: RequestStatus
}

export function StatusTimeline({ status }: StatusTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-5 py-4">
        <p className="text-sm font-medium text-destructive">This request was cancelled.</p>
      </div>
    )
  }

  const currentIndex = stepIndex(status)

  return (
    <ol className="space-y-0">
      {STEPS.map((step, i) => {
        const done    = i < currentIndex
        const current = i === currentIndex
        const upcoming = i > currentIndex

        return (
          <li key={step.status} className="flex gap-4">
            {/* Connector + icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  done    && 'border-profit bg-profit text-white',
                  current && 'border-primary bg-primary text-primary-foreground',
                  upcoming && 'border-border bg-background text-muted-foreground',
                )}
              >
                {done ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <Circle className={cn('h-3 w-3', current && 'fill-primary-foreground')} />
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mt-0.5 w-0.5 flex-1',
                    i < currentIndex ? 'bg-profit' : 'bg-border',
                  )}
                  style={{ minHeight: '1.5rem' }}
                />
              )}
            </div>

            {/* Label */}
            <div className={cn('pb-5 pt-0.5', i === STEPS.length - 1 && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium',
                  done    && 'text-muted-foreground',
                  current && 'text-foreground',
                  upcoming && 'text-muted-foreground/60',
                )}
              >
                {step.label}
              </p>
              {(done || current) && (
                <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
