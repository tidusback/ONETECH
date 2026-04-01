'use client'

import { useRef, useState, useTransition, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AdminActionPopoverProps {
  /** The trigger element (DropdownMenuItem, Button, etc.) */
  trigger: ReactNode
  /** Popover panel title */
  title: string
  /** Confirm button label */
  confirmLabel?: string
  /** Confirm button variant */
  confirmVariant?: 'default' | 'destructive' | 'profit'
  /** Called when the user confirms. Return `{ error }` to show an error. */
  onConfirm: (formData: FormData) => Promise<{ error: string | null }>
  /** Optional callback after a successful confirm */
  onSuccess?: () => void
  /** Extra fields rendered inside the form */
  children?: ReactNode
  className?: string
}

/**
 * Inline popover form that wraps an admin action.
 * Renders a small card beneath its trigger with an optional
 * form body and confirm / cancel buttons.
 *
 * Usage:
 *   <AdminActionPopover
 *     trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Close lead</DropdownMenuItem>}
 *     title="Close this lead?"
 *     confirmLabel="Close lead"
 *     confirmVariant="destructive"
 *     onConfirm={async () => { const { error } = await adminCloseLead(id); return { error } }}
 *   />
 */
export function AdminActionPopover({
  trigger,
  title,
  confirmLabel = 'Confirm',
  confirmVariant = 'default',
  onConfirm,
  onSuccess,
  children,
  className,
}: AdminActionPopoverProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleTriggerClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setOpen((v) => !v)
    setError(null)
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setOpen(false)
    setError(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await onConfirm(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setError(null)
        formRef.current?.reset()
        onSuccess?.()
      }
    })
  }

  return (
    <div className={cn('relative', className)}>
      <div onClick={handleTriggerClick}>{trigger}</div>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-popover p-3 shadow-lg">
          <p className="mb-3 text-sm font-medium">{title}</p>

          <form ref={formRef} onSubmit={handleSubmit}>
            {children && <div className="mb-3 space-y-2">{children}</div>}

            {error && (
              <p className="mb-2 rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant={confirmVariant === 'profit' ? 'default' : confirmVariant}
                className={cn('h-7 px-3 text-xs', confirmVariant === 'profit' && 'bg-profit text-profit-foreground hover:bg-profit/90')}
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                {confirmLabel}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
