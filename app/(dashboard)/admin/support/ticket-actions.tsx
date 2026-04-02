'use client'

import { useTransition } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { adminUpdateTicketStatus } from '@/lib/admin/actions'

type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'

interface TicketActionsProps {
  ticketId: string
  currentStatus: TicketStatus
}

export function TicketActions({ ticketId, currentStatus }: TicketActionsProps) {
  const [isPending, startTransition] = useTransition()

  function update(status: TicketStatus) {
    startTransition(async () => {
      await adminUpdateTicketStatus(ticketId, status)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus !== 'in_progress' && (
          <DropdownMenuItem onClick={() => update('in_progress')}>
            Mark in progress
          </DropdownMenuItem>
        )}
        {currentStatus !== 'waiting_customer' && (
          <DropdownMenuItem onClick={() => update('waiting_customer')}>
            Waiting on customer
          </DropdownMenuItem>
        )}
        {currentStatus !== 'open' && (
          <DropdownMenuItem onClick={() => update('open')}>
            Reopen
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {currentStatus !== 'resolved' && (
          <DropdownMenuItem onClick={() => update('resolved')}>
            Mark resolved
          </DropdownMenuItem>
        )}
        {currentStatus !== 'closed' && (
          <DropdownMenuItem onClick={() => update('closed')}>
            Close ticket
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
