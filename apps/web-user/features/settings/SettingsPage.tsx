'use client'

import { KeyRound, Shield, SlidersHorizontal, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocale } from '@vokcg/i18n'
import { SettingsNav, type SettingsNavSection } from './components/settings-nav'
import { SettingsPreferencesTab } from './components/settings-preferences-tab'
import { SettingsProfileTab } from './components/settings-profile-tab'
import { SettingsSecurityTab } from './components/settings-security-tab'
import { SettingsServiceApiTab } from './components/settings-service-api-tab'

export type SettingsTab = 'profile' | 'security' | 'preferences' | 'serviceApi'

export function SettingsPage() {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const navSections: SettingsNavSection[] = useMemo(
    () => [
      {
        title: t('settings.nav.account'),
        items: [
          { id: 'profile', label: t('settings.tabs.profile'), icon: UserRound },
          { id: 'security', label: t('settings.tabs.security'), icon: Shield },
        ],
      },
      {
        title: t('settings.nav.developer'),
        items: [{ id: 'serviceApi', label: t('settings.tabs.serviceApi'), icon: KeyRound }],
      },
      {
        title: t('settings.nav.workspace'),
        items: [{ id: 'preferences', label: t('settings.tabs.preferences'), icon: SlidersHorizontal }],
      },
    ],
    [t],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <SettingsNav sections={navSections} active={activeTab} onChange={(id) => setActiveTab(id as SettingsTab)} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-7 md:py-6">
        {activeTab === 'profile' && <SettingsProfileTab />}
        {activeTab === 'security' && <SettingsSecurityTab />}
        {activeTab === 'preferences' && <SettingsPreferencesTab />}
        {activeTab === 'serviceApi' && <SettingsServiceApiTab />}
      </div>
    </div>
  )
}
