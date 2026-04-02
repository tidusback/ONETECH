'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * Detects when a new service worker takes control (i.e., an app update was
 * deployed) and prompts the user to reload. Positioned above the mobile bottom
 * nav on small screens; bottom-right on desktop.
 */
export function SwUpdateToast() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // controllerchange fires when a new SW takes over from a waiting SW.
    // Because our SW calls skipWaiting() on install, this fires on the NEXT
    // page load after a new version is deployed — meaning the user's open tab
    // is now running JS against a potentially different HTML shell.
    const handleControllerChange = () => setVisible(true)

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    return () =>
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
  }, [])

  if (!visible) return null

  return (
    <div
      role="alert"
      className="fixed bottom-20 right-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg md:bottom-6 md:right-6"
    >
      <RefreshCw className="h-4 w-4 shrink-0 text-primary" />
      <div className="flex flex-col leading-snug">
        <span className="text-xs font-semibold">Update available</span>
        <span className="text-[11px] text-muted-foreground">Reload to get the latest version</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="ml-1 shrink-0 rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
      >
        Reload
      </button>
    </div>
  )
}
