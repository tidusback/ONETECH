import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImagePlaceholder } from '@/components/marketing/image-placeholder'
import { ContactForm } from '@/components/marketing/contact-form'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Trivelox Trading — equipment quotes, technical support, parts orders, and general inquiries.',
}

const OFFICES = [
  {
    city: 'Toronto',
    label: 'Global Headquarters',
    address: '200 Industrial Parkway North\nToronto, ON M9W 5H4\nCanada',
    phone: '+1 (416) 555-0100',
    email: 'toronto@trivelox.com',
    hours: 'Mon–Fri 08:00–18:00 ET',
  },
  {
    city: 'Houston',
    label: 'North American Operations',
    address: '4500 Westway Park Blvd, Suite 300\nHouston, TX 77041\nUnited States',
    phone: '+1 (713) 555-0200',
    email: 'houston@trivelox.com',
    hours: 'Mon–Fri 07:00–17:00 CT',
  },
  {
    city: 'Rotterdam',
    label: 'European Operations',
    address: 'Waalhaven Zuidzijde 21\n3089 JH Rotterdam\nThe Netherlands',
    phone: '+31 10 555 0300',
    email: 'rotterdam@trivelox.com',
    hours: 'Mon–Fri 08:00–17:00 CET',
  },
]

const QUICK_CONTACTS = [
  {
    icon: AlertTriangle,
    label: 'Emergency Hotline',
    value: '+1 (800) 555-9999',
    sub: '24/7 — production-critical support',
    href: 'tel:+18005559999',
    highlight: true,
  },
  {
    icon: Phone,
    label: 'General Line',
    value: '+1 (800) 555-1234',
    sub: 'Mon–Fri 07:00–19:00 ET',
    href: 'tel:+18005551234',
    highlight: false,
  },
  {
    icon: Mail,
    label: 'General Enquiries',
    value: 'info@trivelox.com',
    sub: 'Response within 4 business hours',
    href: 'mailto:info@trivelox.com',
    highlight: false,
  },
  {
    icon: Mail,
    label: 'Technical Support',
    value: 'support@trivelox.com',
    sub: 'Equipment, parts, service issues',
    href: 'mailto:support@trivelox.com',
    highlight: false,
  },
]

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ part?: string; name?: string }>
}) {
  const { part, name } = await searchParams
  return (
    <>
      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Contact Us
            </p>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              Talk to a Trivelox
              <br />
              Specialist.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Whether you're sourcing new equipment, need a parts quote, or want to
              discuss a service contract — our team responds fast and comes prepared.
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick contact channels ────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_CONTACTS.map(({ icon: Icon, label, value, sub, href, highlight }) => (
              <a
                key={label}
                href={href}
                className={`flex flex-col gap-3 rounded-lg border p-5 transition-all hover:shadow-md ${
                  highlight
                    ? 'border-primary/40 bg-primary/5 hover:border-primary/60'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-md ${
                    highlight ? 'bg-primary/20' : 'bg-primary/10'
                  }`}
                >
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact form + sidebar ────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="mb-1.5 text-xl font-semibold text-foreground">
                Send Us a Message
              </h2>
              <p className="mb-8 text-sm text-muted-foreground">
                Fill in the form and a specialist will respond within 4 business hours.
              </p>
              <ContactForm defaultPartNumber={part} defaultPartName={name} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              {/* Response times */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Typical Response Times
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {[
                    { type: 'Equipment quotes', time: 'Same business day' },
                    { type: 'Parts enquiries', time: 'Within 2 hours' },
                    { type: 'Service requests', time: 'Within 4 hours' },
                    { type: 'Emergency support', time: '4-hour guarantee' },
                    { type: 'General enquiries', time: '1 business day' },
                  ].map(({ type, time }) => (
                    <li key={type} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{type}</span>
                      <span className="font-mono text-xs font-semibold text-primary">
                        {time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support portal */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Existing Customer?
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Log into the customer portal to track service jobs, access machine
                  documentation, and manage your parts orders.
                </p>
                <Button variant="outline" size="sm" asChild className="mt-4 w-full">
                  <Link href="/login">Login to Portal</Link>
                </Button>
              </div>

              {/* Technician program */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Interested in Technician Certification?
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  View program details and apply directly via the Technician Program page.
                </p>
                <Button size="sm" asChild className="mt-4 w-full">
                  <Link href="/technician-program">View Program</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Office locations ──────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Our Offices
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Three Continents. One Team.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {OFFICES.map(({ city, label, address, phone, email, hours }) => (
              <div
                key={city}
                className="rounded-lg border border-border bg-background p-6"
              >
                <ImagePlaceholder
                  label={`${city} office`}
                  aspectRatio="video"
                  className="mb-5"
                />
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {label}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">{city}</h3>
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="whitespace-pre-line">{address}</span>
                  </div>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {phone}
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {email}
                  </a>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {hours}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map placeholder */}
          <div className="mt-8">
            <ImagePlaceholder
              label="Global office map — Toronto · Houston · Rotterdam"
              aspectRatio="wide"
              className="w-full"
            />
          </div>
        </div>
      </section>
    </>
  )
}
