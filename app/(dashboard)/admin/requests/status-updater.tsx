'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateRequestStatus } from '@/lib/orders/actions'
import { REQUEST_STATUS_CONFIG } from '@/components/orders/request-status-badge'
import type { RequestStatus } from '@/lib/orders/queries'

const NEXT_STATUSES: Partial<Record<RequestStatus, RequestStatus[]>> = {
  pending:    ['reviewing', 'cancelled'],
  reviewing:  ['quoted', 'confirmed', 'cancelled'],
  quoted:     ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped:    ['delivered'],
}

interface StatusUpdaterProps {
  requestId: string
  currentStatus: RequestStatus
  adminNotes?: string | null
}

export function StatusUpdater({ requestId, currentStatus, adminNotes }: StatusUpdaterProps) {
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(adminNotes ?? '')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const nextOptions = NEXT_STATUSES[currentStatus] ?? []

  if (nextOptions.length === 0) return null

  function handleUpdate(status: RequestStatus) {
    setError(null)
    startTransition(async () => {
      const result = await updateRequestStatus(requestId, status, notes || undefined)
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

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
          <>Update Status <ChevronDown className="h-3.5 w-3.5" /></>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-lg border border-border bg-card p-3 shadow-lg">
          {/* Admin notes */}
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Admin notes (optional — shown to customer)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Quote attached. Lead time 3–5 days."
              className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Status options */}
          <div className="space-y-1">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Move to:</p>
            {nextOptions.map((status) => {
              const { label } = REQUEST_STATUS_CONFIG[status]
              const isDanger = status === 'cancelled'
              return (
                <button
                  key={status}
                  onClick={() => handleUpdate(status)}
                  className={`w-full rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                    isDanger
                      ? 'text-destructive hover:bg-destructive/10'
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
