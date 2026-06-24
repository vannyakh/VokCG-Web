'use client'

import type { LucideIcon } from 'lucide-react'
import { Info } from 'lucide-react'
import type { ReactNode } from 'react'

type Tone = 'preview' | 'info' | 'warning' | 'readonly'

const TONE_STYLES: Record<Tone, { background: string; border: string; accent: string; color: string }> = {
  preview: {
    background: 'color-mix(in srgb, var(--color-primary) 6%, var(--bg-surface))',
    border: 'color-mix(in srgb, var(--color-primary) 15%, var(--border-default))',
    accent: 'var(--color-primary)',
    color: 'var(--text-primary)',
  },
  info: {
    background: 'color-mix(in srgb, var(--text-muted) 8%, var(--bg-surface))',
    border: 'var(--border-default)',
    accent: 'var(--text-muted)',
    color: 'var(--text-secondary)',
  },
  warning: {
    background: 'color-mix(in srgb, #f59e0b 8%, var(--bg-surface))',
    border: 'color-mix(in srgb, #f59e0b 20%, var(--border-default))',
    accent: '#f59e0b',
    color: 'var(--text-primary)',
  },
  readonly: {
    background: 'color-mix(in srgb, var(--text-muted) 4%, var(--bg-surface))',
    border: 'var(--border-subtle)',
    accent: 'color-mix(in srgb, var(--text-muted) 40%, transparent)',
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
      className="relative flex gap-3.5 rounded-xl border pl-4.5 pr-5 py-3.5 text-[13px] leading-relaxed shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300"
      style={{
        background: styles.background,
        borderColor: styles.border,
        color: styles.color,
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ background: styles.accent }}
      />
      <Icon size={16} className="mt-0.5 shrink-0 opacity-90" style={{ color: styles.accent }} />
      <div className="min-w-0 flex-1 font-medium">{children}</div>
    </div>
  )
}
