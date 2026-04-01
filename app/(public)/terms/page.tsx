import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Trivelox Trading Inc. terms of use — conditions governing access to and use of our website and services.',
}

export default function TermsPage() {
  return (
    <section className="border-b border-border bg-background py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Use</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: January 2025</p>

        <div className="prose-sm mt-10 space-y-8 text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed">
          <div>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Trivelox Trading Inc. website (the &quot;Site&quot;), you agree
              to be bound by these Terms of Use. If you do not agree to these terms, please do not
              use the Site.
            </p>
          </div>

          <div>
            <h2>2. Use of the Site</h2>
            <p>
              The Site is provided for informational and commercial purposes relating to industrial
              equipment, spare parts, and technical services. You agree to use the Site only for
              lawful purposes and in a manner that does not infringe the rights of others.
            </p>
            <p>
              You must not use the Site to transmit unsolicited communications, introduce malicious
              software, or attempt to gain unauthorized access to any part of the Site or its
              underlying systems.
            </p>
          </div>

          <div>
            <h2>3. Intellectual Property</h2>
            <p>
              All content on the Site — including text, images, logos, and technical descriptions
              — is the property of Trivelox Trading Inc. or its licensors and is protected by
              applicable intellectual property laws. You may not reproduce, distribute, or create
              derivative works without our express written permission.
            </p>
          </div>

          <div>
            <h2>4. Product Information and Pricing</h2>
            <p>
              Product specifications, availability, and pricing displayed on the Site are for
              indicative purposes only and are subject to change without notice. All orders are
              subject to formal written quotation and acceptance by Trivelox Trading Inc.
            </p>
          </div>

          <div>
            <h2>5. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Trivelox Trading Inc. shall not be liable
              for any indirect, incidental, special, or consequential damages arising from your
              use of the Site or reliance on its content. Our total liability in any matter arising
              from use of the Site shall not exceed CAD $100.
            </p>
          </div>

          <div>
            <h2>6. Third-Party Links</h2>
            <p>
              The Site may contain links to third-party websites. These are provided for
              convenience only. Trivelox Trading Inc. has no control over and accepts no
              responsibility for the content of those sites.
            </p>
          </div>

          <div>
            <h2>7. Governing Law</h2>
            <p>
              These Terms of Use are governed by the laws of the Province of Ontario and the
              federal laws of Canada applicable therein. Any disputes shall be subject to the
              exclusive jurisdiction of the courts of Ontario.
            </p>
          </div>

          <div>
            <h2>8. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms of Use at any time. Continued use of the
              Site after changes constitutes your acceptance of the revised terms.
            </p>
          </div>

          <div>
            <h2>9. Contact</h2>
            <p>
              For questions regarding these Terms, contact us at{' '}
              <a href="mailto:legal@trivelox.com" className="text-primary hover:underline">
                legal@trivelox.com
              </a>{' '}
              or Trivelox Trading Inc., 200 Industrial Parkway North, Toronto, ON M9W 5H4, Canada.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
