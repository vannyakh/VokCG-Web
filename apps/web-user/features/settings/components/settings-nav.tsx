'use client'

import type { LucideIcon } from 'lucide-react'

export type SettingsNavItem = {
  id: string
  label: string
  icon: LucideIcon
  badge?: string
}

export type SettingsNavSection = {
  title: string
  items: SettingsNavItem[]
}

type SettingsNavProps = {
  sections: SettingsNavSection[]
  active: string
  onChange: (id: string) => void
}

export function SettingsNav({ sections, active, onChange }: SettingsNavProps) {
  return (
    <nav
      className="flex shrink-0 flex-col gap-0.5 border-b border-default px-3 py-4 md:w-[220px] md:border-b-0 md:border-r md:px-0 md:py-5"
      aria-label="Settings sections"
    >
      {sections.map((section, index) => (
        <div key={section.title}>
          {index > 0 && <div className="mx-4 my-2 border-t border-default md:mx-5" />}
          <p className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-muted md:px-5">
            {section.title}
          </p>
          {section.items.map((item) => {
            const Icon = item.icon
            const isActive = item.id === active
            return (
              <button
                key={item.id}
                type="button"
                className={[
                  'flex w-full items-center gap-2.5 border-l-2 px-4 py-2.5 text-left text-[15px] md:px-5',
                  isActive
                    ? 'border-accent bg-subtle/70 font-semibold text-accent'
                    : 'border-transparent text-secondary',
                ].join(' ')}
                onClick={() => onChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={17} strokeWidth={1.8} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto rounded-lg bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-500">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
