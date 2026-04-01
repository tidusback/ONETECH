import Link from 'next/link'
import { Wrench } from 'lucide-react'
import { redirectIfAuthenticated } from '@/lib/auth/guards'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await redirectIfAuthenticated()

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top logo bar */}
      <div className="flex h-14 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">Trivelox</span>
        </Link>
      </div>

      {/* Centered form area */}
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
}
