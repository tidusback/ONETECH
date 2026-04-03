import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Users,
  Wrench,
  ClipboardList,
  LifeBuoy,
  Briefcase,
  Package,
  ShoppingCart,
  Star,
  FileText,
  Gift,
  Brain,
  ShieldAlert,
  ArrowRight,
  UserCog,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Overview' }

async function getOverviewStats() {
  const supabase = await createClient()

  const [customersResult, techniciansResult, adminsResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'technician'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
  ])

  return {
    customers: customersResult.count ?? 0,
    technicians: techniciansResult.count ?? 0,
    admins: adminsResult.count ?? 0,
  }
}

const sections = [
  {
    group: 'People',
    items: [
      { label: 'All Users',    href: '/admin/users',        icon: UserCog,      description: 'Every registered account across all roles' },
      { label: 'Customers',    href: '/admin/customers',    icon: Users,        description: 'Registered customer accounts' },
      { label: 'Technicians',  href: '/admin/technicians',  icon: Wrench,       description: 'Active technician profiles & levels' },
      { label: 'Applications', href: '/admin/applications', icon: ClipboardList, description: 'Pending technician onboarding' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Support Tickets',  href: '/admin/support',         icon: LifeBuoy,   description: 'Open and resolved support cases' },
      { label: 'Service Jobs',     href: '/admin/jobs',            icon: Briefcase,  description: 'In-progress and completed jobs' },
      { label: 'Parts',            href: '/admin/parts',           icon: Package,    description: 'Parts catalog & inventory' },
      { label: 'Orders',           href: '/admin/requests',        icon: ShoppingCart, description: 'Parts request & fulfillment' },
      { label: 'Reviews',          href: '/admin/reviews',         icon: Star,       description: 'Customer ratings & feedback' },
      { label: 'Custom Requests',  href: '/admin/custom-requests', icon: FileText,   description: 'Bespoke service inquiries' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { label: 'Rewards', href: '/admin/rewards', icon: Gift, description: 'Redemptions & reward catalog' },
    ],
  },
  {
    group: 'System',
    items: [
      { label: 'Diagnosis Rules', href: '/admin/diagnosis',  icon: Brain,       description: 'Issue categories & decision logic' },
      { label: 'Risk Logs',       href: '/admin/risk-logs',  icon: ShieldAlert, description: 'Flagged events & audit trail' },
      { label: 'My Profile',      href: '/admin/profile',    icon: User,        description: 'Your account details & platform snapshot' },
    ],
  },
]

export default async function AdminOverviewPage() {
  const stats = await getOverviewStats()

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Admin Overview"
        description="Platform management across all sections."
      />

      {/* Platform stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Customers"   value={String(stats.customers)} />
        <StatCard label="Technicians" value={String(stats.technicians)} />
        <StatCard label="Admins"      value={String(stats.admins)} />
      </div>

      {/* Section grid */}
      <div className="space-y-8">
        {sections.map((group) => (
          <div key={group.group}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {group.group}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="group transition-colors hover:border-primary/40 hover:bg-accent/30">
                    <CardHeader className="pb-2 pt-5">
                      <CardTitle className="flex items-center justify-between text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-5">
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
