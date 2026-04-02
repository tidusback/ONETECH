'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

type ConnStatus = 'online' | 'offline' | 'reconnected'

export function OnlineStatus() {
  // Start as 'online' to avoid hydration mismatch — update on mount
  const [status, setStatus] = useState<ConnStatus>('online')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!navigator.onLine) setStatus('offline')

    let reconnectTimer: ReturnType<typeof setTimeout>

    function handleOffline() {
      clearTimeout(reconnectTimer)
      setStatus('offline')
    }

    function handleOnline() {
      clearTimeout(reconnectTimer)
      setStatus('reconnected')
      reconnectTimer = setTimeout(() => setStatus('online'), 3000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      clearTimeout(reconnectTimer)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!mounted || status === 'online') return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        status === 'offline'
          ? 'flex items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive'
          : 'flex items-center gap-2 border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400'
      }
    >
      {status === 'offline' ? (
        <>
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          No connection — showing cached data. Actions may not save until you reconnect.
        </>
      ) : (
        <>
          <Wifi className="h-3.5 w-3.5 shrink-0" />
          Back online
        </>
      )}
    </div>
  )
}
