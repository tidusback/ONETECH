import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { requireOnboardingIncomplete } from '@/lib/auth/guards'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side guard — proxy.ts catches most cases, but this is the safety net
  await requireOnboardingIncomplete()

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header — no nav links to avoid leaving mid-flow */}
      <div className="flex h-14 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <TrendingUp className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">Trivelox Trading</span>
        </Link>
      </div>

      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
}
