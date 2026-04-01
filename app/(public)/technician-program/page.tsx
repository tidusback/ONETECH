import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, CheckCircle, Users, Globe, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImagePlaceholder } from '@/components/marketing/image-placeholder'
import { SectionHeader } from '@/components/marketing/section-header'
import { TechnicianRegistrationForm } from '@/components/marketing/technician-registration-form'

export const metadata: Metadata = {
  title: 'Technician Program',
  description:
    'The Trivelox Technician Certification Program — three levels of industry-recognized credentials for industrial equipment professionals.',
}

const CERT_LEVELS = [
  {
    level: 'Level 1',
    title: 'Associate Technician',
    audience: 'Entry-level technicians with 0–2 years of hands-on experience.',
    duration: '3 days intensive · or 5-week online',
    topics: [
      'Industrial equipment fundamentals',
      'Safety standards and hazard identification',
      'Basic mechanical & electrical troubleshooting',
      'Lubrication and preventive maintenance principles',
      'Technical documentation and logkeeping',
    ],
    badge: 'TXT-A',
  },
  {
    level: 'Level 2',
    title: 'Professional Technician',
    audience: 'Experienced technicians with 3–7 years, or Level 1 graduates seeking advancement.',
    duration: '5 days intensive · or 8-week online',
    topics: [
      'Advanced fault diagnostics and root cause analysis',
      'PLC and control system interpretation',
      'Pneumatic and hydraulic system service',
      'Change-over and format adjustment procedures',
      'Condition monitoring and predictive maintenance',
      'OEM-specific equipment modules (choose 2)',
    ],
    badge: 'TXT-P',
  },
  {
    level: 'Level 3',
    title: 'Master Technician',
    audience: 'Senior technicians and team leads with 8+ years, or Level 2 graduates.',
    duration: '7 days intensive · or 12-week online',
    topics: [
      'Full commissioning and FAT/SAT procedures',
      'Complex multi-system troubleshooting',
      'SCADA and industrial networking',
      'Reliability-centered maintenance (RCM) planning',
      'Technical team leadership and training delivery',
      'OEM-specific equipment modules (choose 3)',
      'Final practical assessment and oral examination',
    ],
    badge: 'TXT-M',
  },
]

const BENEFITS = [
  {
    icon: Award,
    title: 'Industry-Recognized Credentials',
    description:
      'Trivelox certifications are accepted by 40+ OEM manufacturers and recognized across the industrial sector in North America, Europe, and the Asia-Pacific region.',
  },
  {
    icon: Users,
    title: 'Build In-House Capability',
    description:
      'Certified technicians reduce dependence on external service calls, cut downtime, and build institutional knowledge that stays with your organization.',
  },
  {
    icon: Globe,
    title: 'Flexible Delivery Formats',
    description:
      'Programs are available as on-site intensives at your facility, public cohort courses at our training centers, or structured online learning with live practical assessments.',
  },
  {
    icon: CheckCircle,
    title: 'Renewal & Continuing Education',
    description:
      'Certifications renew every 3 years with a short refresher module. Certified technicians receive access to our ongoing technical webinar library at no additional cost.',
  },
]

const STATS = [
  { value: '2,800+', label: 'Certified Graduates' },
  { value: '3', label: 'Certification Levels' },
  { value: '18', label: 'Countries with Alumni' },
  { value: '40+', label: 'OEMs That Recognize TXT' },
]

export default function TechnicianProgramPage() {
  return (
    <>
      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Trivelox Technician Program
              </p>
              <h1 className="text-5xl font-bold tracking-tight text-foreground">
                Certify Your Team.
                <br />
                Own Your Uptime.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                The Trivelox Technician Certification Program (TXT) is a three-level
                industry credential for industrial equipment professionals. Build in-house
                expertise, reduce service dependency, and demonstrate verified competence.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="#register">
                    Apply Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="#levels">View Curriculum</Link>
                </Button>
              </div>
            </div>
            <ImagePlaceholder
              label="Trivelox training center — hands-on practical lab"
              aspectRatio="video"
            />
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why certify ───────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Why Certify?"
            heading="The Business Case for Trained Technicians"
            description="Organizations with TXT-certified teams report measurable gains in uptime, a reduction in external service spend, and faster fault resolution — validated across 18 countries."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-5 rounded-lg border border-border bg-card p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10">
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

      {/* ── Certification levels ──────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-24" id="levels">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Curriculum"
            heading="Three Levels of Certification"
            description="Each level builds on the last — from foundational safety and maintenance principles through to full commissioning, system integration, and team leadership."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {CERT_LEVELS.map(({ level, title, audience, duration, topics, badge }) => (
              <div
                key={badge}
                className="flex flex-col rounded-lg border border-border bg-background p-7"
              >
                {/* Badge + level */}
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {level}
                  </span>
                  <span className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                    {badge}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{audience}</p>

                <div className="my-4 border-t border-border" />

                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Duration
                </p>
                <p className="text-sm text-foreground">{duration}</p>

                <div className="my-4 border-t border-border" />

                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Topics Covered
                </p>
                <ul className="flex-1 space-y-2">
                  {topics.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                      {t}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="mt-6"
                >
                  <Link href="#register">Apply for {level}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Training formats ──────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            overline="Delivery Options"
            heading="Learn the Way That Works for You"
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                title: 'On-Site at Your Facility',
                description:
                  'We bring the training to you. Ideal for teams of 5+. Uses your own equipment for hands-on practice — maximizing relevance to your operation.',
                note: 'Min. 5 participants',
              },
              {
                title: 'Public Cohort — Training Centers',
                description:
                  'Join a scheduled cohort at our training facilities in Toronto, Houston, or Rotterdam. Network with peers from across the industry.',
                note: 'Cohorts run quarterly',
              },
              {
                title: 'Online + Live Assessment',
                description:
                  'Self-paced online learning followed by a live virtual practical assessment. Best for individuals or geographically distributed teams.',
                note: 'Starts any Monday',
              },
            ].map(({ title, description, note }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-6"
              >
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <p className="mt-4 text-xs font-medium text-primary">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Registration form ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card py-24" id="register">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Left: context */}
            <div>
              <SectionHeader
                overline="Apply Now"
                heading="Start Your Certification Journey"
                align="left"
              />
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Complete the form and a Trivelox training coordinator will contact you
                within 2 business days to confirm your level, discuss scheduling, and
                provide a course fee quote.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Applications reviewed within 2 business days',
                  'Course fees quoted per participant or team',
                  'Financing available for teams of 10+',
                  'Certificates valid for 3 years, renewable',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-lg border border-border bg-background p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Training Enquiries
                </p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  training@trivelox.com
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Mon–Fri 08:00–17:00 ET
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div className="rounded-lg border border-border bg-background p-8">
              <TechnicianRegistrationForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
