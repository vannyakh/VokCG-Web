'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Input, Spin } from 'antd'
import { Volume2 } from 'lucide-react'
import { useLocale } from '@vokcg/i18n'
import { useTtsServers, useTtsVoices, useVoicePreview } from '@vokcg/api'
import { useVideoStore } from '@vokcg/store'
import { CLONE_PROVIDERS, isCloneTtsServer, isMimoTtsServer, isTtsServerAvailable, NO_VOICE_ID, TTS_SERVERS_FALLBACK, type VoiceCloneProfile } from '@vokcg/types'
import { useCreateConfig } from '../hooks/use-create-config'
import { voiceSelectOptions } from '../../tts/lib/tts-utils'
import { CustomAudioPlayer } from '../../voice/components/custom-audio-player'
import { VoiceClonePanel } from '../../voice/components/voice-clone-panel'
import { FieldMenuSelect, MenuSelect, numberOptions, StepSection } from './form-primitives'

const VOICE_VOLUMES = [0.6, 0.8, 1.0, 1.2, 1.5, 2.0, 3.0, 4.0, 5.0] as const
const VOICE_RATES = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.5, 1.8, 2.0] as const
const BGM_VOLUMES = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] as const

const BGM_OPTIONS = [
  { value: '', label: 'No Background Music' },
  { value: 'random', label: 'Random Background Music' },
  { value: 'custom', label: 'Custom Background Music' },
]

function AudioSettingsSection() {
  const { t } = useLocale()
  const locale = useVideoStore((s) => s.locale)
  const { config, section: audio, patch } = useCreateConfig('audio')
  const { subject, script } = config.content

  const [previewText, setPreviewText] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState('')

  const { data: servers = TTS_SERVERS_FALLBACK, isLoading: serversLoading } = useTtsServers()
  const { data: voicesData, isLoading: voicesLoading, isError: voicesError } = useTtsVoices(audio.ttsServer, locale, audio.voiceName)
  const voicePreview = useVoicePreview()

  const voices = voicesData?.voices ?? []
  const isNoVoice = audio.ttsServer === NO_VOICE_ID
  const showClonePanel = isCloneTtsServer(audio.ttsServer)
  const showMimoStyle = isMimoTtsServer(audio.ttsServer)

  const availableServers = useMemo(() => servers.filter((server) => isTtsServerAvailable(server)), [servers])
  const selectedServer = useMemo(() => availableServers.find((server) => server.id === audio.ttsServer), [availableServers, audio.ttsServer])
  const serverOptions = useMemo(() => availableServers.map((server) => ({ value: server.id, label: server.label })), [availableServers])
  const voiceOptions = useMemo(() => voiceSelectOptions(voices, voicesData?.featured_voices, t('ttsStudio.featured')), [voices, voicesData?.featured_voices, t])

  useEffect(() => {
    if (serversLoading || availableServers.length === 0) return
    if (availableServers.some((server) => server.id === audio.ttsServer)) return
    const nextServer = availableServers.find((server) => server.id !== NO_VOICE_ID) ?? availableServers[0]
    if (nextServer) patch({ ttsServer: nextServer.id })
  }, [serversLoading, availableServers, audio.ttsServer, patch])

  useEffect(() => {
    if (!voicesData || voices.length === 0) return
    const validIds = voices.map((v) => v.id)
    if (audio.voiceName && validIds.includes(audio.voiceName)) return
    const nextVoice = voicesData.default_voice || validIds[0] || ''
    if (nextVoice && nextVoice !== audio.voiceName) patch({ voiceName: nextVoice })
  }, [voicesData, voices, audio.voiceName, patch])

  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) } }, [previewUrl])

  const handleCloneSelect = (clone: VoiceCloneProfile) => {
    const server = CLONE_PROVIDERS.find((p) => p.id === clone.provider)?.serverId
    if (server) patch({ ttsServer: server, voiceName: clone.voice_name })
  }

  const handlePlayVoice = async () => {
    if (isNoVoice || !audio.voiceName) return
    setPreviewError('')
    const text = previewText.trim() || subject.trim() || script.trim() || 'Voice Example'
    try {
      const blob = await voicePreview.mutateAsync({ text, voice_name: audio.voiceName, voice_volume: audio.voiceVolume, voice_rate: audio.voiceRate, style_prompt: showMimoStyle ? audio.stylePrompt : undefined })
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : 'Voice preview failed')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldMenuSelect label={t('ttsStudio.server')} options={serverOptions} value={audio.ttsServer} onChange={(v) => patch({ ttsServer: v })} disabled={serversLoading} placeholder={t('ttsStudio.serverPlaceholder')} />

      {availableServers.length <= 1 && !serversLoading && (
        <Alert type="info" showIcon description="Add provider API keys in config.toml or .env to enable speech synthesis." />
      )}

      {showClonePanel && <VoiceClonePanel compact onCloneSelect={handleCloneSelect} />}

      {!showClonePanel && !isNoVoice && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-primary">{t('ttsStudio.voice')}</label>
          {voicesLoading ? (
            <div className="flex items-center gap-2 py-2"><Spin size="small" /><span className="text-xs text-muted">{t('ttsStudio.loadingVoices')}</span></div>
          ) : voicesError || voices.length === 0 ? (
            <div className="rounded-lg border border-error bg-app-error px-3 py-2.5"><span className="text-xs font-semibold text-error">{t('ttsStudio.noVoices')}</span></div>
          ) : (
            <MenuSelect options={voiceOptions} value={audio.voiceName} onChange={(v) => patch({ voiceName: v })} placeholder={t('ttsStudio.voicePlaceholder')} />
          )}
        </div>
      )}

      {showClonePanel && voices.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-primary">{t('ttsStudio.savedClone')}</label>
          <MenuSelect options={voiceOptions} value={audio.voiceName} onChange={(v) => patch({ voiceName: v })} placeholder={t('ttsStudio.voicePlaceholder')} />
        </div>
      )}

      {showMimoStyle && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-primary">{t('ttsStudio.stylePrompt')}</label>
          <Input.TextArea value={audio.stylePrompt} onChange={(e) => patch({ stylePrompt: e.target.value })} rows={2} placeholder={t('ttsStudio.stylePromptPlaceholder')} className="text-sm" />
        </div>
      )}

      {!isNoVoice && (voices.length > 0 || showClonePanel) && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-primary">Preview text</label>
            <Input.TextArea value={previewText} onChange={(e) => setPreviewText(e.target.value)} rows={2} placeholder="Text to synthesize for preview…" className="text-sm" />
          </div>
          <div>
            <Button variant="outlined" onClick={() => void handlePlayVoice()} disabled={voicePreview.isPending || !audio.voiceName || !selectedServer} icon={voicePreview.isPending ? <Spin size="small" /> : <Volume2 size={14} />} className="font-bold">Play Voice</Button>
            {previewUrl && <div className="mt-3"><CustomAudioPlayer src={previewUrl} autoPlay /></div>}
            {previewError && <span className="mt-2 block text-xs font-semibold text-error">{previewError}</span>}
          </div>
        </>
      )}

      <FieldMenuSelect label="Speech Volume (1.0 represents 100%)" options={numberOptions(VOICE_VOLUMES)} value={String(audio.voiceVolume)} onChange={(v) => patch({ voiceVolume: Number(v) })} />
      <FieldMenuSelect label="Speech Rate (1.0 means 1x speed)" options={numberOptions(VOICE_RATES)} value={String(audio.voiceRate)} onChange={(v) => patch({ voiceRate: Number(v) })} />
      <FieldMenuSelect label="Background Music" options={BGM_OPTIONS} value={audio.bgmType} onChange={(v) => patch({ bgmType: v })} />

      {audio.bgmType === 'custom' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-primary">Custom Background Music File</label>
          <Input value={audio.bgmFile} onChange={(e) => patch({ bgmFile: e.target.value })} placeholder="output013.mp3" className="font-mono text-xs" />
        </div>
      )}

      <FieldMenuSelect label="Background Music Volume" options={numberOptions(BGM_VOLUMES)} value={String(audio.bgmVolume)} onChange={(v) => patch({ bgmVolume: Number(v) })} />
    </div>
  )
}

export function AudioStep() {
  return (
    <StepSection title="Voice & music" description="Select a TTS provider, voice clone, speech rate, and background music.">
      <AudioSettingsSection />
    </StepSection>
  )
}
