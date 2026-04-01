'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle, ChevronDown, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  approveLevelPromotion,
  rejectLevelPromotion,
  adminSetLevel,
} from '@/lib/technician/actions'
import type { AffiliationLevel } from '@/lib/technician/queries'

// ---------------------------------------------------------------------------
// Approve / Reject a pending level request
// ---------------------------------------------------------------------------

interface LevelRequestActionsProps {
  requestId: string
}

export function LevelRequestActions({ requestId }: LevelRequestActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [rejecting, setRejecting]   = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [approveNote, setApproveNote]   = useState('')
  const [showNote, setShowNote]         = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [done, setDone]     = useState<'approved' | 'rejected' | null>(null)
  const router = useRouter()

  if (done === 'approved') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
      </span>
    )
  }
  if (done === 'rejected') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <XCircle className="h-3.5 w-3.5" /> Rejected
      </span>
    )
  }

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveLevelPromotion(requestId, approveNote.trim() || undefined)
      if (result.error) { setError(result.error); return }
      setDone('approved')
      router.refresh()
    })
  }

  function handleRejectConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await rejectLevelPromotion(requestId, rejectReason.trim() || undefined)
      if (result.error) { setError(result.error); return }
      setDone('rejected')
      setRejecting(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-1.5">
      {/* Approve row */}
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          onClick={handleApprove}
          disabled={isPending}
        >
          {isPending && !rejecting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          )}
          Approve
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={() => { setShowNote((v) => !v); setRejecting(false) }}
          disabled={isPending}
        >
          Note
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={() => { setRejecting((v) => !v); setShowNote(false) }}
          disabled={isPending}
        >
          <XCircle className="h-3 w-3" />
          Reject
          <ChevronDown className={`h-3 w-3 transition-transform ${rejecting ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Optional approve note */}
      {showNote && (
        <input
          type="text"
          value={approveNote}
          onChange={(e) => setApproveNote(e.target.value)}
          placeholder="Admin note (optional)"
          className="w-full rounded border border-input bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      )}

      {/* Reject expansion */}
      {rejecting && (
        <div className="space-y-1.5 rounded-md border border-border bg-muted/40 p-2">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (optional)"
            className="w-full rounded border border-input bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="destructive"
              className="h-6 text-xs"
              onClick={handleRejectConfirm}
              disabled={isPending}
            >
              {isPending && rejecting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm Reject'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={() => setRejecting(false)}
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
// Admin direct-set level (bypass request flow)
// ---------------------------------------------------------------------------

interface AdminSetLevelProps {
  technicianId:   string
  currentLevel:   AffiliationLevel
}

const LEVELS: { value: AffiliationLevel; label: string }[] = [
  { value: 'affiliate_technician', label: 'Affiliate Technician' },
  { value: 'certified_technician', label: 'Certified Technician' },
  { value: 'certified_partner',    label: 'Certified Partner'    },
]

export function AdminSetLevel({ technicianId, currentLevel }: AdminSetLevelProps) {
  const [isPending, startTransition] = useTransition()
  const [level, setLevel]   = useState<AffiliationLevel>(currentLevel)
  const [notes, setNotes]   = useState('')
  const [open, setOpen]     = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  function handleSet() {
    if (level === currentLevel) { setOpen(false); return }
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await adminSetLevel(technicianId, level, notes.trim() || undefined)
      if (result.error) { setError(result.error); return }
      setSuccess(true)
      setOpen(false)
      setNotes('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-7 gap-1 text-xs"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
      >
        <ShieldCheck className="h-3 w-3" />
        Set Level
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {success && !open && (
        <p className="text-xs text-emerald-600">Level updated.</p>
      )}

      {open && (
        <div className="space-y-1.5 rounded-md border border-border bg-muted/40 p-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as AffiliationLevel)}
            className="w-full rounded border border-input bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Admin note (optional)"
            className="w-full rounded border border-input bg-transparent px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs"
              onClick={handleSet}
              disabled={isPending || level === currentLevel}
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    </div>
  )
}
