'use client'

import { CreateFlowPanel } from './create-flow-panel'
import { CreateFormCenter } from './create-form-center'
import { CreateStepNav } from './create-step-nav'

export function CreateStudioLayout() {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-canvas">
      <div className="shrink-0 border-b border-subtle bg-surface/80 py-2 sm:py-2.5">
        <CreateFormCenter>
          <div className="flex flex-col gap-2">
            <CreateStepNav variant="pills" compact centered interactive={false} />
          </div>
        </CreateFormCenter>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CreateFlowPanel />
      </div>
    </div>
  )
}
