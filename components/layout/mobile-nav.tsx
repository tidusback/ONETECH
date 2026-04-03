'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Zap,
  Coins,
  Package,
  Cpu,
  LifeBuoy,
  ShoppingCart,
  Award,
  MapPin,
  BadgeCheck,
  Gift,
  FileText,
  Star,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Wrench,
  ClipboardList,
  Users,
  Brain,
  ShieldAlert,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/request-cart'

// ─── Role-specific primary tabs (shown in the bottom bar) ────────────────────

const TECH_TABS = [
  { label: 'Home',   href: '/dashboard',        icon: LayoutDashboard },
  { label: 'Jobs',   href: '/technician/jobs',  icon: Briefcase },
  { label: 'Leads',  href: '/technician/leads', icon: Zap },
  { label: 'Points', href: '/technician/points', icon: Coins },
] as const

const CUSTOMER_TABS = [
  { label: 'Home',     href: '/dashboard',       icon: LayoutDashboard },
  { label: 'Machines', href: '/my-machines',     icon: Cpu },
  { label: 'Tickets',  href: '/support-tickets', icon: LifeBuoy },
  { label: 'Orders',   href: '/orders',          icon: Package },
] as const

const ADMIN_TABS = [
  { label: 'Overview', href: '/admin',          icon: LayoutDashboard, exact: true },
  { label: 'Users',    href: '/admin/users',    icon: Users },
  { label: 'Support',  href: '/admin/support',  icon: LifeBuoy },
  { label: 'Parts',    href: '/admin/parts',    icon: Package },
] as const

// ─── Drawer nav groups (shown in the slide-up "More" drawer) ─────────────────

const TECH_DRAWER = [
  {
    label: 'Career',
    items: [
      { label: 'My Level',      href: '/technician/level',         icon: Award },
      { label: 'Rewards',       href: '/technician/rewards',       icon: Gift },
      { label: 'Service Areas', href: '/technician/service-areas', icon: MapPin },
      { label: 'Verification',  href: '/technician/verification',  icon: BadgeCheck },
      { label: 'My Profile',    href: '/technician/profile',       icon: User },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile',  href: '/profile',  icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

const CUSTOMER_DRAWER = [
  {
    label: 'Services',
    items: [
      { label: 'Parts Request',   href: '/request',         icon: ShoppingCart },
      { label: 'Custom Requests', href: '/custom-requests', icon: FileText },
      { label: 'Reviews',         href: '/reviews',         icon: Star },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile',  href: '/profile',  icon: User },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

const ADMIN_DRAWER = [
  {
    label: 'People',
    items: [
      { label: 'Customers',    href: '/admin/customers',    icon: Users },
      { label: 'Technicians',  href: '/admin/technicians',  icon: Wrench },
      { label: 'Applications', href: '/admin/applications', icon: ClipboardList },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Leads',    href: '/admin/leads',   icon: Radio },
      { label: 'Jobs',     href: '/admin/jobs',    icon: Briefcase },
      { label: 'Orders',   href: '/admin/requests', icon: ShoppingCart },
      { label: 'Reviews',  href: '/admin/reviews',  icon: Star },
      { label: 'Custom Requests', href: '/admin/custom-requests', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Diagnosis', href: '/admin/diagnosis', icon: Brain },
      { label: 'Risk Logs', href: '/admin/risk-logs', icon: ShieldAlert },
      { label: 'Profile',   href: '/profile',          icon: User },
      { label: 'Settings',  href: '/settings',         icon: Settings },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface MobileNavProps {
  userRole?: 'customer' | 'technician' | 'admin'
  displayName?: string | null
}

export function MobileNav({ userRole, displayName }: MobileNavProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const { itemCount } = useCart()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [drawerOpen])

  async function handleSignOut() {
    setDrawerOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/admin' && exact) return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const isTech     = userRole === 'technician'
  const isAdmin    = userRole === 'admin'
  const tabs       = isAdmin ? ADMIN_TABS : isTech ? TECH_TABS : CUSTOMER_TABS
  const drawerData = isAdmin ? ADMIN_DRAWER : isTech ? TECH_DRAWER : CUSTOMER_DRAWER

  return (
    <>
      {/* ── Bottom tab bar ────────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-border bg-card/95 backdrop-blur-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href, 'exact' in tab ? tab.exact : false)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <div className="relative">
                <tab.icon className={cn('h-5 w-5', active && 'text-primary')} />
                {/* Cart badge for customer Parts Request */}
                {(tab.href as string) === '/request' && itemCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </div>
              {tab.label}
            </Link>
          )
        })}

        {/* More — opens drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            'flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-medium transition-colors',
            drawerOpen ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>

      {/* ── Drawer backdrop ───────────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Drawer panel ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 md:hidden flex flex-col rounded-t-2xl border-t border-border bg-card transition-transform duration-300 ease-in-out',
          drawerOpen ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{
          maxHeight: '80dvh',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Close button + user */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{displayName ?? 'Account'}</span>
            <span className="text-[10px] capitalize text-muted-foreground">
              {userRole ?? 'user'}
            </span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto px-3 pb-2">
          {drawerData.map((group) => (
            <div key={group.label} className="mb-1">
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <div className="border-t border-border px-3 py-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}
