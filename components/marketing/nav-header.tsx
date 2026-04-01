'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/services', label: 'Services' },
  { href: '/parts', label: 'Parts' },
  { href: '/support', label: 'Support' },
  { href: '/about', label: 'About' },
]

export function NavHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => setOpen(false)}
        >
          {/* Replace inner content with next/image when logo asset is ready */}
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <span className="text-[11px] font-bold tracking-widest text-white">TX</span>
          </div>
          <div className="leading-none">
            <span className="block text-sm font-bold tracking-tight text-foreground">
              TRIVELOX
            </span>
            <span className="block text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Trading Inc.
            </span>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
                isActive(href)
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/technician-program">Technician Program</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-0.5 px-4 py-3" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(href)
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/technician-program" onClick={() => setOpen(false)}>
                Technician Program
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/contact" onClick={() => setOpen(false)}>
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
