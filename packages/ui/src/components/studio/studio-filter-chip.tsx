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
        'rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors',
        active ? 'bg-accent text-white' : 'bg-subtle text-secondary hover:text-primary',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
