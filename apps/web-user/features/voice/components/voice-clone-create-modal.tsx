'use client'

import { Alert, Button, Checkbox, Drawer, Input, Select, Segmented } from 'antd'
import { FileAudio, Mic, Square, Trash2, Upload as UploadIcon, User } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '@vokcg/i18n'
import { useCreateVoiceClone, useTtsServers } from '@/api'
import { CLONE_PROVIDERS, VOICE_CLONE_LANGUAGES, isTtsServerAvailable, type VoiceCloneProfile } from '@/types/tts'
import { useAppMessage } from '@vokcg/ui'
import { CustomAudioPlayer } from './custom-audio-player'

const VISUALIZER_BARS = 20

async function blobToWavFile(blob: Blob): Promise<File> {
  const arrayBuffer = await blob.arrayBuffer()
  const ctx = new AudioContext()
  let audioBuffer: AudioBuffer
  try {
    audioBuffer = await ctx.decodeAudioData(arrayBuffer)
  } finally {
    ctx.close().catch(() => undefined)
  }

  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const numFrames = audioBuffer.length
  const blockAlign = numChannels * 2
  const dataSize = numFrames * blockAlign
  const wavBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(wavBuffer)

  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  write(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  write(8, 'WAVE')
  write(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  write(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = audioBuffer.getChannelData(ch)[i] ?? 0
      view.setInt16(offset, Math.max(-1, Math.min(1, s)) * 0x7fff, true)
      offset += 2
    }
  }
  return new File([wavBuffer], 'recording.wav', { type: 'audio/wav' })
}

type VoiceCloneCreateModalProps = {
  open: boolean
  onClose: () => void
  onSuccess?: (clone: VoiceCloneProfile) => void
}

export function VoiceCloneCreateModal({ open, onClose, onSuccess }: VoiceCloneCreateModalProps) {
  const { t } = useLocale()
  const message = useAppMessage()
  const [provider, setProvider] = useState<'mimo' | 'siliconflow'>('mimo')
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('female')
  const [language, setLanguage] = useState('en')
  const [referenceText, setReferenceText] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioObjectUrl, setAudioObjectUrl] = useState<string | null>(null)
  const [audioInputMode, setAudioInputMode] = useState<'upload' | 'record'>('upload')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const barsContainerRef = useRef<HTMLDivElement | null>(null)

  const { data: ttsServers = [] } = useTtsServers()
  const createClone = useCreateVoiceClone()

  const providerOptions = useMemo(
    () =>
      CLONE_PROVIDERS.filter((item) => {
        const server = ttsServers.find((entry) => entry.id === item.serverId)
        return isTtsServerAvailable(server)
      }).map((item) => ({ value: item.id, label: item.label })),
    [ttsServers],
  )

  const effectiveProvider = useMemo(() => {
    if (providerOptions.some((option) => option.value === provider)) return provider
    return (providerOptions[0]?.value as 'mimo' | 'siliconflow' | undefined) ?? provider
  }, [provider, providerOptions])

  const activeProviderHint = useMemo(() => {
    const serverId = CLONE_PROVIDERS.find((item) => item.id === effectiveProvider)?.serverId
    const server = ttsServers.find((entry) => entry.id === serverId)
    return server?.config_hint ?? null
  }, [effectiveProvider, ttsServers])

  const stopTimer = useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
  }, [])

  const stopVisualizer = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    analyserRef.current = null
    audioCtxRef.current?.close().catch(() => undefined)
    audioCtxRef.current = null
    if (barsContainerRef.current) {
      Array.from(barsContainerRef.current.children).forEach((bar) => {
        ;(bar as HTMLElement).style.height = '4px'
      })
    }
  }, [])

  const handleAudioChange = useCallback((file: File) => {
    setAudioObjectUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file) })
    setAudioFile(file)
  }, [])

  const handleAudioRemove = () => {
    if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl)
    setAudioFile(null)
    setAudioObjectUrl(null)
    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  const reset = () => {
    if (isRecording) { mediaRecorderRef.current?.stop(); stopTimer(); setIsRecording(false) }
    setName(''); setGender('female'); setLanguage('en'); setReferenceText('')
    setAudioFile(null); setAudioInputMode('upload'); setRecordingSeconds(0)
    setAvatarFile(null); setTermsAccepted(false)
    if (audioObjectUrl) { URL.revokeObjectURL(audioObjectUrl); setAudioObjectUrl(null) }
    if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null) }
  }

  const handleClose = () => { reset(); onClose() }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser
      ctx.createMediaStreamSource(stream).connect(analyser)

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        stopVisualizer()
        const blob = new Blob(chunksRef.current, { type: mimeType })
        blobToWavFile(blob)
          .then((wavFile) => handleAudioChange(wavFile))
          .catch(() => {
            const ext = mimeType.includes('ogg') ? 'ogg' : 'webm'
            handleAudioChange(new File([blob], `recording.${ext}`, { type: mimeType }))
          })
          .finally(() => { stopTimer(); setIsRecording(false) })
      }

      recorder.start(100)
      setIsRecording(true)
      setRecordingSeconds(0)
      recordTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000)
    } catch {
      message.error(t('voiceStudio.recordMicDenied'))
    }
  }, [handleAudioChange, message, stopTimer, stopVisualizer, t])

  useEffect(() => {
    if (!isRecording || !analyserRef.current) return
    const analyser = analyserRef.current
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    const step = Math.max(1, Math.floor(dataArray.length / VISUALIZER_BARS))

    const animate = () => {
      if (!barsContainerRef.current) return
      analyser.getByteFrequencyData(dataArray)
      const children = barsContainerRef.current.children
      for (let i = 0; i < children.length; i++) {
        const raw = (dataArray[i * step] ?? 0) / 255
        const height = Math.max(6, Math.min(44, 6 + raw * 38))
        ;(children[i] as HTMLElement).style.height = `${height}px`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null } }
  }, [isRecording])

  const stopRecording = useCallback(() => { mediaRecorderRef.current?.stop(); stopTimer() }, [stopTimer])

  useEffect(() => {
    return () => {
      stopTimer(); stopVisualizer()
      mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop())
    }
  }, [stopTimer, stopVisualizer])

  const handleAvatarChange = (file: File) => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!name.trim()) { message.warning(t('voiceStudio.nameRequired')); return }
    if (!audioFile) { message.warning(t('voiceStudio.audioRequired')); return }
    if (!termsAccepted) { message.warning(t('voiceStudio.termsRequired')); return }

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('provider', effectiveProvider)
    formData.append('reference_text', referenceText.trim())
    formData.append('gender', gender)
    formData.append('language', language)
    formData.append('audio', audioFile)
    if (avatarFile) formData.append('avatar', avatarFile)

    try {
      const res = await createClone.mutateAsync(formData)
      const clone = res.data.clone
      message.success(t('voiceStudio.created', { name: clone.name }))
      onSuccess?.(clone)
      handleClose()
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('voiceStudio.createFailed'))
    }
  }

  const languageOptions = VOICE_CLONE_LANGUAGES.map((lang) => ({ value: lang.value, label: lang.label }))
  const genderOptions = [
    { label: t('voiceStudio.gender_male'), value: 'male' },
    { label: t('voiceStudio.gender_female'), value: 'female' },
  ]

  return (
    <Drawer
      title={<div className="flex items-center gap-2 text-base font-semibold">{t('voiceStudio.createTitle')}</div>}
      placement="right"
      open={open}
      onClose={handleClose}
      size={440}
      destroyOnHidden
      footer={
        <div className="flex flex-col gap-3 pb-2">
          <Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="text-xs text-secondary">
            {t('voiceStudio.terms')}
          </Checkbox>
          <Button type="primary" size="large" block loading={createClone.isPending} disabled={Boolean(activeProviderHint)} onClick={handleSubmit}>
            {t('voiceStudio.createAction')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {activeProviderHint && (
          <Alert type="warning" showIcon title={t('voiceStudio.apiKeyTitle')} description={activeProviderHint} />
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">{t('voiceStudio.provider')}</label>
          <Select value={effectiveProvider} onChange={setProvider} options={providerOptions} size="large" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">{t('voiceStudio.voiceName')} <span className="text-red-500">*</span></label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('voiceStudio.voiceNamePlaceholder')} maxLength={120} size="large" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">{t('voiceStudio.gender')} <span className="text-red-500">*</span></label>
          <Segmented block options={genderOptions} value={gender} onChange={(val) => setGender(val as 'male' | 'female')} size="large" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">{t('voiceStudio.language')} <span className="text-red-500">*</span></label>
          <Select value={language} onChange={setLanguage} options={languageOptions} showSearch size="large" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">{t('voiceStudio.avatarImage')}</label>
          <div
            className="relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-default bg-surface transition-colors hover:border-accent/60"
            onClick={() => avatarInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <User size={32} className="text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            )}
          </div>
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); e.target.value = '' }} />
          <Button icon={<UploadIcon size={14} />} block size="large" onClick={() => avatarInputRef.current?.click()} className="border-accent text-accent hover:border-accent/70 hover:text-accent/70">
            {avatarPreview ? t('voiceStudio.avatarChange') : t('voiceStudio.avatarHint')}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-secondary">{t('voiceStudio.referenceAudio')} <span className="text-red-500">*</span></label>

          {!audioFile && (
            <Segmented block
              options={[
                { value: 'upload', label: <div className="flex items-center justify-center gap-1.5 py-0.5"><UploadIcon size={14} /><span>{t('voiceStudio.audioModeUpload')}</span></div> },
                { value: 'record', label: <div className="flex items-center justify-center gap-1.5 py-0.5"><Mic size={14} /><span>{t('voiceStudio.audioModeRecord')}</span></div> },
              ]}
              value={audioInputMode}
              onChange={(v) => { if (isRecording) stopRecording(); setAudioInputMode(v as 'upload' | 'record') }}
            />
          )}

          {audioFile && audioObjectUrl ? (
            <div className="flex flex-col gap-2 rounded-xl border border-default bg-surface p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-muted">
                  <FileAudio size={15} className="text-accent" />
                </div>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-primary">{audioFile.name}</span>
                <button type="button" onClick={() => { handleAudioRemove(); setRecordingSeconds(0) }} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-red-500/10 hover:text-red-500" aria-label="Remove audio">
                  <Trash2 size={14} />
                </button>
              </div>
              <CustomAudioPlayer src={audioObjectUrl} />
            </div>
          ) : audioInputMode === 'upload' ? (
            <div
              className={['flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors', createClone.isPending || Boolean(activeProviderHint) ? 'cursor-not-allowed border-default opacity-50' : 'border-default hover:border-accent/50 hover:bg-accent-muted/20'].join(' ')}
              onClick={() => { if (!createClone.isPending && !activeProviderHint) audioInputRef.current?.click() }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted text-accent"><UploadIcon size={22} /></div>
              <div>
                <p className="text-sm font-semibold text-secondary">{t('voiceStudio.uploadAudio')}</p>
                <p className="mt-0.5 text-xs text-muted">{t('voiceStudio.uploadHint')}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border-2 border-dashed border-default bg-surface">
              {isRecording ? (
                <div className="flex flex-col items-center gap-3 px-6 py-5">
                  <div ref={barsContainerRef} className="flex h-12 w-full items-end justify-center gap-[3px]">
                    {Array.from({ length: VISUALIZER_BARS }).map((_, i) => (
                      <div key={i} className="w-[5px] shrink-0 rounded-full bg-accent" style={{ height: '4px', transition: 'height 60ms ease' }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold tracking-widest text-red-500">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                      {t('voiceStudio.recording')}
                    </span>
                    <span className="font-mono text-xl font-bold tabular-nums text-primary">
                      {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}<span className="opacity-60">:</span>{String(recordingSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <button type="button" onClick={stopRecording} className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg ring-4 ring-red-500/20 transition-transform hover:scale-105 active:scale-95" aria-label={t('voiceStudio.recordStop')}>
                    <Square size={16} fill="white" />
                  </button>
                  <p className="text-xs text-muted">{t('voiceStudio.recordStop')}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 px-6 py-6">
                  <button type="button" onClick={startRecording} className="group relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent text-white shadow-lg ring-4 ring-accent/20 transition-all hover:scale-105 hover:shadow-xl hover:ring-accent/40 active:scale-95" aria-label={t('voiceStudio.recordStart')}>
                    <Mic size={28} />
                  </button>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-secondary">{t('voiceStudio.recordStart')}</p>
                    <p className="mt-0.5 text-xs text-muted">{t('voiceStudio.recordHint')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <input ref={audioInputRef} type="file" accept="audio/mpeg,audio/wav,audio/mp3,.mp3,.wav" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioChange(f); e.target.value = '' }} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary">{t('voiceStudio.referenceTranscript')}</label>
          <Input.TextArea value={referenceText} onChange={(e) => setReferenceText(e.target.value)} rows={3} placeholder={t('voiceStudio.referenceTranscriptPlaceholder')} />
        </div>
      </div>
    </Drawer>
  )
}
