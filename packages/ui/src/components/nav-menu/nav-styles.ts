export const NAV_MENU = {
  marginX: 10,
  itemRadius: 12,
  collapsedPaddingX: 10,
  collapsedTileSize: 40,
} as const

export function navTileClass(active: boolean) {
  return [
    'flex items-center justify-center rounded-xl',
    active
      ? 'bg-accent/12 text-accent ring-1 ring-accent/25'
      : 'text-nav-inactive',
  ].join(' ')
}

export function navItemButtonClass({
  collapse,
  inPopup,
  isActive,
  disabled,
}: {
  collapse: boolean
  inPopup: boolean
  isActive: boolean
  disabled: boolean
}) {
  if (collapse && !inPopup) {
    return 'flex w-full select-none items-center justify-center px-2.5'
  }

  return [
    'group relative flex w-full select-none items-center gap-2.5 text-left',
    isActive
      ? 'bg-accent/12 text-accent'
      : disabled
        ? 'cursor-not-allowed opacity-50'
        : 'text-nav-inactive',
  ].join(' ')
}
