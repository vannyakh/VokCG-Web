'use client'

import { Button, Spin } from 'antd'
import { Check, Download, FileMusic, FileText, Play } from 'lucide-react'
import type { TtsHistoryEntry } from '../lib/tts-utils'
import { formatDuration } from '../lib/tts-utils'

type ExportFormat = 'mp3' | 'wav' | 'ogg' | 'srt'

type TtsExportPanelProps = {
  charCount: number
  durationSec: number
  segments: number
  selectedExports: ExportFormat[]
  onToggleExport: (format: ExportFormat) => void
  history: TtsHistoryEntry[]
  onDownloadHistory: (id: string) => void
  onGenerate: () => void
  generating: boolean
  canGenerate: boolean
  t: (key: string, params?: Record<string, string | number>) => string
}

const EXPORT_ITEMS: Array<{
  id: ExportFormat
  iconClass: string
  nameKey: 'exportMP3' | 'exportWAV' | 'exportOGG' | 'exportSRT'
  descKey: 'exportMp3Desc' | 'exportWavDesc' | 'exportOggDesc' | 'exportSrtDesc'
}> = [
  { id: 'mp3', iconClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', nameKey: 'exportMP3', descKey: 'exportMp3Desc' },
  { id: 'wav', iconClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', nameKey: 'exportWAV', descKey: 'exportWavDesc' },
  { id: 'ogg', iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', nameKey: 'exportOGG', descKey: 'exportOggDesc' },
  { id: 'srt', iconClass: 'bg-accent-muted text-accent', nameKey: 'exportSRT', descKey: 'exportSrtDesc' },
]

function relativeTime(ts: number) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.floor(hrs / 24)} d ago`
}

export function TtsExportPanel({
  charCount,
  durationSec,
  segments,
  selectedExports,
  onToggleExport,
  history,
  onDownloadHistory,
  onGenerate,
  generating,
  canGenerate,
  t,
}: TtsExportPanelProps) {
  const usagePct = Math.min(100, Math.round((charCount / 500000) * 100))

  return (
    <aside className="flex h-full w-[230px] shrink-0 flex-col border-l border-default bg-surface">
      <div className="border-b border-default px-4 py-3.5">
        <h2 className="text-[13px] font-medium text-primary">{t('ttsStudio.export')}</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {EXPORT_ITEMS.map((item) => {
          const selected = selectedExports.includes(item.id)
          const Icon = item.id === 'srt' ? FileText : FileMusic
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleExport(item.id)}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors hover:bg-subtle"
            >
              <span
                className={[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  item.iconClass,
                ].join(' ')}
              >
                <Icon size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-primary">
                  {t(`ttsStudio.${item.nameKey}`)}
                </span>
                <span className="block text-[11px] text-muted">{t(`ttsStudio.${item.descKey}`)}</span>
              </span>
              {selected && <Check size={14} className="shrink-0 text-accent" />}
            </button>
          )
        })}

        <div className="mt-1 border-t border-default px-4 pt-2">
          <p className="py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
            {t('ttsStudio.recentOutputs')}
          </p>
          {history.length === 0 ? (
            <p className="pb-3 text-xs text-muted">{t('ttsStudio.noHistory')}</p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 border-b border-subtle py-2 last:border-b-0"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-emerald-500 bg-emerald-500/20" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-primary">{entry.name}</span>
                  <span className="block text-[10px] text-muted">
                    {relativeTime(entry.createdAt)} · {formatDuration(entry.durationSec)}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={t('ttsStudio.download')}
                  onClick={() => onDownloadHistory(entry.id)}
                  className="text-muted hover:text-accent"
                >
                  <Download size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-default px-4 py-3">
        <div className="mb-2.5 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-base font-medium text-primary">{charCount}</div>
            <div className="text-[10px] text-muted">{t('ttsStudio.statChars')}</div>
          </div>
          <div>
            <div className="text-base font-medium text-primary">~{formatDuration(durationSec)}</div>
            <div className="text-[10px] text-muted">{t('ttsStudio.statDuration')}</div>
          </div>
          <div>
            <div className="text-base font-medium text-primary">{segments}</div>
            <div className="text-[10px] text-muted">{t('ttsStudio.statSegments')}</div>
          </div>
        </div>

        <Button
          type="primary"
          block
          icon={generating ? <Spin size="small" /> : <Play size={14} />}
          onClick={onGenerate}
          disabled={!canGenerate}
          loading={generating}
          className="font-medium"
        >
          {t('ttsStudio.generateAudio')}
        </Button>

        <div className="mt-2">
          <div className="mb-1 flex justify-between text-[10px] text-muted">
            <span>{t('ttsStudio.monthlyUsage')}</span>
            <span>{charCount.toLocaleString()} / 500K</span>
          </div>
          <div className="h-[3px] rounded bg-subtle">
            <div className="h-full rounded bg-accent" style={{ width: `${usagePct}%` }} />
          </div>
        </div>
      </div>
    </aside>
  )
}
