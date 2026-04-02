import type { Metadata } from 'next'
import { requireOnboardingComplete } from '@/lib/auth/guards'
import { getProfile } from '@/lib/auth/utils'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { OnlineStatus } from '@/components/pwa/online-status'

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
      {/* Desktop sidebar — hidden on mobile via CSS inside Sidebar */}
      <Sidebar userRole={profile?.role ?? undefined} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar profile={profile} />

        {/* Connectivity banner — renders only when offline or just reconnected */}
        <OnlineStatus />

        {/* pb-20 on mobile creates space above the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        <Footer />
      </div>

      {/* Mobile bottom nav + drawer — md:hidden inside component */}
      <MobileNav
        userRole={profile?.role ?? undefined}
        displayName={profile?.full_name ?? profile?.email ?? undefined}
      />
    </div>
  )
}
