'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateJobStatus, getNextJobStatuses } from '@/lib/technician/actions'
import type { JobStatus } from '@/lib/technician/queries'

const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  assigned:  'Assigned',
  en_route:  'En Route',
  on_site:   'On Site',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface JobStatusUpdaterProps {
  jobId: string
  currentStatus: JobStatus
}

export function JobStatusUpdater({ jobId, currentStatus }: JobStatusUpdaterProps) {
  const [isPending, startTransition] = useTransition()
  const [completionNotes, setCompletionNotes] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const nextOptions = getNextJobStatuses(currentStatus)
  if (nextOptions.length === 0) return null

  function handleUpdate(status: JobStatus) {
    setError(null)
    startTransition(async () => {
      const result = await updateJobStatus(
        jobId,
        status,
        status === 'completed' ? completionNotes : undefined
      )
      if (result.error) {
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
          <>
            Update Status
            <ChevronDown className="h-3.5 w-3.5" />
          </>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-lg border border-border bg-card p-3 shadow-lg">
          {/* Completion notes — only shown when 'completed' is an option */}
          {nextOptions.includes('completed') && (
            <div className="mb-3 space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">
                Completion notes{' '}
                <span className="font-normal">(optional)</span>
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Replaced faulty valve. System running normally."
                className="w-full resize-none rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          )}

          <div className="space-y-1">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Move to:</p>
            {nextOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleUpdate(status)}
                className="w-full rounded-md px-3 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                {JOB_STATUS_LABELS[status]}
              </button>
            ))}
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
