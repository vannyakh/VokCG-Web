'use client'

import { TtsWorkspace } from './components/tts-workspace'

export function TtsPage() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden p-2 sm:p-3">
      <TtsWorkspace />
    </div>
  )
}
