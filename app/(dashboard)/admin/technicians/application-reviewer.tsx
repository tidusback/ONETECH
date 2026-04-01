'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateApplicationStatus } from '@/lib/technician/actions'
import type { ApplicationStatus } from '@/lib/technician/queries'
import { APPLICATION_STATUS_CONFIG } from '@/lib/validations/onboarding'

const NEXT_STATUSES: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
  pending:      ['under_review', 'approved', 'rejected', 'requires_info'],
  under_review: ['approved', 'rejected', 'requires_info'],
  requires_info: ['under_review', 'approved', 'rejected'],
}

interface ApplicationReviewerProps {
  applicationId: string
  currentStatus: ApplicationStatus
  adminNotes?: string | null
}

export function ApplicationReviewer({
  applicationId,
  currentStatus,
  adminNotes,
}: ApplicationReviewerProps) {
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(adminNotes ?? '')
  const [rejectionReason, setRejectionReason] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const nextOptions = NEXT_STATUSES[currentStatus] ?? []
  if (nextOptions.length === 0) return null

  function handleUpdate(status: ApplicationStatus) {
    setError(null)
    startTransition(async () => {
      const result = await updateApplicationStatus(applicationId, status, {
        adminNotes: notes || undefined,
        rejectionReason: status === 'rejected' ? (rejectionReason || undefined) : undefined,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  const isDanger = (s: ApplicationStatus) => s === 'rejected'
  const isWarning = (s: ApplicationStatus) => s === 'requires_info'

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            Update Status
            <ChevronDown className="h-3.5 w-3.5" />
          </>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-80 rounded-lg border border-border bg-card p-3 shadow-lg">
          {/* Admin notes */}
          <div className="mb-3 space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">
              Admin notes{' '}
              <span className="font-normal">(optional — visible to applicant)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Application is being reviewed. We may contact you."
              className="w-full resize-none rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Rejection reason (only shown when rejection is an option) */}
          {nextOptions.includes('rejected') && (
            <div className="mb-3 space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Rejection reason{' '}
                <span className="font-normal">(if rejecting)</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                placeholder="e.g. Skills don't match current openings."
                className="w-full resize-none rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          )}

          {/* Status options */}
          <div className="space-y-1">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Move to:</p>
            {nextOptions.map((status) => {
              const { label } = APPLICATION_STATUS_CONFIG[status]
              return (
                <button
                  key={status}
                  onClick={() => handleUpdate(status)}
                  className={`w-full rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                    isDanger(status)
                      ? 'text-destructive hover:bg-destructive/10'
                      : isWarning(status)
                        ? 'text-orange-500 hover:bg-orange-500/10'
                        : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

          <button
            onClick={() => setOpen(false)}
            className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
