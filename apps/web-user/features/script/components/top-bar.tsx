'use client'

import { Button } from 'antd'
import { Clock, Copy, Sparkles } from 'lucide-react'

export type WorkspaceTab = 'generate' | 'edit' | 'versions' | 'tts'

interface TopBarProps {
  t: (key: string, params?: Record<string, string | number>) => string
  tab: WorkspaceTab
  versionsCount: number
  readMinutes: number
  credits: number
  onTabChange: (tab: WorkspaceTab) => void
  onCopyAll: () => void
  copyDisabled: boolean
}

export function TopBar({
  t,
  tab,
  versionsCount,
  readMinutes,
  credits,
  onTabChange,
  onCopyAll,
  copyDisabled,
}: TopBarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-0 border-b border-default bg-surface px-4">
      {(['generate', 'edit', 'versions', 'tts'] as WorkspaceTab[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onTabChange(item)}
          className={[
            'flex h-12 items-center border-b-2 px-3.5 text-[13px] transition-colors',
            tab === item ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-secondary',
          ].join(' ')}
        >
          {item === 'versions' ? `${t('scriptWriter.tab.versions')} (${versionsCount})` : t(`scriptWriter.tab.${item}`)}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1 rounded-lg border border-default px-2.5 py-1 text-xs text-secondary sm:inline-flex">
          <Clock size={13} />
          {readMinutes > 0 ? `~${readMinutes}` : '—'} {t('scriptWriter.minRead')}
        </span>
        <span className="hidden items-center gap-1 rounded-lg border border-default px-2.5 py-1 text-xs text-secondary sm:inline-flex">
          <Sparkles size={13} />
          {credits} {t('scriptWriter.credits')}
        </span>
        <Button size="small" icon={<Copy size={13} />} onClick={onCopyAll} disabled={copyDisabled}>
          {t('scriptWriter.copyAll')}
        </Button>
      </div>
    </div>
  )
}
