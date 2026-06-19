'use client'

import { Button, Empty, Modal, Popconfirm, Spin, Tag } from 'antd'
import { Plus, Trash2, UserRound, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocale } from '@vokcg/i18n'
import { useDeleteVoiceClone, useTtsServers, useVoiceClones, useVoicePreview } from '@vokcg/api'
import { API_BASE_URL } from '@vokcg/config'
import { CLONE_PROVIDERS, type VoiceCloneProfile } from '@vokcg/types'
import { useAppMessage } from '@vokcg/ui'
import { CustomAudioPlayer } from './custom-audio-player'
import { VoiceCloneCreateModal } from './voice-clone-create-modal'

type ViewMode = 'grid' | 'list'

type Props = {
  compact?: boolean
  viewMode?: ViewMode
  activeProvider?: string
  search?: string
  createOpen?: boolean
  onCreateOpenChange?: (open: boolean) => void
  onCloneSelect?: (clone: VoiceCloneProfile) => void
}

function CloneAvatar({ clone, size = 'md' }: { clone: VoiceCloneProfile; size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-[72px] w-[72px]' : size === 'md' ? 'h-12 w-12' : size === 'sm' ? 'h-9 w-9' : 'h-7 w-7'
  const radius = size === 'lg' ? 'rounded-2xl' : size === 'md' ? 'rounded-xl' : 'rounded-lg'
  const iconSize = size === 'lg' ? 22 : size === 'md' ? 18 : size === 'sm' ? 15 : 13

  return (
    <div className={`${dim} ${radius} shrink-0 overflow-hidden bg-accent-muted flex items-center justify-center`}>
      {clone.avatar_url ? (
        <img src={`${API_BASE_URL}${clone.avatar_url}`} alt={clone.name} className="h-full w-full object-cover"
          onError={(e) => { ;(e.currentTarget as HTMLImageElement).style.display = 'none' }} />
      ) : (
        <UserRound size={iconSize} className="text-accent" />
      )}
    </div>
  )
}

function formatCreatedAt(value?: string) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return value }
}

function providerLabel(provider: VoiceCloneProfile['provider']) {
  return CLONE_PROVIDERS.find((item) => item.id === provider)?.label ?? provider
}

function MetaTags({ clone, t }: { clone: VoiceCloneProfile; t: (k: string) => string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Tag className="m-0 text-[10px]">{providerLabel(clone.provider)}</Tag>
      {clone.gender && <Tag color={clone.gender === 'male' ? 'blue' : 'pink'} className="m-0 text-[10px] capitalize">{t(`voiceStudio.gender_${clone.gender}`)}</Tag>}
      {clone.language && <Tag className="m-0 font-mono text-[10px] uppercase">{clone.language}</Tag>}
    </div>
  )
}

export function VoiceClonePanel({
  compact = false,
  viewMode = 'grid',
  activeProvider = 'all',
  search = '',
  createOpen: createOpenProp,
  onCreateOpenChange,
  onCloneSelect,
}: Props) {
  const { t } = useLocale()
  const message = useAppMessage()
  const [internalCreateOpen, setInternalCreateOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewClone, setPreviewClone] = useState<VoiceCloneProfile | null>(null)
  const [previewText, setPreviewText] = useState('Hello, this is my cloned voice preview.')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedCloneId, setSelectedCloneId] = useState('')

  const createOpen = createOpenProp ?? internalCreateOpen
  const setCreateOpen = onCreateOpenChange ?? setInternalCreateOpen

  const { data: clones = [], isLoading } = useVoiceClones(
    activeProvider === 'all' ? undefined : activeProvider,
    search || undefined,
  )
  const { data: ttsServers = [] } = useTtsServers()
  const deleteClone = useDeleteVoiceClone()
  const voicePreview = useVoicePreview()

  const providerConfigured = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const item of CLONE_PROVIDERS) {
      const server = ttsServers.find((entry) => entry.id === item.serverId)
      map.set(item.id, server?.configured !== false)
    }
    return map
  }, [ttsServers])

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  const handlePreview = async () => {
    if (!previewClone) return
    const serverId = CLONE_PROVIDERS.find((item) => item.id === previewClone.provider)?.serverId
    const server = ttsServers.find((entry) => entry.id === serverId)
    if (server?.config_hint) { message.error(server.config_hint); return }
    try {
      const blob = await voicePreview.mutateAsync({
        text: previewText.trim() || t('voiceStudio.previewFallback'),
        voice_name: previewClone.voice_name,
        voice_volume: 1,
        voice_rate: 1,
      })
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('voiceStudio.previewFailed'))
    }
  }

  const openPreview = (clone: VoiceCloneProfile) => {
    setPreviewClone(clone); setPreviewOpen(true)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const closePreview = () => {
    setPreviewOpen(false); setPreviewClone(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const handleDelete = async (cloneId: string) => {
    try {
      await deleteClone.mutateAsync(cloneId)
      message.success(t('voiceStudio.deleted'))
      if (selectedCloneId === cloneId) setSelectedCloneId('')
    } catch {
      message.error(t('voiceStudio.deleteFailed'))
    }
  }

  const renderCompactCard = (clone: VoiceCloneProfile) => {
    const configured = providerConfigured.get(clone.provider) !== false
    const isSelected = selectedCloneId === clone.id
    return (
      <div key={clone.id} className={['flex items-center gap-2 rounded-xl border px-3 py-2 transition-all', isSelected ? 'border-accent/70 bg-accent-muted/30 shadow-sm shadow-accent/5' : 'border-default bg-surface hover:border-accent/30'].join(' ')}>
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2.5 text-left" onClick={() => { setSelectedCloneId(clone.id); onCloneSelect?.(clone) }}>
          <CloneAvatar clone={clone} size="xs" />
          <span className="truncate text-sm font-semibold text-primary">{clone.name}</span>
        </button>
        <div className="flex shrink-0 gap-1">
          <Button size="small" disabled={!configured} onClick={() => openPreview(clone)}>{t('voiceStudio.preview')}</Button>
          <Button size="small" danger icon={<Trash2 size={12} />} loading={deleteClone.isPending} onClick={() => handleDelete(clone.id)} />
        </div>
      </div>
    )
  }

  const renderGridCard = (clone: VoiceCloneProfile) => {
    const configured = providerConfigured.get(clone.provider) !== false
    const isSelected = selectedCloneId === clone.id
    return (
      <article key={clone.id} className={['group relative flex flex-col overflow-hidden rounded-2xl bg-surface transition-all duration-200', isSelected ? 'border border-accent/40 shadow-xl shadow-accent/8 ring-2 ring-accent/10' : 'border border-default/30 hover:border-accent/30 hover:shadow-lg hover:shadow-black/6'].join(' ')}>
        <div className={['h-[2px] w-full bg-linear-to-r from-accent/70 via-accent/40 to-transparent transition-opacity duration-200', isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'].join(' ')} />
        <button type="button" className="flex w-full items-start gap-4 px-5 pb-4 pt-4 text-left" onClick={() => { setSelectedCloneId(clone.id); onCloneSelect?.(clone) }}>
          <div className="relative shrink-0">
            <CloneAvatar clone={clone} size="lg" />
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex items-end gap-[3px]">
                {[9, 17, 27, 19, 31, 15, 25, 13, 21, 11].map((h, i) => <div key={i} className="w-[3px] rounded-full bg-white" style={{ height: h }} />)}
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-[15px] font-bold text-primary transition-colors group-hover:text-accent">{clone.name}</p>
            <div className="mt-2"><MetaTags clone={clone} t={t} /></div>
            {clone.reference_text && <p className="mt-2 line-clamp-2 text-xs text-muted">{clone.reference_text}</p>}
            {clone.created_at && <p className="mt-2 text-[11px] text-muted/50">{formatCreatedAt(clone.created_at)}</p>}
          </div>
        </button>
        <div className="mt-auto flex items-center gap-2 border-t border-default/20 px-5 py-3">
          <Button size="small" icon={<Volume2 size={13} />} disabled={!configured} onClick={() => openPreview(clone)}>{t('voiceStudio.preview')}</Button>
          <Popconfirm title={t('voiceStudio.deleteConfirm')} onConfirm={() => handleDelete(clone.id)}>
            <Button size="small" danger icon={<Trash2 size={13} />} loading={deleteClone.isPending}>{t('voiceStudio.delete')}</Button>
          </Popconfirm>
        </div>
      </article>
    )
  }

  const renderListRow = (clone: VoiceCloneProfile) => {
    const configured = providerConfigured.get(clone.provider) !== false
    const isSelected = selectedCloneId === clone.id
    return (
      <div key={clone.id} className={['group relative flex items-center gap-4 overflow-hidden rounded-xl bg-surface py-3 pr-4 pl-5 transition-all duration-200', isSelected ? 'border border-accent/40 shadow-md shadow-accent/6 ring-2 ring-accent/10' : 'border border-default/30 hover:border-accent/30 hover:shadow-sm'].join(' ')}>
        <div className={['absolute left-0 top-0 h-full w-[3px] rounded-r-full transition-colors duration-200', isSelected ? 'bg-accent' : 'bg-transparent group-hover:bg-accent/25'].join(' ')} />
        <CloneAvatar clone={clone} size="sm" />
        <button type="button" className="flex min-w-0 flex-1 items-center gap-4 text-left" onClick={() => { setSelectedCloneId(clone.id); onCloneSelect?.(clone) }}>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-primary transition-colors group-hover:text-accent">{clone.name}</p>
            <div className="mt-1"><MetaTags clone={clone} t={t} /></div>
          </div>
          {clone.reference_text && <p className="hidden max-w-[260px] truncate text-xs text-muted lg:block">{clone.reference_text}</p>}
          {clone.created_at && <span className="hidden shrink-0 text-xs text-muted/70 xl:block">{formatCreatedAt(clone.created_at)}</span>}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="small" icon={<Volume2 size={13} />} disabled={!configured} onClick={() => openPreview(clone)}>{t('voiceStudio.preview')}</Button>
          <Popconfirm title={t('voiceStudio.deleteConfirm')} onConfirm={() => handleDelete(clone.id)}>
            <Button size="small" danger icon={<Trash2 size={13} />} loading={deleteClone.isPending}>{t('voiceStudio.delete')}</Button>
          </Popconfirm>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={compact ? 'flex flex-col gap-3' : 'flex w-full flex-col gap-5'}>
        {compact && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-secondary">{t('voiceStudio.savedClones')}</p>
            <Button size="small" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>{t('voiceStudio.add')}</Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted"><Spin size="small" />{t('voiceStudio.loading')}</div>
        ) : clones.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={compact ? t('voiceStudio.emptyCompact') : t('voiceStudio.empty')} />
        ) : compact ? (
          <div className="flex flex-col gap-2">{clones.map(renderCompactCard)}</div>
        ) : viewMode === 'grid' ? (
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{clones.map(renderGridCard)}</div>
        ) : (
          <div className="flex w-full flex-col gap-2">{clones.map(renderListRow)}</div>
        )}
      </div>

      <VoiceCloneCreateModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={(clone) => { setSelectedCloneId(clone.id); onCloneSelect?.(clone) }} />

      <Modal
        title={previewClone ? `${t('voiceStudio.preview')} · ${previewClone.name}` : t('voiceStudio.preview')}
        open={previewOpen} onCancel={closePreview}
        footer={[
          <Button key="close" onClick={closePreview}>{t('common.close')}</Button>,
          <Button key="play" type="primary" loading={voicePreview.isPending} icon={<Volume2 size={14} />} onClick={handlePreview}>{t('voiceStudio.playPreview')}</Button>,
        ]}
        destroyOnHidden
      >
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-secondary">{t('voiceStudio.previewText')}</label>
          <textarea className="min-h-[88px] w-full rounded-xl border border-default bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-accent" value={previewText} onChange={(event) => setPreviewText(event.target.value)} />
          {previewUrl && <CustomAudioPlayer src={previewUrl} autoPlay />}
        </div>
      </Modal>
    </>
  )
}
