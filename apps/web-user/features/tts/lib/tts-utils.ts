import type { TtsVoice } from '@/types/tts'
import { loadContentDraft, storeContentDraft } from '../../script/lib/content-draft'

export type VoiceAvatarTone = 'purple' | 'green' | 'teal' | 'coral' | 'blue'

const AVATAR_TONE_CLASSES: Record<VoiceAvatarTone, string> = {
  purple: 'bg-accent-muted text-accent',
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
  coral: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
}

const AVATAR_TONES: VoiceAvatarTone[] = ['purple', 'green', 'teal', 'coral', 'blue']

export function voiceAvatarTone(id: string): VoiceAvatarTone {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length
  return AVATAR_TONES[hash] ?? 'purple'
}

export function voiceAvatarClass(id: string) {
  return AVATAR_TONE_CLASSES[voiceAvatarTone(id)]
}

export function voiceInitials(label: string) {
  const cleaned = label.replace(/Neural|Multilingual|V2/gi, ' ').trim()
  const parts = cleaned.split(/[\s-]+/).filter((part) => part.length > 0 && !/^(male|female)$/i.test(part))
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }
  return cleaned.slice(0, 2).toUpperCase() || 'V'
}

export function voiceDisplayName(label: string) {
  return label
    .replace(/Neural/gi, '')
    .replace(/Multilingual/gi, '')
    .replace(/V2/gi, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function voiceMetaLine(voiceId: string, label: string) {
  const localeMatch = voiceId.match(/^([a-z]{2}(?:-[A-Z]{2})?)/i)
  const locale = localeMatch?.[1]?.toUpperCase() ?? '—'
  const gender = /female/i.test(voiceId) ? 'Female' : /male/i.test(voiceId) ? 'Male' : 'Voice'
  const tone = label.split('·').pop()?.trim() || 'Natural'
  return `${locale} · ${gender} · ${tone}`
}

/** Ant Design Select options — featured voices listed first with a label suffix */
export function voiceSelectOptions(
  voices: TtsVoice[],
  featuredVoiceIds: string[] = [],
  featuredLabel = 'Featured',
) {
  const featuredSet = new Set(featuredVoiceIds)
  const sorted = [...voices].sort((a, b) => {
    const aFeatured = a.featured || featuredSet.has(a.id) ? 1 : 0
    const bFeatured = b.featured || featuredSet.has(b.id) ? 1 : 0
    if (aFeatured !== bFeatured) return bFeatured - aFeatured
    return voiceDisplayName(a.label).localeCompare(voiceDisplayName(b.label))
  })
  return sorted.map((voice) => {
    const name = voiceDisplayName(voice.label) || voice.label
    const isFeatured = voice.featured || featuredSet.has(voice.id)
    return {
      value: voice.id,
      label: isFeatured ? `${name} · ${featuredLabel}` : name,
    }
  })
}

export function estimateSpeechDuration(charCount: number) {
  if (charCount <= 0) return 0
  return Math.max(1, Math.round(charCount / 5.9))
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function filterVoices(voices: TtsVoice[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return voices
  return voices.filter(
    (voice) =>
      voice.label.toLowerCase().includes(q) || voice.id.toLowerCase().includes(q),
  )
}

const RECENT_VOICES_KEY = 'vokcg-recent-voices'
const MAX_RECENT_VOICES = 5
const MAX_FEATURED_VOICES = 6

type RecentVoicesStore = Record<string, string[]>

function loadRecentVoicesStore(): RecentVoicesStore {
  try {
    const raw = localStorage.getItem(RECENT_VOICES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as RecentVoicesStore
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveRecentVoicesStore(store: RecentVoicesStore) {
  localStorage.setItem(RECENT_VOICES_KEY, JSON.stringify(store))
}

/** Remember a voice selection per TTS server for the Featured section */
export function recordRecentVoice(serverId: string, voiceId: string) {
  if (!serverId || !voiceId) return
  const store = loadRecentVoicesStore()
  const current = store[serverId] ?? []
  const next = [voiceId, ...current.filter((id) => id !== voiceId)].slice(0, MAX_RECENT_VOICES)
  store[serverId] = next
  saveRecentVoicesStore(store)
}

export function getRecentVoiceIds(serverId: string): string[] {
  if (!serverId) return []
  return loadRecentVoicesStore()[serverId] ?? []
}

export function partitionVoices(
  voices: TtsVoice[],
  options: {
    defaultVoice?: string
    featuredVoiceIds?: string[]
    recentVoiceIds?: string[]
    maxFeatured?: number
  } = {},
): { featured: TtsVoice[]; rest: TtsVoice[] } {
  const maxFeatured = options.maxFeatured ?? MAX_FEATURED_VOICES
  const byId = new Map(voices.map((voice) => [voice.id, voice]))
  const featured: TtsVoice[] = []
  const seen = new Set<string>()

  const push = (voiceId: string) => {
    if (seen.has(voiceId) || featured.length >= maxFeatured) return
    const voice = byId.get(voiceId)
    if (!voice) return
    seen.add(voiceId)
    featured.push(voice)
  }

  for (const voiceId of options.featuredVoiceIds ?? []) push(voiceId)
  for (const voice of voices) {
    if (voice.featured) push(voice.id)
  }
  for (const voiceId of options.recentVoiceIds ?? []) push(voiceId)
  if (options.defaultVoice) push(options.defaultVoice)

  const rest = voices.filter((voice) => !seen.has(voice.id))
  return { featured, rest }
}

export function buildStylePrompt(emotion: string, style: string, base = '') {
  const parts = [base.trim(), emotion !== 'neutral' ? `${emotion} tone` : '', style !== 'narration' ? `${style} delivery` : '']
    .filter(Boolean)
  return parts.join('. ')
}

export type TtsHistoryEntry = {
  id: string
  name: string
  voiceLabel: string
  charCount: number
  durationSec: number
  createdAt: number
  blobKey: string
}

const HISTORY_KEY = 'vokcg-tts-history'
const BLOB_PREFIX = 'vokcg-tts-blob:'

export function loadTtsHistory(): TtsHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TtsHistoryEntry[]
    return Array.isArray(parsed) ? parsed.slice(0, 12) : []
  } catch {
    return []
  }
}

export function saveTtsHistory(entries: TtsHistoryEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 12)))
}

export function historyBlobKey(id: string) {
  return `${BLOB_PREFIX}${id}`
}

export async function storeHistoryBlob(id: string, blob: Blob) {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!)
  sessionStorage.setItem(historyBlobKey(id), btoa(binary))
}

export function getHistoryBlobUrl(id: string) {
  const encoded = sessionStorage.getItem(historyBlobKey(id))
  if (!encoded) return null
  const binary = atob(encoded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'audio/mpeg' })
  return URL.createObjectURL(blob)
}

export const TTS_DRAFT_KEY = 'vokcg-tts-draft'

export function storeTtsDraft(script: string) {
  sessionStorage.setItem(TTS_DRAFT_KEY, script)
  storeContentDraft({ script, source: 'tts' })
}

export function loadTtsDraft() {
  const draft = loadContentDraft()
  if (draft?.script?.trim()) return draft.script
  return sessionStorage.getItem(TTS_DRAFT_KEY)
}
