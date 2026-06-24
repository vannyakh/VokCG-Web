'use client'

type Props = {
  label: string
  active: boolean
  onClick: () => void
}

export function StudioFilterChip({ label, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all duration-200 cursor-pointer active:scale-95 hover:scale-[1.03]',
        active 
          ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_10px_rgba(59,130,246,0.3)] border border-transparent' 
          : 'border border-default bg-surface text-secondary hover:border-[var(--color-primary)]/40 hover:text-primary',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
