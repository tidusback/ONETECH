import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('hidden md:block border-t border-border px-6 py-3', className)}>
      <p className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Trivelox Trading Inc. All rights reserved.
      </p>
    </footer>
  )
}
