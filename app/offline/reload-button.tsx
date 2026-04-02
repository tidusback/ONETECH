'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OfflineReloadButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.location.reload()}
      className="gap-2"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Try again
    </Button>
  )
}
