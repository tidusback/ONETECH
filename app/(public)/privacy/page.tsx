import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Trivelox Trading Inc. privacy policy — how we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  return (
    <section className="border-b border-border bg-background py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: January 2025</p>

        <div className="prose-sm mt-10 space-y-8 text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed">
          <div>
            <h2>1. Information We Collect</h2>
            <p>
              Trivelox Trading Inc. collects information you provide directly when submitting
              inquiries, requesting quotes, or registering for the Technician Certification Program.
              This includes contact details (name, email, phone), company information, and the
              nature of your request.
            </p>
            <p>
              We also collect usage data automatically (pages visited, browser type, IP address)
              to improve our website and services.
            </p>
          </div>

          <div>
            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to respond to your inquiries, process parts and
              equipment requests, deliver technical support, and administer the Technician
              Certification Program. We may also send transactional communications relating to
              your orders or service tickets.
            </p>
            <p>
              With your consent, we may send periodic communications about new products, services,
              or industry updates. You may opt out at any time.
            </p>
          </div>

          <div>
            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal information. We may share information
              with service providers who assist us in operating our website or business, subject to
              confidentiality obligations. We may also disclose information as required by law.
            </p>
          </div>

          <div>
            <h2>4. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to fulfill the purposes outlined
              in this policy, comply with legal obligations, and resolve disputes. Customer account
              and transaction data is retained for a minimum of seven years per standard accounting
              requirements.
            </p>
          </div>

          <div>
            <h2>5. Security</h2>
            <p>
              We implement industry-standard technical and organizational measures to protect your
              information against unauthorized access, alteration, disclosure, or destruction.
              However, no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div>
            <h2>6. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have the right to access, correct, or delete
              your personal information. To exercise these rights or for any privacy-related
              queries, please contact us at{' '}
              <a href="mailto:privacy@trivelox.com" className="text-primary hover:underline">
                privacy@trivelox.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this policy periodically. We will notify you of material changes by
              posting the updated policy on this page with a revised date.
            </p>
          </div>

          <div>
            <h2>8. Contact</h2>
            <p>
              Trivelox Trading Inc., 200 Industrial Parkway North, Toronto, ON M9W 5H4, Canada.
              Email:{' '}
              <a href="mailto:privacy@trivelox.com" className="text-primary hover:underline">
                privacy@trivelox.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
