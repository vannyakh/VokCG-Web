'use client'

import type { LucideIcon } from 'lucide-react'
import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

type Tone = 'preview' | 'info' | 'warning' | 'readonly'

const TONE_STYLES: Record<Tone, { background: string; border: string; color: string }> = {
  preview: {
    background: 'color-mix(in srgb, var(--color-primary) 8%, var(--bg-surface))',
    border: 'color-mix(in srgb, var(--color-primary) 18%, var(--border-divider))',
    color: 'var(--text-secondary)',
  },
  info: {
    background: 'color-mix(in srgb, var(--bg-subtle) 70%, var(--bg-surface))',
    border: 'var(--border-divider)',
    color: 'var(--text-secondary)',
  },
  warning: {
    background: 'color-mix(in srgb, #f59e0b 10%, var(--bg-surface))',
    border: 'color-mix(in srgb, #f59e0b 24%, var(--border-divider))',
    color: 'var(--text-secondary)',
  },
  readonly: {
    background: 'color-mix(in srgb, var(--text-muted) 6%, var(--bg-surface))',
    border: 'var(--border-divider)',
    color: 'var(--text-muted)',
  },
}

type Props = {
  children: ReactNode
  tone?: Tone
  icon?: LucideIcon
}

export function StudioNoticeBanner({ children, tone = 'info', icon: Icon = Info }: Props) {
  const styles = TONE_STYLES[tone]

  return (
    <div
      className="flex gap-3 rounded-xl px-4 py-3 text-[13px] leading-relaxed"
      style={{
        background: styles.background,
        border: `1px solid ${styles.border}`,
        color: styles.color,
      }}
    >
      <Icon size={16} className="mt-0.5 shrink-0 opacity-80" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
