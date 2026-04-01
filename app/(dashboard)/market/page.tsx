import type { Metadata } from 'next'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export const metadata: Metadata = { title: 'Market' }

export default function MarketPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Market"
        description="Live prices, watchlists, and market data."
      />

      <Card>
        <CardContent className="p-0 py-1">
          <EmptyState
            icon={TrendingUp}
            title="Market data coming soon"
            description="Live price feeds and watchlists will be available here."
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
