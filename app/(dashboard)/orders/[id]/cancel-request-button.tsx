'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cancelRequest } from '@/lib/orders/actions'

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  function handleCancelClick() {
    if (!confirming) {
      setConfirming(true)
      return
    }

    startTransition(async () => {
      const result = await cancelRequest(requestId)
      if (!result.success) {
        setError(result.error)
        setConfirming(false)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCancelClick}
        disabled={isPending}
        className={confirming ? 'border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive' : ''}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : confirming ? (
          'Confirm Cancel'
        ) : (
          'Cancel Request'
        )}
      </Button>
      {confirming && !isPending && (
        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setConfirming(false)}
        >
          Keep request
        </button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
