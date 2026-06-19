'use client'

import { Switch } from 'antd'
import { SlidersHorizontal } from 'lucide-react'
import { useLocale } from '@vokcg/i18n'
import { useColorMode } from '@vokcg/ui'
import { LocaleSwitcher } from './locale-switcher'
import { SettingsCard, SettingsCardBody, SettingsCardHeader, SettingsToggleRow } from './settings-card'

export function SettingsPreferencesTab() {
  const { t } = useLocale()
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <div className="max-w-3xl">
      <SettingsCard>
        <SettingsCardHeader
          icon={SlidersHorizontal}
          tone="purple"
          title={t('settings.preferences.cardTitle')}
          subtitle={t('settings.preferences.cardSubtitle')}
        />
        <SettingsCardBody>
          <SettingsToggleRow label={t('settings.uiLanguage')} description={t('settings.uiLanguageHint')}>
            <LocaleSwitcher bordered className="settings-pref-select" />
          </SettingsToggleRow>

          <SettingsToggleRow label={t('settings.darkMode')} description={isDark ? t('settings.darkOn') : t('settings.darkOff')}>
            <Switch checked={isDark} onChange={toggleColorMode} />
          </SettingsToggleRow>
        </SettingsCardBody>
      </SettingsCard>
    </div>
  )
}
