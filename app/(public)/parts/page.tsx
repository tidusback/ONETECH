import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, ShieldCheck, Clock, Truck, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/marketing/section-header'
import { CtaSection } from '@/components/marketing/cta-section'
import { PartsCatalog } from '@/components/parts/parts-catalog'

export const metadata: Metadata = {
  title: 'Spare Parts Catalog',
  description:
    'Browse 14,000+ genuine OEM spare parts for industrial machinery. Search by part number, filter by machine type, and request a quote — same-day dispatch available.',
}

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: '100% Genuine OEM Parts',
    description:
      'Sourced directly from original equipment manufacturers. Every part ships with full traceability documentation.',
  },
  {
    icon: Clock,
    title: 'Same-Day Emergency Dispatch',
    description:
      'In-stock items dispatch the same business day. Emergency courier available 24/7 for production-critical failures.',
  },
  {
    icon: BarChart3,
    title: 'Consignment Stock Programs',
    description:
      'We can place a curated inventory of fast-moving parts on-site at your facility — billed only when consumed.',
  },
  {
    icon: Truck,
    title: 'Global Logistics Coverage',
    description:
      'Three warehouses across North America and Europe with delivery to 190+ countries via DHL, FedEx, and air freight.',
  },
]

export default function PartsPage() {
  return (
    <>
      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Spare Parts
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Parts Catalog
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Browse genuine OEM parts for packaging, processing, material handling, and
                automation equipment. In-stock items ship same-day.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button asChild>
                <Link href="/contact">Request a Quote</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="tel:+18005551234">
                  <Phone className="h-4 w-4" />
                  Emergency Parts Line
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
            {[
              { value: '14,000+', label: 'Part Numbers Stocked' },
              { value: '3', label: 'Global Warehouses' },
              { value: '98.4%', label: 'First-Fill Rate' },
              { value: 'Same Day', label: 'Emergency Dispatch' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive catalog ───────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Parts Catalog
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Search &amp; Filter Parts
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Search by name or part number, or filter by machine type to find compatible components.
            </p>
          </div>
          <PartsCatalog />
        </div>
      </section>

      {/* ── Guarantees ────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Our Commitment"
            heading="The Trivelox Parts Guarantee"
            description="Genuine parts, full traceability, and reliable delivery — every order, every time."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {GUARANTEES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-5 rounded-lg border border-border bg-background p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Legacy equipment panel ────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-6 rounded-lg border border-border bg-card p-8 text-center sm:p-10 lg:flex-row lg:text-left">
            <div className="flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                Legacy &amp; Obsolete Parts
              </p>
              <h3 className="text-xl font-semibold text-foreground">Can't Find Your Part Number?</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Our identification team specialises in sourcing discontinued and obsolete components.
                Send us a photo, the machine nameplate, or a description — we'll track it down.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/contact">Submit a Parts Request</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="tel:+18005551234">
                  <Phone className="h-4 w-4" />
                  Call Our Parts Desk
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CtaSection
        overline="Need Parts Fast?"
        heading="Same-Day Dispatch Available"
        description="Contact our parts team now. Stocked items dispatch same business day. Emergency courier available 24/7 for production-critical situations."
        primaryLabel="Request a Parts Quote"
        primaryHref="/contact"
        secondaryLabel="Emergency Line"
        secondaryHref="tel:+18005551234"
      />
    </>
  )
}
