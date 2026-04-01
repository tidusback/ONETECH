import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Review } from '@/types/customer'

export const metadata: Metadata = { title: 'Reviews' }

// Placeholder — replace with real DB query
const reviews: Review[] = []

export default function ReviewsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Reviews"
        description="Your feedback on completed service visits and repairs."
        actions={
          <Button size="sm" variant="outline" disabled>
            <Star className="h-4 w-4" />
            Write a review
          </Button>
        }
      />

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="After a service is completed, you can share your experience here."
              action={
                <Button size="sm" variant="outline" disabled>
                  <Star className="h-3.5 w-3.5" />
                  Write a review
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, idx) => (
            <ReviewCard key={review.id} review={review} isLast={idx === reviews.length - 1} />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

function ReviewCard({ review, isLast }: { review: Review; isLast: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold">{review.technician_name}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge variant="secondary">{review.service_type}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
          <StarRating rating={review.rating} />
        </div>

        {/* Comment */}
        {review.comment && (
          <>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating
              ? 'fill-warning text-warning-semantic'
              : 'fill-muted text-muted'
          )}
        />
      ))}
      <span className="ml-1.5 text-xs font-medium tabular-nums text-muted-foreground">
        {rating}/5
      </span>
    </div>
  )
}
