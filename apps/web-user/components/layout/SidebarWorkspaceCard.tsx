'use client'

import Link from 'next/link'
import { ChevronRight, CreditCard } from 'lucide-react'

import { USER_ROUTES } from '@vokcg/constants'
import type { Workspace } from '@/types/workspace'

const STATUS_DOT: Record<Workspace['status'], string> = {
  active: 'bg-emerald-500',
  trial: 'bg-blue-500',
  suspended: 'bg-red-500',
}

type Props = {
  workspace: Workspace
  isDemo: boolean
}

export function SidebarWorkspaceCard({ workspace, isDemo }: Props) {
  const subtitle = isDemo ? 'Demo workspace' : workspace.slug

  return (
    <Link
      href={USER_ROUTES.billing}
      className={[
        'mx-3 mb-2.5 flex shrink-0 items-center gap-3 rounded-[16px] border border-divider px-3 py-3',
        'bg-[color-mix(in_srgb,var(--bg-surface)_75%,var(--bg-sidebar))]',
      ].join(' ')}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
        <CreditCard size={17} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold leading-tight text-primary">{workspace.name}</p>
        <div className="mt-1 flex min-w-0 items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[workspace.status]}`}
            aria-hidden
          />
          <p className="truncate text-[11px] leading-none text-muted">
            {subtitle}
            <span className="text-muted/50"> · </span>
            <span className="capitalize">{workspace.status}</span>
          </p>
        </div>
        {workspace.plan ? (
          <span className="mt-1.5 inline-flex max-w-full truncate rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            {workspace.plan.name}
          </span>
        ) : null}
      </div>

      <ChevronRight size={15} className="shrink-0 text-muted/50" aria-hidden />
    </Link>
  )
}
