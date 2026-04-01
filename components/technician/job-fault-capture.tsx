'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle, CheckCircle2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { captureActualFault } from '@/lib/technician/actions'

interface JobFaultCaptureProps {
  jobId: string
  currentFault: string | null
  /** Only show if job is on_site or completed */
  jobStatus: 'assigned' | 'en_route' | 'on_site' | 'completed' | 'cancelled'
}

export function JobFaultCapture({ jobId, currentFault, jobStatus }: JobFaultCaptureProps) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(!currentFault)
  const [fault, setFault] = useState(currentFault ?? '')
  const [saved, setSaved] = useState(!!currentFault)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Only relevant once on-site or later
  if (!['on_site', 'completed'].includes(jobStatus)) return null

  function handleSave() {
    if (!fault.trim()) {
      setError('Please describe the fault found.')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await captureActualFault(jobId, fault.trim())
      if (result.error) {
        setError(result.error)
        return
      }
      setSaved(true)
      setEditing(false)
      router.refresh()
    })
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Actual Fault Found</span>
        </div>
        {saved && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={fault}
            onChange={(e) => setFault(e.target.value)}
            rows={3}
            placeholder="Describe the actual fault found on-site — e.g. 'Faulty capacitor on control board. Replaced with OEM part.'"
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Save Fault
            </Button>
            {saved && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setFault(currentFault ?? ''); setEditing(false) }}
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-foreground">{fault}</p>
      )}
    </div>
  )
}
