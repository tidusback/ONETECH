import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Package } from 'lucide-react'
import { getAllDbParts } from '@/lib/admin/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterBar } from '@/components/admin/filter-bar'
import { PartsTable } from './parts-table'
import { CreatePartButton } from './create-part-button'

export const metadata: Metadata = { title: 'Parts' }

const STATUS_OPTIONS = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default async function AdminPartsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const sp = await searchParams
  const parts = await getAllDbParts()

  const filtered = parts.filter((p) => {
    if (sp.status === 'active' && !p.is_active) return false
    if (sp.status === 'inactive' && p.is_active) return false
    if (sp.search) {
      const q = sp.search.toLowerCase()
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.part_number.toLowerCase().includes(q) &&
        !(p.description ?? '').toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const activeCount   = parts.filter((p) => p.is_active).length
  const inactiveCount = parts.length - activeCount

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Parts"
        description="Manage the diagnosis-linked parts catalog."
        actions={
          <Suspense>
            <CreatePartButton />
          </Suspense>
        }
      />

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{parts.length}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Total parts</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{activeCount}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Active</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{inactiveCount}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Inactive</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            Catalog
            {filtered.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {filtered.length}{parts.length !== filtered.length ? ` of ${parts.length}` : ''} parts
              </span>
            )}
          </CardTitle>
          <Suspense>
            <FilterBar
              searchPlaceholder="Search parts…"
              statusOptions={STATUS_OPTIONS}
              className="w-auto"
            />
          </Suspense>
        </CardHeader>

        <CardContent className="mt-2 p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No parts found"
              description={
                parts.length === 0
                  ? 'Add parts to the catalog using the button above.'
                  : 'No parts match the current filters.'
              }
              className="py-12"
            />
          ) : (
            <Suspense>
              <PartsTable parts={filtered} />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
