import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagePlaceholderProps {
  className?: string
  label?: string
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide'
}

export function ImagePlaceholder({
  className,
  label,
  aspectRatio = 'video',
}: ImagePlaceholderProps) {
  const aspectClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[21/9]',
  }[aspectRatio]

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-2.5 overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-900',
        aspectClass,
        className,
      )}
    >
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.10) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Corner accents */}
      <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-blue-500/30" />
      <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-blue-500/30" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-blue-500/30" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-blue-500/30" />
      {/* Icon + label */}
      <ImageIcon className="relative h-7 w-7 text-zinc-600" />
      {label && (
        <span className="relative max-w-[80%] text-center text-xs font-medium text-zinc-500">
          {label}
        </span>
      )}
    </div>
  )
}
