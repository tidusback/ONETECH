import type { Metadata } from 'next'
import { SupportFlow } from '@/components/support/support-flow'

export const metadata: Metadata = { title: 'Fix My Machine' }

export default function SupportNewPage() {
  return <SupportFlow />
}
