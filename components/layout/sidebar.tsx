'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Cpu,
  ClipboardList,
  LifeBuoy,
  Package,
  FileText,
  Star,
  User,
  Settings,
  LogOut,
  Wrench,
  ShoppingCart,
  Briefcase,
  Zap,
  Gift,
  MapPin,
  BadgeCheck,
  Users,
  UserCog,
  Coins,
  Award,
  Brain,
  ShieldAlert,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/request-cart'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ---------------------------------------------------------------------------
// Customer nav items
// ---------------------------------------------------------------------------
const customerNavItems = [
  { label: 'Dashboard',         href: '/dashboard',         icon: LayoutDashboard },
  { label: 'My Machines',       href: '/my-machines',       icon: Cpu },
  { label: 'Diagnosis History', href: '/diagnosis-history', icon: ClipboardList },
  { label: 'Support Tickets',   href: '/support-tickets',   icon: LifeBuoy },
  { label: 'Orders',            href: '/orders',            icon: Package },
  { label: 'Custom Requests',   href: '/custom-requests',   icon: FileText },
  { label: 'Reviews',           href: '/reviews',           icon: Star },
]

// ---------------------------------------------------------------------------
// Technician nav items
// ---------------------------------------------------------------------------
const technicianNavItems = [
  { label: 'Dashboard',      href: '/dashboard',               icon: LayoutDashboard },
  { label: 'My Leads',       href: '/technician/leads',        icon: Zap },
  { label: 'My Jobs',        href: '/technician/jobs',         icon: Briefcase },
  { label: 'My Points',      href: '/technician/points',       icon: Star },
  { label: 'Rewards',        href: '/technician/rewards',      icon: Gift },
  { label: 'My Level',       href: '/technician/level',        icon: Award },
  { label: 'Service Areas',  href: '/technician/service-areas', icon: MapPin },
  { label: 'Verification',   href: '/technician/verification', icon: BadgeCheck },
]

// ---------------------------------------------------------------------------
// Admin nav — grouped sections
// ---------------------------------------------------------------------------
const adminNavGroups = [
  {
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'All Users',     href: '/admin/users',        icon: UserCog },
      { label: 'Customers',     href: '/admin/customers',    icon: Users },
      { label: 'Technicians',   href: '/admin/technicians',  icon: Wrench },
      { label: 'Applications',  href: '/admin/applications', icon: ClipboardList },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Leads',            href: '/admin/leads',            icon: Radio },
      { label: 'Support Tickets',  href: '/admin/support',          icon: LifeBuoy },
      { label: 'Service Jobs',     href: '/admin/jobs',             icon: Briefcase },
      { label: 'Parts',            href: '/admin/parts',            icon: Package },
      { label: 'Orders',           href: '/admin/requests',         icon: ShoppingCart },
      { label: 'Reviews',          href: '/admin/reviews',          icon: Star },
      { label: 'Custom Requests',  href: '/admin/custom-requests',  icon: FileText },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Points',   href: '/admin/points',   icon: Coins },
      { label: 'Rewards',  href: '/admin/rewards',  icon: Gift },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Diagnosis Rules', href: '/admin/diagnosis',  icon: Brain },
      { label: 'Risk Logs',       href: '/admin/risk-logs',  icon: ShieldAlert },
    ],
  },
]

// ---------------------------------------------------------------------------
// Bottom nav (shared)
// ---------------------------------------------------------------------------
const bottomNavItems = [
  { label: 'Profile',  href: '/profile',  icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  userRole?: 'customer' | 'technician' | 'admin'
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { itemCount } = useCart()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const navLinkClass = (active: boolean) =>
    cn(
      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
      active
        ? 'bg-primary/10 font-medium text-primary'
        : 'font-medium text-muted-foreground hover:bg-accent hover:text-foreground',
    )

  const isTechnician = userRole === 'technician'
  const isAdmin      = userRole === 'admin'

  // -------------------------------------------------------------------------
  // Admin sidebar — dedicated nav
  // -------------------------------------------------------------------------
  if (isAdmin) {
    return (
      <aside className="hidden md:flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border px-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold tracking-tight">Trivelox</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Admin nav */}
        <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
          {adminNavGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-1' : ''}>
              {group.label && (
                <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkClass(isActive(item.href, 'exact' in item ? item.exact : false))}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom nav — admin-specific profile + settings */}
        <div className="flex flex-col gap-0.5 border-t border-border px-3 py-3">
          <Link
            href="/admin/profile"
            className={navLinkClass(isActive('/admin/profile'))}
          >
            <User className="h-4 w-4 shrink-0" />
            My Profile
          </Link>
          <Link
            href="/settings"
            className={navLinkClass(isActive('/settings'))}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    )
  }

  // -------------------------------------------------------------------------
  // Customer / Technician sidebar
  // -------------------------------------------------------------------------
  const primaryNav = isTechnician ? technicianNavItems : customerNavItems

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">Trivelox</span>
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
        {primaryNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={navLinkClass(isActive(item.href))}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}

        {/* Parts Request — with live cart count (customers only) */}
        {!isTechnician && (
          <Link
            href="/request"
            className={navLinkClass(isActive('/request'))}
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            <span className="flex-1">Parts Request</span>
            {itemCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-mono text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col gap-0.5 border-t border-border px-3 py-3">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={navLinkClass(isActive(item.href))}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
