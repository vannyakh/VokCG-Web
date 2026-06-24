type Props = { label: string; compact?: boolean }

export function NavBadge({ label, compact = false }: Props) {
  return (
    <span
      className={[
        'ml-auto shrink-0 rounded-full font-semibold uppercase tracking-wide',
        compact ? 'px-1.5 py-px text-[9px]' : 'px-2 py-0.5 text-[10px]',
      ].join(' ')}
      style={{
        background: 'color-mix(in srgb, #f59e0b 12%, transparent)',
        color: 'color-mix(in srgb, #d97706 88%, var(--text-primary))',
      }}
    >
      {label}
    </span>
  )
}
