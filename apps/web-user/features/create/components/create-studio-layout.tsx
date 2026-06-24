'use client'

import { CreateFlowPanel } from './create-flow-panel'
import { CreateFormCenter } from './create-form-center'
import { CreateStepNav } from './create-step-nav'

export function CreateStudioLayout() {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col" style={{ background: 'var(--bg-canvas)' }}>

      {/* ── Step navigation bar ── */}
      <div
        className="shrink-0"
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          padding: '12px 0 14px',
        }}
      >
        <CreateFormCenter>
          <CreateStepNav variant="pills" interactive={true} />
        </CreateFormCenter>
      </div>

      {/* ── Step content ── */}
      <div className="flex min-h-0 flex-1 flex-col">
        <CreateFlowPanel />
      </div>

    </div>
  )
}
