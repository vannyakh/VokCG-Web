'use client'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Full-bleed canvas without outer inset (Create flow) */
  flush?: boolean
}

/** Workspace tools — Create, Script Writer, TTS Studio */
export function StudioWorkspaceFrame({ children, flush = false }: Props) {
  if (flush) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col">{children}</div>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden p-2 sm:p-3">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-divider bg-surface">
        {children}
      </div>
    </div>
  )
}
