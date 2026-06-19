export const SCRIPT_LANGUAGES = [
  '',
  'en-US',
  'zh-CN',
  'zh-TW',
  'zh-HK',
  'de-DE',
  'fr-FR',
  'km-KH',
  'ru-RU',
  'vi-VN',
  'th-TH',
  'tr-TR',
] as const

export type ScriptLanguage = (typeof SCRIPT_LANGUAGES)[number]
