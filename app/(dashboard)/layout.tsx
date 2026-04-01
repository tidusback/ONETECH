import type { Metadata } from 'next'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireOnboardingComplete()
  const profile = await getProfile(user.id)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userRole={profile?.role ?? undefined} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar profile={profile} />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  )
}
