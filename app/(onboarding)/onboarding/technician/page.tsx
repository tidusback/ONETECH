import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TechnicianForm } from '@/components/onboarding/technician-form'

export const metadata: Metadata = { title: 'Technician Application' }

export default async function TechnicianOnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const defaultFullName = (user?.user_metadata?.full_name as string | undefined) ?? ''

  return <TechnicianForm defaultFullName={defaultFullName} />
}
