import Link from 'next/link'
import {
  ArrowRight,
  Globe,
  CheckCircle,
  ChevronRight,
  Package,
  Award,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
  Truck,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  Wrench,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImagePlaceholder } from '@/components/marketing/image-placeholder'
import { SectionHeader } from '@/components/marketing/section-header'

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '26+', label: 'Years in Operation', sub: 'Est. 1998' },
  { value: '3,200+', label: 'Machines Installed', sub: 'Globally' },
  { value: '14,000+', label: 'OEM Parts Stocked', sub: 'Ready to ship' },
  { value: '2,800+', label: 'Certified Technicians', sub: 'TXT Program graduates' },
]

const CERTIFICATIONS = [
  'ISO 9001:2015',
  'CE Marked Portfolio',
  'ATEX-Rated Solutions',
  'OEM-Authorized Distributor',
  'OSHA-Compliant Teams',
]

const PRODUCT_CATEGORIES = [
  {
    title: 'Packaging Machinery',
    description: 'Filling, sealing, wrapping, labeling, and case-packing lines for food, pharma, and consumer goods.',
    href: '/products#packaging',
  },
  {
    title: 'Processing Equipment',
    description: 'Mixers, conveyors, reactors, separators, and heat exchangers for manufacturing operations.',
    href: '/products#processing',
  },
  {
    title: 'Material Handling',
    description: 'Forklifts, cranes, stackers, and automated conveyor systems for plant and warehouse floors.',
    href: '/products#handling',
  },
  {
    title: 'Automation Systems',
    description: 'PLC controllers, robotic arms, vision systems, and SCADA for smart manufacturing.',
    href: '/products#automation',
  },
]

const TESTIMONIALS = [
  {
    quote:
      "We've run Trivelox-sourced filling lines for nine years. Parts arrive next day, and their engineers know the machines better than the original manufacturer. I wouldn't source from anyone else.",
    name: 'Stefan V.',
    role: 'Production Director',
    company: 'Delfino Foods B.V.',
    sector: 'Food & Beverage · Netherlands',
  },
  {
    quote:
      'The 4-hour emergency guarantee is real. Our horizontal wrapper failed at 9pm on a Friday. A Trivelox technician was on-site by 6am Saturday and we were back in production by noon.',
    name: 'Maria O.',
    role: 'Maintenance Manager',
    company: 'Praxis Pharma Inc.',
    sector: 'Pharmaceutical · Canada',
  },
  {
    quote:
      'We certified 14 of our own technicians through the TXT program. Reduced external callouts by 60% within six months. The program paid for itself before the year was out.',
    name: 'James K.',
    role: 'VP Operations',
    company: 'Hartwell Consumer Goods',
    sector: 'FMCG · United Kingdom',
  },
]

const SECTORS = [
  'Food & Beverage',
  'Pharmaceutical',
  'Consumer Goods',
  'Chemical Processing',
  'Automotive',
  'Logistics & Distribution',
  'Building Materials',
  'Agriculture',
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Source',
    description:
      'Tell us what you need. Our procurement team sources from 40+ certified OEM manufacturers across Europe, Asia, and the Americas — matched to your spec and budget.',
    cta: null,
  },
  {
    step: '02',
    title: 'Install',
    description:
      'Our engineers manage factory acceptance testing, site preparation, full mechanical and electrical installation, and commissioning — with a signed performance sign-off.',
    cta: null,
  },
  {
    step: '03',
    title: 'Support — Forever',
    description:
      "After handover, we don't disappear. You get parts on demand, a 24/7 emergency line, a maintenance program, and access to the technician certification network.",
    cta: { label: 'View Support Options', href: '/support' },
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO  — Left-aligned, 2-col, conversion-first
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-background">
        {/* Dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.07) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow — top left */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-[480px] w-[480px] rounded-full bg-primary/8 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 lg:pb-28 lg:pt-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left — messaging */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                <Globe className="h-3 w-3" />
                Industrial Equipment Trading · Est. 1998
              </div>

              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
                Buy the Machine.
                <br />
                <span className="text-primary">Keep It Running.</span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Trivelox supplies premium industrial machinery from 40+&nbsp;certified
                OEM manufacturers — and stays with you through installation,
                maintenance, genuine parts, and emergency support for the full
                equipment lifecycle.
              </p>

              {/* Primary CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild className="h-12 px-7 text-base">
                  <Link href="/contact">
                    Request a Quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-7 text-base">
                  <Link href="/products">Explore Products</Link>
                </Button>
              </div>

              {/* Trust micro-pills */}
              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  { icon: Clock, label: '24/7 Emergency Support' },
                  { icon: Truck, label: 'Same-Day Parts Dispatch' },
                  { icon: ShieldCheck, label: '12-Month Warranty' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    <Icon className="h-3 w-3 text-primary" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — hero image */}
            <div className="relative">
              <ImagePlaceholder
                label="Industrial facility — machinery in operation"
                aspectRatio="video"
                className="shadow-2xl shadow-primary/5"
              />
              {/* Floating emergency badge */}
              <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <Phone className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Emergency Hotline
                  </p>
                  <p className="font-mono text-sm font-bold text-foreground">
                    +1 (800) 555-9999
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. STATS + CERTIFICATIONS — Instant credibility
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map(({ value, label, sub }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-bold tracking-tight text-foreground">{value}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Certification strip */}
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4">
            {CERTIFICATIONS.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
              >
                <CheckCircle className="h-3 w-3 shrink-0 text-primary" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. AFTER-SALES COMMITMENT — The differentiator
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="The Trivelox Difference"
            heading="We Don't Disappear After Delivery"
            description="Most equipment traders hand over the keys and move on. We build the after-sales infrastructure before you even place the order."
          />

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Parts */}
            <div className="rounded-xl border border-border bg-card p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
              <p className="font-mono text-3xl font-bold text-foreground">14,000+</p>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                Genuine OEM Parts — In Stock
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Three global warehouses stocked with genuine parts for every machine we
                sell. Same-day dispatch for emergency orders. No aftermarket substitutes.
              </p>
              <Link
                href="/parts"
                className="mt-5 flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                Browse parts catalog <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Support */}
            <div className="rounded-xl border border-border bg-card p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <Clock className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="font-mono text-3xl font-bold text-foreground">4 hrs</p>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                Guaranteed Emergency Response
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Our 24/7 emergency hotline connects you with an on-call engineer in
                minutes. Four-hour response is contractual — not a marketing promise.
              </p>
              <Link
                href="/support#emergency"
                className="mt-5 flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                View support options <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Technicians */}
            <div className="rounded-xl border border-border bg-card p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <Award className="h-6 w-6 text-amber-400" />
              </div>
              <p className="font-mono text-3xl font-bold text-foreground">2,800+</p>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                TXT-Certified Technicians
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Our Technician Certification Program graduates are active in 18 countries.
                Hire a certified tech or build your own in-house team with TXT training.
              </p>
              <Link
                href="/technician-program"
                className="mt-5 flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                Explore the program <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. HOW IT WORKS — Reduce decision friction
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="How It Works"
            heading="Simple from Day One to Year Ten"
            description="A single partner for sourcing, installation, and lifetime support. No hand-offs to third parties. No support gaps."
          />

          <div className="relative mt-14">
            {/* Connector line (desktop only) */}
            <div className="absolute left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] top-8 hidden h-px bg-border lg:block" />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {HOW_IT_WORKS.map(({ step, title, description, cta }) => (
                <div key={step} className="flex flex-col items-start">
                  <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/40 bg-background font-mono text-lg font-bold text-primary">
                    {step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                  {cta && (
                    <Link
                      href={cta.href}
                      className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
                    >
                      {cta.label} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. PRODUCT CATEGORIES — Qualify the buyer
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Product Portfolio"
            heading="500+ Machines Across Four Categories"
            description="Every machine sourced through Trivelox comes with a full technical datasheet, installation package, and parts catalog built in."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_CATEGORIES.map(({ title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group flex flex-col rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <ImagePlaceholder label={title} aspectRatio="video" className="mb-5" />
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                  View Products
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link href="/products">
                Full Product Catalog <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          6. PARTS AVAILABILITY — Convert procurement & maintenance managers
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <ImagePlaceholder
              label="Trivelox global parts warehouse — 14,000+ SKUs"
              aspectRatio="video"
              className="shadow-xl shadow-primary/5"
            />
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Spare Parts
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                The Part You Need.
                <br />
                Shipped Today.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Every machine in our catalog is backed by a live parts inventory. We
                stock 14,000+ genuine OEM SKUs across warehouses in Toronto, Houston,
                and Rotterdam — so a missing bearing doesn't become a three-week shutdown.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Package, value: '14,000+', label: 'Part numbers stocked' },
                  { icon: Zap, value: 'Same day', label: 'Emergency dispatch' },
                  { icon: BarChart3, value: '98.4%', label: 'First-fill rate' },
                  { icon: Truck, value: '3', label: 'Global warehouses' },
                ].map(({ icon: Icon, value, label }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-lg border border-border bg-background p-4"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-mono text-sm font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/contact">
                    Request a Parts Quote <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/parts">Parts Catalog</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          7. SUPPORT ENTRY POINTS — Multiple urgency levels
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Technical Support"
            heading="Support at Every Level of Urgency"
            description="From a quick technical question to a production-critical failure — we have the right channel and the right engineer."
          />

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Emergency — highlighted */}
            <div className="flex flex-col rounded-xl border border-destructive/30 bg-destructive/5 p-6 sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Emergency — 24/7
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-foreground">
                +1 (800) 555-9999
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                Production down? Call now. Guaranteed engineer response in 4 hours,
                any time, any day.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-5 border-destructive/30 hover:bg-destructive/10">
                <a href="tel:+18005559999">Call Emergency Line</a>
              </Button>
            </div>

            {/* Phone */}
            <div className="flex flex-col rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Technical Line
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-foreground">
                +1 (800) 555-1234
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                Commissioning, maintenance, and parts queries. Mon–Fri 07:00–19:00 ET.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-5">
                <a href="tel:+18005551234">Call Support</a>
              </Button>
            </div>

            {/* Email */}
            <div className="flex flex-col rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Email Support
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">
                support@trivelox.com
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                Detailed technical queries. Typical first response within 4 business hours.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-5">
                <a href="mailto:support@trivelox.com">Send Email</a>
              </Button>
            </div>

            {/* Portal */}
            <div className="flex flex-col rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Customer Portal
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">
                Tickets, docs & history
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                Log tickets, track jobs, download manuals and service records.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-5">
                <Link href="/login">Login to Portal</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button variant="ghost" asChild>
              <Link href="/support">
                Full Support Center — SLAs, FAQ, documentation{' '}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          8. TESTIMONIALS + SECTORS — Social proof at decision point
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Customer Proof"
            heading="What Operations Leaders Say"
            description="Trivelox customers share one common experience: the relationship doesn't end at delivery."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, company, sector }) => (
              <figure
                key={name}
                className="flex flex-col rounded-xl border border-border bg-background p-7"
              >
                {/* Stars */}
                <div className="mb-5 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  {/* Avatar placeholder */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {role} · {company}
                    </p>
                    <p className="mt-0.5 text-xs text-primary">{sector}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Industry sectors */}
          <div className="mt-14 border-t border-border pt-10">
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Trusted across industries
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {SECTORS.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          9. TECHNICIAN NETWORK — Two conversion paths in one section
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Technician Network"
            heading="The Largest Certified Industrial Technician Network"
            description="Whether you want to certify your own team or find a qualified technician for hire — the TXT network connects both sides."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Certify your team */}
            <div className="flex flex-col rounded-xl border border-primary/20 bg-primary/5 p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Certify Your Team
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The Trivelox Technician Program (TXT) offers three certification levels —
                Associate, Professional, and Master. On-site, cohort, and online delivery.
                Recognized by 40+ OEM manufacturers worldwide.
              </p>
              <ul className="mt-6 space-y-2.5">
                {[
                  'Reduce external service callouts by up to 60%',
                  'Build institutional knowledge that stays in-house',
                  'Certifications renewed every 3 years',
                  'Financing available for teams of 10+',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/technician-program#register">
                    Apply Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/technician-program">View Curriculum</Link>
                </Button>
              </div>
            </div>

            {/* Find a certified technician */}
            <div className="flex flex-col rounded-xl border border-border bg-card p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Need a Certified Technician?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Our network of 2,800+ TXT-certified technicians is available for
                contract and permanent placements worldwide. Every candidate is
                vetted, background-checked, and verified at their certification level.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  { value: '2,800+', label: 'Active certified techs' },
                  { value: '18', label: 'Countries with coverage' },
                  { value: '3', label: 'Certification levels' },
                  { value: '48 hrs', label: 'Average placement time' },
                ].map(({ value, label }) => (
                  <div key={label} className="rounded-lg border border-border bg-background p-3">
                    <p className="font-mono text-lg font-bold text-foreground">{value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/contact">
                    Request a Technician <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/technician-program">About TXT</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          10. INLINE INQUIRY — Last capture before page exit
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5">
            {/* Left: company brief + trust */}
            <div className="lg:col-span-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                About Trivelox
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                26 Years. 60 Countries. One Point of Contact.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                We work directly with OEM manufacturers to deliver certified machinery at
                competitive prices — then back every sale with parts, service, and
                certified technicians for the full equipment life.
              </p>
              <div className="mt-6 space-y-2.5">
                {[
                  '80+ in-house engineers and technicians',
                  'Offices in Toronto, Houston, Rotterdam',
                  'Contracts from single machines to full lines',
                  'ISO 9001:2015 certified operations',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {f}
                  </div>
                ))}
              </div>
              <Button variant="outline" asChild className="mt-6">
                <Link href="/about">Our Story <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>

            {/* Right: inquiry paths */}
            <div className="flex flex-col gap-4 lg:col-span-3">
              <p className="text-sm font-semibold text-foreground">
                How can we help you today?
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Package,
                    title: 'Equipment Quote',
                    desc: 'Source new machinery from our global network.',
                    href: '/contact',
                    cta: 'Request Quote',
                  },
                  {
                    icon: Truck,
                    title: 'Parts Order',
                    desc: 'Order genuine OEM parts — same-day dispatch available.',
                    href: '/contact',
                    cta: 'Order Parts',
                  },
                  {
                    icon: Wrench,
                    title: 'Service Request',
                    desc: 'Book installation, maintenance, or an inspection.',
                    href: '/contact',
                    cta: 'Book Service',
                  },
                  {
                    icon: Award,
                    title: 'Technician Program',
                    desc: 'Certify your team or find a certified tech for hire.',
                    href: '/technician-program',
                    cta: 'Apply / Hire',
                  },
                ].map(({ icon: Icon, title, desc, href, cta }) => (
                  <Link
                    key={title}
                    href={href}
                    className="group flex items-start gap-4 rounded-lg border border-border bg-background p-5 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                      <p className="mt-2 text-xs font-semibold text-primary">
                        {cta} →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Direct contact strip */}
              <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-background px-5 py-3.5">
                <span className="text-xs text-muted-foreground">Or reach us directly:</span>
                <a
                  href="tel:+18005551234"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  +1 (800) 555-1234
                </a>
                <a
                  href="mailto:info@trivelox.com"
                  className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  info@trivelox.com
                </a>
                <span className="text-xs text-muted-foreground">
                  Typical response: 4 hrs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          11. FINAL CTA — Hard close
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-primary/20 bg-primary/5 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Not sure where to start?
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Let's Talk. We'll Figure It Out Together.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Our industrial specialists respond in under 4 hours. Tell us what you
            need — equipment, parts, service, or technician support — and we'll come back
            with a clear, no-obligation proposal.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/contact">
                Start an Inquiry <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link href="/support">Support Center</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
