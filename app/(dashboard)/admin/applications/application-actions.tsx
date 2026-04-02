'use client'

import { useTransition } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { adminUpdateApplicationStatus, adminSetAffiliationLevel } from '@/lib/admin/actions'
import type { ApplicationStatus } from '@/lib/technician/queries'

type AffiliationLevel = 'affiliate_technician' | 'certified_technician' | 'certified_partner'

interface ApplicationActionsProps {
  applicationId:   string
  currentStatus:   ApplicationStatus
  currentLevel:    AffiliationLevel
}

export function ApplicationActions({
  applicationId,
  currentStatus,
  currentLevel,
}: ApplicationActionsProps) {
  const [isPending, startTransition] = useTransition()

  function updateStatus(status: ApplicationStatus, level?: AffiliationLevel) {
    startTransition(async () => {
      await adminUpdateApplicationStatus(applicationId, status, {
        affiliationLevel: level,
      })
    })
  }

  function setLevel(level: AffiliationLevel) {
    startTransition(async () => {
      await adminSetAffiliationLevel(applicationId, level)
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
        {/* Status transitions */}
        {currentStatus === 'pending' && (
          <DropdownMenuItem onClick={() => updateStatus('under_review')}>
            Start review
          </DropdownMenuItem>
        )}
        {(currentStatus === 'under_review' || currentStatus === 'requires_info') && (
          <>
            <DropdownMenuItem
              onClick={() => updateStatus('approved', currentLevel)}
            >
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus('requires_info')}>
              Request more info
            </DropdownMenuItem>
          </>
        )}
        {currentStatus === 'approved' && (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Set level
            </DropdownMenuLabel>
            <DropdownMenuItem
              disabled={currentLevel === 'affiliate_technician'}
              onClick={() => setLevel('affiliate_technician')}
            >
              Affiliate Technician
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={currentLevel === 'certified_technician'}
              onClick={() => setLevel('certified_technician')}
            >
              Certified Technician
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={currentLevel === 'certified_partner'}
              onClick={() => setLevel('certified_partner')}
            >
              Certified Partner
            </DropdownMenuItem>
          </>
        )}
        {currentStatus !== 'rejected' && currentStatus !== 'approved' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => updateStatus('rejected')}
              className="text-destructive focus:text-destructive"
            >
              Reject
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
