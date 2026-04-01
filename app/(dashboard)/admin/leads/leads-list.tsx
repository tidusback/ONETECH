'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, MoreHorizontal, Loader2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminForceAssignLead, adminCloseLead } from '@/lib/admin/actions'
import { formatDate } from '@/lib/utils'
import type { AdminLead } from '@/lib/admin/queries'

type LeadStatus  = 'open' | 'assigned' | 'closed' | 'expired'
type LeadUrgency = 'low' | 'normal' | 'high' | 'urgent'

const statusVariant: Record<LeadStatus, 'profit' | 'default' | 'neutral' | 'secondary'> = {
  open:     'profit',
  assigned: 'default',
  closed:   'neutral',
  expired:  'secondary',
}

const urgencyVariant: Record<LeadUrgency, 'neutral' | 'warning' | 'destructive' | 'loss'> = {
  low:    'neutral',
  normal: 'warning',
  high:   'destructive',
  urgent: 'loss',
}

type ActiveAction = null | 'assign' | 'close'

interface LeadRowProps {
  lead: AdminLead
  technicians: Array<{ id: string; full_name: string | null; email: string }>
}

function LeadRow({ lead, technicians }: LeadRowProps) {
  const router = useRouter()
  const [action, setAction] = useState<ActiveAction>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function closePanel() {
    setAction(null)
    setError(null)
  }

  function handleForceAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const techId = new FormData(e.currentTarget).get('technician_id') as string
    if (!techId) return
    startTransition(async () => {
      const result = await adminForceAssignLead(lead.id, techId)
      if (result.error) {
        setError(result.error)
      } else {
        closePanel()
        router.refresh()
      }
    })
  }

  function handleClose() {
    startTransition(async () => {
      const result = await adminCloseLead(lead.id)
      if (result.error) {
        setError(result.error)
      } else {
        closePanel()
        router.refresh()
      }
    })
  }

  return (
    <div className="border-b border-border">
      {/* Row */}
      <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {lead.lead_number ?? '—'}
            </span>
            <Badge variant={statusVariant[lead.status as LeadStatus]}>
              {lead.status}
            </Badge>
            <Badge variant={urgencyVariant[lead.urgency as LeadUrgency]}>
              {lead.urgency}
            </Badge>
          </div>
          <p className="mt-1 text-sm font-medium">{lead.title}</p>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {(lead.location_city || lead.location_province) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[lead.location_city, lead.location_province].filter(Boolean).join(', ')}
              </span>
            )}
            {lead.category && <span>{lead.category}</span>}
            <span>Created {formatDate(lead.created_at)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {action && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closePanel}>
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {lead.status === 'open' && (
                <DropdownMenuItem onClick={() => setAction('assign')}>
                  Force assign
                </DropdownMenuItem>
              )}
              {(lead.status === 'open' || lead.status === 'assigned') && (
                <>
                  {lead.status === 'open' && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setAction('close')}
                  >
                    Close lead
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Inline action panel — rendered OUTSIDE the dropdown so it's never clipped */}
      {action === 'assign' && (
        <div className="mx-6 mb-4 rounded-lg border border-border bg-card/60 p-3">
          <p className="mb-2 text-xs font-medium">Force assign to technician</p>
          <form onSubmit={handleForceAssign} className="flex flex-wrap items-end gap-2">
            <select
              name="technician_id"
              required
              className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="">Select technician…</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name ?? t.email}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" className="h-8" onClick={closePanel} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8" disabled={isPending}>
                {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Assign
              </Button>
            </div>
          </form>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </div>
      )}

      {action === 'close' && (
        <div className="mx-6 mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="mb-2 text-xs font-medium">Close this lead?</p>
          <p className="mb-3 text-xs text-muted-foreground">This will mark the lead as closed and remove it from the open queue.</p>
          {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" className="h-8" onClick={closePanel} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={handleClose}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Close lead
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface LeadsListProps {
  leads: AdminLead[]
  technicians: Array<{ id: string; full_name: string | null; email: string }>
}

export function LeadsList({ leads, technicians }: LeadsListProps) {
  return (
    <div>
      {leads.map((lead) => (
        <LeadRow key={lead.id} lead={lead} technicians={technicians} />
      ))}
    </div>
  )
}
