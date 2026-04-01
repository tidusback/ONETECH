import { NavHeader } from '@/components/marketing/nav-header'
import { SiteFooter } from '@/components/marketing/site-footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
