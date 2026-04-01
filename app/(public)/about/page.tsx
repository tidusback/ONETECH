import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImagePlaceholder } from '@/components/marketing/image-placeholder'
import { SectionHeader } from '@/components/marketing/section-header'
import { CtaSection } from '@/components/marketing/cta-section'

export const metadata: Metadata = {
  title: 'About',
  description:
    'The story behind Trivelox Trading — 26 years of industrial equipment expertise.',
}

const MILESTONES = [
  { year: '1998', event: 'Founded in Toronto, ON as a regional industrial equipment broker.' },
  { year: '2003', event: 'Expanded into the US market with a dedicated office in Houston, TX.' },
  { year: '2009', event: 'Achieved ISO 9001 certification and launched the spare parts division.' },
  { year: '2014', event: 'Opened Rotterdam office; began serving European and global markets.' },
  { year: '2019', event: 'Launched the Trivelox Technician Certification Program (3 tiers).' },
  { year: '2023', event: 'Surpassed 3,000 machine installations across 60+ countries.' },
]

const VALUES = [
  {
    title: 'Engineering Integrity',
    description:
      "Every machine we supply meets our internal technical standards before delivery. We never source equipment we wouldn't stake our reputation on.",
  },
  {
    title: 'Long-Term Partnership',
    description:
      'We measure success by your uptime, not invoice count. Our team stays engaged throughout the equipment lifecycle — from commissioning to decommissioning.',
  },
  {
    title: 'Global Expertise, Local Service',
    description:
      'With offices in Toronto, Houston, and Rotterdam and field technicians on three continents, we deliver world-class machinery with on-the-ground support.',
  },
  {
    title: 'Transparent Pricing',
    description:
      'No hidden costs. Every quotation includes full breakdowns of parts, labor, logistics, and commissioning so you can plan and budget with confidence.',
  },
]

const CERTIFICATIONS = [
  { label: 'ISO 9001:2015', sub: 'Quality Management System' },
  { label: 'CE Conformity', sub: 'European Equipment Standards' },
  { label: 'ATEX Directive', sub: 'Hazardous Environment Equipment' },
  { label: 'OSHA Compliance', sub: 'North American Safety Standards' },
  { label: 'OEM Authorized', sub: 'Multi-Manufacturer Distributor' },
  { label: 'UL Listed', sub: 'Electrical Safety Certification' },
]

const TEAM = [
  { name: 'Marcus Reinhardt', role: 'Chief Executive Officer', since: 'With Trivelox since 2001' },
  { name: 'Sandra Osei', role: 'VP, Technical Operations', since: 'With Trivelox since 2008' },
  { name: 'Yuki Tanaka', role: 'Head of Global Procurement', since: 'With Trivelox since 2012' },
  { name: 'David Kowalski', role: 'Director, European Operations', since: 'With Trivelox since 2014' },
]

export default function AboutPage() {
  return (
    <>
      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              About Trivelox
            </p>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              Built on Engineering.
              <br />
              Grounded in Trust.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Since 1998, Trivelox Trading has supplied industrial machinery and technical
              services to manufacturers across six continents. We're not just traders —
              we're technical partners for the long haul.
            </p>
          </div>
        </div>
      </section>

      {/* ── Key stats ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: '26+', label: 'Years of Operation' },
              { value: '80+', label: 'In-House Engineers' },
              { value: '3,200+', label: 'Installations Completed' },
              { value: '60+', label: 'Countries Served' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-bold text-foreground">{value}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Company story ─────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <ImagePlaceholder
              label="Trivelox headquarters — Toronto, ON"
              aspectRatio="video"
            />
            <div>
              <SectionHeader
                overline="Our Story"
                heading="From Regional Broker to Global Partner"
                align="left"
              />
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Trivelox Trading was founded in 1998 by a team of industrial engineers who
                  identified a critical gap: manufacturers struggled to source quality
                  equipment internationally, and no single partner could provide both the
                  machinery and the technical support to back it.
                </p>
                <p>
                  We changed that model from day one — pairing every equipment sale with
                  qualified installation and ongoing maintenance. As we expanded into US and
                  European markets, that philosophy scaled with us.
                </p>
                <p>
                  Today, our 80-person team operates from offices in Toronto, Houston, and
                  Rotterdam, with field technicians deployed across North America, Europe,
                  Southeast Asia, and the Middle East.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild>
                  <Link href="/contact">Speak to Our Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Our Values"
            heading="What Drives Every Decision"
            description="These principles shape every sourcing choice, every installation, and every customer conversation."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {VALUES.map(({ title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-lg border border-border bg-background p-6"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
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

      {/* ── Timeline ──────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-24" id="history">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader overline="Our Journey" heading="26 Years of Steady Growth" />
          <div className="mx-auto mt-12 max-w-2xl">
            {MILESTONES.map(({ year, event }, i) => (
              <div key={year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-bold text-primary">
                    &apos;{year.slice(2)}
                  </div>
                  {i < MILESTONES.length - 1 && (
                    <div className="mt-2 w-px flex-1 bg-border" style={{ minHeight: '2.5rem' }} />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-xs font-semibold text-primary">{year}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications ────────────────────────────────────────────────── */}
      <section
        className="border-b border-border bg-card py-24"
        id="certifications"
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Credentials"
            heading="Certified. Compliant. Trusted."
            description="Our operations and product portfolio comply with international quality, safety, and environmental standards."
          />
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CERTIFICATIONS.map(({ label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-lg border border-border bg-background p-5 text-center"
              >
                <Award className="mb-3 h-6 w-6 text-primary" />
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leadership team ───────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-24" id="team">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Leadership"
            heading="The Team Behind Trivelox"
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map(({ name, role, since }) => (
              <div
                key={name}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <ImagePlaceholder label={name} aspectRatio="square" />
                <div className="p-4">
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="mt-0.5 text-xs font-medium text-primary">{role}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">{since}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        overline="Work With Us"
        heading="Ready to Partner with Trivelox?"
        description="Whether you need a single machine or a complete production line, our team is ready to find the right solution for your operation."
        primaryLabel="Contact Our Team"
        primaryHref="/contact"
        secondaryLabel="View Products"
        secondaryHref="/products"
      />
    </>
  )
}
