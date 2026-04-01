'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { redeemReward } from '@/lib/technician/actions'

interface RedeemButtonProps {
  rewardId: string
  pointsCost: number
  balance: number
  title: string
}

export function RedeemButton({ rewardId, pointsCost, balance, title }: RedeemButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const canAfford = balance >= pointsCost

  function handleRedeem() {
    if (!confirm) {
      setConfirm(true)
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await redeemReward(rewardId, pointsCost)
      if (result.error) {
        setError(result.error)
        setConfirm(false)
        return
      }
      setConfirm(false)
      router.refresh()
    })
  }

  if (!canAfford) {
    return (
      <Button variant="outline" size="sm" disabled className="w-full">
        {pointsCost - balance} pts short
      </Button>
    )
  }

  return (
    <div className="space-y-1.5">
      <Button
        size="sm"
        variant={confirm ? 'default' : 'outline'}
        className="w-full gap-1.5"
        onClick={handleRedeem}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : confirm ? (
          <>Confirm — {pointsCost.toLocaleString()} pts</>
        ) : (
          <>
            <Gift className="h-3.5 w-3.5" />
            Redeem
          </>
        )}
      </Button>
      {confirm && !isPending && (
        <button
          onClick={() => setConfirm(false)}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
