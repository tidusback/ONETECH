import Link from 'next/link'
import { Users, Wrench } from 'lucide-react'
import { getUserWithProfile } from '@/lib/auth/utils'

export default async function OnboardingRolePage() {
  const { user } = await getUserWithProfile()
  const name = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="w-full max-w-lg">
      <div className="mb-10 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Welcome, {name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          How will you be using Trivelox?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Customer card */}
        <Link
          href="/onboarding/customer"
          className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-card/80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted transition-colors group-hover:bg-primary/10">
            <Users className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <div>
            <p className="font-medium">Customer</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              I own or operate industrial equipment and need parts and service support.
            </p>
          </div>
        </Link>

        {/* Technician card */}
        <Link
          href="/onboarding/technician"
          className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-card/80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted transition-colors group-hover:bg-primary/10">
            <Wrench className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <div>
            <p className="font-medium">Technician</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              I&apos;m an internal team member — field service, workshop, or technical support.
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
