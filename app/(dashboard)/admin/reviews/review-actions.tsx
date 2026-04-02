'use client'

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
import { adminToggleReviewPublished, adminDeleteReview } from '@/lib/admin/actions'

interface ReviewActionsProps {
  reviewId: string
  isPublished: boolean
}

export function ReviewActions({ reviewId, isPublished }: ReviewActionsProps) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await adminToggleReviewPublished(reviewId, !isPublished)
    })
  }

  function remove() {
    if (!confirm('Delete this review? This cannot be undone.')) return
    startTransition(async () => {
      await adminDeleteReview(reviewId)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggle}>
          {isPublished ? 'Unpublish' : 'Publish'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={remove}
          className="text-destructive focus:text-destructive"
        >
          Delete review
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
