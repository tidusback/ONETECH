'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { initials } from '@/lib/utils'
import type { Profile } from '@/types'

const pageTitles: Record<string, string> = {
  '/dashboard':         'Dashboard',
  '/my-machines':       'My Machines',
  '/support/new':       'Fix My Machine',
  '/diagnosis-history': 'Diagnosis History',
  '/support-tickets':   'Support Tickets',
  '/orders':            'Orders',
  '/custom-requests':   'Custom Requests',
  '/reviews':           'Reviews',
  '/profile':           'Profile',
  '/settings':          'Settings',
}

function getPageTitle(pathname: string): string {
  const key = Object.keys(pageTitles)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname.startsWith(k))
  return key ? pageTitles[key] : 'Trivelox'
}

interface NavbarProps {
  profile: Profile | null
}

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-sm font-semibold">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications — placeholder */}
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>

        {/* Avatar */}
        <div className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-primary/20">
          {initials(profile?.full_name ?? profile?.email)}
        </div>
      </div>
    </header>
  )
}
