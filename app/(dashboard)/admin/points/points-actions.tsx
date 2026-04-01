'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle, ChevronDown, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  releasePointsEntry,
  voidPointsEntry,
  adminGrantPoints,
} from '@/lib/technician/actions'
import type { ApprovedTechnicianProfile } from '@/lib/technician/queries'

// ---------------------------------------------------------------------------
// Release / Void a single pending entry
// ---------------------------------------------------------------------------

interface PointsEntryActionsProps {
  pointsId: string
}

export function PointsEntryActions({ pointsId }: PointsEntryActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [voiding, setVoiding] = useState(false)
  const [voidReason, setVoidReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<'released' | 'voided' | null>(null)
  const router = useRouter()

  if (done === 'released') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Released
      </span>
    )
  }
  if (done === 'voided') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <XCircle className="h-3.5 w-3.5" /> Voided
      </span>
    )
  }

  function handleRelease() {
    setError(null)
    startTransition(async () => {
      const result = await releasePointsEntry(pointsId)
      if (result.error) { setError(result.error); return }
      setDone('released')
      router.refresh()
    })
  }

  function handleVoidConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await voidPointsEntry(pointsId, voidReason.trim() || undefined)
      if (result.error) { setError(result.error); return }
      setDone('voided')
      setVoiding(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={handleRelease}
          disabled={isPending}
        >
          {isPending && !voiding ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          )}
          Release
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={() => setVoiding((v) => !v)}
          disabled={isPending}
        >
          <XCircle className="h-3 w-3" />
          Void
          <ChevronDown className={`h-3 w-3 transition-transform ${voiding ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {voiding && (
        <div className="space-y-1.5 rounded-md border border-border bg-muted/40 p-2">
          <input
            type="text"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            placeholder="Reason for voiding (optional)"
            className="w-full rounded border border-input bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="destructive"
              className="h-6 text-xs"
              onClick={handleVoidConfirm}
              disabled={isPending}
            >
              {isPending && voiding ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm Void'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={() => setVoiding(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Grant points form (bonus / adjustment)
// ---------------------------------------------------------------------------

interface GrantPointsFormProps {
  technicians: ApprovedTechnicianProfile[]
}

export function GrantPointsForm({ technicians }: GrantPointsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [technicianId, setTechnicianId] = useState('')
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState<'bonus' | 'adjustment'>('bonus')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const pts = parseInt(points, 10)
    if (!technicianId) { setError('Select a technician.'); return }
    if (isNaN(pts) || pts === 0) { setError('Enter a non-zero points value.'); return }

    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await adminGrantPoints(technicianId, pts, reason, note.trim() || undefined)
      if (result.error) { setError(result.error); return }
      setSuccess(true)
      setTechnicianId('')
      setPoints('')
      setNote('')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Technician */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Technician</label>
        <select
          value={technicianId}
          onChange={(e) => setTechnicianId(e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select technician…</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name ?? t.email} — {t.email}
            </option>
          ))}
        </select>
      </div>

      {/* Points + reason */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Points (negative for deduction)
          </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="e.g. 250 or -100"
            className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as 'bonus' | 'adjustment')}
            className="rounded-md border border-input bg-transparent px-2.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="bonus">Bonus</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Note <span className="font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Performance bonus — Q1"
          className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {success && <p className="text-xs text-emerald-600">Points granted successfully.</p>}

      <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <PlusCircle className="h-3.5 w-3.5" />
        )}
        Grant Points
      </Button>
    </form>
  )
}
