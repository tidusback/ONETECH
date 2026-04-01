import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, Globe, AlertTriangle, CheckCircle, ArrowRight, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/marketing/section-header'
import { CtaSection } from '@/components/marketing/cta-section'

export const metadata: Metadata = {
  title: 'Support',
  description:
    'Trivelox technical support — 24/7 emergency hotline, service requests, documentation, and FAQ.',
}

const SUPPORT_CHANNELS = [
  {
    icon: AlertTriangle,
    label: 'Emergency Hotline',
    value: '+1 (800) 555-9999',
    description: '24/7/365 for production-critical failures. Guaranteed 4-hour response.',
    cta: 'Call Now',
    href: 'tel:+18005559999',
    highlight: true,
  },
  {
    icon: Phone,
    label: 'General Technical Line',
    value: '+1 (800) 555-1234',
    description: 'Mon–Fri 07:00–19:00 ET for commissioning, maintenance, and parts queries.',
    cta: 'Call Support',
    href: 'tel:+18005551234',
    highlight: false,
  },
  {
    icon: Mail,
    label: 'Email Support',
    value: 'support@trivelox.com',
    description: 'Detailed technical queries. Typical response within 4 business hours.',
    cta: 'Send Email',
    href: 'mailto:support@trivelox.com',
    highlight: false,
  },
  {
    icon: Globe,
    label: 'Customer Portal',
    value: 'portal.trivelox.com',
    description: 'Log tickets, track service jobs, access documentation, and manage assets.',
    cta: 'Login to Portal',
    href: '/login',
    highlight: false,
  },
]

const SLAS = [
  { tier: 'Critical — Production Stopped', response: '4 hours', resolution: '24 hours' },
  { tier: 'High — Reduced Capacity', response: '8 hours', resolution: '48 hours' },
  { tier: 'Medium — Non-critical Fault', response: '1 business day', resolution: '5 business days' },
  { tier: 'Low — Advice / Documentation', response: '2 business days', resolution: '10 business days' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'How do I raise an emergency support request?',
    a: 'Call our 24/7 emergency hotline at +1 (800) 555-9999. You will be connected to an on-call engineer within minutes. For non-emergency issues, submit a ticket via the customer portal or email support@trivelox.com.',
  },
  {
    q: 'What information should I have ready when calling for support?',
    a: 'Please have your machine serial number, a brief description of the fault, any error codes displayed, and your site contact name and address. This allows our engineer to diagnose quickly and prepare the right parts or tooling.',
  },
  {
    q: 'Are your technicians qualified to work on our specific machine brand?',
    a: 'Our team holds OEM-level training certifications from over 40 manufacturers. When you call, we confirm the equipment brand and assign the most qualified available technician.',
  },
  {
    q: 'How quickly can you dispatch a spare part?',
    a: 'Stocked items dispatch same business day if ordered before 15:00 local time. Emergency courier dispatch is available 24/7. Special-order items typically have a 3–10 day lead time depending on the manufacturer.',
  },
  {
    q: 'Do you provide remote diagnostic support?',
    a: 'Yes. Our technical team can connect remotely to PLC and SCADA systems (with your permission) to diagnose faults and in many cases resolve them without a site visit. Remote sessions are available same-day.',
  },
  {
    q: 'What is covered under the Trivelox warranty?',
    a: 'All equipment supplied by Trivelox carries a minimum 12-month parts-and-labor warranty from commissioning date. Extended warranty programs of up to 5 years are available as part of a service contract.',
  },
  {
    q: 'Can I access machine documentation and manuals through the portal?',
    a: 'Yes. Every machine commissioned by Trivelox is registered in the customer portal with a full document library: OEM manuals, electrical schematics, commissioning records, and service history.',
  },
  {
    q: 'How do I enroll in the Trivelox Technician Program?',
    a: 'Visit the Technician Program page and complete the registration form. Our training coordinator will contact you within 2 business days to discuss course options, schedules, and pricing.',
  },
]

const RESOURCES = [
  { icon: FileText, title: 'Equipment Manuals', description: 'Access OEM documentation for all Trivelox-supplied equipment via the customer portal.' },
  { icon: FileText, title: 'Commissioning Reports', description: 'Download your site acceptance test (SAT) records and commissioning certificates.' },
  { icon: FileText, title: 'Maintenance Checklists', description: 'Printable PM checklists aligned to OEM service intervals for all major equipment types.' },
  { icon: FileText, title: 'Parts Cross-Reference', description: 'Identify equivalent part numbers across brands using our cross-reference database.' },
]

export default function SupportPage() {
  return (
    <>
      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-20" id="top">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Support Center
            </p>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              We're Here When
              <br />
              It Matters Most.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              From routine technical questions to production-critical emergencies, the
              Trivelox support team is available around the clock. Choose your preferred
              channel below.
            </p>
          </div>
        </div>
      </section>

      {/* ── Support channels ──────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_CHANNELS.map(({ icon: Icon, label, value, description, cta, href, highlight }) => (
              <div
                key={label}
                className={`flex flex-col rounded-lg border p-6 ${
                  highlight
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md ${highlight ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <Icon className={`h-5 w-5 ${highlight ? 'text-primary' : 'text-primary'}`} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <Button
                  size="sm"
                  variant={highlight ? 'default' : 'outline'}
                  asChild
                  className="mt-5"
                >
                  <Link href={href}>{cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SLA table ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-24" id="sla">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Response Times"
            heading="Our Service Level Commitments"
            description="All contracted customers receive guaranteed response and resolution times based on fault severity classification."
          />
          <div className="mt-10 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Priority
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    First Response
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Target Resolution
                  </th>
                </tr>
              </thead>
              <tbody>
                {SLAS.map(({ tier, response, resolution }, i) => (
                  <tr
                    key={tier}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-background/30'}`}
                  >
                    <td className="px-5 py-4 font-medium text-foreground">{tier}</td>
                    <td className="px-5 py-4 font-mono text-primary">{response}</td>
                    <td className="px-5 py-4 text-muted-foreground">{resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            * SLA commitments apply to customers with an active service contract. Ad-hoc
            customers receive best-effort response.
          </p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-24" id="faq">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="FAQ"
            heading="Frequently Asked Questions"
            description="Answers to the most common support, parts, and service questions."
          />
          <div className="mx-auto mt-12 max-w-3xl divide-y divide-border">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-semibold text-foreground">
                  {q}
                  <span className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Resources ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Self-Service"
            heading="Documentation & Resources"
            description="Access technical documentation, maintenance records, and reference materials through the customer portal."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {RESOURCES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col rounded-lg border border-border bg-background p-6"
              >
                <Icon className="mb-4 h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <Button variant="ghost" size="sm" asChild className="mt-4 justify-start px-0 text-xs text-primary hover:bg-transparent hover:text-primary/80">
                  <Link href="/login">Access Portal →</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Emergency CTA ─────────────────────────────────────────────────── */}
      <section
        className="border-b border-border bg-background py-16"
        id="emergency"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-6 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center sm:p-12 lg:flex-row lg:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground">
                Production Down? Call Our Emergency Line Now.
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                24/7 availability &middot; Guaranteed 4-hour response &middot; On-call engineers in all service regions
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="tel:+18005559999">
                <Phone className="h-4 w-4" />
                +1 (800) 555-9999
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaSection
        overline="Need Help?"
        heading="Open a Support Request"
        description="For non-emergency technical questions, submit a support request and our team will respond within 4 business hours."
        primaryLabel="Submit a Request"
        primaryHref="/contact"
        secondaryLabel="Login to Portal"
        secondaryHref="/login"
      />
    </>
  )
}
