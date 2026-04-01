import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CustomerForm } from '@/components/onboarding/customer-form'

export const metadata: Metadata = { title: 'Customer Setup' }

export default async function CustomerOnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const defaultFullName = (user?.user_metadata?.full_name as string | undefined) ?? ''

  return <CustomerForm defaultFullName={defaultFullName} />
}
