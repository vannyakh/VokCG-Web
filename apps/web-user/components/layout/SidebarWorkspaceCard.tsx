'use client'

import { ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'

import { USER_ROUTES } from '@vokcg/constants'
import type { Workspace } from '@/types/workspace'

const STATUS_COLOR: Record<Workspace['status'], string> = {
  active:    '#22c55e',
  trial:     '#3b82f6',
  suspended: '#ef4444',
}

const STATUS_LABEL: Record<Workspace['status'], string> = {
  active:    'Active',
  trial:     'Trial',
  suspended: 'Suspended',
}

type Props = {
  workspace: Workspace
  isDemo: boolean
}

export function SidebarWorkspaceCard({ workspace, isDemo }: Props) {
  const planName = workspace.plan?.name
  const statusColor = STATUS_COLOR[workspace.status]

  return (
    <Link
      href={USER_ROUTES.billing}
      className="group mx-2 mb-2.5 flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors"
      style={{
        background: 'color-mix(in srgb, var(--bg-surface) 60%, var(--bg-sidebar))',
        border: '1px solid var(--border-default)',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.background =
          'color-mix(in srgb, var(--color-primary) 6%, var(--bg-surface))'
        ;(e.currentTarget as HTMLElement).style.borderColor =
          'color-mix(in srgb, var(--color-primary) 22%, transparent)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background =
          'color-mix(in srgb, var(--bg-surface) 60%, var(--bg-sidebar))'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'
      }}
    >
      {/* Icon */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
          color: 'var(--color-primary)',
        }}
      >
        <Zap size={15} strokeWidth={2.2} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[13px] font-semibold leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {isDemo ? 'Demo workspace' : workspace.name}
        </p>

        <div className="mt-1 flex items-center gap-1.5">
          {/* Status dot */}
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: statusColor }}
            aria-hidden
          />
          {planName ? (
            <span
              className="truncate rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{
                background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              {planName}
            </span>
          ) : (
            <span
              className="text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {STATUS_LABEL[workspace.status]}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight
        size={13}
        className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
        style={{ color: 'var(--text-muted)' }}
        aria-hidden
      />
    </Link>
  )
}
