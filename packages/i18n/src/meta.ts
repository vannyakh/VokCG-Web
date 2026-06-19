export type UiLocale = 'en-US' | 'km-KH'

export const UI_LOCALES: Record<UiLocale, string> = {
  'en-US': 'English',
  'km-KH': 'ខ្មែរ',
}

export const DEFAULT_UI_LOCALE: UiLocale = 'en-US'

export function isUiLocale(value: string): value is UiLocale {
  return value === 'en-US' || value === 'km-KH'
}

export function normalizeUiLocale(value: string | null | undefined): UiLocale {
  if (value && isUiLocale(value)) return value
  return DEFAULT_UI_LOCALE
}
