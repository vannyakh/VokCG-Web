'use client'

import { ScriptWriterWorkspace } from './components/script-writer-workspace'

export function ScriptPage() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden p-2 sm:p-3">
      <ScriptWriterWorkspace />
    </div>
  )
}
