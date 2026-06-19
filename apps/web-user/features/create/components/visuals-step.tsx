'use client'

import { useEffect, useRef, useState } from 'react'
import { Button, Spin } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Trash2, Upload } from 'lucide-react'
import { useVideoAppSettings, useDeleteVideoMaterial, useUploadVideoMaterial, VIDEO_ENCODER_HELP } from '@/api'
import { useCreateConfig } from '../hooks/use-create-config'
import { FieldMenuSelect, MenuSelect, numberOptions } from './form-primitives'
import { StepSection } from './form-primitives'

const VIDEO_SOURCES = [
  { value: 'pexels', label: 'Pexels' },
  { value: 'pixabay', label: 'Pixabay' },
  { value: 'local', label: 'Local file' },
  { value: 'douyin', label: 'TikTok' },
  { value: 'bilibili', label: 'Bilibili' },
  { value: 'xiaohongshu', label: 'Xiaohongshu' },
] as const

const CONCAT_MODES = [
  { value: 'sequential', label: 'Sequential' },
  { value: 'random', label: 'Random Concatenation (Recommended)' },
] as const

const TRANSITION_MODES = [
  { value: '', label: 'None' },
  { value: 'Shuffle', label: 'Shuffle' },
  { value: 'FadeIn', label: 'FadeIn' },
  { value: 'FadeOut', label: 'FadeOut' },
  { value: 'SlideIn', label: 'SlideIn' },
  { value: 'SlideOut', label: 'SlideOut' },
] as const

export const VIDEO_ASPECTS = [
  { value: '9:16', label: 'Portrait 9:16' },
  { value: '16:9', label: 'Landscape 16:9' },
] as const

const CLIP_DURATIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const
const VIDEO_COUNTS = [1, 2, 3, 4, 5] as const
const VIDEO_CODECS = [
  { value: 'libx264', label: 'libx264 (CPU)' },
  { value: 'h264_nvenc', label: 'NVIDIA NVENC (h264_nvenc)' },
  { value: 'h264_amf', label: 'AMD AMF (h264_amf)' },
  { value: 'h264_qsv', label: 'Intel QSV (h264_qsv)' },
  { value: 'h264_mf', label: 'Windows MediaFoundation (h264_mf)' },
  { value: 'h264_videotoolbox', label: 'macOS VideoToolbox (h264_videotoolbox)' },
] as const

const LOCAL_FILE_ACCEPT = '.mp4,.mov,.avi,.flv,.mkv,.jpg,.jpeg,.png'

function VideoSettingsSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const hydratedRef = useRef(false)

  const { section: visuals, patch } = useCreateConfig('visuals')
  const { settings, isLoading, isSaving, saveSettings } = useVideoAppSettings()
  const uploadMutation = useUploadVideoMaterial()
  const deleteMutation = useDeleteVideoMaterial()

  const codecOptions = settings?.codec_options ?? [...VIDEO_CODECS]
  const videoCodec = settings?.video_codec ?? 'libx264'

  useEffect(() => {
    if (!settings || hydratedRef.current) return
    hydratedRef.current = true
    if (settings.video_source && settings.video_source !== visuals.source) {
      patch({ source: settings.video_source })
    }
  }, [settings, patch, visuals.source])

  const persistVideoSource = (value: string) => {
    patch({ source: value })
    saveSettings({ video_source: value })
  }

  const handleLocalFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setUploadError('')
    const uploaded: typeof visuals.materials = []
    const names: string[] = []
    for (const file of Array.from(files)) {
      try {
        const res = await uploadMutation.mutateAsync(file)
        const filename = res.data.file
        uploaded.push({ provider: 'local', url: filename, duration: 0 })
        names.push(filename)
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : 'Upload failed')
        return
      }
    }
    patch({ materials: uploaded, uploadedMaterialNames: names })
  }

  const handleDeleteMaterial = async (name: string) => {
    setUploadError('')
    try {
      await deleteMutation.mutateAsync(name)
      patch({ materials: visuals.materials.filter((m) => m.url !== name), uploadedMaterialNames: visuals.uploadedMaterialNames.filter((n) => n !== name) })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldMenuSelect label="Video Source" options={[...VIDEO_SOURCES]} value={visuals.source} onChange={persistVideoSource} disabled={isLoading} />

      {visuals.source === 'local' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-primary">Upload Local Files</label>
          <input ref={fileInputRef} type="file" accept={LOCAL_FILE_ACCEPT} multiple hidden onChange={(e) => { void handleLocalFiles(e.target.files); e.target.value = '' }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-default bg-subtle px-4 py-2.5 text-sm font-semibold text-secondary hover:border-accent hover:text-primary disabled:opacity-50">
            {uploadMutation.isPending ? <Spin size="small" /> : <Upload size={15} />} Upload
          </button>
          <span className="text-xs text-muted">200MB per file · MP4, MOV, AVI, FLV, MKV, JPG, JPEG, PNG</span>
          {visuals.uploadedMaterialNames.length > 0 && (
            <div className="mt-1 flex flex-col gap-1">
              {visuals.uploadedMaterialNames.map((name) => (
                <div key={name} className="flex items-center justify-between gap-2">
                  <span className="flex-1 truncate font-mono text-xs text-secondary">{name}</span>
                  <Button type="text" size="small" danger icon={<Trash2 size={12} />} disabled={deleteMutation.isPending} onClick={() => void handleDeleteMaterial(name)} className="rounded-lg" />
                </div>
              ))}
            </div>
          )}
          {uploadError && <span className="mt-1 text-xs font-semibold text-error">{uploadError}</span>}
        </div>
      )}

      <FieldMenuSelect label="Video Concat Mode" options={[...CONCAT_MODES]} value={visuals.concatMode} onChange={(v) => patch({ concatMode: v })} />
      <FieldMenuSelect label="Video Transition Mode" options={[...TRANSITION_MODES]} value={visuals.transitionMode} onChange={(v) => patch({ transitionMode: v })} />
      <FieldMenuSelect label="Video Ratio" options={[...VIDEO_ASPECTS]} value={visuals.aspect} onChange={(v) => patch({ aspect: v })} />
      <FieldMenuSelect label="Clip Duration" options={numberOptions(CLIP_DURATIONS)} value={String(visuals.clipDuration)} onChange={(v) => patch({ clipDuration: Number(v) })} />
      <FieldMenuSelect label="Number of Videos Generated Simultaneously" options={numberOptions(VIDEO_COUNTS)} value={String(visuals.count)} onChange={(v) => patch({ count: Number(v) })} />

      <div className="border-t border-default pt-3">
        <button type="button" className="flex w-full items-center justify-between py-1 hover:opacity-85" onClick={() => setShowAdvanced((v) => !v)}>
          <span className="text-sm font-bold text-primary">Advanced Video Settings</span>
          <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
            <ChevronDown size={14} className="text-slate-400" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {showAdvanced && (
            <motion.div key="adv-video" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} style={{ overflow: 'hidden' }}>
              <div className="pt-4">
                <div className="flex flex-col gap-1.5">
                  <div className="mb-1 flex items-center gap-1.5">
                    <label className="text-sm font-bold text-primary">Video Encoder</label>
                    <span className="cursor-help select-none text-xs text-muted" title={VIDEO_ENCODER_HELP}>?</span>
                    {isSaving && <Spin size="small" />}
                  </div>
                  <MenuSelect options={codecOptions} value={videoCodec} onChange={(v) => saveSettings({ video_codec: v })} placeholder="Select encoder…" disabled={isLoading || isSaving} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function VisualsStep() {
  return (
    <StepSection title="Choose your visuals" description="Pick footage sources, aspect ratio, clip duration, and transitions.">
      <VideoSettingsSection />
    </StepSection>
  )
}
