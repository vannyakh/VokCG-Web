'use client'

import { Button, Input } from 'antd'
import { Plus, X } from 'lucide-react'
import {
  relativeHistoryTime,
  type ScriptHistoryEntry,
  type ScriptTemplateId,
  type SCRIPT_TEMPLATES,
} from '../lib/script-writer-utils'

interface TemplatePanelProps {
  t: (key: string, params?: Record<string, string | number>) => string
  templateSearch: string
  onSearchChange: (v: string) => void
  filteredTemplates: typeof SCRIPT_TEMPLATES
  templateId: ScriptTemplateId
  onSelectTemplate: (id: ScriptTemplateId) => void
  history: ScriptHistoryEntry[]
  onHistorySelect: (entry: ScriptHistoryEntry) => void
  onNewScript: () => void
  onDeleteHistory: (id: string) => void
}

export function TemplatePanel({
  t,
  templateSearch,
  onSearchChange,
  filteredTemplates,
  templateId,
  onSelectTemplate,
  history,
  onHistorySelect,
  onNewScript,
  onDeleteHistory,
}: TemplatePanelProps) {
  return (
    <aside className="hidden w-[224px] shrink-0 flex-col border-r border-default bg-surface lg:flex">
      <div className="px-3.5 py-3.5">
        <h2 className="mb-2.5 text-[13px] font-semibold text-primary">{t('scriptWriter.templates')}</h2>
        <Input
          variant="borderless"
          value={templateSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('scriptWriter.searchTemplates')}
          className="px-0 text-xs shadow-none"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="px-3.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
          {t('scriptWriter.contentType')}
        </p>
        {filteredTemplates.map((item) => {
          const Icon = item.icon
          const active = item.id === templateId
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTemplate(item.id)}
              className={[
                'flex w-full items-center gap-2 border-l-2 px-3.5 py-1.5 text-left transition-colors',
                active ? 'border-accent bg-accent-muted' : 'border-transparent hover:bg-subtle',
              ].join(' ')}
            >
              <span className={['flex h-7 w-7 shrink-0 items-center justify-center rounded-md', item.iconClass].join(' ')}>
                <Icon size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={['block truncate text-xs font-medium', active ? 'text-accent' : 'text-primary'].join(' ')}>
                  {t(`scriptWriter.${item.nameKey}`)}
                </span>
                <span className="block truncate text-[10px] text-muted">{t(`scriptWriter.${item.metaKey}`)}</span>
              </span>
            </button>
          )
        })}
        <p className="mt-2 px-3.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
          {t('scriptWriter.recentScripts')}
        </p>
        {history.length === 0 ? (
          <p className="px-3.5 pb-3 text-xs text-muted">{t('scriptWriter.noHistory')}</p>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="group flex w-full items-center justify-between gap-1.5 px-3.5 py-1 hover:bg-subtle">
              <button
                type="button"
                onClick={() => onHistorySelect(entry)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span className="min-w-0 flex-1 truncate text-xs text-secondary">{entry.title}</span>
                <span className="text-[10px] text-muted shrink-0">{relativeHistoryTime(entry.createdAt)}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteHistory(entry.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-error text-muted transition-opacity duration-200"
                title={t('scriptWriter.deleteHistory')}
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-auto border-t border-default p-3">
        <Button type="primary" block icon={<Plus size={14} />} onClick={onNewScript}>
          {t('scriptWriter.newScript')}
        </Button>
      </div>
    </aside>
  )
}
