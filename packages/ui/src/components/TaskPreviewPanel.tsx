'use client'

import { useState } from 'react'
import { Button, Skeleton, Tag } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Film, Hash, X } from 'lucide-react'
import { useLocale } from '@vokcg/i18n'
import type { Task } from '@vokcg/types'
import { fadeUpItem, panelSlide, staggerContainer } from '../lib/motion'
import { getRenderStatus, getTaskStateMeta, isTaskActive, isTaskDone, isTaskFailed } from '../lib/task-status'
import { formatTaskId, getTaskContentSummary, getTaskFinalVideo, getTaskTerms, getTaskVideos } from '../lib/task-utils'
import { CopyIconButton } from './CopyIconButton'
import { CustomVideoPlayer } from './CustomVideoPlayer'
import { DotGridLoader } from './DotGridLoader'
import { TaskDeleteButton } from './TaskDeleteButton'

const PALETTE_TO_COLOR: Record<string, string> = {
  blue: 'blue',
  green: 'green',
  red: 'red',
  gray: 'default',
}

function StatusDot({ palette }: { palette: string }) {
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    gray: '#94a3b8',
    default: '#94a3b8',
  }
  return (
    <span className="inline-block h-2 w-2 rounded-full" style={{ background: colorMap[palette] ?? colorMap['default'] }} />
  )
}

type SourceSectionProps = {
  icon: React.ElementType
  title: string
  copyText?: string
  copyLabel?: string
  copiedLabel?: string
  children: React.ReactNode
}

function SourceSection({ icon: Icon, title, copyText, copyLabel, copiedLabel, children }: SourceSectionProps) {
  return (
    <motion.div variants={fadeUpItem} className="border-b border-divider px-4 py-3 last:border-b-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border border-divider bg-surface">
            <Icon size={12} className="text-muted" />
          </div>
          <span className="text-xs font-bold text-primary">{title}</span>
        </div>
        {copyText ? <CopyIconButton text={copyText} label={copyLabel} copiedLabel={copiedLabel} size={13} /> : null}
      </div>
      {children}
    </motion.div>
  )
}

type TaskPreviewPanelProps = {
  task: Task | null | undefined
  isLoading: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

export function TaskPreviewPanel({ task, isLoading, onClose, onDelete }: TaskPreviewPanelProps) {
  const { t } = useLocale()

  const videos = task ? getTaskVideos(task) : []
  const done = task ? isTaskDone(task.state) : false
  const summary = task ? getTaskContentSummary(task) : null

  const derivedIndex = task && isTaskDone(task.state) ? videos.length - 1 : 0
  const [trackedTaskId, setTrackedTaskId] = useState(task?.id ?? '')
  const [activeVideoIndex, setActiveVideoIndex] = useState(derivedIndex)

  if (task && trackedTaskId !== task.id) {
    setTrackedTaskId(task.id)
    setActiveVideoIndex(derivedIndex)
  }

  const activeUrl = videos[activeVideoIndex] ?? (task && done ? getTaskFinalVideo(task) : null) ?? videos[0]

  const stateMeta = task ? getTaskStateMeta(task.state) : null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={task?.id ?? 'loading'}
        variants={panelSlide}
        initial="initial"
        animate="animate"
        exit="exit"
        className="tasks-preview-panel-inner h-full"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-divider bg-surface shadow-md">
          {isLoading || !task ? (
            <div className="p-4">
              <div className="flex flex-col gap-3 py-8">
                <Skeleton.Input active style={{ height: 220, width: '100%', display: 'block' }} />
                <Skeleton active paragraph={{ rows: 2 }} title={false} />
              </div>
            </div>
          ) : (
            <>
              <div className="shrink-0 border-b border-divider bg-subtle/60 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-primary" title={summary?.topic}>
                      {summary?.topic ?? task.id}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusDot palette={stateMeta?.palette ?? 'gray'} />
                      <Tag color={PALETTE_TO_COLOR[stateMeta?.palette ?? 'gray'] ?? 'default'}>
                        {stateMeta?.label}
                      </Tag>
                    </div>
                    <div className="flex min-w-0 items-center gap-1">
                      <span className="truncate font-mono text-[11px] text-muted">{task.id}</span>
                      <CopyIconButton
                        text={task.id}
                        label={t('tasks.copyTaskId')}
                        copiedLabel={t('tasks.copied')}
                        size={12}
                        className="h-6 w-6"
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <TaskDeleteButton task={task} onDelete={onDelete} variant="header" />
                    <Button type="text" size="small" icon={<X size={14} />} onClick={onClose} className="rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <motion.div variants={staggerContainer} initial="initial" animate="animate">
                  <motion.div variants={fadeUpItem} className="w-full shrink-0">
                    <div className="tasks-preview-player relative flex w-full items-center justify-center bg-black">
                      {isTaskActive(task.state) && (
                        <div className="absolute inset-0">
                          <DotGridLoader
                            fill
                            hideHud
                            progress={task.progress ?? 0}
                            jobId={formatTaskId(task.id, 8)}
                            status={getRenderStatus(task)}
                          />
                        </div>
                      )}
                      {isTaskDone(task.state) && activeUrl && (
                        <CustomVideoPlayer fill src={activeUrl} objectFit="contain" />
                      )}
                      {isTaskFailed(task.state) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                          <span className="text-sm font-bold text-error">Render failed</span>
                          <span className="text-xs text-muted">Check your API keys and settings, then try again.</span>
                        </div>
                      )}
                      {!isTaskActive(task.state) && !getTaskFinalVideo(task) && !isTaskFailed(task.state) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white/50">No preview available</span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {videos.length > 1 && (
                    <SourceSection icon={Film} title={`Output (${videos.length})`}>
                      <div className="flex flex-wrap gap-1.5">
                        {videos.map((url, i) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => setActiveVideoIndex(i)}
                            className={[
                              'max-w-full truncate rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors',
                              i === activeVideoIndex
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-divider bg-subtle text-secondary hover:border-default',
                            ].join(' ')}
                          >
                            {url.split('/').pop()}
                          </button>
                        ))}
                      </div>
                    </SourceSection>
                  )}

                  <div className="flex flex-col">
                    {task.script && (
                      <SourceSection
                        icon={FileText}
                        title={t('tasks.script')}
                        copyText={task.script}
                        copyLabel={t('tasks.copyScript')}
                        copiedLabel={t('tasks.copied')}
                      >
                        <p className="line-clamp-6 whitespace-pre-wrap text-xs leading-relaxed text-secondary">
                          {task.script}
                        </p>
                      </SourceSection>
                    )}
                    {getTaskTerms(task).length > 0 && (
                      <SourceSection
                        icon={Hash}
                        title={t('tasks.keywords')}
                        copyText={getTaskTerms(task).join(', ')}
                        copyLabel={t('tasks.copyKeywords')}
                        copiedLabel={t('tasks.copied')}
                      >
                        <div className="flex flex-wrap gap-1.5">
                          {getTaskTerms(task).map((term) => (
                            <Tag key={term} color="default" className="text-xs">{term}</Tag>
                          ))}
                        </div>
                      </SourceSection>
                    )}
                    {!task.script && getTaskTerms(task).length === 0 && (
                      <div className="px-4 py-3">
                        <span className="text-xs text-muted">Source details appear as the task progresses.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
