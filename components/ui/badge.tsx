import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-primary/15 text-primary ring-primary/20',
        secondary:
          'bg-secondary text-secondary-foreground ring-border',
        outline:
          'bg-transparent text-foreground ring-border',
        // Trading status variants
        profit:
          'bg-profit-subtle text-profit ring-profit/20',
        loss:
          'bg-loss-subtle text-loss ring-loss/20',
        warning:
          'bg-warning-subtle text-warning-semantic ring-warning/20',
        neutral:
          'bg-muted text-muted-foreground ring-border',
        destructive:
          'bg-destructive/15 text-destructive ring-destructive/20',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
