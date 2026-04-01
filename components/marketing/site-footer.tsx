import Link from 'next/link'
import { Phone, Mail, MapPin, Linkedin } from 'lucide-react'

const FOOTER_NAV = {
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/about#team', label: 'Leadership Team' },
    { href: '/about#certifications', label: 'Certifications' },
    { href: '/contact', label: 'Contact' },
  ],
  'Products & Services': [
    { href: '/products', label: 'Product Catalog' },
    { href: '/services', label: 'Technical Services' },
    { href: '/parts', label: 'Spare Parts' },
    { href: '/services#installation', label: 'Installation' },
  ],
  Support: [
    { href: '/support', label: 'Support Center' },
    { href: '/technician-program', label: 'Technician Program' },
    { href: '/support#faq', label: 'FAQ' },
    { href: '/support#emergency', label: 'Emergency Line' },
  ],
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      {/* Main columns */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-5 flex items-center gap-3">
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
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Global industrial equipment trading. Connecting manufacturers with premium
              machinery, genuine parts, and certified technical services since 1998.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <a
                href="tel:+18005551234"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                +1 (800) 555-1234
              </a>
              <a
                href="mailto:info@trivelox.com"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                info@trivelox.com
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Toronto, ON &middot; Houston, TX &middot; Rotterdam
              </div>
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(FOOTER_NAV).map(([group, links]) => (
            <div key={group}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
                {group}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Trivelox Trading Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Use
            </Link>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Trivelox on LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
