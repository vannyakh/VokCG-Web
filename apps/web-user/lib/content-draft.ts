/** Shared handoff payload for Create ↔ Script Writer ↔ TTS */
export type ContentDraftSource = 'create' | 'script-writer' | 'tts'

export type ContentDraft = {
  subject: string
  script: string
  terms: string
  language: string
  updatedAt: number
  source?: ContentDraftSource
}

const DRAFT_KEY = 'vokcg-content-draft'

export function loadContentDraft(): ContentDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ContentDraft
    if (!parsed || typeof parsed !== 'object') return null
    return {
      subject: parsed.subject ?? '',
      script: parsed.script ?? '',
      terms: parsed.terms ?? '',
      language: parsed.language ?? '',
      updatedAt: parsed.updatedAt ?? 0,
      source: parsed.source,
    }
  } catch {
    return null
  }
}

export function storeContentDraft(partial: Partial<ContentDraft> & { source?: ContentDraftSource }) {
  const current = loadContentDraft()
  const next: ContentDraft = {
    subject: partial.subject ?? current?.subject ?? '',
    script: partial.script ?? current?.script ?? '',
    terms: partial.terms ?? current?.terms ?? '',
    language: partial.language ?? current?.language ?? '',
    updatedAt: Date.now(),
    source: partial.source ?? current?.source,
  }
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next))
  return next
}

export function clearContentDraft() {
  sessionStorage.removeItem(DRAFT_KEY)
}

export function contentDraftFromCreateContent(content: {
  subject: string
  script: string
  terms: string
  language: string
}): ContentDraft {
  return {
    subject: content.subject,
    script: content.script,
    terms: content.terms,
    language: content.language,
    updatedAt: Date.now(),
    source: 'create',
  }
}
