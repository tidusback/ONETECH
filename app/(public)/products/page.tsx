import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImagePlaceholder } from '@/components/marketing/image-placeholder'
import { CtaSection } from '@/components/marketing/cta-section'

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Industrial equipment catalog — packaging machinery, processing equipment, material handling, and automation systems.',
}

const CATEGORIES = [
  {
    id: 'packaging',
    label: 'Packaging Machinery',
    description:
      'Complete packaging line solutions for food, pharmaceutical, and consumer goods manufacturers.',
    products: [
      {
        name: 'Rotary Filling Machines',
        spec: 'Up to 120 CPM · 4–32 filling heads',
        application: 'Liquid & viscous products',
      },
      {
        name: 'Horizontal Flow Wrappers',
        spec: 'Up to 800 packs/min · servo-driven',
        application: 'Bakery, confectionery',
      },
      {
        name: 'Vertical Form-Fill-Seal',
        spec: '10–5,000 g range · multi-format',
        application: 'Powders, granules, snacks',
      },
      {
        name: 'Shrink Wrapping Systems',
        spec: 'Multi-pack, tray + film, heat tunnel',
        application: 'Beverage, canned goods',
      },
      {
        name: 'Labeling & Print-Apply',
        spec: 'All container types · GS1 compliant',
        application: 'Compliance & brand labeling',
      },
      {
        name: 'Case Packers & Sealers',
        spec: 'RSC, wrap-around, tray styles',
        application: 'Distribution-ready cases',
      },
    ],
  },
  {
    id: 'processing',
    label: 'Processing Equipment',
    description:
      'Industrial processing systems for manufacturing, food, and chemical production environments.',
    products: [
      {
        name: 'Industrial Mixers',
        spec: 'Ribbon, paddle, high-shear types',
        application: 'Food, pharma, chemicals',
      },
      {
        name: 'Belt Conveyors',
        spec: 'Modular · up to 50 m length',
        application: 'General material transport',
      },
      {
        name: 'Screw Conveyors',
        spec: 'Enclosed, inclined, tubular variants',
        application: 'Bulk powder handling',
      },
      {
        name: 'Pasteurizers & Sterilizers',
        spec: 'Plate, tubular, batch options',
        application: 'Food & beverage processing',
      },
      {
        name: 'Centrifugal Separators',
        spec: 'Liquid-liquid & solid-liquid',
        application: 'Dairy, chemical industries',
      },
      {
        name: 'Heat Exchangers',
        spec: 'Shell & tube, gasketed plate',
        application: 'Thermal process control',
      },
    ],
  },
  {
    id: 'handling',
    label: 'Material Handling',
    description:
      'Safe, efficient material movement solutions for warehouse operations and plant floor logistics.',
    products: [
      {
        name: 'Counterbalance Forklifts',
        spec: '1.5–16 tonne capacity · diesel/electric',
        application: 'Warehouse & yard operations',
      },
      {
        name: 'Reach Trucks',
        spec: 'Up to 12 m lift height',
        application: 'High-racking warehouses',
      },
      {
        name: 'Overhead Bridge Cranes',
        spec: 'Single & double girder · 1–100 t',
        application: 'Heavy manufacturing',
      },
      {
        name: 'Pallet Stackers',
        spec: 'Manual, semi, fully electric',
        application: 'Storage & retrieval',
      },
      {
        name: 'Automated Guided Vehicles',
        spec: 'Laser + magnetic guidance',
        application: 'Smart warehouses',
      },
      {
        name: 'Loading Dock Equipment',
        spec: 'Levelers, seals, dock shelters',
        application: 'Logistics facilities',
      },
    ],
  },
  {
    id: 'automation',
    label: 'Automation Systems',
    description:
      'Smart manufacturing technology for higher throughput, lower error rates, and real-time plant visibility.',
    products: [
      {
        name: 'PLC Control Systems',
        spec: 'Siemens, Allen-Bradley, Mitsubishi',
        application: 'Process automation',
      },
      {
        name: 'Industrial Robotic Arms',
        spec: '6-axis, collaborative, SCARA',
        application: 'Assembly, pick-and-place',
      },
      {
        name: 'Machine Vision Systems',
        spec: 'Inline inspection & QC cameras',
        application: 'Quality assurance',
      },
      {
        name: 'SCADA Software & HMI',
        spec: 'Real-time monitoring & control',
        application: 'Plant-wide integration',
      },
      {
        name: 'Variable Frequency Drives',
        spec: '0.4 kW – 500 kW range',
        application: 'Motor control & energy savings',
      },
      {
        name: 'Sensors & Instrumentation',
        spec: 'Pressure, flow, temperature, level',
        application: 'Process measurement',
      },
    ],
  },
]

export default function ProductsPage() {
  return (
    <>
      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Product Catalog
              </p>
              <h1 className="text-5xl font-bold tracking-tight text-foreground">
                Industrial Equipment
                <br />
                at Global Scale
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Browse our catalog of 500+ industrial machines across four core categories.
                All equipment is sourced directly from certified OEM manufacturers and
                backed by our technical warranty program.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/contact">Request a Quote</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/parts">Spare Parts</Link>
                </Button>
              </div>
            </div>
            <ImagePlaceholder label="Equipment catalog overview" aspectRatio="video" />
          </div>
        </div>
      </section>

      {/* ── Category nav anchors ──────────────────────────────────────────── */}
      <nav
        className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-md"
        aria-label="Product categories"
      >
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 py-3">
          {CATEGORIES.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="shrink-0 rounded-md px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Category sections ─────────────────────────────────────────────── */}
      {CATEGORIES.map(({ id, label, description, products }, ci) => (
        <section
          key={id}
          id={id}
          className={`border-b border-border py-20 ${ci % 2 === 0 ? 'bg-background' : 'bg-card'}`}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                  Category
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {label}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link href="/contact">Quote This Category</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(({ name, spec, application }) => (
                <div
                  key={name}
                  className="rounded-lg border border-border bg-background p-5 transition-colors hover:border-primary/30"
                >
                  <ImagePlaceholder label={name} aspectRatio="video" className="mb-4" />
                  <h3 className="text-sm font-semibold text-foreground">{name}</h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{spec}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">Application:</span>{' '}
                    {application}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="mt-3 h-7 px-0 text-xs text-primary hover:bg-transparent hover:text-primary/80"
                  >
                    <Link href="/contact">
                      Get a Quote <ChevronRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <CtaSection
        overline="Can't Find What You Need?"
        heading="We Source Custom Equipment"
        description="Our global procurement team can locate any industrial machine from our certified manufacturer network. Submit your specifications and we'll get back within 24 hours."
        primaryLabel="Submit Your Requirements"
        primaryHref="/contact"
        secondaryLabel="Talk to a Specialist"
        secondaryHref="/support"
      />
    </>
  )
}
