'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Input, Select, Slider } from 'antd'
import Link from 'next/link'
import {
  BarChart3,
  Clock,
  FileText,
  Languages,
  Pause,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Volume2,
} from 'lucide-react'
import { useLocale } from '@vokcg/i18n'
import { useTtsServers, useTtsVoices, useVoicePreview } from '@/api'
import { useVideoStore } from '@/store'
import { USER_ROUTES } from '@vokcg/constants'
import {
  isMimoTtsServer,
  isTtsServerAvailable,
  NO_VOICE_ID,
  TTS_SERVERS_FALLBACK,
} from '@/types/tts'
import { useAppMessage } from '@vokcg/ui'
import { TtsExportPanel } from './tts-export-panel'
import { TtsPreviewCard } from './tts-preview-card'
import {
  buildStylePrompt,
  estimateSpeechDuration,
  formatDuration,
  getHistoryBlobUrl,
  loadTtsDraft,
  loadTtsHistory,
  saveTtsHistory,
  storeHistoryBlob,
  type TtsHistoryEntry,
  voiceDisplayName,
  voiceSelectOptions,
} from '../lib/tts-utils'

type WorkspaceTab = 'script' | 'batch' | 'history'
type ExportFormat = 'mp3' | 'wav' | 'ogg' | 'srt'

const DEFAULT_SCRIPT =
  "Welcome to VokCG Studio — the fastest way to turn your ideas into polished videos. Whether you're creating product demos, social content, or training materials, our AI does the heavy lifting so you can focus on what matters most."

const SSML_TAGS = [
  { label: '<break>', insert: '<break time="500ms"/>' },
  { label: '<prosody pitch>', insert: '<prosody pitch="+10%">', close: '</prosody>' },
  { label: '<prosody rate>', insert: '<prosody rate="slow">', close: '</prosody>' },
  { label: '<emphasis>', insert: '<emphasis level="strong">', close: '</emphasis>' },
  { label: '<lang>', insert: '<lang xml:lang="en-US">', close: '</lang>' },
  { label: '<say-as>', insert: '<say-as interpret-as="characters">', close: '</say-as>' },
]

const EMOTIONS = ['neutral', 'cheerful', 'serious', 'empathetic', 'excited'] as const
const STYLES = ['narration', 'conversational', 'news', 'customer service'] as const

export function TtsWorkspace() {
  const { t } = useLocale()
  const message = useAppMessage()
  const locale = useVideoStore((s) => s.locale)
  const scriptRef = useRef<HTMLTextAreaElement>(null)

  const [tab, setTab] = useState<WorkspaceTab>('script')
  const [ttsServer, setTtsServer] = useState('azure-tts-v1')
  const [voiceName, setVoiceName] = useState('')
  const [text, setText] = useState(DEFAULT_SCRIPT)
  const [speedPct, setSpeedPct] = useState(100)
  const [volumePct, setVolumePct] = useState(90)
  const [pitch, setPitch] = useState(0)
  const [emotion, setEmotion] = useState<(typeof EMOTIONS)[number]>('neutral')
  const [style, setStyle] = useState<(typeof STYLES)[number]>('narration')
  const [pauseMs, setPauseMs] = useState(300)
  const [stylePrompt, setStylePrompt] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState('')
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle')
  const [selectedExports, setSelectedExports] = useState<ExportFormat[]>(['mp3', 'srt'])
  const [history, setHistory] = useState<TtsHistoryEntry[]>(() => loadTtsHistory())

  useEffect(() => {
    const draft = loadTtsDraft()
    if (draft?.trim()) setText(draft)
  }, [])

  const { data: servers = TTS_SERVERS_FALLBACK, isLoading: serversLoading } = useTtsServers()
  const { data: voicesData, isLoading: voicesLoading } = useTtsVoices(ttsServer, locale, voiceName)
  const voicePreview = useVoicePreview()

  const voices = voicesData?.voices ?? []
  const showMimoStyle = isMimoTtsServer(ttsServer)
  const availableServers = useMemo(
    () => servers.filter((server) => isTtsServerAvailable(server)),
    [servers],
  )

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.id === voiceName),
    [voices, voiceName],
  )

  const serverOptions = useMemo(
    () => availableServers.map((server) => ({ value: server.id, label: server.label })),
    [availableServers],
  )

  const voiceOptions = useMemo(
    () => voiceSelectOptions(voices, voicesData?.featured_voices, t('ttsStudio.featured')),
    [voices, voicesData?.featured_voices, t],
  )

  const charCount = text.trim().length
  const durationSec = estimateSpeechDuration(charCount)
  const segments = text.trim() ? Math.max(1, text.split(/[.!?]+/).filter(Boolean).length) : 0
  const voiceRate = speedPct / 100
  const voiceVolume = volumePct / 100

  useEffect(() => {
    if (serversLoading || availableServers.length === 0) return
    if (availableServers.some((server) => server.id === ttsServer)) return
    const nextServer =
      availableServers.find((server) => server.id !== NO_VOICE_ID) ?? availableServers[0]
    if (nextServer) setTtsServer(nextServer.id)
  }, [serversLoading, availableServers, ttsServer])

  useEffect(() => {
    if (!voicesData || voices.length === 0) return
    const validIds = voices.map((voice) => voice.id)
    if (voiceName && validIds.includes(voiceName)) return
    const nextVoice = voicesData.default_voice || validIds[0] || ''
    if (nextVoice) setVoiceName(nextVoice)
  }, [voicesData, voices, voiceName])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const effectiveStylePrompt = showMimoStyle
    ? buildStylePrompt(emotion, style, stylePrompt)
    : undefined

  const canGenerate =
    ttsServer !== NO_VOICE_ID && Boolean(voiceName) && charCount > 0 && !voicePreview.isPending

  const runGenerate = useCallback(async (scriptText: string, voiceId: string) => {
    setPreviewError('')
    setPreviewStatus('generating')

    try {
      const blob = await voicePreview.mutateAsync({
        text: scriptText,
        voice_name: voiceId,
        voice_volume: voiceVolume,
        voice_rate: voiceRate,
        style_prompt: effectiveStylePrompt,
      })

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setPreviewStatus('ready')

      const entry: TtsHistoryEntry = {
        id: crypto.randomUUID(),
        name: `${voiceDisplayName(selectedVoice?.label ?? voiceId).slice(0, 18)}_${Date.now().toString(36)}`,
        voiceLabel: selectedVoice?.label ?? voiceId,
        charCount: scriptText.length,
        durationSec: estimateSpeechDuration(scriptText.length),
        createdAt: Date.now(),
        blobKey: '',
      }
      await storeHistoryBlob(entry.id, blob)
      const nextHistory = [entry, ...history.filter((item) => item.id !== entry.id)].slice(0, 12)
      setHistory(nextHistory)
      saveTtsHistory(nextHistory)
      return url
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('ttsStudio.previewFailed')
      setPreviewError(msg)
      setPreviewStatus('error')
      throw error
    }
  }, [
    effectiveStylePrompt,
    history,
    previewUrl,
    selectedVoice?.label,
    t,
    voicePreview,
    voiceRate,
    voiceVolume,
  ])

  const handleGenerate = () => {
    void runGenerate(text.trim(), voiceName)
  }

  const insertAtCursor = (openTag: string, closeTag = '') => {
    const el = scriptRef.current
    if (!el) {
      setText((prev) => prev + openTag + closeTag)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = text.slice(start, end)
    const next = text.slice(0, start) + openTag + selected + closeTag + text.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      el.focus()
      const cursor = start + openTag.length + selected.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  const toggleExport = (format: ExportFormat) => {
    setSelectedExports((prev) =>
      prev.includes(format) ? prev.filter((item) => item !== format) : [...prev, format],
    )
  }

  const handleDownload = () => {
    if (!previewUrl) return
    const anchor = document.createElement('a')
    anchor.href = previewUrl
    anchor.download = `tts-${Date.now()}.mp3`
    anchor.click()
  }

  const handleDownloadHistory = (id: string) => {
    const url = getHistoryBlobUrl(id)
    if (!url) {
      message.warning(t('ttsStudio.historyExpired'))
      return
    }
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `tts-${id.slice(0, 8)}.mp3`
    anchor.click()
  }

  const selectedVoiceLabel = selectedVoice
    ? `${voiceDisplayName(selectedVoice.label)} · ${style}`
    : '—'

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl border border-default bg-canvas">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-default bg-surface px-5">
          <div className="flex">
            {(['script', 'batch', 'history'] as WorkspaceTab[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={[
                  'flex h-12 items-center border-b-2 px-4 text-[13px] transition-colors',
                  tab === item
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-secondary',
                ].join(' ')}
              >
                {t(`ttsStudio.tab.${item}`)}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg border border-default px-2.5 py-1 text-xs text-secondary">
              <Languages size={13} />
              {locale.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-default px-2.5 py-1 text-xs text-secondary">
              <Clock size={13} />~{formatDuration(durationSec)} {t('ttsStudio.est')}
            </span>
            <Button size="small" icon={<Share2 size={13} />} disabled>
              {t('ttsStudio.share')}
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {tab === 'batch' && (
            <Alert type="info" showIcon title={t('ttsStudio.batchSoon')} className="max-w-lg" />
          )}

          {tab === 'history' && (
            <div className="max-w-2xl space-y-2">
              {history.length === 0 ? (
                <p className="text-sm text-muted">{t('ttsStudio.noHistory')}</p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl border border-default bg-surface px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary">{entry.name}</p>
                      <p className="text-xs text-muted">
                        {entry.voiceLabel} · {entry.charCount} chars · {formatDuration(entry.durationSec)}
                      </p>
                    </div>
                    <Button size="small" onClick={() => handleDownloadHistory(entry.id)}>
                      {t('ttsStudio.download')}
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'script' && (
            <div className="flex flex-col gap-4">
              {availableServers.length <= 1 && !serversLoading && (
                <Alert type="info" showIcon title={t('ttsStudio.noProvidersTitle')} description={t('ttsStudio.noProvidersHint')} />
              )}

              <div className="overflow-hidden rounded-xl border border-default bg-surface">
                <div className="flex items-center gap-2 border-b border-default px-3.5 py-2.5">
                  <FileText size={14} className="text-muted" />
                  <span className="text-xs font-medium text-secondary">{t('ttsStudio.script')}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="rounded-full bg-accent-muted px-2 py-0.5 text-[10px] font-semibold text-accent">
                      {selectedVoiceLabel}
                    </span>
                    <Button
                      size="small"
                      icon={<Sparkles size={12} />}
                      onClick={() => message.info(t('ttsStudio.improveSoon'))}
                      className="text-[11px]"
                    >
                      {t('ttsStudio.aiImprove')}
                    </Button>
                  </div>
                </div>

                <textarea
                  ref={scriptRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="w-full resize-none border-none bg-transparent px-3.5 py-3.5 text-sm leading-relaxed text-primary outline-none"
                  placeholder={t('ttsStudio.textPlaceholder')}
                />

                <div className="flex flex-wrap items-center gap-1.5 border-t border-default px-3.5 py-2">
                  <Button size="small" type="text" icon={<Pause size={13} />} onClick={() => insertAtCursor('<break time="500ms"/>')}>
                    {t('ttsStudio.pause')}
                  </Button>
                  <Button size="small" type="text" icon={<Volume2 size={13} />} onClick={() => insertAtCursor('<emphasis level="strong">', '</emphasis>')}>
                    {t('ttsStudio.emphasis')}
                  </Button>
                  <span className="mx-1 h-4 w-px bg-default" />
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                    <BarChart3 size={12} />
                    {t('ttsStudio.charCount', { count: charCount })}
                  </span>
                  <Link href={USER_ROUTES.scriptWriter} className="ml-auto">
                    <Button size="small" icon={<Sparkles size={12} />} className="text-[11px]">
                      {t('ttsStudio.generateScript')}
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-1.5 px-3.5 pb-3">
                  {SSML_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => insertAtCursor(tag.insert, tag.close ?? '')}
                      className="rounded-full border border-default px-2.5 py-1 text-[11px] font-medium text-secondary transition-colors hover:border-accent/40 hover:bg-accent-muted hover:text-accent"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-default bg-surface">
                <div className="flex items-center gap-2 border-b border-default px-3.5 py-2.5">
                  <SlidersHorizontal size={14} className="text-muted" />
                  <span className="text-xs font-medium text-secondary">{t('ttsStudio.voiceParameters')}</span>
                </div>

                <div className="grid grid-cols-1 gap-3 p-3.5 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      {t('ttsStudio.server')}
                    </label>
                    <Select
                      size="small"
                      value={ttsServer}
                      onChange={setTtsServer}
                      options={serverOptions}
                      loading={serversLoading}
                      disabled={ttsServer === NO_VOICE_ID && availableServers.length === 0}
                    />
                  </div>
                  {ttsServer !== NO_VOICE_ID && (
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[11px] font-medium uppercase tracking-wide text-muted">
                        {t('ttsStudio.voice')}
                      </label>
                      <Select
                        size="small"
                        showSearch
                        optionFilterProp="label"
                        value={voiceName || undefined}
                        onChange={setVoiceName}
                        options={voiceOptions}
                        loading={voicesLoading}
                        placeholder={t('ttsStudio.voicePlaceholder')}
                      />
                    </div>
                  )}
                  <ParamSlider
                    label={t('ttsStudio.speed')}
                    value={speedPct}
                    min={50}
                    max={200}
                    step={5}
                    format={(v) => `${v}%`}
                    onChange={setSpeedPct}
                  />
                  <ParamSlider
                    label={t('ttsStudio.pitch')}
                    value={pitch}
                    min={-50}
                    max={50}
                    step={1}
                    format={(v) => (v > 0 ? `+${v}` : `${v}`)}
                    onChange={setPitch}
                    disabled
                  />
                  <ParamSlider
                    label={t('ttsStudio.volume')}
                    value={volumePct}
                    min={0}
                    max={100}
                    step={1}
                    format={(v) => `${v}%`}
                    onChange={setVolumePct}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      {t('ttsStudio.emotionLabel')}
                    </label>
                    <Select
                      size="small"
                      value={emotion}
                      onChange={setEmotion}
                      options={EMOTIONS.map((item) => ({ value: item, label: t(`ttsStudio.emotion.${item}`) }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      {t('ttsStudio.styleLabel')}
                    </label>
                    <Select
                      size="small"
                      value={style}
                      onChange={setStyle}
                      options={STYLES.map((item) => ({ value: item, label: t(`ttsStudio.style.${item}`) }))}
                    />
                  </div>
                  <ParamSlider
                    label={t('ttsStudio.pauseBetween')}
                    value={pauseMs}
                    min={0}
                    max={2000}
                    step={50}
                    format={(v) => `${v}ms`}
                    onChange={setPauseMs}
                    disabled
                  />
                </div>

                {showMimoStyle && (
                  <div className="border-t border-default px-3.5 pb-3.5">
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted">
                      {t('ttsStudio.stylePrompt')}
                    </label>
                    <Input.TextArea
                      value={stylePrompt}
                      onChange={(e) => setStylePrompt(e.target.value)}
                      rows={2}
                      placeholder={t('ttsStudio.stylePromptPlaceholder')}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              <TtsPreviewCard
                src={previewUrl}
                status={previewStatus}
                error={previewError}
                onRegenerate={handleGenerate}
                onDownload={handleDownload}
                t={t}
              />
            </div>
          )}
        </div>
      </div>

      <div className="hidden xl:flex">
        <TtsExportPanel
          charCount={charCount}
          durationSec={durationSec}
          segments={segments}
          selectedExports={selectedExports}
          onToggleExport={toggleExport}
          history={history}
          onDownloadHistory={handleDownloadHistory}
          onGenerate={handleGenerate}
          generating={voicePreview.isPending}
          canGenerate={canGenerate}
          t={t}
        />
      </div>
    </div>
  )
}

function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (value: number) => string
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</label>
        <span className="text-[11px] font-bold text-secondary font-mono bg-subtle px-1.5 py-0.5 rounded">{format(value)}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={onChange}
        tooltip={{ formatter: (v) => format(v ?? value) }}
        className="my-1.5"
      />
      {disabled && (
        <span className="text-[9px] text-muted -mt-1.5 block">Coming soon</span>
      )}
    </div>
  )
}
