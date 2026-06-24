'use client'

import type { ReactNode } from 'react'

import { useLocale } from '@vokcg/i18n'
import { StudioListShell, StudioNoticeBanner, StudioPreviewButton } from '@vokcg/ui'

type ExploreShellProps = {
  description: string
  extra?: ReactNode
  children: ReactNode
}

export function ExploreShell({ description, extra, children }: ExploreShellProps) {
  const { t } = useLocale()

  return (
    <StudioListShell
      description={description}
      badge={t('explore.previewBadge')}
      extra={extra}
    >
      {children}
    </StudioListShell>
  )
}

export function ExplorePreviewNotice() {
  const { t } = useLocale()
  return <StudioNoticeBanner tone="preview">{t('explore.previewNotice')}</StudioNoticeBanner>
}

export { StudioFilterChip as ExploreFilterChip } from '@vokcg/ui'
export { StudioPreviewButton as ExploreDisabledButton } from '@vokcg/ui'
