import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/guards'

export const metadata: Metadata = {
  title: { template: 'Admin — %s | Trivelox', default: 'Admin | Trivelox' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('admin')
  return <>{children}</>
}
