'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Button, Card, Checkbox, Drawer, Input, Popconfirm, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Download, LayoutGrid, List, ListVideo, RefreshCw, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocale } from '@vokcg/i18n'
import { useTasks, useDeleteTask } from '@vokcg/api'
import { STORAGE_KEYS } from '@vokcg/config'
import { USER_ROUTES } from '@vokcg/constants'
import {
  DotGridLoader,
  Tooltip,
  TaskVideoPoster,
  TaskDeleteButton,
  TaskPreviewPanel,
  Page,
  fadeUpItem,
  panelSlide,
  staggerContainer,
  viewSwitch,
  getRenderStatus,
  getTaskStateMeta,
  isTaskActive,
  isTaskFailed,
  isTaskDone,
  filterTasks,
  formatTaskId,
  getTaskContentSummary,
  getTaskFinalVideo,
  getTaskVideos,
  downloadTaskVideo,
} from '@vokcg/ui'
import type { Task, TaskViewMode } from '@vokcg/types'
import type { TaskStatusFilter } from '@vokcg/ui'
import { useAppMessage } from '@vokcg/ui'
import { useMediaQuery } from '@vokcg/ui'

const VIEW_MODE_KEY = STORAGE_KEYS.tasksViewMode
const XL_MEDIA_QUERY = '(min-width: 80em)'
const GRID_THUMB_ASPECT = '16 / 9' as const
const LIST_THUMB = { width: 128, height: 72 } as const

const STATUS_DOT_COLOR: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  gray: 'bg-slate-300 dark:bg-slate-600',
}

function formatSourceLabel(source: string) {
  if (!source || source === '—') return '—'
  return source.charAt(0).toUpperCase() + source.slice(1)
}

function useViewMode() {
  const [viewMode, setViewMode] = useState<TaskViewMode>(() => {
    if (typeof window === 'undefined') return 'grid'
    const saved = localStorage.getItem(VIEW_MODE_KEY)
    return saved === 'list' ? 'list' : 'grid'
  })
  useEffect(() => { localStorage.setItem(VIEW_MODE_KEY, viewMode) }, [viewMode])
  return [viewMode, setViewMode] as const
}

function TaskGridThumb({ task, selected }: { task: Task; selected: boolean }) {
  const finalVideo = getTaskFinalVideo(task)
  const active = isTaskActive(task.state)
  const failed = isTaskFailed(task.state)
  const renderStatus = getRenderStatus(task)
  const progress = task.progress ?? 0

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: GRID_THUMB_ASPECT }}>
      {finalVideo && !active && <TaskVideoPoster src={finalVideo} objectFit="cover" />}
      {active && (
        <div className="absolute inset-0">
          <DotGridLoader fill compact progress={progress} jobId={formatTaskId(task.id, 8)} status={renderStatus} />
        </div>
      )}
      {failed && !finalVideo && (
        <div className="flex h-full items-center justify-center" style={{ background: 'rgba(127,29,29,0.45)' }}>
          <span className="text-xs font-bold text-red-200">Failed</span>
        </div>
      )}
      {!finalVideo && !active && !failed && (
        <div className="flex h-full items-center justify-center bg-subtle">
          <ListVideo size={28} className="text-slate-400 dark:text-slate-500" />
        </div>
      )}
      {selected && <div className="pointer-events-none absolute inset-0 border-2 border-accent" />}
    </div>
  )
}

function TaskPreviewCell({ task, selected }: { task: Task; selected: boolean }) {
  const finalVideo = getTaskFinalVideo(task)
  const active = isTaskActive(task.state)
  const failed = isTaskFailed(task.state)
  const renderStatus = getRenderStatus(task)

  return (
    <div
      className={['tasks-thumb relative shrink-0', selected ? 'tasks-thumb--selected' : ''].filter(Boolean).join(' ')}
      style={{ width: LIST_THUMB.width, height: LIST_THUMB.height }}
    >
      {active ? (
        <DotGridLoader fill compact progress={task.progress ?? 0} jobId={formatTaskId(task.id, 8)} status={renderStatus} />
      ) : finalVideo ? (
        <TaskVideoPoster src={finalVideo} objectFit="contain" />
      ) : failed ? (
        <div className="flex h-full items-center justify-center bg-red-50 dark:bg-red-950/40">
          <span className="text-[11px] font-medium text-red-500">Failed</span>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center bg-subtle">
          <ListVideo size={18} className="text-muted" />
        </div>
      )}
    </div>
  )
}

function TaskTopicCell({ task }: { task: Task }) {
  const summary = getTaskContentSummary(task)
  return (
    <div className="min-w-0 py-0.5">
      <p className="line-clamp-2 font-medium text-[13px] leading-snug text-primary" title={summary.topic}>{summary.topic}</p>
      {summary.scriptPreview && summary.scriptPreview !== summary.topic && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted" title={task.script}>{summary.scriptPreview}</p>
      )}
    </div>
  )
}

function TaskKeywordsCell({ task }: { task: Task }) {
  const keywords = getTaskContentSummary(task).keywords
  if (keywords.length === 0) return <span className="text-[13px] text-muted">—</span>
  return <p className="line-clamp-2 text-[13px] leading-relaxed text-secondary" title={keywords.join(', ')}>{keywords.join(', ')}</p>
}

function TaskStatusCell({ task }: { task: Task }) {
  const meta = getTaskStateMeta(task.state)
  const active = isTaskActive(task.state)
  const renderStatus = getRenderStatus(task)
  const progress = task.progress ?? 0
  return (
    <div className="flex min-w-[96px] flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_COLOR[meta.palette] ?? STATUS_DOT_COLOR['gray']}`} />
        <span className="text-[13px] font-medium text-primary">{meta.label}</span>
      </div>
      {active && (
        <span className="pl-3.5 text-xs tabular-nums text-muted">{renderStatus.title} · {progress}%</span>
      )}
    </div>
  )
}

function TaskGridCard({ task, selected, checked, onSelect, onToggleCheck, onDelete }: { task: Task; selected: boolean; checked: boolean; onSelect: () => void; onToggleCheck: () => void; onDelete: (id: string) => void }) {
  const summary = getTaskContentSummary(task)
  return (
    <motion.div variants={fadeUpItem}>
      <div
        role="button"
        tabIndex={0}
        title={summary.topic}
        className={['w-full overflow-hidden rounded-xl border bg-surface cursor-pointer transition-colors', selected ? 'border-accent border-2' : checked ? 'border-accent/50' : 'border-default'].join(' ')}
        onClick={onSelect}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
      >
        <div className="relative">
          <TaskGridThumb task={task} selected={selected} />
          <div className="absolute left-2 top-2" onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={checked} onChange={onToggleCheck} />
          </div>
          <div className="absolute right-2 top-2">
            <TaskDeleteButton task={task} onDelete={onDelete} variant="overlay" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Bone({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton-shimmer rounded-lg bg-default/20 ${className}`} style={style} />
}

function GridCardSkeleton({ delay }: { delay: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-default/30 bg-surface" style={{ animationDelay: `${delay}s` }}>
      <Bone className="w-full rounded-none" style={{ aspectRatio: '16/9' }} />
    </div>
  )
}

function GridSkeleton({ cols = 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' }: { cols?: string }) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array.from({ length: 8 }).map((_, i) => <GridCardSkeleton key={i} delay={i * 0.06} />)}
    </div>
  )
}

function ListRowSkeleton({ delay }: { delay: number }) {
  return (
    <div className="flex items-center gap-3 border-b border-subtle px-4 py-3.5 last:border-b-0" style={{ animationDelay: `${delay}s` }}>
      <Bone className="shrink-0 rounded-lg" style={{ width: LIST_THUMB.width, height: LIST_THUMB.height }} />
      <div className="flex min-w-0 flex-[1.4] flex-col gap-1.5">
        <Bone className="h-3.5 w-2/3 rounded-md" />
        <Bone className="h-2.5 w-1/3 rounded-md" />
      </div>
      <Bone className="hidden h-3 w-28 shrink-0 rounded-md md:block" />
      <Bone className="hidden h-3 w-16 shrink-0 rounded-md sm:block" />
      <div className="flex shrink-0 flex-col gap-1">
        <Bone className="h-3 w-20 rounded-md" />
        <Bone className="h-2.5 w-14 rounded-md" />
      </div>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="tasks-table-shell overflow-hidden rounded-xl border border-default bg-surface">
      {Array.from({ length: 6 }).map((_, i) => <ListRowSkeleton key={i} delay={i * 0.06} />)}
    </div>
  )
}

function TasksEmptyState({ t, variant, onClearFilters }: { t: (key: string) => string; variant: 'none' | 'filtered'; onClearFilters?: () => void }) {
  return (
    <Card className="border-default bg-surface">
      <div className="flex flex-col items-center gap-4 py-10">
        <ListVideo size={38} className="text-slate-400 dark:text-slate-500" />
        <div className="max-w-md text-center">
          <p className="font-bold text-primary">{variant === 'filtered' ? t('tasks.noMatches') : t('tasks.noTasks')}</p>
          <p className="mt-1 text-sm text-secondary">{variant === 'filtered' ? t('tasks.noMatchesHint') : t('tasks.noTasksHint')}</p>
        </div>
        {variant === 'filtered' ? (
          <Button size="small" onClick={onClearFilters} className="rounded-lg">{t('tasks.clearFilters')}</Button>
        ) : (
          <Link href={USER_ROUTES.create}>
            <Button type="primary" size="small" className="rounded-lg font-bold">{t('tasks.createVideo')}</Button>
          </Link>
        )}
      </div>
    </Card>
  )
}

export function TasksPage() {
  const { t } = useLocale()
  const message = useAppMessage()
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useViewMode()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all')
  const isXlUp = useMediaQuery(XL_MEDIA_QUERY)
  const pageSize = 12
  const filtersActive = searchQuery.trim().length > 0 || statusFilter !== 'all'
  const fetchPage = filtersActive ? 1 : page
  const fetchPageSize = filtersActive ? 100 : pageSize

  const { data, isLoading, isFetching, refetch } = useTasks(fetchPage, fetchPageSize)
  const deleteMutation = useDeleteTask()
  const totalPages = data ? Math.ceil(data.total / (filtersActive ? fetchPageSize : pageSize)) : 1
  const hasServerTasks = (data?.tasks.length ?? 0) > 0

  const visibleTasks = useMemo(
    () => filterTasks(data?.tasks ?? [], searchQuery, statusFilter),
    [data?.tasks, searchQuery, statusFilter],
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id)
      if (selectedTaskId === id) setSelectedTaskId(null)
      setSelectedTaskIds((prev) => prev.filter((taskId) => taskId !== id))
    },
    [deleteMutation, selectedTaskId],
  )

  const toggleTaskChecked = (taskId: string) => {
    setSelectedTaskIds((prev) => prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId])
  }

  const clearFilters = () => { setSearchQuery(''); setStatusFilter('all'); setPage(1) }

  const handleBulkDelete = async () => {
    const ids = [...selectedTaskIds]
    await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)))
    if (selectedTaskId && ids.includes(selectedTaskId)) setSelectedTaskId(null)
    setSelectedTaskIds([])
    message.success(t('tasks.bulkDeleted', { count: ids.length }))
  }

  const handleBulkDownload = () => {
    const tasks = visibleTasks.filter((task) => selectedTaskIds.includes(task.id))
    let downloaded = 0; let skipped = 0
    for (const task of tasks) {
      if (downloadTaskVideo(task)) downloaded += 1; else skipped += 1
    }
    if (downloaded > 0) message.success(t('tasks.bulkDownloaded', { count: downloaded }))
    if (skipped > 0) message.info(t('tasks.bulkDownloadSkipped', { count: skipped }))
  }

  useEffect(() => {
    setSelectedTaskIds((prev) => prev.filter((id) => visibleTasks.some((task) => task.id === id)))
  }, [visibleTasks])

  const gridCols = selectedTaskId ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'

  const listColumns: ColumnsType<Task> = useMemo(
    () => [
      { title: t('tasks.preview'), key: 'preview', width: 152, render: (_, task) => <TaskPreviewCell task={task} selected={selectedTaskId === task.id} /> },
      { title: t('tasks.topic'), key: 'topic', ellipsis: true, minWidth: 200, render: (_, task) => <TaskTopicCell task={task} /> },
      { title: t('tasks.keywords'), key: 'keywords', width: 180, responsive: ['md'], render: (_, task) => <TaskKeywordsCell task={task} /> },
      { title: t('tasks.source'), key: 'source', width: 100, responsive: ['sm'], render: (_, task) => <span className="text-[13px] text-secondary">{formatSourceLabel(getTaskContentSummary(task).source)}</span> },
      { title: t('tasks.aspect'), key: 'aspect', width: 72, responsive: ['lg'], render: (_, task) => <span className="text-[13px] tabular-nums text-secondary">{getTaskContentSummary(task).aspect}</span> },
      {
        title: (
          <Tooltip content={t('tasks.materialsHint')}>
            <span className="cursor-help border-b border-dotted border-muted">{t('tasks.materials')}</span>
          </Tooltip>
        ),
        key: 'materials', width: 96, align: 'center', responsive: ['lg'],
        render: (_, task) => {
          const count = getTaskContentSummary(task).materialCount
          if (count <= 0) return <span className="text-[13px] text-muted">—</span>
          return (
            <Tooltip content={t('tasks.materialsHint')}>
              <span className="text-[13px] tabular-nums text-secondary">{t('tasks.materialsCount', { count })}</span>
            </Tooltip>
          )
        },
      },
      { title: t('tasks.status'), key: 'status', width: 128, render: (_, task) => <TaskStatusCell task={task} /> },
      { title: '', key: 'actions', width: 48, align: 'center', render: (_, task) => <TaskDeleteButton task={task} onDelete={handleDelete} variant="table" /> },
    ],
    [t, selectedTaskId, handleDelete],
  )

  const rowSelection = useMemo(
    () => ({ selectedRowKeys: selectedTaskIds, onChange: (keys: React.Key[]) => setSelectedTaskIds(keys.map(String)), preserveSelectedRowKeys: true }),
    [selectedTaskIds],
  )

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('tasks.statusAll') },
      { value: 'processing', label: t('tasks.statusProcessing') },
      { value: 'completed', label: t('tasks.statusCompleted') },
      { value: 'failed', label: t('tasks.statusFailed') },
    ],
    [t],
  )

  return (
    <>
      <Page
        width="full"
        title={t('tasks.title')}
        description={t('tasks.description')}
        extra={
          <div className="flex items-center gap-2">
            {isFetching && !isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />}
            <Input allowClear size="small" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }} placeholder={t('tasks.searchPlaceholder')} prefix={<Search size={14} className="text-muted" />} className="w-[220px] rounded-lg sm:w-[260px]" />
            <Select size="small" value={statusFilter} onChange={(value: TaskStatusFilter) => { setStatusFilter(value); setPage(1) }} options={statusOptions} className="min-w-[140px]" />
            <div className="flex gap-0 rounded-lg border border-default bg-subtle p-[3px]">
              <Tooltip content={t('tasks.gridView')}>
                <Button type={viewMode === 'grid' ? 'primary' : 'text'} size="small" icon={<LayoutGrid size={16} />} onClick={() => setViewMode('grid')} style={{ borderRadius: 8 }} />
              </Tooltip>
              <Tooltip content={t('tasks.listView')}>
                <Button type={viewMode === 'list' ? 'primary' : 'text'} size="small" icon={<List size={16} />} onClick={() => setViewMode('list')} style={{ borderRadius: 8 }} />
              </Tooltip>
            </div>
            <Tooltip content={t('tasks.refresh')}>
              <motion.div whileTap={{ rotate: 180 }} transition={{ duration: 0.35 }}>
                <Button size="small" icon={<RefreshCw size={16} />} onClick={() => refetch()} className="rounded-lg" />
              </motion.div>
            </Tooltip>
          </div>
        }
      >
        {selectedTaskIds.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-default bg-surface px-3 py-2">
            <span className="text-sm font-medium text-secondary">{t('tasks.selectedCount', { count: selectedTaskIds.length })}</span>
            <Button size="small" icon={<Download size={14} />} onClick={handleBulkDownload} className="rounded-lg">{t('tasks.bulkDownload')}</Button>
            <Popconfirm title={t('tasks.bulkDeleteConfirmTitle', { count: selectedTaskIds.length })} description={t('tasks.bulkDeleteConfirmDescription')} okText={t('tasks.deleteConfirmOk')} cancelText={t('tasks.deleteConfirmCancel')} okButtonProps={{ danger: true }} onConfirm={() => void handleBulkDelete()}>
              <Button size="small" danger icon={<Trash2 size={14} />} className="rounded-lg">{t('tasks.bulkDelete')}</Button>
            </Popconfirm>
            <Button type="text" size="small" onClick={() => setSelectedTaskIds([])} className="ml-auto rounded-lg">{t('common.cancel')}</Button>
          </div>
        )}

        {filtersActive && hasServerTasks && <p className="mb-3 text-xs text-muted">{t('tasks.searchHint')}</p>}

        <div className="flex w-full flex-col gap-5 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">
            {!isLoading && !hasServerTasks ? (
              <TasksEmptyState t={t} variant="none" />
            ) : !isLoading && visibleTasks.length === 0 ? (
              <TasksEmptyState t={t} variant="filtered" onClearFilters={clearFilters} />
            ) : isLoading ? (
              viewMode === 'grid' ? <GridSkeleton cols={gridCols} /> : <ListSkeleton />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={viewMode} variants={viewSwitch} initial="initial" animate="animate" exit="exit">
                  {viewMode === 'grid' ? (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate">
                      <div className={`grid ${gridCols} gap-4`}>
                        {visibleTasks.map((task) => (
                          <TaskGridCard
                            key={task.id}
                            task={task}
                            selected={selectedTaskId === task.id}
                            checked={selectedTaskIds.includes(task.id)}
                            onSelect={() => setSelectedTaskId(task.id)}
                            onToggleCheck={() => toggleTaskChecked(task.id)}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="tasks-table-shell overflow-hidden rounded-2xl">
                      <Table
                        className="tasks-table"
                        dataSource={visibleTasks}
                        columns={listColumns}
                        rowKey="id"
                        size="middle"
                        pagination={false}
                        tableLayout="fixed"
                        rowSelection={rowSelection}
                        rowClassName={(task) => selectedTaskId === task.id ? 'tasks-row-selected cursor-pointer' : 'cursor-pointer'}
                        onRow={(task) => ({ onClick: () => setSelectedTaskId(task.id) })}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {totalPages > 1 && !filtersActive && (
              <div className="mt-5 flex items-center justify-end gap-2">
                <span className="text-sm font-semibold text-secondary">{t('tasks.page', { current: page, total: totalPages })}</span>
                <Button size="small" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg">‹</Button>
                <Button size="small" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg">›</Button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {selectedTaskId && isXlUp && (
              <motion.div key="preview-panel" className="tasks-preview-panel hidden shrink-0 xl:block" variants={panelSlide} initial="initial" animate="animate" exit="exit">
                <TaskPreviewPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onDelete={handleDelete} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Page>

      <Drawer
        open={!!selectedTaskId && !isXlUp}
        placement="bottom"
        onClose={() => setSelectedTaskId(null)}
        size="88vh"
        styles={{ body: { padding: 0, height: '100%', overflow: 'hidden' }, header: { display: 'none' }, wrapper: { borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: 'hidden' } }}
        className="bg-canvas"
      >
        {selectedTaskId && (
          <TaskPreviewPanel taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onDelete={handleDelete} />
        )}
      </Drawer>
    </>
  )
}
