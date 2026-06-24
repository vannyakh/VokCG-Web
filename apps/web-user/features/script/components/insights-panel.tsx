'use client'

import { Button } from 'antd'
import {
  ArrowUp,
  BarChart3,
  Clapperboard,
  FileText,
  Hash,
  Languages,
  List,
  Mic,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import type { ComponentType } from 'react'
import {
  WORD_COUNT_TARGETS,
  type computeQualityScores,
  type ScriptLength,
} from '../lib/script-writer-utils'

interface InsightsPanelProps {
  t: (key: string, params?: Record<string, string | number>) => string
  hasScript: boolean
  wordCount: number
  duration: string
  gradeLevel: number
  clarityScore: number
  quality: ReturnType<typeof computeQualityScores>
  onExportTxt: () => void
  onExportMd: () => void
  onSendToTts: () => void
  onUseInCreate: () => void
  onAiAction: (action: string) => void
  length: ScriptLength
}

export function InsightsPanel({
  t,
  hasScript,
  wordCount,
  duration,
  gradeLevel,
  clarityScore,
  quality,
  onExportTxt,
  onExportMd,
  onSendToTts,
  onUseInCreate,
  onAiAction,
  length,
}: InsightsPanelProps) {
  const target = WORD_COUNT_TARGETS[length] || { min: 300, max: 600 }
  const percent = Math.min(100, Math.round((wordCount / target.max) * 100))
  const isTooShort = wordCount < target.min
  const isTooLong = wordCount > target.max
  const onTarget = wordCount >= target.min && wordCount <= target.max

  const progressColor = onTarget
    ? 'bg-emerald-500 shadow-emerald-500/20'
    : isTooLong
      ? 'bg-amber-500 shadow-amber-500/20'
      : 'bg-accent shadow-accent/20'

  return (
    <aside className="hidden w-[204px] shrink-0 flex-col border-l border-default bg-surface xl:flex">
      <div className="border-b border-default px-3.5 py-3">
        <h3 className="text-xs font-semibold text-secondary">{t('scriptWriter.insights')}</h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-default px-3.5 py-2.5 bg-subtle/10">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {t('scriptWriter.wordCountGoal')}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-secondary">
              <span>{t('scriptWriter.currentProgress')}</span>
              <span className="font-semibold text-primary">
                {wordCount} / {target.max} w
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-subtle overflow-hidden relative shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-300 shadow-sm ${progressColor}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-muted font-medium">
              <span>{t('scriptWriter.targetRange', { min: target.min, max: target.max })}</span>
              {hasScript && (
                <span className={onTarget ? 'text-emerald-500 font-bold' : 'text-accent font-bold'}>
                  {onTarget ? 'On Target' : isTooShort ? 'Too Short' : 'Too Long'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="border-b border-default px-3.5 py-2.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {t('scriptWriter.stats')}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <StatBox value={hasScript ? String(wordCount) : '—'} label={t('scriptWriter.words')} />
            <StatBox value={hasScript ? duration : '—'} label={t('scriptWriter.estDuration')} />
            <StatBox value={hasScript ? String(gradeLevel) : '—'} label={t('scriptWriter.gradeLevel')} />
            <StatBox value={hasScript ? String(clarityScore) : '—'} label={t('scriptWriter.clarityScore')} />
          </div>
        </div>
        {hasScript && (
          <div className="border-b border-default px-3.5 py-2.5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
              {t('scriptWriter.quality')}
            </p>
            <ScoreRow label={t('scriptWriter.engagement')} value={quality.engagement} color="bg-emerald-500" />
            <ScoreRow label={t('scriptWriter.clarity')} value={quality.clarity} color="bg-teal-500" />
            <ScoreRow label={t('scriptWriter.seoFit')} value={quality.seo} color="bg-amber-500" />
            <ScoreRow label={t('scriptWriter.hookStrength')} value={quality.hookStrength} color="bg-emerald-500" />
          </div>
        )}
        <div className="border-b border-default px-3.5 py-2.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
            {t('scriptWriter.aiActions')}
          </p>
          <div className="space-y-0.5">
            <ActionRow icon={RefreshCw} tone="purple" label={t('scriptWriter.actionRewrite')} onClick={() => onAiAction('rewrite')} />
            <ActionRow icon={ArrowUp} tone="teal" label={t('scriptWriter.actionShorter')} onClick={() => onAiAction('shorter')} />
            <ActionRow icon={List} tone="green" label={t('scriptWriter.actionChapters')} onClick={() => onAiAction('chapters')} />
            <ActionRow icon={Hash} tone="amber" label={t('scriptWriter.actionHashtags')} onClick={() => onAiAction('hashtags')} />
            <ActionRow icon={Sparkles} tone="coral" label={t('scriptWriter.actionHook')} onClick={() => onAiAction('hook')} />
            <ActionRow icon={Languages} tone="purple" label={t('scriptWriter.actionTranslate')} onClick={() => onAiAction('translate')} />
          </div>
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-1.5 p-3.5">
        <Button block icon={<Clapperboard size={14} />} onClick={onUseInCreate} disabled={!hasScript}>
          {t('scriptWriter.useInCreate')}
        </Button>
        <Button block icon={<FileText size={14} />} onClick={onExportTxt} disabled={!hasScript}>
          {t('scriptWriter.exportTxt')}
        </Button>
        <Button block icon={<BarChart3 size={14} />} onClick={onExportMd} disabled={!hasScript}>
          {t('scriptWriter.exportMd')}
        </Button>
        <Button type="primary" block icon={<Mic size={14} />} onClick={onSendToTts} disabled={!hasScript}>
          {t('scriptWriter.sendToTtsStudio')}
        </Button>
      </div>
    </aside>
  )
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-subtle px-2 py-2 text-center">
      <div className="text-[15px] font-semibold text-primary">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  )
}

function ScoreRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <span className="w-[68px] shrink-0 text-[11px] text-secondary">{label}</span>
      <div className="h-1 flex-1 rounded bg-subtle">
        <div className={`h-full rounded ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-5 text-right text-[11px] font-medium text-secondary">{value}</span>
    </div>
  )
}

function ActionRow({
  icon: Icon,
  tone,
  label,
  onClick,
}: {
  icon: ComponentType<{ size?: number; className?: string }>
  tone: 'purple' | 'teal' | 'green' | 'amber' | 'coral'
  label: string
  onClick: () => void
}) {
  const toneClass = {
    purple: 'bg-accent-muted text-accent',
    teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
    green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    coral: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg py-1.5 hover:bg-subtle"
    >
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${toneClass}`}>
        <Icon size={13} />
      </span>
      <span className="text-xs text-secondary">{label}</span>
    </button>
  )
}
