'use client'

import { Button } from 'antd'
import { relativeHistoryTime, type ScriptVersion } from '../lib/script-writer-utils'

interface VersionsPanelProps {
  t: (key: string, params?: Record<string, string | number>) => string
  versions: ScriptVersion[]
  onRestore: (version: ScriptVersion) => void
}

export function VersionsPanel({ t, versions, onRestore }: VersionsPanelProps) {
  if (versions.length === 0) {
    return <p className="text-sm text-muted">{t('scriptWriter.noVersions')}</p>
  }

  return (
    <div className="space-y-2">
      {versions.map((version, index) => (
        <div
          key={version.id}
          className="flex items-center justify-between rounded-xl border border-default bg-surface px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-primary">
              {t('scriptWriter.versionLabel', { number: versions.length - index })}
            </p>
            <p className="text-xs text-muted">
              {relativeHistoryTime(version.createdAt)} · {version.sections.map((s) => s.name).join(' → ')}
            </p>
          </div>
          <Button size="small" onClick={() => onRestore(version)}>
            {t('scriptWriter.restoreVersion')}
          </Button>
        </div>
      ))}
    </div>
  )
}
