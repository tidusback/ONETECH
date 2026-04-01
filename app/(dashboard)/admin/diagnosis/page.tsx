import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Brain } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryManager, type Category } from './category-manager'

export const metadata: Metadata = { title: 'Diagnosis Rules' }

async function getDiagnosisData() {
  const supabase = await createClient()
  const [categoriesResult, questionsResult] = await Promise.all([
    supabase
      .from('issue_categories')
      .select('id, label, description, sort_order, is_active, created_at')
      .order('sort_order'),
    supabase
      .from('diagnosis_questions')
      .select('id', { count: 'exact', head: true }),
  ])
  return {
    categories: categoriesResult.data ?? [],
    questionCount: questionsResult.count ?? 0,
  }
}

export default async function AdminDiagnosisPage() {
  const { categories, questionCount } = await getDiagnosisData()

  const activeCount   = categories.filter((c) => c.is_active).length
  const inactiveCount = categories.length - activeCount

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Diagnosis Rules"
        description="Manage issue categories and the decision logic for the diagnosis engine."
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{categories.length}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Categories</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{activeCount}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Active</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{inactiveCount}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Inactive</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold tabular-nums">{questionCount}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Total questions</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0 pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            Issue categories
            {categories.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground">
                {categories.length} total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-2 p-0">
          {categories.length === 0 ? (
            <div className="px-6 py-4">
              <EmptyState
                icon={Brain}
                title="No categories yet"
                description="Add issue categories to power the customer diagnosis engine."
                className="py-8"
              />
            </div>
          ) : null}
          <Suspense>
            <CategoryManager categories={categories as Category[]} />
          </Suspense>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
