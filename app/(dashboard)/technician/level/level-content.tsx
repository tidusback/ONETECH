'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, XCircle, Clock, Loader2, ChevronRight, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requestLevelPromotion } from '@/lib/technician/actions'
import {
  AffiliateBadge,
  AffiliateLevelCard,
  LEVEL_CONFIG,
} from '@/components/technician/affiliation-badge'
import { cn } from '@/lib/utils'
import type { AffiliationLevel, ProgressionCriteria, TechnicianLevelRequest } from '@/lib/technician/queries'

// ---------------------------------------------------------------------------
// Criterion row
// ---------------------------------------------------------------------------

function CriterionRow({
  met, label, current, required,
}: {
  met: boolean; label: string; current: string | number; required: string | number
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {met ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
      )}
      <p className={cn('flex-1 text-sm', met ? '' : 'text-muted-foreground')}>{label}</p>
      <p className={cn('font-mono text-xs tabular-nums', met ? 'text-emerald-600' : 'text-muted-foreground')}>
        {current} / {required}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Level progression timeline
// ---------------------------------------------------------------------------

const LEVEL_ORDER: AffiliationLevel[] = [
  'affiliate_technician',
  'certified_technician',
  'certified_partner',
]

function LevelTimeline({ currentLevel }: { currentLevel: AffiliationLevel }) {
  const currentIdx = LEVEL_ORDER.indexOf(currentLevel)
  return (
    <div className="flex items-center gap-1.5">
      {LEVEL_ORDER.map((lvl, i) => {
        const reached   = i <= currentIdx
        const isCurrent = i === currentIdx
        const cfg  = LEVEL_CONFIG[lvl]
        const Icon = cfg.icon
        return (
          <div key={lvl} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  reached
                    ? isCurrent
                      ? 'border-primary bg-primary/10'
                      : 'border-emerald-500 bg-emerald-500/10'
                    : 'border-border bg-muted/50',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4',
                    reached ? (isCurrent ? 'text-primary' : 'text-emerald-500') : 'text-muted-foreground/30',
                  )}
                />
              </div>
              <span className={cn(
                'whitespace-nowrap text-[10px] font-medium',
                reached ? 'text-foreground' : 'text-muted-foreground/50'
              )}>
                {cfg.short}
              </span>
            </div>
            {i < LEVEL_ORDER.length - 1 && (
              <ChevronRight
                className={cn(
                  'mb-5 h-3.5 w-3.5 shrink-0',
                  i < currentIdx ? 'text-emerald-500' : 'text-border'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Request history row
// ---------------------------------------------------------------------------

const REQUEST_STATUS_CFG: Record<string, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  pending:  { label: 'Pending review', cls: 'text-amber-600',         Icon: Clock },
  approved: { label: 'Approved',       cls: 'text-emerald-600',       Icon: CheckCircle2 },
  rejected: { label: 'Rejected',       cls: 'text-muted-foreground',  Icon: XCircle },
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export interface LevelContentProps {
  userId:         string
  criteria:       ProgressionCriteria | null
  history:        TechnicianLevelRequest[]
  levelUpdatedAt: string | null
}

export function LevelContent({ userId, criteria, history, levelUpdatedAt }: LevelContentProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]       = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const currentLevel = criteria?.current_level ?? 'affiliate_technician'
  const nextLevel    = criteria?.next_level ?? null
  const atMax        = criteria?.at_max_level ?? false
  const hasPending   = submitted || (criteria?.has_pending_request ?? false)
  const canRequest   = !atMax && !hasPending

  function handleRequest() {
    setError(null)
    startTransition(async () => {
      const result = await requestLevelPromotion(userId)
      if (result.error) { setError(result.error); return }
      setSubmitted(true)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">

      {/* Current level card */}
      <AffiliateLevelCard level={currentLevel} updatedAt={levelUpdatedAt} />

      {/* Timeline */}
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <LevelTimeline currentLevel={currentLevel} />
        </CardContent>
      </Card>

      {/* Criteria checklist for next level */}
      {!atMax && nextLevel && criteria?.criteria && (
        <Card>
          <CardHeader className="pb-0 pt-5">
            <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-medium">
              Requirements for
              <AffiliateBadge level={nextLevel} size="sm" full />
            </CardTitle>
            {criteria.criteria.description && (
              <p className="mt-1 text-xs text-muted-foreground">{criteria.criteria.description}</p>
            )}
          </CardHeader>
          <CardContent className="mt-1 divide-y divide-border pb-2">
            <CriterionRow
              met={criteria.meets_jobs}
              label="Completed jobs"
              current={criteria.jobs_completed}
              required={criteria.criteria.min_jobs_completed}
            />
            <CriterionRow
              met={criteria.meets_points}
              label="Released points balance"
              current={`${criteria.points_balance.toLocaleString()} pts`}
              required={`${criteria.criteria.min_points_balance.toLocaleString()} pts`}
            />
            {criteria.criteria.min_days_at_level > 0 && (
              <CriterionRow
                met={criteria.meets_tenure}
                label={`Days at ${LEVEL_CONFIG[criteria.current_level].label}`}
                current={`${criteria.days_at_level}d`}
                required={`${criteria.criteria.min_days_at_level}d`}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* At max level notice */}
      {atMax && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            You&apos;ve reached the highest affiliation level — Certified Partner. Thank you for your commitment to the Trivelox network.
          </p>
        </div>
      )}

      {/* Request promotion card */}
      {!atMax && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Request Promotion</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Submit a request and an admin will review your current activity snapshot.
              You may apply even if not all criteria are fully met — the admin has final discretion.
            </p>

            {hasPending && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Your request is pending admin review.
                </p>
              </div>
            )}

            {canRequest && (
              <div className="mt-3">
                <Button size="sm" className="gap-1.5" onClick={handleRequest} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  Request Promotion to {nextLevel ? LEVEL_CONFIG[nextLevel].label : '…'}
                </Button>
                {!criteria?.meets_all && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Not all criteria met — admin may still approve at their discretion.
                  </p>
                )}
              </div>
            )}

            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Request history */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-0 pt-5">
            <CardTitle className="text-sm font-medium">Request History</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 space-y-2 pb-4">
            {history.map((req) => {
              const st = REQUEST_STATUS_CFG[req.status] ?? REQUEST_STATUS_CFG['pending']
              return (
                <div
                  key={req.id}
                  className="flex flex-col gap-1.5 rounded-md border border-border px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex items-center gap-2">
                    <AffiliateBadge level={req.requested_level} size="sm" full />
                    <span className="text-xs text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:items-end">
                    <span className={cn('flex items-center gap-1 text-xs font-medium', st.cls)}>
                      <st.Icon className="h-3 w-3" />
                      {st.label}
                    </span>
                    {req.rejection_reason && (
                      <p className="max-w-xs text-xs text-muted-foreground">{req.rejection_reason}</p>
                    )}
                    {req.admin_notes && (
                      <p className="max-w-xs text-xs italic text-muted-foreground">{req.admin_notes}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
