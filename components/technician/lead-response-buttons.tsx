'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { acceptLead, declineLead } from '@/lib/technician/actions'

interface LeadResponseButtonsProps {
  leadId: string
  /** Pass the existing assignment status if already responded */
  existingStatus?: 'offered' | 'accepted' | 'declined' | 'expired' | null
}

export function LeadResponseButtons({ leadId, existingStatus }: LeadResponseButtonsProps) {
  const [isPending, startTransition] = useTransition()
  const [declining, setDeclining] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [localStatus, setLocalStatus] = useState(existingStatus ?? null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Already responded
  if (localStatus === 'accepted') {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Accepted
      </div>
    )
  }
  if (localStatus === 'declined') {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <XCircle className="h-3.5 w-3.5" />
        Declined
      </div>
    )
  }

  function handleAccept() {
    setError(null)
    startTransition(async () => {
      const result = await acceptLead(leadId)
      if (result.error) {
        setError(result.error)
        return
      }
      setLocalStatus('accepted')
      // Navigate directly to the new job
      if (result.jobId) {
        router.push(`/technician/jobs/${result.jobId}`)
      } else {
        router.refresh()
      }
    })
  }

  function handleDeclineConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await declineLead(leadId, declineReason.trim() || undefined)
      if (result.error) {
        setError(result.error)
        return
      }
      setLocalStatus('declined')
      setDeclining(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="flex-1 gap-1.5"
          onClick={handleAccept}
          disabled={isPending}
        >
          {isPending && !declining ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          Accept
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5"
          onClick={() => setDeclining((v) => !v)}
          disabled={isPending}
        >
          <XCircle className="h-3.5 w-3.5" />
          Decline
          <ChevronDown
            className={`h-3 w-3 transition-transform ${declining ? 'rotate-180' : ''}`}
          />
        </Button>
      </div>

      {/* Decline reason panel */}
      {declining && (
        <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={2}
            placeholder="Reason for declining (optional)"
            className="w-full resize-none rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 text-xs"
              onClick={handleDeclineConfirm}
              disabled={isPending}
            >
              {isPending && declining ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Confirm Decline'
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => setDeclining(false)}
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
