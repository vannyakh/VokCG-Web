'use client'

import { ScriptWriterWorkspace } from './components/script-writer-workspace'
import { StudioWorkspaceFrame } from '@vokcg/ui'

export function ScriptPage() {
  return (
    <StudioWorkspaceFrame>
      <ScriptWriterWorkspace />
    </StudioWorkspaceFrame>
  )
}
