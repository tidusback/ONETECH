import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Settings,
  Wrench,
  Package,
  Award,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImagePlaceholder } from '@/components/marketing/image-placeholder'
import { SectionHeader } from '@/components/marketing/section-header'
import { CtaSection } from '@/components/marketing/cta-section'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Industrial technical services — installation, maintenance, inspection, training, and 24/7 emergency support.',
}

const SERVICES = [
  {
    id: 'installation',
    icon: Settings,
    title: 'Installation & Commissioning',
    summary: 'Certified engineers manage the full installation process — from site preparation through to production-ready sign-off.',
    details: [
      'Factory acceptance testing (FAT) at manufacturer site',
      'Site preparation assessment and utilities verification',
      'Mechanical & electrical installation to OEM specification',
      'Full site acceptance testing (SAT) and commissioning',
      'Operator handover training and documentation package',
      'Post-installation performance monitoring (30 days)',
    ],
  },
  {
    id: 'maintenance',
    icon: Wrench,
    title: 'Preventive Maintenance Programs',
    summary: 'Structured maintenance schedules designed to maximize uptime, catch faults early, and extend equipment lifespan.',
    details: [
      'Customized PM schedules based on OEM recommendations',
      'Quarterly, bi-annual, and annual inspection packages',
      'Lubrication, calibration, and wear-part replacement',
      'Maintenance logbooks and compliance documentation',
      'Priority parts provisioning for PM customers',
      'Dedicated account manager and technician team',
    ],
  },
  {
    id: 'parts',
    icon: Package,
    title: 'Genuine Spare Parts Supply',
    summary: 'OEM-certified replacement parts with global warehousing for rapid dispatch, including same-day emergency fulfillment.',
    details: [
      'Direct OEM sourcing — no aftermarket substitutes',
      'Global inventory across Toronto, Houston, Rotterdam',
      'Same-day emergency dispatch on stocked items',
      'Consignment stock programs for high-value customers',
      'Parts identification support for legacy equipment',
      'Full traceability documentation with every shipment',
    ],
  },
  {
    id: 'training',
    icon: Award,
    title: 'Technical Training & Certification',
    summary: 'Build in-house capability with our structured training curriculum and industry-recognized technician certifications.',
    details: [
      'Three certification levels: Associate, Professional, Master',
      'On-site, in-facility, and online learning options',
      'Equipment-specific hands-on practical assessments',
      'Train-the-trainer programs for larger organizations',
      'Refresher courses and recertification cycles',
      'Industry-recognized credentials, renewed every 3 years',
    ],
  },
  {
    id: 'inspection',
    icon: Shield,
    title: 'Equipment Inspection & Audits',
    summary: 'Independent condition assessments and compliance audits to protect asset value and meet regulatory requirements.',
    details: [
      'Condition-based assessment with detailed written report',
      'Remaining useful life (RUL) estimation',
      'Safety compliance audit against OSHA/CE standards',
      'Thermographic and vibration analysis available',
      'Pre-purchase inspection for second-hand equipment',
      'Insurance and regulatory compliance documentation',
    ],
  },
  {
    id: 'emergency',
    icon: Clock,
    title: '24/7 Emergency Repair',
    summary: 'When critical equipment fails, our emergency response team is available around the clock with a guaranteed 4-hour response.',
    details: [
      '24/7/365 dedicated emergency hotline',
      'Guaranteed 4-hour first-response time (contractual)',
      'Remote diagnostic and troubleshooting capability',
      'Emergency technician dispatch across all service regions',
      'Emergency parts expediting from global stock',
      'Post-incident root cause analysis report',
    ],
  },
]

const PROCESS = [
  {
    step: '01',
    title: 'Assessment',
    description:
      'We evaluate your equipment, site conditions, and operational requirements to scope the right service engagement.',
  },
  {
    step: '02',
    title: 'Proposal',
    description:
      'You receive a detailed written proposal with clear scope, timeline, team qualifications, and fixed pricing.',
  },
  {
    step: '03',
    title: 'Execution',
    description:
      'Our certified technicians carry out the work to OEM specifications with full safety compliance.',
  },
  {
    step: '04',
    title: 'Handover',
    description:
      'We deliver complete documentation, test records, and operator training before formal sign-off.',
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Technical Services
              </p>
              <h1 className="text-5xl font-bold tracking-tight text-foreground">
                Complete Industrial
                <br />
                Service Coverage
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                From first installation through to long-term maintenance, Trivelox
                provides the technical expertise to keep your industrial equipment
                performing at its best — every day, for years.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/contact">
                    Request a Service Quote <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/support">Emergency Support</Link>
                </Button>
              </div>
            </div>
            <ImagePlaceholder label="Field technician — on-site commissioning" aspectRatio="video" />
          </div>
        </div>
      </section>

      {/* ── Services grid ─────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="What We Offer"
            heading="Six Core Service Disciplines"
            description="Our technical services team covers the full lifecycle of industrial equipment — from commissioning to emergency response."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {SERVICES.map(({ id, icon: Icon, title, summary, details }) => (
              <div
                key={id}
                id={id}
                className="rounded-lg border border-border bg-card p-7 transition-colors hover:border-primary/30"
              >
                <div className="mb-5 flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {summary}
                    </p>
                  </div>
                </div>
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/contact">Get a Quote</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="How We Work"
            heading="A Clear, Consistent Process"
            description="Every Trivelox service engagement follows a structured four-stage process so you always know what to expect."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map(({ step, title, description }) => (
              <div key={step} className="rounded-lg border border-border bg-background p-6">
                <p className="mb-4 font-mono text-3xl font-bold text-primary/30">{step}</p>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service contracts ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <SectionHeader
                overline="Service Contracts"
                heading="Annual Service Agreements"
                align="left"
              />
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Our annual service contracts give you predictable costs, priority scheduling,
                and preferential parts pricing — so your maintenance budget stays on track
                and your equipment never sits idle waiting for parts or technicians.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Fixed annual fee — no surprise invoices',
                  'Priority technician scheduling over ad-hoc customers',
                  'Discounted parts pricing (10–20% off list)',
                  'Dedicated account manager and service log',
                  'Annual performance and condition review report',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild>
                  <Link href="/contact">
                    Enquire About a Contract <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <ImagePlaceholder label="Service contract overview" aspectRatio="video" />
          </div>
        </div>
      </section>

      <CtaSection
        overline="Ready to Get Started?"
        heading="Let's Protect Your Equipment Investment"
        description="Talk to our service team about the right coverage for your operation — from a one-off installation to a full multi-year service agreement."
        primaryLabel="Request a Service Quote"
        primaryHref="/contact"
        secondaryLabel="24/7 Emergency Line"
        secondaryHref="/support#emergency"
      />
    </>
  )
}
