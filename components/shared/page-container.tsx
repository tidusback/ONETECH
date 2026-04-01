import { cn } from '@/lib/utils'

const sizeMap = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-full',
} as const

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  size?: keyof typeof sizeMap
}

export function PageContainer({
  children,
  className,
  size = 'default',
}: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-6 py-8', sizeMap[size], className)}>
      {children}
    </div>
  )
}
