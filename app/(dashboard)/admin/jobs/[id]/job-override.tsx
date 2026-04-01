'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { Loader2, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminOverrideJobStatus, adminAddJobNote } from '@/lib/admin/actions'

type JobStatus = 'assigned' | 'en_route' | 'on_site' | 'completed' | 'cancelled'

const JOB_STATUSES: Array<{ value: JobStatus; label: string }> = [
  { value: 'assigned',  label: 'Assigned' },
  { value: 'en_route',  label: 'En route' },
  { value: 'on_site',   label: 'On-site' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface JobOverrideProps {
  jobId: string
  currentStatus: JobStatus
}

export function JobOverridePanel({ jobId, currentStatus }: JobOverrideProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [notesPending, notesTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [noteError, setNoteError] = useState<string | null>(null)
  const [noteSaved, setNoteSaved] = useState(false)

  function handleStatusChange(newStatus: JobStatus) {
    if (newStatus === currentStatus) return
    const reason = window.prompt(`Reason for overriding to "${newStatus}" (optional):`) ?? undefined
    startTransition(async () => {
      const result = await adminOverrideJobStatus(jobId, newStatus, reason)
      if (result.error) {
        setError(result.error)
      } else {
        setError(null)
        router.refresh()
      }
    })
  }

  function handleNoteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const note = (new FormData(form).get('note') as string).trim()
    if (!note) return
    notesTransition(async () => {
      const result = await adminAddJobNote(jobId, note)
      if (result.error) {
        setNoteError(result.error)
      } else {
        setNoteError(null)
        setNoteSaved(true)
        form.reset()
        setTimeout(() => setNoteSaved(false), 3000)
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Admin controls</h3>
      </div>

      {/* Status override */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Override status</p>
        <div className="flex flex-wrap gap-2">
          {JOB_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => handleStatusChange(s.value)}
              disabled={isPending || s.value === currentStatus}
              className={`rounded-md border px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed ${
                s.value === currentStatus
                  ? 'border-primary bg-primary/10 font-medium text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground disabled:opacity-40'
              }`}
            >
              {isPending && s.value !== currentStatus ? (
                <Loader2 className="inline h-3 w-3 animate-spin" />
              ) : (
                s.label
              )}
            </button>
          ))}
        </div>
        {error && (
          <p className="mt-2 rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">{error}</p>
        )}
      </div>

      {/* Admin note */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Add admin note</p>
        <form onSubmit={handleNoteSubmit} className="flex gap-2">
          <input
            name="note"
            required
            placeholder="Internal note…"
            className="h-8 flex-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button type="submit" size="sm" className="h-8 shrink-0" disabled={notesPending}>
            {notesPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
          </Button>
        </form>
        {noteError && (
          <p className="mt-1 text-xs text-destructive">{noteError}</p>
        )}
        {noteSaved && (
          <p className="mt-1 text-xs text-profit">Note saved.</p>
        )}
      </div>
    </div>
  )
}
