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
import { adminUpdateCustomRequestStatus } from '@/lib/admin/actions'

type CustomRequestStatus = 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'completed'

interface RequestActionsProps {
  requestId: string
  currentStatus: CustomRequestStatus
}

export function RequestActions({ requestId, currentStatus }: RequestActionsProps) {
  const [isPending, startTransition] = useTransition()

  function update(status: CustomRequestStatus) {
    startTransition(async () => {
      await adminUpdateCustomRequestStatus(requestId, status)
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
        {currentStatus === 'new' && (
          <DropdownMenuItem onClick={() => update('reviewing')}>
            Mark reviewing
          </DropdownMenuItem>
        )}
        {currentStatus === 'reviewing' && (
          <DropdownMenuItem onClick={() => update('quoted')}>
            Send quote
          </DropdownMenuItem>
        )}
        {currentStatus === 'quoted' && (
          <DropdownMenuItem onClick={() => update('accepted')}>
            Mark accepted
          </DropdownMenuItem>
        )}
        {currentStatus === 'accepted' && (
          <DropdownMenuItem onClick={() => update('completed')}>
            Mark completed
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {currentStatus !== 'declined' && currentStatus !== 'completed' && (
          <DropdownMenuItem
            onClick={() => update('declined')}
            className="text-destructive focus:text-destructive"
          >
            Decline
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
