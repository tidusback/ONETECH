'use client'

import { useState, useTransition } from 'react'
import { Loader2, CheckCircle2, XCircle, ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminFulfillRedemption, adminCancelRedemption, adminToggleRewardActive } from '@/lib/admin/actions'

// ---------------------------------------------------------------------------
// Fulfill / Cancel a redemption
// ---------------------------------------------------------------------------

interface RedemptionActionsProps {
  redemptionId: string
}

export function RedemptionActions({ redemptionId }: RedemptionActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [cancelling, setCancelling] = useState(false)
  const [cancelNote, setCancelNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<'fulfilled' | 'cancelled' | null>(null)

  if (done === 'fulfilled') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Fulfilled
      </span>
    )
  }
  if (done === 'cancelled') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <XCircle className="h-3.5 w-3.5" /> Cancelled
      </span>
    )
  }

  function handleFulfill() {
    setError(null)
    startTransition(async () => {
      const result = await adminFulfillRedemption(redemptionId)
      if (result.error) { setError(result.error); return }
      setDone('fulfilled')
    })
  }

  function handleCancelConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await adminCancelRedemption(redemptionId, cancelNote.trim() || undefined)
      if (result.error) { setError(result.error); return }
      setDone('cancelled')
      setCancelling(false)
    })
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={handleFulfill}
          disabled={isPending}
        >
          {isPending && !cancelling ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          )}
          Fulfill
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={() => setCancelling((v) => !v)}
          disabled={isPending}
        >
          <XCircle className="h-3 w-3" />
          Cancel
          <ChevronDown className={`h-3 w-3 transition-transform ${cancelling ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {cancelling && (
        <div className="space-y-1.5 rounded-md border border-border bg-muted/40 p-2">
          <input
            type="text"
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            placeholder="Reason for cancellation (optional)"
            className="w-full rounded border border-input bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="destructive"
              className="h-6 text-xs"
              onClick={handleCancelConfirm}
              disabled={isPending}
            >
              {isPending && cancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm Cancel'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={() => setCancelling(false)}
              disabled={isPending}
            >
              Back
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toggle reward active/inactive — calls server action, not browser client
// ---------------------------------------------------------------------------

interface RewardToggleProps {
  rewardId: string
  isActive: boolean
  title:    string
}

export function RewardToggle({ rewardId, isActive, title }: RewardToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [active, setActive] = useState(isActive)
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    setError(null)
    const next = !active
    setActive(next) // optimistic
    startTransition(async () => {
      const result = await adminToggleRewardActive(rewardId, next)
      if (result.error) {
        setActive(!next) // revert on error
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-7 gap-1.5 text-xs"
        onClick={handleToggle}
        disabled={isPending}
        title={active ? `Deactivate ${title}` : `Activate ${title}`}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : active ? (
          <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        {active ? 'Active' : 'Inactive'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
