'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type SettingsCardTone = 'blue' | 'green' | 'amber' | 'red' | 'purple'

const TONE_CLASS: Record<SettingsCardTone, string> = {
  blue: 'bg-accent/10 text-accent',
  green: 'bg-emerald-500/10 text-emerald-500',
  amber: 'bg-amber-500/10 text-amber-500',
  red: 'bg-red-500/10 text-red-500',
  purple: 'bg-violet-500/10 text-violet-500',
}

type SettingsCardProps = { children: ReactNode; danger?: boolean; className?: string }

export function SettingsCard({ children, danger = false, className = '' }: SettingsCardProps) {
  return (
    <section
      className={['overflow-hidden rounded-[20px] border border-default bg-surface', danger && 'border-red-500/35', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  )
}

type SettingsCardHeaderProps = {
  icon: LucideIcon
  tone?: SettingsCardTone
  title: string
  subtitle?: string
  extra?: ReactNode
}

export function SettingsCardHeader({ icon: Icon, tone = 'blue', title, subtitle, extra }: SettingsCardHeaderProps) {
  return (
    <div className="flex items-center gap-3.5 border-b border-divider px-5 py-5 sm:px-6">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONE_CLASS[tone]}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-primary">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {extra && <div className="ml-auto shrink-0">{extra}</div>}
    </div>
  )
}

type SettingsCardBodyProps = { children: ReactNode; className?: string; flush?: boolean }

export function SettingsCardBody({ children, className = '', flush = false }: SettingsCardBodyProps) {
  return (
    <div className={[flush ? 'px-5 sm:px-6' : 'px-5 py-5 sm:px-6 sm:py-6', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function SettingsCardFooter({ children }: { children: ReactNode }) {
  return <div className="px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
}

export function SettingsToggleRow({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
  return (
    <div className="settings-toggle-row">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-primary">{label}</p>
        {description && <p className="mt-1 max-w-md text-sm text-muted">{description}</p>}
      </div>
      <div className="mt-0.5 shrink-0">{children}</div>
    </div>
  )
}

export function SettingsListRow({ icon, children, action }: { icon?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="settings-list-row">
      {icon ? <div className="settings-list-row__icon">{icon}</div> : null}
      <div className="settings-list-row__body">
        <div className="min-w-0 flex-1">{children}</div>
        {action}
      </div>
    </div>
  )
}

export function SettingsKvRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="settings-kv-row">
      <span className="text-[15px] text-secondary">{label}</span>
      <div className="min-w-0 max-w-[60%] truncate text-right">{value}</div>
    </div>
  )
}

export function SettingsSaveRow({ children, status }: { children: ReactNode; status?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-divider pt-5">
      {children}
      {status}
    </div>
  )
}
