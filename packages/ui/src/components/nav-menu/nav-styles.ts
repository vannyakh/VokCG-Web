export const NAV_MENU = {
  marginX: 8,
  itemRadius: 10,
  collapsedPaddingX: 10,
  collapsedTileSize: 38,
} as const

/** Tile shown in icon-only (collapsed) mode — prefer inline styles for active; use this for hover */
export function navTileClass(active: boolean) {
  return [
    'flex items-center justify-center rounded-xl transition-all duration-150',
    active
      ? 'text-accent'
      : 'text-nav-inactive group-hover:bg-active/60 group-hover:text-nav-active',
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
    return 'group flex w-full select-none items-center justify-center px-2'
  }

  return [
    'group relative flex w-full select-none items-center gap-2.5 text-left transition-colors duration-150',
    isActive
      ? 'text-accent'
      : disabled
        ? 'cursor-not-allowed text-muted/40'
        : 'text-nav-inactive hover:text-nav-active',
  ].join(' ')
}
