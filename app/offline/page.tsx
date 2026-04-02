import type { Metadata } from 'next'
import { WifiOff } from 'lucide-react'
import { OfflineReloadButton } from './reload-button'

export const metadata: Metadata = { title: 'Offline' }

export default function OfflinePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">You&apos;re offline</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          No internet connection. Any pages you&apos;ve already visited are available below.
          New data will sync when you reconnect.
        </p>
      </div>

      <OfflineReloadButton />

      <p className="text-[11px] text-muted-foreground/60">Trivelox Trading Inc.</p>
    </div>
  )
}
