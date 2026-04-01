import type { Metadata } from 'next'
import { getUserWithProfile } from '@/lib/auth/utils'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { RequestForm } from './request-form'

export const metadata: Metadata = { title: 'Parts Request' }

export default async function RequestPage() {
  const { profile } = await getUserWithProfile()

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Parts Request"
        description="Review your selected parts, confirm your details, and submit your request for a quote."
      />
      <RequestForm profile={profile} />
    </PageContainer>
  )
}
