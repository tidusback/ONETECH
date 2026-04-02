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
import { adminUpdateRiskStatus } from '@/lib/admin/actions'
import { toast } from 'sonner'

type RiskStatus = 'open' | 'investigating' | 'resolved' | 'dismissed'

interface RiskLogActionsProps {
  logId: string
  currentStatus: RiskStatus
}

export function RiskLogActions({ logId, currentStatus }: RiskLogActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function update(status: RiskStatus) {
    setError(null)
    startTransition(async () => {
      try {
        await adminUpdateRiskStatus(logId, status)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update status'
        setError(errorMessage)
        toast.error(`Failed to update risk log: ${errorMessage}`)
        console.error('Error updating risk log status:', err)
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
        {currentStatus === 'open' && (
          <DropdownMenuItem onClick={() => update('investigating')}>
            Start investigation
          </DropdownMenuItem>
        )}
        {currentStatus !== 'open' && currentStatus !== 'resolved' && currentStatus !== 'dismissed' && (
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
        {currentStatus !== 'dismissed' && (
          <DropdownMenuItem onClick={() => update('dismissed')}>
            Dismiss
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
