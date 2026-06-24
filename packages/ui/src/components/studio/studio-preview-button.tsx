import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  variant?: 'primary' | 'ghost'
}

/** Disabled CTA for preview / upcoming features */
export function StudioPreviewButton({ children, variant = 'primary' }: Props) {
  return (
    <button
      type="button"
      disabled
      className={[
        'inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3.5 text-[11px] font-bold tracking-wide uppercase opacity-55 border select-none cursor-not-allowed',
        variant === 'primary' 
          ? 'bg-[var(--color-primary)] text-white border-transparent' 
          : 'border-default bg-surface text-muted',
      ].join(' ')}
    >
      <Lock size={10} strokeWidth={2.5} className="opacity-80" />
      {children}
    </button>
  )
}
