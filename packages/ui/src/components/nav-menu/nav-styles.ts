export const NAV_MENU = {
  marginX: 6,
  itemRadius: 12,
  collapsedPaddingX: 8,
  collapsedTileSize: 42,
} as const

/** Tile shown in icon-only (collapsed) mode */
export function navTileClass(active: boolean) {
  return [
    'flex items-center justify-center rounded-xl transition-all duration-150',
    active
      ? 'text-accent'
      : 'text-nav-inactive group-hover:text-nav-active',
  ].join(' ')
}

/** Full-width button in expanded mode */
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
    return 'group flex w-full select-none items-center justify-center px-1.5'
  }

  return [
    'group relative flex w-full select-none items-center gap-3 text-left transition-colors duration-150',
    isActive
      ? 'text-accent'
      : disabled
        ? 'cursor-not-allowed text-muted/40'
        : 'text-nav-inactive hover:text-nav-active',
  ].join(' ')
}
