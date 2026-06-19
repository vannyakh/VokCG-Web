import type { Messages } from './en-US'

export type TranslateParams = Record<string, string | number>

export function translate(
  messages: Messages,
  key: string,
  params?: TranslateParams,
): string {
  const parts = key.split('.')
  let node: unknown = messages

  for (const part of parts) {
    if (node && typeof node === 'object' && part in node) {
      node = (node as Record<string, unknown>)[part]
    } else {
      return key
    }
  }

  if (typeof node !== 'string') return key
  if (!params) return node

  return node.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{{${name}}}`,
  )
}
