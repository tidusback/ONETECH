'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, CircleUserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DISMISS_KEY = 'trivelox_profile_banner_v1'

interface ProfileCompletionBannerProps {
  className?: string
}

export function ProfileCompletionBanner({ className }: ProfileCompletionBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show after mount to avoid SSR/hydration mismatch
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="status"
      className={cn(
        'flex items-start justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <CircleUserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-medium leading-tight">Complete your profile</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add your company, contact details, and preferences to get the most out of the platform.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings">Update profile</Link>
        </Button>
        <button
          onClick={dismiss}
          className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Dismiss profile prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
