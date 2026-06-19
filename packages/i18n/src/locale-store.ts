import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@vokcg/config'

import { DEFAULT_UI_LOCALE, normalizeUiLocale, type UiLocale } from './meta'

type LocaleState = {
  uiLocale: UiLocale
  setUiLocale: (locale: UiLocale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      uiLocale: DEFAULT_UI_LOCALE,
      setUiLocale: (uiLocale) => set({ uiLocale }),
    }),
    {
      name: STORAGE_KEYS.locale,
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<LocaleState>),
        uiLocale: normalizeUiLocale(
          (persisted as Partial<LocaleState> | undefined)?.uiLocale,
        ),
      }),
    },
  ),
)
