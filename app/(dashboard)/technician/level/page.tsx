import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import {
  getMyProgressionCriteria,
  getMyLevelRequests,
  getMyApplication,
} from '@/lib/technician/queries'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { LevelContent } from './level-content'

export const metadata: Metadata = { title: 'My Level' }

export default async function LevelPage() {
  const user    = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  if (profile?.role !== 'technician') redirect('/dashboard')

  const [criteria, history, application] = await Promise.all([
    getMyProgressionCriteria(user.id),
    getMyLevelRequests(user.id),
    getMyApplication(),
  ])

  return (
    <PageContainer size="narrow">
      <PageHeader
        title="My Level"
        description="Track your affiliation tier and request promotion when ready."
      />
      <LevelContent
        userId={user.id}
        criteria={criteria}
        history={history}
        levelUpdatedAt={application?.level_updated_at ?? null}
      />
    </PageContainer>
  )
}
