'use client'

import { useState } from 'react'
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
import { toast } from 'sonner'

type CustomRequestStatus = 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'completed'

interface RequestActionsProps {
  requestId: string
  currentStatus: CustomRequestStatus
}

export function RequestActions({ requestId, currentStatus }: RequestActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function update(status: CustomRequestStatus) {
    setError(null)
    startTransition(async () => {
      try {
        await adminUpdateCustomRequestStatus(requestId, status)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update status'
        setError(errorMessage)
        toast.error(`Failed to update request: ${errorMessage}`)
        console.error('Error updating request status:', err)
      }
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
        {currentStatus !== 'declined' && currentStatus !== 'completed' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => update('declined')}
              className="text-destructive focus:text-destructive"
            >
              Decline
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
