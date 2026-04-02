import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import { SwUpdateToast } from '@/components/pwa/sw-update-toast'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor:   '#09090b',
  width:        'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit:  'cover',  // required for iOS safe-area-inset-* to work
}

export const metadata: Metadata = {
  title: {
    default: 'Trivelox Trading Inc.',
    template: '%s | Trivelox Trading',
  },
  description:
    'Trivelox Trading Inc. — Global industrial equipment trading. Premium machinery, genuine spare parts, and certified technical services since 1998.',
  robots: { index: false, follow: false }, // Remove when ready for public indexing
  manifest: '/manifest.webmanifest',
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable:         true,
    statusBarStyle:  'black-translucent',
    title:           'Trivelox',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <SwUpdateToast />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
      </body>
    </html>
  )
}
