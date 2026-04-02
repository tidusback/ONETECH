import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, cn } from '@/lib/utils'
import { getReviews } from '@/lib/admin/queries'
import { ReviewActions } from './review-actions'

export const metadata: Metadata = { title: 'Reviews' }

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted',
          )}
        />
      ))}
    </div>
  )
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews()

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '—'
  const published   = reviews.filter((r) => r.is_published).length
  const unpublished = reviews.filter((r) => !r.is_published).length

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Reviews"
        description="Customer ratings and feedback for completed jobs."
        actions={
          unpublished > 0 ? (
            <Badge variant="warning">{unpublished} pending moderation</Badge>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{reviews.length}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Total reviews</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{avgRating}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Avg rating</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{published}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Published</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{unpublished}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Pending</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            All reviews
            {reviews.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {reviews.length} total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 p-0 pb-1">
          {reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Customer reviews will appear here after completed jobs."
              className="py-12"
            />
          ) : (
            <div className="divide-y divide-border">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-start"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StarRating rating={review.rating} />
                      <Badge variant={review.is_published ? 'profit' : 'neutral'}>
                        {review.is_published ? 'Published' : 'Pending'}
                      </Badge>
                    </div>
                    {review.comment && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-foreground">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{review.customer_name ?? review.customer_email}</span>
                      {review.technician_name && (
                        <span>→ {review.technician_name}</span>
                      )}
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                  </div>

                  <ReviewActions reviewId={review.id} isPublished={review.is_published} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
