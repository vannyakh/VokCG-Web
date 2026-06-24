'use client'

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
        'inline-flex h-9 items-center justify-center rounded-full px-4 text-[12px] font-semibold opacity-60',
        variant === 'primary' ? 'bg-accent text-white' : 'border border-default bg-surface text-secondary',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
