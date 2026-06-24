'use client'

import { Button, Input, Select } from 'antd'
import { LayoutGrid, LayoutList, Plus, Search } from 'lucide-react'
import { useRef, useState } from 'react'
import { useLocale } from '@vokcg/i18n'
import { CLONE_PROVIDERS } from '@/types/tts'
import { VoiceClonePanel } from './components/voice-clone-panel'
import { StudioListShell } from '@vokcg/ui'

type ViewMode = 'grid' | 'list'

const PROVIDER_OPTIONS = [
  { value: 'all' as const },
  ...CLONE_PROVIDERS.map((p) => ({ value: p.id, label: p.label })),
]

export function VoicePage() {
  const { t } = useLocale()

  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeProvider, setActiveProvider] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [createOpen, setCreateOpen] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300)
  }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        prefix={<Search size={13} className="text-muted" />}
        placeholder={t('voiceStudio.searchPlaceholder')}
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        onClear={() => { setSearchValue(''); setDebouncedSearch('') }}
        allowClear
        style={{ width: 220 }}
        className="rounded-xl text-sm"
      />

      <Select
        value={activeProvider}
        onChange={setActiveProvider}
        options={PROVIDER_OPTIONS.map((f) => ({
          value: f.value,
          label: f.value === 'all' ? t('voiceStudio.filterAll') : f.label,
        }))}
        style={{ width: 164 }}
        className="rounded-xl"
      />

      <div className="flex items-center gap-0.5 rounded-lg border border-default bg-surface p-0.5">
        <button
          type="button"
          onClick={() => setViewMode('grid')}
          className={['flex h-7 w-7 items-center justify-center rounded-md transition-all', viewMode === 'grid' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:bg-default hover:text-primary'].join(' ')}
          title="Grid"
        >
          <LayoutGrid size={14} />
        </button>
        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={['flex h-7 w-7 items-center justify-center rounded-md transition-all', viewMode === 'list' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:bg-default hover:text-primary'].join(' ')}
          title="List"
        >
          <LayoutList size={14} />
        </button>
      </div>

      <Button type="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
        {t('voiceStudio.add')}
      </Button>
    </div>
  )

  return (
    <StudioListShell description={t('voiceStudio.description')} extra={toolbar}>
      <VoiceClonePanel
        viewMode={viewMode}
        activeProvider={activeProvider}
        search={debouncedSearch}
        createOpen={createOpen}
        onCreateOpenChange={setCreateOpen}
      />
    </StudioListShell>
  )
}
