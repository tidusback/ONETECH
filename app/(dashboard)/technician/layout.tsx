import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/guards'

export const metadata: Metadata = {
  title: { template: 'Technician — %s | Trivelox', default: 'Technician | Trivelox' },
}

/**
 * Layout guard for all /technician/* routes.
 * requireRole('technician') asserts:
 *   1. User is authenticated (redirects to /login if not)
 *   2. User holds the 'technician' role (redirects to /dashboard if not)
 *
 * Individual pages no longer need their own role checks, though some
 * retain them as an extra layer of defence.
 */
export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole('technician')
  return <>{children}</>
}
