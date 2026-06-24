'use client'

import { ScanFace } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useLocale } from '@vokcg/i18n'

import {
  ExploreDisabledButton,
  ExploreFilterChip,
  ExplorePreviewNotice,
  ExploreShell,
} from './components/explore-shell'
import { MOCK_AVATARS, type ExploreAvatar } from './data/mock'

type Style = 'all' | ExploreAvatar['style']

export function AvatarPage() {
  const { t } = useLocale()
  const [style, setStyle] = useState<Style>('all')

  const styles: { id: Style; label: string }[] = [
    { id: 'all', label: t('explore.filters.all') },
    { id: 'professional', label: t('explore.avatar.styles.professional') },
    { id: 'casual', label: t('explore.avatar.styles.casual') },
    { id: 'animated', label: t('explore.avatar.styles.animated') },
  ]

  const items = useMemo(
    () => MOCK_AVATARS.filter((item) => style === 'all' || item.style === style),
    [style],
  )

  return (
    <ExploreShell
      description={t('explore.avatar.description')}
      extra={<ExploreDisabledButton>{t('explore.createAvatar')}</ExploreDisabledButton>}
    >
      <div className="flex flex-col gap-5">
        <ExplorePreviewNotice />

        <div className="flex flex-wrap gap-2">
          {styles.map((item) => (
            <ExploreFilterChip
              key={item.id}
              label={item.label}
              active={style === item.id}
              onClick={() => setStyle(item.id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-divider bg-surface"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="relative aspect-[4/5]" style={{ background: item.gradient }}>
                <div className="absolute inset-0 flex items-end p-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  >
                    <ScanFace size={28} className="text-white/90" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <h2 className="text-[14px] font-semibold text-primary">{item.name}</h2>
                  <p className="mt-0.5 text-[12px] capitalize text-muted">{item.style}</p>
                </div>
                <ExploreDisabledButton variant="ghost">{t('explore.previewTemplate')}</ExploreDisabledButton>
              </div>
            </article>
          ))}
        </div>
      </div>
    </ExploreShell>
  )
}
