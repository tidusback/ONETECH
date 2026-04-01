import type { Metadata } from 'next'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cpu, Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Fleet Overview' }

export default function FleetOverviewPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Fleet Overview"
        description="Summary of your registered equipment and service activity."
        actions={
          <Button size="sm" asChild>
            <Link href="/my-machines/add">
              <Plus className="h-4 w-4" />
              Add machine
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Machines Registered" value="—" />
        <StatCard label="Active Service Tickets" value="—" />
        <StatCard label="Parts on Order" value="—" />
      </div>

      <Card className="mt-6">
        <CardContent className="p-0 py-1">
          <EmptyState
            icon={Cpu}
            title="No machines registered"
            description="Add your equipment to start tracking service activity."
            action={
              <Button size="sm" variant="outline" asChild>
                <Link href="/my-machines/add">
                  <Plus className="h-4 w-4" />
                  Add machine
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
