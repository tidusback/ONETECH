import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Clock,
  ArrowLeft,
  Phone,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PartCard } from '@/components/parts/part-card'
import { AddToRequestButton } from '@/components/parts/add-to-request-button'
import {
  getPartBySlug,
  getRelatedParts,
  PARTS_CATALOG,
  PART_CATEGORY_META,
  MACHINE_TYPE_LABELS,
  AVAILABILITY_LABELS,
  type SparePart,
} from '@/lib/parts-catalog'

// ---------------------------------------------------------------------------
// Static generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return PARTS_CATALOG.map((part) => ({ slug: part.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const part = getPartBySlug(slug)
  if (!part) return {}
  return {
    title: `${part.name} — ${part.partNumber}`,
    description: part.description,
  }
}

// ---------------------------------------------------------------------------
// Availability display helpers
// ---------------------------------------------------------------------------

function AvailabilityIndicator({ availability }: { availability: SparePart['availability'] }) {
  if (availability === 'in-stock') {
    return (
      <div className="flex items-center gap-2 text-profit">
        <CheckCircle className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">{AVAILABILITY_LABELS['in-stock']}</span>
      </div>
    )
  }
  if (availability === 'limited') {
    return (
      <div className="flex items-center gap-2 text-warning-semantic">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">{AVAILABILITY_LABELS['limited']}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Clock className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">{AVAILABILITY_LABELS['order-only']}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const part = getPartBySlug(slug)
  if (!part) notFound()

  const related = getRelatedParts(part, 3)
  const categoryMeta = PART_CATEGORY_META[part.category]

  return (
    <>
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link href="/parts" className="hover:text-foreground">
              Parts
            </Link>
            <span>/</span>
            <span className="text-foreground">{part.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

            {/* ── Left: Part details ──────────────────────────────────────── */}
            <div className="lg:col-span-2">
              {/* Back */}
              <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 gap-1.5 text-muted-foreground">
                <Link href="/parts">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Parts Catalog
                </Link>
              </Button>

              {/* Category + badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {categoryMeta.label}
                </span>
                <Badge
                  variant={
                    part.availability === 'in-stock'
                      ? 'profit'
                      : part.availability === 'limited'
                        ? 'warning'
                        : 'neutral'
                  }
                >
                  {AVAILABILITY_LABELS[part.availability]}
                </Badge>
              </div>

              {/* Part number + name */}
              <p className="mt-4 font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {part.partNumber}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                {part.name}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {part.description}
              </p>

              {/* Lead time */}
              <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  Lead time: <span className="font-medium text-foreground">{part.leadTime}</span>
                </span>
              </div>

              {/* ── Specifications table ─────────────────────────────────── */}
              <div className="mt-10">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Specifications
                </h2>
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(part.specs).map(([key, value], i) => (
                        <tr
                          key={key}
                          className={i % 2 === 0 ? 'bg-background' : 'bg-card'}
                        >
                          <td className="w-[40%] px-4 py-3 font-medium text-foreground">
                            {key}
                          </td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Machine compatibility ────────────────────────────────── */}
              <div className="mt-10">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Machine Compatibility
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {part.machineTypes.map((mt) => (
                    <div
                      key={mt}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-4 py-3"
                    >
                      <CheckCircle className="h-4 w-4 shrink-0 text-profit" />
                      <span className="text-sm font-medium text-foreground">
                        {MACHINE_TYPE_LABELS[mt]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                  <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Not sure if this part fits your machine? Our parts team can verify compatibility
                  with your specific serial number and configuration.
                </p>
              </div>
            </div>

            {/* ── Right: Inquiry panel ─────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">

                {/* Request quote CTA */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Request a Quote
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    We respond within 2 business hours with pricing, lead time, and shipping options.
                  </p>

                  <div className="mt-5 space-y-2">
                    <AvailabilityIndicator availability={part.availability} />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>Lead time: {part.leadTime}</span>
                    </div>
                  </div>

                  <AddToRequestButton
                    partNumber={part.partNumber}
                    partName={part.name}
                    partCategory={PART_CATEGORY_META[part.category].label}
                    slug={part.slug}
                    className="mt-5 w-full"
                  />
                  <Button asChild variant="outline" className="mt-2 w-full">
                    <Link href="/request">
                      View Request
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="mt-2 w-full">
                    <Link href="tel:+18005551234">
                      <Phone className="h-4 w-4" />
                      Emergency Parts Line
                    </Link>
                  </Button>
                </div>

                {/* Unsure CTA */}
                <div className="rounded-lg border border-border bg-background p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Not sure this is the right part?
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        Send us your machine serial number or a photo of the part you need.
                        Our specialists will confirm the correct reference.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="mt-3 h-7 px-0 text-xs text-primary hover:bg-transparent hover:text-primary/80"
                      >
                        <Link href="/contact">Ask Our Parts Team →</Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Guarantees */}
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Every Order Includes
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      '100% genuine OEM parts',
                      'Full traceability documentation',
                      'Global logistics to 190+ countries',
                      'Certificate of conformity',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-profit" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related parts ─────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="border-b border-border bg-card py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                  Related Parts
                </p>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  More in {categoryMeta.label}
                </h2>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/parts`}>View All Parts</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PartCard key={p.id} part={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
